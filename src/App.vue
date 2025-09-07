<template>
  <div id="app">
    <DesktopNavBar />
    <ErrorBoundary>
      <div class="app-content">
        <router-view />
      </div>
    </ErrorBoundary>
    <NotificationContainer />
    <MobileNavBar />
    <GlassFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
import MobileNavBar from '@/components/common/MobileNavBar.vue'
import DesktopNavBar from '@/components/common/DesktopNavBar.vue'
import GlassFooter from '@/components/layout/GlassFooter.vue'
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
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  width: 100%;
}
</style>
