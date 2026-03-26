<template>
  <div class="invoice-input">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div class="alert-content">
            <icon-info-circle />
            <span>进项发票：平台收到的发票，包括工程仓开具的服务费发票等</span>
          </div>
        </template>
      </a-alert>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月进项金额" :value="156800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月进项税额" :value="20384" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待核验发票" :value="5" suffix="张" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="发票总数" :value="28" suffix="张" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="发票号码">
          <a-input v-model="searchForm.invoiceNo" placeholder="请输入发票号码" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="开票方">
          <a-select v-model="searchForm.issuerId" placeholder="全部" allow-clear style="width: 150px">
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
        <a-form-item label="核验状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待核验</a-option>
            <a-option value="verified">已核验</a-option>
            <a-option value="invalid">已作废</a-option>
          </a-select>
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
          <a-table-column title="开票方" data-index="issuerName" :width="180" />
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
          <a-table-column title="核验状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button v-if="record.status === 'pending'" type="text" size="small" status="success" @click="handleVerify(record)">核验</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  invoiceNo: '',
  issuerId: '',
  invoiceType: '',
  status: '',
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
  issuerName: string
  amount: string
  taxAmount: string
  totalAmount: string
  invoiceDate: string
  status: string
}

const allInvoiceList = ref<InvoiceRecord[]>([
  { id: '1', invoiceNo: 'INV202401150001', invoiceType: 'special', issuerName: '深圳湾科技园项目仓', amount: '4,716.98', taxAmount: '613.21', totalAmount: '5,330.19', invoiceDate: '2024-01-15', status: 'verified' },
  { id: '2', invoiceNo: 'INV202401140001', invoiceType: 'special', issuerName: '广州天河工程仓', amount: '3,301.89', taxAmount: '429.25', totalAmount: '3,731.14', invoiceDate: '2024-01-14', status: 'pending' },
  { id: '3', invoiceNo: 'INV202401130001', invoiceType: 'electronic', issuerName: '深圳湾科技园项目仓', amount: '2,452.83', taxAmount: '318.87', totalAmount: '2,771.70', invoiceDate: '2024-01-13', status: 'verified' },
  { id: '4', invoiceNo: 'INV202401120001', invoiceType: 'special', issuerName: '广州天河工程仓', amount: '5,660.38', taxAmount: '735.85', totalAmount: '6,396.23', invoiceDate: '2024-01-12', status: 'verified' },
  { id: '5', invoiceNo: 'INV202401110001', invoiceType: 'normal', issuerName: '深圳湾科技园项目仓', amount: '1,886.79', taxAmount: '245.28', totalAmount: '2,132.07', invoiceDate: '2024-01-11', status: 'invalid' },
])

const invoiceList = ref<InvoiceRecord[]>([...allInvoiceList.value])

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

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    verified: 'green',
    invalid: 'gray',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待核验',
    verified: '已核验',
    invalid: '已作废',
  }
  return textMap[status] || status
}

function handleSearch() {
  let filtered = [...allInvoiceList.value]
  
  if (searchForm.value.invoiceNo) {
    filtered = filtered.filter(item => 
      item.invoiceNo.includes(searchForm.value.invoiceNo)
    )
  }
  
  if (searchForm.value.issuerId) {
    filtered = filtered.filter(item => 
      item.issuerName.includes(searchForm.value.issuerId)
    )
  }
  
  if (searchForm.value.invoiceType) {
    filtered = filtered.filter(item => item.invoiceType === searchForm.value.invoiceType)
  }
  
  if (searchForm.value.status) {
    filtered = filtered.filter(item => item.status === searchForm.value.status)
  }
  
  invoiceList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    invoiceNo: '',
    issuerId: '',
    invoiceType: '',
    status: '',
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleView(record: InvoiceRecord) {
  Message.info(`查看发票: ${record.invoiceNo}`)
}

function handleVerify(record: InvoiceRecord) {
  Message.success(`发票 ${record.invoiceNo} 已核验`)
}

function handleExport() {
  if (invoiceList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${invoiceList.value.length} 条进项发票记录`)
}
</script>

<style scoped lang="less">
.invoice-input {
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
