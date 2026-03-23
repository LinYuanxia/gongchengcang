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
    attrName: '规格型号',
    attrType: AttrType.SINGLE,
    optionValues: ['Φ16', 'Φ20', 'Φ25', 'Φ32', 'Φ40'],
    sortOrder: 1,
    status: 1,
    usedCount: 15,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR002',
    attrName: '材质',
    attrType: AttrType.SINGLE,
    optionValues: ['Q235B', 'Q345B', 'HRB400E', 'PVC', 'PE'],
    sortOrder: 2,
    status: 1,
    usedCount: 20,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR003',
    attrName: '长度',
    attrType: AttrType.SINGLE,
    optionValues: ['6m', '9m', '12m', '定制'],
    sortOrder: 3,
    status: 1,
    usedCount: 18,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR004',
    attrName: '厚度',
    attrType: AttrType.SINGLE,
    optionValues: ['2mm', '3mm', '4mm', '5mm', '6mm', '8mm', '10mm'],
    sortOrder: 4,
    status: 1,
    usedCount: 12,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR005',
    attrName: '强度等级',
    attrType: AttrType.SINGLE,
    optionValues: ['32.5', '42.5', '52.5'],
    sortOrder: 5,
    status: 1,
    usedCount: 8,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR006',
    attrName: '管径',
    attrType: AttrType.SINGLE,
    optionValues: ['DN20', 'DN25', 'DN32', 'DN40', 'DN50', 'DN100'],
    sortOrder: 6,
    status: 1,
    usedCount: 10,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR007',
    attrName: '壁厚',
    attrType: AttrType.SINGLE,
    optionValues: ['2.0mm', '2.5mm', '3.0mm', '4.0mm'],
    sortOrder: 7,
    status: 1,
    usedCount: 10,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR008',
    attrName: '防火等级',
    attrType: AttrType.SINGLE,
    optionValues: ['A级', 'B1级', 'B2级'],
    sortOrder: 8,
    status: 1,
    usedCount: 5,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR009',
    attrName: '颜色',
    attrType: AttrType.SINGLE,
    optionValues: ['白色', '灰色', '红色', '蓝色', '绿色'],
    sortOrder: 9,
    status: 1,
    usedCount: 6,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    attrId: 'ATTR010',
    attrName: '备注',
    attrType: AttrType.INPUT,
    optionValues: [],
    sortOrder: 10,
    status: 1,
    usedCount: 3,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
]

