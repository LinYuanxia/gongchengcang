<template>
  <view class="page">
    <view class="header">
      <view class="header-top">
        <view class="user-info">
          <image src="https://via.placeholder.com/80" class="avatar" />
          <view class="info">
            <text class="name">{{ userInfo.name }}</text>
            <text class="company">{{ userInfo.company }}</text>
          </view>
        </view>
        <view class="header-actions">
          <view class="action-item" @click="handleMessage">
            <text class="action-icon">🔔</text>
            <view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="data-card">
      <view class="card-header">
        <text class="card-title">数据看板</text>
        <view class="card-tabs">
          <text 
            class="tab-item" 
            :class="{ active: dataTab === 'today' }"
            @click="dataTab = 'today'"
          >今日</text>
          <text 
            class="tab-item" 
            :class="{ active: dataTab === 'week' }"
            @click="dataTab = 'week'"
          >本周</text>
          <text 
            class="tab-item" 
            :class="{ active: dataTab === 'month' }"
            @click="dataTab = 'month'"
          >本月</text>
        </view>
      </view>
      <view class="data-grid">
        <view class="data-item" v-for="item in dashboardData" :key="item.label" @click="handleDataClick(item)">
          <view class="data-icon" :style="{ background: item.bgColor }">
            <text>{{ item.icon }}</text>
          </view>
          <view class="data-content">
            <text class="data-value" :style="{ color: item.color }">{{ item.value }}</text>
            <text class="data-label">{{ item.label }}</text>
            <view class="data-trend" v-if="item.trend">
              <text class="trend-icon" :class="item.trend > 0 ? 'up' : 'down'">{{ item.trend > 0 ? '↑' : '↓' }}</text>
              <text class="trend-value" :class="item.trend > 0 ? 'up' : 'down'">{{ Math.abs(item.trend) }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="quick-tools">
      <view class="section-header">
        <text class="section-title">快捷工具</text>
      </view>
      <view class="tools-grid">
        <view class="tool-item" v-for="item in quickTools" :key="item.id" @click="handleTool(item)">
          <view class="tool-icon" :style="{ background: item.bgColor }">
            <text>{{ item.icon }}</text>
          </view>
          <text class="tool-name">{{ item.name }}</text>
          <view class="tool-badge" v-if="item.badge">{{ item.badge }}</view>
        </view>
      </view>
    </view>

    <view class="notice-section">
      <view class="section-header">
        <text class="section-title">消息通知</text>
        <text class="section-more" @click="handleMessage">查看全部</text>
      </view>
      <view class="notice-tabs">
        <text 
          class="notice-tab" 
          :class="{ active: noticeType === 'all' }"
          @click="noticeType = 'all'"
        >全部</text>
        <text 
          class="notice-tab" 
          :class="{ active: noticeType === 'order' }"
          @click="noticeType = 'order'"
        >订单</text>
        <text 
          class="notice-tab" 
          :class="{ active: noticeType === 'stock' }"
          @click="noticeType = 'stock'"
        >库存</text>
        <text 
          class="notice-tab" 
          :class="{ active: noticeType === 'finance' }"
          @click="noticeType = 'finance'"
        >财务</text>
      </view>
      <view class="notice-list">
        <view class="notice-item" v-for="item in filteredNotices" :key="item.id" @click="handleNotice(item)">
          <view class="notice-icon" :style="{ background: item.bgColor }">
            <text>{{ item.icon }}</text>
          </view>
          <view class="notice-content">
            <view class="notice-title">
              <text class="title-text">{{ item.title }}</text>
              <text class="notice-time">{{ item.time }}</text>
            </view>
            <text class="notice-desc">{{ item.desc }}</text>
            <view class="notice-action" v-if="item.actionText">
              <text class="action-text">{{ item.actionText }}</text>
              <text class="action-arrow">></text>
            </view>
          </view>
          <view class="notice-unread" v-if="!item.isRead"></view>
        </view>
      </view>
    </view>

    <view class="pending-section">
      <view class="section-header">
        <text class="section-title">待处理事项</text>
        <text class="section-count">共{{ totalPending }}项</text>
      </view>
      <view class="pending-list">
        <view class="pending-item" v-for="item in pendingList" :key="item.id" @click="handlePending(item)">
          <view class="pending-left">
            <view class="pending-icon-wrap" :style="{ background: item.bgColor }">
              <text class="pending-icon">{{ item.icon }}</text>
            </view>
            <view class="pending-info">
              <text class="pending-text">{{ item.title }}</text>
              <text class="pending-desc">{{ item.desc }}</text>
            </view>
          </view>
          <view class="pending-right">
            <text class="pending-count">{{ item.count }}</text>
            <text class="pending-arrow">></text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const userInfo = ref({
  name: '张三',
  company: '深圳湾科技园项目仓'
})

const unreadCount = ref(5)
const dataTab = ref('today')
const noticeType = ref('all')

const dashboardData = computed(() => {
  const data: Record<string, any[]> = {
    today: [
      { label: '今日订单', value: '28', color: '#165dff', bgColor: '#e8f3ff', icon: '📋', trend: 12 },
      { label: '今日销售额', value: '¥58,920', color: '#00b42a', bgColor: '#e8ffea', icon: '💰', trend: 8 },
      { label: '待发货', value: '12', color: '#ff7d00', bgColor: '#fff7e8', icon: '📦', trend: 0 },
      { label: '待处理售后', value: '3', color: '#f53f3f', bgColor: '#ffece8', icon: '🔄', trend: -5 },
      { label: '待开票', value: '8', color: '#722ed1', bgColor: '#f2e8ff', icon: '📄', trend: 0 },
      { label: '低库存预警', value: '5', color: '#f53f3f', bgColor: '#ffece8', icon: '⚠️', trend: 0 },
    ],
    week: [
      { label: '本周订单', value: '186', color: '#165dff', bgColor: '#e8f3ff', icon: '📋', trend: 15 },
      { label: '本周销售额', value: '¥398,520', color: '#00b42a', bgColor: '#e8ffea', icon: '💰', trend: 22 },
      { label: '待发货', value: '12', color: '#ff7d00', bgColor: '#fff7e8', icon: '📦', trend: 0 },
      { label: '待处理售后', value: '3', color: '#f53f3f', bgColor: '#ffece8', icon: '🔄', trend: 0 },
      { label: '待开票', value: '8', color: '#722ed1', bgColor: '#f2e8ff', icon: '📄', trend: 0 },
      { label: '低库存预警', value: '5', color: '#f53f3f', bgColor: '#ffece8', icon: '⚠️', trend: 0 },
    ],
    month: [
      { label: '本月订单', value: '756', color: '#165dff', bgColor: '#e8f3ff', icon: '📋', trend: 18 },
      { label: '本月销售额', value: '¥1,528,900', color: '#00b42a', bgColor: '#e8ffea', icon: '💰', trend: 25 },
      { label: '待发货', value: '12', color: '#ff7d00', bgColor: '#fff7e8', icon: '📦', trend: 0 },
      { label: '待处理售后', value: '3', color: '#f53f3f', bgColor: '#ffece8', icon: '🔄', trend: 0 },
      { label: '待开票', value: '8', color: '#722ed1', bgColor: '#f2e8ff', icon: '📄', trend: 0 },
      { label: '低库存预警', value: '5', color: '#f53f3f', bgColor: '#ffece8', icon: '⚠️', trend: 0 },
    ],
  }
  return data[dataTab.value]
})

const quickTools = ref([
  { id: 1, name: '扫码发货', icon: '📦', bgColor: '#e8f3ff', badge: '12' },
  { id: 2, name: '发起采购', icon: '🛒', bgColor: '#fff7e8' },
  { id: 3, name: 'BOM采购', icon: '📋', bgColor: '#e8ffea' },
  { id: 4, name: '快速补货', icon: '⚡', bgColor: '#f2e8ff' },
  { id: 5, name: '库存预警', icon: '⚠️', bgColor: '#ffece8', badge: '5' },
  { id: 6, name: '收货入库', icon: '📥', bgColor: '#e8fff3', badge: '3' },
  { id: 7, name: '扫码入库', icon: '📷', bgColor: '#f0f5ff' },
  { id: 8, name: '更多功能', icon: '⋯', bgColor: '#f7f8fa' },
])

const notices = ref([
  { id: 1, type: 'order', title: '待发货提醒', desc: '您有12笔订单待发货，请及时处理', time: '10分钟前', icon: '📦', bgColor: '#e8f3ff', actionText: '立即处理', isRead: false },
  { id: 2, type: 'stock', title: '库存预警', desc: '水泥P.O 42.5库存不足，当前库存50吨，低于预警线', time: '1小时前', icon: '⚠️', bgColor: '#ffece8', actionText: '立即补货', isRead: false },
  { id: 3, type: 'order', title: '采购订单状态', desc: '采购订单PO2024010001已发货，预计明日到达', time: '2小时前', icon: '🚚', bgColor: '#e8ffea', actionText: '查看详情', isRead: true },
  { id: 4, type: 'finance', title: '开票提醒', desc: '销售订单SO2024010012待开票，金额¥4,500.00', time: '3小时前', icon: '📄', bgColor: '#fff7e8', actionText: '去开票', isRead: true },
  { id: 5, type: 'finance', title: '收款到账', desc: '销售订单SO2024010010已收款¥21,000.00', time: '5小时前', icon: '💰', bgColor: '#e8ffea', isRead: true },
  { id: 6, type: 'stock', title: '入库完成', desc: '采购订单PO2024010002已入库完成，共10吨', time: '昨天', icon: '📥', bgColor: '#e8fff3', isRead: true },
])

const filteredNotices = computed(() => {
  if (noticeType.value === 'all') return notices.value
  return notices.value.filter(n => n.type === noticeType.value)
})

const pendingList = ref([
  { id: 1, title: '待发货订单', desc: '需要尽快处理发货', count: 12, icon: '📦', bgColor: '#e8f3ff' },
  { id: 2, title: '待确认采购', desc: '供应商已报价待确认', count: 5, icon: '🛒', bgColor: '#fff7e8' },
  { id: 3, title: '待收货入库', desc: '采购订单在途待入库', count: 3, icon: '📥', bgColor: '#e8fff3' },
  { id: 4, title: '待处理售后', desc: '客户申请售后待处理', count: 3, icon: '🔄', bgColor: '#ffece8' },
  { id: 5, title: '待开票订单', desc: '已完成订单待开票', count: 8, icon: '📄', bgColor: '#f2e8ff' },
  { id: 6, title: '库存预警', desc: '商品库存低于预警线', count: 5, icon: '⚠️', bgColor: '#fff1e8' },
])

const totalPending = computed(() => {
  return pendingList.value.reduce((sum, item) => sum + item.count, 0)
})

function handleMessage() {
  uni.navigateTo({ url: '/pages/mine/message' })
}

function handleDataClick(item: any) {
  switch (item.label) {
    case '今日订单':
    case '本周订单':
    case '本月订单':
      uni.navigateTo({ url: '/pages/order/sale' })
      break
    case '待发货':
      uni.navigateTo({ url: '/pages/order/sale?status=toShip' })
      break
    case '待处理售后':
      uni.navigateTo({ url: '/pages/order/sale?status=afterSale' })
      break
    case '待开票':
      uni.navigateTo({ url: '/pages/mine/invoice' })
      break
    case '低库存预警':
      uni.navigateTo({ url: '/pages/mine/stock?filter=warning' })
      break
  }
}

function handleTool(item: any) {
  switch (item.id) {
    case 1:
      uni.navigateTo({ url: '/pages/order/ship' })
      break
    case 2:
      uni.switchTab({ url: '/pages/market/index' })
      break
    case 3:
      uni.navigateTo({ url: '/pages/market/bom' })
      break
    case 4:
      uni.navigateTo({ url: '/pages/mine/stock' })
      break
    case 5:
      uni.navigateTo({ url: '/pages/mine/stock?filter=warning' })
      break
    case 6:
      uni.navigateTo({ url: '/pages/order/receive' })
      break
    case 7:
      uni.scanCode({
        success: (res) => {
          uni.showToast({ title: '扫码成功', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '扫码失败', icon: 'none' })
        },
      })
      break
    case 8:
      uni.showToast({ title: '更多功能开发中', icon: 'none' })
      break
  }
}

function handleNotice(item: any) {
  switch (item.type) {
    case 'order':
      if (item.title === '待发货提醒') {
        uni.navigateTo({ url: '/pages/order/sale?status=toShip' })
      } else if (item.title === '采购订单状态') {
        uni.navigateTo({ url: '/pages/order/purchase' })
      }
      break
    case 'stock':
      if (item.title === '库存预警') {
        uni.navigateTo({ url: '/pages/mine/stock?filter=warning' })
      } else {
        uni.navigateTo({ url: '/pages/mine/stock' })
      }
      break
    case 'finance':
      if (item.title === '开票提醒') {
        uni.navigateTo({ url: '/pages/mine/invoice' })
      } else {
        uni.navigateTo({ url: '/pages/mine/custody' })
      }
      break
  }
}

function handlePending(item: any) {
  switch (item.id) {
    case 1:
      uni.navigateTo({ url: '/pages/order/sale?status=toShip' })
      break
    case 2:
      uni.navigateTo({ url: '/pages/order/purchase?status=toConfirm' })
      break
    case 3:
      uni.navigateTo({ url: '/pages/order/receive' })
      break
    case 4:
      uni.navigateTo({ url: '/pages/order/sale?status=afterSale' })
      break
    case 5:
      uni.navigateTo({ url: '/pages/mine/invoice' })
      break
    case 6:
      uni.navigateTo({ url: '/pages/mine/stock?filter=warning' })
      break
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.header {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 32rpx;
  padding-top: 48rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.info {
  margin-left: 20rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  display: block;
}

.company {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4rpx;
  display: block;
}

.header-actions {
  display: flex;
}

.action-item {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 36rpx;
}

.badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #f53f3f;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.data-card {
  margin: -40rpx 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.card-tabs {
  display: flex;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  padding: 4rpx;
}

.tab-item {
  font-size: 22rpx;
  color: #86909c;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  
  &.active {
    color: #165dff;
    background-color: #fff;
    font-weight: 500;
  }
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.data-item {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.data-content {
  text-align: center;
}

.data-value {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}

.data-label {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.data-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rpx;
  
  .trend-icon {
    font-size: 18rpx;
    margin-right: 2rpx;
    
    &.up { color: #00b42a; }
    &.down { color: #f53f3f; }
  }
  
  .trend-value {
    font-size: 18rpx;
    
    &.up { color: #00b42a; }
    &.down { color: #f53f3f; }
  }
}

.quick-tools {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.section-more {
  font-size: 24rpx;
  color: #165dff;
}

.section-count {
  font-size: 24rpx;
  color: #86909c;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.tool-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 12rpx;
}

.tool-name {
  font-size: 24rpx;
  color: #1d2129;
}

.tool-badge {
  position: absolute;
  top: -8rpx;
  right: 8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #f53f3f;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.notice-section {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.notice-tabs {
  display: flex;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f7f8fa;
  padding-bottom: 16rpx;
}

.notice-tab {
  font-size: 26rpx;
  color: #86909c;
  padding: 8rpx 24rpx;
  margin-right: 16rpx;
  
  &.active {
    color: #165dff;
    font-weight: 500;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -17rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 32rpx;
      height: 4rpx;
      background-color: #165dff;
      border-radius: 2rpx;
    }
  }
}

.notice-list {
  display: flex;
  flex-direction: column;
}

.notice-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
}

.notice-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
  margin-left: 20rpx;
}

.notice-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.notice-time {
  font-size: 22rpx;
  color: #c9cdd4;
}

.notice-desc {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.notice-action {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  
  .action-text {
    font-size: 24rpx;
    color: #165dff;
  }
  
  .action-arrow {
    font-size: 24rpx;
    color: #165dff;
    margin-left: 8rpx;
  }
}

.notice-unread {
  position: absolute;
  top: 24rpx;
  right: 0;
  width: 12rpx;
  height: 12rpx;
  background: #f53f3f;
  border-radius: 50%;
}

.pending-section {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.pending-list {
  display: flex;
  flex-direction: column;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.pending-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.pending-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.pending-icon {
  font-size: 28rpx;
}

.pending-info {
  display: flex;
  flex-direction: column;
}

.pending-text {
  font-size: 28rpx;
  color: #1d2129;
}

.pending-desc {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.pending-right {
  display: flex;
  align-items: center;
}

.pending-count {
  font-size: 32rpx;
  font-weight: 600;
  color: #f53f3f;
  margin-right: 12rpx;
}

.pending-arrow {
  font-size: 28rpx;
  color: #c9cdd4;
}
</style>
