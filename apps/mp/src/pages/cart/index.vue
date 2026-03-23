<template>
  <view class="page">
    <view class="cart-list" v-if="cartList.length > 0">
      <view class="cart-group" v-for="group in groupedCart" :key="group.supplierId">
        <view class="group-header">
          <view class="checkbox" :class="{ checked: isGroupChecked(group.supplierId) }" @click="handleCheckGroup(group.supplierId)">
            <text v-if="isGroupChecked(group.supplierId)">✓</text>
          </view>
          <text class="supplier-name">{{ group.supplierName }}</text>
          <text class="delivery-info">预计{{ group.deliveryDays }}天送达</text>
        </view>
        
        <view class="cart-item" v-for="item in group.items" :key="item.id">
          <view class="checkbox" :class="{ checked: item.checked }" @click="handleCheck(item)">
            <text v-if="item.checked">✓</text>
          </view>
          <image :src="item.image" mode="aspectFill" class="product-image" @click="handleProductDetail(item)" />
          <view class="product-info">
            <text class="product-name" @click="handleProductDetail(item)">{{ item.name }}</text>
            <text class="product-spec">{{ item.spec }}</text>
            <view class="product-bottom">
              <view class="product-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ item.price }}</text>
              </view>
              <view class="quantity-control">
                <view class="btn" :class="{ disabled: item.quantity <= 1 }" @click="handleMinus(item)">-</view>
                <text class="quantity">{{ item.quantity }}</text>
                <view class="btn" @click="handlePlus(item)">+</view>
              </view>
            </view>
          </view>
          <view class="delete-btn" @click="handleDelete(item)">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty" v-else>
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <view class="empty-btn" @click="handleGoMarket">去逛逛</view>
    </view>
    
    <view class="bottom-bar" v-if="cartList.length > 0">
      <view class="select-all" @click="handleSelectAll">
        <view class="checkbox" :class="{ checked: isAllChecked }">
          <text v-if="isAllChecked">✓</text>
        </view>
        <text>全选</text>
      </view>
      <view class="total-info">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ totalPrice }}</text>
      </view>
      <view class="submit-btn" :class="{ disabled: checkedCount === 0 }" @click="handleSubmit">
        结算({{ checkedCount }})
      </view>
    </view>
    
    <view class="recommend-section" v-if="recommendProducts.length > 0">
      <view class="section-header">
        <text class="section-title">猜你喜欢</text>
      </view>
      <scroll-view scroll-x class="recommend-list">
        <view class="recommend-item" v-for="item in recommendProducts" :key="item.id" @click="handleProductDetail(item)">
          <image :src="item.image" mode="aspectFill" class="recommend-image" />
          <view class="recommend-info">
            <text class="recommend-name">{{ item.name }}</text>
            <view class="recommend-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ item.price }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CartItem {
  id: string
  productId: string
  name: string
  spec: string
  price: number
  quantity: number
  image: string
  checked: boolean
  supplierId: string
  supplierName: string
  deliveryDays: number
  unit: string
}

const cartList = ref<CartItem[]>([
  { 
    id: 'c1', 
    productId: 'mp001',
    name: '水泥 P.O 42.5', 
    spec: '50kg/袋', 
    price: 420, 
    quantity: 10, 
    image: 'https://picsum.photos/200/200?random=1', 
    checked: true,
    supplierId: 's001',
    supplierName: '华新水泥供应商',
    deliveryDays: 2,
    unit: '吨',
  },
  { 
    id: 'c2', 
    productId: 'mp002',
    name: '螺纹钢 HRB400 16mm', 
    spec: '16mm', 
    price: 4000, 
    quantity: 5, 
    image: 'https://picsum.photos/200/200?random=2', 
    checked: false,
    supplierId: 's003',
    supplierName: '宝钢供应商',
    deliveryDays: 3,
    unit: '吨',
  },
  { 
    id: 'c3', 
    productId: 'mp003',
    name: '黄砂 中砂', 
    spec: '中砂', 
    price: 80, 
    quantity: 20, 
    image: 'https://picsum.photos/200/200?random=3', 
    checked: true,
    supplierId: 's004',
    supplierName: '南方建材供应商',
    deliveryDays: 1,
    unit: '方',
  },
])

const recommendProducts = ref([
  { id: 'r1', name: '商品混凝土 C30', price: 380, image: 'https://picsum.photos/200/200?random=4' },
  { id: 'r2', name: '碎石 5-31.5mm', price: 72, image: 'https://picsum.photos/200/200?random=5' },
  { id: 'r3', name: '防水涂料', price: 280, image: 'https://picsum.photos/200/200?random=6' },
])

