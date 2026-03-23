<template>
  <div class="phone-simulator">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="status-bar">
          <span class="time">{{ currentTime }}</span>
          <div class="status-icons">
            <icon-mobile />
            <icon-wifi />
            <icon-battery-charge />
          </div>
        </div>
        <div class="content-area">
          <slot></slot>
        </div>
        <div class="home-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')

function updateTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

let timer: number

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.phone-simulator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.phone-frame {
  width: 375px;
  height: 812px;
  background: #1a1a1a;
  border-radius: 50px;
  padding: 12px;
  box-shadow: 
    0 0 0 3px #333,
    0 0 0 6px #1a1a1a,
    0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
}

.phone-notch {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 30px;
  background: #1a1a1a;
  border-radius: 0 0 20px 20px;
  z-index: 10;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: #f7f8fa;
  border-radius: 40px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: 44px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  flex-shrink: 0;
  
  .time {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
  }
  
  .status-icons {
    display: flex;
    gap: 4px;
    font-size: 14px;
    color: #1d2129;
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  transform: translateZ(0);
  
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

.home-indicator {
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  
  &::after {
    content: '';
    width: 134px;
    height: 5px;
    background: #1d2129;
    border-radius: 3px;
  }
}
</style>
