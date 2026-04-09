<template>
  <div class="mp-page order">
    <div class="page-header">
      <div class="search-bar" @click="showSearchPopup = true">
        <icon-search class="search-icon" />
        <span class="search-placeholder">搜索商品/订单号</span>
      </div>
    </div>
    
    <div class="status-tabs" ref="tabsRef">
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
        待发货
        <span class="badge" v-if="statusCount.shipping > 0">{{ statusCount.shipping }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'receiving' }"
        @click="activeStatus = 'receiving'"
      >
        待收货
        <span class="badge" v-if="statusCount.receiving > 0">{{ statusCount.receiving }}</span>
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
        :class="{ active: activeStatus === 'aftersale' }"
        @click="activeStatus = 'aftersale'"
      >
        售后
        <span class="badge" v-if="statusCount.aftersale > 0">{{ statusCount.aftersale }}</span>
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
            <span class="label">共{{ item.totalQty }}件商品</span>
            <span class="value price">实付 ¥{{ item.totalAmount }}</span>
          </div>
        </div>
        
        <div class="order-actions">
          <template v-if="item.status === 'pending'">
            <span class="action-btn" @click.stop="handleCancel(item)">取消订单</span>
            <span class="action-btn primary" @click.stop="handlePay(item)">立即支付</span>
          </template>
          <template v-if="item.status === 'shipping'">
            <span class="action-btn" @click.stop="handleRemind(item)">提醒发货</span>
          </template>
          <template v-if="item.status === 'receiving'">
            <span class="action-btn" @click.stop="handleLogistics(item)">查看物流</span>
            <span class="action-btn primary" @click.stop="handleConfirm(item)">确认收货</span>
          </template>
          <template v-if="item.status === 'completed'">
            <span class="action-btn" @click.stop="handleAftersale(item)">申请售后</span>
            <span class="action-btn" @click.stop="handleInvoice(item)">申请开票</span>
            <span class="action-btn primary" @click.stop="handleRebuy(item)">再次购买</span>
          </template>
          <template v-if="item.status === 'aftersale'">
            <span class="action-btn" @click.stop="handleAftersaleDetail(item)">售后详情</span>
          </template>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-if="filteredOrders.length === 0">
      <icon-file />
      <span>暂无相关订单</span>
    </div>
    
    <div class="search-popup" v-if="showSearchPopup">
      <div class="popup-mask" @click="showSearchPopup = false"></div>
      <div class="popup-content">
        <div class="search-header">
          <div class="search-input-wrap">
            <icon-search class="search-icon" />
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索商品/订单号" 
              class="search-input"
              autofocus
            />
            <div class="search-clear" v-if="searchKeyword" @click="searchKeyword = ''">
              <icon-close />
            </div>
          </div>
          <div class="search-cancel" @click="showSearchPopup = false">取消</div>
        </div>
        <div class="search-result">
          <div class="result-empty" v-if="!searchKeyword">
            <icon-search />
            <span>请输入关键词搜索</span>
          </div>
          <div class="result-list" v-else-if="searchResults.length > 0">
            <div 
              class="result-item" 
              v-for="item in searchResults" 
              :key="item.id"
              @click="handleDetail(item)"
            >
              <div class="item-order-no">{{ item.orderNo }}</div>
              <div class="item-project">{{ item.projectName }}</div>
            </div>
          </div>
          <div class="result-empty" v-else>
            <icon-search />
            <span>未找到相关订单</span>
          </div>
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
const showSearchPopup = ref(false)
const searchKeyword = ref('')

const statusCount = ref({
  pending: 2,
  shipping: 2,
  receiving: 1,
  completed: 10,
  aftersale: 1,
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    shipping: '待发货',
    receiving: '待收货',
    completed: '已完成',
    aftersale: '售后中',
  }
  return statusMap[status] || '未知状态'
}

const orders = ref([
  {
    id: 1,
    orderNo: 'PO202401150001',
    projectName: '星巴克深圳万象城店',
    status: 'pending',
    totalAmount: '35,000',
    totalQty: 3,
    products: [
      { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', price: '350', quantity: 100, image: 'https://picsum.photos/80/80?random=1' }
    ]
  },
  {
    id: 2,
    orderNo: 'PO202401140002',
    projectName: '喜茶广州天河城店',
    status: 'shipping',
    totalAmount: '12,500',
    totalQty: 5,
    products: [
      { id: 2, name: 'PPR冷热水管 S3.2', spec: 'DN20 4米/根', price: '32', quantity: 50, image: 'https://picsum.photos/80/80?random=2' }
    ]
  },
  {
    id: 3,
    orderNo: 'PO202401130003',
    projectName: '瑞幸咖啡东莞万达店',
    status: 'receiving',
    totalAmount: '8,600',
    totalQty: 2,
    products: [
      { id: 3, name: 'BV铜芯线 2.5mm²', spec: '100米/卷', price: '185', quantity: 20, image: 'https://picsum.photos/80/80?random=3' }
    ]
  },
  {
    id: 4,
    orderNo: 'PO202401100004',
    projectName: '星巴克深圳万象城店',
    status: 'completed',
    totalAmount: '45,200',
    totalQty: 8,
    products: [
      { id: 4, name: '防水涂料 K11', spec: '20kg/桶', price: '280', quantity: 30, image: 'https://picsum.photos/80/80?random=4' }
    ]
  },
  {
    id: 5,
    orderNo: 'PO202401080005',
    projectName: '喜茶广州天河城店',
    status: 'aftersale',
    totalAmount: '6,800',
    totalQty: 1,
    products: [
      { id: 5, name: '黄砂 中砂', spec: '吨', price: '95', quantity: 50, image: 'https://picsum.photos/80/80?random=5' }
    ]
  },
])

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (activeStatus.value === 'all') return true
    return order.status === activeStatus.value
  })
})

