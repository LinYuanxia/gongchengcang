<template>
  <div class="sale-bill">
    <a-card>
      <template #extra>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月销售总额" :value="526800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待收款金额" :value="89500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="已收款金额" :value="437300" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="销售订单数" :value="42">
            <template #suffix>笔</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="账单编号">
          <a-input v-model="searchForm.billNo" placeholder="请输入账单编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="施工方">
          <a-select v-model="searchForm.constructionId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="c1">深圳建工集团</a-option>
            <a-option value="c2">广州建筑工程</a-option>
            <a-option value="c3">东莞装饰公司</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="收款状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待收款</a-option>
            <a-option value="partial">部分收款</a-option>
            <a-option value="received">已收款</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="账单时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="billList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="账单编号" data-index="billNo" :width="180" />
          <a-table-column title="施工方" data-index="constructionName" :width="150" />
          <a-table-column title="关联订单" data-index="orderNo" :width="150" />
          <a-table-column title="账单金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="已收款" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="record.receivedAmount === record.amount ? 'received' : ''">¥{{ record.receivedAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="待收款" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="record.pendingAmount > 0 ? 'pending' : ''">¥{{ record.pendingAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="收款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.invoiceStatus ? 'green' : 'gray'">
                {{ record.invoiceStatus ? '已开票' : '未开票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="账单时间" data-index="billTime" :width="180" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button v-if="!record.invoiceStatus" type="text" size="small" status="warning" @click="handleInvoice(record)">开票</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="invoiceVisible" title="确认开票" :width="500" @ok="handleInvoiceConfirm">
      <a-form :model="invoiceForm" layout="vertical">
        <a-form-item label="账单信息">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="账单编号">{{ invoiceForm.billNo }}</a-descriptions-item>
            <a-descriptions-item label="施工方">{{ invoiceForm.constructionName }}</a-descriptions-item>
            <a-descriptions-item label="账单金额">
              <span class="highlight">¥ {{ invoiceForm.amount }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-form-item>
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="invoiceForm.type">
            <a-radio value="normal">普通发票</a-radio>
            <a-radio value="special">增值税专用发票</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="开票金额" required>
          <a-input-number v-model="invoiceForm.invoiceAmount" :min="0.01" :max="invoiceForm.maxAmount" :precision="2" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  billNo: '',
  constructionId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

interface BillRecord {
  id: string
  billNo: string
  constructionName: string
  orderNo: string
  amount: string
  receivedAmount: string
  pendingAmount: string
  status: string
  invoiceStatus: boolean
  billTime: string
}

const billList = ref<BillRecord[]>([
  { id: '1', billNo: 'SB202401150001', constructionName: '深圳建工集团', orderNo: 'SO202401150001', amount: '125,800.00', receivedAmount: '125,800.00', pendingAmount: '0.00', status: 'received', invoiceStatus: true, billTime: '2024-01-15 10:00:00' },
  { id: '2', billNo: 'SB202401140001', constructionName: '广州建筑工程', orderNo: 'SO202401140001', amount: '89,500.00', receivedAmount: '50,000.00', pendingAmount: '39,500.00', status: 'partial', invoiceStatus: false, billTime: '2024-01-14 14:30:00' },
  { id: '3', billNo: 'SB202401130001', constructionName: '东莞装饰公司', orderNo: 'SO202401130001', amount: '52,300.00', receivedAmount: '0.00', pendingAmount: '52,300.00', status: 'pending', invoiceStatus: false, billTime: '2024-01-13 09:00:00' },
  { id: '4', billNo: 'SB202401120001', constructionName: '深圳建工集团', orderNo: 'SO202401120001', amount: '168,000.00', receivedAmount: '168,000.00', pendingAmount: '0.00', status: 'received', invoiceStatus: true, billTime: '2024-01-12 16:00:00' },
  { id: '5', billNo: 'SB202401110001', constructionName: '广州建筑工程', orderNo: 'SO202401110001', amount: '91,200.00', receivedAmount: '91,200.00', pendingAmount: '0.00', status: 'received', invoiceStatus: false, billTime: '2024-01-11 11:00:00' },
])

const invoiceVisible = ref(false)
const invoiceForm = ref({
  billNo: '',
  constructionName: '',
  amount: '',
  type: 'normal',
  invoiceAmount: 0,
  maxAmount: 0,
})

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'red',
    partial: 'orange',
    received: 'green',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待收款',
    partial: '部分收款',
    received: '已收款',
  }
  return textMap[status] || status
}

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleReset() {
  searchForm.value = {
    billNo: '',
    constructionId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewDetail(record: BillRecord) {
  Message.info(`查看账单详情: ${record.billNo}`)
}

function handleInvoice(record: BillRecord) {
  invoiceForm.value = {
    billNo: record.billNo,
    constructionName: record.constructionName,
    amount: record.amount,
    type: 'normal',
    invoiceAmount: parseFloat(record.amount.replace(/,/g, '')),
    maxAmount: parseFloat(record.amount.replace(/,/g, '')),
  }
  invoiceVisible.value = true
}

function handleInvoiceConfirm() {
  if (!invoiceForm.value.invoiceAmount || invoiceForm.value.invoiceAmount <= 0) {
    Message.warning('请输入正确的开票金额')
    return
  }
  Message.success('开票申请已提交')
  invoiceVisible.value = false
}

function handleExport() {
  Message.info('导出功能开发中')
}
</script>

<style scoped lang="less">
.sale-bill {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-row {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.amount {
  font-weight: 600;
}

.received {
  color: #00b42a;
}

.pending {
  color: #f53f3f;
  font-weight: 500;
}

.highlight {
  color: #165dff;
  font-weight: 600;
  font-size: 16px;
}
</style>
