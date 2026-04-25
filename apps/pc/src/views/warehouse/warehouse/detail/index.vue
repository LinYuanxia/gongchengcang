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
      
      <a-descriptions :column="4" bordered size="small">
        <a-descriptions-item label="负责人">{{ warehouseInfo.managerName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ warehouseInfo.phone }}</a-descriptions-item>
        <a-descriptions-item label="仓库标签">
          <a-space>
            <a-tag v-for="tag in warehouseInfo.tags" :key="tag" color="arcoblue" size="small">
              {{ tag }}
            </a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="仓库地址" :span="2">{{ warehouseInfo.address }}</a-descriptions-item>
      </a-descriptions>
    </a-page-header>

    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="SPU数量" :value="stockStats.spuCount" suffix="个">
            <template #prefix><icon-tag /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="SKU数量" :value="stockStats.skuCount" suffix="个">
            <template #prefix><icon-apps /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存总量" :value="stockStats.totalQuantity" suffix="件">
            <template #prefix><icon-storage /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="库存价值" :value="stockStats.totalValue" :precision="0" prefix="¥">
            <template #prefix><icon-safe /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false" title="SKU库存列表">
      <template #extra>
        <a-space>
          <a-input-search
            v-model="searchForm.spuKeyword"
            placeholder="搜索所属SPU"
            style="width: 180px"
            @search="handleSearch"
          />
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/编码"
            style="width: 180px"
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
          <a-table-column title="SKU 商品信息" :width="260">
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
          <a-table-column title="所属SPU" :width="150">
            <template #cell="{ record }">
              <a-tag size="small">{{ record.spuCode }}</a-tag>
              <div class="sub-text" style="margin-top: 4px">{{ record.spuName }}</div>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="库存数量" :width="160" align="right">
            <template #cell="{ record }">
              <div class="stock-info">
                <span class="stock-main">{{ record.quantity }} {{ record.unit }}</span>
                <div class="stock-detail">
                  可用: {{ record.availableQty }} | 锁定: {{ record.lockedQty }}
                </div>
              </div>
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
          <a-table-column title="更新时间" data-index="updatedAt" :width="140" />
          <a-table-column title="批次" :width="80" align="center">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewBatches(record)">
                {{ record.batches?.length || 0 }} 批
              </a-button>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleViewRecord(record)">查看详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

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
  managerName: '张三',
  phone: '13800138001',
  address: '广东省深圳市南山区科技园南区',
  tags: ['重点项目', '大型仓库'],
})

const stockStats = reactive({
  spuCount: 8,
  skuCount: 13,
  totalQuantity: 4580,
  totalValue: 328500,
})

