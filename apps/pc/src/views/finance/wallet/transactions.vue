<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>交易流水</template>

      <div class="filter-area">
        <a-space>
          <a-select v-model="filterForm.accountId" placeholder="选择账户" style="width: 200px" allow-clear>
            <a-option v-for="acc in accountList" :key="acc.accountId" :value="acc.accountId">
              {{ acc.accountName }}
            </a-option>
          </a-select>
          <a-select v-model="filterForm.accountType" placeholder="账户类型" style="width: 140px" allow-clear>
            <a-option value="platform">平台账户</a-option>
            <a-option value="warehouse">工程仓</a-option>
            <a-option value="supplier">供应商</a-option>
          </a-select>
          <a-select v-model="filterForm.transType" placeholder="交易类型" style="width: 140px" allow-clear>
            <a-option value="income">收入</a-option>
            <a-option value="expense">支出</a-option>
          </a-select>
          <a-select v-model="filterForm.bizType" placeholder="业务类型" style="width: 140px" allow-clear>
            <a-option value="order">订单交易</a-option>
            <a-option value="refund">退款</a-option>
            <a-option value="service">服务费</a-option>
            <a-option value="withdraw">提现</a-option>
            <a-option value="recharge">充值</a-option>
          </a-select>
          <a-range-picker v-model="filterForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-statistic-group style="margin-bottom: 16px">
        <a-statistic title="交易笔数" :value="filteredTransactions.length" suffix="笔" />
        <a-statistic 
          title="总收入" 
          :value="totalIncome" 
          :precision="2"
          :style="{ marginLeft: '48px' }"
        >
          <template #prefix>¥</template>
        </a-statistic>
        <a-statistic 
          title="总支出" 
          :value="totalExpense" 
          :precision="2"
          :style="{ marginLeft: '48px' }"
        >
          <template #prefix>¥</template>
        </a-statistic>
        <a-statistic 
          title="轧差" 
          :value="totalIncome - totalExpense" 
          :precision="2"
          :style="{ marginLeft: '48px' }"
        >
          <template #prefix>¥</template>
        </a-statistic>
      </a-statistic-group>

      <a-table
        :data="paginatedTransactions"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="transId"
      >
        <template #columns>
          <a-table-column title="流水号" data-index="transNo" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.transNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="交易时间" data-index="transTime" :width="160" />
          <a-table-column title="账户名称" data-index="accountName" :width="180" />
          <a-table-column title="账户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getAccountTypeColor(record.accountType)" size="small">
                {{ getAccountTypeText(record.accountType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收支类型" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.transType === 'income' ? 'green' : 'red'" size="small">
                {{ record.transType === 'income' ? '收入' : '支出' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="业务类型" :width="100">
            <template #cell="{ record }">
              <a-tag size="small">{{ getBizTypeText(record.bizType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.transType === 'income' ? 'text-income' : 'text-expense'">
                {{ record.transType === 'income' ? '+' : '-' }}¥{{ record.amount?.toLocaleString() }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="账户余额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.balanceAfter?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="关联单据" :width="150">
            <template #cell="{ record }">
              <template v-if="record.relatedNo">
                <a-tag color="blue" size="small">{{ record.relatedType }}</a-tag>
                <div class="related-no">{{ record.relatedNo }}</div>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="200" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0,
})

const filterForm = reactive({
  accountId: route.query.accountId as string || '',
  accountType: '',
  transType: '',
  bizType: '',
  dateRange: [] as string[],
})

const accountList = ref([
  { accountId: 'ACC00000', accountName: '平台运营账户' },
  { accountId: 'ACC00001', accountName: '深圳宝安工程仓' },
  { accountId: 'ACC00002', accountName: '广州天河工程仓' },
  { accountId: 'ACC00003', accountName: '东莞南城工程仓' },
  { accountId: 'ACC00005', accountName: '北京建材供应商有限公司' },
  { accountId: 'ACC00006', accountName: '上海建材批发有限公司' },
  { accountId: 'ACC00007', accountName: '广东建材集团' },
])

const transactionList = ref([
  {
    transId: '1',
    transNo: 'TR202401220001',
    transTime: '2024-01-22 16:30:00',
    accountId: 'ACC00005',
    accountName: '北京建材供应商有限公司',
    accountType: 'supplier',
    transType: 'income',
    bizType: 'order',
    amount: 128600,
    balanceAfter: 285000,
    relatedNo: 'PO2024012000001',
    relatedType: '采购订单',
    remark: '采购订单货款结算',
  },
  {
    transId: '2',
    transNo: 'TR202401220002',
    transTime: '2024-01-22 16:30:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'expense',
    bizType: 'order',
    amount: 128600,
    balanceAfter: 685000,
    relatedNo: 'PO2024012000001',
    relatedType: '采购订单',
    remark: '采购订单货款支付',
  },
  {
    transId: '3',
    transNo: 'TR202401220003',
    transTime: '2024-01-22 16:31:00',
    accountId: 'ACC00000',
    accountName: '平台运营账户',
    accountType: 'platform',
    transType: 'income',
    bizType: 'service',
    amount: 1286,
    balanceAfter: 1286500,
    relatedNo: 'PO2024012000001',
    relatedType: '采购订单',
    remark: '订单服务费（1%）',
  },
  {
    transId: '4',
    transNo: 'TR202401210001',
    transTime: '2024-01-21 14:20:00',
    accountId: 'ACC00006',
    accountName: '上海建材批发有限公司',
    accountType: 'supplier',
    transType: 'income',
    bizType: 'order',
    amount: 86500,
    balanceAfter: 86500,
    relatedNo: 'PO2024011900002',
    relatedType: '采购订单',
    remark: '水泥采购订单结算',
  },
  {
    transId: '5',
    transNo: 'TR202401210002',
    transTime: '2024-01-21 14:20:00',
    accountId: 'ACC00002',
    accountName: '广州天河工程仓',
    accountType: 'warehouse',
    transType: 'expense',
    bizType: 'order',
    amount: 86500,
    balanceAfter: 425000,
    relatedNo: 'PO2024011900002',
    relatedType: '采购订单',
    remark: '水泥采购订单支付',
  },
  {
    transId: '6',
    transNo: 'TR202401200001',
    transTime: '2024-01-20 10:15:00',
    accountId: 'ACC00007',
    accountName: '广东建材集团',
    accountType: 'supplier',
    transType: 'expense',
    bizType: 'refund',
    amount: 12000,
    balanceAfter: 32500,
    relatedNo: 'RT20240120001',
    relatedType: '退款单',
    remark: '质量问题订单退款',
  },
  {
    transId: '7',
    transNo: 'TR202401200002',
    transTime: '2024-01-20 10:15:00',
    accountId: 'ACC00003',
    accountName: '东莞南城工程仓',
    accountType: 'warehouse',
    transType: 'income',
    bizType: 'refund',
    amount: 12000,
    balanceAfter: 312000,
    relatedNo: 'RT20240120001',
    relatedType: '退款单',
    remark: '质量问题订单退款到账',
  },
  {
    transId: '8',
    transNo: 'TR202401190001',
    transTime: '2024-01-19 09:30:00',
    accountId: 'ACC00005',
    accountName: '北京建材供应商有限公司',
    accountType: 'supplier',
    transType: 'expense',
    bizType: 'withdraw',
    amount: 50000,
    balanceAfter: 156400,
    relatedNo: 'WD20240119001',
    relatedType: '提现申请',
    remark: '提现到对公账户',
  },
  {
    transId: '9',
    transNo: 'TR202401180001',
    transTime: '2024-01-18 15:45:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'income',
    bizType: 'recharge',
    amount: 200000,
    balanceAfter: 813600,
    relatedNo: 'RC20240118001',
    relatedType: '充值单',
    remark: '对公账户充值',
  },
  {
    transId: '10',
    transNo: 'TR202401180002',
    transTime: '2024-01-18 15:46:00',
    accountId: 'ACC00000',
    accountName: '平台运营账户',
    accountType: 'platform',
    transType: 'income',
    bizType: 'service',
    amount: 865,
    balanceAfter: 1285214,
    relatedNo: 'PO2024011900002',
    relatedType: '采购订单',
    remark: '订单服务费（1%）',
  },
])

const filteredTransactions = computed(() => {
  let result = transactionList.value

  if (filterForm.accountId) {
    result = result.filter(r => r.accountId === filterForm.accountId)
  }
  if (filterForm.accountType) {
    result = result.filter(r => r.accountType === filterForm.accountType)
  }
  if (filterForm.transType) {
    result = result.filter(r => r.transType === filterForm.transType)
  }
  if (filterForm.bizType) {
    result = result.filter(r => r.bizType === filterForm.bizType)
  }

  return result
})

const paginatedTransactions = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredTransactions.value.slice(start, start + pagination.pageSize)
})

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => t.transType === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpense = computed(() => {
  return filteredTransactions.value
    .filter(t => t.transType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

function getAccountTypeText(type: string) {
  const map: Record<string, string> = {
    platform: '平台账户',
    warehouse: '工程仓',
    supplier: '供应商',
  }
  return map[type] || type
}

function getAccountTypeColor(type: string) {
  const map: Record<string, string> = {
    platform: 'purple',
    warehouse: 'blue',
    supplier: 'green',
  }
  return map[type] || 'gray'
}

function getBizTypeText(type: string) {
  const map: Record<string, string> = {
    order: '订单交易',
    refund: '退款',
    service: '服务费',
    withdraw: '提现',
    recharge: '充值',
  }
  return map[type] || type
}

onMounted(() => {
  pagination.total = filteredTransactions.value.length
})

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredTransactions.value.length
}

function handleReset() {
  filterForm.accountId = ''
  filterForm.accountType = ''
  filterForm.transType = ''
  filterForm.bizType = ''
  filterForm.dateRange = []
  pagination.current = 1
  pagination.total = filteredTransactions.value.length
}

function handlePageChange(page: number) {
  pagination.current = page
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.filter-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.text-income {
  color: rgb(var(--success-6));
  font-weight: 600;
}

.text-expense {
  color: rgb(var(--danger-6));
  font-weight: 600;
}

.related-no {
  font-size: 12px;
  color: rgb(var(--gray-6));
  margin-top: 2px;
}

.text-muted {
  color: rgb(var(--gray-6));
}
</style>
