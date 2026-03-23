import { WarehouseStatus, AreaType, LocationStatus, StockRecordType } from '@gongchengcang/types'

export const WAREHOUSE_STATUS_OPTIONS = [
  { label: '启用', value: WarehouseStatus.ENABLED },
  { label: '禁用', value: WarehouseStatus.DISABLED },
]

export const AREA_TYPE_OPTIONS = [
  { label: '收货区', value: AreaType.RECEIVING },
  { label: '存储区', value: AreaType.STORAGE },
  { label: '拣货区', value: AreaType.PICKING },
  { label: '发货区', value: AreaType.SHIPPING },
]

export const LOCATION_STATUS_MAP: Record<LocationStatus, { label: string; color: string }> = {
  [LocationStatus.EMPTY]: { label: '空闲', color: 'green' },
  [LocationStatus.OCCUPIED]: { label: '占用', color: 'orange' },
  [LocationStatus.LOCKED]: { label: '锁定', color: 'red' },
}

export const STOCK_RECORD_TYPE_OPTIONS = [
  { label: '入库', value: StockRecordType.IN },
  { label: '出库', value: StockRecordType.OUT },
  { label: '调拨入库', value: StockRecordType.TRANSFER_IN },
  { label: '调拨出库', value: StockRecordType.TRANSFER_OUT },
  { label: '盘点调整', value: StockRecordType.ADJUST },
  { label: '冻结', value: StockRecordType.FROZEN },
  { label: '解冻', value: StockRecordType.UNFROZEN },
]
