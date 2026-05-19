<template>
  <div class="invoice-output page-container">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleApplyInvoice">
            <template #icon><icon-plus /></template>
            申请开票
          </a-button>
          <a-button @click="handleBatchExport">
            <template #icon><icon-download /></template>
            批量导出
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-tab="activeTab" class="invoice-tabs">
        <a-tab-pane key="all">
          <template #title>全部 ({{ stats.totalCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="pending">
          <template #title>待开票 ({{ stats.pendingCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="invoicing">
          <template #title>开票中 ({{ stats.invoicingCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="invoicing_failed">
          <template #title>开票失败 ({{ stats.invoicingFailedCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="invoiced">
          <template #title>已开票 ({{ stats.invoicedCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="voided">
          <template #title>已作废 ({{ stats.voidedCount }})</template>
        </a-tab-pane>
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.orderNo"
            placeholder="订单编号"
            style="width: 160px"
            @search="handleSearch"
          />
          <a-input-search
            v-model="searchForm.receivableNo"
            placeholder="应收记录编号"
            style="width: 160px"
            @search="handleSearch"
          />
          <a-input-search
            v-model="searchForm.invoiceTitle"
            placeholder="发票抬头"
            style="width: 160px"
            @search="handleSearch"
          />
          <a-select
            v-model="searchForm.taxType"
            placeholder="票据类型"
            style="width: 150px"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="special">增值税专用发票</a-option>
            <a-option value="general">增值税普通发票</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-table
        :data="filteredList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="订单编号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="应收记录编号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewReceivable(record)">{{ record.receivableNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="发票抬头" :width="180">
            <template #cell="{ record }">
              <div class="invoice-title">{{ record.invoiceTitle }}</div>
            </template>
          </a-table-column>
          <a-table-column title="票据类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.taxType === 'special' ? 'blue' : 'cyan'">
                {{ record.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="开票金额" :width="120" align="right">
            <template #cell="{ record }">
              <span>¥{{ record.invoiceAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实际开票金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="actual-amount">¥{{ record.actualInvoiceAmount?.toLocaleString() || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.invoiceStatus)">
                {{ getStatusText(record.invoiceStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="280" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  v-if="record.invoiceStatus === 'invoiced' || record.invoiceStatus === 'voided' || record.invoiceStatus === 'invoicing' || record.invoiceStatus === 'invoicing_failed'"
                  type="text"
                  size="small"
                  @click="handleViewInvoice(record)"
                >
                  查看
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'pending' || record.invoiceStatus === 'voided'"
                  type="text"
                  size="small"
                  :disabled="record.accountingStatus !== 'recorded'"
                  @click="handleOpenInvoice(record)"
                >
                  {{ record.accountingStatus === 'recorded' ? (record.invoiceStatus === 'voided' ? '重新开票' : '开票') : '记账未完成' }}
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'pending'"
                  type="text"
                  size="small"
                  :disabled="record.accountingStatus !== 'recorded'"
                  status="primary"
                  @click="handleOpenOnlineInvoice(record)"
                >
                  在线开票
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'invoicing_failed'"
                  type="text"
                  size="small"
                  status="primary"
                  @click="handleOnlineInvoiceRetry(record)"
                >
                  重试
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'invoiced'"
                  type="text"
                  size="small"
                  status="warning"
                  @click="handleVoidInvoice(record)"
                >
                  作废
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="invoiceModalVisible"
      title="开具发票"
      :width="900"
      :footer="null"
      @cancel="invoiceModalVisible = false"
    >
      <a-alert type="warning" :closable="false" style="margin-bottom: 16px">
        请选择「记账已完成」的交易撮合分记录进行开票，系统将自动核对发票金额
      </a-alert>

      <a-form-item label="开票方式" required style="margin-bottom: 16px;">
        <a-radio-group v-model="invoiceForm.invoiceMethod" button-style="solid">
          <a-radio value="online">在线开票</a-radio>
          <a-radio value="upload">上传发票</a-radio>
        </a-radio-group>
      </a-form-item>

      <div class="invoice-summary">
        <a-space>
          <span>订单编号：<strong>{{ currentRecord?.orderNo }}</strong></span>
          <span>可开票金额：<strong class="text-primary">¥{{ currentRecord?.availableAmount?.toLocaleString() }}</strong></span>
          <span>已选金额：<strong class="text-success">¥{{ selectedAmount?.toLocaleString() }}</strong></span>
        </a-space>
      </div>

      <a-table
        :data="splitRecordList"
        :pagination="false"
        row-key="id"
        class="split-table"
        :row-selection="splitRowSelection"
      >
        <template #columns>
          <a-table-column title="交易撮合分记录编号" data-index="splitNo" :width="180" />
          <a-table-column title="关联应收记录" data-index="receivableNo" :width="150" />
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-primary">¥{{ record.splitAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="记账状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.accountingStatus === 'recorded' ? 'green' : 'orange'">
                {{ record.accountingStatus === 'recorded' ? '已记账' : '未记账' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="记账时间" data-index="accountingTime" :width="160" />
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-button
                v-if="record.accountingStatus === 'recorded'"
                type="text"
                size="small"
                @click="handleSingleSplitInvoice(record)"
              >
                单独开票
              </a-button>
              <span v-else class="text-gray">记账未完成</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>发票信息填写</a-divider>

      <a-form :model="invoiceForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="票据类型" required>
              <a-select v-model="invoiceForm.invoiceType" placeholder="请选择票据类型">
                <a-option value="special">增值税专用发票</a-option>
                <a-option value="general">增值税普通发票</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="发票抬头" required>
              <a-input v-model="invoiceForm.invoiceTitle" placeholder="请输入发票抬头" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="纳税人识别号" required>
              <a-input v-model="invoiceForm.taxNumber" placeholder="请输入纳税人识别号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="地址电话">
              <a-input v-model="invoiceForm.addressPhone" placeholder="请输入地址电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开户行及账号">
              <a-input v-model="invoiceForm.bankAccount" placeholder="请输入开户行及账号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开票金额" required>
              <a-input-number
                v-model="invoiceForm.invoiceAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注">
              <a-input v-model="invoiceForm.remark" placeholder="请输入备注（选填）" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item 
          v-if="invoiceForm.invoiceMethod === 'upload'" 
          label="发票图片上传（OCR自动识别）"
          required
        >
          <a-upload
            :custom-request="handleUploadRequest"
            :show-file-list="false"
            accept="image/*"
            @success="handleUploadSuccess"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              上传发票图片
            </a-button>
          </a-upload>
          <div v-if="invoiceForm.invoiceImage" class="upload-preview">
            <a-image :src="invoiceForm.invoiceImage" width="120" />
            <a-button size="small" @click="invoiceForm.invoiceImage = ''">删除</a-button>
          </div>
        </a-form-item>
      </a-form>

      <a-divider>OCR识别结果</a-divider>

      <a-descriptions v-if="ocrResult" :column="2" bordered size="small">
        <a-descriptions-item label="识别金额">
          <span :class="{ 'amount-match': ocrResult.amountMatch, 'amount-mismatch': !ocrResult.amountMatch }">
            ¥{{ ocrResult.recognizedAmount?.toLocaleString() }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="核对结果">
          <a-tag :color="ocrResult.amountMatch ? 'green' : 'red'">
            {{ ocrResult.amountMatch ? '金额一致' : '金额不一致' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发票代码">{{ ocrResult.invoiceCode || '-' }}</a-descriptions-item>
        <a-descriptions-item label="发票号码">{{ ocrResult.invoiceNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="开票日期" :span="2">{{ ocrResult.invoiceDate || '-' }}</a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="上传发票图片后自动识别，可用于金额核对" />

      <div v-if="ocrResult && !ocrResult.amountMatch" class="ocr-warning">
        <icon-info-circle style="color: #ff7d00; margin-right: 8px;" />
        识别金额与开票金额不一致，请核对后确认开票
      </div>

      <div class="modal-footer">
        <a-space>
          <a-button @click="invoiceModalVisible = false">取消</a-button>
          <a-button 
            v-if="invoiceForm.invoiceMethod === 'online'"
            type="primary" 
            :loading="isSubmitting"
            @click="handleOnlineInvoice"
            :disabled="selectedSplitRecords.length === 0 && currentRecord?.invoiceStatus !== 'invoicing_failed'"
          >
            <template #icon><icon-file-text /></template>
            {{ currentRecord?.invoiceStatus === 'invoicing_failed' ? '重新开票' : '在线开票' }}
          </a-button>
          <a-button 
            v-if="invoiceForm.invoiceMethod === 'upload'"
            type="primary" 
            :loading="isSubmitting"
            @click="handleUploadInvoice"
            :disabled="selectedSplitRecords.length === 0 || !invoiceForm.invoiceImage"
          >
            <template #icon><icon-upload /></template>
            确认上传开票
          </a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="viewInvoiceVisible"
      :title="currentRecord?.invoiceStatus === 'invoicing' ? '开票进度' : (currentRecord?.invoiceStatus === 'invoicing_failed' ? '开票失败' : '查看发票')"
      :width="800"
      :footer="null"
    >
      <template v-if="currentRecord?.invoiceStatus === 'invoicing'">
        <div class="invoicing-progress">
          <a-result status="warning" title="开票处理中">
            <template #subtitle>
              <div>发票编号：<strong>{{ currentRecord?.invoiceNo }}</strong></div>
              <div style="margin-top: 8px;">开票申请已提交，系统正在处理中，预计5分钟内完成开票</div>
            </template>
            <template #extra>
              <a-button type="primary" @click="handleRecognizeInvoice(currentRecord)">
                <template #icon><icon-file-text /></template>
                识别开票结果
              </a-button>
            </template>
          </a-result>
        </div>
      </template>

      <template v-else-if="currentRecord?.invoiceStatus === 'invoicing_failed'">
        <div class="invoicing-progress">
          <a-result status="error" title="开票失败">
            <template #subtitle>
              <div>发票编号：<strong>{{ currentRecord?.invoiceNo }}</strong></div>
              <div style="margin-top: 8px;">开票处理异常，请点击下方按钮重试</div>
            </template>
            <template #extra>
              <a-button type="primary" @click="handleOnlineInvoiceRetry(currentRecord)">
                <template #icon><icon-file-text /></template>
                重新开票
              </a-button>
            </template>
          </a-result>
        </div>
      </template>

      <template v-else>
        <a-descriptions :column="2" bordered class="invoice-info">
          <a-descriptions-item label="订单编号">{{ currentRecord?.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="应收记录编号">{{ currentRecord?.receivableNo }}</a-descriptions-item>
          <a-descriptions-item label="发票抬头">{{ currentRecord?.invoiceTitle }}</a-descriptions-item>
          <a-descriptions-item label="票据类型">
            <a-tag :color="currentRecord?.taxType === 'special' ? 'blue' : 'cyan'">
              {{ currentRecord?.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="实际开票金额">
            <span class="highlight">¥{{ currentRecord?.actualInvoiceAmount?.toLocaleString() }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="开票时间" :span="2">{{ currentRecord?.invoiceTime }}</a-descriptions-item>
        </a-descriptions>

        <a-divider>发票图片</a-divider>

        <div class="invoice-image-container">
          <a-image
            v-if="currentRecord?.invoiceImage"
            :src="currentRecord.invoiceImage"
            width="100%"
          />
          <a-empty v-else description="暂无发票图片" />
        </div>

        <div class="invoice-actions">
          <a-button type="primary" @click="handleDownloadInvoice(currentRecord)">
            <template #icon><icon-download /></template>
            下载发票
          </a-button>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:visible="voidModalVisible"
      title="作废发票"
      :width="500"
      @ok="handleVoidConfirm"
    >
      <a-form :model="voidForm" layout="vertical">
        <a-form-item label="发票编号">
          <a-input :value="currentRecord?.invoiceNo" disabled />
        </a-form-item>
        <a-form-item label="作废原因" required>
          <a-textarea v-model="voidForm.reason" placeholder="请输入作废原因" :max-length="200" show-word-limit />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

interface SplitRecord {
  id: string
  splitNo: string
  receivableNo: string
  splitAmount: number
  accountingStatus: 'recorded' | 'unrecorded'
  accountingTime: string
}

interface InvoiceRecord {
  id: string
  orderNo: string
  receivableNo: string
  invoiceTitle: string
  invoiceAmount: number
  actualInvoiceAmount?: number
  availableAmount: number
  invoiceStatus: 'pending' | 'invoicing' | 'invoicing_failed' | 'invoiced' | 'voided'
  accountingStatus: 'recorded' | 'unrecorded'
  taxType: 'special' | 'general'
  invoiceNo?: string
  invoiceImage?: string
  invoiceTime?: string
  voidReason?: string
  createTime: string
}

const loading = ref(false)
const activeTab = ref('all')
const invoiceModalVisible = ref(false)
const viewInvoiceVisible = ref(false)
const voidModalVisible = ref(false)
const currentRecord = ref<InvoiceRecord | null>(null)
const selectedSplitRecords = ref<SplitRecord[]>([])
const selectedSplitKeys = ref<string[]>([])

const splitRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedSplitKeys.value,
  onChange: (keys: string[], records: SplitRecord[]) => {
    selectedSplitKeys.value = keys
    selectedSplitRecords.value = records.filter(r => r.accountingStatus === 'recorded')
    const totalAmount = selectedSplitRecords.value.reduce((sum, r) => sum + r.splitAmount, 0)
    invoiceForm.invoiceAmount = totalAmount
  },
}))

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  orderNo: '',
  receivableNo: '',
  invoiceTitle: '',
  taxType: '' as '' | 'special' | 'general',
  dateRange: [] as string[],
})

const invoiceForm = reactive({
  invoiceMethod: 'online',
  invoiceType: 'special',
  invoiceTitle: '',
  taxNumber: '',
  addressPhone: '',
  bankAccount: '',
  invoiceAmount: 0,
  remark: '',
  invoiceImage: '',
})

const isSubmitting = ref(false)

const voidForm = reactive({
  reason: '',
})

const ocrResult = ref<{
  recognizedAmount: number
  amountMatch: boolean
  invoiceCode?: string
  invoiceNo?: string
  invoiceDate?: string
} | null>(null)

const selectedAmount = computed(() => {
  return selectedSplitRecords.value.reduce((sum, r) => sum + r.splitAmount, 0)
})

const splitRecordList = ref<SplitRecord[]>([
  { id: 's1', splitNo: 'JJF202401150001', receivableNo: 'YS202401150001', splitAmount: 5000, accountingStatus: 'recorded', accountingTime: '2024-01-16 10:00:00' },
  { id: 's2', splitNo: 'JJF202401140001', receivableNo: 'YS202401150002', splitAmount: 3200, accountingStatus: 'recorded', accountingTime: '2024-01-15 14:00:00' },
  { id: 's3', splitNo: 'JJF202401130001', receivableNo: 'YS202401140001', splitAmount: 2800, accountingStatus: 'unrecorded', accountingTime: '-' },
])

const allList = ref<InvoiceRecord[]>([
  {
    id: '1',
    orderNo: 'SO202401150001',
    receivableNo: 'YS202401150001',
    invoiceTitle: '深圳市某某建筑有限公司',
    invoiceAmount: 6290,
    actualInvoiceAmount: 6290,
    availableAmount: 0,
    invoiceStatus: 'invoiced',
    accountingStatus: 'recorded',
    taxType: 'special',
    invoiceNo: 'FP001',
    invoiceImage: '',
    invoiceTime: '2024-01-16 10:30:00',
    createTime: '2024-01-15 16:30:00',
  },
  {
    id: '7',
    orderNo: 'SO202401160001',
    receivableNo: 'YS202401160001',
    invoiceTitle: '上海某某建设工程有限公司',
    invoiceAmount: 5680,
    actualInvoiceAmount: 5680,
    availableAmount: 0,
    invoiceStatus: 'invoicing',
    accountingStatus: 'recorded',
    taxType: 'special',
    invoiceNo: 'FP202405190001',
    invoiceTime: '2024-05-19 14:25:00',
    createTime: '2024-05-19 14:20:00',
  },
  {
    id: '8',
    orderNo: 'SO202401150002',
    receivableNo: 'YS202401150003',
    invoiceTitle: '广州市某某建设集团有限公司',
    invoiceAmount: 8900,
    actualInvoiceAmount: 8900,
    availableAmount: 0,
    invoiceStatus: 'invoicing_failed',
    accountingStatus: 'recorded',
    taxType: 'general',
    invoiceNo: 'FP202405190002',
    invoiceTime: '2024-05-19 15:00:00',
    createTime: '2024-05-19 14:55:00',
  },
  {
    id: '2',
    orderNo: 'SO202401140001',
    receivableNo: 'YS202401150002',
    invoiceTitle: '广州某某工程有限公司',
    invoiceAmount: 4475,
    availableAmount: 4475,
    invoiceStatus: 'pending',
    accountingStatus: 'recorded',
    taxType: 'special',
    createTime: '2024-01-15 14:20:00',
  },
  {
    id: '3',
    orderNo: 'SO202401130001',
    receivableNo: 'YS202401140001',
    invoiceTitle: '深圳某某建设集团',
    invoiceAmount: 2615,
    actualInvoiceAmount: 2615,
    availableAmount: 0,
    invoiceStatus: 'invoiced',
    accountingStatus: 'recorded',
    taxType: 'special',
    invoiceNo: 'FP002',
    invoiceImage: '',
    invoiceTime: '2024-01-15 09:00:00',
    createTime: '2024-01-14 10:00:00',
  },
  {
    id: '4',
    orderNo: 'SO202401120001',
    receivableNo: 'YS202401130001',
    invoiceTitle: '东莞市某某建材贸易公司',
    invoiceAmount: 8400,
    availableAmount: 8400,
    invoiceStatus: 'pending',
    accountingStatus: 'unrecorded',
    taxType: 'general',
    createTime: '2024-01-13 15:30:00',
  },
  {
    id: '5',
    orderNo: 'SO202401110001',
    receivableNo: 'YS202401120001',
    invoiceTitle: '佛山市某某工程材料公司',
    invoiceAmount: 4560,
    actualInvoiceAmount: 4560,
    availableAmount: 0,
    invoiceStatus: 'invoiced',
    accountingStatus: 'recorded',
    taxType: 'special',
    invoiceNo: 'FP003',
    invoiceImage: '',
    invoiceTime: '2024-01-13 11:20:00',
    createTime: '2024-01-12 09:00:00',
  },
  {
    id: '6',
    orderNo: 'SO202401100001',
    receivableNo: 'YS202401110001',
    invoiceTitle: '惠州市某某建材公司',
    invoiceAmount: 3200,
    actualInvoiceAmount: 3200,
    availableAmount: 0,
    invoiceStatus: 'voided',
    accountingStatus: 'recorded',
    taxType: 'special',
    invoiceNo: 'FP004',
    invoiceImage: '',
    invoiceTime: '2024-01-12 08:00:00',
    voidReason: '发票信息有误',
    createTime: '2024-01-11 09:00:00',
  },
])

const stats = computed(() => {
  return {
    totalCount: allList.value.length,
    pendingCount: allList.value.filter(i => i.invoiceStatus === 'pending').length,
    invoicingCount: allList.value.filter(i => i.invoiceStatus === 'invoicing').length,
    invoicingFailedCount: allList.value.filter(i => i.invoiceStatus === 'invoicing_failed').length,
    invoicedCount: allList.value.filter(i => i.invoiceStatus === 'invoiced').length,
    voidedCount: allList.value.filter(i => i.invoiceStatus === 'voided').length,
  }
})

const filteredList = computed(() => {
  let filtered = [...allList.value]

  if (activeTab.value === 'pending') {
    filtered = filtered.filter(item => item.invoiceStatus === 'pending')
  } else if (activeTab.value === 'invoicing') {
    filtered = filtered.filter(item => item.invoiceStatus === 'invoicing')
  } else if (activeTab.value === 'invoicing_failed') {
    filtered = filtered.filter(item => item.invoiceStatus === 'invoicing_failed')
  } else if (activeTab.value === 'invoiced') {
    filtered = filtered.filter(item => item.invoiceStatus === 'invoiced')
  } else if (activeTab.value === 'voided') {
    filtered = filtered.filter(item => item.invoiceStatus === 'voided')
  }

  if (searchForm.orderNo) {
    filtered = filtered.filter(item => item.orderNo.includes(searchForm.orderNo))
  }

  if (searchForm.receivableNo) {
    filtered = filtered.filter(item => item.receivableNo.includes(searchForm.receivableNo))
  }

  if (searchForm.invoiceTitle) {
    filtered = filtered.filter(item => item.invoiceTitle.includes(searchForm.invoiceTitle))
  }

  if (searchForm.taxType) {
    filtered = filtered.filter(item => item.taxType === searchForm.taxType)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createTime.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }

  pagination.total = filtered.length
  return filtered.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )
})

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    invoicing: 'blue',
    invoicing_failed: 'red',
    invoiced: 'green',
    voided: 'red',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待开票',
    invoicing: '开票中',
    invoicing_failed: '开票失败',
    invoiced: '已开票',
    voided: '已作废',
  }
  return textMap[status] || status
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.orderNo = ''
  searchForm.receivableNo = ''
  searchForm.invoiceTitle = ''
  searchForm.taxType = ''
  searchForm.dateRange = []
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewOrder(record: InvoiceRecord) {
  Message.info(`跳转订单详情: ${record.orderNo}`)
}

function handleViewReceivable(record: InvoiceRecord) {
  Message.info(`跳转应收记录: ${record.receivableNo}`)
}

function handleOpenInvoice(record: InvoiceRecord) {
  if (record.accountingStatus !== 'recorded') {
    Message.warning('该订单记账未完成，暂不可开票')
    return
  }
  currentRecord.value = record
  invoiceForm.invoiceMethod = 'upload'
  invoiceForm.invoiceType = 'normal'
  invoiceForm.invoiceTitle = record.invoiceTitle || ''
  invoiceForm.taxNumber = ''
  invoiceForm.addressPhone = ''
  invoiceForm.bankAccount = ''
  invoiceForm.invoiceAmount = record.availableAmount
  invoiceForm.remark = ''
  invoiceForm.invoiceImage = ''
  ocrResult.value = null
  selectedSplitRecords.value = []
  invoiceModalVisible.value = true
}

function handleOpenOnlineInvoice(record: InvoiceRecord) {
  if (record.accountingStatus !== 'recorded') {
    Message.warning('该订单记账未完成，暂不可开票')
    return
  }
  currentRecord.value = record
  invoiceForm.invoiceMethod = 'online'
  invoiceForm.invoiceType = 'normal'
  invoiceForm.invoiceTitle = record.invoiceTitle || ''
  invoiceForm.taxNumber = ''
  invoiceForm.addressPhone = ''
  invoiceForm.bankAccount = ''
  invoiceForm.invoiceAmount = record.availableAmount
  invoiceForm.remark = ''
  invoiceForm.invoiceImage = ''
  ocrResult.value = null
  selectedSplitRecords.value = []
  invoiceModalVisible.value = true
}

function handleSingleSplitInvoice(record: SplitRecord) {
  if (!currentRecord.value) {
    Message.warning('请先选择开票订单')
    return
  }
  
  selectedSplitRecords.value = [record]
  selectedSplitKeys.value = [record.id]
  invoiceForm.invoiceAmount = record.splitAmount
}

function handleUploadRequest(options: any) {
  setTimeout(() => {
    options.onSuccess(null)
  }, 500)
}

function handleUploadSuccess(file: any) {
  invoiceForm.invoiceImage = URL.createObjectURL(file.file)
  simulateOcrRecognition()
}

function simulateOcrRecognition() {
  const randomAmount = invoiceForm.invoiceAmount * (0.9 + Math.random() * 0.2)
  ocrResult.value = {
    recognizedAmount: Math.round(randomAmount * 100) / 100,
    amountMatch: Math.abs(randomAmount - invoiceForm.invoiceAmount) / invoiceForm.invoiceAmount < 0.05,
    invoiceCode: '144031900110',
    invoiceNo: 'INV' + Date.now().toString().slice(-10),
    invoiceDate: new Date().toLocaleDateString('zh-CN'),
  }
}

function handleViewInvoice(record: InvoiceRecord) {
  currentRecord.value = record
  viewInvoiceVisible.value = true
}

function handleDownloadInvoice(record: InvoiceRecord) {
  Message.success(`开始下载发票: ${record.orderNo}`)
}

function handleVoidInvoice(record: InvoiceRecord) {
  currentRecord.value = record
  voidForm.reason = ''
  voidModalVisible.value = true
}

function handleVoidConfirm() {
  if (!voidForm.reason.trim()) {
    Message.warning('请输入作废原因')
    return
  }

  if (currentRecord.value) {
    const idx = allList.value.findIndex(item => item.id === currentRecord.value!.id)
    allList.value[idx] = {
      ...allList.value[idx],
      invoiceStatus: 'voided',
      voidReason: voidForm.reason,
      availableAmount: allList.value[idx].actualInvoiceAmount || 0,
    }
  }

  voidModalVisible.value = false
  Message.success('发票作废成功')
}

function handleApplyInvoice() {
  const pendingRecords = allList.value.filter(
    item => item.invoiceStatus === 'pending' && item.accountingStatus === 'recorded'
  )
  
  if (pendingRecords.length === 0) {
    Message.info('暂无记账完成的待开票记录')
    return
  }
  
  currentRecord.value = pendingRecords[0]
  invoiceForm.invoiceMethod = 'online'
  invoiceForm.invoiceType = 'normal'
  invoiceForm.invoiceTitle = pendingRecords[0].invoiceTitle || ''
  invoiceForm.taxNumber = ''
  invoiceForm.addressPhone = ''
  invoiceForm.bankAccount = ''
  invoiceForm.invoiceAmount = pendingRecords[0].availableAmount
  invoiceForm.remark = ''
  invoiceForm.invoiceImage = ''
  ocrResult.value = null
  selectedSplitRecords.value = []
  invoiceModalVisible.value = true
}

function handleOnlineInvoice() {
  if (!invoiceForm.invoiceTitle.trim()) {
    Message.error('请输入发票抬头')
    return
  }
  if (!invoiceForm.taxNumber.trim()) {
    Message.error('请输入纳税人识别号')
    return
  }
  if (!invoiceForm.invoiceAmount) {
    Message.error('请输入开票金额')
    return
  }

  if (selectedSplitRecords.value.length === 0 && currentRecord.value?.invoiceStatus !== 'invoicing_failed') {
    Message.error('请选择至少一条记账完成的交易撮合分记录')
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    const isRetry = currentRecord.value?.invoiceStatus === 'invoicing_failed'
    const invoiceNo = isRetry && currentRecord.value?.invoiceNo
      ? currentRecord.value.invoiceNo
      : 'FP' + Date.now().toString().slice(-10)

    if (currentRecord.value) {
      const idx = allList.value.findIndex(item => item.id === currentRecord.value!.id)
      allList.value[idx] = {
        ...allList.value[idx],
        invoiceStatus: 'invoicing',
        actualInvoiceAmount: invoiceForm.invoiceAmount,
        invoiceTitle: invoiceForm.invoiceTitle,
        taxType: invoiceForm.invoiceType as 'special' | 'general',
        invoiceNo: invoiceNo,
        invoiceTime: new Date().toLocaleString('zh-CN'),
        availableAmount: 0,
      }
    }

    isSubmitting.value = false
    invoiceModalVisible.value = false
    Message.success(`开票申请已提交！发票编号：${invoiceNo}，预计5分钟内完成开票`)
  }, 2000)
}

function handleRecognizeInvoice(record: InvoiceRecord | null) {
  if (!record || !record.invoiceNo || !record.actualInvoiceAmount) {
    Message.error('开票信息不完整')
    return
  }

  const isSuccess = Math.random() > 0.3

  if (!isSuccess) {
    const idx = allList.value.findIndex(item => item.id === record.id)
    if (idx !== -1) {
      allList.value[idx] = {
        ...allList.value[idx],
        invoiceStatus: 'invoicing_failed',
      }
    }
    viewInvoiceVisible.value = false
    Message.error(`开票失败！发票编号：${record.invoiceNo}，请重试`)
    return
  }

  const invoiceCode = '144031900110'
  const invoiceDate = new Date().toLocaleDateString('zh-CN')
  const generatedInvoiceImage = `https://neeko-copilot.bytedance.net/api/text2image?prompt=Chinese%20electronic%20invoice%20receipt%20template%20with%20invoice%20code%20${invoiceCode}%20invoice%20number%20${record.invoiceNo}%20date%20${invoiceDate}%20amount%20${record.actualInvoiceAmount}%20CNY%20company%20name%20${encodeURIComponent(record.invoiceTitle)}%20tax%20number%20professional%20financial%20document%20clean%20design&image_size=landscape_4_3`

  const idx = allList.value.findIndex(item => item.id === record.id)
  if (idx !== -1) {
    allList.value[idx] = {
      ...allList.value[idx],
      invoiceStatus: 'invoiced',
      invoiceImage: generatedInvoiceImage,
    }
  }

  viewInvoiceVisible.value = false
  Message.success(`开票完成！发票编号：${record.invoiceNo}，请查看发票详情`)
}

function handleOnlineInvoiceRetry(record: InvoiceRecord | null) {
  if (!record) return

  currentRecord.value = record
  invoiceForm.invoiceMethod = 'online'
  invoiceForm.invoiceType = 'normal'
  invoiceForm.invoiceTitle = record.invoiceTitle || ''
  invoiceForm.taxNumber = ''
  invoiceForm.addressPhone = ''
  invoiceForm.bankAccount = ''
  invoiceForm.invoiceAmount = record.actualInvoiceAmount || 0
  invoiceForm.remark = ''
  invoiceForm.invoiceImage = ''
  ocrResult.value = null
  selectedSplitRecords.value = []
  selectedSplitKeys.value = []

  viewInvoiceVisible.value = false
  invoiceModalVisible.value = true
}

function handleUploadInvoice() {
  if (!invoiceForm.invoiceTitle.trim()) {
    Message.error('请输入发票抬头')
    return
  }
  if (!invoiceForm.taxNumber.trim()) {
    Message.error('请输入纳税人识别号')
    return
  }
  if (!invoiceForm.invoiceImage) {
    Message.error('请上传发票图片')
    return
  }

  if (selectedSplitRecords.value.length === 0) {
    Message.error('请选择至少一条记账完成的交易撮合分记录')
    return
  }

  isSubmitting.value = true
  
  setTimeout(() => {
    const invoiceNo = 'FP' + Date.now().toString().slice(-10)
    
    if (currentRecord.value) {
      const idx = allList.value.findIndex(item => item.id === currentRecord.value!.id)
      allList.value[idx] = {
        ...allList.value[idx],
        invoiceStatus: 'invoiced',
        actualInvoiceAmount: invoiceForm.invoiceAmount,
        invoiceTitle: invoiceForm.invoiceTitle,
        taxType: invoiceForm.invoiceType as 'special' | 'general',
        invoiceImage: invoiceForm.invoiceImage,
        invoiceNo: invoiceNo,
        invoiceTime: new Date().toLocaleString('zh-CN'),
        availableAmount: 0,
      }
    }

    isSubmitting.value = false
    invoiceModalVisible.value = false
    Message.success(`上传开票成功！发票编号：${invoiceNo}`)
  }, 2000)
}

function handleBatchExport() {
  if (filteredList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${filteredList.value.length} 条发票记录`)
}
</script>

<style scoped lang="less">
.invoice-output {
  padding: 16px;
}

.invoice-tabs {
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.invoice-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actual-amount {
  color: #165dff;
  font-weight: 500;
}

.text-primary {
  color: #165dff;
  font-weight: 500;
}

.invoice-summary {
  padding: 12px 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
  margin-bottom: 16px;
}

.split-table {
  margin-bottom: 16px;
  border: 1px solid var(--color-neutral-3);
  border-radius: 4px;
}

.upload-preview {
  margin-top: 12px;
}

.ocr-warning {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 12px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
  color: #d46b00;
  font-size: 13px;
}

.amount-match {
  color: #52c41a;
  font-weight: 600;
}

.amount-mismatch {
  color: #ff4d4f;
  font-weight: 600;
}

.invoice-info {
  margin-bottom: 16px;
}

.highlight {
  color: #165dff;
  font-weight: 600;
}

.invoice-image-container {
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.invoice-actions {
  display: flex;
  justify-content: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid var(--color-neutral-2);
  margin-top: 16px;
}

.text-success {
  color: #52c41a;
  font-weight: 500;
}

.invoicing-progress {
  padding: 40px 20px;
  text-align: center;
}
</style>
