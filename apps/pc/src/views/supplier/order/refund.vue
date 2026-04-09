<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>退款管理</span>
      </template>

      <a-tabs v-model:active-tab="activeTab" class="refund-tabs">
        <a-tab-pane key="all" :title="`全部 (${refundStats.total})`" />
        <a-tab-pane key="pending" :title="`待确认 (${refundStats.pending})`" />
        <a-tab-pane key="rejected" :title="`已拒绝 (${refundStats.rejected})`" />
        <a-tab-pane key="confirmed" :title="`已完成 (${refundStats.confirmed})`" />
      </a-tabs>

      <a-table
        :data="filteredRefundList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="退款单号" data-index="refundNo" :width="180" fixed="left">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.refundNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleGoOrder(record.orderId)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="退款状态" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getRefundStatusColor(record.status)">
                {{ getRefundStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="退款金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.refundAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="退款原因" :width="200">
            <template #cell="{ record }">
              <div class="text-truncate" :title="record.reason">
                {{ record.reason }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="发起方" data-index="initiator" :width="100" />
          <a-table-column title="申请时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="detailVisible"
      title="退款详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="退款单号">{{ currentRefund.refundNo }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">
          <a-link @click="handleGoOrder(currentRefund.orderId)">{{ currentRefund.orderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="退款状态">
          <a-tag :color="getRefundStatusColor(currentRefund.status)">
            {{ getRefundStatusText(currentRefund.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="退款金额" :span="2">
          <span class="text-danger text-xl">¥{{ currentRefund.refundAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="发起方">{{ currentRefund.initiator }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ currentRefund.createTime }}</a-descriptions-item>
        <a-descriptions-item label="退款原因" :span="2">{{ currentRefund.reason }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRefund.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="currentRefund.confirmTime" label="确认时间">{{ currentRefund.confirmTime }}</a-descriptions-item>
        <a-descriptions-item v-if="currentRefund.confirmedBy" label="确认人">{{ currentRefund.confirmedBy }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>操作记录</a-divider>

      <a-timeline>
        <a-timeline-item :label="currentRefund.createTime">
          供应商 {{ currentRefund.initiator }} 发起退款申请
        </a-timeline-item>
        <a-timeline-item v-if="currentRefund.status === 'confirmed'" :label="currentRefund.confirmTime" color="green">
          工程仓 {{ currentRefund.confirmedBy }} 确认退款，退款完成
        </a-timeline-item>
        <a-timeline-item v-if="currentRefund.status === 'rejected'" :label="currentRefund.confirmTime" color="red">
          工程仓 {{ currentRefund.confirmedBy }} 拒绝退款：{{ currentRefund.remark || '原因详见备注' }}
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <a-modal
      v-model:visible="applyVisible"
      title="申请退款"
      :width="600"
      @ok="handleApplySubmit"
      @cancel="applyVisible = false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        退款申请提交后，将进入待确认状态，需工程仓确认后完成退款。
      </a-alert>

      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ applyOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ applyOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额" :span="2">¥{{ applyOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="applyForm" layout="vertical">
        <a-form-item label="退款金额" required>
          <a-input-number
            v-model="applyForm.refundAmount"
            :min="1"
            :max="applyOrder.totalAmount"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="退款原因" required>
          <a-select v-model="applyForm.reason" placeholder="请选择退款原因">
            <a-option value="质量问题">质量问题</a-option>
            <a-option value="数量短缺">数量短缺</a-option>
            <a-option value="错发漏发">错发漏发</a-option>
            <a-option value="价格差异">价格差异</a-option>
            <a-option value="协商退款">协商退款</a-option>
            <a-option value="其他">其他原因</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="applyForm.remark" placeholder="请输入详细说明（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { getSupplierOrderList } from '@gongchengcang/api'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const activeTab = ref('all')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const { list: orders } = getSupplierOrderList()

const refundList = ref([
  {
    id: '1',
    refundNo: 'TK202401210001',
    orderId: '1',
    orderNo: 'PO202401001',
    status: 'pending',
    refundAmount: 2850,
    reason: '部分商品无法供货，协商退款10%',
    initiator: '供应商管理员',
    createTime: '2024-01-21 10:30:00',
    remark: '无法供货的5种商品中，有2种需要退款',
    confirmTime: '',
    confirmedBy: '',
  },
  {
    id: '2',
    refundNo: 'TK202401210002',
    orderId: '2',
    orderNo: 'PO202401002',
    status: 'confirmed',
    refundAmount: 15600,
    reason: '协商退款',
    initiator: '供应商管理员',
    createTime: '2024-01-20 14:00:00',
    remark: '订单部分取消',
    confirmTime: '2024-01-20 16:30:00',
    confirmedBy: '工程仓王主管',
  },
  {
    id: '3',
    refundNo: 'TK202401200003',
    orderId: '3',
    orderNo: 'PO202401003',
    status: 'pending',
    refundAmount: 8900,
    reason: '质量问题',
    initiator: '供应商管理员',
    createTime: '2024-01-20 09:15:00',
    remark: '部分批次检验不合格',
    confirmTime: '',
    confirmedBy: '',
  },
  {
    id: '4',
    refundNo: 'TK202401190004',
    orderId: '4',
    orderNo: 'PO202401004',
    status: 'confirmed',
    refundAmount: 1250,
    reason: '数量短缺',
    initiator: '供应商管理员',
    createTime: '2024-01-19 11:00:00',
    remark: '物流途中损耗',
    confirmTime: '2024-01-19 15:00:00',
    confirmedBy: '工程仓李主管',
  },
  {
    id: '5',
    refundNo: 'TK202401180005',
    orderId: '5',
    orderNo: 'PO202401005',
    status: 'rejected',
    refundAmount: 5000,
    reason: '协商退款',
    initiator: '供应商管理员',
    createTime: '2024-01-18 14:00:00',
    remark: '退款原因不充分',
    confirmTime: '2024-01-18 17:30:00',
    confirmedBy: '工程仓张主管',
  },
])

pagination.total = refundList.value.length

const refundStats = computed(() => {
  return {
    total: refundList.value.length,
    pending: refundList.value.filter(r => r.status === 'pending').length,
    rejected: refundList.value.filter(r => r.status === 'rejected').length,
    confirmed: refundList.value.filter(r => r.status === 'confirmed').length,
  }
})

const filteredRefundList = computed(() => {
  let result = refundList.value

  if (activeTab.value === 'pending') {
    result = result.filter(r => r.status === 'pending')
  } else if (activeTab.value === 'rejected') {
    result = result.filter(r => r.status === 'rejected')
  } else if (activeTab.value === 'confirmed') {
    result = result.filter(r => r.status === 'confirmed')
  }

  return result
})

const detailVisible = ref(false)
const currentRefund = ref<any>({})

const applyVisible = ref(false)
const applyOrder = ref<any>({})
const applyForm = reactive({
  refundAmount: 0,
  reason: '',
  remark: '',
})

function handleViewDetail(record: any) {
  currentRefund.value = record
  detailVisible.value = true
}

function handleGoOrder(orderId: string) {
  router.push('/supplier/order')
}

function handlePageChange(page: number) {
  pagination.current = page
}

function getRefundStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    rejected: 'red',
    confirmed: 'green',
  }
  return colors[status] || 'gray'
}

function getRefundStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    rejected: '已拒绝',
    confirmed: '已完成',
  }
  return texts[status] || status
}

function handleApplySubmit() {
  if (!applyForm.refundAmount || !applyForm.reason) {
    Message.warning('请填写完整退款信息')
    return
  }

  const newRefund = {
    id: String(refundList.value.length + 1),
    refundNo: `TK${Date.now().toString().slice(-8)}000${refundList.value.length + 1}`,
    orderId: applyOrder.value.id,
    orderNo: applyOrder.value.orderNo,
    status: 'pending',
    refundAmount: applyForm.refundAmount,
    reason: applyForm.reason,
    initiator: '供应商管理员',
    createTime: new Date().toLocaleString(),
    remark: applyForm.remark,
    confirmTime: '',
    confirmedBy: '',
  }

  refundList.value.unshift(newRefund)
  pagination.total = refundList.value.length
  applyVisible.value = false
  
  Message.success('退款申请已提交，等待工程仓确认')

  applyForm.refundAmount = 0
  applyForm.reason = ''
  applyForm.remark = ''
}

defineExpose({
  applyVisible,
  applyOrder,
})

onMounted(() => {
  if (route.query.action === 'apply' && route.query.orderId) {
    const order = orders.find((o: any) => o.id === route.query.orderId)
    if (order) {
      applyOrder.value = order
      applyForm.refundAmount = order.totalAmount
      applyVisible.value = true
    }
  }
})
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.refund-tabs) {
  margin-bottom: 16px;

  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.text-danger {
  color: rgb(var(--danger-6));
}

.text-xl {
  font-size: 18px;
  font-weight: 600;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mt-16 {
  margin-top: 16px;
}
</style>
