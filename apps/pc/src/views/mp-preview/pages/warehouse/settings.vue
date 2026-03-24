<template>
  <div class="mp-page settings">
    <div class="page-header">
      <div class="header-title">设置</div>
    </div>
    
    <div class="settings-section">
      <div class="section-title">账号安全</div>
      <div class="settings-group">
        <div class="settings-item" @click="handleChangePassword">
          <div class="item-left">
            <icon-lock class="item-icon" />
            <span class="item-text">修改密码</span>
          </div>
          <icon-right class="item-arrow" />
        </div>
        <div class="settings-item" @click="handleBindPhone">
          <div class="item-left">
            <icon-phone class="item-icon" />
            <span class="item-text">绑定手机</span>
          </div>
          <div class="item-right">
            <span class="item-value">138****8888</span>
            <icon-right class="item-arrow" />
          </div>
        </div>
        <div class="settings-item" @click="handleBindEmail">
          <div class="item-left">
            <icon-email class="item-icon" />
            <span class="item-text">绑定邮箱</span>
          </div>
          <div class="item-right">
            <span class="item-value">未绑定</span>
            <icon-right class="item-arrow" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <div class="section-title">通知设置</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="item-left">
            <icon-notification class="item-icon" />
            <span class="item-text">消息推送</span>
          </div>
          <a-switch v-model="settings.pushEnabled" size="small" />
        </div>
        <div class="settings-item">
          <div class="item-left">
            <icon-file class="item-icon" />
            <span class="item-text">订单提醒</span>
          </div>
          <a-switch v-model="settings.orderNotify" size="small" />
        </div>
        <div class="settings-item">
          <div class="item-left">
            <icon-storage class="item-icon" />
            <span class="item-text">库存预警</span>
          </div>
          <a-switch v-model="settings.stockNotify" size="small" />
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <div class="section-title">其他</div>
      <div class="settings-group">
        <div class="settings-item" @click="handleClearCache">
          <div class="item-left">
            <icon-delete class="item-icon" />
            <span class="item-text">清除缓存</span>
          </div>
          <div class="item-right">
            <span class="item-value">{{ cacheSize }}</span>
            <icon-right class="item-arrow" />
          </div>
        </div>
        <div class="settings-item" @click="handleAbout">
          <div class="item-left">
            <icon-info-circle class="item-icon" />
            <span class="item-text">关于我们</span>
          </div>
          <div class="item-right">
            <span class="item-value">v1.0.0</span>
            <icon-right class="item-arrow" />
          </div>
        </div>
        <div class="settings-item" @click="handleFeedback">
          <div class="item-left">
            <icon-message class="item-icon" />
            <span class="item-text">意见反馈</span>
          </div>
          <icon-right class="item-arrow" />
        </div>
        <div class="settings-item" @click="handleHelp">
          <div class="item-left">
            <icon-question-circle class="item-icon" />
            <span class="item-text">帮助中心</span>
          </div>
          <icon-right class="item-arrow" />
        </div>
      </div>
    </div>
    
    <div class="logout-btn" @click="handleLogout">
      退出登录
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>采购市场</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'order')">
        <icon-file />
        <span>订单</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'mine')">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['navigate', 'logout'])

const cacheSize = ref('12.5MB')

const settings = reactive({
  pushEnabled: true,
  orderNotify: true,
  stockNotify: true
})

function handleChangePassword() {
  console.log('修改密码')
}

function handleBindPhone() {
  console.log('绑定手机')
}

function handleBindEmail() {
  console.log('绑定邮箱')
}

function handleClearCache() {
  console.log('清除缓存')
  cacheSize.value = '0MB'
}

function handleAbout() {
  console.log('关于我们')
}

function handleFeedback() {
  console.log('意见反馈')
}

function handleHelp() {
  console.log('帮助中心')
}

function handleLogout() {
  emit('logout')
}
</script>

<style lang="scss" scoped>
.settings {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.settings-section {
  margin: 56px 12px 12px;
  
  &:first-of-type {
    margin-top: 56px;
  }
  
  &:not(:first-of-type) {
    margin-top: 12px;
  }
}

.section-title {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 8px;
  padding-left: 4px;
}

.settings-group {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  border-bottom: 1px solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  font-size: 18px;
  color: #165dff;
  margin-right: 10px;
}

.item-text {
  font-size: 14px;
  color: #1d2129;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: 13px;
  color: #86909c;
  margin-right: 6px;
}

.item-arrow {
  font-size: 14px;
  color: #c9cdd4;
}

.logout-btn {
  margin: 24px 12px;
  text-align: center;
  padding: 14px 0;
  background: #fff;
  border-radius: 8px;
  font-size: 15px;
  color: #f53f3f;
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  border-top: 1px solid #e5e6eb;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #86909c;
  
  &.active {
    color: #165dff;
  }
  
  :deep(.arco-icon) {
    font-size: 20px;
    margin-bottom: 2px;
  }
}
</style>
