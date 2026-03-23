<template>
  <view class="page">
    <view class="header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="搜索商品名称/编码" 
          class="search-input"
          @confirm="handleSearch"
        />
      </view>
    </view>
    
    <view class="category-scroll">
      <scroll-view scroll-x class="category-list">
        <view 
          class="category-item" 
          :class="{ active: currentCategory === '' }"
          @click="handleCategoryChange('')"
        >
          全部
        </view>
        <view 
          v-for="cat in categories" 
          :key="cat.id"
          class="category-item" 
          :class="{ active: currentCategory === cat.id }"
          @click="handleCategoryChange(cat.id)"
        >
          {{ cat.name }}
        </view>
      </scroll-view>
    </view>
    
    <view class="filter-bar">
      <view class="filter-item" :class="{ active: sortType === 'default' }" @click="handleSort('default')">
        综合
      </view>
      <view class="filter-item" :class="{ active: sortType === 'sales' }" @click="handleSort('sales')">
        <text>销量</text>
        <text class="arrow" v-if="sortType === 'sales'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</text>
      </view>
      <view class="filter-item" :class="{ active: sortType === 'price' }" @click="handleSort('price')">
        <text>价格</text>
        <text class="arrow" v-if="sortType === 'price'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</text>
      </view>
      <view class="filter-item" @click="showFilter = true">
        <text>筛选</text>
        <text class="filter-icon">⚙</text>
      </view>
    </view>
    
    <view class="product-list" v-if="filteredProducts.length > 0">
      <view 
        class="product-item" 
        v-for="item in filteredProducts" 
        :key="item.id" 
        @click="handleProductDetail(item)"
      >
        <image :src="item.mainImage" mode="aspectFill" class="product-image" />
        <view class="product-info">
          <view class="product-header">
            <text class="product-name">{{ item.skuName }}</text>
            <view class="product-tags">
              <text class="tag hot" v-if="item.isHot">热销</text>
              <text class="tag recommend" v-if="item.isRecommend">推荐</text>
            </view>
          </view>
          <text class="product-spec">{{ formatSpecs(item.specs) }}</text>
          <view class="supplier-info">
            <template v-if="item.suppliers && item.suppliers.length > 1">
              <text class="supplier-count">{{ item.suppliers.length }}家供应商</text>
              <text class="min-price">最低 ¥{{ getMinPrice(item.suppliers) }}</text>
            </template>
            <template v-else-if="item.suppliers && item.suppliers.length === 1">
              <text class="supplier-name">{{ item.suppliers[0].supplierName }}</text>
            </template>
          </view>
          <view class="product-bottom">
            <view class="product-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ item.marketPrice }}</text>
              <text class="product-unit">/{{ item.unit }}</text>
            </view>
            <view class="add-cart" @click.stop="handleAddCart(item)">
              <text>+</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty" v-else>
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无商品</text>
    </view>
    
    <view class="filter-drawer" v-if="showFilter" @click="showFilter = false">
      <view class="drawer-content" @click.stop>
        <view class="drawer-header">
          <text class="drawer-title">筛选条件</text>
          <text class="drawer-close" @click="showFilter = false">✕</text>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">供应商</text>
          <view class="filter-options">
            <view 
              class="option-item" 
              :class="{ active: filterSupplier === '' }"
              @click="filterSupplier = ''"
            >
              全部
            </view>
            <view 
              v-for="s in supplierList" 
              :key="s.id"
              class="option-item" 
              :class="{ active: filterSupplier === s.id }"
              @click="filterSupplier = s.id"
            >
              {{ s.name }}
            </view>
          </view>
        </view>
        
        <view class="filter-section">
          <text class="filter-label">价格区间</text>
          <view class="price-range">
            <input type="number" v-model="priceMin" placeholder="最低价" class="price-input" />
            <text class="price-separator">-</text>
            <input type="number" v-model="priceMax" placeholder="最高价" class="price-input" />
          </view>
        </view>
        
        <view class="drawer-footer">
          <view class="btn-reset" @click="handleResetFilter">重置</view>
          <view class="btn-confirm" @click="handleConfirmFilter">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const sortType = ref('default')
const sortOrder = ref('desc')
const currentCategory = ref('')
const showFilter = ref(false)
const filterSupplier = ref('')
const priceMin = ref('')
const priceMax = ref('')

