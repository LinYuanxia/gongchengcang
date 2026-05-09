<template>
  <div class="custody-overview">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="account-card main-account">
          <div class="account-header">
            <span class="account-name">
              <icon-safe /> 中信银行余额
            </span>
            <a-tag color="green">正常</a-tag>
          </div>
          <div class="account-balance">
            <span class="balance-label">账户余额</span>
            <span class="balance-amount">¥ 358,900.00</span>
          </div>
          <div class="ledger-code">
            <span class="ledger-label">台账编码：</span>
            <span class="ledger-value">LEDGER-2024-00856</span>
          </div>
          <div class="account-info">
            <div class="info-item">
              <span class="info-label">可提现余额</span>
              <span class="info-value available">¥ 288,900.00</span>
              <a-tooltip content="可直接提现的余额">
                <icon-question-circle style="margin-left: 4px; color: var(--color-text-3)" />
              </a-tooltip>
            </div>
            <div class="info-item">
              <span class="info-label">不可提现余额</span>
              <span class="info-value">¥ 20,000.00</span>
              <a-tooltip content="保证金及冻结额度">
                <icon-question-circle style="margin-left: 4px; color: var(--color-text-3)" />
              </a-tooltip>
            </div>
            <div class="info-item">
              <span class="info-label">冻结金额</span>
              <span class="info-value frozen">¥ 37,500.00</span>
              <a-tooltip content="订单支付后资金冻结">
                <icon-question-circle style="margin-left: 4px; color: var(--color-text-3)" />
              </a-tooltip>
              <a-link class="detail-link" @click="viewFrozenDetail">查看</a-link>
            </div>
            <div class="info-item">
              <span class="info-label">待分账金额</span>
              <span class="info-value pending">¥ 12,500.00</span>
              <a-tooltip content="发票开具后触发分账">
                <icon-question-circle style="margin-left: 4px; color: var(--color-text-3)" />
              </a-tooltip>
              <a-link class="detail-link" @click="viewSplitDetail">查看</a-link>
            </div>
          </div>
          <div class="account-actions">
            <a-button type="primary" @click="handleRechargeGuide">
              <template #icon><icon-file-text /></template>
              充值指南
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
            <a-descriptions-item label="账户名称">深圳湾科技园项目仓</a-descriptions-item>
            <a-descriptions-item label="托管账户号">8888000001234567</a-descriptions-item>
            <a-descriptions-item label="开户银行">中国工商银行深圳分行</a-descriptions-item>
            <a-descriptions-item label="银行账号">4000 0123 4567 8901</a-descriptions-item>
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
          <a-table-column title="资金流向" :width="260">
            <template #cell="{ record }">
              <template v-if="record.type === 'recharge'">
                <span class="flow-label">转入：</span>
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
          <a-table-column title="交易金额" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="isIncome(record.type) ? 'income' : 'expense'">
                {{ isIncome(record.type) ? '+' : '-' }}¥{{ record.amount }}
              </span>
            </template>
          </a-table-column>
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

    <a-modal v-model:visible="rechargeGuideVisible" title="充值指南" :width="600">
      <div class="recharge-guide">
        <a-alert type="info" style="margin-bottom: 16px">
          <template #content>
            <div><strong>重要提示：</strong>转账时请务必在备注中填写台账编码</div>
          </template>
        </a-alert>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="收款账户名称">深圳湾科技园项目仓</a-descriptions-item>
          <a-descriptions-item label="开户银行">中信银行深圳南山支行</a-descriptions-item>
          <a-descriptions-item label="银行账号">7559 2188 0001 2345</a-descriptions-item>
          <a-descriptions-item label="联行号">3025 8400 1234</a-descriptions-item>
          <a-descriptions-item label="转账备注（必填）">LEDGER-2024-00856</a-descriptions-item>
          <a-descriptions-item label="到账时间">工作日 9:00-17:00 转账，预计2小时内到账</a-descriptions-item>
        </a-descriptions>
        <div class="guide-tip">
          <icon-info-circle /> 转账完成后，系统将自动识别到账金额，无需手动确认
        </div>
      </div>
      <template #footer>
        <a-button @click="rechargeGuideVisible = false">我知道了</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="frozenDetailVisible" title="冻结资金明细" :width="700">
      <a-table :data="frozenRecords" :pagination="false">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="160" />
          <a-table-column title="冻结金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="frozen-amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="冻结时间" data-index="frozenTime" :width="160" />
          <a-table-column title="冻结原因" data-index="reason" />
          <a-table-column title="预计解冻时间" data-index="expectedUnfreezeTime" :width="180" />
        </template>
      </a-table>
      <template #footer>
        <a-button @click="frozenDetailVisible = false">关闭</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="splitDetailVisible" title="待分账明细" :width="700">
      <a-table :data="splitRecords" :pagination="false">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="160" />
          <a-table-column title="待分账金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount }}
            </template>
          </a-table-column>
          <a-table-column title="交易时间" data-index="time" :width="160" />
          <a-table-column title="分账说明" data-index="description" />
          <a-table-column title="触发条件" data-index="trigger" :width="160">
            <template #cell="{ record }">
              <a-tag color="orange">{{ record.trigger }}</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <template #footer>
        <a-button @click="splitDetailVisible = false">关闭</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="withdrawVisible" title="账户提现" :width="500" @ok="handleWithdrawConfirm">
      <a-form :model="withdrawForm" layout="vertical">
        <a-form-item label="可提现金额">
          <span class="available-amount">¥ 308,900.00</span>
        </a-form-item>
        <a-form-item label="提现金额" required>
          <a-input-number v-model="withdrawForm.amount" :min="1" :max="308900" :precision="2" placeholder="请输入提现金额" style="width: 100%">
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

