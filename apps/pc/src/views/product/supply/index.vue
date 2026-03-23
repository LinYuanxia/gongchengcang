<template>
  <div class="page-container">
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
            <a-table-column title="平台供货价" :width="100">
              <template #cell="{ record }">
                <span class="price-value">¥{{ record.platformPrice?.toFixed(2) }}</span>
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
                @search="handleProductSelectorSearch"
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
          <a-button type="primary" :disabled="tempSelectedSupplierIds.length === 0" @click="addStep = 3">
            下一步 (已选{{ tempSelectedSupplierIds.length }}家供应商)
          </a-button>
        </div>
      </div>

      <div v-else-if="addStep === 3">
        <div class="supply-form-section">
          <a-alert type="info" style="margin-bottom: 16px">
            供货价将使用平台标准供货价，供应商可在其端查看。以下信息将应用到所有选中的商品和供应商组合。
          </a-alert>
          
          <div class="summary-info">
            <a-descriptions :column="3" bordered>
              <a-descriptions-item label="已选商品">
                <strong>{{ tempSelectedSkuKeys.length }}</strong> 个SKU
              </a-descriptions-item>
              <a-descriptions-item label="已选供应商">
                <strong>{{ tempSelectedSupplierIds.length }}</strong> 家
              </a-descriptions-item>
              <a-descriptions-item label="将创建关联">
                <strong class="highlight">{{ tempSelectedSkuKeys.length * tempSelectedSupplierIds.length }}</strong> 条
              </a-descriptions-item>
            </a-descriptions>
          </div>
          
          <a-divider>设置供货信息</a-divider>
          
          <a-form :model="supplyForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="预计供货量" required>
                  <a-input-number v-model="supplyForm.estimatedStock" :min="0" style="width: 100%" placeholder="请输入">
                    <template #suffix>单位</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最小起订量" required>
                  <a-input-number v-model="supplyForm.minOrderQty" :min="1" style="width: 100%" placeholder="请输入">
                    <template #suffix>单位</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="供货周期" required>
                  <a-input-number v-model="supplyForm.leadTime" :min="1" style="width: 100%" placeholder="请输入">
                    <template #suffix>天</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="自动进入商品市场">
              <a-switch v-model="supplyForm.autoToMarket" />
              <span class="form-tip" style="margin-left: 12px; color: var(--color-text-3)">
                开启后，该商品将自动进入商品市场待上架列表
              </span>
            </a-form-item>
            <a-form-item label="备注">
              <a-textarea v-model="supplyForm.remark" placeholder="请输入备注（选填）" :max-length="200" />
            </a-form-item>
          </a-form>
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
      :width="900"
      :footer="false"
    >
      <template #extra>
        <a-button type="primary" size="small" @click="handleAddSupplyForSku(currentSku)">
          <template #icon><icon-plus /></template>
          添加供应商
        </a-button>
      </template>
      
      <a-table :data="productSuppliers" :pagination="false">
        <template #columns>
          <a-table-column title="供应商" :width="180">
            <template #cell="{ record }">
              <div>
                <div>{{ record.supplierName }}</div>
                <div class="sub-text">{{ record.contactPerson }} {{ record.contactPhone }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供货价" :width="100">
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
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditSupply(record)">编辑</a-button>
                <a-dropdown v-if="record.status !== 'stopped'" @select="(key: string) => handleSupplyAction(record, key)">
                  <a-button type="text" size="small">
                    操作<icon-down />
                  </a-button>
                  <template #content>
                    <a-doption v-if="record.status === 'active'" value="platform_off">下架</a-doption>
                    <a-doption v-if="record.status === 'platform_off'" value="active">恢复</a-doption>
                    <a-doption v-if="record.status === 'paused'" value="active">恢复</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="supplierProductsVisible" 
      :title="`${currentSupplier?.supplierName || ''} - 供货商品`" 
      :width="1000"
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
          <a-table-column title="SKU编码" data-index="skuCode" :width="140" />
          <a-table-column title="商品名称" data-index="skuName" :width="160" />
          <a-table-column title="分类" data-index="categoryName" :width="80" />
          <a-table-column title="供货价" :width="100">
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
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditSupply(record)">编辑</a-button>
                <a-dropdown v-if="record.status !== 'stopped'" @select="(key: string) => handleSupplyAction(record, key)">
                  <a-button type="text" size="small">
                    操作<icon-down />
                  </a-button>
                  <template #content>
                    <a-doption v-if="record.status === 'active'" value="platform_off">下架</a-doption>
                    <a-doption v-if="record.status === 'platform_off'" value="active">恢复</a-doption>
                    <a-doption v-if="record.status === 'paused'" value="active">恢复</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="editSupplyVisible" 
      title="编辑供货信息" 
      :width="600"
      @ok="handleSaveEditSupply"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="商品名称">{{ editSupplyProduct?.skuName }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ editSupplyProduct?.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="平台供货价">
          <span class="price-value">¥{{ editSupplyProduct?.platformPrice?.toFixed(2) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="当前供货价">
          <span class="price-value">¥{{ editSupplyProduct?.supplyPrice?.toFixed(2) }}</span>
          <a-tag size="small" color="gray" style="margin-left: 8px">平台定价</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>可编辑信息</a-divider>

      <a-form :model="editSupplyForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="预计供货量" required>
              <a-input-number v-model="editSupplyForm.estimatedStock" :min="0" style="width: 100%">
                <template #suffix>{{ editSupplyProduct?.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最小起订量" required>
              <a-input-number v-model="editSupplyForm.minOrderQty" :min="1" style="width: 100%">
                <template #suffix>{{ editSupplyProduct?.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="供货周期" required>
              <a-input-number v-model="editSupplyForm.leadTime" :min="1" style="width: 100%">
                <template #suffix>天</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="自动进入商品市场">
          <a-switch v-model="editSupplyForm.autoToMarket" />
          <span class="form-tip" style="margin-left: 12px; color: var(--color-text-3)">
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
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import type { ProductCategory } from '@gongchengcang/types'

const loading = ref(false)
const supplierLoading = ref(false)
const viewMode = ref('product')
const addSupplyVisible = ref(false)
const productSuppliersVisible = ref(false)
const supplierProductsVisible = ref(false)
const editSupplyVisible = ref(false)
const batchMode = ref(false)
const addStep = ref(1)
const currentSku = ref<any>(null)
const currentSupplier = ref<any>(null)
const editSupplyProduct = ref<any>(null)
const selectedSkuKeys = ref<string[]>([])

const productSelectMode = ref<'spu' | 'sku'>('spu')
const productSelectorKeyword = ref('')
const productSelectorCategory = ref<string[] | undefined>()
const expandedSpuIds = ref<string[]>([])
const tempSelectedSkuKeys = ref<string[]>([])
const tempSelectedSupplierIds = ref<string[]>([])
const supplierSelectorKeyword = ref('')

const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const supplierPagination = reactive({ current: 1, pageSize: 10, total: 0 })

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  hasSupplier: undefined as string | undefined,
})

const supplierSearchForm = reactive({
  keyword: '',
  status: undefined as string | undefined,
})

const supplyForm = reactive({
  estimatedStock: 100,
  minOrderQty: 10,
  leadTime: 3,
  remark: '',
  autoToMarket: true,
})

const editSupplyForm = reactive({
  estimatedStock: 0,
  minOrderQty: 0,
  leadTime: 0,
  remark: '',
  autoToMarket: true,
})

const categoryTree = ref<ProductCategory[]>([])

const productRowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedSkuKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedSkuKeys.value = keys
  },
}))

