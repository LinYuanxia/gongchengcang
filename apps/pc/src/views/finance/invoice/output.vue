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
            <span>销项发票：平台向工程仓开具的服务费发票</span>
          </div>
        </template>
      </a-alert>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月开票金额" :value="26340" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月开票税额" :value="3424" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待开票金额" :value="8950" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月开票数" :value="12" suffix="张" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="发票号码">
          <a-input v-model="searchForm.invoiceNo" placeholder="请输入发票号码" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="收票方">
          <a-select v-model="searchForm.receiverId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
          </a-select>
        </a-form-item>
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
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="invoiceList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="发票号码" data-index="invoiceNo" :width="180" />
          <a-table-column title="发票类型" :width="150">
            <template #cell="{ record }">
              <a-tag :color="getInvoiceTypeColor(record.invoiceType)">
                {{ getInvoiceTypeText(record.invoiceType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收票方" data-index="receiverName" :width="180" />
          <a-table-column title="关联服务费账单" data-index="serviceBillNo" :width="150" />
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
          <a-table-column title="开票日期" data-index="invoiceDate" :width="120" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'issued' ? 'green' : 'orange'">
                {{ record.status === 'issued' ? '已开具' : '已作废' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleDownload(record)">下载</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="createModalVisible" title="开具服务费发票" :width="600" @ok="handleCreateConfirm">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="选择服务费账单" required>
          <a-select v-model="createForm.serviceBillId" placeholder="请选择待开票的服务费账单">
            <a-option value="1">SF202401140001 - 广州天河工程仓 - ¥4,475.00</a-option>
            <a-option value="2">SF202401130001 - 深圳湾科技园项目仓 - ¥2,615.00</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="createForm.invoiceType">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="electronic">电子发票</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="开票金额">
          <a-input-number :model-value="createForm.amount" :disabled="true" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="createForm.remark" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  invoiceNo: '',
  receiverId: '',
  invoiceType: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

interface InvoiceRecord {
  id: string
  invoiceNo: string
  invoiceType: string
  receiverName: string
  serviceBillNo: string
  amount: string
  taxAmount: string
  totalAmount: string
  invoiceDate: string
  status: string
}

const invoiceList = ref<InvoiceRecord[]>([
  { id: '1', invoiceNo: 'OUT202401150001', invoiceType: 'special', receiverName: '深圳湾科技园项目仓', serviceBillNo: 'SF202401150001', amount: '5,566.37', taxAmount: '723.63', totalAmount: '6,290.00', invoiceDate: '2024-01-15', status: 'issued' },
  { id: '2', invoiceNo: 'OUT202401140001', invoiceType: 'electronic', receiverName: '广州天河工程仓', serviceBillNo: 'SF202401120001', amount: '7,433.63', taxAmount: '966.37', totalAmount: '8,400.00', invoiceDate: '2024-01-14', status: 'issued' },
  { id: '3', invoiceNo: 'OUT202401130001', invoiceType: 'special', receiverName: '深圳湾科技园项目仓', serviceBillNo: 'SF202401110001', amount: '4,035.40', taxAmount: '524.60', totalAmount: '4,560.00', invoiceDate: '2024-01-13', status: 'issued' },
  { id: '4', invoiceNo: 'OUT202401120001', invoiceType: 'special', receiverName: '广州天河工程仓', serviceBillNo: 'SF202401100001', amount: '3,955.75', taxAmount: '514.25', totalAmount: '4,470.00', invoiceDate: '2024-01-12', status: 'void' },
  { id: '5', invoiceNo: 'OUT202401110001', invoiceType: 'electronic', receiverName: '深圳湾科技园项目仓', serviceBillNo: 'SF202401090001', amount: '2,309.73', taxAmount: '300.27', totalAmount: '2,610.00', invoiceDate: '2024-01-11', status: 'issued' },
])

const createModalVisible = ref(false)
const createForm = ref({
  serviceBillId: '',
  invoiceType: 'special',
  amount: 0,
  remark: '',
})

function getInvoiceTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    special: 'blue',
    normal: 'green',
    electronic: 'purple',
  }
  return colorMap[type] || 'gray'
}

function getInvoiceTypeText(type: string) {
  const textMap: Record<string, string> = {
    special: '增值税专用发票',
    normal: '增值税普通发票',
    electronic: '电子发票',
  }
  return textMap[type] || type
}

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleReset() {
  searchForm.value = {
    invoiceNo: '',
    receiverId: '',
    invoiceType: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleView(record: InvoiceRecord) {
  Message.info(`查看发票: ${record.invoiceNo}`)
}

function handleDownload(record: InvoiceRecord) {
  Message.info(`下载发票: ${record.invoiceNo}`)
}

function handleCreateInvoice() {
  createForm.value = {
    serviceBillId: '',
    invoiceType: 'special',
    amount: 0,
    remark: '',
  }
  createModalVisible.value = true
}

function handleCreateConfirm() {
  if (!createForm.value.serviceBillId) {
    Message.warning('请选择服务费账单')
    return
  }
  Message.success('发票开具成功')
  createModalVisible.value = false
}

function handleExport() {
  Message.info('导出功能开发中')
}
</script>

<style scoped lang="less">
.invoice-output {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-row {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.total {
  font-weight: 600;
  color: #165dff;
}
</style>
