<template>
  <div class="mp-page damage-apply">
    <div class="page-header">
      <div class="header-left" @click="$emit('navigate', 'damage-list')">
        <icon-arrow-left class="back-icon" />
      </div>
      <div class="header-title">发起报损</div>
      <div class="header-right"></div>
    </div>
    
    <div class="form-container">
      <div class="form-section">
        <div class="section-title">选择订单</div>
        <div class="form-item" @click="showOrderPicker = true">
          <span class="item-label">关联订单</span>
          <span class="item-value" :class="{ placeholder: !applyForm.orderId }">
            {{ selectedOrder?.orderNo || '请选择订单' }}
          </span>
          <icon-right class="arrow-icon" />
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-title">报损商品</div>
        <div class="form-item" @click="showProductPicker = true">
          <span class="item-label">商品名称</span>
          <span class="item-value" :class="{ placeholder: !applyForm.productId }">
            {{ selectedProduct?.name || '请选择商品' }}
          </span>
          <icon-right class="arrow-icon" />
        </div>
        
        <div class="form-item" v-if="selectedProduct">
          <span class="item-label">规格型号</span>
          <span class="item-value">{{ selectedProduct.spec }}</span>
        </div>
        
        <div class="form-item">
          <span class="item-label">报损数量</span>
          <div class="qty-control">
            <span class="qty-btn" @click="decreaseQty">-</span>
            <input 
              v-model="applyForm.damageQty" 
              type="number" 
              class="qty-input"
              min="1"
              :max="selectedProduct?.quantity || 999"
            />
            <span class="qty-btn" @click="increaseQty">+</span>
            <span class="qty-unit">{{ selectedProduct?.unit || '件' }}</span>
          </div>
        </div>
        
        <div class="form-item">
          <span class="item-label">报损金额</span>
          <span class="item-value price">¥{{ calculateAmount }}</span>
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-title">报损原因</div>
        <div class="reason-options">
          <div 
            class="reason-item" 
            v-for="reason in reasonOptions" 
            :key="reason.value"
            :class="{ active: applyForm.reason === reason.value }"
            @click="applyForm.reason = reason.value"
          >
            {{ reason.label }}
          </div>
        </div>
        
        <div class="form-item">
          <span class="item-label">详细说明</span>
          <textarea 
            v-model="applyForm.description" 
            class="desc-textarea"
            placeholder="请详细描述报损情况..."
            :rows="4"
          ></textarea>
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-title">凭证上传</div>
        <div class="upload-area">
          <div 
            class="upload-item" 
            v-for="(img, index) in applyForm.images" 
            :key="index"
          >
            <img :src="img" :alt="'凭证' + (index + 1)" />
            <span class="delete-btn" @click="removeImage(index)">
              <icon-close />
            </span>
          </div>
          <div 
            class="upload-add" 
            v-if="applyForm.images.length < 9"
            @click="handleUpload"
          >
            <icon-plus class="add-icon" />
            <span>上传图片</span>
          </div>
        </div>
        <div class="upload-tip">最多上传9张图片，支持JPG、PNG格式</div>
      </div>
    </div>
    
    <div class="submit-bar">
      <a-button type="primary" class="submit-btn" @click="handleSubmit">提交报损申请</a-button>
    </div>
    
    <div class="picker-popup" v-if="showOrderPicker">
      <div class="popup-mask" @click="showOrderPicker = false"></div>
      <div class="popup-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showOrderPicker = false">取消</span>
          <span class="picker-title">选择订单</span>
          <span class="picker-confirm" @click="selectOrder">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item" 
            v-for="order in availableOrders" 
            :key="order.id"
            :class="{ active: applyForm.orderId === order.id }"
            @click="applyForm.orderId = order.id"
          >
            <div class="item-order-no">{{ order.orderNo }}</div>
            <div class="item-project">{{ order.projectName }}</div>
            <icon-check v-if="applyForm.orderId === order.id" class="check-icon" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="picker-popup" v-if="showProductPicker">
      <div class="popup-mask" @click="showProductPicker = false"></div>
      <div class="popup-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showProductPicker = false">取消</span>
          <span class="picker-title">选择商品</span>
          <span class="picker-confirm" @click="selectProduct">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item product" 
            v-for="product in orderProducts" 
            :key="product.id"
            :class="{ active: applyForm.productId === product.id }"
            @click="applyForm.productId = product.id"
          >
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-spec">{{ product.spec }}</div>
              <div class="product-qty">已收货：{{ product.quantity }} {{ product.unit }}</div>
            </div>
            <icon-check v-if="applyForm.productId === product.id" class="check-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits(['navigate'])

