<template>
  <div class="page-container">
    <a-card :bordered="false" class="search-card">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="工程仓">
          <a-select 
            v-model="searchForm.warehouseId" 
            placeholder="请选择工程仓" 
            allow-clear 
            style="width: 200px"
          >
            <a-option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="商品名称">
          <a-input v-model="searchForm.productName" placeholder="请输入商品名称" allow-clear />
        </a-form-item>
        <a-form-item label="上架状态">
          <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-option value="online">已上架</a-option>
            <a-option value="offline">已下架</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <a-card :bordered="false" class="table-card">
      <template #title>
        <a-space>
          <a-button type="primary" @click="handleAddProducts">
            <template #icon><icon-plus /></template>
            添加商品
          </a-button>
          <a-button status="success" @click="handleBatchOnline" :disabled="!selectedKeys.length">
            <template #icon><icon-check /></template>
            批量上架
          </a-button>
          <a-button status="warning" @click="handleBatchOffline" :disabled="!selectedKeys.length">
            <template #icon><icon-minus /></template>
            批量下架
          </a-button>
        </a-space>
      </template>
      
      <div class="product-layout">
        <div class="category-sidebar">
          <div class="tree-header">
            <span class="title">商品分类</span>
            <a-button type="text" size="small" @click="resetCategory">
              重置
            </a-button>
          </div>
          <a-input-search
            v-model="categorySearchKeyword"
            placeholder="搜索分类"
            style="margin-bottom: 12px"
            allow-clear
          />
          <a-tree
            :data="categoryTreeWithCount"
            :selected-keys="selectedCategoryKeys"
            :expanded-keys="expandedCategoryKeys"
            :field-names="{ key: 'categoryId', title: 'categoryName', children: 'children' }"
            block-node
            @select="handleCategorySelect"
          >
            <template #title="nodeData">
              <span class="category-name">{{ nodeData.categoryName }}</span>
              <span class="category-count">({{ nodeData.skuCount || 0 }})</span>
            </template>
          </a-tree>
        </div>
        <div class="product-content">
          <a-table 
            :data="filteredProducts" 
            :pagination="pagination" 
            :row-selection="rowSelection"
            row-key="id"
            @page-change="handlePageChange"
          >
        <template #columns>
          <a-table-column title="商品编码" data-index="productCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="所属SPU" :width="150">
            <template #cell="{ record }">
              <div class="spu-info">
                <div class="spu-name">{{ record.spuName || '-' }}</div>
                <div v-if="record.spuCode" class="spu-code">{{ record.spuCode }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="所属工程仓" data-index="warehouseName" :width="150" />
          <a-table-column title="销售价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.salePrice }}</span>
            </template>
          </a-table-column>
          <a-table-column title="销售库存" :width="100" align="right">
            <template #cell="{ record }">
              <span class="stock-value">{{ record.saleStock ?? 0 }}</span>
              <span class="stock-unit">{{ record.unit || '件' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="上架状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-switch 
                v-model="record.status" 
                checked-value="online" 
                unchecked-value="offline"
                @change="handleStatusChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="热门" :width="80" align="center">
            <template #cell="{ record }">
              <a-switch 
                v-model="record.isHot" 
                :disabled="record.status === 'offline'"
                @change="handleHotChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="推荐" :width="80" align="center">
            <template #cell="{ record }">
              <a-switch 
                v-model="record.isRecommend" 
                :disabled="record.status === 'offline'"
                @change="handleRecommendChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="80" align="center" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEditPrice(record)">调价</a-link>
                <a-link @click="handleEditStock(record)">库存</a-link>
                <a-popconfirm content="确定要移除该商品吗？" @ok="handleRemove(record)">
                  <a-link status="danger">移除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
          </a-table>
        </div>
      </div>
    </a-card>
    
    <AddProductModal 
      v-model:visible="addProductVisible" 
      :warehouses="warehouses"
      @success="handleAddSuccess"
    />
    
    <PriceEditDrawer 
      v-model:visible="priceEditVisible" 
      :product="currentProduct"
      @success="handlePriceSuccess"
    />
    
    <StockEditDrawer 
      v-model:visible="stockEditVisible" 
      :product="currentProduct"
      @success="handleStockSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import AddProductModal from './components/AddProductModal.vue'
import PriceEditDrawer from './components/PriceEditDrawer.vue'
import StockEditDrawer from './components/StockEditDrawer.vue'

interface ProductCategory {
  categoryId: string
  categoryName: string
  children?: ProductCategory[]
  skuCount?: number
}

interface MarketProduct {
  id: string
  productCode: string
  productName: string
  spuName?: string
  spuCode?: string
  categoryName?: string
  spec: string
  warehouseId: string
  warehouseName: string
  salePrice: number
  saleStock?: number
  unit?: string
  stock: number
  status: 'online' | 'offline'
  isHot: boolean
  isRecommend: boolean
  sort: number
}

const searchForm = reactive({
  warehouseId: '',
  productName: '',
  status: '',
  categoryId: undefined as string[] | undefined,
})

const categorySearchKeyword = ref('')
const selectedCategoryKeys = ref<string[]>([])
const expandedCategoryKeys = ref<string[]>(['C01', 'C02', 'C03', 'C04', 'C05'])

const categoryTree = ref<ProductCategory[]>([
  {
    categoryId: 'C01',
    categoryName: '水泥',
    children: [
      { categoryId: 'C0101', categoryName: '硅酸盐水泥' },
      { categoryId: 'C0102', categoryName: '普通硅酸盐水泥' },
      { categoryId: 'C0103', categoryName: '复合硅酸盐水泥' },
    ],
  },
  {
    categoryId: 'C02',
    categoryName: '钢材',
    children: [
      { categoryId: 'C0201', categoryName: '螺纹钢' },
      { categoryId: 'C0202', categoryName: '线材' },
      { categoryId: 'C0203', categoryName: '盘螺' },
    ],
  },
  {
    categoryId: 'C03',
    categoryName: '砂石',
    children: [
      { categoryId: 'C0301', categoryName: '黄砂' },
      { categoryId: 'C0302', categoryName: '碎石' },
      { categoryId: 'C0303', categoryName: '瓜子片' },
    ],
  },
  {
    categoryId: 'C04',
    categoryName: '混凝土',
    children: [
      { categoryId: 'C0401', categoryName: '商品混凝土' },
      { categoryId: 'C0402', categoryName: '预制构件' },
    ],
  },
  {
    categoryId: 'C05',
    categoryName: '砌体材料',
    children: [
      { categoryId: 'C0501', categoryName: '加气块' },
      { categoryId: 'C0502', categoryName: '标准砖' },
    ],
  },
])

const categoryTreeWithCount = computed(() => {
  const countByCategory: Record<string, number> = {}
  filteredProducts.value.forEach((p) => {
    const categoryName = p.categoryName || '其他'
    countByCategory[categoryName] = (countByCategory[categoryName] || 0) + 1
  })

  function addCountToTree(nodes: ProductCategory[]): ProductCategory[] {
    return nodes.map((node) => {
      let skuCount = 0
      if (node.children && node.children.length > 0) {
        const childrenWithCount = addCountToTree(node.children)
        skuCount = childrenWithCount.reduce((sum, n) => sum + (n.skuCount || 0), 0)
        return {
          ...node,
          children: childrenWithCount,
          skuCount,
        }
      }
      skuCount = countByCategory[node.categoryName] || 0
      return {
        ...node,
        skuCount,
      }
    })
  }

  return addCountToTree(categoryTree.value)
})

function handleCategorySelect(keys: string[]) {
  selectedCategoryKeys.value = keys
  searchForm.categoryId = keys.length > 0 ? keys : undefined
  handleSearch()
}

function resetCategory() {
  selectedCategoryKeys.value = []
  searchForm.categoryId = undefined
  handleSearch()
}

const selectedKeys = ref<string[]>([])
const addProductVisible = ref(false)
const priceEditVisible = ref(false)
const stockEditVisible = ref(false)
const currentProduct = ref<MarketProduct | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const warehouses = ref([
  { id: 'w001', name: '深圳湾科技园项目仓' },
  { id: 'w002', name: '福田CBD项目仓' },
  { id: 'w003', name: '宝安新安项目仓' },
  { id: 'w004', name: '龙岗中心城项目仓' },
  { id: 'w005', name: '南山科技园项目仓' },
])

const products = ref<MarketProduct[]>([
  {
    id: 'mp001',
    productCode: 'SKU-SN-001',
    productName: '水泥 P.O 42.5',
    spuName: '普通硅酸盐水泥',
    spuCode: 'SPU-SN-001',
    categoryName: '水泥',
    spec: '50kg/袋',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 450,
    saleStock: 500,
    unit: '吨',
    stock: 500,
    status: 'online',
    isHot: true,
    isRecommend: true,
    sort: 1,
  },
  {
    id: 'mp002',
    productCode: 'SKU-LG-001',
    productName: '螺纹钢 HRB400 16mm',
    spuName: '螺纹钢',
    spuCode: 'SPU-LG-001',
    categoryName: '钢材',
    spec: '16mm',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 4280,
    saleStock: 200,
    unit: '吨',
    stock: 200,
    status: 'online',
    isHot: false,
    isRecommend: true,
    sort: 2,
  },
  {
    id: 'mp003',
    productCode: 'SKU-HS-001',
    productName: '黄砂 中砂',
    spuName: '黄砂',
    spuCode: 'SPU-HS-001',
    categoryName: '砂石',
    spec: '中砂',
    warehouseId: 'w002',
    warehouseName: '福田CBD项目仓',
    salePrice: 95,
    saleStock: 1000,
    unit: '方',
    stock: 1000,
    status: 'offline',
    isHot: false,
    isRecommend: false,
    sort: 3,
  },
  {
    id: 'mp004',
    productCode: 'SKU-SN-002',
    productName: '水泥 P.O 52.5',
    spuName: '普通硅酸盐水泥',
    spuCode: 'SPU-SN-001',
    spec: '50kg/袋',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 520,
    saleStock: 300,
    unit: '吨',
    stock: 300,
    status: 'online',
    isHot: true,
    isRecommend: false,
    sort: 4,
  },
  {
    id: 'mp005',
    productCode: 'SKU-LG-002',
    productName: '螺纹钢 HRB400 20mm',
    spuName: '螺纹钢',
    spuCode: 'SPU-LG-001',
    spec: '20mm',
    warehouseId: 'w002',
    warehouseName: '福田CBD项目仓',
    salePrice: 4150,
    saleStock: 150,
    unit: '吨',
    stock: 150,
    status: 'online',
    isHot: false,
    isRecommend: true,
    sort: 5,
  },
  {
    id: 'mp006',
    productCode: 'SKU-HNT-001',
    productName: '商品混凝土 C30',
    spuName: '商品混凝土',
    spuCode: 'SPU-HNT-001',
    spec: 'C30',
    warehouseId: 'w003',
    warehouseName: '宝安新安项目仓',
    salePrice: 420,
    saleStock: 800,
    unit: '方',
    stock: 800,
    status: 'online',
    isHot: true,
    isRecommend: true,
    sort: 6,
  },
  {
    id: 'mp007',
    productCode: 'SKU-HNT-002',
    productName: '商品混凝土 C40',
    spuName: '商品混凝土',
    spuCode: 'SPU-HNT-001',
    spec: 'C40',
    warehouseId: 'w003',
    warehouseName: '宝安新安项目仓',
    salePrice: 480,
    saleStock: 600,
    unit: '方',
    stock: 600,
    status: 'online',
    isHot: false,
    isRecommend: false,
    sort: 7,
  },
  {
    id: 'mp008',
    productCode: 'SKU-FS-001',
    productName: '防水涂料 聚氨酯',
    spuName: '防水涂料',
    spuCode: 'SPU-FS-001',
    spec: '20kg/桶',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 380,
    saleStock: 200,
    unit: '桶',
    stock: 200,
    status: 'online',
    isHot: false,
    isRecommend: true,
    sort: 8,
  },
  {
    id: 'mp009',
    productCode: 'SKU-QG-001',
    productName: '轻钢龙骨 50型',
    spuName: '轻钢龙骨',
    spuCode: 'SPU-QG-001',
    spec: '50mm',
    warehouseId: 'w004',
    warehouseName: '龙岗中心城项目仓',
    salePrice: 28,
    saleStock: 5000,
    unit: '根',
    stock: 5000,
    status: 'online',
    isHot: false,
    isRecommend: false,
    sort: 9,
  },
  {
    id: 'mp010',
    productCode: 'SKU-SGB-001',
    productName: '石膏板 12mm',
    spuName: '石膏板',
    spuCode: 'SPU-SGB-001',
    spec: '1200x2400mm',
    warehouseId: 'w004',
    warehouseName: '龙岗中心城项目仓',
    salePrice: 45,
    saleStock: 2000,
    unit: '张',
    stock: 2000,
    status: 'online',
    isHot: true,
    isRecommend: true,
    sort: 10,
  },
  {
    id: 'mp011',
    productCode: 'SKU-DX-001',
    productName: '电线 BV 2.5mm²',
    spuName: '电线',
    spuCode: 'SPU-DX-001',
    spec: '2.5mm²',
    warehouseId: 'w005',
    warehouseName: '南山科技园项目仓',
    salePrice: 180,
    saleStock: 800,
    unit: '卷',
    stock: 800,
    status: 'online',
    isHot: true,
    isRecommend: false,
    sort: 11,
  },
  {
    id: 'mp012',
    productCode: 'SKU-DX-002',
    productName: '电线 BV 4mm²',
    spuName: '电线',
    spuCode: 'SPU-DX-001',
    spec: '4mm²',
    warehouseId: 'w005',
    warehouseName: '南山科技园项目仓',
    salePrice: 320,
    saleStock: 500,
    unit: '卷',
    stock: 500,
    status: 'online',
    isHot: false,
    isRecommend: true,
    sort: 12,
  },
  {
    id: 'mp013',
    productCode: 'SKU-SG-001',
    productName: '水管 PPR 20mm',
    spuName: 'PPR水管',
    spuCode: 'SPU-SG-001',
    spec: '20mm',
    warehouseId: 'w002',
    warehouseName: '福田CBD项目仓',
    salePrice: 15,
    saleStock: 3000,
    unit: '根',
    stock: 3000,
    status: 'online',
    isHot: false,
    isRecommend: false,
    sort: 13,
  },
  {
    id: 'mp014',
    productCode: 'SKU-ZBJ-001',
    productName: '瓷砖胶 C1',
    spuName: '瓷砖胶',
    spuCode: 'SPU-ZBJ-001',
    spec: '25kg/袋',
    warehouseId: 'w003',
    warehouseName: '宝安新安项目仓',
    salePrice: 65,
    saleStock: 400,
    unit: '袋',
    stock: 400,
    status: 'online',
    isHot: true,
    isRecommend: true,
    sort: 14,
  },
  {
    id: 'mp015',
    productCode: 'SKU-LG-003',
    productName: '螺纹钢 HRB400 25mm',
    spuName: '螺纹钢',
    spuCode: 'SPU-LG-001',
    spec: '25mm',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 4050,
    saleStock: 100,
    unit: '吨',
    stock: 100,
    status: 'offline',
    isHot: false,
    isRecommend: false,
    sort: 15,
  },
])

const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  },
}))

