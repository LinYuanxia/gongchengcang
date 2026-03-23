<template>
  <div class="bom-order">
    <a-card title="确认订单">
      <a-steps :current="1" style="margin-bottom: 24px">
        <a-step title="选择商品" />
        <a-step title="确认订单" />
        <a-step title="支付" />
        <a-step title="完成" />
      </a-steps>

      <a-descriptions title="BOM包信息" :column="3" bordered>
        <a-descriptions-item label="BOM名称">{{ bom.name }}</a-descriptions-item>
        <a-descriptions-item label="购买数量">{{ quantity }} 套</a-descriptions-item>
        <a-descriptions-item label="供应商策略">
          <a-tag :color="getStrategyColor(bom.strategy)">{{ getStrategyText(bom.strategy) }}</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>已选SKU明细</h3>
      <a-table :data="selectedSkuList" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div class="product-info">
                <img :src="record.image" class="product-image" />
                <span>{{ record.name }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="供应商" :width="120">
            <template #cell="{ record }">
              <span>{{ record.supplierName }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单套数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.quantity }}
            </template>
          </a-table-column>
          <a-table-column title="总数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.quantity * quantity }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="小计" :width="120" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ (record.price * record.quantity * quantity).toFixed(2) }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>收货信息</h3>
      <a-form :model="orderForm" layout="vertical" style="max-width: 600px">
        <a-form-item label="收货仓库" required>
          <a-select v-model="orderForm.warehouseId" placeholder="请选择收货仓库">
            <a-option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="收货地址">
          <a-input v-model="orderForm.address" placeholder="收货地址" disabled />
        </a-form-item>
        <a-form-item label="收货人">
          <a-input v-model="orderForm.receiver" placeholder="收货人" disabled />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model="orderForm.phone" placeholder="联系电话" disabled />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="orderForm.remark" placeholder="订单备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>

      <a-divider />

      <h3>供应商拆单预览</h3>
      <a-alert type="info" style="margin-bottom: 16px">
        根据供应商策略，您的订单将拆分为以下子订单，各供应商分别发货
      </a-alert>
      <a-table :data="splitOrders" :pagination="false">
        <template #columns>
          <a-table-column title="供应商" :width="150">
            <template #cell="{ record }">
              <span>{{ record.supplierName }}</span>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 种
            </template>
          </a-table-column>
          <a-table-column title="商品明细" :width="300">
            <template #cell="{ record }">
              <span class="sku-preview">{{ record.skuPreview }}</span>
            </template>
          </a-table-column>
          <a-table-column title="子订单金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="预计发货" :width="120">
            <template #cell="{ record }">
              {{ record.estimatedDelivery }}
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>支付信息</h3>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="商品总额">
          <span class="price">¥{{ totalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="运费">
          <span class="free">免运费</span>
        </a-descriptions-item>
        <a-descriptions-item label="托管账户可用余额">
          <span class="balance">¥{{ custodyBalance }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">
          <a-radio-group v-model="orderForm.payMethod">
            <a-radio value="custody">托管账户支付</a-radio>
          </a-radio-group>
        </a-descriptions-item>
      </a-descriptions>

      <div v-if="custodyBalance < parseFloat(totalAmount.replace(/,/g, ''))" class="balance-warning">
        <a-alert type="warning">
          <template #message>
            托管账户余额不足，请先<a-link @click="handleRecharge">充值</a-link>
          </template>
        </a-alert>
      </div>

      <div class="order-summary">
        <div class="summary-row">
          <span>已选 {{ selectedSkuList.length }} 种SKU</span>
          <span>共 {{ totalQuantity }} 件商品</span>
        </div>
        <div class="summary-row">
          <span>应付总额：</span>
          <span class="total-price">¥{{ totalAmount }}</span>
        </div>
      </div>

      <div class="order-actions">
        <a-button @click="router.back()">返回修改</a-button>
        <a-button type="primary" @click="handleSubmit" :disabled="!canSubmit">
          提交订单
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const quantity = ref(1)
const custodyBalance = ref(50000)

const bom = ref({
  id: '1',
  name: '水电材料标准包',
  strategy: 'smart',
  skuList: [
    { skuId: '1', skuCode: 'SKU-SN-001', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', supplierName: '华新水泥', price: 420, quantity: 10, unit: '吨' },
    { skuId: '2', skuCode: 'SKU-FS-001', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', supplierName: '东方雨虹', price: 280, quantity: 5, unit: '桶' },
    { skuId: '3', skuCode: 'SKU-GD-001', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', supplierName: '伟星管业', price: 35, quantity: 20, unit: '根' },
    { skuId: '4', skuCode: 'SKU-DB-001', name: '电线 BV2.5', image: 'https://picsum.photos/60/60?random=4', spec: '2.5mm²', supplierName: '远东电缆', price: 180, quantity: 5, unit: '卷' },
    { skuId: '5', skuCode: 'SKU-KG-001', name: '开关插座', image: 'https://picsum.photos/60/60?random=5', spec: '五孔', supplierName: '公牛电器', price: 15, quantity: 30, unit: '个' },
  ],
})

const selectedSkuList = computed(() => bom.value.skuList)

const orderForm = ref({
  warehouseId: '1',
  address: '北京市朝阳区建国路88号',
  receiver: '张三',
  phone: '138****8888',
  remark: '',
  payMethod: 'custody',
})

const warehouseList = ref([
  { id: '1', name: '北京总仓', address: '北京市朝阳区建国路88号' },
  { id: '2', name: '上海分仓', address: '上海市浦东新区张江路100号' },
])

const splitOrders = ref([
  { supplierName: '华新水泥', skuCount: 1, skuPreview: '水泥 P.O 42.5 × 10吨', amount: '4,200.00', estimatedDelivery: '2-3天' },
  { supplierName: '东方雨虹', skuCount: 1, skuPreview: '防水涂料 × 5桶', amount: '1,400.00', estimatedDelivery: '1-2天' },
  { supplierName: '伟星管业', skuCount: 1, skuPreview: 'PVC排水管 × 20根', amount: '700.00', estimatedDelivery: '2-3天' },
  { supplierName: '远东电缆', skuCount: 1, skuPreview: '电线 BV2.5 × 5卷', amount: '900.00', estimatedDelivery: '1-2天' },
  { supplierName: '公牛电器', skuCount: 1, skuPreview: '开关插座 × 30个', amount: '450.00', estimatedDelivery: '1-2天' },
])

const totalAmount = computed(() => {
  const total = selectedSkuList.value.reduce((sum, sku) => sum + sku.price * sku.quantity * quantity.value, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

const totalQuantity = computed(() => {
  return selectedSkuList.value.reduce((sum, sku) => sum + sku.quantity * quantity.value, 0)
})

const canSubmit = computed(() => {
  return custodyBalance.value >= parseFloat(totalAmount.value.replace(/,/g, ''))
})

function getStrategyColor(strategy: string) {
  const colors: Record<string, string> = {
    smart: 'blue',
    single: 'green',
    sku: 'purple',
  }
  return colors[strategy] || 'gray'
}

function getStrategyText(strategy: string) {
  const texts: Record<string, string> = {
    smart: '智能分配',
    single: '单一供应商',
    sku: 'SKU级指定',
  }
  return texts[strategy] || strategy
}

function handleRecharge() {
  Message.info('跳转到充值页面')
}

function handleSubmit() {
  if (!canSubmit.value) {
    Message.warning('托管账户余额不足，请先充值')
    return
  }
  Message.success('订单提交成功')
  router.push('/warehouse/order/purchase')
}
</script>

<style scoped lang="less">
.bom-order {
  padding: 16px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 8px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.free {
  color: #00b42a;
}

.balance {
  color: #165dff;
  font-weight: 500;
}

.sku-preview {
  font-size: 12px;
  color: var(--color-text-2);
}

.balance-warning {
  margin-top: 16px;
}

.order-summary {
  display: flex;
  justify-content: flex-end;
  gap: 32px;
  margin-top: 24px;
  padding: 16px;
  background: rgb(var(--gray-1));
  border-radius: 8px;
  
  .summary-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    
    .total-price {
      font-size: 24px;
      font-weight: 600;
      color: #f53f3f;
    }
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}
</style>
