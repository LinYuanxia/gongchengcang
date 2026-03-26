<template>
  <div class="bom-manage">
    <a-card>
      <template #title>
        <span>BOM包列表</span>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            创建BOM包
          </a-button>
        </a-space>
      </template>

      <a-table :data="bomList" :pagination="pagination">
        <template #columns>
          <a-table-column title="BOM包信息" :width="300">
            <template #cell="{ record }">
              <div class="bom-info">
                <img :src="record.image" class="bom-image" />
                <div class="bom-detail">
                  <div class="bom-name">
                    {{ record.name }}
                    <a-tag v-if="record.source === 'platform'" color="arcoblue" size="small">平台推送</a-tag>
                  </div>
                  <div class="bom-category">{{ record.categoryName }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="sku-count">{{ record.skuCount }} 种</span>
            </template>
          </a-table-column>
          <a-table-column title="售价" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="销量" :width="80" align="center">
            <template #cell="{ record }">
              {{ record.salesCount }}
            </template>
          </a-table-column>
          <a-table-column title="上架状态" :width="120">
            <template #cell="{ record }">
              <a-switch
                v-model="record.isActive"
                :disabled="record.source === 'platform'"
                @change="(val: boolean) => handleStatusChange(record, val)"
              >
                <template #checked>已上架</template>
                <template #unchecked>已下架</template>
              </a-switch>
            </template>
          </a-table-column>
          <a-table-column title="推送时间" data-index="pushTime" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleCopy(record)">复制</a-link>
                <a-popconfirm v-if="record.source !== 'platform'" content="确定删除该BOM包吗？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="copyModalVisible" 
      title="复制BOM包" 
      :width="500"
      @ok="confirmCopy"
      @cancel="cancelCopy"
    >
      <div class="copy-modal-content">
        <div class="copy-info">
          <icon-copy class="copy-icon" />
          <div class="copy-text">
            <div class="copy-title">确定复制此BOM包吗？</div>
            <div class="copy-detail">
              <span class="label">BOM包名称：</span>
              <span class="value">{{ currentCopyBom?.name }}</span>
            </div>
            <div class="copy-detail">
              <span class="label">SKU数量：</span>
              <span class="value">{{ currentCopyBom?.skuCount }} 种</span>
            </div>
            <div class="copy-detail">
              <span class="label">售价：</span>
              <span class="value price">¥{{ currentCopyBom?.price }}</span>
            </div>
          </div>
        </div>
        <a-alert type="info" style="margin-top: 16px">
          复制后可对BOM包进行编辑，包括调整SKU和价格
        </a-alert>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const bomList = ref([
  { 
    id: '1', 
    name: '水电材料标准包', 
    image: 'https://picsum.photos/100/100?random=1', 
    categoryName: '水电工程',
    skuCount: 12, 
    price: '3,580.00', 
    salesCount: 56, 
    isActive: true, 
    source: 'platform', 
    pushTime: '2024-01-15 10:30' 
  },
  { 
    id: '2', 
    name: '防水涂料套餐', 
    image: 'https://picsum.photos/100/100?random=2', 
    categoryName: '防水工程',
    skuCount: 5, 
    price: '2,100.00', 
    salesCount: 23, 
    isActive: true, 
    source: 'platform', 
    pushTime: '2024-01-14 14:20' 
  },
  { 
    id: '3', 
    name: '木工基础包', 
    image: 'https://picsum.photos/100/100?random=3', 
    categoryName: '木工工程',
    skuCount: 8, 
    price: '4,800.00', 
    salesCount: 0, 
    isActive: false, 
    source: 'platform', 
    pushTime: '2024-01-16 09:00' 
  },
  { 
    id: '4', 
    name: '油漆涂装套餐', 
    image: 'https://picsum.photos/100/100?random=4', 
    categoryName: '油漆工程',
    skuCount: 6, 
    price: '2,500.00', 
    salesCount: 12, 
    isActive: true, 
    source: 'platform', 
    pushTime: '2024-01-17 11:00' 
  },
  { 
    id: '5', 
    name: '自建水电套餐', 
    image: 'https://picsum.photos/100/100?random=5', 
    categoryName: '水电工程',
    skuCount: 10, 
    price: '3,200.00', 
    salesCount: 5, 
    isActive: true, 
    source: 'custom', 
    pushTime: '2024-01-18 15:30' 
  },
])

const copyModalVisible = ref(false)
const currentCopyBom = ref<any>(null)

function handleCreate() {
  router.push('/warehouse/bom-manage/create')
}

function handleView(record: any) {
  router.push(`/warehouse/bom-manage/detail/${record.id}`)
}

function handleCopy(record: any) {
  currentCopyBom.value = record
  copyModalVisible.value = true
}

function confirmCopy() {
  copyModalVisible.value = false
  Message.success('正在跳转到编辑页面...')
  router.push({
    path: '/warehouse/bom-manage/create',
    query: { copyFrom: currentCopyBom.value.id }
  })
}

function cancelCopy() {
  copyModalVisible.value = false
  currentCopyBom.value = null
}

function handleDelete(record: any) {
  const index = bomList.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    bomList.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handleStatusChange(record: any, val: boolean) {
  Message.success(val ? '上架成功' : '下架成功')
}
</script>

<style scoped lang="less">
.bom-manage {
  padding: 16px;
}

.bom-info {
  display: flex;
  align-items: center;
}

.bom-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.bom-detail {
  margin-left: 12px;
  flex: 1;
}

.bom-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bom-category {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.sku-count {
  color: var(--color-text-2);
}

.price {
  font-weight: 500;
  color: rgb(var(--primary-6));
}

.copy-modal-content {
  .copy-info {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    
    .copy-icon {
      font-size: 48px;
      color: rgb(var(--primary-6));
    }
    
    .copy-text {
      flex: 1;
      
      .copy-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
      }
      
      .copy-detail {
        margin-bottom: 8px;
        
        .label {
          color: var(--color-text-3);
        }
        
        .value {
          font-weight: 500;
          
          &.price {
            color: rgb(var(--primary-6));
          }
        }
      }
    }
  }
}
</style>
