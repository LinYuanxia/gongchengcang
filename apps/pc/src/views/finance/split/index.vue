<template>
  <div class="split-list page-container">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-statistic title="今日分账金额" :value="15680" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="本月分账金额" :value="358500" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="历史分账金额" :value="1256800" :precision="2">
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="分账总笔数" :value="156">
            <template #suffix>笔</template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-form :model="searchForm" layout="inline" class="search-form mt-16">
        <a-form-item label="分账单号">
          <a-input v-model="searchForm.splitNo" placeholder="请输入分账单号" allow-clear style="width: 180px" />
        </a-form-item>
        <a-form-item label="商户名称">
          <a-select v-model="searchForm.merchantId" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
            <a-option value="s1">华润建材供应商</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分账时间">
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="splitList" :pagination="pagination" class="mt-16" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="分账单号" data-index="splitNo" :width="180" />
          <a-table-column title="应收编号" data-index="receivableNo" :width="160">
            <template #cell="{ record }">
              <a-link class="receivable-link" @click="handleViewReceivable(record)">{{ record.receivableNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" data-index="orderNo" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewOrder(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="交易金额" :width="120" align="right">
            <template #cell="{ record }">
              <span>¥{{ record.transactionAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.splitAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分账比例" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.splitRate }}%
            </template>
          </a-table-column>
          <a-table-column title="商户名称" data-index="merchantName" :width="150" />
          <a-table-column title="商户类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.merchantType === 'warehouse' ? 'blue' : 'green'">
                {{ record.merchantType === 'warehouse' ? '工程仓' : '供应商' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分账时间" data-index="splitTime" :width="180" />
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" title="分账详情" :width="800" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="分账单号">{{ currentSplit?.splitNo }}</a-descriptions-item>
        <a-descriptions-item label="关联应收编号">
          <a-link class="receivable-link" @click="handleViewReceivable(currentSplit)">{{ currentSplit?.receivableNo }}</a-link>
        </a-descriptions-item>
        <a-descriptions-item label="关联订单">{{ currentSplit?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="交易金额">¥{{ currentSplit?.transactionAmount }}</a-descriptions-item>
        <a-descriptions-item label="分账金额">
          <span class="highlight">¥{{ currentSplit?.splitAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="分账比例">{{ currentSplit?.splitRate }}%</a-descriptions-item>
        <a-descriptions-item label="商户名称">{{ currentSplit?.merchantName }}</a-descriptions-item>
        <a-descriptions-item label="商户类型">
          <a-tag :color="currentSplit?.merchantType === 'warehouse' ? 'blue' : 'green'">
            {{ currentSplit?.merchantType === 'warehouse' ? '工程仓' : '供应商' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分账时间" :span="2">{{ currentSplit?.splitTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>商品分账明细</a-divider>

      <a-table :data="currentSplit?.products || []" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="商品名称" data-index="name" :width="200" />
          <a-table-column title="商品金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.amount?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="分账比例" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.rate }}%
            </template>
          </a-table-column>
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ ((record.amount || 0) * record.rate / 100).toLocaleString() }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>分账资金流向</a-divider>

      <a-table :data="splitDetail" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="收款方" data-index="receiverName" :width="150" />
          <a-table-column title="收款方类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.receiverType === 'platform' ? 'purple' : 'arcoblue'">
                {{ record.receiverType === 'platform' ? '平台' : '商户' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分账比例" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.rate }}%
            </template>
          </a-table-column>
          <a-table-column title="分账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const prdItems = [
  {
    title: '1. 数据看板模块',
    content: `
| 指标 | 说明 | 更新频率 |
|------|------|---------|
| 今日分账金额 | 当日成功的分账成功 | 实时 |
| 本月分账金额 | 当月累计分账 | 实时 |
| 历史分账金额 | 历史累计总额 | 每日统计 |
| 分账总笔数 | 分账单总记录数 | 实时 |

说明：所有金额精确到分，默认显示 2 位小数。
    `
  },
  {
    title: '2. 搜索筛选模块',
    content: `
| 筛选条件 | 组件类型 | 宽度 | 说明 |
|---------|---------|------|------|
| 分账单号 | Input输入框 | 180px | 精确匹配 |
| 商户名称 | Select下拉框 | 150px | 工程仓/供应商混合列表 |
| 分账时间 | RangePicker | 260px | 分账成功时间范围 |
    `
  },
  {
    title: '3. 分账规则说明',
    content: `
| 商户类型 | 分账费率 | 结算周期 |
|---------|---------|---------|
| 平台自营 | 固定费率 2% | T+7 自动分账 |
| 工程仓 | 固定费率 1.5% | T+7 自动分账 |
| 供应商 | 固定费率 2.5% | T+7 自动分账 |

分账触发条件：
- 订单状态 = 已完成
- 超过 7 天售后期
- 无售后/售后已关闭
    `
  },
  {
    title: '4. 表格列定义',
    content: `
| 列名 | 宽度 | 特殊处理 |
|------|------|---------|
| 分账单号 | 180px | 蓝色链接，点击查看详情 |
| 应收编号 | 160px | - |
| 关联订单号 | 180px | 点击跳转订单详情 |
| 交易金额 | 120px | right 右对齐 |
| 分账费率 | 80px | center |
| 分账金额 | 120px | right、蓝色加粗 |
| 分账商户 | 150px | Tag 标记类型：平台/工程仓/供应商 |
| 商品数量 | 100px | center、悬浮弹窗展示分账明细 |
| 分账时间 | 180px | - |
| 操作 | 100px | 查看详情按钮 |
    `
  },
  {
    title: '5. 财务权限矩阵',
    content: `
| 功能点 | 财务主管 | 财务会计 | 运营人员 | 只读用户 |
|--------|---------|---------|---------|---------|
| 查看分账明细 | ✅ | ✅ | ✅ | ✅ |
| 导出分账报表 | ✅ | ✅ | ✅ | ❌ |
| 调整分账费率 | ✅ | ❌ | ❌ | ❌ |
| 手动触发分账 | ✅ | ❌ | ❌ | ❌ |
| 查看分账日志 | ✅ | ✅ | ❌ | ❌ |
    `
  }
]

const searchForm = ref({
  splitNo: '',
  merchantId: '',
  dateRange: [],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

interface SplitRecord {
  id: string
  splitNo: string
  receivableNo: string
  orderNo: string
  transactionAmount: string
  splitAmount: string
  splitRate: number
  merchantName: string
  merchantType: string
  productCount: number
  products: { name: string; amount: number; rate: number }[]
  splitTime: string
}

const allSplitList = ref<SplitRecord[]>([
  { id: '1', splitNo: 'SP202401150001', receivableNo: 'YS202401150001', orderNo: 'SO202401150001', transactionAmount: '125,800.00', splitAmount: '6,290.00', splitRate: 5, merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', productCount: 3, products: [{ name: '钢筋 HRB400', amount: 50000, rate: 5 }, { name: '水泥 P.O 42.5', amount: 40800, rate: 5 }, { name: '沙子', amount: 35000, rate: 5 }], splitTime: '2024-01-15 16:30:00' },
  { id: '2', splitNo: 'SP202401150002', receivableNo: 'YS202401150002', orderNo: 'SO202401140001', transactionAmount: '89,500.00', splitAmount: '4,475.00', splitRate: 5, merchantName: '广州天河工程仓', merchantType: 'warehouse', productCount: 2, products: [{ name: '模板', amount: 49500, rate: 5 }, { name: '木方', amount: 40000, rate: 5 }], splitTime: '2024-01-15 14:20:00' },
  { id: '3', splitNo: 'SP202401140001', receivableNo: 'YS202401140001', orderNo: 'SO202401130001', transactionAmount: '52,300.00', splitAmount: '2,615.00', splitRate: 5, merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', productCount: 4, products: [{ name: '防水涂料', amount: 12300, rate: 5 }, { name: '防水卷材', amount: 20000, rate: 5 }, { name: '密封胶', amount: 10000, rate: 5 }, { name: '保温材料', amount: 10000, rate: 5 }], splitTime: '2024-01-14 10:00:00' },
  { id: '4', splitNo: 'SP202401130001', receivableNo: 'YS202401130001', orderNo: 'SO202401120001', transactionAmount: '168,000.00', splitAmount: '8,400.00', splitRate: 5, merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', productCount: 5, products: [{ name: '电线电缆 BV', amount: 50000, rate: 5 }, { name: '开关插座', amount: 18000, rate: 5 }, { name: '配电箱', amount: 30000, rate: 5 }, { name: '灯具', amount: 40000, rate: 5 }, { name: '弱电设备', amount: 30000, rate: 5 }], splitTime: '2024-01-13 15:30:00' },
  { id: '5', splitNo: 'SP202401120001', receivableNo: 'YS202401120001', orderNo: 'SO202401110001', transactionAmount: '91,200.00', splitAmount: '4,560.00', splitRate: 5, merchantName: '广州天河工程仓', merchantType: 'warehouse', productCount: 2, products: [{ name: 'PPR水管', amount: 51200, rate: 5 }, { name: 'PVC排水管', amount: 40000, rate: 5 }], splitTime: '2024-01-12 09:00:00' },
])

const splitList = ref<SplitRecord[]>([...allSplitList.value])

const detailVisible = ref(false)
const currentSplit = ref<SplitRecord | null>(null)

const splitDetail = ref([
  { receiverName: '平台服务费', receiverType: 'platform', rate: 5, amount: '6,290.00' },
  { receiverName: '深圳湾科技园项目仓', receiverType: 'merchant', rate: 95, amount: '119,510.00' },
])

function handleSearch() {
  let filtered = [...allSplitList.value]
  
  if (searchForm.value.splitNo) {
    filtered = filtered.filter(item => 
      item.splitNo.includes(searchForm.value.splitNo) ||
      item.orderNo.includes(searchForm.value.splitNo)
    )
  }
  
  if (searchForm.value.merchantId) {
    filtered = filtered.filter(item => 
      item.merchantName.includes(searchForm.value.merchantId)
    )
  }
  
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.value.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.splitTime.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  splitList.value = filtered
  pagination.value.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.value = {
    splitNo: '',
    merchantId: '',
    dateRange: [],
  }
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleViewOrder(record: SplitRecord) {
  Message.info(`查看订单: ${record.orderNo}`)
}

function handleViewDetail(record: SplitRecord) {
  currentSplit.value = record
  detailVisible.value = true
}

function handleViewReceivable(record: SplitRecord | null) {
  if (!record) return
  Message.info(`跳转到应收记录: ${record.receivableNo}`)
}

function handleExport() {
  if (splitList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${splitList.value.length} 条分账记录`)
}
</script>

<style scoped lang="less">
.split-list {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.stat-row {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.amount {
  font-weight: 600;
  color: #165dff;
}

.highlight {
  color: #165dff;
  font-weight: 600;
  font-size: 16px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.product-count {
  color: var(--color-text-2);
  font-size: 13px;
}

.receivable-link {
  color: #165dff;
  cursor: pointer;
}
</style>
