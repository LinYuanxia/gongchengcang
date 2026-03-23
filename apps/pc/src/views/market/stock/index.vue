<template>
  <div class="page-container">
    <a-row :gutter="16">
      <a-col :span="18">
        <a-card :bordered="false">
          <template #title>
            <span>工程仓库存管理</span>
          </template>
          <template #extra>
            <a-space>
              <a-button @click="handleExport">
                <template #icon><icon-download /></template>
                导出
              </a-button>
            </a-space>
          </template>

          <div class="table-actions">
            <a-space>
              <a-input-search
                v-model="searchForm.keyword"
                placeholder="搜索商品名称/编码"
                style="width: 240px"
                @search="handleSearch"
              />
              <a-select v-model="searchForm.warehouseId" placeholder="仓库" style="width: 160px" allow-clear>
                <a-option v-for="item in warehouseList" :key="item.id" :value="item.id">
                  {{ item.name }}
                </a-option>
              </a-select>
              <a-cascader
                v-model="searchForm.categoryId"
                :options="categoryTree"
                placeholder="商品分类"
                style="width: 180px"
                allow-clear
                :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
              />
              <a-select v-model="searchForm.stockStatus" placeholder="库存状态" style="width: 120px" allow-clear>
                <a-option value="normal">正常</a-option>
                <a-option value="warning">预警</a-option>
                <a-option value="critical">紧张</a-option>
                <a-option value="out">缺货</a-option>
              </a-select>
            </a-space>
          </div>

          <a-table
            :data="filteredStocks"
            :loading="loading"
            :pagination="pagination"
            row-key="id"
            @page-change="handlePageChange"
          >
            <template #columns>
              <a-table-column title="商品信息" :width="280">
                <template #cell="{ record }">
                  <div class="product-info">
                    <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
                    <div class="product-detail">
                      <div class="product-name">{{ record.skuName }}</div>
                      <div class="product-code">{{ record.skuCode }}</div>
                      <div class="product-spec">
                        <a-tag v-for="(value, key) in record.specs" :key="key" size="small">{{ value }}</a-tag>
                      </div>
                    </div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="分类" data-index="categoryName" :width="100" />
              <a-table-column title="仓库" :width="120">
                <template #cell="{ record }">
                  {{ record.warehouseName }}
                </template>
              </a-table-column>
              <a-table-column title="库存数量" :width="140">
                <template #cell="{ record }">
                  <div class="stock-info">
                    <span :class="getStockClass(record)">{{ record.quantity }} {{ record.unit }}</span>
                    <div class="stock-detail">
                      可用: {{ record.availableQty }} | 锁定: {{ record.lockedQty }}
                    </div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="安全库存" :width="100">
                <template #cell="{ record }">
                  <a-button type="text" size="small" @click="handleSetSafetyStock(record)">
                    {{ record.safetyStock }} {{ record.unit }}
                  </a-button>
                </template>
              </a-table-column>
              <a-table-column title="库存状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getStockStatusColor(record)">
                    {{ getStockStatusText(record) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="库位" :width="100">
                <template #cell="{ record }">
                  {{ record.location || '-' }}
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="150" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleViewRecord(record)">库存记录</a-button>
                    <a-button type="text" size="small" @click="handleSetSafetyStock(record)">设置预警</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card :bordered="false" class="alert-card">
          <template #title>
            <span>库存预警</span>
          </template>
          <template #extra>
            <a-link @click="handleViewAllAlerts">查看全部</a-link>
          </template>

          <div class="alert-stats">
            <a-row :gutter="12">
              <a-col :span="8">
                <a-statistic title="预警" :value="alertStats.warning" class="stat-warning" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="紧张" :value="alertStats.critical" class="stat-critical" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="缺货" :value="alertStats.outOfStock" class="stat-out" />
              </a-col>
            </a-row>
          </div>

          <a-divider />

          <div class="alert-list">
            <div v-if="alertList.length === 0" class="no-alert">
              <icon-check-circle-fill class="icon-success" />
              <span>暂无库存预警</span>
            </div>
            <div v-for="alert in alertList" :key="alert.id" class="alert-item">
              <div class="alert-header">
                <a-tag :color="getAlertLevelColor(alert.alertLevel)" size="small">
                  {{ getAlertLevelText(alert.alertLevel) }}
                </a-tag>
                <span class="alert-time">{{ formatTime(alert.alertTime) }}</span>
              </div>
              <div class="alert-content">
                <div class="alert-name">{{ alert.skuName }}</div>
                <div class="alert-stock">
                  当前: {{ alert.currentStock }} {{ alert.unit }} / 安全: {{ alert.safetyStock }} {{ alert.unit }}
                </div>
              </div>
              <div class="alert-actions">
                <a-button type="text" size="small" @click="handleQuickPurchase(alert)">快速补货</a-button>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-modal
      v-model:visible="safetyStockVisible"
      title="设置安全库存"
      :width="400"
      @ok="handleSafetyStockConfirm"
    >
      <a-form :model="safetyStockForm" layout="vertical">
        <a-descriptions :column="1" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="商品名称">{{ currentStock?.skuName }}</a-descriptions-item>
          <a-descriptions-item label="当前库存">{{ currentStock?.quantity }} {{ currentStock?.unit }}</a-descriptions-item>
        </a-descriptions>
        <a-form-item label="安全库存" required>
          <a-input-number v-model="safetyStockForm.safetyStock" :min="0" style="width: 100%">
            <template #suffix>{{ currentStock?.unit }}</template>
          </a-input-number>
          <div class="form-tip">当库存低于安全库存时，系统将发出预警提醒</div>
        </a-form-item>
        <a-form-item label="库位">
          <a-input v-model="safetyStockForm.location" placeholder="请输入库位" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="recordVisible"
      :title="`${currentStock?.skuName || ''} - 库存记录`"
      :width="800"
      :footer="false"
    >
      <a-table :data="stockRecords" :pagination="{ pageSize: 10 }">
        <template #columns>
          <a-table-column title="时间" :width="160">
            <template #cell="{ record }">
              {{ record.createdAt }}
            </template>
          </a-table-column>
          <a-table-column title="类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'in' ? 'green' : 'red'">
                {{ record.type === 'in' ? '入库' : '出库' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="数量变化" :width="120">
            <template #cell="{ record }">
              <span :class="record.type === 'in' ? 'text-success' : 'text-danger'">
                {{ record.type === 'in' ? '+' : '-' }}{{ record.quantity }} {{ record.unit }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="变更前" :width="100">
            <template #cell="{ record }">
              {{ record.beforeQty }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="变更后" :width="100">
            <template #cell="{ record }">
              {{ record.afterQty }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="关联单号" :width="140">
            <template #cell="{ record }">
              <a-link v-if="record.orderNo">{{ record.orderNo }}</a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="150">
            <template #cell="{ record }">
              {{ record.remark || '-' }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="allAlertsVisible"
      title="库存预警列表"
      :width="900"
      :footer="false"
    >
      <a-table :data="allAlertList" :pagination="{ pageSize: 10 }">
        <template #columns>
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div>
                <div>{{ record.skuName }}</div>
                <div class="sub-text">{{ record.skuCode }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="仓库" data-index="warehouseName" :width="120" />
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="当前库存" :width="100">
            <template #cell="{ record }">
              {{ record.currentStock }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="安全库存" :width="100">
            <template #cell="{ record }">
              {{ record.safetyStock }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="预警级别" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getAlertLevelColor(record.alertLevel)">
                {{ getAlertLevelText(record.alertLevel) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="预警时间" :width="160">
            <template #cell="{ record }">
              {{ record.alertTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleQuickPurchase(record)">快速补货</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { WarehouseStock, StockAlert, ProductCategory } from '@gongchengcang/types'

const loading = ref(false)

const searchForm = reactive({
  keyword: '',
  warehouseId: undefined as string | undefined,
  categoryId: undefined as string[] | undefined,
  stockStatus: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const warehouseList = ref([
  { id: 'w1', name: '华东工程仓' },
  { id: 'w2', name: '华南工程仓' },
  { id: 'w3', name: '华北工程仓' },
])

const categoryTree = ref<ProductCategory[]>([])

const safetyStockVisible = ref(false)
const currentStock = ref<WarehouseStock | null>(null)
const safetyStockForm = reactive({
  safetyStock: 0,
  location: '',
})

const recordVisible = ref(false)
const stockRecords = ref<any[]>([])

const allAlertsVisible = ref(false)

const mockStocks = ref<WarehouseStock[]>([
  {
    id: 'ws001',
    warehouseId: 'w1',
    warehouseName: '华东工程仓',
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '42.5' },
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    quantity: 500,
    availableQty: 480,
    lockedQty: 20,
    safetyStock: 100,
    batchNo: 'B20240115001',
    location: 'A-01-01',
    lastInTime: '2024-01-15 10:00:00',
    lastOutTime: '2024-01-15 14:00:00',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ws002',
    warehouseId: 'w1',
    warehouseName: '华东工程仓',
    skuId: 'sku002',
    skuCode: 'SKU-GC-002-16',
    skuName: '螺纹钢 HRB400 16mm',
    spuName: '螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '16mm' },
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    quantity: 80,
    availableQty: 75,
    lockedQty: 5,
    safetyStock: 100,
    batchNo: 'B20240114002',
    location: 'B-02-01',
    lastInTime: '2024-01-14 09:00:00',
    lastOutTime: '2024-01-15 11:00:00',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ws003',
    warehouseId: 'w1',
    warehouseName: '华东工程仓',
    skuId: 'sku003',
    skuCode: 'SKU-SS-003',
    skuName: '黄砂 中砂',
    spuName: '黄砂',
    categoryName: '砂石',
    specs: { '类型': '中砂' },
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    quantity: 50,
    availableQty: 45,
    lockedQty: 5,
    safetyStock: 200,
    location: 'C-01-01',
    lastInTime: '2024-01-13 08:00:00',
    lastOutTime: '2024-01-15 10:00:00',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ws004',
    warehouseId: 'w1',
    warehouseName: '华东工程仓',
    skuId: 'sku004',
    skuCode: 'SKU-SS-004',
    skuName: '碎石 5-31.5mm',
    spuName: '碎石',
    categoryName: '砂石',
    specs: { '粒径': '5-31.5mm' },
    mainImage: 'https://picsum.photos/200/200?random=4',
    unit: '方',
    quantity: 0,
    availableQty: 0,
    lockedQty: 0,
    safetyStock: 150,
    location: 'C-02-01',
    lastInTime: '2024-01-10 08:00:00',
    lastOutTime: '2024-01-14 16:00:00',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-14',
  },
  {
    id: 'ws005',
    warehouseId: 'w2',
    warehouseName: '华南工程仓',
    skuId: 'sku005',
    skuCode: 'SKU-HNT-005',
    skuName: '商品混凝土 C30',
    spuName: '商品混凝土',
    categoryName: '混凝土',
    specs: { '强度等级': 'C30' },
    mainImage: 'https://picsum.photos/200/200?random=5',
    unit: '方',
    quantity: 30,
    availableQty: 30,
    lockedQty: 0,
    safetyStock: 50,
    location: 'D-01-01',
    lastInTime: '2024-01-15 07:00:00',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
])

const alertList = computed(() => {
  return mockStocks.value
    .filter(s => s.quantity < s.safetyStock)
    .map(s => ({
      id: `alert-${s.id}`,
      warehouseId: s.warehouseId,
      warehouseName: s.warehouseName,
      skuId: s.skuId,
      skuCode: s.skuCode,
      skuName: s.skuName,
      categoryName: s.categoryName,
      unit: s.unit,
      currentStock: s.quantity,
      safetyStock: s.safetyStock,
      alertLevel: s.quantity === 0 ? 'out_of_stock' : s.quantity < s.safetyStock * 0.3 ? 'critical' : 'warning',
      alertTime: new Date().toLocaleString(),
      isHandled: false,
    }))
    .slice(0, 5)
})

const allAlertList = computed(() => {
  return mockStocks.value
    .filter(s => s.quantity < s.safetyStock)
    .map(s => ({
      id: `alert-${s.id}`,
      warehouseId: s.warehouseId,
      warehouseName: s.warehouseName,
      skuId: s.skuId,
      skuCode: s.skuCode,
      skuName: s.skuName,
      categoryName: s.categoryName,
      unit: s.unit,
      currentStock: s.quantity,
      safetyStock: s.safetyStock,
      alertLevel: s.quantity === 0 ? 'out_of_stock' : s.quantity < s.safetyStock * 0.3 ? 'critical' : 'warning',
      alertTime: new Date().toLocaleString(),
      isHandled: false,
    }))
})

const alertStats = computed(() => ({
  warning: allAlertList.value.filter(a => a.alertLevel === 'warning').length,
  critical: allAlertList.value.filter(a => a.alertLevel === 'critical').length,
  outOfStock: allAlertList.value.filter(a => a.alertLevel === 'out_of_stock').length,
}))

const filteredStocks = computed(() => {
  let result = mockStocks.value
  
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(s => 
      s.skuName.toLowerCase().includes(keyword) ||
      s.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (searchForm.warehouseId) {
    result = result.filter(s => s.warehouseId === searchForm.warehouseId)
  }
  
  if (searchForm.stockStatus) {
    result = result.filter(s => {
      const status = getStockStatusKey(s)
      return status === searchForm.stockStatus
    })
  }
  
  return result
})

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleExport() {
  Message.success('导出功能开发中')
}

function handleSetSafetyStock(record: WarehouseStock) {
  currentStock.value = record
  safetyStockForm.safetyStock = record.safetyStock
  safetyStockForm.location = record.location || ''
  safetyStockVisible.value = true
}

function handleSafetyStockConfirm() {
  if (currentStock.value) {
    const index = mockStocks.value.findIndex(s => s.id === currentStock.value!.id)
    if (index > -1) {
      mockStocks.value[index].safetyStock = safetyStockForm.safetyStock
      mockStocks.value[index].location = safetyStockForm.location
    }
    Message.success('安全库存设置成功')
  }
  safetyStockVisible.value = false
}

function handleViewRecord(record: WarehouseStock) {
  currentStock.value = record
  loadStockRecords(record)
  recordVisible.value = true
}

function loadStockRecords(record: WarehouseStock) {
  stockRecords.value = [
    {
      id: 'r1',
      type: 'out',
      quantity: 20,
      unit: record.unit,
      beforeQty: record.quantity + 20,
      afterQty: record.quantity,
      orderNo: 'SO202401150001',
      remark: '销售出库',
      createdAt: '2024-01-15 14:00:00',
    },
    {
      id: 'r2',
      type: 'in',
      quantity: 50,
      unit: record.unit,
      beforeQty: record.quantity - 30,
      afterQty: record.quantity + 20,
      orderNo: 'PO202401150001',
      remark: '采购入库',
      createdAt: '2024-01-15 10:00:00',
    },
    {
      id: 'r3',
      type: 'out',
      quantity: 30,
      unit: record.unit,
      beforeQty: record.quantity + 20,
      afterQty: record.quantity - 10,
      orderNo: 'SO202401140001',
      remark: '销售出库',
      createdAt: '2024-01-14 16:00:00',
    },
  ]
}

function handleViewAllAlerts() {
  allAlertsVisible.value = true
}

function handleQuickPurchase(alert: StockAlert) {
  Message.info(`正在为【${alert.skuName}】创建采购订单...`)
}

function getStockStatusKey(record: WarehouseStock) {
  if (record.quantity === 0) return 'out'
  if (record.quantity < record.safetyStock * 0.3) return 'critical'
  if (record.quantity < record.safetyStock) return 'warning'
  return 'normal'
}

function getStockClass(record: WarehouseStock) {
  const status = getStockStatusKey(record)
  const classMap: Record<string, string> = {
    normal: 'stock-normal',
    warning: 'stock-warning',
    critical: 'stock-critical',
    out: 'stock-out',
  }
  return classMap[status]
}

function getStockStatusColor(record: WarehouseStock) {
  const status = getStockStatusKey(record)
  const colorMap: Record<string, string> = {
    normal: 'green',
    warning: 'orange',
    critical: 'red',
    out: 'gray',
  }
  return colorMap[status]
}

function getStockStatusText(record: WarehouseStock) {
  const status = getStockStatusKey(record)
  const textMap: Record<string, string> = {
    normal: '正常',
    warning: '预警',
    critical: '紧张',
    out: '缺货',
  }
  return textMap[status]
}

function getAlertLevelColor(level: string) {
  const colorMap: Record<string, string> = {
    warning: 'orange',
    critical: 'red',
    out_of_stock: 'gray',
  }
  return colorMap[level] || 'gray'
}

function getAlertLevelText(level: string) {
  const textMap: Record<string, string> = {
    warning: '预警',
    critical: '紧张',
    out_of_stock: '缺货',
  }
  return textMap[level] || level
}

function formatTime(time: string) {
  return time.split(' ')[1] || time
}

onMounted(() => {
  pagination.total = mockStocks.value.length
})
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  margin-bottom: 16px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .product-detail {
    .product-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .product-code {
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 4px;
    }
    
    .product-spec {
      display: flex;
      gap: 4px;
    }
  }
}

.stock-info {
  .stock-detail {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}

.stock-normal {
  color: var(--color-success-6);
  font-weight: 500;
}

.stock-warning {
  color: var(--color-warning-6);
  font-weight: 500;
}

.stock-critical {
  color: var(--color-danger-6);
  font-weight: 500;
}

.stock-out {
  color: var(--color-text-3);
  font-weight: 500;
}

.alert-card {
  .alert-stats {
    margin-bottom: 16px;
    
    .stat-warning :deep(.arco-statistic-value) {
      color: var(--color-warning-6);
    }
    
    .stat-critical :deep(.arco-statistic-value) {
      color: var(--color-danger-6);
    }
    
    .stat-out :deep(.arco-statistic-value) {
      color: var(--color-text-3);
    }
  }
  
  .no-alert {
    text-align: center;
    padding: 24px 0;
    color: var(--color-text-3);
    
    .icon-success {
      font-size: 32px;
      color: var(--color-success-6);
      margin-bottom: 8px;
    }
  }
  
  .alert-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .alert-item {
    padding: 12px;
    border-bottom: 1px solid var(--color-border-2);
    
    &:last-child {
      border-bottom: none;
    }
    
    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .alert-time {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
    
    .alert-content {
      .alert-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .alert-stock {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
    
    .alert-actions {
      margin-top: 8px;
    }
  }
}

.text-success {
  color: var(--color-success-6);
}

.text-danger {
  color: var(--color-danger-6);
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}
</style>
