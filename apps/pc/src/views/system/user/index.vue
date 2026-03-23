<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索用户名/姓名/手机号"
            style="width: 220px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.userType" placeholder="用户类型" style="width: 150px" allow-clear>
            <a-option v-for="item in USER_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="账号状态" style="width: 120px" allow-clear>
            <a-option v-for="item in USER_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.tenantId" placeholder="所属商户" style="width: 180px" allow-clear show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            添加账号
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="userId"
      >
        <template #columns>
          <a-table-column title="用户ID" data-index="userId" :width="180" />
          <a-table-column title="用户名" data-index="username" :width="150" />
          <a-table-column title="姓名" data-index="realName" :width="100" />
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="用户类型" :width="140">
            <template #cell="{ record }">
              <a-tag :color="USER_TYPE_MAP[record.userType]?.color">
                {{ USER_TYPE_MAP[record.userType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="所属商户" :width="180">
            <template #cell="{ record }">
              {{ record.tenant?.merchantName || '平台' }}
            </template>
          </a-table-column>
          <a-table-column title="默认管理员" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.isDefaultAdmin" color="blue">是</a-tag>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-switch
                v-model="record.status"
                :checked-value="1"
                :unchecked-value="0"
                @change="(val) => handleStatusChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="最后登录" :width="180">
            <template #cell="{ record }">
              <div v-if="record.lastLoginTime">
                {{ record.lastLoginTime }}
              </div>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleResetPassword(record)">重置密码</a-button>
                <a-button type="text" size="small" @click="handleAssignRole(record)">分配角色</a-button>
                <a-popconfirm v-if="!record.isDefaultAdmin" content="确定要删除该账号吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <UserFormDrawer
      v-model:visible="formVisible"
      :mode="formMode"
      :user-id="currentUserId"
      @success="handleFormSuccess"
    />

    <AssignRoleDrawer
      v-model:visible="assignRoleVisible"
      :user-id="currentUserId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  USER_TYPE_OPTIONS,
  USER_TYPE_MAP,
  USER_STATUS_OPTIONS,
} from '@gongchengcang/constants'
import { getUserList, deleteUser, updateUserStatus, resetPassword, getMerchantList } from '@gongchengcang/api'
import type { User, Merchant } from '@gongchengcang/types'
import UserFormDrawer from './components/UserFormDrawer.vue'
import AssignRoleDrawer from './components/AssignRoleDrawer.vue'

const loading = ref(false)
const tableData = ref<User[]>([])
const merchantOptions = ref<{ label: string; value: string }[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  userType: undefined as number | undefined,
  status: undefined as number | undefined,
  tenantId: undefined as string | undefined,
})

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentUserId = ref('')
const assignRoleVisible = ref(false)

onMounted(async () => {
  await loadMerchants()
  loadData()
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

async function loadData() {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleAdd() {
  formMode.value = 'add'
  currentUserId.value = ''
  formVisible.value = true
}

function handleEdit(record: User) {
  formMode.value = 'edit'
  currentUserId.value = record.userId
  formVisible.value = true
}

async function handleDelete(record: User) {
  try {
    await deleteUser(record.userId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

async function handleStatusChange(record: User, val: number | boolean) {
  try {
    await updateUserStatus(record.userId, val as number)
    Message.success('状态更新成功')
  } catch (error: any) {
    Message.error(error.message || '状态更新失败')
    record.status = val === 1 ? 0 : 1
  }
}

async function handleResetPassword(record: User) {
  try {
    const res = await resetPassword(record.userId)
    Message.success(`密码已重置为：${res.password}，请通知用户及时修改`)
  } catch (error: any) {
    Message.error(error.message || '重置密码失败')
  }
}

function handleAssignRole(record: User) {
  currentUserId.value = record.userId
  assignRoleVisible.value = true
}

function handleFormSuccess() {
  loadData()
}
</script>
