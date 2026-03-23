<template>
  <div class="product-detail-page">
    <a-row :gutter="24">
      <a-col :span="10">
        <a-card>
          <a-carousel auto-play style="height: 400px">
            <a-carousel-item v-for="(img, index) in product.images" :key="index">
              <img :src="img" style="width: 100%; height: 100%; object-fit: cover" />
            </a-carousel-item>
          </a-carousel>
        </a-card>
        
        <a-card title="商品信息" style="margin-top: 16px">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="商品名称">{{ product.spuName }}</a-descriptions-item>
            <a-descriptions-item label="商品分类">{{ product.categoryName }}</a-descriptions-item>
            <a-descriptions-item label="商品描述">
              {{ product.description || '暂无描述' }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      
      <a-col :span="14">
        <a-card>
          <div class="product-header">
            <div class="product-tags">
              <a-tag v-if="product.isHot" color="red">热销</a-tag>
              <a-tag v-if="product.isRecommend" color="blue">推荐</a-tag>
            </div>
            <h2 class="product-name">{{ product.spuName }}</h2>
            <div class="product-code">SPU编码：{{ product.spuCode }}</div>
          </div>
          
          <div class="price-section">
            <div class="price-row">
              <span class="price-label">价格区间</span>
              <div class="price-value">
                <span class="symbol">¥</span>
                <span class="amount">{{ product.priceRange }}</span>
              </div>
            </div>
          </div>
          
          <a-divider />
          
          <div class="supplier-section">
            <div class="section-title">选择供应商</div>
            <div class="supplier-list">
              <div 
                class="supplier-item"
                :class="{ active: selectedSupplier?.supplierId === s.supplierId }"
                v-for="s in product.suppliers" 
                :key="s.supplierId"
                @click="handleSelectSupplier(s)"
              >
                <div class="supplier-radio">
                  <icon-check v-if="selectedSupplier?.supplierId === s.supplierId" />
                </div>
                <div class="supplier-info">
                  <div class="supplier-name">{{ s.supplierName }}</div>
                  <div class="supplier-meta">
                    <span class="delivery">供货周期：{{ s.deliveryDays }}天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <a-divider />
          
          <div class="sku-section">
            <div class="section-title">
              <span>选择规格</span>
              <a-checkbox v-model="selectAllSku" @change="handleSelectAllSku">全选</a-checkbox>
            </div>
            
            <div class="sku-table-wrapper">
              <a-table 
                :data="skuList" 
                :pagination="false"
                :bordered="{ cell: true }"
                row-key="skuId"
              >
                <template #columns>
                  <a-table-column title="选择" :width="60" align="center">
                    <template #cell="{ record }">
                      <a-checkbox 
                        v-model="record.selected" 
                        :disabled="record.supplyStatus === 'paused'"
                        @change="handleSkuSelectChange"
                      />
                    </template>
                  </a-table-column>
                  <a-table-column title="规格信息" :width="180">
                    <template #cell="{ record }">
                      <div class="sku-info">
                        <div class="sku-image">
                          <img :src="record.image || product.mainImage" alt="" />
                        </div>
                        <div class="sku-detail">
                          <div class="sku-name">
                            {{ record.skuName }}
                            <a-tag v-if="record.supplyStatus === 'paused'" color="orange" size="small">暂停供货</a-tag>
                          </div>
                          <div class="sku-spec">{{ formatSpecs(record.specs) }}</div>
                          <div class="sku-type-tag">
                            <a-tag :color="record.type === 'spu' ? 'green' : 'blue'" size="small">
                              {{ record.type === 'spu' ? 'SPU' : 'SKU' }}
                            </a-tag>
                          </div>
                        </div>
                      </div>
                    </template>
                  </a-table-column>
                  <a-table-column title="编码" :width="120">
                    <template #cell="{ record }">
                      <span class="sku-code">{{ record.skuCode }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="单价" :width="90">
                    <template #cell="{ record }">
                      <div class="sku-price">
                        <span class="symbol">¥</span>
                        <span class="amount">{{ getSkuPrice(record) }}</span>
                      </div>
                    </template>
                  </a-table-column>
                  <a-table-column title="最小起订" :width="90">
                    <template #cell="{ record }">
                      <span>{{ getSkuMinOrder(record) }} {{ record.unit }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="供货周期" :width="90">
                    <template #cell="{ record }">
                      <span>{{ getSkuDeliveryDays(record) }}天</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="数量" :width="140">
                    <template #cell="{ record }">
                      <a-input-number
                        v-model="record.quantity"
                        :min="getSkuMinOrder(record)"
                        :disabled="!record.selected || record.supplyStatus === 'paused'"
                        mode="button"
                        size="small"
                        style="width: 110px"
                        @change="handleQuantityChange"
                      />
                    </template>
                  </a-table-column>
                  <a-table-column title="小计" :width="100">
                    <template #cell="{ record }">
                      <div class="subtotal" v-if="record.selected && record.quantity > 0">
                        <span class="symbol">¥</span>
                        <span class="amount">{{ getSkuSubtotal(record) }}</span>
                      </div>
                      <span v-else class="no-subtotal">-</span>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </div>
          </div>
          
          <a-divider />
          
          <div class="action-section">
            <div class="total-info">
              <div class="selected-count">
                已选 <span class="count">{{ selectedSkuCount }}</span> 种规格
              </div>
              <div class="total-quantity">
                共 <span class="count">{{ totalQuantity }}</span> 件
              </div>
              <div class="total-price-wrapper">
                <span class="total-label">合计：</span>
                <span class="total-price">¥{{ totalPrice }}</span>
              </div>
            </div>
            <div class="action-buttons">
              <a-button size="large" @click="handleAddCart" :disabled="selectedSkuCount === 0">
                <template #icon><icon-shopping-cart /></template>
                加入购物车
              </a-button>
              <a-button type="primary" size="large" @click="handleBuyNow" :disabled="selectedSkuCount === 0">
                <template #icon><icon-thunderbolt /></template>
                立即购买
              </a-button>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const productId = ref('')
const selectedSupplier = ref<any>(null)
const selectAllSku = ref(false)

const product = ref<any>({
  id: '',
  spuId: '',
  spuCode: '',
  spuName: '',
  categoryName: '',
  mainImage: '',
  images: [],
  priceRange: '420 - 450',
  isHot: true,
  isRecommend: true,
  description: '',
  suppliers: [],
})

const skuList = ref<any[]>([])

const selectedSkuCount = computed(() => {
  return skuList.value.filter(s => s.selected && s.quantity > 0).length
})

const totalQuantity = computed(() => {
  return skuList.value.reduce((sum, s) => {
    if (s.selected && s.quantity > 0) {
      return sum + s.quantity
    }
    return sum
  }, 0)
})

const totalPrice = computed(() => {
  const total = skuList.value.reduce((sum, s) => {
    if (s.selected && s.quantity > 0) {
      const price = getSkuPrice(s)
      return sum + price * s.quantity
    }
    return sum
  }, 0)
  return total.toFixed(2)
})

const selectedSkuList = computed(() => {
  return skuList.value.filter(s => s.selected && s.quantity > 0)
})

onMounted(() => {
  productId.value = route.params.id as string || ''
  loadProductDetail()
})

function loadProductDetail() {
  product.value = {
    id: 'spu001',
    spuId: 'spu001',
    spuCode: 'SPU-SN-001',
    spuName: '水泥 P.O 普通硅酸盐水泥',
    categoryName: '水泥',
    mainImage: 'https://picsum.photos/400/400?random=1',
    images: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
    ],
    priceRange: '375 - 450',
    isHot: true,
    isRecommend: true,
    description: '普通硅酸盐水泥，强度等级32.5/42.5/52.5，适用于一般建筑工程、道路、桥梁等。产品质量稳定，凝结时间适中，强度发展快。',
    suppliers: [
      { 
        supplierId: 's001', 
        supplierName: '华新水泥供应商', 
        deliveryDays: 2,
      },
      { 
        supplierId: 's002', 
        supplierName: '海螺水泥供应商', 
        deliveryDays: 3,
      },
    ],
  }
  
  skuList.value = [
    {
      skuId: 'sku001',
      skuCode: 'SKU-SN-42.5',
      skuName: '水泥 P.O 42.5',
      specs: { '强度等级': '42.5', '包装': '50kg/袋' },
      image: 'https://picsum.photos/100/100?random=11',
      unit: '吨',
      type: 'sku',
      selected: false,
      quantity: 0,
      supplyStatus: 'normal',
      supplierInfo: {
        's001': { price: 420, supplyQuantity: 500, minOrder: 5, deliveryDays: 2 },
        's002': { price: 415, supplyQuantity: 300, minOrder: 10, deliveryDays: 3 },
      }
    },
    {
      skuId: 'sku002',
      skuCode: 'SKU-SN-52.5',
      skuName: '水泥 P.O 52.5',
      specs: { '强度等级': '52.5', '包装': '50kg/袋' },
      image: 'https://picsum.photos/100/100?random=12',
      unit: '吨',
      type: 'sku',
      selected: false,
      quantity: 0,
      supplyStatus: 'normal',
      supplierInfo: {
        's001': { price: 450, supplyQuantity: 200, minOrder: 5, deliveryDays: 2 },
        's002': { price: 445, supplyQuantity: 150, minOrder: 10, deliveryDays: 3 },
      }
    },
    {
      skuId: 'sku003',
      skuCode: 'SKU-SN-32.5',
      skuName: '水泥 P.C 32.5',
      specs: { '强度等级': '32.5', '包装': '50kg/袋' },
      image: 'https://picsum.photos/100/100?random=13',
      unit: '吨',
      type: 'sku',
      selected: false,
      quantity: 0,
      supplyStatus: 'paused',
      supplierInfo: {
        's001': { price: 380, supplyQuantity: 800, minOrder: 5, deliveryDays: 2 },
        's002': { price: 375, supplyQuantity: 600, minOrder: 10, deliveryDays: 3 },
      }
    },
  ]
  
  if (product.value.suppliers?.length > 0) {
    selectedSupplier.value = product.value.suppliers[0]
  }
}

function formatSpecs(specs: Record<string, string>) {
  return Object.entries(specs || {}).map(([k, v]) => v).join(' / ')
}

function getSkuPrice(sku: any) {
  if (!selectedSupplier.value) return 0
  const info = sku.supplierInfo?.[selectedSupplier.value.supplierId]
  return info?.price || 0
}

function getSkuSupplyQuantity(sku: any) {
  if (!selectedSupplier.value) return 0
  const info = sku.supplierInfo?.[selectedSupplier.value.supplierId]
  return info?.supplyQuantity || 0
}

function getSkuMinOrder(sku: any) {
  if (!selectedSupplier.value) return 1
  const info = sku.supplierInfo?.[selectedSupplier.value.supplierId]
  return info?.minOrder || 1
}

function getSkuDeliveryDays(sku: any) {
  if (!selectedSupplier.value) return 0
  const info = sku.supplierInfo?.[selectedSupplier.value.supplierId]
  return info?.deliveryDays || 0
}

function getSkuSubtotal(sku: any) {
  const price = getSkuPrice(sku)
  return (price * sku.quantity).toFixed(2)
}

function handleSelectSupplier(s: any) {
  selectedSupplier.value = s
  skuList.value.forEach(sku => {
    const minOrder = getSkuMinOrder(sku)
    if (sku.quantity > 0 && sku.quantity < minOrder) {
      sku.quantity = minOrder
    }
  })
}

function handleSelectAllSku(checked: boolean) {
  skuList.value.forEach(sku => {
    if (sku.supplyStatus !== 'paused') {
      sku.selected = checked
      if (checked && sku.quantity === 0) {
        sku.quantity = getSkuMinOrder(sku)
      }
    }
  })
}

function handleSkuSelectChange() {
  const selectableSkus = skuList.value.filter(s => s.supplyStatus !== 'paused')
  const allSelected = selectableSkus.every(s => s.selected)
  const hasSelected = selectableSkus.some(s => s.selected)
  selectAllSku.value = allSelected && hasSelected
}

function handleQuantityChange() {
  
}

watch(selectedSkuList, (newVal) => {
  if (newVal.length === 0) {
    selectAllSku.value = false
  }
})

function handleAddCart() {
  if (!selectedSupplier.value) {
    Message.warning('请选择供应商')
    return
  }
  if (selectedSkuCount.value === 0) {
    Message.warning('请选择商品规格')
    return
  }
  
  const cartItems = selectedSkuList.value.map(sku => ({
    skuId: sku.skuId,
    skuName: sku.skuName,
    skuCode: sku.skuCode,
    quantity: sku.quantity,
    price: getSkuPrice(sku),
    supplierId: selectedSupplier.value.supplierId,
    supplierName: selectedSupplier.value.supplierName,
  }))
  
  console.log('加入购物车:', cartItems)
  Message.success(`已将 ${selectedSkuCount.value} 种规格加入购物车`)
}

function handleBuyNow() {
  if (!selectedSupplier.value) {
    Message.warning('请选择供应商')
    return
  }
  if (selectedSkuCount.value === 0) {
    Message.warning('请选择商品规格')
    return
  }
  
  const orderItems = selectedSkuList.value.map(sku => ({
    skuId: sku.skuId,
    skuName: sku.skuName,
    skuCode: sku.skuCode,
    specs: sku.specs,
    image: sku.image,
    quantity: sku.quantity,
    price: getSkuPrice(sku),
    unit: sku.unit,
  }))
  
  router.push({
    path: '/warehouse/market/order-create',
    query: {
      supplierId: selectedSupplier.value.supplierId,
      supplierName: selectedSupplier.value.supplierName,
      items: JSON.stringify(orderItems),
    }
  })
}
</script>

<style scoped lang="less">
.product-detail-page {
  padding: 16px;
}

.product-header {
  margin-bottom: 16px;
}

.product-tags {
  margin-bottom: 8px;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.product-code {
  font-size: 13px;
  color: var(--color-text-3);
}

.price-section {
  background: linear-gradient(135deg, #ff6b00, #ff4d4f);
  border-radius: 8px;
  padding: 16px;
  color: #fff;
}

.price-row {
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 13px;
  margin-right: 12px;
  opacity: 0.9;
}

.price-value {
  .symbol {
    font-size: 16px;
  }
  .amount {
    font-size: 28px;
    font-weight: 600;
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.supplier-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.supplier-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: rgb(var(--primary-6));
    background: rgb(var(--primary-1));
  }
  
  &.active {
    border-color: rgb(var(--primary-6));
    background: rgb(var(--primary-1));
    
    .supplier-radio {
      background: rgb(var(--primary-6));
      border-color: rgb(var(--primary-6));
      color: #fff;
    }
  }
}

.supplier-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 12px;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.supplier-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-text-3);
}

.sku-section {
  .sku-table-wrapper {
    border: 1px solid var(--color-border);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .sku-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .sku-image {
      width: 48px;
      height: 48px;
      border-radius: 4px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .sku-detail {
      flex: 1;
      
      .sku-name {
        font-size: 13px;
        color: var(--color-text-1);
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .sku-spec {
        font-size: 11px;
        color: var(--color-text-3);
        margin-bottom: 2px;
      }
      
      .sku-type-tag {
        margin-top: 2px;
      }
    }
  }
  
  .sku-code {
    font-size: 12px;
    color: var(--color-text-3);
    font-family: monospace;
  }
  
  .sku-price {
    .symbol {
      font-size: 12px;
      color: rgb(var(--danger-6));
    }
    .amount {
      font-size: 14px;
      font-weight: 500;
      color: rgb(var(--danger-6));
    }
  }
  
  .subtotal {
    .symbol {
      font-size: 12px;
      color: rgb(var(--danger-6));
    }
    .amount {
      font-size: 14px;
      font-weight: 600;
      color: rgb(var(--danger-6));
    }
  }
  
  .no-subtotal {
    color: var(--color-text-4);
  }
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 24px;
  
  .selected-count, .total-quantity {
    font-size: 13px;
    color: var(--color-text-2);
    
    .count {
      font-size: 16px;
      font-weight: 600;
      color: rgb(var(--primary-6));
    }
  }
  
  .total-price-wrapper {
    display: flex;
    align-items: baseline;
  }
  
  .total-label {
    font-size: 14px;
    color: var(--color-text-2);
  }
  
  .total-price {
    font-size: 24px;
    font-weight: 600;
    color: rgb(var(--danger-6));
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style>
