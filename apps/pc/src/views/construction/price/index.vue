<template>
  <div class="page-container">
    <a-card :bordered="false" class="header-card">
      <div class="warehouse-info">
        <div class="info-item">
          <span class="label">工程仓名称：</span>
          <span class="value">{{ warehouseName }}</span>
        </div>
        <div class="info-item">
          <span class="label">价格策略：</span>
          <span class="value">{{ priceStrategyText }}</span>
        </div>
      </div>
    </a-card>
    
    <a-card :bordered="false" class="strategy-card">
      <template #title>
        <span>价格策略设置</span>
      </template>
      
      <a-form :model="strategyForm" layout="inline">
        <a-form-item label="策略类型">
          <a-radio-group v-model="strategyForm.type" @change="handleStrategyChange">
            <a-radio value="default">默认价格（使用市场价）</a-radio>
            <a-radio value="markup">加价策略</a-radio>
            <a-radio value="discount">折扣策略</a-radio>
            <a-radio value="custom">自定义价格</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <template v-if="strategyForm.type === 'markup'">
          <a-form-item label="加价方式">
            <a-select v-model="strategyForm.markupType" style="width: 120px">
              <a-option value="fixed">固定金额</a-option>
              <a-option value="percent">百分比</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="加价值">
            <a-input-number 
              v-model="strategyForm.markupValue" 
              :min="0" 
              :precision="2"
              style="width: 150px"
            >
              <template #suffix>
                {{ strategyForm.markupType === 'percent' ? '%' : '元' }}
              </template>
            </a-input-number>
          </a-form-item>
        </template>
        
        <template v-if="strategyForm.type === 'discount'">
          <a-form-item label="折扣率">
            <a-input-number 
              v-model="strategyForm.discountRate" 
              :min="0" 
              :max="100"
              :precision="1"
              style="width: 150px"
            >
              <template #suffix>%</template>
            </a-input-number>
          </a-form-item>
        </template>
        
        <a-form-item>
          <a-button type="primary" @click="handleApplyStrategy">
            应用策略
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    
    <a-card :bordered="false" class="table-card">
      <template #title>
        <a-space>
          <a-input-search 
            v-model="searchKeyword" 
            placeholder="搜索商品名称/编码" 
            style="width: 280px"
          />
          <a-select v-model="filterCategory" placeholder="商品分类" allow-clear style="width: 150px">
            <a-option value="cement">水泥</a-option>
            <a-option value="steel">钢材</a-option>
            <a-option value="sand">砂石</a-option>
            <a-option value="concrete">混凝土</a-option>
          </a-select>
        </a-space>
      </template>
      
      <template #extra>
        <a-button type="primary" @click="handleSavePrices">
          <template #icon><icon-save /></template>
          保存价格
        </a-button>
      </template>
      
      <a-table :data="filteredProducts" :pagination="pagination" @page-change="handlePageChange">
        <a-table-column title="商品编码" data-index="skuCode" :width="140" />
        <a-table-column title="商品名称" data-index="skuName" :ellipsis="true" />
        <a-table-column title="分类" data-index="categoryName" :width="100" />
        <a-table-column title="市场价" :width="100" align="right">
          <template #cell="{ record }">
            ¥{{ record.marketPrice }}
          </template>
        </a-table-column>
        <a-table-column title="供货价" :width="100" align="right">
          <template #cell="{ record }">
            <span class="supply-price">¥{{ record.supplyPrice }}</span>
          </template>
        </a-table-column>
        <a-table-column title="工程仓价格" :width="140" align="right">
          <template #cell="{ record }">
            <a-input-number 
              v-model="record.warehousePrice" 
              :min="0" 
              :precision="2"
              style="width: 120px"
              :disabled="strategyForm.type !== 'custom'"
            />
          </template>
        </a-table-column>
        <a-table-column title="价差" :width="100" align="right">
          <template #cell="{ record }">
            <span :class="getPriceDiffClass(record)">
              {{ getPriceDiff(record) }}
            </span>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="100" align="center">
          <template #cell="{ record }">
            <a-tag :color="record.priceStatus === 'synced' ? 'green' : 'orange'">
              {{ record.priceStatus === 'synced' ? '已同步' : '待保存' }}
            </a-tag>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Product {
  id: string
  skuCode: string
  skuName: string
  categoryName: string
  marketPrice: number
  supplyPrice: number
  warehousePrice: number
  priceStatus: 'synced' | 'pending'
}

const warehouseId = ref('')
const warehouseName = ref('')
const searchKeyword = ref('')
const filterCategory = ref('')

