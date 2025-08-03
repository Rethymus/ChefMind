<template>
  <div class="debug-view">
    <h1>调试页面</h1>
    <div class="debug-info">
      <h2>基本信息</h2>
      <p>当前时间: {{ currentTime }}</p>
      <p>Vue 版本: {{ vueVersion }}</p>
      <p>路由状态: {{ routeInfo }}</p>
      
      <h2>环境变量</h2>
      <pre>{{ envVars }}</pre>
      
      <h2>Store 状态</h2>
      <pre>{{ storeState }}</pre>
      
      <h2>错误日志</h2>
      <div v-if="errors.length > 0">
        <div v-for="(error, index) in errors" :key="index" class="error-item">
          <strong>{{ error.timestamp }}</strong>: {{ error.message }}
        </div>
      </div>
      <div v-else>
        <p>暂无错误</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const recipeStore = useRecipeStore()
const themeStore = useThemeStore()

const currentTime = ref('')
const errors = ref<Array<{timestamp: string, message: string}>>([])

const vueVersion = computed(() => {
  return '3.x'
})

const routeInfo = computed(() => {
  return {
    path: route.path,
    name: route.name,
    params: route.params,
    query: route.query
  }
})

const envVars = computed(() => {
  return {
    VITE_GLM_API_KEY: import.meta.env.VITE_GLM_API_KEY ? '已配置' : '未配置',
    VITE_GLM_API_BASE_URL: import.meta.env.VITE_GLM_API_BASE_URL,
    VITE_GLM_MODEL: import.meta.env.VITE_GLM_MODEL,
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION
  }
})

const storeState = computed(() => {
  return {
    recipe: {
      currentStep: recipeStore.currentStep,
      selectedIngredients: recipeStore.selectedIngredients.length,
      selectedMethods: recipeStore.selectedMethods.length,
      generatedRecipes: recipeStore.generatedRecipes.length,
      isGenerating: recipeStore.isGenerating
    },
    theme: {
      isDark: themeStore.isDark
    }
  }
})

onMounted(() => {
  // 更新当前时间
  const updateTime = () => {
    currentTime.value = new Date().toLocaleString()
  }
  updateTime()
  setInterval(updateTime, 1000)
  
  // 监听全局错误
  window.addEventListener('error', (event) => {
    errors.value.push({
      timestamp: new Date().toLocaleString(),
      message: event.error?.message || event.message || '未知错误'
    })
  })
  
  // 监听未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    errors.value.push({
      timestamp: new Date().toLocaleString(),
      message: event.reason?.message || event.reason || '未处理的 Promise 拒绝'
    })
  })
  
  console.log('调试页面已加载')
})
</script>

<style lang="scss" scoped>
.debug-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h1 {
    color: #2c3e50;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  h2 {
    color: #34495e;
    margin: 1.5rem 0 1rem 0;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5rem;
  }
  
  pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #e9ecef;
    font-size: 0.9rem;
  }
  
  .error-item {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    
    strong {
      color: #e53e3e;
    }
  }
}
</style>