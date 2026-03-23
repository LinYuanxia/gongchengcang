<template>
  <div class="mp-preview-page">
    <div class="preview-sidebar">
      <div class="sidebar-header">
        <h3>小程序预览</h3>
      </div>
      
      <div class="role-switch">
        <div class="role-label">切换角色</div>
        <a-radio-group v-model="currentRole" type="button" size="small">
          <a-radio value="warehouse">
            <icon-storage /> 工程仓
          </a-radio>
          <a-radio value="construction">
            <icon-tool /> 施工方
          </a-radio>
          <a-radio value="supplier">
            <icon-shop /> 供应商
          </a-radio>
        </a-radio-group>
      </div>
      
      <div class="page-list" v-if="isLoggedIn">
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'index' }"
          @click="currentPage = 'index'"
        >
          <icon-home />
          <span>首页</span>
        </div>
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'market' }"
          @click="currentPage = 'market'"
        >
          <icon-apps />
          <span>{{ marketPageTitle }}</span>
        </div>
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'cart' }"
          @click="currentPage = 'cart'"
        >
          <icon-shopping-cart />
          <span>购物车</span>
        </div>
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'order' }"
          @click="currentPage = 'order'"
        >
          <icon-file />
          <span>我的订单</span>
        </div>
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'mine' }"
          @click="currentPage = 'mine'"
        >
          <icon-user />
          <span>我的</span>
        </div>
      </div>
      
      <div class="sidebar-section" v-if="isLoggedIn">
        <div class="section-title">功能页面</div>
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'product-detail' }"
          @click="currentPage = 'product-detail'"
        >
          <icon-file-text />
          <span>商品详情</span>
        </div>
        <div 
          class="page-item" 
          :class="{ active: currentPage === 'order-create' }"
          @click="currentPage = 'order-create'"
        >
          <icon-edit />
          <span>确认订单</span>
        </div>
        <template v-if="currentRole === 'supplier'">
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'supply-manage' }"
            @click="currentPage = 'supply-manage'"
          >
            <icon-list />
            <span>供货管理</span>
          </div>
        </template>
        <template v-if="currentRole === 'construction'">
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'warehouse-list' }"
            @click="currentPage = 'warehouse-list'"
          >
            <icon-storage />
            <span>工程仓列表</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'bom-market' }"
            @click="currentPage = 'bom-market'"
          >
            <icon-folder />
            <span>BOM市场</span>
          </div>
        </template>
      </div>
    </div>
    
    <div class="preview-main">
      <PhoneSimulator>
        <component :is="currentComponent" @navigate="handleNavigate" @login="handleLogin" @logout="handleLogout" />
      </PhoneSimulator>
    </div>
    
    <div class="preview-info">
      <div class="info-header">
        <h3>页面信息</h3>
      </div>
      <div class="info-content">
        <div class="info-item">
          <span class="label">当前角色：</span>
          <span class="value">{{ roleInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前页面：</span>
          <span class="value">{{ pageInfo.title }}</span>
        </div>
        <div class="info-item">
          <span class="label">页面路径：</span>
          <span class="value code">{{ pageInfo.path }}</span>
        </div>
        <div class="info-item">
          <span class="label">页面参数：</span>
          <span class="value code">{{ pageInfo.params || '无' }}</span>
        </div>
      </div>
      
      <div class="info-section">
        <div class="section-title">角色说明</div>
        <div class="tips">
          <template v-if="currentRole === 'warehouse'">
            <p><strong>工程仓</strong></p>
            <p>1. 从平台商品市场采购商品</p>
            <p>2. 管理自己的商品库存</p>
            <p>3. 向施工方销售商品</p>
          </template>
          <template v-else-if="currentRole === 'construction'">
            <p><strong>施工方</strong></p>
            <p>1. 浏览工程仓商品市场</p>
            <p>2. 选择工程仓进行采购</p>
            <p>3. 管理采购订单</p>
          </template>
          <template v-else-if="currentRole === 'supplier'">
            <p><strong>材料供应商</strong></p>
            <p>1. 管理商品供货关系</p>
            <p>2. 接收工程仓采购订单</p>
            <p>3. 处理订单发货</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PhoneSimulator from '@/components/PhoneSimulator.vue'

import MpIndex from './pages/index.vue'
import MpCart from './pages/cart.vue'
import MpOrder from './pages/order.vue'
import MpMine from './pages/mine.vue'
import MpProductDetail from './pages/product-detail.vue'
import MpOrderCreate from './pages/order-create.vue'
import MpLogin from './pages/login.vue'

import MpWarehouseMarket from './pages/warehouse/market.vue'
import MpWarehouseProductDetail from './pages/warehouse/product-detail.vue'
import MpWarehouseOrderCreate from './pages/warehouse/order-create.vue'
import MpWarehouseOrderList from './pages/warehouse/order-list.vue'

import MpConstructionMarket from './pages/construction/market.vue'
import MpConstructionWarehouseList from './pages/construction/warehouse-list.vue'
import MpConstructionBomMarket from './pages/construction/bom-market.vue'
import MpConstructionBomDetail from './pages/construction/bom-detail.vue'
import MpConstructionBomOrder from './pages/construction/bom-order.vue'

import MpSupplierMarket from './pages/supplier/market.vue'
import MpSupplierSupplyManage from './pages/supplier/supply-manage.vue'

const route = useRoute()
const currentRole = ref('warehouse')
const currentPage = ref('login')
const isLoggedIn = ref(false)

provide('currentRole', currentRole)

onMounted(() => {
  const role = route.query.role as string
  if (role && ['warehouse', 'construction', 'supplier'].includes(role)) {
    currentRole.value = role
  }
})

watch(currentRole, () => {
  if (isLoggedIn.value) {
    currentPage.value = 'index'
  }
})

const roleInfo = computed(() => {
  const roles: Record<string, { name: string; desc: string }> = {
    'warehouse': { name: '工程仓', desc: '采购与销售' },
    'construction': { name: '施工方', desc: '采购商品' },
    'supplier': { name: '材料供应商', desc: '供货管理' },
  }
  return roles[currentRole.value] || { name: '未知角色', desc: '' }
})

const marketPageTitle = computed(() => {
  const titles: Record<string, string> = {
    'warehouse': '商品市场',
    'construction': '工程仓市场',
    'supplier': '供货商品',
  }
  return titles[currentRole.value] || '商品市场'
})

const pageInfo = computed(() => {
  if (!isLoggedIn.value) {
    return { title: '登录', path: '/pages/login/index' }
  }
  
  const pages: Record<string, Record<string, { title: string; path: string; params?: string }>> = {
    'warehouse': {
      'index': { title: '首页', path: '/pages/index/index' },
      'market': { title: '商品市场', path: '/pages/market/index' },
      'cart': { title: '购物车', path: '/pages/cart/index' },
      'order': { title: '我的订单', path: '/pages/order/index' },
      'mine': { title: '我的', path: '/pages/mine/index' },
      'product-detail': { title: '商品详情', path: '/pages/product/detail', params: 'id=xxx' },
      'order-create': { title: '确认订单', path: '/pages/order/create' },
    },
    'construction': {
      'index': { title: '首页', path: '/pages/index/index' },
      'market': { title: '工程仓市场', path: '/pages/construction/market' },
      'cart': { title: '购物车', path: '/pages/cart/index' },
      'order': { title: '我的订单', path: '/pages/order/index' },
      'mine': { title: '我的', path: '/pages/mine/index' },
      'product-detail': { title: '商品详情', path: '/pages/construction/product-detail', params: 'id=xxx' },
      'order-create': { title: '确认订单', path: '/pages/order/create' },
      'warehouse-list': { title: '工程仓列表', path: '/pages/construction/warehouse-list' },
      'bom-market': { title: 'BOM市场', path: '/pages/construction/bom-market' },
      'bom-detail': { title: 'BOM详情', path: '/pages/construction/bom-detail', params: 'id=xxx' },
      'bom-order': { title: 'BOM订单确认', path: '/pages/construction/bom-order' },
    },
    'supplier': {
      'index': { title: '首页', path: '/pages/index/index' },
      'market': { title: '供货商品', path: '/pages/supplier/products' },
      'cart': { title: '购物车', path: '/pages/cart/index' },
      'order': { title: '供货订单', path: '/pages/supplier/orders' },
      'mine': { title: '我的', path: '/pages/mine/index' },
      'product-detail': { title: '商品详情', path: '/pages/product/detail', params: 'id=xxx' },
      'order-create': { title: '确认订单', path: '/pages/order/create' },
      'supply-manage': { title: '供货管理', path: '/pages/supplier/supply-manage' },
    },
  }
  return pages[currentRole.value]?.[currentPage.value] || { title: '未知页面', path: '' }
})

const currentComponent = computed(() => {
  if (!isLoggedIn.value) {
    return MpLogin
  }
  
  if (currentRole.value === 'warehouse') {
    const components: Record<string, any> = {
      'index': MpIndex,
      'market': MpWarehouseMarket,
      'cart': MpCart,
      'order': MpWarehouseOrderList,
      'mine': MpMine,
      'product-detail': MpWarehouseProductDetail,
      'order-create': MpWarehouseOrderCreate,
    }
    return components[currentPage.value] || MpIndex
  }
  
  if (currentRole.value === 'construction') {
    const components: Record<string, any> = {
      'index': MpIndex,
      'market': MpConstructionMarket,
      'cart': MpCart,
      'order': MpOrder,
      'mine': MpMine,
      'product-detail': MpProductDetail,
      'order-create': MpOrderCreate,
      'warehouse-list': MpConstructionWarehouseList,
      'bom-market': MpConstructionBomMarket,
      'bom-detail': MpConstructionBomDetail,
      'bom-order': MpConstructionBomOrder,
    }
    return components[currentPage.value] || MpIndex
  }
  
  if (currentRole.value === 'supplier') {
    const components: Record<string, any> = {
      'index': MpIndex,
      'market': MpSupplierMarket,
      'cart': MpCart,
      'order': MpOrder,
      'mine': MpMine,
      'product-detail': MpProductDetail,
      'order-create': MpOrderCreate,
      'supply-manage': MpSupplierSupplyManage,
    }
    return components[currentPage.value] || MpIndex
  }
  
  return MpIndex
})

function handleNavigate(page: string, params?: Record<string, any>) {
  currentPage.value = page
}

function handleLogin(username: string, password: string) {
  isLoggedIn.value = true
  currentPage.value = 'index'
}

function handleLogout() {
  isLoggedIn.value = false
  currentPage.value = 'login'
}
</script>

<style lang="scss" scoped>
.mp-preview-page {
  display: flex;
  height: calc(100vh - 100px);
  background: #f0f2f5;
}

.preview-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
  }
}

