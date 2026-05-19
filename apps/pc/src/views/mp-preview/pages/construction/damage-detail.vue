<template>
  <div class="mp-page damage-detail">
    <div class="page-header">
      <div class="header-left" @click="$emit('navigate', 'damage-list')">
        <icon-arrow-left class="back-icon" />
      </div>
      <div class="header-title">报损详情</div>
      <div class="header-right"></div>
    </div>
    
    <div class="detail-container">
      <div class="status-card" :class="damage.status">
        <div class="status-icon">
          <icon-check-circle v-if="damage.status === 'approved'" />
          <icon-close-circle v-else-if="damage.status === 'rejected'" />
          <icon-clock v-else />
        </div>
        <div class="status-info">
          <div class="status-text">{{ getStatusText(damage.status) }}</div>
          <div class="status-tip">{{ getStatusTip(damage.status) }}</div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-title">基本信息</div>
        <div class="info-list">
          <div class="info-row">
            <span class="label">报损单号</span>
            <span class="value">{{ damage.damageNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">关联订单</span>
            <span class="value">{{ damage.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间</span>
            <span class="value">{{ damage.createdAt }}</span>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-title">报损商品</div>
        <div class="product-info">
          <div class="product-image">
            <img :src="damage.productImage" :alt="damage.productName" />
          </div>
          <div class="product-detail">
            <div class="product-name">{{ damage.productName }}</div>
            <div class="product-spec">{{ damage.productSpec }}</div>
            <div class="product-qty">报损数量：<span class="highlight">{{ damage.damageQty }} {{ damage.unit }}</span></div>
            <div class="product-amount">报损金额：<span class="highlight">¥{{ damage.damageAmount }}</span></div>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-title">报损原因</div>
        <div class="reason-content">
          <div class="reason-tag" :class="damage.reasonType">
            {{ getReasonText(damage.reasonType) }}
          </div>
          <div class="reason-desc">{{ damage.reasonDesc }}</div>
        </div>
      </div>
      
      <div class="info-card" v-if="damage.images && damage.images.length > 0">
        <div class="card-title">凭证图片</div>
        <div class="image-grid">
          <div 
            class="image-item" 
            v-for="(img, index) in damage.images" 
            :key="index"
          >
            <img :src="img" :alt="'凭证' + (index + 1)" />
          </div>
        </div>
      </div>
      
      <div class="info-card" v-if="damage.status === 'approved' || damage.status === 'rejected'">
        <div class="card-title">处理结果</div>
        <div class="result-content">
          <div class="result-type" :class="damage.status">
            <template v-if="damage.processType === 'reissue'">
              <icon-refresh class="result-icon" />
              <span>补发处理</span>
            </template>
            <template v-else-if="damage.processType === 'refund'">
              <icon-wallet class="result-icon" />
              <span>退款处理</span>
            </template>
          </div>
          <div class="result-detail">{{ damage.processResult }}</div>
        </div>
      </div>
    </div>
    
    <div class="action-bar" v-if="damage.status === 'pending'">
      <a-button class="action-btn cancel" @click="handleCancel">取消申请</a-button>
      <a-button type="primary" class="action-btn" @click="handleContact">联系客服</a-button>
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
defineEmits(['navigate'])

const damage = {
  id: 1,
  damageNo: 'BS202401140002',
  orderNo: 'PO202401080005',
  productName: '黄砂 中砂',
  productSpec: '吨',
  productImage: 'https://picsum.photos/100/100?random=4',
  damageQty: 10,
  unit: '吨',
  damageAmount: '950',
  reasonType: 'quality',
  reasonDesc: '部分砂料含杂质过多，不符合施工要求，影响混凝土配比质量。已拍照取证，申请更换合格材料。',
  images: [
    'https://picsum.photos/200/200?random=4',
    'https://picsum.photos/200/200?random=5',
    'https://picsum.photos/200/200?random=6',
  ],
  status: 'approved',
  processType: 'reissue',
  processResult: '已补发10吨黄砂，预计3日内送达。补发订单号：PO202401150006',
  createdAt: '2024-01-14 10:20',
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    processing: '处理中',
  }
  return statusMap[status] || '未知状态'
}

function getStatusTip(status: string) {
  const tipMap: Record<string, string> = {
    pending: '平台正在审核您的报损申请，请耐心等待',
    approved: '报损申请已通过，平台正在处理',
    rejected: '报损申请未通过，可查看处理结果了解详情',
    processing: '处理中，请留意物流或账户变动',
  }
  return tipMap[status] || ''
}

function getReasonText(reason: string) {
  const reasonMap: Record<string, string> = {
    damage: '运输损坏',
    quality: '质量问题',
    wrong: '错发漏发',
    expired: '过期变质',
    other: '其他原因',
  }
  return reasonMap[reason] || '其他原因'
}

function handleCancel() {
  console.log('取消申请')
}

function handleContact() {
  console.log('联系客服')
}
</script>

<style lang="scss" scoped>
.damage-detail {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 110px;
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
  
  .back-icon {
    color: #fff;
    font-size: 20px;
  }
  
  .header-title {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
  }
}

.detail-container {
  padding: 54px 12px 12px;
}

.status-card {
  background: linear-gradient(135deg, #fff7e6, #fff0d6);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  
  &.approved {
    background: linear-gradient(135deg, #e8f5e9, #d8f8dc);
  }
  
  &.rejected {
    background: linear-gradient(135deg, #fff0f0, #ffe5e5);
  }
  
  .status-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      font-size: 28px;
      color: #ff7d00;
    }
    
    .approved & svg {
      color: #00b42a;
    }
    
    .rejected & svg {
      color: #f53f3f;
    }
  }
  
  .status-info {
    flex: 1;
    
    .status-text {
      font-size: 17px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 4px;
    }
    
    .status-tip {
      font-size: 13px;
      color: #86909c;
    }
  }
}

.info-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #165dff;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .label {
      font-size: 14px;
      color: #86909c;
    }
    
    .value {
      font-size: 14px;
      color: #1d2129;
    }
  }
}

.product-info {
  display: flex;
  gap: 14px;
  
  .product-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .product-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .product-name {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .product-spec {
      font-size: 13px;
      color: #86909c;
    }
    
    .product-qty, .product-amount {
      font-size: 13px;
      color: #4e5969;
      
      .highlight {
        font-weight: 600;
        color: #f53f3f;
      }
    }
  }
}

.reason-content {
  .reason-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    margin-bottom: 10px;
    background: #fff7e6;
    color: #ff7d00;
    
    &.quality {
      background: #fff0f0;
      color: #f53f3f;
    }
    
    &.wrong {
      background: #e6f7ff;
      color: #1890ff;
    }
    
    &.expired {
      background: #f9f0ff;
      color: #722ed1;
    }
    
    &.other {
      background: #f5f5f5;
      color: #86909c;
    }
  }
  
  .reason-desc {
    font-size: 14px;
    color: #4e5969;
    line-height: 1.6;
  }
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .image-item {
    width: calc(33.33% - 6px);
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.result-content {
  .result-type {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 13px;
    margin-bottom: 12px;
    
    .result-icon {
      font-size: 16px;
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
  
  .result-detail {
    font-size: 14px;
    color: #4e5969;
    line-height: 1.6;
  }
}

.action-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  
  .action-btn {
    flex: 1;
    height: 44px;
    border-radius: 22px;
    font-size: 15px;
    
    &.cancel {
      background: #f5f5f5;
      color: #4e5969;
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
