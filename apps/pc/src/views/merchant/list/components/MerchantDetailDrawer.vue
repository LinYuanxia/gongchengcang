<template>
  <a-drawer
    :visible="visible"
    title="商户详情"
    :width="720"
    :footer="false"
    @cancel="handleClose"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-tabs default-active-key="basic" type="rounded">
        <a-tab-pane key="basic" title="基本信息">
          <a-descriptions title="基础信息" :column="2" bordered>
            <a-descriptions-item label="租户ID">{{ merchantInfo.tenantId }}</a-descriptions-item>
            <a-descriptions-item label="商户类型">
              <a-tag :color="TENANT_TYPE_MAP[merchantInfo.tenantType]?.color">
                {{ TENANT_TYPE_MAP[merchantInfo.tenantType]?.label }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="商户名称">{{ merchantInfo.merchantName }}</a-descriptions-item>
            <a-descriptions-item label="联系人">{{ merchantInfo.contactPerson }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ merchantInfo.contactPhone }}</a-descriptions-item>
            <a-descriptions-item label="入驻状态">
              <a-tag :color="REGISTRATION_STATUS_MAP[merchantInfo.registrationStatus]?.color">
                {{ REGISTRATION_STATUS_MAP[merchantInfo.registrationStatus]?.label }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="启用状态">
              <a-tag :color="ENABLED_STATUS_MAP[merchantInfo.enabledStatus]?.color">
                {{ ENABLED_STATUS_MAP[merchantInfo.enabledStatus]?.label }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ merchantInfo.createdAt }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="2">{{ merchantInfo.remark || '-' }}</a-descriptions-item>
          </a-descriptions>

          <a-descriptions title="主体信息" :column="2" bordered class="mt-16" v-if="merchantInfo.enterpriseInfo">
            <a-descriptions-item label="企业名称">{{ merchantInfo.enterpriseInfo.enterpriseName }}</a-descriptions-item>
            <a-descriptions-item label="企业类型">
              {{ ENTERPRISE_TYPE_OPTIONS.find(e => e.value === merchantInfo.enterpriseInfo?.enterpriseType)?.label || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="统一社会信用代码">{{ merchantInfo.enterpriseInfo.unifiedSocialCreditCode }}</a-descriptions-item>
            <a-descriptions-item label="纳税人类型">
              {{ TAX_PAYER_TYPE_OPTIONS.find(e => e.value === merchantInfo.enterpriseInfo?.taxPayerType)?.label || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="法定代表人">{{ merchantInfo.enterpriseInfo.legalPersonName }}</a-descriptions-item>
            <a-descriptions-item label="法人身份证号">{{ merchantInfo.enterpriseInfo.legalPersonIdCard }}</a-descriptions-item>
            <a-descriptions-item label="营业执照">
              <a-image :src="merchantInfo.enterpriseInfo.businessLicensePic" width="80" height="80" fit="cover" />
            </a-descriptions-item>
            <a-descriptions-item label="营业执照有效期">{{ merchantInfo.enterpriseInfo.businessLicenseExpire }}</a-descriptions-item>
            <a-descriptions-item label="身份证正面">
              <a-image :src="merchantInfo.enterpriseInfo.idCardPicFront" width="80" height="80" fit="cover" />
            </a-descriptions-item>
            <a-descriptions-item label="身份证反面">
              <a-image :src="merchantInfo.enterpriseInfo.idCardPicBack" width="80" height="80" fit="cover" />
            </a-descriptions-item>
            <a-descriptions-item label="注册地址">{{ merchantInfo.enterpriseInfo.registeredAddress || '-' }}</a-descriptions-item>
            <a-descriptions-item label="实际经营地址">{{ merchantInfo.enterpriseInfo.actualAddress || '-' }}</a-descriptions-item>
            <a-descriptions-item label="注册资本">{{ merchantInfo.enterpriseInfo.registeredCapital ? `${merchantInfo.enterpriseInfo.registeredCapital} 万元` : '-' }}</a-descriptions-item>
            <a-descriptions-item label="成立日期">{{ merchantInfo.enterpriseInfo.establishedDate || '-' }}</a-descriptions-item>
            <a-descriptions-item label="经营范围" :span="2">{{ merchantInfo.enterpriseInfo.businessScope || '-' }}</a-descriptions-item>
          </a-descriptions>

          <a-descriptions title="结算账户" :column="2" bordered class="mt-16" v-if="merchantInfo.settlementAccount">
            <a-descriptions-item label="账户名称">{{ merchantInfo.settlementAccount.accountName }}</a-descriptions-item>
            <a-descriptions-item label="银行账号">{{ merchantInfo.settlementAccount.bankAccount }}</a-descriptions-item>
            <a-descriptions-item label="开户银行">{{ merchantInfo.settlementAccount.bankName }}</a-descriptions-item>
            <a-descriptions-item label="支行信息">{{ merchantInfo.settlementAccount.bankBranch }}</a-descriptions-item>
            <a-descriptions-item label="联行号" :span="2">{{ merchantInfo.settlementAccount.bankBranchCode || '-' }}</a-descriptions-item>
          </a-descriptions>

          <div class="section-title mt-16">合同信息</div>
          <a-table :data="contracts" :pagination="false" size="small" class="mt-8">
            <template #columns>
              <a-table-column title="合同编号" data-index="contractNo" />
              <a-table-column title="合同类型">
                <template #cell="{ record }">
                  {{ CONTRACT_TYPE_MAP[record.contractType]?.label }}
                </template>
              </a-table-column>
              <a-table-column title="签署日期" data-index="signDate" />
              <a-table-column title="有效期">
                <template #cell="{ record }">
                  {{ record.contractStartDate }} 至 {{ record.contractEndDate || '长期' }}
                </template>
              </a-table-column>
              <a-table-column title="状态">
                <template #cell="{ record }">
                  <a-tag :color="CONTRACT_STATUS_MAP[record.status]?.color">
                    {{ CONTRACT_STATUS_MAP[record.status]?.label }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div class="section-title mt-16">资质信息</div>
          <a-table :data="qualifications" :pagination="false" size="small" class="mt-8">
            <template #columns>
              <a-table-column title="资质名称" data-index="qualName" />
              <a-table-column title="证书编号" data-index="certNo" />
              <a-table-column title="有效期">
                <template #cell="{ record }">
                  {{ record.issueDate || '-' }} 至 {{ record.expireDate || '长期' }}
                </template>
              </a-table-column>
              <a-table-column title="状态">
                <template #cell="{ record }">
                  <a-tag :color="QUALIFICATION_STATUS_MAP[record.status]?.color">
                    {{ QUALIFICATION_STATUS_MAP[record.status]?.label }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="custody" title="托管账户">
          <a-spin :loading="custodyLoading">
            <template v-if="custodyAccount">
              <a-descriptions title="账户信息" :column="2" bordered>
                <a-descriptions-item label="账户ID">{{ custodyAccount.accountId }}</a-descriptions-item>
                <a-descriptions-item label="账户状态">
                  <a-tag :color="CUSTODY_ACCOUNT_STATUS_MAP[custodyAccount.accountStatus]?.color">
                    {{ CUSTODY_ACCOUNT_STATUS_MAP[custodyAccount.accountStatus]?.label }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="开户状态">
                  <a-tag :color="CUSTODY_OPEN_STATUS_MAP[custodyAccount.openStatus]?.color">
                    {{ CUSTODY_OPEN_STATUS_MAP[custodyAccount.openStatus]?.label }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="开户时间">{{ custodyAccount.openTime || '-' }}</a-descriptions-item>
                <a-descriptions-item label="开户失败原因" :span="2">{{ custodyAccount.openFailReason || '-' }}</a-descriptions-item>
                <a-descriptions-item label="绑卡状态">
                  <a-tag :color="CUSTODY_BIND_CARD_STATUS_MAP[custodyAccount.bindCardStatus]?.color">
                    {{ CUSTODY_BIND_CARD_STATUS_MAP[custodyAccount.bindCardStatus]?.label }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="绑卡时间">{{ custodyAccount.bindCardTime || '-' }}</a-descriptions-item>
              </a-descriptions>

              <a-descriptions title="资金信息" :column="3" bordered class="mt-16">
                <a-descriptions-item label="可用余额">
                  <span class="money">¥{{ formatMoney(custodyAccount.availableBalance) }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="冻结余额">
                  <span class="money frozen">¥{{ formatMoney(custodyAccount.frozenBalance) }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="总余额">
                  <span class="money total">¥{{ formatMoney(custodyAccount.totalBalance) }}</span>
                </a-descriptions-item>
              </a-descriptions>

              <div class="section-title mt-16">绑卡记录</div>
              <a-table :data="custodyAccount.bankCards || []" :pagination="false" size="small" class="mt-8">
                <template #columns>
                  <a-table-column title="银行名称" data-index="bankName" />
                  <a-table-column title="银行账号">
                    <template #cell="{ record }">
                      {{ record.bankAccountMasked || record.bankAccount }}
                    </template>
                  </a-table-column>
                  <a-table-column title="卡类型">
                    <template #cell="{ record }">
                      <a-tag :color="CUSTODY_CARD_TYPE_MAP[record.cardType]?.color">
                        {{ CUSTODY_CARD_TYPE_MAP[record.cardType]?.label }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="绑定状态">
                    <template #cell="{ record }">
                      <a-tag :color="CUSTODY_CARD_BIND_STATUS_MAP[record.bindStatus]?.color">
                        {{ CUSTODY_CARD_BIND_STATUS_MAP[record.bindStatus]?.label }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="默认">
                    <template #cell="{ record }">
                      <a-tag v-if="record.isDefault" color="blue">默认</a-tag>
                    </template>
                  </a-table-column>
                </template>
              </a-table>

              <div class="section-title mt-16">开户记录</div>
              <a-table :data="custodyAccount.openRecords || []" :pagination="false" size="small" class="mt-8">
                <template #columns>
                  <a-table-column title="申请类型">
                    <template #cell="{ record }">
                      <a-tag :color="CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.color">
                        {{ CUSTODY_OPEN_APPLY_TYPE_MAP[record.applyType]?.label }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="提交时间" data-index="submitTime" />
                  <a-table-column title="审核状态">
                    <template #cell="{ record }">
                      <a-tag :color="CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.color">
                        {{ CUSTODY_OPEN_AUDIT_STATUS_MAP[record.status]?.label }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="失败原因" data-index="failReason" />
                </template>
              </a-table>
            </template>
            <a-empty v-else description="暂未开通托管账户">
              <a-button type="primary" @click="handleApplyOpen">发起开户</a-button>
            </a-empty>
          </a-spin>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  TENANT_TYPE_MAP,
  REGISTRATION_STATUS_MAP,
  ENABLED_STATUS_MAP,
  ENTERPRISE_TYPE_OPTIONS,
  TAX_PAYER_TYPE_OPTIONS,
  CONTRACT_TYPE_MAP,
  CONTRACT_STATUS_MAP,
  QUALIFICATION_STATUS_MAP,
  CUSTODY_ACCOUNT_STATUS_MAP,
  CUSTODY_OPEN_STATUS_MAP,
  CUSTODY_BIND_CARD_STATUS_MAP,
  CUSTODY_CARD_TYPE_MAP,
  CUSTODY_CARD_BIND_STATUS_MAP,
  CUSTODY_OPEN_APPLY_TYPE_MAP,
  CUSTODY_OPEN_AUDIT_STATUS_MAP,
} from '@gongchengcang/constants'
import { getMerchantDetail, getContractList, getQualificationList, getCustodyAccountByTenant, applyOpenAccount } from '@gongchengcang/api'
import type { Merchant, Contract, Qualification, CustodyAccount } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  tenantId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const loading = ref(false)
const custodyLoading = ref(false)
const merchantInfo = ref<Merchant>({} as Merchant)
const contracts = ref<Contract[]>([])
const qualifications = ref<Qualification[]>([])
const custodyAccount = ref<CustodyAccount | null>(null)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.tenantId) {
      await loadData()
    }
  }
)

async function loadData() {
  loading.value = true
  try {
    const [merchant, contractRes, qualRes] = await Promise.all([
      getMerchantDetail(props.tenantId),
      getContractList({ page: 1, pageSize: 100, tenantId: props.tenantId }),
      getQualificationList({ page: 1, pageSize: 100, tenantId: props.tenantId }),
    ])
    merchantInfo.value = merchant
    contracts.value = contractRes.list
    qualifications.value = qualRes.list
    await loadCustodyAccount()
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

async function loadCustodyAccount() {
  custodyLoading.value = true
  try {
    custodyAccount.value = await getCustodyAccountByTenant(props.tenantId)
  } catch (error) {
    custodyAccount.value = null
  } finally {
    custodyLoading.value = false
  }
}

async function handleApplyOpen() {
  try {
    await applyOpenAccount(props.tenantId)
    Message.success('开户申请已提交')
    await loadCustodyAccount()
  } catch (error: any) {
    Message.error(error.message || '开户申请失败')
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
.mt-8 {
  margin-top: 8px;
}

.mt-16 {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 8px;
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
