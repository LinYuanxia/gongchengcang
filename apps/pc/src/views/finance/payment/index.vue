<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索支付单号/订单号/工程仓"
            style="width: 260px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.payType" placeholder="支付类型" style="width: 160px" allow-clear>
            <a-option value="warehouse_construction">工程仓→施工方</a-option>
            <a-option value="construction_warehouse">施工方→工程仓</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
          <a-button @click="handleExport">导出</a-button>
        </a-space>
      </div>

      <a-table
        :data="paymentList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="支付单号" data-index="paymentNo" :width="180" />
          <a-table-column title="关联订单" :width="180">
            <template #cell="{ record }">
              <a-link v-if="record.orderNo" @click="handleViewOrder(record)">
                {{ record.orderNo }}
              </a-link>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="支付类型" :width="140">
            <template #cell="{ record }">
              <a-tag :color="getPayTypeColor(record.payType)">
                {{ getPayTypeText(record.payType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="付款方" data-index="payerName" :width="160" />
          <a-table-column title="收款方" data-index="payeeName" :width="160" />
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-lg">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" :width="100">
            <template #cell="{ record }">
              线下支付
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="payTime" :width="160" />
          <a-table-column title="确认时间" data-index="confirmTime" :width="160" />
          <a-table-column title="操作人" data-index="operatorName" :width="100" />
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-link v-if="record.voucherUrl" @click="handleViewVoucher(record)">
                查看凭证
              </a-link>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="voucherModalVisible"
      title="转账凭证"
      :width="600"
      :footer="false"
    >
      <img :src="currentVoucherUrl" class="voucher-image" alt="转账凭证" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    reqId: 1,
    moduleName: '搜索筛选模块',
    content: `
【1】搜索筛选模块 - 完整产品标准

---

### 一、筛选器布局

| 控件 | 宽度 | 类型 | 说明 |
|------|------|------|------|
| 关键词搜索框 | 260px | InputSearch | 支付单号 / 订单号 / 工程仓 三字段模糊搜索 |
| 支付类型 | 160px | Select | 下拉单选，支持清空 |
| 支付状态 | 140px | Select | 下拉单选，支持清空 |
| 时间范围 | 260px | RangePicker | 日期范围选择，支持清空 |

---

### 二、支付类型选项

| 值 | 标签 | Tag颜色 | 业务流向 |
|------|------|---------|---------|
| warehouse_construction | [[工程仓→施工方]](success) | 绿色 | 工程仓付款给施工方 |
| construction_warehouse | [[施工方→工程仓]](primary) | 蓝色 | 施工方付款给工程仓 |

!! 资金流向与货物流向相反方向

---

### 三、支付状态选项

| 值 | 标签 | Tag颜色 | 说明 |
|------|------|---------|------|
| pending | [[待审核]](warning) | 橙色 | 待财务确认 |
| confirmed | [[已确认]](success) | 绿色 | 支付完成，已入账 |
| rejected | [[已驳回]](danger) | 红色 | 凭证无效或信息有误 |

---

### 四、右侧操作按钮

| 按钮 | 说明 |
|------|------|
| 重置 | 清空所有筛选条件，恢复默认 |
| 导出 | 导出当前筛选结果 Excel |
`
  },
  {
    reqId: 2,
    moduleName: '表格展示规范',
    content: `
【2】表格展示规范 - 完整产品标准

---

### 一、列定义（从左到右）

| 列名 | 宽度 | 对齐 | 特殊渲染 |
|------|------|------|----------|
| 支付单号 | 180px | 左 | 蓝色链接，点击打开详情 |
| 关联订单 | 180px | 左 | 蓝色链接，无关联显示横杠 |
| 支付类型 | 140px | 左 | Tag 组件，色彩区分 |
| 付款方 | 160px | 左 | 纯文本 |
| 收款方 | 160px | 左 | 纯文本 |
| **支付金额** | 120px | 右 | **红色粗体 + ¥ + 千分位格式化** |
| 支付方式 | 100px | 左 | 纯文本 |
| 支付状态 | 100px | 左 | Tag 组件，色彩区分 |
| 支付时间 | 160px | 左 | 标准日期时间 |
| 操作人 | 100px | 左 | 纯文本 |
| **操作列** | 200px | 左 | **固定在右侧！** |

---

### 二、金额渲染规范

>> 财务数据必须醒目展示：
- 字体颜色：红色 #f53f3f
- 字号：比普通文字大 2px（text-lg）
- 前缀：¥ 符号
- 格式化：toLocaleString() 千分位

---

### 三、空值处理规范

| 场景 | 渲染方式 |
|------|---------|
| 无关联订单 | 显示 - 灰色横杠 |
| 无转账凭证 | 不显示「凭证」按钮 |
`
  },
  {
    reqId: 3,
    moduleName: '支付状态机',
    content: `
【3】支付状态机 - 完整产品标准

---

### 一、状态流转图

>>>flow
登记支付 -> 待审核状态
-> 财务确认 -> 已确认状态 -> 入账 -> 不可修改
-> 财务驳回 -> 已驳回状态 -> 填写驳回原因
-> 已驳回 -> 可重新编辑提交 -> 回到待审核
<<<

---

### 二、状态操作权限矩阵

| 状态 | 可执行操作 | 角色 |
|------|-----------|------|
| 待审核 | 详情 / 确认 / 查看凭证 | 财务人员 |
| 已确认 | 详情 / 查看凭证 | 所有人员 |
| 已驳回 | 详情 / 查看凭证 / 编辑重提 | 创建人 / 财务 |

---

### 三、确认支付交互

>> 点击「确认」弹出二次确认框：

| 属性 | 值 |
|------|-----|
| 标题 | 确认支付 |
| 内容 | 确认该笔支付已实际到账吗？确认后不可修改 |
| 提示 | 红色高亮警告：确认后状态不可逆 |
| 成功后 | 刷新列表 + Message 提示 |
`
  },
  {
    reqId: 4,
    moduleName: '登记支付表单（字段级规范）',
    content: `
【4】登记支付表单 - 完整字段级产品标准

---

### 一、弹窗基础规范

| 属性 | 值 |
|------|-----|
| 弹窗宽度 | 800px |
| 标题 | 登记支付记录 |
| 提交方式 | 点击确定统一校验提交 |

---

### 二、字段级定义表

| 字段名 | 组件类型 | 必填 | 限制 | 验证规则 | 占位提示 |
|--------|---------|------|------|----------|----------|
| **支付类型** | Select下拉 | ✅ 是 | - | 必选 | 请选择支付类型 |
| **关联订单** | Select下拉 | ❌ 否 | - | 可搜索 | 请选择关联订单（选填） |
| **付款方** | Select下拉 | ✅ 是 | - | 必选，可搜索 | 请选择付款方 |
| **收款方** | Select下拉 | ✅ 是 | - | 必选，可搜索 | 请选择收款方 |
| **支付金额** | InputNumber | ✅ 是 | ≥ 0 | 保留2位小数 | 请输入支付金额 |
| **支付方式** | Select下拉 | ❌ 否 | - | - | 请选择支付方式 |
| **支付时间** | DateTimePicker | ❌ 否 | - | - | 请选择支付时间 |
| **转账凭证** | Upload图片 | ❌ 否 | 最多9张 | 仅图片 | 上传银行回单截图 |
| **备注** | Textarea | ❌ 否 | 最多500字 | - | 请输入备注 |

---

### 三、支付方式选项

- 银行转账
- 微信支付
- 支付宝
- 现金

>> 建议上传转账凭证，否则后期对账困难
`
  },
  {
    reqId: 5,
    moduleName: '权限控制矩阵',
    content: `
【5】权限控制矩阵 - 完整产品标准

---

### 一、角色权限对照表

| 功能点 | 超管 | 财务 | 运营 | 只读 |
|--------|------|------|------|------|
| 查看支付列表 | ✅ | ✅ | ✅ | ✅ |
| 搜索筛选 | ✅ | ✅ | ✅ | ✅ |
| 登记支付 | ✅ | ✅ | ❌ | ❌ |
| 查看详情 | ✅ | ✅ | ✅ | ✅ |
| 查看凭证 | ✅ | ✅ | ✅ | ✅ |
| 确认支付 | ✅ | ✅ | ❌ | ❌ |
| 驳回支付 | ✅ | ✅ | ❌ | ❌ |
| 导出Excel | ✅ | ✅ | ✅ | ❌ |

---

### 二、财务数据安全原则

- 支付金额只可追加，不可修改
- 已确认的支付记录永不删除，只能红冲
- 所有操作留痕，记录操作人和操作时间
- 导出操作记录操作日志
`
  }
]

const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  payType: undefined as string | undefined,
  status: undefined as string | undefined,
  dateRange: undefined as any,
})

