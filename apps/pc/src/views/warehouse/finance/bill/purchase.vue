<template>
  <div class="purchase-bill">
    <a-card>
      <template #extra>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月采购总额" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待付款金额" :value="128500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="已付款金额" :value="230000" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="采购订单数" :value="28">
            <template #suffix>笔</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="账单编号">
          <a-input v-model="searchForm.billNo" placeholder="请输入账单编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="供应商">
          <a-select v-model="searchForm.supplierId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="s1">华润建材</a-option>
            <a-option value="s2">东方水泥</a-option>
            <a-option value="s3">鑫源钢材</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="付款状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待付款</a-option>
            <a-option value="partial">部分付款</a-option>
            <a-option value="paid">已付款</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="账单时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="billList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="账单编号" data-index="billNo" :width="180" />
          <a-table-column title="供应商" data-index="supplierName" :width="150" />
          <a-table-column title="关联订单" data-index="orderNo" :width="150" />
          <a-table-column title="账单金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="已付款" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="record.paidAmount === record.amount ? 'paid' : ''">¥{{ record.paidAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="待付款" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="record.pendingAmount > 0 ? 'pending' : ''">¥{{ record.pendingAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="付款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="账单时间" data-index="billTime" :width="180" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button v-if="record.status !== 'paid'" type="text" size="small" status="success" @click="handlePay(record)">付款</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="payVisible" title="确认付款" :width="500" @ok="handlePayConfirm">
      <a-form :model="payForm" layout="vertical">
        <a-form-item label="账单信息">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="账单编号">{{ payForm.billNo }}</a-descriptions-item>
            <a-descriptions-item label="供应商">{{ payForm.supplierName }}</a-descriptions-item>
            <a-descriptions-item label="待付款金额">
              <span class="highlight">¥ {{ payForm.pendingAmount }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-form-item>
        <a-form-item label="付款金额" required>
          <a-input-number v-model="payForm.amount" :min="0.01" :max="payForm.maxAmount" :precision="2" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="付款方式">
          <a-radio-group v-model="payForm.method">
            <a-radio value="custody">托管账户</a-radio>
            <a-radio value="bank">银行转账</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  billNo: '',
  supplierId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

interface BillRecord {
  id: string
  billNo: string
  supplierName: string
  orderNo: string
  amount: string
  paidAmount: string
  pendingAmount: string
  status: string
  billTime: string
}

const allBillList = ref<BillRecord[]>([
  { id: '1', billNo: 'PB202401150001', supplierName: '华润建材', orderNo: 'PO202401150001', amount: '85,000.00', paidAmount: '85,000.00', pendingAmount: '0.00', status: 'paid', billTime: '2024-01-15 10:00:00' },
  { id: '2', billNo: 'PB202401140001', supplierName: '东方水泥', orderNo: 'PO202401140001', amount: '52,300.00', paidAmount: '30,000.00', pendingAmount: '22,300.00', status: 'partial', billTime: '2024-01-14 14:30:00' },
  { id: '3', billNo: 'PB202401130001', supplierName: '鑫源钢材', orderNo: 'PO202401130001', amount: '128,500.00', paidAmount: '0.00', pendingAmount: '128,500.00', status: 'pending', billTime: '2024-01-13 09:00:00' },
  { id: '4', billNo: 'PB202401120001', supplierName: '华润建材', orderNo: 'PO202401120001', amount: '45,000.00', paidAmount: '45,000.00', pendingAmount: '0.00', status: 'paid', billTime: '2024-01-12 16:00:00' },
  { id: '5', billNo: 'PB202401110001', supplierName: '东方水泥', orderNo: 'PO202401110001', amount: '48,200.00', paidAmount: '0.00', pendingAmount: '48,200.00', status: 'pending', billTime: '2024-01-11 11:00:00' },
])

const billList = ref<BillRecord[]>([...allBillList.value])

const payVisible = ref(false)
const payForm = ref({
  billNo: '',
  supplierName: '',
  pendingAmount: '',
  amount: 0,
  maxAmount: 0,
  method: 'custody',
})

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'red',
    partial: 'orange',
    paid: 'green',
  }
  return colorMap[status] || 'gray'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待付款',
    partial: '部分付款',
    paid: '已付款',
  }
  return textMap[status] || status
}

function handleSearch() {
  let filtered = [...allBillList.value]
  
  if (searchForm.value.billNo) {
    filtered = filtered.filter(item => 
      item.billNo.includes(searchForm.value.billNo) ||
      item.orderNo.includes(searchForm.value.billNo)
    )
  }
  
  if (searchForm.value.supplierId) {
    filtered = filtered.filter(item => 
      item.supplierName.includes(searchForm.value.supplierId)
    )
  }
  
  if (searchForm.value.status) {
    filtered = filtered.filter(item => item.status === searchForm.value.status)
  }
  
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.value.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.billTime.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  billList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    billNo: '',
    supplierId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewDetail(record: BillRecord) {
  Message.info(`查看账单详情: ${record.billNo}`)
}

function handlePay(record: BillRecord) {
  payForm.value = {
    billNo: record.billNo,
    supplierName: record.supplierName,
    pendingAmount: record.pendingAmount,
    amount: parseFloat(record.pendingAmount.replace(/,/g, '')),
    maxAmount: parseFloat(record.pendingAmount.replace(/,/g, '')),
    method: 'custody',
  }
  payVisible.value = true
}

function handlePayConfirm() {
  if (!payForm.value.amount || payForm.value.amount <= 0) {
    Message.warning('请输入正确的付款金额')
    return
  }
  Message.success('付款成功')
  payVisible.value = false
}

function handleExport() {
  if (billList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${billList.value.length} 条采购账单`)
}
</script>

<style scoped lang="less">
.purchase-bill {
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

.amount {
  font-weight: 600;
}

.paid {
  color: #00b42a;
}

.pending {
  color: #f53f3f;
  font-weight: 500;
}

.highlight {
  color: #f53f3f;
  font-weight: 600;
  font-size: 16px;
}
</style>
