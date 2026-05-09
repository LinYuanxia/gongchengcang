<template>
  <div class="mp-page project-list">
    <div class="page-header">
      <div class="header-title">项目管理</div>
      <div class="header-action" @click="handleCreate">
        <icon-plus />
        <span>新建项目</span>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索门店名称" v-model="searchText" />
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
        :class="{ active: activeStatus === 'pending-survey' }"
        @click="activeStatus = 'pending-survey'"
      >
        待堪场
        <span class="count">{{ pendingSurveyCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'ongoing' }"
        @click="activeStatus = 'ongoing'"
      >
        施工中
        <span class="count">{{ ongoingCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'completed' }"
        @click="activeStatus = 'completed'"
      >
        已完成
        <span class="count">{{ completedCount }}</span>
      </div>
    </div>
    
    <div class="project-list-content">
      <div class="project-item" v-for="item in filteredProjects" :key="item.id" @click="handleDetail(item)">
        <div class="project-cover">
          <img :src="item.coverImage" :alt="item.storeName" />
          <div class="brand-badge">
            <img :src="item.brandLogo" :alt="item.brand" />
          </div>
        </div>
        
        <div class="project-content">
          <div class="project-header">
            <div class="store-name">{{ item.storeName }}</div>
            <div class="project-status" :class="item.status">
              {{ getStatusText(item.status) }}
            </div>
          </div>
          
          <div class="project-meta">
            <span class="store-code">{{ item.code }}</span>
            <span class="brand-name">{{ item.brand }}</span>
          </div>
          
          <div class="project-info">
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ item.address }}</span>
            </div>
            <div class="info-row" v-if="item.bomName">
              <span class="label">BOM包：</span>
              <span class="value">{{ item.bomName }}</span>
            </div>
            <div class="info-row">
              <span class="label">创建日期：</span>
              <span class="value">{{ item.createDate }}</span>
            </div>
          </div>
          
          <div class="project-progress" v-if="item.status === 'ongoing'">
            <div class="progress-header">
              <span>项目进度</span>
              <span class="progress-percent">{{ item.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
          </div>
          
          <div class="project-footer">
            <div class="footer-left">
              <span class="date">开工：{{ item.startDate }}</span>
            </div>
            <div class="footer-right">
              <span class="action-btn" @click.stop="handleOrder(item)">下单</span>
              <span class="action-btn primary" @click.stop="handleDetail(item)">详情</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item active" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
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

const searchText = ref('')
const activeStatus = ref('all')

const projects = ref([
  {
    id: 1,
    storeName: '星巴克深圳万象城店',
    code: 'CD001',
    brand: '星巴克',
    brandLogo: 'https://picsum.photos/40/40?random=brand1',
    coverImage: 'https://picsum.photos/400/200?random=store1',
    address: '广东省深圳市罗湖区宝安南路1881号万象城3楼301',
    status: 'ongoing',
    bomName: '星巴克标准基装包V2.0',
    budget: '150,000',
    orderedAmount: '85,000',
    receivedAmount: '62,000',
    progress: 57,
    startDate: '2024-01-10',
    createDate: '2024-01-08',
  },
  {
    id: 2,
    storeName: '喜茶广州天河城店',
    code: 'CD002',
    brand: '喜茶',
    brandLogo: 'https://picsum.photos/40/40?random=brand2',
    coverImage: 'https://picsum.photos/400/200?random=store2',
    address: '广东省广州市天河区天河路208号天河城B1层',
    status: 'pending-survey',
    bomName: '喜茶标准基装包V1.5',
    budget: '120,000',
    orderedAmount: '45,000',
    receivedAmount: '30,000',
    progress: 0,
    startDate: '2024-01-15',
    createDate: '2024-01-12',
  },
  {
    id: 3,
    storeName: '奈雪的茶深圳海岸城店',
    code: 'CD003',
    brand: '奈雪的茶',
    brandLogo: 'https://picsum.photos/40/40?random=brand3',
    coverImage: 'https://picsum.photos/400/200?random=store3',
    address: '广东省深圳市南山区文心五路海岸城L2层',
    status: 'completed',
    bomName: '奈雪标准基装包V2.0',
    budget: '180,000',
    orderedAmount: '180,000',
    receivedAmount: '180,000',
    progress: 100,
    startDate: '2023-11-01',
    createDate: '2023-10-28',
  },
  {
    id: 4,
    storeName: '瑞幸咖啡东莞万达店',
    code: 'CD004',
    brand: '瑞幸咖啡',
    brandLogo: 'https://picsum.photos/40/40?random=brand4',
    coverImage: 'https://picsum.photos/400/200?random=store4',
    address: '广东省东莞市南城区鸿福路万达广场L1层',
    status: 'ongoing',
    bomName: '',
    budget: '80,000',
    orderedAmount: '20,000',
    receivedAmount: '15,000',
    progress: 25,
    startDate: '2024-01-20',
    createDate: '2024-01-18',
  },
  {
    id: 5,
    storeName: '肯德基佛山顺德店',
    code: 'CD005',
    brand: '肯德基',
    brandLogo: 'https://picsum.photos/40/40?random=brand5',
    coverImage: 'https://picsum.photos/400/200?random=store5',
    address: '广东省佛山市顺德区大良街道',
    status: 'completed',
    bomName: '肯德基标准基装包V3.0',
    budget: '200,000',
    orderedAmount: '200,000',
    receivedAmount: '200,000',
    progress: 100,
    startDate: '2023-09-15',
    createDate: '2023-09-10',
  },
])

const totalCount = computed(() => projects.value.length)
const ongoingCount = computed(() => projects.value.filter(p => p.status === 'ongoing').length)
const completedCount = computed(() => projects.value.filter(p => p.status === 'completed').length)
const pendingSurveyCount = computed(() => projects.value.filter(p => p.status === 'pending-survey').length)

const filteredProjects = computed(() => {
  let result = projects.value
  
  if (activeStatus.value !== 'all') {
    result = result.filter(p => p.status === activeStatus.value)
  }
  
  if (searchText.value) {
    result = result.filter(p => 
      p.storeName.includes(searchText.value) || 
      p.brand.includes(searchText.value) ||
      p.code.includes(searchText.value)
    )
  }
  
  return result
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    'ongoing': '施工中',
    'completed': '已完成',
    'pending-survey': '待堪场'
  }
  return map[status] || status
}

function handleCreate() {
  emit('navigate', 'project-create')
}

function handleDetail(item: any) {
  emit('navigate', 'project-detail')
}

function handleOrder(item: any) {
  emit('navigate', 'market')
}
</script>

<style lang="scss" scoped>
.project-list {
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
  padding: 8px 16px;
  
  .search-icon {
    color: #86909c;
    margin-right: 8px;
  }
  
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
    
    &::placeholder {
      color: #c9cdd4;
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

.project-list-content {
  padding: 12px;
}

.project-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  
  .project-cover {
    position: relative;
    height: 120px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .brand-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #fff;
      padding: 3px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }
  }
  
  .project-content {
    padding: 12px;
  }
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  
  .store-name {
    font-size: 15px;
    color: #1d2129;
    font-weight: 600;
    flex: 1;
    margin-right: 8px;
  }
  
  .project-status {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    flex-shrink: 0;
    
    &.ongoing {
      background: #e8ffea;
      color: #00b42a;
    }
    
    &.completed {
      background: #e8f3ff;
      color: #165dff;
    }
    
    &.pending-survey {
      background: #fff7e8;
      color: #ff7d00;
    }
  }
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  
  .store-code {
    font-size: 11px;
    color: #86909c;
    background: #f7f8fa;
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  .brand-name {
    font-size: 12px;
    color: #4e5969;
  }
}

.project-info {
  margin-bottom: 10px;
  
  .info-row {
    display: flex;
    font-size: 12px;
    margin-bottom: 4px;
    
    .label {
      color: #86909c;
      width: 70px;
      flex-shrink: 0;
    }
    
    .value {
      color: #4e5969;
      flex: 1;
    }
  }
}

.project-progress {
  background: #f7f8fa;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 12px;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #1d2129;
    margin-bottom: 6px;
    
    .progress-percent {
      color: #165dff;
      font-weight: 500;
    }
  }
  
  .progress-bar {
    height: 6px;
    background: #e5e6eb;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #165dff, #4080ff);
      border-radius: 3px;
    }
  }
  
  .progress-detail {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #86909c;
  }
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f2f3f5;
  
  .date {
    font-size: 11px;
    color: #86909c;
  }
  
  .footer-right {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    background: #f2f3f5;
    color: #4e5969;
    
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