const spuList = ref([
  {
    spuId: 'SPU001',
    spuName: '螺纹钢 HRB400E',
    categoryName: '螺纹钢',
    skuList: [
      { skuId: 'SKU001', skuCode: 'GJ-LWG-001-0001', skuName: '螺纹钢HRB400-12mm', specs: { '规格': '12mm' }, unit: '吨', platformPrice: 3500, mainImage: 'https://via.placeholder.com/200' },
      { skuId: 'SKU002', skuCode: 'GJ-LWG-001-0002', skuName: '螺纹钢HRB400-16mm', specs: { '规格': '16mm' }, unit: '吨', platformPrice: 3550, mainImage: 'https://via.placeholder.com/200' },
      { skuId: 'SKU003', skuCode: 'GJ-LWG-001-0003', skuName: '螺纹钢HRB400-20mm', specs: { '规格': '20mm' }, unit: '吨', platformPrice: 3600, mainImage: 'https://via.placeholder.com/200' },
      { skuId: 'SKU004', skuCode: 'GJ-LWG-001-0004', skuName: '螺纹钢HRB400-25mm', specs: { '规格': '25mm' }, unit: '吨', platformPrice: 3650, mainImage: 'https://via.placeholder.com/200' },
    ],
  },
  {
    spuId: 'SPU002',
    spuName: '螺纹钢 HRB500',
    categoryName: '螺纹钢',
    skuList: [
      { skuId: 'SKU005', skuCode: 'GJ-LWG-002-0001', skuName: '螺纹钢HRB500-12mm', specs: { '规格': '12mm' }, unit: '吨', platformPrice: 3700, mainImage: 'https://via.placeholder.com/200' },
      { skuId: 'SKU006', skuCode: 'GJ-LWG-002-0002', skuName: '螺纹钢HRB500-16mm', specs: { '规格': '16mm' }, unit: '吨', platformPrice: 3750, mainImage: 'https://via.placeholder.com/200' },
    ],
  },
  {
    spuId: 'SPU003',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    skuList: [
      { skuId: 'SKU007', skuCode: 'SN-PT-001-0001', skuName: '水泥P.O42.5', specs: { '强度等级': 'P.O42.5' }, unit: '吨', platformPrice: 380, mainImage: 'https://via.placeholder.com/200' },
      { skuId: 'SKU008', skuCode: 'SN-PT-001-0002', skuName: '水泥P.O52.5', specs: { '强度等级': 'P.O52.5' }, unit: '吨', platformPrice: 420, mainImage: 'https://via.placeholder.com/200' },
    ],
  },
  {
    spuId: 'SPU004',
    spuName: '线材 HPB300',
    categoryName: '线材',
    skuList: [
      { skuId: 'SKU009', skuCode: 'XC-HPB-001-0001', skuName: '线材HPB300-6mm', specs: { '规格': '6mm' }, unit: '吨', platformPrice: 3300, mainImage: 'https://via.placeholder.com/200' },
      { skuId: 'SKU010', skuCode: 'XC-HPB-001-0002', skuName: '线材HPB300-8mm', specs: { '规格': '8mm' }, unit: '吨', platformPrice: 3350, mainImage: 'https://via.placeholder.com/200' },
    ],
  },
])

