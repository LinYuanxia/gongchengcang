<template>
  <div class="sku-detail">
    <PrdPanel :items="prdModules" />
    <a-page-header title="SKU库存详情" @back="router.back()">
      <template #extra>
        <a-space>
          <a-button @click="goToSpuDetail">查看所属SPU</a-button>
          <a-button @click="router.back()">返回</a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="detail-content">
      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="SKU基本信息">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="SKU编码">{{ skuInfo.skuCode }}</a-descriptions-item>
              <a-descriptions-item label="SKU名称">{{ skuInfo.skuName }}</a-descriptions-item>
              <a-descriptions-item label="所属SPU">
                <a-link @click="goToSpuDetail">{{ skuInfo.spuName }}</a-link>
              </a-descriptions-item>
              <a-descriptions-item label="商品分类">{{ skuInfo.categoryName }}</a-descriptions-item>
              <a-descriptions-item label="规格组合">
                <div class="spec-tags">
                  <a-tag v-for="(value, key) in skuInfo.specs" :key="key" size="small" color="arcoblue">
                    {{ key }}: {{ value }}
                  </a-tag>
                </div>
              </a-descriptions-item>
              <a-descriptions-item label="计量单位">{{ skuInfo.unit }}</a-descriptions-item>
              <a-descriptions-item label="供应商">
                <div class="supplier-tags">
                  <a-tag v-for="s in skuInfo.suppliers" :key="s.id" color="green" size="small">
                    {{ s.name }}
                  </a-tag>
                </div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="库存分布" class="mt-16">
            <template #extra>
              <a-space>
                <a-tag color="green">总库存：{{ skuInfo.totalStock }} 件</a-tag>
                <a-tag color="blue">覆盖 {{ warehouseStock.length }} 个仓库</a-tag>
              </a-space>
            </template>
            <a-table :data="warehouseStock" :pagination="false" bordered>
              <template #columns>
                <a-table-column title="仓库名称" data-index="warehouseName" :width="180" />
                <a-table-column title="库位" data-index="location" :width="120" />
                <a-table-column title="当前库存" :width="120" align="center">
                  <template #cell="{ record }">
                    <span :class="record.stock === 0 ? 'text-danger' : record.stock < 50 ? 'text-warning' : 'text-success'" class="stock-number">
                      {{ record.stock }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="可用库存" :width="120" align="center">
                  <template #cell="{ record }">
                    {{ record.availableStock }}
                  </template>
                </a-table-column>
                <a-table-column title="预占库存" :width="120" align="center">
                  <template #cell="{ record }">
                    <span class="text-warning">{{ record.lockedStock }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="库存状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 'normal' ? 'green' : record.status === 'warning' ? 'orange' : 'red'">
                      {{ record.status === 'normal' ? '正常' : record.status === 'warning' ? '预警' : '短缺' }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="最后更新" data-index="lastUpdate" :width="160" />
              </template>
            </a-table>
          </a-card>

          <a-card title="库存批次明细" class="mt-16">
            <a-table :data="batchDetails" :pagination="pagination" bordered row-key="batchNo">
              <template #columns>
                <a-table-column title="批次号" :width="140">
                  <template #cell="{ record }">
                    <a-tag color="blue">{{ record.batchNo }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="所在仓库" data-index="warehouseName" :width="150" />
                <a-table-column title="来源供应商" data-index="supplierName" :width="150" />
                <a-table-column title="来源采购单" :width="150">
                  <template #cell="{ record }">
                    <a-link>{{ record.purchaseOrderNo }}</a-link>
                  </template>
                </a-table-column>
                <a-table-column title="入库日期" data-index="inboundDate" :width="120" />
                <a-table-column title="入库数量" :width="100" align="right" />
                <a-table-column title="当前库存" :width="100" align="right">
                  <template #cell="{ record }">
                    <strong>{{ record.currentStock }}</strong>
                  </template>
                </a-table-column>
                <a-table-column title="操作人" data-index="operator" :width="100" />
                <a-table-column title="批次备注" data-index="remark" :width="200" ellipsis />
              </template>
            </a-table>
          </a-card>

          <a-card title="出入库流水" class="mt-16">
            <a-table :data="stockRecords" :pagination="false" bordered size="small">
              <template #columns>
                <a-table-column title="流水号" data-index="recordNo" :width="160" />
                <a-table-column title="类型" :width="80">
                  <template #cell="{ record }">
                    <a-tag :color="record.type === 'in' ? 'green' : 'red'">
                      {{ record.type === 'in' ? '入库' : '出库' }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="仓库" data-index="warehouseName" :width="130" />
                <a-table-column title="数量" :width="80" align="right">
                  <template #cell="{ record }">
                    <span :class="record.type === 'in' ? 'text-success' : 'text-danger'">
                      {{ record.type === 'in' ? '+' : '-' }}{{ record.quantity }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="操作前库存" :width="100" align="right" />
                <a-table-column title="操作后库存" :width="100" align="right" />
                <a-table-column title="关联单据" data-index="relatedOrder" :width="140" />
                <a-table-column title="操作人" data-index="operator" :width="100" />
                <a-table-column title="操作时间" data-index="operateTime" :width="160" />
              </template>
            </a-table>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card title="商品图片">
            <a-image :src="skuInfo.mainImage" width="100%" height="200px" fit="cover" />
          </a-card>

          <a-card title="库存统计" class="mt-16">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic title="总库存" :value="skuInfo.totalStock" suffix="件">
                  <template #prefix><icon-storage /></template>
                </a-statistic>
              </a-col>
              <a-col :span="12">
                <a-statistic title="可用库存" :value="skuInfo.availableStock" suffix="件" />
              </a-col>
            </a-row>
            <a-divider />
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic title="预占库存" :value="skuInfo.lockedStock" suffix="件">
                  <template #value>
                    <span style="color: var(--color-warning-6)">{{ skuInfo.lockedStock }}</span>
                  </template>
                </a-statistic>
              </a-col>
              <a-col :span="12">
                <a-statistic title="入库批次" :value="batchDetails.length" suffix="批" />
              </a-col>
            </a-row>
          </a-card>

          <a-card title="供应商供货记录" class="mt-16">
            <template #extra>
              <a-tag color="green">共 {{ supplierList.length }} 家供应商</a-tag>
            </template>
            <a-table :data="supplierList" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="供应商名称" :width="150">
                  <template #cell="{ record }">
                    <a-link size="small">{{ record.name }}</a-link>
                  </template>
                </a-table-column>
                <a-table-column title="累计供货" :width="100" align="right">
                  <template #cell="{ record }">
                    {{ record.totalSupplyQty }}
                  </template>
                </a-table-column>
                <a-table-column title="当前库存" :width="100" align="right">
                  <template #cell="{ record }">
                    <span class="text-success">{{ record.stockQty }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="80">
                  <template #cell="{ record }">
                    <a-dot :color="record.status === 'active' ? 'green' : 'grey'" />
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PrdPanel from '@/components/PrdPanel/index.vue'

const router = useRouter()
const route = useRoute()

const skuId = route.params.id as string

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const skuInfo = ref({
  skuId: skuId,
  skuCode: 'SKU-SN-001-01',
  skuName: '水泥 P.O 42.5 袋装',
  spuId: 'spu001',
  spuName: '水泥 P.O 42.5',
  categoryName: '水泥',
  specs: { '强度等级': '42.5', '包装': '袋装' },
  unit: '吨',
  suppliers: [
    { id: 's1', name: '华润水泥' },
    { id: 's2', name: '海螺水泥' },
  ],
  totalStock: 800,
  availableStock: 780,
  lockedStock: 20,
  mainImage: 'https://picsum.photos/400/200?random=1',
})

const supplierList = ref([
  {
    id: 's1',
    name: '华润水泥',
    totalSupplyQty: 1200,
    stockQty: 500,
    status: 'active',
  },
  {
    id: 's2',
    name: '海螺水泥',
    totalSupplyQty: 800,
    stockQty: 300,
    status: 'active',
  },
])

const warehouseStock = ref([
  {
    warehouseName: '深圳湾科技园仓',
    location: 'A-01-01',
    stock: 350,
    availableStock: 340,
    lockedStock: 10,
    status: 'normal',
    lastUpdate: '2024-12-20 10:30',
  },
  {
    warehouseName: '福田CBD项目仓',
    location: 'B-02-03',
    stock: 250,
    availableStock: 240,
    lockedStock: 10,
    status: 'normal',
    lastUpdate: '2024-12-19 15:20',
  },
  {
    warehouseName: '宝安新安项目仓',
    location: 'C-01-05',
    stock: 200,
    availableStock: 200,
    lockedStock: 0,
    status: 'warning',
    lastUpdate: '2024-12-18 09:45',
  },
])

const batchDetails = ref([
  {
    batchNo: 'BAT20241201001',
    warehouseName: '深圳湾科技园仓',
    supplierName: '华润水泥',
    purchaseOrderNo: 'PO-2024-12-001',
    inboundDate: '2024-12-01',
    inboundQuantity: 500,
    currentStock: 350,
    operator: '李仓管',
    remark: '首批入库，质量检测合格',
  },
  {
    batchNo: 'BAT20241210002',
    warehouseName: '福田CBD项目仓',
    supplierName: '华润水泥',
    purchaseOrderNo: 'PO-2024-12-008',
    inboundDate: '2024-12-10',
    inboundQuantity: 300,
    currentStock: 250,
    operator: '王仓管',
    remark: '',
  },
  {
    batchNo: 'BAT20241215003',
    warehouseName: '宝安新安项目仓',
    supplierName: '海螺水泥',
    purchaseOrderNo: 'PO-2024-12-012',
    inboundDate: '2024-12-15',
    inboundQuantity: 200,
    currentStock: 200,
    operator: '张仓管',
    remark: '紧急补货',
  },
])

const stockRecords = ref([
  {
    recordNo: 'REC202412200001',
    type: 'out',
    warehouseName: '深圳湾科技园仓',
    quantity: 50,
    beforeStock: 400,
    afterStock: 350,
    relatedOrder: 'SO-2024-12345',
    operator: '仓管A',
    operateTime: '2024-12-20 10:30:00',
  },
  {
    recordNo: 'REC202412190002',
    type: 'out',
    warehouseName: '福田CBD项目仓',
    quantity: 30,
    beforeStock: 280,
    afterStock: 250,
    relatedOrder: 'SO-2024-12340',
    operator: '仓管B',
    operateTime: '2024-12-19 15:20:00',
  },
  {
    recordNo: 'REC202412150003',
    type: 'in',
    warehouseName: '宝安新安项目仓',
    quantity: 200,
    beforeStock: 0,
    afterStock: 200,
    relatedOrder: 'PO-2024-12-012',
    operator: '仓管C',
    operateTime: '2024-12-15 09:45:00',
  },
])

function goToSpuDetail() {
  router.push(`/warehouse/product/spu-detail/${skuInfo.value.spuId}`)
}

const prdModules = [
  {
    moduleName: '项目背景',
    content: 'SKU库存详情页提供最小库存单元的精细化管理，展示具体规格商品在各仓库的库存分布、多供应商报价对比、价格和分账费率变动历史、批次明细和出入库流水，实现库存全链路追溯。',
  },
  {
    moduleName: '核心功能',
    content: '1. SKU基本信息展示：包含完整规格组合、成本区间、多供应商标签\n2. 多供应商供货管理：展示各供应商成本价、供货量、支持切换查看详情\n3. 价格变动记录：按供应商维度记录历史调价，支持涨幅对比和审核状态追踪\n4. 分账手续费变动：记录平台分账费率调整历史\n5. 多仓库库存分布：按仓库维度展示当前库存、可用库存、预占库存\n6. 批次明细管理：展示每个批次的入库时间、库龄、质检员等信息\n7. 出入库流水：完整记录每一次库存变动的操作详情',
  },
  {
    moduleName: '业务场景',
    content: '• 采购人员对比不同供应商的报价和供货能力\n• 财务人员核对SKU价格和分账费率变动历史\n• 仓管员查询具体规格商品在各仓库的存放位置和数量\n• 质检员追踪某个批次的质检记录和库存状态\n• 库龄分析和先进先出管理',
  },
  {
    moduleName: '业务规则',
    content: '1. 同一SKU支持多供应商报价，各供应商独立维护价格\n2. 供应商价格调整需走审批流程\n3. 分账费率调整全局生效，影响所有该SKU的订单分账计算\n4. 库存状态判定：0件=短缺，<50件=预警，否则=正常\n5. 库龄预警：>30天标橙，>90天标红',
  },
]

onMounted(() => {
  console.log('SKU ID:', skuId)
  pagination.total = batchDetails.value.length
})
</script>

<style scoped lang="less">
.sku-detail {
  padding: 16px;

  .detail-content {
    margin-top: 16px;
  }

  .min-price {
    color: var(--color-text-2);
  }
  .sep {
    color: var(--color-text-4);
    margin: 0 4px;
  }
  .max-price {
    color: var(--color-text-1);
    font-weight: 500;
  }
  .cost-price {
    color: var(--color-text-1);
    font-weight: 500;
  }
  .old-price {
    color: var(--color-text-3);
    text-decoration: line-through;
  }
  .new-price {
    color: var(--color-text-1);
    font-weight: 500;
  }
  .stock-number {
    font-weight: 500;
  }

  .spec-tags, .supplier-tags {
    :deep(.arco-tag) {
      margin: 2px;
    }
  }
}
</style>
