<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索账号/姓名"
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
          新增账号
        </a-button>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="账号" data-index="username" :width="150" />
          <a-table-column title="姓名" data-index="realName" :width="120" />
          <a-table-column title="手机号" data-index="phone" :width="140" />
          <a-table-column title="角色" :width="150">
            <template #cell="{ record }">
              <a-tag v-for="role in record.roles" :key="role" style="margin: 2px">{{ role }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="最后登录" data-index="lastLoginTime" :width="180" />
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleResetPwd(record)">重置密码</a-button>
                <a-button
                  type="text"
                  size="small"
                  :status="record.status === 1 ? 'warning' : 'success'"
                  @click="handleToggleStatus(record)"
                >
                  {{ record.status === 1 ? '禁用' : '启用' }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="formVisible" :title="isEdit ? '编辑账号' : '新增账号'" :width="500" @ok="handleSave">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item field="username" label="账号" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model="formData.username" placeholder="请输入账号" :disabled="isEdit" />
        </a-form-item>
        <a-form-item v-if="!isEdit" field="password" label="密码" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item field="realName" label="姓名" :rules="[{ required: true, message: '请输入姓名' }]">
          <a-input v-model="formData.realName" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item field="phone" label="手机号" :rules="[{ required: true, message: '请输入手机号' }]">
          <a-input v-model="formData.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item field="roleIds" label="角色" :rules="[{ required: true, message: '请选择角色' }]">
          <a-select v-model="formData.roleIds" placeholder="请选择角色" multiple>
            <a-option v-for="item in roleList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-switch v-model="formData.status" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'

const loading = ref(false)
const formVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const tableData = ref([
  {
    id: '1',
    username: 'baosteel_admin',
    realName: '张经理',
    phone: '138-0000-0001',
    roles: ['管理员'],
    status: 1,
    lastLoginTime: '2024-03-22 10:30:00',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    username: 'baosteel_sale',
    realName: '李销售',
    phone: '138-0000-0002',
    roles: ['销售'],
    status: 1,
    lastLoginTime: '2024-03-21 15:20:00',
    createdAt: '2024-01-05 09:00:00',
  },
  {
    id: '3',
    username: 'baosteel_finance',
    realName: '王财务',
    phone: '138-0000-0003',
    roles: ['财务'],
    status: 0,
    lastLoginTime: '2024-03-10 09:00:00',
    createdAt: '2024-01-10 14:00:00',
  },
])

const roleList = ref([
  { id: '1', name: '管理员' },
  { id: '2', name: '销售' },
  { id: '3', name: '财务' },
  { id: '4', name: '客服' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3,
})

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})

const formData = reactive({
  id: '',
  username: '',
  password: '',
  realName: '',
  phone: '',
  roleIds: [] as string[],
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
    username: '',
    password: '',
    realName: '',
    phone: '',
    roleIds: [],
    status: 1,
  })
  formVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    username: record.username,
    realName: record.realName,
    phone: record.phone,
    roleIds: ['1'],
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

function handleResetPwd(record: any) {
  Modal.confirm({
    title: '重置密码',
    content: `确定要重置账号「${record.username}」的密码吗？`,
    onOk: () => {
      Message.success('密码已重置为: 123456')
    },
  })
}

function handleToggleStatus(record: any) {
  const action = record.status === 1 ? '禁用' : '启用'
  Modal.confirm({
    title: `${action}确认`,
    content: `确定要${action}账号「${record.username}」吗？`,
    onOk: () => {
      record.status = record.status === 1 ? 0 : 1
      Message.success(`${action}成功`)
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
