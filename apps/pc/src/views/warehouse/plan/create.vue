<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>{{ isEdit ? '编辑采购计划' : '新建采购计划' }}</span>
      </template>

      <a-steps :current="currentStep" class="steps-container">
        <a-step title="选择商品" />
        <a-step title="确认信息" />
        <a-step title="完成" />
      </a-steps>

      <div class="step-content">
        <div v-show="currentStep === 1">
          <a-alert type="info" style="margin-bottom: 16px">
            <template #message>
              <div>选择需要采购的商品，系统已自动筛选出库存不足的商品</div>
            </template>
          </a-alert>

          <div class="filter-bar">
            <a-space>
              <a-input-search
                v-model="searchForm.keyword"
                placeholder="搜索商品名称/编码"
                style="width: 240px"
                @search="handleSearch"
              />
              <a-select v-model="searchForm.stockStatus" placeholder="库存状态" style="width: 150px">
                <a-option value="low">库存不足</a-option>
                <a-option value="all">全部</a-option>
              </a-select>
              <a-button type="outline" @click="handleSelectAllLowStock">
                <template #icon><icon-check /></template>
                全选库存不足商品
              </a-button>
            </a-space>
          </div>

          <a-table
            :data="productList"
            :pagination="pagination"
            :row-selection="rowSelection"
            @page-change="handlePageChange"
          >
            <template #columns>
              <a-table-column title="商品编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" :width="200">
                <template #cell="{ record }">
                  <div>{{ record.skuName }}</div>
                  <div class="sub-text">{{ record.specValues }}</div>
                </template>
              </a-table-column>
              <a-table-column title="绑定供应商" :width="150">
                <template #cell="{ record }">
                  <div class="supplier-tag">
                    <icon-check-circle-fill class="success-icon" />
                    {{ record.boundSupplier?.name }}
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="供货价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.boundSupplier?.price }}
                </template>
              </a-table-column>
              <a-table-column title="当前库存" :width="100" align="center">
                <template #cell="{ record }">
                  <span :class="{ 'low-stock': record.availableQty < record.safeStock }">
                    {{ record.availableQty }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="安全库存" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.safeStock }}
                </template>
              </a-table-column>
              <a-table-column title="建议采购量" :width="120">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.suggestQuantity"
                    :min="0"
                    :max="99999"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="库存状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.availableQty < record.safeStock ? 'red' : 'green'">
                    {{ record.availableQty < record.safeStock ? '库存不足' : '库存正常' }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div class="selected-info" v-if="selectedKeys.length > 0">
            已选择 <strong>{{ selectedKeys.length }}</strong> 个商品
          </div>
        </div>

        <div v-show="currentStep === 2">
          <a-form :model="planForm" layout="vertical">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="计划名称" required>
                  <a-input v-model="planForm.planName" placeholder="请输入计划名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="截止时间">
                  <a-date-picker v-model="planForm.deadline" style="width: 100%" show-time />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="计划说明">
              <a-textarea v-model="planForm.description" placeholder="请输入计划说明" :max-length="500" show-word-limit />
            </a-form-item>
          </a-form>

          <a-divider>采购商品清单</a-divider>

          <a-table :data="selectedProducts" :pagination="false">
            <template #columns>
              <a-table-column title="商品编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" :width="180">
                <template #cell="{ record }">
                  <div>{{ record.skuName }}</div>
                  <div class="sub-text">{{ record.specValues }}</div>
                </template>
              </a-table-column>
              <a-table-column title="绑定供应商" :width="150">
                <template #cell="{ record }">
                  <div class="supplier-tag">
                    <icon-check-circle-fill class="success-icon" />
                    {{ record.boundSupplier?.name }}
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="供货价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.boundSupplier?.price }}
                </template>
              </a-table-column>
              <a-table-column title="当前库存" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.availableQty }}
                </template>
              </a-table-column>
              <a-table-column title="采购数量" :width="120">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.suggestQuantity"
                    :min="0"
                    :max="99999"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="预计金额" :width="120" align="right">
                <template #cell="{ record }">
                  ¥{{ (record.suggestQuantity * record.boundSupplier?.price).toFixed(2) }}
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80">
                <template #cell="{ rowIndex }">
                  <a-button type="text" size="small" status="danger" @click="handleRemoveProduct(rowIndex)">
                    移除
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div class="summary-bar">
            <div class="summary-item">
              <span>商品数量：</span>
              <strong>{{ selectedProducts.length }}</strong> 个
            </div>
            <div class="summary-item">
              <span>预计金额：</span>
              <strong class="highlight">¥{{ totalAmount }}</strong>
            </div>
          </div>
        </div>

        <div v-show="currentStep === 3" class="success-container">
          <a-result status="success" title="采购计划创建成功">
            <template #subtitle>
              <div>计划编号：{{ planForm.planNo }}</div>
              <div>已自动推送给相关供应商</div>
            </template>
            <template #extra>
              <a-space>
                <a-button type="primary" @click="handleViewPlan">查看计划</a-button>
                <a-button @click="handleCreateAnother">继续创建</a-button>
              </a-space>
            </template>
          </a-result>
        </div>
      </div>

      <div class="step-actions" v-if="currentStep < 3">
        <a-button @click="handleCancel">取消</a-button>
        <a-button v-if="currentStep > 1" @click="handlePrevStep">上一步</a-button>
        <a-button v-if="currentStep === 1" :disabled="selectedKeys.length === 0" type="primary" @click="handleNextStep">
          下一步
        </a-button>
        <a-button v-if="currentStep === 2" type="primary" @click="handleSubmit">
          提交计划
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const currentStep = ref(1)

