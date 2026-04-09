<template>
  <div class="mp-page pay-offline">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">线下转账支付</div>
    </div>
    
    <div class="order-info">
      <div class="info-row">
        <span class="label">订单编号</span>
        <span class="value">{{ orderInfo.orderNo }}</span>
      </div>
      <div class="info-row total">
        <span class="label">应付金额</span>
        <span class="value price">¥{{ orderInfo.totalAmount }}</span>
      </div>
    </div>
    
    <div class="account-section">
      <div class="section-title">
        <icon-bank class="title-icon" />
        <span>收款账户信息</span>
      </div>
      <div class="account-card">
        <div class="account-row">
          <span class="label">户名</span>
          <span class="value">{{ accountInfo.accountName }}</span>
        </div>
        <div class="account-row">
          <span class="label">账号</span>
          <span class="value account-no">{{ accountInfo.accountNo }}</span>
        </div>
        <div class="account-row">
          <span class="label">开户行</span>
          <span class="value">{{ accountInfo.bankName }}</span>
        </div>
        <div class="copy-btn" @click="handleCopy">
          <icon-copy />
          <span>复制账号</span>
        </div>
      </div>
    </div>
    
    <div class="tips-section">
      <div class="section-title">
        <icon-info-circle class="title-icon" />
        <span>温馨提示</span>
      </div>
      <div class="tips-list">
        <div class="tip-item">
          <span class="tip-num">1</span>
          <span class="tip-text">请在24小时内完成转账，超时订单将自动取消</span>
        </div>
        <div class="tip-item">
          <span class="tip-num">2</span>
          <span class="tip-text">转账时请在备注中填写订单编号</span>
        </div>
        <div class="tip-item">
          <span class="tip-num">3</span>
          <span class="tip-text">到账时间约1-2小时，请耐心等待</span>
        </div>
        <div class="tip-item">
          <span class="tip-num">4</span>
          <span class="tip-text">如有疑问请联系客服：400-123-4567</span>
        </div>
      </div>
    </div>
    
    <div class="voucher-section">
      <div class="section-title">
        <icon-camera class="title-icon" />
        <span>上传转账凭证</span>
        <span class="optional">（选填）</span>
      </div>
      <div class="upload-area">
        <div 
          class="upload-item" 
          v-for="(img, index) in voucherImages" 
          :key="index"
        >
          <img :src="img" :alt="'凭证' + (index + 1)" />
          <div class="delete-btn" @click="handleDeleteImage(index)">
            <icon-close />
          </div>
        </div>
        <div class="upload-btn" v-if="voucherImages.length < 3" @click="handleUpload">
          <icon-plus />
          <span>添加图片</span>
        </div>
      </div>
      <div class="upload-tips">最多上传3张图片，支持jpg/png格式</div>
    </div>
    
    <div class="remark-section">
      <div class="section-title">
        <icon-edit class="title-icon" />
        <span>备注信息</span>
      </div>
      <textarea 
        class="remark-input"
        v-model="remark"
        placeholder="请输入备注信息（选填）"
        maxlength="200"
      ></textarea>
      <div class="char-count">{{ remark.length }}/200</div>
    </div>
    
    <div class="bottom-bar">
      <div class="countdown">
        <icon-clock-circle class="countdown-icon" />
        <span>剩余支付时间：{{ countdownText }}</span>
      </div>
      <div class="submit-btn" @click="handleSubmit">
        确认支付
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits(['navigate'])

const orderInfo = ref({
  orderNo: 'ORD2024011500001',
  totalAmount: '15,680.00',
})

const accountInfo = ref({
  accountName: '南京建材供应链管理有限公司',
  accountNo: '6222 0891 1234 5678',
  bankName: '中国建设银行南京鼓楼支行',
})

const voucherImages = ref<string[]>([])
const remark = ref('')

const countdown = ref(24 * 3600)
const countdownText = ref('24:00:00')

let timer: number

function updateCountdown() {
  const hours = Math.floor(countdown.value / 3600)
  const minutes = Math.floor((countdown.value % 3600) / 60)
  const seconds = countdown.value % 60
  countdownText.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function handleBack() {
  emit('navigate', 'order')
}

function handleCopy() {
  const text = `${accountInfo.value.accountNo.replace(/\s/g, '')}`
  navigator.clipboard.writeText(text).then(() => {
    Message.success('账号已复制到剪贴板')
  }).catch(() => {
    Message.success('账号已复制到剪贴板')
  })
}

function handleUpload() {
  const randomId = Date.now()
  voucherImages.value.push(`https://picsum.photos/200/200?random=${randomId}`)
}

function handleDeleteImage(index: number) {
  voucherImages.value.splice(index, 1)
}

function handleSubmit() {
  Message.success('支付凭证已提交，等待财务审核')
  setTimeout(() => {
    emit('navigate', 'order')
  }, 1000)
}

onMounted(() => {
  updateCountdown()
  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
      updateCountdown()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.pay-offline {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 80px;
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
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
}

.order-info {
  margin-top: 54px;
  background: #fff;
  padding: 16px;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.total {
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
    
    .label {
      font-size: 14px;
      color: #86909c;
    }
    
    .value {
      font-size: 14px;
      color: #1d2129;
      
      &.price {
        font-size: 20px;
        font-weight: 600;
        color: #f53f3f;
      }
    }
  }
}

.account-section,
.tips-section,
.voucher-section,
.remark-section {
  margin: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
    
    .title-icon {
      color: #165dff;
      font-size: 18px;
    }
    
    .optional {
      font-size: 12px;
      color: #86909c;
      font-weight: normal;
    }
  }
}

.account-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  
  .account-row {
    display: flex;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 60px;
      font-size: 13px;
      color: #86909c;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      font-size: 14px;
      color: #1d2129;
      
      &.account-no {
        font-family: 'Courier New', monospace;
        letter-spacing: 1px;
      }
    }
  }
  
  .copy-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: #165dff;
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
  }
}

.tips-list {
  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .tip-num {
      width: 18px;
      height: 18px;
      background: #e8f3ff;
      color: #165dff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
      margin-top: 1px;
    }
    
    .tip-text {
      flex: 1;
      font-size: 13px;
      color: #4e5969;
      line-height: 1.6;
    }
  }
}

.upload-area {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  .upload-item {
    width: 80px;
    height: 80px;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .delete-btn {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
    }
  }
  
  .upload-btn {
    width: 80px;
    height: 80px;
    border: 1px dashed #c9cdd4;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #86909c;
    font-size: 12px;
  }
}

.upload-tips {
  font-size: 11px;
  color: #86909c;
  margin-top: 10px;
}

.remark-input {
  width: 100%;
  height: 80px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #1d2129;
  resize: none;
  outline: none;
  
  &::placeholder {
    color: #c9cdd4;
  }
  
  &:focus {
    border-color: #165dff;
  }
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: #86909c;
  margin-top: 6px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
  
  .countdown {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #f53f3f;
    
    .countdown-icon {
      font-size: 14px;
    }
  }
  
  .submit-btn {
    margin-left: auto;
    padding: 12px 32px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    color: #fff;
    border-radius: 24px;
    font-size: 15px;
    font-weight: 500;
  }
}
</style>
