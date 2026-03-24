<template>
  <view class="page">
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'sale' }"
        @click="currentTab = 'sale'"
      >
        销售订单
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'purchase' }"
        @click="currentTab = 'purchase'"
      >
        采购订单
      </view>
    </view>

    <template v-if="currentTab === 'sale'">
      <view class="status-bar">
        <view 
          class="status-item" 
          :class="{ active: saleStatus === '' }"
          @click="saleStatus = ''"
        >
          全部
        </view>
        <view 
          class="status-item" 
          :class="{ active: saleStatus === 'toPay' }"
          @click="saleStatus = 'toPay'"
        >
          待付款
        </view>
        <view 
          class="status-item" 
          :class="{ active: saleStatus === 'toShip' }"
          @click="saleStatus = 'toShip'"
        >
          待发货
          <view class="badge" v-if="statusCount.toShip > 0">{{ statusCount.toShip }}</view>
        </view>
        <view 
          class="status-item" 
          :class="{ active: saleStatus === 'shipped' }"
          @click="saleStatus = 'shipped'"
        >
          已发货
        </view>
        <view 
          class="status-item" 
          :class="{ active: saleStatus === 'completed' }"
          @click="saleStatus = 'completed'"
        >
          已完成
        </view>
        <view 
          class="status-item" 
          :class="{ active: saleStatus === 'afterSale' }"
          @click="saleStatus = 'afterSale'"
        >
          售后
        </view>
      </view>

      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="saleKeyword" 
          placeholder="搜索订单号/客户名称" 
          class="search-input"
        />
      </view>

      <view class="order-list">
        <view class="order-item" v-for="item in filteredSaleOrders" :key="item.id" @click="handleOrderDetail(item, 'sale')">
          <view class="order-header">
            <view class="order-left">
              <text class="order-no">{{ item.orderNo }}</text>
              <text class="order-time">{{ item.createTime }}</text>
            </view>
            <text class="order-status" :style="{ color: getSaleStatusColor(item.status) }">{{ item.statusText }}</text>
          </view>
          <view class="customer-info">
            <text class="customer-label">客户:</text>
            <text class="customer-name">{{ item.customerName }}</text>
            <text class="customer-phone">{{ item.customerPhone }}</text>
          </view>
          <view class="order-products">
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
          <view class="order-footer">
            <view class="order-amount">
              <text class="amount-label">共{{ item.totalQty }}件</text>
              <text class="amount-text">合计: <text class="total-price">¥{{ item.totalAmount }}</text></text>
            </view>
          </view>
          <view class="order-actions">
            <view class="action-btn" v-if="item.status === 'toShip'" @click.stop="handleShip(item)">发货</view>
            <view class="action-btn" v-if="item.status === 'toShip'" @click.stop="handlePrint(item)">打印</view>
            <view class="action-btn primary" v-if="item.status === 'shipped'" @click.stop="handleTrack(item)">查看物流</view>
            <view class="action-btn" v-if="item.status === 'completed'" @click.stop="handleInvoice(item)">开票</view>
            <view class="action-btn" v-if="item.status === 'afterSale'" @click.stop="handleAfterSale(item)">处理</view>
          </view>
        </view>
      </view>
    </template>

    <template v-if="currentTab === 'purchase'">
      <view class="status-bar">
        <view 
          class="status-item" 
          :class="{ active: purchaseStatus === '' }"
          @click="purchaseStatus = ''"
        >
          全部
        </view>
        <view 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toConfirm' }"
          @click="purchaseStatus = 'toConfirm'"
        >
          待确认
          <view class="badge" v-if="statusCount.toConfirm > 0">{{ statusCount.toConfirm }}</view>
        </view>
        <view 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toPay' }"
          @click="purchaseStatus = 'toPay'"
        >
          待付款
        </view>
        <view 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toShip' }"
          @click="purchaseStatus = 'toShip'"
        >
          待发货
        </view>
        <view 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toReceive' }"
          @click="purchaseStatus = 'toReceive'"
        >
          待入库
          <view class="badge" v-if="statusCount.toReceive > 0">{{ statusCount.toReceive }}</view>
        </view>
        <view 
          class="status-item" 
          :class="{ active: purchaseStatus === 'completed' }"
          @click="purchaseStatus = 'completed'"
        >
          已完成
        </view>
      </view>

      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="purchaseKeyword" 
          placeholder="搜索订单号/供应商名称" 
          class="search-input"
        />
      </view>

      <view class="order-list">
        <view class="order-item" v-for="item in filteredPurchaseOrders" :key="item.id" @click="handleOrderDetail(item, 'purchase')">
          <view class="order-header">
            <view class="order-left">
              <text class="order-no">{{ item.orderNo }}</text>
              <text class="order-time">{{ item.createTime }}</text>
            </view>
            <text class="order-status" :style="{ color: getPurchaseStatusColor(item.status) }">{{ item.statusText }}</text>
          </view>
          <view class="supplier-info">
            <text class="supplier-label">供应商:</text>
            <text class="supplier-name">{{ item.supplierName }}</text>
            <view class="supplier-tags">
              <text class="tag" v-if="item.isPrimary">主供</text>
            </view>
          </view>
          <view class="order-products">
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
          <view class="order-footer">
            <view class="order-amount">
              <text class="amount-label">共{{ item.totalQty }}件</text>
              <text class="amount-text">合计: <text class="total-price">¥{{ item.totalAmount }}</text></text>
            </view>
          </view>
          <view class="order-actions">
            <view class="action-btn" v-if="item.status === 'toConfirm'" @click.stop="handleCancel(item)">取消</view>
            <view class="action-btn primary" v-if="item.status === 'toConfirm'" @click.stop="handleConfirm(item)">确认</view>
            <view class="action-btn primary" v-if="item.status === 'toPay'" @click.stop="handlePay(item)">付款</view>
            <view class="action-btn" v-if="item.status === 'toReceive'" @click.stop="handleTrack(item)">物流</view>
            <view class="action-btn primary" v-if="item.status === 'toReceive'" @click.stop="handleReceive(item)">确认入库</view>
          </view>
        </view>
      </view>
    </template>

    <view class="quick-actions">
      <view class="quick-item" @click="handleShipPage">
        <text class="quick-icon">📦</text>
        <text class="quick-text">发货处理</text>
      </view>
      <view class="quick-item" @click="handleReceivePage">
        <text class="quick-icon">📥</text>
        <text class="quick-text">收货入库</text>
      </view>
      <view class="quick-item" @click="handleScanShip">
        <text class="quick-icon">📷</text>
        <text class="quick-text">扫码发货</text>
      </view>
      <view class="quick-item" @click="handleScanReceive">
        <text class="quick-icon">📷</text>
        <text class="quick-text">扫码入库</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref('sale')
