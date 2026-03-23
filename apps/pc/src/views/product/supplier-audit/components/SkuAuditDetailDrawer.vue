<template>
  <a-drawer
    :visible="visible"
    title="SKU审核详情"
    :width="600"
    :footer="false"
    @cancel="handleCancel"
  >
    <div v-if="sku" class="detail-container">
      <div class="sku-image">
        <a-image :src="sku.mainImage" :width="120" :height="120" fit="cover">
          <template #error>
            <div class="image-placeholder">
              <icon-image :size="48" />
            </div>
          </template>
        </a-image>
      </div>

      <a-descriptions :column="2" bordered style="margin-top: 16px;">
        <a-descriptions-item label="SKU编码">{{ sku.skuCode }}</a-descriptions-item>
        <a-descriptions-item label="SKU名称">{{ sku.skuName }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ sku.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="所属SPU">{{ sku.spuName }}</a-descriptions-item>
        <a-descriptions-item label="规格属性" :span="2">
          <span v-for="(value, key) in sku.specs" :key="key" style="margin-right: 8px">
            <a-tag>{{ key }}: {{ value }}</a-tag>
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="计量单位">{{ sku.unit }}</a-descriptions-item>
        <a-descriptions-item label="条形码">{{ sku.barcode || '-' }}</a-descriptions-item>
        <a-descriptions-item label="建议售价">
          <span v-if="sku.suggestPrice" class="price">¥{{ sku.suggestPrice.toFixed(2) }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="供货价">
          <span v-if="sku.supplyPrice" class="price">¥{{ sku.supplyPrice.toFixed(2) }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="审核状态">
          <a-tag :color="getAuditStatusColor(sku.auditStatus)">
            {{ getAuditStatusText(sku.auditStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="提交时间">{{ sku.createdAt }}</a-descriptions-item>
        <a-descriptions-item v-if="sku.auditRemark" label="审核备注" :span="2">
          {{ sku.auditRemark }}
        </a-descriptions-item>
      </a-descriptions>

      <div v-if="sku.auditStatus === SupplierProductAuditStatus.PENDING" class="audit-actions">
        <a-space>
          <a-button status="success" @click="handleAudit(SupplierProductAuditStatus.APPROVED)">
            审核通过
          </a-button>
          <a-button status="danger" @click="showRejectModal">
            驳回
          </a-button>
        </a-space>
      </div>
    </div>

    <a-modal
      v-model:visible="rejectModalVisible"
      title="驳回原因"
      @ok="handleRejectConfirm"
      @cancel="rejectModalVisible = false"
    >
      <a-form :model="rejectForm" layout="vertical">
        <a-form-item label="驳回原因" required>
          <a-textarea
            v-model="rejectForm.reason"
            placeholder="请输入驳回原因"
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { SupplierProductAuditStatus, type SupplierProductSku } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  sku: SupplierProductSku | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  audit: [data: { id: string; status: SupplierProductAuditStatus; reason?: string }]
}>()

const rejectModalVisible = ref(false)
const rejectForm = reactive({ reason: '' })

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

function handleAudit(status: SupplierProductAuditStatus) {
  if (props.sku) {
    emit('audit', { id: props.sku.id, status })
  }
}

function showRejectModal() {
  rejectForm.reason = ''
  rejectModalVisible.value = true
}

function handleRejectConfirm() {
  if (!rejectForm.reason.trim()) {
    Message.warning('请输入驳回原因')
    return
  }
  if (props.sku) {
    emit('audit', { id: props.sku.id, status: SupplierProductAuditStatus.REJECTED, reason: rejectForm.reason })
  }
  rejectModalVisible.value = false
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.detail-container {
  padding-bottom: 20px;
}

.sku-image {
  display: flex;
  justify-content: center;
}

.image-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-fill-2);
  border-radius: 8px;
}

.price {
  color: rgb(var(--danger-6));
  font-weight: 500;
}

.audit-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
</style>
