<template>
  <view class="page">
    <view class="product-header">
      <swiper class="image-swiper" indicator-dots autoplay circular>
        <swiper-item v-for="(img, index) in product.images" :key="index">
          <image :src="img" mode="aspectFill" class="product-image" />
        </swiper-item>
      </swiper>
      <view class="product-tags" v-if="product.isHot || product.isRecommend">
        <text class="tag hot" v-if="product.isHot">热销</text>
        <text class="tag recommend" v-if="product.isRecommend">推荐</text>
      </view>
    </view>
    
    <view class="product-info">
      <view class="price-row">
        <view class="price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ product.marketPrice }}</text>
          <text class="price-unit">/{{ product.unit }}</text>
        </view>
        <view class="sales">已售 {{ product.sales || 0 }} {{ product.unit }}</view>
      </view>
      <text class="product-name">{{ product.skuName }}</text>
      <text class="product-code">编码：{{ product.skuCode }}</text>
      <view class="spec-row">
        <text class="spec-label">规格：</text>
        <text class="spec-value">{{ formatSpecs(product.specs) }}</text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">选择供应商</text>
        <text class="supplier-count">共 {{ product.suppliers?.length || 0 }} 家</text>
      </view>
      
      <view class="supplier-list">
        <view 
          class="supplier-item" 
          :class="{ active: selectedSupplier?.supplierId === s.supplierId }"
          v-for="s in product.suppliers" 
          :key="s.supplierId"
          @click="handleSelectSupplier(s)"
        >
          <view class="supplier-main">
            <view class="supplier-radio">
              <text v-if="selectedSupplier?.supplierId === s.supplierId">✓</text>
            </view>
            <view class="supplier-info">
              <text class="supplier-name">{{ s.supplierName }}</text>
              <view class="supplier-meta">
                <text class="supply-price">供货价 ¥{{ s.supplyPrice }}</text>
                <text class="stock">库存 {{ s.estimatedStock }} {{ product.unit }}</text>
              </view>
            </view>
          </view>
          <view class="supplier-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ s.supplyPrice }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">商品详情</text>
      </view>
      <view class="detail-content">
        <view class="detail-item">
          <text class="detail-label">商品分类</text>
          <text class="detail-value">{{ product.categoryName }}</text>
        </view>
        <view class="detail-item" v-for="(value, key) in product.specs" :key="key">
          <text class="detail-label">{{ key }}</text>
          <text class="detail-value">{{ value }}</text>
        </view>
      </view>
    </view>
    
    <view class="bottom-bar">
      <view class="action-icons">
        <view class="icon-item" @click="handleGoCart">
          <text class="icon">🛒</text>
          <text class="badge" v-if="cartCount > 0">{{ cartCount }}</text>
        </view>
        <view class="icon-item" @click="handleFavorite">
          <text class="icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="btn-cart" @click="handleAddCart">
          <text>加入购物车</text>
        </view>
        <view class="btn-buy" @click="handleBuyNow">
          <text>立即购买</text>
        </view>
      </view>
    </view>
    
    <view class="quantity-modal" v-if="showQuantityModal" @click="showQuantityModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ modalTitle }}</text>
          <text class="modal-close" @click="showQuantityModal = false">✕</text>
        </view>
        
        <view class="modal-body">
          <view class="product-summary">
            <image :src="product.mainImage" mode="aspectFill" class="summary-image" />
            <view class="summary-info">
              <text class="summary-name">{{ product.skuName }}</text>
              <text class="summary-supplier">{{ selectedSupplier?.supplierName }}</text>
              <view class="summary-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ selectedSupplier?.supplyPrice || product.marketPrice }}</text>
              </view>
            </view>
          </view>
          
          <view class="quantity-row">
            <text class="quantity-label">采购数量</text>
            <view class="quantity-control">
              <view class="btn" :class="{ disabled: quantity <= 1 }" @click="handleMinus">-</view>
              <input type="number" v-model="quantity" class="quantity-input" />
              <view class="btn" @click="handlePlus">+</view>
            </view>
          </view>
          
          <view class="total-row">
            <text class="total-label">小计</text>
            <text class="total-price">¥{{ totalPrice }}</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn-confirm" @click="handleConfirmAction">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const productId = ref('')
