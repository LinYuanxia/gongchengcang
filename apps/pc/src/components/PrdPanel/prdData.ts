/**
 * 工程仓端PRD数据模块
 * 
 * 导航元数据：每个模块的名称、描述、优先级
 * 实际PRD内容通过 docUrl 指向 public/prd-docs/ 下的MD文件
 * 由PRD查看器在运行时fetch并渲染
 */

export interface PrdModule {
  id: string
  name: string
  docFile: string
  docUrl: string
  icon: string
  priority: string
  description: string
}

/** 树形目录节点 */
export interface TreeDocNode {
  key: string
  title: string
  icon?: string
  isLeaf?: boolean
  selectable?: boolean
  children?: TreeDocNode[]
  module?: PrdModule
}

/** 支持的端 */
export type PrdSource = 'warehouse' | 'platform' | 'supplier' | 'construction' | 'project' | 'manual' | 'archive'

export const sourceOptions: { label: string; value: PrdSource }[] = [
  { label: '📌 项目总览', value: 'project' },
  { label: '工程仓端', value: 'warehouse' },
  { label: '平台端', value: 'platform' },
  { label: '供应商端', value: 'supplier' },
  { label: '施工方端', value: 'construction' },
  { label: '📖 系统操作手册', value: 'manual' },
  { label: '📦 历史归档', value: 'archive' },
]

/** 全部PRD模块列表 - 工程仓端 */
export const prdModules: PrdModule[] = [
  {
    id: '00',
    name: '文档总纲',
    docFile: 'prd.md',
    docUrl: '/gongchengcang/prd-docs/prd.md',
    icon: 'icon-file',
    priority: '总纲',
    description: '工程仓端PRD总纲，包含设计原则、术语表、角色权限、51功能全景、45条PrdPanel、6张核心流程图、四端边界、全局交互规范',
  },
  {
    id: '01',
    name: '系统概览与架构',
    docFile: '01-系统概览与架构.md',
    docUrl: '/gongchengcang/prd-docs/01-系统概览与架构.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '工程仓SaaS平台系统全景概览，包含设计哲学、技术栈、模块树、非功能性需求等基础架构信息',
  },
  {
    id: '02',
    name: '业务流程设计',
    docFile: '02-业务流程设计.md',
    docUrl: '/gongchengcang/prd-docs/02-业务流程设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '工程仓端核心业务流程，包括双交易链路（采购链路+销售链路）、状态流转规则、关键流程说明',
  },
  {
    id: '04',
    name: '领域模型设计',
    docFile: '04-领域模型设计.md',
    docUrl: '/gongchengcang/prd-docs/04-领域模型设计.md',
    icon: 'icon-list',
    priority: 'P0',
    description: 'DDD领域驱动设计视角下的工程仓端核心领域模型，包含实体、领域服务、领域事件、分层架构',
  },
  {
    id: '05',
    name: '工作台与商户中心',
    docFile: '05-工作台与商户中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/05-工作台与商户中心功能设计.md',
    icon: 'icon-home',
    priority: 'P0',
    description: '工程仓端工作台仪表盘与商户中心，包含首页数据看板、主体信息管理、合同管理等功能',
  },
  {
    id: '06',
    name: '商品市场',
    docFile: '06-商品市场功能设计.md',
    docUrl: '/gongchengcang/prd-docs/06-商品市场功能设计.md',
    icon: 'icon-shop',
    priority: 'P0',
    description: '工程仓从供应商处采购商品的核心入口，包含商品浏览、采购计划、购物车、结算确认等6个P0功能点',
  },
  {
    id: '07',
    name: '采购计划',
    docFile: '07-采购计划功能设计.md',
    docUrl: '/gongchengcang/prd-docs/07-采购计划功能设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '采购计划是采购流程的前置环节，将零散采购需求汇集为一个计划单，再统一生成采购订单',
  },
  {
    id: '08',
    name: '商品中心',
    docFile: '08-商品中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/08-商品中心功能设计.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '工程仓端查看和管理本仓商品库存的入口，包含商品列表、SPU详情、SKU详情3个Tab页签',
  },
  {
    id: '09',
    name: '采购订单管理',
    docFile: '09-采购订单管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/09-采购订单管理功能设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '工程仓向供应商采购商品的订单管理，核心设计原则：三状态分离（订单/支付/发货完全独立）',
  },
  {
    id: '10',
    name: '销售订单管理',
    docFile: '10-销售订单管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/10-销售订单管理功能设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '施工方向工程仓采购商品的订单管理，包含销售订单的列表、详情、出库发货、取消等6个功能点',
  },
  {
    id: '11',
    name: '仓库管理',
    docFile: '11-仓库管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/11-仓库管理功能设计.md',
    icon: 'icon-storage',
    priority: 'P0',
    description: '工程仓仓库核心管理模块，包含入库管理、出库管理、库存调拨、盘点、出入库记录等12个功能点',
  },
  {
    id: '12',
    name: '财务中心',
    docFile: '12-财务中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/12-财务中心功能设计.md',
    icon: 'icon-money-collect',
    priority: 'P0',
    description: '工程仓端的财务管理模块，包含支付记录、进项发票、销项发票三大功能，不做在线支付只做记录',
  },
  {
    id: '13',
    name: '系统设置',
    docFile: '13-系统设置功能设计.md',
    docUrl: '/gongchengcang/prd-docs/13-系统设置功能设计.md',
    icon: 'icon-settings',
    priority: 'P0',
    description: '工程仓端系统管理模块，包含用户管理、员工管理、角色管理、权限树（60+权限节点）',
  },
  {
    id: '14',
    name: '页面导航设计',
    docFile: '14-页面导航设计.md',
    docUrl: '/gongchengcang/prd-docs/14-页面导航设计.md',
    icon: 'icon-list',
    priority: 'P0',
    description: '工程仓端页面导航关系图，包含44个页面索引、6张导航关系图、页面跳转交互规则',
  },
]

