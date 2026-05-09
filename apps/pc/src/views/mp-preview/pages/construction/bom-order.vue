<template>
  <div class="mp-page bom-order">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'project-detail')">
        <icon-left />
      </div>
      <div class="header-title">BOM下单</div>
    </div>
    
    <div class="bom-info-card">
      <div class="bom-header">
        <img :src="selectedBom.image" :alt="selectedBom.name" />
        <div class="bom-detail">
          <div class="bom-name">{{ selectedBom.name }}</div>
          <div class="bom-spec">{{ selectedBom.spec }}</div>
          <div class="bom-price">¥{{ selectedBom.price }}</div>
        </div>
      </div>
    </div>
    
    <div class="store-selector">
      <div class="selector-title">
        <icon-map-marker />
        <span>选择门店</span>
      </div>
      <div class="selected-store">
        <span class="store-name">{{ currentStore.name }}</span>
        <span class="store-address">{{ currentStore.address }}</span>
        <icon-arrow-right />
      </div>
    </div>
    
    <div class="address-selector">
      <div class="selector-title">
        <icon-home />
        <span>收货地址</span>
      </div>
      <div class="address-card" @click="showAddressModal = true">
        <div class="address-info">
          <div class="address-header">
            <span class="contact-name">{{ selectedAddress.name }}</span>
            <span class="contact-phone">{{ selectedAddress.phone }}</span>
          </div>
          <div class="address-detail">{{ selectedAddress.address }}</div>
        </div>
        <icon-arrow-right />
      </div>
    </div>
    
    <div class="warehouse-selector">
      <div class="selector-title">
        <icon-storage />
        <span>选择工程仓库</span>
      </div>
      <div class="warehouse-list">
        <div 
          class="warehouse-item" 
          v-for="warehouse in warehouses" 
          :key="warehouse.id"
          :class="{ active: selectedWarehouse === warehouse.id }"
          @click="selectedWarehouse = warehouse.id"
        >
          <div class="warehouse-info">
            <div class="warehouse-name">{{ warehouse.name }}</div>
            <div class="warehouse-location">{{ warehouse.location }}</div>
          </div>
          <div class="warehouse-radio">
            <icon-check v-if="selectedWarehouse === warehouse.id" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="items-section">
      <div class="section-header">
        <span class="section-title">材料清单</span>
        <span class="section-count">共{{ selectedBom.items.length }}种材料</span>
      </div>
      
      <div class="items-list">
        <div class="item-card" v-for="item in selectedBom.items" :key="item.id">
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-spec">{{ item.spec }}</div>
            <div class="item-stock">
              <span v-if="getStock(item.id) > 0">库存: {{ getStock(item.id) }}件</span>
              <span v-else class="stock-warning">
                库存不足
                <span v-if="getAlternativeWarehouse(item.id)" class="alt-warehouse">
                  ({{ getAlternativeWarehouse(item.id) }}有货)
                </span>
              </span>
            </div>
          </div>
          <div class="item-control">
            <div class="quantity-control">
              <span class="qty-btn minus" @click="decreaseQty(item)">-</span>
              <input type="number" v-model="itemQuantities[item.id]" class="qty-input" />
              <span class="qty-btn plus" @click="increaseQty(item)">+</span>
            </div>
            <div class="item-price">¥{{ (item.price * getItemQty(item.id)).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="summary-section">
      <div class="summary-row">
        <span class="label">材料种类</span>
        <span class="value">{{ selectedBom.items.length }}种</span>
      </div>
      <div class="summary-row">
        <span class="label">总数量</span>
        <span class="value">{{ totalQuantity }}件</span>
      </div>
      <div class="summary-row total">
        <span class="label">合计金额</span>
        <span class="value">¥{{ totalAmount }}</span>
      </div>
    </div>
    
    <div class="agreement-section">
      <label class="checkbox-label">
        <input type="checkbox" v-model="agreed" />
        <span class="checkbox-icon">
          <icon-check v-if="agreed" />
        </span>
        <span>我已阅读并同意<a href="#">《采购协议》</a></span>
      </label>
    </div>
    
    <div class="action-bar">
      <div class="total-info">
        <span class="label">合计:</span>
        <span class="amount">¥{{ totalAmount }}</span>
      </div>
      <div class="submit-btn" :class="{ disabled: !agreed }" @click="handleSubmit">
        提交订单
      </div>
    </div>
    
    <div class="address-modal" v-if="showAddressModal">
      <div class="modal-overlay" @click="showAddressModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">选择收货地址</span>
          <span class="modal-close" @click="showAddressModal = false">
            <icon-close />
          </span>
        </div>
        <div class="modal-body">
          <div class="address-list">
            <div 
              class="address-item" 
              v-for="address in addresses" 
              :key="address.id"
              :class="{ active: selectedAddress.id === address.id }"
              @click="selectAddress(address)"
            >
              <div class="address-content">
                <div class="address-header">
                  <span class="contact-name">{{ address.name }}</span>
                  <span class="contact-phone">{{ address.phone }}</span>
                  <span class="default-tag" v-if="address.isDefault">默认</span>
                </div>
                <div class="address-detail">{{ address.address }}</div>
              </div>
              <div class="address-radio">
                <icon-check v-if="selectedAddress.id === address.id" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="add-address-btn" @click="$emit('navigate', 'address-manage')">
            新增收货地址
          </div>
        </div>
      </div>
    </div>
    
    <div class="payment-modal" v-if="showPaymentModal">
      <div class="modal-overlay" @click="showPaymentModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">确认订单</span>
          <span class="modal-close" @click="showPaymentModal = false">
            <icon-close />
          </span>
        </div>
        <div class="modal-body">
          <div class="order-summary">
            <div class="summary-item">
              <span class="label">订单编号</span>
              <span class="value">{{ newOrderNo }}</span>
            </div>
            <div class="summary-item">
              <span class="label">门店名称</span>
              <span class="value">{{ currentStore.name }}</span>
            </div>
            <div class="summary-item">
              <span class="label">工程仓库</span>
              <span class="value">{{ getSelectedWarehouseName() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">材料种类</span>
              <span class="value">{{ selectedBom.items.length }}种</span>
            </div>
            <div class="summary-item total">
              <span class="label">订单金额</span>
              <span class="value">¥{{ totalAmount }}</span>
            </div>
          </div>
          <div class="payment-method">
            <div class="method-title">支付方式</div>
            <div class="method-list">
              <div 
                class="method-item" 
                v-for="method in paymentMethods" 
                :key="method.id"
                :class="{ active: selectedPayment === method.id }"
                @click="selectedPayment = method.id"
              >
                <icon-wallet />
                <span class="method-name">{{ method.name }}</span>
                <icon-check v-if="selectedPayment === method.id" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="upload-voucher">
            <span class="upload-btn" @click="handleUploadVoucher">
              <icon-upload />
              上传支付凭证
            </span>
          </div>
          <div class="confirm-btn" @click="handleConfirmOrder">
            确认下单
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const selectedBom = ref({
  id: 1,
  name: '标准店基装包A',
  spec: '100㎡以内',
  price: '58,000',
  image: 'https://picsum.photos/200/150?random=401',
  items: [
    { id: 1, name: '乳胶漆', spec: '5L/桶', quantity: 10, stock: 100, price: 280 },
    { id: 2, name: '地砖', spec: '600*600mm', quantity: 80, stock: 500, price: 85 },
    { id: 3, name: '木地板', spec: '12mm厚', quantity: 60, stock: 0, price: 168 },
    { id: 4, name: '吊顶龙骨', spec: '38系列', quantity: 50, stock: 200, price: 35 },
    { id: 5, name: '石膏板', spec: '12mm', quantity: 40, stock: 150, price: 28 },
  ]
})

const currentStore = ref({
  id: 1,
  name: '星巴克深圳万象城店',
  address: '广东省深圳市罗湖区宝安南路1881号万象城3楼301铺',
})

const warehouses = ref([
  { id: 1, name: '深圳福田仓', location: '广东省深圳市福田区', stock: { 1: 100, 2: 500, 3: 0, 4: 200, 5: 150 } },
  { id: 2, name: '广州白云仓', location: '广东省广州市白云区', stock: { 1: 200, 2: 300, 3: 100, 4: 150, 5: 80 } },
  { id: 3, name: '东莞虎门仓', location: '广东省东莞市虎门镇', stock: { 1: 150, 2: 400, 3: 50, 4: 180, 5: 120 } },
])

const selectedWarehouse = ref(1)
const agreed = ref(false)
const showPaymentModal = ref(false)
const selectedPayment = ref('wechat')
const newOrderNo = ref('PO' + Date.now().toString().slice(-10))
const showAddressModal = ref(false)

const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '138****8888',
    address: '广东省深圳市罗湖区宝安南路1881号万象城3楼301铺',
    isDefault: true,
  },
  {
    id: 2,
    name: '李四',
    phone: '139****9999',
    address: '广东省广州市天河区珠江新城花城大道88号',
    isDefault: false,
  },
  {
    id: 3,
    name: '王五',
    phone: '137****7777',
    address: '广东省东莞市南城区鸿福路108号',
    isDefault: false,
  },
])

const selectedAddress = ref(addresses.value.find(a => a.isDefault) || addresses.value[0])

const itemQuantities = ref<Record<number, number>>({})
selectedBom.value.items.forEach(item => {
  itemQuantities.value[item.id] = item.quantity
})

const paymentMethods = ref([
  { id: 'wechat', name: '微信支付', icon: '' },
  { id: 'alipay', name: '支付宝', icon: '' },
  { id: 'bank', name: '银行转账', icon: '' },
])

function getItemQty(itemId: number) {
  return itemQuantities.value[itemId] || 0
}

function increaseQty(item: any) {
  itemQuantities.value[item.id] = (itemQuantities.value[item.id] || 0) + 1
}

function decreaseQty(item: any) {
  if ((itemQuantities.value[item.id] || 0) > 0) {
    itemQuantities.value[item.id]--
  }
}

function getStock(itemId: number) {
  const warehouse = warehouses.value.find(w => w.id === selectedWarehouse.value)
  return warehouse?.stock[itemId] || 0
}

function getAlternativeWarehouse(itemId: number) {
  for (const warehouse of warehouses.value) {
    if (warehouse.id !== selectedWarehouse.value && warehouse.stock[itemId] > 0) {
      return warehouse.name
    }
  }
  return null
}

const totalQuantity = computed(() => {
  return Object.values(itemQuantities.value).reduce((sum, qty) => sum + qty, 0)
})

const totalAmount = computed(() => {
  let total = 0
  selectedBom.value.items.forEach(item => {
    total += item.price * (itemQuantities.value[item.id] || 0)
  })
  return total.toLocaleString()
})

function getSelectedWarehouseName() {
  const warehouse = warehouses.value.find(w => w.id === selectedWarehouse.value)
  return warehouse?.name || ''
}

function selectAddress(address: any) {
  selectedAddress.value = address
  showAddressModal.value = false
}

function handleSubmit() {
  if (!agreed.value) {
    alert('请先同意采购协议')
    return
  }
  showPaymentModal.value = true
}

function handleUploadVoucher() {
  alert('上传支付凭证')
}

function handleConfirmOrder() {
  alert(`订单提交成功！订单编号: ${newOrderNo.value}`)
  showPaymentModal.value = false
  emit('navigate', 'order')
}
</script>

<style lang="scss" scoped>
.bom-order {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 100px;
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
  border-bottom: 1px solid #e5e6eb;
  
  .header-back {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
    margin-right: 32px;
  }
}

.bom-info-card {
  background: linear-gradient(135deg, #165dff, #4080ff);
  margin: 56px 12px 12px;
  border-radius: 12px;
  padding: 16px;
  
  .bom-header {
    display: flex;
    gap: 12px;
  }
  
  img {
    width: 100px;
    height: 75px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .bom-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .bom-name {
      font-size: 17px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .bom-spec {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8px;
    }
    
    .bom-price {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
    }
  }
}

.store-selector, .address-selector, .warehouse-selector {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  
  .selector-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
  }
}

.store-selector {
  .selected-store {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    
    .store-name {
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
      margin-right: 8px;
    }
    
    .store-address {
      flex: 1;
      font-size: 12px;
      color: #86909c;
    }
  }
}

.address-selector {
  .address-card {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    
    .address-info {
      flex: 1;
      
      .address-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        
        .contact-name {
          font-size: 14px;
          font-weight: 500;
          color: #1d2129;
        }
        
        .contact-phone {
          font-size: 13px;
          color: #86909c;
        }
      }
      
      .address-detail {
        font-size: 12px;
        color: #86909c;
        line-height: 1.5;
      }
    }
  }
}

.warehouse-selector {
  .warehouse-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .warehouse-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    border: 2px solid transparent;
    transition: all 0.2s;
    
    &.active {
      border-color: #165dff;
      background: #e8f3ff;
    }
    
    .warehouse-info {
      flex: 1;
      
      .warehouse-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .warehouse-location {
        font-size: 12px;
        color: #86909c;
        margin-top: 2px;
      }
    }
    
    .warehouse-radio {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #e5e6eb;
      display: flex;
      align-items: center;
      justify-content: center;
      
      color: #165dff;
    }
  }
}

