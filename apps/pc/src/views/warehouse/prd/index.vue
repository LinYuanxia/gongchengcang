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
      <!-- 端切换 - 下拉 -->
      <div class="sidebar-source">
        <a-select
          :model-value="currentSource"
          :options="sourceOptions"
          size="small"
          @change="switchSource"
        />
      </div>

      <!-- 标题 -->
      <div class="sidebar-header">
        <h3>📋 产品需求文档</h3>
        <div class="sidebar-header-right">
          <span class="module-count">{{ activeModules.length }}个模块</span>
        </div>
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

      <!-- 模块列表 -->
      <template v-else>
        <div v-for="(modules, priority) in moduleGroups" :key="priority" class="priority-group">
          <div class="priority-label" :class="`priority-${String(priority).toLowerCase()}`">
            {{ priority }}
            <span class="count-badge">{{ modules.length }}</span>
          </div>
          <div
            v-for="mod in modules"
            :key="mod.id"
            class="module-item"
            :class="{ active: activeModule?.id === mod.id }"
            @click="selectModule(mod)"
          >
            <span class="module-icon">{{ getIcon(mod.icon) }}</span>
            <div class="module-info">
              <span class="module-name">{{ mod.name }}</span>
              <span class="module-desc">{{ mod.description }}</span>
            </div>
          </div>
        </div>
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
                  <a-tag :color="activeModule.priority === 'P0' ? 'red' : 'blue'">{{ activeModule.priority }}</a-tag>
                  <a-tag color="arcoblue">{{ activeModule.docFile }}</a-tag>
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

            <!-- 文档内容（渲染后） -->
            <div v-if="!loadError" class="prd-document" ref="docRef" @click="handleDocClick">
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

  <!-- 更新日志悬浮按钮 -->
  <div class="changelog-float-btn" @click="openChangelog">
    <span class="changelog-float-icon">📋</span>
    <span class="changelog-float-text">更新日志</span>
  </div>

  <!-- 更新日志弹窗 -->
  <a-modal
    v-model:visible="showChangelog"
    title="📋 PRD 更新日志"
    :width="'85vw'"
    :footer="false"
    :mask-closable="true"
    :modal-style="{ maxWidth: '95vw', minWidth: '800px' }"
    :body-style="{ maxHeight: '82vh', minHeight: '400px' }"
  >
    <div v-if="changelogLoading" class="changelog-loading">⏳ 加载中...</div>
    <div v-else-if="changelogError" class="changelog-error">{{ changelogError }}</div>
    <div v-else class="changelog-body">
      <div class="changelog-content markdown-body" ref="changelogContentRef" v-html="changelogHtml"></div>
      <div class="changelog-toc" v-if="changelogToc.length">
        <div class="changelog-toc-header">📑 目录</div>
        <div class="changelog-toc-list">
          <div
            v-for="item in changelogToc"
            :key="item.id"
            class="changelog-toc-item"
            :class="[`level-${item.level}`, { active: activeChangelogTocId === item.id }]"
            @click="scrollChangelogToc(item.id)"
          >{{ item.text }}</div>
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
import { prdModules, platformPrdModules, supplierPrdModules, constructionPrdModules, sourceOptions } from '@/components/PrdPanel/prdData'
import type { PrdModule, PrdSource } from '@/components/PrdPanel/prdData'

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
const currentSource = ref<PrdSource>('warehouse')
const loading = ref(false)
const loadError = ref('')
const renderedHtml = ref('')
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

// ------ 更新日志 ------
const showChangelog = ref(false)
const changelogHtml = ref('')
const changelogLoading = ref(false)
const changelogError = ref('')
const changelogContentRef = ref<HTMLElement | null>(null)

interface ChangelogTocItem {
  id: string
  text: string
  level: number
}
const changelogToc = ref<ChangelogTocItem[]>([])
const activeChangelogTocId = ref('')
let changelogTocObserver: IntersectionObserver | null = null

async function openChangelog() {
  showChangelog.value = true
  if (changelogHtml.value) {
    await rebuildChangelogToc()
    return
  }
  changelogLoading.value = true
  changelogError.value = ''
  try {
    const response = await fetch('/gongchengcang/prd-docs/更新日志.md')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const md = await response.text()
    changelogHtml.value = marked.parse(md) as string
    // 先关闭加载状态，v-else 渲染 DOM 后再建 TOC
    changelogLoading.value = false
    await nextTick()
    rebuildChangelogToc()
  } catch (err: any) {
    changelogError.value = err.message || String(err)
  } finally {
    changelogLoading.value = false
  }
}

