<template>
  <div class="finance-payment">
    <a-page-header title="支付记录" />

    <a-row :gutter="16" class="mt-16">
      <a-col :span="6">
        <a-statistic title="待支付订单" :value="stats.pending" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月支付笔数" :value="stats.monthCount" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月支付金额" :value="stats.monthAmount" prefix="¥" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="累计手续费" :value="stats.totalFee" prefix="¥" />
      </a-col>
    </a-row>

    <a-card class="mt-16">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="支付状态">
          <a-select v-model="searchForm.status" allow-clear placeholder="全部" style="width: 140px">
            <a-option value="pending">待支付</a-option>
            <a-option value="success">支付成功</a-option>
            <a-option value="failed">支付失败</a-option>
            <a-option value="refunded">已退款</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="支付方式">
          <a-select v-model="searchForm.payMethod" allow-clear placeholder="全部" style="width: 140px">
            <a-option value="bank">对公转账</a-option>
            <a-option value="wechat">微信支付</a-option>
            <a-option value="alipay">支付宝</a-option>
            <a-option value="balance">余额支付</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="支付流水号">
          <a-input v-model="searchForm.payNo" placeholder="请输入流水号" style="width: 200px" />
        </a-form-item>
        <a-form-item label="订单号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入订单号" style="width: 200px" />
        </a-form-item>
        <a-form-item label="支付时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport">
              <template #icon><icon-download /></template>
              导出
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table :data="paymentList" :pagination="{ pageSize: 10 }" class="mt-16">
        <template #columns>
          <a-table-column title="支付流水号" data-index="payNo" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.payNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPayMethodColor(record.payMethod)">
                {{ getPayMethodText(record.payMethod) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPayStatusColor(record.status)">
                {{ getPayStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="手续费" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.fee?.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="实际到账" :width="120" align="right">
            <template #cell="{ record }">
              <span class="actual">¥{{ (record.amount - record.fee)?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="付款方" data-index="payerName" :width="150" ellipsis />
          <a-table-column title="支付时间" data-index="payTime" :width="160" />
          <a-table-column title="到账时间" data-index="arrivalTime" :width="160" />
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>
                <a-link v-if="record.status === 'success'" @click="handleDownloadReceipt(record)">回单</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="detailVisible"
      title="支付详情"
      :width="600"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="支付流水号" :span="2">{{ currentPayment.payNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentPayment.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ getPayMethodText(currentPayment.payMethod) }}</a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPayStatusColor(currentPayment.status)">
            {{ getPayStatusText(currentPayment.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付金额">
          <span class="amount">¥{{ currentPayment.amount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="手续费">¥{{ currentPayment.fee?.toFixed(2) }}</a-descriptions-item>
        <a-descriptions-item label="实际到账金额" :span="2">
          <span class="actual">¥{{ (currentPayment.amount - currentPayment.fee)?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="付款方" :span="2">{{ currentPayment.payerName }}</a-descriptions-item>
        <a-descriptions-item label="付款账户">{{ currentPayment.payerAccount }}</a-descriptions-item>
        <a-descriptions-item label="收款账户">{{ currentPayment.payeeAccount }}</a-descriptions-item>
        <a-descriptions-item label="支付时间" :span="2">{{ currentPayment.payTime }}</a-descriptions-item>
        <a-descriptions-item label="到账时间" :span="2">{{ currentPayment.arrivalTime }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentPayment.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <div class="text-right mt-16">
        <a-space>
          <a-button @click="detailVisible = false">关闭</a-button>
          <a-button type="primary" @click="handleDownloadReceipt(currentPayment)">
            <template #icon><icon-download /></template>
            下载回单
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  status: '',
  payMethod: '',
  payNo: '',
  orderNo: '',
  dateRange: [],
})

const stats = ref({
  pending: 3,
  monthCount: 28,
  monthAmount: 896500,
  totalFee: 2865.5,
})

const paymentList = ref([
  {
    id: '1',
    payNo: 'PAY20240115000001',
    orderNo: 'PO202401150001',
    payMethod: 'bank',
    status: 'success',
    amount: 85000,
    fee: 0,
    payerName: '深圳湾科技园区项目工程部',
    payerAccount: '中国工商银行 6222 **** 8888',
    payeeAccount: '中国工商银行深圳分行 6000 0123 4567 8901',
    payTime: '2024-01-15 16:30:00',
    arrivalTime: '2024-01-15 16:35:00',
    remark: '水泥订单货款',
  },
  {
    id: '2',
    payNo: 'PAY20240114000001',
    orderNo: 'PO202401140002',
    payMethod: 'balance',
    status: 'success',
    amount: 52300,
    fee: 26.15,
    payerName: '华润置地深圳有限公司',
    payerAccount: '托管账户 8888 **** 7777',
    payeeAccount: '中国工商银行深圳分行 6000 0123 4567 8901',
    payTime: '2024-01-14 10:15:00',
    arrivalTime: '2024-01-14 10:15:00',
    remark: '钢筋订单货款',
  },
  {
    id: '3',
    payNo: 'PAY20240113000001',
    orderNo: 'PO202401130003',
    payMethod: 'wechat',
    status: 'success',
    amount: 12800,
    fee: 76.8,
    payerName: '万科建筑工程有限公司',
    payerAccount: '微信支付',
    payeeAccount: '中国工商银行深圳分行 6000 0123 4567 8901',
    payTime: '2024-01-13 14:20:00',
    arrivalTime: '2024-01-14 00:30:00',
    remark: '砂石样品订单',
  },
  {
    id: '4',
    payNo: 'PAY20240112000001',
    orderNo: 'PO202401120004',
    payMethod: 'alipay',
    status: 'success',
    amount: 8600,
    fee: 51.6,
    payerName: '碧桂园广东项目部',
    payerAccount: '支付宝',
    payeeAccount: '中国工商银行深圳分行 6000 0123 4567 8901',
    payTime: '2024-01-12 09:30:00',
    arrivalTime: '2024-01-13 00:30:00',
    remark: '管材订单',
  },
  {
    id: '5',
    payNo: 'PAY20240111000001',
    orderNo: 'PO202401110005',
    payMethod: 'bank',
    status: 'pending',
    amount: 156000,
    fee: 0,
    payerName: '保利地产深圳公司',
    payerAccount: '-',
    payeeAccount: '中国工商银行深圳分行 6000 0123 4567 8901',
    payTime: '-',
    arrivalTime: '-',
    remark: '大额订单货款',
  },
])

const detailVisible = ref(false)
const currentPayment = ref<any>({})

function getPayMethodText(method: string) {
  const map: Record<string, string> = {
    bank: '对公转账',
    wechat: '微信支付',
    alipay: '支付宝',
    balance: '余额支付',
  }
  return map[method] || method
}

function getPayMethodColor(method: string) {
  const map: Record<string, string> = {
    bank: 'blue',
    wechat: 'green',
    alipay: 'arcoblue',
    balance: 'purple',
  }
  return map[method] || 'gray'
}

function getPayStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待支付',
    success: '支付成功',
    failed: '支付失败',
    refunded: '已退款',
  }
  return map[status] || status
}

function getPayStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    success: 'green',
    failed: 'red',
    refunded: 'gray',
  }
  return map[status] || 'gray'
}

function handleSearch() {
  Message.success('搜索条件已应用')
}

function handleReset() {
  searchForm.value = {
    status: '',
    payMethod: '',
    payNo: '',
    orderNo: '',
    dateRange: [],
  }
}

function handleExport() {
  Message.success('导出任务已提交，请等待下载完成')
}

function handleViewDetail(record: any) {
  currentPayment.value = record
  detailVisible.value = true
}

function handleDownloadReceipt(record: any) {
  Message.success('回单PDF正在下载中...')
}
</script>

<style scoped>
.finance-payment {
  padding: 16px;
}
.mt-16 {
  margin-top: 16px;
}
.text-right {
  text-align: right;
}
.amount {
  font-weight: 600;
  color: #1d2129;
}
.actual {
  font-weight: 600;
  color: #00b42a;
}
</style>
