<template>
  <view class="page">
    <view class="header-card">
      <view class="header-info">
        <text class="header-title">库存盘点</text>
        <text class="header-desc">对库存商品进行清点核实</text>
      </view>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-value">{{ checkStats.total }}</text>
          <text class="stat-label">待盘点</text>
        </view>
        <view class="stat-item">
          <text class="stat-value success">{{ checkStats.completed }}</text>
          <text class="stat-label">已盘点</text>
        </view>
        <view class="stat-item">
          <text class="stat-value warning">{{ checkStats.diff }}</text>
          <text class="stat-label">差异</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <view class="action-btn primary" @click="handleNewCheck">
        <text class="action-icon">➕</text>
        <text>新建盘点</text>
      </view>
      <view class="action-btn" @click="handleScanCheck">
        <text class="action-icon">📷</text>
        <text>扫码盘点</text>
      </view>
    </view>

    <view class="check-list">
      <view class="check-item" v-for="item in checkList" :key="item.id">
        <view class="check-header">
          <view class="check-no">
            <text class="no-label">盘点单号：</text>
            <text class="no-value">{{ item.checkNo }}</text>
          </view>
          <view class="check-status" :class="item.status">
            <text>{{ getStatusText(item.status) }}</text>
          </view>
        </view>
        
        <view class="check-info">
          <view class="info-row">
            <text class="info-label">仓库：</text>
            <text class="info-value">{{ item.warehouse }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">盘点时间：</text>
            <text class="info-value">{{ item.checkTime }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">操作人：</text>
            <text class="info-value">{{ item.operator }}</text>
          </view>
        </view>
        
        <view class="check-stats">
          <view class="check-stat">
            <text class="stat-num">{{ item.totalSku }}</text>
            <text class="stat-text">SKU数量</text>
          </view>
          <view class="check-stat">
            <text class="stat-num success">{{ item.matched }}</text>
            <text class="stat-text">账实相符</text>
          </view>
          <view class="check-stat">
            <text class="stat-num warning">{{ item.diff }}</text>
            <text class="stat-text">差异</text>
          </view>
        </view>
        
        <view class="check-actions">
          <view class="check-btn" @click="handleViewDetail(item)">查看详情</view>
          <view class="check-btn primary" v-if="item.status === 'pending'" @click="handleContinue(item)">继续盘点</view>
          <view class="check-btn" v-if="item.status === 'completed'" @click="handleExport(item)">导出报表</view>
        </view>
      </view>
    </view>

    <view class="empty" v-if="checkList.length === 0">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无盘点记录</text>
      <view class="empty-btn" @click="handleNewCheck">新建盘点</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const checkStats = ref({
  total: 3,
  completed: 12,
  diff: 5,
})

const checkList = ref([
  {
    id: 'c001',
    checkNo: 'PD2024010001',
    status: 'completed',
    warehouse: 'A区仓库',
    checkTime: '2024-01-10 14:30',
    operator: '张三',
    totalSku: 156,
    matched: 151,
    diff: 5,
  },
  {
    id: 'c002',
    checkNo: 'PD2024010002',
    status: 'completed',
    warehouse: 'B区仓库',
    checkTime: '2024-01-08 10:20',
    operator: '李四',
    totalSku: 89,
    matched: 89,
    diff: 0,
  },
  {
    id: 'c003',
    checkNo: 'PD2024010003',
    status: 'pending',
    warehouse: 'C区仓库',
    checkTime: '2024-01-15 09:00',
    operator: '张三',
    totalSku: 67,
    matched: 45,
    diff: 0,
  },
  {
    id: 'c004',
    checkNo: 'PD2024010004',
    status: 'draft',
    warehouse: 'A区仓库',
    checkTime: '2024-01-15 15:30',
    operator: '王五',
    totalSku: 0,
    matched: 0,
    diff: 0,
  },
])

function getStatusText(status: string) {
  const map: Record<string, string> = {
    draft: '草稿',
    pending: '进行中',
    completed: '已完成',
  }
  return map[status] || status
}

function handleNewCheck() {
  uni.showModal({
    title: '新建盘点',
    content: '确定要开始新的库存盘点吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '创建成功', icon: 'success' })
      }
    },
  })
}

function handleScanCheck() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '扫码成功: ' + res.result, icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}

function handleViewDetail(item: any) {
  uni.navigateTo({ url: `/pages/mine/stock-check-detail?id=${item.id}` })
}

function handleContinue(item: any) {
  uni.navigateTo({ url: `/pages/mine/stock-check?id=${item.id}` })
}

function handleExport(item: any) {
  uni.showToast({ title: '导出盘点报表', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.header-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 40rpx 32rpx;
  color: #fff;
}

.header-info {
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.header-desc {
  font-size: 24rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  display: block;
}

.header-stats {
  display: flex;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 24rpx 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  
  &.success {
    color: #00e676;
  }
  
  &.warning {
    color: #ffab40;
  }
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.action-bar {
  display: flex;
  padding: 24rpx 32rpx;
  background-color: #fff;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: 1rpx solid #e5e6eb;
  color: #1d2129;
  
  &.primary {
    background-color: #165dff;
    border-color: #165dff;
    color: #fff;
  }
  
  .action-icon {
    margin-right: 8rpx;
    font-size: 32rpx;
  }
}

.check-list {
  padding: 24rpx 32rpx;
}

.check-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.check-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.check-no {
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

.check-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  
  &.draft {
    background-color: #f7f8fa;
    color: #86909c;
  }
  
  &.pending {
    background-color: #fff7e8;
    color: #ff7d00;
  }
  
  &.completed {
    background-color: #e8ffea;
    color: #00b42a;
  }
}

.check-info {
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f7f8fa;
}

.info-row {
  display: flex;
  margin-top: 8rpx;
  
  &:first-child {
    margin-top: 0;
  }
}

.info-label {
  font-size: 24rpx;
  color: #86909c;
}

.info-value {
  font-size: 24rpx;
  color: #1d2129;
}

.check-stats {
  display: flex;
  margin-bottom: 16rpx;
}

.check-stat {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1d2129;
  
  &.success {
    color: #00b42a;
  }
  
  &.warning {
    color: #ff7d00;
  }
}

.stat-text {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.check-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.check-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  border-radius: 32rpx;
  border: 1rpx solid #e5e6eb;
  color: #1d2129;
  
  &.primary {
    background-color: #165dff;
    border-color: #165dff;
    color: #fff;
  }
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

.empty-btn {
  margin-top: 32rpx;
  padding: 20rpx 64rpx;
  background-color: #165dff;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>
