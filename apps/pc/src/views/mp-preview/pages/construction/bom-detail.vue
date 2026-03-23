<template>
  <div class="mp-page construction-bom-detail">
    <div class="header">
      <div class="back-btn" @click="emit('back')">
        <icon-left />
      </div>
      <div class="title">BOM包详情</div>
      <div class="share-btn">
        <icon-share-alt />
      </div>
    </div>

    <div class="bom-image">
      <img :src="bom.image" :alt="bom.name" />
    </div>

    <div class="bom-info">
      <div class="bom-name">{{ bom.name }}</div>
      <div class="bom-desc">{{ bom.description }}</div>
      <div class="bom-price">
        <span class="price">¥{{ bom.price }}</span>
        <span class="unit">/套</span>
        <span class="sales">已售 {{ bom.salesCount }} 件</span>
      </div>
      <div class="bom-tags">
        <span v-if="bom.isHot" class="hot-tag">热门</span>
        <span v-if="bom.isRecommend" class="recommend-tag">推荐</span>
        <span class="sku-tag">{{ bom.skuCount }}种SKU</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">供应商策略</div>
      <div class="strategy-info">
        <div class="strategy-tag" :class="bom.strategy">
          {{ getStrategyText(bom.strategy) }}
        </div>
        <div class="strategy-desc">{{ getStrategyDesc(bom.strategy) }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-title">SKU明细（可选择性购买）</div>
        <div class="select-actions">
          <span @click="handleSelectAll">全选</span>
          <span @click="handleClearSelection">清空</span>
        </div>
      </div>
      <div class="sku-list">
        <div 
          class="sku-item" 
          v-for="sku in bom.skuList" 
          :key="sku.skuId"
          :class="{ selected: selectedSkuIds.includes(sku.skuId) || sku.required }"
          @click="toggleSkuSelection(sku)"
        >
          <div class="sku-checkbox">
            <icon-check v-if="selectedSkuIds.includes(sku.skuId) || sku.required" />
          </div>
          <div class="sku-image">
            <img :src="sku.image" :alt="sku.name" />
          </div>
          <div class="sku-info">
            <div class="sku-name">{{ sku.name }}</div>
            <div class="sku-spec">{{ sku.spec }}</div>
            <div class="sku-meta">
              <span class="sku-price">¥{{ sku.price }}</span>
              <span class="sku-quantity">× {{ sku.quantity }}{{ sku.unit }}</span>
            </div>
          </div>
          <div class="sku-tag" :class="{ required: sku.required }">
            {{ sku.required ? '必选' : '可选' }}
          </div>
        </div>
      </div>
    </div>

    <div class="summary-bar">
      <div class="summary-left">
        <div class="selected-count">
          已选 <strong>{{ selectedSkuIds.length + bom.skuList.filter(s => s.required).length }}</strong> 种
        </div>
        <div class="total-price">
          合计：<span class="price">¥{{ selectedTotalPrice }}</span>
        </div>
      </div>
      <div class="summary-right">
        <div class="quantity-selector">
          <span class="minus" @click="quantity > 1 && quantity--">-</span>
          <span class="quantity">{{ quantity }}</span>
          <span class="plus" @click="quantity++">+</span>
        </div>
        <div class="buy-btn" @click="handleBuy">立即购买</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['back', 'navigate'])

const quantity = ref(1)
const selectedSkuIds = ref<string[]>([])

const bom = ref({
  id: '1',
  name: '水电材料标准包',
  image: 'https://picsum.photos/600/400?random=1',
  description: '适用于标准住宅水电改造工程，包含给排水管材、电线电缆、开关插座等基础材料',
  price: '3,580.00',
  skuCount: 12,
  salesCount: 156,
  isHot: true,
  isRecommend: true,
  strategy: 'smart',
  skuList: [
    { skuId: '1', name: '水泥 P.O 42.5', image: 'https://picsum.photos/80/80?random=1', spec: '50kg/袋', price: 420, quantity: 10, unit: '吨', required: true },
    { skuId: '2', name: '防水涂料', image: 'https://picsum.photos/80/80?random=2', spec: '20kg/桶', price: 280, quantity: 5, unit: '桶', required: true },
    { skuId: '3', name: 'PVC排水管', image: 'https://picsum.photos/80/80?random=3', spec: 'DN110', price: 35, quantity: 20, unit: '根', required: false },
    { skuId: '4', name: '电线 BV2.5', image: 'https://picsum.photos/80/80?random=4', spec: '2.5mm²', price: 180, quantity: 5, unit: '卷', required: true },
    { skuId: '5', name: '开关插座', image: 'https://picsum.photos/80/80?random=5', spec: '五孔', price: 15, quantity: 30, unit: '个', required: false },
  ],
})

