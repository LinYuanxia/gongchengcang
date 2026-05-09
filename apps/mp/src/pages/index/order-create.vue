<template>
  <view class="page">
    <view class="address-section">
      <view class="section-header">
        <text class="section-title">配送地址</text>
        <text class="section-more" @click="handleAddressChange">切换门店</text>
      </view>
      <view class="address-card" v-if="selectedAddress">
        <view class="address-icon">📍</view>
        <view class="address-info">
          <text class="address-name">{{ selectedAddress.name }}</text>
          <text class="address-detail">{{ selectedAddress.address }}</text>
        </view>
        <text class="address-arrow">›</text>
      </view>
      <view class="add-address" v-else @click="handleAddAddress">
        <text class="add-icon">+</text>
        <text class="add-text">添加收货地址</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">BOM基装包</text>
        <text class="section-more" @click="handleViewAllBom">查看全部</text>
      </view>
      <view class="bom-list">
        <view class="bom-card" v-for="bom in bomList" :key="bom.id" @click="handleBomSelect(bom)">
          <view class="bom-header">
            <text class="bom-name">{{ bom.name }}</text>
            <view class="bom-checkbox" :class="{ checked: selectedBom === bom.id }">
              <text v-if="selectedBom === bom.id">✓</text>
            </view>
          </view>
          <text class="bom-desc">{{ bom.description }}</text>
          <view class="bom-info">
            <text class="bom-count">{{ bom.productCount }}种材料</text>
            <text class="bom-price">¥{{ bom.estimatedPrice }}</text>
          </view>
          <view class="bom-products">
            <view class="product-tag" v-for="(prod, idx) in bom.products" :key="idx" v-if="idx < 4">
              {{ prod.name }} x{{ prod.qty }}
            </view>
            <text class="more-tag" v-if="bom.products.length > 4">+{{ bom.products.length - 4 }}种</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">商品清单</text>
        <text class="section-count">共{{ cartItems.length }}件商品</text>
      </view>
      <view class="cart-list" v-if="cartItems.length > 0">
        <view class="cart-item" v-for="item in cartItems" :key="item.id">
          <image :src="item.image" class="cart-image" />
          <view class="cart-info">
            <text class="cart-name">{{ item.name }}</text>
            <text class="cart-spec">{{ item.spec }}</text>
            <view class="cart-bottom">
              <text class="cart-price">¥{{ item.price }}</text>
              <view class="cart-qty">
                <view class="qty-btn" @click="handleQtyMinus(item)">-</view>
                <text class="qty-value">{{ item.qty }}</text>
                <view class="qty-btn" @click="handleQtyPlus(item)">+</view>
              </view>
            </view>
          </view>
          <view class="cart-delete" @click="handleCartDelete(item)">
            <text>✕</text>
          </view>
        </view>
      </view>
      <view class="empty" v-else>
        <text class="empty-icon">🛒</text>
        <text class="empty-text">购物车是空的</text>
        <view class="empty-btn" @click="handleGoMarket">去选购</view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">订单备注</text>
      </view>
      <textarea 
        v-model="remark" 
        placeholder="请输入备注信息（选填）" 
        class="remark-input"
        :maxlength="200"
      />
    </view>

    <view class="bottom-bar">
      <view class="total-section">
        <text class="total-label">合计:</text>
        <view class="total-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ totalAmount }}</text>
        </view>
      </view>
      <view class="submit-btn" :class="{ disabled: cartItems.length === 0 }" @click="handleSubmit">
        <text>提交订单</text>
      </view>
    </view>

    <view class="address-modal" v-if="showAddressModal">
      <view class="modal-mask" @click="showAddressModal = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">选择门店</text>
          <text class="modal-close" @click="showAddressModal = false">✕</text>
        </view>
        <scroll-view scroll-y class="address-list">
          <view 
            class="address-option" 
            v-for="addr in addressList" 
            :key="addr.id"
            :class="{ selected: selectedAddress?.id === addr.id }"
            @click="handleSelectAddress(addr)"
          >
            <view class="option-radio" :class="{ checked: selectedAddress?.id === addr.id }">
              <text v-if="selectedAddress?.id === addr.id">✓</text>
            </view>
            <view class="option-info">
              <text class="option-name">{{ addr.name }}</text>
              <text class="option-address">{{ addr.address }}</text>
            </view>
          </view>
          <view class="add-new-address" @click="handleAddNewAddress">
            <text class="add-icon">+</text>
            <text class="add-text">自建地址</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const selectedAddress = ref<any>(null)
