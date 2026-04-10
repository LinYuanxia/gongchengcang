<template>
  <div class="page-container">
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="应扣总金额" :value="19500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="已扣款金额" :value="19500" :precision="2" suffix=" ">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待扣款金额" :value="0" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="应扣记录数" :value="5" suffix="笔" />
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <a-tabs v-model:active-tab="activeTab" class="record-tabs">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="fine" title="罚款" />
        <a-tab-pane key="penalty" title="违约金" />
        <a-tab-pane key="other" title="其他" />
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索应扣编号/关联订单号/供应商"
            style="width: 280px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.supplierId" placeholder="供应商" style="width: 180px" allow-clear>
            <a-option v-for="item in supplierList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="扣款状态" style="width: 140px" allow-clear>
            <a-option value="deducted">已扣款</a-option>
            <a-option value="pending">待扣款</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-table
        :data="filteredRecordList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="应扣编号" data-index="deductionNo" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.deductionNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="180" />
          <a-table-column title="应扣类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getDeductionTypeColor(record.type)">
                {{ getDeductionTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="应扣金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-xl">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="扣款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'deducted' ? 'green' : 'orange'">
                {{ record.status === 'deducted' ? '已扣款' : '待扣款' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="应扣原因" data-index="reason" :width="280" />
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const activeTab = ref('all')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  supplierId: undefined as string | undefined,
  status: undefined as string | undefined,
  dateRange: [] as string[],
})

const supplierList = ref([
  { id: '1', name: '北京建材供应商有限公司' },
  { id: '2', name: '上海建材批发有限公司' },
  { id: '3', name: '广东建材集团' },
])

const recordList = ref([
  {
    id: '1',
    deductionNo: 'YK20240120001',
    orderNo: 'PO202401200001',
    supplierName: '北京建材供应商有限公司',
    type: 'fine',
    amount: 3000,
    status: 'deducted',
    reason: '延迟送货24小时，按合同约定罚款',
    createTime: '2024-01-20 18:00:00',
  },
  {
    id: '2',
    deductionNo: 'YK20240120002',
    orderNo: 'PO202401200001',
    supplierName: '北京建材供应商有限公司',
    type: 'penalty',
    amount: 2000,
    status: 'deducted',
    reason: '部分商品质量检验不合格扣除违约金',
    createTime: '2024-01-20 18:30:00',
  },
  {
    id: '3',
    deductionNo: 'YK20240118001',
    orderNo: 'PO202401180003',
    supplierName: '广东建材集团',
    type: 'penalty',
    amount: 12000,
    status: 'deducted',
    reason: '碎石骨料含泥量超标，扣除违约金',
    createTime: '2024-01-18 20:15:00',
  },
  {
    id: '4',
    deductionNo: 'YK20240116001',
    orderNo: 'PO202401160005',
    supplierName: '广东建材集团',
    type: 'fine',
    amount: 2500,
    status: 'deducted',
    reason: '颜色色差超出验收标准',
    createTime: '2024-01-16 16:00:00',
  },
])

const filteredRecordList = computed(() => {
  let result = recordList.value

  if (activeTab.value === 'fine') {
    result = result.filter(r => r.type === 'fine')
  } else if (activeTab.value === 'penalty') {
    result = result.filter(r => r.type === 'penalty')
  } else if (activeTab.value === 'other') {
    result = result.filter(r => !['fine', 'penalty'].includes(r.type))
  }

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r => 
      r.deductionNo.toLowerCase().includes(keyword) ||
      r.orderNo.toLowerCase().includes(keyword) ||
      r.supplierName.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.supplierId) {
    result = result.filter(r => r.id === searchForm.supplierId)
  }

  if (searchForm.status) {
    result = result.filter(r => r.status === searchForm.status)
  }

  return result
})

function getDeductionTypeText(type: string) {
  const map: Record<string, string> = {
    fine: '罚款',
    penalty: '违约金',
    other: '其他',
  }
  return map[type] || type
}

function getDeductionTypeColor(type: string) {
  const map: Record<string, string> = {
    fine: 'red',
    penalty: 'orange',
    other: 'blue',
  }
  return map[type] || 'gray'
}

onMounted(() => {
  pagination.total = recordList.value.length
})

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.supplierId = undefined
  searchForm.status = undefined
  searchForm.dateRange = []
  activeTab.value = 'all'
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  Message.info('查看应扣详情：' + record.deductionNo)
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.record-tabs) {
  margin-bottom: 16px;

  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.text-xl {
  font-size: 18px;
  font-weight: 600;
}
</style>
