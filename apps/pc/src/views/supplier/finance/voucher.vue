<template>
  <div class="finance-voucher">
    <a-page-header title="凭证管理" />

    <a-row :gutter="16" class="mt-16">
      <a-col :span="6">
        <a-statistic title="待生成凭证" :value="stats.pending" :value-style="{ color: '#f53f3f' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月凭证数" :value="stats.monthCount" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="已审核凭证" :value="stats.audited" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="附件总数" :value="stats.attachmentCount" />
      </a-col>
    </a-row>

    <a-card class="mt-16">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="凭证状态">
          <a-select v-model="searchForm.status" allow-clear placeholder="全部" style="width: 140px">
            <a-option value="pending">待审核</a-option>
            <a-option value="audited">已审核</a-option>
            <a-option value="posted">已过账</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="凭证类型">
          <a-select v-model="searchForm.type" allow-clear placeholder="全部" style="width: 140px">
            <a-option value="receive">收款凭证</a-option>
            <a-option value="pay">付款凭证</a-option>
            <a-option value="transfer">转账凭证</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="凭证号">
          <a-input v-model="searchForm.voucherNo" placeholder="请输入凭证号" style="width: 200px" />
        </a-form-item>
        <a-form-item label="制单日期">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" status="success" @click="handleAutoGenerate">
              <template #icon><icon-magic /></template>
              自动生成凭证
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table :data="voucherList" :pagination="{ pageSize: 10 }" class="mt-16">
        <template #columns>
          <a-table-column title="凭证号" data-index="voucherNo" :width="140">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.voucherNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="凭证类型" :width="100">
            <template #cell="{ record }">
              {{ getVoucherTypeText(record.type) }}
            </template>
          </a-table-column>
          <a-table-column title="摘要" data-index="summary" :width="250" ellipsis />
          <a-table-column title="借方金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="debit">¥{{ record.debitAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="贷方金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="credit">¥{{ record.creditAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="制单人" data-index="creator" :width="100" />
          <a-table-column title="制单日期" data-index="createDate" :width="120" />
          <a-table-column title="审核人" data-index="auditor" :width="100" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getVoucherStatusColor(record.status)">
                {{ getVoucherStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="附件" :width="80" align="center">
            <template #cell="{ record }">
              <span v-if="record.attachmentCount > 0" class="has-attachment">
                📎 {{ record.attachmentCount }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleEdit(record)" v-if="record.status === 'pending'">编辑</a-link>
                <a-link @click="handleAudit(record)" v-if="record.status === 'pending'">审核</a-link>
                <a-link @click="handlePrint(record)">打印</a-link>
                <a-dropdown @command="(cmd: string) => handleMore(cmd, record)">
                  <a-link>更多</a-link>
                  <template #content>
                    <a-doption value="upload">上传附件</a-doption>
                    <a-doption value="viewAttachment">查看附件</a-doption>
                    <a-doption value="delete" v-if="record.status === 'pending'">删除</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="detailVisible"
      title="记账凭证"
      :width="800"
    >
      <template #footer>
        <a-space>
          <a-button @click="detailVisible = false">关闭</a-button>
          <a-button type="primary" @click="handlePrint(currentVoucher)">
            <template #icon><icon-printer /></template>
            打印
          </a-button>
        </a-space>
      </template>
      <div class="voucher-header">
        <div class="voucher-title">记 账 凭 证</div>
        <div class="voucher-info">
          <span>凭证号：{{ currentVoucher.voucherNo }}</span>
          <span>制单日期：{{ currentVoucher.createDate }}</span>
          <span>附件：{{ currentVoucher.attachmentCount }} 张</span>
        </div>
      </div>

      <a-table :data="currentVoucher.entries" :pagination="false" bordered>
        <template #columns>
          <a-table-column title="摘要" data-index="summary" :width="200" />
          <a-table-column title="会计科目" data-index="subject" :width="200" />
          <a-table-column title="借方金额" data-index="debit" :width="150" align="right">
            <template #cell="{ record }">
              {{ record.debit ? '¥' + record.debit?.toLocaleString() : '' }}
            </template>
          </a-table-column>
          <a-table-column title="贷方金额" data-index="credit" :width="150" align="right">
            <template #cell="{ record }">
              {{ record.credit ? '¥' + record.credit?.toLocaleString() : '' }}
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="voucher-footer">
        <div class="voucher-total">
          <span>合计：</span>
          <span class="debit">借方 ¥{{ currentVoucher.debitAmount?.toLocaleString() }}</span>
          <span class="credit">贷方 ¥{{ currentVoucher.creditAmount?.toLocaleString() }}</span>
        </div>
        <div class="voucher-sign">
          <span>制单：{{ currentVoucher.creator }}</span>
          <span>审核：{{ currentVoucher.auditor || '-' }}</span>
          <span>记账：{{ currentVoucher.bookkeeper || '-' }}</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  status: '',
  type: '',
  voucherNo: '',
  dateRange: [],
})

const stats = ref({
  pending: 8,
  monthCount: 36,
  audited: 28,
  attachmentCount: 85,
})

const voucherList = ref([
  {
    id: '1',
    voucherNo: '记-2024-01-0036',
    type: 'receive',
    summary: '收到深圳湾科技园区项目工程款',
    debitAmount: 85000,
    creditAmount: 85000,
    creator: '张三',
    createDate: '2024-01-15',
    auditor: '李四',
    status: 'audited',
    attachmentCount: 2,
    entries: [
      { summary: '收到工程款', subject: '银行存款-工商银行', debit: 85000, credit: 0 },
      { summary: '收到工程款', subject: '主营业务收入', debit: 0, credit: 75221.24 },
      { summary: '应交税费-销项税额', subject: '应交税费-应交增值税(销项税额)', debit: 0, credit: 9778.76 },
    ],
  },
  {
    id: '2',
    voucherNo: '记-2024-01-0035',
    type: 'pay',
    summary: '支付南方水泥有限公司货款',
    debitAmount: 56000,
    creditAmount: 56000,
    creator: '张三',
    createDate: '2024-01-14',
    auditor: '',
    status: 'pending',
    attachmentCount: 1,
    entries: [
      { summary: '采购水泥', subject: '原材料-水泥', debit: 49557.52, credit: 0 },
      { summary: '应交税费-进项税额', subject: '应交税费-应交增值税(进项税额)', debit: 6442.48, credit: 0 },
      { summary: '支付货款', subject: '银行存款-工商银行', debit: 0, credit: 56000 },
    ],
  },
  {
    id: '3',
    voucherNo: '记-2024-01-0034',
    type: 'transfer',
    summary: '结转销售成本',
    debitAmount: 65000,
    creditAmount: 65000,
    creator: '张三',
    createDate: '2024-01-13',
    auditor: '李四',
    status: 'posted',
    attachmentCount: 0,
    bookkeeper: '王五',
    entries: [
      { summary: '结转成本', subject: '主营业务成本', debit: 65000, credit: 0 },
      { summary: '结转成本', subject: '库存商品', debit: 0, credit: 65000 },
    ],
  },
])

const detailVisible = ref(false)
const currentVoucher = ref<any>({})

function getVoucherTypeText(type: string) {
  const map: Record<string, string> = {
    receive: '收款凭证',
    pay: '付款凭证',
    transfer: '转账凭证',
  }
  return map[type] || type
}

function getVoucherStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    audited: '已审核',
    posted: '已过账',
  }
  return map[status] || status
}

function getVoucherStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    audited: 'green',
    posted: 'blue',
  }
  return map[status] || 'gray'
}

