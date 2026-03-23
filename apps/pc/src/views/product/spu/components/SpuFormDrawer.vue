<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑SPU' : '新增SPU'"
    :width="560"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="spuName" label="SPU名称" :rules="[{ required: true, message: '请输入SPU名称' }]">
        <a-input v-model="formData.spuName" placeholder="请输入SPU名称" />
      </a-form-item>
      <a-form-item field="spuCode" label="SPU编码">
        <a-input v-model="formData.spuCode" placeholder="请输入SPU编码" />
      </a-form-item>
      <a-form-item field="categoryId" label="所属分类" :rules="[{ required: true, message: '请选择所属分类' }]">
        <a-cascader
          v-model="formData.categoryId"
          :data="categoryTree"
          placeholder="请选择所属分类"
          :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
        />
      </a-form-item>
      <a-form-item field="unit" label="计量单位" :rules="[{ required: true, message: '请输入计量单位' }]">
        <a-input v-model="formData.unit" placeholder="请输入计量单位，如：吨、米、个" />
      </a-form-item>
      <a-form-item field="attrIds" label="关联属性" :rules="[{ required: true, message: '请选择关联属性' }]">
        <a-select
          v-model="formData.attrIds"
          placeholder="请选择关联属性（可多选）"
          multiple
          allow-search
        >
          <a-option v-for="item in attrList" :key="item.attrId" :value="item.attrId">
            {{ item.attrName }}
            <a-tag size="small" style="margin-left: 8px">{{ getAttrTypeLabel(item.attrType) }}</a-tag>
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="mainImage" label="主图">
        <a-input v-model="formData.mainImage" placeholder="请输入主图URL" />
      </a-form-item>
      <a-form-item field="description" label="描述">
        <a-textarea v-model="formData.description" placeholder="请输入描述" :max-length="500" show-word-limit />
      </a-form-item>
      <a-form-item v-if="isEdit" field="status" label="状态">
        <a-radio-group v-model="formData.status">
          <a-radio v-for="item in SPU_STATUS_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { SpuStatus, SPU_STATUS_OPTIONS, ATTR_TYPE_OPTIONS, AttrType } from '@gongchengcang/types'
import type { Spu, ProductCategory, ProductAttr, CreateSpuParams, UpdateSpuParams } from '@gongchengcang/types'
import { createSpu, updateSpu } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  spu: Spu | null
  categoryTree: ProductCategory[]
  attrList: ProductAttr[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref()
const isEdit = computed(() => !!props.spu)

const formData = ref<CreateSpuParams & { spuId?: string; status?: SpuStatus }>({
  spuName: '',
  spuCode: '',
  categoryId: '',
  unit: '',
  attrIds: [],
  mainImage: '',
  description: '',
  status: SpuStatus.ENABLED,
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.spu) {
        formData.value = {
          spuId: props.spu.spuId,
          spuName: props.spu.spuName,
          spuCode: props.spu.spuCode || '',
          categoryId: props.spu.categoryId,
          unit: props.spu.unit,
          attrIds: [...props.spu.attrIds],
          mainImage: props.spu.mainImage || '',
          description: props.spu.description || '',
          status: props.spu.status,
        }
      } else {
        formData.value = {
          spuName: '',
          spuCode: '',
          categoryId: '',
          unit: '',
          attrIds: [],
          mainImage: '',
          description: '',
          status: SpuStatus.ENABLED,
        }
      }
    }
  }
)

function getAttrTypeLabel(type: AttrType) {
  const option = ATTR_TYPE_OPTIONS.find(o => o.value === type)
  return option?.label || type
}

function handleCancel() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

async function handleOk() {
  try {
    await formRef.value?.validate()
    
    const categoryId = Array.isArray(formData.value.categoryId)
      ? formData.value.categoryId[formData.value.categoryId.length - 1]
      : formData.value.categoryId
    
    if (isEdit.value && formData.value.spuId) {
      const params: UpdateSpuParams = {
        spuName: formData.value.spuName,
        spuCode: formData.value.spuCode,
        categoryId,
        unit: formData.value.unit,
        attrIds: formData.value.attrIds,
        mainImage: formData.value.mainImage,
        description: formData.value.description,
        status: formData.value.status,
      }
      await updateSpu(formData.value.spuId, params)
      Message.success('编辑成功')
    } else {
      const params: CreateSpuParams = {
        spuName: formData.value.spuName,
        spuCode: formData.value.spuCode,
        categoryId,
        unit: formData.value.unit,
        attrIds: formData.value.attrIds,
        mainImage: formData.value.mainImage,
        description: formData.value.description,
      }
      await createSpu(params)
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
