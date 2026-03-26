<template>
  <div class="order-detail">
    <a-page-header
      :title="`采购订单详情 - ${order.orderNo}`"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button v-if="order.status === 'shipped'" type="primary" @click="handleReceive">
            <template #icon><icon-check /></template>
            确认收货
          </a-button>
          <a-button v-if="['shipped', 'received'].includes(order.status)" @click="handleViewLogistics">
            <template #icon><icon-location /></template>
            物流跟踪
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card class="mt-16">
      <a-descriptions :column="4" bordered>
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span class="amount">¥{{ order.totalAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">
            {{ getStatusText(order.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPaymentStatusColor(order.paymentStatus)">
            {{ getPaymentStatusText(order.paymentStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="收货状态">
          <a-tag :color="getReceiveStatusColor(order.receiveStatus)">
            {{ getReceiveStatusText(order.receiveStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ order.paymentTime || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="商品信息" class="mt-16">
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" />
          <a-table-column title="采购数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="已发货数量" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.shippedQuantity < record.quantity ? 'text-warning' : 'text-success'">
                {{ record.shippedQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="已收货数量" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.receivedQuantity < record.shippedQuantity ? 'text-warning' : 'text-success'">
                {{ record.receivedQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="待收货数量" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">{{ (record.shippedQuantity || 0) - (record.receivedQuantity || 0) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.price?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.price)?.toLocaleString() }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-card title="发货记录" class="mt-16">
      <a-table :data="shipments" :pagination="false">
        <template #columns>
          <a-table-column title="发货单号" data-index="shipmentNo" :width="180" />
          <a-table-column title="发货时间" data-index="shipTime" :width="160" />
          <a-table-column title="物流公司" data-index="logisticsCompany" :width="120" />
          <a-table-column title="物流单号" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleTrackLogistics(record)">{{ record.logisticsNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="发货数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) }}
            </template>
          </a-table-column>
          <a-table-column title="收货状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getShipmentReceiveColor(record.receiveStatus)">
                {{ getShipmentReceiveText(record.receiveStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="入库单号" :width="180">
            <template #cell="{ record }">
              <a-link v-if="record.inboundNo" @click="handleViewInbound(record)">
                {{ record.inboundNo }}
              </a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link v-if="record.receiveStatus === 'pending'" @click="handleReceiveShipment(record)">
                  收货
                </a-link>
                <a-link @click="handleViewShipment(record)">详情</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-card title="入库记录" class="mt-16">
      <template #extra>
        <a-button @click="handleViewAllInbound">
          查看全部入库单
        </a-button>
      </template>

      <a-table :data="inboundRecords" :pagination="false">
        <template #columns>
          <a-table-column title="入库单号" data-index="inboundNo" :width="180" />
          <a-table-column title="入库时间" data-index="inboundTime" :width="160" />
          <a-table-column title="关联发货单" data-index="shipmentNo" :width="180" />
          <a-table-column title="入库类型" :width="100">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.inboundType }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="入库数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) }}
            </template>
          </a-table-column>
          <a-table-column title="入库状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getInboundStatusColor(record.status)">
                {{ getInboundStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作人" data-index="operator" :width="100" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-link @click="handleViewInboundDetail(record)">详情</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-card title="操作日志" class="mt-16">
      <a-timeline>
        <a-timeline-item v-for="(log, index) in order.logs" :key="index" :label="log.time">
          {{ log.content }}
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <a-modal
      v-model:visible="receiveModalVisible"
      title="确认收货"
      :width="800"
      @ok="handleReceiveConfirm"
      @cancel="cancelReceive"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        <template #message>
          <div>请仔细核对收货数量，确认后将生成入库单</div>
        </template>
      </a-alert>

      <a-form :model="receiveForm" layout="vertical">
        <a-form-item label="收货商品" required>
          <a-table :data="receiveForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="发货数量" :width="120" align="right">
                <template #cell="{ record }">
                  {{ record.shipQuantity }}
                </template>
              </a-table-column>
              <a-table-column title="实收数量" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.receiveQuantity"
                    :min="0"
                    :max="record.shipQuantity"
                    :precision="0"
                    style="width: 120px"
                  />
                </template>
              </a-table-column>
              <a-table-column title="差异数量" :width="120" align="right">
                <template #cell="{ record }">
                  <span :class="record.shipQuantity - record.receiveQuantity !== 0 ? 'text-danger' : 'text-success'">
                    {{ record.shipQuantity - record.receiveQuantity }}
                  </span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="入库仓库" required>
          <a-select v-model="receiveForm.warehouse" placeholder="请选择入库仓库" style="width: 300px">
            <a-option value="主仓库">主仓库</a-option>
            <a-option value="临时仓库">临时仓库</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="收货备注">
          <a-textarea
            v-model="receiveForm.remark"
            placeholder="请输入收货备注（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="logisticsModalVisible"
      title="物流跟踪"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="物流公司">{{ currentLogistics.company }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ currentLogistics.no }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-timeline>
        <a-timeline-item v-for="(trace, index) in logisticsTraces" :key="index" :label="trace.time">
          {{ trace.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill style="color: #00b42a" />
          </template>
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <a-modal
      v-model:visible="shipmentDetailVisible"
      title="发货单详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="发货单号">{{ currentShipment.shipmentNo }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ currentShipment.shipTime }}</a-descriptions-item>
        <a-descriptions-item label="物流公司">{{ currentShipment.logisticsCompany }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ currentShipment.logisticsNo }}</a-descriptions-item>
        <a-descriptions-item label="收货状态">
          <a-tag :color="getShipmentReceiveColor(currentShipment.receiveStatus)">
            {{ getShipmentReceiveText(currentShipment.receiveStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="入库单号">{{ currentShipment.inboundNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentShipment.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>发货商品</h4>
      <a-table :data="currentShipment.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column title="发货数量" data-index="quantity" align="right" />
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="inboundDetailVisible"
      title="入库单详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="入库单号">{{ currentInbound.inboundNo }}</a-descriptions-item>
        <a-descriptions-item label="入库时间">{{ currentInbound.inboundTime }}</a-descriptions-item>
        <a-descriptions-item label="入库类型">{{ currentInbound.inboundType }}</a-descriptions-item>
        <a-descriptions-item label="入库仓库">{{ currentInbound.warehouse }}</a-descriptions-item>
        <a-descriptions-item label="入库状态">
          <a-tag :color="getInboundStatusColor(currentInbound.status)">
            {{ getInboundStatusText(currentInbound.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentInbound.operator }}</a-descriptions-item>
        <a-descriptions-item label="关联发货单">{{ currentInbound.shipmentNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentInbound.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentInbound.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>入库商品</h4>
      <a-table :data="currentInbound.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column title="入库数量" data-index="quantity" align="right" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const order = ref({
  id: route.params.id || '1',
  orderNo: 'PO202401150001',
  supplierName: '广东建材有限公司',
  totalAmount: 205000,
  status: 'shipped',
  paymentStatus: 'paid',
  receiveStatus: 'partial',
  createTime: '2024-01-15 10:30:00',
  paymentTime: '2024-01-15 16:30:00',
  items: [
    {
      id: '1',
      productName: 'C30混凝土',
      spec: 'C30',
      unit: 'm³',
      quantity: 100,
      shippedQuantity: 50,
      receivedQuantity: 50,
      price: 380,
    },
    {
      id: '2',
      productName: '螺纹钢',
      spec: 'Φ20',
      unit: '吨',
      quantity: 50,
      shippedQuantity: 25,
      receivedQuantity: 0,
      price: 4200,
    },
    {
      id: '3',
      productName: '水泥',
      spec: 'P.O42.5',
      unit: '吨',
      quantity: 20,
      shippedQuantity: 0,
      receivedQuantity: 0,
      price: 500,
    },
  ],
  logs: [
    { time: '2024-01-16 14:30:00', content: '部分收货成功，生成入库单：IB202401160001' },
    { time: '2024-01-16 09:00:00', content: '供应商发货，物流：顺丰速运 SF1234567890' },
    { time: '2024-01-15 16:30:00', content: '订单支付成功' },
    { time: '2024-01-15 10:30:00', content: '订单创建成功' },
  ],
})

const shipments = ref([
  {
    id: '1',
    shipmentNo: 'SH202401160001',
    shipTime: '2024-01-16 09:00:00',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890',
    receiveStatus: 'partial',
    inboundNo: 'IB202401160001',
    remark: '',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 50 },
      { productName: '螺纹钢', spec: 'Φ20', quantity: 25 },
    ],
  },
])

const inboundRecords = ref([
  {
    id: '1',
    inboundNo: 'IB202401160001',
    inboundTime: '2024-01-16 14:30:00',
    shipmentNo: 'SH202401160001',
    orderNo: 'PO202401150001',
    inboundType: '采购入库',
    status: 'completed',
    warehouse: '主仓库',
    operator: '张三',
    remark: '',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 50 },
    ],
  },
])

const receiveModalVisible = ref(false)
const receiveForm = ref({
  items: [] as any[],
  warehouse: '主仓库',
  remark: '',
  shipmentId: '',
})

const logisticsModalVisible = ref(false)
const currentLogistics = ref<any>({})
const logisticsTraces = ref([
  { time: '2024-01-16 14:30', content: '快件已签收，签收人：张三，如有疑问请联系派送员：李师傅(13900139000)' },
  { time: '2024-01-16 10:20', content: '快件正在派送中，派送员：李师傅(13900139000)' },
  { time: '2024-01-16 08:15', content: '快件到达【深圳南山营业点】' },
  { time: '2024-01-15 22:30', content: '快件已发车' },
  { time: '2024-01-15 20:00', content: '快件已揽收' },
])

const shipmentDetailVisible = ref(false)
const currentShipment = ref<any>({})

const inboundDetailVisible = ref(false)
const currentInbound = ref<any>({})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'gray',
    paid: 'blue',
    shipped: 'cyan',
    received: 'green',
    completed: 'green',
    cancelled: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    received: '已收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'orange',
    paid: 'green',
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待支付',
    partial: '部分支付',
    paid: '已支付',
  }
  return texts[status] || status
}

function getReceiveStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'blue',
    received: 'green',
  }
  return colors[status] || 'gray'
}

function getReceiveStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待收货',
    partial: '部分收货',
    received: '已收货',
  }
  return texts[status] || status
}

function getShipmentReceiveColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'blue',
    received: 'green',
  }
  return colors[status] || 'gray'
}

function getShipmentReceiveText(status: string) {
  const texts: Record<string, string> = {
    pending: '待收货',
    partial: '部分收货',
    received: '已收货',
  }
  return texts[status] || status
}

function getInboundStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getInboundStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待入库',
    completed: '已入库',
  }
  return texts[status] || status
}

function handleBack() {
  router.back()
}

function handleReceive() {
  const pendingShipment = shipments.value.find(s => s.receiveStatus === 'pending' || s.receiveStatus === 'partial')
  if (pendingShipment) {
    handleReceiveShipment(pendingShipment)
  }
}

function handleReceiveShipment(record: any) {
  receiveForm.value.items = record.items.map((item: any) => ({
    ...item,
    shipQuantity: item.quantity,
    receiveQuantity: item.quantity,
  }))
  receiveForm.value.warehouse = '主仓库'
  receiveForm.value.remark = ''
  receiveForm.value.shipmentId = record.id
  receiveModalVisible.value = true
}

async function handleReceiveConfirm() {
  const hasItems = receiveForm.value.items.some(item => item.receiveQuantity > 0)
  if (!hasItems) {
    Message.warning('请至少确认一个商品收货')
    return
  }

  if (!receiveForm.value.warehouse) {
    Message.warning('请选择入库仓库')
    return
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const inboundNo = `IB${Date.now()}`
    const receivedItems = receiveForm.value.items.filter(item => item.receiveQuantity > 0)

    const shipment = shipments.value.find(s => s.id === receiveForm.value.shipmentId)
    if (shipment) {
      const allReceived = receiveForm.value.items.every(
        item => item.receiveQuantity >= item.shipQuantity
      )
      shipment.receiveStatus = allReceived ? 'received' : 'partial'
      shipment.inboundNo = inboundNo
    }

    order.value.items.forEach(item => {
      const receivedItem = receivedItems.find((r: any) => r.productName === item.productName)
      if (receivedItem) {
        item.receivedQuantity = (item.receivedQuantity || 0) + receivedItem.receiveQuantity
      }
    })

    const allReceived = order.value.items.every(
      item => (item.receivedQuantity || 0) >= (item.shippedQuantity || 0)
    )

    if (allReceived && order.value.items.every(item => (item.shippedQuantity || 0) >= item.quantity)) {
      order.value.receiveStatus = 'received'
      order.value.status = 'received'
    } else {
      order.value.receiveStatus = 'partial'
    }

    inboundRecords.value.unshift({
      id: Date.now().toString(),
      inboundNo,
      inboundTime: new Date().toLocaleString(),
      shipmentNo: shipment?.shipmentNo || '',
      orderNo: order.value.orderNo,
      inboundType: '采购入库',
      status: 'completed',
      warehouse: receiveForm.value.warehouse,
      operator: '当前用户',
      remark: receiveForm.value.remark,
      items: receivedItems.map((item: any) => ({
        productName: item.productName,
        spec: item.spec,
        quantity: item.receiveQuantity,
      })),
    })

    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: `收货成功，生成入库单：${inboundNo}`,
    })

    receiveModalVisible.value = false
    Message.success('收货成功，已生成入库单')
  } catch (error) {
    Message.error('收货失败，请重试')
  }
}

function cancelReceive() {
  receiveModalVisible.value = false
}

function handleViewLogistics() {
  if (shipments.value.length > 0) {
    handleTrackLogistics(shipments.value[0])
  }
}

function handleTrackLogistics(record: any) {
  currentLogistics.value = {
    company: record.logisticsCompany,
    no: record.logisticsNo,
  }
  logisticsModalVisible.value = true
}

function handleViewShipment(record: any) {
  currentShipment.value = record
  shipmentDetailVisible.value = true
}

function handleViewInbound(record: any) {
  const inbound = inboundRecords.value.find(i => i.inboundNo === record.inboundNo)
  if (inbound) {
    handleViewInboundDetail(inbound)
  }
}

function handleViewInboundDetail(record: any) {
  currentInbound.value = record
  inboundDetailVisible.value = true
}

function handleViewAllInbound() {
  router.push('/warehouse/stock/inbound')
}
</script>

<style scoped lang="less">
.order-detail {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.amount {
  color: #f53f3f;
  font-weight: 600;
}

.text-danger {
  color: #f53f3f;
}

.text-warning {
  color: #ff7d00;
}

.text-success {
  color: #00b42a;
}
</style>
