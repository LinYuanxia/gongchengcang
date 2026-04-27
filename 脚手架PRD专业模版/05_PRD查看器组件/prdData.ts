/**
 * PRD模块注册表 — 模版文件
 *
 * 【用途】
 *   定义所有PRD文档的索引元数据，包括：
 *   - 每篇文档的标题、编号、文件路径
 *   - 多端切换的Source定义
 *   - 图标与优先级分组
 *
 * 【在新项目中使用】
 *   1. 将 {basePath} 替换为实际部署的 base URL
 *   2. 删除或注释不需要的端（单系统可直接去掉 sourceOptions 中的多余选项）
 *   3. 修改各模块数组中的描述和信息
 *   4. 按 docs/01_PRD/{端名}/ 下的实际文件更新 prdModules
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

/** 支持的端 — 根据实际项目端数增删 */
export type PrdSource = '端A' | '端B' | '端C' | '端D' | 'project'

// ===== 配置区：替换此常量 =====
const BASE_PATH = '/{basePath}' // 例：'/gongchengcang' 或 '/my-project'

// ===== 两端或单系统：按实际数量增删 =====
export const sourceOptions: { label: string; value: PrdSource }[] = [
  { label: '📌 项目视角', value: 'project' },
  { label: '端A', value: '端A' },
  { label: '端B', value: '端B' },
  // { label: '端C', value: '端C' },
]

// ====================================================================
// 端A — PRD模块列表
// ====================================================================
export const sourceA_Modules: PrdModule[] = [
  {
    id: '00',
    name: '文档总纲',
    docFile: 'prd.md',
    docUrl: `${BASE_PATH}/prd-docs/sourceA/prd.md`,
    icon: 'icon-file',
    priority: '总纲',
    description: '{项目名称}PRD总纲，包含设计原则、术语表、角色权限、功能全景、核心流程图',
  },
  {
    id: '01',
    name: '系统概览与架构',
    docFile: '01-系统概览与架构.md',
    docUrl: `${BASE_PATH}/prd-docs/sourceA/01-系统概览与架构.md`,
    icon: 'icon-apps',
    priority: 'P0',
    description: '{项目名称}系统全景概览，包含设计哲学、技术架构、模块树、角色定义',
  },
  {
    id: '02',
    name: '业务流程设计',
    docFile: '02-业务流程设计.md',
    docUrl: `${BASE_PATH}/prd-docs/sourceA/02-业务流程设计.md`,
    icon: 'icon-file',
    priority: 'P0',
    description: '核心业务流程设计，包含完整状态流转、关键流程说明',
  },
  {
    id: '03',
    name: '领域模型设计',
    docFile: '04-领域模型设计.md',
    docUrl: `${BASE_PATH}/prd-docs/sourceA/04-领域模型设计.md`,
    icon: 'icon-list',
    priority: 'P0',
    description: 'DDD领域驱动设计视角下的核心领域模型',
  },
  // --- 以下按实际模块数增删，编号连续 ---
  // {
  //   id: '05',
  //   name: '{模块名称}',
  //   docFile: '05-{模块名称}功能设计.md',
  //   docUrl: `${BASE_PATH}/prd-docs/sourceA/05-{模块名称}功能设计.md`,
  //   icon: 'icon-home',
  //   priority: 'P0',
  //   description: '{模块简要描述}',
  // },
  // { id: '06', name: '...', ... },
]

// ====================================================================
// 端B — PRD模块列表（拷贝自↑，修改路径即可）
// ====================================================================
export const sourceB_Modules: PrdModule[] = [
  // ... 同上模式，路径改为 sourceB
]

// ====================================================================
// 项目视角 — 跨端总览文档
// ====================================================================
export const projectPrdModules: PrdModule[] = [
  {
    id: '00',
    name: '项目总览',
    docFile: '项目总览.md',
    docUrl: `${BASE_PATH}/prd-docs/项目总览.md`,
    icon: 'icon-home',
    priority: '总纲',
    description: '{项目名称}全景总览，一句话定位、各端角色分工、核心概念、功能规模统计',
  },
  {
    id: '01',
    name: '系统功能说明书',
    docFile: '系统功能说明书.md',
    docUrl: `${BASE_PATH}/prd-docs/系统功能说明书.md`,
    icon: 'icon-list',
    priority: 'P0',
    description: '各端系统详细功能说明，按模块列出所有功能点和操作说明',
  },
  {
    id: '02',
    name: '版本迭代记录',
    docFile: '版本迭代记录.md',
    docUrl: `${BASE_PATH}/prd-docs/版本迭代记录.md`,
    icon: 'icon-file',
    priority: 'P0',
    description: '产品发布版本历史记录，按版本号倒序排列',
  },
]

// ====================================================================
// 图标映射 — 扩展时在此添加
// ====================================================================
export const iconMap: Record<string, string> = {
  'icon-home': '🏠',
  'icon-shop': '🛒',
  'icon-apps': '📦',
  'icon-file': '📄',
  'icon-storage': '🏭',
  'icon-money-collect': '💰',
  'icon-settings': '⚙️',
  'icon-list': '📋',
}

/** 获取图标表情 */
export function getIcon(iconName: string): string {
  return iconMap[iconName] || '📋'
}
