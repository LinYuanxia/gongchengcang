<template>
  <div class="mp-page message-center">
    <div class="page-header">
      <div class="header-title">消息中心</div>
      <div class="header-action" @click="handleReadAll">
        <icon-check />
        <span>全部已读</span>
      </div>
    </div>
    
    <div class="message-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
        <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'order' }"
        @click="activeTab = 'order'"
      >
        订单消息
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'stock' }"
        @click="activeTab = 'stock'"
      >
        库存消息
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'system' }"
        @click="activeTab = 'system'"
      >
        系统消息
      </div>
    </div>
    
    <div class="message-list">
      <div class="message-item" v-for="item in filteredMessages" :key="item.id" @click="handleRead(item)">
        <div class="message-icon" :class="item.type">
          <icon-file v-if="item.type === 'order'" />
          <icon-storage v-else-if="item.type === 'stock'" />
          <icon-notification v-else />
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-title">{{ item.title }}</span>
            <span class="message-time">{{ item.time }}</span>
          </div>
          <div class="message-desc">{{ item.desc }}</div>
        </div>
        <div class="message-unread" v-if="!item.isRead"></div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>采购市场</span>
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
import { ref, computed } from 'vue'

defineEmits(['navigate'])

const activeTab = ref('all')

const messages = ref([
  {
    id: 1,
    type: 'order',
    title: '待发货提醒',
    desc: '您有12笔订单待发货，请及时处理',
    time: '10分钟前',
    isRead: false
  },
  {
    id: 2,
    type: 'stock',
    title: '库存预警',
    desc: '水泥P.O 42.5库存不足，当前库存50吨',
    time: '1小时前',
    isRead: false
  },
  {
    id: 3,
    type: 'order',
    title: '采购订单状态',
    desc: '采购订单PO2024010001已发货',
    time: '2小时前',
    isRead: true
  },
  {
    id: 4,
    type: 'system',
    title: '系统通知',
    desc: '您的账户已通过实名认证',
    time: '3小时前',
    isRead: true
  },
  {
    id: 5,
    type: 'order',
    title: '收款到账',
    desc: '销售订单SO2024010010已收款¥21,000',
    time: '5小时前',
    isRead: true
  },
  {
    id: 6,
    type: 'stock',
    title: '入库提醒',
    desc: '采购订单PO2024010002已入库完成',
    time: '昨天 16:30',
    isRead: true
  }
])

const unreadCount = computed(() => {
  return messages.value.filter(m => !m.isRead).length
})

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') {
    return messages.value
  }
  return messages.value.filter(m => m.type === activeTab.value)
})

function handleReadAll() {
  messages.value.forEach(m => m.isRead = true)
}

function handleRead(item: any) {
  item.isRead = true
  console.log('查看消息:', item.title)
}
</script>

<style lang="scss" scoped>
.message-center {
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
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #165dff;
  }
}

.message-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  margin-top: 44px;
  border-bottom: 1px solid #eee;
  
  .tab-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
    position: relative;
    
    &.active {
      color: #165dff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #165dff;
        border-radius: 1px;
      }
    }
    
    .badge {
      position: absolute;
      top: 6px;
      right: 4px;
      min-width: 16px;
      height: 16px;
      background: #f53f3f;
      border-radius: 8px;
      font-size: 10px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  }
}

.message-list {
  padding: 12px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  position: relative;
}

.message-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
  
  &.order {
    background: #e8f3ff;
    color: #165dff;
  }
  
  &.stock {
    background: #fff7e8;
    color: #ff7d00;
  }
  
  &.system {
    background: #f2e8ff;
    color: #722ed1;
  }
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.message-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.message-time {
  font-size: 11px;
  color: #86909c;
}

.message-desc {
  font-size: 13px;
  color: #86909c;
  line-height: 1.5;
}

.message-unread {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: #f53f3f;
  border-radius: 50%;
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
