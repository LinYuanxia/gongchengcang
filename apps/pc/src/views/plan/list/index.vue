<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <template #title>
        <span>采购计划管理</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          创建采购计划
        </a-button>
      </template>

      <div class="search-area">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="计划编号">
            <a-input v-model="searchForm.planNo" placeholder="请输入计划编号" allow-clear />
          </a-form-item>
          <a-form-item label="计划名称">
            <a-input v-model="searchForm.planName" placeholder="请输入计划名称" allow-clear />
          </a-form-item>
          <a-form-item label="计划状态">
            <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear style="width: 140px">
              <a-option value="draft">草稿</a-option>
              <a-option value="published">已发布</a-option>
              <a-option value="partial">部分确认</a-option>
              <a-option value="confirmed">全部确认</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="cancelled">已取消</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <a-table
        :data="filteredPlans"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="计划编号" data-index="planNo" :width="150" />
          <a-table-column title="计划名称" data-index="planName" :width="200" />
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 个
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.estimatedAmount?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="推送仓库" :width="180">
            <template #cell="{ record }">
              <template v-if="record.pushList && record.pushList.length > 0">
                <a-popover trigger="hover">
                  <span class="push-count">
                    {{ record.pushList.length }} 个仓库
                    <icon-right />
                  </span>
                  <template #content>
                    <div class="push-list">
                      <div v-for="item in record.pushList" :key="item.warehouseId" class="push-item">
                        <div class="push-item-header">
                          <div>
                            <span class="parent-warehouse">{{ item.warehouseParentName }}</span>
                            <span class="sub-warehouse">{{ item.warehouseName }}</span>
                          </div>
                          <a-tag :color="getPushStatusColor(item.status)" size="small">
                            {{ getPushStatusText(item.status) }}
                          </a-tag>
                        </div>
                        <template v-if="item.status === 'pending'">
                          <div class="push-actions">
                            <a-button type="text" size="small" status="success" @click.stop="handleConfirmWarehouse(record, item)">
                              确认收货
                            </a-button>
                            <a-button type="text" size="small" status="danger" @click.stop="handleRejectWarehouse(record, item)">
                              拒绝
                            </a-button>
                          </div>
                        </template>
                        <template v-if="item.status === 'confirmed' && item.totalConfirmedQuantity > 0">
                          <div class="push-summary">
                            确认数量: <strong>{{ item.totalConfirmedQuantity }}</strong> 件
                            <a-link size="small" @click.stop="handleViewConfirmDetail(record, item)">
                              查看明细
                            </a-link>
                          </div>
                        </template>
                        <template v-if="item.status === 'rejected'">
                          <div class="push-reject-reason">
                            拒绝原因：{{ item.rejectReason || '未填写' }}
                          </div>
                        </template>
                      </div>
                    </div>
                  </template>
                </a-popover>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="计划状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" :width="160">
            <template #cell="{ record }">
              {{ record.createTime }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button 
                  v-if="record.status === 'draft'" 
                  type="text" 
                  size="small" 
                  @click="handleEdit(record)"
                >
                  编辑
                </a-button>
                <a-button 
                  v-if="record.status === 'draft'" 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handlePublish(record)"
                >
                  发布
                </a-button>
                <a-button 
                  v-if="record.status === 'published' || record.status === 'partial'" 
                  type="text" 
                  size="small"
                  @click="handlePushMore(record)"
                >
                  继续推送
                </a-button>
                <a-popconfirm 
                  v-if="record.status === 'draft'" 
                  content="确定要删除此计划吗？" 
                  @ok="handleDelete(record)"
                >
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
                <a-popconfirm 
                  v-if="record.status === 'published' || record.status === 'partial'" 
                  content="取消后已生成的采购单也将作废，确定吗？" 
                  @ok="handleCancel(record)"
                >
                  <a-button type="text" size="small" status="danger">取消计划</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="createVisible" 
      :title="isEdit ? '编辑采购计划' : '创建采购计划'" 
      :width="1000"
      :footer="false"
      unmount-on-close
    >
      <a-form :model="planForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="计划名称" required>
              <a-input v-model="planForm.planName" placeholder="请输入计划名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="计划说明">
          <a-textarea v-model="planForm.description" placeholder="请输入计划说明（选填）" :max-length="500" />
        </a-form-item>

        <a-divider>采购商品清单</a-divider>

        <div class="sku-toolbar">
          <a-button type="outline" @click="handleAddSku">
            <template #icon><icon-plus /></template>
            添加商品
          </a-button>
        </div>

        <a-table :data="planForm.skuList" :pagination="false" style="margin-top: 16px">
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
            <a-table-column title="商品名称" :width="200">
              <template #cell="{ record }">
                <div>{{ record.productName }}</div>
                <div class="sub-text">{{ record.specValues }}</div>
              </template>
            </a-table-column>
            <a-table-column title="单位" data-index="unit" :width="60" align="center" />
            <a-table-column title="建议采购量" :width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="record.quantity" 
                  :min="1" 
                  :max="99999"
                  style="width: 100%"
                />
              </template>
            </a-table-column>
            <a-table-column title="供货价" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ record.referencePrice }}
              </template>
            </a-table-column>
            <a-table-column title="预计金额" :width="100" align="right">
              <template #cell="{ record }">
                ¥{{ (record.quantity * record.referencePrice).toFixed(2) }}
              </template>
            </a-table-column>
            <a-table-column title="备注" :width="150">
              <template #cell="{ record }">
                <a-input v-model="record.remark" placeholder="备注" />
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="80" fixed="right">
              <template #cell="{ rowIndex }">
                <a-button 
                  type="text" 
                  size="small" 
                  status="danger"
                  @click="handleRemoveSku(rowIndex)"
                >
                  删除
                </a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <div class="form-footer">
          <div class="summary">
            <span>共 <strong>{{ planForm.skuList.length }}</strong> 个SKU</span>
            <span style="margin-left: 24px">
              预计总金额：<strong class="highlight">¥{{ totalEstimatedAmount }}</strong>
            </span>
          </div>
          <a-space>
            <a-button @click="createVisible = false">取消</a-button>
            <a-button type="primary" @click="handleSavePlan">
              {{ isEdit ? '保存' : '创建' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="skuSelectorVisible" 
      title="选择商品" 
      :width="1000"
      :footer="false"
    >
      <div class="sku-selector">
        <div class="selector-search">
          <a-input-search
            v-model="skuSearchKeyword"
            placeholder="搜索商品名称或SPU编码"
            style="width: 300px"
          />
          <a-select v-model="skuCategoryFilter" placeholder="选择分类" allow-clear style="width: 150px; margin-left: 12px">
            <a-option value="cement">水泥建材</a-option>
            <a-option value="steel">钢材钢筋</a-option>
            <a-option value="ceramic">陶瓷瓷砖</a-option>
            <a-option value="paint">涂料油漆</a-option>
          </a-select>
        </div>

        <div class="spu-list">
          <a-collapse
            v-model:active-keys="spuActiveKeys"
            :default-active-key="firstSpuKey"
            bordered
          >
            <a-collapse-item
              v-for="spu in filteredSpuList"
              :key="spu.spuId"
              :name="spu.spuId"
            >
              <template #header>
                <div class="spu-header">
                  <a-checkbox
                    :model-value="isSpuAllSelected(spu)"
                    :indeterminate="isSpuPartialSelected(spu)"
                    @change="(checked) => handleToggleSpuAll(spu, checked)"
                    @click.stop
                  />
                  <div class="spu-info">
                    <span class="spu-name">{{ spu.spuName }}</span>
                    <a-tag color="blue" size="small">{{ spu.categoryName }}</a-tag>
                    <span class="sku-count">
                      共 {{ spu.skuList.length }} 个SKU规格
                    </span>
                  </div>
                </div>
              </template>

              <a-table 
                :data="spu.skuList" 
                :pagination="false"
                size="small"
                row-key="skuId"
                :row-selection="getSkuRowSelection(spu)"
                :bordered="false"
              >
                <template #columns>
                  <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
                  <a-table-column title="规格信息" :width="280">
                    <template #cell="{ record }">
                      <div class="spec-values">
                        <a-tag 
                          v-for="(spec, idx) in record.specs" 
                          :key="idx"
                          size="small"
                          color="gray"
                          style="margin-right: 4px; margin-bottom: 4px"
                        >
                          {{ spec.name }}: {{ spec.value }}
                        </a-tag>
                      </div>
                    </template>
                  </a-table-column>
                  <a-table-column title="单位" data-index="unit" :width="60" align="center" />
                  <a-table-column title="参考价" :width="100" align="right">
                     <template #cell="{ record }">
                       <span class="price">¥{{ record.referencePrice }}</span>
                     </template>
                   </a-table-column>
                 </template>
               </a-table>
            </a-collapse-item>
          </a-collapse>
        </div>

        <div class="selector-footer">
          <span>已选择 <strong>{{ selectedSkuKeys.length }}</strong> 个SKU</span>
          <a-space>
            <a-button @click="skuSelectorVisible = false">取消</a-button>
            <a-button type="primary" :disabled="selectedSkuKeys.length === 0" @click="handleConfirmSku">
              确认添加
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="publishVisible" 
      title="发布采购计划" 
      :width="700"
      :footer="false"
      unmount-on-close
    >
      <a-alert type="info" style="margin-bottom: 16px">
        选择要推送的工程仓，计划将发送给选中的工程仓进行确认下单。
      </a-alert>

      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="计划编号">{{ currentPlan.planNo }}</a-descriptions-item>
        <a-descriptions-item label="计划名称">{{ currentPlan.planName }}</a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ currentPlan.skuCount }} 个</a-descriptions-item>
        <a-descriptions-item label="预计金额">¥{{ currentPlan.estimatedAmount?.toLocaleString() }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>选择工程仓仓库</a-divider>

      <div class="warehouse-selector">
        <div class="selector-header">
          <a-checkbox 
            :model-value="isAllWarehouseSelected"
            :indeterminate="isPartialWarehouseSelected"
            @change="handleSelectAllWarehouse"
          >
            全选
          </a-checkbox>
          <a-input-search
            v-model="warehouseSearchKeyword"
            placeholder="搜索工程仓/仓库"
            style="width: 200px"
          />
        </div>
        <div class="warehouse-list">
          <div 
            v-for="warehouseGroup in filteredWarehouseList" 
            :key="warehouseGroup.warehouseId" 
            class="warehouse-group"
          >
            <div class="warehouse-header">
              <span class="warehouse-name">{{ warehouseGroup.warehouseName }}</span>
              <span class="warehouse-desc">{{ warehouseGroup.warehouseDesc }}</span>
            </div>
            <div class="sub-warehouse-list">
              <div 
                v-for="sub in warehouseGroup.subWarehouses" 
                :key="sub.id" 
                class="warehouse-item"
                :class="{ 'is-selected': selectedWarehouseIds.includes(sub.id), 'is-pushed': isAlreadyPushed(sub.id) }"
                @click="handleToggleWarehouse(sub.id)"
              >
                <a-checkbox 
                  :model-value="selectedWarehouseIds.includes(sub.id)"
                  :disabled="isAlreadyPushed(sub.id)"
                  @click.stop
                />
                <div class="warehouse-info">
                  <span class="name">📦 {{ sub.name }}</span>
                  <span class="contact">{{ sub.address }}</span>
                </div>
                <a-tag v-if="isAlreadyPushed(sub.id)" color="arcoblue" size="small">已推送</a-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="publish-footer">
        <div class="selected-info">
          已选择 <strong>{{ selectableWarehouseCount }}</strong> 个工程仓
        </div>
        <a-space>
          <a-button @click="publishVisible = false">取消</a-button>
          <a-button type="primary" :disabled="selectedWarehouseIds.length === 0" @click="handleConfirmPublish">
            确认发布
          </a-button>
        </a-space>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="detailVisible" 
      title="采购计划详情" 
      :width="1100"
      :footer="false"
    >
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="计划编号">{{ currentPlan.planNo }}</a-descriptions-item>
        <a-descriptions-item label="计划名称">{{ currentPlan.planName }}</a-descriptions-item>
        <a-descriptions-item label="计划状态">
          <a-tag :color="getStatusColor(currentPlan.status)">
            {{ getStatusText(currentPlan.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ currentPlan.skuCount }} 个</a-descriptions-item>
        <a-descriptions-item label="预计金额">¥{{ currentPlan.estimatedAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentPlan.createTime }}</a-descriptions-item>
        <a-descriptions-item label="计划说明" :span="3">{{ currentPlan.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>推送工程仓状态</a-divider>

      <a-table :data="currentPlan.pushList || []" :pagination="false" style="margin-bottom: 16px">
        <template #columns>
          <a-table-column title="工程仓" :width="180">
            <template #cell="{ record }">
              <div>
                <div class="text-muted" style="font-size: 12px">{{ record.warehouseParentName }}</div>
                <div>{{ record.warehouseName }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPushStatusColor(record.status)">
                {{ getPushStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="确认汇总" :width="200">
            <template #cell="{ record }">
              <template v-if="record.status === 'confirmed'">
                <div style="font-size: 12px">
                  <span>SKU: </span>
                  <strong class="text-success">{{ record.confirmedItems?.length || 0 }}</strong>
                  <span style="margin: 0 8px">/</span>
                  <span>{{ currentPlan.skuList?.length || 0 }}</span>
                </div>
                <div style="font-size: 12px; margin-top: 4px">
                  <span>数量: </span>
                  <strong class="highlight">{{ record.totalConfirmedQuantity || 0 }}</strong>
                </div>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
          <a-table-column title="推送时间" data-index="pushTime" :width="160" />
          <a-table-column title="确认时间" :width="160">
            <template #cell="{ record }">
              {{ record.confirmTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button 
                v-if="record.status === 'confirmed'"
                type="text" 
                size="small" 
                @click="handleViewConfirmDetail(currentPlan, record)"
              >
                查看明细
              </a-button>
              <span v-else class="text-muted">-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider>采购商品清单</a-divider>

      <a-table :data="currentPlan.skuList || []" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="sub-text">{{ record.specValues }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="建议采购量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="供货价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.referencePrice }}
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.referencePrice).toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="150" />
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="confirmDetailVisible" 
      :title="`${currentConfirmWarehouse.warehouseParentName} - ${currentConfirmWarehouse.warehouseName} 确认明细`" 
      :width="1000"
      :footer="false"
    >
      <a-descriptions :column="3" bordered size="small">
        <a-descriptions-item label="所属工程仓">
          {{ currentConfirmWarehouse.warehouseParentName }}
        </a-descriptions-item>
        <a-descriptions-item label="确认仓库">
          {{ currentConfirmWarehouse.warehouseName }}
        </a-descriptions-item>
        <a-descriptions-item label="确认状态">
          <a-tag :color="getPushStatusColor(currentConfirmWarehouse.status)">
            {{ getPushStatusText(currentConfirmWarehouse.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="推送时间">
          {{ currentConfirmWarehouse.pushTime }}
        </a-descriptions-item>
        <a-descriptions-item label="确认时间">
          {{ currentConfirmWarehouse.confirmTime || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="确认总数量">
          <strong class="highlight">{{ currentConfirmWarehouse.totalConfirmedQuantity || 0 }}</strong> 件
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>确认商品明细</a-divider>

      <a-table :data="currentConfirmWarehouse.confirmedItems || []" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="sub-text">{{ record.specValues }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="计划采购量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.planQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="实际确认量" :width="100" align="right">
            <template #cell="{ record }">
              <span :class="record.confirmedQuantity < record.planQuantity ? 'text-warning' : 'text-success'">
                {{ record.confirmedQuantity }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="差异数量" :width="100" align="right">
            <template #cell="{ record }">
              <span class="text-danger">
                {{ record.planQuantity - record.confirmedQuantity }}
              </span>
            </template>
          </a-table-column>

        </template>
      </a-table>

      <div style="margin-top: 24px; text-align: right">
        <a-button @click="confirmDetailVisible = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    title: '1. 项目背景',
    content: `
**业务痛点：**
- 多仓库采购需求分散，缺乏统一汇总机制
- 人工邮件/微信传递采购需求，信息易丢失
- 采购执行进度黑盒，无法追踪各仓库确认状态
- 相同物料重复采购，导致库存积压和资金浪费

**解决目标：**
- 建立统一的采购计划汇总平台
- 实现计划从创建 → 推送 → 确认 → 执行的全链路可追溯
- 自动合并同类型物料采购需求，降低采购成本
- 各仓库确认状态可视化，异常自动预警

**模块定位：**
- 供应链的起点和入口
- 采购需求的统一收口
- 仓库与采购部门的协同枢纽
- 库存健康度的第一道防线

**与其他模块关系：**
- 上游：销售预测 / 安全库存预警
- 下游：采购订单 / 入库单 / 财务付款
    `
  },
  {
    title: '2. 用户对象',
    content: `
| 用户角色 | 特征 | 核心目标 | 使用频率 |
|---------|------|---------|---------|
| 采购经理 | 负责整体采购策略 | 宏观把控 + 成本优化 | 每日 3-5 次 |
| 采购专员 | 执行具体采购 | 确保计划按时执行 | 每日 10-15 次 |
| 仓库主管 | 各仓库负责人 | 按需确认 + 准时收货 | 每日 2-3 次 |
| 财务人员 | 预算和付款 | 预算控制 + 资金安排 | 每日 1-2 次 |
| 需求申请人 | 各部门人员 | 跟踪需求进度 | 每周 1-3 次 |
    `
  },
  {
    title: '3. 权限体系',
    content: `
### 3.1 功能权限矩阵

| 功能点 | 超管 | 采购经理 | 采购专员 | 仓库主管 | 财务 | 只读 |
|--------|------|---------|---------|---------|-----|------|
| 查看所有计划 | ✅ | ✅ | ✅ | 本仓库 | ✅ | ✅ |
| 创建计划 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 编辑计划 | ✅ | ✅ | 创建人 | ❌ | ❌ | ❌ |
| 发布计划 | ✅ | ✅ | 创建人 | ❌ | ❌ | ❌ |
| 取消计划 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 删除计划 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 推送仓库 | ✅ | ✅ | 创建人 | ❌ | ❌ | ❌ |
| 确认收货 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 导出报表 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 3.2 数据权限
- **采购专员**：仅可见自己创建的计划
- **仓库主管**：仅可见推送到本仓库的计划
- **采购经理/超管**：可见所有计划

### 3.3 操作权限
- 草稿状态：可编辑 / 可删除 / 可发布
- 已发布状态：可取消 / 可推送仓库
- 已推送状态：仓库可见，采购不可编辑
    `
  },
  {
    title: '4. 核心业务场景',
    content: `
### 场景 1：常规采购补货
- **触发条件**：系统基于安全库存自动生成采购建议
- **参与者**：采购专员
- **结果**：生成正式采购计划 → 推送给供应商

### 场景 2：多仓库集中采购
- **触发条件**：月初各仓库提交月度采购需求
- **参与者**：采购经理
- **结果**：合并相同 SKU 需求 → 集中采购议价

### 场景 3：紧急插单采购
- **触发条件**：工地突发缺货申请
- **参与者**：需求人 + 采购专员
- **结果**：绿色通道审批 → 24 小时内完成采购

### 场景 4：供应商分批送货
- **触发条件**：采购数量过大无法一次交付
- **参与者**：仓库主管 + 供应商
- **结果**：按批次确认收货，系统自动累计完成度

### 场景 5：计划变更取消
- **触发条件**：项目延期/取消导致采购需求变更
- **参与者**：采购经理
- **结果**：通知供应商取消 → 避免违约成本
    `
  },
  {
    title: '5. 业务逻辑图',
    content: `
\`\`\`mermaid
graph TD
    A[安全库存预警] --> B[创建采购计划草稿]
    C[人工申请] --> B
    B --> D[添加SKU明细]
    B --> E[选择目标仓库]
    D --> F[采购审核]
    E --> F
    F --> G{审核通过?}
    G -->|否| H[驳回修改]
    H --> B
    G -->|是| I[计划发布]
    I --> J[推送到目标仓库]
    J --> K{仓库确认?}
    K -->|确认| L[生成采购订单]
    K -->|拒绝| M[注明原因]
    M --> I
    L --> N[供应商送货]
    N --> O[仓库收货确认]
    O --> P{全部收货?}
    P -->|部分收货| N
    P -->|全部完成| Q[计划完成]
    R[紧急取消] --> S[计划作废]
    S --> T[通知供应商]
\`\`\`

**异常流程：**
- 计划作废 → 已生成的采购订单同步作废
- 仓库拒收 → 退回采购专员重新分配
- 超期未确认（>48小时）→ 自动提醒 + 升级
    `
  },
  {
    title: '6. 功能清单',
    content: `
| 模块 | 功能点 | 优先级 | 对应角色 |
|------|--------|-------|---------|
| 基础功能 | 计划列表查询 | P0 | 全员 |
| 基础功能 | 高级筛选搜索 | P0 | 全员 |
| 基础功能 | 计划详情查看 | P0 | 全员 |
| 计划管理 | 创建采购计划 | P0 | 采购 |
| 计划管理 | 编辑草稿计划 | P0 | 采购 |
| 计划管理 | 计划发布/取消 | P0 | 采购经理 |
| 计划管理 | 删除计划 | P2 | 超管 |
| 仓库协同 | 推送至指定仓库 | P0 | 采购 |
| 仓库协同 | 仓库确认/拒绝 | P0 | 仓库主管 |
| 仓库协同 | 收货进度可视化 | P1 | 全员 |
| 报表分析 | 计划导出Excel | P1 | 全员 |
| 报表分析 | 采购达成率统计 | P2 | 采购经理 |
    `
  },
  {
    title: '7. 功能详细说明',
    content: `
### 7.1 搜索筛选

| 筛选条件 | 组件类型 | 宽度 | 校验规则 |
|---------|---------|------|---------|
| 计划编号 | Input输入框 | 180px | 模糊匹配，支持 PLAN-xxx |
| 计划名称 | Input输入框 | 180px | 模糊匹配，最大20字 |
| 计划状态 | Select下拉框 | 140px | 单选：草稿/已发布/待确认/已确认/已完成/已取消 |
| 创建时间 | RangePicker | 280px | 默认最近30天 |
| 创建人 | Select人员 | 140px | 支持多选 |

### 7.2 表格列定义

| 列名 | 宽度 | 对齐 | 特殊处理 |
|------|------|-----|---------|
| 计划编号 | 150px | left | 蓝色可点击，跳转详情 |
| 计划名称 | 200px | left | 超长省略号 |
| SKU数量 | 100px | center | 显示 "N 个"，hover看明细 |
| 预计金额 | 120px | right | ¥ 前缀 + 千分位 |
| 目标仓库 | 180px | left | 悬浮显示仓库明细弹层 |
| 状态 | 120px | left | Tag 色彩标记 |
| 创建人 | 120px | left | 显示头像+姓名 |
| 创建时间 | 180px | left | YYYY-MM-DD HH:mm |
| 操作 | 220px | left | 固定右侧，根据状态显示按钮 |

### 7.3 交互说明
- 点击计划编号 → 打开计划详情页（新标签页）
- 点击目标仓库 → Popover 显示各子仓库确认状态
- 发布操作 → 二次确认弹窗，防止误操作
- 删除操作 → 只有草稿状态可删，已发布的需先取消
    `
  },
  {
    title: '8. Tag 色彩规范',
    content: `
| 状态值 | Tag颜色 | 含义 |
|--------|---------|------|
| 草稿 | gray | 未提交，可编辑 |
| 已发布 | blue | 采购审核通过，待推送 |
| 待确认 | gold | 已推送仓库，待收货确认 |
| 部分确认 | orange | 部分仓库已确认 |
| 全部确认 | green | 所有仓库已确认收货 |
| 已完成 | purple | 采购订单全部执行完毕 |
| 已取消 | red | 人工终止执行 |

**状态流转规则：**
- 草稿 → 已发布 → 待确认 → 已确认 → 已完成
- 草稿 → 已取消
- 已发布 → 已取消
    `
  },
  {
    title: '9. 非功能性要求',
    content: `
### 性能要求
- 列表加载时间 < 1 秒
- 支持 1000+ SKU 大计划流畅编辑
- 10000 条计划数据下筛选响应 < 500ms

### 安全要求
- 采购价格字段仅财务和采购可见
- 计划变更全程操作日志留痕
- 敏感操作（发布/取消）需二次确认

### 埋点要求
- plan_create 埋点：创建人、SKU数、预估金额
- plan_publish 埋点：发布人、审核时长
- warehouse_confirm 埋点：确认时效、是否拒绝
- plan_cancel 埋点：取消原因、取消时点

### 异常处理
- 推送失败自动重试 3 次
- 超 48 小时未确认自动发送企业微信提醒
- 预计金额超预算自动触发预警
    `
  }
]

const loading = ref(false)

const searchForm = reactive({
  planNo: '',
  planName: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const warehouseList = ref([
  { 
    warehouseId: 'WH001', 
    warehouseName: '深圳宝安工程仓', 
    warehouseDesc: '主营水泥、砂石料',
    subWarehouses: [
      { id: 'WH001-S01', name: '西乡主仓', address: '宝安区西乡街道1号' },
      { id: 'WH001-S02', name: '福永分仓', address: '宝安区福永街道2号' },
      { id: 'WH001-S03', name: '沙井应急仓', address: '宝安区沙井街道3号' },
    ]
  },
  { 
    warehouseId: 'WH002', 
    warehouseName: '广州天河工程仓', 
    warehouseDesc: '主营钢材、混凝土',
    subWarehouses: [
      { id: 'WH002-S01', name: '天河智慧城仓', address: '天河区智慧城园区A区' },
      { id: 'WH002-S02', name: '黄埔分仓', address: '黄埔区开发区B区' },
    ]
  },
  { 
    warehouseId: 'WH003', 
    warehouseName: '东莞南城工程仓', 
    warehouseDesc: '综合建材仓',
    subWarehouses: [
      { id: 'WH003-S01', name: '南城中心仓', address: '南城区CBD商圈旁' },
    ]
  },
])

const planList = ref([
  {
    id: '1',
    planNo: 'PO202401001',
    planName: '2024年1月建材采购计划',
    skuCount: 15,
    estimatedAmount: 125800,
    status: 'published',
    createTime: '2024-01-15 10:30:00',
    description: '本月常规建材补货计划',
    skuList: [
      { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', quantity: 100, referencePrice: 450 },
      { skuCode: 'SKU002', productName: '河沙（中粗）', specValues: '颗粒:中粗砂', unit: '方', quantity: 200, referencePrice: 180 },
      { skuCode: 'SKU003', productName: '碎石(5-20mm)', specValues: '粒径:5-20mm', unit: '方', quantity: 150, referencePrice: 120 },
    ],
    pushList: [
      { 
        warehouseId: 'WH001-S01', 
        warehouseParentName: '深圳宝安工程仓',
        warehouseName: '西乡主仓', 
        status: 'pending', 
        pushTime: '2024-01-15 14:00:00' 
      },
      { 
        warehouseId: 'WH002-S01', 
        warehouseParentName: '广州天河工程仓',
        warehouseName: '天河智慧城仓', 
        status: 'confirmed', 
        pushTime: '2024-01-15 14:00:00', 
        confirmTime: '2024-01-16 10:00:00', 
        orderNo: 'SO202401001', 
        actualAmount: 128500,
        totalConfirmedQuantity: 435,
        confirmedItems: [
          { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', planQuantity: 100, confirmedQuantity: 95, remark: '库存不足' },
          { skuCode: 'SKU002', productName: '河沙（中粗）', specValues: '颗粒:中粗砂', unit: '方', planQuantity: 200, confirmedQuantity: 200, remark: '' },
          { skuCode: 'SKU003', productName: '碎石(5-20mm)', specValues: '粒径:5-20mm', unit: '方', planQuantity: 150, confirmedQuantity: 140, remark: '缺货，下周补货' },
        ]
      }
    ]
  },
  {
    id: '2',
    planNo: 'PO202401002',
    planName: '春节前备货计划',
    skuCount: 28,
    estimatedAmount: 356000,
    status: 'partial',
    createTime: '2024-01-18 09:00:00',
    description: '',
    skuList: [
      { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', quantity: 100, referencePrice: 450 },
      { skuCode: 'SKU002', productName: '河沙（中粗）', specValues: '颗粒:中粗砂', unit: '方', quantity: 200, referencePrice: 180 },
    ],
    pushList: [
      { 
        warehouseId: 'WH001-S02', 
        warehouseParentName: '深圳宝安工程仓',
        warehouseName: '福永分仓', 
        status: 'confirmed', 
        pushTime: '2024-01-18 11:00:00', 
        confirmTime: '2024-01-19 15:30:00', 
        orderNo: 'SO202401002', 
        actualAmount: 362000,
        totalConfirmedQuantity: 290,
        confirmedItems: [
          { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', planQuantity: 100, confirmedQuantity: 95, remark: '缺货5吨' },
          { skuCode: 'SKU002', productName: '河沙（中粗）', specValues: '颗粒:中粗砂', unit: '方', planQuantity: 200, confirmedQuantity: 195, remark: '运输延迟' },
        ]
      },
      { warehouseId: 'WH003-S01', warehouseParentName: '东莞南城工程仓', warehouseName: '南城中心仓', status: 'pending', pushTime: '2024-01-18 11:00:00' },
    ]
  },
  {
    id: '3',
    planNo: 'PO202401003',
    planName: '新项目启动采购',
    skuCount: 42,
    estimatedAmount: 528000,
    status: 'confirmed',
    createTime: '2024-01-20 14:00:00',
    description: '',
    skuList: [
      { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', quantity: 100, referencePrice: 450 },
    ],
    pushList: [
      { 
        warehouseId: 'WH002-S02', 
        warehouseParentName: '广州天河工程仓',
        warehouseName: '黄埔分仓', 
        status: 'confirmed', 
        pushTime: '2024-01-20 16:00:00', 
        confirmTime: '2024-01-21 10:00:00', 
        orderNo: 'SO202401003', 
        actualAmount: 535000,
        totalConfirmedQuantity: 100,
        confirmedItems: [
          { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', planQuantity: 100, confirmedQuantity: 100, remark: '' },
        ]
      }
    ]
  },
  {
    id: '4',
    planNo: 'PO202401004',
    planName: '瓷砖补货计划',
    skuCount: 8,
    estimatedAmount: 45000,
    status: 'draft',
    createTime: '2024-01-22 09:30:00',
    description: '',
    pushList: []
  }
])

const filteredPlans = computed(() => {
  let result = planList.value
  if (searchForm.planNo) {
    result = result.filter(p => p.planNo.includes(searchForm.planNo))
  }
  if (searchForm.planName) {
    result = result.filter(p => p.planName.includes(searchForm.planName))
  }
  if (searchForm.status) {
    result = result.filter(p => p.status === searchForm.status)
  }
  return result
})

const createVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')

const planForm = reactive({
  planName: '',
  description: '',
  skuList: [] as any[]
})

const skuSelectorVisible = ref(false)
const skuSearchKeyword = ref('')
const skuCategoryFilter = ref('')
const selectedSkuKeys = ref<string[]>([])
const spuActiveKeys = ref<string[]>([])

const spuList = ref([
  {
    spuId: 'SPU001',
    spuCode: 'SPU001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥建材',
    skuList: [
      { 
        skuId: 'SKU001', 
        skuCode: 'SKU001', 
        productName: '普通硅酸盐水泥P.O42.5', 
        specs: [{ name: '强度等级', value: 'P.O42.5' }, { name: '包装', value: '50kg/袋' }],
        specValues: '50kg/袋',
        unit: '袋', 
        referencePrice: 28, 
        stock: 5000 
      },
      { 
        skuId: 'SKU001_2', 
        skuCode: 'SKU001_2', 
        productName: '普通硅酸盐水泥P.O52.5', 
        specs: [{ name: '强度等级', value: 'P.O52.5' }, { name: '包装', value: '50kg/袋' }],
        specValues: '50kg/袋',
        unit: '袋', 
        referencePrice: 35, 
        stock: 3000 
      },
      { 
        skuId: 'SKU001_3', 
        skuCode: 'SKU001_3', 
        productName: '普通硅酸盐水泥P.O42.5R', 
        specs: [{ name: '强度等级', value: 'P.O42.5R' }, { name: '包装', value: '50kg/袋' }],
        specValues: '50kg/袋',
        unit: '袋', 
        referencePrice: 30, 
        stock: 2000 
      }
    ]
  },
  {
    spuId: 'SPU002',
    spuCode: 'SPU002',
    spuName: '螺纹钢HRB400',
    categoryName: '钢材钢筋',
    skuList: [
      { 
        skuId: 'SKU002', 
        skuCode: 'SKU002', 
        productName: '螺纹钢HRB400', 
        specs: [{ name: '规格', value: 'Φ12mm' }, { name: '材质', value: 'HRB400' }],
        specValues: 'Φ12mm',
        unit: '吨', 
        referencePrice: 4200, 
        stock: 200 
      },
      { 
        skuId: 'SKU002_2', 
        skuCode: 'SKU002_2', 
        productName: '螺纹钢HRB400', 
        specs: [{ name: '规格', value: 'Φ16mm' }, { name: '材质', value: 'HRB400' }],
        specValues: 'Φ16mm',
        unit: '吨', 
        referencePrice: 4150, 
        stock: 150 
      },
      { 
        skuId: 'SKU002_3', 
        skuCode: 'SKU002_3', 
        productName: '螺纹钢HRB400', 
        specs: [{ name: '规格', value: 'Φ20mm' }, { name: '材质', value: 'HRB400' }],
        specValues: 'Φ20mm',
        unit: '吨', 
        referencePrice: 4100, 
        stock: 180 
      },
      { 
        skuId: 'SKU002_4', 
        skuCode: 'SKU002_4', 
        productName: '螺纹钢HRB400E', 
        specs: [{ name: '规格', value: 'Φ25mm' }, { name: '材质', value: 'HRB400E' }],
        specValues: 'Φ25mm',
        unit: '吨', 
        referencePrice: 4300, 
        stock: 80 
      }
    ]
  },
  {
    spuId: 'SPU003',
    spuCode: 'SPU003',
    spuName: '陶瓷抛光砖',
    categoryName: '陶瓷瓷砖',
    skuList: [
      { 
        skuId: 'SKU003', 
        skuCode: 'SKU003', 
        productName: '抛光砖', 
        specs: [{ name: '尺寸', value: '800×800mm' }, { name: '纹理', value: '米黄' }],
        specValues: '800×800mm',
        unit: '片', 
        referencePrice: 45, 
        stock: 3000 
      },
      { 
        skuId: 'SKU003_2', 
        skuCode: 'SKU003_2', 
        productName: '抛光砖', 
        specs: [{ name: '尺寸', value: '600×600mm' }, { name: '纹理', value: '米黄' }],
        specValues: '600×600mm',
        unit: '片', 
        referencePrice: 28, 
        stock: 5000 
      },
      { 
        skuId: 'SKU003_3', 
        skuCode: 'SKU003_3', 
        productName: '抛光砖', 
        specs: [{ name: '尺寸', value: '800×800mm' }, { name: '纹理', value: '白麻' }],
        specValues: '800×800mm',
        unit: '片', 
        referencePrice: 52, 
        stock: 2500 
      }
    ]
  },
  {
    spuId: 'SPU004',
    spuCode: 'SPU004',
    spuName: '建筑涂料',
    categoryName: '涂料油漆',
    skuList: [
      { 
        skuId: 'SKU004', 
        skuCode: 'SKU004', 
        productName: '内墙乳胶漆', 
        specs: [{ name: '容量', value: '20L/桶' }, { name: '系列', value: '净味' }],
        specValues: '20L/桶',
        unit: '桶', 
        referencePrice: 380, 
        stock: 150 
      },
      { 
        skuId: 'SKU004_2', 
        skuCode: 'SKU004_2', 
        productName: '内墙乳胶漆', 
        specs: [{ name: '容量', value: '5L/桶' }, { name: '系列', value: '竹炭' }],
        specValues: '5L/桶',
        unit: '桶', 
        referencePrice: 120, 
        stock: 300 
      },
      { 
        skuId: 'SKU005', 
        skuCode: 'SKU005', 
        productName: '防水涂料', 
        specs: [{ name: '容量', value: '18kg/桶' }, { name: '类型', value: 'JS聚合物' }],
        specValues: '18kg/桶',
        unit: '桶', 
        referencePrice: 260, 
        stock: 80 
      }
    ]
  },
  {
    spuId: 'SPU005',
    spuCode: 'SPU005',
    spuName: '装饰板材',
    categoryName: '建材',
    skuList: [
      { 
        skuId: 'SKU006', 
        skuCode: 'SKU006', 
        productName: '石膏板', 
        specs: [{ name: '尺寸', value: '1200×2400×9.5mm' }, { name: '类型', value: '普通' }],
        specValues: '1200×2400×9.5mm',
        unit: '张', 
        referencePrice: 35, 
        stock: 500 
      },
      { 
        skuId: 'SKU006_2', 
        skuCode: 'SKU006_2', 
        productName: '石膏板', 
        specs: [{ name: '尺寸', value: '1200×2400×12mm' }, { name: '类型', value: '耐火' }],
        specValues: '1200×2400×12mm',
        unit: '张', 
        referencePrice: 48, 
        stock: 200 
      }
    ]
  }
])

const filteredSpuList = computed(() => {
  let result = spuList.value
  if (skuSearchKeyword.value) {
    result = result.filter(spu => 
      spu.spuName.includes(skuSearchKeyword.value) ||
      spu.spuCode.includes(skuSearchKeyword.value) ||
      spu.skuList.some(sku => sku.productName.includes(skuSearchKeyword.value))
    )
  }
  if (skuCategoryFilter.value) {
    result = result.filter(spu => spu.categoryName === skuCategoryFilter.value)
  }
  return result
})

const firstSpuKey = computed(() => {
  return filteredSpuList.value[0]?.spuId || ''
})

function isSpuAllSelected(spu: any) {
  return spu.skuList.every((sku: any) => selectedSkuKeys.value.includes(sku.skuId))
}

function isSpuPartialSelected(spu: any) {
  const selectedCount = spu.skuList.filter((sku: any) => selectedSkuKeys.value.includes(sku.skuId)).length
  return selectedCount > 0 && selectedCount < spu.skuList.length
}

function handleToggleSpuAll(spu: any, checked: boolean) {
  const skuIds = spu.skuList.map((sku: any) => sku.skuId)
  if (checked) {
    const newKeys = [...new Set([...selectedSkuKeys.value, ...skuIds])]
    selectedSkuKeys.value = newKeys
  } else {
    selectedSkuKeys.value = selectedSkuKeys.value.filter(id => !skuIds.includes(id))
  }
}

function getSkuRowSelection(spu: any) {
  return {
    type: 'checkbox' as const,
    selectedRowKeys: selectedSkuKeys.value,
    onlyCurrent: false,
    onChange: (keys: string[]) => {
      const allSkuIds = spuList.value.flatMap(spu => spu.skuList.map((sku: any) => sku.skuId))
      selectedSkuKeys.value = keys.filter(key => allSkuIds.includes(key))
    }
  }
}

const totalEstimatedAmount = computed(() => {
  return planForm.skuList.reduce((sum, item) => sum + item.quantity * item.referencePrice, 0).toFixed(2)
})

const detailVisible = ref(false)
const confirmDetailVisible = ref(false)
const rejectVisible = ref(false)
const currentPlan = ref<any>({})
const currentConfirmWarehouse = ref<any>({})
const currentRejectWarehouse = ref<any>({})
const isWarehouseConfirming = ref(false)

const rejectForm = reactive({
  reason: ''
})

const publishVisible = ref(false)
const selectedWarehouseIds = ref<string[]>([])
const warehouseSearchKeyword = ref('')

const allSubWarehouses = computed(() => {
  return warehouseList.value.flatMap(g => g.subWarehouses)
})

const filteredWarehouseList = computed(() => {
  if (!warehouseSearchKeyword.value) return warehouseList.value
  return warehouseList.value.filter(g => {
    if (g.warehouseName.includes(warehouseSearchKeyword.value)) return true
    return g.subWarehouses.some(w => w.name.includes(warehouseSearchKeyword.value))
  })
})

const isAllWarehouseSelected = computed(() => {
  const selectable = allSubWarehouses.value.filter(w => !isAlreadyPushed(w.id))
  if (selectable.length === 0) return false
  return selectable.every(w => selectedWarehouseIds.value.includes(w.id))
})

const isPartialWarehouseSelected = computed(() => {
  const selectableIds = allSubWarehouses.value.filter(w => !isAlreadyPushed(w.id)).map(w => w.id)
  const selected = selectedWarehouseIds.value.filter(id => selectableIds.includes(id))
  return selected.length > 0 && selected.length < selectableIds.length
})

const selectableWarehouseCount = computed(() => {
  return selectedWarehouseIds.value.filter(id => !isAlreadyPushed(id)).length
})

function isAlreadyPushed(warehouseId: string) {
  return currentPlan.value.pushList?.some((p: any) => p.warehouseId === warehouseId)
}

function handleSelectAllWarehouse(checked: unknown) {
  if (checked) {
    selectedWarehouseIds.value = allSubWarehouses.value
      .filter(w => !isAlreadyPushed(w.id))
      .map(w => w.id)
  } else {
    selectedWarehouseIds.value = []
  }
}

function handleToggleWarehouse(warehouseId: string) {
  if (isAlreadyPushed(warehouseId)) return
  const index = selectedWarehouseIds.value.indexOf(warehouseId)
  if (index > -1) {
    selectedWarehouseIds.value.splice(index, 1)
  } else {
    selectedWarehouseIds.value.push(warehouseId)
  }
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.planNo = ''
  searchForm.planName = ''
  searchForm.status = ''
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  isEdit.value = false
  editId.value = ''
  planForm.planName = ''
  planForm.description = ''
  planForm.skuList = []
  createVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  editId.value = record.id
  planForm.planName = record.planName
  planForm.description = record.description || ''
  planForm.skuList = [
    { skuId: 'SKU001', skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', referencePrice: 28, quantity: 100, remark: '' },
    { skuId: 'SKU003', skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', referencePrice: 45, quantity: 500, remark: '优先选择广东品牌' }
  ]
  createVisible.value = true
}

function handleView(record: any) {
  currentPlan.value = {
    ...record,
    skuList: [
      { skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', referencePrice: 28, quantity: 100, remark: '' },
      { skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', referencePrice: 45, quantity: 500, remark: '优先选择广东品牌' },
      { skuCode: 'SKU004', productName: '内墙乳胶漆', specValues: '20L/桶', unit: '桶', referencePrice: 380, quantity: 20, remark: '' }
    ]
  }
  detailVisible.value = true
}

function handlePublish(record: any) {
  currentPlan.value = { ...record }
  selectedWarehouseIds.value = []
  warehouseSearchKeyword.value = ''
  publishVisible.value = true
}

function handlePushMore(record: any) {
  currentPlan.value = { ...record }
  selectedWarehouseIds.value = []
  warehouseSearchKeyword.value = ''
  publishVisible.value = true
}

function handleConfirmPublish() {
  if (selectedWarehouseIds.value.length === 0) {
    Message.warning('请选择至少一个仓库')
    return
  }

  const newPushList = selectedWarehouseIds.value.map(id => {
    const warehouse = allSubWarehouses.value.find(w => w.id === id)
    const warehouseGroup = warehouseList.value.find(g => 
      g.subWarehouses.some(w => w.id === id)
    )
    return {
      warehouseId: id,
      warehouseName: warehouse?.name || '',
      warehouseParentName: warehouseGroup?.warehouseName || '',
      status: 'pending',
      pushTime: new Date().toLocaleString(),
      confirmedItems: [],
      totalConfirmedQuantity: 0,
    }
  })

  if (!currentPlan.value.pushList) {
    currentPlan.value.pushList = []
  }
  currentPlan.value.pushList.push(...newPushList)
  currentPlan.value.status = 'published'

  Message.success(`已推送到 ${selectedWarehouseIds.value.length} 个仓库`)
  publishVisible.value = false
}

const totalConfirmingQuantity = computed(() => {
  return currentConfirmWarehouse.value.confirmedItems?.reduce((sum: number, item: any) => sum + (item.confirmedQuantity || 0), 0) || 0
})

function handleViewConfirmDetail(plan: any, warehouse: any) {
  isWarehouseConfirming.value = false
  if (warehouse.confirmedItems && warehouse.confirmedItems.length === 0) {
    warehouse.confirmedItems = [
      { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', planQuantity: 100, confirmedQuantity: 95, remark: '库存不足' },
      { skuCode: 'SKU002', productName: '河沙（中粗）', specValues: '颗粒:中粗砂', unit: '方', planQuantity: 200, confirmedQuantity: 200, remark: '' },
      { skuCode: 'SKU003', productName: '碎石(5-20mm)', specValues: '粒径:5-20mm', unit: '方', planQuantity: 150, confirmedQuantity: 140, remark: '缺货' },
    ]
    warehouse.totalConfirmedQuantity = 95 + 200 + 140
    warehouse.confirmTime = new Date().toLocaleString()
  }
  currentConfirmWarehouse.value = warehouse
  confirmDetailVisible.value = true
}

function handleConfirmWarehouse(plan: any, warehouse: any) {
  isWarehouseConfirming.value = true
  currentPlan.value = plan
  currentConfirmWarehouse.value = warehouse
  if (!warehouse.confirmedItems || warehouse.confirmedItems.length === 0) {
    warehouse.confirmedItems = (plan.skuList || []).map((sku: any) => ({
      skuCode: sku.skuCode,
      productName: sku.productName,
      specValues: sku.specValues,
      unit: sku.unit,
      planQuantity: sku.quantity,
      confirmedQuantity: sku.quantity,
      remark: ''
    }))
  }
  confirmDetailVisible.value = true
}

function handleSaveWarehouseConfirm() {
  currentConfirmWarehouse.value.status = 'confirmed'
  currentConfirmWarehouse.value.confirmTime = new Date().toLocaleString()
  currentConfirmWarehouse.value.totalConfirmedQuantity = totalConfirmingQuantity.value
  
  updatePlanStatus(currentPlan.value)
  
  Message.success('收货确认成功，已生成采购订单')
  confirmDetailVisible.value = false
}

function handleRejectWarehouse(plan: any, warehouse: any) {
  currentPlan.value = plan
  currentRejectWarehouse.value = warehouse
  rejectForm.reason = ''
  rejectVisible.value = true
}

function handleSaveReject() {
  if (!rejectForm.reason.trim()) {
    Message.warning('请填写拒绝原因')
    return
  }
  currentRejectWarehouse.value.status = 'rejected'
  currentRejectWarehouse.value.rejectReason = rejectForm.reason
  currentRejectWarehouse.value.rejectTime = new Date().toLocaleString()
  
  updatePlanStatus(currentPlan.value)
  
  Message.success('已拒绝，采购专员将收到通知')
  rejectVisible.value = false
}

function updatePlanStatus(plan: any) {
  if (!plan.pushList || plan.pushList.length === 0) return
  
  const statuses = plan.pushList.map((p: any) => p.status)
  const allConfirmed = statuses.every((s: string) => s === 'confirmed')
  const hasConfirmed = statuses.some((s: string) => s === 'confirmed')
  
  if (allConfirmed) {
    plan.status = 'confirmed'
  } else if (hasConfirmed) {
    plan.status = 'partial'
  }
}

function handleCancel(record: any) {
  record.status = 'cancelled'
  record.cancelTime = new Date().toLocaleString()
  Message.success('计划已取消，相关采购单已作废')
}

function handleDelete(record: any) {
  const index = planList.value.findIndex(p => p.id === record.id)
  if (index > -1) {
    planList.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handleAddSku() {
  selectedSkuKeys.value = []
  skuSearchKeyword.value = ''
  skuCategoryFilter.value = ''
  skuSelectorVisible.value = true
}

function handleConfirmSku() {
  const allSkuList = spuList.value.flatMap(spu => spu.skuList)
  const newSkus = allSkuList
    .filter(s => selectedSkuKeys.value.includes(s.skuId))
    .filter(s => !planForm.skuList.some(p => p.skuId === s.skuId))
    .map(s => ({
      ...s,
      quantity: 1,
      remark: ''
    }))
  
  planForm.skuList.push(...newSkus)
  selectedSkuKeys.value = []
  skuSelectorVisible.value = false
  Message.success(`已添加 ${newSkus.length} 个SKU`)
}

function handleRemoveSku(index: number) {
  planForm.skuList.splice(index, 1)
}

function handleSavePlan() {
  if (!planForm.planName) {
    Message.warning('请输入计划名称')
    return
  }
  if (planForm.skuList.length === 0) {
    Message.warning('请添加采购商品')
    return
  }

  if (isEdit.value) {
    Message.success('保存成功')
  } else {
    const newPlan = {
      id: Date.now().toString(),
      planNo: `PO${Date.now().toString().slice(-8)}`,
      planName: planForm.planName,
      skuCount: planForm.skuList.length,
      estimatedAmount: parseFloat(totalEstimatedAmount.value),
      status: 'draft',
      createTime: new Date().toLocaleString(),
      description: planForm.description,
      pushList: []
    }
    planList.value.unshift(newPlan)
    Message.success('创建成功，请发布到工程仓')
  }
  createVisible.value = false
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'gray',
    published: 'blue',
    partial: 'orange',
    confirmed: 'cyan',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    partial: '部分确认',
    confirmed: '全部确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

function getPushStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'green',
    rejected: 'red',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getPushStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return texts[status] || status
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.search-area {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.sku-toolbar {
  margin-bottom: 8px;
}

.push-count {
  color: rgb(var(--primary-6));
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.text-muted {
  color: var(--color-text-3);
}

.text-success {
  color: #00b42a;
}

.text-warning {
  color: #ff7d00;
}

.text-danger {
  color: #f53f3f;
}

.highlight {
  color: rgb(var(--primary-6));
  font-weight: 600;
}

.push-list {
  max-height: 200px;
  overflow-y: auto;
}

.push-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.push-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.parent-warehouse {
  display: block;
  font-size: 12px;
  color: var(--color-text-3);
}

.sub-warehouse {
  display: block;
  font-weight: 500;
}

.push-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  color: var(--color-text-2);
}

.warehouse-group {
  border-bottom: 1px solid var(--color-border);
}

.warehouse-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-fill-1);
  font-weight: 500;

  .warehouse-name {
    font-weight: 500;
  }

  .warehouse-desc {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.sub-warehouse-list {
  .warehouse-item {
    padding-left: 40px;
  }
}

.warehouse-selector {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-fill-1);
  border-bottom: 1px solid var(--color-border);
}

.warehouse-list {
  max-height: 300px;
  overflow-y: auto;
}

.warehouse-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--color-fill-1);
  }

  &.is-selected {
    background: rgb(var(--primary-1));
  }

  &.is-pushed {
    background: var(--color-fill-2);
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:last-child {
    border-bottom: none;
  }
}

.warehouse-info {
  flex: 1;

  .name {
    display: block;
    font-weight: 500;
  }

  .contact {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}

.publish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);

  .summary {
    color: var(--color-text-2);
    
    strong {
      color: var(--color-text-1);
      
      &.highlight {
        color: rgb(var(--primary-6));
        font-size: 18px;
      }
    }
  }
}

.selector-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.spu-list {
  margin-top: 16px;
  max-height: 500px;
  overflow-y: auto;

  :deep(.arco-collapse-item-header) {
    padding: 12px 16px;
  }

  :deep(.arco-collapse-item-content-box) {
    padding: 0 16px 16px;
  }
}

.spu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .spu-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;

    .spu-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-1);
    }

    .sku-count {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}

.spec-values {
  .arco-tag {
    display: inline-flex;
  }
}

.price {
  font-weight: 500;
  color: rgb(var(--danger-6));
}

.stock-low {
  color: rgb(var(--warning-6));
}

.push-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.push-reject-reason {
  padding: 8px 12px;
  background: #fff2f0;
  border-radius: 4px;
  color: #f53f3f;
  font-size: 12px;
  margin-top: 8px;
  line-height: 1.5;
}

.detail-header {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-2);
}

.detail-item .label {
  color: var(--color-text-3);
  margin-right: 8px;
}

.detail-item .value {
  font-weight: 500;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.confirm-summary {
  text-align: left;
  color: var(--color-text-2);
  flex: 1;
}

.confirm-summary strong {
  color: #00b42a;
  font-size: 18px;
}
</style>
