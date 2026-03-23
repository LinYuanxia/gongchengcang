<template>
  <div class="mp-page">
    <div class="product-header">
      <div class="image-swiper">
        <img src="https://picsum.photos/400/400?random=1" class="product-image" />
      </div>
      <div class="product-tags">
        <span class="tag hot">热销</span>
        <span class="tag recommend">推荐</span>
      </div>
    </div>
    
    <div class="product-info">
      <div class="price-row">
        <div class="price">
          <span class="price-symbol">¥</span>
          <span class="price-value">450</span>
          <span class="price-unit">/吨</span>
        </div>
        <span class="sales">已售 1250 吨</span>
      </div>
      <span class="product-name">水泥 P.O 42.5 普通硅酸盐水泥</span>
      <span class="product-code">编码：SKU-SN-001-42.5</span>
      <div class="spec-row">
        <span class="spec-label">规格：</span>
        <span class="spec-value">42.5 / 普通硅酸盐 / 50kg/袋</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <span class="section-title">选择供应商</span>
        <span class="supplier-count">共 2 家</span>
      </div>
      
      <div class="supplier-list">
        <div class="supplier-item active">
          <div class="supplier-main">
            <div class="supplier-radio">
              <span>✓</span>
            </div>
            <div class="supplier-info">
              <span class="supplier-name">华新水泥供应商</span>
              <div class="supplier-meta">
                <span class="supply-price">供货价 ¥420</span>
                <span class="stock">库存 500 吨</span>
              </div>
            </div>
          </div>
          <div class="supplier-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">420</span>
          </div>
        </div>
        
        <div class="supplier-item">
          <div class="supplier-main">
            <div class="supplier-radio"></div>
            <div class="supplier-info">
              <span class="supplier-name">海螺水泥供应商</span>
              <div class="supplier-meta">
                <span class="supply-price">供货价 ¥415</span>
                <span class="stock">库存 300 吨</span>
              </div>
            </div>
          </div>
          <div class="supplier-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">415</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <span class="section-title">商品详情</span>
      </div>
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">商品分类</span>
          <span class="detail-value">水泥</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">强度等级</span>
          <span class="detail-value">42.5</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">类型</span>
          <span class="detail-value">普通硅酸盐</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">包装</span>
          <span class="detail-value">50kg/袋</span>
        </div>
      </div>
    </div>
    
    <div class="bottom-bar">
      <div class="action-icons">
        <div class="icon-item" @click="$emit('navigate', 'cart')">
          <icon-shopping-cart class="icon" />
          <span class="badge">2</span>
        </div>
        <div class="icon-item">
          <icon-heart class="icon" />
        </div>
      </div>
      <div class="action-buttons">
        <div class="btn-cart">加入购物车</div>
        <div class="btn-buy" @click="$emit('navigate', 'order-create')">立即购买</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['navigate'])
</script>

<style lang="scss" scoped>
.mp-page {
  min-height: 100%;
  background-color: #f7f8fa;
  padding-bottom: 60px;
  position: relative;
}

.product-header {
  position: relative;
  background-color: #fff;
}

.image-swiper {
  height: 375px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  
  .tag {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 3px;
    margin-right: 6px;
    
    &.hot {
      color: #fff;
      background-color: #f53f3f;
    }
    
    &.recommend {
      color: #fff;
      background-color: #165dff;
    }
  }
}

.product-info {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #f53f3f;
}

.price-value {
  font-size: 24px;
  font-weight: 600;
  color: #f53f3f;
}

.price-unit {
  font-size: 12px;
  color: #86909c;
  margin-left: 4px;
}

.sales {
  font-size: 12px;
  color: #86909c;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  display: block;
  margin-bottom: 6px;
}

.product-code {
  font-size: 12px;
  color: #86909c;
  display: block;
  margin-bottom: 8px;
}

.spec-row {
  display: flex;
  align-items: center;
}

.spec-label {
  font-size: 12px;
  color: #86909c;
}

.spec-value {
  font-size: 12px;
  color: #1d2129;
}

.section {
  background-color: #fff;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.supplier-count {
  font-size: 12px;
  color: #86909c;
}

.supplier-list {
  padding: 0 16px;
}

.supplier-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    .supplier-radio {
      background-color: #165dff;
      border-color: #165dff;
      color: #fff;
    }
  }
}

.supplier-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.supplier-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 12px;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-size: 14px;
  color: #1d2129;
  display: block;
  margin-bottom: 4px;
}

.supplier-meta {
  display: flex;
  align-items: center;
}

.supply-price {
  font-size: 12px;
  color: #f53f3f;
  margin-right: 12px;
}

.stock {
  font-size: 12px;
  color: #86909c;
}

.supplier-price {
  display: flex;
  align-items: baseline;
  
  .price-symbol {
    font-size: 12px;
  }
  
  .price-value {
    font-size: 18px;
  }
}

.detail-content {
  padding: 12px 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail-label {
  font-size: 13px;
  color: #86909c;
}

.detail-value {
  font-size: 13px;
  color: #1d2129;
}

.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.action-icons {
  display: flex;
  margin-right: 16px;
}

.icon-item {
  position: relative;
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .icon {
    font-size: 22px;
    color: #4e5969;
  }
  
  .badge {
    position: absolute;
    top: -4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    padding: 0 4px;
    font-size: 10px;
    color: #fff;
    background-color: #f53f3f;
    border-radius: 8px;
    text-align: center;
  }
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 12px;
}

.btn-cart {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 20px;
}

.btn-buy {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  background-color: #165dff;
  border-radius: 20px;
}
</style>
