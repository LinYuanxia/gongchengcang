<template>
  <div class="mp-page warehouse-order-list">
    <div class="page-header">
      <div class="header-title">采购订单</div>
    </div>
    
    <div class="order-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        待付款
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'paid' }"
        @click="activeTab = 'paid'"
      >
        待发货
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'shipped' }"
        @click="activeTab = 'shipped'"
      >
        待收货
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
       已完成
      </div>
    </div>
    
    <div class="order-list">
      <div class="order-card" v-for="order in filteredOrders" :key="order.id" @click="handleOrderClick(order)">
        <div class="order-header">
          <div class="shop-name">
            <icon-shop />
            <span>{{ order.supplier }}</span>
          </div>
          <div class="order-status" :class="order.status">{{ getStatusText(order.status) }}</div>
        </div>
        
        <div class="order-products">
          <div class="product-item" v-for="product in order.products" :key="product.id">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-spec">{{ product.spec }}</div>
            </div>
            <div class="product-price">
              <div class="price">¥{{ product.price }}</div>
              <div class="quantity">x{{ product.quantity }}</div>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            共{{ order.totalQuantity }}件商品 实付款：<span class="price">¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-actions">
            <div class="action-btn" v-if="order.status === 'pending'" @click.stop="handlePay(order)">立即付款</div>
            <div class="action-btn" v-if="order.status === 'shipped'" @click.stop="handleConfirm(order)">确认收货</div>
            <div class="action-btn outline" @click.stop="handleDetail(order)">查看详情</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeTab = ref('all')

const orders = ref([
  {
    id: 'PO202401150001',
    supplier: '华东建材供应商',
    status: 'pending',
    products: [
      {
        id: 1,
        name: '高标号水泥 P.O42.5',
        spec: '50kg/袋',
        image: 'https://picsum.photos/200/200?random=1',
        price: 28.5,
        quantity: 100,
      },
    ],
    totalQuantity: 100,
    totalAmount: '2850.00',
  },
  {
    id: 'PO202401140002',
    supplier: '钢铁集团供应商',
    status: 'shipped',
    products: [
      {
        id: 2,
        name: '国标螺纹钢 HRB400',
        spec: 'Φ12mm',
        image: 'https://picsum.photos/200/200?random=2',
        price: 4280,
        quantity: 5,
      },
    ],
    totalQuantity: 5,
    totalAmount: '21400.00',
  },
  {
    id: 'PO202401130003',
    supplier: '混凝土供应商',
    status: 'completed',
    products: [
      {
        id: 4,
        name: '商品混凝土 C30',
        spec: '预拌混凝土',
        image: 'https://picsum.photos/200/200?random=4',
        price: 380,
        quantity: 50,
      },
    ],
    totalQuantity: 50,
    totalAmount: '19000.00',
  },
])

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeTab.value)
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'completed': '已完成',
    'cancelled': '已取消',
  }
  return statusMap[status] || status
}

function handleOrderClick(order: any) {
  
}

function handlePay(order: any) {
  
}

function handleConfirm(order: any) {
  
}

function handleDetail(order: any) {
  
}
</script>

<style lang="scss" scoped>
.warehouse-order-list {
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
  justify-content: center;
  z-index: 100;
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.order-tabs {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 99;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 13px;
    color: #666;
    position: relative;
    
    &.active {
      color: #ff6b00;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #ff6b00;
        border-radius: 1px;
      }
    }
  }
}

.order-list {
  padding: 100px 12px 12px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    
    .shop-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #333;
    }
    
    .order-status {
      font-size: 13px;
      
      &.pending {
        color: #ff6b00;
      }
      
      &.shipped {
        color: #1890ff;
      }
      
      &.completed {
        color: #52c41a;
      }
    }
  }
  
  .order-products {
    padding: 12px;
    
    .product-item {
      display: flex;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .product-image {
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
      
      .product-info {
        flex: 1;
        margin-left: 10px;
        
        .product-name {
          font-size: 13px;
          color: #333;
          line-height: 1.4;
        }
        
        .product-spec {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }
      }
      
      .product-price {
        text-align: right;
        
        .price {
          font-size: 13px;
          color: #333;
        }
        
        .quantity {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
  
  .order-footer {
    padding: 12px;
    border-top: 1px solid #f5f5f5;
    
    .order-total {
      font-size: 12px;
      color: #666;
      text-align: right;
      
      .price {
        color: #ff6b00;
        font-weight: 500;
      }
    }
    
    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
      
      .action-btn {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 14px;
        background: #ff6b00;
        color: #fff;
        
        &.outline {
          background: #fff;
          color: #666;
          border: 1px solid #ddd;
        }
      }
    }
  }
}
</style>
