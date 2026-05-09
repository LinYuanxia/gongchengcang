<template>
  <div class="mp-page market">
    <div class="page-header">
      <div class="header-top">
        <div class="warehouse-select" @click="showWarehousePicker = true">
          <icon-map-pin />
          <span>{{ selectedWarehouse }}</span>
          <icon-down />
        </div>
        <div class="search-bar" @click="focusSearch = true">
          <icon-search class="search-icon" />
          <input 
            type="text" 
            placeholder="搜索商品名称" 
            class="search-input" 
            v-model="searchKeyword"
            :class="{ focused: focusSearch }"
          />
          <icon-close class="clear-icon" v-if="searchKeyword" @click.stop="searchKeyword = ''" />
        </div>
      </div>
      
      <div class="category-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeCategory === tab.key }"
          v-for="tab in categoryTabs" 
          :key="tab.key"
          @click="handleCategoryClick(tab.key)"
        >
          <span class="tab-icon" v-html="tab.icon"></span>
          <span class="tab-text">{{ tab.name }}</span>
        </div>
      </div>
      
      <div class="filter-bar" v-if="currentSubCategories.length > 0">
        <div class="filter-item" @click="showSubCategoryPicker = true">
          <span class="filter-label">{{ currentSubCategoryName }}</span>
          <icon-down class="filter-arrow" />
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <template v-if="activeCategory === 'bom'">
        <div class="section-header">
          <span class="section-title">BOM基装包</span>
          <span class="section-more" @click="$emit('navigate', 'bom-market')">查看全部</span>
        </div>
        <div class="bom-grid">
          <div class="bom-card" v-for="bom in bomPackages" :key="bom.id" @click="handleBomClick(bom)">
            <div class="bom-image-wrap">
              <img :src="bom.image" :alt="bom.name" class="bom-image" />
              <div class="bom-tag" :class="bom.tag">{{ bom.tag }}</div>
            </div>
            <div class="bom-info">
              <div class="bom-name">{{ bom.name }}</div>
              <div class="bom-item-count">{{ bom.itemCount }}件商品</div>
              <div class="bom-footer">
                <span class="bom-price">¥{{ bom.price }}起</span>
                <span class="bom-arrow">
                  <icon-arrow-right />
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div class="product-header">
          <span class="product-count">共{{ filteredProducts.length }}件商品</span>
          <div class="sort-options">
            <div 
              class="sort-item" 
              :class="{ active: sortBy === 'default' }"
              @click="sortBy = 'default'"
            >
              默认
            </div>
            <div 
              class="sort-item" 
              :class="{ active: sortBy === 'price-asc' }"
              @click="sortBy = 'price-asc'"
            >
              价格升序
            </div>
            <div 
              class="sort-item" 
              :class="{ active: sortBy === 'price-desc' }"
              @click="sortBy = 'price-desc'"
            >
              价格降序
            </div>
          </div>
        </div>
        
        <div class="product-grid">
          <div 
            class="product-card" 
            v-for="item in filteredProducts" 
            :key="item.id"
            @click="handleProductClick(item)"
          >
            <div class="product-image-wrap">
              <img :src="item.image" :alt="item.name" class="product-image" />
              <div class="stock-tag" :class="{ out: getStock(item) === 0 }">
                {{ getStock(item) === 0 ? '缺货' : `库存${getStock(item)}` }}
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.name }}</div>
              <div class="product-spec">{{ item.spec }}</div>
              <div class="stock-hint" v-if="getStock(item) === 0 && getOtherWarehousesWithStock(item).length > 0">
                <icon-alert-circle />
                {{ getOtherWarehousesWithStock(item).slice(0, 2).join('、') }}有货
              </div>
              <div class="product-footer">
                <div class="product-price">¥{{ item.price }}</div>
                <div class="quantity-control" :class="{ disabled: getStock(item) === 0 }">
                  <div 
                    class="btn-minus" 
                    @click.stop="handleMinus(item)" 
                    :class="{ disabled: getQuantity(item.id) <= 0 }"
                  >
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
        
        <div class="empty-state" v-if="filteredProducts.length === 0">
          <icon-search class="empty-icon" />
          <div class="empty-text">没有找到相关商品</div>
        </div>
      </template>
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
    
    <div class="picker-popup" v-if="showWarehousePicker">
      <div class="popup-mask" @click="showWarehousePicker = false"></div>
      <div class="picker-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showWarehousePicker = false">取消</span>
          <span class="picker-title">选择仓库</span>
          <span class="picker-confirm" @click="handleWarehouseConfirm">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item" 
            :class="{ active: tempWarehouse === item.name }"
            v-for="item in warehouses" 
            :key="item.id"
            @click="tempWarehouse = item.name"
          >
            <div class="warehouse-info">
              <div class="warehouse-name">{{ item.name }}</div>
              <div class="warehouse-location">{{ item.location }}</div>
            </div>
            <div class="warehouse-status" :class="item.status">
              {{ item.status === 'normal' ? '正常' : '紧张' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="picker-popup" v-if="showSubCategoryPicker">
      <div class="popup-mask" @click="showSubCategoryPicker = false"></div>
      <div class="picker-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showSubCategoryPicker = false">取消</span>
          <span class="picker-title">筛选条件</span>
          <span class="picker-confirm" @click="showSubCategoryPicker = false">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item" 
            :class="{ active: activeSubCategory === sub.key }"
            v-for="sub in currentSubCategories" 
            :key="sub.key"
            @click="activeSubCategory = sub.key"
          >
            <span>{{ sub.name }}</span>
            <icon-check v-if="activeSubCategory === sub.key" class="check-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeCategory = ref('all')
const activeSubCategory = ref('all')
const sortBy = ref('default')
const searchKeyword = ref('')
const focusSearch = ref(false)
const showWarehousePicker = ref(false)
const showSubCategoryPicker = ref(false)
const selectedWarehouse = ref('工程仓库')
const tempWarehouse = ref('工程仓库')

const warehouses = ref([
  { id: 1, name: '工程仓库', location: '深圳市南山区科技园', status: 'normal' },
  { id: 2, name: '福田仓', location: '深圳市福田区车公庙', status: 'normal' },
  { id: 3, name: '罗湖仓', location: '深圳市罗湖区东门', status: 'normal' },
  { id: 4, name: '龙岗仓', location: '深圳市龙岗区坂田', status: 'tight' },
])

const categoryTabs = ref([
  { key: 'all', name: '全部', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
  { key: 'bom', name: 'BOM包', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
  { key: 'cement', name: '水泥砂石', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
  { key: 'steel', name: '钢材型材', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  { key: 'water', name: '水电材料', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
  { key: 'paint', name: '涂料防水', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
])

const subCategories: Record<string, Array<{ key: string; name: string }>> = {
  all: [
    { key: 'all', name: '全部' },
    { key: 'hot', name: '热销' },
    { key: 'new', name: '新品' },
    { key: 'recommend', name: '推荐' },
  ],
  cement: [
    { key: 'all', name: '全部' },
    { key: 'cement', name: '水泥' },
    { key: 'sand', name: '砂石' },
    { key: 'brick', name: '砖瓦' },
  ],
  steel: [
    { key: 'all', name: '全部' },
    { key: 'rebar', name: '钢筋' },
    { key: 'section', name: '型材' },
    { key: 'plate', name: '板材' },
  ],
  water: [
    { key: 'all', name: '全部' },
    { key: 'pipe', name: '管材' },
    { key: 'wire', name: '电线' },
    { key: 'fitting', name: '管件' },
  ],
  paint: [
    { key: 'all', name: '全部' },
    { key: 'waterproof', name: '防水' },
    { key: 'paint', name: '涂料' },
    { key: 'putty', name: '腻子' },
  ],
  bom: [],
}

const currentSubCategories = computed(() => {
  return subCategories[activeCategory.value] || []
})

const currentSubCategoryName = computed(() => {
  const sub = currentSubCategories.value.find(s => s.key === activeSubCategory.value)
  return sub?.name || '全部'
})

const bomPackages = ref([
  {
    id: 1,
    name: '基础装修BOM包',
    price: '12,800',
    itemCount: 28,
    tag: '热销',
    image: 'https://picsum.photos/280/200?random=101',
  },
  {
    id: 2,
    name: '水电改造BOM包',
    price: '5,600',
    itemCount: 15,
    tag: '推荐',
    image: 'https://picsum.photos/280/200?random=102',
  },
])

const products = ref([
  {
    id: 1,
    name: '普通硅酸盐水泥 42.5',
    spec: '50kg/袋',
    price: '450',
    image: 'https://picsum.photos/200/220?random=201',
    category: 'cement',
    subCategory: 'cement',
    tags: ['hot'],
    stock: {
      '工程仓库': 0,
      '福田仓': 150,
      '罗湖仓': 80,
      '龙岗仓': 200,
    },
  },
  {
    id: 2,
    name: '螺纹钢 HRB400 16mm',
    spec: '9m/根',
    price: '4,280',
    image: 'https://picsum.photos/200/180?random=202',
    category: 'steel',
    subCategory: 'rebar',
    tags: ['recommend'],
    stock: {
      '工程仓库': 50,
      '福田仓': 30,
      '罗湖仓': 0,
      '龙岗仓': 45,
    },
  },
  {
    id: 3,
    name: '黄砂 中砂',
    spec: '吨',
    price: '95',
    image: 'https://picsum.photos/200/200?random=203',
    category: 'cement',
    subCategory: 'sand',
    tags: [],
    stock: {
      '工程仓库': 120,
      '福田仓': 80,
      '罗湖仓': 60,
      '龙岗仓': 0,
    },
  },
  {
    id: 4,
    name: '防水涂料 K11',
    spec: '20kg/桶',
    price: '280',
    image: 'https://picsum.photos/200/210?random=204',
    category: 'paint',
    subCategory: 'waterproof',
    tags: ['new'],
    stock: {
      '工程仓库': 30,
      '福田仓': 45,
      '罗湖仓': 25,
      '龙岗仓': 50,
    },
  },
  {
    id: 5,
    name: 'PPR冷热水管 S3.2',
    spec: 'DN20 4米/根',
    price: '32',
    image: 'https://picsum.photos/200/190?random=205',
    category: 'water',
    subCategory: 'pipe',
    tags: [],
    stock: {
      '工程仓库': 0,
      '福田仓': 0,
      '罗湖仓': 120,
      '龙岗仓': 80,
    },
  },
  {
    id: 6,
    name: 'BV铜芯线 2.5mm²',
    spec: '100米/卷',
    price: '185',
    image: 'https://picsum.photos/200/205?random=206',
    category: 'water',
    subCategory: 'wire',
    tags: ['hot'],
    stock: {
      '工程仓库': 60,
      '福田仓': 40,
      '罗湖仓': 35,
      '龙岗仓': 55,
    },
  },
  {
    id: 7,
    name: '加气混凝土砌块',
    spec: '600×200×200mm',
    price: '28',
    image: 'https://picsum.photos/200/200?random=207',
    category: 'cement',
    subCategory: 'brick',
    tags: [],
    stock: {
      '工程仓库': 500,
      '福田仓': 300,
      '罗湖仓': 200,
      '龙岗仓': 400,
    },
  },
  {
    id: 8,
    name: '镀锌方管 40×40',
    spec: '6m/根',
    price: '185',
    image: 'https://picsum.photos/200/195?random=208',
    category: 'steel',
    subCategory: 'section',
    tags: ['new'],
    stock: {
      '工程仓库': 80,
      '福田仓': 60,
      '罗湖仓': 40,
      '龙岗仓': 100,
    },
  },
])

const filteredProducts = computed(() => {
  let result = [...products.value]
  
  if (activeCategory.value !== 'all' && activeCategory.value !== 'bom') {
    result = result.filter(item => item.category === activeCategory.value)
  }
  
  if (activeSubCategory.value !== 'all') {
    if (activeCategory.value === 'all') {
      result = result.filter(item => item.tags.includes(activeSubCategory.value))
    } else {
      result = result.filter(item => item.subCategory === activeSubCategory.value)
    }
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => item.name.toLowerCase().includes(keyword))
  }
  
  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => Number(a.price.replace(',', '')) - Number(b.price.replace(',', '')))
  } else if (sortBy.value === 'price-desc') {
    result.sort((a, b) => Number(b.price.replace(',', '')) - Number(a.price.replace(',', '')))
  }
  
  return result
})

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

function getStock(item: any) {
  return item.stock[selectedWarehouse.value] || 0
}

function getOtherWarehousesWithStock(item: any) {
  const warehousesWithStock: string[] = []
  Object.entries(item.stock).forEach(([warehouse, qty]) => {
    if (warehouse !== selectedWarehouse.value && qty > 0) {
      warehousesWithStock.push(warehouse)
    }
  })
  return warehousesWithStock
}

function handleWarehouseConfirm() {
  selectedWarehouse.value = tempWarehouse.value
  showWarehousePicker.value = false
}

function handleCategoryClick(key: string) {
  activeCategory.value = key
  activeSubCategory.value = 'all'
}

function handleBomClick(bom: any) {
  emit('navigate', 'bom-detail', { bomId: bom.id })
}

function handleProductClick(item: any) {
  emit('navigate', 'product-detail', { productId: item.id })
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
  background: #fff;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  
  .warehouse-select {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: #f0f5ff;
    border-radius: 20px;
    font-size: 13px;
    color: #165dff;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
      background: #e6f0ff;
    }
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    background: #f2f3f5;
    border-radius: 20px;
    padding: 0 16px;
    height: 36px;
    flex: 1;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:focus-within, &.focused {
      background: #fff;
      border-color: #165dff;
      box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
    }
    
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
    
    .clear-icon {
      color: #86909c;
      font-size: 14px;
      cursor: pointer;
      transition: color 0.2s;
      
      &:hover {
        color: #4e5969;
      }
    }
  }
}

.category-tabs {
  display: flex;
  padding: 10px 16px;
  gap: 10px;
  overflow-x: auto;
  border-top: 1px solid #f2f3f5;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 10px;
    font-size: 12px;
    color: #646a73;
    flex-shrink: 0;
    transition: all 0.25s ease;
    min-width: 64px;
    
    .tab-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 22px;
        height: 22px;
        transition: color 0.25s ease;
      }
    }
    
    .tab-text {
      white-space: nowrap;
    }
    
    &.active {
      background: linear-gradient(135deg, #165dff 0%, #0942d4 100%);
      color: #fff;
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.35);
      transform: translateY(-2px);
      
      .tab-icon svg {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }
    }
    
    &:active:not(.active) {
      transform: scale(0.96);
      background: #e9ecef;
    }
  }
}

.filter-bar {
  display: flex;
  padding: 8px 16px;
  background: #fafafa;
  border-top: 1px solid #f2f3f5;
  
  .filter-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: #fff;
    border-radius: 16px;
    font-size: 13px;
    color: #646a73;
    border: 1px solid #e5e6eb;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
      background: #f5f5f5;
    }
    
    .filter-arrow {
      font-size: 12px;
      color: #86909c;
      transition: transform 0.2s ease;
    }
  }
}

