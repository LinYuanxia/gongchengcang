<template>
  <div class="warehouse-invoice-output">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleApplyInvoice">
            <template #icon><icon-plus /></template>
            申请开票
          </a-button>
          <a-button @click="handleBatchExport">
            <template #icon><icon-download /></template>
            批量导出
          </a-button>
        </a-space>
      </template>



      <a-tabs v-model:active-tab="activeTab" class="invoice-tabs">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="pending" title="待开票" />
        <a-tab-pane key="done" title="已开票" />
        <a-tab-pane key="voided" title="已作废" />
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
            v-model="searchForm.buyerName"
            placeholder="施工方名称"
            style="width: 160px"
            @search="handleSearch"
          />
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
        :data="filteredList"
        :loading="loading"
        :pagination="pagination"
        v-model:selected-keys="selectedRowKeys"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="销售订单号" :width="160">
            <template #cell="{ record }">
              <a-link>{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="票据类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.taxType === 'special' ? 'blue' : 'cyan'">
                {{ record.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="施工方（购方）" :width="180">
            <template #cell="{ record }">
              <div class="invoice-title">{{ record.buyerName }}</div>
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
          <a-table-column title="发票号" :width="140">
            <template #cell="{ record }">
              {{ record.invoiceNo || '-' }}
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
          <a-table-column title="操作" :width="280" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button
                  v-if="record.invoiceStatus === 'pending'"
                  type="text" size="small" status="success" @click="handleInvoice(record)">
                  开票
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'done'"
                  type="text" size="small" @click="handleDownload(record)">
                  下载
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'done' && (record.voidCount || 0) < 1"
                  type="text" size="small" status="danger" @click="handleVoid(record)">
                  作废
                </a-button>
                <a-button
                  v-if="record.invoiceStatus === 'voided'"
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
      v-model:visible="invoiceModalVisible"
      title="开具发票"
      :width="760"
      @ok="handleSubmitInvoice"
      @close="resetOcr"
      :ok-loading="isSubmitting"
    >
      <a-form :model="invoiceForm" layout="vertical">
        <a-alert type="info" :closable="false" style="margin-bottom: 16px">
          请上传发票文件完成开票，仅支持上传发票文件，不支持在线开票
        </a-alert>

        <a-form-item v-if="isNewApply" label="选择已完成销售订单" required>
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
              <a-table-column title="施工方名称" data-index="buyerName" :width="150" />
              <a-table-column title="订单金额" :width="130" align="right">
                <template #cell="{ record }">
                  ¥{{ record.totalAmount?.toLocaleString() }}
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

        <a-form-item label="票据类型" required>
          <a-radio-group v-model="invoiceForm.taxType" button-style="solid">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="general">增值税普通发票</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="订单编号">
              <a-input :value="invoiceForm.orderNo" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="施工方">
              <a-input :value="invoiceForm.buyerName" disabled />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开票金额" required>
              <a-input-number
                v-model="invoiceForm.amount"
                :min="0.01"
                :max="invoiceForm.maxAmount || 99999999"
                :precision="2"
                placeholder="请输入开票金额"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发票号码" required>
              <a-input v-model="invoiceForm.invoiceNo" placeholder="请输入发票号码" maxlength="20" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="发票抬头" required>
          <a-input v-model="invoiceForm.invoiceTitle" placeholder="请输入发票抬头" />
        </a-form-item>

        <a-form-item label="纳税人识别号" required>
          <a-input v-model="invoiceForm.taxNumber" placeholder="请输入纳税人识别号" />
        </a-form-item>

        <a-form-item label="发票文件" required>
          <div v-if="ocrState === 'pending' || ocrState === 'failed'">
            <a-upload
              :custom-request="handleUploadInvoiceFile"
              :show-file-list="false"
              accept=".pdf,.jpg,.png"
            >
              <template #upload-button>
                <a-button>
                  <template #icon><icon-upload /></template>
                  {{ ocrState === 'failed' ? '重新上传发票' : '上传发票文件' }}
                </a-button>
              </template>
            </a-upload>
            <div class="upload-tip">支持 PDF、JPG、PNG 格式，单个文件不超过10MB，上传后自动OCR识别</div>
          </div>

          <div v-if="ocrState === 'recognizing'" class="ocr-processing">
            <a-progress :percent="100" status="warning" :stroke-width="8">
              <template #text>
                <icon-loading />
              </template>
            </a-progress>
            <div style="text-align: center; margin-top: 8px; color: var(--color-text-3);">
              OCR识别中，请稍候...
            </div>
          </div>
        </a-form-item>

        <template v-if="ocrState === 'success' && ocrResult">
          <a-divider>OCR识别结果</a-divider>

          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="识别金额" :span="2">
              <span :class="{ 'match-success': ocrResult.amountMatch, 'match-fail': !ocrResult.amountMatch }">
                ¥{{ ocrResult.recognizedAmount.toLocaleString() }}
              </span>
              <a-tag :color="ocrResult.amountMatch ? 'green' : 'red'" style="margin-left: 8px">
                {{ ocrResult.amountMatch ? '金额一致' : '金额不一致' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="发票代码">{{ ocrResult.invoiceCode }}</a-descriptions-item>
            <a-descriptions-item label="发票号码">{{ ocrResult.invoiceNo }}</a-descriptions-item>
            <a-descriptions-item label="开票日期">{{ ocrResult.invoiceDate }}</a-descriptions-item>
            <a-descriptions-item label="销售方">{{ ocrResult.sellerName }}</a-descriptions-item>
            <a-descriptions-item label="购买方" :span="2">{{ ocrResult.buyerName }}</a-descriptions-item>
          </a-descriptions>

          <a-collapse :default-active-key="['product']" style="margin-top: 12px">
            <a-collapse-item key="product" header="商品明细核对">
              <a-table :data="ocrResult.items" :pagination="false" size="small" bordered>
                <template #columns>
                  <a-table-column title="商品名称" data-index="productName" />
                  <a-table-column title="数量" data-index="quantity" :width="80" />
                  <a-table-column title="单位" data-index="unit" :width="60" />
                  <a-table-column title="单价" data-index="unitPrice" :width="100" align="right">
                    <template #cell="{ record }">¥{{ record.unitPrice.toLocaleString() }}</template>
                  </a-table-column>
                  <a-table-column title="金额" data-index="amount" :width="120" align="right">
                    <template #cell="{ record }">¥{{ record.amount.toLocaleString() }}</template>
                  </a-table-column>
                  <a-table-column title="比对" :width="100">
                    <template #cell="{ record, rowIndex }">
                      <template v-if="currentRecord?.orderItems?.[rowIndex]">
                        <a-tag
                          :color="record.quantity === currentRecord.orderItems[rowIndex].quantity ? 'green' : 'red'"
                          size="small"
                        >
                          {{ record.quantity === currentRecord.orderItems[rowIndex].quantity ? '一致' : '不一致' }}
                        </a-tag>
                      </template>
                      <template v-else>
                        <a-tag color="gray" size="small">-</a-tag>
                      </template>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
              <div v-if="ocrResult.quantityMatch" class="ocr-qualified">
                <icon-check-circle style="color: rgb(var(--green-6)); margin-right: 4px;" />
                商品数量核对一致
              </div>
              <div v-else class="ocr-unqualified">
                <icon-close-circle style="color: rgb(var(--red-6)); margin-right: 4px;" />
                商品数量核对不一致，请检查发票
              </div>
            </a-collapse-item>
          </a-collapse>

          <a-alert
            v-if="ocrResult.qualified"
            type="success"
            :closable="false"
            style="margin-top: 12px"
          >
            <template #title>OCR识别合格，可提交开票</template>
            发票金额和商品数量均已通过校验
          </a-alert>
          <a-alert
            v-else
            type="error"
            :closable="false"
            style="margin-top: 12px"
          >
            <template #title>OCR识别校验未通过</template>
            <template v-if="!ocrResult.amountMatch">识别金额与订单金额不一致，</template>
            <template v-if="!ocrResult.quantityMatch">商品数量与订单不符，请核对后重新上传发票</template>
          </a-alert>
        </template>

        <template v-if="ocrState === 'failed'">
          <a-divider>OCR识别失败</a-divider>
          <a-result status="error" title="OCR识别失败">
            <template #subtitle>
              未能识别发票上的有效信息，可能是图片不清晰或格式不正确
            </template>
            <template #extra>
              <a-button type="primary" @click="resetOcr">重新上传发票</a-button>
            </template>
          </a-result>
        </template>

        <a-form-item label="备注">
          <a-textarea
            v-model="invoiceForm.remark"
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
          <a-descriptions-item label="销售订单号" :span="2">
            {{ currentRecord.orderNo }}
          </a-descriptions-item>
          <a-descriptions-item label="施工方（购方）" :span="2">
            {{ currentRecord.buyerName }}
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
          <a-descriptions-item label="票据类型">
            <a-tag :color="currentRecord.taxType === 'special' ? 'blue' : 'cyan'">
              {{ currentRecord.taxType === 'special' ? '增值税专用发票' : '增值税普通发票' }}
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

        <div v-if="currentRecord.invoiceFile" class="invoice-image-section">
          <h4>发票文件</h4>
          <div class="image-preview">
            <a-image
              :src="currentRecord.invoiceFile"
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
              v-if="currentRecord.invoiceStatus === 'done' && (currentRecord.voidCount || 0) < 1"
              status="danger"
              @click="handleVoid(currentRecord)">
              作废
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { TableRowSelection } from '@arco-design/web-vue/es/table/interface'

interface OrderItem {
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

interface InvoiceRecord {
  id: string
  orderNo: string
  buyerName: string
  invoiceAmount: number
  actualInvoiceAmount?: number
  invoiceStatus: 'pending' | 'done' | 'voided'
  taxType: 'special' | 'general'
  invoiceNo?: string
  invoiceFile?: string
  invoiceTime?: string
  voidReason?: string
  voidCount?: number
  createTime: string
  orderItems?: OrderItem[]
}

interface SalesOrder {
  id: string
  orderNo: string
  buyerName: string
  totalAmount: number
  invoicedAmount: number
  availableAmount: number
  createTime: string
  items: OrderItem[]
}

type OcrState = 'pending' | 'recognizing' | 'success' | 'failed'

interface OcrResult {
  recognizedAmount: number
  recognizedQuantity: number
  invoiceNo: string
  invoiceCode: string
  invoiceDate: string
  sellerName: string
  buyerName: string
  items: OrderItem[]
  amountMatch: boolean
  quantityMatch: boolean
  qualified: boolean
}

const activeTab = ref('all')
const loading = ref(false)
const isSubmitting = ref(false)
const voidingLoading = ref(false)
const isNewApply = ref(false)

const selectedRowKeys = ref<string[]>([])

const rowSelection: TableRowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
}

const selectedSalesOrderKeys = ref<string[]>([])

const salesOrderRowSelection: TableRowSelection = {
  type: 'radio',
  showCheckedAll: false,
  onlyCurrent: true,
}

watch(selectedSalesOrderKeys, (keys) => {
  if (keys.length > 0) {
    const order = salesOrderList.value.find(s => s.id === keys[0])
    if (order) {
      onOrderSelect(order)
    }
  }
})

const searchForm = ref({
  orderNo: '',
  buyerName: '',
  taxType: '' as '' | 'special' | 'general',
  dateRange: [] as string[],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const salesOrderList = ref<SalesOrder[]>([
  {
    id: 's1',
    orderNo: 'SO202401150001',
    buyerName: '中建八局',
    totalAmount: 560000,
    invoicedAmount: 0,
    availableAmount: 560000,
    createTime: '2024-01-15 10:00:00',
    items: [
      { productName: '螺纹钢 HRB400E Φ25', quantity: 80, unit: '吨', unitPrice: 4850, amount: 388000 },
      { productName: '盘螺 HRB400E Φ8', quantity: 40, unit: '吨', unitPrice: 3300, amount: 132000 },
      { productName: '线材 HPB300 Φ10', quantity: 10, unit: '吨', unitPrice: 4000, amount: 40000 },
    ],
  },
  {
    id: 's2',
    orderNo: 'SO202401160001',
    buyerName: '北京城建集团',
    totalAmount: 780000,
    invoicedAmount: 200000,
    availableAmount: 580000,
    createTime: '2024-01-16 14:00:00',
    items: [
      { productName: '水泥 P.O42.5', quantity: 400, unit: '吨', unitPrice: 420, amount: 168000 },
      { productName: '砂石 中砂', quantity: 600, unit: '吨', unitPrice: 180, amount: 108000 },
      { productName: '碎石 5-25mm', quantity: 800, unit: '吨', unitPrice: 150, amount: 120000 },
      { productName: '粉煤灰 二级', quantity: 200, unit: '吨', unitPrice: 320, amount: 64000 },
    ],
  },
  {
    id: 's3',
    orderNo: 'SO202401170001',
    buyerName: '中国建筑西南院',
    totalAmount: 420000,
    invoicedAmount: 0,
    availableAmount: 420000,
    createTime: '2024-01-17 09:00:00',
    items: [
      { productName: '镀锌钢管 DN100', quantity: 200, unit: '米', unitPrice: 258, amount: 51600 },
      { productName: '镀锌钢管 DN50', quantity: 150, unit: '米', unitPrice: 168, amount: 25200 },
      { productName: '角钢 L50*5', quantity: 60, unit: '吨', unitPrice: 4200, amount: 252000 },
      { productName: '钢板 Q235 10mm', quantity: 30, unit: '吨', unitPrice: 3900, amount: 117000 },
    ],
  },
])

const availableSalesOrders = computed(() => {
  return salesOrderList.value.filter(s => s.availableAmount > 0)
})

const invoices = ref<InvoiceRecord[]>([
  {
    id: '1',
    orderNo: 'SO202401100001',
    buyerName: '中建一局集团',
    invoiceAmount: 650000,
    actualInvoiceAmount: 650000,
    invoiceStatus: 'done',
    taxType: 'special',
    invoiceNo: 'FP20240115001',
    invoiceFile: 'https://picsum.photos/seed/out1/400/280',
    invoiceTime: '2024-01-15 10:00:00',
    voidCount: 0,
    createTime: '2024-01-14 16:00:00',
    orderItems: [
      { productName: '螺纹钢 HRB400E Φ25', quantity: 100, unit: '吨', unitPrice: 4850, amount: 485000 },
      { productName: '盘螺 HRB400E Φ8', quantity: 50, unit: '吨', unitPrice: 3300, amount: 165000 },
    ],
  },
  {
    id: '2',
    orderNo: 'SO202401120001',
    buyerName: '中铁二局工程公司',
    invoiceAmount: 480000,
    invoiceStatus: 'pending',
    taxType: 'special',
    createTime: '2024-01-12 14:00:00',
    orderItems: [
      { productName: '水泥 P.O42.5', quantity: 500, unit: '吨', unitPrice: 420, amount: 210000 },
      { productName: '砂石 中砂', quantity: 600, unit: '吨', unitPrice: 180, amount: 108000 },
      { productName: '碎石 5-25mm', quantity: 400, unit: '吨', unitPrice: 150, amount: 60000 },
      { productName: '粉煤灰 二级', quantity: 100, unit: '吨', unitPrice: 320, amount: 32000 },
    ],
  },
  {
    id: '3',
    orderNo: 'SO202401140001',
    buyerName: '广东建工集团',
    invoiceAmount: 120000,
    invoiceStatus: 'pending',
    taxType: 'general',
    createTime: '2024-01-14 10:00:00',
    orderItems: [
      { productName: '镀锌钢管 DN100', quantity: 200, unit: '米', unitPrice: 258, amount: 51600 },
      { productName: '镀锌钢管 DN50', quantity: 150, unit: '米', unitPrice: 168, amount: 25200 },
      { productName: '弯头 DN100', quantity: 80, unit: '个', unitPrice: 28, amount: 2240 },
      { productName: '密封垫片', quantity: 200, unit: '个', unitPrice: 42, amount: 8400 },
    ],
  },
  {
    id: '4',
    orderNo: 'SO202401080001',
    buyerName: '上海建工集团',
    invoiceAmount: 860000,
    actualInvoiceAmount: 860000,
    invoiceStatus: 'done',
    taxType: 'special',
    invoiceNo: 'FP20240110001',
    invoiceFile: 'https://picsum.photos/seed/out4/400/280',
    invoiceTime: '2024-01-10 16:30:00',
    voidCount: 0,
    createTime: '2024-01-09 11:00:00',
    orderItems: [
      { productName: '钢绞线 Φ15.2', quantity: 120, unit: '吨', unitPrice: 5200, amount: 624000 },
      { productName: '锚具 M15-4', quantity: 500, unit: '套', unitPrice: 85, amount: 42500 },
      { productName: '波纹管 Φ内70', quantity: 3000, unit: '米', unitPrice: 28, amount: 84000 },
    ],
  },
  {
    id: '5',
    orderNo: 'SO202401050001',
    buyerName: '中建三局建设公司',
    invoiceAmount: 320000,
    actualInvoiceAmount: 320000,
    invoiceStatus: 'voided',
    taxType: 'special',
    invoiceNo: 'FP20240106001',
    voidReason: '开票信息有误',
    voidCount: 1,
    createTime: '2024-01-05 09:00:00',
    orderItems: [
      { productName: '加气块 600*200*200', quantity: 300, unit: '立方米', unitPrice: 280, amount: 84000 },
      { productName: '加气块 600*200*100', quantity: 200, unit: '立方米', unitPrice: 280, amount: 56000 },
      { productName: '砌筑砂浆 M5', quantity: 100, unit: '吨', unitPrice: 350, amount: 35000 },
      { productName: '抹灰砂浆 M10', quantity: 150, unit: '吨', unitPrice: 380, amount: 57000 },
    ],
  },
])

const invoiceModalVisible = ref(false)
const currentRecord = ref<InvoiceRecord | null>(null)

const invoiceForm = ref({
  selectedOrderId: '',
  taxType: 'special' as 'special' | 'general',
  orderNo: '',
  buyerName: '',
  amount: 0,
  maxAmount: 0,
  invoiceNo: '',
  invoiceTitle: '',
  taxNumber: '',
  remark: '',
})

const viewModalVisible = ref(false)

const ocrState = ref<OcrState>('pending')
const ocrResult = ref<OcrResult | null>(null)
const ocrRetryCount = ref(0)

const voidModalVisible = ref(false)
const voidingRecord = ref<InvoiceRecord | null>(null)
const voidForm = ref({
  reason: '',
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

  if (searchForm.value.buyerName) {
    const kw = searchForm.value.buyerName.toLowerCase()
    result = result.filter(i => i.buyerName.toLowerCase().includes(kw))
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
    done: 'green',
    voided: 'red',
  }
  return map[status] || 'gray'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待开票',
    done: '已开票',
    voided: '已作废',
  }
  return map[status] || status
}

function resetOcr() {
  ocrState.value = 'pending'
  ocrResult.value = null
}

function resetInvoiceForm() {
  invoiceForm.value = {
    selectedOrderId: '',
    taxType: 'special',
    orderNo: '',
    buyerName: '',
    amount: 0,
    maxAmount: 0,
    invoiceNo: '',
    invoiceTitle: '',
    taxNumber: '',
    remark: '',
  }
}

function onOrderSelect(order: SalesOrder) {
  invoiceForm.value.orderNo = order.orderNo
  invoiceForm.value.buyerName = order.buyerName
  invoiceForm.value.amount = order.availableAmount
  invoiceForm.value.maxAmount = order.availableAmount
  invoiceForm.value.invoiceTitle = order.buyerName
  invoiceForm.value.taxNumber = ''
  currentRecord.value = {
    id: 'new-' + Date.now(),
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    invoiceAmount: order.availableAmount,
    invoiceStatus: 'pending',
    taxType: invoiceForm.value.taxType,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    orderItems: order.items,
  }
}

function handleApplyInvoice() {
  isNewApply.value = true
  resetInvoiceForm()
  resetOcr()
  currentRecord.value = null
  selectedSalesOrderKeys.value = []
  invoiceModalVisible.value = true
}

function handleInvoice(record: InvoiceRecord) {
  isNewApply.value = false
  currentRecord.value = record
  invoiceForm.value = {
    selectedOrderId: '',
    taxType: record.taxType,
    orderNo: record.orderNo,
    buyerName: record.buyerName,
    amount: record.invoiceAmount,
    maxAmount: record.invoiceAmount,
    invoiceNo: '',
    invoiceTitle: record.buyerName,
    taxNumber: '',
    remark: '',
  }
  resetOcr()
  invoiceModalVisible.value = true
}

function handleUploadInvoiceFile(options: any) {
  const { onProgress, onSuccess, onError } = options
  ocrState.value = 'recognizing'

  let progress = 0
  const progressTimer = setInterval(() => {
    progress += 20
    onProgress(progress)
    if (progress >= 100) {
      clearInterval(progressTimer)

      setTimeout(() => {
        const orderItems = currentRecord.value?.orderItems
        const totalQty = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

        const recognizedInvoiceNo = `FP${Date.now()}`
        const matched = Math.random() > 0.15

        if (matched) {
          const result: OcrResult = {
            recognizedAmount: currentRecord.value?.invoiceAmount || 0,
            recognizedQuantity: totalQty,
            invoiceNo: recognizedInvoiceNo,
            invoiceCode: `04400${String(Date.now()).slice(-8)}`,
            invoiceDate: new Date().toISOString().slice(0, 10),
            sellerName: '工程仓（OCR识别）',
            buyerName: currentRecord.value?.buyerName || '购买方（OCR识别）',
            items: orderItems?.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })) || [],
            amountMatch: true,
            quantityMatch: true,
            qualified: true,
          }
          ocrResult.value = result
          ocrState.value = 'success'
          invoiceForm.value.invoiceNo = result.invoiceNo
          invoiceForm.value.amount = result.recognizedAmount
          onSuccess({ recognized: true })
          Message.success('OCR识别成功，已自动填充识别信息')
        } else {
          ocrRetryCount.value++
          ocrState.value = 'failed'
          onError(new Error('OCR识别失败'))
        }
      }, 500)
    }
  }, 200)
}

function handleSubmitInvoice() {
  const record = currentRecord.value
  if (!record) {
    Message.error('请先选择销售订单')
    return
  }

  if (ocrState.value !== 'success' || !ocrResult.value?.qualified) {
    Message.error('请先上传发票并通过OCR识别校验')
    return
  }

  if (!invoiceForm.value.invoiceNo) {
    Message.error('请输入发票号码')
    return
  }
  if (!invoiceForm.value.amount || invoiceForm.value.amount <= 0) {
    Message.error('请输入开票金额')
    return
  }
  if (!invoiceForm.value.invoiceTitle) {
    Message.error('请输入发票抬头')
    return
  }
  if (!invoiceForm.value.taxNumber) {
    Message.error('请输入纳税人识别号')
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    if (isNewApply.value && record.id.startsWith('new-')) {
      const newRecord: InvoiceRecord = {
        id: 'inv-' + Date.now(),
        orderNo: record.orderNo,
        buyerName: record.buyerName,
        invoiceAmount: record.invoiceAmount,
        actualInvoiceAmount: invoiceForm.value.amount,
        invoiceStatus: 'done',
        taxType: invoiceForm.value.taxType,
        invoiceNo: invoiceForm.value.invoiceNo,
        invoiceFile: 'https://picsum.photos/seed/out' + Date.now() + '/400/280',
        invoiceTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        voidCount: 0,
        createTime: record.createTime,
        orderItems: record.orderItems,
      }
      invoices.value = [newRecord, ...invoices.value]

      const order = selectedSalesOrderKeys.value.length > 0
        ? salesOrderList.value.find(s => s.id === selectedSalesOrderKeys.value[0])
        : undefined
      if (order) {
        order.invoicedAmount += invoiceForm.value.amount
        order.availableAmount = order.totalAmount - order.invoicedAmount
      }
    } else {
      const target = invoices.value.find(i => i.id === record.id)
      if (target) {
        target.taxType = invoiceForm.value.taxType
        target.invoiceNo = invoiceForm.value.invoiceNo
        target.actualInvoiceAmount = invoiceForm.value.amount
        target.buyerName = invoiceForm.value.invoiceTitle
        target.invoiceFile = 'https://picsum.photos/seed/out' + Date.now() + '/400/280'
        target.invoiceTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        target.invoiceStatus = 'done'
        target.voidCount = 0
      }
    }

    isSubmitting.value = false
    invoiceModalVisible.value = false
    Message.success('发票开具成功')
  }, 500)
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
  const order = salesOrderList.value.find(s => s.orderNo === record.orderNo)
  isNewApply.value = false
  currentRecord.value = {
    id: 'new-' + Date.now(),
    orderNo: record.orderNo,
    buyerName: record.buyerName,
    invoiceAmount: record.invoiceAmount,
    invoiceStatus: 'pending',
    taxType: record.taxType,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    orderItems: record.orderItems,
  }
  invoiceForm.value = {
    selectedOrderId: '',
    taxType: record.taxType,
    orderNo: record.orderNo,
    buyerName: record.buyerName,
    amount: record.invoiceAmount,
    maxAmount: record.invoiceAmount,
    invoiceNo: '',
    invoiceTitle: record.buyerName,
    taxNumber: '',
    remark: '',
  }
  resetOcr()
  invoiceModalVisible.value = true
}

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredList.value.length
}

function handleReset() {
  searchForm.value = { orderNo: '', buyerName: '', taxType: '', dateRange: [] }
  activeTab.value = 'all'
  pagination.current = 1
  pagination.total = filteredList.value.length
}

function handlePageChange(page: number) {
  pagination.current = page
}
</script>

<style scoped lang="less">
.warehouse-invoice-output {
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

  .text-danger {
    color: rgb(var(--red-6));
    font-weight: 600;
  }

  .upload-tip {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
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

  .modal-actions {
    display: flex;
    justify-content: flex-end;
  }

  .ocr-processing {
    padding: 16px 0;
  }

  .match-success {
    color: rgb(var(--green-6));
    font-weight: 600;
    font-size: 16px;
  }

  .match-fail {
    color: rgb(var(--red-6));
    font-weight: 600;
    font-size: 16px;
  }

  .ocr-qualified {
    color: rgb(var(--green-6));
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-top: 8px;
  }

  .ocr-unqualified {
    color: rgb(var(--red-6));
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-top: 8px;
  }
}
</style>
