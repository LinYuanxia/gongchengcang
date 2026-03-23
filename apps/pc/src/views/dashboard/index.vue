<template>
  <div class="dashboard-page">
    <a-row :gutter="16">
      <a-col :span="6" v-for="item in statistics" :key="item.title">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-icon" :style="{ background: item.color }">
            <component :is="item.icon" :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-title">{{ item.title }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="mt-16">
      <a-col :span="16">
        <a-card title="订单趋势" :bordered="false">
          <div class="chart-placeholder">
            <icon-line-chart :size="48" />
            <p>订单趋势图表</p>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="快捷入口" :bordered="false">
          <a-row :gutter="[16, 16]">
            <a-col :span="12" v-for="item in quickLinks" :key="item.title">
              <a-card class="quick-link-card" hoverable @click="handleQuickLink(item)">
                <component :is="item.icon" :size="32" :style="{ color: item.color }" />
                <div class="quick-link-title">{{ item.title }}</div>
              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="mt-16">
      <a-col :span="12">
        <a-card title="待处理事项" :bordered="false">
          <a-list :bordered="false">
            <a-list-item v-for="item in todoList" :key="item.id">
              <a-list-item-meta :title="item.title" :description="item.description" />
              <template #actions>
                <a-tag :color="item.status === 'urgent' ? 'red' : 'orange'">
                  {{ item.status === 'urgent' ? '紧急' : '待处理' }}
                </a-tag>
              </template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="最近订单" :bordered="false">
          <a-table :data="recentOrders" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="订单号" data-index="orderNo" />
              <a-table-column title="类型" data-index="type">
                <template #cell="{ record }">
                  <a-tag>{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="金额" data-index="amount">
                <template #cell="{ record }">
                  ¥{{ record.amount }}
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status">
                <template #cell="{ record }">
                  <a-tag :color="record.statusColor">{{ record.status }}</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const statistics = reactive([
  { title: '今日订单', value: '128', icon: 'icon-file', color: '#165dff' },
  { title: '今日销售额', value: '¥58,920', icon: 'icon-money-collect', color: '#00b42a' },
  { title: '待处理', value: '23', icon: 'icon-clock-circle', color: '#ff7d00' },
  { title: '库存预警', value: '5', icon: 'icon-exclamation-circle', color: '#f53f3f' },
])

const quickLinks = reactive([
  { title: '创建订单', icon: 'icon-plus-circle', color: '#165dff', path: '/order/list' },
  { title: '采购计划', icon: 'icon-calendar', color: '#00b42a', path: '/plan/list' },
  { title: '库存管理', icon: 'icon-storage', color: '#ff7d00', path: '/stock/product' },
  { title: '商品市场', icon: 'icon-tags', color: '#722ed1', path: '/market/list' },
])

const todoList = reactive([
  { id: 1, title: '采购订单待确认', description: 'PO2024010001 等待确认', status: 'urgent' },
  { id: 2, title: '销售订单待发货', description: 'SO2024010012 等待发货', status: 'pending' },
  { id: 3, title: '商户入驻审核', description: '新增商户待审核', status: 'pending' },
  { id: 4, title: '库存盘点提醒', description: '本月库存盘点未完成', status: 'pending' },
])

const recentOrders = ref([
  { orderNo: 'PO2024010001', type: '采购', amount: '12,500.00', status: '待确认', statusColor: 'orange' },
  { orderNo: 'SO2024010012', type: '销售', amount: '8,800.00', status: '待发货', statusColor: 'blue' },
  { orderNo: 'SO2024010011', type: '销售', amount: '15,200.00', status: '已完成', statusColor: 'green' },
  { orderNo: 'PO2024010002', type: '采购', amount: '6,300.00', status: '已支付', statusColor: 'cyan' },
])

function handleQuickLink(item: any) {
  router.push(item.path)
}
</script>

<style scoped lang="less">
.dashboard-page {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  
  :deep(.arco-card-body) {
    display: flex;
    align-items: center;
    width: 100%;
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.stat-title {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  
  p {
    margin-top: 16px;
  }
}

.quick-link-card {
  text-align: center;
  cursor: pointer;
  
  :deep(.arco-card-body) {
    padding: 24px 16px;
  }
}

.quick-link-title {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-color);
}

.mt-16 {
  margin-top: 16px;
}
</style>
