<template>
  <a-drawer
    :visible="visible"
    title="SPU详情"
    :width="640"
    @cancel="handleCancel"
  >
    <template v-if="spu">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="SPU ID">{{ spu.spuId }}</a-descriptions-item>
        <a-descriptions-item label="SPU编码">{{ spu.spuCode || '-' }}</a-descriptions-item>
        <a-descriptions-item label="SPU名称" :span="2">{{ spu.spuName }}</a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ spu.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="计量单位">{{ spu.unit }}</a-descriptions-item>
        <a-descriptions-item label="关联属性" :span="2">
          <a-tag v-for="(name, index) in spu.attrNames" :key="index" style="margin: 2px">
            {{ name }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ spu.skuCount || 0 }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="spu.status === SpuStatus.ENABLED ? 'green' : 'red'">
            {{ spu.status === SpuStatus.ENABLED ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ spu.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ spu.updatedAt }}</a-descriptions-item>
        <a-descriptions-item label="主图" :span="2">
          <a-image v-if="spu.mainImage" :src="spu.mainImage" :width="120" :height="120" fit="cover" />
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">
          {{ spu.description || '-' }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">关联SKU列表</a-divider>
      <a-table :data="skuList" :loading="skuLoading" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="150" />
          <a-table-column title="SKU名称" data-index="skuName" :width="200" />
          <a-table-column title="规格" :width="200">
            <template #cell="{ record }">
              <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                {{ key }}: {{ value }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === SkuStatus.ON_SHELF ? 'green' : 'red'" size="small">
                {{ record.status === SkuStatus.ON_SHELF ? '上架' : '下架' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SpuStatus, SkuStatus } from '@gongchengcang/types'
import type { Spu, Sku } from '@gongchengcang/types'
import { getSkuListBySpu } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  spu: Spu | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const skuList = ref<Sku[]>([])
const skuLoading = ref(false)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.spu) {
      skuLoading.value = true
      try {
        skuList.value = await getSkuListBySpu(props.spu.spuId)
      } finally {
        skuLoading.value = false
      }
    }
  }
)

function handleCancel() {
  emit('update:visible', false)
}
</script>
