<template>
  <div class="mp-page project-detail">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'project-list')">
        <icon-left />
      </div>
      <div class="header-title">项目详情</div>
      <div class="header-action" @click="handleEdit">
        <icon-edit />
      </div>
    </div>
    
    <div class="project-header-card">
      <div class="store-name">{{ project.storeName }}</div>
      <div class="store-brand">{{ project.brand }}</div>
      <div class="project-status" :class="project.status">
        {{ getStatusText(project.status) }}
      </div>
    </div>
    
    <div class="info-card">
      <div class="info-row">
        <span class="label">项目地址</span>
        <span class="value">{{ project.address }}</span>
      </div>
      <div class="info-row">
        <span class="label">开工日期</span>
        <span class="value">{{ project.startDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">竣工日期</span>
        <span class="value">{{ project.endDate }}</span>
      </div>
    </div>
    
    <div class="progress-card">
      <div class="card-title">项目进度</div>
      <div class="progress-summary">
        <div class="summary-item">
          <div class="summary-value primary">{{ project.progress }}%</div>
          <div class="summary-label">完成进度</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">¥{{ project.budget }}</div>
          <div class="summary-label">预算金额</div>
        </div>
        <div class="summary-item">
          <div class="summary-value success">¥{{ project.orderedAmount }}</div>
          <div class="summary-label">已下单</div>
        </div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: project.progress + '%' }"></div>
        </div>
        <div class="progress-text">已收货: ¥{{ project.receivedAmount }}</div>
      </div>
    </div>
    
    <div class="detail-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'bom' }"
        @click="activeTab = 'bom'"
      >
        BOM包
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'order' }"
        @click="activeTab = 'order'"
      >
        订单记录
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'stock' }"
        @click="activeTab = 'stock'"
      >
        现场库存
      </div>
    </div>
    
    <div class="tab-content">
      <template v-if="activeTab === 'bom'">
        <div class="bom-card" v-if="project.bomName">
          <div class="bom-header">
            <div class="bom-name">{{ project.bomName }}</div>
            <div class="bom-action" @click="handleChangeBom">更换</div>
          </div>
          <div class="bom-info">
            <div class="info-item">
              <span class="label">材料数量</span>
              <span class="value">{{ bomDetail.itemCount }}项</span>
            </div>
            <div class="info-item">
              <span class="label">包总价</span>
              <span class="value price">¥{{ bomDetail.totalPrice }}</span>
            </div>
          </div>
          <div class="bom-materials">
            <div class="material-item" v-for="item in bomDetail.materials" :key="item.id">
              <div class="material-name">{{ item.name }}</div>
              <div class="material-spec">{{ item.spec }}</div>
              <div class="material-info">
                <span>{{ item.quantity }}{{ item.unit }}</span>
                <span class="price">¥{{ item.price }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-bom" v-else>
          <icon-folder class="empty-icon" />
          <div class="empty-text">暂未关联BOM包</div>
          <div class="empty-btn" @click="handleSelectBom">选择BOM包</div>
        </div>
      </template>
      
      <template v-if="activeTab === 'order'">
        <div class="order-list">
          <div class="order-item" v-for="item in orderList" :key="item.id">
            <div class="order-header">
              <div class="order-no">{{ item.orderNo }}</div>
              <div class="order-status" :class="item.status">{{ getStatusText(item.status) }}</div>
            </div>
            <div class="order-info">
              <div class="info-row">
                <span class="label">工程仓</span>
                <span class="value">{{ item.warehouseName }}</span>
              </div>
              <div class="info-row">
                <span class="label">商品数量</span>
                <span class="value">{{ item.productCount }}件</span>
              </div>
              <div class="info-row">
                <span class="label">订单金额</span>
                <span class="value price">¥{{ item.amount }}</span>
              </div>
              <div class="info-row">
                <span class="label">下单时间</span>
                <span class="value">{{ item.createTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <template v-if="activeTab === 'stock'">
        <div class="stock-list">
          <div class="stock-item" v-for="item in stockList" :key="item.id">
            <div class="stock-header">
              <div class="product-name">{{ item.name }}</div>
              <div class="stock-qty">{{ item.quantity }}{{ item.unit }}</div>
            </div>
            <div class="stock-spec">{{ item.spec }}</div>
            <div class="stock-actions">
              <span class="action-btn" @click="handlePick(item)">领料</span>
              <span class="action-btn" @click="handleReturn(item)">退料</span>
              <span class="action-btn" @click="handleScrap(item)">报废</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="bottom-actions">
      <div class="action-btn outline" @click="handleStock">现场库存</div>
      <div class="action-btn primary" @click="handleOrder">立即下单</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const activeTab = ref('bom')

const project = ref({
  id: 1,
  storeName: '星巴克深圳万象城店',
  brand: '星巴克',
  address: '广东省深圳市罗湖区宝安南路万象城L1层',
  status: 'ongoing',
  bomName: '星巴克标准基装包V2.0',
  budget: '150,000',
  orderedAmount: '85,000',
  receivedAmount: '62,000',
  progress: 57,
  startDate: '2024-01-10',
  endDate: '2024-03-30'
})

const bomDetail = ref({
  itemCount: 28,
  totalPrice: '128,000',
  materials: [
    { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', quantity: 100, unit: '吨', price: '35,000' },
    { id: 2, name: '螺纹钢 HRB400', spec: '12mm', quantity: 20, unit: '吨', price: '42,000' },
    { id: 3, name: '防水涂料', spec: 'JS型 20kg/桶', quantity: 50, unit: '桶', price: '8,500' },
    { id: 4, name: 'PVC管材', spec: 'DN110', quantity: 200, unit: '米', price: '3,200' }
  ]
})

const orderList = ref([
  { id: 1, orderNo: 'PO202401150001', warehouseName: '深圳工程仓', productCount: 5, amount: '35,000', status: 'completed', createTime: '2024-01-15 14:30' },
  { id: 2, orderNo: 'PO202401120002', warehouseName: '深圳工程仓', productCount: 3, amount: '28,500', status: 'shipping', createTime: '2024-01-12 10:20' }
])

const stockList = ref([
  { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', quantity: 50, unit: '吨' },
  { id: 2, name: '螺纹钢 HRB400', spec: '12mm', quantity: 10, unit: '吨' }
])

function getStatusText(status: string) {
  const map: Record<string, string> = {
    'ongoing': '进行中',
    'completed': '已完成',
    'shipping': '运输中',
    'pending': '待发货'
  }
  return map[status] || status
}

function handleEdit() {
  console.log('编辑项目')
}

function handleChangeBom() {
  console.log('更换BOM包')
}

function handleSelectBom() {
  console.log('选择BOM包')
}

function handleOrderDetail(item: any) {
  console.log('查看订单:', item.orderNo)
}

function handlePick(item: any) {
  console.log('领料:', item.name)
}

function handleReturn(item: any) {
  console.log('退料:', item.name)
}

function handleScrap(item: any) {
  console.log('报废:', item.name)
}

function handleStock() {
  emit('navigate', 'site-stock')
}

function handleOrder() {
  emit('navigate', 'market')
}
</script>

<style lang="scss" scoped>
.project-detail {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 70px;
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
  
  .header-back {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
  
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
    color: #165dff;
  }
}

.project-header-card {
  margin: 54px 12px 12px;
  background: linear-gradient(135deg, #165dff, #4080ff);
  border-radius: 8px;
  padding: 16px;
  color: #fff;
  
  .store-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .store-brand {
    font-size: 13px;
    opacity: 0.9;
  }
  
  .project-status {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.2);
    margin-top: 8px;
  }
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0 12px 12px;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f2f3f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-size: 13px;
      color: #86909c;
    }
    
    .value {
      font-size: 13px;
      color: #1d2129;
    }
  }
}

.progress-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 0 12px 12px;
  
  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
  }
  
  .progress-summary {
    display: flex;
    justify-content: space-around;
    margin-bottom: 12px;
    
    .summary-item {
      text-align: center;
      
      .summary-value {
        font-size: 18px;
        font-weight: 600;
        color: #1d2129;
        
        &.primary {
          color: #165dff;
        }
        
        &.success {
          color: #00b42a;
        }
      }
      
      .summary-label {
        font-size: 11px;
        color: #86909c;
        margin-top: 4px;
      }
    }
  }
  
  .progress-bar-wrap {
    .progress-bar {
      height: 8px;
      background: #f2f3f5;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #165dff, #4080ff);
        border-radius: 4px;
      }
    }
    
    .progress-text {
      font-size: 11px;
      color: #86909c;
      text-align: right;
    }
  }
}

