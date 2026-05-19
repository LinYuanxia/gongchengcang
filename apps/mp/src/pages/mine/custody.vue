<template>
  <view class="page">
    <view class="debug-bar">
      <text class="debug-label">测试模式</text>
      <text class="debug-status" :class="{ on: isBound }">{{ isBound ? '已关联' : '未关联' }}</text>
      <view class="debug-switch" :class="{ on: isBound }" @click="isBound = !isBound">
        <view class="debug-switch-dot"></view>
      </view>
    </view>

    <template v-if="!isBound">
      <view class="unbound-container">
        <view class="unbound-icon">🏦</view>
        <text class="unbound-title">暂未关联支付商户号</text>
        <text class="unbound-desc">请联系平台人员，关联支付商户号后即可使用虚拟账户功能</text>
        <view class="unbound-btn" @click="handleSimulateBind">我已关联（演示）</view>
      </view>
    </template>

    <template v-else>
      <view class="balance-card" @click="showAccountDetail = true">
        <view class="card-top">
          <text class="balance-label">虚拟账户余额</text>
          <view class="merchant-badge">
            <text class="merchant-text">商户号: {{ merchantInfo.merchantNo }}</text>
          </view>
        </view>
        <text class="balance-value">¥{{ formatNumber(merchantInfo.balance) }}</text>
        <view class="balance-sub">
          <text class="sub-item">可提现: <text class="sub-highlight">¥{{ formatNumber(merchantInfo.availableBalance) }}</text></text>
          <text class="sub-item">冻结金额: ¥{{ formatNumber(merchantInfo.frozenAmount) }}</text>
        </view>
        <view class="card-tip">点击查看账户信息</view>
        <view class="balance-actions">
          <view class="action-btn" @click.stop="showRechargeGuide = true">
            <text class="action-icon">📋</text>
            <text class="action-text">充值指南</text>
          </view>
          <view class="action-btn" @click.stop="handleOpenWithdraw">
            <text class="action-icon">💸</text>
            <text class="action-text">提现</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">流水记录</text>
          <view class="section-link" @click="handleViewAll">
            <text class="link-text">查看全部</text>
            <text class="link-arrow">></text>
          </view>
        </view>
        <view class="flow-list">
          <view class="flow-item" v-for="item in recentFlows" :key="item.id">
            <view class="flow-top">
              <view class="flow-scenario">
                <text class="scenario-main">{{ item.scenario }}</text>
                <text class="scenario-sub">{{ item.subScenario }}</text>
              </view>
              <view class="flow-amount-wrap">
                <text class="flow-amount" :class="item.flowType">
                  {{ item.flowType === 'income' ? '+' : '-' }}¥{{ item.amount }}
                </text>
                <text class="flow-type-tag" :class="item.flowType">{{ item.flowTypeText }}</text>
              </view>
            </view>
            <view class="flow-bottom">
              <text class="flow-biz-no">业务单号: {{ item.bizNo }}</text>
              <text class="flow-time">{{ item.recordTime }}</text>
            </view>
            <view class="flow-pay-no">支付流水号: {{ item.payNo }}</view>
          </view>
        </view>
      </view>
    </template>

    <view class="overlay" v-if="showAccountDetail" @click="showAccountDetail = false">
      <view class="sheet" @click.stop>
        <view class="sheet-header">
          <text class="sheet-title">账户信息</text>
          <text class="sheet-close" @click="showAccountDetail = false">✕</text>
        </view>
        <view class="sheet-body">
          <view class="info-card">
            <view class="info-row">
              <text class="info-label">三方编码</text>
              <text class="info-value">{{ accountDetail.thirdPartyCode }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">支付系统商户号</text>
              <text class="info-value">{{ accountDetail.payMerchantNo }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">渠道</text>
              <text class="info-value">{{ accountDetail.channel }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">渠道商户号</text>
              <text class="info-value">{{ accountDetail.channelMerchantNo }}</text>
            </view>
          </view>
        </view>
        <view class="sheet-footer">
          <view class="btn-cancel" @click="showAccountDetail = false">关闭</view>
        </view>
      </view>
    </view>

    <view class="overlay" v-if="showRechargeGuide" @click="showRechargeGuide = false">
      <view class="sheet" @click.stop>
        <view class="sheet-header">
          <text class="sheet-title">充值指南</text>
          <text class="sheet-close" @click="showRechargeGuide = false">✕</text>
        </view>
        <view class="sheet-body">
          <view class="guide-prompt">
            <text class="prompt-icon">💡</text>
            <text class="prompt-text">请前往个人手机银行APP转账或银行柜台打款</text>
          </view>

          <view class="guide-section">
            <text class="guide-section-title">线下转账信息</text>
            <text class="guide-tip-red">请使用尾号 2894 的银行卡转账到以下账户</text>
            <view class="guide-card">
              <view class="guide-row">
                <text class="guide-label">收款户名</text>
                <text class="guide-value">{{ merchantInfo.accountName }}</text>
              </view>
              <view class="guide-row">
                <text class="guide-label">收款账号</text>
                <view class="guide-value-wrap">
                  <text class="guide-value">{{ merchantInfo.bankAccount }}</text>
                  <text class="copy-btn" @click.stop="handleCopy(merchantInfo.bankAccount)">复制</text>
                </view>
              </view>
              <view class="guide-row">
                <text class="guide-label">开户银行</text>
                <text class="guide-value">{{ merchantInfo.bankName }}</text>
              </view>
              <view class="guide-row">
                <text class="guide-label">银联号</text>
                <view class="guide-value-wrap">
                  <text class="guide-value">{{ merchantInfo.unionPayCode }}</text>
                  <text class="copy-btn" @click.stop="handleCopy(merchantInfo.unionPayCode)">复制</text>
                </view>
              </view>
            </view>
            <view class="guide-copy-all" @click.stop="handleCopyAll">
              <text class="copy-all-btn">一键复制</text>
            </view>
          </view>

          <view class="guide-section">
            <text class="guide-section-title">注意事项</text>
            <view class="guide-note-item">
              <text class="note-num">1</text>
              <view class="note-content">
                <text class="note-title">关于打款主体</text>
                <text class="note-desc">请务必使用 2894 的银行卡转账到以下账户</text>
              </view>
            </view>
            <view class="guide-note-item">
              <text class="note-num">2</text>
              <view class="note-content">
                <text class="note-title">关于打款说明</text>
                <text class="note-desc">银行备注不同，请在汇款用途、附言、摘要等可备注栏填写转账附言，若未填写，可能导致自己无法入账</text>
              </view>
            </view>
          </view>
        </view>
        <view class="sheet-footer">
          <view class="btn-cancel" @click="showRechargeGuide = false">关闭</view>
        </view>
      </view>
    </view>

    <view class="overlay" v-if="showWithdraw" @click="showWithdraw = false">
      <view class="sheet" @click.stop>
        <view class="sheet-header">
          <text class="sheet-title">提现</text>
          <text class="sheet-close" @click="showWithdraw = false">✕</text>
        </view>
        <view class="sheet-body">
          <view class="withdraw-balance">
            <text class="withdraw-label">可提现金额</text>
            <text class="withdraw-value">¥{{ formatNumber(merchantInfo.availableBalance) }}</text>
          </view>
          <view class="form-item">
            <text class="form-label">提现金额</text>
            <view class="amount-input-wrap">
              <text class="currency">¥</text>
              <input
                type="digit"
                v-model="withdrawForm.amount"
                placeholder="请输入提现金额"
                class="amount-input"
              />
              <text class="all-btn" @click="handleWithdrawAll">全部</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">提现备注</text>
            <input
              type="text"
              v-model="withdrawForm.remark"
              placeholder="请输入提现备注（选填）"
              class="remark-input"
            />
          </view>
          <view class="form-item">
            <text class="form-label">到账账户</text>
            <view class="bank-list">
              <view
                class="bank-item"
                :class="{ active: withdrawForm.selectedBank === bank.id }"
                v-for="bank in bankCards"
                :key="bank.id"
                @click="withdrawForm.selectedBank = bank.id"
              >
                <view class="bank-icon">{{ bank.bankName.charAt(0) }}</view>
                <view class="bank-info">
                  <text class="bank-name">{{ bank.bankName }}</text>
                  <text class="bank-account">{{ bank.accountNo }}</text>
                </view>
                <view class="bank-check">
                  <view class="check-dot" v-if="withdrawForm.selectedBank === bank.id"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="sheet-footer">
          <view class="btn-cancel" @click="showWithdraw = false">取消</view>
          <view class="btn-submit" :class="{ disabled: !canWithdraw }" @click="handleSubmitWithdraw">确认提现</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isBound = ref(false)

const merchantInfo = ref({
  merchantNo: 'MCH202401150001',
  accountName: '深圳湾区工程仓管理有限公司',
  bankName: '招商银行深圳科技园支行',
  bankAccount: '7559 0123 4567 8901',
  unionPayCode: '302584001234',
  balance: 158520.00,
  availableBalance: 146520.00,
  frozenAmount: 12000.00,
})

const accountDetail = ref({
  thirdPartyCode: 'THP20240001234',
  payMerchantNo: 'MCH202401150001',
  channel: '中信银行',
  channelMerchantNo: 'CITIC88880001',
})

const showAccountDetail = ref(false)
const showRechargeGuide = ref(false)
const showWithdraw = ref(false)

const withdrawForm = ref({
  amount: '',
  remark: '',
  selectedBank: 'bank1',
})

const bankCards = ref([
  { id: 'bank1', bankName: '招商银行', accountNo: '**** **** **** 8888' },
  { id: 'bank2', bankName: '工商银行', accountNo: '**** **** **** 6666' },
])

const canWithdraw = computed(() => {
  const amountNum = parseFloat(withdrawForm.value.amount)
  return amountNum > 0 && amountNum <= merchantInfo.value.availableBalance && withdrawForm.value.selectedBank
})

const flows = ref([
  {
    id: 1,
    scenario: '销售订单收款',
    subScenario: '订单收款',
    flowType: 'income',
    flowTypeText: '收入',
    amount: '45,000.00',
    bizNo: 'SO202401150001',
    payNo: 'PAY2024011514300001',
    recordTime: '2024-01-15 14:30:00',
  },
  {
    id: 2,
    scenario: '采购订单付款',
    subScenario: '订单付款',
    flowType: 'expense',
    flowTypeText: '支出',
    amount: '84,000.00',
    bizNo: 'PO202401150001',
    payNo: 'PAY2024011510200001',
    recordTime: '2024-01-15 10:20:00',
  },
  {
    id: 3,
    scenario: '账户充值',
    subScenario: '银行转账',
    flowType: 'income',
    flowTypeText: '收入',
    amount: '500,000.00',
    bizNo: 'RECH202401140001',
    payNo: 'PAY2024011416000001',
    recordTime: '2024-01-14 16:00:00',
  },
  {
    id: 4,
    scenario: '账户提现',
    subScenario: '提现到卡',
    flowType: 'expense',
    flowTypeText: '支出',
    amount: '200,000.00',
    bizNo: 'WD202401130001',
    payNo: 'PAY2024011309150001',
    recordTime: '2024-01-13 09:15:00',
  },
  {
    id: 5,
    scenario: '销售订单收款',
    subScenario: '订单收款',
    flowType: 'income',
    flowTypeText: '收入',
    amount: '210,000.00',
    bizNo: 'SO202401120001',
    payNo: 'PAY2024011215450001',
    recordTime: '2024-01-12 15:45:00',
  },
])

const recentFlows = computed(() => {
  return flows.value.slice(0, 5)
})

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function handleSimulateBind() {
  isBound.value = true
  uni.showToast({ title: '已关联商户号', icon: 'success' })
}

function handleOpenWithdraw() {
  withdrawForm.value.amount = ''
  withdrawForm.value.remark = ''
  withdrawForm.value.selectedBank = 'bank1'
  showWithdraw.value = true
}

function handleWithdrawAll() {
  withdrawForm.value.amount = String(merchantInfo.value.availableBalance)
}

function handleSubmitWithdraw() {
  if (!canWithdraw.value) return

  const amountNum = parseFloat(withdrawForm.value.amount)
  uni.showModal({
    title: '确认提现',
    content: `确定提现 ¥${withdrawForm.value.amount} 到所选银行账户吗？`,
    success: (res) => {
      if (res.confirm) {
        merchantInfo.value.availableBalance -= amountNum
        merchantInfo.value.balance -= amountNum

        flows.value.unshift({
          id: Date.now(),
          scenario: '账户提现',
          subScenario: '提现到卡',
          flowType: 'expense',
          flowTypeText: '支出',
          amount: amountNum.toLocaleString('zh-CN'),
          bizNo: `WD${Date.now()}`,
          payNo: `PAY${Date.now()}`,
          recordTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        })

        showWithdraw.value = false
        uni.showToast({ title: '提现申请已提交', icon: 'success' })
      }
    },
  })
}

function handleViewAll() {
  uni.navigateTo({ url: '/pages/mine/custody-records' })
}

function handleCopy(text: string) {
  uni.setClipboardData({
    data: text.replace(/\s/g, ''),
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    },
  })
}

function handleCopyAll() {
  const text = `${merchantInfo.value.accountName}\n${merchantInfo.value.bankAccount}\n${merchantInfo.value.bankName}\n${merchantInfo.value.unionPayCode}`
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制全部信息', icon: 'success' })
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40rpx;
}

.debug-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  padding: 12rpx 32rpx;
  background-color: #f0f5ff;
  border-bottom: 1rpx solid #d6e4ff;
}

.debug-label {
  font-size: 22rpx;
  color: #165dff;
}

.debug-status {
  font-size: 22rpx;
  color: #86909c;

  &.on {
    color: #00b42a;
  }
}

.debug-switch {
  width: 72rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background-color: #c9cdd4;
  position: relative;
  transition: background-color 0.2s;

  &.on {
    background-color: #165dff;

    .debug-switch-dot {
      left: 40rpx;
    }
  }
}

.debug-switch-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: #fff;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: left 0.2s;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

.unbound-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 64rpx 0;
}

