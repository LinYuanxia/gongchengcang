<template>
  <div class="mp-page fund-management">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">账户余额</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="balance-card">
      <div class="balance-header">
        <span class="balance-label">可用余额（元）</span>
        <icon-eye class="eye-icon" @click="toggleBalance" v-if="showBalance" />
        <icon-eye-invisible class="eye-icon" @click="toggleBalance" v-else />
      </div>
      <div class="balance-amount">
        <span v-if="showBalance">¥{{ balance }}</span>
        <span v-else>****</span>
      </div>
      <div class="balance-frozen">
        <span>冻结金额：¥{{ frozenAmount }}</span>
      </div>
      <div class="balance-actions">
        <div class="action-btn" @click="handleRecharge">
          <icon-plus-circle />
          <span>充值</span>
        </div>
        <div class="action-btn" @click="handleWithdraw">
          <icon-export />
          <span>提现</span>
        </div>
      </div>
    </div>
    
    <div class="quick-actions">
      <div class="action-item" @click="$emit('navigate', 'transaction')">
        <icon-file-text class="action-icon" />
        <span>交易明细</span>
      </div>
      <div class="action-item" @click="$emit('navigate', 'bank-card')">
        <icon-credit-card class="action-icon" />
        <span>银行卡管理</span>
      </div>
    </div>
    
    <div class="section-header">
      <span class="section-title">最近交易</span>
      <span class="section-more" @click="$emit('navigate', 'transaction')">查看全部</span>
    </div>
    
    <div class="transaction-list">
      <div class="transaction-item" v-for="item in transactions" :key="item.id">
        <div class="transaction-left">
          <div class="transaction-icon" :class="item.type">
            <icon-import v-if="item.type === 'in'" />
            <icon-export v-else />
          </div>
          <div class="transaction-info">
            <div class="transaction-title">{{ item.title }}</div>
            <div class="transaction-time">{{ item.time }}</div>
          </div>
        </div>
        <div class="transaction-right">
          <div class="transaction-amount" :class="item.type">
            {{ item.type === 'in' ? '+' : '-' }}¥{{ item.amount }}
          </div>
          <div class="transaction-status">{{ item.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const showBalance = ref(true)
const balance = ref('125,680.00')
const frozenAmount = ref('15,000.00')

const transactions = ref([
  { id: 1, type: 'out', title: '订单支付', time: '2024-01-15 14:30', amount: '35,000.00', status: '已完成' },
  { id: 2, type: 'in', title: '账户充值', time: '2024-01-14 10:20', amount: '50,000.00', status: '已完成' },
  { id: 3, type: 'out', title: '订单支付', time: '2024-01-12 16:45', amount: '28,500.00', status: '已完成' },
  { id: 4, type: 'in', title: '退款到账', time: '2024-01-10 09:15', amount: '8,500.00', status: '已完成' }
])

function toggleBalance() {
  showBalance.value = !showBalance.value
}

function handleRecharge() {
  console.log('充值')
}

function handleWithdraw() {
  console.log('提现')
}
</script>

<style lang="scss" scoped>
.fund-management {
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
  
  .header-placeholder {
    width: 32px;
  }
}

.balance-card {
  margin: 54px 12px 12px;
  background: linear-gradient(135deg, #165dff, #4080ff);
  border-radius: 8px;
  padding: 20px;
  color: #fff;
  
  .balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .balance-label {
      font-size: 13px;
      opacity: 0.9;
    }
    
    .eye-icon {
      font-size: 18px;
      opacity: 0.8;
    }
  }
  
  .balance-amount {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .balance-frozen {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 16px;
  }
  
  .balance-actions {
    display: flex;
    gap: 12px;
    
    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      font-size: 14px;
    }
  }
}

.quick-actions {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 0 12px 12px;
  
  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .action-icon {
      font-size: 24px;
      color: #165dff;
    }
    
    span {
      font-size: 12px;
      color: #4e5969;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 8px;
  
  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
  }
  
  .section-more {
    font-size: 12px;
    color: #165dff;
  }
}

.transaction-list {
  padding: 0 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  
  .transaction-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .transaction-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f2f3f5;
      
      &.in {
        background: #e8ffea;
        color: #00b42a;
      }
      
      &.out {
        background: #ffece8;
        color: #f53f3f;
      }
    }
    
    .transaction-info {
      .transaction-title {
        font-size: 14px;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .transaction-time {
        font-size: 11px;
        color: #86909c;
      }
    }
  }
  
  .transaction-right {
    text-align: right;
    
    .transaction-amount {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 4px;
      
      &.in {
        color: #00b42a;
      }
      
      &.out {
        color: #f53f3f;
      }
    }
    
    .transaction-status {
      font-size: 11px;
      color: #86909c;
    }
  }
}
</style>
