<template>
  <view class="page">
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索BOM包名称/编码" 
        class="search-input"
      />
    </view>

    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filterType === '' }"
        @click="filterType = ''"
      >
        全部
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'platform' }"
        @click="filterType = 'platform'"
      >
        平台标准
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'custom' }"
        @click="filterType = 'custom'"
      >
        自定义
      </view>
    </view>

    <view class="bom-list">
      <view class="bom-item" v-for="item in filteredBomList" :key="item.id" @click="handleDetail(item)">
        <view class="bom-header">
          <view class="bom-tag" :class="item.type">{{ item.type === 'platform' ? '平台标准' : '自定义' }}</view>
          <text class="bom-code">{{ item.code }}</text>
        </view>
        <view class="bom-title">{{ item.name }}</view>
        <view class="bom-desc">{{ item.description }}</view>
        <view class="bom-info">
          <view class="info-item">
            <text class="info-label">包含商品</text>
            <text class="info-value">{{ item.productCount }}种</text>
          </view>
          <view class="info-item">
            <text class="info-label">适用面积</text>
            <text class="info-value">{{ item.areaRange }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">参考总价</text>
            <text class="info-value price">¥{{ item.referencePrice }}</text>
          </view>
        </view>
        <view class="bom-products">
          <text class="products-label">主要商品:</text>
          <view class="products-tags">
            <text class="product-tag" v-for="prod in item.mainProducts" :key="prod">{{ prod }}</text>
          </view>
        </view>
        <view class="bom-footer">
          <view class="supplier-info">
            <text class="supplier-label">供应商:</text>
            <text class="supplier-name">{{ item.supplierName }}</text>
          </view>
          <view class="action-btn" @click.stop="handlePurchase(item)">立即采购</view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="filteredBomList.length === 0">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无BOM基装包</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const filterType = ref('')

const bomList = ref([
  {
    id: 'bom001',
    code: 'BOM-STD-001',
    name: '标准两居室基装包',
    description: '适用于80-100平米两居室的标准装修基材套餐',
    type: 'platform',
    productCount: 45,
    areaRange: '80-100㎡',
    referencePrice: '35,800.00',
    mainProducts: ['水泥', '黄砂', '电线', '水管', '防水涂料'],
    supplierName: '平台优选供应商',
  },
  {
    id: 'bom002',
    code: 'BOM-STD-002',
    name: '标准三居室基装包',
    description: '适用于100-130平米三居室的标准装修基材套餐',
    type: 'platform',
    productCount: 58,
    areaRange: '100-130㎡',
    referencePrice: '48,500.00',
    mainProducts: ['水泥', '黄砂', '电线', '水管', '瓷砖胶'],
    supplierName: '平台优选供应商',
  },
  {
    id: 'bom003',
    code: 'BOM-CUS-001',
    name: '深圳湾项目定制包',
    description: '深圳湾科技园项目专用基材套餐',
    type: 'custom',
    productCount: 62,
    areaRange: '定制',
    referencePrice: '52,300.00',
    mainProducts: ['水泥', '螺纹钢', '商品混凝土', '防水卷材'],
    supplierName: '华新建材供应商',
  },
  {
    id: 'bom004',
    code: 'BOM-STD-003',
    name: '商业办公基装包',
    description: '适用于商业办公空间的标准装修基材套餐',
    type: 'platform',
    productCount: 38,
    areaRange: '不限',
    referencePrice: '28,600.00',
    mainProducts: ['轻钢龙骨', '石膏板', '电线', '网线', '防火涂料'],
    supplierName: '平台优选供应商',
  },
])

const filteredBomList = computed(() => {
  let result = bomList.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(kw) || 
      item.code.toLowerCase().includes(kw)
    )
  }
  
  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }
  
  return result
})

function handleDetail(item: any) {
  uni.navigateTo({ url: `/pages/market/bom-detail?id=${item.id}` })
}

function handlePurchase(item: any) {
  uni.showModal({
    title: '确认采购',
    content: `确定采购 ${item.name} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: `/pages/order/create?bomId=${item.id}` })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 20rpx 32rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background-color: #fff;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.filter-bar {
  display: flex;
  padding: 0 32rpx 20rpx;
  gap: 16rpx;
}

.filter-item {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #fff;
  border-radius: 20rpx;
  
  &.active {
    color: #165dff;
    background-color: #e8f3ff;
  }
}

.bom-list {
  padding: 0 32rpx;
}

.bom-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.bom-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.bom-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-right: 12rpx;
  
  &.platform {
    color: #165dff;
    background-color: #e8f3ff;
  }
  
  &.custom {
    color: #ff7d00;
    background-color: #fff7e8;
  }
}

.bom-code {
  font-size: 22rpx;
  color: #86909c;
}

.bom-title {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.bom-desc {
  font-size: 26rpx;
  color: #86909c;
  margin-bottom: 20rpx;
}

.bom-info {
  display: flex;
  padding: 16rpx 0;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item {
  flex: 1;
  text-align: center;
  
  &:not(:last-child) {
    border-right: 1rpx solid #f0f0f0;
  }
}

.info-label {
  display: block;
  font-size: 22rpx;
  color: #86909c;
  margin-bottom: 8rpx;
}

.info-value {
  display: block;
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  
  &.price {
    color: #f53f3f;
  }
}

.bom-products {
  padding: 16rpx 0;
}

.products-label {
  font-size: 24rpx;
  color: #86909c;
  margin-right: 12rpx;
}

.products-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.product-tag {
  font-size: 22rpx;
  color: #666;
  background-color: #f7f8fa;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.bom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.supplier-info {
  display: flex;
  align-items: center;
}

.supplier-label {
  font-size: 24rpx;
  color: #86909c;
}

.supplier-name {
  font-size: 24rpx;
  color: #1d2129;
  margin-left: 8rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  background-color: #165dff;
  color: #fff;
  font-size: 26rpx;
  border-radius: 32rpx;
}

.empty-state {
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
