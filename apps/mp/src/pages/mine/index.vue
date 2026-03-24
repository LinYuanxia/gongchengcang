<template>
  <view class="page">
    <view class="user-card">
      <view class="user-info">
        <image src="https://via.placeholder.com/100" class="avatar" />
        <view class="info">
          <text class="name">{{ userInfo.name }}</text>
          <text class="company">{{ userInfo.company }}</text>
          <view class="cert-status">
            <text class="cert-icon">✓</text>
            <text class="cert-text">已认证</text>
          </view>
        </view>
        <view class="edit-btn" @click="handleNavigate('/pages/mine/profile')">
          <text>编辑</text>
        </view>
      </view>
      <view class="user-stats">
        <view class="stat-item" @click="handleNavigate('/pages/order/index?tab=sale&status=toShip')">
          <text class="stat-value">{{ stats.toShip }}</text>
          <text class="stat-label">待发货</text>
        </view>
        <view class="stat-item" @click="handleNavigate('/pages/order/index?tab=purchase&status=toReceive')">
          <text class="stat-value">{{ stats.toReceive }}</text>
          <text class="stat-label">待入库</text>
        </view>
        <view class="stat-item" @click="handleNavigate('/pages/mine/invoice?type=out')">
          <text class="stat-value">{{ stats.toInvoice }}</text>
          <text class="stat-label">待开票</text>
        </view>
        <view class="stat-item" @click="handleNavigate('/pages/mine/message')">
          <text class="stat-value">{{ stats.message }}</text>
          <text class="stat-label">消息</text>
        </view>
      </view>
    </view>

    <view class="custody-card" @click="handleNavigate('/pages/mine/custody')">
      <view class="custody-header">
        <text class="custody-title">资金托管账户</text>
        <text class="custody-link">查看明细 ></text>
      </view>
      <view class="custody-body">
        <view class="custody-main">
          <text class="custody-label">账户余额</text>
          <text class="custody-balance">¥{{ custodyBalance }}</text>
          <text class="custody-frozen">冻结金额: ¥{{ frozenAmount }}</text>
        </view>
        <view class="custody-actions">
          <view class="action-item" @click.stop="handleNavigate('/pages/mine/custody-recharge')">
            <text class="action-icon">➕</text>
            <text class="action-text">充值</text>
          </view>
          <view class="action-item" @click.stop="handleNavigate('/pages/mine/custody-withdraw')">
            <text class="action-icon">💸</text>
            <text class="action-text">提现</text>
          </view>
          <view class="action-item" @click.stop="handleNavigate('/pages/mine/custody-records')">
            <text class="action-icon">📋</text>
            <text class="action-text">明细</text>
          </view>
        </view>
      </view>
    </view>

    <view class="quick-section">
      <view class="quick-title">常用功能</view>
      <view class="quick-grid">
        <view class="quick-item" @click="handleNavigate('/pages/order/ship')">
          <text class="quick-icon">📦</text>
          <text class="quick-text">扫码发货</text>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/order/receive')">
          <text class="quick-icon">📥</text>
          <text class="quick-text">扫码入库</text>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/mine/stock?tab=warning')">
          <text class="quick-icon">⚠️</text>
          <text class="quick-text">库存预警</text>
          <view class="quick-badge" v-if="stats.stockWarning > 0">{{ stats.stockWarning }}</view>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/mine/product')">
          <text class="quick-icon">📦</text>
          <text class="quick-text">商品管理</text>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/mine/invoice?type=out')">
          <text class="quick-icon">📄</text>
          <text class="quick-text">开票管理</text>
          <view class="quick-badge" v-if="stats.toInvoice > 0">{{ stats.toInvoice }}</view>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/mine/account')">
          <text class="quick-icon">👥</text>
          <text class="quick-text">子账号</text>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/mine/bankcard')">
          <text class="quick-icon">💳</text>
          <text class="quick-text">银行卡</text>
        </view>
        <view class="quick-item" @click="handleNavigate('/pages/mine/settings')">
          <text class="quick-icon">⚙️</text>
          <text class="quick-text">设置</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">业务管理</text>
      </view>
      <view class="menu-group">
        <view class="menu-item" v-for="item in businessMenus" :key="item.id" @click="handleNavigate(item.path)">
          <view class="menu-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-text">{{ item.name }}</text>
            <text class="menu-desc" v-if="item.desc">{{ item.desc }}</text>
          </view>
          <view class="menu-right">
            <text class="menu-badge" v-if="item.badge">{{ item.badge }}</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">财务发票</text>
      </view>
      <view class="menu-group">
        <view class="menu-item" v-for="item in financeMenus" :key="item.id" @click="handleNavigate(item.path)">
          <view class="menu-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-text">{{ item.name }}</text>
          </view>
          <view class="menu-right">
            <text class="menu-badge" v-if="item.badge">{{ item.badge }}</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">系统设置</text>
      </view>
      <view class="menu-group">
        <view class="menu-item" v-for="item in settingMenus" :key="item.id" @click="handleNavigate(item.path)">
          <view class="menu-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-text">{{ item.name }}</text>
          </view>
          <view class="menu-right">
            <text class="menu-badge" v-if="item.badge">{{ item.badge }}</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <view class="logout-btn" @click="handleLogout">退出登录</view>
    
    <view class="version-info">
      <text>工程仓端 v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref({
  name: '张三',
  company: '深圳湾科技园项目仓'
})

