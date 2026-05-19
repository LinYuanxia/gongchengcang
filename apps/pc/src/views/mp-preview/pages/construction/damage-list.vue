<template>
  <div class="mp-page damage-list">
    <div class="page-header">
      <div class="header-left" @click="$emit('navigate', 'mine')">
        <icon-arrow-left class="back-icon" />
      </div>
      <div class="header-title">报损管理</div>
      <div class="header-right" @click="handleApply">
        <icon-plus class="add-icon" />
      </div>
    </div>
    
    <div class="status-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'all' }"
        @click="activeStatus = 'all'"
      >
        全部
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'pending' }"
        @click="activeStatus = 'pending'"
      >
        待审核
        <span class="badge" v-if="statusCount.pending > 0">{{ statusCount.pending }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'approved' }"
        @click="activeStatus = 'approved'"
      >
        已通过
        <span class="badge" v-if="statusCount.approved > 0">{{ statusCount.approved }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeStatus === 'rejected' }"
        @click="activeStatus = 'rejected'"
      >
        已拒绝
        <span class="badge" v-if="statusCount.rejected > 0">{{ statusCount.rejected }}</span>
      </div>
    </div>
    
    <div class="damage-list-container">
      <div 
        class="damage-item" 
        v-for="item in filteredDamages" 
        :key="item.id"
        @click="handleDetail(item)"
      >
        <div class="damage-header">
          <div class="damage-no">{{ item.damageNo }}</div>
          <div class="damage-status" :class="item.status">{{ getStatusText(item.status) }}</div>
        </div>
        
        <div class="damage-info">
          <div class="info-row">
            <span class="label">订单号</span>
            <span class="value">{{ item.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">报损商品</span>
            <span class="value">{{ item.productName }}</span>
          </div>
          <div class="info-row">
            <span class="label">报损数量</span>
            <span class="value highlight">{{ item.damageQty }} {{ item.unit }}</span>
          </div>
          <div class="info-row">
            <span class="label">报损金额</span>
            <span class="value highlight">¥{{ item.damageAmount }}</span>
          </div>
          <div class="info-row">
            <span class="label">报损原因</span>
            <span class="value">{{ item.reason }}</span>
          </div>
        </div>
        
        <div class="damage-images" v-if="item.images && item.images.length > 0">
          <div 
            class="image-item" 
            v-for="(img, index) in item.images.slice(0, 3)" 
            :key="index"
          >
            <img :src="img" :alt="'凭证' + (index + 1)" />
          </div>
          <div class="image-more" v-if="item.images.length > 3">
            +{{ item.images.length - 3 }}
          </div>
        </div>
        
        <div class="damage-footer">
          <span class="create-time">{{ item.createdAt }}</span>
          <div class="actions" v-if="item.status === 'pending'">
            <span class="action-btn" @click.stop="handleCancel(item)">取消</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-if="filteredDamages.length === 0">
      <icon-file />
      <span>暂无报损记录</span>
      <a-button type="primary" @click="handleApply" class="apply-btn">发起报损</a-button>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
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
      <div class="tabbar-item active">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineEmits(['navigate'])

const activeStatus = ref('all')

const statusCount = ref({
  pending: 2,
  approved: 3,
  rejected: 1,
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    processing: '处理中',
  }
  return statusMap[status] || '未知状态'
}

const damages = ref([
  {
    id: 1,
    damageNo: 'BS202401150001',
    orderNo: 'PO202401100004',
    productName: '防水涂料 K11',
    damageQty: 5,
    unit: '桶',
    damageAmount: '1,400',
    reason: '运输过程中包装破损，导致材料泄漏',
    images: [
      'https://picsum.photos/100/100?random=1',
      'https://picsum.photos/100/100?random=2',
      'https://picsum.photos/100/100?random=3',
    ],
    status: 'pending',
    createdAt: '2024-01-15 14:30',
    processResult: '',
  },
  {
    id: 2,
    damageNo: 'BS202401140002',
    orderNo: 'PO202401080005',
    productName: '黄砂 中砂',
    damageQty: 10,
    unit: '吨',
    damageAmount: '950',
    reason: '部分砂料含杂质过多，不符合施工要求',
    images: [
      'https://picsum.photos/100/100?random=4',
      'https://picsum.photos/100/100?random=5',
    ],
    status: 'approved',
    createdAt: '2024-01-14 10:20',
    processResult: '已补发10吨黄砂，预计3日内送达',
  },
  {
    id: 3,
    damageNo: 'BS202401120003',
    orderNo: 'PO202401050003',
    productName: 'BV铜芯线 2.5mm²',
    damageQty: 2,
    unit: '卷',
    damageAmount: '370',
    reason: '线材外皮破损，存在安全隐患',
    images: [
      'https://picsum.photos/100/100?random=6',
    ],
    status: 'approved',
    createdAt: '2024-01-12 16:45',
    processResult: '已退款¥370至账户余额',
  },
  {
    id: 4,
    damageNo: 'BS202401100004',
    orderNo: 'PO202401030002',
    productName: '水泥 P.O 42.5',
    damageQty: 3,
    unit: '袋',
    damageAmount: '1,050',
    reason: '水泥结块，无法使用',
    images: [
      'https://picsum.photos/100/100?random=7',
      'https://picsum.photos/100/100?random=8',
    ],
    status: 'rejected',
    createdAt: '2024-01-10 09:15',
    processResult: '经核实，结块为正常运输现象，不影响使用',
  },
])

const filteredDamages = computed(() => {
  if (activeStatus.value === 'all') return damages.value
  return damages.value.filter(d => d.status === activeStatus.value)
})

function handleApply() {
  emit('navigate', 'damage-apply')
}

function handleDetail(item: any) {
  emit('navigate', 'damage-detail')
}

function handleCancel(item: any) {
  console.log('取消报损', item)
}
</script>

<style lang="scss" scoped>
.damage-list {
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
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-left, .header-right {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-icon, .add-icon {
    color: #fff;
    font-size: 20px;
  }
  
  .header-title {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
  }
}

.status-tabs {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  padding: 10px 12px;
  gap: 12px;
  z-index: 99;
  border-bottom: 1px solid #f2f3f5;
  
  .tab-item {
    flex-shrink: 0;
    padding: 6px 14px;
    font-size: 13px;
    color: #4e5969;
    background: #f5f5f5;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    .badge {
      background: #f53f3f;
      color: #fff;
      font-size: 10px;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    
    &.active {
      background: linear-gradient(135deg, #165dff, #4080ff);
      color: #fff;
      
      .badge {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.damage-list-container {
  padding: 100px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  .damage-item {
    background: #fff;
    border-radius: 10px;
    padding: 14px;
    
    .damage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .damage-no {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
      }
      
      .damage-status {
        font-size: 12px;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 12px;
        
        &.pending {
          background: #fff7e6;
          color: #ff7d00;
        }
        
        &.approved {
          background: #e8f5e9;
          color: #00b42a;
        }
        
        &.rejected {
          background: #fff0f0;
          color: #f53f3f;
        }
      }
    }
    
    .damage-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .label {
          font-size: 13px;
          color: #86909c;
        }
        
        .value {
          font-size: 13px;
          color: #1d2129;
          text-align: right;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          
          &.highlight {
            font-weight: 600;
            color: #f53f3f;
          }
        }
      }
    }
    
    .damage-images {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      
      .image-item {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .image-more {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #86909c;
      }
    }
    
    .damage-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f2f3f5;
      
      .create-time {
        font-size: 12px;
        color: #86909c;
      }
      
      .actions {
        display: flex;
        gap: 10px;
        
        .action-btn {
          padding: 4px 12px;
          font-size: 12px;
          color: #f53f3f;
          border: 1px solid #f53f3f;
          border-radius: 12px;
        }
      }
    }
  }
}

.empty-state {
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #c9cdd4;
  font-size: 14px;
  
  .apply-btn {
    margin-top: 20px;
    width: 160px;
    height: 40px;
    border-radius: 20px;
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
