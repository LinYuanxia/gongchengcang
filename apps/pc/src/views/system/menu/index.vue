<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索菜单名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd()">
            <template #icon><icon-plus /></template>
            新增菜单
          </a-button>
          <a-button @click="expandAll">展开全部</a-button>
          <a-button @click="collapseAll">收起全部</a-button>
        </a-space>
      </div>
      <a-table
        :data="filteredMenuData"
        :loading="loading"
        :pagination="false"
        row-key="menuId"
        :default-expand-all-rows="true"
        v-model:expanded-keys="expandedKeys"
      >
        <template #columns>
          <a-table-column title="菜单名称" data-index="menuName" :width="200">
            <template #cell="{ record }">
              <span>
                <icon-font v-if="record.icon" :type="record.icon" style="margin-right: 8px" />
                {{ record.menuName }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="菜单编码" data-index="menuCode" :width="150" />
          <a-table-column title="路径" data-index="path" :width="180">
            <template #cell="{ record }">
              {{ record.path || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="类型" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.type === MenuType.DIRECTORY" color="blue">目录</a-tag>
              <a-tag v-else-if="record.type === MenuType.MENU" color="green">菜单</a-tag>
              <a-tag v-else-if="record.type === MenuType.BUTTON" color="orange">按钮</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="80" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleAdd(record)">新增</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm
                  content="确定要删除该菜单吗？"
                  @ok="handleDelete(record)"
                >
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <MenuFormDrawer
      v-model:visible="formVisible"
      :mode="formMode"
      :menu-id="currentMenuId"
      :parent-id="currentParentId"
      :menu-list="menuData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getMenuList, deleteMenu } from '@gongchengcang/api'
import type { Menu } from '@gongchengcang/types'
import { MenuType } from '@gongchengcang/types'
import MenuFormDrawer from './components/MenuFormDrawer.vue'

const loading = ref(false)
const menuData = ref<Menu[]>([])
const expandedKeys = ref<string[]>([])
const searchKeyword = ref('')

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentMenuId = ref('')
const currentParentId = ref('')

const filteredMenuData = computed(() => {
  if (!searchKeyword.value) return menuData.value
  return filterMenuTree(menuData.value, searchKeyword.value.toLowerCase())
})

function filterMenuTree(menus: Menu[], keyword: string): Menu[] {
  return menus.reduce((acc: Menu[], menu) => {
    if (menu.menuName.toLowerCase().includes(keyword) || menu.menuCode.toLowerCase().includes(keyword)) {
      acc.push(menu)
    } else if (menu.children && menu.children.length > 0) {
      const filteredChildren = filterMenuTree(menu.children, keyword)
      if (filteredChildren.length > 0) {
        acc.push({ ...menu, children: filteredChildren })
      }
    }
    return acc
  }, [])
}

function getAllMenuIds(menus: Menu[]): string[] {
  const ids: string[] = []
  menus.forEach(menu => {
    ids.push(menu.menuId)
    if (menu.children) {
      ids.push(...getAllMenuIds(menu.children))
    }
  })
  return ids
}

function expandAll() {
  expandedKeys.value = getAllMenuIds(menuData.value)
}

function collapseAll() {
  expandedKeys.value = []
}

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getMenuList()
    menuData.value = res
    expandedKeys.value = getAllMenuIds(res)
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  if (searchKeyword.value) {
    expandedKeys.value = getAllMenuIds(filteredMenuData.value)
  }
}

function handleAdd(parentMenu?: Menu) {
  formMode.value = 'add'
  currentMenuId.value = ''
  currentParentId.value = parentMenu?.menuId || ''
  formVisible.value = true
}

function handleEdit(record: Menu) {
  formMode.value = 'edit'
  currentMenuId.value = record.menuId
  currentParentId.value = ''
  formVisible.value = true
}

async function handleDelete(record: Menu) {
  try {
    await deleteMenu(record.menuId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

function handleFormSuccess() {
  loadData()
}
</script>

<style scoped>
.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
