<template>
  <div class="prd-panel-container">
    <div 
      class="prd-panel-toggle"
      @click.stop="panelOpen = !panelOpen"
    >
      <img src="/images/prd-icon.png" class="prd-icon" />
      <span class="badge-count">{{ items.length }}</span>
    </div>

    <Teleport to="body">
      <Transition name="panel-slide">
        <div v-show="panelOpen" class="prd-panel" @click.stop>
          <div class="panel-header">
            <span class="panel-title">📋 产品需求文档</span>
            <button class="close-btn" @click="panelOpen = false">×</button>
          </div>
          
          <div class="panel-divider"></div>
          
          <div class="panel-content">
            <div 
              v-for="item in items" 
              :key="item.reqId"
              class="prd-item"
              @click.stop="openDetail(item)"
            >
              <span class="item-badge">{{ item.reqId }}</span>
              <span class="item-name">{{ item.moduleName }}</span>
              <span class="view-tip">点击查看 →</span>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-show="detailOpen" class="detail-panel">
          <div class="detail-header">
            <span class="detail-badge">[{{ currentDetail?.reqId }}]</span>
            <span class="detail-title">{{ currentDetail?.moduleName }}</span>
            <button class="close-btn" @click.stop="detailOpen = false">×</button>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-content" v-html="renderContent(currentDetail?.content || '')">
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PrdItem {
  reqId: number
  moduleName: string
  content: string
}

interface Props {
  items: PrdItem[]
}

defineProps<Props>()

const panelOpen = ref(false)
const detailOpen = ref(false)
const currentDetail = ref<PrdItem | null>(null)

const openDetail = (item: PrdItem) => {
  currentDetail.value = item
  detailOpen.value = true
}

const renderContent = (content: string) => {
  let html = content

  html = html.replace(/>>>flow([\s\S]*?)<<</gm, (_match: string, code: string) => {
    const flowHtml = code
      .trim()
      .replace(/^(.+?)->(.+?)->(.+?)$/gm, `<div class="flow-row"><span class="flow-box">$1</span><span class="flow-arrow">→</span><span class="flow-box">$2</span><span class="flow-arrow">→</span><span class="flow-box">$3</span></div>`)
      .replace(/^(.+?)->(.+?)$/gm, `<div class="flow-row"><span class="flow-box">$1</span><span class="flow-arrow">→</span><span class="flow-box">$2</span></div>`)
    return `<div class="flow-container">${flowHtml}</div>`
  })

  let tableRows = ''
  const lines = html.split('\n')
  html = ''
  let inTable = false
  
  for (const line of lines) {
    if (/^\|.*\|/.test(line)) {
      if (line.includes('---')) continue
      inTable = true
      const cells = line.split('|').filter((c: string) => c.trim())
      const cellHtml = cells.map((c: string) => `<td>${c.replace(/\*\*/g, '')}</td>`).join('')
      tableRows += `<tr>${cellHtml}</tr>`
    } else {
      if (inTable && tableRows) {
        html += `<table class="prd-table">${tableRows}</table>`
        tableRows = ''
        inTable = false
      }
      html += line + '\n'
    }
  }
  if (tableRows) {
    html += `<table class="prd-table">${tableRows}</table>`
  }

  html = html
    .replace(/^>> (.*?)$/gm, '<div class="prd-quote">$1</div>')
    .replace(/^!! (.*?)$/gm, '<div class="prd-warning">$1</div>')
    .replace(/^```([\s\S]*?)```/gm, '<div class="prd-code">$1</div>')
    .replace(/\[\[(.*?)\]\]\(primary\)/g, '<span class="prd-tag prd-tag-primary">$1</span>')
    .replace(/\[\[(.*?)\]\]\(success\)/g, '<span class="prd-tag prd-tag-success">$1</span>')
    .replace(/\[\[(.*?)\]\]\(warning\)/g, '<span class="prd-tag prd-tag-warning">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #d46b08">$1</strong>')
    .replace(/^### (.*?)$/gm, '<h3 class="prd-h3">$1</h3>')
    .replace(/^#### (.*?)$/gm, '<h4 class="prd-h4">$1</h4>')
    .replace(/^- (.*?)$/gm, '<div class="prd-list-item">$1</div>')
    .replace(/---/g, '<hr class="prd-hr">')
    .replace(/\n/g, '')

  return html
}
</script>

<style scoped>
.prd-panel-container {
  position: fixed;
  top: 70px;
  right: 16px;
  z-index: 9999;
}

.prd-panel-toggle {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  position: relative;
  z-index: 9999;
  border: 1px solid #f0f0f0;
}

.prd-panel-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.prd-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.prd-panel-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(250, 173, 20, 0.6);
}

.badge-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #faad14, #ff7a45);
  color: white;
  border-radius: 11px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.4);
  pointer-events: none;
}

