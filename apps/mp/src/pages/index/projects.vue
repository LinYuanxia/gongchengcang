<template>
  <view class="page">
    <view class="search-header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索门店名称/编码" 
          class="search-input"
          @confirm="handleSearch"
        />
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
    </view>

    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item" :class="{ active: currentStatus === '' }" @click="currentStatus = ''">全部</view>
        <view class="filter-item" :class="{ active: currentStatus === 'survey' }" @click="currentStatus = 'survey'">待堪场</view>
        <view class="filter-item" :class="{ active: currentStatus === 'construction' }" @click="currentStatus = 'construction'">施工中</view>
        <view class="filter-item" :class="{ active: currentStatus === 'completed' }" @click="currentStatus = 'completed'">已完成</view>
      </view>
      <view class="filter-row">
        <view class="filter-item" :class="{ active: currentProvince === '' }" @click="currentProvince = ''">全部省份</view>
        <view class="filter-item" v-for="province in provinces" :key="province.code" :class="{ active: currentProvince === province.code }" @click="currentProvince = province.code">{{ province.name }}</view>
      </view>
    </view>

    <view class="project-list" v-if="filteredProjects.length > 0">
      <view class="project-card" v-for="project in filteredProjects" :key="project.id" @click="handleProjectDetail(project)">
        <image :src="project.mainImage" mode="aspectFill" class="project-image" />
        <view class="project-info">
          <view class="project-header">
            <text class="project-name">{{ project.name }}</text>
            <view class="project-status" :class="project.status">{{ getStatusText(project.status) }}</view>
          </view>
          <text class="project-code">编码: {{ project.code }}</text>
          <view class="project-brand">
            <image :src="project.brandLogo" class="brand-icon" />
            <text class="brand-name">{{ project.brandName }}</text>
          </view>
          <text class="project-address">📍 {{ project.address }}</text>
          <view class="project-footer">
            <text class="project-date">创建日期: {{ project.createDate }}</text>
            <view class="project-progress">
              <view class="progress-bar-small">
                <view class="progress-fill-small" :style="{ width: project.progress + '%' }"></view>
              </view>
              <text class="progress-text">{{ project.progress }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-else>
      <text class="empty-icon">🏠</text>
      <text class="empty-text">暂无门店项目</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchKeyword = ref('')
const currentStatus = ref('')
const currentProvince = ref('')

const provinces = ref([
  { code: 'GD', name: '广东省' },
  { code: 'BJ', name: '北京市' },
  { code: 'SH', name: '上海市' },
  { code: 'ZJ', name: '浙江省' },
])

const projects = ref([
  {
    id: 'proj001',
    name: '深圳湾壹号装修项目',
    code: 'PROJ-2024-001',
    mainImage: 'https://picsum.photos/300/200?random=1',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: '万科',
    address: '广东省深圳市南山区深圳湾壹号T3栋',
    status: 'construction',
    createDate: '2024-01-15',
    progress: 45,
  },
  {
    id: 'proj002',
    name: '科技园总部大厦',
    code: 'PROJ-2024-002',
    mainImage: 'https://picsum.photos/300/200?random=2',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: '华润置地',
    address: '广东省深圳市南山区科技园南区',
    status: 'survey',
    createDate: '2024-02-20',
    progress: 10,
  },
  {
    id: 'proj003',
    name: '前海金融中心',
    code: 'PROJ-2024-003',
    mainImage: 'https://picsum.photos/300/200?random=3',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: '卓越集团',
    address: '广东省深圳市前海自贸区',
    status: 'construction',
    createDate: '2024-01-08',
    progress: 65,
  },
  {
    id: 'proj004',
    name: '北京国贸大厦项目',
    code: 'PROJ-2024-004',
    mainImage: 'https://picsum.photos/300/200?random=4',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: 'SOHO中国',
    address: '北京市朝阳区建国门外大街1号',
    status: 'construction',
    createDate: '2024-01-10',
    progress: 30,
  },
  {
    id: 'proj005',
    name: '上海陆家嘴金融中心',
    code: 'PROJ-2024-005',
    mainImage: 'https://picsum.photos/300/200?random=5',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: '绿地集团',
    address: '上海市浦东新区陆家嘴环路958号',
    status: 'completed',
    createDate: '2023-11-01',
    progress: 100,
  },
  {
    id: 'proj006',
    name: '杭州西湖文化广场',
    code: 'PROJ-2024-006',
    mainImage: 'https://picsum.photos/300/200?random=6',
    brandLogo: 'https://via.placeholder.com/40',
    brandName: '绿城集团',
    address: '浙江省杭州市拱墅区中山北路588号',
    status: 'survey',
    createDate: '2024-02-15',
    progress: 5,
  },
])

const filteredProjects = computed(() => {
  let result = projects.value
  
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      p.code.toLowerCase().includes(kw)
    )
  }
  
  if (currentStatus.value) {
    result = result.filter(p => p.status === currentStatus.value)
  }
  
  if (currentProvince.value) {
    const provinceName = provinces.value.find(p => p.code === currentProvince.value)?.name
    if (provinceName) {
      result = result.filter(p => p.address.includes(provinceName))
    }
  }
  
  return result
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    survey: '待堪场',
    construction: '施工中',
    completed: '已完成',
  }
  return statusMap[status] || status
}

function handleSearch() {
  uni.showToast({ title: '搜索完成', icon: 'none' })
}

function handleProjectDetail(project: any) {
  uni.navigateTo({ url: `/pages/index/project-detail?id=${project.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-header {
  background-color: #fff;
  padding: 20rpx 32rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.search-btn {
  font-size: 26rpx;
  color: #165dff;
  font-weight: 500;
  margin-left: 16rpx;
}

.filter-section {
  background-color: #fff;
  padding: 16rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  &:not(:last-child) {
    margin-bottom: 16rpx;
  }
}

.filter-item {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 20rpx;
  
  &.active {
    color: #fff;
    background-color: #165dff;
  }
}

.project-list {
  padding: 24rpx 32rpx;
}

.project-card {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.project-image {
  width: 240rpx;
  height: 180rpx;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
  flex: 1;
}

.project-status {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  
  &.survey {
    color: #ff7d00;
    background-color: #fff7e8;
  }
  
  &.construction {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  &.completed {
    color: #00b42a;
    background-color: #e8ffea;
  }
}

.project-code {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 12rpx;
}

.project-brand {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.brand-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 6rpx;
}

.brand-name {
  font-size: 24rpx;
  color: #666;
  margin-left: 8rpx;
}

.project-address {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.project-date {
  font-size: 22rpx;
  color: #c9cdd4;
}

.project-progress {
  display: flex;
  align-items: center;
}

.progress-bar-small {
  width: 80rpx;
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
  margin-right: 8rpx;
}

.progress-fill-small {
  height: 100%;
  background: linear-gradient(90deg, #165dff 0%, #4080ff 100%);
  border-radius: 4rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #165dff;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}
</style>