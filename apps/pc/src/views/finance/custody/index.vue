<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商户名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.openStatus" placeholder="开户状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CUSTODY_OPEN_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.bindCardStatus" placeholder="绑卡状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CUSTODY_BIND_CARD_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.accountStatus" placeholder="账户状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CUSTODY_ACCOUNT_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button @click="handleSyncAll">
            <template #icon><icon-sync /></template>
            同步余额
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="accountId"
      >
        <template #columns>
          <a-table-column title="账户ID" data-index="accountId" :width="180" />
          <a-table-column title="商户名称" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleViewMerchant(record)">{{ record.merchantName || record.tenantId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="开户状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_OPEN_STATUS_MAP[record.openStatus]?.color">
                {{ CUSTODY_OPEN_STATUS_MAP[record.openStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="绑卡状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_BIND_CARD_STATUS_MAP[record.bindCardStatus]?.color">
                {{ CUSTODY_BIND_CARD_STATUS_MAP[record.bindCardStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="账户状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_ACCOUNT_STATUS_MAP[record.accountStatus]?.color">
                {{ CUSTODY_ACCOUNT_STATUS_MAP[record.accountStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="可用余额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="money">¥{{ formatMoney(record.availableBalance) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="冻结余额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="money frozen">¥{{ formatMoney(record.frozenBalance) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="总余额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="money total">¥{{ formatMoney(record.totalBalance) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="最后同步" data-index="lastSyncTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleDetail(record)">查看明细</a-button>
                <a-button
                  v-if="record.openStatus === 0 || record.openStatus === 3"
                  type="text"
                  size="small"
                  @click="handleApplyOpen(record)"
                >
                  {{ record.openStatus === 0 ? '发起开户' : '重新开户' }}
                </a-button>
                <a-button type="text" size="small" @click="handleSync(record)">同步余额</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  CUSTODY_OPEN_STATUS_OPTIONS,
  CUSTODY_OPEN_STATUS_MAP,
  CUSTODY_BIND_CARD_STATUS_OPTIONS,
  CUSTODY_BIND_CARD_STATUS_MAP,
  CUSTODY_ACCOUNT_STATUS_OPTIONS,
  CUSTODY_ACCOUNT_STATUS_MAP,
} from '@gongchengcang/constants'
import { getCustodyAccountList, applyOpenAccount, retryOpenAccount, syncAccountBalance } from '@gongchengcang/api'
import type { CustodyAccount } from '@gongchengcang/types'

const router = useRouter()
const loading = ref(false)
const tableData = ref<CustodyAccount[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  openStatus: undefined as number | undefined,
  bindCardStatus: undefined as number | undefined,
  accountStatus: undefined as number | undefined,
})

onMounted(() => {
  loadData()
})

function formatMoney(value: number) {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCustodyAccountList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleViewMerchant(record: CustodyAccount) {
  router.push({
    path: '/merchant/list',
    query: { tenantId: record.tenantId }
  })
}

function handleDetail(record: CustodyAccount) {
  router.push({
    path: `/finance/custody/detail/${record.accountId}`
  })
}

async function handleApplyOpen(record: CustodyAccount) {
  try {
    if (record.openStatus === 0) {
      await applyOpenAccount(record.tenantId)
      Message.success('开户申请已提交')
    } else {
      await retryOpenAccount(record.tenantId)
      Message.success('重新开户申请已提交')
    }
    loadData()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  }
}

async function handleSync(record: CustodyAccount) {
  try {
    await syncAccountBalance(record.accountId)
    Message.success('余额同步成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '同步失败')
  }
}

async function handleSyncAll() {
  Message.info('批量同步余额功能开发中...')
}
</script>

<style scoped lang="less">
.money {
  font-weight: 500;
  &.frozen {
    color: var(--color-warning-6);
  }
  &.total {
    color: var(--color-primary-6);
  }
}
</style>
