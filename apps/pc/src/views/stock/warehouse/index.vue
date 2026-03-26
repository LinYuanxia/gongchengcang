<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>仓库列表</span>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            创建仓库
          </a-button>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索仓库名称/编码"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.warehouseType" placeholder="仓库类型" style="width: 120px" allow-clear>
            <a-option value="main">主仓</a-option>
            <a-option value="sub">分仓</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 100px" allow-clear>
            <a-option value="active">启用</a-option>
            <a-option value="inactive">停用</a-option>
          </a-select>
        </a-space>
      </template>

      <a-table :data="filteredWarehouses" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="仓库信息" :width="220">
            <template #cell="{ record }">
              <div class="warehouse-cell" @click="handleViewDetail(record)">
                <div class="warehouse-name">
                  <icon-home class="icon" />
                  <span class="code-text">{{ record.code }}</span>
                </div>
                <div class="warehouse-meta">
                  <span class="name-text">{{ record.name }}</span>
                  <a-tag v-if="record.type === 'main'" color="blue" size="small">主仓</a-tag>
                  <a-tag v-else color="green" size="small">分仓</a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="所属主体" :width="150">
            <template #cell="{ record }">
              <div class="subject-info">
                <span class="subject-name">{{ record.subjectName }}</span>
              </div>
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
          <a-table-column title="地址" data-index="address" :width="200" :ellipsis="true" />
          <a-table-column title="覆盖区域" :width="150">
            <template #cell="{ record }">
              <div class="area-tags">
                <a-tag v-for="area in record.coverageAreas?.slice(0, 2)" :key="area" size="small">
                  {{ area }}
                </a-tag>
                <span v-if="!record.coverageAreas?.length">-</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="仓库标签" :width="150">
            <template #cell="{ record }">
              <div class="warehouse-tags">
                <a-tag v-for="tag in record.tags?.slice(0, 2)" :key="tag" color="arcoblue" size="small">
                  {{ tag }}
                </a-tag>
                <span v-if="!record.tags?.length">-</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="库存容量" :width="140">
            <template #cell="{ record }">
              <div class="capacity-info">
                <div class="capacity-bar">
                  <div 
                    class="capacity-used" 
                    :style="{ 
                      width: `${(record.usedCapacity / record.totalCapacity) * 100}%`,
                      background: getCapacityColor(record.usedCapacity / record.totalCapacity)
                    }"
                  ></div>
                </div>
                <div class="capacity-text">
                  {{ record.usedCapacity }} / {{ record.totalCapacity }} m²
                </div>
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
          <a-table-column title="预警/缺货" :width="100" align="center">
            <template #cell="{ record }">
              <a-space :size="4">
                <a-tooltip content="预警商品">
                  <a-tag v-if="record.warningCount > 0" color="orange" size="small">
                    {{ record.warningCount }}
                  </a-tag>
                  <span v-else class="zero">0</span>
                </a-tooltip>
                <a-tooltip content="缺货商品">
                  <a-tag v-if="record.outOfStockCount > 0" color="red" size="small">
                    {{ record.outOfStockCount }}
                  </a-tag>
                  <span v-else class="zero">0</span>
                </a-tooltip>
              </a-space>
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
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="createModalVisible"
      :title="isEdit ? '编辑仓库' : '创建仓库'"
      :width="600"
      @ok="handleCreateConfirm"
      @cancel="handleCreateCancel"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="所属工程仓主体" required>
          <a-select 
            v-model="createForm.subjectId" 
            placeholder="请选择工程仓主体"
            :disabled="isEdit"
          >
            <a-option v-for="subject in subjectList" :key="subject.id" :value="subject.id">
              {{ subject.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="仓库编码" required>
              <a-input v-model="createForm.code" placeholder="请输入仓库编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="仓库名称" required>
              <a-input v-model="createForm.name" placeholder="请输入仓库名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="仓库类型" required>
              <a-select v-model="createForm.type" placeholder="请选择仓库类型">
                <a-option value="main">主仓</a-option>
                <a-option value="sub">分仓</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="仓库容量(m²)" required>
              <a-input-number v-model="createForm.totalCapacity" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="仓库地址" required>
          <a-input v-model="createForm.address" placeholder="请输入仓库地址" />
        </a-form-item>
        <a-form-item label="覆盖区域范围">
          <a-select 
            v-model="createForm.coverageAreas" 
            placeholder="请选择覆盖区域" 
            multiple 
            allow-create
          >
            <a-option value="南山区">南山区</a-option>
            <a-option value="福田区">福田区</a-option>
            <a-option value="宝安区">宝安区</a-option>
            <a-option value="龙岗区">龙岗区</a-option>
            <a-option value="罗湖区">罗湖区</a-option>
            <a-option value="龙华区">龙华区</a-option>
            <a-option value="光明区">光明区</a-option>
            <a-option value="坪山区">坪山区</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="仓库标签">
          <a-select 
            v-model="createForm.tags" 
            placeholder="请选择或输入标签" 
            multiple 
            allow-create
          >
            <a-option value="重点项目">重点项目</a-option>
            <a-option value="紧急配送">紧急配送</a-option>
            <a-option value="大型仓库">大型仓库</a-option>
            <a-option value="冷链仓库">冷链仓库</a-option>
            <a-option value="临时仓库">临时仓库</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="仓库负责人" required>
          <a-select v-model="createForm.managerId" placeholder="请选择负责人">
            <a-option v-for="user in accountList" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.phone }})
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model="createForm.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model="createForm.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
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
  type: 'main' | 'sub'
  subjectId: string
  subjectName: string
  managerName: string
  managerId: string
  phone: string
  address: string
  coverageAreas: string[]
  tags: string[]
  usedCapacity: number
  totalCapacity: number
  productCount: number
  totalQuantity: number
  totalValue: number
  warningCount: number
  outOfStockCount: number
  status: 'active' | 'inactive'
}

