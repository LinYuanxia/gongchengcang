<template>
  <a-drawer
    :visible="visible"
    :title="mode === 'add' ? '添加账号' : '编辑账号'"
    :width="500"
    :footer="true"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item field="userType" label="用户类型" :rules="[{ required: true, message: '请选择用户类型' }]">
          <a-select v-model="formData.userType" placeholder="请选择用户类型" @change="handleUserTypeChange">
            <a-option v-for="item in USER_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="formData.userType !== 1"
          field="tenantId"
          label="所属商户"
          :rules="[{ required: true, message: '请选择所属商户' }]"
        >
          <a-select v-model="formData.tenantId" placeholder="请选择所属商户" show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="username" label="用户名" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input
            v-model="formData.username"
            placeholder="请输入用户名（租户内唯一）"
            :max-length="50"
            :disabled="mode === 'edit'"
          />
        </a-form-item>
        <a-form-item v-if="mode === 'add'" field="password" label="初始密码" :rules="[{ required: true, message: '请输入初始密码' }]">
          <a-input-password v-model="formData.password" placeholder="请输入初始密码" :max-length="32" />
        </a-form-item>
        <a-form-item field="realName" label="姓名" :rules="[{ required: true, message: '请输入姓名' }]">
          <a-input v-model="formData.realName" placeholder="请输入真实姓名" :max-length="50" />
        </a-form-item>
        <a-form-item field="phone" label="手机号" :rules="[{ required: true, message: '请输入手机号' }, { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]">
          <a-input v-model="formData.phone" placeholder="请输入手机号" :max-length="20" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
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
import { USER_TYPE_OPTIONS } from '@gongchengcang/constants'
import { getUserDetail, createUser, updateUser, getMerchantList } from '@gongchengcang/api'
import type { User, Merchant, UserType } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  userId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const loading = ref(false)
const submitLoading = ref(false)
const merchantOptions = ref<{ label: string; value: string }[]>([])

const defaultFormData = {
  userType: 1 as UserType,
  tenantId: '',
  username: '',
  password: '',
  realName: '',
  phone: '',
  status: 1,
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
      if (props.mode === 'edit' && props.userId) {
        await loadUserDetail()
      } else {
        Object.assign(formData, defaultFormData)
      }
    }
  }
)

async function loadUserDetail() {
  loading.value = true
  try {
    const res = await getUserDetail(props.userId)
    Object.assign(formData, {
      userType: res.userType,
      tenantId: res.tenantId || '',
      username: res.username,
      realName: res.realName,
      phone: res.phone,
      status: res.status,
    })
  } catch (error: any) {
    Message.error(error.message || '获取用户详情失败')
  } finally {
    loading.value = false
  }
}

function handleUserTypeChange(val: number) {
  if (val === 1) {
    formData.tenantId = ''
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (props.mode === 'add') {
      await createUser({
        userType: formData.userType,
        tenantId: formData.userType === 1 ? undefined : formData.tenantId,
        username: formData.username,
        password: formData.password,
        realName: formData.realName,
        phone: formData.phone,
        status: formData.status,
      })
      Message.success('添加成功')
    } else {
      await updateUser(props.userId, {
        realName: formData.realName,
        phone: formData.phone,
        status: formData.status,
      })
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
