<template>
  <div class="mp-page invoice-manage">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">发票管理</div>
      <div class="header-action" @click="handleApply">
        <icon-plus />
      </div>
    </div>
    
    <div class="status-tabs">
      <div class="tab-item" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
        发票列表
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'apply' }" @click="activeTab = 'apply'">
        申请开票
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'progress' }" @click="activeTab = 'progress'">
        开票进度
      </div>
    </div>
    
    <div class="tab-content">
      <template v-if="activeTab === 'list'">
        <div class="invoice-list">
          <div class="invoice-item" v-for="item in invoiceList" :key="item.id">
            <div class="invoice-header">
              <div class="invoice-no">发票号码: {{ item.invoiceNo }}</div>
              <div class="invoice-status" :class="item.status">{{ getStatusText(item.status) }}</div>
            </div>
            <div class="invoice-info">
              <div class="info-row">
                <span class="label">发票类型</span>
                <span class="value">{{ item.type }}</span>
              </div>
              <div class="info-row">
                <span class="label">发票金额</span>
                <span class="value price">¥{{ item.amount }}</span>
              </div>
              <div class="info-row">
                <span class="label">开票时间</span>
                <span class="value">{{ item.createTime }}</span>
              </div>
            </div>
            <div class="invoice-actions">
              <span class="action-btn" @click="handleDownload(item)" v-if="item.status === 'done'">
                <icon-download />
                下载
              </span>
            </div>
          </div>
        </div>
      </template>
      
      <template v-if="activeTab === 'apply'">
        <div class="apply-form">
          <div class="form-section">
            <div class="section-title">选择订单</div>
            <div class="order-list">
              <div class="order-item" v-for="item in orderList" :key="item.id" @click="toggleOrder(item)">
                <div class="checkbox" :class="{ checked: selectedOrders.includes(item.id) }">
                  <icon-check v-if="selectedOrders.includes(item.id)" />
                </div>
                <div class="order-info">
                  <div class="order-no">{{ item.orderNo }}</div>
                  <div class="order-amount">¥{{ item.amount }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-title">发票信息</div>
            <div class="form-item">
              <div class="form-label">发票抬头</div>
              <div class="form-value" @click="showTitlePicker = true">
                {{ selectedTitle || '请选择发票抬头' }}
                <icon-right class="arrow" />
              </div>
            </div>
            <div class="form-item">
              <div class="form-label">发票类型</div>
              <div class="form-value">
                <div class="radio-group">
                  <div class="radio-item" :class="{ active: invoiceType === 'normal' }" @click="invoiceType = 'normal'">
                    普票
                  </div>
                  <div class="radio-item" :class="{ active: invoiceType === 'special' }" @click="invoiceType = 'special'">
                    专票
                  </div>
                </div>
              </div>
            </div>
            <div class="form-item">
              <div class="form-label">收票邮箱</div>
              <input type="text" class="form-input" v-model="email" placeholder="请输入收票邮箱" />
            </div>
          </div>
          
          <div class="apply-summary">
            <div class="summary-row">
              <span>已选订单</span>
              <span>{{ selectedOrders.length }}个</span>
            </div>
            <div class="summary-row">
              <span>开票金额</span>
              <span class="price">¥{{ totalAmount }}</span>
            </div>
          </div>
          
          <div class="apply-btn" @click="submitApply">提交申请</div>
        </div>
      </template>
      
      <template v-if="activeTab === 'progress'">
        <div class="progress-list">
          <div class="progress-item" v-for="item in progressList" :key="item.id">
            <div class="progress-header">
              <div class="progress-no">申请单号: {{ item.applyNo }}</div>
              <div class="progress-status" :class="item.status">{{ getProgressStatus(item.status) }}</div>
            </div>
            <div class="progress-info">
              <div class="info-row">
                <span class="label">申请金额</span>
                <span class="value price">¥{{ item.amount }}</span>
              </div>
              <div class="info-row">
                <span class="label">申请时间</span>
                <span class="value">{{ item.createTime }}</span>
              </div>
              <div class="info-row" v-if="item.rejectReason">
                <span class="label">驳回原因</span>
                <span class="value danger">{{ item.rejectReason }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeTab = ref('list')

const invoiceList = ref([
  { id: 1, invoiceNo: 'FP202401150001', type: '增值税普通发票', amount: '35,000.00', createTime: '2024-01-15', status: 'done' },
  { id: 2, invoiceNo: 'FP202401100002', type: '增值税普通发票', amount: '28,500.00', createTime: '2024-01-10', status: 'done' },
  { id: 3, invoiceNo: 'FP202401050003', type: '增值税专用发票', amount: '18,600.00', createTime: '2024-01-05', status: 'done' }
])

const orderList = ref([
  { id: 1, orderNo: 'PO20240115001', amount: '35,000.00' },
  { id: 2, orderNo: 'PO20240112001', amount: '28,500.00' },
  { id: 3, orderNo: 'PO20240105001', amount: '18,600.00' }
])

const progressList = ref([
  { id: 1, applyNo: 'KP202401180001', amount: '45,000.00', createTime: '2024-01-18 10:30', status: 'pending' },
  { id: 2, applyNo: 'KP202401160001', amount: '28,500.00', createTime: '2024-01-16 14:20', status: 'processing' },
  { id: 3, applyNo: 'KP202401100001', amount: '18,600.00', createTime: '2024-01-10 09:15', status: 'rejected', rejectReason: '发票抬头信息不完整' }
])

const selectedOrders = ref<number[]>([])
const selectedTitle = ref('')
const invoiceType = ref('normal')
const email = ref('')
const showTitlePicker = ref(false)

const totalAmount = computed(() => {
  const total = orderList.value
    .filter(item => selectedOrders.value.includes(item.id))
    .reduce((sum, item) => sum + parseFloat(item.amount.replace(/,/g, '')), 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'done': '已开票',
    'pending': '待开票'
  }
  return statusMap[status] || status
}

function getProgressStatus(status: string) {
  const statusMap: Record<string, string> = {
    'pending': '待开票',
    'processing': '开票中',
    'done': '已开票',
    'rejected': '已驳回'
  }
  return statusMap[status] || status
}

function toggleOrder(item: { id: number }) {
  const index = selectedOrders.value.indexOf(item.id)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  } else {
    selectedOrders.value.push(item.id)
  }
}

function handleApply() {
  activeTab.value = 'apply'
}

function handleDownload(item: any) {
  console.log('下载发票:', item.invoiceNo)
}

function submitApply() {
  console.log('提交开票申请')
}
</script>

<style lang="scss" scoped>
.invoice-manage {
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
  }
  
  .header-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #165dff;
  }
}

