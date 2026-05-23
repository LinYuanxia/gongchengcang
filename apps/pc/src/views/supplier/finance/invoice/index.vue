<template>
  <div class="supplier-invoice page-container">
    <a-card>
      <template #extra>
        <a-space>
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
        <a-tab-pane key="issued">
          <template #title>已开票 ({{ stats.issuedCount }})</template>
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
        v-model:selected-keys="selectedRowKeys"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="订单编号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="票据类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.taxType === 'special' ? 'blue' : 'cyan'">
                {{ record.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发票抬头" :width="180">
            <template #cell="{ record }">
              <div class="invoice-title">{{ record.invoiceTitle }}</div>
            </template>
          </a-table-column>
          <a-table-column title="纳税人识别号" :width="160">
            <template #cell="{ record }">
              {{ record.taxNumber || '-' }}
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
          <a-table-column title="发票号" :width="140">
            <template #cell="{ record }">
              {{ record.invoiceNo || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.invoiceStatus)">
                {{ getStatusText(record.invoiceStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="240" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button
                  v-if="record.invoiceStatus === 'pending'"
                  type="text" size="small" status="success" @click="handleInvoice(record)">
                  开票
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'issued'"
                  type="text" size="small" @click="handleDownload(record)">
                  下载
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'issued' && (record.voidCount || 0) < 1"
                  type="text" size="small" status="danger" @click="handleVoid(record)">
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
      :width="640"
      @ok="handleSubmitInvoice"
      @close="resetOcr"
      :ok-loading="isSubmitting"
    >
      <a-form :model="invoiceForm" layout="vertical">
        <a-alert type="info" :closable="false" style="margin-bottom: 16px">
          请上传发票文件完成开票，仅支持上传发票文件，不支持在线开票
        </a-alert>

        <a-form-item label="票据类型" required>
          <a-radio-group v-model="invoiceForm.taxType" button-style="solid">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="general">增值税普通发票</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="订单编号">
              <a-input :value="currentRecord?.orderNo" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开票金额" required>
              <a-input-number
                v-model="invoiceForm.amount"
                :min="0.01"
                :max="currentRecord?.invoiceAmount || 999999"
                :precision="2"
                placeholder="请输入开票金额"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="发票号码" required>
          <a-input v-model="invoiceForm.invoiceNo" placeholder="请输入发票号码" maxlength="20" />
        </a-form-item>

        <a-form-item label="发票抬头" required>
          <a-input v-model="invoiceForm.invoiceTitle" placeholder="请输入发票抬头" />
        </a-form-item>

        <a-form-item label="纳税人识别号" required>
          <a-input v-model="invoiceForm.taxNumber" placeholder="请输入纳税人识别号" />
        </a-form-item>

        <a-form-item label="发票文件" required>
          <div v-if="ocrState === 'pending' || ocrState === 'failed'">
            <a-upload
              :custom-request="handleUploadInvoiceFile"
              :show-file-list="false"
              accept=".pdf,.jpg,.png"
            >
              <template #upload-button>
                <a-button>
                  <template #icon><icon-upload /></template>
                  {{ ocrState === 'failed' ? '重新上传发票' : '上传发票文件' }}
                </a-button>
              </template>
            </a-upload>
            <div class="upload-tip">支持 PDF、JPG、PNG 格式，单个文件不超过10MB，上传后自动OCR识别</div>
          </div>

          <div v-if="ocrState === 'recognizing'" class="ocr-processing">
            <a-progress :percent="100" status="warning" :stroke-width="8">
              <template #text>
                <icon-loading />
              </template>
            </a-progress>
            <div style="text-align: center; margin-top: 8px; color: var(--color-text-3);">
              OCR识别中，请稍候...
            </div>
          </div>
        </a-form-item>

        <template v-if="ocrState === 'success' && ocrResult">
          <a-divider>OCR识别结果</a-divider>

          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="识别金额" :span="2">
              <span :class="{ 'match-success': ocrResult.amountMatch, 'match-fail': !ocrResult.amountMatch }">
                ¥{{ ocrResult.recognizedAmount.toLocaleString() }}
              </span>
              <a-tag :color="ocrResult.amountMatch ? 'green' : 'red'" style="margin-left: 8px">
                {{ ocrResult.amountMatch ? '金额一致' : '金额不一致' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="发票代码">{{ ocrResult.invoiceCode }}</a-descriptions-item>
            <a-descriptions-item label="发票号码">{{ ocrResult.invoiceNo }}</a-descriptions-item>
            <a-descriptions-item label="开票日期">{{ ocrResult.invoiceDate }}</a-descriptions-item>
            <a-descriptions-item label="销售方">{{ ocrResult.sellerName }}</a-descriptions-item>
            <a-descriptions-item label="购买方" :span="2">{{ ocrResult.buyerName }}</a-descriptions-item>
          </a-descriptions>

          <a-collapse :default-active-key="['product']" style="margin-top: 12px">
            <a-collapse-item key="product" header="商品明细核对">
              <a-table :data="ocrResult.items" :pagination="false" size="small" bordered>
                <template #columns>
                  <a-table-column title="商品名称" data-index="productName" />
                  <a-table-column title="数量" data-index="quantity" :width="80" />
                  <a-table-column title="单位" data-index="unit" :width="60" />
                  <a-table-column title="单价" data-index="unitPrice" :width="100" align="right">
                    <template #cell="{ record }">¥{{ record.unitPrice.toLocaleString() }}</template>
                  </a-table-column>
                  <a-table-column title="金额" data-index="amount" :width="120" align="right">
                    <template #cell="{ record }">¥{{ record.amount.toLocaleString() }}</template>
                  </a-table-column>
                  <a-table-column title="比对" :width="100">
                    <template #cell="{ record, rowIndex }">
                      <template v-if="currentRecord?.orderItems?.[rowIndex]">
                        <a-tag
                          :color="record.quantity === currentRecord.orderItems[rowIndex].quantity ? 'green' : 'red'"
                          size="small"
                        >
                          {{ record.quantity === currentRecord.orderItems[rowIndex].quantity ? '一致' : '不一致' }}
                        </a-tag>
                      </template>
                      <template v-else>
                        <a-tag color="gray" size="small">-</a-tag>
                      </template>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
              <div v-if="ocrResult.quantityMatch" class="ocr-qualified">
                <icon-check-circle style="color: rgb(var(--green-6)); margin-right: 4px;" />
                商品数量核对一致
              </div>
              <div v-else class="ocr-unqualified">
                <icon-close-circle style="color: rgb(var(--red-6)); margin-right: 4px;" />
                商品数量核对不一致，请检查发票
              </div>
            </a-collapse-item>
          </a-collapse>

          <a-alert
            v-if="ocrResult.qualified"
            type="success"
            :closable="false"
            style="margin-top: 12px"
          >
            <template #title>OCR识别合格，可提交开票</template>
            发票金额和商品数量均已通过校验
          </a-alert>
          <a-alert
            v-else
            type="error"
            :closable="false"
            style="margin-top: 12px"
          >
            <template #title>OCR识别校验未通过</template>
            <template v-if="!ocrResult.amountMatch">识别金额与订单金额不一致，{{ '\n' }}</template>
            <template v-if="!ocrResult.quantityMatch">商品数量与订单不符，请核对后重新上传发票</template>
          </a-alert>
        </template>

        <template v-if="ocrState === 'failed'">
          <a-divider>OCR识别失败</a-divider>
          <a-result status="error" title="OCR识别失败">
            <template #subtitle>
              未能识别发票上的有效信息，可能是图片不清晰或格式不正确
            </template>
            <template #extra>
              <a-button type="primary" @click="resetOcr">重新上传发票</a-button>
            </template>
          </a-result>
        </template>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="viewModalVisible"
      title="发票详情"
      :width="640"
      :footer="false"
    >
      <template v-if="currentRecord">
        <a-descriptions :column="2" bordered style="margin-bottom: 16px">
          <a-descriptions-item label="订单编号" :span="2">
            {{ currentRecord.orderNo }}
          </a-descriptions-item>
          <a-descriptions-item label="发票抬头" :span="2">
            {{ currentRecord.invoiceTitle }}
          </a-descriptions-item>
          <a-descriptions-item label="开票金额">
            ¥{{ currentRecord.invoiceAmount?.toLocaleString() }}
          </a-descriptions-item>
          <a-descriptions-item label="实际开票金额">
            ¥{{ currentRecord.actualInvoiceAmount?.toLocaleString() || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="开票状态">
            <a-tag :color="getStatusColor(currentRecord.invoiceStatus)">
              {{ getStatusText(currentRecord.invoiceStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="票据类型">
            <a-tag :color="currentRecord.taxType === 'special' ? 'blue' : 'cyan'">
              {{ currentRecord.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发票号">
            {{ currentRecord.invoiceNo || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="开票时间">
            {{ currentRecord.invoiceTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">
            {{ currentRecord.createTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="currentRecord.voidReason" label="作废原因" :span="2">
            {{ currentRecord.voidReason }}
          </a-descriptions-item>
        </a-descriptions>

        <div v-if="currentRecord.invoiceFile" class="invoice-image-section">
          <h4>发票文件</h4>
          <div class="image-preview">
            <a-image
              :src="currentRecord.invoiceFile"
              :width="200"
              :preview="true"
            />
          </div>
          <div class="image-actions">
            <a-button size="small" @click="handleDownload(currentRecord)">
              <template #icon><icon-download /></template>下载
            </a-button>
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 16px; text-align: right">
          <a-space>
            <a-button
              v-if="currentRecord.invoiceStatus === 'issued' && (currentRecord.voidCount || 0) < 1"
              status="danger"
              @click="handleVoid(currentRecord)">
              作废
            </a-button>
          </a-space>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:visible="voidModalVisible"
      title="作废发票"
      :width="480"
      @ok="handleConfirmVoid"
      :ok-loading="voidingLoading"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        <template #title>作废提示</template>
        每张发票仅允许作废1次，作废后不可恢复。确认作废该发票？
      </a-alert>
      <a-form :model="voidForm" layout="vertical">
        <a-form-item label="作废原因">
          <a-textarea
            v-model="voidForm.reason"
            placeholder="请输入作废原因（选填）"
            :max-length="200"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { TableRowSelection } from '@arco-design/web-vue/es/table/interface'

interface OrderItem {
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

interface SupplierInvoice {
  id: string
  orderNo: string
  invoiceTitle: string
  taxNumber?: string
  invoiceAmount: number
  actualInvoiceAmount?: number
  invoiceStatus: 'pending' | 'issued' | 'voided'
  taxType: 'special' | 'general'
  invoiceNo?: string
  invoiceFile?: string
  invoiceTime?: string
  voidReason?: string
  voidCount?: number
  createTime: string
  orderItems?: OrderItem[]
}

type OcrState = 'pending' | 'recognizing' | 'success' | 'failed'

interface OcrResult {
  recognizedAmount: number
  recognizedQuantity: number
  invoiceNo: string
  invoiceCode: string
  invoiceDate: string
  sellerName: string
  buyerName: string
  items: { productName: string; quantity: number; unit: string; unitPrice: number; amount: number }[]
  amountMatch: boolean
  quantityMatch: boolean
  qualified: boolean
}

const activeTab = ref('all')
const loading = ref(false)
const isSubmitting = ref(false)
const voidingLoading = ref(false)

const selectedRowKeys = ref<string[]>([])

const rowSelection: TableRowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
}

const searchForm = ref({
  orderNo: '',
  invoiceTitle: '',
  taxType: '' as '' | 'special' | 'general',
  dateRange: [] as string[],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const invoiceList = ref<SupplierInvoice[]>([
  {
    id: '1',
    orderNo: 'PO20240520001',
    invoiceTitle: '深圳建筑工程有限公司',
    taxNumber: '91440300MA5GXXXXXX',
    invoiceAmount: 128600,
    actualInvoiceAmount: 128600,
    invoiceStatus: 'issued',
    taxType: 'special',
    invoiceNo: 'FP20240520001',
    invoiceFile: 'https://picsum.photos/seed/sinv1/400/280',
    invoiceTime: '2024-05-20 16:30:00',
    voidCount: 0,
    createTime: '2024-05-19 10:00:00',
    orderItems: [
      { productName: '螺纹钢 HRB400E Φ25', quantity: 30, unit: '吨', unitPrice: 3850, amount: 115500 },
      { productName: '盘螺 HRB400E Φ8', quantity: 5, unit: '吨', unitPrice: 2620, amount: 13100 },
    ],
  },
  {
    id: '2',
    orderNo: 'PO20240519002',
    invoiceTitle: '广州建设集团',
    taxNumber: '91440101MA5YXXXXXX',
    invoiceAmount: 86000,
    actualInvoiceAmount: 86000,
    invoiceStatus: 'issued',
    taxType: 'special',
    invoiceNo: 'FP20240519002',
    invoiceFile: 'https://picsum.photos/seed/sinv2/400/280',
    invoiceTime: '2024-05-19 14:20:00',
    voidCount: 1,
    voidReason: '开票信息有误',
    createTime: '2024-05-18 09:30:00',
    orderItems: [
      { productName: '水泥 P.O42.5', quantity: 200, unit: '吨', unitPrice: 380, amount: 76000 },
      { productName: '砂石', quantity: 50, unit: '吨', unitPrice: 200, amount: 10000 },
    ],
  },
  {
    id: '3',
    orderNo: 'PO20240518003',
    invoiceTitle: '深圳建筑工程有限公司',
    taxNumber: '91440300MA5GXXXXXX',
    invoiceAmount: 50000,
    invoiceStatus: 'pending',
    taxType: 'general',
    createTime: '2024-05-18 16:00:00',
    orderItems: [
      { productName: '镀锌钢管 DN100', quantity: 120, unit: '米', unitPrice: 258, amount: 30960 },
      { productName: '镀锌钢管 DN50', quantity: 80, unit: '米', unitPrice: 168, amount: 13440 },
      { productName: '弯头 DN100', quantity: 50, unit: '个', unitPrice: 28, amount: 1400 },
      { productName: '密封垫片', quantity: 100, unit: '个', unitPrice: 42, amount: 4200 },
    ],
  },
  {
    id: '4',
    orderNo: 'PO20240517001',
    invoiceTitle: '东莞建材贸易公司',
    taxNumber: '441900MA7ZXXXXXX',
    invoiceAmount: 22000,
    invoiceStatus: 'voided',
    taxType: 'special',
    voidReason: '抬头信息错误',
    voidCount: 1,
    createTime: '2024-05-17 11:00:00',
  },
  {
    id: '5',
    orderNo: 'PO20240516001',
    invoiceTitle: '深圳建筑工程有限公司',
    taxNumber: '91440300MA5GXXXXXX',
    invoiceAmount: 35000,
    actualInvoiceAmount: 35000,
    invoiceStatus: 'issued',
    taxType: 'special',
    invoiceNo: 'FP20240516005',
    invoiceFile: 'https://picsum.photos/seed/sinv5/400/280',
    invoiceTime: '2024-05-16 10:00:00',
    voidCount: 0,
    createTime: '2024-05-15 14:00:00',
  },
])

const invoiceModalVisible = ref(false)
const currentRecord = ref<SupplierInvoice | null>(null)

const invoiceForm = ref({
  taxType: 'special' as 'special' | 'general',
  invoiceNo: '',
  amount: 0,
  invoiceTitle: '',
  taxNumber: '',
})

const viewModalVisible = ref(false)

const ocrState = ref<OcrState>('pending')
const ocrResult = ref<OcrResult | null>(null)
const ocrRetryCount = ref(0)

const voidModalVisible = ref(false)
const voidingRecord = ref<SupplierInvoice | null>(null)
const voidForm = ref({
  reason: '',
})

const stats = computed(() => {
  const total = invoiceList.value.length
  const pending = invoiceList.value.filter(i => i.invoiceStatus === 'pending').length
  const issued = invoiceList.value.filter(i => i.invoiceStatus === 'issued').length
  const voided = invoiceList.value.filter(i => i.invoiceStatus === 'voided').length
  return { totalCount: total, pendingCount: pending, issuedCount: issued, voidedCount: voided }
})

const filteredList = computed(() => {
  let result = invoiceList.value

  if (activeTab.value !== 'all') {
    result = result.filter(i => i.invoiceStatus === activeTab.value)
  }

  if (searchForm.value.orderNo) {
    const kw = searchForm.value.orderNo.toLowerCase()
    result = result.filter(i => i.orderNo.toLowerCase().includes(kw))
  }

  if (searchForm.value.invoiceTitle) {
    const kw = searchForm.value.invoiceTitle.toLowerCase()
    result = result.filter(i => i.invoiceTitle.toLowerCase().includes(kw))
  }

  if (searchForm.value.taxType) {
    result = result.filter(i => i.taxType === searchForm.value.taxType)
  }

  if (searchForm.value.dateRange.length === 2) {
    const [start, end] = searchForm.value.dateRange
    result = result.filter(i => i.createTime >= start && i.createTime <= end + ' 23:59:59')
  }

  return result
})

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    issued: 'green',
    voided: 'red',
  }
  return map[status] || 'gray'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待开票',
    issued: '已开票',
    voided: '已作废',
  }
  return map[status] || status
}

function resetOcr() {
  ocrState.value = 'pending'
  ocrResult.value = null
}

function handleInvoice(record: SupplierInvoice) {
  currentRecord.value = record
  invoiceForm.value = {
    taxType: record.taxType,
    invoiceNo: '',
    amount: record.invoiceAmount,
    invoiceTitle: record.invoiceTitle,
    taxNumber: '',
  }
  resetOcr()
  invoiceModalVisible.value = true
}

function handleUploadInvoiceFile(options: any) {
  const { onProgress, onSuccess, onError } = options
  ocrState.value = 'recognizing'

  let progress = 0
  const progressTimer = setInterval(() => {
    progress += 20
    onProgress(progress)
    if (progress >= 100) {
      clearInterval(progressTimer)

      setTimeout(() => {
        const orderItems = currentRecord.value?.orderItems
        const totalQty = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

        const recognizedInvoiceNo = `FP${Date.now()}`
        const matched = Math.random() > 0.15

        if (matched) {
          const result: OcrResult = {
            recognizedAmount: currentRecord.value?.invoiceAmount || 0,
            recognizedQuantity: totalQty,
            invoiceNo: recognizedInvoiceNo,
            invoiceCode: `04400${String(Date.now()).slice(-8)}`,
            invoiceDate: new Date().toISOString().slice(0, 10).replace(/-/g, '-'),
            sellerName: '供应商名称（OCR识别）',
            buyerName: currentRecord.value?.invoiceTitle || '购买方名称（OCR识别）',
            items: orderItems?.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })) || [],
            amountMatch: true,
            quantityMatch: true,
            qualified: true,
          }
          ocrResult.value = result
          ocrState.value = 'success'
          invoiceForm.value.invoiceNo = result.invoiceNo
          invoiceForm.value.amount = result.recognizedAmount
          onSuccess({ recognized: true })
          Message.success('OCR识别成功，已自动填充识别信息')
        } else {
          ocrRetryCount.value++
          ocrState.value = 'failed'
          onError(new Error('OCR识别失败'))
        }
      }, 500)
    }
  }, 200)
}

function handleSubmitInvoice() {
  const record = currentRecord.value
  if (!record) return

  if (ocrState.value !== 'success' || !ocrResult.value?.qualified) {
    Message.error('请先上传发票并通过OCR识别校验')
    return
  }

  if (!invoiceForm.value.invoiceNo) {
    Message.error('请输入发票号码')
    return
  }
  if (!invoiceForm.value.amount || invoiceForm.value.amount <= 0) {
    Message.error('请输入开票金额')
    return
  }
  if (!invoiceForm.value.invoiceTitle) {
    Message.error('请输入发票抬头')
    return
  }
  if (!invoiceForm.value.taxNumber) {
    Message.error('请输入纳税人识别号')
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    const target = invoiceList.value.find(i => i.id === record.id)
    if (target) {
      target.taxType = invoiceForm.value.taxType
      target.invoiceNo = invoiceForm.value.invoiceNo
      target.actualInvoiceAmount = invoiceForm.value.amount
      target.invoiceTitle = invoiceForm.value.invoiceTitle
      target.invoiceFile = 'https://picsum.photos/seed/sinv' + Date.now() + '/400/280'
      target.invoiceTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
      target.invoiceStatus = 'issued'
      target.voidCount = 0
    }

    isSubmitting.value = false
    invoiceModalVisible.value = false
    Message.success('发票开具成功')
  }, 500)
}

function handleView(record: SupplierInvoice) {
  currentRecord.value = record
  viewModalVisible.value = true
}

function handleDownload(record: SupplierInvoice) {
  Message.success(`发票 ${record.invoiceNo || record.id} 下载中...`)
}

function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请先选择要导出的发票记录')
    return
  }
  Message.success(`已开始批量导出 ${selectedRowKeys.value.length} 张发票`)
}

function handleVoid(record: SupplierInvoice) {
  voidingRecord.value = record
  voidForm.value = { reason: '' }
  voidModalVisible.value = true
}

function handleConfirmVoid() {
  if (!voidingRecord.value) return

  if ((voidingRecord.value.voidCount || 0) >= 1) {
    Message.error('该发票已达到最大作废次数（1次），无法再次作废')
    voidModalVisible.value = false
    return
  }

  voidingLoading.value = true

  setTimeout(() => {
    const target = invoiceList.value.find(i => i.id === voidingRecord.value!.id)
    if (target) {
      target.invoiceStatus = 'voided'
      target.voidReason = voidForm.value.reason || '用户申请作废'
      target.voidCount = (target.voidCount || 0) + 1
    }
    voidingLoading.value = false
    voidModalVisible.value = false
    voidingRecord.value = null
    Message.success('发票已作废')
    viewModalVisible.value = false
  }, 500)
}

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredList.value.length
}

function handleReset() {
  searchForm.value = { orderNo: '', invoiceTitle: '', taxType: '', dateRange: [] }
  activeTab.value = 'all'
  pagination.current = 1
  pagination.total = filteredList.value.length
}

function handlePageChange(page: number) {
  pagination.current = page
}
</script>

<style scoped lang="less">
.supplier-invoice {
  :deep(.invoice-tabs) {
    margin-bottom: 16px;

    .arco-tabs-header {
      border-bottom: none;
    }
  }

  .table-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .invoice-title {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actual-amount {
    color: rgb(var(--green-6));
  }

  .upload-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }

  .invoice-image-section {
    border-top: 1px solid var(--color-border-1);
    padding-top: 16px;
    margin-top: 16px;

    h4 {
      margin: 0 0 12px;
      font-weight: 600;
    }

    .image-preview {
      margin-bottom: 12px;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
  }

  .ocr-processing {
    padding: 16px 0;
  }

  .match-success {
    color: rgb(var(--green-6));
    font-weight: 600;
    font-size: 16px;
  }

  .match-fail {
    color: rgb(var(--red-6));
    font-weight: 600;
    font-size: 16px;
  }

  .ocr-qualified {
    color: rgb(var(--green-6));
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-top: 8px;
  }

  .ocr-unqualified {
    color: rgb(var(--red-6));
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-top: 8px;
  }
}
</style>
