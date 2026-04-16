<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <template #title>
        <span>供应商供货管理</span>
      </template>
      <template #extra>
        <a-space>
          <a-radio-group v-model="viewMode" type="button" @change="handleViewModeChange">
            <a-radio value="product">按商品查看</a-radio>
            <a-radio value="supplier">按供应商查看</a-radio>
          </a-radio-group>
          <a-button type="primary" @click="handleAddSupply">
            <template #icon><icon-plus /></template>
            添加供货关联
          </a-button>
        </a-space>
      </template>

      <div v-if="viewMode === 'product'">
        <div class="table-actions">
          <a-space>
            <a-input-search
              v-model="searchForm.keyword"
              placeholder="搜索商品名称/编码"
              style="width: 260px"
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
            <a-select v-model="searchForm.hasSupplier" placeholder="供货状态" style="width: 120px" allow-clear>
              <a-option value="yes">有供应商</a-option>
              <a-option value="no">无供应商</a-option>
            </a-select>
          </a-space>
          <a-button 
            type="outline" 
            :disabled="selectedSkuKeys.length === 0"
            @click="handleBatchAddSupplier"
          >
            批量关联供应商 ({{ selectedSkuKeys.length }})
          </a-button>
        </div>

        <a-table
          :data="filteredProducts"
          :loading="loading"
          :pagination="pagination"
          :row-selection="productRowSelection"
          row-key="skuId"
          @page-change="handlePageChange"
        >
          <template #columns>
            <a-table-column title="主图" :width="80">
              <template #cell="{ record }">
                <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
              </template>
            </a-table-column>
            <a-table-column title="SKU编码" data-index="skuCode" :width="140" />
            <a-table-column title="商品名称" data-index="skuName" :width="180" />
            <a-table-column title="所属SPU" data-index="spuName" :width="150" />
            <a-table-column title="分类" data-index="categoryName" :width="100" />
            <a-table-column title="规格" :width="120">
              <template #cell="{ record }">
                <span v-for="(value, key) in record.specs" :key="key">
                  <a-tag size="small">{{ value }}</a-tag>
                </span>
              </template>
            </a-table-column>
            <a-table-column title="供应价格" :width="120">
              <template #cell="{ record }">
                <template v-if="record.supplierCount > 0">
                  <template v-if="record.supplyPriceMin === record.supplyPriceMax">
                    <span class="price-value">¥{{ record.supplyPriceMin?.toFixed(2) }}</span>
                  </template>
                  <template v-else>
                    <div class="price-range">
                      <span class="price-min">¥{{ record.supplyPriceMin?.toFixed(2) }}</span>
                      <span class="price-separator">-</span>
                      <span class="price-max">¥{{ record.supplyPriceMax?.toFixed(2) }}</span>
                    </div>
                  </template>
                </template>
                <span v-else class="price-empty">-</span>
              </template>
            </a-table-column>
            <a-table-column title="供应商数量" :width="100">
              <template #cell="{ record }">
                <a-link @click="handleViewSuppliers(record)">
                  {{ record.supplierCount || 0 }} 家
                </a-link>
              </template>
            </a-table-column>
            <a-table-column title="进入市场" :width="90">
              <template #cell="{ record }">
                <a-tag v-if="record.autoToMarket !== false" color="green" size="small">自动</a-tag>
                <a-tag v-else color="gray" size="small">手动</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewSuppliers(record)">查看供应商</a-button>
                  <a-button type="text" size="small" @click="handleAddSupplyForSku(record)">添加供应商</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div v-else>
        <div class="table-actions">
          <a-space>
            <a-input-search
              v-model="supplierSearchForm.keyword"
              placeholder="搜索供应商名称"
              style="width: 260px"
              @search="handleSupplierSearch"
            />
            <a-select v-model="supplierSearchForm.status" placeholder="供应商状态" style="width: 120px" allow-clear>
              <a-option value="active">正常</a-option>
              <a-option value="inactive">已停用</a-option>
            </a-select>
          </a-space>
        </div>

        <a-table
          :data="filteredSuppliers"
          :loading="supplierLoading"
          :pagination="supplierPagination"
          row-key="supplierId"
          @page-change="handleSupplierPageChange"
        >
          <template #columns>
            <a-table-column title="供应商ID" data-index="supplierId" :width="120" />
            <a-table-column title="供应商名称" data-index="supplierName" :width="200" />
            <a-table-column title="联系人" data-index="contactPerson" :width="100" />
            <a-table-column title="联系电话" data-index="contactPhone" :width="130" />
            <a-table-column title="供货商品数" :width="100">
              <template #cell="{ record }">
                <a-link @click="handleViewProducts(record)">
                  {{ record.productCount || 0 }} 个
                </a-link>
              </template>
            </a-table-column>
            <a-table-column title="供货中" :width="80">
              <template #cell="{ record }">
                <span class="status-active">{{ record.activeCount || 0 }}</span>
              </template>
            </a-table-column>
            <a-table-column title="已暂停" :width="80">
              <template #cell="{ record }">
                <span class="status-paused">{{ record.pausedCount || 0 }}</span>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="80">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                  {{ record.status === 'active' ? '正常' : '已停用' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleViewProducts(record)">查看商品</a-button>
                  <a-button type="text" size="small" @click="handleAddProductForSupplier(record)">添加商品</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal 
      v-model:visible="addSupplyVisible" 
      :title="batchMode ? '批量添加供货关联' : '添加供货关联'" 
      :width="1000"
      :footer="false"
    >
      <a-steps :current="addStep" style="margin-bottom: 24px">
        <a-step title="选择商品" />
        <a-step title="选择供应商" />
        <a-step title="设置供货信息" />
      </a-steps>

      <div v-if="addStep === 1">
        <div class="product-selector">
          <div class="selector-left">
            <div class="selector-header">
              <a-radio-group v-model="productSelectMode" type="button" size="small">
                <a-radio value="spu">按SPU选择</a-radio>
                <a-radio value="sku">按SKU选择</a-radio>
              </a-radio-group>
            </div>
            <div class="selector-filter">
              <a-input-search
                v-model="productSelectorKeyword"
                placeholder="搜索商品名称/编码"
                style="width: 200px"
              />
              <a-cascader
                v-model="productSelectorCategory"
                :options="categoryTree"
                placeholder="分类"
                style="width: 150px"
                allow-clear
                :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
              />
            </div>
            
            <div class="selector-list">
              <template v-if="productSelectMode === 'spu'">
                <div 
                  v-for="spu in filteredSpuList" 
                  :key="spu.spuId"
                  class="spu-item"
                  :class="{ 'is-expanded': expandedSpuIds.includes(spu.spuId) }"
                >
                  <div class="spu-header" @click="toggleSpuExpand(spu.spuId)">
                    <a-checkbox 
                      :model-value="isSpuSelected(spu.spuId)"
                      :indeterminate="isSpuIndeterminate(spu.spuId)"
                      @change="(checked: boolean) => handleSpuSelect(spu, checked)"
                      @click.stop
                    />
                    <icon-right class="expand-icon" />
                    <span class="spu-name">{{ spu.spuName }}</span>
                    <a-tag size="small">{{ spu.skuList.length }}个SKU</a-tag>
                  </div>
                  <div v-if="expandedSpuIds.includes(spu.spuId)" class="sku-list">
                    <div 
                      v-for="sku in spu.skuList" 
                      :key="sku.skuId"
                      class="sku-item"
                      :class="{ 'is-selected': tempSelectedSkuKeys.includes(sku.skuId) }"
                      @click="handleSkuToggle(sku)"
                    >
                      <a-checkbox 
                        :model-value="tempSelectedSkuKeys.includes(sku.skuId)"
                        @change="handleSkuToggle(sku)"
                        @click.stop
                      />
                      <span class="sku-code">{{ sku.skuCode }}</span>
                      <span class="sku-spec">
                        <a-tag v-for="(value, key) in sku.specs" :key="key" size="small">{{ value }}</a-tag>
                      </span>
                      <span class="sku-price">¥{{ sku.platformPrice?.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </template>
              
              <template v-else>
                <div 
                  v-for="sku in filteredSkuList" 
                  :key="sku.skuId"
                  class="sku-item-flat"
                  :class="{ 'is-selected': tempSelectedSkuKeys.includes(sku.skuId) }"
                  @click="handleSkuToggle(sku)"
                >
                  <a-checkbox 
                    :model-value="tempSelectedSkuKeys.includes(sku.skuId)"
                    @click.stop
                  />
                  <a-image :src="sku.mainImage" :width="40" :height="40" fit="cover" />
                  <div class="sku-info">
                    <div class="sku-name">{{ sku.skuName }}</div>
                    <div class="sku-meta">
                      <span>{{ sku.skuCode }}</span>
                      <a-tag v-for="(value, key) in sku.specs" :key="key" size="small">{{ value }}</a-tag>
                    </div>
                  </div>
                  <span class="sku-price">¥{{ sku.platformPrice?.toFixed(2) }}</span>
                </div>
              </template>
            </div>
          </div>
          
          <div class="selector-right">
            <div class="selector-header">
              <span>已选商品 ({{ tempSelectedSkuKeys.length }}个SKU)</span>
              <a-button type="text" size="small" @click="clearSelectedSkus">清空</a-button>
            </div>
            <div class="selected-list">
              <div v-for="sku in tempSelectedSkus" :key="sku.skuId" class="selected-item">
                <span class="selected-name">{{ sku.skuName }}</span>
                <span class="selected-spec">
                  <a-tag v-for="(value, key) in sku.specs" :key="key" size="small">{{ value }}</a-tag>
                </span>
                <a-button type="text" size="small" @click="removeSelectedSku(sku.skuId)">
                  <icon-close />
                </a-button>
              </div>
              <a-empty v-if="tempSelectedSkuKeys.length === 0" description="请从左侧选择商品" />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <a-button @click="addSupplyVisible = false">取消</a-button>
          <a-button type="primary" :disabled="tempSelectedSkuKeys.length === 0" @click="addStep = 2">
            下一步 (已选{{ tempSelectedSkuKeys.length }}个SKU)
          </a-button>
        </div>
      </div>

      <div v-else-if="addStep === 2">
        <div class="supplier-selector">
          <div class="selector-left">
            <div class="selector-filter">
              <a-input-search
                v-model="supplierSelectorKeyword"
                placeholder="搜索供应商名称"
                style="width: 250px"
              />
            </div>
            <div class="selector-list">
              <div 
                v-for="supplier in filteredSupplierList" 
                :key="supplier.supplierId"
                class="supplier-item"
                :class="{ 'is-selected': tempSelectedSupplierIds.includes(supplier.supplierId) }"
                @click="handleSupplierToggle(supplier)"
              >
                <a-checkbox 
                  :model-value="tempSelectedSupplierIds.includes(supplier.supplierId)"
                  @click.stop
                />
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.supplierName }}</div>
                  <div class="supplier-contact">{{ supplier.contactPerson }} {{ supplier.contactPhone }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="selector-right">
            <div class="selector-header">
              <span>已选供应商 ({{ tempSelectedSupplierIds.length }}家)</span>
              <a-button type="text" size="small" @click="tempSelectedSupplierIds = []">清空</a-button>
            </div>
            <div class="selected-list">
              <div v-for="supplier in tempSelectedSuppliers" :key="supplier.supplierId" class="selected-item">
                <span class="selected-name">{{ supplier.supplierName }}</span>
                <a-button type="text" size="small" @click="removeSelectedSupplier(supplier.supplierId)">
                  <icon-close />
                </a-button>
              </div>
              <a-empty v-if="tempSelectedSupplierIds.length === 0" description="请从左侧选择供应商" />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <a-button @click="addStep = 1">上一步</a-button>
          <a-button type="primary" :disabled="tempSelectedSupplierIds.length === 0" @click="goToStep3">
            下一步 (已选{{ tempSelectedSupplierIds.length }}家供应商)
          </a-button>
        </div>
      </div>

      <div v-else-if="addStep === 3">
        <div class="supply-form-section">
          <a-alert type="info" style="margin-bottom: 16px">
            已选择 <strong>{{ tempSelectedSkuKeys.length }}</strong> 个SKU和 <strong>{{ tempSelectedSupplierIds.length }}</strong> 家供应商，将创建 <strong>{{ tempSelectedSkuKeys.length * tempSelectedSupplierIds.length }}</strong> 条供货关联。
          </a-alert>
          
          <a-divider>批量设置供货信息</a-divider>
          
          <a-form :model="supplyForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item label="供货价">
                  <a-input-number v-model="supplyForm.supplyPrice" :min="0" :precision="2" style="width: 100%" placeholder="批量设置">
                    <template #prefix>¥</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="预计供货量">
                  <a-input-number v-model="supplyForm.estimatedStock" :min="0" style="width: 100%" placeholder="批量设置">
                    <template #suffix>单位</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最小起订量">
                  <a-input-number v-model="supplyForm.minOrderQty" :min="1" style="width: 100%" placeholder="批量设置">
                    <template #suffix>单位</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="供货周期">
                  <a-input-number v-model="supplyForm.leadTime" :min="1" style="width: 100%" placeholder="批量设置">
                    <template #suffix>天</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
            </a-row>
            <div style="margin-bottom: 16px">
              <a-button type="outline" @click="applyBatchSupply">应用到所有SKU</a-button>
              <a-switch v-model="supplyForm.autoToMarket" style="margin-left: 24px" />
              <span class="form-tip" style="margin-left: 8px">自动进入商品市场</span>
            </div>
          </a-form>

          <a-divider>SKU供货详情</a-divider>
          
          <a-table 
            :data="supplySkuList" 
            :pagination="false" 
            :max-height="280" 
            :scroll="{ x: 1100 }" 
            size="small"
          >
            <template #columns>
              <a-table-column title="SKU编码" data-index="skuCode" :width="130" />
              <a-table-column title="商品名称" data-index="skuName" :width="150" />
              <a-table-column title="规格" :width="100">
                <template #cell="{ record }">
                  <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 4px">
                    <a-tag size="small">{{ value }}</a-tag>
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="供货价" :width="120">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="record.supplyPrice" 
                    size="small" 
                    :min="0" 
                    :precision="2" 
                    style="width: 100%"
                    placeholder="必填"
                  >
                    <template #prefix>¥</template>
                  </a-input-number>
                </template>
              </a-table-column>
              <a-table-column title="预计供货量" :width="110">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="record.estimatedStock" 
                    size="small" 
                    :min="0" 
                    style="width: 100%"
                    placeholder="选填"
                  />
                </template>
              </a-table-column>
              <a-table-column title="最小起订量" :width="110">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="record.minOrderQty" 
                    size="small" 
                    :min="1" 
                    style="width: 100%"
                    placeholder="选填"
                  />
                </template>
              </a-table-column>
              <a-table-column title="供货周期" :width="100">
                <template #cell="{ record }">
                  <a-input-number 
                    v-model="record.leadTime" 
                    size="small" 
                    :min="1" 
                    style="width: 100%"
                    placeholder="选填"
                  >
                    <template #suffix>天</template>
                  </a-input-number>
                </template>
              </a-table-column>
            </template>
          </a-table>
          
          <a-form-item label="备注" style="margin-top: 16px">
            <a-textarea v-model="supplyForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
          </a-form-item>
        </div>
        
        <div class="modal-footer">
          <a-button @click="addStep = 2">上一步</a-button>
          <a-button type="primary" @click="handleSubmitSupply">确认添加</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="productSuppliersVisible" 
      :title="`${currentSku?.skuName || ''} - 供货供应商`" 
      :width="1000"
      :footer="false"
    >
      <template #extra>
        <a-space>
          <a-button 
            type="outline" 
            size="small" 
            status="danger"
            :disabled="selectedSupplierKeys.length === 0"
            @click="handleBatchDeleteSuppliers"
          >
            批量删除 ({{ selectedSupplierKeys.length }})
          </a-button>
          <a-button type="primary" size="small" @click="handleAddSupplyForSku(currentSku)">
            <template #icon><icon-plus /></template>
            添加供应商
          </a-button>
        </a-space>
      </template>
      
      <a-table 
        :data="productSuppliers" 
        :pagination="false"
        :row-selection="supplierRowSelection"
        row-key="supplierId"
      >
        <template #columns>
          <a-table-column title="供应商" :width="180">
            <template #cell="{ record }">
              <div>
                <div>{{ record.supplierName }}</div>
                <div class="sub-text">{{ record.contactPerson }} {{ record.contactPhone }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供货价" :width="140">
            <template #cell="{ record, rowIndex }">
              <div class="price-row">
                <span class="price-value" :class="{ 'price-best': rowIndex === 0 && record.status === 'active' }">
                  ¥{{ record.supplyPrice.toFixed(2) }}
                </span>
                <a-tag v-if="rowIndex === 0 && record.status === 'active'" color="green" size="small">
                  最低价
                </a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="预计供货量" :width="100">
            <template #cell="{ record }">
              {{ record.estimatedStock }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="最小起订量" :width="100">
            <template #cell="{ record }">
              {{ record.minOrderQty }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="供货周期" :width="80">
            <template #cell="{ record }">
              {{ record.leadTime }} 天
            </template>
          </a-table-column>
          <a-table-column title="优先级" :width="90">
            <template #cell="{ record }">
              <a-select 
                v-model="record.priority" 
                size="small" 
                :style="{ width: '100%' }"
                @change="handleChangePriority(record)"
              >
                <a-option value="A">A级</a-option>
                <a-option value="B">B级</a-option>
                <a-option value="C">C级</a-option>
                <a-option value="D">D级</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="综合得分" :width="90" align="center">
            <template #cell="{ record }">
              <span class="score-value" :class="'score-' + (record.scoreLevel || 'B')">
                {{ record.score || 85 }} 分
              </span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getSupplyStatusColor(record.status)">
                {{ getSupplyStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditSupplyPrice(record)">编辑供货价</a-button>
                <a-button type="text" size="small" @click="handleEditSupply(record)">编辑</a-button>
                <a-button 
                  v-if="record.status === 'active'" 
                  type="text" 
                  size="small" 
                  status="warning"
                  @click="handleSupplyAction(record, 'paused')"
                >
                  暂停
                </a-button>
                <a-button 
                  v-if="record.status === 'paused'" 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handleSupplyAction(record, 'active')"
                >
                  恢复
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  status="danger"
                  @click="handleDeleteSupply(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="supplierProductsVisible" 
      :title="`${currentSupplier?.supplierName || ''} - 供货商品`" 
      :width="1100"
      :footer="false"
    >
      <template #extra>
        <a-button type="primary" size="small" @click="handleAddProductForSupplier(currentSupplier)">
          <template #icon><icon-plus /></template>
          添加商品
        </a-button>
      </template>
      
      <a-table :data="supplierProducts" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div>{{ record.skuName }}</div>
              <div class="sub-text">
                <a-tag v-for="(value, key) in record.specs" :key="key" size="small">{{ value }}</a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="平台供货价" :width="100">
            <template #cell="{ record }">
              ¥{{ record.platformPrice?.toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="供应商供货价" :width="120">
            <template #cell="{ record }">
              <span class="price-value">¥{{ record.supplyPrice.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="预计供货量" :width="100">
            <template #cell="{ record }">
              {{ record.estimatedStock }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="最小起订量" :width="100">
            <template #cell="{ record }">
              {{ record.minOrderQty }} {{ record.unit }}
            </template>
          </a-table-column>
          <a-table-column title="供货周期" :width="80">
            <template #cell="{ record }">
              {{ record.leadTime }} 天
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getSupplyStatusColor(record.status)">
                {{ getSupplyStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditSupplyPrice(record)">编辑供货价</a-button>
                <a-button type="text" size="small" @click="handleEditSupply(record)">编辑</a-button>
                <a-button 
                  v-if="record.status === 'active'" 
                  type="text" 
                  size="small" 
                  status="warning"
                  @click="handleSupplyAction(record, 'paused')"
                >
                  暂停
                </a-button>
                <a-button 
                  v-if="record.status === 'paused'" 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handleSupplyAction(record, 'active')"
                >
                  恢复
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="editSupplyPriceVisible" 
      title="编辑供货价" 
      :width="500"
      @ok="handleSaveSupplyPrice"
      @cancel="editSupplyPriceVisible = false"
    >
      <a-form :model="editSupplyPriceForm" layout="vertical">
        <a-form-item label="商品信息">
          <div class="product-info-card">
            <div class="info-row">
              <span class="label">SKU编码：</span>
              <span>{{ editSupplyPriceProduct?.skuCode }}</span>
            </div>
            <div class="info-row">
              <span class="label">商品名称：</span>
              <span>{{ editSupplyPriceProduct?.skuName }}</span>
            </div>
            <div class="info-row">
              <span class="label">供应商：</span>
              <span>{{ editSupplyPriceProduct?.supplierName }}</span>
            </div>
            <div class="info-row">
              <span class="label">平台供货价：</span>
              <span class="price-value">¥{{ editSupplyPriceProduct?.platformPrice?.toFixed(2) }}</span>
            </div>
          </div>
        </a-form-item>
        <a-form-item label="供应商供货价" required>
          <a-input-number 
            v-model="editSupplyPriceForm.supplyPrice" 
            :min="0" 
            :precision="2"
            style="width: 100%"
            placeholder="请输入供货价"
          >
            <template #prefix>¥</template>
          </a-input-number>
          <div class="form-tip">
            建议供货价不高于平台供货价，当前平台供货价：¥{{ editSupplyPriceProduct?.platformPrice?.toFixed(2) }}
          </div>
        </a-form-item>
        <a-form-item label="调价原因">
          <a-textarea 
            v-model="editSupplyPriceForm.priceReason" 
            placeholder="请输入调价原因（选填）" 
            :max-length="200" 
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal 
      v-model:visible="editSupplyVisible" 
      title="编辑供货信息" 
      :width="600"
      @ok="handleSaveEditSupply"
      @cancel="editSupplyVisible = false"
    >
      <a-form :model="editSupplyForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="预计供货量" required>
              <a-input-number 
                v-model="editSupplyForm.estimatedStock" 
                :min="0" 
                style="width: 100%"
                placeholder="请输入"
              >
                <template #suffix>{{ editSupplyProduct?.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="最小起订量" required>
              <a-input-number 
                v-model="editSupplyForm.minOrderQty" 
                :min="1" 
                style="width: 100%"
                placeholder="请输入"
              >
                <template #suffix>{{ editSupplyProduct?.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="供货周期" required>
          <a-input-number 
            v-model="editSupplyForm.leadTime" 
            :min="1" 
            style="width: 100%"
            placeholder="请输入"
          >
            <template #suffix>天</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="自动进入商品市场">
          <a-switch v-model="editSupplyForm.autoToMarket" />
          <span class="form-tip" style="margin-left: 12px">
            开启后，该商品将自动进入商品市场待上架列表
          </span>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="editSupplyForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    title: '1. 项目背景',
    content: `
**业务痛点：**
- 同商品多供应商报价分散，缺乏横向对比机制
- 供货价格人工维护，历史变动无迹可寻
- 供应商优先级无配置，选品逻辑不透明
- 进入商品市场规则黑盒，无法干预

**解决目标：**
- 建立多供应商报价竞价体系，自动比价
- 供货价格变动全程留痕，支持趋势回溯
- 可视化配置供应商优先级
- 可配置的自动进入商品市场规则

**模块定位：**
- 连接供应商与商品库的核心枢纽
- 采购定价的数据源
- 商品市场选品池的入口
- 供应商竞争力评价体系
    `
  },
  {
    title: '2. 用户对象',
    content: `
| 角色 | 核心职责 | 对应功能 |
|------|---------|---------|
| 采购专员 | 日常维护供货关系 | 添加/编辑供货关联 |
| 采购经理 | 价格审核与供应商管理 | 价格异常审核、供应商分级 |
| 运营专员 | 商品市场运营 | 配置进入市场规则 |
| 财务人员 | 价格合规校验 | 价格历史审计 |

**权限矩阵：**
| 操作 | 采购专员 | 采购经理 | 运营 | 财务 |
|-----|--------|--------|-----|------|
| 查看供货列表 | ✅ | ✅ | ✅ | ✅ |
| 添加供货关联 | ✅ | ✅ | ❌ | ❌ |
| 修改供货价格 | ✅ | ✅ | ❌ | ❌ |
| 启停供货 | ✅ | ✅ | ❌ | ❌ |
| 配置进入市场规则 | ❌ | ✅ | ✅ | ❌ |
| 导出价格历史 | ❌ | ✅ | ❌ | ✅ |
    `
  },
  {
    title: '3. 权限系统',
    content: `
### 数据权限

| 角色 | 可见供应商范围 |
|------|--------------|
| 普通采购 | 自己维护的供应商 |
| 采购组长 | 本组所有供应商 |
| 采购经理 | 全平台供应商 |

### 字段级权限

| 字段 | 采购员 | 经理 | 运营 |
|------|-------|-----|------|
| 供货结算价 | ✅ | ✅ | ❌ |
| 供应商返利政策 | ✅ | ✅ | ❌ |
| 账期天数 | ✅ | ✅ | ❌ |
| 进入市场规则 | ❌ | ✅ | ✅ |
    `
  },
  {
    title: '4. 核心业务场景',
    content: `
### 场景一：供应商报价竞价

>> 同一个SKU有3家供应商报价，系统自动识别最低价并推荐

- S001 供应商：¥ 12.50 / 件，账期 30 天
- S002 供应商：¥ 11.80 / 件，账期 15 天
- S003 供应商：¥ 13.00 / 件，账期 45 天

!! 综合评分 = 价格权重 70% + 账期权重 30%
!! S002 虽然账期短，但价格优势明显，被推荐为首选供应商

### 场景二：供货价格异动预警

>> 某供应商将某 SKU 供货价从 ¥10 上调至 ¥15，涨幅 50%

- 自动触发预警：价格涨幅 > 20%
- 推送采购经理审核
- 暂停自动进入商品市场，需人工确认

### 场景三：智能选品进入市场

>> 满足全部条件 → 自动进入商品市场

| 条件 | 阈值 |
|------|------|
| 供货供应商数 | ≥ 2 家 |
| 最低供货价 | ≤ 指导价 * 0.9 |
| 报价时间差 | < 7 天 |
| 历史履约率 | ≥ 95% |
    `
  },
  {
    title: '5. 业务逻辑图',
    content: `
\`\`\`mermaid
graph TD
    A[添加供货关联] --> B[设置供货价格]
    A --> C[设置供应商优先级]
    A --> D[配置账期/返利]
    B --> E[价格异动校验]
    E --> F{涨幅 > 阈值?}
    F -->|是| G[触发预警]
    G --> H[采购经理审核]
    H --> I{审核通过?}
    I -->|否| J[价格作废]
    I -->|是| K[生效]
    F -->|否| K
    K --> L[计算综合得分]
    L --> M[更新推荐供应商]
    M --> N[选品规则校验]
    N --> O{全部满足?}
    O -->|是| P[进入商品市场]
    O -->|否| Q[待观察池]
    R[手动启停] --> K
\`\`\`
    `
  },
  {
    title: '6. 功能清单',
    content: `
| 模块 | 功能点 | 优先级 | 角色 |
|------|--------|-------|------|
| 基础功能 | 按商品维度查看供货 | P0 | 全员 |
| 基础功能 | 按供应商维度查看供货 | P0 | 全员 |
| 基础功能 | 多条件筛选搜索 | P0 | 全员 |
| 供货管理 | 单个添加供货关联 | P0 | 采购 |
| 供货管理 | 批量关联供应商 | P0 | 采购 |
| 供货管理 | 编辑供货价格 | P0 | 采购 |
| 供货管理 | 启用/暂停供货 | P0 | 采购 |
| 竞价体系 | 多供应商价格横向对比 | P0 | 采购 |
| 竞价体系 | 计算综合得分推荐 | P1 | 采购经理 |
| 价格管理 | 价格历史趋势图 | P1 | 财务/经理 |
| 价格管理 | 异动预警规则配置 | P1 | 采购经理 |
| 选品管理 | 自动进入市场规则配置 | P1 | 运营 |
| 选品管理 | 手动强制进入/退出市场 | P1 | 运营 |
    `
  },
  {
    title: '7. 功能详细说明',
    content: `
### 7.1 双视图切换

| 视图 | 核心用途 |
|------|---------|
| 按商品 | 看单个 SKU 的所有供应商报价，做比价 |
| 按供应商 | 看单个供应商的所有供货 SKU，做管理 |

### 7.2 核心列说明

| 列名 | 特殊处理 |
|------|---------|
| 供应价格 | 有多家时显示价格区间：¥min - ¥max |
| 供应商数量 | 蓝色可点击，打开详情弹层 |
| 进入市场 | 自动/手动 Tag 标记 |

### 7.3 三步骤添加向导
1. **选择商品**：支持按 SPU 批量选择，或单个 SKU
2. **选择供应商**：多选供应商，批量建立关联
3. **设置供货信息**：价格、优先级、账期、备注
    `
  },
  {
    title: '8. Tag 色彩规范',
    content: `
| 状态 | 颜色 | 含义 |
|------|------|------|
| 供货中 | green | 正常供货，可以选品 |
| 已暂停 | orange | 临时暂停，不进入市场 |
| 已终止 | red | 永久终止合作 |
| 自动进入市场 | green | 满足规则自动进入 |
| 手动进入市场 | cyan | 运营强制进入 |
| 未进入市场 | gray | 不满足选品条件 |

**优先级标记：**
| 级别 | 颜色 |
|------|------|
| A级（核心供应商） | #f53f3f |
| B级（重要供应商） | #ff7d00 |
| C级（普通供应商） | #00b42a |
| D级（备选） | #165dff |
    `
  },
  {
    title: '9. 非功能性要求',
    content: `
### 性能要求
- 支持 10000+ SKU 列表流畅滚动
- 批量关联 100 SKU × 10 供应商 < 3 秒
- 价格对比图表加载 < 500ms

### 安全要求
- 供货结算价字段加密存储
- 价格变动操作日志永久保留
- 超过 30% 涨价必须二次确认

### 预警规则
- 单次涨价 > 20% → 预警
- 单日调价 SKU > 50 个 → 预警
- 同一 SKU 7天内调价 > 3 次 → 预警
    `
  }
]

const loading = ref(false)
const viewMode = ref('product')

const searchForm = reactive({
  keyword: '',
  categoryId: '',
  hasSupplier: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const categoryTree = ref([
  { categoryId: '1', categoryName: '水泥建材', children: [
    { categoryId: '1-1', categoryName: '水泥' },
    { categoryId: '1-2', categoryName: '砂石' }
  ]},
  { categoryId: '2', categoryName: '钢材钢筋', children: [
    { categoryId: '2-1', categoryName: '螺纹钢' },
    { categoryId: '2-2', categoryName: '线材' }
  ]},
  { categoryId: '3', categoryName: '陶瓷瓷砖', children: [] },
  { categoryId: '4', categoryName: '涂料油漆', children: [] }
])

const productList = ref([
  {
    skuId: 'SKU001', skuCode: 'SKU001', skuName: '普通硅酸盐水泥P.O42.5', spuName: '普通硅酸盐水泥',
    mainImage: 'https://via.placeholder.com/48', categoryName: '水泥', specs: { 规格: '50kg/袋' },
    platformPrice: 28, supplierCount: 3, autoToMarket: true,
    supplyPriceMin: 26, supplyPriceMax: 28
  },
  {
    skuId: 'SKU002', skuCode: 'SKU002', skuName: '螺纹钢HRB400 Φ12mm', spuName: '螺纹钢HRB400',
    mainImage: 'https://via.placeholder.com/48', categoryName: '螺纹钢', specs: { 规格: 'Φ12mm' },
    platformPrice: 4200, supplierCount: 2, autoToMarket: true,
    supplyPriceMin: 4150, supplyPriceMax: 4180
  },
  {
    skuId: 'SKU003', skuCode: 'SKU003', skuName: '抛光砖 800×800mm', spuName: '抛光砖',
    mainImage: 'https://via.placeholder.com/48', categoryName: '陶瓷瓷砖', specs: { 规格: '800×800mm' },
    platformPrice: 45, supplierCount: 5, autoToMarket: true,
    supplyPriceMin: 38, supplyPriceMax: 44
  },
  {
    skuId: 'SKU004', skuCode: 'SKU004', skuName: '内墙乳胶漆 20L', spuName: '内墙乳胶漆',
    mainImage: 'https://via.placeholder.com/48', categoryName: '涂料油漆', specs: { 规格: '20L/桶' },
    platformPrice: 380, supplierCount: 0, autoToMarket: false,
    supplyPriceMin: undefined, supplyPriceMax: undefined
  }
])

const filteredProducts = computed(() => productList.value)

const selectedSkuKeys = ref<string[]>([])

const productRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedSkuKeys.value,
  onlyCurrent: false,
  onChange: (keys: string[]) => { selectedSkuKeys.value = keys }
}))

const supplierSearchForm = reactive({ keyword: '', status: '' })
const supplierLoading = ref(false)
const supplierPagination = reactive({ current: 1, pageSize: 10, total: 20 })

const supplierList = ref([
  { supplierId: 'SUP001', supplierName: '广东建材供应商', contactPerson: '张经理', contactPhone: '13800138001', productCount: 15, activeCount: 12, pausedCount: 3, status: 'active' },
  { supplierId: 'SUP002', supplierName: '深圳钢材供应商', contactPerson: '李经理', contactPhone: '13800138002', productCount: 8, activeCount: 8, pausedCount: 0, status: 'active' },
  { supplierId: 'SUP003', supplierName: '佛山陶瓷供应商', contactPerson: '王经理', contactPhone: '13800138003', productCount: 22, activeCount: 18, pausedCount: 4, status: 'active' },
  { supplierId: 'SUP004', supplierName: '广州涂料供应商', contactPerson: '赵经理', contactPhone: '13800138004', productCount: 5, activeCount: 5, pausedCount: 0, status: 'inactive' }
])

const filteredSuppliers = computed(() => supplierList.value)

const addSupplyVisible = ref(false)
const batchMode = ref(false)
const addStep = ref(1)
const productSelectMode = ref('spu')
const productSelectorKeyword = ref('')
const productSelectorCategory = ref('')
const supplierSelectorKeyword = ref('')
const tempSelectedSkuKeys = ref<string[]>([])
const tempSelectedSupplierIds = ref<string[]>([])
const expandedSpuIds = ref<string[]>([])

const spuList = ref([
  { spuId: 'SPU001', spuName: '普通硅酸盐水泥', skuList: [
    { skuId: 'SKU001', skuCode: 'SKU001', skuName: '普通硅酸盐水泥P.O42.5', specs: { 规格: '50kg/袋' }, platformPrice: 28, mainImage: 'https://via.placeholder.com/40' },
    { skuId: 'SKU001-2', skuCode: 'SKU001-2', skuName: '普通硅酸盐水泥P.O42.5', specs: { 规格: '25kg/袋' }, platformPrice: 15, mainImage: 'https://via.placeholder.com/40' }
  ]},
  { spuId: 'SPU002', spuName: '螺纹钢HRB400', skuList: [
    { skuId: 'SKU002', skuCode: 'SKU002', skuName: '螺纹钢HRB400 Φ12mm', specs: { 规格: 'Φ12mm' }, platformPrice: 4200, mainImage: 'https://via.placeholder.com/40' },
    { skuId: 'SKU002-2', skuCode: 'SKU002-2', skuName: '螺纹钢HRB400 Φ16mm', specs: { 规格: 'Φ16mm' }, platformPrice: 4150, mainImage: 'https://via.placeholder.com/40' }
  ]},
  { spuId: 'SPU003', spuName: '抛光砖', skuList: [
    { skuId: 'SKU003', skuCode: 'SKU003', skuName: '抛光砖 800×800mm', specs: { 规格: '800×800mm' }, platformPrice: 45, mainImage: 'https://via.placeholder.com/40' }
  ]}
])

const filteredSpuList = computed(() => spuList.value)
const filteredSkuList = computed(() => spuList.value.flatMap(s => s.skuList))
const filteredSupplierList = computed(() => supplierList.value.filter(s => 
  s.supplierName.includes(supplierSelectorKeyword.value)
))

const tempSelectedSkus = computed(() => 
  spuList.value.flatMap(s => s.skuList).filter(sku => tempSelectedSkuKeys.value.includes(sku.skuId))
)

const tempSelectedSuppliers = computed(() => 
  supplierList.value.filter(s => tempSelectedSupplierIds.value.includes(s.supplierId))
)

const supplyForm = reactive({
  supplyPrice: undefined as number | undefined,
  estimatedStock: undefined as number | undefined,
  minOrderQty: undefined as number | undefined,
  leadTime: undefined as number | undefined,
  remark: '',
  autoToMarket: true
})

const supplySkuList = ref<any[]>([])

const productSuppliersVisible = ref(false)
const currentSku = ref<any>(null)
const productSuppliers = ref([
  { supplierId: 'SUP001', supplierName: '广东建材供应商', contactPerson: '张经理', contactPhone: '13800138001', supplyPrice: 26, estimatedStock: 500, minOrderQty: 50, leadTime: 3, unit: '袋', status: 'active', platformPrice: 28, priority: 'A', score: 95, scoreLevel: 'A' },
  { supplierId: 'SUP002', supplierName: '深圳建材供应商', contactPerson: '李经理', contactPhone: '13800138002', supplyPrice: 27, estimatedStock: 300, minOrderQty: 30, leadTime: 2, unit: '袋', status: 'active', platformPrice: 28, priority: 'B', score: 85, scoreLevel: 'B' },
  { supplierId: 'SUP003', supplierName: '佛山建材供应商', contactPerson: '王经理', contactPhone: '13800138003', supplyPrice: 28, estimatedStock: 200, minOrderQty: 20, leadTime: 5, unit: '袋', status: 'paused', platformPrice: 28, priority: 'C', score: 75, scoreLevel: 'C' }
])
const selectedSupplierKeys = ref<string[]>([])
const supplierRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedSupplierKeys.value,
  onlyCurrent: false,
  onChange: (keys: string[]) => { selectedSupplierKeys.value = keys }
}))

const supplierProductsVisible = ref(false)
const currentSupplier = ref<any>(null)
const supplierProducts = ref([
  { skuId: 'SKU001', skuCode: 'SKU001', skuName: '普通硅酸盐水泥P.O42.5', specs: { 规格: '50kg/袋' }, platformPrice: 28, supplyPrice: 26, estimatedStock: 500, minOrderQty: 50, leadTime: 3, unit: '袋', status: 'active' },
  { skuId: 'SKU003', skuCode: 'SKU003', skuName: '抛光砖 800×800mm', specs: { 规格: '800×800mm' }, platformPrice: 45, supplyPrice: 42, estimatedStock: 1000, minOrderQty: 100, leadTime: 7, unit: '片', status: 'active' }
])

const editSupplyPriceVisible = ref(false)
const editSupplyPriceProduct = ref<any>(null)
const editSupplyPriceForm = reactive({
  supplyPrice: 0,
  priceReason: ''
})

const editSupplyVisible = ref(false)
const editSupplyProduct = ref<any>(null)
const editSupplyForm = reactive({
  estimatedStock: 0,
  minOrderQty: 0,
  leadTime: 0,
  remark: '',
  autoToMarket: true
})

function handleViewModeChange() {
  selectedSkuKeys.value = []
}

function handleSearch() {
  pagination.current = 1
}

function handleSupplierSearch() {
  supplierPagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleSupplierPageChange(page: number) {
  supplierPagination.current = page
}

function toggleSpuExpand(spuId: string) {
  const index = expandedSpuIds.value.indexOf(spuId)
  if (index > -1) {
    expandedSpuIds.value.splice(index, 1)
  } else {
    expandedSpuIds.value.push(spuId)
  }
}

function isSpuSelected(spuId: string) {
  const spu = spuList.value.find(s => s.spuId === spuId)
  if (!spu) return false
  return spu.skuList.every(sku => tempSelectedSkuKeys.value.includes(sku.skuId))
}

function isSpuIndeterminate(spuId: string) {
  const spu = spuList.value.find(s => s.spuId === spuId)
  if (!spu) return false
  const selectedCount = spu.skuList.filter(sku => tempSelectedSkuKeys.value.includes(sku.skuId)).length
  return selectedCount > 0 && selectedCount < spu.skuList.length
}

function handleSpuSelect(spu: any, checked: boolean) {
  if (checked) {
    spu.skuList.forEach((sku: any) => {
      if (!tempSelectedSkuKeys.value.includes(sku.skuId)) {
        tempSelectedSkuKeys.value.push(sku.skuId)
      }
    })
  } else {
    spu.skuList.forEach((sku: any) => {
      const index = tempSelectedSkuKeys.value.indexOf(sku.skuId)
      if (index > -1) {
        tempSelectedSkuKeys.value.splice(index, 1)
      }
    })
  }
}

function handleSkuToggle(sku: any) {
  const index = tempSelectedSkuKeys.value.indexOf(sku.skuId)
  if (index > -1) {
    tempSelectedSkuKeys.value.splice(index, 1)
  } else {
    tempSelectedSkuKeys.value.push(sku.skuId)
  }
}

function clearSelectedSkus() {
  tempSelectedSkuKeys.value = []
}

function removeSelectedSku(skuId: string) {
  const index = tempSelectedSkuKeys.value.indexOf(skuId)
  if (index > -1) {
    tempSelectedSkuKeys.value.splice(index, 1)
  }
}

function handleSupplierToggle(supplier: any) {
  const index = tempSelectedSupplierIds.value.indexOf(supplier.supplierId)
  if (index > -1) {
    tempSelectedSupplierIds.value.splice(index, 1)
  } else {
    tempSelectedSupplierIds.value.push(supplier.supplierId)
  }
}

function removeSelectedSupplier(supplierId: string) {
  const index = tempSelectedSupplierIds.value.indexOf(supplierId)
  if (index > -1) {
    tempSelectedSupplierIds.value.splice(index, 1)
  }
}

function handleAddSupply() {
  batchMode.value = false
  addStep.value = 1
  tempSelectedSkuKeys.value = []
  tempSelectedSupplierIds.value = []
  expandedSpuIds.value = []
  productSelectorKeyword.value = ''
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined, remark: '', autoToMarket: true })
  supplySkuList.value = []
  addSupplyVisible.value = true
}

function handleBatchAddSupplier() {
  if (selectedSkuKeys.value.length === 0) {
    Message.warning('请先选择商品')
    return
  }
  batchMode.value = true
  addStep.value = 2
  tempSelectedSkuKeys.value = [...selectedSkuKeys.value]
  tempSelectedSupplierIds.value = []
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined, remark: '', autoToMarket: true })
  supplySkuList.value = tempSelectedSkuKeys.value.map(skuId => {
    const sku = spuList.value.flatMap(s => s.skuList).find(s => s.skuId === skuId)
    return sku ? { ...sku, supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined } : null
  }).filter(Boolean)
  addSupplyVisible.value = true
}

function handleAddSupplyForSku(sku: any) {
  batchMode.value = false
  addStep.value = 2
  tempSelectedSkuKeys.value = [sku.skuId]
  tempSelectedSupplierIds.value = []
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined, remark: '', autoToMarket: true })
  supplySkuList.value = [{ ...sku, supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined }]
  productSuppliersVisible.value = false
  addSupplyVisible.value = true
}

function handleAddProductForSupplier(supplier: any) {
  batchMode.value = false
  addStep.value = 1
  tempSelectedSkuKeys.value = []
  tempSelectedSupplierIds.value = [supplier.supplierId]
  expandedSpuIds.value = []
  productSelectorKeyword.value = ''
  Object.assign(supplyForm, { supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined, remark: '', autoToMarket: true })
  supplySkuList.value = []
  supplierProductsVisible.value = false
  addSupplyVisible.value = true
}

function goToStep3() {
  supplySkuList.value = tempSelectedSkuKeys.value.map(skuId => {
    const sku = spuList.value.flatMap(s => s.skuList).find(s => s.skuId === skuId)
    return sku ? { ...sku, supplyPrice: undefined, estimatedStock: undefined, minOrderQty: undefined, leadTime: undefined } : null
  }).filter(Boolean)
  addStep.value = 3
}

function applyBatchSupply() {
  if (supplyForm.supplyPrice !== undefined) {
    supplySkuList.value.forEach(sku => { sku.supplyPrice = supplyForm.supplyPrice })
  }
  if (supplyForm.estimatedStock !== undefined) {
    supplySkuList.value.forEach(sku => { sku.estimatedStock = supplyForm.estimatedStock })
  }
  if (supplyForm.minOrderQty !== undefined) {
    supplySkuList.value.forEach(sku => { sku.minOrderQty = supplyForm.minOrderQty })
  }
  if (supplyForm.leadTime !== undefined) {
    supplySkuList.value.forEach(sku => { sku.leadTime = supplyForm.leadTime })
  }
  Message.success('批量设置成功')
}

function handleSubmitSupply() {
  if (tempSelectedSkuKeys.value.length === 0) {
    Message.error('请选择商品')
    return
  }
  if (tempSelectedSupplierIds.value.length === 0) {
    Message.error('请选择供应商')
    return
  }
  const hasSupplyPrice = supplySkuList.value.every(sku => 
    sku.supplyPrice !== undefined && sku.supplyPrice > 0
  )
  if (!hasSupplyPrice) {
    Message.warning('请为所有SKU填写供货价')
    return
  }
  Message.success(`成功创建 ${tempSelectedSkuKeys.value.length * tempSelectedSupplierIds.value.length} 条供货关联`)
  addSupplyVisible.value = false
  selectedSkuKeys.value = []
  tempSelectedSkuKeys.value = []
  tempSelectedSupplierIds.value = []
  supplySkuList.value = []
}

function handleViewSuppliers(sku: any) {
  currentSku.value = sku
  productSuppliersVisible.value = true
}

function handleViewProducts(supplier: any) {
  currentSupplier.value = supplier
  supplierProductsVisible.value = true
}

function handleEditSupplyPrice(record: any) {
  editSupplyPriceProduct.value = record
  editSupplyPriceForm.supplyPrice = record.supplyPrice
  editSupplyPriceForm.priceReason = ''
  editSupplyPriceVisible.value = true
}

function handleSaveSupplyPrice() {
  if (editSupplyPriceForm.supplyPrice < 0) {
    Message.warning('供货价不能为负数')
    return
  }
  editSupplyPriceProduct.value.supplyPrice = editSupplyPriceForm.supplyPrice
  Message.success('供货价更新成功')
  editSupplyPriceVisible.value = false
}

function handleEditSupply(record: any) {
  editSupplyProduct.value = record
  Object.assign(editSupplyForm, {
    estimatedStock: record.estimatedStock,
    minOrderQty: record.minOrderQty,
    leadTime: record.leadTime,
    remark: record.remark || '',
    autoToMarket: record.autoToMarket ?? true
  })
  editSupplyVisible.value = true
}

function handleSaveEditSupply() {
  Object.assign(editSupplyProduct.value, {
    estimatedStock: editSupplyForm.estimatedStock,
    minOrderQty: editSupplyForm.minOrderQty,
    leadTime: editSupplyForm.leadTime,
    remark: editSupplyForm.remark,
    autoToMarket: editSupplyForm.autoToMarket
  })
  Message.success('保存成功')
  editSupplyVisible.value = false
}

function handleSupplyAction(record: any, action: string) {
  const actionTexts: Record<string, string> = { active: '恢复', paused: '暂停' }
  Modal.confirm({
    title: `${actionTexts[action]}确认`,
    content: `确定要${actionTexts[action]}该供货关联吗？`,
    onOk: () => {
      record.status = action
      Message.success(`${actionTexts[action]}成功`)
    }
  })
}

function handleDeleteSupply(record: any) {
  Modal.confirm({
    title: '删除确认',
    content: `确定要删除供应商「${record.supplierName}」对该商品的供货关系吗？${
      productSuppliers.value.length === 1 
        ? '<br/><span style="color: rgb(var(--warning-6));">注意：该商品只有此一家供应商，删除后商品将自动从市场下架。</span>' 
        : ''
    }`,
    onOk: () => {
      const index = productSuppliers.value.findIndex(s => s.supplierId === record.supplierId)
      if (index > -1) {
        productSuppliers.value.splice(index, 1)
        
        if (productSuppliers.value.length === 0) {
          if (currentSku.value) {
            const skuIndex = filteredProducts.value.findIndex(p => p.skuId === currentSku.value!.skuId)
            if (skuIndex > -1) {
              filteredProducts.value[skuIndex].supplierCount = 0
            }
          }
          Message.success('供应关系已删除，商品已从市场下架（暂无供应商供货）')
        } else {
          if (currentSku.value) {
            const skuIndex = filteredProducts.value.findIndex(p => p.skuId === currentSku.value!.skuId)
            if (skuIndex > -1) {
              filteredProducts.value[skuIndex].supplierCount = productSuppliers.value.length
            }
          }
          Message.success('供应关系已删除')
        }
      }
    }
  })
}

function handleBatchDeleteSuppliers() {
  if (selectedSupplierKeys.value.length === 0) {
    Message.warning('请先选择要删除的供应商')
    return
  }
  
  const selectedCount = selectedSupplierKeys.value.length
  const willRemoveAll = selectedCount === productSuppliers.value.length
  
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除选中的 <strong>${selectedCount}</strong> 条供货关联吗？${
      willRemoveAll 
        ? '<br/><span style="color: rgb(var(--warning-6));">注意：将删除该商品的所有供应商，删除后商品将自动从市场下架。</span>' 
        : ''
    }`,
    onOk: () => {
      let deletedCount = 0
      
      for (const supplierId of selectedSupplierKeys.value) {
        const index = productSuppliers.value.findIndex(s => s.supplierId === supplierId)
        if (index > -1) {
          productSuppliers.value.splice(index, 1)
          deletedCount++
        }
      }
      
      selectedSupplierKeys.value = []
      
      if (productSuppliers.value.length === 0) {
        if (currentSku.value) {
          const skuIndex = filteredProducts.value.findIndex(p => p.skuId === currentSku.value!.skuId)
          if (skuIndex > -1) {
            filteredProducts.value[skuIndex].supplierCount = 0
          }
        }
        Message.success(`成功删除 ${deletedCount} 条供货关系，商品已从市场下架（暂无供应商供货）`)
      } else {
        if (currentSku.value) {
          const skuIndex = filteredProducts.value.findIndex(p => p.skuId === currentSku.value!.skuId)
          if (skuIndex > -1) {
            filteredProducts.value[skuIndex].supplierCount = productSuppliers.value.length
          }
        }
        Message.success(`成功删除 ${deletedCount} 条供货关系`)
      }
    }
  })
}

function handleChangePriority(record: any) {
  const priorityTexts: Record<string, string> = { A: 'A级', B: 'B级', C: 'C级', D: 'D级' }
  record.scoreLevel = record.priority
  const scores: Record<string, number> = { A: 95, B: 85, C: 75, D: 60 }
  record.score = scores[record.priority] || 85
  Message.success(`供应商优先级已设为 ${priorityTexts[record.priority] || record.priority}`)
}

function getSupplyStatusColor(status: string) {
  const colors: Record<string, string> = { active: 'green', paused: 'orange', platform_off: 'red', stopped: 'gray' }
  return colors[status] || 'gray'
}

function getSupplyStatusText(status: string) {
  const texts: Record<string, string> = { active: '供货中', paused: '暂停供货', platform_off: '平台下架', stopped: '永久停货' }
  return texts[status] || status
}
</script>

<style scoped lang="less">
.page-container { padding: 16px; }
.table-actions { margin-bottom: 16px; display: flex; justify-content: space-between; }
.price-value { color: rgb(var(--primary-6)); font-weight: 500; }
.price-row { display: flex; align-items: center; gap: 8px; }
.price-best { color: #00b42a; font-weight: 600; font-size: 16px; }
.score-value { font-weight: 600; }
.score-A { color: #f53f3f; }
.score-B { color: #ff7d00; }
.score-C { color: #00b42a; }
.score-D { color: #165dff; }
.price-range {
  display: flex;
  align-items: center;
  gap: 2px;
  .price-min { color: rgb(var(--success-6)); font-weight: 500; }
  .price-separator { color: var(--color-text-3); margin: 0 2px; }
  .price-max { color: rgb(var(--danger-6)); font-weight: 500; }
}
.price-empty { color: var(--color-text-4); }
.status-active { color: rgb(var(--success-6)); font-weight: 500; }
.status-paused { color: rgb(var(--warning-6)); font-weight: 500; }
.sub-text { font-size: 12px; color: var(--color-text-3); }
.highlight { color: rgb(var(--primary-6)); font-size: 16px; }

.product-selector, .supplier-selector {
  display: flex;
  gap: 16px;
  height: 400px;
}

.selector-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.selector-right {
  width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.selector-header {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-fill-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-filter {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
}

.selector-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.spu-item {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
  
  &.is-expanded .expand-icon { transform: rotate(90deg); }
}

.spu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-fill-1);
  cursor: pointer;
  
  .expand-icon { transition: transform 0.2s; color: var(--color-text-3); }
  .spu-name { flex: 1; font-weight: 500; }
}

.sku-list {
  padding: 8px;
  background: var(--color-bg-2);
}

.sku-item, .sku-item-flat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover { background: var(--color-fill-2); }
  &.is-selected { background: rgb(var(--primary-1)); }
  
  .sku-code { width: 120px; font-family: monospace; font-size: 12px; }
  .sku-spec { flex: 1; }
  .sku-price { color: rgb(var(--primary-6)); font-weight: 500; }
}

.sku-item-flat {
  .sku-info { flex: 1; }
  .sku-name { font-weight: 500; }
  .sku-meta { font-size: 12px; color: var(--color-text-3); margin-top: 4px; }
}

.supplier-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover { background: var(--color-fill-1); }
  &.is-selected { background: rgb(var(--primary-1)); }
  
  .supplier-info { flex: 1; }
  .supplier-name { font-weight: 500; }
  .supplier-contact { font-size: 12px; color: var(--color-text-3); margin-top: 2px; }
}

.selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-fill-1);
  border-radius: 4px;
  margin-bottom: 8px;
  
  .selected-name { flex: 1; }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.product-info-card {
  background: var(--color-fill-1);
  padding: 12px;
  border-radius: 4px;
  
  .info-row {
    display: flex;
    margin-bottom: 8px;
    
    &:last-child { margin-bottom: 0; }
    .label { color: var(--color-text-3); width: 80px; }
  }
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}
</style>
