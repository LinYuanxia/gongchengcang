<template>
  <view class="page">
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'all' }"
        @click="currentTab = 'all'"
      >
        全部
        <view class="badge" v-if="unreadCount.all > 0">{{ unreadCount.all }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'order' }"
        @click="currentTab = 'order'"
      >
        订单消息
        <view class="badge" v-if="unreadCount.order > 0">{{ unreadCount.order }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'system' }"
        @click="currentTab = 'system'"
      >
        系统通知
        <view class="badge" v-if="unreadCount.system > 0">{{ unreadCount.system }}</view>
      </view>
    </view>

    <view class="message-list">
      <view class="message-item" v-for="item in filteredMessages" :key="item.id" @click="handleRead(item)">
        <view class="message-icon" :class="item.type">
          <text>{{ getTypeIcon(item.type) }}</text>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ item.title }}</text>
            <text class="message-time">{{ item.time }}</text>
          </view>
          <text class="message-text" :class="{ unread: !item.isRead }">{{ item.content }}</text>
          <view class="message-footer" v-if="item.actionText">
            <text class="action-link" @click.stop="handleAction(item)">{{ item.actionText }}</text>
          </view>
        </view>
        <view class="unread-dot" v-if="!item.isRead"></view>
      </view>
    </view>

    <view class="empty-state" v-if="filteredMessages.length === 0">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无消息</text>
    </view>

    <view class="mark-all-btn" v-if="hasUnread" @click="handleMarkAll">
      <text class="mark-text">全部标记已读</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref('all')

const unreadCount = ref({
  all: 5,
  order: 3,
  system: 2,
})

const messages = ref([
  {
    id: 'm1',
    type: 'order',
    title: '新订单提醒',
    content: '您有1个新订单待发货，订单号：SO2024010012，客户：深圳建设集团',
    time: '10分钟前',
    isRead: false,
    actionText: '立即处理',
    actionUrl: '/pages/order/ship?id=so001',
  },
  {
    id: 'm2',
    type: 'stock',
    title: '库存预警',
    content: '商品"螺纹钢 HRB400 16mm"库存不足，当前库存：50吨，请及时补货',
    time: '1小时前',
    isRead: false,
    actionText: '立即采购',
    actionUrl: '/pages/market/index',
  },
  {
    id: 'm3',
    type: 'finance',
    title: '收款到账',
    content: '您收到一笔货款，金额：¥21,000.00，来自订单：SO2024010011',
    time: '2小时前',
    isRead: false,
    actionText: '查看详情',
    actionUrl: '/pages/mine/custody',
  },
  {
    id: 'm4',
    type: 'system',
    title: '系统升级通知',
    content: '系统将于今晚22:00-24:00进行升级维护，届时部分功能可能无法使用，请提前做好准备',
    time: '今天 09:00',
    isRead: true,
  },
  {
    id: 'm5',
    type: 'invoice',
    title: '发票开具成功',
    content: '您申请的发票已开具成功，发票金额：¥4,500.00，购买方：深圳建设集团',
    time: '昨天 16:30',
    isRead: false,
    actionText: '查看发票',
    actionUrl: '/pages/mine/invoice',
  },
  {
    id: 'm6',
    type: 'system',
    title: '账户安全提醒',
    content: '检测到您的账号在新设备登录，如非本人操作，请及时修改密码',
    time: '昨天 14:20',
    isRead: true,
    actionText: '修改密码',
    actionUrl: '/pages/mine/settings',
  },
])

const hasUnread = computed(() => messages.value.some(m => !m.isRead))

const filteredMessages = computed(() => {
  if (currentTab.value === 'all') return messages.value
  if (currentTab.value === 'order') {
    return messages.value.filter(m => ['order', 'stock', 'finance', 'invoice'].includes(m.type))
  }
  return messages.value.filter(m => m.type === 'system')
})

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    order: '📦',
    stock: '📊',
    finance: '💰',
    invoice: '📄',
    system: '🔔',
  }
  return icons[type] || '📢'
}

function handleRead(item: any) {
  if (!item.isRead) {
    item.isRead = true
    updateUnreadCount()
  }
}

function handleAction(item: any) {
  if (item.actionUrl) {
    uni.navigateTo({ url: item.actionUrl })
  }
}

function handleMarkAll() {
  messages.value.forEach(m => m.isRead = true)
  unreadCount.value = { all: 0, order: 0, system: 0 }
  uni.showToast({ title: '已全部标记已读', icon: 'success' })
}

function updateUnreadCount() {
  const all = messages.value.filter(m => !m.isRead).length
  const order = messages.value.filter(m => !m.isRead && ['order', 'stock', 'finance', 'invoice'].includes(m.type)).length
  const system = messages.value.filter(m => !m.isRead && m.type === 'system').length
  unreadCount.value = { all, order, system }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background-color: #165dff;
      border-radius: 2rpx;
    }
  }
  
  .badge {
    position: absolute;
    top: 16rpx;
    left: 60%;
    min-width: 28rpx;
    height: 28rpx;
    background: #f53f3f;
    border-radius: 14rpx;
    font-size: 18rpx;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6rpx;
  }
}

.message-list {
  padding: 24rpx 32rpx;
}

.message-item {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  position: relative;
}

.message-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
  
  &.order {
    background-color: #e8f3ff;
  }
  
  &.stock {
    background-color: #fff7e8;
  }
  
  &.finance {
    background-color: #e8ffea;
  }
  
  &.invoice {
    background-color: #f2e8ff;
  }
  
  &.system {
    background-color: #f7f8fa;
  }
}

.message-content {
  flex: 1;
  margin-left: 16rpx;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.message-time {
  font-size: 22rpx;
  color: #86909c;
}

.message-text {
  font-size: 26rpx;
  color: #86909c;
  display: block;
  line-height: 1.6;
  
  &.unread {
    color: #1d2129;
  }
}

.message-footer {
  margin-top: 12rpx;
}

.action-link {
  font-size: 26rpx;
  color: #165dff;
}

.unread-dot {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #f53f3f;
  border-radius: 50%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}

.mark-all-btn {
  position: fixed;
  bottom: 32rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 20rpx 48rpx;
  background-color: #fff;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.mark-text {
  font-size: 28rpx;
  color: #165dff;
}
</style>
