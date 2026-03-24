<template>
  <view class="page">
    <view class="header-tabs">
      <view 
        class="tab-item" 
        :class="{ active: recordType === 'in' }"
        @click="recordType = 'in'"
      >入库记录</view>
      <view 
        class="tab-item" 
        :class="{ active: recordType === 'out' }"
        @click="recordType = 'out'"
      >出库记录</view>
    </view>

    <view class="filter-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="搜索商品名称/单号" 
        />
      </view>
      <picker mode="date" :value="filterDate" @change="filterDate = $event.detail.value">
        <view class="date-btn">
          <text>{{ filterDate || '选择日期' }}</text>
          <text class="date-arrow">▼</text>
        </view>
      </picker>
    </view>

    <view class="record-list">
      <view class="record-item" v-for="item in filteredRecords" :key="item.id">
        <view class="record-header">
          <view class="record-no">
            <text class="label">单号：</text>
            <text class="value">{{ item.orderNo }}</text>
          </view>
          <view class="record-type" :class="item.sourceType">
            <text>{{ getSourceText(item.sourceType) }}</text>
          </view>
        </view>
        
        <view class="record-products">
          <view class="product-row" v-for="(prod, idx) in item.products" :key="idx">
            <image :src="prod.image" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ prod.name }}</text>
              <text class="product-spec">{{ prod.spec }}</text>
            </view>
            <view class="product-qty">
              <text class="qty-value">{{ prod.qty }}</text>
              <text class="qty-unit">{{ prod.unit }}</text>
            </view>
          </view>
        </view>
        
        <view class="record-footer">
          <view class="record-info">
            <text class="info-item">仓库：{{ item.warehouse }}</text>
            <text class="info-item">操作人：{{ item.operator }}</text>
            <text class="info-item">时间：{{ item.time }}</text>
          </view>
          <view class="record-total">
            <text class="total-label">合计</text>
            <text class="total-value">{{ item.totalQty }}</text>
            <text class="total-unit">件</text>
          </view>
        </view>
      </view>

      <view class="empty" v-if="filteredRecords.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无{{ recordType === 'in' ? '入库' : '出库' }}记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const recordType = ref('in')
const keyword = ref('')
const filterDate = ref('')

interface Product {
  name: string
  spec: string
  image: string
  qty: number
  unit: string
}

interface Record {
  id: string
  orderNo: string
  sourceType: string
  products: Product[]
  warehouse: string
  operator: string
  time: string
  totalQty: number
}

