import type { Order, OrderItem, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { OrderStatus, OrderType, PayStatus, PayType, TenantType } from '@gongchengcang/types'

const MOCK_ORDERS: Order[] = [
  {
    id: 'O001',
    orderNo: 'PO202403150001',
    type: OrderType.PURCHASE,
    buyerId: 'T002',
    buyerName: '城建施工集团',
    buyerType: TenantType.CONSTRUCTOR,
    sellerId: 'T001',
    sellerName: '华东建材供应商',
    sellerType: TenantType.SUPPLIER,
    warehouseId: 'T003',
    warehouseName: '浦东工程仓库',
    status: OrderStatus.COMPLETED,
    payStatus: PayStatus.PAID,
    totalAmount: 126000,
    discountAmount: 0,
    freightAmount: 0,
    payAmount: 126000,
    paidAmount: 126000,
    payTime: '2024-03-15 10:00:00',
    payType: PayType.BANK,
    remark: '急需材料，请尽快发货',
    createdAt: '2024-03-15 09:30:00',
    updatedAt: '2024-03-18 16:20:00',
    items: [
      { id: 'OI001', orderId: 'O001', productId: 'P001', productName: '螺纹钢 HRB400E Φ16', skuId: 'SKU001', skuCode: 'GJ-001-1', specValues: { spec: 'HRB400E Φ16' }, quantity: 30, unit: '吨', price: 4200, amount: 126000, discountAmount: 0, payAmount: 126000 },
    ],
  },
  {
    id: 'O002',
    orderNo: 'PO202403160001',
    type: OrderType.PURCHASE,
    buyerId: 'T002',
    buyerName: '城建施工集团',
    buyerType: TenantType.CONSTRUCTOR,
    sellerId: 'T001',
    sellerName: '华东建材供应商',
    sellerType: TenantType.SUPPLIER,
    warehouseId: 'T003',
    warehouseName: '浦东工程仓库',
    status: OrderStatus.PENDING,
    payStatus: PayStatus.UNPAID,
    totalAmount: 107000,
    discountAmount: 0,
    freightAmount: 0,
    payAmount: 107000,
    paidAmount: 0,
    remark: '',
    createdAt: '2024-03-16 14:20:00',
    updatedAt: '2024-03-16 14:20:00',
    items: [
      { id: 'OI002', orderId: 'O002', productId: 'P002', productName: '螺纹钢 HRB400E Φ20', skuId: 'SKU002', skuCode: 'GJ-002-1', specValues: { spec: 'HRB400E Φ20' }, quantity: 20, unit: '吨', price: 4150, amount: 83000, discountAmount: 0, payAmount: 83000 },
      { id: 'OI003', orderId: 'O002', productId: 'P003', productName: '普通硅酸盐水泥 P.O 42.5', skuId: 'SKU003', skuCode: 'SN-001-1', specValues: { spec: 'P.O 42.5' }, quantity: 50, unit: '吨', price: 480, amount: 24000, discountAmount: 0, payAmount: 24000 },
    ],
  },
  {
    id: 'O003',
    orderNo: 'PO202403170001',
    type: OrderType.PURCHASE,
    buyerId: 'T002',
    buyerName: '城建施工集团',
    buyerType: TenantType.CONSTRUCTOR,
    sellerId: 'T001',
    sellerName: '华东建材供应商',
    sellerType: TenantType.SUPPLIER,
    warehouseId: 'T003',
    warehouseName: '浦东工程仓库',
    status: OrderStatus.PAID,
    payStatus: PayStatus.PAID,
    totalAmount: 48000,
    discountAmount: 0,
    freightAmount: 0,
    payAmount: 48000,
    paidAmount: 48000,
    payTime: '2024-03-17 11:00:00',
    payType: PayType.BALANCE,
    remark: '分批交付',
    createdAt: '2024-03-17 10:00:00',
    updatedAt: '2024-03-17 15:30:00',
    items: [
      { id: 'OI004', orderId: 'O003', productId: 'P003', productName: '普通硅酸盐水泥 P.O 42.5', skuId: 'SKU003', skuCode: 'SN-001-1', specValues: { spec: 'P.O 42.5' }, quantity: 100, unit: '吨', price: 480, amount: 48000, discountAmount: 0, payAmount: 48000 },
    ],
  },
  {
    id: 'O004',
    orderNo: 'PO202403180001',
    type: OrderType.PURCHASE,
    buyerId: 'T002',
    buyerName: '城建施工集团',
    buyerType: TenantType.CONSTRUCTOR,
    sellerId: 'T001',
    sellerName: '华东建材供应商',
    sellerType: TenantType.SUPPLIER,
    warehouseId: 'T003',
    warehouseName: '浦东工程仓库',
    status: OrderStatus.SHIPPED,
    payStatus: PayStatus.PAID,
    totalAmount: 24000,
    discountAmount: 0,
    freightAmount: 0,
    payAmount: 24000,
    paidAmount: 24000,
    payTime: '2024-03-18 12:00:00',
    payType: PayType.BANK,
    remark: '',
    createdAt: '2024-03-18 11:30:00',
    updatedAt: '2024-03-19 09:00:00',
    items: [
      { id: 'OI005', orderId: 'O004', productId: 'P004', productName: '中砂', skuId: '', skuCode: '', specValues: {}, quantity: 200, unit: '方', price: 120, amount: 24000, discountAmount: 0, payAmount: 24000 },
    ],
  },
  {
    id: 'O005',
    orderNo: 'PO202403190001',
    type: OrderType.PURCHASE,
    buyerId: 'T002',
    buyerName: '城建施工集团',
    buyerType: TenantType.CONSTRUCTOR,
    sellerId: 'T001',
    sellerName: '华东建材供应商',
    sellerType: TenantType.SUPPLIER,
    warehouseId: 'T003',
    warehouseName: '浦东工程仓库',
    status: OrderStatus.CANCELLED,
    payStatus: PayStatus.REFUNDED,
    totalAmount: 25500,
    discountAmount: 0,
    freightAmount: 0,
    payAmount: 25500,
    paidAmount: 0,
    remark: '订单取消',
    createdAt: '2024-03-19 16:00:00',
    updatedAt: '2024-03-19 17:30:00',
    items: [
      { id: 'OI006', orderId: 'O005', productId: 'P006', productName: '镀锌钢管 DN100', skuId: '', skuCode: '', specValues: {}, quantity: 300, unit: '米', price: 85, amount: 25500, discountAmount: 0, payAmount: 25500 },
    ],
  },
]

export function getMockOrderList(params: PaginationParams & { keyword?: string; status?: number; buyerId?: string; sellerId?: string }): PaginationResult<Order> {
  let list = [...MOCK_ORDERS]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(o => 
      o.orderNo.toLowerCase().includes(keyword) ||
      o.buyerName.includes(keyword) ||
      o.sellerName.includes(keyword)
    )
  }
  
  if (params.status !== undefined) {
    list = list.filter(o => o.status === params.status)
  }
  
  if (params.buyerId) {
    list = list.filter(o => o.buyerId === params.buyerId)
  }
  
  if (params.sellerId) {
    list = list.filter(o => o.sellerId === params.sellerId)
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

export function getMockOrderDetail(id: string): Order | null {
  return MOCK_ORDERS.find(o => o.id === id) || null
}

export function createMockOrder(data: Partial<Order>): Order {
  const orderNo = 'PO' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(MOCK_ORDERS.length + 1).padStart(4, '0')
  const newOrder: Order = {
    id: 'O' + String(MOCK_ORDERS.length + 1).padStart(3, '0'),
    orderNo,
    type: data.type || OrderType.PURCHASE,
    buyerId: data.buyerId || '',
    buyerName: data.buyerName || '',
    buyerType: data.buyerType || TenantType.CONSTRUCTOR,
    sellerId: data.sellerId || '',
    sellerName: data.sellerName || '',
    sellerType: data.sellerType || TenantType.SUPPLIER,
    warehouseId: data.warehouseId,
    warehouseName: data.warehouseName,
    status: OrderStatus.DRAFT,
    payStatus: PayStatus.UNPAID,
    totalAmount: data.totalAmount || 0,
    discountAmount: data.discountAmount || 0,
    freightAmount: data.freightAmount || 0,
    payAmount: data.payAmount || 0,
    paidAmount: 0,
    remark: data.remark,
    items: data.items || [],
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  MOCK_ORDERS.push(newOrder)
  return newOrder
}

export function updateMockOrderStatus(id: string, status: OrderStatus): boolean {
  const order = MOCK_ORDERS.find(o => o.id === id)
  if (!order) return false
  order.status = status
  order.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return true
}

export function cancelMockOrder(id: string): boolean {
  const order = MOCK_ORDERS.find(o => o.id === id)
  if (!order) return false
  order.status = OrderStatus.CANCELLED
  order.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return true
}
