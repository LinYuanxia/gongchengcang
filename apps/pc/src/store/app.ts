import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const loading = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setTheme(value: 'light' | 'dark') {
    theme.value = value
    document.body.setAttribute('arco-theme', value)
  }

  return {
    collapsed,
    loading,
    theme,
    toggleCollapsed,
    setCollapsed,
    setLoading,
    setTheme,
  }
})
