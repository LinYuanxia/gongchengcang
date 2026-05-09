<template>
  <a-modal
    v-model:visible="visible"
    title="🔀 核心交易链路时序图"
    :width="1500"
    :footer="false"
    :body-style="{ padding: 0 }"
    :destroyOnClose="false"
    :forceRender="true"
    @open="onModalOpen"
  >
    <div class="flow-diagram-container">
      <div class="diagram-header">
        <div class="header-content">
          <div class="sub sub-highlight">【非空中分账模式】施工方端 → 工程仓端 → 支付中台 → 记账系统 完整链路</div>
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
          <span class="legend-item"><span class="legend-color" style="background:#e3f2fd; border:2px solid #1976d2;"></span> 施工方购买流程</span>
          <span class="legend-item"><span class="legend-color" style="background:#f3e5f5; border:2px solid #7b1fa2;"></span> 平台撮合费记账</span>
          <span class="legend-item"><span class="legend-color" style="background:#e8f5e9; border:2px solid #1b5e20;"></span> 支付划扣</span>
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
    participant S as 施工方端
    participant W as 工程仓端
    participant P as 支付中台
    participant A as 记账系统

    Note over S,A: 🎯 非空中分账模式 - 核心销售链路
    rect rgb(227, 242, 253)
    Note over S,W: 🔵 施工方购买工程仓商品
    S->>W: 1. 浏览商品 / 下单
    S->>W: 2. 确认订单
    S->>P: 3. 支付全额货款
    P-->>W: 4. 支付成功回调
    Note right of P: 💡 资金进入【工程仓虚拟户】<br/>平台不碰货款
    W-->>S: 5. 订单状态：待收货
    end

    rect rgb(232, 245, 233)
    Note over W,P: 🟢 订单完成 → 触发撮合费划扣
    S->>W: 6. 确认收货
    W->>W: 7. 计算撮合费<br/>订单金额 × 约定费率
    W->>P: 8. 发起撮合费划扣指令
    Note right of W: 仅划扣平台应收服务费
    P->>P: 9. 执行划扣<br/>工程仓虚拟户 → 平台虚拟户
    P-->>W: 10. 划扣成功回调
    Note right of P: ✅ 资金闭环在虚拟户体系内
    end

    rect rgb(243, 229, 245)
    Note over P,A: 🟣 平台撮合费自动记账
    P->>A: 11. 推送划扣流水（实时）
    A->>A: 12. 自动生成记账凭证
    Note right of A: 借：其他货币资金-虚拟户<br/>贷：主营业务收入-撮合费
    A->>A: 13. 登记入账簿
    A-->>W: 14. 记账完成通知
    end

    Note over S,A: ✅ 链路完成：施工方付款 → 工程仓收款 → 平台收撮合费 → 自动记账
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
      actorMargin: 60,
      boxMargin: 15,
      messageMargin: 40
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
    const { svg } = await mermaid.render('mermaid-trans-diagram', mermaidDefinition.trim())
    mermaidContainer.value!.innerHTML = svg
    svgRendered.value = true
  } catch (e) {
    renderError.value = String(e)
    console.error('[CoreTransactionFlow] render error:', e)
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
