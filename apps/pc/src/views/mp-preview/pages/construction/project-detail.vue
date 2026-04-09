<template>
  <div class="mp-page project-detail">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'project-list')">
        <icon-left />
      </div>
      <div class="header-title">项目详情</div>
    </div>
    
    <div class="info-card">
      <div class="info-header">
        <div class="store-name">{{ projectInfo.storeName }}</div>
        <div class="project-status" :class="projectInfo.status">
          {{ projectInfo.statusText }}
        </div>
      </div>
      <div class="info-row">
        <span class="label">品牌</span>
        <span class="value">{{ projectInfo.brand }}</span>
      </div>
      <div class="info-row">
        <span class="label">项目地址</span>
        <span class="value">{{ projectInfo.address }}</span>
      </div>
      <div class="info-row">
        <span class="label">项目经理</span>
        <span class="value">{{ projectInfo.manager }}</span>
      </div>
      <div class="info-row">
        <span class="label">联系电话</span>
        <span class="value">{{ projectInfo.phone }}</span>
      </div>
      <div class="info-row">
        <span class="label">开工日期</span>
        <span class="value">{{ projectInfo.startDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">预计完工</span>
        <span class="value">{{ projectInfo.planEndDate }}</span>
      </div>
    </div>
    
    <div class="progress-card" v-if="projectInfo.status === 'construction'">
      <div class="card-title">施工进度</div>
      <div class="progress-main">
        <div class="progress-circle">
          <svg viewBox="0 0 100 100">
            <circle class="progress-bg" cx="50" cy="50" r="40"></circle>
            <circle class="progress-bar" cx="50" cy="50" r="40" 
              :style="{ strokeDasharray: '251.2', strokeDashoffset: 251.2 - (projectInfo.progress / 100 * 251.2) }">
            </circle>
          </svg>
          <div class="progress-text">{{ projectInfo.progress }}%</div>
        </div>
      </div>
    </div>
    
    <div class="upload-section">
      <div class="section-title">图纸上传</div>
      
      <div class="upload-group">
        <div class="group-title">
          <icon-file-image />
          <span>原始框架图</span>
        </div>
        <div class="upload-list">
          <div class="upload-item" v-for="(img, index) in frameImages" :key="index">
            <img :src="img" alt="" />
            <div class="delete-btn" @click="handleDeleteFrame(index)">
              <icon-close />
            </div>
          </div>
          <div class="upload-btn" v-if="frameImages.length < 5" @click="handleUploadFrame">
            <icon-plus />
            <span>添加图片</span>
          </div>
        </div>
      </div>
      
      <div class="upload-group">
        <div class="group-title">
          <icon-file-image />
          <span>复尺图</span>
        </div>
        <div class="upload-list">
          <div class="upload-item" v-for="(img, index) in measureImages" :key="index">
            <img :src="img" alt="" />
            <div class="delete-btn" @click="handleDeleteMeasure(index)">
              <icon-close />
            </div>
          </div>
          <div class="upload-btn" v-if="measureImages.length < 5" @click="handleUploadMeasure">
            <icon-plus />
            <span>添加图片</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <div class="action-btn" @click="$emit('navigate', 'market', { projectId: projectInfo.id })">
        <icon-shopping-cart />
        <span>材料下单</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const projectInfo = ref({
  id: 1,
  storeName: '星巴克深圳万象城店',
  brand: '星巴克',
  status: 'construction',
  statusText: '施工中',
  address: '深圳市罗湖区万象城3楼301铺',
  manager: '李经理',
  phone: '13800138000',
  startDate: '2024-03-15',
  planEndDate: '2024-05-30',
  progress: 57,
})

const frameImages = ref([
  'https://picsum.photos/200/200?random=301',
  'https://picsum.photos/200/200?random=302',
])

const measureImages = ref([
  'https://picsum.photos/200/200?random=303',
])

function handleUploadFrame() {
  frameImages.value.push('https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000))
}

function handleDeleteFrame(index: number) {
  frameImages.value.splice(index, 1)
}

function handleUploadMeasure() {
  measureImages.value.push('https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000))
}

function handleDeleteMeasure(index: number) {
  measureImages.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.project-detail {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 70px;
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
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid #e5e6eb;
  
  .header-back {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
    margin-right: 32px;
  }
}

.info-card {
  background: #fff;
  margin: 56px 12px 12px;
  border-radius: 8px;
  padding: 16px;
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;
    
    .store-name {
      font-size: 16px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .project-status {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      
      &.pending-survey {
        background: #fff7e8;
        color: #ff7d00;
      }
      
      &.pending-construction {
        background: #f0f5ff;
        color: #165dff;
      }
      
      &.construction {
        background: #e8fff3;
        color: #00b42a;
      }
      
      &.completed {
        background: #f2f3f5;
        color: #86909c;
      }
    }
  }
  
  .info-row {
    display: flex;
    padding: 8px 0;
    
    .label {
      width: 80px;
      font-size: 13px;
      color: #86909c;
    }
    
    .value {
      flex: 1;
      font-size: 13px;
      color: #1d2129;
    }
  }
}

.progress-card {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 8px;
  padding: 16px;
  
  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 16px;
  }
  
  .progress-main {
    display: flex;
    justify-content: center;
    
    .progress-circle {
      width: 120px;
      height: 120px;
      position: relative;
      
      svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        
        .progress-bg {
          fill: none;
          stroke: #f2f3f5;
          stroke-width: 8;
        }
        
        .progress-bar {
          fill: none;
          stroke: linear-gradient(90deg, #165dff, #4080ff);
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s;
        }
      }
      
      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        font-weight: 600;
        color: #165dff;
      }
    }
  }
}

.upload-section {
  background: #fff;
  margin: 0 12px;
  border-radius: 8px;
  padding: 16px;
  
  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 16px;
  }
  
  .upload-group {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .group-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #4e5969;
      margin-bottom: 12px;
    }
    
    .upload-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      
      .upload-item {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .delete-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 20px;
          height: 20px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
        }
      }
      
      .upload-btn {
        width: 80px;
        height: 80px;
        border: 1px dashed #c9cdd4;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #86909c;
        font-size: 11px;
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 16px;
  border-top: 1px solid #e5e6eb;
  
  .action-btn {
    width: 100%;
    height: 44px;
    background: linear-gradient(90deg, #165dff, #4080ff);
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
  }
}
</style>
