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
          <a-button v-if="order.invoiceStatus === 'pending'" type="outline" @click="handleApplyInvoice">
            申请开票
          </a-button>
          <a-button v-if="order.status === 'pending'" type="primary" @click="handleConfirm">
            确认订单
          </a-button>
          <a-button v-if="order.status === 'confirmed'" type="primary" @click="handleShip">
            安排发货
          </a-button>
          <a-button v-if="order.status === 'shipped'" type="primary" status="success" @click="handleReceive">
            确认收货
          </a-button>
          <a-button v-if="order.status === 'received'" type="primary" status="success" @click="handleComplete">
            确认完成
          </a-button>
          <a-button v-if="order.status === 'completed'" type="outline" @click="handleAfterSale">
            申请售后
          </a-button>
          <a-button v-if="order.status === 'pending'" status="danger" @click="handleCancel">
            取消订单
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" bordered size="small">
        <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="订单类型">
          <a-tag :color="order.type === 'purchase' ? 'blue' : 'green'">
            {{ order.type === 'purchase' ? '采购订单' : '销售订单' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(order.status)">{{ getStatusText(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          <span class="text-primary">¥{{ order.totalAmount?.toLocaleString() }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付状态">
          <a-tag :color="getPayStatusColor(order.payStatus)">{{ getPayStatusText(order.payStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发票状态">
          <a-tag :color="getInvoiceStatusColor(order.invoiceStatus)">{{ getInvoiceStatusText(order.invoiceStatus) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ order.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="付款时间">{{ order.payTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ order.completeTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订单备注" :span="4">
          {{ order.remark || '-' }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-row :gutter="24">
        <a-col :span="12">
          <a-card :bordered="true" size="small">
            <template #title>
              <icon-user /> {{ order.type === 'sale' ? '施工方信息（买方）' : '买方信息' }}
            </template>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item :label="order.type === 'sale' ? '施工方名称' : '买方名称'">{{ order.buyerName }}</a-descriptions-item>
              <a-descriptions-item label="联系人">{{ order.buyerContact }}</a-descriptions-item>
              <a-descriptions-item label="联系电话">{{ order.buyerPhone }}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{ order.buyerAddress }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card :bordered="true" size="small">
            <template #title>
              <icon-shop /> {{ order.type === 'sale' ? '工程仓信息（卖方）' : '卖方信息' }}
            </template>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item :label="order.type === 'sale' ? '工程仓名称' : '卖方名称'">{{ order.sellerName }}</a-descriptions-item>
              <a-descriptions-item label="联系人">{{ order.sellerContact }}</a-descriptions-item>
              <a-descriptions-item label="联系电话">{{ order.sellerPhone }}</a-descriptions-item>
              <a-descriptions-item label="发货地址">{{ order.sellerAddress }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="products" title="商品明细">
          <a-table :data="order.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品编码" data-index="productCode" :width="120" />
              <a-table-column title="商品名称" :width="200">
                <template #cell="{ record }">
                  <div class="product-info">
                    <a-image :src="record.image" :width="40" :height="40" fit="cover" />
                    <div class="product-detail">
                      <div class="product-name">{{ record.productName }}</div>
                      <div class="product-spec">{{ record.spec }}</div>
                    </div>
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price }}
                </template>
              </a-table-column>
              <a-table-column title="数量" data-index="quantity" :width="80" align="center" />
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="小计" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-primary">¥{{ (record.price * record.quantity).toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="发货数量" :width="100" align="center">
                <template #cell="{ record }">
                  <span :class="record.shipQuantity === record.quantity ? 'text-success' : 'text-warning'">
                    {{ record.shipQuantity || 0 }} / {{ record.quantity }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="收货数量" :width="100" align="center">
                <template #cell="{ record }">
                  <span :class="record.receiveQuantity === record.quantity ? 'text-success' : 'text-warning'">
                    {{ record.receiveQuantity || 0 }} / {{ record.quantity }}
                  </span>
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">商品金额</span>
              <span class="summary-value">¥{{ formatAmount(order.productAmount) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">运费</span>
              <span class="summary-value">¥{{ formatAmount(order.freight) }}</span>
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
            <div class="summary-row" v-if="order.paidAmount > 0">
              <span class="summary-label">已支付</span>
              <span class="summary-value text-success">¥{{ formatAmount(order.paidAmount) }}</span>
            </div>
            <div class="summary-row" v-if="order.totalAmount - (order.paidAmount || 0) > 0">
              <span class="summary-label">待支付</span>
              <span class="summary-value text-warning">¥{{ formatAmount(order.totalAmount - (order.paidAmount || 0)) }}</span>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="split" title="分账信息" v-if="order.type === 'sale'">
          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-share-alt /> 分账概览
            </template>
            <template #extra>
              <a-space>
                <a-button type="text" size="small" @click="handleViewSplitRecords">
                  <template #icon><icon-unordered-list /></template>
                  分账记录
                </a-button>
                <a-button type="text" size="small" @click="handleViewPayRecords">
                  <template #icon><icon-history /></template>
                  支付记录
                </a-button>
              </a-space>
            </template>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic title="订单金额（施工方支付）" :value="order.totalAmount" :precision="2">
                  <template #prefix>¥</template>
                </a-statistic>
              </a-col>
              <a-col :span="6">
                <a-statistic title="平台服务费" :value="order.splitInfo?.platformFee || 0" :precision="2">
                  <template #prefix>¥</template>
                  <template #suffix>
                    <span style="font-size: 12px; color: var(--color-text-3)">（{{ order.splitInfo?.platformRate || 1 }}%）</span>
                  </template>
                </a-statistic>
              </a-col>
              <a-col :span="6">
                <a-statistic title="工程仓收入" :value="order.splitInfo?.warehouseAmount || 0" :precision="2">
                  <template #prefix>¥</template>
                  <template #suffix>
                    <span style="font-size: 12px; color: var(--color-text-3)">（{{ order.splitInfo?.warehouseRate || 99 }}%）</span>
                  </template>
                </a-statistic>
              </a-col>
              <a-col :span="6">
                <a-statistic title="分账状态" :value="getSplitStatusText(order.splitInfo?.status || 'pending')">
                  <template #prefix>
                    <icon-check-circle-fill v-if="order.splitInfo?.status === 'success'" style="color: var(--color-success)" />
                    <icon-clock-circle v-else style="color: var(--color-warning)" />
                  </template>
                </a-statistic>
              </a-col>
            </a-row>
          </a-card>

          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-setting /> 分账规则
            </template>
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="分账规则名称">{{ order.splitInfo?.ruleName || '默认分账规则' }}</a-descriptions-item>
              <a-descriptions-item label="适用场景">施工方采购订单</a-descriptions-item>
              <a-descriptions-item label="平台分账比例">{{ order.splitInfo?.platformRate || 1 }}%</a-descriptions-item>
              <a-descriptions-item label="工程仓分账比例">{{ order.splitInfo?.warehouseRate || 99 }}%</a-descriptions-item>
              <a-descriptions-item label="最低分账金额">¥0.01</a-descriptions-item>
              <a-descriptions-item label="分账时效">支付成功后自动分账</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-user-group /> 分账明细
            </template>
            <a-table :data="order.splitInfo?.details || []" :pagination="false">
              <template #columns>
                <a-table-column title="分账方" :width="150">
                  <template #cell="{ record }">
                    <div>
                      <div class="split-name">{{ record.name }}</div>
                      <div class="split-role">{{ record.role }}</div>
                    </div>
                  </template>
                </a-table-column>
                <a-table-column title="分账比例" :width="100" align="center">
                  <template #cell="{ record }">
                    {{ record.rate }}%
                  </template>
                </a-table-column>
                <a-table-column title="分账金额" :width="120" align="right">
                  <template #cell="{ record }">
                    <span class="text-primary">¥{{ formatAmount(record.amount) }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="分账状态" :width="100" align="center">
                  <template #cell="{ record }">
                    <a-tag :color="getSplitStatusColor(record.status)">{{ getSplitStatusText(record.status) }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="分账时间" data-index="splitTime" :width="160" />
                <a-table-column title="账户信息" :width="200">
                  <template #cell="{ record }">
                    <div v-if="record.accountNo">
                      <div>{{ record.accountNo }}</div>
                      <div class="account-name">{{ record.accountName }}</div>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>

          <a-card :bordered="true" size="small">
            <template #title>
              <icon-history /> 支付记录
            </template>
            <template #extra>
              <a-button type="text" size="small" @click="handleViewPayRecords">查看全部</a-button>
            </template>
            <a-table :data="order.payRecords || []" :pagination="false">
              <template #columns>
                <a-table-column title="支付流水号" data-index="payNo" :width="180" />
                <a-table-column title="支付方式" :width="100">
                  <template #cell="{ record }">
                    <a-tag>{{ record.payMethod }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="支付金额" :width="120" align="right">
                  <template #cell="{ record }">
                    <span class="text-primary">¥{{ formatAmount(record.amount) }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="支付状态" :width="100" align="center">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 'success' ? 'green' : 'orange'">
                      {{ record.status === 'success' ? '支付成功' : '处理中' }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="支付时间" data-index="payTime" :width="160" />
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="logistics" title="物流信息">
          <a-descriptions :column="4" bordered size="small" v-if="order.logistics">
            <a-descriptions-item label="物流公司">{{ order.logistics.company }}</a-descriptions-item>
            <a-descriptions-item label="物流单号">{{ order.logistics.no }}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{ order.logistics.shipTime }}</a-descriptions-item>
            <a-descriptions-item label="预计到达">{{ order.logistics.estimatedArrival }}</a-descriptions-item>
          </a-descriptions>

          <a-timeline v-if="order.logistics?.tracks?.length" style="margin-top: 16px">
            <a-timeline-item v-for="track in order.logistics.tracks" :key="track.id">
              <div class="track-item">
                <div class="track-time">{{ track.time }}</div>
                <div class="track-content">{{ track.content }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>

          <a-empty v-if="!order.logistics" description="暂无物流信息" />
        </a-tab-pane>

        <a-tab-pane key="invoice" title="发票信息">
          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-file /> 发票信息
            </template>
            <template #extra>
              <a-button v-if="order.invoiceStatus === 'pending'" type="primary" size="small" @click="handleApplyInvoice">
                申请开票
              </a-button>
              <a-button v-if="order.invoiceStatus === 'issued'" type="outline" size="small" @click="handleDownloadInvoice">
                下载发票
              </a-button>
            </template>
            <a-descriptions :column="2" bordered size="small" v-if="order.invoice">
              <a-descriptions-item label="发票类型">{{ order.invoice.type }}</a-descriptions-item>
              <a-descriptions-item label="发票状态">
                <a-tag :color="getInvoiceStatusColor(order.invoiceStatus)">{{ getInvoiceStatusText(order.invoiceStatus) }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="发票抬头">{{ order.invoice.title }}</a-descriptions-item>
              <a-descriptions-item label="纳税人识别号">{{ order.invoice.taxNo }}</a-descriptions-item>
              <a-descriptions-item label="开票金额">¥{{ formatAmount(order.invoice.amount) }}</a-descriptions-item>
              <a-descriptions-item label="申请时间">{{ order.invoice.applyTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="开票时间">{{ order.invoice.issueTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="发票号码">{{ order.invoice.invoiceNo || '-' }}</a-descriptions-item>
            </a-descriptions>
            <a-empty v-else description="暂未申请发票" />
          </a-card>

          <a-card :bordered="true" size="small">
            <template #title>
              <icon-history /> 开票记录
            </template>
            <a-table :data="order.invoiceRecords || []" :pagination="false">
              <template #columns>
                <a-table-column title="申请时间" data-index="applyTime" :width="160" />
                <a-table-column title="发票类型" data-index="type" :width="120" />
                <a-table-column title="发票金额" :width="120" align="right">
                  <template #cell="{ record }">
                    ¥{{ formatAmount(record.amount) }}
                  </template>
                </a-table-column>
                <a-table-column title="发票号码" data-index="invoiceNo" :width="160" />
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="getInvoiceStatusColor(record.status)">{{ getInvoiceStatusText(record.status) }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="开票时间" data-index="issueTime" :width="160" />
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="receive" title="验收入库" v-if="order.type === 'purchase'">
          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-check-circle /> 验收信息
            </template>
            <template #extra>
              <a-button v-if="order.status === 'shipped'" type="primary" size="small" @click="handleReceive">
                确认收货
              </a-button>
              <a-button v-if="order.status === 'received'" type="primary" size="small" @click="handleStorage">
                确认入库
              </a-button>
            </template>
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="收货状态">
                <a-tag :color="order.receiveStatus === 'received' ? 'green' : 'orange'">
                  {{ order.receiveStatus === 'received' ? '已收货' : '待收货' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="入库状态">
                <a-tag :color="order.storageStatus === 'stored' ? 'green' : 'orange'">
                  {{ order.storageStatus === 'stored' ? '已入库' : '待入库' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="收货时间">{{ order.receiveTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="入库时间">{{ order.storageTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="收货人">{{ order.receiver || '-' }}</a-descriptions-item>
              <a-descriptions-item label="验收人">{{ order.inspector || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="true" size="small">
            <template #title>
              <icon-unordered-list /> 验收明细
            </template>
            <a-table :data="order.items" :pagination="false">
              <template #columns>
                <a-table-column title="商品名称" data-index="productName" :width="200" />
                <a-table-column title="规格" data-index="spec" :width="120" />
                <a-table-column title="采购数量" data-index="quantity" :width="100" align="center" />
                <a-table-column title="发货数量" data-index="shipQuantity" :width="100" align="center" />
                <a-table-column title="实收数量" :width="120">
                  <template #cell="{ record }">
                    <a-input-number v-if="order.status === 'shipped'" v-model="record.receiveQuantity" :min="0" :max="record.shipQuantity" size="small" />
                    <span v-else>{{ record.receiveQuantity || 0 }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="差异数量" :width="100" align="center">
                  <template #cell="{ record }">
                    <span :class="getDiffClass(record.shipQuantity, record.receiveQuantity)">
                      {{ (record.receiveQuantity || 0) - record.shipQuantity }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="验收备注" :width="200">
                  <template #cell="{ record }">
                    <a-input v-if="order.status === 'shipped'" v-model="record.receiveRemark" placeholder="验收备注" size="small" />
                    <span v-else>{{ record.receiveRemark || '-' }}</span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="aftersale" title="售后记录">
          <a-card :bordered="true" size="small" style="margin-bottom: 16px">
            <template #title>
              <icon-exclamation-circle /> 售后信息
            </template>
            <template #extra>
              <a-button v-if="order.status === 'completed'" type="primary" size="small" @click="handleAfterSale">
                申请售后
              </a-button>
            </template>
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="售后状态">
                <a-tag :color="getAfterSaleStatusColor(order.afterSaleStatus)">
                  {{ getAfterSaleStatusText(order.afterSaleStatus) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="售后类型">{{ order.afterSaleType || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card :bordered="true" size="small">
            <template #title>
              <icon-history /> 售后记录
            </template>
            <a-table :data="order.afterSaleRecords || []" :pagination="false">
              <template #columns>
                <a-table-column title="售后单号" data-index="afterSaleNo" :width="160" />
                <a-table-column title="售后类型" :width="100">
                  <template #cell="{ record }">
                    <a-tag>{{ record.type }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="申请原因" data-index="reason" :width="200" />
                <a-table-column title="退款金额" :width="120" align="right">
                  <template #cell="{ record }">
                    <span v-if="record.refundAmount" class="text-danger">¥{{ formatAmount(record.refundAmount) }}</span>
                    <span v-else>-</span>
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="getAfterSaleStatusColor(record.status)">{{ getAfterSaleStatusText(record.status) }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="申请时间" data-index="applyTime" :width="160" />
                <a-table-column title="处理时间" data-index="handleTime" :width="160" />
              </template>
            </a-table>
            <a-empty v-if="!order.afterSaleRecords?.length" description="暂无售后记录" />
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="logs" title="操作记录">
          <a-timeline>
            <a-timeline-item v-for="log in order.logs" :key="log.id">
              <div class="log-item">
                <div class="log-header">
                  <span class="log-action">{{ log.action }}</span>
                  <span class="log-time">{{ log.time }}</span>
                </div>
                <div class="log-user">操作人：{{ log.operator }}</div>
                <div v-if="log.remark" class="log-remark">备注：{{ log.remark }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:visible="shipModalVisible"
      title="安排发货"
      :width="600"
      @ok="handleShipConfirm"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        请选择物流公司并填写物流单号，系统将自动获取物流轨迹信息
      </a-alert>

      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="物流公司" required>
          <a-select 
            v-model="shipForm.company" 
            placeholder="请选择物流公司"
            allow-search
            @change="handleCompanyChange"
          >
            <a-option v-for="c in logisticsCompanies" :key="c.code" :value="c.name">
              {{ c.name }}
              <span style="color: var(--color-text-3); margin-left: 8px">{{ c.code }}</span>
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="物流单号" required>
          <a-input 
            v-model="shipForm.no" 
            placeholder="请输入物流单号"
            allow-clear
          >
            <template #append>
              <a-button @click="handleQueryLogistics">
                <template #icon><icon-search /></template>
                查询
              </a-button>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="发货商品">
          <a-checkbox-group v-model="shipForm.selectedItems">
            <a-row :gutter="[8, 8]">
              <a-col :span="12" v-for="item in order.items" :key="item.id">
                <a-checkbox :value="item.id">
                  {{ item.productName }} ({{ item.quantity }}{{ item.unit }})
                </a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="预计到达时间">
          <a-date-picker v-model="shipForm.estimatedArrival" style="width: 100%" />
        </a-form-item>
        <a-form-item label="发货备注">
          <a-textarea v-model="shipForm.remark" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </a-form>

      <a-divider v-if="logisticsInfo" style="margin: 12px 0" />

      <div v-if="logisticsInfo" class="logistics-preview">
        <div class="logistics-header">
          <icon-check-circle-fill style="color: var(--color-success)" />
          <span>物流信息已获取</span>
        </div>
        <a-descriptions :column="2" size="small" bordered>
          <a-descriptions-item label="物流状态">{{ logisticsInfo.status }}</a-descriptions-item>
          <a-descriptions-item label="发货时间">{{ logisticsInfo.shipTime }}</a-descriptions-item>
          <a-descriptions-item label="始发地">{{ logisticsInfo.origin }}</a-descriptions-item>
          <a-descriptions-item label="目的地">{{ logisticsInfo.destination }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="logisticsModalVisible"
      title="物流轨迹"
      :width="500"
      :footer="false"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="物流公司">{{ order.logistics?.company }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{ order.logistics?.no }}</a-descriptions-item>
        <a-descriptions-item label="发货时间">{{ order.logistics?.shipTime }}</a-descriptions-item>
        <a-descriptions-item label="预计到达">{{ order.logistics?.estimatedArrival }}</a-descriptions-item>
      </a-descriptions>

      <a-timeline v-if="order.logistics?.tracks?.length">
        <a-timeline-item v-for="track in order.logistics.tracks" :key="track.id">
          <div class="track-item">
            <div class="track-time">{{ track.time }}</div>
            <div class="track-content">{{ track.content }}</div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <a-modal
      v-model:visible="invoiceModalVisible"
      title="申请开票"
      :width="500"
      @ok="handleInvoiceConfirm"
    >
      <a-form :model="invoiceForm" layout="vertical">
        <a-form-item label="发票类型" required>
          <a-radio-group v-model="invoiceForm.type">
            <a-radio value="增值税普通发票">增值税普通发票</a-radio>
            <a-radio value="增值税专用发票">增值税专用发票</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="发票抬头" required>
          <a-input v-model="invoiceForm.title" placeholder="请输入发票抬头" />
        </a-form-item>
        <a-form-item label="纳税人识别号" required>
          <a-input v-model="invoiceForm.taxNo" placeholder="请输入纳税人识别号" />
        </a-form-item>
        <a-form-item label="开票金额">
          <a-input-number v-model="invoiceForm.amount" :min="0" :max="order.totalAmount" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="invoiceForm.remark" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="afterSaleModalVisible"
      title="申请售后"
      :width="600"
      @ok="handleAfterSaleConfirm"
    >
      <a-form :model="afterSaleForm" layout="vertical">
        <a-form-item label="售后类型" required>
          <a-radio-group v-model="afterSaleForm.type">
            <a-radio value="退货退款">退货退款</a-radio>
            <a-radio value="仅退款">仅退款</a-radio>
            <a-radio value="换货">换货</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="申请原因" required>
          <a-select v-model="afterSaleForm.reason" placeholder="请选择申请原因">
            <a-option value="商品质量问题">商品质量问题</a-option>
            <a-option value="商品与描述不符">商品与描述不符</a-option>
            <a-option value="商品损坏">商品损坏</a-option>
            <a-option value="发错货">发错货</a-option>
            <a-option value="其他原因">其他原因</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="退款金额" v-if="afterSaleForm.type !== '换货'">
          <a-input-number v-model="afterSaleForm.refundAmount" :min="0" :max="order.totalAmount" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="问题描述">
          <a-textarea v-model="afterSaleForm.description" placeholder="请详细描述问题" :max-length="500" />
        </a-form-item>
        <a-form-item label="上传凭证">
          <a-upload list-type="picture-card" :limit="5">
            <template #upload-button>
              <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                <icon-plus />
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('products')
const shipModalVisible = ref(false)
const logisticsModalVisible = ref(false)
const logisticsInfo = ref<any>(null)
const invoiceModalVisible = ref(false)
const afterSaleModalVisible = ref(false)

const shipForm = reactive({
  company: '',
  no: '',
  estimatedArrival: '',
  remark: '',
  selectedItems: [] as string[],
})

const invoiceForm = reactive({
  type: '增值税普通发票',
  title: '',
  taxNo: '',
  amount: 0,
  remark: '',
})

const afterSaleForm = reactive({
  type: '退货退款',
  reason: '',
  refundAmount: 0,
  description: '',
})

const logisticsCompanies = ref([
  { code: 'SF', name: '顺丰速运', apiCode: 'shunfeng' },
  { code: 'ZT', name: '中通快递', apiCode: 'zhongtong' },
  { code: 'YT', name: '圆通快递', apiCode: 'yuantong' },
  { code: 'YD', name: '韵达快递', apiCode: 'yunda' },
  { code: 'ST', name: '申通快递', apiCode: 'shentong' },
  { code: 'DB', name: '德邦物流', apiCode: 'debangwuliu' },
  { code: 'JD', name: '京东物流', apiCode: 'jd' },
])

const order = ref({
  id: '1',
  orderNo: 'SO202403240001',
  type: 'sale',
  status: 'shipped',
  payStatus: 'paid',
  invoiceStatus: 'pending',
  receiveStatus: 'pending',
  storageStatus: 'pending',
  afterSaleStatus: 'none',
  totalAmount: 125000,
  productAmount: 123000,
  freight: 2000,
  discountAmount: 0,
  taxAmount: 0,
  paidAmount: 125000,
  remark: '请尽快发货，工地急需使用',
  createdAt: '2024-03-24 10:30:00',
  payTime: '2024-03-24 10:35:00',
  completeTime: '',
  receiveTime: '',
  storageTime: '',
  receiver: '',
  inspector: '',
  buyerName: '中建三局项目部',
  buyerContact: '张三',
  buyerPhone: '13800138001',
  buyerAddress: '广东省深圳市南山区深圳湾科技园',
  sellerName: '南京工程仓',
  sellerContact: '李四',
  sellerPhone: '13900139001',
  sellerAddress: '江苏省南京市建邺区建材市场A区',
  items: [
    { id: '1', productCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', image: 'https://picsum.photos/200/200?random=1', price: 380, quantity: 100, unit: '吨', shipQuantity: 100, receiveQuantity: 100, receiveRemark: '' },
    { id: '2', productCode: 'SKU-LW-001', productName: '螺纹钢 HRB400 16mm', spec: '16mm', image: 'https://picsum.photos/200/200?random=2', price: 4100, quantity: 20, unit: '吨', shipQuantity: 20, receiveQuantity: 20, receiveRemark: '' },
    { id: '3', productCode: 'SKU-FS-001', productName: '防水涂料', spec: '20kg/桶', image: 'https://picsum.photos/200/200?random=3', price: 280, quantity: 50, unit: '桶', shipQuantity: 50, receiveQuantity: 48, receiveRemark: '2桶包装破损' },
  ],
  logistics: {
    company: '顺丰速运',
    no: 'SF1234567890',
    shipTime: '2024-03-24 14:00:00',
    estimatedArrival: '2024-03-26',
    tracks: [
      { id: 't1', time: '2024-03-24 14:00:00', content: '已发货，快递员已揽收' },
      { id: 't2', time: '2024-03-24 18:00:00', content: '快件已到达【深圳转运中心】' },
      { id: 't3', time: '2024-03-25 08:00:00', content: '快件已发出，下一站【南山营业点】' },
    ],
  },
  invoice: null as any,
  invoiceRecords: [],
  afterSaleRecords: [],
  splitInfo: {
    status: 'pending',
    ruleName: '施工方采购分账规则',
    platformRate: 1,
    warehouseRate: 99,
    platformFee: 1250,
    warehouseAmount: 123750,
    details: [
      { id: 's1', name: '平台服务费', role: '平台', rate: 1, amount: 1250, status: 'pending', splitTime: '-', accountNo: '-', accountName: '工程仓平台' },
      { id: 's2', name: '南京工程仓', role: '工程仓（卖方）', rate: 99, amount: 123750, status: 'pending', splitTime: '-', accountNo: '6228 **** **** 5678', accountName: '南京工程仓' },
    ],
  },
  payRecords: [
    { id: 'p1', payNo: 'PAY202403240001', payMethod: '微信支付', amount: 50000, status: 'success', payTime: '2024-03-24 10:35:00' },
    { id: 'p2', payNo: 'PAY202403240002', payMethod: '银行转账', amount: 75000, status: 'success', payTime: '2024-03-24 10:35:30' },
  ],
  logs: [
    { id: 'l1', action: '创建订单', time: '2024-03-24 10:30:00', operator: '系统', remark: '销售订单自动生成' },
    { id: 'l2', action: '支付成功', time: '2024-03-24 10:35:00', operator: '系统', remark: '支付金额：¥125,000.00' },
    { id: 'l3', action: '确认订单', time: '2024-03-24 11:00:00', operator: '李四', remark: '' },
    { id: 'l4', action: '安排发货', time: '2024-03-24 14:00:00', operator: '李四', remark: '物流单号：SF1234567890' },
  ],
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'cyan',
    received: 'purple',
    completed: 'green',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    received: '已收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

function getPayStatusColor(status: string) {
  const colors: Record<string, string> = {
    unpaid: 'orange',
    paid: 'green',
    refunded: 'gray',
  }
  return colors[status] || 'gray'
}

function getPayStatusText(status: string) {
  const texts: Record<string, string> = {
    unpaid: '待支付',
    paid: '已支付',
    refunded: '已退款',
  }
  return texts[status] || status
}

function formatAmount(amount: number | undefined) {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getSplitStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    success: 'green',
    failed: 'red',
  }
  return colors[status] || 'gray'
}

function getSplitStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待分账',
    success: '已分账',
    failed: '分账失败',
  }
  return texts[status] || status
}

function getInvoiceStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    applied: 'blue',
    issued: 'green',
    cancelled: 'gray',
  }
  return colors[status] || 'gray'
}

function getInvoiceStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待开票',
    applied: '已申请',
    issued: '已开票',
    cancelled: '已取消',
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

function getDiffClass(shipQuantity: number, receiveQuantity: number) {
  const diff = (receiveQuantity || 0) - shipQuantity
  if (diff === 0) return 'text-success'
  if (diff < 0) return 'text-danger'
  return 'text-warning'
}

function handleViewSplitRecords() {
  router.push('/finance/split')
}

function handleViewPayRecords() {
  router.push('/finance/payment')
}

function handleBack() {
  router.back()
}

function handleConfirm() {
  Message.success('订单已确认')
  order.value.status = 'confirmed'
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '确认订单',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: '',
  })
}

function handleShip() {
  shipForm.company = ''
  shipForm.no = ''
  shipForm.estimatedArrival = ''
  shipForm.remark = ''
  shipForm.selectedItems = order.value.items.map(item => item.id)
  logisticsInfo.value = null
  shipModalVisible.value = true
}

function handleCompanyChange(value: string) {
  logisticsInfo.value = null
}

async function handleQueryLogistics() {
  if (!shipForm.company || !shipForm.no) {
    Message.warning('请选择物流公司并填写物流单号')
    return
  }
  Message.info('正在查询物流信息...')
  await new Promise(resolve => setTimeout(resolve, 800))
  logisticsInfo.value = {
    status: '运输中',
    shipTime: new Date().toLocaleString(),
    origin: '广州市天河区',
    destination: '深圳市南山区',
  }
  Message.success('物流信息获取成功')
}

function handleShipConfirm() {
  if (!shipForm.company || !shipForm.no) {
    Message.warning('请填写物流公司和物流单号')
    return
  }
  if (shipForm.selectedItems.length === 0) {
    Message.warning('请选择发货商品')
    return
  }
  Message.success('发货成功')
  order.value.status = 'shipped'
  order.value.items.forEach(item => {
    if (shipForm.selectedItems.includes(item.id)) {
      item.shipQuantity = item.quantity
    }
  })
  order.value.logistics = {
    company: shipForm.company,
    no: shipForm.no,
    shipTime: new Date().toLocaleString(),
    estimatedArrival: shipForm.estimatedArrival || '预计2-3天送达',
    tracks: [
      { id: 't1', time: new Date().toLocaleString(), content: `已发货，物流公司：${shipForm.company}，运单号：${shipForm.no}` },
    ],
  }
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '安排发货',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: `物流公司：${shipForm.company}，物流单号：${shipForm.no}`,
  })
  shipModalVisible.value = false
}

function handleComplete() {
  Message.success('订单已完成')
  order.value.status = 'completed'
  order.value.completeTime = new Date().toLocaleString()
  order.value.invoiceStatus = 'pending'
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '确认完成',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: '',
  })
}

function handleReceive() {
  Message.success('已确认收货')
  order.value.status = 'received'
  order.value.receiveStatus = 'received'
  order.value.receiveTime = new Date().toLocaleString()
  order.value.receiver = '当前用户'
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '确认收货',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: '',
  })
}

function handleStorage() {
  Message.success('已确认入库')
  order.value.status = 'completed'
  order.value.storageStatus = 'stored'
  order.value.storageTime = new Date().toLocaleString()
  order.value.inspector = '当前用户'
  order.value.invoiceStatus = 'pending'
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '确认入库',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: '商品已盘点入库',
  })
}

function handleApplyInvoice() {
  invoiceForm.amount = order.value.totalAmount
  invoiceModalVisible.value = true
}

function handleInvoiceConfirm() {
  if (!invoiceForm.title || !invoiceForm.taxNo) {
    Message.warning('请填写发票抬头和纳税人识别号')
    return
  }
  Message.success('开票申请已提交')
  order.value.invoiceStatus = 'applied'
  order.value.invoice = {
    type: invoiceForm.type,
    title: invoiceForm.title,
    taxNo: invoiceForm.taxNo,
    amount: invoiceForm.amount,
    applyTime: new Date().toLocaleString(),
    issueTime: '',
    invoiceNo: '',
  }
  order.value.invoiceRecords.push({
    id: `i${Date.now()}`,
    applyTime: new Date().toLocaleString(),
    type: invoiceForm.type,
    amount: invoiceForm.amount,
    status: 'applied',
    invoiceNo: '',
    issueTime: '',
  })
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '申请开票',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: `发票类型：${invoiceForm.type}，金额：¥${invoiceForm.amount}`,
  })
  invoiceModalVisible.value = false
}

function handleDownloadInvoice() {
  Message.info('正在下载发票...')
  setTimeout(() => {
    Message.success('发票下载成功')
  }, 1000)
}

function handleAfterSale() {
  afterSaleForm.refundAmount = order.value.totalAmount
  afterSaleModalVisible.value = true
}

function handleAfterSaleConfirm() {
  if (!afterSaleForm.reason) {
    Message.warning('请选择申请原因')
    return
  }
  Message.success('售后申请已提交')
  order.value.afterSaleStatus = 'pending'
  order.value.afterSaleRecords.push({
    id: `a${Date.now()}`,
    afterSaleNo: `AS${Date.now()}`,
    type: afterSaleForm.type,
    reason: afterSaleForm.reason,
    refundAmount: afterSaleForm.type !== '换货' ? afterSaleForm.refundAmount : 0,
    status: 'pending',
    applyTime: new Date().toLocaleString(),
    handleTime: '',
  })
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '申请售后',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: `售后类型：${afterSaleForm.type}，原因：${afterSaleForm.reason}`,
  })
  afterSaleModalVisible.value = false
}

function handleCancel() {
  Message.success('订单已取消')
  order.value.status = 'cancelled'
  order.value.logs.push({
    id: `l${Date.now()}`,
    action: '取消订单',
    time: new Date().toLocaleString(),
    operator: '当前用户',
    remark: '',
  })
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
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

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .product-detail {
    .product-name {
      font-weight: 500;
    }
    .product-spec {
      font-size: 12px;
      color: var(--color-text-3);
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

.split-name {
  font-weight: 500;
}

.split-role {
  font-size: 12px;
  color: var(--color-text-3);
}

.account-name {
  font-size: 12px;
  color: var(--color-text-3);
}

.text-muted {
  color: var(--color-text-3);
}

.logistics-preview {
  .logistics-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 500;
  }
}

.track-item {
  .track-time {
    font-size: 12px;
    color: var(--color-text-3);
    margin-bottom: 4px;
  }
  .track-content {
    font-size: 14px;
  }
}

.log-item {
  .log-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;

    .log-action {
      font-weight: 500;
    }

    .log-time {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }

  .log-user {
    font-size: 13px;
    color: var(--color-text-2);
  }

  .log-remark {
    font-size: 13px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}
</style>
