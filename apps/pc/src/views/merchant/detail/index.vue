<template>
  <div class="merchant-detail">
    <a-page-header
      :title="merchantInfo.merchantName || '商户详情'"
      :subtitle="getMerchantSubtitle()"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="handleEdit">
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-button type="primary" @click="handleEnterSystem">
            <template #icon><icon-launch /></template>
            进入系统
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-spin :loading="loading" style="width: 100%">
      <a-card class="info-card mt-16">
        <a-row :gutter="24">
          <a-col :span="6">
            <div class="info-item">
              <div class="info-icon">
                <icon-user-group :size="24" />
              </div>
              <div class="info-content">
                <div class="info-label">商户身份</div>
                <div class="info-value">
                  <a-tag :color="TENANT_TYPE_MAP[merchantInfo.tenantType]?.color" size="large">
                    {{ TENANT_TYPE_MAP[merchantInfo.tenantType]?.label || '-' }}
                  </a-tag>
                </div>
                <div class="info-desc">{{ getTenantTypeDesc(merchantInfo.tenantType) }}</div>
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="info-item">
              <div class="info-icon">
                <icon-file :size="24" />
              </div>
              <div class="info-content">
                <div class="info-label">入驻审核</div>
                <div class="info-value">
                  <a-tag :color="REGISTRATION_STATUS_MAP[merchantInfo.registrationStatus]?.color" size="large">
                    {{ REGISTRATION_STATUS_MAP[merchantInfo.registrationStatus]?.label || '-' }}
                  </a-tag>
                </div>
                <div class="info-desc">{{ getRegistrationDesc(merchantInfo.registrationStatus) }}</div>
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="info-item">
              <div class="info-icon">
                <icon-poweroff :size="24" />
              </div>
              <div class="info-content">
                <div class="info-label">系统状态</div>
                <div class="info-value">
                  <a-switch
                    v-model="merchantInfo.enabledStatus"
                    :checked-value="1"
                    :unchecked-value="0"
                    :disabled="merchantInfo.registrationStatus !== 'approved'"
                    @change="handleStatusChange"
                  />
                  <span class="status-text" :class="{ active: merchantInfo.enabledStatus === 1 }">
                    {{ merchantInfo.enabledStatus === 1 ? '已启用' : '已停用' }}
                  </span>
                </div>
                <div class="info-desc">{{ merchantInfo.enabledStatus === 1 ? '商户可正常使用系统' : '商户无法登录系统' }}</div>
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="info-item">
              <div class="info-icon">
                <icon-safe :size="24" />
              </div>
              <div class="info-content">
                <div class="info-label">资金托管</div>
                <div class="info-value">
                  <template v-if="custodyAccount">
                    <span class="money">¥{{ formatMoney(custodyAccount.totalBalance) }}</span>
                  </template>
                  <template v-else>
                    <a-tag color="gray" size="large">未开通</a-tag>
                  </template>
                </div>
                <div class="info-desc">{{ custodyAccount ? '账户余额' : '需开通托管账户进行资金管理' }}</div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <a-card class="process-card mt-16" v-if="merchantInfo.registrationStatus !== 'approved'">
        <template #title>
          <icon-check-circle /> 入驻流程
        </template>
        <a-steps :current="getCurrentStep()" :status="getStepStatus()">
          <a-step title="提交申请">
            <template #description>
              <div>商户提交入驻资料</div>
              <div class="step-time">{{ merchantInfo.createdAt }}</div>
            </template>
          </a-step>
          <a-step title="平台审核">
            <template #description>
              <div>审核企业资质信息</div>
              <div class="step-time" v-if="merchantInfo.registrationStatus === 'rejected'">审核未通过</div>
            </template>
          </a-step>
          <a-step title="开通账户">
            <template #description>
              <div>开通托管账户</div>
            </template>
          </a-step>
          <a-step title="入驻完成">
            <template #description>
              <div>开始使用系统</div>
            </template>
          </a-step>
        </a-steps>
      </a-card>

      <a-tabs v-model:active-key="activeTab" type="rounded" class="mt-16">
        <a-tab-pane key="basic" title="基本信息">
          <a-descriptions title="基础信息" :column="2" bordered>
            <a-descriptions-item label="租户ID">{{ merchantInfo.tenantId }}</a-descriptions-item>
            <a-descriptions-item label="商户名称">{{ merchantInfo.merchantName }}</a-descriptions-item>
            <a-descriptions-item label="联系人">{{ merchantInfo.contactPerson }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ merchantInfo.contactPhone }}</a-descriptions-item>
            <a-descriptions-item label="联系邮箱">{{ merchantInfo.contactEmail || '-' }}</a-descriptions-item>
            <a-descriptions-item label="联系地址">{{ merchantInfo.contactAddress || '-' }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ merchantInfo.createdAt }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ merchantInfo.updatedAt || '-' }}</a-descriptions-item>
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
        </a-tab-pane>

        <a-tab-pane key="contract" title="合同信息">
          <a-card :bordered="false">
            <template #extra>
              <a-button type="primary" size="small" @click="handleAddContract">
                <template #icon><icon-plus /></template>
                添加合同
              </a-button>
            </template>
            <a-table :data="contracts" :pagination="false">
              <template #columns>
                <a-table-column title="合同编号" data-index="contractNo" :width="150">
                  <template #cell="{ record }">
                    <a-link @click="viewContract(record)">{{ record.contractNo }}</a-link>
                  </template>
                </a-table-column>
                <a-table-column title="合同类型" :width="120">
                  <template #cell="{ record }">
                    <a-tag :color="CONTRACT_TYPE_MAP[record.contractType]?.color">
                      {{ CONTRACT_TYPE_MAP[record.contractType]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="签署日期" data-index="signDate" :width="120" />
                <a-table-column title="有效期" :width="200">
                  <template #cell="{ record }">
                    {{ record.contractStartDate }} 至 {{ record.contractEndDate || '长期' }}
                  </template>
                </a-table-column>
                <a-table-column title="签署人" data-index="signPerson" :width="100" />
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="CONTRACT_STATUS_MAP[record.status]?.color">
                      {{ CONTRACT_STATUS_MAP[record.status]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="附件" :width="100">
                  <template #cell="{ record }">
                    <a-button v-if="record.attachment" type="text" size="small" @click="downloadContract(record)">
                      <icon-download />
                    </a-button>
                    <span v-else>-</span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="qualification" title="资质信息">
          <a-card :bordered="false">
            <template #extra>
              <a-button type="primary" size="small" @click="handleAddQualification">
                <template #icon><icon-plus /></template>
                添加资质
              </a-button>
            </template>
            <a-table :data="qualifications" :pagination="false">
              <template #columns>
                <a-table-column title="资质名称" data-index="qualName" :width="150" />
                <a-table-column title="证书编号" data-index="certNo" :width="150" />
                <a-table-column title="发证机构" data-index="issueOrg" :width="150" />
                <a-table-column title="发证日期" data-index="issueDate" :width="120" />
                <a-table-column title="有效期至" data-index="expireDate" :width="120">
                  <template #cell="{ record }">
                    <span :class="{ 'text-danger': isExpired(record.expireDate) }">
                      {{ record.expireDate || '长期' }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="QUALIFICATION_STATUS_MAP[record.status]?.color">
                      {{ QUALIFICATION_STATUS_MAP[record.status]?.label }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="证书图片" :width="100">
                  <template #cell="{ record }">
                    <a-image v-if="record.certPic" :src="record.certPic" width="60" height="60" fit="cover" />
                    <span v-else>-</span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="custody" title="托管账户">
          <a-spin :loading="custodyLoading">
            <template v-if="custodyAccount">
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-card>
                    <a-statistic title="可用余额" :value="custodyAccount.availableBalance" :precision="2">
                      <template #prefix>¥</template>
                    </a-statistic>
                  </a-card>
                </a-col>
                <a-col :span="8">
                  <a-card>
                    <a-statistic title="冻结余额" :value="custodyAccount.frozenBalance" :precision="2">
                      <template #prefix>¥</template>
                    </a-statistic>
                  </a-card>
                </a-col>
                <a-col :span="8">
                  <a-card>
                    <a-statistic title="总余额" :value="custodyAccount.totalBalance" :precision="2">
                      <template #prefix>¥</template>
                    </a-statistic>
                  </a-card>
                </a-col>
              </a-row>

              <a-descriptions title="账户信息" :column="2" bordered class="mt-16">
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
                <a-descriptions-item label="绑卡状态">
                  <a-tag :color="CUSTODY_BIND_CARD_STATUS_MAP[custodyAccount.bindCardStatus]?.color">
                    {{ CUSTODY_BIND_CARD_STATUS_MAP[custodyAccount.bindCardStatus]?.label }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="绑卡时间">{{ custodyAccount.bindCardTime || '-' }}</a-descriptions-item>
                <a-descriptions-item label="开户失败原因" :span="2">{{ custodyAccount.openFailReason || '-' }}</a-descriptions-item>
              </a-descriptions>

              <a-card title="绑卡记录" class="mt-16" :bordered="false">
                <a-table :data="custodyAccount.bankCards || []" :pagination="false">
                  <template #columns>
                    <a-table-column title="银行名称" data-index="bankName" :width="150" />
                    <a-table-column title="银行账号" :width="180">
                      <template #cell="{ record }">
                        {{ record.bankAccountMasked || record.bankAccount }}
                      </template>
                    </a-table-column>
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
              </a-card>

              <a-card title="开户记录" class="mt-16" :bordered="false">
                <a-table :data="custodyAccount.openRecords || []" :pagination="false">
                  <template #columns>
                    <a-table-column title="申请类型" :width="120">
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
                  </template>
                </a-table>
              </a-card>
            </template>
            <a-empty v-else description="暂未开通托管账户">
              <a-button type="primary" @click="handleApplyOpen">发起开户</a-button>
            </a-empty>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="users" title="账号管理">
          <a-card :bordered="false">
            <template #extra>
              <a-button type="primary" size="small" @click="handleAddUser">
                <template #icon><icon-plus /></template>
                添加账号
              </a-button>
            </template>
            <a-table :data="users" :pagination="false">
              <template #columns>
                <a-table-column title="用户名" data-index="username" :width="150" />
                <a-table-column title="姓名" data-index="realName" :width="120" />
                <a-table-column title="手机号" data-index="phone" :width="130" />
                <a-table-column title="角色" :width="120">
                  <template #cell="{ record }">
                    <a-tag v-for="role in record.roles" :key="role" color="blue" style="margin-right: 4px">
                      {{ role }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 1 ? 'green' : 'red'">
                      {{ record.status === 1 ? '启用' : '禁用' }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="最后登录" data-index="lastLoginTime" :width="160" />
                <a-table-column title="创建时间" data-index="createdAt" :width="160" />
                <a-table-column title="操作" :width="150" fixed="right">
                  <template #cell="{ record }">
                    <a-space>
                      <a-button type="text" size="small" @click="handleEditUser(record)">编辑</a-button>
                      <a-button type="text" size="small" @click="handleResetPassword(record)">重置密码</a-button>
                    </a-space>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="logs" title="操作日志">
          <a-card :bordered="false">
            <a-table :data="logs" :pagination="logPagination" @page-change="handleLogPageChange">
              <template #columns>
                <a-table-column title="操作时间" data-index="operateTime" :width="160" />
                <a-table-column title="操作类型" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="getLogTypeColor(record.operateType)">
                      {{ record.operateType }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="操作内容" data-index="operateContent" />
                <a-table-column title="操作人" data-index="operator" :width="120" />
                <a-table-column title="IP地址" data-index="ip" :width="130" />
                <a-table-column title="操作结果" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="record.result === 'success' ? 'green' : 'red'">
                      {{ record.result === 'success' ? '成功' : '失败' }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const custodyLoading = ref(false)
const activeTab = ref('basic')
const merchantInfo = ref<Merchant>({} as Merchant)
const contracts = ref<Contract[]>([])
const qualifications = ref<Qualification[]>([])
const custodyAccount = ref<CustodyAccount | null>(null)

const users = ref([
  { id: '1', username: 'admin', realName: '管理员', phone: '13800138000', roles: ['管理员'], status: 1, lastLoginTime: '2024-03-25 10:00:00', createdAt: '2024-01-01 00:00:00' },
  { id: '2', username: 'operator1', realName: '操作员1', phone: '13800138001', roles: ['操作员'], status: 1, lastLoginTime: '2024-03-24 16:30:00', createdAt: '2024-02-15 00:00:00' },
])

const logs = ref([
  { id: '1', operateTime: '2024-03-25 14:30:00', operateType: '登录', operateContent: '用户登录系统', operator: 'admin', ip: '192.168.1.100', result: 'success' },
  { id: '2', operateTime: '2024-03-25 10:00:00', operateType: '修改', operateContent: '修改商户基本信息', operator: '平台管理员', ip: '192.168.1.1', result: 'success' },
  { id: '3', operateTime: '2024-03-24 16:00:00', operateType: '审核', operateContent: '审核通过商户入驻申请', operator: '平台管理员', ip: '192.168.1.1', result: 'success' },
  { id: '4', operateTime: '2024-03-24 15:30:00', operateType: '提交', operateContent: '提交商户入驻申请', operator: '商户联系人', ip: '192.168.1.50', result: 'success' },
])

const logPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

onMounted(() => {
  loadData()
})

async function loadData() {
  const tenantId = route.query.id as string
  if (!tenantId) {
    Message.error('缺少商户ID参数')
    return
  }

  loading.value = true
  try {
    const [merchant, contractRes, qualRes] = await Promise.all([
      getMerchantDetail(tenantId),
      getContractList({ page: 1, pageSize: 100, tenantId }),
      getQualificationList({ page: 1, pageSize: 100, tenantId }),
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
    custodyAccount.value = await getCustodyAccountByTenant(merchantInfo.value.tenantId)
  } catch (error) {
    custodyAccount.value = null
  } finally {
    custodyLoading.value = false
  }
}

async function handleApplyOpen() {
  try {
    await applyOpenAccount(merchantInfo.value.tenantId)
    Message.success('开户申请已提交')
    await loadCustodyAccount()
  } catch (error: any) {
    Message.error(error.message || '开户申请失败')
  }
}

function getMerchantSubtitle() {
  const typeLabel = TENANT_TYPE_MAP[merchantInfo.value.tenantType]?.label || ''
  const statusLabel = REGISTRATION_STATUS_MAP[merchantInfo.registrationStatus]?.label || ''
  return `${typeLabel} · ${statusLabel}`
}

function getTenantTypeDesc(type: string) {
  const descMap: Record<string, string> = {
    supplier: '向平台提供商品和服务的商家',
    warehouse: '负责商品仓储和配送的仓库',
    constructor: '工程项目施工方，采购建筑材料',
  }
  return descMap[type] || '-'
}

function getRegistrationDesc(status: string) {
  const descMap: Record<string, string> = {
    pending: '等待平台审核入驻资料',
    approved: '入驻审核已通过',
    rejected: '入驻审核未通过，需重新提交',
  }
  return descMap[status] || '-'
}

function getCurrentStep() {
  const stepMap: Record<string, number> = {
    pending: 1,
    approved: 4,
    rejected: 1,
  }
  return stepMap[merchantInfo.value.registrationStatus] || 0
}

function getStepStatus() {
  if (merchantInfo.value.registrationStatus === 'rejected') {
    return 'error'
  }
  return 'process'
}

async function handleStatusChange(val: number | boolean) {
  try {
    Message.success(val === 1 ? '已启用商户' : '已停用商户')
  } catch (error: any) {
    Message.error(error.message || '状态更新失败')
    merchantInfo.value.enabledStatus = val === 1 ? 0 : 1
  }
}

function formatMoney(amount: number) {
  if (!amount) return '0.00'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function handleBack() {
  router.back()
}

function handleEdit() {
  router.push({ path: '/merchant/list', query: { edit: merchantInfo.value.tenantId } })
}

function handleEnterSystem() {
  const tenantType = merchantInfo.value.tenantType
  const tenantId = merchantInfo.value.tenantId
  const token = 'mock_token_' + Date.now()

  let targetPath = ''
  if (tenantType === 'warehouse') {
    targetPath = '/warehouse'
  } else if (tenantType === 'supplier') {
    targetPath = '/supplier'
  } else if (tenantType === 'constructor') {
    targetPath = '/constructor'
  }

  const queryString = new URLSearchParams({
    tenantId,
    token,
  }).toString()

  window.open(`${targetPath}?${queryString}`, '_blank')
  Message.success('正在跳转到商户系统...')
}

function handleAddContract() {
  Message.info('打开添加合同弹窗')
}

function viewContract(record: Contract) {
  Message.info(`查看合同: ${record.contractNo}`)
}

function downloadContract(record: Contract) {
  Message.info(`下载合同: ${record.contractNo}`)
}

function handleAddQualification() {
  Message.info('打开添加资质弹窗')
}

function isExpired(expireDate: string) {
  if (!expireDate) return false
  return new Date(expireDate) < new Date()
}

function handleAddUser() {
  Message.info('打开添加账号弹窗')
}

function handleEditUser(record: any) {
  Message.info(`编辑用户: ${record.username}`)
}

function handleResetPassword(record: any) {
  Message.info(`重置密码: ${record.username}`)
}

function handleLogPageChange(page: number) {
  logPagination.current = page
}

function getLogTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    登录: 'blue',
    修改: 'orange',
    审核: 'green',
    提交: 'cyan',
    删除: 'red',
  }
  return colorMap[type] || 'gray'
}
</script>

<style scoped lang="less">
.merchant-detail {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.ml-8 {
  margin-left: 8px;
}

.info-card {
  :deep(.arco-card-body) {
    padding: 24px;
  }
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .info-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: linear-gradient(135deg, #e8f3ff 0%, #f2f7ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #165dff;
    flex-shrink: 0;
  }

  .info-content {
    flex: 1;
    min-width: 0;

    .info-label {
      font-size: 13px;
      color: var(--color-text-3);
      margin-bottom: 8px;
    }

    .info-value {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .money {
        font-size: 20px;
        font-weight: 600;
        color: #165dff;
      }

      .status-text {
        font-size: 14px;
        color: var(--color-text-3);

        &.active {
          color: #00b42a;
        }
      }
    }

    .info-desc {
      font-size: 12px;
      color: var(--color-text-4);
      line-height: 1.5;
    }
  }
}

.process-card {
  .step-time {
    font-size: 12px;
    color: var(--color-text-4);
    margin-top: 4px;
  }
}

.text-danger {
  color: #f53f3f;
}
</style>
