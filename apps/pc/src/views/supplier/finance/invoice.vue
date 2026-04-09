<template>
  <div class="finance-invoice">
    <a-page-header title="销项发票管理" />

    <a-row :gutter="16" class="mt-16">
      <a-col :span="6">
        <a-statistic title="待开发票" :value="stats.pending" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月开票" :value="stats.monthCount" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月开票金额" :value="stats.monthAmount" prefix="¥" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="累计开票金额" :value="stats.totalAmount" prefix="¥" />
      </a-col>
    </a-row>

    <a-card class="mt-16">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="开票状态">
          <a-select v-model="searchForm.status" allow-clear placeholder="全部" style="width: 140px">
            <a-option value="pending">待开票</a-option>
            <a-option value="issued">已开票</a-option>
            <a-option value="red">已红冲</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发票类型">
          <a-select v-model="searchForm.type" allow-clear placeholder="全部" style="width: 140px">
            <a-option value="special">增值税专用发票</a-option>
            <a-option value="normal">增值税普通发票</a-option>
            <a-option value="electronic">电子普通发票</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="订单号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单号" style="width: 200px" />
        </a-form-item>
        <a-form-item label="开票日期">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table :data="invoiceList" :pagination="{ pageSize: 10 }" class="mt-16">
        <template #columns>
          <a-table-column title="发票号码" data-index="invoiceNo" :width="140" />
          <a-table-column title="发票代码" data-index="invoiceCode" :width="120" />
          <a-table-column title="关联订单" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="发票类型" :width="120">
            <template #cell="{ record }">
              {{ getInvoiceTypeText(record.type) }}
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getInvoiceStatusColor(record.status)">
                {{ getInvoiceStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="价税合计" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="税额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.taxAmount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="税率" data-index="taxRate" :width="80" align="center" />
          <a-table-column title="购方名称" data-index="buyerName" :width="180" ellipsis />
          <a-table-column title="开票日期" data-index="issueDate" :width="120" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link v-if="record.status === 'pending'" @click="handleIssue(record)">开具发票</a-link>
                <a-link @click="handleView(record)">详情</a-link>
                <a-link v-if="record.status === 'issued'" @click="handleDownload(record)">下载</a-link>
                <a-link v-if="record.status === 'issued'" status="danger" @click="handleRed(record)">红冲</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="issueVisible"
      title="开具发票"
      :width="700"
      @ok="handleIssueConfirm"
      @cancel="issueVisible = false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        开票信息将自动带入订单信息，请核对后开具
      </a-alert>

      <a-form :model="issueForm" layout="vertical">
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="issueForm.type">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="electronic">电子普通发票</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="订单号">{{ currentInvoice.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="订单金额">¥{{ currentInvoice.orderAmount?.toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="购方名称">{{ currentInvoice.buyerName }}</a-descriptions-item>
          <a-descriptions-item label="纳税人识别号">{{ currentInvoice.buyerTaxNo }}</a-descriptions-item>
        </a-descriptions>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发票号码" required>
              <a-input v-model="issueForm.invoiceNo" placeholder="请输入发票号码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发票代码" required>
              <a-input v-model="issueForm.invoiceCode" placeholder="请输入发票代码" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开票日期" required>
              <a-date-picker v-model="issueForm.issueDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="税率" required>
              <a-select v-model="issueForm.taxRate" style="width: 100%">
                <a-option value="13%">13%</a-option>
                <a-option value="9%">9%</a-option>
                <a-option value="6%">6%</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="上传发票附件">
          <a-upload :auto-upload="false" :limit="1" accept=".pdf,.jpg,.png">
            <a-button>
              <template #icon><icon-upload /></template>
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model="issueForm.remark" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  status: '',
  type: '',
  orderNo: '',
  dateRange: [],
})

const stats = ref({
  pending: 5,
  monthCount: 12,
  monthAmount: 586500,
  totalAmount: 2685000,
})

const invoiceList = ref([
  {
    id: '1',
    invoiceNo: '01234567',
    invoiceCode: '4400213450',
    orderNo: 'PO202401150001',
    type: 'special',
    status: 'issued',
    amount: 85000,
    taxAmount: 9778.76,
    taxRate: '13%',
    buyerName: '深圳湾科技园区项目工程部',
    buyerTaxNo: '91440300MA5XXXXXXX',
    issueDate: '2024-01-16',
  },
  {
    id: '2',
    invoiceNo: '01234568',
    invoiceCode: '4400213450',
    orderNo: 'PO202401140002',
    type: 'electronic',
    status: 'issued',
    amount: 52300,
    taxAmount: 6023.89,
    taxRate: '13%',
    buyerName: '华润置地深圳有限公司',
    buyerTaxNo: '91440300MA5YYYYYYY',
    issueDate: '2024-01-15',
  },
  {
    id: '3',
    invoiceNo: '-',
    invoiceCode: '-',
    orderNo: 'PO202401130003',
    type: '-',
    status: 'pending',
    amount: 128000,
    taxAmount: 0,
    taxRate: '-',
    buyerName: '万科建筑工程有限公司',
    buyerTaxNo: '91440300MA5ZZZZZZZ',
    issueDate: '-',
  },
])

const issueVisible = ref(false)
const currentInvoice = ref<any>({})
const issueForm = ref({
  type: 'electronic',
  invoiceNo: '',
  invoiceCode: '',
  issueDate: '',
  taxRate: '13%',
  remark: '',
})

function getInvoiceTypeText(type: string) {
  const map: Record<string, string> = {
    special: '增值税专用发票',
    normal: '增值税普通发票',
    electronic: '电子普通发票',
  }
  return map[type] || '-'
}

function getInvoiceStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待开票',
    issued: '已开票',
    red: '已红冲',
  }
  return map[status] || status
}

function getInvoiceStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    issued: 'green',
    red: 'red',
  }
  return map[status] || 'gray'
}

function handleSearch() {
  Message.success('搜索条件已应用')
}

function handleReset() {
  searchForm.value = {
    status: '',
    type: '',
    orderNo: '',
    dateRange: [],
  }
}

function handleIssue(record: any) {
  currentInvoice.value = record
  issueVisible.value = true
}

function handleIssueConfirm() {
  if (!issueForm.value.invoiceNo || !issueForm.value.invoiceCode) {
    Message.warning('请填写完整发票信息')
    return
  }

  currentInvoice.value.status = 'issued'
  currentInvoice.value.invoiceNo = issueForm.value.invoiceNo
  currentInvoice.value.invoiceCode = issueForm.value.invoiceCode
  currentInvoice.value.issueDate = new Date().toISOString().slice(0, 10)
  currentInvoice.value.taxRate = issueForm.value.taxRate
  currentInvoice.value.taxAmount = currentInvoice.value.amount * 0.13

  stats.value.pending--
  issueVisible.value = false
  Message.success('发票开具成功')
}

function handleView(record: any) {
  Message.info('查看发票详情：' + record.invoiceNo)
}

function handleDownload(record: any) {
  Message.success('发票PDF已开始下载')
}

function handleRed(record: any) {
  record.status = 'red'
  Message.success('发票已红冲')
}
</script>

<style scoped>
.finance-invoice {
  padding: 16px;
}
.mt-16 {
  margin-top: 16px;
}
</style>
