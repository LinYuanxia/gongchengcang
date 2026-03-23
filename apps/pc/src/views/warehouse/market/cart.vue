<template>
  <div class="cart-page">
    <a-card>
      <template #title>
        <span>购物车</span>
        <span class="cart-count">（共 {{ cartItems.length }} 件商品）</span>
      </template>
      <template #extra>
        <a-button v-if="selectedItems.length > 0" status="danger" @click="handleClearSelected">
          删除选中
        </a-button>
      </template>

      <a-table 
        :data="cartItems" 
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
      >
        <template #columns>
          <a-table-column title="商品信息" :width="350">
            <template #cell="{ record }">
              <div class="product-info">
                <img :src="record.image" class="product-image" />
                <div class="product-detail">
                  <div class="product-name">{{ record.productName }}</div>
                  <div class="product-spec">{{ record.specName }}</div>
                  <div class="supplier-name">{{ record.supplierName }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" :width="150" align="center">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.quantity"
                :min="1"
                :max="record.stock"
                mode="button"
                size="small"
                @change="handleQuantityChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="小计" :width="120" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ (record.price * record.quantity).toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" align="center">
            <template #cell="{ record }">
              <a-link status="danger" @click="handleRemove(record)">删除</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="empty" v-if="cartItems.length === 0">
        <a-empty description="购物车是空的">
          <a-button type="primary" @click="handleGoMarket">去购物</a-button>
        </a-empty>
      </div>
    </a-card>

    <div class="bottom-bar" v-if="cartItems.length > 0">
      <div class="select-all">
        <a-checkbox v-model="selectAll" @change="handleSelectAll">全选</a-checkbox>
      </div>
      <div class="total-info">
        <span class="selected-count">已选 {{ selectedItems.length }} 件</span>
        <span class="total-label">合计：</span>
        <span class="total-price">¥{{ totalPrice }}</span>
      </div>
      <a-button type="primary" size="large" :disabled="selectedItems.length === 0" @click="handleCheckout">
        结算（{{ selectedItems.length }}）
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

const router = useRouter()
const selectedKeys = ref<string[]>([])

const cartItems = ref([
  {
    id: 'cart1',
    productId: 'mp001',
    productName: '水泥 P.O 42.5 普通硅酸盐水泥',
    specName: 'P.O 42.5 散装',
    supplierId: 's001',
    supplierName: '华新水泥供应商',
    image: 'https://picsum.photos/100/100?random=1',
    price: 420,
    quantity: 10,
    stock: 500,
  },
  {
    id: 'cart2',
    productId: 'mp001',
    productName: '水泥 P.O 42.5 普通硅酸盐水泥',
    specName: 'P.O 42.5 袋装50kg',
    supplierId: 's002',
    supplierName: '海螺水泥供应商',
    image: 'https://picsum.photos/100/100?random=2',
    price: 415,
    quantity: 20,
    stock: 300,
  },
  {
    id: 'cart3',
    productId: 'mp002',
    productName: '螺纹钢 HRB400 16mm',
    specName: 'HRB400 16mm',
    supplierId: 's003',
    supplierName: '宝钢供应商',
    image: 'https://picsum.photos/100/100?random=3',
    price: 4000,
    quantity: 5,
    stock: 100,
  },
])

const rowSelection = {
  checkboxProps: {
    disabled: false,
  },
}

const selectedItems = computed(() => {
  return cartItems.value.filter(item => selectedKeys.value.includes(item.id))
})

const selectAll = computed({
  get: () => selectedKeys.value.length === cartItems.value.length && cartItems.value.length > 0,
  set: () => {},
})

const totalPrice = computed(() => {
  return selectedItems.value
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

function handleSelectAll(checked: boolean) {
  if (checked) {
    selectedKeys.value = cartItems.value.map(item => item.id)
  } else {
    selectedKeys.value = []
  }
}

function handleQuantityChange(record: any) {
  Message.success('数量已更新')
}

function handleRemove(record: any) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要从购物车中删除该商品吗？`,
    onOk: () => {
      const index = cartItems.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        cartItems.value.splice(index, 1)
        selectedKeys.value = selectedKeys.value.filter(key => key !== record.id)
      }
      Message.success('已删除')
    }
  })
}

function handleClearSelected() {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedItems.value.length} 件商品吗？`,
    onOk: () => {
      cartItems.value = cartItems.value.filter(item => !selectedKeys.value.includes(item.id))
      selectedKeys.value = []
      Message.success('已删除')
    }
  })
}

function handleGoMarket() {
  router.push('/warehouse/market/list')
}

function handleCheckout() {
  if (selectedItems.value.length === 0) {
    Message.warning('请选择要结算的商品')
    return
  }
  
  const itemIds = selectedItems.value.map(item => item.id).join(',')
  router.push({
    path: '/warehouse/market/order-create',
    query: { cartItemIds: itemIds }
  })
}
</script>

<style scoped lang="less">
.cart-page {
  padding: 16px;
  padding-bottom: 100px;
}

.cart-count {
  font-size: 14px;
  color: var(--color-text-3);
  font-weight: normal;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
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

.supplier-name {
  font-size: 12px;
  color: rgb(var(--primary-6));
}

.price {
  font-size: 14px;
  color: var(--color-text-1);
}

.subtotal {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--danger-6));
}

.empty {
  padding: 60px 0;
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
  padding: 0 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.select-all {
  margin-right: 24px;
}

.total-info {
  flex: 1;
  display: flex;
  align-items: baseline;
}

.selected-count {
  font-size: 14px;
  color: var(--color-text-2);
  margin-right: 24px;
}

.total-label {
  font-size: 14px;
  color: var(--color-text-2);
}

.total-price {
  font-size: 24px;
  font-weight: 600;
  color: rgb(var(--danger-6));
}
</style>
