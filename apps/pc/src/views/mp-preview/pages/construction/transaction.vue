<template>
  <div class="mp-page transaction">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">交易明细</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-item" :class="{ active: activeType === 'all' }" @click="activeType = 'all'">
        全部
      </div>
      <div class="filter-item" :class="{ active: activeType === 'in' }" @click="activeType = 'in'">
        收入
      </div>
      <div class="filter-item" :class="{ active: activeType === 'out' }" @click="activeType = 'out'">
        支出
      </div>
    </div>
    
    <div class="transaction-list">
      <div class="date-group" v-for="group in groupedTransactions" :key="group.date">
        <div class="date-header">{{ group.date }}</div>
        <div class="transaction-item" v-for="item in group.items" :key="item.id">
          <div class="transaction-left">
            <div class="transaction-icon" :class="item.type">
              <icon-import v-if="item.type === 'in'" />
              <icon-export v-else />
            </div>
            <div class="transaction-info">
              <div class="transaction-title">{{ item.title }}</div>
              <div class="transaction-desc">{{ item.desc }}</div>
              <div class="transaction-time">{{ item.time }}</div>
            </div>
          </div>
          <div class="transaction-right">
            <div class="transaction-amount" :class="item.type">
              {{ item.type === 'in' ? '+' : '-' }}¥{{ item.amount }}
            </div>
            <div class="transaction-balance">余额: ¥{{ item.balance }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeType = ref('all')

const allTransactions = ref([
  { id: 1, type: 'out', title: '订单支付', desc: '订单号: PO20240115001', time: '14:30', amount: '35,000.00', balance: '90,680.00', date: '2024-01-15' },
  { id: 2, type: 'in', title: '账户充值', desc: '微信充值', time: '10:20', amount: '50,000.00', balance: '125,680.00', date: '2024-01-14' },
  { id: 3, type: 'out', title: '订单支付', desc: '订单号: PO20240112001', time: '16:45', amount: '28,500.00', balance: '75,680.00', date: '2024-01-12' },
  { id: 4, type: 'in', title: '退款到账', desc: '订单退款: PO20240108001', time: '09:15', amount: '8,500.00', balance: '104,180.00', date: '2024-01-10' },
  { id: 5, type: 'out', title: '提现', desc: '提现至招商银行(尾号8888)', time: '11:30', amount: '20,000.00', balance: '95,680.00', date: '2024-01-08' },
  { id: 6, type: 'out', title: '订单支付', desc: '订单号: PO20240105001', time: '15:20', amount: '18,600.00', balance: '115,680.00', date: '2024-01-05' },
  { id: 7, type: 'in', title: '账户充值', desc: '支付宝充值', time: '14:00', amount: '30,000.00', balance: '134,280.00', date: '2024-01-03' }
])

const filteredTransactions = computed(() => {
  if (activeType.value === 'all') {
    return allTransactions.value
  }
  return allTransactions.value.filter(item => item.type === activeType.value)
})

const groupedTransactions = computed(() => {
  const groups: Record<string, typeof allTransactions.value> = {}
  filteredTransactions.value.forEach(item => {
    if (!groups[item.date]) {
      groups[item.date] = []
    }
    groups[item.date].push(item)
  })
  return Object.entries(groups).map(([date, items]) => ({ date, items }))
})
</script>

<style lang="scss" scoped>
.transaction {
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

.filter-bar {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 8px 16px;
  gap: 12px;
  border-bottom: 1px solid #e5e6eb;
  z-index: 99;
  
  .filter-item {
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 13px;
    color: #4e5969;
    background: #f2f3f5;
    
    &.active {
      background: #165dff;
      color: #fff;
    }
  }
}

.transaction-list {
  padding: 100px 12px 12px;
}

.date-group {
  margin-bottom: 12px;
  
  .date-header {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 8px;
    padding-left: 4px;
  }
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
      
      .transaction-desc {
        font-size: 11px;
        color: #86909c;
        margin-bottom: 2px;
      }
      
      .transaction-time {
        font-size: 11px;
        color: #c9cdd4;
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
    
    .transaction-balance {
      font-size: 11px;
      color: #86909c;
    }
  }
}
</style>
