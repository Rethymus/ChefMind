<template>
  <div>
    <div v-if="error" class="error-boundary">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">哎呀，出错了</h2>
        <p class="error-message">{{ error.message }}</p>
        <div class="error-actions">
          <button class="error-button" @click="resetError">重试</button>
          <button class="error-button" @click="goHome">返回首页</button>
        </div>
        <details class="error-details">
          <summary>查看详细错误信息</summary>
          <pre>{{ error.stack }}</pre>
        </details>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
  import { ref, onErrorCaptured } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const error = ref<Error | null>(null)

  // 捕获子组件中的错误
  onErrorCaptured(err => {
    error.value = err as Error
    console.error('组件错误被捕获:', err)
    return false // 阻止错误继续传播
  })

  // 重置错误状态
  const resetError = () => {
    error.value = null
  }

  // 返回首页
  const goHome = () => {
    resetError()
    router.push('/')
  }
</script>

<style lang="scss" scoped>
  .error-boundary {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background-color: #f8f9fa;
  }

  .error-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
    max-width: 500px;
    width: 100%;
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .error-title {
    font-size: 24px;
    color: #f56c6c;
    margin-bottom: 15px;
  }

  .error-message {
    color: #606266;
    margin-bottom: 20px;
  }

  .error-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .error-button {
    background: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #66b1ff;
    }
  }

  .error-details {
    text-align: left;
    margin-top: 20px;

    summary {
      cursor: pointer;
      color: #909399;
      font-size: 14px;
      margin-bottom: 10px;
    }

    pre {
      background: #f5f7fa;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      font-size: 12px;
      color: #606266;
      max-height: 200px;
    }
  }

  [data-theme='dark'] .error-boundary {
    background-color: #1a1a1a;

    .error-content {
      background: #2c2c2c;
    }

    .error-message {
      color: #c0c4cc;
    }

    .error-details pre {
      background: #363636;
      color: #c0c4cc;
    }
  }
</style>
