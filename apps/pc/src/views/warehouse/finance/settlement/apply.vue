<template>
  <div class="settlement-apply">
    <a-card title="申请结算">
      <a-steps :current="currentStep" style="margin-bottom: 24px">
        <a-step title="确认结算信息" />
        <a-step title="选择结算银行" />
        <a-step title="提交申请" />
      </a-steps>

      <div v-show="currentStep === 0">
        <a-descriptions title="可结算金额明细" :column="2" bordered>
          <a-descriptions-item label="账户余额">¥ 128,500.00</a-descriptions-item>
          <a-descriptions-item label="冻结金额">¥ 20,000.00</a-descriptions-item>
          <a-descriptions-item label="可结算金额">
            <span class="highlight">¥ 108,500.00</span>
          </a-descriptions-item>
          <a-descriptions-item label="最小结算金额">¥ 1,000.00</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-form :model="applyForm" layout="vertical" style="max-width: 500px">
          <a-form-item label="结算金额" required>
            <a-input-number v-model="applyForm.amount" :min="1000" :max="108500" :precision="2" placeholder="请输入结算金额" style="width: 100%">
              <template #prefix>¥</template>
            </a-input-number>
            <div class="form-hint">
              可结算金额：¥ 108,500.00，最小结算金额：¥ 1,000.00
            </div>
          </a-form-item>
          <a-form-item label="结算说明">
            <a-textarea v-model="applyForm.remark" placeholder="请输入结算说明（选填）" :max-length="200" show-word-limit />
          </a-form-item>
        </a-form>

        <div class="step-actions">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="nextStep">下一步</a-button>
        </div>
      </div>

      <div v-show="currentStep === 1">
        <a-radio-group v-model="applyForm.bankCard" class="bank-list">
          <a-radio v-for="bank in bankList" :key="bank.id" :value="bank.id">
            <div class="bank-item">
              <div class="bank-info">
                <span class="bank-name">{{ bank.name }}</span>
                <span class="bank-card">{{ bank.cardNo }}</span>
              </div>
              <div class="bank-type">
                <a-tag v-if="bank.isDefault" color="blue" size="small">默认</a-tag>
              </div>
            </div>
          </a-radio>
        </a-radio-group>

        <div class="add-bank" @click="handleAddBank">
          <icon-plus /> 添加银行卡
        </div>

        <div class="step-actions">
          <a-button @click="prevStep">上一步</a-button>
          <a-button type="primary" @click="nextStep">下一步</a-button>
        </div>
      </div>

      <div v-show="currentStep === 2">
        <a-result status="info" title="确认结算信息">
          <template #subtitle>
            请确认以下结算信息是否正确
          </template>
          <template #extra>
            <a-descriptions :column="1" bordered style="text-align: left; max-width: 400px; margin: 0 auto">
              <a-descriptions-item label="结算金额">
                <span class="highlight">¥ {{ applyForm.amount?.toFixed(2) || '0.00' }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="结算银行">{{ selectedBank?.name }}</a-descriptions-item>
              <a-descriptions-item label="银行账号">{{ selectedBank?.cardNo }}</a-descriptions-item>
              <a-descriptions-item label="预计到账时间">1-3个工作日</a-descriptions-item>
              <a-descriptions-item label="结算说明">{{ applyForm.remark || '无' }}</a-descriptions-item>
            </a-descriptions>
          </template>
        </a-result>

        <div class="step-actions">
          <a-button @click="prevStep">上一步</a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">确认提交</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const currentStep = ref(0)
const submitting = ref(false)

const applyForm = ref({
  amount: 0,
  bankCard: '',
  remark: '',
})

interface BankCard {
  id: string
  name: string
  cardNo: string
  isDefault: boolean
}

const bankList = ref<BankCard[]>([
  { id: '1', name: '中国工商银行', cardNo: '**** **** **** 8901', isDefault: true },
  { id: '2', name: '中国建设银行', cardNo: '**** **** **** 5678', isDefault: false },
])

const selectedBank = computed(() => {
  return bankList.value.find(b => b.id === applyForm.value.bankCard)
})

function nextStep() {
  if (currentStep.value === 0) {
    if (!applyForm.value.amount || applyForm.value.amount < 1000) {
      Message.warning('请输入正确的结算金额，最小结算金额为 ¥1,000.00')
      return
    }
  }
  if (currentStep.value === 1) {
    if (!applyForm.value.bankCard) {
      Message.warning('请选择结算银行')
      return
    }
  }
  currentStep.value++
}

function prevStep() {
  currentStep.value--
}

function handleAddBankCard() {
  Message.success('银行卡添加成功')
}

function handleCancel() {
  router.push('/warehouse/finance/settlement/list')
}

async function handleSubmit() {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    Message.success('结算申请已提交，请等待审核')
    router.push('/warehouse/finance/settlement/list')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="less">
.settlement-apply {
  padding: 16px;
}

.highlight {
  color: #165dff;
  font-weight: 600;
  font-size: 18px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}

.step-actions {
  margin-top: 24px;
  text-align: center;

  .arco-btn {
    min-width: 100px;
    margin: 0 8px;
  }
}

.bank-list {
  width: 100%;

  :deep(.arco-radio) {
    width: 100%;
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: 4px;

    &:hover {
      border-color: rgb(var(--primary-6));
    }
  }
}

.bank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .bank-info {
    display: flex;
    flex-direction: column;

    .bank-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .bank-card {
      color: var(--color-text-3);
      font-size: 13px;
    }
  }
}

.add-bank {
  padding: 16px;
  border: 1px dashed var(--color-border);
  border-radius: 4px;
  text-align: center;
  color: var(--color-text-3);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgb(var(--primary-6));
    color: rgb(var(--primary-6));
  }
}
</style>