const allSkuList = computed(() => {
  return spuList.value.flatMap(spu => spu.skuList.map(sku => ({ ...sku, spuId: spu.spuId, spuName: spu.spuName, categoryName: spu.categoryName })))
})

const filteredSpuList = computed(() => {
  let result = spuList.value
  if (productSelectorKeyword.value) {
    const keyword = productSelectorKeyword.value.toLowerCase()
    result = result.filter(spu => 
      spu.spuName.toLowerCase().includes(keyword) ||
      spu.skuList.some(sku => sku.skuCode.toLowerCase().includes(keyword) || sku.skuName.toLowerCase().includes(keyword))
    )
  }
  return result
})

const filteredSkuList = computed(() => {
  let result = allSkuList.value
  if (productSelectorKeyword.value) {
    const keyword = productSelectorKeyword.value.toLowerCase()
    result = result.filter(sku => 
      sku.skuName.toLowerCase().includes(keyword) || 
      sku.skuCode.toLowerCase().includes(keyword) ||
      sku.spuName?.toLowerCase().includes(keyword)
    )
  }
  return result
})

const filteredSupplierList = computed(() => {
  let result = suppliers.value
  if (supplierSelectorKeyword.value) {
    const keyword = supplierSelectorKeyword.value.toLowerCase()
    result = result.filter(s => s.supplierName.toLowerCase().includes(keyword))
  }
  return result
})

