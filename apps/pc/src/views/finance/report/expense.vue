<template>
  <div class="expense-report">
    <a-card>
      <template #extra>
        <a-space>
          <a-radio-group v-model="timeRange" type="button" @change="handleTimeRangeChange">
            <a-radio value="today">今日</a-radio>
            <a-radio value="week">本周</a-radio>
            <a-radio value="month">本月</a-radio>
            <a-radio value="year">本年</a-radio>
          </a-radio-group>
          <a-range-picker v-model="customDateRange" style="width: 260px" @change="handleCustomDateChange" />
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="总支出" :value="856200" :precision="2">
            <template #prefix>¥</template>
            <template #suffix>
              <span class="stat-trend down">
                <icon-arrow-fall /> 5.2%
              </span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="结算支出" :value="625800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="退款支出" :value="156000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="其他支出" :value="74400" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="支出趋势" :bordered="false">
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div v-for="(item, index) in trendData" :key="index" class="chart-bar-item">
                    <div class="bar" :style="{ height: (item.value / maxTrendValue * 200) + 'px' }">
                      <span class="bar-value">¥{{ formatNumber(item.value) }}</span>
                    </div>
                    <span class="bar-label">{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="支出构成" :bordered="false">
            <div class="pie-chart">
              <div class="pie-legend">
                <div v-for="(item, index) in expenseStructure" :key="index" class="legend-item">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.name }}</span>
                  <span class="legend-value">¥{{ formatNumber(item.value) }}</span>
                  <span class="legend-percent">{{ item.percent }}%</span>
                </div>
              </div>
              <div class="pie-visual">
                <div class="pie-circle">
                  <div class="pie-center">
                    <div class="pie-total-label">总支出</div>
                    <div class="pie-total-value">¥85.62万</div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-card title="支出明细" :bordered="false">
        <a-table :data="expenseDetailList" :pagination="pagination" @page-change="handlePageChange">
          <template #columns>
            <a-table-column title="日期" data-index="date" :width="120" />
            <a-table-column title="支出类型" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getTypeColor(record.type)">
                  {{ getTypeText(record.type) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="收款方" data-index="receiverName" :width="180" />
            <a-table-column title="关联单据" data-index="relatedNo" :width="150" />
            <a-table-column title="支出金额" :width="150" align="right">
              <template #cell="{ record }">
                <span class="expense-amount">¥{{ record.amount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="支出说明" data-index="description" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'success' ? 'green' : 'orange'">
                  {{ record.status === 'success' ? '已完成' : '处理中' }}
                </a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const timeRange = ref('month')
const customDateRange = ref([])

const trendData = ref([
  { label: '1月', value: 756000 },
  { label: '2月', value: 823000 },
  { label: '3月', value: 696800 },
  { label: '4月', value: 878500 },
  { label: '5月', value: 725600 },
  { label: '6月', value: 856200 },
])

const maxTrendValue = computed(() => Math.max(...trendData.value.map(item => item.value)))

const expenseStructure = ref([
  { name: '商户结算', value: 625800, percent: 73.1, color: '#F53F3F' },
  { name: '退款支出', value: 156000, percent: 18.2, color: '#FF7D00' },
  { name: '运营成本', value: 45200, percent: 5.3, color: '#722ED1' },
  { name: '其他支出', value: 29200, percent: 3.4, color: '#86909C' },
])

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const expenseDetailList = ref([
  { date: '2024-01-15', type: 'settlement', receiverName: '深圳湾科技园项目仓', relatedNo: 'JS202401150001', amount: '50,000.00', description: '工程仓结算', status: 'success' },
  { date: '2024-01-14', type: 'settlement', receiverName: '华润建材供应商', relatedNo: 'JS202401140001', amount: '85,000.00', description: '供应商结算', status: 'success' },
  { date: '2024-01-13', type: 'refund', receiverName: '广州天河工程仓', relatedNo: 'RF202401130001', amount: '35,000.00', description: '订单退款', status: 'success' },
  { date: '2024-01-12', type: 'settlement', receiverName: '广州天河工程仓', relatedNo: 'JS202401120001', amount: '42,500.00', description: '工程仓结算', status: 'processing' },
  { date: '2024-01-11', type: 'operation', receiverName: '云服务提供商', relatedNo: '-', amount: '12,800.00', description: '服务器费用', status: 'success' },
])

function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

function getTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    settlement: 'red',
    refund: 'orange',
    operation: 'purple',
    other: 'gray',
  }
  return colorMap[type] || 'gray'
}

function getTypeText(type: string) {
  const textMap: Record<string, string> = {
    settlement: '结算',
    refund: '退款',
    operation: '运营',
    other: '其他',
  }
  return textMap[type] || type
}

function handleTimeRangeChange() {
  Message.info(`切换时间范围: ${timeRange.value}`)
}

function handleCustomDateChange() {
  Message.info('自定义日期范围')
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleExport() {
  Message.info('导出功能开发中')
}
</script>

<style scoped lang="less">
.expense-report {
  padding: 16px;
}

.stat-row {
  padding: 16px;
  background: linear-gradient(135deg, #ffece8 0%, #fff5f2 100%);
  border-radius: 8px;
}

.stat-trend {
  font-size: 12px;
  margin-left: 8px;

  &.up {
    color: #00b42a;
  }

  &.down {
    color: #f53f3f;
  }
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: flex-end;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 240px;
  padding: 0 20px;
}

.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .bar {
    width: 40px;
    background: linear-gradient(180deg, #F53F3F 0%, #FF7D7D 100%);
    border-radius: 4px 4px 0 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 8px;
    min-height: 20px;
    transition: height 0.3s ease;

    .bar-value {
      font-size: 10px;
      color: #fff;
      white-space: nowrap;
    }
  }

  .bar-label {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.pie-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pie-legend {
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border-1);

    &:last-child {
      border-bottom: none;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-label {
      flex: 1;
      color: var(--color-text-2);
    }

    .legend-value {
      font-weight: 500;
      margin-right: 8px;
    }

    .legend-percent {
      color: var(--color-text-3);
      font-size: 12px;
    }
  }
}

.pie-visual {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.pie-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: conic-gradient(
    #F53F3F 0deg 263.16deg,
    #FF7D00 263.16deg 328.52deg,
    #722ED1 328.52deg 347.68deg,
    #86909C 347.68deg 360deg
  );
  display: flex;
  justify-content: center;
  align-items: center;

  .pie-center {
    width: 100px;
    height: 100px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .pie-total-label {
      font-size: 12px;
      color: var(--color-text-3);
    }

    .pie-total-value {
      font-size: 16px;
      font-weight: 600;
      color: #F53F3F;
    }
  }
}

.expense-amount {
  font-weight: 500;
  color: #f53f3f;
}
</style>