.items-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .section-count {
      font-size: 12px;
      color: #86909c;
    }
  }
  
  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .item-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    
    .item-info {
      flex: 1;
      
      .item-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .item-spec {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 4px;
      }
      
      .item-stock {
        font-size: 11px;
        color: #86909c;
        
        &.stock-warning {
          color: #ff7d00;
          
          .alt-warehouse {
            color: #165dff;
          }
        }
      }
    }
    
    .item-control {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      
      .quantity-control {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .qty-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #4e5969;
          
          &.plus {
            background: #165dff;
            color: #fff;
          }
        }
        
        .qty-input {
          width: 40px;
          height: 28px;
          text-align: center;
          border: 1px solid #e5e6eb;
          border-radius: 6px;
          font-size: 14px;
        }
      }
      
      .item-price {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
      }
    }
  }
}

.summary-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    
    .label {
      font-size: 14px;
      color: #86909c;
    }
    
    .value {
      font-size: 14px;
      color: #1d2129;
    }
    
    &.total {
      padding-top: 12px;
      margin-top: 8px;
      border-top: 1px solid #f0f0f0;
      
      .label {
        font-weight: 500;
        color: #1d2129;
      }
      
      .value {
        font-size: 18px;
        font-weight: 600;
        color: #ff4d4f;
      }
    }
  }
}