const filteredProducts = computed(() => {
  let result = products.value
  
  if (searchForm.warehouseId) {
    result = result.filter(p => p.warehouseId === searchForm.warehouseId)
  }
  
  if (searchForm.productName) {
    result = result.filter(p => p.productName.includes(searchForm.productName))
  }
  
  if (searchForm.status) {
    result = result.filter(p => p.status === searchForm.status)
  }
  
  return result
})

watch(filteredProducts, (val) => {
  pagination.total = val.length
}, { immediate: true })

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.warehouseId = ''
  searchForm.productName = ''
  searchForm.status = ''
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleAddProducts() {
  addProductVisible.value = true
}

function handleBatchOnline() {
  selectedKeys.value.forEach(key => {
    const product = products.value.find(p => p.id === key)
    if (product) {
      product.status = 'online'
    }
  })
  selectedKeys.value = []
  Message.success('批量上架成功')
}

function handleBatchOffline() {
  selectedKeys.value.forEach(key => {
    const product = products.value.find(p => p.id === key)
    if (product) {
      product.status = 'offline'
      product.isHot = false
      product.isRecommend = false
    }
  })
  selectedKeys.value = []
  Message.success('批量下架成功')
}

function handleStatusChange(record: MarketProduct) {
  if (record.status === 'offline') {
    record.isHot = false
    record.isRecommend = false
  }
  Message.success(`${record.status === 'online' ? '上架' : '下架'}成功`)
}

