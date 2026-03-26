<template>
  <div class="settlement-list">
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
          <a-statistic title="待审核结算" :value="8" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="待审核金额" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月已结算" :value="1256800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月结算笔数" :value="28" suffix="笔" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="结算单号">
          <a-input v-model="searchForm.settlementNo" placeholder="请输入结算单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="商户名称">
          <a-select v-model="searchForm.merchantId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
            <a-option value="s1">华润建材供应商</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="结算状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已通过</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="success">已到账</a-option>
            <a-option value="rejected">已驳回</a-option>
            <a-option value="failed">已失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="settlementList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="结算单号" data-index="settlementNo" :width="180" />
          <a-table-column title="商户名称" data-index="merchantName" :width="150" />
          <a-table-column title="商户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.merchantType === 'warehouse' ? 'blue' : 'green'">
                {{ record.merchantType === 'warehouse' ? '工程仓' : '供应商' }}
              </a-tag>
            </template>
          </a-table-column>
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
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button v-if="record.status === 'pending'" type="text" size="small" status="success" @click="handleAudit(record)">审核</a-button>
              </a-space>
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
  merchantId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

interface SettlementRecord {
  id: string
  settlementNo: string
  merchantName: string
  merchantType: string
  amount: string
  bankName: string
  bankCard: string
  applyTime: string
  status: string
  arrivalTime: string
}

const allSettlementList = ref<SettlementRecord[]>([
  { id: '1', settlementNo: 'JS202401150001', merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', amount: '50,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', status: 'pending', arrivalTime: '' },
  { id: '2', settlementNo: 'JS202401140001', merchantName: '广州天河工程仓', merchantType: 'warehouse', amount: '35,000.00', bankName: '中国建设银行', bankCard: '****5678', applyTime: '2024-01-14 16:20:00', status: 'approved', arrivalTime: '' },
  { id: '3', settlementNo: 'JS202401130001', merchantName: '华润建材供应商', merchantType: 'supplier', amount: '128,500.00', bankName: '中国农业银行', bankCard: '****1234', applyTime: '2024-01-13 09:15:00', status: 'success', arrivalTime: '2024-01-14 10:00:00' },
  { id: '4', settlementNo: 'JS202401120001', merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', amount: '85,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-12 14:00:00', status: 'rejected', arrivalTime: '' },
  { id: '5', settlementNo: 'JS202401110001', merchantName: '广州天河工程仓', merchantType: 'warehouse', amount: '60,000.00', bankName: '中国建设银行', bankCard: '****5678', applyTime: '2024-01-11 11:30:00', status: 'success', arrivalTime: '2024-01-12 15:00:00' },
])

const settlementList = ref<SettlementRecord[]>([...allSettlementList.value])

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'blue',
    processing: 'cyan',
    success: 'green',
    rejected: 'red',
    failed: 'red',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    processing: '处理中',
    success: '已到账',
    rejected: '已驳回',
    failed: '已失败',
  }
  return textMap[status] || status
}

function handleSearch() {
  let filtered = [...allSettlementList.value]
  
  if (searchForm.value.settlementNo) {
    filtered = filtered.filter(item => 
      item.settlementNo.includes(searchForm.value.settlementNo)
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
      const itemDate = new Date(item.applyTime.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  settlementList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    settlementNo: '',
    merchantId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewDetail(record: SettlementRecord) {
  router.push(`/finance/settlement/detail/${record.id}`)
}

function handleAudit(record: SettlementRecord) {
  router.push(`/finance/settlement/audit?id=${record.id}`)
}

function handleExport() {
  if (settlementList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${settlementList.value.length} 条结算记录`)
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
