<template>
  <view class="page">
    <view class="section">
      <view class="section-title">账号安全</view>
      <view class="menu-group">
        <view class="menu-item" @click="handleChangePwd">
          <view class="menu-left">
            <text class="menu-icon">🔐</text>
            <text class="menu-text">修改密码</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleBindPhone">
          <view class="menu-left">
            <text class="menu-icon">📱</text>
            <text class="menu-text">绑定手机</text>
            <text class="menu-value">{{ phone }}</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-text">消息通知</text>
          </view>
          <switch :checked="notificationEnabled" @change="handleToggleNotification" color="#165dff" />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">通用设置</view>
      <view class="menu-group">
        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">🌐</text>
            <text class="menu-text">语言</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">简体中文</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">🎨</text>
            <text class="menu-text">主题模式</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">跟随系统</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
        <view class="menu-item" @click="handleClearCache">
          <view class="menu-left">
            <text class="menu-icon">🗑️</text>
            <text class="menu-text">清除缓存</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">{{ cacheSize }}</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">关于</view>
      <view class="menu-group">
        <view class="menu-item" @click="handleCheckUpdate">
          <view class="menu-left">
            <text class="menu-icon">🔄</text>
            <text class="menu-text">检查更新</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">v1.0.0</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
        <view class="menu-item" @click="handleNavigate('/pages/mine/about')">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-text">关于我们</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleNavigate('/pages/mine/help')">
          <view class="menu-left">
            <text class="menu-icon">❓</text>
            <text class="menu-text">帮助中心</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleNavigate('/pages/mine/privacy')">
          <view class="menu-left">
            <text class="menu-icon">📋</text>
            <text class="menu-text">隐私政策</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleNavigate('/pages/mine/agreement')">
          <view class="menu-left">
            <text class="menu-icon">📜</text>
            <text class="menu-text">用户协议</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">其他</view>
      <view class="menu-group">
        <view class="menu-item" @click="handleFeedback">
          <view class="menu-left">
            <text class="menu-icon">💬</text>
            <text class="menu-text">意见反馈</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleContactService">
          <view class="menu-left">
            <text class="menu-icon">📞</text>
            <text class="menu-text">联系客服</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">400-888-8888</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <view class="logout-btn" @click="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>

    <view class="version-info">
      <text>工程仓端 v1.0.0</text>
    </view>

    <view class="popup" v-if="showPwdPopup" @click="showPwdPopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">修改密码</text>
          <text class="popup-close" @click="showPwdPopup = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">原密码</text>
            <input type="password" v-model="pwdForm.oldPwd" placeholder="请输入原密码" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">新密码</text>
            <input type="password" v-model="pwdForm.newPwd" placeholder="请输入新密码" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">确认密码</text>
            <input type="password" v-model="pwdForm.confirmPwd" placeholder="请再次输入新密码" class="form-input" />
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @click="showPwdPopup = false">取消</view>
          <view class="popup-btn confirm" @click="handleConfirmPwd">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const phone = ref('138****8888')
const notificationEnabled = ref(true)
const cacheSize = ref('23.5MB')
const showPwdPopup = ref(false)

const pwdForm = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
})

function handleChangePwd() {
  pwdForm.value = { oldPwd: '', newPwd: '', confirmPwd: '' }
  showPwdPopup.value = true
}

function handleConfirmPwd() {
  if (!pwdForm.value.oldPwd) {
    uni.showToast({ title: '请输入原密码', icon: 'none' })
    return
  }
  if (!pwdForm.value.newPwd) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  if (pwdForm.value.newPwd !== pwdForm.value.confirmPwd) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  
  uni.showToast({ title: '密码修改成功', icon: 'success' })
  showPwdPopup.value = false
}

function handleBindPhone() {
  uni.showToast({ title: '绑定手机', icon: 'none' })
}

function handleToggleNotification(e: any) {
  notificationEnabled.value = e.detail.value
  uni.showToast({ title: notificationEnabled.value ? '已开启通知' : '已关闭通知', icon: 'none' })
}

function handleClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        cacheSize.value = '0KB'
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    },
  })
}

function handleCheckUpdate() {
  uni.showLoading({ title: '检查中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showModal({
      title: '检查更新',
      content: '当前已是最新版本',
      showCancel: false,
    })
  }, 1500)
}

function handleNavigate(path: string) {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function handleFeedback() {
  uni.showToast({ title: '意见反馈', icon: 'none' })
}

function handleContactService() {
  uni.makePhoneCall({
    phoneNumber: '4008888888',
    fail: () => {
      uni.showToast({ title: '拨号失败', icon: 'none' })
    },
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/login/index' })
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

.section {
  margin: 24rpx 32rpx;
}

.section-title {
  font-size: 26rpx;
  color: #86909c;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.menu-group {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #1d2129;
}

.menu-value {
  font-size: 26rpx;
  color: #86909c;
  margin-left: 16rpx;
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-arrow {
  color: #c9cdd4;
  font-size: 28rpx;
  margin-left: 12rpx;
}

.logout-btn {
  margin: 48rpx 32rpx 24rpx;
  text-align: center;
  padding: 28rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
}

.logout-text {
  font-size: 30rpx;
  color: #f53f3f;
}

.version-info {
  text-align: center;
  padding: 24rpx 0;
  font-size: 22rpx;
  color: #c9cdd4;
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
