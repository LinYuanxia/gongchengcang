<template>
  <div class="mp-page sales-order-detail">
    <div class="page-header">
      <div class="header-left" @click="$emit('navigate', 'sales-order-list')">
        <icon-arrow-left class="back-icon" />
      </div>
      <div class="header-title">订单详情</div>
      <div class="header-right"></div>
    </div>
    
    <div class="detail-container">
      <div class="status-card" :class="order.status">
        <div class="status-icon">
          <icon-clock v-if="order.status === 'pending_pay'" />
          <icon-truck v-else-if="order.status === 'pending_ship'" />
          <icon-check-circle v-else-if="order.status === 'shipped'" />
          <icon-check-circle-fill v-else-if="order.status === 'completed'" />
          <icon-close-circle v-else />
        </div>
        <div class="status-info">
          <div class="status-text">{{ getStatusText(order.status) }}</div>
          <div class="status-tip">{{ getStatusTip(order.status) }}</div>
        </div>
        <div class="order-no">{{ order.orderNo }}</div>
      </div>
      
      <div class="info-card">
        <div class="card-title">施工方信息</div>
        <div class="info-list">
          <div class="info-row">
            <span class="label">施工方名称</span>
            <span class="value">{{ order.constructionName }}</span>
          </div>
          <div class="info-row">
            <span class="label">联系人</span>
            <span class="value">{{ order.contactName }}</span>
          </div>
          <div class="info-row">
            <span class="label">联系电话</span>
            <span class="value">{{ order.contactPhone }}</span>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-title">收货地址</div>
        <div class="address-content">
          <div class="address-tag">
            <span class="tag-item">{{ order.address.province }}</span>
            <span class="tag-item">{{ order.address.city }}</span>
          </div>
          <div class="address-detail">{{ order.address.detail }}</div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-title">商品明细</div>
        <div class="product-list">
          <div class="product-item" v-for="product in order.products" :key="product.id">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-spec">{{ product.spec }}</div>
              <div class="product-footer">
                <span class="price">¥{{ product.price }}</span>
                <span class="quantity">x{{ product.qty }} {{ product.unit }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="order-summary">
          <div class="summary-row">
            <span class="label">商品种类</span>
            <span class="value">{{ order.productCount }}种</span>
          </div>
          <div class="summary-row">
            <span class="label">商品数量</span>
            <span class="value">{{ order.totalQty }} {{ order.unit }}</span>
          </div>
          <div class="summary-row total">
            <span class="label">订单金额</span>
            <span class="value">¥{{ order.totalAmount }}</span>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-title">订单状态</div>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">收款状态</div>
            <div class="status-value" :class="order.paymentStatus">
              {{ getPaymentStatusText(order.paymentStatus) }}
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">出库状态</div>
            <div class="status-value">{{ getOutboundStatusText(order.outboundStatus) }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">创建时间</div>
            <div class="status-value">{{ order.createdAt }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">所属仓库</div>
            <div class="status-value">{{ order.warehouseName }}</div>
          </div>
        </div>
      </div>
      
      <div class="info-card" v-if="order.shipments.length > 0">
        <div class="card-title">发货记录</div>
        <div class="shipment-list">
          <div class="shipment-item" v-for="shipment in order.shipments" :key="shipment.id">
            <div class="shipment-header">
              <span class="shipment-no">发货单：{{ shipment.shipNo }}</span>
              <span class="shipment-date">{{ shipment.shippedAt }}</span>
            </div>
            <div class="shipment-products">
              <div 
                class="shipment-product" 
                v-for="item in shipment.products" 
                :key="item.productId"
              >
                <span class="name">{{ item.productName }}</span>
                <span class="qty">{{ item.qty }} {{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <a-button 
        class="action-btn confirm" 
        v-if="order.status === 'pending_ship' && order.paymentStatus === 'pending'"
        @click="handleConfirmPayment"
      >
        审核收款
      </a-button>
      <a-button 
        type="primary" 
        class="action-btn ship" 
        v-if="order.status === 'pending_ship' && order.paymentStatus === 'confirmed'"
        @click="handleShip"
      >
        发货
      </a-button>
      <a-button 
        type="primary" 
        class="action-btn reissue" 
        v-if="order.status === 'shipped' || order.status === 'completed'"
        @click="handleReissue"
      >
        补发
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

defineEmits(['navigate'])

const order = reactive({
  id: 1,
  orderNo: 'SO202401130003',
  constructionName: '佛山幕墙工程公司',
  contactName: '张经理',
  contactPhone: '138****8888',
  productCount: 2,
  totalQty: 100,
  unit: '桶',
  totalAmount: '22,400.00',
  status: 'pending_ship',
  paymentStatus: 'confirmed',
  outboundStatus: 'partial',
  warehouseName: '广州白云仓库',
  createdAt: '2024-01-13 09:15',
  address: {
    province: '广东省',
    city: '佛山市',
    detail: '南海区桂城街道XXX工地',
  },
  products: [
    {
      id: 4,
      name: '防水涂料 K11',
      spec: '20kg/桶',
      image: 'https://picsum.photos/100/100?random=1',
      price: 280,
      qty: 80,
      unit: '桶',
    },
    {
      id: 5,
      name: '瓷砖胶',
      spec: '20kg/桶',
      image: 'https://picsum.photos/100/100?random=2',
      price: 320,
      qty: 20,
      unit: '桶',
    },
  ],
  shipments: [
    {
      id: 1,
      shipNo: 'SH202401140001',
      shippedAt: '2024-01-14 15:30',
      products: [
        { productId: 4, productName: '防水涂料 K11', qty: 50, unit: '桶' },
      ],
    },
  ],
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending_pay: '待支付',
    pending_ship: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    closed: '已关闭',
  }
  return map[status] || status
}

function getStatusTip(status: string) {
  const map: Record<string, string> = {
    pending_pay: '等待施工方支付',
    pending_ship: '收款已确认，等待发货',
    shipped: '已发货，等待施工方确认收货',
    completed: '订单已完成',
  }
  return map[status] || ''
}

function getPaymentStatusText(status: string) {
  const map: Record<string, string> = {
    unpaid: '未支付',
    pending: '待确认',
    confirmed: '已确认',
  }
  return map[status] || status
}

function getOutboundStatusText(status: string) {
  const map: Record<string, string> = {
    none: '未出库',
    partial: '部分出库',
    shipped: '已出库',
  }
  return map[status] || status
}

function handleConfirmPayment() {
  Message.success('收款审核通过')
  order.paymentStatus = 'confirmed'
}

function handleShip() {
  Message.success('发货功能已触发')
}

function handleReissue() {
  Message.success('补发功能已触发')
}
</script>

<style lang="scss" scoped>
.sales-order-detail {
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

.detail-container {
  padding: 54px 12px 12px;
}

.status-card {
  background: linear-gradient(135deg, #fff7e6, #fff0d6);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  
  &.pending_pay {
    background: linear-gradient(135deg, #fff7e6, #fff0d6);
  }
  
  &.pending_ship {
    background: linear-gradient(135deg, #e6f7ff, #d6f0ff);
  }
  
  &.shipped {
    background: linear-gradient(135deg, #f6ffed, #e6ffd6);
  }
  
  &.completed {
    background: linear-gradient(135deg, #f5f5f5, #eeeeee);
  }
  
  .status-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    
    svg {
      font-size: 24px;
      color: #ff7d00;
    }
    
    .pending_ship & svg {
      color: #1890ff;
    }
    
    .shipped & svg, .completed & svg {
      color: #52c41a;
    }
  }
  
  .status-info {
    flex: 1;
    
    .status-text {
      font-size: 17px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 4px;
    }
    
    .status-tip {
      font-size: 13px;
      color: #86909c;
    }
  }
  
  .order-no {
    font-size: 12px;
    color: #86909c;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
  }
}

.info-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #165dff;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .label {
      font-size: 14px;
      color: #86909c;
    }
    
    .value {
      font-size: 14px;
      color: #1d2129;
    }
  }
}

.address-content {
  .address-tag {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    
    .tag-item {
      padding: 4px 10px;
      background: #f5f7ff;
      color: #165dff;
      font-size: 12px;
      border-radius: 4px;
    }
  }
  
  .address-detail {
    font-size: 14px;
    color: #1d2129;
    line-height: 1.5;
  }
}

.product-list {
  .product-item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f2f3f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .product-image {
      width: 70px;
      height: 70px;
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
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .product-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .product-spec {
        font-size: 12px;
        color: #86909c;
      }
      
      .product-footer {
        display: flex;
        justify-content: space-between;
        
        .price {
          font-size: 14px;
          font-weight: 600;
          color: #f53f3f;
        }
        
        .quantity {
          font-size: 12px;
          color: #86909c;
        }
      }
    }
  }
}

.order-summary {
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    
    .label {
      font-size: 13px;
      color: #86909c;
    }
    
    .value {
      font-size: 13px;
      color: #1d2129;
    }
    
    &.total {
      margin-top: 4px;
      
      .label {
        font-size: 14px;
        font-weight: 500;
        color: #4e5969;
      }
      
      .value {
        font-size: 18px;
        font-weight: 600;
        color: #f53f3f;
      }
    }
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .status-item {
    background: #f5f7ff;
    border-radius: 8px;
    padding: 12px;
    
    .status-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;
    }
    
    .status-value {
      font-size: 13px;
      font-weight: 500;
      color: #1d2129;
      
      &.pending {
        color: #ff7d00;
      }
      
      &.confirmed {
        color: #00b42a;
      }
    }
  }
}

.shipment-list {
  .shipment-item {
    background: #f5f7ff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .shipment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      .shipment-no {
        font-size: 13px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .shipment-date {
        font-size: 12px;
        color: #86909c;
      }
    }
    
    .shipment-products {
      .shipment-product {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        
        .name {
          font-size: 13px;
          color: #4e5969;
        }
        
        .qty {
          font-size: 13px;
          font-weight: 500;
          color: #165dff;
        }
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  display: flex;
  gap: 12px;
  
  .action-btn {
    flex: 1;
    height: 44px;
    border-radius: 22px;
    font-size: 15px;
    
    &.confirm {
      background: #fff7e6;
      color: #ff7d00;
      border: 1px solid #ff7d00;
    }
    
    &.reissue {
      background: #f5f7ff;
      color: #165dff;
      border: 1px solid #165dff;
    }
  }
}
</style>
