import type { CustodyAccount, CustodyOpenRecord, CustodyBankCard, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { CustodyAccountStatus, CustodyOpenStatus, CustodyBindCardStatus, CustodyOpenApplyType, CustodyOpenAuditStatus, CustodyCardType, CustodyCardBindStatus } from '@gongchengcang/types'

const MOCK_CUSTODY_ACCOUNTS: CustodyAccount[] = [
  {
    accountId: 'CA001',
    tenantId: 'T001',
    merchantName: '华东建材供应商',
    accountStatus: CustodyAccountStatus.NORMAL,
    openStatus: CustodyOpenStatus.OPENED,
    openTime: '2024-01-20 10:00:00',
    bindCardStatus: CustodyBindCardStatus.BOUND,
    bindCardTime: '2024-01-20 11:00:00',
    availableBalance: 150000.00,
    frozenBalance: 50000.00,
    totalBalance: 200000.00,
    lastSyncTime: '2024-03-20 15:30:00',
    createdAt: '2024-01-20 10:00:00',
    updatedAt: '2024-03-20 15:30:00',
    bankCards: [
      {
        cardId: 'BC001',
        tenantId: 'T001',
        merchantName: '华东建材供应商',
        accountId: 'CA001',
        bankName: '中国工商银行',
        bankCode: 'ICBC',
        bankBranch: '上海浦东支行',
        bankAccount: '6222021234567890123',
        bankAccountMasked: '6222 **** **** 0123',
        accountName: '华东建材有限公司',
        cardType: CustodyCardType.CORPORATE,
        bindStatus: CustodyCardBindStatus.BOUND,
        bindTime: '2024-01-20 11:00:00',
        isDefault: 1,
        createdAt: '2024-01-20 11:00:00',
        updatedAt: '2024-01-20 11:00:00',
      }
    ],
    openRecords: [
      {
        applyId: 'OR001',
        tenantId: 'T001',
        merchantName: '华东建材供应商',
        applyType: CustodyOpenApplyType.FIRST,
        submitTime: '2024-01-20 09:00:00',
        status: CustodyOpenAuditStatus.PASSED,
        auditTime: '2024-01-20 10:00:00',
        retryCount: 0,
        createdAt: '2024-01-20 09:00:00',
      }
    ],
  },
  {
    accountId: 'CA002',
    tenantId: 'T002',
    merchantName: '城建施工集团',
    accountStatus: CustodyAccountStatus.NORMAL,
    openStatus: CustodyOpenStatus.OPENED,
    openTime: '2024-01-25 14:00:00',
    bindCardStatus: CustodyBindCardStatus.BOUND,
    bindCardTime: '2024-01-25 15:00:00',
    availableBalance: 500000.00,
    frozenBalance: 100000.00,
    totalBalance: 600000.00,
    lastSyncTime: '2024-03-20 16:00:00',
    createdAt: '2024-01-25 14:00:00',
    updatedAt: '2024-03-20 16:00:00',
    bankCards: [
      {
        cardId: 'BC002',
        tenantId: 'T002',
        merchantName: '城建施工集团',
        accountId: 'CA002',
        bankName: '中国建设银行',
        bankCode: 'CCB',
        bankBranch: '上海徐汇支行',
        bankAccount: '6222021234567890456',
        bankAccountMasked: '6222 **** **** 0456',
        accountName: '城建施工集团有限公司',
        cardType: CustodyCardType.CORPORATE,
        bindStatus: CustodyCardBindStatus.BOUND,
        bindTime: '2024-01-25 15:00:00',
        isDefault: 1,
        createdAt: '2024-01-25 15:00:00',
        updatedAt: '2024-01-25 15:00:00',
      }
    ],
    openRecords: [
      {
        applyId: 'OR002',
        tenantId: 'T002',
        merchantName: '城建施工集团',
        applyType: CustodyOpenApplyType.FIRST,
        submitTime: '2024-01-25 13:00:00',
        status: CustodyOpenAuditStatus.PASSED,
        auditTime: '2024-01-25 14:00:00',
        retryCount: 0,
        createdAt: '2024-01-25 13:00:00',
      }
    ],
  },
]

export function getMockCustodyAccountByTenant(tenantId: string): CustodyAccount | null {
  return MOCK_CUSTODY_ACCOUNTS.find(a => a.tenantId === tenantId) || null
}

export function getMockCustodyAccountDetail(accountId: string): CustodyAccount | null {
  return MOCK_CUSTODY_ACCOUNTS.find(a => a.accountId === accountId) || null
}

export function getMockCustodyAccountList(params: PaginationParams): PaginationResult<CustodyAccount> {
  const list = [...MOCK_CUSTODY_ACCOUNTS]
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

export function createMockOpenRecord(tenantId: string): CustodyOpenRecord {
  const merchant = MOCK_CUSTODY_ACCOUNTS.find(a => a.tenantId === tenantId)
  const newRecord: CustodyOpenRecord = {
    applyId: 'OR' + String(Date.now()).slice(-6),
    tenantId,
    merchantName: merchant?.merchantName,
    applyType: CustodyOpenApplyType.FIRST,
    submitTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: CustodyOpenAuditStatus.PENDING,
    retryCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return newRecord
}

export function getMockOpenRecordList(params: PaginationParams): PaginationResult<CustodyOpenRecord> {
  const allRecords = MOCK_CUSTODY_ACCOUNTS.flatMap(a => a.openRecords || [])
  const total = allRecords.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: allRecords.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}

export function getMockBankCardList(params: PaginationParams): PaginationResult<CustodyBankCard> {
  const allCards = MOCK_CUSTODY_ACCOUNTS.flatMap(a => a.bankCards || [])
  const total = allCards.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    list: allCards.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}
