<template>
  <div class="invoice-manage">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
          <a-button type="primary" @click="handleApply">
            <template #icon><icon-plus /></template>
            申请开票
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="all" title="全部发票" />
        <a-tab-pane key="input" title="进项发票" />
        <a-tab-pane key="output" title="销项发票" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="发票类型">
          <a-select v-model="searchForm.invoiceType" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="special">增值税专用发票</a-option>
            <a-option value="normal">增值税普通发票</a-option>
            <a-option value="electronic">电子发票</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开票日期">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="filteredInvoices" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="发票号码" data-index="invoiceNo" :width="180" />
          <a-table-column title="发票类型" :width="150">
            <template #cell="{ record }">
              <a-tag :color="getInvoiceTypeColor(record.invoiceType)">
                {{ getInvoiceTypeText(record.invoiceType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发票方向" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.direction === 'input' ? 'blue' : 'green'">
                {{ record.direction === 'input' ? '进项' : '销项' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewOrder(record.orderNo)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              <a-tooltip :content="`共${record.skuCount}个SKU`">
                <span class="sku-count">{{ record.skuCount }} 项</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="开票方/收票方" data-index="partnerName" :width="180" />
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
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleDownload(record)">下载</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="applyModalVisible" title="申请开票" :width="900" @ok="handleApplyConfirm">
      <a-steps :current="applyStep" style="margin-bottom: 24px">
        <a-step title="选择订单" />
        <a-step title="选择SKU" />
        <a-step title="填写信息" />
      </a-steps>

      <div v-if="applyStep === 0" class="step-content">
        <a-alert type="info" style="margin-bottom: 16px">
          请选择需要开票的订单（仅显示已完成且未全额开票的订单）
        </a-alert>
        <a-table 
          :data="availableOrders" 
          :row-selection="orderSelection"
          v-model:selectedKeys="selectedOrderKeys"
          :pagination="false"
        >
          <template #columns>
            <a-table-column title="订单编号" data-index="orderNo" :width="150" />
            <a-table-column title="供应商/客户" data-index="partnerName" :width="150" />
            <a-table-column title="订单金额" :width="120" align="right">
              <template #cell="{ record }">
                <span class="price">¥{{ record.totalAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="已开票金额" :width="120" align="right">
              <template #cell="{ record }">
                <span>¥{{ record.invoicedAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="待开票金额" :width="120" align="right">
              <template #cell="{ record }">
                <span class="warning">¥{{ record.pendingAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="订单时间" data-index="createTime" :width="150" />
          </template>
        </a-table>
      </div>

      <div v-if="applyStep === 1" class="step-content">
        <a-alert type="info" style="margin-bottom: 16px">
          请选择需要开票的SKU明细
        </a-alert>
        <div class="selected-order-info">
          <span>已选订单：{{ selectedOrder?.orderNo }}</span>
          <span>订单金额：¥{{ selectedOrder?.totalAmount }}</span>
        </div>
        <a-table 
          :data="orderSkuList" 
          :row-selection="skuSelection"
          v-model:selectedKeys="selectedSkuKeys"
          :pagination="false"
        >
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
            <a-table-column title="商品名称" data-index="productName" :width="200" />
            <a-table-column title="规格" data-index="spec" :width="120" />
            <a-table-column title="单价" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.price }}
              </template>
            </a-table-column>
            <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
            <a-table-column title="单位" data-index="unit" :width="60" align="center" />
            <a-table-column title="金额" :width="120" align="right">
              <template #cell="{ record }">
                ¥{{ record.amount }}
              </template>
            </a-table-column>
            <a-table-column title="已开票金额" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.invoicedAmount }}
              </template>
            </a-table-column>
            <a-table-column title="待开票金额" :width="100" align="right">
              <template #cell="{ record }">
                <span class="warning">¥{{ record.pendingAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="开票金额" :width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-if="selectedSkuKeys.includes(record.skuId)"
                  v-model="record.invoiceAmount" 
                  :min="0" 
                  :max="record.pendingAmount"
                  size="small"
                  style="width: 100%"
                />
                <span v-else>-</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="invoice-summary">
          <span>已选 {{ selectedSkuKeys.length }} 项SKU</span>
          <span>开票金额合计：<strong class="price">¥{{ totalInvoiceAmount }}</strong></span>
        </div>
      </div>

      <div v-if="applyStep === 2" class="step-content">
        <a-form :model="invoiceForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="发票类型" required>
                <a-select v-model="invoiceForm.invoiceType" placeholder="请选择发票类型">
                  <a-option value="special">增值税专用发票</a-option>
                  <a-option value="normal">增值税普通发票</a-option>
                  <a-option value="electronic">电子发票</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="开票方向">
                <a-radio-group v-model="invoiceForm.direction">
                  <a-radio value="input">进项发票（采购）</a-radio>
                  <a-radio value="output">销项发票（销售）</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="开票方" required>
                <a-input v-model="invoiceForm.issuer" placeholder="请输入开票方名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="收票方" required>
                <a-input v-model="invoiceForm.receiver" placeholder="请输入收票方名称" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="纳税人识别号" required>
                <a-input v-model="invoiceForm.taxNo" placeholder="请输入纳税人识别号" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="开票日期" required>
                <a-date-picker v-model="invoiceForm.invoiceDate" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="备注">
            <a-textarea v-model="invoiceForm.remark" placeholder="请输入备注信息" :max-length="200" />
          </a-form-item>
        </a-form>

        <a-divider>开票明细预览</a-divider>
        <a-table :data="invoicePreviewList" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="100" />
            <a-table-column title="商品名称" data-index="productName" :width="150" />
            <a-table-column title="规格" data-index="spec" :width="100" />
            <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
            <a-table-column title="金额(不含税)" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.amount }}
              </template>
            </a-table-column>
            <a-table-column title="税率" :width="80" align="center">
              <template #cell="{ record }">
                {{ record.taxRate }}%
              </template>
            </a-table-column>
            <a-table-column title="税额" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.taxAmount }}
              </template>
            </a-table-column>
            <a-table-column title="价税合计" :width="100" align="right">
              <template #cell="{ record }">
                <span class="total">¥{{ record.totalAmount }}</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="invoice-total">
          <a-descriptions :column="4" layout="inline-horizontal">
            <a-descriptions-item label="SKU数量">{{ invoicePreviewList.length }} 项</a-descriptions-item>
            <a-descriptions-item label="金额合计">¥{{ totalAmountWithoutTax }}</a-descriptions-item>
            <a-descriptions-item label="税额合计">¥{{ totalTaxAmount }}</a-descriptions-item>
            <a-descriptions-item label="价税合计">
              <span class="total-amount">¥{{ totalInvoiceAmount }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="detailModalVisible" title="发票详情" :width="900" :footer="false">
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="发票号码">{{ currentInvoice?.invoiceNo }}</a-descriptions-item>
        <a-descriptions-item label="发票类型">
          <a-tag :color="getInvoiceTypeColor(currentInvoice?.invoiceType)">
            {{ getInvoiceTypeText(currentInvoice?.invoiceType) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发票方向">
          <a-tag :color="currentInvoice?.direction === 'input' ? 'blue' : 'green'">
            {{ currentInvoice?.direction === 'input' ? '进项' : '销项' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="关联订单">
          <a-link @click="handleViewOrder(currentInvoice?.orderNo)">{{ currentInvoice?.orderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="开票方">{{ currentInvoice?.partnerName }}</a-descriptions-item>
        <a-descriptions-item label="开票日期">{{ currentInvoice?.invoiceDate }}</a-descriptions-item>
        <a-descriptions-item label="纳税人识别号">{{ currentInvoice?.taxNo }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentInvoice?.status)">{{ getStatusText(currentInvoice?.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentInvoice?.createTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>开票SKU明细</a-divider>
      <a-table :data="currentInvoiceSkuList" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.price }}
            </template>
          </a-table-column>
          <a-table-column title="金额(不含税)" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount }}
            </template>
          </a-table-column>
          <a-table-column title="税率" :width="80" align="center">
            <template #cell="{ record }">
              {{ record.taxRate }}%
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
        </template>
      </a-table>

      <div class="invoice-total">
        <a-descriptions :column="4" layout="inline-horizontal">
          <a-descriptions-item label="SKU数量">{{ currentInvoiceSkuList.length }} 项</a-descriptions-item>
          <a-descriptions-item label="金额合计">¥{{ currentInvoice?.amount }}</a-descriptions-item>
          <a-descriptions-item label="税额合计">¥{{ currentInvoice?.taxAmount }}</a-descriptions-item>
          <a-descriptions-item label="价税合计">
            <span class="total-amount">¥{{ currentInvoice?.totalAmount }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('all')

const searchForm = ref({
  invoiceType: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const invoices = ref([
  { 
    id: '1', 
    invoiceNo: 'FP202401150001', 
    invoiceType: 'special', 
    direction: 'input', 
    orderNo: 'PO202401150001',
    skuCount: 3,
    partnerName: '广东建材有限公司', 
    amount: '186,725.66', 
    taxAmount: '24,274.34', 
    totalAmount: '211,000.00', 
    invoiceDate: '2024-01-15', 
    status: 'verified',
    taxNo: '91440100MA5CQXXX',
    createTime: '2024-01-15 10:30:00',
  },
  { 
    id: '2', 
    invoiceNo: 'FP202401150002', 
    invoiceType: 'special', 
    direction: 'input', 
    orderNo: 'PO202401140002',
    skuCount: 2,
    partnerName: '上海钢材集团', 
    amount: '725,663.72', 
    taxAmount: '94,336.28', 
    totalAmount: '820,000.00', 
    invoiceDate: '2024-01-15', 
    status: 'pending',
    taxNo: '91310000MA1KXXX',
    createTime: '2024-01-15 14:20:00',
  },
  { 
    id: '3', 
    invoiceNo: 'FP202401150003', 
    invoiceType: 'special', 
    direction: 'output', 
    orderNo: 'SO202401150001',
    skuCount: 2,
    partnerName: '深圳建筑工程公司', 
    amount: '46,371.68', 
    taxAmount: '6,028.32', 
    totalAmount: '52,400.00', 
    invoiceDate: '2024-01-15', 
    status: 'verified',
    taxNo: '91440300MA5EXXX',
    createTime: '2024-01-15 16:00:00',
  },
  { 
    id: '4', 
    invoiceNo: 'FP202401140001', 
    invoiceType: 'electronic', 
    direction: 'output', 
    orderNo: 'SO202401140002',
    skuCount: 1,
    partnerName: '广州装饰工程公司', 
    amount: '30,088.50', 
    taxAmount: '3,911.50', 
    totalAmount: '34,000.00', 
    invoiceDate: '2024-01-14', 
    status: 'verified',
    taxNo: '91440100MA5AWXXX',
    createTime: '2024-01-14 11:30:00',
  },
])

const currentInvoiceSkuList = ref([
  { skuCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', quantity: 100, unit: '吨', price: '420.00', amount: '37,168.14', taxRate: 13, taxAmount: '4,831.86', totalAmount: '42,000.00' },
  { skuCode: 'SKU-SN-002', productName: '水泥 P.O 52.5', spec: '50kg/袋', quantity: 50, unit: '吨', price: '450.00', amount: '19,911.50', taxRate: 13, taxAmount: '2,588.50', totalAmount: '22,500.00' },
  { skuCode: 'SKU-LG-001', productName: '螺纹钢 HRB400 16mm', spec: '16mm', quantity: 30, unit: '吨', price: '4,100.00', amount: '108,672.57', taxRate: 13, taxAmount: '14,127.43', totalAmount: '123,000.00' },
])

const filteredInvoices = computed(() => {
  if (activeTab.value === 'all') return invoices.value
  return invoices.value.filter(i => i.direction === activeTab.value)
})

const applyModalVisible = ref(false)
const applyStep = ref(0)
const selectedOrderKeys = ref<string[]>([])
const selectedSkuKeys = ref<string[]>([])

const orderSelection = computed(() => ({
  type: 'radio' as const,
  showCheckedAll: false,
}))

const skuSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
}))

const availableOrders = ref([
  { 
    orderNo: 'PO202401160001', 
    partnerName: '广东建材有限公司', 
    totalAmount: '150,000.00', 
    invoicedAmount: '0.00', 
    pendingAmount: '150,000.00',
    createTime: '2024-01-16 10:30:00',
  },
  { 
    orderNo: 'PO202401150002', 
    partnerName: '上海钢材集团', 
    totalAmount: '820,000.00', 
    invoicedAmount: '500,000.00', 
    pendingAmount: '320,000.00',
    createTime: '2024-01-15 14:20:00',
  },
  { 
    orderNo: 'SO202401160001', 
    partnerName: '深圳建筑工程公司', 
    totalAmount: '85,000.00', 
    invoicedAmount: '30,000.00', 
    pendingAmount: '55,000.00',
    createTime: '2024-01-16 09:00:00',
  },
])

const selectedOrder = computed(() => {
  return availableOrders.value.find(o => o.orderNo === selectedOrderKeys.value[0])
})

const orderSkuList = ref([
  { skuId: 'sku001', skuCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', price: '420.00', quantity: 100, unit: '吨', amount: '42,000.00', invoicedAmount: '0.00', pendingAmount: '42,000.00', invoiceAmount: 42000 },
  { skuId: 'sku002', skuCode: 'SKU-SN-002', productName: '水泥 P.O 52.5', spec: '50kg/袋', price: '450.00', quantity: 50, unit: '吨', amount: '22,500.00', invoicedAmount: '0.00', pendingAmount: '22,500.00', invoiceAmount: 22500 },
  { skuId: 'sku003', skuCode: 'SKU-LG-001', productName: '螺纹钢 HRB400 16mm', spec: '16mm', price: '4,100.00', quantity: 20, unit: '吨', amount: '82,000.00', invoicedAmount: '0.00', pendingAmount: '82,000.00', invoiceAmount: 82000 },
  { skuId: 'sku004', skuCode: 'SKU-LG-002', productName: '螺纹钢 HRB400 20mm', spec: '20mm', price: '4,200.00', quantity: 10, unit: '吨', amount: '42,000.00', invoicedAmount: '0.00', pendingAmount: '42,000.00', invoiceAmount: 42000 },
])

const totalInvoiceAmount = computed(() => {
  return orderSkuList.value
    .filter(sku => selectedSkuKeys.value.includes(sku.skuId))
    .reduce((sum, sku) => sum + (sku.invoiceAmount || 0), 0)
    .toFixed(2)
})

const totalAmountWithoutTax = computed(() => {
  const total = parseFloat(totalInvoiceAmount.value) / 1.13
  return total.toFixed(2)
})

const totalTaxAmount = computed(() => {
  const total = parseFloat(totalInvoiceAmount.value) - parseFloat(totalAmountWithoutTax.value)
  return total.toFixed(2)
})

const invoicePreviewList = computed(() => {
  return orderSkuList.value
    .filter(sku => selectedSkuKeys.value.includes(sku.skuId))
    .map(sku => {
      const amount = (sku.invoiceAmount || 0) / 1.13
      const taxAmount = (sku.invoiceAmount || 0) - amount
      return {
        ...sku,
        amount: amount.toFixed(2),
        taxRate: 13,
        taxAmount: taxAmount.toFixed(2),
        totalAmount: (sku.invoiceAmount || 0).toFixed(2),
      }
    })
})

const invoiceForm = ref({
  invoiceType: 'special',
  direction: 'input',
  issuer: '',
  receiver: '',
  taxNo: '',
  invoiceDate: '',
  remark: '',
})

const detailModalVisible = ref(false)
const currentInvoice = ref<any>(null)

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

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    verified: 'green',
    invalid: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待认证',
    verified: '已认证',
    invalid: '已作废',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleExport() {
  Message.info('导出功能开发中')
}

function handleApply() {
  applyModalVisible.value = true
  applyStep.value = 0
  selectedOrderKeys.value = []
  selectedSkuKeys.value = []
}

function handleApplyConfirm() {
  if (applyStep.value < 2) {
    if (applyStep.value === 0 && selectedOrderKeys.value.length === 0) {
      Message.warning('请选择需要开票的订单')
      return
    }
    if (applyStep.value === 1 && selectedSkuKeys.value.length === 0) {
      Message.warning('请选择需要开票的SKU')
      return
    }
    applyStep.value++
    return
  }

  if (!invoiceForm.value.invoiceType || !invoiceForm.value.issuer || !invoiceForm.value.receiver) {
    Message.warning('请填写完整的发票信息')
    return
  }

  Message.success('开票申请已提交')
  applyModalVisible.value = false
}

function handleView(record: any) {
  currentInvoice.value = record
  detailModalVisible.value = true
}

function handleViewOrder(orderNo: string) {
  Message.info(`查看订单：${orderNo}`)
}

function handleDownload(record: any) {
  Message.info(`下载发票：${record.invoiceNo}`)
}
</script>

<style scoped lang="less">
.invoice-manage {
  padding: 16px;
}

.search-form {
  margin-bottom: 0;
}

.mt-16 {
  margin-top: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.total {
  color: #165dff;
  font-weight: 600;
}

.warning {
  color: #ff7d00;
  font-weight: 500;
}

.sku-count {
  color: #165dff;
  cursor: pointer;
}

.step-content {
  min-height: 300px;
}

.selected-order-info {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 12px;
  background: rgb(var(--gray-1));
  border-radius: 4px;
  font-size: 13px;
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

.invoice-total {
  margin-top: 16px;
  padding: 16px;
  background: rgb(var(--gray-1));
  border-radius: 4px;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #f53f3f;
}
</style>
