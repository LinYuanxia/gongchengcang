<template>
  <div class="mp-page">
    <div class="user-card">
      <div class="user-info">
        <img src="https://picsum.photos/100/100?random=avatar" class="avatar" />
        <div class="info">
          <span class="name">{{ userInfo.name }}</span>
          <span class="company">{{ userInfo.company }}</span>
          <div class="cert-status">
            <icon-check-circle-fill class="cert-icon" />
            <span class="cert-text">已认证</span>
          </div>
        </div>
        <div class="edit-btn">
          <span>编辑</span>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item" @click="$emit('navigate', 'order')">
          <span class="stat-value">{{ stats.toShip }}</span>
          <span class="stat-label">待发货</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.toReceive }}</span>
          <span class="stat-label">待入库</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.toInvoice }}</span>
          <span class="stat-label">待开票</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.message }}</span>
          <span class="stat-label">消息</span>
        </div>
      </div>
    </div>

    <div class="custody-card">
      <div class="custody-header">
        <span class="custody-title">资金托管账户</span>
        <span class="custody-link">查看明细 ></span>
      </div>
      <div class="custody-body">
        <div class="custody-main">
          <span class="custody-label">账户余额</span>
          <span class="custody-balance">¥{{ custodyBalance }}</span>
          <span class="custody-frozen">冻结金额: ¥{{ frozenAmount }}</span>
        </div>
        <div class="custody-actions">
          <div class="action-item">
            <icon-plus class="action-icon" />
            <span class="action-text">充值</span>
          </div>
          <div class="action-item">
            <icon-export class="action-icon" />
            <span class="action-text">提现</span>
          </div>
          <div class="action-item">
            <icon-file class="action-icon" />
            <span class="action-text">明细</span>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-section">
      <div class="quick-title">常用功能</div>
      <div class="quick-grid">
        <div class="quick-item">
          <icon-send class="quick-icon" style="color: #165dff" />
          <span class="quick-text">扫码发货</span>
        </div>
        <div class="quick-item">
          <icon-download class="quick-icon" style="color: #00b42a" />
          <span class="quick-text">扫码入库</span>
        </div>
        <div class="quick-item">
          <icon-exclamation-polygon-fill class="quick-icon" style="color: #ff7d00" />
          <span class="quick-text">库存预警</span>
          <div class="quick-badge" v-if="stats.stockWarning > 0">{{ stats.stockWarning }}</div>
        </div>
        <div class="quick-item">
          <icon-apps class="quick-icon" style="color: #722ed1" />
          <span class="quick-text">商品管理</span>
        </div>
        <div class="quick-item">
          <icon-file-text class="quick-icon" style="color: #f53f3f" />
          <span class="quick-text">开票管理</span>
          <div class="quick-badge" v-if="stats.toInvoice > 0">{{ stats.toInvoice }}</div>
        </div>
        <div class="quick-item">
          <icon-user-group class="quick-icon" style="color: #165dff" />
          <span class="quick-text">子账号</span>
        </div>
        <div class="quick-item">
          <icon-credit-card class="quick-icon" style="color: #00b42a" />
          <span class="quick-text">银行卡</span>
        </div>
        <div class="quick-item">
          <icon-settings class="quick-icon" style="color: #86909c" />
          <span class="quick-text">设置</span>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div class="section-header">
        <span class="section-title">业务管理</span>
      </div>
      <div class="menu-group">
        <div class="menu-item" v-for="item in businessMenus" :key="item.id">
          <div class="menu-left">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.name }}</span>
            <span class="menu-desc" v-if="item.desc">{{ item.desc }}</span>
          </div>
          <div class="menu-right">
            <span class="menu-badge" v-if="item.badge">{{ item.badge }}</span>
            <icon-right class="menu-arrow" />
          </div>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div class="section-header">
        <span class="section-title">财务发票</span>
      </div>
      <div class="menu-group">
        <div class="menu-item" v-for="item in financeMenus" :key="item.id">
          <div class="menu-left">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.name }}</span>
          </div>
          <div class="menu-right">
            <span class="menu-badge" v-if="item.badge">{{ item.badge }}</span>
            <icon-right class="menu-arrow" />
          </div>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div class="section-header">
        <span class="section-title">系统设置</span>
      </div>
      <div class="menu-group">
        <div class="menu-item" v-for="item in settingMenus" :key="item.id">
          <div class="menu-left">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.name }}</span>
          </div>
          <div class="menu-right">
            <span class="menu-badge" v-if="item.badge">{{ item.badge }}</span>
            <icon-right class="menu-arrow" />
          </div>
        </div>
      </div>
    </div>

    <div class="logout-btn" @click="$emit('logout')">退出登录</div>
    
    <div class="version-info">
      <span>工程仓端 v1.0.0</span>
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
      <div class="tabbar-item active">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'

defineEmits(['navigate', 'logout'])

const currentRoleRef = inject<any>('currentRole')
const currentRole = computed(() => currentRoleRef?.value || 'warehouse')

const userInfo = ref({
  name: '张三',
  company: '深圳湾科技园项目仓'
})

