<template>
  <div class="stock-out">
    <PrdPanel :items="prdModules" />
    
    <div class="page-header">
      <h2 class="page-title">📤 出库管理</h2>
      <p class="page-desc">统一管理所有出库业务，支持多种出库类型</p>
    </div>

    <a-card>
      <template #extra>
        <a-space>
          <a-radio-group v-model="outType" type="button" size="small">
            <a-radio value="all">全部</a-radio>
            <a-radio value="sale">销售出库</a-radio>
            <a-radio value="transfer">调拨出库</a-radio>
            <a-radio value="pick">领料出库</a-radio>
          </a-radio-group>
          <a-input-search v-model="searchForm.keyword" placeholder="搜索出库单号/商品" style="width: 240px" @search="handleSearch" />
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新增出库单
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="今日出库单" :value="6" suffix="单">
              <template #prefix><icon-file /></template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="待出库" :value="3" suffix="单">
              <template #value>
                <span style="color: var(--color-warning-6)">3</span>
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="出库商品数" :value="960" suffix="件" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="出库金额" :value="368500" :precision="0" prefix="¥" />
          </a-card>
        </a-col>
      </a-row>

      <a-table :data="filteredList" :pagination="pagination" row-key="outNo" class="mt-16">
        <template #columns>
          <a-table-column title="出库单号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.outNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="出库类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.outType)">
                {{ getTypeText(record.outType) }}
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
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link>详情</a-link>
                <a-link v-if="record.status === 'pending'">出库</a-link>
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

const outType = ref('all')

const outList = ref([
  {
    outNo: 'OUT202412250001',
    outType: 'sale',
    sourceNo: 'SO-2024-12345',
    warehouseName: '深圳湾科技园仓',
    customerName: '万科建筑',
    skuCount: 2,
    totalQty: 500,
    totalAmount: 190000,
    status: 'completed',
    creator: '仓管A',
    createTime: '2024-12-25 14:30:00',
  },
  {
    outNo: 'OUT202412250002',
    outType: 'sale',
    sourceNo: 'SO-2024-12346',
    warehouseName: '福田CBD项目仓',
    customerName: '碧桂园',
    skuCount: 3,
    totalQty: 280,
    totalAmount: 125600,
    status: 'pending',
    creator: '仓管B',
    createTime: '2024-12-25 11:15:00',
  },
  {
    outNo: 'OUT202412240003',
    outType: 'transfer',
    sourceNo: 'TF20241224001',
    warehouseName: '深圳湾科技园仓',
    customerName: '宝安新安项目仓',
    skuCount: 1,
    totalQty: 200,
    totalAmount: 72000,
    status: 'completed',
    creator: '仓管A',
    createTime: '2024-12-24 15:45:00',
  },
  {
    outNo: 'OUT202412240004',
    outType: 'pick',
    sourceNo: '',
    warehouseName: '福田CBD项目仓',
    customerName: '项目现场领用',
    skuCount: 2,
    totalQty: 50,
    totalAmount: 18500,
    status: 'completed',
    creator: '仓管B',
    createTime: '2024-12-24 09:20:00',
  },
  {
    outNo: 'OUT202412230005',
    outType: 'sale',
    sourceNo: 'SO-2024-12340',
    warehouseName: '宝安新安项目仓',
    customerName: '恒大地产',
    skuCount: 2,
    totalQty: 180,
    totalAmount: 68400,
    status: 'completed',
    creator: '仓管C',
    createTime: '2024-12-23 16:30:00',
  },
  {
    outNo: 'OUT202412230006',
    outType: 'transfer',
    sourceNo: 'TF20241223002',
    warehouseName: '福田CBD项目仓',
    customerName: '宝安新安项目仓',
    skuCount: 2,
    totalQty: 150,
    totalAmount: 58500,
    status: 'processing',
    creator: '仓管C',
    createTime: '2024-12-23 10:00:00',
  },
])

const filteredList = computed(() => {
  let result = outList.value

  if (outType.value !== 'all') {
    result = result.filter(r => r.outType === outType.value)
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r =>
      r.outNo.toLowerCase().includes(keyword) ||
      r.customerName.toLowerCase().includes(keyword)
    )
  }

  pagination.total = result.length
  return result
})

function getTypeColor(type: string) {
  const map: Record<string, string> = {
    sale: 'red',
    transfer: 'blue',
    pick: 'purple',
  }
  return map[type] || 'grey'
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    sale: '销售出库',
    transfer: '调拨出库',
    pick: '领料出库',
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
    pending: '待出库',
    processing: '出库中',
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
    content: '出库管理统一管理所有类型的出库业务，包括销售出库、调拨出库、领料出库等，实现出库流程标准化和库存数据溯源。',
  },
  {
    moduleName: '核心功能',
    content: '1. 多类型支持：销售出库、调拨出库、领料出库\n2. 状态流转：待出库 → 出库中 → 已完成\n3. 来源关联：关联销售订单、调拨单、工程领料单\n4. 库存校验：出库前自动校验可用库存，防止超发\n5. 统计看板：今日出库单、待出库数量、出库商品数、出库金额',
  },
  {
    moduleName: '业务场景',
    content: '• 订单发货：根据销售订单进行发货出库\n• 调拨发出：向其他仓库调拨商品\n• 工程领料：工地现场领用材料\n• 出库单打印：打印出库单和送货单',
  },
  {
    moduleName: '业务规则',
    content: '1. 出库单必须关联来源单据\n2. 待出库状态下可编辑，出库完成后不可修改\n3. 先进先出：按批次先进先出自动推荐出库批次\n4. 库存扣减：出库完成后自动扣减对应仓库库存\n5. 超发控制：出库数量不能超过可用库存',
  },
]
</script>

<style scoped lang="less">
.stock-out {
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