function handleHotChange(record: MarketProduct) {
  Message.success(record.isHot ? '已设为热门' : '已取消热门')
}

function handleRecommendChange(record: MarketProduct) {
  Message.success(record.isRecommend ? '已设为推荐' : '已取消推荐')
}

function handleEditPrice(record: MarketProduct) {
  currentProduct.value = { ...record }
  priceEditVisible.value = true
}

function handleEditStock(record: MarketProduct) {
  currentProduct.value = { ...record }
  stockEditVisible.value = true
}

function handleRemove(record: MarketProduct) {
  const index = products.value.findIndex(p => p.id === record.id)
  if (index > -1) {
    products.value.splice(index, 1)
    Message.success('移除成功')
  }
}

function handleAddSuccess() {
  addProductVisible.value = false
  Message.success('添加成功')
}

function handlePriceSuccess() {
  priceEditVisible.value = false
  Message.success('调价成功')
}

function handleStockSuccess() {
  stockEditVisible.value = false
  Message.success('库存更新成功')
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  :deep(.arco-card-body) {
    padding-top: 0;
  }
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.spu-info {
  .spu-name {
    font-weight: 500;
  }
  
  .spu-code {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}

.stock-value {
  font-weight: 600;
  color: #165dff;
}

.stock-unit {
  font-size: 12px;
  color: var(--color-text-3);
  margin-left: 4px;
}

.product-layout {
  display: flex;
  gap: 16px;
}

.category-sidebar {
  width: 260px;
  flex-shrink: 0;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  padding: 12px;
  background: var(--color-bg-2);

  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-2);

    .title {
      font-weight: 500;
      font-size: 14px;
    }
  }

  .category-name {
    font-size: 13px;
  }

  .category-count {
    color: var(--color-text-3);
    font-size: 12px;
    margin-left: 4px;
  }
}

.product-content {
  flex: 1;
  min-width: 0;
}
</style>
