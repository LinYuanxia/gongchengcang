<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索角色名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.tenantId" placeholder="所属商户" style="width: 180px" allow-clear show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            添加角色
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="roleId"
      >
        <template #columns>
          <a-table-column title="角色ID" data-index="roleId" :width="180" />
          <a-table-column title="角色名称" data-index="roleName" :width="150" />
          <a-table-column title="所属商户" :width="180">
            <template #cell="{ record }">
              {{ getMerchantName(record.tenantId) }}
            </template>
          </a-table-column>
          <a-table-column title="角色类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getRoleTypeColor(record.tenantId)">
                {{ getRoleTypeName(record.tenantId) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handlePermission(record)">权限配置</a-button>
                <a-popconfirm
                  v-if="!record.isSystem"
                  content="确定要删除该角色吗？"
                  @ok="handleDelete(record)"
                >
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <RoleFormDrawer
      v-model:visible="formVisible"
      :mode="formMode"
      :role-id="currentRoleId"
      @success="handleFormSuccess"
    />

    <PermissionDrawer
      v-model:visible="permissionVisible"
      :role-id="currentRoleId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getRoleList, deleteRole, getMerchantList } from '@gongchengcang/api'
import type { Role, Merchant } from '@gongchengcang/types'
import RoleFormDrawer from './components/RoleFormDrawer.vue'
import PermissionDrawer from './components/PermissionDrawer.vue'

const loading = ref(false)
const tableData = ref<Role[]>([])
const merchantOptions = ref<{ label: string; value: string }[]>([])
const merchantMap = ref<Map<string, { name: string; tenantType?: number }>>(new Map())

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  tenantId: undefined as string | undefined,
})

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentRoleId = ref('')
const permissionVisible = ref(false)

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
    merchantMap.value = new Map(res.list.map((item: Merchant) => [item.tenantId, { name: item.merchantName, tenantType: item.tenantType }]))
  } catch (error) {
    console.error('load merchants error', error)
  }
}

function getMerchantName(tenantId: string) {
  if (!tenantId) return '平台'
  return merchantMap.value.get(tenantId)?.name || tenantId
}

function getRoleTypeName(tenantId?: string) {
  if (!tenantId) return '平台角色'
  const merchant = merchantMap.value.get(tenantId)
  if (!merchant) return '自定义角色'
  switch (merchant.tenantType) {
    case 1: return '供应商角色'
    case 2: return '施工方角色'
    case 3: return '工程仓角色'
    default: return '自定义角色'
  }
}

function getRoleTypeColor(tenantId?: string) {
  if (!tenantId) return 'blue'
  const merchant = merchantMap.value.get(tenantId)
  if (!merchant) return 'gray'
  switch (merchant.tenantType) {
    case 1: return 'green'
    case 2: return 'orange'
    case 3: return 'purple'
    default: return 'gray'
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getRoleList({
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
  currentRoleId.value = ''
  formVisible.value = true
}

function handleEdit(record: Role) {
  formMode.value = 'edit'
  currentRoleId.value = record.roleId
  formVisible.value = true
}

async function handleDelete(record: Role) {
  try {
    await deleteRole(record.roleId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

function handlePermission(record: Role) {
  currentRoleId.value = record.roleId
  permissionVisible.value = true
}

function handleFormSuccess() {
  loadData()
}
</script>
