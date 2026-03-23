import { ProductStatus, PriceType } from '@gongchengcang/types'

export const PRODUCT_STATUS_OPTIONS = [
  { label: '草稿', value: ProductStatus.DRAFT },
  { label: '待审核', value: ProductStatus.PENDING },
  { label: '已上架', value: ProductStatus.ON_SHELF },
  { label: '已下架', value: ProductStatus.OFF_SHELF },
  { label: '已拒绝', value: ProductStatus.REJECTED },
]

export const PRODUCT_STATUS_MAP: Record<ProductStatus, { label: string; color: string }> = {
  [ProductStatus.DRAFT]: { label: '草稿', color: 'gray' },
  [ProductStatus.PENDING]: { label: '待审核', color: 'orange' },
  [ProductStatus.ON_SHELF]: { label: '已上架', color: 'green' },
  [ProductStatus.OFF_SHELF]: { label: '已下架', color: 'red' },
  [ProductStatus.REJECTED]: { label: '已拒绝', color: 'magenta' },
}

export const PRICE_TYPE_OPTIONS = [
  { label: '基础价格', value: PriceType.BASE },
  { label: '批发价格', value: PriceType.WHOLESALE },
  { label: '零售价格', value: PriceType.RETAIL },
  { label: '客户价格', value: PriceType.CUSTOMER },
  { label: '促销价格', value: PriceType.PROMOTION },
]