/** 按优先级分组的模块索引 - 工程仓端 */
export const prdModulesByPriority = {
  P0: prdModules.filter(m => m.priority === 'P0'),
  P1: prdModules.filter(m => m.priority === 'P1'),
  P2: prdModules.filter(m => m.priority === 'P2'),
}

/** 全部PRD模块列表 - 平台端 */
export const platformPrdModules: PrdModule[] = [
  {
    id: '00',
    name: '文档总纲',
    docFile: 'prd.md',
    docUrl: '/gongchengcang/prd-docs/platform/prd.md',
    icon: 'icon-file',
    priority: '总纲',
    description: '平台端PRD总纲，包含设计原则、术语表、五角色权限矩阵、54功能全景、4张核心流程图、全局交互规范',
  },
  {
    id: '01',
    name: '系统概览与架构',
    docFile: '01-系统概览与架构.md',
    docUrl: '/gongchengcang/prd-docs/platform/01-系统概览与架构.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '平台端系统全景概览，包含系统定位、技术架构、8大模块、五角色定义、非功能性需求',
  },
  {
    id: '02',
    name: '业务流程设计',
    docFile: '02-业务流程设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/02-业务流程设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '平台端核心业务流程，包括商户入驻审核、商品全生命周期、全平台订单监控、供应商供货管理4条主线',
  },
  {
    id: '04',
    name: '领域模型设计',
    docFile: '04-领域模型设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/04-领域模型设计.md',
    icon: 'icon-list',
    priority: 'P0',
    description: 'DDD视角下的平台端核心领域模型，包含5个实体、2领域服务、领域事件、分层架构',
  },
  {
    id: '05',
    name: '工作台功能设计',
    docFile: '05-工作台功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/05-工作台功能设计.md',
    icon: 'icon-home',
    priority: 'P0',
    description: '平台端工作台仪表盘，包含数据概览看板、关键指标卡片、趋势图表、待办事项列表',
  },
  {
    id: '06',
    name: '商户管理功能设计',
    docFile: '06-商户管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/06-商户管理功能设计.md',
    icon: 'icon-shop',
    priority: 'P0',
    description: '平台端商户管理，包含商户审核、商户信息维护、合同管理、7个功能点+完整状态治理矩阵',
  },
  {
    id: '07',
    name: '商品管理功能设计',
    docFile: '07-商品管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/07-商品管理功能设计.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '平台端商品管理（功能最密集模块），包含分级管理/属性/SPU/SKU/供货/批量操作等14个功能点',
  },
  {
    id: '08',
    name: '商品市场管理功能设计',
    docFile: '08-商品市场管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/08-商品市场管理功能设计.md',
    icon: 'icon-shop',
    priority: 'P0',
    description: '平台端商品市场管控，包含供应商品/销售商品/BOM管理/价格管理等9个功能点',
  },
  {
    id: '09',
    name: '订单管理功能设计',
    docFile: '09-订单管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/09-订单管理功能设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '平台端全平台订单监控，包含订单查询/详情/状态追踪/数据导出，只读不可操作',
  },
  {
    id: '10',
    name: '库存管理功能设计',
    docFile: '10-库存管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/10-库存管理功能设计.md',
    icon: 'icon-storage',
    priority: 'P1',
    description: '平台端全平台库存总览看板，包含库存总览/仓库管理/出入库流水/调拨/盘点，只读监控',
  },
  {
    id: '11',
    name: '财务中心功能设计',
    docFile: '11-财务中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/11-财务中心功能设计.md',
    icon: 'icon-money-collect',
    priority: 'P0',
    description: '平台端全平台财务管理，包含支付流水/应收/分账/进项销项发票/关联上传等7个功能点',
  },
  {
    id: '12',
    name: '系统设置功能设计',
    docFile: '12-系统设置功能设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/12-系统设置功能设计.md',
    icon: 'icon-settings',
    priority: 'P0',
    description: '平台端后台管理配置，包含用户/员工/角色RBAC/菜单/分账/物流/日志审计等7个功能点',
  },
  {
    id: '13',
    name: '页面导航设计',
    docFile: '13-页面导航设计.md',
    docUrl: '/gongchengcang/prd-docs/platform/13-页面导航设计.md',
    icon: 'icon-list',
    priority: 'P1',
    description: '平台端36个页面索引+路由配置+导航关系Mermaid图+页面跳转交互规则',
  },
]

