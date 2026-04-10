<template>
  <div class="page-container">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="应收总金额" :value="1286000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已收金额" :value="986000" :precision="2" suffix=" ">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待收金额" :value="300000" :precision="2">
            <template #prefix>¥</template>
            <template #suffix>
              <a-tag color="orange" size="small" style="margin-left: 8px">待确认</a-tag>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="应收记录数" :value="12" suffix="笔" />
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <a-tabs v-model:active-tab="activeTab" class="record-tabs">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="pending" title="待收款" />
        <a-tab-pane key="received" title="已收款" />
        <a-tab-pane key="overdue" title="已逾期" />
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索应收编号/关联订单号/付款方"
            style="width: 280px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.payerType" placeholder="付款方类型" style="width: 140px" allow-clear>
            <a-option value="warehouse">工程仓</a-option>
            <a-option value="supplier">供应商</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="收款状态" style="width: 140px" allow-clear>
            <a-option value="pending">待收款</a-option>
            <a-option value="received">已收款</a-option>
            <a-option value="overdue">已逾期</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-table
        :data="filteredRecordList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="应收编号" data-index="receivableNo" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.receivableNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="付款方" data-index="payerName" :width="180" />
          <a-table-column title="付款方类型" :width="100">
            <template #cell="{ record }">
              <a-tag color="blue">
                {{ record.payerType === 'warehouse' ? '工程仓' : '供应商' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="应收金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-xl">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="已收金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-success">¥{{ record.receivedAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="待收金额" :width="120" align="right">
            <template #cell="{ record }">
              <span v-if="record.pendingAmount > 0" class="text-warning">¥{{ record.pendingAmount?.toLocaleString() }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="应收原因" data-index="reason" :width="200" />
          <a-table-column title="到期时间" data-index="dueTime" :width="160" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button 
                  v-if="record.status === 'pending'" 
                  type="text" 
                  size="small"
                  status="success"
                  @click="handleConfirmReceive(record)"
                >
                  确认收款
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const activeTab = ref('all')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  payerType: undefined as string | undefined,
  status: undefined as string | undefined,
  dateRange: [] as string[],
})

const recordList = ref([
  {
    id: '1',
    receivableNo: 'YS202401200001',
    orderNo: 'PO202401200001',
    payerName: '北京朝阳工程仓',
    payerType: 'warehouse',
    amount: 128600,
    receivedAmount: 123600,
    pendingAmount: 0,
    status: 'received',
    reason: 'C30混凝土、HRB400钢筋采购款',
    dueTime: '2024-01-25 23:59:59',
    createTime: '2024-01-20 10:30:00',
  },
  {
    id: '2',
    receivableNo: 'YS202401190002',
    orderNo: 'PO202401190002',
    payerName: '上海浦东工程仓',
    payerType: 'warehouse',
    amount: 86500,
    receivedAmount: 86500,
    pendingAmount: 0,
    status: 'received',
    reason: 'PC42.5水泥采购款',
    dueTime: '2024-01-24 23:59:59',
    createTime: '2024-01-19 14:20:00',
  },
  {
    id: '3',
    receivableNo: 'YS202401180003',
    orderNo: 'PO202401180003',
    payerName: '广州天河工程仓',
    payerType: 'warehouse',
    amount: 245000,
    receivedAmount: 233000,
    pendingAmount: 0,
    status: 'received',
    reason: '蒸压加气砌块、中砂河沙、碎石骨料采购款',
    dueTime: '2024-01-23 23:59:59',
    createTime: '2024-01-18 09:15:00',
  },
  {
    id: '4',
    receivableNo: 'YS202401170004',
    orderNo: 'PO202401170004',
    payerName: '北京朝阳工程仓',
    payerType: 'warehouse',
    amount: 67800,
    receivedAmount: 0,
    pendingAmount: 67800,
    status: 'pending',
    reason: 'SBS改性沥青防水卷材采购款',
    dueTime: '2024-01-22 23:59:59',
    createTime: '2024-01-17 16:45:00',
  },
  {
    id: '5',
    receivableNo: 'YS202401160005',
    orderNo: 'PO202401160005',
    payerName: '上海浦东工程仓',
    payerType: 'warehouse',
    amount: 150000,
    receivedAmount: 0,
    pendingAmount: 150000,
    status: 'overdue',
    reason: '外墙乳胶漆采购款（逾期）',
    dueTime: '2024-01-21 23:59:59',
    createTime: '2024-01-16 11:30:00',
  },
  {
    id: '6',
    receivableNo: 'YS202401150006',
    orderNo: 'FW202401150001',
    payerName: '广东建材集团',
    payerType: 'supplier',
    amount: 82200,
    receivedAmount: 82200,
    pendingAmount: 0,
    status: 'received',
    reason: '平台服务费',
    dueTime: '2024-01-20 23:59:59',
    createTime: '2024-01-15 09:00:00',
  },
])

const filteredRecordList = computed(() => {
  let result = recordList.value

  if (activeTab.value === 'pending') {
    result = result.filter(r => r.status === 'pending')
  } else if (activeTab.value === 'received') {
    result = result.filter(r => r.status === 'received')
  } else if (activeTab.value === 'overdue') {
    result = result.filter(r => r.status === 'overdue')
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r => 
      r.receivableNo.toLowerCase().includes(keyword) ||
      r.orderNo.toLowerCase().includes(keyword) ||
      r.payerName.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.payerType) {
    result = result.filter(r => r.payerType === searchForm.payerType)
  }

  if (searchForm.status) {
    result = result.filter(r => r.status === searchForm.status)
  }

  return result
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待收款',
    received: '已收款',
    overdue: '已逾期',
  }
  return map[status] || status
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    received: 'green',
    overdue: 'red',
  }
  return map[status] || 'gray'
}

onMounted(() => {
  pagination.total = recordList.value.length
})

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.payerType = undefined
  searchForm.status = undefined
  searchForm.dateRange = []
  activeTab.value = 'all'
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  Message.info('查看应收详情：' + record.receivableNo)
}

function handleConfirmReceive(record: any) {
  Message.success('已确认收款：' + record.receivableNo)
  record.status = 'received'
  record.receivedAmount = record.amount
  record.pendingAmount = 0
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.record-tabs) {
  margin-bottom: 16px;

  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.text-success {
  color: rgb(var(--success-6));
}

.text-warning {
  color: rgb(var(--warning-6));
}

.text-muted {
  color: rgb(var(--gray-6));
}

.text-xl {
  font-size: 18px;
  font-weight: 600;
}
</style>
