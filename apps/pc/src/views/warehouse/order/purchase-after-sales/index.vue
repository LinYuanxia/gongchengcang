<template>
  <div class="purchase-after-sales">
    <a-card>
      <div class="filter-bar">
        <a-row :gutter="16">
          <a-col :span="5">
            <a-input-search v-model="searchForm.afterSalesNo" placeholder="售后单号" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="5">
            <a-input-search v-model="searchForm.originalOrderNo" placeholder="原订单号" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="5">
            <a-select 
              v-model="searchForm.supplierId" 
              placeholder="所属供应商" 
              style="width: 100%" 
              allow-clear
            >
              <a-option value="all">全部</a-option>
              <a-option value="sup001">华联建材</a-option>
              <a-option value="sup002">东方建材</a-option>
              <a-option value="sup003">中建建材</a-option>
            </a-select>
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
        <a-tab-pane key="applying" :title="`申请中 (${statusStats.applyingCount})`" />
        <a-tab-pane key="approved" :title="`已通过 (${statusStats.approvedCount})`" />
        <a-tab-pane key="rejected" :title="`已拒绝 (${statusStats.rejectedCount})`" />
        <a-tab-pane key="completed" :title="`已完成 (${statusStats.completedCount})`" />
        <a-tab-pane key="cancelled" :title="`已取消 (${statusStats.cancelledCount})`" />
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
          <a-table-column title="所属供应商" data-index="supplierName" :width="160" />
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
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>

                <a-link
                  v-if="record.status === 'applying'"
                  @click="handleCancel(record)"
                >取消售后</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="cancelModalVisible"
      title="取消售后"
      :width="500"
      @ok="handleCancelSubmit"
      @cancel="cancelModalVisible = false"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="售后单号">{{ currentOrder.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="currentOrder.afterSalesType === 'logistics' ? 'orange' : 'red'">
            {{ currentOrder.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      <a-form :model="cancelForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="取消原因" required>
          <a-textarea v-model="cancelForm.reason" placeholder="请输入取消原因" :rows="3" />
        </a-form-item>
      </a-form>
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
  supplierId: 'all',
  applyDateRange: [] as any[],
})

const orders = ref([
  {
    id: '1',
    afterSalesNo: 'AS202405180001',
    originalOrderNo: 'PO202405180001',
    supplierId: 'sup001',
    supplierName: '华联建材',
    afterSalesType: 'logistics',
    reason: '物流损坏',
    status: 'applying',
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
    originalOrderNo: 'PO202405180002',
    supplierId: 'sup002',
    supplierName: '东方建材',
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
    originalOrderNo: 'PO202405180003',
    supplierId: 'sup003',
    supplierName: '中建建材',
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
  },
  {
    id: '4',
    afterSalesNo: 'AS202405180004',
    originalOrderNo: 'PO202405180004',
    supplierId: 'sup001',
    supplierName: '华联建材',
    afterSalesType: 'quality',
    reason: '规格不符',
    status: 'cancelled',
    applyTime: '2024-05-16 10:00:00',
    processTime: '2024-05-16 12:00:00',
    totalStockQuantity: 0,
    images: [],
    items: [
      { productName: '钢筋HRB400', spec: 'Φ16mm', unit: '吨', quantity: 5 },
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

  if (searchForm.supplierId !== 'all') {
    result = result.filter(o => o.supplierId === searchForm.supplierId)
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
  const applyingCount = orders.value.filter(o => o.status === 'applying').length
  const approvedCount = orders.value.filter(o => o.status === 'approved').length
  const rejectedCount = orders.value.filter(o => o.status === 'rejected').length
  const completedCount = orders.value.filter(o => o.status === 'completed').length
  const cancelledCount = orders.value.filter(o => o.status === 'cancelled').length

  return { allCount, applyingCount, approvedCount, rejectedCount, completedCount, cancelledCount }
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    applying: 'orange',
    approved: 'green',
    rejected: 'red',
    completed: 'gray',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    applying: '申请中',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.success('查询成功')
}

function handleReset() {
  searchForm.afterSalesNo = ''
  searchForm.originalOrderNo = ''
  searchForm.supplierId = 'all'
  searchForm.applyDateRange = []
  activeTab.value = 'all'
}

function handleStatusChange() {}

function handleViewDetail(record: any) {
  router.push({ name: 'WarehousePurchaseAfterSalesDetail', params: { id: record.id } })
}

function handleViewOriginalOrder(record: any) {
  router.push(`/warehouse/order/purchase/detail/${record.originalOrderNo}`)
}

const cancelModalVisible = ref(false)
const currentOrder = ref<any>({})
const cancelForm = reactive({
  reason: '',
})

function handleCancel(record: any) {
  currentOrder.value = record
  cancelForm.reason = ''
  cancelModalVisible.value = true
}

function handleCancelSubmit() {
  if (!cancelForm.reason) {
    Message.warning('请输入取消原因')
    return
  }

  const order = orders.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'cancelled'
    order.processTime = new Date().toLocaleString()
  }

  cancelModalVisible.value = false
  Message.success('售后已取消')
}
</script>

<style scoped>
.purchase-after-sales {
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