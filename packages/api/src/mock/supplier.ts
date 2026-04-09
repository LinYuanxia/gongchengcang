
export interface SupplierSpu {
  spuId: string
  spuCode: string
  spuName: string
  categoryId?: string
  categoryName?: string
  mainImage?: string
  unit: string
  source: 'self' | 'platform'
  skuCount: number
  auditStatus?: 'pending' | 'approved' | 'rejected'
  status?: number
  attrIds?: string[]
  attrNames?: string[]
  createdAt: string
  updatedAt?: string
}

export interface SupplierSku {
  id: string
  skuId?: string
  skuCode: string
  skuName: string
  spuId: string
  spuName: string
  categoryId?: string
  categoryName?: string
  specs: Record<string, string>
  unit: string
  mainImage?: string
  source: 'self' | 'platform'
  platformPrice?: number
  supplyPrice?: number
  estimatedStock: number
  minOrderQty: number
  leadTime: number
  auditStatus?: 'pending' | 'approved' | 'rejected'
  supplyStatus: 'supplying' | 'paused' | 'stopped'
  shelfStatus: 'on' | 'off'
  createdAt: string
  updatedAt?: string
}

export interface SupplierOrder {
  id: string
  orderNo: string
  warehouseId: string
  warehouseName: string
  skuCount: number
  totalAmount: number
  deliveryDate: string
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  paymentMethod?: string
  paymentTime?: string
  paymentSerial?: string
  paymentVoucher?: string
  paymentAuditStatus?: 'pending' | 'approved' | 'rejected'
  paymentAuditRemark?: string
  createTime: string
  confirmTime?: string
  shipTime?: string
  completeTime?: string
  address: string
  remark?: string
  logisticsCompany?: string
  logisticsNo?: string
  logisticsStatus?: 'pending' | 'transporting' | 'delivered'
  logisticsTracks?: LogisticsTrack[]
  invoiceStatus?: 'pending' | 'issued'
  invoiceNo?: string
  invoiceType?: string
  invoiceTime?: string
  invoiceAmount?: string
  taxRate?: string
  logs?: OrderLog[]
}

export interface LogisticsTrack {
  time: string
  content: string
}

export interface OrderLog {
  time: string
  content: string
}

export interface Settlement {
  id: string
  settlementNo: string
  amount: string
  bankName: string
  bankCard: string
  applyTime: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  arrivalTime?: string
}

export interface Transaction {
  time: string
  type: 'income' | 'expense' | 'recharge' | 'withdraw' | 'freeze' | 'unfreeze'
  amount: string
  description: string
  orderNo?: string
  balance: string
  status: 'pending' | 'success' | 'failed'
  transactionNo: string
}

export const MOCK_SUPPLIER_SPUS: SupplierSpu[] = [
  {
    spuId: 'spu001',
    spuCode: 'SPU-TEST-001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    source: 'self',
    skuCount: 2,
    auditStatus: 'approved',
    status: 1,
    attrIds: ['ATTR001', 'ATTR002'],
    attrNames: ['品牌', '强度等级'],
    createdAt: '2024-01-15 10:30:00',
  },
  {
    spuId: 'spu002',
    spuCode: 'SPU-TEST-002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    source: 'platform',
    skuCount: 3,
    auditStatus: 'approved',
    status: 1,
    attrIds: ['ATTR001', 'ATTR002', 'ATTR003'],
    attrNames: ['品牌', '材质', '规格'],
    createdAt: '2024-01-14 14:20:00',
  },
  {
    spuId: 'spu003',
    spuCode: 'SPU-TEST-003',
    spuName: '建筑用砂',
    categoryName: '砂石',
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    source: 'self',
    skuCount: 1,
    auditStatus: 'pending',
    status: 1,
    attrIds: ['ATTR003'],
    attrNames: ['类型'],
    createdAt: '2024-01-16 09:15:00',
  },
  {
    spuId: 'spu004',
    spuCode: 'SPU-TEST-004',
    spuName: 'SBS防水卷材',
    categoryName: '防水材料',
    mainImage: 'https://picsum.photos/200/200?random=9',
    unit: '平方米',
    source: 'platform',
    skuCount: 2,
    auditStatus: 'approved',
    status: 1,
    attrIds: ['ATTR001', 'ATTR003'],
    attrNames: ['品牌', '厚度'],
    createdAt: '2024-01-12 16:45:00',
  },
]

