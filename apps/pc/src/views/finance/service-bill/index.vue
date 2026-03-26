<template>
  <div class="service-bill">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div class="alert-content">
            <icon-info-circle />
            <span>服务费账单：平台向工程仓收取的服务费，平台需向工程仓开具服务费发票</span>
          </div>
        </template>
      </a-alert>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月服务费收入" :value="26340" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待开票金额" :value="8950" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="已开票金额" :value="17390" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="服务费账单数" :value="15" suffix="笔" />
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="账单编号">
          <a-input v-model="searchForm.billNo" placeholder="请输入账单编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="工程仓">
          <a-select v-model="searchForm.warehouseId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开票状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待开票</a-option>
            <a-option value="invoiced">已开票</a-option>
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
          <a-table-column title="工程仓" data-index="warehouseName" :width="180" />
          <a-table-column title="关联订单" data-index="orderNo" :width="150" />
          <a-table-column title="订单金额" :width="150" align="right">
            <template #cell="{ record }">
              <span>¥{{ record.orderAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="服务费率" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.rate }}%
            </template>
          </a-table-column>
          <a-table-column title="服务费金额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.serviceAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.invoiceStatus ? 'green' : 'orange'">
                {{ record.invoiceStatus ? '已开票' : '待开票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发票号码" :width="150">
            <template #cell="{ record }">
              {{ record.invoiceNo || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="账单时间" data-index="billTime" :width="180" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button v-if="!record.invoiceStatus" type="text" size="small" status="success" @click="handleInvoice(record)">开票</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" title="服务费账单详情" :width="700" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="账单编号">{{ currentBill?.billNo }}</a-descriptions-item>
        <a-descriptions-item label="工程仓">{{ currentBill?.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentBill?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentBill?.orderAmount }}</a-descriptions-item>
        <a-descriptions-item label="服务费率">{{ currentBill?.rate }}%</a-descriptions-item>
        <a-descriptions-item label="服务费金额">
          <span class="highlight">¥{{ currentBill?.serviceAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="开票状态">
          <a-tag :color="currentBill?.invoiceStatus ? 'green' : 'orange'">
            {{ currentBill?.invoiceStatus ? '已开票' : '待开票' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发票号码">{{ currentBill?.invoiceNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="账单时间">{{ currentBill?.billTime }}</a-descriptions-item>
        <a-descriptions-item label="开票时间">{{ currentBill?.invoiceTime || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchForm = ref({
  billNo: '',
  warehouseId: '',
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
  warehouseName: string
  orderNo: string
  orderAmount: string
  rate: number
  serviceAmount: string
  invoiceStatus: boolean
  invoiceNo: string
  billTime: string
  invoiceTime?: string
}

const allBillList = ref<BillRecord[]>([
  { id: '1', billNo: 'SF202401150001', warehouseName: '深圳湾科技园项目仓', orderNo: 'SO202401150001', orderAmount: '125,800.00', rate: 5, serviceAmount: '6,290.00', invoiceStatus: true, invoiceNo: 'OUT202401150001', billTime: '2024-01-15 10:00:00', invoiceTime: '2024-01-15 14:00:00' },
  { id: '2', billNo: 'SF202401140001', warehouseName: '广州天河工程仓', orderNo: 'SO202401140001', orderAmount: '89,500.00', rate: 5, serviceAmount: '4,475.00', invoiceStatus: false, invoiceNo: '', billTime: '2024-01-14 14:30:00' },
  { id: '3', billNo: 'SF202401130001', warehouseName: '深圳湾科技园项目仓', orderNo: 'SO202401130001', orderAmount: '52,300.00', rate: 5, serviceAmount: '2,615.00', invoiceStatus: false, invoiceNo: '', billTime: '2024-01-13 09:00:00' },
  { id: '4', billNo: 'SF202401120001', warehouseName: '深圳湾科技园项目仓', orderNo: 'SO202401120001', orderAmount: '168,000.00', rate: 5, serviceAmount: '8,400.00', invoiceStatus: true, invoiceNo: 'OUT202401140001', billTime: '2024-01-12 16:00:00', invoiceTime: '2024-01-14 10:00:00' },
  { id: '5', billNo: 'SF202401110001', warehouseName: '广州天河工程仓', orderNo: 'SO202401110001', orderAmount: '91,200.00', rate: 5, serviceAmount: '4,560.00', invoiceStatus: true, invoiceNo: 'OUT202401130001', billTime: '2024-01-11 11:00:00', invoiceTime: '2024-01-13 09:00:00' },
])

const billList = ref<BillRecord[]>([...allBillList.value])

const detailVisible = ref(false)
const currentBill = ref<BillRecord | null>(null)

function handleSearch() {
  let filtered = [...allBillList.value]
  
  if (searchForm.value.billNo) {
    filtered = filtered.filter(item => 
      item.billNo.includes(searchForm.value.billNo) ||
      item.orderNo.includes(searchForm.value.billNo)
    )
  }
  
  if (searchForm.value.warehouseId) {
    filtered = filtered.filter(item => 
      item.warehouseName.includes(searchForm.value.warehouseId)
    )
  }
  
  if (searchForm.value.status) {
    if (searchForm.value.status === 'invoiced') {
      filtered = filtered.filter(item => item.invoiceStatus)
    } else if (searchForm.value.status === 'uninvoiced') {
      filtered = filtered.filter(item => !item.invoiceStatus)
    }
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
    warehouseId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewDetail(record: BillRecord) {
  currentBill.value = record
  detailVisible.value = true
}

function handleInvoice(record: BillRecord) {
  router.push(`/finance/invoice/output?billId=${record.id}`)
}

function handleExport() {
  if (billList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${billList.value.length} 条服务费账单`)
}
</script>

<style scoped lang="less">
.service-bill {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: #165dff;
}

.highlight {
  color: #165dff;
  font-weight: 600;
  font-size: 16px;
}
</style>
