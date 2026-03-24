<template>
  <view class="page">
    <view class="logo-section">
      <text class="logo">🏗️</text>
      <text class="title">工程仓管理端</text>
      <text class="subtitle">扫码登录或账号密码登录</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <text class="form-icon">📱</text>
        <input 
          type="text" 
          v-model="phone" 
          placeholder="请输入手机号" 
          class="form-input"
        />
      </view>
      <view class="form-item">
        <text class="form-icon">🔒</text>
        <input 
          :type="showPassword ? 'text' : 'password'" 
          v-model="password" 
          placeholder="请输入密码" 
          class="form-input"
        />
        <text class="toggle-pwd" @click="showPassword = !showPassword">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
      </view>
      
      <view class="login-btn" @click="handleLogin">登录</view>
      
      <view class="other-login">
        <view class="divider">
          <text class="divider-text">其他登录方式</text>
        </view>
        <view class="login-methods">
          <view class="method-item" @click="handleScanLogin">
            <text class="method-icon">📷</text>
            <text class="method-text">扫码登录</text>
          </view>
          <view class="method-item" @click="handleSmsLogin">
            <text class="method-icon">💬</text>
            <text class="method-text">短信登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const phone = ref('')
const password = ref('')
const showPassword = ref(false)

function handleLogin() {
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '登录中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.switchTab({ url: '/pages/index/index' })
  }, 1000)
}

function handleScanLogin() {
  uni.showToast({ title: '扫码登录', icon: 'none' })
}

function handleSmsLogin() {
  uni.showToast({ title: '短信登录', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #fff;
  padding: 0 48rpx;
}

.logo-section {
  padding-top: 120rpx;
  text-align: center;
}

.logo {
  font-size: 100rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
  margin-top: 24rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #86909c;
  display: block;
  margin-top: 12rpx;
}

.login-form {
  margin-top: 80rpx;
}

.form-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.form-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
}

.toggle-pwd {
  font-size: 36rpx;
  padding: 16rpx;
}

.login-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
  margin-top: 48rpx;
}

.other-login {
  margin-top: 80rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1rpx;
    background-color: #e5e6eb;
  }
}

.divider-text {
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #86909c;
}

.login-methods {
  display: flex;
  justify-content: center;
  gap: 80rpx;
}

.method-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.method-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.method-text {
  font-size: 26rpx;
  color: #1d2129;
}
</style>
