<template>
  <view class="page">
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'all' }"
        @click="filterType = 'all'"
      >全部</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'output' }"
        @click="filterType = 'output'"
      >销项发票</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'input' }"
        @click="filterType = 'input'"
      >进项发票</view>
    </view>

    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索发票号/订单号" 
      />
    </view>

    <view class="record-list">
      <view class="record-item" v-for="item in filteredRecords" :key="item.id">
        <view class="record-header">
          <view class="record-no">
            <text class="no-label">发票号码：</text>
            <text class="no-value">{{ item.invoiceNo }}</text>
          </view>
          <view class="record-type" :class="item.type">
            <text>{{ item.type === 'output' ? '销项' : '进项' }}</text>
          </view>
        </view>
        
        <view class="record-info">
          <view class="info-row">
            <text class="info-label">关联订单：</text>
            <text class="info-value">{{ item.orderNo }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ item.type === 'output' ? '购买方' : '销售方' }}：</text>
            <text class="info-value">{{ item.company }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">开票金额：</text>
            <text class="info-value price">¥{{ item.amount }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">开票日期：</text>
            <text class="info-value">{{ item.date }}</text>
          </view>
        </view>
        
        <view class="record-footer">
          <view class="record-status" :class="item.status">
            <text>{{ getStatusText(item.status) }}</text>
          </view>
          <view class="record-actions">
            <view class="action-btn" @click="handlePreview(item)">查看</view>
            <view class="action-btn" @click="handleDownload(item)">下载</view>
          </view>
        </view>
      </view>

      <view class="empty" v-if="filteredRecords.length === 0">
        <text class="empty-icon">📄</text>
        <text class="empty-text">暂无开票记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filterType = ref('all')
const keyword = ref('')

const records = ref([
  {
    id: 'ir001',
    invoiceNo: 'FP2024010001',
    type: 'output',
    orderNo: 'SO2024010012',
    company: '深圳建设集团',
    amount: '4,500.00',
    date: '2024-01-15',
    status: 'issued',
  },
  {
    id: 'ir002',
    invoiceNo: 'FP2024010002',
    type: 'output',
    orderNo: 'SO2024010010',
    company: '广州建筑公司',
    amount: '21,000.00',
    date: '2024-01-14',
    status: 'issued',
  },
  {
    id: 'ir003',
    invoiceNo: 'FP2024010003',
    type: 'input',
    orderNo: 'PO2024010008',
    company: '海螺水泥供应商',
    amount: '24,000.00',
    date: '2024-01-13',
    status: 'received',
  },
  {
    id: 'ir004',
    invoiceNo: 'FP2024010004',
    type: 'output',
    orderNo: 'SO2024010008',
    company: '东莞工程公司',
    amount: '8,500.00',
    date: '2024-01-12',
    status: 'red',
  },
  {
    id: 'ir005',
    invoiceNo: 'FP2024010005',
    type: 'input',
    orderNo: 'PO2024010006',
    company: '宝钢供应商',
    amount: '39,500.00',
    date: '2024-01-11',
    status: 'received',
  },
  {
    id: 'ir006',
    invoiceNo: 'FP2024010006',
    type: 'output',
    orderNo: 'SO2024010005',
    company: '佛山建材市场',
    amount: '9,500.00',
    date: '2024-01-10',
    status: 'pending',
  },
])

const filteredRecords = computed(() => {
  let result = records.value
  
  if (filterType.value !== 'all') {
    result = result.filter(r => r.type === filterType.value)
  }
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(r => 
      r.invoiceNo.toLowerCase().includes(kw) ||
      r.orderNo.toLowerCase().includes(kw)
    )
  }
  
  return result
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待开票',
    issued: '已开票',
    received: '已收到',
    red: '已红冲',
  }
  return map[status] || status
}

function handlePreview(item: any) {
  uni.showToast({ title: '查看发票: ' + item.invoiceNo, icon: 'none' })
}

function handleDownload(item: any) {
  uni.showToast({ title: '下载发票', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #86909c;
  padding: 12rpx 0;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 500;
    
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

.search-bar {
  display: flex;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background-color: #fff;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 12rpx;
  font-size: 28rpx;
}

.search-bar input {
  flex: 1;
  font-size: 28rpx;
}

.record-list {
  padding: 0 32rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f7f8fa;
}

.record-no {
  .no-label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .no-value {
    font-size: 24rpx;
    color: #1d2129;
    font-weight: 500;
  }
}

.record-type {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  
  &.output {
    background-color: #e8f3ff;
    color: #165dff;
  }
  
  &.input {
    background-color: #e8ffea;
    color: #00b42a;
  }
}

.record-info {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  margin-top: 12rpx;
  
  &:first-child {
    margin-top: 0;
  }
}

.info-label {
  font-size: 26rpx;
  color: #86909c;
  width: 160rpx;
}

.info-value {
  font-size: 26rpx;
  color: #1d2129;
  flex: 1;
  
  &.price {
    color: #f53f3f;
    font-weight: 500;
  }
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f7f8fa;
}

.record-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  
  &.pending {
    background-color: #fff7e8;
    color: #ff7d00;
  }
  
  &.issued, &.received {
    background-color: #e8ffea;
    color: #00b42a;
  }
  
  &.red {
    background-color: #ffece8;
    color: #f53f3f;
  }
}

.record-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 10rpx 24rpx;
  font-size: 24rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e5e6eb;
  color: #1d2129;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}
</style>