const showOrderPicker = ref(false)
const showProductPicker = ref(false)

const applyForm = reactive({
  orderId: '',
  productId: '',
  damageQty: 1,
  reason: '',
  description: '',
  images: [] as string[],
})

const availableOrders = ref([
  {
    id: 'PO202401100004',
    orderNo: 'PO202401100004',
    projectName: '星巴克深圳万象城店',
    status: 'completed',
  },
  {
    id: 'PO202401080005',
    orderNo: 'PO202401080005',
    projectName: '喜茶广州天河城店',
    status: 'completed',
  },
  {
    id: 'PO202401050003',
    orderNo: 'PO202401050003',
    projectName: '瑞幸咖啡东莞万达店',
    status: 'completed',
  },
])

const orderProductsMap: Record<string, any[]> = {
  'PO202401100004': [
    { id: 1, name: '防水涂料 K11', spec: '20kg/桶', price: 280, quantity: 30, unit: '桶' },
    { id: 2, name: '水泥 P.O 42.5', spec: '50kg/袋', price: 35, quantity: 100, unit: '袋' },
  ],
  'PO202401080005': [
    { id: 3, name: '黄砂 中砂', spec: '吨', price: 95, quantity: 50, unit: '吨' },
    { id: 4, name: '碎石 5-10mm', spec: '吨', price: 85, quantity: 30, unit: '吨' },
  ],
  'PO202401050003': [
    { id: 5, name: 'BV铜芯线 2.5mm²', spec: '100米/卷', price: 185, quantity: 20, unit: '卷' },
    { id: 6, name: 'PPR冷热水管 S3.2', spec: 'DN20 4米/根', price: 32, quantity: 50, unit: '根' },
  ],
}

const reasonOptions = [
  { value: 'damage', label: '运输损坏' },
  { value: 'quality', label: '质量问题' },
  { value: 'wrong', label: '错发漏发' },
  { value: 'expired', label: '过期变质' },
  { value: 'other', label: '其他原因' },
]

const selectedOrder = computed(() => {
  return availableOrders.value.find(o => o.id === applyForm.orderId)
})

const orderProducts = computed(() => {
  return orderProductsMap[applyForm.orderId] || []
})

const selectedProduct = computed(() => {
  return orderProducts.value.find(p => p.id === applyForm.productId)
})

const calculateAmount = computed(() => {
  if (!selectedProduct.value) return '0.00'
  const amount = selectedProduct.value.price * applyForm.damageQty
  return amount.toLocaleString()
})

function decreaseQty() {
  if (applyForm.damageQty > 1) {
    applyForm.damageQty--
  }
}

function increaseQty() {
  const maxQty = selectedProduct.value?.quantity || 999
  if (applyForm.damageQty < maxQty) {
    applyForm.damageQty++
  }
}

function handleUpload() {
  applyForm.images.push(`https://picsum.photos/100/100?random=${Date.now()}`)
}

function removeImage(index: number) {
  applyForm.images.splice(index, 1)
}

function selectOrder() {
  showOrderPicker.value = false
  applyForm.productId = ''
  applyForm.damageQty = 1
}

function selectProduct() {
  showProductPicker.value = false
}

