<template>
  <div class="page-container">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="价格调整次数" :value="42" suffix="次" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="平台标准价" :value="15">
            <template #suffix>个商品</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="供应商商品" :value="18">
            <template #suffix>个商品</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="工程仓商品" :value="9">
            <template #suffix>个商品</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <template #title>价格变更记录</template>

      <a-tabs v-model:active-tab="activeTab" class="price-tabs">
        <a-tab-pane key="all" title="全部变更" />
        <a-tab-pane key="platform" title="平台标准价调整" />
        <a-tab-pane key="supplier" title="供应商商品调价" />
        <a-tab-pane key="warehouse" title="工程仓售价调整" />
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/SKU"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.adjustRange" placeholder="调价幅度" style="width: 140px" allow-clear>
            <a-option value="up">涨价</a-option>
            <a-option value="down">降价</a-option>
          </a-select>
          <a-range-picker
            v-model="searchForm.dateRange"
            style="width: 260px"
            placeholder="变更时间"
          />
        </a-space>
      </div>

      <a-table
        :data="filteredRecords"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="变更来源" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getSourceColor(record.source)">
                {{ getSourceText(record.source) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="商品信息" :width="280">
            <template #cell="{ record }">
              <div class="product-info">
                <div class="product-name">{{ record.productName }}</div>
                <div class="product-spec">
                  <span class="sku-code">{{ record.skuCode }}</span>
                  <a-tag color="gray" size="small" style="margin-left: 8px">
                    {{ record.specValues }}
                  </a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="所属主体" :width="150">
            <template #cell="{ record }">
              {{ record.ownerName }}
            </template>
          </a-table-column>
          <a-table-column title="原价" :width="140" align="right">
            <template #cell="{ record }">
              <template v-if="record.source === 'platform'">
                <div class="dual-price">
                  <div class="price-row">供货价：¥{{ record.supplyOldPrice?.toFixed(2) }}</div>
                  <div class="price-row">销售价：¥{{ record.saleOldPrice?.toFixed(2) }}</div>
                </div>
              </template>
              <template v-else>
                <span class="old-price">¥{{ record.oldPrice?.toFixed(2) }}</span>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="现价" :width="140" align="right">
            <template #cell="{ record }">
              <template v-if="record.source === 'platform'">
                <div class="dual-price">
                  <div class="price-row" :class="record.supplyAdjustPercent > 0 ? 'price-up' : 'price-down'">
                    供货价：¥{{ record.supplyNewPrice?.toFixed(2) }}
                  </div>
                  <div class="price-row" :class="record.saleAdjustPercent > 0 ? 'price-up' : 'price-down'">
                    销售价：¥{{ record.saleNewPrice?.toFixed(2) }}
                  </div>
                </div>
              </template>
              <template v-else>
                <span :class="record.adjustPercent > 0 ? 'price-up' : 'price-down'">
                  ¥{{ record.newPrice?.toFixed(2) }}
                </span>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="调价幅度" :width="140" align="center">
            <template #cell="{ record }">
              <template v-if="record.source === 'platform'">
                <div class="dual-adjust">
                  <div class="adjust-row" :class="record.supplyAdjustPercent > 0 ? 'percent-up' : 'percent-down'">
                    {{ record.supplyAdjustPercent > 0 ? '+' : '' }}{{ record.supplyAdjustPercent }}%
                  </div>
                  <div class="adjust-row" :class="record.saleAdjustPercent > 0 ? 'percent-up' : 'percent-down'">
                    {{ record.saleAdjustPercent > 0 ? '+' : '' }}{{ record.saleAdjustPercent }}%
                  </div>
                </div>
              </template>
              <template v-else>
                <span :class="record.adjustPercent > 0 ? 'percent-up' : 'percent-down'">
                  {{ record.adjustPercent > 0 ? '+' : '' }}{{ record.adjustPercent }}%
                </span>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="变更原因" :width="180">
            <template #cell="{ record }">
              <a-tooltip :content="record.reason">
                <span class="reason-text">{{ record.reason }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="操作人" :width="100">
            <template #cell="{ record }">
              {{ record.operatorName }}
            </template>
          </a-table-column>
          <a-table-column title="变更时间" :width="160">
            <template #cell="{ record }">
              {{ record.changeTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewHistory(record)">
                历史
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="historyVisible"
      :title="`「${currentProduct.productName}」价格历史`"
      :width="900"
      :footer="false"
    >
      <!-- 商品信息区 -->
      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 20px">
        <a-descriptions-item label="SKU编码">
          {{ currentProduct.skuCode }}
        </a-descriptions-item>
        <a-descriptions-item label="规格">
          {{ currentProduct.specValues }}
        </a-descriptions-item>
        <a-descriptions-item label="所属主体">
          {{ currentProduct.ownerName }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 当前价格展示 -->
      <div class="current-prices" style="margin-bottom: 20px">
        <div class="current-prices-title">当前价格</div>
        <a-space size="large">
          <template v-if="currentProduct.source === 'platform'">
            <div class="price-item">
              <span class="price-label blue">● 供货价</span>
              <span class="price-value">¥{{ currentProduct.supplyNewPrice?.toFixed(2) }}</span>
            </div>
            <div class="price-item">
              <span class="price-label green">● 销售价</span>
              <span class="price-value">¥{{ currentProduct.saleNewPrice?.toFixed(2) }}</span>
            </div>
          </template>
          <template v-else>
            <div class="price-item">
              <span class="price-label">
                {{ currentProduct.source === 'supplier' ? '● 供货价' : '● 销售价' }}
              </span>
              <span class="price-value">¥{{ currentProduct.newPrice?.toFixed(2) }}</span>
            </div>
          </template>
        </a-space>
      </div>

      <!-- 价格变更记录列表 -->
      <div class="history-table">
        <div class="table-title">价格变更记录</div>
        <a-table 
          :data="currentProductHistory" 
          :pagination="false"
          :scroll="{ y: 300 }"
          size="small"
        >
          <template #columns>
            <a-table-column title="变更时间" data-index="changeTime" :width="160" />
            <a-table-column title="操作人" data-index="operatorName" :width="100" />
            
            <!-- 平台标准价：与列表保持一致，两行展示供货价和销售价 -->
            <template v-if="currentProduct.source === 'platform'">
              <a-table-column title="原价" :width="140" align="right">
                <template #cell="{ record }">
                  <div class="dual-price">
                    <div class="price-row">供货价：¥{{ record.supplyOldPrice?.toFixed(2) }}</div>
                    <div class="price-row">销售价：¥{{ record.saleOldPrice?.toFixed(2) }}</div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="现价" :width="140" align="right">
                <template #cell="{ record }">
                  <div class="dual-price">
                    <div class="price-row" :class="record.supplyAdjustPercent > 0 ? 'price-up' : 'price-down'">
                      供货价：¥{{ record.supplyNewPrice?.toFixed(2) }}
                    </div>
                    <div class="price-row" :class="record.saleAdjustPercent > 0 ? 'price-up' : 'price-down'">
                      销售价：¥{{ record.saleNewPrice?.toFixed(2) }}
                    </div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="调价幅度" :width="140" align="center">
                <template #cell="{ record }">
                  <div class="dual-adjust">
                    <div class="adjust-row" :class="record.supplyAdjustPercent > 0 ? 'percent-up' : 'percent-down'">
                      {{ record.supplyAdjustPercent > 0 ? '+' : '' }}{{ record.supplyAdjustPercent }}%
                    </div>
                    <div class="adjust-row" :class="record.saleAdjustPercent > 0 ? 'percent-up' : 'percent-down'">
                      {{ record.saleAdjustPercent > 0 ? '+' : '' }}{{ record.saleAdjustPercent }}%
                    </div>
                  </div>
                </template>
              </a-table-column>
            </template>
            
            <!-- 供应商/工程仓：单行展示 -->
            <template v-else>
              <a-table-column title="原价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="old-price">¥{{ record.oldPrice?.toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="现价" :width="100" align="right">
                <template #cell="{ record }">
                  <span :class="record.adjustPercent > 0 ? 'price-up' : 'price-down'">
                    ¥{{ record.newPrice?.toFixed(2) }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="调价幅度" :width="100" align="center">
                <template #cell="{ record }">
                  <span :class="record.adjustPercent > 0 ? 'percent-up' : 'percent-down'">
                    {{ record.adjustPercent > 0 ? '+' : '' }}{{ record.adjustPercent }}%
                  </span>
                </template>
              </a-table-column>
            </template>
            
            <a-table-column title="变更原因" data-index="reason" :width="180">
              <template #cell="{ record }">
                <a-tooltip :content="record.reason">
                  <span class="reason-text">{{ record.reason }}</span>
                </a-tooltip>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const prdItems = [
  {
    title: '1. 数据看板模块',
    content: `
| 看板指标 | 数据来源 | 更新频率 |
|---------|---------|---------|
| 价格调整次数 | 调价记录表 | 实时 |
| 平台标准价商品数 | SPU表 - 平台商品 | 每日统计 |
| 供应商商品数 | SPU表 - 供应商商品 | 每日统计 |
| 工程仓商品数 | 工程仓商品配置表 | 每日统计 |

说明：4 个看板卡片采用 25% 等分布局，白色背景。
    `
  },
  {
    title: '2. Tab 分类模块',
    content: `
| Tab 标签 | 数据范围 |
|---------|---------|
| 全部变更 | 所有价格变更记录 |
| 平台标准价调整 | source = platform |
| 供应商商品调价 | source = supplier |
| 工程仓售价调整 | source = warehouse |

说明：Tab 切换自动触发对应分类数据刷新。
    `
  },
  {
    title: '3. 搜索与筛选',
    content: `
| 筛选条件 | 组件类型 | 宽度 | 特殊处理 |
|---------|---------|------|---------|
| 关键词搜索 | InputSearch | 240px | 匹配商品名称/SKU编码 |
| 调价幅度 | Select下拉 | 140px | 涨价/降价 2 选 |
| 变更时间 | RangePicker | 260px | 日期范围精确到天 |
    `
  },
  {
    title: '4. 表格字段说明',
    content: `
| 列名 | 宽度 | 格式化规则 |
|------|------|---------|
| 商品名称 | 240px | 悬停显示完整名称 |
| SKU编码 | 140px | 等宽字体 |
| 调价类型 | 120px | Tag色彩：平台-blue、供应商-cyan、仓库-green |
| 原价格 | 100px | right 右对齐、¥前缀 |
| 新价格 | 100px | right 右对齐、¥前缀 |
| 调价幅度 | 120px | right、涨价红/降价绿、带%号、带箭头 ↑↓ |
| 操作人 | 120px | - |
| 调价时间 | 180px | - |
    `
  },
  {
    title: '5. 价格体系权限矩阵',
    content: `
| 功能点 | 平台定价员 | 供应商 | 仓库经理 | 只读 |
|--------|---------|--------|--------|------|
| 设置平台标准价 | ✅ | ❌ | ❌ | ❌ |
| 供应商商品调价 | ❌ | ✅ | ❌ | ❌ |
| 工程仓售价调整 | ❌ | ❌ | ✅ | ❌ |
| 查看价格变更历史 | ✅ | ✅ | ✅ | ✅ |
| 导出价格报表 | ✅ | ✅ | ✅ | ❌ |
    `
  }
]

const loading = ref(false)
const activeTab = ref('all')
const pagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  adjustRange: undefined as string | undefined,
  dateRange: [] as string[],
})

const priceRecords = ref([
  {
    id: '1',
    source: 'platform',
    productName: '普通硅酸盐水泥P.O42.5',
    skuCode: 'SKU001',
    specValues: '50kg/袋',
    ownerName: '平台运营',
    // 平台标准价同时变更供货价和销售价
    supplyOldPrice: 26.5,
    supplyNewPrice: 28.0,
    supplyAdjustPercent: 5.66,
    saleOldPrice: 27.5,
    saleNewPrice: 29.5,
    saleAdjustPercent: 7.27,
    reason: '原材料价格上涨，同步调整平台指导价',
    operatorName: '张经理',
    changeTime: '2024-01-22 10:30:00',
  },
  {
    id: '2',
    source: 'platform',
    productName: '螺纹钢HRB400 Φ16mm',
    skuCode: 'SKU002_2',
    specValues: 'Φ16mm',
    ownerName: '平台运营',
    supplyOldPrice: 4250,
    supplyNewPrice: 4100,
    supplyAdjustPercent: -3.53,
    saleOldPrice: 4350,
    saleNewPrice: 4200,
    saleAdjustPercent: -3.45,
    reason: '钢材市场价格回落',
    operatorName: '李主管',
    changeTime: '2024-01-21 14:20:00',
  },
  {
    id: '3',
    source: 'supplier',
    productName: '内墙乳胶漆 20L',
    skuCode: 'SKU004',
    specValues: '20L/桶',
    ownerName: '北京建材供应商有限公司',
    oldPrice: 360,
    newPrice: 380,
    adjustPercent: 5.56,
    reason: '配方升级，成本增加',
    operatorName: '供应商王总',
    changeTime: '2024-01-20 09:15:00',
  },
  {
    id: '4',
    source: 'supplier',
    productName: '抛光砖 800×800mm',
    skuCode: 'SKU003',
    specValues: '800×800mm',
    ownerName: '广东建材集团',
    oldPrice: 48,
    newPrice: 45,
    adjustPercent: -6.25,
    reason: '促销活动降价',
    operatorName: '陈总监',
    changeTime: '2024-01-19 16:45:00',
  },
  {
    id: '5',
    source: 'warehouse',
    productName: '石膏板 1200×2400×9.5mm',
    skuCode: 'SKU006',
    specValues: '1200×2400×9.5mm',
    ownerName: '深圳宝安工程仓',
    oldPrice: 32,
    newPrice: 35,
    adjustPercent: 9.38,
    reason: '区域运费上调',
    operatorName: '仓管刘主管',
    changeTime: '2024-01-18 11:30:00',
  },
  {
    id: '6',
    source: 'warehouse',
    productName: '防水涂料 18kg',
    skuCode: 'SKU005',
    specValues: '18kg/桶',
    ownerName: '广州天河工程仓',
    oldPrice: 270,
    newPrice: 260,
    adjustPercent: -3.70,
    reason: '批量进货让利客户',
    operatorName: '李站长',
    changeTime: '2024-01-17 15:00:00',
  },
  {
    id: '7',
    source: 'platform',
    productName: 'PVC排水管 Φ110mm',
    skuCode: 'SKU007',
    specValues: 'Φ110mm',
    ownerName: '平台运营',
    supplyOldPrice: 42,
    supplyNewPrice: 45,
    supplyAdjustPercent: 7.14,
    saleOldPrice: 46,
    saleNewPrice: 49,
    saleAdjustPercent: 6.52,
    reason: 'Q1季度价格调整',
    operatorName: '张经理',
    changeTime: '2024-01-16 10:00:00',
  },
  {
    id: '8',
    source: 'supplier',
    productName: '电线BV 2.5平方',
    skuCode: 'SKU008',
    specValues: '2.5平方',
    ownerName: '上海建材批发有限公司',
    oldPrice: 175,
    newPrice: 180,
    adjustPercent: 2.86,
    reason: '铜价上涨传导',
    operatorName: '供应商赵总',
    changeTime: '2024-01-15 14:30:00',
  },
])

const filteredRecords = computed(() => {
  let result = priceRecords.value

  if (activeTab.value === 'platform') {
    result = result.filter(r => r.source === 'platform')
  } else if (activeTab.value === 'supplier') {
    result = result.filter(r => r.source === 'supplier')
  } else if (activeTab.value === 'warehouse') {
    result = result.filter(r => r.source === 'warehouse')
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r => 
      r.productName.toLowerCase().includes(keyword) ||
      r.skuCode.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.adjustRange === 'up') {
    result = result.filter(r => {
      if (r.source === 'platform') {
        return r.supplyAdjustPercent > 0 || r.saleAdjustPercent > 0
      }
      return r.adjustPercent > 0
    })
  } else if (searchForm.adjustRange === 'down') {
    result = result.filter(r => {
      if (r.source === 'platform') {
        return r.supplyAdjustPercent < 0 || r.saleAdjustPercent < 0
      }
      return r.adjustPercent < 0
    })
  }

  return result
})

function getSourceText(source: string) {
  const map: Record<string, string> = {
    platform: '平台标准价',
    supplier: '供应商',
    warehouse: '工程仓',
  }
  return map[source] || source
}

function getSourceColor(source: string) {
  const map: Record<string, string> = {
    platform: 'arcoblue',
    supplier: 'green',
    warehouse: 'orange',
  }
  return map[source] || 'gray'
}

onMounted(() => {
  pagination.total = priceRecords.value.length
})

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

const historyVisible = ref(false)
const currentProduct = ref<any>({})
const currentProductHistory = ref<any[]>([])

function handleViewHistory(record: any) {
  currentProduct.value = record
  
  if (record.source === 'platform') {
    // 平台标准价：同时记录供货价和销售价变更
    currentProductHistory.value = [
      {
        changeTime: '2024-01-08 14:30:00',
        operatorName: '王专员',
        reason: '成本微调',
        supplyOldPrice: 25.5,
        supplyNewPrice: 26.5,
        supplyAdjustPercent: 3.92,
        saleOldPrice: 26.5,
        saleNewPrice: 27.5,
        saleAdjustPercent: 3.77,
        adjustPercent: 3.85,
      },
      {
        changeTime: '2024-01-15 09:00:00',
        operatorName: '李主管',
        reason: '销售策略调整',
        supplyOldPrice: 26.5,
        supplyNewPrice: 26.5,
        supplyAdjustPercent: 0,
        saleOldPrice: 27.5,
        saleNewPrice: 27.5,
        saleAdjustPercent: 0,
        adjustPercent: 0,
      },
      {
        changeTime: '2024-01-22 10:30:00',
        operatorName: '张经理',
        reason: '原材料价格上涨，同步调整各级价格',
        supplyOldPrice: 26.5,
        supplyNewPrice: 28.0,
        supplyAdjustPercent: 5.66,
        saleOldPrice: 27.5,
        saleNewPrice: 29.5,
        saleAdjustPercent: 7.27,
        adjustPercent: 6.47,
      },
    ]
  } else if (record.source === 'supplier') {
    // 供应商：只记录供货价变更
    currentProductHistory.value = [
      {
        changeTime: '2024-01-10 11:00:00',
        operatorName: '供应商李总',
        oldPrice: 340,
        newPrice: 360,
        adjustPercent: 5.88,
        reason: '原材料成本上升',
      },
      {
        changeTime: '2024-01-20 09:15:00',
        operatorName: '供应商王总',
        oldPrice: 360,
        newPrice: 380,
        adjustPercent: 5.56,
        reason: '配方升级，成本增加',
      },
    ]
  } else {
    // 工程仓：只记录销售价变更
    currentProductHistory.value = [
      {
        changeTime: '2024-01-08 10:00:00',
        operatorName: '仓管张主管',
        oldPrice: 38,
        newPrice: 35,
        adjustPercent: -7.89,
        reason: '促销活动',
      },
      {
        changeTime: '2024-01-18 11:30:00',
        operatorName: '仓管刘主管',
        oldPrice: 32,
        newPrice: 35,
        adjustPercent: 9.38,
        reason: '区域运费上调',
      },
    ]
  }
  historyVisible.value = true
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.price-tabs) {
  margin-bottom: 16px;

  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.table-actions {
  margin-bottom: 16px;
}

.product-info {
  .product-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .product-spec {
    display: flex;
    align-items: center;

    .sku-code {
      font-size: 12px;
      color: rgb(var(--gray-6));
    }
  }
}

.old-price {
  color: rgb(var(--gray-6));
  text-decoration: line-through;
}

.price-up {
  color: rgb(var(--danger-6));
  font-weight: 600;
}

.price-down {
  color: rgb(var(--success-6));
  font-weight: 600;
}

.percent-up {
  color: rgb(var(--danger-6));
  font-weight: 600;
}

.percent-down {
  color: rgb(var(--success-6));
  font-weight: 600;
}

.reason-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
  display: block;
}

// 双价格展示样式
.dual-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .price-row {
    font-size: 13px;
    line-height: 1.4;
  }
}

.dual-adjust {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .adjust-row {
    font-size: 12px;
    line-height: 1.4;
  }
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--primary-6));
}

// 历史弹窗样式
.current-prices {
  .current-prices-title {
    font-weight: 500;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .price-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .price-label {
    font-size: 12px;
    &.blue {
      color: rgb(var(--primary-6));
    }
    &.green {
      color: rgb(var(--success-6));
    }
    &.orange {
      color: rgb(var(--warning-6));
    }
  }

  .price-value {
    font-size: 16px;
    font-weight: 600;
    color: rgb(var(--gray-8));
  }
}

.history-table {
  .table-title {
    font-weight: 500;
    margin-bottom: 12px;
    font-size: 14px;
  }
  
  .reason-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
    display: block;
  }
}
</style>
