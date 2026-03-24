<template>
  <div class="mp-page mine">
    <div class="page-header">
      <div class="header-title">我的</div>
      <div class="header-action" @click="$emit('navigate', 'settings')">
        <icon-settings />
      </div>
    </div>
    
    <div class="user-card">
      <div class="user-info">
        <div class="user-avatar">
          <icon-user />
        </div>
        <div class="user-detail">
          <div class="user-name">{{ userInfo.name }}</div>
          <div class="user-company">{{ userInfo.company }}</div>
        </div>
      </div>
      <div class="user-verify">
        <icon-check-circle-fill class="verify-icon" />
        <span>已认证</span>
      </div>
    </div>
    
    <div class="stats-card">
      <div class="stat-item" @click="$emit('navigate', 'project-list')">
        <div class="stat-value">{{ stats.ongoingProjects }}</div>
        <div class="stat-label">进行中项目</div>
      </div>
      <div class="stat-item" @click="$emit('navigate', 'order')">
        <div class="stat-value">{{ stats.pendingOrders }}</div>
        <div class="stat-label">待处理订单</div>
      </div>
      <div class="stat-item" @click="$emit('navigate', 'site-stock')">
        <div class="stat-value">{{ stats.stockWarning }}</div>
        <div class="stat-label">库存预警</div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="section-title">项目管理</div>
      <div class="menu-list">
        <div class="menu-item" @click="$emit('navigate', 'project-list')">
          <icon-folder class="menu-icon" />
          <span class="menu-text">项目列表</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="$emit('navigate', 'site-stock')">
          <icon-storage class="menu-icon" />
          <span class="menu-text">现场库存</span>
          <icon-right class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="section-title">资金管理</div>
      <div class="menu-list">
        <div class="menu-item" @click="handleFund">
          <icon-wallet class="menu-icon" />
          <span class="menu-text">账户余额</span>
          <span class="menu-extra">¥{{ balance }}</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="handleTransaction">
          <icon-file-text class="menu-icon" />
          <span class="menu-text">交易明细</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="handleInvoice">
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
        <div class="menu-item" @click="handleMessage">
          <icon-message class="menu-icon" />
          <span class="menu-text">消息中心</span>
          <span class="menu-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
          <icon-right class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="section-title">其他</div>
      <div class="menu-list">
        <div class="menu-item" @click="$emit('navigate', 'settings')">
          <icon-settings class="menu-icon" />
          <span class="menu-text">设置</span>
          <icon-right class="menu-arrow" />
        </div>
        <div class="menu-item" @click="handleAbout">
          <icon-info-circle class="menu-icon" />
          <span class="menu-text">关于我们</span>
          <icon-right class="menu-arrow" />
        </div>
      </div>
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

const emit = defineEmits(['navigate'])

const userInfo = ref({
  name: '张三',
  company: '深圳市建筑工程有限公司'
})

const stats = ref({
  ongoingProjects: 3,
  pendingOrders: 5,
  stockWarning: 2
})

const balance = ref('125,680.00')
const unreadCount = ref(3)

function handleFund() {
  emit('navigate', 'fund-management')
}

function handleTransaction() {
  emit('navigate', 'transaction')
}

function handleInvoice() {
  emit('navigate', 'invoice-manage')
}

function handleMessage() {
  emit('navigate', 'message-center')
}

function handleAbout() {
  emit('navigate', 'about')
}
</script>

<style lang="scss" scoped>
.mine {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
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
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
  
  .header-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
}

.user-card {
  margin: 54px 12px 12px;
  background: linear-gradient(135deg, #165dff, #4080ff);
  border-radius: 8px;
  padding: 16px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-avatar {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .user-detail {
      .user-name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .user-company {
        font-size: 12px;
        opacity: 0.9;
      }
    }
  }
  
  .user-verify {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 4px;
    
    .verify-icon {
      color: #00b42a;
    }
  }
}

.stats-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 0 12px 12px;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .stat-label {
      font-size: 11px;
      color: #86909c;
      margin-top: 4px;
    }
  }
}

.menu-section {
  margin: 0 12px 12px;
  
  .section-title {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 8px;
    padding-left: 4px;
  }
}

.menu-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f2f3f5;
  
  &:last-child {
    border-bottom: none;
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
  
  .menu-extra {
    font-size: 13px;
    color: #f53f3f;
    margin-right: 8px;
  }
  
  .menu-badge {
    background: #f53f3f;
    color: #fff;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    margin-right: 8px;
  }
  
  .menu-arrow {
    color: #c9cdd4;
  }
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
