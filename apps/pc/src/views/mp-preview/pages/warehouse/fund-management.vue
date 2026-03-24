<template>
  <div class="mp-page fund-management">
    <div class="page-header">
      <div class="header-title">资金管理</div>
    </div>
    
    <div class="balance-card">
      <div class="balance-header">
        <span class="balance-label">账户余额</span>
        <span class="eye-btn" @click="toggleBalance">
          <icon-eye v-if="showBalance" />
          <icon-eye-invisible v-else />
        </span>
      </div>
      <div class="balance-amount">
        <span class="currency">¥</span>
        <span class="amount">{{ showBalance ? balance : '****' }}</span>
      </div>
      <div class="balance-detail">
        <div class="detail-item">
          <span class="label">可用余额</span>
          <span class="value">{{ showBalance ? availableBalance : '****' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">冻结金额</span>
          <span class="value">{{ showBalance ? frozenAmount : '****' }}</span>
        </div>
      </div>
      <div class="balance-actions">
        <div class="action-item" @click="handleRecharge">
          <icon-plus />
          <span>充值</span>
        </div>
        <div class="action-item" @click="handleWithdraw">
          <icon-export />
          <span>提现</span>
        </div>
        <div class="action-item" @click="handleRecords">
          <icon-file />
          <span>明细</span>
        </div>
      </div>
    </div>
    
    <div class="quick-section">
      <div class="section-title">快捷功能</div>
      <div class="quick-grid">
        <div class="quick-item" @click="handlePayOrder">
          <icon-credit-card class="quick-icon" style="color: #165dff" />
          <span class="quick-text">支付采购款</span>
        </div>
        <div class="quick-item" @click="handleBankCard">
          <icon-bank-card class="quick-icon" style="color: #00b42a" />
          <span class="quick-text">银行卡管理</span>
        </div>
        <div class="quick-item" @click="handleTransaction">
          <icon-swap class="quick-icon" style="color: #ff7d00" />
          <span class="quick-text">交易记录</span>
        </div>
        <div class="quick-item" @click="handleStatement">
          <icon-file-text class="quick-icon" style="color: #722ed1" />
          <span class="quick-text">对账单</span>
        </div>
      </div>
    </div>
    
    <div class="transaction-section">
      <div class="section-header">
        <span class="section-title">最近交易</span>
        <span class="section-more" @click="handleRecords">查看全部</span>
      </div>
      <div class="transaction-list">
        <div class="transaction-item" v-for="item in transactions" :key="item.id">
          <div class="transaction-icon" :class="item.type">
            <icon-arrow-rise v-if="item.type === 'income'" />
            <icon-arrow-fall v-else />
          </div>
          <div class="transaction-info">
            <div class="transaction-title">{{ item.title }}</div>
            <div class="transaction-time">{{ item.time }}</div>
          </div>
          <div class="transaction-amount" :class="item.type">
            {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}
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
import { ref } from 'vue'

defineEmits(['navigate'])

const showBalance = ref(true)
const balance = ref('158,520.00')
const availableBalance = ref('146,520.00')
const frozenAmount = ref('12,000.00')

const transactions = ref([
  {
    id: 1,
    type: 'income',
    title: '销售收款',
    time: '2024-01-15 14:30',
    amount: '4,500.00'
  },
  {
    id: 2,
    type: 'expense',
    title: '采购付款',
    time: '2024-01-15 10:20',
    amount: '8,400.00'
  },
  {
    id: 3,
    type: 'income',
    title: '销售收款',
    time: '2024-01-14 16:45',
    amount: '21,000.00'
  },
  {
    id: 4,
    type: 'expense',
    title: '提现',
    time: '2024-01-13 09:15',
    amount: '50,000.00'
  }
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

function handleRecords() {
  console.log('明细')
}

function handlePayOrder() {
  console.log('支付采购款')
}

function handleBankCard() {
  console.log('银行卡管理')
}

function handleTransaction() {
  console.log('交易记录')
}

function handleStatement() {
  console.log('对账单')
}
</script>

<style lang="scss" scoped>
.fund-management {
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

.balance-card {
  margin: 54px 16px 12px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .balance-label {
    font-size: 14px;
    opacity: 0.9;
  }
  
  .eye-btn {
    padding: 4px;
  }
}

.balance-amount {
  margin-bottom: 16px;
  
  .currency {
    font-size: 18px;
  }
  
  .amount {
    font-size: 32px;
    font-weight: 600;
  }
}

.balance-detail {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  
  .detail-item {
    .label {
      font-size: 12px;
      opacity: 0.8;
      display: block;
    }
    
    .value {
      font-size: 14px;
      font-weight: 500;
      margin-top: 4px;
    }
  }
}

.balance-actions {
  display: flex;
  gap: 12px;
  
  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    
    span {
      font-size: 12px;
      margin-top: 4px;
    }
  }
}

.quick-section {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #1d2129;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

.quick-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.quick-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.quick-text {
  font-size: 12px;
  color: #1d2129;
}

.transaction-section {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-more {
  font-size: 12px;
  color: #86909c;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.transaction-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  
  &.income {
    background: #e8ffea;
    color: #00b42a;
  }
  
  &.expense {
    background: #ffece8;
    color: #f53f3f;
  }
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-size: 14px;
  color: #1d2129;
}

.transaction-time {
  font-size: 11px;
  color: #86909c;
  margin-top: 2px;
}

.transaction-amount {
  font-size: 14px;
  font-weight: 500;
  
  &.income {
    color: #00b42a;
  }
  
  &.expense {
    color: #f53f3f;
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