/** 按优先级分组的模块索引 - 平台端 */
export const platformPrdModulesByPriority = {
  P0: platformPrdModules.filter(m => m.priority === 'P0'),
  P1: platformPrdModules.filter(m => m.priority === 'P1'),
  P2: platformPrdModules.filter(m => m.priority === 'P2'),
}

/** 全部PRD模块列表 - 供应商端 */
export const supplierPrdModules: PrdModule[] = [
  {
    id: '00',
    name: '文档总纲',
    docFile: 'prd.md',
    docUrl: '/gongchengcang/prd-docs/supplier/prd.md',
    icon: 'icon-file',
    priority: '总纲',
    description: '供应商端PRD总纲，包含设计原则(三状态分离+商品两段定义)、术语表、五角色权限矩阵、31功能全景、2张核心流程图、四端边界、全局交互规范',
  },
  {
    id: '01',
    name: '系统概览与架构',
    docFile: '01-系统概览与架构.md',
    docUrl: '/gongchengcang/prd-docs/supplier/01-系统概览与架构.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '供应商端系统全景概览，包含系统定位(商品供应+订单履约)、技术架构、6大模块树、五角色定义',
  },
  {
    id: '02',
    name: '业务流程设计',
    docFile: '02-业务流程设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/02-业务流程设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '供应商端核心业务流程，包含订单履约、商品上架审核、售后补发、发票管理4条主线',
  },
  {
    id: '04',
    name: '领域模型设计',
    docFile: '04-领域模型设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/04-领域模型设计.md',
    icon: 'icon-list',
    priority: 'P0',
    description: 'DDD领域驱动设计视角下的供应商端核心领域模型，包含6个实体、4领域服务、5领域事件、分层架构',
  },
  {
    id: '05',
    name: '工作台与商户中心',
    docFile: '05-工作台与商户中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/05-工作台与商户中心功能设计.md',
    icon: 'icon-home',
    priority: 'P1',
    description: '供应商端工作台仪表盘与商户中心，包含数据概览、主体信息管理、合同列表等功能',
  },
  {
    id: '06',
    name: '商品中心',
    docFile: '06-商品中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/06-商品中心功能设计.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '供应商端商品中心，包含商品列表/新增/编辑/详情/上下架/库存查询/库存流水等7个功能点',
  },
  {
    id: '07',
    name: '订单管理',
    docFile: '07-订单管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/07-订单管理功能设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '供应商端订单管理（核心模块），包含订单列表/详情/确认/取消/发货/打印/售后补发等12个功能点',
  },
  {
    id: '08',
    name: '财务中心',
    docFile: '08-财务中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/08-财务中心功能设计.md',
    icon: 'icon-money-collect',
    priority: 'P1',
    description: '供应商端财务管理，包含发票管理(列表/新增/关联/详情/下载)、待结算、结算单等7个功能点',
  },
  {
    id: '09',
    name: '系统设置',
    docFile: '09-系统设置功能设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/09-系统设置功能设计.md',
    icon: 'icon-settings',
    priority: 'P1',
    description: '供应商端系统管理，包含账号列表、员工管理、角色列表、权限配置等4个功能点',
  },
  {
    id: '10',
    name: '页面导航设计',
    docFile: '10-页面导航设计.md',
    docUrl: '/gongchengcang/prd-docs/supplier/10-页面导航设计.md',
    icon: 'icon-list',
    priority: 'P1',
    description: '供应商端30个页面索引+路由配置+导航关系Mermaid图+页面跳转交互规则',
  },
  {
    id: '11',
    name: '📖 操作手册',
    docFile: '11-操作手册.md',
    docUrl: '/gongchengcang/prd-docs/supplier/11-操作手册.md',
    icon: 'icon-file',
    priority: '操作手册',
    description: '供应商端系统操作手册，面向最终用户的完整使用指南，覆盖工作台/商品/订单/财务/系统设置五大模块',
  },
]

