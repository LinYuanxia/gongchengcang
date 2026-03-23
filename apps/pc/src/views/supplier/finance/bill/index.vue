<template>
  <div class="sale-bill">
    <a-card>
      <template #extra>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月销售额" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月订单数" :value="28" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月退货金额" :value="12500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月净销售额" :value="346000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="账单编号">
          <a-input v-model="searchForm.billNo" placeholder="请输入账单编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="采购方">
          <a-select v-model="searchForm.buyerId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="账单类型">
          <a-select v-model="searchForm.billType" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="sale">销售</a-option>
            <a-option value="refund">退货</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="账单时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="billList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="账单编号" data-index="billNo" :width="180" />
          <a-table-column title="账单类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.billType === 'sale' ? 'green' : 'red'">
                {{ record.billType === 'sale' ? '销售' : '退货' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="采购方" data-index="buyerName" :width="180" />
          <a-table-column title="关联订单" data-index="orderNo" :width="150" />
          <a-table-column title="账单金额" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="record.billType === 'sale' ? 'income' : 'expense'">
                {{ record.billType === 'sale' ? '+' : '-' }}¥{{ record.amount }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="账单时间" data-index="billTime" :width="180" />
          <a-table-column title="结算状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.settled ? 'green' : 'orange'">
                {{ record.settled ? '已结算' : '待结算' }}
              </a-tag>
            </template>
          </a-table-column>
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
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  billNo: '',
  buyerId: '',
  billType: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const billList = ref([
  { id: '1', billNo: 'SB202401150001', billType: 'sale', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401150001', amount: '85,000.00', billTime: '2024-01-15 16:30:00', settled: true },
  { id: '2', billNo: 'SB202401140001', billType: 'sale', buyerName: '广州天河工程仓', orderNo: 'PO202401140001', amount: '52,300.00', billTime: '2024-01-14 10:00:00', settled: true },
  { id: '3', billNo: 'RB202401130001', billType: 'refund', buyerName: '深圳湾科技园项目仓', orderNo: 'RO202401130001', amount: '12,500.00', billTime: '2024-01-13 15:30:00', settled: true },
  { id: '4', billNo: 'SB202401120001', billType: 'sale', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401120001', amount: '128,500.00', billTime: '2024-01-12 09:00:00', settled: false },
  { id: '5', billNo: 'SB202401110001', billType: 'sale', buyerName: '广州天河工程仓', orderNo: 'PO202401110001', amount: '45,800.00', billTime: '2024-01-11 14:00:00', settled: true },
])

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleViewDetail(record: any) {
  Message.info(`查看账单: ${record.billNo}`)
}

function handleExport() {
  Message.info('导出功能开发中')
}
</script>

<style scoped lang="less">
.sale-bill {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-row {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}
</style>
