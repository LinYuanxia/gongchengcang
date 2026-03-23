<template>
  <a-modal
    v-model:visible="modalVisible"
    title="添加合同"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="contractNo" label="合同编号" :rules="[{ required: true, message: '请输入合同编号' }]">
        <a-input v-model="formData.contractNo" placeholder="请输入外部合同编号" :max-length="50" />
      </a-form-item>
      <a-form-item field="contractType" label="合同类型" :rules="[{ required: true, message: '请选择合同类型' }]">
        <a-select v-model="formData.contractType" placeholder="请选择合同类型">
          <a-option v-for="item in CONTRACT_TYPE_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="contractFile" label="合同文件" :rules="[{ required: true, message: '请上传合同文件' }]">
        <a-upload
          :file-list="fileList"
          :limit="1"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          @change="handleFileChange"
        >
          <template #upload-button>
            <a-button>
              <template #icon><icon-upload /></template>
              上传合同文件
            </a-button>
          </template>
        </a-upload>
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="contractStartDate" label="合同生效期" :rules="[{ required: true, message: '请选择生效期' }]">
            <a-date-picker v-model="formData.contractStartDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="contractEndDate" label="合同截止期">
            <a-date-picker v-model="formData.contractEndDate" style="width: 100%" placeholder="长期可不填" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item field="signDate" label="签署日期" :rules="[{ required: true, message: '请选择签署日期' }]">
        <a-date-picker v-model="formData.signDate" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { CONTRACT_TYPE_OPTIONS } from '@gongchengcang/constants'
import type { ContractFormData, ContractType } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'ok', data: ContractFormData): void
}>()

const formRef = ref()
const fileList = ref<any[]>([])

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const defaultFormData: ContractFormData = {
  contractNo: '',
  contractType: '' as ContractType,
  contractFile: '',
  contractStartDate: '',
  contractEndDate: '',
  signDate: '',
}

const formData = reactive<ContractFormData>({ ...defaultFormData })

watch(
  () => props.visible,
  (val) => {
    if (val) {
      Object.assign(formData, defaultFormData)
      fileList.value = []
    }
  }
)

function handleFileChange(fileListArr: any[]) {
  fileList.value = fileListArr
  if (fileListArr.length > 0 && fileListArr[0].response?.data?.url) {
    formData.contractFile = fileListArr[0].response.data.url
  }
}

async function handleOk() {
  try {
    await formRef.value?.validate()
    if (!formData.contractFile) {
      return
    }
    emit('ok', { ...formData })
    handleCancel()
  } catch (error) {
    console.error('validation error', error)
  }
}

function handleCancel() {
  emit('update:visible', false)
}
</script>
