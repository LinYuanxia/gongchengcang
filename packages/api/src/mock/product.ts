import type {
  ProductCategory,
  ProductAttr,
  Spu,
  Sku,
  ProductOperationLog,
  ProductStatistics,
  AbnormalProduct,
  PaginationParams,
  PaginationResult,
  CreateCategoryParams,
  UpdateCategoryParams,
  CreateAttrParams,
  UpdateAttrParams,
  CreateSpuParams,
  UpdateSpuParams,
  CreateSkuParams,
  UpdateSkuParams,
} from '@gongchengcang/types'
import {
  ProductCategoryStatus,
  AttrType,
  SpuStatus,
  SkuStatus,
} from '@gongchengcang/types'

export const MOCK_CATEGORIES: ProductCategory[] = [
  {
    categoryId: 'CAT001',
    categoryName: '钢材',
    level: 1,
    sortOrder: 1,
    status: ProductCategoryStatus.ENABLED,
    spuCount: 15,
    skuCount: 45,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        categoryId: 'CAT001-1',
        categoryName: '螺纹钢',
        parentId: 'CAT001',
        level: 2,
        sortOrder: 1,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 8,
        skuCount: 24,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        categoryId: 'CAT001-2',
        categoryName: '型材',
        parentId: 'CAT001',
        level: 2,
        sortOrder: 2,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 4,
        skuCount: 12,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        categoryId: 'CAT001-3',
        categoryName: '板材',
        parentId: 'CAT001',
        level: 2,
        sortOrder: 3,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 3,
        skuCount: 9,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    categoryId: 'CAT002',
    categoryName: '水泥',
    level: 1,
    sortOrder: 2,
    status: ProductCategoryStatus.ENABLED,
    spuCount: 10,
    skuCount: 30,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        categoryId: 'CAT002-1',
        categoryName: '普通硅酸盐水泥',
        parentId: 'CAT002',
        level: 2,
        sortOrder: 1,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 5,
        skuCount: 15,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        categoryId: 'CAT002-2',
        categoryName: '矿渣水泥',
        parentId: 'CAT002',
        level: 2,
        sortOrder: 2,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 3,
        skuCount: 9,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    categoryId: 'CAT003',
    categoryName: '管材',
    level: 1,
    sortOrder: 3,
    status: ProductCategoryStatus.ENABLED,
    spuCount: 12,
    skuCount: 48,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        categoryId: 'CAT003-1',
        categoryName: 'PVC管',
        parentId: 'CAT003',
        level: 2,
        sortOrder: 1,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 4,
        skuCount: 16,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        categoryId: 'CAT003-2',
        categoryName: '镀锌钢管',
        parentId: 'CAT003',
        level: 2,
        sortOrder: 2,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 5,
        skuCount: 20,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    categoryId: 'CAT004',
    categoryName: '防水材料',
    level: 1,
    sortOrder: 4,
    status: ProductCategoryStatus.ENABLED,
    spuCount: 8,
    skuCount: 32,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        categoryId: 'CAT004-1',
        categoryName: '防水卷材',
        parentId: 'CAT004',
        level: 2,
        sortOrder: 1,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 4,
        skuCount: 16,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        categoryId: 'CAT004-2',
        categoryName: '防水涂料',
        parentId: 'CAT004',
        level: 2,
        sortOrder: 2,
        status: ProductCategoryStatus.ENABLED,
        spuCount: 4,
        skuCount: 16,
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    categoryId: 'CAT005',
    categoryName: '电线电缆',
    level: 1,
    sortOrder: 5,
    status: ProductCategoryStatus.ENABLED,
    spuCount: 6,
    skuCount: 24,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
]

export const MOCK_ATTRS: ProductAttr[] = [
  {
    attrId: 'ATTR001',
    attrName: '品牌',
    attrType: AttrType.SINGLE,
    optionValues: ['品牌A', '品牌B', '品牌C', '品牌D'],
    sortOrder: 1,
    status: 1,
    usedCount: 28,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR002',
    attrName: '材质',
    attrType: AttrType.SINGLE,
    optionValues: ['HRB400E', 'HRB500E', 'PVC', '镀锌'],
    sortOrder: 2,
    status: 1,
    usedCount: 35,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR003',
    attrName: '规格',
    attrType: AttrType.SINGLE,
    optionValues: ['Φ16', 'Φ20', 'Φ25', 'Φ32', '6m', '9m', '12m'],
    sortOrder: 3,
    status: 1,
    usedCount: 42,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR004',
    attrName: '强度等级',
    attrType: AttrType.SINGLE,
    optionValues: ['32.5', '42.5', '42.5R', '52.5', '52.5R'],
    sortOrder: 4,
    status: 1,
    usedCount: 18,
    createdAt: '2024-01-02 00:00:00',
    updatedAt: '2024-01-02 00:00:00',
  },
  {
    attrId: 'ATTR005',
    attrName: '颜色',
    attrType: AttrType.SINGLE,
    optionValues: ['白色', '灰色', '黑色', '红色', '蓝色'],
    sortOrder: 5,
    status: 1,
    usedCount: 12,
    createdAt: '2024-01-03 00:00:00',
    updatedAt: '2024-01-03 00:00:00',
  },
  {
    attrId: 'ATTR006',
    attrName: '厚度',
    attrType: AttrType.SINGLE,
    optionValues: ['5mm', '10mm', '15mm', '20mm', '25mm'],
    sortOrder: 6,
    status: 1,
    usedCount: 15,
    createdAt: '2024-01-04 00:00:00',
    updatedAt: '2024-01-04 00:00:00',
  },
  {
    attrId: 'ATTR007',
    attrName: '特殊属性',
    attrType: AttrType.MULTI,
    optionValues: ['防腐', '防火', '防水', '防静电', '耐高温'],
    sortOrder: 7,
    status: 1,
    usedCount: 8,
    createdAt: '2024-01-05 00:00:00',
    updatedAt: '2024-01-05 00:00:00',
  },
  {
    attrId: 'ATTR008',
    attrName: '备注说明',
    attrType: AttrType.INPUT,
    optionValues: [],
    sortOrder: 8,
    status: 1,
    usedCount: 5,
    createdAt: '2024-01-06 00:00:00',
    updatedAt: '2024-01-06 00:00:00',
  },
  {
    attrId: 'ATTR009',
    attrName: '尺寸',
    attrType: AttrType.SINGLE,
    optionValues: ['100x100', '200x200', '300x300', '600x600'],
    sortOrder: 9,
    status: 0,
    usedCount: 0,
    createdAt: '2024-01-07 00:00:00',
    updatedAt: '2024-01-07 00:00:00',
  },
  {
    attrId: 'ATTR010',
    attrName: '产地',
    attrType: AttrType.SINGLE,
    optionValues: ['山东', '河北', '江苏', '广东', '浙江'],
    sortOrder: 10,
    status: 1,
    usedCount: 22,
    createdAt: '2024-01-08 00:00:00',
    updatedAt: '2024-01-08 00:00:00',
  },
]

export const MOCK_SPUS: Spu[] = [
  {
    spuId: 'SPU001',
    spuCode: 'GJ-LWG-001',
    spuName: '螺纹钢 HRB400E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '材质', '规格'],
    status: SpuStatus.ENABLED,
    skuCount: 5,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-16 14:20:00',
  },
  {
    spuId: 'SPU002',
    spuCode: 'GJ-LWG-002',
    spuName: '螺纹钢 HRB500E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '材质', '规格'],
    status: SpuStatus.ENABLED,
    skuCount: 3,
    createdAt: '2024-01-15 11:00:00',
    updatedAt: '2024-01-16 15:00:00',
  },
  {
    spuId: 'SPU003',
    spuCode: 'SN-PS-001',
    spuName: '普通硅酸盐水泥 42.5',
    categoryId: 'CAT002-1',
    categoryName: '普通硅酸盐水泥',
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR003'],
    attrNames: ['品牌', '强度等级'],
    status: SpuStatus.ENABLED,
    skuCount: 2,
    createdAt: '2024-01-14 09:00:00',
    updatedAt: '2024-01-15 10:00:00',
  },
  {
    spuId: 'SPU004',
    spuCode: 'GC-PVC-001',
    spuName: 'PVC排水管 Φ110',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '材质', '外径'],
    status: SpuStatus.ENABLED,
    skuCount: 4,
    createdAt: '2024-01-13 14:00:00',
    updatedAt: '2024-01-14 16:00:00',
  },
  {
    spuId: 'SPU005',
    spuCode: 'GC-DX-001',
    spuName: '镀锌钢管 DN50',
    categoryId: 'CAT003-2',
    categoryName: '镀锌钢管',
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '材质', '公称直径'],
    status: SpuStatus.ENABLED,
    skuCount: 3,
    createdAt: '2024-01-12 10:00:00',
    updatedAt: '2024-01-13 12:00:00',
  },
  {
    spuId: 'SPU006',
    spuCode: 'FS-FSJ-001',
    spuName: 'SBS防水卷材 3mm',
    categoryId: 'CAT004-1',
    categoryName: '防水卷材',
    unit: '平方米',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '厚度', '胎基'],
    status: SpuStatus.ENABLED,
    skuCount: 2,
    createdAt: '2024-01-11 09:00:00',
    updatedAt: '2024-01-12 11:00:00',
  },
  {
    spuId: 'SPU007',
    spuCode: 'FS-FST-001',
    spuName: '聚氨酯防水涂料',
    categoryId: 'CAT004-2',
    categoryName: '防水涂料',
    unit: '桶',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '类型', '容量'],
    status: SpuStatus.ENABLED,
    skuCount: 2,
    createdAt: '2024-01-10 14:00:00',
    updatedAt: '2024-01-11 16:00:00',
  },
  {
    spuId: 'SPU008',
    spuCode: 'GJ-GB-001',
    spuName: '钢板',
    categoryId: 'CAT001-3',
    categoryName: '板材',
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '材质', '厚度'],
    status: SpuStatus.ENABLED,
    skuCount: 2,
    createdAt: '2024-01-09 10:00:00',
    updatedAt: '2024-01-10 12:00:00',
  },
]