const paymentList = ref([
  { id: '1', paymentNo: 'PAY202401150001', orderNo: 'ORD202401150001', payType: 'warehouse_construction', payerName: '深圳宝安工程仓', payeeName: '中建三局施工队', amount: 150000, status: 'confirmed', payTime: '2024-01-15 10:30:00', confirmTime: '2024-01-15 11:00:00', operatorName: '张三', voucherUrl: 'https://picsum.photos/400/300?random=1' },
  { id: '2', paymentNo: 'PAY202401150002', orderNo: 'ORD202401150002', payType: 'construction_warehouse', payerName: '中建三局施工队', payeeName: '深圳南山工程仓', amount: 80000, status: 'confirmed', payTime: '2024-01-15 14:20:00', confirmTime: '2024-01-15 14:45:00', operatorName: '李四', voucherUrl: 'https://picsum.photos/400/300?random=2' },
  { id: '3', paymentNo: 'PAY202401150003', orderNo: '', payType: 'warehouse_construction', payerName: '广州天河工程仓', payeeName: '广东一建施工队', amount: 220000, status: 'confirmed', payTime: '2024-01-15 16:00:00', confirmTime: '2024-01-15 16:30:00', operatorName: '王五', voucherUrl: '' },
  { id: '4', paymentNo: 'PAY202401160001', orderNo: 'ORD202401160001', payType: 'construction_warehouse', payerName: '中铁二局施工队', payeeName: '东莞工程仓', amount: 45000, status: 'confirmed', payTime: '2024-01-16 09:00:00', confirmTime: '2024-01-16 09:20:00', operatorName: '赵六', voucherUrl: 'https://picsum.photos/400/300?random=3' },
])

pagination.total = paymentList.value.length

const voucherModalVisible = ref(false)
const currentVoucherUrl = ref('')

function getPayTypeColor(type: string) {
  const colors: Record<string, string> = {
    warehouse_construction: 'blue',
    construction_warehouse: 'purple',
  }
  return colors[type] || 'gray'
}

function getPayTypeText(type: string) {
  const texts: Record<string, string> = {
    warehouse_construction: '工程仓→施工方',
    construction_warehouse: '施工方→工程仓',
  }
  return texts[type] || type
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    confirmed: '已确认',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.info('搜索')
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.payType = undefined
  searchForm.status = undefined
  searchForm.dateRange = undefined
  Message.success('已重置')
}

function handleExport() {
  Message.info('导出')
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewOrder(record: any) {
  Message.info(`查看订单: ${record.orderNo}`)
}

function handleViewVoucher(record: any) {
  currentVoucherUrl.value = record.voucherUrl
  voucherModalVisible.value = true
}
</script>

<style lang="less" scoped>
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: #86909c;
}

.upload-text {
  font-size: 12px;
  margin-top: 4px;
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
}

.voucher-image {
  width: 100%;
  border-radius: 4px;
}
</style>
