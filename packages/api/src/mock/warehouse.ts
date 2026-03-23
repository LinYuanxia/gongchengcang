import type { Warehouse, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { WarehouseType, WarehouseStatus } from '@gongchengcang/types'

const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'W001',
    name: '浦东工程仓库',
    code: 'WH-PD-001',
    merchantId: 'T003',
    merchantName: '浦东工程仓库',
    type: WarehouseType.SELF,
    status: WarehouseStatus.ENABLED,
    address: '上海市浦东新区外高桥保税区',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    contactName: '王五',
    contactPhone: '13800138003',
    area: 5000,
    capacity: 10000,
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00',
  },
  {
    id: 'W002',
    name: '虹桥工程仓',
    code: 'WH-HQ-001',
    merchantId: 'T005',
    merchantName: '虹桥工程仓',
    type: WarehouseType.THIRD_PARTY,
    status: WarehouseStatus.ENABLED,
    address: '上海市长宁区虹桥临空经济示范区',
    province: '上海市',
    city: '上海市',
    district: '长宁区',
    contactName: '钱七',
    contactPhone: '13800138005',
    area: 3000,
    capacity: 5000,
    createdAt: '2024-02-10 11:30:00',
    updatedAt: '2024-02-12 09:15:00',
  },
]

interface MockInventory {
  id: string
  warehouseId: string
  productId: string
  productName: string
  skuId: string
  quantity: number
  frozenQuantity: number
  availableQuantity: number
  unit: string
}

const MOCK_INVENTORIES: MockInventory[] = [
  { id: 'INV001', warehouseId: 'W001', productId: 'P001', productName: '螺纹钢 HRB400E Φ16', skuId: 'SKU001', quantity: 100, frozenQuantity: 30, availableQuantity: 70, unit: '吨' },
  { id: 'INV002', warehouseId: 'W001', productId: 'P002', productName: '螺纹钢 HRB400E Φ20', skuId: 'SKU002', quantity: 150, frozenQuantity: 20, availableQuantity: 130, unit: '吨' },
  { id: 'INV003', warehouseId: 'W001', productId: 'P003', productName: '普通硅酸盐水泥 P.O 42.5', skuId: 'SKU003', quantity: 500, frozenQuantity: 100, availableQuantity: 400, unit: '吨' },
  { id: 'INV004', warehouseId: 'W001', productId: 'P004', productName: '中砂', skuId: '', quantity: 1000, frozenQuantity: 200, availableQuantity: 800, unit: '方' },
  { id: 'INV005', warehouseId: 'W001', productId: 'P005', productName: '碎石 5-31.5mm', skuId: '', quantity: 2000, frozenQuantity: 0, availableQuantity: 2000, unit: '方' },
  { id: 'INV006', warehouseId: 'W002', productId: 'P001', productName: '螺纹钢 HRB400E Φ16', skuId: 'SKU001', quantity: 50, frozenQuantity: 0, availableQuantity: 50, unit: '吨' },
  { id: 'INV007', warehouseId: 'W002', productId: 'P006', productName: '镀锌钢管 DN100', skuId: '', quantity: 200, frozenQuantity: 0, availableQuantity: 200, unit: '米' },
]

export function getMockWarehouseList(params: PaginationParams & { keyword?: string; status?: number }): PaginationResult<Warehouse> {
  let list = [...MOCK_WAREHOUSES]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(w => 
      w.name.toLowerCase().includes(keyword) ||
      w.code.toLowerCase().includes(keyword)
    )
  }
  
  if (params.status !== undefined) {
    list = list.filter(w => w.status === params.status)
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

export function getMockWarehouseDetail(id: string): Warehouse | null {
  return MOCK_WAREHOUSES.find(w => w.id === id) || null
}

export function getMockInventoryList(params: PaginationParams & { warehouseId?: string; productId?: string }): PaginationResult<MockInventory> {
  let list = [...MOCK_INVENTORIES]
  
  if (params.warehouseId) {
    list = list.filter(i => i.warehouseId === params.warehouseId)
  }
  
  if (params.productId) {
    list = list.filter(i => i.productId === params.productId)
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
