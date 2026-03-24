<template>
  <div class="mp-page stock-check">
    <div class="page-header">
      <div class="header-title">库存盘点</div>
      <div class="header-action" @click="handleCreate">
        <icon-plus />
        <span>新建盘点</span>
      </div>
    </div>
    
    <div class="check-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        进行中
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        已完成
      </div>
    </div>
    
    <div class="check-list">
      <div class="check-item" v-for="item in filteredChecks" :key="item.id">
        <div class="check-header">
          <div class="check-info">
            <div class="check-no">{{ item.checkNo }}</div>
            <div class="check-time">{{ item.createTime }}</div>
          </div>
          <div class="check-status" :class="item.status">
            {{ getStatusText(item.status) }}
          </div>
        </div>
        
        <div class="check-content">
          <div class="summary-row">
            <div class="summary-item">
              <span class="label">盘点商品</span>
              <span class="value">{{ item.totalProducts }}种</span>
            </div>
            <div class="summary-item">
              <span class="label">盘盈</span>
              <span class="value profit">+{{ item.profitCount }}</span>
            </div>
            <div class="summary-item">
              <span class="label">盘亏</span>
              <span class="value loss">-{{ item.lossCount }}</span>
            </div>
          </div>
          
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
            <div class="progress-text">完成进度: {{ item.progress }}%</div>
          </div>
        </div>
        
        <div class="check-actions">
          <div class="action-btn" v-if="item.status === 'pending'" @click="handleContinue(item)">继续盘点</div>
          <div class="action-btn primary" v-if="item.status === 'pending'" @click="handleComplete(item)">完成盘点</div>
          <div class="action-btn" v-if="item.status === 'completed'" @click="handleViewDetail(item)">查看详情</div>
          <div class="action-btn" v-if="item.status === 'completed'" @click="handleExport(item)">导出报告</div>
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

const activeTab = ref('all')

const checkList = ref([
  {
    id: 1,
    checkNo: 'PD202401150001',
    createTime: '2024-01-15 09:00',
    status: 'pending',
    totalProducts: 156,
    profitCount: 3,
    lossCount: 5,
    progress: 65
  },
  {
    id: 2,
    checkNo: 'PD202401100001',
    createTime: '2024-01-10 14:30',
    status: 'completed',
    totalProducts: 156,
    profitCount: 8,
    lossCount: 12,
    progress: 100
  },
  {
    id: 3,
    checkNo: 'PD202401050001',
    createTime: '2024-01-05 10:00',
    status: 'completed',
    totalProducts: 156,
    profitCount: 5,
    lossCount: 7,
    progress: 100
  }
])

const filteredChecks = computed(() => {
  if (activeTab.value === 'all') {
    return checkList.value
  }
  return checkList.value.filter(item => item.status === activeTab.value)
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    'pending': '进行中',
    'completed': '已完成'
  }
  return map[status] || status
}

function handleCreate() {
  console.log('新建盘点')
}

function handleContinue(item: any) {
  console.log('继续盘点:', item.checkNo)
}

function handleComplete(item: any) {
  console.log('完成盘点:', item.checkNo)
}

function handleViewDetail(item: any) {
  console.log('查看详情:', item.checkNo)
}

function handleExport(item: any) {
  console.log('导出报告:', item.checkNo)
}
</script>

<style lang="scss" scoped>
.stock-check {
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

.check-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  margin-top: 44px;
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
  }
}

.check-list {
  padding: 12px;
}

.check-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.check-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  .check-info {
    .check-no {
      font-size: 14px;
      color: #1d2129;
      font-weight: 500;
    }
    
    .check-time {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .check-status {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    
    &.pending {
      background: #fff7e8;
      color: #ff7d00;
    }
    
    &.completed {
      background: #e8ffea;
      color: #00b42a;
    }
  }
}

.check-content {
  .summary-row {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    
    .summary-item {
      .label {
        font-size: 11px;
        color: #86909c;
        display: block;
      }
      
      .value {
        font-size: 14px;
        color: #1d2129;
        font-weight: 500;
        
        &.profit {
          color: #00b42a;
        }
        
        &.loss {
          color: #f53f3f;
        }
      }
    }
  }
  
  .progress-info {
    .progress-bar {
      height: 6px;
      background: #f2f3f5;
      border-radius: 3px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: #165dff;
        border-radius: 3px;
      }
    }
    
    .progress-text {
      font-size: 11px;
      color: #86909c;
      margin-top: 4px;
      text-align: right;
    }
  }
}

.check-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
  
  .action-btn {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    border-radius: 4px;
    font-size: 13px;
    background: #f2f3f5;
    color: #1d2129;
    
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
