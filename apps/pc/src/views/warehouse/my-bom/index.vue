<template>
  <div class="my-bom">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            创建BOM包
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="my" title="我的BOM包" />
        <a-tab-pane key="inherited" title="继承的BOM包" />
      </a-tabs>

      <a-table :data="filteredBomList" :pagination="pagination">
        <template #columns>
          <a-table-column title="BOM包信息" :width="280">
            <template #cell="{ record }">
              <div class="bom-info">
                <img :src="record.image" class="bom-image" />
                <div class="bom-detail">
                  <div class="bom-name">{{ record.name }}</div>
                  <div class="bom-source" v-if="record.sourceType === 'inherited'">
                    <icon-copy /> 继承自: {{ record.sourceName }}
                  </div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="sku-count">{{ record.skuCount }} 种</span>
            </template>
          </a-table-column>
          <a-table-column title="供应商策略" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getStrategyColor(record.strategy)">
                {{ getStrategyText(record.strategy) }}
              </a-tag>
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
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="150" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-link @click="handleCopy(record)">复制</a-link>
                <a-popconfirm content="确定删除该BOM包吗？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="createModalVisible" title="创建BOM包" :width="600" @ok="handleCreateConfirm">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="创建方式" required>
          <a-radio-group v-model="createForm.createType">
            <a-radio value="new">
              <div class="create-option">
                <div class="option-title">全新创建</div>
                <div class="option-desc">从零开始创建新的BOM包</div>
              </div>
            </a-radio>
            <a-radio value="inherit">
              <div class="create-option">
                <div class="option-title">继承平台BOM包</div>
                <div class="option-desc">基于平台BOM包定制，可调整SKU和价格</div>
              </div>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="createForm.createType === 'inherit'" label="选择平台BOM包" required>
          <a-select v-model="createForm.sourceBomId" placeholder="请选择要继承的BOM包" style="width: 100%">
            <a-option v-for="bom in platformBomList" :key="bom.id" :value="bom.id">
              {{ bom.name }} (¥{{ bom.price }})
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="BOM包名称" required>
          <a-input v-model="createForm.name" placeholder="请输入BOM包名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const activeTab = ref('my')

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const bomList = ref([
  { id: '1', name: '水电材料标准包', image: 'https://picsum.photos/100/100?random=1', skuCount: 12, strategy: 'smart', price: '3,580.00', salesCount: 56, status: 'active', sourceType: 'new', sourceName: '', createTime: '2024-01-15 10:30' },
  { id: '2', name: '防水涂料套餐', image: 'https://picsum.photos/100/100?random=2', skuCount: 5, strategy: 'single', price: '2,100.00', salesCount: 23, status: 'active', sourceType: 'inherited', sourceName: '平台防水套餐', createTime: '2024-01-14 14:20' },
  { id: '3', name: '木工基础包', image: 'https://picsum.photos/100/100?random=3', skuCount: 8, strategy: 'sku', price: '4,800.00', salesCount: 0, status: 'draft', sourceType: 'inherited', sourceName: '平台木工包', createTime: '2024-01-16 09:00' },
])

const platformBomList = ref([
  { id: 'p1', name: '水电材料标准包', price: '3,580.00' },
  { id: 'p2', name: '防水涂料套餐', price: '2,100.00' },
  { id: 'p3', name: '木工基础包', price: '4,800.00' },
  { id: 'p4', name: '油漆涂装套餐', price: '2,500.00' },
])

const filteredBomList = computed(() => {
  if (activeTab.value === 'my') {
    return bomList.value
  }
  return bomList.value.filter(item => item.sourceType === 'inherited')
})

const createModalVisible = ref(false)
const createForm = ref({
  createType: 'new',
  sourceBomId: '',
  name: '',
})

function getStrategyColor(strategy: string) {
  const colors: Record<string, string> = {
    smart: 'blue',
    single: 'green',
    sku: 'purple',
  }
  return colors[strategy] || 'gray'
}

function getStrategyText(strategy: string) {
  const texts: Record<string, string> = {
    smart: '智能分配',
    single: '单一供应商',
    sku: 'SKU级指定',
  }
  return texts[strategy] || strategy
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    active: 'green',
    draft: 'gray',
    inactive: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    active: '已上架',
    draft: '草稿',
    inactive: '已下架',
  }
  return texts[status] || status
}

function handleCreate() {
  createForm.value = {
    createType: 'new',
    sourceBomId: '',
    name: '',
  }
  createModalVisible.value = true
}

function handleCreateConfirm() {
  if (!createForm.value.name) {
    Message.warning('请输入BOM包名称')
    return
  }
  if (createForm.value.createType === 'inherit' && !createForm.value.sourceBomId) {
    Message.warning('请选择要继承的BOM包')
    return
  }
  createModalVisible.value = false
  router.push('/warehouse/my-bom/create')
}

function handleView(record: any) {
  router.push(`/warehouse/my-bom/detail/${record.id}`)
}

function handleEdit(record: any) {
  router.push(`/warehouse/my-bom/edit/${record.id}`)
}

function handleCopy(record: any) {
  Message.success('已复制到草稿')
}

function handleDelete(record: any) {
  const index = bomList.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    bomList.value.splice(index, 1)
    Message.success('删除成功')
  }
}
</script>

<style scoped lang="less">
.my-bom {
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
}

.bom-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.bom-source {
  font-size: 12px;
  color: var(--color-text-3);
  display: flex;
  align-items: center;
  gap: 4px;
}

.sku-count {
  color: #165dff;
  font-weight: 500;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.create-option {
  padding: 8px 0;
  
  .option-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .option-desc {
    font-size: 12px;
    color: var(--color-text-3);
  }
}
</style>
