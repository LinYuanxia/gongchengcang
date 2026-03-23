<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索合同编号"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.tenantId" placeholder="所属商户" style="width: 180px" allow-clear show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.contractType" placeholder="合同类型" style="width: 140px" allow-clear>
            <a-option v-for="item in CONTRACT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="合同状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CONTRACT_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            添加合同
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="contractId"
      >
        <template #columns>
          <a-table-column title="合同编号" data-index="contractNo" :width="150" />
          <a-table-column title="所属商户" :width="180">
            <template #cell="{ record }">
              {{ getMerchantName(record.tenantId) }}
            </template>
          </a-table-column>
          <a-table-column title="合同类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="CONTRACT_TYPE_MAP[record.contractType]?.color">
                {{ CONTRACT_TYPE_MAP[record.contractType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="签署日期" data-index="signDate" :width="120" />
          <a-table-column title="生效日期" data-index="contractStartDate" :width="120" />
          <a-table-column title="截止日期" :width="120">
            <template #cell="{ record }">
              {{ record.contractEndDate || '长期' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CONTRACT_STATUS_MAP[record.status]?.color">
                {{ CONTRACT_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm v-if="record.status === 1" content="确定要作废该合同吗？" @ok="handleInvalidate(record)">
                  <a-button type="text" size="small" status="warning">作废</a-button>
                </a-popconfirm>
                <a-popconfirm content="确定要删除该合同吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <ContractDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :contract-id="currentContractId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE_MAP,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_STATUS_MAP,
} from '@gongchengcang/constants'
import { getContractList, deleteContract, invalidateContract, getMerchantList } from '@gongchengcang/api'
import type { Contract, Merchant } from '@gongchengcang/types'
import ContractDrawer from './components/ContractDrawer.vue'

const loading = ref(false)
const tableData = ref<Contract[]>([])
const merchantOptions = ref<{ label: string; value: string }[]>([])
const merchantMap = ref<Map<string, string>>(new Map())

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  tenantId: undefined as string | undefined,
  contractType: undefined as string | undefined,
  status: undefined as number | undefined,
})

const drawerVisible = ref(false)
const drawerMode = ref<'add' | 'edit' | 'view'>('add')
const currentContractId = ref('')

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
    merchantMap.value = new Map(res.list.map((item: Merchant) => [item.tenantId, item.merchantName]))
  } catch (error) {
    console.error('load merchants error', error)
  }
}

function getMerchantName(tenantId: string) {
  return merchantMap.value.get(tenantId) || tenantId
}

async function loadData() {
  loading.value = true
  try {
    const res = await getContractList({
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
  drawerMode.value = 'add'
  currentContractId.value = ''
  drawerVisible.value = true
}

function handleView(record: Contract) {
  drawerMode.value = 'view'
  currentContractId.value = record.contractId
  drawerVisible.value = true
}

function handleEdit(record: Contract) {
  drawerMode.value = 'edit'
  currentContractId.value = record.contractId
  drawerVisible.value = true
}

async function handleDelete(record: Contract) {
  try {
    await deleteContract(record.contractId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

async function handleInvalidate(record: Contract) {
  try {
    await invalidateContract(record.contractId)
    Message.success('合同已作废')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  }
}

function handleFormSuccess() {
  loadData()
}
</script>
