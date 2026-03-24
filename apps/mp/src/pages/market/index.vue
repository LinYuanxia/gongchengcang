<template>
  <view class="page">
    <view class="header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="搜索商品名称/编码/供应商" 
          class="search-input"
          @confirm="handleSearch"
        />
        <text class="scan-icon" @click="handleScan">📷</text>
      </view>
    </view>
    
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'product' }"
        @click="currentTab = 'product'"
      >
        商品市场
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'bom' }"
        @click="currentTab = 'bom'"
      >
        BOM基装包
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'history' }"
        @click="currentTab = 'history'"
      >
        采购记录
      </view>
    </view>

    <template v-if="currentTab === 'product'">
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
        <view class="filter-item" :class="{ active: showFilterPanel }" @click="showFilterPanel = true">
          <text>筛选</text>
          <text class="filter-icon">⚙</text>
        </view>
      </view>
      
      <view class="filter-panel" v-if="showFilterPanel">
        <view class="panel-mask" @click="showFilterPanel = false"></view>
        <view class="panel-content">
          <view class="panel-section">
            <text class="panel-title">供应商</text>
            <view class="panel-options">
              <view 
                class="option-item" 
                :class="{ active: filterSupplier === '' }"
                @click="filterSupplier = ''"
              >全部</view>
              <view 
                v-for="s in supplierList" 
                :key="s.id"
                class="option-item" 
                :class="{ active: filterSupplier === s.id }"
                @click="filterSupplier = s.id"
              >{{ s.name }}</view>
            </view>
          </view>
          <view class="panel-section">
            <text class="panel-title">价格区间</text>
            <view class="price-range">
              <input type="number" v-model="priceMin" placeholder="最低价" class="price-input" />
              <text class="price-sep">-</text>
              <input type="number" v-model="priceMax" placeholder="最高价" class="price-input" />
            </view>
          </view>
          <view class="panel-actions">
            <view class="panel-btn reset" @click="resetFilter">重置</view>
            <view class="panel-btn confirm" @click="confirmFilter">确定</view>
          </view>
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
                <text class="tag permission" v-if="item.hasPermission">有权限</text>
                <text class="tag hot" v-if="item.isHot">热销</text>
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
                <text class="supplier-stock">库存: {{ item.suppliers[0].estimatedStock }}{{ item.unit }}</text>
              </template>
            </view>
            <view class="product-bottom">
              <view class="product-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ item.marketPrice }}</text>
                <text class="product-unit">/{{ item.unit }}</text>
                <text class="supply-price" v-if="item.suppliers && item.suppliers.length > 0">
                  供价¥{{ item.suppliers[0].supplyPrice }}
                </text>
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
    </template>

    <template v-if="currentTab === 'bom'">
      <view class="bom-filter">
        <view 
          class="bom-filter-item" 
          :class="{ active: bomType === '' }"
          @click="bomType = ''"
        >全部</view>
        <view 
          class="bom-filter-item" 
          :class="{ active: bomType === 'platform' }"
          @click="bomType = 'platform'"
        >平台标准</view>
        <view 
          class="bom-filter-item" 
          :class="{ active: bomType === 'custom' }"
          @click="bomType = 'custom'"
        >自定义</view>
      </view>
      <view class="bom-list">
        <view class="bom-item" v-for="item in filteredBomList" :key="item.id" @click="handleBomDetail(item)">
          <view class="bom-header">
            <text class="bom-name">{{ item.name }}</text>
            <text class="bom-type">{{ item.type }}</text>
          </view>
          <text class="bom-desc">{{ item.description }}</text>
          <view class="bom-info">
            <text class="bom-count">{{ item.productCount }}种材料</text>
            <text class="bom-price">预估总价: ¥{{ item.estimatedPrice }}</text>
          </view>
          <view class="bom-tags">
            <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
          </view>
          <view class="bom-action">
            <view class="action-btn" @click.stop="handleBomPurchase(item)">立即采购</view>
          </view>
        </view>
      </view>
    </template>

    <template v-if="currentTab === 'history'">
      <view class="history-filter">
        <view class="filter-row">
          <picker mode="date" :value="startDate" @change="onStartDateChange">
            <view class="date-picker">
              <text>{{ startDate || '开始日期' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
          <text class="date-sep">至</text>
          <picker mode="date" :value="endDate" @change="onEndDateChange">
            <view class="date-picker">
              <text>{{ endDate || '结束日期' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="status-filter">
          <view 
            class="status-item" 
            :class="{ active: historyStatus === '' }"
            @click="historyStatus = ''"
          >全部</view>
          <view 
            class="status-item" 
            :class="{ active: historyStatus === 'pending' }"
            @click="historyStatus = 'pending'"
          >待确认</view>
          <view 
            class="status-item" 
            :class="{ active: historyStatus === 'shipped' }"
            @click="historyStatus = 'shipped'"
          >已发货</view>
          <view 
            class="status-item" 
            :class="{ active: historyStatus === 'completed' }"
            @click="historyStatus = 'completed'"
          >已完成</view>
        </view>
      </view>
      <view class="history-list">
        <view class="history-item" v-for="item in filteredHistory" :key="item.id" @click="handleHistoryDetail(item)">
          <view class="history-header">
            <text class="history-no">{{ item.orderNo }}</text>
            <text class="history-status" :style="{ color: getStatusColor(item.status) }">{{ item.statusText }}</text>
          </view>
          <view class="history-supplier">
            <text class="supplier-label">供应商:</text>
            <text class="supplier-name">{{ item.supplierName }}</text>
          </view>
          <view class="history-products">
            <view class="product-row" v-for="prod in item.products" :key="prod.id">
              <image :src="prod.image" class="product-image" />
              <view class="product-info">
                <text class="product-name">{{ prod.name }}</text>
                <text class="product-spec">{{ prod.spec }}</text>
              </view>
              <view class="product-right">
                <text class="product-price">¥{{ prod.price }}</text>
                <text class="product-qty">x{{ prod.qty }}</text>
              </view>
            </view>
          </view>
          <view class="history-footer">
            <text class="history-total">共{{ item.totalQty }}件 合计: <text class="total-price">¥{{ item.totalAmount }}</text></text>
            <text class="history-time">{{ item.createTime }}</text>
          </view>
          <view class="history-actions" v-if="item.status === 'pending'">
            <view class="action-btn cancel" @click.stop="handleCancel(item)">取消</view>
            <view class="action-btn primary" @click.stop="handleConfirm(item)">确认</view>
          </view>
        </view>
      </view>
    </template>

    <view class="cart-btn" @click="handleCart">
      <text class="cart-icon">🛒</text>
      <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref('product')
const keyword = ref('')
const sortType = ref('default')
const sortOrder = ref('desc')
const currentCategory = ref('')
const showFilterPanel = ref(false)
const filterSupplier = ref('')
const priceMin = ref('')
const priceMax = ref('')
const cartCount = ref(3)
const bomType = ref('')
const startDate = ref('')
const endDate = ref('')
const historyStatus = ref('')

const categories = ref([
  { id: 'steel', name: '钢材' },
  { id: 'cement', name: '水泥' },
  { id: 'sand', name: '砂石' },
  { id: 'concrete', name: '混凝土' },
  { id: 'brick', name: '砌体材料' },
  { id: 'decoration', name: '装修材料' },
])

const supplierList = ref([
  { id: 's001', name: '华新水泥供应商' },
  { id: 's002', name: '海螺水泥供应商' },
  { id: 's003', name: '宝钢供应商' },
  { id: 's004', name: '南方建材供应商' },
  { id: 's005', name: '中建混凝土供应商' },
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
    hasPermission: true,
    isHot: true,
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
    hasPermission: true,
    isHot: true,
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
    hasPermission: true,
    isHot: false,
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
    hasPermission: true,
    isHot: false,
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
    marketPrice: 4150,
    hasPermission: true,
    isHot: false,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 3950, supplyStatus: 'supplying', estimatedStock: 80 },
    ],
  },
])

const bomList = ref([
  {
    id: 'bom001',
    name: '标准住宅基础BOM包',
    type: '平台标准',
    description: '适用于标准住宅项目的基础建材配置包，包含水泥、砂石、钢筋等基础材料',
    productCount: 12,
    estimatedPrice: '158,000',
    tags: ['住宅', '基础工程', '推荐'],
  },
  {
    id: 'bom002',
    name: '商业建筑主体BOM包',
    type: '平台标准',
    description: '适用于商业建筑主体工程的建材配置包，包含钢结构、混凝土、砌体材料等',
    productCount: 18,
    estimatedPrice: '328,000',
    tags: ['商业', '主体工程'],
  },
  {
    id: 'bom003',
    name: '装修工程BOM包',
    type: '自定义',
    description: '室内装修工程材料配置包，包含瓷砖、涂料、管材等装修材料',
    productCount: 25,
    estimatedPrice: '85,000',
    tags: ['装修', '室内'],
  },
])

const purchaseHistory = ref([
  {
    id: 'po001',
    orderNo: 'PO2024010001',
    status: 'pending',
    statusText: '待确认',
    supplierName: '华新水泥供应商',
    createTime: '2024-01-15 14:30',
    products: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=10', price: 420, qty: 20 },
    ],
    totalQty: 20,
    totalAmount: '8,400.00',
  },
  {
    id: 'po002',
    orderNo: 'PO2024010002',
    status: 'shipped',
    statusText: '已发货',
    supplierName: '宝钢供应商',
    createTime: '2024-01-14 10:20',
    products: [
      { id: 'p2', name: '螺纹钢 HRB400 20mm', spec: '20mm', image: 'https://picsum.photos/100/100?random=11', price: 3950, qty: 10 },
    ],
    totalQty: 10,
    totalAmount: '39,500.00',
  },
  {
    id: 'po003',
    orderNo: 'PO2024010003',
    status: 'completed',
    statusText: '已完成',
    supplierName: '南方建材供应商',
    createTime: '2024-01-12 16:45',
    products: [
      { id: 'p3', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=12', price: 80, qty: 100 },
    ],
    totalQty: 100,
    totalAmount: '8,000.00',
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
      p.suppliers && p.suppliers.some(s => s.supplierId === filterSupplier.value)
    )
  }
  
  if (priceMin.value || priceMax.value) {
    const min = parseFloat(priceMin.value) || 0
    const max = parseFloat(priceMax.value) || Infinity
    result = result.filter(p => p.marketPrice >= min && p.marketPrice <= max)
  }
  
  if (sortType.value === 'price') {
    result = [...result].sort((a, b) => 
      sortOrder.value === 'asc' ? a.marketPrice - b.marketPrice : b.marketPrice - a.marketPrice
    )
  } else if (sortType.value === 'sales') {
    result = [...result].sort((a, b) => 
      sortOrder.value === 'asc' ? (a.isHot ? 0 : 1) - (b.isHot ? 0 : 1) : (b.isHot ? 0 : 1) - (a.isHot ? 0 : 1)
    )
  }
  
  return result
})