function handleSearch() {
  Message.success('搜索条件已应用')
}

function handleReset() {
  searchForm.value = {
    status: '',
    type: '',
    voucherNo: '',
    dateRange: [],
  }
}

function handleAutoGenerate() {
  Message.loading('正在自动生成凭证...')
  setTimeout(() => {
    stats.value.pending += 3
    Message.success('成功生成 3 张凭证')
  }, 1500)
}

function handleView(record: any) {
  currentVoucher.value = record
  detailVisible.value = true
}

function handleEdit(record: any) {
  Message.info('编辑凭证：' + record.voucherNo)
}

function handleAudit(record: any) {
  record.status = 'audited'
  record.auditor = '当前用户'
  stats.value.pending--
  stats.value.audited++
  Message.success('凭证审核通过')
}

function handlePrint(record: any) {
  Message.success('正在打印凭证：' + record.voucherNo)
}

function handleMore(cmd: string, record: any) {
  switch (cmd) {
    case 'upload':
      Message.info('上传附件到凭证：' + record.voucherNo)
      break
    case 'viewAttachment':
      Message.info('查看凭证附件：' + record.voucherNo)
      break
    case 'delete':
      Message.success('凭证已删除')
      break
  }
}
</script>

<style scoped>
.finance-voucher {
  padding: 16px;
}
.mt-16 {
  margin-top: 16px;
}
.debit {
  color: #f53f3f;
  font-weight: 600;
}
.credit {
  color: #00b42a;
  font-weight: 600;
}
.has-attachment {
  color: #0e42d2;
  cursor: pointer;
}
.voucher-header {
  text-align: center;
  margin-bottom: 16px;

  .voucher-title {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 8px;
    margin-bottom: 12px;
  }

  .voucher-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #86909c;
  }
}
.voucher-footer {
  margin-top: 16px;

  .voucher-total {
    text-align: right;
    margin-bottom: 12px;
    font-weight: 600;

    span {
      margin-left: 24px;
    }
  }

  .voucher-sign {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e5e6eb;
    padding-top: 12px;
  }
}
</style>
