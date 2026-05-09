<template>
  <a-modal
    v-model:visible="visible"
    title="🔄 销售与采购独立双主线 · 三流合一链路图"
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
          <div class="sub sub-highlight">【非空中分账模式】工程仓收款 → 订单完成 → 工程仓主动向平台支付撮合费</div>
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
          <span class="legend-item"><span class="legend-color" style="background:#2563eb;"></span> 业务流 (订单/发货)</span>
          <span class="legend-item"><span class="legend-color" style="background:#10b981;"></span> 资金流 (付款/结算/服务费)</span>
          <span class="legend-item"><span class="legend-color" style="background:#ef4444;"></span> 发票流 (税务闭环)</span>
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
sequenceDiagram
    participant S as 👷 施工方
    participant W as 🏗️ 工程仓
    participant P as 💻 SaaS平台
    participant V as 📦 供应商

    rect rgb(235, 245, 255)
    Note over S,W: 🔵 【阶段一】施工方向工程仓购买（销售交易）
    S->>W: 1. 提交订单（购买商品）
    S->>W: 2. 支付全额货款
    W-->>S: 3. 订单确认（待发货）
    W->>W: 4. 发货 / 物流配送
    S->>W: 5. 确认收货（订单完成）
    Note right of W: ✅ 工程仓对公账户/虚拟户收到全额货款
    W->>P: 6. 工程仓主动向平台支付撮合费
    P-->>W: 7. 服务费收取成功回调
    Note right of P: ✅ 平台收到撮合费，确认服务收入
    end

    rect rgb(235, 255, 245)
    Note over W,V: 🟢 【阶段二】工程仓向供应商采购（采购交易）
    W->>V: 8. 提交采购订单
    W->>V: 9. 支付采购货款（工程仓账户）
    V-->>W: 10. 采购订单确认
    V->>W: 11. 发货 / 物流送达
    W->>W: 12. 验收入库
    Note over W: ✅ 库存增加，可售
    end

    rect rgb(255, 240, 245)
    Note over P,W: 🔴 【阶段三】平台服务费开票
    P->>W: 13. 开具服务费增值税专用发票
    Note over P,W: ✅ 工程仓取得服务费进项用于抵扣
    end

    Note over S,V: 🎯 核心模式：销售与采购独立双主线 · 非空中分账 · 三流合一
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
    sequence: {
      useMaxWidth: false,
      mirrorActors: false,
      actorMargin: 50,
      boxMargin: 15,
      messageMargin: 35
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
    const { svg } = await mermaid.render('mermaid-full-diagram', mermaidDefinition.trim())
    mermaidContainer.value!.innerHTML = svg
    svgRendered.value = true
  } catch (e) {
    renderError.value = String(e)
    console.error('[FullTransactionFlow] render error:', e)
  }
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
  min-width: 800px;
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