const groupedCart = computed(() => {
  const groups: Record<string, { supplierId: string; supplierName: string; deliveryDays: number; items: CartItem[] }> = {}
  
  cartList.value.forEach(item => {
    if (!groups[item.supplierId]) {
      groups[item.supplierId] = {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        deliveryDays: item.deliveryDays,
        items: [],
      }
    }
    groups[item.supplierId].items.push(item)
  })
  
  return Object.values(groups)
})

const isAllChecked = computed(() => cartList.value.every(item => item.checked))

const checkedCount = computed(() => cartList.value.filter(item => item.checked).length)

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

function isGroupChecked(supplierId: string) {
  const groupItems = cartList.value.filter(item => item.supplierId === supplierId)
  return groupItems.every(item => item.checked)
}

function handleCheck(item: CartItem) {
  item.checked = !item.checked
}

function handleCheckGroup(supplierId: string) {
  const groupItems = cartList.value.filter(item => item.supplierId === supplierId)
  const checked = !isGroupChecked(supplierId)
  groupItems.forEach(item => {
    item.checked = checked
  })
}

function handleSelectAll() {
  const checked = !isAllChecked.value
  cartList.value.forEach(item => {
    item.checked = checked
  })
}

function handleMinus(item: CartItem) {
  if (item.quantity > 1) {
    item.quantity--
  }
}

function handlePlus(item: CartItem) {
  item.quantity++
}

function handleDelete(item: CartItem) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) {
        const index = cartList.value.findIndex(i => i.id === item.id)
        if (index > -1) {
          cartList.value.splice(index, 1)
        }
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function handleGoMarket() {
  uni.switchTab({ url: '/pages/market/index' })
}

function handleProductDetail(item: any) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.productId || item.id}` })
}

function handleSubmit() {
  if (checkedCount.value === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  
  const checkedItems = cartList.value.filter(item => item.checked)
  const orderData = encodeURIComponent(JSON.stringify(checkedItems.map(item => ({
    productId: item.productId,
    supplierId: item.supplierId,
    quantity: item.quantity,
    price: item.price,
  }))))
  
  uni.navigateTo({ url: `/pages/order/create?items=${orderData}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.cart-list {
  padding: 24rpx 32rpx;
}

.cart-group {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
}

.supplier-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #1d2129;
  margin-left: 16rpx;
}

.delivery-info {
  font-size: 22rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 24rpx;
  color: #fff;
  flex-shrink: 0;
  
  &.checked {
    background-color: #165dff;
    border-color: #165dff;
  }
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 24rpx;
  min-width: 0;
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
  margin-top: 8rpx;
  display: block;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
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
  font-size: 32rpx;
  font-weight: 600;
  color: #f53f3f;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.btn {
  width: 48rpx;
  height: 48rpx;
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

.quantity {
  width: 72rpx;
  text-align: center;
  font-size: 28rpx;
}

.delete-btn {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  font-size: 24rpx;
  color: #86909c;
  padding: 8rpx 16rpx;
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
  margin-bottom: 48rpx;
}

.empty-btn {
  padding: 20rpx 80rpx;
  background-color: #165dff;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
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

.select-all {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #1d2129;
  
  .checkbox {
    margin-right: 12rpx;
  }
}

.total-info {
  flex: 1;
  text-align: right;
  margin-right: 24rpx;
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

.submit-btn {
  padding: 16rpx 48rpx;
  background-color: #165dff;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  
  &.disabled {
    background-color: #c9cdd4;
  }
}

.recommend-section {
  background-color: #fff;
  margin-top: 24rpx;
  padding: 32rpx 0;
}

.section-header {
  padding: 0 32rpx 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.recommend-list {
  white-space: nowrap;
  padding: 0 32rpx;
}

.recommend-item {
  display: inline-block;
  width: 240rpx;
  margin-right: 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.recommend-image {
  width: 100%;
  height: 180rpx;
}

.recommend-info {
  padding: 16rpx;
}

.recommend-name {
  font-size: 24rpx;
  color: #1d2129;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-price {
  display: flex;
  align-items: baseline;
  margin-top: 8rpx;
  
  .price-symbol {
    font-size: 22rpx;
  }
  
  .price-value {
    font-size: 28rpx;
  }
}
</style>