const frozenRecords = ref([
  { orderNo: 'PO202403240001', amount: '125,000.00', frozenTime: '2024-03-24 10:35:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '订单完成后解冻', status: 'frozen' },
  { orderNo: 'PO202403230002', amount: '85,000.00', frozenTime: '2024-03-23 14:20:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '订单完成后解冻', status: 'frozen' },
  { orderNo: 'PO202403220003', amount: '50,000.00', frozenTime: '2024-03-22 09:15:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '2024-03-25 16:30:00', status: 'unfrozen' },
])

const recentTransactions = ref([
  { time: '2024-03-25 16:30:00', type: 'deduct', amount: '125,000.00', toAccount: '中建三局一公司 虚拟账户', balance: '358,900.00', status: 'success' },
  { time: '2024-03-25 14:20:00', type: 'recharge', amount: '100,000.00', fromAccount: '深圳建设集团有限公司', balance: '483,900.00', status: 'success' },
  { time: '2024-03-25 10:00:00', type: 'deduct', amount: '85,000.00', toAccount: '华润水泥(深圳)有限公司', balance: '383,900.00', status: 'success' },
  { time: '2024-03-24 15:30:00', type: 'withdraw', amount: '50,000.00', toCard: '中信银行 ****3456', balance: '468,900.00', status: 'success' },
  { time: '2024-03-24 10:00:00', type: 'recharge', amount: '200,000.00', fromAccount: '业主方预付款', balance: '518,900.00', status: 'success' },
])

const rechargeGuideVisible = ref(false)
const withdrawVisible = ref(false)
const frozenDetailVisible = ref(false)
const splitDetailVisible = ref(false)

const splitRecords = ref([
  { orderNo: 'SO202403250001', amount: '8,500.00', time: '2024-03-25 16:30:00', description: '销售订单 - 水泥一批', trigger: '开票后分账' },
  { orderNo: 'SO202403240002', amount: '4,000.00', time: '2024-03-24 14:20:00', description: '销售订单 - 钢筋一批', trigger: '开票后分账' },
])

const withdrawForm = ref({
  amount: 0,
  bankCard: '',
  remark: '',
})

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

function isIncome(type: string) {
  return type === 'recharge'
}

function handleRechargeGuide() {
  rechargeGuideVisible.value = true
}

function handleWithdraw() {
  withdrawForm.value = { amount: 0, bankCard: '', remark: '' }
  withdrawVisible.value = true
}

function viewFrozenDetail() {
  frozenDetailVisible.value = true
}

function viewSplitDetail() {
  splitDetailVisible.value = true
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
  router.push('/warehouse/finance/custody/transaction')
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

  .ledger-code {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: #f2f3f5;
    border-radius: 4px;
    margin-bottom: 16px;

    .ledger-label {
      color: var(--color-text-2);
      font-size: 13px;
    }

    .ledger-value {
      font-family: monospace;
      font-weight: 500;
      color: var(--color-text-1);
      margin-left: 8px;
    }
  }

  .detail-link {
    margin-left: 8px;
    font-size: 12px;
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

        &.pending {
          color: #ff7d00;
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

.frozen-amount {
  color: #f53f3f;
  font-weight: 500;
}

.recharge-guide {
  .guide-tip {
    margin-top: 16px;
    padding: 12px;
    background: #e6fffb;
    border: 1px solid #87e8de;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #006a6a;
  }
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
