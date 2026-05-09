<template>
  <div class="offline-record-page">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleUpload">
            <template #icon><icon-upload /></template>
            上传凭证
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="待审核" :value="pendingCount" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="已通过" :value="approvedCount" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="已拒绝" :value="rejectedCount" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总金额" :value="totalAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-tabs v-model:active-key="activeTab" class="mt-16">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="pending" title="待审核" />
        <a-tab-pane key="approved" title="已通过" />
        <a-tab-pane key="rejected" title="已拒绝" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="记录编号">
          <a-input v-model="searchForm.recordNo" placeholder="请输入记录编号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="订单编号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单编号" allow-clear style="width: 180px" />
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
        row-key="id"
      >
        <template #columns>
          <a-table-column title="记录编号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.recordNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="转账金额" :width="140" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="转账银行" data-index="bankName" :width="140" />
          <a-table-column title="转账账户" data-index="accountNo" :width="160" />
          <a-table-column title="转账时间" data-index="transferTime" :width="160" />
          <a-table-column title="审核状态" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="审核时间" data-index="auditTime" :width="160" />
          <a-table-column title="操作" :width="160" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>
                <a-link v-if="record.status === 'rejected'" @click="handleReupload(record)">重新上传</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="detailVisible" 
      title="线下转正详情" 
      :width="800"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="记录编号">{{ currentRecord.recordNo }}</a-descriptions-item>
        <a-descriptions-item label="审核状态">
          <a-tag :color="getStatusColor(currentRecord.status)">
            {{ getStatusText(currentRecord.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentRecord.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="转账金额">
          <span class="text-danger text-xl">¥{{ currentRecord.amount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="转账银行">{{ currentRecord.bankName }}</a-descriptions-item>
        <a-descriptions-item label="转账账户">{{ currentRecord.accountNo }}</a-descriptions-item>
        <a-descriptions-item label="转账时间">{{ currentRecord.transferTime }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ currentRecord.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentRecord.createTime }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentRecord.operator }}</a-descriptions-item>
        <a-descriptions-item v-if="currentRecord.auditTime" label="审核时间">{{ currentRecord.auditTime }}</a-descriptions-item>
        <a-descriptions-item v-if="currentRecord.auditRemark" label="审核意见">{{ currentRecord.auditRemark }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>转账凭证</h4>
      <div class="voucher-preview">
        <img 
          v-if="currentRecord.voucherUrl" 
          :src="currentRecord.voucherUrl" 
          alt="转账凭证"
          style="max-width: 500px; border-radius: 4px; border: 1px solid var(--color-border-2)"
        />
        <span v-else class="text-subtle">暂无凭证</span>
      </div>

      <a-divider />

      <h4>审核流程</h4>
      <a-timeline>
        <a-timeline-item v-for="(log, index) in currentRecord.logs" :key="index" :label="log.time">
          {{ log.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill v-if="currentRecord.status === 'approved'" style="color: #00b42a" />
            <icon-close-circle-fill v-else-if="currentRecord.status === 'rejected'" style="color: #f53f3f" />
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

const searchForm = ref({
  recordNo: '',
  orderNo: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const records = ref([
  {
    id: '1',
    recordNo: 'OFF202401220001',
    orderNo: 'SO202401220001',
    amount: 128600,
    bankName: '中国工商银行',
    accountNo: '622208 **** **** 8888',
    transferTime: '2024-01-22 16:30:00',
    voucherUrl: 'https://picsum.photos/600/400?random=1',
    status: 'approved',
    remark: '建材销售订单收款',
    createTime: '2024-01-22 16:35:00',
    operator: '张三',
    auditTime: '2024-01-22 17:00:00',
    auditRemark: '凭证清晰，金额一致',
    logs: [
      { time: '2024-01-22 17:00:00', content: '审核通过，已转正到账户' },
      { time: '2024-01-22 16:35:00', content: '提交线下转账凭证，等待审核' },
    ],
  },
  {
    id: '2',
    recordNo: 'OFF202401210001',
    orderNo: 'PO202401210002',
    amount: 86500,
    bankName: '中国建设银行',
    accountNo: '621700 **** **** 6666',
    transferTime: '2024-01-21 14:20:00',
    voucherUrl: 'https://picsum.photos/600/400?random=2',
    status: 'approved',
    remark: '水泥采购订单支付',
    createTime: '2024-01-21 14:30:00',
    operator: '李四',
    auditTime: '2024-01-21 15:00:00',
    auditRemark: '审核通过',
    logs: [
      { time: '2024-01-21 15:00:00', content: '审核通过，已转正到账户' },
      { time: '2024-01-21 14:30:00', content: '提交线下转账凭证，等待审核' },
    ],
  },
  {
    id: '3',
    recordNo: 'OFF202401200001',
    orderNo: 'SO202401200003',
    amount: 50000,
    bankName: '中国农业银行',
    accountNo: '622848 **** **** 9999',
    transferTime: '2024-01-20 10:00:00',
    voucherUrl: 'https://picsum.photos/600/400?random=3',
    status: 'pending',
    remark: '钢材销售订单收款',
    createTime: '2024-01-20 10:15:00',
    operator: '张三',
    auditTime: '',
    auditRemark: '',
    logs: [
      { time: '2024-01-20 10:15:00', content: '提交线下转账凭证，等待审核' },
    ],
  },
  {
    id: '4',
    recordNo: 'OFF202401190001',
    orderNo: 'SO202401190001',
    amount: 35000,
    bankName: '中国银行',
    accountNo: '621661 **** **** 5555',
    transferTime: '2024-01-19 09:00:00',
    voucherUrl: '',
    status: 'rejected',
    remark: '五金配件销售订单',
    createTime: '2024-01-19 09:10:00',
    operator: '王五',
    auditTime: '2024-01-19 09:30:00',
    auditRemark: '凭证图片模糊，无法辨认金额',
    logs: [
      { time: '2024-01-19 09:30:00', content: '审核拒绝，请重新上传清晰的凭证图片' },
      { time: '2024-01-19 09:10:00', content: '提交线下转账凭证，等待审核' },
    ],
  },
])

const filteredRecords = computed(() => {
  let result = records.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.status === activeTab.value)
  }
  
  if (searchForm.value.recordNo) {
    result = result.filter(item => 
      item.recordNo.includes(searchForm.value.recordNo)
    )
  }
  
  if (searchForm.value.orderNo) {
    result = result.filter(item => 
      item.orderNo.includes(searchForm.value.orderNo)
    )
  }
  
  return result
})

const pendingCount = computed(() => records.value.filter(r => r.status === 'pending').length)
const approvedCount = computed(() => records.value.filter(r => r.status === 'approved').length)
const rejectedCount = computed(() => records.value.filter(r => r.status === 'rejected').length)
const totalAmount = computed(() => records.value.reduce((sum, r) => sum + r.amount, 0))

const detailVisible = ref(false)
const currentRecord = ref<any>({})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return texts[status] || status
}

function handleSearch() {
  pagination.value.current = 1
  Message.success('查询成功')
}

function handleReset() {
  searchForm.value = {
    recordNo: '',
    orderNo: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewDetail(record: any) {
  currentRecord.value = record
  detailVisible.value = true
}

function handleReupload(record: any) {
  Message.info(`重新上传凭证：${record.recordNo}`)
}

function handleUpload() {
  Message.info('打开上传凭证弹窗')
}
</script>

<style scoped lang="less">
.offline-record-page {
  padding: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.text-xl {
  font-size: 18px;
  font-weight: 600;
}

.text-subtle {
  color: rgb(var(--gray-5));
}

.voucher-preview {
  margin-top: 8px;
}
</style>