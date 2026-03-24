<template>
  <view class="page">
    <view class="header-card">
      <view class="header-tabs">
        <view class="tab-item" :class="{ active: currentTab === 'overview' }" @click="currentTab = 'overview'">库存总览</view>
        <view class="tab-item" :class="{ active: currentTab === 'warning' }" @click="currentTab = 'warning'">
          库存预警
          <view class="tab-badge" v-if="warningCount > 0">{{ warningCount }}</view>
        </view>
      </view>
      <view class="header-stats" v-if="currentTab === 'overview'">
        <view class="stat-item">
          <text class="stat-value">{{ totalSku }}</text>
          <text class="stat-label">SKU数量</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">¥{{ totalValue }}</text>
          <text class="stat-label">库存总值</text>
        </view>
        <view class="stat-item">
          <text class="stat-value warning">{{ warningCount }}</text>
          <text class="stat-label">预警数量</text>
        </view>
        <view class="stat-item">
          <text class="stat-value out">{{ outCount }}</text>
          <text class="stat-label">缺货数量</text>
        </view>
      </view>
      <view class="warning-stats" v-if="currentTab === 'warning'">
        <view class="warning-item">
          <text class="warning-value">{{ warningCount }}</text>
          <text class="warning-label">低库存预警</text>
        </view>
        <view class="warning-item">
          <text class="warning-value">{{ outCount }}</text>
          <text class="warning-label">缺货商品</text>
        </view>
        <view class="warning-item">
          <text class="warning-value">{{ expireCount }}</text>
          <text class="warning-label">临期商品</text>
        </view>
      </view>
    </view>

    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索商品名称/编码" 
        class="search-input"
      />
      <view class="filter-btn" @click="showFilter = true">
        <text>筛选</text>
      </view>
    </view>

    <view class="filter-bar" v-if="currentTab === 'overview'">
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'all' }"
        @click="filterType = 'all'"
      >全部</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'warning' }"
        @click="filterType = 'warning'"
      >
        预警
        <view class="badge" v-if="warningCount > 0">{{ warningCount }}</view>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'out' }"
        @click="filterType = 'out'"
      >缺货</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'normal' }"
        @click="filterType = 'normal'"
      >正常</view>
    </view>

    <view class="stock-list">
      <view class="stock-item" v-for="item in filteredStock" :key="item.id" @click="handleDetail(item)">
        <view class="stock-header">
          <text class="stock-sku">{{ item.skuCode }}</text>
          <text class="status-tag" :class="getStockStatus(item)">{{ getStockStatusText(item) }}</text>
        </view>
        <view class="stock-body">
          <image :src="item.image" class="stock-image" />
          <view class="stock-info">
            <text class="stock-name">{{ item.name }}</text>
            <text class="stock-spec">{{ item.spec }}</text>
            <view class="stock-warehouse">
              <text class="warehouse-label">仓库:</text>
              <text class="warehouse-name">{{ item.warehouse }}</text>
            </view>
            <view class="stock-location" v-if="item.location">
              <text class="location-label">库位:</text>
              <text class="location-value">{{ item.location }}</text>
            </view>
          </view>
          <view class="stock-right">
            <text class="stock-qty">{{ item.stock }}</text>
            <text class="stock-unit">{{ item.unit }}</text>
          </view>
        </view>
        <view class="stock-bar">
          <view class="bar-info">
            <text class="bar-label">库存状态</text>
            <text class="bar-text">预警线: {{ item.warningStock }} | 最大库存: {{ item.maxStock }}</text>
          </view>
          <view class="bar-bg">
            <view class="bar-fill" :style="{ width: getStockPercent(item) + '%', background: getStockColor(item) }"></view>
          </view>
        </view>
        <view class="stock-footer">
          <view class="stock-price">
            <text class="price-label">成本价:</text>
            <text class="price-value">¥{{ item.costPrice }}</text>
          </view>
          <view class="stock-actions">
            <view class="action-btn" @click.stop="handleInStock(item)">入库</view>
            <view class="action-btn" @click.stop="handleOutStock(item)">出库</view>
          </view>
        </view>
      </view>
    </view>

    <view class="quick-actions">
      <view class="quick-item" @click="handleInRecord">
        <text class="quick-icon">📥</text>
        <text class="quick-text">入库记录</text>
      </view>
      <view class="quick-item" @click="handleOutRecord">
        <text class="quick-icon">📤</text>
        <text class="quick-text">出库记录</text>
      </view>
      <view class="quick-item" @click="handleCheck">
        <text class="quick-icon">📋</text>
        <text class="quick-text">库存盘点</text>
      </view>
      <view class="quick-item" @click="handleScan">
        <text class="quick-icon">📷</text>
        <text class="quick-text">扫码查询</text>
      </view>
    </view>

    <view class="filter-drawer" v-if="showFilter" @click.self="showFilter = false">
      <view class="filter-content">
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <text class="filter-reset" @click="resetFilter">重置</text>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">仓库</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterWarehouse === '' }"
              @click="filterWarehouse = ''"
            >全部</view>
            <view 
              class="filter-option" 
              :class="{ active: filterWarehouse === 'A区' }"
              @click="filterWarehouse = 'A区'"
            >A区仓库</view>
            <view 
              class="filter-option" 
              :class="{ active: filterWarehouse === 'B区' }"
              @click="filterWarehouse = 'B区'"
            >B区仓库</view>
            <view 
              class="filter-option" 
              :class="{ active: filterWarehouse === 'C区' }"
              @click="filterWarehouse = 'C区'"
            >C区仓库</view>
          </view>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">商品分类</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterCategory === '' }"
              @click="filterCategory = ''"
            >全部</view>
            <view 
              class="filter-option" 
              :class="{ active: filterCategory === '水泥' }"
              @click="filterCategory = '水泥'"
            >水泥</view>
            <view 
              class="filter-option" 
              :class="{ active: filterCategory === '钢材' }"
              @click="filterCategory = '钢材'"
            >钢材</view>
            <view 
              class="filter-option" 
              :class="{ active: filterCategory === '砂石' }"
              @click="filterCategory = '砂石'"
            >砂石</view>
          </view>
        </view>
        
        <view class="filter-actions">
          <view class="filter-btn cancel" @click="showFilter = false">取消</view>
          <view class="filter-btn confirm" @click="applyFilter">确定</view>
        </view>
      </view>
    </view>

    <view class="stock-modal" v-if="showStockModal" @click.self="showStockModal = false">
      <view class="stock-content">
        <view class="stock-header-modal">
          <text class="stock-title">{{ stockModalType === 'in' ? '入库操作' : '出库操作' }}</text>
          <text class="stock-close" @click="showStockModal = false">✕</text>
        </view>
        
        <view class="stock-product-info" v-if="currentStock">
          <text class="product-name">{{ currentStock.name }}</text>
          <text class="product-spec">{{ currentStock.spec }}</text>
          <text class="product-current">当前库存: {{ currentStock.stock }} {{ currentStock.unit }}</text>
        </view>
        
        <view class="stock-form">
          <view class="form-row">
            <text class="form-label">操作数量</text>
            <view class="qty-input-wrap">
              <view class="qty-btn" @click="stockQty = Math.max(1, stockQty - 1)">-</view>
              <input type="number" v-model="stockQty" class="qty-input" />
              <view class="qty-btn" @click="stockQty++">+</view>
            </view>
          </view>
          <view class="form-row">
            <text class="form-label">仓库</text>
            <picker :value="stockWarehouseIndex" :range="warehouses" @change="stockWarehouseIndex = $event.detail.value">
              <view class="form-picker">
                <text>{{ warehouses[stockWarehouseIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">操作类型</text>
            <picker :value="stockTypeIndex" :range="stockTypes" @change="stockTypeIndex = $event.detail.value">
              <view class="form-picker">
                <text>{{ stockTypes[stockTypeIndex] }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">备注</text>
            <textarea v-model="stockRemark" placeholder="选填" class="form-textarea" />
          </view>
        </view>
        
        <view class="stock-actions-modal">
          <view class="stock-btn primary" @click="confirmStock">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref('overview')
const keyword = ref('')
const filterType = ref('all')
const showFilter = ref(false)
const filterWarehouse = ref('')
const filterCategory = ref('')
const showStockModal = ref(false)
const stockModalType = ref('in')
const currentStock = ref<any>(null)
const stockQty = ref(1)
const stockWarehouseIndex = ref(0)
const stockTypeIndex = ref(0)
const stockRemark = ref('')

const warehouses = ['默认仓库', 'A区仓库', 'B区仓库', 'C区仓库']
const stockTypes = ['采购入库', '退货入库', '调拨入库', '盘点调整']

const totalSku = ref(156)
const totalValue = ref('1,258,000')
const warningCount = ref(5)
const outCount = ref(2)
const expireCount = ref(3)

const stockList = ref([
  { 
    id: 's1', 
    skuCode: 'SKU001', 
    name: '水泥 P.O 42.5', 
    spec: '42.5', 
    image: 'https://picsum.photos/100/100?random=1', 
    stock: 50, 
    maxStock: 200, 
    warningStock: 30, 
    unit: '吨',
    warehouse: 'A区仓库',
    location: 'A-01-01',
    costPrice: '450.00',
    category: '水泥'
  },
  { 
    id: 's2', 
    skuCode: 'SKU002', 
    name: '螺纹钢 HRB400 16mm', 
    spec: '16mm', 
    image: 'https://picsum.photos/100/100?random=2', 
    stock: 25, 
    maxStock: 100, 
    warningStock: 20, 
    unit: '吨',
    warehouse: 'B区仓库',
    location: 'B-02-03',
    costPrice: '4200.00',
    category: '钢材'
  },
  { 
    id: 's3', 
    skuCode: 'SKU003', 
    name: '黄砂 中砂', 
    spec: '中砂', 
    image: 'https://picsum.photos/100/100?random=3', 
    stock: 15, 
    maxStock: 500, 
    warningStock: 50, 
    unit: '方',
    warehouse: 'C区仓库',
    location: 'C-01',
    costPrice: '95.00',
    category: '砂石'
  },
  { 
    id: 's4', 
    skuCode: 'SKU004', 
    name: '商品混凝土 C30', 
    spec: 'C30', 
    image: 'https://picsum.photos/100/100?random=4', 
    stock: 0, 
    maxStock: 100, 
    warningStock: 20, 
    unit: '方',
    warehouse: 'A区仓库',
    location: '',
    costPrice: '420.00',
    category: '水泥'
  },
  { 
    id: 's5', 
    skuCode: 'SKU005', 
    name: '碎石 5-31.5mm', 
    spec: '5-31.5mm', 
    image: 'https://picsum.photos/100/100?random=5', 
    stock: 80, 
    maxStock: 300, 
    warningStock: 50, 
    unit: '方',
    warehouse: 'C区仓库',
    location: 'C-02',
    costPrice: '85.00',
    category: '砂石'
  },
])

const filteredStock = computed(() => {
  let result = stockList.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(kw) || 
      s.skuCode.toLowerCase().includes(kw)
    )
  }
  
  if (currentTab.value === 'warning') {
    result = result.filter(s => s.stock <= s.warningStock)
  } else {
    if (filterType.value === 'warning') {
      result = result.filter(s => s.stock > 0 && s.stock <= s.warningStock)
    } else if (filterType.value === 'out') {
      result = result.filter(s => s.stock === 0)
    } else if (filterType.value === 'normal') {
      result = result.filter(s => s.stock > s.warningStock)
    }
  }
  
  if (filterWarehouse.value) {
    result = result.filter(s => s.warehouse.includes(filterWarehouse.value))
  }
  
  if (filterCategory.value) {
    result = result.filter(s => s.category === filterCategory.value)
  }
  
  return result
})

function getStockPercent(item: any) {
  return Math.min(100, (item.stock / item.maxStock) * 100)
}

function getStockColor(item: any) {
  if (item.stock === 0) return '#f53f3f'
  if (item.stock <= item.warningStock) return '#ff7d00'
  return '#00b42a'
}

function getStockStatus(item: any) {
  if (item.stock === 0) return 'out'
  if (item.stock <= item.warningStock) return 'warning'
  return 'normal'
}

function getStockStatusText(item: any) {
  if (item.stock === 0) return '缺货'
  if (item.stock <= item.warningStock) return '预警'
  return '正常'
}

function handleDetail(item: any) {
  uni.navigateTo({ url: `/pages/mine/stock-detail?id=${item.id}` })
}

function handleInStock(item: any) {
  stockModalType.value = 'in'
  currentStock.value = item
  stockQty.value = 1
  showStockModal.value = true
}

function handleOutStock(item: any) {
  stockModalType.value = 'out'
  currentStock.value = item
  stockQty.value = 1
  showStockModal.value = true
}

function confirmStock() {
  uni.showToast({ 
    title: stockModalType.value === 'in' ? '入库成功' : '出库成功', 
    icon: 'success' 
  })
  showStockModal.value = false
}

function handleInRecord() {
  uni.navigateTo({ url: '/pages/mine/stock-records?type=in' })
}

function handleOutRecord() {
  uni.navigateTo({ url: '/pages/mine/stock-records?type=out' })
}

function handleCheck() {
  uni.navigateTo({ url: '/pages/mine/stock-check' })
}

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

function resetFilter() {
  filterWarehouse.value = ''
  filterCategory.value = ''
}

function applyFilter() {
  showFilter.value = false
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 140rpx;
}

.header-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 32rpx;
  color: #fff;
}

.header-tabs {
  display: flex;
  margin-bottom: 24rpx;
}

.tab-item {
  padding: 12rpx 32rpx;
  font-size: 28rpx;
  opacity: 0.7;
  position: relative;
  
  &.active {
    opacity: 1;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 32rpx;
      height: 4rpx;
      background-color: #fff;
      border-radius: 2rpx;
    }
  }
}

