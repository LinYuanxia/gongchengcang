<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>仓库商品</span>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/编码"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.warehouseId" placeholder="选择仓库" style="width: 200px" allow-clear>
            <a-option v-for="item in warehouseList" :key="item.warehouseId" :value="item.warehouseId">
              {{ item.warehouseName }}
            </a-option>
          </a-select>
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 200px"
            allow-clear
            :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          />
          <a-select v-model="searchForm.supplierId" placeholder="选择供应商" style="width: 200px" allow-clear>
            <a-option v-for="item in supplierList" :key="item.supplierId" :value="item.supplierId">
              {{ item.supplierName }}
            </a-option>
          </a-select>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="仓库" data-index="warehouseName" :width="120" />
          <a-table-column title="商品编码" data-index="skuCode" :width="140" />
          <a-table-column title="商品名称" data-index="skuName" :width="180" />
          <a-table-column title="所属SPU" data-index="spuName" :width="150" />
          <a-table-column title="所属分类" data-index="categoryName" :width="100" />
          <a-table-column title="供应商" data-index="supplierName" :width="150" />
          <a-table-column title="采购价" :width="100">
            <template #cell="{ record }">
              <span class="price-value">¥{{ record.purchasePrice.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="库存数量" :width="100">
            <template #cell="{ record }">
              <span>{{ record.quantity }} {{ record.unit }}</span>
            </template>
          </a-table-column>
          <a-table-column title="可用数量" :width="100">
            <template #cell="{ record }">
              <span :class="{ 'low-stock': record.availableQty < 10 }">{{ record.availableQty }} {{ record.unit }}</span>
            </template>
          </a-table-column>
          <a-table-column title="锁定数量" :width="100">
            <template #cell="{ record }">
              <span>{{ record.lockedQty }} {{ record.unit }}</span>
            </template>
          </a-table-column>
          <a-table-column title="批次号" data-index="batchNo" :width="120" />
          <a-table-column title="库位" data-index="location" :width="80" />
          <a-table-column title="更新时间" data-index="updatedAt" :width="180" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleViewRecords(record)">记录</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { WarehouseProduct, ProductCategory } from '@gongchengcang/types'
import { getCategoryTree } from '@gongchengcang/api'

const router = useRouter()

const loading = ref(false)
const tableData = ref<WarehouseProduct[]>([])
const categoryTree = ref<ProductCategory[]>([])
const warehouseList = ref([
  { warehouseId: 'WH001', warehouseName: '华东工程仓-上海仓' },
  { warehouseId: 'WH002', warehouseName: '华东工程仓-南京仓' },
  { warehouseId: 'WH003', warehouseName: '华南工程仓-广州仓' },
  { warehouseId: 'WH004', warehouseName: '华北工程仓-北京仓' },
])
const supplierList = ref([
  { supplierId: 'SUP001', supplierName: '宝钢集团有限公司' },
  { supplierId: 'SUP002', supplierName: '江苏沙钢集团有限公司' },
  { supplierId: 'SUP003', supplierName: '鞍钢股份有限公司' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  warehouseId: undefined as string | undefined,
  categoryId: undefined as string[] | undefined,
  supplierId: undefined as string | undefined,
})

onMounted(async () => {
  await loadCategoryTree()
  await loadData()
})

async function loadCategoryTree() {
  try {
    categoryTree.value = await getCategoryTree()
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    tableData.value = getMockData()
    pagination.total = tableData.value.length
  } finally {
    loading.value = false
  }
}

function getMockData(): WarehouseProduct[] {
  return [
    {
      id: 'WP001',
      warehouseId: 'WH001',
      warehouseName: '华东工程仓-上海仓',
      skuId: 'SKU001',
      skuCode: 'GJ-LWG-001-0001',
      skuName: '螺纹钢HRB400-12mm',
      spuName: '螺纹钢 HRB400E',
      categoryName: '螺纹钢',
      supplierId: 'SUP001',
      supplierName: '宝钢集团有限公司',
      unit: '吨',
      quantity: 150,
      availableQty: 120,
      lockedQty: 30,
      purchasePrice: 3200,
      batchNo: 'B202401001',
      location: 'A-01-01',
      createdAt: '2024-01-15 10:00:00',
      updatedAt: '2024-03-20 15:30:00',
    },
    {
      id: 'WP002',
      warehouseId: 'WH001',
      warehouseName: '华东工程仓-上海仓',
      skuId: 'SKU002',
      skuCode: 'GJ-LWG-001-0002',
      skuName: '螺纹钢HRB400-16mm',
      spuName: '螺纹钢 HRB400E',
      categoryName: '螺纹钢',
      supplierId: 'SUP001',
      supplierName: '宝钢集团有限公司',
      unit: '吨',
      quantity: 200,
      availableQty: 180,
      lockedQty: 20,
      purchasePrice: 3250,
      batchNo: 'B202401002',
      location: 'A-01-02',
      createdAt: '2024-01-16 10:00:00',
      updatedAt: '2024-03-18 14:20:00',
    },
    {
      id: 'WP003',
      warehouseId: 'WH002',
      warehouseName: '华东工程仓-南京仓',
      skuId: 'SKU001',
      skuCode: 'GJ-LWG-001-0001',
      skuName: '螺纹钢HRB400-12mm',
      spuName: '螺纹钢 HRB400E',
      categoryName: '螺纹钢',
      supplierId: 'SUP002',
      supplierName: '江苏沙钢集团有限公司',
      unit: '吨',
      quantity: 80,
      availableQty: 65,
      lockedQty: 15,
      purchasePrice: 3150,
      batchNo: 'B202402001',
      location: 'B-02-01',
      createdAt: '2024-02-01 09:00:00',
      updatedAt: '2024-03-15 11:00:00',
    },
    {
      id: 'WP004',
      warehouseId: 'WH003',
      warehouseName: '华南工程仓-广州仓',
      skuId: 'SKU003',
      skuCode: 'GJ-LWG-001-0003',
      skuName: '螺纹钢HRB400-20mm',
      spuName: '螺纹钢 HRB400E',
      categoryName: '螺纹钢',
      supplierId: 'SUP003',
      supplierName: '鞍钢股份有限公司',
      unit: '吨',
      quantity: 100,
      availableQty: 8,
      lockedQty: 92,
      purchasePrice: 3300,
      batchNo: 'B202403001',
      location: 'C-01-03',
      createdAt: '2024-03-01 08:00:00',
      updatedAt: '2024-03-22 09:30:00',
    },
    {
      id: 'WP005',
      warehouseId: 'WH004',
      warehouseName: '华北工程仓-北京仓',
      skuId: 'SKU004',
      skuCode: 'SN-PT-001-0001',
      skuName: '水泥P.O42.5',
      spuName: '普通硅酸盐水泥',
      categoryName: '水泥',
      supplierId: 'SUP001',
      supplierName: '宝钢集团有限公司',
      unit: '吨',
      quantity: 500,
      availableQty: 450,
      lockedQty: 50,
      purchasePrice: 380,
      batchNo: 'B202403002',
      location: 'D-01-01',
      createdAt: '2024-03-05 10:00:00',
      updatedAt: '2024-03-21 16:00:00',
    },
  ]
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleExport() {
  Message.info('导出功能开发中')
}

function handleViewDetail(record: WarehouseProduct) {
  router.push(`/product/sku/view/${record.skuId}`)
}

function handleViewRecords(record: WarehouseProduct) {
  router.push({
    path: '/stock/record',
    query: { warehouseId: record.warehouseId, skuId: record.skuId }
  })
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.price-value {
  color: var(--color-primary);
  font-weight: 500;
}

.low-stock {
  color: var(--color-danger);
  font-weight: 500;
}
</style>
