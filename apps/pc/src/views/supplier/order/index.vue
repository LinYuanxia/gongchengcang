<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>订单管理</span>
      </template>

      <div class="table-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <a-space :size="16">
          <a-input-search
            v-model="searchForm.orderNo"
            placeholder="订单编码"
            style="width: 180px"
            @search="handleSearch"
          />
          <a-input-search
            v-model="searchForm.buyerName"
            placeholder="采购方"
            style="width: 180px"
            @search="handleSearch"
          />
          <a-select
            v-model="searchForm.orderType"
            placeholder="订单类型"
            style="width: 150px"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部</a-option>
            <a-option value="purchase">采购订单</a-option>
            <a-option value="after_sales">售后订单</a-option>
          </a-select>
          <a-select
            v-model="searchForm.paymentStatus"
            placeholder="支付状态"
            style="width: 150px"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部</a-option>
            <a-option value="paid">全部支付</a-option>
            <a-option value="unpaid">未支付</a-option>
            <a-option value="partial_paid">部分支付</a-option>
          </a-select>
          <a-select
            v-model="searchForm.shipStatus"
            placeholder="发货状态"
            style="width: 150px"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部</a-option>
            <a-option value="unshipped">未发货</a-option>
            <a-option value="partial_shipped">部分发货</a-option>
            <a-option value="fully_shipped">全部发货</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.createTimeRange" style="width: 260px" allow-clear placeholder="下单时间" />
          <a-range-picker v-model="searchForm.completeTimeRange" style="width: 260px" allow-clear placeholder="完成日期" />
        </a-space>
        <a-space :size="12">
          <a-button @click="handleReset">重置</a-button>
          <a-button type="primary" @click="handleExport">
            <template #icon><icon-download /></template>
            导出订单
          </a-button>
        </a-space>
      </div>

      <a-tabs v-model:active-tab="activeTab" class="order-tabs">
        <a-tab-pane key="all" :title="`全部 (${orderStats.total})`" />
        <a-tab-pane key="pending" :title="`待接单 (${orderStats.pending})`" />
        <a-tab-pane key="confirmed" :title="`待发货 (${orderStats.confirmed})`" />
        <a-tab-pane key="shipped" :title="`待收货 (${orderStats.shipped})`" />
        <a-tab-pane key="completed" :title="`已完成 (${orderStats.completed})`" />
        <a-tab-pane key="rejected" :title="`已驳回/取消 (${orderStats.rejected})`" />
      </a-tabs>

      <a-table
        :data="filteredOrders"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="订单编号" data-index="orderNo" :width="150" />
          <a-table-column title="采购方" :width="150">
            <template #cell="{ record }">
              {{ record.warehouseName }}
            </template>
          </a-table-column>
          <a-table-column title="订单类型" :width="110">
            <template #cell="{ record }">
              <a-tag :color="record.orderType === 'after_sales' ? 'orange' : 'arcoblue'">
                {{ record.orderType === 'after_sales' ? '售后订单' : '采购订单' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收货信息" :width="220">
            <template #cell="{ record }">
              <div>{{ record.receiverName || '张工' }} {{ record.receiverPhone || '13800138000' }}</div>
              <div class="sub-text">{{ record.address || '暂无地址' }}</div>
            </template>
          </a-table-column>
          <a-table-column title="商品数量（SKU）" :width="120" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 种
            </template>
          </a-table-column>
          <a-table-column title="采购量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.totalQuantity || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.totalAmount?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="实付金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ (record.paidAmount || record.totalAmount)?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="110">
            <template #cell="{ record }">
              <a-tag 
                :color="getPaymentStatusColor(record.paymentStatus)" 
                style="cursor: pointer;"
                @click="handleViewPayment(record)"
              >
                {{ getPaymentStatusText(record.paymentStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发货状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getShipStatusColor(record.shipStatus)">
                {{ getShipStatusText(record.shipStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="要求交货日期" :width="120">
            <template #cell="{ record }">
              <span :class="{ 'text-danger': isUrgent(record.deliveryDate) }">
                {{ record.deliveryDate }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" :width="120">
            <template #cell="{ record }">
              <a-space direction="vertical" size="mini">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
                <a-tag 
                  v-if="record.hasAfterSales || record.afterSalesStatus === 'processing'" 
                  color="red" 
                  size="small"
                >
                  🔴 售后中
                </a-tag>
                <a-tag 
                  v-else-if="record.afterSalesStatus === 'resolved' || record.status === 'refunded'" 
                  color="green" 
                  size="small"
                >
                  🟡 已退款
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" :width="160">
            <template #cell="{ record }">
              {{ record.createTime }}
            </template>
          </a-table-column>
          <a-table-column title="完成时间" :width="160">
            <template #cell="{ record }">
              {{ record.completeTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="280" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button
                  v-if="record.status === 'pending'"
                  type="text"
                  size="small"
                  status="success"
                  @click="handleConfirm(record)"
                >
                  订单确认
                </a-button>
                <a-button
                  v-if="hasPendingPaymentRecords(record)"
                  type="text"
                  size="small"
                  status="warning"
                  @click="handleAuditPayment(record)"
                >
                  审核支付
                </a-button>
                <a-button
                  v-if="record.status === 'confirmed'"
                  type="text"
                  size="small"
                  @click="handleExportPending(record)"
                >
                  导出待发货单
                </a-button>
                <a-button
                  v-if="record.status === 'confirmed'"
                  type="text"
                  size="small"
                  status="warning"
                  @click="handleShip(record)"
                >
                  发货
                </a-button>

                <a-button
                  v-if="record.hasAfterSales || record.afterSalesStatus"
                  type="text"
                  size="small"
                  @click="handleViewAfterSales(record)"
                >
                  查看售后
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="detailVisible" 
      title="订单详情" 
      :width="1200"
      :footer="false"
    >
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" title="基本信息">
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
            <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
            <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
            <a-descriptions-item label="订单状态">
              <a-tag :color="getStatusColor(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="支付状态">
              <a-tag :color="getPaymentStatusColor(currentOrder.paymentStatus)">
                {{ getPaymentStatusText(currentOrder.paymentStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="下单时间">{{ currentOrder.createTime }}</a-descriptions-item>
            <a-descriptions-item label="确认时间">{{ currentOrder.confirmTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{ currentOrder.shipTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="收货地址" :span="3">{{ currentOrder.address }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="3">{{ currentOrder.remark || '-' }}</a-descriptions-item>
          </a-descriptions>

          <a-divider>商品清单</a-divider>

          <a-table :data="currentOrder.skuList || []" :pagination="false">
            <template #columns>
              <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" :width="200">
                <template #cell="{ record }">
                  <div>{{ record.productName }}</div>
                  <div class="sub-text">{{ record.specValues }}</div>
                </template>
              </a-table-column>
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="采购数量" data-index="quantity" :width="100" align="center" />
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price }}
                </template>
              </a-table-column>
              <a-table-column title="金额" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ (record.quantity * record.price).toFixed(2) }}
                </template>
              </a-table-column>
              <a-table-column title="备注" data-index="remark" :width="150" />
            </template>
          </a-table>

          <div v-if="currentOrder.status === 'pending'" style="margin-top: 24px; text-align: right">
            <a-space>
              <a-button @click="handleReject">拒绝订单</a-button>
              <a-button type="primary" @click="handleConfirmFromDetail">确认接单</a-button>
            </a-space>
          </div>
        </a-tab-pane>

        <a-tab-pane key="2" title="支付记录">
          <a-table :data="paymentRecords" :pagination="false">
            <template #columns>
              <a-table-column title="支付流水号" data-index="paymentNo" :width="180" />
              <a-table-column title="支付方式" :width="120">
                <template #cell="{ record }">
                  {{ getPaymentMethodText(record.paymentMethod) }}
                </template>
              </a-table-column>
              <a-table-column title="支付金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">¥{{ record.amount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="支付状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getPaymentStatusColor(record.status)">
                    {{ getPaymentStatusText(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="支付时间" data-index="paymentTime" :width="160" />
              <a-table-column title="备注" data-index="remark" :width="200" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="3" title="物流信息" v-if="currentOrder.status !== 'pending'">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="物流公司">{{ currentOrder.logisticsCompany || '-' }}</a-descriptions-item>
            <a-descriptions-item label="物流单号">{{ currentOrder.logisticsNo || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{ currentOrder.shipTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="物流状态">
              <a-tag v-if="currentOrder.logisticsStatus" :color="getLogisticsStatusColor(currentOrder.logisticsStatus)">
                {{ getLogisticsStatusText(currentOrder.logisticsStatus) }}
              </a-tag>
              <span v-else>-</span>
            </a-descriptions-item>
          </a-descriptions>

          <a-divider>物流跟踪</a-divider>

          <a-timeline v-if="currentOrder.logisticsTracks && currentOrder.logisticsTracks.length > 0">
            <a-timeline-item 
              v-for="(track, index) in currentOrder.logisticsTracks" 
              :key="index"
              :label="track.time"
            >
              {{ track.content }}
            </a-timeline-item>
          </a-timeline>
          <a-empty v-else description="暂无物流信息" />
        </a-tab-pane>

        <a-tab-pane key="4" title="发票信息" v-if="currentOrder.invoiceStatus">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="发票状态">
              <a-tag :color="getInvoiceStatusColor(currentOrder.invoiceStatus)">
                {{ getInvoiceStatusText(currentOrder.invoiceStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="发票类型">{{ currentOrder.invoiceType || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发票号码">{{ currentOrder.invoiceNo || '-' }}</a-descriptions-item>
            <a-descriptions-item label="开票时间">{{ currentOrder.invoiceTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="发票金额">¥{{ currentOrder.invoiceAmount || '-' }}</a-descriptions-item>
            <a-descriptions-item label="税率">{{ currentOrder.taxRate || '-' }}</a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>

        <a-tab-pane key="5" title="订单流程">
          <a-steps :current="getOrderStep(currentOrder.status)" status="process">
            <a-step title="待接单" :description="currentOrder.createTime" />
            <a-step title="待发货" :description="currentOrder.confirmTime || '等待确认'" />
            <a-step title="已发货" :description="currentOrder.shipTime || '等待发货'" />
            <a-step title="已完成" :description="currentOrder.completeTime || '等待完成'" />
          </a-steps>

          <a-divider>操作日志</a-divider>

          <a-timeline>
            <a-timeline-item 
              v-for="(log, index) in currentOrder.logs" 
              :key="index"
              :label="log.time"
            >
              {{ log.content }}
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <a-modal
      v-model:visible="auditVisible"
      title="审核订单"
      :width="1000"
      :footer="false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>请审核订单，确认接单或驳回订单。驳回后订单将无法继续执行。</div>
        </template>
      </a-alert>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>商品清单</a-divider>

      <a-table :data="currentOrder.skuList || []" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="sub-text">{{ record.specValues }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="采购数量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.price }}
            </template>
          </a-table-column>
          <a-table-column title="金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.price).toFixed(2) }}
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="审核意见" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="confirm">确认接单</a-radio>
            <a-radio value="reject">驳回订单</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="auditForm.result === 'reject'" label="驳回原因" required>
          <a-textarea
            v-model="auditForm.rejectReason"
            placeholder="请填写驳回订单的原因"
            :max-length="200"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="auditForm.remark" placeholder="备注说明（选填）" :max-length="200" />
        </a-form-item>
      </a-form>

      <div style="text-align: right; margin-top: 16px">
        <a-space>
          <a-button @click="auditVisible = false">取消</a-button>
          <a-button type="primary" @click="handleAuditSubmit">提交审核</a-button>
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
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span style="color: #165dff; font-weight: 600;">¥{{ currentOrder.totalAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="已付金额">
          <span style="color: #00b42a; font-weight: 600;">¥{{ (currentOrder.paidAmount || 0).toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="待付金额">
          <span style="color: #ff7d00; font-weight: 600;">¥{{ (currentOrder.totalAmount - (currentOrder.paidAmount || 0)).toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="待审核笔数">
          <a-tag color="orange">{{ pendingPaymentRecords.length }} 笔</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>转账凭证记录</a-divider>

      <a-table 
        :data="currentOrder.paymentRecords || []" 
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
          <a-table-column title="审核操作" :width="180">
            <template #cell="{ record }">
              <template v-if="record.status === 'pending'">
                <a-switch
                  v-model="record.auditPass"
                  checked-color="#00b42a"
                  unchecked-color="#f53f3f"
                >
                  <template #checked>通过</template>
                  <template #unchecked>驳回</template>
                </a-switch>
              </template>
              <template v-else>
                <a-tag :color="record.status === 'approved' ? 'green' : 'red'">
                  {{ record.status === 'approved' ? '已通过' : '已驳回' }}
                </a-tag>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="确认金额" :width="140">
            <template #cell="{ record }">
              <template v-if="record.status === 'pending' && record.auditPass">
                <a-input-number
                  v-model="record.confirmedAmount"
                  :min="0"
                  :max="record.amount"
                  :precision="2"
                  size="small"
                  style="width: 100%"
                  placeholder="确认金额"
                />
              </template>
              <template v-else-if="record.status === 'approved'">
                <span style="color: #00b42a;">¥{{ record.confirmedAmount?.toLocaleString() || record.amount.toLocaleString() }}</span>
              </template>
              <span v-else style="color: #86909c;">-</span>
            </template>
          </a-table-column>
          <a-table-column title="驳回原因" :width="150">
            <template #cell="{ record }">
              <template v-if="record.status === 'pending' && !record.auditPass">
                <a-input
                  v-model="record.rejectReason"
                  size="small"
                  placeholder="驳回原因"
                  :max-length="50"
                />
              </template>
              <template v-else-if="record.status === 'rejected'">
                <span style="color: #f53f3f;">{{ record.rejectReason || '-' }}</span>
              </template>
              <span v-else style="color: #86909c;">-</span>
            </template>
          </a-table-column>
          <a-table-column title="转账时间" data-index="paymentTime" :width="140" />
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button 
                type="text" 
                size="small" 
                @click="handleViewVoucher(record)"
                v-if="record.paymentVoucher"
              >
                查看凭证
              </a-button>
              <span v-else style="color: #86909c;">-</span>
            </template>
          </a-table-column>
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
      v-model:visible="confirmVisible"
      title="订单确认"
      :width="1100"
      :footer="false"
    >
      <div style="margin-bottom: 16px; color: #333; font-size: 14px;">
        请确认订单商品信息，可对每个商品填写可供应数量和备注说明。
      </div>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</a-descriptions-item>
      </a-descriptions>

      <a-alert v-if="currentOrder.remark" type="info" style="margin-bottom: 16px">
        <template #title>工程仓备注：</template>
        {{ currentOrder.remark }}
      </a-alert>

      <a-divider>商品清单</a-divider>

      <a-table :data="confirmItems" :pagination="false">
        <template #columns>
          <a-table-column title="是否接单" :width="100" align="center">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.accepted"
                :checked-text="'接单'"
                :unchecked-text="'拒单'"
                size="small"
                @change="(val: string | number | boolean) => handleAcceptChange(record, Boolean(val))"
              />
            </template>
          </a-table-column>
          <a-table-column title="商品名称" :width="160">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div style="color: #86909c; font-size: 12px;">{{ record.specValues }}</div>
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
                v-model="record.shortageReason"
                size="small"
                placeholder="请填写供应不足原因"
                :max-length="50"
              />
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
      v-model:visible="shipVisible"
      title="发货"
      :width="1100"
      :footer="false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        请填写发货信息，支持多次发货。已发货商品无需重复发货。
      </a-alert>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>收货信息</a-divider>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="收货人">{{ currentOrder.receiverName || '张工' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ currentOrder.receiverPhone || '13800138000' }}</a-descriptions-item>
        <a-descriptions-item label="收货仓库">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="3">{{ currentOrder.address }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>发货商品</a-divider>

      <a-table :data="shipForm.items" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div style="color: #86909c; font-size: 12px;">{{ record.specValues }}</div>
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
          <a-button @click="shipVisible = false">取消</a-button>
          <a-button @click="handleShipPartial">本次发货</a-button>
          <a-button type="primary" status="success" @click="handleShipAll">已全部发货</a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="invoiceVisible"
      title="开具发票"
      :width="800"
      @ok="handleInvoiceSubmit"
      @cancel="invoiceVisible = false"
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

        <a-form-item label="备注">
          <a-textarea v-model="invoiceForm.remark" placeholder="备注信息（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="verifyPaymentVisible" 
      title="审核支付凭证" 
      :width="800"
      :footer="false"
    >
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="已支付金额">
          <span style="color: #00b42a; font-weight: 600;">¥{{ (currentOrder.paidAmount || 0).toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="待支付金额">
          <span style="color: #ff7d00; font-weight: 600;">¥{{ (currentOrder.totalAmount - (currentOrder.paidAmount || 0)).toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '银行转账' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>支付记录</a-divider>

      <a-table 
        :data="currentOrder.paymentRecords || []" 
        :pagination="false"
        style="margin-bottom: 16px"
      >
        <template #columns>
          <a-table-column title="支付流水号" data-index="paymentNo" :width="180" />
          <a-table-column title="支付方式" :width="100">
            <template #cell="{ record }">{{ getPaymentMethodText(record.paymentMethod) }}</template>
          </a-table-column>
          <a-table-column title="支付金额" :width="120" align="right">
            <template #cell="{ record }">
              <span class="text-danger">¥{{ record.amount.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPaymentStatusColor(record.status)">
                {{ getPaymentStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="paymentTime" :width="160" />
          <a-table-column title="操作" :width="100">
            <template #cell="{ record }">
              <a-button 
                type="text" 
                size="small" 
                @click="handleViewVoucher(record)"
                v-if="record.paymentVoucher"
              >
                查看凭证
              </a-button>
              <span v-else class="text-disabled">-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-card 
        v-if="(currentOrder.paymentRecords || []).length === 0" 
        size="small" 
        title="暂无支付记录"
      >
        <a-empty description="采购方尚未提交转账凭证" />
      </a-card>

      <a-divider>审核操作</a-divider>

      <a-form :model="verifyPaymentForm" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="verifyPaymentForm.result">
            <a-radio value="success">审核通过，确认到账</a-radio>
            <a-radio value="fail">打回凭证（全部打回，让工程仓重新上传）</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item 
          v-if="verifyPaymentForm.result === 'fail'" 
          label="打回原因" 
          required
        >
          <a-textarea 
            v-model="verifyPaymentForm.failReason" 
            placeholder="请填写打回原因，如：凭证模糊不清、金额不匹配、未查到到账记录等。打回后所有凭证将被退回，工程仓需重新上传。"
            :max-length="200"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea 
            v-model="verifyPaymentForm.remark" 
            placeholder="审核备注（选填）" 
            :max-length="200"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="verifyPaymentVisible = false">取消</a-button>
          <a-button 
            type="primary" 
            @click="handleVerifyPaymentSubmit" 
            :disabled="!verifyPaymentForm.result"
            :status="verifyPaymentForm.result === 'fail' ? 'danger' : 'success'"
          >
            {{ verifyPaymentForm.result === 'fail' ? '确认打回' : '确认到账' }}
          </a-button>
        </a-space>
      </template>
    </a-modal>

    <a-modal 
      v-model:visible="voucherPreviewVisible" 
      title="凭证预览" 
      :width="700"
      :footer="false"
    >
      <div style="text-align: center; padding: 20px;">
        <a-image 
          :src="currentVoucher.paymentVoucher" 
          :alt="currentVoucher.paymentNo"
          style="max-width: 100%; max-height: 600px;"
        />
      </div>
      <a-descriptions :column="2" bordered style="margin-top: 16px">
        <a-descriptions-item label="支付流水号">{{ currentVoucher.paymentNo }}</a-descriptions-item>
        <a-descriptions-item label="转账流水号">{{ currentVoucher.paymentSerial }}</a-descriptions-item>
        <a-descriptions-item label="支付金额">¥{{ currentVoucher.amount.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ currentVoucher.paymentTime }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentVoucher.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
      <template #footer>
        <a-button @click="voucherPreviewVisible = false">关闭</a-button>
      </template>
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
              <span class="sub-text">{{ record.address }}</span>
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
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  getSupplierOrderList, 
  confirmSupplierOrder, 
  shipSupplierOrder 
} from '@gongchengcang/api'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')

const searchForm = reactive({
  orderNo: '',
  orderType: '',
  createTimeRange: [],
  paymentStatus: [],
  buyerName: '',
  shipStatus: '',
  completeTimeRange: [],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const initialData = getSupplierOrderList()
const orderList = ref(initialData.list)
pagination.total = initialData.total

const orderStats = computed(() => {
  return {
    total: orderList.value.length,
    pending: orderList.value.filter(o => o.status === 'pending' || o.status === 'to_confirm').length,
    confirmed: orderList.value.filter(o => o.status === 'confirmed').length,
    shipped: orderList.value.filter(o => o.status === 'shipped').length,
    completed: orderList.value.filter(o => o.status === 'completed').length,
    rejected: orderList.value.filter(o => o.status === 'cancelled').length,
    refunded: orderList.value.filter(o => o.status === 'refunded').length,
  }
})

const pendingPaymentRecords = computed(() => {
  return (currentOrder.value.paymentRecords || []).filter((r: any) => r.status === 'pending')
})

const validPaymentRecords = computed(() => {
  return (currentOrder.value.paymentRecords || []).filter((r: any) => r.status !== 'rejected')
})

const confirmedTotalAmount = computed(() => {
  return (currentOrder.value.paymentRecords || [])
    .filter((r: any) => r.status === 'pending' && r.auditPass)
    .reduce((sum: number, r: any) => sum + (r.confirmedAmount || 0), 0)
})

const passedCount = computed(() => {
  return (currentOrder.value.paymentRecords || []).filter((r: any) => r.status === 'pending' && r.auditPass).length
})

const filteredOrders = computed(() => {
  let result = orderList.value
  
  if (activeTab.value === 'pending') {
    result = result.filter(o => o.status === 'pending' || o.status === 'to_confirm')
  } else if (activeTab.value === 'confirmed') {
    result = result.filter(o => o.status === 'confirmed')
  } else if (activeTab.value === 'shipped') {
    result = result.filter(o => o.status === 'shipped')
  } else if (activeTab.value === 'completed') {
    result = result.filter(o => o.status === 'completed')
  } else if (activeTab.value === 'rejected') {
    result = result.filter(o => o.status === 'cancelled')
  } else if (activeTab.value === 'refunded') {
    result = result.filter(o => o.status === 'refunded')
  }
  
  if (searchForm.orderNo) {
    result = result.filter(o => o.orderNo?.toLowerCase().includes(searchForm.orderNo.toLowerCase()))
  }
  
  if (searchForm.orderType) {
    result = result.filter(o => o.orderType === searchForm.orderType)
  }
  
  if (searchForm.buyerName) {
    result = result.filter(o => o.warehouseName?.toLowerCase().includes(searchForm.buyerName.toLowerCase()))
  }
  
  if (searchForm.shipStatus) {
    result = result.filter(o => o.shipStatus === searchForm.shipStatus)
  }
  
  if (searchForm.paymentStatus && searchForm.paymentStatus.length > 0) {
    result = result.filter(o => searchForm.paymentStatus.includes(o.paymentStatus))
  }
  
  if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
    result = result.filter(o => {
      const createTime = new Date(o.createTime).getTime()
      return createTime >= searchForm.createTimeRange[0].getTime() && createTime <= searchForm.createTimeRange[1].getTime()
    })
  }
  
  if (searchForm.completeTimeRange && searchForm.completeTimeRange.length === 2) {
    result = result.filter(o => {
      if (!o.completeTime) return false
      const completeTime = new Date(o.completeTime).getTime()
      return completeTime >= searchForm.completeTimeRange[0].getTime() && completeTime <= searchForm.completeTimeRange[1].getTime()
    })
  }
  
  result.sort((a, b) => {
    const statusOrder: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      'payment_pending': 2,
      shipped: 3,
      completed: 4,
      refunded: 5,
      cancelled: 6
    }
    
    const statusCompare = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
    if (statusCompare !== 0) {
      return statusCompare
    }
    
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
  
  return result
})

const detailVisible = ref(false)
const currentOrder = ref<any>({})

const paymentRecords = ref<any[]>([])

const confirmVisible = ref(false)
const confirmForm = reactive({
  estimatedShipDate: '',
  remark: ''
})
const confirmItems = ref<any[]>([])

const shipVisible = ref(false)
const shipForm = reactive({
  items: [] as any[],
  hasLogistics: true,
  logisticsList: [{ company: '', no: '' }],
  remark: ''
})

function addLogistics() {
  shipForm.logisticsList.push({ company: '', no: '' })
}

function removeLogistics(index: number) {
  shipForm.logisticsList.splice(index, 1)
}

function handleShip(record: any) {
  currentOrder.value = record

  if (record.skuList && record.skuList.length > 0) {
    shipForm.items = record.skuList.map((sku: any) => ({
      ...sku,
      pendingShipQuantity: (sku.quantity || 0) - (sku.shippedQuantity || 0),
      shipQuantity: (sku.quantity || 0) - (sku.shippedQuantity || 0)
    }))
  } else {
    shipForm.items = [
      { id: '1', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', quantity: 200, shippedQuantity: 0, pendingShipQuantity: 200, shipQuantity: 200, unitPrice: 32.5, amount: 6500 },
      { id: '2', productName: '抛光砖', specValues: '800×800mm 亮光面', unit: '箱', quantity: 300, shippedQuantity: 0, pendingShipQuantity: 300, shipQuantity: 300, unitPrice: 85.0, amount: 25500 },
      { id: '3', productName: '内墙乳胶漆', specValues: '20L/桶 白色', unit: '桶', quantity: 15, shippedQuantity: 0, pendingShipQuantity: 15, shipQuantity: 12, unitPrice: 280.0, amount: 4200 },
      { id: '4', productName: '钢筋HRB400', specValues: 'Φ16mm', unit: '吨', quantity: 5, shippedQuantity: 0, pendingShipQuantity: 5, shipQuantity: 5, unitPrice: 4800.0, amount: 24000 },
      { id: '5', productName: '防水卷材', specValues: 'SBS 4mm厚', unit: '卷', quantity: 20, shippedQuantity: 0, pendingShipQuantity: 20, shipQuantity: 18, unitPrice: 120.0, amount: 2400 },
      { id: '6', productName: '玻璃胶', specValues: '中性耐候 300ml', unit: '支', quantity: 100, shippedQuantity: 0, pendingShipQuantity: 100, shipQuantity: 100, unitPrice: 18.5, amount: 1850 },
    ]
  }
  
  shipForm.hasLogistics = true
  shipForm.logisticsList = [{ company: '', no: '' }]
  shipForm.remark = ''

  shipVisible.value = true
}

function handleShipPartial() {
  const hasInvalidLogistics = shipForm.hasLogistics && shipForm.logisticsList.some(l => !l.company || !l.no)
  if (hasInvalidLogistics) {
    Message.warning('请填写完整的物流信息')
    return
  }

  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.shipStatus = 'partial_shipped'
    order.logs?.push({
      time: new Date().toISOString(),
      content: `部分发货成功，本次发货 ${shipForm.items.reduce((sum, i) => sum + i.shipQuantity, 0)} 件`,
    })
    Message.success('本次发货成功')
  }

  shipVisible.value = false
  refreshOrderList()
}

function handleShipAll() {
  const hasInvalidLogistics = shipForm.hasLogistics && shipForm.logisticsList.some(l => !l.company || !l.no)
  if (hasInvalidLogistics) {
    Message.warning('请填写完整的物流信息')
    return
  }

  for (const item of shipForm.items) {
    item.shipQuantity = item.pendingShipQuantity
  }

  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'shipped'
    order.shipStatus = 'fully_shipped'
    order.shipTime = new Date().toLocaleString()
    order.logs?.push({
      time: new Date().toISOString(),
      content: `全部发货成功，订单状态已更新为待收货`,
    })
    Message.success('全部发货成功，订单已更新为待收货')
  }

  shipVisible.value = false
  refreshOrderList()
}

const invoiceVisible = ref(false)
const invoiceForm = reactive<any>({
  issueType: 'upload',
  invoiceType: 'special',
  invoiceNo: '',
  invoiceCode: '',
  invoiceAmount: 0,
  taxRate: '',
  invoiceDate: '',
  file: null,
  remark: '',
})

function handleInvoice(record: any) {
  currentOrder.value = record
  invoiceForm.issueType = 'upload'
  invoiceForm.invoiceType = 'special'
  invoiceForm.invoiceNo = ''
  invoiceForm.invoiceCode = ''
  invoiceForm.invoiceAmount = record.totalAmount
  invoiceForm.taxRate = '13%'
  invoiceForm.invoiceDate = ''
  invoiceForm.file = null
  invoiceForm.remark = ''
  invoiceVisible.value = true
}

function handleFileChange(fileItem: any) {
  if (fileItem.file) {
    invoiceForm.file = fileItem.file
    Message.success('文件上传成功')
  }
}

function isUrgent(deliveryDate: string) {
  const days = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return days <= 2
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleSearch() {
  pagination.current = 1
  refreshOrderList()
}

function handleReset() {
  searchForm.orderNo = ''
  searchForm.orderType = ''
  searchForm.createTimeRange = []
  searchForm.paymentStatus = []
  searchForm.buyerName = ''
  searchForm.shipStatus = ''
  searchForm.completeTimeRange = []
  pagination.current = 1
  refreshOrderList()
}

function handleExport() {
  Message.info('导出订单功能开发中')
}

function handleExportPending(record: any) {
  const items = record.skuList || []
  if (items.length === 0) {
    Message.warning('该订单暂无商品数据')
    return
  }
  
  exportPendingData.value = items.map((item: any, index: number) => ({
    id: index + 1,
    orderNo: record.orderNo,
    warehouseName: record.warehouseName,
    receiverName: record.receiverName || '张工',
    receiverPhone: record.receiverPhone || '13800138000',
    address: record.address || '',
    productName: item.productName,
    specification: item.specValues || item.specification || '',
    unit: item.unit || '件',
    orderQuantity: item.quantity,
    pendingQuantity: item.quantity,
  }))
  
  exportPendingVisible.value = true
}

function handleExportPendingConfirm() {
  Message.success('待发货单导出成功')
  exportPendingVisible.value = false
}

async function handleView(record: any) {
  try {
    await router.push(`/supplier/order/detail/${record.id}`)
  } catch (err) {
    console.warn('[Navigation Error]', err)
  }
}

function handleConfirm(record: any) {
  currentOrder.value = record
  confirmForm.estimatedShipDate = ''
  confirmForm.remark = ''
  detailVisible.value = false
  
  confirmItems.value = [
    { id: '1', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', quantity: 200, supplyQuantity: 180, accepted: true, unitPrice: 32.5, amount: 6500, remark: '', shortageReason: '' },
    { id: '2', productName: '抛光砖', specValues: '800×800mm 亮光面', unit: '箱', quantity: 300, supplyQuantity: 300, accepted: true, unitPrice: 85.0, amount: 25500, remark: '', shortageReason: '' },
    { id: '3', productName: '内墙乳胶漆', specValues: '20L/桶 白色', unit: '桶', quantity: 15, supplyQuantity: 12, accepted: true, unitPrice: 280.0, amount: 4200, remark: '', shortageReason: '' },
    { id: '4', productName: '钢筋HRB400', specValues: 'Φ16mm', unit: '吨', quantity: 5, supplyQuantity: 5, accepted: true, unitPrice: 4800.0, amount: 24000, remark: '', shortageReason: '' },
    { id: '5', productName: '防水卷材', specValues: 'SBS 4mm厚', unit: '卷', quantity: 20, supplyQuantity: 18, accepted: true, unitPrice: 120.0, amount: 2400, remark: '', shortageReason: '' },
    { id: '6', productName: '玻璃胶', specValues: '中性耐候 300ml', unit: '支', quantity: 100, supplyQuantity: 100, accepted: true, unitPrice: 18.5, amount: 1850, remark: '', shortageReason: '' },
  ]
  
  confirmVisible.value = true
}

function handleAcceptChange(record: any, val: boolean) {
  if (!val) {
    record.supplyQuantity = 0
  } else if (record.supplyQuantity === 0) {
    record.supplyQuantity = record.quantity
  }
}

function handleConfirmFromDetail() {
  detailVisible.value = false
  confirmVisible.value = true
}

function handleConfirmSubmit() {
  const acceptItems = confirmItems.value.filter(i => i.accepted && i.supplyQuantity > 0)
  const rejectItems = confirmItems.value.filter(i => !i.accepted || !i.supplyQuantity || i.supplyQuantity === 0)
  
  if (acceptItems.length === 0) {
    Message.warning('请至少选择并设置一个可供应商品')
    return
  }

  confirmSupplierOrder(currentOrder.value.id, {
    acceptItems,
    rejectItems,
    remark: confirmForm.remark,
  })
  Message.success('订单确认成功')
  currentOrder.value.status = 'confirmed'
  currentOrder.value.confirmTime = new Date().toLocaleString()
  confirmVisible.value = false
  refreshOrderList()
}

function handleReject() {
  Message.info('已拒绝订单')
  detailVisible.value = false
}

function handleRejectOrder() {
  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.status = 'cancelled'
    order.logs?.push({
      time: new Date().toISOString(),
      content: `订单已驳回`,
    })
  }
  confirmVisible.value = false
  refreshOrderList()
  Message.warning('订单已驳回')
}

function hasPendingPaymentRecords(record: any): boolean {
  if (!record.paymentRecords || record.paymentRecords.length === 0) {
    return false
  }
  return record.paymentRecords.some((r: any) => r.status === 'pending')
}

function refreshOrderList() {
  const result = getSupplierOrderList()
  orderList.value = result.list
  pagination.total = result.total
}

function handleCancelOrder(record: any) {
  Message.info('取消接单功能开发中')
}



async function handleInvoiceSubmit() {
  if (!invoiceForm.invoiceType) {
    Message.warning('请选择发票类型')
    return
  }
  if (!invoiceForm.invoiceNo) {
    Message.warning('请输入发票号码')
    return
  }
  if (!invoiceForm.invoiceDate) {
    Message.warning('请选择开票日期')
    return
  }
  if (!invoiceForm.invoiceAmount) {
    Message.warning('请输入价税合计')
    return
  }
  if (!invoiceForm.taxRate) {
    Message.warning('请选择税率')
    return
  }
  if (invoiceForm.issueType === 'upload' && !invoiceForm.file) {
    Message.warning('请上传发票附件')
    return
  }

  try {
    if (invoiceForm.issueType === 'online') {
      Message.loading('正在调用开票接口...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      Message.clear()
    }

    currentOrder.value.invoiceStatus = 'issued'
    currentOrder.value.invoiceNo = invoiceForm.invoiceNo
    currentOrder.value.invoiceType = invoiceForm.invoiceType
    currentOrder.value.invoiceTime = new Date().toLocaleString()
    currentOrder.value.invoiceAmount = invoiceForm.invoiceAmount
    currentOrder.value.taxRate = invoiceForm.taxRate

    invoiceVisible.value = false
    Message.success(
      invoiceForm.issueType === 'online' 
        ? '电子发票开具成功，PDF已自动生成' 
        : '发票信息保存成功'
    )
  } catch (error) {
    Message.clear()
    Message.error('操作失败，请重试')
  }
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    to_confirm: 'gold',
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'cyan',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    to_confirm: '待确认',
    pending: '待接单',
    confirmed: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
    unpaid: '待支付',
  }
  return texts[status] || status
}

function getShipStatusColor(shipStatus: string) {
  const colors: Record<string, string> = {
    '': 'gray',
    'not_shipped': 'gray',
    'partial_shipped': 'orange',
    'fully_shipped': 'green',
  }
  return colors[shipStatus] || 'gray'
}

function getShipStatusText(shipStatus: string) {
  const texts: Record<string, string> = {
    '': '未发货',
    'not_shipped': '未发货',
    'partial_shipped': '部分发货',
    'fully_shipped': '全部发货',
  }
  return texts[shipStatus] || '未发货'
}

function handleViewPayment(record: any) {
  router.push(`/supplier/order/detail/${record.id}`)
}

function handleViewAfterSales(record: any) {
  router.push('/supplier/order/after-sales')
}

const auditVisible = ref(false)
const auditForm = reactive({
  result: '',
  rejectReason: '',
  remark: '',
})

const auditPaymentVisible = ref(false)
const auditPaymentForm = reactive({
  result: 'partial',
  remark: '',
})

function handleAudit(record: any) {
  currentOrder.value = record
  auditForm.result = ''
  auditForm.rejectReason = ''
  auditForm.remark = ''
  auditVisible.value = true
}

function handleAuditSubmit() {
  if (!auditForm.result) {
    Message.warning('请选择审核意见')
    return
  }

  if (auditForm.result === 'reject' && !auditForm.rejectReason) {
    Message.warning('请填写驳回订单的原因')
    return
  }

  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    if (auditForm.result === 'confirm') {
      order.status = 'confirmed'
      order.logs?.push({
        time: new Date().toISOString(),
        content: `订单审核通过，确认接单`,
      })
      Message.success('订单审核通过，订单已确认')
    } else {
      order.status = 'rejected'
      order.logs?.push({
        time: new Date().toISOString(),
        content: `订单已驳回：${auditForm.rejectReason}`,
      })
      Message.warning('订单已驳回')
    }
  }

  auditVisible.value = false
  refreshOrderList()
}

function handleAuditPayment(record: any) {
  currentOrder.value = record
  auditPaymentForm.result = 'partial'
  auditPaymentForm.remark = ''
  if (record.paymentRecords) {
    record.paymentRecords.forEach((r: any) => {
      if (r.status === 'pending') {
        r.auditPass = true
        r.confirmedAmount = r.amount
        r.rejectReason = ''
      }
    })
  }
  auditPaymentVisible.value = true
}

function handleAuditPaymentSubmit() {
  const paymentRecords = currentOrder.value.paymentRecords || []
  const pendingRecords = paymentRecords.filter((r: any) => r.status === 'pending')
  
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

  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    order.paidAmount = totalConfirmed
    // 根据人工选择的支付确认方式设置订单支付状态
    if (auditPaymentForm.result === 'full') {
      order.paymentStatus = 'paid'
    } else {
      order.paymentStatus = 'partial_paid'
    }
    order.logs?.push({
      time: new Date().toISOString(),
      content: `支付审核完成：通过 ${passedRecords.length} 笔（¥${totalConfirmed.toLocaleString()}），驳回 ${rejectedRecords.length} 笔，${auditPaymentForm.result === 'full' ? '全部支付' : '部分支付'}`,
    })
  }

  auditPaymentVisible.value = false
  refreshOrderList()
  Message.success(`审核完成：通过 ${passedRecords.length} 笔，驳回 ${rejectedRecords.length} 笔`)
}

const verifyPaymentVisible = ref(false)
const verifyPaymentForm = reactive({
  result: '',
  failReason: '',
  remark: '',
})

const voucherPreviewVisible = ref(false)
const currentVoucher = ref<any>({})

const exportPendingVisible = ref(false)
const exportPendingData = ref<any[]>([])

function handleVerifyPayment(record: any) {
  currentOrder.value = record
  verifyPaymentForm.result = ''
  verifyPaymentForm.failReason = ''
  verifyPaymentForm.remark = ''
  verifyPaymentVisible.value = true
}

function handleViewVoucher(voucher: any) {
  currentVoucher.value = voucher
  voucherPreviewVisible.value = true
}

function handleVerifyPaymentSubmit() {
  if (!verifyPaymentForm.result) {
    Message.warning('请选择审核结果')
    return
  }

  if (verifyPaymentForm.result === 'fail' && !verifyPaymentForm.failReason) {
    Message.warning('请填写打回原因')
    return
  }

  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    if (verifyPaymentForm.result === 'success') {
      const pendingRecords = (order.paymentRecords || []).filter(r => r.status === 'pending')
      const totalAmount = pendingRecords.reduce((sum, r) => sum + r.amount, 0)
      
      order.paidAmount = (order.paidAmount || 0) + totalAmount
      order.paymentStatus = order.paidAmount >= order.totalAmount ? 'paid' : 'partial_paid'
      
      pendingRecords.forEach(record => {
        record.status = 'approved'
      })
      
      order.logs?.push({
        time: new Date().toISOString(),
        content: `支付审核通过，已确认到账 ¥${totalAmount.toLocaleString()}`,
      })
      Message.success(`支付审核通过，已确认到账 ¥${totalAmount.toLocaleString()}`)
    } else {
      order.paymentAuditStatus = 'rejected'
      order.paymentAuditRemark = verifyPaymentForm.failReason
      
      (order.paymentRecords || []).forEach(record => {
        if (record.status === 'pending') {
          record.status = 'rejected'
        }
      })
      
      order.logs?.push({
        time: new Date().toISOString(),
        content: `支付凭证已打回：${verifyPaymentForm.failReason}`,
      })
      Message.warning('支付凭证已打回，工程仓需重新上传')
    }
  }

  verifyPaymentVisible.value = false
  refreshOrderList()
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    unpaid: 'orange',
    partial_paid: 'gold',
    paid: 'green',
    refunded: 'red',
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    unpaid: '未支付',
    partial_paid: '部分支付',
    paid: '已支付',
  }
  return texts[status] || status
}

function getPaymentMethodText(method: string) {
  const texts: Record<string, string> = {
    escrow: '托管账户',
    bank: '银行转账',
    alipay: '支付宝',
    wechat: '微信支付'
  }
  return texts[method] || method
}

function getLogisticsStatusColor(status: string) {
  const colors: Record<string, string> = {
    transporting: 'blue',
    delivered: 'green',
    signed: 'green'
  }
  return colors[status] || 'gray'
}

function getLogisticsStatusText(status: string) {
  const texts: Record<string, string> = {
    transporting: '运输中',
    delivered: '已送达',
    signed: '已签收'
  }
  return texts[status] || status
}

function getInvoiceStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    issued: 'green'
  }
  return colors[status] || 'gray'
}

function getInvoiceStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待开票',
    issued: '已开票'
  }
  return texts[status] || status
}

function getOrderStep(status: string) {
  const steps: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    completed: 3
  }
  return steps[status] || 0
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

:deep(.order-tabs) {
  margin-bottom: 16px;
  
  :deep(.arco-tabs-header) {
    border-bottom: none;
  }
}

.voucher-preview {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 4px;
  padding: 16px;
}

.voucher-info {
  padding: 8px 0;
  display: flex;
  align-items: center;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
