<template>
  <view class="page">
    <view class="bom-header">
      <text class="bom-name">{{ bomInfo.name }}</text>
      <text class="bom-type">{{ bomInfo.type }}</text>
    </view>
    <text class="bom-desc">{{ bomInfo.description }}</text>
    <view class="bom-tags">
      <text class="tag" v-for="tag in bomInfo.tags" :key="tag">{{ tag }}</text>
    </view>

    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-value">{{ bomInfo.productCount }}</text>
        <text class="summary-label">材料种类</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">¥{{ bomInfo.estimatedPrice }}</text>
        <text class="summary-label">预估总价</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">材料清单</text>
        <text class="section-count">{{ products.length }}种</text>
      </view>
      <view class="product-list">
        <view class="product-item" v-for="item in products" :key="item.id">
          <view class="product-check" @click="item.selected = !item.selected">
            <text class="check-icon">{{ item.selected ? '☑' : '☐' }}</text>
          </view>
          <image :src="item.image" class="product-image" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-spec">{{ item.spec }}</text>
            <view class="product-price">
              <text class="price">¥{{ item.price }}</text>
              <text class="unit">/{{ item.unit }}</text>
            </view>
          </view>
          <view class="product-qty">
            <view class="qty-btn" @click="item.qty > 1 && item.qty--">-</view>
            <text class="qty-value">{{ item.qty }}</text>
            <view class="qty-btn" @click="item.qty++">+</view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-bar">
      <view class="footer-left">
        <view class="select-all" @click="handleSelectAll">
          <text class="check-icon">{{ isAllSelected ? '☑' : '☐' }}</text>
          <text class="select-text">全选</text>
        </view>
        <view class="total-info">
          <text class="total-label">已选{{ selectedCount }}种</text>
          <text class="total-price">¥{{ selectedTotal }}</text>
        </view>
      </view>
      <view class="submit-btn" @click="handleSubmit">加入购物车</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const bomInfo = ref({
  id: 'bom001',
  name: '标准住宅基础BOM包',
  type: '平台标准',
  description: '适用于标准住宅项目的基础建材配置包，包含水泥、砂石、钢筋等基础材料',
  productCount: 12,
  estimatedPrice: '158,000',
  tags: ['住宅', '基础工程', '推荐'],
})

const products = ref([
  { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=1', price: 450, unit: '吨', qty: 10, selected: true },
  { id: 'p2', name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://picsum.photos/100/100?random=2', price: 4200, unit: '吨', qty: 5, selected: true },
  { id: 'p3', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=3', price: 95, unit: '方', qty: 50, selected: true },
  { id: 'p4', name: '碎石 5-31.5mm', spec: '5-31.5mm', image: 'https://picsum.photos/100/100?random=4', price: 72, unit: '方', qty: 40, selected: false },
  { id: 'p5', name: '商品混凝土 C30', spec: 'C30', image: 'https://picsum.photos/100/100?random=5', price: 420, unit: '方', qty: 30, selected: false },
])

const isAllSelected = computed(() => products.value.every(p => p.selected))

const selectedCount = computed(() => products.value.filter(p => p.selected).length)

const selectedTotal = computed(() => {
  return products.value
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.price * p.qty, 0)
    .toLocaleString()
})

function handleSelectAll() {
  const newState = !isAllSelected.value
  products.value.forEach(p => p.selected = newState)
}

function handleSubmit() {
  const selected = products.value.filter(p => p.selected)
  if (selected.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.showToast({ title: '已加入购物车', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.bom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background-color: #fff;
}

.bom-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #1d2129;
}

.bom-type {
  font-size: 24rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.bom-desc {
  font-size: 28rpx;
  color: #86909c;
  padding: 0 32rpx 16rpx;
  background-color: #fff;
}

.bom-tags {
  display: flex;
  gap: 12rpx;
  padding: 0 32rpx 24rpx;
  background-color: #fff;
  
  .tag {
    font-size: 22rpx;
    color: #86909c;
    background-color: #f7f8fa;
    padding: 6rpx 16rpx;
    border-radius: 4rpx;
  }
}

.summary-card {
  display: flex;
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
}

.summary-label {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.section-count {
  font-size: 24rpx;
  color: #86909c;
}

.product-list {
  display: flex;
  flex-direction: column;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-check {
  margin-right: 16rpx;
}

.check-icon {
  font-size: 40rpx;
  color: #165dff;
}

.product-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 16rpx;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.product-price {
  margin-top: 8rpx;
}

.price {
  font-size: 28rpx;
  color: #f53f3f;
  font-weight: 500;
}

.unit {
  font-size: 22rpx;
  color: #86909c;
}

.product-qty {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
}

.qty-btn {
  width: 48rpx;
  height: 48rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #1d2129;
}

.qty-value {
  width: 64rpx;
  text-align: center;
  font-size: 28rpx;
  color: #1d2129;
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
  align-items: center;
}

.select-all {
  display: flex;
  align-items: center;
  margin-right: 24rpx;
}

.select-text {
  font-size: 26rpx;
  color: #1d2129;
  margin-left: 8rpx;
}

.total-info {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 22rpx;
  color: #86909c;
}

.total-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #f53f3f;
}

.submit-btn {
  padding: 20rpx 48rpx;
  background-color: #165dff;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}
</style>
