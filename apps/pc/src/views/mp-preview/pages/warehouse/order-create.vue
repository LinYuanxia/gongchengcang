<template>
  <div class="mp-page warehouse-order-create">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">确认订单</div>
    </div>
    
    <div class="address-card" @click="handleSelectAddress">
      <div class="address-icon">
        <icon-location />
      </div>
      <div class="address-info" v-if="address">
        <div class="address-name">
          <span class="name">{{ address.name }}</span>
          <span class="phone">{{ address.phone }}</span>
        </div>
        <div class="address-detail">{{ address.detail }}</div>
      </div>
      <div class="address-info" v-else>
        <div class="no-address">请选择收货地址</div>
      </div>
      <icon-right class="arrow" />
    </div>
    
    <div class="order-products">
      <div class="shop-header">
        <icon-shop />
        <span>{{ orderProducts[0]?.supplier || '供应商' }}</span>
      </div>
      <div class="product-item" v-for="product in orderProducts" :key="product.id">
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-spec">{{ product.spec }}</div>
          <div class="product-bottom">
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-quantity">x{{ product.quantity }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="order-info">
      <div class="custody-account-card">
        <div class="custody-header">
          <icon-safe class="custody-icon" />
          <span class="custody-title">托管账户</span>
        </div>
        <div class="custody-balance">
          <span class="balance-label">可用余额</span>
          <span class="balance-amount" :class="{ 'insufficient': isBalanceInsufficient }">
            ¥{{ custodyBalance.toFixed(2) }}
          </span>
        </div>
        <div class="custody-action" @click="handleRecharge">
          <icon-plus />
          <span>充值</span>
        </div>
      </div>
      
      <div class="insufficient-warning" v-if="isBalanceInsufficient">
        <icon-exclamation-circle-fill class="warning-icon" />
        <span>托管账户余额不足，还需充值 <strong>¥{{ shortageAmount }}</strong></span>
        <span class="recharge-link" @click="handleRecharge">立即充值</span>
      </div>
      
      <div class="info-item">
        <span class="label">配送方式</span>
        <span class="value">物流配送</span>
      </div>
      <div class="info-item">
        <span class="label">运费</span>
        <span class="value">¥{{ freight }}</span>
      </div>
      <div class="info-item">
        <span class="label">订单备注</span>
        <input type="text" v-model="remark" placeholder="选填，请输入备注" class="remark-input" />
      </div>
    </div>
    
    <div class="order-summary">
      <div class="summary-item">
        <span>商品金额</span>
        <span>¥{{ productTotal }}</span>
      </div>
      <div class="summary-item">
        <span>运费</span>
        <span>¥{{ freight }}</span>
      </div>
      <div class="summary-item total">
        <span>合计</span>
        <span class="total-price">¥{{ orderTotal }}</span>
      </div>
    </div>
    
    <div class="bottom-bar">
      <div class="total-info">
        <span class="label">实付款：</span>
        <span class="price">¥{{ orderTotal }}</span>
      </div>
      <div class="submit-btn" @click="handleSubmit">提交订单</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const remark = ref('')
const freight = ref(0)
const custodyBalance = ref(5000.00)

const address = ref({
  name: '张经理',
  phone: '138****8888',
  detail: '江苏省南京市鼓楼区XX路XX号XX工地',
})

const orderProducts = ref([
  {
    id: 1,
    name: '高标号水泥 P.O42.5',
    spec: '50kg/袋',
    image: 'https://picsum.photos/200/200?random=1',
    price: 28.5,
    quantity: 100,
    supplier: '华东建材供应商',
  },
  {
    id: 2,
    name: '建筑用黄沙',
    spec: '中粗砂',
    image: 'https://picsum.photos/200/200?random=3',
    price: 85,
    quantity: 20,
    supplier: '华东建材供应商',
  },
])

const productTotal = computed(() => {
  return orderProducts.value.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)
})

const orderTotal = computed(() => {
  return (parseFloat(productTotal.value) + freight.value).toFixed(2)
})

