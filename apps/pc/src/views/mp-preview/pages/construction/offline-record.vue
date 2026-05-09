<template>
  <div class="mp-page offline-record">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'transaction')">
        <icon-left />
      </div>
      <div class="header-title">线下转正记录</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="status-tabs">
      <div 
        class="status-tab" 
        :class="{ active: activeStatus === 'pending' }"
        @click="activeStatus = 'pending'"
      >待审核</div>
      <div 
        class="status-tab" 
        :class="{ active: activeStatus === 'approved' }"
        @click="activeStatus = 'approved'"
      >已通过</div>
      <div 
        class="status-tab" 
        :class="{ active: activeStatus === 'rejected' }"
        @click="activeStatus = 'rejected'"
      >已拒绝</div>
    </div>
    
    <div class="record-list">
      <div class="record-item" v-for="record in filteredRecords" :key="record.id">
        <div class="record-header">
          <span class="record-id">记录ID: {{ record.id }}</span>
          <span class="record-status" :class="record.status">
            {{ getStatusText(record.status) }}
          </span>
        </div>
        
        <div class="record-info">
          <div class="info-row">
            <span class="label">转账金额</span>
            <span class="value amount">¥{{ record.amount }}</span>
          </div>
          <div class="info-row">
            <span class="label">转账银行</span>
            <span class="value">{{ record.bankName }}</span>
          </div>
          <div class="info-row">
            <span class="label">账户名</span>
            <span class="value">{{ record.accountName }}</span>
          </div>
          <div class="info-row">
            <span class="label">银行卡号</span>
            <span class="value">{{ record.accountNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">转账时间</span>
            <span class="value">{{ record.transferTime }}</span>
          </div>
          <div class="info-row" v-if="record.auditTime">
            <span class="label">审核时间</span>
            <span class="value">{{ record.auditTime }}</span>
          </div>
          <div class="info-row" v-if="record.auditRemark">
            <span class="label">审核备注</span>
            <span class="value remark">{{ record.auditRemark }}</span>
          </div>
        </div>
        
        <div class="voucher-section">
          <div class="voucher-title">转账凭证</div>
          <div class="voucher-image" @click="previewVoucher(record.voucherUrl)">
            <img :src="record.voucherUrl" :alt="record.id" />
          </div>
        </div>
        
        <div class="record-actions" v-if="record.status === 'rejected'">
          <div class="reupload-btn" @click="handleReupload(record)">
            <icon-upload />
            重新上传凭证
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeStatus = ref('pending')

interface OfflineRecord {
  id: string
  amount: string
  bankName: string
  accountName: string
  accountNo: string
  transferTime: string
  voucherUrl: string
  status: 'pending' | 'approved' | 'rejected'
  auditTime?: string
  auditRemark?: string
}

const offlineRecords = ref<OfflineRecord[]>([
  {
    id: 'OR20240115001',
    amount: '50,000.00',
    bankName: '招商银行',
    accountName: '张三',
    accountNo: '6225****8888',
    transferTime: '2024-01-15 14:30:00',
    voucherUrl: 'https://picsum.photos/400/200?random=voucher1',
    status: 'pending',
  },
  {
    id: 'OR20240114001',
    amount: '30,000.00',
    bankName: '工商银行',
    accountName: '张三',
    accountNo: '6222****6666',
    transferTime: '2024-01-14 10:20:00',
    voucherUrl: 'https://picsum.photos/400/200?random=voucher2',
    status: 'approved',
    auditTime: '2024-01-14 11:30:00',
  },
  {
    id: 'OR20240113001',
    amount: '20,000.00',
    bankName: '建设银行',
    accountName: '张三',
    accountNo: '6227****9999',
    transferTime: '2024-01-13 09:15:00',
    voucherUrl: 'https://picsum.photos/400/200?random=voucher3',
    status: 'rejected',
    auditTime: '2024-01-13 10:00:00',
    auditRemark: '凭证模糊，请重新上传',
  },
  {
    id: 'OR20240112001',
    amount: '80,000.00',
    bankName: '农业银行',
    accountName: '张三',
    accountNo: '6228****7777',
    transferTime: '2024-01-12 16:45:00',
    voucherUrl: 'https://picsum.photos/400/200?random=voucher4',
    status: 'approved',
    auditTime: '2024-01-12 17:30:00',
  },
])

const filteredRecords = computed(() => {
  return offlineRecords.value.filter(record => record.status === activeStatus.value)
})

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return statusMap[status] || status
}

function previewVoucher(url: string) {
  alert(`查看凭证: ${url}`)
}

function handleReupload(record: OfflineRecord) {
  alert(`重新上传凭证: ${record.id}`)
}
</script>

<style lang="scss" scoped>
.offline-record {
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
  padding: 16px;
  margin-bottom: 12px;
  
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    .record-id {
      font-size: 12px;
      color: #86909c;
    }
    
    .record-status {
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 10px;
      
      &.pending {
        background: #fff7e6;
        color: #ff7d00;
      }
      
      &.approved {
        background: #e8ffea;
        color: #00b42a;
      }
      
      &.rejected {
        background: #fff2f0;
        color: #f53f3f;
      }
    }
  }
  
  .record-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      
      .label {
        font-size: 13px;
        color: #86909c;
      }
      
      .value {
        font-size: 13px;
        color: #1d2129;
        
        &.amount {
          font-size: 16px;
          font-weight: 600;
          color: #165dff;
        }
        
        &.remark {
          color: #f53f3f;
        }
      }
    }
  }
  
  .voucher-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    
    .voucher-title {
      font-size: 13px;
      color: #86909c;
      margin-bottom: 10px;
    }
    
    .voucher-image {
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 120px;
        object-fit: cover;
      }
    }
  }
  
  .record-actions {
    margin-top: 16px;
    
    .reupload-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      background: linear-gradient(135deg, #165dff, #4080ff);
      color: #fff;
      border-radius: 8px;
      font-size: 14px;
    }
  }
}
</style>
