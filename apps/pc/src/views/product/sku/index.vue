<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span v-if="spuFilter">SKU列表 - {{ spuFilter.spuName }}</span>
        <span v-else>SKU列表</span>
      </template>
      <template #extra>
        <a-space>
          <a-button v-if="spuFilter" type="text" @click="clearSpuFilter">
            <template #icon><icon-close /></template>
            清除筛选
          </a-button>
          <a-button type="primary" @click="openAddSkuModal">
            <template #icon><icon-plus /></template>
            新增SKU
          </a-button>
        </a-space>
      </template>
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索SKU名称/编码"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 200px"
            allow-clear
            :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          />
          <a-select
            v-model="searchForm.spuId"
            :options="spuSelectOptions"
            placeholder="所属SPU"
            style="width: 200px"
            allow-search
            allow-clear
          />
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="主图" :width="80">
            <template #cell="{ record }">
              <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
            </template>
          </a-table-column>
          <a-table-column title="SKU编码" data-index="skuCode" :width="150" />
          <a-table-column title="SKU名称" data-index="skuName" :width="200" />
          <a-table-column title="所属SPU" data-index="spuName" :width="150" />
          <a-table-column title="所属分类" data-index="categoryName" :width="100" />
          <a-table-column title="规格" :width="200">
            <template #cell="{ record }">
              <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                <a-tag size="small">{{ key }}: {{ value }}</a-tag>
              </span>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" />
          <a-table-column title="供货价" :width="100">
            <template #cell="{ record }">
              <span v-if="record.supplyPrice">¥{{ record.supplyPrice.toFixed(2) }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="销售价" :width="100">
            <template #cell="{ record }">
              <span v-if="record.salePrice">¥{{ record.salePrice.toFixed(2) }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.status === 'on_shelf'"
                :checked-value="true"
                :unchecked-value="false"
                size="small"
                @change="handleStatusChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleDelete(record)">
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新增SKU弹窗 -->
    <a-modal v-model:visible="addSkuModalVisible" title="新增SKU" :width="700" @ok="handleAddSkuConfirm" @cancel="addSkuModalVisible = false">
      <a-form :model="addSkuForm" layout="vertical">
        <a-form-item label="所属SPU" :rules="[{ required: true, message: '请选择所属SPU' }]">
          <a-select
            v-model="addSkuForm.spuId"
            :options="spuSelectOptions"
            placeholder="请选择所属SPU"
            allow-search
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="主图">
          <a-upload
            list-type="picture-card"
            :file-list="addSkuMainImageList"
            :limit="1"
            accept="image/*"
            :auto-upload="false"
            @change="handleAddSkuMainImageChange"
          >
            <template #upload-button>
              <div class="upload-btn">
                <icon-plus />
                <div class="upload-text">上传主图</div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="SKU编码">
              <a-input v-model="addSkuForm.skuCode" placeholder="系统自动生成或手动输入" :maxlength="50" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
              <a-input v-model="addSkuForm.skuName" placeholder="SKU名称" :maxlength="200" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="SKU规格信息">
          <a-textarea v-model="addSkuForm.specInfo" placeholder="请输入规格信息，如：红色、XL、纯棉 等" :max-length="200" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
          <div class="form-tip">提示：多个规格用顿号、空格或换行分隔，系统会自动解析为规格键值</div>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="供货价" :rules="[{ required: true, message: '请输入供货价' }]">
              <a-input-number
                v-model="addSkuForm.supplyPrice"
                placeholder="供货价"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="销售价" :rules="[{ required: true, message: '请输入销售价' }]">
              <a-input-number
                v-model="addSkuForm.salePrice"
                placeholder="销售价"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import type { Sku, ProductCategory, Spu } from '@gongchengcang/types'
import { getSkuList, getCategoryTree, getSpuList, updateSku, deleteSku } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tableData = ref<Sku[]>([])
const categoryTree = ref<ProductCategory[]>([])
const spuList = ref<Spu[]>([])
const spuFilter = ref<{ spuId: string; spuName: string } | null>(null)

const spuSelectOptions = computed(() => {
  return spuList.value.map(spu => ({
    value: spu.spuId,
    label: spu.spuName
  }))
})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  spuId: undefined as string | undefined,
})
watch(
  () => route.query,
  (query) => {
    if (query.spuId && query.spuName) {
      spuFilter.value = {
        spuId: query.spuId as string,
        spuName: query.spuName as string,
      }
      searchForm.spuId = query.spuId as string
    }
    if (query.categoryId) {
      searchForm.categoryId = [query.categoryId as string]
    }
    loadData()
  },
  { immediate: true }
)

watch(
  () => searchForm.spuId,
  () => {
    handleSearch()
  }
)

onMounted(() => {
  loadCategoryTree()
  loadSpuList()
  if (!route.query.spuId && !route.query.categoryId) {
    loadData()
  }
})

