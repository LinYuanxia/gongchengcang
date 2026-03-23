<template>
  <div class="purchase-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button v-if="order.status === 'pending'" type="primary" @click="handleConfirm">
            确认订单
          </a-button>
          <a-button v-if="order.status === 'confirmed'" type="primary" @click="handleStockIn">
            确认入库
          </a-button>
          <a-button v-if="order.status === 'completed' && hasUninvoicedItems" status="success" @click="handleApplyInvoice">
            <template #icon><icon-file /></template>
            申请开票
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="订单信息">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">{{ order.statusText }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="平台订单号">
          <a-link>{{ order.platformOrderNo }}</a-link>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="供应商信息">
        <a-descriptions-item label="供应商">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{ order.supplierContact }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.supplierPhone }}</a-descriptions-item>
        <a-descriptions-item label="供应商状态">
          <a-tag :color="order.supplierStatus === 'confirmed' ? 'green' : 'orange'">
            {{ order.supplierStatus === 'confirmed' ? '已确认' : '待确认' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="收货信息">
        <a-descriptions-item label="收货仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址">{{ order.address }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{ order.contact }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.phone }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="物流信息" v-if="order.status !== 'pending'">
        <a-descriptions-item label="物流公司">{{ order.logisticsCompany || '-' }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ order.logisticsNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ order.shipTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="预计到达">{{ order.estimatedArrival || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="发票信息">
        <a-descriptions-item label="开票状态">
          <a-tag :color="getInvoiceStatusColor(order.invoiceStatus)">
            {{ getInvoiceStatusText(order.invoiceStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="已开票金额">
          <span :class="order.invoicedAmount > 0 ? 'invoiced' : ''">
            ¥{{ order.invoicedAmount?.toLocaleString() || '0.00' }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="待开票金额">
          <span :class="order.pendingInvoiceAmount > 0 ? 'pending-invoice' : ''">
            ¥{{ order.pendingInvoiceAmount?.toLocaleString() || '0.00' }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="发票数量">
          {{ order.invoiceCount || 0 }} 张
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>商品明细</h3>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品编码" data-index="productCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="小计" :width="100" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ record.subtotal }}</span>
            </template>
          </a-table-column>
          <a-table-column title="入库数量" :width="90" align="center">
            <template #cell="{ record }">
              <span :class="record.stockInQuantity === record.quantity ? 'success' : 'warning'">
                {{ record.stockInQuantity }} / {{ record.quantity }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="开票金额" :width="100" align="right">
            <template #cell="{ record }">
              <span :class="record.invoicedAmount > 0 ? 'invoiced' : ''">
                ¥{{ record.invoicedAmount?.toLocaleString() || '0.00' }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="getSkuInvoiceColor(record)" size="small">
                {{ getSkuInvoiceText(record) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="80" fixed="right">
            <template #cell="{ record }">
              <a-link 
                v-if="record.pendingInvoiceAmount > 0 && order.status === 'completed'" 
                @click="handleSkuInvoice(record)"
              >
                开票
              </a-link>
              <span v-else class="disabled-link">-</span>
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

      <h3>关联发票</h3>
      <a-table :data="order.invoices" :pagination="false" v-if="order.invoices?.length">
        <template #columns>
          <a-table-column title="发票号码" data-index="invoiceNo" :width="180" />
          <a-table-column title="发票类型" :width="150">
            <template #cell="{ record }">
              <a-tag :color="getInvoiceTypeColor(record.invoiceType)">
                {{ getInvoiceTypeText(record.invoiceType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 项
            </template>
          </a-table-column>
          <a-table-column title="发票金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="税额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.taxAmount }}
            </template>
          </a-table-column>
          <a-table-column title="价税合计" :width="120" align="right">
            <template #cell="{ record }">
              <span class="total">¥{{ record.totalAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="开票日期" data-index="invoiceDate" :width="120" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getInvoiceVerifyColor(record.status)">
                {{ getInvoiceVerifyText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewInvoice(record)">查看</a-link>
                <a-link @click="handleDownloadInvoice(record)">下载</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <a-empty v-else description="暂无关联发票" />

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

    <a-modal v-model:visible="invoiceModalVisible" title="申请开票" :width="800" @ok="handleInvoiceConfirm">
      <a-alert type="info" style="margin-bottom: 16px">
        请选择需要开票的SKU并填写开票金额
      </a-alert>
      <a-table 
        :data="uninvoicedItems" 
        :row-selection="invoiceSelection"
        v-model:selectedKeys="selectedInvoiceKeys"
        :pagination="false"
      >
        <template #columns>
          <a-table-column title="SKU编码" data-index="productCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="订单金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.subtotal }}
            </template>
          </a-table-column>
          <a-table-column title="已开票金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.invoicedAmount }}
            </template>
          </a-table-column>
          <a-table-column title="待开票金额" :width="100" align="right">
            <template #cell="{ record }">
              <span class="pending-invoice">¥{{ record.pendingInvoiceAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="开票金额" :width="120">
            <template #cell="{ record }">
              <a-input-number 
                v-if="selectedInvoiceKeys.includes(record.productCode)"
                v-model="record.invoiceInputAmount" 
                :min="0" 
                :max="record.pendingInvoiceAmount"
                size="small"
                style="width: 100%"
              />
              <span v-else>-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <div class="invoice-summary">
        <span>已选 {{ selectedInvoiceKeys.length }} 项SKU</span>
        <span>开票金额合计：<strong class="price">¥{{ totalInvoiceInputAmount }}</strong></span>
      </div>
      <a-divider />
      <a-form :model="invoiceForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发票类型" required>
              <a-select v-model="invoiceForm.invoiceType" placeholder="请选择">
                <a-option value="special">增值税专用发票</a-option>
                <a-option value="normal">增值税普通发票</a-option>
                <a-option value="electronic">电子发票</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开票日期" required>
              <a-date-picker v-model="invoiceForm.invoiceDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const order = ref({
  orderNo: 'PO202401150001',
  platformOrderNo: 'PL202401150001',
  status: 'completed',
  statusText: '已完成',
  createTime: '2024-01-15 10:30:00',
  supplierName: '广东建材有限公司',
  supplierContact: '李经理',
  supplierPhone: '13900139001',
  supplierStatus: 'confirmed',
  warehouseName: '深圳湾科技园主仓',
  address: '广东省深圳市南山区科技园南区',
  contact: '张三',
  phone: '13800138000',
  logisticsCompany: '顺丰速运',
  logisticsNo: 'SF1234567890',
  shipTime: '2024-01-15 14:00:00',
  estimatedArrival: '2024-01-17',
  productAmount: '205,000.00',
  freight: '0.00',
  totalAmount: '205,000.00',
  invoiceStatus: 'partial',
  invoicedAmount: 150000,
  pendingInvoiceAmount: 55000,
  invoiceCount: 1,
  items: [
    { 
      productCode: 'SKU-SN-001', 
      productName: '水泥 P.O 42.5', 
      spec: '50kg/袋', 
      price: 420, 
      quantity: 500, 
      unit: '袋', 
      subtotal: '210,000.00', 
      stockInQuantity: 500,
      invoicedAmount: 150000,
      pendingInvoiceAmount: 60000,
      invoiceInputAmount: 60000,
    },
    { 
      productCode: 'SKU-LG-001', 
      productName: '螺纹钢 HRB400 16mm', 
      spec: '16mm', 
      price: 4100, 
      quantity: 50, 
      unit: '吨', 
      subtotal: '205,000.00', 
      stockInQuantity: 50,
      invoicedAmount: 0,
      pendingInvoiceAmount: 205000,
      invoiceInputAmount: 205000,
    },
  ],
  invoices: [
    {
      invoiceNo: 'FP202401200001',
      invoiceType: 'special',
      skuCount: 1,
      amount: '132,743.36',
      taxAmount: '17,256.64',
      totalAmount: '150,000.00',
      invoiceDate: '2024-01-20',
      status: 'verified',
    },
  ],
  logs: [
    { time: '2024-01-16 10:00', content: '订单已完成入库' },
    { time: '2024-01-15 16:00', content: '货物已签收入库' },
    { time: '2024-01-15 14:00', content: '供应商已发货，物流单号：SF1234567890' },
    { time: '2024-01-15 13:30', content: '供应商确认订单' },
    { time: '2024-01-15 10:35', content: '订单已提交至平台' },
    { time: '2024-01-15 10:30', content: '创建采购订单' },
  ],
})

const hasUninvoicedItems = computed(() => {
  return order.value.items.some(item => item.pendingInvoiceAmount > 0)
})

const invoiceModalVisible = ref(false)
const selectedInvoiceKeys = ref<string[]>([])

const invoiceSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
}))

const uninvoicedItems = computed(() => {
  return order.value.items.filter(item => item.pendingInvoiceAmount > 0)
})

const totalInvoiceInputAmount = computed(() => {
  return order.value.items
    .filter(item => selectedInvoiceKeys.value.includes(item.productCode))
    .reduce((sum, item) => sum + (item.invoiceInputAmount || 0), 0)
    .toLocaleString()
})

const invoiceForm = ref({
  invoiceType: 'special',
  invoiceDate: '',
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipping: 'cyan',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getInvoiceStatusColor(status: string) {
  const colors: Record<string, string> = {
    none: 'gray',
    partial: 'orange',
    complete: 'green',
  }
  return colors[status] || 'gray'
}

function getInvoiceStatusText(status: string) {
  const texts: Record<string, string> = {
    none: '未开票',
    partial: '部分开票',
    complete: '已开票',
  }
  return texts[status] || status
}

function getSkuInvoiceColor(record: any) {
  if (record.pendingInvoiceAmount === 0) return 'green'
  if (record.invoicedAmount > 0) return 'orange'
  return 'gray'
}

function getSkuInvoiceText(record: any) {
  if (record.pendingInvoiceAmount === 0) return '已开票'
  if (record.invoicedAmount > 0) return '部分开票'
  return '未开票'
}

function getInvoiceTypeColor(type: string) {
  const colors: Record<string, string> = {
    special: 'blue',
    normal: 'green',
    electronic: 'purple',
  }
  return colors[type] || 'gray'
}

function getInvoiceTypeText(type: string) {
  const texts: Record<string, string> = {
    special: '增值税专用发票',
    normal: '增值税普通发票',
    electronic: '电子发票',
  }
  return texts[type] || type
}

function getInvoiceVerifyColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    verified: 'green',
    invalid: 'red',
  }
  return colors[status] || 'gray'
}

function getInvoiceVerifyText(status: string) {
  const texts: Record<string, string> = {
    pending: '待认证',
    verified: '已认证',
    invalid: '已作废',
  }
  return texts[status] || status
}

function handleConfirm() {
  Message.success('订单确认成功')
  order.value.status = 'confirmed'
  order.value.statusText = '已确认'
}

function handleStockIn() {
  Message.success('入库确认成功')
  order.value.status = 'completed'
  order.value.statusText = '已完成'
  order.value.items.forEach(item => {
    item.stockInQuantity = item.quantity
    item.pendingInvoiceAmount = parseFloat(item.subtotal.replace(/,/g, ''))
  })
  order.value.pendingInvoiceAmount = parseFloat(order.value.totalAmount.replace(/,/g, ''))
  order.value.invoiceStatus = 'none'
}

function handleApplyInvoice() {
  selectedInvoiceKeys.value = uninvoicedItems.value.map(item => item.productCode)
  invoiceModalVisible.value = true
}

function handleSkuInvoice(record: any) {
  selectedInvoiceKeys.value = [record.productCode]
  invoiceModalVisible.value = true
}

function handleInvoiceConfirm() {
  if (selectedInvoiceKeys.value.length === 0) {
    Message.warning('请选择需要开票的SKU')
    return
  }
  if (!invoiceForm.value.invoiceType || !invoiceForm.value.invoiceDate) {
    Message.warning('请填写发票信息')
    return
  }
  Message.success('开票申请已提交')
  invoiceModalVisible.value = false
}

function handleViewInvoice(record: any) {
  Message.info(`查看发票：${record.invoiceNo}`)
}

function handleDownloadInvoice(record: any) {
  Message.info(`下载发票：${record.invoiceNo}`)
}
</script>

<style scoped lang="less">
.purchase-detail {
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

.total {
  color: #165dff;
  font-weight: 600;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #f53f3f;
}

.success {
  color: #00b42a;
}

.warning {
  color: #ff7d00;
}

.invoiced {
  color: #165dff;
  font-weight: 500;
}

.pending-invoice {
  color: #ff7d00;
  font-weight: 500;
}

.disabled-link {
  color: var(--color-text-4);
}

.order-summary {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  text-align: right;
}

.invoice-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgb(var(--gray-1));
  border-radius: 4px;
}
</style>
