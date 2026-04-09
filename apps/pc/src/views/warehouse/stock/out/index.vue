<template>
  <div class="stock-out">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增出库单
          </a-button>
        </a-space>
      </template>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="出库单号">
          <a-input v-model="searchForm.orderNo" placeholder="请输入出库单号" allow-clear />
        </a-form-item>
        <a-form-item label="出库类型">
          <a-select v-model="searchForm.type" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="sale">销售出库</a-option>
            <a-option value="transfer">调拨出库</a-option>
            <a-option value="scrap">报废出库</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已审核</a-option>
            <a-option value="completed">已完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="stockOutList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="出库单号" data-index="orderNo" :width="150" />
          <a-table-column title="出库类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" data-index="relatedOrderNo" :width="150" />
          <a-table-column title="客户" data-index="customerName" :width="150" />
          <a-table-column title="出库仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="出库数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="出库金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleApprove(record)">审核</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = ref({
  orderNo: '',
  type: '',
  status: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const allStockOutList = ref([
  { id: '1', orderNo: 'CK202401150001', type: 'sale', relatedOrderNo: 'SO202401150001', customerName: '深圳建筑工程公司', warehouseName: '深圳湾科技园主仓', quantity: 100, amount: '45,000.00', status: 'completed', createTime: '2024-01-15 11:30:00' },
  { id: '2', orderNo: 'CK202401150002', type: 'sale', relatedOrderNo: 'SO202401150002', customerName: '广州装饰工程公司', warehouseName: '福田CBD分仓', quantity: 50, amount: '21,400.00', status: 'approved', createTime: '2024-01-15 15:20:00' },
  { id: '3', orderNo: 'CK202401140001', type: 'transfer', relatedOrderNo: '-', customerName: '-', warehouseName: '深圳湾科技园主仓', quantity: 200, amount: '-', status: 'pending', createTime: '2024-01-14 17:00:00' },
])

const stockOutList = ref([...allStockOutList.value])

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    sale: 'green',
    transfer: 'purple',
    scrap: 'red',
  }
  return colors[type] || 'gray'
}

function getTypeText(type: string) {
  const texts: Record<string, string> = {
    sale: '销售出库',
    transfer: '调拨出库',
    scrap: '报废出库',
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

function handleSearch() {
  let filtered = [...allStockOutList.value]
  
  if (searchForm.value.orderNo) {
    filtered = filtered.filter(item => 
      item.orderNo.includes(searchForm.value.orderNo) ||
      item.relatedOrderNo.includes(searchForm.value.orderNo)
    )
  }
  
  if (searchForm.value.type) {
    filtered = filtered.filter(item => item.type === searchForm.value.type)
  }
  
  if (searchForm.value.status) {
    filtered = filtered.filter(item => item.status === searchForm.value.status)
  }
  
  stockOutList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleAdd() {
  router.push('/warehouse/warehouse/out/create')
}

function handleExport() {
  if (stockOutList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${stockOutList.value.length} 条出库记录`)
}

function handleView(record: any) {
  Message.info(`查看出库单：${record.orderNo}`)
}

function handleApprove(record: any) {
  Message.success(`出库单 ${record.orderNo} 审核通过`)
}
</script>

<style scoped lang="less">
.stock-out {
  padding: 16px;
}

.search-form {
  margin-bottom: 0;
}

.mt-16 {
  margin-top: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}
</style>
