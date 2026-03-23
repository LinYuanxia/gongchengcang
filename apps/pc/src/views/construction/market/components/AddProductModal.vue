<template>
  <a-modal 
    :visible="visible"
    title="添加商品到工程仓市场" 
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="form" layout="vertical">
      <a-form-item label="选择工程仓" required>
        <a-select v-model="form.warehouseId" placeholder="请选择工程仓" style="width: 100%">
          <a-option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="选择商品">
        <a-transfer
          v-model="form.productIds"
          :data="transferData"
          :title="['可选商品', '已选商品']"
          :searchable="true"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  visible: boolean
  warehouses: { id: string; name: string }[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  warehouseId: '',
  productIds: [] as string[],
})

const availableProducts = ref([
  { id: 'p001', name: '水泥 P.O 42.5', code: 'SKU-SN-001' },
  { id: 'p002', name: '螺纹钢 HRB400 16mm', code: 'SKU-LG-001' },
  { id: 'p003', name: '黄砂 中砂', code: 'SKU-HS-001' },
  { id: 'p004', name: '碎石 5-31.5mm', code: 'SKU-SS-001' },
  { id: 'p005', name: '商品混凝土 C30', code: 'SKU-HNT-001' },
])

const transferData = computed(() => {
  return availableProducts.value.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }))
})

watch(() => props.visible, (val) => {
  if (val) {
    form.value = {
      warehouseId: '',
      productIds: [],
    }
  }
})

function handleOk() {
  if (!form.value.warehouseId) {
    return
  }
  emit('success')
}

function handleCancel() {
  emit('update:visible', false)
}
</script>
