<template>
  <div class="invoice-manage">
    <a-card>
      <template #extra>
        <a-space>
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
          </a-form-item>
        </a-form>

        <a-table :data="outputInvoiceList" :pagination="pagination" class="mt-16">
          <template #columns>
            <a-table-column title="发票号码" data-index="invoiceNo" :width="180" />
            <a-table-column title="购方名称" data-index="buyerName" :width="180" />
            <a-table-column title="关联订单" data-index="orderNo" :width="150" />
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
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewOutput(record)">查看</a-button>
                  <a-button v-if="record.status === 'pending'" type="text" size="small" status="success" @click="handleIssueOutput(record)">开票</a-button>
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
                  <a-button type="text" size="small" @click="handleViewInput(record)">查看</a-button>
                  <a-button v-if="record.status === 'pending'" type="text" size="small" status="success" @click="handleVerifyInput(record)">核验</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const outputInvoiceList = ref([
  { id: '1', invoiceNo: 'OUT202401150001', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401150001', amount: '79,245.28', taxAmount: '10,301.49', totalAmount: '89,546.77', invoiceDate: '2024-01-15', status: 'issued' },
  { id: '2', invoiceNo: 'OUT202401140001', buyerName: '广州天河工程仓', orderNo: 'PO202401140001', amount: '48,679.25', taxAmount: '6,328.30', totalAmount: '55,007.55', invoiceDate: '2024-01-14', status: 'issued' },
  { id: '3', invoiceNo: '-', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401120001', amount: '119,811.32', taxAmount: '15,575.47', totalAmount: '135,386.79', invoiceDate: '-', status: 'pending' },
  { id: '4', invoiceNo: 'OUT202401110001', buyerName: '广州天河工程仓', orderNo: 'PO202401110001', amount: '42,641.51', taxAmount: '5,543.40', totalAmount: '48,184.91', invoiceDate: '2024-01-11', status: 'void' },
  { id: '5', invoiceNo: 'OUT202401100001', buyerName: '深圳湾科技园项目仓', orderNo: 'PO202401100001', amount: '35,849.06', taxAmount: '4,660.38', totalAmount: '40,509.44', invoiceDate: '2024-01-10', status: 'issued' },
])

const inputInvoiceList = ref([
  { id: '1', invoiceNo: 'IN202401150001', sellerName: '原材料供应商A', amount: '75,471.70', taxAmount: '9,811.32', totalAmount: '85,283.02', invoiceDate: '2024-01-15', status: 'verified' },
  { id: '2', invoiceNo: 'IN202401140001', sellerName: '原材料供应商B', amount: '52,830.19', taxAmount: '6,867.92', totalAmount: '59,698.11', invoiceDate: '2024-01-14', status: 'pending' },
  { id: '3', invoiceNo: 'IN202401130001', sellerName: '原材料供应商A', amount: '38,679.25', taxAmount: '5,028.30', totalAmount: '43,707.55', invoiceDate: '2024-01-13', status: 'verified' },
  { id: '4', invoiceNo: 'IN202401120001', sellerName: '原材料供应商C', amount: '28,301.89', taxAmount: '3,679.25', totalAmount: '31,981.14', invoiceDate: '2024-01-12', status: 'pending' },
])

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

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleInputSearch() {
  Message.info('查询功能开发中')
}

function handleViewOutput(record: any) {
  Message.info(`查看发票: ${record.invoiceNo || '待开票'}`)
}

function handleIssueOutput(record: any) {
  Message.success('开票成功')
}

function handleViewInput(record: any) {
  Message.info(`查看发票: ${record.invoiceNo}`)
}

function handleVerifyInput(record: any) {
  Message.success(`发票 ${record.invoiceNo} 已核验`)
}

function handleExport() {
  Message.info('导出功能开发中')
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
