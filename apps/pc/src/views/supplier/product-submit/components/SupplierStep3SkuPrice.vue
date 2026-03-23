<template>
  <div class="sku-price">
    <div class="price-header">
      <span class="title">SKU定价（共 {{ formData.skuList.length }} 个）</span>
      <a-space>
        <a-button size="small" @click="showBatchSetPrice = true">批量设置价格</a-button>
        <a-button size="small" @click="resetPrices">清空价格</a-button>
      </a-space>
    </div>

    <div v-if="formData.skuList.length === 0" class="empty-tip">
      <a-empty description="请先配置规格属性" />
    </div>

    <a-table v-else :data="formData.skuList" :pagination="false" :scroll="{ x: 800 }" size="small">
      <template #columns>
        <a-table-column title="SKU编码" data-index="skuCode" :width="140" fixed="left">
          <template #cell="{ record }">
            <a-input v-model="record.skuCode" size="small" placeholder="编码" />
          </template>
        </a-table-column>
        <a-table-column title="SKU名称" data-index="skuName" :width="160">
          <template #cell="{ record }">
            <a-input v-model="record.skuName" size="small" placeholder="名称" />
          </template>
        </a-table-column>
        <a-table-column title="规格组合" :width="200">
          <template #cell="{ record }">
            <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
              <a-tag size="small">{{ key }}: {{ value }}</a-tag>
            </span>
          </template>
        </a-table-column>
        <a-table-column title="建议售价" :width="140">
          <template #cell="{ record }">
            <a-input-number v-model="record.suggestPrice" size="small" placeholder="建议售价" :min="0" :precision="2">
              <template #prefix>¥</template>
            </a-input-number>
          </template>
        </a-table-column>
        <a-table-column title="供货价" :width="140">
          <template #cell="{ record }">
            <a-input-number v-model="record.supplyPrice" size="small" placeholder="供货价" :min="0" :precision="2">
              <template #prefix>¥</template>
            </a-input-number>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <a-modal v-model:visible="showBatchSetPrice" title="批量设置价格" @ok="applyBatchPrice">
      <a-form :model="batchPrice" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="建议售价">
              <a-input-number v-model="batchPrice.suggestPrice" placeholder="建议售价" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="供货价">
              <a-input-number v-model="batchPrice.supplyPrice" placeholder="供货价" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert type="info" style="margin-top: 8px">
          填写的价格将应用到所有SKU，留空的价格字段不会被修改
        </a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { SkuPriceInfo } from '@gongchengcang/types'

const props = defineProps<{
  formData: {
    skuList: SkuPriceInfo[]
  }
}>()

const showBatchSetPrice = ref(false)
const batchPrice = reactive({
  suggestPrice: undefined as number | undefined,
  supplyPrice: undefined as number | undefined,
})

function applyBatchPrice() {
  props.formData.skuList.forEach(sku => {
    if (batchPrice.suggestPrice !== undefined) sku.suggestPrice = batchPrice.suggestPrice
    if (batchPrice.supplyPrice !== undefined) sku.supplyPrice = batchPrice.supplyPrice
  })
  showBatchSetPrice.value = false
}

function resetPrices() {
  props.formData.skuList.forEach(sku => {
    sku.suggestPrice = undefined
    sku.supplyPrice = undefined
  })
}

defineExpose({
  validate: async () => {
    return props.formData.skuList.length > 0
  },
})
</script>

<style scoped lang="less">
.sku-price {
  .price-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .empty-tip {
    padding: 40px 0;
  }

  :deep(.arco-input-number) {
    width: 100%;
  }
}
</style>
