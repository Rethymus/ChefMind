<template>
  <div id="app" class="chefmind-app">
    <ErrorBoundary>
      <router-view />
    </ErrorBoundary>
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'

const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.chefmind-app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>