const searchForm = reactive({
  keyword: '',
  spuKeyword: '',
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
  {
    id: 'wp7',
    skuId: 'sku7',
    skuCode: 'SKU-SN-002',
    skuName: '水泥 P.O 52.5',
    categoryName: '水泥',
    spec: '50kg/袋 高强度',
    mainImage: 'https://picsum.photos/200/200?random=7',
    unit: '吨',
    quantity: 320,
    availableQty: 300,
    lockedQty: 20,
    safetyStock: 100,
    purchasePrice: 420,
    location: 'A-01-02',
    updatedAt: '2024-03-24 10:30',
    batches: [],
  },
  {
    id: 'wp8',
    skuId: 'sku8',
    skuCode: 'SKU-SN-003',
    skuName: '水泥 P.C 32.5',
    categoryName: '水泥',
    spec: '50kg/袋 复合',
    mainImage: 'https://picsum.photos/200/200?random=8',
    unit: '吨',
    quantity: 180,
    availableQty: 170,
    lockedQty: 10,
    safetyStock: 80,
    purchasePrice: 320,
    location: 'A-01-03',
    updatedAt: '2024-03-24 11:00',
    batches: [],
  },
  {
    id: 'wp9',
    skuId: 'sku9',
    skuCode: 'SKU-LG-002',
    skuName: '螺纹钢 HRB400 12mm',
    categoryName: '钢材',
    spec: '12mm',
    mainImage: 'https://picsum.photos/200/200?random=9',
    unit: '吨',
    quantity: 120,
    availableQty: 115,
    lockedQty: 5,
    safetyStock: 100,
    purchasePrice: 3100,
    location: 'B-02-02',
    updatedAt: '2024-03-24 09:00',
    batches: [],
  },
  {
    id: 'wp10',
    skuId: 'sku10',
    skuCode: 'SKU-LG-003',
    skuName: '螺纹钢 HRB400 20mm',
    categoryName: '钢材',
    spec: '20mm',
    mainImage: 'https://picsum.photos/200/200?random=10',
    unit: '吨',
    quantity: 95,
    availableQty: 90,
    lockedQty: 5,
    safetyStock: 100,
    purchasePrice: 3300,
    location: 'B-02-03',
    updatedAt: '2024-03-24 08:30',
    batches: [],
  },
  {
    id: 'wp11',
    skuId: 'sku11',
    skuCode: 'SKU-LG-004',
    skuName: '螺纹钢 HRB400 25mm',
    categoryName: '钢材',
    spec: '25mm',
    mainImage: 'https://picsum.photos/200/200?random=11',
    unit: '吨',
    quantity: 65,
    availableQty: 62,
    lockedQty: 3,
    safetyStock: 80,
    purchasePrice: 3400,
    location: 'B-02-04',
    updatedAt: '2024-03-24 08:00',
    batches: [],
  },
  {
    id: 'wp12',
    skuId: 'sku12',
    skuCode: 'SKU-HS-002',
    skuName: '黄砂 细砂',
    categoryName: '砂石',
    spec: '细砂',
    mainImage: 'https://picsum.photos/200/200?random=12',
    unit: '方',
    quantity: 280,
    availableQty: 265,
    lockedQty: 15,
    safetyStock: 200,
    purchasePrice: 105,
    location: 'C-01-02',
    updatedAt: '2024-03-23 15:00',
    batches: [],
  },
  {
    id: 'wp13',
    skuId: 'sku13',
    skuCode: 'SKU-HS-003',
    skuName: '黄砂 粗砂',
    categoryName: '砂石',
    spec: '粗砂',
    mainImage: 'https://picsum.photos/200/200?random=13',
    unit: '方',
    quantity: 320,
    availableQty: 300,
    lockedQty: 20,
    safetyStock: 200,
    purchasePrice: 90,
    location: 'C-01-03',
    updatedAt: '2024-03-23 15:30',
    batches: [],
  },
])

mockProducts.value.forEach(sku => {
  const spuName = sku.skuName.split(' ')[0] || sku.skuName
  sku.spuName = spuName
  sku.spuCode = `SPU-${spuName.toUpperCase().slice(0, 5)}`
})

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
  
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(p => 
      p.skuName.toLowerCase().includes(keyword) ||
      p.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  if (searchForm.spuKeyword) {
    const keyword = searchForm.spuKeyword.toLowerCase()
    result = result.filter(p => 
      p.spuName?.toLowerCase().includes(keyword) ||
      p.spuCode?.toLowerCase().includes(keyword)
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

const currentProduct = ref<any>(null)

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
        router.push('/warehouse/warehouse/check')
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
  router.push(`/warehouse/product/sku-detail/${record.skuId || record.id}`)
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

.spec-list {
  .spec-item {
    display: inline-block;
    padding: 0 6px;
    margin: 2px 4px 2px 0;
    background: var(--color-fill-2);
    border-radius: 4px;
    font-size: 12px;
  }
  
  .more-spec {
    cursor: pointer;
    color: var(--color-primary-6);
    font-size: 12px;
  }
}

:deep(.arco-tabs-header-title) {
  padding: 4px 16px;
  font-size: 13px;
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

.batch-select {
  .no-batch {
    color: var(--color-text-3);
    font-size: 13px;
    padding: 12px 0;
  }
}
</style>