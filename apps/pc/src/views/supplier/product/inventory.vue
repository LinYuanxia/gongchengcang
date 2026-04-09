<template>
  <div class="product-inventory">
    <a-page-header title="库存记录" />

    <a-row :gutter="16" class="mt-16">
      <a-col :span="6">
        <a-statistic title="本月正常发货" :value="stats.monthNormalShip" suffix="吨" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月补发" :value="stats.monthReplenish" suffix="吨" :value-style="{ color: '#ff7d00' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月累计发货" :value="stats.monthTotal" suffix="吨" :value-style="{ color: '#00b42a' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="关联订单数" :value="stats.orderCount" />
      </a-col>
    </a-row>

    <a-card class="mt-16">
      <a-tabs v-model:active-tab="activeTab">
        <a-tab-pane key="summary" title="商品发货汇总">
          <a-alert type="info" style="margin-bottom: 16px">
            <template #message>
              本页面仅统计各商品的发货和补发数据，不作为实际库存依据
            </template>
          </a-alert>

          <a-form layout="inline" :model="searchForm" style="margin-bottom: 16px">
            <a-form-item label="商品分类">
              <a-cascader
                v-model="searchForm.categoryId"
                :options="categoryTree"
                placeholder="全部分类"
                style="width: 180px"
                allow-clear
                :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
              />
            </a-form-item>
            <a-form-item>
              <a-input-search
                v-model="searchForm.keyword"
                placeholder="搜索商品名称/SKU编码"
                style="width: 240px"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
                <a-button @click="handleReset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>

          <a-table :data="shipSummary" :pagination="{ pageSize: 10 }">
            <template #columns>
              <a-table-column title="商品图片" :width="80">
                <template #cell="{ record }">
                  <a-image :src="record.image" :width="48" :height="48" fit="cover">
                    <template #error>
                      <div class="image-placeholder">
                        <icon-image :size="24" />
                      </div>
                    </template>
                  </a-image>
                </template>
              </a-table-column>
              <a-table-column title="SKU编码" data-index="skuCode" :width="130" />
              <a-table-column title="商品名称" data-index="skuName" :width="200" ellipsis />
              <a-table-column title="规格型号" data-index="spec" :width="120" />
              <a-table-column title="单位" data-index="unit" :width="80" align="center" />
              <a-table-column title="历史总发货" :width="120" align="right" data-index="totalShipQty" />
              <a-table-column title="本月正常发货" :width="130" align="right" data-index="monthShipQty" />
              <a-table-column title="本月补发" :width="120" align="right">
                <template #cell="{ record }">
                  <span v-if="record.monthReplenishQty > 0" class="qty-warning">
                    {{ record.monthReplenishQty }}
                  </span>
                  <span v-else>0</span>
                </template>
              </a-table-column>
              <a-table-column title="本月累计" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="qty-normal">{{ record.monthShipQty + record.monthReplenishQty }}</span>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="120" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-link @click="handleViewRecord(record)">查看明细</a-link>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="record" title="发货明细记录">
          <a-form layout="inline" :model="recordSearchForm" style="margin-bottom: 16px">
            <a-form-item label="类型">
              <a-select v-model="recordSearchForm.changeType" allow-clear placeholder="全部" style="width: 140px">
                <a-option value="normal_ship">正常发货</a-option>
                <a-option value="replenish_ship">补发</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="商品名称">
              <a-input v-model="recordSearchForm.keyword" placeholder="SKU名称/编码" style="width: 200px" />
            </a-form-item>
            <a-form-item label="变动时间">
              <a-range-picker v-model="recordSearchForm.dateRange" style="width: 260px" />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleRecordSearch">搜索</a-button>
                <a-button @click="handleRecordReset">重置</a-button>
                <a-button @click="handleExport">
                  <template #icon><icon-download /></template>
                  导出流水
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>

          <a-table :data="inventoryRecords" :pagination="{ pageSize: 15 }">
            <template #columns>
              <a-table-column title="变动时间" data-index="changeTime" :width="160" />
              <a-table-column title="流水号" data-index="recordNo" :width="160" />
              <a-table-column title="商品SKU" :width="200">
                <template #cell="{ record }">
                  <div>
                    <div>{{ record.skuName }}</div>
                    <div style="font-size: 12px; color: #86909c">{{ record.skuCode }} {{ record.spec }}</div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="变动类型" :width="120">
                <template #cell="{ record }">
                  <a-tag :color="getChangeTypeColor(record.changeType)">
                    {{ getChangeTypeText(record.changeType) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="发货数量" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="qty-normal">{{ record.changeQty }}</span>
                </template>
              </a-table-column>
              <a-table-column title="累计发货" :width="120" align="right" data-index="totalQty" />
              <a-table-column title="关联单据" :width="160">
                <template #cell="{ record }">
                  <a-link v-if="record.orderNo" @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="业务类型" data-index="bizType" :width="120" />
              <a-table-column title="操作人" data-index="operator" :width="100" />
              <a-table-column title="备注" data-index="remark" :width="180" ellipsis />
            </template>
          </a-table>
        </a-tab-pane>
          </a-tabs>
        </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('summary')

const stats = ref({
  monthNormalShip: 1500,
  monthReplenish: 20,
  monthTotal: 1520,
  orderCount: 35,
})

const searchForm = ref({
  categoryId: [],
  keyword: '',
})

const recordSearchForm = ref({
  changeType: '',
  keyword: '',
  dateRange: [],
})

const categoryTree = ref([
  { categoryId: '1', categoryName: '水泥', children: [] },
  { categoryId: '2', categoryName: '钢材', children: [] },
  { categoryId: '3', categoryName: '砂石', children: [] },
  { categoryId: '4', categoryName: '管材', children: [] },
])

const shipSummary = ref([
  {
    id: '1',
    skuCode: 'SN-001',
    skuName: '普通硅酸盐水泥',
    spec: 'P.O 42.5',
    unit: '吨',
    image: '',
    totalShipQty: 5200,
    monthShipQty: 500,
    monthReplenishQty: 20,
  },
  {
    id: '2',
    skuCode: 'GC-001',
    skuName: '螺纹钢筋',
    spec: 'HRB400 Φ16mm',
    unit: '吨',
    image: '',
    totalShipQty: 1680,
    monthShipQty: 120,
    monthReplenishQty: 0,
  },
  {
    id: '3',
    skuCode: 'HS-001',
    skuName: '河沙',
    spec: '中粗沙',
    unit: '方',
    image: '',
    totalShipQty: 3805,
    monthShipQty: 300,
    monthReplenishQty: 5,
  },
  {
    id: '4',
    skuCode: 'GC-002',
    skuName: '螺纹钢筋',
    spec: 'HRB400 Φ20mm',
    unit: '吨',
    image: '',
    totalShipQty: 935,
    monthShipQty: 85,
    monthReplenishQty: 0,
  },
])

const inventoryRecords = ref([
  {
    id: '1',
    recordNo: 'REC202401150001',
    skuCode: 'SN-001',
    skuName: '普通硅酸盐水泥',
    spec: 'P.O 42.5',
    changeType: 'normal_ship',
    changeQty: 50,
    totalQty: 5200,
    orderNo: 'PO202401150001',
    bizType: '订单发货',
    operator: '张三',
    changeTime: '2024-01-15 14:30:00',
    remark: '',
  },
  {
    id: '2',
    recordNo: 'REC202401150002',
    skuCode: 'SN-001',
    skuName: '普通硅酸盐水泥',
    spec: 'P.O 42.5',
    changeType: 'replenish_ship',
    changeQty: 5,
    totalQty: 5150,
    orderNo: 'PO202401100002',
    bizType: '补发',
    operator: '张三',
    changeTime: '2024-01-15 10:15:00',
    remark: '运输破损补发',
  },
  {
    id: '3',
    recordNo: 'REC202401140001',
    skuCode: 'GC-001',
    skuName: '螺纹钢筋',
    spec: 'HRB400 Φ16mm',
    changeType: 'normal_ship',
    changeQty: 30,
    totalQty: 1680,
    orderNo: 'PO202401140002',
    bizType: '订单发货',
    operator: '李四',
    changeTime: '2024-01-14 09:30:00',
    remark: '',
  },
  {
    id: '4',
    recordNo: 'REC202401140002',
    skuCode: 'HS-001',
    skuName: '河沙',
    spec: '中粗沙',
    changeType: 'replenish_ship',
    changeQty: 5,
    totalQty: 3805,
    orderNo: 'PO202401130005',
    bizType: '补发',
    operator: '李四',
    changeTime: '2024-01-14 14:20:00',
    remark: '数量损耗补发',
  },
  {
    id: '5',
    recordNo: 'REC202401130001',
    skuCode: 'GC-002',
    skuName: '螺纹钢筋',
    spec: 'HRB400 Φ20mm',
    changeType: 'normal_ship',
    changeQty: 20,
    totalQty: 935,
    orderNo: 'PO202401130003',
    bizType: '订单发货',
    operator: '王五',
    changeTime: '2024-01-13 11:30:00',
    remark: '',
  },
])

function handleSearch() {
  Message.success('搜索条件已应用')
}

function handleReset() {
  searchForm.value = {
    categoryId: [],
    keyword: '',
  }
}

function handleRecordSearch() {
  Message.success('搜索条件已应用')
}

function handleRecordReset() {
  recordSearchForm.value = {
    changeType: '',
    keyword: '',
    dateRange: [],
  }
}

function handleExport() {
  Message.success('发货记录已开始导出')
}

function getChangeTypeText(type: string) {
  const map: Record<string, string> = {
    normal_ship: '正常发货',
    replenish_ship: '补发',
  }
  return map[type] || type
}

function getChangeTypeColor(type: string) {
  const map: Record<string, string> = {
    normal_ship: 'blue',
    replenish_ship: 'orange',
  }
  return map[type] || 'gray'
}

function handleViewRecord(record: any) {
  activeTab.value = 'record'
  recordSearchForm.value.keyword = record.skuName
  Message.info('已切换到发货明细页面')
}

function handleViewOrder(record: any) {
  Message.info('跳转到订单详情：' + record.orderNo)
}
</script>

<style scoped>
.product-inventory {
  padding: 16px;
}
.mt-16 {
  margin-top: 16px;
}
.qty-warning {
  color: #f53f3f;
  font-weight: 600;
}
.qty-normal {
  color: #00b42a;
  font-weight: 600;
}
.image-placeholder {
  width: 48px;
  height: 48px;
  background: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
}
</style>