const searchResults = computed(() => {
  if (!searchKeyword.value) return []
  return orders.value.filter(item => 
    item.orderNo.toLowerCase().includes(searchKeyword.value.toLowerCase()) || 
    item.projectName.includes(searchKeyword.value) ||
    item.products.some(p => p.name.includes(searchKeyword.value))
  )
})

function handleDetail(item: any) {
  showSearchPopup.value = false
  emit('navigate', 'order-detail', { orderId: item.id })
}

function handleCancel(item: any) {
  console.log('取消订单', item)
}

function handlePay(item: any) {
  emit('navigate', 'payment', { orderId: item.id })
}

function handleRemind(item: any) {
  console.log('提醒发货', item)
}

function handleLogistics(item: any) {
  emit('navigate', 'logistics', { orderId: item.id })
}

function handleConfirm(item: any) {
  console.log('确认收货', item)
}

function handleAftersale(item: any) {
  emit('navigate', 'aftersale-apply', { orderId: item.id })
}

function handleAftersaleDetail(item: any) {
  emit('navigate', 'aftersale-detail', { orderId: item.id })
}

function handleInvoice(item: any) {
  emit('navigate', 'invoice-apply', { orderId: item.id })
}

function handleRebuy(item: any) {
  emit('navigate', 'market')
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
  background: linear-gradient(135deg, #165dff, #4080ff);
  padding: 10px 16px;
  z-index: 100;
  
  .search-bar {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 0 14px;
    height: 36px;
    
    .search-icon {
      color: #86909c;
      font-size: 16px;
      margin-right: 8px;
    }
    
    .search-placeholder {
      font-size: 14px;
      color: #86909c;
    }
  }
}

.status-tabs {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  z-index: 99;
  
  .tab-item {
    flex-shrink: 0;
    padding: 14px 16px;
    font-size: 14px;
    color: #4e5969;
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    
    .badge {
      background: #f53f3f;
      color: #fff;
      font-size: 10px;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    
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
        height: 3px;
        background: linear-gradient(90deg, #165dff, #4080ff);
        border-radius: 2px;
      }
    }
  }
}

.order-list {
  padding: 106px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  .order-item {
    background: #fff;
    border-radius: 10px;
    padding: 14px;
    
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
        font-size: 13px;
        font-weight: 500;
        
        &.pending {
          color: #ff7d00;
        }
        
        &.shipping {
          color: #165dff;
        }
        
        &.receiving {
          color: #722ed1;
        }
        
        &.completed {
          color: #00b42a;
        }
        
        &.aftersale {
          color: #f53f3f;
        }
      }
    }
    
    .order-project {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #1d2129;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f2f3f5;
      
      .project-icon {
        color: #165dff;
        font-size: 16px;
      }
    }
    
    .order-products {
      .product-item {
        display: flex;
        margin-bottom: 10px;
        
        .product-image {
          width: 60px;
          height: 60px;
          border-radius: 6px;
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
          margin-left: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .product-name {
            font-size: 13px;
            color: #1d2129;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .product-spec {
            font-size: 11px;
            color: #86909c;
          }
          
          .product-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .price {
              font-size: 14px;
              font-weight: 600;
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
        align-items: center;
        
        .label {
          font-size: 12px;
          color: #86909c;
        }
        
        .value {
          font-size: 12px;
          color: #1d2129;
          
          &.price {
            font-size: 15px;
            font-weight: 600;
            color: #f53f3f;
          }
        }
      }
    }
    
    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid #f2f3f5;
      
      .action-btn {
        padding: 6px 16px;
        border-radius: 16px;
        font-size: 12px;
        border: 1px solid #e5e6eb;
        color: #4e5969;
        
        &.primary {
          background: linear-gradient(135deg, #165dff, #4080ff);
          color: #fff;
          border: none;
        }
        
        &.reminder {
          border-color: #165dff;
          color: #165dff;
        }
      }
    }
  }
}

.empty-state {
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #c9cdd4;
  font-size: 14px;
}

.search-popup {
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
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    
    .search-header {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      gap: 12px;
      border-bottom: 1px solid #f2f3f5;
      
      .search-input-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        background: #f2f3f5;
        border-radius: 20px;
        padding: 0 12px;
        height: 36px;
        
        .search-icon {
          color: #86909c;
          font-size: 16px;
        }
        
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          margin-left: 8px;
          font-size: 14px;
          outline: none;
          
          &::placeholder {
            color: #c9cdd4;
          }
        }
        
        .search-clear {
          color: #c9cdd4;
          font-size: 16px;
        }
      }
      
      .search-cancel {
        font-size: 14px;
        color: #4e5969;
      }
    }
    
    .search-result {
      flex: 1;
      overflow-y: auto;
      
      .result-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px 20px;
        gap: 12px;
        color: #c9cdd4;
        font-size: 14px;
      }
      
      .result-list {
        .result-item {
          padding: 14px 16px;
          border-bottom: 1px solid #f2f3f5;
          
          .item-order-no {
            font-size: 14px;
            color: #1d2129;
            margin-bottom: 4px;
          }
          
          .item-project {
            font-size: 12px;
            color: #86909c;
          }
        }
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
  z-index: 98;
  
  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #86909c;
    
    svg {
      font-size: 20px;
    }
    
    span {
      font-size: 10px;
    }
    
    &.active {
      color: #165dff;
    }
  }
}
</style>
