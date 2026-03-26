<template>
  <div class="pending-funds">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="待入账金额" :value="pendingAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日入账" :value="todaySettled" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月入账" :value="monthSettled" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待入账笔数" :value="pendingCount" suffix="笔" />
        </a-col>
      </a-row>

      <a-tabs v-model:active-key="activeTab" class="mt-16">
        <a-tab-pane key="pending" title="待入账" />
        <a-tab-pane key="settled" title="已入账" />
        <a-tab-pane key="all" title="全部" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="订单编号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="采购方">
          <a-select v-model="searchForm.warehouseId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="入账状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待入账</a-option>
            <a-option value="settled">已入账</a-option>
            <a-option value="failed">入账失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        :data="filteredFunds" 
        :pagination="pagination" 
        class="mt-16"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="订单编号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="采购方" data-index="warehouseName" :width="180" />
          <a-table-column title="入账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="paymentTime" :width="160" />
          <a-table-column title="预计入账时间" :width="160">
            <template #cell="{ record }">
              <span :class="{ 'text-danger': isOverdue(record.expectedSettleTime) }">
                {{ record.expectedSettleTime }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="实际入账时间" data-index="actualSettleTime" :width="160">
            <template #cell="{ record }">
              {{ record.actualSettleTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="入账状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="150" ellipsis />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">详情</a-link>
                <a-link v-if="record.status === 'failed'" @click="handleRetry(record)">重试</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="detailVisible" 
      title="入账详情" 
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单编号">{{ currentFund.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentFund.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="入账金额">
          <span class="amount">¥{{ currentFund.amount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="入账状态">
          <a-tag :color="getStatusColor(currentFund.status)">
            {{ getStatusText(currentFund.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ currentFund.paymentTime }}</a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ currentFund.paymentMethod }}</a-descriptions-item>
        <a-descriptions-item label="预计入账时间">{{ currentFund.expectedSettleTime }}</a-descriptions-item>
        <a-descriptions-item label="实际入账时间">{{ currentFund.actualSettleTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="交易流水号" :span="2">{{ currentFund.transactionNo }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentFund.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>入账进度</h4>
      <a-timeline>
        <a-timeline-item v-for="(log, index) in currentFund.logs" :key="index" :label="log.time">
          {{ log.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill style="color: #00b42a" />
          </template>
        </a-timeline-item>
      </a-timeline>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('pending')

const pendingAmount = ref(125800)
const todaySettled = ref(35600)
const monthSettled = ref(256800)
const pendingCount = ref(8)

const searchForm = ref({
  orderNo: '',
  warehouseId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const funds = ref([
  {
    id: '1',
    orderNo: 'PO202401150001',
    warehouseName: '深圳湾科技园项目仓',
    amount: 205000,
    paymentTime: '2024-01-15 16:30:00',
    expectedSettleTime: '2024-01-18 16:30:00',
    actualSettleTime: null,
    status: 'pending',
    paymentMethod: '托管账户',
    transactionNo: 'TXN2024011516300001',
    remark: '',
    logs: [
      { time: '2024-01-15 16:30', content: '收到支付款项，等待入账' },
      { time: '2024-01-15 16:30', content: '支付成功，金额：¥205,000.00' },
    ],
  },
  {
    id: '2',
    orderNo: 'PO202401150002',
    warehouseName: '广州天河工程仓',
    amount: 82000,
    paymentTime: '2024-01-15 14:20:00',
    expectedSettleTime: '2024-01-18 14:20:00',
    actualSettleTime: '2024-01-17 10:15:00',
    status: 'settled',
    paymentMethod: '托管账户',
    transactionNo: 'TXN2024011514200001',
    remark: '',
    logs: [
      { time: '2024-01-17 10:15', content: '资金已入账到托管账户' },
      { time: '2024-01-15 14:20', content: '收到支付款项，等待入账' },
      { time: '2024-01-15 14:20', content: '支付成功，金额：¥82,000.00' },
    ],
  },
  {
    id: '3',
    orderNo: 'PO202401150003',
    warehouseName: '深圳湾科技园项目仓',
    amount: 15000,
    paymentTime: '2024-01-14 10:00:00',
    expectedSettleTime: '2024-01-17 10:00:00',
    actualSettleTime: null,
    status: 'failed',
    paymentMethod: '托管账户',
    transactionNo: 'TXN2024011410000001',
    remark: '入账失败，银行系统异常',
    logs: [
      { time: '2024-01-17 10:00', content: '入账失败：银行系统异常' },
      { time: '2024-01-14 10:00', content: '收到支付款项，等待入账' },
      { time: '2024-01-14 10:00', content: '支付成功，金额：¥15,000.00' },
    ],
  },
])

const filteredFunds = computed(() => {
  let result = funds.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.status === activeTab.value)
  }
  
  if (searchForm.value.orderNo) {
    result = result.filter(item => 
      item.orderNo.includes(searchForm.value.orderNo)
    )
  }
  
  if (searchForm.value.warehouseId) {
    result = result.filter(item => item.warehouseId === searchForm.value.warehouseId)
  }
  
  if (searchForm.value.status) {
    result = result.filter(item => item.status === searchForm.value.status)
  }
  
  return result
})

const detailVisible = ref(false)
const currentFund = ref<any>({})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    settled: 'green',
    failed: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待入账',
    settled: '已入账',
    failed: '入账失败',
  }
  return texts[status] || status
}

function isOverdue(expectedTime: string) {
  if (!expectedTime) return false
  return new Date(expectedTime) < new Date()
}

function handleSearch() {
  Message.success('查询成功')
}

function handleReset() {
  searchForm.value = {
    orderNo: '',
    warehouseId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewOrder(record: any) {
  Message.info(`查看订单：${record.orderNo}`)
}

function handleView(record: any) {
  currentFund.value = record
  detailVisible.value = true
}

function handleRetry(record: any) {
  Message.loading('正在重新入账...')
  setTimeout(() => {
    record.status = 'pending'
    record.remark = ''
    record.logs.unshift({
      time: new Date().toLocaleString(),
      content: '重新提交入账申请'
    })
    Message.success('已重新提交入账申请')
  }, 1000)
}

function handleExport() {
  if (pendingList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${pendingList.value.length} 条待结算记录`)
}
</script>

<style scoped lang="less">
.pending-funds {
  padding: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.amount {
  color: #f53f3f;
  font-weight: 600;
}

.text-danger {
  color: #f53f3f;
}

.mt-16 {
  margin-top: 16px;
}
</style>