const categories = ref([
  { id: 'steel', name: '钢材' },
  { id: 'cement', name: '水泥' },
  { id: 'sand', name: '砂石' },
  { id: 'concrete', name: '混凝土' },
  { id: 'brick', name: '砌体材料' },
])

const supplierList = ref([
  { id: 's001', name: '华新水泥供应商' },
  { id: 's002', name: '海螺水泥供应商' },
  { id: 's003', name: '宝钢供应商' },
  { id: 's004', name: '南方建材供应商' },
])

const products = ref([
  {
    id: 'mp001',
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    categoryName: '水泥',
    categoryId: 'cement',
    specs: { '强度等级': '42.5' },
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    marketPrice: 450,
    isHot: true,
    isRecommend: true,
    suppliers: [
      { supplierId: 's001', supplierName: '华新水泥供应商', supplyPrice: 420, supplyStatus: 'supplying', estimatedStock: 500 },
      { supplierId: 's002', supplierName: '海螺水泥供应商', supplyPrice: 415, supplyStatus: 'supplying', estimatedStock: 300 },
    ],
  },
  {
    id: 'mp002',
    skuId: 'sku002',
    skuCode: 'SKU-GC-002-16',
    skuName: '螺纹钢 HRB400 16mm',
    categoryName: '钢材',
    categoryId: 'steel',
    specs: { '规格': '16mm' },
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    marketPrice: 4200,
    isHot: false,
    isRecommend: false,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 4000, supplyStatus: 'supplying', estimatedStock: 100 },
    ],
  },
  {
    id: 'mp003',
    skuId: 'sku003',
    skuCode: 'SKU-SS-003',
    skuName: '黄砂 中砂',
    categoryName: '砂石',
    categoryId: 'sand',
    specs: { '类型': '中砂' },
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    marketPrice: 95,
    isHot: false,
    isRecommend: true,
    suppliers: [
      { supplierId: 's004', supplierName: '南方建材供应商', supplyPrice: 80, supplyStatus: 'supplying', estimatedStock: 1000 },
    ],
  },
  {
    id: 'mp004',
    skuId: 'sku004',
    skuCode: 'SKU-HNT-004-C30',
    skuName: '商品混凝土 C30',
    categoryName: '混凝土',
    categoryId: 'concrete',
    specs: { '强度等级': 'C30' },
    mainImage: 'https://picsum.photos/200/200?random=4',
    unit: '方',
    marketPrice: 420,
    isHot: true,
    isRecommend: false,
    suppliers: [
      { supplierId: 's005', supplierName: '中建混凝土供应商', supplyPrice: 380, supplyStatus: 'supplying', estimatedStock: 500 },
    ],
  },
  {
    id: 'mp005',
    skuId: 'sku005',
    skuCode: 'SKU-GC-005-20',
    skuName: '螺纹钢 HRB400 20mm',
    categoryName: '钢材',
    categoryId: 'steel',
    specs: { '规格': '20mm' },
    mainImage: 'https://picsum.photos/200/200?random=5',
    unit: '吨',
    marketPrice: 4250,
    isHot: false,
    isRecommend: false,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 3950, supplyStatus: 'supplying', estimatedStock: 150 },
      { supplierId: 's006', supplierName: '沙钢供应商', supplyPrice: 3880, supplyStatus: 'supplying', estimatedStock: 200 },
    ],
  },
  {
    id: 'mp006',
    skuId: 'sku006',
    skuCode: 'SKU-QT-006',
    skuName: '加气混凝土砌块 600x240x200',
    categoryName: '砌体材料',
    categoryId: 'brick',
    specs: { '规格': '600x240x200' },
    mainImage: 'https://picsum.photos/200/200?random=6',
    unit: '块',
    marketPrice: 10.5,
    isHot: false,
    isRecommend: true,
    suppliers: [
      { supplierId: 's007', supplierName: '新型建材供应商', supplyPrice: 8.5, supplyStatus: 'supplying', estimatedStock: 5000 },
      { supplierId: 's008', supplierName: '绿色建材供应商', supplyPrice: 8.8, supplyStatus: 'supplying', estimatedStock: 3000 },
    ],
  },
])

