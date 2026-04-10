<template>
  <div class="invoice-output">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
          <a-button type="primary" @click="handleCreateInvoice">
            <template #icon><icon-plus /></template>
            开具发票
          </a-button>
        </a-space>
      </template>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div class="alert-content">
            <icon-info-circle />
            <span>销项发票：平台向工程仓开具的服务费发票，来源包括「工程仓业务申请开票」和「平台手动开票」</span>
          </div>
        </template>
      </a-alert>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-card>
            <a-statistic title="待开票金额" :value="18950" :precision="2">
              <template #prefix>¥</template>
              <template #suffix>
                <a-tag color="orange" size="small" style="margin-left: 8px">待开票</a-tag>
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="本月开票金额" :value="26340" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="本月开票税额" :value="3424" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="本月开票数" :value="12" suffix="张" />
          </a-card>
        </a-col>
      </a-row>

      <a-tabs v-model:active-tab="activeTab" class="invoice-tabs mt-16">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="pending" title="待开票">
          <template #title>
            待开票
            <a-badge :count="3" :number-style="{ marginLeft: '4px' }" />
          </template>
        </a-tab-pane>
        <a-tab-pane key="issued" title="已开具" />
        <a-tab-pane key="void" title="已作废" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="发票号码">
          <a-input v-model="searchForm.invoiceNo" placeholder="请输入发票号码" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="收票方">
          <a-select v-model="searchForm.receiverId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
            <a-option value="w3">北京朝阳工程仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="来源">
          <a-select v-model="searchForm.source" placeholder="全部" allow-clear style="width: 140px">
            <a-option value="apply">工程仓申请</a-option>
            <a-option value="manual">平台手动</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开票日期">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="filteredInvoiceList" :pagination="pagination" class="mt-16" @page-change="handlePageChange" row-key="id">
        <template #columns>
          <a-table-column title="发票号码" data-index="invoiceNo" :width="160" />
          <a-table-column title="来源" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.source === 'apply' ? 'blue' : 'green'">
                {{ record.source === 'apply' ? '工程仓申请' : '平台手动' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收票方" data-index="receiverName" :width="160" />
          <a-table-column title="关联分账单号" :width="160">
            <template #cell="{ record }">
              <a-tag v-for="no in record.splitNos" :key="no" size="small" style="margin: 2px">
                {{ no }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="金额(不含税)" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount }}
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
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间/开票日期" :width="160">
            <template #cell="{ record }">
              {{ record.status === 'pending' ? record.applyTime : record.invoiceDate }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button 
                  v-if="record.status === 'pending'" 
                  type="text" 
                  size="small"
                  status="success"
                  @click="handleIssue(record)"
                >
                  开具
                </a-button>
                <a-button type="text" size="small" @click="handleDownload(record)">下载</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="createModalVisible" title="选择分账记录开具发票" :width="1000" :footer="false">
      <div class="select-split-content">
        <div class="select-header">
          <a-alert type="warning" :closable="false" style="margin-bottom: 16px">
            请选择「分账已完成」的记录进行开票，支持多选合并开票，相同工程仓的记录可以合并
          </a-alert>
          
          <div class="select-summary">
            <a-space>
              <span>已选择：<strong class="text-primary">{{ selectedSplits.length }}</strong> 笔</span>
              <span>开票总金额：<strong class="text-danger">¥{{ selectedTotalAmount.toLocaleString() }}</strong></span>
            </a-space>
          </div>
        </div>

        <a-table 
          :data="completedSplitList" 
          :pagination="false" 
          row-key="id"
          class="split-select-table"
        >
          <template #columns>
            <a-table-column :width="60">
              <template #cell="{ record }">
                <a-checkbox 
                  :model-value="selectedSplits.includes(record.id)"
                  :disabled="!canSelect(record)"
                  @change="(checked) => handleToggleSplit(record, checked)"
                />
              </template>
            </a-table-column>
            <a-table-column title="分账单号" data-index="splitNo" :width="160" />
            <a-table-column title="工程仓" data-index="merchantName" :width="160" />
            <a-table-column title="交易订单" data-index="orderNo" :width="160" />
            <a-table-column title="分账金额" :width="120" align="right">
              <template #cell="{ record }">
                <span class="text-primary">¥{{ record.splitAmount?.toLocaleString() }}</span>
              </template>
            </a-table-column>
            <a-table-column title="分账时间" data-index="splitTime" :width="160" />
          </template>
        </a-table>

        <div class="modal-footer">
          <a-space>
            <a-button @click="createModalVisible = false">取消</a-button>
            <a-button 
              type="primary" 
              :disabled="selectedSplits.length === 0"
              @click="handleNextStep"
            >
              下一步填写发票信息
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="infoModalVisible" title="填写发票信息" :width="600" @ok="handleIssueConfirm" @cancel="infoModalVisible = false">
      <a-descriptions :column="2" size="small" class="mb-16">
        <a-descriptions-item label="开票工程仓">{{ currentInvoiceWarehouse }}</a-descriptions-item>
        <a-descriptions-item label="包含分账笔数">{{ selectedSplits.length }} 笔</a-descriptions-item>
        <a-descriptions-item label="开票总金额">¥{{ selectedTotalAmount.toLocaleString() }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-form :model="invoiceForm" layout="vertical">
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="invoiceForm.invoiceType">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="electronic">电子发票</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="发票号码" required>
          <a-input v-model="invoiceForm.invoiceNo" placeholder="请输入发票号码" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="invoiceForm.remark" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('all')
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const searchForm = reactive({
  invoiceNo: '',
  receiverId: '',
  source: '',
  dateRange: [] as string[],
})

interface InvoiceRecord {
  id: string
  invoiceNo: string
  source: 'apply' | 'manual'
  receiverName: string
  splitNos: string[]
  amount: string
  taxAmount: string
  totalAmount: string
  status: 'pending' | 'issued' | 'void'
  applyTime?: string
  invoiceDate?: string
}

const allInvoiceList = ref<InvoiceRecord[]>([
  { id: '1', invoiceNo: '-', source: 'apply', receiverName: '深圳湾科技园项目仓', splitNos: ['FZ202401200001', 'FZ202401190002'], amount: '-', taxAmount: '-', totalAmount: '-', status: 'pending', applyTime: '2024-01-20 14:30:00' },
  { id: '2', invoiceNo: '-', source: 'apply', receiverName: '广州天河工程仓', splitNos: ['FZ202401180003'], amount: '-', taxAmount: '-', totalAmount: '-', status: 'pending', applyTime: '2024-01-19 10:15:00' },
  { id: '3', invoiceNo: '-', source: 'apply', receiverName: '北京朝阳工程仓', splitNos: ['FZ202401170004'], amount: '-', taxAmount: '-', totalAmount: '-', status: 'pending', applyTime: '2024-01-18 16:45:00' },
  { id: '4', invoiceNo: 'OUT202401150001', source: 'manual', receiverName: '深圳湾科技园项目仓', splitNos: ['FZ202401150001'], amount: '5,566.37', taxAmount: '723.63', totalAmount: '6,290.00', status: 'issued', invoiceDate: '2024-01-15' },
  { id: '5', invoiceNo: 'OUT202401140001', source: 'apply', receiverName: '广州天河工程仓', splitNos: ['FZ202401120001'], amount: '7,433.63', taxAmount: '966.37', totalAmount: '8,400.00', status: 'issued', invoiceDate: '2024-01-14' },
  { id: '6', invoiceNo: 'OUT202401130001', source: 'manual', receiverName: '深圳湾科技园项目仓', splitNos: ['FZ202401110001'], amount: '4,035.40', taxAmount: '524.60', totalAmount: '4,560.00', status: 'issued', invoiceDate: '2024-01-13' },
  { id: '7', invoiceNo: 'OUT202401120001', source: 'apply', receiverName: '广州天河工程仓', splitNos: ['FZ202401100001'], amount: '3,955.75', taxAmount: '514.25', totalAmount: '4,470.00', status: 'void', invoiceDate: '2024-01-12' },
])

const filteredInvoiceList = computed(() => {
  let list = [...allInvoiceList.value]
  
  if (activeTab.value !== 'all') {
    list = list.filter(item => item.status === activeTab.value)
  }
  
  if (searchForm.invoiceNo) {
    list = list.filter(item => item.invoiceNo.includes(searchForm.invoiceNo))
  }
  if (searchForm.receiverId) {
    list = list.filter(item => item.receiverName.includes(searchForm.receiverId))
  }
  if (searchForm.source) {
    list = list.filter(item => item.source === searchForm.source)
  }
  
  pagination.total = list.length
  return list
})

const createModalVisible = ref(false)
const infoModalVisible = ref(false)
const selectedSplits = ref<string[]>([])
const currentInvoiceWarehouse = ref('')

const completedSplitList = ref([
  { id: 's1', splitNo: 'FZ202401200001', merchantName: '深圳湾科技园项目仓', orderNo: 'SO202401200001', splitAmount: 1286, splitTime: '2024-01-20 12:30:00', invoiced: false },
  { id: 's2', splitNo: 'FZ202401190002', merchantName: '深圳湾科技园项目仓', orderNo: 'SO202401190002', splitAmount: 865, splitTime: '2024-01-19 12:30:00', invoiced: false },
  { id: 's3', splitNo: 'FZ202401180003', merchantName: '广州天河工程仓', orderNo: 'SO202401180003', splitAmount: 2450, splitTime: '2024-01-18 12:30:00', invoiced: false },
  { id: 's4', splitNo: 'FZ202401170004', merchantName: '北京朝阳工程仓', orderNo: 'SO202401170004', splitAmount: 1560, splitTime: '2024-01-17 12:30:00', invoiced: false },
])

const invoiceForm = reactive({
  invoiceType: 'special',
  invoiceNo: '',
  remark: '',
})

const selectedTotalAmount = computed(() => {
  return completedSplitList.value
    .filter(item => selectedSplits.value.includes(item.id))
    .reduce((sum, item) => sum + item.splitAmount, 0)
})

function canSelect(record: any) {
  if (selectedSplits.value.length === 0) return true
  const firstSelected = completedSplitList.value.find(item => selectedSplits.value[0] === item.id)
  return firstSelected?.merchantName === record.merchantName
}

function handleToggleSplit(record: any, checked: boolean) {
  if (checked) {
    if (selectedSplits.value.length === 0) {
      currentInvoiceWarehouse.value = record.merchantName
    }
    selectedSplits.value.push(record.id)
  } else {
    selectedSplits.value = selectedSplits.value.filter(id => id !== record.id)
    if (selectedSplits.value.length === 0) {
      currentInvoiceWarehouse.value = ''
    }
  }
}

function handleNextStep() {
  createModalVisible.value = false
  infoModalVisible.value = true
}

function handleIssue(record: InvoiceRecord) {
  Message.info(`处理开票：${record.receiverName} 的待开票申请`)
}

function handleIssueConfirm() {
  if (!invoiceForm.invoiceNo) {
    Message.warning('请输入发票号码')
    return
  }
  Message.success('开票成功！')
  infoModalVisible.value = false
  selectedSplits.value = []
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待开票',
    issued: '已开具',
    void: '已作废',
  }
  return map[status] || '-'
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    issued: 'green',
    void: 'gray',
  }
  return map[status] || 'gray'
}

function handleCreateInvoice() {
  createModalVisible.value = true
  selectedSplits.value = []
  currentInvoiceWarehouse.value = ''
}

function handleSearch() {
  Message.success('搜索完成')
}

function handleReset() {
  searchForm.invoiceNo = ''
  searchForm.receiverId = ''
  searchForm.source = ''
  searchForm.dateRange = []
  Message.success('已重置')
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleView(record: InvoiceRecord) {
  Message.info(`查看发票：${record.invoiceNo}`)
}

function handleDownload(record: InvoiceRecord) {
  Message.success(`开始下载：${record.invoiceNo}.pdf`)
}

function handleExport() {
  Message.success('导出成功')
}
</script>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}

.invoice-tabs {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.total {
  font-weight: 600;
  color: #f53f3f;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-split-content {
  padding: 8px 0;
}

.select-summary {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.split-select-table {
  max-height: 400px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  margin-top: 16px;
}

.mb-16 {
  margin-bottom: 16px;
}

.text-primary {
  color: #165dff;
  font-weight: 500;
}

.text-danger {
  color: #f53f3f;
  font-weight: 600;
}
</style>
