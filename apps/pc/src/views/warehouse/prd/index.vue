/**
 * PRD查看器主页面
 * 
 * 左侧：模块导航树（按优先级分组）
 * 右侧：从 public/prd-docs/ 加载MD文件并完整渲染
 */
<template>
  <div class="prd-viewer">
    <!-- 左侧导航 -->
    <div class="prd-sidebar">
      <!-- 移除端切换下拉，改用树形导航 -->

      <!-- 标题 -->
      <div class="sidebar-header">
        <h3>📋 目录</h3>
        <span class="module-count">{{ totalModules }} 个文档</span>
      </div>

      <!-- 搜索栏 -->
      <div class="sidebar-search">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="search-input"
          placeholder="🔍 搜索文档内容..."
          @input="onSearchInput"
        />
        <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
        <span v-if="isSearching" class="search-spin">⏳</span>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchQuery" class="search-results">
        <div v-if="isSearching" class="search-status">
          <span class="search-spin-inline">⏳</span> 搜索中...
        </div>
        <div v-else-if="searchResults.length === 0" class="search-status">
          <div class="search-empty-icon">🔍</div>
          <div>未找到匹配内容</div>
          <div class="search-empty-hint">试试其他关键词</div>
        </div>
        <template v-else>
          <div class="search-stats">共 {{ searchResults.length }} 处匹配</div>
          <div
            v-for="r in searchResults"
            :key="`${r.docId}-${r.headingId}`"
            class="search-result-item"
            @click="selectSearchResult(r)"
          >
            <div class="result-header">
              <span class="result-doc-name">{{ r.docName }}</span>
              <span class="result-sep">›</span>
              <span class="result-heading">{{ r.heading }}</span>
            </div>
            <div class="result-context" v-html="r.contextHtml"></div>
          </div>
        </template>
      </div>

      <!-- 树形导航（按 docs/ 目录层级） -->
      <template v-else>
        <a-tree
          :data="prdDocTree"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          @select="onTreeSelect"
          @expand="onTreeExpand"
        >
          <template #title="nodeData">
            <span
              class="tree-node-title"
              @click.stop="toggleTreeNode(nodeData)"
            >
              <span class="tree-node-icon">{{ getTreeNodeIcon(nodeData) }}</span>
              {{ nodeData.title }}
            </span>
          </template>
        </a-tree>
      </template>
    </div>

    <!-- 右侧内容区（文档 + 目录） -->
    <div class="prd-content">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <a-spin />
        <p>加载文档中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!activeModule" class="empty-state">
        <div class="empty-icon">📖</div>
        <h3>选择一个模块查看PRD</h3>
        <p>请从左侧导航中选择一个模块查看详细的产品需求文档</p>
      </div>

      <!-- 模块详情 + 目录 -->
      <template v-else>
        <!-- 滚动文档区 -->
        <div class="prd-content-scroll" ref="scrollRef">
          <div class="content-area">
            <!-- 模块头部 -->
            <div class="content-header">
              <div class="header-top">
                <h2>{{ getIcon(activeModule.icon) }} {{ activeModule.name }}</h2>
                <div class="header-tags">
                  <a-tag color="arcoblue">{{ activeModule.docFile }}</a-tag>
                  <a-button
                    size="small"
                    @click="showYuqueModal = true"
                    style="margin-left: 8px"
                  >🐦 同步到语雀</a-button>
                  <a-button
                    v-if="!editMode"
                    type="primary"
                    size="small"
                    @click="enterEditMode"
                    style="margin-left: 8px"
                  >✏️ 编辑文档</a-button>
                  <template v-else>
                    <a-button
                      size="small"
                      @click="exitEditMode"
                      style="margin-left: 8px"
                    >取消</a-button>
                    <a-button
                      type="primary"
                      size="small"
                      :loading="saving"
                      @click="saveDocument"
                      style="margin-left: 8px"
                    >💾 保存</a-button>
                  </template>
                </div>
              </div>
              <p class="header-desc">{{ activeModule.description }}</p>
            </div>

            <a-divider />

            <!-- 文档内容（错误） -->
            <a-alert v-if="loadError" type="error">
              <template #content>
                <div>加载文档失败：{{ loadError }}</div>
              </template>
            </a-alert>

            <!-- 编辑模式 -->
            <div v-if="editMode && !loadError" class="prd-editor">
              <textarea
                v-model="editContent"
                class="editor-textarea"
                placeholder="在此编辑Markdown内容..."
                spellcheck="false"
              ></textarea>
            </div>

            <!-- 预览模式（渲染后） -->
            <div v-if="!editMode && !loadError" class="prd-document" ref="docRef" @click="handleDocClick">
              <div class="markdown-body" v-html="renderedHtml"></div>
            </div>
          </div>
        </div>

        <!-- 右侧目录索引 -->
        <div class="prd-toc" v-if="tocItems.length">
          <div class="toc-header">📑 目录</div>
          <div class="toc-list">
            <div
              v-for="item in tocItems"
              :key="item.id"
              class="toc-item"
              :class="{ active: activeTocId === item.id, [`level-${item.level}`]: true }"
              @click="scrollToHeading(item.id)"
            >{{ item.text }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Mermaid图表放大弹窗 -->
  <a-modal
    v-model:visible="mermaidModalVisible"
    title="📊 图表放大查看"
    :width="800"
    :footer="false"
    :mask-closable="true"
    :modal-style="{ maxWidth: '90vw' }"
    @open="renderMermaidInModal"
  >
    <div id="mermaid-modal-container" class="mermaid-modal-container">
      <div class="modal-loading">⏳ 渲染图表中...</div>
    </div>
  </a-modal>

  <!-- 同步到语雀弹窗 -->
  <a-modal
    v-model:visible="showYuqueModal"
    title="🐦 同步PRD文档到语雀"
    :width="600"
    @ok="startYuqueSync"
    :ok-loading="yuqueSyncing"
    ok-text="开始同步"
    cancel-text="取消"
  >
    <div class="yuque-config">
      <a-form layout="vertical">
        <a-form-item label="同步模式">
          <a-radio-group v-model="yuqueConfig.syncMode">
            <a-radio value="current">📄 仅同步当前文档</a-radio>
            <a-radio value="all">🌲 同步全部（按目录结构创建分组）</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="语雀 Token">
          <a-input
            v-model="yuqueConfig.token"
            placeholder="请输入语雀个人访问令牌"
            type="password"
          />
          <div class="form-tip">
            💡 获取方式：<a href="https://www.yuque.com/settings/tokens" target="_blank">语雀设置 → 个人Token</a>，勾选 doc.write 权限
          </div>
        </a-form-item>

        <a-form-item label="知识库 ID">
          <a-input
            v-model="yuqueConfig.repoId"
            placeholder="例如：linyuanxia/gongchengcang-prd"
          />
          <div class="form-tip">
            💡 知识库 URL：https://www.yuque.com/用户名/知识库ID
          </div>
        </a-form-item>

        <a-form-item label="父目录 UUID（可选）">
          <a-input
            v-model="yuqueConfig.parentUuid"
            placeholder="例如：ZzzzXxYy"
          />
          <div class="form-tip">
            💡 点击语雀目录看地址栏：https://www.yuque.com/xxx/xxx/<b>这串就是UUID</b>
          </div>
        </a-form-item>
      </a-form>

      <!-- 同步进度 -->
      <div v-if="yuqueSyncing" class="sync-progress">
        <a-progress :percent="yuqueProgress" />
        <div class="progress-text">
          正在同步：{{ yuqueCurrentFile }} ({{ yuqueSyncedCount }}/{{ yuqueTotalCount }})
        </div>
      </div>

      <!-- 同步结果 -->
      <div v-if="yuqueSyncResult.length" class="sync-result">
        <h4>同步结果：</h4>
        <div
          v-for="(item, idx) in yuqueSyncResult"
          :key="idx"
          class="result-item"
        >
          <span class="status">{{ item.status === 'success' ? '✅' : '❌' }}</span>
          <span class="title">{{ item.title }}</span>
          <a v-if="item.url" :href="item.url" target="_blank" class="link">查看</a>
        </div>
      </div>
    </div>
  </a-modal>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import mermaid from 'mermaid'
import { Message } from '@arco-design/web-vue'
import { prdDocTree, collectAllLeafModules, collectAllKeys, findFirstLeaf, findTreeNodeKey } from '@/components/PrdPanel/prdData'
import type { PrdModule, TreeDocNode } from '@/components/PrdPanel/prdData'

// ------ 全局Mermaid渲染计数器（避免ID冲突）-----
let mermaidRenderCounter = 0

// ------ 初始化 Mermaid ------
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#165DFF',
    primaryBorderColor: '#165DFF',
    lineColor: '#4E5969',
    secondaryColor: '#F2F3F5',
    tertiaryColor: '#E8F1FF',
  },
})

