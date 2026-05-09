<template>
  <a-modal
    v-model:visible="visible"
    title="🏭 平台撮合费记账链路架构图"
    :width="1600"
    :footer="false"
    :body-style="{ padding: 0 }"
    :destroyOnClose="false"
    :forceRender="true"
    @open="onModalOpen"
  >
    <div class="flow-diagram-container">
      <div class="diagram-header">
        <div class="header-content">
          <div class="sub sub-highlight">【非空中分账模式】施工方全额→工程仓虚拟户→订单完成→仅划扣撮合费→平台虚拟户</div>
          <div class="zoom-controls">
            <a-button-group size="mini">
              <a-button @click="zoomIn">🔍+</a-button>
              <a-button @click="zoomOut">🔍-</a-button>
              <a-button @click="resetZoom">↺</a-button>
            </a-button-group>
            <span class="zoom-text">{{ Math.round(scale * 100) }}%</span>
          </div>
        </div>
      </div>
      <div
        class="mermaid-wrapper"
        ref="wrapperRef"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @wheel.prevent="onWheel"
      >
        <div
          class="mermaid-scroll"
          :style="{
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
            transformOrigin: 'center center'
          }"
        >
          <div v-if="renderError" class="render-error">
            <p>⚠️ 图表渲染失败</p>
            <p class="render-error-detail">{{ renderError }}</p>
          </div>
          <div v-else-if="!svgRendered" class="render-loading">
            <p>⏳ 图表加载中...</p>
          </div>
          <div v-show="svgRendered" ref="mermaidContainer" class="mermaid-content"></div>
        </div>
      </div>
      <div class="footer-note">
        <div class="legend">
          <span class="legend-item"><span class="legend-color" style="background:#e3f2fd; border:2px solid #1976d2;"></span> 非空中分账5步流程</span>
          <span class="legend-item"><span class="legend-color" style="background:#f3e5f5; border:2px solid #7b1fa2;"></span> 平台记账系统</span>
          <span class="legend-item"><span class="legend-color" style="background:#e8f5e9; border:2px solid #1b5e20;"></span> 撮合费流程</span>
          <span class="legend-item"><span class="legend-color" style="background:#ffebee; border:2px solid #c62828;"></span> 异常流程</span>
        </div>
        <div class="drag-tip">💡 按住鼠标左键拖拽移动 | 滚轮缩放</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import mermaid from 'mermaid'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const visible = ref(props.visible)
const wrapperRef = ref<HTMLElement>()
const mermaidContainer = ref<HTMLElement>()

const scale = ref(0.8)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startOffsetX = ref(0)
const startOffsetY = ref(0)

const svgRendered = ref(false)
const renderError = ref('')
let renderAttempts = 0