export const MOCK_SPUS: Spu[] = [
  {
    spuId: 'SPU001',
    spuName: '螺纹钢 HRB400E',
    spuCode: 'GJ-LWG-001',
    categoryId: 'CAT001-1',
    categoryName: '螺纹钢',
    unit: '吨',
    attrIds: ['ATTR002', 'ATTR001', 'ATTR003'],
    attrNames: ['材质', '规格型号', '长度'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 12,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU002',
    spuName: '普通硅酸盐水泥',
    spuCode: 'SN-PT-001',
    categoryId: 'CAT002-1',
    categoryName: '普通硅酸盐水泥',
    unit: '吨',
    attrIds: ['ATTR005'],
    attrNames: ['强度等级'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 3,
    createdAt: '2024-01-02 00:00:00',
    updatedAt: '2024-01-02 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU003',
    spuName: 'PVC排水管',
    spuCode: 'GC-PVC-001',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    unit: '米',
    attrIds: ['ATTR006', 'ATTR007'],
    attrNames: ['管径', '壁厚'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 8,
    createdAt: '2024-01-03 00:00:00',
    updatedAt: '2024-01-03 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU004',
    spuName: '防水卷材',
    spuCode: 'FS-JC-001',
    categoryId: 'CAT004-1',
    categoryName: '防水卷材',
    unit: '卷',
    attrIds: ['ATTR004', 'ATTR008'],
    attrNames: ['厚度', '防火等级'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 6,
    createdAt: '2024-01-04 00:00:00',
    updatedAt: '2024-01-04 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU005',
    spuName: '工字钢',
    spuCode: 'GJ-GZG-001',
    categoryId: 'CAT001-2',
    categoryName: '型材',
    unit: '吨',
    attrIds: ['ATTR002', 'ATTR001'],
    attrNames: ['材质', '规格型号'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 5,
    createdAt: '2024-01-05 00:00:00',
    updatedAt: '2024-01-05 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU006',
    spuName: '镀锌钢管',
    spuCode: 'GC-DX-001',
    categoryId: 'CAT003-2',
    categoryName: '镀锌钢管',
    unit: '米',
    attrIds: ['ATTR006', 'ATTR007'],
    attrNames: ['管径', '壁厚'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 10,
    createdAt: '2024-01-06 00:00:00',
    updatedAt: '2024-01-06 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU007',
    spuName: '防水涂料',
    spuCode: 'FS-TL-001',
    categoryId: 'CAT004-2',
    categoryName: '防水涂料',
    unit: '桶',
    attrIds: ['ATTR009'],
    attrNames: ['颜色'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 4,
    createdAt: '2024-01-07 00:00:00',
    updatedAt: '2024-01-07 00:00:00',
    createdBy: 'admin',
  },
  {
    spuId: 'SPU008',
    spuName: '钢板',
    spuCode: 'GJ-GB-001',
    categoryId: 'CAT001-3',
    categoryName: '板材',
    unit: '吨',
    attrIds: ['ATTR002', 'ATTR004'],
    attrNames: ['材质', '厚度'],
    mainImage: 'https://via.placeholder.com/200',
    status: SpuStatus.ENABLED,
    skuCount: 8,
    createdAt: '2024-01-08 00:00:00',
    updatedAt: '2024-01-08 00:00:00',
    createdBy: 'admin',
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
    specs: { '材质': 'HRB400E', '规格型号': 'Φ16', '长度': '6m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 4200,
    supplyPrice: 4000,
    salePrice: 4100,
    costPrice: 3900,
    marketPrice: 4300,
    status: SkuStatus.ON_SHELF,
    supplierCount: 5,
    stockTotal: 1200,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
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
    specs: { '材质': 'HRB400E', '规格型号': 'Φ20', '长度': '9m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 4300,
    supplyPrice: 4100,
    salePrice: 4200,
    costPrice: 4000,
    marketPrice: 4400,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 800,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
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
    specs: { '材质': 'HRB400E', '规格型号': 'Φ25', '长度': '12m' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 4400,
    supplyPrice: 4200,
    salePrice: 4300,
    costPrice: 4100,
    marketPrice: 4500,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 500,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU004',
    skuCode: 'SN-PT-001-42.5',
    skuName: '普通硅酸盐水泥 P.O 42.5',
    spuId: 'SPU002',
    spuName: '普通硅酸盐水泥',
    categoryId: 'CAT002-1',
    categoryName: '普通硅酸盐水泥',
    specs: { '强度等级': '42.5' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 480,
    supplyPrice: 450,
    salePrice: 465,
    costPrice: 440,
    marketPrice: 500,
    status: SkuStatus.ON_SHELF,
    supplierCount: 8,
    stockTotal: 3000,
    createdAt: '2024-01-02 00:00:00',
    updatedAt: '2024-01-02 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU005',
    skuCode: 'SN-PT-001-32.5',
    skuName: '普通硅酸盐水泥 P.O 32.5',
    spuId: 'SPU002',
    spuName: '普通硅酸盐水泥',
    categoryId: 'CAT002-1',
    categoryName: '普通硅酸盐水泥',
    specs: { '强度等级': '32.5' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 420,
    supplyPrice: 400,
    salePrice: 410,
    costPrice: 390,
    marketPrice: 450,
    status: SkuStatus.ON_SHELF,
    supplierCount: 6,
    stockTotal: 2500,
    createdAt: '2024-01-02 00:00:00',
    updatedAt: '2024-01-02 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU006',
    skuCode: 'GC-PVC-001-DN50-2.0',
    skuName: 'PVC排水管 DN50 2.0mm',
    spuId: 'SPU003',
    spuName: 'PVC排水管',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    specs: { '管径': 'DN50', '壁厚': '2.0mm' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 18,
    supplyPrice: 15,
    salePrice: 16.5,
    costPrice: 14,
    marketPrice: 20,
    status: SkuStatus.ON_SHELF,
    supplierCount: 4,
    stockTotal: 5000,
    createdAt: '2024-01-03 00:00:00',
    updatedAt: '2024-01-03 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU007',
    skuCode: 'GC-PVC-001-DN100-3.0',
    skuName: 'PVC排水管 DN100 3.0mm',
    spuId: 'SPU003',
    spuName: 'PVC排水管',
    categoryId: 'CAT003-1',
    categoryName: 'PVC管',
    specs: { '管径': 'DN100', '壁厚': '3.0mm' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 35,
    supplyPrice: 30,
    salePrice: 32,
    costPrice: 28,
    marketPrice: 38,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 3000,
    createdAt: '2024-01-03 00:00:00',
    updatedAt: '2024-01-03 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU008',
    skuCode: 'FS-JC-001-3-B1',
    skuName: '防水卷材 3mm B1级',
    spuId: 'SPU004',
    spuName: '防水卷材',
    categoryId: 'CAT004-1',
    categoryName: '防水卷材',
    specs: { '厚度': '3mm', '防火等级': 'B1级' },
    unit: '卷',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 280,
    supplyPrice: 250,
    salePrice: 265,
    costPrice: 240,
    marketPrice: 300,
    status: SkuStatus.ON_SHELF,
    supplierCount: 2,
    stockTotal: 500,
    createdAt: '2024-01-04 00:00:00',
    updatedAt: '2024-01-04 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU009',
    skuCode: 'FS-JC-001-4-A',
    skuName: '防水卷材 4mm A级',
    spuId: 'SPU004',
    spuName: '防水卷材',
    categoryId: 'CAT004-1',
    categoryName: '防水卷材',
    specs: { '厚度': '4mm', '防火等级': 'A级' },
    unit: '卷',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 380,
    supplyPrice: 350,
    salePrice: 365,
    costPrice: 340,
    marketPrice: 400,
    status: SkuStatus.ON_SHELF,
    supplierCount: 2,
    stockTotal: 300,
    createdAt: '2024-01-04 00:00:00',
    updatedAt: '2024-01-04 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU010',
    skuCode: 'GJ-GZG-001-I20',
    skuName: '工字钢 I20a Q235B',
    spuId: 'SPU005',
    spuName: '工字钢',
    categoryId: 'CAT001-2',
    categoryName: '型材',
    specs: { '材质': 'Q235B', '规格型号': 'I20a' },
    unit: '吨',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 4500,
    supplyPrice: 4300,
    salePrice: 4400,
    costPrice: 4200,
    marketPrice: 4600,
    status: SkuStatus.ON_SHELF,
    supplierCount: 3,
    stockTotal: 200,
    createdAt: '2024-01-05 00:00:00',
    updatedAt: '2024-01-05 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU011',
    skuCode: 'GC-DX-001-DN100-4.0',
    skuName: '镀锌钢管 DN100 4.0mm',
    spuId: 'SPU006',
    spuName: '镀锌钢管',
    categoryId: 'CAT003-2',
    categoryName: '镀锌钢管',
    specs: { '管径': 'DN100', '壁厚': '4.0mm' },
    unit: '米',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 85,
    supplyPrice: 80,
    salePrice: 82,
    costPrice: 78,
    marketPrice: 90,
    status: SkuStatus.OFF_SHELF,
    supplierCount: 0,
    stockTotal: 0,
    createdAt: '2024-01-06 00:00:00',
    updatedAt: '2024-01-06 00:00:00',
    createdBy: 'admin',
  },
  {
    skuId: 'SKU012',
    skuCode: 'FS-TL-001-GRAY',
    skuName: '防水涂料 灰色',
    spuId: 'SPU007',
    spuName: '防水涂料',
    categoryId: 'CAT004-2',
    categoryName: '防水涂料',
    specs: { '颜色': '灰色' },
    unit: '桶',
    mainImage: 'https://via.placeholder.com/200',
    suggestPrice: 320,
    supplyPrice: 280,
    salePrice: 300,
    costPrice: 270,
    marketPrice: 350,
    status: SkuStatus.ON_SHELF,
    supplierCount: 2,
    stockTotal: 800,
    createdAt: '2024-01-07 00:00:00',
    updatedAt: '2024-01-07 00:00:00',
    createdBy: 'admin',
  },
]

export const MOCK_OPERATION_LOGS: ProductOperationLog[] = [
  {
    logId: 'LOG001',
    targetType: 'spu',
    targetId: 'SPU001',
    targetName: '螺纹钢 HRB400E',
    operationType: 'create',
    operationContent: '创建SPU',
    operatorId: 'admin',
    operatorName: '管理员',
    createdAt: '2024-01-01 00:00:00',
  },
  {
    logId: 'LOG002',
    targetType: 'sku',
    targetId: 'SKU001',
    targetName: '螺纹钢 HRB400E Φ16 6m',
    operationType: 'create',
    operationContent: '创建SKU',
    operatorId: 'admin',
    operatorName: '管理员',
    createdAt: '2024-01-01 00:00:00',
  },
  {
    logId: 'LOG003',
    targetType: 'sku',
    targetId: 'SKU001',
    targetName: '螺纹钢 HRB400E Φ16 6m',
    operationType: 'on_shelf',
    operationContent: '上架商品',
    operatorId: 'admin',
    operatorName: '管理员',
    createdAt: '2024-01-02 00:00:00',
  },
  {
    logId: 'LOG004',
    targetType: 'spu',
    targetId: 'SPU002',
    targetName: '普通硅酸盐水泥',
    operationType: 'update',
    operationContent: '修改SPU名称',
    operatorId: 'admin',
    operatorName: '管理员',
    createdAt: '2024-01-03 00:00:00',
  },
  {
    logId: 'LOG005',
    targetType: 'sku',
    targetId: 'SKU011',
    targetName: '镀锌钢管 DN100 4.0mm',
    operationType: 'off_shelf',
    operationContent: '下架商品',
    operatorId: 'admin',
    operatorName: '管理员',
    createdAt: '2024-01-06 00:00:00',
  },
]

export const MOCK_STATISTICS: ProductStatistics = {
  totalSpu: 51,
  totalSku: 179,
  onShelfSku: 165,
  offShelfSku: 14,
  categoryStats: [
    { categoryId: 'CAT001', categoryName: '钢材', spuCount: 15, skuCount: 45 },
    { categoryId: 'CAT002', categoryName: '水泥', spuCount: 10, skuCount: 30 },
    { categoryId: 'CAT003', categoryName: '管材', spuCount: 12, skuCount: 48 },
    { categoryId: 'CAT004', categoryName: '防水材料', spuCount: 8, skuCount: 32 },
    { categoryId: 'CAT005', categoryName: '电线电缆', spuCount: 6, skuCount: 24 },
  ],
}

export const MOCK_ABNORMAL_PRODUCTS: AbnormalProduct[] = [
  {
    skuId: 'SKU011',
    skuCode: 'GC-DX-001-DN100-4.0',
    skuName: '镀锌钢管 DN100 4.0mm',
    spuName: '镀锌钢管',
    abnormalType: 'no_supplier',
    abnormalDesc: '该SKU暂无供应商报价',
    lastUpdateTime: '2024-01-06 00:00:00',
  },
  {
    skuId: 'SKU013',
    skuCode: 'GJ-GB-001-10',
    skuName: '钢板 Q235B 10mm',
    spuName: '钢板',
    abnormalType: 'no_stock',
    abnormalDesc: '该SKU库存为0',
    lastUpdateTime: '2024-01-08 00:00:00',
  },
  {
    skuId: 'SKU015',
    skuCode: 'XC-DL-001-10',
    skuName: '电线 BV 10mm²',
    spuName: '电线',
    abnormalType: 'long_off_shelf',
    abnormalDesc: '该SKU已下架超过30天',
    lastUpdateTime: '2023-12-01 00:00:00',
  },
]

export function getMockCategoryTree(): ProductCategory[] {
  return MOCK_CATEGORIES
}

export function getMockCategoryList(): ProductCategory[] {
  const result: ProductCategory[] = []
  function flatten(categories: ProductCategory[]) {
    categories.forEach(cat => {
      result.push(cat)
      if (cat.children) {
        flatten(cat.children)
      }
    })
  }
  flatten(MOCK_CATEGORIES)
  return result
}

export function getMockCategoryDetail(categoryId: string): ProductCategory | null {
  const list = getMockCategoryList()
  return list.find(c => c.categoryId === categoryId) || null
}

export function createMockCategory(data: CreateCategoryParams): ProductCategory {
  const list = getMockCategoryList()
  const maxId = list.reduce((max, c) => {
    const num = parseInt(c.categoryId.replace('CAT', '').replace(/-\d+/, ''))
    return num > max ? num : max
  }, 0)
  
  const parent = data.parentId ? list.find(c => c.categoryId === data.parentId) : null
  const level = parent ? parent.level + 1 : 1
  
  const newCategory: ProductCategory = {
    categoryId: 'CAT' + String(maxId + 1).padStart(3, '0'),
    categoryName: data.categoryName,
    parentId: data.parentId,
    level,
    sortOrder: data.sortOrder || 0,
    status: data.status ?? ProductCategoryStatus.ENABLED,
    icon: data.icon,
    spuCount: 0,
    skuCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  
  return newCategory
}

export function updateMockCategory(categoryId: string, data: UpdateCategoryParams): ProductCategory | null {
  const category = getMockCategoryDetail(categoryId)
  if (!category) return null
  
  return {
    ...category,
    ...data,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
}

export function deleteMockCategory(categoryId: string): { success: boolean; message: string } {
  const category = getMockCategoryDetail(categoryId)
  if (!category) {
    return { success: false, message: '分类不存在' }
  }
  
  if (category.children && category.children.length > 0) {
    return { success: false, message: '该分类下存在子分类，无法删除' }
  }
  
  if (category.spuCount && category.spuCount > 0) {
    return { success: false, message: '该分类下存在商品，无法删除' }
  }
  
  return { success: true, message: '删除成功' }
}

export function getMockAttrList(params: PaginationParams & { keyword?: string; status?: number }): PaginationResult<ProductAttr> {
  let list = [...MOCK_ATTRS]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(a => a.attrName.toLowerCase().includes(keyword))
  }
  
  if (params.status !== undefined) {
    list = list.filter(a => a.status === params.status)
  }
  
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: list.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

export function getMockAttrDetail(attrId: string): ProductAttr | null {
  return MOCK_ATTRS.find(a => a.attrId === attrId) || null
}

export function createMockAttr(data: CreateAttrParams): ProductAttr {
  const maxId = MOCK_ATTRS.reduce((max, a) => {
    const num = parseInt(a.attrId.replace('ATTR', ''))
    return num > max ? num : max
  }, 0)
  
  const newAttr: ProductAttr = {
    attrId: 'ATTR' + String(maxId + 1).padStart(3, '0'),
    attrName: data.attrName,
    attrType: data.attrType,
    optionValues: data.optionValues,
    sortOrder: data.sortOrder || 0,
    status: 1,
    usedCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  
  MOCK_ATTRS.push(newAttr)
  return newAttr
}

export function updateMockAttr(attrId: string, data: UpdateAttrParams): ProductAttr | null {
  const index = MOCK_ATTRS.findIndex(a => a.attrId === attrId)
  if (index === -1) return null
  
  MOCK_ATTRS[index] = {
    ...MOCK_ATTRS[index],
    ...data,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_ATTRS[index]
}

export function deleteMockAttr(attrId: string): { success: boolean; message: string } {
  const attr = MOCK_ATTRS.find(a => a.attrId === attrId)
  if (!attr) {
    return { success: false, message: '属性不存在' }
  }
  
  if (attr.usedCount && attr.usedCount > 0) {
    return { success: false, message: '该属性已被SPU使用，无法删除' }
  }
  
  const index = MOCK_ATTRS.findIndex(a => a.attrId === attrId)
  if (index > -1) {
    MOCK_ATTRS.splice(index, 1)
  }
  
  return { success: true, message: '删除成功' }
}

export function getMockSpuList(params: PaginationParams & { keyword?: string; categoryId?: string; status?: number }): PaginationResult<Spu> {
  let list = [...MOCK_SPUS]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(s => 
      s.spuName.toLowerCase().includes(keyword) ||
      (s.spuCode && s.spuCode.toLowerCase().includes(keyword))
    )
  }
  
  if (params.categoryId) {
    list = list.filter(s => s.categoryId === params.categoryId)
  }
  
  if (params.status !== undefined) {
    list = list.filter(s => s.status === params.status)
  }
  
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: list.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

export function getMockSpuDetail(spuId: string): Spu | null {
  return MOCK_SPUS.find(s => s.spuId === spuId) || null
}

export function createMockSpu(data: CreateSpuParams): Spu {
  const maxId = MOCK_SPUS.reduce((max, s) => {
    const num = parseInt(s.spuId.replace('SPU', ''))
    return num > max ? num : max
  }, 0)
  
  const category = getMockCategoryDetail(data.categoryId)
  
  const newSpu: Spu = {
    spuId: 'SPU' + String(maxId + 1).padStart(3, '0'),
    spuName: data.spuName,
    spuCode: data.spuCode,
    categoryId: data.categoryId,
    categoryName: category?.categoryName,
    unit: data.unit,
    attrIds: data.attrIds,
    mainImage: data.mainImage,
    images: data.images,
    description: data.description,
    status: SpuStatus.ENABLED,
    skuCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    createdBy: 'admin',
  }
  
  MOCK_SPUS.push(newSpu)
  return newSpu
}

export function updateMockSpu(spuId: string, data: UpdateSpuParams): Spu | null {
  const index = MOCK_SPUS.findIndex(s => s.spuId === spuId)
  if (index === -1) return null
  
  let categoryName = MOCK_SPUS[index].categoryName
  if (data.categoryId) {
    const category = getMockCategoryDetail(data.categoryId)
    categoryName = category?.categoryName
  }
  
  MOCK_SPUS[index] = {
    ...MOCK_SPUS[index],
    ...data,
    categoryName,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SPUS[index]
}

export function deleteMockSpu(spuId: string): { success: boolean; message: string } {
  const spu = MOCK_SPUS.find(s => s.spuId === spuId)
  if (!spu) {
    return { success: false, message: 'SPU不存在' }
  }
  
  if (spu.skuCount && spu.skuCount > 0) {
    return { success: false, message: '该SPU下存在SKU，无法删除' }
  }
  
  const index = MOCK_SPUS.findIndex(s => s.spuId === spuId)
  if (index > -1) {
    MOCK_SPUS.splice(index, 1)
  }
  
  return { success: true, message: '删除成功' }
}

export function getMockSkuList(params: PaginationParams & { keyword?: string; spuId?: string; categoryId?: string; status?: number }): PaginationResult<Sku> {
  let list = [...MOCK_SKUS]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(s => 
      s.skuName.toLowerCase().includes(keyword) ||
      s.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (params.spuId) {
    list = list.filter(s => s.spuId === params.spuId)
  }
  
  if (params.categoryId) {
    list = list.filter(s => s.categoryId === params.categoryId)
  }
  
  if (params.status !== undefined) {
    list = list.filter(s => s.status === params.status)
  }
  
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: list.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

export function getMockSkuDetail(skuId: string): Sku | null {
  return MOCK_SKUS.find(s => s.skuId === skuId) || null
}

export function createMockSku(data: CreateSkuParams): Sku {
  const maxId = MOCK_SKUS.reduce((max, s) => {
    const num = parseInt(s.skuId.replace('SKU', ''))
    return num > max ? num : max
  }, 0)
  
  const spu = getMockSpuDetail(data.spuId)
  
  const newSku: Sku = {
    skuId: 'SKU' + String(maxId + 1).padStart(3, '0'),
    skuCode: data.skuCode,
    skuName: data.skuName,
    spuId: data.spuId,
    spuName: spu?.spuName,
    categoryId: spu?.categoryId,
    categoryName: spu?.categoryName,
    specs: data.specs,
    barcode: data.barcode,
    unit: data.unit,
    mainImage: data.mainImage,
    images: data.images,
    status: SkuStatus.OFF_SHELF,
    supplierCount: 0,
    stockTotal: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    createdBy: 'admin',
  }
  
  MOCK_SKUS.push(newSku)
  return newSku
}

export function updateMockSku(skuId: string, data: UpdateSkuParams): Sku | null {
  const index = MOCK_SKUS.findIndex(s => s.skuId === skuId)
  if (index === -1) return null
  
  MOCK_SKUS[index] = {
    ...MOCK_SKUS[index],
    ...data,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_SKUS[index]
}

export function batchUpdateMockSkuStatus(skuIds: string[], status: SkuStatus): boolean {
  skuIds.forEach(skuId => {
    const index = MOCK_SKUS.findIndex(s => s.skuId === skuId)
    if (index > -1) {
      MOCK_SKUS[index].status = status
      MOCK_SKUS[index].updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
  })
  return true
}

export function getMockSkuListBySpu(spuId: string): Sku[] {
  return MOCK_SKUS.filter(s => s.spuId === spuId)
}

export function getMockProductStatistics(): ProductStatistics {
  return MOCK_STATISTICS
}

export function getMockOperationLogs(params: PaginationParams & { targetType?: string; targetId?: string }): PaginationResult<ProductOperationLog> {
  let list = [...MOCK_OPERATION_LOGS]
  
  if (params.targetType) {
    list = list.filter(l => l.targetType === params.targetType)
  }
  
  if (params.targetId) {
    list = list.filter(l => l.targetId === params.targetId)
  }
  
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: list.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

export function getMockAbnormalProducts(params: PaginationParams & { abnormalType?: string }): PaginationResult<AbnormalProduct> {
  let list = [...MOCK_ABNORMAL_PRODUCTS]
  
  if (params.abnormalType) {
    list = list.filter(p => p.abnormalType === params.abnormalType)
  }
  
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: list.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}
