<template>
  <div class="withdraw-record">
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleWithdraw">
          <template #icon><icon-export /></template>
          提现
        </a-button>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月提现" :value="52000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="提现笔数" :value="8" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="处理中" :value="2" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="可提现余额" :value="308900" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="提现单号">
          <a-input v-model="searchForm.withdrawNo" placeholder="请输入提现单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="提现银行">
          <a-select v-model="searchForm.bankId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="1">中国工商银行</a-option>
            <a-option value="2">中国建设银行</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提现状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待审核</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="success">成功</a-option>
            <a-option value="failed">失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提现时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="withdrawList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="提现单号" data-index="withdrawNo" :width="180" />
          <a-table-column title="提现金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="手续费" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.fee }}
            </template>
          </a-table-column>
          <a-table-column title="到账金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="arrival-amount">¥{{ record.arrivalAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="提现银行" :width="200">
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

    <a-modal v-model:visible="withdrawVisible" title="账户提现" :width="500" @ok="handleWithdrawConfirm">
      <a-form :model="withdrawForm" layout="vertical">
        <a-form-item label="可提现金额">
          <span class="available-amount">¥ 308,900.00</span>
        </a-form-item>
        <a-form-item label="提现金额" required>
          <a-input-number v-model="withdrawForm.amount" :min="1" :max="308900" :precision="2" placeholder="请输入提现金额" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
          <div class="form-tip">
            <span>手续费：¥{{ (withdrawForm.amount * 0.001).toFixed(2) }}</span>
            <span>到账金额：¥{{ (withdrawForm.amount * 0.999).toFixed(2) }}</span>
          </div>
        </a-form-item>
        <a-form-item label="提现银行" required>
          <a-select v-model="withdrawForm.bankCard" placeholder="请选择提现银行卡">
            <a-option value="1">中国工商银行 (****8901)</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="withdrawForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="detailVisible" title="提现详情" :width="600" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="提现单号">{{ currentRecord?.withdrawNo }}</a-descriptions-item>
        <a-descriptions-item label="提现金额">
          <span class="amount">¥{{ currentRecord?.amount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="手续费">¥{{ currentRecord?.fee }}</a-descriptions-item>
        <a-descriptions-item label="到账金额">
          <span class="arrival-amount">¥{{ currentRecord?.arrivalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="提现银行">{{ currentRecord?.bankName }} ({{ currentRecord?.bankCard }})</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentRecord?.status)">
            {{ getStatusText(currentRecord?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRecord?.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="到账时间">{{ currentRecord?.arrivalTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  withdrawNo: '',
  bankId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const allWithdrawList = ref([
  { id: '1', withdrawNo: 'WD202401150001', amount: '50,000.00', fee: '50.00', arrivalAmount: '49,950.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', arrivalTime: '2024-01-16 14:30:00', status: 'success', remark: '' },
  { id: '2', withdrawNo: 'WD202401140001', amount: '30,000.00', fee: '30.00', arrivalAmount: '29,970.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-14 15:20:00', arrivalTime: '', status: 'processing', remark: '' },
  { id: '3', withdrawNo: 'WD202401130001', amount: '25,000.00', fee: '25.00', arrivalAmount: '24,975.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-13 09:00:00', arrivalTime: '2024-01-14 10:00:00', status: 'success', remark: '' },
  { id: '4', withdrawNo: 'WD202401120001', amount: '15,000.00', fee: '15.00', arrivalAmount: '14,985.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-12 16:00:00', arrivalTime: '', status: 'pending', remark: '' },
  { id: '5', withdrawNo: 'WD202401110001', amount: '20,000.00', fee: '20.00', arrivalAmount: '19,980.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-11 11:30:00', arrivalTime: '2024-01-12 09:30:00', status: 'success', remark: '' },
])

const withdrawList = ref([...allWithdrawList.value])

const withdrawVisible = ref(false)
const detailVisible = ref(false)
const currentRecord = ref<any>(null)

const withdrawForm = ref({
  amount: 0,
  bankCard: '',
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

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleWithdraw() {
  withdrawForm.value = { amount: 0, bankCard: '', remark: '' }
  withdrawVisible.value = true
}

function handleWithdrawConfirm() {
  if (!withdrawForm.value.amount || withdrawForm.value.amount <= 0) {
    Message.warning('请输入正确的提现金额')
    return
  }
  if (!withdrawForm.value.bankCard) {
    Message.warning('请选择提现银行卡')
    return
  }
  Message.success('提现申请已提交，预计1-3个工作日到账')
  withdrawVisible.value = false
}

function handleViewDetail(record: any) {
  currentRecord.value = record
  detailVisible.value = true
}
</script>

<style scoped lang="less">
.withdraw-record {
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

.available-amount {
  font-size: 20px;
  font-weight: 600;
  color: #165dff;
}

.form-tip {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