// ------ 状态 ------
const route = useRoute()
const router = useRouter()
const activeModule = ref<PrdModule | null>(null)
const selectedKeys = ref<string[]>([])
const allKeys = ref<string[]>(collectAllKeys())
const expandedKeys = ref<string[]>(collectAllKeys())
const loading = ref(false)
const loadError = ref('')
const renderedHtml = ref('')
const rawMarkdown = ref('')
const editMode = ref(false)
const saving = ref(false)
const editContent = ref('')

// ------ 语雀同步 ------
const showYuqueModal = ref(false)
const yuqueSyncing = ref(false)
const yuqueProgress = ref(0)
const yuqueCurrentFile = ref('准备中...')
const yuqueSyncedCount = ref(0)
const yuqueTotalCount = ref(0)
const yuqueSyncResult = ref<{ title: string; status: 'success' | 'fail'; url?: string }[]>([])
const yuqueConfig = ref({
  token: localStorage.getItem('yuque_token') || '',
  repoId: localStorage.getItem('yuque_repoId') || '',
  parentUuid: localStorage.getItem('yuque_parentUuid') || '',
  syncMode: 'all' as 'current' | 'all',
})
const docRef = ref<HTMLElement | null>(null)

// ------ 目录索引(TOC) ------
interface TocItem {
  id: string
  text: string
  level: number
}
const tocItems = ref<TocItem[]>([])
const activeTocId = ref('')
const scrollRef = ref<HTMLElement | null>(null)
let tocObserver: IntersectionObserver | null = null

