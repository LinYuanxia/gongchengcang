<template>
  <div class="mp-page warehouse-product-detail">
    <div class="product-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">商品详情</div>
    </div>
    
    <div class="product-images">
      <div class="main-image">
        <img :src="product.images[activeImage]" :alt="product.name" />
      </div>
      <div class="image-dots">
        <span 
          v-for="(img, index) in product.images" 
          :key="index"
          :class="{ active: activeImage === index }"
          @click="activeImage = index"
        ></span>
      </div>
    </div>
    
    <div class="product-info">
      <div class="product-price">
        <span class="current-price">
          <span class="symbol">¥</span>{{ product.price }}
        </span>
        <span class="unit">/{{ product.unit }}</span>
        <span class="original-price" v-if="product.originalPrice">
          ¥{{ product.originalPrice }}
        </span>
      </div>
      <div class="product-name">{{ product.name }}</div>
      <div class="product-tags">
        <span class="tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
    
    <div class="info-card">
      <div class="card-title">商品规格</div>
      <div class="spec-list">
        <div class="spec-item" v-for="spec in product.specs" :key="spec.label">
          <span class="spec-label">{{ spec.label }}</span>
          <span class="spec-value">{{ spec.value }}</span>
        </div>
      </div>
    </div>
    
    <div class="info-card">
      <div class="card-title">供应商信息</div>
      <div class="supplier-info">
        <div class="supplier-avatar">
          <img :src="product.supplier.avatar" :alt="product.supplier.name" />
        </div>
        <div class="supplier-detail">
          <div class="supplier-name">{{ product.supplier.name }}</div>
          <div class="supplier-meta">
            <span>发货时效：{{ product.supplier.deliveryTime }}</span>
            <span>好评率：{{ product.supplier.rating }}%</span>
          </div>
        </div>
        <icon-right class="arrow" />
      </div>
    </div>
    
    <div class="info-card">
      <div class="card-title">商品详情</div>
      <div class="detail-content">
        <p>商品详细介绍内容...</p>
      </div>
    </div>
    
    <div class="bottom-bar">
      <div class="action-btns">
        <div class="action-item" @click="handleContact">
          <icon-message />
          <span>联系供应商</span>
        </div>
        <div class="action-item" @click="handleFavorite">
          <icon-heart />
          <span>收藏</span>
        </div>
      </div>
      <div class="buy-btns">
        <div class="add-cart-btn" @click="handleAddCart">加入购物车</div>
        <div class="buy-now-btn" @click="handleBuyNow">立即采购</div>
      </div>
    </div>
    
    <div class="sku-popup" v-if="showSkuPopup" @click="showSkuPopup = false">
      <div class="sku-content" @click.stop>
        <div class="sku-header">
          <div class="sku-image">
            <img :src="product.images[0]" :alt="product.name" />
          </div>
          <div class="sku-info">
            <div class="sku-price">¥{{ product.price }}</div>
            <div class="sku-stock">库存：{{ product.stock }}{{ product.unit }}</div>
          </div>
          <icon-close class="close-btn" @click="showSkuPopup = false" />
        </div>
        
        <div class="sku-specs">
          <div class="spec-group" v-for="spec in product.skuSpecs" :key="spec.name">
            <div class="spec-name">{{ spec.name }}</div>
            <div class="spec-options">
              <div 
                class="spec-option" 
                :class="{ active: selectedSpecs[spec.name] === option }"
                v-for="option in spec.options" 
                :key="option"
                @click="selectedSpecs[spec.name] = option"
              >
                {{ option }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="quantity-section">
          <span class="quantity-label">采购数量</span>
          <div class="quantity-control">
            <div class="minus-btn" @click="quantity > 1 && quantity--">-</div>
            <input type="number" v-model="quantity" />
            <div class="plus-btn" @click="quantity++">+</div>
          </div>
        </div>
        
        <div class="confirm-btn" @click="handleConfirmSku">确定</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['navigate'])

const activeImage = ref(0)
const showSkuPopup = ref(false)
const quantity = ref(1)
const selectedSpecs = reactive<Record<string, string>>({})

const product = ref({
  id: 1,
  name: '高标号水泥 P.O42.5',
  price: 28.5,
  originalPrice: 32,
  unit: '袋',
  stock: 5000,
  images: [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
    'https://picsum.photos/400/400?random=3',
  ],
  tags: ['热销', '品质保证'],
  specs: [
    { label: '品牌', value: '海螺' },
    { label: '规格', value: 'P.O42.5' },
    { label: '包装', value: '50kg/袋' },
    { label: '产地', value: '安徽' },
  ],
  skuSpecs: [
    { name: '规格', options: ['P.O42.5', 'P.O52.5', 'P.C32.5'] },
    { name: '包装', options: ['50kg/袋', '散装'] },
  ],
  supplier: {
    name: '华东建材供应商',
    avatar: 'https://picsum.photos/100/100?random=10',
    deliveryTime: '24小时',
    rating: 98,
  },
})