export const MOCK_SUPPLIER_SKUS: SupplierSku[] = [
  {
    id: 'sku001',
    skuCode: 'SKU-TEST-001-42.5',
    skuName: '水泥 P.O 42.5',
    spuId: 'spu001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '42.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=4',
    source: 'self',
    platformPrice: 450,
    supplyPrice: 420,
    estimatedStock: 1000,
    minOrderQty: 10,
    leadTime: 3,
    auditStatus: 'approved',
    supplyStatus: 'supplying',
    shelfStatus: 'on',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: 'sku002',
    skuCode: 'SKU-TEST-001-52.5',
    skuName: '水泥 P.O 52.5',
    spuId: 'spu001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '52.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=5',
    source: 'self',
    platformPrice: 500,
    supplyPrice: 480,
    estimatedStock: 800,
    minOrderQty: 10,
    leadTime: 3,
    auditStatus: 'approved',
    supplyStatus: 'supplying',
    shelfStatus: 'on',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: 'sku003',
    skuCode: 'SKU-TEST-002-20',
    skuName: '螺纹钢 HRB400E 20mm',
    spuId: 'spu002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '20mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=6',
    source: 'platform',
    platformPrice: 3800,
    supplyPrice: 3600,
    estimatedStock: 500,
    minOrderQty: 5,
    leadTime: 7,
    auditStatus: 'approved',
    supplyStatus: 'supplying',
    shelfStatus: 'on',
    createdAt: '2024-01-14 14:20:00',
  },
  {
    id: 'sku004',
    skuCode: 'SKU-TEST-002-25',
    skuName: '螺纹钢 HRB400E 25mm',
    spuId: 'spu002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '25mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=7',
    source: 'platform',
    platformPrice: 3750,
    supplyPrice: 3550,
    estimatedStock: 600,
    minOrderQty: 5,
    leadTime: 7,
    auditStatus: 'approved',
    supplyStatus: 'paused',
    shelfStatus: 'off',
    createdAt: '2024-01-14 14:20:00',
  },
  {
    id: 'sku005',
    skuCode: 'SKU-TEST-003',
    skuName: '砂子 中砂',
    spuId: 'spu003',
    spuName: '建筑用砂',
    categoryName: '砂石',
    specs: { '类型': '中砂' },
    unit: '方',
    mainImage: 'https://picsum.photos/200/200?random=8',
    source: 'self',
    platformPrice: 95,
    supplyPrice: 85,
    estimatedStock: 2000,
    minOrderQty: 20,
    leadTime: 2,
    auditStatus: 'pending',
    supplyStatus: 'supplying',
    shelfStatus: 'off',
    createdAt: '2024-01-16 09:15:00',
  },
]