.status-tabs {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  z-index: 99;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 14px;
    color: #4e5969;
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
        width: 24px;
        height: 2px;
        background: #165dff;
        border-radius: 1px;
      }
    }
  }
}

.tab-content {
  padding: 100px 12px 12px;
}

.invoice-list {
  .invoice-item {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .invoice-no {
        font-size: 13px;
        color: #1d2129;
      }
      
      .invoice-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        
        &.done {
          background: #e8ffea;
          color: #00b42a;
        }
        
        &.pending {
          background: #fff7e8;
          color: #ff7d00;
        }
      }
    }
    
    .invoice-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          font-size: 13px;
          color: #86909c;
        }
        
        .value {
          font-size: 13px;
          color: #1d2129;
          
          &.price {
            color: #f53f3f;
          }
        }
      }
    }
    
    .invoice-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f2f3f5;
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #165dff;
      }
    }
  }
}

.apply-form {
  .form-section {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
      margin-bottom: 12px;
    }
  }
  
  .order-list {
    .order-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f2f3f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .checkbox {
        width: 20px;
        height: 20px;
        border: 1px solid #c9cdd4;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.checked {
          background: #165dff;
          border-color: #165dff;
          color: #fff;
        }
      }
      
      .order-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        
        .order-no {
          font-size: 13px;
          color: #1d2129;
        }
        
        .order-amount {
          font-size: 13px;
          color: #f53f3f;
        }
      }
    }
  }
  
  .form-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f2f3f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .form-label {
      width: 80px;
      font-size: 14px;
      color: #1d2129;
    }
    
    .form-value {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 14px;
      color: #4e5969;
      
      .arrow {
        margin-left: 8px;
        color: #c9cdd4;
      }
    }
    
    .form-input {
      flex: 1;
      text-align: right;
      border: none;
      outline: none;
      font-size: 14px;
      
      &::placeholder {
        color: #c9cdd4;
      }
    }
  }
  
  .radio-group {
    display: flex;
    gap: 12px;
    
    .radio-item {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 13px;
      background: #f2f3f5;
      color: #4e5969;
      
      &.active {
        background: #165dff;
        color: #fff;
      }
    }
  }
}

.apply-summary {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .price {
      color: #f53f3f;
      font-weight: 500;
    }
  }
}

.apply-btn {
  background: #165dff;
  color: #fff;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
}

.progress-list {
  .progress-item {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .progress-no {
        font-size: 13px;
        color: #1d2129;
      }
      
      .progress-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        
        &.pending {
          background: #fff7e8;
          color: #ff7d00;
        }
        
        &.processing {
          background: #e8f3ff;
          color: #165dff;
        }
        
        &.done {
          background: #e8ffea;
          color: #00b42a;
        }
        
        &.rejected {
          background: #ffece8;
          color: #f53f3f;
        }
      }
    }
    
    .progress-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          font-size: 13px;
          color: #86909c;
        }
        
        .value {
          font-size: 13px;
          color: #1d2129;
          
          &.price {
            color: #f53f3f;
          }
          
          &.danger {
            color: #f53f3f;
          }
        }
      }
    }
  }
}
</style>
