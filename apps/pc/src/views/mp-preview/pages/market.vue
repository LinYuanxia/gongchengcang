<template>
  <div class="mp-page">
    <div class="header">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" v-model="keyword" placeholder="搜索商品名称/编码" class="search-input" />
      </div>
    </div>
    
    <div class="category-scroll">
      <div class="category-list">
        <div 
          class="category-item" 
          :class="{ active: currentCategory === '' }"
          @click="currentCategory = ''"
        >
          全部
        </div>
        <div 
          v-for="cat in categories" 
          :key="cat.id"
          class="category-item" 
          :class="{ active: currentCategory === cat.id }"
          @click="currentCategory = cat.id"
        >
          {{ cat.name }}
        </div>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-item" :class="{ active: sortType === 'default' }">综合</div>
      <div class="filter-item" :class="{ active: sortType === 'sales' }">销量</div>
      <div class="filter-item" :class="{ active: sortType === 'price' }">价格</div>
      <div class="filter-item">筛选</div>
    </div>
    
    <div class="product-list">
      <div 
        class="product-item" 
        v-for="item in products" 
        :key="item.id"
        @click="$emit('navigate', 'product-detail')"
      >
        <img :src="item.image" mode="aspectFill" class="product-image" />
        <div class="product-info">
          <div class="product-header">
            <span class="product-name">{{ item.name }}</span>
            <div class="product-tags">
              <span class="tag hot" v-if="item.isHot">热销</span>
              <span class="tag recommend" v-if="item.isRecommend">推荐</span>
            </div>
          </div>
          <span class="product-spec">{{ item.spec }}</span>
          <div class="supplier-info">
            <template v-if="item.supplierCount > 1">
              <span class="supplier-count">{{ item.supplierCount }}家供应商</span>
              <span class="min-price">最低 ¥{{ item.minPrice }}</span>
            </template>
            <template v-else>
              <span class="supplier-name">{{ item.supplierName }}</span>
            </template>
          </div>
          <div class="product-bottom">
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ item.price }}</span>
              <span class="product-unit">/{{ item.unit }}</span>
            </div>
            <div class="add-cart">
              <span>+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>首页</span>
      </div>
      <div class="tabbar-item active">
        <icon-apps />
        <span>市场</span>
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
import { ref } from 'vue'

defineEmits(['navigate'])

const keyword = ref('')
const sortType = ref('default')
const currentCategory = ref('')

const categories = ref([
  { id: 'steel', name: '钢材' },
  { id: 'cement', name: '水泥' },
  { id: 'sand', name: '砂石' },
  { id: 'concrete', name: '混凝土' },
])

const products = ref([
  { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', price: 450, unit: '吨', isHot: true, isRecommend: true, supplierCount: 2, minPrice: 415, image: 'https://picsum.photos/200/200?random=1' },
  { id: 2, name: '螺纹钢 HRB400 16mm', spec: '16mm', price: 4200, unit: '吨', isHot: false, isRecommend: false, supplierCount: 1, supplierName: '宝钢供应商', image: 'https://picsum.photos/200/200?random=2' },
  { id: 3, name: '黄砂 中砂', spec: '中砂', price: 95, unit: '方', isHot: false, isRecommend: true, supplierCount: 1, supplierName: '南方建材', image: 'https://picsum.photos/200/200?random=3' },
  { id: 4, name: '商品混凝土 C30', spec: 'C30', price: 420, unit: '方', isHot: true, isRecommend: false, supplierCount: 1, supplierName: '中建混凝土', image: 'https://picsum.photos/200/200?random=4' },
])
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
}

.search-input {
  flex: 1;
  font-size: 14px;
  border: none;
  background: transparent;
  outline: none;
}

.category-scroll {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.category-list {
  display: flex;
  padding: 10px 16px;
  gap: 10px;
  overflow-x: auto;
}

.category-item {
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 14px;
  white-space: nowrap;
  
  &.active {
    color: #fff;
    background-color: #165dff;
  }
}

.filter-bar {
  display: flex;
  padding: 10px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #666;
  
  &.active {
    color: #165dff;
    font-weight: 600;
  }
}

.product-list {
  padding: 12px 16px;
}

.product-item {
  display: flex;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.product-image {
  width: 90px;
  height: 90px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.product-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-name {
  flex: 1;
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.product-tags {
  display: flex;
  
  .tag {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 2px;
    margin-left: 4px;
    
    &.hot {
      color: #f53f3f;
      background-color: #ffece8;
    }
    
    &.recommend {
      color: #165dff;
      background-color: #e8f3ff;
    }
  }
}

.product-spec {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.supplier-info {
  display: flex;
  align-items: center;
  margin-top: 6px;
  
  .supplier-count {
    font-size: 11px;
    color: #165dff;
    background-color: #e8f3ff;
    padding: 2px 6px;
    border-radius: 2px;
  }
  
  .min-price {
    font-size: 11px;
    color: #f53f3f;
    margin-left: 8px;
  }
  
  .supplier-name {
    font-size: 11px;
    color: #86909c;
  }
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
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
  font-size: 18px;
  font-weight: 600;
  color: #f53f3f;
}

.product-unit {
  font-size: 11px;
  color: #86909c;
  margin-left: 2px;
}

.add-cart {
  width: 28px;
  height: 28px;
  background-color: #165dff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
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