const stats = ref({
  toShip: 12,
  toReceive: 5,
  toInvoice: 8,
  message: 3,
  stockWarning: 5,
})

const custodyBalance = ref('158,520.00')
const frozenAmount = ref('12,000.00')

const businessMenus = ref([
  { id: 1, name: '主体信息', icon: '🏢', path: '/pages/mine/profile', desc: '企业信息、资质' },
  { id: 2, name: '商品管理', icon: '📦', path: '/pages/mine/product', badge: '156' },
  { id: 3, name: '库存管理', icon: '📊', path: '/pages/mine/stock', badge: '5' },
  { id: 4, name: '子账号管理', icon: '👥', path: '/pages/mine/account' },
])

const financeMenus = ref([
  { id: 1, name: '销项发票', icon: '📄', path: '/pages/mine/invoice?type=out', badge: '8' },
  { id: 2, name: '进项发票', icon: '📥', path: '/pages/mine/invoice?type=in' },
  { id: 3, name: '开票记录', icon: '📋', path: '/pages/mine/invoice-records' },
  { id: 4, name: '银行卡管理', icon: '💳', path: '/pages/mine/bankcard' },
])

const settingMenus = ref([
  { id: 1, name: '消息中心', icon: '🔔', path: '/pages/mine/message', badge: '3' },
  { id: 2, name: '设置', icon: '⚙️', path: '/pages/mine/settings' },
  { id: 3, name: '帮助中心', icon: '❓', path: '/pages/mine/help' },
  { id: 4, name: '关于我们', icon: 'ℹ️', path: '/pages/mine/about' },
])

function handleNavigate(path: string) {
  uni.navigateTo({ url: path })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.user-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 48rpx 32rpx 32rpx;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.info {
  flex: 1;
  margin-left: 24rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.company {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.cert-status {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-top: 8rpx;
}

.cert-icon {
  font-size: 20rpx;
  margin-right: 4rpx;
}

.cert-text {
  font-size: 20rpx;
}

.edit-btn {
  padding: 8rpx 24rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  font-size: 24rpx;
}

.user-stats {
  display: flex;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 24rpx 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  opacity: 0.9;
  margin-top: 8rpx;
}

.custody-card {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.custody-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f7f8fa;
}

.custody-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.custody-link {
  font-size: 24rpx;
  color: #165dff;
}

.custody-body {
  padding: 24rpx;
}

.custody-main {
  margin-bottom: 24rpx;
}

.custody-label {
  font-size: 24rpx;
  color: #86909c;
  display: block;
}

.custody-balance {
  font-size: 48rpx;
  color: #1d2129;
  font-weight: 600;
  display: block;
  margin: 8rpx 0;
}

.custody-frozen {
  font-size: 22rpx;
  color: #86909c;
}

.custody-actions {
  display: flex;
  gap: 24rpx;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  background-color: #f7f8fa;
  border-radius: 8rpx;
}

.action-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.action-text {
  font-size: 24rpx;
  color: #1d2129;
}

.quick-section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.quick-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 24rpx;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
}

.quick-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
  position: relative;
}

.quick-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.quick-text {
  font-size: 24rpx;
  color: #1d2129;
}

.quick-badge {
  position: absolute;
  top: -4rpx;
  right: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  background-color: #f53f3f;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.menu-section {
  margin: 24rpx 32rpx;
}

.section-header {
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.menu-group {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #1d2129;
}

.menu-desc {
  font-size: 22rpx;
  color: #86909c;
  margin-left: 12rpx;
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-badge {
  background-color: #f53f3f;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-right: 12rpx;
}

.menu-arrow {
  color: #c9cdd4;
  font-size: 28rpx;
}

.logout-btn {
  margin: 48rpx 32rpx 24rpx;
  text-align: center;
  padding: 28rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #f53f3f;
}

.version-info {
  text-align: center;
  padding: 24rpx 0;
  font-size: 22rpx;
  color: #c9cdd4;
}
</style>
