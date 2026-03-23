<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑SKU' : '新增SKU'"
    :width="560"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="spuId" label="所属SPU" :rules="[{ required: true, message: '请选择所属SPU' }]">
        <a-select
          v-model="formData.spuId"
          placeholder="请选择所属SPU"
          allow-search
          :disabled="isEdit"
          @change="handleSpuChange"
        >
          <a-option v-for="item in spuList" :key="item.spuId" :value="item.spuId">
            {{ item.spuName }}
            <span style="color: var(--color-text-3); margin-left: 8px">{{ item.categoryName }}</span>
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="skuCode" label="SKU编码" :rules="[{ required: true, message: '请输入SKU编码' }]">
        <a-input v-model="formData.skuCode" placeholder="请输入SKU编码" />
      </a-form-item>
      <a-form-item field="skuName" label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
        <a-input v-model="formData.skuName" placeholder="请输入SKU名称" />
      </a-form-item>
      <a-form-item v-if="selectedSpu" label="规格属性">
        <div class="spec-form">
          <div v-for="attrId in selectedSpu.attrIds" :key="attrId" class="spec-item">
            <span class="spec-label">{{ getAttrName(attrId) }}</span>
            <a-select
              v-model="formData.specs[getAttrName(attrId)]"
              :placeholder="`请选择${getAttrName(attrId)}`"
              allow-clear
            >
              <a-option v-for="value in getAttrValues(attrId)" :key="value" :value="value">
                {{ value }}
              </a-option>
            </a-select>
          </div>
        </div>
      </a-form-item>
      <a-form-item field="unit" label="单位" :rules="[{ required: true, message: '请输入单位' }]">
        <a-input v-model="formData.unit" placeholder="请输入单位" />
      </a-form-item>
      <a-form-item field="barcode" label="条形码">
        <a-input v-model="formData.barcode" placeholder="请输入条形码" />
      </a-form-item>
      <a-form-item field="mainImage" label="主图">
        <a-input v-model="formData.mainImage" placeholder="请输入主图URL" />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { Sku, Spu, CreateSkuParams, UpdateSkuParams, ProductAttr } from '@gongchengcang/types'
import { createSku, updateSku, getAttrList } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  sku: Sku | null
  spuList: Spu[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref()
const attrList = ref<ProductAttr[]>([])
const isEdit = computed(() => !!props.sku)

const formData = ref<CreateSkuParams & { skuId?: string }>({
  skuCode: '',
  skuName: '',
  spuId: '',
  specs: {},
  unit: '',
  barcode: '',
  mainImage: '',
})

const selectedSpu = computed(() => {
  return props.spuList.find(s => s.spuId === formData.value.spuId)
})

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await loadAttrList()
      if (props.sku) {
        formData.value = {
          skuId: props.sku.skuId,
          skuCode: props.sku.skuCode,
          skuName: props.sku.skuName,
          spuId: props.sku.spuId,
          specs: { ...props.sku.specs },
          unit: props.sku.unit,
          barcode: props.sku.barcode || '',
          mainImage: props.sku.mainImage || '',
        }
      } else {
        formData.value = {
          skuCode: '',
          skuName: '',
          spuId: '',
          specs: {},
          unit: '',
          barcode: '',
          mainImage: '',
        }
      }
    }
  }
)

async function loadAttrList() {
  try {
    const result = await getAttrList({ page: 1, pageSize: 100 })
    attrList.value = result.list
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

function handleSpuChange(spuId: string) {
  formData.value.specs = {}
  formData.value.unit = selectedSpu.value?.unit || ''
}

function getAttrName(attrId: string) {
  const attr = attrList.value.find(a => a.attrId === attrId)
  return attr?.attrName || attrId
}

function getAttrValues(attrId: string) {
  const attr = attrList.value.find(a => a.attrId === attrId)
  return attr?.optionValues || []
}

function handleCancel() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

async function handleOk() {
  try {
    await formRef.value?.validate()
    
    if (isEdit.value && formData.value.skuId) {
      const params: UpdateSkuParams = {
        skuCode: formData.value.skuCode,
        skuName: formData.value.skuName,
        specs: formData.value.specs,
        unit: formData.value.unit,
        barcode: formData.value.barcode,
        mainImage: formData.value.mainImage,
      }
      await updateSku(formData.value.skuId, params)
      Message.success('编辑成功')
    } else {
      const params: CreateSkuParams = {
        skuCode: formData.value.skuCode,
        skuName: formData.value.skuName,
        spuId: formData.value.spuId,
        specs: formData.value.specs,
        unit: formData.value.unit,
        barcode: formData.value.barcode,
        mainImage: formData.value.mainImage,
      }
      await createSku(params)
      Message.success('新增成功')
    }
    
    emit('success')
    handleCancel()
  } catch (error: any) {
    if (error.message) {
      Message.error(error.message)
    }
  }
}
</script>

<style scoped>
.spec-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spec-label {
  width: 80px;
  flex-shrink: 0;
  color: var(--color-text-2);
}

.spec-item .arco-select {
  flex: 1;
}
</style>