.prd-panel {
  position: fixed;
  top: 60px;
  right: 70px;
  width: 520px;
  max-height: calc(100vh - 80px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 9998;
  pointer-events: auto !important;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.panel-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff7e6, #ffe7ba);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #d46b08;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  font-size: 18px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #ffd591, transparent);
}

.panel-content {
  padding: 12px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.prd-item {
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.prd-item:hover {
  border-color: #ffd591;
  background: #fffbf0;
  transform: translateX(4px);
}

.item-badge {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #faad14, #ff7a45);
  color: white;
  border-radius: 14px;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

h3 {
  color: #d46b08 !important;
}

h4 {
  color: #8c5a00 !important;
  margin: 12px 0 6px !important;
}

strong {
  color: #d46b08;
}

.prd-h3 {
  margin: 40px 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
  padding: 16px 24px;
  border-radius: 12px;
  border-left: 5px solid #faad14;
  box-shadow: 0 2px 12px rgba(250, 173, 20, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
}

.prd-h3::before {
  content: "📌";
  font-size: 22px;
}

.prd-h4 {
  margin: 28px 0 16px;
  font-size: 17px;
  font-weight: 600;
  color: #2c3e50;
  padding-left: 16px;
  border-left: 4px solid #ffc53d;
  position: relative;
}

.prd-h4::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 16px;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #ffc53d, transparent);
}

.prd-list-item {
  padding: 12px 16px 12px 44px;
  position: relative;
  margin: 8px 0;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  transition: all 0.2s;
  line-height: 1.8;
}

.prd-list-item:hover {
  background: #fffbf0;
  border-color: #ffd591;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.1);
}

.prd-list-item::before {
  content: "✅";
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.prd-hr {
  margin: 32px 0;
  border: none;
  height: 3px;
  background: linear-gradient(90deg, transparent, #f0f2f5, #ffd591, #f0f2f5, transparent);
  border-radius: 2px;
}

.prd-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 24px 0;
  font-size: 14px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.prd-table th {
  background: linear-gradient(135deg, #faad14 0%, #ff7a45 100%);
  color: white;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.prd-table td {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.2s;
  background: white;
}

.prd-table tr:nth-child(even) td {
  background: #fafbfc;
}

.prd-table tr:hover td {
  background: #fff7e6;
  color: #d46b08;
}

.prd-table tr:last-child td {
  border-bottom: none;
}

.prd-table th {
  background: linear-gradient(135deg, #fff7e6, #ffe7ba);
  font-weight: bold;
  color: #d46b08;
}

.prd-table tr:nth-child(even) {
  background: #fffbf0;
}

.flow-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 40px;
  margin: 28px 0;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
}

.flow-container::before {
  content: "🔄 业务流程";
  position: absolute;
  top: 12px;
  left: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
}

.flow-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.flow-box {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  position: relative;
}

.flow-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.flow-arrow {
  color: white;
  font-size: 20px;
  font-weight: bold;
  opacity: 0.9;
  padding: 0 4px;
}

.flow-arrow {
  color: #faad14;
  font-weight: bold;
  font-size: 16px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95) !important;
}

.detail-panel {
  position: fixed;
  width: 80%;
  height: 85vh;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  pointer-events: auto;
  z-index: 10000;
}

.detail-content {
  padding: 40px 60px;
  height: calc(85vh - 78px);
  overflow-y: auto;
  font-size: 15px;
  line-height: 2;
  color: #4a5568;
  background: linear-gradient(180deg, #fcfdff 0%, #ffffff 100%);
}

.detail-content::-webkit-scrollbar {
  width: 8px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f0f2f5;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #faad14, #ff7a45);
  border-radius: 4px;
}

.detail-content strong {
  color: #d46b08;
  font-weight: 600;
}

.detail-content p {
  margin: 16px 0;
  line-height: 2;
}

.detail-content > p:first-child {
  margin-top: 0;
}

.detail-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff7e6, #ffe7ba);
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.detail-badge {
  background: linear-gradient(135deg, #faad14, #ff7a45);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
}

.detail-title {
  flex: 1;
  margin-left: 16px;
  font-size: 20px;
  font-weight: bold;
  color: #d46b08;
}

.detail-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #ffd591, transparent);
}

.view-tip {
  color: #faad14;
  font-size: 12px;
  opacity: 0;
  transition: all 0.2s;
}

.prd-item:hover .view-tip {
  opacity: 1;
}

.prd-item:last-child {
  margin-bottom: 0;
}

.prd-quote {
  margin: 20px 0;
  padding: 20px 24px 20px 64px;
  background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #3498db;
  position: relative;
  line-height: 1.9;
  color: #34495e;
}

.prd-quote::before {
  content: "💡";
  position: absolute;
  left: 20px;
  top: 18px;
  font-size: 28px;
}

.prd-warning {
  margin: 20px 0;
  padding: 20px 24px 20px 64px;
  background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #faad14;
  position: relative;
  line-height: 1.9;
  color: #d46b08;
}

.prd-warning::before {
  content: "⚠️";
  position: absolute;
  left: 20px;
  top: 18px;
  font-size: 28px;
}

.prd-code {
  margin: 20px 0;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  color: #e94560;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.8;
  overflow-x: auto;
}

.prd-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin: 0 6px 6px 0;
}

.prd-tag-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.prd-tag-success {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
}

.prd-tag-warning {
  background: linear-gradient(135deg, #faad14, #ff7a45);
  color: white;
}
</style>
