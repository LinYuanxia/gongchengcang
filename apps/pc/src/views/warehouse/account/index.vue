<template>
  <div class="account-manage">
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增账号
        </a-button>
      </template>

      <a-table :data="accounts" :pagination="pagination">
        <template #columns>
          <a-table-column title="账号" data-index="username" :width="150" />
          <a-table-column title="姓名" data-index="name" :width="120" />
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="角色" :width="150">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="role in record.roles" :key="role" color="arcoblue">{{ role }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="所属仓库" data-index="warehouse" :width="150" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="最后登录" data-index="lastLogin" :width="180" />
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-link @click="handleResetPassword(record)">重置密码</a-link>
                <a-popconfirm :content="`确定要${record.status === 'active' ? '禁用' : '启用'}该账号吗？`" @ok="handleToggleStatus(record)">
                  <a-link :status="record.status === 'active' ? 'warning' : 'success'">
                    {{ record.status === 'active' ? '禁用' : '启用' }}
                  </a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑账号' : '新增账号'" @ok="handleSubmit">
      <a-form :model="form" layout="vertical">
        <a-form-item label="账号" required>
          <a-input v-model="form.username" placeholder="请输入账号" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model="form.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="手机号" required>
          <a-input v-model="form.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model="form.roles" placeholder="请选择角色" multiple style="width: 100%">
            <a-option value="管理员">管理员</a-option>
            <a-option value="仓管员">仓管员</a-option>
            <a-option value="采购员">采购员</a-option>
            <a-option value="销售员">销售员</a-option>
            <a-option value="财务员">财务员</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属仓库">
          <a-select v-model="form.warehouse" placeholder="请选择仓库" allow-clear style="width: 100%">
            <a-option value="深圳湾科技园主仓">深圳湾科技园主仓</a-option>
            <a-option value="福田CBD分仓">福田CBD分仓</a-option>
            <a-option value="宝安机场分仓">宝安机场分仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="!isEdit" label="初始密码" required>
          <a-input-password v-model="form.password" placeholder="请输入初始密码" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const modalVisible = ref(false)
const isEdit = ref(false)

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const form = ref({
  username: '',
  name: '',
  phone: '',
  roles: [] as string[],
  warehouse: '',
  password: '',
})

const accounts = ref([
  { id: '1', username: 'admin', name: '王仓管', phone: '13800138000', roles: ['管理员'], warehouse: '深圳湾科技园主仓', status: 'active', lastLogin: '2024-01-15 09:30:00', createTime: '2024-01-01 10:00:00' },
  { id: '2', username: 'warehouse01', name: '张三', phone: '13800138001', roles: ['仓管员'], warehouse: '深圳湾科技园主仓', status: 'active', lastLogin: '2024-01-15 08:00:00', createTime: '2024-01-02 10:00:00' },
  { id: '3', username: 'purchase01', name: '李四', phone: '13800138002', roles: ['采购员'], warehouse: '', status: 'active', lastLogin: '2024-01-14 17:30:00', createTime: '2024-01-03 10:00:00' },
  { id: '4', username: 'sale01', name: '赵五', phone: '13800138003', roles: ['销售员'], warehouse: '', status: 'active', lastLogin: '2024-01-15 10:00:00', createTime: '2024-01-04 10:00:00' },
  { id: '5', username: 'finance01', name: '钱六', phone: '13800138004', roles: ['财务员'], warehouse: '', status: 'inactive', lastLogin: '2024-01-10 14:00:00', createTime: '2024-01-05 10:00:00' },
])

function handleAdd() {
  isEdit.value = false
  form.value = {
    username: '',
    name: '',
    phone: '',
    roles: [],
    warehouse: '',
    password: '',
  }
  modalVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  form.value = { ...record, password: '' }
  modalVisible.value = true
}

function handleSubmit() {
  Message.success(isEdit.value ? '编辑成功' : '新增成功')
  modalVisible.value = false
}

function handleResetPassword(record: any) {
  Message.success(`已重置 ${record.name} 的密码`)
}

function handleToggleStatus(record: any) {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  Message.success(`${record.name} 已${record.status === 'active' ? '启用' : '禁用'}`)
}
</script>

<style scoped lang="less">
.account-manage {
  padding: 16px;
}
</style>
