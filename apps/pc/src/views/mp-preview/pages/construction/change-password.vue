<template>
  <div class="mp-page change-password">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">修改密码</div>
    </div>
    
    <div class="form-content">
      <div class="form-item">
        <div class="form-label">原密码</div>
        <input 
          class="form-input" 
          type="password"
          v-model="formData.oldPassword"
          placeholder="请输入原密码"
          maxlength="20"
        />
      </div>
      
      <div class="form-item">
        <div class="form-label">新密码</div>
        <input 
          class="form-input" 
          type="password"
          v-model="formData.newPassword"
          placeholder="请输入6-20位新密码"
          maxlength="20"
        />
        <div class="form-tip">密码长度6-20位，需包含字母和数字</div>
      </div>
      
      <div class="form-item">
        <div class="form-label">确认新密码</div>
        <input 
          class="form-input" 
          type="password"
          v-model="formData.confirmPassword"
          placeholder="请再次输入新密码"
          maxlength="20"
        />
      </div>
    </div>
    
    <div class="submit-btn" :class="{ disabled: !isFormValid }" @click="handleSubmit">
      确认修改
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits(['navigate'])

const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isFormValid = computed(() => {
  return formData.value.oldPassword && 
         formData.value.newPassword && 
         formData.value.confirmPassword &&
         formData.value.newPassword === formData.value.confirmPassword &&
         formData.value.newPassword.length >= 6
})

function handleBack() {
  emit('navigate', 'settings')
}

function handleSubmit() {
  if (!isFormValid.value) {
    return
  }
  
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    Message.error('两次输入密码不一致')
    return
  }
  
  Message.success('密码修改成功，请重新登录')
  setTimeout(() => {
    emit('navigate', 'settings')
  }, 1000)
}
</script>

<style lang="scss" scoped>
.change-password {
  background: #f5f5f5;
  min-height: 100%;
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
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid #eee;
  
  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: #4e5969;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
}

.form-content {
  margin-top: 54px;
  background: #fff;
  padding: 0 16px;
}

.form-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .form-label {
    font-size: 14px;
    color: #1d2129;
    margin-bottom: 10px;
  }
  
  .form-input {
    width: 100%;
    height: 40px;
    font-size: 15px;
    color: #1d2129;
    border: none;
    outline: none;
    
    &::placeholder {
      color: #c9cdd4;
    }
  }
  
  .form-tip {
    font-size: 11px;
    color: #86909c;
    margin-top: 8px;
  }
}

.submit-btn {
  margin: 24px 16px;
  padding: 14px 0;
  background: linear-gradient(135deg, #165dff, #4080ff);
  color: #fff;
  text-align: center;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  
  &.disabled {
    opacity: 0.5;
  }
}
</style>
