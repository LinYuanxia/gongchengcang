<template>
  <view class="page">
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'out' }"
        @click="currentTab = 'out'"
      >
        销项发票
        <view class="badge" v-if="outCount > 0">{{ outCount }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'in' }"
        @click="currentTab = 'in'"
      >
        进项发票
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'records' }"
        @click="currentTab = 'records'"
      >
        开票记录
      </view>
    </view>

    <template v-if="currentTab === 'out'">
      <view class="status-bar">
        <view 
          class="status-item" 
          :class="{ active: outStatus === '' }"
          @click="outStatus = ''"
        >
          全部
        </view>
        <view 
          class="status-item" 
          :class="{ active: outStatus === 'pending' }"
          @click="outStatus = 'pending'"
        >
          待开票
        </view>
        <view 
          class="status-item" 
          :class="{ active: outStatus === 'processing' }"
          @click="outStatus = 'processing'"
        >
          开票中
        </view>
        <view 
          class="status-item" 
          :class="{ active: outStatus === 'completed' }"
          @click="outStatus = 'completed'"
        >
          已开票
        </view>
      </view>

      <view class="invoice-list">
        <view class="invoice-item" v-for="item in filteredOutInvoices" :key="item.id">
          <view class="invoice-header">
            <view class="invoice-left">
              <text class="invoice-no">{{ item.orderNo }}</text>
              <text class="invoice-time">{{ item.createTime }}</text>
            </view>
            <text class="invoice-status" :class="item.status">{{ item.statusText }}</text>
          </view>
          <view class="invoice-body">
            <view class="invoice-row">
              <text class="row-label">客户名称</text>
              <text class="row-value">{{ item.customerName }}</text>
            </view>
            <view class="invoice-row">
              <text class="row-label">开票金额</text>
              <text class="row-value price">¥{{ item.amount }}</text>
            </view>
            <view class="invoice-row">
              <text class="row-label">发票类型</text>
              <text class="row-value">{{ item.invoiceType }}</text>
            </view>
          </view>
          <view class="invoice-footer">
            <view class="invoice-actions">
              <view class="action-btn" v-if="item.status === 'pending'" @click="handleIssueInvoice(item)">开票</view>
              <view class="action-btn" v-if="item.status === 'processing'" @click="handleViewProgress(item)">查看进度</view>
              <view class="action-btn" v-if="item.status === 'completed'" @click="handleViewInvoice(item)">查看发票</view>
              <view class="action-btn" v-if="item.status === 'completed'" @click="handleDownloadInvoice(item)">下载</view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <template v-if="currentTab === 'in'">
      <view class="status-bar">
        <view 
          class="status-item" 
          :class="{ active: inStatus === '' }"
          @click="inStatus = ''"
        >
          全部
        </view>
        <view 
          class="status-item" 
          :class="{ active: inStatus === 'pending' }"
          @click="inStatus = 'pending'"
        >
          待收票
        </view>
        <view 
          class="status-item" 
          :class="{ active: inStatus === 'received' }"
          @click="inStatus = 'received'"
        >
          已收票
        </view>
        <view 
          class="status-item" 
          :class="{ active: inStatus === 'verified' }"
          @click="inStatus = 'verified'"
        >
          已认证
        </view>
      </view>

      <view class="invoice-list">
        <view class="invoice-item" v-for="item in filteredInInvoices" :key="item.id">
          <view class="invoice-header">
            <view class="invoice-left">
              <text class="invoice-no">{{ item.orderNo }}</text>
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
              <text class="row-value price">¥{{ item.amount }}</text>
            </view>
            <view class="invoice-row">
              <text class="row-label">发票类型</text>
              <text class="row-value">{{ item.invoiceType }}</text>
            </view>
          </view>
          <view class="invoice-footer">
            <view class="invoice-actions">
              <view class="action-btn" v-if="item.status === 'pending'" @click="handleRemindInvoice(item)">提醒开票</view>
              <view class="action-btn" v-if="item.status === 'received'" @click="handleVerifyInvoice(item)">认证</view>
              <view class="action-btn" v-if="item.status === 'received' || item.status === 'verified'" @click="handleViewInvoice(item)">查看发票</view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <template v-if="currentTab === 'records'">
      <view class="filter-bar">
        <picker mode="date" fields="month" @change="handleDateChange">
          <view class="filter-item">
            <text>{{ selectedMonth || '选择月份' }}</text>
            <text class="filter-arrow">▼</text>
          </view>
        </picker>
        <view class="filter-item" @click="showTypeFilter = true">
          <text>{{ selectedType || '发票类型' }}</text>
          <text class="filter-arrow">▼</text>
        </view>
      </view>

      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-label">开票金额</text>
          <text class="summary-value">¥{{ summaryData.totalAmount }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">开票数量</text>
          <text class="summary-value">{{ summaryData.count }}张</text>
        </view>
      </view>

      <view class="record-list">
        <view class="record-item" v-for="item in invoiceRecords" :key="item.id">
          <view class="record-left">
            <text class="record-type" :class="item.type">{{ item.type === 'out' ? '销' : '进' }}</text>
          </view>
          <view class="record-center">
            <text class="record-title">{{ item.title }}</text>
            <text class="record-no">{{ item.invoiceNo }}</text>
          </view>
          <view class="record-right">
            <text class="record-amount">¥{{ item.amount }}</text>
            <text class="record-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentTab = ref('out')
const outStatus = ref('')
const inStatus = ref('')
const selectedMonth = ref('')
const selectedType = ref('')
const showTypeFilter = ref(false)
const outCount = ref(8)

const outInvoices = ref([
  { id: 1, orderNo: 'SO2024010012', createTime: '2024-01-15', customerName: '深圳建设集团', amount: '4,500.00', invoiceType: '增值税专用发票', status: 'pending', statusText: '待开票' },
  { id: 2, orderNo: 'SO2024010011', createTime: '2024-01-15', customerName: '广州建筑公司', amount: '21,000.00', invoiceType: '增值税专用发票', status: 'processing', statusText: '开票中' },
  { id: 3, orderNo: 'SO2024010010', createTime: '2024-01-14', customerName: '东莞工程公司', amount: '21,000.00', invoiceType: '增值税普通发票', status: 'completed', statusText: '已开票' },
])

const inInvoices = ref([
  { id: 1, orderNo: 'PO2024010001', createTime: '2024-01-15', supplierName: '华新水泥供应商', amount: '8,400.00', invoiceType: '增值税专用发票', status: 'pending', statusText: '待收票' },
  { id: 2, orderNo: 'PO2024010002', createTime: '2024-01-14', supplierName: '宝钢供应商', amount: '39,500.00', invoiceType: '增值税专用发票', status: 'received', statusText: '已收票' },
  { id: 3, orderNo: 'PO2024010003', createTime: '2024-01-12', supplierName: '南方建材供应商', amount: '8,000.00', invoiceType: '增值税专用发票', status: 'verified', statusText: '已认证' },
])

const summaryData = ref({
  totalAmount: '128,500.00',
  count: 15,
})

const invoiceRecords = ref([
  { id: 1, type: 'out', title: '深圳建设集团', invoiceNo: 'FP2024010001', amount: '4,500.00', time: '2024-01-15' },
  { id: 2, type: 'in', title: '华新水泥供应商', invoiceNo: 'FP2024010002', amount: '8,400.00', time: '2024-01-14' },
  { id: 3, type: 'out', title: '广州建筑公司', invoiceNo: 'FP2024010003', amount: '21,000.00', time: '2024-01-13' },
])

const filteredOutInvoices = computed(() => {
  if (!outStatus.value) return outInvoices.value
  return outInvoices.value.filter(item => item.status === outStatus.value)
})

const filteredInInvoices = computed(() => {
  if (!inStatus.value) return inInvoices.value
  return inInvoices.value.filter(item => item.status === inStatus.value)
})

function handleDateChange(e: any) {
  selectedMonth.value = e.detail.value
}

function handleIssueInvoice(item: any) {
  uni.showModal({
    title: '确认开票',
    content: `确定为 ${item.customerName} 开具发票 ¥${item.amount} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已提交开票申请', icon: 'success' })
      }
    },
  })
}

function handleViewProgress(item: any) {
  uni.showToast({ title: '查看开票进度', icon: 'none' })
}

function handleViewInvoice(item: any) {
  uni.showToast({ title: '查看发票详情', icon: 'none' })
}

function handleDownloadInvoice(item: any) {
  uni.showToast({ title: '下载发票', icon: 'none' })
}

function handleRemindInvoice(item: any) {
  uni.showModal({
    title: '提醒开票',
    content: `确定提醒 ${item.supplierName} 开具发票吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已发送提醒', icon: 'success' })
      }
    },
  })
}

