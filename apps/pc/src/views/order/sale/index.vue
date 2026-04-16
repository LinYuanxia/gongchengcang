<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <a-tabs v-model:active-tab="activeTab" class="order-tabs">
        <a-tab-pane key="all" :title="`全部 (${orderStats.total})`" />
        <a-tab-pane key="pending" :title="`待确认 (${orderStats.pending})`" />
        <a-tab-pane key="unpaid" :title="`待支付 (${orderStats.unpaid})`" />
        <a-tab-pane key="undelivered" :title="`待发货 (${orderStats.undelivered})`" />
        <a-tab-pane key="delivered" :title="`待收货 (${orderStats.delivered})`" />
        <a-tab-pane key="completed" :title="`已完成 (${orderStats.completed})`" />
        <a-tab-pane key="refunded" :title="`已退款 (${orderStats.refunded})`" />
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索订单号/采购方/供应商"
            style="width: 260px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.warehouseId" placeholder="采购工程仓" style="width: 160px" allow-clear>
            <a-option v-for="item in warehouseList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.supplierId" placeholder="供应商" style="width: 160px" allow-clear>
            <a-option v-for="item in supplierList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-table
        :data="filteredOrderList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="采购工程仓" data-index="warehouseName" :width="160" />
          <a-table-column title="供应商" data-index="supplierName" :width="160" />
          <a-table-column title="商品信息" :width="220">
            <template #cell="{ record }">
              <div class="product-info text-truncate">
                {{ record.items?.[0]?.productName }}
                <span v-if="record.items?.length > 1" class="text-muted"> 等{{ record.items.length }}种商品</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-xl">¥{{ record.totalAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="应扣金额" :width="120" align="right">
            <template #cell="{ record }">
              <template v-if="record.deductionAmount">
                <span class="text-danger">¥{{ record.deductionAmount?.toLocaleString() }}</span>
                <a-tag color="orange" size="small" style="margin-left: 4px">有应扣</a-tag>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="实付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="font-semibold">¥{{ record.paidAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getOrderStatusColor(record.status)">
                {{ getOrderStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.paymentStatus === 'paid' ? 'green' : 'orange'">
                {{ record.paymentStatus === 'paid' ? '已支付' : '未支付' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button 
                  v-if="record.deductionAmount" 
                  type="text" 
                  size="small"
                  status="warning"
                  @click="handleViewDeduction(record)"
                >
                  应扣记录
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="deductionModalVisible"
      title="应扣记录详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="关联订单" :span="2">
          {{ currentOrder.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="供应商">
          {{ currentOrder.supplierName }}
        </a-descriptions-item>
        <a-descriptions-item label="采购工程仓">
          {{ currentOrder.warehouseName }}
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          ¥{{ currentOrder.totalAmount?.toLocaleString() }}
        </a-descriptions-item>
        <a-descriptions-item label="应扣金额">
          <span class="text-danger">¥{{ currentOrder.deductionAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-table :data="deductionRecords" :pagination="false">
        <template #columns>
          <a-table-column title="应扣编号" data-index="deductionNo" :width="160" />
          <a-table-column title="应扣类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'fine' ? 'red' : 'orange'">
                {{ record.type === 'fine' ? '罚款' : '违约金' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="应扣金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="应扣原因" data-index="reason" />
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    title: '1. Tab 分类统计模块',
    content: `
| Tab 标签 | 对应状态 | 统计数据源 |
|---------|---------|----------|
| 全部 | - | 所有订单总数 |
| 待确认 | pending | 待审核确认订单数 |
| 待支付 | unpaid | 已确认未支付订单数 |
| 待发货 | undelivered | 已支付待发货订单数 |
| 待收货 | delivered | 已发货待签收订单数 |
| 已完成 | completed | 交易完成订单数 |
| 已退款 | refunded | 退款订单数 |
    `
  },
  {
    title: '2. 搜索筛选模块',
    content: `
| 筛选条件 | 组件类型 | 宽度 | 说明 |
|---------|---------|------|------|
| 关键词搜索 | InputSearch | 260px | 同时匹配：订单号/采购方名称/供应商名称 |
| 采购工程仓 | Select下拉 | 160px | 单选、可清空 |
| 供应商 | Select下拉 | 160px | 单选、可清空 |
| 创建时间 | RangePicker | 260px | 起始+结束日期范围 |
    `
  },
  {
    title: '3. Tag 色彩与状态机',
    content: `
| 状态 | 颜色 | 下一状态 |
|------|------|---------|
| 待确认 | gold | 已确认 / 已取消 |
| 待支付 | blue | 已支付 / 已取消 |
| 待发货 | cyan | 已发货 |
| 待收货 | purple | 已收货 |
| 已完成 | green | - 终态 |
| 已取消 | gray | - 终态 |
| 已退款 | red | - 终态 |
    `
  },
  {
    title: '4. 操作按钮权限矩阵',
    content: `
| 操作按钮 | 平台采购 | 供应商 | 仓库 | 财务 | 只读 |
|---------|---------|--------|------|------|------|
| 查看详情 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 确认订单 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 取消订单 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 支付标记 | ✅ | ❌ | ❌ | ✅ | ❌ |
| 标记发货 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 确认收货 | ✅ | ❌ | ✅ | ❌ | ❌ |
| 申请退款 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 导出 | ✅ | ✅ | ✅ | ✅ | ❌ |
    `
  },
  {
    title: '5. 表格列定义',
    content: `
| 列名 | 宽度 | 特殊处理 |
|------|------|---------|
| 订单编号 | 180px | Link 蓝色链接，点击打开详情抽屉 |
| 采购工程仓 | 150px | - |
| 供应商 | 150px | - |
| SKU数量 | 100px | center 居中 |
| 订单金额 | 120px | right 右对齐、红字、¥前缀 |
| 状态 | 120px | Tag 色彩 |
| 创建时间 | 180px | - |
| 操作 | 240px | 最多显示 4 个按钮，超出折叠 |
    `
  }
]

const router = useRouter()
const loading = ref(false)
const activeTab = ref('all')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  warehouseId: undefined as string | undefined,
  supplierId: undefined as string | undefined,
  dateRange: [] as string[],
})

const warehouseList = ref([
  { id: '1', name: '北京朝阳工程仓' },
  { id: '2', name: '上海浦东工程仓' },
  { id: '3', name: '广州天河工程仓' },
])

const supplierList = ref([
  { id: '1', name: '北京建材供应商有限公司' },
  { id: '2', name: '上海建材批发有限公司' },
  { id: '3', name: '广东建材集团' },
])

const orderList = ref([
  {
    id: '1',
    orderNo: 'PO202401200001',
    warehouseName: '北京朝阳工程仓',
    supplierName: '北京建材供应商有限公司',
    status: 'completed',
    paymentStatus: 'paid',
    totalAmount: 128600,
    deductionAmount: 5000,
    paidAmount: 123600,
    items: [{ productName: 'C30混凝土' }, { productName: 'HRB400钢筋' }],
    createTime: '2024-01-20 10:30:00',
  },
  {
    id: '2',
    orderNo: 'PO202401190002',
    warehouseName: '上海浦东工程仓',
    supplierName: '上海建材批发有限公司',
    status: 'delivered',
    paymentStatus: 'paid',
    totalAmount: 86500,
    deductionAmount: 0,
    paidAmount: 86500,
    items: [{ productName: 'PC42.5水泥' }],
    createTime: '2024-01-19 14:20:00',
  },
  {
    id: '3',
    orderNo: 'PO202401180003',
    warehouseName: '广州天河工程仓',
    supplierName: '广东建材集团',
    status: 'completed',
    paymentStatus: 'paid',
    totalAmount: 245000,
    deductionAmount: 12000,
    paidAmount: 233000,
    items: [{ productName: '蒸压加气砌块' }, { productName: '中砂河沙' }, { productName: '碎石骨料' }],
    createTime: '2024-01-18 09:15:00',
  },
  {
    id: '4',
    orderNo: 'PO202401170004',
    warehouseName: '北京朝阳工程仓',
    supplierName: '北京建材供应商有限公司',
    status: 'undelivered',
    paymentStatus: 'paid',
    totalAmount: 67800,
    deductionAmount: 0,
    paidAmount: 67800,
    items: [{ productName: 'SBS改性沥青防水卷材' }],
    createTime: '2024-01-17 16:45:00',
  },
  {
    id: '5',
    orderNo: 'PO202401160005',
    warehouseName: '上海浦东工程仓',
    supplierName: '广东建材集团',
    status: 'refunded',
    paymentStatus: 'refunded',
    totalAmount: 95000,
    deductionAmount: 2500,
    paidAmount: 92500,
    items: [{ productName: '外墙乳胶漆' }],
    createTime: '2024-01-16 11:30:00',
  },
])

const deductionRecords = ref([
  {
    deductionNo: 'YK20240120001',
    type: 'fine',
    amount: 3000,
    reason: '延迟送货24小时，按合同约定罚款',
    createTime: '2024-01-20 18:00:00',
  },
  {
    deductionNo: 'YK20240120002',
    type: 'penalty',
    amount: 2000,
    reason: '部分商品质量检验不合格扣除违约金',
    createTime: '2024-01-20 18:30:00',
  },
])

const deductionModalVisible = ref(false)
const currentOrder = ref<any>({})

const orderStats = computed(() => {
  return {
    total: orderList.value.length,
    pending: orderList.value.filter(o => o.status === 'pending').length,
    unpaid: orderList.value.filter(o => o.paymentStatus === 'unpaid').length,
    undelivered: orderList.value.filter(o => o.status === 'undelivered').length,
    delivered: orderList.value.filter(o => o.status === 'delivered').length,
    completed: orderList.value.filter(o => o.status === 'completed').length,
    refunded: orderList.value.filter(o => o.status === 'refunded').length,
  }
})

const filteredOrderList = computed(() => {
  let result = orderList.value

  if (activeTab.value === 'pending') {
    result = result.filter(o => o.status === 'pending')
  } else if (activeTab.value === 'unpaid') {
    result = result.filter(o => o.paymentStatus === 'unpaid')
  } else if (activeTab.value === 'undelivered') {
    result = result.filter(o => o.status === 'undelivered')
  } else if (activeTab.value === 'delivered') {
    result = result.filter(o => o.status === 'delivered')
  } else if (activeTab.value === 'completed') {
    result = result.filter(o => o.status === 'completed')
  } else if (activeTab.value === 'refunded') {
    result = result.filter(o => o.status === 'refunded')
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(o => 
      o.orderNo.toLowerCase().includes(keyword) ||
      o.warehouseName.toLowerCase().includes(keyword) ||
      o.supplierName.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.warehouseId) {
    result = result.filter(o => o.id === searchForm.warehouseId)
  }

  if (searchForm.supplierId) {
    result = result.filter(o => o.id === searchForm.supplierId)
  }

  return result
})

function getOrderStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    unpaid: '待支付',
    undelivered: '待发货',
    delivered: '待收货',
    completed: '已完成',
    refunded: '已退款',
    cancelled: '已取消',
  }
  return map[status] || status
}

function getOrderStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    unpaid: 'orange',
    undelivered: 'orange',
    delivered: 'blue',
    completed: 'green',
    refunded: 'gray',
    cancelled: 'red',
  }
  return map[status] || 'gray'
}

onMounted(() => {
  pagination.total = orderList.value.length
})

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.warehouseId = undefined
  searchForm.supplierId = undefined
  searchForm.dateRange = []
  activeTab.value = 'all'
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  router.push({ path: '/order/detail', query: { id: record.id } })
}

function handleViewDeduction(record: any) {
  currentOrder.value = record
  if (record.id === '1') {
    deductionRecords.value = [
      {
        deductionNo: 'YK20240120001',
        type: 'fine',
        amount: 3000,
        reason: '延迟送货24小时，按合同约定罚款',
        createTime: '2024-01-20 18:00:00',
      },
      {
        deductionNo: 'YK20240120002',
        type: 'penalty',
        amount: 2000,
        reason: '部分商品质量检验不合格扣除违约金',
        createTime: '2024-01-20 18:30:00',
      },
    ]
  } else if (record.id === '3') {
    deductionRecords.value = [
      {
        deductionNo: 'YK20240118001',
        type: 'penalty',
        amount: 12000,
        reason: '碎石骨料含泥量超标，扣除违约金',
        createTime: '2024-01-18 20:15:00',
      },
    ]
  } else if (record.id === '5') {
    deductionRecords.value = [
      {
        deductionNo: 'YK20240116001',
        type: 'fine',
        amount: 2500,
        reason: '颜色色差超出验收标准',
        createTime: '2024-01-16 16:00:00',
      },
    ]
  }
  deductionModalVisible.value = true
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.order-tabs) {
  margin-bottom: 16px;

  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.text-xl {
  font-size: 18px;
  font-weight: 600;
}

.text-muted {
  color: rgb(var(--gray-6));
  font-size: 12px;
}

.font-semibold {
  font-weight: 600;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