const strategyForm = reactive({
  type: 'default',
  markupType: 'fixed',
  markupValue: 0,
  discountRate: 100,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const products = ref<Product[]>([
  {
    id: 'p001',
    skuCode: 'SKU-SN-001',
    skuName: '水泥 P.O 42.5 普通硅酸盐水泥',
    categoryName: '水泥',
    marketPrice: 450,
    supplyPrice: 420,
    warehousePrice: 450,
    priceStatus: 'synced',
  },
  {
    id: 'p002',
    skuCode: 'SKU-GC-002',
    skuName: '螺纹钢 HRB400 16mm',
    categoryName: '钢材',
    marketPrice: 4200,
    supplyPrice: 4000,
    warehousePrice: 4200,
    priceStatus: 'synced',
  },
  {
    id: 'p003',
    skuCode: 'SKU-SS-003',
    skuName: '黄砂 中砂',
    categoryName: '砂石',
    marketPrice: 95,
    supplyPrice: 80,
    warehousePrice: 95,
    priceStatus: 'synced',
  },
  {
    id: 'p004',
    skuCode: 'SKU-HNT-004',
    skuName: '商品混凝土 C30',
    categoryName: '混凝土',
    marketPrice: 420,
    supplyPrice: 380,
    warehousePrice: 420,
    priceStatus: 'synced',
  },
  {
    id: 'p005',
    skuCode: 'SKU-GC-005',
    skuName: '螺纹钢 HRB400 20mm',
    categoryName: '钢材',
    marketPrice: 4250,
    supplyPrice: 3950,
    warehousePrice: 4250,
    priceStatus: 'synced',
  },
])

const filteredProducts = computed(() => {
  let result = products.value
  
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(kw) || 
      p.skuCode.toLowerCase().includes(kw)
    )
  }
  
  if (filterCategory.value) {
    const categoryMap: Record<string, string> = {
      cement: '水泥',
      steel: '钢材',
      sand: '砂石',
      concrete: '混凝土',
    }
    result = result.filter(p => p.categoryName === categoryMap[filterCategory.value])
  }
  
  pagination.total = result.length
  return result
})

const priceStrategyText = computed(() => {
  const texts: Record<string, string> = {
    default: '默认价格',
    markup: '加价策略',
    discount: '折扣策略',
    custom: '自定义价格',
  }
  return texts[strategyForm.type]
})

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  warehouseId.value = urlParams.get('warehouseId') || ''
  warehouseName.value = decodeURIComponent(urlParams.get('warehouseName') || '')
})

function handlePageChange(page: number) {
  pagination.current = page
}

function handleStrategyChange() {
  products.value.forEach(p => {
    p.priceStatus = 'pending'
  })
}

function handleApplyStrategy() {
  products.value.forEach(p => {
    switch (strategyForm.type) {
      case 'default':
        p.warehousePrice = p.marketPrice
        break
      case 'markup':
        if (strategyForm.markupType === 'fixed') {
          p.warehousePrice = p.marketPrice + strategyForm.markupValue
        } else {
          p.warehousePrice = p.marketPrice * (1 + strategyForm.markupValue / 100)
        }
        break
      case 'discount':
        p.warehousePrice = p.marketPrice * (strategyForm.discountRate / 100)
        break
    }
    p.priceStatus = 'pending'
  })
  
  Message.success('策略已应用，请点击保存按钮确认')
}

function handleSavePrices() {
  products.value.forEach(p => {
    p.priceStatus = 'synced'
  })
  Message.success('价格保存成功')
}

function getPriceDiff(record: Product) {
  const diff = record.warehousePrice - record.marketPrice
  if (diff === 0) return '-'
  return diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)
}

function getPriceDiffClass(record: Product) {
  const diff = record.warehousePrice - record.marketPrice
  if (diff === 0) return 'price-diff-zero'
  return diff > 0 ? 'price-diff-up' : 'price-diff-down'
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}

.header-card {
  margin-bottom: 16px;
}

.warehouse-info {
  display: flex;
  gap: 48px;
}

.info-item {
  display: flex;
  align-items: center;
  
  .label {
    color: var(--color-text-3);
  }
  
  .value {
    font-weight: 500;
  }
}

.strategy-card {
  margin-bottom: 16px;
}

.table-card {
  :deep(.arco-card-body) {
    padding-top: 0;
  }
}

.supply-price {
  color: var(--color-text-3);
}

.price-diff-zero {
  color: var(--color-text-3);
}

.price-diff-up {
  color: rgb(var(--danger-6));
}

.price-diff-down {
  color: rgb(var(--success-6));
}
</style>
