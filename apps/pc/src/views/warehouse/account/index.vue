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
            <a-option value="active">启用</a-option>
            <a-option value="inactive">禁用</a-option>
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
              <a-link @click="handleView(record)">{{ record.name }}</a-link>
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
          <a-table-column title="所属仓库" data-index="warehouse" :width="140" />
          <a-table-column title="状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="最后登录" data-index="lastLogin" :width="160" />
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleResetPassword(record)">重置密码</a-button>
                <a-popconfirm :content="`确定要${record.status === 'active' ? '禁用' : '启用'}该账号吗？`" @ok="handleToggleStatus(record)">
                  <a-button type="text" size="small" :status="record.status === 'active' ? 'warning' : 'success'">
                    {{ record.status === 'active' ? '禁用' : '启用' }}
                  </a-button>
                </a-popconfirm>
                <a-popconfirm v-if="!record.isAdmin" content="确定要删除该员工吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑员工' : '新增员工'" :width="550" @ok="handleSubmit">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="username" label="账号" :rules="[{ required: true, message: '请输入账号' }]">
              <a-input v-model="form.username" placeholder="请输入账号" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-if="!isEdit" field="password" label="初始密码" :rules="[{ required: true, message: '请输入初始密码' }]">
              <a-input-password v-model="form.password" placeholder="请输入初始密码" />
            </a-form-item>
            <a-form-item v-else label="密码">
              <a-button type="text" @click="handleResetPassword(form)">重置密码</a-button>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="姓名" :rules="[{ required: true, message: '请输入姓名' }]">
              <a-input v-model="form.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="phone" label="手机号" :rules="[{ required: true, message: '请输入手机号' }]">
              <a-input v-model="form.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="department" label="部门">
              <a-select v-model="form.department" placeholder="请选择部门" allow-clear>
                <a-option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="position" label="职位">
              <a-input v-model="form.position" placeholder="请输入职位" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="roles" label="角色" :rules="[{ required: true, message: '请选择角色' }]">
          <a-select v-model="form.roles" placeholder="请选择角色" multiple>
            <a-option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="warehouse" label="所属仓库">
          <a-select v-model="form.warehouse" placeholder="请选择仓库" allow-clear>
            <a-option v-for="wh in warehouseOptions" :key="wh" :value="wh">{{ wh }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="email" label="邮箱">
          <a-input v-model="form.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-switch v-model="form.status" checked-value="active" unchecked-value="inactive">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </a-switch>
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
        <a-descriptions-item label="姓名">{{ currentEmployee.name }}</a-descriptions-item>
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
        <a-descriptions-item label="所属仓库">{{ currentEmployee.warehouse || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentEmployee.status === 'active' ? 'green' : 'red'">
            {{ currentEmployee.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="最后登录">{{ currentEmployee.lastLogin || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentEmployee.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const modalVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentEmployee = ref<any>({})

const departmentOptions = ['管理部', '仓储部', '采购部', '销售部', '财务部', '客服部']
const roleOptions = ['管理员', '仓管员', '采购员', '销售员', '财务员', '客服']
const warehouseOptions = ['深圳湾科技园主仓', '福田CBD分仓', '宝安机场分仓']

const searchForm = reactive({
  keyword: '',
  department: undefined as string | undefined,
  role: undefined as string | undefined,
  status: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 20,
})

const form = ref({
  id: '',
  username: '',
  name: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  roles: [] as string[],
  warehouse: '',
  password: '',
  status: 'active' as 'active' | 'inactive',
})

const allAccounts = ref([
  { id: 'EMP001', username: 'admin', name: '王仓管', phone: '13800138000', email: 'wang@wh.com', department: '管理部', position: '仓库主管', roles: ['管理员'], warehouse: '深圳湾科技园主仓', status: 'active', isAdmin: true, lastLogin: '2024-03-26 09:30:00', createTime: '2024-01-01 10:00:00' },
  { id: 'EMP002', username: 'warehouse01', name: '张三', phone: '13800138001', email: 'zhang@wh.com', department: '仓储部', position: '仓管员', roles: ['仓管员'], warehouse: '深圳湾科技园主仓', status: 'active', isAdmin: false, lastLogin: '2024-03-26 08:00:00', createTime: '2024-01-02 10:00:00' },
  { id: 'EMP003', username: 'purchase01', name: '李四', phone: '13800138002', email: 'li@wh.com', department: '采购部', position: '采购专员', roles: ['采购员'], warehouse: '', status: 'active', isAdmin: false, lastLogin: '2024-03-25 17:30:00', createTime: '2024-01-03 10:00:00' },
  { id: 'EMP004', username: 'sale01', name: '赵五', phone: '13800138003', email: 'zhao@wh.com', department: '销售部', position: '销售专员', roles: ['销售员'], warehouse: '', status: 'active', isAdmin: false, lastLogin: '2024-03-26 10:00:00', createTime: '2024-01-04 10:00:00' },
  { id: 'EMP005', username: 'finance01', name: '钱六', phone: '13800138004', email: 'qian@wh.com', department: '财务部', position: '财务专员', roles: ['财务员'], warehouse: '', status: 'inactive', isAdmin: false, lastLogin: '2024-03-10 14:00:00', createTime: '2024-01-05 10:00:00' },
  { id: 'EMP006', username: 'service01', name: '孙七', phone: '13800138005', email: 'sun@wh.com', department: '客服部', position: '客服专员', roles: ['客服'], warehouse: '', status: 'active', isAdmin: false, lastLogin: '2024-03-26 11:00:00', createTime: '2024-01-06 10:00:00' },
])

const tableData = ref([...allAccounts.value])

function handleSearch() {
  let filtered = [...allAccounts.value]
  
  if (searchForm.keyword) {
    filtered = filtered.filter(item =>
      item.name.includes(searchForm.keyword) ||
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
  
  if (searchForm.status) {
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
  form.value = {
    id: '',
    username: '',
    name: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    roles: [],
    warehouse: '',
    password: '',
    status: 'active',
  }
  modalVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  form.value = { ...record, password: '' }
  modalVisible.value = true
}

function handleView(record: any) {
  currentEmployee.value = record
  detailVisible.value = true
}

function handleSubmit() {
  Message.success(isEdit.value ? '编辑成功' : '新增成功')
  modalVisible.value = false
}

function handleResetPassword(record: any) {
  Message.success(`已重置 ${record.name} 的密码，新密码已发送至其手机`)
}

function handleToggleStatus(record: any) {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  Message.success(`${record.name} 已${record.status === 'active' ? '启用' : '禁用'}`)
}

function handleDelete(record: any) {
  const index = allAccounts.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    allAccounts.value.splice(index, 1)
    tableData.value = [...allAccounts.value]
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
