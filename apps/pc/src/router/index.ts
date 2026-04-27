import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { getToken } from '@gongchengcang/utils'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'icon-dashboard' },
      },
      {
        path: 'mp-preview',
        name: 'MpPreview',
        component: () => import('@/views/mp-preview/index.vue'),
        meta: { title: '小程序预览', hideInMenu: true },
      },
      {
        path: 'prd',
        name: 'Prd',
        component: () => import('@/views/warehouse/prd/index.vue'),
        meta: { title: '产品需求文档', icon: 'icon-list', requiresAuth: false, hideInMenu: true },
      },
      {
        path: 'merchant',
        name: 'Merchant',
        redirect: '/merchant/list',
        meta: { title: '商户管理', icon: 'icon-user-group' },
        children: [
          {
            path: 'list',
            name: 'MerchantList',
            component: () => import('@/views/merchant/list/index.vue'),
            meta: { title: '商户列表' },
          },
          {
            path: 'detail',
            name: 'MerchantDetail',
            component: () => import('@/views/merchant/detail/index.vue'),
            meta: { title: '商户详情', hideInMenu: true },
          },
          {
            path: 'contract',
            name: 'MerchantContract',
            component: () => import('@/views/merchant/contract/index.vue'),
            meta: { title: '合同列表' },
          },
        ],
      },
      {
        path: 'product',
        name: 'Product',
        redirect: '/product/category',
        meta: { title: '商品管理', icon: 'icon-apps' },
        children: [
          {
            path: 'category',
            name: 'ProductCategory',
            component: () => import('@/views/product/category/index.vue'),
            meta: { title: '商品分类' },
          },
          {
            path: 'attr',
            name: 'ProductAttr',
            component: () => import('@/views/product/attr/index.vue'),
            meta: { title: '规格属性' },
          },
          {
            path: 'spu',
            name: 'ProductSpu',
            component: () => import('@/views/product/spu/index.vue'),
            meta: { title: 'SPU管理' },
          },
          {
            path: 'spu/add',
            name: 'ProductSpuAdd',
            component: () => import('@/views/product/spu/detail.vue'),
            meta: { title: '新增SPU', hideInMenu: true },
          },
          {
            path: 'spu/edit/:id',
            name: 'ProductSpuEdit',
            component: () => import('@/views/product/spu/detail.vue'),
            meta: { title: '编辑SPU', hideInMenu: true },
          },
          {
            path: 'spu/view/:id',
            name: 'ProductSpuView',
            component: () => import('@/views/product/spu/view.vue'),
            meta: { title: '查看SPU', hideInMenu: true },
          },
          {
            path: 'sku',
            name: 'ProductSku',
            component: () => import('@/views/product/sku/index.vue'),
            meta: { title: 'SKU管理' },
          },
          {
            path: 'sku/view/:id',
            name: 'ProductSkuView',
            component: () => import('@/views/product/sku/view.vue'),
            meta: { title: '查看SKU', hideInMenu: true },
          },
          {
            path: 'sku/edit/:id',
            name: 'ProductSkuEdit',
            component: () => import('@/views/product/sku/edit.vue'),
            meta: { title: '编辑SKU', hideInMenu: true },
          },
          {
            path: 'supply',
            name: 'ProductSupply',
            component: () => import('@/views/product/supply/index.vue'),
            meta: { title: '供应商供货' },
          },
          // {
          //   path: 'supplier-audit',
          //   name: 'ProductSupplierAudit',
          //   component: () => import('@/views/product/supplier-audit/index.vue'),
          //   meta: { title: '供应商商品审核' },
          // },
          {
            path: 'warehouse-config',
            name: 'SupplierWarehouseConfig',
            component: () => import('@/views/supplier/warehouse-config/index.vue'),
            meta: { title: '供应商工程仓配置' },
          },
        ],
      },
      {
        path: 'market',
        name: 'Market',
        redirect: '/market/list',
        meta: { title: '商品市场', icon: 'icon-shop' },
        children: [
          {
            path: 'list',
            name: 'MarketList',
            component: () => import('@/views/market/list/index.vue'),
            meta: { title: '供应商品市场', icon: 'icon-apps' },
          },
          {
            path: 'construction',
            name: 'ConstructionMarket',
            component: () => import('@/views/construction/market/index.vue'),
            meta: { title: '销售商品市场', icon: 'icon-home' },
          },
          {
            path: 'construction/permission',
            name: 'ConstructionPermission',
            component: () => import('@/views/construction/permission/index.vue'),
            meta: { title: '商品权限', hideInMenu: true },
          },
          {
            path: 'construction/price',
            name: 'ConstructionPrice',
            component: () => import('@/views/construction/price/index.vue'),
            meta: { title: '价格策略', hideInMenu: true },
          },
          {
            path: 'bom',
            name: 'MarketBom',
            component: () => import('@/views/market/bom/index.vue'),
            meta: { title: 'BOM基装包', icon: 'icon-folder' },
          },
          {
            path: 'bom/create',
            name: 'MarketBomCreate',
            component: () => import('@/views/market/bom/create.vue'),
            meta: { title: '创建BOM包', hideInMenu: true },
          },
          {
            path: 'bom/edit/:id',
            name: 'MarketBomEdit',
            component: () => import('@/views/market/bom/create.vue'),
            meta: { title: '编辑BOM包', hideInMenu: true },
          },
          {
            path: 'bom/detail/:id',
            name: 'MarketBomDetail',
            component: () => import('@/views/market/bom/detail.vue'),
            meta: { title: 'BOM包详情', hideInMenu: true },
          },
          {
            path: 'price',
            name: 'MarketPrice',
            component: () => import('@/views/market/price/index.vue'),
            meta: { title: '价格管理', icon: 'icon-price-tag' },
          },
          {
            path: 'plan',
            name: 'MarketPlan',
            component: () => import('@/views/plan/list/index.vue'),
            meta: { title: '采购计划' },
          },
        ],
      },
      {
        path: 'order',
        name: 'Order',
        redirect: '/order/list',
        meta: { title: '订单管理', icon: 'icon-file' },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('@/views/order/list/index.vue'),
            meta: { title: '订单列表' },
          },
          {
            path: 'detail/:id',
            name: 'OrderDetail',
            component: () => import('@/views/order/detail/index.vue'),
            meta: { title: '订单详情', hideInMenu: true },
          },
          {
            path: 'purchase',
            name: 'PurchaseOrder',
            component: () => import('@/views/order/purchase/index.vue'),
            meta: { title: '采购订单' },
          },
          {
            path: 'sale',
            name: 'SaleOrder',
            component: () => import('@/views/order/sale/index.vue'),
            meta: { title: '销售订单' },
          },
        ],
      },
      {
        path: 'stock',
        name: 'Stock',
        redirect: '/stock/overview',
        meta: { title: '库存管理', icon: 'icon-storage' },
        children: [
          {
            path: 'overview',
            name: 'StockOverview',
            component: () => import('@/views/stock/overview/index.vue'),
            meta: { title: '库存总览', icon: 'icon-apps' },
          },
          {
            path: 'warehouse',
            name: 'StockWarehouseList',
            component: () => import('@/views/stock/warehouse/index.vue'),
            meta: { title: '仓库列表', icon: 'icon-home' },
          },
          {
            path: 'warehouse-detail',
            name: 'WarehouseDetail',
            component: () => import('@/views/stock/detail/index.vue'),
            meta: { title: '仓库详情', hideInMenu: true },
          },
          {
            path: 'transfer',
            name: 'StockTransfer',
            component: () => import('@/views/stock/transfer/index.vue'),
            meta: { title: '调拨管理', icon: 'icon-swap' },
          },
          {
            path: 'record',
            name: 'StockRecord',
            component: () => import('@/views/warehouse/record/index.vue'),
            meta: { title: '出入库记录', icon: 'icon-history' },
          },
          {
            path: 'check',
            name: 'StockCheck',
            component: () => import('@/views/stock/check/index.vue'),
            meta: { title: '盘点管理', icon: 'icon-check-circle' },
          },
          {
            path: 'check-detail',
            name: 'StockCheckDetail',
            component: () => import('@/views/stock/check/detail.vue'),
            meta: { title: '盘点详情', hideInMenu: true },
          },
        ],
      },

      {
        path: 'finance',
        name: 'Finance',
        redirect: '/finance/receivable',
        meta: { title: '财务中心', icon: 'icon-money-collect' },
        children: [
          {
            path: 'receivable',
            name: 'FinanceReceivable',
            component: () => import('@/views/finance/receivable/index.vue'),
            meta: { title: '应收记录' },
          },
          {
            path: 'split',
            name: 'FinanceSplit',
            component: () => import('@/views/finance/split/index.vue'),
            meta: { title: '分账记录' },
          },
          {
            path: 'payment',
            name: 'FinancePayment',
            component: () => import('@/views/finance/payment/index.vue'),
            meta: { title: '支付记录' },
          },
          {
            path: 'invoice',
            name: 'FinanceInvoice',
            redirect: '/finance/invoice/output',
            meta: { title: '发票管理' },
            children: [
              {
                path: 'input',
                name: 'FinanceInvoiceInput',
                component: () => import('@/views/finance/invoice/input.vue'),
                meta: { title: '进项发票' },
              },
              {
                path: 'output',
                name: 'FinanceInvoiceOutput',
                component: () => import('@/views/finance/invoice/output.vue'),
                meta: { title: '销项发票' },
              },
            ],
          },
        ],
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统设置', icon: 'icon-settings' },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户管理' },
          },
          {
            path: 'employee',
            name: 'SystemEmployee',
            component: () => import('@/views/system/employee/index.vue'),
            meta: { title: '员工管理' },
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/system/role/index.vue'),
            meta: { title: '角色管理' },
          },
          {
            path: 'menu',
            name: 'SystemMenu',
            component: () => import('@/views/system/menu/index.vue'),
            meta: { title: '菜单管理' },
          },
          {
            path: 'split-config',
            name: 'SystemSplitConfig',
            component: () => import('@/views/system/splitConfig/index.vue'),
            meta: { title: '分账配置' },
          },
          {
            path: 'logistics',
            name: 'SystemLogistics',
            component: () => import('@/views/system/logistics/index.vue'),
            meta: { title: '物流配置' },
          },
        ],
      },
    ],
  },
  {
    path: '/supplier',
    name: 'SupplierLayout',
    component: () => import('@/layouts/SupplierLayout.vue'),
    redirect: '/supplier/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'SupplierDashboard',
        component: () => import('@/views/supplier/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'icon-home' },
      },
      {
        path: 'merchant',
        name: 'SupplierMerchant',
        redirect: '/supplier/merchant/profile',
        meta: { title: '商户信息', icon: 'icon-user' },
        children: [
          {
            path: 'profile',
            name: 'SupplierProfile',
            component: () => import('@/views/supplier/profile/index.vue'),
            meta: { title: '主体信息' },
          },
          {
            path: 'contract',
            name: 'SupplierContract',
            component: () => import('@/views/supplier/contract/index.vue'),
            meta: { title: '合同列表' },
          },
        ],
      },
      {
        path: 'product',
        name: 'SupplierProduct',
        redirect: '/supplier/product/list',
        meta: { title: '商品中心', icon: 'icon-shopping-cart' },
        children: [
          {
            path: 'list',
            name: 'SupplierProductList',
            component: () => import('@/views/supplier/product/index.vue'),
            meta: { title: '商品列表' },
          },
          {
            path: 'inventory',
            name: 'SupplierProductInventory',
            component: () => import('@/views/supplier/product/inventory.vue'),
            meta: { title: '库存记录' },
          },
          {
            path: 'add',
            name: 'SupplierProductAdd',
            component: () => import('@/views/supplier/product/detail.vue'),
            meta: { title: '新增商品', hideInMenu: true },
          },
          {
            path: 'edit/:id',
            name: 'SupplierProductEdit',
            component: () => import('@/views/supplier/product/detail.vue'),
            meta: { title: '编辑商品', hideInMenu: true },
          },
          {
            path: 'view/:id',
            name: 'SupplierProductView',
            component: () => import('@/views/supplier/product/detail.vue'),
            meta: { title: '商品详情', hideInMenu: true },
          },
        ],
      },
      {
        path: 'order',
        name: 'SupplierOrder',
        redirect: '/supplier/order/list',
        meta: { title: '订单管理', icon: 'icon-file' },
        children: [
          {
            path: 'list',
            name: 'SupplierOrderList',
            component: () => import('@/views/supplier/order/index.vue'),
            meta: { title: '订单列表' },
          },
          {
            path: 'refund',
            name: 'SupplierOrderRefund',
            component: () => import('@/views/supplier/order/refund.vue'),
            meta: { title: '售后管理' },
          },
          {
            path: 'detail/:id',
            name: 'SupplierOrderDetail',
            component: () => import('@/views/supplier/order/detail.vue'),
            meta: { title: '订单详情', hideInMenu: true },
          },
        ],
      },
      {
        path: 'finance',
        name: 'SupplierFinance',
        redirect: '/supplier/finance/invoice',
        meta: { title: '财务中心', icon: 'icon-money-collect' },
        children: [
          {
            path: 'invoice',
            name: 'SupplierFinanceInvoice',
            component: () => import('@/views/supplier/finance/invoice/index.vue'),
            meta: { title: '发票管理' },
          },
          {
            path: 'invoice/detail/:id',
            name: 'SupplierFinanceInvoiceDetail',
            component: () => import('@/views/supplier/finance/invoice/detail.vue'),
            meta: { title: '发票详情', hideInMenu: true },
          },
        ],
      },
      {
        path: 'system',
        name: 'SupplierSystem',
        redirect: '/supplier/system/account',
        meta: { title: '系统设置', icon: 'icon-settings' },
        children: [
          {
            path: 'account',
            name: 'SupplierAccount',
            component: () => import('@/views/supplier/account/index.vue'),
            meta: { title: '账号列表' },
          },
          {
            path: 'staff',
            name: 'SupplierStaff',
            component: () => import('@/views/supplier/staff/index.vue'),
            meta: { title: '员工管理' },
          },
          {
            path: 'role',
            name: 'SupplierRole',
            component: () => import('@/views/supplier/role/index.vue'),
            meta: { title: '角色列表' },
          },
        ],
      },
    ],
  },
  {
    path: '/warehouse',
    name: 'WarehouseLayout',
    component: () => import('@/layouts/WarehouseLayout.vue'),
    redirect: '/warehouse/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'WarehouseDashboard',
        component: () => import('@/views/warehouse/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'icon-home' },
      },
      {
        path: 'merchant',
        name: 'WarehouseMerchant',
        redirect: '/warehouse/merchant/profile',
        meta: { title: '商户中心', icon: 'icon-user' },
        children: [
          {
            path: 'profile',
            name: 'WarehouseProfile',
            component: () => import('@/views/warehouse/profile/index.vue'),
            meta: { title: '主体信息' },
          },
          {
            path: 'contract',
            name: 'WarehouseContract',
            component: () => import('@/views/warehouse/contract/index.vue'),
            meta: { title: '合同列表', hideInMenu: true },
          },
        ],
      },
      {
        path: 'market',
        name: 'WarehouseMarket',
        redirect: '/warehouse/market/list',
        meta: { title: '商品市场', icon: 'icon-shop' },
        children: [
          {
            path: 'list',
            name: 'WarehouseMarketList',
            component: () => import('@/views/warehouse/market/index.vue'),
            meta: { title: '商品列表', icon: 'icon-apps' },
          },
          {
            path: 'plan',
            name: 'WarehousePlanList',
            component: () => import('@/views/warehouse/plan/index.vue'),
            meta: { title: '采购计划', icon: 'icon-file' },
          },
          {
            path: 'plan/create',
            name: 'WarehousePlanCreate',
            component: () => import('@/views/warehouse/plan/create.vue'),
            meta: { title: '新建采购计划', hideInMenu: true },
          },
          {
            path: 'detail/:id',
            name: 'WarehouseMarketDetail',
            component: () => import('@/views/warehouse/market/detail.vue'),
            meta: { title: '商品详情', hideInMenu: true },
          },
          {
            path: 'cart',
            name: 'WarehouseMarketCart',
            component: () => import('@/views/warehouse/market/cart.vue'),
            meta: { title: '购物车', hideInMenu: true },
          },
          {
            path: 'order-create',
            name: 'WarehouseMarketOrderCreate',
            component: () => import('@/views/warehouse/market/order-create.vue'),
            meta: { title: '确认订单', hideInMenu: true },
          },
        ],
      },
      {
        path: 'product',
        name: 'WarehouseProduct',
        redirect: '/warehouse/product/list',
        meta: { title: '商品中心', icon: 'icon-apps' },
        children: [
          {
            path: 'list',
            name: 'WarehouseProductList',
            component: () => import('@/views/warehouse/product/list.vue'),
            meta: { title: '商品列表' },
          },
          {
            path: 'spu-detail/:id',
            name: 'WarehouseSpuDetail',
            component: () => import('@/views/warehouse/product/spu-detail.vue'),
            meta: { title: 'SPU详情', hideInMenu: true },
          },
          {
            path: 'sku-detail/:id',
            name: 'WarehouseSkuDetail',
            component: () => import('@/views/warehouse/product/sku-detail.vue'),
            meta: { title: 'SKU库存详情', hideInMenu: true },
          },
        ],
      },
      {
        path: 'warehouse',
        name: 'WarehouseManage',
        redirect: '/warehouse/warehouse-list',
        meta: { title: '仓库管理', icon: 'icon-storage' },
        children: [
          {
            path: 'warehouse-list',
            name: 'WarehouseList',
            component: () => import('@/views/warehouse/warehouse/list/index.vue'),
            meta: { title: '仓库列表' },
          },
          {
            path: 'stock-manage',
            name: 'WarehouseStockManage',
            component: () => import('@/views/warehouse/stock/index.vue'),
            meta: { title: '出入库管理' },
          },
          {
            path: 'transfer',
            name: 'WarehouseStockTransfer',
            component: () => import('@/views/warehouse/stock/transfer.vue'),
            meta: { title: '库存调拨' },
          },
          {
            path: 'receive-batch',
            name: 'WarehouseReceiveBatch',
            component: () => import('@/views/warehouse/stock/receive-batch.vue'),
            meta: { title: '收货批次' },
          },
          {
            path: 'stock-check',
            name: 'WarehouseStockCheck',
            component: () => import('@/views/warehouse/stock/check.vue'),
            meta: { title: '库存盘点' },
          },
        ],
      },
      {
        path: 'warehouse-detail/:id',
        name: 'WarehouseDetail',
        component: () => import('@/views/warehouse/warehouse/detail/index.vue'),
        meta: { title: '仓库详情', hideInMenu: true },
      },
      {
        path: 'order',
        name: 'WarehouseOrder',
        redirect: '/warehouse/order/purchase',
        meta: { title: '订单管理', icon: 'icon-file' },
        children: [
          {
            path: 'purchase',
            name: 'WarehousePurchaseOrder',
            component: () => import('@/views/warehouse/order/purchase/index.vue'),
            meta: { title: '采购订单' },
          },
          {
            path: 'purchase/create',
            name: 'WarehousePurchaseCreate',
            component: () => import('@/views/warehouse/order/purchase/create.vue'),
            meta: { title: '新建采购订单', hideInMenu: true },
          },
          {
            path: 'purchase/detail/:id',
            name: 'WarehousePurchaseDetail',
            component: () => import('@/views/warehouse/order/purchase/detail.vue'),
            meta: { title: '采购订单详情', hideInMenu: true },
          },
          {
            path: 'sale',
            name: 'WarehouseSaleOrder',
            component: () => import('@/views/warehouse/order/sale/index.vue'),
            meta: { title: '销售订单' },
          },
          {
            path: 'sale/detail/:id',
            name: 'WarehouseSaleDetail',
            component: () => import('@/views/warehouse/order/sale/detail.vue'),
            meta: { title: '销售订单详情', hideInMenu: true },
          },
        ],
      },

      {
        path: 'finance',
        name: 'WarehouseFinance',
        redirect: '/warehouse/finance/payment',
        meta: { title: '财务中心', icon: 'icon-money-collect' },
        children: [
          {
            path: 'payment',
            name: 'WarehousePayment',
            component: () => import('@/views/warehouse/finance/payment/index.vue'),
            meta: { title: '支付记录' },
          },
          {
            path: 'invoice-input',
            name: 'WarehouseInvoiceInput',
            component: () => import('@/views/warehouse/finance/invoice/input.vue'),
            meta: { title: '进项发票' },
          },
          {
            path: 'invoice-output',
            name: 'WarehouseInvoiceOutput',
            component: () => import('@/views/warehouse/finance/invoice/output.vue'),
            meta: { title: '销项发票' },
          },
        ],
      },
      {
        path: 'system',
        name: 'WarehouseSystem',
        redirect: '/warehouse/system/account',
        meta: { title: '系统设置', icon: 'icon-settings' },
        children: [
          {
            path: 'account',
            name: 'WarehouseAccount',
            component: () => import('@/views/warehouse/account/index.vue'),
            meta: { title: '账号列表' },
          },
          {
            path: 'staff',
            name: 'WarehouseStaff',
            component: () => import('@/views/warehouse/staff/index.vue'),
            meta: { title: '员工管理' },
          },
          {
            path: 'role',
            name: 'WarehouseRole',
            component: () => import('@/views/warehouse/role/index.vue'),
            meta: { title: '角色列表' },
          },
        ],
      },
    ],
  },
  {
    path: '/prd-viewer',
    name: 'PrdViewer',
    component: () => import('@/views/warehouse/prd/index.vue'),
    meta: { title: '产品需求文档', requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory('/gongchengcang/'),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || ''} - 工程材料管理采供一体化平台`
  
  if (to.meta.requiresAuth !== false) {
    if (!getToken()) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router