const saleStatus = ref('')
const purchaseStatus = ref('')
const saleKeyword = ref('')
const purchaseKeyword = ref('')

const statusCount = ref({
  toShip: 12,
  toConfirm: 5,
  toReceive: 3,
})

const saleOrders = ref([
  {
    id: 'so001',
    orderNo: 'SO2024010012',
    status: 'toShip',
    statusText: '待发货',
    createTime: '2024-01-15 14:30',
    customerName: '深圳建设集团',
    customerPhone: '138****8888',
    products: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=1', price: 450, qty: 10 },
    ],
    totalQty: 10,
    totalAmount: '4,500.00',
  },
  {
    id: 'so002',
    orderNo: 'SO2024010011',
    status: 'shipped',
    statusText: '已发货',
    createTime: '2024-01-15 10:20',
    customerName: '广州建筑公司',
    customerPhone: '139****9999',
    products: [
      { id: 'p2', name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://picsum.photos/100/100?random=2', price: 4200, qty: 5 },
    ],
    totalQty: 5,
    totalAmount: '21,000.00',
  },
  {
    id: 'so003',
    orderNo: 'SO2024010010',
    status: 'completed',
    statusText: '已完成',
    createTime: '2024-01-14 16:45',
    customerName: '东莞工程公司',
    customerPhone: '137****7777',
    products: [
      { id: 'p3', name: '商品混凝土 C30', spec: 'C30', image: 'https://picsum.photos/100/100?random=3', price: 420, qty: 50 },
    ],
    totalQty: 50,
    totalAmount: '21,000.00',
  },
  {
    id: 'so004',
    orderNo: 'SO2024010009',
    status: 'afterSale',
    statusText: '售后中',
    createTime: '2024-01-13 11:30',
    customerName: '佛山建材市场',
    customerPhone: '136****6666',
    products: [
      { id: 'p4', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=4', price: 95, qty: 100 },
    ],
    totalQty: 100,
    totalAmount: '9,500.00',
  },
])

const purchaseOrders = ref([
  {
    id: 'po001',
    orderNo: 'PO2024010001',
    status: 'toConfirm',
    statusText: '待确认',
    createTime: '2024-01-15 14:30',
    supplierName: '华新水泥供应商',
    isPrimary: true,
    products: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=5', price: 420, qty: 20 },
    ],
    totalQty: 20,
    totalAmount: '8,400.00',
  },
  {
    id: 'po002',
    orderNo: 'PO2024010002',
    status: 'toReceive',
    statusText: '待入库',
    createTime: '2024-01-14 10:20',
    supplierName: '宝钢供应商',
    isPrimary: false,
    products: [
      { id: 'p2', name: '螺纹钢 HRB400 20mm', spec: '20mm', image: 'https://picsum.photos/100/100?random=6', price: 3950, qty: 10 },
    ],
    totalQty: 10,
    totalAmount: '39,500.00',
  },
  {
    id: 'po003',
    orderNo: 'PO2024010003',
    status: 'completed',
    statusText: '已完成',
    createTime: '2024-01-12 16:45',
    supplierName: '南方建材供应商',
    isPrimary: false,
    products: [
      { id: 'p3', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=7', price: 80, qty: 100 },
    ],
    totalQty: 100,
    totalAmount: '8,000.00',
  },
])

const filteredSaleOrders = computed(() => {
  let result = saleOrders.value
  
  if (saleKeyword.value) {
    const kw = saleKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(kw) || 
      o.customerName.toLowerCase().includes(kw)
    )
  }
  
  if (saleStatus.value) {
    result = result.filter(o => o.status === saleStatus.value)
  }
  
  return result
})

