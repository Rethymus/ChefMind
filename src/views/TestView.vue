<template>
  <div class="test-view">
    <h1>调试页面</h1>
    <p>当前状态：{{ status }}</p>
    <div v-if="errors.length > 0" class="error-list">
      <h2>检测到的错误：</h2>
      <ul>
        <li v-for="(error, index) in errors" :key="index" class="error-item">
          {{ error }}
        </li>
      </ul>
    </div>
    <div class="test-buttons">
      <button @click="testElementPlusIcons">测试Element Plus图标</button>
      <button @click="testFontAwesome">测试Font Awesome图标</button>
      <button @click="testComponents">测试组件加载</button>
    </div>
    <div class="test-results">
      <h2>测试结果：</h2>
      <div v-if="iconTestResult" class="test-result">
        <h3>Element Plus图标测试：</h3>
        <div class="icon-test">
          <el-icon><House /></el-icon>
          <el-icon><User /></el-icon>
          <el-icon><Setting /></el-icon>
        </div>
      </div>
      <div v-if="faTestResult" class="test-result">
        <h3>图标测试 (已替换为Element Plus图标)：</h3>
        <div class="icon-test">
          <el-icon><House /></el-icon>
          <el-icon><User /></el-icon>
          <el-icon><Setting /></el-icon>
        </div>
      </div>
      <div v-if="componentTestResult" class="test-result">
        <h3>组件测试：</h3>
        <AppHeader />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { House, User, Setting } from '@element-plus/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const status = ref('正在初始化...')
const errors = ref<string[]>([])
const iconTestResult = ref(false)
const faTestResult = ref(false)
const componentTestResult = ref(false)

// 捕获全局错误
onMounted(() => {
  status.value = '页面已加载'
  
  // 捕获JavaScript错误
  window.addEventListener('error', (event) => {
    errors.value.push(`JS错误: ${event.message} (${event.filename}:${event.lineno})`)
  })
  
  // 捕获未处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    errors.value.push(`Promise错误: ${event.reason}`)
  })
  
  // 检查Vue版本
  try {
    const vueVersion = (window as any).Vue?.version || '未知'
    status.value = `页面已加载，Vue版本: ${vueVersion}`
  } catch (err) {
    errors.value.push(`获取Vue版本失败: ${err}`)
  }
})

// 测试Element Plus图标
const testElementPlusIcons = () => {
  try {
    iconTestResult.value = true
    status.value = 'Element Plus图标测试完成'
  } catch (err) {
    errors.value.push(`Element Plus图标测试失败: ${err}`)
  }
}

// 测试Font Awesome图标
const testFontAwesome = () => {
  try {
    faTestResult.value = true
    status.value = 'Font Awesome图标测试完成'
  } catch (err) {
    errors.value.push(`Font Awesome图标测试失败: ${err}`)
  }
}

// 测试组件加载
const testComponents = () => {
  try {
    componentTestResult.value = true
    status.value = '组件测试完成'
  } catch (err) {
    errors.value.push(`组件测试失败: ${err}`)
  }
}
</script>

<style lang="scss" scoped>
.test-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h1 {
    color: #ff6b6b;
    margin-bottom: 1rem;
  }
  
  .error-list {
    margin: 1rem 0;
    padding: 1rem;
    background: #fff5f5;
    border-left: 4px solid #ff6b6b;
    border-radius: 4px;
    
    h2 {
      color: #e74c3c;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    .error-item {
      margin: 0.5rem 0;
      font-family: monospace;
      color: #e74c3c;
    }
  }
  
  .test-buttons {
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0;
    
    button {
      padding: 0.75rem 1.5rem;
      background: #4ecdc4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      
      &:hover {
        background: #44a08d;
        transform: translateY(-2px);
      }
    }
  }
  
  .test-results {
    margin-top: 2rem;
    
    .test-result {
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      
      h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }
      
      .icon-test {
        display: flex;
        gap: 2rem;
        font-size: 2rem;
      }
    }
  }
}
</style>