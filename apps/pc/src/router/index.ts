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
          {
            path: 'supplier-audit',
            name: 'ProductSupplierAudit',
            component: () => import('@/views/product/supplier-audit/index.vue'),
            meta: { title: '供应商商品审核' },
          },
        ],
      },
      {
        path: 'market',
        name: 'Market',
        redirect: '/market/list',
        meta: { title: '商品市场', icon: 'icon-tags' },
        children: [
          {
            path: 'list',
            name: 'MarketList',
            component: () => import('@/views/market/list/index.vue'),
            meta: { title: '市场商品', icon: 'icon-apps' },
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
            path: 'category',
            name: 'MarketCategory',
            component: () => import('@/views/market/category/index.vue'),
            meta: { title: '分类展示', icon: 'icon-folder' },
          },
          {
            path: 'price',
            name: 'MarketPrice',
            component: () => import('@/views/market/price/index.vue'),
            meta: { title: '价格管理', icon: 'icon-price-tag' },
          },
          {
            path: 'stock',
            name: 'MarketStock',
            component: () => import('@/views/market/stock/index.vue'),
            meta: { title: '工程仓库存', icon: 'icon-storage' },
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
        path: 'plan',
        name: 'Plan',
        redirect: '/plan/list',
        meta: { title: '采购计划', icon: 'icon-calendar' },
        children: [
          {
            path: 'list',
            name: 'PlanList',
            component: () => import('@/views/plan/list/index.vue'),
            meta: { title: '计划列表' },
          },
        ],
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        redirect: '/warehouse/list',
        meta: { title: '仓库管理', icon: 'icon-storage' },
        children: [
          {
            path: 'list',
            name: 'WarehouseList',
            component: () => import('@/views/warehouse/list/index.vue'),
            meta: { title: '仓库列表' },
          },
          {
            path: 'stock',
            name: 'WarehouseProduct',
            component: () => import('@/views/warehouse/stock/index.vue'),
            meta: { title: '仓库商品' },
          },
          {
            path: 'record',
            name: 'StockRecord',
            component: () => import('@/views/warehouse/record/index.vue'),
            meta: { title: '库存记录' },
          },
        ],
      },
      {
        path: 'construction',
        name: 'Construction',
        redirect: '/construction/list',
        meta: { title: '工程仓管理', icon: 'icon-home' },
        children: [
          {
            path: 'list',
            name: 'ConstructionList',
            component: () => import('@/views/construction/list/index.vue'),
            meta: { title: '工程仓列表' },
          },
          {
            path: 'market',
            name: 'ConstructionMarket',
            component: () => import('@/views/construction/market/index.vue'),
            meta: { title: '商品市场' },
          },
          {
            path: 'permission',
            name: 'ConstructionPermission',
            component: () => import('@/views/construction/permission/index.vue'),
            meta: { title: '商品权限', hideInMenu: true },
          },
          {
            path: 'price',
            name: 'ConstructionPrice',
            component: () => import('@/views/construction/price/index.vue'),
            meta: { title: '价格策略', hideInMenu: true },
          },
        ],
      },
      {
        path: 'finance',
        name: 'Finance',
        redirect: '/finance/custody/list',
        meta: { title: '财务中心', icon: 'icon-money-collect' },
        children: [
          {
            path: 'custody',
            name: 'FundCustody',
            redirect: '/finance/custody/list',
            meta: { title: '资金托管' },
            children: [
              {
            path: 'list',
            name: 'CustodyAccountList',
            component: () => import('@/views/finance/custody/index.vue'),
            meta: { title: '账户列表' },
          },
          {
            path: 'detail/:accountId',
            name: 'CustodyAccountDetail',
            component: () => import('@/views/finance/custody/detail.vue'),
            meta: { title: '账户详情', hideInMenu: true },
          },
              {
                path: 'open-record',
                name: 'CustodyOpenRecord',
                component: () => import('@/views/finance/custody/open-record.vue'),
                meta: { title: '开户审核' },
              },
              {
                path: 'bank-card',
                name: 'CustodyBankCard',
                component: () => import('@/views/finance/custody/bank-card.vue'),
                meta: { title: '绑卡管理' },
              },
              {
                path: 'recharge',
                name: 'CustodyRecharge',
                component: () => import('@/views/finance/custody/recharge.vue'),
                meta: { title: '充值记录' },
              },
              {
                path: 'withdraw',
                name: 'CustodyWithdraw',
                component: () => import('@/views/finance/custody/withdraw.vue'),
                meta: { title: '提现审核' },
              },
            ],
          },
          {
            path: 'split',
            name: 'FinanceSplit',
            redirect: '/finance/split/list',
            meta: { title: '分账管理' },
            children: [
              {
                path: 'list',
                name: 'FinanceSplitList',
                component: () => import('@/views/finance/split/index.vue'),
                meta: { title: '分账记录' },
              },
              {
                path: 'config',
                name: 'FinanceSplitConfig',
                component: () => import('@/views/finance/split/config.vue'),
                meta: { title: '分账规则' },
              },
            ],
          },
          {
            path: 'settlement',
            name: 'FinanceSettlement',
            redirect: '/finance/settlement/list',
            meta: { title: '结算管理' },
            children: [
              {
                path: 'list',
                name: 'FinanceSettlementList',
                component: () => import('@/views/finance/settlement/index.vue'),
                meta: { title: '结算单列表' },
              },
              {
                path: 'audit',
                name: 'FinanceSettlementAudit',
                component: () => import('@/views/finance/settlement/audit.vue'),
                meta: { title: '结算审核' },
              },
              {
                path: 'detail/:id',
                name: 'FinanceSettlementDetail',
                component: () => import('@/views/finance/settlement/detail.vue'),
                meta: { title: '结算详情', hideInMenu: true },
              },
            ],
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
          {
            path: 'service-bill',
            name: 'FinanceServiceBill',
            component: () => import('@/views/finance/service-bill/index.vue'),
            meta: { title: '服务费账单' },
          },
          {
            path: 'report',
            name: 'FinanceReport',
            redirect: '/finance/report/income',
            meta: { title: '财务报表' },
            children: [
              {
                path: 'income',
                name: 'FinanceReportIncome',
                component: () => import('@/views/finance/report/income.vue'),
                meta: { title: '收入统计' },
              },
              {
                path: 'expense',
                name: 'FinanceReportExpense',
                component: () => import('@/views/finance/report/expense.vue'),
                meta: { title: '支出统计' },
              },
              {
                path: 'profit',
                name: 'FinanceReportProfit',
                component: () => import('@/views/finance/report/profit.vue'),
                meta: { title: '利润分析' },
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
        meta: { title: '商品中心', icon: 'icon-apps' },
        children: [
          {
            path: 'list',
            name: 'SupplierProductList',
            component: () => import('@/views/supplier/product/index.vue'),
            meta: { title: '我的商品' },
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
        path: 'finance',
        name: 'SupplierFinance',
        redirect: '/supplier/finance/custody',
        meta: { title: '财务中心', icon: 'icon-money-collect' },
        children: [
          {
            path: 'custody',
            name: 'SupplierCustody',
            redirect: '/supplier/finance/custody/overview',
            meta: { title: '托管账户' },
            children: [
              {
                path: 'overview',
                name: 'SupplierCustodyOverview',
                component: () => import('@/views/supplier/finance/custody/overview.vue'),
                meta: { title: '账户概览' },
              },
              {
                path: 'recharge',
                name: 'SupplierCustodyRecharge',
                component: () => import('@/views/supplier/finance/custody/recharge.vue'),
                meta: { title: '充值记录' },
              },
              {
                path: 'withdraw',
                name: 'SupplierCustodyWithdraw',
                component: () => import('@/views/supplier/finance/custody/withdraw.vue'),
                meta: { title: '提现记录' },
              },
            ],
          },
          {
            path: 'settlement',
            name: 'SupplierSettlement',
            redirect: '/supplier/finance/settlement/list',
            meta: { title: '结算管理' },
            children: [
              {
                path: 'list',
                name: 'SupplierSettlementList',
                component: () => import('@/views/supplier/finance/settlement/index.vue'),
                meta: { title: '结算单列表' },
              },
              {
                path: 'apply',
                name: 'SupplierSettlementApply',
                component: () => import('@/views/supplier/finance/settlement/apply.vue'),
                meta: { title: '申请结算', hideInMenu: true },
              },
              {
                path: 'detail/:id',
                name: 'SupplierSettlementDetail',
                component: () => import('@/views/supplier/finance/settlement/detail.vue'),
                meta: { title: '结算详情', hideInMenu: true },
              },
            ],
          },
          {
            path: 'bill',
            name: 'SupplierBill',
            component: () => import('@/views/supplier/finance/bill/index.vue'),
            meta: { title: '销售账单' },
          },
          {
            path: 'invoice',
            name: 'SupplierInvoice',
            component: () => import('@/views/supplier/finance/invoice/index.vue'),
            meta: { title: '发票管理' },
          },
          {
            path: 'api',
            name: 'SupplierApi',
            component: () => import('@/views/supplier/finance/api/index.vue'),
            meta: { title: 'API对接' },
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
            meta: { title: '合同列表' },
          },
        ],
      },
      {
        path: 'market',
        name: 'WarehouseMarket',
        redirect: '/warehouse/market/list',
        meta: { title: '商品市场', icon: 'icon-shopping-cart' },
        children: [
          {
            path: 'list',
            name: 'WarehouseMarketList',
            component: () => import('@/views/warehouse/market/index.vue'),
            meta: { title: '市场商品', icon: 'icon-apps' },
          },
          {
            path: 'bom',
            name: 'WarehouseMarketBom',
            component: () => import('@/views/warehouse/market/bom/index.vue'),
            meta: { title: 'BOM基装包', icon: 'icon-folder' },
          },
          {
            path: 'bom/detail/:id',
            name: 'WarehouseMarketBomDetail',
            component: () => import('@/views/warehouse/market/bom/detail.vue'),
            meta: { title: 'BOM包详情', hideInMenu: true },
          },
          {
            path: 'bom/order/:id',
            name: 'WarehouseMarketBomOrder',
            component: () => import('@/views/warehouse/market/bom/order.vue'),
            meta: { title: '确认订单', hideInMenu: true },
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
        path: 'bom-manage',
        name: 'WarehouseBomManage',
        component: () => import('@/views/warehouse/bom-manage/index.vue'),
        meta: { title: 'BOM包管理', icon: 'icon-folder' },
      },
      {
        path: 'my-bom',
        name: 'WarehouseMyBom',
        redirect: '/warehouse/my-bom/list',
        meta: { title: '我的BOM包', icon: 'icon-folder' },
        children: [
          {
            path: 'list',
            name: 'WarehouseMyBomList',
            component: () => import('@/views/warehouse/my-bom/index.vue'),
            meta: { title: 'BOM包列表' },
          },
          {
            path: 'create',
            name: 'WarehouseMyBomCreate',
            component: () => import('@/views/warehouse/my-bom/create.vue'),
            meta: { title: '创建BOM包', hideInMenu: true },
          },
          {
            path: 'edit/:id',
            name: 'WarehouseMyBomEdit',
            component: () => import('@/views/warehouse/my-bom/create.vue'),
            meta: { title: '编辑BOM包', hideInMenu: true },
          },
          {
            path: 'detail/:id',
            name: 'WarehouseMyBomDetail',
            component: () => import('@/views/warehouse/my-bom/detail.vue'),
            meta: { title: 'BOM包详情', hideInMenu: true },
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
            component: () => import('@/views/warehouse/product/index.vue'),
            meta: { title: '商品列表' },
          },
          {
            path: 'detail/:id',
            name: 'WarehouseProductDetail',
            component: () => import('@/views/warehouse/product/detail.vue'),
            meta: { title: '商品详情', hideInMenu: true },
          },
        ],
      },
      {
        path: 'warehouse',
        name: 'WarehouseManage',
        redirect: '/warehouse/warehouse/list',
        meta: { title: '仓库管理', icon: 'icon-storage' },
        children: [
          {
            path: 'list',
            name: 'WarehouseList',
            component: () => import('@/views/warehouse/warehouse/list/index.vue'),
            meta: { title: '仓库列表' },
          },
        ],
      },
      {
        path: 'stock',
        name: 'WarehouseStock',
        redirect: '/warehouse/stock/in',
        meta: { title: '库存管理', icon: 'icon-list' },
        children: [
          {
            path: 'in',
            name: 'WarehouseStockIn',
            component: () => import('@/views/warehouse/stock/in/index.vue'),
            meta: { title: '入库单' },
          },
          {
            path: 'out',
            name: 'WarehouseStockOut',
            component: () => import('@/views/warehouse/stock/out/index.vue'),
            meta: { title: '出库单' },
          },
        ],
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
        redirect: '/warehouse/finance/custody',
        meta: { title: '财务中心', icon: 'icon-money-collect' },
        children: [
          {
            path: 'custody',
            name: 'WarehouseCustody',
            redirect: '/warehouse/finance/custody/overview',
            meta: { title: '托管账户' },
            children: [
              {
                path: 'overview',
                name: 'WarehouseCustodyOverview',
                component: () => import('@/views/warehouse/finance/custody/overview.vue'),
                meta: { title: '账户概览' },
              },
              {
                path: 'recharge',
                name: 'WarehouseCustodyRecharge',
                component: () => import('@/views/warehouse/finance/custody/recharge.vue'),
                meta: { title: '充值记录' },
              },
              {
                path: 'withdraw',
                name: 'WarehouseCustodyWithdraw',
                component: () => import('@/views/warehouse/finance/custody/withdraw.vue'),
                meta: { title: '提现记录' },
              },
            ],
          },
          {
            path: 'settlement',
            name: 'WarehouseSettlement',
            redirect: '/warehouse/finance/settlement/list',
            meta: { title: '结算管理' },
            children: [
              {
                path: 'list',
                name: 'WarehouseSettlementList',
                component: () => import('@/views/warehouse/finance/settlement/index.vue'),
                meta: { title: '结算单列表' },
              },
              {
                path: 'apply',
                name: 'WarehouseSettlementApply',
                component: () => import('@/views/warehouse/finance/settlement/apply.vue'),
                meta: { title: '申请结算', hideInMenu: true },
              },
              {
                path: 'detail/:id',
                name: 'WarehouseSettlementDetail',
                component: () => import('@/views/warehouse/finance/settlement/detail.vue'),
                meta: { title: '结算详情', hideInMenu: true },
              },
            ],
          },
          {
            path: 'bill',
            name: 'WarehouseBill',
            redirect: '/warehouse/finance/bill/purchase',
            meta: { title: '账单管理' },
            children: [
              {
                path: 'purchase',
                name: 'WarehousePurchaseBill',
                component: () => import('@/views/warehouse/finance/bill/purchase.vue'),
                meta: { title: '采购账单' },
              },
              {
                path: 'sale',
                name: 'WarehouseSaleBill',
                component: () => import('@/views/warehouse/finance/bill/sale.vue'),
                meta: { title: '销售账单' },
              },
              {
                path: 'service',
                name: 'WarehouseServiceBill',
                component: () => import('@/views/warehouse/finance/bill/service.vue'),
                meta: { title: '服务费账单' },
              },
            ],
          },
          {
            path: 'statement',
            name: 'WarehouseStatement',
            component: () => import('@/views/warehouse/finance/statement/index.vue'),
            meta: { title: '对账中心' },
          },
        ],
      },
      {
        path: 'invoice',
        name: 'WarehouseInvoice',
        redirect: '/warehouse/invoice/list',
        meta: { title: '发票管理', icon: 'icon-file-text' },
        children: [
          {
            path: 'list',
            name: 'WarehouseInvoiceList',
            component: () => import('@/views/warehouse/invoice/index.vue'),
            meta: { title: '发票列表' },
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
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
