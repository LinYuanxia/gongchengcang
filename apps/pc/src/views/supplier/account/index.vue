<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索姓名/账号/手机号"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.department" placeholder="部门" style="width: 140px" allow-clear>
            <a-option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</a-option>
          </a-select>
          <a-select v-model="searchForm.role" placeholder="角色" style="width: 140px" allow-clear>
            <a-option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option :value="1">启用</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增员工
          </a-button>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </div>

      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="员工ID" data-index="id" :width="100" />
          <a-table-column title="姓名" :width="100">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.realName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="账号" data-index="username" :width="130" />
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="部门" data-index="department" :width="100" />
          <a-table-column title="职位" data-index="position" :width="100" />
          <a-table-column title="角色" :width="150">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="role in record.roles" :key="role" color="arcoblue" size="small">{{ role }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="最后登录" data-index="lastLoginTime" :width="160" />
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="220" fixed="right">
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
                <a-popconfirm v-if="!record.isAdmin" content="确定要删除该员工吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="formVisible" :title="isEdit ? '编辑员工' : '新增员工'" :width="550" @ok="handleSave">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="username" label="账号" :rules="[{ required: true, message: '请输入账号' }]">
              <a-input v-model="formData.username" placeholder="请输入账号" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-if="!isEdit" field="password" label="初始密码" :rules="[{ required: true, message: '请输入密码' }]">
              <a-input-password v-model="formData.password" placeholder="请输入密码" />
            </a-form-item>
            <a-form-item v-else label="密码">
              <a-button type="text" @click="handleResetPwd(formData)">重置密码</a-button>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="realName" label="姓名" :rules="[{ required: true, message: '请输入姓名' }]">
              <a-input v-model="formData.realName" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="phone" label="手机号" :rules="[{ required: true, message: '请输入手机号' }]">
              <a-input v-model="formData.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="department" label="部门">
              <a-select v-model="formData.department" placeholder="请选择部门" allow-clear>
                <a-option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="position" label="职位">
              <a-input v-model="formData.position" placeholder="请输入职位" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="roleIds" label="角色" :rules="[{ required: true, message: '请选择角色' }]">
          <a-select v-model="formData.roleIds" placeholder="请选择角色" multiple>
            <a-option v-for="item in roleList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="email" label="邮箱">
          <a-input v-model="formData.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-switch v-model="formData.status" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:visible="detailVisible"
      title="员工详情"
      :width="450"
      :footer="false"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="员工ID">{{ currentEmployee.id }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentEmployee.realName }}</a-descriptions-item>
        <a-descriptions-item label="账号">{{ currentEmployee.username }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentEmployee.phone }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ currentEmployee.email || '-' }}</a-descriptions-item>
        <a-descriptions-item label="部门">{{ currentEmployee.department || '-' }}</a-descriptions-item>
        <a-descriptions-item label="职位">{{ currentEmployee.position || '-' }}</a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-space wrap>
            <a-tag v-for="role in currentEmployee.roles" :key="role" color="arcoblue">{{ role }}</a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentEmployee.status === 1 ? 'green' : 'red'">
            {{ currentEmployee.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="最后登录">{{ currentEmployee.lastLoginTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentEmployee.createdAt }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentEmployee = ref<any>({})

const departmentOptions = ['管理部', '销售部', '财务部', '客服部', '物流部']
const roleOptions = ['管理员', '销售', '财务', '客服', '物流']

const roleList = ref([
  { id: '1', name: '管理员' },
  { id: '2', name: '销售' },
  { id: '3', name: '财务' },
  { id: '4', name: '客服' },
  { id: '5', name: '物流' },
])

const searchForm = reactive({
  keyword: '',
  department: undefined as string | undefined,
  role: undefined as string | undefined,
  status: undefined as number | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
})

const formData = ref({
  id: '',
  username: '',
  realName: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  roleIds: [] as string[],
  password: '',
  status: 1,
})

const allTableData = ref([
  {
    id: 'EMP001',
    username: 'baosteel_admin',
    realName: '张经理',
    phone: '138-0000-0001',
    email: 'zhang@baosteel.com',
    department: '管理部',
    position: '区域经理',
    roles: ['管理员'],
    roleIds: ['1'],
    status: 1,
    isAdmin: true,
    lastLoginTime: '2024-03-26 10:30:00',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 'EMP002',
    username: 'baosteel_sale',
    realName: '李销售',
    phone: '138-0000-0002',
    email: 'li@baosteel.com',
    department: '销售部',
    position: '销售代表',
    roles: ['销售'],
    roleIds: ['2'],
    status: 1,
    isAdmin: false,
    lastLoginTime: '2024-03-25 15:20:00',
    createdAt: '2024-01-05 09:00:00',
  },
  {
    id: 'EMP003',
    username: 'baosteel_finance',
    realName: '王财务',
    phone: '138-0000-0003',
    email: 'wang@baosteel.com',
    department: '财务部',
    position: '财务主管',
    roles: ['财务'],
    roleIds: ['3'],
    status: 1,
    isAdmin: false,
    lastLoginTime: '2024-03-26 09:00:00',
    createdAt: '2024-01-10 14:00:00',
  },
  {
    id: 'EMP004',
    username: 'baosteel_service',
    realName: '赵客服',
    phone: '138-0000-0004',
    email: 'zhao@baosteel.com',
    department: '客服部',
    position: '客服专员',
    roles: ['客服'],
    roleIds: ['4'],
    status: 1,
    isAdmin: false,
    lastLoginTime: '2024-03-26 11:00:00',
    createdAt: '2024-01-15 10:00:00',
  },
  {
    id: 'EMP005',
    username: 'baosteel_logistics',
    realName: '钱物流',
    phone: '138-0000-0005',
    email: 'qian@baosteel.com',
    department: '物流部',
    position: '物流专员',
    roles: ['物流'],
    roleIds: ['5'],
    status: 0,
    isAdmin: false,
    lastLoginTime: '2024-03-10 16:00:00',
    createdAt: '2024-01-20 10:00:00',
  },
])

const tableData = ref([...allTableData.value])

function handleSearch() {
  let filtered = [...allTableData.value]
  
  if (searchForm.keyword) {
    filtered = filtered.filter(item =>
      item.realName.includes(searchForm.keyword) ||
      item.username.includes(searchForm.keyword) ||
      item.phone.includes(searchForm.keyword)
    )
  }
  
  if (searchForm.department) {
    filtered = filtered.filter(item => item.department === searchForm.department)
  }
  
  if (searchForm.role) {
    filtered = filtered.filter(item => item.roles.includes(searchForm.role!))
  }
  
  if (searchForm.status !== undefined) {
    filtered = filtered.filter(item => item.status === searchForm.status)
  }
  
  tableData.value = filtered
  pagination.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleAdd() {
  isEdit.value = false
  formData.value = {
    id: '',
    username: '',
    realName: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    roleIds: [],
    password: '',
    status: 1,
  }
  formVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  formData.value = { ...record, password: '' }
  formVisible.value = true
}

function handleView(record: any) {
  currentEmployee.value = record
  detailVisible.value = true
}

function handleSave() {
  Message.success(isEdit.value ? '编辑成功' : '新增成功')
  formVisible.value = false
}

function handleResetPwd(record: any) {
  Message.success(`已重置 ${record.realName} 的密码，新密码已发送至其手机`)
}

function handleToggleStatus(record: any) {
  record.status = record.status === 1 ? 0 : 1
  Message.success(`${record.realName} 已${record.status === 1 ? '启用' : '禁用'}`)
}

function handleDelete(record: any) {
  const index = allTableData.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    allTableData.value.splice(index, 1)
    tableData.value = [...allTableData.value]
  }
  Message.success('删除成功')
}

function handleExport() {
  if (tableData.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${tableData.value.length} 条员工记录`)
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
