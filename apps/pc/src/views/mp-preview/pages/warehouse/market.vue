<template>
  <div class="mp-page warehouse-market">
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索商品" v-model="searchText" />
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
        :class="{ active: activeCategory === 'hot' }"
        @click="activeCategory = 'hot'"
      >
        热销
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeCategory === 'new' }"
        @click="activeCategory = 'new'"
      >
        新品
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeCategory === 'promo' }"
        @click="activeCategory = 'promo'"
      >
        促销
      </div>
    </div>
    
    <div class="product-list">
      <div 
        class="product-card" 
        v-for="product in products" 
        :key="product.id"
        @click="handleProductClick(product)"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="product-tag" v-if="product.tag">{{ product.tag }}</div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-spec">{{ product.spec }}</div>
          <div class="product-supplier">
            <icon-shop />
            <span>{{ product.supplier }}</span>
          </div>
          <div class="product-bottom">
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ product.price }}</span>
              <span class="price-unit">/{{ product.unit }}</span>
            </div>
            <div class="add-cart" @click.stop="handleAddCart(product)">
              <icon-plus />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cart-bar">
      <div class="cart-info" @click="handleCartClick">
        <div class="cart-icon">
          <icon-shopping-cart />
          <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
        </div>
        <div class="cart-price">
          <span class="label">合计：</span>
          <span class="price">¥{{ cartTotal }}</span>
        </div>
      </div>
      <div class="cart-submit" @click="handleSubmit">
        去结算
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['navigate'])

const searchText = ref('')
const activeCategory = ref('all')
const cartItems = ref<any[]>([])

const products = ref([
  {
    id: 1,
    name: '高标号水泥 P.O42.5',
    spec: '50kg/袋',
    image: 'https://picsum.photos/200/200?random=1',
    price: 28.5,
    unit: '袋',
    supplier: '华东建材供应商',
    tag: '热销',
  },
  {
    id: 2,
    name: '国标螺纹钢 HRB400',
    spec: 'Φ12mm',
    image: 'https://picsum.photos/200/200?random=2',
    price: 4280,
    unit: '吨',
    supplier: '钢铁集团供应商',
    tag: '新品',
  },
  {
    id: 3,
    name: '建筑用黄沙',
    spec: '中粗砂',
    image: 'https://picsum.photos/200/200?random=3',
    price: 85,
    unit: '方',
    supplier: '砂石供应商',
    tag: '',
  },
  {
    id: 4,
    name: '商品混凝土 C30',
    spec: '预拌混凝土',
    image: 'https://picsum.photos/200/200?random=4',
    price: 380,
    unit: '方',
    supplier: '混凝土供应商',
    tag: '促销',
  },
  {
    id: 5,
    name: '防水涂料 JS型',
    spec: '20kg/桶',
    image: 'https://picsum.photos/200/200?random=5',
    price: 168,
    unit: '桶',
    supplier: '防水材料供应商',
    tag: '',
  },
  {
    id: 6,
    name: '建筑模板',
    spec: '1220×2440mm',
    image: 'https://picsum.photos/200/200?random=6',
    price: 45,
    unit: '张',
    supplier: '模板供应商',
    tag: '热销',
  },
])

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

function handleProductClick(product: any) {
  emit('navigate', 'product-detail', { id: product.id })
}

function handleAddCart(product: any) {
  const existItem = cartItems.value.find(item => item.id === product.id)
  if (existItem) {
    existItem.quantity++
  } else {
    cartItems.value.push({
      ...product,
      quantity: 1,
    })
  }
}

function handleCartClick() {
  emit('navigate', 'cart')
}

function handleSubmit() {
  emit('navigate', 'order-create')
}
</script>

<style lang="scss" scoped>
.warehouse-market {
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
      color: #ff6b00;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #ff6b00;
        border-radius: 1px;
      }
    }
  }
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  
  .product-image {
    position: relative;
    aspect-ratio: 1;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #ff6b00;
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
  
  .product-info {
    padding: 8px;
  }
  
  .product-name {
    font-size: 13px;
    color: #333;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .product-spec {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
  }
  
  .product-supplier {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #999;
    margin-top: 4px;
  }
  
  .product-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  
  .product-price {
    display: flex;
    align-items: baseline;
    
    .price-symbol {
      font-size: 12px;
      color: #ff6b00;
    }
    
    .price-value {
      font-size: 16px;
      color: #ff6b00;
      font-weight: 600;
    }
    
    .price-unit {
      font-size: 10px;
      color: #999;
      margin-left: 2px;
    }
  }
  
  .add-cart {
    width: 24px;
    height: 24px;
    background: #ff6b00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
  }
}

.cart-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  
  .cart-info {
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .cart-icon {
    position: relative;
    width: 40px;
    height: 40px;
    background: #ff6b00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    
    .cart-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ff2d2d;
      color: #fff;
      font-size: 10px;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  }
  
  .cart-price {
    margin-left: 12px;
    
    .label {
      font-size: 12px;
      color: #666;
    }
    
    .price {
      font-size: 18px;
      color: #ff6b00;
      font-weight: 600;
    }
  }
  
  .cart-submit {
    background: #ff6b00;
    color: #fff;
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
