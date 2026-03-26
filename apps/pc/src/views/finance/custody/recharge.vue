<template>
  <div class="custody-recharge">
    <a-card>
      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="今日充值" :value="156800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月充值" :value="2356800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待审核" :value="5" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="充值成功率" :value="99.2" suffix="%" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="充值单号">
          <a-input v-model="searchForm.rechargeNo" placeholder="请输入充值单号" allow-clear style="width: 180px" />
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
        <a-form-item label="充值方式">
          <a-select v-model="searchForm.method" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="bank">银行转账</a-option>
            <a-option value="online">在线支付</a-option>
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
        <a-form-item label="充值时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table :data="rechargeList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="充值单号" data-index="rechargeNo" :width="180" />
          <a-table-column title="商户信息" :width="200">
            <template #cell="{ record }">
              <div>
                <div>{{ record.merchantName }}</div>
                <div class="sub-text">{{ record.merchantType === 'warehouse' ? '工程仓' : '供应商' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="充值金额" :width="140" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="充值方式" :width="100">
            <template #cell="{ record }">
              {{ record.method === 'bank' ? '银行转账' : '在线支付' }}
            </template>
          </a-table-column>
          <a-table-column title="到账账户" :width="200">
            <template #cell="{ record }">
              {{ record.bankName }} ({{ record.bankCard }})
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="170" />
          <a-table-column title="到账时间" :width="170">
            <template #cell="{ record }">
              {{ record.arrivalTime || '-' }}
            </template>
          </a-table-column>
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

    <a-modal v-model:visible="detailVisible" title="充值详情" :width="650" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="充值单号">{{ currentRecord?.rechargeNo }}</a-descriptions-item>
        <a-descriptions-item label="充值金额">
          <span class="amount">¥{{ currentRecord?.amount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="商户名称">{{ currentRecord?.merchantName }}</a-descriptions-item>
        <a-descriptions-item label="商户类型">{{ currentRecord?.merchantType === 'warehouse' ? '工程仓' : '供应商' }}</a-descriptions-item>
        <a-descriptions-item label="充值方式">{{ currentRecord?.method === 'bank' ? '银行转账' : '在线支付' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentRecord?.status)">
            {{ getStatusText(currentRecord?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="到账账户" :span="2">{{ currentRecord?.bankName }} ({{ currentRecord?.bankCard }})</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRecord?.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="到账时间">{{ currentRecord?.arrivalTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:visible="auditVisible" title="充值审核" :width="500" @ok="handleAuditConfirm">
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="充值单号">
          <span>{{ currentRecord?.rechargeNo }}</span>
        </a-form-item>
        <a-form-item label="充值金额">
          <span class="amount">¥{{ currentRecord?.amount }}</span>
        </a-form-item>
        <a-form-item label="商户信息">
          <span>{{ currentRecord?.merchantName }} ({{ currentRecord?.merchantType === 'warehouse' ? '工程仓' : '供应商' }})</span>
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
  rechargeNo: '',
  merchantType: '',
  merchantName: '',
  method: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 100,
})

const allRechargeList = ref([
  { id: '1', rechargeNo: 'RC202401150001', merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', amount: '100,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', arrivalTime: '2024-01-15 14:30:00', status: 'success', remark: '' },
  { id: '2', rechargeNo: 'RC202401150002', merchantName: '华润建材供应商', merchantType: 'supplier', amount: '50,000.00', method: 'online', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 11:20:00', arrivalTime: '2024-01-15 11:25:00', status: 'success', remark: '' },
  { id: '3', rechargeNo: 'RC202401150003', merchantName: '福田建材仓库', merchantType: 'warehouse', amount: '80,000.00', method: 'bank', bankName: '中国建设银行', bankCard: '****5678', applyTime: '2024-01-15 14:00:00', arrivalTime: '', status: 'pending', remark: '紧急充值' },
  { id: '4', rechargeNo: 'RC202401140001', merchantName: '南山装饰材料仓', merchantType: 'warehouse', amount: '30,000.00', method: 'online', bankName: '中国工商银行', bankCard: '****1234', applyTime: '2024-01-14 16:00:00', arrivalTime: '2024-01-14 16:05:00', status: 'success', remark: '' },
  { id: '5', rechargeNo: 'RC202401140002', merchantName: '东方建材供应商', merchantType: 'supplier', amount: '25,000.00', method: 'bank', bankName: '中国建设银行', bankCard: '****9012', applyTime: '2024-01-14 09:30:00', arrivalTime: '', status: 'processing', remark: '' },
])

const rechargeList = ref([...allRechargeList.value])

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
  let filtered = [...allRechargeList.value]
  
  if (searchForm.value.rechargeNo) {
    filtered = filtered.filter(item => 
      item.rechargeNo.includes(searchForm.value.rechargeNo)
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
  
  if (searchForm.value.method) {
    filtered = filtered.filter(item => item.method === searchForm.value.method)
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
  
  rechargeList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    rechargeNo: '',
    merchantType: '',
    merchantName: '',
    method: '',
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
  Message.success(auditForm.value.result === 'pass' ? '审核通过' : '已驳回')
  auditVisible.value = false
}
</script>

<style scoped lang="less">
.custody-recharge {
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

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
