<template>
  <div class="mp-page construction-bom-market">
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索BOM包" v-model="searchText" />
      </div>
    </div>

    <div class="category-scroll">
      <div class="category-list">
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          全部
        </div>
        <div 
          class="category-item" 
          :class="{ active: activeCategory === cat.id }"
          v-for="cat in categories" 
          :key="cat.id"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-item" :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">综合</div>
      <div class="filter-item" :class="{ active: sortBy === 'sales' }" @click="sortBy = 'sales'">销量</div>
      <div class="filter-item" :class="{ active: sortBy === 'price' }" @click="sortBy = 'price'">
        价格
        <icon-arrow-down v-if="priceOrder === 'asc'" />
        <icon-arrow-up v-else />
      </div>
    </div>

    <div class="bom-list">
      <div 
        class="bom-card" 
        v-for="bom in filteredBomList" 
        :key="bom.id"
        @click="handleBomClick(bom)"
      >
        <div class="bom-image">
          <img :src="bom.image" :alt="bom.name" />
          <div class="bom-tags">
            <span v-if="bom.isHot" class="hot-tag">热门</span>
            <span v-if="bom.isRecommend" class="recommend-tag">推荐</span>
          </div>
        </div>
        <div class="bom-info">
          <div class="bom-name">{{ bom.name }}</div>
          <div class="bom-desc">{{ bom.description }}</div>
          <div class="bom-meta">
            <span class="sku-count">{{ bom.skuCount }}种SKU</span>
            <span class="sales">已售{{ bom.salesCount }}</span>
          </div>
          <div class="bom-price">
            <span class="price">¥{{ bom.price }}</span>
            <span class="unit">/套</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-nav">
      <div class="nav-item" @click="emit('navigate', 'market')">
        <icon-home />
        <span>商品市场</span>
      </div>
      <div class="nav-item active">
        <icon-folder />
        <span>BOM包</span>
      </div>
      <div class="nav-item" @click="emit('navigate', 'cart')">
        <icon-shopping-cart />
        <span>购物车</span>
      </div>
      <div class="nav-item" @click="emit('navigate', 'mine')">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const searchText = ref('')
const activeCategory = ref('all')
const sortBy = ref('default')
const priceOrder = ref('asc')

const categories = ref([
  { id: '1', name: '水电工程' },
  { id: '2', name: '防水工程' },
  { id: '3', name: '木工工程' },
  { id: '4', name: '油漆工程' },
  { id: '5', name: '泥瓦工程' },
])

const bomList = ref([
  { id: '1', name: '水电材料标准包', image: 'https://picsum.photos/300/200?random=1', description: '适用于标准住宅水电改造工程', skuCount: 12, salesCount: 156, price: '3,580.00', isHot: true, isRecommend: false, category: '1' },
  { id: '2', name: '防水涂料套餐', image: 'https://picsum.photos/300/200?random=2', description: '卫生间、厨房防水专用套餐', skuCount: 5, salesCount: 89, price: '2,100.00', isHot: false, isRecommend: true, category: '2' },
  { id: '3', name: '木工基础包', image: 'https://picsum.photos/300/200?random=3', description: '吊顶、隔断基础材料套餐', skuCount: 8, salesCount: 67, price: '4,800.00', isHot: false, isRecommend: false, category: '3' },
  { id: '4', name: '油漆涂装套餐', image: 'https://picsum.photos/300/200?random=4', description: '墙面涂装全套材料', skuCount: 6, salesCount: 45, price: '2,500.00', isHot: true, isRecommend: true, category: '4' },
  { id: '5', name: '瓷砖铺贴包', image: 'https://picsum.photos/300/200?random=5', description: '瓷砖、水泥、沙子配套套餐', skuCount: 10, salesCount: 123, price: '6,200.00', isHot: false, isRecommend: false, category: '5' },
])

const filteredBomList = computed(() => {
  let list = bomList.value
  
  if (activeCategory.value !== 'all') {
    list = list.filter(bom => bom.category === activeCategory.value)
  }
  
  if (searchText.value) {
    list = list.filter(bom => bom.name.includes(searchText.value))
  }
  
  return list
})

function handleBomClick(bom: any) {
  emit('navigate', 'bom-detail', { bomId: bom.id })
}
</script>

<style lang="scss" scoped>
.construction-bom-market {
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

.category-scroll {
  background: #fff;
  padding: 10px 0;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.category-list {
  display: flex;
  padding: 0 12px;
  gap: 12px;
  white-space: nowrap;
}

.category-item {
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  
  &.active {
    background: #165dff;
    color: #fff;
  }
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  
  .filter-item {
    padding: 12px 16px;
    font-size: 13px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.active {
      color: #165dff;
      font-weight: 500;
    }
  }
}

.bom-list {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.bom-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  
  .bom-image {
    position: relative;
    height: 120px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .bom-tags {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      gap: 4px;
      
      .hot-tag {
        background: #f53f3f;
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      .recommend-tag {
        background: #165dff;
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }
  
  .bom-info {
    padding: 10px;
    
    .bom-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .bom-desc {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .bom-meta {
      display: flex;
      gap: 8px;
      margin-top: 6px;
      font-size: 11px;
      color: #999;
    }
    
    .bom-price {
      margin-top: 8px;
      
      .price {
        font-size: 16px;
        font-weight: 600;
        color: #f53f3f;
      }
      
      .unit {
        font-size: 11px;
        color: #999;
      }
    }
  }
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  border-top: 1px solid #eee;
  
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #999;
    
    &.active {
      color: #165dff;
    }
    
    :deep(.arco-icon) {
      font-size: 20px;
      margin-bottom: 2px;
    }
  }
}
</style>
