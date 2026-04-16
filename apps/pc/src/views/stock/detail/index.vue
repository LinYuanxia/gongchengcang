<template>
  <div class="page-container">
    <a-page-header
      :title="warehouseInfo.name"
      :subtitle="warehouseInfo.code"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出库存
          </a-button>
          <a-button type="primary" @click="handleTransfer">
            <template #icon><icon-swap /></template>
            发起调拨
          </a-button>
        </a-space>
      </template>
      
      <a-descriptions :column="6" bordered size="small">
        <a-descriptions-item label="所属主体">
          <span class="subject-name">{{ warehouseInfo.subjectName }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="仓库类型">
          <a-tag :color="warehouseInfo.type === 'main' ? 'blue' : 'green'">
            {{ warehouseInfo.type === 'main' ? '主仓' : '分仓' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="负责人">{{ warehouseInfo.managerName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ warehouseInfo.phone }}</a-descriptions-item>
        <a-descriptions-item label="仓库地址" :span="2">{{ warehouseInfo.address }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge :status="warehouseInfo.status === 'active' ? 'success' : 'danger'" :text="warehouseInfo.status === 'active' ? '正常' : '停用'" />
        </a-descriptions-item>
      </a-descriptions>
    </a-page-header>

    <a-row :gutter="16" class="stat-row">
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="商品种类" :value="stockStats.productCount" suffix="种">
            <template #prefix><icon-apps /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存总量" :value="stockStats.totalQuantity" suffix="件">
            <template #prefix><icon-storage /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存价值" :value="stockStats.totalValue" :precision="2" prefix="¥">
            <template #prefix><icon-safe /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="可用库存" :value="stockStats.availableQuantity" suffix="件" />
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card warning-card">
          <a-statistic title="预警商品" :value="stockStats.warningCount" suffix="种" />
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card :bordered="false" class="stat-card danger-card">
          <a-statistic title="缺货商品" :value="stockStats.outOfStockCount" suffix="种" />
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <template #title>
        <a-tabs v-model:active-key="currentTab" @change="handleTabChange">
          <a-tab-pane key="all" title="全部商品" />
          <a-tab-pane key="warning">
            <template #title>
              <span>预警商品</span>
              <a-badge v-if="stockStats.warningCount > 0" :count="stockStats.warningCount" />
            </template>
          </a-tab-pane>
          <a-tab-pane key="out">
            <template #title>
              <span>缺货商品</span>
              <a-badge v-if="stockStats.outOfStockCount > 0" :count="stockStats.outOfStockCount" :dot-style="{ background: '#F53F3F' }" />
            </template>
          </a-tab-pane>
        </a-tabs>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/编码"
            style="width: 220px"
            @search="handleSearch"
          />
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 150px"
            allow-clear
            :field-names="{ value: 'id', label: 'name', children: 'children' }"
            @change="handleSearch"
          />
        </a-space>
      </template>

      <a-table
        :data="filteredProducts"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="商品信息" :width="260">
            <template #cell="{ record }">
              <div class="product-info">
                <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
                <div class="product-detail">
                  <div class="product-name">{{ record.skuName }}</div>
                  <div class="product-code">{{ record.skuCode }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="库存数量" :width="140">
            <template #cell="{ record }">
              <div class="stock-info">
                <span :class="getStockClass(record)">{{ record.quantity }} {{ record.unit }}</span>
                <div class="stock-detail">
                  可用: {{ record.availableQty }} | 锁定: {{ record.lockedQty }}
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="安全库存" :width="100">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleSetSafetyStock(record)">
                {{ record.safetyStock }} {{ record.unit }}
              </a-button>
            </template>
          </a-table-column>
          <a-table-column title="库存状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="getStockStatusColor(record)">
                {{ getStockStatusText(record) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="采购价" :width="100">
            <template #cell="{ record }">
              <span class="price">¥{{ record.purchasePrice.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="库存价值" :width="120">
            <template #cell="{ record }">
              <span class="price">¥{{ (record.quantity * record.purchasePrice).toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="库位" :width="80">
            <template #cell="{ record }">
              {{ record.location || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updatedAt" :width="140" />
          <a-table-column title="批次" :width="80" align="center">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewBatches(record)">
                {{ record.batches?.length || 0 }} 批
              </a-button>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleStockIn(record)">入库</a-button>
                <a-button type="text" size="small" @click="handleStockOut(record)">出库</a-button>
                <a-button type="text" size="small" @click="handleViewRecord(record)">记录</a-button>
                <a-button type="text" size="small" @click="handleAdjustStock(record)">调整</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="safetyStockVisible"
      title="设置安全库存"
      :width="400"
      @ok="handleSafetyStockConfirm"
    >
      <a-form :model="safetyStockForm" layout="vertical">
        <a-descriptions :column="1" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="商品名称">{{ currentProduct?.skuName }}</a-descriptions-item>
          <a-descriptions-item label="当前库存">{{ currentProduct?.quantity }} {{ currentProduct?.unit }}</a-descriptions-item>
        </a-descriptions>
        <a-form-item label="安全库存" required>
          <a-input-number v-model="safetyStockForm.safetyStock" :min="0" style="width: 100%">
            <template #suffix>{{ currentProduct?.unit }}</template>
          </a-input-number>
          <div class="form-tip">当库存低于安全库存时，系统将发出预警提醒</div>
        </a-form-item>
        <a-form-item label="库位">
          <a-input v-model="safetyStockForm.location" placeholder="请输入库位" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="adjustStockVisible"
      title="库存调整"
      :width="500"
      @ok="handleAdjustStockConfirm"
    >
      <a-form :model="adjustStockForm" layout="vertical">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="商品名称">{{ currentProduct?.skuName }}</a-descriptions-item>
          <a-descriptions-item label="当前库存">{{ currentProduct?.quantity }} {{ currentProduct?.unit }}</a-descriptions-item>
        </a-descriptions>
        <a-form-item label="调整类型" required>
          <a-radio-group v-model="adjustStockForm.type">
            <a-radio value="in">入库</a-radio>
            <a-radio value="out">出库</a-radio>
            <a-radio value="adjust">盘点调整</a-radio>
          </a-radio-group>
          <div v-if="adjustStockForm.type === 'adjust'" class="form-tip" style="color: var(--color-warning); margin-top: 8px">
            <icon-exclamation-circle /> 盘点调整需要创建盘点单进行审核
          </div>
        </a-form-item>
        <a-form-item label="调整数量" required>
          <a-input-number v-model="adjustStockForm.quantity" :min="1" style="width: 100%">
            <template #suffix>{{ currentProduct?.unit }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="调整原因" required>
          <a-textarea v-model="adjustStockForm.reason" placeholder="请输入调整原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="stockInVisible"
      title="商品入库"
      :width="500"
      @ok="handleStockInConfirm"
    >
      <a-form :model="stockInForm" layout="vertical">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="商品名称">{{ currentProduct?.skuName }}</a-descriptions-item>
          <a-descriptions-item label="当前库存">{{ currentProduct?.quantity }} {{ currentProduct?.unit }}</a-descriptions-item>
        </a-descriptions>
        <a-form-item label="入库数量" required>
          <a-input-number v-model="stockInForm.quantity" :min="1" style="width: 100%">
            <template #suffix>{{ currentProduct?.unit }}</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="批次批注" required>
          <a-input v-model="stockInForm.batchNote" placeholder="如：中等材质、优质品、特价款等" />
          <div class="form-tip">批注用于区分不同批次的商品，方便后续出库时选择</div>
        </a-form-item>
        <a-form-item label="入库日期">
          <a-date-picker v-model="stockInForm.inDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="stockInForm.remark" placeholder="请输入备注信息" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="stockOutVisible"
      title="商品出库"
      :width="600"
      @ok="handleStockOutConfirm"
    >
      <a-form :model="stockOutForm" layout="vertical">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="商品名称">{{ currentProduct?.skuName }}</a-descriptions-item>
          <a-descriptions-item label="可用库存">{{ currentProduct?.availableQty }} {{ currentProduct?.unit }}</a-descriptions-item>
        </a-descriptions>
        <a-form-item label="选择批次" required>
          <div class="batch-select">
            <div v-if="!currentProduct?.batches?.length" class="no-batch">
              暂无批次记录，请直接输入出库数量
            </div>
            <a-table v-else :data="currentProduct?.batches" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="入库日期" data-index="inDate" :width="100" />
                <a-table-column title="批注" data-index="note" :width="120">
                  <template #cell="{ record }">
                    <a-tag color="arcoblue">{{ record.note }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="可用数量" :width="100">
                  <template #cell="{ record }">
                    {{ record.availableQty }} {{ currentProduct?.unit }}
                  </template>
                </a-table-column>
                <a-table-column title="出库数量" :width="120">
                  <template #cell="{ record }">
                    <a-input-number 
                      v-model="stockOutForm.batchQuantities[record.id]"
                      :min="0"
                      :max="record.availableQty"
                      size="small"
                    />
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </a-form-item>
        <a-form-item label="出库数量">
          <a-input-number v-model="stockOutForm.quantity" :min="1" :max="currentProduct?.availableQty" style="width: 100%">
            <template #suffix>{{ currentProduct?.unit }}</template>
          </a-input-number>
          <div class="form-tip">可手动输入总出库数量，或从上方批次中选择</div>
        </a-form-item>
        <a-form-item label="出库原因" required>
          <a-textarea v-model="stockOutForm.reason" placeholder="请输入出库原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="batchVisible"
      :title="`${currentProduct?.skuName || ''} - 批次记录`"
      :width="700"
      :footer="false"
    >
      <a-table :data="currentProduct?.batches || []" :pagination="false">
        <template #columns>
          <a-table-column title="批次编号" :width="100">
            <template #cell="{ record }">
              {{ record.batchNo }}
            </template>
          </a-table-column>
          <a-table-column title="入库日期" data-index="inDate" :width="100" />
          <a-table-column title="批注" :width="120">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.note }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="入库数量" :width="100">
            <template #cell="{ record }">
              {{ record.quantity }} {{ currentProduct?.unit }}
            </template>
          </a-table-column>
          <a-table-column title="已出库" :width="80">
            <template #cell="{ record }">
              {{ record.outQty }} {{ currentProduct?.unit }}
            </template>
          </a-table-column>
          <a-table-column title="可用数量" :width="100">
            <template #cell="{ record }">
              <span :class="record.availableQty === 0 ? 'text-danger' : ''">
                {{ record.availableQty }} {{ currentProduct?.unit }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.availableQty > 0 ? 'green' : 'gray'">
                {{ record.availableQty > 0 ? '可用' : '已用完' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="120">
            <template #cell="{ record }">
              {{ record.remark || '-' }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="recordVisible"
      :title="`${currentProduct?.skuName || ''} - 库存记录`"
      :width="800"
      :footer="false"
    >
      <a-table :data="stockRecords" :pagination="{ pageSize: 10 }">
        <template #columns>
          <a-table-column title="时间" :width="160">
            <template #cell="{ record }">
              {{ record.createdAt }}
            </template>
          </a-table-column>
          <a-table-column title="类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'in' ? 'green' : record.type === 'out' ? 'red' : 'blue'">
                {{ record.type === 'in' ? '入库' : record.type === 'out' ? '出库' : '调整' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="数量变化" :width="120">
            <template #cell="{ record }">
              <span :class="record.type === 'in' ? 'text-success' : 'text-danger'">
                {{ record.type === 'in' ? '+' : '-' }}{{ record.quantity }} {{ record.unit }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="变更前" :width="100">
            <template #cell="{ record }">
              {{ record.beforeQty }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="变更后" :width="100">
            <template #cell="{ record }">
              {{ record.afterQty }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="关联单号" :width="140">
            <template #cell="{ record }">
              <a-link v-if="record.orderNo">{{ record.orderNo }}</a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="150">
            <template #cell="{ record }">
              {{ record.remark || '-' }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="transferModalVisible"
      title="发起调拨"
      :width="600"
      @ok="handleTransferConfirm"
    >
      <a-form :model="transferForm" layout="vertical">
        <a-form-item label="调出仓库">
          <a-input :model-value="warehouseInfo.name" disabled />
        </a-form-item>
        <a-form-item label="调入仓库" required>
          <a-select v-model="transferForm.targetWarehouseId" placeholder="请选择调入仓库">
            <a-option v-for="w in otherWarehouses" :key="w.id" :value="w.id">
              {{ w.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调拨商品">
          <a-alert v-if="selectedProducts.length === 0" type="info">
            请在商品列表中勾选需要调拨的商品
          </a-alert>
          <a-table v-else :data="selectedProducts" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="商品名称" data-index="skuName" :width="150" />
              <a-table-column title="可用库存" :width="100">
                <template #cell="{ record }">
                  {{ record.availableQty }} {{ record.unit }}
                </template>
              </a-table-column>
              <a-table-column title="调拨数量" :width="120">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="transferForm.quantities[record.id]"
                    :min="1"
                    :max="record.availableQty"
                    size="small"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>
        <a-form-item label="调拨原因" required>
          <a-textarea v-model="transferForm.reason" placeholder="请输入调拨原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const warehouseId = route.query.id as string

const warehouseInfo = ref({
  id: warehouseId,
  name: '深圳湾科技园项目仓',
  code: 'WH001',
  type: 'main',
  subjectName: '深圳湾科技园工程仓',
  managerName: '张三',
  phone: '13800138001',
  address: '广东省深圳市南山区科技园南区',
  status: 'active',
})

const stockStats = reactive({
  productCount: 156,
  totalQuantity: 4580,
  totalValue: 328500.00,
  availableQuantity: 4200,
  warningCount: 5,
  outOfStockCount: 1,
})

const currentTab = ref('all')

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const selectedKeys = ref<string[]>([])

const categoryTree = ref([
  {
    id: 'c1',
    name: '钢材',
    children: [
      { id: 'c1-1', name: '螺纹钢' },
      { id: 'c1-2', name: '线材' },
    ],
  },
  { id: 'c2', name: '水泥' },
  { id: 'c3', name: '砂石' },
  { id: 'c4', name: '混凝土' },
  { id: 'c5', name: '装饰材料' },
])

const mockProducts = ref([
  {
    id: 'wp1',
    skuId: 'sku1',
    skuCode: 'SKU-SN-001',
    skuName: '水泥 P.O 42.5',
    categoryName: '水泥',
    spec: '50kg/袋',
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    quantity: 500,
    availableQty: 480,
    lockedQty: 20,
    safetyStock: 100,
    purchasePrice: 380,
    location: 'A-01-01',
    updatedAt: '2024-03-24 10:00',
    batches: [
      { id: 'b1', batchNo: 'PC-0319-001', inDate: '2024-03-19', note: '优质品', quantity: 300, outQty: 50, availableQty: 250, remark: '供应商A' },
      { id: 'b2', batchNo: 'PC-0320-001', inDate: '2024-03-20', note: '中等材质', quantity: 200, outQty: 0, availableQty: 200, remark: '供应商B' },
    ],
  },
  {
    id: 'wp2',
    skuId: 'sku2',
    skuCode: 'SKU-LG-001',
    skuName: '螺纹钢 HRB400 16mm',
    categoryName: '钢材',
    spec: '16mm',
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    quantity: 80,
    availableQty: 75,
    lockedQty: 5,
    safetyStock: 100,
    purchasePrice: 3200,
    location: 'B-02-01',
    updatedAt: '2024-03-24 09:30',
    batches: [
      { id: 'b3', batchNo: 'LG-0315-001', inDate: '2024-03-15', note: '国标', quantity: 80, outQty: 5, availableQty: 75, remark: '' },
    ],
  },
  {
    id: 'wp3',
    skuId: 'sku3',
    skuCode: 'SKU-HS-001',
    skuName: '黄砂 中砂',
    categoryName: '砂石',
    spec: '中砂',
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '方',
    quantity: 50,
    availableQty: 45,
    lockedQty: 5,
    safetyStock: 200,
    purchasePrice: 95,
    location: 'C-01-01',
    updatedAt: '2024-03-23 16:00',
    batches: [],
  },
  {
    id: 'wp4',
    skuId: 'sku4',
    skuCode: 'SKU-HNT-001',
    skuName: '商品混凝土 C30',
    categoryName: '混凝土',
    spec: 'C30',
    mainImage: 'https://picsum.photos/200/200?random=4',
    unit: '方',
    quantity: 0,
    availableQty: 0,
    lockedQty: 0,
    safetyStock: 50,
    purchasePrice: 350,
    location: 'D-01-01',
    updatedAt: '2024-03-23 14:00',
    batches: [],
  },
  {
    id: 'wp5',
    skuId: 'sku5',
    skuCode: 'SKU-FS-001',
    skuName: '防水涂料',
    categoryName: '装饰材料',
    spec: '20kg/桶',
    mainImage: 'https://picsum.photos/200/200?random=5',
    unit: '桶',
    quantity: 150,
    availableQty: 140,
    lockedQty: 10,
    safetyStock: 50,
    purchasePrice: 380,
    location: 'E-01-01',
    updatedAt: '2024-03-22 10:00',
    batches: [
      { id: 'b4', batchNo: 'FS-0318-001', inDate: '2024-03-18', note: '品牌A', quantity: 100, outQty: 10, availableQty: 90, remark: '' },
      { id: 'b5', batchNo: 'FS-0321-001', inDate: '2024-03-21', note: '品牌B', quantity: 50, outQty: 0, availableQty: 50, remark: '特价款' },
    ],
  },
  {
    id: 'wp6',
    skuId: 'sku6',
    skuCode: 'SKU-SS-001',
    skuName: '碎石 5-31.5mm',
    categoryName: '砂石',
    spec: '5-31.5mm',
    mainImage: 'https://picsum.photos/200/200?random=6',
    unit: '方',
    quantity: 600,
    availableQty: 550,
    lockedQty: 50,
    safetyStock: 300,
    purchasePrice: 85,
    location: 'F-01-01',
    updatedAt: '2024-03-24 11:00',
    batches: [],
  },
])

const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  },
}))

const filteredProducts = computed(() => {
  let result = mockProducts.value
  
  if (currentTab.value === 'warning') {
    result = result.filter(p => p.quantity > 0 && p.quantity < p.safetyStock)
  } else if (currentTab.value === 'out') {
    result = result.filter(p => p.quantity === 0)
  }
  
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(keyword) ||
      p.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  pagination.total = result.length
  return result
})

const selectedProducts = computed(() => {
  return mockProducts.value.filter(p => selectedKeys.value.includes(p.id))
})

const otherWarehouses = ref([
  { id: 'w2', name: '福田CBD项目仓' },
  { id: 'w3', name: '宝安新安项目仓' },
  { id: 'w4', name: '龙岗中心城项目仓' },
  { id: 'w5', name: '南山科技园项目仓' },
])

const safetyStockVisible = ref(false)
const currentProduct = ref<any>(null)
const safetyStockForm = reactive({
  safetyStock: 0,
  location: '',
})

const adjustStockVisible = ref(false)
const adjustStockForm = reactive({
  type: 'in',
  quantity: 1,
  reason: '',
})

const stockInVisible = ref(false)
const stockInForm = reactive({
  quantity: 1,
  batchNote: '',
  inDate: '',
  remark: '',
})

const stockOutVisible = ref(false)
const stockOutForm = reactive({
  quantity: 0,
  reason: '',
  batchQuantities: {} as Record<string, number>,
})

const batchVisible = ref(false)

const recordVisible = ref(false)
const stockRecords = ref<any[]>([])

const transferModalVisible = ref(false)
const transferForm = reactive({
  targetWarehouseId: '',
  quantities: {} as Record<string, number>,
  reason: '',
})

function handleBack() {
  router.back()
}

function handleTabChange() {
  pagination.current = 1
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleExport() {
  Message.success('导出功能开发中')
}

function handleTransfer() {
  transferForm.targetWarehouseId = ''
  transferForm.quantities = {}
  transferForm.reason = ''
  if (selectedProducts.value.length > 0) {
    selectedProducts.value.forEach(p => {
      transferForm.quantities[p.id] = p.availableQty
    })
  }
  transferModalVisible.value = true
}

function handleTransferConfirm() {
  if (!transferForm.targetWarehouseId) {
    Message.warning('请选择调入仓库')
    return
  }
  if (selectedProducts.value.length === 0) {
    Message.warning('请选择要调拨的商品')
    return
  }
  if (!transferForm.reason.trim()) {
    Message.warning('请输入调拨原因')
    return
  }
  Message.success('调拨申请已提交')
  transferModalVisible.value = false
  selectedKeys.value = []
}

function handleSetSafetyStock(record: any) {
  currentProduct.value = record
  safetyStockForm.safetyStock = record.safetyStock
  safetyStockForm.location = record.location || ''
  safetyStockVisible.value = true
}

function handleSafetyStockConfirm() {
  if (currentProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === currentProduct.value.id)
    if (index > -1) {
      mockProducts.value[index].safetyStock = safetyStockForm.safetyStock
      mockProducts.value[index].location = safetyStockForm.location
    }
    Message.success('安全库存设置成功')
  }
  safetyStockVisible.value = false
}

function handleAdjustStock(record: any) {
  currentProduct.value = record
  adjustStockForm.type = 'in'
  adjustStockForm.quantity = 1
  adjustStockForm.reason = ''
  adjustStockVisible.value = true
}

function handleAdjustStockConfirm() {
  if (adjustStockForm.type === 'adjust') {
    Modal.confirm({
      title: '提示',
      content: '盘点调整需要创建盘点单进行审核，是否前往创建盘点单？',
      okText: '前往创建',
      cancelText: '取消',
      onOk: () => {
        router.push('/stock/check')
      },
    })
    return
  }
  if (!adjustStockForm.reason.trim()) {
    Message.warning('请输入调整原因')
    return
  }
  if (currentProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === currentProduct.value.id)
    if (index > -1) {
      if (adjustStockForm.type === 'in') {
        mockProducts.value[index].quantity += adjustStockForm.quantity
        mockProducts.value[index].availableQty += adjustStockForm.quantity
      } else if (adjustStockForm.type === 'out') {
        mockProducts.value[index].quantity -= adjustStockForm.quantity
        mockProducts.value[index].availableQty -= adjustStockForm.quantity
      }
    }
    Message.success('库存调整成功')
  }
  adjustStockVisible.value = false
}

function handleViewRecord(record: any) {
  currentProduct.value = record
  stockRecords.value = [
    {
      id: 'r1',
      type: 'out',
      quantity: 20,
      unit: record.unit,
      beforeQty: record.quantity + 20,
      afterQty: record.quantity,
      orderNo: 'SO202403240001',
      remark: '销售出库',
      createdAt: '2024-03-24 14:00:00',
    },
    {
      id: 'r2',
      type: 'in',
      quantity: 50,
      unit: record.unit,
      beforeQty: record.quantity - 30,
      afterQty: record.quantity + 20,
      orderNo: 'PO202403240001',
      remark: '采购入库',
      createdAt: '2024-03-24 10:00:00',
    },
  ]
  recordVisible.value = true
}

function handleStockIn(record: any) {
  currentProduct.value = record
  stockInForm.quantity = 1
  stockInForm.batchNote = ''
  stockInForm.inDate = new Date().toISOString().split('T')[0]
  stockInForm.remark = ''
  stockInVisible.value = true
}

function handleStockInConfirm() {
  if (!stockInForm.batchNote.trim()) {
    Message.warning('请输入批次批注')
    return
  }
  if (currentProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === currentProduct.value.id)
    if (index > -1) {
      const batchNo = `${currentProduct.value.skuCode.split('-')[1]}-${stockInForm.inDate.replace(/-/g, '').slice(4)}-${String((currentProduct.value.batches?.length || 0) + 1).padStart(3, '0')}`
      const newBatch = {
        id: `b${Date.now()}`,
        batchNo,
        inDate: stockInForm.inDate,
        note: stockInForm.batchNote,
        quantity: stockInForm.quantity,
        outQty: 0,
        availableQty: stockInForm.quantity,
        remark: stockInForm.remark,
      }
      if (!mockProducts.value[index].batches) {
        mockProducts.value[index].batches = []
      }
      mockProducts.value[index].batches.push(newBatch)
      mockProducts.value[index].quantity += stockInForm.quantity
      mockProducts.value[index].availableQty += stockInForm.quantity
    }
    Message.success('入库成功，已创建批次记录')
  }
  stockInVisible.value = false
}

function handleStockOut(record: any) {
  currentProduct.value = record
  stockOutForm.quantity = 0
  stockOutForm.reason = ''
  stockOutForm.batchQuantities = {}
  if (record.batches) {
    record.batches.forEach((b: any) => {
      stockOutForm.batchQuantities[b.id] = 0
    })
  }
  stockOutVisible.value = true
}

function handleStockOutConfirm() {
  if (!stockOutForm.reason.trim()) {
    Message.warning('请输入出库原因')
    return
  }
  
  const batchTotal = Object.values(stockOutForm.batchQuantities).reduce((sum, qty) => sum + (qty as number), 0)
  const totalQty = stockOutForm.quantity || batchTotal
  
  if (totalQty <= 0) {
    Message.warning('请输入出库数量或从批次中选择')
    return
  }
  
  if (currentProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === currentProduct.value.id)
    if (index > -1) {
      if (batchTotal > 0) {
        currentProduct.value.batches.forEach((batch: any) => {
          const outQty = stockOutForm.batchQuantities[batch.id] || 0
          if (outQty > 0) {
            batch.outQty += outQty
            batch.availableQty -= outQty
          }
        })
      }
      mockProducts.value[index].quantity -= totalQty
      mockProducts.value[index].availableQty -= totalQty
    }
    Message.success('出库成功')
  }
  stockOutVisible.value = false
}

function handleViewBatches(record: any) {
  currentProduct.value = record
  batchVisible.value = true
}

function getStockStatusKey(record: any) {
  if (record.quantity === 0) return 'out'
  if (record.quantity < record.safetyStock * 0.3) return 'critical'
  if (record.quantity < record.safetyStock) return 'warning'
  return 'normal'
}

function getStockClass(record: any) {
  const status = getStockStatusKey(record)
  return {
    'stock-normal': status === 'normal',
    'stock-warning': status === 'warning',
    'stock-critical': status === 'critical',
    'stock-out': status === 'out',
  }
}

function getStockStatusColor(record: any) {
  const status = getStockStatusKey(record)
  const colors: Record<string, string> = {
    normal: 'green',
    warning: 'orange',
    critical: 'red',
    out: 'gray',
  }
  return colors[status]
}

function getStockStatusText(record: any) {
  const status = getStockStatusKey(record)
  const texts: Record<string, string> = {
    normal: '正常',
    warning: '预警',
    critical: '紧张',
    out: '缺货',
  }
  return texts[status]
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.stat-row {
  margin: 16px 0;
}

.stat-card {
  :deep(.arco-statistic-title) {
    font-size: 13px;
    color: var(--color-text-2);
  }
  
  :deep(.arco-statistic-value) {
    font-size: 22px;
    font-weight: 600;
  }
}

.warning-card {
  border-left: 3px solid var(--color-warning);
}

.danger-card {
  border-left: 3px solid var(--color-danger);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-detail {
  .product-name {
    font-weight: 500;
    color: var(--color-text-1);
  }
  
  .product-code {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.stock-info {
  .stock-detail {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.stock-normal {
  color: var(--color-text-1);
}

.stock-warning {
  color: var(--color-warning);
  font-weight: 500;
}

.stock-critical {
  color: var(--color-danger);
  font-weight: 500;
}

.stock-out {
  color: var(--color-text-3);
  text-decoration: line-through;
}

.price {
  color: var(--color-danger);
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.text-success {
  color: var(--color-success);
}

.text-danger {
  color: var(--color-danger);
}

.subject-name {
  font-weight: 500;
  color: var(--color-primary);
}

.batch-select {
  .no-batch {
    color: var(--color-text-3);
    font-size: 13px;
    padding: 12px 0;
  }
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}
</style>
