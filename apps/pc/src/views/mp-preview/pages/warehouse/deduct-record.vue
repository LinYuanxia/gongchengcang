<template>
  <div class="mp-page deduct-record">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'transaction')">
        <icon-left />
      </div>
      <div class="header-title">应扣记录</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="status-tabs">
      <div 
        class="status-tab" 
        :class="{ active: activeStatus === 'all' }"
        @click="activeStatus = 'all'"
      >全部</div>
      <div 
        class="status-tab" 
        :class="{ active: activeStatus === 'pending' }"
        @click="activeStatus = 'pending'"
      >待扣款</div>
      <div 
        class="status-tab" 
        :class="{ active: activeStatus === 'deducted' }"
        @click="activeStatus = 'deducted'"
      >已扣款</div>
    </div>
    
    <div class="record-list">
      <div 
        class="record-item" 
        v-for="record in filteredRecords" 
        :key="record.id"
        @click="goToDetail(record.id)"
      >
        <div class="record-status-bar" :class="record.status"></div>
        
        <div class="record-content">
          <div class="record-top">
            <div class="order-info">
              <span class="order-no">订单号: {{ record.orderNo }}</span>
              <span class="pay-no">支付号: {{ record.payNo }}</span>
            </div>
            <span class="record-status" :class="record.status">
              {{ getStatusText(record.status) }}
            </span>
          </div>
          
          <div class="record-middle">
            <div class="amount-info">
              <div class="amount-item">
                <span class="label">订单金额</span>
                <span class="value">¥{{ record.orderAmount }}</span>
              </div>
              <div class="amount-item">
                <span class="label">撮合费</span>
                <span class="value fee">¥{{ record.matchFee }}</span>
              </div>
            </div>
          </div>
          
          <div class="record-bottom">
            <div class="warehouse-info">
              <icon-storage />
              <span>{{ record.warehouseName }}</span>
            </div>
            <div class="arrow-wrap">
              <span class="record-time">{{ record.createTime }}</span>
              <icon-arrow-right />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeStatus = ref('all')

interface DeductRecord {
  id: string
  orderNo: string
  payNo: string
  orderAmount: string
  matchFee: string
  warehouseId: string
  warehouseName: string
  status: 'pending' | 'deducted'
  createTime: string
  deductTime?: string
}

const deductRecords = ref<DeductRecord[]>([
  {
    id: 'DR20240115001',
    orderNo: 'PO20240115001',
    payNo: 'PY20240115001',
    orderAmount: '58,000.00',
    matchFee: '580.00',
    warehouseId: 'WH001',
    warehouseName: '深圳福田仓',
    status: 'pending',
    createTime: '2024-01-15 14:30:00',
  },
  {
    id: 'DR20240112001',
    orderNo: 'PO20240112001',
    payNo: 'PY20240112001',
    orderAmount: '35,000.00',
    matchFee: '350.00',
    warehouseId: 'WH002',
    warehouseName: '广州白云仓',
    status: 'deducted',
    createTime: '2024-01-12 16:45:00',
    deductTime: '2024-01-12 17:00:00',
  },
  {
    id: 'DR20240110001',
    orderNo: 'PO20240110001',
    payNo: 'PY20240110001',
    orderAmount: '42,000.00',
    matchFee: '420.00',
    warehouseId: 'WH003',
    warehouseName: '东莞虎门仓',
    status: 'deducted',
    createTime: '2024-01-10 10:20:00',
    deductTime: '2024-01-10 10:30:00',
  },
  {
    id: 'DR20240108001',
    orderNo: 'PO20240108001',
    payNo: 'PY20240108001',
    orderAmount: '68,500.00',
    matchFee: '685.00',
    warehouseId: 'WH001',
    warehouseName: '深圳福田仓',
    status: 'pending',
    createTime: '2024-01-08 09:15:00',
  },
])

const filteredRecords = computed(() => {
  if (activeStatus.value === 'all') {
    return deductRecords.value
  }
  return deductRecords.value.filter(record => record.status === activeStatus.value)
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待扣款',
    deducted: '已扣款',
  }
  return statusMap[status] || status
}

function goToDetail(recordId: string) {
  emit('navigate', 'deduct-detail', { recordId })
}
</script>

<style lang="scss" scoped>
.deduct-record {
  background: #f5f5f5;
  min-height: 100%;
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
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
  
  .header-placeholder {
    width: 32px;
  }
}

.status-tabs {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid #e5e6eb;
  z-index: 99;
  
  .status-tab {
    flex: 1;
    padding: 8px 0;
    text-align: center;
    font-size: 13px;
    color: #86909c;
    background: #f7f8fa;
    border-radius: 8px;
    transition: all 0.2s;
    
    &.active {
      background: linear-gradient(135deg, #165dff, #4080ff);
      color: #fff;
    }
  }
}

.record-list {
  padding: 100px 12px 12px;
}

.record-item {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  
  .record-status-bar {
    height: 4px;
    
    &.pending {
      background: linear-gradient(90deg, #ff7d00, #ffb800);
    }
    
    &.deducted {
      background: linear-gradient(90deg, #00b42a, #52c41a);
    }
  }
  
  .record-content {
    padding: 16px;
    
    .record-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      
      .order-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .order-no, .pay-no {
          font-size: 12px;
          color: #86909c;
        }
      }
      
      .record-status {
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 10px;
        
        &.pending {
          background: #fff7e6;
          color: #ff7d00;
        }
        
        &.deducted {
          background: #e8ffea;
          color: #00b42a;
        }
      }
    }
    
    .record-middle {
      background: #f7f8fa;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      
      .amount-info {
        display: flex;
        justify-content: space-around;
        
        .amount-item {
          text-align: center;
          
          .label {
            font-size: 12px;
            color: #86909c;
            display: block;
            margin-bottom: 4px;
          }
          
          .value {
            font-size: 16px;
            font-weight: 600;
            color: #1d2129;
            
            &.fee {
              color: #f53f3f;
            }
          }
        }
      }
    }
    
    .record-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .warehouse-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #4e5969;
      }
      
      .arrow-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .record-time {
          font-size: 12px;
          color: #86909c;
        }
      }
    }
  }
}
</style>