export const MOCK_SUPPLIER_ORDERS: SupplierOrder[] = [
  {
    id: '1',
    orderNo: 'PO202401001',
    warehouseId: 'WH001',
    warehouseName: '深圳宝安工程仓',
    skuCount: 5,
    totalAmount: 28500,
    deliveryDate: '2024-01-25',
    status: 'pending',
    paymentStatus: 'unpaid',
    createTime: '2024-01-20 10:30:00',
    address: '深圳市宝安区西乡街道XX路XX号',
    remark: '请尽快发货',
    invoiceStatus: undefined,
    logs: [
      { time: '2024-01-20 10:30:00', content: '订单创建' },
    ],
  },
  {
    id: '6',
    orderNo: 'PO202401006',
    warehouseId: 'WH001',
    warehouseName: '深圳南山工程仓',
    skuCount: 10,
    totalAmount: 68000,
    deliveryDate: '2024-01-26',
    status: 'pending',
    paymentStatus: 'unpaid',
    createTime: '2024-01-21 09:00:00',
    address: '深圳市南山区科技园XX路XX号',
    remark: '',
    invoiceStatus: undefined,
    logs: [
      { time: '2024-01-21 09:00:00', content: '订单创建' },
    ],
  },
  {
    id: '7',
    orderNo: 'PO202401007',
    warehouseId: 'WH006',
    warehouseName: '中山火炬工程仓',
    skuCount: 15,
    totalAmount: 125000,
    deliveryDate: '2024-02-05',
    status: 'confirmed',
    paymentStatus: 'unpaid',
    paymentMethod: '银行转账',
    paymentTime: '2024-01-18 09:15:00',
    paymentSerial: 'BT2024011809150007',
    paymentVoucher: 'https://picsum.photos/600/400?random=7',
    paymentAuditStatus: 'pending',
    createTime: '2024-01-18 10:00:00',
    confirmTime: '2024-01-18 12:00:00',
    address: '中山市火炬开发区XX路XX号',
    remark: '',
    invoiceStatus: undefined,
    logs: [
      { time: '2024-01-18 10:00:00', content: '订单创建' },
      { time: '2024-01-18 12:00:00', content: '订单已确认，等待采购方支付' },
      { time: '2024-01-18 15:30:00', content: '采购方已提交转账凭证，等待供应商审核' },
    ],
  },
  {
    id: '8',
    orderNo: 'PO202401008',
    warehouseId: 'WH007',
    warehouseName: '珠海香洲工程仓',
    skuCount: 6,
    totalAmount: 52000,
    deliveryDate: '2024-02-01',
    status: 'confirmed',
    paymentStatus: 'unpaid',
    paymentMethod: '银行转账',
    paymentTime: '2024-01-17 14:20:00',
    paymentSerial: 'BT2024011714200008',
    paymentVoucher: 'https://picsum.photos/600/400?random=8',
    paymentAuditStatus: 'pending',
    createTime: '2024-01-17 14:00:00',
    confirmTime: '2024-01-17 16:00:00',
    address: '珠海市香洲区XX路XX号',
    remark: '发票随货同行',
    invoiceStatus: undefined,
    logs: [
      { time: '2024-01-17 14:00:00', content: '订单创建' },
      { time: '2024-01-17 16:00:00', content: '订单已确认，等待采购方支付' },
      { time: '2024-01-17 18:00:00', content: '采购方已提交转账凭证，等待供应商审核' },
    ],
  },
  {
    id: '2',
    orderNo: 'PO202401002',
    warehouseId: 'WH002',
    warehouseName: '广州天河工程仓',
    skuCount: 8,
    totalAmount: 156000,
    deliveryDate: '2024-01-28',
    status: 'confirmed',
    paymentStatus: 'paid',
    createTime: '2024-01-19 14:00:00',
    confirmTime: '2024-01-19 16:30:00',
    address: '广州市天河区棠下街道XX路XX号',
    remark: '',
    invoiceStatus: undefined,
    logs: [
      { time: '2024-01-19 14:00:00', content: '订单创建' },
      { time: '2024-01-19 16:30:00', content: '订单已确认' },
    ],
  },
  {
    id: '3',
    orderNo: 'PO202401003',
    warehouseId: 'WH003',
    warehouseName: '东莞南城工程仓',
    skuCount: 12,
    totalAmount: 89000,
    deliveryDate: '2024-01-30',
    status: 'shipped',
    paymentStatus: 'paid',
    createTime: '2024-01-18 09:00:00',
    confirmTime: '2024-01-18 11:00:00',
    shipTime: '2024-01-20 15:00:00',
    address: '东莞市南城区鸿福路XX号',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890',
    logisticsStatus: 'transporting',
    logisticsTracks: [
      { time: '2024-01-20 15:00', content: '已发货，顺丰速运揽收' },
      { time: '2024-01-20 18:30', content: '快件已到达深圳集散中心' },
      { time: '2024-01-21 08:00', content: '快件已发出，下一站东莞转运中心' },
    ],
    invoiceStatus: undefined,
    logs: [
      { time: '2024-01-18 09:00:00', content: '订单创建' },
      { time: '2024-01-18 11:00:00', content: '订单已确认' },
      { time: '2024-01-20 15:00:00', content: '已发货，物流公司：顺丰速运，运单号：SF1234567890' },
    ],
  },
  {
    id: '4',
    orderNo: 'PO202401004',
    warehouseId: 'WH004',
    warehouseName: '佛山禅城工程仓',
    skuCount: 3,
    totalAmount: 12500,
    deliveryDate: '2024-01-22',
    status: 'completed',
    paymentStatus: 'paid',
    createTime: '2024-01-21 16:00:00',
    confirmTime: '2024-01-21 17:00:00',
    shipTime: '2024-01-22 09:00:00',
    completeTime: '2024-01-23 14:00:00',
    address: '佛山市禅城区祖庙路XX号',
    logisticsCompany: '京东物流',
    logisticsNo: 'JD9876543210',
    invoiceStatus: 'pending',
    logs: [
      { time: '2024-01-21 16:00:00', content: '订单创建' },
      { time: '2024-01-21 17:00:00', content: '订单已确认' },
      { time: '2024-01-22 09:00:00', content: '已发货，物流公司：京东物流，运单号：JD9876543210' },
      { time: '2024-01-23 14:00:00', content: '订单已完成' },
    ],
  },
  {
    id: '5',
    orderNo: 'PO202401005',
    warehouseId: 'WH005',
    warehouseName: '惠州惠城工程仓',
    skuCount: 6,
    totalAmount: 45000,
    deliveryDate: '2024-01-26',
    status: 'completed',
    paymentStatus: 'paid',
    createTime: '2024-01-20 11:00:00',
    confirmTime: '2024-01-20 13:00:00',
    shipTime: '2024-01-21 10:00:00',
    completeTime: '2024-01-22 16:00:00',
    address: '惠州市惠城区XX路XX号',
    logisticsCompany: '中通快递',
    logisticsNo: 'ZT1234567890',
    invoiceStatus: 'issued',
    invoiceNo: 'INV20240122001',
    invoiceType: '增值税专用发票',
    invoiceTime: '2024-01-23 10:00:00',
    invoiceAmount: '45000',
    taxRate: '13%',
    logs: [
      { time: '2024-01-20 11:00:00', content: '订单创建' },
      { time: '2024-01-20 13:00:00', content: '订单已确认' },
      { time: '2024-01-21 10:00:00', content: '已发货，物流公司：中通快递，运单号：ZT1234567890' },
      { time: '2024-01-22 16:00:00', content: '订单已完成' },
      { time: '2024-01-23 10:00:00', content: '已开具发票，发票号：INV20240122001' },
    ],
  },
]

