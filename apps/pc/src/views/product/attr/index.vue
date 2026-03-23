<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索属性名称"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option :value="1">启用</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
        </a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增属性
        </a-button>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="属性ID" data-index="attrId" :width="120" />
          <a-table-column title="属性名称" data-index="attrName" :width="150" />
          <a-table-column title="属性类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getAttrTypeColor(record.attrType)">
                {{ getAttrTypeLabel(record.attrType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="可选值" :width="300">
            <template #cell="{ record }">
              <template v-if="record.attrType !== 'input'">
                <a-tag v-for="(value, index) in record.optionValues?.slice(0, 5)" :key="index" style="margin: 2px">
                  {{ value }}
                </a-tag>
                <span v-if="record.optionValues?.length > 5" style="color: var(--color-text-3)">
                  +{{ record.optionValues.length - 5 }}
                </span>
              </template>
              <span v-else style="color: var(--color-text-3)">-</span>
            </template>
          </a-table-column>
          <a-table-column title="排序号" data-index="sortOrder" :width="80" />
          <a-table-column title="使用次数" data-index="usedCount" :width="100" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <AttrFormDrawer
      v-model:visible="formVisible"
      :attr="editingAttr"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { AttrType } from '@gongchengcang/types'
import type { ProductAttr } from '@gongchengcang/types'
import { getAttrList, deleteAttr } from '@gongchengcang/api'
import AttrFormDrawer from './components/AttrFormDrawer.vue'

const loading = ref(false)
const tableData = ref<ProductAttr[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})
const formVisible = ref(false)
const editingAttr = ref<ProductAttr | null>(null)

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const result = await getAttrList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
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
  editingAttr.value = null
  formVisible.value = true
}

function handleEdit(record: ProductAttr) {
  editingAttr.value = record
  formVisible.value = true
}

function handleDelete(record: ProductAttr) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除属性「${record.attrName}」吗？`,
    onOk: async () => {
      try {
        await deleteAttr(record.attrId)
        Message.success('删除成功')
        loadData()
      } catch (error: any) {
        Message.error(error.message || '删除失败')
      }
    },
  })
}

function handleFormSuccess() {
  loadData()
}

function getAttrTypeLabel(type: AttrType) {
  const map: Record<AttrType, string> = {
    [AttrType.SINGLE]: '单选',
    [AttrType.MULTI]: '多选',
    [AttrType.INPUT]: '输入',
  }
  return map[type] || type
}

function getAttrTypeColor(type: AttrType) {
  const map: Record<AttrType, string> = {
    [AttrType.SINGLE]: 'blue',
    [AttrType.MULTI]: 'green',
    [AttrType.INPUT]: 'orange',
  }
  return map[type] || 'gray'
}
</script>
