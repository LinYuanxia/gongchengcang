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
    
    <view class="category-section">
      <scroll-view scroll-y class="category-tree">
        <view 
          class="category-item" 
          :class="{ active: currentCategory === '' }"
          @click="handleCategoryChange('')"
        >
          <text class="category-name">全部</text>
          <text class="category-count">({{ allProductCount }})</text>
        </view>
        <view 
          v-for="cat in categories" 
          :key="cat.id"
          class="category-item" 
          :class="{ active: currentCategory === cat.id }"
          @click="handleCategoryChange(cat.id)"
        >
          <text class="category-name">{{ cat.name }}</text>
          <text class="category-count">({{ cat.count }})</text>
        </view>
      </scroll-view>
      
      <scroll-view scroll-y class="product-area">
        <view class="filter-bar">
          <view class="filter-item" :class="{ active: sortType === 'default' }" @click="handleSort('default')">
            综合
          </view>
          <view class="filter-item" :class="{ active: sortType === 'sales' }" @click="handleSort('sales')">
            销量
          </view>
          <view class="filter-item" :class="{ active: sortType === 'price' }" @click="handleSort('price')">
            价格
          </view>
        </view>
        
        <view class="product-grid" v-if="filteredProducts.length > 0">
          <view 
            class="product-card" 
            v-for="item in filteredProducts" 
            :key="item.id" 
            @click="handleProductDetail(item)"
          >
            <image :src="item.mainImage" mode="aspectFill" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ item.productName }}</text>
              <view class="spec-tags">
                <text class="spec-tag" v-for="(spec, idx) in item.specList" :key="idx">{{ spec }}</text>
              </view>
              <view class="price-row">
                <view class="price">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ item.salePrice }}</text>
                </view>
                <text class="stock">库存{{ item.stock }}</text>
              </view>
              <view class="sku-count" v-if="item.skuCount > 1">
                <text>{{ item.skuCount }}种规格可选</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="empty" v-else>
          <text class="empty-icon">📦</text>
          <text class="empty-text">暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const sortType = ref('default')
const sortOrder = ref('desc')
const currentCategory = ref('')

const categories = ref([
  { id: 'cement', name: '水泥', count: 15 },
  { id: 'steel', name: '钢材', count: 23 },
  { id: 'sand', name: '砂石', count: 8 },
  { id: 'concrete', name: '混凝土', count: 12 },
  { id: 'brick', name: '砌体材料', count: 6 },
])

const products = ref([
  {
    id: 'p001',
    productName: '水泥 P.O 42.5',
    mainImage: 'https://picsum.photos/200/200?random=1',
    salePrice: 450,
    stock: 500,
    categoryId: 'cement',
    specList: ['42.5', '50kg/袋'],
    skuCount: 3,
    sales: 1250,
  },
  {
    id: 'p002',
    productName: '螺纹钢 HRB400',
    mainImage: 'https://picsum.photos/200/200?random=2',
    salePrice: 4200,
    stock: 200,
    categoryId: 'steel',
    specList: ['HRB400', '16mm'],
    skuCount: 5,
    sales: 890,
  },
  {
    id: 'p003',
    productName: '黄砂 中砂',
    mainImage: 'https://picsum.photos/200/200?random=3',
    salePrice: 95,
    stock: 1000,
    categoryId: 'sand',
    specList: ['中砂'],
    skuCount: 1,
    sales: 560,
  },
  {
    id: 'p004',
    productName: '商品混凝土 C30',
    mainImage: 'https://picsum.photos/200/200?random=4',
    salePrice: 420,
    stock: 0,
    categoryId: 'concrete',
    specList: ['C30'],
    skuCount: 2,
    sales: 320,
  },
  {
    id: 'p005',
    productName: '加气混凝土砌块',
    mainImage: 'https://picsum.photos/200/200?random=5',
    salePrice: 10.5,
    stock: 5000,
    categoryId: 'brick',
    specList: ['600x240x200'],
    skuCount: 4,
    sales: 180,
  },
  {
    id: 'p006',
    productName: '水泥 P.C 32.5',
    mainImage: 'https://picsum.photos/200/200?random=6',
    salePrice: 380,
    stock: 300,
    categoryId: 'cement',
    specList: ['32.5', '50kg/袋'],
    skuCount: 2,
    sales: 980,
  },
  {
    id: 'p007',
    productName: '线材 Q235',
    mainImage: 'https://picsum.photos/200/200?random=7',
    salePrice: 3900,
    stock: 180,
    categoryId: 'steel',
    specList: ['Q235', '6.5mm'],
    skuCount: 3,
    sales: 450,
  },
  {
    id: 'p008',
    productName: '碎石 5-31.5mm',
    mainImage: 'https://picsum.photos/200/200?random=8',
    salePrice: 75,
    stock: 800,
    categoryId: 'sand',
    specList: ['5-31.5mm'],
    skuCount: 1,
    sales: 670,
  },
])

const allProductCount = computed(() => products.value.length)

const filteredProducts = computed(() => {
  let result = products.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => 
      p.productName.toLowerCase().includes(kw)
    )
  }
  
  if (currentCategory.value) {
    result = result.filter(p => p.categoryId === currentCategory.value)
  }
  
  if (sortType.value === 'price') {
    result = [...result].sort((a, b) => 
      sortOrder.value === 'asc' ? a.salePrice - b.salePrice : b.salePrice - a.salePrice
    )
  } else if (sortType.value === 'sales') {
    result = [...result].sort((a, b) => 
      sortOrder.value === 'asc' ? a.sales - b.sales : b.sales - a.sales
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

function handleProductDetail(item: any) {
  uni.navigateTo({ url: `/pages/warehouse/product-detail?id=${item.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  padding: 20rpx 24rpx;
  background-color: #fff;
  flex-shrink: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 16rpx;
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.category-section {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-tree {
  width: 180rpx;
  background-color: #fff;
  flex-shrink: 0;
}

.category-item {
  padding: 28rpx 16rpx;
  text-align: center;
  border-left: 4rpx solid transparent;
  
  &.active {
    background-color: #f5f5f5;
    border-left-color: #ff6b00;
    
    .category-name {
      color: #ff6b00;
      font-weight: 600;
    }
    
    .category-count {
      color: #ff6b00;
    }
  }
}

.category-name {
  font-size: 26rpx;
  color: #333;
  display: block;
}

.category-count {
  font-size: 20rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.product-area {
  flex: 1;
  background-color: #f5f5f5;
}

.filter-bar {
  display: flex;
  padding: 20rpx 24rpx;
  background-color: #fff;
  margin-bottom: 16rpx;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  
  &.active {
    color: #ff6b00;
    font-weight: 600;
  }
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 12rpx;
}

.product-card {
  width: calc(50% - 16rpx);
  margin: 8rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 280rpx;
}

.product-info {
  padding: 16rpx;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 72rpx;
  line-height: 36rpx;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8rpx;
}

.spec-tag {
  font-size: 20rpx;
  color: #ff6b00;
  background-color: #fff5eb;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
  margin-bottom: 8rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8rpx;
}

.price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 22rpx;
  color: #ff4d4f;
}

.price-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.stock {
  font-size: 20rpx;
  color: #999;
}

.sku-count {
  margin-top: 8rpx;
  
  text {
    font-size: 20rpx;
    color: #1890ff;
    background-color: #e6f7ff;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
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
  color: #86909c;
}
</style>
