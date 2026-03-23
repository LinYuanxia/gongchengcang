<template>
  <a-drawer
    :visible="visible"
    title="托管账户明细"
    :width="800"
    :footer="false"
    @cancel="handleClose"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-descriptions title="账户信息" :column="3" bordered>
        <a-descriptions-item label="账户ID">{{ accountInfo.accountId }}</a-descriptions-item>
        <a-descriptions-item label="商户名称">{{ accountInfo.merchantName }}</a-descriptions-item>
        <a-descriptions-item label="账户状态">
          <a-tag :color="CUSTODY_ACCOUNT_STATUS_MAP[accountInfo.accountStatus]?.color">
            {{ CUSTODY_ACCOUNT_STATUS_MAP[accountInfo.accountStatus]?.label }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="开户状态">
          <a-tag :color="CUSTODY_OPEN_STATUS_MAP[accountInfo.openStatus]?.color">
            {{ CUSTODY_OPEN_STATUS_MAP[accountInfo.openStatus]?.label }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="开户时间">{{ accountInfo.openTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="开户失败原因" :span="1">{{ accountInfo.openFailReason || '-' }}</a-descriptions-item>
        <a-descriptions-item label="绑卡状态">
          <a-tag :color="CUSTODY_BIND_CARD_STATUS_MAP[accountInfo.bindCardStatus]?.color">
            {{ CUSTODY_BIND_CARD_STATUS_MAP[accountInfo.bindCardStatus]?.label }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="绑卡时间">{{ accountInfo.bindCardTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="最后同步">{{ accountInfo.lastSyncTime || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="资金信息" :column="3" bordered class="mt-16">
        <a-descriptions-item label="可用余额">
          <span class="money">¥{{ formatMoney(accountInfo.availableBalance) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="冻结余额">
          <span class="money frozen">¥{{ formatMoney(accountInfo.frozenBalance) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="总余额">
          <span class="money total">¥{{ formatMoney(accountInfo.totalBalance) }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-tabs default-active-key="bankCards" class="mt-16">
        <a-tab-pane key="bankCards" title="绑卡记录">
          <a-table :data="accountInfo.bankCards || []" :pagination="false" size="small">
            <template #columns>
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
              <a-table-column title="默认" :width="80">
                <template #cell="{ record }">
                  <a-tag v-if="record.isDefault" color="blue">默认</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="openRecords" title="开户记录">
          <a-table :data="accountInfo.openRecords || []" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="申请ID" data-index="applyId" :width="180" />
              <a-table-column title="申请类型" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.color">
                    {{ CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.label }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="提交时间" data-index="submitTime" :width="160" />
              <a-table-column title="审核状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.color">
                    {{ CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.label }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="审核时间" data-index="auditTime" :width="160" />
              <a-table-column title="失败原因" data-index="failReason" />
              <a-table-column title="重试次数" data-index="retryCount" :width="80" />
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  CUSTODY_ACCOUNT_STATUS_MAP,
  CUSTODY_OPEN_STATUS_MAP,
  CUSTODY_BIND_CARD_STATUS_MAP,
  CUSTODY_CARD_TYPE_MAP,
  CUSTODY_CARD_BIND_STATUS_MAP,
  CUSTODY_OPEN_APPLY_TYPE_MAP,
  CUSTODY_OPEN_AUDIT_STATUS_MAP,
} from '@gongchengcang/constants'
import { getCustodyAccountDetail } from '@gongchengcang/api'
import type { CustodyAccount } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  accountId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const loading = ref(false)
const accountInfo = ref<CustodyAccount>({} as CustodyAccount)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.accountId) {
      await loadData()
    }
  }
)

async function loadData() {
  loading.value = true
  try {
    accountInfo.value = await getCustodyAccountDetail(props.accountId)
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function formatMoney(value: number) {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.mt-16 {
  margin-top: 16px;
}

.money {
  font-weight: 500;
  font-size: 16px;
  &.frozen {
    color: var(--color-warning-6);
  }
  &.total {
    color: var(--color-primary-6);
  }
}
</style>
