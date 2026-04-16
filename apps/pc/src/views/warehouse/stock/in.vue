<template>
  <div class="stock-in">
    <PrdPanel :items="prdModules" />
    
    <div class="page-header">
      <h2 class="page-title">📦 入库管理</h2>
      <p class="page-desc">统一管理所有入库业务，支持多种入库类型</p>
    </div>

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
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新增入库单
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

      <a-table :data="filteredList" :pagination="pagination" row-key="inNo" class="mt-16">
        <template #columns>
          <a-table-column title="入库单号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.inNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="入库类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.inType)">
                {{ getTypeText(record.inType) }}
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
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link>详情</a-link>
                <a-link v-if="record.status === 'pending'">入库</a-link>
                <a-link v-if="record.status === 'pending'">打印</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const searchForm = reactive({
  keyword: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const inType = ref('all')

const inList = ref([
  {
    inNo: 'IN202412250001',
    inType: 'purchase',
    sourceNo: 'PO-2024-12-001',
    warehouseName: '深圳湾科技园仓',
    supplierName: '华润水泥',
    skuCount: 2,
    totalQty: 800,
    totalAmount: 296000,
    status: 'completed',
    creator: '仓管A',
    createTime: '2024-12-25 10:30:00',
  },
  {
    inNo: 'IN202412250002',
    inType: 'purchase',
    sourceNo: 'PO-2024-12-003',
    warehouseName: '福田CBD项目仓',
    supplierName: '韶钢',
    skuCount: 3,
    totalQty: 200,
    totalAmount: 856000,
    status: 'pending',
    creator: '仓管B',
    createTime: '2024-12-25 09:15:00',
  },
  {
    inNo: 'IN202412240003',
    inType: 'transfer',
    sourceNo: 'TF20241224001',
    warehouseName: '宝安新安项目仓',
    supplierName: '深圳湾科技园仓',
    skuCount: 1,
    totalQty: 200,
    totalAmount: 72000,
    status: 'completed',
    creator: '仓管C',
    createTime: '2024-12-24 16:45:00',
  },
  {
    inNo: 'IN202412240004',
    inType: 'return',
    sourceNo: 'SO-2024-12340',
    warehouseName: '深圳湾科技园仓',
    supplierName: '客户退货',
    skuCount: 1,
    totalQty: 10,
    totalAmount: 3800,
    status: 'completed',
    creator: '仓管A',
    createTime: '2024-12-24 14:20:00',
  },
  {
    inNo: 'IN202412230005',
    inType: 'purchase',
    sourceNo: 'PO-2024-12-008',
    warehouseName: '福田CBD项目仓',
    supplierName: '海螺水泥',
    skuCount: 2,
    totalQty: 500,
    totalAmount: 180000,
    status: 'completed',
    creator: '仓管B',
    createTime: '2024-12-23 11:30:00',
  },
  {
    inNo: 'IN202412230006',
    inType: 'transfer',
    sourceNo: 'TF20241223002',
    warehouseName: '宝安新安项目仓',
    supplierName: '福田CBD项目仓',
    skuCount: 2,
    totalQty: 150,
    totalAmount: 58500,
    status: 'processing',
    creator: '仓管C',
    createTime: '2024-12-23 09:00:00',
  },
])

const filteredList = computed(() => {
  let result = inList.value

  if (inType.value !== 'all') {
    result = result.filter(r => r.inType === inType.value)
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r =>
      r.inNo.toLowerCase().includes(keyword) ||
      r.supplierName.toLowerCase().includes(keyword)
    )
  }

  pagination.total = result.length
  return result
})

function getTypeColor(type: string) {
  const map: Record<string, string> = {
    purchase: 'green',
    transfer: 'blue',
    return: 'orange',
  }
  return map[type] || 'grey'
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    purchase: '采购入库',
    transfer: '调拨入库',
    return: '退货入库',
  }
  return map[type] || type
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    cancelled: 'grey',
  }
  return map[status] || 'grey'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待入库',
    processing: '入库中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function handleSearch() {
  pagination.current = 1
}

const prdModules = [
  {
    moduleName: '项目背景',
    content: '入库管理统一管理所有类型的入库业务，包括采购入库、调拨入库、退货入库等，实现入库流程标准化和库存数据溯源。',
  },
  {
    moduleName: '核心功能',
    content: '1. 多类型支持：采购入库、调拨入库、退货入库\n2. 状态流转：待入库 → 入库中 → 已完成\n3. 来源关联：关联采购单、调拨单、销售退货单\n4. 批量操作：支持批量入库、批量打印\n5. 统计看板：今日入库单、待入库数量、入库商品数、入库金额',
  },
  {
    moduleName: '业务场景',
    content: '• 采购收货：根据采购订单进行收货入库\n• 调拨接收：接收其他仓库调拨过来的商品\n• 退货处理：客户退货退回入库\n• 入库单打印：打印入库单作为仓库凭证',
  },
  {
    moduleName: '业务规则',
    content: '1. 入库单必须关联来源单据\n2. 待入库状态下可编辑，入库完成后不可修改\n3. 入库数量可少于或等于单据数量，产生差异需备注说明\n4. 入库完成后自动增加对应仓库库存',
  },
]
</script>

<style scoped lang="less">
.stock-in {
  padding: 16px;

  .page-header {
    margin-bottom: 16px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .page-desc {
      font-size: 13px;
      color: var(--color-text-3);
      margin: 0;
    }
  }

  .stat-row {
    .stat-card {
      :deep(.arco-statistic-title) {
        font-size: 13px;
        color: var(--color-text-2);
      }
    }
  }
}
</style>
