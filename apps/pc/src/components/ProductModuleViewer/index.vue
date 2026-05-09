<template>
  <a-modal
    v-model:visible="visible"
    title="🧩 产品模块设计全景图"
    :width="1400"
    :footer="false"
    :body-style="{ padding: 0 }"
    :transition-name="false"
    @ok="() => {}"
  >
    <div class="image-viewer-container">
      <div class="toolbar">
        <a-button-group size="small">
          <a-button @click="zoomIn">
            <template #icon>🔍+</template>
            放大
          </a-button>
          <a-button @click="zoomOut">
            <template #icon>🔍-</template>
            缩小
          </a-button>
          <a-button @click="resetZoom">
            <template #icon>↺</template>
            重置
          </a-button>
        </a-button-group>
        <div class="zoom-info">缩放: {{ Math.round(scale * 100) }}%</div>
        <div class="tip">💡 按住鼠标左键拖动可移动图片 | 滚轮缩放</div>
      </div>
      <div 
        class="image-wrapper" 
        ref="wrapperRef"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @wheel.prevent="onWheel"
      >
        <div v-if="imageLoading" class="loading-placeholder">
          <div class="loading-spinner">⏳ 图片加载中...</div>
        </div>
        <div v-else-if="imageError" class="loading-placeholder">
          <div class="error-text">❌ 图片加载失败，请检查路径</div>
          <div class="path-text">{{ imageSrc }}</div>
        </div>
        <div 
          v-else
          class="image-container"
          :style="transformStyle"
        >
          <img 
            :src="imageSrc"
            alt="产品模块设计全景图"
            class="product-image"
            draggable="false"
            @load="onImageLoad"
            @error="onImageError"
          >
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const visible = ref(props.visible)
const wrapperRef = ref<HTMLElement>()

const scale = ref(0.8)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startOffsetX = ref(0)
const startOffsetY = ref(0)

const imageSrc = ref('./images/产品模块设计.png')
const imageLoading = ref(false)
const imageError = ref(false)
const imageLoaded = ref(false)

const transformStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  transformOrigin: 'center center',
  willChange: 'transform'
}))

onMounted(() => {
  const img = new Image()
  img.src = imageSrc.value
  img.onload = () => {
    imageLoaded.value = true
  }
})

watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val) {
      if (!imageLoaded.value) {
        imageLoading.value = true
      }
      imageError.value = false
      resetZoom()
    }
  }
)

watch(visible, (val) => {
  emit('update:visible', val)
})

function onImageLoad() {
  imageLoading.value = false
  imageLoaded.value = true
}

function onImageError() {
  imageLoading.value = false
  imageError.value = true
  console.error('Image load failed:', imageSrc.value)
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.2, 3)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.2, 0.3)
}

function resetZoom() {
  scale.value = 0.8
  offsetX.value = 0
  offsetY.value = 0
}

function onWheel(e: WheelEvent) {
  if (e.deltaY < 0) {
    scale.value = Math.min(scale.value + 0.1, 3)
  } else {
    scale.value = Math.max(scale.value - 0.1, 0.3)
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
.image-viewer-container {
  background: #f8fafc;
  overflow: hidden;
}

.toolbar {
  padding: 12px 20px;
  background: linear-gradient(135deg, #fff, #f8fafc);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.zoom-info {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  min-width: 60px;
}

.tip {
  font-size: 12px;
  color: #1e88e5;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 12px;
  margin-left: auto;
}

.image-wrapper {
  padding: 20px;
  background: 
    linear-gradient(90deg, #f1f5f9 1px, transparent 1px),
    linear-gradient(#f1f5f9 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: #ffffff;
  overflow: hidden;
  min-height: 580px;
  max-height: 650px;
  cursor: grab;
  position: relative;

  &:active {
    cursor: grabbing;
  }
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 540px;
  transition: transform 0.08s ease-out;
}

.product-image {
  max-width: 100%;
  max-height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  user-select: none;
  pointer-events: none;
}

.loading-placeholder {
  width: 100%;
  height: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 16px;
}

.loading-spinner {
  font-size: 18px;
  color: #1e88e5;
}

.error-text {
  color: #e53935;
  margin-bottom: 12px;
}

.path-text {
  font-size: 12px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
