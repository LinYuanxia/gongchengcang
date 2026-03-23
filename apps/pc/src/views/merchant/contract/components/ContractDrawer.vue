<template>
  <a-drawer
    :visible="visible"
    :title="mode === 'add' ? '添加合同' : mode === 'edit' ? '编辑合同' : '合同详情'"
    :width="560"
    :footer="mode !== 'view'"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-form
        ref="formRef"
        :model="formData"
        layout="vertical"
        :disabled="mode === 'view'"
      >
        <a-form-item field="tenantId" label="所属商户" :rules="[{ required: true, message: '请选择所属商户' }]">
          <a-select v-model="formData.tenantId" placeholder="请选择所属商户" show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
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
    </a-spin>

    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ mode === 'add' ? '提交' : '保存' }}
        </a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { CONTRACT_TYPE_OPTIONS } from '@gongchengcang/constants'
import { getContractDetail, createContract, updateContract, getMerchantList } from '@gongchengcang/api'
import type { Contract, Merchant, ContractType } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'view'
  contractId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const loading = ref(false)
const submitLoading = ref(false)
const fileList = ref<any[]>([])
const merchantOptions = ref<{ label: string; value: string }[]>([])

const defaultFormData = {
  tenantId: '',
  contractNo: '',
  contractType: '' as ContractType,
  contractFile: '',
  contractStartDate: '',
  contractEndDate: '',
  signDate: '',
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
      if (props.mode !== 'add' && props.contractId) {
        await loadContractDetail()
      } else {
        Object.assign(formData, defaultFormData)
        fileList.value = []
      }
    }
  }
)

async function loadContractDetail() {
  loading.value = true
  try {
    const res = await getContractDetail(props.contractId)
    Object.assign(formData, {
      tenantId: res.tenantId,
      contractNo: res.contractNo,
      contractType: res.contractType,
      contractFile: res.contractFile,
      contractStartDate: res.contractStartDate,
      contractEndDate: res.contractEndDate,
      signDate: res.signDate,
    })
    if (res.contractFile) {
      fileList.value = [{ url: res.contractFile, name: '合同文件' }]
    }
  } catch (error: any) {
    Message.error(error.message || '获取合同详情失败')
  } finally {
    loading.value = false
  }
}

function handleFileChange(fileListArr: any[]) {
  fileList.value = fileListArr
  if (fileListArr.length > 0 && fileListArr[0].response?.data?.url) {
    formData.contractFile = fileListArr[0].response.data.url
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    if (!formData.contractFile) {
      Message.warning('请上传合同文件')
      return
    }
    submitLoading.value = true
    if (props.mode === 'add') {
      await createContract(formData.tenantId, {
        contractNo: formData.contractNo,
        contractType: formData.contractType,
        contractFile: formData.contractFile,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        signDate: formData.signDate,
      })
      Message.success('添加成功')
    } else {
      await updateContract(props.contractId, formData)
      Message.success('保存成功')
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
