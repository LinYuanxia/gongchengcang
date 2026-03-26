<template>
  <div class="order-create-page">
    <a-card title="确认订单">
      <a-steps :current="1" style="margin-bottom: 24px">
        <a-step title="选择商品" />
        <a-step title="确认订单" />
        <a-step title="支付" />
        <a-step title="完成" />
      </a-steps>

      <div class="address-section">
        <div class="section-title">收货信息</div>
        <div class="address-card" @click="handleSelectAddress">
          <div class="address-content" v-if="selectedAddress">
            <div class="address-header">
              <span class="name">{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
              <a-tag v-if="selectedAddress.isDefault" color="blue" size="small">默认</a-tag>
            </div>
            <div class="address-detail">{{ selectedAddress.address }}</div>
          </div>
          <div class="address-empty" v-else>
            <icon-plus />
            <span>添加收货地址</span>
          </div>
          <icon-right class="arrow" />
        </div>
      </div>

      <div class="product-section">
        <div class="section-title">
          <span>商品清单</span>
          <span class="supplier-tag">供应商：{{ supplierName }}</span>
        </div>
        <a-table :data="orderItems" :pagination="false" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column title="商品信息" :width="350">
              <template #cell="{ record }">
                <div class="product-info">
                  <img :src="record.image" class="product-image" />
                  <div class="product-detail">
                    <div class="product-name">{{ record.skuName }}</div>
                    <div class="product-spec">{{ formatSpecs(record.specs) }}</div>
                    <div class="product-code">编码：{{ record.skuCode }}</div>
                  </div>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="单价" :width="120" align="right">
              <template #cell="{ record }">
                <div class="price-cell">
                  <span class="symbol">¥</span>
                  <span class="amount">{{ record.price }}</span>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="数量" :width="100" align="center">
              <template #cell="{ record }">
                <span>{{ record.quantity }} {{ record.unit }}</span>
              </template>
            </a-table-column>
            <a-table-column title="小计" :width="120" align="right">
              <template #cell="{ record }">
                <span class="subtotal">¥{{ (record.price * record.quantity).toFixed(2) }}</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div class="info-section">
        <div class="section-title">订单信息</div>
        <a-form :model="orderForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="期望配送日期">
                <a-date-picker v-model="orderForm.deliveryDate" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="支付方式">
                <span class="payment-method-text">托管账户支付</span>
              </a-form-item>
            </a-col>
          </a-row>
          
          <div class="custody-account-section">
            <div class="account-card">
              <div class="account-header">
                <icon-safe class="account-icon" />
                <span class="account-title">托管账户</span>
              </div>
              <div class="account-balance">
                <span class="balance-label">可用余额</span>
                <span class="balance-amount" :class="{ 'insufficient': isBalanceInsufficient }">
                  ¥{{ custodyBalance.toFixed(2) }}
                </span>
              </div>
              <div class="account-actions">
                <a-button type="text" size="small" @click="handleRecharge">
                  <template #icon><icon-plus /></template>
                  充值
                </a-button>
              </div>
            </div>
            
            <a-alert 
              v-if="isBalanceInsufficient" 
              type="error" 
              style="margin-top: 12px"
            >
              <template #message>
                <div class="insufficient-tip">
                  <span>托管账户余额不足，当前需支付 <strong>¥{{ totalAmount }}</strong>，还需充值 <strong>¥{{ shortageAmount }}</strong></span>
                  <a-button type="primary" size="small" @click="handleRecharge">
                    立即充值
                  </a-button>
                </div>
              </template>
            </a-alert>
          </div>
          
          <a-form-item label="订单备注" style="margin-top: 16px">
            <a-textarea
              v-model="orderForm.remark"
              placeholder="请输入订单备注（选填）"
              :max-length="200"
              show-word-limit
            />
          </a-form-item>
        </a-form>
      </div>

      <div class="amount-section">
        <div class="amount-item">
          <span class="label">商品金额：</span>
          <span class="value">¥{{ productAmount }}</span>
        </div>
        <div class="amount-item">
          <span class="label">运费：</span>
          <span class="value">¥{{ freight }}</span>
        </div>
        <div class="amount-item">
          <span class="label">优惠：</span>
          <span class="value discount">-¥{{ discount }}</span>
        </div>
        <a-divider />
        <div class="amount-item total">
          <span class="label">应付金额：</span>
          <span class="value">¥{{ totalAmount }}</span>
        </div>
      </div>
    </a-card>

    <div class="bottom-bar">
      <div class="total-info">
        <span class="count">共 {{ totalQuantity }} 件商品，{{ orderItems.length }} 种规格</span>
        <span class="label">应付金额：</span>
        <span class="price">¥{{ totalAmount }}</span>
      </div>
      <a-button size="large" @click="handleBack">返回</a-button>
      <a-button type="primary" size="large" @click="handleSubmit" :disabled="isBalanceInsufficient">
        提交订单
      </a-button>
    </div>

    <a-modal v-model:visible="addressModalVisible" title="选择收货地址" :width="600">
      <div class="address-list">
        <div 
          class="address-item"
          :class="{ active: selectedAddress?.id === addr.id }"
          v-for="addr in addressList"
          :key="addr.id"
          @click="handleConfirmAddress(addr)"
        >
          <div class="address-radio">
            <icon-check v-if="selectedAddress?.id === addr.id" />
          </div>
          <div class="address-info">
            <div class="address-top">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <a-tag v-if="addr.isDefault" color="blue" size="small">默认</a-tag>
            </div>
            <div class="address-text">{{ addr.address }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <a-button type="primary" @click="handleAddAddress">新增地址</a-button>
      </template>
    </a-modal>
    
    <a-modal v-model:visible="rechargeModalVisible" title="托管账户充值" :width="500" @ok="handleConfirmRecharge">
      <a-form :model="rechargeForm" layout="vertical">
        <a-form-item label="充值金额">
          <a-input-number 
            v-model="rechargeForm.amount" 
            :min="100" 
            :step="100"
            style="width: 100%"
            placeholder="请输入充值金额"
          >
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <div class="quick-amount">
          <span class="quick-label">快捷选择：</span>
          <a-space>
            <a-button v-for="amount in quickAmounts" :key="amount" size="small" @click="rechargeForm.amount = amount">
              ¥{{ amount }}
            </a-button>
          </a-space>
        </div>
        <a-form-item label="支付方式" style="margin-top: 16px">
          <a-radio-group v-model="rechargeForm.payMethod">
            <a-radio value="bank">银行转账</a-radio>
            <a-radio value="alipay">支付宝</a-radio>
            <a-radio value="wechat">微信支付</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const addressModalVisible = ref(false)
const rechargeModalVisible = ref(false)

const selectedAddress = ref<any>(null)
const addressList = ref([
  { id: 'a1', name: '张三', phone: '13800138001', address: '广东省深圳市南山区科技园南区深圳湾科技生态园10栋B座', isDefault: true },
  { id: 'a2', name: '李四', phone: '13800138002', address: '广东省深圳市福田区CBD中心区平安金融中心', isDefault: false },
])

const orderForm = ref({
  deliveryDate: '',
  payMethod: 'custody',
  remark: '',
})

const supplierId = ref('')
const supplierName = ref('')
const orderItems = ref<any[]>([])

const custodyBalance = ref(5000.00)

const rechargeForm = ref({
  amount: 1000,
  payMethod: 'bank',
})

const quickAmounts = [500, 1000, 2000, 5000, 10000]

const totalQuantity = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const productAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

const freight = ref(0)
const discount = ref(0)

const totalAmount = computed(() => {
  return (parseFloat(productAmount.value) + freight.value - discount.value).toFixed(2)
})

const isBalanceInsufficient = computed(() => {
  return custodyBalance.value < parseFloat(totalAmount.value)
})

const shortageAmount = computed(() => {
  const shortage = parseFloat(totalAmount.value) - custodyBalance.value
  return shortage > 0 ? shortage.toFixed(2) : '0.00'
})

onMounted(() => {
  if (addressList.value.length > 0) {
    const defaultAddr = addressList.value.find(a => a.isDefault)
    selectedAddress.value = defaultAddr || addressList.value[0]
  }
  
  loadOrderData()
  loadCustodyBalance()
})

function loadOrderData() {
  const { supplierId: sid, supplierName: sname, items } = route.query as Record<string, string>
  
  if (sid) {
    supplierId.value = sid
  }
  if (sname) {
    supplierName.value = sname
  }
  
  if (items) {
    try {
      orderItems.value = JSON.parse(items)
    } catch (e) {
      console.error('解析订单数据失败', e)
      orderItems.value = []
    }
  }
  
  if (orderItems.value.length === 0) {
    orderItems.value = [
      {
        skuId: 'sku001',
        skuCode: 'SKU-SN-42.5',
        skuName: '水泥 P.O 42.5',
        specs: { '强度等级': '42.5', '包装': '50kg/袋' },
        image: 'https://picsum.photos/100/100?random=11',
        quantity: 10,
        price: 420,
        unit: '吨',
      },
      {
        skuId: 'sku002',
        skuCode: 'SKU-SN-52.5',
        skuName: '水泥 P.O 52.5',
        specs: { '强度等级': '52.5', '包装': '50kg/袋' },
        image: 'https://picsum.photos/100/100?random=12',
        quantity: 5,
        price: 450,
        unit: '吨',
      },
    ]
    supplierName.value = '华新水泥供应商'
  }
}

function loadCustodyBalance() {
  
}

function formatSpecs(specs: Record<string, string>) {
  return Object.entries(specs || {}).map(([k, v]) => v).join(' / ')
}

function handleSelectAddress() {
  addressModalVisible.value = true
}

function handleConfirmAddress(addr: any) {
  selectedAddress.value = addr
  addressModalVisible.value = false
}

function handleAddAddress() {
  Message.success('地址添加成功')
}

function handleBack() {
  router.back()
}

function handleRecharge() {
  if (isBalanceInsufficient.value) {
    rechargeForm.value.amount = Math.ceil(parseFloat(shortageAmount.value) / 100) * 100
  }
  rechargeModalVisible.value = true
}

function handleConfirmRecharge() {
  if (!rechargeForm.value.amount || rechargeForm.value.amount < 100) {
    Message.warning('充值金额最低100元')
    return
  }
  
  Message.success(`充值申请已提交，请完成${rechargeForm.value.payMethod === 'bank' ? '银行转账' : '在线支付'}`)
  rechargeModalVisible.value = false
  
  router.push('/warehouse/finance/custody')
}

function handleSubmit() {
  if (!selectedAddress.value) {
    Message.warning('请选择收货地址')
    return
  }
  
  if (isBalanceInsufficient.value) {
    Modal.confirm({
      title: '余额不足',
      content: '托管账户余额不足，是否立即充值？',
      okText: '立即充值',
      cancelText: '取消',
      onOk: () => {
        handleRecharge()
      }
    })
    return
  }

  Modal.confirm({
    title: '确认提交',
    content: `订单金额：¥${totalAmount.value}，共 ${orderItems.value.length} 种规格，确认提交？`,
    onOk: () => {
      Message.success('订单提交成功')
      setTimeout(() => {
        router.push('/warehouse/order/purchase')
      }, 1500)
    }
  })
}
</script>

<style scoped lang="less">
.order-create-page {
  padding: 16px;
  padding-bottom: 100px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid rgb(var(--primary-6));
  
  .supplier-tag {
    font-size: 13px;
    font-weight: 400;
    color: var(--color-text-2);
    padding: 4px 12px;
    background: rgb(var(--gray-1));
    border-radius: 4px;
  }
}

.address-section {
  margin-bottom: 24px;
}

.address-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    border-color: rgb(var(--primary-6));
    background: rgb(var(--primary-1));
  }
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  .name {
    font-size: 16px;
    font-weight: 600;
  }
  
  .phone {
    font-size: 14px;
    color: var(--color-text-2);
  }
}