const addressList = ref([])
const showAddressModal = ref(false)
const selectedBom = ref('')
const remark = ref('')

const bomList = ref([
  {
    id: 'bom001',
    name: '标准住宅基础BOM包',
    description: '适用于标准住宅项目的基础建材配置包',
    productCount: 12,
    estimatedPrice: '158,000',
    products: [
      { name: '水泥 P.O 42.5', qty: 50 },
      { name: '黄砂 中砂', qty: 100 },
      { name: '螺纹钢 HRB400', qty: 8 },
      { name: '商品混凝土 C30', qty: 60 },
      { name: '碎石', qty: 80 },
    ],
  },
  {
    id: 'bom002',
    name: '商业建筑主体BOM包',
    description: '适用于商业建筑主体工程的建材配置包',
    productCount: 18,
    estimatedPrice: '328,000',
    products: [
      { name: '螺纹钢 HRB400 16mm', qty: 20 },
      { name: '螺纹钢 HRB400 20mm', qty: 15 },
      { name: '商品混凝土 C35', qty: 100 },
      { name: '钢结构H型钢', qty: 5 },
    ],
  },
])

const cartItems = ref([
  {
    id: 'cart001',
    name: '水泥 P.O 42.5',
    spec: '强度等级: 42.5',
    image: 'https://picsum.photos/100/100?random=1',
    price: 420,
    qty: 20,
  },
  {
    id: 'cart002',
    name: '黄砂 中砂',
    spec: '类型: 中砂',
    image: 'https://picsum.photos/100/100?random=2',
    price: 80,
    qty: 50,
  },
  {
    id: 'cart003',
    name: '螺纹钢 HRB400 16mm',
    spec: '规格: 16mm',
    image: 'https://picsum.photos/100/100?random=3',
    price: 4000,
    qty: 5,
  },
])

const totalAmount = computed(() => {
  const total = cartItems.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  return total.toLocaleString()
})

onMounted(() => {
  addressList.value = [
    { id: 'addr001', name: '深圳湾壹号T3栋', address: '广东省深圳市南山区深圳湾壹号T3栋2801室' },
    { id: 'addr002', name: '科技园总部大厦', address: '广东省深圳市南山区科技园南区A座' },
    { id: 'addr003', name: '前海金融中心', address: '广东省深圳市前海自贸区前海大道100号' },
  ]
  selectedAddress.value = addressList.value[0]
})

function handleAddressChange() {
  showAddressModal.value = true
}

function handleAddAddress() {
  showAddressModal.value = true
}

function handleSelectAddress(addr: any) {
  selectedAddress.value = addr
  showAddressModal.value = false
}

function handleAddNewAddress() {
  uni.showToast({ title: '自建地址功能开发中', icon: 'none' })
  showAddressModal.value = false
}

function handleBomSelect(bom: any) {
  if (selectedBom.value === bom.id) {
    selectedBom.value = ''
  } else {
    selectedBom.value = bom.id
  }
}

function handleViewAllBom() {
  uni.navigateTo({ url: '/pages/market/bom' })
}

function handleQtyPlus(item: any) {
  item.qty++
}

function handleQtyMinus(item: any) {
  if (item.qty > 1) {
    item.qty--
  }
}

