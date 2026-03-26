<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>订单管理</span>
      </template>
      <template #extra>
        <a-radio-group v-model="viewMode" type="button">
          <a-radio value="all">全部</a-radio>
          <a-radio value="pending">待确认</a-radio>
          <a-radio value="confirmed">已确认</a-radio>
          <a-radio value="shipped">已发货</a-radio>
          <a-radio value="completed">已完成</a-radio>
        </a-radio-group>
      </template>

      <a-table
        :data="filteredOrders"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="150" />
          <a-table-column title="采购方" :width="150">
            <template #cell="{ record }">
              {{ record.warehouseName }}
            </template>
          </a-table-column>
          <a-table-column title="商品数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 种
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.totalAmount?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPaymentStatusColor(record.paymentStatus)">
                {{ getPaymentStatusText(record.paymentStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="要求交货日期" :width="120">
            <template #cell="{ record }">
              <span :class="{ 'text-danger': isUrgent(record.deliveryDate) }">
                {{ record.deliveryDate }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" :width="160">
            <template #cell="{ record }">
              {{ record.createTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button 
                  v-if="record.status === 'pending'" 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handleConfirm(record)"
                >
                  确认接单
                </a-button>
                <a-button 
                  v-if="record.status === 'confirmed'" 
                  type="text" 
                  size="small"
                  status="warning"
                  @click="handleShip(record)"
                >
                  发货
                </a-button>
                <a-button 
                  v-if="record.status === 'shipped'" 
                  type="text" 
                  size="small"
                  @click="handleViewLogistics(record)"
                >
                  物流跟踪
                </a-button>
                <a-button 
                  v-if="record.status === 'completed' && record.invoiceStatus !== 'issued'" 
                  type="text" 
                  size="small"
                  @click="handleInvoice(record)"
                >
                  开具发票
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="detailVisible" 
      title="订单详情" 
      :width="1200"
      :footer="false"
    >
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" title="基本信息">
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
            <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
            <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
            <a-descriptions-item label="订单状态">
              <a-tag :color="getStatusColor(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="支付状态">
              <a-tag :color="getPaymentStatusColor(currentOrder.paymentStatus)">
                {{ getPaymentStatusText(currentOrder.paymentStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="下单时间">{{ currentOrder.createTime }}</a-descriptions-item>
            <a-descriptions-item label="确认时间">{{ currentOrder.confirmTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{ currentOrder.shipTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="收货地址" :span="3">{{ currentOrder.address }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="3">{{ currentOrder.remark || '-' }}</a-descriptions-item>
          </a-descriptions>

          <a-divider>商品清单</a-divider>

          <a-table :data="currentOrder.skuList || []" :pagination="false">
            <template #columns>
              <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" :width="200">
                <template #cell="{ record }">
                  <div>{{ record.productName }}</div>
                  <div class="sub-text">{{ record.specValues }}</div>
                </template>
              </a-table-column>
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="采购数量" data-index="quantity" :width="100" align="center" />
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price }}
                </template>
              </a-table-column>
              <a-table-column title="金额" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ (record.quantity * record.price).toFixed(2) }}
                </template>
              </a-table-column>
              <a-table-column title="备注" data-index="remark" :width="150" />
            </template>
          </a-table>

          <div v-if="currentOrder.status === 'pending'" style="margin-top: 24px; text-align: right">
            <a-space>
              <a-button @click="handleReject">拒绝订单</a-button>
              <a-button type="primary" @click="handleConfirmFromDetail">确认接单</a-button>
            </a-space>
          </div>
        </a-tab-pane>

        <a-tab-pane key="2" title="支付记录">
          <a-table :data="paymentRecords" :pagination="false">
            <template #columns>
              <a-table-column title="支付流水号" data-index="paymentNo" :width="180" />
              <a-table-column title="支付方式" :width="120">
                <template #cell="{ record }">
                  {{ getPaymentMethodText(record.paymentMethod) }}
                </template>
              </a-table-column>
              <a-table-column title="支付金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">¥{{ record.amount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="支付状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getPaymentStatusColor(record.status)">
                    {{ getPaymentStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="支付时间" data-index="paymentTime" :width="160" />
              <a-table-column title="备注" data-index="remark" :width="200" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="3" title="物流信息" v-if="currentOrder.status !== 'pending'">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="物流公司">{{ currentOrder.logisticsCompany || '-' }}</a-descriptions-item>
            <a-descriptions-item label="物流单号">{{ currentOrder.logisticsNo || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{ currentOrder.shipTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="物流状态">
              <a-tag v-if="currentOrder.logisticsStatus" :color="getLogisticsStatusColor(currentOrder.logisticsStatus)">
                {{ getLogisticsStatusText(currentOrder.logisticsStatus) }}
              </a-tag>
              <span v-else>-</span>
            </a-descriptions-item>
          </a-descriptions>

          <a-divider>物流跟踪</a-divider>

          <a-timeline v-if="currentOrder.logisticsTracks && currentOrder.logisticsTracks.length > 0">
            <a-timeline-item 
              v-for="(track, index) in currentOrder.logisticsTracks" 
              :key="index"
              :label="track.time"
            >
              {{ track.content }}
            </a-timeline-item>
          </a-timeline>
          <a-empty v-else description="暂无物流信息" />
        </a-tab-pane>

        <a-tab-pane key="4" title="发票信息" v-if="currentOrder.invoiceStatus">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="发票状态">
              <a-tag :color="getInvoiceStatusColor(currentOrder.invoiceStatus)">
                {{ getInvoiceStatusText(currentOrder.invoiceStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="发票类型">{{ currentOrder.invoiceType || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发票号码">{{ currentOrder.invoiceNo || '-' }}</a-descriptions-item>
            <a-descriptions-item label="开票时间">{{ currentOrder.invoiceTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发票金额">¥{{ currentOrder.invoiceAmount || '-' }}</a-descriptions-item>
            <a-descriptions-item label="税率">{{ currentOrder.taxRate || '-' }}</a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>

        <a-tab-pane key="5" title="订单流程">
          <a-steps :current="getOrderStep(currentOrder.status)" status="process">
            <a-step title="待确认" :description="currentOrder.createTime" />
            <a-step title="已确认" :description="currentOrder.confirmTime || '等待确认'" />
            <a-step title="已发货" :description="currentOrder.shipTime || '等待发货'" />
            <a-step title="已完成" :description="currentOrder.completeTime || '等待完成'" />
          </a-steps>

          <a-divider>操作日志</a-divider>

          <a-timeline>
            <a-timeline-item 
              v-for="(log, index) in currentOrder.logs" 
              :key="index"
              :label="log.time"
            >
              {{ log.content }}
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <a-modal 
      v-model:visible="confirmVisible" 
      title="确认接单" 
      :width="800"
      @ok="handleConfirmSubmit"
      @cancel="confirmVisible = false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        确认接单后，请按约定时间发货。如有特殊情况请提前沟通。
      </a-alert>

      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="商品数量">{{ currentOrder.skuCount }} 种</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
        <a-descriptions-item label="下单时间">{{ currentOrder.createTime }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="confirmForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="预计发货时间" required>
          <a-date-picker v-model="confirmForm.estimatedShipDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="confirmForm.remark" placeholder="如有特殊情况请备注说明" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="shipVisible" 
      title="发货处理" 
      :width="800"
      @ok="handleShipSubmit"
      @cancel="shipVisible = false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        发货前请确认商品已准备完毕，填写物流信息后点击确认发货。
      </a-alert>

      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="shipForm" layout="vertical" style="margin-top: 16px">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="物流公司" required>
              <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="中通快递">中通快递</a-option>
                <a-option value="圆通速递">圆通速递</a-option>
                <a-option value="申通快递">申通快递</a-option>
                <a-option value="韵达快递">韵达快递</a-option>
                <a-option value="EMS">EMS</a-option>
                <a-option value="自配送">自配送</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="物流单号" required>
              <a-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="发货备注">
          <a-textarea v-model="shipForm.remark" placeholder="发货备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="invoiceVisible"
      title="开具发票"
      :width="600"
      @ok="handleInvoiceSubmit"
      @cancel="invoiceVisible = false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        开具发票后，发票信息将同步给采购方
      </a-alert>

      <a-form :model="invoiceForm" layout="vertical">
        <a-form-item label="发票类型" required>
          <a-select v-model="invoiceForm.invoiceType" placeholder="请选择发票类型">
            <a-option value="增值税专用发票">增值税专用发票</a-option>
            <a-option value="增值税普通发票">增值税普通发票</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发票号码" required>
          <a-input v-model="invoiceForm.invoiceNo" placeholder="请输入发票号码" />
        </a-form-item>
        <a-form-item label="发票金额" required>
          <a-input-number v-model="invoiceForm.invoiceAmount" :precision="2" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="税率" required>
          <a-select v-model="invoiceForm.taxRate" placeholder="请选择税率">
            <a-option value="13%">13%</a-option>
            <a-option value="9%">9%</a-option>
            <a-option value="6%">6%</a-option>
            <a-option value="3%">3%</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开票日期" required>
          <a-date-picker v-model="invoiceForm.invoiceDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="invoiceForm.remark" placeholder="备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const viewMode = ref('all')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const orderList = ref([
  {
    id: '1',
    orderNo: 'PO202401001',
    warehouseName: '深圳宝安工程仓',
    skuCount: 5,
    totalAmount: 28500,
    deliveryDate: '2024-01-25',
    status: 'pending',
    paymentStatus: 'paid',
    createTime: '2024-01-20 10:30:00',
    address: '深圳市宝安区西乡街道XX路XX号',
    remark: '请尽快发货',
    invoiceStatus: '',
  },
  {
    id: '2',
    orderNo: 'PO202401002',
    warehouseName: '广州天河工程仓',
    skuCount: 8,
    totalAmount: 156000,
    deliveryDate: '2024-01-28',
    status: 'confirmed',
    paymentStatus: 'paid',
    createTime: '2024-01-19 14:00:00',
    confirmTime: '2024-01-19 16:30:00',
    address: '广州市天河区棠下街道XX路XX号',
    remark: '',
    invoiceStatus: '',
  },
  {
    id: '3',
    orderNo: 'PO202401003',
    warehouseName: '东莞南城工程仓',
    skuCount: 12,
    totalAmount: 89000,
    deliveryDate: '2024-01-30',
    status: 'shipped',
    paymentStatus: 'paid',
    createTime: '2024-01-18 09:00:00',
    confirmTime: '2024-01-18 11:00:00',
    shipTime: '2024-01-20 15:00:00',
    address: '东莞市南城区鸿福路XX号',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890',
    logisticsStatus: 'transporting',
    logisticsTracks: [
      { time: '2024-01-20 15:00', content: '已发货，顺丰速运揽收' },
      { time: '2024-01-20 18:30', content: '快件已到达深圳集散中心' },
      { time: '2024-01-21 08:00', content: '快件已发出，下一站东莞转运中心' },
    ],
    invoiceStatus: '',
  },
  {
    id: '4',
    orderNo: 'PO202401004',
    warehouseName: '佛山禅城工程仓',
    skuCount: 3,
    totalAmount: 12500,
    deliveryDate: '2024-01-22',
    status: 'completed',
    paymentStatus: 'paid',
    createTime: '2024-01-21 16:00:00',
    confirmTime: '2024-01-21 17:00:00',
    shipTime: '2024-01-22 09:00:00',
    completeTime: '2024-01-23 14:00:00',
    address: '佛山市禅城区祖庙路XX号',
    logisticsCompany: '京东物流',
    logisticsNo: 'JD9876543210',
    invoiceStatus: 'pending',
  },
  {
    id: '5',
    orderNo: 'PO202401005',
    warehouseName: '惠州惠城工程仓',
    skuCount: 6,
    totalAmount: 45000,
    deliveryDate: '2024-01-26',
    status: 'completed',
    paymentStatus: 'paid',
    createTime: '2024-01-20 11:00:00',
    confirmTime: '2024-01-20 13:00:00',
    shipTime: '2024-01-21 10:00:00',
    completeTime: '2024-01-22 16:00:00',
    address: '惠州市惠城区XX路XX号',
    logisticsCompany: '中通快递',
    logisticsNo: 'ZT1234567890',
    invoiceStatus: 'issued',
    invoiceNo: 'INV20240122001',
    invoiceType: '增值税专用发票',
    invoiceTime: '2024-01-23 10:00:00',
    invoiceAmount: '45000',
    taxRate: '13%',
  },
])

const filteredOrders = computed(() => {
  if (viewMode.value === 'all') return orderList.value
  return orderList.value.filter(o => o.status === viewMode.value)
})

const detailVisible = ref(false)
const currentOrder = ref<any>({})

const paymentRecords = ref<any[]>([])

const confirmVisible = ref(false)
const confirmForm = reactive({
  estimatedShipDate: '',
  remark: ''
})

const shipVisible = ref(false)
const shipForm = reactive({
  logisticsCompany: '',
  logisticsNo: '',
  remark: ''
})

const invoiceVisible = ref(false)
const invoiceForm = reactive({
  invoiceType: '',
  invoiceNo: '',
  invoiceAmount: 0,
  taxRate: '',
  invoiceDate: '',
  remark: '',
})

function isUrgent(deliveryDate: string) {
  const days = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return days <= 2
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleView(record: any) {
  currentOrder.value = {
    ...record,
    skuList: [
      { skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', quantity: 200, price: 26, remark: '' },
      { skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', quantity: 300, price: 42, remark: '' },
      { skuCode: 'SKU004', productName: '内墙乳胶漆', specValues: '20L/桶', unit: '桶', quantity: 15, price: 360, remark: '' }
    ],
    logs: [
      { time: record.createTime, content: '订单创建' },
      ...(record.confirmTime ? [{ time: record.confirmTime, content: '订单已确认' }] : []),
      ...(record.shipTime ? [{ time: record.shipTime, content: `已发货，物流公司：${record.logisticsCompany}，运单号：${record.logisticsNo}` }] : []),
      ...(record.completeTime ? [{ time: record.completeTime, content: '订单已完成' }] : []),
    ],
  }

  paymentRecords.value = record.paymentStatus === 'paid' ? [
    {
      paymentNo: `PAY${Date.now()}`,
      paymentMethod: 'escrow',
      amount: record.totalAmount,
      status: 'paid',
      paymentTime: record.createTime,
      remark: '工程仓托管账户支付',
    },
  ] : []

  detailVisible.value = true
}

function handleConfirm(record: any) {
  currentOrder.value = record
  confirmForm.estimatedShipDate = ''
  confirmForm.remark = ''
  detailVisible.value = false
  confirmVisible.value = true
}

function handleConfirmFromDetail() {
  detailVisible.value = false
  confirmVisible.value = true
}

function handleConfirmSubmit() {
  if (!confirmForm.estimatedShipDate) {
    Message.warning('请选择预计发货时间')
    return
  }
  Message.success('接单成功，请按约定时间发货')
  currentOrder.value.status = 'confirmed'
  currentOrder.value.confirmTime = new Date().toLocaleString()
  confirmVisible.value = false
}

function handleReject() {
  Message.info('已拒绝订单')
  detailVisible.value = false
}

function handleShip(record: any) {
  currentOrder.value = record
  shipForm.logisticsCompany = ''
  shipForm.logisticsNo = ''
  shipForm.remark = ''
  shipVisible.value = true
}

function handleShipSubmit() {
  if (!shipForm.logisticsCompany) {
    Message.warning('请选择物流公司')
    return
  }
  if (!shipForm.logisticsNo) {
    Message.warning('请输入物流单号')
    return
  }
  Message.success('发货成功，物流信息已更新')
  currentOrder.value.status = 'shipped'
  currentOrder.value.shipTime = new Date().toLocaleString()
  currentOrder.value.logisticsCompany = shipForm.logisticsCompany
  currentOrder.value.logisticsNo = shipForm.logisticsNo
  shipVisible.value = false
}

function handleViewLogistics(record: any) {
  handleView(record)
}

function handleInvoice(record: any) {
  currentOrder.value = record
  invoiceForm.invoiceType = '增值税专用发票'
  invoiceForm.invoiceNo = ''
  invoiceForm.invoiceAmount = record.totalAmount
  invoiceForm.taxRate = '13%'
  invoiceForm.invoiceDate = ''
  invoiceForm.remark = ''
  invoiceVisible.value = true
}

function handleInvoiceSubmit() {
  if (!invoiceForm.invoiceType || !invoiceForm.invoiceNo || !invoiceForm.invoiceAmount || !invoiceForm.taxRate || !invoiceForm.invoiceDate) {
    Message.warning('请完善发票信息')
    return
  }

  currentOrder.value.invoiceStatus = 'issued'
  currentOrder.value.invoiceNo = invoiceForm.invoiceNo
  currentOrder.value.invoiceType = invoiceForm.invoiceType
  currentOrder.value.invoiceTime = new Date().toLocaleString()
  currentOrder.value.invoiceAmount = invoiceForm.invoiceAmount
  currentOrder.value.taxRate = invoiceForm.taxRate

  invoiceVisible.value = false
  Message.success('发票开具成功')
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'cyan',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    paid: 'green',
    refunded: 'red'
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    refunded: '已退款'
  }
  return texts[status] || status
}

function getPaymentMethodText(method: string) {
  const texts: Record<string, string> = {
    escrow: '托管账户',
    bank: '银行转账',
    alipay: '支付宝',
    wechat: '微信支付'
  }
  return texts[method] || method
}

function getLogisticsStatusColor(status: string) {
  const colors: Record<string, string> = {
    transporting: 'blue',
    delivered: 'green',
    signed: 'green'
  }
  return colors[status] || 'gray'
}

function getLogisticsStatusText(status: string) {
  const texts: Record<string, string> = {
    transporting: '运输中',
    delivered: '已送达',
    signed: '已签收'
  }
  return texts[status] || status
}

function getInvoiceStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    issued: 'green'
  }
  return colors[status] || 'gray'
}

function getInvoiceStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待开票',
    issued: '已开票'
  }
  return texts[status] || status
}

function getOrderStep(status: string) {
  const steps: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    completed: 3
  }
  return steps[status] || 0
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
