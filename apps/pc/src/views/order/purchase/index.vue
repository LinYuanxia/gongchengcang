<template>
  <div class="page-container">
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
            placeholder="搜索订单号/工程仓/供应商"
            style="width: 260px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.warehouseId" placeholder="工程仓" style="width: 160px" allow-clear>
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
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const prdItems = [
  {
    title: '1. Tab 分类统计模块',
    content: `
| Tab 标签 | 对应状态 | 统计数据源 |
|---------|---------|----------|
| 全部 | - | 所有订单总数 |
| 待确认 | pending | 待提交供应商确认 |
| 待接单 | processing | 供应商确认待接单 |
| 待发货 | undelivered | 已接单待发货 |
| 待入库 | delivering | 运输中待入库 |
| 已完成 | completed | 入库完成 |
| 已取消 | cancelled | 已取消 |
    `
  },
  {
    title: '2. 搜索筛选模块',
    content: `
| 筛选条件 | 组件类型 | 宽度 | 说明 |
|---------|---------|------|------|
| 关键词搜索 | InputSearch | 260px | 匹配：订单号/供应商名称/商品名称 |
| 工程仓 | Select下拉 | 160px | 单选、可清空 |
| 供应商 | Select下拉 | 160px | 单选、可清空 |
| 创建时间 | RangePicker | 260px | 起始+结束日期范围 |
    `
  },
  {
    title: '3. 供应商视角状态机',
    content: `
\`\`\`
平台创建订单 → 供应商确认接单 → 发货 → 仓库收货 → 完成
        ↓              ↓          ↓
    拒绝接单        取消       拒收
\`\`\`

| 状态 | 颜色 | 可执行操作 |
|------|------|---------|
| 待确认 | gold | 确认接单 / 拒绝接单 |
| 待发货 | blue | 发货 / 取消 |
| 配送中 | cyan | 查看物流 |
| 已完成 | green | 查看详情 |
| 已取消 | red | - |
    `
  },
  {
    title: '4. 权限矩阵',
    content: `
| 功能点 | 平台采购 | 供应商 | 仓库管理员 | 财务 |
|--------|---------|--------|----------|------|
| 创建采购订单 | ✅ | ❌ | ❌ | ❌ |
| 确认接单 | ❌ | ✅ | ❌ | ❌ |
| 拒绝接单 | ❌ | ✅ | ❌ | ❌ |
| 发货操作 | ❌ | ✅ | ❌ | ❌ |
| 确认收货 | ❌ | ❌ | ✅ | ❌ |
| 查看物流 | ✅ | ✅ | ✅ | ✅ |
| 对账单 | ✅ | ✅ | ❌ | ✅ |
    `
  },
  {
    title: '5. 表格列定义',
    content: `
| 列名 | 宽度 | 特殊处理 |
|------|------|---------|
| 订单编号 | 180px | Link 蓝色链接跳转详情 |
| 供应商名称 | 180px | - |
| 收货仓库 | 150px | - |
| 商品数量 | 100px | center 居中 |
| 订单总额 | 120px | right 右对齐、红字 |
| 状态 | 120px | Tag 色彩 |
| 创建时间 | 180px | - |
| 操作 | 200px | 按状态动态显示按钮 |
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
    items: [{ productName: '外墙乳胶漆' }],
    createTime: '2024-01-16 11:30:00',
  },
])

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

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
