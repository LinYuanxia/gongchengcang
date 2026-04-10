<template>
  <div class="page-container">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="商户账户总余额" :value="3268500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="工程仓账户" :value="5" suffix="个" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="供应商账户" :value="12" suffix="个" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="活跃商户" :value="15" suffix="个">
            <template #suffix>
              <a-tag color="green" size="small" style="margin-left: 8px">正常</a-tag>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <template #title>商户账户列表</template>

      <a-tabs v-model:active-tab="activeTab" class="account-tabs">
        <a-tab-pane key="all" title="全部商户" />
        <a-tab-pane key="warehouse" title="工程仓账户" />
        <a-tab-pane key="supplier" title="供应商账户" />
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索账户名称/账号"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="账户状态" style="width: 140px" allow-clear>
            <a-option value="normal">正常</a-option>
            <a-option value="frozen">冻结</a-option>
          </a-select>
        </a-space>
      </div>

      <a-table
        :data="filteredAccountList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="accountId"
      >
        <template #columns>
          <a-table-column title="账户编号" data-index="accountNo" :width="140">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.accountNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="账户名称" data-index="accountName" :width="180" />
          <a-table-column title="账户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getAccountTypeColor(record.accountType)">
                {{ getAccountTypeText(record.accountType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="账户余额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="balance-amount">¥{{ record.balance?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="累计收入" :width="130" align="right">
            <template #cell="{ record }">
              <span class="text-success">¥{{ record.totalIncome?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="累计支出" :width="130" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.totalExpense?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="开户时间" data-index="createTime" :width="160" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'normal' ? 'green' : 'red'">
                {{ record.status === 'normal' ? '正常' : '冻结' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联托管账户" :width="130">
            <template #cell="{ record }">
              <template v-if="record.custodyAccountNo">
                <a-tag color="arcoblue" size="small">已开通</a-tag>
                <div class="custody-no">{{ record.custodyAccountNo }}</div>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-button type="text" size="small" @click="handleViewTransactions(record)">
                  交易流水
                </a-button>
                <a-button 
                  v-if="record.status === 'normal'" 
                  type="text" 
                  size="small"
                  status="warning"
                  @click="handleFreeze(record)"
                >
                  冻结
                </a-button>
                <a-button 
                  v-else 
                  type="text" 
                  size="small"
                  status="success"
                  @click="handleUnfreeze(record)"
                >
                  解冻
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('all')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  status: undefined as string | undefined,
})

const accountList = ref([
  {
    accountId: 'ACC00000',
    accountNo: 'ACCP000001',
    accountName: '平台运营账户',
    accountType: 'platform',
    balance: 1286500,
    totalIncome: 5680000,
    totalExpense: 4393500,
    status: 'normal',
    custodyAccountNo: '-',
    createTime: '2023-01-01 00:00:00',
  },
  {
    accountId: 'ACC00001',
    accountNo: 'ACCW000001',
    accountName: '深圳宝安工程仓',
    accountType: 'warehouse',
    balance: 685000,
    totalIncome: 2156800,
    totalExpense: 1471800,
    status: 'normal',
    custodyAccountNo: 'TGZH202401001',
    createTime: '2024-01-10 09:30:00',
  },
  {
    accountId: 'ACC00002',
    accountNo: 'ACCW000002',
    accountName: '广州天河工程仓',
    accountType: 'warehouse',
    balance: 425000,
    totalIncome: 1856000,
    totalExpense: 1431000,
    status: 'normal',
    custodyAccountNo: 'TGZH202401002',
    createTime: '2024-01-12 10:15:00',
  },
  {
    accountId: 'ACC00003',
    accountNo: 'ACCW000003',
    accountName: '东莞南城工程仓',
    accountType: 'warehouse',
    balance: 312000,
    totalIncome: 985000,
    totalExpense: 673000,
    status: 'normal',
    custodyAccountNo: '-',
    createTime: '2024-01-15 14:20:00',
  },
  {
    accountId: 'ACC00004',
    accountNo: 'ACCW000004',
    accountName: '佛山禅城工程仓',
    accountType: 'warehouse',
    balance: 156000,
    totalIncome: 528000,
    totalExpense: 372000,
    status: 'frozen',
    custodyAccountNo: 'TGZH202401003',
    createTime: '2024-01-16 11:00:00',
  },
  {
    accountId: 'ACC00005',
    accountNo: 'ACCS000001',
    accountName: '北京建材供应商有限公司',
    accountType: 'supplier',
    balance: 285000,
    totalIncome: 1256000,
    totalExpense: 971000,
    status: 'normal',
    custodyAccountNo: '-',
    createTime: '2024-01-08 16:30:00',
  },
  {
    accountId: 'ACC00006',
    accountNo: 'ACCS000002',
    accountName: '上海建材批发有限公司',
    accountType: 'supplier',
    balance: 86500,
    totalIncome: 685000,
    totalExpense: 598500,
    status: 'normal',
    custodyAccountNo: '-',
    createTime: '2024-01-09 09:00:00',
  },
  {
    accountId: 'ACC00007',
    accountNo: 'ACCS000003',
    accountName: '广东建材集团',
    accountType: 'supplier',
    balance: 32500,
    totalIncome: 412000,
    totalExpense: 379500,
    status: 'normal',
    custodyAccountNo: '-',
    createTime: '2024-01-11 13:45:00',
  },
])

const filteredAccountList = computed(() => {
  let result = accountList.value.filter(r => r.accountType !== 'platform')

  if (activeTab.value === 'warehouse') {
    result = result.filter(r => r.accountType === 'warehouse')
  } else if (activeTab.value === 'supplier') {
    result = result.filter(r => r.accountType === 'supplier')
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r => 
      r.accountName.toLowerCase().includes(keyword) ||
      r.accountNo.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.status) {
    result = result.filter(r => r.status === searchForm.status)
  }

  return result
})

function getAccountTypeText(type: string) {
  const map: Record<string, string> = {
    platform: '平台账户',
    warehouse: '工程仓',
    supplier: '供应商',
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

onMounted(() => {
  pagination.total = accountList.value.length
})

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  Message.info('查看账户详情：' + record.accountName)
}

function handleViewTransactions(record: any) {
  router.push({ 
    path: '/finance/wallet/transactions', 
    query: { accountId: record.accountId } 
  })
}

function handleFreeze(record: any) {
  Modal.confirm({
    title: '确认冻结',
    content: `确定要冻结「${record.accountName}」的账户吗？冻结后该账户将无法进行交易。`,
    onOk: () => {
      record.status = 'frozen'
      Message.success('账户已冻结')
    },
  })
}

function handleUnfreeze(record: any) {
  Modal.confirm({
    title: '确认解冻',
    content: `确定要解冻「${record.accountName}」的账户吗？`,
    onOk: () => {
      record.status = 'normal'
      Message.success('账户已解冻')
    },
  })
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.account-tabs) {
  margin-bottom: 16px;

  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.table-actions {
  margin-bottom: 16px;
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--primary-6));
}

.text-success {
  color: rgb(var(--success-6));
}

.text-danger {
  color: rgb(var(--danger-6));
}

.text-muted {
  color: rgb(var(--gray-6));
}

.custody-no {
  font-size: 12px;
  color: rgb(var(--gray-6));
  margin-top: 2px;
}
</style>
