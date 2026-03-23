export interface Warehouse {
  id: string
  name: string
  code: string
  merchantId: string
  merchantName?: string
  type: WarehouseType
  status: WarehouseStatus
  address: string
  province: string
  city: string
  district: string
  longitude?: number
  latitude?: number
  contactName?: string
  contactPhone?: string
  area?: number
  capacity?: number
  createdAt: string
  updatedAt: string
}

export enum WarehouseType {
  SELF = 'self',
  THIRD_PARTY = 'third_party'
}

export enum WarehouseStatus {
  ENABLED = 1,
  DISABLED = 0
}

export interface WarehouseArea {
  id: string
  warehouseId: string
  name: string
  code: string
  type: AreaType
  capacity?: number
  status: AreaStatus
}

export enum AreaType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PICKING = 'picking',
  SHIPPING = 'shipping'
}

export enum AreaStatus {
  ENABLED = 1,
  DISABLED = 0
}

export interface WarehouseLocation {
  id: string
  areaId: string
  warehouseId: string
  code: string
  row: number
  column: number
  layer: number
  status: LocationStatus
}

export enum LocationStatus {
  EMPTY = 0,
  OCCUPIED = 1,
  LOCKED = 2
}

export interface Stock {
  id: string
  warehouseId: string
  warehouseName?: string
  productId: string
  productName?: string
  skuId: string
  skuCode?: string
  quantity: number
  frozenQuantity: number
  availableQuantity: number
  locationId?: string
  locationCode?: string
}

export interface StockRecord {
  id: string
  warehouseId: string
  skuId: string
  type: StockRecordType
  quantity: number
  beforeQuantity: number
  afterQuantity: number
  orderId?: string
  orderNo?: string
  operatorId: string
  operatorName: string
  remark?: string
  createdAt: string
}

export enum StockRecordType {
  IN = 'in',
  OUT = 'out',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  ADJUST = 'adjust',
  FROZEN = 'frozen',
  UNFROZEN = 'unfrozen'
}
