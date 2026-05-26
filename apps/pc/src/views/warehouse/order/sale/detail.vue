<template>
  <div class="sale-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button 
            v-if="order.status === 'pending' && order.paymentStatus === 'pending'" 
            type="primary" 
            @click="handleAudit"
          >
            审核
          </a-button>
          <a-button 
            v-if="order.status === 'pending' && order.paymentStatus === 'confirmed'" 
            type="primary" 
            @click="handleShip"
          >
            发货
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="订单基础信息">
        <a-descriptions-item label="订单编号">
          <a-space>
            {{ order.orderNo }}
            <icon-copy class="copy-icon" @click="handleCopyOrderNo" />
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="订单类型">
          <a-tag :color="getOrderTypeColor(order.orderType)">{{ getOrderTypeText(order.orderType) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发货状态">
          <a-tag :color="getStockOutStatusColor(order.stockOutStatus)">{{ getStockOutStatusText(order.stockOutStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPaymentStatusColor(order.paymentStatus)">{{ getPaymentStatusText(order.paymentStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="下单时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ order.completeTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="买家信息">
          {{ order.customerName }} / {{ order.customerContact }} / {{ order.customerPhone }}
        </a-descriptions-item>
        <a-descriptions-item label="收货信息" :span="2">
          {{ order.address }} / {{ order.receiverName }} / {{ order.receiverPhone }}
          <icon-copy class="copy-icon" @click="handleCopyAddress" />
        </a-descriptions-item>
        <a-descriptions-item label="所属仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额" :span="2">
          <span class="price-large">¥{{ order.amount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="实付金额" :span="2">
          <span class="price-large">¥{{ order.paidAmount }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>商品明细</h3>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="SKU名称（编码）" :width="220">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="text-sm text-gray">{{ record.skuCode }}</div>
            </template>
          </a-table-column>
          <a-table-column title="所属SPU" data-index="spuName" :width="150" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
          <a-table-column title="小记" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.subtotal }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分账系数" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.sharingRatio }}%
            </template>
          </a-table-column>
          <a-table-column title="计算金额" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.calculatedAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="交易撮合费" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.matchingFee }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <div class="total-row">
        商品合计：¥{{ order.productAmount }} | 交易撮合费合计：¥{{ order.totalMatchingFee }} | <strong>实付金额：¥{{ order.totalAmount }}</strong>
      </div>

      <a-divider />

      <h3>支付方式</h3>
      <a-table :data="order.paymentRecords" :pagination="false">
        <template #columns>
          <a-table-column title="支付单号" data-index="paymentNo" :width="160" />
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <strong>¥{{ record.amount }}</strong>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" :width="100">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.payMethod || '线下转账' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="转账凭证" :width="120">
            <template #cell="{ record }">
              <a-link v-if="record.voucher" @click="handleViewVoucher(record)">
                <icon-file /> 查看凭证
              </a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="payTime" :width="160" />
          <a-table-column title="审核状态" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getVoucherAuditStatusColor(record.voucherAuditStatus)">{{ getVoucherAuditStatusText(record.voucherAuditStatus) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="150" />
          <a-table-column title="操作" :width="100" align="center">
            <template #cell="{ record }">
              <a-button 
                v-if="record.voucherAuditStatus === 'rejected'" 
                type="primary" 
                size="small"
                @click="handleRePay"
              >
                重新支付
              </a-button>
              <span v-else>-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>订单备注</h3>
      <div class="remark-box">{{ order.remark || '暂无备注' }}</div>

      <a-divider />

      <h3>关联售后</h3>
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="关联售后记录">
          <template v-if="order.afterSaleRecords && order.afterSaleRecords.length > 0">
            <a-space direction="vertical">
              <a-link 
                v-for="record in order.afterSaleRecords" 
                :key="record.id" 
                @click="handleViewAfterSaleRecord(record)"
              >
                {{ record.recordNo }}
              </a-link>
            </a-space>
          </template>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="关联售后订单">
          <template v-if="order.afterSaleOrders && order.afterSaleOrders.length > 0">
            <a-space direction="vertical">
              <a-link 
                v-for="orderItem in order.afterSaleOrders" 
                :key="orderItem.id" 
                @click="handleViewAfterSaleOrder(orderItem)"
              >
                {{ orderItem.orderNo }}
              </a-link>
            </a-space>
          </template>
          <span v-else>-</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>发货记录</h3>
      <a-table :data="shipmentRecords" :pagination="false">
        <template #columns>
          <a-table-column title="发货日期" data-index="shipDate" :width="110" />
          <a-table-column title="发货商品数" :width="100" align="center">
            <template #cell="{ record }">
              {{ getProductCount(record) }}
            </template>
          </a-table-column>
          <a-table-column title="发货库存数" :width="100" align="right">
            <template #cell="{ record }">
              <span class="ship-qty">{{ record.totalQuantity }}件</span>
            </template>
          </a-table-column>
          <a-table-column title="是否物流" :width="80" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.hasLogistics ? 'blue' : 'default'">{{ record.hasLogistics ? '是' : '否' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发货人" data-index="operator" :width="100" />
          <a-table-column title="操作" :width="80" align="center">
            <template #cell="{ record }">
              <a-link @click="handleViewShipment(record)">查看</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <div class="shipment-summary">
        <div class="summary-stat">
          <span>累计发货 <strong class="text-primary">{{ shipmentRecords.reduce((s, r) => s + r.totalQuantity, 0) }}</strong> 件</span>
          <span class="summary-divider">|</span>
          <span>剩余 <strong class="text-warning">{{ order.pendingQuantity }}</strong> 件</span>
        </div>
      </div>

      <a-divider />

      <h3>订单日志</h3>
      <div class="log-list">
        <div v-for="(log, index) in orderLogs" :key="index" class="log-item">
          <div class="log-time">{{ log.operateTime }}</div>
          <div class="log-operator">{{ log.operator }}</div>
          <div class="log-content">{{ log.content }}</div>
        </div>
      </div>
    </a-card>

    <a-modal 
      v-model:visible="auditModalVisible" 
      title="审核收款" 
      :width="500"
      @ok="handleAuditSubmit"
      @cancel="cancelAudit"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="施工方">{{ order.customerName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span class="price">¥{{ order.totalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="实付金额">
          <span class="price">¥{{ order.totalAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ order.paymentMethod || '转账' }}</a-descriptions-item>
        <a-descriptions-item label="转账凭证" :span="2">
          <a-image 
            v-if="order.paymentVoucher" 
            :src="order.paymentVoucher" 
            width="100%" 
            style="max-height: 200px; object-fit: contain"
          />
          <span v-else>暂无凭证</span>
        </a-descriptions-item>
        <a-descriptions-item label="凭证上传备注" :span="2">
          <span v-if="order.voucherRemark">{{ order.voucherRemark }}</span>
          <span v-else class="text-gray">无</span>
        </a-descriptions-item>
      </a-descriptions>
      <a-form :model="auditForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="pass">审核通过</a-radio>
            <a-radio value="reject">审核不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="凭证审核备注">
          <a-textarea v-model="auditForm.remark" placeholder="请输入凭证审核备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="voucherPreviewVisible" 
      title="凭证预览" 
      :width="800"
      :footer="false"
    >
      <a-image 
        v-if="order.paymentVoucher" 
        :src="order.paymentVoucher" 
        width="100%" 
        style="max-height: 600px; object-fit: contain"
      />
    </a-modal>

    <a-modal 
      v-model:visible="rePayModalVisible" 
      title="重新支付" 
      :width="600"
      @ok="handleRePaySubmit"
      @cancel="cancelRePay"
    >
      <a-form :model="rePayForm" layout="vertical">
        <a-form-item label="转账凭证" required>
          <a-upload
            :custom-request="handleUploadVoucher"
            :show-file-list="true"
            accept=".jpg,.jpeg,.png,.pdf"
            limit="1"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              上传转账凭证
            </a-button>
          </a-upload>
          <div class="form-tip">支持jpg/png/pdf格式，最大10MB</div>
        </a-form-item>
        <a-form-item label="付款备注">
          <a-textarea v-model="rePayForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="shipModalVisible" 
      :title="isViewingShipment ? '查看发货' : '发货'" 
      :width="1000"
      @ok="isViewingShipment ? shipModalVisible = false : handleShipSubmit()"
      @cancel="handleShipModalCancel"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="收货地址">{{ order.address }}</a-descriptions-item>
        <a-descriptions-item label="商品数量">{{ order.items.length }} 种 / {{ order.totalQuantity }} 件</a-descriptions-item>
      </a-descriptions>
      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="发货日期" required>
          <a-date-picker 
            v-model="shipForm.shipDate" 
            placeholder="请选择发货日期"
            style="width: 100%"
            :disabled="isViewingShipment"
          />
        </a-form-item>
        <a-form-item label="发货仓库" required>
          <a-input v-model="shipForm.warehouseName" disabled />
        </a-form-item>
        <a-form-item label="是否有物流公司" required>
          <a-radio-group v-model="shipForm.hasLogistics" :disabled="isViewingShipment">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="shipForm.hasLogistics">
          <a-form-item label="物流公司" required>
            <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司" :disabled="isViewingShipment">
              <a-option value="SF">顺丰速运</a-option>
              <a-option value="YTO">圆通速递</a-option>
              <a-option value="ZTO">中通快递</a-option>
              <a-option value="YD">韵达快递</a-option>
              <a-option value="EMS">EMS</a-option>
              <a-option value="JD">京东物流</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="物流单号" required>
            <a-select 
              v-model="shipForm.trackingNos" 
              placeholder="请选择物流单号" 
              multiple
              allow-create
              :max-tag-count="3"
              :disabled="isViewingShipment"
            >
              <a-option v-for="no in trackingNoOptions" :key="no" :value="no">{{ no }}</a-option>
            </a-select>
          </a-form-item>
        </template>
        <a-form-item label="发货备注">
          <a-textarea v-model="shipForm.remark" placeholder="请输入发货备注" :rows="3" :disabled="isViewingShipment" />
        </a-form-item>
      </a-form>

      <a-divider>发货内容</a-divider>
      
      <a-table :data="shipForm.batchItems" :pagination="false" row-key="id" size="small">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="150" />
          <a-table-column title="规格型号" data-index="specification" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="批次号" data-index="batchNo" :width="180" />
          <a-table-column title="批次库存" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.batchQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="剩余库存" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #00b42a;">{{ record.remainingStock }}</span>
            </template>
          </a-table-column>
          <a-table-column title="本次发货库存" :width="120" align="right">
            <template #cell="{ record }">
              <a-input-number 
                v-model="record.shipQuantity" 
                :min="0" 
                :max="record.remainingStock"
                :precision="0"
                style="width: 100px"
                :disabled="isViewingShipment"
                @change="handleShipQuantityChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="批次备注" :width="160">
            <template #cell="{ record }">
              <span class="batch-remark">{{ record.batchRemark || '-' }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
        <a-space>
          <span>发货商品总数：<strong>{{ totalShipQuantity }}</strong> 件</span>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Empty } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

const order = ref({
  id: '1',
  orderNo: 'PO202405180001',
  orderType: 'sale',
  status: 'pending',
  paymentStatus: 'confirmed',
  stockOutStatus: 'none',
  createTime: '2024-05-18 10:30:00',
  completeTime: '',
  customerName: '杭州西湖店',
  customerContact: '张工',
  customerPhone: '138****1234',
  warehouseName: '深圳湾科技园主仓',
  address: '浙江省杭州市西湖区文三路100号',
  receiverName: '张工',
  receiverPhone: '138****1234',
  productAmount: '6,700.00',
  totalMatchingFee: '126.00',
  totalAmount: '6,700.00',
  amount: '6,700.00',
  paidAmount: '6,700.00',
  paymentMethod: '转账',
  shippedQuantity: 0,
  totalQuantity: 35,
  pendingQuantity: 35,
  totalShippedQuantity: 0,
  voucherUploadTime: '2024-05-18 11:00:00',
  voucherAuditStatus: 'pending',
  voucherRemark: '分两笔转账，第一笔5000元，第二笔1700元',
  paymentVoucher: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=bank%20transfer%20receipt%20document&image_size=landscape_4_3',
  remark: '请尽快发货，项目工期紧张，急需这批材料。',
  reissueOrderNo: 'PO202405180002',
  originalOrderNo: 'SO202401150001',
  afterSalesNo: 'AS202405180001',
  afterSaleRecords: [
    { id: '1', recordNo: 'ASR202405180001' },
    { id: '2', recordNo: 'ASR202405180002' },
  ],
  afterSaleOrders: [
    { id: '1', orderNo: 'ASO202405180001' },
  ],
  paymentRecords: [
    { 
      paymentNo: 'PAY202405180001', 
      amount: '6700.00', 
      payMethod: '线下转账', 
      voucher: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=bank%20transfer%20receipt&image_size=landscape_4_3', 
      payTime: '2024-05-18 11:00:00', 
      voucherAuditStatus: 'rejected',
      remark: '凭证信息不清晰，请重新上传'
    },
  ],
  items: [
    { 
      productName: '螺纹钢HRB400E Φ16 6m', 
      skuCode: 'SKU001',
      spuName: '螺纹钢HRB400E',
      specification: 'Φ16 6m',
      unit: '吨',
      price: '300', 
      quantity: 10, 
      subtotal: '3,000',
      sharingRatio: '2.0',
      calculatedAmount: '3,000',
      matchingFee: '60',
    },
    { 
      productName: '水泥PO42.5', 
      skuCode: 'SKU002',
      spuName: '水泥PO42.5',
      specification: 'PO42.5',
      unit: '袋',
      price: '420', 
      quantity: 5, 
      subtotal: '2,100',
      sharingRatio: '2.0',
      calculatedAmount: '2,100',
      matchingFee: '42',
    },
    { 
      productName: '瓷砖800x800mm', 
      skuCode: 'SKU003',
      spuName: '瓷砖800x800',
      specification: '800x800mm',
      unit: '块',
      price: '80', 
      quantity: 20, 
      subtotal: '1,600',
      sharingRatio: '1.5',
      calculatedAmount: '1,600',
      matchingFee: '24',
    },
  ],
})

const shipmentRecords = ref([
  {
    shipDate: '2024-05-18',
    shipTime: '2024-05-18 14:00:00',
    totalQuantity: 5,
    logisticsCompany: '顺丰',
    logisticsNo: 'SF123456789',
    operator: '张三',
    warehouseName: '深圳湾科技园主仓',
    hasLogistics: true,
    trackingNos: ['SF123456789'],
    remark: '加急发货',
    batchItems: [
      { id: 'SKU001_0', skuCode: 'SKU001', productName: '螺纹钢HRB400E Φ16 6m', specification: 'Φ16 6m', unit: '吨', batchNo: 'BSKU001001', batchQuantity: 3, remainingStock: 0, shipQuantity: 3, batchRemark: '原材料优质' },
      { id: 'SKU003_1', skuCode: 'SKU003', productName: '瓷砖800x800mm', specification: '800x800mm', unit: '块', batchNo: 'BSKU003001', batchQuantity: 2, remainingStock: 0, shipQuantity: 2, batchRemark: '加急' },
    ],
  },
  {
    shipDate: '2024-05-19',
    shipTime: '2024-05-19 10:30:00',
    totalQuantity: 30,
    logisticsCompany: '德邦',
    logisticsNo: 'DB987654321',
    operator: '李四',
    warehouseName: '深圳湾科技园主仓',
    hasLogistics: true,
    trackingNos: ['DB987654321'],
    remark: '',
    batchItems: [
      { id: 'SKU001_0', skuCode: 'SKU001', productName: '螺纹钢HRB400E Φ16 6m', specification: 'Φ16 6m', unit: '吨', batchNo: 'BSKU001002', batchQuantity: 7, remainingStock: 0, shipQuantity: 7, batchRemark: '库存充足' },
      { id: 'SKU002_0', skuCode: 'SKU002', productName: '水泥PO42.5', specification: 'PO42.5', unit: '袋', batchNo: 'BSKU002001', batchQuantity: 5, remainingStock: 0, shipQuantity: 5, batchRemark: '' },
      { id: 'SKU003_0', skuCode: 'SKU003', productName: '瓷砖800x800mm', specification: '800x800mm', unit: '块', batchNo: 'BSKU003001', batchQuantity: 18, remainingStock: 0, shipQuantity: 18, batchRemark: '' },
    ],
  },
])

const orderLogs = ref([
  { operateTime: '2024-05-18 14:00:00', operator: '工程仓', content: '开始发货' },
  { operateTime: '2024-05-18 11:20:00', operator: '工程仓', content: '审核通过' },
  { operateTime: '2024-05-18 11:00:00', operator: '施工方', content: '上传支付凭证' },
  { operateTime: '2024-05-18 10:30:00', operator: '系统', content: '订单创建' },
])

const paymentRecord = computed(() => {
  return order.value.paymentRecords && order.value.paymentRecords.length > 0 
    ? order.value.paymentRecords[0] 
    : null
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_pay: 'default',
    pending: 'warning',
    shipping: 'primary',
    completed: 'success',
    cancelled: 'default',
    closed: 'default',
  }
  return colors[status] || 'default'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending_pay: '待支付',
    pending: '待发货',
    shipping: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    closed: '已关闭',
  }
  return texts[status] || status
}

function getOrderTypeColor(orderType: string) {
  const colors: Record<string, string> = {
    sale: 'blue',
    after_sale: 'purple',
    reissue: 'orange',
  }
  return colors[orderType] || 'gray'
}

function getOrderTypeText(orderType: string) {
  const texts: Record<string, string> = {
    sale: '销售订单',
    after_sale: '售后订单',
    reissue: '补发订单',
  }
  return texts[orderType] || orderType
}

function getStockOutStatusColor(status: string) {
  const colors: Record<string, string> = {
    none: 'default',
    partial: 'warning',
    completed: 'success',
  }
  return colors[status] || 'default'
}

function getStockOutStatusText(status: string) {
  const texts: Record<string, string> = {
    none: '未发货',
    partial: '部分发货',
    completed: '已发货',
  }
  return texts[status] || status
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
  }
  return colors[status] || 'default'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已支付',
  }
  return texts[status] || status
}

function getVoucherAuditStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return colors[status] || 'default'
}

function getVoucherAuditStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function getProductCount(record: any) {
  if (!record.batchItems || record.batchItems.length === 0) return 0
  const uniqueSkus = new Set(record.batchItems.map((item: any) => item.skuCode))
  return uniqueSkus.size
}

function handleCopyOrderNo() {
  navigator.clipboard.writeText(order.value.orderNo)
  Message.success('订单编号已复制')
}

function handleCopyAddress() {
  const text = `${order.value.address} / ${order.value.receiverName} / ${order.value.receiverPhone}`
  navigator.clipboard.writeText(text)
  Message.success('收货地址已复制')
}

function handleViewVoucher(record?: any) {
  if (record && record.voucher) {
    order.value.paymentVoucher = record.voucher
  }
  voucherPreviewVisible.value = true
}

function handleViewAllOutbound() {
  Message.info('跳转至出库单列表')
}

function handleViewReissueOrder() {
  if (order.value.reissueOrderNo) {
    Message.info(`跳转至补发订单详情：${order.value.reissueOrderNo}`)
  }
}

function handleViewRelatedOrder(orderNo: string) {
  if (orderNo) {
    Message.info(`跳转至原订单详情：${orderNo}`)
  }
}

function handleViewAfterSales(afterSalesNo: string) {
  if (afterSalesNo) {
    Message.info(`跳转至售后单详情：${afterSalesNo}`)
  }
}

function handleViewAfterSaleRecord(record: any) {
  if (record && record.recordNo) {
    Message.info(`跳转至售后记录详情：${record.recordNo}`)
  }
}

function handleViewAfterSaleOrder(orderItem: any) {
  if (orderItem && orderItem.orderNo) {
    Message.info(`跳转至售后订单详情：${orderItem.orderNo}`)
  }
}

const auditModalVisible = ref(false)
const auditForm = reactive({
  result: 'pass',
  remark: '',
})

function handleAudit() {
  auditForm.result = 'pass'
  auditForm.remark = ''
  auditModalVisible.value = true
}

function handleAuditSubmit() {
  if (auditForm.result === 'pass') {
    order.value.paymentStatus = 'confirmed'
    order.value.voucherAuditStatus = 'approved'
    orderLogs.value.unshift({
      operateTime: new Date().toLocaleString(),
      operator: '工程仓',
      content: '审核通过',
    })
    Message.success('审核通过，订单状态更新为【待发货】')
  } else {
    order.value.voucherAuditStatus = 'rejected'
    orderLogs.value.unshift({
      operateTime: new Date().toLocaleString(),
      operator: '工程仓',
      content: `审核驳回：${auditForm.remark}`,
    })
    Message.info('审核已驳回')
  }
  auditModalVisible.value = false
}

function cancelAudit() {
  auditModalVisible.value = false
}

const voucherPreviewVisible = ref(false)

const trackingNoOptions = ref<string[]>(['SF1234567890', 'YTO9876543210', 'ZTO1122334455', 'JD5566778899'])

const shipModalVisible = ref(false)
const shipForm = reactive({
  warehouseName: '',
  hasLogistics: true,
  logisticsCompany: '',
  trackingNos: [] as string[],
  remark: '',
  shipDate: '',
  batchItems: [] as any[],
})

const totalShipQuantity = computed(() => {
  return shipForm.batchItems.reduce((sum: number, item: any) => sum + (item.shipQuantity || 0), 0)
})

function handleShip() {
  isViewingShipment.value = false
  shipForm.warehouseName = order.value.warehouseName
  shipForm.shipDate = new Date().toISOString().slice(0, 10)
  shipForm.hasLogistics = true
  shipForm.logisticsCompany = ''
  shipForm.trackingNos = []
  shipForm.remark = ''

  shipForm.batchItems = []
  order.value.items.forEach((item: any, itemIndex: number) => {
    const batches = [
      { batchNo: `B${item.skuCode}001`, quantity: Math.floor(item.quantity * 0.6), remark: '原材料优质' },
      { batchNo: `B${item.skuCode}002`, quantity: Math.ceil(item.quantity * 0.4), remark: '库存充足' },
    ]
    batches.forEach((batch: any, batchIndex: number) => {
      shipForm.batchItems.push({
        id: `${item.skuCode}_${batchIndex}`,
        skuCode: item.skuCode,
        productName: item.productName,
        specification: item.specification || '',
        unit: item.unit || '件',
        batchNo: batch.batchNo,
        batchQuantity: batch.quantity,
        remainingStock: batch.quantity,
        shipQuantity: 0,
        batchRemark: batch.remark || '',
      })
    })
  })

  shipModalVisible.value = true
}

function handleShipQuantityChange(record: any) {
  console.log('发货数量变更:', record)
}

function handleShipSubmit() {
  if (shipForm.hasLogistics) {
    if (!shipForm.logisticsCompany) {
      Message.warning('请选择物流公司')
      return
    }
    if (!shipForm.trackingNos || shipForm.trackingNos.length === 0) {
      Message.warning('请选择物流单号')
      return
    }
  }

  const totalShip = shipForm.batchItems.reduce((sum: number, item: any) => sum + (item.shipQuantity || 0), 0)
  if (totalShip === 0) {
    Message.warning('请填写发货数量')
    return
  }

  shipmentRecords.value.unshift({
    shipDate: shipForm.shipDate || new Date().toISOString().slice(0, 10),
    shipTime: new Date().toLocaleString(),
    totalQuantity: totalShip,
    logisticsCompany: shipForm.hasLogistics ? shipForm.logisticsCompany : '无需物流',
    logisticsNo: shipForm.hasLogistics ? (shipForm.trackingNos.join(', ') || '-') : '-',
    operator: '仓库管理员',
    warehouseName: shipForm.warehouseName,
    hasLogistics: shipForm.hasLogistics,
    trackingNos: [...shipForm.trackingNos],
    remark: shipForm.remark || '',
    batchItems: JSON.parse(JSON.stringify(shipForm.batchItems)),
  })
  order.value.status = 'shipping'
  order.value.stockOutStatus = 'completed'
  orderLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    operator: '工程仓',
    content: `发货${totalShip}件${shipForm.hasLogistics ? `，物流：${shipForm.logisticsCompany} ${shipForm.trackingNos.join(', ')}` : '，无需物流'}`,
  })
  Message.success('发货成功，已生成出库单')
  shipModalVisible.value = false
}

const isViewingShipment = ref(false)

function handleViewShipment(record: any) {
  isViewingShipment.value = true
  shipForm.warehouseName = record.warehouseName || order.value.warehouseName
  shipForm.shipDate = record.shipDate || ''
  shipForm.hasLogistics = record.hasLogistics
  shipForm.logisticsCompany = record.logisticsCompany || ''
  shipForm.trackingNos = record.trackingNos || []
  shipForm.remark = record.remark || ''
  shipForm.batchItems = record.batchItems ? JSON.parse(JSON.stringify(record.batchItems)) : []
  shipModalVisible.value = true
}

function handleShipModalCancel() {
  isViewingShipment.value = false
  shipModalVisible.value = false
}

const rePayModalVisible = ref(false)
const rePayForm = reactive({
  voucher: '',
  remark: '',
})

function handleRePay() {
  rePayForm.voucher = ''
  rePayForm.remark = ''
  rePayModalVisible.value = true
}

function handleRePaySubmit() {
  if (!rePayForm.voucher) {
    Message.warning('请上传转账凭证')
    return
  }

  if (paymentRecord.value) {
    paymentRecord.value.voucher = rePayForm.voucher
    paymentRecord.value.remark = rePayForm.remark || '-'
    paymentRecord.value.voucherAuditStatus = 'pending'
    paymentRecord.value.payTime = new Date().toLocaleString()
  }

  orderLogs.value.unshift({
    operateTime: new Date().toLocaleString(),
    operator: '施工方',
    content: '重新上传支付凭证',
  })

  rePayModalVisible.value = false
  Message.success('重新支付提交成功，等待审核')
}

function cancelRePay() {
  rePayModalVisible.value = false
}
</script>

<style scoped>
.sale-detail {
  padding: 0;
}

.copy-icon {
  cursor: pointer;
  color: var(--color-primary);
  font-size: 14px;
}

.total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-fill-3);
  text-align: right;
  font-weight: 500;
}

.remark-box {
  background: var(--color-fill-1);
  padding: 12px;
  border-radius: 4px;
  color: var(--color-text-3);
}

.shipment-summary {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-3);
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-divider {
  color: var(--color-fill-4);
}

.ship-qty {
  font-weight: 500;
}

.text-primary {
  color: var(--color-primary);
}

.log-list {
  display: flex;
  flex-direction: column;
}

.log-item {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-fill-3);
  font-size: 13px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  min-width: 160px;
  color: var(--color-text-3);
}

.log-operator {
  min-width: 80px;
  color: var(--color-text-2);
}

.log-content {
  flex: 1;
  color: var(--color-text-1);
}

.text-warning {
  color: var(--color-warning);
}

.text-success {
  color: var(--color-success);
}

.batch-remark {
  color: var(--color-text-2);
  font-size: 12px;
}
</style>