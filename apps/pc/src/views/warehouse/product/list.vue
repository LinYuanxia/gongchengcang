<template>
  <div class="product-list-page">
    <a-card>
      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="SPU总数" :value="spuTotal" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="SKU总数" :value="skuTotal" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="有库存商品" :value="hasStockCount" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="零库存商品" :value="noStockCount" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="SPU名称/编码">
          <a-input v-model="searchForm.spuKeyword" placeholder="搜索SPU名称/编码" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="SKU名称/编码">
          <a-input v-model="searchForm.skuKeyword" placeholder="搜索SKU名称/编码" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="商品分类">
          <a-select v-model="searchForm.categoryId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="c1">砂石材料</a-option>
            <a-option value="c2">水泥建材</a-option>
            <a-option value="c3">钢材型材</a-option>
            <a-option value="c4">混凝土</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="库存状态">
          <a-select v-model="searchForm.stockStatus" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="has">有库存</a-option>
            <a-option value="no">零库存</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        :data="filteredProducts" 
        :pagination="pagination" 
        class="mt-16"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="SKU商品信息" :width="300">
            <template #cell="{ record }">
              <div class="product-info">
                <a-image :src="record.mainImage" :width="50" :height="50" fit="cover" />
                <div class="product-detail">
                  <div class="product-name">{{ record.skuName }}</div>
                  <div class="product-code">{{ record.skuCode }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="所属SPU" :width="180">
            <template #cell="{ record }">
              <div class="spu-info">
                <div class="spu-name">
                  <a-link>{{ record.spuName }}</a-link>
                </div>
                <div class="spu-code">{{ record.spuCode }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="规格" :width="150">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="(value, key) in record.specs" :key="key" size="small">{{ value }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
          <a-table-column title="总库存" :width="100" align="right">
            <template #cell="{ record }">
              <span :class="record.totalStock > 0 ? 'text-success' : 'text-danger'">
                {{ record.totalStock }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="库存分布" :width="150">
            <template #cell="{ record }">
              <div class="stock-distribution">
                <div v-for="item in record.stockDistribution" :key="item.warehouseId" class="warehouse-item">
                  <span class="warehouse-name">{{ item.warehouseName }}</span>
                  <span class="warehouse-stock">{{ item.quantity }}</span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewSku(record)">SKU详情</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const spuTotal = ref(156)
const skuTotal = ref(428)
const hasStockCount = ref(386)
const noStockCount = ref(42)

const searchForm = ref({
  spuKeyword: '',
  skuKeyword: '',
  categoryId: '',
  stockStatus: '',
})

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 100,
})

const products = ref([
  {
    id: '1',
    skuCode: 'SKU001001',
    skuName: '黄砂 中砂',
    spuCode: 'SPU001',
    spuName: '黄砂',
    mainImage: 'https://picsum.photos/100/100?random=1',
    specs: { 颗粒级配: '中砂', 含泥量: '<3%' },
    categoryName: '砂石材料',
    unit: '方',
    totalStock: 1500,
    stockDistribution: [
      { warehouseId: 'w1', warehouseName: '深圳湾仓', quantity: 800 },
      { warehouseId: 'w2', warehouseName: '福田仓', quantity: 700 },
    ],
  },
  {
    id: '2',
    skuCode: 'SKU001002',
    skuName: '黄砂 细砂',
    spuCode: 'SPU001',
    spuName: '黄砂',
    mainImage: 'https://picsum.photos/100/100?random=2',
    specs: { 颗粒级配: '细砂', 含泥量: '<2%' },
    categoryName: '砂石材料',
    unit: '方',
    totalStock: 850,
    stockDistribution: [
      { warehouseId: 'w1', warehouseName: '深圳湾仓', quantity: 500 },
      { warehouseId: 'w3', warehouseName: '龙华仓', quantity: 350 },
    ],
  },
  {
    id: '3',
    skuCode: 'SKU002001',
    skuName: '碎石 5-25mm',
    spuCode: 'SPU002',
    spuName: '碎石',
    mainImage: 'https://picsum.photos/100/100?random=3',
    specs: { 粒径: '5-25mm', 硬度: '高' },
    categoryName: '砂石材料',
    unit: '方',
    totalStock: 1200,
    stockDistribution: [
      { warehouseId: 'w1', warehouseName: '深圳湾仓', quantity: 1200 },
    ],
  },
  {
    id: '4',
    skuCode: 'SKU003001',
    skuName: 'PO42.5 硅酸盐水泥',
    spuCode: 'SPU003',
    spuName: '水泥',
    mainImage: 'https://picsum.photos/100/100?random=4',
    specs: { 强度等级: '42.5', 品种: '硅酸盐' },
    categoryName: '水泥建材',
    unit: '吨',
    totalStock: 0,
    stockDistribution: [],
  },
  {
    id: '5',
    skuCode: 'SKU004001',
    skuName: '螺纹钢 HRB400 Φ12',
    spuCode: 'SPU004',
    spuName: '螺纹钢',
    mainImage: 'https://picsum.photos/100/100?random=5',
    specs: { 材质: 'HRB400', 直径: 'Φ12' },
    categoryName: '钢材型材',
    unit: '吨',
    totalStock: 280,
    stockDistribution: [
      { warehouseId: 'w2', warehouseName: '福田仓', quantity: 280 },
    ],
  },
  {
    id: '6',
    skuCode: 'SKU004002',
    skuName: '螺纹钢 HRB400 Φ16',
    spuCode: 'SPU004',
    spuName: '螺纹钢',
    mainImage: 'https://picsum.photos/100/100?random=6',
    specs: { 材质: 'HRB400', 直径: 'Φ16' },
    categoryName: '钢材型材',
    unit: '吨',
    totalStock: 350,
    stockDistribution: [
      { warehouseId: 'w2', warehouseName: '福田仓', quantity: 150 },
      { warehouseId: 'w3', warehouseName: '龙华仓', quantity: 200 },
    ],
  },
])

const filteredProducts = computed(() => {
  let result = products.value
  
  if (searchForm.value.spuKeyword) {
    result = result.filter(item => 
      item.spuName.includes(searchForm.value.spuKeyword) ||
      item.spuCode.includes(searchForm.value.spuKeyword)
    )
  }
  
  if (searchForm.value.skuKeyword) {
    result = result.filter(item => 
      item.skuName.includes(searchForm.value.skuKeyword) ||
      item.skuCode.includes(searchForm.value.skuKeyword)
    )
  }
  
  if (searchForm.value.categoryId) {
    result = result.filter(item => item.categoryId === searchForm.value.categoryId)
  }
  
  if (searchForm.value.stockStatus === 'has') {
    result = result.filter(item => item.totalStock > 0)
  } else if (searchForm.value.stockStatus === 'no') {
    result = result.filter(item => item.totalStock === 0)
  }
  
  return result
})

function handleSearch() {
  Message.success('查询完成')
}

function handleReset() {
  searchForm.value = {
    spuKeyword: '',
    skuKeyword: '',
    categoryId: '',
    stockStatus: '',
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewSku(record: any) {
  router.push(`/warehouse/product/sku-detail/${record.id}`)
}
</script>

<style scoped lang="less">
.product-list-page {
  .stat-row {
    margin-bottom: 16px;
  }
  
  .search-form {
    margin-top: 16px;
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
  
  .spu-info {
    .spu-name {
      margin-bottom: 4px;
    }
    .spu-code {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
  
  .stock-distribution {
    .warehouse-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 2px;
      
      .warehouse-name {
        color: var(--color-text-2);
      }
      .warehouse-stock {
        font-weight: 500;
      }
    }
  }
  
  .text-success {
    color: #00b42a;
    font-weight: 500;
  }
  
  .text-danger {
    color: #f53f3f;
    font-weight: 500;
  }
}
</style>
