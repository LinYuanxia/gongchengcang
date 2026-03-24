<template>
  <view class="page">
    <view class="scan-section" @click="handleScan">
      <text class="scan-icon">📷</text>
      <text class="scan-text">点击扫码发货</text>
      <text class="scan-hint">扫描订单条码快速发货</text>
    </view>

    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索订单号/客户名称" 
        class="search-input"
      />
      <view class="filter-btn" @click="showFilter = true">
        <text>筛选</text>
      </view>
    </view>

    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">待发货</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.today }}</text>
        <text class="stat-label">今日订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.urgent }}</text>
        <text class="stat-label">加急订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.partial }}</text>
        <text class="stat-label">部分发货</text>
      </view>
    </view>

    <view class="order-list">
      <view class="order-item" v-for="item in filteredOrders" :key="item.id">
        <view class="order-header">
          <view class="order-left">
            <text class="order-no">{{ item.orderNo }}</text>
            <view class="order-tags">
              <text class="tag urgent" v-if="item.isUrgent">加急</text>
              <text class="tag partial" v-if="item.shippedQty > 0">部分发货</text>
            </view>
          </view>
          <text class="order-time">{{ item.createTime }}</text>
        </view>
        
        <view class="customer-info" @click="handleCallCustomer(item)">
          <text class="customer-icon">👤</text>
          <view class="customer-detail">
            <text class="customer-name">{{ item.customerName }}</text>
            <text class="customer-address">{{ item.address }}</text>
          </view>
          <text class="call-icon">📞</text>
        </view>
        
        <view class="order-products">
          <view class="product-row" v-for="prod in item.products" :key="prod.id">
            <image :src="prod.image" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ prod.name }}</text>
              <text class="product-spec">{{ prod.spec }}</text>
              <view class="product-stock">
                <text class="stock-label">库存:</text>
                <text class="stock-value" :class="{ low: prod.stock < prod.qty }">{{ prod.stock }}</text>
              </view>
            </view>
            <view class="product-right">
              <text class="product-qty">x{{ prod.qty }}</text>
              <text class="product-shipped" v-if="prod.shippedQty">已发: {{ prod.shippedQty }}</text>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-total">
            <text class="total-label">共{{ item.totalQty }}件</text>
            <text class="total-price">¥{{ item.totalAmount }}</text>
          </view>
          <view class="order-progress" v-if="item.shippedQty > 0">
            <text class="progress-text">已发货 {{ item.shippedQty }}/{{ item.totalQty }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: (item.shippedQty / item.totalQty * 100) + '%' }"></view>
            </view>
          </view>
        </view>
        
        <view class="order-actions">
          <view class="action-btn" @click="handlePrint(item)">打印</view>
          <view class="action-btn" v-if="item.shippedQty > 0 && item.shippedQty < item.totalQty" @click="handleContinueShip(item)">继续发货</view>
          <view class="action-btn primary" @click="handleShip(item)">发货</view>
        </view>
      </view>
    </view>

    <view class="filter-drawer" v-if="showFilter" @click.self="showFilter = false">
      <view class="filter-content">
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <text class="filter-reset" @click="resetFilter">重置</text>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">订单类型</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterType === '' }"
              @click="filterType = ''"
            >全部</view>
            <view 
              class="filter-option" 
              :class="{ active: filterType === 'urgent' }"
              @click="filterType = 'urgent'"
            >加急订单</view>
            <view 
              class="filter-option" 
              :class="{ active: filterType === 'partial' }"
              @click="filterType = 'partial'"
            >部分发货</view>
          </view>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">日期范围</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterDate === '' }"
              @click="filterDate = ''"
            >全部</view>
            <view 
              class="filter-option" 
              :class="{ active: filterDate === 'today' }"
              @click="filterDate = 'today'"
            >今日</view>
            <view 
              class="filter-option" 
              :class="{ active: filterDate === 'week' }"
              @click="filterDate = 'week'"
            >近7天</view>
          </view>
        </view>
        
        <view class="filter-actions">
          <view class="filter-btn cancel" @click="showFilter = false">取消</view>
          <view class="filter-btn confirm" @click="applyFilter">确定</view>
        </view>
      </view>
    </view>

    <view class="ship-modal" v-if="showShipModal" @click.self="showShipModal = false">
      <view class="ship-content">
        <view class="ship-header">
          <text class="ship-title">发货确认</text>
          <text class="ship-close" @click="showShipModal = false">✕</text>
        </view>
        
        <view class="ship-order-info">
          <text class="ship-order-no">{{ currentOrder?.orderNo }}</text>
          <text class="ship-customer">{{ currentOrder?.customerName }}</text>
        </view>
        
        <view class="ship-products">
          <view class="ship-product" v-for="prod in currentOrder?.products" :key="prod.id">
            <text class="ship-product-name">{{ prod.name }}</text>
            <view class="ship-product-qty">
              <text class="qty-label">发货数量:</text>
              <view class="qty-input-wrap">
                <view class="qty-btn" @click="prod.shipQty = Math.max(1, (prod.shipQty || prod.qty) - 1)">-</view>
                <input type="number" v-model="prod.shipQty" class="qty-input" />
                <view class="qty-btn" @click="prod.shipQty = Math.min(prod.qty - (prod.shippedQty || 0), (prod.shipQty || prod.qty) + 1)">+</view>
              </view>
              <text class="qty-max">/ {{ prod.qty - (prod.shippedQty || 0) }}</text>
            </view>
          </view>
        </view>
        
        <view class="ship-form">
          <view class="form-row">
            <text class="form-label">物流公司</text>
            <picker :value="logisticsIndex" :range="logisticsCompanies" @change="logisticsIndex = $event.detail.value">
              <view class="form-picker">
                <text>{{ logisticsCompanies[logisticsIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">物流单号</text>
            <input type="text" v-model="logisticsNo" placeholder="请输入物流单号" class="form-input" />
            <text class="scan-btn" @click="scanLogistics">📷</text>
          </view>
          <view class="form-row">
            <text class="form-label">备注</text>
            <textarea v-model="shipRemark" placeholder="选填" class="form-textarea" />
          </view>
        </view>
        
        <view class="ship-actions">
          <view class="ship-btn" @click="handlePartialShip">部分发货</view>
          <view class="ship-btn primary" @click="confirmShip">确认发货</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const showFilter = ref(false)
const filterType = ref('')
const filterDate = ref('')
const showShipModal = ref(false)
const currentOrder = ref<any>(null)
const logisticsIndex = ref(0)
const logisticsNo = ref('')
const shipRemark = ref('')

const logisticsCompanies = ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '申通快递', '自配送']

const stats = ref({
  total: 12,
  today: 5,
  urgent: 2,
  partial: 3,
})

const orders = ref([
  {
    id: 'so001',
    orderNo: 'SO2024010012',
    createTime: '2024-01-15 14:30',
    customerName: '深圳建设集团',
    customerPhone: '138****8888',
    address: '深圳市南山区科技园xxx大厦',
    isUrgent: true,
    shippedQty: 0,
    totalQty: 10,
    totalAmount: '4,500.00',
    products: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=1', qty: 10, stock: 50, shippedQty: 0 },
    ],
  },
  {
    id: 'so002',
    orderNo: 'SO2024010013',
    createTime: '2024-01-15 16:20',
    customerName: '广州建筑公司',
    customerPhone: '139****9999',
    address: '广州市天河区xxx路xxx号',
    isUrgent: false,
    shippedQty: 5,
    totalQty: 10,
    totalAmount: '21,000.00',
    products: [
      { id: 'p2', name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://picsum.photos/100/100?random=2', qty: 10, stock: 20, shippedQty: 5 },
    ],
  },
  {
    id: 'so003',
    orderNo: 'SO2024010014',
    createTime: '2024-01-14 09:15',
    customerName: '东莞工程公司',
    customerPhone: '137****7777',
    address: '东莞市xxx镇xxx工业区',
    isUrgent: false,
    shippedQty: 0,
    totalQty: 50,
    totalAmount: '21,000.00',
    products: [
      { id: 'p3', name: '商品混凝土 C30', spec: 'C30', image: 'https://picsum.photos/100/100?random=3', qty: 50, stock: 30, shippedQty: 0 },
    ],
  },
])

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(kw) || 
      o.customerName.toLowerCase().includes(kw)
    )
  }
  
  if (filterType.value === 'urgent') {
    result = result.filter(o => o.isUrgent)
  } else if (filterType.value === 'partial') {
    result = result.filter(o => o.shippedQty > 0)
  }
  
  return result
})