const isBalanceInsufficient = computed(() => {
  return custodyBalance.value < parseFloat(orderTotal.value)
})

const shortageAmount = computed(() => {
  const shortage = parseFloat(orderTotal.value) - custodyBalance.value
  return shortage > 0 ? shortage.toFixed(2) : '0.00'
})

function handleBack() {
  emit('navigate', 'cart')
}

function handleSelectAddress() {
  
}

function handleRecharge() {
  emit('navigate', 'custody')
}

function handleSubmit() {
  if (isBalanceInsufficient.value) {
    return
  }
  emit('navigate', 'order')
}
</script>

<style lang="scss" scoped>
.warehouse-order-create {
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
  padding: 0 12px;
  z-index: 100;
  
  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
  }
}

.address-card {
  margin-top: 44px;
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  
  .address-icon {
    width: 36px;
    height: 36px;
    background: #fff5f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff6b00;
    font-size: 18px;
  }
  
  .address-info {
    flex: 1;
    margin-left: 12px;
    
    .address-name {
      .name {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
      
      .phone {
        font-size: 13px;
        color: #666;
        margin-left: 12px;
      }
    }
    
    .address-detail {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }
    
    .no-address {
      font-size: 14px;
      color: #999;
    }
  }
  
  .arrow {
    color: #ccc;
  }
}

.order-products {
  background: #fff;
  margin-top: 10px;
  
  .shop-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 14px;
    color: #333;
  }
  
  .product-item {
    display: flex;
    padding: 12px;
    
    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .product-info {
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      
      .product-name {
        font-size: 14px;
        color: #333;
        line-height: 1.4;
      }
      
      .product-spec {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
      
      .product-bottom {
        display: flex;
        justify-content: space-between;
        margin-top: auto;
        
        .product-price {
          font-size: 14px;
          color: #ff6b00;
          font-weight: 500;
        }
        
        .product-quantity {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
}

.order-info {
  background: #fff;
  margin-top: 10px;
  padding: 12px;
  
  .custody-account-card {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%);
    border: 2px solid #1890ff;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 12px;
  }
  
  .custody-header {
    display: flex;
    align-items: center;
    gap: 6px;
    
    .custody-icon {
      font-size: 22px;
      color: #1890ff;
    }
    
    .custody-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .custody-balance {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-left: 12px;
    
    .balance-label {
      font-size: 12px;
      color: #666;
    }
    
    .balance-amount {
      font-size: 20px;
      font-weight: 700;
      color: #1890ff;
      
      &.insufficient {
        color: #ff4d4f;
        animation: pulse 1.5s infinite;
      }
    }
  }
  
  .custody-action {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #1890ff;
    font-size: 13px;
    padding: 6px 12px;
    background: #fff;
    border-radius: 16px;
  }
  
  .insufficient-warning {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #ff4d4f;
    
    .warning-icon {
      font-size: 16px;
      color: #ff4d4f;
    }
    
    strong {
      font-weight: 600;
    }
    
    .recharge-link {
      color: #1890ff;
      font-weight: 500;
      margin-left: auto;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    
    .label {
      font-size: 14px;
      color: #666;
    }
    
    .value {
      font-size: 14px;
      color: #333;
    }
    
    .remark-input {
      flex: 1;
      text-align: right;
      border: none;
      font-size: 14px;
      color: #333;
      
      &::placeholder {
        color: #999;
      }
    }
  }
}

.order-summary {
  background: #fff;
  margin-top: 10px;
  padding: 12px;
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    color: #666;
    
    &.total {
      padding-top: 12px;
      border-top: 1px solid #f5f5f5;
      
      .total-price {
        font-size: 18px;
        color: #ff6b00;
        font-weight: 600;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  
  .total-info {
    .label {
      font-size: 13px;
      color: #666;
    }
    
    .price {
      font-size: 18px;
      color: #ff6b00;
      font-weight: 600;
    }
  }
  
  .submit-btn {
    background: #ff6b00;
    color: #fff;
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    margin-left: 16px;
  }
}
</style>
