<template>
  <div class="mp-page sales-order-list">
    <div class="page-header">
      <div class="header-left" @click="$emit('navigate', 'index')">
        <icon-arrow-left class="back-icon" />
      </div>
      <div class="header-title">销售订单</div>
      <div class="header-right"></div>
    </div>
    
    <div class="filter-section">
      <div class="search-box">
        <icon-search class="search-icon" />
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索订单编号或施工方"
          @input="handleSearch"
        />
      </div>
      <div class="filter-btn" @click="showFilterPanel = true">
        <icon-filter class="filter-icon" />
        <span>筛选</span>
      </div>
    </div>
    
    <div class="status-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'all' }"
        @click="activeStatus = 'all'"
      >
        全部
        <span class="badge" v-if="statusCount.all > 0">{{ statusCount.all }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'pending_pay' }"
        @click="activeStatus = 'pending_pay'"
      >
        待支付
        <span class="badge" v-if="statusCount.pending_pay > 0">{{ statusCount.pending_pay }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'pending_ship' }"
        @click="activeStatus = 'pending_ship'"
      >
        待发货
        <span class="badge" v-if="statusCount.pending_ship > 0">{{ statusCount.pending_ship }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'shipped' }"
        @click="activeStatus = 'shipped'"
      >
        已发货
        <span class="badge" v-if="statusCount.shipped > 0">{{ statusCount.shipped }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'completed' }"
        @click="activeStatus = 'completed'"
      >
        已完成
        <span class="badge" v-if="statusCount.completed > 0">{{ statusCount.completed }}</span>
      </div>
    </div>
    
    <div class="order-list">
      <div 
        class="order-card" 
        v-for="order in filteredOrders" 
        :key="order.id"
        @click="handleDetail(order)"
      >
        <div class="order-header">
          <div class="order-no">{{ order.orderNo }}</div>
          <div class="order-status" :class="order.status">{{ getStatusText(order.status) }}</div>
        </div>
        
        <div class="order-info">
          <div class="info-row">
            <span class="label">施工方</span>
            <span class="value">{{ order.constructionName }}</span>
          </div>
          <div class="info-row">
            <span class="label">商品数/数量</span>
            <span class="value">{{ order.productCount }}种 / {{ order.totalQty }}{{ order.unit }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单金额</span>
            <span class="value price">¥{{ order.totalAmount }}</span>
          </div>
          <div class="info-row">
            <span class="label">收款状态</span>
            <span class="value" :class="order.paymentStatus">
              {{ getPaymentStatusText(order.paymentStatus) }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">出库状态</span>
            <span class="value">{{ getOutboundStatusText(order.outboundStatus) }}</span>
          </div>
        </div>
        
        <div class="order-footer">
          <span class="create-time">{{ order.createdAt }}</span>
          <div class="actions">
            <span 
              class="action-btn confirm" 
              v-if="order.status === 'pending_ship' && order.paymentStatus === 'pending'"
              @click.stop="handleConfirmPayment(order)"
            >
              审核收款
            </span>
            <span 
              class="action-btn ship" 
              v-if="order.status === 'pending_ship' && order.paymentStatus === 'confirmed'"
              @click.stop="handleShip(order)"
            >
              发货
            </span>
            <span class="action-btn detail" @click.stop="handleDetail(order)">详情</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-if="filteredOrders.length === 0">
      <icon-file />
      <span>暂无销售订单</span>
    </div>
    
    <div class="filter-popup" v-if="showFilterPanel">
      <div class="popup-mask" @click="showFilterPanel = false"></div>
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-title">筛选条件</span>
          <span class="popup-close" @click="showFilterPanel = false">
            <icon-close />
          </span>
        </div>
        <div class="popup-body">
          <div class="filter-item">
            <span class="filter-label">订单时间</span>
            <div class="date-range">
              <input type="date" v-model="filterForm.startDate" />
              <span>至</span>
              <input type="date" v-model="filterForm.endDate" />
            </div>
          </div>
          <div class="filter-item">
            <span class="filter-label">施工方</span>
            <select v-model="filterForm.constructionId">
              <option value="">全部</option>
              <option v-for="c in constructions" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="popup-footer">
          <a-button class="btn-reset" @click="resetFilter">重置</a-button>
          <a-button type="primary" @click="applyFilter">确定</a-button>
        </div>
      </div>
    </div>
    
    <div class="ship-popup" v-if="showShipPanel">
      <div class="popup-mask" @click="showShipPanel = false"></div>
      <div class="popup-content ship-content">
        <div class="popup-header">
          <span class="popup-title">批次发货</span>
          <span class="popup-close" @click="showShipPanel = false">
            <icon-close />
          </span>
        </div>
        <div class="popup-body">
          <div class="ship-order-info">
            <div class="order-title">订单号：{{ currentOrder?.orderNo }}</div>
            <div class="order-products">
              <div 
                class="product-row" 
                v-for="item in currentOrder?.products" 
                :key="item.id"
              >
                <div class="product-info">
                  <div class="product-name">{{ item.name }}</div>
                  <div class="product-spec">{{ item.spec }}</div>
                </div>
                <div class="product-qty">
                  <span class="label">待发：</span>
                  <span class="value">{{ item.qty }} {{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="batch-section">
            <div class="section-title">选择批次</div>
            <div 
              class="batch-item" 
              v-for="batch in availableBatches" 
              :key="batch.id"
            >
              <div class="batch-header">
                <span class="batch-no">批次：{{ batch.batchNo }}</span>
                <span class="batch-date">{{ batch.produceDate }}</span>
              </div>
              <div class="batch-products">
                <div 
                  class="batch-product" 
                  v-for="p in batch.products" 
                  :key="p.productId"
                >
                  <span class="product-name">{{ p.productName }}</span>
                  <span class="stock">库存：{{ p.stock }} {{ p.unit }}</span>
                  <div class="qty-control">
                    <span class="qty-btn" @click="decreaseBatchQty(batch.id, p.productId)">-</span>
                    <input 
                      type="number" 
                      v-model="getBatchQty(batch.id, p.productId)"
                      min="0"
                      :max="p.stock"
                    />
                    <span class="qty-btn" @click="increaseBatchQty(batch.id, p.productId)">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="popup-footer">
          <a-button type="primary" @click="confirmShip">确认发货</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

defineEmits(['navigate'])

const activeStatus = ref('all')
const searchKeyword = ref('')
const showFilterPanel = ref(false)
const showShipPanel = ref(false)
const currentOrder = ref<any>(null)

const filterForm = reactive({
  startDate: '',
  endDate: '',
  constructionId: '',
})

const constructions = ref([
  { id: 'C001', name: '深圳建筑工程公司' },
  { id: 'C002', name: '广州装饰工程有限公司' },
  { id: 'C003', name: '佛山幕墙工程公司' },
])

const shipQtyMap = reactive<Record<string, Record<number, number>>>({})

const orders = ref([
  {
    id: 1,
    orderNo: 'SO202401150001',
    constructionName: '深圳建筑工程公司',
    constructionId: 'C001',
    productCount: 2,
    totalQty: 150,
    unit: '袋',
    totalAmount: '4,200.00',
    status: 'pending_pay',
    paymentStatus: 'unpaid',
    outboundStatus: 'none',
    createdAt: '2024-01-15 10:30',
    products: [
      { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', qty: 100, unit: '袋' },
      { id: 2, name: '黄砂 中砂', spec: '吨', qty: 50, unit: '袋' },
    ],
  },
  {
    id: 2,
    orderNo: 'SO202401140002',
    constructionName: '广州装饰工程有限公司',
    constructionId: 'C002',
    productCount: 1,
    totalQty: 20,
    unit: '卷',
    totalAmount: '3,700.00',
    status: 'pending_ship',
    paymentStatus: 'pending',
    outboundStatus: 'none',
    createdAt: '2024-01-14 14:20',
    products: [
      { id: 3, name: 'BV铜芯线 2.5mm²', spec: '100米/卷', qty: 20, unit: '卷' },
    ],
  },
  {
    id: 3,
    orderNo: 'SO202401130003',
    constructionName: '佛山幕墙工程公司',
    constructionId: 'C003',
    productCount: 3,
    totalQty: 80,
    unit: '桶',
    totalAmount: '22,400.00',
    status: 'pending_ship',
    paymentStatus: 'confirmed',
    outboundStatus: 'partial',
    createdAt: '2024-01-13 09:15',
    products: [
      { id: 4, name: '防水涂料 K11', spec: '20kg/桶', qty: 80, unit: '桶' },
      { id: 5, name: '瓷砖胶', spec: '20kg/桶', qty: 20, unit: '桶' },
    ],
  },
  {
    id: 4,
    orderNo: 'SO202401120004',
    constructionName: '深圳建筑工程公司',
    constructionId: 'C001',
    productCount: 1,
    totalQty: 5,
    unit: '吨',
    totalAmount: '4,750.00',
    status: 'shipped',
    paymentStatus: 'confirmed',
    outboundStatus: 'shipped',
    createdAt: '2024-01-12 16:40',
    products: [
      { id: 6, name: '碎石 5-10mm', spec: '吨', qty: 5, unit: '吨' },
    ],
  },
  {
    id: 5,
    orderNo: 'SO202401100005',
    constructionName: '广州装饰工程有限公司',
    constructionId: 'C002',
    productCount: 2,
    totalQty: 120,
    unit: '袋',
    totalAmount: '4,200.00',
    status: 'completed',
    paymentStatus: 'confirmed',
    outboundStatus: 'shipped',
    createdAt: '2024-01-10 11:00',
    products: [
      { id: 7, name: '水泥 P.O 32.5', spec: '50kg/袋', qty: 100, unit: '袋' },
      { id: 8, name: '石灰粉', spec: '25kg/袋', qty: 20, unit: '袋' },
    ],
  },
])

const availableBatches = ref([
  {
    id: 'B001',
    batchNo: '20240101',
    produceDate: '2024-01-01',
    products: [
      { productId: 3, productName: 'BV铜芯线 2.5mm²', stock: 50, unit: '卷' },
    ],
  },
  {
    id: 'B002',
    batchNo: '20240105',
    produceDate: '2024-01-05',
    products: [
      { productId: 3, productName: 'BV铜芯线 2.5mm²', stock: 30, unit: '卷' },
    ],
  },
])

const statusCount = computed(() => ({
  all: orders.value.length,
  pending_pay: orders.value.filter(o => o.status === 'pending_pay').length,
  pending_ship: orders.value.filter(o => o.status === 'pending_ship').length,
  shipped: orders.value.filter(o => o.status === 'shipped').length,
  completed: orders.value.filter(o => o.status === 'completed').length,
}))

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (activeStatus.value !== 'all') {
    result = result.filter(o => o.status === activeStatus.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(keyword) ||
      o.constructionName.toLowerCase().includes(keyword)
    )
  }
  
  return result
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

function handleSearch() {
  
}

function resetFilter() {
  filterForm.startDate = ''
  filterForm.endDate = ''
  filterForm.constructionId = ''
}

function applyFilter() {
  showFilterPanel.value = false
}

function getBatchQty(batchId: string, productId: number) {
  if (!shipQtyMap[batchId]) {
    shipQtyMap[batchId] = {}
  }
  return shipQtyMap[batchId][productId] || 0
}

function setBatchQty(batchId: string, productId: number, qty: number) {
  if (!shipQtyMap[batchId]) {
    shipQtyMap[batchId] = {}
  }
  shipQtyMap[batchId][productId] = qty
}

function increaseBatchQty(batchId: string, productId: number) {
  const batch = availableBatches.value.find(b => b.id === batchId)
  const product = batch?.products.find(p => p.productId === productId)
  const currentQty = getBatchQty(batchId, productId)
  if (product && currentQty < product.stock) {
    setBatchQty(batchId, productId, currentQty + 1)
  }
}

function decreaseBatchQty(batchId: string, productId: number) {
  const currentQty = getBatchQty(batchId, productId)
  if (currentQty > 0) {
    setBatchQty(batchId, productId, currentQty - 1)
  }
}

function handleConfirmPayment(order: any) {
  Message.success('收款审核通过')
  order.paymentStatus = 'confirmed'
}

function handleShip(order: any) {
  currentOrder.value = order
  showShipPanel.value = true
}

function confirmShip() {
  Message.success('发货成功，已生成发货单')
  showShipPanel.value = false
  if (currentOrder.value) {
    currentOrder.value.status = 'shipped'
    currentOrder.value.outboundStatus = 'shipped'
  }
}

function handleDetail(order: any) {
  console.log('订单详情', order)
}
</script>

<style lang="scss" scoped>
.sales-order-list {
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

.filter-section {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  z-index: 99;
  
  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 20px;
    padding: 0 12px;
    height: 32px;
    
    .search-icon {
      color: #c9cdd4;
      font-size: 14px;
    }
    
    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 13px;
      margin-left: 8px;
      outline: none;
    }
  }
  
  .filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    background: #f5f5f5;
    border-radius: 16px;
    font-size: 13px;
    color: #4e5969;
    
    .filter-icon {
      font-size: 14px;
    }
  }
}

.status-tabs {
  position: fixed;
  top: 96px;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  padding: 8px 12px;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  z-index: 98;
  border-bottom: 1px solid #f2f3f5;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .tab-item {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 12px;
    color: #4e5969;
    background: #f5f5f5;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    .badge {
      background: #f53f3f;
      color: #fff;
      font-size: 10px;
      min-width: 14px;
      height: 14px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
    }
    
    &.active {
      background: linear-gradient(135deg, #165dff, #4080ff);
      color: #fff;
      
      .badge {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.order-list {
  padding: 140px 12px 12px;
  
  .order-card {
    background: #fff;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 10px;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .order-no {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .order-status {
        font-size: 12px;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 10px;
        
        &.pending_pay {
          background: #fff7e6;
          color: #ff7d00;
        }
        
        &.pending_ship {
          background: #e6f7ff;
          color: #1890ff;
        }
        
        &.shipped {
          background: #f6ffed;
          color: #52c41a;
        }
        
        &.completed {
          background: #f5f5f5;
          color: #86909c;
        }
      }
    }
    
    .order-info {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      margin-bottom: 12px;
      
      .info-row {
        display: flex;
        min-width: calc(50% - 8px);
        
        .label {
          font-size: 12px;
          color: #86909c;
          width: 60px;
        }
        
        .value {
          font-size: 12px;
          color: #1d2129;
          
          &.price {
            font-weight: 600;
            color: #f53f3f;
          }
          
          &.pending {
            color: #ff7d00;
          }
          
          &.confirmed {
            color: #00b42a;
          }
        }
      }
    }
    
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f2f3f5;
      
      .create-time {
        font-size: 11px;
        color: #86909c;
      }
      
      .actions {
        display: flex;
        gap: 8px;
        
        .action-btn {
          padding: 5px 12px;
          font-size: 12px;
          border-radius: 10px;
          
          &.confirm {
            background: #fff7e6;
            color: #ff7d00;
          }
          
          &.ship {
            background: linear-gradient(135deg, #165dff, #4080ff);
            color: #fff;
          }
          
          &.detail {
            background: #f5f5f5;
            color: #4e5969;
          }
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

.filter-popup, .ship-popup {
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
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    
    &.ship-content {
      max-height: 80vh;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #f2f3f5;
      
      .popup-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .popup-close {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        svg {
          color: #86909c;
          font-size: 18px;
        }
      }
    }
    
    .popup-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
    }
    
    .popup-footer {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-top: 1px solid #f2f3f5;
      
      .btn-reset {
        flex: 1;
      }
      
      button {
        flex: 1;
        height: 40px;
        border-radius: 20px;
      }
    }
  }
}

.filter-item {
  margin-bottom: 16px;
  
  .filter-label {
    font-size: 14px;
    color: #4e5969;
    margin-bottom: 8px;
    display: block;
  }
  
  .date-range {
    display: flex;
    align-items: center;
    gap: 10px;
    
    input {
      flex: 1;
      height: 36px;
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      padding: 0 10px;
      font-size: 14px;
    }
    
    span {
      color: #86909c;
    }
  }
  
  select {
    width: 100%;
    height: 36px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 14px;
    background: #fff;
  }
}

.ship-order-info {
  background: #f5f7ff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  
  .order-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 10px;
  }
  
  .order-products {
    .product-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      
      .product-info {
        .product-name {
          font-size: 13px;
          color: #1d2129;
        }
        
        .product-spec {
          font-size: 12px;
          color: #86909c;
        }
      }
      
      .product-qty {
        font-size: 13px;
        color: #4e5969;
        
        .value {
          font-weight: 600;
          color: #165dff;
        }
      }
    }
  }
}

.batch-section {
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 12px;
  }
  
  .batch-item {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    
    .batch-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      .batch-no {
        font-size: 13px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .batch-date {
        font-size: 12px;
        color: #86909c;
      }
    }
    
    .batch-products {
      .batch-product {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e5e6eb;
        
        &:last-child {
          border-bottom: none;
        }
        
        .product-name {
          font-size: 13px;
          color: #1d2129;
          flex: 1;
        }
        
        .stock {
          font-size: 12px;
          color: #86909c;
          margin-right: 12px;
        }
        
        .qty-control {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .qty-btn {
            width: 28px;
            height: 28px;
            background: #fff;
            border: 1px solid #e5e6eb;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #4e5969;
          }
          
          input {
            width: 45px;
            height: 28px;
            text-align: center;
            border: 1px solid #e5e6eb;
            border-radius: 6px;
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