function handleCartDelete(item: any) {
  uni.showModal({
    title: '删除商品',
    content: `确定删除"${item.name}"吗？`,
    success: (res) => {
      if (res.confirm) {
        const idx = cartItems.value.findIndex(i => i.id === item.id)
        if (idx > -1) {
          cartItems.value.splice(idx, 1)
        }
      }
    },
  })
}

function handleGoMarket() {
  uni.switchTab({ url: '/pages/market/index' })
}

function handleSubmit() {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择配送地址', icon: 'none' })
    return
  }
  if (cartItems.value.length === 0) {
    uni.showToast({ title: '请添加商品', icon: 'none' })
    return
  }
  uni.showLoading({ title: '提交中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '订单提交成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 140rpx;
}

.address-section {
  background-color: #fff;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d2129;
}

.section-more {
  font-size: 24rpx;
  color: #165dff;
}

.section-count {
  font-size: 24rpx;
  color: #86909c;
}

.address-card {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.address-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.address-info {
  flex: 1;
}

.address-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
}

.address-detail {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.address-arrow {
  font-size: 32rpx;
  color: #c9cdd4;
}

.add-address {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
}

.add-icon {
  font-size: 36rpx;
  color: #86909c;
  margin-right: 8rpx;
}

.add-text {
  font-size: 28rpx;
  color: #86909c;
}

.section {
  background-color: #fff;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.bom-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.bom-card {
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  padding: 20rpx;
  
  &:active {
    border-color: #165dff;
  }
}

.bom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bom-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d2129;
}

.bom-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  
  &.checked {
    background-color: #165dff;
    border-color: #165dff;
  }
}

.bom-desc {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 12rpx;
  display: block;
}

.bom-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  
  text {
    font-size: 24rpx;
  }
  
  .bom-count {
    color: #666;
  }
  
  .bom-price {
    color: #f53f3f;
    font-weight: 600;
  }
}

.bom-products {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.product-tag {
  font-size: 22rpx;
  color: #666;
  background-color: #f7f8fa;
  padding: 6rpx 12rpx;
  border-radius: 4rpx;
}

.more-tag {
  font-size: 22rpx;
  color: #165dff;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.cart-item {
  display: flex;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  position: relative;
}

.cart-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.cart-info {
  flex: 1;
  margin-left: 16rpx;
  display: flex;
  flex-direction: column;
}

.cart-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.cart-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
}

.cart-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.cart-price {
  font-size: 28rpx;
  color: #f53f3f;
  font-weight: 600;
}

.cart-qty {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 48rpx;
  height: 48rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666;
  border: 1rpx solid #d9d9d9;
}

.qty-value {
  min-width: 48rpx;
  text-align: center;
  font-size: 28rpx;
  color: #1d2129;
  margin: 0 12rpx;
}

.cart-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #86909c;
  margin-bottom: 24rpx;
}

.empty-btn {
  padding: 16rpx 48rpx;
  background-color: #165dff;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #fff;
}

.remark-input {
  width: 100%;
  height: 160rpx;
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #1d2129;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.total-section {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 28rpx;
  color: #666;
}

.total-price {
  display: flex;
  align-items: baseline;
  margin-left: 8rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #f53f3f;
}

.price-value {
  font-size: 40rpx;
  font-weight: 600;
  color: #f53f3f;
}

.submit-btn {
  padding: 20rpx 64rpx;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 40rpx;
  font-size: 30rpx;
  color: #fff;
  font-weight: 500;
  
  &.disabled {
    background: #d9d9d9;
  }
}

.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
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
  font-size: 32rpx;
  color: #86909c;
}

.address-list {
  height: calc(100% - 100rpx);
  padding: 24rpx 32rpx;
}

.address-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &.selected {
    border: 2rpx solid #165dff;
  }
}

.option-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  margin-right: 16rpx;
  
  &.checked {
    background-color: #165dff;
    border-color: #165dff;
  }
}

.option-info {
  flex: 1;
}

.option-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
}

.option-address {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.add-new-address {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
}
</style>