function handleBack() {
  emit('navigate', 'market')
}

function handleContact() {
  
}

function handleFavorite() {
  
}

function handleAddCart() {
  showSkuPopup.value = true
}

function handleBuyNow() {
  showSkuPopup.value = true
}

function handleConfirmSku() {
  showSkuPopup.value = false
  emit('navigate', 'order-create')
}
</script>

<style lang="scss" scoped>
.warehouse-product-detail {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
}

.product-header {
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

.product-images {
  padding-top: 44px;
  background: #fff;
  
  .main-image {
    aspect-ratio: 1;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .image-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 12px 0;
    
    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ddd;
      
      &.active {
        background: #ff6b00;
        width: 16px;
        border-radius: 3px;
      }
    }
  }
}

.product-info {
  background: #fff;
  padding: 12px;
  margin-bottom: 10px;
  
  .product-price {
    display: flex;
    align-items: baseline;
    
    .current-price {
      color: #ff6b00;
      font-weight: 600;
      
      .symbol {
        font-size: 14px;
      }
      
      font-size: 24px;
    }
    
    .unit {
      font-size: 12px;
      color: #999;
      margin-left: 4px;
    }
    
    .original-price {
      font-size: 12px;
      color: #999;
      text-decoration: line-through;
      margin-left: 8px;
    }
  }
  
  .product-name {
    font-size: 16px;
    color: #333;
    margin-top: 8px;
    line-height: 1.5;
  }
  
  .product-tags {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    
    .tag {
      font-size: 10px;
      color: #ff6b00;
      background: #fff5f0;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

.info-card {
  background: #fff;
  margin-bottom: 10px;
  padding: 12px;
  
  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }
}

.spec-list {
  .spec-item {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .spec-label {
      width: 60px;
      color: #999;
      font-size: 13px;
    }
    
    .spec-value {
      flex: 1;
      color: #333;
      font-size: 13px;
    }
  }
}

.supplier-info {
  display: flex;
  align-items: center;
  
  .supplier-avatar {
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
  
  .supplier-detail {
    flex: 1;
    margin-left: 12px;
    
    .supplier-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
    
    .supplier-meta {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      
      span {
        margin-right: 12px;
      }
    }
  }
  
  .arrow {
    color: #ccc;
  }
}

.detail-content {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.bottom-bar {
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
  
  .action-btns {
    display: flex;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 12px;
      font-size: 10px;
      color: #666;
      
      svg {
        font-size: 18px;
        margin-bottom: 2px;
      }
    }
  }
  
  .buy-btns {
    flex: 1;
    display: flex;
    margin-left: 12px;
    
    .add-cart-btn {
      flex: 1;
      height: 36px;
      background: #ff9500;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18px 0 0 18px;
      font-size: 13px;
    }
    
    .buy-now-btn {
      flex: 1;
      height: 36px;
      background: #ff6b00;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0 18px 18px 0;
      font-size: 13px;
    }
  }
}

.sku-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  
  .sku-content {
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding: 16px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .sku-header {
    display: flex;
    position: relative;
    
    .sku-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .sku-info {
      flex: 1;
      margin-left: 12px;
      
      .sku-price {
        font-size: 20px;
        color: #ff6b00;
        font-weight: 600;
      }
      
      .sku-stock {
        font-size: 12px;
        color: #999;
        margin-top: 8px;
      }
    }
    
    .close-btn {
      position: absolute;
      right: 0;
      top: 0;
      font-size: 20px;
      color: #999;
    }
  }
  
  .sku-specs {
    margin-top: 20px;
    
    .spec-group {
      margin-bottom: 16px;
      
      .spec-name {
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
      }
      
      .spec-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .spec-option {
          padding: 6px 12px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 13px;
          color: #333;
          
          &.active {
            background: #fff5f0;
            color: #ff6b00;
            border: 1px solid #ff6b00;
          }
        }
      }
    }
  }
  
  .quantity-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-top: 1px solid #f5f5f5;
    
    .quantity-label {
      font-size: 14px;
      color: #333;
    }
    
    .quantity-control {
      display: flex;
      align-items: center;
      
      .minus-btn, .plus-btn {
        width: 28px;
        height: 28px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #333;
      }
      
      input {
        width: 50px;
        height: 28px;
        text-align: center;
        border: none;
        background: #f5f5f5;
        font-size: 14px;
      }
    }
  }
  
  .confirm-btn {
    height: 44px;
    background: #ff6b00;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 22px;
    font-size: 15px;
    margin-top: 16px;
  }
}
</style>
