<template>
  <div class="statement">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
          <a-button type="primary" @click="handleGenerate">
            <template #icon><icon-plus /></template>
            生成对账单
          </a-button>
        </a-space>
      </template>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="对账月份">
          <a-month-picker v-model="searchForm.month" style="width: 150px" />
        </a-form-item>
        <a-form-item label="对账状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="pending">待确认</a-option>
            <a-option value="confirmed">已确认</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="statementList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="对账单号" data-index="statementNo" :width="150" />
          <a-table-column title="对账月份" data-index="month" :width="100" />
          <a-table-column title="对账方" data-index="partnerName" :width="180" />
          <a-table-column title="采购金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="expense">¥{{ record.purchaseAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="销售金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="income">¥{{ record.saleAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="应付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.payableAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'pending' ? 'orange' : 'green'">
                {{ record.status === 'pending' ? '待确认' : '已确认' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleDownload(record)">下载</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleConfirm(record)">确认</a-link>
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
  month: '',
  status: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const statementList = ref([
  { id: '1', statementNo: 'ST202401001', month: '2024-01', partnerName: '广东建材有限公司', purchaseAmount: '210,000.00', saleAmount: '0.00', payableAmount: '210,000.00', status: 'pending', createTime: '2024-01-31 10:00:00' },
  { id: '2', statementNo: 'ST202401002', month: '2024-01', partnerName: '上海钢材集团', purchaseAmount: '820,000.00', saleAmount: '0.00', payableAmount: '820,000.00', status: 'pending', createTime: '2024-01-31 10:00:00' },
  { id: '3', statementNo: 'ST202401003', month: '2024-01', partnerName: '深圳建筑工程公司', purchaseAmount: '0.00', saleAmount: '137,300.00', payableAmount: '-137,300.00', status: 'confirmed', createTime: '2024-01-31 10:00:00' },
  { id: '4', statementNo: 'ST202312001', month: '2023-12', partnerName: '广东建材有限公司', purchaseAmount: '185,000.00', saleAmount: '0.00', payableAmount: '185,000.00', status: 'confirmed', createTime: '2023-12-31 10:00:00' },
])

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleExport() {
  Message.info('导出功能开发中')
}

function handleGenerate() {
  Message.info('生成对账单功能开发中')
}

function handleView(record: any) {
  Message.info(`查看对账单：${record.statementNo}`)
}

function handleDownload(record: any) {
  Message.info(`下载对账单：${record.statementNo}`)
}

function handleConfirm(record: any) {
  Message.success(`对账单 ${record.statementNo} 已确认`)
}
</script>

<style scoped lang="less">
.statement {
  padding: 16px;
}

.search-form {
  margin-bottom: 0;
}

.mt-16 {
  margin-top: 16px;
}

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}

.price {
  color: #165dff;
  font-weight: 500;
}
</style>
