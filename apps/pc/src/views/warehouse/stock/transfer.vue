<template>
  <div class="stock-transfer">
    
    <div class="page-header">
      <h2 class="page-title">🔄 库存调拨</h2>
      <p class="page-desc">跨仓库库存流转，实现库存资源优化配置</p>
    </div>

    <a-card>
      <template #extra>
        <a-space>
          <a-radio-group v-model="status" type="button" size="small">
            <a-radio value="all">全部</a-radio>
            <a-radio value="pending">待出库</a-radio>
            <a-radio value="processing">调拨中</a-radio>
            <a-radio value="completed">已完成</a-radio>
          </a-radio-group>
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建调拨单
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="待出库" :value="2" suffix="单" :value-style="{ color: 'var(--color-warning-6)' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="调拨中" :value="1" suffix="单" :value-style="{ color: 'var(--color-primary-6)' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="本月调拨量" :value="15" suffix="次" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="调拨SKU" :value="45" suffix="个" />
          </a-card>
        </a-col>
      </a-row>

      <a-table :data="filteredList" :pagination="pagination" row-key="transferNo" class="mt-16">
        <template #columns>
          <a-table-column title="调拨单号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.transferNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="调出仓库" :width="150">
            <template #cell="{ record }">
              <a-tag color="red" size="small">调出</a-tag>
              {{ record.fromWarehouse }}
            </template>
          </a-table-column>
          <a-table-column title="调入仓库" :width="150">
            <template #cell="{ record }">
              <a-tag color="green" size="small">调入</a-tag>
              {{ record.toWarehouse }}
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
          <a-table-column title="调拨金额" :width="120" align="right">
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
          <a-table-column title="预计到达" data-index="eta" :width="120" />
          <a-table-column title="创建人" data-index="creator" :width="100" />
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link>详情</a-link>
                <a-link v-if="record.status === 'pending'">出库</a-link>
                <a-link v-if="record.status === 'processing'">入库</a-link>
                <a-link v-if="record.status === 'pending'">取消</a-link>
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

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const status = ref('all')

const transferList = ref([
  {
    transferNo: 'TF202412250001',
    fromWarehouse: '深圳湾科技园仓',
    toWarehouse: '宝安新安项目仓',
    skuCount: 2,
    totalQty: 350,
    totalAmount: 130500,
    status: 'pending',
    eta: '2024-12-26',
    creator: '仓管A',
    createTime: '2024-12-25 10:30:00',
  },
  {
    transferNo: 'TF202412240002',
    fromWarehouse: '福田CBD项目仓',
    toWarehouse: '宝安新安项目仓',
    skuCount: 2,
    totalQty: 150,
    totalAmount: 58500,
    status: 'processing',
    eta: '2024-12-25',
    creator: '仓管B',
    createTime: '2024-12-24 15:45:00',
  },
  {
    transferNo: 'TF202412230003',
    fromWarehouse: '深圳湾科技园仓',
    toWarehouse: '福田CBD项目仓',
    skuCount: 1,
    totalQty: 200,
    totalAmount: 72000,
    status: 'completed',
    eta: '2024-12-24',
    creator: '仓管A',
    createTime: '2024-12-23 09:15:00',
  },
  {
    transferNo: 'TF202412220004',
    fromWarehouse: '宝安新安项目仓',
    toWarehouse: '深圳湾科技园仓',
    skuCount: 1,
    totalQty: 100,
    totalAmount: 36000,
    status: 'completed',
    eta: '2024-12-23',
    creator: '仓管C',
    createTime: '2024-12-22 14:00:00',
  },
])

const filteredList = computed(() => {
  let result = transferList.value

  if (status.value !== 'all') {
    result = result.filter(r => r.status === status.value)
  }

  pagination.total = result.length
  return result
})

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
    processing: '调拨中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

const prdModules = [
  {
    moduleName: '项目背景',
    content: '库存调拨用于仓库间的库存调配，解决仓库间库存不均衡问题，提高库存利用率和订单履约能力。',
  },
  {
    moduleName: '核心功能',
    content: '1. 调拨流程：新建调拨单 → 调出仓库出库 → 调入仓库入库\n2. 状态跟踪：待出库 → 调拨中 → 已完成\n3. 库存校验：调出仓库出库前校验可用库存\n4. 双向操作：调出仓库执行出库，调入仓库执行入库\n5. 统计看板：待出库、调拨中、本月调拨量、调拨SKU数',
  },
  {
    moduleName: '业务场景',
    content: '• 缺货补货：某仓库缺货，从其他仓库调拨\n• 订单就近履约：从最近仓库调拨发货\n• 库存均衡：高库存仓库向低库存仓库调拨\n• 项目备货：项目开工前批量备货调拨',
  },
  {
    moduleName: '业务规则',
    content: '1. 调拨单必须指定调出和调入仓库\n2. 调出仓库必须有足够可用库存\n3. 调出完成后，调入仓库待入库库存自动增加\n4. 调入完成后，正式增加调入仓库库存\n5. 支持在途库存管理和预计到达时间',
  },
]
</script>

<style scoped lang="less">
.stock-transfer {
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
