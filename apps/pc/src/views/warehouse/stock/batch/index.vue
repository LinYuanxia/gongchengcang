<template>
  <div class="batch-stock">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="批次号">
          <a-input v-model="searchForm.batchNo" placeholder="请输入批次号" allow-clear />
        </a-form-item>
        <a-form-item label="商品名称">
          <a-input v-model="searchForm.productName" placeholder="请输入商品名称" allow-clear />
        </a-form-item>
        <a-form-item label="入库日期">
          <a-range-picker v-model="searchForm.inboundDate" style="width: 240px" />
        </a-form-item>
        <a-form-item label="库存状态">
          <a-select v-model="searchForm.stockStatus" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="sufficient">库存充足</a-option>
            <a-option value="low">库存紧张</a-option>
            <a-option value="empty">已出完</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="仓库">
          <a-select v-model="searchForm.warehouse" placeholder="请选择" allow-clear style="width: 150px">
            <a-option value="深圳湾科技园主仓">深圳湾科技园主仓</a-option>
            <a-option value="福田CBD分仓">福田CBD分仓</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="batchList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="批次号" :width="150" fixed="left">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.batchNo }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="商品编码" data-index="productCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="80" align="center" />
          <a-table-column title="入库日期" data-index="inboundDate" :width="120" />
          <a-table-column title="生产日期" data-index="productionDate" :width="120" />
          <a-table-column title="入库数量" data-index="inboundQuantity" :width="100" align="right" />
          <a-table-column title="当前库存" :width="100" align="right">
            <template #cell="{ record }">
              <span :class="getStockClass(record.currentStock, record.inboundQuantity)">
                {{ record.currentStock }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="已出库数量" data-index="outboundQuantity" :width="100" align="right" />
          <a-table-column title="批次批注" data-index="remark" :width="180" ellipsis />
          <a-table-column title="入库仓库" data-index="warehouse" :width="150" />
          <a-table-column title="入库单号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewInbound(record.inboundNo)">{{ record.inboundNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="库存状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStockStatusColor(record.currentStock, record.inboundQuantity)">
                {{ getStockStatusText(record.currentStock, record.inboundQuantity) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewProduct(record)">查看商品</a-link>
                <a-link @click="handleViewOutbound(record)">出库记录</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="outboundModalVisible"
      title="批次出库记录"
      :width="900"
      :footer="false"
    >
      <a-descriptions :column="2" bordered style="margin-bottom: 16px">
        <a-descriptions-item label="批次号">
          <a-tag color="blue">{{ currentBatch.batchNo }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ currentBatch.productName }}</a-descriptions-item>
        <a-descriptions-item label="入库数量">{{ currentBatch.inboundQuantity }}</a-descriptions-item>
        <a-descriptions-item label="当前库存">{{ currentBatch.currentStock }}</a-descriptions-item>
      </a-descriptions>

      <h4>出库记录</h4>
      <a-table :data="outboundRecords" :pagination="false">
        <template #columns>
          <a-table-column title="出库单号" data-index="outboundNo" :width="150" />
          <a-table-column title="出库时间" data-index="outboundTime" :width="160" />
          <a-table-column title="出库数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="出库类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'sale' ? 'blue' : 'orange'">
                {{ record.type === 'sale' ? '销售出库' : '调拨出库' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" data-index="orderNo" :width="150" />
          <a-table-column title="客户/仓库" data-index="target" :width="150" />
          <a-table-column title="操作人" data-index="operator" :width="100" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchForm = ref({
  batchNo: '',
  productName: '',
  inboundDate: [],
  stockStatus: '',
  warehouse: '',
})

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 100,
})

const allBatchList = ref([
  {
    id: '1',
    batchNo: 'B20240309001',
    productCode: 'SKU-SN-001',
    productName: '水泥 P.O 42.5',
    spec: '50kg/袋',
    unit: '袋',
    inboundDate: '2024-03-09',
    productionDate: '2024-03-01',
    inboundQuantity: 200,
    currentStock: 150,
    outboundQuantity: 50,
    remark: '白色，优等品',
    warehouse: '深圳湾科技园主仓',
    inboundNo: 'RK202403090001',
  },
  {
    id: '2',
    batchNo: 'B20240309002',
    productCode: 'SKU-SN-001',
    productName: '水泥 P.O 42.5',
    spec: '50kg/袋',
    unit: '袋',
    inboundDate: '2024-03-09',
    productionDate: '2024-03-05',
    inboundQuantity: 150,
    currentStock: 150,
    outboundQuantity: 0,
    remark: '灰色，优等品',
    warehouse: '深圳湾科技园主仓',
    inboundNo: 'RK202403090001',
  },
  {
    id: '3',
    batchNo: 'B20240310001',
    productCode: 'SKU-SN-001',
    productName: '水泥 P.O 42.5',
    spec: '50kg/袋',
    unit: '袋',
    inboundDate: '2024-03-10',
    productionDate: '2024-03-08',
    inboundQuantity: 100,
    currentStock: 80,
    outboundQuantity: 20,
    remark: '白色，一等品',
    warehouse: '福田CBD分仓',
    inboundNo: 'RK202403100001',
  },
  {
    id: '4',
    batchNo: 'B20240315001',
    productCode: 'SKU-SN-001',
    productName: '水泥 P.O 42.5',
    spec: '50kg/袋',
    unit: '袋',
    inboundDate: '2024-03-15',
    productionDate: '2024-03-12',
    inboundQuantity: 150,
    currentStock: 120,
    outboundQuantity: 30,
    remark: '白色，优等品',
    warehouse: '深圳湾科技园主仓',
    inboundNo: 'RK202403150001',
  },
  {
    id: '5',
    batchNo: 'B20240308001',
    productCode: 'SKU-HS-001',
    productName: '黄砂 中砂',
    spec: '中砂',
    unit: '方',
    inboundDate: '2024-03-08',
    productionDate: '2024-03-06',
    inboundQuantity: 100,
    currentStock: 50,
    outboundQuantity: 50,
    remark: '中砂，河砂',
    warehouse: '深圳湾科技园主仓',
    inboundNo: 'RK202403080001',
  },
  {
    id: '6',
    batchNo: 'B20240311001',
    productCode: 'SKU-HS-001',
    productName: '黄砂 中砂',
    spec: '中砂',
    unit: '方',
    inboundDate: '2024-03-11',
    productionDate: '2024-03-09',
    inboundQuantity: 80,
    currentStock: 0,
    outboundQuantity: 80,
    remark: '中砂，海砂',
    warehouse: '福田CBD分仓',
    inboundNo: 'RK202403110001',
  },
  {
    id: '7',
    batchNo: 'B20240312001',
    productCode: 'SKU-DZ-001',
    productName: '地板砖',
    spec: '800x800mm',
    unit: '片',
    inboundDate: '2024-03-12',
    productionDate: '2024-03-10',
    inboundQuantity: 500,
    currentStock: 450,
    outboundQuantity: 50,
    remark: '白色，优等品',
    warehouse: '深圳湾科技园主仓',
    inboundNo: 'RK202403120001',
  },
  {
    id: '8',
    batchNo: 'B20240313001',
    productCode: 'SKU-QZ-001',
    productName: '墙砖',
    spec: '300x600mm',
    unit: '片',
    inboundDate: '2024-03-13',
    productionDate: '2024-03-11',
    inboundQuantity: 1000,
    currentStock: 950,
    outboundQuantity: 50,
    remark: '白色，一等品',
    warehouse: '福田CBD分仓',
    inboundNo: 'RK202403130001',
  },
])

const batchList = ref([...allBatchList.value])

const outboundModalVisible = ref(false)
const currentBatch = ref<any>({})
const outboundRecords = ref<any[]>([])

function getStockClass(current: number, total: number) {
  if (current === 0) return 'text-danger'
  if (current < total * 0.3) return 'text-warning'
  return 'text-success'
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

function handleSearch() {
  let filtered = [...allBatchList.value]
  
  if (searchForm.value.batchNo) {
    filtered = filtered.filter(item => 
      item.batchNo.includes(searchForm.value.batchNo)
    )
  }
  
  if (searchForm.value.productName) {
    filtered = filtered.filter(item => 
      item.productName.includes(searchForm.value.productName) ||
      item.productCode.includes(searchForm.value.productName)
    )
  }
  
  if (searchForm.value.inboundDate && searchForm.value.inboundDate.length === 2) {
    const [startDate, endDate] = searchForm.value.inboundDate
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.inboundDate)
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  if (searchForm.value.stockStatus) {
    filtered = filtered.filter(item => {
      if (searchForm.value.stockStatus === 'empty') return item.currentStock === 0
      if (searchForm.value.stockStatus === 'low') return item.currentStock > 0 && item.currentStock < item.inboundQuantity * 0.3
      if (searchForm.value.stockStatus === 'normal') return item.currentStock >= item.inboundQuantity * 0.3
      return true
    })
  }
  
  if (searchForm.value.warehouse) {
    filtered = filtered.filter(item => item.warehouse.includes(searchForm.value.warehouse))
  }
  
  batchList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    batchNo: '',
    productName: '',
    inboundDate: [],
    stockStatus: '',
    warehouse: '',
  }
}

function handleExport() {
  if (batchList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${batchList.value.length} 条批次记录`)
}

function handleViewInbound(inboundNo: string) {
  router.push({
    path: '/warehouse/warehouse/in/detail',
    query: { orderNo: inboundNo },
  })
}

function handleViewProduct(record: any) {
  router.push({
    path: '/warehouse/product/detail',
    query: { id: record.productCode },
  })
}

function handleViewOutbound(record: any) {
  currentBatch.value = record
  outboundRecords.value = [
    {
      outboundNo: 'CK202403150001',
      outboundTime: '2024-03-15 10:30:00',
      quantity: 30,
      type: 'sale',
      orderNo: 'SO202403150001',
      target: '深圳建筑工程公司',
      operator: '张三',
    },
    {
      outboundNo: 'CK202403140001',
      outboundTime: '2024-03-14 14:20:00',
      quantity: 20,
      type: 'sale',
      orderNo: 'SO202403140001',
      target: '广州建设集团',
      operator: '李四',
    },
  ]
  outboundModalVisible.value = true
}
</script>

<style scoped lang="less">
.batch-stock {
  padding: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.text-danger {
  color: #f53f3f;
  font-weight: 600;
}

.text-warning {
  color: #ff7d00;
  font-weight: 600;
}

.text-success {
  color: #00b42a;
  font-weight: 600;
}
</style>