.detail-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  
  .tab-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
    position: relative;
    
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
  }
}

.tab-content {
  padding: 12px;
}

.bom-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  
  .bom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .bom-name {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .bom-action {
      font-size: 13px;
      color: #165dff;
    }
  }
  
  .bom-info {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;
    
    .info-item {
      .label {
        font-size: 12px;
        color: #86909c;
      }
      
      .value {
        font-size: 14px;
        color: #1d2129;
        font-weight: 500;
        
        &.price {
          color: #f53f3f;
        }
      }
    }
  }
  
  .bom-materials {
    .material-item {
      padding: 10px 0;
      border-bottom: 1px solid #f2f3f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .material-name {
        font-size: 14px;
        color: #1d2129;
      }
      
      .material-spec {
        font-size: 12px;
        color: #86909c;
        margin-top: 2px;
      }
      
      .material-info {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        font-size: 13px;
        color: #4e5969;
        
        .price {
          color: #f53f3f;
        }
      }
    }
  }
}

.empty-bom {
  background: #fff;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  
  .empty-icon {
    font-size: 48px;
    color: #c9cdd4;
  }
  
  .empty-text {
    font-size: 14px;
    color: #86909c;
    margin: 12px 0;
  }
  
  .empty-btn {
    display: inline-block;
    padding: 8px 24px;
    background: #165dff;
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
  }
}

