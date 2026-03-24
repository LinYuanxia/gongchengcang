<template>
  <div class="mp-page order">
    <div class="page-header">
      <div class="header-title">订单管理</div>
      <div class="header-action" @click="handleSearch">
        <icon-search />
      </div>
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
        待付款
        <span class="badge" v-if="statusCount.pending > 0">{{ statusCount.pending }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'shipping' }"
        @click="activeStatus = 'shipping'"
      >
        待收货
        <span class="badge" v-if="statusCount.shipping > 0">{{ statusCount.shipping }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'completed' }"
        @click="activeStatus = 'completed'"
      >
        已完成
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'refund' }"
        @click="activeStatus = 'refund'"
      >
        售后中
      </div>
    </div>
    
    <div class="project-filter">
      <div class="filter-label">项目筛选</div>
      <div class="filter-picker" @click="showProjectPicker = true">
        <span v-if="selectedProject">{{ selectedProject }}</span>
        <span class="placeholder" v-else>全部项目</span>
        <icon-down class="picker-arrow" />
      </div>
    </div>
    
    <div class="order-list">
      <div class="order-item" v-for="item in filteredOrders" :key="item.id" @click="handleDetail(item)">
        <div class="order-header">
          <div class="order-no">{{ item.orderNo }}</div>
          <div class="order-status" :class="item.status">{{ getStatusText(item.status) }}</div>
        </div>
        
        <div class="order-project">
          <icon-folder class="project-icon" />
          <span>{{ item.projectName }}</span>
        </div>
        
        <div class="order-products">
          <div class="product-item" v-for="product in item.products" :key="product.id">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-spec">{{ product.spec }}</div>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span class="qty">x{{ product.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <span class="label">工程仓</span>
            <span class="value">{{ item.warehouseName }}</span>
          </div>
          <div class="summary-row">
            <span class="label">下单时间</span>
            <span class="value">{{ item.createTime }}</span>
          </div>
          <div class="summary-row total">
            <span class="label">订单金额</span>
            <span class="value price">¥{{ item.totalAmount }}</span>
          </div>
        </div>
        
        <div class="order-actions">
          <template v-if="item.status === 'pending'">
            <span class="action-btn" @click.stop="handleCancel(item)">取消订单</span>
            <span class="action-btn primary" @click.stop="handlePay(item)">立即支付</span>
          </template>
          <template v-if="item.status === 'shipping'">
            <span class="action-btn" @click.stop="handleLogistics(item)">查看物流</span>
            <span class="action-btn primary" @click.stop="handleConfirm(item)">确认收货</span>
          </template>
          <template v-if="item.status === 'completed'">
            <span class="action-btn" @click.stop="handleRefund(item)">申请售后</span>
            <span class="action-btn" @click.stop="handleInvoice(item)">申请开票</span>
          </template>
          <template v-if="item.status === 'refund'">
            <span class="action-btn" @click.stop="handleRefundDetail(item)">售后详情</span>
          </template>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>商品市场</span>
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
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeStatus = ref('all')
const selectedProject = ref('')
const showProjectPicker = ref(false)

const statusCount = ref({
  pending: 2,
  shipping: 3,
  completed: 10,
  refund: 1
})

