import type { Role, Menu, PaginationParams, PaginationResult } from '@gongchengcang/types'
import { MenuType } from '@gongchengcang/types'

export const MOCK_ROLES: Role[] = [
  {
    roleId: 'R001',
    tenantId: undefined,
    roleName: '超级管理员',
    roleCode: 'super_admin',
    isSystem: 1,
    description: '系统超级管理员，拥有所有权限',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    roleId: 'R002',
    tenantId: undefined,
    roleName: '平台运营',
    roleCode: 'platform_operator',
    isSystem: 1,
    description: '平台运营人员，负责商户管理和订单审核',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    roleId: 'R003',
    tenantId: undefined,
    roleName: '财务管理',
    roleCode: 'finance_manager',
    isSystem: 1,
    description: '财务人员，负责资金托管和对账',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    roleId: 'R004',
    tenantId: 'T001',
    roleName: '供应商管理员',
    roleCode: 'supplier_admin',
    isSystem: 0,
    description: '供应商企业管理员',
    status: 1,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-15 10:00:00',
  },
  {
    roleId: 'R005',
    tenantId: 'T002',
    roleName: '施工方管理员',
    roleCode: 'constructor_admin',
    isSystem: 0,
    description: '施工方企业管理员',
    status: 1,
    createdAt: '2024-01-18 14:00:00',
    updatedAt: '2024-01-18 14:00:00',
  },
  {
    roleId: 'R006',
    tenantId: 'T003',
    roleName: '工程仓管理员',
    roleCode: 'warehouse_admin',
    isSystem: 0,
    description: '工程仓管理员',
    status: 1,
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00',
  },
  {
    roleId: 'R007',
    tenantId: 'T001',
    roleName: '供应商操作员',
    roleCode: 'supplier_operator',
    isSystem: 0,
    description: '供应商普通操作员',
    status: 1,
    createdAt: '2024-02-05 16:00:00',
    updatedAt: '2024-02-05 16:00:00',
  },
]

