<template>
  <div class="after-sales">
    <a-card>
      <template #title>
        <span>售后列表</span>
      </template>

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
            <a-input-search v-model="searchForm.warehouseInfo" placeholder="工程仓信息（名称/联系人/电话）" style="width: 100%" @search="handleSearch" />
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
        <a-tab-pane key="applying" :title="`申请中 (${statusStats.applyingCount})`" />
        <a-tab-pane key="approved" :title="`审核通过 (${statusStats.approvedCount})`" />
        <a-tab-pane key="completed" :title="`已完成 (${statusStats.completedCount})`" />
        <a-tab-pane key="rejected" :title="`已拒绝 (${statusStats.rejectedCount})`" />
        <a-tab-pane key="cancelled" :title="`已取消 (${statusStats.cancelledCount})`" />
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
          <a-table-column title="项目名称" data-index="projectName" :width="130" ellipsis />
          <a-table-column title="工程仓信息" :width="160">
            <template #cell="{ record }">
              <div>{{ record.warehouseName }}</div>
              <div class="text-gray">{{ record.contactPerson }} {{ record.contactPhone }}</div>
            </template>
          </a-table-column>
          <a-table-column title="售后类型" :width="90">
            <template #cell>
              <a-tag color="orange">物流售后</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="售后商品数" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.items.length }}种
            </template>
          </a-table-column>
          <a-table-column title="售后原因" data-index="reason" :width="160" ellipsis />
          <a-table-column title="售后图片" :width="90" align="center">
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
          <a-table-column title="售后状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="applyTime" :width="155" />
          <a-table-column title="处理时间" :width="155">
            <template #cell="{ record }">
              {{ record.processTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="190" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link type="primary" @click="handleViewDetail(record)">详情</a-link>
                <a-link
                  v-if="record.status === 'applying'"
                  type="primary"
                  @click="handleViewDetail(record)"
                >审核</a-link>
                <a-link
                  v-if="record.status === 'approved'"
                  type="primary"
                  @click="handleReissue(record)"
                >补发</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 补发弹窗（同订单详情页补发功能） -->
    <a-modal
      v-model:visible="reissueModalVisible"
      title="补发商品"
      :width="1100"
      :footer="false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        补发用于处理运输破损、数量损耗等场景，补发记录将关联至原订单
      </a-alert>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="售后单号">{{ reissueContext.afterSalesNo }}</a-descriptions-item>
        <a-descriptions-item label="原订单编号">{{ reissueContext.originalOrderNo }}</a-descriptions-item>
        <a-descriptions-item label="工程仓">{{ reissueContext.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>收货信息</a-divider>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="收货人">{{ reissueContext.contactPerson }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ reissueContext.contactPhone }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="3">{{ reissueContext.address }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>补发商品</a-divider>

      <a-form :model="reissueForm" layout="vertical">
        <a-form-item label="补发原因" required>
          <a-radio-group v-model="reissueForm.reason">
            <a-radio value="damage">运输破损</a-radio>
            <a-radio value="loss">数量损耗</a-radio>
            <a-radio value="quality">质量问题</a-radio>
            <a-radio value="miss">错发漏发</a-radio>
            <a-radio value="other">其他原因</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="选择补发商品" required>
          <a-table :data="reissueForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" :width="180">
                <template #cell="{ record }">
                  <div>{{ record.productName }}</div>
                  <div style="color: #86909c; font-size: 12px;">{{ record.spec }}</div>
                </template>
              </a-table-column>
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="已发货数量" :width="100" align="right">
                <template #cell="{ record }">{{ record.purchaseQuantity || 0 }}</template>
              </a-table-column>
              <a-table-column title="售后数量（货损）" :width="110" align="center">
                <template #cell="{ record }">
                  <a-tag color="red">{{ record.quantity }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="补发数量" :width="140" align="center">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.reissueQuantity"
                    :min="0"
                    :max="record.quantity"
                    :precision="0"
                    size="small"
                    style="width: 100px"
                    placeholder="补发数量"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-divider>物流信息</a-divider>

        <a-form-item label="是否有物流">
          <a-radio-group v-model="reissueForm.hasLogistics">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否（自提/无需物流）</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="reissueForm.hasLogistics">
          <a-form-item
            v-for="(logistics, index) in reissueForm.logisticsList"
            :key="index"
            :label="`物流 ${Number(index) + 1}`"
          >
            <a-space style="width: 100%">
              <a-select v-model="logistics.company" placeholder="物流公司" style="width: 150px">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="中通快递">中通快递</a-option>
                <a-option value="圆通速递">圆通速递</a-option>
                <a-option value="申通快递">申通快递</a-option>
                <a-option value="韵达快递">韵达快递</a-option>
                <a-option value="EMS">EMS</a-option>
              </a-select>
              <a-input v-model="logistics.no" placeholder="物流单号" style="width: 200px" />
              <a-button v-if="reissueForm.logisticsList.length > 1" status="danger" @click="reissueForm.logisticsList.splice(index, 1)">
                删除
              </a-button>
            </a-space>
          </a-form-item>

          <a-form-item>
            <a-button type="outline" @click="reissueForm.logisticsList.push({ company: '', no: '' })">
              <template #icon><icon-plus /></template>
              添加物流
            </a-button>
          </a-form-item>
        </template>

        <a-form-item label="补发备注">
          <a-textarea v-model="reissueForm.remark" placeholder="详细说明补发原因及处理方案" :max-length="200" :rows="2" />
        </a-form-item>
      </a-form>

      <div style="text-align: right; margin-top: 16px">
        <a-space>
          <a-button @click="reissueModalVisible = false">取消</a-button>
          <a-button type="primary" status="warning" @click="handleReissueSubmit">提交补发</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'

const router = useRouter()

const activeTab = ref('all')

const searchForm = reactive({
  afterSalesNo: '',
  originalOrderNo: '',
  projectName: '',
  warehouseInfo: '',
  applyDateRange: [] as any[],
})

const afterSalesOrders = ref<any[]>([
  {
    id: '1',
    afterSalesNo: 'AS202401250001',
    originalOrderNo: 'PO202401200001',
    projectName: '龙华仓储中心',
    warehouseName: '龙华仓储中心',
    contactPerson: '李工',
    contactPhone: '13800138001',
    address: '深圳市龙华区观澜街道环观南路',
    items: [
      { productName: 'C30混凝土', spec: 'C30', unit: 'm³', purchaseQuantity: 100, quantity: 20, price: 380, stockQuantity: 150 },
    ],
    reason: '运输过程中部分混凝土洒漏',
    images: [],
    status: 'applying',
    applyTime: '2024-01-25 11:00:00',
    processTime: '',
  },
  {
    id: '2',
    afterSalesNo: 'AS202401240001',
    originalOrderNo: 'PO202401180001',
    projectName: '南山科技园项目',
    warehouseName: '南山科技园项目部',
    contactPerson: '张工',
    contactPhone: '13900139002',
    address: '深圳市南山区科技园南区',
    items: [
      { productName: '螺纹钢 HRB400', spec: '16mm', unit: '吨', purchaseQuantity: 50, quantity: 5, price: 4200, stockQuantity: 30 },
    ],
    reason: '运输过程中部分钢材弯曲变形',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=bent%20steel%20bars%20photo&image_size=landscape_4_3'],
    status: 'approved',
    applyTime: '2024-01-24 09:30:00',
    processTime: '2024-01-25 15:00:00',
  },
  {
    id: '3',
    afterSalesNo: 'AS202401230001',
    originalOrderNo: 'PO202401150001',
    projectName: '福田CBD项目',
    warehouseName: '福田CBD项目仓',
    contactPerson: '王工',
    contactPhone: '13700137003',
    address: '深圳市福田区福华路',
    items: [
      { productName: '水泥 P.O 42.5', spec: '50kg/袋', unit: '袋', purchaseQuantity: 500, quantity: 30, price: 28, stockQuantity: 200 },
    ],
    reason: '到货清点发现少了30袋水泥',
    images: [],
    status: 'completed',
    applyTime: '2024-01-23 14:00:00',
    processTime: '2024-01-24 10:00:00',
  },
  {
    id: '4',
    afterSalesNo: 'AS202401220001',
    originalOrderNo: 'PO202401120001',
    projectName: '宝安机场扩建',
    warehouseName: '宝安机场项目仓',
    contactPerson: '刘工',
    contactPhone: '13600136004',
    address: '深圳市宝安区宝安机场',
    items: [
      { productName: '砂石料', spec: '中砂', unit: 'm³', purchaseQuantity: 200, quantity: 10, price: 120, stockQuantity: 500 },
    ],
    reason: '砂石含泥量超标，无法使用',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=sand%20and%20gravel%20material%20photo&image_size=landscape_4_3'],
    status: 'rejected',
    applyTime: '2024-01-22 16:00:00',
    processTime: '2024-01-23 11:00:00',
  },
  {
    id: '5',
    afterSalesNo: 'AS202401210001',
    originalOrderNo: 'PO202401100001',
    projectName: '光明科学城',
    warehouseName: '光明科学城仓',
    contactPerson: '陈工',
    contactPhone: '13500135005',
    address: '深圳市光明区科学城',
    items: [
      { productName: '加气砖', spec: '600×200×200', unit: '块', purchaseQuantity: 2000, quantity: 100, price: 6, stockQuantity: 800 },
    ],
    reason: '运输破损，部分砖块断裂',
    images: [],
    status: 'cancelled',
    applyTime: '2024-01-21 10:00:00',
    processTime: '2024-01-22 09:00:00',
  },
])

const statusStats = computed(() => {
  const list = afterSalesOrders.value
  return {
    allCount: list.length,
    applyingCount: list.filter(o => o.status === 'applying').length,
    approvedCount: list.filter(o => o.status === 'approved').length,
    completedCount: list.filter(o => o.status === 'completed').length,
    rejectedCount: list.filter(o => o.status === 'rejected').length,
    cancelledCount: list.filter(o => o.status === 'cancelled').length,
  }
})

const filteredOrders = computed(() => {
  let result = afterSalesOrders.value

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
  if (searchForm.warehouseInfo) {
    result = result.filter(o =>
      o.warehouseName?.includes(searchForm.warehouseInfo) ||
      o.contactPerson?.includes(searchForm.warehouseInfo) ||
      o.contactPhone?.includes(searchForm.warehouseInfo)
    )
  }

  return result
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

function handleStatusChange() {}

function handleSearch() {}

function handleReset() {
  searchForm.afterSalesNo = ''
  searchForm.originalOrderNo = ''
  searchForm.projectName = ''
  searchForm.warehouseInfo = ''
  searchForm.applyDateRange = []
}

function handleViewDetail(record: any) {
  router.push(`/supplier/order/after-sales/detail/${record.id}`)
}

function handleViewOriginalOrder(record: any) {
  router.push(`/supplier/order/detail/${record.originalOrderNo}`)
}

// --- 补发弹窗逻辑（同订单详情页） ---
const reissueModalVisible = ref(false)
const reissueContext = ref<any>({})
const reissueForm = ref<any>({
  reason: 'damage',
  hasLogistics: true,
  logisticsList: [{ company: '', no: '' }],
  remark: '',
  items: [] as any[],
})

function handleReissue(record: any) {
  reissueContext.value = record
  reissueForm.value = {
    reason: 'damage',
    hasLogistics: true,
    logisticsList: [{ company: '', no: '' }],
    remark: '',
    items: record.items.map((item: any) => ({
      ...item,
      reissueQuantity: item.quantity,
    })),
  }
  reissueModalVisible.value = true
}

function handleReissueSubmit() {
  const hasReissueItem = reissueForm.value.items.some((item: any) => item.reissueQuantity > 0)

  if (!hasReissueItem) {
    Message.warning('请至少选择一个商品并填写补发数量')
    return
  }
  const hasInvalidLogistics = reissueForm.value.hasLogistics && reissueForm.value.logisticsList.some((l: any) => !l.company || !l.no)
  if (hasInvalidLogistics) {
    Message.warning('请填写完整的物流信息')
    return
  }

  const order = afterSalesOrders.value.find(o => o.id === reissueContext.value.id)
  if (order) {
    order.status = 'completed'
    order.processTime = new Date().toLocaleString()
  }

  reissueModalVisible.value = false
  Message.success('补发申请已提交，商品已发出')
}
</script>

<style scoped>
.after-sales {
  padding: 0;
}

.filter-bar {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
  margin-bottom: 16px;
}

.status-tabs {
  margin-top: 8px;
}

.text-gray {
  color: var(--color-text-3);
  font-size: 12px;
}
</style>
