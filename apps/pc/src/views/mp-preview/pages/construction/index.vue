<template>
  <div class="mp-page index">
    <div class="page-header">
      <div class="search-bar" @click="showSearchPopup = true">
        <icon-search class="search-icon" />
        <span class="search-placeholder">搜索门店/项目名称或编号</span>
      </div>
    </div>
    
    <div class="store-card">
      <div class="store-cover">
        <img src="https://picsum.photos/400/180?random=store" alt="" />
        <div class="store-overlay"></div>
      </div>
      <div class="store-info">
        <div class="store-main">
          <div class="store-name">{{ currentStore.name }}</div>
          <div class="store-code">{{ currentStore.code }}</div>
        </div>
        <div class="store-detail-btn" @click="showStoreDetail = true">
          <icon-info-circle />
          详情
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <div class="stats-card">
        <div class="stats-header">
          <span class="stats-title">项目概览</span>
          <span class="stats-more" @click="$emit('navigate', 'project-list')">查看全部</span>
        </div>
        <div class="stats-grid">
          <div class="stats-item" @click="$emit('navigate', 'project-list')">
            <div class="stats-value primary">{{ stats.monthProjects }}</div>
            <div class="stats-label">本月项目</div>
          </div>
          <div class="stats-item" @click="$emit('navigate', 'project-list')">
            <div class="stats-value warning">{{ stats.pendingSurvey }}</div>
            <div class="stats-label">待堪场量房</div>
          </div>
          <div class="stats-item" @click="$emit('navigate', 'project-list')">
            <div class="stats-value success">{{ stats.ongoing }}</div>
            <div class="stats-label">工程施工</div>
          </div>
          <div class="stats-item" @click="$emit('navigate', 'project-list')">
            <div class="stats-value info">{{ stats.completed }}</div>
            <div class="stats-label">已完成项目</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="action-section">
      <div class="action-grid">
        <div class="action-item" @click="handleUploadFrame">
          <div class="action-icon blue">
            <icon-image />
          </div>
          <span class="action-text">原始框架图</span>
        </div>
        <div class="action-item" @click="handleUploadMeasure">
          <div class="action-icon green">
            <icon-camera />
          </div>
          <span class="action-text">复尺图</span>
        </div>
        <div class="action-item" @click="$emit('navigate', 'market')">
          <div class="action-icon orange">
            <icon-shopping-cart />
          </div>
          <span class="action-text">材料购买</span>
        </div>
        <div class="action-item" @click="$emit('navigate', 'material-list')">
          <div class="action-icon purple">
            <icon-list />
          </div>
          <span class="action-text">门店材料</span>
        </div>
      </div>
    </div>
    
    <div class="recent-project-section">
      <div class="section-header">
        <span class="section-title">近期项目</span>
        <span class="section-more" @click="$emit('navigate', 'project-list')">查看全部</span>
      </div>
      <div class="project-list">
        <div class="project-card" v-for="item in recentProjects" :key="item.id" @click="handleProjectClick(item)">
          <div class="project-header">
            <div class="store-name">{{ item.storeName }}</div>
            <div class="project-status" :class="item.status">
              {{ item.statusText }}
            </div>
          </div>
          <div class="project-brand">{{ item.brand }}</div>
          <div class="project-progress" v-if="item.status === 'construction'">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
            <div class="progress-text">{{ item.progress }}%</div>
          </div>
          <div class="project-actions">
            <div class="action-btn" @click.stop="handleUploadFrame">
              <icon-image />
              框架图
            </div>
            <div class="action-btn" @click.stop="handleUploadMeasure">
              <icon-camera />
              复尺图
            </div>
            <div class="action-btn primary" @click.stop="handleOrderMaterial(item)">
              <icon-shopping-cart />
              下单
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="search-popup" v-if="showSearchPopup">
      <div class="popup-mask" @click="showSearchPopup = false"></div>
      <div class="popup-content">
        <div class="search-header">
          <div class="search-input-wrap">
            <icon-search class="search-icon" />
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索门店/项目名称或编号" 
              class="search-input"
              autofocus
            />
            <div class="search-clear" v-if="searchKeyword" @click="searchKeyword = ''">
              <icon-close />
            </div>
          </div>
          <div class="search-cancel" @click="showSearchPopup = false">取消</div>
        </div>
        <div class="search-result">
          <div class="result-empty" v-if="!searchKeyword">
            <icon-search />
            <span>请输入关键词搜索</span>
          </div>
          <div class="result-list" v-else>
            <div 
              class="result-item" 
              v-for="item in searchResults" 
              :key="item.id"
              @click="handleProjectClick(item)"
            >
              <div class="item-name">{{ item.storeName }}</div>
              <div class="item-brand">{{ item.brand }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="detail-modal" v-if="showStoreDetail">
      <div class="modal-mask" @click="showStoreDetail = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">门店信息</span>
          <span class="modal-close" @click="showStoreDetail = false">
            <icon-close />
          </span>
        </div>
        <div class="store-detail-content">
          <div class="detail-row">
            <span class="label">门店名称</span>
            <span class="value">{{ currentStore.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">门店编码</span>
            <span class="value">{{ currentStore.code }}</span>
          </div>
          <div class="detail-row">
            <span class="label">门店地址</span>
            <span class="value">{{ currentStore.address }}</span>
          </div>
          <div class="detail-row">
            <span class="label">联系电话</span>
            <span class="value">{{ currentStore.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">项目经理</span>
            <span class="value">{{ currentStore.manager }}</span>
          </div>
        </div>
        <div class="manager-section">
          <div class="section-title">门店负责人</div>
          <div class="manager-list">
            <div class="manager-item" v-for="m in managers" :key="m.id">
              <div class="manager-info">
                <div class="manager-name">{{ m.name }}</div>
                <div class="manager-phone">{{ m.phone }}</div>
              </div>
              <div class="manager-role">{{ m.role }}</div>
            </div>
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
        <span>商品市场</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'order')">
        <icon-file />
        <span>我的订单</span>
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

const showSearchPopup = ref(false)
const showStoreDetail = ref(false)
const searchKeyword = ref('')

const currentStore = ref({
  name: '深圳万象城店',
  code: 'CD001',
  address: '深圳市罗湖区宝安南路1881号万象城3楼301',
  phone: '0755-88888888',
  manager: '李经理',
})

const stats = ref({
  monthProjects: 8,
  pendingSurvey: 3,
  ongoing: 5,
  completed: 12,
})

const recentProjects = ref([
  {
    id: 1,
    storeName: '星巴克深圳万象城店',
    brand: '星巴克',
    status: 'pending-survey',
    statusText: '待堪场',
    progress: 0,
  },
  {
    id: 2,
    storeName: '喜茶广州天河城店',
    brand: '喜茶',
    status: 'pending-construction',
    statusText: '待施工',
    progress: 0,
  },
  {
    id: 3,
    storeName: '瑞幸咖啡东莞万达店',
    brand: '瑞幸咖啡',
    status: 'construction',
    statusText: '施工中',
    progress: 57,
  },
])

const managers = ref([
  { id: 1, name: '张三', phone: '13800138001', role: '项目经理' },
  { id: 2, name: '李四', phone: '13800138002', role: '现场负责人' },
  { id: 3, name: '王五', phone: '13800138003', role: '材料负责人' },
])

const searchResults = computed(() => {
  if (!searchKeyword.value) return []
  return recentProjects.value.filter(item => 
    item.storeName.includes(searchKeyword.value) || 
    item.brand.includes(searchKeyword.value)
  )
})

function handleProjectClick(item: any) {
  showSearchPopup.value = false
  emit('navigate', 'project-detail', { projectId: item.id })
}

function handleUploadFrame() {
  emit('navigate', 'project-detail', { tab: 'upload' })
}

function handleUploadMeasure() {
  emit('navigate', 'project-detail', { tab: 'upload' })
}

function handleOrderMaterial(item: any) {
  emit('navigate', 'market', { projectId: item.id })
}
</script>

<style lang="scss" scoped>
.index {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #165dff, #4080ff);
  padding: 10px 16px;
  z-index: 100;
  
  .search-bar {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 0 14px;
    height: 36px;
    
    .search-icon {
      color: #86909c;
      font-size: 16px;
      margin-right: 8px;
    }
    
    .search-placeholder {
      font-size: 14px;
      color: #86909c;
    }
  }
}

.store-card {
  margin: 56px 12px 12px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  
  .store-cover {
    position: relative;
    height: 100px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .store-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
    }
  }
  
  .store-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    
    .store-main {
      .store-name {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .store-code {
        font-size: 12px;
        color: #86909c;
        background: #f7f8fa;
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
      }
    }
    
    .store-detail-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #165dff;
      padding: 6px 12px;
      background: #f0f5ff;
      border-radius: 14px;
    }
  }
}

.stats-section {
  padding: 0 12px 12px;
  
  .stats-card {
    background: #fff;
    border-radius: 12px;
    padding: 14px;
    
    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      
      .stats-title {
        font-size: 15px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .stats-more {
        font-size: 12px;
        color: #165dff;
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      
      .stats-item {
        text-align: center;
        
        .stats-value {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 4px;
          
          &.primary {
            color: #165dff;
          }
          
          &.warning {
            color: #ff7d00;
          }
          
          &.success {
            color: #00b42a;
          }
          
          &.info {
            color: #86909c;
          }
        }
        
        .stats-label {
          font-size: 11px;
          color: #86909c;
        }
      }
    }
  }
}

.action-section {
  padding: 0 12px 12px;
  
  .action-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 8px;
      background: #fff;
      border-radius: 10px;
      
      .action-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        
        &.blue {
          background: #e8f3ff;
          color: #165dff;
        }
        
        &.green {
          background: #e8ffea;
          color: #00b42a;
        }
        
        &.orange {
          background: #fff7e8;
          color: #ff7d00;
        }
        
        &.purple {
          background: #f3e8ff;
          color: #722ed1;
        }
      }
      
      .action-text {
        font-size: 12px;
        color: #1d2129;
      }
    }
  }
}

