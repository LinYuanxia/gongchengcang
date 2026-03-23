import {
  TenantType,
  RegistrationStatus,
  EnabledStatus,
  EnterpriseType,
  TaxPayerType,
  ContractType,
  ContractStatus,
  QualificationStatus,
  QualificationType,
  QUALIFICATION_TYPE_MAP,
  CustodyAccountStatus,
  CustodyOpenStatus,
  CustodyBindCardStatus,
  CustodyOpenApplyType,
  CustodyOpenAuditStatus,
  CustodyCardType,
  CustodyCardBindStatus
} from '@gongchengcang/types'

export const TENANT_TYPE_OPTIONS = [
  { label: '材料供应商', value: TenantType.SUPPLIER },
  { label: '施工方', value: TenantType.CONSTRUCTOR },
  { label: '工程仓库', value: TenantType.WAREHOUSE },
]

export const TENANT_TYPE_MAP: Record<TenantType, { label: string; color: string }> = {
  [TenantType.SUPPLIER]: { label: '材料供应商', color: 'cyan' },
  [TenantType.CONSTRUCTOR]: { label: '施工方', color: 'purple' },
  [TenantType.WAREHOUSE]: { label: '工程仓库', color: 'arcoblue' },
}

export const REGISTRATION_STATUS_OPTIONS = [
  { label: '待审核', value: RegistrationStatus.PENDING },
  { label: '已入驻', value: RegistrationStatus.APPROVED },
  { label: '已注销', value: RegistrationStatus.CANCELLED },
  { label: '审核失败', value: RegistrationStatus.REJECTED },
]

export const REGISTRATION_STATUS_MAP: Record<RegistrationStatus, { label: string; color: string }> = {
  [RegistrationStatus.PENDING]: { label: '待审核', color: 'orange' },
  [RegistrationStatus.APPROVED]: { label: '已入驻', color: 'green' },
  [RegistrationStatus.CANCELLED]: { label: '已注销', color: 'gray' },
  [RegistrationStatus.REJECTED]: { label: '审核失败', color: 'red' },
}

export const ENABLED_STATUS_OPTIONS = [
  { label: '启用', value: EnabledStatus.ENABLED },
  { label: '停用', value: EnabledStatus.DISABLED },
]

export const ENABLED_STATUS_MAP: Record<EnabledStatus, { label: string; color: string }> = {
  [EnabledStatus.ENABLED]: { label: '启用', color: 'green' },
  [EnabledStatus.DISABLED]: { label: '停用', color: 'gray' },
}

export const ENTERPRISE_TYPE_OPTIONS = [
  { label: '个体工商户', value: EnterpriseType.INDIVIDUAL },
  { label: '公司', value: EnterpriseType.COMPANY },
]

export const TAX_PAYER_TYPE_OPTIONS = [
  { label: '一般纳税人', value: TaxPayerType.GENERAL },
  { label: '小规模纳税人', value: TaxPayerType.SMALL },
]

export const CONTRACT_TYPE_OPTIONS = [
  { label: '入驻合同', value: ContractType.SETTLEMENT },
  { label: '采购合同', value: ContractType.PURCHASE },
  { label: '销售合同', value: ContractType.SALES },
  { label: '其他合同', value: ContractType.OTHER },
]

export const CONTRACT_TYPE_MAP: Record<ContractType, { label: string; color: string }> = {
  [ContractType.SETTLEMENT]: { label: '入驻合同', color: 'blue' },
  [ContractType.PURCHASE]: { label: '采购合同', color: 'cyan' },
  [ContractType.SALES]: { label: '销售合同', color: 'purple' },
  [ContractType.OTHER]: { label: '其他合同', color: 'gray' },
}

export const CONTRACT_STATUS_OPTIONS = [
  { label: '有效', value: ContractStatus.VALID },
  { label: '作废', value: ContractStatus.INVALID },
]

export const CONTRACT_STATUS_MAP: Record<ContractStatus, { label: string; color: string }> = {
  [ContractStatus.VALID]: { label: '有效', color: 'green' },
  [ContractStatus.INVALID]: { label: '作废', color: 'gray' },
}

export const QUALIFICATION_STATUS_OPTIONS = [
  { label: '有效', value: QualificationStatus.VALID },
  { label: '已过期', value: QualificationStatus.EXPIRED },
  { label: '待更新', value: QualificationStatus.PENDING_UPDATE },
]

export const QUALIFICATION_STATUS_MAP: Record<QualificationStatus, { label: string; color: string }> = {
  [QualificationStatus.VALID]: { label: '有效', color: 'green' },
  [QualificationStatus.EXPIRED]: { label: '已过期', color: 'red' },
  [QualificationStatus.PENDING_UPDATE]: { label: '待更新', color: 'orange' },
}

export const QUALIFICATION_TYPE_OPTIONS = Object.entries(QUALIFICATION_TYPE_MAP).map(([value, label]) => ({
  label,
  value,
}))

export { QUALIFICATION_TYPE_MAP }

export const CUSTODY_ACCOUNT_STATUS_OPTIONS = [
  { label: '开户中', value: CustodyAccountStatus.OPENING },
  { label: '正常', value: CustodyAccountStatus.NORMAL },
  { label: '冻结', value: CustodyAccountStatus.FROZEN },
  { label: '注销', value: CustodyAccountStatus.CANCELLED },
]

