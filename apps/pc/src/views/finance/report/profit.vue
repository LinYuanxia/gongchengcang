<template>
  <div class="profit-report">
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
          <a-statistic title="净利润" :value="400600" :precision="2">
            <template #prefix>¥</template>
            <template #suffix>
              <span class="stat-trend up">
                <icon-arrow-rise /> 28.5%
              </span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="总收入" :value="1256800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="总支出" :value="856200" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="利润率" :value="31.9" suffix="%" />
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="24">
          <a-card title="收支对比趋势" :bordered="false">
            <div class="compare-chart">
              <div class="chart-legend">
                <span class="legend-item income">
                  <span class="legend-color"></span>
                  收入
                </span>
                <span class="legend-item expense">
                  <span class="legend-color"></span>
                  支出
                </span>
                <span class="legend-item profit">
                  <span class="legend-color"></span>
                  利润
                </span>
              </div>
              <div class="chart-bars-group">
                <div v-for="(item, index) in compareData" :key="index" class="chart-group-item">
                  <div class="bars-wrapper">
                    <div class="bar income-bar" :style="{ height: (item.income / maxCompareValue * 180) + 'px' }">
                      <span class="bar-tip">¥{{ formatNumber(item.income) }}</span>
                    </div>
                    <div class="bar expense-bar" :style="{ height: (item.expense / maxCompareValue * 180) + 'px' }">
                      <span class="bar-tip">¥{{ formatNumber(item.expense) }}</span>
                    </div>
                  </div>
                  <div class="profit-line" :style="{ bottom: (item.profit / maxCompareValue * 180 + 40) + 'px' }">
                    <span class="profit-value">¥{{ formatNumber(item.profit) }}</span>
                  </div>
                  <span class="group-label">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="利润来源分析" :bordered="false">
            <div class="profit-source">
              <div v-for="(item, index) in profitSource" :key="index" class="source-item">
                <div class="source-header">
                  <span class="source-name">{{ item.name }}</span>
                  <span class="source-profit">¥{{ formatNumber(item.profit) }}</span>
                </div>
                <div class="source-bar">
                  <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
                </div>
                <div class="source-footer">
                  <span class="source-percent">{{ item.percent }}%</span>
                  <span class="source-rate" :class="item.trend > 0 ? 'up' : 'down'">
                    {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
                  </span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="关键指标" :bordered="false">
            <div class="key-indicators">
              <div class="indicator-item">
                <div class="indicator-label">毛利率</div>
                <div class="indicator-value">
                  <span class="value">35.2%</span>
                  <span class="trend up">+2.1%</span>
                </div>
                <a-progress :percent="35.2" :stroke-width="8" status="success" />
              </div>
              <div class="indicator-item">
                <div class="indicator-label">净利率</div>
                <div class="indicator-value">
                  <span class="value">31.9%</span>
                  <span class="trend up">+1.8%</span>
                </div>
                <a-progress :percent="31.9" :stroke-width="8" status="success" />
              </div>
              <div class="indicator-item">
                <div class="indicator-label">资金周转率</div>
                <div class="indicator-value">
                  <span class="value">4.2次</span>
                  <span class="trend up">+0.3次</span>
                </div>
                <a-progress :percent="84" :stroke-width="8" status="normal" />
              </div>
              <div class="indicator-item">
                <div class="indicator-label">应收账款周转天数</div>
                <div class="indicator-value">
                  <span class="value">12天</span>
                  <span class="trend down">+2天</span>
                </div>
                <a-progress :percent="60" :stroke-width="8" status="warning" />
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-card title="利润明细" :bordered="false">
        <a-table :data="profitDetailList" :pagination="pagination" @page-change="handlePageChange">
          <template #columns>
            <a-table-column title="日期" data-index="date" :width="120" />
            <a-table-column title="收入" :width="150" align="right">
              <template #cell="{ record }">
                <span class="income">¥{{ record.income }}</span>
              </template>
            </a-table-column>
            <a-table-column title="支出" :width="150" align="right">
              <template #cell="{ record }">
                <span class="expense">¥{{ record.expense }}</span>
              </template>
            </a-table-column>
            <a-table-column title="利润" :width="150" align="right">
              <template #cell="{ record }">
                <span class="profit" :class="{ negative: record.profit < 0 }">
                  ¥{{ record.profit }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="利润率" :width="100" align="center">
              <template #cell="{ record }">
                <span :class="record.profitRate > 0 ? 'positive-rate' : 'negative-rate'">
                  {{ record.profitRate }}%
                </span>
              </template>
            </a-table-column>
            <a-table-column title="主要来源" data-index="mainSource" :width="150" />
            <a-table-column title="环比" :width="100">
              <template #cell="{ record }">
                <span :class="record.chainGrowth > 0 ? 'trend-up' : 'trend-down'">
                  {{ record.chainGrowth > 0 ? '+' : '' }}{{ record.chainGrowth }}%
                </span>
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

const compareData = ref([
  { label: '1月', income: 856000, expense: 756000, profit: 100000 },
  { label: '2月', income: 923000, expense: 823000, profit: 100000 },
  { label: '3月', income: 1056800, expense: 696800, profit: 360000 },
  { label: '4月', income: 978500, expense: 878500, profit: 100000 },
  { label: '5月', income: 1125600, expense: 725600, profit: 400000 },
  { label: '6月', income: 1256800, expense: 856200, profit: 400600 },
])

const maxCompareValue = computed(() => Math.max(...compareData.value.flatMap(item => [item.income, item.expense, item.profit])))

const profitSource = ref([
  { name: '工程仓分账', profit: 285400, percent: 71.2, trend: 12.5, color: '#165DFF' },
  { name: '供应商分账', profit: 75200, percent: 18.8, trend: 8.3, color: '#14C9C9' },
  { name: '服务费收入', profit: 40000, percent: 10.0, trend: 15.2, color: '#F7BA1E' },
])

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 30,
})