.address-detail {
  font-size: 14px;
  color: var(--color-text-2);
}

.address-empty {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-3);
}

.arrow {
  font-size: 16px;
  color: var(--color-text-3);
}

.product-section {
  margin-bottom: 24px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-detail {
  margin-left: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-spec {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 4px;
}

.product-code {
  font-size: 11px;
  color: var(--color-text-4);
  font-family: monospace;
}

.price-cell {
  .symbol {
    font-size: 12px;
    color: rgb(var(--danger-6));
  }
  .amount {
    font-size: 14px;
    font-weight: 500;
    color: rgb(var(--danger-6));
  }
}

.subtotal {
  font-weight: 600;
  color: rgb(var(--danger-6));
}

.info-section {
  margin-bottom: 24px;
}

.payment-method-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
}

.custody-account-section {
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%);
  border: 2px solid rgb(var(--primary-6));
  border-radius: 12px;
  padding: 20px;
  margin-top: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.account-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .account-icon {
    font-size: 28px;
    color: rgb(var(--primary-6));
  }
  
  .account-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.account-balance {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 12px;
  
  .balance-label {
    font-size: 14px;
    color: var(--color-text-2);
  }
  
  .balance-amount {
    font-size: 28px;
    font-weight: 700;
    color: rgb(var(--primary-6));
    
    &.insufficient {
      color: rgb(var(--danger-6));
      animation: pulse 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.account-actions {
  display: flex;
  gap: 8px;
}

.insufficient-tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  strong {
    color: rgb(var(--danger-6));
  }
}

.quick-amount {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .quick-label {
    font-size: 13px;
    color: var(--color-text-3);
  }
}

.amount-section {
  background: rgb(var(--gray-1));
  padding: 16px;
  border-radius: 8px;
}

.amount-item {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  margin-bottom: 8px;
  
  .label {
    font-size: 14px;
    color: var(--color-text-2);
  }
  
  .value {
    font-size: 14px;
    font-weight: 500;
    margin-left: 8px;
    
    &.discount {
      color: rgb(var(--success-6));
    }
  }
  
  &.total {
    margin-bottom: 0;
    
    .label {
      font-size: 16px;
      font-weight: 600;
    }
    
    .value {
      font-size: 24px;
      font-weight: 600;
      color: rgb(var(--danger-6));
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 0;
  height: 72px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  gap: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.total-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  margin-right: 24px;
  
  .count {
    font-size: 14px;
    color: var(--color-text-2);
    margin-right: 24px;
  }
  
  .label {
    font-size: 14px;
    color: var(--color-text-2);
  }
  
  .price {
    font-size: 24px;
    font-weight: 600;
    color: rgb(var(--danger-6));
    margin-left: 8px;
  }
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  
  &:hover {
    border-color: rgb(var(--primary-6));
  }
  
  &.active {
    border-color: rgb(var(--primary-6));
    background: rgb(var(--primary-1));
    
    .address-radio {
      background: rgb(var(--primary-6));
      border-color: rgb(var(--primary-6));
      color: #fff;
    }
  }
}

.address-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 12px;
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  .name {
    font-size: 14px;
    font-weight: 600;
  }
  
  .phone {
    font-size: 14px;
    color: var(--color-text-2);
  }
}

.address-text {
  font-size: 13px;
  color: var(--color-text-2);
}
</style>
