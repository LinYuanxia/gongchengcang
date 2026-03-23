import type { Merchant, MerchantFormData, Contract, Qualification, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { TenantType, RegistrationStatus, EnabledStatus, EnterpriseType, TaxPayerType, ContractType, ContractStatus, QualificationStatus } from '@gongchengcang/types'

const MOCK_MERCHANTS: Merchant[] = [
  {
    tenantId: 'T001',
    tenantType: TenantType.SUPPLIER,
    merchantName: '华东建材供应商',
    contactPerson: '张三',
    contactPhone: '13800138001',
    registrationStatus: RegistrationStatus.APPROVED,
    enabledStatus: EnabledStatus.ENABLED,
    enterpriseInfo: {
      enterpriseName: '华东建材有限公司',
      enterpriseType: EnterpriseType.COMPANY,
      unifiedSocialCreditCode: '91310000MA1K5L3X5X',
      taxPayerType: TaxPayerType.GENERAL,
      legalPersonName: '张三',
      legalPersonIdCard: '310101199001011234',
      businessLicensePic: 'https://via.placeholder.com/200',
      businessLicenseExpire: '2030-12-31',
      idCardPicFront: 'https://via.placeholder.com/200',
      idCardPicBack: 'https://via.placeholder.com/200',
      registeredAddress: '上海市浦东新区',
      actualAddress: '上海市浦东新区张江高科技园区',
      registeredCapital: 1000,
      establishedDate: '2015-06-15',
      businessScope: '建筑材料销售、钢材、水泥、砂石等',
    },
    settlementAccount: {
      accountName: '华东建材有限公司',
      bankAccount: '6222021234567890123',
      bankName: '中国工商银行',
      bankBranch: '上海浦东支行',
      bankBranchCode: '1022900',
    },
    remark: '优质供应商',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 10:30:00',
  },
  {
    tenantId: 'T002',
    tenantType: TenantType.CONSTRUCTOR,
    merchantName: '城建施工集团',
    contactPerson: '李四',
    contactPhone: '13800138002',
    registrationStatus: RegistrationStatus.APPROVED,
    enabledStatus: EnabledStatus.ENABLED,
    enterpriseInfo: {
      enterpriseName: '城建施工集团有限公司',
      enterpriseType: EnterpriseType.COMPANY,
      unifiedSocialCreditCode: '91310000MA1K5L3X6Y',
      taxPayerType: TaxPayerType.GENERAL,
      legalPersonName: '李四',
      legalPersonIdCard: '310101199002021234',
      businessLicensePic: 'https://via.placeholder.com/200',
      businessLicenseExpire: '2030-12-31',
      idCardPicFront: 'https://via.placeholder.com/200',
      idCardPicBack: 'https://via.placeholder.com/200',
      registeredAddress: '上海市徐汇区',
      actualAddress: '上海市徐汇区漕河泾开发区',
      registeredCapital: 5000,
      establishedDate: '2010-03-20',
      businessScope: '建筑工程施工、市政工程、道路工程等',
    },
    settlementAccount: {
      accountName: '城建施工集团有限公司',
      bankAccount: '6222021234567890456',
      bankName: '中国建设银行',
      bankBranch: '上海徐汇支行',
      bankBranchCode: '1052900',
    },
    remark: '',
    createdAt: '2024-01-18 14:20:00',
    updatedAt: '2024-01-18 14:20:00',
  },
  {
    tenantId: 'T003',
    tenantType: TenantType.WAREHOUSE,
    merchantName: '浦东工程仓库',
    contactPerson: '王五',
    contactPhone: '13800138003',
    registrationStatus: RegistrationStatus.PENDING,
    enabledStatus: EnabledStatus.DISABLED,
    enterpriseInfo: {
      enterpriseName: '浦东工程仓库有限公司',
      enterpriseType: EnterpriseType.COMPANY,
      unifiedSocialCreditCode: '91310000MA1K5L3X7Z',
      taxPayerType: TaxPayerType.SMALL,
      legalPersonName: '王五',
      legalPersonIdCard: '310101199003031234',
      businessLicensePic: 'https://via.placeholder.com/200',
      businessLicenseExpire: '2028-06-30',
      idCardPicFront: 'https://via.placeholder.com/200',
      idCardPicBack: 'https://via.placeholder.com/200',
      registeredAddress: '上海市浦东新区',
      actualAddress: '上海市浦东新区外高桥保税区',
      registeredCapital: 800,
      establishedDate: '2018-09-10',
      businessScope: '仓储服务、物流配送、货物装卸等',
    },
    settlementAccount: {
      accountName: '浦东工程仓库有限公司',
      bankAccount: '6222021234567890789',
      bankName: '中国农业银行',
      bankBranch: '上海浦东支行',
      bankBranchCode: '1032900',
    },
    remark: '待审核',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00',
  },
  {
    tenantId: 'T004',
    tenantType: TenantType.SUPPLIER,
    merchantName: '南方钢材供应商',
    contactPerson: '赵六',
    contactPhone: '13800138004',
    registrationStatus: RegistrationStatus.APPROVED,
    enabledStatus: EnabledStatus.ENABLED,
    enterpriseInfo: {
      enterpriseName: '南方钢材有限公司',
      enterpriseType: EnterpriseType.COMPANY,
      unifiedSocialCreditCode: '91310000MA1K5L3X8A',
      taxPayerType: TaxPayerType.GENERAL,
      legalPersonName: '赵六',
      legalPersonIdCard: '310101199004041234',
      businessLicensePic: 'https://via.placeholder.com/200',
      businessLicenseExpire: '2032-12-31',
      idCardPicFront: 'https://via.placeholder.com/200',
      idCardPicBack: 'https://via.placeholder.com/200',
      registeredAddress: '上海市闵行区',
      actualAddress: '上海市闵行区莘庄工业区',
      registeredCapital: 2000,
      establishedDate: '2012-11-25',
      businessScope: '钢材、型材、管材销售',
    },
    settlementAccount: {
      accountName: '南方钢材有限公司',
      bankAccount: '6222021234567890111',
      bankName: '中国银行',
      bankBranch: '上海闵行支行',
      bankBranchCode: '1042900',
    },
    remark: '',
    createdAt: '2024-02-05 16:45:00',
    updatedAt: '2024-02-05 16:45:00',
  },
  {
    tenantId: 'T005',
    tenantType: TenantType.WAREHOUSE,
    merchantName: '虹桥工程仓',
    contactPerson: '钱七',
    contactPhone: '13800138005',
    registrationStatus: RegistrationStatus.REJECTED,
    enabledStatus: EnabledStatus.DISABLED,
    enterpriseInfo: {
      enterpriseName: '虹桥工程仓有限公司',
      enterpriseType: EnterpriseType.COMPANY,
      unifiedSocialCreditCode: '91310000MA1K5L3X9B',
      taxPayerType: TaxPayerType.SMALL,
      legalPersonName: '钱七',
      legalPersonIdCard: '310101199005051234',
      businessLicensePic: 'https://via.placeholder.com/200',
      businessLicenseExpire: '2026-03-15',
      idCardPicFront: 'https://via.placeholder.com/200',
      idCardPicBack: 'https://via.placeholder.com/200',
      registeredAddress: '上海市长宁区',
      actualAddress: '上海市长宁区虹桥临空经济示范区',
      registeredCapital: 500,
      establishedDate: '2020-07-08',
      businessScope: '仓储服务、供应链管理',
    },
    settlementAccount: {
      accountName: '虹桥工程仓有限公司',
      bankAccount: '6222021234567890222',
      bankName: '交通银行',
      bankBranch: '上海长宁支行',
      bankBranchCode: '3012900',
    },
    remark: '资质不全，审核未通过',
    createdAt: '2024-02-10 11:30:00',
    updatedAt: '2024-02-12 09:15:00',
  },
]

const MOCK_CONTRACTS: Contract[] = [
  {
    contractId: 'C001',
    tenantId: 'T001',
    contractNo: 'HT-2024-001',
    contractType: ContractType.SETTLEMENT,
    signDate: '2024-01-01',
    contractStartDate: '2024-01-01',
    contractEndDate: '2025-12-31',
    contractFile: 'https://via.placeholder.com/200',
    status: ContractStatus.VALID,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    contractId: 'C002',
    tenantId: 'T002',
    contractNo: 'HT-2024-002',
    contractType: ContractType.PURCHASE,
    signDate: '2024-01-15',
    contractStartDate: '2024-01-15',
    contractEndDate: '2024-12-31',
    contractFile: 'https://via.placeholder.com/200',
    status: ContractStatus.VALID,
    createdAt: '2024-01-15 14:00:00',
    updatedAt: '2024-01-15 14:00:00',
  },
]

const MOCK_QUALIFICATIONS: Qualification[] = [
  {
    qualId: 'Q001',
    tenantId: 'T001',
    qualName: '营业执照',
    qualType: 'business_license',
    certNo: '91310000MA1K5L3X5X',
    issueDate: '2015-06-15',
    expireDate: '2030-12-31',
    fileUrl: 'https://via.placeholder.com/200',
    status: QualificationStatus.VALID,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 10:30:00',
  },
  {
    qualId: 'Q002',
    tenantId: 'T002',
    qualName: '建筑施工资质',
    qualType: 'construction_qual',
    certNo: 'D137001234',
    issueDate: '2020-05-20',
    expireDate: '2025-05-19',
    fileUrl: 'https://via.placeholder.com/200',
    status: QualificationStatus.VALID,
    createdAt: '2024-01-18 14:20:00',
    updatedAt: '2024-01-18 14:20:00',
  },
]

export function getMockMerchantList(params: PaginationParams & { keyword?: string; tenantType?: string; registrationStatus?: string; enabledStatus?: number }): PaginationResult<Merchant> {
  let list = [...MOCK_MERCHANTS]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(m => 
      m.merchantName.toLowerCase().includes(keyword) ||
      m.contactPerson.includes(keyword) ||
      m.contactPhone.includes(keyword)
    )
  }
  
  if (params.tenantType) {
    list = list.filter(m => m.tenantType === params.tenantType)
  }
  
  if (params.registrationStatus) {
    list = list.filter(m => m.registrationStatus === params.registrationStatus)
  }
  
  if (params.enabledStatus !== undefined) {
    list = list.filter(m => m.enabledStatus === params.enabledStatus)
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

export function getMockMerchantDetail(tenantId: string): Merchant | null {
  return MOCK_MERCHANTS.find(m => m.tenantId === tenantId) || null
}

export function getMockContractList(params: PaginationParams & { tenantId?: string }): PaginationResult<Contract> {
  let list = [...MOCK_CONTRACTS]
  
  if (params.tenantId) {
    list = list.filter(c => c.tenantId === params.tenantId)
  }
  
  return {
    list,
    total: list.length,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(list.length / params.pageSize),
  }
}

export function getMockQualificationList(params: PaginationParams & { tenantId?: string }): PaginationResult<Qualification> {
  let list = [...MOCK_QUALIFICATIONS]
  
  if (params.tenantId) {
    list = list.filter(q => q.tenantId === params.tenantId)
  }
  
  return {
    list,
    total: list.length,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(list.length / params.pageSize),
  }
}

export function createMockMerchant(data: MerchantFormData): Merchant {
  const newMerchant: Merchant = {
    tenantId: 'T' + String(MOCK_MERCHANTS.length + 1).padStart(3, '0'),
    tenantType: data.basicInfo.tenantType,
    merchantName: data.basicInfo.merchantName,
    contactPerson: data.basicInfo.contactPerson,
    contactPhone: data.basicInfo.contactPhone,
    registrationStatus: RegistrationStatus.PENDING,
    enabledStatus: EnabledStatus.DISABLED,
    enterpriseInfo: data.enterpriseInfo,
    settlementAccount: data.settlementAccount,
    remark: data.basicInfo.remark,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  MOCK_MERCHANTS.push(newMerchant)
  return newMerchant
}

export function updateMockMerchant(tenantId: string, data: Partial<MerchantFormData>): Merchant | null {
  const index = MOCK_MERCHANTS.findIndex(m => m.tenantId === tenantId)
  if (index === -1) return null
  
  const updateData: Partial<Merchant> = {}
  if (data.basicInfo) {
    if (data.basicInfo.merchantName) updateData.merchantName = data.basicInfo.merchantName
    if (data.basicInfo.contactPerson) updateData.contactPerson = data.basicInfo.contactPerson
    if (data.basicInfo.contactPhone) updateData.contactPhone = data.basicInfo.contactPhone
    if (data.basicInfo.remark !== undefined) updateData.remark = data.basicInfo.remark
  }
  if (data.enterpriseInfo) updateData.enterpriseInfo = data.enterpriseInfo
  if (data.settlementAccount) updateData.settlementAccount = data.settlementAccount
  
  MOCK_MERCHANTS[index] = {
    ...MOCK_MERCHANTS[index],
    ...updateData,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_MERCHANTS[index]
}

export function deleteMockMerchant(tenantId: string): boolean {
  const index = MOCK_MERCHANTS.findIndex(m => m.tenantId === tenantId)
  if (index === -1) return false
  MOCK_MERCHANTS.splice(index, 1)
  return true
}

export function updateMockMerchantStatus(tenantId: string, enabledStatus: number): boolean {
  const merchant = MOCK_MERCHANTS.find(m => m.tenantId === tenantId)
  if (!merchant) return false
  merchant.enabledStatus = enabledStatus
  merchant.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return true
}
