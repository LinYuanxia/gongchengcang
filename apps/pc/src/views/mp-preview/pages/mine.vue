<template>
  <div class="mp-page">
    <div class="user-header">
      <div class="user-info">
        <img src="https://picsum.photos/100/100?random=avatar" class="avatar" />
        <div class="user-detail">
          <span class="user-name">张三</span>
          <span class="user-phone">138****8000</span>
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="menu-item" @click="$emit('navigate', 'order')">
        <icon-file class="menu-icon" />
        <span class="menu-text">我的订单</span>
        <icon-right class="menu-arrow" />
      </div>
      <div class="menu-item">
        <icon-location class="menu-icon" />
        <span class="menu-text">收货地址</span>
        <icon-right class="menu-arrow" />
      </div>
      <div class="menu-item">
        <icon-heart class="menu-icon" />
        <span class="menu-text">我的收藏</span>
        <icon-right class="menu-arrow" />
      </div>
    </div>
    
    <div class="menu-section">
      <div class="menu-item">
        <icon-user class="menu-icon" />
        <span class="menu-text">账户信息</span>
        <icon-right class="menu-arrow" />
      </div>
      <div class="menu-item">
        <icon-settings class="menu-icon" />
        <span class="menu-text">系统设置</span>
        <icon-right class="menu-arrow" />
      </div>
      <div class="menu-item">
        <icon-question-circle class="menu-icon" />
        <span class="menu-text">帮助中心</span>
        <icon-right class="menu-arrow" />
      </div>
    </div>
    
    <div class="logout-btn" @click="$emit('logout')">退出登录</div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>首页</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>市场</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'cart')">
        <icon-shopping-cart />
        <span>购物车</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'order')">
        <icon-file />
        <span>订单</span>
      </div>
      <div class="tabbar-item active">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['navigate', 'logout'])
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 50px;
  position: relative;
}

.user-header {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 30px 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-detail {
  margin-left: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  display: block;
}

.user-phone {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  display: block;
}

.menu-section {
  background-color: #fff;
  margin: 12px 16px;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 20px;
  color: #165dff;
  margin-right: 12px;
}

.menu-text {
  flex: 1;
  font-size: 14px;
  color: #1d2129;
}

.menu-arrow {
  font-size: 16px;
  color: #c9cdd4;
}

.logout-btn {
  margin: 30px 16px;
  padding: 12px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  font-size: 14px;
  color: #f53f3f;
}

.tabbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  border-top: 1px solid #e5e6eb;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #86909c;
  
  &.active {
    color: #165dff;
  }
  
  :deep(.arco-icon) {
    font-size: 20px;
    margin-bottom: 2px;
  }
}
</style>
