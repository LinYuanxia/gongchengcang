<template>
  <div class="warehouse-dashboard">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="今日销售额" :value="125680" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="待处理订单" :value="12" suffix="单" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="库存预警" :value="5" suffix="种" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="账户余额" :value="358900" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="mt-16">
      <a-col :span="12">
        <a-card title="待办事项">
          <a-list :bordered="false">
            <a-list-item v-for="item in todoList" :key="item.id">
              <a-list-item-meta :title="item.title" :description="item.desc" />
              <template #actions>
                <a-link @click="handleTodo(item)">处理</a-link>
              </template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="快捷入口">
          <a-row :gutter="16">
            <a-col :span="6" v-for="entry in quickEntries" :key="entry.name">
              <div class="quick-entry" @click="router.push(entry.path)">
                <div class="entry-icon">
                  <component :is="entry.icon" :size="24" />
                </div>
                <div class="entry-name">{{ entry.name }}</div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="最近订单" class="mt-16">
      <a-table :data="recentOrders" :pagination="false">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="180" />
          <a-table-column title="订单类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'purchase' ? 'blue' : 'green'">
                {{ record.type === 'purchase' ? '采购' : '销售' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="供应商/客户" data-index="partnerName" :width="200" />
          <a-table-column title="金额" data-index="amount" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const todoList = ref([
  { id: 1, title: '采购订单待确认', desc: '有3笔采购订单待确认' },
  { id: 2, title: '销售订单待发货', desc: '有5笔销售订单待发货' },
  { id: 3, title: '库存预警处理', desc: '有5种商品库存不足' },
  { id: 4, title: '对账单待确认', desc: '有2份对账单待确认' },
])

const quickEntries = ref([
  { name: '商品管理', icon: 'icon-apps', path: '/warehouse/product/list' },
  { name: '采购订单', icon: 'icon-file', path: '/warehouse/order/purchase' },
  { name: '销售订单', icon: 'icon-file-text', path: '/warehouse/order/sale' },
  { name: '入库单', icon: 'icon-import', path: '/warehouse/warehouse/in' },
  { name: '出库单', icon: 'icon-export', path: '/warehouse/warehouse/out' },
  { name: '资金流水', icon: 'icon-money-collect', path: '/warehouse/finance/flow' },
  { name: '发票管理', icon: 'icon-file-text', path: '/warehouse/invoice/list' },
  { name: '仓库管理', icon: 'icon-storage', path: '/warehouse/warehouse/list' },
])

const recentOrders = ref([
  { orderNo: 'PO202401150001', type: 'purchase', partnerName: '广东建材有限公司', amount: '45,680.00', status: 'pending', statusText: '待确认', createTime: '2024-01-15 10:30:00' },
  { orderNo: 'SO202401150001', type: 'sale', partnerName: '深圳建筑工程公司', amount: '52,300.00', status: 'shipping', statusText: '待发货', createTime: '2024-01-15 09:20:00' },
  { orderNo: 'PO202401140002', type: 'purchase', partnerName: '上海钢材集团', amount: '128,500.00', status: 'completed', statusText: '已完成', createTime: '2024-01-14 16:45:00' },
  { orderNo: 'SO202401140003', type: 'sale', partnerName: '广州装饰工程公司', amount: '35,200.00', status: 'completed', statusText: '已完成', createTime: '2024-01-14 14:30:00' },
])

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    shipping: 'blue',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function handleTodo(item: any) {
  console.log('处理待办:', item)
}
</script>

<style scoped lang="less">
.warehouse-dashboard {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-card {
  :deep(.arco-card-body) {
    padding: 20px;
  }
}

.quick-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-fill-2);
  }

  .entry-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-fill-2);
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .entry-name {
    font-size: 14px;
    color: var(--color-text-2);
  }
}

.price {
  color: #f53f3f;
  font-weight: 500;
}
</style>