const mermaidDefinition = `
graph TB
classDef platform fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#4a148c;
classDef business fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#014361;
classDef payment fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#7a4200;
classDef fee fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1d4d1d;
classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1;
classDef abnormal fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;

subgraph non-airborne[非空中分账 - 5步资金流向]
    direction LR
    S1[步骤1<br/>施工方付款<br/>全额支付] --> S2[步骤2<br/>进入工程仓虚拟户<br/>平台不碰货款]
    S2 --> S3[步骤3<br/>订单完成<br/>确认收货]
    S3 --> S4[步骤4<br/>仅划扣撮合费<br/>货款留存工程仓]
    S4 --> S5[步骤5<br/>进入平台虚拟户<br/>平台唯一收入]
end

subgraph warehouse[工程仓业务系统]
    direction TB
    A[施工方] -->|支付全额货款| B[工程仓订单]
    B --> C[订单完成<br/>确认收货<br/>划扣触发点]
    C -->|计算| FEE_RATE[撮合费率<br/>订单金额 x 费率]:::fee
end

subgraph payment[支付中台 撮合费划扣]
    direction LR
    ENGINE_VIRTUAL(工程仓虚拟户<br/>存放施工方全额货款):::payment
    PLATFORM_VIRTUAL(平台撮合费专户<br/>仅接收撮合费):::platform
    DEDUCT_RECORD[撮合费划扣记录<br/>划扣成功即预记账]:::fee
    RETRY[自动重试 3次]
    FAIL[划扣失败 财务介入]:::abnormal

    C -->|执行划扣指令| ENGINE_VIRTUAL
    ENGINE_VIRTUAL -->|仅转撮合费<br/>货款全额留存| PLATFORM_VIRTUAL
    PLATFORM_VIRTUAL --> DEDUCT_RECORD
    DEDUCT_RECORD -->|推送流水| ACCOUNTING
    PLATFORM_VIRTUAL -->|划扣失败| RETRY
    RETRY -->|最终失败| FAIL
end

subgraph accounting[平台记账系统 核心]
    direction TB
    ACCOUNTING[记账引擎<br/>鸣鸣很忙财务系统]:::platform
    VOUCHER[生成记账凭证<br/>借 其他货币资金-虚拟户<br/>贷 主营业务收入-撮合费]:::platform
    BOOK[登记入账簿]:::platform
    FEE_DATA[撮合费凭证数据<br/>平台唯一收入来源]:::platform

    DEDUCT_RECORD -->|唯一记账依据| ACCOUNTING
    ACCOUNTING --> VOUCHER
    VOUCHER --> BOOK
    BOOK --> FEE_DATA
end

subgraph recon[对账系统]
    direction TB
    RECON[对账引擎]
    MATCH{核对一致}
    CONFIRM[记账确认<br/>正式入账完成]:::platform
    ADJUST[差异调整]

    FEE_RATE -->|预期应收撮合费| RECON
    FEE_DATA -->|实际记账金额| RECON
    RECON --> MATCH
    MATCH -->|是| CONFIRM
    MATCH -->|否| ADJUST
    FAIL -->|划扣异常| ADJUST
end

class A,B,C business;
class ENGINE_VIRTUAL,DEDUCT_RECORD,RETRY,FAIL payment;
class PLATFORM_VIRTUAL,ACCOUNTING,VOUCHER,BOOK,FEE_DATA,FEE_RATE,CONFIRM fee;
`

onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      'background': '#ffffff',
      'primaryColor': '#e1f5fe',
      'primaryBorderColor': '#01579b',
      'lineColor': '#5f7f9e',
      'secondaryColor': '#fff3e0',
      'tertiaryColor': '#e8f5e9',
      'noteBkgColor': '#fff8e1',
      'noteBorderColor': '#ff8f00',
      'fontFamily': "Segoe UI, Roboto, 'Noto Sans', system-ui, sans-serif",
      'fontSize': '13px'
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis',
      padding: 20
    },
    securityLevel: 'loose'
  })
})

function onModalOpen() {
  if (svgRendered.value) return
  renderAttempts = 0
  tryRenderMermaid()
}

function tryRenderMermaid() {
  if (!mermaidContainer.value) {
    renderAttempts++
    if (renderAttempts > 10) {
      renderError.value = '渲染容器不可用，请刷新页面重试'
      return
    }
    setTimeout(() => tryRenderMermaid(), 300)
    return
  }
  renderMermaid()
}

async function renderMermaid() {
  renderError.value = ''
  try {
    if (mermaidContainer.value!.innerHTML) {
      mermaidContainer.value!.innerHTML = ''
    }
    const { svg } = await mermaid.render('mermaid-fund-diagram', mermaidDefinition.trim())
    mermaidContainer.value!.innerHTML = svg
    svgRendered.value = true
    applySubgraphStyles()
  } catch (e) {
    renderError.value = String(e)
    console.error('[PrbFlowDiagram] render error:', e)
  }
}

