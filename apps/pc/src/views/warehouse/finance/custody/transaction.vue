<template>
  <div class="transaction-list">
    <div class="page-header">
      <a-button type="text" @click="goBack">
        <template #icon><icon-left /></template>
        返回账户概览
      </a-button>
      <h3>账户流水记录</h3>
    </div>
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
            <a-option value="recharge">充值</a-option>
            <a-option value="withdraw">提现</a-option>
            <a-option value="deduct">划扣</a-option>
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
          <a-table-column title="交易时间" data-index="time" :width="180" fixed="left" />
          <a-table-column title="交易类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTransactionTypeColor(record.type)">
                {{ getTransactionTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="交易流水号" data-index="transactionNo" :width="180" />
          <a-table-column title="资金流向" :width="280">
            <template #cell="{ record }">
              <template v-if="record.type === 'recharge'">
                <span class="flow-label">转入账户：</span>
                <span class="flow-value">{{ record.fromAccount }}</span>
              </template>
              <template v-else-if="record.type === 'withdraw'">
                <span class="flow-label">提现至：</span>
                <span class="flow-value">{{ record.toCard }}</span>
              </template>
              <template v-else-if="record.type === 'deduct'">
                <span class="flow-label">划扣至：</span>
                <span class="flow-value">{{ record.toAccount }}</span>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="140" align="right">
            <template #cell="{ record }">
              <span :class="getAmountClass(record.type)">
                {{ getAmountPrefix(record.type) }}¥{{ record.amount }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="交易后余额" :width="140" align="right">
            <template #cell="{ record }">
              ¥{{ record.balance }}
            </template>
          </a-table-column>
          <a-table-column title="备注说明" data-index="description" :width="200" />
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
  { time: '2024-03-25 16:30:00', type: 'deduct', transactionNo: 'TXN202403250001', amount: '125,000.00', toAccount: '中建三局一公司 虚拟账户(ZT-202400012)', description: '采购货款结算', balance: '358,900.00', status: 'success' },
  { time: '2024-03-25 14:20:00', type: 'recharge', transactionNo: 'TXN202403250002', amount: '100,000.00', fromAccount: '深圳建设集团有限公司 75591234567890', description: '项目启动资金转入', balance: '483,900.00', status: 'success' },
  { time: '2024-03-25 10:00:00', type: 'deduct', transactionNo: 'TXN202403250003', amount: '85,000.00', toAccount: '华润水泥(深圳)有限公司 虚拟账户(ZT-202400056)', description: '材料结算款', balance: '383,900.00', status: 'success' },
  { time: '2024-03-24 15:30:00', type: 'withdraw', transactionNo: 'TXN202403240001', amount: '50,000.00', toCard: '中信银行 ****3456', description: '项目备用金提现', balance: '468,900.00', status: 'success' },
  { time: '2024-03-24 10:00:00', type: 'recharge', transactionNo: 'TXN202403240002', amount: '200,000.00', fromAccount: '业主方预付款 400888888888', description: '工程进度款转入', balance: '518,900.00', status: 'success' },
  { time: '2024-03-23 16:00:00', type: 'deduct', transactionNo: 'TXN202403230001', amount: '68,000.00', toAccount: '深圳市钢铁贸易有限公司 虚拟账户(ZT-202400078)', description: '钢筋采购结算', balance: '318,900.00', status: 'success' },
  { time: '2024-03-23 14:20:00', type: 'deduct', transactionNo: 'TXN202403230002', amount: '45,000.00', toAccount: '顺丰物流集团 虚拟账户(ZT-202400099)', description: '物流运费结算', balance: '386,900.00', status: 'success' },
  { time: '2024-03-22 16:30:00', type: 'withdraw', transactionNo: 'TXN202403220001', amount: '100,000.00', toCard: '中信银行 ****3456', description: '劳务费用发放', balance: '431,900.00', status: 'success' },
  { time: '2024-03-22 10:00:00', type: 'recharge', transactionNo: 'TXN202403220001', amount: '150,000.00', fromAccount: '保证金账户 400899999999', description: '履约保证金解冻转入', balance: '531,900.00', status: 'success' },
  { time: '2024-03-21 15:00:00', type: 'deduct', transactionNo: 'TXN202403210001', amount: '72,000.00', toAccount: '中联重科租赁 虚拟账户(ZT-202400123)', description: '设备租赁月结', balance: '381,900.00', status: 'success' },
])

function goBack() {
  router.push('/warehouse/finance/custody')
}

function getTransactionTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    recharge: 'blue',
    withdraw: 'orange',
    deduct: 'red',
  }
  return colorMap[type] || 'gray'
}

function getTransactionTypeText(type: string) {
  const textMap: Record<string, string> = {
    recharge: '充值',
    withdraw: '提现',
    deduct: '划扣',
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

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}

.flow-label {
  color: var(--color-text-3);
  font-size: 12px;
}

.flow-value {
  color: var(--color-text-1);
  font-family: monospace;
  font-size: 12px;
  margin-left: 4px;
}
</style>
