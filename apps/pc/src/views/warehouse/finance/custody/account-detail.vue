<template>
  <div class="virtual-account-detail">
    <a-row :gutter="16" class="balance-section">
      <a-col :span="24">
        <a-card class="balance-card">
          <div class="balance-header">
            <div class="balance-title">
              <icon-wallet class="balance-icon" />
              <span>虚拟账户余额</span>
            </div>
            <a-tag :color="accountStatus === 'normal' ? 'green' : 'red'" size="large">
              {{ accountStatus === 'normal' ? '正常' : '冻结' }}
            </a-tag>
          </div>
          
          <div class="balance-main">
            <div class="balance-amount">
              <span class="currency">¥</span>
              <span class="amount">{{ formatNumber(totalBalance) }}</span>
              <span class="decimal">.00</span>
            </div>
            <div class="balance-label">账户总余额（元）</div>
          </div>
          
          <a-divider />
          
          <a-row :gutter="24" class="balance-detail">
            <a-col :span="6">
              <div class="balance-item">
                <div class="item-label">可提现余额</div>
                <div class="item-value available">
                  ¥ {{ formatNumber(availableBalance) }}
                </div>
                <div class="item-tip">可直接提现到银行账户</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="balance-item">
                <div class="item-label">冻结金额</div>
                <div class="item-value frozen">
                  ¥ {{ formatNumber(frozenBalance) }}
                </div>
                <div class="item-tip">订单交易中冻结资金</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="balance-item">
                <div class="item-label">待结算金额</div>
                <div class="item-value pending">
                  ¥ {{ formatNumber(pendingSettlement) }}
                </div>
                <div class="item-tip">交易完成待分账金额</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="balance-item">
                <div class="item-label">待扣款金额</div>
                <div class="item-value deduction" @click="goToDeduction" style="cursor: pointer;">
                  ¥ {{ formatNumber(pendingDeduction) }}
                </div>
                <div class="item-tip">点击查看应扣记录</div>
              </div>
            </a-col>
          </a-row>
          
          <div class="balance-actions">
            <a-button type="primary" size="large" @click="handleRecharge">
              <template #icon><icon-upload /></template>
              充值
            </a-button>
            <a-button size="large" @click="handleWithdraw">
              <template #icon><icon-download /></template>
              提现
            </a-button>
            <a-button size="large" @click="handleTransfer">
              <template #icon><icon-send /></template>
              转账
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="info-section">
      <a-col :span="12">
        <a-card title="账户信息" class="info-card">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="账户名称">
              {{ accountInfo.name }}
            </a-descriptions-item>
            <a-descriptions-item label="账户编号">
              {{ accountInfo.code }}
            </a-descriptions-item>
            <a-descriptions-item label="账户类型">
              <a-tag color="blue">工程仓虚拟账户</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="账户状态">
              <a-tag :color="accountStatus === 'normal' ? 'green' : 'red'">
                {{ accountStatus === 'normal' ? '正常' : '冻结' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="开户时间">
              {{ accountInfo.createTime }}
            </a-descriptions-item>
            <a-desquisitions-item label="最后变动时间">
              {{ accountInfo.lastActivityTime }}
            </a-descriptions-item>
            <a-descriptions-item label="关联商户">
              {{ accountInfo.merchantName }}
            </a-descriptions-item>
            <a-descriptions-item label="商户类型">
              {{ accountInfo.merchantType }}
            </a-descriptions-item>
            <a-descriptions-item label="绑定银行">
              {{ accountInfo.bankName }}
            </a-descriptions-item>
            <a-descriptions-item label="银行账号">
              {{ accountInfo.bankAccount }}
            </a-descriptions-item>
          </a-descriptions>
          
          <div class="card-actions">
            <a-button type="text" @click="handleEditAccount">
              <template #icon><icon-edit /></template>
              修改账户信息
            </a-button>
            <a-button type="text" @click="handleBindBank">
              <template #icon><icon-link /></template>
              更换银行卡
            </a-button>
          </div>
        </a-card>
      </a-col>
      
      <a-col :span="12">
        <a-card title="账户统计" class="stats-card">
          <a-row :gutter="16">
            <a-col :span="12">
              <div class="stat-item">
                <div class="stat-icon income">
                  <icon-arrow-up />
                </div>
                <div class="stat-content">
                  <div class="stat-label">累计收入</div>
                  <div class="stat-value">¥ {{ formatNumber(stats.totalIncome) }}</div>
                  <div class="stat-period">近30天 +¥ {{ formatNumber(stats.income30Days) }}</div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="stat-item">
                <div class="stat-icon expense">
                  <icon-arrow-down />
                </div>
                <div class="stat-content">
                  <div class="stat-label">累计支出</div>
                  <div class="stat-value">¥ {{ formatNumber(stats.totalExpense) }}</div>
                  <div class="stat-period">近30天 -¥ {{ formatNumber(stats.expense30Days) }}</div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="stat-item">
                <div class="stat-icon transaction">
                  <icon-history />
                </div>
                <div class="stat-content">
                  <div class="stat-label">累计交易笔数</div>
                  <div class="stat-value">{{ stats.totalTransactions }} 笔</div>
                  <div class="stat-period">近30天 {{ stats.transactions30Days }} 笔</div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="stat-item" @click="goToDeduction" style="cursor: pointer;">
                <div class="stat-icon deduction">
                  <icon-minus-circle />
                </div>
                <div class="stat-content">
                  <div class="stat-label">应扣记录</div>
                  <div class="stat-value">{{ stats.totalDeduction }} 笔</div>
                  <div class="stat-period">待扣 ¥{{ formatNumber(stats.pendingDeductionAmount) }}</div>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="账户流水" class="transaction-card">
      <template #extra>
        <a-space>
          <a-select v-model="flowType" placeholder="流水类型" style="width: 120px" allow-clear>
            <a-option value="all">全部</a-option>
            <a-option value="income">收入</a-option>
            <a-option value="expense">支出</a-option>
            <a-option value="frozen">冻结</a-option>
            <a-option value="unfrozen">解冻</a-option>
          </a-select>
          <a-range-picker v-model="dateRange" style="width: 250px" />
          <a-button type="primary" @click="handleSearchFlow">
            <template #icon><icon-search /></template>
            查询
          </a-button>
          <a-button @click="handleExportFlow">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="flowTab" @change="handleFlowTabChange">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="recharge" title="充值" />
        <a-tab-pane key="withdraw" title="提现" />
        <a-tab-pane key="order" title="订单交易" />
        <a-tab-pane key="transfer" title="转账" />
        <a-tab-pane key="frozen" title="冻结/解冻" />
      </a-tabs>

      <a-table :data="filteredTransactions" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="交易时间" data-index="time" :width="180" />
          <a-table-column title="流水号" data-index="flowNo" :width="200">
            <template #cell="{ record }">
              <a-link>{{ record.flowNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="交易类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getFlowTypeColor(record.type)">
                {{ getFlowTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联单号" data-index="orderNo" :width="180">
            <template #cell="{ record }">
              <a-link v-if="record.orderNo">{{ record.orderNo }}</a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="对方账户" :width="180">
            <template #cell="{ record }">
              <span v-if="record.counterparty">{{ record.counterparty }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="摘要" data-index="summary" :width="200" ellipsis />
          <a-table-column title="收支金额" :width="150" align="right">
            <template #cell="{ record }">
              <span :class="getAmountClass(record)">
                {{ getAmountPrefix(record) }}¥{{ formatNumber(record.amount) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="账户余额" :width="150" align="right">
            <template #cell="{ record }">
              <span class="balance-after">¥{{ formatNumber(record.balanceAfter) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="rechargeVisible" 
      title="账户充值" 
      :width="500"
      @ok="handleRechargeSubmit"
      @cancel="rechargeVisible = false"
    >
      <a-form :model="rechargeForm" layout="vertical">
        <a-form-item label="可充值金额">
          <span class="available-text">无上限</span>
        </a-form-item>
        <a-form-item label="充值金额" required>
          <a-input-number 
            v-model="rechargeForm.amount" 
            :min="1" 
            :precision="2" 
            placeholder="请输入充值金额" 
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="充值方式" required>
          <a-radio-group v-model="rechargeForm.method">
            <a-radio value="bank">
              <icon-bank-card style="margin-right: 4px" />
              银行卡转账
            </a-radio>
            <a-radio value="third">
              <icon-pay-circle style="margin-right: 4px" />
              第三方支付
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="rechargeForm.method === 'bank'" label="转账信息">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="收款账户">工程仓平台虚拟户</a-descriptions-item>
            <a-descriptions-item label="银行">中国工商银行深圳南山支行</a-descriptions-item>
            <a-descriptions-item label="账号">4000 1234 5678 9012</a-descriptions-item>
            <a-descriptions-item label="备注">请备注账户编号</a-descriptions-item>
          </a-descriptions>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="rechargeForm.remark" placeholder="请输入备注信息（选填）" :rows="2" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="rechargeVisible = false">取消</a-button>
        <a-button type="primary" @click="handleRechargeSubmit">确认充值</a-button>
      </template>
    </a-modal>

    <a-modal 
      v-model:visible="withdrawVisible" 
      title="账户提现" 
      :width="500"
      @ok="handleWithdrawSubmit"
      @cancel="withdrawVisible = false"
    >
      <a-form :model="withdrawForm" layout="vertical">
        <a-form-item label="可提现余额">
          <span class="available-text">¥ {{ formatNumber(availableBalance) }}</span>
        </a-form-item>
        <a-form-item label="提现金额" required>
          <a-input-number 
            v-model="withdrawForm.amount" 
            :min="1" 
            :max="availableBalance" 
            :precision="2" 
            placeholder="请输入提现金额" 
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
          <div class="quick-amount">
            <a-tag v-for="amt in [1000, 5000, 10000, 50000]" :key="amt" @click="withdrawForm.amount = amt">
              {{ formatNumber(amt) }}
            </a-tag>
          </div>
        </a-form-item>
        <a-form-item label="到账银行卡" required>
          <a-select v-model="withdrawForm.bankCard" placeholder="请选择到账银行卡">
            <a-option value="1">
              中国工商银行 (****8901)
            </a-option>
            <a-option value="2">
              中国建设银行 (****5678)
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="到账说明">
          <div class="withdraw-tip">
            <icon-info-circle /> 提现申请提交后，预计1-3个工作日内到账
          </div>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="withdrawForm.remark" placeholder="请输入备注信息（选填）" :rows="2" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="withdrawVisible = false">取消</a-button>
        <a-button type="primary" @click="handleWithdrawSubmit">确认提现</a-button>
      </template>
    </a-modal>

    <a-modal 
      v-model:visible="transferVisible" 
      title="账户转账" 
      :width="500"
      @ok="handleTransferSubmit"
      @cancel="transferVisible = false"
    >
      <a-form :model="transferForm" layout="vertical">
        <a-form-item label="当前余额">
          <span class="available-text">¥ {{ formatNumber(totalBalance) }}</span>
        </a-form-item>
        <a-form-item label="转入账户" required>
          <a-select 
            v-model="transferForm.toAccount" 
            placeholder="请选择转入账户"
            show-search
          >
            <a-option value="supplier1">华润水泥(深圳)有限公司 - 供应商</a-option>
            <a-option value="supplier2">深圳建材贸易公司 - 供应商</a-option>
            <a-option value="service1">中建三局一公司 - 服务商</a-option>
            <a-option value="platform">平台托管账户</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="转账金额" required>
          <a-input-number 
            v-model="transferForm.amount" 
            :min="1" 
            :max="totalBalance" 
            :precision="2" 
            placeholder="请输入转账金额" 
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="转账说明">
          <a-textarea v-model="transferForm.summary" placeholder="请输入转账说明" :rows="2" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="transferVisible = false">取消</a-button>
        <a-button type="primary" @click="handleTransferSubmit">确认转账</a-button>
      </template>
    </a-modal>

    <a-modal 
      v-model:visible="flowDetailVisible" 
      title="流水详情" 
      :width="600"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="流水号">{{ currentFlow.flowNo }}</a-descriptions-item>
        <a-descriptions-item label="交易时间">{{ currentFlow.time }}</a-descriptions-item>
        <a-descriptions-item label="交易类型">
          <a-tag :color="getFlowTypeColor(currentFlow.type)">
            {{ getFlowTypeText(currentFlow.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentFlow.status)">
            {{ getStatusText(currentFlow.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="关联单号">{{ currentFlow.orderNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="对方账户">{{ currentFlow.counterparty || '-' }}</a-descriptions-item>
        <a-descriptions-item label="收支金额" :span="2">
          <span :class="getAmountClass(currentFlow)">
            {{ getAmountPrefix(currentFlow) }}¥{{ formatNumber(currentFlow.amount) }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="账户余额">
          <span class="balance-after">¥{{ formatNumber(currentFlow.balanceAfter) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="可用余额">
          <span class="available-balance">¥{{ formatNumber(currentFlow.availableAfter || 0) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="摘要" :span="2">{{ currentFlow.summary }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message, useRouter } from '@arco-design/web-vue'

const router = useRouter()

const totalBalance = ref(358900.00)
const availableBalance = ref(288900.00)
const frozenBalance = ref(37500.00)
const pendingSettlement = ref(12500.00)
const securityDeposit = ref(20000.00)
const pendingDeduction = ref(8500.00) // 待扣款金额
const accountStatus = ref('normal')

const flowType = ref('all')
const flowTab = ref('all')
const dateRange = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 45,
})

const accountInfo = ref({
  name: '深圳湾科技园工程仓',
  code: 'GCC-WH-2024-00856',
  createTime: '2024-01-15 10:30:00',
  lastActivityTime: '2024-03-25 16:30:00',
  merchantName: '深圳湾科技园项目管理有限公司',
  merchantType: '工程仓',
  bankName: '中国工商银行深圳南山支行',
  bankAccount: '4000 **** **** 8901',
})

const stats = ref({
  totalIncome: 1256800.00,
  income30Days: 358900.00,
  totalExpense: 897900.00,
  expense30Days: 125000.00,
  totalTransactions: 156,
  transactions30Days: 28,
  totalOrders: 89,
  orders30Days: 12,
  totalDeduction: 5, // 累计应扣记录数
  deductedAmount: 12500.00, // 已扣款金额
  pendingDeductionAmount: 8500.00, // 待扣款金额
})

const transactions = ref([
  { flowNo: 'F202403250001', time: '2024-03-25 16:30:00', type: 'order_income', orderNo: 'SO202403250001', counterparty: '深圳建筑工程公司', summary: '销售订单收款 - 水泥、钢筋', amount: 125000.00, balanceAfter: 358900.00, availableAfter: 288900.00, status: 'success' },
  { flowNo: 'F202403250002', time: '2024-03-25 14:20:00', type: 'recharge', orderNo: '', counterparty: '深圳建设集团有限公司', summary: '账户充值', amount: 100000.00, balanceAfter: 233900.00, availableAfter: 163900.00, status: 'success' },
  { flowNo: 'F202403250003', time: '2024-03-25 10:00:00', type: 'order_expense', orderNo: 'PO202403250001', counterparty: '华润水泥(深圳)有限公司', summary: '采购订单支付', amount: 85000.00, balanceAfter: 133900.00, availableAfter: 133900.00, status: 'success' },
  { flowNo: 'F202403240001', time: '2024-03-24 15:30:00', type: 'withdraw', orderNo: '', counterparty: '', summary: '账户提现到工商银行卡', amount: 50000.00, balanceAfter: 218900.00, availableAfter: 218900.00, status: 'success' },
  { flowNo: 'F202403240002', time: '2024-03-24 10:00:00', type: 'recharge', orderNo: '', counterparty: '业主方预付款', summary: '账户充值', amount: 200000.00, balanceAfter: 268900.00, availableAfter: 268900.00, status: 'success' },
  { flowNo: 'F202403230001', time: '2024-03-23 14:20:00', type: 'frozen', orderNo: 'SO202403230001', counterparty: '', summary: '订单支付冻结', amount: 37500.00, balanceAfter: 68900.00, availableAfter: 31400.00, status: 'success' },
  { flowNo: 'F202403230002', time: '2024-03-23 10:00:00', type: 'transfer', orderNo: '', counterparty: '平台托管账户', summary: '分账转账', amount: 12500.00, balanceAfter: 106400.00, availableAfter: 68900.00, status: 'success' },
  { flowNo: 'F202403220001', time: '2024-03-22 16:00:00', type: 'order_income', orderNo: 'SO202403220001', counterparty: '广州装饰工程公司', summary: '销售订单收款 - 砂浆', amount: 45000.00, balanceAfter: 118900.00, availableAfter: 68900.00, status: 'success' },
  { flowNo: 'F202403220002', time: '2024-03-22 10:30:00', type: 'unfrozen', orderNo: 'PO202403200001', counterparty: '', summary: '订单完成解冻', amount: 50000.00, balanceAfter: 73900.00, availableAfter: 68900.00, status: 'success' },
  { flowNo: 'F202403210001', time: '2024-03-21 15:00:00', type: 'order_expense', orderNo: 'PO202403210001', counterparty: '深圳建材贸易公司', summary: '采购订单支付', amount: 32000.00, balanceAfter: 23900.00, availableAfter: 18900.00, status: 'success' },
])

const filteredTransactions = computed(() => {
  let result = transactions.value
  
  if (flowTab.value !== 'all') {
    result = result.filter(t => t.type.startsWith(flowTab.value))
  }
  
  if (flowType.value !== 'all' && flowType.value) {
    if (flowType.value === 'income') {
      result = result.filter(t => ['recharge', 'order_income'].includes(t.type))
    } else if (flowType.value === 'expense') {
      result = result.filter(t => ['withdraw', 'order_expense', 'transfer'].includes(t.type))
    } else if (flowType.value === 'frozen') {
      result = result.filter(t => ['frozen', 'unfrozen'].includes(t.type))
    }
  }
  
  return result
})

const rechargeVisible = ref(false)
const withdrawVisible = ref(false)
const transferVisible = ref(false)
const flowDetailVisible = ref(false)

const rechargeForm = reactive({
  amount: 0,
  method: 'bank',
  remark: '',
})

const withdrawForm = reactive({
  amount: 0,
  bankCard: '',
  remark: '',
})

const transferForm = reactive({
  toAccount: '',
  amount: 0,
  summary: '',
})

const currentFlow = ref<any>({})

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function getFlowTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    recharge: 'blue',
    withdraw: 'orange',
    order_income: 'green',
    order_expense: 'red',
    transfer: 'purple',
    frozen: 'cyan',
    unfrozen: 'arcoblue',
  }
  return colorMap[type] || 'gray'
}

function getFlowTypeText(type: string) {
  const textMap: Record<string, string> = {
    recharge: '充值',
    withdraw: '提现',
    order_income: '订单收入',
    order_expense: '订单支出',
    transfer: '转账',
    frozen: '冻结',
    unfrozen: '解冻',
  }
  return textMap[type] || type
}

function getAmountClass(record: any) {
  if (['recharge', 'order_income', 'unfrozen'].includes(record.type)) {
    return 'income'
  }
  return 'expense'
}

function getAmountPrefix(record: any) {
  if (['recharge', 'order_income', 'unfrozen'].includes(record.type)) {
    return '+'
  }
  return '-'
}

function getStatusColor(status: string) {
  return status === 'success' ? 'green' : 'orange'
}

function getStatusText(status: string) {
  return status === 'success' ? '成功' : '处理中'
}

function handleRecharge() {
  rechargeForm.amount = 0
  rechargeForm.method = 'bank'
  rechargeForm.remark = ''
  rechargeVisible.value = true
}

function handleWithdraw() {
  withdrawForm.amount = 0
  withdrawForm.bankCard = ''
  withdrawForm.remark = ''
  withdrawVisible.value = true
}

function handleTransfer() {
  transferForm.toAccount = ''
  transferForm.amount = 0
  transferForm.summary = ''
  transferVisible.value = true
}

function handleRechargeSubmit() {
  if (!rechargeForm.amount || rechargeForm.amount <= 0) {
    Message.warning('请输入正确的充值金额')
    return
  }
  Message.success('充值成功，资金已到账')
  rechargeVisible.value = false
}

function handleWithdrawSubmit() {
  if (!withdrawForm.amount || withdrawForm.amount <= 0) {
    Message.warning('请输入正确的提现金额')
    return
  }
  if (!withdrawForm.bankCard) {
    Message.warning('请选择到账银行卡')
    return
  }
  if (withdrawForm.amount > availableBalance.value) {
    Message.warning('提现金额不能超过可提现余额')
    return
  }
  Message.success('提现申请已提交，预计1-3个工作日到账')
  withdrawVisible.value = false
}

function handleTransferSubmit() {
  if (!transferForm.toAccount) {
    Message.warning('请选择转入账户')
    return
  }
  if (!transferForm.amount || transferForm.amount <= 0) {
    Message.warning('请输入正确的转账金额')
    return
  }
  if (transferForm.amount > totalBalance.value) {
    Message.warning('转账金额不能超过账户余额')
    return
  }
  Message.success('转账成功')
  transferVisible.value = false
}

function handleSearchFlow() {
  Message.info('查询流水记录')
}

function handleExportFlow() {
  Message.success('流水记录已导出')
}

function handleFlowTabChange(key: string) {
  flowTab.value = key
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  currentFlow.value = record
  flowDetailVisible.value = true
}

function handleEditAccount() {
  Message.info('修改账户信息')
}

function handleBindBank() {
  Message.info('更换银行卡')
}

function goToDeduction() {
  router.push('/warehouse/finance/deduction')
}
</script>

<style scoped lang="scss">
.virtual-account-detail {
  padding: 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.balance-section {
  margin-bottom: 16px;
}

.balance-card {
  .balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .balance-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .balance-icon {
    font-size: 24px;
    color: #165dff;
  }

  .balance-main {
    text-align: center;
    padding: 20px 0;
  }

  .balance-amount {
    display: inline-flex;
    align-items: baseline;
    color: #165dff;

    .currency {
      font-size: 24px;
      font-weight: 600;
      margin-right: 4px;
    }

    .amount {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: -2px;
    }

    .decimal {
      font-size: 24px;
      font-weight: 600;
      opacity: 0.6;
    }
  }

  .balance-label {
    margin-top: 8px;
    color: #86909c;
    font-size: 14px;
  }

  .balance-detail {
    margin-top: 16px;
  }

  .balance-item {
    text-align: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .item-label {
      font-size: 13px;
      color: #86909c;
      margin-bottom: 8px;
    }

    .item-value {
      font-size: 20px;
      font-weight: 600;

      &.available {
        color: #00b42a;
      }

      &.frozen {
        color: #ff7d00;
      }

      &.pending {
        color: #165dff;
      }

      &.security {
        color: #722ed1;
      }

      &.deduction {
        color: #f53f3f;
      }
    }

    .item-tip {
      margin-top: 4px;
      font-size: 12px;
      color: #86909c;
    }
  }

  .balance-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e6e8;

    .arco-btn {
      min-width: 120px;
    }
  }
}

.info-section {
  margin-bottom: 16px;
}

.info-card,
.stats-card {
  height: 100%;
}

.card-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e6e8;
  display: flex;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;

    &.income {
      background: #e6fffb;
      color: #00b42a;
    }

    &.expense {
      background: #fff1f0;
      color: #f53f3f;
    }

    &.transaction {
      background: #f0f5ff;
      color: #165dff;
    }

    &.order {
      background: #f9f0ff;
      color: #722ed1;
    }

    &.deduction {
      background: #fff1f0;
      color: #f53f3f;
    }
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
  }

  .stat-period {
    font-size: 12px;
    color: #86909c;
    margin-top: 2px;
  }
}

.transaction-card {
  margin-top: 16px;
}

.income {
  color: #00b42a;
  font-weight: 600;
}

.expense {
  color: #f53f3f;
  font-weight: 600;
}

.balance-after {
  color: #1d2129;
  font-weight: 500;
}

.text-gray {
  color: #86909c;
}

.available-text {
  font-size: 18px;
  font-weight: 600;
  color: #165dff;
}

.quick-amount {
  margin-top: 8px;
  display: flex;
  gap: 8px;

  .arco-tag {
    cursor: pointer;
  }
}

.withdraw-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f5ff;
  border-radius: 4px;
  color: #165dff;
  font-size: 13px;
}

.available-balance {
  color: #00b42a;
  font-weight: 500;
}
</style>
