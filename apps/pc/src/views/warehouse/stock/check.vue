<template>
  <div class="stock-check">
    
    <div class="page-header">
      <h2 class="page-title">📝 库存盘点</h2>
      <p class="page-desc">定期盘点保证账实相符，掌握真实库存情况</p>
    </div>

    <a-card>
      <template #extra>
        <a-space>
          <a-radio-group v-model="status" type="button" size="small">
            <a-radio value="all">全部</a-radio>
            <a-radio value="draft">待盘点</a-radio>
            <a-radio value="processing">盘点中</a-radio>
            <a-radio value="completed">已完成</a-radio>
          </a-radio-group>
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建盘点单
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="本月盘点" :value="6" suffix="次" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="待盘点" :value="1" suffix="次" :value-style="{ color: 'var(--color-warning-6)' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="盘点准确率" :value="98.6" suffix="%" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="差异金额" :value="2580" :precision="0" prefix="¥" />
          </a-card>
        </a-col>
      </a-row>

      <a-table :data="filteredList" :pagination="pagination" row-key="checkNo" class="mt-16">
        <template #columns>
          <a-table-column title="盘点单号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.checkNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="盘点类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.checkType === 'full' ? 'blue' : 'green'">
                {{ record.checkType === 'full' ? '全盘' : '抽盘' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="盘点仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="盘点范围" :width="200">
            <template #cell="{ record }">
              {{ record.checkRange }}
            </template>
          </a-table-column>
          <a-table-column title="SKU总数" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.totalSku }}
            </template>
          </a-table-column>
          <a-table-column title="有差异" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag v-if="record.diffCount > 0" color="red" size="small">
                {{ record.diffCount }}
              </a-tag>
              <span v-else class="text-success">-</span>
            </template>
          </a-table-column>
          <a-table-column title="盈亏金额" :width="130" align="right">
            <template #cell="{ record }">
              <span v-if="record.diffAmount > 0" class="text-danger">+¥{{ record.diffAmount }}</span>
              <span v-else-if="record.diffAmount < 0" class="text-success">-¥{{ Math.abs(record.diffAmount) }}</span>
              <span v-else>¥0</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="盘点人" data-index="checker" :width="100" />
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link>详情</a-link>
                <a-link v-if="record.status === 'draft'">开始盘点</a-link>
                <a-link v-if="record.status === 'processing'">提交</a-link>
                <a-dropdown v-if="record.status === 'completed'">
                  <a-link>更多</a-link>
                  <template #content>
                    <a-doption>查看差异</a-doption>
                    <a-doption>调整库存</a-doption>
                    <a-doption>打印</a-doption>
                  </template>
                </a-dropdown>
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

const checkList = ref([
  {
    checkNo: 'CK202412250001',
    checkType: 'partial',
    warehouseName: '深圳湾科技园仓',
    checkRange: '水泥类商品',
    totalSku: 5,
    diffCount: 1,
    diffAmount: 1480,
    status: 'processing',
    checker: '仓管A',
    createTime: '2024-12-25 09:00:00',
  },
  {
    checkNo: 'CK202412200002',
    checkType: 'full',
    warehouseName: '福田CBD项目仓',
    checkRange: '全部商品',
    totalSku: 96,
    diffCount: 2,
    diffAmount: -1100,
    status: 'completed',
    checker: '仓管B',
    createTime: '2024-12-20 14:30:00',
  },
  {
    checkNo: 'CK202412150003',
    checkType: 'full',
    warehouseName: '宝安新安项目仓',
    checkRange: '全部商品',
    totalSku: 75,
    diffCount: 0,
    diffAmount: 0,
    status: 'completed',
    checker: '仓管C',
    createTime: '2024-12-15 10:00:00',
  },
  {
    checkNo: 'CK202412100004',
    checkType: 'partial',
    warehouseName: '深圳湾科技园仓',
    checkRange: '钢材类商品',
    totalSku: 8,
    diffCount: 1,
    diffAmount: 2200,
    status: 'completed',
    checker: '仓管A',
    createTime: '2024-12-10 15:15:00',
  },
  {
    checkNo: 'CK202412050005',
    checkType: 'partial',
    warehouseName: '深圳湾科技园仓',
    checkRange: '砂石类商品',
    totalSku: 3,
    diffCount: 0,
    diffAmount: 0,
    status: 'completed',
    checker: '仓管A',
    createTime: '2024-12-05 09:30:00',
  },
  {
    checkNo: 'CK202412260006',
    checkType: 'full',
    warehouseName: '宝安新安项目仓',
    checkRange: '全部商品',
    totalSku: 0,
    diffCount: 0,
    diffAmount: 0,
    status: 'draft',
    checker: '',
    createTime: '2024-12-26 08:00:00',
  },
])

const filteredList = computed(() => {
  let result = checkList.value

  if (status.value !== 'all') {
    result = result.filter(r => r.status === status.value)
  }

  pagination.total = result.length
  return result
})

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    draft: 'grey',
    processing: 'blue',
    completed: 'green',
    cancelled: 'grey',
  }
  return map[status] || 'grey'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    draft: '待盘点',
    processing: '盘点中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

const prdModules = [
  {
    moduleName: '项目背景',
    content: '库存盘点是仓储管理的重要环节，通过定期或不定期盘点，发现并修正库存差异，保证库存数据的准确性，为采购、销售提供可靠依据。',
  },
  {
    moduleName: '核心功能',
    content: '1. 盘点类型：全盘（所有商品）、抽盘（指定品类）\n2. 盘点流程：新建盘点单 → 录入实盘数 → 系统对账 → 确认差异\n3. 差异处理：盘盈盘亏自动计算、库存调整、财务过账\n4. 统计分析：盘点准确率、差异金额、SKU差异数\n5. 盘点范围：支持按仓库、按品类、按库位筛选',
  },
  {
    moduleName: '业务场景',
    content: '• 月末/季末大盘点：财务结账前全仓库盘点\n• 循环盘点：重要商品每周抽盘\n• 异动盘点：库存异常时即时盘点\n• 差异调整：盘点确认后调整系统库存',
  },
  {
    moduleName: '业务规则',
    content: '1. 盘点过程中建议冻结对应库存的出入库\n2. 实盘数与系统数的差异即为盈亏\n3. 差异需经审核后方可调整库存\n4. 盘盈盘亏需同步到财务系统记账\n5. 盘点完成生成盘点报告归档',
  },
]
</script>

<style scoped lang="less">
.stock-check {
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
