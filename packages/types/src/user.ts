import { TenantType } from './merchant'
import type { MerchantType } from './merchant'
export { TenantType }
export type { MerchantType }

export interface User {
  userId: string
  username: string
  realName: string
  phone: string
  email?: string
  tenantId?: string
  userType: UserType
  status: UserStatus
  isDefaultAdmin: number
  lastLoginIp?: string
  lastLoginTime?: string
  createdAt: string
  updatedAt: string
  roles?: Role[]
  tenant?: TenantInfo
  permissions?: string[]
}

export interface TenantInfo {
  tenantId: string
  merchantName: string
  tenantType: TenantType
}

export enum UserType {
  PLATFORM = 1,
  TENANT_ADMIN = 2,
  TENANT_USER = 3,
}

export enum UserStatus {
  ENABLED = 1,
  DISABLED = 0
}

export interface Role {
  roleId: string
  tenantId?: string
  roleName: string
  roleCode?: string
  isSystem: number
  description?: string
  status?: number
  createdAt?: string
  updatedAt?: string
  permissions?: Permission[]
}

export interface Permission {
  permissionId: string
  name: string
  code: string
  type: PermissionType
  parentId?: string
  path?: string
  icon?: string
  sort: number
  status?: number
}

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api'
}

export interface Menu {
  menuId: string
  parentId?: string
  menuName: string
  menuCode: string
  path?: string
  icon?: string
  sort: number
  type: MenuType
  visible: number
  status: number
  component?: string
  perms?: string
  createdAt?: string
  updatedAt?: string
  children?: Menu[]
}

export enum MenuType {
  DIRECTORY = 'directory',
  MENU = 'menu',
  BUTTON = 'button'
}

export interface CreateMenuParams {
  parentId?: string
  menuName: string
  menuCode: string
  path?: string
  icon?: string
  sort: number
  type: MenuType
  visible?: number
  status?: number
  component?: string
  perms?: string
}

export interface UpdateMenuParams {
  parentId?: string
  menuName?: string
  menuCode?: string
  path?: string
  icon?: string
  sort?: number
  type?: MenuType
  visible?: number
  status?: number
  component?: string
  perms?: string
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
}

export interface LoginParams {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

export interface LoginResult {
  token: string
  refreshToken?: string
  expiresIn?: number
  user: User
}

export interface UserInfo {
  user: User
  menus: MenuItem[]
  permissions?: string[]
}

export interface MenuItem {
  id?: string
  name: string
  path: string
  icon?: string
  title?: string
  sort?: number
  children?: MenuItem[]
}

export interface CreateUserParams {
  username: string
  password: string
  realName: string
  phone: string
  tenantId?: string
  userType: UserType
  roleIds?: string[]
}

export interface UpdateUserParams {
  realName?: string
  phone?: string
  status?: UserStatus
  roleIds?: string[]
}

export interface CreateRoleParams {
  roleName: string
  roleCode?: string
  tenantId?: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleParams {
  roleName?: string
  description?: string
  permissionIds?: string[]
}