export const MOCK_SETTLEMENTS: Settlement[] = [
  { id: '1', settlementNo: 'JS202401150001', amount: '50,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-15 10:00:00', status: 'success', arrivalTime: '2024-01-16 14:30:00' },
  { id: '2', settlementNo: 'JS202401140001', amount: '35,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-14 16:20:00', status: 'processing', arrivalTime: '' },
  { id: '3', settlementNo: 'JS202401130001', amount: '28,500.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-13 09:15:00', status: 'pending', arrivalTime: '' },
  { id: '4', settlementNo: 'JS202401120001', amount: '43,200.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-12 14:00:00', status: 'failed', arrivalTime: '' },
  { id: '5', settlementNo: 'JS202401110001', amount: '65,000.00', bankName: '中国工商银行', bankCard: '****8901', applyTime: '2024-01-11 11:30:00', status: 'success', arrivalTime: '2024-01-12 10:00:00' },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  { time: '2024-01-15 16:30:00', type: 'income', amount: '85,000.00', description: '销售订单收款', orderNo: 'PO202401150001', balance: '256,800.00', status: 'success', transactionNo: 'TXN202401150001' },
  { time: '2024-01-14 10:00:00', type: 'income', amount: '52,300.00', description: '销售订单收款', orderNo: 'PO202401140001', balance: '171,800.00', status: 'success', transactionNo: 'TXN202401140001' },
  { time: '2024-01-13 15:30:00', type: 'withdraw', amount: '12,000.00', description: '账户提现', orderNo: '', balance: '119,500.00', status: 'success', transactionNo: 'TXN202401130001' },
  { time: '2024-01-12 09:00:00', type: 'recharge', amount: '50,000.00', description: '账户充值', orderNo: '', balance: '131,500.00', status: 'success', transactionNo: 'TXN202401120001' },
  { time: '2024-01-11 14:00:00', type: 'income', amount: '45,800.00', description: '销售订单收款', orderNo: 'PO202401110001', balance: '81,500.00', status: 'success', transactionNo: 'TXN202401110001' },
  { time: '2024-01-10 16:00:00', type: 'freeze', amount: '30,000.00', description: '订单保证金冻结', orderNo: 'PO202401100001', balance: '35,700.00', status: 'success', transactionNo: 'TXN202401100001' },
  { time: '2024-01-09 11:00:00', type: 'income', amount: '38,500.00', description: '销售订单收款', orderNo: 'PO202401090001', balance: '65,700.00', status: 'success', transactionNo: 'TXN202401090001' },
]

