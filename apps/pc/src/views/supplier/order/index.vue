<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>待确认订单</span>
      </template>
      <template #extra>
        <a-radio-group v-model="viewMode" type="button">
          <a-radio value="all">全部</a-radio>
          <a-radio value="pending">待确认</a-radio>
          <a-radio value="confirmed">已确认</a-radio>
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
                  @click="handleShip(record)"
                >
                  发货
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
      :width="1000"
      :footer="false"
    >
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
        <a-descriptions-item label="下单时间">{{ currentOrder.createTime }}</a-descriptions-item>
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
                <a-option value="sf">顺丰速运</a-option>
                <a-option value="jd">京东物流</a-option>
                <a-option value="zt">中通快递</a-option>
                <a-option value="yt">圆通速递</a-option>
                <a-option value="sto">申通快递</a-option>
                <a-option value="yunda">韵达快递</a-option>
                <a-option value="ems">EMS</a-option>
                <a-option value="self">自配送</a-option>
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
    createTime: '2024-01-20 10:30:00',
    address: '深圳市宝安区西乡街道XX路XX号',
    remark: '请尽快发货'
  },
  {
    id: '2',
    orderNo: 'PO202401002',
    warehouseName: '广州天河工程仓',
    skuCount: 8,
    totalAmount: 156000,
    deliveryDate: '2024-01-28',
    status: 'confirmed',
    createTime: '2024-01-19 14:00:00',
    confirmTime: '2024-01-19 16:30:00',
    address: '广州市天河区棠下街道XX路XX号',
    remark: ''
  },
  {
    id: '3',
    orderNo: 'PO202401003',
    warehouseName: '东莞南城工程仓',
    skuCount: 12,
    totalAmount: 89000,
    deliveryDate: '2024-01-30',
    status: 'shipped',
    createTime: '2024-01-18 09:00:00',
    confirmTime: '2024-01-18 11:00:00',
    shipTime: '2024-01-20 15:00:00',
    address: '东莞市南城区鸿福路XX号',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890'
  },
  {
    id: '4',
    orderNo: 'PO202401004',
    warehouseName: '佛山禅城工程仓',
    skuCount: 3,
    totalAmount: 12500,
    deliveryDate: '2024-01-22',
    status: 'pending',
    createTime: '2024-01-21 16:00:00',
    address: '佛山市禅城区祖庙路XX号',
    remark: '紧急订单'
  }
])

const filteredOrders = computed(() => {
  if (viewMode.value === 'all') return orderList.value
  if (viewMode.value === 'pending') return orderList.value.filter(o => o.status === 'pending')
  if (viewMode.value === 'confirmed') return orderList.value.filter(o => ['confirmed', 'shipped'].includes(o.status))
  return orderList.value
})

const detailVisible = ref(false)
const currentOrder = ref<any>({})

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
    ]
  }
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