.agreement-section {
  padding: 0 12px;
  margin-bottom: 12px;
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #86909c;
    
    input {
      display: none;
    }
    
    .checkbox-icon {
      width: 16px;
      height: 16px;
      border: 2px solid #d9d9d9;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #165dff;
      
      input:checked + & {
        background: #165dff;
        border-color: #165dff;
      }
    }
    
    a {
      color: #165dff;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  
  .total-info {
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    .label {
      font-size: 14px;
      color: #86909c;
    }
    
    .amount {
      font-size: 20px;
      font-weight: 600;
      color: #ff4d4f;
    }
  }
  
  .submit-btn {
    padding: 12px 32px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    color: #fff;
    border-radius: 24px;
    font-size: 15px;
    font-weight: 500;
    
    &.disabled {
      background: #d9d9d9;
    }
  }
}

.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: relative;
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
    overflow-y: auto;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      
      .modal-title {
        font-size: 16px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .modal-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #86909c;
      }
    }
    
    .modal-body {
      padding: 16px;
      
      .address-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .address-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background: #f7f8fa;
        border-radius: 8px;
        border: 2px solid transparent;
        transition: all 0.2s;
        
        &.active {
          border-color: #165dff;
          background: #e8f3ff;
        }
        
        .address-content {
          flex: 1;
          
          .address-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            
            .contact-name {
              font-size: 15px;
              font-weight: 500;
              color: #1d2129;
            }
            
            .contact-phone {
              font-size: 13px;
              color: #86909c;
            }
            
            .default-tag {
              padding: 2px 6px;
              background: #165dff;
              color: #fff;
              font-size: 11px;
              border-radius: 4px;
            }
          }
          
          .address-detail {
            font-size: 13px;
            color: #86909c;
            line-height: 1.5;
          }
        }
        
        .address-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #e5e6eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #165dff;
        }
      }
    }
    
    .modal-footer {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      
      .add-address-btn {
        padding: 12px;
        background: #f7f8fa;
        border-radius: 8px;
        font-size: 14px;
        color: #4e5969;
        text-align: center;
      }
    }
  }
}

