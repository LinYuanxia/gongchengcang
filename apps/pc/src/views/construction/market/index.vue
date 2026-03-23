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
      
      <a-table 
        :data="filteredProducts" 
        :pagination="pagination" 
        :row-selection="rowSelection"
        row-key="id"
        @page-change="handlePageChange"
      >
        <a-table-column title="商品编码" data-index="productCode" :width="120" />
        <a-table-column title="商品名称" data-index="productName" :width="200" />
        <a-table-column title="规格" data-index="spec" :width="120" />
        <a-table-column title="所属工程仓" data-index="warehouseName" :width="150" />
        <a-table-column title="销售价" :width="100" align="right">
          <template #cell="{ record }">
            <span class="price">¥{{ record.salePrice }}</span>
          </template>
        </a-table-column>
        <a-table-column title="库存" data-index="stock" :width="80" align="center" />
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
      </a-table>
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
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import AddProductModal from './components/AddProductModal.vue'
import PriceEditDrawer from './components/PriceEditDrawer.vue'
import StockEditDrawer from './components/StockEditDrawer.vue'

interface MarketProduct {
  id: string
  productCode: string
  productName: string
  spec: string
  warehouseId: string
  warehouseName: string
  salePrice: number
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
})

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
])

const products = ref<MarketProduct[]>([
  {
    id: 'mp001',
    productCode: 'SKU-SN-001',
    productName: '水泥 P.O 42.5',
    spec: '50kg/袋',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 450,
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
    spec: '16mm',
    warehouseId: 'w001',
    warehouseName: '深圳湾科技园项目仓',
    salePrice: 4280,
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
    spec: '中砂',
    warehouseId: 'w002',
    warehouseName: '福田CBD项目仓',
    salePrice: 95,
    stock: 1000,
    status: 'offline',
    isHot: false,
    isRecommend: false,
    sort: 3,
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
  
  pagination.total = result.length
  return result
})

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
</style>