.tab-badge {
  position: absolute;
  top: -4rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  background-color: #f53f3f;
  border-radius: 14rpx;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.header-stats {
  display: flex;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 24rpx 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  
  &.warning {
    color: #ff7d00;
  }
  
  &.out {
    color: #f53f3f;
  }
}

.stat-label {
  display: block;
  font-size: 22rpx;
  opacity: 0.9;
  margin-top: 8rpx;
}

.warning-stats {
  display: flex;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 24rpx 0;
}

.warning-item {
  flex: 1;
  text-align: center;
}

.warning-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #ff7d00;
}

.warning-label {
  display: block;
  font-size: 22rpx;
  opacity: 0.9;
  margin-top: 8rpx;
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

.filter-bar {
  display: flex;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
}

.filter-item {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #fff;
  border-radius: 32rpx;
  margin-right: 16rpx;
  position: relative;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  .badge {
    position: absolute;
    top: -4rpx;
    right: -8rpx;
    min-width: 28rpx;
    height: 28rpx;
    background-color: #f53f3f;
    border-radius: 14rpx;
    font-size: 18rpx;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6rpx;
  }
}

.stock-list {
  padding: 0 32rpx;
}

.stock-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.stock-sku {
  font-size: 24rpx;
  color: #86909c;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  
  &.normal {
    color: #00b42a;
    background-color: #e8ffea;
  }
  
  &.warning {
    color: #ff7d00;
    background-color: #fff7e8;
  }
  
  &.out {
    color: #f53f3f;
    background-color: #ffece8;
  }
}

.stock-body {
  display: flex;
  margin-bottom: 16rpx;
}

.stock-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.stock-info {
  flex: 1;
  margin-left: 16rpx;
}

.stock-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
}

