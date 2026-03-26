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
          <a-table-column title="订单数量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="已发货数量" :width="120" align="center">
            <template #cell="{ record }">
              <span :class="record.shippedQuantity < record.quantity ? 'text-warning' : 'text-success'">
                {{ record.shippedQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="待发货数量" :width="120" align="center">
            <template #cell="{ record }">
              <span class="text-danger">{{ record.quantity - (record.shippedQuantity || 0) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
          <a-table-column title="小计" :width="120" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ record.subtotal }}</span>
            </template>
          </a-table-column>
          <a-table-column title="出库状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStockOutStatusColor(record.shippedQuantity, record.quantity)" size="small">
                {{ getStockOutStatusText(record.shippedQuantity, record.quantity) }}
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

      <h3>发货记录</h3>
      <a-table :data="shipmentRecords" :pagination="false">
        <template #columns>
          <a-table-column title="发货单号" data-index="shipmentNo" :width="180" />
          <a-table-column title="发货时间" data-index="shipTime" :width="160" />
          <a-table-column title="物流公司" data-index="logisticsCompany" :width="120" />
          <a-table-column title="物流单号" data-index="logisticsNo" :width="180" />
          <a-table-column title="发货数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items.reduce((sum: number, item: any) => sum + item.quantity, 0) }}
            </template>
          </a-table-column>
          <a-table-column title="发货状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'shipped' ? 'blue' : 'green'">
                {{ record.status === 'shipped' ? '已发货' : '已签收' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-link @click="handleViewShipment(record)">详情</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>

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

    <a-modal 
      v-model:visible="shipModalVisible" 
      title="发货确认" 
      :width="1000"
      @ok="handleShipSubmit"
      @cancel="cancelShip"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>支持精细化发货，可选择每个商品的批次库存进行发货</div>
        </template>
      </a-alert>

      <a-form :model="shipForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="发货仓库" required>
              <a-select v-model="shipForm.warehouseId" placeholder="请选择发货仓库">
                <a-option value="wh001">深圳湾科技园主仓</a-option>
                <a-option value="wh002">福田CBD分仓</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="物流公司" required>
              <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="自提">自提</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="物流单号">
              <a-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-divider>商品批次选择</a-divider>

      <a-collapse :default-active-key="shipForm.items.map((_, i) => i.toString())">
        <a-collapse-item 
          v-for="(item, index) in shipForm.items" 
          :key="index"
        >
          <template #header>
            <a-space>
              <span>{{ item.productName }}</span>
              <a-tag color="blue">待发货：{{ item.pendingQuantity }}</a-tag>
              <a-tag :color="item.totalSelected > 0 ? 'green' : 'orange'">
                已选：{{ item.totalSelected || 0 }}
              </a-tag>
            </a-space>
          </template>

          <a-alert 
            v-if="item.batches.length === 0" 
            type="warning" 
            style="margin-bottom: 16px"
          >
            <template #message>
              该商品暂无可用批次库存
            </template>
          </a-alert>

          <a-table 
            v-if="item.batches.length > 0"
            :data="item.batches" 
            :pagination="false"
          >
            <template #columns>
              <a-table-column title="选择" :width="60" align="center">
                <template #cell="{ record }">
                  <a-checkbox v-model="record.selected" />
                </template>
              </a-table-column>
              <a-table-column title="批次号" :width="150">
                <template #cell="{ record }">
                  <a-tag color="blue">{{ record.batchNo }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="入库日期" data-index="inboundDate" :width="120" />
              <a-table-column title="生产日期" data-index="productionDate" :width="120" />
              <a-table-column title="批次批注" data-index="remark" :width="200" ellipsis />
              <a-table-column title="可用库存" data-index="currentStock" :width="100" align="right">
                <template #cell="{ record }">
                  <span :class="record.currentStock < 10 ? 'text-danger' : 'text-success'">
                    {{ record.currentStock }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="发货数量" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.shipQuantity"
                    :min="0"
                    :max="record.currentStock"
                    :precision="0"
                    :disabled="!record.selected"
                    style="width: 120px"
                    @change="updateTotalSelected(item)"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div v-if="item.batches.length > 0" style="margin-top: 8px; text-align: right">
            <a-space>
              <span>批次总数：{{ item.batches.length }}</span>
              <span>已选批次：{{ item.batches.filter((b: any) => b.selected).length }}</span>
              <span>已选数量：{{ item.totalSelected || 0 }}</span>
              <span v-if="item.totalSelected !== item.pendingQuantity" class="text-danger">
                差异：{{ item.pendingQuantity - (item.totalSelected || 0) }}
              </span>
            </a-space>
          </div>
        </a-collapse-item>
      </a-collapse>

      <div style="margin-top: 16px; padding: 16px; background: var(--color-fill-1); border-radius: 4px">
        <a-descriptions :column="3">
          <a-descriptions-item label="商品种类">{{ shipForm.items.length }}</a-descriptions-item>
          <a-descriptions-item label="已选批次">
            {{ shipForm.items.reduce((sum, item) => sum + item.batches.filter((b: any) => b.selected).length, 0) }}
          </a-descriptions-item>
          <a-descriptions-item label="发货总数">
            {{ shipForm.items.reduce((sum, item) => sum + (item.totalSelected || 0), 0) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="shipmentDetailVisible"
      title="发货单详情"
      :width="800"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="发货单号">{{ currentShipment.shipmentNo }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ currentShipment.shipTime }}</a-descriptions-item>
        <a-descriptions-item label="物流公司">{{ currentShipment.logisticsCompany }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ currentShipment.logisticsNo }}</a-descriptions-item>
        <a-descriptions-item label="发货仓库">{{ currentShipment.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="发货状态">
          <a-tag :color="currentShipment.status === 'shipped' ? 'blue' : 'green'">
            {{ currentShipment.status === 'shipped' ? '已发货' : '已签收' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>发货商品批次明细</h4>
      <a-table :data="currentShipment.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="150" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="批次号" :width="150">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.batchNo }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="批次批注" data-index="batchRemark" :width="150" ellipsis />
          <a-table-column title="发货数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()
const shipModalVisible = ref(false)

const shipForm = ref({
  warehouseId: 'wh001',
  logisticsCompany: '',
  logisticsNo: '',
  items: [] as any[],
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
    { 
      productCode: 'SKU-SN-001', 
      productName: '水泥 P.O 42.5', 
      spec: '50kg/袋', 
      price: 450, 
      quantity: 100, 
      shippedQuantity: 0,
      unit: '袋', 
      subtotal: '45,000.00', 
    },
    { 
      productCode: 'SKU-HS-001', 
      productName: '黄砂 中砂', 
      spec: '中砂', 
      price: 95, 
      quantity: 77, 
      shippedQuantity: 0,
      unit: '方', 
      subtotal: '7,315.00', 
    },
  ],
  logs: [
    { time: '2024-01-15 11:35', content: '客户完成支付' },
    { time: '2024-01-15 11:30', content: '客户下单成功' },
  ],
})

const shipmentRecords = ref<any[]>([])

const shipmentDetailVisible = ref(false)
const currentShipment = ref<any>({})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    shipping: 'blue',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStockOutStatusColor(shipped: number, total: number) {
  if (!shipped || shipped === 0) return 'orange'
  if (shipped < total) return 'blue'
  return 'green'
}

function getStockOutStatusText(shipped: number, total: number) {
  if (!shipped || shipped === 0) return '待发货'
  if (shipped < total) return '部分发货'
  return '已发货'
}

function handleShip() {
  shipForm.value = {
    warehouseId: 'wh001',
    logisticsCompany: '',
    logisticsNo: '',
    items: order.value.items.map(item => ({
      ...item,
      pendingQuantity: item.quantity - (item.shippedQuantity || 0),
      totalSelected: 0,
      batches: getProductBatches(item.productCode, item.quantity - (item.shippedQuantity || 0)),
    })),
  }
  shipModalVisible.value = true
}

function getProductBatches(productCode: string, requiredQuantity: number) {
  const batchData: Record<string, any[]> = {
    'SKU-SN-001': [
      {
        batchNo: 'B20240309001',
        inboundDate: '2024-03-09',
        productionDate: '2024-03-01',
        currentStock: 150,
        remark: '白色，优等品',
        selected: false,
        shipQuantity: 0,
      },
      {
        batchNo: 'B20240309002',
        inboundDate: '2024-03-09',
        productionDate: '2024-03-05',
        currentStock: 200,
        remark: '灰色，优等品',
        selected: false,
        shipQuantity: 0,
      },
      {
        batchNo: 'B20240310001',
        inboundDate: '2024-03-10',
        productionDate: '2024-03-08',
        currentStock: 80,
        remark: '白色，一等品',
        selected: false,
        shipQuantity: 0,
      },
    ],
    'SKU-HS-001': [
      {
        batchNo: 'B20240308001',
        inboundDate: '2024-03-08',
        productionDate: '2024-03-06',
        currentStock: 50,
        remark: '中砂，河砂',
        selected: false,
        shipQuantity: 0,
      },
      {
        batchNo: 'B20240311001',
        inboundDate: '2024-03-11',
        productionDate: '2024-03-09',
        currentStock: 100,
        remark: '中砂，海砂',
        selected: false,
        shipQuantity: 0,
      },
    ],
  }

  return batchData[productCode] || []
}

function updateTotalSelected(item: any) {
  item.totalSelected = item.batches
    .filter((b: any) => b.selected)
    .reduce((sum: number, b: any) => sum + (b.shipQuantity || 0), 0)
}

async function handleShipSubmit() {
  if (!shipForm.value.warehouseId || !shipForm.value.logisticsCompany) {
    Message.warning('请完善发货信息')
    return
  }

  const hasItems = shipForm.value.items.some(item => item.totalSelected > 0)
  if (!hasItems) {
    Message.warning('请至少选择一个商品的批次进行发货')
    return
  }

  const invalidItems = shipForm.value.items.filter(
    item => item.totalSelected > 0 && item.totalSelected !== item.pendingQuantity
  )
  
  if (invalidItems.length > 0) {
    const confirm = await new Promise(resolve => {
      Message.warning({
        content: '部分商品发货数量与待发货数量不一致，是否继续？',
        duration: 0,
        closable: true,
      })
      setTimeout(() => resolve(true), 100)
    })
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const shipmentNo = `SH${Date.now()}`
    const shippedItems: any[] = []

    shipForm.value.items.forEach(item => {
      if (item.totalSelected > 0) {
        const orderItem = order.value.items.find(i => i.productCode === item.productCode)
        if (orderItem) {
          orderItem.shippedQuantity = (orderItem.shippedQuantity || 0) + item.totalSelected
        }

        item.batches.filter((b: any) => b.selected).forEach((batch: any) => {
          shippedItems.push({
            productName: item.productName,
            spec: item.spec,
            batchNo: batch.batchNo,
            batchRemark: batch.remark,
            quantity: batch.shipQuantity,
            unit: item.unit,
          })
        })
      }
    })

    const allShipped = order.value.items.every(
      item => (item.shippedQuantity || 0) >= item.quantity
    )

    if (allShipped) {
      order.value.status = 'shipping'
      order.value.statusText = '发货中'
    }

    shipmentRecords.value.unshift({
      shipmentNo,
      shipTime: new Date().toLocaleString(),
      logisticsCompany: shipForm.value.logisticsCompany,
      logisticsNo: shipForm.value.logisticsNo || `SF${Date.now()}`,
      warehouseName: shipForm.value.warehouseId === 'wh001' ? '深圳湾科技园主仓' : '福田CBD分仓',
      status: 'shipped',
      items: shippedItems,
    })

    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: `发货成功，发货单号：${shipmentNo}，物流：${shipForm.value.logisticsCompany}`,
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

function handleViewShipment(record: any) {
  currentShipment.value = record
  shipmentDetailVisible.value = true
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