.unbound-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.unbound-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16rpx;
}

.unbound-desc {
  font-size: 26rpx;
  color: #86909c;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 48rpx;
}

.unbound-btn {
  padding: 20rpx 64rpx;
  font-size: 28rpx;
  color: #165dff;
  background-color: #e8f3ff;
  border-radius: 40rpx;
  font-weight: 500;
}

.balance-card {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  padding: 40rpx 32rpx;
  color: #fff;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.merchant-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.merchant-text {
  font-size: 22rpx;
  color: #fff;
}

.balance-value {
  font-size: 60rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.balance-sub {
  display: flex;
  gap: 32rpx;
  margin-bottom: 8rpx;
}

.sub-item {
  font-size: 24rpx;
  opacity: 0.85;
}

.sub-highlight {
  color: #ffd666;
  font-weight: 600;
}

.card-tip {
  font-size: 20rpx;
  opacity: 0.6;
  margin-bottom: 24rpx;
}

.balance-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 28rpx;
}

.action-text {
  font-size: 28rpx;
  color: #fff;
}

.section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.section-link {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.link-text {
  font-size: 24rpx;
  color: #86909c;
}

.link-arrow {
  font-size: 24rpx;
  color: #86909c;
}

.flow-list {
  display: flex;
  flex-direction: column;
}

.flow-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;

  &:last-child {
    border-bottom: none;
  }
}

