import { get, post, put, del, getPage } from '@gongchengcang/utils'
import type { Order, PurchasePlan, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { OrderStatus } from '@gongchengcang/types'
import {
  getMockOrderList,
  getMockOrderDetail,
  createMockOrder,
  updateMockOrderStatus,
  cancelMockOrder
} from './mock/order'

const isMock = true

export function getOrderList(params: PaginationParams & { keyword?: string; type?: string; status?: number; buyerId?: string; sellerId?: string }) {
  if (isMock) {
    return Promise.resolve(getMockOrderList(params))
  }
  return getPage<Order>('/order/list', params)
}

export function getOrderDetail(id: string) {
  if (isMock) {
    const order = getMockOrderDetail(id)
    if (!order) return Promise.reject(new Error('订单不存在'))
    return Promise.resolve(order)
  }
  return get<Order>(`/order/${id}`)
}

export function createOrder(data: Partial<Order>) {
  if (isMock) {
    return Promise.resolve(createMockOrder(data))
  }
  return post<Order>('/order', data)
}

export function updateOrder(id: string, data: Partial<Order>) {
  return put<Order>(`/order/${id}`, data)
}

export function deleteOrder(id: string) {
  return del<void>(`/order/${id}`)
}

export function confirmOrder(id: string) {
  if (isMock) {
    const success = updateMockOrderStatus(id, OrderStatus.CONFIRMED)
    if (!success) return Promise.reject(new Error('确认失败'))
    return Promise.resolve()
  }
  return post<void>(`/order/${id}/confirm`)
}

export function cancelOrder(id: string, remark?: string) {
  if (isMock) {
    const success = cancelMockOrder(id)
    if (!success) return Promise.reject(new Error('取消失败'))
    return Promise.resolve()
  }
  return post<void>(`/order/${id}/cancel`, { remark })
}

export function payOrder(id: string) {
  if (isMock) {
    const success = updateMockOrderStatus(id, OrderStatus.PAID)
    if (!success) return Promise.reject(new Error('支付失败'))
    return Promise.resolve()
  }
  return post<void>(`/order/${id}/pay`)
}

export function shipOrder(id: string, data: { expressCompany?: string; expressNo?: string }) {
  if (isMock) {
    const success = updateMockOrderStatus(id, OrderStatus.SHIPPED)
    if (!success) return Promise.reject(new Error('发货失败'))
    return Promise.resolve()
  }
  return post<void>(`/order/${id}/ship`, data)
}

export function receiveOrder(id: string) {
  if (isMock) {
    const success = updateMockOrderStatus(id, OrderStatus.RECEIVED)
    if (!success) return Promise.reject(new Error('收货失败'))
    return Promise.resolve()
  }
  return post<void>(`/order/${id}/receive`)
}

export function completeOrder(id: string) {
  if (isMock) {
    const success = updateMockOrderStatus(id, OrderStatus.COMPLETED)
    if (!success) return Promise.reject(new Error('完成失败'))
    return Promise.resolve()
  }
  return post<void>(`/order/${id}/complete`)
}

const MOCK_PURCHASE_PLANS: PurchasePlan[] = [
  {
    id: 'PP001',
    planNo: 'PP202403150001',
    title: '3月份钢筋采购计划',
    buyerId: 'T002',
    buyerName: '城建施工集团',
    status: 1,
    totalAmount: 500000,
    remark: '项目急需',
    createdAt: '2024-03-15 09:00:00',
    updatedAt: '2024-03-15 09:00:00',
    items: [],
  },
]

export function getPurchasePlanList(params: PaginationParams & { keyword?: string; status?: number }) {
  if (isMock) {
    return Promise.resolve({
      list: MOCK_PURCHASE_PLANS,
      total: MOCK_PURCHASE_PLANS.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 1,
    })
  }
  return getPage<PurchasePlan>('/order/purchase-plan/list', params)
}

export function getPurchasePlanDetail(id: string) {
  if (isMock) {
    const plan = MOCK_PURCHASE_PLANS.find(p => p.id === id)
    if (!plan) return Promise.reject(new Error('采购计划不存在'))
    return Promise.resolve(plan)
  }
  return get<PurchasePlan>(`/order/purchase-plan/${id}`)
}

export function createPurchasePlan(data: Partial<PurchasePlan>) {
  return post<PurchasePlan>('/order/purchase-plan', data)
}

export function updatePurchasePlan(id: string, data: Partial<PurchasePlan>) {
  return put<PurchasePlan>(`/order/purchase-plan/${id}`, data)
}

export function deletePurchasePlan(id: string) {
  return del<void>(`/order/purchase-plan/${id}`)
}

export function submitPurchasePlan(id: string) {
  return post<void>(`/order/purchase-plan/${id}/submit`)
}

export function approvePurchasePlan(id: string, approved: boolean, remark?: string) {
  return post<void>(`/order/purchase-plan/${id}/approve`, { approved, remark })
}
