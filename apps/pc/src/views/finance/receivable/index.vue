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
          <a-statistic title="待收笔数" :value="3" suffix="笔">
            <template #suffix>
              <a-tag color="orange" size="small" style="margin-left: 8px">待收</a-tag>
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
        <a-tab-pane key="pending" title="待收" />
        <a-tab-pane key="received" title="已收" />
        <a-tab-pane key="void" title="已作废" />
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
          <a-select v-model="searchForm.reconcileStatus" placeholder="对账状态" style="width: 140px" allow-clear>
            <a-option value="yes">已对账</a-option>
            <a-option value="no">未对账</a-option>
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
          <a-table-column title="关联订单" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="付款方" data-index="payerName" :width="140" />
          <a-table-column title="收款方" data-index="receiverName" :width="140" />
          <a-table-column title="交易金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.orderAmount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="应收金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="收款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getReceiveStatusColor(record.status)">
                {{ getReceiveStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="对账状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag v-if="record.reconcileStatus === 'yes'" color="green">已对账</a-tag>
              <a-tag v-else color="gray">未对账</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="应收来源" :width="120">
            <template #cell="{ record }">
              {{ record.reason }}
            </template>
          </a-table-column>
          <a-table-column title="产生时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" title="应收详情" :width="800" :footer="false">
      <a-descriptions :column="2" bordered class="mb-16">
        <a-descriptions-item label="应收编号">{{ currentRecord?.receivableNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentRecord?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="付款方（施工方）">{{ currentRecord?.payerName }}</a-descriptions-item>
        <a-descriptions-item label="收款方（工程仓）">{{ currentRecord?.receiverName }}</a-descriptions-item>
        <a-descriptions-item label="订单交易金额">¥{{ currentRecord?.orderAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="应收金额（平台佣金）">
          <span class="text-danger text-lg">¥{{ currentRecord?.amount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="收款状态">
          <a-tag :color="getReceiveStatusColor(currentRecord?.status)">
            {{ getReceiveStatusText(currentRecord?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="对账状态">
          <a-tag v-if="currentRecord?.reconcileStatus === 'yes'" color="green">已对账</a-tag>
          <a-tag v-else color="gray">未对账</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="应收来源" :span="2">{{ currentRecord?.reason }}</a-descriptions-item>
        <a-descriptions-item label="产生时间" :span="2">{{ currentRecord?.createTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>关联分账信息</a-divider>
      <a-table :data="splitInfo" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="分账单号" data-index="splitNo" :width="160" />
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.splitAmount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="分账比例" :width="100" align="center">
            {{ record.splitRate }}%
          </a-table-column>
          <a-table-column title="分账状态" :width="100">
            <template #cell="{ record }">
              <a-tag color="green">已分账</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分账时间" data-index="splitTime" :width="180" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const activeTab = ref('all')
const detailVisible = ref(false)
const currentRecord = ref<any>(null)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  reconcileStatus: undefined as string | undefined,
  dateRange: [] as string[],
})

const splitInfo = ref([
  {
    splitNo: 'FZ202401200001',
    splitAmount: 1286,
    splitRate: 1,
    splitTime: '2024-01-20 12:30:00',
  },
])

const recordList = ref([
  {
    id: '1',
    receivableNo: 'YS202401200001',
    orderNo: 'SO202401200001',
    payerName: '中建三局深圳湾项目部',
    receiverName: '深圳湾科技园工程仓',
    orderAmount: 128600,
    amount: 1286,
    status: 'received',
    reconcileStatus: 'yes',
    reason: '施工方采购订单佣金',
    createTime: '2024-01-20 10:30:00',
  },
  {
    id: '2',
    receivableNo: 'YS202401190002',
    orderNo: 'SO202401190002',
    payerName: '中建八局上海分公司',
    receiverName: '上海浦东工程仓',
    orderAmount: 86500,
    amount: 865,
    status: 'received',
    reconcileStatus: 'yes',
    reason: '施工方采购订单佣金',
    createTime: '2024-01-19 14:20:00',
  },
  {
    id: '3',
    receivableNo: 'YS202401180003',
    orderNo: 'SO202401180003',
    payerName: '广州建筑集团',
    receiverName: '广州天河工程仓',
    orderAmount: 245000,
    amount: 2450,
    status: 'received',
    reconcileStatus: 'yes',
    reason: '施工方采购订单佣金',
    createTime: '2024-01-18 09:15:00',
  },
  {
    id: '4',
    receivableNo: 'YS202401170004',
    orderNo: 'SO202401170004',
    payerName: '碧桂园深圳项目部',
    receiverName: '深圳宝安工程仓',
    orderAmount: 156000,
    amount: 1560,
    status: 'pending',
    reconcileStatus: 'no',
    reason: '施工方采购订单佣金',
    createTime: '2024-01-17 16:45:00',
  },
  {
    id: '5',
    receivableNo: 'YS202401160005',
    orderNo: 'SO202401160005',
    payerName: '万科北京分公司',
    receiverName: '北京朝阳工程仓',
    orderAmount: 320000,
    amount: 3200,
    status: 'pending',
    reconcileStatus: 'no',
    reason: '施工方采购订单佣金',
    createTime: '2024-01-16 11:20:00',
  },
  {
    id: '6',
    receivableNo: 'YS202401150006',
    orderNo: 'SO202401150006',
    payerName: '恒大地产成都公司',
    receiverName: '成都武侯工程仓',
    orderAmount: 98000,
    amount: 980,
    status: 'overdue',
    reconcileStatus: 'no',
    reason: '施工方采购订单佣金',
    createTime: '2024-01-15 08:30:00',
  },
  {
    id: '7',
    receivableNo: 'YS202401140007',
    orderNo: 'SO202401140007',
    payerName: '融创重庆项目部',
    receiverName: '重庆渝中工程仓',
    orderAmount: 142000,
    amount: 1420,
    status: 'void',
    reconcileStatus: 'no',
    reason: '订单取消-已作废',
    createTime: '2024-01-14 15:10:00',
  },
])

const filteredRecordList = computed(() => {
  let list = [...recordList.value]
  
  if (activeTab.value !== 'all') {
    list = list.filter(item => item.status === activeTab.value)
  }
  
  if (searchForm.keyword) {
    list = list.filter(item => 
      item.receivableNo.includes(searchForm.keyword) ||
      item.orderNo.includes(searchForm.keyword) ||
      item.payerName.includes(searchForm.keyword)
    )
  }
  
  if (searchForm.reconcileStatus) {
    list = list.filter(item => item.reconcileStatus === searchForm.reconcileStatus)
  }
  
  pagination.total = list.length
  return list
})

function getReceiveStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待收',
    received: '已收',
    void: '已作废',
    overdue: '已逾期',
  }
  return map[status] || '-'
}

function getReceiveStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    received: 'green',
    void: 'gray',
    overdue: 'red',
  }
  return map[status] || 'gray'
}

function handleSearch() {
  Message.success('搜索完成')
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.reconcileStatus = undefined
  searchForm.dateRange = []
  Message.success('已重置')
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  currentRecord.value = record
  detailVisible.value = true
}
</script>

<style scoped>
.record-tabs {
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.text-danger {
  color: #f53f3f;
  font-weight: 500;
}

.mb-16 {
  margin-bottom: 16px;
}
</style>
