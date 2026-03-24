<template>
  <div class="mp-page">
    <div class="header">
      <div class="header-top">
        <div class="user-info">
          <img src="https://picsum.photos/80/80?random=avatar" class="avatar" />
          <div class="info">
            <span class="name">{{ userInfo.name }}</span>
            <span class="company">{{ userInfo.company }}</span>
          </div>
        </div>
        <div class="header-actions">
          <div class="action-item" @click="$emit('navigate', 'mine')">
            <icon-notification class="action-icon" />
            <div class="badge" v-if="unreadCount > 0">{{ unreadCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-card">
      <div class="card-header">
        <span class="card-title">数据看板</span>
        <div class="card-tabs">
          <span 
            class="tab-item" 
            :class="{ active: dataTab === 'today' }"
            @click="dataTab = 'today'"
          >今日</span>
          <span 
            class="tab-item" 
            :class="{ active: dataTab === 'week' }"
            @click="dataTab = 'week'"
          >本周</span>
          <span 
            class="tab-item" 
            :class="{ active: dataTab === 'month' }"
            @click="dataTab = 'month'"
          >本月</span>
        </div>
      </div>
      <div class="data-grid">
        <div class="data-item" v-for="item in dashboardData" :key="item.label">
          <div class="data-icon" :style="{ background: item.bgColor }">
            <span>{{ item.icon }}</span>
          </div>
          <div class="data-content">
            <span class="data-value" :style="{ color: item.color }">{{ item.value }}</span>
            <span class="data-label">{{ item.label }}</span>
            <div class="data-trend" v-if="item.trend">
              <span class="trend-icon" :class="item.trend > 0 ? 'up' : 'down'">{{ item.trend > 0 ? '↑' : '↓' }}</span>
              <span class="trend-value" :class="item.trend > 0 ? 'up' : 'down'">{{ Math.abs(item.trend) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-tools">
      <div class="section-header">
        <span class="section-title">快捷工具</span>
      </div>
      <div class="tools-grid">
        <div class="tool-item" v-for="item in quickTools" :key="item.id">
          <div class="tool-icon" :style="{ background: item.bgColor }">
            <span>{{ item.icon }}</span>
          </div>
          <span class="tool-name">{{ item.name }}</span>
          <div class="tool-badge" v-if="item.badge">{{ item.badge }}</div>
        </div>
      </div>
    </div>

    <div class="notice-section">
      <div class="section-header">
        <span class="section-title">消息通知</span>
        <span class="section-more">查看全部</span>
      </div>
      <div class="notice-tabs">
        <span 
          class="notice-tab" 
          :class="{ active: noticeType === 'all' }"
          @click="noticeType = 'all'"
        >全部</span>
        <span 
          class="notice-tab" 
          :class="{ active: noticeType === 'order' }"
          @click="noticeType = 'order'"
        >订单</span>
        <span 
          class="notice-tab" 
          :class="{ active: noticeType === 'stock' }"
          @click="noticeType = 'stock'"
        >库存</span>
        <span 
          class="notice-tab" 
          :class="{ active: noticeType === 'finance' }"
          @click="noticeType = 'finance'"
        >财务</span>
      </div>
      <div class="notice-list">
        <div class="notice-item" v-for="item in filteredNotices" :key="item.id">
          <div class="notice-icon" :style="{ background: item.bgColor }">
            <span>{{ item.icon }}</span>
          </div>
          <div class="notice-content">
            <div class="notice-title">
              <span class="title-text">{{ item.title }}</span>
              <span class="notice-time">{{ item.time }}</span>
            </div>
            <span class="notice-desc">{{ item.desc }}</span>
          </div>
          <div class="notice-unread" v-if="!item.isRead"></div>
        </div>
      </div>
    </div>

    <div class="pending-section">
      <div class="section-header">
        <span class="section-title">待处理事项</span>
        <span class="section-count">共{{ totalPending }}项</span>
      </div>
      <div class="pending-list">
        <div class="pending-item" v-for="item in pendingList" :key="item.id" @click="$emit('navigate', 'order')">
          <div class="pending-left">
            <div class="pending-icon-wrap" :style="{ background: item.bgColor }">
              <span class="pending-icon">{{ item.icon }}</span>
            </div>
            <div class="pending-info">
              <span class="pending-text">{{ item.title }}</span>
              <span class="pending-desc">{{ item.desc }}</span>
            </div>
          </div>
          <div class="pending-right">
            <span class="pending-count">{{ item.count }}</span>
            <icon-right class="pending-arrow" />
          </div>
        </div>
      </div>
    </div>

    <div class="tabbar">
      <div class="tabbar-item active">
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
import { ref, computed, inject } from 'vue'

defineEmits(['navigate'])

const currentRoleRef = inject<any>('currentRole')
const currentRole = computed(() => currentRoleRef?.value || 'warehouse')

const userInfo = ref({
  name: '张三',
  company: '深圳湾科技园项目仓'
})

const unreadCount = ref(5)
const dataTab = ref('today')
const noticeType = ref('all')

const dashboardData = computed(() => {
  const data: Record<string, any[]> = {
    today: [
      { label: '今日订单', value: '28', color: '#165dff', bgColor: '#e8f3ff', icon: '📋', trend: 12 },
      { label: '今日销售额', value: '¥58,920', color: '#00b42a', bgColor: '#e8ffea', icon: '💰', trend: 8 },
      { label: '待发货', value: '12', color: '#ff7d00', bgColor: '#fff7e8', icon: '📦', trend: 0 },
      { label: '待处理售后', value: '3', color: '#f53f3f', bgColor: '#ffece8', icon: '🔄', trend: -5 },
      { label: '待开票', value: '8', color: '#722ed1', bgColor: '#f2e8ff', icon: '📄', trend: 0 },
      { label: '低库存预警', value: '5', color: '#f53f3f', bgColor: '#ffece8', icon: '⚠️', trend: 0 },
    ],
    week: [
      { label: '本周订单', value: '186', color: '#165dff', bgColor: '#e8f3ff', icon: '📋', trend: 15 },
      { label: '本周销售额', value: '¥398,520', color: '#00b42a', bgColor: '#e8ffea', icon: '💰', trend: 22 },
      { label: '待发货', value: '12', color: '#ff7d00', bgColor: '#fff7e8', icon: '📦', trend: 0 },
      { label: '待处理售后', value: '3', color: '#f53f3f', bgColor: '#ffece8', icon: '🔄', trend: 0 },
      { label: '待开票', value: '8', color: '#722ed1', bgColor: '#f2e8ff', icon: '📄', trend: 0 },
      { label: '低库存预警', value: '5', color: '#f53f3f', bgColor: '#ffece8', icon: '⚠️', trend: 0 },
    ],
    month: [
      { label: '本月订单', value: '756', color: '#165dff', bgColor: '#e8f3ff', icon: '📋', trend: 18 },
      { label: '本月销售额', value: '¥1,528,900', color: '#00b42a', bgColor: '#e8ffea', icon: '💰', trend: 25 },
      { label: '待发货', value: '12', color: '#ff7d00', bgColor: '#fff7e8', icon: '📦', trend: 0 },
      { label: '待处理售后', value: '3', color: '#f53f3f', bgColor: '#ffece8', icon: '🔄', trend: 0 },
      { label: '待开票', value: '8', color: '#722ed1', bgColor: '#f2e8ff', icon: '📄', trend: 0 },
      { label: '低库存预警', value: '5', color: '#f53f3f', bgColor: '#ffece8', icon: '⚠️', trend: 0 },
    ],
  }
  return data[dataTab.value]
})

const quickTools = computed(() => {
  const tools: Record<string, any[]> = {
    'warehouse': [
      { id: 1, name: '扫码发货', icon: '📦', bgColor: '#e8f3ff', badge: '12' },
      { id: 2, name: '发起采购', icon: '🛒', bgColor: '#fff7e8' },
      { id: 3, name: 'BOM采购', icon: '📋', bgColor: '#e8ffea' },
      { id: 4, name: '快速补货', icon: '⚡', bgColor: '#f2e8ff' },
      { id: 5, name: '库存预警', icon: '⚠️', bgColor: '#ffece8', badge: '5' },
      { id: 6, name: '收货入库', icon: '📥', bgColor: '#e8fff3', badge: '3' },
      { id: 7, name: '扫码入库', icon: '📷', bgColor: '#f0f5ff' },
      { id: 8, name: '更多功能', icon: '⋯', bgColor: '#f7f8fa' },
    ],
    'construction': [
      { id: 1, name: '浏览工程仓', icon: '🏪', bgColor: '#e8f3ff' },
      { id: 2, name: 'BOM采购', icon: '📋', bgColor: '#e8ffea' },
      { id: 3, name: '我的订单', icon: '📄', bgColor: '#fff7e8', badge: '5' },
      { id: 4, name: '收货确认', icon: '📥', bgColor: '#f2e8ff', badge: '2' },
      { id: 5, name: '我的收藏', icon: '❤️', bgColor: '#ffece8' },
      { id: 6, name: '收货地址', icon: '📍', bgColor: '#e8fff3' },
      { id: 7, name: '联系客服', icon: '💬', bgColor: '#f0f5ff' },
      { id: 8, name: '更多功能', icon: '⋯', bgColor: '#f7f8fa' },
    ],
    'supplier': [
      { id: 1, name: '供货订单', icon: '📦', bgColor: '#e8f3ff', badge: '8' },
      { id: 2, name: '商品管理', icon: '🏷️', bgColor: '#fff7e8' },
      { id: 3, name: '价格管理', icon: '💰', bgColor: '#e8ffea' },
      { id: 4, name: '库存同步', icon: '📊', bgColor: '#f2e8ff' },
      { id: 5, name: '发货处理', icon: '🚚', bgColor: '#ffece8', badge: '3' },
      { id: 6, name: '数据统计', icon: '📈', bgColor: '#e8fff3' },
      { id: 7, name: '联系客服', icon: '💬', bgColor: '#f0f5ff' },
      { id: 8, name: '更多功能', icon: '⋯', bgColor: '#f7f8fa' },
    ],
  }
  return tools[currentRole.value] || tools['warehouse']
})

const notices = ref([
  { id: 1, type: 'order', title: '待发货提醒', desc: '您有12笔订单待发货，请及时处理', time: '10分钟前', icon: '📦', bgColor: '#e8f3ff', isRead: false },
  { id: 2, type: 'stock', title: '库存预警', desc: '水泥P.O 42.5库存不足，当前库存50吨', time: '1小时前', icon: '⚠️', bgColor: '#ffece8', isRead: false },
  { id: 3, type: 'order', title: '采购订单状态', desc: '采购订单PO2024010001已发货', time: '2小时前', icon: '🚚', bgColor: '#e8ffea', isRead: true },
  { id: 4, type: 'finance', title: '开票提醒', desc: '销售订单SO2024010012待开票', time: '3小时前', icon: '📄', bgColor: '#fff7e8', isRead: true },
  { id: 5, type: 'finance', title: '收款到账', desc: '销售订单SO2024010010已收款¥21,000', time: '5小时前', icon: '💰', bgColor: '#e8ffea', isRead: true },
])

const filteredNotices = computed(() => {
  if (noticeType.value === 'all') return notices.value
  return notices.value.filter(n => n.type === noticeType.value)
})

const pendingList = computed(() => {
  const lists: Record<string, any[]> = {
    'warehouse': [
      { id: 1, title: '待发货订单', desc: '需要尽快处理发货', count: 12, icon: '📦', bgColor: '#e8f3ff' },
      { id: 2, title: '待确认采购', desc: '供应商已报价待确认', count: 5, icon: '🛒', bgColor: '#fff7e8' },
      { id: 3, title: '待收货入库', desc: '采购订单在途待入库', count: 3, icon: '📥', bgColor: '#e8fff3' },
      { id: 4, title: '待处理售后', desc: '客户申请售后待处理', count: 3, icon: '🔄', bgColor: '#ffece8' },
      { id: 5, title: '待开票订单', desc: '已完成订单待开票', count: 8, icon: '📄', bgColor: '#f2e8ff' },
      { id: 6, title: '库存预警', desc: '商品库存低于预警线', count: 5, icon: '⚠️', bgColor: '#fff1e8' },
    ],
    'construction': [
      { id: 1, title: '待付款订单', desc: '订单待付款', count: 3, icon: '💳', bgColor: '#e8f3ff' },
      { id: 2, title: '待收货订单', desc: '订单已发货待收货', count: 5, icon: '📥', bgColor: '#e8fff3' },
      { id: 3, title: '待确认收货', desc: '已到货待确认', count: 2, icon: '✅', bgColor: '#fff7e8' },
    ],
    'supplier': [
      { id: 1, title: '待处理订单', desc: '新订单待处理', count: 8, icon: '📦', bgColor: '#e8f3ff' },
      { id: 2, title: '待发货订单', desc: '已确认待发货', count: 3, icon: '🚚', bgColor: '#fff7e8' },
      { id: 3, title: '待开票订单', desc: '已完成订单待开票', count: 5, icon: '📄', bgColor: '#f2e8ff' },
    ],
  }
  return lists[currentRole.value] || lists['warehouse']
})

const totalPending = computed(() => {
  return pendingList.value.reduce((sum, item) => sum + item.count, 0)
})
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 60px;
  position: relative;
}

.header {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 16px;
  padding-top: 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.info {
  margin-left: 10px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: block;
}

.company {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
  display: block;
}

.header-actions {
  display: flex;
}

.action-item {
  position: relative;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 18px;
  color: #fff;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: #f53f3f;
  border-radius: 8px;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.data-card {
  margin: -20px 16px 12px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.card-tabs {
  display: flex;
  background-color: #f7f8fa;
  border-radius: 4px;
  padding: 2px;
}

.tab-item {
  font-size: 11px;
  color: #86909c;
  padding: 4px 8px;
  border-radius: 3px;
  
  &.active {
    color: #165dff;
    background-color: #fff;
    font-weight: 500;
  }
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.data-item {
  background-color: #f7f8fa;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-bottom: 6px;
}

.data-content {
  text-align: center;
}

.data-value {
  font-size: 16px;
  font-weight: 600;
  display: block;
}

.data-label {
  font-size: 10px;
  color: #86909c;
  display: block;
  margin-top: 2px;
}

.data-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.trend-icon {
  font-size: 10px;
  
  &.up { color: #00b42a; }
  &.down { color: #f53f3f; }
}

.trend-value {
  font-size: 10px;
  margin-left: 2px;
  
  &.up { color: #00b42a; }
  &.down { color: #f53f3f; }
}

.quick-tools {
  margin: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.section-more {
  font-size: 12px;
  color: #86909c;
}

.section-count {
  font-size: 12px;
  color: #86909c;
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
}

.tool-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.tool-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 4px;
}

.tool-name {
  font-size: 12px;
  color: #1d2129;
}

.tool-badge {
  position: absolute;
  top: -2px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  background: #f53f3f;
  border-radius: 8px;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.notice-section {
  margin: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
}

.notice-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.notice-tab {
  font-size: 12px;
  color: #86909c;
  padding: 4px 12px;
  border-radius: 12px;
  background-color: #f7f8fa;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
  }
}

.notice-list {
  display: flex;
  flex-direction: column;
}

.notice-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f7f8fa;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
}

.notice-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 10px;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.notice-time {
  font-size: 11px;
  color: #86909c;
}

.notice-desc {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  display: block;
}

.notice-unread {
  position: absolute;
  top: 12px;
  right: 0;
  width: 6px;
  height: 6px;
  background: #f53f3f;
  border-radius: 50%;
}

.pending-section {
  margin: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
}

.pending-list {
  display: flex;
  flex-direction: column;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.pending-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.pending-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.pending-icon {
  font-size: 14px;
}

.pending-info {
  display: flex;
  flex-direction: column;
}

.pending-text {
  font-size: 14px;
  color: #1d2129;
}

.pending-desc {
  font-size: 11px;
  color: #86909c;
  margin-top: 2px;
}

.pending-right {
  display: flex;
  align-items: center;
}

.pending-count {
  font-size: 16px;
  font-weight: 600;
  color: #f53f3f;
  margin-right: 6px;
}

.pending-arrow {
  font-size: 14px;
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
