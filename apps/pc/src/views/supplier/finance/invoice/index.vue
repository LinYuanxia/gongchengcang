<template>
  <div class="supplier-invoice">
    <a-card>
      <template #title>
        <span>发票管理</span>
      </template>

      <a-tabs v-model:active-tab="activeTab" class="invoice-tabs">
        <a-tab-pane key="all" :title="`全部 (${stats.totalCount})`" />
        <a-tab-pane key="unissued" :title="`待开票 (${stats.unissuedCount})`" />
        <a-tab-pane key="issued" :title="`已开票 (${stats.issuedCount})`" />
        <a-tab-pane key="void" :title="`已作废 (${stats.voidCount})`" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="批次号/订单号">
          <a-input v-model="searchForm.keyword" placeholder="请输入" style="width: 200px" allow-clear />
        </a-form-item>
        <a-form-item label="申请工程仓">
          <a-select v-model="searchForm.warehouseId" placeholder="全部" style="width: 150px" allow-clear>
            <a-option value="wh001">深圳湾科技园项目仓</a-option>
            <a-option value="wh002">福田CBD项目仓</a-option>
            <a-option value="wh003">宝安新安项目仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
        </a-form-item>
      </a-form>

      <a-table
        :data="filteredList"
        :pagination="pagination"
        row-key="batchNo"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="批次号" data-index="batchNo" :width="140">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.batchNo }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请工程仓" data-index="warehouseName" :width="160" />
          <a-table-column title="关联订单数" :width="100" align="center">
            <template #cell="{ record }">
              <a-link @click="handleViewOrders(record)">
                {{ record.orderCount }} 单
              </a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单总金额" :width="110" align="right">
            <template #cell="{ record }">
              ¥{{ record.orderAmount.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="已支付金额" :width="110" align="right">
            <template #cell="{ record }">
              ¥{{ record.paidAmount.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="可开票金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="text-warning">¥{{ record.invoiceAmount.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="发票抬头" data-index="invoiceTitle" :width="180" />
          <a-table-column title="发票号码" data-index="invoiceNo" :width="130" />
          <a-table-column title="申请人" data-index="applicantName" :width="100" />
          <a-table-column title="申请时间" data-index="appliedAt" :width="160" />
          <a-table-column title="开具状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="合规状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag v-if="record.status === 'issued'" :color="getComplianceColor(record.complianceStatus)">
                {{ getComplianceText(record.complianceStatus) }}
              </a-tag>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  v-if="record.status === 'issued'"
                  type="text"
                  size="small"
                  @click="handleViewInvoice(record)"
                >
                  查看发票
                </a-button>
                <a-button
                  v-if="record.status === 'unissued'"
                  type="text"
                  size="small"
                  status="success"
                  @click="handleUpload(record)"
                >
                  上传发票
                </a-button>
                <a-button
                  v-if="record.status === 'void' || record.complianceStatus === 'abnormal'"
                  type="text"
                  size="small"
                  status="warning"
                  @click="handleReupload(record)"
                >
                  重新上传
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="uploadModalVisible" title="上传发票" :width="700" @ok="handleUploadConfirm">
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 20px">
        <a-descriptions-item label="开票批次号">
          <a-tag color="blue">{{ currentInvoice?.batchNo }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请工程仓">
          {{ currentInvoice?.warehouseName }}
        </a-descriptions-item>
        <a-descriptions-item label="关联订单">
          <a-link @click="handleViewOrders(currentInvoice)">
            {{ currentInvoice?.orderCount }} 个订单
          </a-link>
        </a-descriptions-item>
        <a-descriptions-item label="可开票金额">
          <span class="text-warning">¥{{ currentInvoice?.invoiceAmount.toFixed(2) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="申请人" :span="2">
          {{ currentInvoice?.applicantName }}（{{ currentInvoice?.appliedAt }}）
        </a-descriptions-item>
      </a-descriptions>

      <a-form :model="uploadForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="发票抬头" required>
              <a-input v-model="uploadForm.invoiceTitle" placeholder="请输入发票抬头" maxlength="100" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开票金额" required>
              <a-input-number
                v-model="uploadForm.amount"
                :min="0.01"
                :max="currentInvoice?.invoiceAmount || 999999"
                :precision="2"
                placeholder="请输入金额"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发票号码" required>
              <a-input v-model="uploadForm.invoiceNo" placeholder="请输入发票号码" maxlength="20" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="开票日期" required>
          <a-date-picker v-model="uploadForm.invoiceDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="发票附件">
          <a-upload
            v-model:file-list="uploadForm.files"
            action="/"
            :limit="3"
            accept=".pdf,.jpg,.png"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              上传发票文件
            </a-button>
          </a-upload>
          <div class="upload-tip">支持 PDF、JPG、PNG 格式，最多上传3个文件</div>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="uploadForm.remark" placeholder="请输入备注信息" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="viewInvoiceModalVisible" title="发票详情" :width="800" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="开票批次号">
          <a-tag color="blue">{{ currentInvoice?.batchNo }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请工程仓">
          {{ currentInvoice?.warehouseName }}
        </a-descriptions-item>
        <a-descriptions-item label="发票抬头">
          {{ currentInvoice?.invoiceTitle }}
        </a-descriptions-item>
        <a-descriptions-item label="发票号码">
          {{ currentInvoice?.invoiceNo }}
        </a-descriptions-item>
        <a-descriptions-item label="开票金额">
          ¥{{ currentInvoice?.issuedAmount?.toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="开票日期">
          {{ currentInvoice?.invoiceDate }}
        </a-descriptions-item>
        <a-descriptions-item label="关联订单" :span="2">
          <a-link @click="handleViewOrders(currentInvoice)">
            {{ currentInvoice?.orderCount }} 个订单
          </a-link>
        </a-descriptions-item>
        <a-descriptions-item label="发票附件" :span="2">
          <a-space v-if="currentInvoice?.invoiceFiles?.length">
            <a v-for="(file, idx) in currentInvoice?.invoiceFiles" :key="idx" target="_blank">
              {{ file.name }}
            </a>
          </a-space>
          <span v-else>-</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">开具历史</a-divider>
      <a-timeline>
        <a-timeline-item v-for="(record, idx) in currentInvoice?.issueHistory" :key="idx" :label="record.issuedAt">
          <template #dot>
            <icon-check-circle :style="{ color: record.status === 'success' ? 'rgb(var(--green-6))' : 'rgb(var(--red-6))' }" />
          </template>
          <p><strong>发票号码：</strong>{{ record.invoiceNo }}</p>
          <p><strong>开票金额：</strong>¥{{ record.amount.toFixed(2) }}</p>
          <p><strong>状态：</strong>{{ record.status === 'success' ? '开具成功' : '已作废' }}</p>
          <p v-if="record.status === 'void'"><strong>作废原因：</strong>{{ record.voidReason || '工程仓申请重新开具' }}</p>
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <a-modal v-model:visible="ordersModalVisible" title="批次关联订单详情" :width="800" :footer="false">
      <a-table :data="currentBatchOrders" :pagination="{ pageSize: 10 }" row-key="orderNo">
        <template #columns>
          <a-table-column title="订单号" data-index="orderNo" :width="160" />
          <a-table-column title="订单类型" :width="100">
            <template #cell="{ record }">
              {{ record.orderType === 'purchase' ? '采购订单' : '其他' }}
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="已支付金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.paidAmount.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="申请开票金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.applyAmount.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="下单时间" data-index="createdAt" :width="160" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCheckCircle } from '@arco-design/web-vue/es/icon'

interface IssueHistory {
  invoiceNo: string
  invoiceTitle: string
  amount: number
  issuedAt: string
  status: 'success' | 'void'
  voidReason?: string
}

interface InvoiceBatch {
  batchNo: string
  warehouseId: string
  warehouseName: string
  orderCount: number
  orderAmount: number
  paidAmount: number
  invoiceAmount: number
  status: 'unissued' | 'issued' | 'void'
  complianceStatus: 'normal' | 'abnormal'
  abnormalReason?: string
  invoiceTitle?: string
  invoiceNo?: string
  invoiceDate?: string
  issuedAmount?: number
  invoiceFiles?: { name: string; url: string }[]
  applicantName: string
  appliedAt: string
  orders?: BatchOrder[]
  issueHistory?: IssueHistory[]
}

interface BatchOrder {
  orderNo: string
  orderType: 'purchase' | 'sale'
  amount: number
  paidAmount: number
  applyAmount: number
  createdAt: string
}

const searchForm = reactive({
  keyword: '',
  warehouseId: undefined as string | undefined,
  status: undefined as 'unissued' | 'issued' | undefined,
  dateRange: [],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const uploadModalVisible = ref(false)
const viewInvoiceModalVisible = ref(false)
const ordersModalVisible = ref(false)
const currentInvoice = ref<InvoiceBatch | null>(null)
const currentBatchOrders = ref<BatchOrder[]>([])

const uploadForm = reactive({
  invoiceTitle: '',
  amount: 0,
  invoiceNo: '',
  invoiceDate: '',
  files: [],
  remark: '',
})

const invoiceList = ref<InvoiceBatch[]>([
  {
    batchNo: 'PI20240325001',
    warehouseId: 'wh001',
    warehouseName: '深圳湾科技园项目仓',
    orderCount: 3,
    orderAmount: 45000,
    paidAmount: 45000,
    invoiceAmount: 45000,
    status: 'unissued',
    complianceStatus: 'normal',
    applicantName: '张工程',
    appliedAt: '2024-03-25 09:30:00',
    orders: [
      { orderNo: 'PO202403200001', orderType: 'purchase', amount: 15000, paidAmount: 15000, applyAmount: 15000, createdAt: '2024-03-20 10:00:00' },
      { orderNo: 'PO202403200002', orderType: 'purchase', amount: 20000, paidAmount: 20000, applyAmount: 20000, createdAt: '2024-03-20 11:00:00' },
      { orderNo: 'PO202403210003', orderType: 'purchase', amount: 10000, paidAmount: 10000, applyAmount: 10000, createdAt: '2024-03-21 09:00:00' },
    ],
  },
  {
    batchNo: 'PI20240324002',
    warehouseId: 'wh002',
    warehouseName: '福田CBD项目仓',
    orderCount: 1,
    orderAmount: 8500,
    paidAmount: 8500,
    invoiceAmount: 8500,
    status: 'issued',
    complianceStatus: 'normal',
    invoiceTitle: '深圳市XX建筑工程有限公司',
    invoiceNo: '00123456',
    invoiceDate: '2024-03-24',
    issuedAmount: 8500,
    invoiceFiles: [{ name: '发票00123456.pdf', url: '/files/invoice001.pdf' }],
    applicantName: '李工程',
    appliedAt: '2024-03-24 10:30:00',
    issueHistory: [
      { invoiceTitle: '深圳市XX建筑工程有限公司', invoiceNo: '00123456', amount: 8500, issuedAt: '2024-03-24 14:30:00', status: 'success' },
    ],
    orders: [
      { orderNo: 'PO202403190002', orderType: 'purchase', amount: 8500, paidAmount: 8500, applyAmount: 8500, createdAt: '2024-03-19 14:00:00' },
    ],
  },
  {
    batchNo: 'PI20240323003',
    warehouseId: 'wh001',
    warehouseName: '深圳湾科技园项目仓',
    orderCount: 2,
    orderAmount: 37000,
    paidAmount: 30000,
    invoiceAmount: 30000,
    status: 'void',
    complianceStatus: 'normal',
    invoiceTitle: '深圳湾建设有限公司',
    invoiceNo: '00123400',
    invoiceDate: '2024-03-23',
    issuedAmount: 30000,
    applicantName: '张工程',
    appliedAt: '2024-03-23 15:00:00',
    issueHistory: [
      { invoiceTitle: '深圳湾建设有限公司', invoiceNo: '00123400', amount: 30000, issuedAt: '2024-03-23 16:00:00', status: 'void', voidReason: '工程仓申请重新开具' },
    ],
    orders: [
      { orderNo: 'PO202403180003', orderType: 'purchase', amount: 22000, paidAmount: 15000, applyAmount: 15000, createdAt: '2024-03-18 10:00:00' },
      { orderNo: 'PO202403180004', orderType: 'purchase', amount: 15000, paidAmount: 15000, applyAmount: 15000, createdAt: '2024-03-18 11:00:00' },
    ],
  },
  {
    batchNo: 'PI20240322004',
    warehouseId: 'wh003',
    warehouseName: '宝安新安项目仓',
    orderCount: 2,
    orderAmount: 32000,
    paidAmount: 32000,
    invoiceAmount: 32000,
    status: 'issued',
    complianceStatus: 'abnormal',
    abnormalReason: '发票号码格式不正确，请核对',
    invoiceTitle: '宝安新安建设有限公司',
    invoiceNo: 'INV-0001',
    invoiceDate: '2024-03-22',
    issuedAmount: 32000,
    applicantName: '王工程',
    appliedAt: '2024-03-22 11:00:00',
    issueHistory: [
      { invoiceTitle: '宝安新安建设有限公司', invoiceNo: 'INV-0001', amount: 32000, issuedAt: '2024-03-22 15:00:00', status: 'success' },
    ],
    orders: [
      { orderNo: 'PO202403170004', orderType: 'purchase', amount: 12000, paidAmount: 12000, applyAmount: 12000, createdAt: '2024-03-17 09:00:00' },
      { orderNo: 'PO202403170005', orderType: 'purchase', amount: 20000, paidAmount: 20000, applyAmount: 20000, createdAt: '2024-03-17 10:00:00' },
    ],
  },
  {
    batchNo: 'PI20240321005',
    warehouseId: 'wh002',
    warehouseName: '福田CBD项目仓',
    orderCount: 5,
    orderAmount: 95000,
    paidAmount: 60000,
    invoiceAmount: 60000,
    status: 'unissued',
    complianceStatus: 'normal',
    applicantName: '李工程',
    appliedAt: '2024-03-21 09:00:00',
    orders: [],
  },
])

const activeTab = ref('all')

const stats = computed(() => {
  return {
    totalCount: invoiceList.value.length,
    unissuedCount: invoiceList.value.filter(i => i.status === 'unissued').length,
    totalPendingAmount: invoiceList.value.filter(i => i.status === 'unissued').reduce((sum, i) => sum + i.invoiceAmount, 0),
    issuedCount: invoiceList.value.filter(i => i.status === 'issued').length,
    voidCount: invoiceList.value.filter(i => i.status === 'void').length,
  }
})

const filteredList = computed(() => {
  let result = invoiceList.value

  if (activeTab.value !== 'all') {
    result = result.filter(i => i.status === activeTab.value)
  }

  if (searchForm.keyword) {
    result = result.filter(i =>
      i.batchNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      i.orders?.some(o => o.orderNo.toLowerCase().includes(searchForm.keyword.toLowerCase()))
    )
  }

  if (searchForm.warehouseId) {
    result = result.filter(i => i.warehouseId === searchForm.warehouseId)
  }

  if (searchForm.status) {
    result = result.filter(i => i.status === searchForm.status)
  }

  pagination.total = result.length
  return result
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    unissued: 'orange',
    issued: 'green',
    void: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    unissued: '待开票',
    issued: '已开票',
    void: '已作废',
  }
  return texts[status] || status
}

function getComplianceColor(status: string) {
  const colors: Record<string, string> = {
    normal: 'green',
    abnormal: 'red',
  }
  return colors[status] || 'gray'
}

function getComplianceText(status: string) {
  const texts: Record<string, string> = {
    normal: '正常',
    abnormal: '异常',
  }
  return texts[status] || status
}

function handleViewInvoice(record: InvoiceBatch) {
  currentInvoice.value = record
  viewInvoiceModalVisible.value = true
}

function handleUpload(record: InvoiceBatch) {
  currentInvoice.value = record
  uploadForm.invoiceTitle = record.warehouseName + '项目'
  uploadForm.amount = record.invoiceAmount
  uploadForm.invoiceNo = ''
  uploadForm.invoiceDate = ''
  uploadForm.files = []
  uploadForm.remark = ''
  uploadModalVisible.value = true
}

function handleReupload(record: InvoiceBatch) {
  currentInvoice.value = record
  uploadForm.invoiceTitle = record.invoiceTitle || ''
  uploadForm.amount = record.invoiceAmount
  uploadForm.invoiceNo = ''
  uploadForm.invoiceDate = ''
  uploadForm.files = []
  uploadForm.remark = ''
  uploadModalVisible.value = true
}

function handleUploadConfirm() {
  if (!uploadForm.invoiceTitle || !uploadForm.amount || !uploadForm.invoiceNo) {
    Message.warning('请填写完整发票信息')
    return
  }

  const record = currentInvoice.value
  if (!record) return

  const historyRecord: IssueHistory = {
    invoiceTitle: uploadForm.invoiceTitle,
    invoiceNo: uploadForm.invoiceNo,
    amount: uploadForm.amount,
    issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'success',
  }

  const idx = invoiceList.value.findIndex(i => i.batchNo === record.batchNo)
  invoiceList.value[idx] = {
    ...invoiceList.value[idx],
    status: 'issued',
    invoiceTitle: uploadForm.invoiceTitle,
    invoiceNo: uploadForm.invoiceNo,
    invoiceDate: uploadForm.invoiceDate,
    issuedAmount: uploadForm.amount,
    issueHistory: [...(record.issueHistory || []), historyRecord],
  }

  uploadModalVisible.value = false
  Message.success('发票上传成功')
}

function handleViewOrders(record: InvoiceBatch | null) {
  if (!record) return
  currentBatchOrders.value = record.orders || []
  ordersModalVisible.value = true
}

function handleSearch() {
  pagination.current = 1
  Message.success('搜索完成')
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.warehouseId = undefined
  searchForm.status = undefined
  searchForm.dateRange = []
  pagination.current = 1
  selectedKeys.value = []
}

function handlePageChange(page: number) {
  pagination.current = page
}
</script>

<style scoped lang="less">
.supplier-invoice {
  padding: 16px;

  :deep(.arco-tabs-header) {
    margin-bottom: 16px;
    border-bottom: none;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .upload-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }

  .text-primary {
    color: var(--color-primary);
    font-weight: 600;
  }

  .text-warning {
    color: var(--color-warning);
    font-weight: 500;
  }

  .text-danger {
    color: var(--color-danger);
    font-weight: 600;
  }

  :deep(.arco-descriptions-item-value) {
    font-weight: 500;
  }
}
</style>
