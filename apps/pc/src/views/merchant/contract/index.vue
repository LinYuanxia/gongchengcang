<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索合同编号"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.tenantId" placeholder="所属商户" style="width: 180px" allow-clear show-search>
            <a-option v-for="item in merchantOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.contractType" placeholder="合同类型" style="width: 140px" allow-clear>
            <a-option v-for="item in CONTRACT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="合同状态" style="width: 120px" allow-clear>
            <a-option v-for="item in CONTRACT_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            添加合同
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="contractId"
      >
        <template #columns>
          <a-table-column title="合同编号" data-index="contractNo" :width="150" />
          <a-table-column title="所属商户" :width="180">
            <template #cell="{ record }">
              {{ getMerchantName(record.tenantId) }}
            </template>
          </a-table-column>
          <a-table-column title="合同类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="CONTRACT_TYPE_MAP[record.contractType]?.color">
                {{ CONTRACT_TYPE_MAP[record.contractType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="签署日期" data-index="signDate" :width="120" />
          <a-table-column title="生效日期" data-index="contractStartDate" :width="120" />
          <a-table-column title="截止日期" :width="120">
            <template #cell="{ record }">
              {{ record.contractEndDate || '长期' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="CONTRACT_STATUS_MAP[record.status]?.color">
                {{ CONTRACT_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm v-if="record.status === 1" content="确定要作废该合同吗？" @ok="handleInvalidate(record)">
                  <a-button type="text" size="small" status="warning">作废</a-button>
                </a-popconfirm>
                <a-popconfirm content="确定要删除该合同吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <ContractDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :contract-id="currentContractId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    title: '1. 项目背景',
    content: `
**业务痛点：**
- 商户入驻缺乏法律契约保障
- 合作条款口头约定易产生纠纷
- 分账费率无书面依据导致争议
- 合同到期无自动预警机制

**解决目标：**
- 建立标准化电子合同管理体系
- 实现商户合作全生命周期可追溯
- 为分账结算提供法律依据
- 合同到期自动提醒续签

**模块定位：**
- 商户入驻的法律生效节点
- 分账费率的配置来源
- 平台与商户的合作凭证
- 风控审核的重要依据
    `
  },
  {
    title: '2. 用户对象',
    content: `
| 用户角色 | 特征 | 核心目标 | 使用频率 |
|---------|------|---------|---------|
| 平台法务 | 专业法律背景 | 合同合规审核 | 每日 5-10 次 |
| 运营专员 | 负责商户对接 | 合同签订跟进 | 每日 10-20 次 |
| 财务人员 | 结算分账依据 | 费率配置核对 | 每日 2-5 次 |
| 商户管理员 | 合同乙方主体 | 查看合同条款 | 每周 1-2 次 |
| 风控审核 | 风险控制 | 合同有效性校验 | 每日 3-8 次 |
    `
  },
  {
    title: '3. 权限体系',
    content: `
**功能权限矩阵：**

| 功能点 | 法务 | 运营 | 财务 | 商户 | 风控 | 只读 |
|--------|------|------|------|------|------|------|
| 查看合同列表 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 新增合同 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 编辑合同 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 查看合同详情 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 作废合同 | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 删除合同 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 导出合同 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

**数据权限：**
- 商户：仅能查看自己商户的合同
- 平台角色：可查看全量合同
    `
  },
  {
    title: '4. 核心业务场景',
    content: `
| 场景名称 | 触发条件 | 参与者 | 结果目标 |
|---------|---------|--------|---------|
| 商户入驻签合同 | 商户审核通过 | 运营 + 商户 | 合同生效，分账费率配置完成 |
| 合同到期续签 | 合同到期前 30 天预警 | 运营 + 法务 | 新合同替换旧合同 |
| 费率调整重签 | 分账费率变更 | 法务 + 财务 | 新费率下月 1 日生效 |
| 合同作废 | 商户终止合作 | 风控 + 法务 | 合同终止，结算到当日 |
| 合同审计追溯 | 纠纷调解时 | 所有角色 | 提供法律效力的合作凭证 |
    `
  },
  {
    title: '5. 业务逻辑图',
    content: `
\`\`\`mermaid
graph TD
    A[商户审核通过] --> B[创建合同草稿]
    B --> C[配置分账费率]
    B --> D[配置服务条款]
    C --> E[运营审核]
    D --> E
    E --> F{审核通过?}
    F -->|是| G[双签生效]
    F -->|否| H[驳回修改]
    H --> B
    G --> I[合同生效]
    I --> J[同步费率到分账系统]
    I --> K[30天到期预警]
    K --> L[续签合同]
    L --> B
    I --> M[商户终止合作]
    M --> N[合同作废]
\`\`\`

**异常流程：**
- 合同作废 → 分账停止（当日结算）
- 费率变更 → 下月 1 日零点生效
- 合同逾期未续签 → 冻结商户分账
    `
  },
  {
    title: '6. 功能清单',
    content: `
| 模块 | 功能点 | 优先级 | 对应角色 |
|------|--------|--------|---------|
| 搜索筛选 | 合同编号关键词 | P0 | 全部 |
| | 所属商户筛选 | P0 | 平台角色 |
| | 合同类型筛选 | P1 | 全部 |
| | 合同状态筛选 | P0 | 全部 |
| 合同管理 | 新增合同 | P0 | 运营/法务 |
| | 编辑合同 | P1 | 运营/法务 |
| | 查看详情 | P0 | 全部 |
| | 作废合同 | P1 | 法务/风控 |
| | 删除合同 | P2 | 法务 |
| 导出 | 合同报表导出 | P2 | 法务/运营/财务 |
    `
  },
  {
    title: '7. 功能详细说明',
    content: `
**入口：** 商户管理 → 合同列表

**字段级定义：**

| 字段名 | 类型 | 必填 | 校验规则 | 说明 |
|--------|------|------|----------|------|
| 合同编号 | String | 系统生成 | 唯一 | CON + 年月日 + 4位序号 |
| 所属商户 | Select | ✅ 是 | 必选 | 已审核通过的商户列表 |
| 合同类型 | Select | ✅ 是 | 必选 | 入驻协议/服务协议/补充协议 |
| 签署日期 | DatePicker | ✅ 是 | 必选 | 默认当天 |
| 生效日期 | DatePicker | ✅ 是 | 必选 | >= 签署日期 |
| 截止日期 | DatePicker | ❌ 否 | 可选 | 为空表示"长期有效" |
| 分账费率 | InputNumber | ✅ 是 | 0.1%-10% | 精确到 0.01% |
| 合同附件 | Upload | ❌ 否 | PDF/Word | 扫描件或电子版 |

**交互说明：**
- 作废仅针对"生效中"合同，需二次确认
- 删除仅针对"草稿"状态合同
- 状态变更实时同步分账系统（调用接口）
    `
  },
  {
    title: '8. Tag 色彩规范',
    content: `
**合同类型 Tag：**

| 类型 | 颜色 |
|------|------|
| 入驻协议 | blue |
| 服务协议 | green |
| 补充协议 | gold |

**合同状态 Tag：**

| 状态 | 颜色 | 说明 |
|------|------|------|
| 草稿 | gray | 未提交审核 |
| 审核中 | gold | 待法务审核 |
| 已生效 | green | 正常执行中 |
| 已作废 | red | 提前终止 |
| 已过期 | orange | 未续签 |
    `
  },
  {
    title: '9. 非功能性要求',
    content: `
**性能要求：**
- 列表加载时间 < 1 秒
- 合同搜索响应 < 500ms
- 支持 10000+ 合同数据查询

**安全要求：**
- 合同附件敏感信息打码（身份证、银行账号）
- 所有操作记录审计日志（操作人/时间/IP）
- 合同删除软删除，数据库永久保留

**埋点要求：**
- 合同新增：操作人、商户ID、合同类型
- 合同作废：操作人、作废原因
- 费率变更：旧费率、新费率、生效时间
- 导出报表：操作人、导出时间、数据范围
    `
  }
]
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE_MAP,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_STATUS_MAP,
} from '@gongchengcang/constants'
import { getContractList, deleteContract, invalidateContract, getMerchantList } from '@gongchengcang/api'
import type { Contract, Merchant } from '@gongchengcang/types'
import ContractDrawer from './components/ContractDrawer.vue'

const loading = ref(false)
const tableData = ref<Contract[]>([])
const merchantOptions = ref<{ label: string; value: string }[]>([])
const merchantMap = ref<Map<string, string>>(new Map())

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  tenantId: undefined as string | undefined,
  contractType: undefined as string | undefined,
  status: undefined as number | undefined,
})

const drawerVisible = ref(false)
const drawerMode = ref<'add' | 'edit' | 'view'>('add')
const currentContractId = ref('')

onMounted(async () => {
  await loadMerchants()
  loadData()
})

async function loadMerchants() {
  try {
    const res = await getMerchantList({ page: 1, pageSize: 1000 })
    merchantOptions.value = res.list.map((item: Merchant) => ({
      label: item.merchantName,
      value: item.tenantId,
    }))
    merchantMap.value = new Map(res.list.map((item: Merchant) => [item.tenantId, item.merchantName]))
  } catch (error) {
    console.error('load merchants error', error)
  }
}

function getMerchantName(tenantId: string) {
  return merchantMap.value.get(tenantId) || tenantId
}

async function loadData() {
  loading.value = true
  try {
    const res = await getContractList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleAdd() {
  drawerMode.value = 'add'
  currentContractId.value = ''
  drawerVisible.value = true
}

function handleView(record: Contract) {
  drawerMode.value = 'view'
  currentContractId.value = record.contractId
  drawerVisible.value = true
}

function handleEdit(record: Contract) {
  drawerMode.value = 'edit'
  currentContractId.value = record.contractId
  drawerVisible.value = true
}

async function handleDelete(record: Contract) {
  try {
    await deleteContract(record.contractId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

async function handleInvalidate(record: Contract) {
  try {
    await invalidateContract(record.contractId)
    Message.success('合同已作废')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  }
}

function handleFormSuccess() {
  loadData()
}
</script>