export const MOCK_MENUS: Menu[] = [
  {
    menuId: 'M001',
    menuName: '工作台',
    menuCode: 'dashboard',
    path: '/dashboard',
    icon: 'icon-home',
    sort: 1,
    type: MenuType.MENU,
    visible: 1,
    status: 1,
    component: 'views/dashboard/index.vue',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    menuId: 'M002',
    menuName: '商户管理',
    menuCode: 'merchant',
    path: '/merchant',
    icon: 'icon-shop',
    sort: 2,
    type: MenuType.DIRECTORY,
    visible: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        menuId: 'M002-1',
        parentId: 'M002',
        menuName: '商户列表',
        menuCode: 'merchant-list',
        path: '/merchant/list',
        icon: '',
        sort: 1,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/merchant/list/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        children: [
          {
            menuId: 'M002-1-1',
            parentId: 'M002-1',
            menuName: '新增商户',
            menuCode: 'merchant-add',
            path: '',
            icon: '',
            sort: 1,
            type: MenuType.BUTTON,
            visible: 1,
            status: 1,
            perms: 'merchant:add',
            createdAt: '2024-01-01 00:00:00',
            updatedAt: '2024-01-01 00:00:00',
          },
          {
            menuId: 'M002-1-2',
            parentId: 'M002-1',
            menuName: '编辑商户',
            menuCode: 'merchant-edit',
            path: '',
            icon: '',
            sort: 2,
            type: MenuType.BUTTON,
            visible: 1,
            status: 1,
            perms: 'merchant:edit',
            createdAt: '2024-01-01 00:00:00',
            updatedAt: '2024-01-01 00:00:00',
          },
          {
            menuId: 'M002-1-3',
            parentId: 'M002-1',
            menuName: '删除商户',
            menuCode: 'merchant-delete',
            path: '',
            icon: '',
            sort: 3,
            type: MenuType.BUTTON,
            visible: 1,
            status: 1,
            perms: 'merchant:delete',
            createdAt: '2024-01-01 00:00:00',
            updatedAt: '2024-01-01 00:00:00',
          },
        ],
      },
      {
        menuId: 'M002-2',
        parentId: 'M002',
        menuName: '合同管理',
        menuCode: 'merchant-contract',
        path: '/merchant/contract',
        icon: '',
        sort: 2,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/merchant/contract/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    menuId: 'M003',
    menuName: '商品管理',
    menuCode: 'product',
    path: '/product',
    icon: 'icon-apps',
    sort: 3,
    type: MenuType.DIRECTORY,
    visible: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        menuId: 'M003-1',
        parentId: 'M003',
        menuName: '商品列表',
        menuCode: 'product-list',
        path: '/product/list',
        icon: '',
        sort: 1,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/product/list/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M003-2',
        parentId: 'M003',
        menuName: '商品分类',
        menuCode: 'product-category',
        path: '/product/category',
        icon: '',
        sort: 2,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/product/category/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    menuId: 'M004',
    menuName: '订单管理',
    menuCode: 'order',
    path: '/order',
    icon: 'icon-file',
    sort: 4,
    type: MenuType.DIRECTORY,
    visible: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        menuId: 'M004-1',
        parentId: 'M004',
        menuName: '采购订单',
        menuCode: 'order-purchase',
        path: '/order/purchase',
        icon: '',
        sort: 1,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/order/purchase/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M004-2',
        parentId: 'M004',
        menuName: '销售订单',
        menuCode: 'order-sales',
        path: '/order/sales',
        icon: '',
        sort: 2,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/order/sales/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    menuId: 'M005',
    menuName: '资金托管',
    menuCode: 'finance',
    path: '/finance',
    icon: 'icon-safe',
    sort: 5,
    type: MenuType.DIRECTORY,
    visible: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        menuId: 'M005-1',
        parentId: 'M005',
        menuName: '托管账户',
        menuCode: 'finance-custody',
        path: '/finance/custody',
        icon: '',
        sort: 1,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/finance/custody/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M005-2',
        parentId: 'M005',
        menuName: '开户审核',
        menuCode: 'finance-audit',
        path: '/finance/audit',
        icon: '',
        sort: 2,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/finance/audit/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M005-3',
        parentId: 'M005',
        menuName: '银行卡管理',
        menuCode: 'finance-bankcard',
        path: '/finance/bankcard',
        icon: '',
        sort: 3,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/finance/bankcard/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
  {
    menuId: 'M006',
    menuName: '系统管理',
    menuCode: 'system',
    path: '/system',
    icon: 'icon-settings',
    sort: 6,
    type: MenuType.DIRECTORY,
    visible: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    children: [
      {
        menuId: 'M006-1',
        parentId: 'M006',
        menuName: '用户管理',
        menuCode: 'system-user',
        path: '/system/user',
        icon: '',
        sort: 1,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/system/user/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M006-2',
        parentId: 'M006',
        menuName: '角色管理',
        menuCode: 'system-role',
        path: '/system/role',
        icon: '',
        sort: 2,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/system/role/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M006-3',
        parentId: 'M006',
        menuName: '菜单管理',
        menuCode: 'system-menu',
        path: '/system/menu',
        icon: '',
        sort: 3,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/system/menu/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        menuId: 'M006-4',
        parentId: 'M006',
        menuName: '分账配置',
        menuCode: 'system-split-config',
        path: '/system/split-config',
        icon: '',
        sort: 4,
        type: MenuType.MENU,
        visible: 1,
        status: 1,
        component: 'views/system/splitConfig/index.vue',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
    ],
  },
]

export function getMockRoleList(params: PaginationParams & { keyword?: string; tenantId?: string }): PaginationResult<Role> {
  let list = [...MOCK_ROLES]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(r => 
      r.roleName.toLowerCase().includes(keyword) ||
      (r.roleCode && r.roleCode.toLowerCase().includes(keyword))
    )
  }
  
  if (params.tenantId) {
    list = list.filter(r => r.tenantId === params.tenantId)
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

export function getMockRoleDetail(roleId: string): Role | null {
  return MOCK_ROLES.find(r => r.roleId === roleId) || null
}

export function createMockRole(data: { roleName: string; roleCode?: string; tenantId?: string; description?: string }): Role {
  const newRole: Role = {
    roleId: 'R' + String(MOCK_ROLES.length + 1).padStart(3, '0'),
    tenantId: data.tenantId,
    roleName: data.roleName,
    roleCode: data.roleCode,
    isSystem: 0,
    description: data.description,
    status: 1,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  MOCK_ROLES.push(newRole)
  return newRole
}

export function updateMockRole(roleId: string, data: { roleName?: string; description?: string }): Role | null {
  const index = MOCK_ROLES.findIndex(r => r.roleId === roleId)
  if (index === -1) return null
  
  MOCK_ROLES[index] = {
    ...MOCK_ROLES[index],
    ...data,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  return MOCK_ROLES[index]
}

export function deleteMockRole(roleId: string): boolean {
  const index = MOCK_ROLES.findIndex(r => r.roleId === roleId)
  if (index === -1) return false
  if (MOCK_ROLES[index].isSystem === 1) return false
  MOCK_ROLES.splice(index, 1)
  return true
}

export function getMockMenuList(): Menu[] {
  return MOCK_MENUS
}

export function getMockMenuDetail(menuId: string): Menu | null {
  for (const menu of MOCK_MENUS) {
    if (menu.menuId === menuId) return menu
    if (menu.children) {
      for (const child of menu.children) {
        if (child.menuId === menuId) return child
        if (child.children) {
          for (const grandChild of child.children) {
            if (grandChild.menuId === menuId) return grandChild
          }
        }
      }
    }
  }
  return null
}

export function createMockMenu(data: { parentId?: string; menuName: string; menuCode: string; path?: string; icon?: string; sort: number; type: MenuType; visible?: number; status?: number; component?: string; perms?: string }): Menu {
  const newMenu: Menu = {
    menuId: 'M' + String(Date.now()).slice(-6),
    parentId: data.parentId,
    menuName: data.menuName,
    menuCode: data.menuCode,
    path: data.path,
    icon: data.icon,
    sort: data.sort,
    type: data.type,
    visible: data.visible ?? 1,
    status: data.status ?? 1,
    component: data.component,
    perms: data.perms,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  
  if (data.parentId) {
    for (const menu of MOCK_MENUS) {
      if (menu.menuId === data.parentId) {
        if (!menu.children) menu.children = []
        menu.children.push(newMenu)
        return newMenu
      }
      if (menu.children) {
        for (const child of menu.children) {
          if (child.menuId === data.parentId) {
            if (!child.children) child.children = []
            child.children.push(newMenu)
            return newMenu
          }
        }
      }
    }
  } else {
    MOCK_MENUS.push(newMenu)
  }
  
  return newMenu
}

export function updateMockMenu(menuId: string, data: Partial<Menu>): Menu | null {
  const menu = getMockMenuDetail(menuId)
  if (!menu) return null
  
  Object.assign(menu, data, {
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  })
  return menu
}

export function deleteMockMenu(menuId: string): boolean {
  for (let i = 0; i < MOCK_MENUS.length; i++) {
    if (MOCK_MENUS[i].menuId === menuId) {
      MOCK_MENUS.splice(i, 1)
      return true
    }
    if (MOCK_MENUS[i].children) {
      for (let j = 0; j < MOCK_MENUS[i].children!.length; j++) {
        if (MOCK_MENUS[i].children![j].menuId === menuId) {
          MOCK_MENUS[i].children!.splice(j, 1)
          return true
        }
        if (MOCK_MENUS[i].children![j].children) {
          for (let k = 0; k < MOCK_MENUS[i].children![j].children!.length; k++) {
            if (MOCK_MENUS[i].children![j].children![k].menuId === menuId) {
              MOCK_MENUS[i].children![j].children!.splice(k, 1)
              return true
            }
          }
        }
      }
    }
  }
  return false
}