.sub-category-bar {
  display: flex;
  padding: 8px 16px;
  gap: 8px;
  overflow-x: auto;
  background: #fafafa;
  border-top: 1px solid #f2f3f5;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .sub-tab-item {
    padding: 6px 14px;
    background: #fff;
    border-radius: 16px;
    font-size: 13px;
    color: #646a73;
    flex-shrink: 0;
    transition: all 0.2s ease;
    border: 1px solid #e5e6eb;
    
    &.active {
      background: #165dff;
      color: #fff;
      border-color: #165dff;
    }
    
    &:active {
      transform: scale(0.96);
    }
  }
}

.main-content {
  padding-top: 150px;
  padding-left: 12px;
  padding-right: 12px;
  transition: padding-top 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }
  
  .section-more {
    font-size: 13px;
    color: #165dff;
    transition: color 0.2s;
    
    &:active {
      color: #0942d4;
    }
  }
}

.bom-grid {
  display: flex;
  gap: 14px;
  
  .bom-card {
    flex: 1;
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .bom-image-wrap {
      position: relative;
      overflow: hidden;
      
      .bom-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      &:hover .bom-image {
        transform: scale(1.05);
      }
      
      .bom-tag {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        
        &.热销 {
          background: linear-gradient(135deg, #ff6b6b, #f53f3f);
          color: #fff;
        }
        
        &.推荐 {
          background: linear-gradient(135deg, #165dff, #0942d4);
          color: #fff;
        }
      }
    }
    
    .bom-info {
      padding: 14px;
      
      .bom-name {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
        margin-bottom: 6px;
        line-height: 1.4;
      }
      
      .bom-item-count {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 10px;
      }
      
      .bom-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .bom-price {
          font-size: 17px;
          font-weight: 600;
          color: #f53f3f;
        }
        
        .bom-arrow {
          color: #c9cdd4;
          transition: color 0.2s;
          
          &:active {
            color: #165dff;
          }
        }
      }
    }
  }
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  
  .product-count {
    font-size: 13px;
    color: #86909c;
  }
  
  .sort-options {
    display: flex;
    gap: 20px;
    
    .sort-item {
      font-size: 13px;
      color: #86909c;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      
      &.active {
        color: #165dff;
        font-weight: 500;
        border-color: #165dff;
      }
      
      &:active {
        opacity: 0.7;
      }
    }
  }
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  .product-card {
    width: calc(50% - 6px);
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.25s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
    
    .product-image-wrap {
      position: relative;
      overflow: hidden;
      
      .product-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      &:hover .product-image {
        transform: scale(1.05);
      }
      
      .stock-tag {
        position: absolute;
        top: 8px;
        left: 8px;
        padding: 3px 10px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        
        &.out {
          background: #f53f3f;
        }
      }
    }
    
    .product-info {
      padding: 12px;
      
      .product-name {
        font-size: 14px;
        color: #1d2129;
        margin-bottom: 5px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.45;
      }
      
      .product-spec {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 6px;
      }
      
      .stock-hint {
        font-size: 11px;
        color: #00b42a;
        display: flex;
        align-items: center;
        gap: 3px;
        margin-bottom: 8px;
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
          gap: 10px;
          padding: 3px;
          background: #f5f5f5;
          border-radius: 18px;
          transition: all 0.2s ease;
          
          &.disabled {
            opacity: 0.5;
          }
          
          .btn-minus, .btn-plus {
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            border-radius: 50%;
            color: #1d2129;
            font-size: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
            
            &:active {
              transform: scale(0.9);
              background: #f0f0f0;
            }
            
            &.disabled {
              color: #c9cdd4;
            }
          }
          
          .quantity-value {
            font-size: 15px;
            font-weight: 600;
            min-width: 28px;
            text-align: center;
            color: #1d2129;
          }
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-icon {
    font-size: 56px;
    color: #d0d3d8;
    margin-bottom: 16px;
  }
  
  .empty-text {
    font-size: 15px;
    color: #86909c;
  }
}

.cart-bar {
  position: fixed;
  bottom: 52px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  z-index: 99;
  transition: transform 0.3s ease;
  
  .cart-icon {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f53f3f, #e53935);
    border-radius: 50%;
    color: #fff;
    font-size: 22px;
    box-shadow: 0 4px 12px rgba(245, 63, 63, 0.35);
    transition: transform 0.2s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    .cart-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      min-width: 20px;
      height: 20px;
      background: #ff7875;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      box-shadow: 0 2px 4px rgba(255, 120, 117, 0.4);
    }
  }
  
  .cart-info {
    flex: 1;
    margin-left: 14px;
    
    .cart-total {
      font-size: 19px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .cart-desc {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .cart-btn {
    padding: 14px 32px;
    background: linear-gradient(135deg, #165dff, #0942d4);
    color: #fff;
    border-radius: 24px;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.35);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 6px 0 12px;
  border-top: 1px solid #f2f3f5;
  z-index: 100;
  
  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    color: #86909c;
    font-size: 11px;
    padding-top: 4px;
    transition: all 0.2s ease;
    
    svg {
      width: 22px;
      height: 22px;
    }
    
    &.active {
      color: #165dff;
      
      svg {
        transform: scale(1.1);
      }
    }
  }
}

.picker-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
  }
  
  .picker-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 20px 20px 0 0;
    animation: slideUp 0.3s ease;
    
    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f2f3f5;
      
      .picker-cancel, .picker-confirm {
        font-size: 15px;
      }
      
      .picker-cancel {
        color: #86909c;
      }
      
      .picker-confirm {
        color: #165dff;
        font-weight: 500;
      }
      
      .picker-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .picker-body {
      padding: 10px 0;
      max-height: 320px;
      overflow-y: auto;
      
      .picker-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        transition: background 0.2s;
        
        &.active {
          background: #f0f5ff;
        }
        
        .check-icon {
          color: #165dff;
          font-size: 18px;
        }
        
        .warehouse-info {
          .warehouse-name {
            font-size: 15px;
            color: #1d2129;
            margin-bottom: 3px;
          }
          
          .warehouse-location {
            font-size: 13px;
            color: #86909c;
          }
        }
        
        .warehouse-status {
          padding: 5px 14px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 500;
          
          &.normal {
            background: #e8ffea;
            color: #00b42a;
          }
          
          &.tight {
            background: #fff7e8;
            color: #ff7d00;
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>