// ------ Mermaid弹窗状态 ------
const mermaidModalVisible = ref(false)
const currentMermaidDef = ref('')

// ------ 全文搜索 ------
interface SearchResult {
  docId: string
  docName: string
  heading: string
  headingId: string
  contextHtml: string
}

const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const searchCache = ref<Record<string, string>>({}) // docUrl → mdContent
let searchTimer: ReturnType<typeof setTimeout> | null = null
const searchInputRef = ref<HTMLInputElement | null>(null)

// ------ Markdown 配置 ------
const markedOptions = {
  gfm: true,
  breaks: true,
}

/** 从标题文本生成URL安全ID */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** 自定义heading renderer：生成带id的标题标签 */
function createHeadingRenderer() {
  const renderer = new marked.Renderer()
  // marked@18 heading renderer uses token-based API
  renderer.heading = function (arg: any) {
    const level = arg.depth || 1
    // 提取标题纯文本（从inline token数组取raw文本）
    const text = (arg.tokens || [])
      .map((t: any) => t.raw || t.text || '')
      .join('')
    const id = slugifyHeading(text)
    return `<h${level} id="${id}">${text}</h${level}>`
  }
  return renderer
}

marked.setOptions({
  ...markedOptions,
  renderer: createHeadingRenderer(),
})

// ------ 文档总数 ------
const totalModules = computed(() => collectAllLeafModules().length)

// ------ 树形导航：图标映射 ------
const sectionIconMap: Record<string, string> = {
  'project-section': '📌',
  'prd-section': '📋',
  'manual-section': '📖',
  'archive-section': '📦',
}

function getTreeNodeIcon(node: TreeDocNode): string {
  if (!node.isLeaf) {
    return sectionIconMap[node.key] || '📁'
  }
  return getIcon(node.icon || 'icon-file')
}

// ------ 树形导航：选中处理 ------
function onTreeSelect(keys: (string | number)[], data: { node: TreeDocNode }) {
  const node = data.node
  if (node.isLeaf && node.module) {
    selectedKeys.value = [node.key]
    selectModule(node.module)
  }
}

// ------ 树形目录展开/收起交互 ------
function onTreeExpand(keys: (string | number)[]) {
  expandedKeys.value = keys as string[]
}

/** 点击节点标题也能切换展开/收起（有子节点的才切换，叶子节点正常选文档） */
function toggleTreeNode(node: TreeDocNode) {
  if (node.isLeaf || !node.children) {
    // 叶子节点正常选文档
    if (node.module) {
      selectedKeys.value = [node.key]
      selectModule(node.module)
    }
    return
  }
  // 有子节点的节点：切换展开收起
  const key = node.key
  const idx = expandedKeys.value.indexOf(key)
  if (idx > -1) {
    expandedKeys.value.splice(idx, 1)
  } else {
    expandedKeys.value.push(key)
  }
  expandedKeys.value = [...expandedKeys.value]
}

// ------ 语雀同步功能 ------
interface SyncItem {
  type: 'folder' | 'doc'
  title: string
  depth: number
  module?: PrdModule
}

/** 递归遍历目录树，生成待同步列表（文件夹 + 文档） */
function collectSyncItems(nodes: TreeDocNode[], depth = 0): SyncItem[] {
  const items: SyncItem[] = []
  for (const node of nodes) {
    if (node.isLeaf && node.module) {
      items.push({ type: 'doc', title: node.title, depth, module: node.module })
    } else if (node.children && node.children.length) {
      items.push({ type: 'folder', title: node.title, depth })
      items.push(...collectSyncItems(node.children, depth + 1))
    }
  }
  return items
}

