import { TransactionType, TransactionStatus, CustodyStatus } from '@gongchengcang/types'

export const TRANSACTION_TYPE_OPTIONS = [
  { label: '充值', value: TransactionType.RECHARGE },
  { label: '提现', value: TransactionType.WITHDRAW },
  { label: '支付', value: TransactionType.PAYMENT },
  { label: '收款', value: TransactionType.RECEIPT },
  { label: '退款', value: TransactionType.REFUND },
  { label: '冻结', value: TransactionType.FREEZE },
  { label: '解冻', value: TransactionType.UNFREEZE },
  { label: '佣金', value: TransactionType.COMMISSION },
]

export const TRANSACTION_STATUS_MAP: Record<TransactionStatus, { label: string; color: string }> = {
  [TransactionStatus.PENDING]: { label: '处理中', color: 'orange' },
  [TransactionStatus.SUCCESS]: { label: '成功', color: 'green' },
  [TransactionStatus.FAILED]: { label: '失败', color: 'red' },
}

export const CUSTODY_STATUS_MAP: Record<CustodyStatus, { label: string; color: string }> = {
  [CustodyStatus.FROZEN]: { label: '冻结中', color: 'orange' },
  [CustodyStatus.RELEASED]: { label: '已释放', color: 'green' },
  [CustodyStatus.REFUNDED]: { label: '已退款', color: 'red' },
}
