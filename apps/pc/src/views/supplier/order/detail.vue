<template>
  <div class="order-detail">
    <a-page-header
      :title="`订单详情 - ${order.orderNo}`"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button v-if="order.status === 'paid'" type="primary" @click="handleShip">
            <template #icon><icon-send /></template>
            发货
          </a-button>
          <a-button v-if="order.status === 'shipped'" @click="handleViewLogistics">
            <template #icon><icon-location /></template>
            物流跟踪
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card class="mt-16">
      <a-descriptions :column="4" bordered>
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
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
        <a-descriptions-item label="发货状态">
          <a-tag :color="getShipStatusColor(order.shipStatus)">
            {{ getShipStatusText(order.shipStatus) }}
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
          <a-table-column title="待发货数量" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">{{ record.quantity - (record.shippedQuantity || 0) }}</span>
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
      <template #extra>
        <a-button v-if="order.shipStatus === 'partial'" type="primary" @click="handleShip">
          继续发货
        </a-button>
      </template>

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
          <a-table-column title="发货状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getShipmentStatusColor(record.status)">
                {{ getShipmentStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="150" ellipsis />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewShipment(record)">详情</a-link>
              </a-space>
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
      v-model:visible="shipModalVisible"
      title="发货"
      :width="800"
      @ok="handleShipConfirm"
      @cancel="cancelShip"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>支持分批发货，可选择部分商品发货</div>
        </template>
      </a-alert>

      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="发货商品" required>
          <a-table :data="shipForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="待发货数量" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">{{ record.pendingQuantity }}</span>
                </template>
              </a-table-column>
              <a-table-column title="本次发货数量" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.shipQuantity"
                    :min="0"
                    :max="record.pendingQuantity"
                    :precision="0"
                    style="width: 120px"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-divider>物流信息</a-divider>

        <a-form-item label="物流公司" required>
          <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司" style="width: 300px">
            <a-option value="顺丰速运">顺丰速运</a-option>
            <a-option value="中通快递">中通快递</a-option>
            <a-option value="圆通速递">圆通速递</a-option>
            <a-option value="韵达快递">韵达快递</a-option>
            <a-option value="申通快递">申通快递</a-option>
            <a-option value="京东物流">京东物流</a-option>
            <a-option value="德邦快递">德邦快递</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="物流单号" required>
          <a-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" style="width: 300px" />
          <a-button type="text" @click="handleAddLogistics" style="margin-left: 8px">
            <template #icon><icon-plus /></template>
            添加物流单号
          </a-button>
        </a-form-item>

        <div v-if="shipForm.additionalLogistics.length > 0" style="margin-bottom: 16px">
          <div v-for="(logistics, index) in shipForm.additionalLogistics" :key="index" style="margin-bottom: 8px">
            <a-select v-model="logistics.company" placeholder="物流公司" style="width: 150px; margin-right: 8px">
              <a-option value="顺丰速运">顺丰速运</a-option>
              <a-option value="中通快递">中通快递</a-option>
              <a-option value="圆通速递">圆通速递</a-option>
              <a-option value="韵达快递">韵达快递</a-option>
              <a-option value="申通快递">申通快递</a-option>
              <a-option value="京东物流">京东物流</a-option>
              <a-option value="德邦快递">德邦快递</a-option>
            </a-select>
            <a-input v-model="logistics.no" placeholder="物流单号" style="width: 200px; margin-right: 8px" />
            <a-button type="text" status="danger" @click="handleRemoveLogistics(index)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>

        <a-form-item label="发货备注">
          <a-textarea
            v-model="shipForm.remark"
            placeholder="请输入发货备注（选填）"
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
        <a-descriptions-item label="发货状态">
          <a-tag :color="getShipmentStatusColor(currentShipment.status)">
            {{ getShipmentStatusText(currentShipment.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发货人">{{ currentShipment.operator }}</a-descriptions-item>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const order = ref({
  id: route.params.id || '1',
  orderNo: 'PO202401150001',
  warehouseName: '深圳湾科技园项目仓',
  totalAmount: 205000,
  status: 'paid',
  paymentStatus: 'paid',
  shipStatus: 'pending',
  createTime: '2024-01-15 10:30:00',
  paymentTime: '2024-01-15 16:30:00',
  items: [
    {
      id: '1',
      productName: 'C30混凝土',
      spec: 'C30',
      unit: 'm³',
      quantity: 100,
      shippedQuantity: 0,
      price: 380,
    },
    {
      id: '2',
      productName: '螺纹钢',
      spec: 'Φ20',
      unit: '吨',
      quantity: 50,
      shippedQuantity: 0,
      price: 4200,
    },
    {
      id: '3',
      productName: '水泥',
      spec: 'P.O42.5',
      unit: '吨',
      quantity: 20,
      shippedQuantity: 0,
      price: 500,
    },
  ],
  logs: [
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
    status: 'shipped',
    operator: '张三',
    remark: '',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 50 },
      { productName: '螺纹钢', spec: 'Φ20', quantity: 25 },
    ],
  },
])

const shipModalVisible = ref(false)
const shipForm = ref({
  items: [] as any[],
  logisticsCompany: '',
  logisticsNo: '',
  additionalLogistics: [] as any[],
  remark: '',
})

const logisticsModalVisible = ref(false)
const currentLogistics = ref<any>({})
const logisticsTraces = ref([
  { time: '2024-01-16 14:30', content: '快件已签收，签收人：前台，如有疑问请联系派送员：张师傅(13800138000)' },
  { time: '2024-01-16 10:20', content: '快件正在派送中，派送员：张师傅(13800138000)' },
  { time: '2024-01-16 08:15', content: '快件到达【深圳南山营业点】' },
  { time: '2024-01-15 22:30', content: '快件已发车' },
  { time: '2024-01-15 20:00', content: '快件已揽收' },
])

const shipmentDetailVisible = ref(false)
const currentShipment = ref<any>({})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'gray',
    paid: 'blue',
    shipped: 'cyan',
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

function getShipStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'blue',
    shipped: 'green',
  }
  return colors[status] || 'gray'
}

function getShipStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待发货',
    partial: '部分发货',
    shipped: '已发货',
  }
  return texts[status] || status
}

function getShipmentStatusColor(status: string) {
  const colors: Record<string, string> = {
    shipped: 'blue',
    in_transit: 'cyan',
    delivered: 'green',
  }
  return colors[status] || 'gray'
}

function getShipmentStatusText(status: string) {
  const texts: Record<string, string> = {
    shipped: '已发货',
    in_transit: '运输中',
    delivered: '已签收',
  }
  return texts[status] || status
}

function handleBack() {
  router.back()
}

function handleShip() {
  shipForm.value.items = order.value.items.map(item => ({
    ...item,
    pendingQuantity: item.quantity - (item.shippedQuantity || 0),
    shipQuantity: 0,
  }))
  shipForm.value.logisticsCompany = ''
  shipForm.value.logisticsNo = ''
  shipForm.value.additionalLogistics = []
  shipForm.value.remark = ''
  shipModalVisible.value = true
}

function handleAddLogistics() {
  shipForm.value.additionalLogistics.push({
    company: '',
    no: '',
  })
}

function handleRemoveLogistics(index: number) {
  shipForm.value.additionalLogistics.splice(index, 1)
}

async function handleShipConfirm() {
  const hasItems = shipForm.value.items.some(item => item.shipQuantity > 0)
  if (!hasItems) {
    Message.warning('请至少选择一个商品发货')
    return
  }

  if (!shipForm.value.logisticsCompany) {
    Message.warning('请选择物流公司')
    return
  }

  if (!shipForm.value.logisticsNo) {
    Message.warning('请输入物流单号')
    return
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const shipmentNo = `SH${Date.now()}`
    const shippedItems = shipForm.value.items
      .filter(item => item.shipQuantity > 0)
      .map(item => ({
        productName: item.productName,
        spec: item.spec,
        quantity: item.shipQuantity,
      }))

    order.value.items.forEach(item => {
      const shipItem = shipForm.value.items.find(s => s.id === item.id)
      if (shipItem) {
        item.shippedQuantity = (item.shippedQuantity || 0) + shipItem.shipQuantity
      }
    })

    const allShipped = order.value.items.every(
      item => item.shippedQuantity >= item.quantity
    )

    if (allShipped) {
      order.value.shipStatus = 'shipped'
      order.value.status = 'shipped'
    } else {
      order.value.shipStatus = 'partial'
    }

    shipments.value.unshift({
      id: Date.now().toString(),
      shipmentNo,
      shipTime: new Date().toLocaleString(),
      logisticsCompany: shipForm.value.logisticsCompany,
      logisticsNo: shipForm.value.logisticsNo,
      status: 'shipped',
      operator: '当前用户',
      remark: shipForm.value.remark,
      items: shippedItems,
    })

    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: `发货成功，发货单号：${shipmentNo}，物流：${shipForm.value.logisticsCompany} ${shipForm.value.logisticsNo}`,
    })

    shipModalVisible.value = false
    Message.success('发货成功')
  } catch (error) {
    Message.error('发货失败，请重试')
  }
}

function cancelShip() {
  shipModalVisible.value = false
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
