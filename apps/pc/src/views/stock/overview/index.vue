<template>
  <div class="page-container">
    <a-row :gutter="16" class="stat-row">
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="仓库总数" :value="stockStats.warehouseCount" suffix="个">
            <template #prefix>
              <icon-home class="stat-icon" />
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span class="active">启用 {{ stockStats.activeWarehouseCount }}</span>
            <span class="inactive">停用 {{ stockStats.inactiveWarehouseCount }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="商品种类" :value="stockStats.skuCount" suffix="种">
            <template #prefix>
              <icon-apps class="stat-icon" />
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>在库 {{ stockStats.inStockSkuCount }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="总库存量" :value="stockStats.totalQuantity" suffix="件">
            <template #prefix>
              <icon-storage class="stat-icon" />
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>可用 {{ stockStats.availableQuantity }}</span>
            <span class="locked">锁定 {{ stockStats.lockedQuantity }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存总价值" :value="stockStats.totalValue" :precision="2" prefix="¥">
            <template #prefix>
              <icon-safe class="stat-icon value-icon" />
            </template>
          </a-statistic>
          <div class="stat-footer">
            <span>日均周转 ¥{{ stockStats.dailyTurnover.toFixed(0) }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card warning-card">
          <a-statistic title="预警商品" :value="stockStats.warningCount" suffix="种">
            <template #prefix>
              <icon-exclamation-circle-fill class="stat-icon warning-icon" />
            </template>
          </a-statistic>
          <div class="stat-footer">
            <a-link @click="handleViewWarning">立即处理</a-link>
          </div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card danger-card">
          <a-statistic title="缺货商品" :value="stockStats.outOfStockCount" suffix="种">
            <template #prefix>
              <icon-close-circle-fill class="stat-icon danger-icon" />
            </template>
          </a-statistic>
          <div class="stat-footer">
            <a-link status="danger" @click="handleViewOutOfStock">紧急补货</a-link>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="16">
        <a-card :bordered="false" class="table-card">
          <template #title>
            <a-space>
              <span>各仓库库存监控</span>
              <a-tag color="blue">实时</a-tag>
            </a-space>
          </template>
          <template #extra>
            <a-space>
              <a-input-search
                v-model="warehouseSearch"
                placeholder="搜索仓库"
                style="width: 180px"
              />
              <a-button @click="handleExport">
                <template #icon><icon-download /></template>
                导出报表
              </a-button>
            </a-space>
          </template>

          <a-table :data="filteredWarehouseList" :pagination="false">
            <template #columns>
              <a-table-column title="仓库信息" :width="200">
                <template #cell="{ record }">
                  <div class="warehouse-cell" @click="handleViewWarehouse(record)">
                    <div class="warehouse-name">
                      <icon-home class="icon" />
                      <span>{{ record.warehouseName }}</span>
                    </div>
                    <div class="warehouse-meta">
                      <a-tag v-if="record.type === 'main'" color="blue" size="small">主仓</a-tag>
                      <a-tag v-else color="green" size="small">分仓</a-tag>
                      <span class="manager">{{ record.managerName }}</span>
                    </div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="库存容量" :width="160">
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
              <a-table-column title="商品种类" :width="80" align="center">
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
              <a-table-column title="周转天数" :width="100" align="center">
                <template #cell="{ record }">
                  <span :class="{ 'high-turnover': record.turnoverDays > 30 }">
                    {{ record.turnoverDays }} 天
                  </span>
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
                  <a-badge :status="record.status === 'active' ? 'success' : 'danger'" :text="record.status === 'active' ? '正常' : '停用'" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="120" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleViewWarehouse(record)">详情</a-button>
                    <a-button type="text" size="small" @click="handleTransfer(record)">调拨</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card :bordered="false" class="alert-card">
          <template #title>
            <a-space>
              <span>库存预警</span>
              <a-badge :count="alertList.length" />
            </a-space>
          </template>
          <div class="alert-list">
            <div v-for="alert in alertList" :key="alert.id" class="alert-item" :class="alert.level">
              <div class="alert-icon">
                <icon-exclamation-circle-fill v-if="alert.level === 'warning'" />
                <icon-close-circle-fill v-else-if="alert.level === 'danger'" />
                <icon-info-circle-fill v-else />
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-desc">{{ alert.description }}</div>
                <div class="alert-meta">
                  <span>{{ alert.warehouseName }}</span>
                  <span>{{ alert.time }}</span>
                </div>
              </div>
              <a-button type="text" size="small" @click="handleAlert(alert)">处理</a-button>
            </div>
            <a-empty v-if="alertList.length === 0" description="暂无预警" />
          </div>
        </a-card>

        <a-card :bordered="false" class="trend-card">
          <template #title>
            <span>出入库趋势（近7天）</span>
          </template>
          <div class="trend-chart">
            <div class="trend-bars">
              <div v-for="(item, index) in trendData" :key="index" class="trend-bar-item">
                <div class="trend-bar" :style="{ height: getBarHeight(item.inQty) }">
                  <span class="bar-value">{{ item.inQty }}</span>
                </div>
                <div class="trend-bar out-bar" :style="{ height: getBarHeight(item.outQty) }">
                  <span class="bar-value">{{ item.outQty }}</span>
                </div>
                <div class="trend-label">{{ item.date }}</div>
              </div>
            </div>
            <div class="trend-legend">
              <span class="legend-item"><i class="dot in"></i>入库</span>
              <span class="legend-item"><i class="dot out"></i>出库</span>
            </div>
          </div>
          <div class="trend-summary">
            <div class="summary-item">
              <span class="label">本周入库</span>
              <span class="value in">+{{ weekSummary.inTotal }} 件</span>
            </div>
            <div class="summary-item">
              <span class="label">本周出库</span>
              <span class="value out">-{{ weekSummary.outTotal }} 件</span>
            </div>
            <div class="summary-item">
              <span class="label">净增减</span>
              <span class="value" :class="weekSummary.netChange >= 0 ? 'in' : 'out'">
                {{ weekSummary.netChange >= 0 ? '+' : '' }}{{ weekSummary.netChange }} 件
              </span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card :bordered="false" class="category-card">
          <template #title>
            <span>分类库存分布</span>
          </template>
          <a-table :data="categoryStockList" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="分类名称" data-index="categoryName" :width="120" />
              <a-table-column title="商品种类" :width="80" align="center">
                <template #cell="{ record }">
                  <span class="count">{{ record.productCount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="库存总量" :width="100" align="right">
                <template #cell="{ record }">
                  <span>{{ record.totalQuantity }} {{ record.unit }}</span>
                </template>
              </a-table-column>
              <a-table-column title="库存价值" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="price">¥{{ record.totalValue.toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="占比" :width="150">
                <template #cell="{ record }">
                  <a-progress :percent="record.percent" :stroke-width="8" size="small" />
                </template>
              </a-table-column>
              <a-table-column title="预警" :width="60" align="center">
                <template #cell="{ record }">
                  <a-tag v-if="record.warningCount > 0" color="orange" size="small">{{ record.warningCount }}</a-tag>
                  <span v-else>-</span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card :bordered="false" class="transfer-card">
          <template #title>
            <span>待处理调拨申请</span>
          </template>
          <template #extra>
            <a-link @click="handleViewAllTransfer">查看全部</a-link>
          </template>
          <a-table :data="pendingTransferList" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="调拨单号" :width="130">
                <template #cell="{ record }">
                  <a-link>{{ record.transferNo }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="调出仓库" :width="100">
                <template #cell="{ record }">
                  <span class="warehouse-tag out">{{ record.sourceWarehouseName }}</span>
                </template>
              </a-table-column>
              <a-table-column title="调入仓库" :width="100">
                <template #cell="{ record }">
                  <span class="warehouse-tag in">{{ record.targetWarehouseName }}</span>
                </template>
              </a-table-column>
              <a-table-column title="商品数" :width="70" align="center">
                <template #cell="{ record }">
                  {{ record.productCount }} 种
                </template>
              </a-table-column>
              <a-table-column title="申请时间" data-index="createdAt" :width="100" />
              <a-table-column title="操作" :width="80">
                <template #cell="{ record }">
                  <a-button type="text" size="small" status="success" @click="handleApproveTransfer(record)">审批</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:visible="transferVisible" title="发起调拨" :width="600" @ok="handleTransferConfirm">
      <a-form :model="transferForm" layout="vertical">
        <a-form-item label="调出仓库">
          <a-input :model-value="currentWarehouse?.warehouseName" disabled />
        </a-form-item>
        <a-form-item label="调入仓库" required>
          <a-select v-model="transferForm.targetWarehouseId" placeholder="请选择调入仓库">
            <a-option 
              v-for="w in warehouseStockList.filter(w => w.warehouseId !== currentWarehouse?.warehouseId)" 
              :key="w.warehouseId" 
              :value="w.warehouseId"
            >
              {{ w.warehouseName }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调拨商品" required>
          <a-select 
            v-model="transferForm.productIds" 
            placeholder="请选择调拨商品" 
            multiple
            :max-tag-count="3"
          >
            <a-option value="p1">水泥 P.O 42.5</a-option>
            <a-option value="p2">螺纹钢 HRB400 16mm</a-option>
            <a-option value="p3">黄砂 中砂</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调拨原因" required>
          <a-textarea v-model="transferForm.reason" placeholder="请输入调拨原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const stockStats = reactive({
  warehouseCount: 12,
  activeWarehouseCount: 10,
  inactiveWarehouseCount: 2,
  skuCount: 356,
  inStockSkuCount: 340,
  totalQuantity: 15680,
  availableQuantity: 14200,
  lockedQuantity: 1480,
  totalValue: 892450.00,
  dailyTurnover: 45600,
  warningCount: 12,
  outOfStockCount: 3,
})

const warehouseSearch = ref('')

const warehouseStockList = ref([
  {
    warehouseId: 'w1',
    warehouseName: '深圳湾科技园项目仓',
    type: 'main',
    managerName: '张三',
    usedCapacity: 1200,
    totalCapacity: 2000,
    productCount: 156,
    totalQuantity: 4580,
    totalValue: 328500.00,
    availableQuantity: 4200,
    lockedQuantity: 380,
    turnoverDays: 15,
    warningCount: 5,
    outOfStockCount: 1,
    status: 'active',
  },
  {
    warehouseId: 'w2',
    warehouseName: '福田CBD项目仓',
    type: 'main',
    managerName: '李四',
    usedCapacity: 800,
    totalCapacity: 1000,
    productCount: 89,
    totalQuantity: 3260,
    totalValue: 245600.00,
    availableQuantity: 3100,
    lockedQuantity: 160,
    turnoverDays: 22,
    warningCount: 3,
    outOfStockCount: 1,
    status: 'active',
  },
  {
    warehouseId: 'w3',
    warehouseName: '宝安新安项目仓',
    type: 'main',
    managerName: '王五',
    usedCapacity: 450,
    totalCapacity: 800,
    productCount: 120,
    totalQuantity: 4120,
    totalValue: 198350.00,
    availableQuantity: 3850,
    lockedQuantity: 270,
    turnoverDays: 35,
    warningCount: 4,
    outOfStockCount: 1,
    status: 'active',
  },
  {
    warehouseId: 'w4',
    warehouseName: '龙岗中心城项目仓',
    type: 'sub',
    managerName: '赵六',
    usedCapacity: 300,
    totalCapacity: 500,
    productCount: 75,
    totalQuantity: 2100,
    totalValue: 75000.00,
    availableQuantity: 2000,
    lockedQuantity: 100,
    turnoverDays: 18,
    warningCount: 0,
    outOfStockCount: 0,
    status: 'active',
  },
  {
    warehouseId: 'w5',
    warehouseName: '南山科技园项目仓',
    type: 'sub',
    managerName: '钱七',
    usedCapacity: 0,
    totalCapacity: 600,
    productCount: 62,
    totalQuantity: 1620,
    totalValue: 45000.00,
    availableQuantity: 1550,
    lockedQuantity: 70,
    turnoverDays: 28,
    warningCount: 0,
    outOfStockCount: 0,
    status: 'inactive',
  },
])

const filteredWarehouseList = computed(() => {
  if (!warehouseSearch.value) return warehouseStockList.value
  const keyword = warehouseSearch.value.toLowerCase()
  return warehouseStockList.value.filter(w => 
    w.warehouseName.toLowerCase().includes(keyword) ||
    w.managerName.toLowerCase().includes(keyword)
  )
})

const alertList = ref([
  {
    id: 'a1',
    level: 'danger',
    title: '水泥 P.O 42.5 缺货',
    description: '库存为0，请立即补货',
    warehouseName: '深圳湾科技园项目仓',
    time: '10分钟前',
  },
  {
    id: 'a2',
    level: 'warning',
    title: '螺纹钢 HRB400 库存预警',
    description: '库存低于安全库存，当前80吨，安全库存100吨',
    warehouseName: '福田CBD项目仓',
    time: '30分钟前',
  },
  {
    id: 'a3',
    level: 'warning',
    title: '黄砂 中砂 库存预警',
    description: '库存低于安全库存，当前50方，安全库存200方',
    warehouseName: '深圳湾科技园项目仓',
    time: '1小时前',
  },
  {
    id: 'a4',
    level: 'info',
    title: '仓库容量告警',
    description: '仓库使用率已达85%，建议清理或扩容',
    warehouseName: '福田CBD项目仓',
    time: '2小时前',
  },
])

const trendData = ref([
  { date: '03-18', inQty: 320, outQty: 280 },
  { date: '03-19', inQty: 450, outQty: 380 },
  { date: '03-20', inQty: 280, outQty: 420 },
  { date: '03-21', inQty: 560, outQty: 350 },
  { date: '03-22', inQty: 380, outQty: 290 },
  { date: '03-23', inQty: 420, outQty: 480 },
  { date: '03-24', inQty: 350, outQty: 320 },
])

const weekSummary = computed(() => {
  const inTotal = trendData.value.reduce((sum, t) => sum + t.inQty, 0)
  const outTotal = trendData.value.reduce((sum, t) => sum + t.outQty, 0)
  return {
    inTotal,
    outTotal,
    netChange: inTotal - outTotal,
  }
})

const categoryStockList = ref([
  { categoryId: 'c1', categoryName: '钢材', productCount: 45, totalQuantity: 5200, unit: '吨', totalValue: 425000.00, percent: 0.35, warningCount: 3 },
  { categoryId: 'c2', categoryName: '水泥', productCount: 28, totalQuantity: 3800, unit: '吨', totalValue: 156000.00, percent: 0.25, warningCount: 2 },
  { categoryId: 'c3', categoryName: '砂石', productCount: 32, totalQuantity: 4500, unit: '方', totalValue: 89000.00, percent: 0.18, warningCount: 4 },
  { categoryId: 'c4', categoryName: '混凝土', productCount: 18, totalQuantity: 1200, unit: '方', totalValue: 125000.00, percent: 0.12, warningCount: 1 },
  { categoryId: 'c5', categoryName: '装饰材料', productCount: 56, totalQuantity: 980, unit: '件', totalValue: 97450.00, percent: 0.10, warningCount: 2 },
])

const pendingTransferList = ref([
  { id: 't1', transferNo: 'DB202403240001', sourceWarehouseName: '华东工程仓', targetWarehouseName: '华南工程仓', productCount: 5, createdAt: '2024-03-24' },
  { id: 't2', transferNo: 'DB202403240002', sourceWarehouseName: '华北工程仓', targetWarehouseName: '华东工程仓', productCount: 3, createdAt: '2024-03-23' },
])

const transferVisible = ref(false)
const currentWarehouse = ref<any>(null)
const transferForm = reactive({
  targetWarehouseId: '',
  productIds: [] as string[],
  reason: '',
})

function getCapacityColor(ratio: number) {
  if (ratio >= 0.9) return '#F53F3F'
  if (ratio >= 0.7) return '#FF7D00'
  return '#165DFF'
}

function getBarHeight(value: number) {
  const max = Math.max(...trendData.value.map(t => Math.max(t.inQty, t.outQty)))
  return `${(value / max) * 100}%`
}

function handleExport() {
  Message.success('报表导出中...')
}

function handleViewWarehouse(record: any) {
  router.push({
    path: '/stock/warehouse-detail',
    query: { id: record.warehouseId }
  })
}

function handleTransfer(record: any) {
  currentWarehouse.value = record
  transferForm.targetWarehouseId = ''
  transferForm.productIds = []
  transferForm.reason = ''
  transferVisible.value = true
}

function handleTransferConfirm() {
  if (!transferForm.targetWarehouseId) {
    Message.warning('请选择调入仓库')
    return
  }
  if (transferForm.productIds.length === 0) {
    Message.warning('请选择调拨商品')
    return
  }
  if (!transferForm.reason.trim()) {
    Message.warning('请输入调拨原因')
    return
  }
  Message.success('调拨申请已提交')
  transferVisible.value = false
}

function handleViewWarning() {
  router.push({ path: '/stock/warehouse' })
}

function handleViewOutOfStock() {
  router.push({ path: '/stock/warehouse' })
}

function handleAlert(alert: any) {
  router.push({ path: '/stock/warehouse' })
}

function handleViewAllTransfer() {
  router.push('/stock/transfer')
}

function handleApproveTransfer(record: any) {
  router.push({ path: '/stock/transfer', query: { id: record.id } })
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  :deep(.arco-statistic-title) {
    font-size: 13px;
    color: var(--color-text-2);
  }
  
  :deep(.arco-statistic-value) {
    font-size: 24px;
    font-weight: 600;
  }
  
  .stat-footer {
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-3);
    display: flex;
    gap: 12px;
    
    .active {
      color: var(--color-success);
    }
    
    .inactive {
      color: var(--color-text-4);
    }
    
    .locked {
      color: var(--color-warning);
    }
  }
}

.stat-icon {
  font-size: 20px;
  margin-right: 6px;
  color: var(--color-primary);
}

.value-icon {
  color: var(--color-success);
}

.warning-icon {
  color: var(--color-warning);
}

.danger-icon {
  color: var(--color-danger);
}

.warning-card {
  border-left: 3px solid var(--color-warning);
}

.danger-card {
  border-left: 3px solid var(--color-danger);
}

.table-card {
  margin-bottom: 16px;
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
  }
  
  .warehouse-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    
    .manager {
      font-size: 12px;
      color: var(--color-text-3);
    }
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

.high-turnover {
  color: var(--color-warning);
}

.zero {
  color: var(--color-text-4);
}

.alert-card {
  margin-bottom: 16px;
  max-height: 320px;
  
  .alert-list {
    max-height: 240px;
    overflow-y: auto;
  }
  
  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--color-fill-1);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.warning {
      background: rgba(255, 125, 0, 0.1);
      
      .alert-icon {
        color: var(--color-warning);
      }
    }
    
    &.danger {
      background: rgba(245, 63, 63, 0.1);
      
      .alert-icon {
        color: var(--color-danger);
      }
    }
    
    &.info {
      background: rgba(22, 93, 255, 0.1);
      
      .alert-icon {
        color: var(--color-primary);
      }
    }
    
    .alert-icon {
      font-size: 18px;
      margin-top: 2px;
    }
    
    .alert-content {
      flex: 1;
      min-width: 0;
      
      .alert-title {
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 4px;
      }
      
      .alert-desc {
        font-size: 12px;
        color: var(--color-text-2);
        margin-bottom: 4px;
      }
      
      .alert-meta {
        font-size: 11px;
        color: var(--color-text-4);
        display: flex;
        gap: 8px;
      }
    }
  }
}

.trend-card {
  margin-bottom: 16px;
}

.trend-chart {
  padding: 16px 0;
}

.trend-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  padding-bottom: 30px;
}

.trend-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.trend-bar {
  width: 14px;
  background: var(--color-primary);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s;
  
  .bar-value {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: var(--color-text-3);
    white-space: nowrap;
  }
}

.out-bar {
  background: var(--color-success);
}

.trend-label {
  font-size: 11px;
  color: var(--color-text-3);
  margin-top: 6px;
}

.trend-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-2);
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    
    &.in {
      background: var(--color-primary);
    }
    
    &.out {
      background: var(--color-success);
    }
  }
}

.trend-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-1);
  
  .summary-item {
    text-align: center;
    
    .label {
      font-size: 12px;
      color: var(--color-text-3);
      display: block;
      margin-bottom: 4px;
    }
    
    .value {
      font-weight: 600;
      font-size: 14px;
      
      &.in {
        color: var(--color-primary);
      }
      
      &.out {
        color: var(--color-success);
      }
    }
  }
}

.category-card {
  margin-top: 16px;
}

.transfer-card {
  margin-top: 16px;
}

.warehouse-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  
  &.out {
    background: rgba(245, 63, 63, 0.1);
    color: var(--color-danger);
  }
  
  &.in {
    background: rgba(0, 180, 42, 0.1);
    color: var(--color-success);
  }
}
</style>
