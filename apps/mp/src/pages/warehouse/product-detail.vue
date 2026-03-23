<template>
  <view class="page">
    <view class="product-header">
      <swiper class="image-swiper" indicator-dots autoplay circular>
        <swiper-item v-for="(img, index) in product.images" :key="index">
          <image :src="img" mode="aspectFill" class="product-image" />
        </swiper-item>
      </swiper>
    </view>
    
    <view class="product-info">
      <view class="price-row">
        <view class="price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ product.priceRange }}</text>
        </view>
        <view class="sales">已售 {{ product.sales || 0 }}</view>
      </view>
      <text class="product-name">{{ product.productName }}</text>
      <view class="tags-row">
        <text class="tag" v-if="product.isHot">🔥 热销</text>
        <text class="tag" v-if="product.isRecommend">👍 推荐</text>
        <text class="tag">📦 现货</text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">选择规格</text>
        <text class="selected-count">已选 {{ selectedSkuCount }} 种</text>
      </view>
      
      <view class="sku-list">
        <view 
          class="sku-item" 
          v-for="sku in product.skuList" 
          :key="sku.id"
        >
          <view class="sku-header" @click="handleToggleSku(sku)">
            <view class="sku-checkbox" :class="{ checked: sku.selected }">
              <text v-if="sku.selected">✓</text>
            </view>
            <view class="sku-info">
              <text class="sku-name">{{ sku.specName }}</text>
              <view class="sku-meta">
                <text class="sku-price">¥{{ sku.salePrice }}</text>
                <text class="sku-stock">库存 {{ sku.stock }}</text>
              </view>
            </view>
            <view class="sku-action">
              <view class="quantity-control" v-if="sku.selected" @click.stop>
                <view class="btn" :class="{ disabled: sku.quantity <= 1 }" @click="handleSkuMinus(sku)">-</view>
                <input type="number" v-model="sku.quantity" class="quantity-input" @click.stop />
                <view class="btn" :class="{ disabled: sku.quantity >= sku.stock }" @click="handleSkuPlus(sku)">+</view>
              </view>
              <text class="add-text" v-else>点击添加</text>
            </view>
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
          <text class="detail-label">商品编码</text>
          <text class="detail-value">{{ product.productCode }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">商品分类</text>
          <text class="detail-value">{{ product.categoryName }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">来源</text>
          <text class="detail-value">{{ product.sourceName }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">成本价</text>
          <text class="detail-value cost">¥{{ product.costPrice }}</text>
        </view>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">仓库库存</text>
      </view>
      <view class="warehouse-list">
        <view class="warehouse-item" v-for="wh in product.warehouseStock" :key="wh.id">
          <view class="warehouse-info">
            <text class="warehouse-name">{{ wh.name }}</text>
            <text class="warehouse-address">{{ wh.address }}</text>
          </view>
          <view class="warehouse-stock">
            <text class="stock-label">库存</text>
            <text class="stock-value">{{ wh.stock }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="bottom-bar">
      <view class="cart-info" @click="handleShowCart">
        <view class="cart-icon">
          <text>🛒</text>
          <view class="cart-badge" v-if="totalQuantity > 0">{{ totalQuantity }}</view>
        </view>
        <view class="cart-total">
          <text class="total-label">合计：</text>
          <text class="total-price">¥{{ totalPrice }}</text>
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
    
    <view class="cart-drawer" v-if="showCartDrawer" @click="showCartDrawer = false">
      <view class="drawer-content" @click.stop>
        <view class="drawer-header">
          <text class="drawer-title">已选商品</text>
          <text class="drawer-close" @click="showCartDrawer = false">✕</text>
        </view>
        
        <scroll-view scroll-y class="drawer-body">
          <view class="cart-item" v-for="sku in selectedSkuList" :key="sku.id">
            <view class="cart-item-info">
              <text class="cart-item-name">{{ sku.specName }}</text>
              <text class="cart-item-price">¥{{ sku.salePrice }}</text>
            </view>
            <view class="cart-item-quantity">
              <view class="btn" :class="{ disabled: sku.quantity <= 1 }" @click="handleSkuMinus(sku)">-</view>
              <text class="quantity-text">{{ sku.quantity }}</text>
              <view class="btn" :class="{ disabled: sku.quantity >= sku.stock }" @click="handleSkuPlus(sku)">+</view>
            </view>
            <view class="cart-item-subtotal">
              <text>¥{{ (sku.salePrice * sku.quantity).toFixed(2) }}</text>
            </view>
          </view>
          
          <view class="empty-cart" v-if="selectedSkuList.length === 0">
            <text>暂未选择商品</text>
          </view>
        </scroll-view>
        
        <view class="drawer-footer">
          <view class="footer-total">
            <text class="total-label">共 {{ totalQuantity }} 件，合计：</text>
            <text class="total-price">¥{{ totalPrice }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const productId = ref('')
const showCartDrawer = ref(false)

const product = ref<any>({
  id: '',
  productCode: '',
  productName: '',
  categoryName: '',
  sourceName: '',
  costPrice: 0,
  priceRange: '380-450',
  mainImage: '',
  images: [],
  sales: 1250,
  isHot: true,
  isRecommend: true,
  skuList: [],
  warehouseStock: [],
})

const selectedSkuList = computed(() => {
  return product.value.skuList.filter((s: any) => s.selected && s.quantity > 0)
})

const selectedSkuCount = computed(() => selectedSkuList.value.length)

const totalQuantity = computed(() => {
  return selectedSkuList.value.reduce((sum: number, s: any) => sum + s.quantity, 0)
})

const totalPrice = computed(() => {
  return selectedSkuList.value.reduce((sum: number, s: any) => sum + s.salePrice * s.quantity, 0).toFixed(2)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  productId.value = currentPage?.options?.id || ''
  
  loadProductDetail()
})

function loadProductDetail() {
  product.value = {
    id: 'p001',
    productCode: 'PRD-SN-001',
    productName: '水泥 P.O 普通硅酸盐水泥',
    categoryName: '水泥',
    sourceName: '华新水泥供应商',
    costPrice: 400,
    priceRange: '420-480',
    mainImage: 'https://picsum.photos/400/400?random=1',
    images: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
    ],
    sales: 1250,
    isHot: true,
    isRecommend: true,
    skuList: [
      { id: 'sku1', specName: 'P.O 42.5 散装', salePrice: 420, stock: 200, quantity: 0, selected: false },
      { id: 'sku2', specName: 'P.O 42.5 袋装50kg', salePrice: 450, stock: 300, quantity: 0, selected: false },
      { id: 'sku3', specName: 'P.O 52.5 散装', salePrice: 460, stock: 150, quantity: 0, selected: false },
      { id: 'sku4', specName: 'P.O 52.5 袋装50kg', salePrice: 480, stock: 180, quantity: 0, selected: false },
    ],
    warehouseStock: [
      { id: 'wh1', name: '深圳湾科技园主仓', address: '广东省深圳市南山区', stock: 450 },
      { id: 'wh2', name: '福田CBD分仓', address: '广东省深圳市福田区', stock: 380 },
    ],
  }
}

function handleToggleSku(sku: any) {
  sku.selected = !sku.selected
  if (sku.selected && sku.quantity === 0) {
    sku.quantity = 1
  }
}

function handleSkuMinus(sku: any) {
  if (sku.quantity > 1) {
    sku.quantity--
  } else if (sku.quantity === 1) {
    sku.selected = false
    sku.quantity = 0
  }
}

function handleSkuPlus(sku: any) {
  if (sku.quantity < sku.stock) {
    sku.quantity++
  }
}

function handleShowCart() {
  showCartDrawer.value = true
}

function handleAddCart() {
  if (selectedSkuList.value.length === 0) {
    uni.showToast({ title: '请选择商品规格', icon: 'none' })
    return
  }
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

function handleBuyNow() {
  if (selectedSkuList.value.length === 0) {
    uni.showToast({ title: '请选择商品规格', icon: 'none' })
    return
  }
  const skuIds = selectedSkuList.value.map((s: any) => s.id).join(',')
  const quantities = selectedSkuList.value.map((s: any) => s.quantity).join(',')
  uni.navigateTo({ 
    url: `/pages/warehouse/order-create?productId=${product.value.id}&skuIds=${skuIds}&quantities=${quantities}` 
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.product-header {
  background-color: #fff;
}

.image-swiper {
  height: 600rpx;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 24rpx;
  background-color: #fff;
  margin-bottom: 16rpx;
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
  color: #ff4d4f;
}

.price-value {
  font-size: 44rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.sales {
  font-size: 24rpx;
  color: #999;
}

.product-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.tags-row {
  display: flex;
  gap: 16rpx;
  
  .tag {
    font-size: 22rpx;
    color: #ff6b00;
    background-color: #fff5eb;
    padding: 6rpx 16rpx;
    border-radius: 6rpx;
  }
}

.section {
  background-color: #fff;
  margin-bottom: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.selected-count {
  font-size: 24rpx;
  color: #ff6b00;
}

.sku-list {
  padding: 0 24rpx;
}

.sku-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.sku-header {
  display: flex;
  align-items: center;
}

.sku-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  
  &.checked {
    background-color: #ff6b00;
    border-color: #ff6b00;
    color: #fff;
  }
}

.sku-info {
  flex: 1;
}

.sku-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.sku-meta {
  display: flex;
  align-items: center;
}

.sku-price {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 600;
  margin-right: 24rpx;
}

.sku-stock {
  font-size: 24rpx;
  color: #999;
}

.sku-action {
  display: flex;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.btn {
  width: 48rpx;
  height: 48rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
  
  &.disabled {
    color: #ccc;
  }
}

.quantity-input {
  width: 80rpx;
  height: 48rpx;
  text-align: center;
  font-size: 26rpx;
  margin: 0 8rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.add-text {
  font-size: 24rpx;
  color: #ff6b00;
}

.detail-content {
  padding: 16rpx 24rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.detail-label {
  font-size: 26rpx;
  color: #999;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  
  &.cost {
    color: #ff4d4f;
  }
}

.warehouse-list {
  padding: 0 24rpx;
}

.warehouse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.warehouse-info {
  flex: 1;
}

.warehouse-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.warehouse-address {
  font-size: 24rpx;
  color: #999;
}

.warehouse-stock {
  text-align: right;
}

.stock-label {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.stock-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff6b00;
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
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.cart-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.cart-icon {
  position: relative;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  padding: 0 8rpx;
  font-size: 20rpx;
  color: #fff;
  background-color: #ff4d4f;
  border-radius: 16rpx;
  text-align: center;
}

.cart-total {
  margin-left: 16rpx;
}

.total-label {
  font-size: 24rpx;
  color: #999;
}

.total-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn-cart {
  padding: 0 32rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #ff6b00;
  background-color: #fff5eb;
  border-radius: 36rpx;
}

.btn-buy {
  padding: 0 32rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #fff;
  background: linear-gradient(90deg, #ff6b00, #ff4d4f);
  border-radius: 36rpx;
}

.cart-drawer {
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

.drawer-content {
  width: 100%;
  max-height: 70vh;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.drawer-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.drawer-close {
  font-size: 32rpx;
  color: #999;
}

.drawer-body {
  flex: 1;
  padding: 24rpx;
  max-height: 50vh;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.cart-item-price {
  font-size: 24rpx;
  color: #ff4d4f;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  margin: 0 24rpx;
}

.quantity-text {
  width: 60rpx;
  text-align: center;
  font-size: 26rpx;
}

.cart-item-subtotal {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.empty-cart {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
}

.drawer-footer {
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.footer-total {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
}
</style>