async function startYuqueSync() {
  if (!yuqueConfig.value.token || !yuqueConfig.value.repoId) {
    Message.warning('请填写语雀 Token 和知识库 ID')
    return
  }

  // 保存配置
  localStorage.setItem('yuque_token', yuqueConfig.value.token)
  localStorage.setItem('yuque_repoId', yuqueConfig.value.repoId)
  localStorage.setItem('yuque_parentUuid', yuqueConfig.value.parentUuid)

  yuqueSyncResult.value = []
  yuqueSyncedCount.value = 0
  yuqueSyncing.value = true

  let syncItems: SyncItem[] = []

  if (yuqueConfig.value.syncMode === 'current' && activeModule.value) {
    // 仅同步当前文档
    syncItems = [{
      type: 'doc',
      title: activeModule.value.name,
      depth: 0,
      module: activeModule.value,
    }]
  } else {
    // 按目录结构全部同步（先建文件夹，再建文档）
    syncItems = collectSyncItems(prdDocTree)
  }

  yuqueTotalCount.value = syncItems.filter(i => i.type === 'doc').length

  // 逐个同步
  for (let i = 0; i < syncItems.length; i++) {
    const item = syncItems[i]
    yuqueCurrentFile.value = `${item.type === 'folder' ? '📁' : '📄'} ${item.title}`
    yuqueProgress.value = Math.round(((i + 1) / syncItems.length) * 100)

    if (item.type === 'folder') {
      // 文件夹：在结果里记录（语雀没有专门的文件夹API，靠人工后续整理）
      yuqueSyncResult.value.push({
        title: `[目录] ${item.title}`,
        status: 'success',
      })
      continue
    }

    // 文档：正常上传
    try {
      const mod = item.module!
      const res = await fetch(mod.docUrl)
      const content = await res.text()

      // 调用语雀API创建文档
      const apiRes = await fetch(`/api/yuque/repos/${yuqueConfig.value.repoId}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': yuqueConfig.value.token,
        },
        body: JSON.stringify({
          title: mod.name,
          body: content,
          format: 'markdown',
          parent_uuid: yuqueConfig.value.parentUuid || undefined,
        }),
      })

      const result = await apiRes.json()

      if (apiRes.ok && result.data) {
        yuqueSyncResult.value.push({
          title: mod.name,
          status: 'success',
          url: `https://www.yuque.com/${yuqueConfig.value.repoId}/${result.data.slug}`,
        })
        yuqueSyncedCount.value++
      } else {
        throw new Error(result.message || result.errors?.[0]?.message || 'API调用失败')
      }
    } catch (e) {
      yuqueSyncResult.value.push({
        title: item.title,
        status: 'fail',
      })
    }

    await new Promise(r => setTimeout(r, 600)) // 语雀API限速
  }

  yuqueSyncing.value = false
  Message.success(`同步完成！成功上传 ${yuqueSyncedCount.value} 个文档，请在语雀中手动整理目录结构`)
}

// ------ PRD在线编辑功能 ------
function enterEditMode() {
  editContent.value = rawMarkdown.value
  editMode.value = true
}

function exitEditMode() {
  editMode.value = false
  editContent.value = ''
}

async function saveDocument() {
  if (!activeModule.value) return

  saving.value = true
  try {
    const res = await fetch('/api/save-prd-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: activeModule.value.docFile,
        content: editContent.value,
      }),
    })

    const result = await res.json()
    if (!result.success) throw new Error(result.message)

    // 保存成功：退出编辑模式，重新加载文档
    editMode.value = false
    rawMarkdown.value = editContent.value
    editContent.value = ''
    await loadAndRenderModule(activeModule.value)

    Message.success('✅ 保存成功！已自动提交到Git')
  } catch (e) {
    Message.error(`❌ 保存失败：${String(e)}`)
  } finally {
    saving.value = false
  }
}

// ------ 图标映射 ------
const iconMap: Record<string, string> = {
  'icon-home': '🏠',
  'icon-shop': '🛒',
  'icon-apps': '📦',
  'icon-file': '📄',
  'icon-storage': '🏭',
  'icon-money-collect': '💰',
  'icon-settings': '⚙️',
  'icon-list': '📋',
}

function getIcon(iconName: string): string {
  return iconMap[iconName] || '📋'
}

// ------ HTML属性转义 ------
function escapeHtmlForAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ------ Mermaid弹窗交互 ------
function handleDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const trigger = target.closest('.mermaid-zoom-trigger')
  if (trigger) {
    const def = trigger.getAttribute('data-def')
    if (def) {
      currentMermaidDef.value = def
      mermaidModalVisible.value = true
    }
  }
}

async function renderMermaidInModal() {
  const container = document.getElementById('mermaid-modal-container')
  if (!container || !currentMermaidDef.value) return

  container.innerHTML = '<div class="modal-loading">⏳ 渲染图表中...</div>'

  const modalId = `mermaid-modal-${++mermaidRenderCounter}`
  try {
    await mermaid.parse(currentMermaidDef.value)
    const { svg, bindFunctions } = await mermaid.render(modalId, currentMermaidDef.value)
    container.innerHTML = svg
    bindFunctions?.(container)
  } catch (err) {
    console.warn('弹窗Mermaid渲染失败:', err)
    container.innerHTML = `<pre class="mermaid-fallback">${escapeHtmlForAttr(currentMermaidDef.value)}</pre>
      <div class="mermaid-error">⚠️ 图表语法有误，显示原始代码</div>`
  }
}

// ------ 加载并渲染MD文件 ------
/**
 * 解析MD内容，分离出 Mermaid 代码块和普通 Markdown
 * 返回一个标记了类型的片段数组，方便分步渲染
 */
