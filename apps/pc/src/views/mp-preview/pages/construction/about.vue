<template>
  <div class="mp-page about">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'settings')">
        <icon-left />
      </div>
      <div class="header-title">关于我们</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="about-content">
      <div class="app-logo">
        <icon-apps class="logo-icon" />
      </div>
      <div class="app-name">工程仓施工方端</div>
      <div class="app-version">版本号: v1.0.0</div>
      
      <div class="info-card">
        <div class="info-item" @click="handleProtocol">
          <span class="info-text">用户协议</span>
          <icon-right class="info-arrow" />
        </div>
        <div class="info-item" @click="handlePrivacy">
          <span class="info-text">隐私政策</span>
          <icon-right class="info-arrow" />
        </div>
      </div>
      
      <div class="copyright">
        <p>Copyright © 2024 工程仓</p>
        <p>All Rights Reserved</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['navigate'])

function handleProtocol() {
  console.log('查看用户协议')
}

function handlePrivacy() {
  console.log('查看隐私政策')
}
</script>

<style lang="scss" scoped>
.about {
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

.about-content {
  padding: 54px 12px 12px;
  text-align: center;
  
  .app-logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px auto 16px;
    
    .logo-icon {
      font-size: 40px;
      color: #fff;
    }
  }
  
  .app-name {
    font-size: 18px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 8px;
  }
  
  .app-version {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 32px;
  }
}

.info-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 24px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid #f2f3f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-text {
      font-size: 14px;
      color: #1d2129;
    }
    
    .info-arrow {
      color: #c9cdd4;
    }
  }
}

.copyright {
  margin-top: 60px;
  font-size: 12px;
  color: #c9cdd4;
  line-height: 1.8;
}
</style>
