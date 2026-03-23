import { get, post, getPage } from '@gongchengcang/utils'
import type { Account, Transaction, SplitRule, FundCustody, PaginationParams, PaginationResult } from '@gongchengcang/types'

export function getAccountList(params: PaginationParams & { merchantId?: string }) {
  return getPage<Account>('/finance/account/list', params)
}

export function getAccountDetail(id: string) {
  return get<Account>(`/finance/account/${id}`)
}

export function recharge(data: { merchantId: string; amount: number; remark?: string }) {
  return post<void>('/finance/account/recharge', data)
}

export function withdraw(data: { merchantId: string; amount: number; bankCardId?: string; remark?: string }) {
  return post<void>('/finance/account/withdraw', data)
}

export function getTransactionList(params: PaginationParams & { merchantId?: string; type?: string }) {
  return getPage<Transaction>('/finance/transaction/list', params)
}

export function getSplitRuleList(params: PaginationParams & { merchantId?: string }) {
  return getPage<SplitRule>('/finance/split-rule/list', params)
}

export function getSplitRuleDetail(id: string) {
  return get<SplitRule>(`/finance/split-rule/${id}`)
}

export function createSplitRule(data: Partial<SplitRule>) {
  return post<SplitRule>('/finance/split-rule', data)
}

export function updateSplitRule(id: string, data: Partial<SplitRule>) {
  return post<SplitRule>(`/finance/split-rule/${id}`, data)
}

export function deleteSplitRule(id: string) {
  return post<void>(`/finance/split-rule/${id}/delete`)
}

export function getFundCustodyList(params: PaginationParams & { orderId?: string }) {
  return getPage<FundCustody>('/finance/fund-custody/list', params)
}

export function releaseFundCustody(id: string) {
  return post<void>(`/finance/fund-custody/${id}/release`)
}

export function refundFundCustody(id: string) {
  return post<void>(`/finance/fund-custody/${id}/refund`)
}