/** 按优先级分组的模块索引 - 供应商端 */
export const supplierPrdModulesByPriority = {
  P0: supplierPrdModules.filter(m => m.priority === 'P0'),
  P1: supplierPrdModules.filter(m => m.priority === 'P1'),
  P2: supplierPrdModules.filter(m => m.priority === 'P2'),
}

/** 全部PRD模块列表 - 施工方端 */
export const constructionPrdModules: PrdModule[] = [
  {
    id: '00',
    name: '文档总纲',
    docFile: 'prd.md',
    docUrl: '/gongchengcang/prd-docs/construction/prd.md',
    icon: 'icon-file',
    priority: '总纲',
    description: '施工方端PRD总纲，包含设计原则(轻量采购+移动优先)、术语表、四角色权限矩阵、28功能全景、2张核心流程图、四端边界、全局交互规范',
  },
  {
    id: '01',
    name: '系统概览与架构',
    docFile: '01-系统概览与架构.md',
    docUrl: '/gongchengcang/prd-docs/construction/01-系统概览与架构.md',
    icon: 'icon-apps',
    priority: 'P0',
    description: '施工方端系统全景概览，包含系统定位(商品采购方)、技术架构、5大模块树、四角色定义、非功能性需求',
  },
  {
    id: '02',
    name: '业务流程设计',
    docFile: '02-业务流程设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/02-业务流程设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '施工方端核心业务流程，包含商品采购、购物车结算、订单跟踪、售后处理4条主线',
  },
  {
    id: '04',
    name: '领域模型设计',
    docFile: '04-领域模型设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/04-领域模型设计.md',
    icon: 'icon-list',
    priority: 'P0',
    description: 'DDD领域驱动设计视角下的施工方端核心领域模型，包含5个实体、3领域服务、4领域事件、分层架构',
  },
  {
    id: '05',
    name: '首页与项目',
    docFile: '05-首页与项目功能设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/05-首页与项目功能设计.md',
    icon: 'icon-home',
    priority: 'P0',
    description: '施工方端首页与项目管理，包含项目列表/切换/概览/工程仓列表/项目详情等5个功能点',
  },
  {
    id: '06',
    name: '商品市场',
    docFile: '06-商品市场功能设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/06-商品市场功能设计.md',
    icon: 'icon-shop',
    priority: 'P0',
    description: '施工方端商品市场（核心入口），包含商品浏览/分类筛选/搜索/加入购物车/商品详情等5个P0功能点',
  },
  {
    id: '07',
    name: '购物车',
    docFile: '07-购物车功能设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/07-购物车功能设计.md',
    icon: 'icon-shop',
    priority: 'P0',
    description: '施工方端购物车管理，包含购物车列表/修改数量/删除/清空/结算下单等5个P0功能点',
  },
  {
    id: '08',
    name: '订单管理',
    docFile: '08-订单管理功能设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/08-订单管理功能设计.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '施工方端订单管理，包含订单列表/详情/取消/确认收货/售后/跟踪等6个功能点',
  },
  {
    id: '09',
    name: '库存与个人中心',
    docFile: '09-库存与个人中心功能设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/09-库存与个人中心功能设计.md',
    icon: 'icon-storage',
    priority: 'P1',
    description: '施工方端库存查询与个人中心，包含库存列表/详情+个人信息/修改密码/意见反馈/退出等7个功能点',
  },
  {
    id: '10',
    name: '页面导航设计',
    docFile: '10-页面导航设计.md',
    docUrl: '/gongchengcang/prd-docs/construction/10-页面导航设计.md',
    icon: 'icon-list',
    priority: 'P1',
    description: '施工方端24个页面索引+路由配置+导航关系Mermaid图+页面跳转交互规则',
  },
]

