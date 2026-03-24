<template>
  <view class="page">
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        <text class="tab-text">全部</text>
        <text class="tab-count">{{ statusCounts.all }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'toShip' }"
        @click="activeTab = 'toShip'"
      >
        <text class="tab-text">待发货</text>
        <text class="tab-count">{{ statusCounts.toShip }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'shipped' }"
        @click="activeTab = 'shipped'"
      >
        <text class="tab-text">已发货</text>
        <text class="tab-count">{{ statusCounts.shipped }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        <text class="tab-text">已完成</text>
        <text class="tab-count">{{ statusCounts.completed }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'afterSale' }"
        @click="activeTab = 'afterSale'"
      >
        <text class="tab-text">售后</text>
        <text class="tab-count">{{ statusCounts.afterSale }}</text>
      </view>
    </view>

    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索订单号/商品名称" 
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <view class="order-list">
      <view 
        class="order-card" 
        v-for="order in filteredOrders" 
        :key="order.id"
        @click="handleOrderDetail(order)"
      >
        <view class="order-header">
          <view class="order-no">
            <text class="label">订单号：</text>
            <text class="value">{{ order.orderNo }}</text>
          </view>
          <view class="order-status" :class="order.status">
            <text>{{ getStatusText(order.status) }}</text>
          </view>
        </view>

        <view class="order-products">
          <view class="product-item" v-for="(item, index) in order.products" :key="index">
            <image :src="item.image" class="product-image" mode="aspectFill" />
            <view class="product-info">
              <text class="product-name">{{ item.name }}</text>
              <text class="product-spec">{{ item.spec }}</text>
              <view class="product-price-row">
                <text class="product-price">¥{{ item.price }}</text>
                <text class="product-qty">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <view class="order-amount">
            <text class="amount-label">订单金额：</text>
            <text class="amount-value">¥{{ order.totalAmount }}</text>
          </view>
          <view class="order-actions">
            <view 
              class="action-btn primary" 
              v-if="order.status === 'toShip'"
              @click.stop="handleShip(order)"
            >
              <text>发货</text>
            </view>
            <view 
              class="action-btn" 
              v-if="order.status === 'shipped'"
              @click.stop="handleTrack(order)"
            >
              <text>物流</text>
            </view>
            <view class="action-btn" @click.stop="handleOrderDetail(order)">
              <text>详情</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty" v-if="filteredOrders.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单数据</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface OrderProduct {
  name: string
  spec: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  orderNo: string
  status: 'toShip' | 'shipped' | 'completed' | 'afterSale'
  products: OrderProduct[]
  totalAmount: number
  createTime: string
  buyerName: string
}

const activeTab = ref('all')
const searchKeyword = ref('')

const orders = ref<Order[]>([
  {
    id: 'so001',
    orderNo: 'SO2024010001',
    status: 'toShip',
    products: [
      { name: '水泥 P.O 42.5', spec: '50kg/袋', price: 450, quantity: 100, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 45000,
    createTime: '2024-01-15 10:30:00',
    buyerName: '深圳建工集团',
  },
  {
    id: 'so002',
    orderNo: 'SO2024010002',
    status: 'toShip',
    products: [
      { name: '螺纹钢 HRB400 16mm', spec: '16mm', price: 4280, quantity: 10, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 42800,
    createTime: '2024-01-15 09:20:00',
    buyerName: '中建三局',
  },
  {
    id: 'so003',
    orderNo: 'SO2024010003',
    status: 'shipped',
    products: [
      { name: '黄砂 中砂', spec: '中砂', price: 95, quantity: 500, image: 'https://via.placeholder.com/100' },
      { name: '碎石 5-31.5mm', spec: '5-31.5mm', price: 85, quantity: 300, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 73000,
    createTime: '2024-01-14 16:45:00',
    buyerName: '深圳湾置业',
  },
  {
    id: 'so004',
    orderNo: 'SO2024010004',
    status: 'completed',
    products: [
      { name: '商品混凝土 C30', spec: 'C30', price: 420, quantity: 200, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 84000,
    createTime: '2024-01-13 14:20:00',
    buyerName: '万科地产',
  },
  {
    id: 'so005',
    orderNo: 'SO2024010005',
    status: 'afterSale',
    products: [
      { name: '防水涂料 聚氨酯', spec: '20kg/桶', price: 380, quantity: 50, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 19000,
    createTime: '2024-01-12 11:30:00',
    buyerName: '恒大地产',
  },
  {
    id: 'so006',
    orderNo: 'SO2024010006',
    status: 'toShip',
    products: [
      { name: '轻钢龙骨 50型', spec: '50mm', price: 28, quantity: 500, image: 'https://via.placeholder.com/100' },
      { name: '石膏板 12mm', spec: '1200x2400mm', price: 45, quantity: 200, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 23000,
    createTime: '2024-01-15 08:15:00',
    buyerName: '华润置地',
  },
  {
    id: 'so007',
    orderNo: 'SO2024010007',
    status: 'shipped',
    products: [
      { name: '电线 BV 2.5mm²', spec: '2.5mm²', price: 180, quantity: 100, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 18000,
    createTime: '2024-01-14 09:30:00',
    buyerName: '招商地产',
  },
  {
    id: 'so008',
    orderNo: 'SO2024010008',
    status: 'completed',
    products: [
      { name: '水管 PPR 20mm', spec: '20mm', price: 15, quantity: 1000, image: 'https://via.placeholder.com/100' },
    ],
    totalAmount: 15000,
    createTime: '2024-01-11 15:40:00',
    buyerName: '碧桂园',
  },
])

const statusCounts = computed(() => ({
  all: orders.value.length,
  toShip: orders.value.filter(o => o.status === 'toShip').length,
  shipped: orders.value.filter(o => o.status === 'shipped').length,
  completed: orders.value.filter(o => o.status === 'completed').length,
  afterSale: orders.value.filter(o => o.status === 'afterSale').length,
}))

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(keyword) ||
      o.products.some(p => p.name.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    toShip: '待发货',
    shipped: '已发货',
    completed: '已完成',
    afterSale: '售后中',
  }
  return map[status] || status
}

function handleOrderDetail(order: Order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

function handleShip(order: Order) {
  uni.navigateTo({ url: `/pages/order/ship?orderId=${order.id}` })
}

function handleTrack(order: Order) {
  uni.showToast({ title: '物流查询功能开发中', icon: 'none' })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage?.options?.status) {
    activeTab.value = currentPage.options.status
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.tabs {
  display: flex;
  background-color: #fff;
  padding: 0 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  position: relative;
  
  &.active {
    .tab-text {
      color: #165dff;
      font-weight: 600;
    }
    
    .tab-count {
      color: #165dff;
    }
    
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

.tab-text {
  font-size: 28rpx;
  color: #86909c;
}

.tab-count {
  font-size: 24rpx;
  color: #c9cdd4;
  margin-top: 4rpx;
}

.search-bar {
  padding: 24rpx 32rpx;
  background-color: #fff;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #f7f8fa;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
}

.placeholder {
  color: #c9cdd4;
}

.order-list {
  padding: 24rpx 32rpx;
}

.order-card {
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
  .label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .value {
    font-size: 24rpx;
    color: #1d2129;
  }
}

.order-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  
  &.toShip {
    background-color: #fff7e8;
    color: #ff7d00;
  }
  
  &.shipped {
    background-color: #e8f3ff;
    color: #165dff;
  }
  
  &.completed {
    background-color: #e8ffea;
    color: #00b42a;
  }
  
  &.afterSale {
    background-color: #ffece8;
    color: #f53f3f;
  }
}

.order-products {
  padding: 24rpx;
}

.product-item {
  display: flex;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
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
  font-weight: 500;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 28rpx;
  color: #f53f3f;
  font-weight: 500;
}

.product-qty {
  font-size: 24rpx;
  color: #86909c;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-top: 1rpx solid #f7f8fa;
}

.order-amount {
  .amount-label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .amount-value {
    font-size: 32rpx;
    color: #f53f3f;
    font-weight: 600;
  }
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  border: 1rpx solid #e5e6eb;
  font-size: 24rpx;
  color: #1d2129;
  
  &.primary {
    background-color: #165dff;
    border-color: #165dff;
    color: #fff;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}
</style>
