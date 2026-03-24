<template>
  <view class="page">
    <view class="status-card" :style="{ backgroundColor: getStatusBgColor(orderInfo.status) }">
      <view class="status-icon">{{ getStatusIcon(orderInfo.status) }}</view>
      <view class="status-text">{{ orderInfo.statusText }}</view>
      <view class="status-desc">{{ getStatusDesc(orderInfo.status) }}</view>
    </view>

    <view class="info-card" v-if="orderInfo.type === 'sale'">
      <view class="card-title">客户信息</view>
      <view class="info-row">
        <text class="info-label">客户名称</text>
        <text class="info-value">{{ orderInfo.customerName }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">联系电话</text>
        <text class="info-value">{{ orderInfo.customerPhone }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">收货地址</text>
        <text class="info-value">{{ orderInfo.address }}</text>
      </view>
    </view>

    <view class="info-card" v-if="orderInfo.type === 'purchase'">
      <view class="card-title">供应商信息</view>
      <view class="info-row">
        <text class="info-label">供应商名称</text>
        <text class="info-value">{{ orderInfo.supplierName }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">联系电话</text>
        <text class="info-value">{{ orderInfo.supplierPhone }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">供应商地址</text>
        <text class="info-value">{{ orderInfo.supplierAddress }}</text>
      </view>
    </view>

    <view class="info-card">
      <view class="card-title">订单信息</view>
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <view class="info-value-wrap">
          <text class="info-value">{{ orderInfo.orderNo }}</text>
          <text class="copy-btn" @click="handleCopy(orderInfo.orderNo)">复制</text>
        </view>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ orderInfo.createTime }}</text>
      </view>
      <view class="info-row" v-if="orderInfo.payTime">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ orderInfo.payTime }}</text>
      </view>
      <view class="info-row" v-if="orderInfo.shipTime">
        <text class="info-label">发货时间</text>
        <text class="info-value">{{ orderInfo.shipTime }}</text>
      </view>
      <view class="info-row" v-if="orderInfo.receiveTime">
        <text class="info-label">收货时间</text>
        <text class="info-value">{{ orderInfo.receiveTime }}</text>
      </view>
    </view>

    <view class="product-card">
      <view class="card-title">商品明细</view>
      <view class="product-list">
        <view class="product-item" v-for="item in orderInfo.products" :key="item.id">
          <image :src="item.image" class="product-image" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-spec">{{ item.spec }}</text>
            <view class="product-tags">
              <text class="tag" v-if="item.isGift">赠品</text>
            </view>
          </view>
          <view class="product-right">
            <text class="product-price">¥{{ item.price }}</text>
            <text class="product-qty">x{{ item.qty }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="amount-card">
      <view class="amount-row">
        <text class="amount-label">商品金额</text>
        <text class="amount-value">¥{{ orderInfo.productAmount }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">运费</text>
        <text class="amount-value">¥{{ orderInfo.freight }}</text>
      </view>
      <view class="amount-row" v-if="orderInfo.discount">
        <text class="amount-label">优惠</text>
        <text class="amount-value discount">-¥{{ orderInfo.discount }}</text>
      </view>
      <view class="amount-row total">
        <text class="amount-label">订单总额</text>
        <text class="amount-value">¥{{ orderInfo.totalAmount }}</text>
      </view>
    </view>

    <view class="logistics-card" v-if="orderInfo.logistics">
      <view class="card-title">物流信息</view>
      <view class="logistics-info">
        <view class="logistics-row">
          <text class="logistics-label">物流公司</text>
          <text class="logistics-value">{{ orderInfo.logistics.company }}</text>
        </view>
        <view class="logistics-row">
          <text class="logistics-label">物流单号</text>
          <view class="logistics-value-wrap">
            <text class="logistics-value">{{ orderInfo.logistics.no }}</text>
            <text class="copy-btn" @click="handleCopy(orderInfo.logistics.no)">复制</text>
          </view>
        </view>
      </view>
      <view class="logistics-timeline">
        <view class="timeline-item" v-for="(item, index) in orderInfo.logistics.timeline" :key="index">
          <view class="timeline-dot" :class="{ active: index === 0 }"></view>
          <view class="timeline-content">
            <text class="timeline-text" :class="{ active: index === 0 }">{{ item.text }}</text>
            <text class="timeline-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="action-bar" v-if="showActions">
      <view class="action-btn" v-if="orderInfo.status === 'toShip'" @click="handleShip">发货</view>
      <view class="action-btn" v-if="orderInfo.status === 'toShip'" @click="handlePrint">打印发货单</view>
      <view class="action-btn primary" v-if="orderInfo.status === 'toReceive'" @click="handleReceive">确认入库</view>
      <view class="action-btn" v-if="orderInfo.status === 'toConfirm'" @click="handleCancel">取消订单</view>
      <view class="action-btn primary" v-if="orderInfo.status === 'toConfirm'" @click="handleConfirm">确认订单</view>
      <view class="action-btn" v-if="orderInfo.status === 'toPay'" @click="handlePay">立即付款</view>
      <view class="action-btn" v-if="orderInfo.status === 'completed'" @click="handleInvoice">申请开票</view>
      <view class="action-btn" v-if="orderInfo.status === 'shipped'" @click="handleTrack">查看物流</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const orderInfo = ref({
  id: 'so001',
  orderNo: 'SO2024010012',
  type: 'sale',
  status: 'toShip',
  statusText: '待发货',
  createTime: '2024-01-15 14:30:25',
  payTime: '2024-01-15 14:32:18',
  customerName: '深圳建设集团',
  customerPhone: '138****8888',
  address: '广东省深圳市南山区科技园南区深圳湾科技生态园10栋',
  productAmount: '4,500.00',
  freight: '0.00',
  discount: '50.00',
  totalAmount: '4,450.00',
  products: [
    { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5级 | 袋装', image: 'https://picsum.photos/100/100?random=1', price: '450.00', qty: 10, isGift: false },
  ],
  logistics: null,
})

const showActions = computed(() => {
  return ['toShip', 'toReceive', 'toConfirm', 'toPay', 'completed', 'shipped'].includes(orderInfo.value.status)
})

function getStatusBgColor(status: string) {
  const colors: Record<string, string> = {
    toPay: '#722ed1',
    toShip: '#ff7d00',
    shipped: '#165dff',
    toReceive: '#165dff',
    completed: '#00b42a',
    afterSale: '#f53f3f',
    toConfirm: '#ff7d00',
  }
  return colors[status] || '#165dff'
}

function getStatusIcon(status: string) {
  const icons: Record<string, string> = {
    toPay: '💳',
    toShip: '📦',
    shipped: '🚚',
    toReceive: '📥',
    completed: '✅',
    afterSale: '🔄',
    toConfirm: '⏳',
  }
  return icons[status] || '📋'
}

function getStatusDesc(status: string) {
  const descs: Record<string, string> = {
    toPay: '等待买家付款',
    toShip: '请尽快安排发货',
    shipped: '商品正在配送中',
    toReceive: '商品已发出，等待收货入库',
    completed: '订单已完成',
    afterSale: '售后处理中',
    toConfirm: '等待确认采购订单',
  }
  return descs[status] || ''
}

function handleCopy(text: string) {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    },
  })
}

