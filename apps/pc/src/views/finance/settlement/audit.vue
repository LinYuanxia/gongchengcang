<template>
  <div class="settlement-audit">
    <a-card title="结算审核">
      <a-descriptions title="结算申请信息" :column="2" bordered>
        <a-descriptions-item label="结算单号">JS202401150001</a-descriptions-item>
        <a-descriptions-item label="商户名称">深圳湾科技园项目仓</a-descriptions-item>
        <a-descriptions-item label="商户类型">
          <a-tag color="blue">工程仓</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">2024-01-15 10:00:00</a-descriptions-item>
        <a-descriptions-item label="结算金额">
          <span class="amount">¥ 50,000.00</span>
        </a-descriptions-item>
        <a-descriptions-item label="可结算余额">
          <span class="available">¥ 108,500.00</span>
        </a-descriptions-item>
        <a-descriptions-item label="结算银行">中国工商银行</a-descriptions-item>
        <a-descriptions-item label="银行账号">**** **** **** 8901</a-descriptions-item>
        <a-descriptions-item label="结算说明" :span="2">日常结算</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions title="账户信息" :column="2" bordered>
        <a-descriptions-item label="账户余额">¥ 128,500.00</a-descriptions-item>
        <a-descriptions-item label="冻结金额">¥ 20,000.00</a-descriptions-item>
        <a-descriptions-item label="可用余额">¥ 108,500.00</a-descriptions-item>
        <a-descriptions-item label="账户状态">
          <a-tag color="green">正常</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions title="近期交易记录" :column="1" bordered>
        <a-descriptions-item>
          <a-table :data="recentTransactions" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="交易时间" data-index="time" :width="180" />
              <a-table-column title="交易类型" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.type === 'income' ? 'green' : 'red'">
                    {{ record.type === 'income' ? '收入' : '支出' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="交易金额" :width="150" align="right">
                <template #cell="{ record }">
                  <span :class="record.type === 'income' ? 'income' : 'expense'">
                    {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="交易说明" data-index="description" />
              <a-table-column title="余额" data-index="balance" :width="150" align="right">
                <template #cell="{ record }">
                  ¥{{ record.balance }}
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-form :model="auditForm" layout="vertical" style="max-width: 500px">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="approved">通过</a-radio>
            <a-radio value="rejected">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="auditForm.result === 'rejected'" label="驳回原因" required>
          <a-textarea v-model="auditForm.rejectReason" placeholder="请输入驳回原因" :max-length="200" show-word-limit />
        </a-form-item>
        <a-form-item label="审核备注">
          <a-textarea v-model="auditForm.remark" placeholder="请输入审核备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>

      <div class="action-bar">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitting">提交审核</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const submitting = ref(false)

const auditForm = ref({
  result: 'approved',
  rejectReason: '',
  remark: '',
})

const recentTransactions = ref([
  { time: '2024-01-15 16:30:00', type: 'income', amount: '52,300.00', description: '销售订单收款 - SO202401150001', balance: '128,500.00' },
  { time: '2024-01-15 14:20:00', type: 'expense', amount: '35,000.00', description: '采购订单付款 - PO202401150001', balance: '76,200.00' },
  { time: '2024-01-14 10:00:00', type: 'income', amount: '28,500.00', description: '销售订单收款 - SO202401140001', balance: '111,200.00' },
  { time: '2024-01-13 15:30:00', type: 'expense', amount: '18,800.00', description: '采购订单付款 - PO202401140002', balance: '82,700.00' },
])

function handleCancel() {
  router.back()
}

async function handleSubmit() {
  if (auditForm.value.result === 'rejected' && !auditForm.value.rejectReason) {
    Message.warning('请输入驳回原因')
    return
  }

  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    Message.success('审核已提交')
    router.push('/finance/settlement/list')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="less">
.settlement-audit {
  padding: 16px;
}

.amount {
  font-size: 18px;
  font-weight: 600;
  color: #165dff;
}

.available {
  color: #00b42a;
  font-weight: 500;
}

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}

.action-bar {
  margin-top: 24px;
  text-align: center;

  .arco-btn {
    min-width: 100px;
    margin: 0 8px;
  }
}
</style>