/** 按优先级分组的模块索引 - 施工方端 */
export const constructionPrdModulesByPriority = {
  P0: constructionPrdModules.filter(m => m.priority === 'P0'),
  P1: constructionPrdModules.filter(m => m.priority === 'P1'),
  P2: constructionPrdModules.filter(m => m.priority === 'P2'),
}

/** 全部PRD模块列表 - 项目视角 */
export const projectPrdModules: PrdModule[] = [
  {
    id: '00',
    name: '项目总览',
    docFile: '项目总览.md',
    docUrl: '/gongchengcang/prd-docs/项目总览.md',
    icon: 'icon-home',
    priority: '总纲',
    description: '工程项目管理系统全景总览，一句话说清项目是什么、四端角色分工、核心概念、功能规模统计',
  },
  {
    id: '01',
    name: '系统功能说明书',
    docFile: '系统功能说明书.md',
    docUrl: '/gongchengcang/prd-docs/系统功能说明书.md',
    icon: 'icon-list',
    priority: 'P0',
    description: '四端系统详细功能说明，按系统逐模块列出所有功能点和操作说明',
  },
  {
    id: '02',
    name: '版本迭代记录',
    docFile: '版本迭代记录.md',
    docUrl: '/gongchengcang/prd-docs/版本迭代记录.md',
    icon: 'icon-file',
    priority: 'P0',
    description: '产品发布版本历史记录，按版本号倒序排列，含各版本核心能力说明',
  },
  {
    id: '03',
    name: '📖 操作手册',
    docFile: '供应商端/11-操作手册.md',
    docUrl: '/gongchengcang/prd-docs/supplier/11-操作手册.md',
    icon: 'icon-file',
    priority: '操作手册',
    description: '供应商端系统操作手册（示例），面向最终用户的完整使用指南',
  },
]

/** 全部PRD模块列表 - 系统操作手册 */
export const manualPrdModules: PrdModule[] = [
  {
    id: '01',
    name: '平台端操作手册',
    docFile: 'manuals/platform.md',
    docUrl: '/gongchengcang/prd-docs/manuals/platform.md',
    icon: 'icon-file',
    priority: '操作手册',
    description: '平台端PC管理后台操作指南，面向平台运营/管理员',
  },
  {
    id: '02',
    name: '供应商端操作手册',
    docFile: 'manuals/supplier.md',
    docUrl: '/gongchengcang/prd-docs/manuals/supplier.md',
    icon: 'icon-file',
    priority: '操作手册',
    description: '供应商门户操作指南，面向供应商',
  },
  {
    id: '03',
    name: '工程仓端操作手册',
    docFile: 'manuals/warehouse.md',
    docUrl: '/gongchengcang/prd-docs/manuals/warehouse.md',
    icon: 'icon-file',
    priority: '操作手册',
    description: '工程仓小程序操作指南，面向仓库管理员',
  },
]

