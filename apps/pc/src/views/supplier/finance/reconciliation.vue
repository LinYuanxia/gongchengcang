<template>
  <div class="finance-reconciliation">
    <a-page-header title="银行对账" />

    <a-row :gutter="16" class="mt-16">
      <a-col :span="6">
        <a-statistic title="已对账笔数" :value="stats.matched" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="未对账笔数" :value="stats.unmatched" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="已对账金额" :value="stats.matchedAmount" prefix="¥" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="差异金额" :value="stats.diffAmount" prefix="¥" :value-style="{ color: '#ff7d00' }" />
      </a-col>
    </a-row>

    <a-card class="mt-16">
      <a-space>
        <a-upload :auto-upload="false" accept=".xlsx,.xls,.csv" @change="handleUpload">
          <a-button type="primary">
            <template #icon><icon-upload /></template>
            导入银行对账单
          </a-button>
        </a-upload>
        <a-button @click="handleAutoMatch">
          <template #icon><icon-check-circle /></template>
          自动对账
        </a-button>
        <a-button @click="handleDownloadTemplate">
          <template #icon><icon-download /></template>
          下载模板
        </a-button>
      </a-space>

      <a-tabs v-model:active-tab="activeTab" class="mt-16">
        <a-tab-pane key="unmatched" title="未对账">
          <a-table :data="unmatchedList" :pagination="{ pageSize: 10 }" row-key="id">
            <template #columns>
              <a-table-column title="银行流水号" data-index="bankNo" :width="180" />
              <a-table-column title="交易时间" data-index="transTime" :width="160" />
              <a-table-column title="收入金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span v-if="record.type === 'income'" class="income">¥{{ record.amount?.toLocaleString() }}</span>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="支出金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span v-if="record.type === 'expense'" class="expense">¥{{ record.amount?.toLocaleString() }}</span>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="对方账户" data-index="oppositeAccount" :width="200" ellipsis />
              <a-table-column title="对方户名" data-index="oppositeName" :width="150" ellipsis />
              <a-table-column title="摘要" data-index="summary" :width="200" ellipsis />
              <a-table-column title="操作" :width="150" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-link @click="handleManualMatch(record)">手工对账</a-link>
                    <a-link @click="handleIgnore(record)">忽略</a-link>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="matched" title="已对账">
          <a-table :data="matchedList" :pagination="{ pageSize: 10 }" row-key="id">
            <template #columns>
              <a-table-column title="银行流水号" data-index="bankNo" :width="180" />
              <a-table-column title="系统流水号" data-index="systemNo" :width="180" />
              <a-table-column title="对账方式" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.matchType === 'auto' ? 'blue' : 'orange'">
                    {{ record.matchType === 'auto' ? '自动对账' : '手工对账' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="银行金额" :width="120" align="right">
                ¥{{ record.bankAmount?.toLocaleString() }}
              </a-table-column>
              <a-table-column title="系统金额" :width="120" align="right">
                ¥{{ record.systemAmount?.toLocaleString() }}
              </a-table-column>
              <a-table-column title="对账人" data-index="matchUser" :width="100" />
              <a-table-column title="对账时间" data-index="matchTime" :width="160" />
              <a-table-column title="操作" :width="100">
                <template #cell="{ record }">
                  <a-space>
                    <a-link @click="handleUnmatch(record)">取消对账</a-link>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="diff" title="差异调节表">
          <a-alert type="warning" style="margin-bottom: 16px">
            <template #message>
              银行账面余额与系统账面余额存在差异，请核对以下调节项
            </template>
          </a-alert>

          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="银行账面余额">¥{{ balance.bankBalance?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="系统账面余额">¥{{ balance.systemBalance?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="企业已收银行未收">¥{{ balance.receivedNotInBank?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="企业已付银行未付">¥{{ balance.paidNotInBank?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="银行已收企业未收">¥{{ balance.bankReceivedNotInSystem?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="银行已付企业未付">¥{{ balance.bankPaidNotInSystem?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="调节后余额" :span="2" style="font-weight: 600">
              ¥{{ balance.adjustedBalance?.toLocaleString() }}
            </a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:visible="matchVisible"
      title="手工对账"
      :width="800"
      @ok="handleMatchConfirm"
      @cancel="matchVisible = false"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="银行流水" size="small">
            <a-descriptions size="small" column="1">
              <a-descriptions-item label="流水号">{{ currentBankRecord.bankNo }}</a-descriptions-item>
              <a-descriptions-item label="交易时间">{{ currentBankRecord.transTime }}</a-descriptions-item>
              <a-descriptions-item label="交易金额">
                <span :class="currentBankRecord.type === 'income' ? 'income' : 'expense'">
                  ¥{{ currentBankRecord.amount?.toLocaleString() }}
                </span>
              </a-descriptions-item>
              <a-descriptions-item label="对方户名">{{ currentBankRecord.oppositeName }}</a-descriptions-item>
              <a-descriptions-item label="摘要">{{ currentBankRecord.summary }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="选择系统流水" size="small">
            <a-input-search
              v-model="searchSystemNo"
              placeholder="搜索系统流水号"
              style="margin-bottom: 12px"
              @search="handleSearchSystem"
            />
            <a-radio-group v-model="selectedSystemId" direction="vertical">
              <a-radio v-for="item in candidateSystemList" :key="item.id" :value="item.id">
                <div class="system-item">
                  <span>{{ item.systemNo }}</span>
                  <span class="amount">¥{{ item.amount?.toLocaleString() }}</span>
                  <span class="diff" v-if="Math.abs(item.amount - currentBankRecord.amount) > 0.01">
                    (差异: ¥{{ Math.abs(item.amount - currentBankRecord.amount).toFixed(2) }})
                  </span>
                </div>
              </a-radio>
            </a-radio-group>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'

const activeTab = ref('unmatched')
const stats = ref({
  matched: 25,
  unmatched: 3,
  matchedAmount: 586500,
  diffAmount: 128.5,
})

const balance = ref({
  bankBalance: 256800,
  systemBalance: 256671.5,
  receivedNotInBank: 0,
  paidNotInBank: 0,
  bankReceivedNotInSystem: 0,
  bankPaidNotInSystem: 128.5,
  adjustedBalance: 256671.5,
})

const unmatchedList = ref([
  {
    id: '1',
    bankNo: 'BANK2024011500001',
    transTime: '2024-01-15 16:30:00',
    type: 'income',
    amount: 85000,
    oppositeAccount: '6222 **** 8888',
    oppositeName: '深圳湾科技园区项目工程部',
    summary: '货款',
  },
  {
    id: '2',
    bankNo: 'BANK2024011500002',
    transTime: '2024-01-15 10:15:00',
    type: 'income',
    amount: 128.5,
    oppositeAccount: '9558 **** 0001',
    oppositeName: '中国工商银行股份有限公司',
    summary: '结息',
  },
  {
    id: '3',
    bankNo: 'BANK2024011400001',
    transTime: '2024-01-14 14:00:00',
    type: 'expense',
    amount: 25,
    oppositeAccount: '9558 **** 0002',
    oppositeName: '工商银行手续费专户',
    summary: '账户管理费',
  },
])

const matchedList = ref([
  {
    id: '1',
    bankNo: 'BANK2024011400002',
    systemNo: 'PAY20240114000001',
    matchType: 'auto',
    bankAmount: 52300,
    systemAmount: 52300,
    matchUser: '管理员',
    matchTime: '2024-01-14 11:00:00',
  },
  {
    id: '2',
    bankNo: 'BANK2024011300001',
    systemNo: 'PAY20240113000001',
    matchType: 'manual',
    bankAmount: 12800,
    systemAmount: 12800,
    matchUser: '张三',
    matchTime: '2024-01-13 16:30:00',
  },
])

const matchVisible = ref(false)
const currentBankRecord = ref<any>({})
const searchSystemNo = ref('')
const selectedSystemId = ref('')
const candidateSystemList = ref([
  { id: 's1', systemNo: 'PAY20240115000001', amount: 85000 },
  { id: 's2', systemNo: 'PAY20240115000002', amount: 84900 },
])

function handleUpload() {
  Message.success('银行对账单导入成功，共导入 3 条流水记录')
}

function handleAutoMatch() {
  Message.loading('自动对账中...')
  setTimeout(() => {
    Message.success('自动对账完成，成功匹配 2 条，剩余 1 条未匹配')
    unmatchedList.value = unmatchedList.value.slice(1)
  }, 1500)
}

function handleDownloadTemplate() {
  Message.success('模板下载已开始')
}

function handleManualMatch(record: any) {
  currentBankRecord.value = record
  matchVisible.value = true
}

function handleMatchConfirm() {
  if (!selectedSystemId.value) {
    Message.warning('请选择对应的系统流水')
    return
  }
  unmatchedList.value = unmatchedList.value.filter(r => r.id !== currentBankRecord.value.id)
  const selected = candidateSystemList.value.find(s => s.id === selectedSystemId.value)
  matchedList.value.unshift({
    id: currentBankRecord.value.id,
    bankNo: currentBankRecord.value.bankNo,
    systemNo: selected?.systemNo || '',
    matchType: 'manual',
    bankAmount: currentBankRecord.value.amount,
    systemAmount: selected?.amount || 0,
    matchUser: '当前用户',
    matchTime: new Date().toLocaleString(),
  })
  matchVisible.value = false
  Message.success('对账成功')
}

function handleIgnore(record: any) {
  Modal.confirm({
    title: '确认忽略此条流水？',
    content: '忽略后将不再显示在未对账列表中',
    onOk: () => {
      unmatchedList.value = unmatchedList.value.filter(r => r.id !== record.id)
      Message.success('已忽略')
    },
  })
}

function handleUnmatch(record: any) {
  matchedList.value = matchedList.value.filter(r => r.id !== record.id)
  stats.value.matched--
  stats.value.unmatched++
  Message.success('已取消对账')
}

function handleSearchSystem() {
  Message.info('搜索系统流水：' + searchSystemNo.value)
}
</script>

<style scoped>
.finance-reconciliation {
  padding: 16px;
}
.mt-16 {
  margin-top: 16px;
}
.income {
  color: #00b42a;
  font-weight: 600;
}
.expense {
  color: #f53f3f;
  font-weight: 600;
}
.system-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .amount {
    font-weight: 600;
  }
  .diff {
    color: #ff7d00;
    font-size: 12px;
  }
}
</style>
