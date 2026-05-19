<template>
  <div class="invoice-manage page-container">
    <a-card :bordered="false">
      <template #extra>
        <a-space>
          <a-button @click="handleBatchExport">
            <template #icon><icon-download /></template>
            批量导出
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-tab="activeTab" class="invoice-tabs">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="uninvoiced" title="未开票" />
        <a-tab-pane key="invoiced" title="已开票" />
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
            style="width: 180px"
            @search="handleSearch"
          />
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
              <a-tag :color="record.invoiceStatus === 'invoiced' ? 'green' : 'gray'">
                {{ record.invoiceStatus === 'invoiced' ? '已开票' : '未开票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button 
                  v-if="record.invoiceStatus === 'invoiced'" 
                  type="text" 
                  size="small" 
                  @click="handleViewInvoice(record)"
                >
                  查看发票
                </a-button>
                <a-button 
                  v-if="record.invoiceStatus === 'invoiced'" 
                  type="text" 
                  size="small" 
                  @click="handleDownloadInvoice(record)"
                >
                  下载
                </a-button>
                <a-button 
                  v-if="record.invoiceStatus === 'uninvoiced'" 
                  type="text" 
                  size="small" 
                  :disabled="record.accountingStatus !== 'recorded'"
                  @click="handleOpenInvoice(record)"
                >
                  {{ record.accountingStatus === 'recorded' ? '开票' : '记账未完成' }}
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
      :width="600"
      @ok="handleInvoiceSubmit"
      @cancel="invoiceModalVisible = false"
    >
      <a-form :model="invoiceForm" layout="vertical">
        <a-form-item label="订单编号">
          <a-input :value="currentRecord?.orderNo" disabled />
        </a-form-item>
        <a-form-item label="发票抬头" required>
          <a-input v-model="invoiceForm.invoiceTitle" placeholder="请输入发票抬头" />
        </a-form-item>
        <a-form-item label="开票金额">
          <a-input-number 
            v-model="invoiceForm.invoiceAmount" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="发票图片上传">
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
      <a-empty v-else description="上传发票图片后自动识别" />

      <div v-if="ocrResult && !ocrResult.amountMatch" class="ocr-warning">
        <icon-info-circle style="color: #ff7d00; margin-right: 8px;" />
        识别金额与开票金额不一致，请核对后确认开票
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="viewInvoiceVisible" 
      title="查看发票" 
      :width="800"
      :footer="null"
    >
      <a-descriptions :column="2" bordered class="invoice-info">
        <a-descriptions-item label="订单编号">{{ currentRecord?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="应收记录编号">{{ currentRecord?.receivableNo }}</a-descriptions-item>
        <a-descriptions-item label="发票抬头">{{ currentRecord?.invoiceTitle }}</a-descriptions-item>
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
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

interface InvoiceRecord {
  id: string
  orderNo: string
  receivableNo: string
  invoiceTitle: string
  invoiceAmount: number
  actualInvoiceAmount?: number
  invoiceStatus: 'invoiced' | 'uninvoiced'
  accountingStatus: 'recorded' | 'unrecorded'
  invoiceImage?: string
  invoiceTime?: string
  createTime: string
}

const loading = ref(false)
const activeTab = ref('all')
const invoiceModalVisible = ref(false)
const viewInvoiceVisible = ref(false)
const currentRecord = ref<InvoiceRecord | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  orderNo: '',
  invoiceTitle: '',
  dateRange: [] as string[],
})

const invoiceForm = reactive({
  invoiceTitle: '',
  invoiceAmount: 0,
  invoiceImage: '',
})

const ocrResult = ref<{
  recognizedAmount: number
  amountMatch: boolean
  invoiceCode?: string
  invoiceNo?: string
  invoiceDate?: string
} | null>(null)

const allList = ref<InvoiceRecord[]>([
  {
    id: '1',
    orderNo: 'SO202401150001',
    receivableNo: 'YS202401150001',
    invoiceTitle: '深圳市某某建筑有限公司',
    invoiceAmount: 6290,
    actualInvoiceAmount: 6290,
    invoiceStatus: 'invoiced',
    accountingStatus: 'recorded',
    invoiceImage: '',
    invoiceTime: '2024-01-16 10:30:00',
    createTime: '2024-01-15 16:30:00',
  },
  {
    id: '2',
    orderNo: 'SO202401140001',
    receivableNo: 'YS202401150002',
    invoiceTitle: '广州某某工程有限公司',
    invoiceAmount: 4475,
    invoiceStatus: 'uninvoiced',
    accountingStatus: 'recorded',
    createTime: '2024-01-15 14:20:00',
  },
  {
    id: '3',
    orderNo: 'SO202401130001',
    receivableNo: 'YS202401140001',
    invoiceTitle: '深圳某某建设集团',
    invoiceAmount: 2615,
    actualInvoiceAmount: 2600,
    invoiceStatus: 'invoiced',
    accountingStatus: 'recorded',
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
    invoiceStatus: 'uninvoiced',
    accountingStatus: 'unrecorded',
    createTime: '2024-01-13 15:30:00',
  },
  {
    id: '5',
    orderNo: 'SO202401110001',
    receivableNo: 'YS202401120001',
    invoiceTitle: '佛山市某某工程材料公司',
    invoiceAmount: 4560,
    invoiceStatus: 'invoiced',
    accountingStatus: 'recorded',
    invoiceImage: '',
    invoiceTime: '2024-01-13 11:20:00',
    createTime: '2024-01-12 09:00:00',
  },
])

const filteredList = computed(() => {
  let filtered = [...allList.value]

  if (activeTab.value === 'invoiced') {
    filtered = filtered.filter(item => item.invoiceStatus === 'invoiced')
  } else if (activeTab.value === 'uninvoiced') {
    filtered = filtered.filter(item => item.invoiceStatus === 'uninvoiced')
  }

  if (searchForm.orderNo) {
    filtered = filtered.filter(item => item.orderNo.includes(searchForm.orderNo))
  }

  if (searchForm.invoiceTitle) {
    filtered = filtered.filter(item => item.invoiceTitle.includes(searchForm.invoiceTitle))
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

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.orderNo = ''
  searchForm.invoiceTitle = ''
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
  invoiceForm.invoiceTitle = record.invoiceTitle || ''
  invoiceForm.invoiceAmount = record.invoiceAmount
  invoiceForm.invoiceImage = ''
  ocrResult.value = null
  invoiceModalVisible.value = true
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

function handleInvoiceSubmit() {
  if (!invoiceForm.invoiceTitle.trim()) {
    Message.error('请输入发票抬头')
    return
  }
  if (!invoiceForm.invoiceAmount) {
    Message.error('请输入开票金额')
    return
  }
  
  if (ocrResult.value && !ocrResult.value.amountMatch) {
    Message.warning('识别金额与开票金额不一致，请核对')
    return
  }

  if (currentRecord.value) {
    currentRecord.value.invoiceStatus = 'invoiced'
    currentRecord.value.actualInvoiceAmount = invoiceForm.invoiceAmount
    currentRecord.value.invoiceTitle = invoiceForm.invoiceTitle
    currentRecord.value.invoiceImage = invoiceForm.invoiceImage
    currentRecord.value.invoiceTime = new Date().toLocaleString('zh-CN')
  }

  Message.success('开票成功')
  invoiceModalVisible.value = false
}

function handleViewInvoice(record: InvoiceRecord) {
  currentRecord.value = record
  viewInvoiceVisible.value = true
}

function handleDownloadInvoice(record: InvoiceRecord) {
  Message.success(`开始下载发票: ${record.orderNo}`)
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
.invoice-manage {
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
</style>
