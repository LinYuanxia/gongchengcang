export enum SplitRuleCategory {
  ALL = 'all',
  PRODUCT = 'product',
  MERCHANT = 'merchant',
  MERCHANT_PRODUCT = 'merchant_product',
}

export enum SplitRuleProductType {
  ALL = 'all',
  CATEGORY = 'category',
  SPU = 'spu',
  SKU = 'sku',
}

export enum SplitRuleMerchantType {
  TYPE = 'type',
  SPECIFIC = 'specific',
}

export enum SplitRuleStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AuditStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const SPLIT_RULE_CATEGORY_OPTIONS = [
  { label: '全部', value: SplitRuleCategory.ALL, priority: 4, description: '默认兜底规则，优先级最低' },
  { label: '商品', value: SplitRuleCategory.PRODUCT, priority: 3, description: '按商品维度设置费率' },
  { label: '商户', value: SplitRuleCategory.MERCHANT, priority: 2, description: '按商户维度设置费率' },
  { label: '商户+商品', value: SplitRuleCategory.MERCHANT_PRODUCT, priority: 1, description: '按商户+商品组合设置费率，优先级最高' },
]

export const SPLIT_RULE_PRODUCT_TYPE_OPTIONS = [
  { label: '全部商品', value: SplitRuleProductType.ALL },
  { label: '商品分类', value: SplitRuleProductType.CATEGORY },
  { label: 'SPU', value: SplitRuleProductType.SPU },
  { label: 'SKU', value: SplitRuleProductType.SKU },
]

export const SPLIT_RULE_MERCHANT_TYPE_OPTIONS = [
  { label: '商户类型', value: SplitRuleMerchantType.TYPE },
  { label: '具体商户', value: SplitRuleMerchantType.SPECIFIC },
]

export const SPLIT_RULE_STATUS_OPTIONS = [
  { label: '草稿', value: SplitRuleStatus.DRAFT },
  { label: '待审核', value: SplitRuleStatus.PENDING },
  { label: '生效中', value: SplitRuleStatus.ACTIVE },
  { label: '已失效', value: SplitRuleStatus.INACTIVE },
]

export const AUDIT_STATUS_OPTIONS = [
  { label: '待审核', value: AuditStatus.PENDING },
  { label: '已通过', value: AuditStatus.APPROVED },
  { label: '已驳回', value: AuditStatus.REJECTED },
]

export const MERCHANT_TYPE_OPTIONS = [
  { label: '供应商', value: 'supplier' },
  { label: '施工方', value: 'constructor' },
  { label: '工程仓', value: 'warehouse' },
]

export interface SplitRule {
  ruleId: string
  ruleName: string
  ruleCategory: SplitRuleCategory
  priority: number
  rateValue: number
  productType?: SplitRuleProductType
  merchantType?: SplitRuleMerchantType
  categoryIds?: string[]
  categoryNames?: string[]
  spuIds?: string[]
  spuNames?: string[]
  skuIds?: string[]
  skuNames?: string[]
  merchantTypeIds?: string[]
  merchantTypeNames?: string[]
  merchantIds?: string[]
  merchantNames?: string[]
  isPermanent: number
  effectiveStart?: string
  effectiveEnd?: string
  status: SplitRuleStatus
  auditStatus: AuditStatus
  auditRemark?: string
  version: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateSplitRuleParams {
  ruleName: string
  ruleCategory: SplitRuleCategory
  priority: number
  rateValue: number
  productType?: SplitRuleProductType
  merchantType?: SplitRuleMerchantType
  categoryIds?: string[]
  categoryNames?: string[]
  spuIds?: string[]
  spuNames?: string[]
  skuIds?: string[]
  skuNames?: string[]
  merchantTypeIds?: string[]
  merchantTypeNames?: string[]
  merchantIds?: string[]
  merchantNames?: string[]
  isPermanent?: number
  effectiveStart?: string
  effectiveEnd?: string
}

export interface UpdateSplitRuleParams {
  ruleName?: string
  ruleCategory?: SplitRuleCategory
  priority?: number
  rateValue?: number
  productType?: SplitRuleProductType
  merchantType?: SplitRuleMerchantType
  categoryIds?: string[]
  categoryNames?: string[]
  spuIds?: string[]
  spuNames?: string[]
  skuIds?: string[]
  skuNames?: string[]
  merchantTypeIds?: string[]
  merchantTypeNames?: string[]
  merchantIds?: string[]
  merchantNames?: string[]
  isPermanent?: number
  effectiveStart?: string
  effectiveEnd?: string
}

export interface SplitRuleVersion {
  versionId: string
  ruleId: string
  version: number
  beforeValue: Partial<SplitRule>
  afterValue: Partial<SplitRule>
  operator: string
  operatedAt: string
  operationType: 'create' | 'update' | 'audit' | 'enable' | 'disable'
}

export interface SplitRuleLog {
  logId: string
  ruleId: string
  ruleName: string
  operationType: 'create' | 'update' | 'audit' | 'enable' | 'disable' | 'delete'
  operator: string
  operatedAt: string
  remark?: string
}
