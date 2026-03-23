<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑SPU' : '新增SPU'"
    :width="800"
    :footer="false"
    @cancel="handleCancel"
  >
    <a-steps :current="currentStep" class="steps-container">
      <a-step title="基本信息" description="填写商品基本信息" />
      <a-step title="规格属性" description="配置商品规格" />
      <a-step title="SKU定价" description="设置SKU价格" />
    </a-steps>

    <div class="step-content">
      <Step1BasicInfo
        v-show="currentStep === 1"
        ref="step1Ref"
        :form-data="formData"
        :category-tree="categoryTree"
      />
      <Step2SpecConfig
        v-show="currentStep === 2"
        ref="step2Ref"
        :form-data="formData"
        :attr-list="attrList"
      />
      <SupplierStep3SkuPrice
        v-show="currentStep === 3"
        ref="step3Ref"
        :form-data="formData"
      />
    </div>

    <div class="step-actions">
      <a-space>
        <a-button v-if="currentStep > 1" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</a-button>
        <a-button v-if="currentStep === 3" type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建SPU' }}
        </a-button>
      </a-space>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { ProductCategory, ProductAttr, SupplierProductSpu, SkuPriceInfo } from '@gongchengcang/types'
import Step1BasicInfo from '@/views/product/spu/components/Step1BasicInfo.vue'
import Step2SpecConfig from '@/views/product/spu/components/Step2SpecConfig.vue'
import SupplierStep3SkuPrice from './SupplierStep3SkuPrice.vue'

const props = defineProps<{
  visible: boolean
  spu: SupplierProductSpu | null
  categoryTree: ProductCategory[]
  attrList: ProductAttr[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const currentStep = ref(1)
const submitting = ref(false)
const step1Ref = ref()
const step2Ref = ref()
const step3Ref = ref()

const isEdit = computed(() => !!props.spu)

interface FormData {
  spuId?: string
  spuName: string
  spuCode: string
  categoryId: string
  unit: string
  mainImage: string
  images: string[]
  description: string
  remark: string
  selectedAttrs: { attrId: string; attrName: string; values: string[] }[]
  skuList: SkuPriceInfo[]
}

const formData = reactive<FormData>({
  spuName: '',
  spuCode: '',
  categoryId: '',
  unit: '',
  mainImage: '',
  images: [],
  description: '',
  remark: '',
  selectedAttrs: [],
  skuList: [],
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      currentStep.value = 1
      if (props.spu) {
        formData.spuId = props.spu.id
        formData.spuName = props.spu.spuName
        formData.spuCode = props.spu.spuCode || ''
        formData.categoryId = props.spu.categoryId
        formData.unit = props.spu.unit
        formData.mainImage = props.spu.mainImage || ''
        formData.images = props.spu.images || []
        formData.description = props.spu.description || ''
        formData.remark = props.spu.remark || ''
        formData.selectedAttrs = []
        formData.skuList = []
      } else {
        resetForm()
      }
    }
  }
)

function resetForm() {
  formData.spuId = undefined
  formData.spuName = ''
  formData.spuCode = ''
  formData.categoryId = ''
  formData.unit = ''
  formData.mainImage = ''
  formData.images = []
  formData.description = ''
  formData.remark = ''
  formData.selectedAttrs = []
  formData.skuList = []
}

async function nextStep() {
  if (currentStep.value === 1) {
    const valid = await step1Ref.value?.validate()
    if (!valid) return
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    const valid = await step2Ref.value?.validate()
    if (!valid) {
      Message.warning('请添加规格属性并设置属性值')
      return
    }
    currentStep.value = 3
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function handleSubmit() {
  if (!formData.spuName || !formData.categoryId || !formData.unit) {
    Message.warning('请完善基本信息')
    return
  }

  if (formData.skuList.length === 0) {
    Message.warning('请配置SKU')
    return
  }

  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    Message.success(isEdit.value ? 'SPU更新成功' : 'SPU创建成功')
    emit('success')
    handleCancel()
  } catch (error: any) {
    Message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('update:visible', false)
  resetForm()
}
</script>

<style scoped lang="less">
.steps-container {
  margin-bottom: 24px;
}

.step-content {
  min-height: 400px;
  padding: 16px 0;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
</style>
