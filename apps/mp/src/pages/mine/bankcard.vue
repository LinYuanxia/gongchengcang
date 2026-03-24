<template>
  <view class="page">
    <view class="header-tip">
      <text class="tip-icon">💡</text>
      <text class="tip-text">最多可绑定5张银行卡，提现时请选择已验证的银行卡</text>
    </view>

    <view class="bank-list">
      <view class="bank-item" v-for="item in bankCards" :key="item.id">
        <view class="bank-main">
          <view class="bank-icon" :style="{ backgroundColor: item.bgColor }">{{ item.bankName.charAt(0) }}</view>
          <view class="bank-info">
            <view class="bank-header">
              <text class="bank-name">{{ item.bankName }}</text>
              <text class="bank-type">{{ item.cardType }}</text>
            </view>
            <text class="bank-account">{{ item.accountNo }}</text>
            <view class="bank-status">
              <text class="status-tag" :class="item.status">{{ item.statusText }}</text>
              <text class="default-tag" v-if="item.isDefault">默认</text>
            </view>
          </view>
        </view>
        <view class="bank-footer">
          <view class="bank-actions">
            <view class="action-btn" v-if="!item.isDefault && item.status === 'verified'" @click="handleSetDefault(item)">设为默认</view>
            <view class="action-btn" v-if="item.status === 'pending'" @click="handleVerify(item)">验证</view>
            <view class="action-btn" v-if="item.status === 'verified'" @click="handleUnbind(item)">解绑</view>
          </view>
        </view>
      </view>
    </view>

    <view class="add-btn" v-if="bankCards.length < 5" @click="handleAdd">
      <text class="add-icon">+</text>
      <text class="add-text">添加银行卡</text>
    </view>

    <view class="section">
      <view class="section-title">绑定说明</view>
      <view class="desc-list">
        <view class="desc-item">
          <text class="desc-dot">1.</text>
          <text class="desc-text">银行卡持卡人姓名需与企业认证信息一致</text>
        </view>
        <view class="desc-item">
          <text class="desc-dot">2.</text>
          <text class="desc-text">绑定后需进行小额打款验证，验证成功后可用于提现</text>
        </view>
        <view class="desc-item">
          <text class="desc-dot">3.</text>
          <text class="desc-text">解绑银行卡后，相关提现记录仍可查看</text>
        </view>
      </view>
    </view>

    <view class="popup" v-if="showAddPopup" @click="showAddPopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">添加银行卡</text>
          <text class="popup-close" @click="showAddPopup = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">持卡人</text>
            <input type="text" v-model="formData.holderName" placeholder="持卡人姓名" class="form-input" disabled />
          </view>
          <view class="form-item">
            <text class="form-label">开户银行</text>
            <picker mode="selector" :range="bankOptions" range-key="name" @change="handleBankChange">
              <view class="form-picker">
                <text class="picker-value" :class="{ placeholder: !formData.bankName }">
                  {{ formData.bankName || '请选择开户银行' }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">银行卡号</text>
            <input type="number" v-model="formData.accountNo" placeholder="请输入银行卡号" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">开户支行</text>
            <input type="text" v-model="formData.branch" placeholder="请输入开户支行名称" class="form-input" />
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @click="showAddPopup = false">取消</view>
          <view class="popup-btn confirm" @click="handleConfirm">确认绑定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showAddPopup = ref(false)

const formData = ref({
  holderName: '深圳湾科技园项目仓',
  bankName: '',
  accountNo: '',
  branch: '',
})

const bankOptions = ref([
  { id: 1, name: '招商银行' },
  { id: 2, name: '工商银行' },
  { id: 3, name: '建设银行' },
  { id: 4, name: '农业银行' },
  { id: 5, name: '中国银行' },
  { id: 6, name: '交通银行' },
  { id: 7, name: '浦发银行' },
  { id: 8, name: '民生银行' },
])

const bankCards = ref([
  {
    id: 'b1',
    bankName: '招商银行',
    cardType: '储蓄卡',
    accountNo: '**** **** **** 8888',
    status: 'verified',
    statusText: '已验证',
    isDefault: true,
    bgColor: '#e8f3ff',
  },
  {
    id: 'b2',
    bankName: '工商银行',
    cardType: '储蓄卡',
    accountNo: '**** **** **** 6666',
    status: 'pending',
    statusText: '待验证',
    isDefault: false,
    bgColor: '#fff7e8',
  },
])

function handleBankChange(e: any) {
  formData.value.bankName = bankOptions.value[e.detail.value].name
}

function handleAdd() {
  formData.value = {
    holderName: '深圳湾科技园项目仓',
    bankName: '',
    accountNo: '',
    branch: '',
  }
  showAddPopup.value = true
}

function handleSetDefault(item: any) {
  uni.showModal({
    title: '设为默认',
    content: `确定将 ${item.bankName} 尾号 ${item.accountNo.slice(-4)} 设为默认银行卡吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '设置成功', icon: 'success' })
      }
    },
  })
}

function handleVerify(item: any) {
  uni.showModal({
    title: '验证银行卡',
    content: '平台将向该银行卡转入0.01-0.99元，请查看银行流水后输入收到的金额完成验证',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已发起验证', icon: 'success' })
      }
    },
  })
}

function handleUnbind(item: any) {
  uni.showModal({
    title: '解绑银行卡',
    content: `确定解绑 ${item.bankName} 尾号 ${item.accountNo.slice(-4)} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已解绑', icon: 'success' })
      }
    },
  })
}

