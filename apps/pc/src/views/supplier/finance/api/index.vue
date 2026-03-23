<template>
  <div class="page-container">
    <a-card :bordered="false" title="API对接配置">
      <a-alert type="info" style="margin-bottom: 16px">
        通过API对接，可以实现订单、库存、物流等数据的自动化同步，提高业务效率。
      </a-alert>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="api" title="API密钥管理">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="AppID">
              <span class="api-key">202403220001234567</span>
              <a-button type="text" size="small" @click="handleCopy('202403220001234567')">
                <template #icon><icon-copy /></template>
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="AppSecret">
              <span class="api-key">••••••••••••••••</span>
              <a-button type="text" size="small" @click="handleShowSecret">
                <template #icon><icon-eye /></template>
              </a-button>
              <a-button type="text" size="small" @click="handleResetSecret">
                <template #icon><icon-refresh /></template>
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">2024-01-15 10:30:00</a-descriptions-item>
            <a-descriptions-item label="最后使用时间">2024-03-22 14:25:30</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag color="green">已启用</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="IP白名单">
              <a-button type="text" size="small" @click="handleConfigIP">配置</a-button>
            </a-descriptions-item>
          </a-descriptions>

          <a-divider />

          <div class="section-title">回调地址配置</div>
          <a-form :model="callbackForm" layout="vertical" style="max-width: 600px">
            <a-form-item label="订单回调地址">
              <a-input v-model="callbackForm.orderCallback" placeholder="请输入订单状态变更回调地址" />
            </a-form-item>
            <a-form-item label="支付回调地址">
              <a-input v-model="callbackForm.paymentCallback" placeholder="请输入支付状态变更回调地址" />
            </a-form-item>
            <a-form-item label="库存回调地址">
              <a-input v-model="callbackForm.stockCallback" placeholder="请输入库存变更回调地址" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSaveCallback">保存配置</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="doc" title="API文档">
          <a-list :bordered="false">
            <a-list-item v-for="item in apiList" :key="item.name">
              <a-list-item-meta :title="item.name" :description="item.description" />
              <template #actions>
                <a-tag :color="item.method === 'GET' ? 'green' : 'blue'">{{ item.method }}</a-tag>
                <a-button type="text" size="small" @click="handleViewDoc(item)">查看文档</a-button>
              </template>
            </a-list-item>
          </a-list>
        </a-tab-pane>

        <a-tab-pane key="log" title="调用日志">
          <div class="table-actions">
            <a-space>
              <a-range-picker v-model="logDateRange" style="width: 260px" />
              <a-select v-model="logStatus" placeholder="状态" style="width: 120px" allow-clear>
                <a-option value="success">成功</a-option>
                <a-option value="fail">失败</a-option>
              </a-select>
            </a-space>
            <a-button type="outline" @click="handleExportLog">
              <template #icon><icon-download /></template>
              导出日志
            </a-button>
          </div>
          <a-table :data="logData" :pagination="logPagination" @page-change="handleLogPageChange">
            <template #columns>
              <a-table-column title="调用时间" data-index="callTime" :width="180" />
              <a-table-column title="API名称" data-index="apiName" :width="200" />
              <a-table-column title="请求方式" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.method === 'GET' ? 'green' : 'blue'">{{ record.method }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="响应状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 'success' ? 'green' : 'red'">
                    {{ record.status === 'success' ? '成功' : '失败' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="响应时间" :width="100">
                <template #cell="{ record }">
                  {{ record.responseTime }}ms
                </template>
              </a-table-column>
              <a-table-column title="请求IP" data-index="requestIP" :width="140" />
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-button type="text" size="small" @click="handleViewLogDetail(record)">详情</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="test" title="接口测试">
          <a-form :model="testForm" layout="vertical" style="max-width: 800px">
            <a-form-item label="选择接口">
              <a-select v-model="testForm.apiName" placeholder="请选择要测试的接口">
                <a-option v-for="item in apiList" :key="item.name" :value="item.name">{{ item.name }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="请求参数">
              <a-textarea v-model="testForm.params" placeholder="请输入JSON格式的请求参数" :auto-size="{ minRows: 5, maxRows: 10 }" />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleTestApi">发送请求</a-button>
                <a-button @click="handleClearTest">清空</a-button>
              </a-space>
            </a-form-item>
          </a-form>

          <div v-if="testResult" class="test-result">
            <div class="result-header">
              <span>响应结果</span>
              <a-tag :color="testResult.success ? 'green' : 'red'">
                {{ testResult.success ? '成功' : '失败' }}
              </a-tag>
            </div>
            <pre class="result-content">{{ testResult.data }}</pre>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal v-model:visible="ipConfigVisible" title="IP白名单配置" :width="500" @ok="handleSaveIP">
      <a-form layout="vertical">
        <a-form-item label="IP地址列表">
          <a-textarea v-model="ipList" placeholder="请输入IP地址，每行一个&#10;例如：&#10;192.168.1.1&#10;192.168.1.2" :auto-size="{ minRows: 5, maxRows: 10 }" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="logDetailVisible" title="调用详情" :width="700" :footer="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="调用时间">{{ currentLog?.callTime }}</a-descriptions-item>
        <a-descriptions-item label="API名称">{{ currentLog?.apiName }}</a-descriptions-item>
        <a-descriptions-item label="请求方式">{{ currentLog?.method }}</a-descriptions-item>
        <a-descriptions-item label="响应状态">
          <a-tag :color="currentLog?.status === 'success' ? 'green' : 'red'">
            {{ currentLog?.status === 'success' ? '成功' : '失败' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="响应时间">{{ currentLog?.responseTime }}ms</a-descriptions-item>
        <a-descriptions-item label="请求IP">{{ currentLog?.requestIP }}</a-descriptions-item>
      </a-descriptions>
      <div style="margin-top: 16px">
        <div class="section-title">请求参数</div>
        <pre class="code-block">{{ currentLog?.requestParams }}</pre>
      </div>
      <div style="margin-top: 16px">
        <div class="section-title">响应结果</div>
        <pre class="code-block">{{ currentLog?.responseBody }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('api')
const ipConfigVisible = ref(false)
const logDetailVisible = ref(false)
const ipList = ref('192.168.1.100\n192.168.1.101')
const logDateRange = ref([])
const logStatus = ref()
const currentLog = ref<any>(null)

const callbackForm = reactive({
  orderCallback: 'https://api.baosteel.com/callback/order',
  paymentCallback: 'https://api.baosteel.com/callback/payment',
  stockCallback: '',
})

const testForm = reactive({
  apiName: '',
  params: '',
})

const testResult = ref<any>(null)

const apiList = [
  { name: '获取订单列表', method: 'GET', description: '获取供应商订单列表信息' },
  { name: '获取订单详情', method: 'GET', description: '根据订单号获取订单详细信息' },
  { name: '确认发货', method: 'POST', description: '确认订单发货并上传物流信息' },
  { name: '获取库存列表', method: 'GET', description: '获取供应商商品库存列表' },
  { name: '更新库存', method: 'POST', description: '更新商品库存数量' },
  { name: '获取结算单列表', method: 'GET', description: '获取供应商结算单列表' },
  { name: '获取结算单详情', method: 'GET', description: '根据结算单号获取详细信息' },
]

const logData = ref([
  {
    id: '1',
    callTime: '2024-03-22 14:25:30',
    apiName: '获取订单列表',
    method: 'GET',
    status: 'success',
    responseTime: 125,
    requestIP: '192.168.1.100',
    requestParams: '{"page": 1, "pageSize": 10}',
    responseBody: '{"code": 200, "data": {"list": [], "total": 0}}',
  },
  {
    id: '2',
    callTime: '2024-03-22 14:20:15',
    apiName: '确认发货',
    method: 'POST',
    status: 'success',
    responseTime: 230,
    requestIP: '192.168.1.100',
    requestParams: '{"orderNo": "ORD202403220001", "logisticsNo": "SF1234567890"}',
    responseBody: '{"code": 200, "message": "发货成功"}',
  },
  {
    id: '3',
    callTime: '2024-03-22 13:45:20',
    apiName: '更新库存',
    method: 'POST',
    status: 'fail',
    responseTime: 85,
    requestIP: '192.168.1.101',
    requestParams: '{"skuId": "SKU001", "quantity": 100}',
    responseBody: '{"code": 400, "message": "SKU不存在"}',
  },
])

const logPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3,
})

function handleCopy(text: string) {
  navigator.clipboard.writeText(text)
  Message.success('已复制到剪贴板')
}

function handleShowSecret() {
  Message.info('AppSecret: abcdefghijklmnopqrstuvwxyz123456')
}

function handleResetSecret() {
  Message.success('AppSecret已重置，请妥善保管')
}

function handleConfigIP() {
  ipConfigVisible.value = true
}

function handleSaveIP() {
  Message.success('IP白名单配置已保存')
  ipConfigVisible.value = false
}

function handleSaveCallback() {
  Message.success('回调地址配置已保存')
}

function handleViewDoc(item: any) {
  Message.info(`查看 ${item.name} 文档`)
}

function handleExportLog() {
  Message.success('日志导出中...')
}

function handleLogPageChange(page: number) {
  logPagination.current = page
}

function handleViewLogDetail(record: any) {
  currentLog.value = record
  logDetailVisible.value = true
}

function handleTestApi() {
  if (!testForm.apiName) {
    Message.warning('请选择要测试的接口')
    return
  }
  testResult.value = {
    success: true,
    data: JSON.stringify({
      code: 200,
      message: 'success',
      data: {
        list: [],
        total: 0,
      },
    }, null, 2),
  }
}

function handleClearTest() {
  testForm.apiName = ''
  testForm.params = ''
  testResult.value = null
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.api-key {
  font-family: monospace;
  background: var(--color-fill-2);
  padding: 2px 8px;
  border-radius: 4px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--color-text-1);
}

.table-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.test-result {
  margin-top: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--color-fill-2);
    border-bottom: 1px solid var(--color-border);
  }

  .result-content {
    margin: 0;
    padding: 16px;
    background: #1a1a1a;
    color: #e6e6e6;
    font-family: monospace;
    font-size: 13px;
    overflow: auto;
    max-height: 400px;
  }
}

.code-block {
  margin: 0;
  padding: 12px;
  background: var(--color-fill-2);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
}
</style>
