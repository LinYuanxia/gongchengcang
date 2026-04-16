<template>
  <div class="invoice-output-page">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleUpload">
            <template #icon><icon-upload /></template>
            上传发票
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
        <a-tab-pane key="done" title="已开票" />
      </a-tabs>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="发票号">
          <a-input v-model="searchForm.invoiceNo" placeholder="请输入发票号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="销售订单号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="施工方">
          <a-select v-model="searchForm.buyerId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="b1">中建一局集团</a-option>
            <a-option value="b2">中铁二局工程公司</a-option>
            <a-option value="b3">广东建工集团</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开票状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待开票</a-option>
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
          <a-table-column title="发票号" data-index="invoiceNo" :width="180" />
          <a-table-column title="销售订单号" :width="150">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="施工方（购方）" data-index="buyerName" :width="180" />
          <a-table-column title="开票金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="税率" data-index="taxRate" :width="80" align="center">
            <template #cell="{ record }">
              {{ record.taxRate }}%
            </template>
          </a-table-column>
          <a-table-column title="开票时间" data-index="invoiceTime" :width="160">
            <template #cell="{ record }">
              {{ record.invoiceTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发票附件" :width="100">
            <template #cell="{ record }">
              <a-link v-if="record.hasFile" @click="handleViewFile(record)">下载</a-link>
              <span v-else class="text-subtle">-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">详情</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleUploadInvoice(record)">上传</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="uploadModalVisible"
      title="上传销项发票"
      :width="700"
      @ok="handleUploadConfirm"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        为施工方开具发票后，请在此上传发票电子文件
      </a-alert>

      <a-form :model="uploadForm" layout="vertical">
        <a-form-item label="关联销售订单" required>
          <a-select v-model="uploadForm.orderId" placeholder="请选择销售订单" style="width: 100%">
            <a-option value="o1">SO202401100001 - 中建一局集团 - ¥650,000</a-option>
            <a-option value="o2">SO202401120001 - 中铁二局工程公司 - ¥480,000</a-option>
            <a-option value="o3">SO202401140001 - 广东建工集团 - ¥120,000</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="发票号码" required>
          <a-input v-model="uploadForm.invoiceNo" placeholder="请输入发票号码" maxlength="20" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开票金额" required>
              <a-input-number
                v-model="uploadForm.amount"
                :min="0.01"
                :precision="2"
                style="width: 100%"
                placeholder="请输入开票金额"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="税率" required>
              <a-select v-model="uploadForm.taxRate" placeholder="请选择税率" style="width: 100%">
                <a-option value={13}>13%</a-option>
                <a-option value={9}>9%</a-option>
                <a-option value={6}>6%</a-option>
                <a-option value={3}>3%</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="开票日期" required>
          <a-date-picker v-model="uploadForm.invoiceDate" style="width: 100%" />
        </a-form-item>

        <a-form-item label="上传发票附件" required>
          <a-upload
            :file-list="uploadForm.files"
            action="/"
            :auto-upload="false"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleFileChange"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              选择文件
            </a-button>
            <template #tip>
              <div class="upload-tip">支持 PDF、JPG、PNG 格式，单个文件不超过 10MB</div>
            </template>
          </a-upload>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea
            v-model="uploadForm.remark"
            placeholder="请输入备注（选填）"
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

const pendingAmount = ref(1250000)
const pendingCount = ref(12)
const doneAmount = ref(860000)
const monthCount = ref(8)

const searchForm = ref({
  invoiceNo: '',
  orderNo: '',
  buyerId: '',
  status: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 30,
})

const uploadModalVisible = ref(false)
const uploadForm = ref({
  orderId: '',
  invoiceNo: '',
  amount: 0,
  taxRate: 13,
  invoiceDate: '',
  files: [],
  remark: '',
})

const invoices = ref([
  {
    id: '1',
    invoiceNo: '00987654',
    orderNo: 'SO202401100001',
    buyerName: '中建一局集团',
    amount: 650000,
    taxRate: 13,
    invoiceTime: '2024-01-15 10:00:00',
    status: 'done',
    hasFile: true,
  },
  {
    id: '2',
    invoiceNo: '',
    orderNo: 'SO202401120001',
    buyerName: '中铁二局工程公司',
    amount: 480000,
    taxRate: 13,
    invoiceTime: '',
    status: 'pending',
    hasFile: false,
  },
  {
    id: '3',
    invoiceNo: '',
    orderNo: 'SO202401140001',
    buyerName: '广东建工集团',
    amount: 120000,
    taxRate: 9,
    invoiceTime: '',
    status: 'pending',
    hasFile: false,
  },
])

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
    done: 'green',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待开票',
    done: '已开票',
  }
  return texts[status] || status
}

function handleUpload() {
  uploadModalVisible.value = true
}

function handleUploadInvoice(record: any) {
  uploadForm.value.orderId = record.id
  uploadModalVisible.value = true
}

function handleUploadConfirm() {
  Message.success('发票上传成功')
  uploadModalVisible.value = false
}

function handleFileChange(fileItem: any) {
  console.log('File changed:', fileItem)
}

function handleView(record: any) {
  Message.info('查看详情')
}

function handleViewFile(record: any) {
  Message.info('下载发票附件')
}

function handleSearch() {
  Message.success('查询完成')
}

function handleReset() {
  searchForm.value = {
    invoiceNo: '',
    orderNo: '',
    buyerId: '',
    status: '',
  }
}
</script>

<style scoped lang="less">
.invoice-output-page {
  .stat-row {
    margin-bottom: 16px;
  }
  
  .search-form {
    margin-top: 16px;
  }
  
  .amount {
    font-weight: 600;
  }
  
  .upload-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}
</style>
