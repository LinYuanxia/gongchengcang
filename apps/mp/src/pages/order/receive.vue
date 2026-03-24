<template>
  <view class="page">
    <view class="scan-section" @click="handleScan">
      <text class="scan-icon">📷</text>
      <text class="scan-text">点击扫码入库</text>
      <text class="scan-hint">扫描采购订单条码快速入库</text>
    </view>

    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索订单号/供应商名称" 
        class="search-input"
      />
      <view class="filter-btn" @click="showFilter = true">
        <text>筛选</text>
      </view>
    </view>

    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">待入库</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.today }}</text>
        <text class="stat-label">今日到货</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.inTransit }}</text>
        <text class="stat-label">运输中</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.partial }}</text>
        <text class="stat-label">部分入库</text>
      </view>
    </view>

    <view class="order-list">
      <view class="order-item" v-for="item in filteredOrders" :key="item.id">
        <view class="order-header">
          <view class="order-left">
            <text class="order-no">{{ item.orderNo }}</text>
            <view class="order-tags">
              <text class="tag" :class="item.status">{{ item.statusText }}</text>
              <text class="tag partial" v-if="item.receivedQty > 0">部分入库</text>
            </view>
          </view>
          <text class="order-time">{{ item.createTime }}</text>
        </view>
        
        <view class="supplier-info">
          <text class="supplier-icon">🏭</text>
          <view class="supplier-detail">
            <text class="supplier-name">{{ item.supplierName }}</text>
            <text class="supplier-contact">{{ item.contactName }} {{ item.contactPhone }}</text>
          </view>
          <text class="call-icon" @click="handleCallSupplier(item)">📞</text>
        </view>
        
        <view class="logistics-info" v-if="item.logisticsNo">
          <text class="logistics-label">物流信息:</text>
          <text class="logistics-company">{{ item.logisticsCompany }}</text>
          <text class="logistics-no">{{ item.logisticsNo }}</text>
          <text class="track-btn" @click="handleTrack(item)">查看</text>
        </view>
        
        <view class="order-products">
          <view class="product-row" v-for="prod in item.products" :key="prod.id">
            <image :src="prod.image" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ prod.name }}</text>
              <text class="product-spec">{{ prod.spec }}</text>
              <view class="product-warehouse">
                <text class="warehouse-label">入库仓库:</text>
                <text class="warehouse-name">{{ prod.warehouse || '默认仓库' }}</text>
              </view>
            </view>
            <view class="product-right">
              <text class="product-qty">x{{ prod.qty }}</text>
              <text class="product-received" v-if="prod.receivedQty">已入: {{ prod.receivedQty }}</text>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-total">
            <text class="total-label">共{{ item.totalQty }}件</text>
            <text class="total-price">¥{{ item.totalAmount }}</text>
          </view>
          <view class="order-progress" v-if="item.receivedQty > 0">
            <text class="progress-text">已入库 {{ item.receivedQty }}/{{ item.totalQty }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: (item.receivedQty / item.totalQty * 100) + '%' }"></view>
            </view>
          </view>
        </view>
        
        <view class="order-actions">
          <view class="action-btn" @click="handleDetail(item)">详情</view>
          <view class="action-btn" v-if="item.receivedQty > 0 && item.receivedQty < item.totalQty" @click="handleContinueReceive(item)">继续入库</view>
          <view class="action-btn primary" @click="handleReceive(item)">确认入库</view>
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
          <text class="filter-label">订单状态</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterStatus === '' }"
              @click="filterStatus = ''"
            >全部</view>
            <view 
              class="filter-option" 
              :class="{ active: filterStatus === 'inTransit' }"
              @click="filterStatus = 'inTransit'"
            >运输中</view>
            <view 
              class="filter-option" 
              :class="{ active: filterStatus === 'arrived' }"
              @click="filterStatus = 'arrived'"
            >已到货</view>
            <view 
              class="filter-option" 
              :class="{ active: filterStatus === 'partial' }"
              @click="filterStatus = 'partial'"
            >部分入库</view>
          </view>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">供应商</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterSupplier === '' }"
              @click="filterSupplier = ''"
            >全部</view>
            <view 
              class="filter-option" 
              :class="{ active: filterSupplier === '华新' }"
              @click="filterSupplier = '华新'"
            >华新水泥</view>
            <view 
              class="filter-option" 
              :class="{ active: filterSupplier === '宝钢' }"
              @click="filterSupplier = '宝钢'"
            >宝钢</view>
          </view>
        </view>
        
        <view class="filter-actions">
          <view class="filter-btn cancel" @click="showFilter = false">取消</view>
          <view class="filter-btn confirm" @click="applyFilter">确定</view>
        </view>
      </view>
    </view>

    <view class="receive-modal" v-if="showReceiveModal" @click.self="showReceiveModal = false">
      <view class="receive-content">
        <view class="receive-header">
          <text class="receive-title">入库确认</text>
          <text class="receive-close" @click="showReceiveModal = false">✕</text>
        </view>
        
        <view class="receive-order-info">
          <text class="receive-order-no">{{ currentOrder?.orderNo }}</text>
          <text class="receive-supplier">{{ currentOrder?.supplierName }}</text>
        </view>
        
        <view class="receive-products">
          <view class="receive-product" v-for="prod in currentOrder?.products" :key="prod.id">
            <view class="product-header">
              <text class="product-name">{{ prod.name }}</text>
              <text class="product-spec">{{ prod.spec }}</text>
            </view>
            <view class="product-inputs">
              <view class="input-row">
                <text class="input-label">采购数量:</text>
                <text class="input-value">{{ prod.qty }}</text>
              </view>
              <view class="input-row">
                <text class="input-label">已入库:</text>
                <text class="input-value">{{ prod.receivedQty || 0 }}</text>
              </view>
              <view class="input-row">
                <text class="input-label">本次入库:</text>
                <view class="qty-input-wrap">
                  <view class="qty-btn" @click="prod.receiveQty = Math.max(0, (prod.receiveQty || 0) - 1)">-</view>
                  <input type="number" v-model="prod.receiveQty" class="qty-input" />
                  <view class="qty-btn" @click="prod.receiveQty = Math.min(prod.qty - (prod.receivedQty || 0), (prod.receiveQty || 0) + 1)">+</view>
                </view>
              </view>
              <view class="input-row">
                <text class="input-label">入库仓库:</text>
                <picker :value="prod.warehouseIndex || 0" :range="warehouses" @change="prod.warehouseIndex = $event.detail.value">
                  <view class="form-picker">
                    <text>{{ warehouses[prod.warehouseIndex || 0] }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
              <view class="input-row">
                <text class="input-label">库位:</text>
                <input type="text" v-model="prod.location" placeholder="选填" class="form-input-small" />
              </view>
            </view>
          </view>
        </view>
        
        <view class="receive-form">
          <view class="form-row">
            <text class="form-label">入库类型</text>
            <picker :value="receiveTypeIndex" :range="receiveTypes" @change="receiveTypeIndex = $event.detail.value">
              <view class="form-picker">
                <text>{{ receiveTypes[receiveTypeIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">质检状态</text>
            <picker :value="qualityIndex" :range="qualityStatus" @change="qualityIndex = $event.detail.value">
              <view class="form-picker">
                <text>{{ qualityStatus[qualityIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">备注</text>
            <textarea v-model="receiveRemark" placeholder="选填" class="form-textarea" />
          </view>
          <view class="form-row">
            <text class="form-label">拍照上传</text>
            <view class="upload-area">
              <view class="upload-item" v-for="(img, idx) in uploadImages" :key="idx">
                <image :src="img" class="upload-image" />
                <text class="upload-delete" @click="uploadImages.splice(idx, 1)">✕</text>
              </view>
              <view class="upload-btn" @click="handleUpload">
                <text class="upload-icon">+</text>
                <text class="upload-text">添加照片</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="receive-actions">
          <view class="receive-btn" @click="handlePartialReceive">部分入库</view>
          <view class="receive-btn primary" @click="confirmReceive">确认入库</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const showFilter = ref(false)
const filterStatus = ref('')
const filterSupplier = ref('')
const showReceiveModal = ref(false)
const currentOrder = ref<any>(null)
const receiveTypeIndex = ref(0)
const qualityIndex = ref(0)
const receiveRemark = ref('')
const uploadImages = ref<string[]>([])

const warehouses = ['默认仓库', 'A区仓库', 'B区仓库', 'C区仓库']
const receiveTypes = ['采购入库', '退货入库', '调拨入库']
const qualityStatus = ['合格', '待检', '不合格']

const stats = ref({
  total: 8,
  today: 3,
  inTransit: 5,
  partial: 2,
})

const orders = ref([
  {
    id: 'po001',
    orderNo: 'PO2024010002',
    status: 'arrived',
    statusText: '已到货',
    createTime: '2024-01-15 14:30',
    supplierName: '宝钢供应商',
    contactName: '张经理',
    contactPhone: '138****8888',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890',
    receivedQty: 0,
    totalQty: 10,
    totalAmount: '39,500.00',
    products: [
      { id: 'p1', name: '螺纹钢 HRB400 20mm', spec: '20mm', image: 'https://picsum.photos/100/100?random=1', qty: 10, receivedQty: 0, warehouse: 'A区仓库' },
    ],
  },
  {
    id: 'po002',
    orderNo: 'PO2024010003',
    status: 'inTransit',
    statusText: '运输中',
    createTime: '2024-01-14 10:20',
    supplierName: '华新水泥供应商',
    contactName: '李经理',
    contactPhone: '139****9999',
    logisticsCompany: '中通快递',
    logisticsNo: 'ZT9876543210',
    receivedQty: 15,
    totalQty: 30,
    totalAmount: '12,600.00',
    products: [
      { id: 'p2', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=2', qty: 30, receivedQty: 15, warehouse: 'B区仓库' },
    ],
  },
  {
    id: 'po003',
    orderNo: 'PO2024010004',
    status: 'arrived',
    statusText: '已到货',
    createTime: '2024-01-13 16:45',
    supplierName: '南方建材供应商',
    contactName: '王经理',
    contactPhone: '137****7777',
    logisticsCompany: '自配送',
    logisticsNo: '',
    receivedQty: 0,
    totalQty: 100,
    totalAmount: '8,000.00',
    products: [
      { id: 'p3', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=3', qty: 100, receivedQty: 0, warehouse: 'C区仓库' },
    ],
  },
])

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(kw) || 
      o.supplierName.toLowerCase().includes(kw)
    )
  }
  
  if (filterStatus.value === 'inTransit') {
    result = result.filter(o => o.status === 'inTransit')
  } else if (filterStatus.value === 'arrived') {
    result = result.filter(o => o.status === 'arrived')
  } else if (filterStatus.value === 'partial') {
    result = result.filter(o => o.receivedQty > 0)
  }
  
  if (filterSupplier.value) {
    result = result.filter(o => o.supplierName.includes(filterSupplier.value))
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

function handleCallSupplier(item: any) {
  uni.makePhoneCall({
    phoneNumber: item.contactPhone,
    fail: () => {
      uni.showToast({ title: '拨打电话失败', icon: 'none' })
    },
  })
}

function handleTrack(item: any) {
  uni.showToast({ title: '查看物流', icon: 'none' })
}

function handleDetail(item: any) {
  uni.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=purchase` })
}

function handleReceive(item: any) {
  currentOrder.value = JSON.parse(JSON.stringify(item))
  currentOrder.value.products.forEach((p: any) => {
    p.receiveQty = p.qty - (p.receivedQty || 0)
    p.warehouseIndex = warehouses.indexOf(p.warehouse) || 0
  })
  showReceiveModal.value = true
}

function handleContinueReceive(item: any) {
  handleReceive(item)
}

function handleUpload() {
  uni.chooseImage({
    count: 3,
    success: (res) => {
      uploadImages.value = [...uploadImages.value, ...res.tempFilePaths]
    },
  })
}

function handlePartialReceive() {
  uni.showToast({ title: '部分入库成功', icon: 'success' })
  showReceiveModal.value = false
}

function confirmReceive() {
  uni.showToast({ title: '入库成功', icon: 'success' })
  showReceiveModal.value = false
}

function resetFilter() {
  filterStatus.value = ''
  filterSupplier.value = ''
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
  background: linear-gradient(135deg, #00b42a 0%, #00c853 100%);
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
  color: #00b42a;
  background-color: #e8ffea;
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
  
  &.inTransit {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  &.arrived {
    color: #00b42a;
    background-color: #e8ffea;
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

.supplier-info {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.supplier-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.supplier-detail {
  flex: 1;
}

.supplier-name {
  display: block;
  font-size: 26rpx;
  color: #1d2129;
}

.supplier-contact {
  display: block;
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.call-icon {
  font-size: 32rpx;
  padding: 8rpx;
}

.logistics-info {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
}

.logistics-label {
  color: #86909c;
}

.logistics-company {
  color: #1d2129;
  margin-left: 8rpx;
}

.logistics-no {
  color: #165dff;
  margin-left: 8rpx;
}

.track-btn {
  margin-left: auto;
  color: #165dff;
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

.product-warehouse {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.warehouse-label {
  font-size: 22rpx;
  color: #86909c;
}

.warehouse-name {
  font-size: 22rpx;
  color: #165dff;
  margin-left: 4rpx;
}

.product-right {
  text-align: right;
}

.product-qty {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-received {
  font-size: 22rpx;
  color: #00b42a;
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
  background-color: #00b42a;
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
    background-color: #00b42a;
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
  color: #00b42a;
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
    color: #00b42a;
    background-color: #e8ffea;
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
    background-color: #00b42a;
  }
}

.receive-modal {
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

.receive-content {
  width: 100%;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 85vh;
  overflow-y: auto;
}

.receive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.receive-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.receive-close {
  font-size: 32rpx;
  color: #86909c;
}

.receive-order-info {
  padding: 24rpx 32rpx;
  background-color: #f7f8fa;
}

.receive-order-no {
  display: block;
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.receive-supplier {
  display: block;
  font-size: 26rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.receive-products {
  padding: 24rpx 32rpx;
}

.receive-product {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
}

.product-header {
  margin-bottom: 12rpx;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-left: 8rpx;
}

.product-inputs {
  background-color: #f7f8fa;
  border-radius: 8rpx;
  padding: 16rpx;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  width: 140rpx;
  font-size: 26rpx;
  color: #86909c;
}

.input-value {
  font-size: 26rpx;
  color: #1d2129;
}

.qty-input-wrap {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #1d2129;
  background-color: #fff;
  border-radius: 8rpx;
  border: 1rpx solid #e5e6eb;
}

.qty-input {
  width: 80rpx;
  height: 48rpx;
  text-align: center;
  font-size: 26rpx;
  margin: 0 8rpx;
  background-color: #fff;
  border: 1rpx solid #e5e6eb;
  border-radius: 8rpx;
}

.form-picker {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: 1rpx solid #e5e6eb;
}

.picker-arrow {
  font-size: 18rpx;
  color: #86909c;
}

.form-input-small {
  flex: 1;
  padding: 12rpx 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: 1rpx solid #e5e6eb;
}

.receive-form {
  padding: 24rpx 32rpx;
}

.form-row {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #1d2129;
  margin-bottom: 12rpx;
}

.form-textarea {
  width: 100%;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 100rpx;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.upload-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.upload-delete {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 32rpx;
  height: 32rpx;
  background-color: #f53f3f;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #c9cdd4;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  color: #c9cdd4;
}

.upload-text {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.receive-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.receive-btn {
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
    background-color: #00b42a;
  }
}
</style>
