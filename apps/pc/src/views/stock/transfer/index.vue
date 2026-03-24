<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>调拨管理</span>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            新建调拨单
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="currentTab" @change="handleTabChange">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="pending" title="待审批" />
        <a-tab-pane key="approved" title="已审批" />
        <a-tab-pane key="in_transit" title="调拨中" />
        <a-tab-pane key="completed" title="已完成" />
        <a-tab-pane key="rejected" title="已拒绝" />
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索调拨单号/商品名称"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.sourceWarehouseId" placeholder="调出仓库" style="width: 160px" allow-clear>
            <a-option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.name }}</a-option>
          </a-select>
          <a-select v-model="searchForm.targetWarehouseId" placeholder="调入仓库" style="width: 160px" allow-clear>
            <a-option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.name }}</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-space>
      </div>

      <a-table :data="filteredTransferList" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="调拨单号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.transferNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="调出仓库" :width="140">
            <template #cell="{ record }">
              <div class="warehouse-cell">
                <icon-export class="export-icon" />
                <span>{{ record.sourceWarehouseName }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="调入仓库" :width="140">
            <template #cell="{ record }">
              <div class="warehouse-cell">
                <icon-import class="import-icon" />
                <span>{{ record.targetWarehouseName }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="商品数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="count">{{ record.productCount }} 种</span>
            </template>
          </a-table-column>
          <a-table-column title="总数量" :width="100" align="right">
            <template #cell="{ record }">
              <span>{{ record.totalQuantity }} 件</span>
            </template>
          </a-table-column>
          <a-table-column title="总价值" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.totalValue.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请人" data-index="applicantName" :width="100" />
          <a-table-column title="申请时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <template v-if="record.status === 'pending'">
                  <a-button type="text" size="small" status="success" @click="handleApprove(record)">审批</a-button>
                  <a-button type="text" size="small" status="danger" @click="handleReject(record)">拒绝</a-button>
                </template>
                <template v-else-if="record.status === 'approved'">
                  <a-button type="text" size="small" @click="handleStartTransfer(record)">开始调拨</a-button>
                </template>
                <template v-else-if="record.status === 'in_transit'">
                  <a-button type="text" size="small" status="success" @click="handleComplete(record)">确认入库</a-button>
                </template>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="createVisible" title="新建调拨单" :width="900" @ok="handleCreateConfirm">
      <a-form :model="createForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="调出仓库" required>
              <a-select v-model="createForm.sourceWarehouseId" placeholder="请选择调出仓库">
                <a-option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="调入仓库" required>
              <a-select v-model="createForm.targetWarehouseId" placeholder="请选择调入仓库">
                <a-option 
                  v-for="w in warehouseList.filter(w => w.id !== createForm.sourceWarehouseId)" 
                  :key="w.id" 
                  :value="w.id"
                >
                  {{ w.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="调拨商品" required>
          <a-button type="dashed" long @click="handleAddProduct">
            <template #icon><icon-plus /></template>
            添加商品
          </a-button>
          <a-table 
            v-if="createForm.products.length > 0" 
            :data="createForm.products" 
            :pagination="false"
            style="margin-top: 16px"
          >
            <template #columns>
              <a-table-column title="商品编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" data-index="skuName" :width="180" />
              <a-table-column title="规格" data-index="spec" :width="100" />
              <a-table-column title="可用库存" :width="100">
                <template #cell="{ record }">
                  {{ record.availableQty }} {{ record.unit }}
                </template>
              </a-table-column>
              <a-table-column title="调拨数量" :width="150">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="record.transferQty" 
                    :min="1" 
                    :max="record.availableQty"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80">
                <template #cell="{ record, rowIndex }">
                  <a-button type="text" size="small" status="danger" @click="handleRemoveProduct(rowIndex)">
                    删除
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="调拨原因" required>
          <a-textarea v-model="createForm.reason" placeholder="请输入调拨原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="productSelectVisible" title="选择商品" :width="800" @ok="handleProductSelectConfirm">
      <a-input-search
        v-model="productSearchKeyword"
        placeholder="搜索商品名称/编码"
        style="width: 300px; margin-bottom: 16px"
      />
      <a-table 
        :data="filteredProductList" 
        :row-selection="productRowSelection"
        :pagination="{ pageSize: 5 }"
        row-key="skuId"
      >
        <template #columns>
          <a-table-column title="商品编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" data-index="skuName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="可用库存" :width="100">
            <template #cell="{ record }">
              <span :class="{ 'low-stock': record.availableQty < 10 }">
                {{ record.availableQty }} {{ record.unit }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price.toFixed(2) }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal v-model:visible="detailVisible" title="调拨单详情" :width="900" :footer="false">
      <template v-if="currentTransfer">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="调拨单号">{{ currentTransfer.transferNo }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentTransfer.status)">
              {{ getStatusText(currentTransfer.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="调出仓库">{{ currentTransfer.sourceWarehouseName }}</a-descriptions-item>
          <a-descriptions-item label="调入仓库">{{ currentTransfer.targetWarehouseName }}</a-descriptions-item>
          <a-descriptions-item label="申请人">{{ currentTransfer.applicantName }}</a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ currentTransfer.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="调拨原因" :span="2">{{ currentTransfer.reason }}</a-descriptions-item>
        </a-descriptions>

        <a-divider>调拨商品明细</a-divider>

        <a-table :data="currentTransfer.products" :pagination="false">
          <template #columns>
            <a-table-column title="商品编码" data-index="skuCode" :width="120" />
            <a-table-column title="商品名称" data-index="skuName" :width="180" />
            <a-table-column title="规格" data-index="spec" :width="100" />
            <a-table-column title="调拨数量" :width="100">
              <template #cell="{ record }">
                {{ record.quantity }} {{ record.unit }}
              </template>
            </a-table-column>
            <a-table-column title="单价" :width="100">
              <template #cell="{ record }">
                <span class="price">¥{{ record.price.toFixed(2) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="小计" :width="120">
              <template #cell="{ record }">
                <span class="price">¥{{ (record.quantity * record.price).toFixed(2) }}</span>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <div class="detail-footer">
          <div class="total-info">
            <span>共 <strong>{{ currentTransfer.productCount }}</strong> 种商品，</span>
            <span>总计 <strong>{{ currentTransfer.totalQuantity }}</strong> 件，</span>
            <span>总价值 <strong class="price">¥{{ currentTransfer.totalValue.toFixed(2) }}</strong></span>
          </div>
        </div>

        <a-divider>审批记录</a-divider>

        <a-timeline>
          <a-timeline-item v-for="log in currentTransfer.logs" :key="log.id">
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-action">{{ log.action }}</span>
                <span class="timeline-time">{{ log.createdAt }}</span>
              </div>
              <div class="timeline-user">操作人：{{ log.operatorName }}</div>
              <div v-if="log.remark" class="timeline-remark">备注：{{ log.remark }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const currentTab = ref('all')

const searchForm = reactive({
  keyword: '',
  sourceWarehouseId: undefined as string | undefined,
  targetWarehouseId: undefined as string | undefined,
  dateRange: [] as string[],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const warehouseList = ref([
  { id: 'w1', name: '华东工程仓' },
  { id: 'w2', name: '华南工程仓' },
  { id: 'w3', name: '华北工程仓' },
  { id: 'w4', name: '西南工程仓' },
  { id: 'w5', name: '西北工程仓' },
])

const mockTransferList = ref([
  {
    id: 't1',
    transferNo: 'DB202403240001',
    sourceWarehouseId: 'w1',
    sourceWarehouseName: '华东工程仓',
    targetWarehouseId: 'w2',
    targetWarehouseName: '华南工程仓',
    productCount: 5,
    totalQuantity: 150,
    totalValue: 45000,
    status: 'pending',
    applicantName: '张三',
    createdAt: '2024-03-24 10:30:00',
    reason: '华南仓库存不足，需要调拨补充',
    products: [
      { skuId: 'sku1', skuCode: 'SKU-SN-001', skuName: '水泥 P.O 42.5', spec: '50kg/袋', quantity: 50, unit: '吨', price: 380 },
      { skuId: 'sku2', skuCode: 'SKU-LG-001', skuName: '螺纹钢 HRB400 16mm', spec: '16mm', quantity: 30, unit: '吨', price: 3200 },
      { skuId: 'sku3', skuCode: 'SKU-HS-001', skuName: '黄砂 中砂', spec: '中砂', quantity: 70, unit: '方', price: 95 },
    ],
    logs: [
      { id: 'l1', action: '创建调拨单', operatorName: '张三', createdAt: '2024-03-24 10:30:00', remark: '' },
    ],
  },
  {
    id: 't2',
    transferNo: 'DB202403240002',
    sourceWarehouseId: 'w3',
    sourceWarehouseName: '华北工程仓',
    targetWarehouseId: 'w1',
    targetWarehouseName: '华东工程仓',
    productCount: 3,
    totalQuantity: 80,
    totalValue: 28000,
    status: 'approved',
    applicantName: '李四',
    createdAt: '2024-03-23 14:20:00',
    reason: '华东仓项目需求增加',
    products: [
      { skuId: 'sku4', skuCode: 'SKU-HNT-001', skuName: '商品混凝土 C30', spec: 'C30', quantity: 80, unit: '方', price: 350 },
    ],
    logs: [
      { id: 'l1', action: '创建调拨单', operatorName: '李四', createdAt: '2024-03-23 14:20:00', remark: '' },
      { id: 'l2', action: '审批通过', operatorName: '王五', createdAt: '2024-03-23 16:00:00', remark: '同意调拨' },
    ],
  },
  {
    id: 't3',
    transferNo: 'DB202403230001',
    sourceWarehouseId: 'w2',
    sourceWarehouseName: '华南工程仓',
    targetWarehouseId: 'w4',
    targetWarehouseName: '西南工程仓',
    productCount: 8,
    totalQuantity: 200,
    totalValue: 65000,
    status: 'in_transit',
    applicantName: '赵六',
    createdAt: '2024-03-22 09:00:00',
    reason: '西南新项目启动，需要调拨物资',
    products: [],
    logs: [
      { id: 'l1', action: '创建调拨单', operatorName: '赵六', createdAt: '2024-03-22 09:00:00', remark: '' },
      { id: 'l2', action: '审批通过', operatorName: '王五', createdAt: '2024-03-22 10:30:00', remark: '' },
      { id: 'l3', action: '开始调拨', operatorName: '钱七', createdAt: '2024-03-22 14:00:00', remark: '已安排物流运输' },
    ],
  },
  {
    id: 't4',
    transferNo: 'DB202403220001',
    sourceWarehouseId: 'w1',
    sourceWarehouseName: '华东工程仓',
    targetWarehouseId: 'w3',
    targetWarehouseName: '华北工程仓',
    productCount: 4,
    totalQuantity: 120,
    totalValue: 38000,
    status: 'completed',
    applicantName: '张三',
    createdAt: '2024-03-20 11:00:00',
    reason: '华北仓补充库存',
    products: [],
    logs: [
      { id: 'l1', action: '创建调拨单', operatorName: '张三', createdAt: '2024-03-20 11:00:00', remark: '' },
      { id: 'l2', action: '审批通过', operatorName: '王五', createdAt: '2024-03-20 14:00:00', remark: '' },
      { id: 'l3', action: '开始调拨', operatorName: '钱七', createdAt: '2024-03-20 16:00:00', remark: '' },
      { id: 'l4', action: '确认入库', operatorName: '孙八', createdAt: '2024-03-22 10:00:00', remark: '已验收入库' },
    ],
  },
  {
    id: 't5',
    transferNo: 'DB202403210001',
    sourceWarehouseId: 'w4',
    sourceWarehouseName: '西南工程仓',
    targetWarehouseId: 'w2',
    targetWarehouseName: '华南工程仓',
    productCount: 2,
    totalQuantity: 50,
    totalValue: 15000,
    status: 'rejected',
    applicantName: '李四',
    createdAt: '2024-03-21 15:30:00',
    reason: '华南仓临时需求',
    products: [],
    logs: [
      { id: 'l1', action: '创建调拨单', operatorName: '李四', createdAt: '2024-03-21 15:30:00', remark: '' },
      { id: 'l2', action: '审批拒绝', operatorName: '王五', createdAt: '2024-03-21 17:00:00', remark: '西南仓库存不足，无法调出' },
    ],
  },
])

const filteredTransferList = computed(() => {
  let result = mockTransferList.value
  
  if (currentTab.value !== 'all') {
    result = result.filter(t => t.status === currentTab.value)
  }
  
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(t => 
      t.transferNo.toLowerCase().includes(keyword) ||
      t.products.some(p => p.skuName.toLowerCase().includes(keyword))
    )
  }
  
  if (searchForm.sourceWarehouseId) {
    result = result.filter(t => t.sourceWarehouseId === searchForm.sourceWarehouseId)
  }
  
  if (searchForm.targetWarehouseId) {
    result = result.filter(t => t.targetWarehouseId === searchForm.targetWarehouseId)
  }
  
  pagination.total = result.length
  return result
})

const createVisible = ref(false)
const createForm = reactive({
  sourceWarehouseId: '',
  targetWarehouseId: '',
  products: [] as any[],
  reason: '',
})

const productSelectVisible = ref(false)
const productSearchKeyword = ref('')
const selectedProductKeys = ref<string[]>([])

const mockProductList = ref([
  { skuId: 'sku1', skuCode: 'SKU-SN-001', skuName: '水泥 P.O 42.5', spec: '50kg/袋', availableQty: 500, unit: '吨', price: 380 },
  { skuId: 'sku2', skuCode: 'SKU-LG-001', skuName: '螺纹钢 HRB400 16mm', spec: '16mm', availableQty: 200, unit: '吨', price: 3200 },
  { skuId: 'sku3', skuCode: 'SKU-HS-001', skuName: '黄砂 中砂', spec: '中砂', availableQty: 1000, unit: '方', price: 95 },
  { skuId: 'sku4', skuCode: 'SKU-HNT-001', skuName: '商品混凝土 C30', spec: 'C30', availableQty: 800, unit: '方', price: 350 },
  { skuId: 'sku5', skuCode: 'SKU-SS-001', skuName: '碎石 5-31.5mm', spec: '5-31.5mm', availableQty: 600, unit: '方', price: 85 },
  { skuId: 'sku6', skuCode: 'SKU-FS-001', skuName: '防水涂料', spec: '20kg/桶', availableQty: 8, unit: '桶', price: 380 },
])

const filteredProductList = computed(() => {
  if (!productSearchKeyword.value) return mockProductList.value
  const keyword = productSearchKeyword.value.toLowerCase()
  return mockProductList.value.filter(p => 
    p.skuName.toLowerCase().includes(keyword) ||
    p.skuCode.toLowerCase().includes(keyword)
  )
})

const productRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedProductKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedProductKeys.value = keys
  },
}))

const detailVisible = ref(false)
const currentTransfer = ref<any>(null)

function handleTabChange() {
  pagination.current = 1
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  createForm.sourceWarehouseId = ''
  createForm.targetWarehouseId = ''
  createForm.products = []
  createForm.reason = ''
  createVisible.value = true
}

function handleAddProduct() {
  if (!createForm.sourceWarehouseId) {
    Message.warning('请先选择调出仓库')
    return
  }
  selectedProductKeys.value = createForm.products.map(p => p.skuId)
  productSelectVisible.value = true
}

function handleProductSelectConfirm() {
  const newProducts = mockProductList.value
    .filter(p => selectedProductKeys.value.includes(p.skuId))
    .filter(p => !createForm.products.some(cp => cp.skuId === p.skuId))
    .map(p => ({
      ...p,
      transferQty: 1,
    }))
  
  createForm.products = [
    ...createForm.products.filter(p => selectedProductKeys.value.includes(p.skuId)),
    ...newProducts,
  ]
  
  productSelectVisible.value = false
}

function handleRemoveProduct(index: number) {
  createForm.products.splice(index, 1)
}

function handleCreateConfirm() {
  if (!createForm.sourceWarehouseId) {
    Message.warning('请选择调出仓库')
    return
  }
  if (!createForm.targetWarehouseId) {
    Message.warning('请选择调入仓库')
    return
  }
  if (createForm.products.length === 0) {
    Message.warning('请添加调拨商品')
    return
  }
  if (!createForm.reason.trim()) {
    Message.warning('请输入调拨原因')
    return
  }
  
  Message.success('调拨单创建成功，等待审批')
  createVisible.value = false
}

function handleApprove(record: any) {
  record.status = 'approved'
  record.logs.push({
    id: `l${Date.now()}`,
    action: '审批通过',
    operatorName: '当前用户',
    createdAt: new Date().toLocaleString(),
    remark: '',
  })
  Message.success('审批通过')
}

function handleReject(record: any) {
  record.status = 'rejected'
  record.logs.push({
    id: `l${Date.now()}`,
    action: '审批拒绝',
    operatorName: '当前用户',
    createdAt: new Date().toLocaleString(),
    remark: '',
  })
  Message.success('已拒绝')
}

function handleStartTransfer(record: any) {
  record.status = 'in_transit'
  record.logs.push({
    id: `l${Date.now()}`,
    action: '开始调拨',
    operatorName: '当前用户',
    createdAt: new Date().toLocaleString(),
    remark: '',
  })
  Message.success('调拨已开始')
}

function handleComplete(record: any) {
  record.status = 'completed'
  record.logs.push({
    id: `l${Date.now()}`,
    action: '确认入库',
    operatorName: '当前用户',
    createdAt: new Date().toLocaleString(),
    remark: '',
  })
  Message.success('调拨完成，库存已更新')
}

function handleViewDetail(record: any) {
  currentTransfer.value = record
  detailVisible.value = true
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'blue',
    in_transit: 'cyan',
    completed: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审批',
    approved: '已审批',
    in_transit: '调拨中',
    completed: '已完成',
    rejected: '已拒绝',
  }
  return texts[status] || status
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.table-actions {
  margin-bottom: 16px;
}

.warehouse-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.export-icon {
  color: var(--color-danger);
}

.import-icon {
  color: var(--color-success);
}

.count {
  font-weight: 500;
  color: var(--color-primary);
}

.price {
  color: var(--color-danger);
  font-weight: 500;
}

.low-stock {
  color: var(--color-danger);
}

.detail-footer {
  margin-top: 16px;
  text-align: right;
  
  .total-info {
    font-size: 14px;
    color: var(--color-text-2);
    
    strong {
      color: var(--color-text-1);
      
      &.price {
        font-size: 16px;
      }
    }
  }
}

.timeline-content {
  .timeline-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  
  .timeline-action {
    font-weight: 500;
    color: var(--color-text-1);
  }
  
  .timeline-time {
    font-size: 12px;
    color: var(--color-text-3);
  }
  
  .timeline-user {
    font-size: 13px;
    color: var(--color-text-2);
  }
  
  .timeline-remark {
    font-size: 13px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}
</style>