function handleSubmit() {
  if (!applyForm.orderId) {
    Message.warning('请选择关联订单')
    return
  }
  if (!applyForm.productId) {
    Message.warning('请选择报损商品')
    return
  }
  if (!applyForm.reason) {
    Message.warning('请选择报损原因')
    return
  }
  if (applyForm.images.length === 0) {
    Message.warning('请上传报损凭证图片')
    return
  }
  
  Message.success('报损申请提交成功，等待平台审核')
  setTimeout(() => {
    emit('navigate', 'damage-list')
  }, 1500)
}
</script>

<style lang="scss" scoped>
.damage-apply {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 80px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #165dff, #4080ff);
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-left, .header-right {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-icon {
    color: #fff;
    font-size: 20px;
  }
  
  .header-title {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
  }
}

.form-container {
  padding: 54px 12px 12px;
  
  .form-section {
    background: #fff;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 10px;
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #165dff;
    }
    
    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f2f3f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-label {
        font-size: 14px;
        color: #4e5969;
      }
      
      .item-value {
        font-size: 14px;
        color: #1d2129;
        text-align: right;
        
        &.placeholder {
          color: #c9cdd4;
        }
        
        &.price {
          font-weight: 600;
          color: #f53f3f;
        }
      }
      
      .arrow-icon {
        color: #c9cdd4;
        font-size: 16px;
        margin-left: 8px;
      }
    }
    
    .qty-control {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .qty-btn {
        width: 32px;
        height: 32px;
        background: #f5f5f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #4e5969;
      }
      
      .qty-input {
        width: 60px;
        height: 32px;
        text-align: center;
        border: 1px solid #e5e6eb;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
      }
      
      .qty-unit {
        font-size: 14px;
        color: #86909c;
      }
    }
    
    .desc-textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      font-size: 14px;
      color: #1d2129;
      resize: none;
      outline: none;
      
      &::placeholder {
        color: #c9cdd4;
      }
    }
  }
}

.reason-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  
  .reason-item {
    padding: 8px 16px;
    background: #f5f5f5;
    border-radius: 20px;
    font-size: 13px;
    color: #4e5969;
    
    &.active {
      background: linear-gradient(135deg, #165dff, #4080ff);
      color: #fff;
    }
  }
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  .upload-item {
    position: relative;
    width: 80px;
    height: 80px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .delete-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      background: #f53f3f;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        color: #fff;
        font-size: 12px;
      }
    }
  }
  
  .upload-add {
    width: 80px;
    height: 80px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    
    .add-icon {
      color: #c9cdd4;
      font-size: 24px;
    }
    
    span {
      font-size: 12px;
      color: #c9cdd4;
    }
  }
}

.upload-tip {
  font-size: 12px;
  color: #c9cdd4;
  margin-top: 10px;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  
  .submit-btn {
    width: 100%;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
  }
}

.picker-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .popup-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    
    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #f2f3f5;
      
      .picker-cancel, .picker-confirm {
        font-size: 14px;
        color: #4e5969;
      }
      
      .picker-confirm {
        color: #165dff;
      }
      
      .picker-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }
    }
    
    .picker-body {
      flex: 1;
      overflow-y: auto;
      padding: 10px 16px;
      
      .picker-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        border-bottom: 1px solid #f2f3f5;
        
        &.product {
          justify-content: flex-start;
          gap: 12px;
          
          .product-info {
            flex: 1;
            
            .product-name {
              font-size: 14px;
              color: #1d2129;
              margin-bottom: 4px;
            }
            
            .product-spec {
              font-size: 12px;
              color: #86909c;
              margin-bottom: 4px;
            }
            
            .product-qty {
              font-size: 12px;
              color: #86909c;
            }
          }
        }
        
        .item-order-no {
          font-size: 14px;
          color: #1d2129;
          margin-bottom: 4px;
        }
        
        .item-project {
          font-size: 12px;
          color: #86909c;
        }
        
        .check-icon {
          color: #165dff;
          font-size: 18px;
        }
        
        &.active {
          background: #f5f7ff;
          margin: 0 -16px;
          padding: 14px 16px;
          border-radius: 8px;
        }
      }
    }
  }
}
</style>
