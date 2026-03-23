<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span v-if="spuFilter">SKU列表 - {{ spuFilter.spuName }}</span>
        <span v-else>SKU列表</span>
      </template>
      <template #extra>
        <a-button v-if="spuFilter" type="text" @click="clearSpuFilter">
          <template #icon><icon-close /></template>
          清除筛选
        </a-button>
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
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option v-for="item in SKU_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button
            :disabled="selectedKeys.length === 0"
            status="success"
            @click="handleBatchOnShelf"
          >
            批量上架
          </a-button>
          <a-button
            :disabled="selectedKeys.length === 0"
            status="warning"
            @click="handleBatchOffShelf"
          >
            批量下架
          </a-button>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增SKU
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
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
          <a-table-column title="供应商数" data-index="supplierCount" :width="80" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === SkuStatus.ON_SHELF ? 'green' : 'red'">
                {{ record.status === SkuStatus.ON_SHELF ? '上架' : '下架' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button
                  type="text"
                  size="small"
                  :status="record.status === SkuStatus.ON_SHELF ? 'warning' : 'success'"
                  @click="handleToggleStatus(record)"
                >
                  {{ record.status === SkuStatus.ON_SHELF ? '下架' : '上架' }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <SkuFormDrawer
      v-model:visible="formVisible"
      :sku="editingSku"
      :spu-list="spuList"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { SkuStatus, SKU_STATUS_OPTIONS } from '@gongchengcang/types'
import type { Sku, ProductCategory, Spu } from '@gongchengcang/types'
import { getSkuList, batchUpdateSkuStatus, getCategoryTree, getSpuList } from '@gongchengcang/api'
import SkuFormDrawer from './components/SkuFormDrawer.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tableData = ref<Sku[]>([])
const categoryTree = ref<ProductCategory[]>([])
const spuList = ref<Spu[]>([])
const spuFilter = ref<{ spuId: string; spuName: string } | null>(null)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  status: undefined as number | undefined,
  spuId: undefined as string | undefined,
})
const formVisible = ref(false)
const editingSku = ref<Sku | null>(null)
const selectedKeys = ref<string[]>([])

const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  },
}))

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
      status: searchForm.status,
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

function handleAdd() {
  editingSku.value = null
  formVisible.value = true
}

function handleView(record: Sku) {
  router.push(`/product/sku/view/${record.skuId}`)
}

function handleEdit(record: Sku) {
  editingSku.value = record
  formVisible.value = true
}

async function handleToggleStatus(record: Sku) {
  const newStatus = record.status === SkuStatus.ON_SHELF ? SkuStatus.OFF_SHELF : SkuStatus.ON_SHELF
  const action = newStatus === SkuStatus.ON_SHELF ? '上架' : '下架'
  
  Modal.confirm({
    title: '确认操作',
    content: `确定要${action}SKU「${record.skuName}」吗？`,
    onOk: async () => {
      try {
        await batchUpdateSkuStatus([record.skuId], newStatus)
        Message.success(`${action}成功`)
        loadData()
      } catch (error: any) {
        Message.error(error.message || `${action}失败`)
      }
    },
  })
}

function handleBatchOnShelf() {
  Modal.confirm({
    title: '确认操作',
    content: `确定要批量上架 ${selectedKeys.value.length} 个SKU吗？`,
    onOk: async () => {
      try {
        await batchUpdateSkuStatus(selectedKeys.value, SkuStatus.ON_SHELF)
        Message.success('批量上架成功')
        selectedKeys.value = []
        loadData()
      } catch (error: any) {
        Message.error(error.message || '批量上架失败')
      }
    },
  })
}

function handleBatchOffShelf() {
  Modal.confirm({
    title: '确认操作',
    content: `确定要批量下架 ${selectedKeys.value.length} 个SKU吗？`,
    onOk: async () => {
      try {
        await batchUpdateSkuStatus(selectedKeys.value, SkuStatus.OFF_SHELF)
        Message.success('批量下架成功')
        selectedKeys.value = []
        loadData()
      } catch (error: any) {
        Message.error(error.message || '批量下架失败')
      }
    },
  })
}

function handleFormSuccess() {
  loadData()
}

function clearSpuFilter() {
  spuFilter.value = null
  searchForm.spuId = undefined
  pagination.current = 1
  loadData()
}
</script>
