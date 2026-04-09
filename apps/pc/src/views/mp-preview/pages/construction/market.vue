<template>
  <div class="mp-page market">
    <div class="page-header">
      <div class="search-bar">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索商品名称" class="search-input" />
      </div>
    </div>
    
    <div class="main-content">
      <div class="category-sidebar">
        <div class="category-list">
          <div 
            class="category-item" 
            :class="{ active: activeCategory === item.id }"
            v-for="item in categories" 
            :key="item.id"
            @click="handleCategoryClick(item.id)"
          >
            <div class="category-icon" v-html="item.icon"></div>
            <span class="category-text">{{ item.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="content-area" ref="contentArea" @scroll="handleScroll">
        <div class="bom-section">
          <div class="section-header">
            <span class="section-title">BOM基装包</span>
            <span class="section-more" @click="$emit('navigate', 'bom-market')">查看全部</span>
          </div>
          <div class="bom-list">
            <div class="bom-card" v-for="bom in bomPackages" :key="bom.id" @click="handleBomClick(bom)">
              <div class="bom-image">
                <img :src="bom.image" :alt="bom.name" />
                <div class="bom-tag" v-if="bom.tag">{{ bom.tag }}</div>
              </div>
              <div class="bom-info">
                <div class="bom-name">{{ bom.name }}</div>
                <div class="bom-footer">
                  <span class="bom-price">¥{{ bom.price }}起</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="product-section">
          <div class="section-header">
            <span class="section-title">热门商品</span>
          </div>
          <div class="waterfall-list">
            <div class="waterfall-column">
              <div class="product-card" v-for="item in leftProducts" :key="item.id">
                <div class="product-image">
                  <img :src="item.image" :alt="item.name" />
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
            <div class="waterfall-column">
              <div class="product-card" v-for="item in rightProducts" :key="item.id">
                <div class="product-image">
                  <img :src="item.image" :alt="item.name" />
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
          </div>
        </div>
        
        <div class="load-more">没有更多了~</div>
      </div>
    </div>
    
    <div class="cart-bar" v-if="cartTotalCount > 0">
      <div class="cart-icon" @click="$emit('navigate', 'cart')">
        <icon-shopping-cart />
        <span class="cart-badge">{{ cartTotalCount }}</span>
      </div>
      <div class="cart-info">
        <div class="cart-total">¥{{ cartTotalPrice }}</div>
        <div class="cart-desc">已选{{ cartTotalCount }}件商品</div>
      </div>
      <div class="cart-btn" @click="$emit('navigate', 'order-create')">
        去结算
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item active">
        <icon-apps />
        <span>商品市场</span>
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

const emit = defineEmits(['navigate'])

const activeCategory = ref(0)

const categories = ref([
  { id: 0, name: '全部', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
  { id: 1, name: '水泥砂石', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
  { id: 2, name: '钢材型材', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  { id: 3, name: '水电材料', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
  { id: 4, name: '瓷砖石材', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' },
  { id: 5, name: '涂料防水', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
  { id: 6, name: '板材木材', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="12"/></svg>' },
  { id: 7, name: '五金配件', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/></svg>' },
])

const bomPackages = ref([
  {
    id: 1,
    name: '基础装修BOM包',
    price: '12,800',
    itemCount: 28,
    tag: '热销',
    image: 'https://picsum.photos/200/200?random=101',
  },
  {
    id: 2,
    name: '水电改造BOM包',
    price: '5,600',
    itemCount: 15,
    tag: '推荐',
    image: 'https://picsum.photos/200/200?random=102',
  },
])

const products = ref([
  {
    id: 1,
    name: '普通硅酸盐水泥 42.5',
    spec: '50kg/袋',
    price: '450',
    image: 'https://picsum.photos/200/220?random=201',
  },
  {
    id: 2,
    name: '螺纹钢 HRB400 16mm',
    spec: '9m/根',
    price: '4,280',
    image: 'https://picsum.photos/200/180?random=202',
  },
  {
    id: 3,
    name: '黄砂 中砂',
    spec: '吨',
    price: '95',
    image: 'https://picsum.photos/200/200?random=203',
  },
  {
    id: 4,
    name: '防水涂料 K11',
    spec: '20kg/桶',
    price: '280',
    image: 'https://picsum.photos/200/210?random=204',
  },
  {
    id: 5,
    name: 'PPR冷热水管 S3.2',
    spec: 'DN20 4米/根',
    price: '32',
    image: 'https://picsum.photos/200/190?random=205',
  },
  {
    id: 6,
    name: 'BV铜芯线 2.5mm²',
    spec: '100米/卷',
    price: '185',
    image: 'https://picsum.photos/200/205?random=206',
  },
])

const leftProducts = computed(() => products.value.filter((_, index) => index % 2 === 0))
const rightProducts = computed(() => products.value.filter((_, index) => index % 2 === 1))

const cartItems = ref<Record<number, number>>({})

const cartTotalCount = computed(() => {
  return Object.values(cartItems.value).reduce((sum, qty) => sum + qty, 0)
})

const cartTotalPrice = computed(() => {
  return Object.entries(cartItems.value).reduce((sum, [id, qty]) => {
    const product = products.value.find(p => p.id === Number(id))
    return sum + (product ? Number(product.price.replace(',', '')) * qty : 0)
  }, 0).toLocaleString()
})

function getQuantity(id: number) {
  return cartItems.value[id] || 0
}

function handleMinus(item: any) {
  if (cartItems.value[item.id] > 0) {
    cartItems.value[item.id]--
    if (cartItems.value[item.id] === 0) {
      delete cartItems.value[item.id]
    }
  }
}

function handlePlus(item: any) {
  cartItems.value[item.id] = (cartItems.value[item.id] || 0) + 1
}

function handleScroll(e: Event) {
}

function handleBomClick(bom: any) {
  emit('navigate', 'bom-detail', { bomId: bom.id })
}

function handleCategoryClick(id: number) {
  activeCategory.value = id
}
</script>

<style lang="scss" scoped>
.market {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 110px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  padding: 8px 16px;
  z-index: 100;
  
  .search-bar {
    display: flex;
    align-items: center;
    background: #f2f3f5;
    border-radius: 20px;
    padding: 0 12px;
    height: 34px;
    
    .search-icon {
      color: #86909c;
      font-size: 16px;
    }
    
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      margin-left: 8px;
      font-size: 14px;
      outline: none;
      
      &::placeholder {
        color: #86909c;
      }
    }
  }
}

.main-content {
  display: flex;
  padding-top: 50px;
  height: calc(100vh - 110px);
}

.category-sidebar {
  width: 90px;
  background: #f7f8fa;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  
  .category-list {
    display: flex;
    flex-direction: column;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 8px;
      gap: 6px;
      background: #fff;
      margin-bottom: 1px;
      
      .category-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4e5969;
        font-size: 20px;
        
        svg {
          width: 20px;
          height: 20px;
        }
      }
      
      .category-text {
        font-size: 11px;
        color: #4e5969;
        text-align: center;
        line-height: 1.2;
      }
      
      &.active {
        background: #fff;
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: linear-gradient(180deg, #165dff, #4080ff);
          border-radius: 0 2px 2px 0;
        }
        
        .category-icon {
          color: #165dff;
        }
        
        .category-text {
          color: #165dff;
          font-weight: 500;
        }
      }
    }
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  height: 100%;
  
  .bom-section {
    margin-bottom: 16px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .section-more {
        font-size: 12px;
        color: #165dff;
      }
    }
    
    .bom-list {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
      
      .bom-card {
        width: 130px;
        flex-shrink: 0;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        
        .bom-image {
          width: 100%;
          height: 80px;
          position: relative;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .bom-tag {
            position: absolute;
            top: 6px;
            left: 6px;
            background: #f53f3f;
            color: #fff;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
        
        .bom-info {
          padding: 8px;
          
          .bom-name {
            font-size: 12px;
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .bom-footer {
            .bom-price {
              font-size: 14px;
              font-weight: 600;
              color: #f53f3f;
            }
          }
        }
      }
    }
  }
  
  .product-section {
    .section-header {
      margin-bottom: 12px;
      
      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #1d2129;
      }
    }
    
    .waterfall-list {
      display: flex;
      gap: 10px;
      
      .waterfall-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .product-card {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        
        .product-image {
          width: 100%;
          
          img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
          }
        }
        
        .product-info {
          padding: 8px;
          
          .product-name {
            font-size: 12px;
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 3px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.4;
          }
          
          .product-spec {
            font-size: 11px;
            color: #86909c;
            margin-bottom: 6px;
          }
          
          .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .product-price {
              font-size: 14px;
              font-weight: 600;
              color: #f53f3f;
            }
            
            .quantity-control {
              display: flex;
              align-items: center;
              gap: 6px;
              
              .btn-minus,
              .btn-plus {
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                background: #f2f3f5;
                color: #4e5969;
                
                &.disabled {
                  opacity: 0.5;
                }
              }
              
              .btn-plus {
                background: linear-gradient(135deg, #165dff, #4080ff);
                color: #fff;
              }
              
              .quantity-value {
                font-size: 13px;
                font-weight: 500;
                color: #1d2129;
                min-width: 16px;
                text-align: center;
              }
            }
          }
        }
      }
    }
  }
  
  .load-more {
    text-align: center;
    padding: 20px;
    font-size: 12px;
    color: #c9cdd4;
  }
}

.cart-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 99;
  
  .cart-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #165dff, #4080ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    position: relative;
    
    .cart-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #f53f3f;
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
  
  .cart-info {
    flex: 1;
    margin-left: 12px;
    
    .cart-total {
      font-size: 18px;
      font-weight: 600;
      color: #f53f3f;
    }
    
    .cart-desc {
      font-size: 11px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .cart-btn {
    background: linear-gradient(135deg, #165dff, #4080ff);
    color: #fff;
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
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
  z-index: 98;
  
  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #86909c;
    
    svg {
      font-size: 20px;
    }
    
    span {
      font-size: 10px;
    }
    
    &.active {
      color: #165dff;
    }
  }
}
</style>
