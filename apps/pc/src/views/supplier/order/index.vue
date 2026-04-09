<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>订单管理</span>
      </template>

      <a-tabs v-model:active-tab="activeTab" class="order-tabs">
        <a-tab-pane key="all" :title="`全部 (${orderStats.total})`" />
        <a-tab-pane key="pending" :title="`待确认 (${orderStats.pending})`" />
        <a-tab-pane key="unpaid" :title="`待支付 (${orderStats.unpaid})`" />
        <a-tab-pane key="undelivered" :title="`待发货 (${orderStats.undelivered})`" />
        <a-tab-pane key="delivered" :title="`待收货 (${orderStats.delivered})`" />
        <a-tab-pane key="completed" :title="`已完成 (${orderStats.completed})`" />
        <a-tab-pane key="refunded" :title="`已退款 (${orderStats.refunded})`" />
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
          <a-table-column title="商品数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 种
            </template>
          </a-table-column>
          <a-table-column title="订单金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.totalAmount?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="支付状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPaymentStatusColor(record.paymentStatus)">
                {{ getPaymentStatusText(record.paymentStatus) }}
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
          <a-table-column title="售后金额" :width="120" align="right">
            <template #cell="{ record }">
              <span v-if="record.refundAmount > 0" class="text-danger">
                -¥{{ record.refundAmount?.toLocaleString() }}
              </span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" :width="160">
            <template #cell="{ record }">
              {{ record.createTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="260" fixed="right">
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
                  确认接单
                </a-button>
                <a-button 
                  v-if="record.status === 'confirmed' && record.paymentStatus === 'unpaid'" 
                  type="text" 
                  size="small"
                  status="danger"
                  @click="handleCancelOrder(record)"
                >
                  取消接单
                </a-button>
                <a-button 
                  v-if="record.status === 'confirmed' && record.paymentStatus === 'unpaid'" 
                  type="text" 
                  size="small"
                  status="warning"
                  @click="handleVerifyPayment(record)"
                >
                  审核支付
                </a-button>
                <a-button 
                  v-if="record.status === 'confirmed' && record.paymentStatus === 'paid'" 
                  type="text" 
                  size="small"
                  status="warning"
                  @click="handleShip(record)"
                >
                  发货
                </a-button>
                <a-button 
                  v-if="record.status === 'shipped'" 
                  type="text" 
                  size="small"
                  @click="handleTrackLogistics(record)"
                >
                  物流跟踪
                </a-button>
                <a-button 
                  v-if="record.status !== 'refunded' && record.status !== 'cancelled'" 
                  type="text" 
                  size="small"
                  status="danger"
                  @click="handleApplyRefund(record)"
                >
                  申请退款
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
            <a-step title="待确认" :description="currentOrder.createTime" />
            <a-step title="已确认" :description="currentOrder.confirmTime || '等待确认'" />
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
      v-model:visible="confirmVisible" 
      title="确认接单" 
      :width="1000"
      @ok="handleConfirmSubmit"
      @cancel="confirmVisible = false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <div>支持部分接单，请为每种商品选择「确认接单」或「无法供货」。无法供货的商品请填写原因。</div>
        </template>
      </a-alert>

      <a-descriptions :column="3" bordered size="small">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="要求交货日期">{{ currentOrder.deliveryDate }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>接单确认清单</a-divider>

      <div class="confirm-summary" style="margin-bottom: 16px">
        <a-tag color="green">确认接单：{{ confirmItems.filter(i => i.status === 'accept').length }} 种</a-tag>
        <a-tag color="red" style="margin-left: 8px">无法供货：{{ confirmItems.filter(i => i.status === 'reject').length }} 种</a-tag>
        <a-tag color="orange" style="margin-left: 8px">待确认：{{ confirmItems.filter(i => !i.status).length }} 种</a-tag>
      </div>

      <a-table :data="confirmItems" :pagination="false">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="200" />
          <a-table-column title="规格" data-index="specValues" :width="120" />
          <a-table-column title="采购数量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="接单状态" :width="130">
            <template #cell="{ record }">
              <a-radio-group v-model="record.status" size="small">
                <a-radio value="accept">确认接单</a-radio>
                <a-radio value="reject">无法供货</a-radio>
              </a-radio-group>
            </template>
          </a-table-column>
          <a-table-column title="预计发货时间" :width="160" v-if="confirmItems.some(i => i.status === 'accept')">
            <template #cell="{ record }">
              <a-date-picker 
                v-if="record.status === 'accept'" 
                v-model="record.estimatedShipDate" 
                size="small" 
                style="width: 100%"
                placeholder="选择发货时间"
              />
              <span v-else class="text-disabled">-</span>
            </template>
          </a-table-column>
          <a-table-column title="无法供货原因" :width="160" v-if="confirmItems.some(i => i.status === 'reject')">
            <template #cell="{ record }">
              <a-select 
                v-if="record.status === 'reject'" 
                v-model="record.rejectReason" 
                size="small" 
                placeholder="选择原因"
                style="width: 100%"
              >
                <a-option value="stock">库存不足</a-option>
                <a-option value="stop_production">停产</a-option>
                <a-option value="price">价格变动</a-option>
                <a-option value="other">其他原因</a-option>
              </a-select>
              <span v-else class="text-disabled">-</span>
            </template>
          </a-table-column>
          <a-table-column title="备注" :width="180">
            <template #cell="{ record }">
              <a-input 
                v-model="record.remark" 
                size="small" 
                placeholder="备注说明" 
                :max-length="100"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-form :model="confirmForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="整体备注">
          <a-textarea v-model="confirmForm.remark" placeholder="整体接单说明（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="shipVisible" 
      title="发货处理" 
      :width="800"
      @ok="handleShipSubmit"
      @cancel="shipVisible = false"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        发货前请确认商品已准备完毕，填写物流信息后点击确认发货。
      </a-alert>

      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</a-descriptions-item>
      </a-descriptions>

      <a-form :model="shipForm" layout="vertical" style="margin-top: 16px">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="物流公司" required>
              <a-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司">
                <a-option value="顺丰速运">顺丰速运</a-option>
                <a-option value="京东物流">京东物流</a-option>
                <a-option value="中通快递">中通快递</a-option>
                <a-option value="圆通速递">圆通速递</a-option>
                <a-option value="申通快递">申通快递</a-option>
                <a-option value="韵达快递">韵达快递</a-option>
                <a-option value="EMS">EMS</a-option>
                <a-option value="自配送">自配送</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="物流单号" required>
              <a-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="发货备注">
          <a-textarea v-model="shipForm.remark" placeholder="发货备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="logisticsModalVisible"
      title="物流跟踪"
      :width="700"
      :footer="false"
    >
      <a-form layout="inline" style="margin-bottom: 16px" v-if="orderLogisticsList.length > 1">
        <a-form-item label="选择物流">
          <a-select v-model="selectedLogisticsId" style="width: 400px" @change="handleLogisticsChange">
            <a-option v-for="logistics in orderLogisticsList" :key="logistics.id" :value="logistics.id">
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
      title="审核支付" 
      :width="700"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="采购方">{{ currentOrder.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="应支付金额">¥{{ currentOrder.totalAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '银行转账' }}</a-descriptions-item>
        <a-descriptions-item label="支付时间">{{ currentOrder.paymentTime || '2024-01-18 10:30:00' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>转账凭证</a-divider>

      <a-card size="small" title="转账回单">
        <a-space direction="vertical" style="width: 100%">
          <div class="voucher-preview">
            <a-empty description="暂无转账凭证" v-if="!currentOrder.paymentVoucher" />
            <img 
              v-else 
              :src="currentOrder.paymentVoucher" 
              alt="转账凭证" 
              style="max-width: 100%; border-radius: 4px"
            />
          </div>
          <div class="voucher-info">
            <a-tag color="blue">银行转账回执</a-tag>
            <span style="margin-left: 8px; color: #86909c">
              转账流水号：{{ currentOrder.paymentSerial || 'BT202401181030001' }}
            </span>
          </div>
        </a-space>
      </a-card>

      <a-divider>审核操作</a-divider>

      <a-form :model="verifyPaymentForm" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="verifyPaymentForm.result">
            <a-radio value="success">审核通过，确认到账</a-radio>
            <a-radio value="fail">审核不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item 
          v-if="verifyPaymentForm.result === 'fail'" 
          label="失败原因" 
          required
        >
          <a-textarea 
            v-model="verifyPaymentForm.failReason" 
            placeholder="请填写审核不通过的原因，如：凭证模糊不清、金额不匹配、未查到到账记录等"
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
          <a-button status="danger" @click="handleVerifyPaymentSubmit" :disabled="!verifyPaymentForm.result">
            提交审核
          </a-button>
        </a-space>
      </template>
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
    pending: orderList.value.filter(o => o.status === 'pending').length,
    unpaid: orderList.value.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'pending').length,
    undelivered: orderList.value.filter(o => o.status === 'confirmed' && o.paymentStatus === 'paid').length,
    delivered: orderList.value.filter(o => o.status === 'shipped').length,
    completed: orderList.value.filter(o => o.status === 'completed').length,
    refunded: orderList.value.filter(o => o.status === 'refunded').length,
  }
})

const filteredOrders = computed(() => {
  let result = orderList.value
  
  if (activeTab.value === 'pending') {
    result = result.filter(o => o.status === 'pending')
  } else if (activeTab.value === 'unpaid') {
    result = result.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'pending')
  } else if (activeTab.value === 'undelivered') {
    result = result.filter(o => o.status === 'confirmed' && o.paymentStatus === 'paid')
  } else if (activeTab.value === 'delivered') {
    result = result.filter(o => o.status === 'shipped')
  } else if (activeTab.value === 'completed') {
    result = result.filter(o => o.status === 'completed')
  } else if (activeTab.value === 'refunded') {
    result = result.filter(o => o.status === 'refunded')
  }
  
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
  logisticsCompany: '',
  logisticsNo: '',
  remark: ''
})

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

const logisticsModalVisible = ref(false)
const selectedLogisticsId = ref('')
const currentLogistics = ref<any>({})

const orderLogisticsList = computed(() => {
  return [
    { id: '1', shipmentNo: 'SH202401160001', shipTime: '2024-01-16 09:00:00', company: '顺丰速运', no: 'SF1234567890' },
    { id: '2', shipmentNo: 'SH202401170002', shipTime: '2024-01-17 14:30:00', company: '京东物流', no: 'JD9876543210' },
  ]
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
  const selected = orderLogisticsList.value.find(l => l.id === selectedLogisticsId.value)
  if (selected) {
    currentLogistics.value = selected
  }
}

function handleTrackLogistics(record: any) {
  selectedLogisticsId.value = '1'
  currentLogistics.value = orderLogisticsList.value[0]
  logisticsModalVisible.value = true
}

function handleApplyRefund(record: any) {
  router.push({
    path: '/supplier/order/refund',
    query: { orderId: record.id, action: 'apply' }
  })
}

function isUrgent(deliveryDate: string) {
  const days = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return days <= 2
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleView(record: any) {
  router.push(`/supplier/order/detail/${record.id}`)
}

function handleConfirm(record: any) {
  currentOrder.value = record
  confirmForm.estimatedShipDate = ''
  confirmForm.remark = ''
  detailVisible.value = false
  
  confirmItems.value = [
    { id: '1', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', quantity: 200, status: 'accept', estimatedShipDate: '', rejectReason: '', remark: '' },
    { id: '2', productName: '抛光砖', specValues: '800×800mm', quantity: 300, status: 'accept', estimatedShipDate: '', rejectReason: '', remark: '' },
    { id: '3', productName: '内墙乳胶漆', specValues: '20L/桶', quantity: 15, status: '', estimatedShipDate: '', rejectReason: '', remark: '' },
  ]
  
  confirmVisible.value = true
}

function handleConfirmFromDetail() {
  detailVisible.value = false
  confirmVisible.value = true
}

function handleConfirmSubmit() {
  const pendingItems = confirmItems.value.filter(i => !i.status)
  if (pendingItems.length > 0) {
    Message.warning(`还有 ${pendingItems.length} 种商品未确认接单状态`)
    return
  }
  
  const acceptItems = confirmItems.value.filter(i => i.status === 'accept')
  const rejectItems = confirmItems.value.filter(i => i.status === 'reject')
  
  if (acceptItems.length === 0 && rejectItems.length === 0) {
    Message.warning('请至少选择一种商品')
    return
  }
  
  const rejectItemsWithoutReason = rejectItems.filter(i => !i.rejectReason)
  if (rejectItemsWithoutReason.length > 0) {
    Message.warning('请为无法供货的商品选择原因')
    return
  }
  
  const acceptItemsWithoutDate = acceptItems.filter(i => !i.estimatedShipDate)
  if (acceptItemsWithoutDate.length > 0) {
    Message.warning('请为确认接单的商品选择预计发货时间')
    return
  }
  
  confirmSupplierOrder(currentOrder.value.id, {
    acceptItems,
    rejectItems,
    remark: confirmForm.remark,
  })
  
  const acceptCount = acceptItems.length
  const rejectCount = rejectItems.length
  
  if (rejectCount > 0) {
    Message.success(`接单成功：确认 ${acceptCount} 种，无法供货 ${rejectCount} 种`)
  } else {
    Message.success('接单成功，请按约定时间发货')
  }
  
  currentOrder.value.status = 'confirmed'
  currentOrder.value.confirmTime = new Date().toLocaleString()
  currentOrder.value.acceptItemCount = acceptCount
  currentOrder.value.rejectItemCount = rejectCount
  confirmVisible.value = false
  refreshOrderList()
}

function handleReject() {
  Message.info('已拒绝订单')
  detailVisible.value = false
}

function handleShip(record: any) {
  router.push(`/supplier/order/detail/${record.id}`)
}

function handleShipSubmit() {
  if (!shipForm.logisticsCompany) {
    Message.warning('请选择物流公司')
    return
  }
  if (!shipForm.logisticsNo) {
    Message.warning('请输入物流单号')
    return
  }
  
  shipSupplierOrder(currentOrder.value.id, {
    logisticsCompany: shipForm.logisticsCompany,
    logisticsNo: shipForm.logisticsNo,
    remark: shipForm.remark,
  })
  
  Message.success('发货成功，物流信息已更新')
  currentOrder.value.status = 'shipped'
  currentOrder.value.shipTime = new Date().toLocaleString()
  currentOrder.value.logisticsCompany = shipForm.logisticsCompany
  currentOrder.value.logisticsNo = shipForm.logisticsNo
  shipVisible.value = false
  refreshOrderList()
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
    pending: '待确认',
    confirmed: '已确认',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
    unpaid: '待支付',
  }
  return texts[status] || status
}

function handleViewAfterSales(record: any) {
  router.push('/supplier/order/refund')
}

const verifyPaymentVisible = ref(false)
const verifyPaymentForm = reactive({
  result: '',
  failReason: '',
  remark: '',
})

function handleVerifyPayment(record: any) {
  currentOrder.value = record
  verifyPaymentForm.result = ''
  verifyPaymentForm.failReason = ''
  verifyPaymentForm.remark = ''
  verifyPaymentVisible.value = true
}

function handleVerifyPaymentSubmit() {
  if (!verifyPaymentForm.result) {
    Message.warning('请选择审核结果')
    return
  }

  if (verifyPaymentForm.result === 'fail' && !verifyPaymentForm.failReason) {
    Message.warning('请填写审核不通过的原因')
    return
  }

  const order = orderList.value.find(o => o.id === currentOrder.value.id)
  if (order) {
    if (verifyPaymentForm.result === 'success') {
      order.paymentStatus = 'paid'
      order.logs?.push({
        time: new Date().toISOString(),
        content: `支付审核通过，已确认到账`,
      })
      Message.success('支付审核通过，订单已确认到账')
    } else {
      order.paymentAuditStatus = 'rejected'
      order.paymentAuditRemark = verifyPaymentForm.failReason
      order.logs?.push({
        time: new Date().toISOString(),
        content: `支付审核不通过：${verifyPaymentForm.failReason}`,
      })
      Message.warning('支付审核不通过')
    }
  }

  verifyPaymentVisible.value = false
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    paid: 'green',
    refunded: 'red'
  }
  return colors[status] || 'gray'
}

function getPaymentStatusText(status: string) {
  const texts: Record<string, string> = {
    unpaid: '待支付',
    paid: '已支付',
    refunded: '已退款'
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
