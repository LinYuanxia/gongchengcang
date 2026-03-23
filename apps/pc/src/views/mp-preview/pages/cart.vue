<template>
  <div class="mp-page">
    <div class="cart-list" v-if="cartList.length > 0">
      <div class="cart-group" v-for="group in groupedCart" :key="group.supplierId">
        <div class="group-header">
          <div class="checkbox checked">
            <span>✓</span>
          </div>
          <span class="supplier-name">{{ group.supplierName }}</span>
          <span class="delivery-info">预计{{ group.deliveryDays }}天送达</span>
        </div>
        
        <div class="cart-item" v-for="item in group.items" :key="item.id">
          <div class="checkbox" :class="{ checked: item.checked }">
            <span v-if="item.checked">✓</span>
          </div>
          <img :src="item.image" class="product-image" @click="$emit('navigate', 'product-detail')" />
          <div class="product-info">
            <span class="product-name">{{ item.name }}</span>
            <span class="product-spec">{{ item.spec }}</span>
            <div class="product-bottom">
              <div class="product-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.price }}</span>
              </div>
              <div class="quantity-control">
                <span class="btn">-</span>
                <span class="quantity">{{ item.quantity }}</span>
                <span class="btn">+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty" v-else>
      <span class="empty-icon">🛒</span>
      <span class="empty-text">购物车是空的</span>
      <div class="empty-btn" @click="$emit('navigate', 'market')">去逛逛</div>
    </div>
    
    <div class="bottom-bar" v-if="cartList.length > 0">
      <div class="select-all">
        <div class="checkbox checked">
          <span>✓</span>
        </div>
        <span>全选</span>
      </div>
      <div class="total-info">
        <span class="total-label">合计：</span>
        <span class="total-price">¥{{ totalPrice }}</span>
      </div>
      <div class="submit-btn" @click="$emit('navigate', 'order-create')">结算({{ checkedCount }})</div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>首页</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>市场</span>
      </div>
      <div class="tabbar-item active">
        <icon-shopping-cart />
        <span>购物车</span>
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
import { ref, computed } from 'vue'

defineEmits(['navigate'])

const cartList = ref([
  { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', price: 420, quantity: 10, image: 'https://picsum.photos/200/200?random=1', checked: true, supplierId: 's001', supplierName: '华新水泥供应商', deliveryDays: 2 },
  { id: 2, name: '螺纹钢 HRB400 16mm', spec: '16mm', price: 4000, quantity: 5, image: 'https://picsum.photos/200/200?random=2', checked: false, supplierId: 's003', supplierName: '宝钢供应商', deliveryDays: 3 },
  { id: 3, name: '黄砂 中砂', spec: '中砂', price: 80, quantity: 20, image: 'https://picsum.photos/200/200?random=3', checked: true, supplierId: 's004', supplierName: '南方建材供应商', deliveryDays: 1 },
])

const groupedCart = computed(() => {
  const groups: Record<string, any> = {}
  cartList.value.forEach(item => {
    if (!groups[item.supplierId]) {
      groups[item.supplierId] = {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        deliveryDays: item.deliveryDays,
        items: [],
      }
    }
    groups[item.supplierId].items.push(item)
  })
  return Object.values(groups)
})

const checkedCount = computed(() => cartList.value.filter(item => item.checked).length)

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 150px;
  position: relative;
}

.cart-list {
  padding: 12px 16px;
}

.cart-group {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 12px;
  color: #fff;
  
  &.checked {
    background-color: #165dff;
    border-color: #165dff;
  }
}

.supplier-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.delivery-info {
  font-size: 11px;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 2px 6px;
  border-radius: 2px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.product-info {
  flex: 1;
  margin-left: 12px;
}

.product-name {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.product-spec {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  display: block;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  color: #f53f3f;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #f53f3f;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.btn {
  width: 24px;
  height: 24px;
  background-color: #f7f8fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #1d2129;
}

.quantity {
  width: 36px;
  text-align: center;
  font-size: 14px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 24px;
}

.empty-btn {
  padding: 10px 40px;
  background-color: #165dff;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
}

.bottom-bar {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.select-all {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #1d2129;
}

.total-info {
  flex: 1;
  text-align: right;
  margin-right: 12px;
}

.total-label {
  font-size: 14px;
  color: #1d2129;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #f53f3f;
}

.submit-btn {
  padding: 8px 24px;
  background-color: #165dff;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
}

.tabbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
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
