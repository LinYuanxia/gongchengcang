<template>
  <div class="after-sales-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>

          <a-button
            v-if="order.status === 'applying'"
            type="primary"
            @click="handleAudit"
          >
            审核
          </a-button>

          <a-button
            v-if="order.status === 'approved'"
            type="primary"
            @click="handleReissue"
          >
            补发
          </a-button>

          <a-button @click="handleViewOrder">
            查看订单
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="售后基本信息">
        <a-descriptions-item label="售后单号">{{ order.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag color="orange">物流售后</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="工程仓">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ order.applyTime }}</a-descriptions-item>
        <a-descriptions-item label="处理时间">{{ order.processTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="原订单号" :span="2">
          <a-link @click="handleViewOrder">{{ order.originalOrderNo }}</a-link>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="工程仓信息">
        <a-descriptions-item label="工程仓名称">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{ order.contactPerson }}</a-descriptions-item>
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
          <a-table-column title="采购数量" :width="80" align="center">
            <template #cell="{ record }">{{ record.purchaseQuantity || record.quantity }}</template>
          </a-table-column>
          <a-table-column title="售后数量（货损）" data-index="quantity" :width="110" align="center" />
          <a-table-column title="单价" :width="90" align="right">
            <template #cell="{ record }"><span class="price">¥{{ record.price }}</span></template>
          </a-table-column>
          <a-table-column title="售后金额" :width="110" align="right">
            <template #cell="{ record }"><span class="price">¥{{ (record.quantity * record.price).toFixed(2) }}</span></template>
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
              <a-tag :color="getLogTypeColor(record.type)">{{ getLogTypeText(record.type) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作人" data-index="operator" :width="120" />
          <a-table-column title="日志内容" data-index="content" ellipsis />
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
        <a-descriptions-item label="售后类型"><a-tag color="orange">物流售后</a-tag></a-descriptions-item>
        <a-descriptions-item label="原订单号" :span="2">
          <a-link>{{ order.originalOrderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="工程仓">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.contactPhone }}</a-descriptions-item>
        <a-descriptions-item label="售后原因" :span="2">{{ order.reason || '无' }}</a-descriptions-item>
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
        <a-descriptions-item label="工程仓">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址">{{ order.address }}</a-descriptions-item>
        <a-descriptions-item label="货损商品数">{{ order.items.length }} 种</a-descriptions-item>
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
          <a-table-column title="货损数量" :width="80" align="center">
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
  afterSalesNo: 'AS202401250001',
  originalOrderNo: 'PO202401200001',
  projectName: '龙华仓储中心',
  warehouseName: '龙华仓储中心',
  contactPerson: '李工',
  contactPhone: '13800138001',
  address: '深圳市龙华区观澜街道环观南路',
  status: 'applying',
  applyTime: '2024-01-25 11:00:00',
  processTime: '',
  reason: '运输过程中部分混凝土洒漏，导致数量不足',
  images: [],
  items: [
    { productName: 'C30混凝土', spec: 'C30', unit: 'm³', purchaseQuantity: 100, quantity: 20, price: 380 },
  ],
})

const afterSalesLogs = ref([
  { operateTime: '2024-01-25 11:00:00', type: 'create', operator: '李工', content: '工程仓提交售后申请' },
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

const totalReissueQuantity = computed(() => {
  return reissueForm.batchItems.reduce((sum: number, item: any) => sum + (item.shipQuantity || 0), 0)
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    applying: 'orange',
    approved: 'blue',
    completed: 'green',
    rejected: 'red',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    applying: '申请中',
    approved: '审核通过',
    completed: '已完成',
    rejected: '已拒绝',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function getLogTypeColor(type: string) {
  const colors: Record<string, string> = {
    create: 'blue',
    audit: 'green',
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
    reissue: '补发',
    cancel: '取消',
    reject: '驳回',
  }
  return texts[type] || type
}

function handleViewOrder() {
  router.push(`/supplier/order/detail/${order.value.originalOrderNo}`)
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
      operator: '供应商管理员',
      content: '审核通过，待补发商品',
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
      operator: '供应商管理员',
      content: `审核不通过，原因：${auditForm.rejectReason}`,
    })
    Message.info(`审核不通过，原因：${auditForm.rejectReason}`)
  }
  auditModalVisible.value = false
}

function cancelAudit() {
  auditModalVisible.value = false
}

// --- 补发操作 ---
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
    operator: '供应商管理员',
    content: `补发完成，${shippedItems.map((i: any) => `${i.productName} ${i.shipQuantity}${i.unit}`).join('、')}${logisticsText}${reissueForm.remark ? '，备注：' + reissueForm.remark : ''}`,
  })

  Message.success('补发成功')
  reissueModalVisible.value = false
}

function cancelReissue() {
  reissueModalVisible.value = false
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
