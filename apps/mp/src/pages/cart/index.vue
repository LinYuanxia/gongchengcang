<template>
  <view class="page">
    <view class="cart-list" v-if="cartList.length > 0">
      <view class="cart-group" v-for="group in cartList" :key="group.supplierId">
        <view class="group-header">
          <view class="group-check" @click="toggleGroup(group)">
            <text class="check-icon">{{ group.selected ? '☑' : '☐' }}</text>
          </view>
          <text class="group-name">{{ group.supplierName }}</text>
        </view>
        <view class="cart-item" v-for="item in group.items" :key="item.id">
          <view class="item-check" @click="toggleItem(group, item)">
            <text class="check-icon">{{ item.selected ? '☑' : '☐' }}</text>
          </view>
          <image :src="item.image" class="item-image" />
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-spec">{{ item.spec }}</text>
            <view class="item-price">
              <text class="price">¥{{ item.price }}</text>
              <text class="unit">/{{ item.unit }}</text>
            </view>
          </view>
          <view class="item-qty">
            <view class="qty-btn" @click="item.qty > 1 && item.qty--">-</view>
            <text class="qty-value">{{ item.qty }}</text>
            <view class="qty-btn" @click="item.qty++">+</view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-else>
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <view class="empty-btn" @click="handleGoMarket">去采购市场</view>
    </view>

    <view class="footer-bar" v-if="cartList.length > 0">
      <view class="footer-left">
        <view class="select-all" @click="toggleAll">
          <text class="check-icon">{{ isAllSelected ? '☑' : '☐' }}</text>
          <text class="select-text">全选</text>
        </view>
        <view class="total-info">
          <text class="total-label">合计:</text>
          <text class="total-price">¥{{ selectedTotal }}</text>
        </view>
      </view>
      <view class="submit-btn" @click="handleSubmit">结算({{ selectedCount }})</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const cartList = ref([
  {
    supplierId: 's001',
    supplierName: '华新水泥供应商',
    selected: true,
    items: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=1', price: 420, unit: '吨', qty: 10, selected: true },
    ],
  },
  {
    supplierId: 's002',
    supplierName: '宝钢供应商',
    selected: true,
    items: [
      { id: 'p2', name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://picsum.photos/100/100?random=2', price: 4000, unit: '吨', qty: 5, selected: true },
      { id: 'p3', name: '螺纹钢 HRB400 20mm', spec: '20mm', image: 'https://picsum.photos/100/100?random=3', price: 3950, unit: '吨', qty: 3, selected: false },
    ],
  },
])

const isAllSelected = computed(() => {
  return cartList.value.every(g => g.selected && g.items.every(i => i.selected))
})

const selectedCount = computed(() => {
  return cartList.value.reduce((count, g) => {
    return count + g.items.filter(i => i.selected).length
  }, 0)
})

const selectedTotal = computed(() => {
  return cartList.value.reduce((sum, g) => {
    return sum + g.items
      .filter(i => i.selected)
      .reduce((s, i) => s + i.price * i.qty, 0)
  }, 0).toLocaleString()
})

function toggleGroup(group: any) {
  group.selected = !group.selected
  group.items.forEach((i: any) => i.selected = group.selected)
}

function toggleItem(group: any, item: any) {
  item.selected = !item.selected
  group.selected = group.items.every((i: any) => i.selected)
}

function toggleAll() {
  const newState = !isAllSelected.value
  cartList.value.forEach(g => {
    g.selected = newState
    g.items.forEach(i => i.selected = newState)
  })
}

function handleGoMarket() {
  uni.switchTab({ url: '/pages/market/index' })
}

function handleSubmit() {
  const selected = cartList.value.flatMap(g => g.items.filter(i => i.selected))
  if (selected.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order/create' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.cart-list {
  padding: 24rpx 32rpx;
}

.cart-group {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f7f8fa;
}

.group-check {
  margin-right: 16rpx;
}

.check-icon {
  font-size: 40rpx;
  color: #165dff;
}

.group-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-check {
  margin-right: 16rpx;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 16rpx;
}

.item-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.item-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.item-price {
  margin-top: 8rpx;
}

.price {
  font-size: 30rpx;
  color: #f53f3f;
  font-weight: 500;
}

.unit {
  font-size: 22rpx;
  color: #86909c;
}

.item-qty {
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 20rpx 48rpx;
  background-color: #165dff;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #fff;
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
  align-items: baseline;
}

.total-label {
  font-size: 26rpx;
  color: #86909c;
  margin-right: 8rpx;
}

.total-price {
  font-size: 36rpx;
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
