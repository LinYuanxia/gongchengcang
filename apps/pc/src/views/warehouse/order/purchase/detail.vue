<template>
  <div class="purchase-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button v-if="['received', 'completed'].includes(order.status)" @click="handleOpenAfterSalesModal">
            申请售后
          </a-button>
          <a-button v-if="['received', 'completed'].includes(order.status)" @click="handleViewAfterSales">
            售后记录
          </a-button>
          <a-button v-if="order.paymentStatus !== 'paid' && order.status !== 'cancelled'" @click="handleOpenPay">
            付款
          </a-button>
          <a-button v-if="order.status === 'pending'" @click="handleCancelOrder">
            取消订单
          </a-button>
          <a-button v-if="order.status === 'pending'" type="primary" @click="handleEditAddress">
            编辑收货地址
          </a-button>
          <a-button v-if="order.status === 'shipped'" type="primary" @click="handleReceive">
            确认收货
          </a-button>
          <a-button v-if="['shipped', 'received'].includes(order.status)" @click="handleViewLogistics">
            物流跟踪
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
        <a-descriptions-item label="应付金额">¥{{ payableAmount.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="实付金额">¥{{ paidAmount.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ order.createBy }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ order.paymentTime || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-alert v-if="order.pendingDamageAmount > 0" type="warning" style="margin-top: 16px">
        待供应商售后确认货损金额：<strong>¥{{ order.pendingDamageAmount?.toLocaleString() }}</strong>（确认后自动调减应付金额）
      </a-alert>

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
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" />
          <a-table-column title="采购数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="供应商确认数量" :width="140" align="right">
            <template #cell="{ record }">
              <span :class="record.confirmedQuantity < record.quantity ? 'text-warning' : 'text-success'">
                {{ record.confirmedQuantity || record.quantity }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="确认差异" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.quantity - (record.confirmedQuantity || record.quantity) > 0 ? 'text-danger' : 'text-success'">
                {{ record.quantity - (record.confirmedQuantity || record.quantity) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="已发货数量" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.shippedQuantity < record.quantity ? 'text-warning' : 'text-success'">
                {{ record.shippedQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="已收货数量" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.receivedQuantity < record.shippedQuantity ? 'text-warning' : 'text-success'">
                {{ record.receivedQuantity || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.price?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.price)?.toLocaleString() }}
            </template>
          </a-table-column>
          <a-table-column title="供应商备注" :width="180">
            <template #cell="{ record }">
              <a-tooltip :content="record.supplierRemark || '-'">
                {{ record.supplierRemark || '-' }}
              </a-tooltip>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <a-divider />

      <h3>
        供应商确认信息
        <a-space style="margin-left: 12px">
          <a-tag color="blue">确认商品：{{ supplierConfirmSummary.acceptCount }} 种</a-tag>
          <a-tag v-if="supplierConfirmSummary.partialCount > 0" color="orange">部分供应：{{ supplierConfirmSummary.partialCount }} 种</a-tag>
          <a-tag v-if="supplierConfirmSummary.rejectCount > 0" color="red">无法供货：{{ supplierConfirmSummary.rejectCount }} 种</a-tag>
          <span class="text-subtle">确认时间：{{ order.confirmTime || '-' }}</span>
        </a-space>
      </h3>

      <a-descriptions :column="3" class="mb-16">
        <a-descriptions-item label="采购商品总数">
          <strong>{{ supplierConfirmSummary.totalPurchaseQuantity }}</strong>
        </a-descriptions-item>
        <a-descriptions-item label="供应商确认总数">
          <strong>{{ supplierConfirmSummary.totalConfirmedQuantity }}</strong>
        </a-descriptions-item>
        <a-descriptions-item label="总差异数量">
          <strong class="text-danger">{{ supplierConfirmSummary.totalDiffQuantity }}</strong>
        </a-descriptions-item>
      </a-descriptions>

      <a-alert v-if="order.confirmRemark" type="info" class="mb-16">
        <template #message>
          <icon-info-circle />
          <span>供应商备注：{{ order.confirmRemark }}</span>
        </template>
      </a-alert>

      <a-table v-if="supplierConfirmSummary.rejectItems.length > 0" :data="supplierConfirmSummary.rejectItems" :pagination="false" class="mb-16">
        <template #columns>
          <a-table-column title="无法供货商品" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="采购数量" data-index="purchaseQuantity" :width="100" align="right" />
          <a-table-column title="供应商原因" data-index="remark" />
        </template>
      </a-table>
      <a-divider />

      <h3>发货记录</h3>
      <a-table :data="shipments" :pagination="false">
        <template #columns>
          <a-table-column title="发货单号" data-index="shipmentNo" :width="180" />
          <a-table-column title="发货时间" data-index="shipTime" :width="160" />
          <a-table-column title="物流公司" data-index="logisticsCompany" :width="120" />
          <a-table-column title="物流单号" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleTrackLogistics(record)">{{ record.logisticsNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="发货数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) }}
            </template>
          </a-table-column>
          <a-table-column title="收货状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getShipmentReceiveColor(record.receiveStatus)">
                {{ getShipmentReceiveText(record.receiveStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="入库单号" :width="180">
            <template #cell="{ record }">
              <a-link v-if="record.inboundNo" @click="handleViewInbound(record)">
                {{ record.inboundNo }}
              </a-link>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link v-if="record.receiveStatus === 'pending'" @click="handleReceiveShipment(record)">
                  收货
                </a-link>
                <a-link @click="handleTrackLogistics(record)">物流信息</a-link>
                <a-link @click="handleViewShipment(record)">详情</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <a-divider />

      <h3>入库记录
        <a-button size="small" style="margin-left: 12px" @click="handleViewAllInbound">
          查看全部入库单
        </a-button>
      </h3>
      <a-table :data="inboundRecords" :pagination="false">
        <template #columns>
          <a-table-column title="入库单号" data-index="inboundNo" :width="180" />
          <a-table-column title="入库时间" data-index="inboundTime" :width="160" />
          <a-table-column title="入库类型" :width="100">
            <template #cell="{ record }">
              <a-tag color="blue">{{ record.inboundType }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="来源单据" :width="180">
            <template #cell="{ record }">
              {{ record.orderNo }}
            </template>
          </a-table-column>
          <a-table-column title="入库商品数" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items?.length || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="商品库存数" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag color="green">已完成</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-link @click="handleViewInboundDetail(record)">详情</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <a-divider />

      <h3>收货批次</h3>
      <a-table :data="receiveBatches" :pagination="false">
        <template #columns>
          <a-table-column title="批次号" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.batchNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="关联发货单" data-index="shipmentNo" :width="150" />
          <a-table-column title="关联入库单" data-index="inboundNo" :width="150" />
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="收货数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.receiveQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="收货仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="收货时间" data-index="receiveTime" :width="160" />
          <a-table-column title="验收人" data-index="inspector" :width="100" />
          <a-table-column title="当前库存" :width="100" align="right">
            <template #cell="{ record }">
              <a-tag :color="record.currentStock > 0 ? 'green' : 'grey'" size="small">
                {{ record.currentStock }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-link @click="handleTrace(record)">追溯</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>

    <a-modal
      v-model:visible="traceModalVisible"
      title="📊 批次全链路追溯"
      :width="900"
      :footer="false"
    >
      <div class="trace-header">
        <div class="trace-batch-info">
          <span class="batch-no">批次号：{{ currentTraceBatch?.batchNo }}</span>
          <a-tag color="blue">{{ currentTraceBatch?.skuName }}</a-tag>
          <a-tag color="green">{{ currentTraceBatch?.quantity }}{{ currentTraceBatch?.unit }}</a-tag>
        </div>
      </div>

      <div class="trace-timeline">
        <div class="timeline-item success">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-title">
              <component :is="IconCheckCircle" />
              <span>采购订单创建</span>
              <span class="timeline-time">2024-01-10 09:30:00</span>
            </div>
            <div class="timeline-detail">
              <p>订单号：{{ order.orderNo }}</p>
              <p>供应商：{{ order.supplierName }}</p>
              <p>下单人：{{ order.createBy }}</p>
            </div>
          </div>
        </div>

        <div class="timeline-item success">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-title">
              <component :is="IconCheckCircle" />
              <span>供应商确认接单</span>
              <span class="timeline-time">2024-01-10 14:20:00</span>
            </div>
            <div class="timeline-detail">
              <p>供应商已确认，安排发货</p>
            </div>
          </div>
        </div>

        <div class="timeline-item success">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-title">
              <component :is="IconCheckCircle" />
              <span>批次生成 & 验收入库</span>
              <span class="timeline-time">2024-01-15 11:45:00</span>
            </div>
            <div class="timeline-detail">
              <p>入库单号：IN20240115001</p>
              <p>入库仓库：{{ currentTraceBatch?.warehouseName || '1号原材料仓' }}</p>
              <p>库位：A-01-03</p>
              <p>验收人：王仓管</p>
              <p>实收数量：{{ currentTraceBatch?.quantity }}{{ currentTraceBatch?.unit }}</p>
            </div>
          </div>
        </div>

        <div class="timeline-item warning" v-if="currentTraceBatch?.outQuantity > 0">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-title">
              <component :is="IconExclamationCircle" />
              <span>部分出库领用</span>
              <span class="timeline-time">2024-01-20 08:30:00</span>
            </div>
            <div class="timeline-detail">
              <p>出库单号：OUT20240120001</p>
              <p>领用项目：3号施工现场</p>
              <p>领用人：李工长</p>
              <p>出库数量：200{{ currentTraceBatch?.unit }}</p>
            </div>
          </div>
        </div>

        <div class="timeline-item current">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-title">
              <component :is="IconInfoCircle" />
              <span>当前库存状态</span>
              <span class="timeline-time">实时</span>
            </div>
            <div class="timeline-detail">
              <p>当前库存：<a-tag color="green">{{ (currentTraceBatch?.quantity || 0) - (currentTraceBatch?.outQuantity || 200) }}{{ currentTraceBatch?.unit }}</a-tag></p>
              <p>已出库：<a-tag color="orange">{{ currentTraceBatch?.outQuantity || 200 }}{{ currentTraceBatch?.unit }}</a-tag></p>
              <p>库位状态：正常存储中</p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

      <a-divider />

      <h3>付款记录
        <a-button type="primary" size="small" style="margin-left: 12px" @click="handleOpenPay">
          付款
        </a-button>
      </h3>
      <div class="pay-summary" style="margin-bottom: 12px">
        <span>订单金额：<strong>¥{{ order.totalAmount?.toLocaleString() }}</strong></span>
        <span class="damage">货损调减：<strong>-¥{{ (order.confirmedDamageAmount || 0).toLocaleString() }}</strong></span>
        <span class="payable">应付金额：<strong>¥{{ payableAmount.toLocaleString() }}</strong></span>
        <span class="paid">已付：<strong>¥{{ paidAmount.toLocaleString() }}</strong></span>
        <span class="unpaid">待付：<strong>¥{{ unpaidAmount.toLocaleString() }}</strong></span>
      </div>

      <a-table :data="paymentRecords" :pagination="false">
        <template #columns>
          <a-table-column title="付款单号" data-index="paymentNo" :width="160" />
          <a-table-column title="付款金额" :width="120" align="right">
            <template #cell="{ record }">
              <strong>¥{{ record.amount.toLocaleString() }}</strong>
            </template>
          </a-table-column>
          <a-table-column title="付款方式" :width="100">
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
          <a-table-column title="付款时间" data-index="payTime" :width="160" />
          <a-table-column title="备注" data-index="remark" :width="200" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag color="green">已到账</a-tag>
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

    <!-- batchCreateModal removed, merged into receiveModal -->

    <!-- damageModal removed, no longer needed -->

    <a-modal
      v-model:visible="logisticsModalVisible"
      title="物流跟踪"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="物流公司">{{ currentLogistics.company }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ currentLogistics.no }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-timeline>
        <a-timeline-item v-for="(trace, index) in logisticsTraces" :key="index" :label="trace.time">
          {{ trace.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill style="color: #00b42a" />
          </template>
        </a-timeline-item>
      </a-timeline>
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
        <a-descriptions-item label="物流公司">{{ currentShipment.logisticsCompany }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ currentShipment.logisticsNo }}</a-descriptions-item>
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
      v-model:visible="inboundDetailVisible"
      title="收货详情"
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="入库单号">{{ currentInbound.inboundNo }}</a-descriptions-item>
        <a-descriptions-item label="入库时间">{{ currentInbound.inboundTime }}</a-descriptions-item>
        <a-descriptions-item label="入库类型">{{ currentInbound.inboundType }}</a-descriptions-item>
        <a-descriptions-item label="入库仓库">{{ currentInbound.warehouse }}</a-descriptions-item>
        <a-descriptions-item label="来源单据">{{ currentInbound.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentInbound.operator }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentInbound.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4>收货商品</h4>
      <a-table :data="currentInbound.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column title="入库数量" data-index="quantity" align="right" />
        </template>
      </a-table>
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
  supplierName: '广东建材有限公司',
  totalAmount: 205000,
  confirmedDamageAmount: 5000,
  pendingDamageAmount: 8400,
  status: 'pending',
  paymentStatus: 'unpaid',
  receiveStatus: 'none',
  createTime: '2024-01-15 10:30:00',
  createBy: '张采购',
  paymentTime: '',
  confirmTime: '2024-01-15 14:30:00',
  confirmRemark: '水泥目前库存紧张，正在加急生产，预计3天内可补发',
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
      confirmedQuantity: 100,
      supplierRemark: '',
      shippedQuantity: 0,
      receivedQuantity: 0,
      price: 380,
    },
    {
      id: '2',
      productName: '螺纹钢',
      spec: 'Φ20',
      unit: '吨',
      quantity: 50,
      confirmedQuantity: 40,
      supplierRemark: '部分缺货，后续优先安排',
      shippedQuantity: 0,
      receivedQuantity: 0,
      price: 4200,
    },
    {
      id: '3',
      productName: '水泥',
      spec: 'P.O42.5',
      unit: '吨',
      quantity: 20,
      confirmedQuantity: 5,
      supplierRemark: '库存不足',
      shippedQuantity: 0,
      receivedQuantity: 0,
      price: 500,
    },
  ],
  logs: [
    { time: '2024-01-16 14:30:00', content: '部分收货成功，生成入库单：IB202401160001' },
    { time: '2024-01-16 09:00:00', content: '供应商发货，物流：顺丰速运 SF1234567890' },
    { time: '2024-01-15 16:30:00', content: '订单支付成功' },
    { time: '2024-01-15 14:30:00', content: '供应商确认订单：确认3种商品，部分供应2种' },
    { time: '2024-01-15 10:30:00', content: '订单创建成功' },
  ],
})

const supplierConfirmSummary = computed(() => {
  const items = order.value.items
  const acceptItems = items.filter(i => i.confirmedQuantity > 0)
  const partialItems = items.filter(i => (i.confirmedQuantity || i.quantity) < i.quantity)
  const rejectItems = items.filter(i => i.confirmedQuantity === 0)

  const totalPurchaseQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalConfirmedQuantity = items.reduce((sum, i) => sum + (i.confirmedQuantity || i.quantity), 0)
  const totalDiffQuantity = totalPurchaseQuantity - totalConfirmedQuantity

  return {
    acceptCount: acceptItems.length,
    partialCount: partialItems.length,
    rejectCount: rejectItems.length,
    rejectItems: rejectItems.map(i => ({
      productName: i.productName,
      spec: i.spec,
      purchaseQuantity: i.quantity,
      remark: i.supplierRemark,
    })),
    totalPurchaseQuantity,
    totalConfirmedQuantity,
    totalDiffQuantity,
  }
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

const inboundRecords = ref([
  {
    id: '1',
    inboundNo: 'IB202401160001',
    inboundTime: '2024-01-16 14:30:00',
    shipmentNo: 'SH202401160001',
    orderNo: 'PO202401150001',
    inboundType: '采购入库',
    status: 'completed',
    warehouse: '主仓库',
    operator: '张三',
    remark: '',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 50 },
    ],
  },
])

const receiveModalVisible = ref(false)
const receiveForm = ref({
  items: [] as any[],
  warehouse: '主仓库',
  remark: '',
  shipmentId: '',
})

const logisticsModalVisible = ref(false)
const currentLogistics = ref<any>({})
const logisticsTraces = ref([
  { time: '2024-01-16 14:30', content: '快件已签收，签收人：张三，如有疑问请联系派送员：李师傅(13900139000)' },
  { time: '2024-01-16 10:20', content: '快件正在派送中，派送员：李师傅(13900139000)' },
  { time: '2024-01-16 08:15', content: '快件到达【深圳南山营业点】' },
  { time: '2024-01-15 22:30', content: '快件已发车' },
  { time: '2024-01-15 20:00', content: '快件已揽收' },
])

const shipmentDetailVisible = ref(false)
const currentShipment = ref<any>({})

const inboundDetailVisible = ref(false)
const currentInbound = ref<any>({})

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
  },
  {
    paymentNo: 'PAY202401160002',
    amount: 50000,
    voucher: true,
    payTime: '2024-01-16 10:00:00',
    remark: '进度款',
    operator: '财务张',
  },
])

const paidAmount = computed(() => {
  return paymentRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const payableAmount = computed(() => {
  return (order.value.totalAmount || 0) - (order.value.confirmedDamageAmount || 0)
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
  })
  payModalVisible.value = false
  Message.success('付款登记成功')
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
    to_confirm: 'gold',
    pending: 'orange',
    paid: 'blue',
    confirmed: 'blue',
    shipped: 'cyan',
    received: 'green',
    completed: 'green',
    cancelled: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    to_confirm: '待确认',
    pending: '供应商待确认',
    paid: '已支付',
    confirmed: '已确认',
    shipped: '已发货',
    received: '已收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
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

function handleBack() {
  router.back()
}

function handleReceive() {
  const pendingShipment = shipments.value.find(s => s.receiveStatus === 'pending' || s.receiveStatus === 'partial')
  if (pendingShipment) {
    handleReceiveShipment(pendingShipment)
  }
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

  inboundRecords.value.unshift({
    id: Date.now().toString(),
    inboundNo,
    inboundTime: new Date().toLocaleString(),
    shipmentNo: shipment?.shipmentNo || '',
    orderNo: order.value.orderNo,
    inboundType: '采购入库',
    status: 'completed',
    warehouse: receiveForm.value.warehouse,
    operator: '当前用户',
    remark: receiveForm.value.remark,
    items: receiveForm.value.items.map((item: any) => ({
      productName: item.productName,
      spec: item.spec,
      quantity: getItemAllocated(item),
    })),
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

function handleViewLogistics() {
  if (shipments.value.length > 0) {
    handleTrackLogistics(shipments.value[0])
  }
}

function handleTrackLogistics(record: any) {
  currentLogistics.value = {
    company: record.logisticsCompany,
    no: record.logisticsNo,
  }
  logisticsModalVisible.value = true
}

function handleViewShipment(record: any) {
  currentShipment.value = record
  shipmentDetailVisible.value = true
}

function handleViewInbound(record: any) {
  const inbound = inboundRecords.value.find(i => i.inboundNo === record.inboundNo)
  if (inbound) {
    handleViewInboundDetail(inbound)
  }
}

function handleViewInboundDetail(record: any) {
  currentInbound.value = record
  inboundDetailVisible.value = true
}

function handleViewAllInbound() {
  router.push('/warehouse/stock/inbound')
}

function handleViewAfterSales() {
  router.push('/warehouse/order/after-sales')
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
</style>
