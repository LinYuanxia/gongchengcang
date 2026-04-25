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
        <a-card :bordered="false">
          <template #extra>
            <a-space>
              <a-input-search
                v-model="keyword"
                placeholder="搜索商品名称/编码"
                style="width: 300px"
                @search="handleSearch"
              />
              <a-badge :count="cartCount" :dot="cartCount > 0">
                <a-button type="primary" @click="handleGoCart">
                  <template #icon><icon-shopping-cart /></template>
                  购物车
                </a-button>
              </a-badge>
            </a-space>
          </template>

          <div class="filter-bar">
            <a-radio-group v-model="sortType" type="button" size="small">
              <a-radio value="default">综合排序</a-radio>
              <a-radio value="price-asc">价格从低到高</a-radio>
              <a-radio value="price-desc">价格从高到低</a-radio>
            </a-radio-group>
          </div>

          <div class="product-grid">
            <div 
              class="product-card" 
              v-for="item in sortedProducts" 
              :key="item.id"
              @click="handleViewDetail(item)"
            >
              <div class="product-image">
                <img :src="item.mainImage" alt="" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ item.skuName }}</div>
                <div class="product-spec">{{ formatSpecs(item.specs) }}</div>
                <div class="product-brand">{{ item.brand }}</div>
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
                  <a-button type="primary" size="small" @click.stop="handleAddCart(item)">
                    <template #icon><icon-plus /></template>
                    加入购物车
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
const selectedCategoryKeys = ref<string[]>(['all'])
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
    skuName: '水泥 P.O 42.5 袋装',
    categoryName: '水泥',
    categoryId: 'cement',
    brand: '华润',
    specs: { '强度等级': '42.5', '包装': '袋装' },
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    supplyPrice: 420,
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
    brand: '宝钢',
    specs: { '规格': '16mm' },
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    supplyPrice: 4000,
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
    brand: '南方建材',
    specs: { '类型': '中砂' },
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    supplyPrice: 80,
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
    brand: '中建商砼',
    specs: { '强度等级': 'C30' },
    mainImage: 'https://picsum.photos/200/200?random=4',
    unit: '方',
    supplyPrice: 380,
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
    brand: '沙钢',
    specs: { '规格': '20mm' },
    mainImage: 'https://picsum.photos/200/200?random=5',
    unit: '吨',
    supplyPrice: 3950,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 4000, supplyStatus: 'supplying', estimatedStock: 150 },
      { supplierId: 's006', supplierName: '沙钢供应商', supplyPrice: 3880, supplyStatus: 'supplying', estimatedStock: 200 },
    ],
  },
  {
    id: 'mp006',
    skuId: 'sku006',
    skuCode: 'SKU-ZZ-006',
    skuName: '蒸压加气混凝土砌块 600×200×200',
    categoryName: '砌体材料',
    categoryId: 'brick',
    brand: '海螺新材',
    specs: { '规格': '600×200×200' },
    mainImage: 'https://picsum.photos/200/200?random=6',
    unit: '块',
    supplyPrice: 2.8,
    suppliers: [
      { supplierId: 's007', supplierName: '海螺新材供应商', supplyPrice: 2.8, supplyStatus: 'supplying', estimatedStock: 50000 },
    ],
  },
  {
    id: 'mp007',
    skuId: 'sku007',
    skuCode: 'SKU-SN-007-52.5',
    skuName: '水泥 P.O 52.5 袋装',
    categoryName: '水泥',
    categoryId: 'cement',
    brand: '海螺',
    specs: { '强度等级': '52.5', '包装': '袋装' },
    mainImage: 'https://picsum.photos/200/200?random=7',
    unit: '吨',
    supplyPrice: 510,
    suppliers: [
      { supplierId: 's002', supplierName: '海螺水泥供应商', supplyPrice: 510, supplyStatus: 'supplying', estimatedStock: 200 },
    ],
  },
  {
    id: 'mp008',
    skuId: 'sku008',
    skuCode: 'SKU-GC-008-25',
    skuName: '螺纹钢 HRB400 25mm',
    categoryName: '钢材',
    categoryId: 'steel',
    brand: '武钢',
    specs: { '规格': '25mm' },
    mainImage: 'https://picsum.photos/200/200?random=8',
    unit: '吨',
    supplyPrice: 3900,
    suppliers: [
      { supplierId: 's008', supplierName: '武钢供应商', supplyPrice: 3900, supplyStatus: 'supplying', estimatedStock: 120 },
    ],
  },
])

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const categoryId = selectedCategoryKeys.value[0]
    if (categoryId && categoryId !== 'all' && p.categoryId !== categoryId) return false
    if (keyword.value && !p.skuName.includes(keyword.value) && !p.skuCode.includes(keyword.value)) return false
    return true
  })
})

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value]
  switch (sortType.value) {
    case 'price-asc':
      return list.sort((a, b) => (a.supplyPrice || 0) - (b.supplyPrice || 0))
    case 'price-desc':
      return list.sort((a, b) => (b.supplyPrice || 0) - (a.supplyPrice || 0))
    default:
      return list
  }
})

function formatSpecs(specs: any) {
  if (!specs) return '-'
  return Object.values(specs).join(' / ')
}

function getMinPrice(suppliers: any[]) {
  if (!suppliers || suppliers.length === 0) return 0
  return Math.min(...suppliers.map(s => s.supplyPrice))
}

function handleCategorySelect(keys: string[]) {
  selectedCategoryKeys.value = keys
}

function handleSearch() {
  Message.info(`搜索: ${keyword.value}`)
}

function handleViewDetail(item: any) {
  router.push(`/warehouse/market/detail/${item.id}`)
}

function handleAddCart(item: any) {
  cartCount.value++
  Message.success(`${item.skuName} 已加入购物车`)
}

function handleGoCart() {
  router.push('/warehouse/market/cart')
}
</script>

<style lang="less" scoped>
.market-page {
  .market-layout {
    display: flex;
    gap: 16px;
    
    .category-sider {
      :deep(.arco-layout-sider-children) {
        height: fit-content;
      }
    }
    
    .market-content {
      flex: 1;
      min-width: 0;
    }
  }

  .filter-bar {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e6eb;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .product-card {
      border: 1px solid #e5e6eb;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: #165dff;
      }

      .product-image {
        height: 160px;
        background: #f2f3f5;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .product-info {
        padding: 12px;

        .product-name {
          font-weight: 500;
          color: #1d2129;
          line-height: 1.4;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-spec {
          font-size: 12px;
          color: #86909c;
          margin-bottom: 4px;
        }

        .product-brand {
          font-size: 12px;
          color: #4e5969;
          margin-bottom: 8px;
        }

        .product-supplier {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding: 4px 8px;
          background: #f2f3f5;
          border-radius: 4px;
          margin-bottom: 12px;

          .supplier-count {
            color: #165dff;
          }

          .min-price {
            color: #f53f3f;
            font-weight: 500;
          }
        }

        .product-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .product-price {
            .price-symbol {
              color: #f53f3f;
              font-size: 12px;
            }

            .price-value {
              color: #f53f3f;
              font-size: 20px;
              font-weight: 600;
            }

            .price-unit {
              color: #86909c;
              font-size: 12px;
            }
          }
        }
      }
    }
  }

  .tree-node-title {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;

    .tree-node-count {
      font-size: 12px;
      color: #86909c;
    }
  }
}
</style>
