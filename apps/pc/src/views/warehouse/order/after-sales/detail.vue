<template>
  <div class="after-sales-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>

          <!-- 销售售后：审核（pending状态） -->
          <a-button
            v-if="order.status === 'pending' && order.orderType === 'sale'"
            type="primary"
            @click="handleAudit"
          >
            审核
          </a-button>

          <!-- 销售质量售后：完成（审核通过后） -->
          <a-button
            v-if="order.status === 'approved' && order.orderType === 'sale' && order.afterSalesType === 'quality'"
            type="primary"
            @click="handleComplete"
          >
            完成售后
          </a-button>

          <!-- 物流售后：补发（审核通过状态） -->
          <a-button
            v-if="order.status === 'approved' && order.afterSalesType === 'logistics' && order.orderType === 'sale'"
            type="primary"
            @click="handleReissue"
          >
            补发
          </a-button>

          <!-- 采购售后：审核（供应商审核） -->
          <a-button
            v-if="order.status === 'applying' && order.orderType === 'purchase'"
            type="primary"
            @click="handleAudit"
          >
            审核
          </a-button>

          <!-- 采购售后：编辑申请 -->
          <a-button
            v-if="order.status === 'applying' && order.orderType === 'purchase'"
            @click="handleEditApply"
          >
            编辑售后
          </a-button>

          <!-- 采购售后：取消 -->
          <a-button
            v-if="order.status === 'applying' && order.orderType === 'purchase'"
            status="danger"
            @click="handleCancelOrder"
          >
            取消售后
          </a-button>

          <!-- 采购售后：查看采购订单 -->
          <a-button
            v-if="order.orderType === 'purchase'"
            @click="handleViewPurchaseOrder"
          >
            查看采购订单
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="售后基本信息">
        <a-descriptions-item label="售后单号">{{ order.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单类型">
          <a-tag :color="order.orderType === 'sale' ? 'blue' : 'purple'">
            {{ order.orderType === 'sale' ? '销售订单' : '采购订单' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="order.afterSalesType === 'logistics' ? 'orange' : 'red'">
            {{ order.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ order.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="处理时间">{{ order.processTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="原订单号" :span="2">
          <a-link @click="handleViewOriginalOrder">{{ order.originalOrderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item v-if="order.relatedOrderNo" label="关联补发订单" :span="2">
          <a-link @click="handleViewReissueOrder">{{ order.relatedOrderNo }}</a-link>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" :title="order.orderType === 'sale' ? '买家信息' : '商家信息'">
        <a-descriptions-item :label="order.orderType === 'sale' ? '买家' : '商家'">
          {{ order.contactName }}
        </a-descriptions-item>
        <a-descriptions-item label="联系人">{{ order.contactPerson || order.contactName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.contactPhone }}</a-descriptions-item>
        <a-descriptions-item v-if="order.address" label="收货地址" :span="2">{{ order.address }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>售后商品明细</h3>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="购买数量" :width="80" align="center">
            <template #cell="{ record }">
              {{ record.purchaseQuantity || record.quantity }}
            </template>
          </a-table-column>
          <a-table-column title="售后数量（货损）" data-index="quantity" :width="110" align="center" />
          <a-table-column title="单价" :width="90" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="售后金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ (record.quantity * record.price).toFixed(2) }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>售后原因</h3>
      <div class="reason-box">{{ order.reason || '暂无说明' }}</div>

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
              <a-tag :color="getLogTypeColor(record.type)">
                {{ getLogTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作人" data-index="operator" :width="120" />
          <a-table-column title="日志内容" data-index="content" ellipsis />
        </template>
      </a-table>
    </a-card>

    <!-- 审核弹窗（通用） -->
    <a-modal
      v-model:visible="auditModalVisible"
      :title="order.orderType === 'purchase' ? '审核售后申请' : '审核售后'"
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
        <a-descriptions-item :label="order.orderType === 'sale' ? '买家' : '商家'">
          {{ order.contactName }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.contactPhone }}</a-descriptions-item>
        <a-descriptions-item label="售后原因" :span="2">
          {{ order.reason || '无' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="order.images && order.images.length > 0" label="售后图片" :span="2">
          <a-space>
            <a-image
              v-for="(img, idx) in order.images"
              :key="idx"
              :src="img"
              :width="80"
              :height="80"
              style="border-radius: 4px; cursor: pointer"
              :preview="true"
            />
          </a-space>
        </a-descriptions-item>
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

    <!-- 完成售后弹窗（销售质量售后） -->
    <a-modal
      v-model:visible="completeModalVisible"
      title="完成售后"
      :width="500"
      @ok="handleCompleteSubmit"
      @cancel="completeModalVisible = false"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="售后单号">{{ order.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag color="red">质量售后</a-tag>
        </a-descriptions-item>
      </a-descriptions>
      <a-form :model="completeForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="完成原因" required>
          <a-textarea v-model="completeForm.reason" placeholder="请输入完成原因" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 补发弹窗（销售物流售后） -->
    <a-modal
      v-model:visible="reissueModalVisible"
      title="补发商品"
      :width="1100"
      @ok="handleReissueSubmit"
      @cancel="cancelReissue"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>补发后将在销售订单中生成补发订单，关联原订单和售后单</div>
        </template>
      </a-alert>

      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="售后单号">{{ order.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="原订单编号">{{ order.originalOrderNo }}</a-descriptions-item>
        <a-descriptions-item label="项目名称">{{ order.projectName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址">{{ order.address }}</a-descriptions-item>
        <a-descriptions-item label="货损商品数">{{ order.items.length }} 种</a-descriptions-item>
      </a-descriptions>

      <a-form :model="reissueForm" layout="vertical">
        <a-form-item label="发货日期" required>
          <a-date-picker
            v-model="reissueForm.shipDate"
            placeholder="请选择发货日期"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="发货仓库" required>
          <a-input v-model="reissueForm.warehouseName" disabled />
        </a-form-item>
        <a-form-item label="是否有物流公司" required>
          <a-radio-group v-model="reissueForm.hasLogistics">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
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
          <a-textarea v-model="reissueForm.remark" placeholder="请输入发货备注" :rows="3" />
        </a-form-item>
      </a-form>

      <a-divider>补发商品明细</a-divider>

      <a-table :data="reissueForm.batchItems" :pagination="false" row-key="id" size="small">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="140" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="货损数量" :width="80" align="center">
            <template #cell="{ record }">
              <a-tag color="red">{{ record.damageQuantity }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发货数量" :width="120" align="right">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.shipQuantity"
                :min="0"
                :max="record.damageQuantity"
                :precision="0"
                style="width: 100px"
                @change="handleReissueQuantityChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="批次号" :width="160">
            <template #cell="{ record }">
              <a-select
                v-model="record.batchNo"
                placeholder="选择批次"
                allow-create
                style="width: 100%"
              >
                <a-option v-for="batch in getAvailableBatches(record)" :key="batch.batchNo" :value="batch.batchNo">
                  {{ batch.batchNo }} (可用: {{ batch.currentStock }})
                </a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="批次备注" :width="140">
            <template #cell="{ record }">
              <a-input v-model="record.batchRemark" placeholder="批次备注" :max-length="50" size="small" />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
        <span>补发商品总数：<strong>{{ totalReissueQuantity }}</strong> 件</span>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const order = ref<any>({
  id: route.params.id || '1',
  afterSalesNo: 'AS202401200001',
  originalOrderNo: 'SO202401150003',
  orderType: 'sale',
  afterSalesType: 'logistics',
  projectName: '深圳湾科技园项目',
  contactName: '东莞市政工程公司',
  contactPerson: '王工',
  contactPhone: '13700137003',
  address: '东莞市南城街道鸿福路',
  warehouseName: '深圳湾科技园主仓',
  status: 'pending',
  applyTime: '2024-01-20 10:30:00',
  processTime: '',
  relatedOrderNo: '',
  reason: '货物运输过程中外包装破损，部分水泥结块',
  images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=damaged%20goods%20packaging%20photo&image_size=landscape_4_3'],
  items: [
    { productName: '水泥 P.O 42.5', spec: '50kg/袋', unit: '袋', purchaseQuantity: 100, quantity: 15, price: 128, reissueQuantity: 15, batchNo: '' },
  ],
})

const afterSalesLogs = ref([
  { operateTime: '2024-01-20 10:30:00', type: 'create', operator: '王工', content: '施工方提交售后申请' },
])

const auditModalVisible = ref(false)
const auditForm = reactive({
  result: 'pass',
  rejectReason: '',
})

const completeModalVisible = ref(false)
const completeForm = reactive({
  reason: '',
})

const reissueModalVisible = ref(false)
const reissueForm = reactive({
  shipDate: '',
  warehouseName: '',
  hasLogistics: true,
  logisticsCompany: '',
  logisticsNo: '',
  remark: '',
  batchItems: [] as any[],
})

const totalReissueQuantity = computed(() => {
  return reissueForm.batchItems.reduce((sum: number, item: any) => sum + (item.shipQuantity || 0), 0)
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    applying: 'orange',
    approved: 'blue',
    waiting: 'purple',
    rejected: 'red',
    completed: 'green',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    applying: '申请中',
    approved: '已通过',
    waiting: '待补发',
    rejected: order.value?.orderType === 'purchase' ? '已拒绝' : '已驳回',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function getLogTypeColor(type: string) {
  const colors: Record<string, string> = {
    create: 'blue',
    audit: 'green',
    complete: 'cyan',
    reissue: 'orange',
    cancel: 'gray',
    reject: 'red',
  }
  return colors[type] || 'gray'
}

function getLogTypeText(type: string) {
  const texts: Record<string, string> = {
    create: '提交申请',
    audit: '审核',
    complete: '完成',
    reissue: '补发',
    cancel: '取消',
    reject: '驳回',
  }
  return texts[type] || type
}

function getAvailableBatches(item: any) {
  return [
    { batchNo: 'B20240309001', currentStock: 150 },
    { batchNo: 'B20240309002', currentStock: 200 },
  ]
}

function handleViewOriginalOrder() {
  if (order.value.orderType === 'sale') {
    router.push(`/warehouse/order/sale/detail/${order.value.originalOrderNo}`)
  } else {
    router.push(`/warehouse/order/purchase/detail/${order.value.originalOrderNo}`)
  }
}

function handleViewReissueOrder() {
  if (order.value.relatedOrderNo) {
    router.push(`/warehouse/order/sale/detail/${order.value.relatedOrderNo}`)
  }
}

function handleViewPurchaseOrder() {
  router.push(`/warehouse/order/purchase/detail/${order.value.originalOrderNo}`)
}

// --- 审核操作 ---
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
      operator: '仓库管理员',
      content: `审核通过`,
    })
    Message.success('审核通过')
  } else {
    order.value.status = 'rejected'
    order.value.processTime = new Date().toLocaleString()
    afterSalesLogs.value.unshift({
      operateTime: new Date().toLocaleString(),
      type: 'reject',
      operator: '仓库管理员',
      content: `审核不通过${auditForm.rejectReason ? '，原因：' + auditForm.rejectReason : ''}`,
    })
    Message.info(auditForm.rejectReason ? `审核不通过，原因：${auditForm.rejectReason}` : '审核不通过')
  }
  auditModalVisible.value = false
}

function cancelAudit() {
  auditModalVisible.value = false
}

// --- 完成售后（销售质量售后） ---
function handleComplete() {
  completeForm.reason = ''
  completeModalVisible.value = true
}

function handleCompleteSubmit() {
  if (!completeForm.reason) {
    Message.warning('请填写完成原因')
    return
  }
  order.value.status = 'completed'
  order.value.processTime = new Date().toLocaleString()
  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'complete',
    operator: '仓库管理员',
    content: `售后已完成，原因：${completeForm.reason}`,
  })
  Message.success('售后已完成')
  completeModalVisible.value = false
}

// --- 补发（销售物流售后） ---
function handleReissue() {
  reissueForm.shipDate = new Date().toISOString().slice(0, 10)
  reissueForm.warehouseName = order.value.warehouseName || '深圳湾科技园主仓'
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
      batchNo: '',
      batchRemark: '',
    })
  })

  reissueModalVisible.value = true
}

function handleReissueQuantityChange(record: any) {
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
    Message.warning('请填写发货数量')
    return
  }

  const reissueOrderNo = `RE${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  order.value.status = 'completed'
  order.value.relatedOrderNo = reissueOrderNo
  order.value.processTime = new Date().toLocaleString()

  const logisticsText = reissueForm.hasLogistics
    ? `，物流：${reissueForm.logisticsCompany} ${reissueForm.logisticsNo}`
    : '，无需物流'

  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'reissue',
    operator: '仓库管理员',
    content: `补发成功，已生成售后订单 ${reissueOrderNo}${logisticsText}，货损数量 ${shippedItems.map((i: any) => `${i.productName} ${i.shipQuantity}${i.unit}`).join('、')}，关联原订单 ${order.value.originalOrderNo}，关联售后单 ${order.value.afterSalesNo}`,
  })

  Message.success(`补发成功，已生成售后订单 ${reissueOrderNo}`)
  reissueModalVisible.value = false
}

function cancelReissue() {
  reissueModalVisible.value = false
}

// --- 编辑售后（采购订单） ---
function handleEditApply() {
  Message.info('编辑售后功能开发中')
}

// --- 取消售后（采购订单） ---
function handleCancelOrder() {
  order.value.status = 'cancelled'
  afterSalesLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    type: 'cancel',
    operator: '仓库管理员',
    content: '售后申请已取消',
  })
  Message.success('售后申请已取消')
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

.reason-box {
  background: var(--color-fill-1);
  padding: 12px;
  border-radius: 4px;
  color: var(--color-text-2);
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
