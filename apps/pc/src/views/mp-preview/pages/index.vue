<template>
  <div class="mp-page">
    <div class="header">
      <div class="search-bar" @click="$emit('navigate', 'market')">
        <icon-search class="search-icon" />
        <span class="search-placeholder">{{ searchPlaceholder }}</span>
      </div>
    </div>
    
    <div class="banner">
      <div class="swiper">
        <div class="swiper-item">
          <img src="https://picsum.photos/750/300?random=1" alt="banner" />
        </div>
      </div>
    </div>
    
    <div class="quick-entry">
      <div class="entry-item" v-for="item in quickEntries" :key="item.id" @click="handleEntryClick(item)">
        <div class="entry-icon" :style="{ background: item.color }">
          <component :is="item.icon" />
        </div>
        <span class="entry-text">{{ item.name }}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <span class="section-title">{{ sectionTitle }}</span>
        <span class="section-more" @click="$emit('navigate', 'market')">查看更多 ></span>
      </div>
      <div class="product-list">
        <div 
          class="product-item" 
          v-for="item in products" 
          :key="item.id"
          @click="$emit('navigate', 'product-detail')"
        >
          <img :src="item.image" alt="" class="product-image" />
          <div class="product-info">
            <span class="product-name">{{ item.name }}</span>
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ item.price }}</span>
              <span class="product-unit">/{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item active">
        <icon-home />
        <span>首页</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>{{ marketTabName }}</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'cart')">
        <icon-shopping-cart />
        <span>购物车</span>
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
import { ref, computed, inject } from 'vue'

const emit = defineEmits(['navigate'])

const currentRoleRef = inject<any>('currentRole')
const currentRole = computed(() => currentRoleRef?.value || 'warehouse')

const searchPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    'warehouse': '搜索商品、供应商',
    'construction': '搜索工程仓、商品',
    'supplier': '搜索订单、商品',
  }
  return placeholders[currentRole.value] || '搜索'
})

const marketTabName = computed(() => {
  const names: Record<string, string> = {
    'warehouse': '市场',
    'construction': '工程仓',
    'supplier': '商品',
  }
  return names[currentRole.value] || '市场'
})

const sectionTitle = computed(() => {
  const titles: Record<string, string> = {
    'warehouse': '热门商品',
    'construction': '推荐工程仓',
    'supplier': '热销商品',
  }
  return titles[currentRole.value] || '热门商品'
})

const quickEntries = computed(() => {
  const entries: Record<string, any[]> = {
    'warehouse': [
      { id: 1, name: '采购计划', icon: 'icon-calendar', color: '#e8f3ff' },
      { id: 2, name: '我的订单', icon: 'icon-file', color: '#fff7e8' },
      { id: 3, name: '库存查询', icon: 'icon-storage', color: '#e8ffea' },
      { id: 4, name: '供应商', icon: 'icon-shop', color: '#f2e8ff' },
    ],
    'construction': [
      { id: 1, name: '工程仓', icon: 'icon-storage', color: '#e8f3ff' },
      { id: 2, name: '我的订单', icon: 'icon-file', color: '#fff7e8' },
      { id: 3, name: '收货地址', icon: 'icon-location', color: '#e8ffea' },
      { id: 4, name: '收藏', icon: 'icon-heart', color: '#f2e8ff' },
    ],
    'supplier': [
      { id: 1, name: '供货管理', icon: 'icon-list', color: '#e8f3ff' },
      { id: 2, name: '供货订单', icon: 'icon-file', color: '#fff7e8' },
      { id: 3, name: '商品管理', icon: 'icon-apps', color: '#e8ffea' },
      { id: 4, name: '数据统计', icon: 'icon-bar-chart', color: '#f2e8ff' },
    ],
  }
  return entries[currentRole.value] || entries['warehouse']
})

const products = ref([
  { id: 1, name: 'P.O 42.5 普通硅酸盐水泥', price: '520.00', unit: '吨', image: 'https://picsum.photos/200/200?random=1' },
  { id: 2, name: 'HRB400E 螺纹钢 Φ16', price: '4280.00', unit: '吨', image: 'https://picsum.photos/200/200?random=2' },
  { id: 3, name: '中砂', price: '85.00', unit: '方', image: 'https://picsum.photos/200/200?random=3' },
  { id: 4, name: '碎石 5-31.5mm', price: '72.00', unit: '方', image: 'https://picsum.photos/200/200?random=4' },
])

function handleEntryClick(item: any) {
  if (item.name === '供货管理') {
    emit('navigate', 'supply-manage')
  } else if (item.name === '工程仓') {
    emit('navigate', 'warehouse-list')
  } else if (item.name === '我的订单') {
    emit('navigate', 'order')
  }
}
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 50px;
  position: relative;
}

.header {
  padding: 10px 16px;
  background-color: #fff;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background-color: #f7f8fa;
  border-radius: 18px;
}

.search-icon {
  margin-right: 8px;
  font-size: 14px;
  color: #86909c;
}

.search-placeholder {
  color: #86909c;
  font-size: 14px;
}

.banner {
  margin: 12px 16px;
}

.swiper {
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}

.swiper-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quick-entry {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.entry-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 20px;
  color: #165dff;
}

.entry-text {
  font-size: 12px;
  color: #1d2129;
}

.section {
  padding: 0 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.section-more {
  font-size: 12px;
  color: #86909c;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-item {
  width: calc(50% - 6px);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.product-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 13px;
  color: #1d2129;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  color: #f53f3f;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #f53f3f;
}

.product-unit {
  font-size: 11px;
  color: #86909c;
  margin-left: 2px;
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
