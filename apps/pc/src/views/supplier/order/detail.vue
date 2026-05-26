<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <a-button type="text" @click="handleBack">
            <template #icon><icon-left /></template>
          </a-button>
          <span>订单详情</span>
        </a-space>
      </template>
      <template #extra>
        <a-space>
          <a-button
            v-if="order.status === 'pending'"
            type="primary"
            status="success"
            @click="handleConfirm"
          >
            <template #icon><icon-check-circle /></template>
            订单确认
          </a-button>
          <a-button
            v-if="hasPendingPaymentRecords"
            type="primary"
            status="warning"
            @click="handleAuditPayment"
          >
            <template #icon><icon-safe /></template>
            审核支付
          </a-button>
          <a-button
            v-if="order.status === 'confirmed'"
            type="primary"
            @click="handleExportPending"
          >
            <template #icon><icon-download /></template>
            导出待发货单
          </a-button>
          <a-button
            v-if="order.status === 'confirmed' || order.shipStatus === 'partial'"
            type="primary"
            @click="handleShip"
          >
            <template #icon><icon-send /></template>
            {{ order.shipStatus === 'partial' ? '继续发货' : '发货' }}
          </a-button>
          <a-button type="primary" status="warning" @click="handleReissue">
            <template #icon><icon-refresh /></template>
            补发商品
          </a-button>
        </a-space>
      </template>

      <a-skeleton v-if="pageLoading" :animation="true">
        <a-skeleton-line :rows="1" style="height: 80px; margin-bottom: 16px" />
        <a-skeleton-line :rows="1" style="height: 120px; margin-bottom: 16px" />
        <a-skeleton-line :rows="1" style="height: 300px; margin-bottom: 16px" />
      </a-skeleton>

      <template v-if="!pageLoading">
      <a-descriptions :column="4" bordered size="small">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span class="text-primary">¥{{ order.totalAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPaymentStatusColor(order.paymentStatus)">{{ getPaymentStatusText(order.paymentStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发货状态">
          <a-tag :color="getShipStatusColor(order.shipStatus)">{{ getShipStatusText(order.shipStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createTime }}</a-descriptions-item>
        <a-descriptions-item label="付款时间">{{ order.paymentTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订单备注" :span="3">
          <a-tag v-if="!order.remark" color="gray">无</a-tag>
          <a-tag v-else color="arcoblue3">{{ order.remark }}</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-row :gutter="24">
        <a-col :span="24">
          <a-card :bordered="true" size="small">
            <template #title>
              <icon-user /> 买方信息（工程仓）
            </template>
            <a-descriptions :column="2" size="small">
              <a-descriptions-item label="采购方名称">{{ order.warehouseName }}</a-descriptions-item>
              <a-descriptions-item label="联系人">{{ order.buyerContact || '-' }}</a-descriptions-item>
              <a-descriptions-item label="联系电话">{{ order.buyerPhone || '-' }}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{ order.buyerAddress || order.warehouseName || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="products" title="商品明细">
          <a-table :data="order.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="200" />
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="采购数量" data-index="quantity" :width="80" align="center" />
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price?.toLocaleString() }}
                </template>
              </a-table-column>
              <a-table-column title="小计" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-primary">¥{{ (record.quantity * record.price)?.toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="接单状态" :width="100" align="center">
                <template #cell="{ record }">
                  <a-tag v-if="record.confirmStatus === 'reject'" color="red">无法供货</a-tag>
                  <a-tag v-else color="green">确认供货</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="接单数量" :width="90" align="center">
                <template #cell="{ record }">
                  <span style="color: #00b42a;">{{ record.confirmedQuantity || record.quantity }}</span>
                </template>
              </a-table-column>
              <a-table-column title="已发货数量" :width="100" align="center">
                <template #cell="{ record }">
                  <span :class="record.shippedQuantity === (record.confirmedQuantity || record.quantity) ? 'text-success' : 'text-warning'">
                    {{ record.shippedQuantity || 0 }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="备注" data-index="remark" :width="150" ellipsis>
                <template #cell="{ record }">
                  {{ record.remark || '-' }}
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">商品金额</span>
              <span class="summary-value">¥{{ formatAmount(order.productAmount || order.totalAmount) }}</span>
            </div>
            <div class="summary-row" v-if="order.discountAmount > 0">
              <span class="summary-label">优惠金额</span>
              <span class="summary-value text-danger">-¥{{ formatAmount(order.discountAmount) }}</span>
            </div>
            <div class="summary-row" v-if="order.taxAmount > 0">
              <span class="summary-label">税费</span>
              <span class="summary-value">¥{{ formatAmount(order.taxAmount) }}</span>
            </div>
            <a-divider style="margin: 12px 0" />
            <div class="summary-row total">
              <span class="summary-label">订单总额</span>
              <span class="summary-value total-amount">¥{{ formatAmount(order.totalAmount) }}</span>
            </div>
            <div class="summary-row" v-if="paidAmount > 0">
              <span class="summary-label">已支付</span>
              <span class="summary-value text-success">¥{{ formatAmount(paidAmount) }}</span>
            </div>
            <div class="summary-row" v-if="unpaidAmount > 0">
              <span class="summary-label">待支付</span>
              <span class="summary-value text-warning">¥{{ formatAmount(unpaidAmount) }}</span>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="shipments" title="发货记录">
          <template #extra>
            <a-space>
              <a-button type="primary" status="warning" size="small" @click="handleReissue">
                <template #icon><icon-refresh /></template>
                补发商品
              </a-button>
              <a-button v-if="order.shipStatus === 'partial'" type="primary" size="small" @click="handleShip">
                继续发货
              </a-button>
            </a-space>
          </template>

          <a-table :data="allShipmentRecords" :pagination="false">
            <template #columns>
              <a-table-column title="发货单号" data-index="shipmentNo" :width="180" />
              <a-table-column title="发货时间" data-index="shipTime" :width="160" />
              <a-table-column title="发货数量" :width="100" align="right">
                <template #cell="{ record }">
                  {{ record.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) }}
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
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-link @click="handleViewShipment(record)">详情</a-link>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="payments" title="付款记录">
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
        </a-tab-pane>

        <a-tab-pane key="invoice" title="发票信息">
          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-file /> 发票信息
            </template>
            <template #extra>
              <a-space>
                <a-button v-if="order.status === 'completed' && (!order.invoice || order.invoice.status !== 'issued')" type="primary" size="small" @click="handleOpenInvoice">
                  开具发票
                </a-button>
                <a-button v-if="order.invoice && order.invoice.status === 'issued'" type="outline" size="small" @click="handleDownloadInvoice">
                  下载发票
                </a-button>
                <a-button type="text" size="small" @click="handleViewInvoiceList">
                  <template #icon><icon-list /></template>
                  发票列表
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
        </a-tab-pane>

        <a-tab-pane key="aftersale" title="售后记录">
          <a-card :bordered="true" size="small">
            <template #title>
              <icon-history /> 售后记录
            </template>
            <a-table :data="afterSaleRecords" :pagination="false">
              <template #columns>
                <a-table-column title="售后单号" data-index="afterSaleNo" :width="200">
                  <template #cell="{ record }">
                    <a-link @click="handleViewAfterSaleDetail(record)">{{ record.afterSaleNo }}</a-link>
                  </template>
                </a-table-column>
                <a-table-column title="关联订单" :width="200">
                  <template #cell="{ record }">
                    <span v-if="record.refOrderNos && record.refOrderNos.length > 0">
                      <a-link v-for="(orderNo, idx) in record.refOrderNos" :key="idx" @click="handleViewRefOrder(orderNo)" style="margin-right: 8px">{{ orderNo }}</a-link>
                    </span>
                    <span v-else>-</span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
            <a-empty v-if="afterSaleRecords.length === 0" description="暂无售后记录" />
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="logs" title="操作记录">
          <a-timeline>
            <a-timeline-item v-for="(log, index) in order.logs" :key="index" :label="log.time">
              {{ log.content }}
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
      </template>
    </a-card>

    <a-modal
      v-model:visible="reissueModalVisible"
      title="补发商品"
      :width="1100"
      :footer="false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        补发用于处理运输破损、数量损耗等场景，补发记录将关联至原订单
      </a-alert>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ order.deliveryDate || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>收货信息</a-divider>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="收货人">{{ order.receiverName || '张工' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.receiverPhone || '13800138000' }}</a-descriptions-item>
        <a-descriptions-item label="收货仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="3">{{ order.buyerAddress || order.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>补发商品</a-divider>

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
              <a-table-column title="商品名称" :width="180">
                <template #cell="{ record }">
                  <div>{{ record.productName }}</div>
                  <div style="color: #86909c; font-size: 12px;">{{ record.spec }}</div>
                </template>
              </a-table-column>
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="已发货数量" :width="100" align="right">
                <template #cell="{ record }">{{ record.shippedQuantity || 0 }}</template>
              </a-table-column>
              <a-table-column title="补发数量" :width="140" align="center">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.reissueQuantity"
                    :min="0"
                    :max="record.quantity"
                    :precision="0"
                    size="small"
                    style="width: 100px"
                    placeholder="补发数量"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>

        <a-divider>物流信息</a-divider>

        <a-form-item label="是否有物流">
          <a-radio-group v-model="reissueForm.hasLogistics">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否（自提/无需物流）</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="reissueForm.hasLogistics">
          <a-form-item
            v-for="(logistics, index) in reissueForm.logisticsList"
            :key="index"
            :label="`物流 ${Number(index) + 1}`"
          >
            <a-space style="width: 100%">
              <a-select v-model="logistics.company" placeholder="物流公司" style="width: 150px">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="中通快递">中通快递</a-option>
                <a-option value="圆通速递">圆通速递</a-option>
                <a-option value="申通快递">申通快递</a-option>
                <a-option value="韵达快递">韵达快递</a-option>
                <a-option value="EMS">EMS</a-option>
              </a-select>
              <a-input v-model="logistics.no" placeholder="物流单号" style="width: 200px" />
              <a-button v-if="reissueForm.logisticsList.length > 1" status="danger" @click="reissueForm.logisticsList.splice(index, 1)">
                删除
              </a-button>
            </a-space>
          </a-form-item>

          <a-form-item>
            <a-button type="outline" @click="reissueForm.logisticsList.push({ company: '', no: '' })">
              <template #icon><icon-plus /></template>
              添加物流
            </a-button>
          </a-form-item>
        </template>

        <a-form-item label="补发备注">
          <a-textarea v-model="reissueForm.remark" placeholder="详细说明补发原因及处理方案" :max-length="200" :rows="2" />
        </a-form-item>
      </a-form>

      <div style="text-align: right; margin-top: 16px">
        <a-space>
          <a-button @click="reissueModalVisible = false">取消</a-button>
          <a-button type="primary" status="warning" @click="handleReissueSubmit">提交补发</a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="shipModalVisible"
      title="发货"
      :width="1100"
      :footer="false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        请填写发货信息，支持多次发货。已发货商品无需重复发货。
      </a-alert>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ order.deliveryDate || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>收货信息</a-divider>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="收货人">{{ order.receiverName || '张工' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.receiverPhone || '13800138000' }}</a-descriptions-item>
        <a-descriptions-item label="收货仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="3">{{ order.buyerAddress || order.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>发货商品</a-divider>

      <a-table :data="shipForm.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div style="color: #86909c; font-size: 12px;">{{ record.spec }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="购买数量" :width="80" align="right">
            <template #cell="{ record }">{{ record.quantity }}</template>
          </a-table-column>
          <a-table-column title="待发货数量" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #ff7d00; font-weight: 600;">{{ record.pendingShipQuantity }}</span>
            </template>
          </a-table-column>
          <a-table-column title="本次发货数量" :width="140" align="center">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.shipQuantity"
                :min="0"
                :max="record.pendingShipQuantity"
                :precision="0"
                size="small"
                style="width: 100px"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>物流信息</a-divider>

      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="是否有物流">
          <a-radio-group v-model="shipForm.hasLogistics">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否（自配送）</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="shipForm.hasLogistics">
          <a-form-item
            v-for="(logistics, index) in shipForm.logisticsList"
            :key="index"
            :label="`物流 ${index + 1}`"
          >
            <a-space style="width: 100%">
              <a-select v-model="logistics.company" placeholder="物流公司" style="width: 150px">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="中通快递">中通快递</a-option>
                <a-option value="圆通速递">圆通速递</a-option>
                <a-option value="申通快递">申通快递</a-option>
                <a-option value="韵达快递">韵达快递</a-option>
                <a-option value="EMS">EMS</a-option>
              </a-select>
              <a-input v-model="logistics.no" placeholder="物流单号" style="width: 200px" />
              <a-button v-if="shipForm.logisticsList.length > 1" status="danger" @click="removeLogistics(index)">
                删除
              </a-button>
            </a-space>
          </a-form-item>

          <a-form-item>
            <a-button type="outline" @click="addLogistics">
              <template #icon><icon-plus /></template>
              添加物流
            </a-button>
          </a-form-item>
        </template>

        <a-form-item label="发货备注">
          <a-textarea v-model="shipForm.remark" placeholder="发货备注（选填）" :max-length="200" :rows="2" />
        </a-form-item>
      </a-form>

      <div style="text-align: right; margin-top: 16px">
        <a-space>
          <a-button @click="shipModalVisible = false">取消</a-button>
          <a-button @click="handleShipPartial">本次发货</a-button>
          <a-button type="primary" status="success" @click="handleShipAll">已全部发货</a-button>
        </a-space>
      </div>
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
      v-model:visible="shipmentDetailVisible"
      title="发货详情"
      :width="1100"
      :footer="false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          发货单号：{{ currentShipment.shipmentNo }} | 发货时间：{{ currentShipment.shipTime }}
        </template>
      </a-alert>

      <a-divider>订单信息</a-divider>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ order.deliveryDate || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>收货信息</a-divider>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="收货人">{{ order.receiverName || '张工' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ order.receiverPhone || '13800138000' }}</a-descriptions-item>
        <a-descriptions-item label="收货仓库">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="3">{{ order.buyerAddress || order.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>发货商品</a-divider>

      <a-table :data="currentShipment.items" :pagination="false" style="margin-bottom: 16px">
        <template #columns>
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div style="color: #86909c; font-size: 12px;">{{ record.spec }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" :width="60" align="center">
            <template #cell="{ record }">{{ record.unit || '件' }}</template>
          </a-table-column>
          <a-table-column title="购买数量" :width="90" align="right">
            <template #cell="{ record }">{{ record.purchaseQuantity }}</template>
          </a-table-column>
          <a-table-column title="待发货数量" :width="100" align="right">
            <template #cell="{ record }">
              <span style="color: #ff7d00; font-weight: 600;">{{ record.pendingShipQuantity }}</span>
            </template>
          </a-table-column>
          <a-table-column title="本次发货数量" :width="110" align="right">
            <template #cell="{ record }">{{ record.quantity }}</template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>物流信息</a-divider>

      <a-descriptions :column="2" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="物流公司">
          {{ currentShipment.logisticsCompany || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="物流单号">
          <span>{{ currentShipment.logisticsNo || '-' }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-form>
        <a-form-item label="发货备注">
          <span>{{ currentShipment.remark || '无' }}</span>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="confirmVisible"
      title="订单确认"
      :width="1100"
      :footer="false"
    >
      <div style="margin-bottom: 16px; color: #333; font-size: 14px;">
        请确认订单商品信息，可对每个商品填写可供应数量和备注说明。
      </div>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ order.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="3">{{ order.buyerAddress || order.warehouseName }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>商品清单</a-divider>

      <a-table :data="confirmItems" :pagination="false">
        <template #columns>
          <a-table-column title="是否接单" :width="100" align="center">
            <template #cell="{ record }">
              <a-radio-group v-model="record.accepted" size="small" @change="(val: boolean) => handleAcceptChange(record, val)">
                <a-radio :value="true" style="font-size: 12px;">接单</a-radio>
                <a-radio :value="false" style="font-size: 12px;">不接单</a-radio>
              </a-radio-group>
            </template>
          </a-table-column>
          <a-table-column title="商品名称" :width="160">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div style="color: #86909c; font-size: 12px;">{{ record.spec }}</div>
            </template>
          </a-table-column>
          <a-table-column title="采购数量" :width="80" align="center">
            <template #cell="{ record }">{{ record.quantity }} {{ record.unit || '件' }}</template>
          </a-table-column>
          <a-table-column title="可供应数量" :width="110" align="center">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.supplyQuantity"
                :min="0"
                :max="record.quantity"
                :precision="0"
                size="small"
                style="width: 90px"
                :disabled="!record.accepted"
              />
            </template>
          </a-table-column>
          <a-table-column title="供应不足原因" :width="180">
            <template #cell="{ record }">
              <a-input
                v-if="record.accepted && record.supplyQuantity < record.quantity"
                v-model="record.shortageReason"
                size="small"
                placeholder="请填写供应不足原因"
                :max-length="50"
              />
              <span v-else-if="record.accepted && record.supplyQuantity >= record.quantity" style="color: #00b42a;">充足</span>
              <span v-else style="color: #86909c;">-</span>
            </template>
          </a-table-column>
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">¥{{ record.unitPrice?.toLocaleString() || '-' }}</template>
          </a-table-column>
          <a-table-column title="金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ (record.accepted ? (record.supplyQuantity || 0) * (record.unitPrice || 0) : 0).toLocaleString() || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="160">
            <template #cell="{ record }">
              <a-input
                v-model="record.remark"
                size="small"
                placeholder="商品备注（选填）"
                :max-length="100"
                :disabled="!record.accepted"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-form :model="confirmForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="订单备注">
          <a-textarea v-model="confirmForm.remark" placeholder="订单备注说明（选填）" :max-length="200" />
        </a-form-item>
      </a-form>

      <div style="text-align: right; margin-top: 16px; border-top: 1px solid #e5e6eb; padding-top: 16px;">
        <a-space>
          <a-button @click="confirmVisible = false">取消</a-button>
          <a-button status="danger" @click="handleRejectOrder">驳回订单</a-button>
          <a-button type="primary" @click="handleConfirmSubmit">确认接单</a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="auditPaymentVisible"
      title="审核支付凭证"
      :width="800"
      :footer="false"
    >
      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ order.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span style="color: #165dff; font-weight: 600;">¥{{ order.totalAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="已付金额">
          <span style="color: #00b42a; font-weight: 600;">¥{{ paidAmount.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="待付金额">
          <span style="color: #ff7d00; font-weight: 600;">¥{{ unpaidAmount.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="待审核笔数">
          <a-tag color="orange">{{ paymentRecords.filter((r: any) => r.status === 'pending').length }} 笔</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>转账凭证记录</a-divider>

      <a-table
        :data="paymentRecords"
        :pagination="false"
        style="margin-bottom: 16px"
      >
        <template #columns>
          <a-table-column title="支付流水号" data-index="paymentNo" :width="160" />
          <a-table-column title="转账金额" :width="120" align="right">
            <template #cell="{ record }">
              <span style="color: #f53f3f; font-weight: 600;">¥{{ record.amount.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'approved' ? 'green' : record.status === 'pending' ? 'orange' : 'red'">
                {{ record.status === 'approved' ? '已通过' : record.status === 'pending' ? '待审核' : '已驳回' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="驳回原因" :width="150">
            <template #cell="{ record }">
              <template v-if="record.status === 'rejected'">
                <span style="color: #f53f3f;">{{ record.rejectReason || '-' }}</span>
              </template>
              <span v-else style="color: #86909c;">-</span>
            </template>
          </a-table-column>
          <a-table-column title="凭证图片" :width="120">
            <template #cell="{ record }">
              <template v-if="record.voucherImage">
                <a-image
                  :src="record.voucherImage"
                  :width="80"
                  :height="60"
                  fit="cover"
                  style="cursor: pointer; border-radius: 4px"
                  :preview="true"
                />
              </template>
              <span v-else style="color: #86909c;">无</span>
            </template>
          </a-table-column>
          <a-table-column title="转账时间" data-index="payTime" :width="140" />
        </template>
      </a-table>

      <a-divider>支付确认</a-divider>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #title>当前已确认金额：</template>
        <span style="font-size: 20px; font-weight: 600; color: #165dff;">¥{{ confirmedTotalAmount.toLocaleString() }}</span>
        <span style="margin-left: 16px; color: #86909c;">（共 {{ passedCount }} 笔通过审核）</span>
      </a-alert>

      <a-form :model="auditPaymentForm" layout="vertical">
        <a-form-item label="收款确认" required>
          <a-radio-group v-model="auditPaymentForm.result">
            <a-radio value="partial">部分支付</a-radio>
            <a-radio value="full">全部支付</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="auditPaymentForm.remark" placeholder="审核备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>

      <div style="text-align: right; margin-top: 16px">
        <a-space>
          <a-button @click="auditPaymentVisible = false">取消</a-button>
          <a-button type="primary" @click="handleAuditPaymentSubmit">确认审核</a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="exportPendingVisible"
      title="导出待发货单"
      :width="1400"
      :footer="false"
    >
      <a-table :data="exportPendingData" :pagination="{ pageSize: 10 }" row-key="id">
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="140" />
          <a-table-column title="采购方" data-index="warehouseName" :width="140" />
          <a-table-column title="收货人" data-index="receiverName" :width="100" />
          <a-table-column title="手机号" data-index="receiverPhone" :width="120" />
          <a-table-column title="收货地址" :width="200">
            <template #cell="{ record }">
              <span style="color: #86909c;">{{ record.address }}</span>
            </template>
          </a-table-column>
          <a-table-column title="商品名称" data-index="productName" :width="150" />
          <a-table-column title="规格" data-index="specification" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="订购数量" :width="100" align="center">
            <template #cell="{ record }">{{ record.orderQuantity }}</template>
          </a-table-column>
          <a-table-column title="待发货数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.pendingQuantity }}
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb; display: flex; justify-content: space-between; align-items: center;">
        <span>合计：共 <strong>{{ exportPendingData.length }}</strong> 条记录</span>
        <a-space>
          <a-button @click="exportPendingVisible = false">关闭</a-button>
          <a-button type="primary" @click="handleExportPendingConfirm">
            <template #icon><icon-download /></template>
            下载Excel
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const pageLoading = ref(true)

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      pageLoading.value = false
    }, 50)
  })
})

const activeTab = ref('products')
const orderId = route.params.id || '1'

const order = ref<any>({
  id: orderId,
  orderNo: 'PO202401150001',
  warehouseName: '深圳湾科技园项目仓',
  totalAmount: 205000,
  productAmount: 203000,
  freight: 2000,
  discountAmount: 0,
  taxAmount: 0,
  status: 'confirmed',
  paymentStatus: 'paid',
  shipStatus: 'shipped',
  createTime: '2024-01-15 10:30:00',
  paymentTime: '2024-01-15 16:30:00',
  afterSaleStatus: 'processing',
  afterSaleType: '货损售后',
  buyerContact: '张三',
  buyerPhone: '13800138001',
  buyerAddress: '广东省深圳市南山区深圳湾科技园',
  supplierName: '默认供应商',
  supplierContact: '李四',
  supplierPhone: '13900139001',
  supplierAddress: '江苏省南京市建邺区建材市场A区',
  items: [
    {
      id: '1',
      productName: 'C30混凝土',
      spec: 'C30',
      unit: 'm³',
      quantity: 100,
      confirmedQuantity: 100,
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
      confirmedQuantity: 40,
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
      confirmedQuantity: 0,
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

const afterSaleRecords = ref<any[]>([
  {
    afterSaleNo: 'AS202401200001',
    type: '货损售后',
    reason: '部分混凝土在运输途中出现破损',
    status: 'completed',
    refOrderNos: ['SO202401200001'],
    applyTime: '2024-01-20 09:30:00',
    handleTime: '2024-01-22 14:00:00',
  },
])

const paymentRecords = ref([
  {
    paymentNo: 'PAY202401150001',
    amount: 100000,
    status: 'approved',
    voucher: true,
    voucherImage: 'https://picsum.photos/seed/voucher1/400/300',
    payTime: '2024-01-15 16:30:00',
    remark: '首付款50%',
  },
  {
    paymentNo: 'PAY202401160002',
    amount: 50000,
    status: 'approved',
    voucher: true,
    voucherImage: 'https://picsum.photos/seed/voucher2/400/300',
    payTime: '2024-01-16 10:00:00',
    remark: '进度款',
  },
  {
    paymentNo: 'PAY202401200003',
    amount: 55000,
    status: 'pending',
    voucher: true,
    voucherImage: 'https://picsum.photos/seed/voucher3/400/300',
    payTime: '2024-01-20 14:00:00',
    remark: '尾款-待审核',
  },
])

const paidAmount = computed(() => {
  return paymentRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const unpaidAmount = computed(() => {
  return (order.value.totalAmount || 0) - paidAmount.value
})

const hasPendingPaymentRecords = computed(() => {
  return paymentRecords.value.some((r: any) => r.status === 'pending')
})

const confirmedTotalAmount = computed(() => {
  return paymentRecords.value
    .filter((r: any) => r.status === 'pending' && r.auditPass)
    .reduce((sum: number, r: any) => sum + r.amount, 0)
})

const passedCount = computed(() => {
  return paymentRecords.value.filter((r: any) => r.status === 'pending' && r.auditPass).length
})

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
  return [...normalShipments.value]
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
  reason: 'damage',
  hasLogistics: true,
  logisticsList: [{ company: '', no: '' }],
  remark: '',
  items: [] as any[],
})

function handleReissue() {
  reissueForm.value = {
    reason: 'damage',
    hasLogistics: true,
    logisticsList: [{ company: '', no: '' }],
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
  const hasInvalidLogistics = reissueForm.value.hasLogistics && reissueForm.value.logisticsList.some((l: any) => !l.company || !l.no)
  if (hasInvalidLogistics) {
    Message.warning('请填写完整的物流信息')
    return
  }

  const reissueItems = reissueForm.value.items
    .filter((item: any) => item.reissueQuantity > 0)
    .map((item: any) => ({
      productName: item.productName,
      spec: item.spec,
      quantity: item.reissueQuantity,
    }))

  const firstLogistics = reissueForm.value.logisticsList[0] || { company: '', no: '' }
  const newReissue = {
    id: `R${Date.now()}`,
    shipmentNo: `BF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(reissueShipments.value.length + 1).padStart(4, '0')}`,
    shipTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    logisticsCompany: firstLogistics.company || '-',
    logisticsNo: firstLogistics.no || '-',
    status: 'shipping',
    operator: '当前用户',
    reissueReason: reissueForm.value.reason,
    type: 'reissue',
    remark: reissueForm.value.remark,
    items: reissueItems,
  }

  reissueShipments.value.push(newReissue)

  const newOrderNo = `SO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(afterSaleRecords.value.length + 1).padStart(4, '0')}`
  afterSaleRecords.value.push({
    afterSaleNo: `AS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(afterSaleRecords.value.length + 1).padStart(4, '0')}`,
    type: '补发售后',
    reason: reissueForm.value.reason === 'damage' ? '运输破损补发' : reissueForm.value.reason === 'loss' ? '数量损耗补发' : '质量问题补发',
    status: 'completed',
    refOrderNos: [order.value.orderNo, newOrderNo],
    applyTime: new Date().toLocaleString(),
    handleTime: new Date().toLocaleString(),
  })

  reissueModalVisible.value = false
  Message.success('补发申请已提交，商品已发出，生成关联订单：' + newOrderNo)
}

const shipModalVisible = ref(false)
const shipForm = ref({
  items: [] as any[],
  hasLogistics: true,
  logisticsList: [{ company: '', no: '' }] as { company: string; no: string }[],
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
    approved: 'green',
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

function getAfterSaleStatusColor(status: string) {
  const colors: Record<string, string> = {
    none: 'gray',
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getAfterSaleStatusText(status: string) {
  const texts: Record<string, string> = {
    none: '无售后',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝',
  }
  return texts[status] || status
}

function formatAmount(amount: number | undefined) {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function handleViewInvoiceList() {
  router.push('/supplier/finance/invoice')
}

function handleViewAfterSaleDetail(record: any) {
  router.push(`/supplier/order/after-sales/detail/${record.afterSaleNo}`)
}

function handleViewRefOrder(orderNo: string) {
  window.open(`/supplier/order/detail/${orderNo}`, '_blank')
}

function handleViewAfterSales() {
  router.push('/supplier/order/after-sales')
}

const confirmVisible = ref(false)
const confirmForm = reactive({
  estimatedShipDate: '',
  remark: ''
})
const confirmItems = ref<any[]>([])

function handleConfirm() {
  confirmItems.value = order.value.items.map((item: any) => ({
    id: item.id,
    productName: item.productName,
    spec: item.spec || '',
    unit: item.unit,
    quantity: item.quantity,
    supplyQuantity: item.quantity,
    accepted: true,
    unitPrice: item.price,
    remark: '',
    shortageReason: '',
  }))
  confirmForm.estimatedShipDate = ''
  confirmForm.remark = ''
  confirmVisible.value = true
}

function handleAcceptChange(record: any, val: boolean) {
  if (!val) {
    record.supplyQuantity = 0
  } else if (record.supplyQuantity === 0) {
    record.supplyQuantity = record.quantity
  }
}

function handleConfirmSubmit() {
  const acceptItems = confirmItems.value.filter(i => i.accepted && i.supplyQuantity > 0)
  if (acceptItems.length === 0) {
    Message.warning('请至少选择并设置一个可供应商品')
    return
  }
  order.value.status = 'confirmed'
  order.value.confirmTime = new Date().toLocaleString()
  confirmVisible.value = false
  Message.success('订单确认成功')
}

function handleRejectOrder() {
  order.value.status = 'cancelled'
  confirmVisible.value = false
  Message.warning('订单已驳回')
}

const auditPaymentVisible = ref(false)
const auditPaymentForm = reactive({
  result: 'partial',
  remark: '',
})

function handleAuditPayment() {
  auditPaymentForm.result = 'partial'
  auditPaymentForm.remark = ''
  paymentRecords.value.forEach((r: any) => {
    if (r.status === 'pending') {
      r.auditPass = true
      r.confirmedAmount = r.amount
      r.rejectReason = ''
    }
  })
  auditPaymentVisible.value = true
}

function handleAuditPaymentSubmit() {
  const pendingRecords = paymentRecords.value.filter((r: any) => r.status === 'pending')
  
  if (pendingRecords.length === 0) {
    Message.warning('没有待审核的支付记录')
    return
  }

  if (!auditPaymentForm.result) {
    Message.warning('请选择收款确认方式')
    return
  }

  const passedRecords = pendingRecords.filter((r: any) => r.auditPass)
  const rejectedRecords = pendingRecords.filter((r: any) => !r.auditPass)

  const hasInvalidPass = passedRecords.some((r: any) => !r.confirmedAmount || r.confirmedAmount <= 0)
  if (hasInvalidPass) {
    Message.warning('请填写通过记录的确认金额')
    return
  }

  const hasInvalidReject = rejectedRecords.some((r: any) => !r.rejectReason)
  if (hasInvalidReject) {
    Message.warning('请填写驳回记录的驳回原因')
    return
  }

  passedRecords.forEach((r: any) => {
    r.status = 'approved'
  })

  rejectedRecords.forEach((r: any) => {
    r.status = 'rejected'
  })

  const totalConfirmed = passedRecords.reduce((sum: number, r: any) => sum + r.confirmedAmount, 0)

  // 根据人工选择的支付确认方式设置订单支付状态
  if (auditPaymentForm.result === 'full') {
    order.value.paymentStatus = 'paid'
  } else {
    order.value.paymentStatus = 'partial_paid'
  }

  order.value.logs?.unshift({
    time: new Date().toLocaleString(),
    content: `支付审核完成：通过 ${passedRecords.length} 笔（¥${totalConfirmed.toLocaleString()}），驳回 ${rejectedRecords.length} 笔，${auditPaymentForm.result === 'full' ? '全部支付' : '部分支付'}`,
  })

  auditPaymentVisible.value = false
  Message.success(`审核完成：通过 ${passedRecords.length} 笔，驳回 ${rejectedRecords.length} 笔`)
}

const exportPendingVisible = ref(false)
const exportPendingData = ref<any[]>([])

function handleExportPending() {
  const items = order.value.items || []
  if (items.length === 0) {
    Message.warning('该订单暂无商品数据')
    return
  }
  exportPendingData.value = items.map((item: any, index: number) => ({
    id: index + 1,
    orderNo: order.value.orderNo,
    warehouseName: order.value.warehouseName,
    receiverName: order.value.buyerContact || '张工',
    receiverPhone: order.value.buyerPhone || '13800138000',
    address: order.value.buyerAddress || '',
    productName: item.productName,
    specification: item.spec || '',
    unit: item.unit || '件',
    orderQuantity: item.quantity,
    pendingQuantity: item.quantity - (item.shippedQuantity || 0),
  }))
  exportPendingVisible.value = true
}

function handleExportPendingConfirm() {
  Message.success('待发货单导出成功')
  exportPendingVisible.value = false
}

function handleBack() {
  router.back()
}

function handleShip() {
  shipForm.value.items = order.value.items.map((item: any) => ({
    ...item,
    pendingShipQuantity: item.quantity - (item.shippedQuantity || 0),
    shipQuantity: item.quantity - (item.shippedQuantity || 0),
  }))
  shipForm.value.hasLogistics = true
  shipForm.value.logisticsList = [{ company: '', no: '' }]
  shipForm.value.remark = ''
  shipModalVisible.value = true
}

function addLogistics() {
  shipForm.value.logisticsList.push({
    company: '',
    no: '',
  })
}

function removeLogistics(index: number) {
  shipForm.value.logisticsList.splice(index, 1)
}

async function handleShipPartial() {
  const hasItems = shipForm.value.items.some(item => item.shipQuantity > 0)
  if (!hasItems) {
    Message.warning('请至少选择一个商品发货')
    return
  }

  const hasInvalidLogistics = shipForm.value.hasLogistics && shipForm.value.logisticsList.some(l => !l.company || !l.no)
  if (hasInvalidLogistics) {
    Message.warning('请填写完整的物流信息')
    return
  }

  try {
    Message.loading('正在提交发货...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.clear()

    const shipmentNo = `SH${Date.now()}`
    const shippedItems = shipForm.value.items
      .filter((item: any) => item.shipQuantity > 0)
      .map((item: any) => ({
        productName: item.productName,
        spec: item.spec,
        quantity: item.shipQuantity,
      }))

    order.value.items.forEach((item: any) => {
      const shipItem = shipForm.value.items.find((s: any) => s.id === item.id)
      if (shipItem) {
        item.shippedQuantity = (item.shippedQuantity || 0) + shipItem.shipQuantity
      }
    })

    order.value.shipStatus = 'partial_shipped'
    order.value.status = 'shipped'

    const firstLogistics = shipForm.value.logisticsList[0]
    normalShipments.value.unshift({
      id: Date.now().toString(),
      shipmentNo,
      shipTime: new Date().toLocaleString(),
      logisticsCompany: firstLogistics?.company || '-',
      logisticsNo: firstLogistics?.no || '-',
      status: 'shipped',
      operator: '当前用户',
      remark: shipForm.value.remark,
      items: shippedItems,
    })

    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: `部分发货成功，发货单号：${shipmentNo}`,
    })

    shipModalVisible.value = false
    const totalShipQty = shippedItems.reduce((sum: number, i: any) => sum + i.quantity, 0)
    Message.success(`本次发货成功，共发货 ${totalShipQty} 件`)
  } catch (error) {
    Message.clear()
    Message.error('发货失败，请重试')
  }
}

async function handleShipAll() {
  const hasItems = shipForm.value.items.some(item => item.shipQuantity > 0)
  if (!hasItems) {
    Message.warning('请至少选择一个商品发货')
    return
  }

  const hasInvalidLogistics = shipForm.value.hasLogistics && shipForm.value.logisticsList.some(l => !l.company || !l.no)
  if (hasInvalidLogistics) {
    Message.warning('请填写完整的物流信息')
    return
  }

  const allShipped = shipForm.value.items.every(item => item.shipQuantity >= item.pendingShipQuantity)
  if (!allShipped) {
    Message.warning('已全部发货需将所有商品待发货数量清零，请调整发货数量')
    return
  }

  try {
    Message.loading('正在提交发货...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.clear()

    const shipmentNo = `SH${Date.now()}`
    const shippedItems = shipForm.value.items
      .filter((item: any) => item.shipQuantity > 0)
      .map((item: any) => ({
        productName: item.productName,
        spec: item.spec,
        quantity: item.shipQuantity,
      }))

    order.value.items.forEach((item: any) => {
      const shipItem = shipForm.value.items.find((s: any) => s.id === item.id)
      if (shipItem) {
        item.shippedQuantity = (item.shippedQuantity || 0) + shipItem.shipQuantity
      }
    })

    order.value.shipStatus = 'shipped'
    order.value.status = 'shipped'

    const firstLogistics = shipForm.value.logisticsList[0]
    normalShipments.value.unshift({
      id: Date.now().toString(),
      shipmentNo,
      shipTime: new Date().toLocaleString(),
      logisticsCompany: firstLogistics?.company || '-',
      logisticsNo: firstLogistics?.no || '-',
      status: 'shipped',
      operator: '当前用户',
      remark: shipForm.value.remark,
      items: shippedItems,
    })

    order.value.logs.unshift({
      time: new Date().toLocaleString(),
      content: `全部发货成功，发货单号：${shipmentNo}`,
    })

    shipModalVisible.value = false
    const totalShipQty = shippedItems.reduce((sum: number, i: any) => sum + i.quantity, 0)
    Message.success(`已全部发货成功，共发货 ${totalShipQty} 件`)
  } catch (error) {
    Message.clear()
    Message.error('发货失败，请重试')
  }
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
  const enrichedItems = (record.items || []).map((item: any) => {
    const orderItem = order.value.items.find((oi: any) =>
      oi.productName === item.productName && oi.spec === item.spec
    )
    return {
      ...item,
      unit: item.unit || orderItem?.unit || '件',
      purchaseQuantity: orderItem?.quantity || item.quantity,
      shippedQuantity: orderItem?.shippedQuantity || item.quantity,
      pendingShipQuantity: (orderItem?.quantity || 0) - (orderItem?.shippedQuantity || 0),
    }
  })
  currentShipment.value = {
    ...record,
    items: enrichedItems,
  }
  shipmentDetailVisible.value = true
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.text-primary {
  color: var(--color-primary);
  font-weight: 500;
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}

.text-danger {
  color: var(--color-danger);
}

.pay-summary {
  display: flex;
  gap: 20px;
  align-items: center;

  span {
    font-size: 13px;

    &.paid {
      color: var(--color-success);
    }

    &.unpaid {
      color: var(--color-danger);
    }
  }
}

.order-summary {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    .summary-label {
      color: var(--color-text-2);
    }

    .summary-value {
      font-weight: 500;
    }

    &.total {
      .summary-label {
        font-weight: 600;
        font-size: 16px;
      }

      .total-amount {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-danger);
      }
    }
  }
}

.voucher-preview {
  text-align: center;
  padding: 16px;
}
</style>
