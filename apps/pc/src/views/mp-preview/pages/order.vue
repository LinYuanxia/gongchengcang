<template>
  <div class="mp-page">
    <div class="tab-bar">
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'sale' }"
        @click="currentTab = 'sale'"
      >
        销售订单
      </div>
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'purchase' }"
        @click="currentTab = 'purchase'"
      >
        采购订单
      </div>
    </div>

    <template v-if="currentTab === 'sale'">
      <div class="status-bar">
        <div 
          class="status-item" 
          :class="{ active: saleStatus === '' }"
          @click="saleStatus = ''"
        >
          全部
        </div>
        <div 
          class="status-item" 
          :class="{ active: saleStatus === 'toShip' }"
          @click="saleStatus = 'toShip'"
        >
          待发货
          <div class="badge" v-if="statusCount.toShip > 0">{{ statusCount.toShip }}</div>
        </div>
        <div 
          class="status-item" 
          :class="{ active: saleStatus === 'shipped' }"
          @click="saleStatus = 'shipped'"
        >
          已发货
        </div>
        <div 
          class="status-item" 
          :class="{ active: saleStatus === 'completed' }"
          @click="saleStatus = 'completed'"
        >
          已完成
        </div>
        <div 
          class="status-item" 
          :class="{ active: saleStatus === 'afterSale' }"
          @click="saleStatus = 'afterSale'"
        >
          售后
        </div>
      </div>

      <div class="search-bar">
        <icon-search class="search-icon" />
        <input 
          type="text" 
          v-model="saleKeyword" 
          placeholder="搜索订单号/客户名称" 
        />
      </div>

      <div class="order-list">
        <div class="order-item" v-for="item in filteredSaleOrders" :key="item.id">
          <div class="order-header">
            <div class="order-left">
              <span class="order-no">{{ item.orderNo }}</span>
              <span class="order-time">{{ item.createTime }}</span>
            </div>
            <span class="order-status" :style="{ color: getSaleStatusColor(item.status) }">{{ item.statusText }}</span>
          </div>
          <div class="customer-info">
            <span class="customer-label">客户:</span>
            <span class="customer-name">{{ item.customerName }}</span>
          </div>
          <div class="order-products">
            <div class="product-row" v-for="prod in item.products" :key="prod.id">
              <img :src="prod.image" class="product-image" />
              <div class="product-info">
                <span class="product-name">{{ prod.name }}</span>
                <span class="product-spec">{{ prod.spec }}</span>
              </div>
              <div class="product-right">
                <span class="product-price">¥{{ prod.price }}</span>
                <span class="product-qty">x{{ prod.qty }}</span>
              </div>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-amount">
              <span class="amount-label">共{{ item.totalQty }}件</span>
              <span class="amount-text">合计: <span class="total-price">¥{{ item.totalAmount }}</span></span>
            </div>
          </div>
          <div class="order-actions">
            <span class="action-btn" v-if="item.status === 'toShip'">发货</span>
            <span class="action-btn" v-if="item.status === 'toShip'">打印</span>
            <span class="action-btn primary" v-if="item.status === 'shipped'">查看物流</span>
            <span class="action-btn" v-if="item.status === 'completed'">开票</span>
            <span class="action-btn" v-if="item.status === 'afterSale'">处理</span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="currentTab === 'purchase'">
      <div class="status-bar">
        <div 
          class="status-item" 
          :class="{ active: purchaseStatus === '' }"
          @click="purchaseStatus = ''"
        >
          全部
        </div>
        <div 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toConfirm' }"
          @click="purchaseStatus = 'toConfirm'"
        >
          待确认
          <div class="badge" v-if="statusCount.toConfirm > 0">{{ statusCount.toConfirm }}</div>
        </div>
        <div 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toPay' }"
          @click="purchaseStatus = 'toPay'"
        >
          待付款
        </div>
        <div 
          class="status-item" 
          :class="{ active: purchaseStatus === 'toReceive' }"
          @click="purchaseStatus = 'toReceive'"
        >
          待入库
          <div class="badge" v-if="statusCount.toReceive > 0">{{ statusCount.toReceive }}</div>
        </div>
        <div 
          class="status-item" 
          :class="{ active: purchaseStatus === 'completed' }"
          @click="purchaseStatus = 'completed'"
        >
          已完成
        </div>
      </div>

      <div class="search-bar">
        <icon-search class="search-icon" />
        <input 
          type="text" 
          v-model="purchaseKeyword" 
          placeholder="搜索订单号/供应商名称" 
        />
      </div>

      <div class="order-list">
        <div class="order-item" v-for="item in filteredPurchaseOrders" :key="item.id">
          <div class="order-header">
            <div class="order-left">
              <span class="order-no">{{ item.orderNo }}</span>
              <span class="order-time">{{ item.createTime }}</span>
            </div>
            <span class="order-status" :style="{ color: getPurchaseStatusColor(item.status) }">{{ item.statusText }}</span>
          </div>
          <div class="supplier-info">
            <span class="supplier-label">供应商:</span>
            <span class="supplier-name">{{ item.supplierName }}</span>
          </div>
          <div class="order-products">
            <div class="product-row" v-for="prod in item.products" :key="prod.id">
              <img :src="prod.image" class="product-image" />
              <div class="product-info">
                <span class="product-name">{{ prod.name }}</span>
                <span class="product-spec">{{ prod.spec }}</span>
              </div>
              <div class="product-right">
                <span class="product-price">¥{{ prod.price }}</span>
                <span class="product-qty">x{{ prod.qty }}</span>
              </div>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-amount">
              <span class="amount-label">共{{ item.totalQty }}件</span>
              <span class="amount-text">合计: <span class="total-price">¥{{ item.totalAmount }}</span></span>
            </div>
          </div>
          <div class="order-actions">
            <span class="action-btn" v-if="item.status === 'toConfirm'">取消</span>
            <span class="action-btn primary" v-if="item.status === 'toConfirm'">确认</span>
            <span class="action-btn primary" v-if="item.status === 'toPay'">付款</span>
            <span class="action-btn" v-if="item.status === 'toReceive'">物流</span>
            <span class="action-btn primary" v-if="item.status === 'toReceive'">确认入库</span>
          </div>
        </div>
      </div>
    </template>

    <div class="quick-actions">
      <div class="quick-item">
        <icon-send class="quick-icon" />
        <span class="quick-text">发货处理</span>
      </div>
      <div class="quick-item">
        <icon-download class="quick-icon" />
        <span class="quick-text">收货入库</span>
      </div>
      <div class="quick-item">
        <icon-camera class="quick-icon" />
        <span class="quick-text">扫码发货</span>
      </div>
      <div class="quick-item">
        <icon-camera class="quick-icon" />
        <span class="quick-text">扫码入库</span>
      </div>
    </div>

    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>采购市场</span>
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

