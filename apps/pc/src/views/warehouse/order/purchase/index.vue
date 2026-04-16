<template>
  <div class="purchase-order">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleReset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="filter-row">
        <a-col :span="6">
          <a-form-item label="订单编号">
            <a-input v-model="searchForm.orderNo" placeholder="请输入订单编号" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="供应商">
            <a-select v-model="searchForm.supplierId" placeholder="请选择供应商" allow-clear>
              <a-option value="s1">广东建材有限公司</a-option>
              <a-option value="s2">上海钢材集团</a-option>
              <a-option value="s3">惠州砂石厂</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="订单来源">
            <a-select v-model="searchForm.source" placeholder="请选择来源" allow-clear>
              <a-option value="cart">购物车</a-option>
              <a-option value="market">商品市场</a-option>
              <a-option value="plan">采购计划</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="支付状态">
            <a-select v-model="searchForm.paymentStatus" placeholder="请选择" allow-clear>
              <a-option value="unpaid">未支付</a-option>
              <a-option value="partial">部分支付</a-option>
              <a-option value="paid">已支付</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <a-card class="mt-16">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="all" title="全部订单" />
        <a-tab-pane key="pending" title="待确认" />
        <a-tab-pane key="shipping" title="待发货" />
        <a-tab-pane key="receiving" title="待收货" />
        <a-tab-pane key="completed" title="已完成" />
        <a-tab-pane key="cancelled" title="已取消" />
        <a-tab-pane key="refunded" title="已退款" />
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="pagination" :row-key="(record: any) => record.id">
        <template #columns>
          <a-table-column title="订单编号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单来源" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getSourceColor(record.source)">
                {{ getSourceText(record.source) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="160" />
          <a-table-column title="商品信息" :width="220">
            <template #cell="{ record }">
              <div class="product-info">
                <div class="product-item" v-for="(item, index) in record.items.slice(0, 2)" :key="item.id">
                  <span class="product-name">{{ item.productName }}</span>
                  <span class="product-spec">{{ item.spec }}</span>
                  <span class="product-qty">×{{ item.quantity }}</span>
                </div>
                <div v-if="record.items.length > 2" class="more-text">
                  等 {{ record.items.length }} 件商品
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实付金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="paid-amount">¥{{ record.paidAmount || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPaymentStatusColor(record.paymentStatus)">
                {{ getPaymentStatusText(record.paymentStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" data-index="createTime" :width="170" />
          <a-table-column title="操作" :width="260" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-link size="small" @click="handleView(record)">详情</a-link>
                <a-link size="small" v-if="record.status === 'pending'" @click="handleCancel(record)">取消订单</a-link>
                <a-link size="small" v-if="record.paymentStatus !== 'paid' && record.status !== 'cancelled'" @click="handlePay(record)">立即支付</a-link>
                <a-link size="small" v-if="record.status === 'receiving'" @click="handleReceive(record)">收货</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="payModalVisible"
      title="订单支付"
      :width="600"
      @ok="handlePayConfirm"
      @cancel="cancelPay"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ currentOrder?.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentOrder?.amount }}</a-descriptions-item>
        <a-descriptions-item label="待付金额">
          <span class="text-danger">¥{{ (Number(currentOrder?.amount || 0) - Number(currentOrder?.paidAmount || 0)).toFixed(2) }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="支付金额" required>
          <a-input-number
            v-model="payForm.amount"
            :min="0.01"
            :max="Number(currentOrder?.amount || 0) - Number(currentOrder?.paidAmount || 0)"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="转账凭证" required>
          <a-upload
            v-model:file-list="payForm.vouchers"
            :limit="3"
            accept="image/*"
            list-type="card"
          >
            <a-button>
              <template #icon><icon-plus /></template>
              上传凭证
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model="payForm.remark"
            placeholder="请输入支付备注（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="selectShipmentModalVisible"
      title="选择发货批次"
      :width="700"
      :footer="false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        供应商按批次发货，请先选择要收货的发货批次
      </a-alert>

      <a-table :data="currentShipments" :pagination="false">
        <template #columns>
          <a-table-column title="发货批次号" data-index="shipmentNo" :width="160">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.shipmentNo }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发货时间" data-index="shipTime" :width="160" />
          <a-table-column title="物流公司" data-index="logisticsCompany" :width="120" />
          <a-table-column title="商品种类" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.items?.length || 0 }} 种
            </template>
          </a-table-column>
          <a-table-column title="发货总数" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag color="orange">待收货</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button type="primary" size="small" @click="handleSelectShipment(record)">
                开始收货
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="receiveModalVisible"
      title="按发货批次收货"
      :width="900"
      @ok="handleReceiveConfirm"
      @cancel="cancelReceive"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <span>供应商按批次发货，基于发货批次核对实收数量，确认后自动生成收货批次和入库单</span>
      </a-alert>

      <div class="shipment-batch-info">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="发货批次号">
            <a-tag color="arcoblue">{{ currentShipmentBatch?.shipmentNo }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发货时间">{{ currentShipmentBatch?.shipTime }}</a-descriptions-item>
          <a-descriptions-item label="物流公司">{{ currentShipmentBatch?.logisticsCompany }}</a-descriptions-item>
          <a-descriptions-item label="物流单号">{{ currentShipmentBatch?.logisticsNo }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <a-form :model="receiveForm" layout="vertical">
        <a-form-item label="发货批次商品明细" required>
          <a-table :data="receiveForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="220" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="发货数量" :width="100" align="right">
                <template #cell="{ record }">
                  {{ record.shipQuantity }} {{ record.unit }}
                </template>
              </a-table-column>
              <a-table-column title="实收数量" :width="140" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.receiveQuantity"
                    :min="0"
                    :max="record.shipQuantity"
                    :precision="0"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="差异数量" :width="100" align="right">
                <template #cell="{ record }">
                  <span :class="record.shipQuantity - record.receiveQuantity !== 0 ? 'text-danger' : 'text-success'">
                    {{ record.shipQuantity - record.receiveQuantity }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="生成收货批次" :width="180">
                <template #cell="{ record }">
                  <a-input
                    v-model="record.batchNo"
                    placeholder="自动生成"
                    size="small"
                  >
                    <template #prepend>
                      <a-button size="small" @click="generateBatchNo(record)">生成</a-button>
                    </template>
                  </a-input>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="入库仓库" required>
          <a-select v-model="receiveForm.warehouse" placeholder="请选择入库仓库" style="width: 300px">
            <a-option value="深圳湾科技园项目仓">深圳湾科技园项目仓</a-option>
            <a-option value="福田CBD项目仓">福田CBD项目仓</a-option>
            <a-option value="龙华仓储中心">龙华仓储中心</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="收货备注">
          <a-textarea
            v-model="receiveForm.remark"
            placeholder="请输入收货备注、差异说明等（选填）"
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

const searchForm = ref({
  orderNo: '',
  supplierId: '',
  source: '',
  paymentStatus: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const orders = ref([
  {
    id: '1',
    orderNo: 'PO202401150001',
    source: 'plan',
    supplierName: '广东建材有限公司',
    amount: '210000.00',
    paidAmount: '210000.00',
    paymentStatus: 'paid',
    status: 'completed',
    createTime: '2024-01-15 10:30:00',
    items: [
      { id: '1', productName: '32.5级水泥', spec: '32.5级', quantity: 100, unit: '吨', pendingQuantity: 100 },
      { id: '2', productName: '河沙', spec: '中粗', quantity: 200, unit: '方', pendingQuantity: 200 },
      { id: '3', productName: '碎石', spec: '5-20mm', quantity: 150, unit: '方', pendingQuantity: 150 },
    ]
  },
  {
    id: '2',
    orderNo: 'PO202401150002',
    source: 'market',
    supplierName: '上海钢材集团',
    amount: '820000.00',
    paidAmount: '500000.00',
    paymentStatus: 'partial',
    status: 'shipping',
    createTime: '2024-01-15 14:20:00',
    items: [
      { id: '1', productName: '螺纹钢 HRB400', spec: '16mm', quantity: 80, unit: '吨', pendingQuantity: 80 },
    ]
  },
  {
    id: '3',
    orderNo: 'PO202401150003',
    source: 'cart',
    supplierName: '惠州砂石厂',
    amount: '15000.00',
    paidAmount: '0',
    paymentStatus: 'unpaid',
    status: 'receiving',
    createTime: '2024-01-15 16:00:00',
    items: [
      { id: '1', productName: '黄砂 中砂', spec: '中砂', quantity: 200, unit: '方', pendingQuantity: 200 },
      { id: '2', productName: '碎石', spec: '5-25mm', quantity: 100, unit: '方', pendingQuantity: 100 },
    ]
  },
  {
    id: '4',
    orderNo: 'PO202401160001',
    source: 'plan',
    supplierName: '深圳混凝土公司',
    amount: '38000.00',
    paidAmount: '0',
    paymentStatus: 'unpaid',
    status: 'pending',
    createTime: '2024-01-16 09:00:00',
    items: [
      { id: '1', productName: 'C30混凝土', spec: 'C30', quantity: 100, unit: '方', pendingQuantity: 100 },
    ]
  },
  {
    id: '5',
    orderNo: 'PO202401160002',
    source: 'market',
    supplierName: '佛山陶瓷建材',
    amount: '45000.00',
    paidAmount: '45000.00',
    paymentStatus: 'paid',
    status: 'cancelled',
    createTime: '2024-01-16 11:30:00',
    items: [
      { id: '1', productName: '地面砖 800x800', spec: '800x800mm', quantity: 500, unit: '片', pendingQuantity: 500 },
    ]
  },
])

const filteredOrders = computed(() => {
  let list = orders.value

  if (activeTab.value !== 'all') {
    list = list.filter(o => o.status === activeTab.value)
  }

  if (searchForm.value.orderNo) {
    list = list.filter(o => o.orderNo.includes(searchForm.value.orderNo))
  }
  if (searchForm.value.supplierId) {
    list = list.filter(o => o.supplierName.includes(searchForm.value.supplierId))
  }
  if (searchForm.value.source) {
    list = list.filter(o => o.source === searchForm.value.source)
  }
  if (searchForm.value.paymentStatus) {
    list = list.filter(o => o.paymentStatus === searchForm.value.paymentStatus)
  }

  return list
})

function getSourceColor(source: string) {
  const colors: Record<string, string> = {
    cart: 'blue',
    market: 'green',
    plan: 'orange',
  }
  return colors[source] || 'gray'
}

function getSourceText(source: string) {
  const texts: Record<string, string> = {
    cart: '购物车',
    market: '商品市场',
    plan: '采购计划',
  }
  return texts[source] || source
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
    unpaid: '未支付',
    partial: '部分支付',
    paid: '已支付',
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'gold',
    shipping: 'blue',
    receiving: 'cyan',
    completed: 'green',
    cancelled: 'gray',
    refunded: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    shipping: '待发货',
    receiving: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.success('搜索条件已应用')
}

function handleReset() {
  searchForm.value = {
    orderNo: '',
    supplierId: '',
    source: '',
    paymentStatus: '',
  }
  Message.success('已重置搜索条件')
}

function handleView(record: any) {
  router.push(`/warehouse/order/purchase/detail/${record.id}`)
}

function handleCancel(record: any) {
  record.status = 'cancelled'
  Message.success(`订单 ${record.orderNo} 已取消`)
}

const payModalVisible = ref(false)
const currentOrder = ref<any>(null)
const payForm = ref({
  amount: 0,
  vouchers: [] as any[],
  remark: '',
})

function handlePay(record: any) {
  currentOrder.value = record
  payForm.value = {
    amount: Number(record.amount) - Number(record.paidAmount || 0),
    vouchers: [],
    remark: '',
  }
  payModalVisible.value = true
}

function handlePayConfirm() {
  if (currentOrder.value) {
    const newPaid = Number(currentOrder.value.paidAmount || 0) + payForm.value.amount
    if (newPaid >= Number(currentOrder.value.amount)) {
      currentOrder.value.paymentStatus = 'paid'
    } else {
      currentOrder.value.paymentStatus = 'partial'
    }
    currentOrder.value.paidAmount = newPaid.toFixed(2)
    Message.success(`支付成功，金额：¥${payForm.value.amount.toFixed(2)}`)
    payModalVisible.value = false
  }
}

function cancelPay() {
  payModalVisible.value = false
}

const receiveModalVisible = ref(false)
const receiveForm = ref({
  items: [] as any[],
  remark: '',
})

const selectShipmentModalVisible = ref(false)
const currentShipmentBatch = ref<any>(null)
const currentShipments = ref<any[]>([])

function generateBatchNo(record: any) {
  const date = new Date()
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  record.batchNo = `B${dateStr}${random}`
}

function handleReceive(record: any) {
  currentOrder.value = record
  currentShipments.value = [
    {
      id: '1',
      shipmentNo: 'SH202401200001',
      shipTime: '2024-01-20 09:30:00',
      logisticsCompany: '顺丰速运',
      logisticsNo: 'SF1234567890',
      items: [
        { productName: '黄砂 中砂', spec: '中砂', unit: '方', quantity: 100 },
        { productName: '碎石', spec: '5-25mm', unit: '方', quantity: 50 },
      ],
    },
    {
      id: '2',
      shipmentNo: 'SH202401220002',
      shipTime: '2024-01-22 14:00:00',
      logisticsCompany: '京东物流',
      logisticsNo: 'JD9876543210',
      items: [
        { productName: '黄砂 中砂', spec: '中砂', unit: '方', quantity: 100 },
        { productName: '碎石', spec: '5-25mm', unit: '方', quantity: 50 },
      ],
    },
  ]
  selectShipmentModalVisible.value = true
}

function handleSelectShipment(shipment: any) {
  currentShipmentBatch.value = shipment
  selectShipmentModalVisible.value = false
  
  receiveForm.value = {
    items: shipment.items.map((item: any) => {
      const date = new Date()
      const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      return {
        ...item,
        shipQuantity: item.quantity,
        receiveQuantity: item.quantity,
        batchNo: `B${dateStr}${random}`,
      }
    }),
    warehouse: '深圳湾科技园项目仓',
    remark: '',
  }
  receiveModalVisible.value = true
}

function selectAllReceive() {
  receiveForm.value.items.forEach((item: any) => {
    item.receiveQuantity = item.shipQuantity
  })
}

function clearReceive() {
  receiveForm.value.items.forEach((item: any) => {
    item.receiveQuantity = 0
    item.batchRemark = ''
  })
}

function handleReceiveConfirm() {
  const receivedItems = receiveForm.value.items.filter((item: any) => item.receiveQuantity > 0)
  if (receivedItems.length === 0) {
    Message.warning('请至少填写一个 SKU 的收货数量')
    return
  }

  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

  receivedItems.forEach((item: any, index: number) => {
    const batchNo = `B${dateStr}${String(index + 1).padStart(3, '0')}`
    console.log(`生成批次: ${batchNo}`, {
      skuName: `${item.productName} ${item.spec}`,
      quantity: item.receiveQuantity,
      supplierName: currentOrder.value.supplierName,
      purchaseNo: currentOrder.value.orderNo,
      remark: item.batchRemark,
    })
  })

  Message.success(`收货成功，已生成 ${receivedItems.length} 个批次`)
  
  const allReceived = receiveForm.value.items.every((item: any) => 
    item.receiveQuantity >= item.pendingQuantity
  )
  if (allReceived && currentOrder.value) {
    if (currentOrder.value.paymentStatus === 'paid') {
      currentOrder.value.status = 'completed'
    }
  }
  
  receiveModalVisible.value = false
}

function cancelReceive() {
  receiveModalVisible.value = false
}

function handleLogistics(record: any) {
  Message.info(`查看物流：${record.orderNo}`)
}
</script>

<style scoped lang="less">
.purchase-order {
  padding: 16px;
}

.filter-row {
  margin-bottom: 0;
}

.mt-16 {
  margin-top: 16px;
}

.amount {
  color: #f53f3f;
  font-weight: 500;
}

.paid-amount {
  color: #00b42a;
  font-weight: 500;
}

.text-danger {
  color: #f53f3f;
  font-weight: 500;
}

.product-info {
  text-align: left;
  .product-item {
    line-height: 20px;
    font-size: 12px;
    .product-name {
      margin-right: 4px;
    }
    .product-spec {
      color: #86909c;
      margin-right: 4px;
    }
    .product-qty {
      color: #86909c;
    }
  }
  .more-text {
    color: #165dff;
    font-size: 12px;
  }
}
</style>
