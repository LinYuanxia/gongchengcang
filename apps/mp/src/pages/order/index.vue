<template>
  <view class="page">
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === item.value }" 
        v-for="item in tabs" 
        :key="item.value"
        @click="handleTab(item.value)"
      >
        {{ item.label }}
      </view>
    </view>
    
    <view class="order-list">
      <view class="order-item" v-for="order in orderList" :key="order.id" @click="handleDetail(order)">
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="'status-' + order.status">{{ order.statusLabel }}</text>
        </view>
        <view class="order-products">
          <view class="product-item" v-for="product in order.products" :key="product.id">
            <image :src="product.image" mode="aspectFill" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-bottom">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-quantity">x{{ product.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="order-footer">
          <view class="order-total">
            <text>共{{ order.totalQuantity }}件商品</text>
            <text class="total-label">合计：</text>
            <text class="total-price">¥{{ order.totalAmount }}</text>
          </view>
          <view class="order-actions">
            <view class="btn" v-if="order.status === 1" @click.stop="handleCancel(order)">取消订单</view>
            <view class="btn primary" v-if="order.status === 1" @click.stop="handlePay(order)">立即支付</view>
            <view class="btn primary" v-if="order.status === 3" @click.stop="handleConfirm(order)">确认收货</view>
            <view class="btn" v-if="order.status === 4" @click.stop="handleReorder(order)">再次购买</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('all')

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
]

const orderList = ref([
  {
    id: 1,
    orderNo: 'SO2024010012',
    status: 1,
    statusLabel: '待付款',
    totalAmount: '5,200.00',
    totalQuantity: 10,
    products: [
      { id: 1, name: 'P.O 42.5 普通硅酸盐水泥', price: '520.00', quantity: 10, image: 'https://via.placeholder.com/100' },
    ],
  },
  {
    id: 2,
    orderNo: 'SO2024010011',
    status: 3,
    statusLabel: '待收货',
    totalAmount: '21,400.00',
    totalQuantity: 5,
    products: [
      { id: 2, name: 'HRB400E 螺纹钢 Φ16', price: '4,280.00', quantity: 5, image: 'https://via.placeholder.com/100' },
    ],
  },
])

function handleTab(value: string) {
  activeTab.value = value
}

function handleDetail(order: any) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

function handleCancel(order: any) {
  uni.showModal({
    title: '提示',
    content: '确定取消订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '订单已取消', icon: 'success' })
      }
    },
  })
}

function handlePay(order: any) {
  uni.showToast({ title: '支付功能开发中', icon: 'none' })
}

function handleConfirm(order: any) {
  uni.showModal({
    title: '提示',
    content: '确定已收到货物吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已确认收货', icon: 'success' })
      }
    },
  })
}

function handleReorder(order: any) {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.tabs {
  display: flex;
  background-color: #fff;
  padding: 0 32rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 28rpx;
  color: #86909c;
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
}

.order-list {
  padding: 24rpx 32rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f7f8fa;
}

.order-no {
  font-size: 26rpx;
  color: #86909c;
}

.order-status {
  font-size: 26rpx;
  font-weight: 500;
  
  &.status-1 {
    color: #ff7d00;
  }
  
  &.status-2 {
    color: #165dff;
  }
  
  &.status-3 {
    color: #165dff;
  }
  
  &.status-4 {
    color: #00b42a;
  }
}

.order-products {
  padding: 24rpx;
}

.product-item {
  display: flex;
  
  & + .product-item {
    margin-top: 24rpx;
  }
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
}

.product-price {
  font-size: 28rpx;
  color: #f53f3f;
}

.product-quantity {
  font-size: 26rpx;
  color: #86909c;
}

.order-footer {
  padding: 24rpx;
  border-top: 1rpx solid #f7f8fa;
}

.order-total {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 26rpx;
  color: #86909c;
  margin-bottom: 20rpx;
}

.total-label {
  color: #1d2129;
  margin-left: 16rpx;
}

.total-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #f53f3f;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn {
  padding: 12rpx 32rpx;
  border: 1rpx solid #e5e6eb;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #1d2129;
  
  &.primary {
    background-color: #165dff;
    border-color: #165dff;
    color: #fff;
  }
}
</style>
