<template>
  <div class="mp-page">
    <div class="order-tabs">
      <div class="tab-item" :class="{ active: currentTab === 'all' }">全部</div>
      <div class="tab-item" :class="{ active: currentTab === 'pending' }">待付款</div>
      <div class="tab-item" :class="{ active: currentTab === 'delivering' }">配送中</div>
      <div class="tab-item" :class="{ active: currentTab === 'completed' }">已完成</div>
    </div>
    
    <div class="order-list">
      <div class="order-item" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <span class="supplier-name">{{ order.supplierName }}</span>
          <span class="order-status" :class="order.status">{{ order.statusText }}</span>
        </div>
        
        <div class="order-products">
          <div class="product-item" v-for="item in order.items" :key="item.id">
            <img :src="item.image" class="product-image" />
            <div class="product-info">
              <span class="product-name">{{ item.name }}</span>
              <span class="product-spec">{{ item.spec }}</span>
              <div class="product-bottom">
                <span class="product-price">¥{{ item.price }}</span>
                <span class="product-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            共{{ order.totalQuantity }}件商品 合计：<span class="price">¥{{ order.totalPrice }}</span>
          </div>
          <div class="order-actions">
            <span class="btn" v-if="order.status === 'pending'">取消订单</span>
            <span class="btn primary" v-if="order.status === 'pending'">去付款</span>
            <span class="btn" v-if="order.status === 'delivering'">查看物流</span>
            <span class="btn primary" v-if="order.status === 'completed'">再次购买</span>
          </div>
        </div>
      </div>
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
      <div class="tabbar-item" @click="$emit('navigate', 'cart')">
        <icon-shopping-cart />
        <span>购物车</span>
      </div>
      <div class="tabbar-item active">
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
import { ref } from 'vue'

defineEmits(['navigate'])

const currentTab = ref('all')

const orders = ref([
  {
    id: 'o001',
    supplierName: '华新水泥供应商',
    status: 'delivering',
    statusText: '配送中',
    items: [
      { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', price: 420, quantity: 10, image: 'https://picsum.photos/200/200?random=1' },
    ],
    totalQuantity: 10,
    totalPrice: '4200.00',
  },
  {
    id: 'o002',
    supplierName: '宝钢供应商',
    status: 'completed',
    statusText: '已完成',
    items: [
      { id: 2, name: '螺纹钢 HRB400 16mm', spec: '16mm', price: 4000, quantity: 5, image: 'https://picsum.photos/200/200?random=2' },
    ],
    totalQuantity: 5,
    totalPrice: '20000.00',
  },
  {
    id: 'o003',
    supplierName: '南方建材供应商',
    status: 'pending',
    statusText: '待付款',
    items: [
      { id: 3, name: '黄砂 中砂', spec: '中砂', price: 80, quantity: 20, image: 'https://picsum.photos/200/200?random=3' },
    ],
    totalQuantity: 20,
    totalPrice: '1600.00',
  },
])
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 50px;
  position: relative;
}

.order-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  
  &.active {
    color: #165dff;
    font-weight: 600;
    border-bottom: 2px solid #165dff;
  }
}

.order-list {
  padding: 12px 16px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.supplier-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.order-status {
  font-size: 13px;
  
  &.pending {
    color: #ff7d00;
  }
  
  &.delivering {
    color: #165dff;
  }
  
  &.completed {
    color: #00b42a;
  }
}

.order-products {
  padding: 12px;
}

.product-item {
  display: flex;
  padding: 8px 0;
}

.product-image {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.product-info {
  flex: 1;
  margin-left: 12px;
}

.product-name {
  font-size: 13px;
  color: #1d2129;
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
  margin-top: 8px;
}

.product-price {
  font-size: 13px;
  color: #1d2129;
}

.product-quantity {
  font-size: 13px;
  color: #86909c;
}

.order-footer {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
}

.order-total {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 10px;
  text-align: right;
  
  .price {
    color: #f53f3f;
    font-weight: 600;
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  font-size: 12px;
  border-radius: 14px;
  border: 1px solid #e5e6eb;
  color: #4e5969;
  
  &.primary {
    background-color: #165dff;
    border-color: #165dff;
    color: #fff;
  }
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
