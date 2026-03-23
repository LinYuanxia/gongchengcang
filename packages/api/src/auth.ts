import { post, get } from '@gongchengcang/utils'
import type { LoginParams, LoginResult, UserInfo, User } from '@gongchengcang/types'
import { UserType, UserStatus } from '@gongchengcang/types'

const isMock = true

const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'admin': {
    user: {
      userId: 'U001',
      username: 'admin',
      realName: '系统管理员',
      phone: '13800138000',
      userType: UserType.PLATFORM,
      status: UserStatus.ENABLED,
      isDefaultAdmin: 1,
      tenantId: 'platform',
      permissions: ['*'],
      createdAt: '2024-01-01 00:00:00',
      updatedAt: '2024-03-20 10:30:00',
    },
    password: '123456',
  },
  'supplier_admin': {
    user: {
      userId: 'U002',
      username: 'supplier_admin',
      realName: '张三',
      phone: '13800138001',
      userType: UserType.MERCHANT,
      status: UserStatus.ENABLED,
      isDefaultAdmin: 1,
      tenantId: 'T001',
      permissions: ['product:*', 'order:*', 'warehouse:read'],
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-03-19 14:20:00',
    },
    password: '123456',
  },
  'constructor_admin': {
    user: {
      userId: 'U003',
      username: 'constructor_admin',
      realName: '李四',
      phone: '13800138002',
      userType: UserType.MERCHANT,
      status: UserStatus.ENABLED,
      isDefaultAdmin: 1,
      tenantId: 'T002',
      permissions: ['order:*', 'plan:*', 'warehouse:read'],
      createdAt: '2024-01-18 14:20:00',
      updatedAt: '2024-03-18 09:15:00',
    },
    password: '123456',
  },
  'warehouse_admin': {
    user: {
      userId: 'U004',
      username: 'warehouse_admin',
      realName: '王五',
      phone: '13800138003',
      userType: UserType.MERCHANT,
      status: UserStatus.ENABLED,
      isDefaultAdmin: 1,
      tenantId: 'T003',
      permissions: ['warehouse:*', 'stock:*'],
      createdAt: '2024-02-01 09:00:00',
      updatedAt: '2024-02-01 09:00:00',
    },
    password: '123456',
  },
}

const MOCK_MENUS = [
  { name: 'Dashboard', path: '/dashboard', icon: 'icon-dashboard', title: '工作台' },
  { name: 'Merchant', path: '/merchant', icon: 'icon-user-group', title: '商户管理' },
  { name: 'Product', path: '/product', icon: 'icon-apps', title: '商品管理' },
  { name: 'Market', path: '/market', icon: 'icon-shopping-cart', title: '商品市场' },
  { name: 'Order', path: '/order', icon: 'icon-file', title: '订单管理' },
  { name: 'Plan', path: '/plan', icon: 'icon-calendar', title: '采购计划' },
  { name: 'Warehouse', path: '/warehouse', icon: 'icon-storage', title: '仓库管理' },
  { name: 'Finance', path: '/finance', icon: 'icon-money-collect', title: '财务管理' },
  { name: 'System', path: '/system', icon: 'icon-settings', title: '系统设置' },
]

export function login(data: LoginParams) {
  if (isMock) {
    const mockUser = MOCK_USERS[data.username]
    if (!mockUser || mockUser.password !== data.password) {
      return Promise.reject(new Error('用户名或密码错误'))
    }
    const token = 'mock_token_' + Date.now()
    return Promise.resolve({
      token,
      user: mockUser.user,
    })
  }
  return post<LoginResult>('/auth/login', data)
}

export function logout() {
  return post<void>('/auth/logout')
}

export function refreshToken(refreshToken: string) {
  return post<LoginResult>('/auth/refresh', { refreshToken })
}

export function getUserInfo() {
  if (isMock) {
    return Promise.resolve({
      user: MOCK_USERS['admin'].user,
      menus: MOCK_MENUS,
    })
  }
  return get<UserInfo>('/auth/user-info')
}

export function getCaptcha() {
  return get<{ captcha: string; captchaKey: string }>('/auth/captcha')
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return post<void>('/auth/change-password', data)
}
