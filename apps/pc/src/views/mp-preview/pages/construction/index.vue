<template>
  <div class="mp-page index">
    <div class="page-header">
      <div class="header-left">
        <div class="user-info">
          <div class="user-avatar">
            <icon-user />
          </div>
          <div class="user-text">
            <div class="greeting">您好，{{ userInfo.name }}</div>
            <div class="company">{{ userInfo.company }}</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="message-btn" @click="handleMessage">
          <icon-message />
          <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <div class="stats-card">
        <div class="stats-header">
          <span class="stats-title">项目概览</span>
          <span class="stats-more" @click="$emit('navigate', 'project-list')">查看全部</span>
        </div>
        <div class="stats-grid">
          <div class="stats-item" @click="$emit('navigate', 'project-list')">
            <div class="stats-value primary">{{ stats.ongoing }}</div>
            <div class="stats-label">进行中项目</div>
          </div>
          <div class="stats-item" @click="$emit('navigate', 'project-list')">
            <div class="stats-value success">{{ stats.completed }}</div>
            <div class="stats-label">已完成项目</div>
          </div>
          <div class="stats-item" @click="$emit('navigate', 'order')">
            <div class="stats-value warning">{{ stats.pendingOrder }}</div>
            <div class="stats-label">待处理订单</div>
          </div>
          <div class="stats-item" @click="$emit('navigate', 'site-stock')">
            <div class="stats-value danger">{{ stats.stockWarning }}</div>
            <div class="stats-label">库存预警</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="quick-section">
      <div class="section-title">快捷操作</div>
      <div class="quick-grid">
        <div class="quick-item" @click="$emit('navigate', 'project-create')">
          <div class="quick-icon">
            <icon-plus-circle />
          </div>
          <span>新建项目</span>
        </div>
        <div class="quick-item" @click="$emit('navigate', 'market')">
          <div class="quick-icon">
            <icon-shopping-cart />
          </div>
          <span>发起采购</span>
        </div>
        <div class="quick-item" @click="$emit('navigate', 'site-stock')">
          <div class="quick-icon">
            <icon-storage />
          </div>
          <span>现场库存</span>
        </div>
        <div class="quick-item" @click="$emit('navigate', 'order')">
          <div class="quick-icon">
            <icon-file />
          </div>
          <span>订单管理</span>
        </div>
      </div>
    </div>
    
    <div class="project-section">
      <div class="section-header">
        <span class="section-title">进行中项目</span>
        <span class="section-more" @click="$emit('navigate', 'project-list')">更多</span>
      </div>
      <div class="project-list">
        <div class="project-item" v-for="item in projects" :key="item.id" @click="$emit('navigate', 'project-detail')">
          <div class="project-header">
            <div class="project-name">{{ item.storeName }}</div>
            <div class="project-status ongoing">进行中</div>
          </div>
          <div class="project-brand">{{ item.brand }}</div>
          <div class="project-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
            <div class="progress-text">{{ item.progress }}%</div>
          </div>
          <div class="project-info">
            <span>预算: ¥{{ item.budget }}</span>
            <span>已下单: ¥{{ item.ordered }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item active">
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
      <div class="tabbar-item" @click="$emit('navigate', 'mine')">
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

const unreadCount = ref(3)

const stats = ref({
  ongoing: 3,
  completed: 2,
  pendingOrder: 5,
  stockWarning: 2
})

const projects = ref([
  {
    id: 1,
    storeName: '星巴克深圳万象城店',
    brand: '星巴克',
    progress: 57,
    budget: '150,000',
    ordered: '85,000'
  },
  {
    id: 2,
    storeName: '喜茶广州天河城店',
    brand: '喜茶',
    progress: 38,
    budget: '120,000',
    ordered: '45,000'
  },
  {
    id: 3,
    storeName: '瑞幸咖啡东莞万达店',
    brand: '瑞幸咖啡',
    progress: 25,
    budget: '80,000',
    ordered: '20,000'
  }
])

function handleMessage() {
  console.log('消息中心')
}
</script>

<style lang="scss" scoped>
.index {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #165dff, #4080ff);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 16px 12px;
  z-index: 100;
  
  .header-left {
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .user-avatar {
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 18px;
      }
      
      .user-text {
        .greeting {
          font-size: 14px;
          color: #fff;
          font-weight: 500;
        }
        
        .company {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
  
  .header-right {
    .message-btn {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      position: relative;
      
      .badge {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        background: #f53f3f;
        border-radius: 50%;
        font-size: 10px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.stats-section {
  padding: 70px 12px 12px;
}

.stats-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .stats-title {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .stats-more {
      font-size: 12px;
      color: #165dff;
    }
  }
  
  .stats-grid {
    display: flex;
    justify-content: space-between;
    
    .stats-item {
      text-align: center;
      
      .stats-value {
        font-size: 22px;
        font-weight: 600;
        color: #1d2129;
        
        &.primary {
          color: #165dff;
        }
        
        &.success {
          color: #00b42a;
        }
        
        &.warning {
          color: #ff7d00;
        }
        
        &.danger {
          color: #f53f3f;
        }
      }
      
      .stats-label {
        font-size: 11px;
        color: #86909c;
        margin-top: 4px;
      }
    }
  }
}

.quick-section {
  padding: 0 12px;
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
  }
  
  .quick-grid {
    display: flex;
    background: #fff;
    border-radius: 8px;
    padding: 16px 0;
    
    .quick-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      
      .quick-icon {
        width: 40px;
        height: 40px;
        background: #e8f3ff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #165dff;
        font-size: 20px;
      }
      
      span {
        font-size: 12px;
        color: #4e5969;
      }
    }
  }
}

.project-section {
  padding: 12px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .section-more {
      font-size: 12px;
      color: #165dff;
    }
  }
  
  .project-list {
    .project-item {
      background: #fff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      
      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        
        .project-name {
          font-size: 15px;
          font-weight: 500;
          color: #1d2129;
        }
        
        .project-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          
          &.ongoing {
            background: #e8f3ff;
            color: #165dff;
          }
        }
      }
      
      .project-brand {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 10px;
      }
      
      .project-progress {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        
        .progress-bar {
          flex: 1;
          height: 6px;
          background: #f2f3f5;
          border-radius: 3px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #165dff, #4080ff);
            border-radius: 3px;
          }
        }
        
        .progress-text {
          font-size: 12px;
          color: #165dff;
          font-weight: 500;
        }
      }
      
      .project-info {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #86909c;
      }
    }
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
