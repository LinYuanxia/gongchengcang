<template>
  <div class="payment-records">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="本月支付金额" :value="monthPayment" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月支付笔数" :value="monthCount" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日支付金额" :value="todayPayment" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日支付笔数" :value="todayCount" suffix="笔" />
        </a-col>
      </a-row>

      <a-tabs v-model:active-key="activeTab" class="mt-16">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="success" title="支付成功" />
        <a-tab-pane key="processing" title="处理中" />
        <a-tab-pane key="failed" title="支付失败" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="支付流水号">
          <a-input v-model="searchForm.paymentNo" placeholder="请输入支付流水号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="订单编号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="供应商">
          <a-select v-model="searchForm.supplierId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="s1">广东建材有限公司</a-option>
            <a-option value="s2">上海钢材集团</a-option>
            <a-option value="s3">惠州砂石厂</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="支付状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="success">支付成功</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="failed">支付失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        :data="filteredRecords" 
        :pagination="pagination" 
        class="mt-16"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="支付记录号" data-index="paymentNo" :width="180" />
          <a-table-column title="采购订单号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="180" />
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.paymentAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" :width="120">
            <template #cell="{ record }">
              <a-tag color="green">线下转账</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付类型" :width="100">
            <template #cell="{ record }">
              {{ record.paymentType === 'full' ? '全额支付' : '部分支付' }}
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="供应商确认状态" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.confirmed ? 'green' : 'orange'">
                {{ record.confirmed ? '已确认' : '待确认' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="上传凭证" :width="100">
            <template #cell="{ record }">
              <a-link v-if="record.hasVoucher" @click="handleDownloadVoucher(record)">查看</a-link>
              <span v-else class="text-subtle">-</span>
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">详情</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="detailVisible" 
      title="支付详情" 
      :width="800"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="支付记录号">{{ currentRecord.paymentNo }}</a-descriptions-item>
        <a-descriptions-item label="采购订单号">{{ currentRecord.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ currentRecord.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="支付金额">
          <span class="amount">¥{{ currentRecord.paymentAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">
          <a-tag color="green">线下转账</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付类型">
          {{ currentRecord.paymentType === 'full' ? '全额支付' : '部分支付' }}
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getStatusColor(currentRecord.status)">
            {{ getStatusText(currentRecord.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="供应商确认状态">
          <a-tag :color="currentRecord.confirmed ? 'green' : 'orange'">
            {{ currentRecord.confirmed ? '供应商已确认收款' : '待供应商确认' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ currentRecord.createTime }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentRecord.operator }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider v-if="currentRecord.hasVoucher" />

      <h4 v-if="currentRecord.hasVoucher">转账凭证</h4>
      <div class="voucher-preview" v-if="currentRecord.hasVoucher">
        <img src="https://picsum.photos/600/400?random=1" style="max-width: 500px; border-radius: 4px; border: 1px solid var(--color-border-2)" />
      </div>

      <a-divider />

      <h4>确认流程</h4>
      <a-timeline>
        <a-timeline-item v-for="(log, index) in currentRecord.logs" :key="index" :label="log.time">
          {{ log.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill style="color: #00b42a" />
          </template>
        </a-timeline-item>
      </a-timeline>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('all')

const monthPayment = ref(356800)
const monthCount = ref(28)
const todayPayment = ref(205000)
const todayCount = ref(3)

const searchForm = ref({
  paymentNo: '',
  orderNo: '',
  supplierId: '',
  status: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const records = ref([
  {
    id: '1',
    paymentNo: 'PAY2024011516300001',
    orderNo: 'PO202401150001',
    supplierName: '广东建材有限公司',
    paymentAmount: 205000,
    paymentType: 'full',
    status: 'success',
    confirmed: true,
    hasVoucher: true,
    createTime: '2024-01-15 16:30:00',
    operator: '张三',
    remark: '采购水泥和砂石货款',
    logs: [
      { time: '2024-01-16 09:00:00', content: '供应商确认收到款项' },
      { time: '2024-01-15 17:00:00', content: '已上传银行转账凭证' },
      { time: '2024-01-15 16:30:00', content: '提交付款申请，完成线下转账' },
    ],
  },
  {
    id: '2',
    paymentNo: 'PAY2024011514200001',
    orderNo: 'PO202401150002',
    supplierName: '上海钢材集团',
    paymentAmount: 500000,
    paymentType: 'partial',
    status: 'success',
    confirmed: true,
    hasVoucher: true,
    createTime: '2024-01-15 14:20:00',
    operator: '张三',
    remark: '螺纹钢货款，分两笔支付',
    logs: [
      { time: '2024-01-16 10:30:00', content: '供应商确认收到款项' },
      { time: '2024-01-15 15:00:00', content: '已上传银行转账凭证' },
      { time: '2024-01-15 14:20:00', content: '提交付款申请，完成线下转账' },
    ],
  },
  {
    id: '3',
    paymentNo: 'PAY2024011410000001',
    orderNo: 'PO202401140001',
    supplierName: '惠州砂石厂',
    paymentAmount: 15000,
    paymentType: 'full',
    status: 'success',
    confirmed: false,
    hasVoucher: true,
    createTime: '2024-01-14 10:00:00',
    operator: '李四',
    remark: '黄砂、碎石货款',
    logs: [
      { time: '2024-01-14 10:30:00', content: '已上传银行转账凭证，等待供应商确认' },
      { time: '2024-01-14 10:00:00', content: '提交付款申请，完成线下转账' },
    ],
  },
  {
    id: '4',
    paymentNo: 'PAY2024011609000001',
    orderNo: 'PO202401160001',
    supplierName: '深圳混凝土公司',
    paymentAmount: 38000,
    paymentType: 'full',
    status: 'success',
    confirmed: false,
    hasVoucher: false,
    createTime: '2024-01-16 09:00:00',
    operator: '张三',
    remark: 'C30混凝土货款',
    logs: [
      { time: '2024-01-16 09:00:00', content: '提交付款申请，待转账、待上传凭证' },
    ],
  },
])

const filteredRecords = computed(() => {
  let result = records.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.status === activeTab.value)
  }
  
  if (searchForm.value.paymentNo) {
    result = result.filter(item => 
      item.paymentNo.includes(searchForm.value.paymentNo)
    )
  }
  
  if (searchForm.value.orderNo) {
    result = result.filter(item => 
      item.orderNo.includes(searchForm.value.orderNo)
    )
  }
  
  if (searchForm.value.supplierId) {
    result = result.filter(item => item.supplierId === searchForm.value.supplierId)
  }
  
  if (searchForm.value.status) {
    result = result.filter(item => item.status === searchForm.value.status)
  }
  
  return result
})

const detailVisible = ref(false)
const currentRecord = ref<any>({})

function getPaymentMethodColor(method: string) {
  const colors: Record<string, string> = {
    custody: 'blue',
    bank: 'green',
  }
  return colors[method] || 'gray'
}

function getPaymentMethodText(method: string) {
  const texts: Record<string, string> = {
    custody: '托管账户',
    bank: '银行转账',
  }
  return texts[method] || method
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    success: 'green',
    processing: 'blue',
    failed: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    success: '支付成功',
    processing: '处理中',
    failed: '支付失败',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.success('查询成功')
}

function handleReset() {
  searchForm.value = {
    paymentNo: '',
    orderNo: '',
    supplierId: '',
    status: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewOrder(record: any) {
  Message.info(`查看订单：${record.orderNo}`)
}

function handleView(record: any) {
  currentRecord.value = record
  detailVisible.value = true
}

function handleDownloadVoucher(record: any) {
  Message.info(`下载支付凭证：${record.paymentNo}`)
}

function handleExport() {
  if (paymentList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${paymentList.value.length} 条付款记录`)
}
</script>

<style scoped lang="less">
.payment-records {
  padding: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.amount {
  color: #f53f3f;
  font-weight: 600;
}

.mt-16 {
  margin-top: 16px;
}
</style>
