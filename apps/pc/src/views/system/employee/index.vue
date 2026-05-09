<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索员工姓名/手机号/账号"
            style="width: 260px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.tenantType" placeholder="商户类型" style="width: 140px" allow-clear>
            <a-option value="construction">施工方</a-option>
            <a-option value="warehouse">工程仓</a-option>
            <a-option value="supplier">供应商</a-option>
          </a-select>
          <a-select 
            v-model="searchForm.tenantId" 
            placeholder="所属商户" 
            style="width: 200px" 
            allow-clear 
            show-search
            :filter-option="filterTenantOption"
          >
            <a-option v-for="item in filteredTenantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option :value="1">启用</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
        </a-space>
        <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              添加员工
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
          <a-table-column title="员工ID" data-index="id" :width="120" />
          <a-table-column title="姓名" :width="100">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.realName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="商户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.tenantType === 'warehouse' ? 'blue' : record.tenantType === 'construction' ? 'orange' : 'green'">
                {{ record.tenantType === 'warehouse' ? '工程仓' : record.tenantType === 'construction' ? '施工方' : '供应商' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="所属商户" :width="150">
            <template #cell="{ record }">
              {{ record.tenantName }}
            </template>
          </a-table-column>
          <a-table-column title="业务服务类型" :width="130">
            <template #cell="{ record }">
              <a-tag color="arcoblue" size="small">{{ record.serviceTypeName || '服务商' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="员工类型" :width="130">
            <template #cell="{ record }">
              <a-tag :color="record.staffTypeName === '业务系统管理者' ? 'red' : 'purple'" size="small">
                {{ record.staffTypeName || '普通员工' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="职级" :width="100">
            <template #cell="{ record }">
              {{ record.positionLevel || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      v-model:visible="detailVisible"
      title="员工详情"
      :width="500"
      :footer="false"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="员工ID">{{ currentEmployee.id }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentEmployee.realName }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentEmployee.phone }}</a-descriptions-item>
        <a-descriptions-item label="商户类型">
          <a-tag :color="currentEmployee.tenantType === 'warehouse' ? 'blue' : currentEmployee.tenantType === 'construction' ? 'orange' : 'green'">
            {{ currentEmployee.tenantType === 'warehouse' ? '工程仓' : currentEmployee.tenantType === 'construction' ? '施工方' : '供应商' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="所属商户">{{ currentEmployee.tenantName }}</a-descriptions-item>
        <a-descriptions-item label="证件类型">{{ currentEmployee.idCardType === 'idCard' ? '身份证' : currentEmployee.idCardType === 'passport' ? '护照' : currentEmployee.idCardType || '-' }}</a-descriptions-item>
        <a-descriptions-item label="证件号码">{{ currentEmployee.idCardNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="业务服务类型">
          <a-tag color="arcoblue" size="small">{{ currentEmployee.serviceTypeName || '服务商' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="员工类型">
          <a-tag :color="currentEmployee.staffTypeName === '业务系统管理者' ? 'red' : 'purple'" size="small">
            {{ currentEmployee.staffTypeName || '普通员工' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="职级类别">{{ currentEmployee.positionCategory === 'management' ? '管理岗' : currentEmployee.positionCategory === 'professional' ? '专业岗' : currentEmployee.positionCategory === 'operational' ? '操作岗' : currentEmployee.positionCategory || '-' }}</a-descriptions-item>
        <a-descriptions-item label="职级">{{ currentEmployee.positionLevel || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentEmployee.status === 1 ? 'green' : 'red'">
            {{ currentEmployee.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="备注">{{ currentEmployee.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentEmployee.createdAt }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <a-drawer
      v-model:visible="addVisible"
      title="添加员工"
      :width="500"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="商户类型" required>
          <a-select v-model="addForm.tenantType" placeholder="请选择商户类型">
            <a-option value="construction">施工方</a-option>
            <a-option value="warehouse">工程仓</a-option>
            <a-option value="supplier">供应商</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="所属商户" required>
          <a-select 
            v-model="addForm.tenantId" 
            placeholder="请选择所属商户" 
            :disabled="!addForm.tenantType"
            show-search
            :filter-option="filterAddTenantOption"
          >
            <a-option v-for="item in filteredAddTenantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="姓名" required>
          <a-input v-model="addForm.realName" placeholder="请输入姓名" />
        </a-form-item>
        
        <a-form-item label="证件类型">
          <a-select v-model="addForm.idCardType" placeholder="请选择证件类型">
            <a-option value="idCard">身份证</a-option>
            <a-option value="passport">护照</a-option>
            <a-option value="other">其他</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="证件号码">
          <a-input v-model="addForm.idCardNo" placeholder="请输入证件号码" />
        </a-form-item>
        
        <a-form-item label="员工所属业务服务类型">
          <a-select v-model="addForm.serviceType" placeholder="请选择业务服务类型">
            <a-option value="serviceProvider">服务商</a-option>
            <a-option value="constructionParty">施工方</a-option>
            <a-option value="warehouse">工程仓</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="员工类型">
          <a-select v-model="addForm.staffType" placeholder="请选择员工类型">
            <a-option value="normal">普通员工</a-option>
            <a-option value="manager">业务系统管理者</a-option>
            <a-option value="admin">管理员</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="手机号码" required>
          <a-input v-model="addForm.phone" placeholder="请输入手机号码" />
        </a-form-item>
        
        <a-form-item label="职级类别">
          <a-select v-model="addForm.positionCategory" placeholder="请选择职级类别">
            <a-option value="management">管理岗</a-option>
            <a-option value="professional">专业岗</a-option>
            <a-option value="operational">操作岗</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="职级">
          <a-select v-model="addForm.positionLevel" placeholder="请选择职级">
            <a-option value="P1">P1</a-option>
            <a-option value="P2">P2</a-option>
            <a-option value="P3">P3</a-option>
            <a-option value="M1">M1</a-option>
            <a-option value="M2">M2</a-option>
            <a-option value="M3">M3</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea v-model="addForm.remark" placeholder="请输入备注信息" :rows="3" />
        </a-form-item>
      </a-form>
      
      <template #footer>
        <a-space>
          <a-button @click="addVisible = false">取消</a-button>
          <a-button type="primary" @click="handleSubmit">确认添加</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)
const detailVisible = ref(false)
const addVisible = ref(false)
const currentEmployee = ref<any>({})

const searchForm = reactive({
  keyword: '',
  tenantType: undefined as string | undefined,
  tenantId: undefined as string | undefined,
  status: undefined as number | undefined,
})

const addForm = reactive({
  tenantType: '',
  tenantId: '',
  realName: '',
  idCardType: '',
  idCardNo: '',
  serviceType: 'serviceProvider',
  staffType: 'normal',
  phone: '',
  positionCategory: '',
  positionLevel: '',
  remark: '',
})

const addTenantOptions = ref([
  { value: 'c001', label: '中建一局', type: 'construction' },
  { value: 'c002', label: '中铁建设', type: 'construction' },
  { value: 'c003', label: '上海建工', type: 'construction' },
  { value: 'w001', label: '华东工程仓', type: 'warehouse' },
  { value: 'w002', label: '南京工程仓', type: 'warehouse' },
  { value: 'w003', label: '苏州工程仓', type: 'warehouse' },
  { value: 's001', label: '宝钢集团', type: 'supplier' },
  { value: 's002', label: '沙钢集团', type: 'supplier' },
  { value: 's003', label: '马钢集团', type: 'supplier' },
])

const filteredAddTenantOptions = computed(() => {
  if (!addForm.tenantType) return []
  
  const typeMap: Record<string, string> = {
    construction: 'construction',
    warehouse: 'warehouse',
    supplier: 'supplier',
  }
  
  return addTenantOptions.value.filter(t => t.type === typeMap[addForm.tenantType])
})

function filterAddTenantOption(inputValue: string, option: any) {
  return option.label.toLowerCase().includes(inputValue.toLowerCase())
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const tenantOptions = ref([
  { value: 'c001', label: '中建一局', type: 'construction' },
  { value: 'c002', label: '中铁建设', type: 'construction' },
  { value: 'c003', label: '上海建工', type: 'construction' },
  { value: 'w001', label: '华东工程仓', type: 'warehouse' },
  { value: 'w002', label: '南京工程仓', type: 'warehouse' },
  { value: 'w003', label: '苏州工程仓', type: 'warehouse' },
  { value: 's001', label: '宝钢集团', type: 'supplier' },
  { value: 's002', label: '沙钢集团', type: 'supplier' },
  { value: 's003', label: '马钢集团', type: 'supplier' },
])

const filteredTenantOptions = computed(() => {
  if (!searchForm.tenantType) return tenantOptions.value
  return tenantOptions.value.filter(t => t.type === searchForm.tenantType)
})

function filterTenantOption(inputValue: string, option: any) {
  return option.label.toLowerCase().includes(inputValue.toLowerCase())
}

const allTableData = ref([
  {
    id: 'EMP001',
    realName: '王总',
    phone: '13800138000',
    tenantType: 'construction',
    tenantId: 'c001',
    tenantName: '中建一局',
    serviceType: 'serviceProvider',
    serviceTypeName: '服务商',
    staffType: 'manager',
    staffTypeName: '业务系统管理者',
    positionCategory: 'management',
    positionLevel: 'M3',
    status: 1,
    lastLoginTime: '2024-03-26 09:30:00',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 'EMP002',
    realName: '张工',
    phone: '13800138001',
    tenantType: 'construction',
    tenantId: 'c001',
    tenantName: '中建一局',
    serviceType: 'serviceProvider',
    serviceTypeName: '服务商',
    staffType: 'normal',
    staffTypeName: '普通员工',
    positionCategory: 'professional',
    positionLevel: 'P2',
    status: 1,
    lastLoginTime: '2024-03-26 08:00:00',
    createdAt: '2024-01-02 10:00:00',
  },
  {
    id: 'EMP003',
    realName: '李仓管',
    phone: '13800138002',
    tenantType: 'warehouse',
    tenantId: 'w001',
    tenantName: '华东工程仓',
    serviceType: 'warehouse',
    serviceTypeName: '工程仓',
    staffType: 'normal',
    staffTypeName: '普通员工',
    positionCategory: 'operational',
    positionLevel: 'P1',
    status: 1,
    lastLoginTime: '2024-03-25 17:30:00',
    createdAt: '2024-01-03 10:00:00',
  },
  {
    id: 'EMP004',
    realName: '赵经理',
    phone: '13800138003',
    tenantType: 'warehouse',
    tenantId: 'w001',
    tenantName: '华东工程仓',
    serviceType: 'warehouse',
    serviceTypeName: '工程仓',
    staffType: 'manager',
    staffTypeName: '业务系统管理者',
    positionCategory: 'management',
    positionLevel: 'M2',
    status: 1,
    lastLoginTime: '2024-03-26 10:00:00',
    createdAt: '2024-01-04 10:00:00',
  },
  {
    id: 'EMP005',
    realName: '钱总',
    phone: '13900139000',
    tenantType: 'supplier',
    tenantId: 's001',
    tenantName: '宝钢集团',
    serviceType: 'serviceProvider',
    serviceTypeName: '服务商',
    staffType: 'manager',
    staffTypeName: '业务系统管理者',
    positionCategory: 'management',
    positionLevel: 'M3',
    status: 1,
    lastLoginTime: '2024-03-26 08:30:00',
    createdAt: '2024-01-05 10:00:00',
  },
  {
    id: 'EMP006',
    realName: '孙销售',
    phone: '13900139001',
    tenantType: 'supplier',
    tenantId: 's001',
    tenantName: '宝钢集团',
    serviceType: 'serviceProvider',
    serviceTypeName: '服务商',
    staffType: 'normal',
    staffTypeName: '普通员工',
    positionCategory: 'professional',
    positionLevel: 'P2',
    status: 1,
    lastLoginTime: '2024-03-25 16:00:00',
    createdAt: '2024-01-06 10:00:00',
  },
])

const tableData = ref([...allTableData.value])

function handleSearch() {
  let filtered = [...allTableData.value]
  
  if (searchForm.keyword) {
    filtered = filtered.filter(item =>
      item.realName.includes(searchForm.keyword) ||
      item.phone.includes(searchForm.keyword)
    )
  }
  
  if (searchForm.tenantType) {
    filtered = filtered.filter(item => item.tenantType === searchForm.tenantType)
  }
  
  if (searchForm.tenantId) {
    filtered = filtered.filter(item => item.tenantId === searchForm.tenantId)
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

function handleView(record: any) {
  currentEmployee.value = record
  detailVisible.value = true
}

function handleViewTenant(record: any) {
  if (record.tenantType === 'warehouse') {
    router.push({
      path: '/stock/warehouse-detail',
      query: { tenantId: record.tenantId },
    })
  } else {
    router.push({
      path: '/merchant/detail',
      query: { tenantId: record.tenantId },
    })
  }
}

function handleExport() {
  if (tableData.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${tableData.value.length} 条员工记录`)
}

function handleAdd() {
  addForm.tenantType = ''
  addForm.tenantId = ''
  addForm.realName = ''
  addForm.idCardType = ''
  addForm.idCardNo = ''
  addForm.serviceType = 'serviceProvider'
  addForm.staffType = 'normal'
  addForm.phone = ''
  addForm.positionCategory = ''
  addForm.positionLevel = ''
  addForm.remark = ''
  addVisible.value = true
}

function handleSubmit() {
  if (!addForm.tenantType) {
    Message.warning('请选择商户类型')
    return
  }
  if (!addForm.tenantId) {
    Message.warning('请选择所属商户')
    return
  }
  if (!addForm.realName) {
    Message.warning('请输入姓名')
    return
  }
  if (!addForm.phone) {
    Message.warning('请输入手机号码')
    return
  }

  const tenantInfo = addTenantOptions.value.find(t => t.value === addForm.tenantId)
  const staffTypeLabel = addForm.staffType === 'normal' ? '普通员工' : addForm.staffType === 'manager' ? '业务系统管理者' : '管理员'
  const serviceTypeLabel = addForm.serviceType === 'serviceProvider' ? '服务商' : addForm.serviceType === 'constructionParty' ? '施工方' : '工程仓'
  
  const newEmployee = {
    id: `EMP${String(allTableData.value.length + 1).padStart(3, '0')}`,
    realName: addForm.realName,
    phone: addForm.phone,
    tenantType: addForm.tenantType,
    tenantId: addForm.tenantId,
    tenantName: tenantInfo?.label || '',
    idCardType: addForm.idCardType,
    idCardNo: addForm.idCardNo,
    serviceType: addForm.serviceType,
    serviceTypeName: serviceTypeLabel,
    staffType: addForm.staffType,
    staffTypeName: staffTypeLabel,
    positionCategory: addForm.positionCategory,
    positionLevel: addForm.positionLevel,
    remark: addForm.remark,
    status: 1,
    lastLoginTime: '-',
    createdAt: new Date().toLocaleString('zh-CN'),
  }

  allTableData.value.unshift(newEmployee)
  tableData.value = [...allTableData.value]
  pagination.total = allTableData.value.length
  addVisible.value = false
  Message.success('员工添加成功')
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
