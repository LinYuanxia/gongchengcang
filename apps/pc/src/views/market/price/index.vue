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
          <a-table-column title="原价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="old-price">¥{{ record.oldPrice?.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="现价" :width="100" align="right">
            <template #cell="{ record }">
              <span :class="record.newPrice > record.oldPrice ? 'price-up' : 'price-down'">
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
      :width="800"
      :footer="false"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="商品编码">
          {{ currentProduct.skuCode }}
        </a-descriptions-item>
        <a-descriptions-item label="规格">
          {{ currentProduct.specValues }}
        </a-descriptions-item>
        <a-descriptions-item label="当前价格" :span="2">
          <span class="current-price">¥{{ currentProduct.newPrice?.toFixed(2) }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-table :data="currentProductHistory" :pagination="false">
        <template #columns>
          <a-table-column title="变更时间" data-index="changeTime" :width="160" />
          <a-table-column title="原价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.oldPrice?.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="现价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.newPrice?.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="调价幅度" :width="100" align="center">
            <template #cell="{ record }">
              <span :class="record.adjustPercent > 0 ? 'percent-up' : 'percent-down'">
                {{ record.adjustPercent > 0 ? '+' : '' }}{{ record.adjustPercent }}%
              </span>
            </template>
          </a-table-column>
          <a-table-column title="变更原因" data-index="reason" :width="180" />
          <a-table-column title="操作人" data-index="operatorName" :width="100" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

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
    oldPrice: 26,
    newPrice: 28,
    adjustPercent: 7.69,
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
    oldPrice: 4300,
    newPrice: 4150,
    adjustPercent: -3.49,
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
    oldPrice: 42,
    newPrice: 45,
    adjustPercent: 7.14,
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
    result = result.filter(r => r.adjustPercent > 0)
  } else if (searchForm.adjustRange === 'down') {
    result = result.filter(r => r.adjustPercent < 0)
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
  currentProductHistory.value = [
    {
      oldPrice: 24,
      newPrice: 26,
      adjustPercent: 8.33,
      reason: '首次调价',
      operatorName: '系统初始化',
      changeTime: '2024-01-01 00:00:00',
    },
    {
      oldPrice: 26,
      newPrice: 28,
      adjustPercent: 7.69,
      reason: '原材料价格上涨',
      operatorName: '张经理',
      changeTime: '2024-01-22 10:30:00',
    },
  ]
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

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--primary-6));
}
</style>
