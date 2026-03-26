<template>
  <div class="income-report">
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
          <a-statistic title="总收入" :value="1256800" :precision="2">
            <template #prefix>¥</template>
            <template #suffix>
              <span class="stat-trend up">
                <icon-arrow-rise /> 18.5%
              </span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="服务费收入" :value="62840" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="交易笔数" :value="156" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="平均客单价" :value="8056.41" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="收入趋势" :bordered="false">
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
          <a-card title="收入构成" :bordered="false">
            <div class="pie-chart">
              <div class="pie-legend">
                <div v-for="(item, index) in incomeStructure" :key="index" class="legend-item">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.name }}</span>
                  <span class="legend-value">¥{{ formatNumber(item.value) }}</span>
                  <span class="legend-percent">{{ item.percent }}%</span>
                </div>
              </div>
              <div class="pie-visual">
                <div class="pie-circle">
                  <div class="pie-center">
                    <div class="pie-total-label">总收入</div>
                    <div class="pie-total-value">¥125.68万</div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-card title="收入明细" :bordered="false">
        <a-table :data="incomeDetailList" :pagination="pagination" @page-change="handlePageChange">
          <template #columns>
            <a-table-column title="日期" data-index="date" :width="120" />
            <a-table-column title="收入来源" :width="150">
              <template #cell="{ record }">
                <a-tag :color="getSourceColor(record.source)">
                  {{ getSourceText(record.source) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="商户名称" data-index="merchantName" :width="180" />
            <a-table-column title="关联订单" data-index="orderNo" :width="150" />
            <a-table-column title="交易金额" :width="150" align="right">
              <template #cell="{ record }">
                <span class="amount">¥{{ record.transactionAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="平台分账" :width="120" align="right">
              <template #cell="{ record }">
                <span class="platform-income">¥{{ record.platformIncome }}</span>
              </template>
            </a-table-column>
            <a-table-column title="分账比例" :width="100" align="center">
              <template #cell="{ record }">
                {{ record.splitRate }}%
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
  { label: '1月', value: 856000 },
  { label: '2月', value: 923000 },
  { label: '3月', value: 1056800 },
  { label: '4月', value: 978500 },
  { label: '5月', value: 1125600 },
  { label: '6月', value: 1256800 },
])

const maxTrendValue = computed(() => Math.max(...trendData.value.map(item => item.value)))

const incomeStructure = ref([
  { name: '工程仓分账', value: 986500, percent: 78.5, color: '#165DFF' },
  { name: '供应商分账', value: 207460, percent: 16.5, color: '#14C9C9' },
  { name: '服务费收入', value: 62840, percent: 5, color: '#F7BA1E' },
])

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const incomeDetailList = ref([
  { date: '2024-01-15', source: 'warehouse', merchantName: '深圳湾科技园项目仓', orderNo: 'SO202401150001', transactionAmount: '125,800.00', platformIncome: '6,290.00', splitRate: 5 },
  { date: '2024-01-14', source: 'warehouse', merchantName: '广州天河工程仓', orderNo: 'SO202401140001', transactionAmount: '89,500.00', platformIncome: '4,475.00', splitRate: 5 },
  { date: '2024-01-13', source: 'supplier', merchantName: '华润建材供应商', orderNo: 'PO202401130001', transactionAmount: '156,000.00', platformIncome: '7,800.00', splitRate: 5 },
  { date: '2024-01-12', source: 'warehouse', merchantName: '深圳湾科技园项目仓', orderNo: 'SO202401120001', transactionAmount: '168,000.00', platformIncome: '8,400.00', splitRate: 5 },
  { date: '2024-01-11', source: 'supplier', merchantName: '东方建材供应商', orderNo: 'PO202401110001', transactionAmount: '98,500.00', platformIncome: '4,925.00', splitRate: 5 },
])

function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

function getSourceColor(source: string) {
  const colorMap: Record<string, string> = {
    warehouse: 'blue',
    supplier: 'green',
    service: 'orange',
  }
  return colorMap[source] || 'gray'
}

function getSourceText(source: string) {
  const textMap: Record<string, string> = {
    warehouse: '工程仓分账',
    supplier: '供应商分账',
    service: '服务费收入',
  }
  return textMap[source] || source
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
  if (incomeList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${incomeList.value.length} 条收入报表`)
}
</script>

<style scoped lang="less">
.income-report {
  padding: 16px;
}

.stat-row {
  padding: 16px;
  background: linear-gradient(135deg, #e8ffea 0%, #f2fff5 100%);
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
    background: linear-gradient(180deg, #165DFF 0%, #6AA1FF 100%);
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
    #165DFF 0deg 282.6deg,
    #14C9C9 282.6deg 342deg,
    #F7BA1E 342deg 360deg
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
      color: #165DFF;
    }
  }
}

.amount {
  font-weight: 500;
  color: #165dff;
}

.platform-income {
  font-weight: 500;
  color: #00b42a;
}
</style>
