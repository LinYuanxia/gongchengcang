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

          <a-button
            v-if="order.status === 'pending' || order.status === 'approved'"
            status="danger"
            @click="handleCancel"
          >
            取消售后
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
        <a-descriptions-item label="所属工程仓">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="来源订单" :span="2">
          <a-link @click="handleViewOriginalOrder">{{ order.originalOrderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="供应商名称">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="供应商联系人">{{ order.supplierContact }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.supplierPhone }}</a-descriptions-item>
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
          <a-table-column title="采购数量" :width="80" align="center">
            <template #cell="{ record }">{{ record.purchaseQuantity }}</template>
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
        <a-descriptions-item label="供应商名称">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.supplierPhone }}</a-descriptions-item>
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
      :width="1100"
      @ok="handleReissueSubmit"
      @cancel="cancelReissue"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>补发后将生成补发记录，关联原订单和售后单</div>
        </template>
      </a-alert>

      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="售后单号">{{ order.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="原订单编号">{{ order.originalOrderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商名称">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="所属工程仓">{{ order.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="reissueForm" layout="vertical">
        <a-form-item label="是否有物流" required>
          <a-radio-group v-model="reissueForm.hasLogistics">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否（自提/无需物流）</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="reissueForm.hasLogistics">
          <a-form-item label="物流公司" required>
            <a-select v-model="reissueForm.logisticsCompany" placeholder="请选择物流公司">
              <a-option value="顺丰速运">顺丰速运</a-option>
              <a-option value="圆通速递">圆通速递</a-option>
              <a-option value="中通快递">中通快递</a-option>
              <a-option value="韵达快递">韵达快递</a-option>
              <a-option value="EMS">EMS</a-option>
              <a-option value="京东物流">京东物流</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="物流单号" required>
            <a-input v-model="reissueForm.logisticsNo" placeholder="请输入物流单号" />
          </a-form-item>
        </template>
        <a-form-item label="发货备注">
          <a-textarea v-model="reissueForm.remark" placeholder="请输入发货备注" :rows="2" />
        </a-form-item>
      </a-form>

      <a-divider>补发商品明细</a-divider>

      <a-table :data="reissueForm.batchItems" :pagination="false" row-key="id" size="small">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="160" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="售后数量" :width="80" align="center">
            <template #cell="{ record }"><a-tag color="red">{{ record.damageQuantity }}</a-tag></template>
          </a-table-column>
          <a-table-column title="补发数量" :width="120" align="right">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.shipQuantity"
                :min="1"
                :max="record.damageQuantity"
                :precision="0"
                style="width: 100px"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
        <span>补发商品总数：<strong>{{ totalReissueQuantity }}</strong> 件</span>
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

    <!-- 取消售后弹窗 -->
    <a-modal
      v-model:visible="cancelModalVisible"
      title="取消售后"
      :width="400"
      @ok="handleCancelSubmit"
      @cancel="cancelCancel"
    >
      <a-form :model="cancelForm" layout="vertical">
        <a-form-item label="取消原因" required>
          <a-textarea v-model="cancelForm.reason" placeholder="请输入取消原因" :rows="3" />
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
  afterSalesNo: 'PA202405200001',
  originalOrderNo: 'PO202405180001',
  supplierName: '深圳市建材供应商有限公司',
  supplierContact: '王经理',
  supplierPhone: '138****5678',
  warehouseName: '深圳湾科技园主仓',
  afterSalesType: 'quality',
  status: 'pending',
  applyTime: '2024-05-20 10:30:00',
  processTime: '',
  reason: '收到的商品存在质量问题，部分商品表面有划痕和变形',
  images: [],
  relatedAfterSalesOrders: ['PA202405210001'],
  items: [
    { productName: '钢化玻璃', spec: '5mm', unit: '块', purchaseQuantity: 100, quantity: 15, price: 85.00 },
    { productName: '铝合金窗框', spec: '6063', unit: '支', purchaseQuantity: 50, quantity: 8, price: 150.00 },
  ],
})

const afterSalesLogs = ref([
  { operateTime: '2024-05-20 10:30:00', type: 'create', operator: '深圳湾科技园主仓', content: '提交售后申请' },
])

const auditModalVisible = ref(false)
const auditForm = reactive({
  result: 'pass',
  rejectReason: '',
})

const reissueModalVisible = ref(false)
const reissueForm = reactive({
  hasLogistics: true,
  logisticsCompany: '',
  logisticsNo: '',
  remark: '',
  batchItems: [] as any[],
})

const completeModalVisible = ref(false)
const completeForm = reactive({
  completeTime: '',
  reason: '',
})

const cancelModalVisible = ref(false)
const cancelForm = reactive({
  reason: '',
})

const totalReissueQuantity = computed(() => {
  return reissueForm.batchItems.reduce((sum: number, item: any) => sum + (item.shipQuantity || 0), 0)
})

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
  router.push('/warehouse/order/purchase-after-sales')
}

function handleViewOriginalOrder() {
  router.push(`/warehouse/order/purchase/detail/${order.value.originalOrderNo}`)
}

function handleViewRelatedAfterSales(orderNo: string) {
  router.push(`/warehouse/order/purchase-after-sales/detail/${orderNo}`)
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
  reissueForm.hasLogistics = true
  reissueForm.logisticsCompany = ''
  reissueForm.logisticsNo = ''
  reissueForm.remark = ''

  reissueForm.batchItems = []
  order.value.items.forEach((item: any, itemIndex: number) => {
    reissueForm.batchItems.push({
      id: `reissue_${itemIndex}`,
      productName: item.productName,
      spec: item.spec,
      unit: item.unit || '件',
      damageQuantity: item.quantity || 0,
      shipQuantity: item.quantity || 0,
    })
  })

  reissueModalVisible.value = true
}

function handleReissueSubmit() {
  if (reissueForm.hasLogistics) {
    if (!reissueForm.logisticsCompany) {
      Message.warning('请选择物流公司')
      return
    }
    if (!reissueForm.logisticsNo) {
      Message.warning('请输入物流单号')
      return
    }
  }

  const shippedItems = reissueForm.batchItems.filter((item: any) => (item.shipQuantity || 0) > 0)
  if (!shippedItems.length) {
    Message.warning('请填写补发数量')
    return
  }

  order.value.status = 'completed'
  order.value.processTime = new Date().toLocaleString()

  const logisticsText = reissueForm.hasLogistics
    ? `，物流：${reissueForm.logisticsCompany} ${reissueForm.logisticsNo}`
    : '，无需物流'

  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'reissue',
    operator: '工程仓管理员',
    content: `补发完成，${shippedItems.map((i: any) => `${i.productName} ${i.shipQuantity}${i.unit}`).join('、')}${logisticsText}${reissueForm.remark ? '，备注：' + reissueForm.remark : ''}`,
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

function handleCancel() {
  cancelForm.reason = ''
  cancelModalVisible.value = true
}

function handleCancelSubmit() {
  if (!cancelForm.reason) {
    Message.warning('请填写取消原因')
    return
  }

  order.value.status = 'cancelled'
  order.value.processTime = new Date().toLocaleString()

  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'cancel',
    operator: '工程仓管理员',
    content: `取消售后，原因：${cancelForm.reason}`,
  })

  Message.success('售后已取消')
  cancelModalVisible.value = false
}

function cancelCancel() {
  cancelModalVisible.value = false
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

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>