.recent-project-section {
  padding: 0 12px;
  
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
  
  .project-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .project-card {
      background: #fff;
      border-radius: 10px;
      padding: 14px;
      
      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        
        .store-name {
          font-size: 14px;
          font-weight: 500;
          color: #1d2129;
        }
        
        .project-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          
          &.pending-survey {
            background: #fff7e8;
            color: #ff7d00;
          }
          
          &.pending-construction {
            background: #e8f3ff;
            color: #165dff;
          }
          
          &.construction {
            background: #e8ffea;
            color: #00b42a;
          }
        }
      }
      
      .project-brand {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 10px;
      }
      
      .project-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .progress-bar {
          flex: 1;
          height: 4px;
          background: #f2f3f5;
          border-radius: 2px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #165dff, #4080ff);
            border-radius: 2px;
            transition: width 0.3s;
          }
        }
        
        .progress-text {
          font-size: 12px;
          font-weight: 500;
          color: #165dff;
        }
      }
      
      .project-actions {
        display: flex;
        gap: 10px;
        
        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 32px;
          background: #f7f8fa;
          border-radius: 16px;
          font-size: 12px;
          color: #4e5969;
          
          &.primary {
            background: linear-gradient(135deg, #165dff, #4080ff);
            color: #fff;
          }
        }
      }
    }
  }
}

