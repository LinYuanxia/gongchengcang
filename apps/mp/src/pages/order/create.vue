<template>
  <view class="page">
    <view class="address-section" @click="handleSelectAddress">
      <view class="address-content" v-if="selectedAddress">
        <view class="address-header">
          <text class="address-name">{{ selectedAddress.name }}</text>
          <text class="address-phone">{{ selectedAddress.phone }}</text>
          <text class="default-tag" v-if="selectedAddress.isDefault">默认</text>
        </view>
        <text class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</text>
      </view>
      <view class="address-empty" v-else>
        <text class="empty-text">请选择收货地址</text>
      </view>
      <text class="arrow">›</text>
    </view>
    
    <view class="product-section">
      <view class="supplier-group" v-for="group in groupedItems" :key="group.supplierId">
        <view class="group-header">
          <text class="supplier-icon">🏭</text>
          <text class="supplier-name">{{ group.supplierName }}</text>
          <text class="delivery-info">预计{{ group.deliveryDays }}天送达</text>
        </view>
        
        <view class="product-item" v-for="item in group.items" :key="item.productId">
          <image :src="item.image" mode="aspectFill" class="product-image" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-spec">{{ item.spec }}</text>
            <view class="product-bottom">
              <view class="product-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ item.price }}</text>
              </view>
              <text class="product-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
        
        <view class="group-footer">
          <view class="remark-row" @click="handleRemark(group.supplierId)">
            <text class="remark-label">订单备注</text>
            <view class="remark-content">
              <text class="remark-text" :class="{ placeholder: !group.remark }">
                {{ group.remark || '选填，请先与供应商协商一致' }}
              </text>
              <text class="arrow">›</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">商品金额</text>
        <text class="info-value">¥{{ productTotal }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">运费</text>
        <text class="info-value">¥{{ freight }}</text>
      </view>
    </view>
    
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ totalPrice }}</text>
      </view>
      <view class="submit-btn" @click="handleSubmit">
        提交订单
      </view>
    </view>
    
    <view class="remark-modal" v-if="showRemarkModal" @click="showRemarkModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">订单备注</text>
          <text class="modal-close" @click="showRemarkModal = false">✕</text>
        </view>
        <view class="modal-body">
          <textarea 
            v-model="remarkInput" 
            placeholder="请输入备注信息" 
            class="remark-input"
            :maxlength="200"
          />
        </view>
        <view class="modal-footer">
          <view class="btn-confirm" @click="handleConfirmRemark">确定</view>
        </view>
      </view>
    </view>
    
    <view class="address-modal" v-if="showAddressModal" @click="showAddressModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择收货地址</text>
          <text class="modal-close" @click="showAddressModal = false">✕</text>
        </view>
        <view class="address-list">
          <view 
            class="address-item" 
            :class="{ active: selectedAddress?.id === addr.id }"
            v-for="addr in addressList" 
            :key="addr.id"
            @click="handleChooseAddress(addr)"
          >
            <view class="address-radio">
              <text v-if="selectedAddress?.id === addr.id">✓</text>
            </view>
            <view class="address-info">
              <view class="address-header">
                <text class="address-name">{{ addr.name }}</text>
                <text class="address-phone">{{ addr.phone }}</text>
                <text class="default-tag" v-if="addr.isDefault">默认</text>
              </view>
              <text class="address-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-add" @click="handleAddAddress">新增地址</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface OrderItem {
  productId: string
  supplierId: string
  supplierName: string
  name: string
  spec: string
  price: number
  quantity: number
  image: string
  deliveryDays: number
}

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const orderItems = ref<OrderItem[]>([])
const selectedAddress = ref<Address | null>(null)
const showRemarkModal = ref(false)
const showAddressModal = ref(false)
const currentSupplierId = ref('')
const remarkInput = ref('')
const supplierRemarks = ref<Record<string, string>>({})

const addressList = ref<Address[]>([
  {
    id: 'a1',
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区A栋101',
    isDefault: true,
  },
  {
    id: 'a2',
    name: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '深圳市',
    district: '福田区',
    detail: '华强北路赛格广场',
    isDefault: false,
  },
])

const groupedItems = computed(() => {
  const groups: Record<string, { supplierId: string; supplierName: string; deliveryDays: number; items: OrderItem[]; remark: string }> = {}
  
  orderItems.value.forEach(item => {
    if (!groups[item.supplierId]) {
      groups[item.supplierId] = {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        deliveryDays: item.deliveryDays,
        items: [],
        remark: supplierRemarks.value[item.supplierId] || '',
      }
    }
    groups[item.supplierId].items.push(item)
  })
  
  return Object.values(groups)
})

const productTotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

const freight = computed(() => {
  return '0.00'
})

const totalPrice = computed(() => {
  return (parseFloat(productTotal.value) + parseFloat(freight.value)).toFixed(2)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const itemsParam = currentPage?.options?.items
  
  if (itemsParam) {
    try {
      orderItems.value = JSON.parse(decodeURIComponent(itemsParam))
    } catch (e) {
      console.error('解析订单数据失败', e)
    }
  } else {
    const productId = currentPage?.options?.productId
    const supplierId = currentPage?.options?.supplierId
    const quantity = currentPage?.options?.quantity
    
    if (productId && supplierId && quantity) {
      orderItems.value = [{
        productId,
        supplierId,
        supplierName: '华新水泥供应商',
        name: '水泥 P.O 42.5',
        spec: '50kg/袋',
        price: 420,
        quantity: parseInt(quantity),
        image: 'https://picsum.photos/200/200?random=1',
        deliveryDays: 2,
      }]
    }
  }
  
  selectedAddress.value = addressList.value.find(a => a.isDefault) || addressList.value[0]
})

function handleSelectAddress() {
  showAddressModal.value = true
}

function handleChooseAddress(addr: Address) {
  selectedAddress.value = addr
  showAddressModal.value = false
}

function handleAddAddress() {
  uni.showToast({ title: '新增地址功能开发中', icon: 'none' })
}

function handleRemark(supplierId: string) {
  currentSupplierId.value = supplierId
  remarkInput.value = supplierRemarks.value[supplierId] || ''
  showRemarkModal.value = true
}

function handleConfirmRemark() {
  supplierRemarks.value[currentSupplierId.value] = remarkInput.value
  showRemarkModal.value = false
}

function handleSubmit() {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  
  if (orderItems.value.length === 0) {
    uni.showToast({ title: '订单数据异常', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '确认提交',
    content: `订单总金额：¥${totalPrice.value}，确认提交？`,
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '提交中...' })
        
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({ title: '提交成功', icon: 'success' })
          
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/order/index' })
          }, 1500)
        }, 1000)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.address-section {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background-color: #fff;
  margin-bottom: 24rpx;
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
  color: #1d2129;
  margin-right: 16rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #86909c;
}

.default-tag {
  font-size: 20rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-left: 16rpx;
}

.address-detail {
  font-size: 26rpx;
  color: #4e5969;
}

.address-empty {
  flex: 1;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}

.arrow {
  font-size: 32rpx;
  color: #c9cdd4;
  margin-left: 16rpx;
}

.product-section {
  margin-bottom: 24rpx;
}

.supplier-group {
  background-color: #fff;
  margin-bottom: 24rpx;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.supplier-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.supplier-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #1d2129;
}

.delivery-info {
  font-size: 22rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.product-item {
  display: flex;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
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
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
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
  font-size: 32rpx;
  font-weight: 600;
  color: #f53f3f;
}

.product-quantity {
  font-size: 26rpx;
  color: #86909c;
}

.group-footer {
  padding: 24rpx 32rpx;
}

.remark-row {
  display: flex;
  align-items: center;
}

.remark-label {
  font-size: 26rpx;
  color: #86909c;
  width: 140rpx;
}

.remark-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.remark-text {
  font-size: 26rpx;
  color: #1d2129;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &.placeholder {
    color: #c9cdd4;
  }
}

.info-section {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.info-label {
  font-size: 28rpx;
  color: #4e5969;
}

.info-value {
  font-size: 28rpx;
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
  justify-content: flex-end;
  padding: 0 32rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.total-info {
  margin-right: 32rpx;
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
  padding: 16rpx 64rpx;
  background-color: #165dff;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.remark-modal, .address-modal {
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

.remark-input {
  width: 100%;
  height: 200rpx;
  padding: 24rpx;
  font-size: 28rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  box-sizing: border-box;
}

.modal-footer {
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-confirm, .btn-add {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  background-color: #165dff;
  border-radius: 44rpx;
}

.address-list {
  padding: 24rpx 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.address-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &.active {
    background-color: #e8f3ff;
    
    .address-radio {
      background-color: #165dff;
      border-color: #165dff;
      color: #fff;
    }
  }
}

.address-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 24rpx;
  flex-shrink: 0;
}

.address-info {
  flex: 1;
}
</style>