const searchForm = reactive({
  keyword: '',
  stockStatus: 'low',
})

const planForm = reactive({
  planNo: '',
  planName: '',
  deadline: '',
  description: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const selectedKeys = ref<string[]>([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedKeys,
  onSelect: (rowKeys: string[]) => {
    selectedKeys.value = rowKeys
  },
})

const productList = ref([
  {
    id: '1',
    skuCode: 'SKU001',
    skuName: '普通硅酸盐水泥P.O42.5',
    specValues: '50kg/袋',
    availableQty: 5,
    safeStock: 50,
    suggestQuantity: 100,
    boundSupplier: { id: 'SUP001', name: '广东建材供应商', price: 26 },
  },
  {
    id: '2',
    skuCode: 'SKU003',
    skuName: '抛光砖',
    specValues: '800×800mm',
    availableQty: 20,
    safeStock: 100,
    suggestQuantity: 200,
    boundSupplier: { id: 'SUP003', name: '佛山陶瓷供应商', price: 42 },
  },
  {
    id: '3',
    skuCode: 'SKU004',
    skuName: '内墙乳胶漆',
    specValues: '20L/桶',
    availableQty: 3,
    safeStock: 30,
    suggestQuantity: 50,
    boundSupplier: { id: 'SUP005', name: '广州涂料供应商', price: 360 },
  },
  {
    id: '4',
    skuCode: 'SKU005',
    skuName: '防水涂料',
    specValues: '18L/桶',
    availableQty: 8,
    safeStock: 20,
    suggestQuantity: 30,
    boundSupplier: { id: 'SUP002', name: '深圳建材供应商', price: 180 },
  },
  {
    id: '5',
    skuCode: 'SKU006',
    skuName: '电线电缆',
    specValues: '2.5mm²',
    availableQty: 100,
    safeStock: 50,
    suggestQuantity: 0,
    boundSupplier: { id: 'SUP004', name: '广东电线供应商', price: 3.5 },
  },
])

const selectedProducts = computed(() => {
  return productList.value.filter(item => selectedKeys.value.includes(item.id))
})

const totalAmount = computed(() => {
  return selectedProducts.value
    .reduce((sum, item) => sum + item.suggestQuantity * (item.boundSupplier?.price || 0), 0)
    .toFixed(2)
})

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleSelectAllLowStock() {
  const lowStockItems = productList.value.filter(item => item.availableQty < item.safeStock)
  selectedKeys.value = lowStockItems.map(item => item.id)
  Message.success(`已选择 ${lowStockItems.length} 个库存不足的商品`)
}

function handleRemoveProduct(index: number) {
  const product = selectedProducts.value[index]
  const keyIndex = selectedKeys.value.indexOf(product.id)
  if (keyIndex > -1) {
    selectedKeys.value.splice(keyIndex, 1)
  }
}

function handlePrevStep() {
  currentStep.value--
}

function handleNextStep() {
  if (selectedKeys.value.length === 0) {
    Message.warning('请至少选择一个商品')
    return
  }
  currentStep.value++
}

function handleSubmit() {
  if (!planForm.planName) {
    Message.warning('请输入计划名称')
    return
  }

  const validProducts = selectedProducts.value.filter(item => item.suggestQuantity > 0)
  if (validProducts.length === 0) {
    Message.warning('请至少设置一个商品的采购数量')
    return
  }

  planForm.planNo = 'PO' + Date.now()
  Message.success('采购计划创建成功')
  currentStep.value = 3
}

function handleViewPlan() {
  router.push('/warehouse/market/plan')
}

function handleCreateAnother() {
  currentStep.value = 1
  selectedKeys.value = []
  planForm.planName = ''
  planForm.deadline = ''
  planForm.description = ''
}

onMounted(() => {
  if (route.query.autoSelect === 'low') {
    handleSelectAllLowStock()
  }
})
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.steps-container {
  margin-bottom: 24px;
}

.step-content {
  min-height: 400px;
}

.filter-bar {
  margin-bottom: 16px;
}

.selected-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.low-stock {
  color: rgb(var(--danger-6));
  font-weight: 500;
}

.supplier-tag {
  display: flex;
  align-items: center;
  gap: 4px;

  .success-icon {
    color: rgb(var(--success-6));
  }
}

.summary-bar {
  display: flex;
  gap: 32px;
  margin-top: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;

  .summary-item {
    .highlight {
      color: rgb(var(--primary-6));
      font-size: 18px;
    }
  }
}

.step-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  text-align: right;
}

.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
