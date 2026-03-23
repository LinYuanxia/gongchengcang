<template>
  <div class="role-manage">
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增角色
        </a-button>
      </template>

      <a-table :data="roles" :pagination="pagination">
        <template #columns>
          <a-table-column title="角色名称" data-index="name" :width="150" />
          <a-table-column title="角色描述" data-index="description" />
          <a-table-column title="账号数量" data-index="accountCount" :width="100" align="center" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-link @click="handlePermission(record)">权限</a-link>
                <a-popconfirm v-if="record.accountCount === 0" content="确定要删除该角色吗？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑角色' : '新增角色'" @ok="handleSubmit">
      <a-form :model="form" layout="vertical">
        <a-form-item label="角色名称" required>
          <a-input v-model="form.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model="form.description" placeholder="请输入角色描述" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="permissionModalVisible" title="权限设置" :width="600" @ok="handlePermissionSubmit">
      <a-tree
        v-model:checked-keys="checkedKeys"
        :data="permissionTree"
        :checkable="true"
        :default-expand-all="true"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const modalVisible = ref(false)
const permissionModalVisible = ref(false)
const isEdit = ref(false)
const checkedKeys = ref<string[]>([])
const currentRole = ref<any>(null)

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const form = ref({
  name: '',
  description: '',
})

const roles = ref([
  { id: '1', name: '管理员', description: '拥有所有权限', accountCount: 1, status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: '2', name: '仓管员', description: '负责仓库管理、入库出库操作', accountCount: 2, status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: '3', name: '采购员', description: '负责采购订单管理', accountCount: 1, status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: '4', name: '销售员', description: '负责销售订单管理', accountCount: 1, status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: '5', name: '财务员', description: '负责财务管理、对账操作', accountCount: 1, status: 'active', createTime: '2024-01-01 10:00:00' },
])

const permissionTree = ref([
  {
    key: 'dashboard',
    title: '工作台',
  },
  {
    key: 'merchant',
    title: '商户中心',
    children: [
      { key: 'merchant-profile', title: '主体信息' },
      { key: 'merchant-contract', title: '合同列表' },
    ],
  },
  {
    key: 'product',
    title: '商品中心',
    children: [
      { key: 'product-list', title: '商品列表' },
    ],
  },
  {
    key: 'warehouse',
    title: '仓库管理',
    children: [
      { key: 'warehouse-list', title: '仓库列表' },
    ],
  },
  {
    key: 'stock',
    title: '库存管理',
    children: [
      { key: 'stock-in', title: '入库单' },
      { key: 'stock-out', title: '出库单' },
    ],
  },
  {
    key: 'order',
    title: '订单管理',
    children: [
      { key: 'order-purchase', title: '采购订单' },
      { key: 'order-sale', title: '销售订单' },
    ],
  },
  {
    key: 'finance',
    title: '财务中心',
    children: [
      { key: 'finance-custody', title: '资金托管' },
      { key: 'finance-flow', title: '资金流水' },
      { key: 'finance-statement', title: '对账单' },
    ],
  },
  {
    key: 'invoice',
    title: '发票管理',
    children: [
      { key: 'invoice-list', title: '发票列表' },
    ],
  },
  {
    key: 'system',
    title: '系统设置',
    children: [
      { key: 'system-account', title: '账号列表' },
      { key: 'system-role', title: '角色列表' },
    ],
  },
])

function handleAdd() {
  isEdit.value = false
  form.value = {
    name: '',
    description: '',
  }
  modalVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  form.value = { ...record }
  modalVisible.value = true
}

function handleSubmit() {
  Message.success(isEdit.value ? '编辑成功' : '新增成功')
  modalVisible.value = false
}

function handlePermission(record: any) {
  currentRole.value = record
  checkedKeys.value = ['dashboard', 'product-list']
  permissionModalVisible.value = true
}

function handlePermissionSubmit() {
  Message.success('权限设置成功')
  permissionModalVisible.value = false
}

function handleDelete(record: any) {
  Message.success(`删除角色：${record.name}`)
}
</script>

<style scoped lang="less">
.role-manage {
  padding: 16px;
}
</style>
