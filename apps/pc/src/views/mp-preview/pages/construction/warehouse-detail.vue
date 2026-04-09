<template>
  <div class="mp-page warehouse-detail">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">{{ warehouseInfo.name }}</div>
      <div class="header-action" @click="handleSearch">
        <icon-search />
      </div>
    </div>
    
    <div class="warehouse-info">
      <div class="info-row">
        <icon-location class="info-icon" />
        <span class="info-text">{{ warehouseInfo.address }}</span>
      </div>
      <div class="info-row">
        <icon-phone class="info-icon" />
        <span class="info-text">{{ warehouseInfo.phone }}</span>
      </div>
      <div class="info-row">
        <icon-time-circle class="info-icon" />
        <span class="info-text">营业时间：{{ warehouseInfo.businessHours }}</span>
      </div>
      <div class="distance-tag">
        距您 {{ warehouseInfo.distance }}
      </div>
    </div>
    
    <div class="category-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeCategory === item.id }"
        v-for="item in categories" 
        :key="item.id"
        @click="activeCategory = item.id"
      >
        {{ item.name }}
      </div>
    </div>
    
    <div class="product-list">
      <div class="product-item" v-for="item in filteredProducts" :key="item.id">
        <div class="product-image">
          <img :src="item.image" :alt="item.name" />
          <div class="stock-tag" :class="{ low: item.stock < 10 }">
            库存 {{ item.stock }}
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-spec">{{ item.spec }}</div>
          <div class="product-footer">
            <div class="product-price">¥{{ item.price }}</div>
            <div class="quantity-control">
              <div class="btn-minus" @click.stop="handleMinus(item)" :class="{ disabled: getQuantity(item.id) <= 0 }">
                <icon-minus />
              </div>
              <div class="quantity-value" v-if="getQuantity(item.id) > 0">
                {{ getQuantity(item.id) }}
              </div>
              <div class="btn-plus" @click.stop="handlePlus(item)">
                <icon-plus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bottom-bar" v-if="totalQuantity > 0">
      <div class="cart-btn" @click="handleCart">
        <icon-shopping-cart />
        <span class="cart-badge">{{ totalQuantity }}</span>
      </div>
      <div class="price-info">
        <div class="price-label">合计</div>
        <div class="price-value">¥{{ totalPrice }}</div>
      </div>
      <div class="submit-btn" @click="handleSubmit">
        立即下单
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const warehouseInfo = ref({
  name: '深圳南山工程仓',
  address: '广东省深圳市南山区科技园北区松坪山路3号',
  phone: '0755-86951234',
  businessHours: '08:00 - 20:00',
  distance: '2.5km',
})

const activeCategory = ref('all')

const categories = ref([
  { id: 'all', name: '全部' },
  { id: '1', name: '水泥' },
  { id: '2', name: '钢材' },
  { id: '3', name: '砂石' },
  { id: '4', name: '管材' },
  { id: '5', name: '涂料' },
])

const products = ref([
  { id: 1, categoryId: '1', name: '普通硅酸盐水泥 42.5', spec: '50kg/袋', price: '450', stock: 85, image: 'https://picsum.photos/160/160?random=p1' },
  { id: 2, categoryId: '1', name: '复合硅酸盐水泥 32.5', spec: '50kg/袋', price: '380', stock: 120, image: 'https://picsum.photos/160/160?random=p2' },
  { id: 3, categoryId: '2', name: '螺纹钢 HRB400 16mm', spec: '9m/根', price: '4,280', stock: 5, image: 'https://picsum.photos/160/160?random=p3' },
  { id: 4, categoryId: '2', name: '盘螺 HRB400 8mm', spec: '吨', price: '4,500', stock: 45, image: 'https://picsum.photos/160/160?random=p4' },
  { id: 5, categoryId: '3', name: '黄砂 中砂', spec: '吨', price: '95', stock: 200, image: 'https://picsum.photos/160/160?random=p5' },
  { id: 6, categoryId: '3', name: '石子 5-25mm', spec: '吨', price: '78', stock: 180, image: 'https://picsum.photos/160/160?random=p6' },
  { id: 7, categoryId: '4', name: 'PVC排水管 DN110', spec: '4m/根', price: '32', stock: 50, image: 'https://picsum.photos/160/160?random=p7' },
  { id: 8, categoryId: '5', name: '乳胶漆 内墙白色', spec: '18L/桶', price: '280', stock: 3, image: 'https://picsum.photos/160/160?random=p8' },
])

