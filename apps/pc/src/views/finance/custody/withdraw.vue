<template>
  <div class="custody-withdraw">
    <a-card>
      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="今日提现" :value="52000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月提现" :value="856000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待审核" :value="8" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="处理中" :value="3" suffix="笔" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="提现单号">
          <a-input v-model="searchForm.withdrawNo" placeholder="请输入提现单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="商户类型">
          <a-select v-model="searchForm.merchantType" placeholder="全部" allow-clear style="width: 140px">
            <a-option value="warehouse">工程仓</a-option>
            <a-option value="supplier">供应商</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="商户名称">
          <a-input v-model="searchForm.merchantName" placeholder="请输入商户名称" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item label="提现银行">
          <a-select v-model="searchForm.bankId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="1">中国工商银行</a-option>
            <a-option value="2">中国建设银行</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待审核</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="success">成功</a-option>
            <a-option value="failed">失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table :data="withdrawList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="提现单号" data-index="withdrawNo" :width="180" />
          <a-table-column title="商户信息" :width="200">
            <template #cell="{ record }">
              <div>
                <div>{{ record.merchantName }}</div>
                <div class="sub-text">{{ record.merchantType === 'warehouse' ? '工程仓' : '供应商' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="提现金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="手续费" :width="90" align="right">
            <template #cell="{ record }">
              ¥{{ record.fee }}
            </template>
          </a-table-column>
          <a-table-column title="到账金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="arrival-amount">¥{{ record.arrivalAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="提现银行" :width="180">
            <template #cell="{ record }">
              {{ record.bankName }} ({{ record.bankCard }})
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="170" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="140" fixed="right">
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

    <a-modal v-model:visible="detailVisible" title="提现详情" :width="650" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="提现单号">{{ currentRecord?.withdrawNo }}</a-descriptions-item>
        <a-descriptions-item label="提现金额">
          <span class="amount">¥{{ currentRecord?.amount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="商户名称">{{ currentRecord?.merchantName }}</a-descriptions-item>
        <a-descriptions-item label="商户类型">{{ currentRecord?.merchantType === 'warehouse' ? '工程仓' : '供应商' }}</a-descriptions-item>
        <a-descriptions-item label="手续费">¥{{ currentRecord?.fee }}</a-descriptions-item>
        <a-descriptions-item label="到账金额">
          <span class="arrival-amount">¥{{ currentRecord?.arrivalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="提现银行" :span="2">{{ currentRecord?.bankName }} ({{ currentRecord?.bankCard }})</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentRecord?.status)">
            {{ getStatusText(currentRecord?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRecord?.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="到账时间" :span="2">{{ currentRecord?.arrivalTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:visible="auditVisible" title="提现审核" :width="500" @ok="handleAuditConfirm">
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="提现单号">
          <span>{{ currentRecord?.withdrawNo }}</span>
        </a-form-item>
        <a-form-item label="提现金额">
          <span class="amount">¥{{ currentRecord?.amount }}</span>
        </a-form-item>
        <a-form-item label="商户信息">
          <span>{{ currentRecord?.merchantName }} ({{ currentRecord?.merchantType === 'warehouse' ? '工程仓' : '供应商' }})</span>
        </a-form-item>
        <a-form-item label="提现银行">
          <span>{{ currentRecord?.bankName }} ({{ currentRecord?.bankCard }})</span>
        </a-form-item>
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="pass">通过</a-radio>
            <a-radio value="reject">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="auditForm.result === 'reject'" label="驳回原因" required>
          <a-textarea v-model="auditForm.reason" placeholder="请输入驳回原因" :max-length="200" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="auditForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  withdrawNo: '',
  merchantType: '',
  merchantName: '',
  bankId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 80,
})

const allWithdrawList = ref([
  { id: '1', withdrawNo: 'WD202401150001', merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', amount: '50,000.00', fee: '50.00', arrivalAmount: '49,950.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', arrivalTime: '2024-01-16 14:30:00', status: 'success', remark: '' },
  { id: '2', withdrawNo: 'WD202401150002', merchantName: '华润建材供应商', merchantType: 'supplier', amount: '30,000.00', fee: '30.00', arrivalAmount: '29,970.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 15:20:00', arrivalTime: '', status: 'processing', remark: '' },
  { id: '3', withdrawNo: 'WD202401150003', merchantName: '福田建材仓库', merchantType: 'warehouse', amount: '25,000.00', fee: '25.00', arrivalAmount: '24,975.00', bankName: '中国建设银行', bankCard: '****5678', applyTime: '2024-01-15 16:00:00', arrivalTime: '', status: 'pending', remark: '' },
  { id: '4', withdrawNo: 'WD202401140001', merchantName: '南山装饰材料仓', merchantType: 'warehouse', amount: '15,000.00', fee: '15.00', arrivalAmount: '14,985.00', bankName: '中国工商银行', bankCard: '****1234', applyTime: '2024-01-14 11:30:00', arrivalTime: '', status: 'pending', remark: '' },
  { id: '5', withdrawNo: 'WD202401140002', merchantName: '东方建材供应商', merchantType: 'supplier', amount: '20,000.00', fee: '20.00', arrivalAmount: '19,980.00', bankName: '中国建设银行', bankCard: '****9012', applyTime: '2024-01-14 09:00:00', arrivalTime: '2024-01-15 10:00:00', status: 'success', remark: '' },
])

const withdrawList = ref([...allWithdrawList.value])

const detailVisible = ref(false)
const auditVisible = ref(false)
const currentRecord = ref<any>(null)

const auditForm = ref({
  result: 'pass',
  reason: '',
  remark: '',
})

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
    success: '成功',
    failed: '失败',
  }
  return textMap[status] || status
}

function handleSearch() {
  let filtered = [...allWithdrawList.value]
  
  if (searchForm.value.withdrawNo) {
    filtered = filtered.filter(item => 
      item.withdrawNo.includes(searchForm.value.withdrawNo)
    )
  }
  
  if (searchForm.value.merchantType) {
    filtered = filtered.filter(item => item.merchantType === searchForm.value.merchantType)
  }
  
  if (searchForm.value.merchantName) {
    filtered = filtered.filter(item => 
      item.merchantName.includes(searchForm.value.merchantName)
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
  
  withdrawList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    withdrawNo: '',
    merchantType: '',
    merchantName: '',
    bankId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewDetail(record: any) {
  currentRecord.value = record
  detailVisible.value = true
}

function handleAudit(record: any) {
  currentRecord.value = record
  auditForm.value = { result: 'pass', reason: '', remark: '' }
  auditVisible.value = true
}

function handleAuditConfirm() {
  if (auditForm.value.result === 'reject' && !auditForm.value.reason) {
    Message.warning('请输入驳回原因')
    return
  }
  Message.success(auditForm.value.result === 'pass' ? '审核通过，资金将在1-3个工作日到账' : '已驳回')
  auditVisible.value = false
}
</script>

<style scoped lang="less">
.custody-withdraw {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-row {
  padding: 16px;
  background: linear-gradient(135deg, #fff7e8 0%, #fffbf2 100%);
  border-radius: 8px;
}

.search-form {
  margin-bottom: 0;
}

.amount {
  font-weight: 600;
  color: #165dff;
}

.arrival-amount {
  font-weight: 600;
  color: #00b42a;
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
