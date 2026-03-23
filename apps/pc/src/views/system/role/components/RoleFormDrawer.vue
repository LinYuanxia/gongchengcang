<template>
  <a-drawer
    :visible="visible"
    :title="mode === 'add' ? '添加角色' : '编辑角色'"
    :width="450"
    :footer="true"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item field="tenantId" label="所属商户">
          <a-select v-model="formData.tenantId" placeholder="不选择则为平台角色" allow-clear show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <template #extra>
            <span class="form-tip">平台角色可管理所有商户数据，商户角色只能管理本商户数据</span>
          </template>
        </a-form-item>
        <a-form-item field="roleName" label="角色名称" :rules="[{ required: true, message: '请输入角色名称' }]">
          <a-input v-model="formData.roleName" placeholder="请输入角色名称" :max-length="50" />
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
import { getRoleDetail, createRole, updateRole, getMerchantList } from '@gongchengcang/api'
import type { Merchant } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  roleId: string
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
  tenantId: '',
  roleName: '',
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
      if (props.mode === 'edit' && props.roleId) {
        await loadRoleDetail()
      } else {
        Object.assign(formData, defaultFormData)
      }
    }
  }
)

async function loadRoleDetail() {
  loading.value = true
  try {
    const res = await getRoleDetail(props.roleId)
    Object.assign(formData, {
      tenantId: res.tenantId || '',
      roleName: res.roleName,
    })
  } catch (error: any) {
    Message.error(error.message || '获取角色详情失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (props.mode === 'add') {
      await createRole({
        tenantId: formData.tenantId || undefined,
        roleName: formData.roleName,
      })
      Message.success('添加成功')
    } else {
      await updateRole(props.roleId, {
        roleName: formData.roleName,
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

<style scoped lang="less">
.form-tip {
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
