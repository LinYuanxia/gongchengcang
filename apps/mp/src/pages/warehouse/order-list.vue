<template>
  <view class="page">
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === '' }"
        @click="handleTabChange('')"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'pending' }"
        @click="handleTabChange('pending')"
      >
        待付款
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'paid' }"
        @click="handleTabChange('paid')"
      >
        待发货
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'shipped' }"
        @click="handleTabChange('shipped')"
      >
        待收货
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'completed' }"
        @click="handleTabChange('completed')"
      >
       已完成
      </view>
    </view>
    
    <scroll-view scroll-y class="order-list">
      <view class="order-item" v-for="order in filteredOrders" :key="order.id" @click="handleOrderDetail(order)">
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="order.status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <view class="order-products">
          <view class="product-item" v-for="(item, idx) in order.items" :key="idx">
            <image :src="item.image" mode="aspectFill" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ item.productName }}</text>
              <text class="product-spec">{{ item.specName }}</text>
              <view class="product-bottom">
                <text class="product-price">¥{{ item.price }}</text>
                <text class="product-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-amount">
            <text class="amount-label">共 {{ order.totalQuantity }} 件商品，合计：</text>
            <text class="amount-value">¥{{ order.totalAmount }}</text>
          </view>
          <view class="order-actions">
            <view class="btn cancel" v-if="order.status === 'pending'" @click.stop="handleCancel(order)">取消订单</view>
            <view class="btn primary" v-if="order.status === 'pending'" @click.stop="handlePay(order)">立即付款</view>
            <view class="btn primary" v-if="order.status === 'shipped'" @click.stop="handleConfirm(order)">确认收货</view>
            <view class="btn" v-if="order.status === 'completed'" @click.stop="handleReorder(order)">再次购买</view>
          </view>
        </view>
      </view>
      
      <view class="empty" v-if="filteredOrders.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref('')

const orders = ref([
  {
    id: 'o1',
    orderNo: 'WH202401150001',
    status: 'pending',
    totalQuantity: 30,
    totalAmount: '13200.00',
    createTime: '2024-01-15 10:30:00',
    items: [
      { productName: '水泥 P.O 普通硅酸盐水泥', specName: 'P.O 42.5 散装', image: 'https://picsum.photos/100/100?random=1', price: 420, quantity: 10 },
      { productName: '水泥 P.O 普通硅酸盐水泥', specName: 'P.O 42.5 袋装50kg', image: 'https://picsum.photos/100/100?random=2', price: 450, quantity: 20 },
    ],
  },
  {
    id: 'o2',
    orderNo: 'WH202401140002',
    status: 'paid',
    totalQuantity: 50,
    totalAmount: '21000.00',
    createTime: '2024-01-14 15:20:00',
    items: [
      { productName: '螺纹钢 HRB400', specName: 'HRB400 16mm', image: 'https://picsum.photos/100/100?random=3', price: 4200, quantity: 5 },
    ],
  },
  {
    id: 'o3',
    orderNo: 'WH202401130003',
    status: 'shipped',
    totalQuantity: 100,
    totalAmount: '9500.00',
    createTime: '2024-01-13 09:15:00',
    items: [
      { productName: '黄砂 中砂', specName: '中砂', image: 'https://picsum.photos/100/100?random=4', price: 95, quantity: 100 },
    ],
  },
  {
    id: 'o4',
    orderNo: 'WH202401120004',
    status: 'completed',
    totalQuantity: 200,
    totalAmount: '84000.00',
    createTime: '2024-01-12 14:00:00',
    items: [
      { productName: '商品混凝土 C30', specName: 'C30', image: 'https://picsum.photos/100/100?random=5', price: 420, quantity: 200 },
    ],
  },
])

const filteredOrders = computed(() => {
  if (!currentTab.value) return orders.value
  return orders.value.filter(o => o.status === currentTab.value)
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function handleTabChange(tab: string) {
  currentTab.value = tab
}

function handleOrderDetail(order: any) {
  uni.showToast({ title: '订单详情功能开发中', icon: 'none' })
}

function handleCancel(order: any) {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        order.status = 'cancelled'
        uni.showToast({ title: '订单已取消', icon: 'success' })
      }
    }
  })
}

function handlePay(order: any) {
  uni.showToast({ title: '支付功能开发中', icon: 'none' })
}

function handleConfirm(order: any) {
  uni.showModal({
    title: '提示',
    content: '确认已收到货物吗？',
    success: (res) => {
      if (res.confirm) {
        order.status = 'completed'
        uni.showToast({ title: '已确认收货', icon: 'success' })
      }
    }
  })
}

function handleReorder(order: any) {
  uni.showToast({ title: '再次购买功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background-color: #fff;
  padding: 0 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #ff6b00;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background-color: #ff6b00;
      border-radius: 2rpx;
    }
  }
}

.order-list {
  flex: 1;
  padding: 24rpx;
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
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-no {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  font-size: 26rpx;
  font-weight: 600;
  
  &.pending { color: #ff4d4f; }
  &.paid { color: #1890ff; }
  &.shipped { color: #52c41a; }
  &.completed { color: #999; }
  &.cancelled { color: #999; }
}

.order-products {
  padding: 0 24rpx;
}

.product-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
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
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.product-spec {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  font-size: 26rpx;
  color: #ff4d4f;
}

.product-quantity {
  font-size: 22rpx;
  color: #999;
}

.order-footer {
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.amount-label {
  font-size: 24rpx;
  color: #999;
}

.amount-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.btn {
  padding: 0 24rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 28rpx;
  
  &.cancel {
    color: #999;
  }
  
  &.primary {
    color: #fff;
    background-color: #ff6b00;
  }
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
  color: #999;
}
</style>