function rebuildChangelogToc() {
  // 重建目录索引
  changelogTocObserver?.disconnect()
  const container = changelogContentRef.value
  if (!container) { changelogToc.value = []; return }
  const headings = container.querySelectorAll('h1, h2, h3, h4')
  const items: ChangelogTocItem[] = []
  headings.forEach(h => {
    if (!h.id) return
    const level = parseInt(h.tagName.substring(1), 10)
    items.push({ id: h.id, text: (h.textContent || '').trim(), level })
  })
  changelogToc.value = items
  // 用 IntersectionObserver 追踪当前标题
  if (!items.length) return
  const scrollContainer = container.parentElement
  changelogTocObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activeChangelogTocId.value = entry.target.id
        break
      }
    }
  }, { root: scrollContainer, rootMargin: '-60px 0px -70% 0px', threshold: 0 })
  headings.forEach(h => changelogTocObserver?.observe(h))
}

function scrollChangelogToc(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeChangelogTocId.value = id
  }
}

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

// ------ 按优先级分组 ------
const priorityOrder = ['总纲', 'P0', 'P1', 'P2'] as const

/** 当前端的模块列表 */
const activeModules = computed(() => {
  switch (currentSource.value) {
    case 'platform': return platformPrdModules
    case 'supplier': return supplierPrdModules
    case 'construction': return constructionPrdModules
    default: return prdModules
  }
})

const moduleGroups = computed(() => {
  const groups: Record<string, PrdModule[]> = {}
  for (const p of priorityOrder) {
    const list = activeModules.value.filter(m => m.priority === p)
    if (list.length) groups[p] = list
  }
  const other = activeModules.value.filter(m => !(priorityOrder as readonly string[]).includes(m.priority))
  if (other.length) groups['其他'] = other
  return groups
})

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
    const modules = activeModules.value
    for (const mod of modules) {
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
  router.replace({ query: { module: mod.id, source: currentSource.value } })
  tocItems.value = []
  activeTocId.value = ''
  await loadAndRenderModule(mod)
}

