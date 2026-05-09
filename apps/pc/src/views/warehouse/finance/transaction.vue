<template>
  <div class="transaction-page">
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
          <a-statistic title="交易笔数" :value="totalCount" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总收入" :value="totalIncome" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="总支出" :value="totalExpense" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="轧差" :value="totalIncome - totalExpense" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="流水号">
          <a-input v-model="searchForm.transNo" placeholder="请输入流水号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="账户类型">
          <a-select v-model="searchForm.accountType" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="warehouse">工程仓账户</a-option>
            <a-option value="platform">平台账户</a-option>
            <a-option value="supplier">供应商账户</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="收支类型">
          <a-select v-model="searchForm.transType" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="income">收入</a-option>
            <a-option value="expense">支出</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="业务类型">
          <a-select v-model="searchForm.bizType" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="order">订单交易</a-option>
            <a-option value="refund">退款</a-option>
            <a-option value="service">服务费</a-option>
            <a-option value="withdraw">提现</a-option>
            <a-option value="recharge">充值</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        :data="filteredRecords" 
        :pagination="pagination" 
        class="mt-16"
        @page-change="handlePageChange"
        row-key="transId"
      >
        <template #columns>
          <a-table-column title="流水号" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.transNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="交易时间" data-index="transTime" :width="160" />
          <a-table-column title="账户名称" data-index="accountName" :width="180" />
          <a-table-column title="账户类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getAccountTypeColor(record.accountType)">
                {{ getAccountTypeText(record.accountType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收支类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.transType === 'income' ? 'green' : 'red'">
                {{ record.transType === 'income' ? '收入' : '支出' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="业务类型" :width="120">
            <template #cell="{ record }">
              <a-tag color="blue">{{ getBizTypeText(record.bizType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="140" align="right">
            <template #cell="{ record }">
              <span :class="record.transType === 'income' ? 'text-income' : 'text-expense'">
                {{ record.transType === 'income' ? '+' : '-' }}¥{{ record.amount?.toLocaleString() }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="账户余额" :width="140" align="right">
            <template #cell="{ record }">
              ¥{{ record.balanceAfter?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="关联单据" :width="160">
            <template #cell="{ record }">
              <template v-if="record.relatedNo">
                <a-tag color="purple" size="small">{{ record.relatedType }}</a-tag>
                <div class="related-no">{{ record.relatedNo }}</div>
              </template>
              <span v-else class="text-subtle">-</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="200" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  transNo: '',
  accountType: '',
  transType: '',
  bizType: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 15,
  total: 0,
})

const records = ref([
  {
    transId: '1',
    transNo: 'TR202401220001',
    transTime: '2024-01-22 16:30:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'income',
    bizType: 'order',
    amount: 128600,
    balanceAfter: 813600,
    relatedNo: 'SO202401220001',
    relatedType: '销售订单',
    remark: '建材销售订单收款',
  },
  {
    transId: '2',
    transNo: 'TR202401220002',
    transTime: '2024-01-22 16:30:00',
    accountId: 'ACC00000',
    accountName: '平台运营账户',
    accountType: 'platform',
    transType: 'income',
    bizType: 'service',
    amount: 1286,
    balanceAfter: 1286500,
    relatedNo: 'SO202401220001',
    relatedType: '销售订单',
    remark: '订单服务费（1%）',
  },
  {
    transId: '3',
    transNo: 'TR202401210001',
    transTime: '2024-01-21 14:20:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'expense',
    bizType: 'order',
    amount: 86500,
    balanceAfter: 685000,
    relatedNo: 'PO2024011900002',
    relatedType: '采购订单',
    remark: '水泥采购订单支付',
  },
  {
    transId: '4',
    transNo: 'TR202401210002',
    transTime: '2024-01-21 14:20:00',
    accountId: 'ACC00006',
    accountName: '上海建材批发有限公司',
    accountType: 'supplier',
    transType: 'income',
    bizType: 'order',
    amount: 86500,
    balanceAfter: 86500,
    relatedNo: 'PO2024011900002',
    relatedType: '采购订单',
    remark: '水泥采购订单结算',
  },
  {
    transId: '5',
    transNo: 'TR202401200001',
    transTime: '2024-01-20 10:15:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'income',
    bizType: 'refund',
    amount: 12000,
    balanceAfter: 771500,
    relatedNo: 'RT20240120001',
    relatedType: '退款单',
    remark: '质量问题订单退款到账',
  },
  {
    transId: '6',
    transNo: 'TR202401190001',
    transTime: '2024-01-19 09:30:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'expense',
    bizType: 'withdraw',
    amount: 50000,
    balanceAfter: 665000,
    relatedNo: 'WD20240119001',
    relatedType: '提现申请',
    remark: '提现到对公账户',
  },
  {
    transId: '7',
    transNo: 'TR202401180001',
    transTime: '2024-01-18 15:45:00',
    accountId: 'ACC00001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    transType: 'income',
    bizType: 'recharge',
    amount: 200000,
    balanceAfter: 715000,
    relatedNo: 'RC20240118001',
    relatedType: '充值单',
    remark: '对公账户充值',
  },
  {
    transId: '8',
    transNo: 'TR202401180002',
    transTime: '2024-01-18 15:46:00',
    accountId: 'ACC00000',
    accountName: '平台运营账户',
    accountType: 'platform',
    transType: 'income',
    bizType: 'service',
    amount: 865,
    balanceAfter: 1285214,
    relatedNo: 'PO2024011900002',
    relatedType: '采购订单',
    remark: '订单服务费（1%）',
  },
])

const filteredRecords = computed(() => {
  let result = records.value
  
  if (searchForm.value.transNo) {
    result = result.filter(item => 
      item.transNo.includes(searchForm.value.transNo)
    )
  }
  
  if (searchForm.value.accountType) {
    result = result.filter(item => item.accountType === searchForm.value.accountType)
  }
  
  if (searchForm.value.transType) {
    result = result.filter(item => item.transType === searchForm.value.transType)
  }
  
  if (searchForm.value.bizType) {
    result = result.filter(item => item.bizType === searchForm.value.bizType)
  }
  
  return result
})

const totalCount = computed(() => filteredRecords.value.length)

const totalIncome = computed(() => {
  return filteredRecords.value
    .filter(t => t.transType === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpense = computed(() => {
  return filteredRecords.value
    .filter(t => t.transType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

function getAccountTypeText(type: string) {
  const map: Record<string, string> = {
    platform: '平台账户',
    warehouse: '工程仓账户',
    supplier: '供应商账户',
  }
  return map[type] || type
}

function getAccountTypeColor(type: string) {
  const map: Record<string, string> = {
    platform: 'purple',
    warehouse: 'blue',
    supplier: 'green',
  }
  return map[type] || 'gray'
}

function getBizTypeText(type: string) {
  const map: Record<string, string> = {
    order: '订单交易',
    refund: '退款',
    service: '服务费',
    withdraw: '提现',
    recharge: '充值',
  }
  return map[type] || type
}

function handleSearch() {
  pagination.value.current = 1
  Message.success('查询成功')
}

function handleReset() {
  searchForm.value = {
    transNo: '',
    accountType: '',
    transType: '',
    bizType: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleExport() {
  if (filteredRecords.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${filteredRecords.value.length} 条流水记录`)
}
</script>

<style scoped lang="less">
.transaction-page {
  padding: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.text-income {
  color: rgb(var(--success-6));
  font-weight: 600;
}

.text-expense {
  color: rgb(var(--danger-6));
  font-weight: 600;
}

.related-no {
  font-size: 12px;
  color: rgb(var(--gray-6));
  margin-top: 2px;
}

.text-subtle {
  color: rgb(var(--gray-5));
}
</style>