<template>
  <div class="page-container">
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日应收金额" :value="15680" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="本月应收金额" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="历史应收金额" :value="1256800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="应收总笔数" :value="156">
            <template #suffix>笔</template>
          </a-statistic>
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
            placeholder="搜索应收编号/关联订单号/商户名称"
            style="width: 280px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.merchantType" placeholder="商户类型" style="width: 140px" allow-clear>
            <a-option value="warehouse">工程仓</a-option>
            <a-option value="supplier">供应商</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
          <a-button type="primary" @click="handleExport">导出</a-button>
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
          <a-table-column title="商户名称" data-index="merchantName" :width="180" />
          <a-table-column title="交易金额" :width="130" align="right">
            <template #cell="{ record }">
              ¥{{ record.transactionAmount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="工程仓收入" :width="130" align="right">
            <template #cell="{ record }">
              ¥{{ record.warehouseIncome?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="平台应收" :width="130" align="right">
            <template #cell="{ record }">
              <span class="highlight">¥{{ record.serviceAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分账状态" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.splitStatus === 'completed'" color="green">已分账</a-tag>
              <a-tag v-else color="gray">待分账</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="产生时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" title="应收服务费详情" :width="800" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="应收编号">{{ currentRecord?.receivableNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentRecord?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="交易金额">¥{{ currentRecord?.transactionAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="工程仓收入">
          ¥{{ currentRecord?.warehouseIncome?.toLocaleString() }}
        </a-descriptions-item>
        <a-descriptions-item label="平台应收服务费">
          <span class="highlight">¥{{ currentRecord?.serviceAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="商户名称">{{ currentRecord?.merchantName }}</a-descriptions-item>
        <a-descriptions-item label="分账状态">
          <a-tag v-if="currentRecord?.splitStatus === 'completed'" color="green">已完成分账</a-tag>
          <a-tag v-else color="gray">待分账</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="关联分账单号">
          <a-link v-if="currentRecord?.splitNo" class="split-link" @click="handleViewSplit(currentRecord)">{{ currentRecord?.splitNo }}</a-link>
          <span v-else class="text-desc">-</span>
        </a-descriptions-item>
        <a-descriptions-item label="产生时间" :span="2">{{ currentRecord?.createTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>商品分账比例明细</a-divider>

      <a-table :data="currentRecord?.products || []" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="商品名称" data-index="name" :width="200" />
          <a-table-column title="商品金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="服务费比例" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.rate }}%
            </template>
          </a-table-column>
          <a-table-column title="服务费金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ ((record.amount || 0) * record.rate / 100).toLocaleString() }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>资金流向说明</a-divider>

      <a-alert type="info">
        <template #message>
          <div class="alert-desc">
            <p><strong>应收服务费</strong>为平台向商户收取的交易佣金，按照订单交易金额的一定比例计算。</p>
            <p style="margin: 4px 0 0 0;">• 当订单创建后，系统自动生成<strong>应收服务费记录</strong>（债权凭证）</p>
            <p style="margin: 4px 0 0 0;">• 当订单完成后，执行实际分账，生成<strong>分账记录</strong>（资金清算凭证）</p>
            <p style="margin: 4px 0 0 0;">• 商户完成结算后，应收状态变更为「已收」</p>
          </div>
        </template>
      </a-alert>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

interface ReceivableRecord {
  id: string
  receivableNo: string
  orderNo: string
  splitNo: string
  splitStatus: 'pending' | 'completed'
  merchantName: string
  merchantType: string
  transactionAmount: number
  warehouseIncome: number
  serviceRate: number
  serviceAmount: number
  status: string
  products: { name: string; amount: number; rate: number }[]
  createTime: string
}

const loading = ref(false)
const activeTab = ref('all')
const detailVisible = ref(false)
const currentRecord = ref<ReceivableRecord | null>(null)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  merchantType: undefined as string | undefined,
  dateRange: [] as string[],
})

const allRecordList = ref<ReceivableRecord[]>([
  {
    id: '1',
    receivableNo: 'YS202401150001',
    orderNo: 'SO202401150001',
    splitNo: 'SP202401150001',
    splitStatus: 'completed',
    merchantName: '深圳湾科技园项目仓',
    merchantType: 'warehouse',
    transactionAmount: 125800,
    warehouseIncome: 119510,
    serviceRate: 5,
    serviceAmount: 6290,
    status: 'received',
    products: [{ name: '钢筋 HRB400', amount: 50000, rate: 5 }, { name: '水泥 P.O 42.5', amount: 40800, rate: 5 }, { name: '沙子', amount: 35000, rate: 5 }],
    createTime: '2024-01-15 16:30:00',
  },
  {
    id: '2',
    receivableNo: 'YS202401150002',
    orderNo: 'SO202401140001',
    splitNo: 'SP202401150002',
    splitStatus: 'completed',
    merchantName: '广州天河工程仓',
    merchantType: 'warehouse',
    transactionAmount: 89500,
    warehouseIncome: 85025,
    serviceRate: 5,
    serviceAmount: 4475,
    status: 'received',
    products: [{ name: '模板', amount: 49500, rate: 5 }, { name: '木方', amount: 40000, rate: 5 }],
    createTime: '2024-01-15 14:20:00',
  },
  {
    id: '3',
    receivableNo: 'YS202401140001',
    orderNo: 'SO202401130001',
    splitNo: 'SP202401140001',
    splitStatus: 'completed',
    merchantName: '深圳湾科技园项目仓',
    merchantType: 'warehouse',
    transactionAmount: 52300,
    warehouseIncome: 49685,
    serviceRate: 5,
    serviceAmount: 2615,
    status: 'pending',
    products: [{ name: '防水涂料', amount: 12300, rate: 5 }, { name: '防水卷材', amount: 20000, rate: 5 }, { name: '密封胶', amount: 10000, rate: 5 }, { name: '保温材料', amount: 10000, rate: 5 }],
    createTime: '2024-01-14 10:00:00',
  },
  {
    id: '4',
    receivableNo: 'YS202401130001',
    orderNo: 'SO202401120001',
    splitNo: 'SP202401130001',
    splitStatus: 'completed',
    merchantName: '深圳湾科技园项目仓',
    merchantType: 'warehouse',
    transactionAmount: 168000,
    warehouseIncome: 159600,
    serviceRate: 5,
    serviceAmount: 8400,
    status: 'pending',
    products: [{ name: '电线电缆 BV', amount: 50000, rate: 5 }, { name: '开关插座', amount: 18000, rate: 5 }, { name: '配电箱', amount: 30000, rate: 5 }, { name: '灯具', amount: 40000, rate: 5 }, { name: '弱电设备', amount: 30000, rate: 5 }],
    createTime: '2024-01-13 15:30:00',
  },
  {
    id: '5',
    receivableNo: 'YS202401120001',
    orderNo: 'SO202401110001',
    splitNo: 'SP202401120001',
    splitStatus: 'completed',
    merchantName: '广州天河工程仓',
    merchantType: 'warehouse',
    transactionAmount: 91200,
    warehouseIncome: 86640,
    serviceRate: 5,
    serviceAmount: 4560,
    status: 'overdue',
    products: [{ name: 'PPR水管', amount: 51200, rate: 5 }, { name: 'PVC排水管', amount: 40000, rate: 5 }],
    createTime: '2024-01-12 09:00:00',
  },
  {
    id: '6',
    receivableNo: 'YS202401110001',
    orderNo: 'SO202401100001',
    splitNo: '',
    splitStatus: 'pending',
    merchantName: '优质建材供应商',
    merchantType: 'supplier',
    transactionAmount: 75600,
    warehouseIncome: 73332,
    serviceRate: 3,
    serviceAmount: 2268,
    status: 'void',
    products: [{ name: '瓷砖', amount: 45600, rate: 3 }, { name: '卫浴洁具', amount: 30000, rate: 3 }],
    createTime: '2024-01-11 11:30:00',
  },
])

const filteredRecordList = computed(() => {
  let filtered = [...allRecordList.value]

  if (activeTab.value !== 'all') {
    filtered = filtered.filter(item => item.status === activeTab.value)
  }

  if (searchForm.keyword) {
    filtered = filtered.filter(item =>
      item.receivableNo.includes(searchForm.keyword) ||
      item.orderNo.includes(searchForm.keyword) ||
      item.merchantName.includes(searchForm.keyword)
    )
  }

  if (searchForm.merchantType) {
    filtered = filtered.filter(item => item.merchantType === searchForm.merchantType)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createTime.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }

  pagination.total = filtered.length
  return filtered.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )
})

function getReceiveStatusColor(status: string | undefined) {
  if (!status) return 'gray'
  const colorMap: Record<string, string> = {
    pending: 'orange',
    received: 'green',
    void: 'gray',
    overdue: 'red',
  }
  return colorMap[status] || 'gray'
}

function getReceiveStatusText(status: string | undefined) {
  if (!status) return '-'
  const textMap: Record<string, string> = {
    pending: '待收',
    received: '已收',
    void: '已作废',
    overdue: '已逾期',
  }
  return textMap[status] || status
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.merchantType = undefined
  searchForm.dateRange = []
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: ReceivableRecord) {
  currentRecord.value = record
  detailVisible.value = true
}

function handleViewSplit(record: ReceivableRecord | null) {
  if (!record || !record.splitNo) return
  Message.info(`跳转到分账记录: ${record.splitNo}`)
}

function handleExport() {
  if (filteredRecordList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success('导出成功')
}
</script>

<style scoped lang="less">
.stat-row {
  margin-bottom: 16px;

  :deep(.ant-card) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.ant-statistic-title) {
    font-size: 14px;
    color: var(--color-text-2);
  }

  :deep(.ant-statistic-content) {
    font-size: 24px;
    font-weight: 600;
  }
}

.record-tabs {
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.highlight {
  color: #165dff;
  font-weight: 600;
}

.amount {
  color: #f53f3f;
  font-weight: 500;
}

.alert-desc {
  line-height: 1.6;
}

.text-desc {
  color: var(--color-text-3);
}

.split-link,
.receivable-link {
  color: #165dff;
  cursor: pointer;
}
</style>