const filteredBomList = computed(() => {
  if (!bomType.value) return bomList.value
  return bomList.value.filter(b => 
    bomType.value === 'platform' ? b.type === '平台标准' : b.type === '自定义'
  )
})

const filteredHistory = computed(() => {
  if (!historyStatus.value) return purchaseHistory.value
  return purchaseHistory.value.filter(h => h.status === historyStatus.value)
})

function handleScan() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '扫码成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}

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

function resetFilter() {
  filterSupplier.value = ''
  priceMin.value = ''
  priceMax.value = ''
}

function confirmFilter() {
  showFilterPanel.value = false
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
  uni.showToast({ title: '已加入购物车', icon: 'success' })
  cartCount.value++
}

function handleBomDetail(item: any) {
  uni.navigateTo({ url: `/pages/market/bom-detail?id=${item.id}` })
}

function handleBomPurchase(item: any) {
  uni.navigateTo({ url: `/pages/market/bom-detail?id=${item.id}&action=purchase` })
}

function onStartDateChange(e: any) {
  startDate.value = e.detail.value
}

function onEndDateChange(e: any) {
  endDate.value = e.detail.value
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: '#ff7d00',
    shipped: '#165dff',
    completed: '#00b42a',
  }
  return colors[status] || '#666'
}

function handleHistoryDetail(item: any) {
  uni.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=purchase` })
}

function handleCancel(item: any) {
  uni.showModal({
    title: '取消订单',
    content: `确定取消采购订单 ${item.orderNo} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已取消', icon: 'success' })
      }
    },
  })
}