function handleScan() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '扫码成功: ' + res.result, icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}

function handleCallCustomer(item: any) {
  uni.makePhoneCall({
    phoneNumber: item.customerPhone,
    fail: () => {
      uni.showToast({ title: '拨打电话失败', icon: 'none' })
    },
  })
}

function handlePrint(item: any) {
  uni.showToast({ title: '打印发货单', icon: 'none' })
}

function handleShip(item: any) {
  currentOrder.value = JSON.parse(JSON.stringify(item))
  currentOrder.value.products.forEach((p: any) => {
    p.shipQty = p.qty - (p.shippedQty || 0)
  })
  showShipModal.value = true
}

function handleContinueShip(item: any) {
  handleShip(item)
}

function scanLogistics() {
  uni.scanCode({
    success: (res) => {
      logisticsNo.value = res.result
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}

function handlePartialShip() {
  uni.showToast({ title: '部分发货成功', icon: 'success' })
  showShipModal.value = false
}

function confirmShip() {
  uni.showToast({ title: '发货成功', icon: 'success' })
  showShipModal.value = false
}

function resetFilter() {
  filterType.value = ''
  filterDate.value = ''
}

function applyFilter() {
  showFilter.value = false
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.scan-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  color: #fff;
}

.scan-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.scan-text {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.scan-hint {
  font-size: 24rpx;
  opacity: 0.8;
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
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.filter-btn {
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 20rpx;
}

.stats-bar {
  display: flex;
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #1d2129;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.order-list {
  padding: 0 32rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.order-left {
  display: flex;
  flex-direction: column;
}

.order-no {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.order-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
}

.tag {
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  
  &.urgent {
    color: #f53f3f;
    background-color: #ffece8;
  }
  
  &.partial {
    color: #ff7d00;
    background-color: #fff7e8;
  }
}

.order-time {
  font-size: 22rpx;
  color: #86909c;
}

.customer-info {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.customer-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.customer-detail {
  flex: 1;
}

.customer-name {
  display: block;
  font-size: 26rpx;
  color: #1d2129;
}

.customer-address {
  display: block;
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.call-icon {
  font-size: 32rpx;
  padding: 8rpx;
}

.order-products {
  margin-bottom: 16rpx;
}

.product-row {
  display: flex;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
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

.product-stock {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.stock-label {
  font-size: 22rpx;
  color: #86909c;
}

.stock-value {
  font-size: 22rpx;
  color: #00b42a;
  margin-left: 4rpx;
  
  &.low {
    color: #f53f3f;
  }
}

.product-right {
  text-align: right;
}

.product-qty {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-shipped {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.order-footer {
  padding-top: 16rpx;
  border-top: 1rpx solid #f7f8fa;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 24rpx;
  color: #86909c;
}

.total-price {
  font-size: 32rpx;
  color: #f53f3f;
  font-weight: 600;
}

.order-progress {
  margin-top: 12rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #86909c;
  display: block;
  margin-bottom: 8rpx;
}

.progress-bar {
  height: 8rpx;
  background-color: #f2f3f5;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #165dff;
  border-radius: 4rpx;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 16rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 32rpx;
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}

.filter-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.filter-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 600rpx;
  background-color: #fff;
  padding: 32rpx;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.filter-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.filter-reset {
  font-size: 28rpx;
  color: #165dff;
}

.filter-section {
  margin-bottom: 32rpx;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  color: #1d2129;
  margin-bottom: 16rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-option {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 32rpx;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
  }
}

.filter-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.filter-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  border-radius: 40rpx;
  
  &.cancel {
    color: #666;
    background-color: #f7f8fa;
  }
  
  &.confirm {
    color: #fff;
    background-color: #165dff;
  }
}

.ship-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.ship-content {
  width: 100%;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.ship-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.ship-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.ship-close {
  font-size: 32rpx;
  color: #86909c;
}

.ship-order-info {
  padding: 24rpx 32rpx;
  background-color: #f7f8fa;
}

.ship-order-no {
  display: block;
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.ship-customer {
  display: block;
  font-size: 26rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.ship-products {
  padding: 24rpx 32rpx;
}

.ship-product {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
}

.ship-product-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
  margin-bottom: 12rpx;
}

.ship-product-qty {
  display: flex;
  align-items: center;
}

.qty-label {
  font-size: 26rpx;
  color: #86909c;
  margin-right: 16rpx;
}

.qty-input-wrap {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #1d2129;
  background-color: #f7f8fa;
  border-radius: 8rpx;
}

.qty-input {
  width: 80rpx;
  height: 56rpx;
  text-align: center;
  font-size: 28rpx;
  margin: 0 8rpx;
  border: 1rpx solid #e5e6eb;
  border-radius: 8rpx;
}

.qty-max {
  font-size: 26rpx;
  color: #86909c;
  margin-left: 8rpx;
}

.ship-form {
  padding: 24rpx 32rpx;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #1d2129;
}

.form-picker {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.picker-arrow {
  font-size: 20rpx;
  color: #86909c;
}

.form-input {
  flex: 1;
  padding: 16rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.scan-btn {
  font-size: 36rpx;
  margin-left: 16rpx;
}

.form-textarea {
  flex: 1;
  padding: 16rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 120rpx;
}

.ship-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.ship-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  border-radius: 40rpx;
  
  &:not(.primary) {
    color: #666;
    background-color: #f7f8fa;
  }
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}
</style>
