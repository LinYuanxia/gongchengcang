<template>
  <view class="page">
    <view class="balance-card">
      <text class="balance-label">托管账户余额</text>
      <text class="balance-value">¥{{ balance }}</text>
      <view class="balance-actions">
        <view class="action-btn" @click="handleRecharge">充值</view>
        <view class="action-btn" @click="handleWithdraw">提现</view>
      </view>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">¥{{ frozenAmount }}</text>
        <text class="stat-label">冻结金额</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">¥{{ availableAmount }}</text>
        <text class="stat-label">可用余额</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">交易明细</text>
      </view>
      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'all' }"
          @click="currentTab = 'all'"
        >全部</view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'income' }"
          @click="currentTab = 'income'"
        >收入</view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'expense' }"
          @click="currentTab = 'expense'"
        >支出</view>
      </view>
      <view class="transaction-list">
        <view class="transaction-item" v-for="item in filteredTransactions" :key="item.id">
          <view class="transaction-left">
            <text class="transaction-icon">{{ item.type === 'income' ? '↓' : '↑' }}</text>
            <view class="transaction-info">
              <text class="transaction-title">{{ item.title }}</text>
              <text class="transaction-time">{{ item.time }}</text>
            </view>
          </view>
          <text class="transaction-amount" :style="{ color: item.type === 'income' ? '#00b42a' : '#f53f3f' }">
            {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const balance = ref('158,520.00')
const frozenAmount = ref('12,000.00')
const availableAmount = ref('146,520.00')
const currentTab = ref('all')

const transactions = ref([
  { id: 1, type: 'income', title: '销售订单收款', amount: '4,500.00', time: '2024-01-15 14:30' },
  { id: 2, type: 'expense', title: '采购订单付款', amount: '8,400.00', time: '2024-01-15 10:20' },
  { id: 3, type: 'income', title: '充值', amount: '50,000.00', time: '2024-01-14 16:00' },
  { id: 4, type: 'expense', title: '提现', amount: '20,000.00', time: '2024-01-13 09:15' },
  { id: 5, type: 'income', title: '销售订单收款', amount: '21,000.00', time: '2024-01-12 15:45' },
])

const filteredTransactions = computed(() => {
  if (currentTab.value === 'all') return transactions.value
  return transactions.value.filter(t => t.type === currentTab.value)
})

function handleRecharge() {
  uni.navigateTo({ url: '/pages/mine/custody-recharge' })
}

function handleWithdraw() {
  uni.navigateTo({ url: '/pages/mine/custody-withdraw' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.balance-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 48rpx 32rpx;
  color: #fff;
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.8;
  display: block;
}

.balance-value {
  font-size: 56rpx;
  font-weight: 600;
  margin-top: 16rpx;
  display: block;
}

.balance-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.stats-card {
  display: flex;
  margin: -24rpx 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.section {
  margin: 0 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.tabs {
  display: flex;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
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

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.transaction-left {
  display: flex;
  align-items: center;
}

.transaction-icon {
  width: 48rpx;
  height: 48rpx;
  background-color: #f7f8fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.transaction-title {
  font-size: 28rpx;
  color: #1d2129;
}

.transaction-time {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.transaction-amount {
  font-size: 30rpx;
  font-weight: 500;
}
</style>
