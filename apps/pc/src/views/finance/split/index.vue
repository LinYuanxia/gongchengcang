<template>
  <div class="split-list">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="今日分账金额" :value="15680" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月分账金额" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待分账金额" :value="42500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="分账失败" :value="3">
            <template #suffix>笔</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="分账单号">
          <a-input v-model="searchForm.splitNo" placeholder="请输入分账单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="商户名称">
          <a-select v-model="searchForm.merchantId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
            <a-option value="s1">华润建材供应商</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分账状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待分账</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="success">已分账</a-option>
            <a-option value="failed">分账失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分账时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="splitList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="分账单号" data-index="splitNo" :width="180" />
          <a-table-column title="关联订单" data-index="orderNo" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="120" align="right">
            <template #cell="{ record }">
              <span>¥{{ record.transactionAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.splitAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分账比例" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.splitRate }}%
            </template>
          </a-table-column>
          <a-table-column title="商户名称" data-index="merchantName" :width="150" />
          <a-table-column title="商户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.merchantType === 'warehouse' ? 'blue' : 'green'">
                {{ record.merchantType === 'warehouse' ? '工程仓' : '供应商' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分账状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分账时间" data-index="splitTime" :width="180" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button v-if="record.status === 'failed'" type="text" size="small" status="warning" @click="handleRetry(record)">重试</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" title="分账详情" :width="700" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="分账单号">{{ currentSplit?.splitNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentSplit?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="交易金额">¥{{ currentSplit?.transactionAmount }}</a-descriptions-item>
        <a-descriptions-item label="分账金额">
          <span class="highlight">¥{{ currentSplit?.splitAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="分账比例">{{ currentSplit?.splitRate }}%</a-descriptions-item>
        <a-descriptions-item label="商户名称">{{ currentSplit?.merchantName }}</a-descriptions-item>
        <a-descriptions-item label="商户类型">
          <a-tag :color="currentSplit?.merchantType === 'warehouse' ? 'blue' : 'green'">
            {{ currentSplit?.merchantType === 'warehouse' ? '工程仓' : '供应商' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分账状态">
          <a-tag :color="getStatusColor(currentSplit?.status)">
            {{ getStatusText(currentSplit?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分账时间" :span="2">{{ currentSplit?.splitTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>分账明细</a-divider>

      <a-table :data="splitDetail" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="收款方" data-index="receiverName" :width="150" />
          <a-table-column title="收款方类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.receiverType === 'platform' ? 'purple' : 'arcoblue'">
                {{ record.receiverType === 'platform' ? '平台' : '商户' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分账比例" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.rate }}%
            </template>
          </a-table-column>
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'success' ? 'green' : 'red'">
                {{ record.status === 'success' ? '成功' : '失败' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  splitNo: '',
  merchantId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

interface SplitRecord {
  id: string
  splitNo: string
  orderNo: string
  transactionAmount: string
  splitAmount: string
  splitRate: number
  merchantName: string
  merchantType: string
  status: string
  splitTime: string
}

const allSplitList = ref<SplitRecord[]>([
  { id: '1', splitNo: 'SP202401150001', orderNo: 'SO202401150001', transactionAmount: '125,800.00', splitAmount: '6,290.00', splitRate: 5, merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', status: 'success', splitTime: '2024-01-15 16:30:00' },
  { id: '2', splitNo: 'SP202401150002', orderNo: 'SO202401140001', transactionAmount: '89,500.00', splitAmount: '4,475.00', splitRate: 5, merchantName: '广州天河工程仓', merchantType: 'warehouse', status: 'success', splitTime: '2024-01-15 14:20:00' },
  { id: '3', splitNo: 'SP202401140001', orderNo: 'SO202401130001', transactionAmount: '52,300.00', splitAmount: '2,615.00', splitRate: 5, merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', status: 'pending', splitTime: '2024-01-14 10:00:00' },
  { id: '4', splitNo: 'SP202401130001', orderNo: 'SO202401120001', transactionAmount: '168,000.00', splitAmount: '8,400.00', splitRate: 5, merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', status: 'failed', splitTime: '2024-01-13 15:30:00' },
  { id: '5', splitNo: 'SP202401120001', orderNo: 'SO202401110001', transactionAmount: '91,200.00', splitAmount: '4,560.00', splitRate: 5, merchantName: '广州天河工程仓', merchantType: 'warehouse', status: 'success', splitTime: '2024-01-12 09:00:00' },
])

const splitList = ref<SplitRecord[]>([...allSplitList.value])

const detailVisible = ref(false)
const currentSplit = ref<SplitRecord | null>(null)

const splitDetail = ref([
  { receiverName: '平台服务费', receiverType: 'platform', rate: 5, amount: '6,290.00', status: 'success' },
  { receiverName: '深圳湾科技园项目仓', receiverType: 'merchant', rate: 95, amount: '119,510.00', status: 'success' },
])

function getStatusColor(status: string | undefined) {
  if (!status) return 'gray'
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    success: 'green',
    failed: 'red',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string | undefined) {
  if (!status) return '-'
  const textMap: Record<string, string> = {
    pending: '待分账',
    processing: '处理中',
    success: '已分账',
    failed: '分账失败',
  }
  return textMap[status] || status
}

function handleSearch() {
  let filtered = [...allSplitList.value]
  
  if (searchForm.value.splitNo) {
    filtered = filtered.filter(item => 
      item.splitNo.includes(searchForm.value.splitNo) ||
      item.orderNo.includes(searchForm.value.splitNo)
    )
  }
  
  if (searchForm.value.merchantId) {
    filtered = filtered.filter(item => 
      item.merchantName.includes(searchForm.value.merchantId)
    )
  }
  
  if (searchForm.value.status) {
    filtered = filtered.filter(item => item.status === searchForm.value.status)
  }
  
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.value.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.splitTime.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  splitList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    splitNo: '',
    merchantId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewOrder(record: SplitRecord) {
  Message.info(`查看订单: ${record.orderNo}`)
}

function handleViewDetail(record: SplitRecord) {
  currentSplit.value = record
  detailVisible.value = true
}

function handleRetry(record: SplitRecord) {
  Message.success(`分账单 ${record.splitNo} 已重新提交`)
}

function handleExport() {
  if (splitList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${splitList.value.length} 条分账记录`)
}
</script>

<style scoped lang="less">
.split-list {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-row {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.amount {
  font-weight: 600;
  color: #165dff;
}

.highlight {
  color: #165dff;
  font-weight: 600;
  font-size: 16px;
}
</style>