const selectedTotalPrice = computed(() => {
  const requiredTotal = bom.value.skuList
    .filter(s => s.required)
    .reduce((sum, s) => sum + s.price * s.quantity, 0)
  
  const selectedTotal = bom.value.skuList
    .filter(s => selectedSkuIds.value.includes(s.skuId) && !s.required)
    .reduce((sum, s) => sum + s.price * s.quantity, 0)
  
  return ((requiredTotal + selectedTotal) * quantity.value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

function getStrategyText(strategy: string) {
  const texts: Record<string, string> = {
    smart: '智能分配',
    single: '单一供应商',
    sku: 'SKU级指定',
  }
  return texts[strategy] || strategy
}

function getStrategyDesc(strategy: string) {
  const descs: Record<string, string> = {
    smart: '系统自动选择最优供应商，各供应商分别发货',
    single: '统一从指定供应商采购，统一发货',
    sku: '每个SKU已指定供应商，各供应商分别发货',
  }
  return descs[strategy] || ''
}

function handleSelectAll() {
  selectedSkuIds.value = bom.value.skuList.map(s => s.skuId)
}

function handleClearSelection() {
  selectedSkuIds.value = []
}

function toggleSkuSelection(sku: any) {
  if (sku.required) return
  
  const index = selectedSkuIds.value.indexOf(sku.skuId)
  if (index > -1) {
    selectedSkuIds.value.splice(index, 1)
  } else {
    selectedSkuIds.value.push(sku.skuId)
  }
}

function handleBuy() {
  emit('navigate', 'bom-order', { bomId: bom.value.id })
}
</script>

<style lang="scss" scoped>
.construction-bom-detail {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 70px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .back-btn, .share-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #333;
  }
  
  .title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}

.bom-image {
  height: 200px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.bom-info {
  background: #fff;
  padding: 16px;
  
  .bom-name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .bom-desc {
    font-size: 13px;
    color: #666;
    margin-top: 8px;
    line-height: 1.5;
  }
  
  .bom-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 12px;
    
    .price {
      font-size: 24px;
      font-weight: 600;
      color: #f53f3f;
    }
    
    .unit {
      font-size: 13px;
      color: #999;
    }
    
    .sales {
      font-size: 12px;
      color: #999;
      margin-left: auto;
    }
  }
  
  .bom-tags {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    
    .hot-tag {
      background: #f53f3f;
      color: #fff;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .recommend-tag {
      background: #165dff;
      color: #fff;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .sku-tag {
      background: #f5f5f5;
      color: #666;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
}

.section {
  background: #fff;
  margin-top: 10px;
  padding: 16px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }
  
  .select-actions {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #165dff;
  }
}

.strategy-info {
  margin-top: 12px;
  
  .strategy-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    
    &.smart {
      background: #e8f3ff;
      color: #165dff;
    }
    
    &.single {
      background: #e8ffea;
      color: #00b42a;
    }
    
    &.sku {
      background: #f5e8ff;
      color: #722ed1;
    }
  }
  
  .strategy-desc {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    line-height: 1.5;
  }
}

.sku-list {
  margin-top: 12px;
}

.sku-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.selected {
    .sku-checkbox {
      background: #165dff;
      border-color: #165dff;
      color: #fff;
    }
  }
  
  .sku-checkbox {
    width: 20px;
    height: 20px;
    border: 1px solid #ddd;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 12px;
  }
  
  .sku-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .sku-info {
    flex: 1;
    margin-left: 12px;
    
    .sku-name {
      font-size: 14px;
      color: #333;
    }
    
    .sku-spec {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    
    .sku-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      
      .sku-price {
        font-size: 14px;
        color: #f53f3f;
        font-weight: 500;
      }
      
      .sku-quantity {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .sku-tag {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f5f5f5;
    color: #999;
    
    &.required {
      background: #fff2e8;
      color: #ff7d00;
    }
  }
}

.summary-bar {
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
  border-top: 1px solid #eee;
  
  .summary-left {
    .selected-count {
      font-size: 12px;
      color: #666;
      
      strong {
        color: #165dff;
      }
    }
    
    .total-price {
      font-size: 13px;
      color: #333;
      margin-top: 4px;
      
      .price {
        font-size: 18px;
        font-weight: 600;
        color: #f53f3f;
      }
    }
  }
  
  .summary-right {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .quantity-selector {
      display: flex;
      align-items: center;
      border: 1px solid #eee;
      border-radius: 4px;
      
      .minus, .plus {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #666;
      }
      
      .quantity {
        width: 40px;
        text-align: center;
        font-size: 14px;
        color: #333;
        border-left: 1px solid #eee;
        border-right: 1px solid #eee;
        line-height: 28px;
      }
    }
    
    .buy-btn {
      background: #165dff;
      color: #fff;
      padding: 10px 24px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
