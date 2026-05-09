<template>
  <view class="page">
    <view class="project-header">
      <swiper class="project-swiper" indicator-dots autoplay circular>
        <swiper-item v-for="(img, index) in project.images" :key="index">
          <image :src="img" mode="aspectFill" class="swiper-image" />
        </swiper-item>
      </swiper>
      <view class="project-status" :class="project.status">{{ getStatusText(project.status) }}</view>
    </view>

    <view class="project-info">
      <view class="info-header">
        <text class="project-name">{{ project.name }}</text>
        <view class="project-brand">
          <image :src="project.brandLogo" class="brand-icon" />
          <text class="brand-name">{{ project.brandName }}</text>
        </view>
      </view>
      <view class="info-row">
        <text class="info-label">门店编码</text>
        <text class="info-value">{{ project.code }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">详细地址</text>
        <text class="info-value address">{{ project.address }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">创建日期</text>
        <text class="info-value">{{ project.createDate }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">预计工期</text>
        <text class="info-value">{{ project.expectedDuration }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">项目负责人</text>
        <text class="info-value">{{ project.contactName }} {{ project.contactPhone }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">项目进度</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: project.progress + '%' }"></view>
      </view>
      <view class="progress-text">
        <text>当前进度：{{ project.progress }}%</text>
      </view>
      <view class="milestone-list">
        <view class="milestone-item" v-for="(item, index) in project.milestones" :key="index">
          <view class="milestone-dot" :class="{ active: index <= project.currentMilestone, completed: index < project.currentMilestone }"></view>
          <view class="milestone-content">
            <text class="milestone-title">{{ item.title }}</text>
            <text class="milestone-date">{{ item.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">快捷操作</text>
      </view>
      <view class="action-grid">
        <view class="action-item" @click="handleOrder">
          <view class="action-icon" style="background: #e8f3ff;">📋</view>
          <text class="action-name">材料下单</text>
        </view>
        <view class="action-item" @click="handleCheck">
          <view class="action-icon" style="background: #e8ffea;">🔍</view>
          <text class="action-name">现场勘查</text>
        </view>
        <view class="action-item" @click="handleReport">
          <view class="action-icon" style="background: #fff7e8;">📝</view>
          <text class="action-name">进度汇报</text>
        </view>
        <view class="action-item" @click="handleTeam">
          <view class="action-icon" style="background: #f2e8ff;">👥</view>
          <text class="action-name">团队管理</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">下单记录</text>
        <text class="section-more" @click="handleViewAllOrders">查看全部</text>
      </view>
      <view class="order-list">
        <view class="order-item" v-for="order in recentOrders" :key="order.id" @click="handleOrderDetail(order)">
          <view class="order-header">
            <text class="order-no">{{ order.orderNo }}</text>
            <text class="order-status" :style="{ color: getOrderStatusColor(order.status) }">{{ order.statusText }}</text>
          </view>
          <view class="order-info">
            <text class="order-date">{{ order.createDate }}</text>
            <text class="order-amount">金额：¥{{ order.amount }}</text>
          </view>
          <view class="order-items">
            <view class="order-product" v-for="prod in order.products" :key="prod.id">
              <image :src="prod.image" class="product-thumb" />
              <text class="product-name">{{ prod.name }}</text>
              <text class="product-qty">x{{ prod.qty }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="empty" v-if="recentOrders.length === 0">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无下单记录</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="contact-btn" @click="handleContact">
        <text class="btn-icon">📞</text>
        <text class="btn-text">联系负责人</text>
      </view>
      <view class="primary-btn" @click="handleOrder">
        <text>立即下单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const project = ref({
  id: '',
  name: '',
  code: '',
  brandLogo: '',
  brandName: '',
  address: '',
  createDate: '',
  status: '',
  images: [],
  expectedDuration: '',
  contactName: '',
  contactPhone: '',
  progress: 0,
  currentMilestone: 0,
  milestones: [],
})

const recentOrders = ref([])

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  
  project.value = {
    id: options.id || 'proj001',
    name: '深圳湾壹号装修项目',
    code: 'PROJ-2024-001',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: '万科',
    address: '广东省深圳市南山区深圳湾壹号T3栋2801室',
    createDate: '2024-01-15',
    status: 'construction',
    images: [
      'https://picsum.photos/600/400?random=1',
      'https://picsum.photos/600/400?random=2',
      'https://picsum.photos/600/400?random=3',
    ],
    expectedDuration: '90天',
    contactName: '张工',
    contactPhone: '138****8888',
    progress: 45,
    currentMilestone: 2,
    milestones: [
      { title: '项目立项', date: '2024-01-15' },
      { title: '现场勘查', date: '2024-01-18' },
      { title: '材料进场', date: '2024-01-25' },
      { title: '主体施工', date: '2024-02-01' },
      { title: '竣工验收', date: '2024-04-15' },
    ],
  }

  recentOrders.value = [
    {
      id: 'order001',
      orderNo: 'PO2024010001',
      status: 'shipped',
      statusText: '已发货',
      createDate: '2024-01-20 14:30',
      amount: '18,500.00',
      products: [
        { id: 'p1', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=10', qty: 20 },
        { id: 'p2', name: '黄砂 中砂', image: 'https://picsum.photos/60/60?random=11', qty: 50 },
      ],
    },
    {
      id: 'order002',
      orderNo: 'PO2024010002',
      status: 'pending',
      statusText: '待确认',
      createDate: '2024-01-22 10:15',
      amount: '32,000.00',
      products: [
        { id: 'p3', name: '螺纹钢 HRB400 16mm', image: 'https://picsum.photos/60/60?random=12', qty: 15 },
      ],
    },
  ]
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    survey: '待堪场',
    construction: '施工中',
    completed: '已完成',
  }
  return statusMap[status] || status
}

function getOrderStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: '#ff7d00',
    shipped: '#165dff',
    completed: '#00b42a',
    cancelled: '#86909c',
  }
  return colors[status] || '#666'
}

function handleOrder() {
  uni.navigateTo({ url: `/pages/index/order-create?projectId=${project.value.id}&projectName=${encodeURIComponent(project.value.name)}` })
}

function handleCheck() {
  uni.showToast({ title: '现场勘查功能开发中', icon: 'none' })
}

function handleReport() {
  uni.showToast({ title: '进度汇报功能开发中', icon: 'none' })
}

function handleTeam() {
  uni.showToast({ title: '团队管理功能开发中', icon: 'none' })
}

function handleContact() {
  uni.makePhoneCall({
    phoneNumber: '13800138000',
    success: () => {},
    fail: () => {
      uni.showToast({ title: '拨号失败', icon: 'none' })
    },
  })
}

function handleViewAllOrders() {
  uni.navigateTo({ url: '/pages/order/purchase' })
}

function handleOrderDetail(order: any) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 140rpx;
}

.project-header {
  position: relative;
}

.project-swiper {
  width: 100%;
  height: 400rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.project-status {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  
  &.survey {
    color: #ff7d00;
    background-color: rgba(255, 125, 0, 0.9);
  }
  
  &.construction {
    color: #fff;
    background-color: rgba(22, 93, 255, 0.9);
  }
  
  &.completed {
    color: #fff;
    background-color: rgba(0, 180, 42, 0.9);
  }
}

.project-info {
  background-color: #fff;
  margin: -30rpx 32rpx 24rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.project-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d2129;
}

.project-brand {
  display: flex;
  align-items: center;
}

.brand-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
}

.brand-name {
  font-size: 24rpx;
  color: #666;
  margin-left: 12rpx;
}

.info-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: #86909c;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #1d2129;
  
  &.address {
    flex: 1;
  }
}

.section {
  background-color: #fff;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.section-more {
  font-size: 24rpx;
  color: #165dff;
}

.progress-bar {
  height: 12rpx;
  background-color: #f7f8fa;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #165dff 0%, #4080ff 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 12rpx;
  
  text {
    font-size: 24rpx;
    color: #666;
  }
}

.milestone-list {
  margin-top: 24rpx;
}

.milestone-item {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx dashed #f0f0f0;
  }
}

.milestone-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #d9d9d9;
  margin-right: 20rpx;
  margin-top: 8rpx;
  flex-shrink: 0;
  
  &.active {
    background-color: #165dff;
    box-shadow: 0 0 0 8rpx rgba(22, 93, 255, 0.1);
  }
  
  &.completed {
    background-color: #00b42a;
  }
}

.milestone-content {
  flex: 1;
}

.milestone-title {
  font-size: 26rpx;
  color: #1d2129;
  display: block;
}

.milestone-date {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 12rpx;
}

.action-name {
  font-size: 24rpx;
  color: #1d2129;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.order-no {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 500;
}

.order-status {
  font-size: 24rpx;
  font-weight: 500;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  
  text {
    font-size: 22rpx;
    color: #86909c;
  }
  
  .order-amount {
    color: #f53f3f;
    font-weight: 500;
  }
}

.order-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.order-product {
  display: flex;
  align-items: center;
  width: calc(50% - 6rpx);
}

.product-thumb {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.product-name {
  flex: 1;
  font-size: 22rpx;
  color: #666;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-qty {
  font-size: 22rpx;
  color: #86909c;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #86909c;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.contact-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
}

.btn-icon {
  font-size: 40rpx;
}

.btn-text {
  font-size: 22rpx;
  color: #666;
  margin-top: 4rpx;
}

.primary-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  margin-left: 24rpx;
}
</style>