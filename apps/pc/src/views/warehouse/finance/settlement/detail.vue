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
            <a-timeline-item label="2024-01-15 15:00:00">
              <div class="timeline-content">
                <span class="status processing">处理中</span>
                <span class="desc">平台已审核通过，正在打款</span>
              </div>
            </a-timeline-item>
            <a-timeline-item label="2024-01-15 10:30:00">
              <div class="timeline-content">
                <span class="status pending">待审核</span>
                <span class="desc">提交结算申请，等待平台审核</span>
              </div>
            </a-timeline-item>
            <a-timeline-item label="2024-01-15 10:00:00">
              <div class="timeline-content">
                <span class="status created">已创建</span>
                <span class="desc">创建结算申请</span>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions title="关联交易" :column="1" bordered>
        <a-descriptions-item>
          <a-table :data="relatedTransactions" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="交易时间" data-index="time" :width="180" />
              <a-table-column title="交易流水号" data-index="flowNo" :width="180" />
              <a-table-column title="交易类型" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.type === 'income' ? 'green' : 'red'">
                    {{ record.type === 'income' ? '收入' : '支出' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="交易金额" :width="150" align="right">
                <template #cell="{ record }">
                  <span :class="record.type === 'income' ? 'income' : 'expense'">
                    {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="交易说明" data-index="description" />
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

const relatedTransactions = ref([
  { time: '2024-01-15 16:30:00', flowNo: 'FL202401150001', type: 'income', amount: '52,300.00', description: '销售订单收款 - SO202401150001' },
  { time: '2024-01-14 10:00:00', flowNo: 'FL202401140001', type: 'income', amount: '28,500.00', description: '销售订单收款 - SO202401140001' },
  { time: '2024-01-13 09:00:00', flowNo: 'FL202401130001', type: 'income', amount: '19,500.00', description: '销售订单收款 - SO202401130001' },
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

    &.pending {
      background: #fff7e8;
      color: #ff7d00;
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

.income {
  color: #00b42a;
  font-weight: 500;
}

.expense {
  color: #f53f3f;
  font-weight: 500;
}
</style>
