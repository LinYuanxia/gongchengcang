<template>
  <a-layout class="basic-layout">
    <a-layout-sider
      :collapsed="appStore.collapsed"
      :width="220"
      :collapsed-width="48"
      collapsible
      breakpoint="xl"
      @collapse="appStore.setCollapsed"
    >
      <div class="logo" :class="{ 'logo-collapsed': appStore.collapsed }">
        <span v-if="!appStore.collapsed" class="logo-text">工程-采供一体化平台</span>
        <span v-else class="logo-text-mini">工程</span>
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
                <template #icon><component :is="currentPlatformInfo.icon" /></template>
                {{ currentPlatformInfo.label }}
                <icon-down style="margin-left: 4px" />
              </a-button>
              <template #content>
                <a-doption
                  v-for="item in platformOptions"
                  :key="item.value"
                  @click="handleSwitchPlatform(item.value)"
                >
                  <template #icon><component :is="item.icon" /></template>
                  {{ item.label }}
                </a-doption>
              </template>
            </a-dropdown>
            <a-tooltip content="搜索">
              <a-button type="text">
                <template #icon><icon-search /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="消息通知">
              <a-badge :count="3" dot>
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
                <span class="user-name">王飞</span>
              </div>
              <template #content>
                <a-doption>
                  <template #icon><icon-user /></template>
                  个人中心
                </a-doption>
                <a-doption>
                  <template #icon><icon-settings /></template>
                  系统设置
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
        <span>集团开发中心</span>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { getLocal, setLocal } from '@gongchengcang/utils'
import type { RouteRecordRaw } from 'vue-router'
import {
  IconDashboard,
  IconUserGroup,
  IconApps,
  IconTags,
  IconFolder,
  IconFile,
  IconCalendar,
  IconStorage,
  IconHome,
  IconSafe,
  IconSettings,
  IconUser,
  IconTag,
  IconTool,
  IconList,
} from '@arco-design/web-vue/es/icon'

const iconMap: Record<string, any> = {
  'icon-dashboard': IconDashboard,
  'icon-user-group': IconUserGroup,
  'icon-apps': IconApps,
  'icon-tags': IconTags,
  'icon-folder': IconFolder,
  'icon-file': IconFile,
  'icon-calendar': IconCalendar,
  'icon-storage': IconStorage,
  'icon-home': IconHome,
  'icon-money-collect': IconSafe,
  'icon-settings': IconSettings,
  'icon-user': IconUser,
  'icon-tag': IconTag,
  'icon-tool': IconTool,
  'icon-shopping-cart': IconTags,
  'icon-list': IconList,
}

function getIcon(iconName?: string) {
  if (!iconName) return null
  return iconMap[iconName] || null
}

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

const currentPlatform = ref(getLocal('currentPlatform') || 'platform')

const platformOptions = [
  { value: 'platform', label: '平台端', icon: 'icon-settings' },
  { value: 'supplier', label: '供应商端', icon: 'icon-tag' },
  { value: 'constructor', label: '施工方端', icon: 'icon-tool' },
  { value: 'warehouse', label: '工程仓端', icon: 'icon-storage' },
]

const currentPlatformInfo = computed(() => {
  return platformOptions.find(p => p.value === currentPlatform.value) || platformOptions[0]
})

const menuList = computed(() => {
  const routes = router.options.routes.find(r => r.name === 'Layout')?.children || []
  return routes.filter(r => !r.meta?.hidden && !r.meta?.hideInMenu)
})

const breadcrumbs = computed(() => {
  return route.matched.filter(r => r.meta?.title)
})

watch(
  () => route.name,
  (name) => {
    if (name) {
      selectedKeys.value = [name as string]
      const parent = route.matched[route.matched.length - 2]
      if (parent) {
        openKeys.value = [parent.name as string]
      }
    }
  },
  { immediate: true }
)

function onMenuClick(key: string) {
  router.push({ name: key })
}

function onSubMenuClick(key: string, openKeysArr: string[]) {
  openKeys.value = openKeysArr
}

function handleSwitchPlatform(platform: string) {
  currentPlatform.value = platform
  setLocal('currentPlatform', platform)
  if (platform === 'supplier') {
    router.push('/supplier/dashboard')
  } else if (platform === 'warehouse') {
    router.push('/warehouse/dashboard')
  }
}

function handleOpenMpPreview() {
  router.push('/mp-preview?role=construction')
}

function handleLogout() {
  userStore.logoutAction()
}
</script>

<style scoped lang="less">
.basic-layout {
  height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  background: #fff;
  overflow: hidden;
  
  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
    white-space: nowrap;
  }
  
  .logo-text-mini {
    font-size: 14px;
    font-weight: 600;
    color: #1890ff;
    writing-mode: vertical-rl;
    letter-spacing: 2px;
  }
  
  &.logo-collapsed {
    padding: 12px;
    justify-content: center;
    background: #fff;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
}

.platform-btn {
  color: var(--text-color);
  
  &:hover {
    background: var(--color-fill-2);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background: var(--color-fill-2);
  }
  
  .user-name {
    font-size: 14px;
    color: var(--text-color);
  }
}

.content {
  padding: 16px;
  background: var(--background-color);
  overflow: auto;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: #fff;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-color-secondary);
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
