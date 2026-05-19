<template>
  <div class="deduction-page">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="应扣总金额" :value="totalDeductAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已扣款金额" :value="deductedAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待扣款金额" :value="pendingAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="应扣记录数" :value="totalCount" suffix="笔" />
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索应扣编号/关联订单号/施工方"
            style="width: 280px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="扣款状态" style="width: 140px" allow-clear>
            <a-option value="deducted">已扣款</a-option>
            <a-option value="pending">待扣款</a-option>
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
          <a-table-column title="应扣编号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.deductionNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="施工方" data-index="constructionParty" :width="180" />
          <a-table-column title="应扣类型" :width="120">
            <template #cell="{ record }">
              <a-tag color="blue">交易撮合费</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="130" align="right">
            <template #cell="{ record }">
              <div>
                <div>¥{{ record.orderAmount?.toLocaleString() }}</div>
                <div class="paid-amount">实付 ¥{{ record.paidAmount?.toLocaleString() }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="工程仓入账" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.warehouseAmount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="应扣金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-xl">¥{{ record.deductAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="扣款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'deducted' ? 'green' : 'orange'">
                {{ record.status === 'deducted' ? '已扣款' : '待扣款' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: [] as string[],
})

const recordList = ref([
  {
    id: '1',
    deductionNo: 'YK202401220001',
    orderNo: 'SO202401220001',
    constructionParty: '中建三局深圳分公司',
    orderAmount: 128600,
    paidAmount: 127314,
    warehouseAmount: 127314,
    deductAmount: 1286,
    status: 'deducted',
    createTime: '2024-01-22 16:30:00',
  },
  {
    id: '2',
    deductionNo: 'YK202401210001',
    orderNo: 'SO202401210002',
    constructionParty: '中建三局深圳分公司',
    orderAmount: 86500,
    paidAmount: 85635,
    warehouseAmount: 85635,
    deductAmount: 865,
    status: 'deducted',
    createTime: '2024-01-21 14:20:00',
  },
  {
    id: '3',
    deductionNo: 'YK202401200001',
    orderNo: 'SO202401200003',
    constructionParty: '中铁建设集团',
    orderAmount: 50000,
    paidAmount: 49500,
    warehouseAmount: 49500,
    deductAmount: 500,
    status: 'pending',
    createTime: '2024-01-20 10:00:00',
  },
  {
    id: '4',
    deductionNo: 'YK202401190001',
    orderNo: 'SO202401190001',
    constructionParty: '中铁建设集团',
    orderAmount: 35000,
    paidAmount: 34650,
    warehouseAmount: 34650,
    deductAmount: 350,
    status: 'pending',
    createTime: '2024-01-19 09:00:00',
  },
  {
    id: '5',
    deductionNo: 'YK202401180001',
    orderNo: 'SO202401180001',
    constructionParty: '中交一航局',
    orderAmount: 200000,
    paidAmount: 198000,
    warehouseAmount: 198000,
    deductAmount: 2000,
    status: 'deducted',
    createTime: '2024-01-18 15:45:00',
  },
])

const filteredRecordList = computed(() => {
  let result = recordList.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r => 
      r.deductionNo.toLowerCase().includes(keyword) ||
      r.orderNo.toLowerCase().includes(keyword) ||
      r.constructionParty.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.status) {
    result = result.filter(r => r.status === searchForm.status)
  }

  return result
})

const totalCount = computed(() => filteredRecordList.value.length)

const totalDeductAmount = computed(() => 
  filteredRecordList.value.reduce((sum, r) => sum + r.deductAmount, 0)
)

const deductedAmount = computed(() => 
  filteredRecordList.value
    .filter(r => r.status === 'deducted')
    .reduce((sum, r) => sum + r.deductAmount, 0)
)

const pendingAmount = computed(() => 
  filteredRecordList.value
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.deductAmount, 0)
)

onMounted(() => {
  pagination.total = filteredRecordList.value.length
})

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredRecordList.value.length
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  router.push({
    name: 'WarehouseDeductionDetail',
    params: { id: record.id }
  })
}
</script>

<style lang="less" scoped>
.deduction-page {
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

.text-xl {
  font-size: 18px;
  font-weight: 600;
}

.paid-amount {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}
</style>