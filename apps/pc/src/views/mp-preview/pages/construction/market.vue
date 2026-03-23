<template>
  <div class="mp-page construction-market">
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索工程仓或商品" v-model="searchText" />
      </div>
    </div>
    
    <div class="warehouse-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeWarehouse === 'all' }"
        @click="activeWarehouse = 'all'"
      >
        全部工程仓
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeWarehouse === 'nearby' }"
        @click="activeWarehouse = 'nearby'"
      >
        附近工程仓
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeWarehouse === 'followed' }"
        @click="activeWarehouse = 'followed'"
      >
        我的关注
      </div>
    </div>
    
    <div class="warehouse-list" v-if="activeWarehouse === 'all' || activeWarehouse === 'nearby'">
      <div 
        class="warehouse-card" 
        v-for="warehouse in warehouses" 
        :key="warehouse.id"
        @click="handleWarehouseClick(warehouse)"
      >
        <div class="warehouse-header">
          <div class="warehouse-avatar">
            <img :src="warehouse.avatar" :alt="warehouse.name" />
          </div>
          <div class="warehouse-info">
            <div class="warehouse-name">{{ warehouse.name }}</div>
            <div class="warehouse-meta">
              <span class="rating">
                <icon-star-fill class="star" />
                {{ warehouse.rating }}
              </span>
              <span class="products">{{ warehouse.productCount }}件商品</span>
              <span class="distance">{{ warehouse.distance }}</span>
            </div>
          </div>
          <div class="follow-btn" :class="{ followed: warehouse.isFollowed }" @click.stop="handleFollow(warehouse)">
            {{ warehouse.isFollowed ? '已关注' : '关注' }}
          </div>
        </div>
        <div class="warehouse-products">
          <div class="product-preview" v-for="product in warehouse.hotProducts.slice(0, 4)" :key="product.id">
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="more-products" v-if="warehouse.productCount > 4">
            +{{ warehouse.productCount - 4 }}
          </div>
        </div>
        <div class="warehouse-tags">
          <span class="tag" v-for="tag in warehouse.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
    
    <div class="followed-list" v-else-if="activeWarehouse === 'followed'">
      <div class="empty-state" v-if="followedWarehouses.length === 0">
        <icon-heart class="empty-icon" />
        <p>暂无关注的工程仓</p>
      </div>
      <div 
        class="warehouse-card" 
        v-for="warehouse in followedWarehouses" 
        :key="warehouse.id"
        @click="handleWarehouseClick(warehouse)"
      >
        <div class="warehouse-header">
          <div class="warehouse-avatar">
            <img :src="warehouse.avatar" :alt="warehouse.name" />
          </div>
          <div class="warehouse-info">
            <div class="warehouse-name">{{ warehouse.name }}</div>
            <div class="warehouse-meta">
              <span class="rating">
                <icon-star-fill class="star" />
                {{ warehouse.rating }}
              </span>
              <span class="products">{{ warehouse.productCount }}件商品</span>
            </div>
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
const activeWarehouse = ref('all')

const warehouses = ref([
  {
    id: 1,
    name: '华东工程仓',
    avatar: 'https://picsum.photos/100/100?random=11',
    rating: 4.9,
    productCount: 156,
    distance: '2.5km',
    isFollowed: true,
    tags: ['建材', '水泥', '钢材'],
    hotProducts: [
      { id: 1, name: '水泥', image: 'https://picsum.photos/100/100?random=1' },
      { id: 2, name: '螺纹钢', image: 'https://picsum.photos/100/100?random=2' },
      { id: 3, name: '黄沙', image: 'https://picsum.photos/100/100?random=3' },
      { id: 4, name: '混凝土', image: 'https://picsum.photos/100/100?random=4' },
    ],
  },
  {
    id: 2,
    name: '南京工程仓',
    avatar: 'https://picsum.photos/100/100?random=12',
    rating: 4.8,
    productCount: 89,
    distance: '5.2km',
    isFollowed: false,
    tags: ['防水材料', '涂料'],
    hotProducts: [
      { id: 5, name: '防水涂料', image: 'https://picsum.photos/100/100?random=5' },
      { id: 6, name: '建筑模板', image: 'https://picsum.photos/100/100?random=6' },
    ],
  },
  {
    id: 3,
    name: '苏州工程仓',
    avatar: 'https://picsum.photos/100/100?random=13',
    rating: 4.7,
    productCount: 234,
    distance: '12km',
    isFollowed: false,
    tags: ['全品类', '配送快'],
    hotProducts: [
      { id: 7, name: '水泥', image: 'https://picsum.photos/100/100?random=7' },
      { id: 8, name: '螺纹钢', image: 'https://picsum.photos/100/100?random=8' },
      { id: 9, name: '黄沙', image: 'https://picsum.photos/100/100?random=9' },
      { id: 10, name: '混凝土', image: 'https://picsum.photos/100/100?random=10' },
    ],
  },
])

const followedWarehouses = computed(() => {
  return warehouses.value.filter(w => w.isFollowed)
})

function handleWarehouseClick(warehouse: any) {
  emit('navigate', 'product-detail', { warehouseId: warehouse.id })
}

function handleFollow(warehouse: any) {
  warehouse.isFollowed = !warehouse.isFollowed
}
</script>

<style lang="scss" scoped>
.construction-market {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
}

.search-bar {
  padding: 10px 12px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
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

.warehouse-tabs {
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

.warehouse-list {
  padding: 12px;
}

.warehouse-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .warehouse-header {
    display: flex;
    align-items: center;
    
    .warehouse-avatar {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .warehouse-info {
      flex: 1;
      margin-left: 12px;
      
      .warehouse-name {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
      
      .warehouse-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
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
    }
    
    .follow-btn {
      padding: 4px 12px;
      border: 1px solid #165dff;
      border-radius: 14px;
      font-size: 12px;
      color: #165dff;
      
      &.followed {
        background: #f5f5f5;
        border-color: #ddd;
        color: #999;
      }
    }
  }
  
  .warehouse-products {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    
    .product-preview {
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
    
    .more-products {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #999;
    }
  }
  
  .warehouse-tags {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    
    .tag {
      font-size: 10px;
      color: #165dff;
      background: #e8f3ff;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

.followed-list {
  padding: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  
  .empty-icon {
    font-size: 48px;
    color: #ddd;
  }
  
  p {
    font-size: 14px;
    color: #999;
    margin-top: 12px;
  }
}
</style>
