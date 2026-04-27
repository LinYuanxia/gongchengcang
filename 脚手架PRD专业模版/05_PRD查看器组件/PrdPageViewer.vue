<template>
  <!--
    PRD全页查看器
    【用途】独立页面，左侧模块导航 + 右侧Markdown渲染
    【功能】端切换 / 全文搜索 / Mermaid渲染 / TOC / 更新日志
    【集成】在路由中注册此页面即可
    【依赖】prdData.ts（模块注册表）
  -->
  <div class="prd-viewer">
    <!-- 左侧导航 -->
    <div class="prd-sidebar">
      <div class="sidebar-source">
        <a-select :model-value="currentSource" :options="sourceOptions" size="small" @change="switchSource" />
      </div>
      <div class="sidebar-header">
        <h3>📋 产品需求文档</h3>
        <span class="module-count">{{ activeModules.length }}个模块</span>
      </div>

      <div class="sidebar-search">
        <input ref="searchInputRef" v-model="searchQuery" class="search-input"
          placeholder="🔍 搜索文档内容..." @input="onSearchInput" />
        <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
        <span v-if="isSearching" class="search-spin">⏳</span>
      </div>

      <div v-if="searchQuery" class="search-results">
        <div v-if="isSearching" class="search-status"><span class="search-spin-inline">⏳</span> 搜索中...</div>
        <div v-else-if="searchResults.length === 0" class="search-status">
          <div class="search-empty-icon">🔍</div>
          <div>未找到匹配内容</div>
        </div>
        <template v-else>
          <div class="search-stats">共 {{ searchResults.length }} 处匹配</div>
          <div v-for="r in searchResults" :key="`${r.docId}-${r.headingId}`"
            class="search-result-item" @click="selectSearchResult(r)">
            <div class="result-header">
              <span class="result-doc-name">{{ r.docName }}</span>
              <span class="result-sep">›</span>
              <span class="result-heading">{{ r.heading }}</span>
            </div>
            <div class="result-context" v-html="r.contextHtml"></div>
          </div>
        </template>
      </div>

      <template v-else>
        <div v-for="mod in activeModules" :key="mod.id"
          class="module-item" :class="{ active: activeModule?.id === mod.id }"
          @click="selectModule(mod)">
          <span class="module-icon">{{ getIcon(mod.icon) }}</span>
          <div class="module-info">
            <span class="module-name">{{ mod.name }}</span>
            <span class="module-desc">{{ mod.description }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 右侧内容 -->
    <div class="prd-content">
      <div v-if="loading" class="loading-state"><a-spin /><p>加载文档中...</p></div>
      <div v-else-if="!activeModule" class="empty-state">
        <div class="empty-icon">📖</div><h3>选择一个模块查看PRD</h3>
      </div>
      <template v-else>
        <div class="prd-content-scroll" ref="scrollRef">
          <div class="content-area">
            <div class="content-header">
              <div class="header-top">
                <h2>{{ getIcon(activeModule.icon) }} {{ activeModule.name }}</h2>
                <a-tag color="arcoblue">{{ activeModule.docFile }}</a-tag>
              </div>
              <p class="header-desc">{{ activeModule.description }}</p>
            </div>
            <a-divider />
            <a-alert v-if="loadError" type="error">
              <template #content>加载文档失败：{{ loadError }}</template>
            </a-alert>
            <div v-if="!loadError" class="prd-document" ref="docRef" @click="handleDocClick">
              <div class="markdown-body" v-html="renderedHtml"></div>
            </div>
          </div>
        </div>

        <div class="prd-toc" v-if="tocItems.length">
          <div class="toc-header">📑 目录</div>
          <div class="toc-list">
            <div v-for="item in tocItems" :key="item.id"
              class="toc-item" :class="{ active: activeTocId === item.id, [`level-${item.level}`]: true }"
              @click="scrollToHeading(item.id)">{{ item.text }}</div>
          </div>
        </div>
      </template>
    </div>

    <a-modal v-model:visible="mermaidModalVisible" title="📊 图表放大查看"
      :width="800" :footer="false" :mask-closable="true" @open="renderMermaidInModal">
      <div id="mermaid-modal-container" class="mermaid-modal-container">
        <div class="modal-loading">⏳ 渲染图表中...</div>
      </div>
    </a-modal>

    <div class="changelog-float-btn" @click="openChangelog">
      <span class="changelog-float-icon">📋</span>
      <span class="changelog-float-text">更新日志</span>
    </div>

    <a-modal v-model:visible="showChangelog" title="📋 PRD 更新日志"
      :width="'85vw'" :footer="false" :mask-closable="true">
      <div v-if="changelogLoading" class="changelog-loading">⏳ 加载中...</div>
      <div v-else-if="changelogError" class="changelog-error">{{ changelogError }}</div>
      <div v-else class="changelog-body">
        <div class="changelog-content markdown-body" ref="changelogContentRef"
          v-html="changelogHtml"></div>
        <div class="changelog-toc" v-if="changelogToc.length">
          <div class="changelog-toc-header">📑 目录</div>
          <div class="changelog-toc-list">
            <div v-for="item in changelogToc" :key="item.id"
              class="changelog-toc-item" :class="[`level-${item.level}`, { active: activeChangelogTocId === item.id }]"
              @click="scrollChangelogToc(item.id)">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import mermaid from 'mermaid'
import { sourceA_Modules, sourceB_Modules, projectPrdModules, sourceOptions, getIcon } from './prdData'
import type { PrdModule, PrdSource } from './prdData'

const route = useRoute()
const router = useRouter()
const activeModule = ref<PrdModule | null>(null)
const currentSource = ref<PrdSource>('端A')
const loading = ref(false)
const loadError = ref('')
const renderedHtml = ref('')
const docRef = ref<HTMLElement | null>(null)

// ---- Mermaid ----
let mermaidRenderCounter = 0
mermaid.initialize({
  startOnLoad: false, theme: 'default', securityLevel: 'loose',
  themeVariables: { primaryColor: '#165DFF', lineColor: '#4E5969' },
})
const mermaidModalVisible = ref(false)
const currentMermaidDef = ref('')

// ---- TOC ----
interface TocItem { id: string; text: string; level: number }
const tocItems = ref<TocItem[]>([])
const activeTocId = ref('')
const scrollRef = ref<HTMLElement | null>(null)
let tocObserver: IntersectionObserver | null = null

// ---- 更新日志 ----
const showChangelog = ref(false)
const changelogHtml = ref('')
const changelogLoading = ref(false)
const changelogError = ref('')
const changelogContentRef = ref<HTMLElement | null>(null)
interface ClTocItem { id: string; text: string; level: number }
const changelogToc = ref<ClTocItem[]>([])
const activeChangelogTocId = ref('')
let clTocObserver: IntersectionObserver | null = null

const BASE_PATH = '/{basePath}' // 与 prdData.ts 中的保持一致

async function openChangelog() {
  showChangelog.value = true
  if (changelogHtml.value) { await rebuildClToc(); return }
  changelogLoading.value = true
  changelogError.value = ''
  try {
    const res = await fetch(`${BASE_PATH}/prd-docs/更新日志.md`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    changelogHtml.value = marked.parse(await res.text()) as string
    changelogLoading.value = false
    await nextTick()
    rebuildClToc()
  } catch (e: any) { changelogError.value = e.message }
  finally { changelogLoading.value = false }
}

function rebuildClToc() {
  clTocObserver?.disconnect()
  const c = changelogContentRef.value
  if (!c) { changelogToc.value = []; return }
  const hs = c.querySelectorAll('h1, h2, h3, h4')
  const items: ClTocItem[] = []
  hs.forEach(h => {
    if (!h.id) return
    items.push({ id: h.id, text: (h.textContent || '').trim(), level: parseInt(h.tagName.substring(1), 10) })
  })
  changelogToc.value = items
  if (!items.length) return
  clTocObserver = new IntersectionObserver(entries => {
    for (const e of entries) { if (e.isIntersecting) { activeChangelogTocId.value = e.target.id; break } }
  }, { root: c.parentElement, rootMargin: '-60px 0px -70% 0px', threshold: 0 })
  hs.forEach(h => clTocObserver?.observe(h))
}

function scrollChangelogToc(id: string) {
  const el = document.getElementById(id)
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); activeChangelogTocId.value = id }
}

