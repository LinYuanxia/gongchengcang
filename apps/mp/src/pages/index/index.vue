<template>
  <view class="page">
    <view class="header">
      <view class="search-bar" @click="handleSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索商品、供应商</text>
      </view>
    </view>
    
    <view class="banner">
      <swiper class="swiper" indicator-dots autoplay circular>
        <swiper-item v-for="item in banners" :key="item.id">
          <image :src="item.image" mode="aspectFill" class="banner-image" />
        </swiper-item>
      </swiper>
    </view>
    
    <view class="quick-entry">
      <view class="entry-item" v-for="item in quickEntries" :key="item.id" @click="handleQuickEntry(item)">
        <view class="entry-icon" :style="{ background: item.color }">
          <text>{{ item.icon }}</text>
        </view>
        <text class="entry-text">{{ item.name }}</text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门商品</text>
        <text class="section-more" @click="handleMore">查看更多 ></text>
      </view>
      <view class="product-list">
        <view class="product-item" v-for="item in products" :key="item.id" @click="handleProduct(item)">
          <image :src="item.image" mode="aspectFill" class="product-image" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <view class="product-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ item.price }}</text>
              <text class="product-unit">/{{ item.unit }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const banners = ref([
  { id: 1, image: 'https://via.placeholder.com/750x300' },
  { id: 2, image: 'https://via.placeholder.com/750x300' },
])

const quickEntries = ref([
  { id: 1, name: '采购计划', icon: '📋', color: '#e8f3ff' },
  { id: 2, name: '我的订单', icon: '📦', color: '#fff7e8' },
  { id: 3, name: '库存查询', icon: '📊', color: '#e8ffea' },
  { id: 4, name: '供应商', icon: '🏭', color: '#f2e8ff' },
])

const products = ref([
  { id: 1, name: 'P.O 42.5 普通硅酸盐水泥', price: '520.00', unit: '吨', image: 'https://via.placeholder.com/200' },
  { id: 2, name: 'HRB400E 螺纹钢 Φ16', price: '4280.00', unit: '吨', image: 'https://via.placeholder.com/200' },
  { id: 3, name: '中砂', price: '85.00', unit: '方', image: 'https://via.placeholder.com/200' },
  { id: 4, name: '碎石 5-31.5mm', price: '72.00', unit: '方', image: 'https://via.placeholder.com/200' },
])

function handleSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

function handleQuickEntry(item: any) {
  uni.showToast({ title: item.name, icon: 'none' })
}

function handleMore() {
  uni.switchTab({ url: '/pages/market/index' })
}

function handleProduct(item: any) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.header {
  padding: 20rpx 32rpx;
  background-color: #fff;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 16rpx;
}

.search-placeholder {
  color: #86909c;
  font-size: 28rpx;
}

.banner {
  margin: 24rpx 32rpx;
}

.swiper {
  height: 280rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.quick-entry {
  display: flex;
  justify-content: space-around;
  padding: 32rpx;
  background-color: #fff;
  margin-bottom: 24rpx;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.entry-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  font-size: 40rpx;
}

.entry-text {
  font-size: 24rpx;
  color: #1d2129;
}

.section {
  padding: 0 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.section-more {
  font-size: 24rpx;
  color: #86909c;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-item {
  width: calc(50% - 12rpx);
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.product-image {
  width: 100%;
  height: 280rpx;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 26rpx;
  color: #1d2129;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  color: #f53f3f;
}

.price-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #f53f3f;
}

.product-unit {
  font-size: 22rpx;
  color: #86909c;
  margin-left: 4rpx;
}
</style>