export function getSupplierSpuList(params?: { keyword?: string; categoryId?: string; auditStatus?: string }) {
  let result = [...MOCK_SUPPLIER_SPUS]
  
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase()
    result = result.filter(p => 
      p.spuName.toLowerCase().includes(keyword) || 
      p.spuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (params?.auditStatus) {
    result = result.filter(p => p.auditStatus === params.auditStatus)
  }
  
  return {
    list: result,
    total: result.length,
  }
}

export function getSupplierSkuList(params?: { keyword?: string; categoryId?: string; supplyStatus?: string; shelfStatus?: string }) {
  let result = [...MOCK_SUPPLIER_SKUS]
  
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(keyword) || 
      p.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (params?.supplyStatus) {
    result = result.filter(p => p.supplyStatus === params.supplyStatus)
  }
  
  if (params?.shelfStatus) {
    result = result.filter(p => p.shelfStatus === params.shelfStatus)
  }
  
  return {
    list: result,
    total: result.length,
  }
}

export function getSupplierOrderList(params?: { status?: string }) {
  let result = [...MOCK_SUPPLIER_ORDERS]
  
  if (params?.status && params.status !== 'all') {
    result = result.filter(o => o.status === params.status)
  }
  
  return {
    list: result,
    total: result.length,
  }
}

export function getSupplierOrderDetail(orderId: string) {
  return MOCK_SUPPLIER_ORDERS.find(o => o.id === orderId)
}

export function confirmSupplierOrder(orderId: string, data: { 
  estimatedShipDate?: string; 
  remark?: string;
  acceptItems?: any[];
  rejectItems?: any[];
}) {
  const order = MOCK_SUPPLIER_ORDERS.find(o => o.id === orderId)
  if (order) {
    order.status = 'confirmed'
    order.confirmTime = new Date().toISOString()
    
    const acceptCount = data.acceptItems?.length || 0
    const rejectCount = data.rejectItems?.length || 0
    
    if (rejectCount > 0) {
      order.logs?.push({
        time: new Date().toISOString(),
        content: `订单部分确认：确认 ${acceptCount} 种，无法供货 ${rejectCount} 种`,
      })
    } else {
      order.logs?.push({
        time: new Date().toISOString(),
        content: `订单已全部确认`,
      })
    }
  }
  return { success: true }
}

export function shipSupplierOrder(orderId: string, data: { logisticsCompany: string; logisticsNo: string; remark?: string }) {
  const order = MOCK_SUPPLIER_ORDERS.find(o => o.id === orderId)
  if (order) {
    order.status = 'shipped'
    order.shipTime = new Date().toISOString()
    order.logisticsCompany = data.logisticsCompany
    order.logisticsNo = data.logisticsNo
    order.logs?.push({
      time: new Date().toISOString(),
      content: `已发货，物流公司：${data.logisticsCompany}，运单号：${data.logisticsNo}`,
    })
  }
  return { success: true }
}

export function updateSupplierSkuSupplyStatus(skuId: string, status: 'supplying' | 'paused' | 'stopped') {
  const sku = MOCK_SUPPLIER_SKUS.find(s => s.id === skuId)
  if (sku) {
    sku.supplyStatus = status
    if (status === 'stopped') {
      sku.shelfStatus = 'off'
    }
  }
  return { success: true }
}

export function updateSupplierSkuShelfStatus(skuId: string, status: 'on' | 'off') {
  const sku = MOCK_SUPPLIER_SKUS.find(s => s.id === skuId)
  if (sku) {
    sku.shelfStatus = status
  }
  return { success: true }
}

export function batchUpdateSupplierSkuShelfStatus(skuIds: string[], status: 'on' | 'off') {
  skuIds.forEach(skuId => {
    updateSupplierSkuShelfStatus(skuId, status)
  })
  return { success: true }
}

export function updateSupplierSku(skuId: string, data: { supplyPrice?: number; estimatedStock?: number; minOrderQty?: number; leadTime?: number }) {
  const sku = MOCK_SUPPLIER_SKUS.find(s => s.id === skuId)
  if (sku) {
    Object.assign(sku, data)
  }
  return { success: true }
}
