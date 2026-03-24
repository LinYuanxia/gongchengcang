<template>
  <view class="page">
    <view class="balance-card">
      <text class="balance-label">当前余额</text>
      <text class="balance-value">¥{{ balance }}</text>
      <text class="balance-frozen">冻结金额: ¥{{ frozenAmount }}</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">充值金额</text>
        <view class="amount-input-wrap">
          <text class="currency">¥</text>
          <input 
            type="digit" 
            v-model="amount" 
            placeholder="请输入充值金额" 
            class="amount-input"
          />
        </view>
      </view>

      <view class="quick-amount">
        <text class="quick-label">快捷金额</text>
        <view class="quick-list">
          <view 
            class="quick-item" 
            :class="{ active: amount === item }"
            v-for="item in quickAmounts" 
            :key="item"
            @click="amount = item"
          >
            ¥{{ item }}
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">充值方式</text>
        <view class="payment-list">
          <view 
            class="payment-item" 
            :class="{ active: paymentMethod === 'bank' }"
            @click="paymentMethod = 'bank'"
          >
            <text class="payment-icon">🏦</text>
            <view class="payment-info">
              <text class="payment-name">银行转账</text>
              <text class="payment-desc">对公账户转账，1-3个工作日到账</text>
            </view>
            <view class="payment-check">
              <view class="check-dot" v-if="paymentMethod === 'bank'"></view>
            </view>
          </view>
          <view 
            class="payment-item" 
            :class="{ active: paymentMethod === 'alipay' }"
            @click="paymentMethod = 'alipay'"
          >
            <text class="payment-icon">💳</text>
            <view class="payment-info">
              <text class="payment-name">支付宝</text>
              <text class="payment-desc">即时到账</text>
            </view>
            <view class="payment-check">
              <view class="check-dot" v-if="paymentMethod === 'alipay'"></view>
            </view>
          </view>
          <view 
            class="payment-item" 
            :class="{ active: paymentMethod === 'wechat' }"
            @click="paymentMethod = 'wechat'"
          >
            <text class="payment-icon">💬</text>
            <view class="payment-info">
              <text class="payment-name">微信支付</text>
              <text class="payment-desc">即时到账</text>
            </view>
            <view class="payment-check">
              <view class="check-dot" v-if="paymentMethod === 'wechat'"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bank-info" v-if="paymentMethod === 'bank'">
      <view class="info-title">对公账户信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">开户银行</text>
          <text class="info-value">招商银行深圳分行</text>
        </view>
        <view class="info-item">
          <text class="info-label">银行账号</text>
          <view class="info-value-wrap">
            <text class="info-value">7559 0123 4567 8901</text>
            <text class="copy-btn" @click="handleCopy('7559012345678901')">复制</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">收款户名</text>
          <text class="info-value">工程仓平台运营有限公司</text>
        </view>
      </view>
      <view class="info-tip">
        <text class="tip-icon">💡</text>
        <text class="tip-text">转账时请备注您的企业ID，以便快速到账</text>
      </view>
    </view>

    <view class="submit-btn" @click="handleSubmit">
      <text class="btn-text">确认充值</text>
    </view>

    <view class="records-link" @click="handleNavigate('/pages/mine/custody')">
      <text class="link-text">查看充值记录</text>
      <text class="link-arrow">></text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const balance = ref('158,520.00')
const frozenAmount = ref('12,000.00')
const amount = ref('')
const paymentMethod = ref('bank')
const quickAmounts = ref([1000, 5000, 10000, 50000])

function handleCopy(text: string) {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    },
  })
}

function handleSubmit() {
  if (!amount.value) {
    uni.showToast({ title: '请输入充值金额', icon: 'none' })
    return
  }
  
  const amountNum = parseFloat(amount.value)
  if (amountNum <= 0) {
    uni.showToast({ title: '充值金额必须大于0', icon: 'none' })
    return
  }
  
  if (paymentMethod.value === 'bank') {
    uni.showModal({
      title: '银行转账充值',
      content: '请按照上方账户信息进行转账，转账成功后1-3个工作日到账',
      showCancel: false,
    })
  } else {
    uni.showModal({
      title: '确认充值',
      content: `确定充值 ¥${amount.value} 吗？`,
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: '充值成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      },
    })
  }
}

function handleNavigate(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.balance-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 48rpx 32rpx;
  color: #fff;
}

.balance-label {
  font-size: 26rpx;
  opacity: 0.9;
  display: block;
}

.balance-value {
  font-size: 56rpx;
  font-weight: 600;
  display: block;
  margin: 12rpx 0;
}

.balance-frozen {
  font-size: 24rpx;
  opacity: 0.8;
}

.form-section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.currency {
  font-size: 36rpx;
  color: #1d2129;
  font-weight: 600;
  margin-right: 12rpx;
}

.amount-input {
  flex: 1;
  font-size: 36rpx;
  font-weight: 600;
}

.quick-amount {
  margin-bottom: 24rpx;
}

.quick-label {
  font-size: 26rpx;
  color: #86909c;
  display: block;
  margin-bottom: 16rpx;
}

.quick-list {
  display: flex;
  gap: 16rpx;
}

.quick-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  background-color: #f7f8fa;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #1d2129;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
    border: 2rpx solid #165dff;
  }
}

.payment-list {
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #f0f0f0;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    background-color: #f7f8fa;
  }
}

.payment-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.payment-info {
  flex: 1;
}

.payment-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.payment-desc {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.payment-check {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-dot {
  width: 24rpx;
  height: 24rpx;
  background-color: #165dff;
  border-radius: 50%;
}

.bank-info {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.info-list {
  padding: 16rpx 0;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #86909c;
}

.info-value {
  font-size: 26rpx;
  color: #1d2129;
}

.info-value-wrap {
  display: flex;
  align-items: center;
}

.copy-btn {
  font-size: 22rpx;
  color: #165dff;
  margin-left: 16rpx;
  padding: 4rpx 12rpx;
  background-color: #e8f3ff;
  border-radius: 4rpx;
}

.info-tip {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding: 16rpx;
  background-color: #fff7e8;
  border-radius: 8rpx;
}

.tip-icon {
  margin-right: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #ff7d00;
}

.submit-btn {
  margin: 48rpx 32rpx 24rpx;
  padding: 28rpx 0;
  background-color: #165dff;
  border-radius: 12rpx;
  text-align: center;
}

.btn-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.records-link {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx;
}

.link-text {
  font-size: 28rpx;
  color: #165dff;
}

.link-arrow {
  font-size: 28rpx;
  color: #165dff;
  margin-left: 8rpx;
}
</style>
