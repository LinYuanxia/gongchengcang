<template>
  <a-drawer
    :visible="visible"
    title="商户资质信息"
    :width="640"
    :footer="false"
    @cancel="handleClose"
    unmount-on-close
  >
    <a-spin :loading="loading" style="width: 100%">
      <a-table :data="qualifications" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="资质名称" data-index="qualName" :width="150" />
          <a-table-column title="证书编号" data-index="certNo" :width="120" />
          <a-table-column title="发证日期" data-index="issueDate" :width="120" />
          <a-table-column title="有效期" data-index="expireDate" :width="120" />
          <a-table-column title="发证机关" data-index="issuingAuthority" :width="150" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="QUALIFICATION_STATUS_MAP[record.status]?.color">
                {{ QUALIFICATION_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handlePreview(record)">查看文件</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { QUALIFICATION_STATUS_MAP } from '@gongchengcang/constants'
import { getQualificationList } from '@gongchengcang/api'
import type { Qualification } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  tenantId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const loading = ref(false)
const qualifications = ref<Qualification[]>([])

watch(
  () => props.visible,
  async (val) => {
    if (val && props.tenantId) {
      await loadData()
    }
  }
)

async function loadData() {
  loading.value = true
  try {
    const res = await getQualificationList({
      page: 1,
      pageSize: 100,
      tenantId: props.tenantId,
    })
    qualifications.value = res.list
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handlePreview(record: Qualification) {
  if (record.fileUrl) {
    window.open(record.fileUrl, '_blank')
  }
}

function handleClose() {
  emit('update:visible', false)
}
</script>
