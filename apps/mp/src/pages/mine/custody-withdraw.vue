<template>
  <view class="page">
    <view class="balance-card">
      <text class="balance-label">可提现余额</text>
      <text class="balance-value">¥{{ availableBalance }}</text>
      <text class="balance-frozen">冻结金额: ¥{{ frozenAmount }}</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">提现金额</text>
        <view class="amount-input-wrap">
          <text class="currency">¥</text>
          <input 
            type="digit" 
            v-model="amount" 
            placeholder="请输入提现金额" 
            class="amount-input"
          />
          <text class="all-btn" @click="handleAll">全部</text>
        </view>
        <text class="amount-tip">可提现金额: ¥{{ availableBalance }}</text>
      </view>

      <view class="form-item">
        <text class="form-label">提现账户</text>
        <view class="bank-list">
          <view 
            class="bank-item" 
            :class="{ active: selectedBank === item.id }"
            v-for="item in bankCards" 
            :key="item.id"
            @click="selectedBank = item.id"
          >
            <view class="bank-icon">{{ item.bankName.charAt(0) }}</view>
            <view class="bank-info">
              <text class="bank-name">{{ item.bankName }}</text>
              <text class="bank-account">{{ item.accountNo }}</text>
            </view>
            <view class="bank-check">
              <view class="check-dot" v-if="selectedBank === item.id"></view>
            </view>
          </view>
        </view>
        <view class="add-bank" @click="handleNavigate('/pages/mine/bankcard')">
          <text class="add-icon">+</text>
          <text class="add-text">添加银行卡</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">提现说明</text>
        <view class="desc-list">
          <view class="desc-item">
            <text class="desc-dot">•</text>
            <text class="desc-text">提现金额将在1-3个工作日内到账</text>
          </view>
          <view class="desc-item">
            <text class="desc-dot">•</text>
            <text class="desc-text">单笔提现限额: 50万元</text>
          </view>
          <view class="desc-item">
            <text class="desc-dot">•</text>
            <text class="desc-text">每日提现次数: 不限</text>
          </view>
          <view class="desc-item">
            <text class="desc-dot">•</text>
            <text class="desc-text">提现手续费: 免费</text>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="handleSubmit">
      <text class="btn-text">确认提现</text>
    </view>

    <view class="records-link" @click="handleNavigate('/pages/mine/custody')">
      <text class="link-text">查看提现记录</text>
      <text class="link-arrow">></text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const availableBalance = ref('146,520.00')
const frozenAmount = ref('12,000.00')
const amount = ref('')
const selectedBank = ref('bank1')

const bankCards = ref([
  { id: 'bank1', bankName: '招商银行', accountNo: '**** **** **** 8888' },
  { id: 'bank2', bankName: '工商银行', accountNo: '**** **** **** 6666' },
])

function handleAll() {
  amount.value = availableBalance.value.replace(/,/g, '')
}

function handleSubmit() {
  if (!amount.value) {
    uni.showToast({ title: '请输入提现金额', icon: 'none' })
    return
  }
  
  const amountNum = parseFloat(amount.value)
  const maxAmount = parseFloat(availableBalance.value.replace(/,/g, ''))
  
  if (amountNum <= 0) {
    uni.showToast({ title: '提现金额必须大于0', icon: 'none' })
    return
  }
  
  if (amountNum > maxAmount) {
    uni.showToast({ title: '提现金额超出可提现余额', icon: 'none' })
    return
  }
  
  if (!selectedBank.value) {
    uni.showToast({ title: '请选择提现账户', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '确认提现',
    content: `确定提现 ¥${amount.value} 到所选银行卡吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '提现申请已提交', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
  })
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
  margin-bottom: 32rpx;
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

.all-btn {
  font-size: 26rpx;
  color: #165dff;
  padding: 8rpx 16rpx;
  background-color: #e8f3ff;
  border-radius: 8rpx;
}

.amount-tip {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 12rpx;
  display: block;
}

.bank-list {
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #f0f0f0;
}

.bank-item {
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

.bank-icon {
  width: 64rpx;
  height: 64rpx;
  background-color: #e8f3ff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #165dff;
  font-weight: 600;
  margin-right: 16rpx;
}

.bank-info {
  flex: 1;
}

.bank-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.bank-account {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.bank-check {
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

.add-bank {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  margin-top: 16rpx;
  border: 2rpx dashed #c9cdd4;
  border-radius: 12rpx;
}

.add-icon {
  font-size: 32rpx;
  color: #165dff;
  margin-right: 8rpx;
}

.add-text {
  font-size: 28rpx;
  color: #165dff;
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