function handleShip() {
  uni.navigateTo({ url: `/pages/order/ship?id=${orderInfo.value.id}` })
}

function handlePrint() {
  uni.showToast({ title: '打印发货单', icon: 'none' })
}

function handleReceive() {
  uni.navigateTo({ url: `/pages/order/receive?id=${orderInfo.value.id}` })
}

function handleConfirm() {
  uni.showModal({
    title: '确认订单',
    content: '确定确认该采购订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已确认', icon: 'success' })
      }
    },
  })
}

function handleCancel() {
  uni.showModal({
    title: '取消订单',
    content: '确定取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已取消', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
  })
}

function handlePay() {
  uni.showModal({
    title: '支付采购款',
    content: `确定支付 ¥${orderInfo.value.totalAmount} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '支付成功', icon: 'success' })
      }
    },
  })
}

function handleInvoice() {
  uni.navigateTo({ url: '/pages/mine/invoice' })
}

function handleTrack() {
  uni.showToast({ title: '查看物流', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.status-card {
  padding: 48rpx 32rpx;
  color: #fff;
  text-align: center;
}

.status-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.info-card, .product-card, .amount-card, .logistics-card {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.card-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #86909c;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #1d2129;
  text-align: right;
  flex: 1;
  margin-left: 24rpx;
}

.info-value-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.copy-btn {
  font-size: 22rpx;
  color: #165dff;
  margin-left: 16rpx;
  padding: 4rpx 12rpx;
  background-color: #e8f3ff;
  border-radius: 4rpx;
}

.product-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
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
  margin-top: 8rpx;
  display: block;
}

.product-tags {
  margin-top: 8rpx;
}

.tag {
  font-size: 20rpx;
  color: #ff7d00;
  background-color: #fff7e8;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.product-right {
  text-align: right;
  flex-shrink: 0;
}

.product-price {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-qty {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  
  &.total {
    padding-top: 20rpx;
    margin-top: 12rpx;
    border-top: 1rpx solid #f0f0f0;
  }
}

.amount-label {
  font-size: 26rpx;
  color: #86909c;
}

.amount-value {
  font-size: 26rpx;
  color: #1d2129;
  
  &.discount {
    color: #00b42a;
  }
}

.total .amount-value {
  font-size: 32rpx;
  color: #f53f3f;
  font-weight: 600;
}

.logistics-info {
  margin-bottom: 20rpx;
}

.logistics-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.logistics-label {
  font-size: 26rpx;
  color: #86909c;
}

.logistics-value-wrap {
  display: flex;
  align-items: center;
}

.logistics-value {
  font-size: 26rpx;
  color: #1d2129;
}

.logistics-timeline {
  padding-left: 24rpx;
}

.timeline-item {
  display: flex;
  padding: 16rpx 0;
  position: relative;
  
  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 7rpx;
    top: 40rpx;
    bottom: 0;
    width: 2rpx;
    background-color: #e5e6eb;
  }
}

.timeline-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #c9cdd4;
  flex-shrink: 0;
  margin-top: 6rpx;
  
  &.active {
    background-color: #165dff;
  }
}

.timeline-content {
  margin-left: 16rpx;
  flex: 1;
}

.timeline-text {
  font-size: 26rpx;
  color: #86909c;
  display: block;
  
  &.active {
    color: #1d2129;
  }
}

.timeline-time {
  font-size: 22rpx;
  color: #c9cdd4;
  margin-top: 4rpx;
  display: block;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 32rpx;
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}
</style>
