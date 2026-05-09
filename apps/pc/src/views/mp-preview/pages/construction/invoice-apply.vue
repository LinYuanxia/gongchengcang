<template>
  <div class="mp-page invoice-apply">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'invoice-manage')">
        <icon-left />
      </div>
      <div class="header-title">申请开票</div>
      <div class="header-action"></div>
    </div>
    
    <div class="apply-content">
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">选择订单</div>
          <div class="section-tip">请选择需要开票的订单</div>
        </div>
        
        <div class="order-list">
          <div class="order-item" v-for="item in orderList" :key="item.id" @click="toggleOrder(item)">
            <div class="checkbox" :class="{ checked: selectedOrders.includes(item.id) }">
              <icon-check v-if="selectedOrders.includes(item.id)" />
            </div>
            <div class="order-content">
              <div class="order-header">
                <div class="order-no">{{ item.orderNo }}</div>
                <div class="order-amount">¥{{ item.amount }}</div>
              </div>
              <div class="order-info">
                <div class="info-row">
                  <span class="label">下单时间</span>
                  <span class="value">{{ item.createTime }}</span>
                </div>
                <div class="info-row">
                  <span class="label">工程仓</span>
                  <span class="value">{{ item.warehouseName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">商品数量</span>
                  <span class="value">{{ item.productCount }}件</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="empty-state" v-if="orderList.length === 0">
            <icon-file-text class="empty-icon" />
            <div class="empty-text">暂无可开票订单</div>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-title">发票信息</div>
        
        <div class="form-item" @click="showTitlePicker = true">
          <div class="form-label">发票抬头 *</div>
          <div class="form-value">
            <span :class="{ placeholder: !selectedTitle }">{{ selectedTitle || '请选择发票抬头' }}</span>
            <icon-arrow-right class="arrow" />
          </div>
        </div>
        
        <div class="form-item">
          <div class="form-label">发票类型 *</div>
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
          <div class="form-label">收票邮箱 *</div>
          <input type="text" class="form-input" v-model="email" placeholder="请输入收票邮箱" />
        </div>
        
        <div class="form-item">
          <div class="form-label">备注</div>
          <textarea class="form-textarea" v-model="remark" placeholder="请输入备注信息（选填）"></textarea>
        </div>
      </div>
      
      <div class="apply-summary">
        <div class="summary-row">
          <span>已选订单</span>
          <span class="value">{{ selectedOrders.length }}个</span>
        </div>
        <div class="summary-row">
          <span>开票金额</span>
          <span class="value price">¥{{ totalAmount }}</span>
        </div>
      </div>
    </div>
    
    <div class="apply-footer">
      <div class="footer-info">
        <div class="total-label">开票金额</div>
        <div class="total-amount">¥{{ totalAmount }}</div>
      </div>
      <div class="submit-btn" :class="{ disabled: selectedOrders.length === 0 }" @click="handleSubmit">
        提交申请
      </div>
    </div>

    <div class="title-picker-modal" v-if="showTitlePicker" @click="showTitlePicker = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">选择发票抬头</div>
          <div class="modal-close" @click="showTitlePicker = false">
            <icon-close />
          </div>
        </div>
        <div class="modal-body">
          <div class="title-item" v-for="item in titleList" :key="item.id" @click="selectTitle(item)">
            <div class="title-radio" :class="{ checked: selectedTitleId === item.id }">
              <icon-check v-if="selectedTitleId === item.id" />
            </div>
            <div class="title-info">
              <div class="title-name">{{ item.titleName }}</div>
              <div class="title-tax">税号: {{ item.taxNo }}</div>
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

const showTitlePicker = ref(false)
const selectedOrders = ref<number[]>([])
const selectedTitle = ref('')
const selectedTitleId = ref<number | null>(null)
const invoiceType = ref('normal')
const email = ref('')
const remark = ref('')

const orderList = ref([
  {
    id: 1,
    orderNo: 'PO20240115001',
    amount: '35,000.00',
    createTime: '2024-01-15 10:30',
    warehouseName: '深圳宝安工程仓',
    productCount: 5
  },
  {
    id: 2,
    orderNo: 'PO20240112001',
    amount: '28,500.00',
    createTime: '2024-01-12 14:20',
    warehouseName: '深圳宝安工程仓',
    productCount: 3
  },
  {
    id: 3,
    orderNo: 'PO20240105001',
    amount: '18,600.00',
    createTime: '2024-01-05 09:15',
    warehouseName: '广州天河工程仓',
    productCount: 2
  },
  {
    id: 4,
    orderNo: 'PO20240118001',
    amount: '45,000.00',
    createTime: '2024-01-18 16:45',
    warehouseName: '深圳宝安工程仓',
    productCount: 8
  }
])

const titleList = ref([
  { id: 1, titleName: '深圳市建筑工程有限公司', taxNo: '91440300MA5F****' },
  { id: 2, titleName: '广州建设工程有限公司', taxNo: '91440100MA5E****' }
])

const totalAmount = computed(() => {
  const total = orderList.value
    .filter(item => selectedOrders.value.includes(item.id))
    .reduce((sum, item) => sum + parseFloat(item.amount.replace(/,/g, '')), 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

function toggleOrder(item: { id: number }) {
  const index = selectedOrders.value.indexOf(item.id)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  } else {
    selectedOrders.value.push(item.id)
  }
}

function selectTitle(item: any) {
  selectedTitleId.value = item.id
  selectedTitle.value = item.titleName
  showTitlePicker.value = false
}

function handleSubmit() {
  if (selectedOrders.value.length === 0) {
    return
  }
  
  if (!selectedTitle.value) {
    alert('请选择发票抬头')
    return
  }
  
  if (!email.value) {
    alert('请输入收票邮箱')
    return
  }
  
  alert('开票申请已提交')
  emit('navigate', 'invoice-manage')
}
</script>

<style lang="scss" scoped>
.invoice-apply {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 80px;
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
  }
}

.apply-content {
  padding: 56px 12px 12px;
}

.form-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .section-header {
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 4px;
  }
  
  .section-tip {
    font-size: 12px;
    color: #86909c;
  }
}

.order-list {
  .order-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
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
      flex-shrink: 0;
      margin-top: 2px;
      
      &.checked {
        background: #165dff;
        border-color: #165dff;
        color: #fff;
      }
    }
    
    .order-content {
      flex: 1;
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .order-no {
          font-size: 14px;
          color: #1d2129;
        }
        
        .order-amount {
          font-size: 15px;
          font-weight: 600;
          color: #f53f3f;
        }
      }
      
      .order-info {
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          
          .label {
            font-size: 12px;
            color: #86909c;
          }
          
          .value {
            font-size: 12px;
            color: #4e5969;
          }
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 0;
    
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

.form-item {
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .form-label {
    font-size: 14px;
    color: #1d2129;
    margin-bottom: 8px;
  }
  
  .form-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #1d2129;
    
    .placeholder {
      color: #c9cdd4;
    }
    
    .arrow {
      color: #c9cdd4;
    }
  }
  
  .form-input {
    width: 100%;
    height: 40px;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 14px;
    
    &::placeholder {
      color: #c9cdd4;
    }
  }
  
  .form-textarea {
    width: 100%;
    height: 80px;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    resize: none;
    
    &::placeholder {
      color: #c9cdd4;
    }
  }
  
  .radio-group {
    display: flex;
    gap: 12px;
    
    .radio-item {
      flex: 1;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e6eb;
      border-radius: 4px;
      font-size: 14px;
      color: #4e5969;
      
      &.active {
        background: #e8f3ff;
        border-color: #165dff;
        color: #165dff;
      }
    }
  }
}

.apply-summary {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .value {
      &.price {
        color: #f53f3f;
        font-weight: 500;
      }
    }
  }
}

.apply-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  
  .footer-info {
    .total-label {
      font-size: 12px;
      color: #86909c;
    }
    
    .total-amount {
      font-size: 20px;
      font-weight: 600;
      color: #f53f3f;
    }
  }
  
  .submit-btn {
    background: #165dff;
    color: #fff;
    padding: 10px 32px;
    border-radius: 20px;
    font-size: 15px;
    
    &.disabled {
      background: #c9cdd4;
    }
  }
}

.title-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  
  .modal-content {
    width: 100%;
    background: #fff;
    border-radius: 12px 12px 0 0;
    max-height: 60vh;
    
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
      padding: 12px;
      max-height: calc(60vh - 52px);
      overflow-y: auto;
      
      .title-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        background: #f7f8fa;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .title-radio {
          width: 20px;
          height: 20px;
          border: 1px solid #c9cdd4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.checked {
            background: #165dff;
            border-color: #165dff;
            color: #fff;
          }
        }
        
        .title-info {
          flex: 1;
          
          .title-name {
            font-size: 14px;
            color: #1d2129;
            margin-bottom: 4px;
          }
          
          .title-tax {
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }
  }
}
</style>