defineEmits(['navigate'])

const currentTab = ref('sale')
const saleStatus = ref('')
const purchaseStatus = ref('')
const saleKeyword = ref('')
const purchaseKeyword = ref('')

const statusCount = ref({
  toShip: 12,
  toConfirm: 5,
  toReceive: 3,
})

const saleOrders = ref([
  {
    id: 'so001',
    orderNo: 'SO2024010012',
    status: 'toShip',
    statusText: '待发货',
    createTime: '2024-01-15 14:30',
    customerName: '深圳建设集团',
    products: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=1', price: 450, qty: 10 },
    ],
    totalQty: 10,
    totalAmount: '4,500.00',
  },
  {
    id: 'so002',
    orderNo: 'SO2024010011',
    status: 'shipped',
    statusText: '已发货',
    createTime: '2024-01-15 10:20',
    customerName: '广州建筑公司',
    products: [
      { id: 'p2', name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://picsum.photos/100/100?random=2', price: 4200, qty: 5 },
    ],
    totalQty: 5,
    totalAmount: '21,000.00',
  },
  {
    id: 'so003',
    orderNo: 'SO2024010010',
    status: 'completed',
    statusText: '已完成',
    createTime: '2024-01-14 16:45',
    customerName: '东莞工程公司',
    products: [
      { id: 'p3', name: '商品混凝土 C30', spec: 'C30', image: 'https://picsum.photos/100/100?random=3', price: 420, qty: 50 },
    ],
    totalQty: 50,
    totalAmount: '21,000.00',
  },
  {
    id: 'so004',
    orderNo: 'SO2024010009',
    status: 'afterSale',
    statusText: '售后中',
    createTime: '2024-01-13 11:30',
    customerName: '佛山建材市场',
    products: [
      { id: 'p4', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=4', price: 95, qty: 100 },
    ],
    totalQty: 100,
    totalAmount: '9,500.00',
  },
])

const purchaseOrders = ref([
  {
    id: 'po001',
    orderNo: 'PO2024010001',
    status: 'toConfirm',
    statusText: '待确认',
    createTime: '2024-01-15 14:30',
    supplierName: '华新水泥供应商',
    products: [
      { id: 'p1', name: '水泥 P.O 42.5', spec: '42.5', image: 'https://picsum.photos/100/100?random=5', price: 420, qty: 20 },
    ],
    totalQty: 20,
    totalAmount: '8,400.00',
  },
  {
    id: 'po002',
    orderNo: 'PO2024010002',
    status: 'toReceive',
    statusText: '待入库',
    createTime: '2024-01-14 10:20',
    supplierName: '宝钢供应商',
    products: [
      { id: 'p2', name: '螺纹钢 HRB400 20mm', spec: '20mm', image: 'https://picsum.photos/100/100?random=6', price: 3950, qty: 10 },
    ],
    totalQty: 10,
    totalAmount: '39,500.00',
  },
  {
    id: 'po003',
    orderNo: 'PO2024010003',
    status: 'completed',
    statusText: '已完成',
    createTime: '2024-01-12 16:45',
    supplierName: '南方建材供应商',
    products: [
      { id: 'p3', name: '黄砂 中砂', spec: '中砂', image: 'https://picsum.photos/100/100?random=7', price: 80, qty: 100 },
    ],
    totalQty: 100,
    totalAmount: '8,000.00',
  },
])

const filteredSaleOrders = computed(() => {
  let result = saleOrders.value
  
  if (saleKeyword.value) {
    const kw = saleKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(kw) || 
      o.customerName.toLowerCase().includes(kw)
    )
  }
  
  if (saleStatus.value) {
    result = result.filter(o => o.status === saleStatus.value)
  }
  
  return result
})

