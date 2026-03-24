<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>仓库列表</span>
      </template>
      <template #extra>
        <a-space>
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
          <a-table-column title="负责人" :width="120">
            <template #cell="{ record }">
              <div class="manager-info">
                <span>{{ record.managerName }}</span>
                <span class="phone">{{ record.phone }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="地址" data-index="address" :width="200" :ellipsis="true" />
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
                <a-button type="text" size="small" @click="handleViewRecord(record)">出入库记录</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

interface WarehouseItem {
  id: string
  name: string
  code: string
  type: 'main' | 'sub'
  managerName: string
  phone: string
  address: string
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

const warehouses = ref<WarehouseItem[]>([
  {
    id: 'wh001',
    name: '深圳湾科技园项目仓',
    code: 'WH001',
    type: 'main',
    managerName: '张三',
    phone: '13800138001',
    address: '广东省深圳市南山区科技园南区',
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
    managerName: '李四',
    phone: '13800138002',
    address: '广东省深圳市福田区CBD中心区',
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
    managerName: '王五',
    phone: '13800138003',
    address: '广东省深圳市宝安区新安街道',
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
    managerName: '赵六',
    phone: '13800138004',
    address: '广东省深圳市龙岗区中心城',
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
    managerName: '钱七',
    phone: '13800138005',
    address: '广东省深圳市南山区科技园北区',
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
    managerName: '孙八',
    phone: '13800138006',
    address: '广东省广州市天河区珠江新城',
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
</style>
