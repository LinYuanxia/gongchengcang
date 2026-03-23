<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>价格管理</span>
      </template>
      <template #extra>
        <a-radio-group v-model="currentTab" type="button" @change="handleTabChange">
          <a-radio value="pending">待审批 ({{ pendingCount }})</a-radio>
          <a-radio value="approved">已通过 ({{ approvedCount }})</a-radio>
          <a-radio value="rejected">已驳回 ({{ rejectedCount }})</a-radio>
        </a-radio-group>
      </template>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/编码"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.adjustType" placeholder="调价类型" style="width: 120px" allow-clear>
            <a-option value="single">单品调价</a-option>
            <a-option value="batch">批量调价</a-option>
          </a-select>
          <a-range-picker
            v-model="searchForm.dateRange"
            style="width: 260px"
            placeholder="申请时间"
          />
        </a-space>
        <a-space v-if="currentTab === 'pending'">
          <a-button
            type="primary"
            :disabled="selectedKeys.length === 0"
            @click="handleBatchApprove(true)"
          >
            批量通过 ({{ selectedKeys.length }})
          </a-button>
          <a-button
            :disabled="selectedKeys.length === 0"
            @click="handleBatchApprove(false)"
          >
            批量驳回 ({{ selectedKeys.length }})
          </a-button>
        </a-space>
      </div>

      <a-table
        :data="filteredRecords"
        :loading="loading"
        :pagination="pagination"
        :row-selection="currentTab === 'pending' ? rowSelection : undefined"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="调价类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.adjustType === 'single' ? 'blue' : 'purple'">
                {{ record.adjustType === 'single' ? '单品' : '批量' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="商品信息" :width="280">
            <template #cell="{ record }">
              <template v-if="record.adjustType === 'single'">
                <div class="product-info">
                  <div class="product-detail">
                    <div class="product-name">{{ record.skuName }}</div>
                    <div class="product-code">{{ record.skuCode }}</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="batch-info">
                  <a-link @click="handleViewBatchProducts(record)">
                    {{ record.skuCount }} 个商品
                  </a-link>
                </div>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="调价方式" :width="100">
            <template #cell="{ record }">
              {{ record.applyType === 'fixed' ? '固定价格' : '按比例' }}
            </template>
          </a-table-column>
          <a-table-column title="原价格" :width="100">
            <template #cell="{ record }">
              <template v-if="record.oldPrice">
                ¥{{ record.oldPrice.toFixed(2) }}
              </template>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="新价格" :width="120">
            <template #cell="{ record }">
              <div>
                <span class="new-price">¥{{ record.newPrice.toFixed(2) }}</span>
                <span v-if="record.applyType === 'percent'" class="adjust-percent">
                  ({{ record.percent > 0 ? '+' : '' }}{{ record.percent }}%)
                </span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="调价原因" :width="200">
            <template #cell="{ record }">
              <a-tooltip :content="record.reason">
                <span class="reason-text">{{ record.reason }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="申请人" :width="100">
            <template #cell="{ record }">
              {{ record.applicantName }}
            </template>
          </a-table-column>
          <a-table-column title="申请时间" :width="160">
            <template #cell="{ record }">
              {{ record.appliedAt }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <template v-if="currentTab === 'pending'">
                  <a-button type="text" size="small" @click="handleApprove(record, true)">通过</a-button>
                  <a-button type="text" size="small" status="danger" @click="handleApprove(record, false)">驳回</a-button>
                </template>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="detailVisible"
      title="调价详情"
      :width="720"
      :footer="false"
    >
      <template v-if="currentRecord">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="调价类型">
            <a-tag :color="currentRecord.adjustType === 'single' ? 'blue' : 'purple'">
              {{ currentRecord.adjustType === 'single' ? '单品调价' : '批量调价' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="调价方式">
            {{ currentRecord.applyType === 'fixed' ? '固定价格' : '按比例调整' }}
          </a-descriptions-item>
          <template v-if="currentRecord.adjustType === 'single'">
            <a-descriptions-item label="商品编码">{{ currentRecord.skuCode }}</a-descriptions-item>
            <a-descriptions-item label="商品名称">{{ currentRecord.skuName }}</a-descriptions-item>
          </template>
          <template v-else>
            <a-descriptions-item label="涉及商品">{{ currentRecord.skuCount }} 个SKU</a-descriptions-item>
            <a-descriptions-item label="调价范围">批量调价</a-descriptions-item>
          </template>
          <a-descriptions-item label="原价格">
            <template v-if="currentRecord.oldPrice">¥{{ currentRecord.oldPrice.toFixed(2) }}</template>
            <span v-else>-</span>
          </a-descriptions-item>
          <a-descriptions-item label="新价格">
            <span class="new-price">¥{{ currentRecord.newPrice.toFixed(2) }}</span>
            <span v-if="currentRecord.applyType === 'percent'">
              ({{ currentRecord.percent > 0 ? '+' : '' }}{{ currentRecord.percent }}%)
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="调价原因" :span="2">{{ currentRecord.reason }}</a-descriptions-item>
          <a-descriptions-item label="申请人">{{ currentRecord.applicantName }}</a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ currentRecord.appliedAt }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="审批时间">
            {{ currentRecord.approvedAt || '-' }}
          </a-descriptions-item>
          <template v-if="currentRecord.status === 'approved'">
            <a-descriptions-item label="审批人">{{ currentRecord.approverName }}</a-descriptions-item>
          </template>
          <template v-if="currentRecord.status === 'rejected'">
            <a-descriptions-item label="审批人">{{ currentRecord.approverName }}</a-descriptions-item>
            <a-descriptions-item label="驳回原因" :span="2">{{ currentRecord.rejectReason }}</a-descriptions-item>
          </template>
        </a-descriptions>

        <template v-if="currentRecord.adjustType === 'batch'">
          <a-divider>涉及商品</a-divider>
          <a-table
            :data="batchProducts"
            :pagination="{ pageSize: 5 }"
            size="small"
          >
            <template #columns>
              <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" data-index="skuName" :width="180" />
              <a-table-column title="原价格" :width="100">
                <template #cell="{ record }">
                  ¥{{ record.oldPrice.toFixed(2) }}
                </template>
              </a-table-column>
              <a-table-column title="新价格" :width="100">
                <template #cell="{ record }">
                  <span class="new-price">¥{{ record.newPrice.toFixed(2) }}</span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </template>
      </template>
    </a-modal>

    <a-modal
      v-model:visible="batchProductsVisible"
      title="批量调价商品列表"
      :width="800"
      :footer="false"
    >
      <a-table
        :data="batchProducts"
        :pagination="{ pageSize: 10 }"
      >
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" data-index="skuName" :width="180" />
          <a-table-column title="原价格" :width="100">
            <template #cell="{ record }">
              ¥{{ record.oldPrice.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="新价格" :width="100">
            <template #cell="{ record }">
              <span class="new-price">¥{{ record.newPrice.toFixed(2) }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="rejectVisible"
      title="驳回原因"
      :width="400"
      @ok="handleRejectConfirm"
    >
      <a-form :model="rejectForm" layout="vertical">
        <a-form-item label="驳回原因" required>
          <a-textarea v-model="rejectForm.reason" placeholder="请输入驳回原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { PriceAdjustRecord, PriceAdjustStatus } from '@gongchengcang/types'

const currentTab = ref('pending')
const loading = ref(false)
const selectedKeys = ref<string[]>([])

const searchForm = reactive({
  keyword: '',
  adjustType: undefined as string | undefined,
  dateRange: undefined as [string, string] | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const detailVisible = ref(false)
const currentRecord = ref<PriceAdjustRecord | null>(null)
const batchProductsVisible = ref(false)
const batchProducts = ref<{ skuCode: string; skuName: string; oldPrice: number; newPrice: number }[]>([])

const rejectVisible = ref(false)
const rejectRecord = ref<PriceAdjustRecord | null>(null)
const rejectForm = reactive({
  reason: '',
})

const mockRecords = ref<PriceAdjustRecord[]>([
  {
    id: 'pa001',
    adjustType: 'single',
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    oldPrice: 450,
    newPrice: 480,
    applyType: 'fixed',
    fixedPrice: 480,
    reason: '原材料成本上涨，需要调整市场售价',
    status: 'pending',
    applicantId: 'u001',
    applicantName: '张三',
    appliedAt: '2024-01-15 10:30:00',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 10:30:00',
  },
  {
    id: 'pa002',
    adjustType: 'batch',
    skuIds: ['sku002', 'sku003', 'sku004'],
    skuCount: 3,
    applyType: 'percent',
    percent: 5,
    newPrice: 0,
    reason: '市场行情调整，统一上调5%',
    status: 'pending',
    applicantId: 'u002',
    applicantName: '李四',
    appliedAt: '2024-01-15 11:00:00',
    createdAt: '2024-01-15 11:00:00',
    updatedAt: '2024-01-15 11:00:00',
  },
  {
    id: 'pa003',
    adjustType: 'single',
    skuId: 'sku005',
    skuCode: 'SKU-GC-002-16',
    skuName: '螺纹钢 HRB400 16mm',
    oldPrice: 4200,
    newPrice: 4100,
    applyType: 'fixed',
    fixedPrice: 4100,
    reason: '市场竞争需要，适当降价促销',
    status: 'approved',
    applicantId: 'u001',
    applicantName: '张三',
    appliedAt: '2024-01-14 14:00:00',
    approverId: 'u003',
    approverName: '王五',
    approvedAt: '2024-01-14 15:30:00',
    createdAt: '2024-01-14 14:00:00',
    updatedAt: '2024-01-14 15:30:00',
  },
  {
    id: 'pa004',
    adjustType: 'batch',
    skuIds: ['sku006', 'sku007'],
    skuCount: 2,
    applyType: 'percent',
    percent: -3,
    newPrice: 0,
    reason: '促销活动，批量降价3%',
    status: 'approved',
    applicantId: 'u002',
    applicantName: '李四',
    appliedAt: '2024-01-13 09:00:00',
    approverId: 'u003',
    approverName: '王五',
    approvedAt: '2024-01-13 10:00:00',
    createdAt: '2024-01-13 09:00:00',
    updatedAt: '2024-01-13 10:00:00',
  },
  {
    id: 'pa005',
    adjustType: 'single',
    skuId: 'sku008',
    skuCode: 'SKU-SS-003',
    skuName: '黄砂 中砂',
    oldPrice: 85,
    newPrice: 95,
    applyType: 'fixed',
    fixedPrice: 95,
    reason: '运输成本增加',
    status: 'rejected',
    applicantId: 'u001',
    applicantName: '张三',
    appliedAt: '2024-01-12 16:00:00',
    approverId: 'u003',
    approverName: '王五',
    approvedAt: '2024-01-12 17:00:00',
    rejectReason: '涨价幅度过大，建议分阶段调整',
    createdAt: '2024-01-12 16:00:00',
    updatedAt: '2024-01-12 17:00:00',
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

const pendingCount = computed(() => mockRecords.value.filter(r => r.status === 'pending').length)
const approvedCount = computed(() => mockRecords.value.filter(r => r.status === 'approved').length)
const rejectedCount = computed(() => mockRecords.value.filter(r => r.status === 'rejected').length)

const filteredRecords = computed(() => {
  return mockRecords.value.filter(r => r.status === currentTab.value)
})

function handleTabChange() {
  selectedKeys.value = []
  pagination.current = 1
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: PriceAdjustRecord) {
  currentRecord.value = record
  if (record.adjustType === 'batch') {
    loadBatchProducts(record)
  }
  detailVisible.value = true
}

function handleViewBatchProducts(record: PriceAdjustRecord) {
  loadBatchProducts(record)
  batchProductsVisible.value = true
}

function loadBatchProducts(record: PriceAdjustRecord) {
  const count = record.skuCount || 3
  batchProducts.value = []
  for (let i = 1; i <= count; i++) {
    const oldPrice = 100 + i * 50
    let newPrice = oldPrice
    if (record.applyType === 'fixed') {
      newPrice = record.fixedPrice || oldPrice
    } else if (record.applyType === 'percent') {
      newPrice = oldPrice * (1 + (record.percent || 0) / 100)
    }
    batchProducts.value.push({
      skuCode: `SKU-BATCH-${String(i).padStart(3, '0')}`,
      skuName: `批量商品${i}`,
      oldPrice,
      newPrice,
    })
  }
}

function handleApprove(record: PriceAdjustRecord, approved: boolean) {
  if (approved) {
    doApprove(record, approved)
  } else {
    rejectRecord.value = record
    rejectForm.reason = ''
    rejectVisible.value = true
  }
}

function handleRejectConfirm() {
  if (!rejectForm.reason.trim()) {
    Message.warning('请输入驳回原因')
    return
  }
  if (rejectRecord.value) {
    doApprove(rejectRecord.value, false, rejectForm.reason)
  }
  rejectVisible.value = false
}

function doApprove(record: PriceAdjustRecord, approved: boolean, rejectReason?: string) {
  const index = mockRecords.value.findIndex(r => r.id === record.id)
  if (index > -1) {
    mockRecords.value[index] = {
      ...mockRecords.value[index],
      status: approved ? 'approved' : 'rejected',
      approverId: 'u003',
      approverName: '当前用户',
      approvedAt: new Date().toLocaleString(),
      rejectReason,
    }
    Message.success(approved ? '审批通过' : '已驳回')
  }
}

function handleBatchApprove(approved: boolean) {
  if (!approved) {
    if (selectedKeys.value.length === 1) {
      const record = mockRecords.value.find(r => r.id === selectedKeys.value[0])
      if (record) {
        handleApprove(record, false)
        return
      }
    }
    Message.warning('批量驳回请在详情中逐个处理')
    return
  }
  
  selectedKeys.value.forEach(key => {
    const record = mockRecords.value.find(r => r.id === key)
    if (record) {
      doApprove(record, true)
    }
  })
  selectedKeys.value = []
}

function getStatusColor(status: PriceAdjustStatus) {
  const colorMap: Record<PriceAdjustStatus, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colorMap[status]
}

function getStatusText(status: PriceAdjustStatus) {
  const textMap: Record<PriceAdjustStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
  }
  return textMap[status]
}

onMounted(() => {
  pagination.total = mockRecords.value.length
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

.batch-info {
  color: var(--color-text-2);
}

.new-price {
  color: var(--color-danger-6);
  font-weight: 500;
}

.adjust-percent {
  margin-left: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}

.reason-text {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