// ---- 全文搜索 ----
interface SearchResult { docId: string; docName: string; heading: string; headingId: string; contextHtml: string }
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const searchCache = ref<Record<string, string>>({})
let searchTimer: ReturnType<typeof setTimeout> | null = null
const searchInputRef = ref<HTMLInputElement | null>(null)

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}
function escapeHtml(s: string) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

const mdRenderer = new marked.Renderer()
mdRenderer.heading = function (arg: any) {
  const text = (arg.tokens || []).map((t: any) => t.raw || t.text || '').join('')
  return `<h${arg.depth} id="${slugify(text)}">${text}</h${arg.depth}>`
}
marked.setOptions({ gfm: true, breaks: true, renderer: mdRenderer })

const activeModules = computed(() => {
  switch (currentSource.value) {
    case 'project': return projectPrdModules
    case '端A': return sourceA_Modules
    case '端B': return sourceB_Modules
    default: return sourceA_Modules
  }
})

function parseMdWithMermaid(md: string) {
  const parts: { type: 'markdown' | 'mermaid'; content: string; index: number }[] = []
  const pat = /```mermaid\s*\n([\s\S]*?)```/g
  let li = 0, mi = 0, m: RegExpExecArray | null
  while ((m = pat.exec(md)) !== null) {
    if (m.index > li) parts.push({ type: 'markdown', content: md.slice(li, m.index), index: -1 })
    parts.push({ type: 'mermaid', content: m[1].trim(), index: mi++ })
    li = m.index + m[0].length
  }
  if (li < md.length) parts.push({ type: 'markdown', content: md.slice(li), index: -1 })
  if (!parts.length) parts.push({ type: 'markdown', content: md, index: -1 })
  return parts
}

