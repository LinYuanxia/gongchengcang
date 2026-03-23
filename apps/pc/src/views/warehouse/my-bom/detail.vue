<template>
  <div class="my-bom-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button @click="handleEdit">编辑</a-button>
          <a-button v-if="!bom.isActive" type="primary" @click="handleOnline">上架</a-button>
          <a-button v-if="bom.isActive" status="warning" @click="handleOffline">下架</a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="基本信息">
        <a-descriptions-item label="BOM名称">{{ bom.name }}</a-descriptions-item>
        <a-descriptions-item label="BOM类型">
          <a-tag>{{ bom.type === 'custom' ? '定制包' : '标准包' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ bom.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="bom.isActive ? 'green' : 'gray'">{{ bom.isActive ? '已上架' : '已下架' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="来源">
          <span v-if="bom.sourceType === 'inherited'">
            <icon-copy /> 继承自: {{ bom.sourceName }}
          </span>
          <span v-else>自主创建</span>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ bom.createTime }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ bom.updateTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="1">
        <a-descriptions-item label="BOM说明">{{ bom.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="4" title="价格信息">
        <a-descriptions-item label="价格策略">
          {{ bom.priceStrategy === 'fixed' ? '固定价格' : '动态价格' }}
        </a-descriptions-item>
        <a-descriptions-item label="成本预估">
          <span class="cost">¥{{ bom.costPrice }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="销售价格">
          <span class="price">¥{{ bom.salePrice }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="毛利率">
          <span class="profit">{{ bom.profitMargin }}%</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>SKU明细</h3>
      <a-table :data="bom.skuList" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div class="product-info">
                <img :src="record.image" class="product-image" />
                <span>{{ record.name }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="供应商" :width="120">
            <template #cell="{ record }">
              <span>{{ record.supplierName }}</span>
            </template>
          </a-table-column>
          <a-table-column title="成本价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="cost">¥{{ record.costPrice }}</span>
            </template>
          </a-table-column>
          <a-table-column title="销售价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.salePrice }}</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="小计" :width="100" align="right">
            <template #cell="{ record }">
              <span class="subtotal">¥{{ record.subtotal }}</span>
            </template>
          </a-table-column>
          <a-table-column title="是否必选" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.required ? 'green' : 'gray'" size="small">
                {{ record.required ? '必选' : '可选' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="sku-summary">
        <span>共 <strong>{{ bom.skuList.length }}</strong> 种SKU</span>
        <span>必选 <strong>{{ bom.skuList.filter(s => s.required).length }}</strong> 种</span>
        <span>可选 <strong>{{ bom.skuList.filter(s => !s.required).length }}</strong> 种</span>
        <span>成本预估：<strong class="cost">¥{{ bom.costPrice }}</strong></span>
        <span>销售价格：<strong class="price">¥{{ bom.salePrice }}</strong></span>
      </div>

      <a-divider />

      <h3>销售统计</h3>
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="总销量" :value="bom.salesCount" suffix="件">
            <template #prefix><icon-shopping-cart /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="销售额" :value="bom.salesAmount" :precision="2" prefix="¥">
            <template #prefix><icon-money-collect /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="收藏数" :value="bom.favoriteCount">
            <template #prefix><icon-heart /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="好评率" :value="bom.goodRate" suffix="%">
            <template #prefix><icon-star-fill /></template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()

const bom = ref({
  id: '1',
  name: '水电材料标准包',
  type: 'custom',
  categoryName: '水电工程',
  isActive: true,
  sourceType: 'inherited',
  sourceName: '平台水电材料包',
  priceStrategy: 'fixed',
  costPrice: '3,080.00',
  salePrice: '3,580.00',
  profitMargin: '16.2',
  description: '适用于标准住宅水电改造工程，包含给排水管材、电线电缆、开关插座等基础材料。',
  createTime: '2024-01-15 10:30:00',
  updateTime: '2024-01-16 14:20:00',
  skuList: [
    { skuId: '1', skuCode: 'SKU-SN-001', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', supplierName: '华新水泥', costPrice: 400, salePrice: 420, quantity: 10, unit: '吨', subtotal: '4,200.00', required: true },
    { skuId: '2', skuCode: 'SKU-FS-001', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', supplierName: '东方雨虹', costPrice: 260, salePrice: 280, quantity: 5, unit: '桶', subtotal: '1,400.00', required: true },
    { skuId: '3', skuCode: 'SKU-GD-001', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', supplierName: '伟星管业', costPrice: 32, salePrice: 35, quantity: 20, unit: '根', subtotal: '700.00', required: false },
    { skuId: '4', skuCode: 'SKU-DB-001', name: '电线 BV2.5', image: 'https://picsum.photos/60/60?random=4', spec: '2.5mm²', supplierName: '远东电缆', costPrice: 170, salePrice: 180, quantity: 5, unit: '卷', subtotal: '900.00', required: true },
  ],
  salesCount: 56,
  salesAmount: 200480,
  favoriteCount: 23,
  goodRate: 98.5,
})

function handleEdit() {
  router.push(`/warehouse/my-bom/edit/${bom.value.id}`)
}

function handleOnline() {
  Modal.confirm({
    title: '确认上架',
    content: '确定将BOM包上架吗？上架后施工方可购买。',
    onOk: () => {
      bom.value.isActive = true
      Message.success('上架成功')
    }
  })
}

function handleOffline() {
  Modal.confirm({
    title: '确认下架',
    content: '确定将BOM包下架吗？下架后施工方将无法购买。',
    onOk: () => {
      bom.value.isActive = false
      Message.success('下架成功')
    }
  })
}
</script>

<style scoped lang="less">
.my-bom-detail {
  padding: 16px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 8px;
}

.cost {
  color: var(--color-text-2);
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.profit {
  color: #00b42a;
  font-weight: 500;
}

.sku-summary {
  display: flex;
  gap: 32px;
  margin-top: 16px;
  padding: 16px;
  background: rgb(var(--gray-1));
  border-radius: 8px;
  
  strong {
    &.cost {
      color: var(--color-text-2);
    }
    
    &.price {
      color: #f53f3f;
    }
  }
}
</style>
