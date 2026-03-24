<template>
  <div class="market-page">
    <a-layout class="market-layout">
      <a-layout-sider :width="200" class="category-sider">
        <a-card title="商品分类" :bordered="false">
          <a-tree
            :data="categoryTree"
            :selected-keys="selectedCategoryKeys"
            @select="handleCategorySelect"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
          >
            <template #title="node">
              <span class="tree-node-title">
                <span>{{ node.name }}</span>
                <span class="tree-node-count">({{ node.count || 0 }})</span>
              </span>
            </template>
          </a-tree>
        </a-card>
      </a-layout-sider>
      
      <a-layout-content class="market-content">
        <a-card>
          <template #title>
            <a-space>
              <a-input-search
                v-model="keyword"
                placeholder="搜索商品名称/编码"
                style="width: 300px"
                @search="handleSearch"
              />
            </a-space>
          </template>
          <template #extra>
            <a-space>
              <a-badge :count="cartCount" :dot="cartCount > 0">
                <a-button type="outline" @click="handleGoCart">
                  <template #icon><icon-shopping-cart /></template>
                  购物车
                </a-button>
              </a-badge>
            </a-space>
          </template>

          <div class="filter-bar">
            <a-radio-group v-model="sortType" type="button" size="small">
              <a-radio value="default">综合</a-radio>
              <a-radio value="sales">销量</a-radio>
              <a-radio value="price">价格</a-radio>
            </a-radio-group>
          </div>

          <div class="product-grid">
            <div 
              class="product-card" 
              v-for="item in filteredProducts" 
              :key="item.id"
              @click="handleViewDetail(item)"
            >
              <div class="product-image">
                <img :src="item.mainImage" alt="" />
                <div class="product-tags">
                  <a-tag v-if="item.isHot" color="red">热销</a-tag>
                  <a-tag v-if="item.isRecommend" color="blue">推荐</a-tag>
                </div>
              </div>
              <div class="product-info">
                <div class="product-name">{{ item.skuName }}</div>
                <div class="product-spec">{{ formatSpecs(item.specs) }}</div>
                <div class="product-supplier" v-if="item.suppliers?.length > 1">
                  <span class="supplier-count">{{ item.suppliers.length }}家供应商</span>
                  <span class="min-price">最低 ¥{{ getMinPrice(item.suppliers) }}</span>
                </div>
                <div class="product-bottom">
                  <div class="product-price">
                    <span class="price-symbol">¥</span>
                    <span class="price-value">{{ getMinPrice(item.suppliers) || item.supplyPrice }}</span>
                    <span class="price-unit">/{{ item.unit }}</span>
                  </div>
                  <a-button type="primary" size="small" @click.stop="handleQuickAdd(item)">
                    <template #icon><icon-plus /></template>
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty" v-if="filteredProducts.length === 0">
            <a-empty description="暂无商品" />
          </div>
        </a-card>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const keyword = ref('')
const sortType = ref('default')
const selectedCategoryKeys = ref<string[]>([])
const cartCount = ref(0)

const categoryTree = ref([
  {
    id: 'all',
    name: '全部分类',
    count: 50,
    children: [
      { id: 'cement', name: '水泥', count: 15 },
      { id: 'steel', name: '钢材', count: 12 },
      { id: 'sand', name: '砂石', count: 8 },
      { id: 'concrete', name: '混凝土', count: 10 },
      { id: 'brick', name: '砌体材料', count: 5 },
    ],
  },
])

