import { post, get } from '@gongchengcang/utils'
import type {
  SplitRule,
  CreateSplitRuleParams,
  UpdateSplitRuleParams,
  SplitRuleLog,
  PaginationParams,
  PaginationResult,
  SplitRuleCategory,
  SplitRuleStatus,
} from '@gongchengcang/types'
import {
  getMockSplitRuleList,
  getMockSplitRuleDetail,
  createMockSplitRule,
  updateMockSplitRule,
  deleteMockSplitRule,
  submitMockSplitRuleAudit,
  auditMockSplitRule,
  enableMockSplitRule,
  disableMockSplitRule,
  getMockSplitRuleLogs,
  getMockSplitRulesBySpuId,
  getMockSplitRulesBySkuId,
} from './mock/splitRule'

const isMock = true

export function getSplitConfigList(
  params: PaginationParams & {
    keyword?: string
    ruleCategory?: SplitRuleCategory
    status?: SplitRuleStatus
  }
) {
  if (isMock) {
    return Promise.resolve(getMockSplitRuleList(params))
  }
  return post<PaginationResult<SplitRule>>('/split-config/list', params)
}

export function getSplitConfigDetail(ruleId: string) {
  if (isMock) {
    const rule = getMockSplitRuleDetail(ruleId)
    if (!rule) return Promise.reject(new Error('规则不存在'))
    return Promise.resolve(rule)
  }
  return get<SplitRule>(`/split-config/${ruleId}`)
}

export function createSplitConfig(data: CreateSplitRuleParams) {
  if (isMock) {
    return Promise.resolve(createMockSplitRule(data))
  }
  return post<SplitRule>('/split-config', data)
}

export function updateSplitConfig(ruleId: string, data: UpdateSplitRuleParams) {
  if (isMock) {
    const rule = updateMockSplitRule(ruleId, data)
    if (!rule) return Promise.reject(new Error('更新失败，规则不存在或状态不允许'))
    return Promise.resolve(rule)
  }
  return post<SplitRule>(`/split-config/${ruleId}`, data)
}

export function deleteSplitConfig(ruleId: string) {
  if (isMock) {
    const success = deleteMockSplitRule(ruleId)
    if (!success) return Promise.reject(new Error('删除失败，规则不存在或状态不允许'))
    return Promise.resolve()
  }
  return post<void>(`/split-config/${ruleId}/delete`)
}

export function submitSplitConfigAudit(ruleId: string) {
  if (isMock) {
    const rule = submitMockSplitRuleAudit(ruleId)
    if (!rule) return Promise.reject(new Error('提交审核失败，规则不存在或状态不允许'))
    return Promise.resolve(rule)
  }
  return post<SplitRule>(`/split-config/${ruleId}/submit-audit`)
}

export function auditSplitConfig(ruleId: string, approved: boolean, remark?: string) {
  if (isMock) {
    const rule = auditMockSplitRule(ruleId, approved, remark)
    if (!rule) return Promise.reject(new Error('审核失败，规则不存在或状态不允许'))
    return Promise.resolve(rule)
  }
  return post<SplitRule>(`/split-config/${ruleId}/audit`, { approved, remark })
}

export function enableSplitConfig(ruleId: string) {
  if (isMock) {
    const rule = enableMockSplitRule(ruleId)
    if (!rule) return Promise.reject(new Error('启用失败，规则不存在或状态不允许'))
    return Promise.resolve(rule)
  }
  return post<SplitRule>(`/split-config/${ruleId}/enable`)
}

export function disableSplitConfig(ruleId: string) {
  if (isMock) {
    const rule = disableMockSplitRule(ruleId)
    if (!rule) return Promise.reject(new Error('停用失败，规则不存在或状态不允许'))
    return Promise.resolve(rule)
  }
  return post<SplitRule>(`/split-config/${ruleId}/disable`)
}

export function getSplitConfigLogs(ruleId: string) {
  if (isMock) {
    return Promise.resolve(getMockSplitRuleLogs(ruleId))
  }
  return get<SplitRuleLog[]>(`/split-config/${ruleId}/logs`)
}

export function getSplitRulesBySpuId(spuId: string) {
  if (isMock) {
    return Promise.resolve(getMockSplitRulesBySpuId(spuId))
  }
  return get<SplitRule[]>(`/split-config/by-spu/${spuId}`)
}

export function getSplitRulesBySkuId(skuId: string) {
  if (isMock) {
    return Promise.resolve(getMockSplitRulesBySkuId(skuId))
  }
  return get<SplitRule[]>(`/split-config/by-sku/${skuId}`)
}
