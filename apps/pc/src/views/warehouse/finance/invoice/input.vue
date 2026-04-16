<template>
  <div class="invoice-input-page">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleApply">
            <template #icon><icon-plus /></template>
            申请开票
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="待开票金额" :value="pendingAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="待开票笔数" :value="pendingCount" suffix="笔" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="已开票金额" :value="doneAmount" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月开票" :value="monthCount" suffix="笔" />
        </a-col>
      </a-row>

      <a-tabs v-model:active-key="activeTab" class="mt-16">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="pending" title="待开票" />
        <a-tab-pane key="processing" title="开票中" />
        <a-tab-pane key="done" title="已开票" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="发票号">
          <a-input v-model="searchForm.invoiceNo" placeholder="请输入发票号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="采购订单号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="供应商">
          <a-select v-model="searchForm.supplierId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="s1">广东建材有限公司</a-option>
            <a-option value="s2">上海钢材集团</a-option>
            <a-option value="s3">惠州砂石厂</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开票状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待开票</a-option>
            <a-option value="processing">开票中</a-option>
            <a-option value="done">已开票</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        :data="filteredInvoices" 
        :pagination="pagination" 
        class="mt-16"
      >
        <template #columns>
          <a-table-column title="申请单号" data-index="applyNo" :width="180" />
          <a-table-column title="采购订单号" :width="150">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="180" />
          <a-table-column title="开票金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="发票号" data-index="invoiceNo" :width="150">
            <template #cell="{ record }">
              {{ record.invoiceNo || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="160" />
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发票附件" :width="100">
            <template #cell="{ record }">
              <a-link v-if="record.hasFile" @click="handleViewFile(record)">查看</a-link>
              <span v-else class="text-subtle">-</span>
            </template>
          </a-table-column>
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
      v-model:visible="applyModalVisible"
      title="向供应商申请开票"
      :width="700"
      @ok="handleApplyConfirm"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        向供应商申请开票，选择已完成付款的采购订单
      </a-alert>

      <a-form :model="applyForm" layout="vertical">
        <a-form-item label="选择供应商" required>
          <a-select v-model="applyForm.supplierId" placeholder="请选择供应商" style="width: 100%">
            <a-option value="s1">广东建材有限公司</a-option>
            <a-option value="s2">上海钢材集团</a-option>
            <a-option value="s3">惠州砂石厂</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="选择订单（可多选）" required>
          <a-table :data="orderList" :pagination="false" row-key="orderNo">
            <template #columns>
              <a-table-column type="checkbox" :width="45" />
              <a-table-column title="采购订单号" data-index="orderNo" :width="160" />
              <a-table-column title="订单金额" :width="120" align="right">
                <template #cell="{ record }">¥{{ record.amount }}</template>
              </a-table-column>
              <a-table-column title="已付金额" :width="120" align="right">
                <template #cell="{ record }">¥{{ record.paidAmount }}</template>
              </a-table-column>
              <a-table-column title="未开票金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">¥{{ record.pendingInvoiceAmount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="下单时间" data-index="createTime" :width="160" />
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="本次开票金额" required>
          <a-input-number
            v-model="applyForm.amount"
            :min="0.01"
            :precision="2"
            style="width: 100%"
          />
          <div class="form-tip">累计选中订单未开票金额：¥{{ selectedOrderAmount }}</div>
        </a-form-item>

        <a-form-item label="开票备注">
          <a-textarea
            v-model="applyForm.remark"
            placeholder="请输入开票要求、备注等（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('all')

const pendingAmount = ref(526800)
const pendingCount = ref(8)
const doneAmount = ref(325000)
const monthCount = ref(5)

const searchForm = ref({
  invoiceNo: '',
  orderNo: '',
  supplierId: '',
  status: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const applyModalVisible = ref(false)
const applyForm = ref({
  supplierId: '',
  amount: 0,
  remark: '',
})

const invoices = ref([
  {
    id: '1',
    applyNo: 'INV-IN-202401150001',
    orderNo: 'PO202401150001',
    supplierName: '广东建材有限公司',
    amount: 205000,
    invoiceNo: '00123456',
    applyTime: '2024-01-15 16:30:00',
    status: 'done',
    hasFile: true,
  },
  {
    id: '2',
    applyNo: 'INV-IN-202401150002',
    orderNo: 'PO202401150002',
    supplierName: '上海钢材集团',
    amount: 500000,
    invoiceNo: '',
    applyTime: '2024-01-15 14:20:00',
    status: 'processing',
    hasFile: false,
  },
  {
    id: '3',
    applyNo: 'INV-IN-202401140001',
    orderNo: 'PO202401140001',
    supplierName: '惠州砂石厂',
    amount: 15000,
    invoiceNo: '',
    applyTime: '2024-01-14 10:00:00',
    status: 'pending',
    hasFile: false,
  },
])

const orderList = ref([
  { orderNo: 'PO202401150001', amount: 205000, paidAmount: 205000, pendingInvoiceAmount: 205000, createTime: '2024-01-15 10:30:00' },
  { orderNo: 'PO202401150002', amount: 820000, paidAmount: 500000, pendingInvoiceAmount: 500000, createTime: '2024-01-15 14:20:00' },
  { orderNo: 'PO202401140001', amount: 15000, paidAmount: 15000, pendingInvoiceAmount: 15000, createTime: '2024-01-14 16:00:00' },
])

const selectedOrderAmount = computed(() => 520000)

const filteredInvoices = computed(() => {
  let result = invoices.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.status === activeTab.value)
  }
  
  return result
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    done: 'green',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待开票',
    processing: '开票中',
    done: '已开票',
  }
  return texts[status] || status
}

function handleApply() {
  applyModalVisible.value = true
}

function handleApplyConfirm() {
  Message.success('开票申请已提交，等待供应商开票')
  applyModalVisible.value = false
}

function handleView(record: any) {
  Message.info('查看详情')
}

function handleViewFile(record: any) {
  Message.info('查看发票附件')
}

function handleSearch() {
  Message.success('查询完成')
}

function handleReset() {
  searchForm.value = {
    invoiceNo: '',
    orderNo: '',
    supplierId: '',
    status: '',
  }
}
</script>

<style scoped lang="less">
.invoice-input-page {
  .stat-row {
    margin-bottom: 16px;
  }
  
  .search-form {
    margin-top: 16px;
  }
  
  .amount {
    font-weight: 600;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}
</style>
