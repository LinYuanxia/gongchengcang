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
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索应收编号/关联订单号/工程仓/施工方"
            style="width: 280px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.splitStatus" placeholder="分账状态" style="width: 120px" allow-clear>
            <a-option value="pending">待分账</a-option>
            <a-option value="completed">已分账</a-option>
          </a-select>
          <a-select v-model="searchForm.deductStatus" placeholder="划扣状态" style="width: 120px" allow-clear>
            <a-option value="pending">待划扣</a-option>
            <a-option value="processing">划扣中</a-option>
            <a-option value="success">划扣成功</a-option>
            <a-option value="failed">划扣失败</a-option>
          </a-select>
          <a-select v-model="searchForm.accountingStatus" placeholder="记账状态" style="width: 120px" allow-clear>
            <a-option value="unrecorded">未记账</a-option>
            <a-option value="recorded">已记账</a-option>
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
          <a-table-column title="所属工程仓" data-index="warehouseName" :width="180" />
          <a-table-column title="施工方名称" data-index="builderName" :width="180" />
          <a-table-column title="应收类型" :width="120">
            <template #cell="{ record }">
              <a-tag color="blue">交易撮合费</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="130" align="right">
            <template #cell="{ record }">
              <div>
                <div>¥{{ record.transactionAmount?.toLocaleString() }}</div>
                <div class="paid-amount">实付 ¥{{ record.paidAmount?.toLocaleString() }}</div>
              </div>
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
          <a-table-column title="划扣状态" :width="200">
            <template #cell="{ record }">
              <div>
                <a-tag :color="getDeductStatusColor(record.deductStatus)">
                  {{ getDeductStatusText(record.deductStatus) }}
                </a-tag>
                <div v-if="record.deductStatus === 'failed'" class="fail-reason">
                  <span class="reason-text">{{ record.deductFailReason }}</span>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="handleRetryDeduct(record)"
                    class="retry-btn"
                  >
                    重试划扣
                  </a-button>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="记账状态" :width="150">
            <template #cell="{ record }">
              <div v-if="record.accountingStatus === 'recorded'">
                <a-tag color="green">已记账</a-tag>
                <div class="accounting-no">{{ record.accountingNo }}</div>
              </div>
              <a-tag v-else color="gray">未记账</a-tag>
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
        <a-descriptions-item label="所属工程仓">{{ currentRecord?.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="施工方名称">{{ currentRecord?.builderName }}</a-descriptions-item>
        <a-descriptions-item label="分账状态">
          <a-tag v-if="currentRecord?.splitStatus === 'completed'" color="green">已完成分账</a-tag>
          <a-tag v-else color="gray">待分账</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="划扣状态">
          <div>
            <a-tag :color="getDeductStatusColor(currentRecord?.deductStatus)">
              {{ getDeductStatusText(currentRecord?.deductStatus) }}
            </a-tag>
            <div v-if="currentRecord?.deductStatus === 'failed'" class="fail-reason-detail">
              <span>失败原因：{{ currentRecord?.deductFailReason }}</span>
              <a-button type="primary" size="small" @click="handleRetryDeduct(currentRecord)">
                重试划扣
              </a-button>
            </div>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="记账状态">
          <div v-if="currentRecord?.accountingStatus === 'recorded'">
            <a-tag color="green">已记账</a-tag>
            <div class="accounting-no-detail">{{ currentRecord?.accountingNo }}</div>
          </div>
          <a-tag v-else color="gray">未记账</a-tag>
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

      </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const prdItems = [
  {
    title: '1. 项目背景',
    content: `
**业务痛点：**
- 平台服务费应收无统一台账，与分账记录、结算记录割裂
- 资金流向不透明，商户对账困难
- 逾期应收无预警，坏账风险高

**解决目标：**
- 建立应收服务费全生命周期台账
- 清晰展示资金流向：订单 → 应收 → 分账 → 结算
- 自动逾期监控，降低坏账风险

**模块定位：**
- 平台服务费债权的记账凭证
- 连接订单与财务结算的枢纽
- 商户收入对账的核心依据
    `
  }
]

interface ReceivableRecord {
  id: string
  receivableNo: string
  orderNo: string
  splitNo: string
  splitStatus: 'pending' | 'completed'
  deductStatus: 'pending' | 'processing' | 'success' | 'failed'
  deductFailReason?: string
  accountingStatus: 'unrecorded' | 'recorded'
  accountingNo?: string
  paidAmount: number
  splitAmount: number
  warehouseName: string
  builderName: string
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
  splitStatus: undefined as string | undefined,
  deductStatus: undefined as string | undefined,
  accountingStatus: undefined as string | undefined,
  dateRange: [] as string[],
})

const allRecordList = ref<ReceivableRecord[]>([
  {
    id: '1',
    receivableNo: 'YS202401150001',
    orderNo: 'SO202401150001',
    splitNo: 'SP202401150001',
    splitStatus: 'completed',
    deductStatus: 'success',
    accountingStatus: 'recorded',
    accountingNo: 'JZ202401150001',
    paidAmount: 125800,
    splitAmount: 6290,
    warehouseName: '深圳湾科技园项目仓',
    builderName: '中建三局集团有限公司',
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
    deductStatus: 'success',
    accountingStatus: 'recorded',
    accountingNo: 'JZ202401150002',
    paidAmount: 89500,
    splitAmount: 4475,
    warehouseName: '广州天河工程仓',
    builderName: '广州建筑集团有限公司',
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
    deductStatus: 'processing',
    accountingStatus: 'unrecorded',
    paidAmount: 52300,
    splitAmount: 2615,
    warehouseName: '深圳湾科技园项目仓',
    builderName: '中国建筑第八工程局',
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
    deductStatus: 'pending',
    accountingStatus: 'unrecorded',
    paidAmount: 168000,
    splitAmount: 8400,
    warehouseName: '深圳湾科技园项目仓',
    builderName: '深圳市建工集团股份有限公司',
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
    deductStatus: 'failed',
    deductFailReason: '商户虚拟账户余额不足',
    accountingStatus: 'unrecorded',
    paidAmount: 91200,
    splitAmount: 4560,
    warehouseName: '广州天河工程仓',
    builderName: '广东华隧建设集团',
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
    deductStatus: 'pending',
    accountingStatus: 'unrecorded',
    paidAmount: 75600,
    splitAmount: 2268,
    warehouseName: '东莞松山湖工程仓',
    builderName: '东莞市建安集团有限公司',
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
      item.warehouseName.includes(searchForm.keyword) ||
      item.builderName.includes(searchForm.keyword)
    )
  }

  if (searchForm.splitStatus) {
    filtered = filtered.filter(item => item.splitStatus === searchForm.splitStatus)
  }

  if (searchForm.deductStatus) {
    filtered = filtered.filter(item => item.deductStatus === searchForm.deductStatus)
  }

  if (searchForm.accountingStatus) {
    filtered = filtered.filter(item => item.accountingStatus === searchForm.accountingStatus)
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

function getDeductStatusColor(status: string | undefined) {
  if (!status) return 'gray'
  const colorMap: Record<string, string> = {
    pending: 'gray',
    processing: 'orange',
    success: 'green',
    failed: 'red',
  }
  return colorMap[status] || 'gray'
}

function getDeductStatusText(status: string | undefined) {
  if (!status) return '-'
  const textMap: Record<string, string> = {
    pending: '待划扣',
    processing: '划扣中',
    success: '划扣成功',
    failed: '划扣失败',
  }
  return textMap[status] || status
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.splitStatus = undefined
  searchForm.deductStatus = undefined
  searchForm.accountingStatus = undefined
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

function handleRetryDeduct(record: ReceivableRecord) {
  record.deductStatus = 'processing'
  setTimeout(() => {
    const success = Math.random() > 0.3
    if (success) {
      record.deductStatus = 'success'
      record.deductFailReason = undefined
      Message.success('划扣重试成功')
    } else {
      record.deductStatus = 'failed'
      record.deductFailReason = '商户虚拟账户余额不足'
      Message.error('划扣重试失败')
    }
  }, 1500)
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

.fund-flow-desc {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 12px 16px;
  line-height: 1.8;
  
  p {
    margin: 4px 0 0 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
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

.fail-reason {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 4px 8px;
  background: #fff2f0;
  border-radius: 4px;
  width: fit-content;
  
  .reason-text {
    font-size: 12px;
    color: #f53f3f;
  }
  
  .retry-btn {
    color: #165dff;
    font-size: 12px;
    padding: 0;
    height: auto;
  }
}

.fail-reason-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff2f0;
  border-radius: 4px;
  
  span {
    font-size: 12px;
    color: #f53f3f;
  }
}

.paid-amount {
  font-size: 12px;
  color: #165dff;
}

.accounting-no {
  font-size: 12px;
  color: #165dff;
  margin-top: 2px;
}

.accounting-no-detail {
  font-size: 12px;
  color: #165dff;
  margin-top: 4px;
}
</style>