const tempSelectedSkus = computed(() => {
  return allSkuList.value.filter(sku => tempSelectedSkuKeys.value.includes(sku.skuId))
})

const tempSelectedSuppliers = computed(() => {
  return suppliers.value.filter(s => tempSelectedSupplierIds.value.includes(s.supplierId))
})

const products = ref([
  { skuId: 'SKU001', skuCode: 'GJ-LWG-001-0001', skuName: '螺纹钢HRB400-12mm', spuName: '螺纹钢 HRB400E', categoryName: '螺纹钢', specs: { '规格': '12mm' }, unit: '吨', mainImage: 'https://via.placeholder.com/200', platformPrice: 3500, supplierCount: 2 },
  { skuId: 'SKU002', skuCode: 'GJ-LWG-001-0002', skuName: '螺纹钢HRB400-16mm', spuName: '螺纹钢 HRB400E', categoryName: '螺纹钢', specs: { '规格': '16mm' }, unit: '吨', mainImage: 'https://via.placeholder.com/200', platformPrice: 3550, supplierCount: 1 },
  { skuId: 'SKU003', skuCode: 'GJ-LWG-001-0003', skuName: '螺纹钢HRB400-20mm', spuName: '螺纹钢 HRB400E', categoryName: '螺纹钢', specs: { '规格': '20mm' }, unit: '吨', mainImage: 'https://via.placeholder.com/200', platformPrice: 3600, supplierCount: 0 },
  { skuId: 'SKU004', skuCode: 'GJ-LWG-001-0004', skuName: '螺纹钢HRB400-25mm', spuName: '螺纹钢 HRB400E', categoryName: '螺纹钢', specs: { '规格': '25mm' }, unit: '吨', mainImage: 'https://via.placeholder.com/200', platformPrice: 3650, supplierCount: 0 },
  { skuId: 'SKU007', skuCode: 'SN-PT-001-0001', skuName: '水泥P.O42.5', spuName: '普通硅酸盐水泥', categoryName: '水泥', specs: { '强度等级': 'P.O42.5' }, unit: '吨', mainImage: 'https://via.placeholder.com/200', platformPrice: 380, supplierCount: 1 },
  { skuId: 'SKU008', skuCode: 'SN-PT-001-0002', skuName: '水泥P.O52.5', spuName: '普通硅酸盐水泥', categoryName: '水泥', specs: { '强度等级': 'P.O52.5' }, unit: '吨', mainImage: 'https://via.placeholder.com/200', platformPrice: 420, supplierCount: 0 },
])

const suppliers = ref([
  { supplierId: 'SUP001', supplierName: '宝钢集团有限公司', contactPerson: '张经理', contactPhone: '138-0000-0001', status: 'active', productCount: 3, activeCount: 2, pausedCount: 1 },
  { supplierId: 'SUP002', supplierName: '海螺水泥股份有限公司', contactPerson: '李经理', contactPhone: '139-0000-0002', status: 'active', productCount: 2, activeCount: 1, pausedCount: 1 },
  { supplierId: 'SUP003', supplierName: '鞍钢集团有限公司', contactPerson: '王经理', contactPhone: '137-0000-0003', status: 'active', productCount: 1, activeCount: 1, pausedCount: 0 },
])

const productSuppliers = ref([
  { id: 'PS001', skuId: 'SKU001', supplierId: 'SUP001', supplierName: '宝钢集团有限公司', contactPerson: '张经理', contactPhone: '138-0000-0001', supplyPrice: 3500, platformPrice: 3500, estimatedStock: 500, minOrderQty: 10, leadTime: 3, unit: '吨', status: 'active' },
  { id: 'PS002', skuId: 'SKU001', supplierId: 'SUP003', supplierName: '鞍钢集团有限公司', contactPerson: '王经理', contactPhone: '137-0000-0003', supplyPrice: 3500, platformPrice: 3500, estimatedStock: 300, minOrderQty: 5, leadTime: 5, unit: '吨', status: 'active' },
])

