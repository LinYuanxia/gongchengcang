<template>
  <div class="mp-page stock-warning">
    <div class="page-header">
      <div class="header-title">库存预警</div>
    </div>
    
    <div class="warning-summary">
      <div class="summary-item">
        <div class="summary-icon warning">
          <icon-exclamation-polygon-fill />
        </div>
        <div class="summary-info">
          <div class="summary-value">{{ warningList.length }}</div>
          <div class="summary-label">预警商品</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon danger">
          <icon-close-circle-fill />
        </div>
        <div class="summary-info">
          <div class="summary-value">{{ outOfStockCount }}</div>
          <div class="summary-label">缺货商品</div>
        </div>
      </div>
    </div>
    
    <div class="warning-list">
      <div class="warning-item" v-for="item in warningList" :key="item.id">
        <div class="warning-header">
          <div class="product-info">
            <div class="product-name">{{ item.name }}</div>
            <div class="product-spec">{{ item.spec }}</div>
          </div>
          <div class="warning-level" :class="item.level">
            {{ getLevelText(item.level) }}
          </div>
        </div>
        
        <div class="warning-content">
          <div class="stock-info">
            <div class="info-row">
              <span class="label">当前库存</span>
              <span class="value" :class="{ danger: item.quantity <= 0 }">
                {{ item.quantity }} {{ item.unit }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">预警阈值</span>
              <span class="value">{{ item.warningThreshold }} {{ item.unit }}</span>
            </div>
            <div class="info-row">
              <span class="label">安全库存</span>
              <span class="value">{{ item.safeStock }} {{ item.unit }}</span>
            </div>
          </div>
          
          <div class="warning-message">
            <icon-info-circle />
            <span>{{ item.message }}</span>
          </div>
        </div>
        
        <div class="warning-actions">
          <div class="action-btn" @click="handleQuickPurchase(item)">快速补货</div>
          <div class="action-btn outline" @click="handleAdjust(item)">调整阈值</div>
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

const warningList = ref([
  {
    id: 1,
    name: '水泥 P.O 42.5',
    spec: '50kg/袋',
    quantity: 45,
    unit: '吨',
    warningThreshold: 50,
    safeStock: 100,
    level: 'warning',
    message: '库存已低于预警阈值，建议及时补货'
  },
  {
    id: 2,
    name: '螺纹钢 HRB400',
    spec: 'Φ12mm',
    quantity: 20,
    unit: '吨',
    warningThreshold: 50,
    safeStock: 80,
    level: 'danger',
    message: '库存严重不足，请立即补货'
  },
  {
    id: 3,
    name: '防水涂料',
    spec: 'JS型 20kg/桶',
    quantity: 0,
    unit: '桶',
    warningThreshold: 20,
    safeStock: 30,
    level: 'critical',
    message: '商品已缺货，请立即补货'
  },
  {
    id: 4,
    name: '建筑模板',
    spec: '1220×2440mm',
    quantity: 35,
    unit: '张',
    warningThreshold: 50,
    safeStock: 80,
    level: 'warning',
    message: '库存已低于预警阈值，建议及时补货'
  },
  {
    id: 5,
    name: '商品混凝土 C30',
    spec: '预拌',
    quantity: 15,
    unit: '方',
    warningThreshold: 30,
    safeStock: 50,
    level: 'danger',
    message: '库存严重不足，请立即补货'
  }
])

const outOfStockCount = computed(() => {
  return warningList.value.filter(item => item.quantity <= 0).length
})

function getLevelText(level: string) {
  const levelMap: Record<string, string> = {
    'warning': '低库存',
    'danger': '严重不足',
    'critical': '缺货'
  }
  return levelMap[level] || level
}

function handleQuickPurchase(item: any) {
  console.log('快速补货:', item.name)
}

function handleAdjust(item: any) {
  console.log('调整阈值:', item.name)
}
</script>

<style lang="scss" scoped>
.stock-warning {
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
  justify-content: center;
  z-index: 100;
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.warning-summary {
  display: flex;
  padding: 54px 12px 12px;
  gap: 12px;
}

.summary-item {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
  &.warning {
    background: #fff7e8;
    color: #ff7d00;
  }
  
  &.danger {
    background: #ffece8;
    color: #f53f3f;
  }
}

.summary-info {
  .summary-value {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
  }
  
  .summary-label {
    font-size: 12px;
    color: #86909c;
  }
}

.warning-list {
  padding: 12px;
}

.warning-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.warning-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  .product-info {
    .product-name {
      font-size: 15px;
      color: #1d2129;
      font-weight: 500;
    }
    
    .product-spec {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .warning-level {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    
    &.warning {
      background: #fff7e8;
      color: #ff7d00;
    }
    
    &.danger {
      background: #ffece8;
      color: #f53f3f;
    }
    
    &.critical {
      background: #f53f3f;
      color: #fff;
    }
  }
}

.warning-content {
  .stock-info {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      
      .label {
        font-size: 12px;
        color: #86909c;
      }
      
      .value {
        font-size: 12px;
        color: #1d2129;
        font-weight: 500;
        
        &.danger {
          color: #f53f3f;
        }
      }
    }
  }
  
  .warning-message {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    color: #ff7d00;
    
    :deep(.arco-icon) {
      margin-top: 2px;
    }
  }
}

.warning-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  
  .action-btn {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    border-radius: 4px;
    font-size: 13px;
    background: #165dff;
    color: #fff;
    
    &.outline {
      background: #fff;
      color: #165dff;
      border: 1px solid #165dff;
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
