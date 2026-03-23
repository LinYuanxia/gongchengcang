<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>合同列表</span>
      </template>
      <template #extra>
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          新增合同
        </a-button>
      </template>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索合同编号/名称"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="合同状态" style="width: 120px" allow-clear>
            <a-option value="active">生效中</a-option>
            <a-option value="expired">已过期</a-option>
            <a-option value="pending">待生效</a-option>
          </a-select>
        </a-space>
      </div>

      <a-table
        :data="filteredContracts"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="合同编号" data-index="contractNo" :width="150" />
          <a-table-column title="合同名称" data-index="contractName" :width="200" />
          <a-table-column title="合同类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.contractType)">
                {{ getTypeText(record.contractType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="签订日期" data-index="signDate" :width="120" />
          <a-table-column title="生效日期" data-index="startDate" :width="120" />
          <a-table-column title="到期日期" data-index="endDate" :width="120" />
          <a-table-column title="合同状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleDownload(record)">下载</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="viewVisible" title="合同详情" :width="700" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="合同编号">{{ currentContract?.contractNo }}</a-descriptions-item>
        <a-descriptions-item label="合同名称">{{ currentContract?.contractName }}</a-descriptions-item>
        <a-descriptions-item label="合同类型">
          <a-tag :color="getTypeColor(currentContract?.contractType)">
            {{ getTypeText(currentContract?.contractType) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="合同状态">
          <a-tag :color="getStatusColor(currentContract?.status)">
            {{ getStatusText(currentContract?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="签订日期">{{ currentContract?.signDate }}</a-descriptions-item>
        <a-descriptions-item label="生效日期">{{ currentContract?.startDate }}</a-descriptions-item>
        <a-descriptions-item label="到期日期">{{ currentContract?.endDate }}</a-descriptions-item>
        <a-descriptions-item label="合同金额">¥{{ currentContract?.amount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="甲方">{{ currentContract?.partyA }}</a-descriptions-item>
        <a-descriptions-item label="乙方">{{ currentContract?.partyB }}</a-descriptions-item>
        <a-descriptions-item label="合同附件" :span="2">
          <a-link v-if="currentContract?.attachment" @click="handleDownload(currentContract)">
            <icon-file />
            {{ currentContract?.attachmentName || '下载附件' }}
          </a-link>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentContract?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const viewVisible = ref(false)
const currentContract = ref<any>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  status: undefined as string | undefined,
})

const contracts = ref([
  {
    id: 'CT001',
    contractNo: 'HT-2024-001',
    contractName: '钢材供货合同',
    contractType: 'supply',
    signDate: '2024-01-15',
    startDate: '2024-01-20',
    endDate: '2024-12-31',
    status: 'active',
    amount: 5000000,
    partyA: '工程材料管理采供一体化平台',
    partyB: '宝钢集团有限公司',
    attachment: 'https://example.com/contract1.pdf',
    attachmentName: '钢材供货合同.pdf',
    remark: '年度框架合同',
  },
  {
    id: 'CT002',
    contractNo: 'HT-2024-002',
    contractName: '水泥供货合同',
    contractType: 'supply',
    signDate: '2024-02-01',
    startDate: '2024-02-10',
    endDate: '2024-08-31',
    status: 'active',
    amount: 2000000,
    partyA: '工程材料管理采供一体化平台',
    partyB: '宝钢集团有限公司',
    attachment: 'https://example.com/contract2.pdf',
    attachmentName: '水泥供货合同.pdf',
    remark: '',
  },
  {
    id: 'CT003',
    contractNo: 'HT-2023-015',
    contractName: '建材供货合同',
    contractType: 'supply',
    signDate: '2023-06-01',
    startDate: '2023-06-10',
    endDate: '2024-01-31',
    status: 'expired',
    amount: 1500000,
    partyA: '工程材料管理采供一体化平台',
    partyB: '宝钢集团有限公司',
    attachment: 'https://example.com/contract3.pdf',
    attachmentName: '建材供货合同.pdf',
    remark: '已到期',
  },
])

const filteredContracts = computed(() => {
  let result = contracts.value
  if (searchForm.status) {
    result = result.filter(c => c.status === searchForm.status)
  }
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(c => 
      c.contractNo.toLowerCase().includes(keyword) || 
      c.contractName.toLowerCase().includes(keyword)
    )
  }
  return result
})

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleView(record: any) {
  currentContract.value = record
  viewVisible.value = true
}

function handleDownload(record: any) {
  if (record.attachment) {
    Message.success('开始下载合同文件')
  } else {
    Message.warning('暂无合同附件')
  }
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    supply: 'blue',
    purchase: 'green',
    service: 'orange',
  }
  return colors[type] || 'gray'
}

function getTypeText(type: string) {
  const texts: Record<string, string> = {
    supply: '供货合同',
    purchase: '采购合同',
    service: '服务合同',
  }
  return texts[type] || type
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    active: 'green',
    expired: 'red',
    pending: 'orange',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    active: '生效中',
    expired: '已过期',
    pending: '待生效',
  }
  return texts[status] || status
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  margin-bottom: 16px;
}
</style>