const supplierProducts = ref([
  { id: 'SP001', skuId: 'SKU001', skuCode: 'GJ-LWG-001-0001', skuName: '螺纹钢HRB400-12mm', categoryName: '螺纹钢', unit: '吨', supplyPrice: 3500, platformPrice: 3500, estimatedStock: 500, minOrderQty: 10, leadTime: 3, status: 'active' },
  { id: 'SP002', skuId: 'SKU002', skuCode: 'GJ-LWG-001-0002', skuName: '螺纹钢HRB400-16mm', categoryName: '螺纹钢', unit: '吨', supplyPrice: 3550, platformPrice: 3550, estimatedStock: 300, minOrderQty: 5, leadTime: 5, status: 'paused' },
])

const filteredProducts = computed(() => {
  let result = products.value
  if (searchForm.hasSupplier === 'yes') result = result.filter(p => p.supplierCount > 0)
  else if (searchForm.hasSupplier === 'no') result = result.filter(p => p.supplierCount === 0)
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(p => p.skuName.toLowerCase().includes(keyword) || p.skuCode.toLowerCase().includes(keyword))
  }
  return result
})

const filteredSuppliers = computed(() => {
  let result = suppliers.value
  if (supplierSearchForm.status) result = result.filter(s => s.status === supplierSearchForm.status)
  if (supplierSearchForm.keyword) {
    const keyword = supplierSearchForm.keyword.toLowerCase()
    result = result.filter(s => s.supplierName.toLowerCase().includes(keyword))
  }
  return result
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

function handleProductSelectorSearch() {}

function toggleSpuExpand(spuId: string) {
  const index = expandedSpuIds.value.indexOf(spuId)
  if (index > -1) expandedSpuIds.value.splice(index, 1)
  else expandedSpuIds.value.push(spuId)
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
  const skuIds = spu.skuList.map((s: any) => s.skuId)
  if (checked) {
    skuIds.forEach((id: string) => {
      if (!tempSelectedSkuKeys.value.includes(id)) tempSelectedSkuKeys.value.push(id)
    })
  } else {
    tempSelectedSkuKeys.value = tempSelectedSkuKeys.value.filter(id => !skuIds.includes(id))
  }
}

function handleSkuToggle(sku: any) {
  const index = tempSelectedSkuKeys.value.indexOf(sku.skuId)
  if (index > -1) tempSelectedSkuKeys.value.splice(index, 1)
  else tempSelectedSkuKeys.value.push(sku.skuId)
}

function clearSelectedSkus() {
  tempSelectedSkuKeys.value = []
}

function removeSelectedSku(skuId: string) {
  const index = tempSelectedSkuKeys.value.indexOf(skuId)
  if (index > -1) tempSelectedSkuKeys.value.splice(index, 1)
}

function handleSupplierToggle(supplier: any) {
  const index = tempSelectedSupplierIds.value.indexOf(supplier.supplierId)
  if (index > -1) tempSelectedSupplierIds.value.splice(index, 1)
  else tempSelectedSupplierIds.value.push(supplier.supplierId)
}

function removeSelectedSupplier(supplierId: string) {
  const index = tempSelectedSupplierIds.value.indexOf(supplierId)
  if (index > -1) tempSelectedSupplierIds.value.splice(index, 1)
}

function handleAddSupply() {
  batchMode.value = true
  addStep.value = 1
  tempSelectedSkuKeys.value = []
  tempSelectedSupplierIds.value = []
  expandedSpuIds.value = []
  productSelectorKeyword.value = ''
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { estimatedStock: 100, minOrderQty: 10, leadTime: 3, remark: '', autoToMarket: true })
  addSupplyVisible.value = true
}

function handleBatchAddSupplier() {
  if (selectedSkuKeys.value.length === 0) {
    Message.warning('请先选择商品')
    return
  }
  batchMode.value = true
  addStep.value = 1
  tempSelectedSkuKeys.value = [...selectedSkuKeys.value]
  tempSelectedSupplierIds.value = []
  expandedSpuIds.value = []
  productSelectorKeyword.value = ''
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { estimatedStock: 100, minOrderQty: 10, leadTime: 3, remark: '', autoToMarket: true })
  addSupplyVisible.value = true
}

