<template>
  <div class="purchase-create">
    <a-card title="新建采购订单">
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button type="primary" @click="handleSubmit">提交订单</a-button>
        </a-space>
      </template>

      <a-steps :current="currentStep" class="steps">
        <a-step title="选择商品" />
        <a-step title="确认订单" />
        <a-step title="提交成功" />
      </a-steps>

      <div v-show="currentStep === 1" class="step-content">
        <a-card title="平台商品市场" class="mt-16">
          <template #extra>
            <a-input-search 
              v-model="searchKeyword" 
              placeholder="搜索商品名称/编码" 
              style="width: 300px"
              @search="handleSearch"
            />
          </template>

          <a-tabs v-model:active-key="activeCategory">
            <a-tab-pane key="all" title="全部" />
            <a-tab-pane key="cement" title="水泥" />
            <a-tab-pane key="steel" title="钢材" />
            <a-tab-pane key="sand" title="砂石" />
            <a-tab-pane key="concrete" title="混凝土" />
          </a-tabs>

          <a-row :gutter="16">
            <a-col :span="6" v-for="product in filteredProducts" :key="product.id">
              <div class="product-card" :class="{ selected: selectedProducts.includes(product.id) }">
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-spec">规格：{{ product.spec }}</div>
                  <div class="product-supplier">
                    <icon-user />
                    {{ product.supplierName }}
                  </div>
                  <div class="product-price">
                    <span class="price">¥{{ product.price }}</span>
                    <span class="unit">/{{ product.unit }}</span>
                  </div>
                  <div class="product-stock">库存：{{ product.stock }}{{ product.unit }}</div>
                </div>
                <div class="product-actions">
                  <a-input-number 
                    v-model="productQuantities[product.id]" 
                    :min="1" 
                    :max="product.stock"
                    size="small"
                    style="width: 100px"
                  />
                  <a-button 
                    type="primary" 
                    size="small"
                    @click="handleAddToCart(product)"
                  >
                    {{ selectedProducts.includes(product.id) ? '已添加' : '添加' }}
                  </a-button>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <a-card title="已选商品" class="mt-16">
          <a-table :data="cartItems" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="name" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="供应商" data-index="supplierName" :width="150" />
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="price">¥{{ record.price }}</span>
                </template>
              </a-table-column>
              <a-table-column title="数量" :width="150">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="record.quantity" 
                    :min="1" 
                    :max="record.stock"
                    size="small"
                  />
                </template>
              </a-table-column>
              <a-table-column title="小计" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="subtotal">¥{{ (record.price * record.quantity).toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80">
                <template #cell="{ record }">
                  <a-link status="danger" @click="handleRemoveFromCart(record)">移除</a-link>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <div class="cart-summary">
            <span>共 {{ cartItems.length }} 种商品</span>
            <span class="total">合计：<span class="amount">¥{{ cartTotal }}</span></span>
          </div>
        </a-card>

        <div class="step-actions">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="currentStep = 2" :disabled="cartItems.length === 0">
            下一步
          </a-button>
        </div>
      </div>

      <div v-show="currentStep === 2" class="step-content">
        <a-card title="订单信息确认" class="mt-16">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="收货仓库">
              <a-select v-model="orderInfo.warehouseId" placeholder="请选择收货仓库" style="width: 100%">
                <a-option value="wh001">深圳湾科技园主仓</a-option>
                <a-option value="wh002">福田CBD分仓</a-option>
              </a-select>
            </a-descriptions-item>
            <a-descriptions-item label="期望交货日期">
              <a-date-picker v-model="orderInfo.deliveryDate" style="width: 100%" />
            </a-descriptions-item>
            <a-descriptions-item label="收货地址" :span="2">
              <a-input v-model="orderInfo.address" placeholder="请输入收货地址" />
            </a-descriptions-item>
            <a-descriptions-item label="联系人">
              <a-input v-model="orderInfo.contact" placeholder="请输入联系人" />
            </a-descriptions-item>
            <a-descriptions-item label="联系电话">
              <a-input v-model="orderInfo.phone" placeholder="请输入联系电话" />
            </a-descriptions-item>
            <a-descriptions-item label="订单备注" :span="2">
              <a-textarea v-model="orderInfo.remark" placeholder="请输入订单备注" :max-length="500" />
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="商品明细" class="mt-16">
          <a-table :data="cartItems" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="name" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="供应商" data-index="supplierName" :width="150" />
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="price">¥{{ record.price }}</span>
                </template>
              </a-table-column>
              <a-table-column title="数量" data-index="quantity" :width="100" align="center" />
              <a-table-column title="小计" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="subtotal">¥{{ (record.price * record.quantity).toFixed(2) }}</span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>

        <a-card title="费用明细" class="mt-16">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="商品金额">
              <span class="price">¥{{ cartTotal }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="运费">
              <span>¥0.00（供应商承担）</span>
            </a-descriptions-item>
            <a-descriptions-item label="订单总额">
              <span class="total-amount">¥{{ cartTotal }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <div class="step-actions">
          <a-button @click="handleCancel">取消</a-button>
          <a-button @click="currentStep = 1">上一步</a-button>
          <a-button type="primary" @click="handleSubmit">提交订单</a-button>
        </div>
      </div>

      <div v-show="currentStep === 3" class="step-content success-content">
        <a-result status="success" title="采购订单提交成功">
          <template #subtitle>
            订单编号：{{ orderNo }}
          </template>
          <template #extra>
            <a-space>
              <a-button type="primary" @click="router.push('/warehouse/order/purchase')">
                查看订单列表
              </a-button>
              <a-button @click="handleContinue">继续采购</a-button>
            </a-space>
          </template>
        </a-result>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const currentStep = ref(1)
const searchKeyword = ref('')
const activeCategory = ref('all')
const selectedProducts = ref<string[]>([])
const productQuantities = ref<Record<string, number>>({})
const orderNo = ref('')

const orderInfo = ref({
  warehouseId: 'wh001',
  deliveryDate: '',
  address: '广东省深圳市南山区科技园南区',
  contact: '张三',
  phone: '13800138000',
  remark: '',
})

const products = ref([
  { id: 'p1', name: '水泥 P.O 42.5', spec: '50kg/袋', category: 'cement', supplierName: '广东建材有限公司', price: 420, stock: 1000, unit: '袋', image: 'https://via.placeholder.com/200x150' },
  { id: 'p2', name: '螺纹钢 HRB400 16mm', spec: '16mm', category: 'steel', supplierName: '上海钢材集团', price: 4100, stock: 500, unit: '吨', image: 'https://via.placeholder.com/200x150' },
  { id: 'p3', name: '黄砂 中砂', spec: '中砂', category: 'sand', supplierName: '惠州砂石厂', price: 85, stock: 2000, unit: '方', image: 'https://via.placeholder.com/200x150' },
  { id: 'p4', name: '碎石 5-31.5mm', spec: '5-31.5mm', category: 'sand', supplierName: '惠州砂石厂', price: 65, stock: 3000, unit: '方', image: 'https://via.placeholder.com/200x150' },
  { id: 'p5', name: '商品混凝土 C30', spec: 'C30', category: 'concrete', supplierName: '深圳混凝土公司', price: 380, stock: 500, unit: '方', image: 'https://via.placeholder.com/200x150' },
  { id: 'p6', name: '水泥 P.O 52.5', spec: '50kg/袋', category: 'cement', supplierName: '广东建材有限公司', price: 480, stock: 800, unit: '袋', image: 'https://via.placeholder.com/200x150' },
  { id: 'p7', name: '螺纹钢 HRB400 20mm', spec: '20mm', category: 'steel', supplierName: '上海钢材集团', price: 4050, stock: 300, unit: '吨', image: 'https://via.placeholder.com/200x150' },
  { id: 'p8', name: '商品混凝土 C40', spec: 'C40', category: 'concrete', supplierName: '深圳混凝土公司', price: 420, stock: 300, unit: '方', image: 'https://via.placeholder.com/200x150' },
])

const cartItems = ref<any[]>([])

const filteredProducts = computed(() => {
  let result = products.value
  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.category === activeCategory.value)
  }
  if (searchKeyword.value) {
    result = result.filter(p => 
      p.name.includes(searchKeyword.value) || 
      p.spec.includes(searchKeyword.value)
    )
  }
  return result
})

const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

function handleSearch() {
  Message.success('商品搜索完成')
}

function handleAddToCart(product: any) {
  const quantity = productQuantities.value[product.id] || 1
  if (quantity > product.stock) {
    Message.warning('数量超过库存')
    return
  }
  
  const existingIndex = cartItems.value.findIndex(item => item.id === product.id)
  if (existingIndex >= 0) {
    cartItems.value[existingIndex].quantity = quantity
  } else {
    cartItems.value.push({
      ...product,
      quantity,
    })
    selectedProducts.value.push(product.id)
  }
  Message.success('已添加到采购清单')
}

function handleRemoveFromCart(record: any) {
  const index = cartItems.value.findIndex(item => item.id === record.id)
  if (index >= 0) {
    cartItems.value.splice(index, 1)
    selectedProducts.value = selectedProducts.value.filter(id => id !== record.id)
  }
}

function handleSubmit() {
  if (currentStep.value === 1) {
    currentStep.value = 2
    return
  }
  
  if (!orderInfo.value.warehouseId || !orderInfo.value.deliveryDate) {
    Message.warning('请完善订单信息')
    return
  }
  
  orderNo.value = 'PO' + Date.now()
  currentStep.value = 3
  Message.success('采购订单提交成功')
}

function handleCancel() {
  router.push('/warehouse/order/purchase')
}

function handleContinue() {
  currentStep.value = 1
  cartItems.value = []
  selectedProducts.value = []
  productQuantities.value = {}
}
</script>

<style scoped lang="less">
.purchase-create {
  padding: 16px;
}

.steps {
  margin-bottom: 24px;
}

.step-content {
  min-height: 400px;
}

.mt-16 {
  margin-top: 16px;
}

.product-card {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: all 0.2s;

  &:hover {
    border-color: rgb(var(--primary-6));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: rgb(var(--primary-6));
    background: var(--color-primary-light-1);
  }

  .product-image {
    height: 120px;
    background: var(--color-fill-2);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-info {
    padding: 12px;

    .product-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .product-spec {
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 4px;
    }

    .product-supplier {
      font-size: 12px;
      color: var(--color-text-2);
      margin-bottom: 8px;
    }

    .product-price {
      margin-bottom: 4px;

      .price {
        font-size: 18px;
        font-weight: 600;
        color: #f53f3f;
      }

      .unit {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }

    .product-stock {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }

  .product-actions {
    padding: 8px 12px;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.cart-summary {
  padding: 16px;
  background: var(--color-fill-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;

  .total {
    font-size: 16px;

    .amount {
      font-size: 24px;
      font-weight: 600;
      color: #f53f3f;
    }
  }
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #f53f3f;
}

.step-actions {
  margin-top: 24px;
  text-align: center;

  .arco-btn {
    margin: 0 8px;
    min-width: 120px;
  }
}

.success-content {
  padding: 60px 0;
}
</style>