.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: relative;
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 80vh;
    overflow-y: auto;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      
      .modal-title {
        font-size: 16px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .modal-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #86909c;
      }
    }
    
    .modal-body {
      padding: 16px;
      
      .order-summary {
        background: #f7f8fa;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          
          &:not(:last-child) {
            border-bottom: 1px dashed #e5e6eb;
          }
          
          .label {
            font-size: 13px;
            color: #86909c;
          }
          
          .value {
            font-size: 13px;
            color: #1d2129;
          }
          
          &.total {
            .label {
              font-weight: 500;
              color: #1d2129;
            }
            
            .value {
              font-size: 16px;
              font-weight: 600;
              color: #ff4d4f;
            }
          }
        }
      }
      
      .payment-method {
        .method-title {
          font-size: 14px;
          font-weight: 500;
          color: #1d2129;
          margin-bottom: 12px;
        }
        
        .method-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .method-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #f7f8fa;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.2s;
          
          &.active {
            border-color: #165dff;
            background: #e8f3ff;
          }
          
          .method-name {
            flex: 1;
            font-size: 14px;
            color: #1d2129;
            margin-left: 12px;
          }
          
          color: #165dff;
        }
      }
    }
    
    .modal-footer {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      
      .upload-voucher {
        flex: 1;
        
        .upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: #f7f8fa;
          border-radius: 8px;
          font-size: 14px;
          color: #4e5969;
        }
      }
      
      .confirm-btn {
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #165dff, #4080ff);
        color: #fff;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }
    }
  }
}
</style>