export const CUSTODY_ACCOUNT_STATUS_MAP: Record<CustodyAccountStatus, { label: string; color: string }> = {
  [CustodyAccountStatus.OPENING]: { label: '开户中', color: 'blue' },
  [CustodyAccountStatus.NORMAL]: { label: '正常', color: 'green' },
  [CustodyAccountStatus.FROZEN]: { label: '冻结', color: 'orange' },
  [CustodyAccountStatus.CANCELLED]: { label: '注销', color: 'gray' },
}

export const CUSTODY_OPEN_STATUS_OPTIONS = [
  { label: '未开户', value: CustodyOpenStatus.NOT_OPENED },
  { label: '开户中', value: CustodyOpenStatus.OPENING },
  { label: '已开户', value: CustodyOpenStatus.OPENED },
  { label: '开户失败', value: CustodyOpenStatus.FAILED },
]

export const CUSTODY_OPEN_STATUS_MAP: Record<CustodyOpenStatus, { label: string; color: string }> = {
  [CustodyOpenStatus.NOT_OPENED]: { label: '未开户', color: 'gray' },
  [CustodyOpenStatus.OPENING]: { label: '开户中', color: 'blue' },
  [CustodyOpenStatus.OPENED]: { label: '已开户', color: 'green' },
  [CustodyOpenStatus.FAILED]: { label: '开户失败', color: 'red' },
}

export const CUSTODY_BIND_CARD_STATUS_OPTIONS = [
  { label: '未绑卡', value: CustodyBindCardStatus.NOT_BOUND },
  { label: '已绑卡', value: CustodyBindCardStatus.BOUND },
  { label: '绑卡中', value: CustodyBindCardStatus.BINDING },
  { label: '绑卡失败', value: CustodyBindCardStatus.BIND_FAILED },
]

export const CUSTODY_BIND_CARD_STATUS_MAP: Record<CustodyBindCardStatus, { label: string; color: string }> = {
  [CustodyBindCardStatus.NOT_BOUND]: { label: '未绑卡', color: 'gray' },
  [CustodyBindCardStatus.BOUND]: { label: '已绑卡', color: 'green' },
  [CustodyBindCardStatus.BINDING]: { label: '绑卡中', color: 'blue' },
  [CustodyBindCardStatus.BIND_FAILED]: { label: '绑卡失败', color: 'red' },
}

export const CUSTODY_OPEN_APPLY_TYPE_OPTIONS = [
  { label: '首次开户', value: CustodyOpenApplyType.FIRST },
  { label: '重新开户', value: CustodyOpenApplyType.RETRY },
]

export const CUSTODY_OPEN_APPLY_TYPE_MAP: Record<CustodyOpenApplyType, { label: string; color: string }> = {
  [CustodyOpenApplyType.FIRST]: { label: '首次开户', color: 'blue' },
  [CustodyOpenApplyType.RETRY]: { label: '重新开户', color: 'orange' },
}

export const CUSTODY_OPEN_AUDIT_STATUS_OPTIONS = [
  { label: '待审核', value: CustodyOpenAuditStatus.PENDING },
  { label: '审核中', value: CustodyOpenAuditStatus.AUDITING },
  { label: '通过', value: CustodyOpenAuditStatus.PASSED },
  { label: '拒绝', value: CustodyOpenAuditStatus.REJECTED },
]

export const CUSTODY_OPEN_AUDIT_STATUS_MAP: Record<CustodyOpenAuditStatus, { label: string; color: string }> = {
  [CustodyOpenAuditStatus.PENDING]: { label: '待审核', color: 'orange' },
  [CustodyOpenAuditStatus.AUDITING]: { label: '审核中', color: 'blue' },
  [CustodyOpenAuditStatus.PASSED]: { label: '通过', color: 'green' },
  [CustodyOpenAuditStatus.REJECTED]: { label: '拒绝', color: 'red' },
}

export const CUSTODY_CARD_TYPE_OPTIONS = [
  { label: '对公账户', value: CustodyCardType.CORPORATE },
  { label: '对私账户', value: CustodyCardType.PERSONAL },
]

export const CUSTODY_CARD_TYPE_MAP: Record<CustodyCardType, { label: string; color: string }> = {
  [CustodyCardType.CORPORATE]: { label: '对公账户', color: 'blue' },
  [CustodyCardType.PERSONAL]: { label: '对私账户', color: 'purple' },
}

export const CUSTODY_CARD_BIND_STATUS_OPTIONS = [
  { label: '绑定中', value: CustodyCardBindStatus.BINDING },
  { label: '已绑定', value: CustodyCardBindStatus.BOUND },
  { label: '绑定失败', value: CustodyCardBindStatus.BIND_FAILED },
  { label: '已解绑', value: CustodyCardBindStatus.UNBOUND },
]

export const CUSTODY_CARD_BIND_STATUS_MAP: Record<CustodyCardBindStatus, { label: string; color: string }> = {
  [CustodyCardBindStatus.BINDING]: { label: '绑定中', color: 'blue' },
  [CustodyCardBindStatus.BOUND]: { label: '已绑定', color: 'green' },
  [CustodyCardBindStatus.BIND_FAILED]: { label: '绑定失败', color: 'red' },
  [CustodyCardBindStatus.UNBOUND]: { label: '已解绑', color: 'gray' },
}
