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
                @change="(checked) => handleStatusChange(record, checked)"
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

    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
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

function handleStatusChange(record: Sku, checked: boolean) {
  const newStatus = checked ? 'on_shelf' : 'off_shelf'
  const action = checked ? '上架' : '下架'
  Message.confirm({
    title: `确认${action}`,
    content: `确定要${action}该SKU吗？`,
    onOk: async () => {
      try {
        await updateSku(record.skuId, { status: newStatus })
        Message.success(`${action}成功`)
        loadData()
      } catch (error: any) {
        Message.error(error.message || `${action}失败`)
      }
    },
  })
}

function handleDelete(record: Sku) {
  Message.confirm({
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
