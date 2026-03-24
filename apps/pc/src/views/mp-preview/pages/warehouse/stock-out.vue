<template>
  <div class="mp-page stock-out">
    <div class="page-header">
      <div class="header-title">出库记录</div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-item" @click="showDatePicker = true">
        <icon-calendar />
        <span>{{ dateRangeText }}</span>
        <icon-down />
      </div>
      <div class="filter-item" @click="showTypePicker = true">
        <icon-filter />
        <span>{{ typeText }}</span>
        <icon-down />
      </div>
    </div>
    
    <div class="record-list">
      <div class="record-item" v-for="item in records" :key="item.id">
        <div class="record-header">
          <div class="record-no">{{ item.orderNo }}</div>
          <div class="record-type" :class="item.type">{{ getTypeText(item.type) }}</div>
        </div>
        
        <div class="record-content">
          <div class="product-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-spec">{{ item.spec }}</div>
          </div>
          
          <div class="record-details">
            <div class="detail-row">
              <span class="label">出库数量</span>
              <span class="value highlight">-{{ item.quantity }} {{ item.unit }}</span>
            </div>
            <div class="detail-row">
              <span class="label">客户</span>
              <span class="value">{{ item.customer }}</span>
            </div>
            <div class="detail-row">
              <span class="label">出库时间</span>
              <span class="value">{{ item.createTime }}</span>
            </div>
            <div class="detail-row">
              <span class="label">操作员</span>
              <span class="value">{{ item.operator }}</span>
            </div>
          </div>
        </div>
        
        <div class="record-footer">
          <div class="footer-left">
            <span class="related-order">关联订单: {{ item.relatedOrder }}</span>
          </div>
          <div class="footer-right">
            <span class="view-btn" @click="handleViewDetail(item)">查看详情</span>
          </div>
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

const showDatePicker = ref(false)
const showTypePicker = ref(false)
const dateRange = ref('week')
const recordType = ref('all')

const dateRangeText = computed(() => {
  const map: Record<string, string> = {
    'week': '近一周',
    'month': '近一月',
    'quarter': '近三月'
  }
  return map[dateRange.value] || '近一周'
})

const typeText = computed(() => {
  const map: Record<string, string> = {
    'all': '全部类型',
    'sale': '销售出库',
    'transfer': '调拨出库',
    'loss': '损耗出库'
  }
  return map[recordType.value] || '全部类型'
})

const records = ref([
  {
    id: 1,
    orderNo: 'CK202401150001',
    type: 'sale',
    productName: '水泥 P.O 42.5',
    spec: '50kg/袋',
    quantity: 10,
    unit: '吨',
    customer: '深圳建设集团',
    createTime: '2024-01-15 14:30',
    operator: '张三',
    relatedOrder: 'SO2024010012'
  },
  {
    id: 2,
    orderNo: 'CK202401140002',
    type: 'sale',
    productName: '螺纹钢 HRB400',
    spec: 'Φ12mm',
    quantity: 5,
    unit: '吨',
    customer: '广州建筑公司',
    createTime: '2024-01-14 10:20',
    operator: '李四',
    relatedOrder: 'SO2024010011'
  },
  {
    id: 3,
    orderNo: 'CK202401130003',
    type: 'loss',
    productName: '防水涂料',
    spec: 'JS型 20kg/桶',
    quantity: 2,
    unit: '桶',
    customer: '-',
    createTime: '2024-01-13 16:45',
    operator: '张三',
    relatedOrder: '-'
  },
  {
    id: 4,
    orderNo: 'CK202401120004',
    type: 'sale',
    productName: '黄沙',
    spec: '中粗砂',
    quantity: 50,
    unit: '方',
    customer: '东莞工程公司',
    createTime: '2024-01-12 09:15',
    operator: '王五',
    relatedOrder: 'SO2024010010'
  }
])

function getTypeText(type: string) {
  const map: Record<string, string> = {
    'sale': '销售出库',
    'transfer': '调拨出库',
    'loss': '损耗出库'
  }
  return map[type] || type
}

function handleViewDetail(item: any) {
  console.log('查看详情:', item.orderNo)
}
</script>

<style lang="scss" scoped>
.stock-out {
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

.filter-bar {
  display: flex;
  gap: 8px;
  padding: 54px 12px 12px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fff;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
}

.record-list {
  padding: 0 12px 12px;
}

.record-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .record-no {
    font-size: 14px;
    color: #1d2129;
    font-weight: 500;
  }
  
  .record-type {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    
    &.sale {
      background: #e8ffea;
      color: #00b42a;
    }
    
    &.transfer {
      background: #f2e8ff;
      color: #722ed1;
    }
    
    &.loss {
      background: #ffece8;
      color: #f53f3f;
    }
  }
}

.record-content {
  .product-info {
    margin-bottom: 10px;
    
    .product-name {
      font-size: 15px;
      color: #1d2129;
    }
    
    .product-spec {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .record-details {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 10px;
    
    .detail-row {
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
        
        &.highlight {
          color: #f53f3f;
          font-weight: 500;
        }
      }
    }
  }
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f2f3f5;
  
  .related-order {
    font-size: 11px;
    color: #86909c;
  }
  
  .view-btn {
    font-size: 12px;
    color: #165dff;
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
