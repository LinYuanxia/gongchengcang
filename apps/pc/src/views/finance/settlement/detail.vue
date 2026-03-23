<template>
  <div class="settlement-detail">
    <a-card>
      <template #title>
        <a-space>
          <a-button type="text" @click="goBack">
            <template #icon><icon-left /></template>
          </a-button>
          <span>结算详情</span>
        </a-space>
      </template>

      <a-descriptions title="基本信息" :column="2" bordered>
        <a-descriptions-item label="结算单号">JS202401150001</a-descriptions-item>
        <a-descriptions-item label="结算状态">
          <a-tag color="green">已到账</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="商户名称">深圳湾科技园项目仓</a-descriptions-item>
        <a-descriptions-item label="商户类型">
          <a-tag color="blue">工程仓</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="结算金额">
          <span class="amount">¥ 50,000.00</span>
        </a-descriptions-item>
        <a-descriptions-item label="申请时间">2024-01-15 10:00:00</a-descriptions-item>
        <a-descriptions-item label="结算银行">中国工商银行</a-descriptions-item>
        <a-descriptions-item label="银行账号">**** **** **** 8901</a-descriptions-item>
        <a-descriptions-item label="到账时间">2024-01-16 14:30:00</a-descriptions-item>
        <a-descriptions-item label="结算说明">日常结算</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions title="处理记录" :column="1" bordered>
        <a-descriptions-item>
          <a-timeline>
            <a-timeline-item label="2024-01-16 14:30:00">
              <div class="timeline-content">
                <span class="status success">已到账</span>
                <span class="desc">资金已到账，结算完成</span>
              </div>
            </a-timeline-item>
            <a-timeline-item label="2024-01-15 16:00:00">
              <div class="timeline-content">
                <span class="status processing">处理中</span>
                <span class="desc">平台审核通过，正在打款</span>
              </div>
            </a-timeline-item>
            <a-timeline-item label="2024-01-15 10:30:00">
              <div class="timeline-content">
                <span class="status approved">已通过</span>
                <span class="desc">审核通过，审核人：张三</span>
              </div>
            </a-timeline-item>
            <a-timeline-item label="2024-01-15 10:00:00">
              <div class="timeline-content">
                <span class="status created">已创建</span>
                <span class="desc">商户提交结算申请</span>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions title="关联分账记录" :column="1" bordered>
        <a-descriptions-item>
          <a-table :data="relatedSplits" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="分账单号" data-index="splitNo" :width="180" />
              <a-table-column title="关联订单" data-index="orderNo" :width="150" />
              <a-table-column title="交易金额" :width="120" align="right">
                <template #cell="{ record }">¥{{ record.transactionAmount }}</template>
              </a-table-column>
              <a-table-column title="分账金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="split-amount">¥{{ record.splitAmount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="分账时间" data-index="splitTime" :width="180" />
            </template>
          </a-table>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const relatedSplits = ref([
  { splitNo: 'SP202401150001', orderNo: 'SO202401150001', transactionAmount: '125,800.00', splitAmount: '119,510.00', splitTime: '2024-01-15 16:30:00' },
  { splitNo: 'SP202401140001', orderNo: 'SO202401140001', transactionAmount: '89,500.00', splitAmount: '85,025.00', splitTime: '2024-01-14 14:20:00' },
  { splitNo: 'SP202401130001', orderNo: 'SO202401130001', transactionAmount: '52,300.00', splitAmount: '49,685.00', splitTime: '2024-01-13 10:00:00' },
])

function goBack() {
  router.back()
}
</script>

<style scoped lang="less">
.settlement-detail {
  padding: 16px;
}

.amount {
  font-size: 18px;
  font-weight: 600;
  color: #165dff;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 12px;

  .status {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;

    &.success {
      background: #e8ffea;
      color: #00b42a;
    }

    &.processing {
      background: #e8f3ff;
      color: #165dff;
    }

    &.approved {
      background: #e8ffea;
      color: #00b42a;
    }

    &.created {
      background: #f2f3f5;
      color: #86909c;
    }
  }

  .desc {
    color: var(--color-text-2);
  }
}

.split-amount {
  font-weight: 500;
  color: #165dff;
}
</style>
