<template>
  <a-drawer
    :visible="visible"
    :title="mode === 'add' ? (parentId ? '新增子菜单' : '新增菜单') : '编辑菜单'"
    :width="600"
    :footer="true"
    @cancel="handleClose"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="parentId" label="上级菜单">
        <a-tree-select
          v-model="formData.parentId"
          :data="menuTreeData"
          placeholder="请选择上级菜单（不选则为一级菜单）"
          allow-clear
          :field-names="{ key: 'menuId', title: 'menuName', children: 'children' }"
          :tree-props="{ defaultExpandAll: true }"
        />
      </a-form-item>
      <a-form-item field="menuName" label="菜单名称" :rules="[{ required: true, message: '请输入菜单名称' }]">
        <a-input v-model="formData.menuName" placeholder="请输入菜单名称" :max-length="50" />
      </a-form-item>
      <a-form-item field="menuCode" label="菜单编码" :rules="[{ required: true, message: '请输入菜单编码' }]">
        <a-input v-model="formData.menuCode" placeholder="请输入菜单编码（唯一标识）" :max-length="50" />
      </a-form-item>
      <a-form-item field="type" label="菜单类型" :rules="[{ required: true, message: '请选择菜单类型' }]">
        <a-radio-group v-model="formData.type">
          <a-radio :value="MenuType.DIRECTORY">目录</a-radio>
          <a-radio :value="MenuType.MENU">菜单</a-radio>
          <a-radio :value="MenuType.BUTTON">按钮</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="formData.type !== MenuType.BUTTON" field="path" label="路由路径" :rules="[{ required: formData.type === MenuType.MENU, message: '请输入路由路径' }]">
        <a-input v-model="formData.path" placeholder="请输入路由路径，如 /system/user" :max-length="200" />
      </a-form-item>
      <a-form-item v-if="formData.type !== MenuType.BUTTON" field="component" label="组件路径">
        <a-input v-model="formData.component" placeholder="请输入组件路径，如 views/system/user/index.vue" :max-length="200" />
      </a-form-item>
      <a-form-item v-if="formData.type !== MenuType.BUTTON" field="icon" label="菜单图标">
        <a-input v-model="formData.icon" placeholder="请输入图标名称，如 icon-home" :max-length="50" />
      </a-form-item>
      <a-form-item v-if="formData.type === MenuType.BUTTON" field="perms" label="权限标识">
        <a-input v-model="formData.perms" placeholder="请输入权限标识，如 system:user:add" :max-length="100" />
      </a-form-item>
      <a-form-item field="sort" label="排序" :rules="[{ required: true, message: '请输入排序' }]">
        <a-input-number v-model="formData.sort" placeholder="请输入排序" :min="0" :max="999" style="width: 100%" />
      </a-form-item>
      <a-form-item field="visible" label="是否可见">
        <a-radio-group v-model="formData.visible">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-radio-group v-model="formData.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getMenuDetail, createMenu, updateMenu } from '@gongchengcang/api'
import type { Menu } from '@gongchengcang/types'
import { MenuType } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  menuId: string
  parentId: string
  menuList: Menu[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const submitLoading = ref(false)

const defaultFormData = {
  parentId: '',
  menuName: '',
  menuCode: '',
  type: MenuType.MENU,
  path: '',
  icon: '',
  sort: 0,
  visible: 1,
  status: 1,
  component: '',
  perms: '',
}

const formData = ref({ ...defaultFormData })

const menuTreeData = computed(() => {
  const filterMenus = (menus: Menu[]): any[] => {
    return menus
      .filter(m => m.type !== MenuType.BUTTON)
      .map(m => {
        const item: any = {
          menuId: m.menuId,
          menuName: m.menuName,
        }
        if (m.children && m.children.length > 0) {
          const filteredChildren = filterMenus(m.children)
          if (filteredChildren.length > 0) {
            item.children = filteredChildren
          }
        }
        return item
      })
  }
  return filterMenus(props.menuList)
})

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      if (props.mode === 'edit' && props.menuId) {
        await loadMenuDetail()
      } else {
        formData.value = {
          ...defaultFormData,
          parentId: props.parentId || '',
        }
      }
    }
  }
)

async function loadMenuDetail() {
  try {
    const res = await getMenuDetail(props.menuId)
    formData.value = {
      parentId: res.parentId || '',
      menuName: res.menuName,
      menuCode: res.menuCode,
      type: res.type,
      path: res.path || '',
      icon: res.icon || '',
      sort: res.sort,
      visible: res.visible,
      status: res.status,
      component: res.component || '',
      perms: res.perms || '',
    }
  } catch (error: any) {
    Message.error(error.message || '获取菜单详情失败')
  }
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitLoading.value = true
  try {
    const data = {
      parentId: formData.value.parentId || undefined,
      menuName: formData.value.menuName,
      menuCode: formData.value.menuCode,
      type: formData.value.type,
      path: formData.value.path || undefined,
      icon: formData.value.icon || undefined,
      sort: formData.value.sort,
      visible: formData.value.visible,
      status: formData.value.status,
      component: formData.value.component || undefined,
      perms: formData.value.perms || undefined,
    }

    if (props.mode === 'edit') {
      await updateMenu(props.menuId, data)
      Message.success('修改成功')
    } else {
      await createMenu(data)
      Message.success('添加成功')
    }
    emit('success')
    handleClose()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}
</script>
