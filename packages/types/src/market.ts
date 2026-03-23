export enum MarketProductStatus {
  PENDING = 'pending',
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum PriceAdjustStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PriceAdjustType {
  SINGLE = 'single',
  BATCH = 'batch',
}

export interface MarketProduct {
  id: string
  skuId: string
  skuCode: string
  skuName: string
  spuId: string
  spuName: string
  categoryId: string
  categoryName: string
  specs: Record<string, string>
  mainImage?: string
  supplierId: string
  supplierName: string
  supplyPrice: number
  supplyStatus: 'supplying' | 'paused' | 'stopped'
  marketStatus: MarketProductStatus
  marketPrice?: number
  priceStatus?: PriceAdjustStatus
  isHot: boolean
  isRecommend: boolean
  tags: string[]
  sortWeight: number
  onlineAt?: string
  offlineAt?: string
  offlineReason?: string
  createdAt: string
  updatedAt: string
  suppliers?: MarketProductSupplier[]
}

export interface MarketProductSupplier {
  supplierId: string
  supplierName: string
  supplyPrice: number
  supplyStatus: 'supplying' | 'paused' | 'stopped'
  priority: number
  estimatedStock?: number
  minOrderQty?: number
  leadTime?: number
}

export interface CreateMarketProductParams {
  skuId: string
  supplierId: string
  marketPrice: number
  isHot?: boolean
  isRecommend?: boolean
  tags?: string[]
  sortWeight?: number
}

export interface UpdateMarketProductParams {
  marketPrice?: number
  isHot?: boolean
  isRecommend?: boolean
  tags?: string[]
  sortWeight?: number
}

export interface PriceAdjustRecord {
  id: string
  adjustType: PriceAdjustType
  skuId?: string
  skuCode?: string
  skuName?: string
  skuIds?: string[]
  skuCount?: number
  oldPrice?: number
  newPrice: number
  adjustPercent?: number
  reason: string
  status: PriceAdjustStatus
  applyType: 'fixed' | 'percent'
  fixedPrice?: number
  percent?: number
  applicantId: string
  applicantName: string
  appliedAt: string
  approverId?: string
  approverName?: string
  approvedAt?: string
  rejectReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePriceAdjustParams {
  adjustType: PriceAdjustType
  skuId?: string
  skuIds?: string[]
  applyType: 'fixed' | 'percent'
  fixedPrice?: number
  percent?: number
  newPrice?: number
  reason: string
}

export interface ApprovePriceAdjustParams {
  id: string
  approved: boolean
  rejectReason?: string
}

export interface MarketCategory {
  categoryId: string
  categoryName: string
  parentId?: string
  level: number
  sortOrder: number
  isVisible: boolean
  productCount: number
  onlineCount: number
  hotCount: number
  recommendCount: number
  children?: MarketCategory[]
}

export interface UpdateMarketCategoryParams {
  isVisible?: boolean
  sortOrder?: number
}

export interface WarehouseStock {
  id: string
  warehouseId: string
  warehouseName: string
  skuId: string
  skuCode: string
  skuName: string
  spuName?: string
  categoryName?: string
  specs: Record<string, string>
  mainImage?: string
  unit: string
  quantity: number
  availableQty: number
  lockedQty: number
  safetyStock: number
  batchNo?: string
  location?: string
  lastInTime?: string
  lastOutTime?: string
  createdAt: string
  updatedAt: string
}

export interface StockAlert {
  id: string
  warehouseId: string
  warehouseName: string
  skuId: string
  skuCode: string
  skuName: string
  categoryName?: string
  unit: string
  currentStock: number
  safetyStock: number
  alertLevel: 'warning' | 'critical' | 'out_of_stock'
  alertTime: string
  isHandled: boolean
  handledAt?: string
  handledBy?: string
  remark?: string
}

export interface UpdateStockParams {
  warehouseId: string
  skuId: string
  safetyStock?: number
  location?: string
}

export const MARKET_PRODUCT_STATUS_OPTIONS = [
  { label: '待上架', value: MarketProductStatus.PENDING },
  { label: '已上架', value: MarketProductStatus.ONLINE },
  { label: '已下架', value: MarketProductStatus.OFFLINE },
]

export const PRICE_ADJUST_STATUS_OPTIONS = [
  { label: '待审批', value: PriceAdjustStatus.PENDING },
  { label: '已通过', value: PriceAdjustStatus.APPROVED },
  { label: '已驳回', value: PriceAdjustStatus.REJECTED },
]

export const PRICE_ADJUST_TYPE_OPTIONS = [
  { label: '单品调价', value: PriceAdjustType.SINGLE },
  { label: '批量调价', value: PriceAdjustType.BATCH },
]

export const STOCK_ALERT_LEVEL_OPTIONS = [
  { label: '库存预警', value: 'warning' },
  { label: '库存紧张', value: 'critical' },
  { label: '已缺货', value: 'out_of_stock' },
]
