<template>
  <div class="split-config">
    <a-card title="分账规则配置">
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          分账规则用于配置平台与商户之间的分账比例，支持按商户类型或单个商户进行配置
        </template>
      </a-alert>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="type" title="按商户类型配置" />
        <a-tab-pane key="merchant" title="按商户配置" />
      </a-tabs>

      <div v-if="activeTab === 'type'">
        <a-table :data="typeConfigList" :pagination="false">
          <template #columns>
            <a-table-column title="商户类型" :width="200">
              <template #cell="{ record }">
                <a-tag :color="record.type === 'warehouse' ? 'blue' : 'green'">
                  {{ record.type === 'warehouse' ? '工程仓' : '供应商' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="平台分账比例" :width="150" align="center">
              <template #cell="{ record }">
                <span class="rate">{{ record.platformRate }}%</span>
              </template>
            </a-table-column>
            <a-table-column title="商户分账比例" :width="150" align="center">
              <template #cell="{ record }">
                <span class="rate">{{ record.merchantRate }}%</span>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'enabled' ? 'green' : 'gray'">
                  {{ record.status === 'enabled' ? '已启用' : '已禁用' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="更新时间" data-index="updateTime" :width="180" />
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-button type="text" size="small" @click="handleEditTypeConfig(record)">编辑</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div v-if="activeTab === 'merchant'">
        <div style="margin-bottom: 16px">
          <a-button type="primary" @click="handleAddMerchantConfig">
            <template #icon><icon-plus /></template>
            新增配置
          </a-button>
        </div>

        <a-form :model="searchForm" layout="inline" class="search-form">
          <a-form-item label="商户名称">
            <a-input v-model="searchForm.merchantName" placeholder="请输入商户名称" allow-clear style="width: 180px" />
          </a-form-item>
          <a-form-item label="商户类型">
            <a-select v-model="searchForm.merchantType" placeholder="全部" allow-clear style="width: 120px">
              <a-option value="warehouse">工程仓</a-option>
              <a-option value="supplier">供应商</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>

        <a-table :data="merchantConfigList" :pagination="pagination" class="mt-16">
          <template #columns>
            <a-table-column title="商户名称" data-index="merchantName" :width="180" />
            <a-table-column title="商户类型" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.merchantType === 'warehouse' ? 'blue' : 'green'">
                  {{ record.merchantType === 'warehouse' ? '工程仓' : '供应商' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="平台分账比例" :width="150" align="center">
              <template #cell="{ record }">
                <span class="rate">{{ record.platformRate }}%</span>
              </template>
            </a-table-column>
            <a-table-column title="商户分账比例" :width="150" align="center">
              <template #cell="{ record }">
                <span class="rate">{{ record.merchantRate }}%</span>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'enabled' ? 'green' : 'gray'">
                  {{ record.status === 'enabled' ? '已启用' : '已禁用' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="更新时间" data-index="updateTime" :width="180" />
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleEditMerchantConfig(record)">编辑</a-button>
                  <a-button type="text" size="small" status="danger" @click="handleDeleteConfig(record)">删除</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal v-model:visible="configModalVisible" :title="configModalTitle" :width="500" @ok="handleConfigConfirm">
      <a-form :model="configForm" layout="vertical">
        <a-form-item v-if="configForm.configType === 'merchant'" label="商户" required>
          <a-select v-model="configForm.merchantId" placeholder="请选择商户" :disabled="!!configForm.id">
            <a-option value="w1">深圳湾科技园项目仓</a-option>
            <a-option value="w2">广州天河工程仓</a-option>
            <a-option value="s1">华润建材供应商</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="平台分账比例" required>
          <a-input-number v-model="configForm.platformRate" :min="0" :max="100" :precision="2" style="width: 100%">
            <template #suffix>%</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="商户分账比例">
          <a-input-number :model-value="100 - configForm.platformRate" :disabled="true" style="width: 100%">
            <template #suffix>%</template>
          </a-input-number>
          <div class="form-hint">商户分账比例 = 100% - 平台分账比例</div>
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model="configForm.enabled" />
          <span class="ml-8">{{ configForm.enabled ? '已启用' : '已禁用' }}</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('type')

const searchForm = ref({
  merchantName: '',
  merchantType: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const typeConfigList = ref([
  { id: '1', type: 'warehouse', platformRate: 5, merchantRate: 95, status: 'enabled', updateTime: '2024-01-15 10:00:00' },
  { id: '2', type: 'supplier', platformRate: 3, merchantRate: 97, status: 'enabled', updateTime: '2024-01-15 10:00:00' },
])

const merchantConfigList = ref([
  { id: '1', merchantId: 'w1', merchantName: '深圳湾科技园项目仓', merchantType: 'warehouse', platformRate: 3, merchantRate: 97, status: 'enabled', updateTime: '2024-01-15 10:00:00' },
  { id: '2', merchantId: 'w2', merchantName: '广州天河工程仓', merchantType: 'warehouse', platformRate: 5, merchantRate: 95, status: 'enabled', updateTime: '2024-01-14 14:00:00' },
])

const configModalVisible = ref(false)
const configForm = ref({
  id: '',
  configType: 'type',
  merchantId: '',
  platformRate: 5,
  enabled: true,
})

const configModalTitle = computed(() => {
  if (configForm.value.configType === 'type') {
    return '编辑类型分账规则'
  }
  return configForm.value.id ? '编辑商户分账规则' : '新增商户分账规则'
})

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleEditTypeConfig(record: any) {
  configForm.value = {
    id: record.id,
    configType: 'type',
    merchantId: '',
    platformRate: record.platformRate,
    enabled: record.status === 'enabled',
  }
  configModalVisible.value = true
}

function handleAddMerchantConfig() {
  configForm.value = {
    id: '',
    configType: 'merchant',
    merchantId: '',
    platformRate: 5,
    enabled: true,
  }
  configModalVisible.value = true
}

function handleEditMerchantConfig(record: any) {
  configForm.value = {
    id: record.id,
    configType: 'merchant',
    merchantId: record.merchantId,
    platformRate: record.platformRate,
    enabled: record.status === 'enabled',
  }
  configModalVisible.value = true
}

function handleDeleteConfig(record: any) {
  Message.success(`已删除商户 ${record.merchantName} 的分账配置`)
}

function handleConfigConfirm() {
  if (configForm.value.configType === 'merchant' && !configForm.value.merchantId) {
    Message.warning('请选择商户')
    return
  }
  Message.success('分账规则保存成功')
  configModalVisible.value = false
}
</script>

<style scoped lang="less">
.split-config {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.search-form {
  margin-bottom: 0;
}

.rate {
  font-weight: 600;
  color: #165dff;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}

.ml-8 {
  margin-left: 8px;
}
</style>
