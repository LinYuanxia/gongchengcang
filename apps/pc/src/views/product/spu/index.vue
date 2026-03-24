<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索SPU名称/编码"
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
        </a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增SPU
        </a-button>
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
          <a-table-column title="SPU编码" data-index="spuCode" :width="120" />
          <a-table-column title="SPU名称" data-index="spuName" :width="200" />
          <a-table-column title="所属分类" data-index="categoryName" :width="120" />
          <a-table-column title="计量单位" data-index="unit" :width="80" />
          <a-table-column title="关联属性" :width="200">
            <template #cell="{ record }">
              <a-tag v-for="(name, index) in record.attrNames" :key="index" style="margin: 2px">
                {{ name }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" data-index="skuCount" :width="100" />
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleManageSku(record)">管理SKU</a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import type { Spu, ProductCategory } from '@gongchengcang/types'
import { getSpuList, deleteSpu, getCategoryTree } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tableData = ref<Spu[]>([])
const categoryTree = ref<ProductCategory[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
})

watch(
  () => route.query.categoryId,
  (categoryId) => {
    if (categoryId) {
      searchForm.categoryId = [categoryId as string]
      loadData()
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadCategoryTree()
  if (!route.query.categoryId) {
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

async function loadData() {
  loading.value = true
  try {
    const categoryId = searchForm.categoryId?.[searchForm.categoryId.length - 1]
    const result = await getSpuList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      categoryId,
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
  router.push('/product/spu/add')
}

function handleEdit(record: Spu) {
  router.push(`/product/spu/edit/${record.spuId}`)
}

function handleView(record: Spu) {
  router.push(`/product/spu/view/${record.spuId}`)
}

function handleManageSku(record: Spu) {
  router.push({
    path: '/product/sku',
    query: { spuId: record.spuId, spuName: record.spuName }
  })
}

function handleDelete(record: Spu) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除SPU「${record.spuName}」吗？`,
    onOk: async () => {
      try {
        await deleteSpu(record.spuId)
        Message.success('删除成功')
        loadData()
      } catch (error: any) {
        Message.error(error.message || '删除失败')
      }
    },
  })
}
</script>
