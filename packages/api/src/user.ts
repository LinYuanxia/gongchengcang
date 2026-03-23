import { post, get } from '@gongchengcang/utils'
import type { User, Role, Menu, CreateUserParams, UpdateUserParams, CreateRoleParams, UpdateRoleParams, CreateMenuParams, UpdateMenuParams, PaginationParams, PaginationResult } from '@gongchengcang/types'
import {
  getMockUserList,
  getMockUserDetail,
  createMockUser,
  updateMockUser,
  deleteMockUser,
  updateMockUserStatus
} from './mock/user'
import {
  getMockRoleList,
  getMockRoleDetail,
  createMockRole,
  updateMockRole,
  deleteMockRole,
  getMockMenuList,
  getMockMenuDetail,
  createMockMenu,
  updateMockMenu,
  deleteMockMenu
} from './mock/system'

const isMock = true

export function getUserList(params: PaginationParams & { keyword?: string; userType?: number; status?: number; tenantId?: string }) {
  if (isMock) {
    return Promise.resolve(getMockUserList(params))
  }
  return post<PaginationResult<User>>('/user/list', params)
}

export function getUserDetail(userId: string) {
  if (isMock) {
    const user = getMockUserDetail(userId)
    if (!user) return Promise.reject(new Error('用户不存在'))
    return Promise.resolve(user)
  }
  return get<User>(`/user/${userId}`)
}

export function createUser(data: CreateUserParams) {
  if (isMock) {
    return Promise.resolve(createMockUser(data))
  }
  return post<User>('/user', data)
}

export function updateUser(userId: string, data: UpdateUserParams) {
  if (isMock) {
    const user = updateMockUser(userId, data)
    if (!user) return Promise.reject(new Error('用户不存在'))
    return Promise.resolve(user)
  }
  return post<User>(`/user/${userId}`, data)
}

export function deleteUser(userId: string) {
  if (isMock) {
    const success = deleteMockUser(userId)
    if (!success) return Promise.reject(new Error('删除失败'))
    return Promise.resolve()
  }
  return post<void>(`/user/${userId}/delete`)
}

export function resetPassword(userId: string) {
  if (isMock) {
    return Promise.resolve({ password: '123456' })
  }
  return post<{ password: string }>(`/user/${userId}/reset-password`)
}

export function updateUserStatus(userId: string, status: number) {
  if (isMock) {
    const success = updateMockUserStatus(userId, status)
    if (!success) return Promise.reject(new Error('状态更新失败'))
    return Promise.resolve()
  }
  return post<void>(`/user/${userId}/status`, { status })
}

export function getRoleList(params: PaginationParams & { keyword?: string; tenantId?: string }) {
  if (isMock) {
    return Promise.resolve(getMockRoleList(params))
  }
  return post<PaginationResult<Role>>('/role/list', params)
}

export function getRoleDetail(roleId: string) {
  if (isMock) {
    const role = getMockRoleDetail(roleId)
    if (!role) return Promise.reject(new Error('角色不存在'))
    return Promise.resolve(role)
  }
  return get<Role>(`/role/${roleId}`)
}

export function createRole(data: CreateRoleParams) {
  if (isMock) {
    return Promise.resolve(createMockRole(data))
  }
  return post<Role>('/role', data)
}

export function updateRole(roleId: string, data: UpdateRoleParams) {
  if (isMock) {
    const role = updateMockRole(roleId, data)
    if (!role) return Promise.reject(new Error('角色不存在'))
    return Promise.resolve(role)
  }
  return post<Role>(`/role/${roleId}`, data)
}

export function deleteRole(roleId: string) {
  if (isMock) {
    const success = deleteMockRole(roleId)
    if (!success) return Promise.reject(new Error('删除失败，系统角色不可删除'))
    return Promise.resolve()
  }
  return post<void>(`/role/${roleId}/delete`)
}

export function getAllRoles(tenantId?: string) {
  if (isMock) {
    const res = getMockRoleList({ page: 1, pageSize: 1000, tenantId })
    return Promise.resolve(res.list)
  }
  return get<Role[]>('/role/all', { tenantId })
}

export function getMenuList() {
  if (isMock) {
    return Promise.resolve(getMockMenuList())
  }
  return get<Menu[]>('/menu/list')
}

export function getMenuDetail(menuId: string) {
  if (isMock) {
    const menu = getMockMenuDetail(menuId)
    if (!menu) return Promise.reject(new Error('菜单不存在'))
    return Promise.resolve(menu)
  }
  return get<Menu>(`/menu/${menuId}`)
}

export function createMenu(data: CreateMenuParams) {
  if (isMock) {
    return Promise.resolve(createMockMenu(data as any))
  }
  return post<Menu>('/menu', data)
}

export function updateMenu(menuId: string, data: UpdateMenuParams) {
  if (isMock) {
    const menu = updateMockMenu(menuId, data)
    if (!menu) return Promise.reject(new Error('菜单不存在'))
    return Promise.resolve(menu)
  }
  return post<Menu>(`/menu/${menuId}`, data)
}

export function deleteMenu(menuId: string) {
  if (isMock) {
    const success = deleteMockMenu(menuId)
    if (!success) return Promise.reject(new Error('删除失败'))
    return Promise.resolve()
  }
  return post<void>(`/menu/${menuId}/delete`)
}
