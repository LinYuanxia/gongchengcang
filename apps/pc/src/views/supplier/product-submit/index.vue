<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>商品录入</span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="currentTab" type="button" @change="handleTabChange">
            <a-radio value="spu">SPU管理</a-radio>
            <a-radio value="sku">SKU管理</a-radio>
          </a-radio-group>
        </a-space>
      </template>

      <div v-if="currentTab === 'spu'">
        <div class="table-actions">
          <a-space>
            <a-input-search
              v-model="spuSearchForm.keyword"
              placeholder="搜索SPU名称/编码"
              style="width: 240px"
              @search="handleSpuSearch"
            />
            <a-cascader
              v-model="spuSearchForm.categoryId"
              :options="categoryTree"
              placeholder="商品分类"
              style="width: 200px"
              allow-clear
              :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            />
            <a-select v-model="spuSearchForm.auditStatus" placeholder="审核状态" style="width: 120px" allow-clear>
              <a-option v-for="item in SUPPLIER_PRODUCT_AUDIT_STATUS_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-space>
          <a-space>
            <a-button type="primary" @click="handleAddSpu">
              <template #icon><icon-plus /></template>
              新增SPU
            </a-button>
          </a-space>
        </div>

        <a-table
          :data="spuTableData"
          :loading="spuLoading"
          :pagination="spuPagination"
          row-key="id"
          @page-change="handleSpuPageChange"
        >
          <template #columns>
            <a-table-column title="主图" :width="80">
              <template #cell="{ record }">
                <a-image :src="record.mainImage" :width="48" :height="48" fit="cover">
                  <template #error>
                    <div class="image-placeholder">
                      <icon-image :size="24" />
                    </div>
                  </template>
                </a-image>
              </template>
            </a-table-column>
            <a-table-column title="SPU编码" data-index="spuCode" :width="120" />
            <a-table-column title="SPU名称" data-index="spuName" :width="200" />
            <a-table-column title="所属分类" data-index="categoryName" :width="120" />
            <a-table-column title="计量单位" data-index="unit" :width="80" />
            <a-table-column title="SKU数量" data-index="skuCount" :width="80" />
            <a-table-column title="审核状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getAuditStatusColor(record.auditStatus)">
                  {{ getAuditStatusText(record.auditStatus) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="审核备注" data-index="auditRemark" :width="150" ellipsis />
            <a-table-column title="创建时间" data-index="createdAt" :width="160" />
            <a-table-column title="操作" :width="200" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewSpu(record)">详情</a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="handleEditSpu(record)"
                    :disabled="record.auditStatus === SupplierProductAuditStatus.APPROVED"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="handleManageSku(record)"
                  >
                    管理SKU
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    status="success"
                    @click="handleSubmitAudit(record)"
                    :disabled="record.auditStatus !== SupplierProductAuditStatus.DRAFT || record.skuCount === 0"
                  >
                    提交审核
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    status="danger"
                    @click="handleDeleteSpu(record)"
                    :disabled="record.auditStatus === SupplierProductAuditStatus.APPROVED"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div v-else>
        <div class="table-actions">
          <a-space>
            <a-input-search
              v-model="skuSearchForm.keyword"
              placeholder="搜索SKU名称/编码"
              style="width: 240px"
              @search="handleSkuSearch"
            />
            <a-cascader
              v-model="skuSearchForm.categoryId"
              :options="categoryTree"
              placeholder="商品分类"
              style="width: 200px"
              allow-clear
              :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            />
            <a-select v-model="skuSearchForm.auditStatus" placeholder="审核状态" style="width: 120px" allow-clear>
              <a-option v-for="item in SUPPLIER_PRODUCT_AUDIT_STATUS_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-space>
        </div>

        <a-table
          :data="skuTableData"
          :loading="skuLoading"
          :pagination="skuPagination"
          row-key="id"
          @page-change="handleSkuPageChange"
        >
          <template #columns>
            <a-table-column title="主图" :width="80">
              <template #cell="{ record }">
                <a-image :src="record.mainImage" :width="48" :height="48" fit="cover">
                  <template #error>
                    <div class="image-placeholder">
                      <icon-image :size="24" />
                    </div>
                  </template>
                </a-image>
              </template>
            </a-table-column>
            <a-table-column title="SKU编码" data-index="skuCode" :width="140" />
            <a-table-column title="SKU名称" data-index="skuName" :width="180" />
            <a-table-column title="所属SPU" data-index="spuName" :width="150" />
            <a-table-column title="规格" :width="180">
              <template #cell="{ record }">
                <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                  <a-tag size="small">{{ key }}: {{ value }}</a-tag>
                </span>
              </template>
            </a-table-column>
            <a-table-column title="单位" data-index="unit" :width="60" />
            <a-table-column title="建议售价" :width="100">
              <template #cell="{ record }">
                <span v-if="record.suggestPrice">¥{{ record.suggestPrice.toFixed(2) }}</span>
                <span v-else>-</span>
              </template>
            </a-table-column>
            <a-table-column title="审核状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getAuditStatusColor(record.auditStatus)">
                  {{ getAuditStatusText(record.auditStatus) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createdAt" :width="160" />
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewSku(record)">详情</a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="handleEditSku(record)"
                    :disabled="record.auditStatus === SupplierProductAuditStatus.APPROVED"
                  >
                    编辑
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>

    <SupplierSpuCreateDrawer
      v-model:visible="spuDrawerVisible"
      :spu="currentSpu"
      :category-tree="categoryTree"
      :attr-list="attrList"
      @success="handleSpuSuccess"
    />

    <SupplierSkuDrawer
      v-model:visible="skuDrawerVisible"
      :sku="currentSku"
      :spu-info="currentSpuForSku"
      @success="handleSkuSuccess"
    />

    <SupplierSpuDetailDrawer
      v-model:visible="spuDetailVisible"
      :spu="currentSpu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  SupplierProductAuditStatus, 
  SUPPLIER_PRODUCT_AUDIT_STATUS_OPTIONS,
  type SupplierProductSpu,
  type SupplierProductSku,
  type ProductCategory,
  type ProductAttr,
} from '@gongchengcang/types'
import SupplierSpuCreateDrawer from './components/SupplierSpuCreateDrawer.vue'
import SupplierSkuDrawer from './components/SupplierSkuDrawer.vue'
import SupplierSpuDetailDrawer from './components/SupplierSpuDetailDrawer.vue'

const currentTab = ref('spu')

const spuLoading = ref(false)
const spuTableData = ref<SupplierProductSpu[]>([])
const categoryTree = ref<ProductCategory[]>([])
const attrList = ref<ProductAttr[]>([])

const spuPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const spuSearchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  auditStatus: undefined as string | undefined,
})

const skuLoading = ref(false)
const skuTableData = ref<SupplierProductSku[]>([])

const skuPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const skuSearchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  auditStatus: undefined as string | undefined,
})

