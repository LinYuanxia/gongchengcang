<template>
  <view class="page">
    <swiper class="image-swiper" indicator-dots autoplay circular>
      <swiper-item v-for="(img, index) in productImages" :key="index">
        <image :src="img" mode="aspectFill" class="product-image" />
      </swiper-item>
    </swiper>

    <view class="product-info">
      <view class="price-row">
        <view class="price-main">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ product.price }}</text>
          <text class="price-unit">/{{ product.unit }}</text>
        </view>
        <view class="sales">已售 {{ product.sales }}件</view>
      </view>
      <text class="product-name">{{ product.name }}</text>
      <text class="product-desc">{{ product.description }}</text>
      <view class="product-tags">
        <text class="tag permission" v-if="product.hasPermission">有采购权限</text>
        <text class="tag hot" v-if="product.isHot">热销</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">规格参数</view>
      <view class="spec-list">
        <view class="spec-item" v-for="(value, key) in product.specs" :key="key">
          <text class="spec-label">{{ key }}</text>
          <text class="spec-value">{{ value }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">供应商报价 ({{ suppliers.length }}家)</view>
      <view class="supplier-list">
        <view class="supplier-item" v-for="item in suppliers" :key="item.id">
          <view class="supplier-left">
            <text class="supplier-name">{{ item.name }}</text>
            <view class="supplier-tags">
              <text class="tag" v-if="item.isPrimary">主供</text>
              <text class="tag" v-if="item.hasStock">有货</text>
            </view>
          </view>
          <view class="supplier-right">
            <text class="supply-price">¥{{ item.supplyPrice }}</text>
            <text class="stock">库存: {{ item.stock }}{{ product.unit }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-bar">
      <view class="footer-left">
        <view class="footer-item" @click="handleMessage">
          <text class="footer-icon">💬</text>
          <text class="footer-text">客服</text>
        </view>
        <view class="footer-item" @click="handleCart">
          <text class="footer-icon">🛒</text>
          <text class="footer-text">购物车</text>
          <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
        </view>
      </view>
      <view class="footer-right">
        <view class="add-cart-btn" @click="handleAddCart">加入购物车</view>
        <view class="buy-btn" @click="handleBuyNow">立即采购</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const productImages = ref([
  'https://picsum.photos/750/750?random=1',
  'https://picsum.photos/750/750?random=2',
  'https://picsum.photos/750/750?random=3',
])

const product = ref({
  id: 'p001',
  name: '水泥 P.O 42.5 普通硅酸盐水泥',
  description: '适用于一般土木建筑、道路、桥梁、水利等工程',
  price: 450,
  unit: '吨',
  sales: 1280,
  hasPermission: true,
  isHot: true,
  specs: {
    '强度等级': '42.5',
    '品种': '普通硅酸盐水泥',
    '包装': '散装/袋装',
    '产地': '湖北',
  },
})

const suppliers = ref([
  { id: 's1', name: '华新水泥供应商', supplyPrice: 420, stock: 500, isPrimary: true, hasStock: true },
  { id: 's2', name: '海螺水泥供应商', supplyPrice: 415, stock: 300, isPrimary: false, hasStock: true },
  { id: 's3', name: '南方水泥供应商', supplyPrice: 425, stock: 0, isPrimary: false, hasStock: false },
])

const cartCount = ref(3)

function handleMessage() {
  uni.showToast({ title: '客服功能开发中', icon: 'none' })
}

function handleCart() {
  uni.navigateTo({ url: '/pages/cart/index' })
}

function handleAddCart() {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
  cartCount.value++
}

function handleBuyNow() {
  uni.navigateTo({ url: '/pages/order/create' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.image-swiper {
  width: 100%;
  height: 750rpx;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-info {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.price-main {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 32rpx;
  color: #f53f3f;
}

.price-value {
  font-size: 48rpx;
  color: #f53f3f;
  font-weight: 600;
}

.price-unit {
  font-size: 24rpx;
  color: #86909c;
  margin-left: 8rpx;
}

.sales {
  font-size: 24rpx;
  color: #86909c;
}

.product-name {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
}

.product-desc {
  font-size: 26rpx;
  color: #86909c;
  margin-top: 12rpx;
  display: block;
}

.product-tags {
  display: flex;
  margin-top: 16rpx;
  
  .tag {
    font-size: 22rpx;
    padding: 6rpx 16rpx;
    border-radius: 4rpx;
    margin-right: 12rpx;
    
    &.permission {
      color: #00b42a;
      background-color: #e8ffea;
    }
    
    &.hot {
      color: #f53f3f;
      background-color: #ffece8;
    }
  }
}

.section {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 20rpx;
}

.spec-list {
  display: flex;
  flex-direction: column;
}

.spec-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.spec-label {
  width: 180rpx;
  font-size: 26rpx;
  color: #86909c;
}

.spec-value {
  flex: 1;
  font-size: 26rpx;
  color: #1d2129;
}

.supplier-list {
  display: flex;
  flex-direction: column;
}

.supplier-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.supplier-left {
  display: flex;
  flex-direction: column;
}

.supplier-name {
  font-size: 28rpx;
  color: #1d2129;
}

.supplier-tags {
  display: flex;
  margin-top: 8rpx;
  
  .tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    margin-right: 8rpx;
    color: #165dff;
    background-color: #e8f3ff;
  }
}

.supplier-right {
  text-align: right;
}

.supply-price {
  font-size: 30rpx;
  color: #f53f3f;
  font-weight: 500;
  display: block;
}

.stock {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.footer-left {
  display: flex;
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24rpx;
  position: relative;
}

.footer-icon {
  font-size: 40rpx;
}

.footer-text {
  font-size: 20rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: 8rpx;
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

.footer-right {
  display: flex;
  gap: 16rpx;
}

.add-cart-btn {
  padding: 20rpx 32rpx;
  background-color: #fff7e8;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ff7d00;
  font-weight: 500;
}

.buy-btn {
  padding: 20rpx 48rpx;
  background-color: #165dff;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}
</style>
