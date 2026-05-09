<template>
  <div class="mp-page project-detail">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'index')">
        <icon-left />
      </div>
      <div class="header-title">项目详情</div>
    </div>
    
    <div class="project-cover">
      <img :src="projectInfo.coverImage" :alt="projectInfo.storeName" />
      <div class="cover-overlay">
        <div class="project-status-wrap">
          <span class="primary-status" :class="projectInfo.primaryStatus">{{ getPrimaryStatusText(projectInfo.primaryStatus) }}</span>
          <span class="secondary-status" :class="projectInfo.secondaryStatus">{{ getSecondaryStatusText(projectInfo.secondaryStatus) }}</span>
        </div>
      </div>
    </div>
    
    <div class="info-card">
      <div class="info-header">
        <div class="store-name">
          <span class="brand-icon" :class="getBrandClass(projectInfo.brand)">
            <svg v-if="getBrandIcon(projectInfo.brand) === 'icon-coffee'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            <svg v-else-if="getBrandIcon(projectInfo.brand) === 'icon-wine'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7h-9"/>
              <path d="M11 20H7a1 1 0 0 1-1-1v-3H5a1 1 0 0 1-1-1v-7a4 4 0 0 1 8 0v10a1 1 0 0 1-1 1h-1"/>
              <path d="M11 7h6a1 1 0 0 1 1 1v3"/>
              <path d="M11 11h5"/>
            </svg>
            <svg v-else-if="getBrandIcon(projectInfo.brand) === 'icon-cup-soda'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 21h10"/>
              <path d="M8 21V5a4 4 0 0 1 8 0v16"/>
              <path d="M6 8h12"/>
            </svg>
            <svg v-else-if="getBrandIcon(projectInfo.brand) === 'icon-leaf'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7"/>
              <path d="M9 12l3-3 3 3"/>
            </svg>
            <svg v-else class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18"/>
              <path d="M19 21V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v13"/>
              <path d="M9 21V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v16"/>
            </svg>
          </span>
          {{ projectInfo.storeName }}
        </div>
        <div class="store-code">{{ projectInfo.code }}</div>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">工程类型</div>
          <div class="info-value">{{ projectInfo.projectType }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">门店地址</div>
          <div class="info-value">{{ projectInfo.address }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">项目经理</div>
          <div class="info-value">{{ projectInfo.manager }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">工程监理</div>
          <div class="info-value supervisor-row">
            <span>{{ projectInfo.supervisor }}</span>
            <span class="call-btn" @click="handleCallSupervisor">
              <icon-phone />
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">监理电话</div>
          <div class="info-value">{{ projectInfo.supervisorPhone }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">联系电话</div>
          <div class="info-value">{{ projectInfo.phone }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">开工日期</div>
          <div class="info-value">{{ projectInfo.startDate }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">预计完工</div>
          <div class="info-value">{{ projectInfo.planEndDate }}</div>
        </div>
      </div>
    </div>
    
    <div class="bom-section">
      <div class="section-header">
        <span class="section-title">BOM基装包</span>
        <span class="section-more" @click="handleBomOrder">快捷下单</span>
      </div>
      <div class="bom-list">
        <div class="bom-card" v-for="bom in bomPackages" :key="bom.id" @click="handleBomDetail(bom)">
          <div class="bom-image">
            <img :src="bom.image" :alt="bom.name" />
          </div>
          <div class="bom-info">
            <div class="bom-name">{{ bom.name }}</div>
            <div class="bom-spec">{{ bom.spec }}</div>
            <div class="bom-items">包含 {{ bom.itemCount }} 种材料</div>
            <div class="bom-footer">
              <span class="bom-price">¥{{ bom.price }}起</span>
              <span class="bom-btn" @click.stop="handleBomOrder">下单</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="upload-section">
      <div class="section-header">
        <span class="section-title">图纸上传</span>
      </div>
      
      <div class="upload-group">
        <div class="group-header">
          <div class="group-title">
            <icon-file-image />
            <span>原始框架图</span>
          </div>
          <span class="upload-count">{{ frameImages.length }}/5</span>
        </div>
        <div class="upload-list">
          <div class="upload-item" v-for="(img, index) in frameImages" :key="index">
            <img :src="img" alt="" />
            <div class="delete-btn" @click="handleDeleteFrame(index)">
              <icon-close />
            </div>
          </div>
          <div class="upload-btn" v-if="frameImages.length < 5" @click="handleUploadFrame">
            <icon-plus />
            <span>添加图片</span>
          </div>
        </div>
      </div>
      
      <div class="upload-group">
        <div class="group-header">
          <div class="group-title">
            <icon-file-image />
            <span>量房定稿图</span>
          </div>
          <span class="modify-btn" @click="handleModifyMeasure">修改量房定稿</span>
        </div>
        <div class="upload-list">
          <div class="upload-item" v-for="(img, index) in measureImages" :key="index">
            <img :src="img" alt="" />
            <div class="delete-btn" @click="handleDeleteMeasure(index)">
              <icon-close />
            </div>
          </div>
          <div class="upload-btn" v-if="measureImages.length < 5" @click="handleUploadMeasure">
            <icon-plus />
            <span>添加图片</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="order-section">
      <div class="section-header">
        <span class="section-title">下单记录</span>
        <span class="section-more" @click="$emit('navigate', 'order')">查看全部</span>
      </div>
      <div class="order-list">
        <div class="order-item" v-for="order in orderList" :key="order.id" @click="handleOrderDetail(order)">
          <div class="order-header">
            <span class="order-no">{{ order.orderNo }}</span>
            <span class="order-status" :class="order.status">{{ order.statusText }}</span>
          </div>
          <div class="order-info">
            <span class="order-date">{{ order.createDate }}</span>
            <span class="order-amount">¥{{ order.amount }}</span>
          </div>
          <div class="order-products">
            <span class="products-count">共{{ order.productCount }}种商品</span>
            <span class="order-type">{{ order.type === 'bom' ? 'BOM基装包' : '材料采购' }}</span>
          </div>
          <div v-if="order.status === 'pending-payment'" class="payment-actions">
            <span class="upload-btn" @click.stop="handleUploadPayment(order)">上传凭证</span>
          </div>
        </div>
        <div class="order-empty" v-if="orderList.length === 0">
          <icon-file-text />
          <p>暂无下单记录</p>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <div class="action-item" @click="$emit('navigate', 'market', { projectId: projectInfo.id })">
        <icon-shopping-cart />
        <span>材料下单</span>
      </div>
      <div class="action-item primary" @click="handleBomOrder">
        <icon-box />
        <span>BOM下单</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const primaryStatusMap: Record<string, string> = {
  'in-progress': '进行中',
  'completed': '已完成',
  'paused': '暂停中',
  'terminated': '已终止',
}

const secondaryStatusMap: Record<string, string> = {
  'surveying': '堪场中',
  'finalizing': '定稿中',
  'designing': '设计中',
  'constructing': '施工中',
  'accepting': '验收交付',
  'settling': '工程结算',
  'rectifying': '工程整改',
}

const brandIcons: Record<string, string> = {
  '星巴克': 'icon-coffee',
  '喜茶': 'icon-wine',
  '瑞幸咖啡': 'icon-cup-soda',
  '奈雪的茶': 'icon-leaf',
}

const brandColors: Record<string, string> = {
  '星巴克': 'brand-starbucks',
  '喜茶': 'brand-heytea',
  '瑞幸咖啡': 'brand-luckin',
  '奈雪的茶': 'brand-naixue',
}

function getBrandIcon(brand: string) {
  return brandIcons[brand] || 'icon-store'
}

function getBrandClass(brand: string) {
  return brandColors[brand] || 'brand-default'
}

function getPrimaryStatusText(status: string) {
  return primaryStatusMap[status] || status
}

function getSecondaryStatusText(status: string) {
  return secondaryStatusMap[status] || status
}

const projectInfo = ref({
  id: 1,
  storeName: '星巴克深圳万象城店',
  brand: '星巴克',
  code: 'CD001',
  projectType: '标准店装修',
  coverImage: 'https://picsum.photos/600/300?random=101',
  primaryStatus: 'in-progress',
  secondaryStatus: 'constructing',
  address: '广东省深圳市罗湖区宝安南路1881号万象城3楼301铺',
  distance: '2.3km',
  manager: '李经理',
  supervisor: '张三',
  supervisorPhone: '13800138001',
  phone: '13800138000',
  startDate: '2024-03-15',
  planEndDate: '2024-05-30',
  progress: 57,
})

const frameImages = ref([
  'https://picsum.photos/200/200?random=301',
  'https://picsum.photos/200/200?random=302',
])

const measureImages = ref([
  'https://picsum.photos/200/200?random=303',
])

const bomPackages = ref([
  {
    id: 1,
    name: '标准店基装包A',
    spec: '100㎡以内',
    price: '58,000',
    image: 'https://picsum.photos/200/150?random=401',
    itemCount: 25,
    items: [
      { id: 1, name: '乳胶漆', spec: '5L/桶', quantity: 10, stock: 100, price: 280 },
      { id: 2, name: '地砖', spec: '600*600mm', quantity: 80, stock: 500, price: 85 },
      { id: 3, name: '木地板', spec: '12mm厚', quantity: 60, stock: 300, price: 168 },
      { id: 4, name: '吊顶龙骨', spec: '38系列', quantity: 50, stock: 200, price: 35 },
      { id: 5, name: '石膏板', spec: '12mm', quantity: 40, stock: 150, price: 28 },
    ]
  },
  {
    id: 2,
    name: '标准店基装包B',
    spec: '100-150㎡',
    price: '78,000',
    image: 'https://picsum.photos/200/150?random=402',
    itemCount: 32,
    items: [
      { id: 1, name: '乳胶漆', spec: '5L/桶', quantity: 15, stock: 100, price: 280 },
      { id: 2, name: '地砖', spec: '600*600mm', quantity: 120, stock: 500, price: 85 },
      { id: 3, name: '木地板', spec: '12mm厚', quantity: 80, stock: 300, price: 168 },
      { id: 4, name: '吊顶龙骨', spec: '38系列', quantity: 70, stock: 200, price: 35 },
      { id: 5, name: '石膏板', spec: '12mm', quantity: 60, stock: 150, price: 28 },
    ]
  },
])

const orderList = ref([
  {
    id: 1,
    orderNo: 'PO20240315001',
    status: 'pending-payment',
    statusText: '待付款',
    createDate: '2024-03-16',
    amount: '58,000',
    productCount: 25,
    type: 'bom',
  },
  {
    id: 2,
    orderNo: 'PO20240310002',
    status: 'shipped',
    statusText: '已发货',
    createDate: '2024-03-12',
    amount: '42,800',
    productCount: 22,
    type: 'material',
  },
  {
    id: 3,
    orderNo: 'PO20240305003',
    status: 'completed',
    statusText: '已完成',
    createDate: '2024-03-08',
    amount: '15,200',
    productCount: 8,
    type: 'material',
  },
])

function handleUploadFrame() {
  frameImages.value.push('https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000))
}

function handleDeleteFrame(index: number) {
  frameImages.value.splice(index, 1)
}

function handleUploadMeasure() {
  measureImages.value.push('https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000))
}

function handleDeleteMeasure(index: number) {
  measureImages.value.splice(index, 1)
}

function handleCallSupervisor() {
  alert(`拨打监理电话: ${projectInfo.value.supervisorPhone}`)
}

function handleBomOrder() {
  emit('navigate', 'bom-order', { projectId: projectInfo.value.id })
}

function handleBomDetail(bom: any) {
  emit('navigate', 'bom-detail', { projectId: projectInfo.value.id, bomId: bom.id })
}

function handleModifyMeasure() {
  alert('跳转到修改量房定稿页面')
}

function handleOrderDetail(order: any) {
  emit('navigate', 'order-detail', { orderId: order.id })
}

function handleUploadPayment(order: any) {
  alert(`上传订单 ${order.orderNo} 的支付凭证`)
}
</script>

<style lang="scss" scoped>
.project-detail {
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
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
    margin-right: 32px;
  }
}

.project-cover {
  position: relative;
  height: 180px;
  margin-top: 44px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .cover-overlay {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  
  .project-status-wrap {
    display: flex;
    gap: 6px;
  }
  
  .primary-status, .secondary-status {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: #86909c;
    
    &.in-progress {
      background: #e8ffea;
      color: #00b42a;
    }
    
    &.completed {
      background: #f7f8fa;
      color: #86909c;
    }
    
    &.paused {
      background: #fff7e8;
      color: #ff7d00;
    }
    
    &.terminated {
      background: #fff1f0;
      color: #ff4d4f;
    }
  }
  
  .secondary-status {
    font-size: 10px;
    background: rgba(22, 93, 255, 0.9);
    color: #fff;
  }
}

.info-card {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .store-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 17px;
    font-weight: 600;
    color: #1d2129;
    flex: 1;
    
    .brand-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .arco-icon {
        width: 14px;
        height: 14px;
      }
      
      &.brand-starbucks {
        background: #006241;
        color: #fff;
      }
      
      &.brand-heytea {
        background: linear-gradient(135deg, #ff3149, #ff7d00);
        color: #fff;
      }
      
      &.brand-luckin {
        background: #00b056;
        color: #fff;
      }
      
      &.brand-naixue {
        background: #00c48c;
        color: #fff;
      }
      
      &.brand-default {
        background: #e8f3ff;
        color: #165dff;
      }
    }
  }
  
  .store-code {
    font-size: 12px;
    color: #86909c;
    background: #f7f8fa;
    padding: 4px 10px;
    border-radius: 10px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .info-item {
    .info-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 14px;
      color: #1d2129;
      
      &.supervisor-row {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .call-btn {
          width: 24px;
          height: 24px;
          background: #e8ffea;
          color: #00b42a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}

.bom-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .section-more {
      font-size: 13px;
      color: #165dff;
    }
  }
  
  .bom-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .bom-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    
    .bom-image {
      width: 80px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .bom-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .bom-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .bom-spec {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 4px;
      }
      
      .bom-items {
        font-size: 11px;
        color: #86909c;
        margin-bottom: 8px;
      }
      
      .bom-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        
        .bom-price {
          font-size: 15px;
          font-weight: 600;
          color: #ff4d4f;
        }
        
        .bom-btn {
          font-size: 12px;
          color: #fff;
          background: linear-gradient(135deg, #165dff, #4080ff);
          padding: 4px 12px;
          border-radius: 12px;
        }
      }
    }
  }
}

.upload-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
  
  .section-header {
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }
  }
  
  .upload-group {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .group-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .upload-count {
      font-size: 12px;
      color: #86909c;
    }
    
    .modify-btn {
      font-size: 12px;
      color: #165dff;
    }
    
    .upload-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .upload-item {
      position: relative;
      width: calc(33.33% - 7px);
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .delete-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }
    
    .upload-btn {
      width: calc(33.33% - 7px);
      aspect-ratio: 1;
      border: 1px dashed #e5e6eb;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: #86909c;
      font-size: 12px;
    }
  }
}

.order-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .section-more {
      font-size: 13px;
      color: #165dff;
    }
  }
  
  .order-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .order-item {
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .order-no {
        font-size: 13px;
        font-weight: 500;
        color: #1d2129;
      }
      
      .order-status {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: #f7f8fa;
        color: #86909c;
        
        &.pending-payment {
          background: #fff7e8;
          color: #ff7d00;
        }
        
        &.shipped {
          background: #e8f3ff;
          color: #165dff;
        }
        
        &.completed {
          background: #e8ffea;
          color: #00b42a;
        }
      }
    }
    
    .order-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .order-date {
        font-size: 12px;
        color: #86909c;
      }
      
      .order-amount {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
      }
    }
    
    .order-products {
      display: flex;
      justify-content: space-between;
      
      .products-count {
        font-size: 12px;
        color: #86909c;
      }
      
      .order-type {
        font-size: 11px;
        color: #165dff;
        background: #e8f3ff;
        padding: 2px 6px;
        border-radius: 6px;
      }
    }
    
    .payment-actions {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #e5e6eb;
      
      .upload-btn {
        font-size: 12px;
        color: #165dff;
      }
    }
  }
  
  .order-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 0;
    color: #86909c;
    
    p {
      margin-top: 8px;
      font-size: 13px;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  
  .action-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    font-size: 14px;
    color: #4e5969;
    
    &.primary {
      background: linear-gradient(135deg, #165dff, #4080ff);
      color: #fff;
    }
  }
}
</style>