/** 全部PRD模块列表 - 历史归档 */
export const archivePrdModules: PrdModule[] = [
  {
    id: 'q4',
    name: '2025 Q4 旧版详细设计',
    docFile: 'archives/2025_Q4/索引.md',
    docUrl: '/gongchengcang/prd-docs/archives/2025_Q4/索引.md',
    icon: 'icon-file',
    priority: '2025 Q4',
    description: '2025年Q4旧版PRD详细设计文档归档，共26个文件',
  },

  {
    id: 'q1',
    name: '2026 Q1 PM纯净版备份',
    docFile: 'archives/2026_Q1/索引.md',
    docUrl: '/gongchengcang/prd-docs/archives/2026_Q1/索引.md',
    icon: 'icon-file',
    priority: '2026 Q1',
    description: '2026年Q1 PM纯净版PRD备份归档，四端总纲快照',
  },
  {
    id: 'q1-p',
    name: '▶ 平台端 - PM纯净版备份',
    docFile: 'archives/2026_Q1/pm-platform.md',
    docUrl: '/gongchengcang/prd-docs/archives/2026_Q1/pm-platform.md',
    icon: 'icon-file',
    priority: '2026 Q1',
    description: '平台端PM纯净版PRD总纲历史快照',
  },
  {
    id: 'q1-s',
    name: '▶ 供应商端 - PM纯净版备份',
    docFile: 'archives/2026_Q1/pm-supplier.md',
    docUrl: '/gongchengcang/prd-docs/archives/2026_Q1/pm-supplier.md',
    icon: 'icon-file',
    priority: '2026 Q1',
    description: '供应商端PM纯净版PRD总纲历史快照',
  },
  {
    id: 'q1-w',
    name: '▶ 工程仓端 - PM纯净版备份',
    docFile: 'archives/2026_Q1/pm-warehouse.md',
    docUrl: '/gongchengcang/prd-docs/archives/2026_Q1/pm-warehouse.md',
    icon: 'icon-file',
    priority: '2026 Q1',
    description: '工程仓端PM纯净版PRD总纲历史快照',
  },
  {
    id: 'q1-c',
    name: '▶ 施工方端 - PM纯净版备份',
    docFile: 'archives/2026_Q1/pm-construction.md',
    docUrl: '/gongchengcang/prd-docs/archives/2026_Q1/pm-construction.md',
    icon: 'icon-file',
    priority: '2026 Q1',
    description: '施工方端PM纯净版PRD总纲历史快照',
  },
  {
    id: 'old',
    name: '旧资料归档',
    docFile: 'archives/old/索引.md',
    docUrl: '/gongchengcang/prd-docs/archives/old/索引.md',
    icon: 'icon-file',
    priority: '旧资料',
    description: '早期供应商端完整PRD文档和项目规划资料',
  },
  {
    id: 'old-1',
    name: '▶ 供应商端完整PRD（旧版）',
    docFile: 'archives/old/供应商端_产品PRD完整版.md',
    docUrl: '/gongchengcang/prd-docs/archives/old/供应商端_产品PRD完整版.md',
    icon: 'icon-file',
    priority: '旧资料',
    description: '供应商端早期完整PRD文档',
  },
  {
    id: 'old-2',
    name: '▶ 供应商端PRD最终版',
    docFile: 'archives/old/供应商端_产品PRD_最终版.md',
    docUrl: '/gongchengcang/prd-docs/archives/old/供应商端_产品PRD_最终版.md',
    icon: 'icon-file',
    priority: '旧资料',
    description: '供应商端PRD最终版本',
  },
  {
    id: 'old-3',
    name: '▶ 供应商端核心业务流程图',
    docFile: 'archives/old/供应商端_核心业务流程图.md',
    docUrl: '/gongchengcang/prd-docs/archives/old/供应商端_核心业务流程图.md',
    icon: 'icon-file',
    priority: '旧资料',
    description: '供应商端核心业务流程Mermaid图',
  },
  {
    id: 'old-4',
    name: '▶ 完整交互推演复盘',
    docFile: 'archives/old/完整交互推演复盘.md',
    docUrl: '/gongchengcang/prd-docs/archives/old/完整交互推演复盘.md',
    icon: 'icon-file',
    priority: '旧资料',
    description: '完整交互流程推演与复盘文档',
  },
  {
    id: 'old-5',
    name: '▶ 订单与售后状态核心逻辑',
    docFile: 'archives/old/订单状态_售后状态_核心逻辑设计.md',
    docUrl: '/gongchengcang/prd-docs/archives/old/订单状态_售后状态_核心逻辑设计.md',
    icon: 'icon-file',
    priority: '旧资料',
    description: '订单与售后状态机核心逻辑设计',
  },
]

