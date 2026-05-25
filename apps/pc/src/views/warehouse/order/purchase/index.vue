<template>
  <div class="purchase-order">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="handleReset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
          <a-button type="primary" @click="handleSearch">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="filter-row">
        <a-col :span="6">
          <a-form-item label="订单编号">
            <a-input v-model="searchForm.orderNo" placeholder="请输入订单编号" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="供应商">
            <a-select v-model="searchForm.supplierId" placeholder="请选择供应商" allow-clear>
              <a-option value="s1">广东建材有限公司</a-option>
              <a-option value="s2">上海钢材集团</a-option>
              <a-option value="s3">惠州砂石厂</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="订单类型">
            <a-select v-model="searchForm.orderType" placeholder="请选择订单类型" allow-clear>
              <a-option value="purchase">采购订单</a-option>
              <a-option value="after_sale">售后订单</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="支付状态">
            <a-select v-model="searchForm.paymentStatus" placeholder="请选择" allow-clear>
              <a-option value="unpaid">未支付</a-option>
              <a-option value="partial">部分支付</a-option>
              <a-option value="paid">已支付</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="下单时间">
            <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="收货仓库">
            <a-select v-model="searchForm.warehouse" placeholder="请选择仓库" allow-clear>
              <a-option value="w1">深圳仓库</a-option>
              <a-option value="w2">广州仓库</a-option>
              <a-option value="w3">东莞仓库</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <a-card class="mt-16">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="all">
          <template #title>全部订单 ({{ getStatusCount('all') }})</template>
        </a-tab-pane>
        <a-tab-pane key="pending">
          <template #title>待确认 ({{ getStatusCount('pending') }})</template>
        </a-tab-pane>
        <a-tab-pane key="shipping">
          <template #title>待发货 ({{ getStatusCount('shipping') }})</template>
        </a-tab-pane>
        <a-tab-pane key="receiving">
          <template #title>待收货 ({{ getStatusCount('receiving') }})</template>
        </a-tab-pane>
        <a-tab-pane key="completed">
          <template #title>已完成 ({{ getStatusCount('completed') }})</template>
        </a-tab-pane>
        <a-tab-pane key="cancelled">
          <template #title>已取消 ({{ getStatusCount('cancelled') }})</template>
        </a-tab-pane>
        <a-tab-pane key="rejected">
          <template #title>已驳回 ({{ getStatusCount('rejected') }})</template>
        </a-tab-pane>
      </a-tabs>

      <a-table :data="filteredOrders" :pagination="pagination" :row-key="(record: any) => record.id">
        <template #columns>
          <a-table-column title="订单编号" :width="160">
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
          <a-table-column title="供应商" data-index="supplierName" :width="160" />
          <a-table-column title="收货信息" :width="200">
            <template #cell="{ record }">
              <div class="receiver-info">
                <div>{{ record.receiverName }} {{ record.receiverPhone }}</div>
                <div class="receiver-address">{{ record.receiverAddress }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="商品信息" :width="160">
            <template #cell="{ record }">
              <div class="product-info">
                <div>商品数量：<strong>{{ record.items.length }}</strong> 种</div>
                <div>购买总数：<strong>{{ record.totalQuantity }}</strong></div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实付金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="paid-amount">¥{{ record.paidAmount || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="140">
            <template #cell="{ record }">
              <template v-if="record.orderType === 'purchase'">
                <a-tag :color="getPaymentStatusColor(record.paymentStatus)">
                  {{ getPaymentStatusText(record.paymentStatus) }}
                </a-tag>
              </template>
              <template v-else>
                <span style="color: #86909c;">-</span>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" data-index="createTime" :width="170" />
          <a-table-column title="操作" :width="260" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-link size="small" @click="handleView(record)">详情</a-link>
                <a-link size="small" v-if="record.status === 'pending'" @click="handleCancel(record)">取消订单</a-link>
                <a-link size="small" v-if="canPay(record)" @click="handlePay(record)">立即支付</a-link>
                <a-link size="small" v-if="record.status === 'receiving'" @click="handleReceive(record)">收货</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="payModalVisible"
      title="订单支付"
      :width="600"
      @ok="handlePayConfirm"
      @cancel="cancelPay"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ currentOrder?.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentOrder?.amount }}</a-descriptions-item>
        <a-descriptions-item label="待付金额">
          <span class="text-danger">¥{{ (Number(currentOrder?.amount || 0) - Number(currentOrder?.paidAmount || 0)).toFixed(2) }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="实付金额" required>
          <a-input-number
            v-model="payForm.amount"
            :min="0.01"
            :max="Number(currentOrder?.amount || 0) - Number(currentOrder?.paidAmount || 0)"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="转账凭证" required>
          <a-upload
            v-model:file-list="payForm.vouchers"
            :limit="3"
            accept="image/*"
            list-type="card"
          >
            <a-button>
              <template #icon><icon-plus /></template>
              上传凭证
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model="payForm.remark"
            placeholder="请输入支付备注（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="receiveModalVisible"
      title="采购收货"
      :width="1100"
    >
      <template #footer>
        <a-space>
          <a-button @click="cancelReceive">取消</a-button>
          <a-button
            v-if="receiveForm.items.some((item: any) => getItemToShip(item) > 0)"
            type="primary"
            @click="handleReceiveConfirm"
          >
            确认收货
          </a-button>
          <template v-else-if="receiveForm.items.some((item: any) => getItemReceived(item) + (item.receiveQuantity || 0) < item.quantity)">
            <a-button @click="handleReceiveConfirm">确认收货</a-button>
            <a-button type="primary" status="warning" @click="handleReceiveAndComplete">确认完成订单</a-button>
          </template>
          <a-button
            v-else
            type="primary"
            status="success"
            @click="handleReceiveAndComplete"
          >
            确认完成订单
          </a-button>
        </a-space>
      </template>
      <a-alert type="info" style="margin-bottom: 16px">
        核对商品信息，填写实收数量和货损数量。如需记录入库批次，请点击「添加入库批次」；未分配批次的实收数量将作为默认批次入库
      </a-alert>

      <div class="shipment-batch-info">
        <a-descriptions :column="4" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="物流信息" :span="4">
            <template v-if="currentShipments.length > 0">
               <div v-for="(s, idx) in currentShipments" :key="s.id" :class="idx < currentShipments.length - 1 ? 'mb-2' : ''">
                <a-tag color="arcoblue" size="small">{{ s.shipmentNo }}</a-tag>
                <span style="margin-left: 8px;">{{ s.logisticsCompany }} / {{ s.logisticsNo }}</span>
                <span style="margin-left: 12px; color: #86909c;">发货时间：{{ s.shipTime }}</span>
              </div>
            </template>
            <span v-else style="color: #86909c;">暂无物流信息</span>
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <a-form :model="receiveForm" layout="vertical">
        <a-table :data="receiveForm.items" :pagination="false" row-key="productName">
          <template #columns>
            <a-table-column title="商品信息" :width="180">
              <template #cell="{ record }">
                <div><strong>{{ record.productName }}</strong></div>
                <div style="color: #86909c; font-size: 12px;">{{ record.spec }} / {{ record.unit }}</div>
              </template>
            </a-table-column>
            <a-table-column title="购买量" :width="70" align="right">
              <template #cell="{ record }">{{ record.quantity }}</template>
            </a-table-column>
            <a-table-column title="待发货" :width="70" align="right">
              <template #cell="{ record }">
                <span style="color: #ff7d00;">{{ getItemToShip(record) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="已收货" :width="70" align="right">
              <template #cell="{ record }">
                <span style="color: #00b42a;">{{ getItemReceived(record) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="本次收货" :width="110" align="right">
              <template #cell="{ record }">
                <a-input-number
                  v-model="record.receiveQuantity"
                  :min="0"
                  :max="record.quantity - getItemReceived(record)"
                  :precision="0"
                  style="width: 90px"
                />
              </template>
            </a-table-column>
            <a-table-column title="货损" :width="70" align="right">
              <template #cell="{ record }">
                <a-input-number
                  v-model="record.damageQuantity"
                  :min="0"
                  :max="record.receiveQuantity"
                  :precision="0"
                  style="width: 55px"
                />
              </template>
            </a-table-column>
            <a-table-column title="实际入库" :width="80" align="right">
              <template #cell="{ record }">
                <span style="color: #165dff; font-weight: 600;">
                  {{ getItemActualInbound(record) }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="已分配" :width="80" align="right">
              <template #cell="{ record }">
                <span :style="{ color: getItemAllocated(record) > getItemActualInbound(record) ? '#f53f3f' : getItemAllocated(record) > 0 ? '#00b42a' : '#86909c' }">
                  {{ getItemAllocated(record) }} / {{ getItemActualInbound(record) }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="130" fixed="right">
              <template #cell="{ record }">
                <a-button size="small" type="outline" @click="openBatchModal(record)">
                  <template #icon><icon-plus /></template>
                  添加入库批次
                </a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <a-form-item label="入库仓库" required style="margin-top: 16px">
          <a-select v-model="receiveForm.warehouse" placeholder="请选择入库仓库" style="width: 300px">
            <a-option value="深圳湾科技园项目仓">深圳湾科技园项目仓</a-option>
            <a-option value="福田CBD项目仓">福田CBD项目仓</a-option>
            <a-option value="龙华仓储中心">龙华仓储中心</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="收货备注">
          <a-textarea
            v-model="receiveForm.remark"
            placeholder="请输入收货备注（选填）"
            :max-length="200"
          />
        </a-form-item>

        <a-form-item label="货损图片" v-if="receiveForm.items.some((item: any) => item.damageQuantity > 0)">
          <a-upload
            v-model:file-list="receiveForm.damagePhotos"
            action="#"
            multiple
            @change="handleDamagePhotosChange"
          >
            <template #upload-button>
              <a-button>
                <template #icon><icon-upload /></template>
                上传货损图片
              </a-button>
            </template>
          </a-upload>
          <div style="color: #86909c; font-size: 12px; margin-top: 4px;">
            请上传货损现场照片，最多9张
          </div>
        </a-form-item>

        <a-form-item label="货损备注" v-if="receiveForm.items.some((item: any) => item.damageQuantity > 0)">
          <a-textarea
            v-model="receiveForm.damageRemark"
            placeholder="请输入货损说明（选填）"
            :max-length="200"
          />
        </a-form-item>

        <a-alert
          v-if="receiveForm.items.some((item: any) => getItemToShip(item) > 0)"
          type="warning"
          style="margin-top: 16px"
        >
          还有 <strong>{{ getTotalToShip() }}</strong> 件商品待发货，当前只能确认收货，无法完成订单
        </a-alert>

        <a-alert
          v-else-if="receiveForm.items.some((item: any) => getItemReceived(item) + (item.receiveQuantity || 0) < item.quantity)"
          type="warning"
          style="margin-top: 16px"
        >
          已发货但还有 <strong>{{ getTotalPending() }}</strong> 件商品未收货，可以选择「确认收货」或「确认完成订单」
        </a-alert>

        <a-alert
          v-else
          type="success"
          style="margin-top: 16px"
        >
          所有商品已发货并收货，可以「确认完成订单」
        </a-alert>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="batchItemModalVisible"
      title="管理入库批次"
      :width="700"
      @ok="handleBatchConfirm"
      @cancel="cancelBatch"
    >
      <template v-if="currentBatchItem">
        <a-alert type="info" style="margin-bottom: 16px">
          <template #message>
            <strong>{{ currentBatchItem.productName }}</strong>
            <span style="color: #86909c; margin-left: 8px;">{{ currentBatchItem.spec }}</span>
            <span style="margin-left: 16px;">实收数量：<strong>{{ currentBatchItem.receiveQuantity }}</strong></span>
            <span style="margin-left: 12px;">已分配：<strong>{{ getItemAllocated(currentBatchItem) }}</strong></span>
          </template>
        </a-alert>

        <a-table :data="currentBatchItem.batches" :pagination="false">
          <template #columns>
            <a-table-column title="入库批次号" :width="160">
              <template #cell="{ record }">
                <a-input v-model="record.batchNo" placeholder="自动生成" size="small" style="width: 140px">
                  <template #prepend>
                    <a-button size="small" @click="() => generateItemBatchNo(record)">生成</a-button>
                  </template>
                </a-input>
              </template>
            </a-table-column>
            <a-table-column title="入库数量" :width="120" align="right">
              <template #cell="{ record }">
                <a-input-number
                  v-model="record.quantity"
                  :min="1"
                  :precision="0"
                  style="width: 100px"
                />
              </template>
            </a-table-column>
            <a-table-column title="批次备注" :width="200">
              <template #cell="{ record }">
                <a-input v-model="record.remark" placeholder="选填" size="small" />
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="80" fixed="right">
              <template #cell="{ record, rowIndex }">
                <a-button size="mini" status="danger" @click="removeItemBatch(currentBatchItem, rowIndex)">删除</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <a-button size="small" type="outline" @click="addItemBatch(currentBatchItem)" style="margin-top: 8px">
          <template #icon><icon-plus /></template>
          添加入库批次
        </a-button>
      </template>
    </a-modal>

    <a-modal
      v-if="false"
      v-model:visible="afterSalesModalVisible"
      title="申请售后"
      :width="800"
      @ok="handleAfterSalesConfirm"
      @cancel="cancelAfterSales"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder?.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ currentOrder?.supplierName }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="afterSalesForm" layout="vertical">
        <a-form-item label="售后类型" required>
          <a-select v-model="afterSalesForm.type" placeholder="请选择售后类型">
            <a-option v-for="type in afterSalesTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="售后原因" required>
          <a-textarea
            v-model="afterSalesForm.reason"
            placeholder="请详细描述售后原因"
            :max-length="500"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="售后商品">
          <a-table :data="afterSalesForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="150" />
              <a-table-column title="单位" data-index="unit" :width="80" />
              <a-table-column title="售后数量" :width="120" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.quantity"
                    :min="0"
                    :precision="0"
                    style="width: 100px"
                  />
                </template>
              </a-table-column>
              <a-table-column title="问题描述" :width="200">
                <template #cell="{ record }">
                  <a-input v-model="record.reason" placeholder="选填" size="small" />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea
            v-model="afterSalesForm.remark"
            placeholder="请输入备注（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
const router = useRouter()
const activeTab = ref('all')

const searchForm = ref({
  orderNo: '',
  supplierId: '',
  orderType: '',
  paymentStatus: '',
  dateRange: [] as string[],
  warehouse: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const orders = ref([
  {
    id: '1',
    orderNo: 'PO202401150001',
    orderType: 'purchase',
    supplierName: '广东建材有限公司',
    receiverName: '张工',
    receiverPhone: '13800138001',
    receiverAddress: '广东省深圳市南山区科技园南一道1号',
    amount: '210000.00',
    paidAmount: '210000.00',
    paymentStatus: 'paid',
    status: 'completed',
    createTime: '2024-01-15 10:30:00',
    totalQuantity: 450,
    items: [
      { id: '1', productName: '32.5级水泥', spec: '32.5级', quantity: 100, unit: '吨', pendingQuantity: 100 },
      { id: '2', productName: '河沙', spec: '中粗', quantity: 200, unit: '方', pendingQuantity: 200 },
      { id: '3', productName: '碎石', spec: '5-20mm', quantity: 150, unit: '方', pendingQuantity: 150 },
    ]
  },
  {
    id: '2',
    orderNo: 'PO202401150002',
    orderType: 'purchase',
    supplierName: '上海钢材集团',
    receiverName: '李经理',
    receiverPhone: '13900139002',
    receiverAddress: '上海市宝山区钢城路100号',
    amount: '820000.00',
    paidAmount: '500000.00',
    paymentStatus: 'partial',
    status: 'shipping',
    createTime: '2024-01-15 14:20:00',
    totalQuantity: 80,
    items: [
      { id: '1', productName: '螺纹钢 HRB400', spec: '16mm', quantity: 80, unit: '吨', pendingQuantity: 80 },
    ]
  },
  {
    id: '3',
    orderNo: 'PO202401150003',
    orderType: 'purchase',
    supplierName: '惠州砂石厂',
    receiverName: '王工',
    receiverPhone: '13700137003',
    receiverAddress: '广东省惠州市惠阳区砂石路88号',
    amount: '15000.00',
    paidAmount: '0',
    paymentStatus: 'unpaid',
    status: 'receiving',
    createTime: '2024-01-15 16:00:00',
    totalQuantity: 300,
    items: [
      { id: '1', productName: '黄砂 中砂', spec: '中砂', quantity: 200, unit: '方', shippedQuantity: 100, receivedQuantity: 60, pendingQuantity: 40 },
      { id: '2', productName: '碎石', spec: '5-25mm', quantity: 100, unit: '方', shippedQuantity: 50, receivedQuantity: 30, pendingQuantity: 20 },
    ]
  },
  {
    id: '4',
    orderNo: 'PO202401160001',
    orderType: 'after_sale',
    supplierName: '深圳混凝土公司',
    receiverName: '赵主管',
    receiverPhone: '13600136004',
    receiverAddress: '广东省深圳市龙华区民治街道100号',
    amount: '38000.00',
    paidAmount: '0',
    paymentStatus: 'unpaid',
    status: 'pending',
    createTime: '2024-01-16 09:00:00',
    totalQuantity: 100,
    items: [
      { id: '1', productName: 'C30混凝土', spec: 'C30', quantity: 100, unit: '方', pendingQuantity: 100 },
    ]
  },
  {
    id: '5',
    orderNo: 'PO202401160002',
    orderType: 'after_sale',
    supplierName: '佛山陶瓷建材',
    receiverName: '陈工',
    receiverPhone: '13500135005',
    receiverAddress: '广东省佛山市禅城区陶瓷大道66号',
    amount: '45000.00',
    paidAmount: '45000.00',
    paymentStatus: 'paid',
    status: 'cancelled',
    createTime: '2024-01-16 11:30:00',
    totalQuantity: 500,
    items: [
      { id: '1', productName: '地面砖 800x800', spec: '800x800mm', quantity: 500, unit: '片', pendingQuantity: 500 },
    ]
  },
])

const filteredOrders = computed(() => {
  let list = orders.value

  if (activeTab.value !== 'all') {
    list = list.filter(o => o.status === activeTab.value)
  }

  if (searchForm.value.orderNo) {
    list = list.filter(o => o.orderNo.includes(searchForm.value.orderNo))
  }
  if (searchForm.value.supplierId) {
    list = list.filter(o => o.supplierName.includes(searchForm.value.supplierId))
  }
  if (searchForm.value.orderType) {
    list = list.filter(o => o.orderType === searchForm.value.orderType)
  }
  if (searchForm.value.paymentStatus) {
    list = list.filter(o => o.paymentStatus === searchForm.value.paymentStatus)
  }

  return list
})

function getOrderTypeColor(orderType: string) {
  const colors: Record<string, string> = {
    purchase: 'blue',
    after_sale: 'purple',
  }
  return colors[orderType] || 'gray'
}

function getOrderTypeText(orderType: string) {
  const texts: Record<string, string> = {
    purchase: '采购订单',
    after_sale: '售后订单',
  }
  return texts[orderType] || orderType
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    unpaid: 'red',
    partial: 'orange',
    paid: 'green',
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    unpaid: '未支付',
    partial: '部分支付',
    paid: '已支付',
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'gold',
    shipping: 'blue',
    receiving: 'cyan',
    completed: 'green',
    cancelled: 'gray',
    rejected: 'red',
    refunded: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    shipping: '待发货',
    receiving: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    rejected: '已驳回',
    refunded: '已退款',
  }
  return texts[status] || status
}

function canPay(record: any): boolean {
  if (record.paymentStatus === 'paid') return false
  if (record.status === 'cancelled') return false
  if (record.status === 'completed') return false
  return true
}

function getStatusCount(status: string) {
  if (status === 'all') return orders.value.length
  return orders.value.filter((o: any) => o.status === status).length
}

function handleSearch() {
  Message.success('搜索条件已应用')
}

function handleReset() {
  searchForm.value = {
    orderNo: '',
    supplierId: '',
    orderType: '',
    paymentStatus: '',
    dateRange: [],
    warehouse: '',
  }
  Message.success('已重置搜索条件')
}

function handleView(record: any) {
  router.push(`/warehouse/order/purchase/detail/${record.id}`)
}

function handleCancel(record: any) {
  record.status = 'cancelled'
  Message.success(`订单 ${record.orderNo} 已取消`)
}

const payModalVisible = ref(false)
const currentOrder = ref<any>(null)
const payForm = ref({
  amount: 0,
  vouchers: [] as any[],
  remark: '',
})

function handlePay(record: any) {
  currentOrder.value = record
  payForm.value = {
    amount: Number(record.amount) - Number(record.paidAmount || 0),
    vouchers: [],
    remark: '',
  }
  payModalVisible.value = true
}

function handlePayConfirm() {
  if (currentOrder.value) {
    const newPaid = Number(currentOrder.value.paidAmount || 0) + payForm.value.amount
    if (newPaid >= Number(currentOrder.value.amount)) {
      currentOrder.value.paymentStatus = 'paid'
    } else {
      currentOrder.value.paymentStatus = 'partial'
    }
    currentOrder.value.paidAmount = newPaid.toFixed(2)
    Message.success(`支付成功，金额：¥${payForm.value.amount.toFixed(2)}`)
    payModalVisible.value = false
  }
}

function cancelPay() {
  payModalVisible.value = false
}

const receiveModalVisible = ref(false)
const receiveForm = ref({
  items: [] as any[],
  warehouse: '深圳湾科技园项目仓',
  remark: '',
  damagePhotos: [] as any[],
  damageRemark: '',
})

const currentShipments = ref<any[]>([])

const batchItemModalVisible = ref(false)
const currentBatchItem = ref<any>(null)

function getItemAllocated(item: any) {
  return item.batches.reduce((sum: number, b: any) => sum + (Number(b.quantity) || 0), 0)
}

function getItemActualInbound(item: any) {
  const received = item.receiveQuantity || 0
  const damage = item.damageQuantity || 0
  return Math.max(0, received - damage)
}

function getItemReceived(item: any) {
  return item.receivedQuantity || 0
}

function getItemToShip(item: any) {
  const purchased = item.quantity || 0
  const shipped = item.shippedQuantity || 0
  return Math.max(0, purchased - shipped)
}

function getTotalToShip() {
  return receiveForm.value.items.reduce((sum: number, item: any) => sum + getItemToShip(item), 0)
}

function getTotalPending() {
  return receiveForm.value.items.reduce((sum: number, item: any) => {
    const pending = item.quantity - getItemReceived(item) - getItemActualInbound(item)
    return sum + Math.max(0, pending)
  }, 0)
}

function handleDamagePhotosChange(fileList: any[]) {
  receiveForm.value.damagePhotos = fileList
}

function generateItemBatchNo(record: any) {
  const date = new Date()
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  record.batchNo = `B${dateStr}${random}`
}

function openBatchModal(item: any) {
  currentBatchItem.value = item
  if (!item.batches || item.batches.length === 0) {
    item.batches = [{
      batchNo: '',
      quantity: getItemActualInbound(item),
      remark: '',
    }]
  }
  batchItemModalVisible.value = true
}

function addItemBatch(item: any) {
  const allocated = getItemAllocated(item)
  const actualInbound = getItemActualInbound(item)
  const remaining = actualInbound - allocated
  if (remaining <= 0) {
    Message.warning('实际入库数量已全部分配，无需添加更多批次')
    return
  }
  item.batches.push({
    batchNo: '',
    quantity: remaining,
    remark: '',
  })
}

function removeItemBatch(item: any, index: number) {
  if (item.batches.length <= 1) {
    Message.warning('至少保留一个入库批次')
    return
  }
  item.batches.splice(index, 1)
}

function handleReceive(record: any) {
  currentOrder.value = record
  currentShipments.value = [
    {
      id: '1',
      shipmentNo: 'SH202401200001',
      shipTime: '2024-01-20 09:30:00',
      logisticsCompany: '顺丰速运',
      logisticsNo: 'SF1234567890',
      items: [
        { productName: '黄砂 中砂', spec: '中砂', unit: '方', quantity: 100 },
        { productName: '碎石', spec: '5-25mm', unit: '方', quantity: 50 },
      ],
    },
    {
      id: '2',
      shipmentNo: 'SH202401220002',
      shipTime: '2024-01-22 14:00:00',
      logisticsCompany: '京东物流',
      logisticsNo: 'JD9876543210',
      items: [
        { productName: '黄砂 中砂', spec: '中砂', unit: '方', quantity: 100 },
        { productName: '碎石', spec: '5-25mm', unit: '方', quantity: 50 },
      ],
    },
  ]

  const items = (record.items || []).map((item: any) => ({
    productName: item.productName,
    spec: item.spec,
    unit: item.unit,
    quantity: item.quantity,
    shipQuantity: item.shipQuantity || item.quantity,
    receivedQuantity: item.receivedQuantity || 0,
    receiveQuantity: item.shipQuantity || item.quantity,
    damageQuantity: 0,
    batches: [],
  }))

  receiveForm.value = {
    items,
    warehouse: '深圳湾科技园项目仓',
    remark: '',
    damagePhotos: [],
    damageRemark: '',
  }
  receiveModalVisible.value = true
}

function handleReceiveConfirm() {
  // 检查是否有货损，如有货损备注必填
  const hasDamage = receiveForm.value.items.some((item: any) => item.damageQuantity > 0)
  if (hasDamage) {
    if (!receiveForm.value.damageRemark || receiveForm.value.damageRemark.trim() === '') {
      Message.warning('有货损时，货损备注为必填项')
      return
    }
    Modal.confirm({
      title: '确认货损',
      content: '请确认货损数量，一旦确认，入库后不可更改货损。是否确认继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        doConfirmReceive()
      },
    })
    return
  }

  doConfirmReceive()
}

function doConfirmReceive() {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const inboundNo = `IB${dateStr}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

  const afterSalesItems: any[] = []

  receiveForm.value.items.forEach((item: any) => {
    const actualInbound = getItemActualInbound(item)
    const allocated = getItemAllocated(item)
    const unallocated = actualInbound - allocated

    item.batches.forEach((batch: any) => {
      const qty = Number(batch.quantity) || 0
      if (qty > 0) {
        const batchNo = batch.batchNo || `B${dateStr}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        console.log(`生成入库批次: ${batchNo}`, {
          skuName: `${item.productName} ${item.spec}`,
          quantity: qty,
          remark: batch.remark || '',
          batchType: 'manual',
          warehouse: receiveForm.value.warehouse,
          supplierName: currentOrder.value?.supplierName,
          purchaseNo: currentOrder.value?.orderNo,
          inboundNo,
        })
      }
    })

    if (unallocated > 0) {
      const defaultBatchNo = `B${dateStr}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      console.log(`生成默认入库批次: ${defaultBatchNo}`, {
        skuName: `${item.productName} ${item.spec}`,
        quantity: unallocated,
        remark: '默认批次',
        batchType: 'default',
        warehouse: receiveForm.value.warehouse,
        supplierName: currentOrder.value?.supplierName,
        purchaseNo: currentOrder.value?.orderNo,
        inboundNo,
      })
    }

    // 处理货损，生成售后记录
    if (item.damageQuantity > 0) {
      afterSalesItems.push({
        productName: item.productName,
        spec: item.spec,
        unit: item.unit,
        damageQuantity: item.damageQuantity,
      })
    }
  })

  // 如果有货损，生成售后记录
  if (afterSalesItems.length > 0) {
    const afterSalesNo = `AS${dateStr}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    console.log(`生成售后记录: ${afterSalesNo}`, {
      orderNo: currentOrder.value?.orderNo,
      supplierName: currentOrder.value?.supplierName,
      afterSalesNo,
      items: afterSalesItems,
      damagePhotos: receiveForm.value.damagePhotos,
      damageRemark: receiveForm.value.damageRemark,
      remark: receiveForm.value.remark,
      createTime: new Date().toISOString(),
    })
    Message.warning(`检测到货损，已生成售后单 ${afterSalesNo}`)
  }

  if (currentOrder.value && currentOrder.value.paymentStatus === 'paid') {
    currentOrder.value.status = 'completed'
  }

  Message.success(`收货成功，已生成入库单 ${inboundNo}`)
  receiveModalVisible.value = false
}

function handleReceiveAndComplete() {
  // 检查是否有货损，如有货损备注必填
  const hasDamage = receiveForm.value.items.some((item: any) => item.damageQuantity > 0)
  if (hasDamage) {
    if (!receiveForm.value.damageRemark || receiveForm.value.damageRemark.trim() === '') {
      Message.warning('有货损时，货损备注为必填项')
      return
    }
    Modal.confirm({
      title: '确认货损',
      content: '请确认货损数量，一旦确认，入库后不可更改货损。是否确认继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        doConfirmReceive()
        if (currentOrder.value) {
          currentOrder.value.status = 'completed'
          Message.success('订单已完成')
        }
      },
    })
    return
  }

  doConfirmReceive()
  if (currentOrder.value) {
    currentOrder.value.status = 'completed'
    Message.success('订单已完成')
  }
}

function cancelReceive() {
  receiveModalVisible.value = false
}

function handleBatchConfirm() {
  batchItemModalVisible.value = false
}

function cancelBatch() {
  batchItemModalVisible.value = false
}

function handleLogistics(record: any) {
  Message.info(`查看物流：${record.orderNo}`)
}

function handleGoAfterSales() {
  router.push('/warehouse/order/after-sales')
}

const afterSalesModalVisible = ref(false)
const afterSalesForm = ref({
  type: '',
  reason: '',
  items: [] as any[],
  remark: '',
})

const afterSalesTypes = [
  { value: 'return', label: '退货' },
  { value: 'exchange', label: '换货' },
  { value: 'refund', label: '退款' },
  { value: 'repair', label: '维修' },
]

function handleApplyAfterSales(record: any) {
  currentOrder.value = record
  afterSalesForm.value = {
    type: '',
    reason: '',
    items: (record.items || []).map((item: any) => ({
      productName: item.productName,
      spec: item.spec,
      unit: item.unit,
      quantity: 0,
      reason: '',
    })),
    remark: '',
  }
  afterSalesModalVisible.value = true
}

function handleAfterSalesConfirm() {
  if (!afterSalesForm.value.type) {
    Message.warning('请选择售后类型')
    return
  }
  if (!afterSalesForm.value.reason) {
    Message.warning('请填写售后原因')
    return
  }
  const hasItem = afterSalesForm.value.items.some((item: any) => Number(item.quantity) > 0)
  if (!hasItem) {
    Message.warning('请选择售后商品及数量')
    return
  }

  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const afterSalesNo = `AS${dateStr}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

  Message.success(`售后申请提交成功，售后单号：${afterSalesNo}`)
  afterSalesModalVisible.value = false
}

function cancelAfterSales() {
  afterSalesModalVisible.value = false
}
</script>

<style scoped lang="less">
.purchase-order {
  padding: 16px;
}

.filter-row {
  margin-bottom: 0;
}

.mt-16 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.amount {
  color: #f53f3f;
  font-weight: 500;
}

.paid-amount {
  color: #00b42a;
  font-weight: 500;
}

.text-danger {
  color: #f53f3f;
  font-weight: 500;
}

.product-info {
  text-align: left;
  .product-item {
    line-height: 20px;
    font-size: 12px;
    .product-name {
      margin-right: 4px;
    }
    .product-spec {
      color: #86909c;
      margin-right: 4px;
    }
    .product-qty {
      color: #86909c;
    }
  }
  .more-text {
    color: #165dff;
    font-size: 12px;
  }
}

.receiver-info {
  font-size: 12px;
  line-height: 1.6;
  .receiver-address {
    color: #86909c;
    font-size: 11px;
  }
}

.damage-photo-uploader {
  width: 36px;
  height: 36px;
  border: 1px dashed #c9cdd4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    border-color: #165dff;
  }

  .damage-photo-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #86909c;
    font-size: 10px;

    .arco-icon {
      font-size: 14px;
      margin-bottom: 2px;
    }
  }

  .damage-photo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
