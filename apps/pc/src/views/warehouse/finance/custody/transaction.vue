<template>
  <div class="transaction-list">
    <a-card :bordered="false">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="4">
          <a-statistic title="账户余额" :value="358900" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="4">
          <a-statistic title="本月收入" :value="285600" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="4">
          <a-statistic title="本月支出" :value="168500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="4">
          <a-statistic title="冻结资金" :value="50000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="4">
          <a-statistic title="待分账" :value="12500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="4">
          <a-statistic title="可用余额" :value="308900" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" style="margin-bottom: 16px">
        <a-form-item label="交易类型">
          <a-select v-model="searchForm.type" placeholder="请选择" style="width: 120px" allow-clear>
            <a-option value="income">收入</a-option>
            <a-option value="expense">支出</a-option>
            <a-option value="recharge">充值</a-option>
            <a-option value="withdraw">提现</a-option>
            <a-option value="freeze">冻结</a-option>
            <a-option value="unfreeze">解冻</a-option>
            <a-option value="split">分账</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="交易时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-model="searchForm.keyword" placeholder="订单号/交易号" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            查询
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-form-item>
      </a-form>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="交易时间" data-index="time" :width="160" />
          <a-table-column title="交易类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTransactionTypeColor(record.type)">
                {{ getTransactionTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="交易号" data-index="transactionNo" :width="160" />
          <a-table-column title="关联订单" data-index="orderNo" :width="160">
            <template #cell="{ record }">
              <a-link v-if="record.orderNo" @click="viewOrder(record)">{{ record.orderNo }}</a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="130" align="right">
            <template #cell="{ record }">
              <span :class="getAmountClass(record.type)">
                {{ getAmountPrefix(record.type) }}¥{{ record.amount }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="交易说明" data-index="description" />
          <a-table-column title="余额" data-index="balance" :width="130" align="right">
            <template #cell="{ record }">
              ¥{{ record.balance }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'success' ? 'green' : record.status === 'pending' ? 'orange' : 'red'">
                {{ record.status === 'success' ? '成功' : record.status === 'pending' ? '处理中' : '失败' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchForm = reactive({
  type: '',
  dateRange: [],
  keyword: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
})

const tableData = ref([
  { time: '2024-03-25 16:30:00', type: 'income', transactionNo: 'TXN202403250001', orderNo: 'SO202403250001', amount: '52,300.00', description: '销售订单收款', balance: '358,900.00', status: 'success' },
  { time: '2024-03-25 14:20:00', type: 'expense', transactionNo: 'TXN202403250002', orderNo: 'PO202403250001', amount: '210,000.00', description: '采购订单付款', balance: '306,600.00', status: 'success' },
  { time: '2024-03-25 10:00:00', type: 'recharge', transactionNo: 'TXN202403250003', orderNo: '', amount: '100,000.00', description: '账户充值 - 银行转账', balance: '516,600.00', status: 'success' },
  { time: '2024-03-24 15:30:00', type: 'withdraw', transactionNo: 'TXN202403240001', orderNo: '', amount: '50,000.00', description: '账户提现 - 中国工商银行', balance: '416,600.00', status: 'success' },
  { time: '2024-03-24 10:35:00', type: 'freeze', transactionNo: 'TXN202403240002', orderNo: 'PO202403240001', amount: '125,000.00', description: '采购订单支付冻结', balance: '466,600.00', status: 'success' },
  { time: '2024-03-23 16:00:00', type: 'split', transactionNo: 'TXN202403230001', orderNo: 'SO202403230001', amount: '1,250.00', description: '平台服务费分账', balance: '591,600.00', status: 'success' },
  { time: '2024-03-23 14:20:00', type: 'freeze', transactionNo: 'TXN202403230002', orderNo: 'PO202403230002', amount: '85,000.00', description: '采购订单支付冻结', balance: '592,850.00', status: 'success' },
  { time: '2024-03-22 16:30:00', type: 'unfreeze', transactionNo: 'TXN202403220001', orderNo: 'PO202403220003', amount: '50,000.00', description: '订单完成，资金解冻', balance: '677,850.00', status: 'success' },
  { time: '2024-03-22 10:00:00', type: 'income', transactionNo: 'TXN202403220001', orderNo: 'SO202403220001', amount: '85,000.00', description: '销售订单收款', balance: '627,850.00', status: 'success' },
  { time: '2024-03-21 15:00:00', type: 'expense', transactionNo: 'TXN202403210001', orderNo: 'PO202403210001', amount: '150,000.00', description: '采购订单付款', balance: '542,850.00', status: 'success' },
])

function getTransactionTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    income: 'green',
    expense: 'red',
    recharge: 'blue',
    withdraw: 'orange',
    freeze: 'purple',
    unfreeze: 'cyan',
    split: 'gold',
  }
  return colorMap[type] || 'gray'
}

function getTransactionTypeText(type: string) {
  const textMap: Record<string, string> = {
    income: '收入',
    expense: '支出',
    recharge: '充值',
    withdraw: '提现',
    freeze: '冻结',
    unfreeze: '解冻',
    split: '分账',
  }
  return textMap[type] || type
}

function getAmountClass(type: string) {
  if (type === 'income' || type === 'recharge' || type === 'unfreeze') {
    return 'income'
  }
  return 'expense'
}

function getAmountPrefix(type: string) {
  if (type === 'income' || type === 'recharge' || type === 'unfreeze') {
    return '+'
  }
  return '-'
}

function handleSearch() {
  console.log('search', searchForm)
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleExport() {
  Message.info('正在导出资金流水...')
  setTimeout(() => {
    Message.success('导出成功')
  }, 1000)
}

function viewOrder(record: any) {
  router.push(`/order/detail?id=${record.orderNo}`)
}
</script>

<style scoped lang="less">
.transaction-list {
  padding: 16px;
}

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}
</style>
