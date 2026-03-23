<template>
  <div class="recharge-record">
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleRecharge">
          <template #icon><icon-plus /></template>
          充值
        </a-button>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月充值" :value="156800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="充值笔数" :value="12" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="待审核" :value="2" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="充值成功率" :value="98.5" suffix="%" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="充值单号">
          <a-input v-model="searchForm.rechargeNo" placeholder="请输入充值单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="充值方式">
          <a-select v-model="searchForm.method" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="bank">银行转账</a-option>
            <a-option value="online">在线支付</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="充值状态">
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
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="rechargeList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="充值单号" data-index="rechargeNo" :width="180" />
          <a-table-column title="充值金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="充值方式" :width="120">
            <template #cell="{ record }">
              {{ record.method === 'bank' ? '银行转账' : '在线支付' }}
            </template>
          </a-table-column>
          <a-table-column title="到账账户" :width="200">
            <template #cell="{ record }">
              {{ record.bankName }} ({{ record.bankCard }})
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="180" />
          <a-table-column title="到账时间" :width="180">
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
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="rechargeVisible" title="账户充值" :width="500" @ok="handleRechargeConfirm">
      <a-form :model="rechargeForm" layout="vertical">
        <a-form-item label="充值金额" required>
          <a-input-number v-model="rechargeForm.amount" :min="1" :precision="2" placeholder="请输入充值金额" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="充值方式">
          <a-radio-group v-model="rechargeForm.method">
            <a-radio value="bank">银行转账</a-radio>
            <a-radio value="online">在线支付</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="rechargeForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="detailVisible" title="充值详情" :width="600" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="充值单号">{{ currentRecord?.rechargeNo }}</a-descriptions-item>
        <a-descriptions-item label="充值金额">
          <span class="amount">¥{{ currentRecord?.amount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="充值方式">{{ currentRecord?.method === 'bank' ? '银行转账' : '在线支付' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentRecord?.status)">
            {{ getStatusText(currentRecord?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="到账账户">{{ currentRecord?.bankName }} ({{ currentRecord?.bankCard }})</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRecord?.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="到账时间">{{ currentRecord?.arrivalTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ currentRecord?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  rechargeNo: '',
  method: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const rechargeList = ref([
  { id: '1', rechargeNo: 'RC202401150001', amount: '100,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', arrivalTime: '2024-01-15 14:30:00', status: 'success', remark: '' },
  { id: '2', rechargeNo: 'RC202401140001', amount: '50,000.00', method: 'online', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-14 15:20:00', arrivalTime: '2024-01-14 15:25:00', status: 'success', remark: '' },
  { id: '3', rechargeNo: 'RC202401130001', amount: '80,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-13 09:00:00', arrivalTime: '', status: 'pending', remark: '紧急充值' },
  { id: '4', rechargeNo: 'RC202401120001', amount: '30,000.00', method: 'online', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-12 16:00:00', arrivalTime: '2024-01-12 16:05:00', status: 'success', remark: '' },
  { id: '5', rechargeNo: 'RC202401110001', amount: '25,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-11 11:30:00', arrivalTime: '', status: 'failed', remark: '' },
])

const rechargeVisible = ref(false)
const detailVisible = ref(false)
const currentRecord = ref<any>(null)

const rechargeForm = ref({
  amount: 0,
  method: 'bank',
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
  Message.info('查询功能开发中')
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleRecharge() {
  rechargeForm.value = { amount: 0, method: 'bank', remark: '' }
  rechargeVisible.value = true
}

function handleRechargeConfirm() {
  if (!rechargeForm.value.amount || rechargeForm.value.amount <= 0) {
    Message.warning('请输入正确的充值金额')
    return
  }
  Message.success('充值申请已提交，请等待审核')
  rechargeVisible.value = false
}

function handleViewDetail(record: any) {
  currentRecord.value = record
  detailVisible.value = true
}
</script>

<style scoped lang="less">
.recharge-record {
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