function applySubgraphStyles() {
  setTimeout(() => {
    const svg = mermaidContainer.value?.querySelector('svg')
    if (!svg) return
    const clusters = svg.querySelectorAll('.cluster')
    for (const cluster of clusters) {
      const labelElem = cluster.querySelector('.label')
      if (!labelElem) continue
      const text = labelElem.textContent || ''
      const rect = cluster.querySelector('rect')
      if (!rect) continue
      if (text.includes('平台记账系统')) {
        rect.setAttribute('fill', '#f3e5f5')
        rect.setAttribute('stroke', '#7b1fa2')
        rect.setAttribute('stroke-width', '3px')
      } else if (text.includes('支付中台')) {
        rect.setAttribute('fill', '#fff7e6')
        rect.setAttribute('stroke', '#f39c12')
      } else if (text.includes('非空中分账')) {
        rect.setAttribute('fill', '#e3f2fd')
        rect.setAttribute('stroke', '#1976d2')
        rect.setAttribute('stroke-width', '2px')
      } else if (text.includes('对账系统')) {
        rect.setAttribute('fill', '#edf7ed')
        rect.setAttribute('stroke', '#2e7d32')
      } else if (text.includes('工程仓业务')) {
        rect.setAttribute('fill', '#eef6ff')
        rect.setAttribute('stroke', '#1e88e5')
      }
    }
  }, 100)
}

watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val) {
      resetZoom()
    }
  }
)

watch(visible, (val) => {
  emit('update:visible', val)
})

function zoomIn() {
  scale.value = Math.min(scale.value + 0.15, 2.5)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.15, 0.4)
}

function resetZoom() {
  scale.value = 0.8
  offsetX.value = 0
  offsetY.value = 0
}

function onWheel(e: WheelEvent) {
  if (e.deltaY < 0) {
    scale.value = Math.min(scale.value + 0.1, 2.5)
  } else {
    scale.value = Math.max(scale.value - 0.1, 0.4)
  }
}

function startDrag(e: MouseEvent) {
  isDragging.value = true
  startX.value = e.clientX
  startY.value = e.clientY
  startOffsetX.value = offsetX.value
  startOffsetY.value = offsetY.value
  if (wrapperRef.value) {
    wrapperRef.value.style.cursor = 'grabbing'
  }
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return
  const deltaX = e.clientX - startX.value
  const deltaY = e.clientY - startY.value
  offsetX.value = startOffsetX.value + deltaX
  offsetY.value = startOffsetY.value + deltaY
}

function stopDrag() {
  isDragging.value = false
  if (wrapperRef.value) {
    wrapperRef.value.style.cursor = 'grab'
  }
}
</script>

<style scoped lang="less">
.flow-diagram-container {
  background: #eef2fa;
  overflow: hidden;
}

.diagram-header {
  padding: 1.2rem 1.8rem;
  background: linear-gradient(135deg, #f8fafc, #fff);
  border-bottom: 2px solid #e2e9f2;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sub-highlight {
    color: #1976d2;
    font-size: 0.85rem;
    font-weight: 600;
    border-left: 4px solid #1976d2;
    padding: 6px 0 6px 12px;
    background: linear-gradient(90deg, #e3f2fd 0%, transparent 100%);
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    .zoom-text {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      min-width: 40px;
    }
  }
}

.mermaid-wrapper {
  padding: 1.5rem;
  background: #fff;
  overflow: hidden;
  min-height: 580px;
  cursor: grab;
  position: relative;

  &:active {
    cursor: grabbing;
  }
}

.mermaid-scroll {
  min-width: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.1s ease-out;
  min-height: 550px;
}

.mermaid-content {
  width: 100%;
  display: flex;
  justify-content: center;

  :deep(svg) {
    max-width: 100%;
    height: auto;
  }
}

.render-error {
  text-align: center;
  padding: 60px 20px;
  color: #c62828;

  .render-error-detail {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
    word-break: break-all;
  }
}

.render-loading {
  text-align: center;
  padding: 60px 20px;
  color: #1976d2;
  font-size: 16px;
}

.footer-note {
  background: #f8fafd;
  border-top: 1px solid #e6edf4;
  padding: 1rem 1.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .legend {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #546e7a;
  }

  .legend-color {
    width: 20px;
    height: 12px;
    border-radius: 3px;
  }

  .drag-tip {
    font-size: 12px;
    color: #1e88e5;
    background: #e3f2fd;
    padding: 4px 12px;
    border-radius: 12px;
  }
}
</style>
