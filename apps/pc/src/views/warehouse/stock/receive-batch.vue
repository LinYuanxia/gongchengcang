<template>
  <div class="receive-batch">
    
    <div class="page-header">
      <h2 class="page-title">🧾 收货批次</h2>
      <p class="page-desc">商品批次全生命周期追溯，确保质量可追溯</p>
    </div>

    <a-card>
      <template #extra>
        <a-input-search v-model="searchForm.keyword" placeholder="搜索批次号/商品" style="width: 240px" @search="handleSearch" />
      </template>

      <a-table :data="batchList" :pagination="pagination" row-key="batchNo">
        <template #columns>
          <a-table-column title="批次号" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.batchNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="批次商品" :width="200">
            <template #cell="{ record }">
              <div class="sku-info">
                <div class="sku-name">{{ record.skuName }}</div>
                <div class="spec-tags">
                  <a-tag v-for="(value, key) in record.specs" :key="key" size="small" color="arcoblue">
                    {{ key }}: {{ value }}
                  </a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="130" />
          <a-table-column title="所在仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="来源订单" data-index="purchaseNo" :width="140">
            <template #cell="{ record }">
              <a-link>{{ record.purchaseNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="批次库存" :width="100" align="right" data-index="receiveQty" />
          <a-table-column title="当前库存" :width="100" align="right">
            <template #cell="{ record }">
              <strong>{{ record.currentStock }}</strong>
            </template>
          </a-table-column>
          <a-table-column title="已使用库存" :width="100" align="right" data-index="usedQty" />
          <a-table-column title="批次时间" data-index="receiveTime" :width="160" />
        </template>
      </a-table>
    </a-card>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const searchForm = reactive({
  keyword: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const batchList = ref([
  {
    batchNo: 'B202412250001',
    skuName: '水泥 P.O 42.5 袋装',
    specs: { '强度等级': '42.5', '包装': '袋装' },
    supplierName: '华润水泥',
    warehouseName: '深圳湾科技园仓',
    purchaseNo: 'PO-2024-12-001',
    receiveQty: 500,
    currentStock: 320,
    usedQty: 180,
    price: 420,
    unit: '吨',
    receiveTime: '2024-12-25 10:30:00',
  },
  {
    batchNo: 'B202412240002',
    skuName: '螺纹钢 HRB400 12mm',
    specs: { '直径': '12mm', '等级': 'HRB400' },
    supplierName: '韶钢',
    warehouseName: '深圳湾科技园仓',
    purchaseNo: 'PO-2024-12-003',
    receiveQty: 100,
    currentStock: 65,
    usedQty: 35,
    price: 4800,
    unit: '吨',
    receiveTime: '2024-12-24 09:15:00',
  },
  {
    batchNo: 'B202412200003',
    skuName: '碎石 5-31.5mm',
    specs: { '粒径': '5-31.5mm' },
    supplierName: '本地砂石厂',
    warehouseName: '福田CBD项目仓',
    purchaseNo: 'PO-2024-12-005',
    receiveQty: 1500,
    currentStock: 800,
    usedQty: 700,
    price: 85,
    unit: '方',
    stockAge: 12,
    receiveTime: '2024-12-20 14:45:00',
  },
  {
    batchNo: 'B202411150004',
    skuName: '聚氨酯防水涂料',
    specs: { '类型': '聚氨酯' },
    supplierName: '东方雨虹',
    warehouseName: '宝安新安项目仓',
    purchaseNo: 'PO-2024-11-008',
    receiveQty: 600,
    currentStock: 150,
    usedQty: 450,
    price: 320,
    unit: '桶',
    receiveTime: '2024-11-15 11:30:00',
  },
  {
    batchNo: 'B202409100005',
    skuName: 'PVC排水管',
    specs: { '规格': 'DN110' },
    supplierName: '联塑',
    warehouseName: '宝安新安项目仓',
    purchaseNo: 'PO-2024-09-012',
    receiveQty: 500,
    currentStock: 0,
    usedQty: 500,
    price: 25,
    unit: '根',
    receiveTime: '2024-09-10 10:00:00',
  },
])

pagination.total = batchList.value.length

function handleSearch() {
  pagination.current = 1
}
</script>

<style scoped lang="less">
.receive-batch {
  padding: 16px;

  .page-header {
    margin-bottom: 16px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .page-desc {
      font-size: 13px;
      color: var(--color-text-3);
      margin: 0;
    }
  }

  .sku-info {
    .sku-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .spec-tags {
      :deep(.arco-tag) {
        margin: 2px;
      }
    }
  }
}
</style>
