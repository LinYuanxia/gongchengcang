<template>
  <div class="purchase-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button v-if="order.paymentStatus !== 'paid' && ['pending', 'shipping', 'receiving'].includes(order.status)" @click="handleOpenPay">
            立即支付
          </a-button>
          <a-button v-if="order.status === 'pending'" @click="handleCancelOrder">
            取消订单
          </a-button>
          <a-button v-if="order.status === 'receiving'" type="primary" @click="handleReceive">
            收货
          </a-button>
          <a-button @click="handleBack">返回</a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="订单基础信息">
        <a-descriptions-item label="订单编号">
          <a-space>
            {{ order.orderNo }}
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="订单类型">
          <a-tag :color="order.orderType === 'purchase' ? 'blue' : 'orange'">
            {{ order.orderType === 'purchase' ? '采购订单' : '售后订单' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="供应商">{{ order.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPaymentStatusColor(order.paymentStatus)">{{ getPaymentStatusText(order.paymentStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="收货状态">
          <a-tag :color="getReceiveStatusColor(order.receiveStatus)">{{ getReceiveStatusText(order.receiveStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ order.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="实付金额">¥{{ paidAmount.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ order.paymentTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订单备注" :span="4">
          <a-tooltip :content="order.remark || '-'">
            <span>{{ order.remark || '-' }}</span>
          </a-tooltip>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="3" title="收货信息">
        <a-descriptions-item label="收货人">{{ order.receiverName }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.receiverPhone }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">
          {{ order.receiverAddress }}
          <a-button
            v-if="order.status === 'pending'"
            type="primary"
            size="mini"
            style="margin-left: 8px"
            @click="handleEditAddress"
          >
            编辑
          </a-button>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>商品信息</h3>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="160" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单位" data-index="unit" :width="70" />
          <a-table-column title="供应商接单状态" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getSupplierStatusColor(record.supplierStatus)">
                {{ getSupplierStatusText(record.supplierStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="购买数量" data-index="quantity" :width="90" align="right" />
          <a-table-column title="确认数量" :width="90" align="right">
            <template #cell="{ record }">
              <span style="color: #00b42a;">{{ record.confirmedQuantity || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="待发数量" :width="90" align="right">
            <template #cell="{ record }">
              <span :style="{ color: '#86909c' }">
                {{ (record.confirmedQuantity || 0) - (record.shippedQuantity || 0) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="已收数量" :width="90" align="right">
            <template #cell="{ record }">
              <span style="color: #00b42a;">
                {{ record.receivedQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="货损数量" :width="90" align="right">
            <template #cell="{ record }">
              <span style="color: #f53f3f;">
                {{ record.damageQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #165dff; font-weight: 600;">¥{{ record.price?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="120" align="right">
            <template #cell="{ record }">
              <span style="color: #165dff; font-weight: 600;">¥{{ ((record.confirmedQuantity || record.quantity) * record.price)?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="160">
            <template #cell="{ record }">
              <a-tooltip :content="record.supplierRemark || '-'">
                <span class="remark-text">{{ record.supplierRemark || '-' }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-descriptions :column="5" bordered size="small" style="margin-top: 16px;">
        <a-descriptions-item label="商品数">
          <strong style="color: #165dff;">{{ order.items.length }} 种</strong>
        </a-descriptions-item>
        <a-descriptions-item label="购买量">
          <strong style="color: #165dff;">{{ totalQuantity }}</strong>
        </a-descriptions-item>
        <a-descriptions-item label="确认量">
          <strong style="color: #00b42a;">{{ confirmedQuantity }}</strong>
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <strong style="color: #165dff;">¥{{ order.totalAmount?.toLocaleString() }}</strong>
        </a-descriptions-item>
        <a-descriptions-item label="实付金额">
          <strong style="color: #00b42a;">¥{{ paidAmount.toLocaleString() }}</strong>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>支付记录
        <a-button type="primary" size="small" style="margin-left: 12px" @click="handleOpenPay">
          付款
        </a-button>
      </h3>
      <div class="pay-summary" style="margin-bottom: 12px">
        <span>订单金额：<strong>¥{{ order.totalAmount?.toLocaleString() }}</strong></span>
        <span class="paid">已付：<strong>¥{{ paidAmount.toLocaleString() }}</strong></span>
        <span class="unpaid">待付：<strong>¥{{ unpaidAmount.toLocaleString() }}</strong></span>
      </div>

      <a-table :data="paymentRecords" :pagination="false">
        <template #columns>
          <a-table-column title="支付单号" data-index="paymentNo" :width="160" />
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <strong>¥{{ record.amount.toLocaleString() }}</strong>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" :width="100">
            <template #cell="{ record }">
              <a-tag color="blue">银行转账</a-tag>
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
          <a-table-column title="备注" data-index="remark" :width="150" />
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }">
              <template v-if="record.status === 'rejected'">
                <a-tag color="red">已驳回</a-tag>
              </template>
              <a-tag v-else-if="record.status === 'pending'" color="orange">待审核</a-tag>
              <a-tag v-else color="green">已到账</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="驳回原因" :width="180">
            <template #cell="{ record }">
              <span v-if="record.status === 'rejected'" class="text-danger">
                {{ record.rejectReason || '未填写驳回原因' }}
              </span>
              <span v-else style="color: #86909c;">-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button 
                v-if="record.status === 'rejected'" 
                type="primary" 
                size="small"
                @click="handleReuploadPayment(record)"
              >
                重新上传
              </a-button>
              <span v-else>-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>收货记录</h3>
      <a-table :data="receiveRecords" :pagination="false">
        <template #columns>
          <a-table-column title="入库单号" data-index="inboundNo" :width="160" />
          <a-table-column title="收货时间" data-index="receiveTime" :width="160" />
          <a-table-column title="收货仓库" data-index="warehouse" :width="140" />
          <a-table-column title="收货数量" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #00b42a; font-weight: 600;">{{ record.totalQuantity }}</span>
            </template>
          </a-table-column>
          <a-table-column title="货损数量" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #f53f3f;">{{ record.damageQuantity || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实际入库" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #165dff; font-weight: 600;">{{ record.actualInbound }}</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="80" fixed="right">
            <template #cell="{ record }">
              <a-link @click="handleViewReceiveDetail(record)">查看</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>

    <a-modal
      v-model:visible="payModalVisible"
      title="付款登记"
      :width="600"
      @ok="handlePayConfirm"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>支付与订单流转解耦，不影响供应商发货。订单完成前需完成全部支付</div>
        </template>
      </a-alert>

      <a-form :model="payForm" layout="vertical">
        <a-form-item label="付款金额" required>
          <a-input-number
            v-model="payForm.amount"
            :min="1"
            :max="unpaidAmount"
            style="width: 100%"
            :precision="2"
          />
          <div class="form-tip">待支付金额：¥{{ unpaidAmount.toLocaleString() }}</div>
        </a-form-item>

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
          <a-textarea v-model="payForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="voucherVisible"
      title="转账凭证"
      :width="500"
      :footer="false"
    >
      <div class="voucher-preview">
        <img src="https://picsum.photos/400/500" style="width: 100%; border-radius: 4px" />
      </div>
    </a-modal>

      <a-divider />

      <a-descriptions :column="4" bordered size="small" v-if="(order.afterSalesNos && order.afterSalesNos.length > 0) || (order.relatedAfterSalesOrders && order.relatedAfterSalesOrders.length > 0)">
        <a-descriptions-item v-if="order.afterSalesNos && order.afterSalesNos.length > 0" label="售后记录">
          <a-space :wrap="true">
            <a-link v-for="no in order.afterSalesNos" :key="no">{{ no }}</a-link>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item v-if="order.relatedAfterSalesOrders && order.relatedAfterSalesOrders.length > 0" label="关联售后订单">
          <a-space :wrap="true">
            <a-link v-for="item in order.relatedAfterSalesOrders" :key="item.id" @click="handleJumpToOrder(item.id)">
              {{ item.orderNo }}
            </a-link>
          </a-space>
        </a-descriptions-item>
      </a-descriptions>

      <h3>操作日志</h3>
      <a-timeline>
        <a-timeline-item v-for="(log, index) in order.logs" :key="index" :label="log.time">
          {{ log.content }}
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <a-modal
      v-model:visible="receiveModalVisible"
      title="按发货批次收货"
      :width="1100"
      @ok="handleReceiveConfirm"
      @cancel="cancelReceive"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        <template #message>
          <span>核对商品信息，填写实收数量和货损数量，然后点击「添加入库批次」为实收商品分配入库批次</span>
        </template>
      </a-alert>

      <div class="shipment-batch-info">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="供应商发货批次">
            <a-tag color="arcoblue">{{ currentShipmentBatch?.shipmentNo }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发货时间">{{ currentShipmentBatch?.shipTime }}</a-descriptions-item>
          <a-descriptions-item label="物流公司">{{ currentShipmentBatch?.logisticsCompany }}</a-descriptions-item>
          <a-descriptions-item label="物流单号">{{ currentShipmentBatch?.logisticsNo }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <a-form :model="receiveForm" layout="vertical">
        <a-table :data="receiveForm.items" :pagination="false" row-key="productName">
          <template #columns>
            <a-table-column title="商品信息" :width="240">
              <template #cell="{ record }">
                <div><strong>{{ record.productName }}</strong></div>
                <div style="color: #86909c; font-size: 12px;">{{ record.spec }} / {{ record.unit }}</div>
              </template>
            </a-table-column>
            <a-table-column title="购买库存" :width="100" align="right" data-index="quantity" />
            <a-table-column title="发货库存" :width="100" align="right" data-index="shipQuantity" />
            <a-table-column title="实收数量" :width="120" align="right">
              <template #cell="{ record }">
                <a-input-number
                  v-model="record.receiveQuantity"
                  :min="0"
                  :max="record.shipQuantity"
                  :precision="0"
                  style="width: 100px"
                />
              </template>
            </a-table-column>
            <a-table-column title="货损数量" :width="120" align="right">
              <template #cell="{ record }">
                <a-input-number
                  v-model="record.damageQuantity"
                  :min="0"
                  :max="record.shipQuantity"
                  :precision="0"
                  style="width: 100px"
                />
              </template>
            </a-table-column>
            <a-table-column title="已分配" :width="100" align="right">
              <template #cell="{ record }">
                <span :style="{ color: getItemAllocated(record) > record.receiveQuantity ? '#f53f3f' : '#00b42a' }">
                  {{ getItemAllocated(record) }} / {{ record.receiveQuantity }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="120" fixed="right">
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
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="batchItemModalVisible"
      title="管理入库批次"
      :width="700"
      @ok="batchItemModalVisible = false"
      :footer="false"
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
      v-model:visible="shipmentDetailVisible"
      title="发货单详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="发货单号">{{ currentShipment.shipmentNo }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ currentShipment.shipTime }}</a-descriptions-item>
        <a-descriptions-item label="收货状态">
          <a-tag :color="getShipmentReceiveColor(currentShipment.receiveStatus)">
            {{ getShipmentReceiveText(currentShipment.receiveStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="入库单号">{{ currentShipment.inboundNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentShipment.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>发货商品</h4>
      <a-table :data="currentShipment.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column title="发货数量" data-index="quantity" align="right" />
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="viewReceiveModalVisible"
      title="采购收货"
      :width="1100"
      :footer="false"
    >
      <a-descriptions :column="4" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="入库单号" :span="2">
          <a-tag color="arcoblue">{{ currentReceiveRecord?.inboundNo }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="收货时间">{{ currentReceiveRecord?.receiveTime }}</a-descriptions-item>
        <a-descriptions-item label="收货仓库">{{ currentReceiveRecord?.warehouse }}</a-descriptions-item>
      </a-descriptions>

      <a-table :data="order.items" :pagination="false">
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
              <span style="color: #ff7d00;">{{ record.quantity - (record.shippedQuantity || 0) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="已收货" :width="70" align="right">
            <template #cell="{ record }">
              <span style="color: #00b42a;">{{ record.receivedQuantity || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="本次收货" :width="110" align="right">
            <template #cell="{ record }">
              <span style="font-weight: 600;">{{ record.receivedQuantity || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="货损" :width="70" align="right">
            <template #cell="{ record }">
              <span style="color: #f53f3f;">{{ record.damageQuantity || 0 }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实际入库" :width="80" align="right">
            <template #cell="{ record }">
              <span style="color: #165dff; font-weight: 600;">
                {{ (record.receivedQuantity || 0) - (record.damageQuantity || 0) }}
              </span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-descriptions :column="2" bordered size="small" style="margin-top: 16px">
        <a-descriptions-item label="收货备注">{{ currentReceiveRecord?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal
      v-model:visible="editAddressModalVisible"
      title="编辑收货地址"
      :width="500"
      @ok="handleEditAddressConfirm"
      @cancel="cancelEditAddress"
    >
      <a-form :model="editAddressForm" layout="vertical">
        <a-form-item label="收货人" required>
          <a-input v-model="editAddressForm.receiverName" placeholder="请输入收货人" />
        </a-form-item>
        <a-form-item label="联系电话" required>
          <a-input v-model="editAddressForm.receiverPhone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="收货地址" required>
          <a-textarea
            v-model="editAddressForm.receiverAddress"
            placeholder="请输入详细收货地址"
            :max-length="200"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="afterSalesModalVisible"
      title="申请售后"
      :width="700"
      @ok="handleAfterSalesConfirm"
      @cancel="cancelAfterSales"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          选择已收货的批次和商品，对货损数量进行售后处理
        </template>
      </a-alert>

      <a-table :data="afterSalesForm.items" :pagination="false" :row-key="(record: any) => record.id">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="收货批次" :width="140">
            <template #cell="{ record }">
              <a-tag v-for="batch in record.batches" :key="batch.batchNo" style="margin: 2px" color="arcoblue" size="small">
                {{ batch.batchNo }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="已收货数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.totalReceived }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="售后数量" :width="120" align="right">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.afterSalesQuantity"
                :min="0"
                :max="record.totalReceived"
                :precision="0"
                style="width: 100px"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-form :model="afterSalesForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="售后原因" required>
          <a-textarea
            v-model="afterSalesForm.reason"
            placeholder="请详细描述售后原因（如：运输破损、数量短缺、质量问题等）"
            :max-length="500"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
        <a-form-item label="售后证明">
          <a-upload
            :show-file-list="true"
            :limit="3"
            list-type="picture-card"
            accept="image/*"
          >
            <a-icon-plus />
          </a-upload>
          <div class="upload-tip">支持上传3张图片，格式：jpg、png</div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconCheckCircle,
  IconExclamationCircle,
  IconInfoCircle,
  IconHistory,
} from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()

const traceModalVisible = ref(false)
const currentTraceBatch = ref<any>(null)

const handleTrace = (record: any) => {
  currentTraceBatch.value = {
    ...record,
    outQuantity: 200
  }
  traceModalVisible.value = true
}

const order = ref<any>({
  id: route.params.id || '1',
  orderNo: 'PO202401150001',
  orderType: 'purchase',
  supplierName: '广东建材有限公司',
  totalAmount: 205000,
  status: 'pending',
  paymentStatus: 'unpaid',
  receiveStatus: 'pending',
  createTime: '2024-01-15 10:30:00',
  createBy: '张采购',
  paymentTime: '2024-01-15 16:30:00',
  confirmTime: '2024-01-15 14:30:00',
  confirmRemark: '水泥目前库存紧张，正在加急生产，预计3天内可补发',
  remark: '请优先安排C30混凝土和螺纹钢的发货，水泥可以稍后',
  afterSalesNos: ['AS202401200001', 'AS202401250002'],
  receiverName: '张工',
  receiverPhone: '13800138001',
  receiverAddress: '广东省深圳市南山区科技园南一道1号',
  items: [
    {
      id: '1',
      productName: 'C30混凝土',
      spec: 'C30',
      unit: 'm³',
      quantity: 100,
      supplierStatus: 'confirmed',
      confirmedQuantity: 100,
      supplierRemark: '',
      shippedQuantity: 80,
      receivedQuantity: 75,
      damageQuantity: 2,
      price: 380,
    },
    {
      id: '2',
      productName: '螺纹钢',
      spec: 'Φ20',
      unit: '吨',
      quantity: 50,
      supplierStatus: 'confirmed',
      confirmedQuantity: 40,
      supplierRemark: '部分缺货，后续优先安排',
      shippedQuantity: 40,
      receivedQuantity: 38,
      damageQuantity: 0,
      price: 4200,
    },
    {
      id: '3',
      productName: '水泥',
      spec: 'P.O42.5',
      unit: '吨',
      quantity: 20,
      supplierStatus: 'unavailable',
      confirmedQuantity: 15,
      supplierRemark: '库存不足',
      shippedQuantity: 15,
      receivedQuantity: 14,
      damageQuantity: 1,
      price: 500,
    },
  ],
  logs: [
    { time: '2024-01-18 16:00:00', content: '完成全部收货，订单已完成' },
    { time: '2024-01-16 14:30:00', content: '部分收货成功，生成入库单：IB202401160001' },
    { time: '2024-01-16 09:00:00', content: '供应商发货' },
    { time: '2024-01-15 16:30:00', content: '订单支付成功' },
    { time: '2024-01-15 14:30:00', content: '供应商确认订单' },
    { time: '2024-01-15 10:30:00', content: '订单创建成功' },
  ],
  relatedAfterSalesOrders: [
    {
      id: '2',
      orderNo: 'PO202401200002',
      orderType: 'after_sales',
      totalAmount: 15000,
      status: 'completed',
      createTime: '2024-01-20 10:00:00',
    },
    {
      id: '3',
      orderNo: 'PO202401250003',
      orderType: 'after_sales',
      totalAmount: 8000,
      status: 'pending',
      createTime: '2024-01-25 15:30:00',
    },
  ],
})

const currentShipmentBatch = ref<any>(null)

const shipments = ref([
  {
    id: '1',
    shipmentNo: 'SH202401160001',
    shipTime: '2024-01-16 09:00:00',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890',
    receiveStatus: 'partial',
    inboundNo: 'IB202401160001',
    remark: '',
    items: [
      { productName: 'C30混凝土', spec: 'C30', unit: 'm³', quantity: 50 },
      { productName: '螺纹钢', spec: 'Φ20', unit: '吨', quantity: 25 },
    ],
  },
  {
    id: '2',
    shipmentNo: 'SH202401180002',
    shipTime: '2024-01-18 14:30:00',
    logisticsCompany: '京东物流',
    logisticsNo: 'JD9876543210',
    receiveStatus: 'pending',
    inboundNo: '',
    remark: '第二批发货，包含水泥和砂石',
    items: [
      { productName: '水泥 P.O 42.5', spec: '42.5级', unit: '吨', quantity: 100 },
      { productName: '黄砂 中砂', spec: '中砂', unit: '方', quantity: 200 },
    ],
  },
])

const receiveRecords = ref([
  {
    id: '1',
    inboundNo: 'IB202401160001',
    receiveTime: '2024-01-16 14:30:00',
    warehouse: '深圳南山仓',
    totalQuantity: 127,
    damageQuantity: 3,
    actualInbound: 124,
  },
  {
    id: '2',
    inboundNo: 'IB202401180002',
    receiveTime: '2024-01-18 16:00:00',
    warehouse: '广州白云仓',
    totalQuantity: 50,
    damageQuantity: 0,
    actualInbound: 50,
  },
])

const receiveModalVisible = ref(false)
const receiveForm = ref({
  items: [] as any[],
  warehouse: '主仓库',
  remark: '',
  shipmentId: '',
})

const shipmentDetailVisible = ref(false)
const currentShipment = ref<any>({})

const editAddressModalVisible = ref(false)
const editAddressForm = ref({
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
})

const afterSalesModalVisible = ref(false)
const afterSalesForm = reactive({
  items: [] as any[],
  reason: '',
  attachments: [] as any[],
})

function handleOpenAfterSalesModal() {
  const received = order.value.items?.filter((item: any) => (item.receivedQuantity || 0) > 0) || []
  afterSalesForm.items = received.map((item: any) => ({
    ...item,
    totalReceived: item.receivedQuantity || 0,
    afterSalesQuantity: 0,
    batches: order.value.receiveBatches?.filter((b: any) => b.productName === item.productName)?.map((b: any) => ({
      batchNo: b.batchNo,
      remark: b.remark,
    })) || [],
  }))
  afterSalesForm.reason = ''
  afterSalesForm.attachments = []
  afterSalesModalVisible.value = true
}

function cancelAfterSales() {
  afterSalesModalVisible.value = false
}

function handleAfterSalesConfirm() {
  const selectedItems = afterSalesForm.items.filter((item: any) => (item.afterSalesQuantity || 0) > 0)
  if (!selectedItems.length) {
    Message.warning('请选择需要售后的商品并填写售后数量')
    return
  }
  if (!afterSalesForm.reason) {
    Message.warning('请填写售后原因')
    return
  }
  Message.success('售后申请已提交')
  afterSalesModalVisible.value = false
}

function handleEditAddress() {
  editAddressForm.value = {
    receiverName: order.value.receiverName || '',
    receiverPhone: order.value.receiverPhone || '',
    receiverAddress: order.value.receiverAddress || '',
  }
  editAddressModalVisible.value = true
}

function handleEditAddressConfirm() {
  const { receiverName, receiverPhone, receiverAddress } = editAddressForm.value
  if (!receiverName || !receiverPhone || !receiverAddress) {
    Message.warning('请完整填写收货信息')
    return
  }
  order.value.receiverName = receiverName
  order.value.receiverPhone = receiverPhone
  order.value.receiverAddress = receiverAddress
  editAddressModalVisible.value = false
  Message.success('收货地址已更新')
}

function cancelEditAddress() {
  editAddressModalVisible.value = false
}

const payModalVisible = ref(false)
const voucherVisible = ref(false)
const payForm = ref({
  amount: 0,
  voucher: '',
  remark: '',
})

const receiveBatches = ref([
  {
    batchNo: 'B202401160001',
    shipmentNo: 'SH202401160001',
    inboundNo: 'IB202401160001',
    productName: 'C30混凝土',
    receiveQuantity: 50,
    warehouseName: '深圳湾科技园仓',
    receiveTime: '2024-01-16 14:30:00',
    inspector: '验收员A',
    currentStock: 35,
    stockAge: 2,
  },
])

const paymentRecords = ref([
  {
    paymentNo: 'PAY202401150001',
    amount: 100000,
    voucher: true,
    payTime: '2024-01-15 16:30:00',
    remark: '首付款50%',
    operator: '财务张',
    status: 'approved',
  },
  {
    paymentNo: 'PAY202401160002',
    amount: 50000,
    voucher: true,
    payTime: '2024-01-16 10:00:00',
    remark: '进度款',
    operator: '财务张',
    status: 'rejected',
    rejectReason: '转账凭证模糊，无法辨认转账金额和账户信息',
  },
  {
    paymentNo: 'PAY202401180003',
    amount: 30000,
    voucher: true,
    payTime: '2024-01-18 09:00:00',
    remark: '尾款',
    operator: '财务张',
    status: 'pending',
  },
])

const paidAmount = computed(() => {
  return paymentRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const totalQuantity = computed(() => {
  return order.value.items?.reduce((sum, item: any) => sum + item.quantity, 0) || 0
})

const confirmedQuantity = computed(() => {
  return order.value.items?.reduce((sum, item: any) => sum + (item.confirmedQuantity || 0), 0) || 0
})

const payableAmount = computed(() => {
  return order.value.totalAmount || 0
})

const unpaidAmount = computed(() => {
  return payableAmount.value - paidAmount.value
})

function handleOpenPay() {
  payForm.value.amount = unpaidAmount.value
  payModalVisible.value = true
}

function handlePayConfirm() {
  paymentRecords.value.unshift({
    paymentNo: `PAY${Date.now().toString().slice(-10)}`,
    amount: payForm.value.amount,
    voucher: true,
    payTime: new Date().toLocaleString(),
    remark: payForm.value.remark || '银行转账',
    operator: '当前用户',
    status: 'pending',
  })
  payModalVisible.value = false
  Message.success('付款登记成功')
}

function handleReuploadPayment(record: any) {
  record.status = 'pending'
  record.rejectReason = ''
  record.payTime = new Date().toLocaleString()
  Message.success('支付凭证已重新上传，等待供应商审核')
}

function handleViewVoucher(record: any) {
  voucherVisible.value = true
}

function handleUploadVoucher(options: any) {
  Message.success('凭证上传成功')
  options.onSuccess()
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    shipping: 'cyan',
    receiving: 'blue',
    completed: 'green',
    cancelled: 'red',
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
  }
  return texts[status] || status
}

function handleJumpToOrder(orderId: string) {
  router.push(`/warehouse/order/purchase/detail/${orderId}`)
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'orange',
    paid: 'green',
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待支付',
    partial: '部分支付',
    paid: '已支付',
  }
  return texts[status] || status
}

function getReceiveStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'blue',
    received: 'green',
  }
  return colors[status] || 'gray'
}

function getReceiveStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待收货',
    partial: '部分收货',
    received: '已收货',
  }
  return texts[status] || status
}

function getShipmentReceiveColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'blue',
    received: 'green',
  }
  return colors[status] || 'gray'
}

function getShipmentReceiveText(status: string) {
  const texts: Record<string, string> = {
    pending: '待收货',
    partial: '部分收货',
    received: '已收货',
  }
  return texts[status] || status
}

// 供应商接单状态
function getSupplierStatusColor(status: string) {
  const colors: Record<string, string> = {
    confirmed: 'green',    // 已确认供货
    unavailable: 'red',   // 暂无供货
  }
  return colors[status] || 'gray'
}

function getSupplierStatusText(status: string) {
  const texts: Record<string, string> = {
    confirmed: '通过',
    unavailable: '暂无供货',
  }
  return texts[status] || status
}

function handleBack() {
  router.back()
}

function handleReceive() {
  const pendingShipment = shipments.value.find(s => s.receiveStatus === 'pending' || s.receiveStatus === 'partial')
  if (pendingShipment) {
    handleReceiveShipment(pendingShipment)
  }
}

const viewReceiveModalVisible = ref(false)
const currentReceiveRecord = ref<any>(null)

function handleViewReceiveDetail(record: any) {
  currentReceiveRecord.value = record
  viewReceiveModalVisible.value = true
}

const batchItemModalVisible = ref(false)
const currentBatchItem = ref<any>(null)

function getItemAllocated(item: any) {
  return item.batches.reduce((sum: number, b: any) => sum + (Number(b.quantity) || 0), 0)
}

function generateItemBatchNo(record: any) {
  const prefix = 'BATCH'
  const suffix = Date.now().toString().slice(-6)
  record.batchNo = `${prefix}${suffix}`
}

function openBatchModal(item: any) {
  currentBatchItem.value = item
  if (!item.batches || item.batches.length === 0) {
    item.batches = [{
      batchNo: '',
      quantity: item.receiveQuantity || 0,
      remark: '',
    }]
  }
  batchItemModalVisible.value = true
}

function addItemBatch(item: any) {
  const allocated = getItemAllocated(item)
  const remaining = (item.receiveQuantity || 0) - allocated
  if (remaining <= 0) {
    Message.warning('实收数量已全部分配，无需添加更多批次')
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
    Message.warning('至少保留一个批次')
    return
  }
  item.batches.splice(index, 1)
}

function handleReceiveShipment(record: any) {
  currentShipmentBatch.value = record
  receiveForm.value.items = record.items.map((item: any) => ({
    productName: item.productName,
    spec: item.spec,
    unit: item.unit,
    quantity: item.quantity,
    shipQuantity: item.quantity,
    receiveQuantity: item.quantity,
    damageQuantity: 0,
    batches: [{
      batchNo: '',
      quantity: item.quantity,
      remark: '',
    }],
  }))
  receiveForm.value.warehouse = '深圳湾科技园项目仓'
  receiveForm.value.remark = ''
  receiveForm.value.shipmentId = record.id
  receiveModalVisible.value = true
}

async function handleReceiveConfirm() {
  if (!receiveForm.value.warehouse) {
    Message.warning('请选择入库仓库')
    return
  }

  for (const item of receiveForm.value.items) {
    const allocated = getItemAllocated(item)
    if (allocated !== item.receiveQuantity) {
      Message.warning(`"${item.productName}" 已分配数量 ${allocated} 不等于实收数量 ${item.receiveQuantity}`)
      return
    }
    for (const batch of item.batches) {
      if (!batch.batchNo) {
        batch.batchNo = `BATCH${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      }
    }
  }

  const inboundNo = `IB${Date.now()}`
  const shipment = shipments.value.find(s => s.id === receiveForm.value.shipmentId)
  if (shipment) {
    const allReceived = receiveForm.value.items.every(
      (item: any) => getItemAllocated(item) >= item.receiveQuantity
    )
    shipment.receiveStatus = allReceived ? 'received' : 'partial'
    shipment.inboundNo = inboundNo
  }

  order.value.items.forEach((item: any) => {
    const receivedItem = receiveForm.value.items.find((r: any) => r.productName === item.productName)
    if (receivedItem) {
      item.receivedQuantity = (item.receivedQuantity || 0) + getItemAllocated(receivedItem)
    }
  })

  const allReceived = order.value.items.every(
    (item: any) => (item.receivedQuantity || 0) >= (item.shippedQuantity || 0)
  )
  if (allReceived && order.value.items.every((item: any) => (item.shippedQuantity || 0) >= item.quantity)) {
    order.value.receiveStatus = 'received'
    order.value.status = 'received'
  } else {
    order.value.receiveStatus = 'partial'
  }

  const totalReceiveQuantity = receiveForm.value.items.reduce((sum: number, item: any) => sum + getItemAllocated(item), 0)
  const totalDamageQuantity = receiveForm.value.items.reduce((sum: number, item: any) => sum + (item.damageQuantity || 0), 0)
  receiveRecords.value.unshift({
    id: Date.now().toString(),
    inboundNo,
    receiveTime: new Date().toLocaleString(),
    warehouse: receiveForm.value.warehouse,
    totalQuantity: totalReceiveQuantity,
    damageQuantity: totalDamageQuantity,
    actualInbound: totalReceiveQuantity - totalDamageQuantity,
  })

  const newBatches: any[] = []
  receiveForm.value.items.forEach((item: any) => {
    item.batches.forEach((batch: any) => {
      newBatches.push({
        id: `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        inboundNo,
        productName: item.productName,
        spec: item.spec,
        unit: item.unit,
        batchNo: batch.batchNo,
        quantity: batch.quantity,
        remark: batch.remark || '',
        warehouse: receiveForm.value.warehouse,
        createTime: new Date().toLocaleString(),
      })
    })
  })
  receiveBatches.value.unshift(...newBatches)

  order.value.logs.unshift({
    time: new Date().toLocaleString(),
    content: `收货成功，生成入库单：${inboundNo}，共 ${receiveForm.value.items.length} 种商品`,
  })

  receiveModalVisible.value = false
  Message.success('收货成功，已生成入库单')
}

function cancelReceive() {
  receiveModalVisible.value = false
}

function handleViewInbound(record: any) {
  handleViewReceiveDetail(record)
}

function handleCancelOrder() {
  order.value.status = 'cancelled'
  order.value.logs.unshift({
    time: new Date().toLocaleString(),
    content: '订单已取消',
  })
  Message.success('订单已取消')
}

function handleApplyAfterSales() {
  handleOpenAfterSalesModal()
}
</script>

<style scoped lang="less">
.purchase-detail {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.upload-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.amount-summary {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  .arco-statistic:nth-child(2) .arco-statistic-value {
    color: #f53f3f !important;
  }

  .arco-statistic:nth-child(3) .arco-statistic-value {
    color: #ff7d00 !important;
    font-weight: 600 !important;
  }

  .arco-statistic:nth-child(4) .arco-statistic-value {
    color: #00b42a !important;
  }
}

.trace-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .trace-batch-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .batch-no {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }
  }
}

.trace-timeline {
  position: relative;
  padding-left: 8px;

  .timeline-item {
    position: relative;
    padding-bottom: 24px;
    padding-left: 24px;

    &:last-child {
      padding-bottom: 0;
    }

    &:before {
      content: '';
      position: absolute;
      left: 3px;
      top: 20px;
      bottom: 0;
      width: 2px;
      background: #e5e6eb;
    }

    &:last-child:before {
      display: none;
    }

    .timeline-dot {
      position: absolute;
      left: -3px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e5e6eb;
      border: 2px solid white;
      box-shadow: 0 0 0 2px #e5e6eb;
    }

    .timeline-content {
      .timeline-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;

        .timeline-time {
          margin-left: auto;
          font-size: 12px;
          color: #86909c;
          font-weight: normal;
        }
      }

      .timeline-detail {
        background: #f7f8fa;
        border-radius: 8px;
        padding: 12px 16px;

        p {
          margin: 4px 0;
          font-size: 13px;
          color: #4e5969;
        }
      }
    }

    &.success {
      .timeline-dot {
        background: #00b42a;
        box-shadow: 0 0 0 2px #00b42a;
      }

      .timeline-title {
        color: #00b42a;
      }
    }

    &.warning {
      .timeline-dot {
        background: #ff7d00;
        box-shadow: 0 0 0 2px #ff7d00;
      }

      .timeline-title {
        color: #ff7d00;
      }
    }

    &.current {
      .timeline-dot {
        background: #165dff;
        box-shadow: 0 0 0 2px #165dff;
      }

      .timeline-title {
        color: #165dff;
      }

      .timeline-detail {
        background: #e8f3ff;
      }
    }
  }
}

.amount {
  color: #f53f3f;
  font-weight: 600;
}

.text-danger {
  color: #f53f3f;
}

.text-warning {
  color: #ff7d00;
}

.text-success {
  color: #00b42a;
}

.pay-summary {
  display: flex;
  gap: 20px;
  align-items: center;

  span {
    font-size: 13px;

    &.damage {
      color: #f53f3f;
    }

    &.payable {
      color: #ff7d00;
      font-weight: 600;
    }

    &.paid {
      color: #00b42a;
    }

    &.unpaid {
      color: #f53f3f;
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.voucher-preview {
  text-align: center;
  padding: 16px;
}

.remark-text {
  display: inline-block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #86909c;
}
</style>