const spuDrawerVisible = ref(false)
const skuDrawerVisible = ref(false)
const spuDetailVisible = ref(false)
const currentSpu = ref<SupplierProductSpu | null>(null)
const currentSku = ref<SupplierProductSku | null>(null)
const currentSpuForSku = ref<SupplierProductSpu | null>(null)

const mockSpuData: SupplierProductSpu[] = [
  {
    id: 'sspu001',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuName: '高强度螺纹钢',
    spuCode: 'SPU-LWG-001',
    categoryId: 'cat001',
    categoryName: '钢材',
    unit: '吨',
    attrIds: ['attr001', 'attr002'],
    attrNames: ['规格', '材质'],
    mainImage: 'https://picsum.photos/200/200?random=1',
    description: '高强度螺纹钢，适用于建筑结构',
    auditStatus: SupplierProductAuditStatus.DRAFT,
    skuCount: 4,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 10:30:00',
  },
  {
    id: 'sspu002',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuName: '普通硅酸盐水泥',
    spuCode: 'SPU-SN-001',
    categoryId: 'cat002',
    categoryName: '水泥',
    unit: '吨',
    attrIds: ['attr003'],
    attrNames: ['强度等级'],
    mainImage: 'https://picsum.photos/200/200?random=2',
    description: '普通硅酸盐水泥，P.O 42.5',
    auditStatus: SupplierProductAuditStatus.PENDING,
    skuCount: 2,
    createdAt: '2024-01-14 09:20:00',
    updatedAt: '2024-01-16 14:00:00',
  },
  {
    id: 'sspu003',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuName: '混凝土外加剂',
    spuCode: 'SPU-WJJ-001',
    categoryId: 'cat003',
    categoryName: '外加剂',
    unit: '公斤',
    attrIds: ['attr004'],
    attrNames: ['类型'],
    mainImage: 'https://picsum.photos/200/200?random=3',
    description: '高性能混凝土外加剂',
    auditStatus: SupplierProductAuditStatus.APPROVED,
    auditRemark: '审核通过，商品信息完整',
    auditedAt: '2024-01-13 16:00:00',
    auditedByName: '平台管理员',
    skuCount: 3,
    createdAt: '2024-01-10 08:00:00',
    updatedAt: '2024-01-13 16:00:00',
  },
  {
    id: 'sspu004',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuName: '建筑用砂',
    spuCode: 'SPU-SHA-001',
    categoryId: 'cat004',
    categoryName: '砂石',
    unit: '方',
    attrIds: ['attr005'],
    attrNames: ['类型'],
    mainImage: 'https://picsum.photos/200/200?random=4',
    description: '优质河砂，适用于混凝土搅拌',
    auditStatus: SupplierProductAuditStatus.REJECTED,
    auditRemark: '商品信息不完整，请补充规格参数',
    auditedAt: '2024-01-12 11:30:00',
    auditedByName: '平台管理员',
    skuCount: 2,
    createdAt: '2024-01-11 14:00:00',
    updatedAt: '2024-01-12 11:30:00',
  },
]

