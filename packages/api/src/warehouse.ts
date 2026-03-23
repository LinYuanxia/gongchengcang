import { get, post, put, del, getPage } from '@gongchengcang/utils'
import type { Warehouse, Stock, StockRecord, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { WarehouseStatus, StockRecordType } from '@gongchengcang/types'
import { getMockWarehouseList, getMockWarehouseDetail, getMockInventoryList } from './mock/warehouse'

const isMock = true

export function getWarehouseList(params: PaginationParams & { keyword?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve(getMockWarehouseList(params))
  }
  return getPage<Warehouse>('/warehouse/list', params)
}

export function getWarehouseDetail(id: string) {
  if (isMock) {
    const warehouse = getMockWarehouseDetail(id)
    if (!warehouse) return Promise.reject(new Error('仓库不存在'))
    return Promise.resolve(warehouse)
  }
  return get<Warehouse>(`/warehouse/${id}`)
}

export function createWarehouse(data: Partial<Warehouse>) {
  return post<Warehouse>('/warehouse', data)
}

export function updateWarehouse(id: string, data: Partial<Warehouse>) {
  return put<Warehouse>(`/warehouse/${id}`, data)
}

export function deleteWarehouse(id: string) {
  return del<void>(`/warehouse/${id}`)
}

export function getStockList(params: PaginationParams & { warehouseId?: string; productId?: string; keyword?: string }) {
  if (isMock) {
    const result = getMockInventoryList(params)
    const stocks: Stock[] = result.list.map(inv => ({
      id: inv.id,
      warehouseId: inv.warehouseId,
      productId: inv.productId,
      productName: inv.productName,
      skuId: inv.skuId,
      quantity: inv.quantity,
      frozenQuantity: inv.frozenQuantity,
      availableQuantity: inv.availableQuantity,
      unit: inv.unit,
    }))
    return Promise.resolve({
      list: stocks,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    })
  }
  return getPage<Stock>('/warehouse/stock/list', params)
}

export function getStockDetail(id: string) {
  return get<Stock>(`/warehouse/stock/${id}`)
}

export function adjustStock(id: string, quantity: number, remark?: string) {
  return post<void>(`/warehouse/stock/${id}/adjust`, { quantity, remark })
}

const MOCK_STOCK_RECORDS: StockRecord[] = [
  { id: 'SR001', warehouseId: 'W001', skuId: 'SKU001', type: StockRecordType.IN, quantity: 100, beforeQuantity: 0, afterQuantity: 100, operatorId: 'U001', operatorName: '张三', remark: '入库', createdAt: '2024-03-15 10:00:00' },
  { id: 'SR002', warehouseId: 'W001', skuId: 'SKU001', type: StockRecordType.OUT, quantity: 30, beforeQuantity: 100, afterQuantity: 70, operatorId: 'U002', operatorName: '李四', remark: '出库', createdAt: '2024-03-16 14:00:00' },
  { id: 'SR003', warehouseId: 'W001', skuId: 'SKU002', type: StockRecordType.IN, quantity: 150, beforeQuantity: 0, afterQuantity: 150, operatorId: 'U001', operatorName: '张三', remark: '入库', createdAt: '2024-03-17 09:00:00' },
]

export function getStockRecords(params: PaginationParams & { warehouseId?: string; skuId?: string; type?: string }) {
  if (isMock) {
    let list = [...MOCK_STOCK_RECORDS]
    if (params.warehouseId) {
      list = list.filter(r => r.warehouseId === params.warehouseId)
    }
    if (params.skuId) {
      list = list.filter(r => r.skuId === params.skuId)
    }
    if (params.type) {
      list = list.filter(r => r.type === params.type)
    }
    return Promise.resolve({
      list,
      total: list.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(list.length / params.pageSize),
    })
  }
  return getPage<StockRecord>('/warehouse/stock-record/list', params)
}

export function stockIn(data: { warehouseId: string; items: { skuId: string; quantity: number }[]; remark?: string }) {
  return post<void>('/warehouse/stock/in', data)
}

export function stockOut(data: { warehouseId: string; items: { skuId: string; quantity: number }[]; remark?: string }) {
  return post<void>('/warehouse/stock/out', data)
}

export function stockTransfer(data: {
  fromWarehouseId: string
  toWarehouseId: string
  items: { skuId: string; quantity: number }[]
  remark?: string
}) {
  return post<void>('/warehouse/stock/transfer', data)
}
