<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑属性' : '新增属性'"
    :width="480"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="attrName" label="属性名称" :rules="[{ required: true, message: '请输入属性名称' }]">
        <a-input v-model="formData.attrName" placeholder="请输入属性名称" />
      </a-form-item>
      <a-form-item field="attrType" label="属性类型" :rules="[{ required: true, message: '请选择属性类型' }]">
        <a-radio-group v-model="formData.attrType" :disabled="isEdit">
          <a-radio v-for="item in ATTR_TYPE_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        v-if="formData.attrType !== 'input'"
        field="optionValues"
        label="可选值"
        :rules="[{ required: true, message: '请输入可选值' }]"
      >
        <div class="option-values">
          <div v-for="(value, index) in formData.optionValues" :key="index" class="option-item">
            <a-input v-model="formData.optionValues[index]" placeholder="请输入可选值" />
            <a-button type="text" status="danger" @click="removeOption(index)">
              <icon-delete />
            </a-button>
          </div>
          <a-button type="dashed" long @click="addOption">
            <template #icon><icon-plus /></template>
            添加可选值
          </a-button>
        </div>
      </a-form-item>
      <a-form-item field="sortOrder" label="排序号">
        <a-input-number v-model="formData.sortOrder" placeholder="请输入排序号" :min="0" />
      </a-form-item>
      <a-form-item v-if="isEdit" field="status" label="状态">
        <a-radio-group v-model="formData.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { AttrType, ATTR_TYPE_OPTIONS } from '@gongchengcang/types'
import type { ProductAttr, CreateAttrParams, UpdateAttrParams } from '@gongchengcang/types'
import { createAttr, updateAttr } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  attr: ProductAttr | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref()
const isEdit = computed(() => !!props.attr)

const formData = ref<CreateAttrParams & { attrId?: string; status?: number }>({
  attrName: '',
  attrType: AttrType.SINGLE,
  optionValues: [],
  sortOrder: 0,
  status: 1,
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.attr) {
        formData.value = {
          attrId: props.attr.attrId,
          attrName: props.attr.attrName,
          attrType: props.attr.attrType,
          optionValues: [...props.attr.optionValues],
          sortOrder: props.attr.sortOrder,
          status: props.attr.status,
        }
      } else {
        formData.value = {
          attrName: '',
          attrType: AttrType.SINGLE,
          optionValues: [],
          sortOrder: 0,
          status: 1,
        }
      }
    }
  }
)

function addOption() {
  formData.value.optionValues.push('')
}

function removeOption(index: number) {
  formData.value.optionValues.splice(index, 1)
}

function handleCancel() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

async function handleOk() {
  try {
    await formRef.value?.validate()
    
    const optionValues = formData.value.optionValues.filter(v => v.trim())
    
    if (isEdit.value && formData.value.attrId) {
      const params: UpdateAttrParams = {
        attrName: formData.value.attrName,
        optionValues,
        sortOrder: formData.value.sortOrder,
        status: formData.value.status,
      }
      await updateAttr(formData.value.attrId, params)
      Message.success('编辑成功')
    } else {
      const params: CreateAttrParams = {
        attrName: formData.value.attrName,
        attrType: formData.value.attrType,
        optionValues,
        sortOrder: formData.value.sortOrder,
      }
      await createAttr(params)
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
.option-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item .arco-input {
  flex: 1;
}
</style>
