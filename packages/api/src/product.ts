import type {
  ProductCategory,
  ProductAttr,
  Spu,
  Sku,
  ProductOperationLog,
  ProductStatistics,
  AbnormalProduct,
  PaginationParams,
  PaginationResult,
  CreateCategoryParams,
  UpdateCategoryParams,
  CreateAttrParams,
  UpdateAttrParams,
  CreateSpuParams,
  UpdateSpuParams,
  CreateSkuParams,
  UpdateSkuParams,
} from '@gongchengcang/types'
import { SkuStatus } from '@gongchengcang/types'
import {
  getMockCategoryTree,
  getMockCategoryList,
  getMockCategoryDetail,
  createMockCategory,
  updateMockCategory,
  deleteMockCategory,
  getMockAttrList,
  getMockAttrDetail,
  createMockAttr,
  updateMockAttr,
  deleteMockAttr,
  getMockSpuList,
  getMockSpuDetail,
  createMockSpu,
  updateMockSpu,
  deleteMockSpu,
  getMockSkuList,
  getMockSkuDetail,
  createMockSku,
  updateMockSku,
  deleteMockSku,
  batchUpdateMockSkuStatus,
  getMockSkuListBySpu,
  getMockProductStatistics,
  getMockOperationLogs,
  getMockAbnormalProducts,
} from './mock/product'

const isMock = true

export function getCategoryTree() {
  if (isMock) {
    return Promise.resolve(getMockCategoryTree())
  }
  return Promise.resolve([])
}

export function getCategoryList() {
  if (isMock) {
    return Promise.resolve(getMockCategoryList())
  }
  return Promise.resolve([])
}

export function getCategoryDetail(categoryId: string) {
  if (isMock) {
    const category = getMockCategoryDetail(categoryId)
    if (!category) return Promise.reject(new Error('分类不存在'))
    return Promise.resolve(category)
  }
  return Promise.resolve(null)
}

export function createCategory(data: CreateCategoryParams) {
  if (isMock) {
    return Promise.resolve(createMockCategory(data))
  }
  return Promise.resolve(null)
}

export function updateCategory(categoryId: string, data: UpdateCategoryParams) {
  if (isMock) {
    const category = updateMockCategory(categoryId, data)
    if (!category) return Promise.reject(new Error('分类不存在'))
    return Promise.resolve(category)
  }
  return Promise.resolve(null)
}

export function deleteCategory(categoryId: string) {
  if (isMock) {
    const result = deleteMockCategory(categoryId)
    if (!result.success) return Promise.reject(new Error(result.message))
    return Promise.resolve()
  }
  return Promise.resolve()
}

export function getAttrList(params: PaginationParams & { keyword?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve(getMockAttrList(params))
  }
  return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })
}

export function getAttrDetail(attrId: string) {
  if (isMock) {
    const attr = getMockAttrDetail(attrId)
    if (!attr) return Promise.reject(new Error('属性不存在'))
    return Promise.resolve(attr)
  }
  return Promise.resolve(null)
}

export function createAttr(data: CreateAttrParams) {
  if (isMock) {
    return Promise.resolve(createMockAttr(data))
  }
  return Promise.resolve(null)
}

export function updateAttr(attrId: string, data: UpdateAttrParams) {
  if (isMock) {
    const attr = updateMockAttr(attrId, data)
    if (!attr) return Promise.reject(new Error('属性不存在'))
    return Promise.resolve(attr)
  }
  return Promise.resolve(null)
}

export function deleteAttr(attrId: string) {
  if (isMock) {
    const result = deleteMockAttr(attrId)
    if (!result.success) return Promise.reject(new Error(result.message))
    return Promise.resolve()
  }
  return Promise.resolve()
}

export function getSpuList(params: PaginationParams & { keyword?: string; categoryId?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve(getMockSpuList(params))
  }
  return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })
}

export function getSpuDetail(spuId: string) {
  if (isMock) {
    const spu = getMockSpuDetail(spuId)
    if (!spu) return Promise.reject(new Error('SPU不存在'))
    return Promise.resolve(spu)
  }
  return Promise.resolve(null)
}

export function createSpu(data: CreateSpuParams) {
  if (isMock) {
    return Promise.resolve(createMockSpu(data))
  }
  return Promise.resolve(null)
}

export function updateSpu(spuId: string, data: UpdateSpuParams) {
  if (isMock) {
    const spu = updateMockSpu(spuId, data)
    if (!spu) return Promise.reject(new Error('SPU不存在'))
    return Promise.resolve(spu)
  }
  return Promise.resolve(null)
}

export function deleteSpu(spuId: string) {
  if (isMock) {
    const result = deleteMockSpu(spuId)
    if (!result.success) return Promise.reject(new Error(result.message))
    return Promise.resolve()
  }
  return Promise.resolve()
}

export function getSkuList(params: PaginationParams & { keyword?: string; spuId?: string; categoryId?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve(getMockSkuList(params))
  }
  return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })
}

export function getSkuDetail(skuId: string) {
  if (isMock) {
    const sku = getMockSkuDetail(skuId)
    if (!sku) return Promise.reject(new Error('SKU不存在'))
    return Promise.resolve(sku)
  }
  return Promise.resolve(null)
}

export function createSku(data: CreateSkuParams) {
  if (isMock) {
    return Promise.resolve(createMockSku(data))
  }
  return Promise.resolve(null)
}

export function updateSku(skuId: string, data: UpdateSkuParams) {
  if (isMock) {
    const sku = updateMockSku(skuId, data)
    if (!sku) return Promise.reject(new Error('SKU不存在'))
    return Promise.resolve(sku)
  }
  return Promise.resolve(null)
}

export function deleteSku(skuId: string) {
  if (isMock) {
    const result = deleteMockSku(skuId)
    if (!result.success) return Promise.reject(new Error(result.message))
    return Promise.resolve()
  }
  return Promise.resolve()
}

export function batchUpdateSkuStatus(skuIds: string[], status: SkuStatus) {
  if (isMock) {
    batchUpdateMockSkuStatus(skuIds, status)
    return Promise.resolve()
  }
  return Promise.resolve()
}

export function getSkuListBySpu(spuId: string) {
  if (isMock) {
    return Promise.resolve(getMockSkuListBySpu(spuId))
  }
  return Promise.resolve([])
}

export function getProductStatistics() {
  if (isMock) {
    return Promise.resolve(getMockProductStatistics())
  }
  return Promise.resolve(null)
}

export function getOperationLogs(params: PaginationParams & { targetType?: string; targetId?: string }) {
  if (isMock) {
    return Promise.resolve(getMockOperationLogs(params))
  }
  return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })
}

export function getAbnormalProducts(params: PaginationParams & { abnormalType?: string }) {
  if (isMock) {
    return Promise.resolve(getMockAbnormalProducts(params))
  }
  return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })
}