function handleConfirm(item: any) {
  uni.showModal({
    title: '确认订单',
    content: `确定确认采购订单 ${item.orderNo} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已确认', icon: 'success' })
      }
    },
  })
}

function handleCart() {
  uni.navigateTo({ url: '/pages/cart/index' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
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

.scan-icon {
  font-size: 36rpx;
  margin-left: 16rpx;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
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

.filter-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
}

.panel-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.panel-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80%;
  background-color: #fff;
  padding: 32rpx;
  padding-top: 80rpx;
}

.panel-section {
  margin-bottom: 32rpx;
}

.panel-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 20rpx;
  display: block;
}

.panel-options {
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
  padding: 0 20rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.price-sep {
  margin: 0 16rpx;
  color: #86909c;
}

.panel-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.panel-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  
  &.reset {
    color: #666;
    background-color: #f7f8fa;
  }
  
  &.confirm {
    color: #fff;
    background-color: #165dff;
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
}

.product-tags {
  display: flex;
  margin-left: 16rpx;
  
  .tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    margin-left: 8rpx;
    
    &.permission {
      color: #00b42a;
      background-color: #e8ffea;
    }
    
    &.hot {
      color: #f53f3f;
      background-color: #ffece8;
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
  
  .supplier-stock {
    font-size: 22rpx;
    color: #00b42a;
    margin-left: 16rpx;
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
  flex-wrap: wrap;
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

.supply-price {
  font-size: 22rpx;
  color: #00b42a;
  background-color: #e8ffea;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  margin-left: 12rpx;
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

.bom-filter {
  display: flex;
  padding: 20rpx 32rpx;
  background-color: #fff;
  gap: 20rpx;
}

.bom-filter-item {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 28rpx;
  
  &.active {
    color: #fff;
    background-color: #165dff;
  }
}

.bom-list {
  padding: 24rpx 32rpx;
}

.bom-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.bom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.bom-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.bom-type {
  font-size: 22rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.bom-desc {
  font-size: 26rpx;
  color: #86909c;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bom-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.bom-count {
  font-size: 24rpx;
  color: #666;
}

.bom-price {
  font-size: 24rpx;
  color: #f53f3f;
  font-weight: 500;
}

.bom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
  
  .tag {
    font-size: 22rpx;
    color: #86909c;
    background-color: #f7f8fa;
    padding: 6rpx 16rpx;
    border-radius: 4rpx;
  }
}

.bom-action {
  display: flex;
  justify-content: flex-end;
  
  .action-btn {
    padding: 12rpx 32rpx;
    font-size: 26rpx;
    color: #fff;
    background-color: #165dff;
    border-radius: 32rpx;
  }
}

.history-filter {
  background-color: #fff;
  padding: 20rpx 32rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.date-picker {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #1d2129;
  
  .arrow {
    font-size: 20rpx;
    color: #86909c;
    margin-left: 8rpx;
  }
}

.date-sep {
  margin: 0 16rpx;
  color: #86909c;
  font-size: 26rpx;
}

.status-filter {
  display: flex;
  gap: 16rpx;
}

.status-item {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 20rpx;
  
  &.active {
    color: #fff;
    background-color: #165dff;
  }
}

.history-list {
  padding: 24rpx 32rpx;
}

.history-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.history-no {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.history-status {
  font-size: 24rpx;
  font-weight: 500;
}

.history-supplier {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  .supplier-label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .supplier-name {
    font-size: 24rpx;
    color: #1d2129;
    margin-left: 8rpx;
  }
}

.history-products {
  margin-bottom: 16rpx;
}

.product-row {
  display: flex;
  padding: 12rpx 0;
  
  .product-image {
    width: 80rpx;
    height: 80rpx;
    border-radius: 8rpx;
  }
  
  .product-info {
    flex: 1;
    margin-left: 16rpx;
  }
  
  .product-name {
    font-size: 26rpx;
    color: #1d2129;
  }
  
  .product-spec {
    font-size: 22rpx;
    color: #86909c;
    margin-top: 4rpx;
  }
  
  .product-right {
    text-align: right;
  }
  
  .product-price {
    font-size: 26rpx;
    color: #1d2129;
  }
  
  .product-qty {
    font-size: 24rpx;
    color: #86909c;
    margin-top: 4rpx;
  }
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f7f8fa;
}

.history-total {
  font-size: 26rpx;
  color: #666;
  
  .total-price {
    color: #f53f3f;
    font-weight: 600;
  }
}

.history-time {
  font-size: 24rpx;
  color: #86909c;
}

.history-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 16rpx;
  
  .action-btn {
    padding: 12rpx 32rpx;
    font-size: 26rpx;
    border-radius: 32rpx;
    
    &.cancel {
      color: #666;
      background-color: #f7f8fa;
    }
    
    &.primary {
      color: #fff;
      background-color: #165dff;
    }
  }
}

.cart-btn {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(22, 93, 255, 0.4);
}

.cart-icon {
  font-size: 48rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  background: #f53f3f;
  border-radius: 18rpx;
  font-size: 22rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}
</style>
