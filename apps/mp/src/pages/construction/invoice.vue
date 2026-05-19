<template>
  <view class="page">
    <view class="header-bar">
      <text class="header-title">发票管理</text>
      <view class="apply-btn" @click="handleShowApply">申请开票</view>
    </view>

    <view class="status-bar">
      <view
        class="status-item"
        :class="{ active: activeStatus === '' }"
        @click="activeStatus = ''"
      >全部</view>
      <view
        class="status-item"
        :class="{ active: activeStatus === 'pending' }"
        @click="activeStatus = 'pending'"
      >待开票</view>
      <view
        class="status-item"
        :class="{ active: activeStatus === 'issued' }"
        @click="activeStatus = 'issued'"
      >已开票</view>
      <view
        class="status-item"
        :class="{ active: activeStatus === 'voided' }"
        @click="activeStatus = 'voided'"
      >已作废</view>
    </view>

    <view class="invoice-list">
      <view class="invoice-item" v-for="item in filteredList" :key="item.id">
        <view class="invoice-header">
          <view class="invoice-left">
            <text class="invoice-order">{{ item.orderNo }}</text>
            <text class="invoice-time">{{ item.createTime }}</text>
          </view>
          <text class="invoice-status" :class="item.status">{{ item.statusText }}</text>
        </view>
        <view class="invoice-body">
          <view class="invoice-row">
            <text class="row-label">供应商名称</text>
            <text class="row-value">{{ item.supplierName }}</text>
          </view>
          <view class="invoice-row">
            <text class="row-label">发票金额</text>
            <text class="row-value price">¥{{ item.amount.toLocaleString() }}</text>
          </view>
          <view class="invoice-row">
            <text class="row-label">票据类型</text>
            <text class="row-value">{{ item.taxTypeText }}</text>
          </view>
          <view class="invoice-row" v-if="item.invoiceNo">
            <text class="row-label">发票号码</text>
            <text class="row-value">{{ item.invoiceNo }}</text>
          </view>
        </view>
        <view class="invoice-footer">
          <view class="invoice-actions">
            <view class="action-btn" @click="handleViewInvoice(item)">查看发票</view>
            <view class="action-btn" @click="handleViewOrder(item)">查看订单</view>
            <view class="action-btn" v-if="item.status === 'issued'" @click="handleDownload(item)">下载</view>
          </view>
        </view>
      </view>
      <view class="empty" v-if="filteredList.length === 0">
        <text class="empty-icon">📄</text>
        <text class="empty-text">暂无发票数据</text>
      </view>
    </view>

    <view class="overlay" v-if="showApplySheet" @click="handleCloseApply">
      <view class="sheet" @click.stop>
        <view class="sheet-header">
          <text class="sheet-title">申请开票</text>
          <text class="sheet-close" @click="handleCloseApply">✕</text>
        </view>
        <view class="sheet-body">
          <view class="form-item">
            <text class="form-label">选择已完成销售订单</text>
          </view>
          <scroll-view class="order-list" scroll-y>
            <view
              class="order-item"
              v-for="order in availableOrders"
              :key="order.id"
              :class="{ selected: selectedOrderId === order.id }"
              @click="selectedOrderId = order.id"
            >
              <view class="order-top">
                <text class="order-no">{{ order.orderNo }}</text>
                <view class="order-check" :class="{ checked: selectedOrderId === order.id }">
                  <text v-if="selectedOrderId === order.id">✓</text>
                </view>
              </view>
              <view class="order-info">
                <text class="order-label">供应商：{{ order.supplierName }}</text>
              </view>
              <view class="order-amounts">
                <text class="order-amount">订单金额：¥{{ order.totalAmount.toLocaleString() }}</text>
                <text class="order-available">可开票：<text class="amount-highlight">¥{{ order.availableAmount.toLocaleString() }}</text></text>
              </view>
              <view class="order-goods">
                <text class="goods-label">商品明细：</text>
                <text class="goods-list">{{ order.items.map(i => i.productName + '×' + i.quantity).join('、') }}</text>
              </view>
            </view>
          </scroll-view>
          <view class="form-item" v-if="selectedOrderId">
            <text class="form-label">可开票金额</text>
            <text class="form-value highlight">¥{{ selectedOrder?.availableAmount.toLocaleString() }}</text>
          </view>
          <view class="form-item">
            <text class="form-label">票据类型</text>
            <view class="radio-group">
              <view
                class="radio-item"
                :class="{ active: applyForm.taxType === 'special' }"
                @click="applyForm.taxType = 'special'"
              >增值税专用发票</view>
              <view
                class="radio-item"
                :class="{ active: applyForm.taxType === 'general' }"
                @click="applyForm.taxType = 'general'"
              >增值税普通发票</view>
            </view>
          </view>
        </view>
        <view class="sheet-footer">
          <view class="btn-cancel" @click="handleCloseApply">取消</view>
          <view class="btn-submit" :class="{ disabled: !canSubmit }" @click="handleSubmitApply">提交申请</view>
        </view>
      </view>
    </view>

    <view class="overlay" v-if="showDetail" @click="handleCloseDetail">
      <view class="sheet detail-sheet" @click.stop>
        <view class="sheet-header">
          <text class="sheet-title">发票详情</text>
          <text class="sheet-close" @click="handleCloseDetail">✕</text>
        </view>
        <view class="sheet-body">
          <view class="detail-image" v-if="detailData?.invoiceImage">
            <image :src="detailData.invoiceImage" mode="widthFix" />
          </view>
          <view class="detail-row">
            <text class="detail-label">订单编号</text>
            <text class="detail-value">{{ detailData?.orderNo }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">发票号码</text>
            <text class="detail-value">{{ detailData?.invoiceNo || '-' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">供应商名称</text>
            <text class="detail-value">{{ detailData?.supplierName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">发票金额</text>
            <text class="detail-value price">¥{{ detailData?.amount.toLocaleString() }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">票据类型</text>
            <text class="detail-value">{{ detailData?.taxTypeText }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">开票状态</text>
            <text class="detail-value">{{ detailData?.statusText }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">创建时间</text>
            <text class="detail-value">{{ detailData?.createTime }}</text>
          </view>
          <view class="detail-goods" v-if="detailData?.orderItems?.length">
            <text class="detail-label">商品明细</text>
            <view class="goods-table">
              <view class="goods-th">
                <text class="goods-col name">商品名称</text>
                <text class="goods-col qty">数量</text>
                <text class="goods-col price">单价</text>
                <text class="goods-col amount">金额</text>
              </view>
              <view class="goods-tr" v-for="(g, gi) in detailData.orderItems" :key="gi">
                <text class="goods-col name">{{ g.productName }}</text>
                <text class="goods-col qty">{{ g.quantity }}{{ g.unit }}</text>
                <text class="goods-col price">¥{{ g.unitPrice }}</text>
                <text class="goods-col amount">¥{{ g.amount.toLocaleString() }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="sheet-footer">
          <view class="btn-cancel" @click="handleCloseDetail">关闭</view>
          <view class="btn-submit" v-if="detailData?.status === 'issued'" @click="handleDownload(detailData)">下载发票</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface OrderItem {
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

interface SalesOrder {
  id: string
  orderNo: string
  supplierName: string
  totalAmount: number
  invoicedAmount: number
  availableAmount: number
  createTime: string
  items: OrderItem[]
}

interface InvoiceRecord {
  id: string
  orderNo: string
  invoiceNo: string
  supplierName: string
  amount: number
  taxType: string
  taxTypeText: string
  status: 'pending' | 'issued' | 'voided'
  statusText: string
  createTime: string
  invoiceImage?: string
  orderItems?: OrderItem[]
}

const activeStatus = ref('')
const showApplySheet = ref(false)
const showDetail = ref(false)
const selectedOrderId = ref('')
const detailData = ref<InvoiceRecord | null>(null)

const applyForm = ref({
  taxType: 'special',
})

const availableOrders = ref<SalesOrder[]>([
  {
    id: 'so1',
    orderNo: 'SO202401150001',
    supplierName: '华东工程仓',
    totalAmount: 560000,
    invoicedAmount: 0,
    availableAmount: 560000,
    createTime: '2024-01-15 10:00:00',
    items: [
      { productName: '螺纹钢 HRB400E Φ25', quantity: 80, unit: '吨', unitPrice: 4850, amount: 388000 },
      { productName: '盘螺 HRB400E Φ8', quantity: 40, unit: '吨', unitPrice: 3300, amount: 132000 },
      { productName: '线材 HPB300 Φ10', quantity: 10, unit: '吨', unitPrice: 4000, amount: 40000 },
    ],
  },
  {
    id: 'so2',
    orderNo: 'SO202401160001',
    supplierName: '华东工程仓',
    totalAmount: 780000,
    invoicedAmount: 200000,
    availableAmount: 580000,
    createTime: '2024-01-16 14:00:00',
    items: [
      { productName: '水泥 PO42.5', quantity: 500, unit: '吨', unitPrice: 480, amount: 240000 },
      { productName: '中砂', quantity: 300, unit: '吨', unitPrice: 120, amount: 36000 },
      { productName: '碎石 5-25mm', quantity: 400, unit: '吨', unitPrice: 95, amount: 38000 },
      { productName: '粉煤灰 Ⅱ级', quantity: 100, unit: '吨', unitPrice: 200, amount: 20000 },
    ],
  },
  {
    id: 'so3',
    orderNo: 'SO202401170001',
    supplierName: '华南工程仓',
    totalAmount: 320000,
    invoicedAmount: 0,
    availableAmount: 320000,
    createTime: '2024-01-17 09:00:00',
    items: [
      { productName: '镀锌钢管 DN100', quantity: 200, unit: '根', unitPrice: 850, amount: 170000 },
      { productName: '镀锌钢管 DN50', quantity: 300, unit: '根', unitPrice: 450, amount: 135000 },
      { productName: '镀锌钢管 DN25', quantity: 100, unit: '根', unitPrice: 150, amount: 15000 },
    ],
  },
])

const invoices = ref<InvoiceRecord[]>([
  {
    id: 'inv1',
    orderNo: 'SO202312010001',
    invoiceNo: 'FP2024010001',
    supplierName: '华东工程仓',
    amount: 450000,
    taxType: 'special',
    taxTypeText: '增值税专用发票',
    status: 'issued',
    statusText: '已开票',
    createTime: '2024-01-10 14:00:00',
    invoiceImage: 'https://via.placeholder.com/600x400/E8F3FF/165DFF?text=发票图片',
    orderItems: [
      { productName: '螺纹钢 HRB400E Φ25', quantity: 60, unit: '吨', unitPrice: 4850, amount: 291000 },
      { productName: '盘螺 HRB400E Φ8', quantity: 30, unit: '吨', unitPrice: 3300, amount: 99000 },
    ],
  },
  {
    id: 'inv2',
    orderNo: 'SO202312150002',
    invoiceNo: 'FP2024010002',
    supplierName: '华南工程仓',
    amount: 280000,
    taxType: 'special',
    taxTypeText: '增值税专用发票',
    status: 'issued',
    statusText: '已开票',
    createTime: '2024-01-12 10:30:00',
    invoiceImage: 'https://via.placeholder.com/600x400/E8FFEA/00B42A?text=发票图片',
    orderItems: [
      { productName: '镀锌钢管 DN100', quantity: 180, unit: '根', unitPrice: 850, amount: 153000 },
      { productName: '镀锌钢管 DN50', quantity: 200, unit: '根', unitPrice: 450, amount: 90000 },
    ],
  },
  {
    id: 'inv3',
    orderNo: 'SO202401050003',
    invoiceNo: '',
    supplierName: '华东工程仓',
    amount: 560000,
    taxType: 'special',
    taxTypeText: '增值税专用发票',
    status: 'pending',
    statusText: '待开票',
    createTime: '2024-01-15 10:00:00',
    orderItems: [
      { productName: '螺纹钢 HRB400E Φ25', quantity: 80, unit: '吨', unitPrice: 4850, amount: 388000 },
      { productName: '盘螺 HRB400E Φ8', quantity: 40, unit: '吨', unitPrice: 3300, amount: 132000 },
    ],
  },
  {
    id: 'inv4',
    orderNo: 'SO202401060004',
    invoiceNo: '',
    supplierName: '华南工程仓',
    amount: 580000,
    taxType: 'general',
    taxTypeText: '增值税普通发票',
    status: 'pending',
    statusText: '待开票',
    createTime: '2024-01-16 14:00:00',
    orderItems: [
      { productName: '水泥 PO42.5', quantity: 500, unit: '吨', unitPrice: 480, amount: 240000 },
      { productName: '中砂', quantity: 300, unit: '吨', unitPrice: 120, amount: 36000 },
    ],
  },
  {
    id: 'inv5',
    orderNo: 'SO202311200005',
    invoiceNo: 'FP2023120003',
    supplierName: '华东工程仓',
    amount: 195000,
    taxType: 'special',
    taxTypeText: '增值税专用发票',
    status: 'voided',
    statusText: '已作废',
    createTime: '2023-12-20 09:00:00',
    invoiceImage: 'https://via.placeholder.com/600x400/FFF0F0/F53F3F?text=已作废',
    orderItems: [
      { productName: '线材 HPB300 Φ10', quantity: 30, unit: '吨', unitPrice: 4000, amount: 120000 },
      { productName: '盘螺 HRB400E Φ8', quantity: 20, unit: '吨', unitPrice: 3300, amount: 66000 },
    ],
  },
])

const selectedOrder = computed(() => {
  return availableOrders.value.find(o => o.id === selectedOrderId.value)
})

const canSubmit = computed(() => {
  return selectedOrderId.value && applyForm.value.taxType
})

const filteredList = computed(() => {
  if (!activeStatus.value) return invoices.value
  return invoices.value.filter(i => i.status === activeStatus.value)
})

function handleShowApply() {
  selectedOrderId.value = ''
  applyForm.value.taxType = 'special'
  showApplySheet.value = true
}

function handleCloseApply() {
  showApplySheet.value = false
}

function handleSubmitApply() {
  if (!canSubmit.value) return
  const order = selectedOrder.value
  if (!order) return

  const newInvoice: InvoiceRecord = {
    id: 'inv-new-' + Date.now(),
    orderNo: order.orderNo,
    invoiceNo: '',
    supplierName: order.supplierName,
    amount: order.availableAmount,
    taxType: applyForm.value.taxType,
    taxTypeText: applyForm.value.taxType === 'special' ? '增值税专用发票' : '增值税普通发票',
    status: 'pending',
    statusText: '待开票',
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    orderItems: order.items,
  }
  invoices.value.unshift(newInvoice)

  order.invoicedAmount += order.availableAmount
  order.availableAmount = 0

  showApplySheet.value = false
  uni.showToast({ title: '开票申请已提交', icon: 'success' })
}

function handleViewInvoice(item: InvoiceRecord) {
  detailData.value = item
  showDetail.value = true
}

function handleCloseDetail() {
  showDetail.value = false
  detailData.value = null
}

function handleViewOrder(item: InvoiceRecord) {
  uni.navigateTo({
    url: `/pages/order/detail?orderNo=${item.orderNo}`,
  })
}

function handleDownload(item: InvoiceRecord) {
  uni.showToast({ title: '发票下载中...', icon: 'loading' })
  setTimeout(() => {
    uni.showToast({ title: '下载成功', icon: 'success' })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40rpx;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d2129;
}

.apply-btn {
  padding: 14rpx 32rpx;
  font-size: 28rpx;
  color: #fff;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border-radius: 40rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(22, 93, 255, 0.3);
}

.status-bar {
  display: flex;
  padding: 20rpx 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #86909c;
  padding: 8rpx 0;
  position: relative;

  &.active {
    color: #165dff;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: -20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background-color: #165dff;
      border-radius: 2rpx;
    }
  }
}

.invoice-list {
  padding: 24rpx 32rpx;
}

.invoice-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.invoice-left {
  display: flex;
  flex-direction: column;
}

.invoice-order {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.invoice-time {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.invoice-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  white-space: nowrap;

  &.pending {
    color: #ff7d00;
    background-color: #fff7e8;
  }

  &.issued {
    color: #00b42a;
    background-color: #e8ffea;
  }

  &.voided {
    color: #f53f3f;
    background-color: #fff0f0;
  }
}

.invoice-body {
  padding: 16rpx 0;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.invoice-row {
  display: flex;
  justify-content: space-between;
  padding: 6rpx 0;
}

.row-label {
  font-size: 26rpx;
  color: #86909c;
}

.row-value {
  font-size: 26rpx;
  color: #1d2129;

  &.price {
    color: #f53f3f;
    font-weight: 500;
  }
}

.invoice-footer {
  padding-top: 16rpx;
}

.invoice-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 32rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}

.overlay {
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

.sheet {
  width: 100%;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
}

.detail-sheet {
  max-height: 85vh;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.sheet-close {
  font-size: 32rpx;
  color: #86909c;
  padding: 8rpx;
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}

.sheet-footer {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.btn-submit {
  flex: 2;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #fff;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border-radius: 12rpx;
  font-weight: 500;

  &.disabled {
    opacity: 0.5;
  }
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.form-value {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 600;

  &.highlight {
    color: #f53f3f;
  }
}

.radio-group {
  display: flex;
  gap: 16rpx;
}

.radio-item {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  border: 2rpx solid #e5e6eb;

  &.active {
    color: #165dff;
    background-color: #e8f3ff;
    border-color: #165dff;
  }
}

.order-list {
  max-height: 500rpx;
  margin-bottom: 24rpx;
}

.order-item {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;

  &.selected {
    border-color: #165dff;
    background-color: #e8f3ff;
  }
}

.order-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.order-no {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 500;
}

.order-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #c9cdd4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #fff;

  &.checked {
    background-color: #165dff;
    border-color: #165dff;
  }
}

.order-info {
  margin-bottom: 8rpx;
}

.order-label {
  font-size: 24rpx;
  color: #86909c;
}

.order-amounts {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.order-amount {
  font-size: 24rpx;
  color: #86909c;
}

.order-available {
  font-size: 24rpx;
  color: #86909c;
}

.amount-highlight {
  color: #f53f3f;
  font-weight: 500;
}

.order-goods {
  margin-top: 4rpx;
}

.goods-label {
  font-size: 22rpx;
  color: #86909c;
}

.goods-list {
  font-size: 22rpx;
  color: #4e5969;
}

.detail-image {
  margin-bottom: 24rpx;
  border-radius: 12rpx;
  overflow: hidden;

  image {
    width: 100%;
    border-radius: 12rpx;
  }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
}

.detail-label {
  font-size: 26rpx;
  color: #86909c;
}

.detail-value {
  font-size: 26rpx;
  color: #1d2129;

  &.price {
    color: #f53f3f;
    font-weight: 500;
  }
}

.detail-goods {
  margin-top: 20rpx;
}

.goods-table {
  margin-top: 12rpx;
  border: 1rpx solid #e5e6eb;
  border-radius: 8rpx;
  overflow: hidden;
}

.goods-th {
  display: flex;
  background-color: #f7f8fa;
  padding: 12rpx 16rpx;
  font-size: 22rpx;
  color: #86909c;
  font-weight: 500;
}

.goods-tr {
  display: flex;
  padding: 12rpx 16rpx;
  font-size: 22rpx;
  color: #4e5969;
  border-top: 1rpx solid #f0f0f0;
}

.goods-col {
  &.name {
    flex: 2;
  }

  &.qty {
    flex: 1;
    text-align: center;
  }

  &.price {
    flex: 1;
    text-align: right;
  }

  &.amount {
    flex: 1;
    text-align: right;
  }
}
</style>
