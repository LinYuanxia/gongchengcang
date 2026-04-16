<template>
  <div class="warehouse-list">
    <a-row :gutter="16" class="stat-row">
      <a-col :span="5">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="仓库总数" :value="warehouseStats.totalCount" suffix="个">
            <template #prefix><icon-home /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="5">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="商品种类" :value="warehouseStats.productCount" suffix="种">
            <template #prefix><icon-apps /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="5">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存总量" :value="warehouseStats.totalQuantity" suffix="件">
            <template #prefix><icon-storage /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存总价值" :value="warehouseStats.totalValue" :precision="0" prefix="¥">
            <template #prefix><icon-safe /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card style="margin-top: 16px">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增仓库
          </a-button>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索仓库名称/编码"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 100px" allow-clear>
            <a-option value="active">启用</a-option>
            <a-option value="inactive">停用</a-option>
          </a-select>
        </a-space>
      </template>

      <a-table :data="filteredWarehouses" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="仓库编码" data-index="code" :width="120" />
          <a-table-column title="仓库名称" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="负责人" :width="120">
            <template #cell="{ record }">
              <div class="manager-info">
                <span>{{ record.managerName }}</span>
                <span class="phone">{{ record.phone }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="仓库地址" data-index="address" :width="220" :ellipsis="true" />
          <a-table-column title="仓库标签" :width="180">
            <template #cell="{ record }">
              <div class="warehouse-tags">
                <a-tag v-for="tag in record.tags?.slice(0, 3)" :key="tag" color="arcoblue" size="small">
                  {{ tag }}
                </a-tag>
                <span v-if="!record.tags?.length">-</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="商品种类" :width="90" align="center">
            <template #cell="{ record }">
              <span class="count">{{ record.productCount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="库存总量" :width="100" align="right">
            <template #cell="{ record }">
              <span>{{ record.totalQuantity }} 件</span>
            </template>
          </a-table-column>
          <a-table-column title="库存价值" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.totalValue.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80" align="center">
            <template #cell="{ record }">
              <a-badge :status="record.status === 'active' ? 'success' : 'danger'" :text="record.status === 'active' ? '启用' : '停用'" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">查看详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleViewRecord(record)">出入库记录</a-button>
                <a-popconfirm content="确定要删除该仓库吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑仓库' : '新增仓库'" :width="600" @ok="handleSubmit">
        <a-form :model="form" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="仓库编码" required>
                <a-input v-model="form.code" placeholder="请输入仓库编码" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="仓库名称" required>
                <a-input v-model="form.name" placeholder="请输入仓库名称" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="仓库地址" required>
            <a-cascader
              v-model="form.addressArea"
              :options="addressOptions"
              placeholder="请选择省市区"
              style="width: 100%"
              @change="handleAddressChange"
            />
            <a-input v-model="form.addressDetail" placeholder="请输入详细地址" style="margin-top: 8px" />
          </a-form-item>
          <a-form-item label="仓库标签">
            <a-input-tag v-model="form.tags" placeholder="输入标签后按回车" />
            <div class="form-tip fs-12 mt-4 text-secondary">直接输入标签文字按回车即可添加，支持完全自定义</div>
          </a-form-item>
          <a-row :gutter="16">
            <a-col :span="18">
              <a-form-item label="仓库负责人" required>
                <a-select 
                  v-model="form.managerId" 
                  placeholder="请选择负责人"
                  @change="handleManagerChange"
                  allow-search
                >
                  <a-option v-for="item in employeeList" :key="item.id" :value="item.id">
                    {{ item.name }} ({{ item.phone }})
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="&nbsp;">
                <a-button @click="openAddEmployee" style="width: 100%">
                  <template #icon><icon-plus /></template>
                  新增员工
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="联系电话">
            <a-input v-model="form.phone" placeholder="自动带出负责人电话" />
          </a-form-item>
          <a-form-item label="状态">
            <a-radio-group v-model="form.status">
              <a-radio value="active">启用</a-radio>
              <a-radio value="inactive">停用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </a-modal>
      
      <a-modal v-model:visible="employeeModalVisible" title="新增员工" :width="460" @ok="handleAddEmployee">
        <a-form :model="employeeForm" layout="vertical">
          <a-form-item label="员工姓名" required>
            <a-input v-model="employeeForm.name" placeholder="请输入员工姓名" />
          </a-form-item>
          <a-form-item label="联系电话" required>
            <a-input v-model="employeeForm.phone" placeholder="请输入联系电话" maxlength="11" />
          </a-form-item>
          <a-form-item label="员工职位">
            <a-input v-model="employeeForm.position" placeholder="请输入职位，如：仓管、主管" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

interface WarehouseItem {
  id: string
  name: string
  code: string
  managerName: string
  managerId: string
  phone: string
  address: string
  tags: string[]
  productCount: number
  totalQuantity: number
  totalValue: number
  status: 'active' | 'inactive'
}

interface Employee {
  id: string
  name: string
  phone: string
  position: string
}

const router = useRouter()

const searchForm = reactive({
  keyword: '',
  status: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const modalVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')

const form = reactive({
  code: '',
  name: '',
  address: '',
  addressArea: [] as string[],
  addressDetail: '',
  tags: [] as string[],
  managerId: '',
  phone: '',
  status: 'active' as 'active' | 'inactive',
})

const employeeModalVisible = ref(false)
const employeeForm = reactive({
  name: '',
  phone: '',
  position: '',
})

const employeeList = ref<Employee[]>([
  { id: 'emp1', name: '张三', phone: '13800138001', position: '仓库主管' },
  { id: 'emp2', name: '李四', phone: '13800138002', position: '仓管员' },
  { id: 'emp3', name: '王五', phone: '13800138003', position: '仓管员' },
  { id: 'emp4', name: '赵六', phone: '13800138004', position: '收货员' },
])

const addressOptions = ref([
  {
    label: '广东省',
    value: 'guangdong',
    children: [
      {
        label: '深圳市',
        value: 'shenzhen',
        children: [
          { label: '南山区', value: 'nanshan' },
          { label: '福田区', value: 'futian' },
          { label: '宝安区', value: 'baoan' },
          { label: '龙岗区', value: 'longgang' },
          { label: '罗湖区', value: 'luohu' },
          { label: '龙华区', value: 'longhua' },
          { label: '光明区', value: 'guangming' },
          { label: '坪山区', value: 'pingshan' },
        ],
      },
      {
        label: '广州市',
        value: 'guangzhou',
        children: [
          { label: '天河区', value: 'tianhe' },
          { label: '越秀区', value: 'yuexiu' },
          { label: '海珠区', value: 'haizhu' },
          { label: '荔湾区', value: 'liwan' },
        ],
      },
    ],
  },
  {
    label: '北京市',
    value: 'beijing',
    children: [
      {
        label: '朝阳区',
        value: 'chaoyang',
        children: [
          { label: '望京', value: 'wangjing' },
          { label: '三里屯', value: 'sanlitun' },
        ],
      },
    ],
  },
])

const warehouses = ref<WarehouseItem[]>([
  {
    id: 'wh001',
    name: '深圳湾科技园项目仓',
    code: 'WH001',
    managerId: 'emp1',
    managerName: '张三',
    phone: '13800138001',
    address: '广东省深圳市南山区科技园南区',
    tags: ['重点项目', '大型仓库'],
    productCount: 156,
    totalQuantity: 4580,
    totalValue: 328500.00,
    status: 'active',
  },
  {
    id: 'wh002',
    name: '福田CBD项目仓',
    code: 'WH002',
    managerId: 'emp2',
    managerName: '李四',
    phone: '13800138002',
    address: '广东省深圳市福田区CBD中心区',
    tags: ['重点项目'],
    productCount: 89,
    totalQuantity: 3260,
    totalValue: 245600.00,
    status: 'active',
  },
  {
    id: 'wh003',
    name: '宝安新安项目仓',
    code: 'WH003',
    managerId: 'emp3',
    managerName: '王五',
    phone: '13800138003',
    address: '广东省深圳市宝安区新安街道',
    tags: ['大型仓库'],
    productCount: 120,
    totalQuantity: 4120,
    totalValue: 198350.00,
    status: 'active',
  },
  {
    id: 'wh004',
    name: '龙岗中心城项目仓',
    code: 'WH004',
    managerId: 'emp4',
    managerName: '赵六',
    phone: '13800138004',
    address: '广东省深圳市龙岗区中心城',
    tags: ['临时周转'],
    productCount: 75,
    totalQuantity: 2100,
    totalValue: 75000.00,
    status: 'active',
  },
  {
    id: 'wh005',
    name: '南山科技园项目仓',
    code: 'WH005',
    managerId: 'emp1',
    managerName: '张三',
    phone: '13800138001',
    address: '广东省深圳市南山区科技园北区',
    tags: ['临时仓库'],
    productCount: 62,
    totalQuantity: 1620,
    totalValue: 45000.00,
    status: 'inactive',
  },
])

const warehouseStats = computed(() => {
  const totalCount = warehouses.value.length
  const productCount = warehouses.value.reduce((sum, w) => sum + w.productCount, 0)
  const totalQuantity = warehouses.value.reduce((sum, w) => sum + w.totalQuantity, 0)
  const totalValue = warehouses.value.reduce((sum, w) => sum + w.totalValue, 0)
  
  return {
    totalCount,
    productCount,
    totalQuantity,
    totalValue,
  }
})

const filteredWarehouses = computed(() => {
  let result = warehouses.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(w =>
      w.name.toLowerCase().includes(keyword) ||
      w.code.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.status) {
    result = result.filter(w => w.status === searchForm.status)
  }

  pagination.total = result.length
  return result
})

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  Object.assign(form, {
    code: '',
    name: '',
    address: '',
    addressArea: [],
    addressDetail: '',
    tags: [],
    managerId: '',
    phone: '',
    status: 'active',
  })
  modalVisible.value = true
}

function handleEdit(record: WarehouseItem) {
  isEdit.value = true
  editId.value = record.id
  Object.assign(form, {
    code: record.code,
    name: record.name,
    address: record.address,
    addressArea: [],
    addressDetail: record.address,
    tags: record.tags || [],
    managerId: record.managerId,
    phone: record.phone,
    status: record.status,
  })
  modalVisible.value = true
}

function openAddEmployee() {
  employeeForm.name = ''
  employeeForm.phone = ''
  employeeForm.position = ''
  employeeModalVisible.value = true
}

function handleAddEmployee() {
  if (!employeeForm.name) {
    Message.warning('请输入员工姓名')
    return
  }
  if (!employeeForm.phone) {
    Message.warning('请输入联系电话')
    return
  }
  const newEmployee: Employee = {
    id: `emp${Date.now()}`,
    name: employeeForm.name,
    phone: employeeForm.phone,
    position: employeeForm.position || '仓管员',
  }
  employeeList.value.push(newEmployee)
  form.managerId = newEmployee.id
  form.phone = newEmployee.phone
  employeeModalVisible.value = false
  Message.success('员工添加成功，已自动选为负责人')
}

function handleAddressChange(value: string[]) {
  console.log('Address area changed:', value)
}

function handleSubmit() {
  if (!form.code) {
    Message.warning('请输入仓库编码')
    return
  }
  if (!form.name) {
    Message.warning('请输入仓库名称')
    return
  }
  if (!form.managerId) {
    Message.warning('请选择仓库负责人')
    return
  }
  if (!form.addressArea || form.addressArea.length === 0) {
    Message.warning('请选择省市区')
    return
  }
  if (!form.addressDetail) {
    Message.warning('请输入详细地址')
    return
  }

  const selectedAreas = form.addressArea.map((areaValue, index) => {
    if (index === 0) {
      const province = addressOptions.value.find(p => p.value === areaValue)
      return province?.label || ''
    } else if (index === 1) {
      const province = addressOptions.value.find(p => p.value === form.addressArea[0])
      const city = province?.children?.find(c => c.value === areaValue)
      return city?.label || ''
    } else if (index === 2) {
      const province = addressOptions.value.find(p => p.value === form.addressArea[0])
      const city = province?.children?.find(c => c.value === form.addressArea[1])
      const district = city?.children?.find(d => d.value === areaValue)
      return district?.label || ''
    }
    return ''
  }).join('')
  
  form.address = selectedAreas + form.addressDetail

  const manager = employeeList.value.find(u => u.id === form.managerId)

  if (isEdit.value) {
    const index = warehouses.value.findIndex(w => w.id === editId.value)
    if (index > -1) {
      warehouses.value[index] = {
        ...warehouses.value[index],
        ...form,
        managerName: manager?.name || '',
        phone: form.phone || manager?.phone || '',
      }
    }
    Message.success('仓库编辑成功')
  } else {
    const newWarehouse: WarehouseItem = {
      id: `wh${Date.now()}`,
      ...form,
      managerName: manager?.name || '',
      phone: form.phone || manager?.phone || '',
      productCount: 0,
      totalQuantity: 0,
      totalValue: 0,
    }
    warehouses.value.push(newWarehouse)
    Message.success('仓库创建成功')
  }
  modalVisible.value = false
}

function handleManagerChange(managerId: string) {
  const employee = employeeList.value.find(a => a.id === managerId)
  if (employee) {
    form.phone = employee.phone
  }
}

function handleViewDetail(record: WarehouseItem) {
  router.push({
    path: `/warehouse/warehouse-detail/${record.id}`,
    query: { id: record.id }
  })
}

function handleViewRecord(record: WarehouseItem) {
  Message.info(`查看出入库记录：${record.name}`)
}

function handleDelete(record: WarehouseItem) {
  const index = warehouses.value.findIndex(w => w.id === record.id)
  if (index > -1) {
    warehouses.value.splice(index, 1)
    Message.success('仓库删除成功')
  }
}
</script>

<style scoped lang="less">
.warehouse-list {
  padding: 16px;
}

.stat-row {
  .stat-card {
    :deep(.arco-statistic-title) {
      font-size: 13px;
      color: var(--color-text-2);
    }
    
    :deep(.arco-statistic-value) {
      font-size: 22px;
      font-weight: 600;
    }

    .trend {
      font-size: 12px;
      margin-left: 4px;

      &.down {
        color: var(--color-success-6);
      }
      &.up {
        color: var(--color-danger-6);
      }
    }
  }
  
  .warning-card {
    border-left: 3px solid var(--color-warning);
  }
  
  .danger-card {
    border-left: 3px solid var(--color-danger);
  }
}

.warehouse-cell {
  cursor: pointer;
  
  &:hover .warehouse-name {
    color: var(--color-primary);
  }
  
  .warehouse-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    
    .icon {
      color: var(--color-primary);
    }
    
    .code-text {
      font-weight: 600;
    }
  }
  
  .warehouse-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    
    .name-text {
      font-size: 12px;
      color: var(--color-text-2);
    }
  }
}

.manager-info {
  display: flex;
  flex-direction: column;
  
  .phone {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.capacity-info {
  .capacity-bar {
    height: 6px;
    background: var(--color-fill-3);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
  }
  
  .capacity-used {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }
  
  .capacity-text {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.count {
  font-weight: 500;
  color: var(--color-primary);
}

.price {
  color: var(--color-danger);
  font-weight: 500;
}

.zero {
  color: var(--color-text-4);
}

.area-tags,
.warehouse-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>