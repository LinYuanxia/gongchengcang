<template>
  <div class="settlement-apply">
    <a-card title="申请结算">
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          结算金额将打入您绑定的银行账户，预计1-3个工作日到账
        </template>
      </a-alert>

      <a-descriptions title="账户信息" :column="2" bordered>
        <a-descriptions-item label="账户余额">¥ 256,800.00</a-descriptions-item>
        <a-descriptions-item label="冻结金额">¥ 30,000.00</a-descriptions-item>
        <a-descriptions-item label="可结算金额">
          <span class="available">¥ 226,800.00</span>
        </a-descriptions-item>
        <a-descriptions-item label="账户状态">
          <a-tag color="green">正常</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-form :model="applyForm" layout="vertical" style="max-width: 500px">
        <a-form-item label="结算金额" required>
          <a-input-number v-model="applyForm.amount" :min="1" :max="226800" :precision="2" placeholder="请输入结算金额" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
          <div class="amount-tips">
            <span>可结算金额：¥226,800.00</span>
            <a-button type="text" size="small" @click="applyForm.amount = 226800">全部结算</a-button>
          </div>
        </a-form-item>
        <a-form-item label="结算银行" required>
          <a-select v-model="applyForm.bankCard" placeholder="请选择结算银行">
            <a-option value="1">
              <div class="bank-option">
                <span class="bank-name">中国工商银行</span>
                <span class="bank-card">**** **** **** 8901</span>
              </div>
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="结算说明">
          <a-textarea v-model="applyForm.remark" placeholder="请输入结算说明（选填）" :max-length="200" show-word-limit />
        </a-form-item>
      </a-form>

      <div class="action-bar">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitting">提交申请</a-button>
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

const applyForm = ref({
  amount: 0,
  bankCard: '',
  remark: '',
})

function handleCancel() {
  router.back()
}

async function handleSubmit() {
  if (!applyForm.value.amount || applyForm.value.amount <= 0) {
    Message.warning('请输入正确的结算金额')
    return
  }
  if (!applyForm.value.bankCard) {
    Message.warning('请选择结算银行')
    return
  }

  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    Message.success('结算申请已提交')
    router.push('/supplier/finance/settlement/list')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="less">
.settlement-apply {
  padding: 16px;
}

.available {
  color: #00b42a;
  font-weight: 500;
  font-size: 16px;
}

.amount-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}

.bank-option {
  display: flex;
  justify-content: space-between;
  width: 100%;

  .bank-name {
    font-weight: 500;
  }

  .bank-card {
    color: var(--color-text-3);
  }
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
