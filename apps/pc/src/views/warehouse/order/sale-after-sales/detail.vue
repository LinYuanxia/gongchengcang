<template>
  <div class="after-sales-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleBack">返回</a-button>
          
          <a-button
            v-if="order.status === 'pending'"
            type="primary"
            @click="handleAudit"
          >
            审核
          </a-button>

          <a-button
            v-if="order.status === 'approved' && order.afterSalesType === 'logistics'"
            type="primary"
            @click="handleReissue"
          >
            补发商品
          </a-button>

          <a-button
            v-if="order.status === 'approved' && order.afterSalesType === 'quality'"
            type="primary"
            @click="handleComplete"
          >
            完成售后
          </a-button>

          <a-button @click="handleViewOriginalOrder">
            查看原订单
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="售后基本信息">
        <a-descriptions-item label="售后单号">
          <a-space>
            {{ order.afterSalesNo }}
            <icon-copy class="copy-icon" @click="handleCopyAfterSalesNo" />
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="售后状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="order.afterSalesType === 'logistics' ? 'orange' : 'red'">
            {{ order.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="所属仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="来源订单" :span="2">
          <a-link @click="handleViewOriginalOrder">{{ order.originalOrderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="买家信息" :span="2">{{ order.buyerName }} / {{ order.buyerContact }} / {{ order.buyerPhone }}</a-descriptions-item>
        <a-descriptions-item label="收货信息" :span="2">{{ order.buyerAddress }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ order.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="处理时间">{{ order.processTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="关联售后订单" :span="4">
          <template v-if="order.relatedAfterSalesOrders && order.relatedAfterSalesOrders.length > 0">
            <a-space wrap>
              <a-link 
                v-for="(orderNo, idx) in order.relatedAfterSalesOrders" 
                :key="idx" 
                @click="handleViewRelatedAfterSales(orderNo)"
              >{{ orderNo }}</a-link>
            </a-space>
          </template>
          <span v-else class="text-gray">暂无关联售后订单</span>
        </a-descriptions-item>
        <a-descriptions-item label="售后原因" :span="4">{{ order.reason }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>售后商品明细</h3>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="订单数量" :width="80" align="center">
            <template #cell="{ record }">{{ record.orderQuantity }}</template>
          </a-table-column>
          <a-table-column title="售后数量" :width="80" align="center">
            <template #cell="{ record }"><a-tag color="red">{{ record.quantity }}</a-tag></template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }"><span class="price">¥{{ record.price }}</span></template>
          </a-table-column>
          <a-table-column title="售后金额" :width="120" align="right">
            <template #cell="{ record }"><span class="price">¥{{ (record.quantity * record.price).toFixed(2) }}</span></template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>售后图片</h3>
      <div v-if="order.images && order.images.length > 0" class="image-list">
        <a-image
          v-for="(img, idx) in order.images"
          :key="idx"
          :src="img"
          :width="120"
          :height="120"
          style="border-radius: 4px; cursor: pointer; margin-right: 8px"
          :preview="true"
        />
      </div>
      <span v-else class="text-gray">暂无图片</span>

      <a-divider />

      <h3>处理日志</h3>
      <a-table :data="afterSalesLogs" :pagination="false">
        <template #columns>
          <a-table-column title="操作时间" data-index="operateTime" :width="180" />
          <a-table-column title="操作类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getLogTypeColor(record.type)">{{ getLogTypeText(record.type) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作人" data-index="operator" :width="120" />
          <a-table-column title="日志内容" data-index="content" />
        </template>
      </a-table>
    </a-card>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:visible="auditModalVisible"
      title="审核售后申请"
      :width="500"
      @ok="handleAuditSubmit"
      @cancel="cancelAudit"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="售后单号">{{ order.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="order.afterSalesType === 'logistics' ? 'orange' : 'red'">
            {{ order.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="原订单号" :span="2">
          <a-link>{{ order.originalOrderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="买家信息" :span="2">{{ order.buyerName }} / {{ order.buyerContact }} / {{ order.buyerPhone }}</a-descriptions-item>
        <a-descriptions-item label="收货信息" :span="2">{{ order.buyerAddress }}</a-descriptions-item>
        <a-descriptions-item label="售后原因" :span="2">{{ order.reason || '无' }}</a-descriptions-item>
      </a-descriptions>
      <a-form :model="auditForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="pass">审核通过</a-radio>
            <a-radio value="reject">审核不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="auditForm.result === 'reject'" label="驳回原因" required>
          <a-textarea v-model="auditForm.rejectReason" placeholder="请输入驳回原因" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 补发弹窗 -->
    <a-modal
      v-model:visible="reissueModalVisible"
      title="补发商品"
      :width="1000"
      @ok="handleReissueSubmit"
      @cancel="cancelReissue"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>补发后将在销售订单中生成补发订单，关联原订单和售后单</div>
        </template>
      </a-alert>

      <a-form :model="reissueForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="补发货仓库" required>
              <a-select v-model="reissueForm.warehouseId" placeholder="请选择发货仓库">
                <a-option value="wh001">深圳湾科技园主仓</a-option>
                <a-option value="wh002">福田CBD分仓</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-divider>补发商品明细</a-divider>
      
      <a-table :data="currentOrder.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
          <a-table-column title="售后数量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="补发库存输入" :width="180">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.reissueQuantity"
                :min="1"
                :max="record.quantity * 10"
                :precision="0"
                style="width: 140px"
                placeholder="输入补发数量"
              />
            </template>
          </a-table-column>
          <a-table-column title="批次号" :width="150">
            <template #cell="{ record }">
              <a-select
                v-model="record.batchNo"
                placeholder="选择批次"
                style="width: 100%"
              >
                <a-option v-for="batch in getAvailableBatches(record)" :key="batch.batchNo" :value="batch.batchNo">
                  {{ batch.batchNo }} (可用: {{ batch.currentStock }})
                </a-option>
              </a-select>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
        <a-space>
          <span>发货商品总数：<strong>{{ totalReissueQuantity }}</strong> 件</span>
        </a-space>
      </div>
    </a-modal>

    <!-- 完成售后弹窗 -->
    <a-modal
      v-model:visible="completeModalVisible"
      title="完成售后"
      :width="500"
      @ok="handleCompleteSubmit"
      @cancel="cancelComplete"
    >
      <a-form :model="completeForm" layout="vertical">
        <a-form-item label="完成时间" required>
          <a-date-picker v-model="completeForm.completeTime" placeholder="请选择完成时间" />
        </a-form-item>
        <a-form-item label="完成原因" required>
          <a-textarea v-model="completeForm.reason" placeholder="请输入完成原因" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

const order = ref<any>({
  id: route.params.id || '1',
  afterSalesNo: 'AS202405200001',
  originalOrderNo: 'SO202405180001',
  buyerName: '上海浦东店',
  buyerPhone: '136****4567',
  buyerContact: '张经理',
  buyerAddress: '上海市浦东新区张江高科技园区科苑路88号',
  warehouseName: '深圳湾科技园主仓',
  afterSalesType: 'logistics',
  status: 'pending',
  applyTime: '2024-05-20 09:00:00',
  processTime: '',
  reason: '货物在运输过程中丢失，需要补发',
  images: [],
  relatedAfterSalesOrders: ['AS202405210001', 'AS202405220002'],
  items: [
    { productName: '铝合金型材', spec: '6063-T5', unit: '支', orderQuantity: 50, quantity: 5, price: 120.00 },
    { productName: '不锈钢螺丝', spec: 'M8*30', unit: '盒', orderQuantity: 10, quantity: 2, price: 45.00 },
  ],
})

const afterSalesLogs = ref([
  { operateTime: '2024-05-20 09:00:00', type: 'create', operator: '上海浦东店', content: '提交售后申请' },
])

const auditModalVisible = ref(false)
const auditForm = reactive({
  result: 'pass',
  rejectReason: '',
})

const reissueModalVisible = ref(false)
const currentOrder = ref<any>({})
const reissueForm = reactive({
  warehouseId: '',
})

const trackingNoOptions = ref<string[]>(['SF123456789', 'SF987654321', 'YTO123456789', 'ZTO123456789'])

const completeModalVisible = ref(false)
const completeForm = reactive({
  completeTime: '',
  reason: '',
})

const totalReissueQuantity = computed(() => {
  return currentOrder.value.items?.reduce((sum: number, item: any) => sum + (item.reissueQuantity || 0), 0) || 0
})

function getAvailableBatches(record: any) {
  const batches: any[] = []
  for (let i = 1; i <= 3; i++) {
    batches.push({
      batchNo: `B${Date.now()}${i}`,
      currentStock: Math.floor(Math.random() * 100) + 10,
    })
  }
  return batches
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'blue',
    completed: 'green',
    rejected: 'red',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    completed: '已完成',
    rejected: '已驳回',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function getLogTypeColor(type: string) {
  const colors: Record<string, string> = {
    create: 'blue',
    audit: 'green',
    reissue: 'orange',
    complete: 'green',
    cancel: 'gray',
    reject: 'red',
  }
  return colors[type] || 'gray'
}

function getLogTypeText(type: string) {
  const texts: Record<string, string> = {
    create: '提交申请',
    audit: '审核',
    reissue: '补发',
    complete: '完成',
    cancel: '取消',
    reject: '驳回',
  }
  return texts[type] || type
}

function handleBack() {
  router.push('/warehouse/order/sale-after-sales')
}

function handleViewOriginalOrder() {
  router.push(`/warehouse/order/sale/detail/${order.value.originalOrderNo}`)
}

function handleViewRelatedAfterSales(orderNo: string) {
  router.push(`/warehouse/order/sale-after-sales/detail/${orderNo}`)
}

function handleCopyAfterSalesNo() {
  navigator.clipboard.writeText(order.value.afterSalesNo)
  Message.success('已复制售后单号')
}

function handleAudit() {
  auditForm.result = 'pass'
  auditForm.rejectReason = ''
  auditModalVisible.value = true
}

function handleAuditSubmit() {
  if (auditForm.result === 'pass') {
    order.value.status = 'approved'
    order.value.processTime = new Date().toLocaleString()
    afterSalesLogs.value.unshift({
      operateTime: new Date().toLocaleString(),
      type: 'audit',
      operator: '工程仓管理员',
      content: '审核通过',
    })
    Message.success('审核通过')
  } else {
    if (!auditForm.rejectReason) {
      Message.warning('请填写驳回原因')
      return
    }
    order.value.status = 'rejected'
    order.value.processTime = new Date().toLocaleString()
    afterSalesLogs.value.unshift({
      operateTime: new Date().toLocaleString(),
      type: 'reject',
      operator: '工程仓管理员',
      content: `审核不通过，原因：${auditForm.rejectReason}`,
    })
    Message.info(`审核不通过，原因：${auditForm.rejectReason}`)
  }
  auditModalVisible.value = false
}

function cancelAudit() {
  auditModalVisible.value = false
}

function handleReissue() {
  currentOrder.value = JSON.parse(JSON.stringify(order.value))
  currentOrder.value.items.forEach((item: any) => {
    item.reissueQuantity = item.quantity
    item.batchNo = ''
  })
  reissueForm.warehouseId = ''
  reissueModalVisible.value = true
}

function handleReissueSubmit() {
  if (!reissueForm.warehouseId) {
    Message.warning('请选择补发仓库')
    return
  }

  const reissueItems = currentOrder.value.items.filter((item: any) => (item.reissueQuantity || 0) > 0)
  if (!reissueItems.length) {
    Message.warning('请填写补发数量')
    return
  }

  const noBatchItems = currentOrder.value.items.filter((item: any) => !item.batchNo)
  if (noBatchItems.length) {
    Message.warning(`商品 "${noBatchItems[0].productName}" 未选择批次`)
    return
  }

  order.value.status = 'completed'
  order.value.processTime = new Date().toLocaleString()

  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'reissue',
    operator: '工程仓管理员',
    content: `补发完成，${reissueItems.map((i: any) => `${i.productName} ${i.reissueQuantity}${i.unit}`).join('、')}`,
  })

  Message.success('补发成功')
  reissueModalVisible.value = false
}

function cancelReissue() {
  reissueModalVisible.value = false
}

function handleComplete() {
  completeForm.completeTime = new Date().toISOString().slice(0, 10)
  completeForm.reason = ''
  completeModalVisible.value = true
}

function handleCompleteSubmit() {
  if (!completeForm.completeTime) {
    Message.warning('请选择完成时间')
    return
  }
  if (!completeForm.reason) {
    Message.warning('请填写完成原因')
    return
  }

  order.value.status = 'completed'
  order.value.processTime = new Date().toLocaleString()

  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'complete',
    operator: '工程仓管理员',
    content: `售后完成，完成时间：${completeForm.completeTime}，原因：${completeForm.reason}`,
  })

  Message.success('售后已完成')
  completeModalVisible.value = false
}

function cancelComplete() {
  completeModalVisible.value = false
}
</script>

<style scoped>
.after-sales-detail {
  padding: 0;
}

.text-gray {
  color: var(--color-text-3);
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.copy-icon {
  cursor: pointer;
  color: var(--color-text-3);
}

.copy-icon:hover {
  color: var(--color-primary);
}

.batch-remark {
  color: var(--color-text-3);
  font-size: 12px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>