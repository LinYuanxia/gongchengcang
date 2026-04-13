<template>
  <div class="prd-badge-container" ref="containerRef">
    <div 
      class="prd-badge" 
      :style="badgeStyle"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      ref="badgeRef"
    >
      {{ reqId }}
    </div>

    <Teleport to="body">
      <div 
        v-show="visible" 
        class="prd-tooltip"
        :style="tooltipStyle"
        @mousedown="handleMouseDown"
        @click.stop
      >
        <div class="tooltip-header">
          <span class="req-badge">{{ reqId }}</span>
          <span class="req-title">需求描述：{{ moduleName }}</span>
          <button class="close-btn" @click="visible = false">×</button>
        </div>
        <div class="tooltip-divider"></div>
        <div class="tooltip-content" v-html="renderedContent">
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'

const props = defineProps<{
  reqId: number
  moduleName: string
  content: string
  top?: string
  right?: string
}>()

const containerRef = ref<HTMLElement>()
const badgeRef = ref<HTMLElement>()
const visible = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const badgeStyle = computed(() => ({
  top: props.top || '-8px',
  right: props.right || '-4px',
}))

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
}))

const renderedContent = computed(() => {
  return props.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>')
})

function handleMouseEnter() {
  if (!isDragging.value) {
    visible.value = true
    nextTick(() => {
      updateTooltipPosition()
    })
  }
}

function handleMouseLeave() {
  if (!isDragging.value) {
  }
}

function updateTooltipPosition() {
  if (badgeRef.value) {
    const rect = badgeRef.value.getBoundingClientRect()
    let x = rect.left
    let y = rect.bottom + 8

    const tooltipWidth = 450
    const tooltipHeight = 300

    if (x + tooltipWidth > window.innerWidth) {
      x = window.innerWidth - tooltipWidth - 20
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = rect.top - tooltipHeight - 8
    }

    tooltipPosition.value = { x, y }
  }
}

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - tooltipPosition.value.x,
    y: e.clientY - tooltipPosition.value.y,
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    tooltipPosition.value = {
      x: e.clientX - dragOffset.value.x,
      y: e.clientY - dragOffset.value.y,
    }
  }
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style lang="less" scoped>
.prd-badge-container {
  position: relative;
  display: inline-block;
}

.prd-badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
  background: linear-gradient(135deg, #faad14, #ff7a45);
  color: white;
  font-size: 12px;
  font-weight: bold;
  line-height: 18px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 999;
  user-select: none;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.4);
}

.prd-badge:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 12px rgba(250, 173, 20, 0.6);
}

.prd-tooltip {
  position: fixed;
  z-index: 9999;
  background-color: #f0efef;
  border-radius: 4px;
  width: 450px;
  max-height: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  user-select: none;

  .tooltip-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 8px;
    cursor: move;

    .req-badge {
      background-color: rgb(250, 173, 20);
      color: white;
      font-size: 10px;
      font-weight: bold;
      line-height: 14px;
      padding: 0px 4px;
      border-radius: 2px;
      display: inline-block;
    }

    .req-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .close-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #333;
      }
    }
  }

  .tooltip-divider {
    height: 1px;
    background: #e0e0e0;
    margin: 0 16px;
  }

  .tooltip-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.6;
    color: #333;

    :deep(*) {
      margin: 0;
      padding: 0;
    }

    :deep(p) {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(ul), :deep(ol) {
      margin: 12px 0;
      padding-left: 24px;
    }

    :deep(li) {
      margin: 6px 0;
      line-height: 1.6;
    }

    :deep(strong) {
      font-weight: 600;
      color: #111;
    }

    :deep(blockquote) {
      border-left: 3px solid #ccc;
      padding-left: 12px;
      margin: 12px 0;
      color: #666;
      background: rgba(0, 0, 0, 0.02);
      padding: 8px 12px;
    }

    :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
      margin: 16px 0 8px 0;
      font-weight: 600;
    }

    :deep(h1) {
      font-size: 18px;
    }

    :deep(h2) {
      font-size: 16px;
    }

    :deep(h3) {
      font-size: 14px;
    }

    :deep(code) {
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 2px;
      font-family: monospace;
    }
  }
}
</style>
