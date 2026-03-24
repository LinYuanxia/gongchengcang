<template>
  <view class="page">
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-label">账户余额</text>
        <text class="summary-value">¥{{ balance }}</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-label">冻结金额</text>
        <text class="summary-value frozen">¥{{ frozen }}</text>
      </view>
    </view>

    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'all' }"
        @click="filterType = 'all'"
      >全部</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'income' }"
        @click="filterType = 'income'"
      >收入</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'expense' }"
        @click="filterType = 'expense'"
      >支出</view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'freeze' }"
        @click="filterType = 'freeze'"
      >冻结</view>
    </view>

    <view class="date-filter">
      <picker mode="date" :value="startDate" @change="startDate = $event.detail.value">
        <view class="date-item">
          <text>{{ startDate || '开始日期' }}</text>
          <text class="date-arrow">▼</text>
        </view>
      </picker>
      <text class="date-sep">至</text>
      <picker mode="date" :value="endDate" @change="endDate = $event.detail.value">
        <view class="date-item">
          <text>{{ endDate || '结束日期' }}</text>
          <text class="date-arrow">▼</text>
        </view>
      </picker>
    </view>

    <view class="record-list">
      <view class="record-item" v-for="item in filteredRecords" :key="item.id">
        <view class="record-left">
          <view class="record-icon" :class="item.type">
            <text>{{ getTypeIcon(item.type) }}</text>
          </view>
          <view class="record-info">
            <text class="record-title">{{ item.title }}</text>
            <text class="record-desc">{{ item.desc }}</text>
            <text class="record-time">{{ item.time }}</text>
          </view>
        </view>
        <view class="record-right">
          <text class="record-amount" :class="item.type">
            {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}
          </text>
          <text class="record-balance">余额: ¥{{ item.afterBalance }}</text>
        </view>
      </view>

      <view class="empty" v-if="filteredRecords.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无交易记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const balance = ref('158,520.00')
const frozen = ref('12,000.00')
const filterType = ref('all')
const startDate = ref('')
const endDate = ref('')

const records = ref([
  {
    id: 'r001',
    type: 'income',
    title: '销售收款',
    desc: '订单 SO2024010012',
    amount: '4,500.00',
    afterBalance: '158,520.00',
    time: '2024-01-15 14:30:00',
  },
  {
    id: 'r002',
    type: 'expense',
    title: '采购付款',
    desc: '订单 PO2024010008',
    amount: '24,000.00',
    afterBalance: '154,020.00',
    time: '2024-01-15 10:20:00',
  },
  {
    id: 'r003',
    type: 'income',
    title: '账户充值',
    desc: '银行卡充值',
    amount: '50,000.00',
    afterBalance: '178,020.00',
    time: '2024-01-14 16:45:00',
  },
  {
    id: 'r004',
    type: 'freeze',
    title: '订单冻结',
    desc: '订单 SO2024010015',
    amount: '12,000.00',
    afterBalance: '166,020.00',
    time: '2024-01-14 11:30:00',
  },
  {
    id: 'r005',
    type: 'expense',
    title: '提现',
    desc: '提现至招商银行尾号8888',
    amount: '20,000.00',
    afterBalance: '146,020.00',
    time: '2024-01-13 09:15:00',
  },
  {
    id: 'r006',
    type: 'income',
    title: '销售收款',
    desc: '订单 SO2024010010',
    amount: '21,000.00',
    afterBalance: '166,020.00',
    time: '2024-01-12 15:40:00',
  },
  {
    id: 'r007',
    type: 'expense',
    title: '采购付款',
    desc: '订单 PO2024010006',
    amount: '25,000.00',
    afterBalance: '145,020.00',
    time: '2024-01-11 14:20:00',
  },
  {
    id: 'r008',
    type: 'income',
    title: '退款解冻',
    desc: '订单 SO2024010008 退款',
    amount: '8,500.00',
    afterBalance: '153,520.00',
    time: '2024-01-10 10:30:00',
  },
  {
    id: 'r009',
    type: 'expense',
    title: '服务费',
    desc: '平台服务费',
    amount: '1,500.00',
    afterBalance: '152,020.00',
    time: '2024-01-10 08:00:00',
  },
  {
    id: 'r010',
    type: 'income',
    title: '销售收款',
    desc: '订单 SO2024010005',
    amount: '35,000.00',
    afterBalance: '187,020.00',
    time: '2024-01-09 16:30:00',
  },
])

const filteredRecords = computed(() => {
  let result = records.value
  
  if (filterType.value !== 'all') {
    result = result.filter(r => r.type === filterType.value)
  }
  
  return result
})

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    income: '💰',
    expense: '💸',
    freeze: '🔒',
  }
  return icons[type] || '📋'
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.summary-card {
  display: flex;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 40rpx 32rpx;
  color: #fff;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-label {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
}

.summary-value {
  font-size: 40rpx;
  font-weight: 600;
  margin-top: 12rpx;
  display: block;
  
  &.frozen {
    font-size: 32rpx;
    opacity: 0.8;
  }
}

.summary-divider {
  width: 1rpx;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 32rpx;
}

.filter-bar {
  display: flex;
  padding: 24rpx 32rpx;
  background-color: #fff;
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

.date-filter {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background-color: #fff;
  margin-bottom: 24rpx;
}

.date-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #1d2129;
}

.date-arrow {
  font-size: 20rpx;
  color: #86909c;
  margin-left: 8rpx;
}

.date-sep {
  margin: 0 20rpx;
  font-size: 26rpx;
  color: #86909c;
}

.record-list {
  padding: 0 32rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.record-left {
  display: flex;
  align-items: flex-start;
}

.record-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 16rpx;
  
  &.income {
    background-color: #e8ffea;
  }
  
  &.expense {
    background-color: #ffece8;
  }
  
  &.freeze {
    background-color: #fff7e8;
  }
}

.record-info {
  display: flex;
  flex-direction: column;
}

.record-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.record-desc {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.record-time {
  font-size: 22rpx;
  color: #c9cdd4;
  margin-top: 8rpx;
}

.record-right {
  text-align: right;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;
  
  &.income {
    color: #00b42a;
  }
  
  &.expense {
    color: #f53f3f;
  }
  
  &.freeze {
    color: #ff7d00;
  }
}

.record-balance {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
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
