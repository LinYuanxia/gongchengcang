<template>
  <div class="custody-overview">
    <div class="debug-bar">
      <span class="debug-label">测试模式：</span>
      <a-switch v-model="isMerchantBound" size="small" />
      <span class="debug-status" :style="{ color: isMerchantBound ? '#00b42a' : '#86909c' }">
        {{ isMerchantBound ? '已关联商户号' : '未关联商户号' }}
      </span>
    </div>

    <a-alert v-if="!isMerchantBound" type="warning" style="margin-bottom: 16px">
      <template #title>暂未关联支付商户号</template>
      <template #content>请联系平台人员，关联支付商户号后即可使用虚拟账户功能</template>
    </a-alert>

    <template v-if="isMerchantBound">
      <div class="account-section">
        <div class="balance-card">
          <div class="balance-header">
            <div class="bank-info">
              <icon-safe class="bank-icon" />
              <span class="bank-name">中信银行</span>
            </div>
            <a-tag color="green" class="status-tag">正常</a-tag>
          </div>
          <div class="balance-main">
            <span class="balance-label">账户余额</span>
            <span class="balance-amount">¥ {{ formatAmount(accountInfo.balance) }}</span>
          </div>
          <div class="balance-detail">
            <div class="detail-item">
              <span class="detail-label">可提现余额</span>
              <span class="detail-value available">¥ {{ formatAmount(accountInfo.availableBalance) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">冻结金额</span>
              <span class="detail-value frozen">¥ {{ formatAmount(accountInfo.frozenAmount) }}</span>
            </div>
          </div>
          <div class="balance-actions">
            <a-button type="primary" @click="handleRechargeGuide">
              <template #icon><icon-file-text /></template>
              充值指南
            </a-button>
            <a-button @click="handleWithdraw">
              <template #icon><icon-export /></template>
              提现
            </a-button>
          </div>
        </div>

        <div class="info-card">
          <div class="info-title">
            <icon-info-circle class="info-icon" />
            <span>账户信息</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">三方编码</span>
              <span class="info-value">{{ accountInfo.thirdPartyCode }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">支付系统商户号</span>
              <span class="info-value">{{ accountInfo.payMerchantNo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">渠道</span>
              <span class="info-value">{{ accountInfo.channel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">渠道商户号</span>
              <span class="info-value">{{ accountInfo.channelMerchantNo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账户名称</span>
              <span class="info-value">{{ accountInfo.accountName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开户银行</span>
              <span class="info-value">{{ accountInfo.bankName }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flow-section">
        <a-card :extra="buildExtraContent">
          <a-tabs v-model="currentTab" :animated="false" class="tab-bar">
            <a-tab-pane key="flow" title="流水记录">
              <a-form :model="searchForm" layout="inline" class="search-form">
                <a-form-item label="记账日期">
                  <a-range-picker 
                    v-model="searchForm.dateRange" 
                    :max-date="new Date()"
                    :disabled-date="disabledDate"
                    style="width: 300px"
                  />
                </a-form-item>
                <a-form-item label="收支类型">
                  <a-select v-model="searchForm.flowType" placeholder="全部" style="width: 120px">
                    <a-option value="all">全部</a-option>
                    <a-option value="income">收入</a-option>
                    <a-option value="expense">支出</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="handleSearch">
                    <template #icon><icon-search /></template>
                    查询
                  </a-button>
                  <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
                  <a-button type="outline" @click="handleExport" style="margin-left: 8px">
                    <template #icon><icon-download /></template>
                    导出
                  </a-button>
                </a-form-item>
              </a-form>

              <a-table :data="filteredFlowRecords" :pagination="pagination" @change="handleTableChange">
                <template #columns>
                  <a-table-column title="记账场景" data-index="scenario" :width="150" />
                  <a-table-column title="记账子场景" data-index="subScenario" :width="130" />
                  <a-table-column title="收支类型" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="record.flowType === 'income' ? 'green' : 'red'">
                        {{ record.flowTypeText }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="金额" :width="140" align="right">
                    <template #cell="{ record }">
                      <span :class="record.flowType === 'income' ? 'income' : 'expense'">
                        {{ record.flowType === 'income' ? '+' : '-' }}¥{{ record.amount }}
                      </span>
                    </template>
                  </a-table-column>
                  <a-table-column title="业务单号" data-index="bizNo" :width="160" />
                  <a-table-column title="支付流水号" data-index="payNo" :width="180" />
                  <a-table-column title="流水记账时间" data-index="recordTime" :width="180" />
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="withdraw" title="提现记录">
              <a-table :data="withdrawRecords" :pagination="{ current: 1, pageSize: 10, total: withdrawRecords.length }">
                <template #columns>
                  <a-table-column title="提现金额" :width="140" align="right">
                    <template #cell="{ record }">
                      <span class="expense">-¥{{ record.amount }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="提现银行" data-index="bankCard" :width="160" />
                  <a-table-column title="申请时间" data-index="applyTime" :width="160" />
                  <a-table-column title="审核状态" :width="120">
                    <template #cell="{ record }">
                      <a-tag :color="getWithdrawStatusColor(record.status)">
                        {{ record.statusText }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="失败原因" data-index="failReason" />
                  <a-table-column title="完成时间" data-index="completeTime" :width="160" />
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </div>
    </template>

    <a-modal v-model:visible="rechargeGuideVisible" title="充值指南" :width="550">
      <div class="recharge-guide">
        <div class="guide-prompt">
          <icon-info-circle class="prompt-icon" />
          <span class="prompt-text">请前往个人手机银行APP转账或银行柜台打款</span>
        </div>
        <div class="guide-section">
          <div class="guide-warning">
            <icon-warning-circle class="warning-icon" />
            <span class="warning-text">请使用尾号 2894 的银行卡转账到以下账户</span>
          </div>
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="收款户名">xxx</a-descriptions-item>
            <a-descriptions-item label="收款账号">xxxx</a-descriptions-item>
            <a-descriptions-item label="开户银行">xxxx</a-descriptions-item>
            <a-descriptions-item label="银联号">xxxx</a-descriptions-item>
          </a-descriptions>
          <a-button type="primary" block style="margin-top: 12px" @click="copyAccountInfo">
            一键复制
          </a-button>
        </div>
        <div class="guide-notice" style="margin-top: 16px">
          <h4>注意事项</h4>
          <div class="notice-item">
            <span class="notice-number">1</span>
            <span class="notice-title">关于打款主体</span>
            <span class="notice-content">请务必使用 2894 的银行卡转账到以下账户</span>
          </div>
          <div class="notice-item">
            <span class="notice-number">2</span>
            <span class="notice-title">关于打款说明</span>
            <span class="notice-content">银行备注不同，请在汇款用途，附言，摘要等可备注栏填写转账附言，若未填写，可能导致自己无法入账</span>
          </div>
        </div>
      </div>
      <template #footer>
        <a-button @click="rechargeGuideVisible = false">我知道了</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="frozenDetailVisible" title="冻结资金明细" :width="700">
      <a-table :data="frozenRecords" :pagination="false">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="160" />
          <a-table-column title="冻结金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="frozen-amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="冻结时间" data-index="frozenTime" :width="160" />
          <a-table-column title="冻结原因" data-index="reason" />
          <a-table-column title="预计解冻时间" data-index="expectedUnfreezeTime" :width="180" />
        </template>
      </a-table>
      <template #footer>
        <a-button @click="frozenDetailVisible = false">关闭</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="withdrawVisible" title="账户提现" :width="500" @ok="handleWithdrawConfirm">
      <a-form :model="withdrawForm" layout="vertical">
        <a-form-item label="可提现金额">
          <span class="available-amount">¥ {{ formatAmount(accountInfo.availableBalance) }}</span>
        </a-form-item>
        <a-form-item label="提现金额" required>
          <a-input-number v-model="withdrawForm.amount" :min="1" :max="accountInfo.availableBalance" :precision="2" placeholder="请输入提现金额" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="提现银行" required>
          <a-select v-model="withdrawForm.bankCard" placeholder="请选择提现银行卡">
            <a-option value="1">中国工商银行 (****8901)</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="withdrawForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const isMerchantBound = ref(true)
const frozenDetailVisible = ref(false)
const currentTab = ref<'flow' | 'withdraw'>('flow')

const accountInfo = ref({
  balance: 358900,
  availableBalance: 288900,
  frozenAmount: 37500,
  thirdPartyCode: 'THP20240001234',
  payMerchantNo: 'MCH202401150001',
  channel: '中信银行',
  channelMerchantNo: 'CITIC88880001',
  accountName: '深圳湾科技园项目仓',
  bankName: '中信银行深圳南山支行',
})

const frozenRecords = ref([
  { orderNo: 'PO202403240001', amount: '125,000.00', frozenTime: '2024-03-24 10:35:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '订单完成后解冻', status: 'frozen' },
  { orderNo: 'PO202403230002', amount: '85,000.00', frozenTime: '2024-03-23 14:20:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '订单完成后解冻', status: 'frozen' },
  { orderNo: 'PO202403220003', amount: '50,000.00', frozenTime: '2024-03-22 09:15:00', reason: '采购订单支付冻结', expectedUnfreezeTime: '2024-03-25 16:30:00', status: 'unfrozen' },
])

const flowRecords = ref([
  { id: 1, scenario: '销售订单收款', subScenario: '订单收款', flowType: 'income', flowTypeText: '收入', amount: '45,000.00', bizNo: 'SO202401150001', payNo: 'PAY2024011514300001', recordTime: '2024-01-15 14:30:00' },
  { id: 2, scenario: '采购订单付款', subScenario: '订单付款', flowType: 'expense', flowTypeText: '支出', amount: '32,000.00', bizNo: 'PO202401150002', payNo: 'PAY2024011515200002', recordTime: '2024-01-15 15:20:00' },
  { id: 3, scenario: '提现', subScenario: '普通提现', flowType: 'expense', flowTypeText: '支出', amount: '50,000.00', bizNo: 'WD202401140001', payNo: 'PAY2024011410000001', recordTime: '2024-01-14 10:00:00' },
  { id: 4, scenario: '充值', subScenario: '线下转账', flowType: 'income', flowTypeText: '收入', amount: '100,000.00', bizNo: 'RC202401130001', payNo: 'PAY2024011309000001', recordTime: '2024-01-13 09:30:00' },
  { id: 5, scenario: '交易撮合费', subScenario: '工程系统', flowType: 'expense', flowTypeText: '支出', amount: '1,200.00', bizNo: 'TF202401120001', payNo: 'PAY2024011210000001', recordTime: '2024-01-12 10:00:00' },
  { id: 6, scenario: '销售订单收款', subScenario: '订单收款', flowType: 'income', flowTypeText: '收入', amount: '28,500.00', bizNo: 'SO202401110003', payNo: 'PAY2024011111300003', recordTime: '2024-01-11 11:30:00' },
  { id: 7, scenario: '交易撮合费', subScenario: '工程系统', flowType: 'expense', flowTypeText: '支出', amount: '800.00', bizNo: 'TF202401100002', payNo: 'PAY2024011014000002', recordTime: '2024-01-10 14:00:00' },
  { id: 8, scenario: '充值', subScenario: '线下转账', flowType: 'income', flowTypeText: '收入', amount: '50,000.00', bizNo: 'RC202401090002', payNo: 'PAY2024010916000002', recordTime: '2024-01-09 16:00:00' },
])

const withdrawRecords = ref([
  { id: 1, amount: '50,000.00', bankCard: '中国工商银行 (****8901)', applyTime: '2024-01-14 10:00:00', status: 'success', statusText: '审核成功', failReason: '', completeTime: '2024-01-14 14:30:00' },
  { id: 2, amount: '30,000.00', bankCard: '中国工商银行 (****8901)', applyTime: '2024-01-12 16:00:00', status: 'failed', statusText: '提现失败', failReason: '银行卡信息有误，请核对后重新提交', completeTime: '2024-01-12 17:30:00' },
  { id: 3, amount: '20,000.00', bankCard: '中国工商银行 (****8901)', applyTime: '2024-01-10 09:30:00', status: 'success', statusText: '审核成功', failReason: '', completeTime: '2024-01-10 11:00:00' },
  { id: 4, amount: '100,000.00', bankCard: '中国工商银行 (****8901)', applyTime: '2024-01-08 14:00:00', status: 'pending', statusText: '审核中', failReason: '', completeTime: '' },
])

const searchForm = ref({
  dateRange: [] as Date[],
  flowType: 'all' as 'all' | 'income' | 'expense',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const withdrawPagination = ref({
  current: 1,
  pageSize: 10,
  total: withdrawRecords.value.length,
})

const rechargeGuideVisible = ref(false)
const withdrawVisible = ref(false)

const withdrawForm = ref({
  amount: 0,
  bankCard: '',
  remark: '',
})

const filteredFlowRecords = computed(() => {
  let records = [...flowRecords.value]
  
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const startDate = searchForm.value.dateRange[0].toISOString().split('T')[0]
    const endDate = searchForm.value.dateRange[1].toISOString().split('T')[0]
    records = records.filter(item => {
      const recordDate = item.recordTime.split(' ')[0]
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  if (searchForm.value.flowType !== 'all') {
    records = records.filter(item => item.flowType === searchForm.value.flowType)
  }
  
  pagination.value.total = records.length
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  return records.slice(start, start + pagination.value.pageSize)
})

const buildExtraContent = computed(() => {
  if (currentTab.value === 'flow') {
    return `共 ${pagination.value.total} 条记录`
  } else {
    return `共 ${withdrawRecords.value.length} 条记录`
  }
})

function getWithdrawStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    success: 'green',
    failed: 'red',
    pending: 'orange',
  }
  return colorMap[status] || 'gray'
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function disabledDate(date: Date): boolean {
  const today = new Date()
  return date > today
}

function handleSearch() {
  pagination.value.current = 1
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const start = searchForm.value.dateRange[0]
    const end = searchForm.value.dateRange[1]
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    if (diffMonths > 2) {
      Message.warning('日期区间不能超过2个月')
      searchForm.value.dateRange = []
    }
  }
}

function handleReset() {
  searchForm.value.dateRange = []
  searchForm.value.flowType = 'all'
  pagination.value.current = 1
}

function handleExport() {
  const records = flowRecords.value
  let csv = '记账场景,记账子场景,收支类型,金额,业务单号,支付流水号,流水记账时间\n'
  records.forEach(record => {
    csv += `${record.scenario},${record.subScenario},${record.flowTypeText},${record.amount},${record.bizNo},${record.payNo},${record.recordTime}\n`
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `流水记录_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  Message.success('导出成功')
}

function handleTableChange(pager: { current: number; pageSize: number }) {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize
}

function handleRechargeGuide() {
  rechargeGuideVisible.value = true
}

function handleWithdraw() {
  withdrawForm.value = { amount: 0, bankCard: '', remark: '' }
  withdrawVisible.value = true
}

function viewFrozenDetail() {
  frozenDetailVisible.value = true
}

function copyAccountInfo() {
  const accountInfoText = `收款户名：xxx\n收款账号：xxxx\n开户银行：xxxx\n银联号：xxxx`
  navigator.clipboard.writeText(accountInfoText)
  Message.success('已复制到剪贴板')
}

function handleWithdrawConfirm() {
  if (!withdrawForm.value.amount || withdrawForm.value.amount <= 0) {
    Message.warning('请输入正确的提现金额')
    return
  }
  if (!withdrawForm.value.bankCard) {
    Message.warning('请选择提现银行卡')
    return
  }
  Message.success('提现申请已提交，预计1-3个工作日到账')
  withdrawVisible.value = false
}
</script>

<style scoped lang="less">
.custody-overview {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}

.debug-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f5ff;
  border: 1px solid #d6e4ff;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 12px;
}

.debug-label {
  color: #165dff;
}

.debug-status {
  font-size: 12px;
}

.account-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    flex-direction: column;
  }
}

.balance-card {
  flex: 1;
  background: linear-gradient(135deg, #165dff 0%, #0936b7 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  .balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    
    .bank-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .bank-icon {
      font-size: 20px;
    }
    
    .bank-name {
      font-size: 16px;
      font-weight: 500;
    }
    
    .status-tag {
      background: rgba(0, 180, 42, 0.2);
      border-color: rgba(0, 180, 42, 0.3);
      color: #95de64;
    }
  }
  
  .balance-main {
    text-align: center;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    
    .balance-label {
      display: block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8px;
    }
    
    .balance-amount {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 1px;
    }
  }
  
  .balance-detail {
    display: flex;
    justify-content: space-around;
    padding: 16px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    
    .detail-item {
      text-align: center;
      
      .detail-label {
        display: block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 4px;
      }
      
      .detail-value {
        font-size: 16px;
        font-weight: 600;
        
        &.available {
          color: #95de64;
        }
        
        &.frozen {
          color: #ff7875;
        }
      }
    }
  }
  
  .balance-actions {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 1;
    
    .arco-btn {
      flex: 1;
      height: 40px;
      border-radius: 8px;
      
      &.arco-btn-primary {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
      
      &.arco-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}

.info-card {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  @media (max-width: 1200px) {
    width: 100%;
  }
  
  .info-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    .info-icon {
      color: #165dff;
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .info-item {
    background: #fafafa;
    padding: 12px;
    border-radius: 8px;
    
    .info-label {
      display: block;
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: #1f2329;
      word-break: break-all;
    }
  }
}

.flow-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-form {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
  
  :deep(.arco-form-item) {
    margin-bottom: 0;
  }
}

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}

.available-amount {
  font-size: 20px;
  font-weight: 600;
  color: #165dff;
}

.frozen-amount {
  color: #f53f3f;
  font-weight: 500;
}

.tab-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  .tab-bar {
    margin-bottom: -1px;
  }
}

.recharge-guide {
  .guide-prompt {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #e6f7ff;
    border-left: 4px solid #1890ff;
    border-radius: 4px;
    margin-bottom: 16px;
    
    .prompt-icon {
      font-size: 20px;
      color: #1890ff;
    }
    
    .prompt-text {
      font-size: 14px;
      color: #1f2329;
      font-weight: 500;
    }
  }
  
  .guide-warning {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fff7e6;
    border: 1px solid #ffd591;
    border-radius: 4px;
    margin-bottom: 12px;
    
    .warning-icon {
      font-size: 16px;
      color: #fa8c16;
    }
    
    .warning-text {
      font-size: 14px;
      color: #d46b08;
      font-weight: 500;
    }
  }
  
  .guide-tip {
    margin-top: 16px;
    padding: 12px;
    background: #e6fffb;
    border: 1px solid #87e8de;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #006a6a;
  }
}
</style>
