import type { User, CreateUserParams, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { UserType, UserStatus } from '@gongchengcang/types'

const MOCK_USERS: User[] = [
  {
    userId: 'U001',
    username: 'admin',
    realName: '系统管理员',
    phone: '13800138000',
    userType: UserType.PLATFORM,
    status: UserStatus.ENABLED,
    isDefaultAdmin: 1,
    tenantId: 'platform',
    lastLoginIp: '192.168.1.1',
    lastLoginTime: '2024-03-20 10:30:00',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-03-20 10:30:00',
  },
  {
    userId: 'U002',
    username: 'supplier_admin',
    realName: '张三',
    phone: '13800138001',
    userType: UserType.TENANT_ADMIN,
    status: UserStatus.ENABLED,
    isDefaultAdmin: 1,
    tenantId: 'T001',
    lastLoginIp: '192.168.1.2',
    lastLoginTime: '2024-03-19 14:20:00',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-03-19 14:20:00',
  },
  {
    userId: 'U003',
    username: 'constructor_admin',
    realName: '李四',
    phone: '13800138002',
    userType: UserType.TENANT_ADMIN,
    status: UserStatus.ENABLED,
    isDefaultAdmin: 1,
    tenantId: 'T002',
    lastLoginIp: '192.168.1.3',
    lastLoginTime: '2024-03-18 09:15:00',
    createdAt: '2024-01-18 14:20:00',
    updatedAt: '2024-03-18 09:15:00',
  },
  {
    userId: 'U004',
    username: 'warehouse_admin',
    realName: '王五',
    phone: '13800138003',
    userType: UserType.TENANT_ADMIN,
    status: UserStatus.DISABLED,
    isDefaultAdmin: 1,
    tenantId: 'T003',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00',
  },
  {
    userId: 'U005',
    username: 'operator1',
    realName: '赵六',
    phone: '13800138004',
    userType: UserType.TENANT_USER,
    status: UserStatus.ENABLED,
    isDefaultAdmin: 0,
    tenantId: 'T001',
    lastLoginIp: '192.168.1.5',
    lastLoginTime: '2024-03-17 16:45:00',
    createdAt: '2024-02-05 16:45:00',
    updatedAt: '2024-03-17 16:45:00',
  },
]

export function getMockUserList(params: PaginationParams & { keyword?: string; status?: number }): PaginationResult<User> {
  let list = [...MOCK_USERS]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(u => 
      u.username.toLowerCase().includes(keyword) ||
      u.realName.includes(keyword) ||
      u.phone.includes(keyword)
    )
  }
  
  if (params.status !== undefined) {
    list = list.filter(u => u.status === params.status)
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

export function getMockUserDetail(userId: string): User | null {
  return MOCK_USERS.find(u => u.userId === userId) || null
}

export function createMockUser(data: CreateUserParams): User {
  const newUser: User = {
    userId: 'U' + String(MOCK_USERS.length + 1).padStart(3, '0'),
    username: data.username,
    realName: data.realName,
    phone: data.phone,
    userType: data.userType,
    status: UserStatus.ENABLED,
    isDefaultAdmin: 0,
    tenantId: data.tenantId,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  MOCK_USERS.push(newUser)
  return newUser
}

export function updateMockUser(userId: string, data: Partial<CreateUserParams>): User | null {
  const index = MOCK_USERS.findIndex(u => u.userId === userId)
  if (index === -1) return null
  
  MOCK_USERS[index] = {
    ...MOCK_USERS[index],
    ...data,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_USERS[index]
}

export function deleteMockUser(userId: string): boolean {
  const index = MOCK_USERS.findIndex(u => u.userId === userId)
  if (index === -1) return false
  MOCK_USERS.splice(index, 1)
  return true
}

export function updateMockUserStatus(userId: string, status: number): boolean {
  const user = MOCK_USERS.find(u => u.userId === userId)
  if (!user) return false
  user.status = status
  user.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return true
}
