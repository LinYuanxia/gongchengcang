import { OrderType, OrderStatus, PayStatus, PayType, PlanStatus } from '@gongchengcang/types'

export const ORDER_TYPE_OPTIONS = [
  { label: '采购订单', value: OrderType.PURCHASE },
  { label: '销售订单', value: OrderType.SALE },
  { label: '调拨订单', value: OrderType.TRANSFER },
  { label: '退货订单', value: OrderType.RETURN },
]

export const ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: OrderStatus.DRAFT },
  { label: '待确认', value: OrderStatus.PENDING },
  { label: '已确认', value: OrderStatus.CONFIRMED },
  { label: '已支付', value: OrderStatus.PAID },
  { label: '已发货', value: OrderStatus.SHIPPED },
  { label: '已收货', value: OrderStatus.RECEIVED },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
  { label: '已退款', value: OrderStatus.REFUNDED },
]

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.DRAFT]: { label: '草稿', color: 'gray' },
  [OrderStatus.PENDING]: { label: '待确认', color: 'orange' },
  [OrderStatus.CONFIRMED]: { label: '已确认', color: 'blue' },
  [OrderStatus.PAID]: { label: '已支付', color: 'cyan' },
  [OrderStatus.SHIPPED]: { label: '已发货', color: 'purple' },
  [OrderStatus.RECEIVED]: { label: '已收货', color: 'arcoblue' },
  [OrderStatus.COMPLETED]: { label: '已完成', color: 'green' },
  [OrderStatus.CANCELLED]: { label: '已取消', color: 'red' },
  [OrderStatus.REFUNDED]: { label: '已退款', color: 'magenta' },
}

export const PAY_STATUS_MAP: Record<PayStatus, { label: string; color: string }> = {
  [PayStatus.UNPAID]: { label: '未支付', color: 'gray' },
  [PayStatus.PARTIAL]: { label: '部分支付', color: 'orange' },
  [PayStatus.PAID]: { label: '已支付', color: 'green' },
  [PayStatus.REFUNDING]: { label: '退款中', color: 'blue' },
  [PayStatus.REFUNDED]: { label: '已退款', color: 'red' },
}

export const PAY_TYPE_OPTIONS = [
  { label: '余额支付', value: PayType.BALANCE },
  { label: '银行转账', value: PayType.BANK },
  { label: '支付宝', value: PayType.ALIPAY },
  { label: '微信支付', value: PayType.WECHAT },
]

export const PLAN_STATUS_MAP: Record<PlanStatus, { label: string; color: string }> = {
  [PlanStatus.DRAFT]: { label: '草稿', color: 'gray' },
  [PlanStatus.SUBMITTED]: { label: '已提交', color: 'orange' },
  [PlanStatus.APPROVED]: { label: '已审批', color: 'blue' },
  [PlanStatus.EXECUTING]: { label: '执行中', color: 'cyan' },
  [PlanStatus.COMPLETED]: { label: '已完成', color: 'green' },
  [PlanStatus.CANCELLED]: { label: '已取消', color: 'red' },
}
