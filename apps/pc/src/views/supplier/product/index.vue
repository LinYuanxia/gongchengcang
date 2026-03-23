<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>我的商品</span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="currentTab" type="button" @change="handleTabChange">
            <a-radio value="spu">SPU列表</a-radio>
            <a-radio value="sku">SKU列表</a-radio>
          </a-radio-group>
          <a-button type="primary" @click="handleCreateProduct">
            <template #icon><icon-plus /></template>
            创建商品
          </a-button>
          <a-button @click="showPlatformSelector = true">
            <template #icon><icon-apps /></template>
            从平台库选择
          </a-button>
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
              style="width: 180px"
              allow-clear
              :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            />
            <a-select v-model="spuSearchForm.auditStatus" placeholder="审核状态" style="width: 120px" allow-clear>
              <a-option value="pending">待审核</a-option>
              <a-option value="approved">已通过</a-option>
              <a-option value="rejected">已驳回</a-option>
            </a-select>
          </a-space>
        </div>

        <a-table
          :data="filteredSpuList"
          :loading="spuLoading"
          :pagination="spuPagination"
          row-key="spuId"
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
            <a-table-column title="SPU编码" data-index="spuCode" :width="130" />
            <a-table-column title="SPU名称" data-index="spuName" :width="180" />
            <a-table-column title="分类" data-index="categoryName" :width="100" />
            <a-table-column title="SKU数量" :width="90">
              <template #cell="{ record }">
                <a-button type="text" size="small" @click="handleViewSkuList(record)">
                  {{ record.skuCount || 0 }} 个
                </a-button>
              </template>
            </a-table-column>
            <a-table-column title="来源" :width="80">
              <template #cell="{ record }">
                <a-tag :color="record.source === 'self' ? 'arcoblue' : 'green'" size="small">
                  {{ record.source === 'self' ? '自建' : '平台' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="审核状态" :width="100">
              <template #cell="{ record }">
                <a-tag v-if="record.auditStatus" :color="getAuditStatusColor(record.auditStatus)">
                  {{ getAuditStatusText(record.auditStatus) }}
                </a-tag>
                <span v-else>-</span>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createdAt" :width="160" />
            <a-table-column title="操作" :width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewSpu(record)">详情</a-button>
                  <a-button type="text" size="small" @click="handleEditSpu(record)">编辑</a-button>
                  <a-button type="text" size="small" @click="handleManageSku(record)">管理SKU</a-button>
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
              style="width: 180px"
              allow-clear
              :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            />
            <a-select v-model="skuSearchForm.supplyStatus" placeholder="供货状态" style="width: 120px" allow-clear>
              <a-option value="supplying">供货中</a-option>
              <a-option value="paused">暂停供货</a-option>
              <a-option value="stopped">永久停货</a-option>
            </a-select>
            <a-select v-model="skuSearchForm.shelfStatus" placeholder="上架状态" style="width: 120px" allow-clear>
              <a-option value="on">已上架</a-option>
              <a-option value="off">已下架</a-option>
            </a-select>
          </a-space>
          <a-space>
            <a-button 
              :disabled="selectedSkuKeys.length === 0"
              status="success"
              @click="handleBatchShelf('on')"
            >
              批量上架
            </a-button>
            <a-button 
              :disabled="selectedSkuKeys.length === 0"
              status="warning"
              @click="handleBatchShelf('off')"
            >
              批量下架
            </a-button>
          </a-space>
        </div>

        <a-table
          :data="filteredSkuList"
          :loading="skuLoading"
          :pagination="skuPagination"
          :row-selection="skuRowSelection"
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
            <a-table-column title="SKU编码" data-index="skuCode" :width="130" />
            <a-table-column title="SKU名称" data-index="skuName" :width="160" />
            <a-table-column title="所属SPU" data-index="spuName" :width="140" />
            <a-table-column title="规格" :width="120">
              <template #cell="{ record }">
                <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 4px">
                  <a-tag size="small">{{ value }}</a-tag>
                </span>
              </template>
            </a-table-column>
            <a-table-column title="供货价" :width="90">
              <template #cell="{ record }">
                <span class="price">¥{{ record.supplyPrice?.toFixed(2) || '-' }}</span>
              </template>
            </a-table-column>
            <a-table-column title="供货状态" :width="90">
              <template #cell="{ record }">
                <a-tag :color="getSupplyStatusColor(record.supplyStatus)">
                  {{ getSupplyStatusText(record.supplyStatus) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="上架状态" :width="80">
              <template #cell="{ record }">
                <a-switch
                  v-model="record.shelfStatus"
                  checked-value="on"
                  unchecked-value="off"
                  :disabled="record.supplyStatus === 'stopped' || record.auditStatus === 'pending' || record.auditStatus === 'rejected'"
                  @change="(val: string) => handleShelfChange(record, val)"
                />
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewSku(record)">详情</a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="handleEditSku(record)"
                    :disabled="record.supplyStatus === 'stopped'"
                  >
                    编辑
                  </a-button>
                  <a-dropdown @select="(key: string) => handleSupplyStatusChange(record, key)">
                    <a-button type="text" size="small">
                      更多
                      <icon-down />
                    </a-button>
                    <template #content>
                      <a-doption value="supplying" :disabled="record.supplyStatus === 'supplying'">
                        继续供货
                      </a-doption>
                      <a-doption value="paused" :disabled="record.supplyStatus === 'paused'">
                        暂停供货
                      </a-doption>
                      <a-doption value="stopped" :disabled="record.supplyStatus === 'stopped'">
                        <span style="color: rgb(var(--danger-6))">永久停货</span>
                      </a-doption>
                    </template>
                  </a-dropdown>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="showPlatformSelector"
      title="从平台商品库选择"
      :width="1100"
      :footer="false"
    >
      <PlatformProductSelector
        v-if="showPlatformSelector"
        @select="handlePlatformSelect"
        @cancel="showPlatformSelector = false"
      />
    </a-modal>

    <a-modal
      v-model:visible="skuEditVisible"
      title="编辑SKU供货信息"
      :width="500"
      @ok="handleSkuEditSubmit"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="SKU编码">{{ editSku?.skuCode }}</a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ editSku?.skuName }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="skuEditForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="供货价">
              <a-input-number v-model="skuEditForm.supplyPrice" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="预计供货量">
              <a-input-number v-model="skuEditForm.estimatedStock" :min="0" style="width: 100%">
                <template #suffix>{{ editSku?.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="最小起订量">
              <a-input-number v-model="skuEditForm.minOrderQty" :min="1" style="width: 100%">
                <template #suffix>{{ editSku?.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="供货周期">
              <a-input-number v-model="skuEditForm.leadTime" :min="1" style="width: 100%">
                <template #suffix>天</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="skuDetailVisible"
      title="SKU详情"
      :width="600"
      :footer="false"
    >
      <a-descriptions :column="2" bordered v-if="detailSku">
        <a-descriptions-item label="SKU编码">{{ detailSku.skuCode }}</a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ detailSku.skuName }}</a-descriptions-item>
        <a-descriptions-item label="所属SPU">{{ detailSku.spuName }}</a-descriptions-item>
        <a-descriptions-item label="分类">{{ detailSku.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="规格" :span="2">
          <span v-for="(value, key) in detailSku.specs" :key="key" style="margin-right: 8px">
            <a-tag>{{ key }}: {{ value }}</a-tag>
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="供货价">
          <span class="price">¥{{ detailSku.supplyPrice?.toFixed(2) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="预计供货量">{{ detailSku.estimatedStock }} {{ detailSku.unit }}</a-descriptions-item>
        <a-descriptions-item label="最小起订量">{{ detailSku.minOrderQty }} {{ detailSku.unit }}</a-descriptions-item>
        <a-descriptions-item label="供货周期">{{ detailSku.leadTime }} 天</a-descriptions-item>
        <a-descriptions-item label="供货状态">
          <a-tag :color="getSupplyStatusColor(detailSku.supplyStatus)">
            {{ getSupplyStatusText(detailSku.supplyStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="上架状态">
          <a-tag :color="detailSku.shelfStatus === 'on' ? 'green' : 'gray'">
            {{ detailSku.shelfStatus === 'on' ? '已上架' : '已下架' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal
      v-model:visible="statusChangeVisible"
      :title="statusChangeTitle"
      :width="500"
      :ok-text="statusChangeAction === 'stopped' ? '确认永久停货' : '确认'"
      :ok-button-props="{ status: statusChangeAction === 'stopped' ? 'danger' : 'normal' }"
      @ok="handleConfirmStatusChange"
    >
      <template v-if="statusChangeAction === 'paused'">
        <a-alert type="warning" style="margin-bottom: 16px">
          暂停后，该商品将暂时不在平台展示，但保留供货关联关系。您可以随时恢复供货。
        </a-alert>
      </template>
      
      <template v-else-if="statusChangeAction === 'stopped'">
        <a-alert type="error" style="margin-bottom: 16px">
          <template #title>此操作不可逆！</template>
          <div>
            <p>永久停货后：</p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>该商品将解除与平台的供货关联关系</li>
              <li>如需再次供货，需要重新申请</li>
            </ul>
          </div>
        </a-alert>
        <a-form layout="vertical">
          <a-form-item label="停货原因（必填）" required>
            <a-textarea 
              v-model="stopReason" 
              placeholder="请输入永久停货的原因" 
              :max-length="200"
            />
          </a-form-item>
        </a-form>
      </template>
      
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="商品名称">{{ statusChangeSku?.skuName }}</a-descriptions-item>
        <a-descriptions-item label="SKU编码">{{ statusChangeSku?.skuCode }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { ProductCategory } from '@gongchengcang/types'
import PlatformProductSelector from './components/PlatformProductSelector.vue'

interface SupplierSpu {
  spuId: string
  spuCode: string
  spuName: string
  categoryName?: string
  mainImage?: string
  unit: string
  source: 'self' | 'platform'
  skuCount: number
  auditStatus?: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface SupplierSku {
  id: string
  skuId?: string
  skuCode: string
  skuName: string
  spuId: string
  spuName: string
  categoryName?: string
  specs: Record<string, string>
  unit: string
  mainImage?: string
  source: 'self' | 'platform'
  supplyPrice?: number
  estimatedStock: number
  minOrderQty: number
  leadTime: number
  auditStatus?: 'pending' | 'approved' | 'rejected'
  supplyStatus: 'supplying' | 'paused' | 'stopped'
  shelfStatus: 'on' | 'off'
  createdAt: string
}

const router = useRouter()
const currentTab = ref('spu')

const spuLoading = ref(false)
const skuLoading = ref(false)
const categoryTree = ref<ProductCategory[]>([])

const showPlatformSelector = ref(false)
const skuEditVisible = ref(false)
const skuDetailVisible = ref(false)
const statusChangeVisible = ref(false)

const selectedSkuKeys = ref<string[]>([])

const editSku = ref<SupplierSku | null>(null)
const detailSku = ref<SupplierSku | null>(null)
const statusChangeSku = ref<SupplierSku | null>(null)
const statusChangeAction = ref<string>('')
const stopReason = ref('')

const spuPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const skuPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const spuSearchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  auditStatus: undefined as string | undefined,
})

const skuSearchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  supplyStatus: undefined as string | undefined,
  shelfStatus: undefined as string | undefined,
})

const skuEditForm = reactive({
  supplyPrice: 0,
  estimatedStock: 0,
  minOrderQty: 1,
  leadTime: 7,
})

const mockSpuList = ref<SupplierSpu[]>([
  {
    spuId: 'spu001',
    spuCode: 'SPU-TEST-001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    source: 'self',
    skuCount: 2,
    auditStatus: 'approved',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    spuId: 'spu002',
    spuCode: 'SPU-TEST-002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    source: 'platform',
    skuCount: 3,
    auditStatus: 'approved',
    createdAt: '2024-01-14 14:20:00',
  },
  {
    spuId: 'spu003',
    spuCode: 'SPU-TEST-003',
    spuName: '建筑用砂',
    categoryName: '砂石',
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    source: 'self',
    skuCount: 1,
    auditStatus: 'pending',
    createdAt: '2024-01-16 09:15:00',
  },
])

const mockSkuList = ref<SupplierSku[]>([
  {
    id: 'sku001',
    skuCode: 'SKU-TEST-001-42.5',
    skuName: '水泥 P.O 42.5',
    spuId: 'spu001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '42.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=4',
    source: 'self',
    supplyPrice: 420,
    estimatedStock: 1000,
    minOrderQty: 10,
    leadTime: 3,
    auditStatus: 'approved',
    supplyStatus: 'supplying',
    shelfStatus: 'on',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: 'sku002',
    skuCode: 'SKU-TEST-001-52.5',
    skuName: '水泥 P.O 52.5',
    spuId: 'spu001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '52.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=5',
    source: 'self',
    supplyPrice: 480,
    estimatedStock: 800,
    minOrderQty: 10,
    leadTime: 3,
    auditStatus: 'approved',
    supplyStatus: 'supplying',
    shelfStatus: 'on',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: 'sku003',
    skuCode: 'SKU-TEST-002-20',
    skuName: '螺纹钢 HRB400E 20mm',
    spuId: 'spu002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '20mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=6',
    source: 'platform',
    supplyPrice: 3600,
    estimatedStock: 500,
    minOrderQty: 5,
    leadTime: 7,
    auditStatus: 'approved',
    supplyStatus: 'supplying',
    shelfStatus: 'on',
    createdAt: '2024-01-14 14:20:00',
  },
  {
    id: 'sku004',
    skuCode: 'SKU-TEST-002-25',
    skuName: '螺纹钢 HRB400E 25mm',
    spuId: 'spu002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '25mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=7',
    source: 'platform',
    supplyPrice: 3550,
    estimatedStock: 600,
    minOrderQty: 5,
    leadTime: 7,
    auditStatus: 'approved',
    supplyStatus: 'paused',
    shelfStatus: 'off',
    createdAt: '2024-01-14 14:20:00',
  },
  {
    id: 'sku005',
    skuCode: 'SKU-TEST-003',
    skuName: '砂子 中砂',
    spuId: 'spu003',
    spuName: '建筑用砂',
    categoryName: '砂石',
    specs: { '类型': '中砂' },
    unit: '方',
    mainImage: 'https://picsum.photos/200/200?random=8',
    source: 'self',
    supplyPrice: 85,
    estimatedStock: 2000,
    minOrderQty: 20,
    leadTime: 2,
    auditStatus: 'pending',
    supplyStatus: 'supplying',
    shelfStatus: 'off',
    createdAt: '2024-01-16 09:15:00',
  },
])

const filteredSpuList = computed(() => {
  let result = mockSpuList.value
  
  if (spuSearchForm.keyword) {
    const keyword = spuSearchForm.keyword.toLowerCase()
    result = result.filter(p => 
      p.spuName.toLowerCase().includes(keyword) || 
      p.spuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (spuSearchForm.auditStatus) {
    result = result.filter(p => p.auditStatus === spuSearchForm.auditStatus)
  }
  
  return result
})

const filteredSkuList = computed(() => {
  let result = mockSkuList.value
  
  if (skuSearchForm.keyword) {
    const keyword = skuSearchForm.keyword.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(keyword) || 
      p.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (skuSearchForm.supplyStatus) {
    result = result.filter(p => p.supplyStatus === skuSearchForm.supplyStatus)
  }
  
  if (skuSearchForm.shelfStatus) {
    result = result.filter(p => p.shelfStatus === skuSearchForm.shelfStatus)
  }
  
  return result
})

const skuRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedSkuKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedSkuKeys.value = keys
  },
}))

const statusChangeTitle = computed(() => {
  const titles: Record<string, string> = {
    supplying: '继续供货',
    paused: '暂停供货',
    stopped: '永久停货',
  }
  return titles[statusChangeAction.value] || '状态变更'
})

function getAuditStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getAuditStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function getSupplyStatusColor(status: string) {
  const colors: Record<string, string> = {
    supplying: 'green',
    paused: 'orange',
    stopped: 'red',
  }
  return colors[status] || 'gray'
}

function getSupplyStatusText(status: string) {
  const texts: Record<string, string> = {
    supplying: '供货中',
    paused: '暂停供货',
    stopped: '永久停货',
  }
  return texts[status] || status
}

function handleTabChange() {
  selectedSkuKeys.value = []
}

function handleSpuSearch() {
  spuPagination.current = 1
}

function handleSkuSearch() {
  skuPagination.current = 1
}

function handleSpuPageChange(page: number) {
  spuPagination.current = page
}

function handleSkuPageChange(page: number) {
  skuPagination.current = page
}

function handleCreateProduct() {
  router.push('/supplier/product/add')
}

function handleViewSpu(record: SupplierSpu) {
  router.push(`/supplier/product/view/${record.spuId}`)
}

function handleEditSpu(record: SupplierSpu) {
  router.push(`/supplier/product/edit/${record.spuId}`)
}

function handleManageSku(record: SupplierSpu) {
  router.push(`/supplier/product/edit/${record.spuId}?tab=sku`)
}

function handleViewSkuList(record: SupplierSpu) {
  currentTab.value = 'sku'
  Message.info(`已切换到SKU列表，显示SPU【${record.spuName}】的SKU`)
}

function handleViewSku(record: SupplierSku) {
  detailSku.value = record
  skuDetailVisible.value = true
}

function handleEditSku(record: SupplierSku) {
  editSku.value = record
  skuEditForm.supplyPrice = record.supplyPrice || 0
  skuEditForm.estimatedStock = record.estimatedStock
  skuEditForm.minOrderQty = record.minOrderQty
  skuEditForm.leadTime = record.leadTime
  skuEditVisible.value = true
}

function handleSkuEditSubmit() {
  if (editSku.value) {
    editSku.value.supplyPrice = skuEditForm.supplyPrice
    editSku.value.estimatedStock = skuEditForm.estimatedStock
    editSku.value.minOrderQty = skuEditForm.minOrderQty
    editSku.value.leadTime = skuEditForm.leadTime
    Message.success('保存成功')
    skuEditVisible.value = false
  }
}

function handleShelfChange(record: SupplierSku, val: string) {
  Message.success(`${record.skuName} 已${val === 'on' ? '上架' : '下架'}`)
}

function handleBatchShelf(action: 'on' | 'off') {
  const count = selectedSkuKeys.value.length
  Message.success(`已${action === 'on' ? '上架' : '下架'} ${count} 个SKU`)
  selectedSkuKeys.value = []
}

function handleSupplyStatusChange(record: SupplierSku, action: string) {
  statusChangeSku.value = record
  statusChangeAction.value = action
  stopReason.value = ''
  statusChangeVisible.value = true
}

function handleConfirmStatusChange() {
  if (statusChangeAction.value === 'stopped' && !stopReason.value.trim()) {
    Message.error('请填写停货原因')
    return
  }
  
  if (statusChangeSku.value) {
    statusChangeSku.value.supplyStatus = statusChangeAction.value as any
    if (statusChangeAction.value === 'stopped') {
      statusChangeSku.value.shelfStatus = 'off'
    }
    Message.success('状态变更成功')
  }
  
  statusChangeVisible.value = false
}

function handlePlatformSelect(products: any[]) {
  showPlatformSelector.value = false
  
  products.forEach((sku, index) => {
    const newSku: SupplierSku = {
      id: `sku-platform-${Date.now()}-${index}`,
      skuId: sku.skuId,
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      spuId: sku.spuId,
      spuName: sku.spuName,
      categoryName: sku.categoryName,
      specs: sku.specs,
      unit: sku.unit,
      mainImage: sku.mainImage,
      source: 'platform',
      supplyPrice: sku.supplyPrice,
      estimatedStock: sku.estimatedStock || 0,
      minOrderQty: sku.minOrderQty || 1,
      leadTime: sku.leadTime || 7,
      auditStatus: 'pending',
      supplyStatus: 'supplying',
      shelfStatus: 'off',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
    mockSkuList.value.unshift(newSku)
  })
  
  skuPagination.total = mockSkuList.value.length
  
  Message.success(`已提交 ${products.length} 个SKU的供货申请，等待平台审核`)
}

onMounted(() => {
  categoryTree.value = [
    {
      categoryId: 'cat001',
      categoryName: '钢材',
      level: 1,
      sortOrder: 1,
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      categoryId: 'cat002',
      categoryName: '水泥',
      level: 1,
      sortOrder: 2,
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
  ]
  spuPagination.total = mockSpuList.value.length
  skuPagination.total = mockSkuList.value.length
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

.price {
  color: rgb(var(--danger-6));
  font-weight: 500;
}
</style>
