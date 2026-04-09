<template>
  <div class="invoice-detail">
    <a-card>
      <template #title>
        <a-space>
          <a-button type="text" @click="handleBack">
            <template #icon><icon-left /></template>
            返回
          </a-button>
          <span>发票详情</span>
          <a-tag :color="getStatusColor(invoiceData.status)">
            {{ getStatusText(invoiceData.status) }}
          </a-tag>
          <a-tag
            v-if="invoiceData.status === 'issued'"
            :color="getComplianceColor(invoiceData.complianceStatus)"
          >
            {{ getComplianceText(invoiceData.complianceStatus) }}
          </a-tag>
        </a-space>
      </template>
      <template #extra v-if="invoiceData.status === 'unissued' && invoiceData.pendingAmount > 0">
        <a-button type="primary" status="success" @click="handleUpload">
          <template #icon><icon-file-add /></template>
          上传发票
        </a-button>
      </template>

      <a-steps :current="currentStep" :style="{ margin: '20px 0 40px' }">
        <a-step title="订单完成" description="订单已完成，自动生成待开票记录" />
        <a-step title="发票开具" description="上传发票信息" />
        <a-step title="合规校验" description="系统自动校验发票合规性" />
      </a-steps>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-card title="发票信息" :bordered="false">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="记录ID" :span="2">
                {{ invoiceData.id }}
              </a-descriptions-item>
              <a-descriptions-item label="关联订单">
                <a-link @click="handleViewOrder">{{ invoiceData.orderNo }}</a-link>
              </a-descriptions-item>
              <a-descriptions-item label="订单类型">
                {{ invoiceData.orderType === 'sale' ? '销售订单' : '采购订单' }}
              </a-descriptions-item>
              <a-descriptions-item label="发票号码">
                {{ invoiceData.invoiceNo || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="开票日期">
                {{ invoiceData.invoiceDate || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="创建时间" :span="2">
                {{ invoiceData.createdAt }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="金额明细" :bordered="false">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="订单总金额">
                <span class="text-primary">¥{{ invoiceData.orderAmount.toFixed(2) }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="已支付金额">
                <span class="text-success">¥{{ invoiceData.paidAmount.toFixed(2) }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="已开票金额">
                <span>¥{{ invoiceData.invoiceAmount.toFixed(2) }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="待开票金额">
                <span class="text-warning">¥{{ invoiceData.pendingAmount.toFixed(2) }}</span>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>

      <a-card title="发票附件" :bordered="false" :style="{ marginTop: '16px' }" v-if="invoiceData.invoiceUrl">
        <a-space>
          <a-thumbnail :width="150">
            <img :src="invoiceData.invoiceUrl" alt="发票预览" style="width: 100%" />
          </a-thumbnail>
          <a-button>
            <template #icon><icon-download /></template>
            下载发票
          </a-button>
        </a-space>
      </a-card>

      <a-card title="操作日志" :bordered="false" :style="{ marginTop: '16px' }">
        <a-timeline>
          <a-timeline-item label-color="green">
            <template #label>{{ invoiceData.createdAt }}</template>
            <p><strong>{{ invoiceData.creatorName }}</strong> 创建了待开票记录</p>
            <p class="text-desc">关联订单：{{ invoiceData.orderNo }}</p>
          </a-timeline-item>
          <a-timeline-item v-if="invoiceData.status === 'issued'" label-color="blue">
            <template #label>{{ invoiceData.updatedAt }}</template>
            <p><strong>系统</strong> 完成发票开具</p>
            <p class="text-desc">发票号码：{{ invoiceData.invoiceNo }}</p>
          </a-timeline-item>
          <a-timeline-item
            v-if="invoiceData.complianceStatus === 'abnormal'"
            label-color="red"
            dot-color="red"
          >
            <template #label>{{ invoiceData.updatedAt }}</template>
            <p><strong>系统</strong> 标记发票异常</p>
            <p class="text-danger">异常原因：{{ invoiceData.abnormalReason }}</p>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </a-card>

    <a-modal v-model:visible="uploadModalVisible" title="上传发票" :width="600" @ok="handleUploadConfirm">
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 20px">
        <a-descriptions-item label="订单号">{{ invoiceData.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="待开票金额">
          <span class="text-warning">¥{{ invoiceData.pendingAmount.toFixed(2) }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-form :model="uploadForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="本次开票金额" required>
              <a-input-number
                v-model="uploadForm.amount"
                :min="0.01"
                :max="invoiceData.pendingAmount"
                :precision="2"
                placeholder="请输入金额"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发票号码" required>
              <a-input v-model="uploadForm.invoiceNo" placeholder="请输入发票号码" maxlength="20" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="开票日期" required>
          <a-date-picker v-model="uploadForm.invoiceDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="发票附件">
          <a-upload
            v-model:file-list="uploadForm.files"
            action="/"
            :limit="3"
            accept=".pdf,.jpg,.png"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              上传发票文件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

interface InvoiceRecord {
  id: string
  orderId: string
  orderNo: string
  orderType: 'purchase' | 'sale'
  orderAmount: number
  paidAmount: number
  invoiceAmount: number
  pendingAmount: number
  status: 'unissued' | 'issued'
  complianceStatus: 'normal' | 'abnormal'
  abnormalReason?: string
  invoiceNo?: string
  invoiceDate?: string
  invoiceUrl?: string
  creatorName: string
  createdAt: string
  updatedAt: string
}

const uploadModalVisible = ref(false)
const uploadForm = reactive({
  amount: 0,
  invoiceNo: '',
  invoiceDate: '',
  files: [],
})

const invoiceData = ref<InvoiceRecord>({
  id: '',
  orderId: '',
  orderNo: '',
  orderType: 'sale',
  orderAmount: 0,
  paidAmount: 0,
  invoiceAmount: 0,
  pendingAmount: 0,
  status: 'unissued',
  complianceStatus: 'normal',
  creatorName: '',
  createdAt: '',
  updatedAt: '',
})

const currentStep = computed(() => {
  if (invoiceData.value.status === 'issued') {
    return invoiceData.value.complianceStatus === 'normal' ? 2 : 3
  }
  return 0
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    unissued: 'orange',
    issued: 'green',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    unissued: '未开票',
    issued: '已开票',
  }
  return texts[status] || status
}

function getComplianceColor(status: string) {
  const colors: Record<string, string> = {
    normal: 'green',
    abnormal: 'red',
  }
  return colors[status] || 'gray'
}

function getComplianceText(status: string) {
  const texts: Record<string, string> = {
    normal: '正常',
    abnormal: '异常',
  }
  return texts[status] || status
}

function handleBack() {
  router.back()
}

function handleViewOrder() {
  Message.info(`查看订单：${invoiceData.value.orderNo}`)
}

function handleUpload() {
  uploadForm.amount = invoiceData.value.pendingAmount
  uploadForm.invoiceNo = ''
  uploadForm.invoiceDate = ''
  uploadForm.files = []
  uploadModalVisible.value = true
}

function handleUploadConfirm() {
  if (!uploadForm.amount || uploadForm.amount <= 0) {
    Message.warning('请输入开票金额')
    return
  }
  if (!uploadForm.invoiceNo.trim()) {
    Message.warning('请输入发票号码')
    return
  }
  if (!uploadForm.invoiceDate) {
    Message.warning('请选择开票日期')
    return
  }

  invoiceData.value.status = 'issued'
  invoiceData.value.invoiceAmount = uploadForm.amount
  invoiceData.value.pendingAmount = invoiceData.value.pendingAmount - uploadForm.amount
  invoiceData.value.invoiceNo = uploadForm.invoiceNo
  invoiceData.value.invoiceDate = uploadForm.invoiceDate
  invoiceData.value.complianceStatus = 'normal'
  invoiceData.value.updatedAt = new Date().toLocaleString()

  Message.success('发票开具成功')
  uploadModalVisible.value = false
}

onMounted(() => {
  const id = route.params.id as string
  const mockData: InvoiceRecord = {
    id: id || 'FP202403250001',
    orderId: 'O001',
    orderNo: 'PO202403200001',
    orderType: 'sale',
    orderAmount: 15000,
    paidAmount: 15000,
    invoiceAmount: 0,
    pendingAmount: 15000,
    status: 'unissued',
    complianceStatus: 'normal',
    creatorName: '供应商A',
    createdAt: '2024-03-25 09:00:00',
    updatedAt: '2024-03-25 09:00:00',
  }
  invoiceData.value = mockData
})
</script>

<style scoped lang="less">
.invoice-detail {
  padding: 16px;

  .text-primary {
    color: var(--color-primary);
    font-weight: 500;
  }

  .text-success {
    color: var(--color-success);
    font-weight: 500;
  }

  .text-warning {
    color: var(--color-warning);
    font-weight: 500;
  }

  .text-danger {
    color: var(--color-danger);
  }

  .text-desc {
    color: var(--color-text-3);
    font-size: 12px;
    margin: 4px 0 0;
  }

  :deep(.arco-descriptions-item-value) {
    font-weight: 500;
  }
}
</style>
