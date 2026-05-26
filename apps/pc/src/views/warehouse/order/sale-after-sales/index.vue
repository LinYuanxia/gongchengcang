<template>
  <div class="sale-after-sales">
    <a-card>
      <div class="filter-bar">
        <a-row :gutter="16">
          <a-col :span="5">
            <a-input-search v-model="searchForm.afterSalesNo" placeholder="售后单号" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="5">
            <a-input-search v-model="searchForm.originalOrderNo" placeholder="原订单号" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="6">
            <a-range-picker v-model="searchForm.applyDateRange" format="YYYY-MM-DD" placeholder="申请时间" style="width: 100%" />
          </a-col>
          <a-col :span="4" style="text-align: right">
            <a-space>
              <a-button type="primary" @click="handleSearch"><template #icon><icon-search /></template>查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <a-tabs v-model:active-key="activeTab" class="status-tabs" @change="handleStatusChange">
        <a-tab-pane key="all" :title="`全部 (${statusStats.allCount})`" />
        <a-tab-pane key="pending" :title="`待审核 (${statusStats.pendingCount})`" />
        <a-tab-pane key="approved" :title="`已通过 (${statusStats.approvedCount})`" />
        <a-tab-pane key="rejected" :title="`已驳回 (${statusStats.rejectedCount})`" />
        <a-tab-pane key="completed" :title="`已完成 (${statusStats.completedCount})`" />
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="{ pageSize: 10 }" row-key="id" style="margin-top: 16px">
        <template #columns>
          <a-table-column title="售后单号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.afterSalesNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="原订单号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewOriginalOrder(record)">{{ record.originalOrderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="买家信息" :width="160">
            <template #cell="{ record }">
              <div>{{ record.buyerName }}</div>
              <div class="text-gray">{{ record.buyerPhone }}</div>
            </template>
          </a-table-column>
          <a-table-column title="所属仓库" data-index="warehouseName" :width="140" />
          <a-table-column title="售后类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.afterSalesType === 'logistics' ? 'orange' : 'red'">
                {{ record.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="售后商品数" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.items.length }}种
            </template>
          </a-table-column>
          <a-table-column title="售后商品库存" :width="120" align="center">
            <template #cell="{ record }">
              {{ record.afterSalesType === 'quality' ? '-' : record.totalStockQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="售后原因" data-index="reason" :width="160" ellipsis />
          <a-table-column title="售后图片" :width="100" align="center">
            <template #cell="{ record }">
              <a-image
                v-if="record.images && record.images.length > 0"
                :src="record.images[0]"
                :width="40"
                :height="40"
                style="border-radius: 4px; cursor: pointer"
                :preview="true"
              />
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="售后状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="160" />
          <a-table-column title="处理时间" :width="160">
            <template #cell="{ record }">
              {{ record.processTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>

                <a-link
                  v-if="record.afterSalesType === 'logistics' && record.status === 'approved'"
                  type="primary"
                  @click="handleReissue(record)"
                >补发</a-link>

                <a-link
                  v-if="record.afterSalesType === 'quality' && record.status === 'approved'"
                  type="primary"
                  @click="handleComplete(record)"
                >完成</a-link>

                <a-link
                  v-if="record.reissueOrderNo"
                  @click="handleViewReissueOrder(record)"
                >查看售后订单</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="completeModalVisible"
      title="完成售后"
      :width="500"
      @ok="handleCompleteSubmit"
      @cancel="completeModalVisible = false"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="售后单号">{{ currentOrder.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="currentOrder.afterSalesType === 'logistics' ? 'orange' : 'red'">
            {{ currentOrder.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      <a-form :model="completeForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="完成时间" required>
          <a-date-picker 
            v-model="completeForm.completeTime" 
            placeholder="请选择完成时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="完成原因" required>
          <a-textarea v-model="completeForm.reason" placeholder="请输入完成原因" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="reissueModalVisible"
      title="补发商品"
      :width="1000"
      @ok="handleReissueSubmit"
      @cancel="cancelReissue"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>补发后将在销售订单中生成补发订单，关联原订单和售后单</div>
        </template>
      </a-alert>

      <a-form :model="reissueForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="补发货仓库" required>
              <a-select v-model="reissueForm.warehouseId" placeholder="请选择发货仓库">
                <a-option value="wh001">深圳湾科技园主仓</a-option>
                <a-option value="wh002">福田CBD分仓</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-divider>补发商品明细</a-divider>

      <a-table :data="currentOrder.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
          <a-table-column title="售后数量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="补发库存输入" :width="180">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.reissueQuantity"
                :min="1"
                :max="record.quantity * 10"
                :precision="0"
                style="width: 140px"
                placeholder="输入补发数量"
              />
            </template>
          </a-table-column>
          <a-table-column title="批次号" :width="150">
            <template #cell="{ record }">
              <a-select
                v-model="record.batchNo"
                placeholder="选择批次"
                style="width: 100%"
              >
                <a-option v-for="batch in getAvailableBatches(record)" :key="batch.batchNo" :value="batch.batchNo">
                  {{ batch.batchNo }} (可用: {{ batch.currentStock }})
                </a-option>
              </a-select>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const activeTab = ref('all')

const searchForm = reactive({
  afterSalesNo: '',
  originalOrderNo: '',
  applyDateRange: [] as any[],
})

const orders = ref([
  {
    id: '1',
    afterSalesNo: 'AS202405180001',
    originalOrderNo: 'SO202405180001',
    buyerName: '杭州西湖店',
    buyerPhone: '138****1234',
    warehouseName: '深圳湾科技园主仓',
    afterSalesType: 'logistics',
    reason: '物流损坏',
    status: 'pending',
    applyTime: '2024-05-18 10:30:00',
    processTime: '',
    totalStockQuantity: 5,
    images: ['https://picsum.photos/100/100'],
    items: [
      { productName: '螺纹钢HRB400E Φ16 6m', spec: 'Φ16 6m', unit: '吨', quantity: 3 },
    ],
  },
  {
    id: '2',
    afterSalesNo: 'AS202405180002',
    originalOrderNo: 'SO202405180002',
    buyerName: '深圳南山店',
    buyerPhone: '139****5678',
    warehouseName: '福田CBD分仓',
    afterSalesType: 'quality',
    reason: '质量问题',
    status: 'approved',
    applyTime: '2024-05-18 11:00:00',
    processTime: '2024-05-18 14:00:00',
    totalStockQuantity: 0,
    images: ['https://picsum.photos/100/100'],
    items: [
      { productName: '水泥PO42.5', spec: 'PO42.5', unit: '袋', quantity: 10 },
    ],
  },
  {
    id: '3',
    afterSalesNo: 'AS202405180003',
    originalOrderNo: 'SO202405180003',
    buyerName: '广州天河店',
    buyerPhone: '137****9012',
    warehouseName: '深圳湾科技园主仓',
    afterSalesType: 'logistics',
    reason: '物流延迟',
    status: 'completed',
    applyTime: '2024-05-17 09:00:00',
    processTime: '2024-05-17 16:00:00',
    totalStockQuantity: 8,
    images: [],
    items: [
      { productName: '瓷砖800x800mm', spec: '800x800mm', unit: '块', quantity: 8 },
    ],
    reissueOrderNo: 'SO202405180004',
  },
  {
    id: '4',
    afterSalesNo: 'AS202405190001',
    originalOrderNo: 'SO202405190001',
    buyerName: '上海浦东店',
    buyerPhone: '136****4567',
    warehouseName: '深圳湾科技园主仓',
    afterSalesType: 'logistics',
    reason: '货物丢失',
    status: 'approved',
    applyTime: '2024-05-19 09:00:00',
    processTime: '2024-05-19 11:30:00',
    totalStockQuantity: 20,
    images: [],
    items: [
      { productName: '铝合金型材', spec: '6063-T5', unit: '支', quantity: 5 },
    ],
  },
  {
    id: '5',
    afterSalesNo: 'AS202405190002',
    originalOrderNo: 'SO202405190002',
    buyerName: '成都天府店',
    buyerPhone: '135****8901',
    warehouseName: '福田CBD分仓',
    afterSalesType: 'logistics',
    reason: '包装破损',
    status: 'approved',
    applyTime: '2024-05-19 14:00:00',
    processTime: '2024-05-19 16:00:00',
    totalStockQuantity: 15,
    images: ['https://picsum.photos/100/100'],
    items: [
      { productName: 'PVC排水管', spec: 'DN110', unit: '米', quantity: 10 },
    ],
  },
  {
    id: '6',
    afterSalesNo: 'AS202405200001',
    originalOrderNo: 'SO202405200001',
    buyerName: '武汉光谷店',
    buyerPhone: '134****2345',
    warehouseName: '深圳湾科技园主仓',
    afterSalesType: 'logistics',
    reason: '运输过程中损坏',
    status: 'approved',
    applyTime: '2024-05-20 10:00:00',
    processTime: '2024-05-20 13:00:00',
    totalStockQuantity: 50,
    images: ['https://picsum.photos/100/100'],
    items: [
      { productName: '玻璃胶', spec: '中性硅酮', unit: '支', quantity: 20 },
    ],
  },
  {
    id: '7',
    afterSalesNo: 'AS202405200002',
    originalOrderNo: 'SO202405200002',
    buyerName: '重庆江北店',
    buyerPhone: '133****6789',
    warehouseName: '福田CBD分仓',
    afterSalesType: 'logistics',
    reason: '错发货物',
    status: 'rejected',
    applyTime: '2024-05-20 15:00:00',
    processTime: '2024-05-20 17:00:00',
    totalStockQuantity: 30,
    images: [],
    items: [
      { productName: '防水涂料', spec: 'JS聚合物', unit: '桶', quantity: 5 },
    ],
  },
  {
    id: '8',
    afterSalesNo: 'AS202405210001',
    originalOrderNo: 'SO202405210001',
    buyerName: '西安雁塔店',
    buyerPhone: '132****0123',
    warehouseName: '深圳湾科技园主仓',
    afterSalesType: 'logistics',
    reason: '物流延迟超过72小时',
    status: 'approved',
    applyTime: '2024-05-21 08:30:00',
    processTime: '2024-05-21 10:00:00',
    totalStockQuantity: 100,
    images: [],
    items: [
      { productName: '木工板', spec: '18mm E1级', unit: '张', quantity: 15 },
    ],
  },
])

const filteredOrders = computed(() => {
  let result = orders.value

  if (searchForm.afterSalesNo) {
    result = result.filter(o => o.afterSalesNo.includes(searchForm.afterSalesNo))
  }

  if (searchForm.originalOrderNo) {
    result = result.filter(o => o.originalOrderNo.includes(searchForm.originalOrderNo))
  }

  if (searchForm.applyDateRange && searchForm.applyDateRange.length === 2) {
    result = result.filter(o => {
      const applyTime = new Date(o.applyTime).getTime()
      return applyTime >= searchForm.applyDateRange[0].getTime() && 
             applyTime <= searchForm.applyDateRange[1].getTime()
    })
  }

  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }

  return result
})

const statusStats = computed(() => {
  const allCount = orders.value.length
  const pendingCount = orders.value.filter(o => o.status === 'pending').length
  const approvedCount = orders.value.filter(o => o.status === 'approved').length
  const rejectedCount = orders.value.filter(o => o.status === 'rejected').length
  const completedCount = orders.value.filter(o => o.status === 'completed').length

  return { allCount, pendingCount, approvedCount, rejectedCount, completedCount }
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    completed: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    completed: '已完成',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.success('查询成功')
}

function handleReset() {
  searchForm.afterSalesNo = ''
  searchForm.originalOrderNo = ''
  searchForm.applyDateRange = []
  activeTab.value = 'all'
}

function handleStatusChange() {}

function handleViewDetail(record: any) {
  router.push({ name: 'WarehouseSaleAfterSalesDetail', params: { id: record.id } })
}

function handleViewOriginalOrder(record: any) {
  router.push(`/warehouse/order/sale/detail/${record.originalOrderNo}`)
}

const completeModalVisible = ref(false)
const currentOrder = ref<any>({})
const completeForm = reactive({
  completeTime: '',
  reason: '',
})

function handleComplete(record: any) {
  currentOrder.value = record
  completeForm.completeTime = new Date().toISOString().slice(0, 10)
  completeForm.reason = ''
  completeModalVisible.value = true
}

function handleCompleteSubmit() {
  if (!completeForm.completeTime) {
    Message.warning('请选择完成时间')
    return
  }
  if (!completeForm.reason) {
    Message.warning('请输入完成原因')
    return
  }

  const order = orders.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'completed'
    order.processTime = new Date().toLocaleString()
  }

  completeModalVisible.value = false
  Message.success('售后已完成')
}

const reissueModalVisible = ref(false)
const reissueForm = reactive({
  warehouseId: '',
})

function handleReissue(record: any) {
  currentOrder.value = record
  reissueForm.warehouseId = ''
  reissueModalVisible.value = true
}

function handleReissueSubmit() {
  if (!reissueForm.warehouseId) {
    Message.warning('请选择补发仓库')
    return
  }

  const order = orders.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'completed'
    order.processTime = new Date().toLocaleString()
    order.reissueOrderNo = 'SO' + new Date().getTime()
  }

  reissueModalVisible.value = false
  Message.success('补发成功，已生成补发订单')
}

function cancelReissue() {
  reissueModalVisible.value = false
}

function getAvailableBatches(item: any) {
  return [
    { batchNo: 'B001', currentStock: 50 },
    { batchNo: 'B002', currentStock: 30 },
  ]
}

function handleViewReissueOrder(record: any) {
  router.push(`/warehouse/order/sale/detail/${record.reissueOrderNo}`)
}
</script>

<style scoped>
.sale-after-sales {
  padding: 0;
}

.filter-bar {
  margin-bottom: 16px;
}

.text-gray {
  color: var(--color-text-3);
  font-size: 12px;
}
</style>