async function loadCategoryTree() {
  try {
    categoryTree.value = await getCategoryTree()
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

async function loadSpuList() {
  try {
    const result = await getSpuList({ page: 1, pageSize: 100 })
    spuList.value = result.list
  } catch (error) {
    console.error('加载SPU列表失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const categoryId = searchForm.categoryId?.[searchForm.categoryId.length - 1]
    const result = await getSkuList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      categoryId,
      spuId: searchForm.spuId,
    })
    tableData.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleView(record: Sku) {
  router.push(`/product/sku/view/${record.skuId}`)
}

function handleEdit(record: Sku) {
  router.push(`/product/sku/edit/${record.skuId}`)
}

function handleStatusChange(record: Sku) {
  const newStatus = (record.status as unknown as string) === 'on_shelf' ? 'off_shelf' : 'on_shelf'
  const action = newStatus === 'on_shelf' ? '上架' : '下架'
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}该SKU吗？`,
    onOk: async () => {
      try {
        await updateSku(record.skuId, { status: newStatus as any })
        Message.success(`${action}成功`)
        loadData()
      } catch (error: any) {
        Message.error(error.message || `${action}失败`)
      }
    },
  })
}

const addSkuModalVisible = ref(false)
const addSkuMainImageList = ref<any[]>([])
const addSkuForm = ref({
  spuId: '',
  skuCode: '',
  skuName: '',
  specInfo: '',
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})

function openAddSkuModal() {
  addSkuForm.value = {
    spuId: spuFilter?.value?.spuId || '',
    skuCode: '',
    skuName: '',
    specInfo: '',
    supplyPrice: undefined,
    salePrice: undefined,
  }
  addSkuMainImageList.value = []
  addSkuModalVisible.value = true
}

function handleAddSkuMainImageChange(fileList: any[]) {
  addSkuMainImageList.value = fileList
}

function parseSpecInfo(specInfo: string): Record<string, string> {
  if (!specInfo.trim()) {
    return { 规格: '标准款' }
  }
  
  const specs: Record<string, string> = {}
  const items = specInfo.split(/[、，,\s\n]+/).filter(s => s.trim())
  
  items.forEach((item, index) => {
    if (item.includes(':')) {
      const [key, value] = item.split(':')
      specs[key.trim()] = value.trim()
    } else if (item.includes('：')) {
      const [key, value] = item.split('：')
      specs[key.trim()] = value.trim()
    } else {
      specs[`规格${index + 1}`] = item.trim()
    }
  })
  
  return specs
}

async function handleAddSkuConfirm() {
  if (!addSkuForm.value.spuId) {
    Message.warning('请选择所属SPU')
    return
  }
  if (!addSkuForm.value.skuName) {
    Message.warning('请输入SKU名称')
    return
  }
  if (!addSkuForm.value.supplyPrice) {
    Message.warning('请输入供货价')
    return
  }
  if (!addSkuForm.value.salePrice) {
    Message.warning('请输入销售价')
    return
  }

  const selectedSpu = spuList.value.find(s => s.spuId === addSkuForm.value.spuId)
  const specs = parseSpecInfo(addSkuForm.value.specInfo)
  
  const mainImage = addSkuMainImageList.value[0]?.url || addSkuMainImageList.value[0]?.response || selectedSpu?.mainImage || ''

  const newSku = {
    skuId: 'SKU' + Date.now(),
    spuId: addSkuForm.value.spuId,
    spuName: selectedSpu?.spuName || '',
    skuCode: addSkuForm.value.skuCode || ('SKU' + Date.now()),
    skuName: addSkuForm.value.skuName,
    categoryId: selectedSpu?.categoryId,
    categoryName: selectedSpu?.categoryName,
    mainImage,
    specs,
    unit: selectedSpu?.unit || '个',
    supplyPrice: addSkuForm.value.supplyPrice,
    salePrice: addSkuForm.value.salePrice,
    stock: 0,
    status: 'on_shelf' as const,
    source: 'manual',
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  }

  tableData.value.unshift(newSku as unknown as Sku)
  pagination.total += 1
  addSkuModalVisible.value = false
  Message.success('SKU新增成功')
}

function handleDelete(record: Sku) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该SKU吗？删除后将无法恢复。',
    onOk: async () => {
      try {
        await deleteSku(record.skuId)
        Message.success('删除成功')
        loadData()
      } catch (error: any) {
        Message.error(error.message || '删除失败')
      }
    },
  })
}

function clearSpuFilter() {
  spuFilter.value = null
  searchForm.spuId = undefined
  pagination.current = 1
  loadData()
}
</script>

<style scoped>
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: #86909c;
}

.upload-text {
  font-size: 12px;
  margin-top: 4px;
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}
</style>
