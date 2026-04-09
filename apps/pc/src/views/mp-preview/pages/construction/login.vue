<template>
  <div class="mp-page login">
    <div class="login-header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div class="title">工程仓管理系统</div>
      <div class="subtitle">施工方端</div>
    </div>
    
    <div class="login-form">
      <div class="form-item">
        <div class="input-wrapper">
          <icon-user class="input-icon" />
          <input 
            v-model="formData.username" 
            type="text" 
            placeholder="请输入账号" 
            class="form-input"
            @keyup.enter="handleLogin"
          />
        </div>
      </div>
      
      <div class="form-item">
        <div class="input-wrapper">
          <icon-lock class="input-icon" />
          <input 
            v-model="formData.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码" 
            class="form-input"
            @keyup.enter="handleLogin"
          />
          <div class="password-toggle" @click="showPassword = !showPassword">
            <icon-eye v-if="!showPassword" />
            <icon-eye-close v-else />
          </div>
        </div>
      </div>
      
      <div class="form-item">
        <div class="select-wrapper" @click="showStoreSelect = true">
          <icon-building class="input-icon" />
          <span class="select-placeholder" :class="{ selected: selectedStore }">
            {{ selectedStore ? selectedStore.name : '请选择门店' }}
          </span>
          <icon-down class="select-arrow" />
        </div>
      </div>
      
      <div class="login-btn" @click="handleLogin" :class="{ loading: submitting }">
        {{ submitting ? '登录中...' : '登 录' }}
      </div>
    </div>
    
    <div class="select-modal" v-if="showStoreSelect">
      <div class="modal-mask" @click="showStoreSelect = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">选择门店</span>
          <span class="modal-close" @click="showStoreSelect = false">取消</span>
        </div>
        <div class="store-list">
          <div 
            class="store-item" 
            :class="{ active: selectedStore && selectedStore.id === store.id }"
            v-for="store in storeList" 
            :key="store.id"
            @click="handleSelectStore(store)"
          >
            <div class="store-name">{{ store.name }}</div>
            <div class="store-code">{{ store.code }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['login'])

const formData = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const submitting = ref(false)
const showStoreSelect = ref(false)
const selectedStore = ref<any>(null)

const storeList = ref([
  { id: 1, name: '深圳万象城店', code: 'CD001' },
  { id: 2, name: '广州天河城店', code: 'CD002' },
  { id: 3, name: '东莞万达店', code: 'CD003' },
  { id: 4, name: '佛山万科店', code: 'CD004' },
])

function handleSelectStore(store: any) {
  selectedStore.value = store
  showStoreSelect.value = false
}

function handleLogin() {
  if (!formData.value.username) {
    alert('请输入账号')
    return
  }
  if (!formData.value.password) {
    alert('请输入密码')
    return
  }
  if (!selectedStore.value) {
    alert('请选择门店')
    return
  }
  
  submitting.value = true
  
  setTimeout(() => {
    submitting.value = false
    emit('login', {
      ...formData.value,
      storeId: selectedStore.value.id,
      storeName: selectedStore.value.name,
      storeCode: selectedStore.value.code
    })
  }, 1000)
}
</script>

<style lang="scss" scoped>
.login {
  background: linear-gradient(180deg, #f0f5ff 0%, #fff 100%);
  min-height: 100vh;
  padding: 20px;
}

.login-header {
  padding: 60px 0 40px;
  text-align: center;
  
  .logo {
    width: 70px;
    height: 70px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    
    svg {
      width: 36px;
      height: 36px;
    }
  }
  
  .title {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 6px;
  }
  
  .subtitle {
    font-size: 14px;
    color: #86909c;
  }
}

.login-form {
  .form-item {
    margin-bottom: 16px;
    
    .input-wrapper {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      padding: 0 14px;
      height: 50px;
      transition: all 0.3s;
      
      &:focus-within {
        border-color: #165dff;
        box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
      }
      
      .input-icon {
        color: #86909c;
        font-size: 18px;
        margin-right: 10px;
      }
      
      .form-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 15px;
        color: #1d2129;
        outline: none;
        
        &::placeholder {
          color: #c9cdd4;
        }
      }
      
      .password-toggle {
        color: #86909c;
        font-size: 18px;
      }
    }
    
    .select-wrapper {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      padding: 0 14px;
      height: 50px;
      
      .input-icon {
        color: #86909c;
        font-size: 18px;
        margin-right: 10px;
      }
      
      .select-placeholder {
        flex: 1;
        font-size: 15px;
        
        &:not(.selected) {
          color: #c9cdd4;
        }
        
        &.selected {
          color: #1d2129;
        }
      }
      
      .select-arrow {
        color: #c9cdd4;
        font-size: 14px;
      }
    }
  }
  
  .login-btn {
    height: 50px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    color: #fff;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    margin-top: 30px;
    transition: all 0.3s;
    
    &:active {
      transform: scale(0.98);
    }
    
    &.loading {
      opacity: 0.7;
    }
  }
}

.select-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f2f3f5;
      
      .modal-title {
        font-size: 16px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .modal-close {
        font-size: 14px;
        color: #86909c;
      }
    }
    
    .store-list {
      flex: 1;
      overflow-y: auto;
      
      .store-item {
        padding: 14px 16px;
        border-bottom: 1px solid #f2f3f5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        &.active {
          background: #f0f5ff;
          
          .store-name {
            color: #165dff;
            font-weight: 500;
          }
        }
        
        .store-name {
          font-size: 15px;
          color: #1d2129;
        }
        
        .store-code {
          font-size: 12px;
          color: #86909c;
          background: #f7f8fa;
          padding: 2px 8px;
          border-radius: 10px;
        }
      }
    }
  }
}
</style>