/** 全局更新日志模块 */
export const changelogModule: PrdModule = {
  id: 'changelog',
  name: '总更新日志',
  docFile: '更新日志.md',
  docUrl: '/gongchengcang/prd-docs/更新日志.md',
  icon: 'icon-file',
  priority: '总纲',
  description: 'PRD文档全局更新日志，记录每次版本发布涉及的文档变更',
}

/** 跨部门协同PRD（项目总览 - 全局协同架构） */
export const crossDeptPrdModule: PrdModule = {
  id: 'crossdept-overview',
  name: '跨部门协同PRD',
  docFile: '跨部门协同PRD.md',
  docUrl: '/gongchengcang/prd-docs/跨部门协同PRD.md',
  icon: 'icon-file',
  priority: '总纲',
  description: '工程项目管理系统四端跨系统协同总体架构，涵盖协作全景、数据流向和通信规则',
}

/** 跨部门协同（PRD文档 - 当前版本） */
export const crossDeptModule: PrdModule = {
  id: 'crossdept',
  name: '跨部门协同',
  docFile: '跨部门协同.md',
  docUrl: '/gongchengcang/prd-docs/跨部门协同.md',
  icon: 'icon-file',
  priority: '总纲',
  description: '当前版本四端跨部门协同功能设计，聚焦本期迭代涉及的协同场景和接口规范',
}

/** 文档目录架构与口径说明 */
export const docTreeModule: PrdModule = {
  id: 'doctree',
  name: '文档目录架构与口径说明',
  docFile: '文档目录架构与口径说明.md',
  docUrl: '/gongchengcang/prd-docs/文档目录架构与口径说明.md',
  icon: 'icon-file',
  priority: '总纲',
  description: '产品文档目录架构与口径说明，帮助读者快速了解文档体系结构和各模块覆盖范围',
}


/** 26.4.1期 - 版本概览模块 */
export const releaseOverviewModule: PrdModule = {
  id: '2641-overview',
  name: '版本概览',
  docFile: '版本概览.md',
  docUrl: '/gongchengcang/prd-docs/releases/26.4.1-0-1搭建/版本概览.md',
  icon: 'icon-file',
  priority: '总纲',
  description: '26.4.1期 - 系统0-1搭建，包含版本范围、核心目标、四端功能全景、下版本路标',
}

