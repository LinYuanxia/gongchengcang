export enum TenantType {
  SUPPLIER = 'supplier',
  CONSTRUCTOR = 'constructor',
  WAREHOUSE = 'warehouse'
}

export type MerchantType = TenantType

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export enum EnabledStatus {
  ENABLED = 1,
  DISABLED = 0
}

export enum EnterpriseType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}

export enum TaxPayerType {
  GENERAL = 'general',
  SMALL = 'small'
}

export interface Merchant {
  tenantId: string
  tenantType: TenantType
  merchantName: string
  contactPerson: string
  contactPhone: string
  registrationStatus: RegistrationStatus
  enabledStatus: EnabledStatus
  remark?: string
  createdAt: string
  updatedAt: string
  enterpriseInfo?: EnterpriseInfo
  settlementAccount?: SettlementAccount
  custodyOpenStatus?: CustodyOpenStatus
  custodyBindCardStatus?: CustodyBindCardStatus
  custodyAccount?: CustodyAccount
}

export interface EnterpriseInfo {
  enterpriseName: string
  enterpriseType: EnterpriseType
  unifiedSocialCreditCode: string
  taxPayerType: TaxPayerType
  legalPersonName: string
  legalPersonIdCard: string
  businessLicensePic: string
  businessLicenseExpire: string
  idCardPicFront: string
  idCardPicBack: string
  registeredAddress?: string
  actualAddress?: string
  registeredCapital?: number
  establishedDate?: string
  businessScope?: string
}

export interface SettlementAccount {
  accountName: string
  bankAccount: string
  bankName: string
  bankBranch: string
  bankBranchCode?: string
}

export interface MerchantFormData {
  basicInfo: {
    tenantType: TenantType
    merchantName: string
    contactPerson: string
    contactPhone: string
    remark?: string
  }
  enterpriseInfo: EnterpriseInfo
  settlementAccount: SettlementAccount
  contracts: ContractFormData[]
  qualifications: QualificationFormData[]
}

export interface Contract {
  contractId: string
  tenantId: string
  contractNo: string
  contractType: ContractType
  contractFile: string
  contractStartDate: string
  contractEndDate?: string
  signDate: string
  status: ContractStatus
  createdAt: string
  updatedAt: string
}

export interface ContractFormData {
  contractNo: string
  contractType: ContractType
  contractFile: string
  contractStartDate: string
  contractEndDate?: string
  signDate: string
}

export enum ContractType {
  SETTLEMENT = 'settlement',
  PURCHASE = 'purchase',
  SALES = 'sales',
  OTHER = 'other'
}

export enum ContractStatus {
  VALID = 1,
  INVALID = 0
}

export interface Qualification {
  qualId: string
  tenantId: string
  qualType: string
  qualName: string
  certNo?: string
  fileUrl: string
  issueDate?: string
  expireDate?: string
  issuingAuthority?: string
  status: QualificationStatus
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface QualificationFormData {
  qualType: string
  qualName: string
  certNo?: string
  fileUrl: string
  issueDate?: string
  expireDate?: string
  issuingAuthority?: string
  remark?: string
}

export enum QualificationStatus {
  VALID = 1,
  EXPIRED = 2,
  PENDING_UPDATE = 3
}

export enum QualificationType {
  CONSTRUCTION_QUAL = 'CONSTRUCTION_QUAL',
  SAFETY_CERT = 'SAFETY_CERT',
  PRODUCTION_LICENSE = 'PRODUCTION_LICENSE',
  QUALITY_CERT = 'QUALITY_CERT',
  OTHER = 'OTHER'
}

export const QUALIFICATION_TYPE_MAP: Record<string, string> = {
  CONSTRUCTION_QUAL: '建筑业企业资质证书',
  SAFETY_CERT: '安全生产许可证',
  PRODUCTION_LICENSE: '生产许可证',
  QUALITY_CERT: '质量认证证书',
  OTHER: '其他资质'
}

export enum CustodyAccountStatus {
  OPENING = 1,
  NORMAL = 2,
  FROZEN = 3,
  CANCELLED = 4
}

export enum CustodyOpenStatus {
  NOT_OPENED = 0,
  OPENING = 1,
  OPENED = 2,
  FAILED = 3
}

export enum CustodyBindCardStatus {
  NOT_BOUND = 0,
  BOUND = 1,
  BINDING = 2,
  BIND_FAILED = 3
}

export interface CustodyAccount {
  accountId: string
  tenantId: string
  merchantName?: string
  accountStatus: CustodyAccountStatus
  openStatus: CustodyOpenStatus
  openTime?: string
  openFailReason?: string
  bindCardStatus: CustodyBindCardStatus
  bindCardTime?: string
  availableBalance: number
  frozenBalance: number
  totalBalance: number
  lastSyncTime?: string
  createdAt: string
  updatedAt: string
  bankCards?: CustodyBankCard[]
  openRecords?: CustodyOpenRecord[]
}

export interface CustodyAccountFormData {
  tenantId: string
}

export enum CustodyOpenApplyType {
  FIRST = 1,
  RETRY = 2
}

export enum CustodyOpenAuditStatus {
  PENDING = 1,
  AUDITING = 2,
  PASSED = 3,
  REJECTED = 4
}

export interface CustodyOpenRecord {
  applyId: string
  tenantId: string
  merchantName?: string
  applyType: CustodyOpenApplyType
  submitTime: string
  status: CustodyOpenAuditStatus
  auditTime?: string
  auditRemark?: string
  failReason?: string
  retryCount: number
  createdAt: string
}

export interface CustodyOpenRecordFormData {
  tenantId: string
  applyType: CustodyOpenApplyType
}

export enum CustodyCardType {
  CORPORATE = 1,
  PERSONAL = 2
}

export enum CustodyCardBindStatus {
  BINDING = 1,
  BOUND = 2,
  BIND_FAILED = 3,
  UNBOUND = 4
}

export interface CustodyBankCard {
  cardId: string
  tenantId: string
  merchantName?: string
  accountId: string
  bankName: string
  bankCode: string
  bankBranch: string
  bankAccount: string
  bankAccountMasked?: string
  accountName: string
  cardType: CustodyCardType
  bindStatus: CustodyCardBindStatus
  bindTime?: string
  isDefault: number
  failReason?: string
  createdAt: string
  updatedAt: string
}

export interface CustodyBankCardFormData {
  tenantId: string
  accountId: string
  bankName: string
  bankCode: string
  bankBranch: string
  bankAccount: string
  accountName: string
  cardType: CustodyCardType
}
