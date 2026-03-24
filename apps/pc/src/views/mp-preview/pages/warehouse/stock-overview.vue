<template>
  <div class="mp-page stock-overview">
    <div class="page-header">
      <div class="header-title">库存总览</div>
    </div>
    
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-value">{{ summary.totalProducts }}</div>
        <div class="card-label">商品种类</div>
      </div>
      <div class="summary-card">
        <div class="card-value warning">{{ summary.warningCount }}</div>
        <div class="card-label">库存预警</div>
      </div>
      <div class="summary-card">
        <div class="card-value">{{ summary.totalStock }}</div>
        <div class="card-label">库存总量</div>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索商品名称/编码" v-model="searchText" />
      </div>
    </div>
    
    <div class="category-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >
        全部
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeCategory === 'warning' }"
        @click="activeCategory = 'warning'"
      >
        预警商品
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeCategory === 'low' }"
        @click="activeCategory = 'low'"
      >
        低库存
      </div>
    </div>
    
    <div class="stock-list">
      <div class="stock-item" v-for="item in filteredStock" :key="item.id">
        <div class="stock-header">
          <div class="product-info">
            <div class="product-name">{{ item.name }}</div>
            <div class="product-spec">{{ item.spec }}</div>
          </div>
          <div class="stock-status" :class="item.status">
            {{ getStatusText(item.status) }}
          </div>
        </div>
        <div class="stock-details">
          <div class="detail-item">
            <span class="label">库存数量</span>
            <span class="value">{{ item.quantity }} {{ item.unit }}</span>
          </div>
          <div class="detail-item">
            <span class="label">预警阈值</span>
            <span class="value">{{ item.warningThreshold }} {{ item.unit }}</span>
          </div>
          <div class="detail-item">
            <span class="label">最近入库</span>
            <span class="value">{{ item.lastInTime }}</span>
          </div>
        </div>
        <div class="stock-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getProgressWidth(item) + '%' }"
              :class="item.status"
            ></div>
          </div>
          <div class="progress-text">
            库存占比: {{ Math.round(item.quantity / item.maxStock * 100) }}%
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
        <span>采购市场</span>
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

const searchText = ref('')
const activeCategory = ref('all')

const summary = ref({
  totalProducts: 156,
  warningCount: 5,
  totalStock: '12,580'
})

const stockList = ref([
  {
    id: 1,
    name: '水泥 P.O 42.5',
    spec: '50kg/袋',
    quantity: 120,
    unit: '吨',
    warningThreshold: 50,
    maxStock: 200,
    lastInTime: '2024-01-15',
    status: 'normal'
  },
  {
    id: 2,
    name: '螺纹钢 HRB400',
    spec: 'Φ12mm',
    quantity: 45,
    unit: '吨',
    warningThreshold: 50,
    maxStock: 150,
    lastInTime: '2024-01-14',
    status: 'warning'
  },
  {
    id: 3,
    name: '黄沙',
    spec: '中粗砂',
    quantity: 280,
    unit: '方',
    warningThreshold: 100,
    maxStock: 500,
    lastInTime: '2024-01-13',
    status: 'normal'
  },
  {
    id: 4,
    name: '商品混凝土 C30',
    spec: '预拌',
    quantity: 30,
    unit: '方',
    warningThreshold: 50,
    maxStock: 100,
    lastInTime: '2024-01-12',
    status: 'low'
  },
  {
    id: 5,
    name: '防水涂料',
    spec: 'JS型 20kg/桶',
    quantity: 15,
    unit: '桶',
    warningThreshold: 20,
    maxStock: 50,
    lastInTime: '2024-01-10',
    status: 'warning'
  }
])

const filteredStock = computed(() => {
  let result = stockList.value
  
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(kw)
    )
  }
  
  if (activeCategory.value === 'warning') {
    result = result.filter(item => item.status === 'warning')
  } else if (activeCategory.value === 'low') {
    result = result.filter(item => item.status === 'low' || item.status === 'warning')
  }
  
  return result
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'normal': '正常',
    'warning': '预警',
    'low': '低库存'
  }
  return statusMap[status] || status
}

function getProgressWidth(item: any) {
  return Math.min(100, (item.quantity / item.maxStock) * 100)
}
</script>

<style lang="scss" scoped>
.stock-overview {
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

.summary-cards {
  display: flex;
  padding: 54px 12px 12px;
  gap: 8px;
}

.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  
  .card-value {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    
    &.warning {
      color: #ff7d00;
    }
  }
  
  .card-label {
    font-size: 12px;
    color: #86909c;
    margin-top: 4px;
  }
}

.search-bar {
  padding: 0 12px 12px;
}

.search-input {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  padding: 8px 12px;
  
  .search-icon {
    color: #999;
    margin-right: 8px;
  }
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    outline: none;
    
    &::placeholder {
      color: #999;
    }
  }
}

.category-tabs {
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

.stock-list {
  padding: 12px;
}

.stock-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  .product-info {
    .product-name {
      font-size: 15px;
      color: #1d2129;
      font-weight: 500;
    }
    
    .product-spec {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .stock-status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    
    &.normal {
      background: #e8ffea;
      color: #00b42a;
    }
    
    &.warning {
      background: #fff7e8;
      color: #ff7d00;
    }
    
    &.low {
      background: #ffece8;
      color: #f53f3f;
    }
  }
}

.stock-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  
  .detail-item {
    .label {
      font-size: 11px;
      color: #86909c;
      display: block;
    }
    
    .value {
      font-size: 14px;
      color: #1d2129;
      font-weight: 500;
    }
  }
}

.stock-progress {
  .progress-bar {
    height: 6px;
    background: #f2f3f5;
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      border-radius: 3px;
      
      &.normal {
        background: #00b42a;
      }
      
      &.warning {
        background: #ff7d00;
      }
      
      &.low {
        background: #f53f3f;
      }
    }
  }
  
  .progress-text {
    font-size: 11px;
    color: #86909c;
    margin-top: 4px;
    text-align: right;
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
