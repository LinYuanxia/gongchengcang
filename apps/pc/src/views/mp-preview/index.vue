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
        <template v-if="currentRole === 'warehouse'">
          <div class="section-title" style="margin-top: 12px;">库存管理</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'stock-overview' }"
            @click="currentPage = 'stock-overview'"
          >
            <icon-storage />
            <span>库存总览</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'stock-warning' }"
            @click="currentPage = 'stock-warning'"
          >
            <icon-exclamation-polygon-fill />
            <span>库存预警</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'stock-in' }"
            @click="currentPage = 'stock-in'"
          >
            <icon-download />
            <span>入库记录</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'stock-out' }"
            @click="currentPage = 'stock-out'"
          >
            <icon-upload />
            <span>出库记录</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'stock-check' }"
            @click="currentPage = 'stock-check'"
          >
            <icon-check-square />
            <span>库存盘点</span>
          </div>
          <div class="section-title" style="margin-top: 12px;">财务发票</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'fund-management' }"
            @click="currentPage = 'fund-management'"
          >
            <icon-credit-card />
            <span>资金管理</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'invoice-sale' }"
            @click="currentPage = 'invoice-sale'"
          >
            <icon-file />
            <span>销项发票</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'invoice-purchase' }"
            @click="currentPage = 'invoice-purchase'"
          >
            <icon-file-add />
            <span>进项发票</span>
          </div>
          <div class="section-title" style="margin-top: 12px;">其他功能</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'product-manage' }"
            @click="currentPage = 'product-manage'"
          >
            <icon-apps />
            <span>商品管理</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'message-center' }"
            @click="currentPage = 'message-center'"
          >
            <icon-notification />
            <span>消息中心</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'settings' }"
            @click="currentPage = 'settings'"
          >
            <icon-settings />
            <span>设置</span>
          </div>
        </template>
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
          <div class="section-title" style="margin-top: 12px;">项目管理</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'project-list' }"
            @click="currentPage = 'project-list'"
          >
            <icon-folder />
            <span>项目列表</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'project-detail' }"
            @click="currentPage = 'project-detail'"
          >
            <icon-file-text />
            <span>项目详情</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'project-create' }"
            @click="currentPage = 'project-create'"
          >
            <icon-plus />
            <span>新建项目</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'site-stock' }"
            @click="currentPage = 'site-stock'"
          >
            <icon-storage />
            <span>现场库存</span>
          </div>
          <div class="section-title" style="margin-top: 12px;">采购市场</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'warehouse-list' }"
            @click="currentPage = 'warehouse-list'"
          >
            <icon-apps />
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
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'bom-detail' }"
            @click="currentPage = 'bom-detail'"
          >
            <icon-file />
            <span>BOM详情</span>
          </div>
          <div class="section-title" style="margin-top: 12px;">常用功能</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'address-manage' }"
            @click="currentPage = 'address-manage'"
          >
            <icon-location />
            <span>收货地址</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'invoice-title' }"
            @click="currentPage = 'invoice-title'"
          >
            <icon-bookmark />
            <span>发票抬头</span>
          </div>
          <div class="section-title" style="margin-top: 12px;">资金管理</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'fund-management' }"
            @click="currentPage = 'fund-management'"
          >
            <icon-wallet />
            <span>账户余额</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'transaction' }"
            @click="currentPage = 'transaction'"
          >
            <icon-file-text />
            <span>交易明细</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'invoice-manage' }"
            @click="currentPage = 'invoice-manage'"
          >
            <icon-file />
            <span>发票管理</span>
          </div>
          <div class="section-title" style="margin-top: 12px;">其他</div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'message-center' }"
            @click="currentPage = 'message-center'"
          >
            <icon-message />
            <span>消息中心</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'settings' }"
            @click="currentPage = 'settings'"
          >
            <icon-settings />
            <span>设置</span>
          </div>
          <div 
            class="page-item" 
            :class="{ active: currentPage === 'about' }"
            @click="currentPage = 'about'"
          >
            <icon-info-circle />
            <span>关于我们</span>
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
            <p>1. 管理装修项目进度</p>
            <p>2. 选择BOM包快速采购</p>
            <p>3. 管理现场库存材料</p>
            <p>4. 向工程仓采购商品</p>
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
import MpConstructionIndex from './pages/construction/index.vue'
import MpConstructionOrder from './pages/construction/order.vue'
import MpConstructionMine from './pages/construction/mine.vue'
import MpConstructionProjectList from './pages/construction/project-list.vue'
import MpConstructionProjectDetail from './pages/construction/project-detail.vue'
import MpConstructionProjectCreate from './pages/construction/project-create.vue'
import MpConstructionSiteStock from './pages/construction/site-stock.vue'
import MpConstructionAddressManage from './pages/construction/address-manage.vue'
import MpConstructionInvoiceTitle from './pages/construction/invoice-title.vue'
import MpConstructionFundManagement from './pages/construction/fund-management.vue'
import MpConstructionTransaction from './pages/construction/transaction.vue'
import MpConstructionInvoiceManage from './pages/construction/invoice-manage.vue'
import MpConstructionMessageCenter from './pages/construction/message-center.vue'
import MpConstructionSettings from './pages/construction/settings.vue'
import MpConstructionAbout from './pages/construction/about.vue'

import MpSupplierMarket from './pages/supplier/market.vue'
import MpSupplierSupplyManage from './pages/supplier/supply-manage.vue'

