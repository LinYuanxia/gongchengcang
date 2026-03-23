<template>
  <div class="mp-page supplier-market">
    <div class="page-header">
      <div class="header-title">供货商品</div>
      <div class="header-action" @click="handleAddProduct">
        <icon-plus />
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索商品" v-model="searchText" />
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
        :class="{ active: activeStatus === 'supplying' }"
        @click="activeStatus = 'supplying'"
      >
        供货中
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'paused' }"
        @click="activeStatus = 'paused'"
      >
        已暂停
      </div>
    </div>
    
    <div class="product-list">
      <div class="product-card" v-for="product in filteredProducts" :key="product.id">
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="status-badge" :class="product.status">{{ getStatusText(product.status) }}</div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-spec">{{ product.spec }}</div>
          <div class="product-price">
            <span class="price">¥{{ product.price }}/{{ product.unit }}</span>
            <span class="stock">库存: {{ product.stock }}</span>
          </div>
          <div class="product-stats">
            <span>销量: {{ product.sales }}</span>
            <span>采购方: {{ product.buyers }}家</span>
          </div>
        </div>
        <div class="product-actions">
          <div class="action-btn" @click="handleEdit(product)">编辑</div>
          <div class="action-btn" v-if="product.status === 'supplying'" @click="handlePause(product)">暂停</div>
          <div class="action-btn primary" v-else @click="handleResume(product)">恢复</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const searchText = ref('')
const activeStatus = ref('all')

const products = ref([
  {
    id: 1,
    name: '高标号水泥 P.O42.5',
    spec: '50kg/袋 | 海螺品牌',
    image: 'https://picsum.photos/200/200?random=1',
    price: 28.5,
    unit: '袋',
    stock: 5000,
    sales: 1256,
    buyers: 12,
    status: 'supplying',
  },
  {
    id: 2,
    name: '国标螺纹钢 HRB400',
    spec: 'Φ12mm | 6米定尺',
    image: 'https://picsum.photos/200/200?random=2',
    price: 4280,
    unit: '吨',
    stock: 200,
    sales: 89,
    buyers: 8,
    status: 'supplying',
  },
  {
    id: 3,
    name: '建筑用黄沙',
    spec: '中粗砂 | 江砂',
    image: 'https://picsum.photos/200/200?random=3',
    price: 85,
    unit: '方',
    stock: 0,
    sales: 456,
    buyers: 15,
    status: 'paused',
  },
  {
    id: 4,
    name: '商品混凝土 C30',
    spec: '预拌混凝土 | 国标',
    image: 'https://picsum.photos/200/200?random=4',
    price: 380,
    unit: '方',
    stock: 9999,
    sales: 234,
    buyers: 6,
    status: 'supplying',
  },
])

const filteredProducts = computed(() => {
  let result = [...products.value]
  
  if (searchText.value) {
    result = result.filter(p => p.name.includes(searchText.value))
  }
  
  if (activeStatus.value !== 'all') {
    result = result.filter(p => p.status === activeStatus.value)
  }
  
  return result
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'supplying': '供货中',
    'paused': '已暂停',
  }
  return statusMap[status] || status
}

function handleAddProduct() {
  
}

function handleEdit(product: any) {
  
}

function handlePause(product: any) {
  product.status = 'paused'
}

function handleResume(product: any) {
  product.status = 'supplying'
}
</script>

<style lang="scss" scoped>
.supplier-market {
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
  
  .header-action {
    position: absolute;
    right: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1890ff;
    border-radius: 50%;
    color: #fff;
    font-size: 16px;
  }
}

.search-bar {
  padding: 54px 12px 10px;
  background: #fff;
}

.search-input {
  display: flex;
  align-items: center;
  background: #f5f5f5;
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

.status-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px 12px;
  border-bottom: 1px solid #eee;
  
  .tab-item {
    padding: 8px 16px;
    font-size: 13px;
    color: #666;
    position: relative;
    
    &.active {
      color: #1890ff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -12px;
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

.product-list {
  padding: 12px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  
  .product-image {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .status-badge {
      position: absolute;
      top: 4px;
      left: 4px;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      
      &.supplying {
        background: #e6f7ff;
        color: #1890ff;
      }
      
      &.paused {
        background: #fff7e6;
        color: #fa8c16;
      }
    }
  }
  
  .product-info {
    flex: 1;
    margin-left: 12px;
    
    .product-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
    
    .product-spec {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    
    .product-price {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      
      .price {
        font-size: 14px;
        color: #ff4d4f;
        font-weight: 500;
      }
      
      .stock {
        font-size: 12px;
        color: #999;
      }
    }
    
    .product-stats {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      
      span {
        margin-right: 12px;
      }
    }
  }
  
  .product-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    
    .action-btn {
      padding: 4px 12px;
      font-size: 12px;
      border: 1px solid #ddd;
      border-radius: 14px;
      color: #666;
      text-align: center;
      
      &.primary {
        background: #1890ff;
        border-color: #1890ff;
        color: #fff;
      }
    }
  }
}
</style>