const products = ref([
  {
    id: 'mp001',
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    categoryName: '水泥',
    categoryId: 'cement',
    specs: { '强度等级': '42.5' },
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    isHot: true,
    isRecommend: true,
    suppliers: [
      { supplierId: 's001', supplierName: '华新水泥供应商', supplyPrice: 420, supplyStatus: 'supplying', estimatedStock: 500 },
      { supplierId: 's002', supplierName: '海螺水泥供应商', supplyPrice: 415, supplyStatus: 'supplying', estimatedStock: 300 },
    ],
  },
  {
    id: 'mp002',
    skuId: 'sku002',
    skuCode: 'SKU-GC-002-16',
    skuName: '螺纹钢 HRB400 16mm',
    categoryName: '钢材',
    categoryId: 'steel',
    specs: { '规格': '16mm' },
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    isHot: false,
    isRecommend: false,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 4000, supplyStatus: 'supplying', estimatedStock: 100 },
    ],
  },
  {
    id: 'mp003',
    skuId: 'sku003',
    skuCode: 'SKU-SS-003',
    skuName: '黄砂 中砂',
    categoryName: '砂石',
    categoryId: 'sand',
    specs: { '类型': '中砂' },
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    isHot: false,
    isRecommend: true,
    suppliers: [
      { supplierId: 's004', supplierName: '南方建材供应商', supplyPrice: 80, supplyStatus: 'supplying', estimatedStock: 1000 },
    ],
  },
  {
    id: 'mp004',
    skuId: 'sku004',
    skuCode: 'SKU-HNT-004-C30',
    skuName: '商品混凝土 C30',
    categoryName: '混凝土',
    categoryId: 'concrete',
    specs: { '强度等级': 'C30' },
    mainImage: 'https://picsum.photos/200/200?random=4',
    unit: '方',
    isHot: true,
    isRecommend: false,
    suppliers: [
      { supplierId: 's005', supplierName: '中建混凝土供应商', supplyPrice: 380, supplyStatus: 'supplying', estimatedStock: 500 },
    ],
  },
  {
    id: 'mp005',
    skuId: 'sku005',
    skuCode: 'SKU-GC-005-20',
    skuName: '螺纹钢 HRB400 20mm',
    categoryName: '钢材',
    categoryId: 'steel',
    specs: { '规格': '20mm' },
    mainImage: 'https://picsum.photos/200/200?random=5',
    unit: '吨',
    isHot: false,
    isRecommend: false,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 3950, supplyStatus: 'supplying', estimatedStock: 150 },
      { supplierId: 's006', supplierName: '沙钢供应商', supplyPrice: 3880, supplyStatus: 'supplying', estimatedStock: 200 },
    ],
  },
  {
    id: 'mp006',
    skuId: 'sku006',
    skuCode: 'SKU-QT-006',
    skuName: '加气混凝土砌块 600x240x200',
    categoryName: '砌体材料',
    categoryId: 'brick',
    specs: { '规格': '600x240x200' },
    mainImage: 'https://picsum.photos/200/200?random=6',
    unit: '块',
    isHot: false,
    isRecommend: true,
    suppliers: [
      { supplierId: 's007', supplierName: '新型建材供应商', supplyPrice: 8.5, supplyStatus: 'supplying', estimatedStock: 5000 },
    ],
  },
])

const filteredProducts = computed(() => {
  let result = products.value
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(kw) || 
      p.skuCode.toLowerCase().includes(kw)
    )
  }
  
  if (selectedCategoryKeys.value.length > 0 && selectedCategoryKeys.value[0] !== 'all') {
    result = result.filter(p => p.categoryId === selectedCategoryKeys.value[0])
  }
  
  return result
})

function formatSpecs(specs: Record<string, string>) {
  return Object.entries(specs || {}).map(([k, v]) => v).join(' / ')
}

function getMinPrice(suppliers: any[]) {
  const min = suppliers.reduce((m, s) => s.supplyPrice < m ? s.supplyPrice : m, suppliers[0].supplyPrice)
  return min.toFixed(2)
}

function handleSearch() {
  Message.info('搜索完成')
}

function handleCategorySelect(keys: string[]) {
  selectedCategoryKeys.value = keys
}

function handleViewDetail(item: any) {
  router.push(`/warehouse/market/detail/${item.id}`)
}

function handleQuickAdd(item: any) {
  if (item.suppliers?.length > 1) {
    router.push(`/warehouse/market/detail/${item.id}?action=cart`)
  } else {
    cartCount.value++
    Message.success('已加入购物车')
  }
}

function handleGoCart() {
  router.push('/warehouse/market/cart')
}
</script>

<style scoped lang="less">
.market-page {
  padding: 16px;
  height: calc(100vh - 120px);
}

.market-layout {
  height: 100%;
  background: transparent;
}

.category-sider {
  background: var(--color-bg-1);
  margin-right: 16px;
  border-radius: 4px;
  overflow: auto;
}

.market-content {
  background: transparent;
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tree-node-count {
  color: var(--color-text-3);
  font-size: 12px;
  margin-left: 4px;
}

.filter-bar {
  margin-bottom: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.product-card {
  background: var(--color-bg-1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-border);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.product-image {
  position: relative;
  height: 180px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-tags {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 4px;
  }
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-spec {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 8px;
}

.product-supplier {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  .supplier-count {
    font-size: 12px;
    color: rgb(var(--primary-6));
    background: rgb(var(--primary-1));
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .min-price {
    font-size: 12px;
    color: rgb(var(--danger-6));
  }
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  color: rgb(var(--danger-6));
}

.price-value {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--danger-6));
}

.price-unit {
  font-size: 12px;
  color: var(--color-text-3);
  margin-left: 2px;
}

.empty {
  padding: 60px 0;
}
</style>
