<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商户名称/联系人"
            style="width: 220px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.tenantType" placeholder="商户类型" style="width: 140px" allow-clear>
            <a-option v-for="item in TENANT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.registrationStatus" placeholder="入驻状态" style="width: 120px" allow-clear>
            <a-option v-for="item in REGISTRATION_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.enabledStatus" placeholder="启用状态" style="width: 120px" allow-clear>
            <a-option v-for="item in ENABLED_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            添加商户
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="tenantId"
      >
        <template #columns>
          <a-table-column title="租户ID" data-index="tenantId" :width="180" />
          <a-table-column title="商户名称" data-index="merchantName" :width="200">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.merchantName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="商户类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="TENANT_TYPE_MAP[record.tenantType]?.color">
                {{ TENANT_TYPE_MAP[record.tenantType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="联系人" data-index="contactPerson" :width="100" />
          <a-table-column title="联系电话" data-index="contactPhone" :width="130" />
          <a-table-column title="入驻状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="REGISTRATION_STATUS_MAP[record.registrationStatus]?.color">
                {{ REGISTRATION_STATUS_MAP[record.registrationStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="启用状态" :width="100">
            <template #cell="{ record }">
              <a-switch
                v-model="record.enabledStatus"
                :checked-value="1"
                :unchecked-value="0"
                :disabled="record.registrationStatus !== 'approved'"
                @change="(val) => handleStatusChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleContract(record)">合同</a-button>
                <a-button type="text" size="small" @click="handleAccount(record)">账号</a-button>
                <a-popconfirm content="确定要删除该商户吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <MerchantFormDrawer
      v-model:visible="formVisible"
      :mode="formMode"
      :tenant-id="currentTenantId"
      @success="handleFormSuccess"
    />

    <MerchantDetailDrawer
      v-model:visible="detailVisible"
      :tenant-id="currentTenantId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  TENANT_TYPE_OPTIONS,
  TENANT_TYPE_MAP,
  REGISTRATION_STATUS_OPTIONS,
  REGISTRATION_STATUS_MAP,
  ENABLED_STATUS_OPTIONS,
} from '@gongchengcang/constants'
import { getMerchantList, deleteMerchant, updateMerchantStatus } from '@gongchengcang/api'
import type { Merchant } from '@gongchengcang/types'
import MerchantFormDrawer from './components/MerchantFormDrawer.vue'
import MerchantDetailDrawer from './components/MerchantDetailDrawer.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<Merchant[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  tenantType: undefined as string | undefined,
  registrationStatus: undefined as string | undefined,
  enabledStatus: undefined as number | undefined,
})

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentTenantId = ref('')
const detailVisible = ref(false)

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchantList({
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
  currentTenantId.value = ''
  formVisible.value = true
}

function handleView(record: Merchant) {
  currentTenantId.value = record.tenantId
  detailVisible.value = true
}

function handleViewDetail(record: Merchant) {
  router.push({ path: '/merchant/detail', query: { id: record.tenantId } })
}

function handleEdit(record: Merchant) {
  formMode.value = 'edit'
  currentTenantId.value = record.tenantId
  formVisible.value = true
}

function handleContract(record: Merchant) {
  Message.info(`查看商户「${record.merchantName}」的合同`)
}

function handleAccount(record: Merchant) {
  Message.info(`查看商户「${record.merchantName}」的账号`)
}

async function handleDelete(record: Merchant) {
  try {
    await deleteMerchant(record.tenantId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

async function handleStatusChange(record: Merchant, val: number | boolean) {
  try {
    await updateMerchantStatus(record.tenantId, val as number)
    Message.success('状态更新成功')
  } catch (error: any) {
    Message.error(error.message || '状态更新失败')
    record.enabledStatus = val === 1 ? 0 : 1
  }
}

function handleFormSuccess() {
  loadData()
}
</script>