const orders = ref([
  {
    id: 1,
    orderNo: 'PO202401150001',
    projectName: '星巴克深圳万象城店',
    warehouseName: '深圳工程仓',
    status: 'pending',
    totalAmount: '35,000',
    createTime: '2024-01-15 14:30',
    products: [
      { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', price: '350', quantity: 100, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 2,
    orderNo: 'PO202401120002',
    projectName: '星巴克深圳万象城店',
    warehouseName: '深圳工程仓',
    status: 'shipping',
    totalAmount: '28,500',
    createTime: '2024-01-12 10:20',
    products: [
      { id: 2, name: '螺纹钢 HRB400', spec: '12mm', price: '4,200', quantity: 5, image: 'https://via.placeholder.com/80' },
      { id: 3, name: '防水涂料', spec: 'JS型 20kg/桶', price: '170', quantity: 10, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 3,
    orderNo: 'PO202401100003',
    projectName: '喜茶广州天河城店',
    warehouseName: '广州工程仓',
    status: 'completed',
    totalAmount: '21,500',
    createTime: '2024-01-10 16:45',
    products: [
      { id: 4, name: 'PVC管材', spec: 'DN110', price: '32', quantity: 200, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 4,
    orderNo: 'PO202401080004',
    projectName: '奈雪深圳海岸城店',
    warehouseName: '深圳工程仓',
    status: 'refund',
    totalAmount: '8,500',
    createTime: '2024-01-08 09:15',
    products: [
      { id: 5, name: '电线 BV', spec: '2.5mm²', price: '5.6', quantity: 500, image: 'https://via.placeholder.com/80' }
    ]
  }
])

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') return orders.value
  return orders.value.filter(order => order.status === activeStatus.value)
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    'pending': '待付款',
    'shipping': '待收货',
    'completed': '已完成',
    'refund': '售后中'
  }
  return map[status] || status
}

function handleSearch() {
  console.log('搜索订单')
}

function handleDetail(item: any) {
  console.log('订单详情:', item.orderNo)
}

function handleCancel(item: any) {
  console.log('取消订单:', item.orderNo)
}

function handlePay(item: any) {
  console.log('支付订单:', item.orderNo)
}

function handleLogistics(item: any) {
  console.log('查看物流:', item.orderNo)
}

function handleConfirm(item: any) {
  console.log('确认收货:', item.orderNo)
}

function handleRefund(item: any) {
  console.log('申请售后:', item.orderNo)
}

function handleInvoice(item: any) {
  console.log('申请开票:', item.orderNo)
}

function handleRefundDetail(item: any) {
  console.log('售后详情:', item.orderNo)
}
</script>

<style lang="scss" scoped>
.order {
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
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
  
  .header-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
}

.status-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  margin-top: 44px;
  
  .tab-item {
    padding: 12px 12px;
    font-size: 14px;
    color: #666;
    position: relative;
    display: flex;
    align-items: center;
    
    &.active {
      color: #165dff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #165dff;
        border-radius: 1px;
      }
    }
    
    .badge {
      background: #f53f3f;
      color: #fff;
      font-size: 10px;
      padding: 1px 4px;
      border-radius: 8px;
      margin-left: 4px;
    }
  }
}

.project-filter {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 10px 16px;
  border-bottom: 1px solid #f2f3f5;
  
  .filter-label {
    font-size: 13px;
    color: #86909c;
    margin-right: 12px;
  }
  
  .filter-picker {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #1d2129;
    
    .placeholder {
      color: #c9cdd4;
    }
    
    .picker-arrow {
      margin-left: 4px;
      color: #c9cdd4;
    }
  }
}

.order-list {
  padding: 12px;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .order-no {
      font-size: 13px;
      color: #86909c;
    }
    
    .order-status {
      font-size: 12px;
      font-weight: 500;
      
      &.pending {
        color: #ff7d00;
      }
      
      &.shipping {
        color: #165dff;
      }
      
      &.completed {
        color: #00b42a;
      }
      
      &.refund {
        color: #f53f3f;
      }
    }
  }
  
  .order-project {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #4e5969;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f2f3f5;
    
    .project-icon {
      color: #165dff;
    }
  }
  
  .order-products {
    .product-item {
      display: flex;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f2f3f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .product-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
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
          margin-bottom: 6px;
        }
        
        .product-price {
          display: flex;
          justify-content: space-between;
          
          .price {
            font-size: 14px;
            color: #f53f3f;
          }
          
          .qty {
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }
  }
  
  .order-summary {
    padding: 10px 0;
    border-top: 1px solid #f2f3f5;
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      
      .label {
        color: #86909c;
      }
      
      .value {
        color: #1d2129;
        
        &.price {
          color: #f53f3f;
          font-weight: 500;
        }
      }
      
      &.total {
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px dashed #f2f3f5;
      }
    }
  }
  
  .order-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid #f2f3f5;
    
    .action-btn {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      background: #f2f3f5;
      color: #4e5969;
      
      &.primary {
        background: #165dff;
        color: #fff;
      }
    }
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
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
