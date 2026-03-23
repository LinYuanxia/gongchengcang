<template>
  <a-drawer
    :visible="visible"
    title="库存管理"
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
      
      <a-form-item label="当前库存">
        <span class="stock">{{ product.stock }}</span>
      </a-form-item>
      
      <a-form-item label="调整类型" required>
        <a-radio-group v-model="form.type">
          <a-radio value="in">入库</a-radio>
          <a-radio value="out">出库</a-radio>
        </a-radio-group>
      </a-form-item>
      
      <a-form-item label="调整数量" required>
        <a-input-number 
          v-model="form.quantity" 
          :min="1" 
          style="width: 100%"
        />
      </a-form-item>
      
      <a-form-item label="备注">
        <a-textarea v-model="form.remark" placeholder="请输入备注" :max-length="200" />
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
  type: 'in',
  quantity: 1,
  remark: '',
})

watch(() => props.visible, (val) => {
  if (val) {
    form.value = {
      type: 'in',
      quantity: 1,
      remark: '',
    }
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
.stock {
  font-size: 18px;
  font-weight: 600;
  color: #165dff;
}
</style>