const profitDetailList = ref([
  { date: '2024-01-15', income: '125,800.00', expense: '85,000.00', profit: '40,800.00', profitRate: 32.4, mainSource: '工程仓分账', chainGrowth: 5.2 },
  { date: '2024-01-14', income: '89,500.00', expense: '52,300.00', profit: '37,200.00', profitRate: 41.6, mainSource: '工程仓分账', chainGrowth: 8.5 },
  { date: '2024-01-13', income: '156,000.00', expense: '98,500.00', profit: '57,500.00', profitRate: 36.9, mainSource: '供应商分账', chainGrowth: 12.3 },
  { date: '2024-01-12', income: '168,000.00', expense: '125,000.00', profit: '43,000.00', profitRate: 25.6, mainSource: '工程仓分账', chainGrowth: -2.1 },
  { date: '2024-01-11', income: '98,500.00', expense: '68,200.00', profit: '30,300.00', profitRate: 30.8, mainSource: '供应商分账', chainGrowth: 6.8 },
])

function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
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
.profit-report {
  padding: 16px;
}

.stat-row {
  padding: 16px;
  background: linear-gradient(135deg, #e8f3ff 0%, #f2f9ff 100%);
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

.compare-chart {
  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 16px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }

      &.income .legend-color {
        background: #165DFF;
      }

      &.expense .legend-color {
        background: #F53F3F;
      }

      &.profit .legend-color {
        background: #00B42A;
      }
    }
  }

  .chart-bars-group {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 260px;
    padding: 0 20px;
    position: relative;
  }

  .chart-group-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .bars-wrapper {
      display: flex;
      gap: 4px;
      align-items: flex-end;
      height: 180px;
    }

    .bar {
      width: 24px;
      border-radius: 4px 4px 0 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 4px;
      min-height: 10px;
      position: relative;

      .bar-tip {
        position: absolute;
        top: -20px;
        font-size: 10px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .bar-tip {
        opacity: 1;
      }

      &.income-bar {
        background: linear-gradient(180deg, #165DFF 0%, #6AA1FF 100%);
        .bar-tip { color: #165DFF; }
      }

      &.expense-bar {
        background: linear-gradient(180deg, #F53F3F 0%, #FF7D7D 100%);
        .bar-tip { color: #F53F3F; }
      }
    }

    .profit-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);

      .profit-value {
        font-size: 10px;
        color: #00B42A;
        font-weight: 500;
        white-space: nowrap;
      }
    }

    .group-label {
      font-size: 12px;
      color: var(--color-text-3);
      margin-top: 8px;
    }
  }
}

.profit-source {
  .source-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .source-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      .source-name {
        color: var(--color-text-2);
      }

      .source-profit {
        font-weight: 500;
      }
    }

    .source-bar {
      height: 8px;
      background: var(--color-fill-2);
      border-radius: 4px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
    }

    .source-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 12px;

      .source-percent {
        color: var(--color-text-3);
      }

      .source-rate {
        &.up {
          color: #00b42a;
        }

        &.down {
          color: #f53f3f;
        }
      }
    }
  }
}

.key-indicators {
  .indicator-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .indicator-label {
      font-size: 13px;
      color: var(--color-text-2);
      margin-bottom: 6px;
    }

    .indicator-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .value {
        font-size: 18px;
        font-weight: 600;
      }

      .trend {
        font-size: 12px;

        &.up {
          color: #00b42a;
        }

        &.down {
          color: #f53f3f;
        }
      }
    }
  }
}

.income {
  color: #165dff;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}

.profit {
  color: #00b42a;
  font-weight: 600;

  &.negative {
    color: #f53f3f;
  }
}

.positive-rate {
  color: #00b42a;
}

.negative-rate {
  color: #f53f3f;
}

.trend-up {
  color: #00b42a;
}

.trend-down {
  color: #f53f3f;
}
</style>