const filteredPurchaseOrders = computed(() => {
  let result = purchaseOrders.value
  
  if (purchaseKeyword.value) {
    const kw = purchaseKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(kw) || 
      o.supplierName.toLowerCase().includes(kw)
    )
  }
  
  if (purchaseStatus.value) {
    result = result.filter(o => o.status === purchaseStatus.value)
  }
  
  return result
})

function getSaleStatusColor(status: string) {
  const colors: Record<string, string> = {
    toPay: '#722ed1',
    toShip: '#ff7d00',
    shipped: '#165dff',
    completed: '#00b42a',
    afterSale: '#f53f3f',
  }
  return colors[status] || '#666'
}

function getPurchaseStatusColor(status: string) {
  const colors: Record<string, string> = {
    toConfirm: '#ff7d00',
    toPay: '#722ed1',
    toShip: '#165dff',
    toReceive: '#165dff',
    completed: '#00b42a',
  }
  return colors[status] || '#666'
}
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 110px;
  position: relative;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #666;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 2px;
      background-color: #165dff;
      border-radius: 1px;
    }
  }
}

.status-bar {
  display: flex;
  padding: 10px 8px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
}

.status-item {
  flex-shrink: 0;
  text-align: center;
  font-size: 13px;
  color: #666;
  padding: 4px 10px;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 500;
    background-color: #e8f3ff;
    border-radius: 10px;
  }
  
  .badge {
    position: absolute;
    top: -2px;
    right: 2px;
    min-width: 14px;
    height: 14px;
    background: #f53f3f;
    border-radius: 7px;
    font-size: 9px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 10px 16px;
  padding: 0 12px;
  height: 36px;
  background-color: #fff;
  border-radius: 18px;
}

.search-icon {
  margin-right: 8px;
  color: #86909c;
}

.search-bar input {
  flex: 1;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
}

.order-list {
  padding: 0 16px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.order-left {
  display: flex;
  flex-direction: column;
}

.order-no {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.order-time {
  font-size: 11px;
  color: #86909c;
  margin-top: 2px;
}

.order-status {
  font-size: 13px;
  font-weight: 500;
}

.customer-info, .supplier-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 6px 8px;
  background-color: #f7f8fa;
  border-radius: 4px;
  
  .customer-label, .supplier-label {
    font-size: 12px;
    color: #86909c;
  }
  
  .customer-name, .supplier-name {
    font-size: 12px;
    color: #1d2129;
    margin-left: 4px;
  }
}

.order-products {
  margin-bottom: 8px;
}

.product-row {
  display: flex;
  padding: 6px 0;
  border-bottom: 1px solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 8px;
}

.product-name {
  font-size: 14px;
  color: #1d2129;
  display: block;
}

.product-spec {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  display: block;
}

.product-right {
  text-align: right;
}

.product-price {
  font-size: 14px;
  color: #1d2129;
  display: block;
}

.product-qty {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  display: block;
}

.order-footer {
  padding-top: 8px;
  border-top: 1px solid #f7f8fa;
}

.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 12px;
  color: #86909c;
}

.amount-text {
  font-size: 13px;
  color: #666;
}

.total-price {
  color: #f53f3f;
  font-weight: 600;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  
  &.primary {
    color: #165dff;
    border-color: #165dff;
  }
}

.quick-actions {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  background-color: #fff;
  border-top: 1px solid #e5e6eb;
  padding: 8px 0;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.quick-icon {
  font-size: 20px;
  color: #165dff;
  margin-bottom: 2px;
}

.quick-text {
  font-size: 10px;
  color: #666;
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
