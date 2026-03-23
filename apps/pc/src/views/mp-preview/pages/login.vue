<template>
  <div class="mp-page login-page">
    <div class="login-header">
      <div class="logo">
        <icon-storage v-if="currentRole === 'warehouse'" />
        <icon-tool v-else-if="currentRole === 'construction'" />
        <icon-shop v-else-if="currentRole === 'supplier'" />
      </div>
      <div class="title">{{ roleTitle }}</div>
      <div class="subtitle">工程材料管理采供一体化平台</div>
    </div>
    
    <div class="login-form">
      <div class="form-item">
        <div class="form-label">账号名称</div>
        <div class="form-input">
          <icon-user class="input-icon" />
          <input 
            type="text" 
            v-model="formData.username" 
            placeholder="请输入账号名称"
          />
        </div>
      </div>
      
      <div class="form-item">
        <div class="form-label">密码</div>
        <div class="form-input">
          <icon-lock class="input-icon" />
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="formData.password" 
            placeholder="请输入密码"
          />
          <div class="password-toggle" @click="showPassword = !showPassword">
            <icon-eye v-if="showPassword" />
            <icon-eye-invisible v-else />
          </div>
        </div>
      </div>
      
      <div class="form-item remember">
        <label class="checkbox-label">
          <input type="checkbox" v-model="formData.remember" />
          <span>记住账号</span>
        </label>
      </div>
      
      <div class="login-btn" :class="{ disabled: !canSubmit }" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </div>
      
      <div class="login-tips">
        <p>提示：使用后台创建的账号登录</p>
        <p>账号名称和密码由管理员分配</p>
      </div>
    </div>
    
    <div class="login-footer">
      <div class="footer-item" @click="handleForgotPassword">忘记密码？</div>
      <div class="footer-divider">|</div>
      <div class="footer-item" @click="handleContactService">联系客服</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'

const emit = defineEmits(['login'])

const currentRoleRef = inject<any>('currentRole')
const currentRole = computed(() => currentRoleRef?.value || 'warehouse')

const showPassword = ref(false)
const loading = ref(false)

const formData = ref({
  username: '',
  password: '',
  remember: true,
})

const roleTitle = computed(() => {
  const titles: Record<string, string> = {
    'warehouse': '工程仓',
    'construction': '施工方',
    'supplier': '材料供应商',
  }
  return titles[currentRole.value] || '工程仓'
})

const canSubmit = computed(() => {
  return formData.value.username.trim() && formData.value.password.trim() && !loading.value
})

function handleLogin() {
  if (!canSubmit.value) return
  
  loading.value = true
  
  setTimeout(() => {
    loading.value = false
    emit('login', formData.value.username, formData.value.password)
  }, 1000)
}

function handleForgotPassword() {
  
}

function handleContactService() {
  
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100%;
  background: linear-gradient(180deg, #165dff 0%, #4080ff 100%);
  padding: 60px 24px 24px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo {
    width: 72px;
    height: 72px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    
    svg {
      font-size: 36px;
      color: #fff;
    }
  }
  
  .title {
    font-size: 24px;
    color: #fff;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  
  .form-item {
    margin-bottom: 20px;
    
    &.remember {
      margin-bottom: 24px;
    }
  }
  
  .form-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
  
  .form-input {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 0 12px;
    height: 44px;
    
    .input-icon {
      color: #999;
      font-size: 18px;
      margin-right: 8px;
    }
    
    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #333;
      outline: none;
      
      &::placeholder {
        color: #999;
      }
    }
    
    .password-toggle {
      padding: 4px;
      color: #999;
      font-size: 18px;
    }
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #666;
    
    input {
      margin-right: 6px;
    }
  }
  
  .login-btn {
    height: 44px;
    background: #165dff;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    font-weight: 500;
    
    &.disabled {
      background: #ccc;
    }
  }
  
  .login-tips {
    margin-top: 20px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    
    p {
      font-size: 12px;
      color: #999;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  padding-top: 24px;
  
  .footer-item {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .footer-divider {
    margin: 0 16px;
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
