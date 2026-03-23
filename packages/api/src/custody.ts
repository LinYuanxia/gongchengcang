import { post, get } from '@gongchengcang/utils'
import type {
  CustodyAccount,
  CustodyOpenRecord,
  CustodyBankCard,
  CustodyBankCardFormData,
  PaginationParams,
  PaginationResult
} from '@gongchengcang/types'
import {
  getMockCustodyAccountList,
  getMockCustodyAccountDetail,
  getMockCustodyAccountByTenant,
  createMockOpenRecord,
  getMockOpenRecordList,
  getMockBankCardList
} from './mock/custody'

const isMock = true

export function getCustodyAccountList(params: PaginationParams & { keyword?: string; accountStatus?: number; openStatus?: number; bindCardStatus?: number }) {
  if (isMock) {
    return Promise.resolve(getMockCustodyAccountList(params))
  }
  return post<PaginationResult<CustodyAccount>>('/custody/account/list', params)
}

export function getCustodyAccountDetail(accountId: string) {
  if (isMock) {
    const account = getMockCustodyAccountDetail(accountId)
    if (!account) return Promise.reject(new Error('托管账户不存在'))
    return Promise.resolve(account)
  }
  return get<CustodyAccount>(`/custody/account/${accountId}`)
}

export function getCustodyAccountByTenant(tenantId: string) {
  if (isMock) {
    const account = getMockCustodyAccountByTenant(tenantId)
    if (!account) return Promise.reject(new Error('托管账户不存在'))
    return Promise.resolve(account)
  }
  return get<CustodyAccount>(`/custody/account/tenant/${tenantId}`)
}

export function applyOpenAccount(tenantId: string) {
  if (isMock) {
    return Promise.resolve(createMockOpenRecord(tenantId))
  }
  return post<CustodyOpenRecord>(`/custody/account/apply/${tenantId}`)
}

export function retryOpenAccount(tenantId: string) {
  return post<CustodyOpenRecord>(`/custody/account/retry/${tenantId}`)
}

export function syncAccountBalance(accountId: string) {
  return post<CustodyAccount>(`/custody/account/${accountId}/sync`)
}

export function getOpenRecordList(params: PaginationParams & { keyword?: string; status?: number; tenantId?: string }) {
  if (isMock) {
    return Promise.resolve(getMockOpenRecordList(params))
  }
  return post<PaginationResult<CustodyOpenRecord>>('/custody/open-record/list', params)
}

export function getOpenRecordDetail(applyId: string) {
  return get<CustodyOpenRecord>(`/custody/open-record/${applyId}`)
}

export function getBankCardList(params: PaginationParams & { keyword?: string; bindStatus?: number; tenantId?: string }) {
  if (isMock) {
    return Promise.resolve(getMockBankCardList(params))
  }
  return post<PaginationResult<CustodyBankCard>>('/custody/bank-card/list', params)
}

export function getBankCardDetail(cardId: string) {
  return get<CustodyBankCard>(`/custody/bank-card/${cardId}`)
}

export function bindBankCard(data: CustodyBankCardFormData) {
  return post<CustodyBankCard>('/custody/bank-card', data)
}

export function rebindBankCard(cardId: string, data: Partial<CustodyBankCardFormData>) {
  return post<CustodyBankCard>(`/custody/bank-card/${cardId}/rebind`, data)
}

export function setDefaultCard(cardId: string) {
  return post<void>(`/custody/bank-card/${cardId}/default`)
}

export function unbindBankCard(cardId: string) {
  return post<void>(`/custody/bank-card/${cardId}/unbind`)
}