const inRecords = ref<Record[]>([
  {
    id: 'ir001',
    orderNo: 'RK2024010001',
    sourceType: 'purchase',
    products: [
      { name: '水泥 P.O 42.5', spec: '50kg/袋', image: 'https://via.placeholder.com/80', qty: 100, unit: '吨' },
    ],
    warehouse: 'A区仓库',
    operator: '张三',
    time: '2024-01-15 14:30',
    totalQty: 100,
  },
  {
    id: 'ir002',
    orderNo: 'RK2024010002',
    sourceType: 'purchase',
    products: [
      { name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://via.placeholder.com/80', qty: 50, unit: '吨' },
      { name: '螺纹钢 HRB400 20mm', spec: '20mm', image: 'https://via.placeholder.com/80', qty: 30, unit: '吨' },
    ],
    warehouse: 'B区仓库',
    operator: '李四',
    time: '2024-01-14 10:20',
    totalQty: 80,
  },
  {
    id: 'ir003',
    orderNo: 'RK2024010003',
    sourceType: 'return',
    products: [
      { name: '黄砂 中砂', spec: '中砂', image: 'https://via.placeholder.com/80', qty: 20, unit: '方' },
    ],
    warehouse: 'C区仓库',
    operator: '王五',
    time: '2024-01-13 16:45',
    totalQty: 20,
  },
  {
    id: 'ir004',
    orderNo: 'RK2024010004',
    sourceType: 'transfer',
    products: [
      { name: '商品混凝土 C30', spec: 'C30', image: 'https://via.placeholder.com/80', qty: 30, unit: '方' },
    ],
    warehouse: 'A区仓库',
    operator: '赵六',
    time: '2024-01-12 09:15',
    totalQty: 30,
  },
  {
    id: 'ir005',
    orderNo: 'RK2024010005',
    sourceType: 'check',
    products: [
      { name: '防水涂料 聚氨酯', spec: '20kg/桶', image: 'https://via.placeholder.com/80', qty: 10, unit: '桶' },
    ],
    warehouse: 'A区仓库',
    operator: '张三',
    time: '2024-01-11 11:30',
    totalQty: 10,
  },
])

const outRecords = ref<Record[]>([
  {
    id: 'or001',
    orderNo: 'CK2024010001',
    sourceType: 'sale',
    products: [
      { name: '水泥 P.O 42.5', spec: '50kg/袋', image: 'https://via.placeholder.com/80', qty: 50, unit: '吨' },
    ],
    warehouse: 'A区仓库',
    operator: '张三',
    time: '2024-01-15 15:30',
    totalQty: 50,
  },
  {
    id: 'or002',
    orderNo: 'CK2024010002',
    sourceType: 'sale',
    products: [
      { name: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://via.placeholder.com/80', qty: 20, unit: '吨' },
    ],
    warehouse: 'B区仓库',
    operator: '李四',
    time: '2024-01-14 14:20',
    totalQty: 20,
  },
  {
    id: 'or003',
    orderNo: 'CK2024010003',
    operator: '李四',
    time: '2024-01-14 11:20',
    totalQty: 20,
  },
  {
    id: 'or003',
    orderNo: 'CK2024010003',
    sourceType: 'transfer',
    products: [
      { name: '碎石 5-31.5mm', spec: '5-31.5mm', image: 'https://via.placeholder.com/80', qty: 40, unit: '方' },
    ],
    warehouse: 'C区仓库',
    operator: '王五',
    time: '2024-01-13 14:45',
    totalQty: 40,
  },
  {
    id: 'or004',
    orderNo: 'CK2024010004',
    sourceType: 'check',
    products: [
      { name: '轻钢龙骨 50型', spec: '50mm', image: 'https://via.placeholder.com/80', qty: 5, unit: '根' },
    ],
    warehouse: 'A区仓库',
    operator: '赵六',
    time: '2024-01-12 16:15',
    totalQty: 5,
  },
])

const filteredRecords = computed(() => {
  let result = recordType.value === 'in' ? inRecords.value : outRecords.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(r => 
      r.orderNo.toLowerCase().includes(kw) ||
      r.products.some(p => p.name.toLowerCase().includes(kw))
    )
  }
  
  if (filterDate.value) {
    result = result.filter(r => r.time.startsWith(filterDate.value))
  }
  
  return result
})

function getSourceText(type: string) {
  const inMap: Record<string, string> = {
    purchase: '采购入库',
    return: '退货入库',
    transfer: '调拨入库',
    check: '盘点调整',
  }
  const outMap: Record<string, string> = {
    sale: '销售出库',
    transfer: '调拨出库',
    check: '盘点调整',
  }
  return recordType.value === 'in' ? inMap[type] : outMap[type]
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage?.options?.type) {
    recordType.value = currentPage.options.type
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.header-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 30rpx;
  color: #86909c;
  position: relative;
  
  &.active {
    color: #165dff;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background-color: #165dff;
      border-radius: 2rpx;
    }
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background-color: #fff;
  margin-bottom: 24rpx;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f7f8fa;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;
}

.search-icon {
  margin-right: 12rpx;
}

.search-input input {
  flex: 1;
  font-size: 26rpx;
}

.date-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #1d2129;
}

.date-arrow {
  font-size: 18rpx;
  color: #86909c;
  margin-left: 8rpx;
}

.record-list {
  padding: 0 32rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f7f8fa;
}

.record-no {
  .label {
    font-size: 24rpx;
    color: #86909c;
  }
  
  .value {
    font-size: 24rpx;
    color: #1d2129;
    font-weight: 500;
  }
}

.record-type {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  
  &.purchase, &.sale {
    background-color: #e8f3ff;
    color: #165dff;
  }
  
  &.return {
    background-color: #e8ffea;
    color: #00b42a;
  }
  
  &.transfer {
    background-color: #fff7e8;
    color: #ff7d00;
  }
  
  &.check {
    background-color: #f2e8ff;
    color: #722ed1;
  }
}

.record-products {
  margin-bottom: 16rpx;
}

.product-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 16rpx;
}

.product-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.product-spec {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.product-qty {
  text-align: right;
}

.qty-value {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 600;
}

.qty-unit {
  font-size: 24rpx;
  color: #86909c;
  margin-left: 4rpx;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 16rpx;
  border-top: 1rpx solid #f7f8fa;
}

.record-info {
  display: flex;
  flex-direction: column;
}

.info-item {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  
  &:first-child {
    margin-top: 0;
  }
}

.record-total {
  text-align: right;
}

.total-label {
  font-size: 24rpx;
  color: #86909c;
}

.total-value {
  font-size: 36rpx;
  color: #165dff;
  font-weight: 600;
  margin-left: 8rpx;
}

.total-unit {
  font-size: 24rpx;
  color: #86909c;
  margin-left: 4rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}
</style>
