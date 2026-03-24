<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>供应商工程仓配置</span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="viewMode" type="button" @change="handleViewModeChange">
            <a-radio value="supplier">按供应商查看</a-radio>
            <a-radio value="warehouse">按工程仓查看</a-radio>
          </a-radio-group>
          <a-button type="primary" @click="handleAddConfig">
            <template #icon><icon-plus /></template>
            添加配置
          </a-button>
        </a-space>
      </template>

      <div v-if="viewMode === 'supplier'">
        <div class="table-actions">
          <a-space>
            <a-input-search
              v-model="searchForm.keyword"
              placeholder="搜索供应商名称"
              style="width: 260px"
              @search="handleSearch"
            />
            <a-select v-model="searchForm.status" placeholder="配置状态" style="width: 120px" allow-clear>
              <a-option value="configured">已配置</a-option>
              <a-option value="unconfigured">未配置</a-option>
            </a-select>
          </a-space>
        </div>

        <a-table
          :data="filteredSuppliers"
          :loading="loading"
          :pagination="pagination"
          row-key="supplierId"
          @page-change="handlePageChange"
        >
          <template #columns>
            <a-table-column title="供应商ID" data-index="supplierId" :width="120" />
            <a-table-column title="供应商名称" data-index="supplierName" :width="200" />
            <a-table-column title="联系人" data-index="contactPerson" :width="100" />
            <a-table-column title="联系电话" data-index="contactPhone" :width="130" />
            <a-table-column title="已配置工程仓" :width="120">
              <template #cell="{ record }">
                <a-link @click="handleViewWarehouses(record)">
                  {{ record.warehouseCount || 0 }} 家
                </a-link>
              </template>
            </a-table-column>
            <a-table-column title="供货商品数" :width="100">
              <template #cell="{ record }">
                <span>{{ record.productCount || 0 }} 个</span>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.warehouseCount > 0 ? 'green' : 'gray'">
                  {{ record.warehouseCount > 0 ? '已配置' : '未配置' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewWarehouses(record)">查看工程仓</a-button>
                  <a-button type="text" size="small" @click="handleEditConfig(record)">配置</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div v-else>
        <div class="table-actions">
          <a-space>
            <a-input-search
              v-model="warehouseSearchForm.keyword"
              placeholder="搜索工程仓名称"
              style="width: 260px"
              @search="handleWarehouseSearch"
            />
            <a-select v-model="warehouseSearchForm.status" placeholder="配置状态" style="width: 120px" allow-clear>
              <a-option value="configured">已配置</a-option>
              <a-option value="unconfigured">未配置</a-option>
            </a-select>
          </a-space>
        </div>

        <a-table
          :data="filteredWarehouses"
          :loading="warehouseLoading"
          :pagination="warehousePagination"
          row-key="warehouseId"
          @page-change="handleWarehousePageChange"
        >
          <template #columns>
            <a-table-column title="工程仓ID" data-index="warehouseId" :width="120" />
            <a-table-column title="工程仓名称" data-index="warehouseName" :width="200" />
            <a-table-column title="联系人" data-index="contactPerson" :width="100" />
            <a-table-column title="联系电话" data-index="contactPhone" :width="130" />
            <a-table-column title="地址" data-index="address" :width="200" />
            <a-table-column title="已配置供应商" :width="120">
              <template #cell="{ record }">
                <a-link @click="handleViewSuppliers(record)">
                  {{ record.supplierCount || 0 }} 家
                </a-link>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.supplierCount > 0 ? 'green' : 'gray'">
                  {{ record.supplierCount > 0 ? '已配置' : '未配置' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewSuppliers(record)">查看供应商</a-button>
                  <a-button type="text" size="small" @click="handleEditWarehouseConfig(record)">配置</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal 
      v-model:visible="addConfigVisible" 
      title="添加供应商工程仓配置" 
      :width="900"
      :footer="false"
      unmount-on-close
    >
      <a-steps :current="addStep" style="margin-bottom: 24px">
        <a-step title="选择供应商" />
        <a-step title="选择工程仓" />
        <a-step title="配置信息" />
      </a-steps>

      <div v-if="addStep === 1" class="step-content">
        <div class="step-header">
          <a-input-search
            v-model="supplierSearchKeyword"
            placeholder="搜索供应商名称或ID"
            style="width: 300px"
          />
        </div>
        <div class="selector-area">
          <div class="list-header">
            <a-checkbox 
              :model-value="isAllSuppliersSelected"
              :indeterminate="isPartialSuppliersSelected"
              @change="handleSelectAllSuppliers"
            />
            <span class="col-id">供应商ID</span>
            <span class="col-name">供应商名称</span>
            <span class="col-contact">联系人</span>
            <span class="col-phone">联系电话</span>
          </div>
          <div class="list-body">
            <div 
              v-for="item in filteredSupplierList" 
              :key="item.supplierId"
              class="list-item"
              :class="{ 'is-selected': selectedSupplierIds.includes(item.supplierId) }"
              @click="handleToggleSupplier(item)"
            >
              <a-checkbox 
                :model-value="selectedSupplierIds.includes(item.supplierId)"
                @click.stop
              />
              <span class="col-id">{{ item.supplierId }}</span>
              <span class="col-name">{{ item.supplierName }}</span>
              <span class="col-contact">{{ item.contactPerson }}</span>
              <span class="col-phone">{{ item.contactPhone }}</span>
            </div>
          </div>
        </div>
        <div class="step-footer">
          <div class="selected-info">
            已选择 <strong>{{ selectedSupplierIds.length }}</strong> 个供应商
            <a-button v-if="selectedSupplierIds.length > 0" type="text" size="small" @click="selectedSupplierIds = []">清空</a-button>
          </div>
          <a-button type="primary" :disabled="selectedSupplierIds.length === 0" @click="addStep = 2">
            下一步
          </a-button>
        </div>
      </div>

      <div v-if="addStep === 2" class="step-content">
        <div class="step-header">
          <a-input-search
            v-model="warehouseSearchKeyword"
            placeholder="搜索工程仓名称或ID"
            style="width: 300px"
          />
        </div>
        <div class="selector-area">
          <div class="list-header">
            <a-checkbox 
              :model-value="isAllWarehousesSelected"
              :indeterminate="isPartialWarehousesSelected"
              @change="handleSelectAllWarehouses"
            />
            <span class="col-id">工程仓ID</span>
            <span class="col-name">工程仓名称</span>
            <span class="col-contact">联系人</span>
            <span class="col-phone">联系电话</span>
          </div>
          <div class="list-body">
            <div 
              v-for="item in filteredWarehouseList" 
              :key="item.warehouseId"
              class="list-item"
              :class="{ 'is-selected': selectedWarehouseIds.includes(item.warehouseId) }"
              @click="handleToggleWarehouse(item)"
            >
              <a-checkbox 
                :model-value="selectedWarehouseIds.includes(item.warehouseId)"
                @click.stop
              />
              <span class="col-id">{{ item.warehouseId }}</span>
              <span class="col-name">{{ item.warehouseName }}</span>
              <span class="col-contact">{{ item.contactPerson }}</span>
              <span class="col-phone">{{ item.contactPhone }}</span>
            </div>
          </div>
        </div>
        <div class="step-footer">
          <div class="selected-info">
            已选择 <strong>{{ selectedWarehouseIds.length }}</strong> 个工程仓
            <a-button v-if="selectedWarehouseIds.length > 0" type="text" size="small" @click="selectedWarehouseIds = []">清空</a-button>
          </div>
          <a-space>
            <a-button @click="addStep = 1">上一步</a-button>
            <a-button type="primary" :disabled="selectedWarehouseIds.length === 0" @click="addStep = 3">
              下一步
            </a-button>
          </a-space>
        </div>
      </div>

      <div v-if="addStep === 3" class="step-content">
        <div class="config-summary">
          <div class="summary-item">
            <span class="label">已选供应商：</span>
            <span class="value">{{ selectedSupplierIds.length }} 个</span>
          </div>
          <div class="summary-item">
            <span class="label">已选工程仓：</span>
            <span class="value">{{ selectedWarehouseIds.length }} 个</span>
          </div>
          <div class="summary-item highlight">
            <span class="label">将创建配置关系：</span>
            <span class="value">{{ selectedSupplierIds.length * selectedWarehouseIds.length }} 条</span>
          </div>
        </div>

        <a-divider />

        <a-form :model="addConfigForm" layout="vertical">
          <a-form-item label="备注">
            <a-textarea v-model="addConfigForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
          </a-form-item>
        </a-form>

        <div class="step-footer">
          <a-space>
            <a-button @click="addStep = 2">上一步</a-button>
            <a-button type="primary" @click="handleSaveAddConfig">
              确认添加
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="configVisible" 
      :title="configTitle" 
      :width="800"
      @ok="handleSaveConfig"
      @cancel="configVisible = false"
    >
      <div class="config-form">
        <div class="form-section">
          <div class="section-title">选择{{ viewMode === 'supplier' ? '工程仓' : '供应商' }}</div>
          <div class="selector-area">
            <div class="selector-filter">
              <a-input-search
                v-model="selectorKeyword"
                :placeholder="viewMode === 'supplier' ? '搜索工程仓名称' : '搜索供应商名称'"
                style="width: 300px"
              />
            </div>
            <div class="selector-list">
              <div class="list-header">
                <a-checkbox 
                  :model-value="isAllSelected"
                  :indeterminate="isPartialSelected"
                  @change="handleSelectAll"
                />
                <span class="header-name">{{ viewMode === 'supplier' ? '工程仓名称' : '供应商名称' }}</span>
                <span class="header-contact">联系人</span>
              </div>
              <div class="list-body">
                <div 
                  v-for="item in filteredSelectorList" 
                  :key="item.id"
                  class="list-item"
                  :class="{ 'is-selected': selectedIds.includes(item.id) }"
                  @click="handleToggleItem(item)"
                >
                  <a-checkbox 
                    :model-value="selectedIds.includes(item.id)"
                    @click.stop
                  />
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-contact">{{ item.contactPerson }} {{ item.contactPhone }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="selected-summary">
          <div class="summary-left">
            <span>已选择 <strong>{{ selectedIds.length }}</strong> 个{{ viewMode === 'supplier' ? '工程仓' : '供应商' }}</span>
          </div>
          <div class="summary-right">
            <a-button type="text" size="small" @click="selectedIds = []">清空选择</a-button>
          </div>
        </div>

        <a-divider />

        <div class="form-section">
          <div class="section-title">配置信息</div>
          <a-form :model="configForm" layout="vertical">
            <a-form-item label="备注">
              <a-textarea v-model="configForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="detailVisible" 
      :title="detailTitle" 
      :width="900"
      :footer="false"
    >
      <template #extra>
        <a-button type="primary" size="small" @click="handleAddToDetail">
          <template #icon><icon-plus /></template>
          添加{{ viewMode === 'supplier' ? '工程仓' : '供应商' }}
        </a-button>
      </template>

      <a-table :data="detailList" :pagination="false">
        <template #columns>
          <a-table-column :title="viewMode === 'supplier' ? '工程仓名称' : '供应商名称'" :width="180">
            <template #cell="{ record }">
              <div>
                <div>{{ record.name }}</div>
                <div class="sub-text">{{ record.contactPerson }} {{ record.contactPhone }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供货商品数" :width="100">
            <template #cell="{ record }">
              {{ record.productCount || 0 }} 个
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '正常' : '已停用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" :width="120">
            <template #cell="{ record }">
              {{ record.createTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditDetail(record)">编辑</a-button>
                <a-popconfirm content="确定要删除此配置吗？" @ok="handleDeleteDetail(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="editDetailVisible" 
      :title="editDetailTitle" 
      :width="500"
      @ok="handleSaveDetail"
    >
      <a-form :model="editDetailForm" layout="vertical">
        <a-form-item label="状态">
          <a-switch v-model="editDetailForm.statusActive" />
          <span style="margin-left: 8px">{{ editDetailForm.statusActive ? '正常' : '停用' }}</span>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="editDetailForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const viewMode = ref<'supplier' | 'warehouse'>('supplier')
const loading = ref(false)
const warehouseLoading = ref(false)

const searchForm = ref({
  keyword: '',
  status: ''
})

const warehouseSearchForm = ref({
  keyword: '',
  status: ''
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const warehousePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const suppliers = ref([
  { supplierId: 'SUP001', supplierName: '广东建材供应商', contactPerson: '张三', contactPhone: '13800138001', warehouseCount: 5, productCount: 128 },
  { supplierId: 'SUP002', supplierName: '深圳钢材供应商', contactPerson: '李四', contactPhone: '13800138002', warehouseCount: 3, productCount: 86 },
  { supplierId: 'SUP003', supplierName: '佛山陶瓷供应商', contactPerson: '王五', contactPhone: '13800138003', warehouseCount: 8, productCount: 256 },
  { supplierId: 'SUP004', supplierName: '东莞五金供应商', contactPerson: '赵六', contactPhone: '13800138004', warehouseCount: 0, productCount: 45 },
  { supplierId: 'SUP005', supplierName: '广州涂料供应商', contactPerson: '钱七', contactPhone: '13800138005', warehouseCount: 2, productCount: 67 }
])

const warehouses = ref([
  { warehouseId: 'WH001', warehouseName: '深圳宝安工程仓', contactPerson: '陈经理', contactPhone: '13900139001', address: '深圳市宝安区西乡街道', supplierCount: 12 },
  { warehouseId: 'WH002', warehouseName: '广州天河工程仓', contactPerson: '林经理', contactPhone: '13900139002', address: '广州市天河区棠下街道', supplierCount: 8 },
  { warehouseId: 'WH003', warehouseName: '东莞南城工程仓', contactPerson: '黄经理', contactPhone: '13900139003', address: '东莞市南城区鸿福路', supplierCount: 15 },
  { warehouseId: 'WH004', warehouseName: '佛山禅城工程仓', contactPerson: '吴经理', contactPhone: '13900139004', address: '佛山市禅城区祖庙路', supplierCount: 6 },
  { warehouseId: 'WH005', warehouseName: '惠州惠城工程仓', contactPerson: '郑经理', contactPhone: '13900139005', address: '惠州市惠城区江北街道', supplierCount: 0 }
])

const filteredSuppliers = computed(() => {
  let result = suppliers.value
  if (searchForm.value.keyword) {
    result = result.filter(s => 
      s.supplierName.includes(searchForm.value.keyword) ||
      s.supplierId.includes(searchForm.value.keyword)
    )
  }
  if (searchForm.value.status === 'configured') {
    result = result.filter(s => s.warehouseCount > 0)
  } else if (searchForm.value.status === 'unconfigured') {
    result = result.filter(s => s.warehouseCount === 0)
  }
  return result
})

const filteredWarehouses = computed(() => {
  let result = warehouses.value
  if (warehouseSearchForm.value.keyword) {
    result = result.filter(w => 
      w.warehouseName.includes(warehouseSearchForm.value.keyword) ||
      w.warehouseId.includes(warehouseSearchForm.value.keyword)
    )
  }
  if (warehouseSearchForm.value.status === 'configured') {
    result = result.filter(w => w.supplierCount > 0)
  } else if (warehouseSearchForm.value.status === 'unconfigured') {
    result = result.filter(w => w.supplierCount === 0)
  }
  return result
})

const addConfigVisible = ref(false)
const addStep = ref(1)
const supplierSearchKeyword = ref('')
const warehouseSearchKeyword = ref('')
const selectedSupplierIds = ref<string[]>([])
const selectedWarehouseIds = ref<string[]>([])

const addConfigForm = ref({
  remark: ''
})

const filteredSupplierList = computed(() => {
  if (!supplierSearchKeyword.value) return suppliers.value
  return suppliers.value.filter(s => 
    s.supplierName.includes(supplierSearchKeyword.value) ||
    s.supplierId.includes(supplierSearchKeyword.value)
  )
})

const filteredWarehouseList = computed(() => {
  if (!warehouseSearchKeyword.value) return warehouses.value
  return warehouses.value.filter(w => 
    w.warehouseName.includes(warehouseSearchKeyword.value) ||
    w.warehouseId.includes(warehouseSearchKeyword.value)
  )
})

const isAllSuppliersSelected = computed(() => {
  return filteredSupplierList.value.length > 0 && 
    filteredSupplierList.value.every(item => selectedSupplierIds.value.includes(item.supplierId))
})

const isPartialSuppliersSelected = computed(() => {
  const selectedCount = filteredSupplierList.value.filter(item => selectedSupplierIds.value.includes(item.supplierId)).length
  return selectedCount > 0 && selectedCount < filteredSupplierList.value.length
})

const isAllWarehousesSelected = computed(() => {
  return filteredWarehouseList.value.length > 0 && 
    filteredWarehouseList.value.every(item => selectedWarehouseIds.value.includes(item.warehouseId))
})

const isPartialWarehousesSelected = computed(() => {
  const selectedCount = filteredWarehouseList.value.filter(item => selectedWarehouseIds.value.includes(item.warehouseId)).length
  return selectedCount > 0 && selectedCount < filteredWarehouseList.value.length
})

const configVisible = ref(false)
const selectorKeyword = ref('')
const selectedIds = ref<string[]>([])
const currentEditItem = ref<any>(null)

const configForm = ref({
  remark: ''
})

const selectorList = computed(() => {
  if (viewMode.value === 'supplier') {
    return warehouses.value.map(w => ({
      id: w.warehouseId,
      name: w.warehouseName,
      contactPerson: w.contactPerson,
      contactPhone: w.contactPhone
    }))
  } else {
    return suppliers.value.map(s => ({
      id: s.supplierId,
      name: s.supplierName,
      contactPerson: s.contactPerson,
      contactPhone: s.contactPhone
    }))
  }
})

const filteredSelectorList = computed(() => {
  if (!selectorKeyword.value) return selectorList.value
  return selectorList.value.filter(item => 
    item.name.includes(selectorKeyword.value) ||
    item.id.includes(selectorKeyword.value)
  )
})

const isAllSelected = computed(() => {
  return filteredSelectorList.value.length > 0 && 
    filteredSelectorList.value.every(item => selectedIds.value.includes(item.id))
})

const isPartialSelected = computed(() => {
  const selectedCount = filteredSelectorList.value.filter(item => selectedIds.value.includes(item.id)).length
  return selectedCount > 0 && selectedCount < filteredSelectorList.value.length
})

const configTitle = computed(() => {
  if (viewMode.value === 'supplier') {
    return `配置工程仓 - ${currentEditItem.value?.supplierName || ''}`
  }
  return `配置供应商 - ${currentEditItem.value?.warehouseName || ''}`
})

const detailVisible = ref(false)
const detailTitle = computed(() => {
  if (viewMode.value === 'supplier') {
    return `已配置工程仓 - ${currentEditItem.value?.supplierName || ''}`
  }
  return `已配置供应商 - ${currentEditItem.value?.warehouseName || ''}`
})

const detailList = ref([
  { id: 'WH001', name: '深圳宝安工程仓', contactPerson: '陈经理', contactPhone: '13900139001', productCount: 45, priority: 1, settlementCycle: 'monthly', status: 'active', createTime: '2024-01-15' },
  { id: 'WH002', name: '广州天河工程仓', contactPerson: '林经理', contactPhone: '13900139002', productCount: 32, priority: 2, settlementCycle: 'monthly', status: 'active', createTime: '2024-01-12' },
  { id: 'WH003', name: '东莞南城工程仓', contactPerson: '黄经理', contactPhone: '13900139003', productCount: 28, priority: 2, settlementCycle: 'quarterly', status: 'active', createTime: '2024-01-10' }
])

const editDetailVisible = ref(false)
const editDetailTitle = ref('编辑配置')
const editDetailForm = ref({
  statusActive: true,
  remark: ''
})

function handleViewModeChange() {
  searchForm.value.keyword = ''
  searchForm.value.status = ''
  warehouseSearchForm.value.keyword = ''
  warehouseSearchForm.value.status = ''
}

function handleSearch() {
  pagination.value.current = 1
}

function handleWarehouseSearch() {
  warehousePagination.value.current = 1
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleWarehousePageChange(page: number) {
  warehousePagination.value.current = page
}

function handleAddConfig() {
  addStep.value = 1
  selectedSupplierIds.value = []
  selectedWarehouseIds.value = []
  supplierSearchKeyword.value = ''
  warehouseSearchKeyword.value = ''
  addConfigForm.value = {
    remark: ''
  }
  addConfigVisible.value = true
}

function handleSelectAllSuppliers(checked: boolean) {
  if (checked) {
    selectedSupplierIds.value = filteredSupplierList.value.map(item => item.supplierId)
  } else {
    selectedSupplierIds.value = []
  }
}

function handleToggleSupplier(item: any) {
  const index = selectedSupplierIds.value.indexOf(item.supplierId)
  if (index > -1) {
    selectedSupplierIds.value.splice(index, 1)
  } else {
    selectedSupplierIds.value.push(item.supplierId)
  }
}

function handleSelectAllWarehouses(checked: boolean) {
  if (checked) {
    selectedWarehouseIds.value = filteredWarehouseList.value.map(item => item.warehouseId)
  } else {
    selectedWarehouseIds.value = []
  }
}

function handleToggleWarehouse(item: any) {
  const index = selectedWarehouseIds.value.indexOf(item.warehouseId)
  if (index > -1) {
    selectedWarehouseIds.value.splice(index, 1)
  } else {
    selectedWarehouseIds.value.push(item.warehouseId)
  }
}

function handleSaveAddConfig() {
  const count = selectedSupplierIds.value.length * selectedWarehouseIds.value.length
  Message.success(`成功创建 ${count} 条供应商工程仓配置关系`)
  addConfigVisible.value = false
}

function handleEditConfig(record: any) {
  currentEditItem.value = record
  selectedIds.value = []
  selectorKeyword.value = ''
  configForm.value = {
    priority: 2,
    settlementCycle: 'monthly',
    remark: ''
  }
  configVisible.value = true
}

function handleEditWarehouseConfig(record: any) {
  currentEditItem.value = record
  selectedIds.value = []
  selectorKeyword.value = ''
  configForm.value = {
    priority: 2,
    settlementCycle: 'monthly',
    remark: ''
  }
  configVisible.value = true
}

function handleSelectAll(checked: boolean) {
  if (checked) {
    selectedIds.value = filteredSelectorList.value.map(item => item.id)
  } else {
    selectedIds.value = []
  }
}

function handleToggleItem(item: any) {
  const index = selectedIds.value.indexOf(item.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(item.id)
  }
}

function handleSaveConfig() {
  if (selectedIds.value.length === 0) {
    Message.warning('请至少选择一个' + (viewMode.value === 'supplier' ? '工程仓' : '供应商'))
    return
  }
  Message.success(`已成功配置 ${selectedIds.value.length} 个${viewMode.value === 'supplier' ? '工程仓' : '供应商'}`)
  configVisible.value = false
}

function handleViewWarehouses(record: any) {
  currentEditItem.value = record
  detailVisible.value = true
}

function handleViewSuppliers(record: any) {
  currentEditItem.value = record
  detailVisible.value = true
}

function handleAddToDetail() {
  detailVisible.value = false
  configVisible.value = true
  selectedIds.value = []
}

function handleEditDetail(record: any) {
  editDetailForm.value = {
    priority: record.priority,
    settlementCycle: record.settlementCycle,
    statusActive: record.status === 'active',
    remark: record.remark || ''
  }
  editDetailVisible.value = true
}

function handleSaveDetail() {
  Message.success('配置已保存')
  editDetailVisible.value = false
}

function handleDeleteDetail(record: any) {
  Message.success(`已删除配置：${record.name}`)
}

</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.step-content {
  .step-header {
    margin-bottom: 16px;
  }

  .step-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);

    .selected-info {
      color: var(--color-text-2);
      
      strong {
        color: rgb(var(--primary-6));
        font-size: 16px;
      }
    }
  }
}

.selector-area {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  
  .list-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: var(--color-fill-2);
    border-bottom: 1px solid var(--color-border);
    font-size: 13px;
    color: var(--color-text-2);
    
    .col-id { width: 100px; margin-left: 12px; }
    .col-name { flex: 1; }
    .col-contact { width: 100px; }
    .col-phone { width: 130px; }
  }
  
  .list-body {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .list-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: var(--color-fill-1);
    }
    
    &.is-selected {
      background: rgb(var(--primary-1));
    }
    
    .col-id { width: 100px; margin-left: 12px; color: var(--color-text-3); }
    .col-name { flex: 1; }
    .col-contact { width: 100px; color: var(--color-text-2); }
    .col-phone { width: 130px; color: var(--color-text-3); }
  }
}

.config-summary {
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
  
  .summary-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.highlight {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
      
      .label, .value {
        color: rgb(var(--primary-6));
        font-weight: 500;
      }
    }
    
    .label {
      color: var(--color-text-2);
      margin-right: 8px;
    }
    
    .value {
      font-weight: 500;
    }
  }
}

.config-form {
  .form-section {
    margin-bottom: 16px;
    
    .section-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--color-text-1);
    }
  }
}

.selector-filter {
  padding: 12px;
  background: var(--color-fill-1);
  border-bottom: 1px solid var(--color-border);
}

.selected-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-fill-1);
  border-radius: 4px;
  
  strong {
    color: rgb(var(--primary-6));
  }
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
