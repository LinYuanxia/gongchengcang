<template>
  <div class="mp-page supplier-supply-manage">
    <div class="page-header">
      <div class="header-title">供货管理</div>
    </div>
    
    <div class="status-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'all' }"
        @click="activeStatus = 'all'"
      >
        全部
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'pending' }"
        @click="activeStatus = 'pending'"
      >
        待处理
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'processing' }"
        @click="activeStatus = 'processing'"
      >
        处理中
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'shipped' }"
        @click="activeStatus = 'shipped'"
      >
        已发货
      </div>
    </div>
    
    <div class="order-list">
      <div class="order-card" v-for="order in filteredOrders" :key="order.id">
        <div class="order-header">
          <div class="order-no">订单号: {{ order.id }}</div>
          <div class="order-status" :class="order.status">{{ getStatusText(order.status) }}</div>
        </div>
        
        <div class="buyer-info">
          <div class="buyer-avatar">
            <img :src="order.buyer.avatar" :alt="order.buyer.name" />
          </div>
          <div class="buyer-detail">
            <div class="buyer-name">{{ order.buyer.name }}</div>
            <div class="buyer-meta">
              <icon-location />
              <span>{{ order.buyer.address }}</span>
            </div>
          </div>
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
            共{{ order.totalQuantity }}件商品 合计：<span class="price">¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-actions">
            <div class="action-btn" v-if="order.status === 'pending'" @click="handleAccept(order)">接单</div>
            <div class="action-btn" v-if="order.status === 'processing'" @click="handleShip(order)">发货</div>
            <div class="action-btn outline" @click="handleDetail(order)">详情</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeStatus = ref('all')

const orders = ref([
  {
    id: 'SO202401150001',
    status: 'pending',
    buyer: {
      name: '华东工程仓',
      avatar: 'https://picsum.photos/100/100?random=11',
      address: '南京市鼓楼区XX路XX号',
    },
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
    id: 'SO202401140002',
    status: 'processing',
    buyer: {
      name: '南京工程仓',
      avatar: 'https://picsum.photos/100/100?random=12',
      address: '南京市玄武区XX路XX号',
    },
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
    id: 'SO202401130003',
    status: 'shipped',
    buyer: {
      name: '苏州工程仓',
      avatar: 'https://picsum.photos/100/100?random=13',
      address: '苏州市工业园区XX路XX号',
    },
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
  if (activeStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeStatus.value)
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'shipped': '已发货',
    'completed': '已完成',
  }
  return statusMap[status] || status
}

function handleAccept(order: any) {
  order.status = 'processing'
}

function handleShip(order: any) {
  order.status = 'shipped'
}

function handleDetail(order: any) {
  
}
</script>

<style lang="scss" scoped>
.supplier-supply-manage {
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

.status-tabs {
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
      color: #1890ff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #1890ff;
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
    
    .order-no {
      font-size: 12px;
      color: #999;
    }
    
    .order-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      
      &.pending {
        background: #fff7e6;
        color: #fa8c16;
      }
      
      &.processing {
        background: #e6f7ff;
        color: #1890ff;
      }
      
      &.shipped {
        background: #f6ffed;
        color: #52c41a;
      }
    }
  }
  
  .buyer-info {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fafafa;
    
    .buyer-avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .buyer-detail {
      flex: 1;
      margin-left: 10px;
      
      .buyer-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
      
      .buyer-meta {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #999;
        margin-top: 4px;
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
        color: #ff4d4f;
        font-weight: 500;
      }
    }
    
    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
      
      .action-btn {
        padding: 6px 16px;
        font-size: 12px;
        border-radius: 14px;
        background: #1890ff;
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
