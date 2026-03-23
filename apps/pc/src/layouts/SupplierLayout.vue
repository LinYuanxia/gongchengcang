<template>
  <a-layout class="supplier-layout">
    <a-layout-sider
      :collapsed="appStore.collapsed"
      :width="220"
      :collapsed-width="48"
      collapsible
      breakpoint="xl"
      @collapse="appStore.setCollapsed"
    >
      <div class="logo" :class="{ 'logo-collapsed': appStore.collapsed }">
        <img 
          :src="appStore.collapsed ? logoMini : logo" 
          :alt="appStore.collapsed ? 'Logo' : '供应商管理后台'"
          class="logo-image"
        />
      </div>
      <a-menu
        :collapsed="appStore.collapsed"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @menu-item-click="onMenuClick"
        @sub-menu-click="onSubMenuClick"
      >
        <template v-for="menu in menuList" :key="menu.name">
          <a-sub-menu v-if="menu.children?.filter(c => !c.meta?.hidden && !c.meta?.hideInMenu).length" :key="menu.name">
            <template #icon>
              <component :is="getIcon(menu.meta?.icon)" />
            </template>
            <template #title>{{ menu.meta?.title }}</template>
            <a-menu-item v-for="child in menu.children.filter(c => !c.meta?.hidden && !c.meta?.hideInMenu)" :key="child.name">
              {{ child.meta?.title }}
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="menu.name">
            <template #icon>
              <component :is="getIcon(menu.meta?.icon)" />
            </template>
            {{ menu.meta?.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <a-breadcrumb>
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.meta?.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-space>
            <a-tooltip content="小程序预览">
              <a-button type="text" @click="handleOpenMpPreview">
                <template #icon><icon-mobile /></template>
              </a-button>
            </a-tooltip>
            <a-dropdown trigger="hover">
              <a-button type="text" class="platform-btn">
                <template #icon><icon-tag /></template>
                供应商端
                <icon-down style="margin-left: 4px" />
              </a-button>
              <template #content>
                <a-doption @click="handleSwitchPlatform('platform')">
                  <template #icon><icon-settings /></template>
                  平台端
                </a-doption>
                <a-doption @click="handleSwitchPlatform('warehouse')">
                  <template #icon><icon-storage /></template>
                  工程仓端
                </a-doption>
              </template>
            </a-dropdown>
            <a-tooltip content="消息通知">
              <a-badge :count="2" dot>
                <a-button type="text">
                  <template #icon><icon-notification /></template>
                </a-button>
              </a-badge>
            </a-tooltip>
            <a-dropdown>
              <div class="user-info">
                <a-avatar :size="32">
                  <img src="@/assets/images/avatar.png" alt="头像" />
                </a-avatar>
                <span class="user-name">张经理</span>
              </div>
              <template #content>
                <a-doption @click="router.push('/supplier/merchant/profile')">
                  <template #icon><icon-user /></template>
                  主体信息
                </a-doption>
                <a-doption>
                  <template #icon><icon-settings /></template>
                  账号设置
                </a-doption>
                <a-divider style="margin: 4px 0" />
                <a-doption @click="handleLogout">
                  <template #icon><icon-export /></template>
                  退出登录
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
      <a-layout-footer class="footer">
        <span>鸣鸣很忙集团 · 工程材料管理采供一体化平台 - 供应商端</span>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store'
import { setLocal } from '@gongchengcang/utils'
import type { RouteRecordRaw } from 'vue-router'
import logo from '@/assets/images/logo.png'
import logoMini from '@/assets/images/logo-mini.png'
import {
  IconHome,
  IconUser,
  IconApps,
  IconFolder,
  IconTags,
  IconFile,
  IconStorage,
  IconList,
  IconSafe,
  IconSettings,
  IconTag,
} from '@arco-design/web-vue/es/icon'

const iconMap: Record<string, any> = {
  'icon-home': IconHome,
  'icon-user': IconUser,
  'icon-apps': IconApps,
  'icon-folder': IconFolder,
  'icon-shopping-cart': IconTags,
  'icon-file': IconFile,
  'icon-storage': IconStorage,
  'icon-list': IconList,
  'icon-money-collect': IconSafe,
  'icon-settings': IconSettings,
  'icon-tag': IconTag,
}

function getIcon(iconName?: string) {
  if (!iconName) return null
  return iconMap[iconName] || null
}

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

const menuList = computed(() => {
  const layoutRoute = router.options.routes.find((r: RouteRecordRaw) => r.path === '/supplier')
  return layoutRoute?.children?.filter((r: RouteRecordRaw) => !r.meta?.hidden) || []
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((r) => r.meta?.title)
  return matched
})

watch(
  () => route.name,
  (name) => {
    if (name) {
      selectedKeys.value = [name as string]
      const parentName = route.matched[route.matched.length - 2]?.name
      if (parentName) {
        openKeys.value = [parentName as string]
      }
    }
  },
  { immediate: true }
)

function onMenuClick(key: string) {
  router.push({ name: key })
}

function onSubMenuClick(key: string) {
  if (openKeys.value.includes(key)) {
    openKeys.value = openKeys.value.filter((k) => k !== key)
  } else {
    openKeys.value.push(key)
  }
}

function handleSwitchPlatform(platform: string) {
  setLocal('currentPlatform', platform)
  if (platform === 'platform') {
    router.push('/dashboard')
  } else if (platform === 'warehouse') {
    router.push('/warehouse/dashboard')
  }
}

function handleOpenMpPreview() {
  router.push('/mp-preview?role=supplier')
}

function handleLogout() {
  router.push('/login')
}
</script>

<style scoped lang="less">
.supplier-layout {
  min-height: 100vh;
}

.logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  padding: 0 16px;
  transition: all 0.2s;

  &.logo-collapsed {
    padding: 0;
  }

  .logo-image {
    height: 32px;
    max-width: 100%;
    object-fit: contain;
    transition: all 0.2s;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  height: 48px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.platform-btn {
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: var(--color-fill-2);
  }

  .user-name {
    margin-left: 8px;
    font-size: 14px;
  }
}

.content {
  padding: 0;
  background: var(--color-fill-2);
  overflow: auto;
}

.footer {
  text-align: center;
  color: var(--color-text-3);
  font-size: 12px;
  padding: 12px 0;
  background: var(--color-bg-2);
  border-top: 1px solid var(--color-border);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
