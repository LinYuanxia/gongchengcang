<template>
  <div class="custody-detail">
    <a-page-header
      :title="accountInfo.merchantName || '托管账户详情'"
      subtitle="查看商户资金托管账户详情"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button @click="handleSync">
            <template #icon><icon-sync /></template>
            同步余额
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="page-content">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="account-card main-account" :loading="loading">
            <div class="account-header">
              <span class="account-name">
                <icon-safe /> 托管账户
              </span>
              <a-tag :color="CUSTODY_ACCOUNT_STATUS_MAP[accountInfo.accountStatus]?.color || 'green'">
                {{ CUSTODY_ACCOUNT_STATUS_MAP[accountInfo.accountStatus]?.label || '正常' }}
              </a-tag>
            </div>
            <div class="account-balance">
              <span class="balance-label">账户余额</span>
              <span class="balance-amount">¥ {{ formatMoney(accountInfo.totalBalance) }}</span>
            </div>
            <div class="account-info">
              <div class="info-item">
                <span class="info-label">冻结金额</span>
                <span class="info-value frozen">¥ {{ formatMoney(accountInfo.frozenBalance) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">可用余额</span>
                <span class="info-value available">¥ {{ formatMoney(accountInfo.availableBalance) }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="16">
          <a-card title="账户信息" :loading="loading">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="账户ID">{{ accountInfo.accountId }}</a-descriptions-item>
              <a-descriptions-item label="商户名称">{{ accountInfo.merchantName }}</a-descriptions-item>
              <a-descriptions-item label="开户状态">
                <a-tag :color="CUSTODY_OPEN_STATUS_MAP[accountInfo.openStatus]?.color">
                  {{ CUSTODY_OPEN_STATUS_MAP[accountInfo.openStatus]?.label }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="绑卡状态">
                <a-tag :color="CUSTODY_BIND_CARD_STATUS_MAP[accountInfo.bindCardStatus]?.color">
                  {{ CUSTODY_BIND_CARD_STATUS_MAP[accountInfo.bindCardStatus]?.label }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="账户状态">
                <a-tag :color="CUSTODY_ACCOUNT_STATUS_MAP[accountInfo.accountStatus]?.color">
                  {{ CUSTODY_ACCOUNT_STATUS_MAP[accountInfo.accountStatus]?.label }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="开户时间">{{ accountInfo.openTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="最后同步">{{ accountInfo.lastSyncTime || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>

      <a-card title="账户统计" class="mt-16">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic title="本月充值" :value="statistics.monthRecharge" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月提现" :value="statistics.monthWithdraw" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月收入" :value="statistics.monthIncome" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月支出" :value="statistics.monthExpense" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
        </a-row>
      </a-card>

      <a-card class="mt-16">
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="transactions" title="交易记录">
            <a-table :data="transactionList" :pagination="transactionPagination" @page-change="handleTransactionPageChange">
              <template #columns>
                <a-table-column title="交易时间" data-index="time" :width="180" />
                <a-table-column title="交易类型" :width="120">
                  <template #cell="{ record }">
                    <a-tag :color="getTransactionTypeColor(record.type)">
                      {{ getTransactionTypeText(record.type) }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="交易金额" :width="150" align="right">
                  <template #cell="{ record }">
                    <span :class="isIncome(record.type) ? 'income' : 'expense'">
                      {{ isIncome(record.type) ? '+' : '-' }}¥{{ record.amount }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="交易说明" data-index="description" />
                <a-table-column title="余额" data-index="balance" :width="150" align="right">
                  <template #cell="{ record }">
                    ¥{{ record.balance }}
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 'success' ? 'green' : 'orange'">
                      {{ record.status === 'success' ? '成功' : '处理中' }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="bankCards" title="绑卡记录">
            <a-table :data="accountInfo.bankCards || []" :pagination="false">
              <template #columns>
                <a-table-column title="银行名称" data-index="bankName" :width="180" />
                <a-table-column title="银行账号" :width="200">
                  <template #cell="{ record }">
                    {{ record.bankAccountMasked || record.bankAccount }}
                  </template>
                </a-table-column>
                <a-table-column title="账户名称" data-index="accountName" :width="150" />
                <a-table-column title="卡类型" :width="120">
                  <template #cell="{ record }">
                    <a-tag :color="CUSTODY_CARD_TYPE_MAP[record.cardType]?.color">
                      {{ CUSTODY_CARD_TYPE_MAP[record.cardType]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="绑定状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="CUSTODY_CARD_BIND_STATUS_MAP[record.bindStatus]?.color">
                      {{ CUSTODY_CARD_BIND_STATUS_MAP[record.bindStatus]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="绑定时间" data-index="bindTime" :width="160" />
                <a-table-column title="默认" :width="80">
                  <template #cell="{ record }">
                    <a-tag v-if="record.isDefault" color="blue">默认</a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="openRecords" title="开户记录">
            <a-table :data="accountInfo.openRecords || []" :pagination="false">
              <template #columns>
                <a-table-column title="申请ID" data-index="applyId" :width="180" />
                <a-table-column title="申请类型" :width="120">
                  <template #cell="{ record }">
                    <a-tag :color="CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.color">
                      {{ CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="提交时间" data-index="submitTime" :width="160" />
                <a-table-column title="审核状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.color">
                      {{ CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="审核时间" data-index="auditTime" :width="160" />
                <a-table-column title="失败原因" data-index="failReason" />
                <a-table-column title="重试次数" data-index="retryCount" :width="80" />
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="rechargeRecords" title="充值记录">
            <a-table :data="rechargeList" :pagination="rechargePagination" @page-change="handleRechargePageChange">
              <template #columns>
                <a-table-column title="申请时间" data-index="applyTime" :width="180" />
                <a-table-column title="充值金额" :width="150" align="right">
                  <template #cell="{ record }">
                    <span class="income">¥{{ record.amount }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="充值方式" :width="120">
                  <template #cell="{ record }">
                    {{ record.method === 'bank' ? '银行转账' : '在线支付' }}
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="getRechargeStatusColor(record.status)">
                      {{ getRechargeStatusText(record.status) }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="完成时间" data-index="completeTime" :width="180" />
                <a-table-column title="备注" data-index="remark" />
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="withdrawRecords" title="提现记录">
            <a-table :data="withdrawList" :pagination="withdrawPagination" @page-change="handleWithdrawPageChange">
              <template #columns>
                <a-table-column title="申请时间" data-index="applyTime" :width="180" />
                <a-table-column title="提现金额" :width="150" align="right">
                  <template #cell="{ record }">
                    <span class="expense">¥{{ record.amount }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="提现银行" data-index="bankName" :width="180" />
                <a-table-column title="银行账号" data-index="bankAccount" :width="180" />
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="getWithdrawStatusColor(record.status)">
                      {{ getWithdrawStatusText(record.status) }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="到账时间" data-index="completeTime" :width="180" />
                <a-table-column title="备注" data-index="remark" />
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  CUSTODY_OPEN_STATUS_MAP,
  CUSTODY_BIND_CARD_STATUS_MAP,
  CUSTODY_ACCOUNT_STATUS_MAP,
  CUSTODY_CARD_TYPE_MAP,
  CUSTODY_CARD_BIND_STATUS_MAP,
  CUSTODY_OPEN_APPLY_TYPE_MAP,
  CUSTODY_OPEN_AUDIT_STATUS_MAP,
} from '@gongchengcang/constants'
import { getCustodyAccountDetail, syncAccountBalance } from '@gongchengcang/api'
import type { CustodyAccount } from '@gongchengcang/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('transactions')
const accountInfo = ref<CustodyAccount>({} as CustodyAccount)

const statistics = reactive({
  monthRecharge: 156800,
  monthWithdraw: 52000,
  monthIncome: 285600,
  monthExpense: 168500,
})

const transactionList = ref([
  { time: '2024-01-15 16:30:00', type: 'income', amount: '52,300.00', description: '销售订单收款 - SO202401150001', balance: '358,900.00', status: 'success' },
  { time: '2024-01-15 14:20:00', type: 'expense', amount: '210,000.00', description: '采购订单付款 - PO202401150001', balance: '306,600.00', status: 'success' },
  { time: '2024-01-15 10:00:00', type: 'recharge', amount: '100,000.00', description: '账户充值', balance: '516,600.00', status: 'success' },
  { time: '2024-01-14 15:30:00', type: 'withdraw', amount: '50,000.00', description: '账户提现', balance: '416,600.00', status: 'success' },
  { time: '2024-01-14 10:00:00', type: 'income', amount: '85,000.00', description: '销售订单收款 - SO202401140001', balance: '466,600.00', status: 'success' },
])

const transactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const rechargeList = ref([
  { applyTime: '2024-01-15 10:00:00', amount: '100,000.00', method: 'bank', status: 'success', completeTime: '2024-01-15 10:05:00', remark: '' },
  { applyTime: '2024-01-10 14:00:00', amount: '50,000.00', method: 'online', status: 'success', completeTime: '2024-01-10 14:02:00', remark: '' },
  { applyTime: '2024-01-05 09:00:00', amount: '80,000.00', method: 'bank', status: 'success', completeTime: '2024-01-05 09:10:00', remark: '' },
])

const rechargePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 20,
})

const withdrawList = ref([
  { applyTime: '2024-01-14 15:30:00', amount: '50,000.00', bankName: '中国工商银行深圳分行', bankAccount: '****8901', status: 'success', completeTime: '2024-01-15 10:00:00', remark: '' },
  { applyTime: '2024-01-10 11:00:00', amount: '30,000.00', bankName: '中国工商银行深圳分行', bankAccount: '****8901', status: 'success', completeTime: '2024-01-11 14:00:00', remark: '' },
])

const withdrawPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 15,
})

onMounted(() => {
  loadAccountDetail()
})

function formatMoney(value: number) {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

async function loadAccountDetail() {
  const accountId = route.params.accountId as string
  if (!accountId) {
    Message.error('账户ID不存在')
    return
  }

  loading.value = true
  try {
    accountInfo.value = await getCustodyAccountDetail(accountId)
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

async function handleSync() {
  try {
    await syncAccountBalance(accountInfo.value.accountId)
    Message.success('余额同步成功')
    loadAccountDetail()
  } catch (error: any) {
    Message.error(error.message || '同步失败')
  }
}

function handleBack() {
  router.push('/finance/custody')
}

function handleTransactionPageChange(page: number) {
  transactionPagination.current = page
}

function handleRechargePageChange(page: number) {
  rechargePagination.current = page
}

function handleWithdrawPageChange(page: number) {
  withdrawPagination.current = page
}

function getTransactionTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    income: 'green',
    expense: 'red',
    recharge: 'blue',
    withdraw: 'orange',
  }
  return colorMap[type] || 'gray'
}

function getTransactionTypeText(type: string) {
  const textMap: Record<string, string> = {
    income: '收入',
    expense: '支出',
    recharge: '充值',
    withdraw: '提现',
  }
  return textMap[type] || type
}

function isIncome(type: string) {
  return type === 'income' || type === 'recharge'
}

function getRechargeStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    success: 'green',
    failed: 'red',
  }
  return colorMap[status] || 'gray'
}

function getRechargeStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '处理中',
    success: '成功',
    failed: '失败',
  }
  return textMap[status] || status
}

function getWithdrawStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    success: 'green',
    failed: 'red',
  }
  return colorMap[status] || 'gray'
}

function getWithdrawStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待审核',
    processing: '处理中',
    success: '成功',
    failed: '失败',
  }
  return textMap[status] || status
}
</script>

<style scoped lang="less">
.custody-detail {
  .page-content {
    padding: 16px;
  }
}

.mt-16 {
  margin-top: 16px;
}

.account-card {
  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .account-name {
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .account-balance {
    text-align: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--color-border);

    .balance-label {
      display: block;
      font-size: 14px;
      color: var(--color-text-3);
      margin-bottom: 8px;
    }

    .balance-amount {
      font-size: 28px;
      font-weight: 600;
      color: #165dff;
    }
  }

  .account-info {
    padding: 16px 0;

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .info-label {
        color: var(--color-text-3);
      }

      .info-value {
        font-weight: 500;

        &.frozen {
          color: #f53f3f;
        }

        &.available {
          color: #00b42a;
        }
      }
    }
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
</style>
