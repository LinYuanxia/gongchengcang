<template>
  <div class="deduction-detail-page">
    <a-card :bordered="false">
      <template #extra>
        <a-button @click="handleBack">返回列表</a-button>
      </template>

      <a-descriptions :column="3" bordered class="detail-header">
        <a-descriptions-item label="应扣记录ID" :span="1">{{ deductionInfo.id }}</a-descriptions-item>
        <a-descriptions-item label="应扣编号" :span="1">
          <a-link>{{ deductionInfo.deductionNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="应扣状态" :span="1">
          <a-tag :color="deductionInfo.status === 'deducted' ? 'green' : 'orange'">
            {{ deductionInfo.status === 'deducted' ? '已分账' : '待分账' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单编号" :span="1">
          <a-link>{{ deductionInfo.orderNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="支付编号" :span="1">
          <a-link>{{ deductionInfo.paymentNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="1">{{ deductionInfo.createTime }}</a-descriptions-item>
        <a-descriptions-item label="订单金额" :span="1">
          <span class="text-xl">¥{{ deductionInfo.orderAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="交易撮合费" :span="1">
          <span class="text-danger">¥{{ deductionInfo.matchFee?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="工程仓入账" :span="1">
          ¥{{ deductionInfo.warehouseAmount?.toLocaleString() }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3 style="margin-bottom: 16px">应扣明细（商品视角）</h3>

      <a-table
        :data="detailList"
        :pagination="false"
        row-key="detailId"
      >
        <template #columns>
          <a-table-column title="应扣明细ID" data-index="detailId" :width="160" />
          <a-table-column title="商品信息" :width="300">
            <template #cell="{ record }">
              <div class="product-info">
                <div class="product-name">{{ record.productName }}</div>
                <div class="product-spec">{{ record.productSpec }}</div>
                <div class="product-meta">
                  <span>数量: {{ record.quantity }}</span>
                  <span>单价: ¥{{ record.unitPrice }}</span>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="分账系数" :width="120" align="center">
            <template #cell="{ record }">
              {{ record.splitRatio * 100 }}%
            </template>
          </a-table-column>
          <a-table-column title="商品金额" :width="140" align="right">
            <template #cell="{ record }">
              ¥{{ record.productAmount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="应扣金额" :width="140" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-xl">¥{{ record.deductAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <div class="summary-section">
        <a-row :gutter="16">
          <a-col :span="6">
            <div class="summary-item">
              <span class="label">商品总数</span>
              <span class="value">{{ totalQuantity }} 件</span>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="summary-item">
              <span class="label">明细条数</span>
              <span class="value">{{ detailList.length }} 条</span>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="summary-item">
              <span class="label">商品总金额</span>
              <span class="value">¥{{ totalProductAmount?.toLocaleString() }}</span>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="summary-item total">
              <span class="label">合计应扣金额</span>
              <span class="value">¥{{ totalDeductAmount?.toLocaleString() }}</span>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const deductionInfo = ref({
  id: '',
  deductionNo: '',
  orderNo: '',
  paymentNo: '',
  orderAmount: 0,
  matchFee: 0,
  warehouseAmount: 0,
  status: '',
  createTime: '',
})

const detailList = ref([
  {
    detailId: 'MX001',
    productName: '普通硅酸盐水泥 P.O 42.5',
    productSpec: '袋装 50kg/袋',
    quantity: 200,
    unitPrice: 320,
    splitRatio: 0.01,
    productAmount: 64000,
    deductAmount: 640,
  },
  {
    detailId: 'MX002',
    productName: '中砂',
    productSpec: '粒径0.35-0.5mm',
    quantity: 50,
    unitPrice: 180,
    splitRatio: 0.01,
    productAmount: 9000,
    deductAmount: 90,
  },
  {
    detailId: 'MX003',
    productName: '碎石',
    productSpec: '粒径10-20mm',
    quantity: 30,
    unitPrice: 150,
    splitRatio: 0.01,
    productAmount: 4500,
    deductAmount: 45,
  },
  {
    detailId: 'MX004',
    productName: '螺纹钢 HRB400',
    productSpec: 'Φ16mm',
    quantity: 5,
    unitPrice: 4800,
    splitRatio: 0.01,
    productAmount: 24000,
    deductAmount: 240,
  },
  {
    detailId: 'MX005',
    productName: '混凝土外加剂',
    productSpec: '减水剂',
    quantity: 10,
    unitPrice: 860,
    splitRatio: 0.01,
    productAmount: 8600,
    deductAmount: 86,
  },
])

const totalQuantity = computed(() => 
  detailList.value.reduce((sum, item) => sum + item.quantity, 0)
)

const totalProductAmount = computed(() => 
  detailList.value.reduce((sum, item) => sum + item.productAmount, 0)
)

const totalDeductAmount = computed(() => 
  detailList.value.reduce((sum, item) => sum + item.deductAmount, 0)
)

onMounted(() => {
  const recordId = route.params.id || '1'
  
  const mockRecords = [
    {
      id: '1',
      deductionNo: 'YK202401220001',
      orderNo: 'SO202401220001',
      paymentNo: 'PAY202401220001',
      orderAmount: 128600,
      matchFee: 1286,
      warehouseAmount: 127314,
      status: 'deducted',
      createTime: '2024-01-22 16:30:00',
    },
    {
      id: '2',
      deductionNo: 'YK202401210001',
      orderNo: 'SO202401210002',
      paymentNo: 'PAY202401210001',
      orderAmount: 86500,
      matchFee: 865,
      warehouseAmount: 85635,
      status: 'deducted',
      createTime: '2024-01-21 14:20:00',
    },
    {
      id: '3',
      deductionNo: 'YK202401200001',
      orderNo: 'SO202401200003',
      paymentNo: 'PAY202401200001',
      orderAmount: 50000,
      matchFee: 500,
      warehouseAmount: 49500,
      status: 'pending',
      createTime: '2024-01-20 10:00:00',
    },
  ]

  deductionInfo.value = mockRecords.find(r => r.id === recordId) || mockRecords[0]
})

function handleBack() {
  router.push({ name: 'WarehouseDeduction' })
}
</script>

<style lang="less" scoped>
.deduction-detail-page {
  padding: 16px;
}

.detail-header {
  margin-bottom: 16px;
}

.product-info {
  .product-name {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .product-spec {
    font-size: 13px;
    color: rgb(var(--gray-5));
    margin-bottom: 4px;
  }
  
  .product-meta {
    font-size: 12px;
    color: rgb(var(--gray-4));
    
    span {
      margin-right: 12px;
    }
  }
}

.summary-section {
  padding: 16px;
  background: rgba(var(--gray-1), 0.5);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .label {
    font-size: 14px;
    color: rgb(var(--gray-6));
  }
  
  .value {
    font-size: 16px;
    font-weight: 600;
    color: rgb(var(--gray-9));
  }
  
  &.total {
    .label {
      color: rgb(var(--gray-9));
      font-weight: 600;
    }
    
    .value {
      color: rgb(var(--danger-6));
      font-size: 18px;
    }
  }
}

.text-xl {
  font-size: 18px;
  font-weight: 600;
}

.text-danger {
  color: rgb(var(--danger-6));
}
</style>