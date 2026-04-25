<template>
  <div class="stock-manage">
    
    <div class="page-header">
      <h2 class="page-title">📦 出入库管理</h2>
      <p class="page-desc">统一管理所有出入库业务，支持多种业务类型</p>
    </div>

    <a-tabs v-model:active-tab="activeTab" class="main-tabs">
      <a-tab-pane key="in" title="入库管理">
        <a-card>
          <template #extra>
            <a-space>
              <a-radio-group v-model="inType" type="button" size="small">
                <a-radio value="all">全部</a-radio>
                <a-radio value="purchase">采购入库</a-radio>
                <a-radio value="transfer">调拨入库</a-radio>
                <a-radio value="return">退货入库</a-radio>
              </a-radio-group>
              <a-input-search v-model="searchForm.keyword" placeholder="搜索入库单号/商品" style="width: 240px" @search="handleSearch" />
              <a-button type="primary" @click="handleCreateInbound">
                <template #icon><icon-plus /></template>
                按批次入库
              </a-button>
            </a-space>
          </template>

          <a-row :gutter="16" class="stat-row">
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="今日入库单" :value="8" suffix="单">
                  <template #prefix><icon-file /></template>
                </a-statistic>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="待入库" :value="2" suffix="单">
                  <template #value>
                    <span style="color: var(--color-warning-6)">2</span>
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="入库商品数" :value="1280" suffix="件" />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="入库金额" :value="456800" :precision="0" prefix="¥" />
              </a-card>
            </a-col>
          </a-row>

          <a-table :data="filteredInList" :pagination="inPagination" row-key="inNo" class="mt-16">
            <template #columns>
              <a-table-column title="入库单号" :width="160">
                <template #cell="{ record }">
                  <a-link>{{ record.inNo }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="入库类型" :width="120">
                <template #cell="{ record }">
                  <a-tag :color="getInTypeColor(record.inType)">
                    {{ getInTypeText(record.inType) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="来源单据" data-index="sourceNo" :width="160">
                <template #cell="{ record }">
                  <a-link v-if="record.sourceNo">{{ record.sourceNo }}</a-link>
                  <span v-else class="text-secondary">-</span>
                </template>
              </a-table-column>
              <a-table-column title="入库仓库" data-index="warehouseName" :width="150" />
              <a-table-column title="供应商/来源" data-index="supplierName" :width="150" />
              <a-table-column title="批次数量" :width="100" align="center">
                <template #cell="{ record }">
                  <a-tag color="blue">{{ (record.batches || []).length }} 批</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="商品种类" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.skuCount }}
                </template>
              </a-table-column>
              <a-table-column title="总数量" :width="100" align="right">
                <template #cell="{ record }">
                  <strong>{{ record.totalQty }}</strong>
                </template>
              </a-table-column>
              <a-table-column title="总金额" :width="120" align="right">
                <template #cell="{ record }">
                  ¥{{ record.totalAmount.toLocaleString() }}
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="创建人" data-index="creator" :width="100" />
              <a-table-column title="创建时间" data-index="createdAt" :width="160" />
              <a-table-column title="操作" :width="120" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleViewInboundDetail(record)">详情</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="out" title="出库管理">
        <a-card>
          <template #extra>
            <a-space>
              <a-radio-group v-model="outType" type="button" size="small">
                <a-radio value="all">全部</a-radio>
                <a-radio value="sale">销售出库</a-radio>
                <a-radio value="transfer">调拨出库</a-radio>
                <a-radio value="return">退货出库</a-radio>
              </a-radio-group>
              <a-input-search v-model="searchForm.outKeyword" placeholder="搜索出库单号/商品" style="width: 240px" @search="handleSearch" />
              <a-button type="primary">
                <template #icon><icon-plus /></template>
                新增出库单
              </a-button>
            </a-space>
          </template>

          <a-row :gutter="16" class="stat-row">
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="今日出库单" :value="12" suffix="单">
                  <template #prefix><icon-file /></template>
                </a-statistic>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="待出库" :value="5" suffix="单">
                  <template #value>
                    <span style="color: var(--color-warning-6)">5</span>
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="出库商品数" :value="856" suffix="件" />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false" size="small" class="stat-card">
                <a-statistic title="出库金额" :value="325600" :precision="0" prefix="¥" />
              </a-card>
            </a-col>
          </a-row>

          <a-table :data="filteredOutList" :pagination="outPagination" row-key="outNo" class="mt-16">
            <template #columns>
              <a-table-column title="出库单号" :width="160">
                <template #cell="{ record }">
                  <a-link>{{ record.outNo }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="出库类型" :width="120">
                <template #cell="{ record }">
                  <a-tag :color="getOutTypeColor(record.outType)">
                    {{ getOutTypeText(record.outType) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="来源单据" data-index="sourceNo" :width="160">
                <template #cell="{ record }">
                  <a-link v-if="record.sourceNo">{{ record.sourceNo }}</a-link>
                  <span v-else class="text-secondary">-</span>
                </template>
              </a-table-column>
              <a-table-column title="出库仓库" data-index="warehouseName" :width="150" />
              <a-table-column title="客户/去向" data-index="customerName" :width="150" />
              <a-table-column title="商品种类" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.skuCount }}
                </template>
              </a-table-column>
              <a-table-column title="总数量" :width="100" align="right">
                <template #cell="{ record }">
                  <strong>{{ record.totalQty }}</strong>
                </template>
              </a-table-column>
              <a-table-column title="总金额" :width="120" align="right">
                <template #cell="{ record }">
                  ¥{{ record.totalAmount.toLocaleString() }}
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="创建人" data-index="creator" :width="100" />
              <a-table-column title="创建时间" data-index="createdAt" :width="160" />
              <a-table-column title="操作" :width="120" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small">查看</a-button>
                    <a-dropdown v-if="record.status === 1">
                      <template #content>
                        <a-doption>审核</a-doption>
                        <a-doption>打印</a-doption>
                        <a-doption>作废</a-doption>
                      </template>
                      <a-button type="text" size="small">更多</a-button>
                    </a-dropdown>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>

    <a-modal
      v-model:visible="createInboundModalVisible"
      title="按批次生成采购入库单（支持多选）"
      :width="850"
      @ok="handleCreateInboundConfirm"
      @cancel="cancelCreateInbound"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        表格勾选多个批次，可合并生成一张入库单（同一供应商、同一仓库）
      </a-alert>

      <a-form layout="vertical">
        <a-row :gutter="16" style="margin-bottom: 16px;">
          <a-col :span="12">
            <a-form-item label="入库单号" required>
              <a-input v-model="createInboundForm.inNo">
                <template #prepend>
                  <a-button @click="generateInNo" size="small">生成</a-button>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item>
              <div style="line-height: 40px; text-align: right;">
                已选 <strong class="text-primary">{{ selectedBatches.length }}</strong> 个批次，
                共 <strong class="text-success">{{ totalSelectedQty }}</strong> 件，
                金额：<strong class="text-danger">¥{{ totalSelectedAmount.toLocaleString() }}</strong>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-table
          :data="pendingBatches"
          :pagination="false"
          size="small"
          row-key="batchNo"
          @selection-change="onBatchSelectionChange"
        >
          <template #columns>
            <a-table-column type="checkbox" :width="45" />
            <a-table-column title="批次号" data-index="batchNo" :width="140">
              <template #cell="{ record }">
                <a-tag color="arcoblue" size="small">{{ record.batchNo }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="商品名称" data-index="skuName" :width="180" />
            <a-table-column title="供应商" data-index="supplierName" :width="120" />
            <a-table-column title="仓库" data-index="warehouseName" :width="120" />
            <a-table-column title="可入库" :width="90" align="right">
              <template #cell="{ record }">
                <strong>{{ record.currentStock }}{{ record.unit }}</strong>
              </template>
            </a-table-column>
            <a-table-column title="单价" :width="90" align="right">
              <template #cell="{ record }">¥{{ record.price }}</template>
            </a-table-column>
            <a-table-column title="入库数量" :width="100">
              <template #cell="{ record }">
                <a-input-number
                  v-model="record.inQty"
                  :min="0"
                  :max="record.currentStock"
                  :precision="0"
                  :disabled="!record._checked"
                  style="width: 100%"
                  @change="calcTotal"
                />
              </template>
            </a-table-column>
          </template>
        </a-table>

        <a-form-item label="入库备注" style="margin-top: 16px;">
          <a-textarea v-model="createInboundForm.remark" :max-length="200" placeholder="入库说明、异常情况等" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="detailModalVisible"
      title="入库单详情"
      :width="900"
      :footer="false"
    >
      <template #extra>
        <a-button type="primary" size="small" @click="handlePrint">打印入库单</a-button>
      </template>

      <div v-if="currentInbound">
        <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px;">
          <a-descriptions-item label="入库单号">{{ currentInbound.inNo }}</a-descriptions-item>
          <a-descriptions-item label="入库类型">
            <a-tag :color="getInTypeColor(currentInbound.inType)">
              {{ getInTypeText(currentInbound.inType) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="来源单据">{{ currentInbound.sourceNo || '-' }}</a-descriptions-item>
          <a-descriptions-item label="入库仓库">{{ currentInbound.warehouseName }}</a-descriptions-item>
          <a-descriptions-item label="供应商">{{ currentInbound.supplierName }}</a-descriptions-item>
          <a-descriptions-item label="关联批次">{{ (currentInbound.batches || []).length }} 批</a-descriptions-item>
          <a-descriptions-item label="创建人">{{ currentInbound.creator }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentInbound.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentInbound.status)">
              {{ getStatusText(currentInbound.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <h4 style="margin: 16px 0 8px;">入库商品明细</h4>
        <a-table :data="currentInbound.items || []" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="商品名称" data-index="skuName" :width="200" />
            <a-table-column title="规格" data-index="specs" :width="150">
              <template #cell="{ record }">
                <a-tag v-for="(v, k) in record.specs" :key="k" size="mini">{{ v }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="单位" data-index="unit" :width="80" />
            <a-table-column title="单价" :width="100" align="right">
              <template #cell="{ record }">¥{{ record.price }}</template>
            </a-table-column>
            <a-table-column title="入库数量" :width="100" align="right">
              <template #cell="{ record }"><strong>{{ record.quantity }}</strong></template>
            </a-table-column>
            <a-table-column title="金额" :width="120" align="right">
              <template #cell="{ record }">¥{{ (record.price * record.quantity).toLocaleString() }}</template>
            </a-table-column>
          </template>
        </a-table>

        <a-divider>关联批次明细</a-divider>

        <a-table :data="currentInbound.batches || []" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="批次号" data-index="batchNo" :width="150">
              <template #cell="{ record }">
                <a-tag color="blue">{{ record.batchNo }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
            <a-table-column title="商品名称" data-index="productName" :width="200" />
            <a-table-column title="入库数量" :width="120" align="right">
              <template #cell="{ record }">
                <strong>{{ record.quantity }}</strong>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <a-row :gutter="16" style="margin-top: 20px;">
          <a-col :span="12">
            <div style="color: #86909c; font-size: 13px;">
              备注：{{ currentInbound.remark || '无' }}
            </div>
          </a-col>
          <a-col :span="12" style="text-align: right;">
            <div style="font-size: 15px;">
              合计：<strong style="color: #f53f3f; font-size: 18px;">¥{{ currentInbound.totalAmount.toLocaleString() }}</strong>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('in')

const inType = ref('all')
const outType = ref('all')

const searchForm = reactive({
  keyword: '',
  outKeyword: '',
})

const inPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const outPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const inList = ref([
  {
    inNo: 'IN202403240001',
    inType: 'purchase',
    sourceNo: 'PO202403200001',
    warehouseName: '深圳湾科技园项目仓',
    supplierName: '华润水泥(深圳)有限公司',
    skuCount: 3,
    totalQty: 1000,
    totalAmount: 380000,
    status: 2,
    creator: '张三',
    createdAt: '2024-03-24 10:30:00',
    batches: [
      { batchNo: 'B202403240001', skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', quantity: 400 },
      { batchNo: 'B202403240002', skuCode: 'SKU002', productName: 'HRB400螺纹钢Φ16', quantity: 350 },
      { batchNo: 'B202403240003', skuCode: 'SKU003', productName: '中沙', quantity: 250 },
    ],
  },
  {
    inNo: 'IN202403240002',
    inType: 'transfer',
    sourceNo: 'TF202403230001',
    warehouseName: '深圳湾科技园项目仓',
    supplierName: '福田CBD项目仓',
    skuCount: 2,
    totalQty: 500,
    totalAmount: 125600,
    status: 1,
    creator: '李四',
    createdAt: '2024-03-24 09:15:00',
    batches: [
      { batchNo: 'B202403240004', skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', quantity: 300 },
      { batchNo: 'B202403240005', skuCode: 'SKU002', productName: '碎石', quantity: 200 },
    ],
  },
  {
    inNo: 'IN202403230003',
    inType: 'return',
    sourceNo: '',
    warehouseName: '深圳湾科技园项目仓',
    supplierName: '中建五局',
    skuCount: 1,
    totalQty: 50,
    totalAmount: 18500,
    status: 2,
    creator: '王五',
    createdAt: '2024-03-23 16:45:00',
    batches: [
      { batchNo: 'B202403230006', skuCode: 'SKU006', productName: '防水涂料', quantity: 50 },
    ],
  },
])

const outList = ref([
  {
    outNo: 'OUT202403240001',
    outType: 'sale',
    sourceNo: 'SO202403200001',
    warehouseName: '深圳湾科技园项目仓',
    customerName: '中建三局集团有限公司',
    skuCount: 5,
    totalQty: 850,
    totalAmount: 325600,
    status: 2,
    creator: '张三',
    createdAt: '2024-03-24 14:20:00',
  },
  {
    outNo: 'OUT202403240002',
    outType: 'transfer',
    sourceNo: 'TF202403240001',
    warehouseName: '深圳湾科技园项目仓',
    customerName: '宝安新安项目仓',
    skuCount: 2,
    totalQty: 300,
    totalAmount: 95000,
    status: 1,
    creator: '李四',
    createdAt: '2024-03-24 11:10:00',
  },
  {
    outNo: 'OUT202403230003',
    outType: 'return',
    sourceNo: '',
    warehouseName: '深圳湾科技园项目仓',
    customerName: '东方雨虹',
    skuCount: 1,
    totalQty: 20,
    totalAmount: 7600,
    status: 2,
    creator: '王五',
    createdAt: '2024-03-23 10:30:00',
  },
])

const filteredInList = computed(() => {
  let result = inList.value
  
  if (inType.value !== 'all') {
    result = result.filter(item => item.inType === inType.value)
  }
  
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(item => 
      item.inNo.toLowerCase().includes(keyword) ||
      item.supplierName.toLowerCase().includes(keyword)
    )
  }
  
  inPagination.total = result.length
  return result
})

const filteredOutList = computed(() => {
  let result = outList.value
  
  if (outType.value !== 'all') {
    result = result.filter(item => item.outType === outType.value)
  }
  
  if (searchForm.outKeyword) {
    const keyword = searchForm.outKeyword.toLowerCase()
    result = result.filter(item => 
      item.outNo.toLowerCase().includes(keyword) ||
      item.customerName.toLowerCase().includes(keyword)
    )
  }
  
  outPagination.total = result.length
  return result
})

function handleSearch() {
  inPagination.current = 1
  outPagination.current = 1
}

function getInTypeText(type: string) {
  const texts: Record<string, string> = {
    purchase: '采购入库',
    transfer: '调拨入库',
    return: '退货入库',
  }
  return texts[type] || type
}

function getInTypeColor(type: string) {
  const colors: Record<string, string> = {
    purchase: 'blue',
    transfer: 'green',
    return: 'orange',
  }
  return colors[type] || 'gray'
}

function getOutTypeText(type: string) {
  const texts: Record<string, string> = {
    sale: '销售出库',
    transfer: '调拨出库',
    return: '退货出库',
  }
  return texts[type] || type
}

function getOutTypeColor(type: string) {
  const colors: Record<string, string> = {
    sale: 'red',
    transfer: 'green',
    return: 'orange',
  }
  return colors[type] || 'gray'
}

function getStatusText(status: number) {
  const texts: Record<number, string> = {
    0: '草稿',
    1: '待审核',
    2: '已完成',
    9: '已作废',
  }
  return texts[status] || '未知'
}

function getStatusColor(status: number) {
  const colors: Record<number, string> = {
    0: 'gray',
    1: 'orange',
    2: 'green',
    9: 'red',
  }
  return colors[status] || 'gray'
}

const pendingBatches = ref([
  {
    batchNo: 'B202412250001',
    skuName: '水泥 P.O 42.5 袋装',
    specs: { '强度等级': '42.5', '包装': '袋装' },
    supplierName: '华润水泥',
    warehouseName: '深圳湾科技园仓',
    purchaseNo: 'PO-2024-12-001',
    currentStock: 320,
    price: 420,
    unit: '吨',
    inBound: false,
    inQty: 0,
  },
  {
    batchNo: 'B202412240002',
    skuName: '螺纹钢 HRB400 12mm',
    specs: { '直径': '12mm', '等级': 'HRB400' },
    supplierName: '韶钢',
    warehouseName: '深圳湾科技园仓',
    purchaseNo: 'PO-2024-12-003',
    currentStock: 65,
    price: 4800,
    unit: '吨',
    inBound: false,
    inQty: 0,
  },
  {
    batchNo: 'B202412200003',
    skuName: '碎石 5-31.5mm',
    specs: { '粒径': '5-31.5mm' },
    supplierName: '本地砂石厂',
    warehouseName: '福田CBD项目仓',
    purchaseNo: 'PO-2024-12-005',
    currentStock: 800,
    price: 85,
    unit: '方',
    inBound: false,
    inQty: 0,
  },
])

const createInboundModalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedBatches = ref<any[]>([])
const currentInbound = ref<any>(null)

const totalSelectedQty = computed(() => {
  return selectedBatches.value.reduce((sum, b) => sum + (b.inQty || 0), 0)
})

const totalSelectedAmount = computed(() => {
  return selectedBatches.value.reduce((sum, b) => sum + (b.price * (b.inQty || 0)), 0)
})

const createInboundForm = reactive({
  inNo: '',
  remark: '',
})

function handleCreateInbound() {
  createInboundForm.inNo = ''
  createInboundForm.remark = ''
  pendingBatches.value.forEach(b => {
    b._checked = false
    b.inQty = 0
  })
  selectedBatches.value = []
  createInboundModalVisible.value = true
}

function onBatchSelectionChange(selection: any[]) {
  selectedBatches.value = selection
  selection.forEach(b => {
    if (b.inQty === 0) {
      b.inQty = Math.min(b.currentStock, 1)
    }
  })
}

function calcTotal() {
}

function generateInNo() {
  const date = new Date()
  const dateStr = date.getFullYear().toString() + 
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  createInboundForm.inNo = `IN${dateStr}${random}`
}

function handleCreateInboundConfirm() {
  if (!createInboundForm.inNo) {
    Message.warning('请生成入库单号')
    return
  }
  if (selectedBatches.value.length === 0) {
    Message.warning('请至少勾选一个批次')
    return
  }
  if (totalSelectedQty.value <= 0) {
    Message.warning('请填写入库数量')
    return
  }

  const firstBatch = selectedBatches.value[0]
  
  const newInbound = {
    inNo: createInboundForm.inNo,
    inType: 'purchase',
    sourceNo: firstBatch.purchaseNo,
    batchNo: selectedBatches.value.map(b => b.batchNo).join(', '),
    warehouseName: firstBatch.warehouseName,
    supplierName: firstBatch.supplierName,
    skuCount: selectedBatches.value.length,
    totalQty: totalSelectedQty.value,
    totalAmount: totalSelectedAmount.value,
    status: 2,
    creator: '当前用户',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    remark: createInboundForm.remark,
    items: selectedBatches.value.map(b => ({
      skuName: b.skuName,
      specs: b.specs,
      unit: b.unit,
      price: b.price,
      quantity: b.inQty,
    })),
  }

  inList.value.unshift(newInbound as any)
  inPagination.total = inList.value.length

  Message.success(`入库单 ${newInbound.inNo} 创建成功（${selectedBatches.value.length} 个批次）`)
  createInboundModalVisible.value = false
}

function cancelCreateInbound() {
  createInboundModalVisible.value = false
}

function handleViewInboundDetail(record: any) {
  currentInbound.value = {
    ...record,
    items: record.items || [
      {
        skuName: '水泥 P.O 42.5 袋装',
        specs: { '强度等级': '42.5', '包装': '袋装' },
        unit: '吨',
        price: 420,
        quantity: record.totalQty,
      },
    ],
  }
  detailModalVisible.value = true
}

function handlePrint() {
  Message.info('打印入库单功能')
}

const prdModules = [
  {
    id: 'in',
    title: '入库管理',
    icon: 'icon-upload',
    content: '',
    onClick: () => { activeTab.value = 'in' }
  },
  {
    id: 'out',
    title: '出库管理',
    icon: 'icon-download',
    content: '',
    onClick: () => { activeTab.value = 'out' }
  },
]
</script>

<style lang="less" scoped>
.stock-manage {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;

  .page-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .page-desc {
    margin: 0;
    font-size: 13px;
    color: var(--color-text-2);
  }
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  :deep(.arco-statistic-title) {
    font-size: 13px;
    color: var(--color-text-2);
  }

  :deep(.arco-statistic-value) {
    font-size: 20px;
    font-weight: 600;
  }
}

.mt-16 {
  margin-top: 16px;
}

.text-secondary {
  color: var(--color-text-3);
}

:deep(.main-tabs .arco-tabs-header) {
  padding: 0;
  margin-bottom: 16px;
}

:deep(.main-tabs .arco-tabs-header-title) {
  font-size: 15px;
  font-weight: 500;
  padding: 8px 24px;
}
</style>
