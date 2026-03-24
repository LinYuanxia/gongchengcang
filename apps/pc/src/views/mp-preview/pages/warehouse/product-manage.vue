<template>
  <div class="mp-page product-manage">
    <div class="page-header">
      <div class="header-title">商品管理</div>
      <div class="header-action" @click="handleAdd">
        <icon-plus />
        <span>添加</span>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索商品名称/编码" v-model="searchText" />
      </div>
    </div>
    
    <div class="status-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'all' }"
        @click="activeStatus = 'all'"
      >
        全部
        <span class="count">{{ totalCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'on' }"
        @click="activeStatus = 'on'"
      >
        已上架
        <span class="count">{{ onCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'off' }"
        @click="activeStatus = 'off'"
      >
        已下架
        <span class="count">{{ offCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'warning' }"
        @click="activeStatus = 'warning'"
      >
        库存预警
        <span class="count">{{ warningCount }}</span>
      </div>
    </div>
    
    <div class="product-list">
      <div class="product-item" v-for="item in filteredProducts" :key="item.id">
        <div class="product-image">
          <img :src="item.image" :alt="item.name" />
          <div class="product-status" :class="item.status">
            {{ item.status === 'on' ? '已上架' : '已下架' }}
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-spec">{{ item.spec }}</div>
          <div class="product-price">
            <span class="price">¥{{ item.price }}</span>
            <span class="unit">/{{ item.unit }}</span>
          </div>
          <div class="product-stock" :class="{ warning: item.stock < item.warningThreshold }">
            库存: {{ item.stock }} {{ item.unit }}
          </div>
        </div>
        <div class="product-actions">
          <div class="action-btn" v-if="item.status === 'on'" @click="handleOff(item)">下架</div>
          <div class="action-btn primary" v-else @click="handleOn(item)">上架</div>
          <div class="action-btn" @click="handleEdit(item)">编辑</div>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>采购市场</span>
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

defineEmits(['navigate'])

const searchText = ref('')
const activeStatus = ref('all')

const products = ref([
  {
    id: 1,
    name: '水泥 P.O 42.5',
    spec: '50kg/袋',
    image: 'https://picsum.photos/200/200?random=1',
    price: 450,
    unit: '吨',
    stock: 120,
    warningThreshold: 50,
    status: 'on'
  },
  {
    id: 2,
    name: '螺纹钢 HRB400',
    spec: 'Φ12mm',
    image: 'https://picsum.photos/200/200?random=2',
    price: 4200,
    unit: '吨',
    stock: 45,
    warningThreshold: 50,
    status: 'on'
  },
  {
    id: 3,
    name: '黄沙',
    spec: '中粗砂',
    image: 'https://picsum.photos/200/200?random=3',
    price: 95,
    unit: '方',
    stock: 280,
    warningThreshold: 100,
    status: 'on'
  },
  {
    id: 4,
    name: '商品混凝土 C30',
    spec: '预拌',
    image: 'https://picsum.photos/200/200?random=4',
    price: 420,
    unit: '方',
    stock: 30,
    warningThreshold: 50,
    status: 'on'
  },
  {
    id: 5,
    name: '防水涂料',
    spec: 'JS型 20kg/桶',
    image: 'https://picsum.photos/200/200?random=5',
    price: 168,
    unit: '桶',
    stock: 15,
    warningThreshold: 20,
    status: 'off'
  }
])

const totalCount = computed(() => products.value.length)
const onCount = computed(() => products.value.filter(p => p.status === 'on').length)
const offCount = computed(() => products.value.filter(p => p.status === 'off').length)
const warningCount = computed(() => products.value.filter(p => p.stock < p.warningThreshold).length)

const filteredProducts = computed(() => {
  let result = products.value
  
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(kw))
  }
  
  if (activeStatus.value === 'on') {
    result = result.filter(p => p.status === 'on')
  } else if (activeStatus.value === 'off') {
    result = result.filter(p => p.status === 'off')
  } else if (activeStatus.value === 'warning') {
    result = result.filter(p => p.stock < p.warningThreshold)
  }
  
  return result
})

function handleAdd() {
  console.log('添加商品')
}

function handleOn(item: any) {
  console.log('上架:', item.name)
}

function handleOff(item: any) {
  console.log('下架:', item.name)
}

function handleEdit(item: any) {
  console.log('编辑:', item.name)
}
</script>

<style lang="scss" scoped>
.product-manage {
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
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
  
  .header-action {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #165dff;
  }
}

.search-bar {
  padding: 54px 12px 12px;
}

.search-input {
  display: flex;
  align-items: center;
  background: #fff;
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

.status-tabs {
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
    
    .count {
      margin-left: 4px;
      font-size: 12px;
      color: #86909c;
    }
  }
}

.product-list {
  padding: 12px;
}

.product-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
}

.product-image {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-status {
    position: absolute;
    top: 4px;
    left: 4px;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    
    &.on {
      background: #e8ffea;
      color: #00b42a;
    }
    
    &.off {
      background: #f2f3f5;
      color: #86909c;
    }
  }
}

.product-info {
  flex: 1;
  
  .product-name {
    font-size: 15px;
    color: #1d2129;
    font-weight: 500;
  }
  
  .product-spec {
    font-size: 12px;
    color: #86909c;
    margin-top: 2px;
  }
  
  .product-price {
    margin-top: 6px;
    
    .price {
      font-size: 16px;
      color: #f53f3f;
      font-weight: 600;
    }
    
    .unit {
      font-size: 12px;
      color: #86909c;
    }
  }
  
  .product-stock {
    font-size: 12px;
    color: #1d2129;
    margin-top: 4px;
    
    &.warning {
      color: #ff7d00;
    }
  }
}

.product-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  
  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    background: #f2f3f5;
    color: #1d2129;
    text-align: center;
    
    &.primary {
      background: #165dff;
      color: #fff;
    }
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
