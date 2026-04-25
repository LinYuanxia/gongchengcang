<template>
  <div class="product-detail">
    <a-page-header title="SPU详情" @back="router.back()">
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="detail-content">
      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="SPU基本信息">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="SPU编码">{{ spuInfo.spuCode }}</a-descriptions-item>
              <a-descriptions-item label="SPU名称">{{ spuInfo.spuName }}</a-descriptions-item>
              <a-descriptions-item label="商品分类">{{ spuInfo.categoryName }}</a-descriptions-item>
              <a-descriptions-item label="计量单位">{{ spuInfo.unit }}</a-descriptions-item>
              <a-descriptions-item label="SKU规格数">
                <a-tag color="blue">{{ spuInfo.skuCount }} 个</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="供应商数">
                <a-tag color="green">{{ spuInfo.supplierCount }} 家</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="价格区间">
                <span class="min-price">¥{{ spuInfo.minPrice }}</span>
                <span class="sep"> ~ </span>
                <span class="max-price">¥{{ spuInfo.maxPrice }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="总库存">
                <span :class="spuInfo.totalStock === 0 ? 'text-danger' : 'text-success'" class="stock-total">
                  {{ spuInfo.totalStock }} 件
                </span>
              </a-descriptions-item>
              <a-descriptions-item label="商品描述" :span="2">{{ spuInfo.description }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="SKU规格矩阵" class="mt-16">
            <template #extra>
              <a-tag color="arcoblue">共 {{ skuList.length }} 个SKU规格</a-tag>
            </template>
            <a-table :data="skuList" :pagination="false" bordered>
              <template #columns>
                <a-table-column title="SKU编码" data-index="skuCode" :width="140" />
                <a-table-column title="SKU名称" data-index="skuName" :width="180">
                  <template #cell="{ record }">
                    <a-link @click="goToSkuDetail(record)">{{ record.skuName }}</a-link>
                  </template>
                </a-table-column>
                <a-table-column title="规格组合" :width="220">
                  <template #cell="{ record }">
                    <div class="spec-tags">
                      <a-tag v-for="(value, key) in record.specs" :key="key" size="small" color="arcoblue">
                        {{ key }}: {{ value }}
                      </a-tag>
                    </div>
                  </template>
                </a-table-column>
                <a-table-column title="供应商数" :width="100" align="center">
                  <template #cell="{ record }">
                    {{ record.supplierCount }} 家
                  </template>
                </a-table-column>
                <a-table-column title="成本价区间" :width="140" align="right">
                  <template #cell="{ record }">
                    <span class="min-price">¥{{ record.minCost }}</span>
                    <span class="sep"> ~ </span>
                    <span class="max-price">¥{{ record.maxCost }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="总库存" :width="100" align="center">
                  <template #cell="{ record }">
                    <span :class="record.totalStock === 0 ? 'text-danger' : record.totalStock < 50 ? 'text-warning' : 'text-success'">
                      {{ record.totalStock }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="覆盖仓库" :width="100" align="center">
                  <template #cell="{ record }">
                    {{ record.warehouseCount }} 个
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="100" fixed="right">
                  <template #cell="{ record }">
                    <a-link @click="goToSkuDetail(record)">库存详情</a-link>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>

          <a-card title="供应商供货汇总" class="mt-16">
            <a-table :data="supplierSummary" :pagination="false" bordered>
              <template #columns>
                <a-table-column title="供应商名称" data-index="supplierName" :width="200">
                  <template #cell="{ record }">
                    <a-tag color="green">{{ record.supplierName }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="覆盖SKU数" :width="120" align="center">
                  <template #cell="{ record }">
                    <a-tag color="blue">{{ record.skuCount }} 个</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="供货SKU明细" :width="250">
                  <template #cell="{ record }">
                    <div class="spec-tags">
                      <a-tag v-for="sku in record.skuList" :key="sku.skuCode" size="small" color="purple">
                        {{ sku.skuName }}
                      </a-tag>
                    </div>
                  </template>
                </a-table-column>
                <a-table-column title="总供货量" data-index="totalSupply" :width="120" align="right">
                  <template #cell="{ record }">
                    <strong class="text-success">{{ record.totalSupply }}</strong>
                  </template>
                </a-table-column>
                <a-table-column title="供货占比" :width="120" align="center">
                  <template #cell="{ record }">
                    <a-progress :percent="record.rate" :show-text="false" size="small" style="width: 70px" />
                    <span class="ml-4 fs-12">{{ record.rate }}%</span>
                  </template>
                </a-table-column>
                <a-table-column title="首次合作时间" data-index="firstCooperation" :width="160" />
              </template>
            </a-table>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card title="商品图片">
            <a-image-preview-group>
              <a-space wrap>
                <a-image
                  v-for="(img, index) in spuInfo.images"
                  :key="index"
                  :src="img"
                  width="100"
                  height="100"
                  fit="cover"
                />
              </a-space>
            </a-image-preview-group>
          </a-card>

          <a-card title="库存统计概览" class="mt-16">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic title="SKU总数" :value="spuInfo.skuCount" suffix="个" />
              </a-col>
              <a-col :span="12">
                <a-statistic title="总库存" :value="spuInfo.totalStock" suffix="件" />
              </a-col>
            </a-row>
            <a-divider />
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic title="供应商数" :value="spuInfo.supplierCount" suffix="家" />
              </a-col>
              <a-col :span="12">
                <a-statistic title="覆盖仓库" :value="3" suffix="个" />
              </a-col>
            </a-row>
          </a-card>

          <a-card title="价格统计" class="mt-16">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="最低成本价">
                <span class="min-price">¥{{ spuInfo.minPrice }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="最高成本价">
                <span class="max-price">¥{{ spuInfo.maxPrice }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="平均成本价">
                <span class="avg-price">¥{{ spuInfo.avgPrice }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="库存总价值">
                <strong class="text-primary">¥{{ spuInfo.totalValue.toLocaleString() }}</strong>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const spuId = route.params.id as string

const spuInfo = ref({
  spuId: spuId,
  spuCode: 'SPU-SN-001',
  spuName: '水泥 P.O 42.5',
  categoryName: '水泥',
  unit: '吨',
  skuCount: 3,
  supplierCount: 2,
  minPrice: 360,
  maxPrice: 420,
  avgPrice: 380,
  totalStock: 1500,
  totalValue: 570000,
  description: '普通硅酸盐水泥，适用于一般工业与民用建筑工程，包括建筑结构、道路、桥梁和地下工程等。',
  images: [
    'https://picsum.photos/200/200?random=1',
    'https://picsum.photos/200/200?random=2',
    'https://picsum.photos/200/200?random=3',
  ],
})

const skuList = ref([
  {
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-01',
    skuName: '水泥 P.O 42.5 袋装',
    specs: { '强度等级': '42.5', '包装': '袋装' },
    supplierCount: 2,
    minCost: 360,
    maxCost: 380,
    totalStock: 800,
    warehouseCount: 3,
  },
  {
    skuId: 'sku002',
    skuCode: 'SKU-SN-001-02',
    skuName: '水泥 P.O 42.5 散装',
    specs: { '强度等级': '42.5', '包装': '散装' },
    supplierCount: 2,
    minCost: 355,
    maxCost: 375,
    totalStock: 500,
    warehouseCount: 2,
  },
  {
    skuId: 'sku003',
    skuCode: 'SKU-SN-001-03',
    skuName: '水泥 P.O 42.5 吨包',
    specs: { '强度等级': '42.5', '包装': '吨包' },
    supplierCount: 1,
    minCost: 365,
    maxCost: 365,
    totalStock: 200,
    warehouseCount: 1,
  },
])

const supplierSummary = ref([
  {
    supplierName: '华润水泥',
    skuCount: 3,
    skuList: [
      { skuCode: 'SKU-SN-001-01', skuName: '袋装' },
      { skuCode: 'SKU-SN-001-02', skuName: '散装' },
      { skuCode: 'SKU-SN-001-03', skuName: '吨包' },
    ],
    totalSupply: 900,
    rate: 60,
    firstCooperation: '2024-01-15',
  },
  {
    supplierName: '海螺水泥',
    skuCount: 2,
    skuList: [
      { skuCode: 'SKU-SN-001-01', skuName: '袋装' },
      { skuCode: 'SKU-SN-001-02', skuName: '散装' },
    ],
    totalSupply: 600,
    rate: 40,
    firstCooperation: '2024-02-20',
  },
])

function goToSkuDetail(record: any) {
  router.push(`/warehouse/product/sku-detail/${record.skuId}`)
}

const prdModules = [
  {
    moduleName: '项目背景',
    content: 'SPU详情页用于展示标准化产品单元的完整信息，包括所有SKU规格的汇总信息和供应商供货情况。通过SPU视角可以宏观掌握产品族的整体库存和价格情况。',
  },
  {
    moduleName: '核心功能',
    content: '1. SPU基本信息展示：编码、名称、分类、SKU数量、供应商数量等\n2. SKU规格矩阵：展示该SPU下所有SKU的库存和成本信息\n3. 供应商供货汇总：按供应商维度统计供货量和占比\n4. 快捷跳转：可直接跳转到具体SKU库存详情页',
  },
  {
    moduleName: '业务场景',
    content: '• 采购经理查看某个品类的整体库存和供应商分布\n• 仓库主管了解某个SPU的所有SKU规格分布\n• 财务人员统计某个产品族的库存总价值\n• 运营人员分析各供应商的供货占比',
  },
]

onMounted(() => {
  console.log('SPU ID:', spuId)
})
</script>

<style scoped lang="less">
.product-detail {
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
  .avg-price {
    color: var(--color-primary-6);
  }
  .stock-total {
    font-weight: 500;
  }

  .spec-tags {
    :deep(.arco-tag) {
      margin: 2px;
    }
  }
}
</style>
