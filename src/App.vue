<template>
  <div id="app">
    <div class="language-switcher-container">
      <LanguageSwitcher />
    </div>
    <DesktopNavBar />
    <ErrorBoundary>
      <router-view />
    </ErrorBoundary>
    <NotificationContainer />
    <MobileNavBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
import MobileNavBar from '@/components/common/MobileNavBar.vue'
import DesktopNavBar from '@/components/common/DesktopNavBar.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useThemeStore } from '@/stores/theme'
import { registerServiceWorker } from '@/utils/performance'

// 初始化主题
const themeStore = useThemeStore()
onMounted(() => {
  themeStore.initTheme()
  
  // 注册Service Worker用于缓存和离线访问
  registerServiceWorker()
})
</script>

<style>
@import '@/styles/global.scss';

#app {
  min-height: 100vh;
  position: relative;
}

.language-switcher-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

@media (max-width: 768px) {
  .language-switcher-container {
    top: 0.5rem;
    right: 0.5rem;
  }
}
</style>
