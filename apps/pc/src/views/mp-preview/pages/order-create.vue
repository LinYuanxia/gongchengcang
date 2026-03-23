<template>
  <div class="mp-page">
    <div class="address-section">
      <div class="address-content">
        <div class="address-header">
          <span class="address-name">张三</span>
          <span class="address-phone">13800138000</span>
          <span class="default-tag">默认</span>
        </div>
        <span class="address-detail">广东省深圳市南山区科技园南区A栋101</span>
      </div>
      <span class="arrow">›</span>
    </div>
    
    <div class="product-section">
      <div class="supplier-group">
        <div class="group-header">
          <span class="supplier-icon">🏭</span>
          <span class="supplier-name">华新水泥供应商</span>
          <span class="delivery-info">预计2天送达</span>
        </div>
        
        <div class="product-item">
          <img src="https://picsum.photos/200/200?random=1" class="product-image" />
          <div class="product-info">
            <span class="product-name">水泥 P.O 42.5</span>
            <span class="product-spec">50kg/袋</span>
            <div class="product-bottom">
              <div class="product-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">420</span>
              </div>
              <span class="product-quantity">x10</span>
            </div>
          </div>
        </div>
        
        <div class="group-footer">
          <div class="remark-row">
            <span class="remark-label">订单备注</span>
            <div class="remark-content">
              <span class="remark-text placeholder">选填，请先与供应商协商一致</span>
              <span class="arrow">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-item">
        <span class="info-label">商品金额</span>
        <span class="info-value">¥4200.00</span>
      </div>
      <div class="info-item">
        <span class="info-label">运费</span>
        <span class="info-value">¥0.00</span>
      </div>
    </div>
    
    <div class="bottom-bar">
      <div class="total-info">
        <span class="total-label">合计：</span>
        <span class="total-price">¥4200.00</span>
      </div>
      <div class="submit-btn">提交订单</div>
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

.address-section {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.address-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin-right: 8px;
}

.address-phone {
  font-size: 14px;
  color: #86909c;
}

.default-tag {
  font-size: 10px;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 2px 6px;
  border-radius: 2px;
  margin-left: 8px;
}

.address-detail {
  font-size: 13px;
  color: #4e5969;
}

.arrow {
  font-size: 16px;
  color: #c9cdd4;
  margin-left: 8px;
}

.product-section {
  margin-bottom: 12px;
}

.supplier-group {
  background-color: #fff;
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.supplier-icon {
  font-size: 16px;
  margin-right: 6px;
}

.supplier-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.delivery-info {
  font-size: 11px;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 2px 6px;
  border-radius: 2px;
}

.product-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.product-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.product-spec {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  color: #f53f3f;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #f53f3f;
}

.product-quantity {
  font-size: 13px;
  color: #86909c;
}

.group-footer {
  padding: 12px 16px;
}

.remark-row {
  display: flex;
  align-items: center;
}

.remark-label {
  font-size: 13px;
  color: #86909c;
  width: 70px;
}

.remark-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.remark-text {
  font-size: 13px;
  color: #1d2129;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &.placeholder {
    color: #c9cdd4;
  }
}

.info-section {
  background-color: #fff;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 14px;
  color: #4e5969;
}

.info-value {
  font-size: 14px;
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
  justify-content: flex-end;
  padding: 0 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.total-info {
  margin-right: 16px;
}

.total-label {
  font-size: 14px;
  color: #1d2129;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #f53f3f;
}

.submit-btn {
  padding: 8px 32px;
  background-color: #165dff;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
}
</style>
