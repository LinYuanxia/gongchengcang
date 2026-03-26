<template>
  <div class="stock-in-detail">
    <a-page-header
      :title="`入库单详情 - ${order.orderNo}`"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button v-if="order.status === 'pending'" type="primary" @click="handleApprove">
            审核
          </a-button>
          <a-button @click="handlePrint">
            <template #icon><icon-printer /></template>
            打印
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card class="mt-16">
      <a-descriptions :column="4" bordered>
        <a-descriptions-item label="入库单号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="入库类型">
          <a-tag :color="getTypeColor(order.type)">{{ getTypeText(order.type) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="来源单号">{{ order.sourceOrderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="入库仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="入库数量">{{ order.totalQuantity }}</a-descriptions-item>
        <a-descriptions-item label="入库金额">
          <span class="amount">¥{{ order.totalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="审核时间">{{ order.approveTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="入库时间">{{ order.inboundTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ order.operator }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="4">{{ order.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="入库商品批次明细" class="mt-16">
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" />
          <a-table-column title="批次号" :width="150">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.batchNo }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="生产日期" data-index="productionDate" :width="120" />
          <a-table-column title="入库数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.price }}
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="批次批注" data-index="batchRemark" :width="200" ellipsis />
          <a-table-column title="当前库存" :width="100" align="right">
            <template #cell="{ record }">
              <span :class="record.currentStock < record.quantity ? 'text-warning' : 'text-success'">
                {{ record.currentStock }}
              </span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-card title="批次库存分布" class="mt-16">
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>每个商品的不同批次独立管理库存，支持先进先出、批次追溯</div>
        </template>
      </a-alert>

      <a-collapse :default-active-key="['1', '2']">
        <a-collapse-item v-for="(product, index) in batchProducts" :key="index" :header="product.productName">
          <template #extra>
            <a-space>
              <span>总库存：{{ product.totalStock }}</span>
              <span>批次数：{{ product.batches.length }}</span>
            </a-space>
          </template>

          <a-table :data="product.batches" :pagination="false">
            <template #columns>
              <a-table-column title="批次号" :width="150">
                <template #cell="{ record }">
                  <a-tag color="blue">{{ record.batchNo }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="入库日期" data-index="inboundDate" :width="120" />
              <a-table-column title="生产日期" data-index="productionDate" :width="120" />
              <a-table-column title="入库数量" data-index="inboundQuantity" :width="100" align="right" />
              <a-table-column title="当前库存" :width="100" align="right">
                <template #cell="{ record }">
                  <span :class="record.currentStock === 0 ? 'text-danger' : 'text-success'">
                    {{ record.currentStock }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="已出库数量" :width="100" align="right">
                <template #cell="{ record }">
                  {{ record.outboundQuantity }}
                </template>
              </a-table-column>
              <a-table-column title="批次批注" data-index="remark" :width="200" ellipsis />
              <a-table-column title="库存状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getStockStatusColor(record.currentStock, record.inboundQuantity)">
                    {{ getStockStatusText(record.currentStock, record.inboundQuantity) }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-collapse-item>
      </a-collapse>
    </a-card>

    <a-card title="操作日志" class="mt-16">
      <a-timeline>
        <a-timeline-item v-for="(log, index) in order.logs" :key="index" :label="log.time">
          {{ log.content }}
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const order = ref({
  id: route.params.id || '1',
  orderNo: 'RK202401150001',
  type: 'purchase',
  sourceOrderNo: 'PO202401150001',
  supplierName: '广东建材有限公司',
  warehouseName: '深圳湾科技园主仓',
  totalQuantity: 500,
  totalAmount: '210,000.00',
  status: 'completed',
  createTime: '2024-01-15 10:30:00',
  approveTime: '2024-01-15 11:00:00',
  inboundTime: '2024-01-15 14:30:00',
  operator: '张三',
  remark: '',
  items: [
    {
      id: '1',
      productName: '地板砖',
      spec: '800x800mm',
      unit: '片',
      batchNo: 'B20240309001',
      productionDate: '2024-03-01',
      quantity: 1000,
      price: 95,
      amount: '95,000.00',
      batchRemark: '白色，优等品',
      currentStock: 850,
    },
    {
      id: '2',
      productName: '地板砖',
      spec: '800x800mm',
      unit: '片',
      batchNo: 'B20240309002',
      productionDate: '2024-03-05',
      quantity: 500,
      price: 95,
      amount: '47,500.00',
      batchRemark: '灰色，优等品',
      currentStock: 500,
    },
    {
      id: '3',
      productName: '墙砖',
      spec: '300x600mm',
      unit: '片',
      batchNo: 'B20240309003',
      productionDate: '2024-03-02',
      quantity: 2000,
      price: 35,
      amount: '70,000.00',
      batchRemark: '白色，一等品',
      currentStock: 1800,
    },
  ],
  logs: [
    { time: '2024-01-15 14:30:00', content: '入库完成，库存已更新' },
    { time: '2024-01-15 11:00:00', content: '审核通过' },
    { time: '2024-01-15 10:30:00', content: '创建入库单，关联采购订单：PO202401150001' },
  ],
})

const batchProducts = ref([
  {
    productName: '地板砖 (800x800mm)',
    totalStock: 1350,
    batches: [
      {
        batchNo: 'B20240309001',
        inboundDate: '2024-03-09',
        productionDate: '2024-03-01',
        inboundQuantity: 1000,
        currentStock: 850,
        outboundQuantity: 150,
        remark: '白色，优等品',
      },
      {
        batchNo: 'B20240309002',
        inboundDate: '2024-03-09',
        productionDate: '2024-03-05',
        inboundQuantity: 500,
        currentStock: 500,
        outboundQuantity: 0,
        remark: '灰色，优等品',
      },
    ],
  },
  {
    productName: '墙砖 (300x600mm)',
    totalStock: 1800,
    batches: [
      {
        batchNo: 'B20240309003',
        inboundDate: '2024-03-09',
        productionDate: '2024-03-02',
        inboundQuantity: 2000,
        currentStock: 1800,
        outboundQuantity: 200,
        remark: '白色，一等品',
      },
    ],
  },
])

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    purchase: 'blue',
    return: 'orange',
    transfer: 'purple',
  }
  return colors[type] || 'gray'
}

function getTypeText(type: string) {
  const texts: Record<string, string> = {
    purchase: '采购入库',
    return: '退货入库',
    transfer: '调拨入库',
  }
  return texts[type] || type
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'blue',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已审核',
    completed: '已完成',
  }
  return texts[status] || status
}

function getStockStatusColor(current: number, total: number) {
  if (current === 0) return 'red'
  if (current < total * 0.3) return 'orange'
  return 'green'
}

function getStockStatusText(current: number, total: number) {
  if (current === 0) return '已出完'
  if (current < total * 0.3) return '库存紧张'
  return '库存充足'
}

function handleBack() {
  router.back()
}

async function handleApprove() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    order.value.status = 'approved'
    order.value.approveTime = new Date().toLocaleString()
    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: '审核通过',
    })
    Message.success('审核成功')
  } catch (error) {
    Message.error('审核失败，请重试')
  }
}

function handlePrint() {
  window.print()
}
</script>

<style scoped lang="less">
.stock-in-detail {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.amount {
  color: #f53f3f;
  font-weight: 600;
}

.text-danger {
  color: #f53f3f;
}

.text-warning {
  color: #ff7d00;
}

.text-success {
  color: #00b42a;
}
</style>