function parseMarkdownWithMermaid(md: string): { type: 'markdown' | 'mermaid'; content: string; index: number }[] {
  const parts: { type: 'markdown' | 'mermaid'; content: string; index: number }[] = []
  // 正则匹配 ```mermaid ... ``` 代码块
  const mermaidPattern = /```mermaid\s*\n([\s\S]*?)```/g
  let lastIndex = 0
  let mermaidIdx = 0
  let match: RegExpExecArray | null

  while ((match = mermaidPattern.exec(md)) !== null) {
    // 匹配前的普通Markdown
    if (match.index > lastIndex) {
      parts.push({
        type: 'markdown',
        content: md.slice(lastIndex, match.index),
        index: -1,
      })
    }
    // Mermaid块
    parts.push({
      type: 'mermaid',
      content: match[1].trim(),
      index: mermaidIdx++,
    })
    lastIndex = match.index + match[0].length
  }
  // 剩余部分
  if (lastIndex < md.length) {
    parts.push({
      type: 'markdown',
      content: md.slice(lastIndex),
      index: -1,
    })
  }
  // 如果没有mermaid块，直接全部返回
  if (parts.length === 0) {
    parts.push({ type: 'markdown', content: md, index: -1 })
  }
  return parts
}

async function loadAndRenderModule(mod: PrdModule) {
  loading.value = true
  loadError.value = ''
  renderedHtml.value = ''

  try {
    // 1. 加载MD文件
    const response = await fetch(mod.docUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}: 文件${mod.docFile}加载失败`)
    const mdContent = await response.text()
    rawMarkdown.value = mdContent

    // 2. 解析MD中的mermaid块
    const parts = parseMarkdownWithMermaid(mdContent)

    // 3. 分步渲染
    let html = ''
    const mermaidDefs: { id: string; definition: string }[] = []

    for (const part of parts) {
      if (part.type === 'markdown') {
        html += marked.parse(part.content) as string
      } else {
        // mermaid块 → 带放大按钮的占位符
        const id = `md-${++mermaidRenderCounter}`
        const escapedDef = escapeHtmlForAttr(part.content)
        mermaidDefs.push({ id, definition: part.content })
        html += `<div class="mermaid-wrapper" id="${id}">
          <div class="mermaid-chart-area">
            <div class="mermaid-loading">⏳ 渲染图表中...</div>
          </div>
          <div class="mermaid-zoom-bar">
            <a class="mermaid-zoom-trigger" data-def="${escapedDef}">🔍 放大查看</a>
          </div>
        </div>`
      }
    }

    // 4. 设置HTML
    renderedHtml.value = html

    // 5. 逐个渲染Mermaid（此时文档内容已渲染到DOM，但container被v-if隐藏）
    for (const def of mermaidDefs) {
      try {
        // 尝试解析：无效则catch抛出
        await mermaid.parse(def.definition)

        // 小延迟避免渲染冲突
        await new Promise(r => setTimeout(r, 30))

        const { svg, bindFunctions } = await mermaid.render(def.id, def.definition)
        const wrapper = document.getElementById(def.id)
        if (wrapper) {
          const chartArea = wrapper.querySelector('.mermaid-chart-area')
          if (chartArea) {
            chartArea.innerHTML = svg
            bindFunctions?.(chartArea)
          }
        }
      } catch (err) {
        console.warn('Mermaid渲染失败:', err, '定义:', def.definition.slice(0, 80))
        const wrapper = document.getElementById(def.id)
        if (wrapper) {
          const chartArea = wrapper.querySelector('.mermaid-chart-area')
          if (chartArea) {
            chartArea.innerHTML = `<div class="mermaid-failed-placeholder">
              <div class="mermaid-error-icon">📊</div>
              <div class="mermaid-error-text">图表渲染失败</div>
            </div>`
          }
        }
      }
    }
  } catch (err: any) {
    loadError.value = err.message || String(err)
  } finally {
    // 6. loading=false → 文档内容才真正出现在DOM中
    loading.value = false
  }

  // 7. 等DOM更新后构建TOC（必须在loading=false之后）
  await nextTick()
  buildToc()
  setupTocObserver()
}

// ------ TOC：构建目录索引 ------
function buildToc() {
  const container = docRef.value
  if (!container) {
    tocItems.value = []
    return
  }
  const headings = container.querySelectorAll('h1, h2, h3, h4')
  const items: TocItem[] = []
  headings.forEach(h => {
    if (!h.id) return
    const level = parseInt(h.tagName.substring(1), 10)
    items.push({ id: h.id, text: (h.textContent || '').trim(), level })
  })
  tocItems.value = items
}

// ------ TOC：IntersectionObserver监听当前标题 ------
function setupTocObserver() {
  tocObserver?.disconnect()
  const container = docRef.value
  if (!container) return

  const headings = container.querySelectorAll('h1, h2, h3, h4')
  if (!headings.length) return

  const observerOptions = {
    root: scrollRef.value,
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0,
  }

  tocObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activeTocId.value = entry.target.id
        break
      }
    }
  }, observerOptions)

  headings.forEach(h => tocObserver?.observe(h))
}

// ------ TOC：点击跳转 ------
function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeTocId.value = id
  }
}

// ------ 全文搜索 ------

/** 转义正则特殊字符 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 获取MD内容（缓存） */
async function getMdContent(mod: PrdModule): Promise<string> {
  if (searchCache.value[mod.docUrl]) return searchCache.value[mod.docUrl]
  const res = await fetch(mod.docUrl)
  if (!res.ok) return ''
  const text = await res.text()
  searchCache.value[mod.docUrl] = text
  return text
}

/** 在MD文件中搜索关键词，返回匹配段落 */
function searchInMd(mod: PrdModule, mdContent: string, keyword: string): SearchResult[] {
  const results: SearchResult[] = []
  const lowerKw = keyword.toLowerCase()
  const lines = mdContent.split('\n')

  let curHeading = '文档开头'
  let curHeadingId = '文档开头'
  let sectionLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headingMatch) {
      // 检查上一个段落
      if (sectionLines.length > 0) {
        const sectionText = sectionLines.join('\n')
        if (sectionText.toLowerCase().includes(lowerKw)) {
          results.push(makeResult(mod, curHeading, curHeadingId, sectionLines, keyword, lowerKw))
        }
      }
      curHeading = headingMatch[2]
      curHeadingId = slugifyHeading(curHeading)
      sectionLines = [line]
    } else {
      sectionLines.push(line)
    }
  }
  // 最后一个段落
  if (sectionLines.length > 0) {
    const sectionText = sectionLines.join('\n')
    if (sectionText.toLowerCase().includes(lowerKw)) {
      results.push(makeResult(mod, curHeading, curHeadingId, sectionLines, keyword, lowerKw))
    }
  }

  return results
}

/** 构建单一搜索结果，带高亮上下文 */
function makeResult(mod: PrdModule, heading: string, headingId: string, lines: string[], keyword: string, lowerKw: string): SearchResult {
  const matchedIdx = lines.findIndex(l => l.toLowerCase().includes(lowerKw))
  const start = Math.max(0, matchedIdx - 1)
  const end = Math.min(lines.length, matchedIdx + 3)
  const ctxLines = lines.slice(start, end)

  const contextHtml = ctxLines
    .map(l => l.replace(/^#{1,4}\s+/, '').trim())
    .filter(l => l)
    .map(l => {
      const escaped = l.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return escaped.replace(new RegExp(`(${escapeRegex(keyword)})`, 'gi'), '<mark>$1</mark>')
    })
    .join('<br/>')

  return { docId: mod.id, docName: mod.name, heading, headingId, contextHtml }
}

/** 搜索输入处理（防抖） */
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  const q = searchQuery.value.trim()
  if (!q) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  searchTimer = setTimeout(() => performSearch(q), 300)
}

/** 执行全文搜索 */
async function performSearch(keyword: string) {
  isSearching.value = true
  try {
    const allResults: SearchResult[] = []
    const allModules = collectAllLeafModules()
    for (const mod of allModules) {
      const content = await getMdContent(mod)
      if (!content) continue
      const res = searchInMd(mod, content, keyword)
      allResults.push(...res)
    }
    // 按文档分组排序
    allResults.sort((a, b) => {
      if (a.docId !== b.docId) return Number(a.docId) - Number(b.docId)
      return 0
    })
    searchResults.value = allResults
  } catch (e) {
    console.warn('搜索出错:', e)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

/** 清空搜索 */
function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
}

/** 聚焦搜索框 */
function focusSearch() {
  searchInputRef.value?.focus()
}

// ------ 模块选择 ------
async function selectModule(mod: PrdModule) {
  activeModule.value = mod
  router.replace({ query: { module: mod.id } })
  tocItems.value = []
  activeTocId.value = ''
  exitEditMode()
  await loadAndRenderModule(mod)
}

/** 选择搜索结果 → 跳转到文档 */
async function selectSearchResult(r: SearchResult) {
  clearSearch()
  const allModules = collectAllLeafModules()
  const mod = allModules.find(m => m.id === r.docId)
  if (!mod) return

  if (activeModule.value?.id !== r.docId) {
    await selectModule(mod)
  }

  await nextTick()
  const el = document.getElementById(r.headingId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeTocId.value = r.headingId
  }
}



// ------ 初始化恢复 ------
onMounted(async () => {
  const moduleId = route.query.module as string
  const allModules = collectAllLeafModules()
  let target = moduleId ? allModules.find(m => m.id === moduleId) : null
  if (!target) {
    const firstLeaf = findFirstLeaf()
    target = firstLeaf?.module || null
  }
  if (target) {
    activeModule.value = target
    const foundKey = findTreeNodeKey(prdDocTree, target.id)
    if (foundKey) selectedKeys.value = [foundKey]
    await loadAndRenderModule(target)
  }

  // 键盘快捷键: Ctrl/Cmd+K 聚焦搜索
  window.addEventListener('keydown', onSearchKeydown)
})

function onSearchKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    focusSearch()
  }
}

// ------ 生命周期清理 ------
onUnmounted(() => {
  tocObserver?.disconnect()
  tocObserver = null
  window.removeEventListener('keydown', onSearchKeydown)
  if (searchTimer) clearTimeout(searchTimer)
})

</script>

<style scoped lang="less">
.prd-viewer {
  display: flex;
  height: 100vh;
  background: var(--color-bg-1);
  overflow: hidden;
}

// ====== 左侧导航 ======
.prd-sidebar {
  width: 300px;
  min-width: 300px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  background: var(--color-bg-2);

  .sidebar-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 { margin: 0; font-size: 15px; font-weight: 600; }
    .module-count {
      font-size: 12px; color: var(--color-text-3);
      background: var(--color-fill-2); padding: 2px 8px; border-radius: 10px;
    }
  }

  // ====== 树形导航 ======
  :deep(.arco-tree) {
    padding: 4px 0;
  }

  :deep(.arco-tree-node) {
    padding-left: 8px;
  }

  :deep(.arco-tree-node-title) {
    font-size: 13px;
  }

  :deep(.arco-tree-node-selected) {
    .arco-tree-node-title {
      color: var(--color-primary-6);
      font-weight: 600;
    }
  }

  .tree-node-title {
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.6;
    cursor: pointer;
    width: 100%;
  }

  .tree-node-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
}

// ====== 右侧内容 ======
.prd-content {
  flex: 1; overflow: hidden; display: flex; padding: 0;

  .empty-state, .loading-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; color: var(--color-text-3);
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    h3 { margin: 0 0 8px; font-size: 16px; color: var(--color-text-2); }
    p { margin: 0; font-size: 13px; }
  }

  .content-area {
    padding: 24px 32px 48px;
    max-width: 960px;
    margin: 0 auto;
  }

  .content-header {
    .header-top {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      h2 { margin: 0; font-size: 22px; font-weight: 600; color: var(--color-text-1); }
    }
    .header-tags { display: flex; gap: 6px; flex-shrink: 0; }
    .header-desc {
      margin: 8px 0 0; font-size: 14px; color: var(--color-text-3); line-height: 1.6;
    }
  }
}

// ====== 文档滚动容器 ======
.prd-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

// ====== 右侧目录索引 ======
.prd-toc {
  width: 220px;
  min-width: 220px;
  border-left: none;
  overflow-y: auto;
  background: var(--color-bg-2);
  padding: 16px 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: 100vh;

  // 隐藏滚动条但保留滚动功能
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .toc-header {
    padding: 0 20px 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
    border-bottom: none;
    margin-bottom: 4px;
  }

  .toc-list {
    display: flex;
    flex-direction: column;
  }

  .toc-item {
    padding: 6px 16px;
    cursor: pointer;
    color: var(--color-text-2);
    transition: all 0.15s ease;
    line-height: 1.4;
    border-left: none;
    border-radius: 0 4px 4px 0;
    margin: 0 4px;

    &:hover {
      color: var(--color-primary-6);
      background: var(--color-primary-light-1);
    }

    &.active {
      color: var(--color-primary-6);
      font-weight: 600;
      background: var(--color-primary-light-1);
    }

    &.level-2 { font-size: 13px; }
    &.level-3 { font-size: 12px; padding-left: 28px; }
    &.level-4 { font-size: 12px; padding-left: 40px; }
  }
}

// ====== PRD文档渲染 ======
// ====== 编辑模式 ======
.prd-editor {
  .editor-textarea {
    width: 100%;
    min-height: 800px;
    padding: 16px 20px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1);
    background: var(--color-bg-1);
    resize: vertical;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--color-primary-6);
      box-shadow: 0 0 0 2px var(--color-primary-light-3);
    }
  }
}

// ====== 语雀同步弹窗 ======
.yuque-config {
  .form-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;

    a {
      color: var(--color-primary-6);
    }
  }

  .sync-progress {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);

    .progress-text {
      margin-top: 8px;
      font-size: 13px;
      color: var(--color-text-2);
    }
  }

  .sync-result {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 13px;

      .title {
        flex: 1;
      }

      .link {
        color: var(--color-primary-6);
        font-size: 12px;
      }
    }
  }
}

.prd-document {
  :deep(.markdown-body) {
    font-size: 14px;
    line-height: 1.8;
    color: var(--color-text-1);

    // 段落
    p { margin: 0 0 12px; }
    strong { font-weight: 600; }

    // 列表
    ul, ol { padding-left: 20px; margin: 8px 0; }
    li { margin: 4px 0; }

    // 引用
    blockquote {
      border-left: 4px solid var(--color-primary-6);
      padding: 12px 16px; margin: 16px 0;
      background: var(--color-primary-light-1);
      border-radius: 0 4px 4px 0;
      color: var(--color-text-2); font-size: 13px;
    }

    // 标题
    h1 {
      font-size: 26px; font-weight: 700; margin: 32px 0 16px;
      padding-bottom: 8px; border-bottom: 2px solid var(--color-primary-6);
    }
    h2 {
      font-size: 20px; font-weight: 600; margin: 28px 0 12px;
      padding-bottom: 6px; border-bottom: 1px solid var(--color-border);
    }
    h3 { font-size: 17px; font-weight: 600; margin: 24px 0 10px; }
    h4 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }

    // 表格
    table {
      width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;
      th, td {
        padding: 8px 12px; border: 1px solid var(--color-border); text-align: left;
      }
      th {
        background: var(--color-fill-2); font-weight: 600; white-space: nowrap; color: var(--color-text-1);
      }
      td { color: var(--color-text-2); }
      tr:nth-child(even) td { background: var(--color-fill-1); }
      tr:hover td { background: var(--color-primary-light-1); }
    }

    // 行内代码
    code {
      background: var(--color-fill-2); padding: 2px 6px; border-radius: 3px;
      font-family: 'SF Mono', 'Monaco', 'Menlo', monospace; font-size: 13px;
    }

    // 代码块
    pre {
      background: #1D2129; border-radius: 6px; padding: 16px; margin: 16px 0;
      overflow-x: auto;
      code {
        background: none; padding: 0; color: #E8F1FF;
        font-size: 13px; line-height: 1.6; white-space: pre;
      }
    }

    // 分割线
    hr {
      border: none; border-top: 1px solid var(--color-border); margin: 24px 0;
    }

    // 强调
    em { font-style: italic; }
  }

  // Mermaid图
  :deep(.mermaid-wrapper) {
    background: #FAFAFA; border: 1px solid var(--color-border);
    border-radius: 6px; padding: 0; margin: 16px 0;
    overflow-x: auto;

    .mermaid-chart-area {
      padding: 20px 20px 12px;
      display: flex; justify-content: center;
      min-height: 40px;
    }

    .mermaid-zoom-bar {
      text-align: center;
      padding: 0 20px 12px;
      .mermaid-zoom-trigger {
        display: inline-block;
        font-size: 12px;
        color: var(--color-primary-6);
        cursor: pointer;
        text-decoration: none;
        &:hover { color: var(--color-primary-7); text-decoration: underline; }
      }
    }

    .mermaid-failed-placeholder {
      text-align: center;
      padding: 10px;
      .mermaid-error-icon { font-size: 28px; }
      .mermaid-error-text { font-size: 13px; color: var(--color-text-3); }
    }

    .mermaid-fallback {
      font-family: monospace; font-size: 12px; white-space: pre-wrap;
      color: var(--color-text-3); margin: 0;
    }
    .mermaid-error {
      color: #f53f3f; font-size: 12px; margin-top: 8px;
    }
  }
}

// 滚动条
.prd-sidebar::-webkit-scrollbar, .prd-content-scroll::-webkit-scrollbar, .prd-toc::-webkit-scrollbar {
  width: 6px;
}
.prd-sidebar::-webkit-scrollbar-thumb, .prd-content-scroll::-webkit-scrollbar-thumb, .prd-toc::-webkit-scrollbar-thumb {
  background: var(--color-border); border-radius: 3px;
}

// ====== Mermaid弹窗 ======
.mermaid-modal-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
  padding: 16px;

  .modal-loading {
    color: var(--color-text-3);
    font-size: 14px;
  }

  :deep(.mermaid-fallback) {
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    color: var(--color-text-3);
    max-height: 400px;
    overflow-y: auto;
    width: 100%;
  }
}

// ====== 搜索栏 ======


.sidebar-search {
  position: relative;
  padding: 4px 10px 8px;

  .search-input {
    width: 100%;
    height: 32px;
    padding: 0 28px 0 10px;
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    font-size: 13px;
    color: var(--color-text-1);
    background: var(--color-bg-2);
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &::placeholder {
      color: var(--color-text-3);
      font-size: 12px;
    }

    &:focus {
      border-color: var(--color-primary-6);
    }
  }

  .search-clear {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: var(--color-text-3);
    font-size: 14px;
    line-height: 1;
    &:hover { color: var(--color-text-1); }
  }

  .search-spin {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

// ====== 搜索结果 ======
.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 16px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border-2);
    border-radius: 2px;
  }
}

.search-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: var(--color-text-3);
  font-size: 13px;
  gap: 6px;

  .search-empty-icon { font-size: 28px; }
  .search-empty-hint { font-size: 12px; color: var(--color-text-4); }
}

.search-spin-inline {
  display: inline-block;
  animation: spin 1s linear infinite;
}

.search-stats {
  font-size: 12px;
  color: var(--color-text-3);
  padding: 4px 6px 8px;
  border-bottom: 1px solid var(--color-border-1);
  margin-bottom: 4px;
}

.search-result-item {
  padding: 8px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--color-border-1);

  &:hover {
    background: var(--color-fill-2);
  }

  &:last-child {
    border-bottom: none;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
    font-size: 12px;
    line-height: 1.4;

    .result-doc-name {
      color: var(--color-primary-6);
      font-weight: 600;
      flex-shrink: 0;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-sep {
      color: var(--color-text-4);
      flex-shrink: 0;
    }

    .result-heading {
      color: var(--color-text-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .result-context {
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-3);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    mark {
      background: #ffd83b;
      color: var(--color-text-1);
      padding: 0 1px;
      border-radius: 2px;
    }
  }
}


</style>
