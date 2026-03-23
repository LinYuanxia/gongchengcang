<template>
  <div class="sale-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button v-if="order.status === 'pending'" type="primary" @click="handleShip">
            发货
          </a-button>
          <a-button v-if="order.status === 'shipping'" type="primary" @click="handleComplete">
            确认完成
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="订单信息">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">{{ order.statusText }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="order.paymentStatus === 'paid' ? 'green' : 'orange'">
            {{ order.paymentStatus === 'paid' ? '已支付' : '待支付' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="客户信息">
        <a-descriptions-item label="施工方">{{ order.customerName }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{ order.customerContact }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.customerPhone }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="收货信息">
        <a-descriptions-item label="收货地址" :span="2">{{ order.address }}</a-descriptions-item>
        <a-descriptions-item label="收货人">{{ order.receiverName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.receiverPhone }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="物流信息" v-if="order.status !== 'pending'">
        <a-descriptions-item label="物流公司">{{ order.logisticsCompany || '-' }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ order.logisticsNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ order.shipTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="发货仓库">{{ order.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>商品明细</h3>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品编码" data-index="productCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
          <a-table-column title="小计" :width="120" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ record.subtotal }}</span>
            </template>
          </a-table-column>
          <a-table-column title="出库状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.stockOutStatus === 'completed' ? 'green' : 'orange'" size="small">
                {{ record.stockOutStatus === 'completed' ? '已出库' : '待出库' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="order-summary">
        <a-descriptions :column="1" layout="inline-horizontal">
          <a-descriptions-item label="商品金额">
            <span class="price">¥{{ order.productAmount }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="运费">
            <span>¥{{ order.freight }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="订单总额">
            <span class="total-amount">¥{{ order.totalAmount }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <a-divider />

      <h3>订单进度</h3>
      <a-timeline>
        <a-timeline-item v-for="(log, index) in order.logs" :key="index" :label="log.time">
          {{ log.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill style="color: #00b42a" />
          </template>
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <a-modal v-model:visible="shipModalVisible" title="发货确认" @ok="handleShipSubmit">
      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="发货仓库" required>
          <a-select v-model="shipForm.warehouseId" placeholder="请选择发货仓库">
            <a-option value="wh001">深圳湾科技园主仓</a-option>
            <a-option value="wh002">福田CBD分仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="物流公司" required>
          <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司">
            <a-option value="顺丰速运">顺丰速运</a-option>
            <a-option value="京东物流">京东物流</a-option>
            <a-option value="自提">自提</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="物流单号">
          <a-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()
const shipModalVisible = ref(false)

const shipForm = ref({
  warehouseId: 'wh001',
  logisticsCompany: '',
  logisticsNo: '',
})

const order = ref({
  orderNo: 'SO202401150001',
  status: 'pending',
  statusText: '待发货',
  paymentStatus: 'paid',
  createTime: '2024-01-15 11:30:00',
  customerName: '深圳建筑工程公司',
  customerContact: '张经理',
  customerPhone: '13900139001',
  address: '广东省深圳市南山区科技园北区A栋',
  receiverName: '王工',
  receiverPhone: '13800138001',
  warehouseName: '-',
  logisticsCompany: '-',
  logisticsNo: '-',
  shipTime: '-',
  productAmount: '52,300.00',
  freight: '0.00',
  totalAmount: '52,300.00',
  items: [
    { productCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', price: 450, quantity: 100, unit: '袋', subtotal: '45,000.00', stockOutStatus: 'pending' },
    { productCode: 'SKU-HS-001', productName: '黄砂 中砂', spec: '中砂', price: 95, quantity: 77, unit: '方', subtotal: '7,315.00', stockOutStatus: 'pending' },
  ],
  logs: [
    { time: '2024-01-15 11:35', content: '客户完成支付' },
    { time: '2024-01-15 11:30', content: '客户下单成功' },
  ],
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    shipping: 'blue',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function handleShip() {
  shipModalVisible.value = true
}

function handleShipSubmit() {
  if (!shipForm.value.warehouseId || !shipForm.value.logisticsCompany) {
    Message.warning('请完善发货信息')
    return
  }
  Message.success('发货成功')
  order.value.status = 'shipping'
  order.value.statusText = '发货中'
  order.value.warehouseName = shipForm.value.warehouseId === 'wh001' ? '深圳湾科技园主仓' : '福田CBD分仓'
  order.value.logisticsCompany = shipForm.value.logisticsCompany
  order.value.logisticsNo = shipForm.value.logisticsNo || 'SF' + Date.now()
  order.value.shipTime = new Date().toLocaleString()
  order.value.items.forEach(item => {
    item.stockOutStatus = 'completed'
  })
  shipModalVisible.value = false
}

function handleComplete() {
  Message.success('订单完成')
  order.value.status = 'completed'
  order.value.statusText = '已完成'
}
</script>

<style scoped lang="less">
.sale-detail {
  padding: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #f53f3f;
}

.order-summary {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  text-align: right;
}
</style>
