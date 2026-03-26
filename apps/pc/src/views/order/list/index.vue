<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索订单号"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.type" placeholder="订单类型" style="width: 120px" allow-clear>
            <a-option v-for="item in ORDER_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="订单状态" style="width: 120px" allow-clear>
            <a-option v-for="item in ORDER_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-range-picker style="width: 260px" />
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            创建订单
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="订单号" data-index="orderNo" :width="150" />
          <a-table-column title="类型" :width="100">
            <template #cell="{ record }">
              <a-tag>{{ record.typeLabel }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="买方" data-index="buyerName" :width="150" />
          <a-table-column title="卖方" data-index="sellerName" :width="150" />
          <a-table-column title="订单金额" :width="120">
            <template #cell="{ record }">
              <span class="text-primary">¥{{ record.totalAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="PAY_STATUS_MAP[record.payStatus]?.color">
                {{ PAY_STATUS_MAP[record.payStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="ORDER_STATUS_MAP[record.status]?.color">
                {{ ORDER_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleConfirm(record)" v-if="record.status === 1">
                  确认
                </a-button>
                <a-button type="text" size="small" @click="handleShip(record)" v-if="record.status === 3">
                  发货
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { ORDER_TYPE_OPTIONS, ORDER_STATUS_OPTIONS, ORDER_STATUS_MAP, PAY_STATUS_MAP } from '@gongchengcang/constants'
import type { Order } from '@gongchengcang/types'

const router = useRouter()
const loading = ref(false)
const tableData = ref<Order[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  type: undefined as string | undefined,
  status: undefined as number | undefined,
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: '1',
        orderNo: 'PO2024010001',
        type: 'purchase' as any,
        typeLabel: '采购',
        status: 1,
        buyerId: '1',
        buyerName: '南京工程仓',
        buyerType: 'warehouse' as any,
        sellerId: '2',
        sellerName: '华东建材供应商',
        sellerType: 'supplier' as any,
        items: [],
        totalAmount: 12500,
        discountAmount: 0,
        freightAmount: 0,
        payAmount: 12500,
        paidAmount: 0,
        payStatus: 0,
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 10:30:00',
      },
      {
        id: '2',
        orderNo: 'SO2024010012',
        type: 'sale' as any,
        typeLabel: '销售',
        status: 3,
        buyerId: '3',
        buyerName: '中建三局项目部',
        buyerType: 'constructor' as any,
        sellerId: '1',
        sellerName: '南京工程仓',
        sellerType: 'warehouse' as any,
        items: [],
        totalAmount: 8800,
        discountAmount: 0,
        freightAmount: 0,
        payAmount: 8800,
        paidAmount: 8800,
        payStatus: 2,
        payTime: '2024-01-16 11:00:00',
        payType: 'balance' as any,
        createdAt: '2024-01-16 09:20:00',
        updatedAt: '2024-01-16 11:00:00',
      },
    ]
    pagination.total = 2
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleAdd() {
  Message.info('创建订单')
}

function handleView(record: Order) {
  router.push(`/order/detail/${record.id}`)
}

function handleConfirm(record: Order) {
  Message.success(`订单 ${record.orderNo} 已确认`)
  loadData()
}

function handleShip(record: Order) {
  Message.success(`订单 ${record.orderNo} 已发货`)
  loadData()
}
</script>
