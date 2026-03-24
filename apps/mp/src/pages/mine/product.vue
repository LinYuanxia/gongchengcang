<template>
  <view class="page">
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

    <view class="status-bar">
      <view 
        class="status-item" 
        :class="{ active: currentStatus === '' }"
        @click="currentStatus = ''"
      >
        全部
        <text class="count" v-if="statusCount.total > 0">({{ statusCount.total }})</text>
      </view>
      <view 
        class="status-item" 
        :class="{ active: currentStatus === 'onSale' }"
        @click="currentStatus = 'onSale'"
      >
        销售中
        <text class="count" v-if="statusCount.onSale > 0">({{ statusCount.onSale }})</text>
      </view>
      <view 
        class="status-item" 
        :class="{ active: currentStatus === 'offSale' }"
        @click="currentStatus = 'offSale'"
      >
        已下架
        <text class="count" v-if="statusCount.offSale > 0">({{ statusCount.offSale }})</text>
      </view>
      <view 
        class="status-item" 
        :class="{ active: currentStatus === 'warning' }"
        @click="currentStatus = 'warning'"
      >
        库存预警
        <view class="badge" v-if="statusCount.warning > 0">{{ statusCount.warning }}</view>
      </view>
    </view>

    <view class="product-list">
      <view class="product-item" v-for="item in filteredProducts" :key="item.id">
        <view class="product-main">
          <image :src="item.image" class="product-image" />
          <view class="product-info">
            <view class="product-header">
              <text class="product-name">{{ item.name }}</text>
              <text class="product-status" :class="item.status">{{ item.statusText }}</text>
            </view>
            <text class="product-code">编码: {{ item.code }}</text>
            <text class="product-spec">规格: {{ item.spec }}</text>
            <view class="product-price">
              <view class="price-item">
                <text class="price-label">供货价</text>
                <text class="price-value">¥{{ item.supplyPrice }}</text>
              </view>
              <view class="price-item">
                <text class="price-label">销售价</text>
                <text class="price-value sale">¥{{ item.salePrice }}</text>
              </view>
            </view>
            <view class="product-stock">
              <text class="stock-label">库存: {{ item.stock }}{{ item.unit }}</text>
              <text class="stock-warning" v-if="item.isWarning">⚠️ 库存不足</text>
            </view>
          </view>
        </view>
        <view class="product-footer">
          <view class="product-category">
            <text class="category-tag">{{ item.categoryName }}</text>
            <text class="link-tag" v-if="item.isLinked">已关联标准品</text>
            <text class="unlink-tag" v-else>未关联</text>
          </view>
          <view class="product-actions">
            <view class="action-btn" @click="handleEdit(item)">编辑</view>
            <view class="action-btn" v-if="item.status === 'onSale'" @click="handleOffSale(item)">下架</view>
            <view class="action-btn primary" v-if="item.status === 'offSale'" @click="handleOnSale(item)">上架</view>
            <view class="action-btn" v-if="!item.isLinked" @click="handleLink(item)">关联标准品</view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="filteredProducts.length === 0">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无商品</text>
    </view>

    <view class="add-btn" @click="handleAdd">
      <text class="add-icon">+</text>
      <text class="add-text">添加商品</text>
    </view>

    <view class="filter-popup" v-if="showFilter" @click="showFilter = false">
      <view class="filter-content" @click.stop>
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <text class="filter-reset" @click="handleResetFilter">重置</text>
        </view>
        <view class="filter-section">
          <text class="section-title">商品分类</text>
          <view class="option-list">
            <view 
              class="option-item" 
              :class="{ active: filterCategory === '' }"
              @click="filterCategory = ''"
            >
              全部
            </view>
            <view 
              class="option-item" 
              :class="{ active: filterCategory === cat.id }"
              v-for="cat in categories" 
              :key="cat.id"
              @click="filterCategory = cat.id"
            >
              {{ cat.name }}
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="section-title">关联状态</text>
          <view class="option-list">
            <view 
              class="option-item" 
              :class="{ active: filterLinked === '' }"
              @click="filterLinked = ''"
            >
              全部
            </view>
            <view 
              class="option-item" 
              :class="{ active: filterLinked === 'linked' }"
              @click="filterLinked = 'linked'"
            >
              已关联
            </view>
            <view 
              class="option-item" 
              :class="{ active: filterLinked === 'unlinked' }"
              @click="filterLinked = 'unlinked'"
            >
              未关联
            </view>
          </view>
        </view>
        <view class="filter-actions">
          <view class="filter-btn cancel" @click="showFilter = false">取消</view>
          <view class="filter-btn confirm" @click="handleConfirmFilter">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const currentStatus = ref('')
const showFilter = ref(false)
const filterCategory = ref('')
const filterLinked = ref('')
const applyFilterCategory = ref('')
const applyFilterLinked = ref('')

const statusCount = ref({
  total: 156,
  onSale: 128,
  offSale: 28,
  warning: 5,
})

const categories = ref([
  { id: 'c1', name: '水泥建材' },
  { id: 'c2', name: '钢材' },
  { id: 'c3', name: '砂石料' },
  { id: 'c4', name: '装饰材料' },
])

