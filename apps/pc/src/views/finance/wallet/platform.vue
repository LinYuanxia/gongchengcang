<template>
  <div class="platform-wallet">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="平台账户总余额" :value="3268500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日分账收入" :value="128600" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日提现" :value="45800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待提现金额" :value="856000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" status="warning" @click="handleWithdraw">
            平台提现
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:activeTab="activeTab" class="wallet-tabs">
        <a-tab-pane key="overview" title="账户概览" />
        <a-tab-pane key="transactions" title="收支明细" />
      </a-tabs>

      <template v-if="activeTab === 'overview'">
        <a-descriptions :column="2" bordered class="mb-16">
          <a-descriptions-item label="账户名称">平台运营收入账户</a-descriptions-item>
          <a-descriptions-item label="账户类型">
            <a-tag color="purple">平台专属</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开户时间">2024-01-01 00:00:00</a-descriptions-item>
          <a-descriptions-item label="账户状态">
            <a-tag color="green">正常</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="累计总收入" :span="2">
            <span class="text-success text-lg">¥12,586,900.00</span>
          </a-descriptions-item>
          <a-descriptions-item label="累计总支出" :span="2">
            <span class="text-danger text-lg">¥9,318,400.00</span>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>收入构成分析</a-divider>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card>
              <a-statistic title="分账佣金收入" :value="9685200" :precision="2">
                <template #prefix>¥</template>
                <template #suffix>
                  <a-tag color="green" size="small" style="margin-left: 8px">77%</a-tag>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card>
              <a-statistic title="入驻年费收入" :value="1800000" :precision="2">
                <template #prefix>¥</template>
                <template #suffix>
                  <a-tag color="blue" size="small" style="margin-left: 8px">14%</a-tag>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card>
              <a-statistic title="其他服务收入" :value="1101700" :precision="2">
                <template #prefix>¥</template>
                <template #suffix>
                  <a-tag color="orange" size="small" style="margin-left: 8px">9%</a-tag>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
        </a-row>
      </template>

      <template v-if="activeTab === 'transactions'">
        <a-form :model="searchForm" layout="inline" class="search-form">
          <a-form-item label="交易类型">
            <a-select v-model="searchForm.type" placeholder="全部" allow-clear style="width: 140px">
              <a-option value="income">收入</a-option>
              <a-option value="expense">支出</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="业务类型">
            <a-select v-model="searchForm.bizType" placeholder="全部" allow-clear style="width: 140px">
              <a-option value="split">分账佣金</a-option>
              <a-option value="fee">入驻年费</a-option>
              <a-option value="service">服务费</a-option>
              <a-option value="withdraw">平台提现</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="交易时间">
            <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>

        <a-table :data="transactionList" :pagination="pagination" @page-change="handlePageChange">
          <template #columns>
            <a-table-column title="流水号" data-index="transNo" :width="180" />
            <a-table-column title="交易时间" data-index="transTime" :width="160" />
            <a-table-column title="收支类型" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.type === 'income' ? 'green' : 'red'">
                  {{ record.type === 'income' ? '收入' : '支出' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="业务类型" :width="120">
              <template #cell="{ record }">
                {{ getBizTypeText(record.bizType) }}
              </template>
            </a-table-column>
            <a-table-column title="交易金额" :width="120" align="right">
              <template #cell="{ record }">
                <span :class="record.type === 'income' ? 'text-success' : 'text-danger'">
                  {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount?.toLocaleString() }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="账户余额" :width="120" align="right">
              ¥{{ record.balance?.toLocaleString() }}
            </a-table-column>
            <a-table-column title="备注" data-index="remark" :width="200" />
          </template>
        </a-table>
      </template>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('overview')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const searchForm = reactive({
  type: '',
  bizType: '',
  dateRange: [] as string[],
})

const transactionList = ref([
  { transNo: 'PT202401200001', transTime: '2024-01-20 12:30:00', type: 'income', bizType: 'split', amount: 1286, balance: 3268500, remark: '分账佣金-深圳湾项目仓' },
  { transNo: 'PT202401200002', transTime: '2024-01-20 10:15:00', type: 'income', bizType: 'split', amount: 865, balance: 3267214, remark: '分账佣金-广州天河工程仓' },
  { transNo: 'PT202401190001', transTime: '2024-01-19 16:45:00', type: 'expense', bizType: 'withdraw', amount: 50000, balance: 3266349, remark: '平台提现到公户' },
  { transNo: 'PT202401190002', transTime: '2024-01-19 09:30:00', type: 'income', bizType: 'fee', amount: 5000, balance: 3316349, remark: '入驻年费-新入驻供应商' },
  { transNo: 'PT202401180001', transTime: '2024-01-18 14:20:00', type: 'income', bizType: 'service', amount: 2000, balance: 3311349, remark: '技术服务费' },
  { transNo: 'PT202401180002', transTime: '2024-01-18 11:00:00', type: 'income', bizType: 'split', amount: 2450, balance: 3309349, remark: '分账佣金-北京朝阳工程仓' },
])

function getBizTypeText(type: string) {
  const map: Record<string, string> = {
    split: '分账佣金',
    fee: '入驻年费',
    service: '服务费',
    withdraw: '平台提现',
  }
  return map[type] || '-'
}

function handleWithdraw() {
  Message.info('发起平台提现申请')
}

function handleSearch() {
  Message.success('搜索完成')
}

function handleReset() {
  searchForm.type = ''
  searchForm.bizType = ''
  searchForm.dateRange = []
  Message.success('已重置')
}

function handlePageChange(page: number) {
  pagination.current = page
}
</script>

<style scoped>
.wallet-tabs {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.mb-16 {
  margin-bottom: 16px;
}

.text-success {
  color: #00b42a;
  font-weight: 500;
}

.text-danger {
  color: #f53f3f;
  font-weight: 500;
}

.text-lg {
  font-size: 16px;
}
</style>