const stats = ref({
  toShip: 12,
  toReceive: 5,
  toInvoice: 8,
  message: 3,
  stockWarning: 5,
})

const custodyBalance = ref('158,520.00')
const frozenAmount = ref('12,000.00')

const businessMenus = computed(() => {
  const menus: Record<string, any[]> = {
    'warehouse': [
      { id: 1, name: '主体信息', icon: '🏢', desc: '企业信息、资质' },
      { id: 2, name: '商品管理', icon: '📦', badge: '156' },
      { id: 3, name: '库存管理', icon: '📊', badge: '5' },
      { id: 4, name: '子账号管理', icon: '👥' },
    ],
    'construction': [
      { id: 1, name: '主体信息', icon: '🏢', desc: '企业信息、资质' },
      { id: 2, name: '收货地址', icon: '📍' },
      { id: 3, name: '我的收藏', icon: '❤️' },
    ],
    'supplier': [
      { id: 1, name: '主体信息', icon: '🏢', desc: '企业信息、资质' },
      { id: 2, name: '商品管理', icon: '📦', badge: '89' },
      { id: 3, name: '供货管理', icon: '📋' },
    ],
  }
  return menus[currentRole.value] || menus['warehouse']
})

const financeMenus = computed(() => {
  const menus: Record<string, any[]> = {
    'warehouse': [
      { id: 1, name: '销项发票', icon: '📄', badge: '8' },
      { id: 2, name: '进项发票', icon: '📥' },
      { id: 3, name: '开票记录', icon: '📋' },
      { id: 4, name: '银行卡管理', icon: '💳' },
    ],
    'construction': [
      { id: 1, name: '进项发票', icon: '📥' },
      { id: 2, name: '开票记录', icon: '📋' },
    ],
    'supplier': [
      { id: 1, name: '销项发票', icon: '📄', badge: '12' },
      { id: 2, name: '开票记录', icon: '📋' },
      { id: 3, name: '银行卡管理', icon: '💳' },
    ],
  }
  return menus[currentRole.value] || menus['warehouse']
})

const settingMenus = ref([
  { id: 1, name: '消息中心', icon: '🔔', badge: '3' },
  { id: 2, name: '设置', icon: '⚙️' },
  { id: 3, name: '帮助中心', icon: '❓' },
  { id: 4, name: '关于我们', icon: 'ℹ️' },
])
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 60px;
  position: relative;
}

.user-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 24px 16px 16px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.info {
  flex: 1;
  margin-left: 12px;
}

.name {
  font-size: 18px;
  font-weight: 600;
  display: block;
}

.company {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
  display: block;
}

.cert-status {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 4px;
}

.cert-icon {
  font-size: 10px;
  margin-right: 2px;
}

.cert-text {
  font-size: 10px;
}

.edit-btn {
  padding: 4px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 12px;
}

.user-stats {
  display: flex;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
}

.stat-label {
  display: block;
  font-size: 11px;
  opacity: 0.9;
  margin-top: 4px;
}

.custody-card {
  margin: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.custody-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: #f7f8fa;
}

.custody-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.custody-link {
  font-size: 12px;
  color: #165dff;
}

.custody-body {
  padding: 12px;
}

.custody-main {
  margin-bottom: 12px;
}

.custody-label {
  font-size: 12px;
  color: #86909c;
  display: block;
}

.custody-balance {
  font-size: 24px;
  color: #1d2129;
  font-weight: 600;
  display: block;
  margin: 4px 0;
}

.custody-frozen {
  font-size: 11px;
  color: #86909c;
}

.custody-actions {
  display: flex;
  gap: 12px;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  background-color: #f7f8fa;
  border-radius: 4px;
}

.action-icon {
  font-size: 16px;
  margin-bottom: 4px;
  color: #165dff;
}

.action-text {
  font-size: 12px;
  color: #1d2129;
}

.quick-section {
  margin: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
}

.quick-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 12px;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
}

.quick-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.quick-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.quick-text {
  font-size: 12px;
  color: #1d2129;
}

.quick-badge {
  position: absolute;
  top: -2px;
  right: 10px;
  min-width: 16px;
  height: 16px;
  background-color: #f53f3f;
  border-radius: 8px;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.menu-section {
  margin: 12px 16px;
}

.section-header {
  margin-bottom: 8px;
}

.section-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.menu-group {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  border-bottom: 1px solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 18px;
  margin-right: 8px;
}

.menu-text {
  font-size: 14px;
  color: #1d2129;
}

.menu-desc {
  font-size: 11px;
  color: #86909c;
  margin-left: 6px;
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-badge {
  background-color: #f53f3f;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 6px;
}

.menu-arrow {
  font-size: 14px;
  color: #c9cdd4;
}

.logout-btn {
  margin: 24px 16px 12px;
  text-align: center;
  padding: 14px 0;
  background-color: #fff;
  border-radius: 8px;
  font-size: 15px;
  color: #f53f3f;
}

.version-info {
  text-align: center;
  padding: 12px 0;
  font-size: 11px;
  color: #c9cdd4;
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