/** 树形目录导航数据 - 按 docs/ 层级组织 */
export const prdDocTree: TreeDocNode[] = [
  {
    key: 'project-section',
    title: '📌 项目总览',
    children: [
      ...projectPrdModules.slice(0, 3).map(m => ({
        key: `project-${m.id}`,
        title: m.name,
        isLeaf: true,
        module: m,
      })),
      {
        key: 'project-crossdept',
        title: '跨部门协同PRD',
        isLeaf: true,
        module: crossDeptPrdModule,
      },
      {
        key: 'project-doctree',
        title: '文档目录架构与口径说明',
        isLeaf: true,
        module: docTreeModule,
      },
    ],
  },
  {
    key: 'prd-section',
    title: 'PRD文档',
    children: [
      {
        key: 'release-2641',
        title: '🏷️ 26.4.1期 - 0-1搭建',
        selectable: false,
        children: [
          {
            key: 'release-2641-overview',
            title: '版本概览',
            isLeaf: true,
            module: releaseOverviewModule,
          },
          {
            key: 'release-2641-project',
            title: '项目总览',
            children: [
              ...projectPrdModules.slice(0, 3).map(m => ({
                key: `2641-project-${m.id}`,
                title: m.name,
                isLeaf: true,
                module: m,
              })),
              {
                key: '2641-project-crossdept',
                title: '跨部门协同PRD',
                isLeaf: true,
                module: crossDeptPrdModule,
              },
            ],
          },
          {
            key: 'release-2641-warehouse',
            title: '工程仓端',
            children: prdModules.map(m => ({
              key: `2641-warehouse-${m.id}`,
              title: m.name,
              isLeaf: true,
              module: m,
            })),
          },
          {
            key: 'release-2641-platform',
            title: '平台端',
            children: platformPrdModules.map(m => ({
              key: `2641-platform-${m.id}`,
              title: m.name,
              isLeaf: true,
              module: m,
            })),
          },
          {
            key: 'release-2641-supplier',
            title: '供应商端',
            children: supplierPrdModules.map(m => ({
              key: `2641-supplier-${m.id}`,
              title: m.name,
              isLeaf: true,
              module: m,
            })),
          },
          {
            key: 'release-2641-construction',
            title: '施工方端',
            children: constructionPrdModules.map(m => ({
              key: `2641-construction-${m.id}`,
              title: m.name,
              isLeaf: true,
              module: m,
            })),
          },
          {
            key: 'release-2641-changelog',
            title: '总更新日志',
            isLeaf: true,
            module: changelogModule,
          },
        ],
      },
      {
        key: 'changelog',
        title: '总更新日志',
        isLeaf: true,
        module: changelogModule,
      },
      {
        key: 'crossdept',
        title: '跨部门协同',
        isLeaf: true,
        module: crossDeptModule,
      },
      {
        key: 'warehouse',
        title: '工程仓端',
        children: prdModules.map(m => ({
          key: `warehouse-${m.id}`,
          title: m.name,
          isLeaf: true,
          module: m,
        })),
      },
      {
        key: 'platform',
        title: '平台端',
        children: platformPrdModules.map(m => ({
          key: `platform-${m.id}`,
          title: m.name,
          isLeaf: true,
          module: m,
        })),
      },
      {
        key: 'supplier',
        title: '供应商端',
        children: supplierPrdModules.map(m => ({
          key: `supplier-${m.id}`,
          title: m.name,
          isLeaf: true,
          module: m,
        })),
      },
      {
        key: 'construction',
        title: '施工方端',
        children: constructionPrdModules.map(m => ({
          key: `construction-${m.id}`,
          title: m.name,
          isLeaf: true,
          module: m,
        })),
      },
    ],
  },
  {
    key: 'manual-section',
    title: '系统操作手册',
    children: manualPrdModules.map(m => ({
      key: `manual-${m.id}`,
      title: m.name,
      isLeaf: true,
      module: m,
    })),
  },
  {
    key: 'archive-section',
    title: '历史归档',
    children: [
      {
        key: 'archive-q4',
        title: '2025 Q4 旧版详细设计',
        isLeaf: true,
        module: archivePrdModules[0],
      },
      {
        key: 'archive-q1',
        title: '2026 Q1 PM纯净版备份',
        children: archivePrdModules.slice(2, 6).map(m => ({
          key: `archive-${m.id}`,
          title: m.name.replace(/^▶ /, ''),
          isLeaf: true,
          module: m,
        })),
      },
      {
        key: 'archive-old',
        title: '旧资料归档',
        children: archivePrdModules.slice(7).map(m => ({
          key: `archive-${m.id}`,
          title: m.name.replace(/^▶ /, ''),
          isLeaf: true,
          module: m,
        })),
      },
    ],
  },
]

/** 收集所有叶子节点的模块 */
export function collectAllLeafModules(): PrdModule[] {
  const result: PrdModule[] = []
  function walk(nodes: TreeDocNode[]) {
    for (const node of nodes) {
      if (node.isLeaf && node.module) result.push(node.module)
      if (node.children) walk(node.children)
    }
  }
  walk(prdDocTree)
  return result
}

/** 收集所有节点key */
export function collectAllKeys(nodes: TreeDocNode[] = prdDocTree): string[] {
  const keys: string[] = []
  for (const node of nodes) {
    keys.push(node.key)
    if (node.children) keys.push(...collectAllKeys(node.children))
  }
  return keys
}

/** 查找第一个叶子节点 */
export function findFirstLeaf(nodes?: TreeDocNode[]): TreeDocNode | null {
  if (!nodes) nodes = prdDocTree
  for (const node of nodes) {
    if (node.isLeaf) return node
    if (node.children) {
      const found = findFirstLeaf(node.children)
      if (found) return found
    }
  }
  return null
}

/** 根据模块id查找树节点key */
export function findTreeNodeKey(nodes: TreeDocNode[], moduleId: string): string | null {
  for (const node of nodes) {
    if (node.isLeaf && node.module?.id === moduleId) return node.key
    if (node.children) {
      const found = findTreeNodeKey(node.children, moduleId)
      if (found) return found
    }
  }
  return null
}
