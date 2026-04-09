<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索员工姓名/手机号/工号"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.department" placeholder="部门" style="width: 140px" allow-clear>
            <a-option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</a-option>
          </a-select>
          <a-select v-model="searchForm.position" placeholder="职位" style="width: 140px" allow-clear>
            <a-option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</a-option>
          </a-select>
          <a-select v-model="searchForm.workStatus" placeholder="在职状态" style="width: 120px" allow-clear>
            <a-option value="on_job">在职</a-option>
            <a-option value="dimission">已离职</a-option>
            <a-option value="vacation">休假中</a-option>
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
          <a-table-column title="工号" data-index="staffNo" :width="100" />
          <a-table-column title="姓名" :width="100">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.realName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="性别" :width="80">
            <template #cell="{ record }">
              {{ record.gender === 'male' ? '男' : '女' }}
            </template>
          </a-table-column>
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="部门" data-index="department" :width="100" />
          <a-table-column title="职位" data-index="position" :width="100" />
          <a-table-column title="直属上级" data-index="managerName" :width="100" />
          <a-table-column title="入职日期" data-index="joinDate" :width="120" />
          <a-table-column title="在职状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="getWorkStatusColor(record.workStatus)">
                {{ getWorkStatusText(record.workStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm
                  v-if="record.workStatus === 'on_job'"
                  content="确定要将该员工标记为离职吗？"
                  @ok="handleDimission(record)"
                >
                  <a-button type="text" size="small" status="danger">离职</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="formVisible" :title="isEdit ? '编辑员工' : '新增员工'" :width="600" @ok="handleSave">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="realName" label="姓名" :rules="[{ required: true, message: '请输入姓名' }]">
              <a-input v-model="formData.realName" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="gender" label="性别" :rules="[{ required: true, message: '请选择性别' }]">
              <a-radio-group v-model="formData.gender">
                <a-radio value="male">男</a-radio>
                <a-radio value="female">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="phone" label="手机号" :rules="[{ required: true, message: '请输入手机号' }]">
              <a-input v-model="formData.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="email" label="邮箱">
              <a-input v-model="formData.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="department" label="部门" :rules="[{ required: true, message: '请选择部门' }]">
              <a-select v-model="formData.department" placeholder="请选择部门" allow-clear>
                <a-option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="position" label="职位" :rules="[{ required: true, message: '请选择职位' }]">
              <a-select v-model="formData.position" placeholder="请选择职位" allow-clear>
                <a-option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="managerId" label="直属上级">
              <a-select v-model="formData.managerId" placeholder="请选择直属上级" allow-clear show-search>
                <a-option v-for="item in managerOptions" :key="item.id" :value="item.id">{{ item.realName }} - {{ item.position }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="joinDate" label="入职日期">
              <a-date-picker v-model="formData.joinDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="workStatus" label="在职状态">
          <a-radio-group v-model="formData.workStatus">
            <a-radio value="on_job">在职</a-radio>
            <a-radio value="vacation">休假中</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="formData.remark" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:visible="detailVisible"
      title="员工详情"
      :width="500"
      :footer="false"
    >
      <template v-if="currentStaff.id">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="工号">{{ currentStaff.staffNo }}</a-descriptions-item>
          <a-descriptions-item label="姓名">{{ currentStaff.realName }}</a-descriptions-item>
          <a-descriptions-item label="性别">{{ currentStaff.gender === 'male' ? '男' : '女' }}</a-descriptions-item>
          <a-descriptions-item label="手机号">{{ currentStaff.phone }}</a-descriptions-item>
          <a-descriptions-item label="邮箱">{{ currentStaff.email || '-' }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ currentStaff.department }}</a-descriptions-item>
          <a-descriptions-item label="职位">{{ currentStaff.position }}</a-descriptions-item>
          <a-descriptions-item label="直属上级">{{ currentStaff.managerName || '-' }}</a-descriptions-item>
          <a-descriptions-item label="入职日期">{{ currentStaff.joinDate }}</a-descriptions-item>
          <a-descriptions-item label="在职状态">
            <a-tag :color="getWorkStatusColor(currentStaff.workStatus)">
              {{ getWorkStatusText(currentStaff.workStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="离职日期">{{ currentStaff.dimissionDate || '-' }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentStaff.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="备注" v-if="currentStaff.remark">{{ currentStaff.remark }}</a-descriptions-item>
        </a-descriptions>
      </template>
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
const currentStaff = ref<any>({})

const searchForm = reactive({
  keyword: '',
  department: undefined as string | undefined,
  position: undefined as string | undefined,
  workStatus: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const departmentOptions = ref(['管理部', '销售部', '采购部', '财务部', '仓储部', '物流部'])
const positionOptions = ref(['经理', '主管', '专员', '助理', '员工'])

const managerOptions = ref([
  { id: '1', realName: '李总', position: '总经理' },
  { id: '2', realName: '王经理', position: '销售经理' },
  { id: '3', realName: '张主管', position: '采购主管' },
])

const allTableData = ref([
  {
    id: '1',
    staffNo: 'S001',
    realName: '李建国',
    gender: 'male',
    phone: '13800138001',
    email: 'lijg@supplier.com',
    department: '管理部',
    position: '总经理',
    managerId: '',
    managerName: '',
    joinDate: '2023-01-15',
    workStatus: 'on_job',
    dimissionDate: '',
    remark: '',
    createdAt: '2023-01-15 10:00:00',
  },
  {
    id: '2',
    staffNo: 'S002',
    realName: '王芳',
    gender: 'female',
    phone: '13800138002',
    email: 'wangf@supplier.com',
    department: '销售部',
    position: '销售经理',
    managerId: '1',
    managerName: '李建国',
    joinDate: '2023-03-01',
    workStatus: 'on_job',
    dimissionDate: '',
    remark: '',
    createdAt: '2023-03-01 10:00:00',
  },
  {
    id: '3',
    staffNo: 'S003',
    realName: '张伟',
    gender: 'male',
    phone: '13800138003',
    email: 'zhangw@supplier.com',
    department: '采购部',
    position: '采购主管',
    managerId: '1',
    managerName: '李建国',
    joinDate: '2023-04-10',
    workStatus: 'on_job',
    dimissionDate: '',
    remark: '',
    createdAt: '2023-04-10 10:00:00',
  },
  {
    id: '4',
    staffNo: 'S004',
    realName: '刘强',
    gender: 'male',
    phone: '13800138004',
    email: 'liuq@supplier.com',
    department: '仓储部',
    position: '主管',
    managerId: '1',
    managerName: '李建国',
    joinDate: '2023-05-20',
    workStatus: 'vacation',
    dimissionDate: '',
    remark: '年假',
    createdAt: '2023-05-20 10:00:00',
  },
  {
    id: '5',
    staffNo: 'S005',
    realName: '陈明',
    gender: 'male',
    phone: '13800138005',
    email: 'chenm@supplier.com',
    department: '物流部',
    position: '专员',
    managerId: '2',
    managerName: '王芳',
    joinDate: '2023-06-15',
    workStatus: 'dimission',
    dimissionDate: '2024-01-20',
    remark: '个人原因离职',
    createdAt: '2023-06-15 10:00:00',
  },
])

const tableData = ref([...allTableData.value])
pagination.total = allTableData.value.length

const formData = reactive({
  realName: '',
  gender: 'male',
  phone: '',
  email: '',
  department: '',
  position: '',
  managerId: '',
  joinDate: '',
  workStatus: 'on_job',
  remark: '',
})

function getWorkStatusColor(status: string) {
  const colors: Record<string, string> = {
    on_job: 'green',
    vacation: 'orange',
    dimission: 'red',
  }
  return colors[status] || 'gray'
}

function getWorkStatusText(status: string) {
  const texts: Record<string, string> = {
    on_job: '在职',
    vacation: '休假中',
    dimission: '已离职',
  }
  return texts[status] || status
}

function handleSearch() {
  let filtered = [...allTableData.value]
  
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    filtered = filtered.filter(item => 
      item.realName.toLowerCase().includes(keyword) ||
      item.phone.includes(keyword) ||
      item.staffNo.toLowerCase().includes(keyword)
    )
  }
  
  if (searchForm.department) {
    filtered = filtered.filter(item => item.department === searchForm.department)
  }
  
  if (searchForm.position) {
    filtered = filtered.filter(item => item.position === searchForm.position)
  }
  
  if (searchForm.workStatus) {
    filtered = filtered.filter(item => item.workStatus === searchForm.workStatus)
  }
  
  tableData.value = filtered
  pagination.total = filtered.length
  Message.success('搜索完成')
}

function handleAdd() {
  isEdit.value = false
  Object.assign(formData, {
    realName: '',
    gender: 'male',
    phone: '',
    email: '',
    department: '',
    position: '',
    managerId: '',
    joinDate: '',
    workStatus: 'on_job',
    remark: '',
  })
  formVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  Object.assign(formData, {
    realName: record.realName,
    gender: record.gender,
    phone: record.phone,
    email: record.email,
    department: record.department,
    position: record.position,
    managerId: record.managerId,
    joinDate: record.joinDate,
    workStatus: record.workStatus,
    remark: record.remark,
  })
  formVisible.value = true
}

function handleSave() {
  if (!formData.realName || !formData.phone || !formData.department || !formData.position) {
    Message.warning('请填写必填字段')
    return
  }

  if (isEdit.value) {
    Message.success('员工信息更新成功')
  } else {
    const newStaff = {
      id: String(Date.now()),
      staffNo: `S${String(allTableData.value.length + 1).padStart(3, '0')}`,
      ...formData,
      managerName: managerOptions.value.find(m => m.id === formData.managerId)?.realName || '',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
    allTableData.value.unshift(newStaff)
    tableData.value = [...allTableData.value]
    pagination.total = allTableData.value.length
    Message.success('员工添加成功')
  }
  
  formVisible.value = false
}

function handleView(record: any) {
  currentStaff.value = record
  detailVisible.value = true
}

function handleDimission(record: any) {
  record.workStatus = 'dimission'
  record.dimissionDate = new Date().toISOString().slice(0, 10)
  Message.success('已标记为离职')
}

function handleExport() {
  Message.success('导出成功')
}

function handlePageChange(page: number) {
  pagination.current = page
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
