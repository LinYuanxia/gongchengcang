<template>
  <div class="custody-detail">
    <a-page-header title="托管账户详情" @back="router.back()">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleRecharge">
            <template #icon><icon-plus /></template>
            充值
          </a-button>
          <a-button @click="handleWithdraw">
            <template #icon><icon-export /></template>
            提现
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16" class="mt-16">
      <a-col :span="8">
        <a-card class="account-card">
          <div class="account-header">
            <span class="account-name">
              <icon-safe /> 托管账户
            </span>
            <a-tag color="green">正常</a-tag>
          </div>
          <div class="account-balance">
            <span class="balance-label">账户余额</span>
            <span class="balance-amount">¥ 256,800.00</span>
          </div>
          <div class="account-info">
            <div class="info-item">
              <span class="info-label">冻结金额</span>
              <span class="info-value frozen">¥ 30,000.00</span>
            </div>
            <div class="info-item">
              <span class="info-label">可用余额</span>
              <span class="info-value available">¥ 226,800.00</span>
            </div>
          </div>
        </a-card>

        <a-card title="账户信息" class="mt-16">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="账户名称">华润建材供应商</a-descriptions-item>
            <a-descriptions-item label="托管账户号">8888000007654321</a-descriptions-item>
            <a-descriptions-item label="开户银行">中国工商银行深圳分行</a-descriptions-item>
            <a-descriptions-item label="银行账号">6000 0123 4567 8901</a-descriptions-item>
            <a-descriptions-item label="开户日期">2024-01-01</a-descriptions-item>
            <a-descriptions-item label="账户状态">
              <a-tag color="green">正常</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="认证状态">
              <a-tag color="green">已认证</a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="账户统计" class="mt-16">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="本月充值" :value="120000" :precision="2">
                <template #prefix>¥</template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="本月提现" :value="45000" :precision="2">
                <template #prefix>¥</template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="本月收入" :value="358500" :precision="2">
                <template #prefix>¥</template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="本月支出" :value="52000" :precision="2">
                <template #prefix>¥</template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card>
          <a-tabs default-active-key="1">
            <a-tab-pane key="1" title="交易记录">
              <a-form :model="transactionSearchForm" layout="inline" class="search-form">
                <a-form-item label="交易类型">
                  <a-select v-model="transactionSearchForm.type" placeholder="全部" allow-clear style="width: 150px">
                    <a-option value="income">收入</a-option>
                    <a-option value="expense">支出</a-option>
                    <a-option value="recharge">充值</a-option>
                    <a-option value="withdraw">提现</a-option>
                    <a-option value="freeze">冻结</a-option>
                    <a-option value="unfreeze">解冻</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="交易时间">
                  <a-range-picker v-model="transactionSearchForm.dateRange" style="width: 260px" />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="handleSearchTransaction">查询</a-button>
                </a-form-item>
              </a-form>

              <a-table :data="transactionList" :pagination="transactionPagination" class="mt-16">
                <template #columns>
                  <a-table-column title="交易时间" data-index="time" :width="160" />
                  <a-table-column title="交易类型" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="getTransactionTypeColor(record.type)">
                        {{ getTransactionTypeText(record.type) }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="交易金额" :width="120" align="right">
                    <template #cell="{ record }">
                      <span :class="isIncome(record.type) ? 'income' : 'expense'">
                        {{ isIncome(record.type) ? '+' : '-' }}¥{{ record.amount }}
                      </span>
                    </template>
                  </a-table-column>
                  <a-table-column title="交易说明" data-index="description" :width="200" ellipsis />
                  <a-table-column title="关联订单" :width="150">
                    <template #cell="{ record }">
                      <a-link v-if="record.orderNo">{{ record.orderNo }}</a-link>
                      <span v-else>-</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="余额" data-index="balance" :width="120" align="right">
                    <template #cell="{ record }">
                      ¥{{ record.balance }}
                    </template>
                  </a-table-column>
                  <a-table-column title="状态" :width="80">
                    <template #cell="{ record }">
                      <a-tag :color="record.status === 'success' ? 'green' : 'orange'">
                        {{ record.status === 'success' ? '成功' : '处理中' }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="操作" :width="80">
                    <template #cell="{ record }">
                      <a-link @click="handleViewTransaction(record)">详情</a-link>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="2" title="冻结记录">
              <a-alert type="info" style="margin-bottom: 16px">
                <template #message>
                  <div>冻结金额：¥ 30,000.00，冻结原因：订单保证金</div>
                </template>
              </a-alert>

              <a-table :data="freezeRecords" :pagination="false">
                <template #columns>
                  <a-table-column title="冻结时间" data-index="freezeTime" :width="160" />
                  <a-table-column title="冻结金额" :width="120" align="right">
                    <template #cell="{ record }">
                      <span class="expense">¥{{ record.amount }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="冻结原因" data-index="reason" :width="150" />
                  <a-table-column title="关联订单" :width="150">
                    <template #cell="{ record }">
                      <a-link>{{ record.orderNo }}</a-link>
                    </template>
                  </a-table-column>
                  <a-table-column title="冻结状态" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="record.status === 'frozen' ? 'orange' : 'green'">
                        {{ record.status === 'frozen' ? '已冻结' : '已解冻' }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="解冻时间" data-index="unfreezeTime" :width="160" />
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="3" title="充值记录">
              <a-table :data="rechargeRecords" :pagination="false">
                <template #columns>
                  <a-table-column title="充值时间" data-index="rechargeTime" :width="160" />
                  <a-table-column title="充值金额" :width="120" align="right">
                    <template #cell="{ record }">
                      <span class="income">¥{{ record.amount }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="充值方式" :width="120">
                    <template #cell="{ record }">
                      {{ getRechargeMethodText(record.method) }}
                    </template>
                  </a-table-column>
                  <a-table-column title="充值状态" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="record.status === 'success' ? 'green' : 'orange'">
                        {{ record.status === 'success' ? '成功' : '处理中' }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="到账时间" data-index="arrivalTime" :width="160" />
                  <a-table-column title="备注" data-index="remark" :width="150" />
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="4" title="提现记录">
              <a-table :data="withdrawRecords" :pagination="false">
                <template #columns>
                  <a-table-column title="提现时间" data-index="withdrawTime" :width="160" />
                  <a-table-column title="提现金额" :width="120" align="right">
                    <template #cell="{ record }">
                      <span class="expense">¥{{ record.amount }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="提现银行" :width="200">
                    <template #cell="{ record }">
                      {{ record.bankName }} ({{ record.bankCard }})
                    </template>
                  </a-table-column>
                  <a-table-column title="提现状态" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="getWithdrawStatusColor(record.status)">
                        {{ getWithdrawStatusText(record.status) }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="到账时间" data-index="arrivalTime" :width="160" />
                  <a-table-column title="备注" data-index="remark" :width="150" />
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:visible="rechargeVisible" title="账户充值" :width="500" @ok="handleRechargeConfirm">
      <a-form :model="rechargeForm" layout="vertical">
        <a-form-item label="充值金额" required>
          <a-input-number v-model="rechargeForm.amount" :min="1" :precision="2" placeholder="请输入充值金额" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="充值方式">
          <a-radio-group v-model="rechargeForm.method">
            <a-radio value="bank">银行转账</a-radio>
            <a-radio value="online">在线支付</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="rechargeForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="withdrawVisible" title="账户提现" :width="500" @ok="handleWithdrawConfirm">
      <a-form :model="withdrawForm" layout="vertical">
        <a-form-item label="可提现金额">
          <span class="available-amount">¥ 226,800.00</span>
        </a-form-item>
        <a-form-item label="提现金额" required>
          <a-input-number v-model="withdrawForm.amount" :min="1" :max="226800" :precision="2" placeholder="请输入提现金额" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="提现银行" required>
          <a-select v-model="withdrawForm.bankCard" placeholder="请选择提现银行卡">
            <a-option value="1">中国工商银行 (****8901)</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="withdrawForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="transactionDetailVisible"
      title="交易详情"
      :width="600"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="交易时间">{{ currentTransaction.time }}</a-descriptions-item>
        <a-descriptions-item label="交易类型">
          <a-tag :color="getTransactionTypeColor(currentTransaction.type)">
            {{ getTransactionTypeText(currentTransaction.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="交易金额">
          <span :class="isIncome(currentTransaction.type) ? 'income' : 'expense'">
            {{ isIncome(currentTransaction.type) ? '+' : '-' }}¥{{ currentTransaction.amount }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="交易状态">
          <a-tag :color="currentTransaction.status === 'success' ? 'green' : 'orange'">
            {{ currentTransaction.status === 'success' ? '成功' : '处理中' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="交易说明" :span="2">{{ currentTransaction.description }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentTransaction.orderNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="账户余额">¥{{ currentTransaction.balance }}</a-descriptions-item>
        <a-descriptions-item label="交易流水号" :span="2">{{ currentTransaction.transactionNo }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const transactionSearchForm = ref({
  type: '',
  dateRange: [],
})

const transactionPagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const allTransactionList = ref([
  { time: '2024-01-15 16:30:00', type: 'income', amount: '85,000.00', description: '销售订单收款', orderNo: 'PO202401150001', balance: '256,800.00', status: 'success', transactionNo: 'TXN202401150001' },
  { time: '2024-01-14 10:00:00', type: 'income', amount: '52,300.00', description: '销售订单收款', orderNo: 'PO202401140001', balance: '171,800.00', status: 'success', transactionNo: 'TXN202401140001' },
  { time: '2024-01-13 15:30:00', type: 'withdraw', amount: '12,000.00', description: '账户提现', orderNo: '', balance: '119,500.00', status: 'success', transactionNo: 'TXN202401130001' },
  { time: '2024-01-12 09:00:00', type: 'recharge', amount: '50,000.00', description: '账户充值', orderNo: '', balance: '131,500.00', status: 'success', transactionNo: 'TXN202401120001' },
  { time: '2024-01-11 14:00:00', type: 'income', amount: '45,800.00', description: '销售订单收款', orderNo: 'PO202401110001', balance: '81,500.00', status: 'success', transactionNo: 'TXN202401110001' },
  { time: '2024-01-10 16:00:00', type: 'freeze', amount: '30,000.00', description: '订单保证金冻结', orderNo: 'PO202401100001', balance: '35,700.00', status: 'success', transactionNo: 'TXN202401100001' },
  { time: '2024-01-09 11:00:00', type: 'income', amount: '38,500.00', description: '销售订单收款', orderNo: 'PO202401090001', balance: '65,700.00', status: 'success', transactionNo: 'TXN202401090001' },
])

const transactionList = ref([...allTransactionList.value])

const freezeRecords = ref([
  { freezeTime: '2024-01-10 16:00:00', amount: '30,000.00', reason: '订单保证金', orderNo: 'PO202401100001', status: 'frozen', unfreezeTime: '-' },
  { freezeTime: '2024-01-05 10:00:00', amount: '15,000.00', reason: '订单保证金', orderNo: 'PO202401050001', status: 'unfrozen', unfreezeTime: '2024-01-08 14:00:00' },
])

const rechargeRecords = ref([
  { rechargeTime: '2024-01-12 09:00:00', amount: '50,000.00', method: 'bank', status: 'success', arrivalTime: '2024-01-12 09:05:00', remark: '' },
  { rechargeTime: '2024-01-05 14:30:00', amount: '30,000.00', method: 'online', status: 'success', arrivalTime: '2024-01-05 14:32:00', remark: '' },
])

const withdrawRecords = ref([
  { withdrawTime: '2024-01-13 15:30:00', amount: '12,000.00', bankName: '中国工商银行深圳分行', bankCard: '****8901', status: 'success', arrivalTime: '2024-01-13 17:30:00', remark: '' },
  { withdrawTime: '2024-01-06 10:00:00', amount: '8,000.00', bankName: '中国工商银行深圳分行', bankCard: '****8901', status: 'success', arrivalTime: '2024-01-06 12:00:00', remark: '' },
])

const rechargeVisible = ref(false)
const withdrawVisible = ref(false)

const rechargeForm = ref({
  amount: 0,
  method: 'bank',
  remark: '',
})

const withdrawForm = ref({
  amount: 0,
  bankCard: '',
  remark: '',
})

const transactionDetailVisible = ref(false)
const currentTransaction = ref<any>({})

function getTransactionTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    income: 'green',
    expense: 'red',
    recharge: 'blue',
    withdraw: 'orange',
    freeze: 'purple',
    unfreeze: 'cyan',
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
  }
  return textMap[type] || type
}

function isIncome(type: string) {
  return ['income', 'recharge', 'unfreeze'].includes(type)
}

function getRechargeMethodText(method: string) {
  const textMap: Record<string, string> = {
    bank: '银行转账',
    online: '在线支付',
  }
  return textMap[method] || method
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
    pending: '待处理',
    processing: '处理中',
    success: '成功',
    failed: '失败',
  }
  return textMap[status] || status
}

function handleSearchTransaction() {
  let filtered = [...allTransactionList.value]
  
  if (transactionSearchForm.value.type) {
    filtered = filtered.filter(item => item.type === transactionSearchForm.value.type)
  }
  
  if (transactionSearchForm.value.dateRange && transactionSearchForm.value.dateRange.length === 2) {
    const [startDate, endDate] = transactionSearchForm.value.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.time.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  transactionList.value = filtered
  transactionPagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleViewTransaction(record: any) {
  currentTransaction.value = record
  transactionDetailVisible.value = true
}

function handleRecharge() {
  rechargeForm.value = {
    amount: 0,
    method: 'bank',
    remark: '',
  }
  rechargeVisible.value = true
}

function handleRechargeConfirm() {
  if (!rechargeForm.value.amount || rechargeForm.value.amount <= 0) {
    Message.warning('请输入正确的充值金额')
    return
  }
  Message.success('充值申请已提交，请等待处理')
  rechargeVisible.value = false
}

function handleWithdraw() {
  withdrawForm.value = {
    amount: 0,
    bankCard: '',
    remark: '',
  }
  withdrawVisible.value = true
}

function handleWithdrawConfirm() {
  if (!withdrawForm.value.amount || withdrawForm.value.amount <= 0) {
    Message.warning('请输入正确的提现金额')
    return
  }
  if (!withdrawForm.value.bankCard) {
    Message.warning('请选择提现银行卡')
    return
  }
  Message.success('提现申请已提交，请等待处理')
  withdrawVisible.value = false
}
</script>

<style scoped lang="less">
.custody-detail {
  padding: 16px;
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
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .account-balance {
    margin-bottom: 16px;

    .balance-label {
      display: block;
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 8px;
    }

    .balance-amount {
      display: block;
      font-size: 28px;
      font-weight: 600;
      color: #165dff;
    }
  }

  .account-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border);

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        color: var(--color-text-2);
      }

      .info-value {
        font-weight: 600;

        &.frozen {
          color: #ff7d00;
        }

        &.available {
          color: #00b42a;
        }
      }
    }
  }
}

.search-form {
  margin-bottom: 16px;
}

.income {
  color: #00b42a;
  font-weight: 600;
}

.expense {
  color: #f53f3f;
  font-weight: 600;
}

.available-amount {
  font-size: 20px;
  font-weight: 600;
  color: #00b42a;
}
</style>
