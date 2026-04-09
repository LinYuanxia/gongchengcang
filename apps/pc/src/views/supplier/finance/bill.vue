<template>
  <div class="finance-bill">
    <a-page-header title="票据管理" />

    <a-row :gutter="16" class="mt-16">
      <a-col :span="6">
        <a-statistic title="应收账款" :value="stats.receivable" prefix="¥" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="应付账款" :value="stats.payable" prefix="¥" :value-style="{ color: '#0e42d2' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="30天以上账龄" :value="stats.over30Days" prefix="¥" :value-style="{ color: '#ff7d00' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="坏账预警" :value="stats.badDebtWarning" :value-style="{ color: '#f53f3f' }" />
      </a-col>
    </a-row>

    <a-card class="mt-16">
      <a-space>
        <a-button type="primary" @click="handleAddReceivable">
          <template #icon><icon-plus /></template>
          登记应收
        </a-button>
        <a-button @click="handleAddPayable">
          <template #icon><icon-plus /></template>
          登记应付
        </a-button>
      </a-space>

      <a-tabs v-model:active-tab="activeTab" class="mt-16">
        <a-tab-pane key="receivable" title="应收账款">
          <a-alert v-if="stats.over30Days > 0" type="warning" style="margin-bottom: 16px">
            有 ¥{{ stats.over30Days.toLocaleString() }} 账款账龄超过30天，请及时催收
          </a-alert>

          <a-table :data="receivableList" :pagination="{ pageSize: 10 }">
            <template #columns>
              <a-table-column title="应收单号" data-index="billNo" :width="160">
                <template #cell="{ record }">
                  <a-link>{{ record.billNo }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="关联订单" :width="160">
                <template #cell="{ record }">
                  <a-link>{{ record.orderNo }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="应收金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="amount-receivable">¥{{ record.amount?.toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="已收金额" :width="120" align="right">
                <template #cell="{ record }">
                  ¥{{ record.receivedAmount?.toLocaleString() }}
                </template>
              </a-table-column>
              <a-table-column title="未收金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="amount-unpaid" v-if="record.amount - record.receivedAmount > 0">
                    ¥{{ (record.amount - record.receivedAmount)?.toLocaleString() }}
                  </span>
                  <span v-else class="amount-paid">¥0.00</span>
                </template>
              </a-table-column>
              <a-table-column title="账龄(天)" :width="100" align="center">
                <template #cell="{ record }">
                  <a-tag :color="getAgingColor(record.aging)">
                    {{ record.aging }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="到期日期" data-index="dueDate" :width="120" />
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getBillStatusColor(record.status)">
                    {{ getBillStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="150" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-link v-if="record.status !== 'paid'" @click="handleReceive(record)">收款</a-link>
                    <a-link @click="handleView(record)">详情</a-link>
                    <a-link @click="handleRemind(record)" v-if="record.aging >= 15">催收</a-link>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="payable" title="应付账款">
          <a-table :data="payableList" :pagination="{ pageSize: 10 }">
            <template #columns>
              <a-table-column title="应付单号" data-index="billNo" :width="160">
                <template #cell="{ record }">
                  <a-link>{{ record.billNo }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="供应商" data-index="supplierName" :width="180" ellipsis />
              <a-table-column title="应付金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="amount-payable">¥{{ record.amount?.toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="已付金额" :width="120" align="right">
                ¥{{ record.paidAmount?.toLocaleString() }}
              </a-table-column>
              <a-table-column title="未付金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="amount-unpaid" v-if="record.amount - record.paidAmount > 0">
                    ¥{{ (record.amount - record.paidAmount)?.toLocaleString() }}
                  </span>
                  <span v-else class="amount-paid">¥0.00</span>
                </template>
              </a-table-column>
              <a-table-column title="应付日期" data-index="dueDate" :width="120" />
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getBillStatusColor(record.status)">
                    {{ getBillStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="120" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-link v-if="record.status !== 'paid'" @click="handlePay(record)">付款</a-link>
                    <a-link @click="handleView(record)">详情</a-link>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:visible="receiveVisible"
      title="登记收款"
      :width="500"
      @ok="handleReceiveConfirm"
      @cancel="receiveVisible = false"
    >
      <a-descriptions :column="2" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="应收单号">{{ currentBill.billNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentBill.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="应收总额">¥{{ currentBill.amount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="已收金额">¥{{ currentBill.receivedAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="待收金额" :span="2">
          <span class="amount-unpaid">¥{{ (currentBill.amount - currentBill.receivedAmount)?.toLocaleString() }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-form :model="receiveForm" layout="vertical">
        <a-form-item label="收款金额" required>
          <a-input-number
            v-model="receiveForm.amount"
            :min="0.01"
            :max="currentBill.amount - currentBill.receivedAmount"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="收款方式" required>
          <a-select v-model="receiveForm.payMethod" style="width: 100%">
            <a-option value="bank">银行转账</a-option>
            <a-option value="wechat">微信</a-option>
            <a-option value="alipay">支付宝</a-option>
            <a-option value="bill">承兑汇票</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="收款日期" required>
          <a-date-picker v-model="receiveForm.payDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="receiveForm.remark" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('receivable')
const stats = ref({
  receivable: 328500,
  payable: 86000,
  over30Days: 85000,
  badDebtWarning: 2,
})

const receivableList = ref([
  {
    id: '1',
    billNo: 'REC202401001',
    orderNo: 'PO202401150001',
    amount: 85000,
    receivedAmount: 0,
    aging: 5,
    dueDate: '2024-02-15',
    status: 'unpaid',
  },
  {
    id: '2',
    billNo: 'REC202401002',
    orderNo: 'PO202401100002',
    amount: 128000,
    receivedAmount: 50000,
    aging: 22,
    dueDate: '2024-02-10',
    status: 'partial',
  },
  {
    id: '3',
    billNo: 'REC202401003',
    orderNo: 'PO202401050003',
    amount: 85000,
    receivedAmount: 85000,
    aging: 45,
    dueDate: '2024-02-05',
    status: 'paid',
  },
  {
    id: '4',
    billNo: 'REC202401004',
    orderNo: 'PO202401010004',
    amount: 85000,
    receivedAmount: 0,
    aging: 38,
    dueDate: '2024-02-01',
    status: 'overdue',
  },
])

const payableList = ref([
  {
    id: '1',
    billNo: 'PAY202401001',
    supplierName: '南方水泥有限公司',
    amount: 56000,
    paidAmount: 0,
    dueDate: '2024-02-20',
    status: 'unpaid',
  },
  {
    id: '2',
    billNo: 'PAY202401002',
    supplierName: '宝钢钢材贸易有限公司',
    amount: 30000,
    paidAmount: 30000,
    dueDate: '2024-02-10',
    status: 'paid',
  },
])

const receiveVisible = ref(false)
const currentBill = ref<any>({})
const receiveForm = ref({
  amount: 0,
  payMethod: 'bank',
  payDate: '',
  remark: '',
})

function getAgingColor(aging: number) {
  if (aging < 15) return 'green'
  if (aging < 30) return 'orange'
  return 'red'
}

function getBillStatusText(status: string) {
  const map: Record<string, string> = {
    unpaid: '未结清',
    partial: '部分结清',
    paid: '已结清',
    overdue: '已逾期',
  }
  return map[status] || status
}

function getBillStatusColor(status: string) {
  const map: Record<string, string> = {
    unpaid: 'orange',
    partial: 'blue',
    paid: 'green',
    overdue: 'red',
  }
  return map[status] || 'gray'
}

function handleAddReceivable() {
  Message.info('登记应收账款')
}

function handleAddPayable() {
  Message.info('登记应付账款')
}

function handleReceive(record: any) {
  currentBill.value = record
  receiveForm.value.amount = record.amount - record.receivedAmount
  receiveVisible.value = true
}

function handleReceiveConfirm() {
  if (!receiveForm.value.amount) {
    Message.warning('请输入收款金额')
    return
  }

  currentBill.value.receivedAmount += receiveForm.value.amount
  if (currentBill.value.receivedAmount >= currentBill.value.amount) {
    currentBill.value.status = 'paid'
  } else {
    currentBill.value.status = 'partial'
  }

  stats.value.receivable -= receiveForm.value.amount
  receiveVisible.value = false
  Message.success('收款登记成功')
}

function handlePay(record: any) {
  Message.info('登记付款：' + record.billNo)
}

function handleView(record: any) {
  Message.info('查看票据详情：' + record.billNo)
}

function handleRemind(record: any) {
  Message.success('催收提醒已发送给客户')
}
</script>

<style scoped>
.finance-bill {
  padding: 16px;
}
.mt-16 {
  margin-top: 16px;
}
.amount-receivable {
  color: #f53f3f;
  font-weight: 600;
}
.amount-payable {
  color: #0e42d2;
  font-weight: 600;
}
.amount-unpaid {
  color: #f53f3f;
  font-weight: 600;
}
.amount-paid {
  color: #00b42a;
  font-weight: 600;
}
</style>
