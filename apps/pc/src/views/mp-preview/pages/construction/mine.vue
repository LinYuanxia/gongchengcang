<template>
  <div class="mp-page mine">
    <div class="page-header">
      <div class="header-title">我的</div>
      <div class="header-action" @click="$emit('navigate', 'settings')">
        <icon-settings />
      </div>
    </div>
    
    <div class="user-card" @click="$emit('navigate', 'merchant-info')">
      <div class="user-info">
        <div class="user-avatar">
          <img src="https://picsum.photos/100/100?random=avatar" alt="" />
        </div>
        <div class="user-detail">
          <div class="user-name">{{ userInfo.name }}</div>
          <div class="user-phone">{{ userInfo.phone }}</div>
        </div>
      </div>
      <icon-right class="arrow-icon" />
    </div>
    
    <div class="merchant-card" @click="$emit('navigate', 'merchant-info')">
      <div class="merchant-header">
        <icon-building class="merchant-icon" />
        <span class="merchant-title">商户信息</span>
      </div>
      <div class="merchant-info">
        <div class="info-row">
          <span class="label">商户名称</span>
          <span class="value">{{ merchantInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">门店名称</span>
          <span class="value">{{ merchantInfo.storeName }}</span>
        </div>
        <div class="info-row">
          <span class="label">门店编码</span>
          <span class="value">{{ merchantInfo.storeCode }}</span>
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="section-title">订单服务</div>
      <div class="menu-list">
        <div class="menu-item" @click="$emit('navigate', 'transaction')">
          <icon-file-text class="menu-icon" />
          <span class="menu-text">支付记录</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$emit('navigate', 'invoice-manage')">
          <icon-file class="menu-icon" />
          <span class="menu-text">发票管理</span>
          <icon-right class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="section-title">常用功能</div>
      <div class="menu-list">
        <div class="menu-item" @click="$emit('navigate', 'address-manage')">
          <icon-location class="menu-icon" />
          <span class="menu-text">收货地址</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$emit('navigate', 'invoice-title')">
          <icon-bookmark class="menu-icon" />
          <span class="menu-text">发票抬头</span>
          <icon-right class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="section-title">其他</div>
      <div class="menu-list">
        <div class="menu-item" @click="$emit('navigate', 'settings')">
          <icon-settings class="menu-icon" />
          <span class="menu-text">系统设置</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$emit('navigate', 'change-password')">
          <icon-lock class="menu-icon" />
          <span class="menu-text">修改密码</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="handleAbout">
          <icon-info-circle class="menu-icon" />
          <span class="menu-text">关于我们</span>
          <icon-right class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <div class="logout-btn" @click="handleLogout">
      退出登录
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>商品市场</span>
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
import { ref } from 'vue'

const emit = defineEmits(['navigate', 'logout'])

const userInfo = ref({
  name: '张三',
  phone: '138****8000',
})

const merchantInfo = ref({
  name: '深圳市建筑工程有限公司',
  storeName: '深圳万象城店',
  storeCode: 'CD001',
})

function handleAbout() {
  emit('navigate', 'about')
}

function handleLogout() {
  emit('logout')
}
</script>

<style lang="scss" scoped>
.mine {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 70px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: linear-gradient(135deg, #165dff, #4080ff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }
  
  .header-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
  }
}

.user-card {
  margin: 54px 12px 10px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .user-detail {
      .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .user-phone {
        font-size: 13px;
        color: #86909c;
      }
    }
  }
  
  .arrow-icon {
    color: #c9cdd4;
    font-size: 16px;
  }
}

.merchant-card {
  margin: 0 12px 12px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  
  .merchant-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    
    .merchant-icon {
      color: #165dff;
      font-size: 18px;
    }
    
    .merchant-title {
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
    }
  }
  
  .merchant-info {
    .info-row {
      display: flex;
      padding: 8px 0;
      
      .label {
        width: 80px;
        font-size: 13px;
        color: #86909c;
      }
      
      .value {
        flex: 1;
        font-size: 13px;
        color: #1d2129;
      }
    }
  }
}

.menu-section {
  margin: 0 12px 12px;
  
  .section-title {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 10px;
    padding: 0 4px;
  }
  
  .menu-list {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #f2f3f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .menu-icon {
        width: 20px;
        color: #165dff;
        font-size: 18px;
        margin-right: 10px;
      }
      
      .menu-text {
        flex: 1;
        font-size: 14px;
        color: #1d2129;
      }
      
      .menu-arrow {
        color: #c9cdd4;
        font-size: 16px;
      }
    }
  }
}

.logout-btn {
  margin: 30px 24px;
  height: 44px;
  border: 1px solid #f53f3f;
  color: #f53f3f;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  border-top: 1px solid #e5e6eb;
  z-index: 98;
  
  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #86909c;
    
    svg {
      font-size: 20px;
    }
    
    span {
      font-size: 10px;
    }
    
    &.active {
      color: #165dff;
    }
  }
}
</style>
