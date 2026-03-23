<template>
  <a-drawer
    :visible="visible"
    title="SPU详情"
    :width="720"
    :footer="false"
    @cancel="handleCancel"
  >
    <div v-if="spu" class="detail-container">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="SPU编码">{{ spu.spuCode || '-' }}</a-descriptions-item>
        <a-descriptions-item label="SPU名称">{{ spu.spuName }}</a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ spu.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="计量单位">{{ spu.unit }}</a-descriptions-item>
        <a-descriptions-item label="关联属性" :span="2">
          <a-tag v-for="name in spu.attrNames" :key="name" style="margin: 2px">{{ name }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ spu.skuCount || 0 }}</a-descriptions-item>
        <a-descriptions-item label="审核状态">
          <a-tag :color="getAuditStatusColor(spu.auditStatus)">
            {{ getAuditStatusText(spu.auditStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="审核备注" :span="2">
          {{ spu.auditRemark || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="审核人">{{ spu.auditedByName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="审核时间">{{ spu.auditedAt || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ spu.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ spu.updatedAt }}</a-descriptions-item>
        <a-descriptions-item label="商品描述" :span="2">
          {{ spu.description || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">
          {{ spu.remark || '-' }}
        </a-descriptions-item>
      </a-descriptions>

      <div v-if="spu.mainImage || spu.images?.length" class="image-section">
        <h4>商品图片</h4>
        <div class="image-list">
          <a-image v-if="spu.mainImage" :src="spu.mainImage" :width="100" :height="100" fit="cover" />
          <a-image 
            v-for="(img, index) in spu.images" 
            :key="index" 
            :src="img" 
            :width="100" 
            :height="100" 
            fit="cover" 
          />
        </div>
      </div>

      <div class="sku-section">
        <h4>SKU列表</h4>
        <a-table :data="skuList" :loading="skuLoading" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
            <a-table-column title="SKU名称" data-index="skuName" :width="160" />
            <a-table-column title="规格" :width="150">
              <template #cell="{ record }">
                <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 4px">
                  <a-tag size="small">{{ value }}</a-tag>
                </span>
              </template>
            </a-table-column>
            <a-table-column title="建议售价" :width="100">
              <template #cell="{ record }">
                <span v-if="record.suggestPrice">¥{{ record.suggestPrice.toFixed(2) }}</span>
                <span v-else>-</span>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="80">
              <template #cell="{ record }">
                <a-tag :color="getAuditStatusColor(record.auditStatus)" size="small">
                  {{ getAuditStatusText(record.auditStatus) }}
                </a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SupplierProductAuditStatus, type SupplierProductSpu, type SupplierProductSku } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  spu: SupplierProductSpu | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const skuLoading = ref(false)
const skuList = ref<SupplierProductSku[]>([])

function getAuditStatusColor(status: SupplierProductAuditStatus) {
  const colorMap: Record<string, string> = {
    [SupplierProductAuditStatus.DRAFT]: 'gray',
    [SupplierProductAuditStatus.PENDING]: 'orange',
    [SupplierProductAuditStatus.APPROVED]: 'green',
    [SupplierProductAuditStatus.REJECTED]: 'red',
  }
  return colorMap[status] || 'gray'
}

function getAuditStatusText(status: SupplierProductAuditStatus) {
  const textMap: Record<string, string> = {
    [SupplierProductAuditStatus.DRAFT]: '草稿',
    [SupplierProductAuditStatus.PENDING]: '待审核',
    [SupplierProductAuditStatus.APPROVED]: '已通过',
    [SupplierProductAuditStatus.REJECTED]: '已驳回',
  }
  return textMap[status] || status
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.spu) {
      loadSkuList()
    }
  }
)

async function loadSkuList() {
  skuLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 200))
    skuList.value = [
      {
        id: 'ssku001',
        supplierId: 'supplier001',
        spuId: 'spu001',
        supplierSpuId: props.spu?.id || '',
        skuCode: 'SKU-LWG-001-12',
        skuName: '螺纹钢 HRB400E 12mm',
        specs: { '规格': '12mm', '材质': 'HRB400E' },
        unit: '吨',
        mainImage: 'https://picsum.photos/200/200?random=20',
        suggestPrice: 3850,
        supplyPrice: 3700,
        auditStatus: SupplierProductAuditStatus.DRAFT,
        createdAt: '2024-01-15 10:35:00',
        updatedAt: '2024-01-15 10:35:00',
      },
      {
        id: 'ssku002',
        supplierId: 'supplier001',
        spuId: 'spu001',
        supplierSpuId: props.spu?.id || '',
        skuCode: 'SKU-LWG-001-16',
        skuName: '螺纹钢 HRB400E 16mm',
        specs: { '规格': '16mm', '材质': 'HRB400E' },
        unit: '吨',
        mainImage: 'https://picsum.photos/200/200?random=21',
        suggestPrice: 3800,
        supplyPrice: 3650,
        auditStatus: SupplierProductAuditStatus.DRAFT,
        createdAt: '2024-01-15 10:36:00',
        updatedAt: '2024-01-15 10:36:00',
      },
    ]
  } finally {
    skuLoading.value = false
  }
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.detail-container {
  padding-bottom: 20px;
}

.image-section {
  margin-top: 24px;
  
  h4 {
    margin-bottom: 12px;
    font-weight: 500;
  }
}

.image-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sku-section {
  margin-top: 24px;
  
  h4 {
    margin-bottom: 12px;
    font-weight: 500;
  }
}
</style>
