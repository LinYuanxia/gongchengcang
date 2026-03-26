<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>采购计划管理</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          创建采购计划
        </a-button>
      </template>

      <div class="search-area">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="计划编号">
            <a-input v-model="searchForm.planNo" placeholder="请输入计划编号" allow-clear />
          </a-form-item>
          <a-form-item label="计划名称">
            <a-input v-model="searchForm.planName" placeholder="请输入计划名称" allow-clear />
          </a-form-item>
          <a-form-item label="计划状态">
            <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear style="width: 140px">
              <a-option value="draft">草稿</a-option>
              <a-option value="published">已发布</a-option>
              <a-option value="partial">部分确认</a-option>
              <a-option value="confirmed">全部确认</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="cancelled">已取消</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <a-table
        :data="filteredPlans"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="计划编号" data-index="planNo" :width="150" />
          <a-table-column title="计划名称" data-index="planName" :width="200" />
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 个
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.estimatedAmount?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="推送工程仓" :width="150">
            <template #cell="{ record }">
              <template v-if="record.pushList && record.pushList.length > 0">
                <a-popover trigger="hover">
                  <span class="push-count">
                    {{ record.pushList.length }} 个工程仓
                    <icon-right />
                  </span>
                  <template #content>
                    <div class="push-list">
                      <div v-for="item in record.pushList" :key="item.warehouseId" class="push-item">
                        <span>{{ item.warehouseName }}</span>
                        <a-tag :color="getPushStatusColor(item.status)" size="small">
                          {{ getPushStatusText(item.status) }}
                        </a-tag>
                      </div>
                    </div>
                  </template>
                </a-popover>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="计划状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" :width="160">
            <template #cell="{ record }">
              {{ record.createTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button 
                  v-if="record.status === 'draft'" 
                  type="text" 
                  size="small" 
                  @click="handleEdit(record)"
                >
                  编辑
                </a-button>
                <a-button 
                  v-if="record.status === 'draft'" 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handlePublish(record)"
                >
                  发布
                </a-button>
                <a-button 
                  v-if="record.status === 'published' || record.status === 'partial'" 
                  type="text" 
                  size="small"
                  @click="handlePushMore(record)"
                >
                  继续推送
                </a-button>
                <a-popconfirm 
                  v-if="record.status === 'draft'" 
                  content="确定要删除此计划吗？" 
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

    <a-modal 
      v-model:visible="createVisible" 
      :title="isEdit ? '编辑采购计划' : '创建采购计划'" 
      :width="1000"
      :footer="false"
      unmount-on-close
    >
      <a-form :model="planForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="计划名称" required>
              <a-input v-model="planForm.planName" placeholder="请输入计划名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="计划说明">
          <a-textarea v-model="planForm.description" placeholder="请输入计划说明（选填）" :max-length="500" />
        </a-form-item>

        <a-divider>采购商品清单</a-divider>

        <div class="sku-toolbar">
          <a-button type="outline" @click="handleAddSku">
            <template #icon><icon-plus /></template>
            添加商品
          </a-button>
        </div>

        <a-table :data="planForm.skuList" :pagination="false" style="margin-top: 16px">
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
            <a-table-column title="商品名称" :width="200">
              <template #cell="{ record }">
                <div>{{ record.productName }}</div>
                <div class="sub-text">{{ record.specValues }}</div>
              </template>
            </a-table-column>
            <a-table-column title="单位" data-index="unit" :width="60" align="center" />
            <a-table-column title="建议采购量" :width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="record.quantity" 
                  :min="1" 
                  :max="99999"
                  style="width: 100%"
                />
              </template>
            </a-table-column>
            <a-table-column title="供货价" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.referencePrice }}
              </template>
            </a-table-column>
            <a-table-column title="预计金额" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ (record.quantity * record.referencePrice).toFixed(2) }}
              </template>
            </a-table-column>
            <a-table-column title="备注" :width="150">
              <template #cell="{ record }">
                <a-input v-model="record.remark" placeholder="备注" />
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="80" fixed="right">
              <template #cell="{ rowIndex }">
                <a-button 
                  type="text" 
                  size="small" 
                  status="danger"
                  @click="handleRemoveSku(rowIndex)"
                >
                  删除
                </a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <div class="form-footer">
          <div class="summary">
            <span>共 <strong>{{ planForm.skuList.length }}</strong> 个SKU</span>
            <span style="margin-left: 24px">
              预计总金额：<strong class="highlight">¥{{ totalEstimatedAmount }}</strong>
            </span>
          </div>
          <a-space>
            <a-button @click="createVisible = false">取消</a-button>
            <a-button type="primary" @click="handleSavePlan">
              {{ isEdit ? '保存' : '创建' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="skuSelectorVisible" 
      title="选择商品" 
      :width="900"
      :footer="false"
    >
      <div class="sku-selector">
        <div class="selector-search">
          <a-input-search
            v-model="skuSearchKeyword"
            placeholder="搜索商品名称或SKU编码"
            style="width: 300px"
          />
          <a-select v-model="skuCategoryFilter" placeholder="选择分类" allow-clear style="width: 150px; margin-left: 12px">
            <a-option value="cement">水泥建材</a-option>
            <a-option value="steel">钢材钢筋</a-option>
            <a-option value="ceramic">陶瓷瓷砖</a-option>
            <a-option value="paint">涂料油漆</a-option>
          </a-select>
        </div>
        <a-table 
          :data="filteredSkuList" 
          :pagination="{ pageSize: 5 }"
          :row-selection="skuRowSelection"
          row-key="skuId"
        >
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
            <a-table-column title="商品名称" :width="200">
              <template #cell="{ record }">
                <div>{{ record.productName }}</div>
                <div class="sub-text">{{ record.specValues }}</div>
              </template>
            </a-table-column>
            <a-table-column title="单位" data-index="unit" :width="60" align="center" />
            <a-table-column title="参考价" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.referencePrice }}
              </template>
            </a-table-column>
            <a-table-column title="库存" :width="80" align="center">
              <template #cell="{ record }">
                {{ record.stock }}
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="selector-footer">
          <span>已选择 <strong>{{ selectedSkuKeys.length }}</strong> 个SKU</span>
          <a-space>
            <a-button @click="skuSelectorVisible = false">取消</a-button>
            <a-button type="primary" :disabled="selectedSkuKeys.length === 0" @click="handleConfirmSku">
              确认添加
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="publishVisible" 
      title="发布采购计划" 
      :width="700"
      :footer="false"
      unmount-on-close
    >
      <a-alert type="info" style="margin-bottom: 16px">
        选择要推送的工程仓，计划将发送给选中的工程仓进行确认下单。
      </a-alert>

      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="计划编号">{{ currentPlan.planNo }}</a-descriptions-item>
        <a-descriptions-item label="计划名称">{{ currentPlan.planName }}</a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ currentPlan.skuCount }} 个</a-descriptions-item>
        <a-descriptions-item label="预计金额">¥{{ currentPlan.estimatedAmount?.toLocaleString() }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>选择工程仓</a-divider>

      <div class="warehouse-selector">
        <div class="selector-header">
          <a-checkbox 
            :model-value="isAllWarehouseSelected"
            :indeterminate="isPartialWarehouseSelected"
            @change="handleSelectAllWarehouse"
          >
            全选
          </a-checkbox>
          <a-input-search
            v-model="warehouseSearchKeyword"
            placeholder="搜索工程仓"
            style="width: 200px"
          />
        </div>
        <div class="warehouse-list">
          <div 
            v-for="w in filteredWarehouseList" 
            :key="w.id" 
            class="warehouse-item"
            :class="{ 'is-selected': selectedWarehouseIds.includes(w.id), 'is-pushed': isAlreadyPushed(w.id) }"
            @click="handleToggleWarehouse(w.id)"
          >
            <a-checkbox 
              :model-value="selectedWarehouseIds.includes(w.id)"
              :disabled="isAlreadyPushed(w.id)"
              @click.stop
            />
            <div class="warehouse-info">
              <span class="name">{{ w.name }}</span>
              <span class="contact">{{ w.contactPerson }} {{ w.contactPhone }}</span>
            </div>
            <a-tag v-if="isAlreadyPushed(w.id)" color="arcoblue" size="small">已推送</a-tag>
          </div>
        </div>
      </div>

      <div class="publish-footer">
        <div class="selected-info">
          已选择 <strong>{{ selectableWarehouseCount }}</strong> 个工程仓
        </div>
        <a-space>
          <a-button @click="publishVisible = false">取消</a-button>
          <a-button type="primary" :disabled="selectedWarehouseIds.length === 0" @click="handleConfirmPublish">
            确认发布
          </a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="detailVisible" 
      title="采购计划详情" 
      :width="1100"
      :footer="false"
    >
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="计划编号">{{ currentPlan.planNo }}</a-descriptions-item>
        <a-descriptions-item label="计划名称">{{ currentPlan.planName }}</a-descriptions-item>
        <a-descriptions-item label="计划状态">
          <a-tag :color="getStatusColor(currentPlan.status)">
            {{ getStatusText(currentPlan.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ currentPlan.skuCount }} 个</a-descriptions-item>
        <a-descriptions-item label="预计金额">¥{{ currentPlan.estimatedAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentPlan.createTime }}</a-descriptions-item>
        <a-descriptions-item label="计划说明" :span="3">{{ currentPlan.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>推送工程仓状态</a-divider>

      <a-table :data="currentPlan.pushList || []" :pagination="false" style="margin-bottom: 16px">
        <template #columns>
          <a-table-column title="工程仓" data-index="warehouseName" :width="150" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPushStatusColor(record.status)">
                {{ getPushStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="推送时间" data-index="pushTime" :width="160" />
          <a-table-column title="确认时间" :width="160">
            <template #cell="{ record }">
              {{ record.confirmTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="订单编号" :width="150">
            <template #cell="{ record }">
              {{ record.orderNo || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="实际金额" :width="120" align="right">
            <template #cell="{ record }">
              {{ record.actualAmount ? '¥' + record.actualAmount.toLocaleString() : '-' }}
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>采购商品清单</a-divider>

      <a-table :data="currentPlan.skuList || []" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="sub-text">{{ record.specValues }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="建议采购量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="供货价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.referencePrice }}
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.referencePrice).toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="150" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)

const searchForm = reactive({
  planNo: '',
  planName: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const warehouseList = ref([
  { id: 'WH001', name: '深圳宝安工程仓', contactPerson: '张经理', contactPhone: '13800138001' },
  { id: 'WH002', name: '广州天河工程仓', contactPerson: '李经理', contactPhone: '13800138002' },
  { id: 'WH003', name: '东莞南城工程仓', contactPerson: '王经理', contactPhone: '13800138003' },
  { id: 'WH004', name: '佛山禅城工程仓', contactPerson: '赵经理', contactPhone: '13800138004' },
  { id: 'WH005', name: '惠州惠城工程仓', contactPerson: '陈经理', contactPhone: '13800138005' }
])

const planList = ref([
  {
    id: '1',
    planNo: 'PO202401001',
    planName: '2024年1月建材采购计划',
    skuCount: 15,
    estimatedAmount: 125800,
    status: 'published',
    createTime: '2024-01-15 10:30:00',
    description: '本月常规建材补货计划',
    pushList: [
      { warehouseId: 'WH001', warehouseName: '深圳宝安工程仓', status: 'pending', pushTime: '2024-01-15 14:00:00' },
      { warehouseId: 'WH002', warehouseName: '广州天河工程仓', status: 'confirmed', pushTime: '2024-01-15 14:00:00', confirmTime: '2024-01-16 10:00:00', orderNo: 'SO202401001', actualAmount: 128500 }
    ]
  },
  {
    id: '2',
    planNo: 'PO202401002',
    planName: '春节前备货计划',
    skuCount: 28,
    estimatedAmount: 356000,
    status: 'partial',
    createTime: '2024-01-18 09:00:00',
    description: '',
    pushList: [
      { warehouseId: 'WH001', warehouseName: '深圳宝安工程仓', status: 'confirmed', pushTime: '2024-01-18 11:00:00', confirmTime: '2024-01-19 15:30:00', orderNo: 'SO202401002', actualAmount: 362000 },
      { warehouseId: 'WH003', warehouseName: '东莞南城工程仓', status: 'pending', pushTime: '2024-01-18 11:00:00' },
      { warehouseId: 'WH004', warehouseName: '佛山禅城工程仓', status: 'pending', pushTime: '2024-01-18 11:00:00' }
    ]
  },
  {
    id: '3',
    planNo: 'PO202401003',
    planName: '新项目启动采购',
    skuCount: 42,
    estimatedAmount: 528000,
    status: 'confirmed',
    createTime: '2024-01-20 14:00:00',
    description: '',
    pushList: [
      { warehouseId: 'WH002', warehouseName: '广州天河工程仓', status: 'confirmed', pushTime: '2024-01-20 16:00:00', confirmTime: '2024-01-21 10:00:00', orderNo: 'SO202401003', actualAmount: 535000 }
    ]
  },
  {
    id: '4',
    planNo: 'PO202401004',
    planName: '瓷砖补货计划',
    skuCount: 8,
    estimatedAmount: 45000,
    status: 'draft',
    createTime: '2024-01-22 09:30:00',
    description: '',
    pushList: []
  }
])

const filteredPlans = computed(() => {
  let result = planList.value
  if (searchForm.planNo) {
    result = result.filter(p => p.planNo.includes(searchForm.planNo))
  }
  if (searchForm.planName) {
    result = result.filter(p => p.planName.includes(searchForm.planName))
  }
  if (searchForm.status) {
    result = result.filter(p => p.status === searchForm.status)
  }
  return result
})

const createVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')

const planForm = reactive({
  planName: '',
  description: '',
  skuList: [] as any[]
})

const skuSelectorVisible = ref(false)
const skuSearchKeyword = ref('')
const skuCategoryFilter = ref('')
const selectedSkuKeys = ref<string[]>([])

const skuList = ref([
  { skuId: 'SKU001', skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', referencePrice: 28, stock: 5000 },
  { skuId: 'SKU002', skuCode: 'SKU002', productName: '螺纹钢HRB400', specValues: 'Φ12mm', unit: '吨', referencePrice: 4200, stock: 200 },
  { skuId: 'SKU003', skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', referencePrice: 45, stock: 3000 },
  { skuId: 'SKU004', skuCode: 'SKU004', productName: '内墙乳胶漆', specValues: '20L/桶', unit: '桶', referencePrice: 380, stock: 150 },
  { skuId: 'SKU005', skuCode: 'SKU005', productName: '防水涂料', specValues: '18kg/桶', unit: '桶', referencePrice: 260, stock: 80 },
  { skuId: 'SKU006', skuCode: 'SKU006', productName: '石膏板', specValues: '1200×2400×9.5mm', unit: '张', referencePrice: 35, stock: 500 },
  { skuId: 'SKU007', skuCode: 'SKU007', productName: 'PVC排水管', specValues: 'Φ110mm', unit: '根', referencePrice: 45, stock: 300 },
  { skuId: 'SKU008', skuCode: 'SKU008', productName: '电线BV', specValues: '2.5平方', unit: '卷', referencePrice: 180, stock: 200 }
])

const filteredSkuList = computed(() => {
  let result = skuList.value
  if (skuSearchKeyword.value) {
    result = result.filter(s => 
      s.productName.includes(skuSearchKeyword.value) ||
      s.skuCode.includes(skuSearchKeyword.value)
    )
  }
  return result
})

const skuRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedSkuKeys.value,
  onlyCurrent: false,
  onChange: (keys: string[]) => {
    selectedSkuKeys.value = keys
  }
}))

const totalEstimatedAmount = computed(() => {
  return planForm.skuList.reduce((sum, item) => sum + item.quantity * item.referencePrice, 0).toFixed(2)
})

const detailVisible = ref(false)
const currentPlan = ref<any>({})

const publishVisible = ref(false)
const selectedWarehouseIds = ref<string[]>([])
const warehouseSearchKeyword = ref('')

const filteredWarehouseList = computed(() => {
  if (!warehouseSearchKeyword.value) return warehouseList.value
  return warehouseList.value.filter(w => 
    w.name.includes(warehouseSearchKeyword.value)
  )
})

const isAllWarehouseSelected = computed(() => {
  const pushedList = currentPlan.value.pushList?.map((p: any) => p.warehouseId) || []
  const selectableList = warehouseList.value.filter(w => !pushedList.includes(w.id))
  return selectableList.length > 0 && selectedWarehouseIds.value.length === selectableList.length
})

const isPartialWarehouseSelected = computed(() => {
  const pushedList = currentPlan.value.pushList?.map((p: any) => p.warehouseId) || []
  const selectableList = warehouseList.value.filter(w => !pushedList.includes(w.id))
  return selectedWarehouseIds.value.length > 0 && selectedWarehouseIds.value.length < selectableList.length
})

const selectableWarehouseCount = computed(() => {
  return selectedWarehouseIds.value.length
})

function isAlreadyPushed(warehouseId: string) {
  return currentPlan.value.pushList?.some((p: any) => p.warehouseId === warehouseId)
}

function handleSelectAllWarehouse(checked: boolean) {
  const pushedList = currentPlan.value.pushList?.map((p: any) => p.warehouseId) || []
  if (checked) {
    selectedWarehouseIds.value = warehouseList.value
      .filter(w => !pushedList.includes(w.id))
      .map(w => w.id)
  } else {
    selectedWarehouseIds.value = []
  }
}

function handleToggleWarehouse(warehouseId: string) {
  if (isAlreadyPushed(warehouseId)) return
  const index = selectedWarehouseIds.value.indexOf(warehouseId)
  if (index > -1) {
    selectedWarehouseIds.value.splice(index, 1)
  } else {
    selectedWarehouseIds.value.push(warehouseId)
  }
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.planNo = ''
  searchForm.planName = ''
  searchForm.status = ''
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  isEdit.value = false
  editId.value = ''
  planForm.planName = ''
  planForm.description = ''
  planForm.skuList = []
  createVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  editId.value = record.id
  planForm.planName = record.planName
  planForm.description = record.description || ''
  planForm.skuList = [
    { skuId: 'SKU001', skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', referencePrice: 28, quantity: 100, remark: '' },
    { skuId: 'SKU003', skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', referencePrice: 45, quantity: 500, remark: '优先选择广东品牌' }
  ]
  createVisible.value = true
}

function handleView(record: any) {
  currentPlan.value = {
    ...record,
    skuList: [
      { skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', referencePrice: 28, quantity: 100, remark: '' },
      { skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', referencePrice: 45, quantity: 500, remark: '优先选择广东品牌' },
      { skuCode: 'SKU004', productName: '内墙乳胶漆', specValues: '20L/桶', unit: '桶', referencePrice: 380, quantity: 20, remark: '' }
    ]
  }
  detailVisible.value = true
}

function handlePublish(record: any) {
  currentPlan.value = { ...record }
  selectedWarehouseIds.value = []
  warehouseSearchKeyword.value = ''
  publishVisible.value = true
}

function handlePushMore(record: any) {
  currentPlan.value = { ...record }
  selectedWarehouseIds.value = []
  warehouseSearchKeyword.value = ''
  publishVisible.value = true
}

function handleConfirmPublish() {
  if (selectedWarehouseIds.value.length === 0) {
    Message.warning('请选择至少一个工程仓')
    return
  }

  const newPushList = selectedWarehouseIds.value.map(id => {
    const warehouse = warehouseList.value.find(w => w.id === id)
    return {
      warehouseId: id,
      warehouseName: warehouse?.name || '',
      status: 'pending',
      pushTime: new Date().toLocaleString()
    }
  })

  if (!currentPlan.value.pushList) {
    currentPlan.value.pushList = []
  }
  currentPlan.value.pushList.push(...newPushList)
  currentPlan.value.status = 'published'

  Message.success(`已推送到 ${selectedWarehouseIds.value.length} 个工程仓`)
  publishVisible.value = false
}

function handleDelete(record: any) {
  const index = planList.value.findIndex(p => p.id === record.id)
  if (index > -1) {
    planList.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handleAddSku() {
  selectedSkuKeys.value = []
  skuSearchKeyword.value = ''
  skuCategoryFilter.value = ''
  skuSelectorVisible.value = true
}

function handleConfirmSku() {
  const newSkus = filteredSkuList.value
    .filter(s => selectedSkuKeys.value.includes(s.skuId))
    .filter(s => !planForm.skuList.some(p => p.skuId === s.skuId))
    .map(s => ({
      ...s,
      quantity: 1,
      remark: ''
    }))
  
  planForm.skuList.push(...newSkus)
  skuSelectorVisible.value = false
  Message.success(`已添加 ${newSkus.length} 个SKU`)
}

function handleRemoveSku(index: number) {
  planForm.skuList.splice(index, 1)
}

function handleSavePlan() {
  if (!planForm.planName) {
    Message.warning('请输入计划名称')
    return
  }
  if (planForm.skuList.length === 0) {
    Message.warning('请添加采购商品')
    return
  }

  if (isEdit.value) {
    Message.success('保存成功')
  } else {
    const newPlan = {
      id: Date.now().toString(),
      planNo: `PO${Date.now().toString().slice(-8)}`,
      planName: planForm.planName,
      skuCount: planForm.skuList.length,
      estimatedAmount: parseFloat(totalEstimatedAmount.value),
      status: 'draft',
      createTime: new Date().toLocaleString(),
      description: planForm.description,
      pushList: []
    }
    planList.value.unshift(newPlan)
    Message.success('创建成功，请发布到工程仓')
  }
  createVisible.value = false
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'gray',
    published: 'blue',
    partial: 'orange',
    confirmed: 'cyan',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    partial: '部分确认',
    confirmed: '全部确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

function getPushStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getPushStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消'
  }
  return texts[status] || status
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.search-area {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.sku-toolbar {
  margin-bottom: 8px;
}

.push-count {
  color: rgb(var(--primary-6));
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.text-muted {
  color: var(--color-text-3);
}

.push-list {
  max-height: 200px;
  overflow-y: auto;
}

.push-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.warehouse-selector {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-fill-1);
  border-bottom: 1px solid var(--color-border);
}

.warehouse-list {
  max-height: 300px;
  overflow-y: auto;
}

.warehouse-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--color-fill-1);
  }

  &.is-selected {
    background: rgb(var(--primary-1));
  }

  &.is-pushed {
    background: var(--color-fill-2);
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:last-child {
    border-bottom: none;
  }
}

.warehouse-info {
  flex: 1;

  .name {
    display: block;
    font-weight: 500;
  }

  .contact {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}

.publish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);

  .summary {
    color: var(--color-text-2);
    
    strong {
      color: var(--color-text-1);
      
      &.highlight {
        color: rgb(var(--primary-6));
        font-size: 18px;
      }
    }
  }
}

.selector-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
