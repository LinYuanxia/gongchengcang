<template>
  <div class="service-bill">
    <a-card>
      <template #extra>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </template>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div class="alert-content">
            <icon-info-circle />
            <span>平台服务费账单：平台根据您的销售订单收取服务费，平台会向贵方开具服务费发票</span>
          </div>
        </template>
      </a-alert>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月服务费" :value="26340" :precision="2">
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
          <a-statistic title="服务费率" :value="5" :precision="2">
            <template #suffix>%</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="账单编号">
          <a-input v-model="searchForm.billNo" placeholder="请输入账单编号" allow-clear style="width: 180px" />
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
                <a-button v-if="record.invoiceStatus" type="text" size="small" status="success" @click="handleViewInvoice(record)">查看发票</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" title="服务费账单详情" :width="700" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="账单编号">{{ currentBill?.billNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentBill?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentBill?.orderAmount }}</a-descriptions-item>
        <a-descriptions-item label="服务费率">{{ currentBill?.rate }}%</a-descriptions-item>
        <a-descriptions-item label="服务费金额" :span="2">
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

      <a-divider />

      <div class="fee-detail">
        <h4>费用明细</h4>
        <a-table :data="feeDetail" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="商品名称" data-index="productName" />
            <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
            <a-table-column title="单价" :width="120" align="right">
              <template #cell="{ record }">¥{{ record.price }}</template>
            </a-table-column>
            <a-table-column title="金额" :width="120" align="right">
              <template #cell="{ record }">¥{{ record.amount }}</template>
            </a-table-column>
            <a-table-column title="服务费" :width="120" align="right">
              <template #cell="{ record }">
                <span class="service-fee">¥{{ record.serviceFee }}</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  billNo: '',
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
  orderNo: string
  orderAmount: string
  rate: number
  serviceAmount: string
  invoiceStatus: boolean
  invoiceNo: string
  billTime: string
  invoiceTime?: string
}

const billList = ref<BillRecord[]>([
  { id: '1', billNo: 'SF202401150001', orderNo: 'SO202401150001', orderAmount: '125,800.00', rate: 5, serviceAmount: '6,290.00', invoiceStatus: true, invoiceNo: 'INV202401150001', billTime: '2024-01-15 10:00:00', invoiceTime: '2024-01-16 14:00:00' },
  { id: '2', billNo: 'SF202401140001', orderNo: 'SO202401140001', orderAmount: '89,500.00', rate: 5, serviceAmount: '4,475.00', invoiceStatus: false, invoiceNo: '', billTime: '2024-01-14 14:30:00' },
  { id: '3', billNo: 'SF202401130001', orderNo: 'SO202401130001', orderAmount: '52,300.00', rate: 5, serviceAmount: '2,615.00', invoiceStatus: false, invoiceNo: '', billTime: '2024-01-13 09:00:00' },
  { id: '4', billNo: 'SF202401120001', orderNo: 'SO202401120001', orderAmount: '168,000.00', rate: 5, serviceAmount: '8,400.00', invoiceStatus: true, invoiceNo: 'INV202401120001', billTime: '2024-01-12 16:00:00', invoiceTime: '2024-01-13 10:00:00' },
  { id: '5', billNo: 'SF202401110001', orderNo: 'SO202401110001', orderAmount: '91,200.00', rate: 5, serviceAmount: '4,560.00', invoiceStatus: true, invoiceNo: 'INV202401110001', billTime: '2024-01-11 11:00:00', invoiceTime: '2024-01-12 09:00:00' },
])

const detailVisible = ref(false)
const currentBill = ref<BillRecord | null>(null)

const feeDetail = ref([
  { productName: '水泥 P.O 42.5', quantity: '50吨', price: '580.00', amount: '29,000.00', serviceFee: '1,450.00' },
  { productName: '钢筋 HRB400 φ12', quantity: '30吨', price: '4,200.00', amount: '126,000.00', serviceFee: '6,300.00' },
  { productName: '砂石中砂', quantity: '100方', price: '120.00', amount: '12,000.00', serviceFee: '600.00' },
])

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleReset() {
  searchForm.value = {
    billNo: '',
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

function handleViewInvoice(record: BillRecord) {
  Message.info(`查看发票: ${record.invoiceNo}`)
}

function handleExport() {
  Message.info('导出功能开发中')
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
  color: #f53f3f;
}

.highlight {
  color: #f53f3f;
  font-weight: 600;
  font-size: 16px;
}

.service-fee {
  color: #f53f3f;
  font-weight: 500;
}

.fee-detail {
  h4 {
    margin-bottom: 12px;
    font-weight: 500;
  }
}
</style>