const filteredProducts = computed(() => {
  let result = products.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(kw) || 
      p.skuCode.toLowerCase().includes(kw)
    )
  }
  
  if (currentCategory.value) {
    result = result.filter(p => p.categoryId === currentCategory.value)
  }
  
  if (filterSupplier.value) {
    result = result.filter(p => 
      p.suppliers.some(s => s.supplierId === filterSupplier.value)
    )
  }
  
  if (priceMin.value) {
    result = result.filter(p => p.marketPrice >= Number(priceMin.value))
  }
  if (priceMax.value) {
    result = result.filter(p => p.marketPrice <= Number(priceMax.value))
  }
  
  if (sortType.value === 'price') {
    result = [...result].sort((a, b) => 
      sortOrder.value === 'asc' ? a.marketPrice - b.marketPrice : b.marketPrice - a.marketPrice
    )
  } else if (sortType.value === 'sales') {
    result = [...result].sort((a, b) => 
      sortOrder.value === 'asc' ? (a.sales || 0) - (b.sales || 0) : (b.sales || 0) - (a.sales || 0)
    )
  }
  
  return result
})

function handleSearch() {
  uni.showToast({ title: '搜索完成', icon: 'none' })
}

function handleCategoryChange(id: string) {
  currentCategory.value = id
}

function handleSort(type: string) {
  if (sortType.value === type) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortType.value = type
    sortOrder.value = 'desc'
  }
}

function handleResetFilter() {
  filterSupplier.value = ''
  priceMin.value = ''
  priceMax.value = ''
}

function handleConfirmFilter() {
  showFilter.value = false
}

function formatSpecs(specs: Record<string, string>) {
  return Object.entries(specs).map(([k, v]) => v).join(' / ')
}

function getMinPrice(suppliers: any[]) {
  const min = suppliers.reduce((m, s) => s.supplyPrice < m ? s.supplyPrice : m, suppliers[0].supplyPrice)
  return min.toFixed(2)
}

function handleProductDetail(item: any) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` })
}

function handleAddCart(item: any) {
  if (item.suppliers && item.suppliers.length > 1) {
    uni.navigateTo({ url: `/pages/product/detail?id=${item.id}&action=cart` })
  } else {
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.header {
  padding: 20rpx 32rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.category-scroll {
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-list {
  white-space: nowrap;
  padding: 20rpx 32rpx;
}

.category-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: 20rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 28rpx;
  
  &.active {
    color: #fff;
    background-color: #165dff;
  }
}

.filter-bar {
  display: flex;
  padding: 20rpx 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 112rpx;
  z-index: 99;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.active {
    color: #165dff;
    font-weight: 600;
  }
  
  .arrow {
    margin-left: 8rpx;
    font-size: 20rpx;
  }
  
  .filter-icon {
    margin-left: 8rpx;
    font-size: 24rpx;
  }
}

.product-list {
  padding: 24rpx 32rpx;
}

.product-item {
  display: flex;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.product-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-name {
  flex: 1;
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-tags {
  display: flex;
  margin-left: 16rpx;
  
  .tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    margin-left: 8rpx;
    
    &.hot {
      color: #f53f3f;
      background-color: #ffece8;
    }
    
    &.recommend {
      color: #165dff;
      background-color: #e8f3ff;
    }
  }
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.supplier-info {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  
  .supplier-count {
    font-size: 22rpx;
    color: #165dff;
    background-color: #e8f3ff;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
  }
  
  .min-price {
    font-size: 22rpx;
    color: #f53f3f;
    margin-left: 16rpx;
  }
  
  .supplier-name {
    font-size: 22rpx;
    color: #86909c;
  }
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  color: #f53f3f;
}

.price-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #f53f3f;
}

.product-unit {
  font-size: 22rpx;
  color: #86909c;
  margin-left: 4rpx;
}

.add-cart {
  width: 56rpx;
  height: 56rpx;
  background-color: #165dff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
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
}

.filter-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.drawer-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 600rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.drawer-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.drawer-close {
  font-size: 36rpx;
  color: #86909c;
}

.filter-section {
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-label {
  font-size: 28rpx;
  color: #1d2129;
  margin-bottom: 24rpx;
  display: block;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
    border: 1rpx solid #165dff;
  }
}

.price-range {
  display: flex;
  align-items: center;
}

.price-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.price-separator {
  margin: 0 20rpx;
  color: #86909c;
}

.drawer-footer {
  display: flex;
  margin-top: auto;
  padding: 32rpx;
  gap: 24rpx;
}

.btn-reset {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 44rpx;
}

.btn-confirm {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  background-color: #165dff;
  border-radius: 44rpx;
}
</style>
