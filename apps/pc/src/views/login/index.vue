<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <div class="brand-section">
          <div class="brand-icon">
            <icon-apps :size="32" />
          </div>
          <div class="brand-info">
            <h1 class="brand-title">工程材料管理</h1>
            <p class="brand-subtitle">采供一体化平台</p>
          </div>
        </div>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon"><icon-check-circle-fill /></div>
            <div class="feature-text">
              <h4>多端协同</h4>
              <p>平台、供应商、施工方、工程仓多端联动</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><icon-check-circle-fill /></div>
            <div class="feature-text">
              <h4>资金托管</h4>
              <p>安全可靠的资金监管体系</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><icon-check-circle-fill /></div>
            <div class="feature-text">
              <h4>智能分账</h4>
              <p>灵活配置的分账规则引擎</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><icon-check-circle-fill /></div>
            <div class="feature-text">
              <h4>仓储管理</h4>
              <p>全链路库存追溯与管理</p>
            </div>
          </div>
        </div>
        <div class="brand-footer">
          <p>© 2024 鸣鸣很忙集团 版权所有</p>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-wrapper">
          <div class="login-header">
            <h2>欢迎登录</h2>
            <p>工程材料管理采供一体化平台</p>
          </div>

          <div class="platform-section">
            <div class="platform-label">选择登录端</div>
            <div class="platform-grid">
              <div
                :class="['platform-item', { active: currentPlatform === 'platform' }]"
                @click="currentPlatform = 'platform'"
              >
                <div class="platform-icon">
                  <icon-apps :size="24" />
                </div>
                <span class="platform-name">平台端</span>
              </div>
              <div
                :class="['platform-item', { active: currentPlatform === 'supplier' }]"
                @click="currentPlatform = 'supplier'"
              >
                <div class="platform-icon">
                  <icon-bookmark :size="24" />
                </div>
                <span class="platform-name">供应商端</span>
              </div>
              <div
                :class="['platform-item', { active: currentPlatform === 'constructor' }]"
                @click="currentPlatform = 'constructor'"
              >
                <div class="platform-icon">
                  <icon-tool :size="24" />
                </div>
                <span class="platform-name">施工方端</span>
              </div>
              <div
                :class="['platform-item', { active: currentPlatform === 'warehouse' }]"
                @click="currentPlatform = 'warehouse'"
              >
                <div class="platform-icon">
                  <icon-storage :size="24" />
                </div>
                <span class="platform-name">工程仓端</span>
              </div>
            </div>
          </div>

          <a-form
            :model="form"
            :rules="rules"
            layout="vertical"
            @submit-success="handleSubmit"
            class="login-form"
          >
            <a-form-item field="username" hide-label>
              <a-input
                v-model="form.username"
                placeholder="请输入用户名/手机号"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <icon-user />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item field="password" hide-label>
              <a-input-password
                v-model="form.password"
                placeholder="请输入密码"
                size="large"
                allow-clear
              >
                <template #prefix>
                  <icon-lock />
                </template>
              </a-input-password>
            </a-form-item>
            <div class="form-extra">
              <a-checkbox v-model="rememberMe">记住登录</a-checkbox>
              <a-link>忘记密码?</a-link>
            </div>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                long
                :loading="loading"
              >
                登 录
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import { setLocal } from '@gongchengcang/utils'
import type { LoginParams } from '@gongchengcang/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const rememberMe = ref(false)
const currentPlatform = ref('platform')

const form = reactive<LoginParams>({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名或手机号' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function handleSubmit() {
  loading.value = true
  try {
    setLocal('currentPlatform', currentPlatform.value)
    await userStore.loginAction(form)
    await userStore.getUserInfoAction()
    Message.success('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error: any) {
    Message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 20px;
}

.login-wrapper {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 560px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.login-left {
  width: 380px;
  padding: 40px 32px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-info {
  .brand-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px;
    letter-spacing: 1px;
  }
  .brand-subtitle {
    font-size: 13px;
    margin: 0;
    opacity: 0.85;
  }
}

.feature-list {
  flex: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  
  .feature-icon {
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
    color: #52c41a;
  }
  
  .feature-text {
    h4 {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 4px;
    }
    p {
      font-size: 12px;
      margin: 0;
      opacity: 0.8;
      line-height: 1.5;
    }
  }
}

.brand-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  
  p {
    font-size: 11px;
    margin: 0;
    opacity: 0.7;
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 340px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 8px;
  }
  
  p {
    font-size: 13px;
    color: #86909c;
    margin: 0;
  }
}

.platform-section {
  margin-bottom: 28px;
}

.platform-label {
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 12px;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1890ff;
    background: #f0f7ff;
  }
  
  &.active {
    border-color: #1890ff;
    background: #e6f4ff;
    
    .platform-icon {
      color: #1890ff;
    }
    .platform-name {
      color: #1890ff;
    }
  }
  
  .platform-icon {
    color: #86909c;
    margin-bottom: 6px;
  }
  
  .platform-name {
    font-size: 12px;
    color: #4e5969;
    white-space: nowrap;
  }
}

.login-form {
  .form-extra {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    max-width: 400px;
  }
  
  .login-left {
    width: 100%;
    padding: 24px;
    
    .feature-list {
      display: none;
    }
  }
  
  .login-right {
    padding: 24px;
  }
}
</style>
