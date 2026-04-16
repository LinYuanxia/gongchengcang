<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎进入材料供应商平台</h1>
        <p class="welcome-subtitle">工程材料管理采供一体化平台</p>
      </div>
      <div class="welcome-illustration">
        <icon-apps :size="120" :style="{ color: 'rgb(var(--primary-6))' }" />
      </div>
    </div>

    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="供货中商品" :value="stats.activeProducts" show-group-separator>
            <template #prefix>
              <icon-apps :style="{ color: 'rgb(var(--success-6))' }" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="待处理订单" :value="stats.pendingOrders" show-group-separator>
            <template #prefix>
              <icon-file :style="{ color: 'rgb(var(--warning-6))' }" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="本月供货额" :value="stats.monthlyAmount" :precision="2" show-group-separator>
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="累计结算金额" :value="stats.totalSettled" :precision="2" show-group-separator>
            <template #prefix>¥</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="16">
        <a-card title="待处理事项" :bordered="false">
          <a-list :bordered="false">
            <a-list-item v-for="item in pendingItems" :key="item.id">
              <a-list-item-meta :title="item.title" :description="item.description">
                <template #avatar>
                  <a-avatar :style="{ backgroundColor: item.color }">
                    <component :is="item.icon" />
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-link @click="handleAction(item)">立即处理</a-link>
              </template>
            </a-list-item>
          </a-list>
          <template #extra>
            <a-link>查看全部</a-link>
          </template>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="快捷入口" :bordered="false">
          <div class="quick-links">
            <div class="quick-link-item" @click="handleNavigate('/supplier/product/list')">
              <icon-apps :size="32" />
              <span>商品管理</span>
            </div>
            <div class="quick-link-item" @click="handleNavigate('/supplier/merchant/profile')">
              <icon-user :size="32" />
              <span>主体信息</span>
            </div>
            <div class="quick-link-item" @click="handleNavigate('/supplier/merchant/contract')">
              <icon-file :size="32" />
              <span>合同列表</span>
            </div>
            <div class="quick-link-item" @click="handleNavigate('/supplier/finance/custody')">
              <icon-safe :size="32" />
              <span>托管账户</span>
            </div>
          </div>
        </a-card>

        <a-card title="平台公告" :bordered="false" class="mt-16">
          <a-list :bordered="false" size="small">
            <a-list-item v-for="notice in notices" :key="notice.id">
              <a-link>{{ notice.title }}</a-link>
              <template #extra>
                <span class="notice-time">{{ notice.time }}</span>
              </template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = reactive({
  activeProducts: 15,
  pendingOrders: 3,
  monthlyAmount: 125680.50,
  totalSettled: 892350.00,
})

const pendingItems = ref([
  {
    id: 1,
    title: '有3个新订单待确认',
    description: '请及时确认订单，避免影响供货周期',
    icon: 'icon-file',
    color: 'rgb(var(--warning-6))',
    path: '/supplier/orders',
  },
  {
    id: 2,
    title: '商品"螺纹钢HRB400-20mm"库存不足',
    description: '当前库存低于安全库存，请及时补充',
    icon: 'icon-exclamation-circle',
    color: 'rgb(var(--danger-6))',
    path: '/supplier/product/list',
  },
  {
    id: 3,
    title: '合同即将到期提醒',
    description: '与平台的供货合同将于30天后到期，请及时续签',
    icon: 'icon-clock-circle',
    color: 'rgb(var(--primary-6))',
    path: '/supplier/merchant/contract',
  },
])

const notices = ref([
  { id: 1, title: '平台春节放假通知', time: '2024-01-20' },
  { id: 2, title: '供应商考核标准更新公告', time: '2024-01-18' },
  { id: 3, title: '新商品类目上线通知', time: '2024-01-15' },
  { id: 4, title: '平台服务协议更新', time: '2024-01-10' },
])

function handleNavigate(path: string) {
  router.push(path)
}

function handleAction(item: any) {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped lang="less">
.dashboard-container {
  padding: 16px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, rgb(var(--primary-5)) 100%);
  border-radius: 8px;
  padding: 32px 40px;
  margin-bottom: 16px;
  color: #fff;
  
  .welcome-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  .welcome-subtitle {
    font-size: 14px;
    margin: 0;
    opacity: 0.9;
  }
  
  .welcome-illustration {
    opacity: 0.3;
  }
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100%;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  .quick-link-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--color-fill-2);
    }
    
    span {
      margin-top: 8px;
      font-size: 13px;
      color: var(--color-text-2);
    }
  }
}

.notice-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.mt-16 {
  margin-top: 16px;
}
</style>