import MpStockOverview from './pages/warehouse/stock-overview.vue'
import MpStockWarning from './pages/warehouse/stock-warning.vue'
import MpStockIn from './pages/warehouse/stock-in.vue'
import MpStockOut from './pages/warehouse/stock-out.vue'
import MpStockCheck from './pages/warehouse/stock-check.vue'
import MpFundManagement from './pages/warehouse/fund-management.vue'
import MpInvoiceSale from './pages/warehouse/invoice-sale.vue'
import MpInvoicePurchase from './pages/warehouse/invoice-purchase.vue'
import MpProductManage from './pages/warehouse/product-manage.vue'
import MpMessageCenter from './pages/warehouse/message-center.vue'
import MpSettings from './pages/warehouse/settings.vue'

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
      'stock-overview': { title: '库存总览', path: '/pages/mine/stock-overview' },
      'stock-warning': { title: '库存预警', path: '/pages/mine/stock-warning' },
      'stock-in': { title: '入库记录', path: '/pages/mine/stock-in' },
      'stock-out': { title: '出库记录', path: '/pages/mine/stock-out' },
      'stock-check': { title: '库存盘点', path: '/pages/mine/stock-check' },
      'fund-management': { title: '资金管理', path: '/pages/mine/fund-management' },
      'invoice-sale': { title: '销项发票', path: '/pages/mine/invoice-sale' },
      'invoice-purchase': { title: '进项发票', path: '/pages/mine/invoice-purchase' },
      'product-manage': { title: '商品管理', path: '/pages/mine/product-manage' },
      'message-center': { title: '消息中心', path: '/pages/mine/message-center' },
      'settings': { title: '设置', path: '/pages/mine/settings' },
    },
    'construction': {
      'index': { title: '工作台', path: '/pages/construction/index' },
      'market': { title: '工程仓市场', path: '/pages/construction/market' },
      'cart': { title: '购物车', path: '/pages/cart/index' },
      'order': { title: '订单管理', path: '/pages/construction/order' },
      'mine': { title: '我的', path: '/pages/construction/mine' },
      'product-detail': { title: '商品详情', path: '/pages/construction/product-detail', params: 'id=xxx' },
      'order-create': { title: '确认订单', path: '/pages/order/create' },
      'project-list': { title: '项目列表', path: '/pages/construction/project-list' },
      'project-detail': { title: '项目详情', path: '/pages/construction/project-detail', params: 'id=xxx' },
      'project-create': { title: '新建项目', path: '/pages/construction/project-create' },
      'site-stock': { title: '现场库存', path: '/pages/construction/site-stock', params: 'projectId=xxx' },
      'warehouse-list': { title: '工程仓列表', path: '/pages/construction/warehouse-list' },
      'bom-market': { title: 'BOM市场', path: '/pages/construction/bom-market' },
      'bom-detail': { title: 'BOM详情', path: '/pages/construction/bom-detail', params: 'id=xxx' },
      'bom-order': { title: 'BOM订单确认', path: '/pages/construction/bom-order' },
      'address-manage': { title: '收货地址', path: '/pages/construction/address-manage' },
      'invoice-title': { title: '发票抬头', path: '/pages/construction/invoice-title' },
      'fund-management': { title: '账户余额', path: '/pages/construction/fund-management' },
      'transaction': { title: '交易明细', path: '/pages/construction/transaction' },
      'invoice-manage': { title: '发票管理', path: '/pages/construction/invoice-manage' },
      'message-center': { title: '消息中心', path: '/pages/construction/message-center' },
      'settings': { title: '设置', path: '/pages/construction/settings' },
      'about': { title: '关于我们', path: '/pages/construction/about' },
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
      'stock-overview': MpStockOverview,
      'stock-warning': MpStockWarning,
      'stock-in': MpStockIn,
      'stock-out': MpStockOut,
      'stock-check': MpStockCheck,
      'fund-management': MpFundManagement,
      'invoice-sale': MpInvoiceSale,
      'invoice-purchase': MpInvoicePurchase,
      'product-manage': MpProductManage,
      'message-center': MpMessageCenter,
      'settings': MpSettings,
    }
    return components[currentPage.value] || MpIndex
  }
  
  if (currentRole.value === 'construction') {
    const components: Record<string, any> = {
      'index': MpConstructionIndex,
      'market': MpConstructionMarket,
      'cart': MpCart,
      'order': MpConstructionOrder,
      'mine': MpConstructionMine,
      'product-detail': MpProductDetail,
      'order-create': MpOrderCreate,
      'project-list': MpConstructionProjectList,
      'project-detail': MpConstructionProjectDetail,
      'project-create': MpConstructionProjectCreate,
      'site-stock': MpConstructionSiteStock,
      'warehouse-list': MpConstructionWarehouseList,
      'bom-market': MpConstructionBomMarket,
      'bom-detail': MpConstructionBomDetail,
      'bom-order': MpConstructionBomOrder,
      'address-manage': MpConstructionAddressManage,
      'invoice-title': MpConstructionInvoiceTitle,
      'fund-management': MpConstructionFundManagement,
      'transaction': MpConstructionTransaction,
      'invoice-manage': MpConstructionInvoiceManage,
      'message-center': MpConstructionMessageCenter,
      'settings': MpConstructionSettings,
      'about': MpConstructionAbout,
    }
    return components[currentPage.value] || MpConstructionIndex
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
