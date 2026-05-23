<template>
  <div class="after-sales">
    <a-card>
      <a-tabs v-model:active-key="orderTypeTab" class="order-type-tabs" @change="handleOrderTypeChange">
        <a-tab-pane key="sale" title="销售订单" />
        <a-tab-pane key="purchase" title="采购订单" />
      </a-tabs>

      <a-tabs v-model:active-key="afterSalesTypeTab" class="after-sales-type-tabs" @change="handleAfterSalesTypeChange">
        <a-tab-pane key="all" :title="`全部 (${stats.allCount})`" />
        <a-tab-pane key="logistics" :title="`物流售后 (${stats.logisticsCount})`" />
        <a-tab-pane v-if="orderTypeTab === 'sale'" key="quality" :title="`质量售后 (${stats.qualityCount})`" />
      </a-tabs>

      <div class="filter-bar">
        <a-row :gutter="16">
          <a-col :span="5">
            <a-input-search v-model="searchForm.afterSalesNo" placeholder="售后单号" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="5">
            <a-input-search v-model="searchForm.originalOrderNo" placeholder="原订单编号" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="5">
            <a-input-search v-model="searchForm.projectName" placeholder="项目名称" style="width: 100%" @search="handleSearch" />
          </a-col>
          <a-col :span="5">
            <a-input-search
              v-model="searchForm.contactInfo"
              :placeholder="orderTypeTab === 'sale' ? '买家信息（名称/联系人/电话）' : '商家信息（名称/联系人/电话）'"
              style="width: 100%"
              @search="handleSearch"
            />
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 12px">
          <a-col :span="6">
            <a-range-picker v-model="searchForm.applyDateRange" format="YYYY-MM-DD" placeholder="申请日期" style="width: 100%" />
          </a-col>
          <a-col :span="4" style="text-align: right">
            <a-space>
              <a-button type="primary" @click="handleSearch"><template #icon><icon-search /></template>查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <a-tabs v-model:active-key="activeTab" class="status-tabs" @change="handleStatusChange">
        <a-tab-pane key="all" :title="`全部 (${statusStats.allCount})`" />
        <a-tab-pane v-if="orderTypeTab === 'sale'" key="pending" :title="`待审核 (${statusStats.pendingCount})`" />
        <a-tab-pane v-if="orderTypeTab === 'purchase'" key="applying" :title="`申请中 (${statusStats.applyingCount})`" />
        <a-tab-pane key="approved" :title="`已通过 (${statusStats.approvedCount})`" />
        <a-tab-pane v-if="orderTypeTab === 'sale' && afterSalesTypeTab !== 'quality'" key="waiting" :title="`待补发 (${statusStats.waitingCount})`" />
        <a-tab-pane key="rejected" :title="`${orderTypeTab === 'purchase' ? '已拒绝' : '已驳回'} (${statusStats.rejectedCount})`" />
        <a-tab-pane key="completed" :title="`已完成 (${statusStats.completedCount})`" />
        <a-tab-pane v-if="orderTypeTab === 'purchase'" key="cancelled" :title="`已取消 (${statusStats.cancelledCount})`" />
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="{ pageSize: 10 }" row-key="id" style="margin-top: 16px">
        <template #columns>
          <a-table-column title="售后单号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.afterSalesNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="原订单号" :width="160">
            <template #cell="{ record }">
              <a-link @click="handleViewOriginalOrder(record)">{{ record.originalOrderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="项目" data-index="projectName" :width="120" />
          <a-table-column title="订单类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.orderType === 'sale' ? 'blue' : 'purple'">
                {{ record.orderType === 'sale' ? '销售订单' : '采购订单' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="orderTypeTab === 'sale' ? '买家信息' : '商家信息'" :width="160">
            <template #cell="{ record }">
              <div>{{ record.contactName }}</div>
              <div class="text-gray">{{ record.contactPhone }}</div>
            </template>
          </a-table-column>
          <a-table-column title="售后类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.afterSalesType === 'logistics' ? 'orange' : 'red'">
                {{ record.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="售后商品数" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.items.length }}种
            </template>
          </a-table-column>
          <a-table-column title="售后库存量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.afterSalesType === 'quality' ? '-' : record.totalStockQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="售后原因" data-index="reason" :width="160" ellipsis />
          <a-table-column title="售后图片" :width="100" align="center">
            <template #cell="{ record }">
              <a-image
                v-if="record.images && record.images.length > 0"
                :src="record.images[0]"
                :width="40"
                :height="40"
                style="border-radius: 4px; cursor: pointer"
                :preview="true"
              />
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="售后状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="160" />
          <a-table-column title="处理时间" :width="160">
            <template #cell="{ record }">
              {{ record.processTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>

                <!-- 销售物流售后：审核通过后补发 -->
                <a-link
                  v-if="record.orderType === 'sale' && record.afterSalesType === 'logistics' && (record.status === 'approved' || record.status === 'waiting')"
                  type="primary"
                  @click="handleReissue(record)"
                >补发</a-link>

                <!-- 销售质量售后：审核通过后完成 -->
                <a-link
                  v-if="record.orderType === 'sale' && record.afterSalesType === 'quality' && record.status === 'approved'"
                  type="primary"
                  @click="handleComplete(record)"
                >完成</a-link>

                <!-- 采购售后：取消（申请中状态） -->
                <a-link
                  v-if="record.orderType === 'purchase' && record.status === 'applying'"
                  @click="handleCancelApply(record)"
                >取消售后</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="completeModalVisible"
      title="完成售后"
      :width="500"
      @ok="handleCompleteSubmit"
      @cancel="completeModalVisible = false"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="售后单号">{{ currentOrder.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="售后类型">
          <a-tag :color="currentOrder.afterSalesType === 'logistics' ? 'orange' : 'red'">
            {{ currentOrder.afterSalesType === 'logistics' ? '物流售后' : '质量售后' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      <a-form :model="completeForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="完成原因" required>
          <a-textarea v-model="completeForm.reason" placeholder="请输入完成原因" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

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
          <a-col :span="8">
            <a-form-item label="物流公司" required>
              <a-select v-model="reissueForm.logisticsCompany" placeholder="请选择物流公司">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="自提">自提</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="物流单号">
              <a-input v-model="reissueForm.logisticsNo" placeholder="请输入物流单号" />
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
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const router = useRouter()

const orderTypeTab = ref('sale')
const afterSalesTypeTab = ref('all')
const activeTab = ref('all')

const searchForm = reactive({
  afterSalesNo: '',
  originalOrderNo: '',
  projectName: '',
  contactInfo: '',
  applyDateRange: [] as any[],
})

const afterSalesOrders = ref<any[]>([
  {
    id: '1',
    afterSalesNo: 'AS202401200001',
    originalOrderNo: 'SO202401150003',
    projectName: '深圳湾科技园项目',
    orderType: 'sale',
    afterSalesType: 'logistics',
    contactName: '东莞市政工程公司',
    contactPhone: '13700137003',
    items: [
      { productName: '水泥 P.O 42.5', spec: '50kg/袋', unit: '袋', purchaseQuantity: 100, quantity: 15, batchNo: '', reissueQuantity: 15 },
    ],
    totalStockQuantity: 15,
    reason: '货物运输过程中外包装破损，部分水泥结块',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=damaged%20goods%20packaging%20photo&image_size=landscape_4_3'],
    status: 'pending',
    applyTime: '2024-01-20 10:30:00',
    processTime: '',
  },
  {
    id: '2',
    afterSalesNo: 'AS202401190001',
    originalOrderNo: 'SO202401140001',
    projectName: '佛山陶瓷工业园',
    orderType: 'sale',
    afterSalesType: 'logistics',
    contactName: '佛山建材批发商',
    contactPhone: '13600136004',
    items: [
      { productName: '瓷砖胶', spec: 'C2TE', unit: '袋', quantity: 2, batchNo: '', reissueQuantity: 2 },
    ],
    totalStockQuantity: 2,
    reason: '清点发现少了2包瓷砖胶',
    images: [],
    status: 'waiting',
    applyTime: '2024-01-19 15:20:00',
    processTime: '2024-01-20 09:00:00',
  },
  {
    id: '3',
    afterSalesNo: 'AS202401180001',
    originalOrderNo: 'SO202401100001',
    projectName: '广州天河商业中心',
    orderType: 'sale',
    afterSalesType: 'quality',
    contactName: '广州装饰工程公司',
    contactPhone: '13800138002',
    items: [
      { productName: '钢筋螺纹钢', spec: 'HRB400 Φ16', unit: '吨', quantity: 0.5, batchNo: '' },
    ],
    totalStockQuantity: 0.5,
    reason: '钢筋表面锈蚀严重，属于质量问题',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=rusted%20steel%20bars%20photo&image_size=landscape_4_3'],
    status: 'completed',
    applyTime: '2024-01-18 09:00:00',
    processTime: '2024-01-19 14:00:00',
  },
  {
    id: '4',
    afterSalesNo: 'AS202401170001',
    originalOrderNo: 'SO202401080001',
    projectName: '深圳建筑总部基地',
    orderType: 'sale',
    afterSalesType: 'quality',
    contactName: '深圳建筑工程公司',
    contactPhone: '13900139001',
    items: [
      { productName: '防水涂料', spec: 'JS-Ⅱ型', unit: '桶', quantity: 5, batchNo: '' },
    ],
    totalStockQuantity: 5,
    reason: '发错规格，订购JS-Ⅰ型收到JS-Ⅱ型',
    images: [],
    status: 'rejected',
    applyTime: '2024-01-17 14:00:00',
    processTime: '2024-01-18 10:30:00',
  },
  {
    id: '5',
    afterSalesNo: 'AS202401250001',
    originalOrderNo: 'PO202401200001',
    projectName: '龙华仓储中心',
    orderType: 'purchase',
    afterSalesType: 'logistics',
    contactName: '广东建材有限公司',
    contactPhone: '0755-88888888',
    items: [
      { productName: 'C30混凝土', spec: 'C30', unit: 'm³', quantity: 20, batchNo: '' },
    ],
    totalStockQuantity: 20,
    reason: '运输过程中部分混凝土洒漏',
    images: [],
    status: 'applying',
    applyTime: '2024-01-25 11:00:00',
    processTime: '',
  },
  {
    id: '6',
    afterSalesNo: 'AS202401240001',
    originalOrderNo: 'PO202401180001',
    projectName: '南山科技园项目',
    orderType: 'purchase',
    afterSalesType: 'logistics',
    contactName: '上海钢材集团',
    contactPhone: '021-66666666',
    items: [
      { productName: '螺纹钢 HRB400', spec: '16mm', unit: '吨', quantity: 5, batchNo: '' },
    ],
    totalStockQuantity: 5,
    reason: '运输过程中部分钢材弯曲变形',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=bent%20steel%20bars%20photo&image_size=landscape_4_3'],
    status: 'approved',
    applyTime: '2024-01-24 09:30:00',
    processTime: '2024-01-25 15:00:00',
  },
  {
    id: '7',
    afterSalesNo: 'AS202401260001',
    originalOrderNo: 'SO202401200002',
    projectName: '前海金融中心',
    orderType: 'sale',
    afterSalesType: 'quality',
    contactName: '中建三局',
    contactPerson: '刘工',
    contactPhone: '13600136004',
    items: [
      { productName: '预制混凝土管桩', spec: 'PHC-AB600', unit: '根', quantity: 8, batchNo: '' },
    ],
    totalStockQuantity: 8,
    reason: '管桩端板焊接质量不合格，存在开裂风险',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cracked%20concrete%20pile%20photo&image_size=landscape_4_3'],
    status: 'pending',
    applyTime: '2024-01-26 09:00:00',
    processTime: '',
  },
])

const stats = computed(() => {
  const filtered = afterSalesOrders.value.filter(o => o.orderType === orderTypeTab.value)
  const allCount = filtered.length
  const logisticsCount = filtered.filter(o => o.afterSalesType === 'logistics').length
  const qualityCount = filtered.filter(o => o.afterSalesType === 'quality').length
  return { allCount, logisticsCount, qualityCount }
})

const statusStats = computed(() => {
  let filtered = afterSalesOrders.value.filter(o => o.orderType === orderTypeTab.value)
  if (afterSalesTypeTab.value !== 'all') {
    filtered = filtered.filter(o => o.afterSalesType === afterSalesTypeTab.value)
  }
  return {
    allCount: filtered.length,
    pendingCount: filtered.filter(o => o.status === 'pending').length,
    applyingCount: filtered.filter(o => o.status === 'applying').length,
    approvedCount: filtered.filter(o => o.status === 'approved').length,
    waitingCount: filtered.filter(o => o.status === 'waiting').length,
    rejectedCount: filtered.filter(o => o.status === 'rejected').length,
    completedCount: filtered.filter(o => o.status === 'completed').length,
    cancelledCount: filtered.filter(o => o.status === 'cancelled').length,
  }
})

const filteredOrders = computed(() => {
  let result = afterSalesOrders.value.filter(o => o.orderType === orderTypeTab.value)

  if (afterSalesTypeTab.value !== 'all') {
    result = result.filter(o => o.afterSalesType === afterSalesTypeTab.value)
  }

  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }

  if (searchForm.afterSalesNo) {
    result = result.filter(o => o.afterSalesNo.includes(searchForm.afterSalesNo))
  }
  if (searchForm.originalOrderNo) {
    result = result.filter(o => o.originalOrderNo.includes(searchForm.originalOrderNo))
  }
  if (searchForm.projectName) {
    result = result.filter(o => o.projectName?.includes(searchForm.projectName))
  }
  if (searchForm.contactInfo) {
    result = result.filter(o =>
      o.contactName?.includes(searchForm.contactInfo) ||
      o.contactPhone?.includes(searchForm.contactInfo)
    )
  }

  return result
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
    rejected: orderTypeTab.value === 'purchase' ? '已拒绝' : '已驳回',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function handleOrderTypeChange() {
  activeTab.value = 'all'
  afterSalesTypeTab.value = 'all'
}

function handleAfterSalesTypeChange() {
  activeTab.value = 'all'
}

function handleStatusChange() {}

function handleSearch() {}

function handleReset() {
  searchForm.afterSalesNo = ''
  searchForm.originalOrderNo = ''
  searchForm.projectName = ''
  searchForm.contactInfo = ''
  searchForm.applyDateRange = []
}

function handleViewDetail(record: any) {
  router.push(`/warehouse/order/after-sales/detail/${record.id}`)
}

function handleViewOriginalOrder(record: any) {
  if (record.orderType === 'sale') {
    router.push(`/warehouse/order/sale/detail/${record.originalOrderNo}`)
  } else {
    router.push(`/warehouse/order/purchase/detail/${record.originalOrderNo}`)
  }
}

function handleCancelApply(record: any) {
  const order = afterSalesOrders.value.find(o => o.id === record.id)
  if (order) {
    order.status = 'cancelled'
    Message.success('售后申请已取消')
  }
}

const currentOrder = ref<any>({})
const completeModalVisible = ref(false)
const completeForm = reactive({
  reason: '',
})

function handleComplete(record: any) {
  currentOrder.value = { ...JSON.parse(JSON.stringify(record)) }
  completeForm.reason = ''
  completeModalVisible.value = true
}

function handleCompleteSubmit() {
  if (!completeForm.reason) {
    Message.warning('请填写完成原因')
    return
  }
  const order = afterSalesOrders.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'completed'
    order.processTime = new Date().toLocaleString()
    Message.success('售后已完成')
  }
  completeModalVisible.value = false
}

const reissueModalVisible = ref(false)
const reissueForm = reactive({
  warehouseId: '',
  logisticsCompany: '',
  logisticsNo: '',
})

function getAvailableBatches(item: any) {
  return [
    { batchNo: 'B20240309001', currentStock: 150 },
    { batchNo: 'B20240309002', currentStock: 200 },
  ]
}

function handleReissue(record: any) {
  currentOrder.value = { ...JSON.parse(JSON.stringify(record)) }
  ;(currentOrder.value.items || []).forEach((item: any) => {
    item.reissueQuantity = item.quantity
    item.batchNo = ''
  })
  reissueForm.warehouseId = ''
  reissueForm.logisticsCompany = ''
  reissueForm.logisticsNo = ''
  reissueModalVisible.value = true
}

function handleReissueSubmit() {
  const order = afterSalesOrders.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'completed'
    order.processTime = new Date().toLocaleString()
    Message.success('补发成功，已生成补发订单')
  }
  reissueModalVisible.value = false
}

function cancelReissue() {
  reissueModalVisible.value = false
}
</script>

<style scoped>
.after-sales {
  padding: 0;
}

.order-type-tabs {
  margin-bottom: 8px;
}

.after-sales-type-tabs {
  margin-bottom: 16px;
}

.filter-bar {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.status-tabs {
  margin-top: 16px;
}

.text-gray {
  color: var(--color-text-3);
  font-size: 12px;
}
</style>
