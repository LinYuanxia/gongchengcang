<template>
  <div class="mp-page deduct-detail">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'deduct-record')">
        <icon-left />
      </div>
      <div class="header-title">应扣明细</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="detail-content">
      <div class="record-header">
        <div class="header-row">
          <span class="label">应扣记录ID</span>
          <span class="value">{{ recordInfo.id }}</span>
        </div>
        <div class="header-row">
          <span class="label">订单编码</span>
          <span class="value">{{ recordInfo.orderNo }}</span>
        </div>
        <div class="header-row">
          <span class="label">支付编号</span>
          <span class="value">{{ recordInfo.payNo }}</span>
        </div>
        <div class="header-row">
          <span class="label">订单金额</span>
          <span class="value amount">¥{{ recordInfo.orderAmount }}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <div class="section-title">
          <icon-list-check />
          应扣明细（商品视角）
        </div>
        
        <div class="detail-list">
          <div class="detail-item" v-for="item in detailList" :key="item.id">
            <div class="item-header">
              <span class="detail-id">明细ID: {{ item.id }}</span>
              <span class="share-ratio">分账系数: {{ (item.shareRatio * 100).toFixed(1) }}%</span>
            </div>
            
            <div class="item-content">
              <div class="product-info">
                <div class="product-icon">
                  <icon-package />
                </div>
                <div class="product-detail">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-spec">{{ item.productSpec }}</div>
                  <div class="product-meta">
                    <span>数量: {{ item.quantity }}</span>
                    <span>单价: ¥{{ item.unitPrice }}</span>
                  </div>
                </div>
              </div>
              
              <div class="item-amount">
                <div class="amount-label">应扣金额</div>
                <div class="amount-value">¥{{ item.deductAmount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="summary-section">
        <div class="summary-row">
          <span class="label">商品总数</span>
          <span class="value">{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-row">
          <span class="label">明细条数</span>
          <span class="value">{{ detailList.length }} 条</span>
        </div>
        <div class="summary-row total">
          <span class="label">合计应扣金额</span>
          <span class="value">¥{{ totalDeductAmount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineEmits(['navigate'])

interface DeductDetailItem {
  id: string
  recordId: string
  productId: string
  productName: string
  productSpec: string
  quantity: number
  unitPrice: string
  shareRatio: number
  deductAmount: string
}

const recordInfo = ref({
  id: 'DR20240115001',
  orderNo: 'PO20240115001',
  payNo: 'PY20240115001',
  orderAmount: '58,000.00',
})

const detailList = ref<DeductDetailItem[]>([
  {
    id: 'DD20240115001001',
    recordId: 'DR20240115001',
    productId: 'P001',
    productName: '乳胶漆',
    productSpec: '5L/桶',
    quantity: 10,
    unitPrice: '280.00',
    shareRatio: 0.02,
    deductAmount: '56.00',
  },
  {
    id: 'DD20240115001002',
    recordId: 'DR20240115001',
    productId: 'P002',
    productName: '地砖',
    productSpec: '600*600mm',
    quantity: 80,
    unitPrice: '85.00',
    shareRatio: 0.01,
    deductAmount: '68.00',
  },
  {
    id: 'DD20240115001003',
    recordId: 'DR20240115001',
    productId: 'P003',
    productName: '实木地板',
    productSpec: '1215*165*18mm',
    quantity: 50,
    unitPrice: '220.00',
    shareRatio: 0.015,
    deductAmount: '165.00',
  },
  {
    id: 'DD20240115001004',
    recordId: 'DR20240115001',
    productId: 'P004',
    productName: '卫浴套装',
    productSpec: '马桶+洗手盆+花洒',
    quantity: 3,
    unitPrice: '2,800.00',
    shareRatio: 0.025,
    deductAmount: '210.00',
  },
  {
    id: 'DD20240115001005',
    recordId: 'DR20240115001',
    productId: 'P005',
    productName: '电线电缆',
    productSpec: 'BV2.5mm²',
    quantity: 500,
    unitPrice: '3.80',
    shareRatio: 0.01,
    deductAmount: '190.00',
  },
])

const totalQuantity = computed(() => {
  return detailList.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalDeductAmount = computed(() => {
  const total = detailList.value.reduce((sum, item) => {
    return sum + parseFloat(item.deductAmount.replace(',', ''))
  }, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})
</script>

<style lang="scss" scoped>
.deduct-detail {
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

.detail-content {
  padding: 60px 12px 12px;
}

.record-header {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
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
      
      &.amount {
        font-size: 16px;
        font-weight: 600;
        color: #165dff;
      }
    }
  }
}

.detail-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .detail-list {
    .detail-item {
      background: #f7f8fa;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        
        .detail-id {
          font-size: 12px;
          color: #86909c;
        }
        
        .share-ratio {
          font-size: 12px;
          color: #165dff;
          font-weight: 500;
        }
      }
      
      .item-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .product-info {
          display: flex;
          gap: 10px;
          flex: 1;
          
          .product-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #165dff, #4080ff);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }
          
          .product-detail {
            flex: 1;
            
            .product-name {
              font-size: 14px;
              font-weight: 500;
              color: #1d2129;
              margin-bottom: 4px;
            }
            
            .product-spec {
              font-size: 12px;
              color: #86909c;
              margin-bottom: 6px;
            }
            
            .product-meta {
              display: flex;
              gap: 12px;
              font-size: 12px;
              color: #4e5969;
            }
          }
        }
        
        .item-amount {
          text-align: right;
          
          .amount-label {
            font-size: 12px;
            color: #86909c;
            display: block;
            margin-bottom: 2px;
          }
          
          .amount-value {
            font-size: 16px;
            font-weight: 600;
            color: #f53f3f;
          }
        }
      }
    }
  }
}

.summary-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    
    &:not(:last-child) {
      border-bottom: 1px dashed #e5e6eb;
    }
    
    &.total {
      padding-top: 12px;
      
      .label {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .value {
        font-size: 18px;
        font-weight: 600;
        color: #f53f3f;
      }
    }
    
    .label {
      font-size: 13px;
      color: #86909c;
    }
    
    .value {
      font-size: 13px;
      color: #1d2129;
    }
  }
}
</style>
