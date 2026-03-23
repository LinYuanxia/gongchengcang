import { post, get } from '@gongchengcang/utils'
import type { Merchant, MerchantFormData, Contract, Qualification, PaginationParams, PaginationResult } from '@gongchengcang/types'
import {
  getMockMerchantList,
  getMockMerchantDetail,
  createMockMerchant,
  updateMockMerchant,
  deleteMockMerchant,
  updateMockMerchantStatus,
  getMockContractList,
  getMockQualificationList
} from './mock/merchant'

const isMock = true

export function getMerchantList(params: PaginationParams & { keyword?: string; tenantType?: string; registrationStatus?: string; enabledStatus?: number }) {
  if (isMock) {
    return Promise.resolve(getMockMerchantList(params))
  }
  return post<PaginationResult<Merchant>>('/merchant/list', params)
}

export function getMerchantDetail(tenantId: string) {
  if (isMock) {
    const merchant = getMockMerchantDetail(tenantId)
    if (!merchant) return Promise.reject(new Error('商户不存在'))
    return Promise.resolve(merchant)
  }
  return get<Merchant>(`/merchant/${tenantId}`)
}

export function createMerchant(data: MerchantFormData) {
  if (isMock) {
    return Promise.resolve(createMockMerchant(data))
  }
  return post<Merchant>('/merchant', data)
}

export function updateMerchant(tenantId: string, data: Partial<MerchantFormData>) {
  if (isMock) {
    const merchant = updateMockMerchant(tenantId, data)
    if (!merchant) return Promise.reject(new Error('商户不存在'))
    return Promise.resolve(merchant)
  }
  return post<Merchant>(`/merchant/${tenantId}`, data)
}

export function deleteMerchant(tenantId: string) {
  if (isMock) {
    const success = deleteMockMerchant(tenantId)
    if (!success) return Promise.reject(new Error('删除失败'))
    return Promise.resolve()
  }
  return post<void>(`/merchant/${tenantId}/delete`)
}

export function auditMerchant(tenantId: string, registrationStatus: string, remark?: string) {
  return post<void>(`/merchant/${tenantId}/audit`, { registrationStatus, remark })
}

export function updateMerchantStatus(tenantId: string, enabledStatus: number) {
  if (isMock) {
    const success = updateMockMerchantStatus(tenantId, enabledStatus)
    if (!success) return Promise.reject(new Error('状态更新失败'))
    return Promise.resolve()
  }
  return post<void>(`/merchant/${tenantId}/status`, { enabledStatus })
}

export function getContractList(params: PaginationParams & { tenantId?: string; contractType?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve(getMockContractList(params))
  }
  return post<PaginationResult<Contract>>('/merchant/contract/list', params)
}

export function getContractDetail(contractId: string) {
  return get<Contract>(`/merchant/contract/${contractId}`)
}

export function createContract(tenantId: string, data: Omit<Contract, 'contractId' | 'tenantId' | 'status' | 'createdAt' | 'updatedAt'>) {
  return post<Contract>(`/merchant/${tenantId}/contract`, data)
}

export function updateContract(contractId: string, data: Partial<Contract>) {
  return post<Contract>(`/merchant/contract/${contractId}`, data)
}

export function deleteContract(contractId: string) {
  return post<void>(`/merchant/contract/${contractId}/delete`)
}

export function invalidateContract(contractId: string) {
  return post<void>(`/merchant/contract/${contractId}/invalidate`)
}

export function getQualificationList(params: PaginationParams & { tenantId?: string; qualType?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve(getMockQualificationList(params))
  }
  return post<PaginationResult<Qualification>>('/merchant/qualification/list', params)
}

export function getQualificationDetail(qualId: string) {
  return get<Qualification>(`/merchant/qualification/${qualId}`)
}

export function createQualification(tenantId: string, data: Omit<Qualification, 'qualId' | 'tenantId' | 'status' | 'createdAt' | 'updatedAt'>) {
  return post<Qualification>(`/merchant/${tenantId}/qualification`, data)
}

export function updateQualification(qualId: string, data: Partial<Qualification>) {
  return post<Qualification>(`/merchant/qualification/${qualId}`, data)
}

export function deleteQualification(qualId: string) {
  return post<void>(`/merchant/qualification/${qualId}/delete`)
}