/** 选择搜索结果 → 跳转到文档 */
async function selectSearchResult(r: SearchResult) {
  clearSearch()
  const mod = activeModules.value.find(m => m.id === r.docId)
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

/** 切换端 */
function switchSource(source: PrdSource) {
  if (source === currentSource.value) return
  currentSource.value = source
  searchCache.value = {} // 清空搜索缓存
  clearSearch()
  activeModule.value = null
  tocItems.value = []
  activeTocId.value = ''
  // 自动选新端的第一个模块
  const modules = activeModules.value
  if (modules.length > 0) {
    selectModule(modules[0])
  }
}

// ------ 初始化恢复 ------
onMounted(async () => {
  const moduleId = route.query.module as string
  const source = (route.query.source as PrdSource) || 'warehouse'
  currentSource.value = source
  const modules = activeModules.value
  let target = moduleId ? modules.find(m => m.id === moduleId) : null
  if (!target && modules.length > 0) {
    target = modules[0]
  }
  if (target) {
    activeModule.value = target
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
  changelogTocObserver?.disconnect()
  changelogTocObserver = null
  window.removeEventListener('keydown', onSearchKeydown)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped lang="less">
.prd-viewer {
  display: flex;
  height: calc(100vh - 48px - 40px);
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

  .sidebar-source {
    padding: 12px 20px 0;
    display: flex;
    justify-content: center;
  }

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

  .priority-group {
    padding: 8px 0;
    .priority-label {
      padding: 4px 20px; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 1px;
      display: flex; align-items: center; gap: 6px;
      &.priority-总纲 { color: #722ED1; }
      &.priority-p0 { color: #f53f3f; }
      &.priority-p1 { color: #165DFF; }
      &.priority-p2 { color: #00B42A; }
      .count-badge {
        font-size: 10px; background: var(--color-fill-2);
        padding: 0 5px; border-radius: 8px; font-weight: normal;
      }
    }
    .module-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 20px; cursor: pointer; transition: all 0.2s;
      border-left: 3px solid transparent;
      &:hover { background: var(--color-fill-2); }
      &.active {
        background: var(--color-primary-light-1);
        border-left-color: var(--color-primary-6);
        .module-name { color: var(--color-primary-6); font-weight: 600; }
      }
      .module-icon { font-size: 18px; line-height: 1.4; flex-shrink: 0; }
      .module-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      .module-name { font-size: 13px; font-weight: 500; color: var(--color-text-1); }
      .module-desc {
        font-size: 11px; color: var(--color-text-3); line-height: 1.4;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      }
    }
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
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  background: var(--color-bg-2);
  padding: 16px 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: calc(100vh - 48px - 40px);

  .toc-header {
    padding: 0 16px 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 8px;
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
    border-left: 2px solid transparent;

    &:hover {
      color: var(--color-primary-6);
      background: var(--color-primary-light-1);
    }

    &.active {
      color: var(--color-primary-6);
      font-weight: 600;
      background: var(--color-primary-light-1);
      border-left-color: var(--color-primary-6);
    }

    &.level-2 { font-size: 13px; }
    &.level-3 { font-size: 12px; padding-left: 28px; }
    &.level-4 { font-size: 12px; padding-left: 40px; }
  }
}

// ====== PRD文档渲染 ======
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
.sidebar-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

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

// ====== 更新日志悬浮按钮 ======
.changelog-float-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: var(--color-text-1);
  border: 1px solid var(--color-border-2);
  padding: 10px 18px;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  font-size: 13px;
  line-height: 1;
  user-select: none;

  &:hover {
    background: var(--color-fill-2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  .changelog-float-icon { font-size: 16px; }
}

// ====== 更新日志弹窗 ======
.changelog-loading, .changelog-error {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-3);
  font-size: 14px;
}

.changelog-body {
  display: flex;
  gap: 0;
  max-height: 70vh;
  overflow: hidden;
}

.changelog-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 16px 4px;

  :deep(*) { color: var(--color-text-1); }

  :deep(table) {
    width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;
    th, td {
      padding: 8px 12px; border: 1px solid var(--color-border); text-align: left;
    }
    th {
      background: var(--color-fill-2); font-weight: 600; white-space: nowrap;
    }
    tr:nth-child(even) td { background: var(--color-fill-1); }
  }

  :deep(h2) {
    font-size: 20px; font-weight: 600; margin: 28px 0 12px;
    padding-bottom: 6px; border-bottom: 2px solid var(--color-primary-6);
  }
  :deep(h3) { font-size: 17px; font-weight: 600; margin: 24px 0 10px; }
  :deep(h4) { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
  :deep(p) { margin: 0 0 12px; line-height: 1.8; }
  :deep(blockquote) {
    border-left: 4px solid var(--color-primary-6);
    padding: 12px 16px; margin: 16px 0;
    background: var(--color-primary-light-1);
    border-radius: 0 4px 4px 0;
    font-size: 13px;
  }
  :deep(code) {
    background: var(--color-fill-2); padding: 2px 6px; border-radius: 3px;
    font-family: 'SF Mono', 'Monaco', 'Menlo', monospace; font-size: 13px;
  }
  :deep(strong) { font-weight: 600; }
  :deep(ul), :deep(ol) { padding-left: 20px; margin: 8px 0; }
  :deep(li) { margin: 4px 0; }
}

// ====== 更新日志右侧目录索引 ======
.changelog-toc {
  width: 180px;
  min-width: 180px;
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  padding: 12px 0;

  .changelog-toc-header {
    padding: 0 12px 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 6px;
  }

  .changelog-toc-list {
    display: flex;
    flex-direction: column;
  }

  .changelog-toc-item {
    padding: 5px 12px;
    cursor: pointer;
    color: var(--color-text-2);
    transition: all 0.15s ease;
    line-height: 1.4;
    font-size: 12px;
    border-left: 2px solid transparent;

    &:hover {
      color: var(--color-primary-6);
      background: var(--color-primary-light-1);
    }

    &.active {
      color: var(--color-primary-6);
      font-weight: 600;
      background: var(--color-primary-light-1);
      border-left-color: var(--color-primary-6);
    }

    &.level-2 { font-size: 13px; }
    &.level-3 { font-size: 12px; padding-left: 20px; }
    &.level-4 { font-size: 11px; padding-left: 28px; }
  }
}
</style>
