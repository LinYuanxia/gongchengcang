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
          <a-table-column title="员工ID" data-index="id" :width="160" />
          <a-table-column title="姓名" :width="100">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.realName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="账号" data-index="username" :width="140" />
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="商户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.tenantType === 'warehouse' ? 'blue' : 'green'">
                {{ record.tenantType === 'warehouse' ? '工程仓' : '供应商' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="所属商户" :width="180">
            <template #cell="{ record }">
              {{ record.tenantName }}
            </template>
          </a-table-column>
          <a-table-column title="角色" :width="150">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="role in record.roles" :key="role" color="arcoblue" size="small">
                  {{ role }}
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="部门" data-index="department" :width="120" />
          <a-table-column title="职位" data-index="position" :width="100" />
          <a-table-column title="状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="最后登录" data-index="lastLoginTime" :width="160" />
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleViewTenant(record)">商户</a-button>
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
        <a-descriptions-item label="账号">{{ currentEmployee.username }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentEmployee.phone }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ currentEmployee.email || '-' }}</a-descriptions-item>
        <a-descriptions-item label="商户类型">
          <a-tag :color="currentEmployee.tenantType === 'warehouse' ? 'blue' : 'green'">
            {{ currentEmployee.tenantType === 'warehouse' ? '工程仓' : '供应商' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="所属商户">{{ currentEmployee.tenantName }}</a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-space wrap>
            <a-tag v-for="role in currentEmployee.roles" :key="role" color="arcoblue">{{ role }}</a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="部门">{{ currentEmployee.department || '-' }}</a-descriptions-item>
        <a-descriptions-item label="职位">{{ currentEmployee.position || '-' }}</a-descriptions-item>
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)
const detailVisible = ref(false)
const currentEmployee = ref<any>({})

const searchForm = reactive({
  keyword: '',
  tenantType: undefined as string | undefined,
  tenantId: undefined as string | undefined,
  status: undefined as number | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const tenantOptions = ref([
  { value: 't001', label: '华东工程仓', type: 'warehouse' },
  { value: 't002', label: '南京工程仓', type: 'warehouse' },
  { value: 't003', label: '苏州工程仓', type: 'warehouse' },
  { value: 't004', label: '宝钢集团', type: 'supplier' },
  { value: 't005', label: '沙钢集团', type: 'supplier' },
  { value: 't006', label: '马钢集团', type: 'supplier' },
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
    realName: '王仓管',
    username: 'warehouse_admin',
    phone: '13800138000',
    email: 'wang@warehouse.com',
    tenantType: 'warehouse',
    tenantId: 't001',
    tenantName: '华东工程仓',
    roles: ['管理员'],
    department: '管理部',
    position: '仓库主管',
    status: 1,
    lastLoginTime: '2024-03-26 09:30:00',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 'EMP002',
    realName: '张三',
    username: 'warehouse_op',
    phone: '13800138001',
    email: 'zhang@warehouse.com',
    tenantType: 'warehouse',
    tenantId: 't001',
    tenantName: '华东工程仓',
    roles: ['仓管员'],
    department: '仓储部',
    position: '仓管员',
    status: 1,
    lastLoginTime: '2024-03-26 08:00:00',
    createdAt: '2024-01-02 10:00:00',
  },
  {
    id: 'EMP003',
    realName: '李采购',
    username: 'warehouse_buy',
    phone: '13800138002',
    email: 'li@warehouse.com',
    tenantType: 'warehouse',
    tenantId: 't001',
    tenantName: '华东工程仓',
    roles: ['采购员'],
    department: '采购部',
    position: '采购专员',
    status: 1,
    lastLoginTime: '2024-03-25 17:30:00',
    createdAt: '2024-01-03 10:00:00',
  },
  {
    id: 'EMP004',
    realName: '赵销售',
    username: 'warehouse_sale',
    phone: '13800138003',
    email: 'zhao@warehouse.com',
    tenantType: 'warehouse',
    tenantId: 't002',
    tenantName: '南京工程仓',
    roles: ['销售员'],
    department: '销售部',
    position: '销售专员',
    status: 1,
    lastLoginTime: '2024-03-26 10:00:00',
    createdAt: '2024-01-04 10:00:00',
  },
  {
    id: 'EMP005',
    realName: '钱财务',
    username: 'warehouse_fin',
    phone: '13800138004',
    email: 'qian@warehouse.com',
    tenantType: 'warehouse',
    tenantId: 't002',
    tenantName: '南京工程仓',
    roles: ['财务员'],
    department: '财务部',
    position: '财务专员',
    status: 0,
    lastLoginTime: '2024-03-10 14:00:00',
    createdAt: '2024-01-05 10:00:00',
  },
  {
    id: 'EMP006',
    realName: '孙经理',
    username: 'baosteel_admin',
    phone: '13900139000',
    email: 'sun@baosteel.com',
    tenantType: 'supplier',
    tenantId: 't004',
    tenantName: '宝钢集团',
    roles: ['管理员'],
    department: '管理部',
    position: '区域经理',
    status: 1,
    lastLoginTime: '2024-03-26 08:30:00',
    createdAt: '2024-01-06 10:00:00',
  },
  {
    id: 'EMP007',
    realName: '周销售',
    username: 'baosteel_sale',
    phone: '13900139001',
    email: 'zhou@baosteel.com',
    tenantType: 'supplier',
    tenantId: 't004',
    tenantName: '宝钢集团',
    roles: ['销售'],
    department: '销售部',
    position: '销售代表',
    status: 1,
    lastLoginTime: '2024-03-25 16:00:00',
    createdAt: '2024-01-07 10:00:00',
  },
  {
    id: 'EMP008',
    realName: '吴客服',
    username: 'baosteel_service',
    phone: '13900139002',
    email: 'wu@baosteel.com',
    tenantType: 'supplier',
    tenantId: 't004',
    tenantName: '宝钢集团',
    roles: ['客服'],
    department: '客服部',
    position: '客服专员',
    status: 1,
    lastLoginTime: '2024-03-26 09:00:00',
    createdAt: '2024-01-08 10:00:00',
  },
  {
    id: 'EMP009',
    realName: '郑经理',
    username: 'shagang_admin',
    phone: '13900139100',
    email: 'zheng@shagang.com',
    tenantType: 'supplier',
    tenantId: 't005',
    tenantName: '沙钢集团',
    roles: ['管理员'],
    department: '管理部',
    position: '运营经理',
    status: 1,
    lastLoginTime: '2024-03-25 18:00:00',
    createdAt: '2024-01-09 10:00:00',
  },
  {
    id: 'EMP010',
    realName: '冯财务',
    username: 'shagang_fin',
    phone: '13900139101',
    email: 'feng@shagang.com',
    tenantType: 'supplier',
    tenantId: 't005',
    tenantName: '沙钢集团',
    roles: ['财务'],
    department: '财务部',
    position: '财务主管',
    status: 1,
    lastLoginTime: '2024-03-26 11:00:00',
    createdAt: '2024-01-10 10:00:00',
  },
])

const tableData = ref([...allTableData.value])

function handleSearch() {
  let filtered = [...allTableData.value]
  
  if (searchForm.keyword) {
    filtered = filtered.filter(item =>
      item.realName.includes(searchForm.keyword) ||
      item.phone.includes(searchForm.keyword) ||
      item.username.includes(searchForm.keyword)
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
