<template>
  <div class="sale-order">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleBatchExportPending">
            <template #icon><icon-download /></template>
            批量导出待发货单
          </a-button>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </a-space>
      </template>

      <div class="filter-bar">
        <a-row :gutter="16">
          <a-col :span="5">
            <a-input-search
              v-model="searchForm.orderNo"
              placeholder="订单编号"
              style="width: 100%"
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="5">
            <a-input-search
              v-model="searchForm.productInfo"
              placeholder="商品名称/SKU"
              style="width: 100%"
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="4">
            <a-select 
              v-model="searchForm.orderType" 
              placeholder="订单类型" 
              style="width: 100%" 
              allow-clear
            >
              <a-option value="all">全部</a-option>
              <a-option value="sale">销售订单</a-option>
              <a-option value="after_sale">售后订单</a-option>
              <a-option value="reissue">补发订单</a-option>
            </a-select>
          </a-col>
          <a-col :span="5">
            <a-input-search
              v-model="searchForm.receiverInfo"
              placeholder="收货人姓名/电话"
              style="width: 100%"
              @search="handleSearch"
            />
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 12px">
          <a-col :span="6">
            <a-range-picker
              v-model="searchForm.createDateRange"
              format="YYYY-MM-DD"
              placeholder="创建日期"
              style="width: 100%"
            />
          </a-col>
          <a-col :span="6">
            <a-range-picker
              v-model="searchForm.completeDateRange"
              format="YYYY-MM-DD"
              placeholder="订单完成日期"
              style="width: 100%"
            />
          </a-col>
          <a-col :span="4" style="text-align: right">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                查询
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <a-tabs v-model:active-key="activeTab" class="status-tabs">
        <a-tab-pane key="all" :title="`全部 (${stats.total})`" />
        <a-tab-pane key="pending_pay" :title="`待付款 (${stats.pending_pay})`" />
        <a-tab-pane key="pending" :title="`待发货 (${stats.pending})`" />
        <a-tab-pane key="shipping" :title="`待收货 (${stats.shipping})`" />
        <a-tab-pane key="completed" :title="`已完成 (${stats.completed})`" />
        <a-tab-pane key="cancelled" :title="`已取消 (${stats.cancelled})`" />
        <a-tab-pane key="closed" :title="`已关闭 (${stats.closed})`" />
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="pagination" @page-change="handlePageChange" row-key="id">
        <template #columns>
          <a-table-column title="订单编号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getOrderTypeColor(record.orderType)">
                {{ getOrderTypeText(record.orderType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="所属仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="买家信息" :width="180">
            <template #cell="{ record }">
              <div>{{ record.customerName }}</div>
              <div class="text-sm text-gray">{{ record.customerContact }} {{ record.customerPhone }}</div>
            </template>
          </a-table-column>
          <a-table-column title="收货信息" :width="220">
            <template #cell="{ record }">
              <div>{{ record.receiverName }} {{ record.receiverPhone }}</div>
              <div class="text-sm text-gray ellipsis">{{ record.address }}</div>
            </template>
          </a-table-column>
          <a-table-column title="购买商品数" data-index="itemCount" :width="100" align="center" />
          <a-table-column title="购买量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.totalQuantity }} {{ record.unit || '件' }}
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span v-if="record.orderType === 'sale'" class="price">¥{{ record.paidAmount }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="出库状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStockOutStatusColor(record.stockOutStatus)">
                {{ getStockOutStatusText(record.stockOutStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收款状态" :width="100">
            <template #cell="{ record }">
              <template v-if="record.orderType === 'sale'">
                <a-tag :color="getPaymentStatusColor(record.paymentStatus)">
                  {{ getPaymentStatusText(record.paymentStatus) }}
                </a-tag>
              </template>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="订单完成时间" data-index="completeTime" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">详情</a-link>
                <a-link 
                  v-if="record.status === 'pending' && record.paymentStatus === 'pending'" 
                  @click="handleConfirmPayment(record)"
                  type="primary"
                >
                  审核
                </a-link>
                <a-link 
                  v-if="record.status === 'pending' && record.paymentStatus === 'confirmed'" 
                  @click="handleShip(record)"
                  type="primary"
                >
                  发货
                </a-link>
                <a-link 
                  v-if="record.status === 'pending'" 
                  @click="handleExportPending(record)"
                >
                  导出待发货单
                </a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="confirmModalVisible" 
      title="审核收款" 
      :width="500"
      @ok="handleConfirmPaymentSubmit"
      @cancel="cancelConfirmPayment"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="施工方">{{ currentOrder.customerName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span class="price">¥{{ currentOrder.amount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="实付金额">
          <span class="price">¥{{ currentOrder.paidAmount }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '转账' }}</a-descriptions-item>
        <a-descriptions-item label="转账凭证" :span="2">
          <a-image 
            v-if="currentOrder.paymentVoucher" 
            :src="currentOrder.paymentVoucher" 
            width="100%" 
            style="max-height: 200px; object-fit: contain"
          />
          <span v-else>暂无凭证</span>
        </a-descriptions-item>
        <a-descriptions-item label="凭证上传备注" :span="2">
          <span v-if="currentOrder.voucherRemark">{{ currentOrder.voucherRemark }}</span>
          <span v-else class="text-gray">无</span>
        </a-descriptions-item>
      </a-descriptions>
      <a-form :model="confirmForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="confirmForm.result">
            <a-radio value="pass">审核通过</a-radio>
            <a-radio value="reject">审核不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="凭证审核备注">
          <a-textarea v-model="confirmForm.remark" placeholder="请输入凭证审核备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="shipModalVisible" 
      title="发货" 
      :width="900"
      @ok="handleShipSubmit"
      @cancel="shipModalVisible = false"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="收货地址">{{ currentOrder.address }}</a-descriptions-item>
        <a-descriptions-item label="商品数量">{{ currentOrder.itemCount }} 种 / {{ currentOrder.totalQuantity }} {{ currentOrder.unit }}</a-descriptions-item>
      </a-descriptions>
      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="发货日期" required>
          <a-date-picker 
            v-model="shipForm.shipDate" 
            placeholder="请选择发货日期"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="发货仓库" required>
          <a-input v-model="shipForm.warehouseName" disabled />
        </a-form-item>
        <a-form-item label="是否有物流公司" required>
          <a-radio-group v-model="shipForm.hasLogistics">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="shipForm.hasLogistics">
          <a-form-item label="物流公司" required>
            <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司">
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
            >
              <a-option v-for="no in trackingNoOptions" :key="no" :value="no">{{ no }}</a-option>
            </a-select>
          </a-form-item>
        </template>
        <a-form-item label="发货备注">
          <a-textarea v-model="shipForm.remark" placeholder="请输入发货备注" :rows="3" />
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
          <a-table-column title="批次数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.batchQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="发货数量" :width="120" align="right">
            <template #cell="{ record }">
              <a-input-number 
                v-model="record.shipQuantity" 
                :min="0" 
                :max="record.batchQuantity"
                :precision="0"
                style="width: 100px"
                @change="handleShipQuantityChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="批次备注" :width="160">
            <template #cell="{ record }">
              <a-input 
                v-model="record.batchRemark" 
                placeholder="批次备注" 
                :max-length="50"
                size="small"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
        <a-space>
          <span>发货商品总数：<strong>{{ totalShipQuantity }}</strong> {{ currentOrder.unit }}</span>
        </a-space>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="exportModalVisible" 
      title="导出待发货单" 
      :width="1400"
      :footer="false"
    >
      <a-table :data="exportData" :pagination="{ pageSize: 10 }" row-key="id">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="140" />
          <a-table-column title="所属仓库" data-index="warehouseName" :width="140" />
          <a-table-column title="买家信息" :width="120">
            <template #cell="{ record }">
              {{ record.customerName }}
            </template>
          </a-table-column>
          <a-table-column title="收货人" data-index="receiverName" :width="100" />
          <a-table-column title="手机号" data-index="receiverPhone" :width="120" />
          <a-table-column title="收货地址" data-index="address" :width="200" />
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="150" />
          <a-table-column title="规格型号" data-index="specification" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="订单商品数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.orderQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="待发货数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.pendingQuantity }}
            </template>
          </a-table-column>
        </template>
      </a-table>
      
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb; display: flex; justify-content: space-between; align-items: center;">
        <span>合计：共 <strong>{{ exportData.length }}</strong> 条记录</span>
        <a-space>
          <a-button @click="exportModalVisible = false">关闭</a-button>
          <a-button type="primary" @click="downloadExportData">
            <template #icon><icon-download /></template>
            下载Excel
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconDownload } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const activeTab = ref('all')

const searchForm = reactive({
  orderNo: '',
  productInfo: '',
  orderType: 'all',
  receiverInfo: '',
  createDateRange: [] as any[],
  completeDateRange: [] as any[],
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const orders = ref([
  { 
    id: '1', 
    orderNo: 'SO202401150001', 
    customerName: '深圳建筑工程公司',
    customerContact: '张经理',
    customerPhone: '13900139001',
    warehouseName: '深圳湾科技园主仓',
    receiverName: '王工',
    receiverPhone: '13800138001',
    address: '广东省深圳市南山区科技园北区A栋',
    itemCount: 2,
    totalQuantity: 177,
    unit: '件',
    amount: '52,300.00',
    paidAmount: '52,300.00',
    stockOutStatus: 'completed', 
    paymentStatus: 'confirmed', 
    status: 'completed', 
    orderType: 'sale',
    createTime: '2024-01-15 11:30:00',
    completeTime: '2024-01-18 14:00:00',
    paymentMethod: '转账',
    paymentVoucher: '',
    items: [
      { skuCode: 'SKU001', productName: '高强度水泥', specification: 'P.O 42.5', unit: '袋', quantity: 100, unitPrice: 32.80, amount: 3280.00 },
      { skuCode: 'SKU002', productName: '钢筋螺纹钢', specification: 'HRB400 Φ16', unit: '吨', quantity: 15, unitPrice: 3268.00, amount: 49020.00 },
    ]
  },
  { 
    id: '2', 
    orderNo: 'SO202401150002', 
    customerName: '广州装饰工程公司',
    customerContact: '李总',
    customerPhone: '13800138002',
    warehouseName: '深圳湾科技园主仓',
    receiverName: '陈师傅',
    receiverPhone: '13700137002',
    address: '广州市天河区珠江新城CBD中心',
    itemCount: 3, 
    totalQuantity: 250,
    unit: '件',
    amount: '21,400.00',
    paidAmount: '21,400.00',
    stockOutStatus: 'partial', 
    paymentStatus: 'confirmed', 
    status: 'shipping', 
    orderType: 'sale',
    createTime: '2024-01-15 15:20:00',
    completeTime: '',
    paymentMethod: '转账',
    paymentVoucher: '',
    items: [
      { skuCode: 'SKU003', productName: '防水涂料', specification: 'JS-Ⅰ型', unit: '桶', quantity: 50, unitPrice: 128.00, amount: 6400.00 },
      { skuCode: 'SKU004', productName: '瓷砖胶', specification: 'C2TE', unit: '袋', quantity: 150, unitPrice: 45.00, amount: 6750.00 },
      { skuCode: 'SKU005', productName: '勾缝剂', specification: '白色', unit: '盒', quantity: 50, unitPrice: 165.00, amount: 8250.00 },
    ]
  },
  { 
    id: '3', 
    orderNo: 'SO202401150003', 
    customerName: '东莞市政工程公司',
    customerContact: '王工',
    customerPhone: '13700137003',
    warehouseName: '福田CBD分仓',
    receiverName: '刘经理',
    receiverPhone: '13600136003',
    address: '东莞市南城街道鸿福路',
    itemCount: 5, 
    totalQuantity: 490,
    unit: '件',
    amount: '62,800.00',
    paidAmount: '62,800.00',
    stockOutStatus: 'none', 
    paymentStatus: 'pending', 
    status: 'pending', 
    orderType: 'sale',
    createTime: '2024-01-15 17:00:00',
    completeTime: '',
    paymentMethod: '转账',
    paymentVoucher: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=bank%20transfer%20receipt%20document&image_size=landscape_4_3',
    voucherRemark: '分两笔转账，第一笔50000元，第二笔2300元，附转账截图',
    items: [
      { skuCode: 'SKU001', productName: '高强度水泥', specification: 'P.O 42.5', unit: '袋', quantity: 100, unitPrice: 128.00, amount: 12800.00 },
      { skuCode: 'SKU002', productName: '钢筋螺纹钢', specification: 'HRB400 Φ16', unit: '吨', quantity: 5, unitPrice: 3268.00, amount: 16340.00 },
      { skuCode: 'SKU003', productName: '防水涂料', specification: 'JS-Ⅰ型', unit: '桶', quantity: 80, unitPrice: 128.00, amount: 10240.00 },
      { skuCode: 'SKU004', productName: '瓷砖胶', specification: 'C2TE', unit: '袋', quantity: 200, unitPrice: 45.00, amount: 9000.00 },
      { skuCode: 'SKU008', productName: '腻子粉', specification: '内墙', unit: '袋', quantity: 105, unitPrice: 89.00, amount: 9345.00 },
    ]
  },
  { 
    id: '7', 
    orderNo: 'SO202401170001', 
    customerName: '中山路桥建设公司',
    customerContact: '黄总',
    customerPhone: '13600136007',
    warehouseName: '深圳湾科技园主仓',
    receiverName: '马工',
    receiverPhone: '13500135007',
    address: '中山市东区中山五路',
    itemCount: 4, 
    totalQuantity: 360,
    unit: '件',
    amount: '39,600.00',
    paidAmount: '39,600.00',
    stockOutStatus: 'none', 
    paymentStatus: 'pending', 
    status: 'pending', 
    orderType: 'sale',
    createTime: '2024-01-17 09:30:00',
    completeTime: '',
    paymentMethod: '转账',
    paymentVoucher: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=bank%20transfer%20receipt%20document&image_size=landscape_4_3',
    voucherRemark: '银行转账，附言：工程款',
    items: [
      { skuCode: 'SKU002', productName: '钢筋螺纹钢', specification: 'HRB400 Φ14', unit: '吨', quantity: 6, unitPrice: 3200.00, amount: 19200.00 },
      { skuCode: 'SKU005', productName: '勾缝剂', specification: '灰色', unit: '盒', quantity: 100, unitPrice: 65.00, amount: 6500.00 },
      { skuCode: 'SKU006', productName: '砂石骨料', specification: '中砂', unit: '方', quantity: 80, unitPrice: 95.00, amount: 7600.00 },
      { skuCode: 'SKU007', productName: '砖', specification: '红砖', unit: '块', quantity: 3000, unitPrice: 0.15, amount: 450.00 },
    ]
  },
  { 
    id: '4', 
    orderNo: 'SO202401140001', 
    customerName: '佛山建材批发商',
    customerContact: '陈老板',
    customerPhone: '13600136004',
    warehouseName: '深圳湾科技园主仓',
    receiverName: '赵老板',
    receiverPhone: '13500135004',
    address: '佛山市禅城区季华五路',
    itemCount: 5, 
    totalQuantity: 500,
    unit: '件',
    amount: '85,000.00',
    paidAmount: '85,000.00',
    stockOutStatus: 'completed', 
    paymentStatus: 'confirmed', 
    status: 'completed', 
    orderType: 'sale',
    createTime: '2024-01-14 10:00:00',
    completeTime: '2024-01-16 16:30:00',
    paymentMethod: '转账',
    paymentVoucher: '',
    items: [
      { skuCode: 'SKU001', productName: '高强度水泥', specification: 'P.O 42.5', unit: '袋', quantity: 200, unitPrice: 128.00, amount: 25600.00 },
      { skuCode: 'SKU002', productName: '钢筋螺纹钢', specification: 'HRB400 Φ12', unit: '吨', quantity: 10, unitPrice: 3150.00, amount: 31500.00 },
      { skuCode: 'SKU003', productName: '防水涂料', specification: 'JS-Ⅰ型', unit: '桶', quantity: 100, unitPrice: 128.00, amount: 12800.00 },
      { skuCode: 'SKU006', productName: '砂石骨料', specification: '中砂', unit: '方', quantity: 50, unitPrice: 95.00, amount: 4750.00 },
      { skuCode: 'SKU007', productName: '砖', specification: '红砖', unit: '块', quantity: 5000, unitPrice: 0.15, amount: 750.00 },
    ]
  },
  { 
    id: '5', 
    orderNo: 'SO202401160001', 
    customerName: '珠海建工集团',
    customerContact: '赵经理',
    customerPhone: '13500135005',
    warehouseName: '福田CBD分仓',
    receiverName: '孙工',
    receiverPhone: '13400134005',
    address: '珠海市香洲区凤凰北路',
    itemCount: 4, 
    totalQuantity: 320,
    unit: '件',
    amount: '45,600.00',
    paidAmount: '0.00',
    stockOutStatus: 'none', 
    paymentStatus: '', 
    status: 'pending_pay', 
    orderType: 'sale',
    createTime: '2024-01-16 09:00:00',
    completeTime: '',
    paymentMethod: '转账',
    paymentVoucher: '',
    items: [
      { skuCode: 'SKU002', productName: '钢筋螺纹钢', specification: 'HRB400 Φ14', unit: '吨', quantity: 8, unitPrice: 3200.00, amount: 25600.00 },
      { skuCode: 'SKU004', productName: '瓷砖胶', specification: 'C2TE', unit: '袋', quantity: 100, unitPrice: 45.00, amount: 4500.00 },
      { skuCode: 'SKU005', productName: '勾缝剂', specification: '灰色', unit: '盒', quantity: 40, unitPrice: 165.00, amount: 6600.00 },
      { skuCode: 'SKU008', productName: '腻子粉', specification: '内墙', unit: '袋', quantity: 100, unitPrice: 89.00, amount: 8900.00 },
    ]
  },
  { 
    id: '6', 
    orderNo: 'SO202401130001', 
    customerName: '惠州建设公司',
    customerContact: '周总',
    customerPhone: '13300133006',
    warehouseName: '深圳湾科技园主仓',
    receiverName: '吴经理',
    receiverPhone: '13200132006',
    address: '惠州市惠城区下埔路',
    itemCount: 2, 
    totalQuantity: 80,
    unit: '件',
    amount: '9,800.00',
    paidAmount: '9,800.00',
    stockOutStatus: 'completed', 
    paymentStatus: 'confirmed', 
    status: 'cancelled', 
    orderType: 'after_sale',
    createTime: '2024-01-13 14:00:00',
    completeTime: '2024-01-15 10:00:00',
    paymentMethod: '转账',
    items: [
      { skuCode: 'SKU001', productName: '高强度水泥', specification: 'P.O 32.5', unit: '袋', quantity: 50, unitPrice: 32.80, amount: 1640.00 },
      { skuCode: 'SKU006', productName: '砂石骨料', specification: '细砂', unit: '方', quantity: 30, unitPrice: 95.00, amount: 2850.00 },
    ]
  },
  { 
    id: '8', 
    orderNo: 'RE202405180001', 
    customerName: '深圳建筑工程公司',
    customerContact: '张经理',
    customerPhone: '13900139001',
    warehouseName: '深圳湾科技园主仓',
    receiverName: '王工',
    receiverPhone: '13800138001',
    address: '广东省深圳市南山区科技园北区A栋',
    itemCount: 1, 
    totalQuantity: 15,
    unit: '件',
    amount: '2,400.00',
    paidAmount: '0.00',
    stockOutStatus: 'none', 
    paymentStatus: '', 
    status: 'completed', 
    orderType: 'reissue',
    createTime: '2024-05-18 10:00:00',
    completeTime: '2024-05-18 16:30:00',
    paymentMethod: '',
    originalOrderNo: 'SO202401150001',
    afterSalesNo: 'AS202405180001',
    items: [
      { skuCode: 'SKU001', productName: '高强度水泥', specification: 'P.O 42.5', unit: '袋', quantity: 15, unitPrice: 160.00, amount: 2400.00 },
    ]
  },
])

const confirmModalVisible = ref(false)
const shipModalVisible = ref(false)
const exportModalVisible = ref(false)
const exportData = ref<any[]>([])
const currentOrder = ref<any>({})
const confirmForm = reactive({
  result: 'pass',
  remark: '',
})
const shipForm = reactive({
  warehouseName: '',
  hasLogistics: true,
  logisticsCompany: '',
  trackingNos: [] as string[],
  remark: '',
  shipDate: '',
  items: [] as any[],
  batchItems: [] as any[],
})

const trackingNoOptions = ref<string[]>(['SF1234567890', 'YTO9876543210', 'ZTO1122334455', 'JD5566778899'])

const totalShipQuantity = computed(() => {
  return shipForm.batchItems.reduce((sum, item) => sum + (item.shipQuantity || 0), 0)
})

const stats = computed(() => {
  const statusCounts: Record<string, number> = {
    all: orders.value.length,
    pending_pay: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    closed: 0,
  }
  orders.value.forEach(order => {
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status]++
    }
  })
  return statusCounts
})

const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }
  
  if (searchForm.orderNo) {
    result = result.filter(o => o.orderNo.includes(searchForm.orderNo))
  }
  
  if (searchForm.productInfo) {
    result = result.filter(o => 
      (o.items || []).some((item: any) => 
        item.productName?.toLowerCase().includes(searchForm.productInfo.toLowerCase()) ||
        item.skuCode?.toLowerCase().includes(searchForm.productInfo.toLowerCase())
      )
    )
  }
  
  if (searchForm.orderType !== 'all') {
    result = result.filter(o => o.orderType === searchForm.orderType)
  }
  
  if (searchForm.receiverInfo) {
    result = result.filter(o => 
      o.receiverName.includes(searchForm.receiverInfo) ||
      o.receiverPhone.includes(searchForm.receiverInfo)
    )
  }
  
  if (searchForm.createDateRange && searchForm.createDateRange.length === 2) {
    result = result.filter(o => {
      const createTime = new Date(o.createTime).getTime()
      return createTime >= searchForm.createDateRange[0].getTime() && 
             createTime <= searchForm.createDateRange[1].getTime()
    })
  }
  
  if (searchForm.completeDateRange && searchForm.completeDateRange.length === 2 && searchForm.completeDateRange[0]) {
    result = result.filter(o => {
      if (!o.completeTime) return false
      const completeTime = new Date(o.completeTime).getTime()
      return completeTime >= searchForm.completeDateRange[0].getTime() && 
             completeTime <= searchForm.completeDateRange[1].getTime()
    })
  }

  const statusOrder = ['pending_pay', 'pending', 'shipping', 'completed', 'cancelled', 'closed']
  result.sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.status)
    const bIndex = statusOrder.indexOf(b.status)
    if (aIndex !== bIndex) {
      return aIndex - bIndex
    }
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
  
  pagination.value.total = result.length
  return result
})

function getStockOutStatusColor(status: string) {
  const colors: Record<string, string> = {
    none: 'gray',
    partial: 'orange',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStockOutStatusText(status: string) {
  const texts: Record<string, string> = {
    none: '未出库',
    partial: '部分出库',
    completed: '已出库',
  }
  return texts[status] || status
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'green',
  }
  return status ? (colors[status] || 'gray') : 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
  }
  return status ? (texts[status] || status) : '-'
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

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_pay: 'gray',
    pending: 'orange',
    shipping: 'blue',
    completed: 'green',
    cancelled: 'gray',
    closed: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending_pay: '待付款',
    pending: '待发货',
    shipping: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    closed: '已关闭',
  }
  return texts[status] || status
}

function handleSearch() {
  pagination.value.current = 1
}

function handleReset() {
  searchForm.orderNo = ''
  searchForm.productInfo = ''
  searchForm.orderType = 'all'
  searchForm.receiverInfo = ''
  searchForm.createDateRange = []
  searchForm.completeDateRange = []
  pagination.value.current = 1
}

function handlePageChange(page: number) {
  pagination.value.current = page
}

function handleExport() {
  if (filteredOrders.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  
  const orderItems: any[] = []
  let idCounter = 0
  
  filteredOrders.value.forEach(order => {
    const items = order.items || []
    if (items.length === 0) {
      orderItems.push({
        id: ++idCounter,
        orderNo: order.orderNo,
        warehouseName: order.warehouseName,
        customerName: order.customerName,
        skuCode: '-',
        productName: '无商品数据',
        specification: '-',
        unit: '-',
        quantity: 0,
      })
    } else {
      items.forEach(item => {
        orderItems.push({
          id: ++idCounter,
          orderNo: order.orderNo,
          warehouseName: order.warehouseName,
          customerName: order.customerName,
          skuCode: item.skuCode,
          productName: item.productName,
          specification: item.specification,
          unit: item.unit,
          quantity: item.quantity,
        })
      })
    }
  })
  
  exportData.value = orderItems
  exportModalVisible.value = true
}

function downloadExportData() {
  Message.success(`成功导出 ${exportData.value.length} 条订单+商品记录`)
  exportModalVisible.value = false
}

function handleView(record: any) {
  router.push(`/warehouse/order/sale/detail/${record.id}`)
}

function handleConfirmPayment(record: any) {
  currentOrder.value = record
  confirmForm.result = 'pass'
  confirmForm.remark = ''
  confirmModalVisible.value = true
}

function handleConfirmPaymentSubmit() {
  if (confirmForm.result === 'pass') {
    const order = orders.value.find(o => o.id === currentOrder.value.id)
    if (order) {
      order.paymentStatus = 'confirmed'
      Message.success('审核通过，订单已变为待发货状态')
    }
  } else {
    Message.info('审核不通过，订单状态不变')
  }
  confirmModalVisible.value = false
}

function cancelConfirmPayment() {
  confirmModalVisible.value = false
}

function handleShip(record: any) {
  currentOrder.value = record
  shipForm.warehouseName = record.warehouseName
  shipForm.shipDate = new Date().toISOString().slice(0, 10)
  shipForm.hasLogistics = true
  shipForm.logisticsCompany = ''
  shipForm.trackingNos = []
  shipForm.remark = ''
  shipForm.items = (record.items || []).map((item: any) => ({
    ...item,
    pendingQuantity: item.quantity,
    shipQuantity: 0,
    batches: [
      { batchNo: `BATCH${item.skuCode}001`, quantity: Math.floor(item.quantity * 0.6) },
      { batchNo: `BATCH${item.skuCode}002`, quantity: Math.ceil(item.quantity * 0.4) },
    ],
  }))
  
  shipForm.batchItems = []
  shipForm.items.forEach((item: any) => {
    item.batches.forEach((batch: any, index: number) => {
      shipForm.batchItems.push({
        id: `${item.skuCode}_${index}`,
        skuCode: item.skuCode,
        productName: item.productName,
        specification: item.specification,
        unit: item.unit,
        batchNo: batch.batchNo,
        batchQuantity: batch.quantity,
        shipQuantity: 0,
        batchRemark: '',
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
  
  const totalShip = shipForm.batchItems.reduce((sum, item) => sum + (item.shipQuantity || 0), 0)
  if (totalShip === 0) {
    Message.warning('请填写发货数量')
    return
  }
  
  const order = orders.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'shipping'
    order.stockOutStatus = 'completed'
  }
  
  shipModalVisible.value = false
  Message.success('发货成功，已生成出库单')
}

function handleExportPending(record: any) {
  const items = record.items || []
  if (items.length === 0) {
    Message.warning('该订单暂无商品数据')
    return
  }
  
  exportData.value = items.map((item: any, index: number) => ({
    id: index + 1,
    orderNo: record.orderNo,
    warehouseName: record.warehouseName,
    customerName: record.customerName,
    receiverName: record.receiverName,
    receiverPhone: record.receiverPhone,
    address: record.address,
    skuCode: item.skuCode,
    productName: item.productName,
    specification: item.specification,
    unit: item.unit,
    orderQuantity: item.quantity,
    pendingQuantity: item.quantity,
  }))
  
  exportModalVisible.value = true
}

function handleBatchExportPending() {
  const pendingOrders = filteredOrders.value.filter(o => o.status === 'pending')
  if (pendingOrders.length === 0) {
    Message.warning('暂无待发货订单')
    return
  }
  
  const batchExportData: any[] = []
  let idCounter = 0
  
  pendingOrders.forEach(order => {
    const items = order.items || []
    if (items.length === 0) {
      batchExportData.push({
        id: ++idCounter,
        orderNo: order.orderNo,
        warehouseName: order.warehouseName,
        customerName: order.customerName,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        address: order.address,
        skuCode: '-',
        productName: '无商品数据',
        specification: '-',
        unit: '-',
        orderQuantity: 0,
        pendingQuantity: 0,
      })
    } else {
      items.forEach(item => {
        batchExportData.push({
          id: ++idCounter,
          orderNo: order.orderNo,
          warehouseName: order.warehouseName,
          customerName: order.customerName,
          receiverName: order.receiverName,
          receiverPhone: order.receiverPhone,
          address: order.address,
          skuCode: item.skuCode,
          productName: item.productName,
          specification: item.specification,
          unit: item.unit,
          orderQuantity: item.quantity,
          pendingQuantity: item.quantity,
        })
      })
    }
  })
  
  exportData.value = batchExportData
  exportModalVisible.value = true
}
</script>

<style scoped lang="less">
.sale-order {
  padding: 16px;
}

.filter-bar {
  padding: 16px;
  background: var(--color-fill-1);
  margin-bottom: 16px;
  border-radius: 4px;
}

.status-tabs {
  margin-bottom: 16px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.text-sm {
  font-size: 12px;
}

.text-gray {
  color: #8c8c8c;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
