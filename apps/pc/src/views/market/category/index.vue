<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>分类展示管理</span>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="handleExpandAll">展开全部</a-button>
          <a-button @click="handleCollapseAll">收起全部</a-button>
          <a-button type="primary" @click="handleSaveSort">保存排序</a-button>
        </a-space>
      </template>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #title>分类展示说明</template>
        <div>1. 分类直接复用平台标准商品分类，保证分类体系一致</div>
        <div>2. 可设置分类在商品市场的可见性，隐藏的分类下商品不会在市场展示</div>
        <div>3. 可调整分类排序，影响市场分类展示顺序</div>
      </a-alert>

      <a-table
        :data="flatCategoryList"
        :pagination="false"
        :default-expand-all-rows="true"
        row-key="categoryId"
        :scroll="{ x: 1200 }"
      >
        <template #columns>
          <a-table-column title="分类名称" :width="280">
            <template #cell="{ record }">
              <div class="category-name" :style="{ paddingLeft: (record.level - 1) * 24 + 'px' }">
                <icon-down v-if="record.children?.length" class="expand-icon" />
                <span class="name-text">{{ record.categoryName }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="商品总数" :width="100" align="center">
            <template #cell="{ record }">
              <a-link @click="handleViewProducts(record, 'all')">{{ record.productCount || 0 }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="已上架" :width="100" align="center">
            <template #cell="{ record }">
              <span class="status-online">{{ record.onlineCount || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="待上架" :width="100" align="center">
            <template #cell="{ record }">
              <span class="status-pending">{{ (record.productCount || 0) - (record.onlineCount || 0) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="热门商品" :width="100" align="center">
            <template #cell="{ record }">
              <span class="status-hot">{{ record.hotCount || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="推荐商品" :width="100" align="center">
            <template #cell="{ record }">
              <span class="status-recommend">{{ record.recommendCount || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="市场可见" :width="100" align="center">
            <template #cell="{ record }">
              <a-switch
                v-model="record.isVisible"
                @change="(val: boolean) => handleVisibleChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="排序" :width="120" align="center">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.sortOrder"
                size="small"
                :min="0"
                :max="9999"
                style="width: 80px"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewProducts(record, 'all')">
                  查看商品
                </a-button>
                <a-button type="text" size="small" @click="handleViewProducts(record, 'online')">
                  已上架
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="productListVisible"
      :title="`${currentCategory?.categoryName || ''} - 商品列表`"
      :width="1000"
      :footer="false"
    >
      <a-table
        :data="categoryProducts"
        :pagination="productPagination"
        row-key="id"
        @page-change="handleProductPageChange"
      >
        <template #columns>
          <a-table-column title="商品信息" :width="280">
            <template #cell="{ record }">
              <div class="product-info">
                <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
                <div class="product-detail">
                  <div class="product-name">{{ record.skuName }}</div>
                  <div class="product-code">{{ record.skuCode }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供应商" :width="120">
            <template #cell="{ record }">
              {{ record.supplierName }}
            </template>
          </a-table-column>
          <a-table-column title="供货价" :width="100">
            <template #cell="{ record }">
              ¥{{ record.supplyPrice?.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="市场价" :width="100">
            <template #cell="{ record }">
              <span v-if="record.marketPrice">¥{{ record.marketPrice.toFixed(2) }}</span>
              <span v-else class="un-set">未设置</span>
            </template>
          </a-table-column>
          <a-table-column title="市场状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getMarketStatusColor(record.marketStatus)">
                {{ getMarketStatusText(record.marketStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="热门/推荐" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.isHot" color="red" size="small">热门</a-tag>
              <a-tag v-if="record.isRecommend" color="green" size="small">推荐</a-tag>
              <span v-if="!record.isHot && !record.isRecommend">-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { MarketCategory, MarketProduct } from '@gongchengcang/types'

const expandedKeys = ref<string[]>([])
const categoryList = ref<MarketCategory[]>([])
const loading = ref(false)

const productListVisible = ref(false)
const currentCategory = ref<MarketCategory | null>(null)
const currentViewType = ref<'all' | 'online'>('all')
const categoryProducts = ref<MarketProduct[]>([])
const productPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const mockCategoryData: MarketCategory[] = [
  {
    categoryId: 'c1',
    categoryName: '水泥',
    parentId: undefined,
    level: 1,
    sortOrder: 1,
    isVisible: true,
    productCount: 156,
    onlineCount: 120,
    hotCount: 15,
    recommendCount: 20,
    children: [
      {
        categoryId: 'c1-1',
        categoryName: '普通硅酸盐水泥',
        parentId: 'c1',
        level: 2,
        sortOrder: 1,
        isVisible: true,
        productCount: 80,
        onlineCount: 65,
        hotCount: 8,
        recommendCount: 12,
      },
      {
        categoryId: 'c1-2',
        categoryName: '矿渣硅酸盐水泥',
        parentId: 'c1',
        level: 2,
        sortOrder: 2,
        isVisible: true,
        productCount: 45,
        onlineCount: 35,
        hotCount: 5,
        recommendCount: 6,
      },
      {
        categoryId: 'c1-3',
        categoryName: '复合硅酸盐水泥',
        parentId: 'c1',
        level: 2,
        sortOrder: 3,
        isVisible: true,
        productCount: 31,
        onlineCount: 20,
        hotCount: 2,
        recommendCount: 2,
      },
    ],
  },
  {
    categoryId: 'c2',
    categoryName: '钢材',
    parentId: undefined,
    level: 1,
    sortOrder: 2,
    isVisible: true,
    productCount: 234,
    onlineCount: 180,
    hotCount: 25,
    recommendCount: 30,
    children: [
      {
        categoryId: 'c2-1',
        categoryName: '螺纹钢',
        parentId: 'c2',
        level: 2,
        sortOrder: 1,
        isVisible: true,
        productCount: 120,
        onlineCount: 95,
        hotCount: 15,
        recommendCount: 18,
      },
      {
        categoryId: 'c2-2',
        categoryName: '线材',
        parentId: 'c2',
        level: 2,
        sortOrder: 2,
        isVisible: true,
        productCount: 60,
        onlineCount: 45,
        hotCount: 6,
        recommendCount: 8,
      },
      {
        categoryId: 'c2-3',
        categoryName: '型材',
        parentId: 'c2',
        level: 2,
        sortOrder: 3,
        isVisible: true,
        productCount: 54,
        onlineCount: 40,
        hotCount: 4,
        recommendCount: 4,
      },
    ],
  },
  {
    categoryId: 'c3',
    categoryName: '砂石',
    parentId: undefined,
    level: 1,
    sortOrder: 3,
    isVisible: true,
    productCount: 89,
    onlineCount: 70,
    hotCount: 10,
    recommendCount: 12,
    children: [
      {
        categoryId: 'c3-1',
        categoryName: '黄砂',
        parentId: 'c3',
        level: 2,
        sortOrder: 1,
        isVisible: true,
        productCount: 35,
        onlineCount: 28,
        hotCount: 4,
        recommendCount: 5,
      },
      {
        categoryId: 'c3-2',
        categoryName: '碎石',
        parentId: 'c3',
        level: 2,
        sortOrder: 2,
        isVisible: true,
        productCount: 32,
        onlineCount: 25,
        hotCount: 3,
        recommendCount: 4,
      },
      {
        categoryId: 'c3-3',
        categoryName: '机制砂',
        parentId: 'c3',
        level: 2,
        sortOrder: 3,
        isVisible: false,
        productCount: 22,
        onlineCount: 17,
        hotCount: 3,
        recommendCount: 3,
      },
    ],
  },
  {
    categoryId: 'c4',
    categoryName: '混凝土',
    parentId: undefined,
    level: 1,
    sortOrder: 4,
    isVisible: true,
    productCount: 67,
    onlineCount: 50,
    hotCount: 8,
    recommendCount: 10,
  },
  {
    categoryId: 'c5',
    categoryName: '砌体材料',
    parentId: undefined,
    level: 1,
    sortOrder: 5,
    isVisible: true,
    productCount: 45,
    onlineCount: 35,
    hotCount: 5,
    recommendCount: 6,
    children: [
      {
        categoryId: 'c5-1',
        categoryName: '砖',
        parentId: 'c5',
        level: 2,
        sortOrder: 1,
        isVisible: true,
        productCount: 25,
        onlineCount: 20,
        hotCount: 3,
        recommendCount: 4,
      },
      {
        categoryId: 'c5-2',
        categoryName: '砌块',
        parentId: 'c5',
        level: 2,
        sortOrder: 2,
        isVisible: true,
        productCount: 20,
        onlineCount: 15,
        hotCount: 2,
        recommendCount: 2,
      },
    ],
  },
]

const flatCategoryList = computed(() => {
  const result: MarketCategory[] = []
  const flatten = (items: MarketCategory[]) => {
    items.forEach(item => {
      result.push(item)
      if (item.children?.length) {
        flatten(item.children)
      }
    })
  }
  flatten(categoryList.value)
  return result
})

function handleExpandAll() {
  const keys: string[] = []
  const collectKeys = (items: MarketCategory[]) => {
    items.forEach(item => {
      if (item.children?.length) {
        keys.push(item.categoryId)
        collectKeys(item.children)
      }
    })
  }
  collectKeys(categoryList.value)
  expandedKeys.value = keys
  Message.success('已展开全部')
}

function handleCollapseAll() {
  expandedKeys.value = []
  Message.success('已收起全部')
}

function handleVisibleChange(record: MarketCategory, visible: boolean) {
  Message.success(`已${visible ? '显示' : '隐藏'}分类【${record.categoryName}】`)
}

async function handleSaveSort() {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  loading.value = false
  Message.success('排序保存成功')
}

function handleViewProducts(record: MarketCategory, type: 'all' | 'online') {
  currentCategory.value = record
  currentViewType.value = type
  productListVisible.value = true
  loadCategoryProducts()
}

function loadCategoryProducts() {
  const allProducts: MarketProduct[] = []
  for (let i = 1; i <= 15; i++) {
    allProducts.push({
      id: `mp${i}`,
      skuId: `sku${i}`,
      skuCode: `SKU-${String(i).padStart(3, '0')}`,
      skuName: `${currentCategory.value?.categoryName || ''}商品${i}`,
      spuId: `spu${i}`,
      spuName: `${currentCategory.value?.categoryName || ''}SPU${i}`,
      categoryId: currentCategory.value?.categoryId || '',
      categoryName: currentCategory.value?.categoryName || '',
      specs: { 规格: `规格${i}` },
      mainImage: `https://picsum.photos/200/200?random=${i}`,
      supplierId: `s${i % 3 + 1}`,
      supplierName: ['华新供应商', '海螺供应商', '南方供应商'][i % 3],
      supplyPrice: 100 + i * 10,
      supplyStatus: 'supplying',
      marketStatus: i % 3 === 0 ? 'pending' : 'online',
      marketPrice: 120 + i * 12,
      isHot: i <= 3,
      isRecommend: i <= 5,
      tags: i <= 3 ? ['热门'] : i <= 5 ? ['推荐'] : [],
      sortWeight: i,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    })
  }
  
  if (currentViewType.value === 'online') {
    categoryProducts.value = allProducts.filter(p => p.marketStatus === 'online')
  } else {
    categoryProducts.value = allProducts
  }
  productPagination.value.total = categoryProducts.value.length
}

function handleProductPageChange(page: number) {
  productPagination.value.current = page
}

function getMarketStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    online: 'green',
    offline: 'gray',
  }
  return colorMap[status] || 'gray'
}

function getMarketStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待上架',
    online: '已上架',
    offline: '已下架',
  }
  return textMap[status] || status
}

onMounted(() => {
  categoryList.value = mockCategoryData
})
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.category-name {
  display: flex;
  align-items: center;
  
  .expand-icon {
    margin-right: 8px;
    transition: transform 0.2s;
  }
  
  .name-text {
    font-weight: 500;
  }
}

.status-online {
  color: var(--color-success-6);
  font-weight: 500;
}

.status-pending {
  color: var(--color-warning-6);
}

.status-hot {
  color: var(--color-danger-6);
  font-weight: 500;
}

.status-recommend {
  color: var(--color-success-6);
  font-weight: 500;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .product-detail {
    .product-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .product-code {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}

.un-set {
  color: var(--color-text-3);
}
</style>
