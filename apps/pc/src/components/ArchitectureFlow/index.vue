<template>
  <a-modal
    v-model:visible="visible"
    title="🏗️ 四端协同架构全景图"
    :width="1600"
    :footer="false"
    :body-style="{ padding: 0 }"
  >
    <div class="flow-diagram-container">
      <div class="diagram-header">
        <div class="header-content">
          <div class="sub">施工方/工程仓/支付中台/对账系统 四端协同 · 全链路数据打通</div>
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
          ref="mermaidRef"
        >
          <pre class="mermaid">
            graph TB
            classDef system fill:#eef6ff,stroke:#1e88e5,stroke-width:3px,color:#0d47a1;
            classDef subsystem fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#e65100;
            classDef interface fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
            classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#6a1b9a;
            classDef arrow fill:none,stroke:#455a64,stroke-width:2px;

            subgraph 施工方系统 [施工方端]
              direction LR
              S1[下单小程序]
              S2[订单管理]
              S3[支付入口]
              S4[对账查询]
            end

            subgraph 工程仓系统 [工程仓端]
              direction LR
              B1[销售订单管理]
              B2[采购订单管理]
              B3[库存管理]
              B4[应收应付管理]
            end

            subgraph 支付中台系统 [支付中台]
              direction TB
              P1[钱包账户体系]
              P2[划扣执行引擎]
              P3[支付渠道对接]
              P4[异常重试机制]
              P5[流水记账模块]
            end

            subgraph 对账系统 [对账 & 财务端]
              direction LR
              R1[对账规则引擎]
              R2[差异处理工作台]
              R3[凭证生成]
              R4[报表导出]
            end

            S1 --> B1
            S3 --> P1
            S4 --> R4

            B1 --> P1
            B2 --> P1
            B4 --> R1

            P1 --> P2
            P2 --> P4
            P2 --> P5
            P5 --> R1
            P4 --> R2

            R1 --> R2
            R2 --> R3
            R3 --> R4

            class 施工方系统,工程仓系统,支付中台系统,对账系统 system;
            class S1,S2,S3,S4,B1,B2,B3,B4 subsystem;
            class P1,P2,P3,P4,P5,R1,R2,R3,R4 interface;
          </pre>
        </div>
      </div>
      <div class="footer-note">
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
const mermaidRef = ref<HTMLElement>()

const scale = ref(0.85)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startOffsetX = ref(0)
const startOffsetY = ref(0)

watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val) {
      resetZoom()
      setTimeout(() => renderMermaid(), 100)
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
  scale.value = 0.85
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

onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      'background': '#ffffff',
      'primaryColor': '#eef6ff',
      'primaryBorderColor': '#1e88e5',
      'lineColor': '#5f7f9e',
      'clusterBkg': '#fafcfd',
      'clusterBorder': '#b0c4de',
      'fontFamily': "Segoe UI, Roboto, 'Noto Sans', system-ui, sans-serif",
      'fontSize': '14px'
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis',
      padding: 20,
      nodeSpacing: 80,
      rankSpacing: 120
    },
    securityLevel: 'loose'
  })
})

async function renderMermaid() {
  if (!mermaidRef.value) return
  try {
    const id = `mermaid-arch-${Date.now()}`
    const mermaidElement = mermaidRef.value.querySelector('.mermaid') as HTMLElement
    if (mermaidElement) {
      mermaidElement.setAttribute('id', id)
      mermaidElement.innerHTML = mermaidElement.innerHTML.trim()
      await mermaid.run({
        nodes: [mermaidElement]
      })
    }
  } catch (e) {
    console.warn('Mermaid render error:', e)
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

  .sub {
    color: #2c6e9e;
    font-size: 0.9rem;
    border-left: 4px solid #1e88e5;
    padding-left: 0.8rem;
    margin-top: 0.4rem;
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
  min-height: 550px;
  cursor: grab;
  position: relative;

  &:active {
    cursor: grabbing;
  }
}

.mermaid-scroll {
  min-width: 1300px;
  display: flex;
  justify-content: center;
  transition: transform 0.1s ease-out;

  .mermaid {
    width: 100%;
  }
}

.footer-note {
  background: #f8fafd;
  border-top: 1px solid #e6edf4;
  padding: 1rem 1.8rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .drag-tip {
    font-size: 12px;
    color: #1e88e5;
    background: #e3f2fd;
    padding: 4px 12px;
    border-radius: 12px;
  }
}
</style>
