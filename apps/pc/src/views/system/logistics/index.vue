<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>物流配置</span>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="companies" title="物流公司">
          <div class="table-actions">
            <a-space>
              <a-input-search
                v-model="searchKeyword"
                placeholder="搜索物流公司"
                style="width: 200px"
              />
            </a-space>
            <a-button type="primary" @click="handleAddCompany">
              <template #icon><icon-plus /></template>
              添加物流公司
            </a-button>
          </div>

          <a-table :data="filteredCompanies" :pagination="pagination">
            <template #columns>
              <a-table-column title="物流公司" :width="200">
                <template #cell="{ record }">
                  <div class="company-info">
                    <span class="company-name">{{ record.name }}</span>
                    <span class="company-code">{{ record.code }}</span>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="物流编码" data-index="apiCode" :width="150" />
              <a-table-column title="类型" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.type === 'express' ? 'blue' : 'green'">
                    {{ record.type === 'express' ? '快递' : '物流' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="支持服务" :width="200">
                <template #cell="{ record }">
                  <a-space wrap>
                    <a-tag v-for="s in record.services" :key="s" size="small">{{ s }}</a-tag>
                  </a-space>
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-switch v-model="record.enabled" @change="handleToggleCompany(record)" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="150" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleEditCompany(record)">编辑</a-button>
                    <a-popconfirm content="确定删除该物流公司？" @ok="handleDeleteCompany(record)">
                      <a-button type="text" size="small" status="danger">删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="api" title="API配置">
          <a-card :bordered="true" style="margin-bottom: 16px">
            <template #title>
              <icon-api /> 快递100 API配置
            </template>
            <a-form :model="apiConfig.kuaidi100" layout="vertical" style="max-width: 500px">
              <a-form-item label="API Key">
                <a-input v-model="apiConfig.kuaidi100.key" placeholder="请输入快递100 API Key" />
              </a-form-item>
              <a-form-item label="Customer Key">
                <a-input v-model="apiConfig.kuaidi100.customer" placeholder="请输入Customer Key" />
              </a-form-item>
              <a-form-item label="回调地址">
                <a-input v-model="apiConfig.kuaidi100.callback" placeholder="物流状态变更回调地址" />
              </a-form-item>
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleSaveApi('kuaidi100')">保存配置</a-button>
                  <a-button @click="handleTestApi('kuaidi100')">测试连接</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-card>

          <a-card :bordered="true" style="margin-bottom: 16px">
            <template #title>
              <icon-api /> 快递鸟 API配置
            </template>
            <a-form :model="apiConfig.kdniao" layout="vertical" style="max-width: 500px">
              <a-form-item label="EBusinessID">
                <a-input v-model="apiConfig.kdniao.ebusinessId" placeholder="请输入商户ID" />
              </a-form-item>
              <a-form-item label="App Key">
                <a-input v-model="apiConfig.kdniao.appKey" placeholder="请输入App Key" />
              </a-form-item>
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleSaveApi('kdniao')">保存配置</a-button>
                  <a-button @click="handleTestApi('kdniao')">测试连接</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-card>

          <a-card :bordered="true">
            <template #title>
              <icon-bulb /> 使用说明
            </template>
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="快递100">
                访问 <a-link href="https://www.kuaidi100.com/openapi" target="_blank">快递100开放平台</a-link> 申请API Key
              </a-descriptions-item>
              <a-descriptions-item label="快递鸟">
                访问 <a-link href="http://www.kdniao.com/" target="_blank">快递鸟官网</a-link> 申请商户ID和App Key
              </a-descriptions-item>
              <a-descriptions-item label="功能说明">
                配置API后，发货时自动获取物流轨迹，无需手动录入
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:visible="companyModalVisible"
      :title="isEditCompany ? '编辑物流公司' : '添加物流公司'"
      :width="500"
      @ok="handleSaveCompany"
    >
      <a-form :model="companyForm" layout="vertical">
        <a-form-item label="物流公司名称" required>
          <a-input v-model="companyForm.name" placeholder="如：顺丰速运" />
        </a-form-item>
        <a-form-item label="公司编码" required>
          <a-input v-model="companyForm.code" placeholder="如：SF" />
        </a-form-item>
        <a-form-item label="API编码" required>
          <a-input v-model="companyForm.apiCode" placeholder="用于API调用，如：shunfeng" />
        </a-form-item>
        <a-form-item label="类型">
          <a-radio-group v-model="companyForm.type">
            <a-radio value="express">快递</a-radio>
            <a-radio value="logistics">物流</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="支持服务">
          <a-checkbox-group v-model="companyForm.services">
            <a-checkbox value="标准快递">标准快递</a-checkbox>
            <a-checkbox value="特快专递">特快专递</a-checkbox>
            <a-checkbox value="大件物流">大件物流</a-checkbox>
            <a-checkbox value="冷链运输">冷链运输</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model="companyForm.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('companies')
const searchKeyword = ref('')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const companies = ref([
  { id: '1', name: '顺丰速运', code: 'SF', apiCode: 'shunfeng', type: 'express', services: ['标准快递', '特快专递'], enabled: true },
  { id: '2', name: '中通快递', code: 'ZT', apiCode: 'zhongtong', type: 'express', services: ['标准快递'], enabled: true },
  { id: '3', name: '圆通快递', code: 'YT', apiCode: 'yuantong', type: 'express', services: ['标准快递'], enabled: true },
  { id: '4', name: '韵达快递', code: 'YD', apiCode: 'yunda', type: 'express', services: ['标准快递'], enabled: true },
  { id: '5', name: '申通快递', code: 'ST', apiCode: 'shentong', type: 'express', services: ['标准快递'], enabled: true },
  { id: '6', name: '德邦物流', code: 'DB', apiCode: 'debangwuliu', type: 'logistics', services: ['大件物流', '冷链运输'], enabled: true },
  { id: '7', name: '京东物流', code: 'JD', apiCode: 'jd', type: 'logistics', services: ['标准快递', '大件物流'], enabled: false },
])

const apiConfig = reactive({
  kuaidi100: {
    key: '',
    customer: '',
    callback: '',
  },
  kdniao: {
    ebusinessId: '',
    appKey: '',
  },
})

const companyModalVisible = ref(false)
const isEditCompany = ref(false)
const companyForm = reactive({
  id: '',
  name: '',
  code: '',
  apiCode: '',
  type: 'express',
  services: [] as string[],
  enabled: true,
})

const filteredCompanies = computed(() => {
  if (!searchKeyword.value) return companies.value
  return companies.value.filter(c => 
    c.name.includes(searchKeyword.value) || 
    c.code.includes(searchKeyword.value)
  )
})

function handleAddCompany() {
  isEditCompany.value = false
  companyForm.id = ''
  companyForm.name = ''
  companyForm.code = ''
  companyForm.apiCode = ''
  companyForm.type = 'express'
  companyForm.services = []
  companyForm.enabled = true
  companyModalVisible.value = true
}

function handleEditCompany(record: any) {
  isEditCompany.value = true
  Object.assign(companyForm, record)
  companyModalVisible.value = true
}

function handleSaveCompany() {
  if (!companyForm.name || !companyForm.code || !companyForm.apiCode) {
    Message.warning('请填写完整信息')
    return
  }
  if (isEditCompany.value) {
    const index = companies.value.findIndex(c => c.id === companyForm.id)
    if (index > -1) {
      companies.value[index] = { ...companyForm }
    }
    Message.success('修改成功')
  } else {
    companies.value.push({
      ...companyForm,
      id: `${Date.now()}`,
    })
    Message.success('添加成功')
  }
  companyModalVisible.value = false
}

function handleDeleteCompany(record: any) {
  const index = companies.value.findIndex(c => c.id === record.id)
  if (index > -1) {
    companies.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handleToggleCompany(record: any) {
  Message.success(`${record.name} 已${record.enabled ? '启用' : '禁用'}`)
}

function handleSaveApi(type: string) {
  Message.success('API配置已保存')
}

function handleTestApi(type: string) {
  Message.info('正在测试API连接...')
  setTimeout(() => {
    Message.success('API连接测试成功')
  }, 1000)
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

.company-info {
  .company-name {
    font-weight: 500;
    display: block;
  }
  .company-code {
    font-size: 12px;
    color: var(--color-text-3);
  }
}
</style>
