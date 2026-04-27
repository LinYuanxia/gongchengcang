/**
 * PM纯净版PRD文档批量转换脚本
 * 
 * 对四端所有 功能设计.md 文件执行：
 * 1. PRD六层模型 comment → PM纯净版
 * 2. 字段定义表：移除"类型"列
 * 3. 异常处理汇总表：合并"前端处理"+"后端处理" → "处理方式"
 * 4. "接口依赖建议" → "接口需求说明"；移除API路径
 * 5. 安全要求：移除"实现方式"列
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = '/Users/mcdreamy/Documents/trae_projects/gongchengcang2/docs/PRD'
const SYSTEMS = ['工程仓端', '平台端', '供应商端', '施工方端']

// PM纯净版 comment block
const PM_COMMENT = `<!-- ============================================================ -->
<!-- PRD六层模型（PM纯净版）：                                         -->
<!--                                                              -->
<!-- 核心层(必写)： 功能概述 → 设计原则 → 业务规则(含流程图) → 功能点详情   -->
<!-- 扩展层(推荐)： 权限矩阵 → 非功能性需求 → 异常汇总 → 接口需求       -->
<!-- 治理层(状态模块必写)： 状态流转图 → 状态治理矩阵 → 版本历史       -->
<!--                                                              -->
<!-- 使用说明：                                                      -->
<!-- 本模板已移除技术侧细节（字段类型、API路径、HTTP状态码等），          -->
<!-- PM只需聚焦业务层定义，技术实现由开发阶段补充。                      -->
<!-- ============================================================ -->`

// Old PRD六层模型 comment (multi-line, flexible whitespace)
const OLD_COMMENT_PATTERN = /<!-- =+\s*\n<!-- PRD六层模型.*?核心层.*?扩展层.*?治理层.*?-->\s*\n<!-- =+\s*-->/s

/** Remove "类型" column from field definition tables */
function purifyFieldTable(content) {
  // Pattern 1: Standard table header with 类型 column
  // | 字段 | 类型 | 必填 | 来源 | ...
  // | 字段 | 类型 | 必填 | 来源 | 校验规则 | 展示规则 | 默认值 |
  // | 字段 | 类型 | 必填 | 来源 | 校验规则 | 展示规则 |
  // | 字段 | 类型 | 必填 | 来源 | 展示规则 |
  
  // Find field table headers (those that have "字段" in first col and "类型" in second)
  // Remove the "类型" column from header and separator lines
  content = content.replace(
    /^(\| 字段 )\| 类型 (\|.*)$/gm,
    '$1$2'
  )
  content = content.replace(
    /^(\|:----)\|:---+(:\|.*)$/gm,
    '$1$2'
  )
  
  // Remove "类型" values from data rows in field tables
  // Look for patterns like: | something | String(100) | 是 | ...
  // The 类型 column comes right after the field name, before 必填
  content = content.replace(
    /^(\| [^|]+ )\| (?:String(?:\(\d+\))?|Decimal\(\d+(?:,\d+)?\)|Integer|Enum(?:\([^)]*\))?|URL|ID|Date(?:Time)?|Text|File|ID\[\]|String\[\]|Boolean|Float|BigInt|TinyInt|JSON|Array) \|/gm,
    '$1|'
  )
  
  // Also handle edge cases with double spaces
  content = content.replace(
    /^(\| [^|]+ )\|  (?:String|Decimal|Integer|Enum|URL|ID|Date|Text|File|Boolean) \|/gm,
    '$1|'
  )
  
  return content
}

/** Merge 前端处理+后端处理 into 处理方式 in 异常处理汇总表 */
function purifyExceptionTable(content) {
  // Old: | 异常场景 | 触发条件 | 前端处理 | 后端处理 | 提示文案 |
  // New: | 异常场景 | 触发条件 | 处理方式 | 提示文案 |
  content = content.replace(
    /^\| 异常场景 \| 触发条件 \| 前端处理 \| 后端处理 \| 提示文案 \|$/gm,
    '| 异常场景 | 触发条件 | 处理方式 | 提示文案 |'
  )
  content = content.replace(
    /^\|:---+\|:---+\|:---+\|:---+\|:---+$/gm,
    '|:--------|:--------|:--------|---------|'
  )
  // Also handle the alternative separator format
  content = content.replace(
    /^\|:--------\|:--------\|:--------\|:--------\|:---------$/gm,
    '|:--------|:--------|:--------|---------|'
  )
  
  return content
}

/** Update 安全要求: remove 实现方式 column */
function purifySecurityTable(content) {
  // Old: | 风险点 | 防护措施 | 实现方式 |
  // New: | 风险点 | 预期防护策略 |
  content = content.replace(
    /^\| 风险点 \| 防护措施 \| 实现方式 \|$/gm,
    '| 风险点 | 预期防护策略 |'
  )
  content = content.replace(
    /^\|:---+\|:---+\|:---+$/gm,
    '|:------|:-----------|'
  )
  
  return content
}

/** Update 接口依赖建议 → 接口需求说明, clean table */
function purifyInterfaceSection(content) {
  // Change title
  content = content.replace(
    /^## 八、接口依赖建议$/gm,
    '## 八、接口需求说明'
  )
  
  // Change table header
  content = content.replace(
    /^\| 接口 \| 用途 \| 核心字段\/逻辑 \| 性能要求 \|$/gm,
    '| 接口用途 | 核心能力要求 |'
  )
  content = content.replace(
    /^\|:---+\|:---+\|:---+\|:---+$/gm,
    '|:--------|:-----------|'
  )
  
  // Remove API path (first column with `/api/`) and merge with 用途
  content = content.replace(
    /^\| `\/api\/[^`]+` \| ([^|]+) \| [^|]+ \| [^|]+ \|$/gm,
    '| $1 | $1 |'
  )
  content = content.replace(
    /^\| `\/api\/[^`]+` \| ([^|]+) \| [^|]+ \|$/gm,
    '| $1 | $1 |'
  )
  
  return content
}

/** Remove old comment block (if present) */
function replaceComment(content) {
  // Check if old comment exists
  if (OLD_COMMENT_PATTERN.test(content)) {
    content = content.replace(OLD_COMMENT_PATTERN, PM_COMMENT)
  }
  return content
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8')
  const original = content
  
  content = replaceComment(content)
  content = purifyFieldTable(content)
  content = purifyExceptionTable(content)
  content = purifySecurityTable(content)
  content = purifyInterfaceSection(content)
  
  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8')
    return true
  }
  return false
}

// Main
let totalChanged = 0
let totalScanned = 0

for (const system of SYSTEMS) {
  const dir = join(ROOT, system)
  if (!existsSync(dir)) {
    console.log(`[SKIP] ${system} - directory not found`)
    continue
  }
  
  const files = readdirSync(dir).filter(f => f.endsWith('.md'))
  for (const file of files) {
    const filePath = join(dir, file)
    totalScanned++
    const changed = processFile(filePath)
    if (changed) {
      console.log(`[OK] ${system}/${file}`)
      totalChanged++
    }
  }
}

console.log(`\n✅ Done! Scanned: ${totalScanned}, Changed: ${totalChanged}`)