.role-switch {
  padding: 12px;
  border-bottom: 1px solid #e5e6eb;
  
  .role-label {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 8px;
  }
  
  :deep(.arco-radio-group-button) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  :deep(.arco-radio-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.page-list {
  padding: 8px;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #4e5969;
  transition: all 0.2s;
  
  &:hover {
    background: #f2f3f5;
    color: #1d2129;
  }
  
  &.active {
    background: #e8f3ff;
    color: #165dff;
  }
}

.sidebar-section {
  padding: 8px;
  border-top: 1px solid #e5e6eb;
}

.section-title {
  padding: 8px 12px;
  font-size: 12px;
  color: #86909c;
}

.preview-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.preview-info {
  width: 280px;
  background: #fff;
  border-left: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.info-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
  }
}

.info-content {
  padding: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  
  .label {
    font-size: 12px;
    color: #86909c;
    width: 70px;
    flex-shrink: 0;
  }
  
  .value {
    font-size: 12px;
    color: #1d2129;
    flex: 1;
    word-break: break-all;
    
    &.code {
      font-family: monospace;
      background: #f7f8fa;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

.info-section {
  padding: 16px;
  border-top: 1px solid #e5e6eb;
}

.tips {
  font-size: 12px;
  color: #86909c;
  line-height: 1.8;
  
  p {
    margin: 0;
  }
  
  strong {
    color: #1d2129;
  }
}
</style>
