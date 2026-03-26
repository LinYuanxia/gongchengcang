<template>
  <div class="frozen-list">
    <a-card :bordered="false">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6">
          <a-statistic title="冻结总金额" :value="210000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="冻结笔数" :value="3" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日解冻" :value="50000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月解冻" :value="185000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" style="margin-bottom: 16px">
        <a-form-item label="订单编号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单编号" allow-clear />
        </a-form-item>
        <a-form-item label="冻结状态">
          <a-select v-model="searchForm.status" placeholder="请选择" style="width: 120px" allow-clear>
            <a-option value="frozen">冻结中</a-option>
            <a-option value="unfrozen">已解冻</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="冻结时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            查询
          </a-button>
        </a-form-item>
      </a-form>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="160">
            <template #cell="{ record }">
              <a-link @click="viewOrder(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.orderType === 'purchase' ? 'blue' : 'green'">
                {{ record.orderType === 'purchase' ? '采购' : '销售' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="冻结金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="frozen-amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="冻结时间" data-index="frozenTime" :width="160" />
          <a-table-column title="冻结原因" data-index="reason" />
          <a-table-column title="预计解冻时间" data-index="expectedUnfreezeTime" :width="160" />
          <a-table-column title="解冻时间" data-index="unfreezeTime" :width="160">
            <template #cell="{ record }">
              {{ record.unfreezeTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'frozen' ? 'orange' : 'green'">
                {{ record.status === 'frozen' ? '冻结中' : '已解冻' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchForm = reactive({
  orderNo: '',
  status: '',
  dateRange: [],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const tableData = ref([
  { orderNo: 'PO202403240001', orderType: 'purchase', amount: '125,000.00', frozenTime: '2024-03-24 10:35:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '订单完成后解冻', unfreezeTime: '', status: 'frozen' },
  { orderNo: 'PO202403230002', orderType: 'purchase', amount: '85,000.00', frozenTime: '2024-03-23 14:20:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '订单完成后解冻', unfreezeTime: '', status: 'frozen' },
  { orderNo: 'PO202403220003', orderType: 'purchase', amount: '50,000.00', frozenTime: '2024-03-22 09:15:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '2024-03-25 16:30:00', unfreezeTime: '2024-03-25 16:30:00', status: 'unfrozen' },
  { orderNo: 'SO202403210001', orderType: 'sale', amount: '68,000.00', frozenTime: '2024-03-21 11:20:00', reason: '销售订单收款冻结', expectedUnfreezeTime: '订单完成后解冻', unfreezeTime: '', status: 'frozen' },
  { orderNo: 'PO202403200004', orderType: 'purchase', amount: '92,500.00', frozenTime: '2024-03-20 15:45:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '2024-03-23 10:00:00', unfreezeTime: '2024-03-23 10:00:00', status: 'unfrozen' },
])

function handleSearch() {
  console.log('search', searchForm)
}

function handlePageChange(page: number) {
  pagination.current = page
}

function viewOrder(record: any) {
  router.push(`/order/detail?id=${record.orderNo}`)
}
</script>

<style scoped lang="less">
.frozen-list {
  padding: 16px;
}

.frozen-amount {
  color: #f53f3f;
  font-weight: 500;
}
</style>
