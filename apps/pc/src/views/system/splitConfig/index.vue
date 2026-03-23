<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索规则名称/ID"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.ruleCategory" placeholder="规则类型" style="width: 140px" allow-clear>
            <a-option v-for="item in SPLIT_RULE_CATEGORY_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option v-for="item in SPLIT_RULE_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增配置
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="ruleId"
      >
        <template #columns>
          <a-table-column title="规则ID" data-index="ruleId" :width="100" />
          <a-table-column title="规则名称" data-index="ruleName" :width="180" />
          <a-table-column title="规则类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getCategoryColor(record.ruleCategory)">
                {{ getCategoryLabel(record.ruleCategory) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="优先级" :width="80">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.priority }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="费率" :width="80">
            <template #cell="{ record }">
              <span>{{ record.rateValue }}%</span>
            </template>
          </a-table-column>
          <a-table-column title="适用对象" :width="300">
            <template #cell="{ record }">
              <template v-if="record.ruleCategory === SplitRuleCategory.ALL">
                <span>-</span>
              </template>
              <template v-else-if="record.ruleCategory === SplitRuleCategory.PRODUCT">
                <div class="multi-object">
                  <div>
                    <span class="object-label">商品范围：</span>
                    <span class="object-value">{{ getProductTypeLabel(record.productType) }}</span>
                  </div>
                  <div v-if="record.productType === SplitRuleProductType.CATEGORY">
                    <span class="object-label">分类：</span>
                    <span class="object-value">{{ record.categoryNames?.join('、') || '-' }}</span>
                  </div>
                  <div v-if="record.productType === SplitRuleProductType.SPU">
                    <span class="object-label">SPU：</span>
                    <span class="object-value">{{ record.spuNames?.join('、') || '-' }}</span>
                  </div>
                  <div v-if="record.productType === SplitRuleProductType.SKU">
                    <span class="object-label">SKU：</span>
                    <span class="object-value">{{ record.skuNames?.join('、') || '-' }}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="record.ruleCategory === SplitRuleCategory.MERCHANT">
                <div class="multi-object">
                  <div>
                    <span class="object-label">商户范围：</span>
                    <span class="object-value">{{ getMerchantTypeLabel(record.merchantType) }}</span>
                  </div>
                  <div v-if="record.merchantType === SplitRuleMerchantType.TYPE">
                    <span class="object-label">类型：</span>
                    <span class="object-value">{{ record.merchantTypeNames?.join('、') || '-' }}</span>
                  </div>
                  <div v-if="record.merchantType === SplitRuleMerchantType.SPECIFIC">
                    <span class="object-label">商户：</span>
                    <span class="object-value">{{ record.merchantNames?.join('、') || '-' }}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="record.ruleCategory === SplitRuleCategory.MERCHANT_PRODUCT">
                <div class="multi-object">
                  <div>
                    <span class="object-label">商户：</span>
                    <span class="object-value">
                      {{ record.merchantType === SplitRuleMerchantType.TYPE 
                        ? record.merchantTypeNames?.join('、') 
                        : record.merchantNames?.join('、') || '-' }}
                    </span>
                  </div>
                  <div>
                    <span class="object-label">商品：</span>
                    <span class="object-value">
                      <template v-if="record.productType === SplitRuleProductType.ALL">全部商品</template>
                      <template v-else-if="record.productType === SplitRuleProductType.CATEGORY">{{ record.categoryNames?.join('、') }}</template>
                      <template v-else-if="record.productType === SplitRuleProductType.SPU">{{ record.spuNames?.join('、') }}</template>
                      <template v-else-if="record.productType === SplitRuleProductType.SKU">{{ record.skuNames?.join('、') }}</template>
                    </span>
                  </div>
                </div>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusLabel(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="有效期" :width="160">
            <template #cell="{ record }">
              <span v-if="record.isPermanent">永久有效</span>
              <div v-else class="effective-date">
                <div>{{ record.effectiveStart?.slice(0, 10) }}</div>
                <div>至 {{ record.effectiveEnd?.slice(0, 10) }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button
                  v-if="record.status === SplitRuleStatus.DRAFT"
                  type="text"
                  size="small"
                  @click="handleSubmitAudit(record)"
                >
                  提交审核
                </a-button>
                <a-button
                  v-if="record.status === SplitRuleStatus.INACTIVE"
                  type="text"
                  size="small"
                  @click="handleEnable(record)"
                >
                  启用
                </a-button>
                <a-button
                  v-if="record.status === SplitRuleStatus.ACTIVE"
                  type="text"
                  size="small"
                  @click="handleDisable(record)"
                >
                  停用
                </a-button>
                <a-button type="text" size="small" @click="handleViewLogs(record)">日志</a-button>
                <a-popconfirm
                  v-if="record.status === SplitRuleStatus.DRAFT || record.status === SplitRuleStatus.INACTIVE"
                  content="确定要删除该规则吗？"
                  @ok="handleDelete(record)"
                >
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>

    </a-card>

    <SplitConfigFormDrawer
      v-model:visible="formVisible"
      :mode="formMode"
      :rule-id="currentRuleId"
      @success="handleFormSuccess"
    />

    <a-modal
      v-model:visible="logsVisible"
      title="操作日志"
      :footer="false"
      :width="700"
    >
      <a-table :data="logsData" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="操作类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getLogTypeColor(record.operationType)">
                {{ getLogTypeLabel(record.operationType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作人" data-index="operator" :width="100" />
          <a-table-column title="操作时间" data-index="operatedAt" :width="160" />
          <a-table-column title="备注" data-index="remark" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  getSplitConfigList,
  deleteSplitConfig,
  submitSplitConfigAudit,
  enableSplitConfig,
  disableSplitConfig,
  getSplitConfigLogs,
} from '@gongchengcang/api'
import type { SplitRule, SplitRuleLog } from '@gongchengcang/types'
import {
  SplitRuleCategory,
  SplitRuleProductType,
  SplitRuleMerchantType,
  SplitRuleStatus,
  SPLIT_RULE_CATEGORY_OPTIONS,
  SPLIT_RULE_STATUS_OPTIONS,
  SPLIT_RULE_PRODUCT_TYPE_OPTIONS,
  SPLIT_RULE_MERCHANT_TYPE_OPTIONS,
} from '@gongchengcang/types'
import SplitConfigFormDrawer from './components/SplitConfigFormDrawer.vue'

const loading = ref(false)
const tableData = ref<SplitRule[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  ruleCategory: undefined as SplitRuleCategory | undefined,
  status: undefined as SplitRuleStatus | undefined,
})

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentRuleId = ref('')

const logsVisible = ref(false)
const logsData = ref<SplitRuleLog[]>([])

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getSplitConfigList({
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
  formMode.value = 'add'
  currentRuleId.value = ''
  formVisible.value = true
}

function handleEdit(record: SplitRule) {
  formMode.value = 'edit'
  currentRuleId.value = record.ruleId
  formVisible.value = true
}

async function handleDelete(record: SplitRule) {
  try {
    await deleteSplitConfig(record.ruleId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

async function handleSubmitAudit(record: SplitRule) {
  try {
    await submitSplitConfigAudit(record.ruleId)
    Message.success('已提交审核')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '提交审核失败')
  }
}

async function handleEnable(record: SplitRule) {
  try {
    await enableSplitConfig(record.ruleId)
    Message.success('启用成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '启用失败')
  }
}

async function handleDisable(record: SplitRule) {
  try {
    await disableSplitConfig(record.ruleId)
    Message.success('停用成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '停用失败')
  }
}

async function handleViewLogs(record: SplitRule) {
  try {
    const logs = await getSplitConfigLogs(record.ruleId)
    logsData.value = logs
    logsVisible.value = true
  } catch (error: any) {
    Message.error(error.message || '获取日志失败')
  }
}

function handleFormSuccess() {
  loadData()
}

function getCategoryLabel(category: SplitRuleCategory) {
  const option = SPLIT_RULE_CATEGORY_OPTIONS.find(o => o.value === category)
  return option?.label || category
}

function getCategoryColor(category: SplitRuleCategory) {
  switch (category) {
    case SplitRuleCategory.MERCHANT_PRODUCT:
      return 'red'
    case SplitRuleCategory.MERCHANT:
      return 'orange'
    case SplitRuleCategory.PRODUCT:
      return 'cyan'
    case SplitRuleCategory.ALL:
      return 'gray'
    default:
      return 'gray'
  }
}

function getProductTypeLabel(type?: SplitRuleProductType) {
  if (!type) return '-'
  const option = SPLIT_RULE_PRODUCT_TYPE_OPTIONS.find(o => o.value === type)
  return option?.label || type
}

function getMerchantTypeLabel(type?: SplitRuleMerchantType) {
  if (!type) return '-'
  const option = SPLIT_RULE_MERCHANT_TYPE_OPTIONS.find(o => o.value === type)
  return option?.label || type
}

function getStatusLabel(status: SplitRuleStatus) {
  const option = SPLIT_RULE_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label || status
}

function getStatusColor(status: SplitRuleStatus) {
  switch (status) {
    case SplitRuleStatus.DRAFT:
      return 'gray'
    case SplitRuleStatus.PENDING:
      return 'orange'
    case SplitRuleStatus.ACTIVE:
      return 'green'
    case SplitRuleStatus.INACTIVE:
      return 'red'
    default:
      return 'gray'
  }
}

function getLogTypeLabel(type: string) {
  const map: Record<string, string> = {
    create: '创建',
    update: '更新',
    audit: '审核',
    enable: '启用',
    disable: '停用',
    delete: '删除',
  }
  return map[type] || type
}

function getLogTypeColor(type: string) {
  const map: Record<string, string> = {
    create: 'green',
    update: 'blue',
    audit: 'orange',
    enable: 'cyan',
    disable: 'red',
    delete: 'red',
  }
  return map[type] || 'gray'
}
</script>

<style scoped lang="less">
.object-label {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.object-value {
  font-size: 12px;
}

.multi-object {
  font-size: 12px;
  line-height: 1.6;
}

.effective-date {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style>
