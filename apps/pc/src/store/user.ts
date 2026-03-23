import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, MenuItem, LoginParams } from '@gongchengcang/types'
import { login, logout, getUserInfo } from '@gongchengcang/api'
import { setToken, setUserInfo, removeToken, removeUserInfo, clearAuth, setLocal, getLocal } from '@gongchengcang/utils'
import router from '@/router'

const MOCK_USER: User = {
  userId: '1',
  username: 'admin',
  realName: '管理员',
  phone: '13800138000',
  email: 'admin@example.com',
  userType: 1,
  status: 1,
  isDefaultAdmin: 1,
  tenantId: 'platform',
  permissions: ['*'],
  createdAt: '2024-01-01 00:00:00',
  updatedAt: '2024-03-20 10:30:00',
}

const MOCK_MENUS: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'icon-dashboard', title: '工作台' },
  { name: 'Merchant', path: '/merchant', icon: 'icon-user-group', title: '商户管理' },
  { name: 'Product', path: '/product', icon: 'icon-apps', title: '商品管理' },
  { name: 'Market', path: '/market', icon: 'icon-tags', title: '商品市场' },
  { name: 'Order', path: '/order', icon: 'icon-file', title: '订单管理' },
  { name: 'Plan', path: '/plan', icon: 'icon-calendar', title: '采购计划' },
  { name: 'Warehouse', path: '/warehouse', icon: 'icon-storage', title: '仓库管理' },
  { name: 'Finance', path: '/finance', icon: 'icon-money-collect', title: '财务管理' },
  { name: 'System', path: '/system', icon: 'icon-settings', title: '系统设置' },
]

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const menus = ref<MenuItem[]>([])
  const permissions = ref<string[]>([])

  async function loginAction(params: LoginParams) {
    const isMock = import.meta.env.VITE_MOCK === 'true' || !import.meta.env.VITE_API_URL
    
    if (isMock) {
      const token = 'mock_token_' + Date.now()
      setToken(token)
      setUserInfo(MOCK_USER)
      user.value = MOCK_USER
      return { token, user: MOCK_USER }
    }
    
    const result = await login(params)
    setToken(result.token)
    setUserInfo(result.user)
    user.value = result.user
    return result
  }

  async function getUserInfoAction() {
    const isMock = import.meta.env.VITE_MOCK === 'true' || !import.meta.env.VITE_API_URL
    
    if (isMock) {
      user.value = MOCK_USER
      menus.value = MOCK_MENUS
      permissions.value = MOCK_USER.permissions || []
      return { user: MOCK_USER, menus: MOCK_MENUS }
    }
    
    const result = await getUserInfo()
    user.value = result.user
    menus.value = result.menus
    permissions.value = result.user.permissions
    return result
  }

  async function logoutAction() {
    const isMock = import.meta.env.VITE_MOCK === 'true' || !import.meta.env.VITE_API_URL
    
    if (!isMock) {
      try {
        await logout()
      } catch (e) {
        // ignore
      }
    }
    
    clearAuth()
    user.value = null
    menus.value = []
    permissions.value = []
    router.push('/login')
  }

  function hasPermission(permission: string) {
    return permissions.value.includes(permission) || permissions.value.includes('*')
  }

  function hasPermissions(permissionList: string[]) {
    return permissionList.every(p => permissions.value.includes(p)) || permissions.value.includes('*')
  }

  return {
    user,
    menus,
    permissions,
    loginAction,
    getUserInfoAction,
    logoutAction,
    hasPermission,
    hasPermissions,
  }
})
