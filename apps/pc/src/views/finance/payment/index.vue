<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAddPayment">
          <template #icon><icon-plus /></template>
          登记支付
        </a-button>
      </template>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索支付单号/订单号/工程仓"
            style="width: 260px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.payType" placeholder="支付类型" style="width: 160px" allow-clear>
            <a-option value="warehouse_construction">工程仓→施工方</a-option>
            <a-option value="construction_warehouse">施工方→工程仓</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="支付状态" style="width: 140px" allow-clear>
            <a-option value="pending">待审核</a-option>
            <a-option value="confirmed">已确认</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 260px" allow-clear />
        </a-space>
        <a-space>
          <a-button @click="handleReset">重置</a-button>
          <a-button @click="handleExport">导出</a-button>
        </a-space>
      </div>

      <a-table
        :data="paymentList"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="支付单号" data-index="paymentNo" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.paymentNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联订单" :width="180">
            <template #cell="{ record }">
              <a-link v-if="record.orderNo" @click="handleViewOrder(record)">
                {{ record.orderNo }}
              </a-link>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="支付类型" :width="140">
            <template #cell="{ record }">
              <a-tag :color="getPayTypeColor(record.payType)">
                {{ getPayTypeText(record.payType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="付款方" data-index="payerName" :width="160" />
          <a-table-column title="收款方" data-index="payeeName" :width="160" />
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger text-lg">¥{{ record.amount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" data-index="payMethod" :width="100" />
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="payTime" :width="160" />
          <a-table-column title="操作人" data-index="operatorName" :width="100" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewDetail(record)">详情</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleConfirm(record)">确认</a-link>
                <a-link v-if="record.voucherUrl" @click="handleViewVoucher(record)">
                  凭证
                </a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="addModalVisible"
      title="登记支付记录"
      :width="800"
      @ok="handleAddConfirm"
      @cancel="cancelAdd"
    >
      <a-form :model="paymentForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="支付类型" required>
              <a-select v-model="paymentForm.payType" placeholder="请选择支付类型">
                <a-option value="warehouse_construction">工程仓→施工方</a-option>
                <a-option value="construction_warehouse">施工方→工程仓</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联订单">
              <a-select
                v-model="paymentForm.orderId"
                placeholder="请选择关联订单（选填）"
                allow-clear
                allow-search
              >
                <a-option v-for="order in orderList" :key="order.id" :value="order.id">
                  {{ order.orderNo }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="付款方" required>
              <a-select v-model="paymentForm.payerId" placeholder="请选择付款方" allow-search>
                <a-option v-for="party in payerList" :key="party.id" :value="party.id">
                  {{ party.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="收款方" required>
              <a-select v-model="paymentForm.payeeId" placeholder="请选择收款方" allow-search>
                <a-option v-for="party in payeeList" :key="party.id" :value="party.id">
                  {{ party.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="支付金额" required>
              <a-input-number
                v-model="paymentForm.amount"
                placeholder="请输入支付金额"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="支付方式">
              <a-select v-model="paymentForm.payMethod" placeholder="请选择支付方式">
                <a-option value="bank_transfer">银行转账</a-option>
                <a-option value="wechat">微信支付</a-option>
                <a-option value="alipay">支付宝</a-option>
                <a-option value="cash">现金</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="支付时间">
          <a-date-picker
            v-model="paymentForm.payTime"
            show-time
            placeholder="请选择支付时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="转账凭证">
          <a-upload
            :file-list="voucherFileList"
            list-type="picture-card"
            :auto-upload="false"
            accept="image/*"
            @change="handleVoucherChange"
          >
            <template #upload-button>
              <div class="upload-btn">
                <icon-plus />
                <div class="upload-text">上传凭证</div>
              </div>
            </template>
          </a-upload>
          <div class="form-tip">支持上传银行回单、转账截图等凭证图片</div>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model="paymentForm.remark"
            placeholder="请输入备注信息"
            :max-length="500"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="voucherModalVisible"
      title="转账凭证"
      :width="600"
      :footer="false"
    >
      <img :src="currentVoucherUrl" class="voucher-image" alt="转账凭证" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  payType: undefined as string | undefined,
  status: undefined as string | undefined,
  dateRange: undefined as any,
})

const paymentList = ref([
  { id: '1', paymentNo: 'PAY202401150001', orderNo: 'ORD202401150001', payType: 'warehouse_construction', payerName: '深圳宝安工程仓', payeeName: '中建三局施工队', amount: 150000, payMethod: '银行转账', status: 'confirmed', payTime: '2024-01-15 10:30:00', operatorName: '张三', voucherUrl: 'https://picsum.photos/400/300?random=1' },
  { id: '2', paymentNo: 'PAY202401150002', orderNo: 'ORD202401150002', payType: 'construction_warehouse', payerName: '中建三局施工队', payeeName: '深圳南山工程仓', amount: 80000, payMethod: '银行转账', status: 'pending', payTime: '2024-01-15 14:20:00', operatorName: '李四', voucherUrl: 'https://picsum.photos/400/300?random=2' },
  { id: '3', paymentNo: 'PAY202401150003', orderNo: '', payType: 'warehouse_construction', payerName: '广州天河工程仓', payeeName: '广东一建施工队', amount: 220000, payMethod: '银行转账', status: 'confirmed', payTime: '2024-01-15 16:00:00', operatorName: '王五', voucherUrl: '' },
  { id: '4', paymentNo: 'PAY202401160001', orderNo: 'ORD202401160001', payType: 'construction_warehouse', payerName: '中铁二局施工队', payeeName: '东莞工程仓', amount: 45000, payMethod: '微信支付', status: 'rejected', payTime: '2024-01-16 09:00:00', operatorName: '赵六', voucherUrl: 'https://picsum.photos/400/300?random=3' },
])

pagination.total = paymentList.value.length

const addModalVisible = ref(false)
const voucherModalVisible = ref(false)
const currentVoucherUrl = ref('')
const voucherFileList = ref<any[]>([])

const orderList = ref([
  { id: '1', orderNo: 'ORD202401150001' },
  { id: '2', orderNo: 'ORD202401150002' },
  { id: '3', orderNo: 'ORD202401160001' },
])

const payerList = ref([
  { id: '1', name: '深圳宝安工程仓' },
  { id: '2', name: '深圳南山工程仓' },
  { id: '3', name: '广州天河工程仓' },
  { id: '4', name: '东莞工程仓' },
  { id: '5', name: '中建三局施工队' },
  { id: '6', name: '广东一建施工队' },
  { id: '7', name: '中铁二局施工队' },
])

const payeeList = ref([
  { id: '1', name: '深圳宝安工程仓' },
  { id: '2', name: '深圳南山工程仓' },
  { id: '3', name: '广州天河工程仓' },
  { id: '4', name: '东莞工程仓' },
  { id: '5', name: '中建三局施工队' },
  { id: '6', name: '广东一建施工队' },
  { id: '7', name: '中铁二局施工队' },
])

const paymentForm = ref({
  payType: 'warehouse_construction',
  orderId: undefined as string | undefined,
  payerId: undefined as string | undefined,
  payeeId: undefined as string | undefined,
  amount: undefined as number | undefined,
  payMethod: 'bank_transfer',
  payTime: undefined as any,
  remark: '',
})

function getPayTypeColor(type: string) {
  const colors: Record<string, string> = {
    warehouse_construction: 'blue',
    construction_warehouse: 'purple',
  }
  return colors[type] || 'gray'
}

function getPayTypeText(type: string) {
  const texts: Record<string, string> = {
    warehouse_construction: '工程仓→施工方',
    construction_warehouse: '施工方→工程仓',
  }
  return texts[type] || type
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    confirmed: '已确认',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.info('搜索')
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.payType = undefined
  searchForm.status = undefined
  searchForm.dateRange = undefined
  Message.success('已重置')
}

function handleExport() {
  Message.info('导出')
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewDetail(record: any) {
  Message.info(`查看详情: ${record.paymentNo}`)
}

function handleViewOrder(record: any) {
  Message.info(`查看订单: ${record.orderNo}`)
}

function handleConfirm(record: any) {
  record.status = 'confirmed'
  Message.success(`支付 ${record.paymentNo} 已确认`)
}

function handleViewVoucher(record: any) {
  currentVoucherUrl.value = record.voucherUrl
  voucherModalVisible.value = true
}

function handleAddPayment() {
  paymentForm.value = {
    payType: 'warehouse_construction',
    orderId: undefined,
    payerId: undefined,
    payeeId: undefined,
    amount: undefined,
    payMethod: 'bank_transfer',
    payTime: undefined,
    remark: '',
  }
  voucherFileList.value = []
  addModalVisible.value = true
}

function handleAddConfirm() {
  if (!paymentForm.value.payerId || !paymentForm.value.payeeId || !paymentForm.value.amount) {
    Message.warning('请填写完整信息')
    return
  }
  Message.success('支付记录登记成功')
  addModalVisible.value = false
}

function cancelAdd() {
  addModalVisible.value = false
}

function handleVoucherChange(fileList: any[]) {
  voucherFileList.value = fileList
}
</script>

<style lang="less" scoped>
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: #86909c;
}

.upload-text {
  font-size: 12px;
  margin-top: 4px;
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
}

.voucher-image {
  width: 100%;
  border-radius: 4px;
}
</style>
