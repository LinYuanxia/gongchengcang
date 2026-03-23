<template>
  <a-drawer
    :visible="visible"
    :title="warehouse ? '编辑工程仓' : '新增工程仓'"
    :width="520"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <a-form-item field="code" label="工程仓编码">
        <a-input v-model="formData.code" placeholder="请输入工程仓编码" />
      </a-form-item>
      
      <a-form-item field="name" label="工程仓名称">
        <a-input v-model="formData.name" placeholder="请输入工程仓名称" />
      </a-form-item>
      
      <a-form-item field="contact" label="联系人">
        <a-input v-model="formData.contact" placeholder="请输入联系人姓名" />
      </a-form-item>
      
      <a-form-item field="phone" label="联系电话">
        <a-input v-model="formData.phone" placeholder="请输入联系电话" />
      </a-form-item>
      
      <a-form-item label="所在地区">
        <a-space>
          <a-select v-model="formData.province" placeholder="省" style="width: 140px">
            <a-option value="广东省">广东省</a-option>
          </a-select>
          <a-select v-model="formData.city" placeholder="市" style="width: 140px">
            <a-option value="深圳市">深圳市</a-option>
            <a-option value="广州市">广州市</a-option>
          </a-select>
          <a-select v-model="formData.district" placeholder="区" style="width: 140px">
            <a-option value="南山区">南山区</a-option>
            <a-option value="福田区">福田区</a-option>
            <a-option value="宝安区">宝安区</a-option>
            <a-option value="龙岗区">龙岗区</a-option>
          </a-select>
        </a-space>
      </a-form-item>
      
      <a-form-item field="address" label="详细地址">
        <a-textarea v-model="formData.address" placeholder="请输入详细地址" :max-length="200" />
      </a-form-item>
      
      <a-form-item field="status" label="状态">
        <a-radio-group v-model="formData.status">
          <a-radio value="active">启用</a-radio>
          <a-radio value="inactive">停用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'

interface Props {
  visible: boolean
  warehouse: any
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()

const formData = reactive({
  code: '',
  name: '',
  contact: '',
  phone: '',
  province: '广东省',
  city: '深圳市',
  district: '',
  address: '',
  status: 'active',
})

const rules = {
  code: [{ required: true, message: '请输入工程仓编码' }],
  name: [{ required: true, message: '请输入工程仓名称' }],
  contact: [{ required: true, message: '请输入联系人姓名' }],
  phone: [{ required: true, message: '请输入联系电话' }],
}

watch(() => props.warehouse, (val) => {
  if (val) {
    Object.assign(formData, val)
  } else {
    Object.assign(formData, {
      code: '',
      name: '',
      contact: '',
      phone: '',
      province: '广东省',
      city: '深圳市',
      district: '',
      address: '',
      status: 'active',
    })
  }
}, { immediate: true })

function handleCancel() {
  emit('update:visible', false)
}

async function handleOk() {
  try {
    await formRef.value.validate()
    emit('success')
  } catch (e) {
    // validation failed
  }
}
</script>
