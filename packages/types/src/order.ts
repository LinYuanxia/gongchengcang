import type { MerchantType } from './user'

export interface Order {
  id: string
  orderNo: string
  type: OrderType
  status: OrderStatus
  buyerId: string
  buyerName: string
  buyerType: MerchantType
  sellerId: string
  sellerName: string
  sellerType: MerchantType
  warehouseId?: string
  warehouseName?: string
  items: OrderItem[]
  totalAmount: number
  discountAmount: number
  freightAmount: number
  payAmount: number
  paidAmount: number
  payStatus: PayStatus
  payTime?: string
  payType?: PayType
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  skuId: string
  skuCode: string
  specValues: Record<string, string>
  quantity: number
  unit: string
  price: number
  amount: number
  discountAmount: number
  payAmount: number
}

export enum OrderType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  TRANSFER = 'transfer',
  RETURN = 'return'
}

export enum OrderStatus {
  DRAFT = 0,
  PENDING = 1,
  CONFIRMED = 2,
  PAID = 3,
  SHIPPED = 4,
  RECEIVED = 5,
  COMPLETED = 6,
  CANCELLED = 7,
  REFUNDED = 8
}

export enum PayStatus {
  UNPAID = 0,
  PARTIAL = 1,
  PAID = 2,
  REFUNDING = 3,
  REFUNDED = 4
}

export enum PayType {
  BALANCE = 'balance',
  BANK = 'bank',
  ALIPAY = 'alipay',
  WECHAT = 'wechat'
}

export interface PurchasePlan {
  id: string
  planNo: string
  title: string
  warehouseId: string
  warehouseName: string
  status: PlanStatus
  items: PurchasePlanItem[]
  totalAmount: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface PurchasePlanItem {
  id: string
  planId: string
  productId: string
  productName: string
  skuId: string
  skuCode: string
  quantity: number
  unit: string
  estimatedPrice: number
  estimatedAmount: number
  actualPrice?: number
  actualAmount?: number
  status: PlanItemStatus
}

export enum PlanStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  EXECUTING = 3,
  COMPLETED = 4,
  CANCELLED = 5
}

export enum PlanItemStatus {
  PENDING = 0,
  PURCHASING = 1,
  COMPLETED = 2
}
