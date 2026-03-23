<template>
  <a-drawer
    :visible="visible"
    title="权限配置"
    :width="500"
    :footer="true"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-tree
        v-model:checked-keys="checkedKeys"
        :data="permissionTree"
        :checkable="true"
        :default-expand-all="true"
        :field-names="{ key: 'code', title: 'name', children: 'children' }"
      />
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
import { getRoleDetail } from '@gongchengcang/api'
import type { Permission } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  roleId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const submitLoading = ref(false)
const checkedKeys = ref<string[]>([])

const permissionTree: Permission[] = [
  {
    code: 'merchant',
    name: '商户管理',
    children: [
      { code: 'merchant:list', name: '商户列表' },
      { code: 'merchant:add', name: '添加商户' },
      { code: 'merchant:edit', name: '编辑商户' },
      { code: 'merchant:delete', name: '删除商户' },
      { code: 'merchant:audit', name: '审核商户' },
    ],
  },
  {
    code: 'contract',
    name: '合同管理',
    children: [
      { code: 'contract:list', name: '合同列表' },
      { code: 'contract:add', name: '添加合同' },
      { code: 'contract:edit', name: '编辑合同' },
      { code: 'contract:delete', name: '删除合同' },
    ],
  },
  {
    code: 'user',
    name: '账号管理',
    children: [
      { code: 'user:list', name: '账号列表' },
      { code: 'user:add', name: '添加账号' },
      { code: 'user:edit', name: '编辑账号' },
      { code: 'user:delete', name: '删除账号' },
      { code: 'user:reset-password', name: '重置密码' },
    ],
  },
  {
    code: 'role',
    name: '角色管理',
    children: [
      { code: 'role:list', name: '角色列表' },
      { code: 'role:add', name: '添加角色' },
      { code: 'role:edit', name: '编辑角色' },
      { code: 'role:delete', name: '删除角色' },
      { code: 'role:permission', name: '权限配置' },
    ],
  },
  {
    code: 'product',
    name: '商品管理',
    children: [
      { code: 'product:list', name: '商品列表' },
      { code: 'product:add', name: '添加商品' },
      { code: 'product:edit', name: '编辑商品' },
      { code: 'product:delete', name: '删除商品' },
    ],
  },
  {
    code: 'order',
    name: '订单管理',
    children: [
      { code: 'order:list', name: '订单列表' },
      { code: 'order:detail', name: '订单详情' },
      { code: 'order:audit', name: '订单审核' },
    ],
  },
  {
    code: 'warehouse',
    name: '仓库管理',
    children: [
      { code: 'warehouse:list', name: '仓库列表' },
      { code: 'warehouse:add', name: '添加仓库' },
      { code: 'warehouse:edit', name: '编辑仓库' },
      { code: 'warehouse:delete', name: '删除仓库' },
      { code: 'warehouse:inventory', name: '库存管理' },
    ],
  },
  {
    code: 'finance',
    name: '财务管理',
    children: [
      { code: 'finance:account', name: '账户管理' },
      { code: 'finance:transaction', name: '交易记录' },
      { code: 'finance:withdraw', name: '提现管理' },
      { code: 'finance:rule', name: '分账规则' },
    ],
  },
]

watch(
  () => props.visible,
  async (val) => {
    if (val && props.roleId) {
      await loadRolePermissions()
    }
  }
)

async function loadRolePermissions() {
  loading.value = true
  try {
    const res = await getRoleDetail(props.roleId)
    checkedKeys.value = res.permissions?.map((p) => p.code) || []
  } catch (error: any) {
    Message.error(error.message || '获取权限失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    Message.success('权限配置成功')
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
