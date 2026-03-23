<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索角色名称"
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
          新增角色
        </a-button>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="角色名称" data-index="name" :width="150" />
          <a-table-column title="角色编码" data-index="code" :width="150" />
          <a-table-column title="描述" data-index="description" :width="250" />
          <a-table-column title="用户数" data-index="userCount" :width="100" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handlePermission(record)">权限</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)" :disabled="record.isSystem">编辑</a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)" :disabled="record.isSystem">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="formVisible" :title="isEdit ? '编辑角色' : '新增角色'" :width="500" @ok="handleSave">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item field="name" label="角色名称" :rules="[{ required: true, message: '请输入角色名称' }]">
          <a-input v-model="formData.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item field="code" label="角色编码" :rules="[{ required: true, message: '请输入角色编码' }]">
          <a-input v-model="formData.code" placeholder="请输入角色编码" :disabled="isEdit" />
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="formData.description" placeholder="请输入描述" :max-length="200" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-switch v-model="formData.status" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="permissionVisible" title="配置权限" :width="500" @ok="handleSavePermission">
      <a-tree
        v-model:checked-keys="checkedKeys"
        :data="permissionTree"
        checkable
        :default-expand-all="true"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'

const loading = ref(false)
const formVisible = ref(false)
const permissionVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const checkedKeys = ref<string[]>([])

const tableData = ref([
  {
    id: '1',
    name: '管理员',
    code: 'admin',
    description: '拥有所有权限',
    userCount: 1,
    status: 1,
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    name: '销售',
    code: 'sales',
    description: '负责商品管理和订单处理',
    userCount: 2,
    status: 1,
    isSystem: false,
    createdAt: '2024-01-05 09:00:00',
  },
  {
    id: '3',
    name: '财务',
    code: 'finance',
    description: '负责财务对账和结算',
    userCount: 1,
    status: 1,
    isSystem: false,
    createdAt: '2024-01-10 14:00:00',
  },
  {
    id: '4',
    name: '客服',
    code: 'service',
    description: '负责客户服务和售后处理',
    userCount: 0,
    status: 0,
    isSystem: false,
    createdAt: '2024-02-01 10:00:00',
  },
])

const permissionTree = [
  {
    key: 'product',
    title: '商品管理',
    children: [
      { key: 'product:list', title: '商品列表' },
      { key: 'product:create', title: '新增商品' },
      { key: 'product:edit', title: '编辑商品' },
      { key: 'product:delete', title: '删除商品' },
    ],
  },
  {
    key: 'order',
    title: '订单管理',
    children: [
      { key: 'order:list', title: '订单列表' },
      { key: 'order:detail', title: '订单详情' },
      { key: 'order:export', title: '导出订单' },
    ],
  },
  {
    key: 'finance',
    title: '财务管理',
    children: [
      { key: 'finance:bill', title: '账单管理' },
      { key: 'finance:settle', title: '结算管理' },
    ],
  },
  {
    key: 'system',
    title: '系统管理',
    children: [
      { key: 'system:account', title: '账号管理' },
      { key: 'system:role', title: '角色管理' },
    ],
  },
]

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4,
})

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})

const formData = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  status: 1,
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
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
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    name: '',
    code: '',
    description: '',
    status: 1,
  })
  formVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    code: record.code,
    description: record.description,
    status: record.status,
  })
  formVisible.value = true
}

async function handleSave() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  Message.success('保存成功')
  formVisible.value = false
}

function handlePermission(record: any) {
  checkedKeys.value = ['product:list', 'product:create', 'order:list']
  permissionVisible.value = true
}

function handleSavePermission() {
  Message.success('权限配置成功')
  permissionVisible.value = false
}

function handleDelete(record: any) {
  Modal.confirm({
    title: '删除确认',
    content: `确定要删除角色「${record.name}」吗？`,
    onOk: () => {
      Message.success('删除成功')
    },
  })
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>