async function loadAndRenderModule(mod: PrdModule) {
  loading.value = true; loadError.value = ''; renderedHtml.value = ''
  try {
    const res = await fetch(mod.docUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${mod.docFile} 加载失败`)
    const parts = parseMdWithMermaid(await res.text())
    let html = ''
    const mDefs: { id: string; def: string }[] = []
    for (const p of parts) {
      if (p.type === 'markdown') { html += marked.parse(p.content) as string }
      else {
        const id = `md-${++mermaidRenderCounter}`
        mDefs.push({ id, def: p.content })
        html += `<div class="mermaid-wrapper" id="${id}"><div class="mermaid-chart-area"><div class="mermaid-loading">⏳ 渲染图表中...</div></div><div class="mermaid-zoom-bar"><a class="mermaid-zoom-trigger" data-def="${escapeHtml(p.content)}">🔍 放大查看</a></div></div>`
      }
    }
    renderedHtml.value = html
    for (const d of mDefs) {
      try {
        await mermaid.parse(d.def); await new Promise(r => setTimeout(r, 30))
        const { svg, bindFunctions } = await mermaid.render(d.id, d.def)
        const w = document.getElementById(d.id)
        if (w) { const ca = w.querySelector('.mermaid-chart-area'); if (ca) { ca.innerHTML = svg; bindFunctions?.(ca) } }
      } catch { /* ignore failed mermaid */ }
    }
  } catch (e: any) { loadError.value = e.message }
  finally { loading.value = false }
  await nextTick(); buildToc(); setupTocObserver()
}

function buildToc() {
  const c = docRef.value; if (!c) { tocItems.value = []; return }
  tocItems.value = Array.from(c.querySelectorAll('h1, h2, h3, h4')).filter(h => h.id).map(h => ({
    id: h.id, text: (h.textContent || '').trim(), level: parseInt(h.tagName.substring(1), 10)
  }))
}

function setupTocObserver() {
  tocObserver?.disconnect(); const c = docRef.value; if (!c) return
  const hs = c.querySelectorAll('h1, h2, h3, h4'); if (!hs.length) return
  tocObserver = new IntersectionObserver(entries => {
    for (const e of entries) { if (e.isIntersecting) { activeTocId.value = e.target.id; break } }
  }, { root: scrollRef.value, rootMargin: '-80px 0px -60% 0px', threshold: 0 })
  hs.forEach(h => tocObserver?.observe(h))
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); activeTocId.value = id }
}

function handleDocClick(e: MouseEvent) {
  const t = (e.target as HTMLElement).closest('.mermaid-zoom-trigger')
  if (t) { const d = t.getAttribute('data-def'); if (d) { currentMermaidDef.value = d; mermaidModalVisible.value = true } }
}

async function renderMermaidInModal() {
  const c = document.getElementById('mermaid-modal-container'); if (!c || !currentMermaidDef.value) return
  c.innerHTML = '<div class="modal-loading">⏳ 渲染图表中...</div>'
  try {
    await mermaid.parse(currentMermaidDef.value)
    const { svg, bindFunctions } = await mermaid.render(`mm-${++mermaidRenderCounter}`, currentMermaidDef.value)
    c.innerHTML = svg; bindFunctions?.(c)
  } catch { c.innerHTML = `<pre>${escapeHtml(currentMermaidDef.value)}</pre><div style="color:red">⚠️ 图表语法有误</div>` }
}

function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

async function getMdContent(mod: PrdModule): Promise<string> {
  if (searchCache.value[mod.docUrl]) return searchCache.value[mod.docUrl]
  const res = await fetch(mod.docUrl); if (!res.ok) return ''
  return searchCache.value[mod.docUrl] = await res.text()
}

function searchInMd(mod: PrdModule, md: string, kw: string): SearchResult[] {
  const r: SearchResult[] = []
  const lkw = kw.toLowerCase(); const lines = md.split('\n')
  let ch = '文档开头', chId = ch, sl: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,4})\s+(.+)/)
    if (m) {
      if (sl.length > 0 && sl.join('\n').toLowerCase().includes(lkw)) r.push(makeRes(mod, ch, chId, sl, kw, lkw))
      ch = m[2]; chId = slugify(ch); sl = [lines[i]]
    } else sl.push(lines[i])
  }
  if (sl.length > 0 && sl.join('\n').toLowerCase().includes(lkw)) r.push(makeRes(mod, ch, chId, sl, kw, lkw))
  return r
}

function makeRes(mod: PrdModule, heading: string, hid: string, lines: string[], kw: string, lkw: string): SearchResult {
  const mi = lines.findIndex(l => l.toLowerCase().includes(lkw))
  const ctx = lines.slice(Math.max(0, mi - 1), Math.min(lines.length, mi + 3))
    .map(l => l.replace(/^#{1,4}\s+/, '').trim()).filter(l => l)
    .map(l => escapeHtml(l).replace(new RegExp(`(${escapeRegex(kw)})`, 'gi'), '<mark>$1</mark>')).join('<br/>')
  return { docId: mod.id, docName: mod.name, heading, headingId: hid, contextHtml: ctx }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  const q = searchQuery.value.trim()
  if (!q) { searchResults.value = []; isSearching.value = false; return }
  searchTimer = setTimeout(() => performSearch(q), 300)
}

async function performSearch(kw: string) {
  isSearching.value = true
  const all: SearchResult[] = []
  for (const mod of activeModules.value) {
    const c = await getMdContent(mod); if (!c) continue
    all.push(...searchInMd(mod, c, kw))
  }
  all.sort((a, b) => Number(a.docId) - Number(b.docId))
  searchResults.value = all; isSearching.value = false
}

function clearSearch() { searchQuery.value = ''; searchResults.value = []; isSearching.value = false }

async function selectModule(mod: PrdModule) {
  activeModule.value = mod
  router.replace({ query: { module: mod.id, source: currentSource.value } })
  tocItems.value = []; activeTocId.value = ''
  await loadAndRenderModule(mod)
}

async function selectSearchResult(r: SearchResult) {
  clearSearch()
  const mod = activeModules.value.find(m => m.id === r.docId)
  if (!mod) return
  if (activeModule.value?.id !== r.docId) await selectModule(mod)
  await nextTick()
  const el = document.getElementById(r.headingId)
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); activeTocId.value = r.headingId }
}

function switchSource(source: PrdSource) {
  if (source === currentSource.value) return
  currentSource.value = source; searchCache.value = {}; clearSearch()
  activeModule.value = null; tocItems.value = []; activeTocId.value = ''
  const ms = activeModules.value; if (ms.length > 0) selectModule(ms[0])
}

onMounted(async () => {
  const mid = route.query.module as string
  const src = (route.query.source as PrdSource) || '端A'
  currentSource.value = src
  const ms = activeModules.value
  let t = mid ? ms.find(m => m.id === mid) : null
  if (!t && ms.length > 0) t = ms[0]
  if (t) { activeModule.value = t; await loadAndRenderModule(t) }
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchInputRef.value?.focus() }
  })
})

onUnmounted(() => {
  tocObserver?.disconnect(); clTocObserver?.disconnect()
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped lang="less">
.prd-viewer { display: flex; height: calc(100vh - 48px - 40px); background: var(--color-bg-1); overflow: hidden; }

.prd-sidebar { width: 300px; min-width: 300px; border-right: 1px solid var(--color-border); overflow-y: auto; background: var(--color-bg-2);
  .sidebar-source { padding: 12px 20px 0; display: flex; justify-content: center; }
  .sidebar-header { padding: 16px 20px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between;
    h3 { margin: 0; font-size: 15px; font-weight: 600; }
    .module-count { font-size: 12px; color: var(--color-text-3); background: var(--color-fill-2); padding: 2px 8px; border-radius: 10px; }
  }
  .module-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 20px; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent;
    &:hover { background: var(--color-fill-2); }
    &.active { background: var(--color-primary-light-1); border-left-color: var(--color-primary-6);
      .module-name { color: var(--color-primary-6); font-weight: 600; }
    }
    .module-icon { font-size: 18px; line-height: 1.4; flex-shrink: 0; }
    .module-info { flex: 1; min-width: 0; }
    .module-name { font-size: 13px; font-weight: 500; color: var(--color-text-1); }
    .module-desc { font-size: 11px; color: var(--color-text-3); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  }
}

.prd-content { flex: 1; overflow: hidden; display: flex;
  .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--color-text-3); }
  .content-area { padding: 24px 32px 48px; max-width: 960px; }
  .content-header { .header-top { display: flex; align-items: center; gap: 12px; h2 { margin: 0; font-size: 22px; } } .header-desc { margin: 8px 0 0; font-size: 14px; color: var(--color-text-3); } }
}
.prd-content-scroll { flex: 1; overflow-y: auto; }

.prd-toc { width: 220px; min-width: 220px; border-left: 1px solid var(--color-border); overflow-y: auto; background: var(--color-bg-2); padding: 16px 0;
  .toc-header { padding: 0 16px 12px; font-size: 14px; font-weight: 600; border-bottom: 1px solid var(--color-border); margin-bottom: 8px; }
  .toc-item { padding: 6px 16px; cursor: pointer; color: var(--color-text-2); transition: all 0.15s; border-left: 2px solid transparent; line-height: 1.4;
    &:hover { color: var(--color-primary-6); background: var(--color-primary-light-1); }
    &.active { color: var(--color-primary-6); font-weight: 600; background: var(--color-primary-light-1); border-left-color: var(--color-primary-6); }
    &.level-2 { font-size: 13px; } &.level-3 { font-size: 12px; padding-left: 28px; } &.level-4 { font-size: 12px; padding-left: 40px; }
  }
}

.prd-document :deep(.markdown-body) { font-size: 14px; line-height: 1.8; color: var(--color-text-1);
  h1 { font-size: 26px; font-weight: 700; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid var(--color-primary-6); }
  h2 { font-size: 20px; font-weight: 600; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--color-border); }
  h3 { font-size: 17px; font-weight: 600; margin: 24px 0 10px; }
  h4 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;
    th, td { padding: 8px 12px; border: 1px solid var(--color-border); text-align: left; }
    th { background: var(--color-fill-2); font-weight: 600; }
    tr:nth-child(even) td { background: var(--color-fill-1); }
  }
  pre { background: #1D2129; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto;
    code { background: none; padding: 0; color: #E8F1FF; font-size: 13px; }
  }
  code { background: var(--color-fill-2); padding: 2px 6px; border-radius: 3px; font-family: 'SF Mono', monospace; font-size: 13px; }
  blockquote { border-left: 4px solid var(--color-primary-6); padding: 12px 16px; margin: 16px 0; background: var(--color-primary-light-1); border-radius: 0 4px 4px 0; }
  .mermaid-wrapper { background: #FAFAFA; border: 1px solid var(--color-border); border-radius: 6px; padding: 0; margin: 16px 0; overflow-x: auto;
    .mermaid-chart-area { padding: 20px; display: flex; justify-content: center; min-height: 40px; }
    .mermaid-zoom-bar { text-align: center; padding: 0 20px 12px; }
    .mermaid-zoom-trigger { font-size: 12px; color: var(--color-primary-6); cursor: pointer; &:hover { text-decoration: underline; } }
  }
}

.sidebar-search { position: relative; padding: 4px 10px 8px;
  .search-input { width: 100%; height: 32px; padding: 0 28px 0 10px; border: 1px solid var(--color-border-2); border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box;
    &:focus { border-color: var(--color-primary-6); }
  }
  .search-clear, .search-spin { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 14px; }
  .search-spin { animation: spin 1s linear infinite; }
}
@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

.search-results { flex: 1; overflow-y: auto; padding: 0 10px 16px; }
.search-status { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--color-text-3); font-size: 13px; }
.search-stats { font-size: 12px; color: var(--color-text-3); padding: 4px 6px 8px; border-bottom: 1px solid var(--color-border-1); }
.search-result-item { padding: 8px 6px; border-radius: 4px; cursor: pointer; border-bottom: 1px solid var(--color-border-1);
  &:hover { background: var(--color-fill-2); }
  .result-header { display: flex; gap: 4px; margin-bottom: 4px; font-size: 12px; }
  .result-doc-name { color: var(--color-primary-6); font-weight: 600; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .result-context { font-size: 12px; color: var(--color-text-3); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    mark { background: #ffd83b; padding: 0 1px; border-radius: 2px; }
  }
}

.changelog-float-btn { position: fixed; bottom: 24px; right: 24px; z-index: 1000;
  display: flex; align-items: center; gap: 6px; background: #fff; padding: 10px 18px;
  border-radius: 24px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 13px; border: 1px solid var(--color-border-2);
  &:hover { background: var(--color-fill-2); box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
}

.changelog-body { display: flex; max-height: 70vh; overflow: hidden; }
.changelog-content { flex: 1; overflow-y: auto; padding: 8px 16px 16px 4px; }
.changelog-toc { width: 180px; min-width: 180px; border-left: 1px solid var(--color-border); overflow-y: auto; padding: 12px 0;
  .changelog-toc-header { padding: 0 12px 10px; font-size: 13px; font-weight: 600; border-bottom: 1px solid var(--color-border); }
  .changelog-toc-item { padding: 5px 12px; cursor: pointer; color: var(--color-text-2); font-size: 12px; border-left: 2px solid transparent; line-height: 1.4;
    &:hover { background: var(--color-primary-light-1); }
    &.active { color: var(--color-primary-6); font-weight: 600; background: var(--color-primary-light-1); border-left-color: var(--color-primary-6); }
    &.level-2 { font-size: 13px; } &.level-3 { padding-left: 20px; } &.level-4 { padding-left: 28px; font-size: 11px; }
  }
}
</style>
