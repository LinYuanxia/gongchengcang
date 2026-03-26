<template>
  <div class="invoice-manage">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleApplyInvoice">
            <template #icon><icon-plus /></template>
            申请开票
          </a-button>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="output" title="销项发票" />
        <a-tab-pane key="input" title="进项发票" />
      </a-tabs>

      <div v-if="activeTab === 'output'">
        <a-row :gutter="16" class="stat-row">
          <a-col :span="6">
            <a-statistic title="本月开票金额" :value="325000" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月开票税额" :value="42250" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="待开票金额" :value="58500" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月开票数" :value="15" suffix="张" />
          </a-col>
        </a-row>

        <a-form :model="searchForm" layout="inline" class="search-form mt-16">
          <a-form-item label="发票号码">
            <a-input v-model="searchForm.invoiceNo" placeholder="请输入发票号码" allow-clear style="width: 180px" />
          </a-form-item>
          <a-form-item label="购方">
            <a-select v-model="searchForm.buyerId" placeholder="全部" allow-clear style="width: 150px">
              <a-option value="w1">深圳湾科技园项目仓</a-option>
              <a-option value="w2">广州天河工程仓</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="开票状态">
            <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
              <a-option value="pending">待开票</a-option>
              <a-option value="issued">已开票</a-option>
              <a-option value="void">已作废</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>

        <a-table :data="outputInvoiceList" :pagination="pagination" class="mt-16">
          <template #columns>
            <a-table-column title="发票号码" :width="180">
              <template #cell="{ record }">
                {{ record.invoiceNo || '-' }}
              </template>
            </a-table-column>
            <a-table-column title="购方名称" data-index="buyerName" :width="180" />
            <a-table-column title="关联订单" :width="150">
              <template #cell="{ record }">
                <a-link @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
              </template>
            </a-table-column>
            <a-table-column title="金额(不含税)" :width="120" align="right">
              <template #cell="{ record }">¥{{ record.amount }}</template>
            </a-table-column>
            <a-table-column title="税额" :width="100" align="right">
              <template #cell="{ record }">¥{{ record.taxAmount }}</template>
            </a-table-column>
            <a-table-column title="价税合计" :width="120" align="right">
              <template #cell="{ record }">
                <span class="total">¥{{ record.totalAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="开票日期" data-index="invoiceDate" :width="120" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getOutputStatusColor(record.status)">
                  {{ getOutputStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-link @click="handleViewOutput(record)">查看</a-link>
                  <a-link v-if="record.status === 'pending'" @click="handleIssueOutput(record)">开票</a-link>
                  <a-link v-if="record.status === 'issued'" @click="handleDownloadInvoice(record)">下载</a-link>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div v-if="activeTab === 'input'">
        <a-row :gutter="16" class="stat-row">
          <a-col :span="6">
            <a-statistic title="本月进项金额" :value="185000" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="本月进项税额" :value="24050" :precision="2">
              <template #prefix>¥</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="待核验发票" :value="3" suffix="张" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="发票总数" :value="12" suffix="张" />
          </a-col>
        </a-row>

        <a-form :model="inputSearchForm" layout="inline" class="search-form mt-16">
          <a-form-item label="发票号码">
            <a-input v-model="inputSearchForm.invoiceNo" placeholder="请输入发票号码" allow-clear style="width: 180px" />
          </a-form-item>
          <a-form-item label="核验状态">
            <a-select v-model="inputSearchForm.status" placeholder="全部" allow-clear style="width: 120px">
              <a-option value="pending">待核验</a-option>
              <a-option value="verified">已核验</a-option>
              <a-option value="invalid">已作废</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleInputSearch">查询</a-button>
          </a-form-item>
        </a-form>

        <a-table :data="inputInvoiceList" :pagination="inputPagination" class="mt-16">
          <template #columns>
            <a-table-column title="发票号码" data-index="invoiceNo" :width="180" />
            <a-table-column title="销方名称" data-index="sellerName" :width="180" />
            <a-table-column title="金额(不含税)" :width="120" align="right">
              <template #cell="{ record }">¥{{ record.amount }}</template>
            </a-table-column>
            <a-table-column title="税额" :width="100" align="right">
              <template #cell="{ record }">¥{{ record.taxAmount }}</template>
            </a-table-column>
            <a-table-column title="价税合计" :width="120" align="right">
              <template #cell="{ record }">
                <span class="total">¥{{ record.totalAmount }}</span>
              </template>
            </a-table-column>
            <a-table-column title="开票日期" data-index="invoiceDate" :width="120" />
            <a-table-column title="核验状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getInputStatusColor(record.status)">
                  {{ getInputStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-link @click="handleViewInput(record)">查看</a-link>
                  <a-link v-if="record.status === 'pending'" @click="handleVerifyInput(record)">核验</a-link>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="applyModalVisible"
      title="申请开票"
      :width="900"
      @ok="handleApplyConfirm"
      @cancel="cancelApply"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>选择需要开票的订单，系统将自动生成发票申请</div>
        </template>
      </a-alert>

      <a-form :model="applyForm" layout="vertical">
        <a-form-item label="选择订单" required>
          <a-table 
            :data="pendingOrders" 
            :pagination="false"
            :row-selection="rowSelection"
            v-model:selectedKeys="selectedOrderKeys"
          >
            <template #columns>
              <a-table-column title="订单编号" data-index="orderNo" :width="150" />
              <a-table-column title="采购方" data-index="buyerName" :width="180" />
              <a-table-column title="订单金额" :width="120" align="right">
                <template #cell="{ record }">
                  ¥{{ record.totalAmount }}
                </template>
              </a-table-column>
              <a-table-column title="订单状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getOrderStatusColor(record.status)">
                    {{ getOrderStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="开票状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.invoiceStatus === 'pending' ? 'orange' : 'green'">
                    {{ record.invoiceStatus === 'pending' ? '待开票' : '已开票' }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-divider>发票信息</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="购方名称">
              <a-input v-model="applyForm.buyerName" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="购方税号">
              <a-input v-model="applyForm.buyerTaxNo" placeholder="请输入购方税号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开票金额(不含税)">
              <a-input-number v-model="applyForm.amount" :precision="2" disabled style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="税额">
              <a-input-number v-model="applyForm.taxAmount" :precision="2" disabled style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发票类型">
              <a-select v-model="applyForm.invoiceType" style="width: 100%">
                <a-option value="增值税专用发票">增值税专用发票</a-option>
                <a-option value="增值税普通发票">增值税普通发票</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="税率">
              <a-select v-model="applyForm.taxRate" style="width: 100%">
                <a-option :value="0.13">13%</a-option>
                <a-option :value="0.09">9%</a-option>
                <a-option :value="0.06">6%</a-option>
                <a-option :value="0.03">3%</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="备注">
          <a-textarea v-model="applyForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="issueModalVisible"
      title="开票"
      :width="700"
      @ok="handleIssueConfirm"
      @cancel="cancelIssue"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="购方名称">{{ currentInvoice.buyerName }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentInvoice.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="金额(不含税)">¥{{ currentInvoice.amount }}</a-descriptions-item>
        <a-descriptions-item label="税额">¥{{ currentInvoice.taxAmount }}</a-descriptions-item>
        <a-descriptions-item label="价税合计">
          <span class="total">¥{{ currentInvoice.totalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="发票类型">增值税专用发票</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-form :model="issueForm" layout="vertical">
        <a-form-item label="发票号码" required>
          <a-input v-model="issueForm.invoiceNo" placeholder="请输入发票号码" />
        </a-form-item>
        <a-form-item label="开票日期" required>
          <a-date-picker v-model="issueForm.invoiceDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="上传发票">
          <a-upload
            :file-list="issueForm.fileList"
            :limit="1"
            accept=".pdf,.jpg,.png"
          >
            <template #upload-button>
              <a-button>
                <template #icon><icon-upload /></template>
                上传发票文件
              </a-button>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="detailModalVisible"
      title="发票详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="发票号码">{{ currentInvoice.invoiceNo }}</a-descriptions-item>
        <a-descriptions-item label="发票类型">{{ currentInvoice.invoiceType || '增值税专用发票' }}</a-descriptions-item>
        <a-descriptions-item label="购方名称">{{ currentInvoice.buyerName }}</a-descriptions-item>
        <a-descriptions-item label="购方税号">{{ currentInvoice.buyerTaxNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="金额(不含税)">¥{{ currentInvoice.amount }}</a-descriptions-item>
        <a-descriptions-item label="税额">¥{{ currentInvoice.taxAmount }}</a-descriptions-item>
        <a-descriptions-item label="价税合计">
          <span class="total">¥{{ currentInvoice.totalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="税率">{{ currentInvoice.taxRate || '13%' }}</a-descriptions-item>
        <a-descriptions-item label="开票日期">{{ currentInvoice.invoiceDate }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentInvoice.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="状态" :span="2">
          <a-tag :color="getOutputStatusColor(currentInvoice.status)">
            {{ getOutputStatusText(currentInvoice.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentInvoice.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('output')

const searchForm = ref({
  invoiceNo: '',
  buyerId: '',
  status: '',
})

const inputSearchForm = ref({
  invoiceNo: '',
  status: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const inputPagination = ref({
  current: 1,
  pageSize: 10,
  total: 30,
})

const allOutputInvoiceList = ref([
  { id: '1', invoiceNo: 'OUT202401150001', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401150001', amount: '79,245.28', taxAmount: '10,301.49', totalAmount: '89,546.77', invoiceDate: '2024-01-15', status: 'issued', invoiceType: '增值税专用发票', buyerTaxNo: '91440300MA5DQ123XX', taxRate: '13%', remark: '' },
  { id: '2', invoiceNo: 'OUT202401140001', buyerName: '广州天河工程仓', orderNo: 'PO202401140001', amount: '48,679.25', taxAmount: '6,328.30', totalAmount: '55,007.55', invoiceDate: '2024-01-14', status: 'issued', invoiceType: '增值税专用发票', buyerTaxNo: '91440100MA5DQ456XX', taxRate: '13%', remark: '' },
  { id: '3', invoiceNo: '', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401120001', amount: '119,811.32', taxAmount: '15,575.47', totalAmount: '135,386.79', invoiceDate: '', status: 'pending', invoiceType: '增值税专用发票', buyerTaxNo: '91440300MA5DQ123XX', taxRate: '13%', remark: '' },
  { id: '4', invoiceNo: 'OUT202401110001', buyerName: '广州天河工程仓', orderNo: 'PO202401110001', amount: '42,641.51', taxAmount: '5,543.40', totalAmount: '48,184.91', invoiceDate: '2024-01-11', status: 'void', invoiceType: '增值税专用发票', buyerTaxNo: '91440100MA5DQ456XX', taxRate: '13%', remark: '已作废' },
  { id: '5', invoiceNo: 'OUT202401100001', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401100001', amount: '35,849.06', taxAmount: '4,660.38', totalAmount: '40,509.44', invoiceDate: '2024-01-10', status: 'issued', invoiceType: '增值税专用发票', buyerTaxNo: '91440300MA5DQ123XX', taxRate: '13%', remark: '' },
])

const outputInvoiceList = ref([...allOutputInvoiceList.value])

const allInputInvoiceList = ref([
  { id: '1', invoiceNo: 'IN202401150001', sellerName: '原材料供应商A', amount: '75,471.70', taxAmount: '9,811.32', totalAmount: '85,283.02', invoiceDate: '2024-01-15', status: 'verified' },
  { id: '2', invoiceNo: 'IN202401140001', sellerName: '原材料供应商B', amount: '52,830.19', taxAmount: '6,867.92', totalAmount: '59,698.11', invoiceDate: '2024-01-14', status: 'pending' },
  { id: '3', invoiceNo: 'IN202401130001', sellerName: '原材料供应商A', amount: '38,679.25', taxAmount: '5,028.30', totalAmount: '43,707.55', invoiceDate: '2024-01-13', status: 'verified' },
  { id: '4', invoiceNo: 'IN202401120001', sellerName: '原材料供应商C', amount: '28,301.89', taxAmount: '3,679.25', totalAmount: '31,981.14', invoiceDate: '2024-01-12', status: 'pending' },
])

const inputInvoiceList = ref([...allInputInvoiceList.value])

const pendingOrders = ref([
  { id: '1', orderNo: 'PO202401160001', buyerName: '深圳湾科技园项目仓', totalAmount: '205,000.00', status: 'received', invoiceStatus: 'pending' },
  { id: '2', orderNo: 'PO202401150002', buyerName: '广州天河工程仓', totalAmount: '82,000.00', status: 'received', invoiceStatus: 'pending' },
  { id: '3', orderNo: 'PO202401140002', buyerName: '深圳湾科技园项目仓', totalAmount: '45,600.00', status: 'received', invoiceStatus: 'pending' },
])

const selectedOrderKeys = ref<string[]>([])
const rowSelection = ref({
  type: 'checkbox',
  showCheckedAll: true,
})

const applyModalVisible = ref(false)
const applyForm = ref({
  buyerName: '',
  buyerTaxNo: '',
  amount: 0,
  taxAmount: 0,
  invoiceType: '增值税专用发票',
  taxRate: 0.13,
  remark: '',
})

const issueModalVisible = ref(false)
const issueForm = ref({
  invoiceNo: '',
  invoiceDate: '',
  fileList: [],
})

const detailModalVisible = ref(false)
const currentInvoice = ref<any>({})

function getOutputStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    issued: 'green',
    void: 'gray',
  }
  return colorMap[status] || 'gray'
}

function getOutputStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待开票',
    issued: '已开票',
    void: '已作废',
  }
  return textMap[status] || status
}

function getInputStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    verified: 'green',
    invalid: 'gray',
  }
  return colorMap[status] || 'gray'
}

function getInputStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待核验',
    verified: '已核验',
    invalid: '已作废',
  }
  return textMap[status] || status
}

function getOrderStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    received: 'green',
    completed: 'green',
  }
  return colorMap[status] || 'gray'
}

function getOrderStatusText(status: string) {
  const textMap: Record<string, string> = {
    received: '已收货',
    completed: '已完成',
  }
  return textMap[status] || status
}

function handleSearch() {
  let filtered = [...allOutputInvoiceList.value]
  
  if (searchForm.value.invoiceNo) {
    filtered = filtered.filter(item => 
      item.invoiceNo.includes(searchForm.value.invoiceNo) || 
      item.orderNo.includes(searchForm.value.invoiceNo)
    )
  }
  
  if (searchForm.value.buyerId) {
    filtered = filtered.filter(item => 
      item.buyerName.includes(searchForm.value.buyerId)
    )
  }
  
  if (searchForm.value.status) {
    filtered = filtered.filter(item => item.status === searchForm.value.status)
  }
  
  outputInvoiceList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    invoiceNo: '',
    buyerId: '',
    status: '',
  }
  outputInvoiceList.value = [...allOutputInvoiceList.value]
  pagination.value.total = allOutputInvoiceList.value.length
}

function handleInputSearch() {
  let filtered = [...allInputInvoiceList.value]
  
  if (inputSearchForm.value.invoiceNo) {
    filtered = filtered.filter(item => 
      item.invoiceNo.includes(inputSearchForm.value.invoiceNo)
    )
  }
  
  if (inputSearchForm.value.status) {
    filtered = filtered.filter(item => item.status === inputSearchForm.value.status)
  }
  
  inputInvoiceList.value = filtered
  inputPagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleApplyInvoice() {
  selectedOrderKeys.value = []
  applyForm.value = {
    buyerName: '',
    buyerTaxNo: '',
    amount: 0,
    taxAmount: 0,
    invoiceType: '增值税专用发票',
    taxRate: 0.13,
    remark: '',
  }
  applyModalVisible.value = true
}

async function handleApplyConfirm() {
  if (selectedOrderKeys.value.length === 0) {
    Message.warning('请至少选择一个订单')
    return
  }

  if (!applyForm.value.buyerTaxNo) {
    Message.warning('请输入购方税号')
    return
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const invoiceNo = `OUT${Date.now()}`
    outputInvoiceList.value.unshift({
      id: Date.now().toString(),
      invoiceNo: '',
      buyerName: applyForm.value.buyerName,
      orderNo: selectedOrderKeys.value.join(', '),
      amount: applyForm.value.amount.toFixed(2),
      taxAmount: applyForm.value.taxAmount.toFixed(2),
      totalAmount: (applyForm.value.amount + applyForm.value.taxAmount).toFixed(2),
      invoiceDate: '',
      status: 'pending',
      invoiceType: applyForm.value.invoiceType,
      buyerTaxNo: applyForm.value.buyerTaxNo,
      taxRate: `${(applyForm.value.taxRate * 100).toFixed(0)}%`,
      remark: applyForm.value.remark,
    })

    applyModalVisible.value = false
    Message.success('开票申请成功')
  } catch (error) {
    Message.error('开票申请失败，请重试')
  }
}

function cancelApply() {
  applyModalVisible.value = false
}

function handleViewOutput(record: any) {
  currentInvoice.value = record
  detailModalVisible.value = true
}

function handleIssueOutput(record: any) {
  currentInvoice.value = record
  issueForm.value = {
    invoiceNo: '',
    invoiceDate: '',
    fileList: [],
  }
  issueModalVisible.value = true
}

async function handleIssueConfirm() {
  if (!issueForm.value.invoiceNo) {
    Message.warning('请输入发票号码')
    return
  }

  if (!issueForm.value.invoiceDate) {
    Message.warning('请选择开票日期')
    return
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const invoice = outputInvoiceList.value.find(i => i.id === currentInvoice.value.id)
    if (invoice) {
      invoice.invoiceNo = issueForm.value.invoiceNo
      invoice.invoiceDate = issueForm.value.invoiceDate
      invoice.status = 'issued'
    }

    issueModalVisible.value = false
    Message.success('开票成功')
  } catch (error) {
    Message.error('开票失败，请重试')
  }
}

function cancelIssue() {
  issueModalVisible.value = false
}

function handleDownloadInvoice(record: any) {
  Message.info(`下载发票：${record.invoiceNo}`)
}

function handleViewOrder(record: any) {
  Message.info(`查看订单：${record.orderNo}`)
}

function handleViewInput(record: any) {
  Message.info(`查看发票: ${record.invoiceNo}`)
}

function handleVerifyInput(record: any) {
  Message.success(`发票 ${record.invoiceNo} 已核验`)
}

function handleExport() {
  if (outputInvoiceList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${outputInvoiceList.value.length} 条发票记录`)
}
</script>

<style scoped lang="less">
.invoice-manage {
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

.total {
  font-weight: 600;
  color: #165dff;
}
</style>