function handleVerifyInvoice(item: any) {
  uni.showModal({
    title: '发票认证',
    content: `确定认证该发票吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '认证成功', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
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
  
  .badge {
    position: absolute;
    top: 16rpx;
    right: 20%;
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

.status-bar {
  display: flex;
  padding: 20rpx 16rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  padding: 8rpx 0;
  
  &.active {
    color: #165dff;
    font-weight: 500;
  }
}

.filter-bar {
  display: flex;
  padding: 20rpx 32rpx;
  gap: 16rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.filter-arrow {
  font-size: 20rpx;
  margin-left: 8rpx;
}

.summary-card {
  display: flex;
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-label {
  font-size: 24rpx;
  color: #86909c;
  display: block;
}

.summary-value {
  font-size: 36rpx;
  color: #1d2129;
  font-weight: 600;
  margin-top: 8rpx;
  display: block;
}

.invoice-list {
  padding: 24rpx 32rpx;
}

.invoice-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
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

.invoice-no {
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
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  
  &.pending {
    color: #ff7d00;
    background-color: #fff7e8;
  }
  
  &.processing {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  &.completed {
    color: #00b42a;
    background-color: #e8ffea;
  }
  
  &.received {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  &.verified {
    color: #00b42a;
    background-color: #e8ffea;
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
  padding: 8rpx 0;
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
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 32rpx;
}

.record-list {
  padding: 0 32rpx;
}

.record-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.record-left {
  margin-right: 16rpx;
}

.record-type {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  border-radius: 8rpx;
  
  &.out {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  &.in {
    color: #00b42a;
    background-color: #e8ffea;
  }
}

.record-center {
  flex: 1;
}

.record-title {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.record-no {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.record-right {
  text-align: right;
}

.record-amount {
  font-size: 28rpx;
  color: #f53f3f;
  font-weight: 500;
  display: block;
}

.record-time {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}
</style>
