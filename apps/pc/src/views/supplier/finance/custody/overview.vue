<template>
  <div class="custody-overview">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="account-card main-account">
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
          <div class="account-actions">
            <a-button type="primary" @click="handleRecharge">
              <template #icon><icon-plus /></template>
              充值
            </a-button>
            <a-button @click="handleWithdraw">
              <template #icon><icon-export /></template>
              提现
            </a-button>
          </div>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card title="账户信息" class="account-info-card">
          <a-descriptions :column="2" bordered>
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
            <a-descriptions-item label="绑定状态">
              <a-tag color="green">已绑定</a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="账户统计" class="mt-16">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="本月充值" :value="120000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月提现" :value="45000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月收入" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月支出" :value="52000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>

    <a-card title="近期交易" class="mt-16">
      <template #extra>
        <a-button type="text" @click="goToTransaction">
          查看全部 <icon-right />
        </a-button>
      </template>
      <a-table :data="recentTransactions" :pagination="false">
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
    </a-card>

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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const recentTransactions = ref([
  { time: '2024-01-15 16:30:00', type: 'income', amount: '85,000.00', description: '销售订单收款 - PO202401150001', balance: '256,800.00', status: 'success' },
  { time: '2024-01-14 10:00:00', type: 'income', amount: '52,300.00', description: '销售订单收款 - PO202401140001', balance: '171,800.00', status: 'success' },
  { time: '2024-01-13 15:30:00', type: 'withdraw', amount: '12,000.00', description: '账户提现', balance: '119,500.00', status: 'success' },
  { time: '2024-01-12 09:00:00', type: 'recharge', amount: '50,000.00', description: '账户充值', balance: '131,500.00', status: 'success' },
  { time: '2024-01-11 14:00:00', type: 'income', amount: '45,800.00', description: '销售订单收款 - PO202401110001', balance: '81,500.00', status: 'success' },
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

function handleRecharge() {
  rechargeForm.value = { amount: 0, method: 'bank', remark: '' }
  rechargeVisible.value = true
}

function handleWithdraw() {
  withdrawForm.value = { amount: 0, bankCard: '', remark: '' }
  withdrawVisible.value = true
}

function handleRechargeConfirm() {
  if (!rechargeForm.value.amount || rechargeForm.value.amount <= 0) {
    Message.warning('请输入正确的充值金额')
    return
  }
  Message.success('充值申请已提交，请等待审核')
  rechargeVisible.value = false
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
  Message.success('提现申请已提交，预计1-3个工作日到账')
  withdrawVisible.value = false
}

function goToTransaction() {
  router.push('/supplier/finance/custody/recharge')
}
</script>

<style scoped lang="less">
.custody-overview {
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

  .account-actions {
    display: flex;
    gap: 12px;

    .arco-btn {
      flex: 1;
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

.available-amount {
  font-size: 20px;
  font-weight: 600;
  color: #165dff;
}
</style>
