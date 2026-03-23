<template>
  <a-drawer
    :visible="visible"
    title="调整销售价"
    :width="400"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="form" layout="vertical" v-if="product">
      <a-form-item label="商品名称">
        <span>{{ product.productName }}</span>
      </a-form-item>
      
      <a-form-item label="规格">
        <span>{{ product.spec }}</span>
      </a-form-item>
      
      <a-form-item label="当前销售价">
        <span class="price">¥{{ product.salePrice }}</span>
      </a-form-item>
      
      <a-form-item label="新销售价" required>
        <a-input-number 
          v-model="form.salePrice" 
          :min="0" 
          :precision="2"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </a-input-number>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  product: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  salePrice: 0,
})

watch(() => props.visible, (val) => {
  if (val && props.product) {
    form.value.salePrice = props.product.salePrice
  }
})

function handleOk() {
  emit('success')
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.price {
  color: #f53f3f;
  font-weight: 500;
  font-size: 16px;
}
</style>