const router = useRouter()

const searchForm = reactive({
  keyword: '',
  warehouseType: undefined as string | undefined,
  status: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const createModalVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')

const createForm = reactive({
  subjectId: '',
  code: '',
  name: '',
  type: 'main' as 'main' | 'sub',
  totalCapacity: 1000,
  address: '',
  coverageAreas: [] as string[],
  tags: [] as string[],
  managerId: '',
  phone: '',
  status: 'active' as 'active' | 'inactive',
})

const subjectList = ref([
  { id: 's1', name: '深圳湾科技园工程仓' },
  { id: 's2', name: '福田CBD工程仓' },
  { id: 's3', name: '宝安新安工程仓' },
  { id: 's4', name: '龙岗中心城工程仓' },
  { id: 's5', name: '南山科技园工程仓' },
  { id: 's6', name: '广州天河工程仓' },
])

const accountList = ref([
  { id: 'u1', name: '张三', phone: '13800138001' },
  { id: 'u2', name: '李四', phone: '13800138002' },
  { id: 'u3', name: '王五', phone: '13800138003' },
  { id: 'u4', name: '赵六', phone: '13800138004' },
  { id: 'u5', name: '钱七', phone: '13800138005' },
  { id: 'u6', name: '孙八', phone: '13800138006' },
])

const warehouses = ref<WarehouseItem[]>([
  {
    id: 'wh001',
    name: '深圳湾科技园项目仓',
    code: 'WH001',
    type: 'main',
    subjectId: 's1',
    subjectName: '深圳湾科技园工程仓',
    managerId: 'u1',
    managerName: '张三',
    phone: '13800138001',
    address: '广东省深圳市南山区科技园南区',
    coverageAreas: ['南山区', '福田区'],
    tags: ['重点项目', '大型仓库'],
    usedCapacity: 1200,
    totalCapacity: 2000,
    productCount: 156,
    totalQuantity: 4580,
    totalValue: 328500.00,
    warningCount: 5,
    outOfStockCount: 1,
    status: 'active',
  },
  {
    id: 'wh002',
    name: '福田CBD项目仓',
    code: 'WH002',
    type: 'main',
    subjectId: 's2',
    subjectName: '福田CBD工程仓',
    managerId: 'u2',
    managerName: '李四',
    phone: '13800138002',
    address: '广东省深圳市福田区CBD中心区',
    coverageAreas: ['福田区', '罗湖区'],
    tags: ['重点项目'],
    usedCapacity: 800,
    totalCapacity: 1000,
    productCount: 89,
    totalQuantity: 3260,
    totalValue: 245600.00,
    warningCount: 3,
    outOfStockCount: 1,
    status: 'active',
  },
  {
    id: 'wh003',
    name: '宝安新安项目仓',
    code: 'WH003',
    type: 'main',
    subjectId: 's3',
    subjectName: '宝安新安工程仓',
    managerId: 'u3',
    managerName: '王五',
    phone: '13800138003',
    address: '广东省深圳市宝安区新安街道',
    coverageAreas: ['宝安区', '光明区'],
    tags: ['大型仓库'],
    usedCapacity: 450,
    totalCapacity: 800,
    productCount: 120,
    totalQuantity: 4120,
    totalValue: 198350.00,
    warningCount: 4,
    outOfStockCount: 1,
    status: 'active',
  },
  {
    id: 'wh004',
    name: '龙岗中心城项目仓',
    code: 'WH004',
    type: 'sub',
    subjectId: 's4',
    subjectName: '龙岗中心城工程仓',
    managerId: 'u4',
    managerName: '赵六',
    phone: '13800138004',
    address: '广东省深圳市龙岗区中心城',
    coverageAreas: ['龙岗区', '坪山区'],
    tags: [],
    usedCapacity: 300,
    totalCapacity: 500,
    productCount: 75,
    totalQuantity: 2100,
    totalValue: 75000.00,
    warningCount: 0,
    outOfStockCount: 0,
    status: 'active',
  },
  {
    id: 'wh005',
    name: '南山科技园项目仓',
    code: 'WH005',
    type: 'sub',
    subjectId: 's5',
    subjectName: '南山科技园工程仓',
    managerId: 'u5',
    managerName: '钱七',
    phone: '13800138005',
    address: '广东省深圳市南山区科技园北区',
    coverageAreas: ['南山区'],
    tags: ['临时仓库'],
    usedCapacity: 0,
    totalCapacity: 600,
    productCount: 62,
    totalQuantity: 1620,
    totalValue: 45000.00,
    warningCount: 0,
    outOfStockCount: 0,
    status: 'inactive',
  },
  {
    id: 'wh006',
    name: '广州天河项目仓',
    code: 'WH006',
    type: 'main',
    subjectId: 's6',
    subjectName: '广州天河工程仓',
    managerId: 'u6',
    managerName: '孙八',
    phone: '13800138006',
    address: '广东省广州市天河区珠江新城',
    coverageAreas: ['天河区', '越秀区'],
    tags: ['重点项目'],
    usedCapacity: 800,
    totalCapacity: 1500,
    productCount: 98,
    totalQuantity: 2800,
    totalValue: 156000.00,
    warningCount: 2,
    outOfStockCount: 0,
    status: 'active',
  },
])

const filteredWarehouses = computed(() => {
  let result = warehouses.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(w =>
      w.name.toLowerCase().includes(keyword) ||
      w.code.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.warehouseType) {
    result = result.filter(w => w.type === searchForm.warehouseType)
  }

  if (searchForm.status) {
    result = result.filter(w => w.status === searchForm.status)
  }

  pagination.total = result.length
  return result
})

function getCapacityColor(ratio: number) {
  if (ratio >= 0.9) return '#F53F3F'
  if (ratio >= 0.7) return '#FF7D00'
  return '#165DFF'
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  isEdit.value = false
  editId.value = ''
  Object.assign(createForm, {
    subjectId: '',
    code: '',
    name: '',
    type: 'main',
    totalCapacity: 1000,
    address: '',
    coverageAreas: [],
    tags: [],
    managerId: '',
    phone: '',
    status: 'active',
  })
  createModalVisible.value = true
}

function handleEdit(record: WarehouseItem) {
  isEdit.value = true
  editId.value = record.id
  Object.assign(createForm, {
    subjectId: record.subjectId,
    code: record.code,
    name: record.name,
    type: record.type,
    totalCapacity: record.totalCapacity,
    address: record.address,
    coverageAreas: record.coverageAreas || [],
    tags: record.tags || [],
    managerId: record.managerId,
    phone: record.phone,
    status: record.status,
  })
  createModalVisible.value = true
}

function handleCreateConfirm() {
  if (!createForm.subjectId) {
    Message.warning('请选择工程仓主体')
    return
  }
  if (!createForm.code) {
    Message.warning('请输入仓库编码')
    return
  }
  if (!createForm.name) {
    Message.warning('请输入仓库名称')
    return
  }
  if (!createForm.managerId) {
    Message.warning('请选择仓库负责人')
    return
  }
  if (!createForm.address) {
    Message.warning('请输入仓库地址')
    return
  }

  const subject = subjectList.value.find(s => s.id === createForm.subjectId)
  const manager = accountList.value.find(u => u.id === createForm.managerId)

  if (isEdit.value) {
    const index = warehouses.value.findIndex(w => w.id === editId.value)
    if (index > -1) {
      warehouses.value[index] = {
        ...warehouses.value[index],
        ...createForm,
        subjectName: subject?.name || '',
        managerName: manager?.name || '',
        phone: createForm.phone || manager?.phone || '',
      }
    }
    Message.success('仓库编辑成功')
  } else {
    const newWarehouse: WarehouseItem = {
      id: `wh${Date.now()}`,
      ...createForm,
      subjectName: subject?.name || '',
      managerName: manager?.name || '',
      phone: createForm.phone || manager?.phone || '',
      usedCapacity: 0,
      productCount: 0,
      totalQuantity: 0,
      totalValue: 0,
      warningCount: 0,
      outOfStockCount: 0,
    }
    warehouses.value.push(newWarehouse)
    Message.success('仓库创建成功')
  }
  createModalVisible.value = false
}

function handleCreateCancel() {
  createModalVisible.value = false
}

function handleViewDetail(record: WarehouseItem) {
  router.push({
    path: '/stock/warehouse-detail',
    query: { id: record.id }
  })
}

function handleViewRecord(record: WarehouseItem) {
  router.push({
    path: '/stock/record',
    query: { warehouseId: record.id, warehouseName: record.name }
  })
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
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

.subject-info {
  .subject-name {
    font-weight: 500;
  }
}

.area-tags,
.warehouse-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
