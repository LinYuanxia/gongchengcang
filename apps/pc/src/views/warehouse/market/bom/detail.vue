<template>
  <div class="bom-detail">
    <a-card>
      <template #extra>
        <a-button @click="router.back()">返回</a-button>
      </template>

      <a-row :gutter="24">
        <a-col :span="10">
          <div class="bom-image">
            <img :src="bom.image" />
          </div>
          <div class="bom-tags">
            <a-tag v-if="bom.isHot" color="red">热门</a-tag>
            <a-tag v-if="bom.isRecommend" color="blue">推荐</a-tag>
          </div>
        </a-col>
        <a-col :span="14">
          <h2 class="bom-title">{{ bom.name }}</h2>
          <p class="bom-desc">{{ bom.description }}</p>
          
          <div class="bom-price-box">
            <div class="price-row">
              <span class="label">套餐价格：</span>
              <span class="price">¥{{ bom.price }}</span>
              <span class="unit">/套</span>
            </div>
            <div class="meta-row">
              <span>包含 {{ bom.skuCount }} 种SKU</span>
              <span>已售 {{ bom.salesCount }} 件</span>
              <span>好评率 {{ bom.goodRate }}%</span>
            </div>
          </div>

          <a-divider />

          <div class="bom-attrs">
            <div class="attr-row">
              <span class="label">适用场景：</span>
              <span>{{ bom.scenarios?.join('、') }}</span>
            </div>
            <div class="attr-row">
              <span class="label">供应商策略：</span>
              <a-tag :color="getStrategyColor(bom.strategy)">{{ getStrategyText(bom.strategy) }}</a-tag>
              <a-tooltip :content="getStrategyDesc(bom.strategy)">
                <icon-question-circle class="help-icon" />
              </a-tooltip>
            </div>
          </div>

          <a-divider />

          <div class="purchase-box">
            <div class="quantity-row">
              <span class="label">购买数量：</span>
              <a-input-number v-model="quantity" :min="1" :max="999" />
              <span class="stock-hint">（库存充足）</span>
            </div>
            <div class="action-row">
              <a-button type="primary" size="large" @click="handleBuy">
                立即购买
              </a-button>
              <a-button size="large" @click="handleAddToCart">
                加入购物车
              </a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <a-card title="SKU明细（可选择性购买）" class="mt-16">
      <template #extra>
        <a-space>
          <a-button type="text" @click="handleSelectAll">全选</a-button>
          <a-button type="text" @click="handleClearSelection">清空选择</a-button>
        </a-space>
      </template>

      <a-alert type="info" style="margin-bottom: 16px">
        您可以自由选择需要的SKU进行购买，非必选SKU可以剔除
      </a-alert>

      <a-table :data="bom.skuList" :row-selection="rowSelection" v-model:selectedKeys="selectedSkuKeys" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div class="product-info">
                <img :src="record.image" class="product-image" />
                <span>{{ record.name }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="供应商" :width="120">
            <template #cell="{ record }">
              <span>{{ record.supplierName }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.quantity" :min="1" size="small" style="width: 80px" />
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="小计" :width="100" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ (record.price * record.quantity).toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="属性" :width="80" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.required ? 'red' : 'green'" size="small">
                {{ record.required ? '必选' : '可选' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="selection-summary">
        <div class="summary-left">
          已选择 <strong>{{ selectedSkuKeys.length }}</strong> 种SKU
          <span v-if="selectedSkuKeys.length < bom.skuList.length">
            （已剔除 {{ bom.skuList.length - selectedSkuKeys.length }} 种）
          </span>
        </div>
        <div class="summary-right">
          <span class="total-label">已选SKU总价：</span>
          <span class="total-price">¥{{ selectedTotalPrice }}</span>
          <span class="quantity-hint">× {{ quantity }} 套</span>
          <span class="final-price">合计：<strong>¥{{ finalTotalPrice }}</strong></span>
        </div>
      </div>
    </a-card>

    <a-card title="供应商策略说明" class="mt-16">
      <div class="strategy-detail">
        <div v-if="bom.strategy === 'smart'" class="strategy-card">
          <div class="strategy-icon"><icon-robot /></div>
          <div class="strategy-content">
            <div class="strategy-title">智能分配模式</div>
            <div class="strategy-desc">
              系统将根据价格、评分、供货时效等因素，自动为每个SKU选择最优供应商。
              下单后系统会自动拆分为多个供应商订单，各供应商分别发货。
            </div>
          </div>
        </div>
        <div v-if="bom.strategy === 'single'" class="strategy-card">
          <div class="strategy-icon"><icon-shop /></div>
          <div class="strategy-content">
            <div class="strategy-title">单一供应商模式</div>
            <div class="strategy-desc">
              整个BOM包统一从指定供应商采购，可能获得打包折扣。
              所有SKU将统一发货，收货更方便。
            </div>
          </div>
        </div>
        <div v-if="bom.strategy === 'sku'" class="strategy-card">
          <div class="strategy-icon"><icon-list /></div>
          <div class="strategy-content">
            <div class="strategy-title">SKU级指定模式</div>
            <div class="strategy-desc">
              每个SKU已指定优质供应商，确保品质和供应稳定性。
              下单后按供应商拆分订单，各供应商分别发货。
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const quantity = ref(1)
const selectedSkuKeys = ref<string[]>([])

const bom = ref({
  id: '1',
  name: '水电材料标准包',
  image: 'https://picsum.photos/600/400?random=1',
  description: '适用于标准住宅水电改造工程，包含给排水管材、电线电缆、开关插座等基础材料，一站式采购省心省力。',
  price: '3,580.00',
  skuCount: 12,
  salesCount: 156,
  goodRate: 98.5,
  isHot: true,
  isRecommend: true,
  scenarios: ['住宅装修', '商业空间'],
  strategy: 'smart',
  skuList: [
    { skuId: '1', skuCode: 'SKU-SN-001', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', supplierName: '华新水泥', price: 420, quantity: 10, unit: '吨', required: true },
    { skuId: '2', skuCode: 'SKU-FS-001', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', supplierName: '东方雨虹', price: 280, quantity: 5, unit: '桶', required: true },
    { skuId: '3', skuCode: 'SKU-GD-001', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', supplierName: '伟星管业', price: 35, quantity: 20, unit: '根', required: false },
    { skuId: '4', skuCode: 'SKU-DB-001', name: '电线 BV2.5', image: 'https://picsum.photos/60/60?random=4', spec: '2.5mm²', supplierName: '远东电缆', price: 180, quantity: 5, unit: '卷', required: true },
    { skuId: '5', skuCode: 'SKU-KG-001', name: '开关插座', image: 'https://picsum.photos/60/60?random=5', spec: '五孔', supplierName: '公牛电器', price: 15, quantity: 30, unit: '个', required: false },
  ],
})

const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
  checkboxProps: (record: any) => ({
    disabled: record.required,
  }),
}))

const selectedTotalPrice = computed(() => {
  const total = bom.value.skuList
    .filter(sku => selectedSkuKeys.value.includes(sku.skuId) || sku.required)
    .reduce((sum, sku) => sum + sku.price * sku.quantity, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

const finalTotalPrice = computed(() => {
  const price = parseFloat(selectedTotalPrice.value.replace(/,/g, ''))
  return (price * quantity.value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

function getStrategyColor(strategy: string) {
  const colors: Record<string, string> = {
    smart: 'blue',
    single: 'green',
    sku: 'purple',
  }
  return colors[strategy] || 'gray'
}

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
    smart: '系统自动选择最优供应商',
    single: '统一从指定供应商采购',
    sku: '每个SKU已指定供应商',
  }
  return descs[strategy] || ''
}

function handleSelectAll() {
  selectedSkuKeys.value = bom.value.skuList.map(sku => sku.skuId)
}

function handleClearSelection() {
  selectedSkuKeys.value = bom.value.skuList.filter(sku => sku.required).map(sku => sku.skuId)
}

function handleBuy() {
  const selectedSkus = bom.value.skuList.filter(sku => selectedSkuKeys.value.includes(sku.skuId) || sku.required)
  if (selectedSkus.length === 0) {
    Message.warning('请至少选择一个SKU')
    return
  }
  router.push(`/warehouse/market/bom/order/${bom.value.id}`)
}

function handleAddToCart() {
  Message.success('已加入购物车')
}
</script>

<style scoped lang="less">
.bom-detail {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.bom-image {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
}

.bom-tags {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.bom-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.bom-desc {
  color: var(--color-text-2);
  line-height: 1.6;
  margin-bottom: 16px;
}

.bom-price-box {
  background: rgb(var(--gray-1));
  padding: 16px;
  border-radius: 8px;
  
  .price-row {
    margin-bottom: 8px;
    
    .label {
      color: var(--color-text-2);
    }
    
    .price {
      font-size: 28px;
      font-weight: 600;
      color: #f53f3f;
    }
    
    .unit {
      color: var(--color-text-3);
      font-size: 14px;
    }
  }
  
  .meta-row {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--color-text-3);
  }
}

.bom-attrs {
  .attr-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .label {
      color: var(--color-text-2);
      width: 100px;
    }
    
    .help-icon {
      margin-left: 4px;
      color: var(--color-text-3);
      cursor: help;
    }
  }
}

.purchase-box {
  .quantity-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .label {
      color: var(--color-text-2);
      margin-right: 12px;
    }
    
    .stock-hint {
      margin-left: 12px;
      color: var(--color-text-3);
      font-size: 12px;
    }
  }
  
  .action-row {
    display: flex;
    gap: 12px;
  }
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 8px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.selection-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 16px;
  background: rgb(var(--gray-1));
  border-radius: 8px;
  
  .summary-left {
    font-size: 14px;
    
    strong {
      color: #165dff;
    }
  }
  
  .summary-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .total-label {
      color: var(--color-text-2);
    }
    
    .total-price {
      font-size: 18px;
      font-weight: 500;
      color: #f53f3f;
    }
    
    .quantity-hint {
      color: var(--color-text-3);
    }
    
    .final-price {
      margin-left: 16px;
      
      strong {
        font-size: 24px;
        color: #f53f3f;
      }
    }
  }
}

.strategy-detail {
  padding: 16px;
  background: rgb(var(--gray-1));
  border-radius: 8px;
}

.strategy-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  
  .strategy-icon {
    width: 48px;
    height: 48px;
    background: rgb(var(--primary-1));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: rgb(var(--primary-6));
  }
  
  .strategy-content {
    flex: 1;
  }
  
  .strategy-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .strategy-desc {
    font-size: 13px;
    color: var(--color-text-2);
    line-height: 1.6;
  }
}
</style>