.order-list {
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
        font-size: 14px;
        color: #1d2129;
        font-weight: 500;
      }
      
      .order-status {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        
        &.completed {
          background: #e8ffea;
          color: #00b42a;
        }
        
        &.shipping {
          background: #fff7e8;
          color: #ff7d00;
        }
        
        &.pending {
          background: #e8f3ff;
          color: #165dff;
        }
      }
    }
    
    .order-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        
        .label {
          font-size: 12px;
          color: #86909c;
        }
        
        .value {
          font-size: 12px;
          color: #1d2129;
          
          &.price {
            color: #f53f3f;
          }
        }
      }
    }
  }
}

.stock-list {
  .stock-item {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    
    .stock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .product-name {
        font-size: 14px;
        color: #1d2129;
        font-weight: 500;
      }
      
      .stock-qty {
        font-size: 14px;
        color: #165dff;
        font-weight: 500;
      }
    }
    
    .stock-spec {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 10px;
    }
    
    .stock-actions {
      display: flex;
      gap: 8px;
      
      .action-btn {
        flex: 1;
        text-align: center;
        padding: 6px 0;
        border-radius: 4px;
        font-size: 12px;
        background: #f2f3f5;
        color: #4e5969;
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  gap: 12px;
  padding: 0 16px;
  border-top: 1px solid #e5e6eb;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 14px;
    
    &.outline {
      background: #fff;
      color: #165dff;
      border: 1px solid #165dff;
    }
    
    &.primary {
      background: #165dff;
      color: #fff;
    }
  }
}
</style>
