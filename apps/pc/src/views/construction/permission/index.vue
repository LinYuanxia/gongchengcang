<template>
  <div class="page-container">
    <a-card :bordered="false" class="header-card">
      <div class="warehouse-info">
        <div class="info-item">
          <span class="label">工程仓名称：</span>
          <span class="value">{{ warehouseName }}</span>
        </div>
        <div class="info-item">
          <span class="label">已授权商品：</span>
          <span class="value highlight">{{ authorizedCount }} 种</span>
        </div>
      </div>
    </a-card>
    
    <a-card :bordered="false" class="table-card">
      <template #title>
        <a-space>
          <a-input-search 
            v-model="searchKeyword" 
            placeholder="搜索商品名称/编码" 
            style="width: 280px"
            @search="handleSearch"
          />
          <a-select v-model="filterCategory" placeholder="商品分类" allow-clear style="width: 150px">
            <a-option value="cement">水泥</a-option>
            <a-option value="steel">钢材</a-option>
            <a-option value="sand">砂石</a-option>
            <a-option value="concrete">混凝土</a-option>
          </a-select>
          <a-select v-model="filterStatus" placeholder="授权状态" allow-clear style="width: 120px">
            <a-option value="authorized">已授权</a-option>
            <a-option value="unauthorized">未授权</a-option>
          </a-select>
        </a-space>
      </template>
      
      <template #extra>
        <a-space>
          <a-button @click="handleBatchAuthorize">
            <template #icon><icon-check /></template>
            批量授权
          </a-button>
          <a-button status="danger" @click="handleBatchRevoke">
            <template #icon><icon-close /></template>
            批量取消
          </a-button>
        </a-space>
      </template>
      
      <a-table 
        :data="filteredProducts" 
        :pagination="pagination"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
        @page-change="handlePageChange"
      >
        <a-table-column title="商品编码" data-index="skuCode" :width="140" />
        <a-table-column title="商品名称" data-index="skuName" :ellipsis="true" />
        <a-table-column title="分类" data-index="categoryName" :width="100" />
        <a-table-column title="规格" :width="120">
          <template #cell="{ record }">
            {{ formatSpecs(record.specs) }}
          </template>
        </a-table-column>
        <a-table-column title="市场价" :width="100" align="right">
          <template #cell="{ record }">
            ¥{{ record.marketPrice }}
          </template>
        </a-table-column>
        <a-table-column title="供应商" :width="100" align="center">
          <template #cell="{ record }">
            <a-tooltip :content="`${record.supplierCount}家供应商`">
              <a-tag color="blue">{{ record.supplierCount }}家</a-tag>
            </a-tooltip>
          </template>
        </a-table-column>
        <a-table-column title="授权状态" :width="100" align="center">
          <template #cell="{ record }">
            <a-switch 
              :model-value="record.authorized" 
              @change="(val: boolean) => handleToggleAuth(record, val)"
            />
          </template>
        </a-table-column>
        <a-table-column title="授权时间" data-index="authorizedAt" :width="160" />
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Product {
  id: string
  skuCode: string
  skuName: string
  categoryName: string
  specs: Record<string, string>
  marketPrice: number
  supplierCount: number
  authorized: boolean
  authorizedAt: string
}

const warehouseId = ref('')
const warehouseName = ref('')
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const selectedKeys = ref<string[]>([])

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
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
    specs: { '强度等级': '42.5' },
    marketPrice: 450,
    supplierCount: 2,
    authorized: true,
    authorizedAt: '2024-01-15 10:30:00',
  },
  {
    id: 'p002',
    skuCode: 'SKU-GC-002',
    skuName: '螺纹钢 HRB400 16mm',
    categoryName: '钢材',
    specs: { '规格': '16mm' },
    marketPrice: 4200,
    supplierCount: 1,
    authorized: true,
    authorizedAt: '2024-01-15 10:30:00',
  },
  {
    id: 'p003',
    skuCode: 'SKU-SS-003',
    skuName: '黄砂 中砂',
    categoryName: '砂石',
    specs: { '类型': '中砂' },
    marketPrice: 95,
    supplierCount: 1,
    authorized: false,
    authorizedAt: '',
  },
  {
    id: 'p004',
    skuCode: 'SKU-HNT-004',
    skuName: '商品混凝土 C30',
    categoryName: '混凝土',
    specs: { '强度等级': 'C30' },
    marketPrice: 420,
    supplierCount: 1,
    authorized: false,
    authorizedAt: '',
  },
  {
    id: 'p005',
    skuCode: 'SKU-GC-005',
    skuName: '螺纹钢 HRB400 20mm',
    categoryName: '钢材',
    specs: { '规格': '20mm' },
    marketPrice: 4250,
    supplierCount: 2,
    authorized: true,
    authorizedAt: '2024-01-20 14:20:00',
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
  
  if (filterStatus.value) {
    result = result.filter(p => 
      filterStatus.value === 'authorized' ? p.authorized : !p.authorized
    )
  }
  
  pagination.total = result.length
  return result
})

const authorizedCount = computed(() => products.value.filter(p => p.authorized).length)

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  warehouseId.value = urlParams.get('warehouseId') || ''
  warehouseName.value = decodeURIComponent(urlParams.get('warehouseName') || '')
})

function formatSpecs(specs: Record<string, string>) {
  return Object.entries(specs || {}).map(([k, v]) => v).join(' / ')
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleToggleAuth(record: Product, val: boolean) {
  record.authorized = val
  record.authorizedAt = val ? new Date().toLocaleString() : ''
  Message.success(val ? '授权成功' : '已取消授权')
}

function handleBatchAuthorize() {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要授权的商品')
    return
  }
  
  products.value.forEach(p => {
    if (selectedKeys.value.includes(p.id)) {
      p.authorized = true
      p.authorizedAt = new Date().toLocaleString()
    }
  })
  
  Message.success(`已授权 ${selectedKeys.value.length} 个商品`)
  selectedKeys.value = []
}

function handleBatchRevoke() {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要取消授权的商品')
    return
  }
  
  products.value.forEach(p => {
    if (selectedKeys.value.includes(p.id)) {
      p.authorized = false
      p.authorizedAt = ''
    }
  })
  
  Message.success(`已取消授权 ${selectedKeys.value.length} 个商品`)
  selectedKeys.value = []
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
    
    &.highlight {
      color: rgb(var(--primary-6));
    }
  }
}

.table-card {
  :deep(.arco-card-body) {
    padding-top: 0;
  }
}
</style>
