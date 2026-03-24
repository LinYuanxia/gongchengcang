<template>
  <view class="page">
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索帮助内容" 
        class="search-input"
      />
    </view>

    <view class="hot-section">
      <view class="section-title">热门问题</view>
      <view class="hot-list">
        <view 
          class="hot-item" 
          v-for="item in hotQuestions" 
          :key="item.id"
          @click="handleQuestion(item)"
        >
          <text class="hot-icon">🔥</text>
          <text class="hot-text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <view class="category-section">
      <view class="section-title">帮助分类</view>
      <view class="category-list">
        <view 
          class="category-item" 
          v-for="item in categories" 
          :key="item.id"
          @click="handleCategory(item)"
        >
          <view class="category-icon" :style="{ background: item.bgColor }">
            <text>{{ item.icon }}</text>
          </view>
          <view class="category-info">
            <text class="category-name">{{ item.name }}</text>
            <text class="category-count">{{ item.count }}个问题</text>
          </view>
          <text class="category-arrow">></text>
        </view>
      </view>
    </view>

    <view class="contact-section">
      <view class="section-title">联系我们</view>
      <view class="contact-card">
        <view class="contact-item" @click="handleCall">
          <text class="contact-icon">📞</text>
          <view class="contact-info">
            <text class="contact-label">客服热线</text>
            <text class="contact-value">400-888-8888</text>
          </view>
        </view>
        <view class="contact-item" @click="handleWechat">
          <text class="contact-icon">💬</text>
          <view class="contact-info">
            <text class="contact-label">在线客服</text>
            <text class="contact-value">点击咨询</text>
          </view>
        </view>
        <view class="contact-item" @click="handleFeedback">
          <text class="contact-icon">📝</text>
          <view class="contact-info">
            <text class="contact-label">意见反馈</text>
            <text class="contact-value">提交建议</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')

const hotQuestions = ref([
  { id: 1, title: '如何进行采购下单？' },
  { id: 2, title: '资金托管账户如何充值？' },
  { id: 3, title: '如何管理商品库存？' },
  { id: 4, title: '订单发货流程说明' },
  { id: 5, title: '如何开具发票？' },
])

const categories = ref([
  { id: 1, name: '账户管理', icon: '👤', bgColor: '#e8f3ff', count: 12 },
  { id: 2, name: '采购管理', icon: '🛒', bgColor: '#fff7e8', count: 18 },
  { id: 3, name: '销售管理', icon: '📦', bgColor: '#e8ffea', count: 15 },
  { id: 4, name: '库存管理', icon: '📊', bgColor: '#f2e8ff', count: 20 },
  { id: 5, name: '资金管理', icon: '💰', bgColor: '#ffece8', count: 10 },
  { id: 6, name: '发票管理', icon: '📄', bgColor: '#e8fff3', count: 8 },
])

function handleQuestion(item: any) {
  uni.showToast({ title: item.title, icon: 'none' })
}

function handleCategory(item: any) {
  uni.showToast({ title: item.name, icon: 'none' })
}

function handleCall() {
  uni.makePhoneCall({
    phoneNumber: '4008888888',
  })
}

function handleWechat() {
  uni.showToast({ title: '在线客服功能开发中', icon: 'none' })
}

function handleFeedback() {
  uni.showToast({ title: '意见反馈功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 0 24rpx;
  height: 80rpx;
  background-color: #fff;
  border-radius: 40rpx;
}

.search-icon {
  margin-right: 16rpx;
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.section-title {
  font-size: 30rpx;
  color: #1d2129;
  font-weight: 600;
  margin-bottom: 20rpx;
  padding: 0 32rpx;
}

.hot-section {
  margin-bottom: 32rpx;
}

.hot-list {
  background-color: #fff;
  padding: 0 32rpx;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.hot-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.hot-text {
  font-size: 28rpx;
  color: #1d2129;
}

.category-section {
  margin-bottom: 32rpx;
}

.category-list {
  background-color: #fff;
  padding: 0 32rpx;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.category-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.category-count {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.category-arrow {
  color: #c9cdd4;
  font-size: 28rpx;
}

.contact-section {
  margin-bottom: 32rpx;
}

.contact-card {
  margin: 0 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.contact-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.contact-info {
  flex: 1;
}

.contact-label {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.contact-value {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}
</style>