export const MOCK_SKUS: Sku[] = [
  {
    skuId: 'SKU001',
    skuCode: 'GJ-LWG-001-16-6',
    skuName: '螺纹钢 HRB400E Φ16 6m',
    spuId: 'SPU001',
    spuName: '螺纹钢 HRB400E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    specs: { '直径': 'Φ16', '长度': '6m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5200,
    supplyPrice: 5000,
    salePrice: 5100,
    costPrice: 4900,
    marketPrice: 5300,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 1000,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-16 14:20:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU002',
    skuCode: 'GJ-LWG-001-20-9',
    skuName: '螺纹钢 HRB400E Φ20 9m',
    spuId: 'SPU001',
    spuName: '螺纹钢 HRB400E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    specs: { '直径': 'Φ20', '长度': '9m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5100,
    supplyPrice: 4900,
    salePrice: 5000,
    costPrice: 4800,
    marketPrice: 5200,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 800,
    createdAt: '2024-01-15 11:00:00',
    updatedAt: '2024-01-16 15:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU003',
    skuCode: 'GJ-LWG-001-25-12',
    skuName: '螺纹钢 HRB400E Φ25 12m',
    spuId: 'SPU001',
    spuName: '螺纹钢 HRB400E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    specs: { '直径': 'Φ25', '长度': '12m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5000,
    supplyPrice: 4800,
    salePrice: 4900,
    costPrice: 4700,
    marketPrice: 5100,
    status: SkuStatus.ON_SHELF,
    supplierCount: 5,
    stockTotal: 1200,
    createdAt: '2024-01-15 11:30:00',
    updatedAt: '2024-01-16 15:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU004',
    skuCode: 'GJ-LWG-002-16-6',
    skuName: '螺纹钢 HRB500E Φ16 6m',
    spuId: 'SPU002',
    spuName: '螺纹钢 HRB500E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    specs: { '直径': 'Φ16', '长度': '6m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5600,
    supplyPrice: 5400,
    salePrice: 5500,
    costPrice: 5300,
    marketPrice: 5700,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 600,
    createdAt: '2024-01-15 12:00:00',
    updatedAt: '2024-01-16 16:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU005',
    skuCode: 'GJ-LWG-002-20-9',
    skuName: '螺纹钢 HRB500E Φ20 9m',
    spuId: 'SPU002',
    spuName: '螺纹钢 HRB500E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    specs: { '直径': 'Φ20', '长度': '9m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5500,
    supplyPrice: 5300,
    salePrice: 5400,
    costPrice: 5200,
    marketPrice: 5600,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 700,
    createdAt: '2024-01-15 12:30:00',
    updatedAt: '2024-01-16 16:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU006',
    skuCode: 'GJ-LWG-002-25-12',
    skuName: '螺纹钢 HRB500E Φ25 12m',
    spuId: 'SPU002',
    spuName: '螺纹钢 HRB500E',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    specs: { '直径': 'Φ25', '长度': '12m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5400,
    supplyPrice: 5200,
    salePrice: 5300,
    costPrice: 5100,
    marketPrice: 5500,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 500,
    createdAt: '2024-01-15 13:00:00',
    updatedAt: '2024-01-16 17:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU007',
    skuCode: 'SN-PS-001-32.5',
    skuName: '普通硅酸盐水泥 32.5',
    spuId: 'SPU003',
    spuName: '普通硅酸盐水泥 42.5',
    categoryId: 'CAT002-1',
    categoryName: '普通硅酸盐水泥',
    specs: { '强度等级': '32.5' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 450,
    supplyPrice: 430,
    salePrice: 440,
    costPrice: 420,
    marketPrice: 460,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 2000,
    createdAt: '2024-01-14 09:00:00',
    updatedAt: '2024-01-15 10:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU008',
    skuCode: 'SN-PS-001-42.5',
    skuName: '普通硅酸盐水泥 42.5',
    spuId: 'SPU003',
    spuName: '普通硅酸盐水泥 42.5',
    categoryId: 'CAT002-1',
    categoryName: '普通硅酸盐水泥',
    specs: { '强度等级': '42.5' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 480,
    supplyPrice: 460,
    salePrice: 470,
    costPrice: 450,
    marketPrice: 490,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 2500,
    createdAt: '2024-01-14 09:30:00',
    updatedAt: '2024-01-15 10:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU009',
    skuCode: 'GC-PVC-001-50',
    skuName: 'PVC排水管 Φ50',
    spuId: 'SPU004',
    spuName: 'PVC排水管 Φ110',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    specs: { '外径': 'Φ50' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 15,
    supplyPrice: 13,
    salePrice: 14,
    costPrice: 12,
    marketPrice: 16,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 5000,
    createdAt: '2024-01-13 14:00:00',
    updatedAt: '2024-01-14 16:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU010',
    skuCode: 'GC-PVC-001-75',
    skuName: 'PVC排水管 Φ75',
    spuId: 'SPU004',
    spuName: 'PVC排水管 Φ110',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    specs: { '外径': 'Φ75' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 20,
    supplyPrice: 18,
    salePrice: 19,
    costPrice: 17,
    marketPrice: 21,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 4000,
    createdAt: '2024-01-13 14:30:00',
    updatedAt: '2024-01-14 16:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU011',
    skuCode: 'GC-PVC-001-110',
    skuName: 'PVC排水管 Φ110',
    spuId: 'SPU004',
    spuName: 'PVC排水管 Φ110',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    specs: { '外径': 'Φ110' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 30,
    supplyPrice: 28,
    salePrice: 29,
    costPrice: 27,
    marketPrice: 31,
    status: SkuStatus.ON_SHELF,
    supplierCount: 5,
    stockTotal: 3000,
    createdAt: '2024-01-13 15:00:00',
    updatedAt: '2024-01-14 17:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU012',
    skuCode: 'GC-PVC-001-160',
    skuName: 'PVC排水管 Φ160',
    spuId: 'SPU004',
    spuName: 'PVC排水管 Φ110',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    specs: { '外径': 'Φ160' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 45,
    supplyPrice: 43,
    salePrice: 44,
    costPrice: 42,
    marketPrice: 46,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 2000,
    createdAt: '2024-01-13 15:30:00',
    updatedAt: '2024-01-14 17:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU013',
    skuCode: 'GC-DX-001-25',
    skuName: '镀锌钢管 DN25',
    spuId: 'SPU005',
    spuName: '镀锌钢管 DN50',
    categoryId: 'CAT003-2',
    categoryName: '镀锌钢管',
    specs: { '公称直径': 'DN25' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 25,
    supplyPrice: 23,
    salePrice: 24,
    costPrice: 22,
    marketPrice: 26,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 3000,
    createdAt: '2024-01-12 10:00:00',
    updatedAt: '2024-01-13 12:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU014',
    skuCode: 'GC-DX-001-50',
    skuName: '镀锌钢管 DN50',
    spuId: 'SPU005',
    spuName: '镀锌钢管 DN50',
    categoryId: 'CAT003-2',
    categoryName: '镀锌钢管',
    specs: { '公称直径': 'DN50' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 40,
    supplyPrice: 38,
    salePrice: 39,
    costPrice: 37,
    marketPrice: 41,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 2500,
    createdAt: '2024-01-12 10:30:00',
    updatedAt: '2024-01-13 12:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU015',
    skuCode: 'GC-DX-001-80',
    skuName: '镀锌钢管 DN80',
    spuId: 'SPU005',
    spuName: '镀锌钢管 DN50',
    categoryId: 'CAT003-2',
    categoryName: '镀锌钢管',
    specs: { '公称直径': 'DN80' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 60,
    supplyPrice: 58,
    salePrice: 59,
    costPrice: 57,
    marketPrice: 61,
    status: SkuStatus.ON_SHELF,
    supplierCount: 5,
    stockTotal: 2000,
    createdAt: '2024-01-12 11:00:00',
    updatedAt: '2024-01-13 13:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU016',
    skuCode: 'FS-FSJ-001-3',
    skuName: 'SBS防水卷材 3mm',
    spuId: 'SPU006',
    spuName: 'SBS防水卷材 3mm',
    categoryId: 'CAT004-1',
    categoryName: '防水卷材',
    specs: { '厚度': '3mm' },
    unit: '平方米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 35,
    supplyPrice: 33,
    salePrice: 34,
    costPrice: 32,
    marketPrice: 36,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 1500,
    createdAt: '2024-01-11 09:00:00',
    updatedAt: '2024-01-12 11:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU017',
    skuCode: 'FS-FSJ-001-4',
    skuName: 'SBS防水卷材 4mm',
    spuId: 'SPU006',
    spuName: 'SBS防水卷材 3mm',
    categoryId: 'CAT004-1',
    categoryName: '防水卷材',
    specs: { '厚度': '4mm' },
    unit: '平方米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 45,
    supplyPrice: 43,
    salePrice: 44,
    costPrice: 42,
    marketPrice: 46,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 1200,
    createdAt: '2024-01-11 09:30:00',
    updatedAt: '2024-01-12 11:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU018',
    skuCode: 'FS-FST-001-20',
    skuName: '聚氨酯防水涂料 20kg',
    spuId: 'SPU007',
    spuName: '聚氨酯防水涂料',
    categoryId: 'CAT004-2',
    categoryName: '防水涂料',
    specs: { '容量': '20kg' },
    unit: '桶',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 180,
    supplyPrice: 170,
    salePrice: 175,
    costPrice: 165,
    marketPrice: 185,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 800,
    createdAt: '2024-01-10 14:00:00',
    updatedAt: '2024-01-11 16:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU019',
    skuCode: 'FS-FST-001-50',
    skuName: '聚氨酯防水涂料 50kg',
    spuId: 'SPU007',
    spuName: '聚氨酯防水涂料',
    categoryId: 'CAT004-2',
    categoryName: '防水涂料',
    specs: { '容量': '50kg' },
    unit: '桶',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 420,
    supplyPrice: 400,
    salePrice: 410,
    costPrice: 390,
    marketPrice: 430,
    status: SkuStatus.ON_SHELF,
    supplierCount: 5,
    stockTotal: 600,
    createdAt: '2024-01-10 14:30:00',
    updatedAt: '2024-01-11 16:30:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU020',
    skuCode: 'GJ-GB-001-3-Q235B',
    skuName: '钢板 Q235B 3mm',
    spuId: 'SPU008',
    spuName: '钢板',
    categoryId: 'CAT001-3',
    categoryName: '板材',
    specs: { '材质': 'Q235B', '厚度': '3mm' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 4800,
    supplyPrice: 4600,
    salePrice: 4700,
    costPrice: 4500,
    marketPrice: 4900,
    status: SkuStatus.ON_SHELF,
    supplierCount: 5,
    stockTotal: 800,
    createdAt: '2024-01-09 10:00:00',
    updatedAt: '2024-01-10 12:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU021',
    skuCode: 'GJ-GB-001-5-Q345B',
    skuName: '钢板 Q345B 5mm',
    spuId: 'SPU008',
    spuName: '钢板',
    categoryId: 'CAT001-3',
    categoryName: '板材',
    specs: { '材质': 'Q345B', '厚度': '5mm' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 5200,
    supplyPrice: 5000,
    salePrice: 5100,
    costPrice: 4900,
    marketPrice: 5300,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 600,
    createdAt: '2024-01-09 10:30:00',
    updatedAt: '2024-01-10 12:30:00',
    createdBy: 'admin',
  },
]

function flattenCategories(categories: ProductCategory[], result: ProductCategory[] = []): ProductCategory[] {
  for (const category of categories) {
    result.push(category)
    if (category.children) {
      flattenCategories(category.children, result)
    }
  }
  return result
}

export function getMockCategoryTree() {
  return MOCK_CATEGORIES
}

export function getMockCategoryList() {
  return flattenCategories(MOCK_CATEGORIES)
}

export function getMockCategoryDetail(categoryId: string) {
  const allCategories = flattenCategories(MOCK_CATEGORIES)
  return allCategories.find(c => c.categoryId === categoryId) || null
}

export function createMockCategory(data: CreateCategoryParams) {
  const newCategory: ProductCategory = {
    categoryId: `CAT${Date.now()}`,
    categoryName: data.categoryName,
    level: data.level || 1,
    parentId: data.parentId,
    sortOrder: data.sortOrder || 0,
    status: ProductCategoryStatus.ENABLED,
    spuCount: 0,
    skuCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  if (data.parentId) {
    const parent = getMockCategoryDetail(data.parentId)
    if (parent) {
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(newCategory)
    }
  } else {
    MOCK_CATEGORIES.push(newCategory)
  }
  
  return newCategory
}

export function updateMockCategory(categoryId: string, data: UpdateCategoryParams) {
  const category = getMockCategoryDetail(categoryId)
  if (category) {
    Object.assign(category, data)
    category.updatedAt = new Date().toISOString()
  }
  return category
}

export function deleteMockCategory(categoryId: string) {
  const category = getMockCategoryDetail(categoryId)
  if (!category) {
    return { success: false, message: '分类不存在' }
  }
  
  const allCategories = flattenCategories(MOCK_CATEGORIES)
  const index = allCategories.findIndex(c => c.categoryId === categoryId)
  if (index > -1) {
    allCategories.splice(index, 1)
  }
  
  return { success: true }
}

export function getMockAttrList(params: PaginationParams & { keyword?: string; status?: number }) {
  let result = [...MOCK_ATTRS]
  
  if (params.keyword) {
    result = result.filter(attr => 
      attr.attrName.includes(params.keyword)
    )
  }
  
  if (params.status !== undefined) {
    result = result.filter(attr => attr.status === params.status)
  }
  
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    list: result.slice(start, end),
    total: result.length,
    page,
    pageSize,
    totalPages: Math.ceil(result.length / pageSize),
  }
}

export function getMockAttrDetail(attrId: string) {
  return MOCK_ATTRS.find(attr => attr.attrId === attrId) || null
}

export function createMockAttr(data: CreateAttrParams) {
  const newAttr: ProductAttr = {
    attrId: `ATTR${Date.now()}`,
    attrName: data.attrName,
    attrType: data.attrType,
    optionValues: data.optionValues || [],
    sortOrder: data.sortOrder || 0,
    status: 1,
    usedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  MOCK_ATTRS.push(newAttr)
  return newAttr
}

export function updateMockAttr(attrId: string, data: UpdateAttrParams) {
  const attr = getMockAttrDetail(attrId)
  if (attr) {
    Object.assign(attr, data)
    attr.updatedAt = new Date().toISOString()
  }
  return attr
}

export function deleteMockAttr(attrId: string) {
  const index = MOCK_ATTRS.findIndex(attr => attr.attrId === attrId)
  if (index > -1) {
    MOCK_ATTRS.splice(index, 1)
    return { success: true }
  }
  return { success: false, message: '属性不存在' }
}

export function getMockSpuList(params: PaginationParams & { keyword?: string; categoryId?: string }) {
  let result = [...MOCK_SPUS]
  
  if (params.keyword) {
    result = result.filter(spu => 
      spu.spuName.includes(params.keyword) || 
      spu.spuCode.includes(params.keyword)
    )
  }
  
  if (params.categoryId) {
    result = result.filter(spu => spu.categoryId === params.categoryId)
  }
  
  const total = result.length
  const start = (params.page - 1) * params.pageSize
  const list = result.slice(start, start + params.pageSize)
  
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export function getMockSpuDetail(spuId: string) {
  return MOCK_SPUS.find(spu => spu.spuId === spuId) || null
}

export function createMockSpu(data: CreateSpuParams) {
  const newSpu: Spu = {
    spuId: `SPU${Date.now()}`,
    spuCode: data.spuCode,
    spuName: data.spuName,
    categoryId: data.categoryId,
    categoryName: data.categoryName || '',
    unit: data.unit,
    mainImage: data.mainImage || '',
    attrNames: data.attrNames || [],
    skuCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  MOCK_SPUS.push(newSpu)
  return newSpu
}

export function updateMockSpu(spuId: string, data: UpdateSpuParams) {
  const spu = getMockSpuDetail(spuId)
  if (spu) {
    Object.assign(spu, data)
    spu.updatedAt = new Date().toISOString()
  }
  return spu
}

export function deleteMockSpu(spuId: string) {
  const index = MOCK_SPUS.findIndex(spu => spu.spuId === spuId)
  if (index > -1) {
    MOCK_SPUS.splice(index, 1)
    return { success: true }
  }
  return { success: false, message: 'SPU不存在' }
}

export function getMockSkuList(params: PaginationParams & { keyword?: string; categoryId?: string; spuId?: string }) {
  let result = [...MOCK_SKUS]
  
  if (params.keyword) {
    result = result.filter(sku => 
      sku.skuName.includes(params.keyword) || 
      sku.skuCode.includes(params.keyword)
    )
  }
  
  if (params.categoryId) {
    result = result.filter(sku => sku.categoryId === params.categoryId)
  }
  
  if (params.spuId) {
    result = result.filter(sku => sku.spuId === params.spuId)
  }
  
  const total = result.length
  const start = (params.page - 1) * params.pageSize
  const list = result.slice(start, start + params.pageSize)
  
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export function getMockSkuDetail(skuId: string) {
  return MOCK_SKUS.find(sku => sku.skuId === skuId) || null
}

export function createMockSku(data: CreateSkuParams) {
  const newSku: Sku = {
    skuId: `SKU${Date.now()}`,
    skuCode: data.skuCode,
    skuName: data.skuName,
    spuId: data.spuId,
    spuName: data.spuName || '',
    categoryId: data.categoryId,
    categoryName: data.categoryName || '',
    specs: data.specs,
    unit: data.unit,
    mainImage: data.mainImage || '',
    suggestPrice: data.suggestPrice || 0,
    supplyPrice: data.supplyPrice || 0,
    salePrice: data.salePrice || 0,
    costPrice: data.costPrice || 0,
    marketPrice: data.marketPrice || 0,
    status: SkuStatus.ON_SHELF,
    supplierCount: 0,
    stockTotal: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
  }
  
  MOCK_SKUS.push(newSku)
  return newSku
}

export function updateMockSku(skuId: string, data: UpdateSkuParams) {
  const sku = getMockSkuDetail(skuId)
  if (sku) {
    Object.assign(sku, data)
    sku.updatedAt = new Date().toISOString()
  }
  return sku
}

export function batchUpdateMockSkuStatus(skuIds: string[], status: SkuStatus) {
  for (const skuId of skuIds) {
    const sku = getMockSkuDetail(skuId)
    if (sku) {
      sku.status = status
      sku.updatedAt = new Date().toISOString()
    }
  }
  return { success: true }
}

export function getMockSkuListBySpu(spuId: string) {
  return MOCK_SKUS.filter(sku => sku.spuId === spuId)
}

export function deleteMockSku(skuId: string) {
  const index = MOCK_SKUS.findIndex(sku => sku.skuId === skuId)
  if (index > -1) {
    MOCK_SKUS.splice(index, 1)
    return { success: true }
  }
  return { success: false, message: 'SKU不存在' }
}

export function getMockProductStatistics() {
  return {
    totalSpu: MOCK_SPUS.length,
    totalSku: MOCK_SKUS.length,
    onShelfCount: MOCK_SKUS.filter(sku => sku.status === SkuStatus.ON_SHELF).length,
    offShelfCount: MOCK_SKUS.filter(sku => sku.status === SkuStatus.OFF_SHELF).length,
    lowStockCount: MOCK_SKUS.filter(sku => sku.stockTotal < 100).length,
  }
}

export function getMockOperationLogs() {
  return []
}

export function getMockAbnormalProducts() {
  return []
}