.search-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .popup-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    
    .search-header {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      gap: 12px;
      border-bottom: 1px solid #f2f3f5;
      
      .search-input-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        background: #f2f3f5;
        border-radius: 20px;
        padding: 0 12px;
        height: 36px;
        
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
            color: #c9cdd4;
          }
        }
        
        .search-clear {
          color: #c9cdd4;
          font-size: 16px;
        }
      }
      
      .search-cancel {
        font-size: 14px;
        color: #4e5969;
      }
    }
    
    .search-result {
      flex: 1;
      overflow-y: auto;
      
      .result-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px 20px;
        gap: 12px;
        color: #c9cdd4;
        font-size: 14px;
      }
      
      .result-list {
        .result-item {
          padding: 14px 16px;
          border-bottom: 1px solid #f2f3f5;
          
          .item-name {
            font-size: 14px;
            color: #1d2129;
            margin-bottom: 4px;
          }
          
          .item-brand {
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }
  }
}

.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f2f3f5;
      
      .modal-title {
        font-size: 16px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .modal-close {
        color: #86909c;
        font-size: 20px;
      }
    }
    
    .store-detail-content {
      padding: 16px;
      
      .detail-row {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px solid #f2f3f5;
        
        .label {
          width: 80px;
          font-size: 14px;
          color: #86909c;
        }
        
        .value {
          flex: 1;
          font-size: 14px;
          color: #1d2129;
        }
      }
    }
    
    .manager-section {
      padding: 0 16px 20px;
      
      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 12px;
      }
      
      .manager-list {
        .manager-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          
          .manager-info {
            .manager-name {
              font-size: 14px;
              color: #1d2129;
              margin-bottom: 2px;
            }
            
            .manager-phone {
              font-size: 12px;
              color: #86909c;
            }
          }
          
          .manager-role {
            font-size: 12px;
            color: #165dff;
            background: #f0f5ff;
            padding: 2px 8px;
            border-radius: 10px;
          }
        }
      }
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
