import { AccountStatus } from './merchant'
import { RuleStatus } from './product'

export interface Account {
  id: string
  merchantId: string
  merchantName?: string
  type: AccountType
  balance: number
  frozenAmount: number
  availableAmount: number
  status: AccountStatus
}

export enum AccountType {
  BALANCE = 'balance',
  DEPOSIT = 'deposit',
  CREDIT = 'credit'
}

export interface Transaction {
  id: string
  transactionNo: string
  merchantId: string
  merchantName?: string
  type: TransactionType
  amount: number
  balance: number
  status: TransactionStatus
  orderId?: string
  orderNo?: string
  remark?: string
  createdAt: string
}

export enum TransactionType {
  RECHARGE = 'recharge',
  WITHDRAW = 'withdraw',
  PAYMENT = 'payment',
  RECEIPT = 'receipt',
  REFUND = 'refund',
  FREEZE = 'freeze',
  UNFREEZE = 'unfreeze',
  COMMISSION = 'commission'
}

export enum TransactionStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2
}

export interface OrderSplitRule {
  id: string
  name: string
  merchantId: string
  type: OrderSplitRuleType
  rules: OrderSplitRuleItem[]
  status: RuleStatus
}

export interface OrderSplitRuleItem {
  merchantId: string
  merchantName?: string
  type: 'percent' | 'fixed'
  value: number
  priority: number
}

export enum OrderSplitRuleType {
  ORDER = 'order',
  PRODUCT = 'product',
  CUSTOMER = 'customer'
}

export interface FundCustody {
  id: string
  orderId: string
  orderNo: string
  payerId: string
  payerName?: string
  payeeId: string
  payeeName?: string
  amount: number
  status: CustodyStatus
  createdAt: string
  releasedAt?: string
}

export enum CustodyStatus {
  FROZEN = 0,
  RELEASED = 1,
  REFUNDED = 2
}