const mockSkuData: SupplierProductSku[] = [
  {
    id: 'ssku001',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuId: 'spu001',
    supplierSpuId: 'sspu001',
    spuName: '高强度螺纹钢',
    skuCode: 'SKU-LWG-001-12',
    skuName: '螺纹钢 HRB400E 12mm',
    specs: { '规格': '12mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=5',
    suggestPrice: 3850,
    supplyPrice: 3700,
    auditStatus: SupplierProductAuditStatus.DRAFT,
    createdAt: '2024-01-15 10:35:00',
    updatedAt: '2024-01-15 10:35:00',
  },
  {
    id: 'ssku002',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuId: 'spu001',
    supplierSpuId: 'sspu001',
    spuName: '高强度螺纹钢',
    skuCode: 'SKU-LWG-001-16',
    skuName: '螺纹钢 HRB400E 16mm',
    specs: { '规格': '16mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=6',
    suggestPrice: 3800,
    supplyPrice: 3650,
    auditStatus: SupplierProductAuditStatus.DRAFT,
    createdAt: '2024-01-15 10:36:00',
    updatedAt: '2024-01-15 10:36:00',
  },
  {
    id: 'ssku003',
    supplierId: 'supplier001',
    supplierName: '优质建材供应商',
    spuId: 'spu002',
    supplierSpuId: 'sspu002',
    spuName: '普通硅酸盐水泥',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    specs: { '强度等级': '42.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=7',
    suggestPrice: 450,
    supplyPrice: 420,
    auditStatus: SupplierProductAuditStatus.PENDING,
    createdAt: '2024-01-14 09:25:00',
    updatedAt: '2024-01-16 14:05:00',
  },
]

const mockCategoryTree: ProductCategory[] = [
  {
    categoryId: 'cat001',
    categoryName: '钢材',
    level: 1,
    sortOrder: 1,
    status: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    children: [
      { categoryId: 'cat001-1', categoryName: '螺纹钢', parentId: 'cat001', level: 2, sortOrder: 1, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { categoryId: 'cat001-2', categoryName: '线材', parentId: 'cat001', level: 2, sortOrder: 2, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ],
  },
  {
    categoryId: 'cat002',
    categoryName: '水泥',
    level: 1,
    sortOrder: 2,
    status: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    categoryId: 'cat003',
    categoryName: '外加剂',
    level: 1,
    sortOrder: 3,
    status: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    categoryId: 'cat004',
    categoryName: '砂石',
    level: 1,
    sortOrder: 4,
    status: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

const mockAttrList: ProductAttr[] = [
  { attrId: 'attr001', attrName: '规格', attrType: 'single' as any, optionValues: ['10mm', '12mm', '14mm', '16mm', '18mm', '20mm', '22mm', '25mm'], sortOrder: 1, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { attrId: 'attr002', attrName: '材质', attrType: 'single' as any, optionValues: ['HRB400', 'HRB400E', 'HRB500', 'HRB500E'], sortOrder: 2, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { attrId: 'attr003', attrName: '强度等级', attrType: 'single' as any, optionValues: ['32.5', '42.5', '52.5'], sortOrder: 3, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { attrId: 'attr004', attrName: '类型', attrType: 'single' as any, optionValues: ['减水剂', '缓凝剂', '早强剂', '防冻剂'], sortOrder: 4, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { attrId: 'attr005', attrName: '砂类型', attrType: 'single' as any, optionValues: ['河砂', '机制砂', '海砂'], sortOrder: 5, status: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

function getAuditStatusColor(status: SupplierProductAuditStatus) {
  const colorMap: Record<string, string> = {
    [SupplierProductAuditStatus.DRAFT]: 'gray',
    [SupplierProductAuditStatus.PENDING]: 'orange',
    [SupplierProductAuditStatus.APPROVED]: 'green',
    [SupplierProductAuditStatus.REJECTED]: 'red',
  }
  return colorMap[status] || 'gray'
}

function getAuditStatusText(status: SupplierProductAuditStatus) {
  const textMap: Record<string, string> = {
    [SupplierProductAuditStatus.DRAFT]: '草稿',
    [SupplierProductAuditStatus.PENDING]: '待审核',
    [SupplierProductAuditStatus.APPROVED]: '已通过',
    [SupplierProductAuditStatus.REJECTED]: '已驳回',
  }
  return textMap[status] || status
}

function handleTabChange() {
  if (currentTab.value === 'spu') {
    loadSpuData()
  } else {
    loadSkuData()
  }
}

async function loadSpuData() {
  spuLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    spuTableData.value = mockSpuData
    spuPagination.total = mockSpuData.length
  } finally {
    spuLoading.value = false
  }
}

async function loadSkuData() {
  skuLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    skuTableData.value = mockSkuData
    skuPagination.total = mockSkuData.length
  } finally {
    skuLoading.value = false
  }
}

function handleSpuSearch() {
  spuPagination.current = 1
  loadSpuData()
}

function handleSpuPageChange(page: number) {
  spuPagination.current = page
  loadSpuData()
}

function handleSkuSearch() {
  skuPagination.current = 1
  loadSkuData()
}

function handleSkuPageChange(page: number) {
  skuPagination.current = page
  loadSkuData()
}

function handleAddSpu() {
  currentSpu.value = null
  spuDrawerVisible.value = true
}

function handleViewSpu(record: SupplierProductSpu) {
  currentSpu.value = record
  spuDetailVisible.value = true
}

function handleEditSpu(record: SupplierProductSpu) {
  currentSpu.value = record
  spuDrawerVisible.value = true
}

function handleManageSku(record: SupplierProductSpu) {
  currentSpuForSku.value = record
  currentSku.value = null
  skuDrawerVisible.value = true
}

function handleSubmitAudit(record: SupplierProductSpu) {
  Modal.confirm({
    title: '提交审核',
    content: `确定提交SPU「${record.spuName}」进行审核吗？提交后将无法修改。`,
    okText: '确定提交',
    cancelText: '取消',
    onOk: () => {
      record.auditStatus = SupplierProductAuditStatus.PENDING
      Message.success('已提交审核，请等待平台审核')
    },
  })
}

function handleDeleteSpu(record: SupplierProductSpu) {
  Modal.confirm({
    title: '删除确认',
    content: `确定删除SPU「${record.spuName}」吗？删除后无法恢复。`,
    okText: '确定删除',
    cancelText: '取消',
    onOk: () => {
      const index = spuTableData.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        spuTableData.value.splice(index, 1)
        Message.success('删除成功')
      }
    },
  })
}

function handleViewSku(record: SupplierProductSku) {
  currentSku.value = record
  currentSpuForSku.value = spuTableData.value.find(s => s.id === record.supplierSpuId) || null
  skuDrawerVisible.value = true
}

function handleEditSku(record: SupplierProductSku) {
  currentSku.value = record
  currentSpuForSku.value = spuTableData.value.find(s => s.id === record.supplierSpuId) || null
  skuDrawerVisible.value = true
}

function handleSpuSuccess() {
  loadSpuData()
}

function handleSkuSuccess() {
  loadSkuData()
  loadSpuData()
}

onMounted(() => {
  categoryTree.value = mockCategoryTree
  attrList.value = mockAttrList
  loadSpuData()
})
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.image-placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-fill-2);
  border-radius: 4px;
}
</style>