function handleConfirm() {
  if (!formData.value.bankName) {
    uni.showToast({ title: '请选择开户银行', icon: 'none' })
    return
  }
  if (!formData.value.accountNo) {
    uni.showToast({ title: '请输入银行卡号', icon: 'none' })
    return
  }
  if (!formData.value.branch) {
    uni.showToast({ title: '请输入开户支行', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '确认绑定',
    content: '绑定后需进行小额打款验证，验证成功后可用于提现',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '绑定成功', icon: 'success' })
        showAddPopup.value = false
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.header-tip {
  display: flex;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 16rpx 20rpx;
  background-color: #fff7e8;
  border-radius: 12rpx;
}

.tip-icon {
  margin-right: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #ff7d00;
}

.bank-list {
  padding: 0 32rpx;
}

.bank-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.bank-main {
  display: flex;
}

.bank-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #165dff;
  font-weight: 600;
  flex-shrink: 0;
}

.bank-info {
  flex: 1;
  margin-left: 20rpx;
}

.bank-header {
  display: flex;
  align-items: center;
}

.bank-name {
  font-size: 30rpx;
  color: #1d2129;
  font-weight: 500;
}

.bank-type {
  font-size: 22rpx;
  color: #86909c;
  margin-left: 12rpx;
}

.bank-account {
  font-size: 28rpx;
  color: #1d2129;
  margin-top: 8rpx;
  display: block;
  letter-spacing: 2rpx;
}

.bank-status {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  
  &.verified {
    color: #00b42a;
    background-color: #e8ffea;
  }
  
  &.pending {
    color: #ff7d00;
    background-color: #fff7e8;
  }
}

.default-tag {
  font-size: 22rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-left: 12rpx;
}

.bank-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.bank-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 24rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  border: 2rpx dashed #c9cdd4;
}

.add-icon {
  font-size: 36rpx;
  color: #165dff;
  margin-right: 8rpx;
}

.add-text {
  font-size: 28rpx;
  color: #165dff;
}

.section {
  margin: 0 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.desc-list {
  padding: 16rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.desc-item {
  display: flex;
  align-items: flex-start;
  padding: 8rpx 0;
}

.desc-dot {
  color: #86909c;
  margin-right: 8rpx;
}

.desc-text {
  font-size: 24rpx;
  color: #86909c;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.popup-content {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 500;
}

.popup-close {
  font-size: 32rpx;
  color: #86909c;
}

.popup-body {
  padding: 24rpx 32rpx;
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

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.picker-value {
  font-size: 28rpx;
  color: #1d2129;
  
  &.placeholder {
    color: #c9cdd4;
  }
}

.picker-arrow {
  font-size: 20rpx;
  color: #86909c;
}

.popup-footer {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.popup-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
  
  &.cancel {
    color: #666;
    background-color: #f7f8fa;
  }
  
  &.confirm {
    color: #fff;
    background-color: #165dff;
  }
}
</style>
