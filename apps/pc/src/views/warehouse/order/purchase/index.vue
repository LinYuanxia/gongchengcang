<template>
  <div class="purchase-order">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
          <a-button type="primary" @click="router.push('/warehouse/order/purchase/create')">
            <template #icon><icon-plus /></template>
            新建采购订单
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="all" title="全部订单" />
        <a-tab-pane key="pending" title="待确认" />
        <a-tab-pane key="confirmed" title="已确认" />
        <a-tab-pane key="shipping" title="发货中" />
        <a-tab-pane key="completed" title="已完成" />
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="pagination">
        <template #columns>
          <a-table-column title="订单编号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="平台订单号" :width="150">
            <template #cell="{ record }">
              <a-link>{{ record.platformOrderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="180" />
          <a-table-column title="商品数量" data-index="itemCount" :width="100" align="center" />
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="入库状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStockInStatusColor(record.stockInStatus)">
                {{ getStockInStatusText(record.stockInStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="付款状态" :width="100">
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
                <a-link v-if="record.status === 'pending'" @click="handleOpenConfirm(record)">确认</a-link>
                <a-link v-if="record.status === 'confirmed'" @click="handleStockIn(record)">入库</a-link>
                <a-link v-if="record.paymentStatus === 'unpaid'" @click="handlePay(record)">付款</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="confirmModalVisible"
      title="采购订单确认"
      :width="900"
      @ok="handleConfirm"
      @cancel="cancelConfirm"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        <template #message>
          <div>请确认每个商品的可供应数量，确认后将同步到采购计划中</div>
        </template>
      </a-alert>

      <a-form layout="vertical">
        <a-form-item label="确认明细" required>
          <a-table :data="confirmForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="180" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="单位" data-index="unit" :width="80" />
              <a-table-column title="采购数量" :width="100" align="right">
                <template #cell="{ record }">
                  {{ record.purchaseQuantity }}
                </template>
              </a-table-column>
              <a-table-column title="可确认数量" :width="160" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.confirmedQuantity"
                    :min="0"
                    :max="record.purchaseQuantity"
                    :precision="0"
                    style="width: 130px"
                  />
                </template>
              </a-table-column>
              <a-table-column title="差异数量" :width="120" align="right">
                <template #cell="{ record }">
                  <span :class="record.purchaseQuantity - record.confirmedQuantity !== 0 ? 'text-danger' : 'text-success'">
                    {{ record.purchaseQuantity - record.confirmedQuantity }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="备注" :width="150">
                <template #cell="{ record }">
                  <a-input
                    v-model="record.remark"
                    placeholder="缺货原因"
                    :max-length="50"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="确认备注">
          <a-textarea
            v-model="confirmForm.remark"
            placeholder="请输入确认备注（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>
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
  { id: '1', orderNo: 'PO202401150001', platformOrderNo: 'PL202401150001', supplierName: '广东建材有限公司', itemCount: 3, amount: '210,000.00', stockInStatus: 'completed', paymentStatus: 'paid', status: 'completed', createTime: '2024-01-15 10:30:00' },
  { id: '2', orderNo: 'PO202401150002', platformOrderNo: 'PL202401150002', supplierName: '上海钢材集团', itemCount: 2, amount: '820,000.00', stockInStatus: 'partial', paymentStatus: 'partial', status: 'shipping', createTime: '2024-01-15 14:20:00' },
  { id: '3', orderNo: 'PO202401150003', platformOrderNo: 'PL202401150003', supplierName: '惠州砂石厂', itemCount: 5, amount: '15,000.00', stockInStatus: 'none', paymentStatus: 'unpaid', status: 'confirmed', createTime: '2024-01-15 16:00:00' },
  { id: '4', orderNo: 'PO202401160001', platformOrderNo: 'PL202401160001', supplierName: '深圳混凝土公司', itemCount: 1, amount: '38,000.00', stockInStatus: 'none', paymentStatus: 'unpaid', status: 'pending', createTime: '2024-01-16 09:00:00' },
])

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeTab.value)
})

function getStockInStatusColor(status: string) {
  const colors: Record<string, string> = {
    none: 'gray',
    partial: 'orange',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStockInStatusText(status: string) {
  const texts: Record<string, string> = {
    none: '未入库',
    partial: '部分入库',
    completed: '已入库',
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
    unpaid: '未付款',
    partial: '部分付款',
    paid: '已付款',
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipping: 'cyan',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    shipping: '发货中',
    completed: '已完成',
  }
  return texts[status] || status
}

function handleExport() {
  if (orderList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${orderList.value.length} 条采购订单`)
}

function handleView(record: any) {
  router.push(`/warehouse/order/purchase/detail/${record.id}`)
}

const confirmModalVisible = ref(false)
const currentConfirmOrder = ref<any>(null)
const confirmForm = ref({
  items: [] as any[],
  remark: '',
})

function handleOpenConfirm(record: any) {
  currentConfirmOrder.value = record
  confirmForm.value = {
    items: [
      { id: '1', productName: '32.5级水泥', spec: '32.5级', unit: '吨', purchaseQuantity: 100, confirmedQuantity: 95, remark: '库存不足' },
      { id: '2', productName: '河沙', spec: '中粗', unit: '方', purchaseQuantity: 200, confirmedQuantity: 200, remark: '' },
      { id: '3', productName: '碎石', spec: '5-20mm', unit: '方', purchaseQuantity: 150, confirmedQuantity: 140, remark: '缺货' },
    ],
    remark: '',
  }
  confirmModalVisible.value = true
}

function handleConfirm() {
  if (currentConfirmOrder.value) {
    currentConfirmOrder.value.status = 'confirmed'
    currentConfirmOrder.value.confirmedCount = confirmForm.value.items.reduce((sum: number, item: any) => sum + item.confirmedQuantity, 0)
    currentConfirmOrder.value.purchaseCount = confirmForm.value.items.reduce((sum: number, item: any) => sum + item.purchaseQuantity, 0)
    Message.success(`订单 ${currentConfirmOrder.value.orderNo} 已确认`)
    confirmModalVisible.value = false
  }
}

function cancelConfirm() {
  confirmModalVisible.value = false
}

function handleStockIn(record: any) {
  Message.info(`入库操作：${record.orderNo}`)
}

function handlePay(record: any) {
  Message.info(`付款操作：${record.orderNo}`)
}
</script>

<style scoped lang="less">
.purchase-order {
  padding: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}
</style>
