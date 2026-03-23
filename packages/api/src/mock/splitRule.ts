import type {
  SplitRule,
  CreateSplitRuleParams,
  UpdateSplitRuleParams,
  SplitRuleLog,
  PaginationParams,
  PaginationResult,
} from '@gongchengcang/types'
import {
  SplitRuleCategory,
  SplitRuleProductType,
  SplitRuleMerchantType,
  SplitRuleStatus,
  AuditStatus,
} from '@gongchengcang/types'

export const MOCK_SPLIT_RULES: SplitRule[] = [
  {
    ruleId: 'SR001',
    ruleName: '全局默认分账规则',
    ruleCategory: SplitRuleCategory.ALL,
    priority: 4,
    rateValue: 0.35,
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR002',
    ruleName: '钢材分类分账规则',
    ruleCategory: SplitRuleCategory.PRODUCT,
    priority: 3,
    rateValue: 0.30,
    productType: SplitRuleProductType.CATEGORY,
    categoryIds: ['CAT001', 'CAT002'],
    categoryNames: ['钢材', '水泥'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-01-05 00:00:00',
    updatedAt: '2024-01-05 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR003',
    ruleName: '螺纹钢SKU分账规则',
    ruleCategory: SplitRuleCategory.PRODUCT,
    priority: 3,
    rateValue: 0.25,
    productType: SplitRuleProductType.SKU,
    skuIds: ['SKU001', 'SKU002', 'SKU003'],
    skuNames: ['螺纹钢HRB400-12mm', '螺纹钢HRB400-16mm', '螺纹钢HRB400-20mm'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-01-10 00:00:00',
    updatedAt: '2024-01-10 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR010',
    ruleName: '螺纹钢HRB400E-SPU分账规则',
    ruleCategory: SplitRuleCategory.PRODUCT,
    priority: 3,
    rateValue: 0.28,
    productType: SplitRuleProductType.SPU,
    spuIds: ['SPU001'],
    spuNames: ['螺纹钢 HRB400E'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-03-15 00:00:00',
    updatedAt: '2024-03-15 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR011',
    ruleName: '普通硅酸盐水泥-SPU分账规则',
    ruleCategory: SplitRuleCategory.PRODUCT,
    priority: 3,
    rateValue: 0.22,
    productType: SplitRuleProductType.SPU,
    spuIds: ['SPU002'],
    spuNames: ['普通硅酸盐水泥'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-03-16 00:00:00',
    updatedAt: '2024-03-16 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR004',
    ruleName: '工程仓类型分账规则',
    ruleCategory: SplitRuleCategory.MERCHANT,
    priority: 2,
    rateValue: 0.20,
    merchantType: SplitRuleMerchantType.TYPE,
    merchantTypeIds: ['warehouse'],
    merchantTypeNames: ['工程仓'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-02-01 00:00:00',
    updatedAt: '2024-02-01 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR005',
    ruleName: '华东华南工程仓分账规则',
    ruleCategory: SplitRuleCategory.MERCHANT,
    priority: 2,
    rateValue: 0.18,
    merchantType: SplitRuleMerchantType.SPECIFIC,
    merchantIds: ['M001', 'M002'],
    merchantNames: ['华东工程仓', '华南工程仓'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-02-05 00:00:00',
    updatedAt: '2024-02-05 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR006',
    ruleName: '工程仓+钢材分类分账规则',
    ruleCategory: SplitRuleCategory.MERCHANT_PRODUCT,
    priority: 1,
    rateValue: 0.15,
    merchantType: SplitRuleMerchantType.TYPE,
    merchantTypeIds: ['warehouse'],
    merchantTypeNames: ['工程仓'],
    productType: SplitRuleProductType.CATEGORY,
    categoryIds: ['CAT001'],
    categoryNames: ['钢材'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-02-10 00:00:00',
    updatedAt: '2024-02-10 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR007',
    ruleName: '华东仓+螺纹钢SKU分账规则',
    ruleCategory: SplitRuleCategory.MERCHANT_PRODUCT,
    priority: 1,
    rateValue: 0.10,
    merchantType: SplitRuleMerchantType.SPECIFIC,
    merchantIds: ['M001'],
    merchantNames: ['华东工程仓'],
    productType: SplitRuleProductType.SKU,
    skuIds: ['SKU001', 'SKU002'],
    skuNames: ['螺纹钢HRB400-12mm', '螺纹钢HRB400-16mm'],
    isPermanent: 1,
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-03-01 00:00:00',
    updatedAt: '2024-03-01 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR008',
    ruleName: '限时促销分账规则',
    ruleCategory: SplitRuleCategory.PRODUCT,
    priority: 3,
    rateValue: 0.20,
    productType: SplitRuleProductType.CATEGORY,
    categoryIds: ['CAT003'],
    categoryNames: ['管材'],
    isPermanent: 0,
    effectiveStart: '2024-06-01 00:00:00',
    effectiveEnd: '2024-06-30 23:59:59',
    status: SplitRuleStatus.ACTIVE,
    auditStatus: AuditStatus.APPROVED,
    version: 1,
    createdAt: '2024-05-25 00:00:00',
    updatedAt: '2024-05-25 00:00:00',
    createdBy: 'admin',
  },
  {
    ruleId: 'SR009',
    ruleName: '待审核分账规则',
    ruleCategory: SplitRuleCategory.MERCHANT,
    priority: 2,
    rateValue: 0.16,
    merchantType: SplitRuleMerchantType.SPECIFIC,
    merchantIds: ['M003'],
    merchantNames: ['华北工程仓'],
    isPermanent: 1,
    status: SplitRuleStatus.PENDING,
    auditStatus: AuditStatus.PENDING,
    version: 1,
    createdAt: '2024-06-01 00:00:00',
    updatedAt: '2024-06-01 00:00:00',
    createdBy: 'admin',
  },
]

const MOCK_SPLIT_RULE_LOGS: SplitRuleLog[] = [
  {
    logId: 'LOG001',
    ruleId: 'SR001',
    ruleName: '全局默认分账规则',
    operationType: 'create',
    operator: 'admin',
    operatedAt: '2024-01-01 00:00:00',
    remark: '创建规则',
  },
  {
    logId: 'LOG002',
    ruleId: 'SR001',
    ruleName: '全局默认分账规则',
    operationType: 'audit',
    operator: 'admin',
    operatedAt: '2024-01-01 01:00:00',
    remark: '审核通过',
  },
  {
    logId: 'LOG003',
    ruleId: 'SR002',
    ruleName: '钢材分类分账规则',
    operationType: 'create',
    operator: 'admin',
    operatedAt: '2024-01-05 00:00:00',
    remark: '创建规则',
  },
]

export function getMockSplitRuleList(
  params: PaginationParams & {
    keyword?: string
    ruleCategory?: SplitRuleCategory
    status?: SplitRuleStatus
  }
): PaginationResult<SplitRule> {
  let list = [...MOCK_SPLIT_RULES]

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(
      r =>
        r.ruleName.toLowerCase().includes(keyword) ||
        r.ruleId.toLowerCase().includes(keyword)
    )
  }

  if (params.ruleCategory) {
    list = list.filter(r => r.ruleCategory === params.ruleCategory)
  }

  if (params.status) {
    list = list.filter(r => r.status === params.status)
  }

  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize

  return {
    list: list.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

export function getMockSplitRuleDetail(ruleId: string): SplitRule | null {
  return MOCK_SPLIT_RULES.find(r => r.ruleId === ruleId) || null
}

export function createMockSplitRule(data: CreateSplitRuleParams): SplitRule {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const newRule: SplitRule = {
    ruleId: 'SR' + String(MOCK_SPLIT_RULES.length + 1).padStart(3, '0'),
    ruleName: data.ruleName,
    ruleCategory: data.ruleCategory,
    priority: data.priority,
    rateValue: data.rateValue,
    productType: data.productType,
    merchantType: data.merchantType,
    categoryIds: data.categoryIds,
    categoryNames: data.categoryNames,
    spuIds: data.spuIds,
    spuNames: data.spuNames,
    skuIds: data.skuIds,
    skuNames: data.skuNames,
    merchantTypeIds: data.merchantTypeIds,
    merchantTypeNames: data.merchantTypeNames,
    merchantIds: data.merchantIds,
    merchantNames: data.merchantNames,
    isPermanent: data.isPermanent ?? 1,
    effectiveStart: data.effectiveStart,
    effectiveEnd: data.effectiveEnd,
    status: SplitRuleStatus.DRAFT,
    auditStatus: AuditStatus.PENDING,
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: 'admin',
  }
  MOCK_SPLIT_RULES.push(newRule)
  return newRule
}

export function updateMockSplitRule(
  ruleId: string,
  data: UpdateSplitRuleParams
): SplitRule | null {
  const index = MOCK_SPLIT_RULES.findIndex(r => r.ruleId === ruleId)
  if (index === -1) return null

  const rule = MOCK_SPLIT_RULES[index]
  if (rule.status !== SplitRuleStatus.DRAFT && rule.status !== SplitRuleStatus.INACTIVE) {
    return null
  }

  MOCK_SPLIT_RULES[index] = {
    ...rule,
    ...data,
    version: rule.version + 1,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SPLIT_RULES[index]
}

export function deleteMockSplitRule(ruleId: string): boolean {
  const index = MOCK_SPLIT_RULES.findIndex(r => r.ruleId === ruleId)
  if (index === -1) return false

  const rule = MOCK_SPLIT_RULES[index]
  if (rule.status !== SplitRuleStatus.DRAFT && rule.status !== SplitRuleStatus.INACTIVE) {
    return false
  }

  MOCK_SPLIT_RULES.splice(index, 1)
  return true
}

export function submitMockSplitRuleAudit(ruleId: string): SplitRule | null {
  const index = MOCK_SPLIT_RULES.findIndex(r => r.ruleId === ruleId)
  if (index === -1) return null

  const rule = MOCK_SPLIT_RULES[index]
  if (rule.status !== SplitRuleStatus.DRAFT) return null

  MOCK_SPLIT_RULES[index] = {
    ...rule,
    status: SplitRuleStatus.PENDING,
    auditStatus: AuditStatus.PENDING,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SPLIT_RULES[index]
}

export function auditMockSplitRule(
  ruleId: string,
  approved: boolean,
  remark?: string
): SplitRule | null {
  const index = MOCK_SPLIT_RULES.findIndex(r => r.ruleId === ruleId)
  if (index === -1) return null

  const rule = MOCK_SPLIT_RULES[index]
  if (rule.status !== SplitRuleStatus.PENDING) return null

  MOCK_SPLIT_RULES[index] = {
    ...rule,
    status: approved ? SplitRuleStatus.ACTIVE : SplitRuleStatus.DRAFT,
    auditStatus: approved ? AuditStatus.APPROVED : AuditStatus.REJECTED,
    auditRemark: remark,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SPLIT_RULES[index]
}

export function enableMockSplitRule(ruleId: string): SplitRule | null {
  const index = MOCK_SPLIT_RULES.findIndex(r => r.ruleId === ruleId)
  if (index === -1) return null

  const rule = MOCK_SPLIT_RULES[index]
  if (rule.status !== SplitRuleStatus.INACTIVE) return null

  MOCK_SPLIT_RULES[index] = {
    ...rule,
    status: SplitRuleStatus.ACTIVE,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SPLIT_RULES[index]
}

export function disableMockSplitRule(ruleId: string): SplitRule | null {
  const index = MOCK_SPLIT_RULES.findIndex(r => r.ruleId === ruleId)
  if (index === -1) return null

  const rule = MOCK_SPLIT_RULES[index]
  if (rule.status !== SplitRuleStatus.ACTIVE) return null

  MOCK_SPLIT_RULES[index] = {
    ...rule,
    status: SplitRuleStatus.INACTIVE,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SPLIT_RULES[index]
}

export function getMockSplitRuleLogs(ruleId: string): SplitRuleLog[] {
  return MOCK_SPLIT_RULE_LOGS.filter(l => l.ruleId === ruleId)
}

export function getMockSplitRulesBySpuId(spuId: string): SplitRule[] {
  return MOCK_SPLIT_RULES.filter(r => {
    if (r.status !== SplitRuleStatus.ACTIVE) return false
    if (r.productType === SplitRuleProductType.SPU && r.spuIds?.includes(spuId)) return true
    return false
  })
}

export function getMockSplitRulesBySkuId(skuId: string): SplitRule[] {
  return MOCK_SPLIT_RULES.filter(r => {
    if (r.status !== SplitRuleStatus.ACTIVE) return false
    if (r.productType === SplitRuleProductType.SKU && r.skuIds?.includes(skuId)) return true
    return false
  })
}
