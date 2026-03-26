<template>
  <div class="sale-order">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="all" title="全部订单" />
        <a-tab-pane key="pending" title="待发货" />
        <a-tab-pane key="shipping" title="发货中" />
        <a-tab-pane key="completed" title="已完成" />
        <a-tab-pane key="cancelled" title="已取消" />
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="pagination">
        <template #columns>
          <a-table-column title="订单编号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="施工方" data-index="customerName" :width="180" />
          <a-table-column title="商品数量" data-index="itemCount" :width="100" align="center" />
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="出库状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStockOutStatusColor(record.stockOutStatus)">
                {{ getStockOutStatusText(record.stockOutStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPaymentStatusColor(record.paymentStatus)">
                {{ getPaymentStatusText(record.paymentStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">详情</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleShip(record)">发货</a-link>
                <a-link v-if="record.paymentStatus === 'unpaid'" @click="handleCollect(record)">收款</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const activeTab = ref('all')

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const orders = ref([
  { id: '1', orderNo: 'SO202401150001', customerName: '深圳建筑工程公司', itemCount: 2, amount: '52,300.00', stockOutStatus: 'completed', paymentStatus: 'paid', status: 'completed', createTime: '2024-01-15 11:30:00' },
  { id: '2', orderNo: 'SO202401150002', customerName: '广州装饰工程公司', itemCount: 3, amount: '21,400.00', stockOutStatus: 'partial', paymentStatus: 'partial', status: 'shipping', createTime: '2024-01-15 15:20:00' },
  { id: '3', orderNo: 'SO202401150003', customerName: '东莞市政工程公司', itemCount: 1, amount: '12,800.00', stockOutStatus: 'none', paymentStatus: 'unpaid', status: 'pending', createTime: '2024-01-15 17:00:00' },
  { id: '4', orderNo: 'SO202401140001', customerName: '佛山建材批发商', itemCount: 5, amount: '85,000.00', stockOutStatus: 'completed', paymentStatus: 'paid', status: 'completed', createTime: '2024-01-14 10:00:00' },
])

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeTab.value)
})

function getStockOutStatusColor(status: string) {
  const colors: Record<string, string> = {
    none: 'gray',
    partial: 'orange',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStockOutStatusText(status: string) {
  const texts: Record<string, string> = {
    none: '未出库',
    partial: '部分出库',
    completed: '已出库',
  }
  return texts[status] || status
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    unpaid: 'red',
    partial: 'orange',
    paid: 'green',
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    unpaid: '未收款',
    partial: '部分收款',
    paid: '已收款',
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    shipping: 'blue',
    completed: 'green',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待发货',
    shipping: '发货中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function handleExport() {
  if (orderList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${orderList.value.length} 条销售订单`)
}

function handleView(record: any) {
  router.push(`/warehouse/order/sale/detail/${record.id}`)
}

function handleShip(record: any) {
  Message.info(`发货操作：${record.orderNo}`)
}

function handleCollect(record: any) {
  Message.info(`收款操作：${record.orderNo}`)
}
</script>

<style scoped lang="less">
.sale-order {
  padding: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}
</style>