const product = ref<any>({
  id: '',
  skuId: '',
  skuCode: '',
  skuName: '',
  categoryName: '',
  specs: {},
  mainImage: '',
  images: [],
  unit: '吨',
  marketPrice: 0,
  isHot: false,
  isRecommend: false,
  sales: 0,
  suppliers: [],
})

const selectedSupplier = ref<any>(null)
const quantity = ref(1)
const showQuantityModal = ref(false)
const modalAction = ref<'cart' | 'buy'>('cart')
const cartCount = ref(2)
const isFavorite = ref(false)

const modalTitle = computed(() => modalAction.value === 'cart' ? '加入购物车' : '立即购买')

const totalPrice = computed(() => {
  const price = selectedSupplier.value?.supplyPrice || product.value.marketPrice
  return (price * quantity.value).toFixed(2)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  productId.value = currentPage?.options?.id || ''
  
  loadProductDetail()
})

function loadProductDetail() {
  product.value = {
    id: 'mp001',
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5 普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '42.5', '类型': '普通硅酸盐', '包装': '50kg/袋' },
    mainImage: 'https://picsum.photos/400/400?random=1',
    images: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
    ],
    unit: '吨',
    marketPrice: 450,
    isHot: true,
    isRecommend: true,
    sales: 1250,
    suppliers: [
      { 
        supplierId: 's001', 
        supplierName: '华新水泥供应商', 
        supplyPrice: 420, 
        supplyStatus: 'supplying', 
        estimatedStock: 500,
        deliveryDays: 2,
      },
      { 
        supplierId: 's002', 
        supplierName: '海螺水泥供应商', 
        supplyPrice: 415, 
        supplyStatus: 'supplying', 
        estimatedStock: 300,
        deliveryDays: 3,
      },
    ],
  }
  
  if (product.value.suppliers?.length > 0) {
    selectedSupplier.value = product.value.suppliers[0]
  }
}

function formatSpecs(specs: Record<string, string>) {
  return Object.entries(specs || {}).map(([k, v]) => v).join(' / ')
}

function handleSelectSupplier(s: any) {
  selectedSupplier.value = s
}

function handleMinus() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function handlePlus() {
  const maxStock = selectedSupplier.value?.estimatedStock || 9999
  if (quantity.value < maxStock) {
    quantity.value++
  }
}

function handleAddCart() {
  if (!selectedSupplier.value) {
    uni.showToast({ title: '请选择供应商', icon: 'none' })
    return
  }
  modalAction.value = 'cart'
  quantity.value = 1
  showQuantityModal.value = true
}

function handleBuyNow() {
  if (!selectedSupplier.value) {
    uni.showToast({ title: '请选择供应商', icon: 'none' })
    return
  }
  modalAction.value = 'buy'
  quantity.value = 1
  showQuantityModal.value = true
}

function handleConfirmAction() {
  showQuantityModal.value = false
  
  if (modalAction.value === 'cart') {
    uni.showToast({ title: '已加入购物车', icon: 'success' })
    cartCount.value++
  } else {
    uni.navigateTo({ 
      url: `/pages/order/create?productId=${product.value.id}&supplierId=${selectedSupplier.value.supplierId}&quantity=${quantity.value}` 
    })
  }
}

function handleGoCart() {
  uni.switchTab({ url: '/pages/cart/index' })
}

