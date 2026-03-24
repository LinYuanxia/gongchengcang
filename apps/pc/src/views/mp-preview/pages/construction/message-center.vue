<template>
  <div class="mp-page message-center">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">消息中心</div>
      <div class="header-action" @click="handleReadAll">
        全部已读
      </div>
    </div>
    
    <div class="message-tabs">
      <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        全部
        <span class="badge" v-if="unreadCount.all > 0">{{ unreadCount.all }}</span>
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'order' }" @click="activeTab = 'order'">
        订单消息
        <span class="badge" v-if="unreadCount.order > 0">{{ unreadCount.order }}</span>
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'system' }" @click="activeTab = 'system'">
        系统通知
        <span class="badge" v-if="unreadCount.system > 0">{{ unreadCount.system }}</span>
      </div>
    </div>
    
    <div class="message-list">
      <div class="message-item" v-for="item in filteredMessages" :key="item.id" @click="handleDetail(item)">
        <div class="message-icon" :class="item.type">
          <icon-file v-if="item.type === 'order'" />
          <icon-notification v-else />
        </div>
        <div class="message-content">
          <div class="message-header">
            <div class="message-title">{{ item.title }}</div>
            <div class="message-time">{{ item.time }}</div>
          </div>
          <div class="message-desc">{{ item.content }}</div>
          <div class="message-tag" v-if="!item.read">未读</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeTab = ref('all')

const messages = ref([
  { id: 1, type: 'order', title: '订单发货通知', content: '您的订单PO20240115001已发货，请注意查收', time: '10:30', read: false },
  { id: 2, type: 'order', title: '订单支付成功', content: '订单PO20240115001支付成功，金额¥35,000.00', time: '09:15', read: false },
  { id: 3, type: 'system', title: '账户安全提醒', content: '您的账户于今日在新设备登录，如非本人操作请及时修改密码', time: '昨天', read: false },
  { id: 4, type: 'order', title: '订单确认收货', content: '订单PO20240112001已确认收货', time: '昨天', read: true },
  { id: 5, type: 'system', title: '系统维护通知', content: '系统将于今晚22:00-23:00进行维护升级，届时部分功能将暂停使用', time: '01-15', read: true },
  { id: 6, type: 'order', title: '退款到账通知', content: '订单PO20240108001退款已到账，金额¥8,500.00', time: '01-14', read: true }
])

const unreadCount = computed(() => ({
  all: messages.value.filter(m => !m.read).length,
  order: messages.value.filter(m => !m.read && m.type === 'order').length,
  system: messages.value.filter(m => !m.read && m.type === 'system').length
}))

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') {
    return messages.value
  }
  return messages.value.filter(m => m.type === activeTab.value)
})

function handleReadAll() {
  messages.value.forEach(m => m.read = true)
}

function handleDetail(item: any) {
  item.read = true
  console.log('查看消息详情:', item.id)
}
</script>

<style lang="scss" scoped>
.message-center {
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
  
  .header-action {
    font-size: 13px;
    color: #165dff;
  }
}

.message-tabs {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 8px 16px;
  gap: 12px;
  border-bottom: 1px solid #e5e6eb;
  z-index: 99;
  
  .tab-item {
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 13px;
    color: #4e5969;
    background: #f2f3f5;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.active {
      background: #165dff;
      color: #fff;
      
      .badge {
        background: #fff;
        color: #165dff;
      }
    }
    
    .badge {
      background: #f53f3f;
      color: #fff;
      font-size: 10px;
      padding: 0 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }
  }
}

.message-list {
  padding: 100px 12px 12px;
}

.message-item {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  
  .message-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.order {
      background: #e8f3ff;
      color: #165dff;
    }
    
    &.system {
      background: #fff7e8;
      color: #ff7d00;
    }
  }
  
  .message-content {
    flex: 1;
    min-width: 0;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .message-title {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .message-time {
        font-size: 11px;
        color: #86909c;
      }
    }
    
    .message-desc {
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .message-tag {
      display: inline-block;
      margin-top: 8px;
      font-size: 11px;
      color: #f53f3f;
      background: #ffece8;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
}
</style>
