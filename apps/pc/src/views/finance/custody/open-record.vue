<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商户名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="审核状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CUSTODY_OPEN_AUDIT_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-range-picker v-model="dateRange" style="width: 260px" @change="handleDateChange" />
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="applyId"
      >
        <template #columns>
          <a-table-column title="申请ID" data-index="applyId" :width="180" />
          <a-table-column title="商户名称" :width="180">
            <template #cell="{ record }">
              {{ record.merchantName || record.tenantId }}
            </template>
          </a-table-column>
          <a-table-column title="申请类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.color">
                {{ CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="提交时间" data-index="submitTime" :width="180" />
          <a-table-column title="审核状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.color">
                {{ CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="审核时间" data-index="auditTime" :width="180" />
          <a-table-column title="失败原因" data-index="failReason" :width="200" />
          <a-table-column title="重试次数" data-index="retryCount" :width="80" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看资质</a-button>
                <a-button
                  v-if="record.status === 4"
                  type="text"
                  size="small"
                  status="warning"
                  @click="handleRetry(record)"
                >
                  重试开户
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <QualificationDrawer
      v-model:visible="qualVisible"
      :tenant-id="currentTenantId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  CUSTODY_OPEN_AUDIT_STATUS_OPTIONS,
  CUSTODY_OPEN_AUDIT_STATUS_MAP,
  CUSTODY_OPEN_APPLY_TYPE_MAP,
} from '@gongchengcang/constants'
import { getOpenRecordList, retryOpenAccount } from '@gongchengcang/api'
import type { CustodyOpenRecord } from '@gongchengcang/types'
import QualificationDrawer from './components/QualificationDrawer.vue'

const loading = ref(false)
const tableData = ref<CustodyOpenRecord[]>([])
const dateRange = ref<string[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
  startTime: '',
  endTime: '',
})

const qualVisible = ref(false)
const currentTenantId = ref('')

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getOpenRecordList({
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

function handleDateChange(val: string[]) {
  if (val && val.length === 2) {
    searchForm.startTime = val[0]
    searchForm.endTime = val[1]
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
  handleSearch()
}

function handleView(record: CustodyOpenRecord) {
  currentTenantId.value = record.tenantId
  qualVisible.value = true
}

async function handleRetry(record: CustodyOpenRecord) {
  try {
    await retryOpenAccount(record.tenantId)
    Message.success('重新开户申请已提交')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  }
}
</script>
