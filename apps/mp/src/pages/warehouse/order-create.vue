<template>
  <view class="page">
    <view class="address-section" @click="handleSelectAddress">
      <view class="address-content" v-if="selectedAddress">
        <view class="address-header">
          <text class="address-name">{{ selectedAddress.name }}</text>
          <text class="address-phone">{{ selectedAddress.phone }}</text>
        </view>
        <text class="address-detail">{{ selectedAddress.address }}</text>
      </view>
      <view class="address-empty" v-else>
        <text>请选择收货地址</text>
      </view>
      <text class="arrow">›</text>
    </view>
    
    <view class="product-section">
      <view class="section-header">
        <text class="section-title">商品信息</text>
        <text class="product-count">共 {{ totalQuantity }} 件</text>
      </view>
      
      <view class="product-list">
        <view class="product-item" v-for="item in orderItems" :key="item.skuId">
          <image :src="item.image" mode="aspectFill" class="product-image" />
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <text class="product-spec">{{ item.specName }}</text>
            <view class="product-bottom">
              <text class="product-price">¥{{ item.salePrice }}</text>
              <text class="product-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">商品金额</text>
        <text class="info-value">¥{{ productAmount }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">运费</text>
        <text class="info-value">¥{{ freight }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">优惠</text>
        <text class="info-value discount">-¥{{ discount }}</text>
      </view>
    </view>
    
    <view class="remark-section">
      <text class="remark-label">订单备注</text>
      <textarea 
        v-model="remark" 
        placeholder="请输入订单备注（选填）" 
        class="remark-input"
        :maxlength="200"
      />
    </view>
    
    <view class="bottom-bar">
      <view class="amount-info">
        <text class="amount-label">合计：</text>
        <text class="amount-value">¥{{ totalAmount }}</text>
      </view>
      <view class="submit-btn" @click="handleSubmit">
        <text>提交订单</text>
      </view>
    </view>
    
    <view class="address-modal" v-if="showAddressModal" @click="showAddressModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择收货地址</text>
          <text class="modal-close" @click="showAddressModal = false">✕</text>
        </view>
        
        <scroll-view scroll-y class="address-list">
          <view 
            class="address-item" 
            v-for="addr in addressList" 
            :key="addr.id"
            :class="{ active: selectedAddress?.id === addr.id }"
            @click="handleConfirmAddress(addr)"
          >
            <view class="address-radio">
              <text v-if="selectedAddress?.id === addr.id">✓</text>
            </view>
            <view class="address-info">
              <view class="address-top">
                <text class="name">{{ addr.name }}</text>
                <text class="phone">{{ addr.phone }}</text>
                <text class="default-tag" v-if="addr.isDefault">默认</text>
              </view>
              <text class="address-text">{{ addr.address }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="add-address-btn" @click="handleAddAddress">
            <text>+ 新增收货地址</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const productId = ref('')
const skuIds = ref('')
const quantities = ref('')
const remark = ref('')
const showAddressModal = ref(false)
const selectedAddress = ref<any>(null)

const addressList = ref([
  { id: 'a1', name: '张三', phone: '13800138001', address: '广东省深圳市南山区科技园南区深圳湾科技生态园10栋B座', isDefault: true },
  { id: 'a2', name: '李四', phone: '13800138002', address: '广东省深圳市福田区CBD中心区平安金融中心', isDefault: false },
  { id: 'a3', name: '王五', phone: '13800138003', address: '广东省深圳市宝安区机场附近领航城', isDefault: false },
])

const orderItems = ref([
  { 
    skuId: 'sku1', 
    productName: '水泥 P.O 普通硅酸盐水泥', 
    specName: 'P.O 42.5 散装',
    image: 'https://picsum.photos/100/100?random=1',
    salePrice: 420,
    quantity: 10,
  },
  { 
    skuId: 'sku2', 
    productName: '水泥 P.O 普通硅酸盐水泥', 
    specName: 'P.O 42.5 袋装50kg',
    image: 'https://picsum.photos/100/100?random=2',
    salePrice: 450,
    quantity: 20,
  },
])

const totalQuantity = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const productAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.salePrice * item.quantity, 0).toFixed(2)
})

const freight = ref(0)
const discount = ref(0)

const totalAmount = computed(() => {
  return (parseFloat(productAmount.value) + freight.value - discount.value).toFixed(2)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  productId.value = currentPage?.options?.productId || ''
  skuIds.value = currentPage?.options?.skuIds || ''
  quantities.value = currentPage?.options?.quantities || ''
  
  if (addressList.value.length > 0) {
    const defaultAddr = addressList.value.find(a => a.isDefault)
    selectedAddress.value = defaultAddr || addressList.value[0]
  }
})

function handleSelectAddress() {
  showAddressModal.value = true
}

function handleConfirmAddress(addr: any) {
  selectedAddress.value = addr
  showAddressModal.value = false
}

function handleAddAddress() {
  uni.showToast({ title: '新增地址功能开发中', icon: 'none' })
}

function handleSubmit() {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '确认提交',
    content: `订单金额：¥${totalAmount.value}，确认提交？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '订单提交成功', icon: 'success' })
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/warehouse/order-list' })
        }, 1500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.address-section {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #fff;
  margin-bottom: 16rpx;
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.address-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-right: 24rpx;
}

.address-phone {
  font-size: 26rpx;
  color: #666;
}

.address-detail {
  font-size: 26rpx;
  color: #666;
}

.address-empty {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}

.arrow {
  font-size: 32rpx;
  color: #ccc;
  margin-left: 16rpx;
}

.product-section {
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

.product-count {
  font-size: 24rpx;
  color: #999;
}

.product-list {
  padding: 0 24rpx;
}

.product-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.product-spec {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 600;
}

.product-quantity {
  font-size: 24rpx;
  color: #999;
}

.info-section {
  background-color: #fff;
  margin-bottom: 16rpx;
  padding: 0 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: #666;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  
  &.discount {
    color: #52c41a;
  }
}

.remark-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.remark-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.remark-input {
  width: 100%;
  height: 120rpx;
  padding: 16rpx;
  font-size: 26rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
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
  justify-content: space-between;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.amount-info {
  display: flex;
  align-items: baseline;
}

.amount-label {
  font-size: 26rpx;
  color: #666;
}

.amount-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.submit-btn {
  padding: 0 60rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  background: linear-gradient(90deg, #ff6b00, #ff4d4f);
  border-radius: 36rpx;
}

.address-modal {
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
  max-height: 70vh;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 32rpx;
  color: #999;
}

.address-list {
  flex: 1;
  padding: 24rpx;
  max-height: 50vh;
}

.address-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &.active {
    border-color: #ff6b00;
    background-color: #fff5eb;
    
    .address-radio {
      background-color: #ff6b00;
      border-color: #ff6b00;
      color: #fff;
    }
  }
}

.address-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  font-size: 24rpx;
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-right: 16rpx;
}

.phone {
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
}

.default-tag {
  font-size: 20rpx;
  color: #ff6b00;
  background-color: #fff5eb;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.address-text {
  font-size: 24rpx;
  color: #666;
}

.modal-footer {
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.add-address-btn {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #ff6b00;
  background-color: #fff5eb;
  border-radius: 40rpx;
}
</style>