.flow-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10rpx;
}

.flow-scenario {
  display: flex;
  flex-direction: column;
}

.scenario-main {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 500;
}

.scenario-sub {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
}

.flow-amount-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.flow-amount {
  font-size: 28rpx;
  font-weight: 600;

  &.income {
    color: #00b42a;
  }

  &.expense {
    color: #f53f3f;
  }
}

.flow-type-tag {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  margin-top: 4rpx;

  &.income {
    color: #00b42a;
    background-color: #e8ffea;
  }

  &.expense {
    color: #f53f3f;
    background-color: #fff0f0;
  }
}

.flow-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rpx;
}

.flow-biz-no {
  font-size: 20rpx;
  color: #86909c;
}

.flow-time {
  font-size: 20rpx;
  color: #86909c;
}

.flow-pay-no {
  font-size: 20rpx;
  color: #86909c;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  max-height: 85vh;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2129;
}

.sheet-close {
  font-size: 32rpx;
  color: #86909c;
  padding: 8rpx;
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}

.sheet-footer {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.btn-submit {
  flex: 2;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #fff;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border-radius: 12rpx;
  font-weight: 500;

  &.disabled {
    opacity: 0.5;
  }
}

.info-card {
  background-color: #f7f8fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e5e6eb;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: #86909c;
}

.info-value {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 500;
}

.guide-prompt {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background-color: #e8f3ff;
  border-radius: 12rpx;
  margin-bottom: 28rpx;
}

.prompt-icon {
  font-size: 32rpx;
}

.prompt-text {
  font-size: 26rpx;
  color: #165dff;
  font-weight: 500;
}

.guide-section {
  margin-bottom: 32rpx;
}

.guide-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d2129;
  display: block;
  margin-bottom: 12rpx;
}