const filteredPurchaseOrders = computed(() => {
  let result = purchaseOrders.value
  
  if (purchaseKeyword.value) {
    const kw = purchaseKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(kw) || 
      o.supplierName.toLowerCase().includes(kw)
    )
  }
  
  if (purchaseStatus.value) {
    result = result.filter(o => o.status === purchaseStatus.value)
  }
  
  return result
})

function getSaleStatusColor(status: string) {
  const colors: Record<string, string> = {
    toPay: '#722ed1',
    toShip: '#ff7d00',
    shipped: '#165dff',
    completed: '#00b42a',
    afterSale: '#f53f3f',
  }
  return colors[status] || '#666'
}

function getPurchaseStatusColor(status: string) {
  const colors: Record<string, string> = {
    toConfirm: '#ff7d00',
    toPay: '#722ed1',
    toShip: '#165dff',
    toReceive: '#165dff',
    completed: '#00b42a',
  }
  return colors[status] || '#666'
}

function handleOrderDetail(item: any, type: string) {
  uni.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=${type}` })
}

function handleShip(item: any) {
  uni.navigateTo({ url: `/pages/order/ship?id=${item.id}` })
}

function handlePrint(item: any) {
  uni.showToast({ title: '打印发货单', icon: 'none' })
}

function handleTrack(item: any) {
  uni.showToast({ title: '查看物流', icon: 'none' })
}

function handleInvoice(item: any) {
  uni.navigateTo({ url: '/pages/mine/invoice' })
}

function handleAfterSale(item: any) {
  uni.showToast({ title: '处理售后', icon: 'none' })
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

function handlePay(item: any) {
  uni.showModal({
    title: '支付采购款',
    content: `确定支付采购款 ¥${item.totalAmount} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '支付成功', icon: 'success' })
      }
    },
  })
}

function handleReceive(item: any) {
  uni.navigateTo({ url: `/pages/order/receive?id=${item.id}` })
}

function handleShipPage() {
  uni.navigateTo({ url: '/pages/order/ship' })
}

function handleReceivePage() {
  uni.navigateTo({ url: '/pages/order/receive' })
}

function handleScanShip() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '扫码发货', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}

function handleScanReceive() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '扫码入库', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 30rpx;
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

.status-bar {
  display: flex;
  padding: 20rpx 16rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  overflow-x: auto;
}

.status-item {
  flex-shrink: 0;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  padding: 8rpx 20rpx;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 500;
    background-color: #e8f3ff;
    border-radius: 20rpx;
  }
  
  .badge {
    position: absolute;
    top: -4rpx;
    right: 4rpx;
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

.search-bar {
  display: flex;
  align-items: center;
  margin: 20rpx 32rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background-color: #fff;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.order-list {
  padding: 0 32rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.order-left {
  display: flex;
  flex-direction: column;
}

.order-no {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.order-time {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.order-status {
  font-size: 26rpx;
  font-weight: 500;
}

.customer-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 12rpx 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  
  .customer-label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .customer-name {
    font-size: 24rpx;
    color: #1d2129;
    margin-left: 8rpx;
  }
  
  .customer-phone {
    font-size: 24rpx;
    color: #86909c;
    margin-left: 16rpx;
  }
}

.supplier-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 12rpx 16rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  
  .supplier-label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .supplier-name {
    font-size: 24rpx;
    color: #1d2129;
    margin-left: 8rpx;
  }
  
  .supplier-tags {
    margin-left: 12rpx;
    
    .tag {
      font-size: 20rpx;
      color: #165dff;
      background-color: #e8f3ff;
      padding: 2rpx 8rpx;
      border-radius: 4rpx;
    }
  }
}

.order-products {
  margin-bottom: 16rpx;
}

.product-row {
  display: flex;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 16rpx;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.product-right {
  text-align: right;
}

.product-price {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-qty {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.order-footer {
  padding-top: 16rpx;
  border-top: 1rpx solid #f7f8fa;
}

.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 24rpx;
  color: #86909c;
}

.amount-text {
  font-size: 26rpx;
  color: #666;
}

.total-price {
  color: #f53f3f;
  font-weight: 600;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 16rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 32rpx;
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}

.quick-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 0;
}

.quick-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.quick-text {
  font-size: 22rpx;
  color: #1d2129;
}
</style>