function handleFavorite() {
  isFavorite.value = !isFavorite.value
  uni.showToast({ 
    title: isFavorite.value ? '已收藏' : '已取消收藏', 
    icon: 'none' 
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.product-header {
  position: relative;
  background-color: #fff;
}

.image-swiper {
  height: 750rpx;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-tags {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  display: flex;
  
  .tag {
    font-size: 22rpx;
    padding: 6rpx 16rpx;
    border-radius: 6rpx;
    margin-right: 12rpx;
    
    &.hot {
      color: #fff;
      background-color: #f53f3f;
    }
    
    &.recommend {
      color: #fff;
      background-color: #165dff;
    }
  }
}

.product-info {
  padding: 32rpx;
  background-color: #fff;
  margin-bottom: 24rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 28rpx;
  color: #f53f3f;
}

.price-value {
  font-size: 48rpx;
  font-weight: 600;
  color: #f53f3f;
}

.price-unit {
  font-size: 24rpx;
  color: #86909c;
  margin-left: 8rpx;
}

.sales {
  font-size: 24rpx;
  color: #86909c;
}

.product-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
  margin-bottom: 12rpx;
}

.product-code {
  font-size: 24rpx;
  color: #86909c;
  display: block;
  margin-bottom: 16rpx;
}

.spec-row {
  display: flex;
  align-items: center;
}

.spec-label {
  font-size: 24rpx;
  color: #86909c;
}

.spec-value {
  font-size: 24rpx;
  color: #1d2129;
}

.section {
  background-color: #fff;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.supplier-count {
  font-size: 24rpx;
  color: #86909c;
}

.supplier-list {
  padding: 0 32rpx;
}

.supplier-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    .supplier-radio {
      background-color: #165dff;
      border-color: #165dff;
      color: #fff;
    }
  }
}

.supplier-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.supplier-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 24rpx;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
  margin-bottom: 8rpx;
}

.supplier-meta {
  display: flex;
  align-items: center;
}

.supply-price {
  font-size: 24rpx;
  color: #f53f3f;
  margin-right: 24rpx;
}

.stock {
  font-size: 24rpx;
  color: #86909c;
}

.supplier-price {
  display: flex;
  align-items: baseline;
  
  .price-symbol {
    font-size: 24rpx;
  }
  
  .price-value {
    font-size: 36rpx;
  }
}

.detail-content {
  padding: 24rpx 32rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
}

.detail-label {
  font-size: 26rpx;
  color: #86909c;
}

.detail-value {
  font-size: 26rpx;
  color: #1d2129;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.action-icons {
  display: flex;
  margin-right: 32rpx;
}

.icon-item {
  position: relative;
  width: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .icon {
    font-size: 44rpx;
  }
  
  .badge {
    position: absolute;
    top: -8rpx;
    right: 8rpx;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    padding: 0 8rpx;
    font-size: 20rpx;
    color: #fff;
    background-color: #f53f3f;
    border-radius: 16rpx;
    text-align: center;
  }
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 24rpx;
}

.btn-cart {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 40rpx;
}

.btn-buy {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  background-color: #165dff;
  border-radius: 40rpx;
}

.quantity-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.modal-close {
  font-size: 36rpx;
  color: #86909c;
}

.modal-body {
  padding: 32rpx;
  flex: 1;
  overflow-y: auto;
}

.product-summary {
  display: flex;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 32rpx;
}

.summary-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.summary-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.summary-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.summary-supplier {
  font-size: 24rpx;
  color: #86909c;
}

.summary-price {
  display: flex;
  align-items: baseline;
  
  .price-symbol {
    font-size: 24rpx;
  }
  
  .price-value {
    font-size: 36rpx;
  }
}

.quantity-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.quantity-label {
  font-size: 28rpx;
  color: #1d2129;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.btn {
  width: 56rpx;
  height: 56rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #1d2129;
  
  &.disabled {
    color: #c9cdd4;
  }
}

.quantity-input {
  width: 100rpx;
  height: 56rpx;
  text-align: center;
  font-size: 28rpx;
  margin: 0 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 28rpx;
  color: #1d2129;
}

.total-price {
  font-size: 36rpx;
  font-weight: 600;
  color: #f53f3f;
}

.modal-footer {
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-confirm {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  background-color: #165dff;
  border-radius: 44rpx;
}
</style>
