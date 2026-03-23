<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/SKU"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 200px"
            allow-clear
          />
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option v-for="item in PRODUCT_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增商品
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="商品图片" :width="80">
            <template #cell="{ record }">
              <a-image :src="record.images?.[0]" :width="48" :height="48" fit="cover" />
            </template>
          </a-table-column>
          <a-table-column title="SKU" data-index="sku" :width="120" />
          <a-table-column title="商品名称" data-index="name" :width="200" />
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="PRODUCT_STATUS_MAP[record.status]?.color">
                {{ PRODUCT_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="250" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handlePrice(record)">定价</a-button>
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
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { PRODUCT_STATUS_OPTIONS, PRODUCT_STATUS_MAP } from '@gongchengcang/constants'
import type { Product } from '@gongchengcang/types'

const loading = ref(false)
const tableData = ref<Product[]>([])
const categoryTree = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  status: undefined as number | undefined,
})

onMounted(() => {
  loadCategoryTree()
  loadData()
})

async function loadCategoryTree() {
  categoryTree.value = [
    {
      label: '建筑材料',
      value: '1',
      children: [
        { label: '水泥', value: '1-1' },
        { label: '砂石', value: '1-2' },
        { label: '钢材', value: '1-3' },
      ],
    },
    {
      label: '装饰材料',
      value: '2',
      children: [
        { label: '瓷砖', value: '2-1' },
        { label: '涂料', value: '2-2' },
      ],
    },
  ]
}

async function loadData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: '1',
        sku: 'SKU001',
        name: 'P.O 42.5 普通硅酸盐水泥',
        categoryId: '1-1',
        categoryName: '水泥',
        spec: '50kg/袋',
        unit: '吨',
        images: ['https://via.placeholder.com/48'],
        status: 2,
        merchantId: '1',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 10:30:00',
      },
      {
        id: '2',
        sku: 'SKU002',
        name: 'HRB400E 螺纹钢',
        categoryId: '1-3',
        categoryName: '钢材',
        spec: 'Φ16',
        unit: '吨',
        images: ['https://via.placeholder.com/48'],
        status: 2,
        merchantId: '1',
        createdAt: '2024-01-16 14:20:00',
        updatedAt: '2024-01-16 14:20:00',
      },
    ]
    pagination.total = 2
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
  Message.info('新增商品')
}

function handleView(record: Product) {
  Message.info(`查看商品: ${record.name}`)
}

function handleEdit(record: Product) {
  Message.info(`编辑商品: ${record.name}`)
}

function handlePrice(record: Product) {
  Message.info(`商品定价: ${record.name}`)
}

function handleDelete(record: Product) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除商品「${record.name}」吗？`,
    onOk: () => {
      Message.success('删除成功')
      loadData()
    },
  })
}
</script>