.stock-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.stock-warehouse {
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

.stock-location {
  display: flex;
  align-items: center;
  margin-top: 4rpx;
}

.location-label {
  font-size: 22rpx;
  color: #86909c;
}

.location-value {
  font-size: 22rpx;
  color: #1d2129;
  margin-left: 4rpx;
}

.stock-right {
  text-align: right;
}

.stock-qty {
  font-size: 40rpx;
  color: #1d2129;
  font-weight: 600;
}

.stock-unit {
  font-size: 24rpx;
  color: #86909c;
  display: block;
}

.stock-bar {
  margin-bottom: 16rpx;
}

.bar-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.bar-label {
  font-size: 22rpx;
  color: #86909c;
}

.bar-text {
  font-size: 22rpx;
  color: #86909c;
}

.bar-bg {
  height: 8rpx;
  background-color: #f2f3f5;
  border-radius: 4rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4rpx;
}

.stock-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f7f8fa;
}

.stock-price {
  display: flex;
  align-items: center;
}

.price-label {
  font-size: 24rpx;
  color: #86909c;
}

.price-value {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  margin-left: 8rpx;
}

.stock-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 20rpx;
}

.quick-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 0;
}

.quick-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.quick-text {
  font-size: 22rpx;
  color: #1d2129;
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

.stock-modal {
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

.stock-content {
  width: 100%;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 70vh;
  overflow-y: auto;
}

.stock-header-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.stock-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.stock-close {
  font-size: 32rpx;
  color: #86909c;
}

.stock-product-info {
  padding: 24rpx 32rpx;
  background-color: #f7f8fa;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.product-current {
  font-size: 26rpx;
  color: #165dff;
  margin-top: 8rpx;
  display: block;
}

.stock-form {
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

.qty-input-wrap {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #1d2129;
  background-color: #f7f8fa;
  border-radius: 8rpx;
}

.qty-input {
  width: 120rpx;
  height: 64rpx;
  text-align: center;
  font-size: 32rpx;
  margin: 0 16rpx;
  border: 1rpx solid #e5e6eb;
  border-radius: 8rpx;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.picker-arrow {
  font-size: 20rpx;
  color: #86909c;
}

.form-textarea {
  width: 100%;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 100rpx;
}

.stock-actions-modal {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.stock-btn {
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  border-radius: 40rpx;
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}
</style>
