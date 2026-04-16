<template>
  <div class="order-detail">
    <a-page-header
      :title="`订单详情 - ${order.orderNo}`"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" status="warning" @click="handleReissue">
            <template #icon><icon-refresh /></template>
            补发商品
          </a-button>
          <a-button v-if="order.status === 'confirmed' || order.shipStatus === 'partial'" type="primary" @click="handleShip">
            <template #icon><icon-send /></template>
            {{ order.shipStatus === 'partial' ? '继续发货' : '发货' }}
          </a-button>
          <a-button v-if="allShipmentRecords.length > 0" @click="handleViewLogistics">
            <template #icon><icon-location /></template>
            物流跟踪
          </a-button>
          <a-button v-if="order.status !== 'refunded' && order.status !== 'cancelled'" type="primary" status="danger" @click="handleApplyRefund">
            <template #icon><icon-refund /></template>
            申请退款
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card class="mt-16">
      <a-descriptions :column="4" bordered>
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span class="amount">¥{{ order.totalAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">
            {{ getStatusText(order.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPaymentStatusColor(order.paymentStatus)">
            {{ getPaymentStatusText(order.paymentStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发货状态">
          <a-tag :color="getShipStatusColor(order.shipStatus)">
            {{ getShipStatusText(order.shipStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ order.paymentTime || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="商品信息" class="mt-16">
      <template #extra>
        <a-tag color="green">确认供货：{{ order.items?.filter((i: any) => i.confirmStatus === 'accept' || !i.confirmStatus).length }} 种</a-tag>
        <a-tag color="red" style="margin-left: 8px">无法供货：{{ order.items?.filter((i: any) => i.confirmStatus === 'reject').length }} 种</a-tag>
      </template>
      <a-table :data="order.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" />
          <a-table-column title="采购数量" data-index="quantity" :width="100" align="right" />
          <a-table-column title="接单状态" :width="120">
            <template #cell="{ record }">
              <a-tag v-if="record.confirmStatus === 'reject'" color="red">无法供货</a-tag>
              <a-tag v-else color="green">确认供货</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="无法供货原因" :width="150">
            <template #cell="{ record }">
              <span v-if="record.confirmStatus === 'reject'" class="text-danger">
                {{ getRejectReasonText(record.rejectReason) }}
              </span>
              <span v-else class="text-disabled">-</span>
            </template>
          </a-table-column>
          <a-table-column title="预计发货时间" :width="140">
            <template #cell="{ record }">
              <span v-if="record.confirmStatus !== 'reject'">{{ record.estimatedShipDate || '-' }}</span>
              <span v-else class="text-disabled">-</span>
            </template>
          </a-table-column>
          <a-table-column title="已发货数量" :width="120" align="right" v-if="order.shipStatus !== 'pending'">
            <template #cell="{ record }">
              <span v-if="record.confirmStatus !== 'reject'" :class="record.shippedQuantity < record.quantity ? 'text-warning' : 'text-success'">
                {{ record.shippedQuantity || 0 }}
              </span>
              <span v-else class="text-disabled">-</span>
            </template>
          </a-table-column>
          <a-table-column title="待发货数量" :width="120" align="right" v-if="order.shipStatus !== 'pending'">
            <template #cell="{ record }">
              <span v-if="record.confirmStatus !== 'reject'" class="text-danger">{{ record.quantity - (record.shippedQuantity || 0) }}</span>
              <span v-else class="text-disabled">-</span>
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
          <a-table-column title="备注" :width="150">
            <template #cell="{ record }">
              {{ record.remark || '-' }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-card title="发货记录" class="mt-16">
      <template #extra>
        <a-space>
          <a-button type="primary" status="warning" @click="handleReissue">
            <template #icon><icon-refresh /></template>
            补发商品
          </a-button>
          <a-button v-if="order.shipStatus === 'partial'" type="primary" @click="handleShip">
            继续发货
          </a-button>
        </a-space>
      </template>

      <a-table :data="allShipmentRecords" :pagination="false">
        <template #columns>
          <a-table-column title="类型" :width="80">
            <template #cell="{ record }">
              <a-tag v-if="record.type === 'reissue'" color="orange">补发</a-tag>
              <a-tag v-else color="blue">正常发货</a-tag>
            </template>
          </a-table-column>
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
          <a-table-column title="补发原因" :width="150">
            <template #cell="{ record }">
              {{ record.reissueReason ? getReissueReasonText(record.reissueReason) : '-' }}
            </template>
          </a-table-column>
          <a-table-column title="发货状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getShipmentStatusColor(record.status)">
                {{ getShipmentStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="150" ellipsis />
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleTrackLogistics(record)">物流跟踪</a-link>
                <a-link @click="handleViewShipment(record)">详情</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-alert type="info" class="mt-16">
      <template #message>
        <icon-info-circle />
        <span>【支付与发货解耦】：支付状态不影响发货流程，发货无需等待支付完成，但订单最终完成前需结清全部款项。当前支持分批支付</span>
      </template>
    </a-alert>

    <a-card title="付款记录" class="mt-16">
      <template #extra>
        <div class="pay-summary">
          <span>订单金额：<strong>¥{{ order.totalAmount?.toLocaleString() }}</strong></span>
          <span class="paid">已到账：<strong>¥{{ paidAmount.toLocaleString() }}</strong></span>
          <span class="unpaid">待结算：<strong>¥{{ unpaidAmount.toLocaleString() }}</strong></span>
        </div>
      </template>

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
          <a-table-column title="到账时间" data-index="payTime" :width="160" />
          <a-table-column title="备注" data-index="remark" :width="200" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag color="green">已确认</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

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

    <a-modal
      v-model:visible="reissueModalVisible"
      title="补发商品"
      :width="800"
      @ok="handleReissueSubmit"
      @cancel="reissueModalVisible = false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        补发用于处理运输破损、数量损耗等场景，补发记录将关联至原订单
      </a-alert>

      <a-form :model="reissueForm" layout="vertical">
        <a-form-item label="补发原因" required>
          <a-radio-group v-model="reissueForm.reason">
            <a-radio value="damage">运输破损</a-radio>
            <a-radio value="loss">数量损耗</a-radio>
            <a-radio value="quality">质量问题</a-radio>
            <a-radio value="miss">错发漏发</a-radio>
            <a-radio value="other">其他原因</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="选择补发商品" required>
          <a-table :data="reissueForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="已发货数量" :width="100" align="right" />
              <a-table-column title="补发数量" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.reissueQuantity"
                    :min="0"
                    :max="record.quantity"
                    :precision="0"
                    style="width: 120px"
                    placeholder="补发数量"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-divider>物流信息</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="物流公司" required>
              <a-select v-model="reissueForm.logisticsCompany" placeholder="请选择物流公司" style="width: 100%">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="中通快递">中通快递</a-option>
                <a-option value="圆通速递">圆通速递</a-option>
                <a-option value="德邦快递">德邦快递</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="物流单号" required>
              <a-input v-model="reissueForm.logisticsNo" placeholder="请输入物流单号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="补发备注">
          <a-textarea v-model="reissueForm.remark" placeholder="详细说明补发原因及处理方案" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-card title="发票信息" class="mt-16">
      <template #extra>
        <a-button 
          v-if="order.status === 'completed' && (!order.invoice || order.invoice.status !== 'issued')" 
          type="primary" 
          @click="handleOpenInvoice"
        >
          <template #icon><icon-file-add /></template>
          开具发票
        </a-button>
        <a-space v-if="order.invoice && order.invoice.status === 'issued'">
          <a-button size="small" @click="handleDownloadInvoice">
            <template #icon><icon-download /></template>
            下载发票
          </a-button>
        </a-space>
      </template>

      <a-empty v-if="!order.invoice" description="暂未开具发票">
        <template #description>
          <div>订单完成后可开具发票</div>
        </template>
      </a-empty>

      <a-descriptions :column="3" bordered v-if="order.invoice">
        <a-descriptions-item label="发票状态">
          <a-tag color="green">已开具</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发票类型">{{ order.invoice.invoiceTypeText }}</a-descriptions-item>
        <a-descriptions-item label="发票号码">{{ order.invoice.invoiceNo }}</a-descriptions-item>
        <a-descriptions-item label="发票代码">{{ order.invoice.invoiceCode || '-' }}</a-descriptions-item>
        <a-descriptions-item label="开票日期">{{ order.invoice.invoiceDate }}</a-descriptions-item>
        <a-descriptions-item label="价税合计">¥{{ order.invoice.invoiceAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="税率">{{ order.invoice.taxRate }}</a-descriptions-item>
        <a-descriptions-item label="开票方式">{{ order.invoice.issueTypeText }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="3">{{ order.invoice.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="退款记录" class="mt-16">
      <template #extra>
        <a-button type="primary" status="danger" @click="handleApplyRefund">
          <template #icon><icon-refund /></template>
          申请退款
        </a-button>
      </template>

      <a-empty v-if="refundRecords.length === 0" description="暂无退款记录" />

      <a-table :data="refundRecords" :pagination="false" v-else>
        <template #columns>
          <a-table-column title="退款单号" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleViewRefundDetail(record)">{{ record.refundNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="退款类型" :width="100">
            <template #cell="{ record }">
              {{ getRefundTypeText(record.type) }}
            </template>
          </a-table-column>
          <a-table-column title="退款状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getRefundStatusColor(record.status)">
                {{ getRefundStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="退款商品" :width="200">
            <template #cell="{ record }">
              <div class="text-truncate" :title="record.items?.map((i: any) => i.productName).join('、')">
                {{ record.items?.map((i: any) => i.productName).join('、') || '-' }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="退款金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.totalRefundAmount?.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-link @click="handleViewRefundDetail(record)">详情</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="refundModalVisible"
      title="申请退款"
      :width="800"
      @ok="handleRefundSubmit"
      @cancel="refundModalVisible = false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        退款申请提交后将进入审批流程，请如实填写退款原因
      </a-alert>

      <a-form :model="refundForm" layout="vertical">
        <a-form-item label="退款类型" required>
          <a-radio-group v-model="refundForm.type">
            <a-radio value="quantity">数量损耗</a-radio>
            <a-radio value="quality">质量问题</a-radio>
            <a-radio value="miss">错发漏发</a-radio>
            <a-radio value="price">价格差异</a-radio>
            <a-radio value="other">其他原因</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="选择退款商品">
          <a-table :data="refundForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="订购数量" :width="100" align="right" />
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price?.toLocaleString() }}
                </template>
              </a-table-column>
              <a-table-column title="退款数量" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.refundQuantity"
                    :min="0"
                    :max="record.quantity"
                    :precision="0"
                    style="width: 120px"
                    placeholder="退款数量"
                    @change="calcRefundAmount"
                  />
                </template>
              </a-table-column>
              <a-table-column title="退款金额" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.refundAmount"
                    :min="0"
                    :precision="2"
                    style="width: 120px"
                    placeholder="退款金额"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-form-item label="退款总金额">
          <span class="text-danger text-xl">¥{{ totalRefundAmount.toLocaleString() }}</span>
        </a-form-item>

        <a-form-item label="退款原因" required>
          <a-textarea v-model="refundForm.reason" placeholder="详细说明退款原因" :max-length="500" :rows="3" />
        </a-form-item>

        <a-form-item label="备注说明">
          <a-textarea v-model="refundForm.remark" placeholder="其他补充说明（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-card title="操作日志" class="mt-16">
      <a-timeline>
        <a-timeline-item v-for="(log, index) in order.logs" :key="index" :label="log.time">
          {{ log.content }}
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <a-modal
      v-model:visible="shipModalVisible"
      title="发货"
      :width="800"
      @ok="handleShipConfirm"
      @cancel="cancelShip"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>支持分批发货，可选择部分商品发货</div>
        </template>
      </a-alert>

      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="发货商品" required>
          <a-table :data="shipForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="待发货数量" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">{{ record.pendingQuantity }}</span>
                </template>
              </a-table-column>
              <a-table-column title="本次发货数量" :width="150" align="right">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.shipQuantity"
                    :min="0"
                    :max="record.pendingQuantity"
                    :precision="0"
                    style="width: 120px"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-divider>物流信息</a-divider>

        <a-form-item label="物流公司" required>
          <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司" style="width: 300px">
            <a-option value="顺丰速运">顺丰速运</a-option>
            <a-option value="中通快递">中通快递</a-option>
            <a-option value="圆通速递">圆通速递</a-option>
            <a-option value="韵达快递">韵达快递</a-option>
            <a-option value="申通快递">申通快递</a-option>
            <a-option value="京东物流">京东物流</a-option>
            <a-option value="德邦快递">德邦快递</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="物流单号" required>
          <a-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" style="width: 300px" />
          <a-button type="text" @click="handleAddLogistics" style="margin-left: 8px">
            <template #icon><icon-plus /></template>
            添加物流单号
          </a-button>
        </a-form-item>

        <div v-if="shipForm.additionalLogistics.length > 0" style="margin-bottom: 16px">
          <div v-for="(logistics, index) in shipForm.additionalLogistics" :key="index" style="margin-bottom: 8px">
            <a-select v-model="logistics.company" placeholder="物流公司" style="width: 150px; margin-right: 8px">
              <a-option value="顺丰速运">顺丰速运</a-option>
              <a-option value="中通快递">中通快递</a-option>
              <a-option value="圆通速递">圆通速递</a-option>
              <a-option value="韵达快递">韵达快递</a-option>
              <a-option value="申通快递">申通快递</a-option>
              <a-option value="京东物流">京东物流</a-option>
              <a-option value="德邦快递">德邦快递</a-option>
            </a-select>
            <a-input v-model="logistics.no" placeholder="物流单号" style="width: 200px; margin-right: 8px" />
            <a-button type="text" status="danger" @click="handleRemoveLogistics(index)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>

        <a-form-item label="发货备注">
          <a-textarea
            v-model="shipForm.remark"
            placeholder="请输入发货备注（选填）"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="logisticsModalVisible"
      title="物流跟踪"
      :width="700"
      :footer="false"
    >
      <a-form layout="inline" style="margin-bottom: 16px" v-if="allLogisticsList.length > 1">
        <a-form-item label="选择物流">
          <a-select v-model="selectedLogisticsId" style="width: 400px" @change="handleLogisticsChange">
            <a-option v-for="logistics in allLogisticsList" :key="logistics.id" :value="logistics.id">
              {{ logistics.company }} - {{ logistics.no }}
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>

      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="发货单号">{{ currentLogistics.shipmentNo }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ currentLogistics.shipTime }}</a-descriptions-item>
        <a-descriptions-item label="物流公司">{{ currentLogistics.company }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ currentLogistics.no }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-timeline>
        <a-timeline-item v-for="(trace, index) in currentLogisticsTraces" :key="index" :label="trace.time">
          {{ trace.content }}
          <template #dot v-if="index === 0">
            <icon-check-circle-fill style="color: #00b42a" />
          </template>
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <a-modal
      v-model:visible="invoiceModalVisible"
      title="开具发票"
      :width="800"
      @ok="handleInvoiceSubmit"
      @cancel="invoiceModalVisible = false"
    >
      <a-radio-group v-model="invoiceForm.issueType" style="margin-bottom: 20px">
        <a-radio value="upload">
          <template #icon><icon-upload /></template>
          上传已有发票
        </a-radio>
        <a-radio value="online">
          <template #icon><icon-cloud-server /></template>
          在线开具电子发票
        </a-radio>
      </a-radio-group>

      <a-alert v-if="invoiceForm.issueType === 'online'" type="info" style="margin-bottom: 16px">
        将自动带入订单信息开具电子发票，开票成功后将自动获取发票PDF
      </a-alert>

      <a-form :model="invoiceForm" layout="vertical">
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="invoiceForm.invoiceType">
            <a-radio value="special">增值税专用发票</a-radio>
            <a-radio value="normal">增值税普通发票</a-radio>
            <a-radio value="electronic">电子普通发票</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发票号码" required>
              <a-input v-model="invoiceForm.invoiceNo" placeholder="请输入发票号码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发票代码">
              <a-input v-model="invoiceForm.invoiceCode" placeholder="请输入发票代码" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开票日期" required>
              <a-date-picker v-model="invoiceForm.invoiceDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="价税合计" required>
              <a-input-number 
                v-model="invoiceForm.invoiceAmount" 
                :min="0" 
                :precision="2" 
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="税率" required>
          <a-select v-model="invoiceForm.taxRate" placeholder="请选择税率" style="width: 200px">
            <a-option value="13%">13% (一般货物)</a-option>
            <a-option value="9%">9% (建筑服务)</a-option>
            <a-option value="6%">6% (服务)</a-option>
            <a-option value="3%">3% (小规模)</a-option>
            <a-option value="0%">0% (免税)</a-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="invoiceForm.issueType === 'upload'" label="上传发票附件" required>
          <a-upload
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleFileChange"
          >
            <a-button>
              <template #icon><icon-upload /></template>
              选择文件
            </a-button>
            <template #tip>
              <div style="color: #86909c; font-size: 12px; margin-top: 4px">
                支持 PDF、JPG、PNG 格式，单个文件不超过 10MB
              </div>
            </template>
          </a-upload>
          <div v-if="invoiceForm.file" style="margin-top: 8px">
            <a-tag color="blue" closable @close="invoiceForm.file = null">
              <icon-file /> {{ invoiceForm.file.name }}
            </a-tag>
          </div>
        </a-form-item>

        <a-form-item v-if="invoiceForm.issueType === 'online'" label="购方信息">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="公司名称">{{ order.warehouseName }}</a-descriptions-item>
            <a-descriptions-item label="纳税人识别号">91440300MA5XXXXXXX</a-descriptions-item>
            <a-descriptions-item label="地址电话">深圳市南山区科技园 0755-88888888</a-descriptions-item>
            <a-descriptions-item label="开户行及账号">招商银行深圳南山支行 7559xxxxxxx</a-descriptions-item>
          </a-descriptions>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model="invoiceForm.remark" placeholder="备注信息（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
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
        <a-descriptions-item label="发货状态">
          <a-tag :color="getShipmentStatusColor(currentShipment.status)">
            {{ getShipmentStatusText(currentShipment.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发货人">{{ currentShipment.operator }}</a-descriptions-item>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const orderId = route.params.id || '1'

const order = ref<any>({
  id: orderId,
  orderNo: 'PO202401150001',
  warehouseName: '深圳湾科技园项目仓',
  totalAmount: 205000,
  status: 'completed',
  paymentStatus: 'paid',
  shipStatus: 'shipped',
  createTime: '2024-01-15 10:30:00',
  paymentTime: '2024-01-15 16:30:00',
  items: [
    {
      id: '1',
      productName: 'C30混凝土',
      spec: 'C30',
      unit: 'm³',
      quantity: 100,
      confirmStatus: 'accept',
      estimatedShipDate: '2024-01-16',
      shippedQuantity: 50,
      price: 380,
      remark: '优先保证供应',
    },
    {
      id: '2',
      productName: '螺纹钢',
      spec: 'Φ20',
      unit: '吨',
      quantity: 50,
      confirmStatus: 'accept',
      estimatedShipDate: '2024-01-17',
      shippedQuantity: 25,
      price: 4200,
      remark: '分两批发',
    },
    {
      id: '3',
      productName: '内墙乳胶漆',
      spec: '20L/桶',
      unit: '桶',
      quantity: 15,
      confirmStatus: 'reject',
      rejectReason: 'stock',
      shippedQuantity: 0,
      price: 500,
      remark: '建议更换型号，可替代型号已报价',
    },
  ],
  logs: [
    { time: '2024-01-16 09:00:00', content: '第一次发货完成，发货单号：SH202401160001' },
    { time: '2024-01-15 16:30:00', content: '收到第一笔付款' },
    { time: '2024-01-15 11:00:00', content: '已确认接单，预计发货时间：2024-01-16' },
    { time: '2024-01-15 10:30:00', content: '订单创建成功' },
  ],
})

const receiveBatches = ref([
  {
    batchNo: 'B202401160001',
    shipmentNo: 'SH202401160001',
    productName: 'C30混凝土',
    receiveQuantity: 50,
    warehouseName: '深圳湾科技园仓',
    receiveTime: '2024-01-16 14:30:00',
    inspector: '验收员A',
  },
])

const paymentRecords = ref([
  {
    paymentNo: 'PAY202401150001',
    amount: 100000,
    voucher: true,
    payTime: '2024-01-15 16:30:00',
    remark: '首付款50%',
  },
  {
    paymentNo: 'PAY202401160002',
    amount: 50000,
    voucher: true,
    payTime: '2024-01-16 10:00:00',
    remark: '进度款',
  },
])

const paidAmount = computed(() => {
  return paymentRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const unpaidAmount = computed(() => {
  return (order.value.totalAmount || 0) - paidAmount.value
})

order.value.paymentStatus = computed(() => {
  if (unpaidAmount.value === 0) return 'paid'
  if (paidAmount.value > 0) return 'partial'
  return 'pending'
}).value

order.value.status = 'confirmed'

const voucherVisible = ref(false)

function handleViewVoucher(record: any) {
  voucherVisible.value = true
}

const normalShipments = ref([
  {
    id: '1',
    shipmentNo: 'SH202401160001',
    shipTime: '2024-01-16 09:00:00',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890',
    status: 'shipped',
    operator: '张三',
    remark: '第一批50%发货',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 50 },
      { productName: '螺纹钢', spec: 'Φ20', quantity: 25 },
    ],
  },
  {
    id: '2',
    shipmentNo: 'SH202401170002',
    shipTime: '2024-01-17 14:30:00',
    logisticsCompany: '京东物流',
    logisticsNo: 'JD9876543210',
    status: 'shipped',
    operator: '张三',
    remark: '第二批剩余部分',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 50 },
      { productName: '螺纹钢', spec: 'Φ20', quantity: 25 },
    ],
  },
])

const reissueShipments = ref([
  {
    id: 'R001',
    shipmentNo: 'BF202401180001',
    shipTime: '2024-01-18 11:00:00',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF9876543210',
    status: 'shipped',
    operator: '李经理',
    reissueReason: 'damage',
    type: 'reissue',
    remark: '运输过程5方混凝土罐体漏浆补发',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 5 },
    ],
  },
])

const allShipmentRecords = computed(() => {
  return [...normalShipments.value, ...reissueShipments.value]
    .sort((a, b) => new Date(b.shipTime).getTime() - new Date(a.shipTime).getTime())
})

function getReissueReasonText(reason: string) {
  const reasonMap: Record<string, string> = {
    damage: '运输破损',
    loss: '数量损耗',
    quality: '质量问题',
    miss: '错发漏发',
    other: '其他原因',
  }
  return reasonMap[reason] || reason
}

const reissueModalVisible = ref(false)
const reissueForm = ref<any>({
  reason: '',
  logisticsCompany: '',
  logisticsNo: '',
  remark: '',
  items: [] as any[],
})

function handleReissue() {
  reissueForm.value = {
    reason: 'damage',
    logisticsCompany: '',
    logisticsNo: '',
    remark: '',
    items: order.value.items
      .filter((item: any) => item.confirmStatus !== 'reject')
      .map((item: any) => ({
        ...item,
        reissueQuantity: 0,
      })),
  }
  reissueModalVisible.value = true
}

function handleReissueSubmit() {
  const hasReissueItem = reissueForm.value.items.some((item: any) => item.reissueQuantity > 0)
  
  if (!hasReissueItem) {
    Message.warning('请至少选择一个商品并填写补发数量')
    return
  }
  if (!reissueForm.value.logisticsCompany) {
    Message.warning('请选择物流公司')
    return
  }
  if (!reissueForm.value.logisticsNo) {
    Message.warning('请输入物流单号')
    return
  }

  const reissueItems = reissueForm.value.items
    .filter((item: any) => item.reissueQuantity > 0)
    .map((item: any) => ({
      productName: item.productName,
      spec: item.spec,
      quantity: item.reissueQuantity,
    }))

  const newReissue = {
    id: `R${Date.now()}`,
    shipmentNo: `BF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(reissueShipments.value.length + 1).padStart(4, '0')}`,
    shipTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    logisticsCompany: reissueForm.value.logisticsCompany,
    logisticsNo: reissueForm.value.logisticsNo,
    status: 'shipping',
    operator: '当前用户',
    reissueReason: reissueForm.value.reason,
    type: 'reissue',
    remark: reissueForm.value.remark,
    items: reissueItems,
  }

  reissueShipments.value.push(newReissue)

  const reasonText = getReissueReasonText(reissueForm.value.reason)
  reissueItems.forEach((item: any) => {
    console.log('[库存自动记账] 补发扣减库存', {
      recordNo: `INV${Date.now()}`,
      skuName: item.productName,
      spec: item.spec,
      changeType: 'replenish_ship',
      changeQty: -item.quantity,
      orderNo: order.value.orderNo,
      bizType: '补发',
      operator: '当前用户',
      changeTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      remark: reasonText,
    })
  })

  reissueModalVisible.value = false
  Message.success('补发申请已提交，商品已发出，库存已自动扣减')
}

const refundRecords = ref([
  {
    id: '1',
    refundNo: 'TK202401180001',
    type: 'quantity',
    status: 'pending',
    items: [
      { productName: 'C30混凝土', spec: 'C30', quantity: 5, refundAmount: 1900 },
    ],
    totalRefundAmount: 1900,
    reason: '运输过程罐体漏浆，实收95方，约定损耗2%，超出3%部分退款',
    remark: '',
    operator: '李经理',
    createTime: '2024-01-18 09:30:00',
  },
  {
    id: '2',
    refundNo: 'TK202401170002',
    type: 'quality',
    status: 'confirmed',
    items: [
      { productName: 'HRB400钢筋', spec: 'Φ16mm', quantity: 2, refundAmount: 8600 },
    ],
    totalRefundAmount: 8600,
    reason: '部分批次检验不合格，协商退款',
    remark: '质量问题已确认',
    operator: '王主管',
    createTime: '2024-01-17 14:20:00',
  },
  {
    id: '3',
    refundNo: 'TK202401160003',
    type: 'other',
    status: 'rejected',
    items: [
      { productName: 'PC42.5水泥', spec: 'PC42.5', quantity: 10, refundAmount: 5500 },
    ],
    totalRefundAmount: 5500,
    reason: '价格差异协商退款',
    remark: '价格在约定范围内，不予退款',
    operator: '张经理',
    createTime: '2024-01-16 11:00:00',
  },
])

function getRefundTypeText(type: string) {
  const map: Record<string, string> = {
    quantity: '数量损耗',
    quality: '质量问题',
    miss: '错发漏发',
    price: '价格差异',
    other: '其他原因',
  }
  return map[type] || type
}

function getRefundStatusText(status: string) {
  const map: Record<string, string> = {
    processing: '待处理',
    pending: '待确认',
    confirmed: '已完成',
    rejected: '已拒绝',
    refunded: '已退款',
  }
  return map[status] || status
}

function getRefundStatusColor(status: string) {
  const map: Record<string, string> = {
    processing: 'orange',
    pending: 'orange',
    confirmed: 'green',
    rejected: 'red',
    refunded: 'green',
  }
  return map[status] || 'gray'
}

const refundModalVisible = ref(false)
const refundForm = ref<any>({
  type: 'quantity',
  reason: '',
  remark: '',
  items: [] as any[],
})

const totalRefundAmount = computed(() => {
  return refundForm.value.items.reduce((sum: number, item: any) => sum + (item.refundAmount || 0), 0)
})

function calcRefundAmount() {
  refundForm.value.items.forEach((item: any) => {
    if (item.refundQuantity && item.price) {
      item.refundAmount = item.refundQuantity * item.price
    }
  })
}

function handleApplyRefund() {
  refundForm.value = {
    type: 'quantity',
    reason: '',
    remark: '',
    items: order.value.items
      .filter((item: any) => item.confirmStatus !== 'reject')
      .map((item: any) => ({
        ...item,
        refundQuantity: 0,
        refundAmount: 0,
      })),
  }
  refundModalVisible.value = true
}

function handleRefundSubmit() {
  const hasRefundItem = refundForm.value.items.some((item: any) => item.refundAmount > 0)
  
  if (!hasRefundItem) {
    Message.warning('请至少选择一个商品并填写退款金额')
    return
  }
  if (!refundForm.value.reason) {
    Message.warning('请填写退款原因')
    return
  }

  const refundItems = refundForm.value.items
    .filter((item: any) => item.refundAmount > 0)
    .map((item: any) => ({
      productName: item.productName,
      spec: item.spec,
      quantity: item.refundQuantity,
      refundAmount: item.refundAmount,
    }))

  const newRefund = {
    id: `${Date.now()}`,
    refundNo: `TK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(refundRecords.value.length + 1).padStart(4, '0')}`,
    type: refundForm.value.type,
    status: 'pending',
    items: refundItems,
    totalRefundAmount: totalRefundAmount.value,
    reason: refundForm.value.reason,
    remark: refundForm.value.remark,
    operator: '当前用户',
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }

  refundRecords.value.unshift(newRefund)
  refundModalVisible.value = false
  Message.success('退款申请已提交，请等待审批')
}

function handleViewRefundDetail(record: any) {
  Message.info('查看退款详情：' + record.refundNo)
}

const shipModalVisible = ref(false)
const shipForm = ref({
  items: [] as any[],
  logisticsCompany: '',
  logisticsNo: '',
  additionalLogistics: [] as any[],
  remark: '',
})

const logisticsModalVisible = ref(false)
const selectedLogisticsId = ref('')
const currentLogistics = ref<any>({})

const allLogisticsList = computed(() => {
  return allShipmentRecords.value.map(s => ({
    id: s.id,
    shipmentNo: s.shipmentNo,
    shipTime: s.shipTime,
    company: s.logisticsCompany,
    no: s.logisticsNo,
  }))
})

const currentLogisticsTraces = computed(() => {
  const tracesMap: Record<string, any[]> = {
    '1': [
      { time: '2024-01-16 14:30', content: '快件正在派送中，派送员：张师傅(13800138000)' },
      { time: '2024-01-16 10:20', content: '快件到达【深圳南山营业点】' },
      { time: '2024-01-16 08:15', content: '快件已从【深圳宝安中转场】发出' },
      { time: '2024-01-16 02:30', content: '快件已发车' },
      { time: '2024-01-15 22:00', content: '快件已揽收' },
    ],
    '2': [
      { time: '2024-01-18 12:30', content: '快件已签收，签收人：材料仓管王主管' },
      { time: '2024-01-18 09:20', content: '快件正在派送中，派送员：李师傅(13900139000)' },
      { time: '2024-01-18 07:15', content: '快件到达【深圳南山营业点】' },
      { time: '2024-01-17 18:30', content: '快件已发车' },
      { time: '2024-01-17 15:00', content: '快件已揽收' },
    ],
  }
  return tracesMap[selectedLogisticsId.value || '1'] || tracesMap['1']
})

function handleLogisticsChange() {
  const selected = allLogisticsList.value.find(l => l.id === selectedLogisticsId.value)
  if (selected) {
    currentLogistics.value = selected
  }
}

const shipmentDetailVisible = ref(false)
const currentShipment = ref<any>({})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    to_confirm: 'gold',
    pending: 'orange',
    paid: 'blue',
    confirmed: 'green',
    shipped: 'cyan',
    completed: 'green',
    cancelled: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    to_confirm: '待确认',
    pending: '待接单',
    paid: '已支付',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function getRejectReasonText(reason: string) {
  const texts: Record<string, string> = {
    stock: '库存不足',
    stop_production: '停产',
    price: '价格变动',
    other: '其他原因',
  }
  return texts[reason] || reason
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

function getShipStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    partial: 'blue',
    shipped: 'green',
  }
  return colors[status] || 'gray'
}

function getShipStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待发货',
    partial: '部分发货',
    shipped: '已发货',
  }
  return texts[status] || status
}

function getShipmentStatusColor(status: string) {
  const colors: Record<string, string> = {
    shipped: 'blue',
    in_transit: 'cyan',
    delivered: 'green',
  }
  return colors[status] || 'gray'
}

function getShipmentStatusText(status: string) {
  const texts: Record<string, string> = {
    shipped: '已发货',
    in_transit: '运输中',
    delivered: '已签收',
  }
  return texts[status] || status
}

const invoiceModalVisible = ref(false)
const invoiceForm = ref<any>({
  issueType: 'upload',
  invoiceType: 'special',
  invoiceNo: '',
  invoiceCode: '',
  invoiceDate: '',
  invoiceAmount: 0,
  taxRate: '13%',
  file: null,
  remark: '',
})

function handleOpenInvoice() {
  invoiceForm.value = {
    issueType: 'upload',
    invoiceType: 'special',
    invoiceNo: '',
    invoiceCode: '',
    invoiceDate: '',
    invoiceAmount: order.value.totalAmount,
    taxRate: '13%',
    file: null,
    remark: '',
  }
  invoiceModalVisible.value = true
}

function handleFileChange(fileItem: any) {
  if (fileItem.file) {
    invoiceForm.value.file = fileItem.file
    Message.success('文件上传成功')
  }
}

async function handleInvoiceSubmit() {
  if (!invoiceForm.value.invoiceType) {
    Message.warning('请选择发票类型')
    return
  }
  if (!invoiceForm.value.invoiceNo) {
    Message.warning('请输入发票号码')
    return
  }
  if (!invoiceForm.value.invoiceDate) {
    Message.warning('请选择开票日期')
    return
  }
  if (!invoiceForm.value.invoiceAmount) {
    Message.warning('请输入价税合计')
    return
  }
  if (!invoiceForm.value.taxRate) {
    Message.warning('请选择税率')
    return
  }
  if (invoiceForm.value.issueType === 'upload' && !invoiceForm.value.file) {
    Message.warning('请上传发票附件')
    return
  }

  try {
    if (invoiceForm.value.issueType === 'online') {
      Message.loading('正在调用开票接口...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      Message.clear()
    }

    const invoiceTypeMap: Record<string, string> = {
      special: '增值税专用发票',
      normal: '增值税普通发票',
      electronic: '电子普通发票',
    }
    const issueTypeMap: Record<string, string> = {
      upload: '上传发票',
      online: '在线开票',
    }

    order.value.invoice = {
      status: 'issued',
      invoiceType: invoiceForm.value.invoiceType,
      invoiceTypeText: invoiceTypeMap[invoiceForm.value.invoiceType],
      issueType: invoiceForm.value.issueType,
      issueTypeText: issueTypeMap[invoiceForm.value.issueType],
      invoiceNo: invoiceForm.value.invoiceNo,
      invoiceCode: invoiceForm.value.invoiceCode,
      invoiceDate: invoiceForm.value.invoiceDate,
      invoiceAmount: invoiceForm.value.invoiceAmount,
      taxRate: invoiceForm.value.taxRate,
      remark: invoiceForm.value.remark,
      fileUrl: '#',
    }

    order.value.invoiceStatus = 'issued'

    invoiceModalVisible.value = false
    Message.success(
      invoiceForm.value.issueType === 'online' 
        ? '电子发票开具成功，PDF已自动生成' 
        : '发票信息保存成功'
    )
  } catch (error) {
    Message.clear()
    Message.error('操作失败，请重试')
  }
}

function handleDownloadInvoice() {
  Message.success('正在下载发票文件...')
}

function handleBack() {
  router.back()
}

function handleShip() {
  shipForm.value.items = order.value.items.map(item => ({
    ...item,
    pendingQuantity: item.quantity - (item.shippedQuantity || 0),
    shipQuantity: 0,
  }))
  shipForm.value.logisticsCompany = ''
  shipForm.value.logisticsNo = ''
  shipForm.value.additionalLogistics = []
  shipForm.value.remark = ''
  shipModalVisible.value = true
}

function handleAddLogistics() {
  shipForm.value.additionalLogistics.push({
    company: '',
    no: '',
  })
}

function handleRemoveLogistics(index: number) {
  shipForm.value.additionalLogistics.splice(index, 1)
}

async function handleShipConfirm() {
  const hasItems = shipForm.value.items.some(item => item.shipQuantity > 0)
  if (!hasItems) {
    Message.warning('请至少选择一个商品发货')
    return
  }

  if (!shipForm.value.logisticsCompany) {
    Message.warning('请选择物流公司')
    return
  }

  if (!shipForm.value.logisticsNo) {
    Message.warning('请输入物流单号')
    return
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const shipmentNo = `SH${Date.now()}`
    const shippedItems = shipForm.value.items
      .filter(item => item.shipQuantity > 0)
      .map(item => ({
        productName: item.productName,
        spec: item.spec,
        quantity: item.shipQuantity,
      }))

    order.value.items.forEach(item => {
      const shipItem = shipForm.value.items.find(s => s.id === item.id)
      if (shipItem) {
        item.shippedQuantity = (item.shippedQuantity || 0) + shipItem.shipQuantity
      }
    })

    const allShipped = order.value.items.every(
      item => item.shippedQuantity >= item.quantity
    )

    if (allShipped) {
      order.value.shipStatus = 'shipped'
      order.value.status = 'shipped'
    } else {
      order.value.shipStatus = 'partial'
    }

    normalShipments.value.unshift({
      id: Date.now().toString(),
      shipmentNo,
      shipTime: new Date().toLocaleString(),
      logisticsCompany: shipForm.value.logisticsCompany,
      logisticsNo: shipForm.value.logisticsNo,
      status: 'shipped',
      operator: '当前用户',
      remark: shipForm.value.remark,
      items: shippedItems,
    })

    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: `发货成功，发货单号：${shipmentNo}，物流：${shipForm.value.logisticsCompany} ${shipForm.value.logisticsNo}`,
    })

    shippedItems.forEach(item => {
      console.log('[库存自动记账] 正常发货扣减库存', {
        recordNo: `INV${Date.now()}`,
        skuName: item.productName,
        spec: item.spec,
        changeType: 'normal_ship',
        changeQty: -item.quantity,
        orderNo: order.value.orderNo,
        bizType: '订单发货',
        operator: '当前用户',
        changeTime: new Date().toLocaleString(),
      })
    })

    shipModalVisible.value = false
    Message.success('发货成功，库存已自动扣减')
  } catch (error) {
    Message.error('发货失败，请重试')
  }
}

function cancelShip() {
  shipModalVisible.value = false
}

function handleViewLogistics() {
  if (allShipmentRecords.value.length > 0) {
    handleTrackLogistics(allShipmentRecords.value[0])
  }
}

function handleTrackLogistics(record: any) {
  selectedLogisticsId.value = record.id
  currentLogistics.value = {
    id: record.id,
    shipmentNo: record.shipmentNo,
    shipTime: record.shipTime,
    company: record.logisticsCompany,
    no: record.logisticsNo,
  }
  logisticsModalVisible.value = true
}

function handleViewShipment(record: any) {
  currentShipment.value = record
  shipmentDetailVisible.value = true
}
</script>

<style scoped lang="less">
.order-detail {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
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

    &.paid {
      color: #00b42a;
    }

    &.unpaid {
      color: #f53f3f;
    }
  }
}

.voucher-preview {
  text-align: center;
  padding: 16px;
}
</style>
