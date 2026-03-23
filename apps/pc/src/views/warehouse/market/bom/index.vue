<template>
  <div class="bom-market">
    <a-row :gutter="16">
      <a-col :span="4">
        <a-card title="BOM分类" class="category-card">
          <a-tree :data="categoryTree" v-model:selected-keys="selectedCategory" @select="handleCategorySelect" />
        </a-card>
      </a-col>
      <a-col :span="20">
        <a-card>
          <template #extra>
            <a-space>
              <a-input-search v-model="searchKeyword" placeholder="搜索BOM包名称" style="width: 200px" />
              <a-select v-model="sortBy" placeholder="排序" style="width: 120px">
                <a-option value="default">综合排序</a-option>
                <a-option value="sales">销量优先</a-option>
                <a-option value="price-asc">价格升序</a-option>
                <a-option value="price-desc">价格降序</a-option>
              </a-select>
            </a-space>
          </template>

          <div class="bom-grid">
            <div v-for="bom in bomList" :key="bom.id" class="bom-card" @click="handleViewDetail(bom)">
              <div class="bom-image">
                <img :src="bom.image" />
                <div v-if="bom.isHot" class="hot-tag">热门</div>
                <div v-if="bom.isRecommend" class="recommend-tag">推荐</div>
              </div>
              <div class="bom-info">
                <div class="bom-name">{{ bom.name }}</div>
                <div class="bom-desc">{{ bom.description }}</div>
                <div class="bom-meta">
                  <span class="sku-count">{{ bom.skuCount }}种SKU</span>
                  <span class="sales">已售{{ bom.salesCount }}件</span>
                </div>
                <div class="bom-price">
                  <span class="price">¥{{ bom.price }}</span>
                  <span class="unit">/套</span>
                </div>
                <div class="bom-actions">
                  <a-button type="primary" size="small" @click.stop="handleBuy(bom)">立即购买</a-button>
                  <a-button size="small" @click.stop="handleAddToCart(bom)">加入购物车</a-button>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper">
            <a-pagination v-model:current="pagination.current" :total="pagination.total" :page-size="pagination.pageSize" show-total show-jumper />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchKeyword = ref('')
const sortBy = ref('default')
const selectedCategory = ref(['all'])

const categoryTree = ref([
  { key: 'all', title: '全部分类' },
  { key: '1', title: '水电工程', children: [
    { key: '1-1', title: '给排水' },
    { key: '1-2', title: '电气' },
  ]},
  { key: '2', title: '防水工程' },
  { key: '3', title: '木工工程' },
  { key: '4', title: '油漆工程' },
  { key: '5', title: '泥瓦工程' },
])

const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 36,
})

const bomList = ref([
  { id: '1', name: '水电材料标准包', image: 'https://picsum.photos/300/200?random=1', description: '适用于标准住宅水电改造工程', skuCount: 12, salesCount: 156, price: '3,580.00', isHot: true, isRecommend: false },
  { id: '2', name: '防水涂料套餐', image: 'https://picsum.photos/300/200?random=2', description: '卫生间、厨房防水专用套餐', skuCount: 5, salesCount: 89, price: '2,100.00', isHot: false, isRecommend: true },
  { id: '3', name: '木工基础包', image: 'https://picsum.photos/300/200?random=3', description: '吊顶、隔断基础材料套餐', skuCount: 8, salesCount: 67, price: '4,800.00', isHot: false, isRecommend: false },
  { id: '4', name: '油漆涂装套餐', image: 'https://picsum.photos/300/200?random=4', description: '墙面涂装全套材料', skuCount: 6, salesCount: 45, price: '2,500.00', isHot: true, isRecommend: true },
  { id: '5', name: '瓷砖铺贴包', image: 'https://picsum.photos/300/200?random=5', description: '瓷砖、水泥、沙子配套套餐', skuCount: 10, salesCount: 123, price: '6,200.00', isHot: false, isRecommend: false },
  { id: '6', name: '全屋水电套餐', image: 'https://picsum.photos/300/200?random=6', description: '三室两厅全屋水电材料', skuCount: 25, salesCount: 34, price: '8,900.00', isHot: false, isRecommend: true },
])

function handleCategorySelect(keys: string[]) {
  selectedCategory.value = keys
}

function handleViewDetail(bom: any) {
  router.push(`/warehouse/market/bom/detail/${bom.id}`)
}

function handleBuy(bom: any) {
  router.push(`/warehouse/market/bom/order/${bom.id}`)
}

function handleAddToCart(bom: any) {
  Message.success(`已将 ${bom.name} 加入购物车`)
}
</script>

<style scoped lang="less">
.bom-market {
  padding: 16px;
}

.category-card {
  min-height: 500px;
}

.bom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.bom-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.bom-image {
  position: relative;
  height: 160px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .hot-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #f53f3f;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .recommend-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #165dff;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.bom-info {
  padding: 12px;
}

.bom-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bom-desc {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bom-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-3);
}

.bom-price {
  margin-bottom: 12px;
  
  .price {
    font-size: 20px;
    font-weight: 600;
    color: #f53f3f;
  }
  
  .unit {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.bom-actions {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
