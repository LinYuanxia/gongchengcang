<template>
  <view class="page">
    <view class="user-card">
      <view class="user-info">
        <image src="https://via.placeholder.com/100" class="avatar" />
        <view class="info">
          <text class="name">张三</text>
          <text class="company">中建三局项目部</text>
        </view>
      </view>
      <view class="user-stats">
        <view class="stat-item">
          <text class="stat-value">12</text>
          <text class="stat-label">待付款</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">5</text>
          <text class="stat-label">待收货</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">3</text>
          <text class="stat-label">售后</text>
        </view>
      </view>
    </view>
    
    <view class="menu-list">
      <view class="menu-item" v-for="item in menuList" :key="item.id" @click="handleMenu(item)">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-text">{{ item.name }}</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
    </view>
    
    <view class="logout-btn" @click="handleLogout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const menuList = ref([
  { id: 1, name: '采购计划', icon: '📋' },
  { id: 2, name: '收货地址', icon: '📍' },
  { id: 3, name: '发票管理', icon: '📄' },
  { id: 4, name: '资金账户', icon: '💰' },
  { id: 5, name: '帮助中心', icon: '❓' },
  { id: 6, name: '设置', icon: '⚙️' },
])

function handleMenu(item: any) {
  uni.showToast({ title: item.name, icon: 'none' })
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
}

.user-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 48rpx 32rpx;
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
  margin-left: 24rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.company {
  font-size: 26rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  display: block;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  display: block;
}

.menu-list {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  
  & + .menu-item {
    border-top: 1rpx solid #f7f8fa;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #1d2129;
}

.menu-arrow {
  font-size: 28rpx;
  color: #c9cdd4;
}

.logout-btn {
  margin: 48rpx 32rpx;
  padding: 28rpx;
  background-color: #fff;
  border-radius: 16rpx;
  text-align: center;
  font-size: 30rpx;
  color: #f53f3f;
}
</style>
