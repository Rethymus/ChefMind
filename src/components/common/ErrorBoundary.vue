<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-container">
      <div class="error-content">
        <el-icon class="error-icon" size="64" color="#f56c6c">
          <Warning />
        </el-icon>
        <h2 class="error-title">页面出现错误</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <div class="error-actions">
          <el-button type="primary" @click="retry">
            <el-icon><Refresh /></el-icon>
            重试
          </el-button>
          <el-button @click="reportError">
            <el-icon><Document /></el-icon>
            报告错误
          </el-button>
        </div>
        <details v-if="errorDetails && showDetails" class="error-details">
          <summary>错误详情</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
        <el-button 
          text 
          @click="showDetails = !showDetails"
          class="toggle-details"
        >
          {{ showDetails ? '隐藏' : '显示' }}详情
        </el-button>
      </div>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning, Refresh, Document } from '@element-plus/icons-vue'

interface Props {
  fallback?: string
  onError?: (error: Error, instance: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '组件加载失败，请重试'
})

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showDetails = ref(false)

// 捕获子组件错误
onErrorCaptured((error: Error, instance: any, info: string) => {
  hasError.value = true
  errorMessage.value = error.message || props.fallback
  errorDetails.value = `错误信息: ${error.message}\n错误位置: ${info}\n堆栈信息: ${error.stack}`
  
  // 调用外部错误处理
  props.onError?.(error, instance)
  
  // 记录错误到控制台
  console.error('组件错误:', error, instance, info)
  
  // 阻止错误继续向上传播
  return false
})

// 重试功能
const retry = async () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  showDetails.value = false
  
  // 等待下一个tick，让组件重新渲染
  await nextTick()
  
  ElMessage.success('正在重试...')
}

// 报告错误功能
const reportError = () => {
  const errorInfo = {
    message: errorMessage.value,
    details: errorDetails.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  // 这里可以发送错误报告到服务器
  console.log('错误报告:', errorInfo)
  
  // 复制错误信息到剪贴板
  navigator.clipboard?.writeText(JSON.stringify(errorInfo, null, 2))
    .then(() => {
      ElMessage.success('错误信息已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.info('请手动复制错误信息')
    })
}
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.error-content {
  text-align: center;
  max-width: 500px;
  
  .error-icon {
    margin-bottom: 1rem;
    animation: pulse 2s infinite;
  }
  
  .error-title {
    color: #2c3e50;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .error-message {
    color: #666;
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .error-details {
    margin-top: 1rem;
    text-align: left;
    
    summary {
      cursor: pointer;
      font-weight: 500;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      overflow-x: auto;
      color: #333;
      border: 1px solid #e0e0e0;
    }
  }
  
  .toggle-details {
    margin-top: 1rem;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 暗色主题
:global(.dark) .error-container {
  background: #2c3e50;
  border-color: #34495e;
  
  .error-title {
    color: #ecf0f1;
  }
  
  .error-message {
    color: #bdc3c7;
  }
  
  .error-details pre {
    background: #34495e;
    color: #ecf0f1;
    border-color: #4a5568;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-container {
    padding: 1rem;
    min-height: 300px;
  }
  
  .error-content {
    .error-actions {
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
