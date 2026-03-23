<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑SKU' : '管理SKU'"
    :width="900"
    :footer="false"
    @cancel="handleCancel"
  >
    <div v-if="spuInfo" class="spu-info-card">
      <div class="spu-header">
        <a-image :src="spuInfo.mainImage" :width="60" :height="60" fit="cover" />
        <div class="spu-meta">
          <div class="spu-name">{{ spuInfo.spuName }}</div>
          <div class="spu-desc">
            <span>编码: {{ spuInfo.spuCode || '-' }}</span>
            <a-divider direction="vertical" />
            <span>分类: {{ spuInfo.categoryName }}</span>
            <a-divider direction="vertical" />
            <span>单位: {{ spuInfo.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sku-actions">
      <a-button type="primary" @click="handleAddSku">
        <template #icon><icon-plus /></template>
        添加SKU
      </a-button>
    </div>

    <a-table :data="skuList" :loading="loading" :pagination="false" row-key="id">
      <template #columns>
        <a-table-column title="SKU编码" data-index="skuCode" :width="140" />
        <a-table-column title="SKU名称" data-index="skuName" :width="180" />
        <a-table-column title="规格" :width="200">
          <template #cell="{ record }">
            <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
              <a-tag size="small">{{ key }}: {{ value }}</a-tag>
            </span>
          </template>
        </a-table-column>
        <a-table-column title="建议售价" :width="100">
          <template #cell="{ record }">
            <span v-if="record.suggestPrice">¥{{ record.suggestPrice.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </a-table-column>
        <a-table-column title="供货价" :width="100">
          <template #cell="{ record }">
            <span v-if="record.supplyPrice">¥{{ record.supplyPrice.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="80">
          <template #cell="{ record }">
            <a-tag :color="getAuditStatusColor(record.auditStatus)">
              {{ getAuditStatusText(record.auditStatus) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" :width="120" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button 
                type="text" 
                size="small" 
                @click="handleEditSku(record)"
                :disabled="record.auditStatus === SupplierProductAuditStatus.APPROVED"
              >
                编辑
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDeleteSku(record)"
                :disabled="record.auditStatus === SupplierProductAuditStatus.APPROVED"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <a-modal
      v-model:visible="skuFormVisible"
      :title="isEditSku ? '编辑SKU' : '添加SKU'"
      :width="600"
      @ok="handleSkuSubmit"
      @cancel="skuFormVisible = false"
    >
      <a-form ref="skuFormRef" :model="skuFormData" :rules="skuRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="skuCode" label="SKU编码" required>
              <a-input v-model="skuFormData.skuCode" placeholder="请输入SKU编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="skuName" label="SKU名称" required>
              <a-input v-model="skuFormData.skuName" placeholder="请输入SKU名称" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="规格属性">
          <div v-if="spuInfo?.attrIds?.length" class="spec-config">
            <a-row v-for="attrId in spuInfo.attrIds" :key="attrId" :gutter="16" class="spec-row">
              <a-col :span="8">
                <div class="spec-label">{{ getAttrName(attrId) }}</div>
              </a-col>
              <a-col :span="16">
                <a-select
                  v-model="skuFormData.specs[getAttrName(attrId)]"
                  :placeholder="`请选择${getAttrName(attrId)}`"
                  allow-create
                >
                  <a-option v-for="val in getAttrValues(attrId)" :key="val" :value="val">
                    {{ val }}
                  </a-option>
                </a-select>
              </a-col>
            </a-row>
          </div>
          <a-empty v-else description="请先在SPU中配置关联属性" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="suggestPrice" label="建议售价">
              <a-input-number
                v-model="skuFormData.suggestPrice"
                placeholder="请输入建议售价"
                :precision="2"
                :min="0"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="supplyPrice" label="供货价">
              <a-input-number
                v-model="skuFormData.supplyPrice"
                placeholder="请输入供货价"
                :precision="2"
                :min="0"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="mainImage" label="SKU主图">
          <a-upload
            list-type="picture-card"
            :file-list="skuImageFileList"
            :limit="1"
            accept="image/*"
            :auto-upload="false"
            @change="handleSkuImageChange"
          >
            <template #upload-button>
              <div class="upload-trigger">
                <icon-plus />
                <div class="upload-text">上传图片</div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { 
  SupplierProductAuditStatus, 
  type SupplierProductSpu, 
  type SupplierProductSku,
  type ProductAttr,
} from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  sku: SupplierProductSku | null
  spuInfo: SupplierProductSpu | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const loading = ref(false)
const skuList = ref<SupplierProductSku[]>([])
const skuFormVisible = ref(false)
const skuFormRef = ref<FormInstance>()
const skuImageFileList = ref<any[]>([])

const isEdit = computed(() => !!props.sku)
const isEditSku = ref(false)

const mockAttrList: ProductAttr[] = [
  { attrId: 'attr001', attrName: '规格', attrType: 'single' as any, optionValues: ['10mm', '12mm', '14mm', '16mm', '18mm', '20mm'], sortOrder: 1, status: 1, createdAt: '', updatedAt: '' },
  { attrId: 'attr002', attrName: '材质', attrType: 'single' as any, optionValues: ['HRB400', 'HRB400E', 'HRB500', 'HRB500E'], sortOrder: 2, status: 1, createdAt: '', updatedAt: '' },
  { attrId: 'attr003', attrName: '强度等级', attrType: 'single' as any, optionValues: ['32.5', '42.5', '52.5'], sortOrder: 3, status: 1, createdAt: '', updatedAt: '' },
]

interface SkuFormData {
  skuCode: string
  skuName: string
  specs: Record<string, string>
  suggestPrice: number | undefined
  supplyPrice: number | undefined
  mainImage: string
}

const skuFormData = reactive<SkuFormData>({
  skuCode: '',
  skuName: '',
  specs: {},
  suggestPrice: undefined,
  supplyPrice: undefined,
  mainImage: '',
})

const skuRules = {
  skuCode: [{ required: true, message: '请输入SKU编码' }],
  skuName: [{ required: true, message: '请输入SKU名称' }],
}

function getAttrName(attrId: string) {
  return mockAttrList.find(a => a.attrId === attrId)?.attrName || attrId
}

function getAttrValues(attrId: string) {
  return mockAttrList.find(a => a.attrId === attrId)?.optionValues || []
}

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
    if (val && props.spuInfo) {
      loadSkuList()
    }
  }
)

async function loadSkuList() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    skuList.value = [
      {
        id: 'ssku001',
        supplierId: 'supplier001',
        supplierName: '优质建材供应商',
        spuId: 'spu001',
        supplierSpuId: props.spuInfo?.id || 'sspu001',
        spuName: props.spuInfo?.spuName || '高强度螺纹钢',
        skuCode: 'SKU-LWG-001-12',
        skuName: '螺纹钢 HRB400E 12mm',
        specs: { '规格': '12mm', '材质': 'HRB400E' },
        unit: props.spuInfo?.unit || '吨',
        mainImage: 'https://picsum.photos/200/200?random=10',
        suggestPrice: 3850,
        supplyPrice: 3700,
        auditStatus: SupplierProductAuditStatus.DRAFT,
        createdAt: '2024-01-15 10:35:00',
        updatedAt: '2024-01-15 10:35:00',
      },
      {
        id: 'ssku002',
        supplierId: 'supplier001',
        supplierName: '优质建材供应商',
        spuId: 'spu001',
        supplierSpuId: props.spuInfo?.id || 'sspu001',
        spuName: props.spuInfo?.spuName || '高强度螺纹钢',
        skuCode: 'SKU-LWG-001-16',
        skuName: '螺纹钢 HRB400E 16mm',
        specs: { '规格': '16mm', '材质': 'HRB400E' },
        unit: props.spuInfo?.unit || '吨',
        mainImage: 'https://picsum.photos/200/200?random=11',
        suggestPrice: 3800,
        supplyPrice: 3650,
        auditStatus: SupplierProductAuditStatus.DRAFT,
        createdAt: '2024-01-15 10:36:00',
        updatedAt: '2024-01-15 10:36:00',
      },
    ]
  } finally {
    loading.value = false
  }
}

function handleAddSku() {
  isEditSku.value = false
  skuFormData.skuCode = ''
  skuFormData.skuName = ''
  skuFormData.specs = {}
  skuFormData.suggestPrice = undefined
  skuFormData.supplyPrice = undefined
  skuFormData.mainImage = ''
  skuImageFileList.value = []
  skuFormVisible.value = true
}

function handleEditSku(record: SupplierProductSku) {
  isEditSku.value = true
  skuFormData.skuCode = record.skuCode
  skuFormData.skuName = record.skuName
  skuFormData.specs = { ...record.specs }
  skuFormData.suggestPrice = record.suggestPrice
  skuFormData.supplyPrice = record.supplyPrice
  skuFormData.mainImage = record.mainImage || ''
  if (record.mainImage) {
    skuImageFileList.value = [{ uid: '1', url: record.mainImage }]
  }
  skuFormVisible.value = true
}

function handleDeleteSku(record: SupplierProductSku) {
  Modal.confirm({
    title: '删除确认',
    content: `确定删除SKU「${record.skuName}」吗？`,
    okText: '确定删除',
    cancelText: '取消',
    onOk: () => {
      const index = skuList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        skuList.value.splice(index, 1)
        Message.success('删除成功')
      }
    },
  })
}

function handleSkuImageChange(fileList: any[]) {
  skuImageFileList.value = fileList
  if (fileList.length > 0 && fileList[0].url) {
    skuFormData.mainImage = fileList[0].url
  } else {
    skuFormData.mainImage = ''
  }
}

async function handleSkuSubmit() {
  try {
    const valid = await skuFormRef.value?.validate()
    if (valid) return

    await new Promise(resolve => setTimeout(resolve, 300))

    if (isEditSku.value) {
      const index = skuList.value.findIndex(item => item.skuCode === skuFormData.skuCode)
      if (index > -1) {
        skuList.value[index] = {
          ...skuList.value[index],
          ...skuFormData,
          specs: { ...skuFormData.specs },
          updatedAt: new Date().toISOString(),
        }
      }
      Message.success('修改成功')
    } else {
      const newSku: SupplierProductSku = {
        id: `ssku-${Date.now()}`,
        supplierId: 'supplier001',
        supplierName: '优质建材供应商',
        spuId: props.spuInfo?.id || '',
        supplierSpuId: props.spuInfo?.id || '',
        spuName: props.spuInfo?.spuName || '',
        skuCode: skuFormData.skuCode,
        skuName: skuFormData.skuName,
        specs: { ...skuFormData.specs },
        unit: props.spuInfo?.unit || '',
        mainImage: skuFormData.mainImage,
        suggestPrice: skuFormData.suggestPrice,
        supplyPrice: skuFormData.supplyPrice,
        auditStatus: SupplierProductAuditStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      skuList.value.push(newSku)
      Message.success('添加成功')
    }

    skuFormVisible.value = false
    emit('success')
  } catch (error) {
    console.error(error)
  }
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.spu-info-card {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.spu-header {
  display: flex;
  gap: 16px;
}

.spu-meta {
  flex: 1;
}

.spu-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.spu-desc {
  color: var(--color-text-3);
  font-size: 13px;
}

.sku-actions {
  margin-bottom: 16px;
}

.spec-config {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 16px;
}

.spec-row {
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.spec-label {
  line-height: 32px;
  font-weight: 500;
}

.upload-trigger {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  
  .upload-text {
    font-size: 12px;
    margin-top: 4px;
  }
}
</style>