const products = ref([
  {
    id: 'p1',
    name: '水泥 P.O 42.5',
    code: 'SN-PO42.5',
    spec: '42.5级 | 袋装',
    image: 'https://picsum.photos/100/100?random=1',
    supplyPrice: '420.00',
    salePrice: '450.00',
    stock: 500,
    unit: '吨',
    status: 'onSale',
    statusText: '销售中',
    isWarning: false,
    isLinked: true,
    categoryId: 'c1',
    categoryName: '水泥建材',
  },
  {
    id: 'p2',
    name: '螺纹钢 HRB400 16mm',
    code: 'LG-HRB400-16',
    spec: 'HRB400 | 16mm',
    image: 'https://picsum.photos/100/100?random=2',
    supplyPrice: '3950.00',
    salePrice: '4200.00',
    stock: 50,
    unit: '吨',
    status: 'onSale',
    statusText: '销售中',
    isWarning: true,
    isLinked: true,
    categoryId: 'c2',
    categoryName: '钢材',
  },
  {
    id: 'p3',
    name: '黄砂 中砂',
    code: 'HS-ZS',
    spec: '中砂',
    image: 'https://picsum.photos/100/100?random=3',
    supplyPrice: '80.00',
    salePrice: '95.00',
    stock: 200,
    unit: '方',
    status: 'onSale',
    statusText: '销售中',
    isWarning: false,
    isLinked: false,
    categoryId: 'c3',
    categoryName: '砂石料',
  },
  {
    id: 'p4',
    name: '商品混凝土 C30',
    code: 'HNT-C30',
    spec: 'C30',
    image: 'https://picsum.photos/100/100?random=4',
    supplyPrice: '380.00',
    salePrice: '420.00',
    stock: 0,
    unit: '方',
    status: 'offSale',
    statusText: '已下架',
    isWarning: false,
    isLinked: true,
    categoryId: 'c1',
    categoryName: '水泥建材',
  },
])

const filteredProducts = computed(() => {
  let result = products.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      p.code.toLowerCase().includes(kw)
    )
  }
  
  if (currentStatus.value) {
    if (currentStatus.value === 'warning') {
      result = result.filter(p => p.isWarning)
    } else {
      result = result.filter(p => p.status === currentStatus.value)
    }
  }
  
  if (applyFilterCategory.value) {
    result = result.filter(p => p.categoryId === applyFilterCategory.value)
  }
  
  if (applyFilterLinked.value) {
    if (applyFilterLinked.value === 'linked') {
      result = result.filter(p => p.isLinked)
    } else {
      result = result.filter(p => !p.isLinked)
    }
  }
  
  return result
})

function handleEdit(item: any) {
  uni.showToast({ title: '编辑商品', icon: 'none' })
}

function handleOffSale(item: any) {
  uni.showModal({
    title: '下架商品',
    content: `确定下架 ${item.name} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已下架', icon: 'success' })
      }
    },
  })
}

function handleOnSale(item: any) {
  uni.showModal({
    title: '上架商品',
    content: `确定上架 ${item.name} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已上架', icon: 'success' })
      }
    },
  })
}

function handleLink(item: any) {
  uni.showModal({
    title: '关联标准品',
    content: '请选择要关联的平台标准商品',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '关联成功', icon: 'success' })
      }
    },
  })
}

function handleAdd() {
  uni.showToast({ title: '添加商品', icon: 'none' })
}

function handleResetFilter() {
  filterCategory.value = ''
  filterLinked.value = ''
}

function handleConfirmFilter() {
  applyFilterCategory.value = filterCategory.value
  applyFilterLinked.value = filterLinked.value
  showFilter.value = false
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background-color: #fff;
}

.search-icon {
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.filter-btn {
  padding: 16rpx 24rpx;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #165dff;
}

.status-bar {
  display: flex;
  padding: 16rpx 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 500;
  }
  
  .count {
    font-size: 22rpx;
    color: #86909c;
  }
  
  .badge {
    position: absolute;
    top: -8rpx;
    right: 10%;
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
}

.product-list {
  padding: 24rpx 32rpx;
}

.product-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.product-main {
  display: flex;
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 20rpx;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-name {
  font-size: 30rpx;
  color: #1d2129;
  font-weight: 500;
  flex: 1;
}

.product-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
  
  &.onSale {
    color: #00b42a;
    background-color: #e8ffea;
  }
  
  &.offSale {
    color: #86909c;
    background-color: #f7f8fa;
  }
}

.product-code, .product-spec {
  font-size: 24rpx;
  color: #86909c;
  display: block;
  margin-top: 8rpx;
}

.product-price {
  display: flex;
  margin-top: 12rpx;
}

.price-item {
  margin-right: 24rpx;
}

.price-label {
  font-size: 22rpx;
  color: #86909c;
}

.price-value {
  font-size: 26rpx;
  color: #1d2129;
  margin-left: 8rpx;
  
  &.sale {
    color: #f53f3f;
    font-weight: 500;
  }
}

.product-stock {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.stock-label {
  font-size: 24rpx;
  color: #1d2129;
}

.stock-warning {
  font-size: 22rpx;
  color: #f53f3f;
  margin-left: 16rpx;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.product-category {
  display: flex;
  align-items: center;
}

.category-tag {
  font-size: 22rpx;
  color: #666;
  background-color: #f7f8fa;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.link-tag {
  font-size: 22rpx;
  color: #00b42a;
  margin-left: 12rpx;
}

.unlink-tag {
  font-size: 22rpx;
  color: #ff7d00;
  margin-left: 12rpx;
}

.product-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 24rpx;
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}

.empty-state {
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

.add-btn {
  position: fixed;
  bottom: 32rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 48rpx;
  background-color: #165dff;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(22, 93, 255, 0.3);
}

.add-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 8rpx;
}

.add-text {
  font-size: 30rpx;
  color: #fff;
}

.filter-popup {
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

.filter-content {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-title {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 500;
}

.filter-reset {
  font-size: 28rpx;
  color: #165dff;
}

.filter-section {
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
  }
}

.filter-actions {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.filter-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
  
  &.cancel {
    color: #666;
    background-color: #f7f8fa;
  }
  
  &.confirm {
    color: #fff;
    background-color: #165dff;
  }
}
</style>
