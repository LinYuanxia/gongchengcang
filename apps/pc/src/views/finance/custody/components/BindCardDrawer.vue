<template>
  <a-drawer
    :visible="visible"
    :title="cardId ? '重新绑卡' : '绑定银行卡'"
    :width="500"
    :footer="true"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="tenantId" label="所属商户" :rules="[{ required: true, message: '请选择商户' }]">
        <a-select v-model="formData.tenantId" placeholder="请选择商户" show-search :disabled="!!cardId">
          <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="bankName" label="银行名称" :rules="[{ required: true, message: '请输入银行名称' }]">
        <a-input v-model="formData.bankName" placeholder="如：中国建设银行" :max-length="100" />
      </a-form-item>
      <a-form-item field="bankCode" label="银行代码" :rules="[{ required: true, message: '请输入银行代码' }]">
        <a-input v-model="formData.bankCode" placeholder="银行联行号前缀" :max-length="20" />
      </a-form-item>
      <a-form-item field="bankBranch" label="支行名称" :rules="[{ required: true, message: '请输入支行名称' }]">
        <a-input v-model="formData.bankBranch" placeholder="如：北京长安街支行" :max-length="100" />
      </a-form-item>
      <a-form-item field="bankAccount" label="银行账号" :rules="[{ required: true, message: '请输入银行账号' }]">
        <a-input v-model="formData.bankAccount" placeholder="请输入银行账号" :max-length="30" />
      </a-form-item>
      <a-form-item field="accountName" label="账户名称" :rules="[{ required: true, message: '请输入账户名称' }]">
        <a-input v-model="formData.accountName" placeholder="通常为企业全称" :max-length="100" />
      </a-form-item>
      <a-form-item field="cardType" label="卡类型" :rules="[{ required: true, message: '请选择卡类型' }]">
        <a-radio-group v-model="formData.cardType">
          <a-radio :value="1">对公账户</a-radio>
          <a-radio :value="2">对私账户</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ cardId ? '重新绑定' : '绑定' }}
        </a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getMerchantList, bindBankCard, rebindBankCard, getBankCardDetail } from '@gongchengcang/api'
import type { Merchant, CustodyCardType } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  cardId: string
  tenantId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const submitLoading = ref(false)
const merchantOptions = ref<{ label: string; value: string }[]>([])

const defaultFormData = {
  tenantId: '',
  accountId: '',
  bankName: '',
  bankCode: '',
  bankBranch: '',
  bankAccount: '',
  accountName: '',
  cardType: 1 as CustodyCardType,
}

const formData = reactive({ ...defaultFormData })

onMounted(async () => {
  await loadMerchants()
})

async function loadMerchants() {
  try {
    const res = await getMerchantList({ page: 1, pageSize: 1000 })
    merchantOptions.value = res.list.map((item: Merchant) => ({
      label: item.merchantName,
      value: item.tenantId,
    }))
  } catch (error) {
    console.error('load merchants error', error)
  }
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      if (props.cardId) {
        await loadCardDetail()
      } else {
        Object.assign(formData, defaultFormData)
        if (props.tenantId) {
          formData.tenantId = props.tenantId
        }
      }
    }
  }
)

async function loadCardDetail() {
  try {
    const res = await getBankCardDetail(props.cardId)
    Object.assign(formData, {
      tenantId: res.tenantId,
      accountId: res.accountId,
      bankName: res.bankName,
      bankCode: res.bankCode,
      bankBranch: res.bankBranch,
      bankAccount: res.bankAccount,
      accountName: res.accountName,
      cardType: res.cardType,
    })
  } catch (error: any) {
    Message.error(error.message || '获取银行卡信息失败')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (props.cardId) {
      await rebindBankCard(props.cardId, formData)
      Message.success('重新绑卡成功')
    } else {
      await bindBankCard(formData)
      Message.success('绑卡成功')
    }
    emit('success')
    handleClose()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

function handleOk() {
  handleSubmit()
}

function handleClose() {
  emit('update:visible', false)
}
</script>
