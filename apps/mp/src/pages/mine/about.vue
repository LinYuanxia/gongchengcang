<template>
  <view class="page">
    <view class="logo-section">
      <image src="/static/logo.png" class="logo" mode="aspectFit" />
      <text class="app-name">工程仓</text>
      <text class="app-version">版本 1.0.0</text>
    </view>

    <view class="info-section">
      <view class="info-card">
        <view class="info-item">
          <text class="info-label">产品名称</text>
          <text class="info-value">工程仓SaaS平台</text>
        </view>
        <view class="info-item">
          <text class="info-label">产品类型</text>
          <text class="info-value">采供一体化管理平台</text>
        </view>
        <view class="info-item">
          <text class="info-label">开发团队</text>
          <text class="info-value">工程仓技术团队</text>
        </view>
        <view class="info-item">
          <text class="info-label">客服电话</text>
          <text class="info-value link" @click="handleCall">400-888-8888</text>
        </view>
        <view class="info-item">
          <text class="info-label">官方网站</text>
          <text class="info-value link" @click="handleWebsite">www.gongchengcang.com</text>
        </view>
      </view>
    </view>

    <view class="feature-section">
      <view class="section-title">产品特点</view>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">📦</text>
          <view class="feature-info">
            <text class="feature-title">库存管理</text>
            <text class="feature-desc">实时库存监控，智能预警提醒</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🛒</text>
          <view class="feature-info">
            <text class="feature-title">采购管理</text>
            <text class="feature-desc">一键采购，供应商直连</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">💰</text>
          <view class="feature-info">
            <text class="feature-title">资金托管</text>
            <text class="feature-desc">安全交易，资金有保障</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📊</text>
          <view class="feature-info">
            <text class="feature-title">数据分析</text>
            <text class="feature-desc">多维度数据报表，辅助决策</text>
          </view>
        </view>
      </view>
    </view>

    <view class="link-section">
      <view class="link-item" @click="handleAgreement">
        <text class="link-text">用户协议</text>
        <text class="link-arrow">></text>
      </view>
      <view class="link-item" @click="handlePrivacy">
        <text class="link-text">隐私政策</text>
        <text class="link-arrow">></text>
      </view>
      <view class="link-item" @click="handleCheckUpdate">
        <text class="link-text">检查更新</text>
        <text class="link-arrow">></text>
      </view>
    </view>

    <view class="copyright">
      <text>Copyright © 2024 工程仓</text>
      <text>All Rights Reserved</text>
    </view>
  </view>
</template>

<script setup lang="ts">
function handleCall() {
  uni.makePhoneCall({
    phoneNumber: '4008888888',
  })
}

function handleWebsite() {
  uni.showToast({ title: '正在跳转官网...', icon: 'none' })
}

function handleAgreement() {
  uni.showToast({ title: '用户协议', icon: 'none' })
}

function handlePrivacy() {
  uni.showToast({ title: '隐私政策', icon: 'none' })
}

function handleCheckUpdate() {
  uni.showModal({
    title: '检查更新',
    content: '当前已是最新版本',
    showCancel: false,
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 48rpx;
  background-color: #fff;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 36rpx;
  color: #1d2129;
  font-weight: 600;
}

.app-version {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.info-section {
  padding: 24rpx 32rpx;
}

.info-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #86909c;
}

.info-value {
  font-size: 28rpx;
  color: #1d2129;
  
  &.link {
    color: #165dff;
  }
}

.feature-section {
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 30rpx;
  color: #1d2129;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.feature-list {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.feature-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.feature-info {
  flex: 1;
}

.feature-title {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.feature-desc {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.link-section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.link-text {
  font-size: 28rpx;
  color: #1d2129;
}

.link-arrow {
  color: #c9cdd4;
  font-size: 28rpx;
}

.copyright {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
  font-size: 22rpx;
  color: #c9cdd4;
}
</style>
