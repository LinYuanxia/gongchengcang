<template>
  <div class="mp-page construction-warehouse-list">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">工程仓列表</div>
    </div>
    
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索工程仓" v-model="searchText" />
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-item" :class="{ active: filterType === 'distance' }" @click="filterType = 'distance'">
        距离优先
      </div>
      <div class="filter-item" :class="{ active: filterType === 'rating' }" @click="filterType = 'rating'">
        评分优先
      </div>
      <div class="filter-item" :class="{ active: filterType === 'products' }" @click="filterType = 'products'">
        商品数量
      </div>
    </div>
    
    <div class="warehouse-list">
      <div 
        class="warehouse-card" 
        v-for="warehouse in filteredWarehouses" 
        :key="warehouse.id"
        @click="handleWarehouseClick(warehouse)"
      >
        <div class="warehouse-cover">
          <img :src="warehouse.cover" :alt="warehouse.name" />
          <div class="warehouse-badge" v-if="warehouse.badge">{{ warehouse.badge }}</div>
        </div>
        <div class="warehouse-content">
          <div class="warehouse-name">{{ warehouse.name }}</div>
          <div class="warehouse-desc">{{ warehouse.description }}</div>
          <div class="warehouse-meta">
            <span class="rating">
              <icon-star-fill class="star" />
              {{ warehouse.rating }}
            </span>
            <span class="products">{{ warehouse.productCount }}件商品</span>
            <span class="sales">月销{{ warehouse.monthSales }}单</span>
          </div>
          <div class="warehouse-location">
            <icon-location />
            <span>{{ warehouse.address }}</span>
            <span class="distance">{{ warehouse.distance }}</span>
          </div>
          <div class="warehouse-tags">
            <span class="tag" v-for="tag in warehouse.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const searchText = ref('')
const filterType = ref('distance')

const warehouses = ref([
  {
    id: 1,
    name: '华东工程仓',
    cover: 'https://picsum.photos/400/200?random=1',
    avatar: 'https://picsum.photos/100/100?random=11',
    rating: 4.9,
    productCount: 156,
    monthSales: 328,
    distance: '2.5km',
    address: '南京市鼓楼区XX路XX号',
    badge: '金牌工程仓',
    description: '专业建材供应商，品质保证',
    tags: ['建材', '水泥', '钢材', '配送快'],
  },
  {
    id: 2,
    name: '南京工程仓',
    cover: 'https://picsum.photos/400/200?random=2',
    avatar: 'https://picsum.photos/100/100?random=12',
    rating: 4.8,
    productCount: 89,
    monthSales: 156,
    distance: '5.2km',
    address: '南京市玄武区XX路XX号',
    badge: '',
    description: '防水材料专业供应商',
    tags: ['防水材料', '涂料'],
  },
  {
    id: 3,
    name: '苏州工程仓',
    cover: 'https://picsum.photos/400/200?random=3',
    avatar: 'https://picsum.photos/100/100?random=13',
    rating: 4.7,
    productCount: 234,
    monthSales: 512,
    distance: '12km',
    address: '苏州市工业园区XX路XX号',
    badge: '人气工程仓',
    description: '全品类建材一站式采购',
    tags: ['全品类', '配送快', '价格优'],
  },
])

const filteredWarehouses = computed(() => {
  let result = [...warehouses.value]
  
  if (searchText.value) {
    result = result.filter(w => w.name.includes(searchText.value))
  }
  
  if (filterType.value === 'distance') {
    result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
  } else if (filterType.value === 'rating') {
    result.sort((a, b) => b.rating - a.rating)
  } else if (filterType.value === 'products') {
    result.sort((a, b) => b.productCount - a.productCount)
  }
  
  return result
})

function handleBack() {
  emit('navigate', 'market')
}

function handleWarehouseClick(warehouse: any) {
  emit('navigate', 'product-detail', { warehouseId: warehouse.id })
}
</script>

<style lang="scss" scoped>
.construction-warehouse-list {
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
  padding: 0 12px;
  z-index: 100;
  
  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
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

.filter-bar {
  display: flex;
  background: #fff;
  padding: 0 12px 12px;
  gap: 8px;
  
  .filter-item {
    padding: 6px 12px;
    background: #f5f5f5;
    border-radius: 14px;
    font-size: 12px;
    color: #666;
    
    &.active {
      background: #e8f3ff;
      color: #165dff;
    }
  }
}

.warehouse-list {
  padding: 12px;
}

.warehouse-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  
  .warehouse-cover {
    position: relative;
    aspect-ratio: 2;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .warehouse-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: linear-gradient(135deg, #ff9500, #ff6b00);
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
  
  .warehouse-content {
    padding: 12px;
    
    .warehouse-name {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }
    
    .warehouse-desc {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    
    .warehouse-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      
      .rating {
        display: flex;
        align-items: center;
        gap: 2px;
        color: #ff9500;
        
        .star {
          font-size: 12px;
        }
      }
    }
    
    .warehouse-location {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      
      .distance {
        margin-left: auto;
        color: #165dff;
      }
    }
    
    .warehouse-tags {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      
      .tag {
        font-size: 10px;
        color: #165dff;
        background: #e8f3ff;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }
}
</style>
