<template>
  <div class="warehouse-contract">
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增合同
        </a-button>
      </template>
      <a-table :data="contracts" :pagination="pagination">
        <template #columns>
          <a-table-column title="合同编号" data-index="contractNo" :width="150" />
          <a-table-column title="合同名称" data-index="contractName" :width="200" />
          <a-table-column title="合同类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'purchase' ? 'blue' : 'green'">
                {{ record.type === 'purchase' ? '采购' : '销售' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="签约方" data-index="partnerName" :width="180" />
          <a-table-column title="合同金额" data-index="amount" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="有效期" :width="200">
            <template #cell="{ record }">
              {{ record.startDate }} 至 {{ record.endDate }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleDownload(record)">下载</a-link>
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

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const contracts = ref([
  { id: 1, contractNo: 'CT20240001', contractName: '水泥采购合同', type: 'purchase', partnerName: '广东建材有限公司', amount: '500,000.00', startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', statusText: '生效中' },
  { id: 2, contractNo: 'CT20240002', contractName: '钢材采购合同', type: 'purchase', partnerName: '上海钢材集团', amount: '1,200,000.00', startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', statusText: '生效中' },
  { id: 3, contractNo: 'CT20240003', contractName: '材料销售合同', type: 'sale', partnerName: '深圳建筑工程公司', amount: '800,000.00', startDate: '2024-02-01', endDate: '2024-08-31', status: 'active', statusText: '生效中' },
  { id: 4, contractNo: 'CT20230015', contractName: '砂石采购合同', type: 'purchase', partnerName: '惠州砂石厂', amount: '300,000.00', startDate: '2023-01-01', endDate: '2023-12-31', status: 'expired', statusText: '已过期' },
])

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    active: 'green',
    expired: 'gray',
    pending: 'orange',
  }
  return colors[status] || 'gray'
}

function handleAdd() {
  Message.info('新增合同功能开发中')
}

function handleView(record: any) {
  Message.info(`查看合同：${record.contractNo}`)
}

function handleDownload(record: any) {
  Message.info(`下载合同：${record.contractNo}`)
}
</script>

<style scoped lang="less">
.warehouse-contract {
  padding: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}
</style>
