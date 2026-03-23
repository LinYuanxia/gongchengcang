export enum ProductCategoryStatus {
  ENABLED = 1,
  DISABLED = 0,
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ON_SHELF = 'on_shelf',
  OFF_SHELF = 'off_shelf',
  REJECTED = 'rejected',
}

export enum PriceType {
  BASE = 'base',
  WHOLESALE = 'wholesale',
  RETAIL = 'retail',
  CUSTOMER = 'customer',
  PROMOTION = 'promotion',
}

export interface ProductCategory {
  categoryId: string
  categoryName: string
  parentId?: string
  level: number
  sortOrder: number
  status: ProductCategoryStatus
  icon?: string
  children?: ProductCategory[]
  spuCount?: number
  skuCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryParams {
  categoryName: string
  parentId?: string
  sortOrder?: number
  status?: ProductCategoryStatus
  icon?: string
}

export interface UpdateCategoryParams {
  categoryName?: string
  sortOrder?: number
  status?: ProductCategoryStatus
  icon?: string
}

export enum AttrType {
  SINGLE = 'single',
  MULTI = 'multi',
  INPUT = 'input',
}

export interface ProductAttr {
  attrId: string
  attrName: string
  attrType: AttrType
  optionValues: string[]
  sortOrder: number
  status: number
  usedCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateAttrParams {
  attrName: string
  attrType: AttrType
  optionValues: string[]
  sortOrder?: number
}

export interface UpdateAttrParams {
  attrName?: string
  attrType?: AttrType
  optionValues?: string[]
  sortOrder?: number
  status?: number
}

export enum SpuStatus {
  ENABLED = 1,
  DISABLED = 0,
}

export interface Spu {
  spuId: string
  spuName: string
  spuCode?: string
  categoryId: string
  categoryName?: string
  unit: string
  attrIds: string[]
  attrNames?: string[]
  mainImage?: string
  images?: string[]
  description?: string
  remark?: string
  status: SpuStatus
  skuCount?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface CreateSpuParams {
  spuName: string
  spuCode?: string
  categoryId: string
  unit: string
  attrIds: string[]
  mainImage?: string
  images?: string[]
  description?: string
  remark?: string
}

export interface UpdateSpuParams {
  spuName?: string
  spuCode?: string
  categoryId?: string
  unit?: string
  attrIds?: string[]
  mainImage?: string
  images?: string[]
  description?: string
  remark?: string
  status?: SpuStatus
}

export enum SkuStatus {
  ON_SHELF = 1,
  OFF_SHELF = 0,
}

export interface Sku {
  skuId: string
  skuCode: string
  skuName: string
  spuId: string
  spuName?: string
  categoryId?: string
  categoryName?: string
  specs: Record<string, string>
  barcode?: string
  unit: string
  mainImage?: string
  images?: string[]
  suggestPrice?: number
  supplyPrice?: number
  salePrice?: number
  costPrice?: number
  marketPrice?: number
  status: SkuStatus
  supplierCount?: number
  stockTotal?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface CreateSkuParams {
  skuCode: string
  skuName: string
  spuId: string
  specs: Record<string, string>
  barcode?: string
  unit: string
  mainImage?: string
  images?: string[]
  suggestPrice?: number
  supplyPrice?: number
  salePrice?: number
  costPrice?: number
  marketPrice?: number
}

export interface UpdateSkuParams {
  skuCode?: string
  skuName?: string
  specs?: Record<string, string>
  barcode?: string
  unit?: string
  mainImage?: string
  images?: string[]
  suggestPrice?: number
  supplyPrice?: number
  salePrice?: number
  costPrice?: number
  marketPrice?: number
  status?: SkuStatus
}

export interface SkuPriceInfo {
  skuId?: string
  skuCode: string
  skuName: string
  specs: Record<string, string>
  skuImage?: string
  imageFileList?: any[]
  supplyPrice?: number
  salePrice?: number
  costPrice?: number
  marketPrice?: number
}

export interface BatchCreateSkuParams {
  spuId: string
  specCombinations: Record<string, string>[]
  skuCodePrefix?: string
  unit: string
}

export interface ProductOperationLog {
  logId: string
  targetType: 'spu' | 'sku'
  targetId: string
  targetName: string
  operationType: 'create' | 'update' | 'delete' | 'on_shelf' | 'off_shelf'
  operationContent?: string
  operatorId?: string
  operatorName?: string
  createdAt: string
}

export interface ProductStatistics {
  totalSpu: number
  totalSku: number
  onShelfSku: number
  offShelfSku: number
  categoryStats: CategoryStatistics[]
}

export interface CategoryStatistics {
  categoryId: string
  categoryName: string
  spuCount: number
  skuCount: number
}

export interface AbnormalProduct {
  skuId: string
  skuCode: string
  skuName: string
  spuName?: string
  abnormalType: 'no_supplier' | 'no_stock' | 'long_off_shelf'
  abnormalDesc: string
  lastUpdateTime: string
}

export interface SupplierProduct {
  id: string
  supplierId: string
  supplierName: string
  skuId: string
  skuCode: string
  skuName: string
  supplyPrice: number
  estimatedStock: number
  actualStock: number
  minOrderQty: number
  leadTime: number
  status: 'pending' | 'active' | 'inactive'
  auditStatus?: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface WarehouseProduct {
  id: string
  warehouseId: string
  warehouseName: string
  skuId: string
  skuCode: string
  skuName: string
  spuName?: string
  categoryName?: string
  supplierId: string
  supplierName: string
  unit: string
  quantity: number
  availableQty: number
  lockedQty: number
  purchasePrice: number
  batchNo?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export const PRODUCT_CATEGORY_STATUS_OPTIONS = [
  { label: '启用', value: ProductCategoryStatus.ENABLED },
  { label: '禁用', value: ProductCategoryStatus.DISABLED },
]

export const ATTR_TYPE_OPTIONS = [
  { label: '单选', value: AttrType.SINGLE },
  { label: '多选', value: AttrType.MULTI },
  { label: '输入', value: AttrType.INPUT },
]

export const SPU_STATUS_OPTIONS = [
  { label: '启用', value: SpuStatus.ENABLED },
  { label: '禁用', value: SpuStatus.DISABLED },
]

export const SKU_STATUS_OPTIONS = [
  { label: '上架', value: SkuStatus.ON_SHELF },
  { label: '下架', value: SkuStatus.OFF_SHELF },
]

export const OPERATION_TYPE_OPTIONS = [
  { label: '创建', value: 'create' },
  { label: '修改', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '上架', value: 'on_shelf' },
  { label: '下架', value: 'off_shelf' },
]

export const ABNORMAL_TYPE_OPTIONS = [
  { label: '无供应商', value: 'no_supplier' },
  { label: '无库存', value: 'no_stock' },
  { label: '长期未上架', value: 'long_off_shelf' },
]

export enum SupplierProductAuditStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface SupplierProductSpu {
  id: string
  supplierId: string
  supplierName?: string
  spuName: string
  spuCode?: string
  categoryId: string
  categoryName?: string
  unit: string
  attrIds: string[]
  attrNames?: string[]
  mainImage?: string
  images?: string[]
  description?: string
  remark?: string
  auditStatus: SupplierProductAuditStatus
  auditRemark?: string
  auditedAt?: string
  auditedBy?: string
  auditedByName?: string
  skuCount?: number
  createdAt: string
  updatedAt: string
}

export interface SupplierProductSku {
  id: string
  supplierId: string
  supplierName?: string
  spuId: string
  supplierSpuId: string
  spuName?: string
  skuCode: string
  skuName: string
  specs: Record<string, string>
  barcode?: string
  unit: string
  mainImage?: string
  images?: string[]
  suggestPrice?: number
  supplyPrice?: number
  salePrice?: number
  costPrice?: number
  marketPrice?: number
  auditStatus: SupplierProductAuditStatus
  auditRemark?: string
  auditedAt?: string
  auditedBy?: string
  auditedByName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierSpuParams {
  spuName: string
  spuCode?: string
  categoryId: string
  unit: string
  attrIds: string[]
  mainImage?: string
  images?: string[]
  description?: string
  remark?: string
}

export interface CreateSupplierSkuParams {
  spuId: string
  supplierSpuId: string
  skuCode: string
  skuName: string
  specs: Record<string, string>
  barcode?: string
  unit: string
  mainImage?: string
  images?: string[]
  suggestPrice?: number
  supplyPrice?: number
  salePrice?: number
  costPrice?: number
  marketPrice?: number
}

export interface AuditSupplierProductParams {
  ids: string[]
  auditStatus: SupplierProductAuditStatus.APPROVED | SupplierProductAuditStatus.REJECTED
  auditRemark?: string
}

export const SUPPLIER_PRODUCT_AUDIT_STATUS_OPTIONS = [
  { label: '草稿', value: SupplierProductAuditStatus.DRAFT },
  { label: '待审核', value: SupplierProductAuditStatus.PENDING },
  { label: '已通过', value: SupplierProductAuditStatus.APPROVED },
  { label: '已驳回', value: SupplierProductAuditStatus.REJECTED },
]