function handleAddSupplyForSku(sku: any) {
  batchMode.value = false
  addStep.value = 1
  currentSku.value = sku
  tempSelectedSkuKeys.value = [sku.skuId]
  tempSelectedSupplierIds.value = []
  expandedSpuIds.value = []
  productSelectorKeyword.value = ''
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { estimatedStock: 100, minOrderQty: 10, leadTime: 3, remark: '', autoToMarket: true })
  addSupplyVisible.value = true
}

function handleAddProductForSupplier(supplier: any) {
  batchMode.value = false
  addStep.value = 1
  currentSupplier.value = supplier
  tempSelectedSkuKeys.value = []
  tempSelectedSupplierIds.value = [supplier.supplierId]
  expandedSpuIds.value = []
  productSelectorKeyword.value = ''
  supplierSelectorKeyword.value = ''
  Object.assign(supplyForm, { estimatedStock: 100, minOrderQty: 10, leadTime: 3, remark: '', autoToMarket: true })
  addSupplyVisible.value = true
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
  Message.success(`成功创建 ${tempSelectedSkuKeys.value.length * tempSelectedSupplierIds.value.length} 条供货关联`)
  addSupplyVisible.value = false
  selectedSkuKeys.value = []
  tempSelectedSkuKeys.value = []
  tempSelectedSupplierIds.value = []
}

function handleViewSuppliers(sku: any) {
  currentSku.value = sku
  productSuppliersVisible.value = true
}

function handleViewProducts(supplier: any) {
  currentSupplier.value = supplier
  supplierProductsVisible.value = true
}

function handleEditSupply(record: any) {
  editSupplyProduct.value = record
  Object.assign(editSupplyForm, {
    estimatedStock: record.estimatedStock,
    minOrderQty: record.minOrderQty,
    leadTime: record.leadTime,
    remark: record.remark || '',
    autoToMarket: record.autoToMarket ?? true,
  })
  editSupplyVisible.value = true
}

function handleSaveEditSupply() {
  Object.assign(editSupplyProduct.value, {
    estimatedStock: editSupplyForm.estimatedStock,
    minOrderQty: editSupplyForm.minOrderQty,
    leadTime: editSupplyForm.leadTime,
    remark: editSupplyForm.remark,
    autoToMarket: editSupplyForm.autoToMarket,
  })
  Message.success('保存成功')
  editSupplyVisible.value = false
}

function handleSupplyAction(record: any, action: string) {
  const actionTexts: Record<string, string> = { platform_off: '下架', active: '恢复' }
  Modal.confirm({
    title: `${actionTexts[action]}确认`,
    content: `确定要${actionTexts[action]}该供货关联吗？`,
    onOk: () => {
      record.status = action
      Message.success(`${actionTexts[action]}成功`)
    },
  })
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
  
  &.is-expanded {
    .expand-icon { transform: rotate(90deg); }
  }
}

.spu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-fill-1);
  cursor: pointer;
  
  .expand-icon {
    transition: transform 0.2s;
    color: var(--color-text-3);
  }
  
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
  margin-bottom: 4px;
  
  .sku-info {
    flex: 1;
    .sku-name { font-weight: 500; margin-bottom: 2px; }
    .sku-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}

.supplier-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover { background: var(--color-fill-2); }
  &.is-selected { background: rgb(var(--primary-1)); }
  
  .supplier-info {
    flex: 1;
    .supplier-name { font-weight: 500; }
    .supplier-contact { font-size: 12px; color: var(--color-text-3); margin-top: 2px; }
  }
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
  margin-bottom: 4px;
  
  .selected-name { flex: 1; font-size: 13px; }
  .selected-spec { display: flex; gap: 4px; }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.supply-form-section {
  .summary-info { margin-bottom: 16px; }
}
</style>
