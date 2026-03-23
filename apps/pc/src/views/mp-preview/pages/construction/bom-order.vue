<template>
  <div class="mp-page construction-bom-order">
    <div class="header">
      <div class="back-btn" @click="emit('back')">
        <icon-left />
      </div>
      <div class="title">确认订单</div>
    </div>

    <div class="bom-summary">
      <div class="bom-image">
        <img :src="bom.image" :alt="bom.name" />
      </div>
      <div class="bom-info">
        <div class="bom-name">{{ bom.name }}</div>
        <div class="bom-meta">
          <span>{{ bom.skuCount }}种SKU</span>
          <span>× {{ quantity }}套</span>
        </div>
      </div>
      <div class="bom-price">¥{{ bom.price }}</div>
    </div>

    <div class="section">
      <div class="section-title">收货信息</div>
      <div class="address-card" @click="showAddressSelect = true">
        <div class="address-icon">
          <icon-location />
        </div>
        <div class="address-info">
          <div class="address-user">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
          </div>
          <div class="address-detail">{{ address.detail }}</div>
        </div>
        <div class="address-arrow">
          <icon-right />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">已选SKU明细</div>
      <div class="sku-list">
        <div class="sku-item" v-for="sku in selectedSkuList" :key="sku.skuId">
          <div class="sku-image">
            <img :src="sku.image" :alt="sku.name" />
          </div>
          <div class="sku-info">
            <div class="sku-name">{{ sku.name }}</div>
            <div class="sku-spec">{{ sku.spec }}</div>
          </div>
          <div class="sku-right">
            <div class="sku-price">¥{{ sku.price }}</div>
            <div class="sku-quantity">×{{ sku.quantity * quantity }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">供应商拆单预览</div>
      <div class="split-list">
        <div class="split-item" v-for="split in splitOrders" :key="split.supplierName">
          <div class="split-header">
            <span class="supplier-name">{{ split.supplierName }}</span>
            <span class="split-amount">¥{{ split.amount }}</span>
          </div>
          <div class="split-sku">{{ split.skuPreview }}</div>
          <div class="split-delivery">预计 {{ split.estimatedDelivery }} 发货</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">支付方式</div>
      <div class="pay-method">
        <div class="pay-item active">
          <icon-credit-card class="pay-icon" />
          <span>托管账户支付</span>
          <icon-check class="check-icon" />
        </div>
      </div>
      <div class="balance-info">
        <span>托管账户余额：</span>
        <span class="balance">¥{{ custodyBalance.toLocaleString() }}</span>
        <span v-if="custodyBalance < parseFloat(totalAmount.replace(/,/g, ''))" class="insufficient">
          余额不足，请先充值
        </span>
      </div>
    </div>

    <div class="remark-section">
      <div class="section-title">订单备注</div>
      <textarea v-model="remark" placeholder="选填，请输入订单备注" maxlength="200"></textarea>
    </div>

    <div class="summary-bar">
      <div class="summary-left">
        <div class="total-label">应付总额</div>
        <div class="total-price">¥{{ totalAmount }}</div>
      </div>
      <div class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
        提交订单
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits(['back', 'navigate'])

const quantity = ref(1)
const custodyBalance = ref(50000)
const remark = ref('')
const showAddressSelect = ref(false)

const bom = ref({
  id: '1',
  name: '水电材料标准包',
  image: 'https://picsum.photos/100/100?random=1',
  price: '3,580.00',
  skuCount: 12,
  skuList: [
    { skuId: '1', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', price: 420, quantity: 10, unit: '吨' },
    { skuId: '2', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', price: 280, quantity: 5, unit: '桶' },
    { skuId: '3', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', price: 35, quantity: 20, unit: '根' },
    { skuId: '4', name: '电线 BV2.5', image: 'https://picsum.photos/60/60?random=4', spec: '2.5mm²', price: 180, quantity: 5, unit: '卷' },
  ],
})

const address = ref({
  name: '张三',
  phone: '138****8888',
  detail: '北京市朝阳区建国路88号SOHO现代城A座1201室',
})

const selectedSkuList = computed(() => bom.value.skuList)

const splitOrders = ref([
  { supplierName: '华新水泥', skuPreview: '水泥 P.O 42.5 × 10吨', amount: '4,200.00', estimatedDelivery: '2-3天' },
  { supplierName: '东方雨虹', skuPreview: '防水涂料 × 5桶', amount: '1,400.00', estimatedDelivery: '1-2天' },
  { supplierName: '伟星管业', skuPreview: 'PVC排水管 × 20根', amount: '700.00', estimatedDelivery: '2-3天' },
  { supplierName: '远东电缆', skuPreview: '电线 BV2.5 × 5卷', amount: '900.00', estimatedDelivery: '1-2天' },
])

const totalAmount = computed(() => {
  const total = selectedSkuList.value.reduce((sum, sku) => sum + sku.price * sku.quantity * quantity.value, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

const canSubmit = computed(() => {
  return custodyBalance.value >= parseFloat(totalAmount.value.replace(/,/g, ''))
})

function handleSubmit() {
  if (!canSubmit.value) {
    Message.warning('托管账户余额不足，请先充值')
    return
  }
  Message.success('订单提交成功')
  emit('navigate', 'order')
}
</script>

<style lang="scss" scoped>
.construction-bom-order {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 70px;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #333;
  }
  
  .title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}

.bom-summary {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16px;
  
  .bom-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .bom-info {
    flex: 1;
    margin-left: 12px;
    
    .bom-name {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }
    
    .bom-meta {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      
      span {
        margin-right: 8px;
      }
    }
  }
  
  .bom-price {
    font-size: 16px;
    color: #f53f3f;
    font-weight: 600;
  }
}

.section {
  background: #fff;
  margin-top: 10px;
  padding: 16px;
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }
}

.address-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  
  .address-icon {
    width: 32px;
    height: 32px;
    background: #165dff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
  }
  
  .address-info {
    flex: 1;
    margin-left: 12px;
    
    .address-user {
      .name {
        font-size: 15px;
        color: #333;
        font-weight: 500;
        margin-right: 8px;
      }
      
      .phone {
        font-size: 13px;
        color: #666;
      }
    }
    
    .address-detail {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }
  }
  
  .address-arrow {
    color: #999;
    font-size: 16px;
  }
}

.sku-list {
  .sku-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .sku-image {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .sku-info {
      flex: 1;
      margin-left: 10px;
      
      .sku-name {
        font-size: 13px;
        color: #333;
      }
      
      .sku-spec {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }
    }
    
    .sku-right {
      text-align: right;
      
      .sku-price {
        font-size: 13px;
        color: #f53f3f;
      }
      
      .sku-quantity {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }
    }
  }
}

.split-list {
  .split-item {
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .split-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .supplier-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
      
      .split-amount {
        font-size: 14px;
        color: #f53f3f;
        font-weight: 500;
      }
    }
    
    .split-sku {
      font-size: 12px;
      color: #666;
      margin-top: 6px;
    }
    
    .split-delivery {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.pay-method {
  .pay-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    
    &.active {
      background: #e8f3ff;
      border: 1px solid #165dff;
    }
    
    .pay-icon {
      font-size: 20px;
      color: #165dff;
      margin-right: 10px;
    }
    
    span {
      flex: 1;
      font-size: 14px;
      color: #333;
    }
    
    .check-icon {
      color: #165dff;
      font-size: 18px;
    }
  }
}

.balance-info {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
  
  .balance {
    color: #165dff;
    font-weight: 500;
  }
  
  .insufficient {
    color: #f53f3f;
    margin-left: 8px;
  }
}

.remark-section {
  background: #fff;
  margin-top: 10px;
  padding: 16px;
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }
  
  textarea {
    width: 100%;
    height: 80px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
    font-size: 13px;
    resize: none;
    
    &::placeholder {
      color: #999;
    }
  }
}

.summary-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-top: 1px solid #eee;
  
  .summary-left {
    .total-label {
      font-size: 12px;
      color: #666;
    }
    
    .total-price {
      font-size: 20px;
      font-weight: 600;
      color: #f53f3f;
    }
  }
  
  .submit-btn {
    background: #165dff;
    color: #fff;
    padding: 12px 32px;
    border-radius: 24px;
    font-size: 15px;
    font-weight: 500;
    
    &.disabled {
      background: #ccc;
    }
  }
}
</style>
