<template>
  <a-modal
    v-model:visible="modalVisible"
    title="添加资质"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="qualType" label="资质类型" :rules="[{ required: true, message: '请选择资质类型' }]">
        <a-select v-model="formData.qualType" placeholder="请选择资质类型" @change="handleQualTypeChange">
          <a-option v-for="item in QUALIFICATION_TYPE_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="qualName" label="资质名称" :rules="[{ required: true, message: '请输入资质名称' }]">
        <a-input v-model="formData.qualName" placeholder="请输入资质名称" :max-length="100" />
      </a-form-item>
      <a-form-item field="certNo" label="证书编号">
        <a-input v-model="formData.certNo" placeholder="请输入证书编号" :max-length="50" />
      </a-form-item>
      <a-form-item field="fileUrl" label="资质文件" :rules="[{ required: true, message: '请上传资质文件' }]">
        <a-upload
          :file-list="fileList"
          :limit="1"
          accept=".pdf,.jpg,.jpeg,.png"
          @change="handleFileChange"
        >
          <template #upload-button>
            <a-button>
              <template #icon><icon-upload /></template>
              上传资质文件
            </a-button>
          </template>
        </a-upload>
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="issueDate" label="发证日期">
            <a-date-picker v-model="formData.issueDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="expireDate" label="有效期截止日">
            <a-date-picker v-model="formData.expireDate" style="width: 100%" placeholder="长期可填2099-12-31" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item field="issuingAuthority" label="发证机关">
        <a-input v-model="formData.issuingAuthority" placeholder="请输入发证机关" :max-length="100" />
      </a-form-item>
      <a-form-item field="remark" label="备注">
        <a-textarea v-model="formData.remark" placeholder="请输入备注" :max-length="255" :auto-size="{ minRows: 2, maxRows: 4 }" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { QUALIFICATION_TYPE_OPTIONS, QUALIFICATION_TYPE_MAP } from '@gongchengcang/constants'
import type { QualificationFormData } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'ok', data: QualificationFormData): void
}>()

const formRef = ref()
const fileList = ref<any[]>([])

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const defaultFormData: QualificationFormData = {
  qualType: '',
  qualName: '',
  certNo: '',
  fileUrl: '',
  issueDate: '',
  expireDate: '',
  issuingAuthority: '',
  remark: '',
}

const formData = reactive<QualificationFormData>({ ...defaultFormData })

watch(
  () => props.visible,
  (val) => {
    if (val) {
      Object.assign(formData, defaultFormData)
      fileList.value = []
    }
  }
)

function handleQualTypeChange(value: string) {
  formData.qualName = QUALIFICATION_TYPE_MAP[value] || ''
}

function handleFileChange(fileListArr: any[]) {
  fileList.value = fileListArr
  if (fileListArr.length > 0 && fileListArr[0].response?.data?.url) {
    formData.fileUrl = fileListArr[0].response.data.url
  }
}

async function handleOk() {
  try {
    await formRef.value?.validate()
    if (!formData.fileUrl) {
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
