<template>
  <div class="warehouse-invoice-input">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleBatchExport">
            <template #icon><icon-download /></template>
            批量导出
          </a-button>
          <a-button type="primary" @click="handleApplyInvoice">
            <template #icon><icon-plus /></template>
            申请开票
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-tab="activeTab" class="invoice-tabs">
        <a-tab-pane key="all">
          <template #title>全部 ({{ stats.totalCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="pending">
          <template #title>待开票 ({{ stats.pendingCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="invoiced">
          <template #title>已开票 ({{ stats.invoicedCount }})</template>
        </a-tab-pane>
        <a-tab-pane key="voided">
          <template #title>已作废 ({{ stats.voidedCount }})</template>
        </a-tab-pane>
      </a-tabs>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.orderNo"
            placeholder="订单编号"
            style="width: 160px"
            @search="handleSearch"
          />
          <a-input-search
            v-model="searchForm.deductionNo"
            placeholder="应扣编码"
            style="width: 160px"
            @search="handleSearch"
          />
          <a-select
            v-model="searchForm.invoiceType"
            placeholder="发票类型"
            style="width: 130px"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="match_fee">交易撮合费</a-option>
            <a-option value="sales_order">销售订单</a-option>
          </a-select>
          <a-select
            v-model="searchForm.taxType"
            placeholder="票据类型"
            style="width: 150px"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="special">增值税专用发票</a-option>
            <a-option value="general">增值税普通发票</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-table
        v-model:selected-keys="selectedRowKeys"
        :data="filteredList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="订单编号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="应扣记录编号" :width="160">
            <template #cell="{ record }">
              {{ record.invoiceType === 'sales_order' ? '—' : record.deductionNo }}
            </template>
          </a-table-column>
          <a-table-column title="发票类型" :width="110">
            <template #cell="{ record }">
              <a-tag :color="record.invoiceType === 'match_fee' ? 'purple' : 'blue'">
                {{ record.invoiceType === 'match_fee' ? '交易撮合费' : '销售订单' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="票据类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.taxType === 'special' ? 'blue' : 'cyan'">
                {{ record.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发票抬头" :width="180">
            <template #cell="{ record }">
              <div class="invoice-title">{{ record.invoiceTitle }}</div>
            </template>
          </a-table-column>
          <a-table-column title="开票金额" :width="120" align="right">
            <template #cell="{ record }">
              <span>¥{{ record.invoiceAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实际开票金额" :width="130" align="right">
            <template #cell="{ record }">
              <span class="actual-amount">¥{{ record.actualInvoiceAmount?.toLocaleString() || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="开票状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.invoiceStatus)">
                {{ getStatusText(record.invoiceStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button
                  v-if="record.invoiceStatus === 'invoiced'"
                  type="text" size="small" @click="handleDownload(record)">
                  下载
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'invoiced' && (record.voidCount || 0) < 1"
                  type="text" size="small" status="danger" @click="handleVoid(record)">
                  作废
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'voided' && record.invoiceType === 'match_fee'"
                  type="text" size="small" @click="handleReapply(record)">
                  重新开票
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="applyModalVisible"
      title="申请开票"
      :width="760"
      @ok="handleSubmitApply"
      :ok-loading="isSubmitting"
    >
      <a-form :model="applyForm" layout="vertical">
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="applyForm.invoiceType" button-style="solid">
            <a-radio value="match_fee">交易撮合费</a-radio>
            <a-radio value="sales_order">销售订单</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="票据类型" required>
          <a-radio-group v-model="applyForm.taxType" button-style="solid">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="general">增值税普通发票</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="选择应扣记录" required v-if="applyForm.invoiceType === 'match_fee'">
          <a-table
            :data="deductionList"
            :pagination="false"
            row-key="id"
            :row-selection="deductionRowSelection"
            v-model:selected-keys="selectedDeductionKeys"
            :scroll="{ y: 240 }"
          >
            <template #columns>
              <a-table-column title="应扣编号" data-index="deductionNo" :width="160" />
              <a-table-column title="订单编号" data-index="orderNo" :width="160" />
              <a-table-column title="交易撮合费" :width="130" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">¥{{ record.matchFee?.toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="创建时间" data-index="createTime" :width="160" />
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="选择销售订单" required v-if="applyForm.invoiceType === 'sales_order'">
          <a-table
            :data="availableSalesOrders"
            :pagination="false"
            row-key="id"
            :row-selection="salesOrderRowSelection"
            v-model:selected-keys="selectedSalesOrderKeys"
            :scroll="{ y: 240 }"
          >
            <template #columns>
              <a-table-column title="订单编号" data-index="orderNo" :width="160" />
              <a-table-column title="供应商名称" data-index="supplierName" :width="160" />
              <a-table-column title="订单金额" :width="130" align="right">
                <template #cell="{ record }">
                  ¥{{ record.orderAmount?.toLocaleString() }}
                </template>
              </a-table-column>
              <a-table-column title="可开票金额" :width="130" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">¥{{ record.availableAmount?.toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="创建时间" data-index="createTime" :width="160" />
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="发票抬头" required>
          <a-space style="width: 100%; align-items: flex-start">
            <a-select
              v-model="applyForm.titleId"
              placeholder="请选择发票抬头"
              style="width: 320px"
              @change="onTitleChange"
            >
              <a-option
                v-for="t in titleList"
                :key="t.id"
                :value="t.id"
                :label="t.titleName + (t.isDefault ? ' (默认)' : '')"
              />
            </a-select>
            <a-button @click="handleManageTitle">管理抬头</a-button>
          </a-space>
        </a-form-item>

        <a-form-item v-if="selectedTitle" label="发票抬头信息">
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="抬头名称">
              {{ selectedTitle.titleName }}
            </a-descriptions-item>
            <a-descriptions-item label="纳税人识别号">
              {{ selectedTitle.taxNumber || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="地址电话">
              {{ selectedTitle.addressPhone || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="开户行及账号">
              {{ selectedTitle.bankAccount || '-' }}
            </a-descriptions-item>
          </a-descriptions>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea
            v-model="applyForm.remark"
            placeholder="请输入备注（选填）"
            :max-length="200"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="viewModalVisible"
      title="发票详情"
      :width="640"
      :footer="false"
    >
      <template v-if="currentRecord">
        <a-descriptions :column="2" bordered style="margin-bottom: 16px">
          <a-descriptions-item label="订单编号" :span="2">
            {{ currentRecord.orderNo }}
          </a-descriptions-item>
          <a-descriptions-item label="应扣记录编号" :span="2">
            {{ currentRecord.invoiceType === 'sales_order' ? '—' : currentRecord.deductionNo }}
          </a-descriptions-item>
          <a-descriptions-item label="发票类型" :span="2">
            <a-tag :color="currentRecord.invoiceType === 'match_fee' ? 'purple' : 'blue'">
              {{ currentRecord.invoiceType === 'match_fee' ? '交易撮合费' : '销售订单' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="票据类型" :span="2">
            <a-tag :color="currentRecord.taxType === 'special' ? 'blue' : 'cyan'">
              {{ currentRecord.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发票抬头" :span="2">
            {{ currentRecord.invoiceTitle }}
          </a-descriptions-item>
          <a-descriptions-item label="开票金额">
            ¥{{ currentRecord.invoiceAmount?.toLocaleString() }}
          </a-descriptions-item>
          <a-descriptions-item label="实际开票金额">
            ¥{{ currentRecord.actualInvoiceAmount?.toLocaleString() || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="开票状态">
            <a-tag :color="getStatusColor(currentRecord.invoiceStatus)">
              {{ getStatusText(currentRecord.invoiceStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发票号">
            {{ currentRecord.invoiceNo || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="开票时间">
            {{ currentRecord.invoiceTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">
            {{ currentRecord.createTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="currentRecord.voidReason" label="作废原因" :span="2">
            {{ currentRecord.voidReason }}
          </a-descriptions-item>
        </a-descriptions>

        <div v-if="currentRecord.invoiceImage" class="invoice-image-section">
          <h4>发票文件</h4>
          <div class="image-preview">
            <a-image
              :src="currentRecord.invoiceImage"
              :width="200"
              :preview="true"
            />
          </div>
          <div class="image-actions">
            <a-button size="small" @click="handleDownload(currentRecord)">
              <template #icon><icon-download /></template>下载
            </a-button>
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 16px; text-align: right">
          <a-space>
            <a-button
              v-if="currentRecord.invoiceStatus === 'invoiced' && (currentRecord.voidCount || 0) < 1"
              status="danger"
              @click="handleVoid(currentRecord)">
              作废
            </a-button>
            <a-button
              v-if="currentRecord.invoiceStatus === 'voided' && currentRecord.invoiceType === 'match_fee'"
              type="primary"
              @click="handleReapply(currentRecord)">
              重新开票
            </a-button>
          </a-space>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:visible="voidModalVisible"
      title="作废发票"
      :width="480"
      @ok="handleConfirmVoid"
      :ok-loading="voidingLoading"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        <template #title>作废提示</template>
        每张发票仅允许作废1次，作废后不可恢复。确认作废该发票？
      </a-alert>
      <a-form :model="voidForm" layout="vertical">
        <a-form-item label="作废原因">
          <a-textarea
            v-model="voidForm.reason"
            placeholder="请输入作废原因（选填）"
            :max-length="200"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="titleModalVisible"
      title="发票抬头管理"
      :width="600"
      :footer="false"
    >
      <div class="title-manager">
        <a-space style="margin-bottom: 16px">
          <a-button type="primary" size="small" @click="handleAddTitle">
            <template #icon><icon-plus /></template>新增抬头
          </a-button>
        </a-space>

        <a-table :data="titleList" :pagination="false" row-key="id">
          <template #columns>
            <a-table-column title="抬头名称" data-index="titleName" :width="160" />
            <a-table-column title="纳税人识别号" data-index="taxNumber" :width="140" />
            <a-table-column title="默认" :width="60" align="center">
              <template #cell="{ record }">
                <a-tag v-if="record.isDefault" color="green">默认</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="160">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleEditTitle(record)">编辑</a-button>
                  <a-button
                    v-if="!record.isDefault"
                    type="text" size="small"
                    @click="handleSetDefault(record)">设为默认</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="titleFormVisible"
      :title="editingTitleId ? '编辑发票抬头' : '新增发票抬头'"
      :width="520"
      @ok="handleSaveTitle"
      :ok-loading="titleSaving"
    >
      <a-form :model="titleForm" layout="vertical">
        <a-form-item label="抬头名称" required>
          <a-input v-model="titleForm.titleName" placeholder="请输入单位名称" />
        </a-form-item>
        <a-form-item label="纳税人识别号" required>
          <a-input v-model="titleForm.taxNumber" placeholder="请输入纳税人识别号" />
        </a-form-item>
        <a-form-item label="地址电话">
          <a-input v-model="titleForm.addressPhone" placeholder="请输入地址和电话" />
        </a-form-item>
        <a-form-item label="开户行及账号">
          <a-input v-model="titleForm.bankAccount" placeholder="请输入开户行及账号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { TableRowSelection } from '@arco-design/web-vue/es/table/interface'

interface InvoiceRecord {
  id: string
  orderNo: string
  deductionNo: string
  invoiceTitle: string
  invoiceAmount: number
  actualInvoiceAmount?: number
  invoiceType: 'match_fee' | 'sales_order'
  taxType: 'special' | 'general'
  invoiceStatus: 'pending' | 'invoicing' | 'invoiced' | 'voided'
  invoiceNo?: string
  invoiceImage?: string
  invoiceTime?: string
  voidReason?: string
  voidCount?: number
  createTime: string
}

interface DeductionRecord {
  id: string
  deductionNo: string
  orderNo: string
  matchFee: number
  status: string
  createTime: string
}

interface SalesOrderRecord {
  id: string
  orderNo: string
  supplierName: string
  orderAmount: number
  invoicedAmount: number
  availableAmount: number
  createTime: string
}

interface InvoiceTitle {
  id: string
  titleName: string
  taxNumber: string
  addressPhone: string
  bankAccount: string
  isDefault: boolean
}

const activeTab = ref('all')
const loading = ref(false)
const isSubmitting = ref(false)
const voidingLoading = ref(false)

const selectedRowKeys = ref<string[]>([])

const rowSelection: TableRowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
}

const searchForm = ref({
  orderNo: '',
  deductionNo: '',
  invoiceType: '' as '' | 'match_fee' | 'sales_order',
  taxType: '' as '' | 'special' | 'general',
  dateRange: [] as string[],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const invoices = ref<InvoiceRecord[]>([
  {
    id: '1',
    orderNo: 'SO20240520001',
    deductionNo: 'YK20240520001',
    invoiceTitle: '深圳建筑工程有限公司',
    invoiceAmount: 12860,
    actualInvoiceAmount: 12860,
    invoiceType: 'match_fee',
    taxType: 'special',
    invoiceStatus: 'invoiced',
    invoiceNo: 'FP20240520001',
    invoiceImage: 'https://picsum.photos/seed/inv1/400/280',
    invoiceTime: '2024-05-20 16:30:00',
    voidCount: 0,
    createTime: '2024-05-19 10:00:00',
  },
  {
    id: '2',
    orderNo: 'SO20240519002',
    deductionNo: 'YK20240519001',
    invoiceTitle: '广州建设集团',
    invoiceAmount: 8650,
    actualInvoiceAmount: 8650,
    invoiceType: 'match_fee',
    taxType: 'special',
    invoiceStatus: 'invoiced',
    invoiceNo: 'FP20240519002',
    invoiceImage: 'https://picsum.photos/seed/inv2/400/280',
    invoiceTime: '2024-05-19 14:20:00',
    voidCount: 1,
    voidReason: '发票信息有误',
    createTime: '2024-05-18 09:30:00',
  },
  {
    id: '3',
    orderNo: 'SO20240518003',
    deductionNo: 'YK20240518001',
    invoiceTitle: '深圳建筑工程有限公司',
    invoiceAmount: 5000,
    invoiceType: 'match_fee',
    taxType: 'general',
    invoiceStatus: 'pending',
    createTime: '2024-05-18 16:00:00',
  },
  {
    id: '4',
    orderNo: 'SO20240517001',
    deductionNo: 'YK20240517001',
    invoiceTitle: '东莞建材贸易公司',
    invoiceAmount: 2000,
    invoiceType: 'match_fee',
    taxType: 'special',
    invoiceStatus: 'voided',
    voidReason: '抬头信息错误',
    voidCount: 1,
    createTime: '2024-05-17 11:00:00',
  },
  {
    id: '5',
    orderNo: 'SO20240516001',
    deductionNo: 'YK20240516001',
    invoiceTitle: '深圳建筑工程有限公司',
    invoiceAmount: 3500,
    actualInvoiceAmount: 3500,
    invoiceType: 'match_fee',
    taxType: 'special',
    invoiceStatus: 'invoiced',
    invoiceNo: 'FP20240516005',
    invoiceImage: 'https://picsum.photos/seed/inv5/400/280',
    invoiceTime: '2024-05-16 10:00:00',
    voidCount: 0,
    createTime: '2024-05-15 14:00:00',
  },
  {
    id: '6',
    orderNo: 'SO20240525001',
    deductionNo: '',
    invoiceTitle: '深圳建筑工程有限公司',
    invoiceAmount: 58000,
    actualInvoiceAmount: 58000,
    invoiceType: 'sales_order',
    taxType: 'special',
    invoiceStatus: 'invoiced',
    invoiceNo: 'FP20240525006',
    invoiceImage: 'https://picsum.photos/seed/inv6/400/280',
    invoiceTime: '2024-05-25 10:30:00',
    voidCount: 0,
    createTime: '2024-05-24 16:00:00',
  },
  {
    id: '7',
    orderNo: 'SO20240524002',
    deductionNo: '',
    invoiceTitle: '广州建设集团',
    invoiceAmount: 32000,
    invoiceType: 'sales_order',
    taxType: 'general',
    invoiceStatus: 'pending',
    createTime: '2024-05-23 11:00:00',
  },
])

const deductionList = ref<DeductionRecord[]>([
  { id: 'd1', deductionNo: 'YK20240520001', orderNo: 'SO20240520001', matchFee: 12860, status: 'deducted', createTime: '2024-05-19 10:00:00' },
  { id: 'd2', deductionNo: 'YK20240519001', orderNo: 'SO20240519002', matchFee: 8650, status: 'deducted', createTime: '2024-05-18 09:30:00' },
  { id: 'd3', deductionNo: 'YK20240518001', orderNo: 'SO20240518003', matchFee: 5000, status: 'deducted', createTime: '2024-05-17 16:00:00' },
  { id: 'd4', deductionNo: 'YK20240517001', orderNo: 'SO20240517001', matchFee: 3500, status: 'deducted', createTime: '2024-05-16 11:00:00' },
  { id: 'd5', deductionNo: 'YK20240515001', orderNo: 'SO20240515004', matchFee: 22000, status: 'deducted', createTime: '2024-05-15 14:00:00' },
])

const salesOrderList = ref<SalesOrderRecord[]>([
  { id: 's1', orderNo: 'SO20240525001', supplierName: '深圳建材供应有限公司', orderAmount: 128000, invoicedAmount: 58000, availableAmount: 70000, createTime: '2024-05-24 10:00:00' },
  { id: 's2', orderNo: 'SO20240524002', supplierName: '广州水泥集团', orderAmount: 86000, invoicedAmount: 0, availableAmount: 86000, createTime: '2024-05-23 14:30:00' },
  { id: 's3', orderNo: 'SO20240523003', supplierName: '东莞钢材贸易公司', orderAmount: 220000, invoicedAmount: 120000, availableAmount: 100000, createTime: '2024-05-22 09:00:00' },
  { id: 's4', orderNo: 'SO20240522004', supplierName: '佛山陶瓷有限公司', orderAmount: 45000, invoicedAmount: 45000, availableAmount: 0, createTime: '2024-05-21 16:00:00' },
])

const titleList = ref<InvoiceTitle[]>([
  { id: 't1', titleName: '深圳建筑工程有限公司', taxNumber: '91440300MA5GXXXXXX', addressPhone: '深圳市南山区科技园路1号 0755-88888888', bankAccount: '中国银行深圳科技园支行 7559 1234 5678 901', isDefault: true },
  { id: 't2', titleName: '广州建设集团', taxNumber: '91440101MA5GYYYYYY', addressPhone: '广州市天河区天河路100号 020-88888888', bankAccount: '工商银行广州天河支行 3602 1234 5678 901', isDefault: false },
  { id: 't3', titleName: '东莞建材贸易公司', taxNumber: '91441900MA5GZZZZZZ', addressPhone: '东莞市厚街镇家具大道88号 0769-88888888', bankAccount: '建设银行东莞厚街支行 4400 1234 5678 901', isDefault: false },
])

const selectedDeductionKeys = ref<string[]>([])

const selectedSalesOrderKeys = ref<string[]>([])

const deductionRowSelection: TableRowSelection = {
  type: 'checkbox',
  showCheckedAll: false,
  onlyCurrent: true,
}

const salesOrderRowSelection: TableRowSelection = {
  type: 'checkbox',
  showCheckedAll: false,
  onlyCurrent: true,
}

const availableSalesOrders = computed(() => {
  return salesOrderList.value.filter(s => s.availableAmount > 0)
})

const applyModalVisible = ref(false)
const applyForm = ref({
  invoiceType: 'match_fee' as 'match_fee' | 'sales_order',
  taxType: 'special' as 'special' | 'general',
  titleId: '',
  remark: '',
})

const selectedTitle = computed(() => {
  return titleList.value.find(t => t.id === applyForm.value.titleId) || null
})

function onTitleChange(_val: string | number | Record<string, any> | undefined) {
}

const viewModalVisible = ref(false)
const currentRecord = ref<InvoiceRecord | null>(null)

const voidModalVisible = ref(false)
const voidingRecord = ref<InvoiceRecord | null>(null)
const voidForm = ref({
  reason: '',
})

const titleModalVisible = ref(false)
const titleFormVisible = ref(false)
const editingTitleId = ref<string | null>(null)
const titleSaving = ref(false)
const titleForm = ref({
  titleName: '',
  taxNumber: '',
  addressPhone: '',
  bankAccount: '',
})

const stats = computed(() => {
  const total = invoices.value.length
  const pending = invoices.value.filter(i => i.invoiceStatus === 'pending').length
  const invoicing = invoices.value.filter(i => i.invoiceStatus === 'invoicing').length
  const invoiced = invoices.value.filter(i => i.invoiceStatus === 'invoiced').length
  const voided = invoices.value.filter(i => i.invoiceStatus === 'voided').length
  return { totalCount: total, pendingCount: pending, invoicingCount: invoicing, invoicedCount: invoiced, voidedCount: voided }
})

const filteredList = computed(() => {
  let result = invoices.value

  if (activeTab.value !== 'all') {
    result = result.filter(i => i.invoiceStatus === activeTab.value)
  }

  if (searchForm.value.orderNo) {
    const kw = searchForm.value.orderNo.toLowerCase()
    result = result.filter(i => i.orderNo.toLowerCase().includes(kw))
  }

  if (searchForm.value.deductionNo) {
    const kw = searchForm.value.deductionNo.toLowerCase()
    result = result.filter(i => i.deductionNo.toLowerCase().includes(kw))
  }

  if (searchForm.value.invoiceType) {
    result = result.filter(i => i.invoiceType === searchForm.value.invoiceType)
  }

  if (searchForm.value.taxType) {
    result = result.filter(i => i.taxType === searchForm.value.taxType)
  }

  if (searchForm.value.dateRange.length === 2) {
    const [start, end] = searchForm.value.dateRange
    result = result.filter(i => i.createTime >= start && i.createTime <= end + ' 23:59:59')
  }

  return result
})

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'orange',
    invoicing: 'blue',
    invoiced: 'green',
    voided: 'red',
  }
  return map[status] || 'gray'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待开票',
    invoicing: '开票中',
    invoiced: '已开票',
    voided: '已作废',
  }
  return map[status] || status
}

function handleApplyInvoice() {
  applyForm.value = { invoiceType: 'match_fee', taxType: 'special', titleId: '', remark: '' }
  selectedDeductionKeys.value = []
  selectedSalesOrderKeys.value = []
  const defaultTitle = titleList.value.find(t => t.isDefault)
  if (defaultTitle) {
    applyForm.value.titleId = defaultTitle.id
  }
  applyModalVisible.value = true
}

function handleSubmitApply() {
  if (!applyForm.value.titleId) {
    Message.error('请选择发票抬头')
    return
  }

  if (applyForm.value.invoiceType === 'match_fee') {
    if (selectedDeductionKeys.value.length === 0) {
      Message.error('请选择至少一条应扣记录')
      return
    }
  } else {
    if (selectedSalesOrderKeys.value.length === 0) {
      Message.error('请选择至少一个销售订单')
      return
    }
  }

  isSubmitting.value = true

  const selectedTitleItem = titleList.value.find(t => t.id === applyForm.value.titleId)

  setTimeout(() => {
    let newRecords: InvoiceRecord[] = []

    if (applyForm.value.invoiceType === 'match_fee') {
      const selectedDeductions = deductionList.value.filter(d => selectedDeductionKeys.value.includes(d.id))
      newRecords = selectedDeductions.map((d, idx) => ({
        id: 'new-' + Date.now() + '-' + idx,
        orderNo: d.orderNo,
        deductionNo: d.deductionNo,
        invoiceTitle: selectedTitleItem?.titleName || '',
        invoiceAmount: d.matchFee,
        invoiceType: 'match_fee' as const,
        taxType: applyForm.value.taxType,
        invoiceStatus: 'pending' as const,
        voidCount: 0,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }))
    } else {
      const selectedOrders = salesOrderList.value.filter(s => selectedSalesOrderKeys.value.includes(s.id))
      newRecords = selectedOrders.map((s, idx) => ({
        id: 'new-' + Date.now() + '-' + idx,
        orderNo: s.orderNo,
        deductionNo: '',
        invoiceTitle: selectedTitleItem?.titleName || '',
        invoiceAmount: s.availableAmount,
        invoiceType: 'sales_order' as const,
        taxType: applyForm.value.taxType,
        invoiceStatus: 'pending' as const,
        voidCount: 0,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }))
    }

    invoices.value = [...newRecords, ...invoices.value]
    pagination.total = invoices.value.length
    isSubmitting.value = false
    applyModalVisible.value = false
    Message.success(`已成功提交${newRecords.length}条开票申请`)
  }, 800)
}

function handleView(record: InvoiceRecord) {
  currentRecord.value = record
  viewModalVisible.value = true
}

function handleDownload(record: InvoiceRecord) {
  Message.success(`发票 ${record.invoiceNo || record.id} 下载中...`)
}

function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请先选择要导出的发票记录')
    return
  }
  Message.success(`已开始批量导出 ${selectedRowKeys.value.length} 张发票`)
}

function handleVoid(record: InvoiceRecord) {
  voidingRecord.value = record
  voidForm.value = { reason: '' }
  voidModalVisible.value = true
}

function handleConfirmVoid() {
  if (!voidingRecord.value) return

  if ((voidingRecord.value.voidCount || 0) >= 1) {
    Message.error('该发票已达到最大作废次数（1次），无法再次作废')
    voidModalVisible.value = false
    return
  }

  voidingLoading.value = true

  setTimeout(() => {
    const target = invoices.value.find(i => i.id === voidingRecord.value!.id)
    if (target) {
      target.invoiceStatus = 'voided'
      target.voidReason = voidForm.value.reason || '用户申请作废'
      target.voidCount = (target.voidCount || 0) + 1
    }
    voidingLoading.value = false
    voidModalVisible.value = false
    voidingRecord.value = null
    Message.success('发票已作废')
    viewModalVisible.value = false
  }, 500)
}

function handleReapply(record: InvoiceRecord) {
  const deduction = deductionList.value.find(d => d.deductionNo === record.deductionNo)
  applyForm.value = {
    invoiceType: record.invoiceType,
    taxType: record.taxType,
    titleId: titleList.value.find(t => t.titleName === record.invoiceTitle)?.id || '',
    remark: '',
  }
  selectedDeductionKeys.value = deduction ? [deduction.id] : []
  selectedSalesOrderKeys.value = []
  applyModalVisible.value = true
}

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredList.value.length
}

function handleReset() {
  searchForm.value = { orderNo: '', deductionNo: '', invoiceType: '', taxType: '', dateRange: [] }
  activeTab.value = 'all'
  pagination.current = 1
  pagination.total = filteredList.value.length
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleManageTitle() {
  titleModalVisible.value = true
}

function handleAddTitle() {
  editingTitleId.value = null
  titleForm.value = { titleName: '', taxNumber: '', addressPhone: '', bankAccount: '' }
  titleFormVisible.value = true
}

function handleEditTitle(record: InvoiceTitle) {
  editingTitleId.value = record.id
  titleForm.value = {
    titleName: record.titleName,
    taxNumber: record.taxNumber,
    addressPhone: record.addressPhone,
    bankAccount: record.bankAccount,
  }
  titleFormVisible.value = true
}

function handleSaveTitle() {
  if (!titleForm.value.titleName) {
    Message.error('请输入抬头名称')
    return
  }
  if (!titleForm.value.taxNumber) {
    Message.error('请输入纳税人识别号')
    return
  }

  titleSaving.value = true

  setTimeout(() => {
    if (editingTitleId.value) {
      const target = titleList.value.find(t => t.id === editingTitleId.value)
      if (target) {
        target.titleName = titleForm.value.titleName
        target.taxNumber = titleForm.value.taxNumber
        target.addressPhone = titleForm.value.addressPhone
        target.bankAccount = titleForm.value.bankAccount
      }
    } else {
      const newTitle: InvoiceTitle = {
        id: 't' + Date.now(),
        titleName: titleForm.value.titleName,
        taxNumber: titleForm.value.taxNumber,
        addressPhone: titleForm.value.addressPhone,
        bankAccount: titleForm.value.bankAccount,
        isDefault: titleList.value.length === 0,
      }
      titleList.value.push(newTitle)
    }

    titleSaving.value = false
    titleFormVisible.value = false
    Message.success(editingTitleId.value ? '抬头已更新' : '抬头已新增')
  }, 300)
}

function handleSetDefault(record: InvoiceTitle) {
  titleList.value.forEach(t => t.isDefault = false)
  record.isDefault = true
  Message.success(`已将「${record.titleName}」设为默认抬头`)
}
</script>

<style scoped lang="less">
.warehouse-invoice-input {
  :deep(.invoice-tabs) {
    margin-bottom: 16px;

    .arco-tabs-header {
      border-bottom: none;
    }
  }

  .table-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .invoice-title {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actual-amount {
    color: rgb(var(--green-6));
  }

  .form-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }

  .text-danger {
    color: rgb(var(--danger-6));
  }

  .invoice-image-section {
    border-top: 1px solid var(--color-border-1);
    padding-top: 16px;
    margin-top: 16px;

    h4 {
      margin: 0 0 12px;
      font-weight: 600;
    }

    .image-preview {
      margin-bottom: 12px;
    }
  }
}
</style>
