<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <template #title>
        <span>平台商品市场</span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="currentTab" type="button" @change="handleTabChange">
            <a-radio value="all">全部 ({{ totalCount }})</a-radio>
            <a-radio value="pending">待上架 ({{ pendingCount }})</a-radio>
            <a-radio value="online">已上架 ({{ onlineCount }})</a-radio>
            <a-radio value="offline">已下架 ({{ offlineCount }})</a-radio>
          </a-radio-group>
        </a-space>
      </template>

      <div class="product-layout">
        <div class="category-sidebar">
          <div class="tree-header">
            <span class="title">商品分类</span>
            <a-button type="text" size="small" @click="resetCategory">
              重置
            </a-button>
          </div>
          <a-input-search
            v-model="categorySearchKeyword"
            placeholder="搜索分类"
            style="margin-bottom: 12px"
            allow-clear
          />
          <a-tree
            :data="categoryTreeWithCount"
            :selected-keys="selectedCategoryKeys"
            :expanded-keys="expandedCategoryKeys"
            :field-names="{ key: 'categoryId', title: 'categoryName', children: 'children' }"
            block-node
            @select="handleCategorySelect"
          >
            <template #title="nodeData">
              <span class="category-name">{{ nodeData.categoryName }}</span>
              <span class="category-count">({{ nodeData.skuCount || 0 }})</span>
            </template>
          </a-tree>
        </div>
        <div class="product-content">
          <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/编码"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 180px"
            allow-clear
            :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          />
          <a-select v-model="searchForm.supplierId" placeholder="供应商" style="width: 160px" allow-clear>
            <a-option v-for="item in supplierList" :key="item.supplierId" :value="item.supplierId">
              {{ item.supplierName }}
            </a-option>
          </a-select>
          <a-select v-model="searchForm.supplyStatus" placeholder="供货状态" style="width: 120px" allow-clear>
            <a-option value="supplying">供货中</a-option>
            <a-option value="paused">暂停供货</a-option>
            <a-option value="stopped">已停货</a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button v-if="currentTab === 'pending' || currentTab === 'all'" type="primary" @click="handleImportProducts">
            <template #icon><icon-plus /></template>
            导入商品
          </a-button>
          <a-button v-if="currentTab === 'pending' || currentTab === 'all'" type="primary" :disabled="selectedKeys.length === 0" @click="handleBatchOnline">
            批量上架 ({{ selectedKeys.length }})
          </a-button>
          <a-button v-if="currentTab === 'online' || currentTab === 'all'" :disabled="selectedKeys.length === 0" @click="handleBatchOffline">
            批量下架 ({{ selectedKeys.length }})
          </a-button>
          <a-button v-if="currentTab === 'online' || currentTab === 'all'" :disabled="selectedKeys.length === 0" @click="handleBatchSetPrice">
            批量调价 ({{ selectedKeys.length }})
          </a-button>
          <a-button :disabled="selectedKeys.length === 0" @click="handleBatchSetPermission">
            批量设置权限 ({{ selectedKeys.length }})
          </a-button>
        </a-space>
      </div>

      <a-table
        :data="filteredProducts"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="商品信息" :width="300">
            <template #cell="{ record }">
              <div class="product-info">
                <a-image :src="record.mainImage" :width="60" :height="60" fit="cover" />
                <div class="product-detail">
                  <div class="product-name">{{ record.skuName }}</div>
                  <div class="product-code">{{ record.skuCode }}</div>
                  <div class="product-specs">
                    <a-tag v-for="(value, key) in record.specs" :key="key" size="small">{{ value }}</a-tag>
                  </div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="所属SPU" :width="150">
            <template #cell="{ record }">
              <div class="spu-info">
                <div class="spu-name">{{ record.spuName || '-' }}</div>
                <div v-if="record.spuCode" class="spu-code">{{ record.spuCode }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="历史采购量" :width="100" align="right">
            <template #cell="{ record }">
              <div class="stock-info">
                <span class="stock-value">{{ record.historyPurchaseCount ?? 0 }}</span>
                <span class="stock-unit">{{ record.unit || '件' }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供应商" :width="180">
            <template #cell="{ record }">
              <template v-if="record.suppliers && record.suppliers.length > 1">
                <a-popover trigger="hover">
                  <div class="multi-supplier">
                    <span>{{ record.suppliers.length }} 家供应商</span>
                    <a-tag size="small" color="green">最低 ¥{{ getMinSupplyPrice(record) }}</a-tag>
                  </div>
                  <template #content>
                    <div class="supplier-popover">
                      <div v-for="s in record.suppliers" :key="s.supplierId" class="supplier-item">
                        <span>{{ s.supplierName }}</span>
                        <span>¥{{ s.supplyPrice.toFixed(2) }}</span>
                        <a-tag :color="getSupplyStatusColor(s.supplyStatus)" size="small">
                          {{ getSupplyStatusText(s.supplyStatus) }}
                        </a-tag>
                      </div>
                    </div>
                  </template>
                </a-popover>
              </template>
              <template v-else>
                <div>
                  <div>{{ record.supplierName }}</div>
                  <div class="sub-text">供货价: ¥{{ record.supplyPrice?.toFixed(2) }}</div>
                </div>
              </template>
            </template>
          </a-table-column>
          <a-table-column title="供货状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="getSupplyStatusColor(record.supplyStatus)">
                {{ getSupplyStatusText(record.supplyStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="进入方式" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.autoToMarket === false ? 'orange' : 'green'" size="small">
                {{ record.autoToMarket === false ? '手动导入' : '自动进入' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="上架状态" :width="80">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.marketStatus === 'online'"
                @change="(val: boolean) => handleMarketStatusChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="可见工程仓" :width="120">
            <template #cell="{ record }">
              <template v-if="record.visibleWarehouses && record.visibleWarehouses.length > 0">
                <a-popover trigger="hover">
                  <a-tag color="blue" style="cursor: pointer">{{ record.visibleWarehouses.length }} 个工程仓</a-tag>
                  <template #content>
                    <div class="warehouse-popover">
                      <div v-for="w in record.visibleWarehouses" :key="w.id" class="warehouse-item">
                        {{ w.name }}
                      </div>
                    </div>
                  </template>
                </a-popover>
              </template>
              <a-tag v-else color="gray">全部可见</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="热门" :width="70">
            <template #cell="{ record }">
              <a-switch
                v-model="record.isHot"
                :disabled="record.marketStatus !== 'online'"
                @change="(val: boolean) => handleHotChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="推荐" :width="70">
            <template #cell="{ record }">
              <a-switch
                v-model="record.isRecommend"
                :disabled="record.marketStatus !== 'online'"
                @change="(val: boolean) => handleRecommendChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="排序" :width="80">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.sortWeight"
                size="small"
                :min="0"
                :disabled="record.marketStatus !== 'online'"
                @change="handleSortChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleSetPermission(record)">权限</a-button>
                <template v-if="record.marketStatus === 'pending'">
                  <a-button type="text" size="small" @click="handleSetPrice(record)">调价</a-button>
                  <a-button type="text" size="small" @click="handleOnline(record)">上架</a-button>
                  <a-button type="text" size="small" status="danger" @click="handleRemove(record)">移除</a-button>
                </template>
                <template v-else-if="record.marketStatus === 'online'">
                  <a-button type="text" size="small" @click="handleSetPrice(record)">调价</a-button>
                  <a-button type="text" size="small" @click="handleOffline(record)">下架</a-button>
                </template>
                <template v-else>
                  <a-button type="text" size="small" @click="handleOnline(record)">重新上架</a-button>
                </template>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
        </div>
      </div>
    </a-card>

    <a-modal
      v-model:visible="importVisible"
      title="从供货商品导入"
      :width="1000"
      :footer="false"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        选择已建立供货关系但未添加到商品市场的商品，导入后可进行上架操作。
      </a-alert>
      
      <div class="import-filter">
        <a-space>
          <a-input-search
            v-model="importSearchForm.keyword"
            placeholder="搜索商品名称/编码"
            style="width: 220px"
            @search="handleImportSearch"
          />
          <a-cascader
            v-model="importSearchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 160px"
            allow-clear
            :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          />
          <a-select v-model="importSearchForm.supplierId" placeholder="供应商" style="width: 140px" allow-clear>
            <a-option v-for="item in supplierList" :key="item.supplierId" :value="item.supplierId">
              {{ item.supplierName }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <span class="selected-count">已选 {{ importSelectedKeys.length }} 个商品</span>
          <a-button type="primary" :disabled="importSelectedKeys.length === 0" @click="handleConfirmImport">
            确认导入 ({{ importSelectedKeys.length }})
          </a-button>
        </a-space>
      </div>

      <a-table
        :data="importProductList"
        :loading="importLoading"
        :pagination="importPagination"
        :row-selection="importRowSelection"
        row-key="id"
        :scroll="{ y: 400 }"
        @page-change="handleImportPageChange"
      >
        <template #columns>
          <a-table-column title="商品信息" :width="280">
            <template #cell="{ record }">
              <div class="product-info">
                <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
                <div class="product-detail">
                  <div class="product-name">{{ record.skuName }}</div>
                  <div class="product-code">{{ record.skuCode }}</div>
                  <div class="product-specs">
                    <a-tag v-for="(value, key) in record.specs" :key="key" size="small">{{ value }}</a-tag>
                  </div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="供应商" :width="200">
            <template #cell="{ record }">
              <div class="supplier-info">
                <div v-for="s in record.suppliers" :key="s.supplierId" class="supplier-row">
                  <span class="supplier-name">{{ s.supplierName }}</span>
                  <span class="supplier-price">¥{{ s.supplyPrice.toFixed(2) }}</span>
                  <a-tag :color="getSupplyStatusColor(s.supplyStatus)" size="small">
                    {{ getSupplyStatusText(s.supplyStatus) }}
                  </a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供货价区间" :width="120">
            <template #cell="{ record }">
              <div v-if="record.suppliers && record.suppliers.length > 1">
                <div>¥{{ getMinSupplyPriceFromList(record.suppliers) }} - ¥{{ getMaxSupplyPriceFromList(record.suppliers) }}</div>
              </div>
              <div v-else-if="record.suppliers && record.suppliers.length === 1">
                ¥{{ record.suppliers[0].supplyPrice.toFixed(2) }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供货状态" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="isAllSupplying(record)" color="green">正常供货</a-tag>
              <a-tag v-else-if="hasSupplying(record)" color="orange">部分供货</a-tag>
              <a-tag v-else color="red">无供货</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal v-model:visible="onlineVisible" title="商品上架" :width="600" @ok="handleOnlineConfirm">
      <a-form :model="onlineForm" layout="vertical">
        <a-alert type="info" style="margin-bottom: 16px">
          将 <strong>{{ onlineProduct?.skuName }}</strong> 上架到商品市场
        </a-alert>
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="供应商数量">{{ onlineProduct?.suppliers?.length || 1 }} 家</a-descriptions-item>
          <a-descriptions-item label="最低供货价">¥{{ getMinSupplyPrice(onlineProduct) }}</a-descriptions-item>
        </a-descriptions>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设为热门商品">
              <a-switch v-model="onlineForm.isHot" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设为推荐商品">
              <a-switch v-model="onlineForm.isRecommend" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="商品标签">
          <a-select v-model="onlineForm.tags" placeholder="选择或输入标签" multiple allow-create>
            <a-option value="爆款">爆款</a-option>
            <a-option value="新品">新品</a-option>
            <a-option value="限时特价">限时特价</a-option>
            <a-option value="热销">热销</a-option>
            <a-option value="品质优选">品质优选</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序权重">
          <a-input-number v-model="onlineForm.sortWeight" :min="0" style="width: 100%" />
          <div class="form-tip">数值越大排序越靠前</div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="priceVisible" title="调整价格" :width="700" @ok="handlePriceConfirm">
      <a-form :model="priceForm" layout="vertical">
        <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="商品名称">{{ priceProduct?.skuName }}</a-descriptions-item>
          <a-descriptions-item label="商品编码">{{ priceProduct?.skuCode }}</a-descriptions-item>
        </a-descriptions>
        
        <a-divider>供应商价格调整</a-divider>
        
        <a-table :data="priceProduct?.suppliers || []" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="供应商" :width="150">
              <template #cell="{ record }">
                <div>{{ record.supplierName }}</div>
                <a-tag v-if="record.supplyStatus === 'supplying'" color="green" size="small">供货中</a-tag>
                <a-tag v-else-if="record.supplyStatus === 'paused'" color="orange" size="small">暂停供货</a-tag>
                <a-tag v-else color="red" size="small">停止供货</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="当前供货价" :width="120" align="right">
              <template #cell="{ record }">
                <span class="price">¥{{ record.supplyPrice.toFixed(2) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="新供货价" :width="150">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="priceForm.supplierPrices[record.supplierId]"
                  :min="0"
                  :precision="2"
                  placeholder="请输入"
                  size="small"
                  style="width: 100%"
                >
                  <template #prefix>¥</template>
                </a-input-number>
              </template>
            </a-table-column>
            <a-table-column title="调价幅度">
              <template #cell="{ record }">
                <span v-if="priceForm.supplierPrices[record.supplierId]">
                  <span v-if="priceForm.supplierPrices[record.supplierId] > record.supplyPrice" class="price-up">
                    +¥{{ (priceForm.supplierPrices[record.supplierId] - record.supplyPrice).toFixed(2) }}
                    (+{{ ((priceForm.supplierPrices[record.supplierId] - record.supplyPrice) / record.supplyPrice * 100).toFixed(1) }}%)
                  </span>
                  <span v-else-if="priceForm.supplierPrices[record.supplierId] < record.supplyPrice" class="price-down">
                    -¥{{ (record.supplyPrice - priceForm.supplierPrices[record.supplierId]).toFixed(2) }}
                    (-{{ ((record.supplyPrice - priceForm.supplierPrices[record.supplierId]) / record.supplyPrice * 100).toFixed(1) }}%)
                  </span>
                  <span v-else class="price-same">无变化</span>
                </span>
                <span v-else class="no-change">-</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
        
        <a-form-item label="调价原因" required style="margin-top: 16px">
          <a-textarea v-model="priceForm.reason" placeholder="请输入调价原因" :max-length="200" />
        </a-form-item>
        <a-alert type="warning">调价申请需要审批通过后才会生效</a-alert>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="batchPriceVisible" title="批量调价" :width="600" @ok="handleBatchPriceConfirm">
      <a-form :model="batchPriceForm" layout="vertical">
        <a-alert type="info" style="margin-bottom: 16px">
          已选择 <strong>{{ selectedProducts.length }}</strong> 个商品进行批量调价
        </a-alert>
        <a-form-item label="调价方式" required>
          <a-radio-group v-model="batchPriceForm.type" type="button">
            <a-radio value="fixed">固定价格</a-radio>
            <a-radio value="percent">百分比调整</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="batchPriceForm.type === 'fixed'" label="设置价格" required>
          <a-input-number 
            v-model="batchPriceForm.fixedPrice" 
            :min="0" 
            :precision="2"
            placeholder="请输入价格"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
          <div class="form-tip">所有选中商品将设置为该价格</div>
        </a-form-item>
        <a-form-item v-if="batchPriceForm.type === 'percent'" label="调整比例" required>
          <a-input-number 
            v-model="batchPriceForm.percent" 
            :min="-100"
            :max="500"
            :precision="1"
            placeholder="请输入调整比例"
            style="width: 100%"
          >
            <template #suffix>%</template>
          </a-input-number>
          <div class="form-tip">
            正数为涨价，负数为降价。例如：输入10表示涨价10%，输入-10表示降价10%
          </div>
        </a-form-item>
        <a-form-item label="调价原因" required>
          <a-textarea v-model="batchPriceForm.reason" placeholder="请输入调价原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="offlineVisible" title="商品下架" :width="500" @ok="handleOfflineConfirm">
      <a-alert type="warning" style="margin-bottom: 16px">
        下架后，该商品将不在商品市场展示，工程仓将无法采购此商品。
      </a-alert>
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="商品名称">{{ offlineProduct?.skuName }}</a-descriptions-item>
      </a-descriptions>
      <a-form :model="offlineForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="下架原因" required>
          <a-textarea v-model="offlineForm.reason" placeholder="请输入下架原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="permissionVisible" title="设置商品可见权限" :width="700" @ok="handlePermissionConfirm">
      <div class="permission-header">
        <a-alert type="info" style="margin-bottom: 16px">
          设置商品对工程仓的可见权限，未设置的工程仓将无法看到该商品
        </a-alert>
        <template v-if="permissionProduct">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="商品名称">{{ permissionProduct.skuName }}</a-descriptions-item>
            <a-descriptions-item label="SKU编码">{{ permissionProduct.skuCode }}</a-descriptions-item>
          </a-descriptions>
        </template>
        <template v-else-if="selectedProducts.length > 0">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="已选商品">{{ selectedProducts.length }} 个</a-descriptions-item>
          </a-descriptions>
        </template>
      </div>

      <a-divider />

      <div class="permission-config">
        <div class="config-header">
          <span class="config-title">选择可见工程仓</span>
          <a-space>
            <a-button type="text" size="small" @click="handleSelectAllWarehouses">全选</a-button>
            <a-button type="text" size="small" @click="handleClearWarehouses">清空</a-button>
          </a-space>
        </div>

        <a-transfer
          v-model="selectedWarehouseIds"
          :data="warehouseList"
          :title-items="['可选工程仓', '已选工程仓']"
          show-search
          :search-placeholder="'搜索工程仓'"
        />
      </div>

      <div class="permission-tip">
        <icon-info-circle /> 提示：不选择任何工程仓表示全部工程仓可见
      </div>
    </a-modal>

    <a-drawer
      v-model:visible="detailVisible"
      title="商品详情"
      :width="720"
      :footer="false"
    >
      <template v-if="detailProduct">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="SKU编码">{{ detailProduct.skuCode }}</a-descriptions-item>
          <a-descriptions-item label="SKU名称">{{ detailProduct.skuName }}</a-descriptions-item>
          <a-descriptions-item label="所属SPU">{{ detailProduct.spuName }}</a-descriptions-item>
          <a-descriptions-item label="分类">{{ detailProduct.categoryName }}</a-descriptions-item>
          <a-descriptions-item label="规格" :span="2">
            <a-tag v-for="(value, key) in detailProduct.specs" :key="key">{{ key }}: {{ value }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="市场状态">
            <a-tag :color="getMarketStatusColor(detailProduct.marketStatus)">
              {{ getMarketStatusText(detailProduct.marketStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="上架时间">{{ detailProduct.onlineAt || '-' }}</a-descriptions-item>
          <a-descriptions-item label="热门商品">
            <a-tag :color="detailProduct.isHot ? 'red' : 'gray'">
              {{ detailProduct.isHot ? '是' : '否' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="推荐商品">
            <a-tag :color="detailProduct.isRecommend ? 'green' : 'gray'">
              {{ detailProduct.isRecommend ? '是' : '否' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="商品标签" :span="2">
            <a-tag v-for="tag in detailProduct.tags" :key="tag" color="arcoblue">{{ tag }}</a-tag>
            <span v-if="!detailProduct.tags?.length">无</span>
          </a-descriptions-item>
          <a-descriptions-item label="可见工程仓" :span="2">
            <template v-if="detailProduct.visibleWarehouses && detailProduct.visibleWarehouses.length > 0">
              <a-tag v-for="w in detailProduct.visibleWarehouses" :key="w.id" color="blue">{{ w.name }}</a-tag>
            </template>
            <span v-else>全部工程仓可见</span>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>供应商信息 ({{ detailProduct.suppliers?.length || 0 }} 家)</a-divider>

        <a-table :data="detailProduct.suppliers" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="供应商" data-index="supplierName" />
            <a-table-column title="供货价" :width="100">
              <template #cell="{ record }">
                ¥{{ record.supplyPrice?.toFixed(2) }}
              </template>
            </a-table-column>
            <a-table-column title="最小起订量" :width="100">
              <template #cell="{ record }">
                {{ record.minOrderQty || '-' }} {{ detailProduct.unit }}
              </template>
            </a-table-column>
            <a-table-column title="供货周期" :width="80">
              <template #cell="{ record }">
                {{ record.leadTime || '-' }} 天
              </template>
            </a-table-column>
            <a-table-column title="供货状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getSupplyStatusColor(record.supplyStatus)" size="small">
                  {{ getSupplyStatusText(record.supplyStatus) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="优先级" :width="80">
              <template #cell="{ record }">
                {{ record.priority }}
              </template>
            </a-table-column>
          </template>
        </a-table>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    title: '1. 项目背景',
    content: `
**业务痛点：**
- 选品池与销售池未隔离，上架商品质量参差不齐
- 商品对所有工程仓可见，无法进行区域化运营
- 上下架操作无留痕，无法追溯运营决策过程
- 商品调价无审批，价格变动对采购影响大

**解决目标：**
- 建立"待上架 -> 已上架 -> 已下架"全生命周期流程
- 实现商品级可见权限控制，支持精细化运营
- 运营操作全程留痕，支持审计回溯
- 价格变动与采购计划联动，风险可控

**模块定位：**
- 连接供货体系与工程仓采购的核心枢纽
- 平台运营侧商品的唯一发版入口
- 工程仓侧商品可见范围的管控中心
- 商品定价策略的执行落地页
    `
  },
  {
    title: '2. 用户对象',
    content: `
| 用户角色 | 岗位 | 核心职责 |
|---------|------|---------|
| **选品专员** | 供应链 | 从供货池导入商品进入市场待上架 |
| **运营主管** | 运营部 | 商品上架/下架审批、批量调价 |
| **区域运营** | 运营部 | 设置区域商品可见权限 |
| **工程仓** | 采购 | 浏览市场商品、下单采购 |

**典型用户画像：**

**1. 选品专员（王选品）**
- 每日新增供货SKU约50-80个
- 从中筛选约30%进入市场
- 需验证供货价、库存、起订量等核心指标

**2. 运营主管（张运营）**
- 每日上架审批20个商品
- 每周执行1-2次批量调价
- 关注爆款商品价格竞争力

**3. 区域运营（李区域）**
- 管理3-5个区域工程仓
- 根据区域特性调整商品可见性
- 不同区域差异化供货策略
    `
  },
  {
    title: '3. 权限系统',
    content: `
**功能权限矩阵：**

| 操作 | 选品专员 | 运营主管 | 区域运营 | 工程仓 |
|-----|---------|---------|---------|-------|
| 导入商品 | ✅ | ✅ | ❌ | ❌ |
| 上架/下架 | ❌ | ✅ | ❌ | ❌ |
| 批量调价 | ❌ | ✅ | ❌ | ❌ |
| 设置权限 | ❌ | ❌ | ✅ | ❌ |
| 浏览商品 | ✅ | ✅ | ✅ | ✅ |
| 导出商品 | ✅ | ✅ | ✅ | ✅ |

**数据权限：**

| 角色 | 数据范围 |
|-----|---------|
| 选品专员 | 仅可见已导入商品 |
| 运营主管 | 全平台所有商品 |
| 区域运营 | 仅可见负责区域商品 |
| 工程仓 | 仅可见授权商品 |

**字段权限：**

| 字段 | 运营 | 工程仓 |
|-----|-------|------|
| 供货价 | 可见 | 不可见 |
| 历史价格 | 可见 | 不可见 |
| 底价区间 | 可见 | 不可见 |
| 建议售价 | 可见 | 可见 |
    `
  },
  {
    title: '4. 核心业务场景',
    content: `
**场景一：商品上架全流程**
\`\`\`
1. 供货关系建立（供应商管理）
2. ↓
3. 自动进入【待上架】池（或运营手动导入）
4. ↓
5. 运营审核（验证价格、库存、品质）
6. ↓
7. 设置可见工程仓权限
8. ↓
9. 【已上架】→ 工程仓可见
\`\`\`

**场景二：价格变动处理**
\`\`\`
供应商提价申请
    ↓
平台审核调价幅度
    ↓
├─ 涨价 > 5% → 预警给关联采购计划
└─ 正常调价 → 更新商品市场价
    ↓
价格历史记录生成
\`\`\`

**场景三：区域化运营**
\`\`\`
北京区域 → 防冻型建材优先展示
上海区域 → 环保型建材优先展示
广州区域 → 防潮型建材优先展示
每个区域仅可见对应分类商品
\`\`\`
    `
  },
  {
    title: '5. 业务逻辑图',
    content: `
<a href="javascript:void(0)" onclick="window.renderFlowchart && window.renderFlowchart('graph TD
A[供货管理] --> B{满足自动上架条件?}
B -->|是| C[待上架池]
B -->|否| D[供货商品库]
D -->|运营导入| C
C -->|运营上架审核| E{审核通过?}
E -->|通过| F[设置可见权限]
F --> G[已上架 - 工程仓可见]
E -->|驳回| H[退回待上架 - 标注原因]
G -->|运营下架| I[已下架]
I -->|重新上架| C
J[批量调价] --> K{涨价幅度 > 5%?}
K -->|是| L[预警采购计划]
K -->|否| M[更新价格]
L --> M
M --> N[生成价格历史]
')">📊 点击查看完整业务流程图</a>
    `
  },
  {
    title: '6. 功能清单',
    content: `
| 功能模块 | 子功能 | 优先级 |
|---------|-------|-------|
| **商品生命周期** | 四状态tab页签 | P0 |
| | 待上架商品导入 | P0 |
| | 上架/下架二次确认 | P0 |
| | 上下架原因留痕 | P1 |
| **批量操作** | 批量上架 | P0 |
| | 批量下架 | P0 |
| | 批量调价 | P0 |
| | 批量设置权限 | P0 |
| **权限管控** | 商品级可见范围设置 | P0 |
| | 穿梭框选择工程仓 | P0 |
| | 全选/清空快捷操作 | P1 |
| **搜索筛选** | 分类树状筛选 | P0 |
| | 供应商筛选 | P0 |
| | 供货状态筛选 | P0 |
| | 关键词搜索 | P0 |
    `
  },
  {
    title: '7. 功能详细说明',
    content: `
**7.1 四状态视图**

| Tab | 定义 | 核心操作 |
|-----|------|---------|
| **全部** | 所有商品 | 查询、批量操作 |
| **待上架** | 已建立供货但未上架 | 导入、批量上架 |
| **已上架** | 工程仓可见 | 下架、调价、设权限 |
| **已下架** | 历史下架商品 | 重新上架 |

**7.2 导入商品三步法：**

1. **勾选**：从供货池选择满足条件商品
2. **预览**：确认商品数量、价格区间
3. **确认**：批量进入待上架池

**7.3 上架校验规则：**
- ✅ 至少 1 家供应商处于「供货中」
- ✅ 市场定价 > 0
- ✅ 最小起订量已设置
- ✅ 分类已关联

**7.4 价格预警规则：**
- 单次涨价 > 5% → 红色预警
- 30天内累计涨价 > 10% → 强预警
- 影响进行中的采购计划 → 消息通知
    `
  },
  {
    title: '8. Tag色彩规范',
    content: `
| 状态 | 色彩值 | Tag文字 |
|-----|-------|--------|
| ✅ **已上架** | green | #00b42a |
| ⏳ **待上架** | orange | #ff7d00 |
| ⛔ **已下架** | red | #f53f3f |
| 🔥 **热门商品** | red | #f53f3f |
| ⭐ **推荐商品** | green | #00b42a |
| 🏭 **供应商A类** | red | #f53f3f |
| 🏭 **供应商B类** | orange | #ff7d00 |
| 🏭 **供应商C类** | green | #00b42a |

**按钮色彩规范：**

| 操作 | 按钮类型 | 色彩 |
|-----|---------|------|
| 导入商品 | primary | 蓝色 #165dff |
| 上架 | primary | 蓝色 #165dff |
| 下架 | danger | 红色 #f53f3f |
| 批量调价 | default | 白色边框 |
| 设置权限 | default | 白色边框 |
    `
  },
  {
    title: '9. 非功能性需求',
    content: `
**性能要求：**
- 商品列表加载 < 1.5s
- 分类树加载 < 1s
- 支持 10000+ 商品流畅滚动
- 批量操作 100 条 < 3s

**数据安全：**
- 所有批量操作必须留痕（操作人、时间、原因）
- 价格变动日志永久保存，支持审计
- 上下架历史记录至少保留1年
- 敏感字段（供货价）权限严格控制

**异常处理：**
- 上架时供应商突然停货 → 中止 + 提示
- 批量操作部分失败 → 显示成功/失败清单
- 调价触发预警 → 弹窗确认是否继续
    `
  }
]

interface ProductCategory {
  categoryId: string
  categoryName: string
  children?: ProductCategory[]
  skuCount?: number
}

interface SupplierInfo {
  supplierId: string
  supplierName: string
  supplyPrice: number
  supplyStatus: 'supplying' | 'paused' | 'stopped'
  estimatedStock?: number
  minOrderQty?: number
  leadTime?: number
  priority: number
}

interface MarketProduct {
  id: string
  skuId: string
  skuCode: string
  skuName: string
  spuId: string
  spuName: string
  spuCode?: string
  categoryName: string
  specs: Record<string, string>
  mainImage?: string
  unit: string
  purchaseStock?: number
  supplierId: string
  supplierName: string
  supplyPrice: number
  supplyStatus: 'supplying' | 'paused' | 'stopped'
  marketStatus: 'pending' | 'online' | 'offline'
  autoToMarket?: boolean
  marketPrice?: number
  priceStatus?: 'pending' | 'approved' | 'rejected'
  isHot: boolean
  isRecommend: boolean
  tags: string[]
  sortWeight: number
  onlineAt?: string
  suppliers?: SupplierInfo[]
  visibleWarehouses?: { id: string; name: string }[]
}

interface ImportProduct {
  id: string
  skuId: string
  skuCode: string
  skuName: string
  spuId: string
  spuName: string
  categoryName: string
  specs: Record<string, string>
  mainImage?: string
  unit: string
  autoToMarket?: boolean
  suppliers: SupplierInfo[]
}

const currentTab = ref('all')
const loading = ref(false)
const selectedKeys = ref<string[]>([])

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  supplierId: undefined as string | undefined,
  supplyStatus: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const categorySearchKeyword = ref('')
const selectedCategoryKeys = ref<string[]>([])
const expandedCategoryKeys = ref<string[]>(['C01', 'C02', 'C03', 'C04', 'C05'])

const categoryTree = ref<ProductCategory[]>([
  {
    categoryId: 'C01',
    categoryName: '水泥',
    children: [
      { categoryId: 'C0101', categoryName: '硅酸盐水泥' },
      { categoryId: 'C0102', categoryName: '普通硅酸盐水泥' },
      { categoryId: 'C0103', categoryName: '复合硅酸盐水泥' },
    ],
  },
  {
    categoryId: 'C02',
    categoryName: '钢材',
    children: [
      { categoryId: 'C0201', categoryName: '螺纹钢' },
      { categoryId: 'C0202', categoryName: '线材' },
      { categoryId: 'C0203', categoryName: '盘螺' },
    ],
  },
  {
    categoryId: 'C03',
    categoryName: '砂石',
    children: [
      { categoryId: 'C0301', categoryName: '黄砂' },
      { categoryId: 'C0302', categoryName: '碎石' },
      { categoryId: 'C0303', categoryName: '瓜子片' },
    ],
  },
  {
    categoryId: 'C04',
    categoryName: '混凝土',
    children: [
      { categoryId: 'C0401', categoryName: '商品混凝土' },
      { categoryId: 'C0402', categoryName: '预制构件' },
    ],
  },
  {
    categoryId: 'C05',
    categoryName: '砌体材料',
    children: [
      { categoryId: 'C0501', categoryName: '加气块' },
      { categoryId: 'C0502', categoryName: '标准砖' },
    ],
  },
])

const categoryTreeWithCount = computed(() => {
  const countByCategory: Record<string, number> = {}
  filteredProducts.value.forEach((p) => {
    const categoryName = p.categoryName
    countByCategory[categoryName] = (countByCategory[categoryName] || 0) + 1
  })

  function addCountToTree(nodes: ProductCategory[]): ProductCategory[] {
    return nodes.map((node) => {
      let skuCount = 0
      if (node.children && node.children.length > 0) {
        const childrenWithCount = addCountToTree(node.children)
        skuCount = childrenWithCount.reduce((sum, n) => sum + ((n as any).skuCount || 0), 0)
        return {
          ...node,
          children: childrenWithCount,
          skuCount,
        }
      }
      skuCount = countByCategory[node.categoryName] || 0
      return {
        ...node,
        skuCount,
      }
    })
  }

  return addCountToTree(categoryTree.value)
})

function handleCategorySelect(keys: string[]) {
  selectedCategoryKeys.value = keys
  searchForm.categoryId = keys.length > 0 ? keys : undefined
  handleSearch()
}

function resetCategory() {
  selectedCategoryKeys.value = []
  searchForm.categoryId = undefined
  handleSearch()
}

const supplierList = ref<{ supplierId: string; supplierName: string }[]>([
  { supplierId: 's001', supplierName: '华新水泥供应商' },
  { supplierId: 's002', supplierName: '海螺水泥供应商' },
  { supplierId: 's003', supplierName: '宝钢供应商' },
  { supplierId: 's004', supplierName: '南方建材供应商' },
])

const importVisible = ref(false)
const importLoading = ref(false)
const importSelectedKeys = ref<string[]>([])
const importSearchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  supplierId: undefined as string | undefined,
})
const importPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const onlineVisible = ref(false)
const onlineProduct = ref<MarketProduct | null>(null)
const onlineForm = reactive({
  isHot: false,
  isRecommend: false,
  tags: [] as string[],
  sortWeight: 0,
})

const priceVisible = ref(false)
const priceProduct = ref<MarketProduct | null>(null)
const priceForm = reactive({
  supplierPrices: {} as Record<string, number>,
  reason: '',
})

const batchPriceVisible = ref(false)
const batchPriceForm = reactive({
  type: 'fixed',
  fixedPrice: 0,
  percent: 0,
  reason: '',
})

const offlineVisible = ref(false)
const offlineProduct = ref<MarketProduct | null>(null)
const offlineForm = reactive({
  reason: '',
})

const permissionVisible = ref(false)
const permissionProduct = ref<MarketProduct | null>(null)
const selectedWarehouseIds = ref<string[]>([])
const warehouseList = ref([
  { value: 'w1', label: '华东工程仓' },
  { value: 'w2', label: '南京工程仓' },
  { value: 'w3', label: '苏州工程仓' },
  { value: 'w4', label: '杭州工程仓' },
  { value: 'w5', label: '合肥工程仓' },
  { value: 'w6', label: '上海工程仓' },
])

const detailVisible = ref(false)
const detailProduct = ref<MarketProduct | null>(null)

const mockProducts = ref<MarketProduct[]>([
  {
    id: 'mp001',
    skuId: 'sku001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    spuId: 'spu001',
    spuName: '普通硅酸盐水泥',
    spuCode: 'SPU-SN-001',
    categoryName: '水泥',
    specs: { '强度等级': '42.5' },
    mainImage: 'https://picsum.photos/200/200?random=1',
    unit: '吨',
    purchaseStock: 500,
    supplierId: 's001',
    supplierName: '华新水泥供应商',
    supplyPrice: 420,
    supplyStatus: 'supplying',
    marketStatus: 'pending',
    autoToMarket: true,
    isHot: false,
    isRecommend: false,
    tags: [],
    sortWeight: 0,
    suppliers: [
      { supplierId: 's001', supplierName: '华新水泥供应商', supplyPrice: 420, supplyStatus: 'supplying', estimatedStock: 500, minOrderQty: 10, leadTime: 3, priority: 1 },
      { supplierId: 's002', supplierName: '海螺水泥供应商', supplyPrice: 415, supplyStatus: 'supplying', estimatedStock: 300, minOrderQty: 20, leadTime: 5, priority: 2 },
    ],
    visibleWarehouses: [
      { id: 'w1', name: '华东工程仓' },
      { id: 'w2', name: '南京工程仓' },
    ],
  },
  {
    id: 'mp002',
    skuId: 'sku002',
    skuCode: 'SKU-GC-002-16',
    skuName: '螺纹钢 HRB400 16mm',
    spuId: 'spu002',
    spuName: '螺纹钢',
    spuCode: 'SPU-GC-001',
    categoryName: '钢材',
    specs: { '规格': '16mm' },
    mainImage: 'https://picsum.photos/200/200?random=2',
    unit: '吨',
    purchaseStock: 100,
    supplierId: 's003',
    supplierName: '宝钢供应商',
    supplyPrice: 4000,
    supplyStatus: 'supplying',
    marketStatus: 'pending',
    autoToMarket: false,
    isHot: false,
    isRecommend: false,
    tags: [],
    sortWeight: 0,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 4000, supplyStatus: 'supplying', estimatedStock: 100, minOrderQty: 5, leadTime: 7, priority: 1 },
    ],
  },
  {
    id: 'mp003',
    skuId: 'sku003',
    skuCode: 'SKU-SN-003-32.5',
    skuName: '水泥 P.O 32.5',
    spuId: 'spu001',
    spuName: '普通硅酸盐水泥',
    spuCode: 'SPU-SN-001',
    categoryName: '水泥',
    specs: { '强度等级': '32.5' },
    mainImage: 'https://picsum.photos/200/200?random=3',
    unit: '吨',
    purchaseStock: 800,
    supplierId: 's001',
    supplierName: '华新水泥供应商',
    supplyPrice: 380,
    supplyStatus: 'supplying',
    marketStatus: 'online',
    autoToMarket: true,
    marketPrice: 450,
    isHot: true,
    isRecommend: true,
    tags: ['爆款', '热销'],
    sortWeight: 100,
    onlineAt: '2024-01-10 10:00:00',
    suppliers: [
      { supplierId: 's001', supplierName: '华新水泥供应商', supplyPrice: 380, supplyStatus: 'supplying', estimatedStock: 800, minOrderQty: 10, leadTime: 3, priority: 1 },
      { supplierId: 's002', supplierName: '海螺水泥供应商', supplyPrice: 385, supplyStatus: 'supplying', estimatedStock: 600, minOrderQty: 15, leadTime: 4, priority: 2 },
      { supplierId: 's004', supplierName: '南方建材供应商', supplyPrice: 390, supplyStatus: 'paused', estimatedStock: 200, minOrderQty: 10, leadTime: 5, priority: 3 },
    ],
    visibleWarehouses: [
      { id: 'w1', name: '华东工程仓' },
      { id: 'w3', name: '苏州工程仓' },
      { id: 'w4', name: '杭州工程仓' },
    ],
  },
  {
    id: 'mp004',
    skuId: 'sku004',
    skuCode: 'SKU-SS-004',
    skuName: '黄砂 中砂',
    spuId: 'spu003',
    spuName: '黄砂',
    spuCode: 'SPU-SS-001',
    categoryName: '砂石',
    specs: { '类型': '中砂' },
    mainImage: 'https://picsum.photos/200/200?random=4',
    unit: '方',
    purchaseStock: 1000,
    supplierId: 's004',
    supplierName: '南方建材供应商',
    supplyPrice: 80,
    supplyStatus: 'supplying',
    marketStatus: 'online',
    autoToMarket: true,
    marketPrice: 95,
    isHot: false,
    isRecommend: true,
    tags: ['品质优选'],
    sortWeight: 50,
    onlineAt: '2024-01-12 14:00:00',
    suppliers: [
      { supplierId: 's004', supplierName: '南方建材供应商', supplyPrice: 80, supplyStatus: 'supplying', estimatedStock: 1000, minOrderQty: 50, leadTime: 2, priority: 1 },
    ],
  },
  {
    id: 'mp005',
    skuId: 'sku005',
    skuCode: 'SKU-GC-005-20',
    skuName: '螺纹钢 HRB400 20mm',
    spuId: 'spu002',
    spuName: '螺纹钢',
    spuCode: 'SPU-GC-001',
    categoryName: '钢材',
    specs: { '规格': '20mm' },
    mainImage: 'https://picsum.photos/200/200?random=5',
    unit: '吨',
    purchaseStock: 0,
    supplierId: 's003',
    supplierName: '宝钢供应商',
    supplyPrice: 3950,
    supplyStatus: 'supplying',
    marketStatus: 'offline',
    autoToMarket: true,
    marketPrice: 4200,
    isHot: false,
    isRecommend: false,
    tags: [],
    sortWeight: 0,
    suppliers: [
      { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 3950, supplyStatus: 'stopped', estimatedStock: 0, minOrderQty: 5, leadTime: 7, priority: 1 },
    ],
  },
])

const importProductList = ref<ImportProduct[]>([])

const rowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
}

const importRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: importSelectedKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    importSelectedKeys.value = keys
  },
}))

const selectedProducts = computed(() => {
  return mockProducts.value.filter(p => selectedKeys.value.includes(p.id))
})

const totalCount = computed(() => mockProducts.value.length)
const pendingCount = computed(() => mockProducts.value.filter(p => p.marketStatus === 'pending').length)
const onlineCount = computed(() => mockProducts.value.filter(p => p.marketStatus === 'online').length)
const offlineCount = computed(() => mockProducts.value.filter(p => p.marketStatus === 'offline').length)

const filteredProducts = computed(() => {
  let result = mockProducts.value
  
  if (currentTab.value !== 'all') {
    result = result.filter(p => p.marketStatus === currentTab.value)
  }
  
  if (searchForm.supplyStatus) {
    result = result.filter(p => p.supplyStatus === searchForm.supplyStatus)
  }
  
  return result
})

function handleTabChange() {
  selectedKeys.value = []
  pagination.current = 1
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleImportProducts() {
  importVisible.value = true
  loadImportProducts()
}

function loadImportProducts() {
  importLoading.value = true
  
  importProductList.value = [
    {
      id: 'ip001',
      skuId: 'sku006',
      skuCode: 'SKU-HNT-006-C30',
      skuName: '商品混凝土 C30',
      spuId: 'spu004',
      spuName: '商品混凝土',
      categoryName: '混凝土',
      specs: { '强度等级': 'C30' },
      mainImage: 'https://picsum.photos/200/200?random=6',
      unit: '方',
      autoToMarket: false,
      suppliers: [
        { supplierId: 's005', supplierName: '中建混凝土供应商', supplyPrice: 380, supplyStatus: 'supplying', estimatedStock: 500, minOrderQty: 10, leadTime: 1, priority: 1 },
      ],
    },
    {
      id: 'ip002',
      skuId: 'sku007',
      skuCode: 'SKU-QT-007',
      skuName: '加气混凝土砌块 600x240x200',
      spuId: 'spu005',
      spuName: '加气混凝土砌块',
      categoryName: '砌体材料',
      specs: { '规格': '600x240x200' },
      mainImage: 'https://picsum.photos/200/200?random=7',
      unit: '块',
      autoToMarket: false,
      suppliers: [
        { supplierId: 's006', supplierName: '新型建材供应商', supplyPrice: 8.5, supplyStatus: 'supplying', estimatedStock: 5000, minOrderQty: 100, leadTime: 3, priority: 1 },
        { supplierId: 's007', supplierName: '绿色建材供应商', supplyPrice: 8.8, supplyStatus: 'supplying', estimatedStock: 3000, minOrderQty: 200, leadTime: 4, priority: 2 },
      ],
    },
    {
      id: 'ip003',
      skuId: 'sku008',
      skuCode: 'SKU-GC-008-25',
      skuName: '螺纹钢 HRB400 25mm',
      spuId: 'spu002',
      spuName: '螺纹钢',
      categoryName: '钢材',
      specs: { '规格': '25mm' },
      mainImage: 'https://picsum.photos/200/200?random=8',
      unit: '吨',
      autoToMarket: false,
      suppliers: [
        { supplierId: 's003', supplierName: '宝钢供应商', supplyPrice: 3900, supplyStatus: 'supplying', estimatedStock: 150, minOrderQty: 5, leadTime: 7, priority: 1 },
        { supplierId: 's008', supplierName: '沙钢供应商', supplyPrice: 3880, supplyStatus: 'supplying', estimatedStock: 200, minOrderQty: 10, leadTime: 5, priority: 2 },
      ],
    },
    {
      id: 'ip004',
      skuId: 'sku009',
      skuCode: 'SKU-SS-009',
      skuName: '碎石 5-31.5mm',
      spuId: 'spu006',
      spuName: '碎石',
      categoryName: '砂石',
      specs: { '粒径': '5-31.5mm' },
      mainImage: 'https://picsum.photos/200/200?random=9',
      unit: '方',
      autoToMarket: false,
      suppliers: [
        { supplierId: 's004', supplierName: '南方建材供应商', supplyPrice: 65, supplyStatus: 'supplying', estimatedStock: 2000, minOrderQty: 100, leadTime: 2, priority: 1 },
      ],
    },
  ]
  
  importPagination.total = importProductList.value.length
  importLoading.value = false
}

function handleImportSearch() {
  importPagination.current = 1
  loadImportProducts()
}

function handleImportPageChange(page: number) {
  importPagination.current = page
}

function handleConfirmImport() {
  const selectedProducts = importProductList.value.filter(p => importSelectedKeys.value.includes(p.id))
  
  selectedProducts.forEach(product => {
    const minSupplier = product.suppliers.reduce((min, s) => s.supplyPrice < min.supplyPrice ? s : min, product.suppliers[0])
    
    mockProducts.value.push({
      id: `mp-${Date.now()}-${product.skuId}`,
      skuId: product.skuId,
      skuCode: product.skuCode,
      skuName: product.skuName,
      spuId: product.spuId,
      spuName: product.spuName,
      categoryName: product.categoryName,
      specs: product.specs,
      mainImage: product.mainImage,
      unit: product.unit,
      supplierId: minSupplier.supplierId,
      supplierName: minSupplier.supplierName,
      supplyPrice: minSupplier.supplyPrice,
      supplyStatus: minSupplier.supplyStatus,
      marketStatus: 'pending',
      autoToMarket: product.autoToMarket ?? false,
      isHot: false,
      isRecommend: false,
      tags: [],
      sortWeight: 0,
      suppliers: product.suppliers,
    })
  })
  
  Message.success(`成功导入 ${selectedProducts.length} 个商品`)
  importVisible.value = false
  importSelectedKeys.value = []
}

function handleOnline(record: MarketProduct) {
  onlineProduct.value = record
  onlineForm.isHot = record.isHot
  onlineForm.isRecommend = record.isRecommend
  onlineForm.tags = [...record.tags]
  onlineForm.sortWeight = record.sortWeight
  onlineVisible.value = true
}

function handleOnlineConfirm() {
  if (onlineProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === onlineProduct.value!.id)
    if (index > -1) {
      mockProducts.value[index] = {
        ...mockProducts.value[index],
        marketStatus: 'online',
        isHot: onlineForm.isHot,
        isRecommend: onlineForm.isRecommend,
        tags: onlineForm.tags,
        sortWeight: onlineForm.sortWeight,
        onlineAt: new Date().toLocaleString(),
      }
    }
    Message.success('上架成功')
  }
  onlineVisible.value = false
}

function handleRemove(record: MarketProduct) {
  const index = mockProducts.value.findIndex(p => p.id === record.id)
  if (index > -1) {
    mockProducts.value.splice(index, 1)
    Message.success('已移除')
  }
}

function handleSetPrice(record: MarketProduct) {
  priceProduct.value = record
  priceForm.supplierPrices = {}
  if (record.suppliers) {
    record.suppliers.forEach(s => {
      priceForm.supplierPrices[s.supplierId] = s.supplyPrice
    })
  }
  priceForm.reason = ''
  priceVisible.value = true
}

function handlePriceConfirm() {
  if (!priceForm.reason.trim()) {
    Message.warning('请输入调价原因')
    return
  }
  
  const hasPriceChange = Object.keys(priceForm.supplierPrices).some(supplierId => {
    const supplier = priceProduct.value?.suppliers?.find(s => s.supplierId === supplierId)
    return supplier && priceForm.supplierPrices[supplierId] !== supplier.supplyPrice
  })
  
  if (!hasPriceChange) {
    Message.warning('请至少调整一个供应商的价格')
    return
  }
  
  if (priceProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === priceProduct.value!.id)
    if (index > -1 && priceProduct.value.suppliers) {
      priceProduct.value.suppliers.forEach(supplier => {
        if (priceForm.supplierPrices[supplier.supplierId] !== undefined) {
          const supplierIndex = mockProducts.value[index].suppliers!.findIndex(
            s => s.supplierId === supplier.supplierId
          )
          if (supplierIndex > -1) {
            mockProducts.value[index].suppliers![supplierIndex].supplyPrice = 
              priceForm.supplierPrices[supplier.supplierId]
          }
        }
      })
      mockProducts.value[index].priceStatus = 'pending'
    }
    Message.success('调价申请已提交，等待审批')
  }
  priceVisible.value = false
}

function handleBatchSetPrice() {
  batchPriceForm.type = 'fixed'
  batchPriceForm.fixedPrice = 0
  batchPriceForm.percent = 0
  batchPriceForm.reason = ''
  batchPriceVisible.value = true
}

function handleBatchPriceConfirm() {
  if (batchPriceForm.type === 'fixed') {
    if (!batchPriceForm.fixedPrice || batchPriceForm.fixedPrice <= 0) {
      Message.warning('请输入有效的价格')
      return
    }
  } else {
    if (!batchPriceForm.percent || batchPriceForm.percent === 0) {
      Message.warning('请输入有效的调整比例')
      return
    }
  }
  
  if (!batchPriceForm.reason.trim()) {
    Message.warning('请输入调价原因')
    return
  }
  
  selectedProducts.value.forEach(product => {
    const index = mockProducts.value.findIndex(p => p.id === product.id)
    if (index > -1) {
      let newPrice = 0
      if (batchPriceForm.type === 'fixed') {
        newPrice = batchPriceForm.fixedPrice
      } else {
        const currentPrice = mockProducts.value[index].price || 0
        newPrice = currentPrice * (1 + batchPriceForm.percent / 100)
        newPrice = Math.max(0, Math.round(newPrice * 100) / 100)
      }
      mockProducts.value[index].price = newPrice
      mockProducts.value[index].priceStatus = 'pending'
    }
  })
  
  Message.success(`已提交 ${selectedProducts.value.length} 个商品的调价申请`)
  batchPriceVisible.value = false
  selectedKeys.value = []
}

function handleBatchOnline() {
  Message.success(`已批量上架 ${selectedKeys.value.length} 个商品`)
  selectedKeys.value = []
}

function handleOffline(record: MarketProduct) {
  offlineProduct.value = record
  offlineForm.reason = ''
  offlineVisible.value = true
}

function handleOfflineConfirm() {
  if (!offlineForm.reason.trim()) {
    Message.warning('请输入下架原因')
    return
  }
  
  if (offlineProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === offlineProduct.value!.id)
    if (index > -1) {
      mockProducts.value[index].marketStatus = 'offline'
    }
    Message.success('下架成功')
  }
  offlineVisible.value = false
}

function handleBatchOffline() {
  selectedProducts.value.forEach(product => {
    product.marketStatus = 'offline'
  })
  Message.success(`已批量下架 ${selectedKeys.value.length} 个商品`)
  selectedKeys.value = []
}

function handleSetPermission(record: MarketProduct) {
  permissionProduct.value = record
  selectedWarehouseIds.value = record.visibleWarehouses?.map(w => w.id) || []
  permissionVisible.value = true
}

function handleBatchSetPermission() {
  permissionProduct.value = null
  selectedWarehouseIds.value = []
  permissionVisible.value = true
}

function handleSelectAllWarehouses() {
  selectedWarehouseIds.value = warehouseList.value.map(w => w.value)
}

function handleClearWarehouses() {
  selectedWarehouseIds.value = []
}

function handlePermissionConfirm() {
  const warehouses = selectedWarehouseIds.value.map(id => {
    const w = warehouseList.value.find(item => item.value === id)
    return { id, name: w?.label || '' }
  })
  
  if (permissionProduct.value) {
    const index = mockProducts.value.findIndex(p => p.id === permissionProduct.value!.id)
    if (index > -1) {
      mockProducts.value[index].visibleWarehouses = warehouses
    }
    Message.success('权限设置成功')
  } else {
    selectedProducts.value.forEach(product => {
      product.visibleWarehouses = warehouses
    })
    Message.success(`已为 ${selectedProducts.value.length} 个商品设置权限`)
    selectedKeys.value = []
  }
  permissionVisible.value = false
}

function handleViewDetail(record: MarketProduct) {
  detailProduct.value = record
  detailVisible.value = true
}

function handleMarketStatusChange(record: MarketProduct, val: boolean) {
  if (val) {
    if (record.marketPrice) {
      const index = mockProducts.value.findIndex(p => p.id === record.id)
      if (index > -1) {
        mockProducts.value[index].marketStatus = 'online'
        mockProducts.value[index].onlineAt = new Date().toLocaleString()
      }
      Message.success('上架成功')
    } else {
      handleOnline(record)
    }
  } else {
    const index = mockProducts.value.findIndex(p => p.id === record.id)
    if (index > -1) {
      mockProducts.value[index].marketStatus = 'offline'
    }
    Message.success('下架成功')
  }
}

function handleHotChange(record: MarketProduct, val: boolean) {
  Message.success(`${val ? '已设为热门' : '已取消热门'}`)
}

function handleRecommendChange(record: MarketProduct, val: boolean) {
  Message.success(`${val ? '已设为推荐' : '已取消推荐'}`)
}

function handleSortChange(record: MarketProduct) {
  Message.success('排序已更新')
}

function getMinSupplyPrice(record: MarketProduct | null) {
  if (!record?.suppliers?.length) return record?.supplyPrice?.toFixed(2) || '0.00'
  const min = record.suppliers.reduce((m, s) => s.supplyPrice < m ? s.supplyPrice : m, record.suppliers[0].supplyPrice)
  return min.toFixed(2)
}

function getMinSupplyPriceFromList(suppliers: SupplierInfo[]) {
  const min = suppliers.reduce((m, s) => s.supplyPrice < m ? s.supplyPrice : m, suppliers[0].supplyPrice)
  return min.toFixed(2)
}

function getMaxSupplyPriceFromList(suppliers: SupplierInfo[]) {
  const max = suppliers.reduce((m, s) => s.supplyPrice > m ? s.supplyPrice : m, suppliers[0].supplyPrice)
  return max.toFixed(2)
}

function getTotalEstimatedStock(record: ImportProduct) {
  if (!record.suppliers?.length) return 0
  return record.suppliers
    .filter(s => s.supplyStatus === 'supplying')
    .reduce((sum, s) => sum + (s.estimatedStock || 0), 0)
}

function isAllSupplying(record: ImportProduct) {
  return record.suppliers?.every(s => s.supplyStatus === 'supplying')
}

function hasSupplying(record: ImportProduct) {
  return record.suppliers?.some(s => s.supplyStatus === 'supplying')
}

function getSupplyStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    supplying: 'green',
    paused: 'orange',
    stopped: 'red',
  }
  return colorMap[status] || 'gray'
}

function getSupplyStatusText(status: string) {
  const textMap: Record<string, string> = {
    supplying: '供货中',
    paused: '暂停供货',
    stopped: '永久停货',
  }
  return textMap[status] || status
}

function getMarketStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    online: 'green',
    offline: 'gray',
  }
  return colorMap[status] || 'gray'
}

function getMarketStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待上架',
    online: '已上架',
    offline: '已下架',
  }
  return textMap[status] || status
}

onMounted(() => {
  pagination.total = mockProducts.value.length
})
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .product-detail {
    .product-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .product-code {
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 4px;
    }
    
    .product-specs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
}

.spu-info {
  .spu-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .spu-code {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.stock-info {
  .stock-value {
    font-weight: 600;
    color: #165dff;
  }
  
  .stock-unit {
    font-size: 12px;
    color: var(--color-text-3);
    margin-left: 4px;
  }
}

.multi-supplier {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
}

.supplier-popover {
  .supplier-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    gap: 12px;
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--color-border-2);
    }
  }
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.price {
  color: var(--color-danger-6);
  font-weight: 500;
}

.un-set {
  color: var(--color-text-3);
}

.product-layout {
  display: flex;
  gap: 16px;
}

.category-sidebar {
  width: 260px;
  flex-shrink: 0;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  padding: 12px;
  background: var(--color-bg-2);

  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-2);

    .title {
      font-weight: 500;
      font-size: 14px;
    }
  }

  .category-name {
    font-size: 13px;
  }

  .category-count {
    color: var(--color-text-3);
    font-size: 12px;
    margin-left: 4px;
  }
}

.product-content {
  flex: 1;
  min-width: 0;
}

.profit-high {
  color: var(--color-success-6);
  font-weight: 500;
}

.profit-normal {
  color: var(--color-text-1);
}

.profit-low {
  color: var(--color-danger-6);
}

.import-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .selected-count {
    color: var(--color-text-2);
  }
}

.supplier-info {
  .supplier-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
    
    .supplier-name {
      flex: 1;
    }
    
    .supplier-price {
      color: var(--color-danger-6);
      font-weight: 500;
    }
  }
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.warehouse-popover {
  max-height: 200px;
  overflow-y: auto;
  
  .warehouse-item {
    padding: 4px 0;
  }
}

.permission-config {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .config-title {
      font-weight: 500;
    }
  }
}

.permission-tip {
  margin-top: 16px;
  padding: 8px 12px;
  background: var(--color-fill-1);
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-text-2);
  
  svg {
    margin-right: 4px;
  }
}
</style>
