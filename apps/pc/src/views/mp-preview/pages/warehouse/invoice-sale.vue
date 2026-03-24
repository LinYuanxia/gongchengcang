<template>
  <div class="mp-page invoice-sale">
    <div class="page-header">
      <div class="header-title">销项发票</div>
      <div class="header-action" @click="handleCreate">
        <icon-plus />
        <span>开票</span>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-item" @click="showDatePicker = true">
        <icon-calendar />
        <span>{{ dateRangeText }}</span>
        <icon-down />
      </div>
      <div class="filter-item" @click="showStatusPicker = true">
        <icon-filter />
        <span>{{ statusText }}</span>
        <icon-down />
      </div>
    </div>
    
    <div class="invoice-list">
      <div class="invoice-item" v-for="item in invoices" :key="item.id">
        <div class="invoice-header">
          <div class="invoice-info">
            <div class="invoice-no">{{ item.invoiceNo }}</div>
            <div class="invoice-time">{{ item.createTime }}</div>
          </div>
          <div class="invoice-status" :class="item.status">
            {{ getStatusText(item.status) }}
          </div>
        </div>
        
        <div class="invoice-content">
          <div class="customer-info">
            <span class="label">购买方:</span>
            <span class="value">{{ item.buyer }}</span>
          </div>
          
          <div class="invoice-details">
            <div class="detail-row">
              <span class="label">关联订单</span>
              <span class="value">{{ item.orderNo }}</span>
            </div>
            <div class="detail-row">
              <span class="label">发票金额</span>
              <span class="value highlight">¥{{ item.amount }}</span>
            </div>
            <div class="detail-row">
              <span class="label">发票类型</span>
              <span class="value">{{ item.type }}</span>
            </div>
            <div class="detail-row">
              <span class="label">开票日期</span>
              <span class="value">{{ item.invoiceDate }}</span>
            </div>
          </div>
        </div>
        
        <div class="invoice-footer">
          <div class="footer-left">
            <span class="tax-no">税号: {{ item.taxNo }}</span>
          </div>
          <div class="footer-right">
            <span class="action-btn" v-if="item.status === 'pending'" @click="handleCancel(item)">作废</span>
            <span class="action-btn" @click="handleViewDetail(item)">查看详情</span>
            <span class="action-btn primary" v-if="item.status === 'completed'" @click="handleDownload(item)">下载</span>
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
const showStatusPicker = ref(false)
const dateRange = ref('week')
const invoiceStatus = ref('all')

const dateRangeText = computed(() => {
  const map: Record<string, string> = {
    'week': '近一周',
    'month': '近一月',
    'quarter': '近三月'
  }
  return map[dateRange.value] || '近一周'
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    'all': '全部状态',
    'pending': '待开票',
    'completed': '已开票',
    'cancelled': '已作废'
  }
  return map[invoiceStatus.value] || '全部状态'
})

const invoices = ref([
  {
    id: 1,
    invoiceNo: 'XS202401150001',
    createTime: '2024-01-15 14:30',
    status: 'completed',
    buyer: '深圳建设集团有限公司',
    orderNo: 'SO2024010012',
    amount: '4,500.00',
    type: '增值税专用发票',
    invoiceDate: '2024-01-15',
    taxNo: '91440300XXXXXXXXXX'
  },
  {
    id: 2,
    invoiceNo: 'XS202401140002',
    createTime: '2024-01-14 10:20',
    status: 'completed',
    buyer: '广州建筑有限公司',
    orderNo: 'SO2024010011',
    amount: '21,000.00',
    type: '增值税普通发票',
    invoiceDate: '2024-01-14',
    taxNo: '91440100XXXXXXXXXX'
  },
  {
    id: 3,
    invoiceNo: 'XS202401130003',
    createTime: '2024-01-13 16:45',
    status: 'pending',
    buyer: '东莞工程公司',
    orderNo: 'SO2024010010',
    amount: '21,000.00',
    type: '增值税专用发票',
    invoiceDate: '-',
    taxNo: '91441900XXXXXXXXXX'
  }
])

function getStatusText(status: string) {
  const map: Record<string, string> = {
    'pending': '待开票',
    'completed': '已开票',
    'cancelled': '已作废'
  }
  return map[status] || status
}

function handleCreate() {
  console.log('开票')
}

function handleCancel(item: any) {
  console.log('作废:', item.invoiceNo)
}

function handleViewDetail(item: any) {
  console.log('查看详情:', item.invoiceNo)
}

function handleDownload(item: any) {
  console.log('下载:', item.invoiceNo)
}
</script>

<style lang="scss" scoped>
.invoice-sale {
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

.invoice-list {
  padding: 0 12px 12px;
}

.invoice-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  .invoice-info {
    .invoice-no {
      font-size: 14px;
      color: #1d2129;
      font-weight: 500;
    }
    
    .invoice-time {
      font-size: 11px;
      color: #86909c;
      margin-top: 2px;
    }
  }
  
  .invoice-status {
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
    
    &.cancelled {
      background: #f2f3f5;
      color: #86909c;
    }
  }
}

.invoice-content {
  .customer-info {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    
    .label {
      font-size: 12px;
      color: #86909c;
    }
    
    .value {
      font-size: 13px;
      color: #1d2129;
      font-weight: 500;
    }
  }
  
  .invoice-details {
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

.invoice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f2f3f5;
  
  .tax-no {
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