const cart = ref<Record<number, number>>({})

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return products.value
  }
  return products.value.filter(p => p.categoryId === activeCategory.value)
})

const totalQuantity = computed(() => {
  return Object.values(cart.value).reduce((sum, qty) => sum + qty, 0)
})

const totalPrice = computed(() => {
  let total = 0
  for (const [id, qty] of Object.entries(cart.value)) {
    const product = products.value.find(p => p.id === Number(id))
    if (product) {
      total += parseFloat(product.price.replace(',', '')) * qty
    }
  }
  return total.toLocaleString()
})

function getQuantity(productId: number) {
  return cart.value[productId] || 0
}

function handleMinus(product: any) {
  if (getQuantity(product.id) > 0) {
    cart.value[product.id]--
    if (cart.value[product.id] === 0) {
      delete cart.value[product.id]
    }
  }
}

function handlePlus(product: any) {
  if (getQuantity(product.id) < product.stock) {
    cart.value[product.id] = getQuantity(product.id) + 1
  }
}

function handleBack() {
  emit('navigate', 'warehouse-list')
}

function handleSearch() {
  console.log('搜索商品')
}

function handleCart() {
  console.log('购物车', cart.value)
}

function handleSubmit() {
  emit('navigate', 'order-create')
}
</script>

<style lang="scss" scoped>
.warehouse-detail {
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
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid #eee;
  
  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: #4e5969;
  }
  
  .header-title {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
  
  .header-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
}

.warehouse-info {
  margin-top: 54px;
  background: #fff;
  padding: 16px;
  position: relative;
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .info-icon {
      color: #165dff;
      font-size: 16px;
    }
    
    .info-text {
      font-size: 13px;
      color: #4e5969;
    }
  }
  
  .distance-tag {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 3px 8px;
    background: #e8f3ff;
    color: #165dff;
    font-size: 11px;
    border-radius: 4px;
  }
}

.category-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  
  .tab-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
    position: relative;
    white-space: nowrap;
    
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

.product-list {
  padding: 12px;
  
  .product-item {
    display: flex;
    gap: 12px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    
    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .stock-tag {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2px 0;
        background: rgba(0, 180, 42, 0.85);
        color: #fff;
        font-size: 10px;
        text-align: center;
        
        &.low {
          background: rgba(245, 63, 63, 0.85);
        }
      }
    }
    
    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .product-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .product-spec {
        font-size: 12px;
        color: #86909c;
        margin-bottom: auto;
      }
      
      .product-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .product-price {
          font-size: 16px;
          font-weight: 600;
          color: #f53f3f;
        }
        
        .quantity-control {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .btn-minus,
          .btn-plus {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            
            &.disabled {
              opacity: 0.5;
            }
          }
          
          .btn-minus {
            background: #f2f3f5;
            color: #4e5969;
          }
          
          .btn-plus {
            background: #165dff;
            color: #fff;
          }
          
          .quantity-value {
            min-width: 20px;
            text-align: center;
            font-size: 14px;
            font-weight: 500;
            color: #1d2129;
          }
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
  
  .cart-btn {
    width: 40px;
    height: 40px;
    background: #f2f3f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-right: 12px;
    
    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      background: #f53f3f;
      color: #fff;
      border-radius: 9px;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  }
  
  .price-info {
    flex: 1;
    
    .price-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 2px;
    }
    
    .price-value {
      font-size: 18px;
      font-weight: 600;
      color: #f53f3f;
    }
  }
  
  .submit-btn {
    padding: 12px 28px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    color: #fff;
    border-radius: 22px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
