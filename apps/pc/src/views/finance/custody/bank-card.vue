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
          <a-select v-model="searchForm.bindStatus" placeholder="绑定状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CUSTODY_CARD_BIND_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.cardType" placeholder="卡类型" style="width: 120px" allow-clear>
            <a-option v-for="item in CUSTODY_CARD_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleBind">
            <template #icon><icon-plus /></template>
            绑定银行卡
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="cardId"
      >
        <template #columns>
          <a-table-column title="商户名称" :width="180">
            <template #cell="{ record }">
              {{ record.merchantName || record.tenantId }}
            </template>
          </a-table-column>
          <a-table-column title="银行名称" data-index="bankName" :width="120" />
          <a-table-column title="银行账号" :width="180">
            <template #cell="{ record }">
              {{ record.bankAccountMasked || record.bankAccount }}
            </template>
          </a-table-column>
          <a-table-column title="账户名称" data-index="accountName" :width="150" />
          <a-table-column title="卡类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_CARD_TYPE_MAP[record.cardType]?.color">
                {{ CUSTODY_CARD_TYPE_MAP[record.cardType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="绑定状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CUSTODY_CARD_BIND_STATUS_MAP[record.bindStatus]?.color">
                {{ CUSTODY_CARD_BIND_STATUS_MAP[record.bindStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="绑定时间" data-index="bindTime" :width="160" />
          <a-table-column title="默认卡" :width="80">
            <template #cell="{ record }">
              <a-tag v-if="record.isDefault" color="blue">默认</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="失败原因" data-index="failReason" :width="150" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  v-if="record.bindStatus === 3"
                  type="text"
                  size="small"
                  @click="handleRebind(record)"
                >
                  重新绑卡
                </a-button>
                <a-button
                  v-if="record.bindStatus === 2 && !record.isDefault"
                  type="text"
                  size="small"
                  @click="handleSetDefault(record)"
                >
                  设为默认
                </a-button>
                <a-popconfirm
                  v-if="record.bindStatus === 2"
                  content="确定要解绑该银行卡吗？"
                  @ok="handleUnbind(record)"
                >
                  <a-button type="text" size="small" status="danger">解绑</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <BindCardDrawer
      v-model:visible="bindCardVisible"
      :card-id="currentCardId"
      :tenant-id="currentTenantId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  CUSTODY_CARD_BIND_STATUS_OPTIONS,
  CUSTODY_CARD_BIND_STATUS_MAP,
  CUSTODY_CARD_TYPE_OPTIONS,
  CUSTODY_CARD_TYPE_MAP,
} from '@gongchengcang/constants'
import { getBankCardList, setDefaultCard, unbindBankCard } from '@gongchengcang/api'
import type { CustodyBankCard } from '@gongchengcang/types'
import BindCardDrawer from './components/BindCardDrawer.vue'

const loading = ref(false)
const tableData = ref<CustodyBankCard[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  bindStatus: undefined as number | undefined,
  cardType: undefined as number | undefined,
})

const bindCardVisible = ref(false)
const currentCardId = ref('')
const currentTenantId = ref('')

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getBankCardList({
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

function handleBind() {
  currentCardId.value = ''
  currentTenantId.value = ''
  bindCardVisible.value = true
}

function handleRebind(record: CustodyBankCard) {
  currentCardId.value = record.cardId
  currentTenantId.value = record.tenantId
  bindCardVisible.value = true
}

async function handleSetDefault(record: CustodyBankCard) {
  try {
    await setDefaultCard(record.cardId)
    Message.success('设置成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '设置失败')
  }
}

async function handleUnbind(record: CustodyBankCard) {
  try {
    await unbindBankCard(record.cardId)
    Message.success('解绑成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '解绑失败')
  }
}

function handleFormSuccess() {
  loadData()
}
</script>
