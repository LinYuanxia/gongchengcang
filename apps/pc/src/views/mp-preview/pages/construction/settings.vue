<template>
  <div class="mp-page settings">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">设置</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="settings-list">
      <div class="settings-section">
        <div class="section-title">账号安全</div>
        <div class="settings-item" @click="$emit('navigate', 'change-password')">
          <div class="item-left">
            <icon-lock class="item-icon" />
            <span class="item-text">修改密码</span>
          </div>
          <icon-right class="item-arrow" />
        </div>
        <div class="settings-item">
          <div class="item-left">
            <icon-safe class="item-icon" />
            <span class="item-text">指纹登录</span>
          </div>
          <div class="item-switch" :class="{ active: fingerprintEnabled }" @click="fingerprintEnabled = !fingerprintEnabled">
            <div class="switch-dot"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <div class="section-title">消息通知</div>
        <div class="settings-item">
          <div class="item-left">
            <icon-notification class="item-icon" />
            <span class="item-text">订单消息推送</span>
          </div>
          <div class="item-switch" :class="{ active: orderNotify }" @click="orderNotify = !orderNotify">
            <div class="switch-dot"></div>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-left">
            <icon-message class="item-icon" />
            <span class="item-text">系统通知推送</span>
          </div>
          <div class="item-switch" :class="{ active: systemNotify }" @click="systemNotify = !systemNotify">
            <div class="switch-dot"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <div class="section-title">其他</div>
        <div class="settings-item" @click="$emit('navigate', 'about')">
          <div class="item-left">
            <icon-info-circle class="item-icon" />
            <span class="item-text">关于我们</span>
          </div>
          <div class="item-right">
            <span class="item-extra">v1.0.0</span>
            <icon-right class="item-arrow" />
          </div>
        </div>
        <div class="settings-item" @click="handleClearCache">
          <div class="item-left">
            <icon-delete class="item-icon" />
            <span class="item-text">清除缓存</span>
          </div>
          <div class="item-right">
            <span class="item-extra">{{ cacheSize }}</span>
            <icon-right class="item-arrow" />
          </div>
        </div>
      </div>
      
      <div class="logout-btn" @click="handleLogout">
        退出登录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate', 'logout'])

const fingerprintEnabled = ref(false)
const orderNotify = ref(true)
const systemNotify = ref(true)
const cacheSize = ref('23.5MB')

function handleClearCache() {
  console.log('清除缓存')
  cacheSize.value = '0MB'
}

function handleLogout() {
  emit('logout')
}
</script>

<style lang="scss" scoped>
.settings {
  background: #f5f5f5;
  min-height: 100%;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-back {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
  
  .header-placeholder {
    width: 32px;
  }
}

.settings-list {
  padding: 54px 12px 12px;
}

.settings-section {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  
  .section-title {
    font-size: 12px;
    color: #86909c;
    padding: 12px 12px 8px;
  }
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  border-bottom: 1px solid #f2f3f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .item-icon {
      font-size: 20px;
      color: #165dff;
    }
    
    .item-text {
      font-size: 14px;
      color: #1d2129;
    }
  }
  
  .item-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .item-extra {
      font-size: 13px;
      color: #86909c;
    }
    
    .item-arrow {
      color: #c9cdd4;
    }
  }
  
  .item-switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: #c9cdd4;
    position: relative;
    transition: background 0.2s;
    
    &.active {
      background: #165dff;
      
      .switch-dot {
        left: 22px;
      }
    }
    
    .switch-dot {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.2s;
    }
  }
}

.logout-btn {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  text-align: center;
  font-size: 15px;
  color: #f53f3f;
  margin-top: 24px;
}
</style>
