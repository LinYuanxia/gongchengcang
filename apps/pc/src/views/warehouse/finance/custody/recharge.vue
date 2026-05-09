<template>
  <div class="recharge-record">
    <div class="page-header">
      <a-button type="text" @click="goBack">
        <template #icon><icon-left /></template>
        返回账户概览
      </a-button>
      <h3>充值记录</h3>
    </div>
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleRechargeGuide">
          <template #icon><icon-file-text /></template>
          查看充值指南
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

    <a-modal v-model:visible="rechargeGuideVisible" title="充值指南" :width="600">
      <div class="recharge-guide">
        <a-alert type="info" style="margin-bottom: 16px">
          <template #content>
            <div><strong>重要提示：</strong>转账时请务必在备注中填写台账编码</div>
          </template>
        </a-alert>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="收款账户名称">深圳湾科技园项目仓</a-descriptions-item>
          <a-descriptions-item label="开户银行">中信银行深圳南山支行</a-descriptions-item>
          <a-descriptions-item label="银行账号">7559 2188 0001 2345</a-descriptions-item>
          <a-descriptions-item label="联行号">3025 8400 1234</a-descriptions-item>
          <a-descriptions-item label="转账备注（必填）">LEDGER-2024-00856</a-descriptions-item>
          <a-descriptions-item label="到账时间">工作日 9:00-17:00 转账，预计2小时内到账</a-descriptions-item>
        </a-descriptions>
        <div class="guide-tip">
          <icon-info-circle /> 转账完成后，系统将自动识别到账金额，无需手动确认
        </div>
      </div>
      <template #footer>
        <a-button @click="rechargeGuideVisible = false">我知道了</a-button>
      </template>
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
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

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

const allRechargeList = ref([
  { id: '1', rechargeNo: 'RC202401150001', amount: '100,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', arrivalTime: '2024-01-15 14:30:00', status: 'success', remark: '' },
  { id: '2', rechargeNo: 'RC202401140001', amount: '50,000.00', method: 'online', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-14 15:20:00', arrivalTime: '2024-01-14 15:25:00', status: 'success', remark: '' },
  { id: '3', rechargeNo: 'RC202401130001', amount: '80,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-13 09:00:00', arrivalTime: '', status: 'pending', remark: '紧急充值' },
  { id: '4', rechargeNo: 'RC202401120001', amount: '30,000.00', method: 'online', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-12 16:00:00', arrivalTime: '2024-01-12 16:05:00', status: 'success', remark: '' },
  { id: '5', rechargeNo: 'RC202401110001', amount: '25,000.00', method: 'bank', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-11 11:30:00', arrivalTime: '', status: 'failed', remark: '' },
])

const rechargeList = ref([...allRechargeList.value])

const rechargeGuideVisible = ref(false)
const detailVisible = ref(false)
const currentRecord = ref<any>(null)

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

function goBack() {
  router.push('/warehouse/finance/custody')
}

function handleSearch() {
  let filtered = [...allRechargeList.value]
  
  if (searchForm.value.rechargeNo) {
    filtered = filtered.filter(item => 
      item.rechargeNo.includes(searchForm.value.rechargeNo)
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

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleRechargeGuide() {
  rechargeGuideVisible.value = true
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

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.stat-row {
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
  color: #00b42a;
}

.recharge-guide {
  .guide-tip {
    margin-top: 16px;
    padding: 12px;
    background: #e6fffb;
    border: 1px solid #87e8de;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #006a6a;
  }
}
</style>
