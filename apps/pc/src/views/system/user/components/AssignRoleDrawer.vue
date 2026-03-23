<template>
  <a-drawer
    :visible="visible"
    title="分配角色"
    :width="500"
    :footer="true"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <div class="user-info">
        <span class="label">用户：</span>
        <span>{{ userInfo.realName }}（{{ userInfo.username }}）</span>
      </div>
      <a-divider />
      <a-checkbox-group v-model="selectedRoles" direction="vertical">
        <a-checkbox v-for="role in roleList" :key="role.roleId" :value="role.roleId">
          <div class="role-item">
            <span class="role-name">{{ role.roleName }}</span>
            <a-tag v-if="role.isSystem" size="small" color="blue">系统</a-tag>
          </div>
        </a-checkbox>
      </a-checkbox-group>
    </a-spin>

    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
          保存
        </a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getUserDetail, getAllRoles } from '@gongchengcang/api'
import type { User, Role } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  userId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const submitLoading = ref(false)
const userInfo = ref<Partial<User>>({})
const roleList = ref<Role[]>([])
const selectedRoles = ref<string[]>([])

watch(
  () => props.visible,
  async (val) => {
    if (val && props.userId) {
      await loadData()
    }
  }
)

async function loadData() {
  loading.value = true
  try {
    const user = await getUserDetail(props.userId)
    userInfo.value = user
    selectedRoles.value = user.roles?.map((r) => r.roleId) || []
    const roles = await getAllRoles(user.tenantId)
    roleList.value = roles
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    Message.success('角色分配成功')
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
.user-info {
  margin-bottom: 16px;
  .label {
    color: var(--text-color-secondary);
  }
}

.role-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.role-name {
  font-weight: 500;
}
</style>
