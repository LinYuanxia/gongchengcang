<template>
  <div class="settlement-list">
    <a-card>
      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="可结算金额" :value="128500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="结算中金额" :value="35000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月已结算" :value="256800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" size="large" @click="handleApplySettlement">
            <template #icon><icon-plus /></template>
            申请结算
          </a-button>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="结算单号">
          <a-input v-model="searchForm.settlementNo" placeholder="请输入结算单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="结算状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待审核</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="success">已到账</a-option>
            <a-option value="failed">已失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="settlementList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="结算单号" data-index="settlementNo" :width="180" />
          <a-table-column title="结算金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="结算银行" :width="200">
            <template #cell="{ record }">
              {{ record.bankName }} ({{ record.bankCard }})
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="180" />
          <a-table-column title="结算状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="到账时间" data-index="arrivalTime" :width="180">
            <template #cell="{ record }">
              {{ record.arrivalTime || '-' }}
            </template>
          </a-table-column>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchForm = ref({
  settlementNo: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const settlementList = ref([
  { id: '1', settlementNo: 'JS202401150001', amount: '50,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', status: 'success', arrivalTime: '2024-01-16 14:30:00' },
  { id: '2', settlementNo: 'JS202401140001', amount: '35,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-14 16:20:00', status: 'processing', arrivalTime: '' },
  { id: '3', settlementNo: 'JS202401130001', amount: '28,500.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-13 09:15:00', status: 'pending', arrivalTime: '' },
  { id: '4', settlementNo: 'JS202401120001', amount: '43,200.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-12 14:00:00', status: 'failed', arrivalTime: '' },
  { id: '5', settlementNo: 'JS202401110001', amount: '65,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-11 11:30:00', status: 'success', arrivalTime: '2024-01-12 10:00:00' },
])

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    success: 'green',
    failed: 'red',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待审核',
    processing: '处理中',
    success: '已到账',
    failed: '已失败',
  }
  return textMap[status] || status
}

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleApplySettlement() {
  router.push('/supplier/finance/settlement/apply')
}

function handleViewDetail(record: any) {
  router.push(`/supplier/finance/settlement/detail/${record.id}`)
}
</script>

<style scoped lang="less">
.settlement-list {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-row {
  padding: 16px;
  background: linear-gradient(135deg, #e8f3ff 0%, #f2f9ff 100%);
  border-radius: 8px;
}

.search-form {
  margin-bottom: 0;
}

.amount {
  font-weight: 600;
  color: #165dff;
}
</style>