.guide-tip-red {
  font-size: 24rpx;
  color: #f53f3f;
  display: block;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.guide-card {
  background-color: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.guide-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #e5e6eb;

  &:last-child {
    border-bottom: none;
  }
}

.guide-label {
  font-size: 24rpx;
  color: #86909c;
}

.guide-value {
  font-size: 24rpx;
  color: #1d2129;
  font-weight: 500;
}

.guide-value-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.copy-btn {
  font-size: 22rpx;
  color: #165dff;
  padding: 4rpx 12rpx;
  background-color: #e8f3ff;
  border-radius: 6rpx;
}

.guide-copy-all {
  text-align: center;
  margin-top: 16rpx;
}

.copy-all-btn {
  display: inline-block;
  padding: 12rpx 48rpx;
  font-size: 26rpx;
  color: #fff;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border-radius: 40rpx;
  font-weight: 500;
}

.guide-note-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.note-num {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: #f53f3f;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.note-content {
  flex: 1;
}

.note-title {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
  margin-bottom: 6rpx;
}

.note-desc {
  font-size: 22rpx;
  color: #86909c;
  line-height: 1.5;
  display: block;
}

.withdraw-balance {
  text-align: center;
  padding: 24rpx 0;
  margin-bottom: 24rpx;
  background-color: #f7f8fa;
  border-radius: 16rpx;
}

.withdraw-label {
  font-size: 26rpx;
  color: #86909c;
  display: block;
  margin-bottom: 8rpx;
}

.withdraw-value {
  font-size: 48rpx;
  color: #1d2129;
  font-weight: 700;
}

.form-item {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
}

.currency {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 600;
  margin-right: 12rpx;
}

.amount-input {
  flex: 1;
  font-size: 32rpx;
  color: #1d2129;
  background-color: transparent;
  border: none;
  outline: none;
  height: 48rpx;
}

.all-btn {
  font-size: 24rpx;
  color: #165dff;
  padding: 8rpx 16rpx;
  background-color: #e8f3ff;
  border-radius: 6rpx;
}

.remark-input {
  width: 100%;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #1d2129;
  background-color: #f7f8fa;
  border: none;
  border-radius: 12rpx;
  outline: none;
  box-sizing: border-box;
}

.bank-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.bank-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  border: 2rpx solid transparent;

  &.active {
    border-color: #165dff;
    background-color: #e8f3ff;
  }
}

.bank-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff, #4080ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.bank-info {
  flex: 1;
}

.bank-name {
  font-size: 26rpx;
  color: #1d2129;
  display: block;
}

.bank-account {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.bank-check {
  margin-left: 16rpx;
}

.check-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: #165dff;
  border: 4rpx solid #e8f3ff;
  box-shadow: 0 0 0 2rpx #165dff;
}
</style>
