<template>
  <div class="glm-api-tester">
    <h3>智普API测试工具</h3>
    
    <div class="config-status">
      <h4>配置状态</h4>
      <div class="status-item">
        <span class="label">API密钥:</span>
        <span :class="['value', configStatus.configured ? 'success' : 'error']">
          {{ configStatus.configured ? configStatus.apiKey : '未配置' }}
        </span>
      </div>
      <div class="status-item">
        <span class="label">API地址:</span>
        <span class="value">{{ configStatus.apiUrl }}</span>
      </div>
      <div class="status-item">
        <span class="label">模型:</span>
        <span class="value">{{ configStatus.model }}</span>
      </div>
    </div>
    
    <div class="test-section">
      <el-button 
        type="primary" 
        @click="runTest" 
        :loading="testing"
        :disabled="!configStatus.configured"
      >
        测试API连接
      </el-button>
      
      <div v-if="testResult" class="test-result">
        <div :class="['result-header', testResult.success ? 'success' : 'error']">
          <i :class="testResult.success ? 'el-icon-check' : 'el-icon-close'"></i>
          <span>{{ testResult.message }}</span>
        </div>
        
        <div v-if="testResult.data" class="result-data">
          <h5>API响应:</h5>
          <pre>{{ testResult.data }}</pre>
        </div>
        
        <div v-if="testResult.error" class="result-error">
          <h5>错误详情:</h5>
          <pre>{{ JSON.stringify(testResult.error, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { checkGLMConfig, testGLMAPI } from '@/utils/testGLMAPI'

// 配置状态
const configStatus = ref(checkGLMConfig())

// 测试状态
const testing = ref(false)
const testResult = ref<{
  success: boolean
  message: string
  data?: string
  error?: any
} | null>(null)

// 运行API测试
const runTest = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    testResult.value = await testGLMAPI()
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: '测试过程中发生错误',
      error: error.toString()
    }
  } finally {
    testing.value = false
  }
}

// 组件加载时检查配置
onMounted(() => {
  configStatus.value = checkGLMConfig()
})
</script>

<style scoped>
.glm-api-tester {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: var(--heading-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

h4, h5 {
  color: var(--heading-color);
  margin-bottom: 10px;
}

.config-status {
  margin-bottom: 30px;
  padding: 15px;
  background-color: var(--bg-color);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.status-item {
  display: flex;
  margin-bottom: 8px;
}

.label {
  font-weight: 500;
  width: 100px;
  color: var(--text-color-secondary);
}

.value {
  flex: 1;
}

.success {
  color: var(--success-color);
}

.error {
  color: var(--error-color);
}

.test-section {
  margin-top: 20px;
}

.test-result {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--bg-color);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.result-header {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 15px;
}

.result-header i {
  margin-right: 8px;
  font-size: 18px;
}

.result-data, .result-error {
  margin-top: 15px;
}

pre {
  background-color: var(--code-bg-color, #f5f5f5);
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  color: var(--code-color, #333);
  white-space: pre-wrap;
}
</style>