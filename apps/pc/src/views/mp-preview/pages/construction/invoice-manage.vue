<template>
  <div class="mp-page invoice-manage">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">发票管理</div>
      <div class="header-actions">
        <div class="header-action" @click="handleTitle">
          <icon-file />
          <span>发票抬头</span>
        </div>
        <div class="header-action primary" @click="handleApply">
          <icon-plus />
        </div>
      </div>
    </div>
    
    <div class="status-tabs">
      <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        全部发票
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'processing' }" @click="activeTab = 'processing'">
        开票中
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'done' }" @click="activeTab = 'done'">
        已开票
      </div>
    </div>
    
    <div class="tab-content">
      <div class="invoice-list">
        <div class="invoice-item" v-for="item in filteredInvoiceList" :key="item.id">
          <div class="invoice-header">
            <div class="invoice-no">发票号码: {{ item.invoiceNo }}</div>
            <div class="invoice-status" :class="item.status">{{ getStatusText(item.status) }}</div>
          </div>
          <div class="invoice-info">
            <div class="info-row">
              <span class="label">关联订单</span>
              <span class="value order-link">{{ item.orderNo }}</span>
            </div>
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
            <span class="action-btn" @click="handleViewInvoice(item)" v-if="item.status === 'done'">
              <icon-eye />
              查看发票
            </span>
            <span class="action-btn" @click="handleViewOrder(item)">
              <icon-file-text />
              查看订单
            </span>
            <span class="action-btn" @click="handleDownload(item)" v-if="item.status === 'done'">
              <icon-download />
              下载
            </span>
          </div>
        </div>
        
        <div class="empty-state" v-if="filteredInvoiceList.length === 0">
          <icon-file-text class="empty-icon" />
          <div class="empty-text">暂无发票记录</div>
        </div>
      </div>
    </div>

    <div class="invoice-modal" v-if="showInvoiceModal" @click="showInvoiceModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">发票预览</div>
          <div class="modal-close" @click="showInvoiceModal = false">
            <icon-close />
          </div>
        </div>
        <div class="modal-body">
          <div class="invoice-image-wrap">
            <img :src="currentInvoiceImage" alt="发票图片" class="invoice-image" />
          </div>
          <div class="invoice-info-card">
            <div class="info-row">
              <span class="label">发票号码</span>
              <span class="value">{{ currentInvoice?.invoiceNo }}</span>
            </div>
            <div class="info-row">
              <span class="label">发票类型</span>
              <span class="value">{{ currentInvoice?.type }}</span>
            </div>
            <div class="info-row">
              <span class="label">发票金额</span>
              <span class="value price">¥{{ currentInvoice?.amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">关联订单</span>
              <span class="value order-link">{{ currentInvoice?.orderNo }}</span>
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

const activeTab = ref('all')

const invoiceList = ref([
  { id: 1, invoiceNo: 'FP202401150001', orderNo: 'PO20240115001', type: '增值税普通发票', amount: '35,000.00', createTime: '2024-01-15', status: 'done', invoiceImage: 'https://picsum.photos/800/600?random=1' },
  { id: 2, invoiceNo: 'FP202401100002', orderNo: 'PO20240112001', type: '增值税普通发票', amount: '28,500.00', createTime: '2024-01-10', status: 'done', invoiceImage: 'https://picsum.photos/800/600?random=2' },
  { id: 3, invoiceNo: 'FP202401050003', orderNo: 'PO20240105001', type: '增值税专用发票', amount: '18,600.00', createTime: '2024-01-05', status: 'done', invoiceImage: 'https://picsum.photos/800/600?random=3' },
  { id: 4, invoiceNo: 'FP202401180001', orderNo: 'PO20240118001', type: '增值税普通发票', amount: '45,000.00', createTime: '2024-01-18', status: 'processing', invoiceImage: '' },
  { id: 5, invoiceNo: 'FP202401170001', orderNo: 'PO20240117001', type: '增值税专用发票', amount: '52,000.00', createTime: '2024-01-17', status: 'processing', invoiceImage: '' },
])

const filteredInvoiceList = computed(() => {
  if (activeTab.value === 'all') {
    return invoiceList.value
  }
  return invoiceList.value.filter(item => item.status === activeTab.value)
})

const showInvoiceModal = ref(false)
const currentInvoice = ref<any>(null)
const currentInvoiceImage = ref('')

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'done': '已开票',
    'processing': '开票中'
  }
  return statusMap[status] || status
}

function handleTitle() {
  emit('navigate', 'invoice-title')
}

function handleApply() {
  emit('navigate', 'invoice-apply')
}

function handleViewInvoice(item: any) {
  currentInvoice.value = item
  currentInvoiceImage.value = item.invoiceImage
  showInvoiceModal.value = true
}

function handleViewOrder(item: any) {
  emit('navigate', 'bom-detail')
}

function handleDownload(item: any) {
  console.log('下载发票:', item.invoiceNo)
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
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .header-action {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #4e5969;
      padding: 4px 8px;
      
      &.primary {
        width: 32px;
        height: 32px;
        background: #165dff;
        color: #fff;
        border-radius: 50%;
        justify-content: center;
        padding: 0;
      }
    }
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
        
        &.processing {
          background: #e8f3ff;
          color: #165dff;
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
          
          &.order-link {
            color: #165dff;
          }
        }
      }
    }
    
    .invoice-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
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
  
  .empty-state {
    text-align: center;
    padding: 60px 0;
    
    .empty-icon {
      font-size: 48px;
      color: #c9cdd4;
    }
    
    .empty-text {
      margin-top: 12px;
      font-size: 14px;
      color: #86909c;
    }
  }
}

.invoice-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    width: 90%;
    max-width: 480px;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f2f3f5;
      
      .modal-title {
        font-size: 16px;
        font-weight: 500;
      }
      
      .modal-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #86909c;
      }
    }
    
    .modal-body {
      padding: 16px;
      
      .invoice-image-wrap {
        margin-bottom: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        justify-content: center;
        
        .invoice-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 4px;
        }
      }
      
      .invoice-info-card {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 12px;
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e6eb;
          
          &:last-child {
            border-bottom: none;
          }
          
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
            
            &.order-link {
              color: #165dff;
            }
          }
        }
      }
    }
  }
}
</style>