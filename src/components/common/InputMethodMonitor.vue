<template>
  <div class="input-method-monitor" v-if="showMonitor">
    <div class="status-indicator">
      <span
        class="status-dot"
        :class="{
          active: status.isActive,
          chinese: status.language === 'zh',
          english: status.language === 'en',
        }"
      ></span>
      <span class="status-text">
        {{ status.language === 'zh' ? '中文' : '英文' }}
        {{ status.isActive ? '✓' : '✗' }}
      </span>
    </div>

    <div class="input-method-info">
      <div class="method-name">{{ status.method }}</div>
      <div class="supported-languages">支持语言: {{ status.supportedLanguages.join(', ') }}</div>
    </div>

    <div class="controls">
      <button
        @click="toggleInputMethod"
        :disabled="!isChineseSupported"
        class="toggle-btn"
        :class="{ 'chinese-mode': isChineseActive }"
      >
        {{ isChineseActive ? '切换到英文' : '切换到中文' }}
      </button>

      <button @click="restartInputMethod" class="restart-btn" title="重启输入法">🔄</button>
    </div>

    <div v-if="showDetails" class="details">
      <div class="detail-item">
        <label>输入法状态:</label>
        <span>{{ status.isActive ? '已激活' : '未激活' }}</span>
      </div>
      <div class="detail-item">
        <label>当前语言:</label>
        <span>{{ status.language === 'zh' ? '中文' : '英文' }}</span>
      </div>
      <div class="detail-item">
        <label>输入法类型:</label>
        <span>{{ getMethodDisplayName(status.method) }}</span>
      </div>
      <div class="detail-item">
        <label>虚拟键盘:</label>
        <span>{{ isUsingVirtualKeyboard ? '启用' : '禁用' }}</span>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useInputMethod } from '@/utils/inputMethodManager'

  const props = defineProps<{
    showMonitor?: boolean
    showDetails?: boolean
  }>()

  const emit = defineEmits<{
    inputMethodChanged: [language: string]
    error: [error: string]
  }>()

  const {
    status,
    isChineseSupported,
    isChineseActive,
    switchToChinese,
    switchToEnglish,
    toggleInputMethod,
    startInputMethod,
    stopInputMethod,
    restartInputMethod,
    on,
    off,
  } = useInputMethod()

  const error = ref<string>('')
  const showDetails = ref(props.showDetails || false)
  const showMonitor = ref(props.showMonitor !== false)

  const isUsingVirtualKeyboard = computed(() => false)

  const getMethodDisplayName = (method: string): string => {
    const methodNames: Record<string, string> = {
      fcitx5: 'Fcitx5',
      fcitx: 'Fcitx',
      ibus: 'IBus',
      virtual: '虚拟输入法',
      browser: '浏览器输入法',
    }
    return methodNames[method] || method
  }

  const handleToggleInputMethod = async () => {
    try {
      const success = await toggleInputMethod()
      if (success) {
        emit('inputMethodChanged', status.value.language)
        error.value = ''
      } else {
        error.value = '输入法切换失败'
        emit('error', error.value)
      }
    } catch (err) {
      error.value = `切换失败: ${err}`
      emit('error', error.value)
    }
  }

  const handleRestartInputMethod = async () => {
    try {
      error.value = ''
      await restartInputMethod()
    } catch (err) {
      error.value = `重启失败: ${err}`
      emit('error', error.value)
    }
  }

  const handleStatusChange = (newStatus: any) => {
    console.log('输入法状态变化:', newStatus)
    error.value = ''
  }

  const handleError = (err: any) => {
    console.error('输入法错误:', err)
    error.value = `输入法错误: ${err}`
  }

  onMounted(() => {
    // 监听状态变化
    on('status-change', handleStatusChange)
    on('input-method-switched', handleStatusChange)
    on('error', handleError)

    // 自动启动输入法
    if (!status.value.isActive) {
      startInputMethod().catch(err => {
        console.warn('输入法自动启动失败:', err)
      })
    }
  })

  onUnmounted(() => {
    off('status-change', handleStatusChange)
    off('input-method-switched', handleStatusChange)
    off('error', handleError)
  })
</script>

<style scoped>
  .input-method-monitor {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 200px;
    backdrop-filter: blur(10px);
  }

  .status-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ccc;
    margin-right: 8px;
    transition: all 0.3s ease;
  }

  .status-dot.active {
    background-color: #4caf50;
  }

  .status-dot.chinese {
    background-color: #ff5722;
  }

  .status-dot.english {
    background-color: #2196f3;
  }

  .status-text {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .input-method-info {
    margin-bottom: 12px;
  }

  .method-name {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .supported-languages {
    font-size: 11px;
    color: #888;
  }

  .controls {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .toggle-btn {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #333;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  .toggle-btn:hover:not(:disabled) {
    background: #f5f5f5;
  }

  .toggle-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-btn.chinese-mode {
    background: #ff5722;
    color: white;
    border-color: #ff5722;
  }

  .toggle-btn.chinese-mode:hover:not(:disabled) {
    background: #e64a19;
  }

  .restart-btn {
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #666;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  .restart-btn:hover {
    background: #f5f5f5;
    color: #333;
  }

  .details {
    border-top: 1px solid #eee;
    padding-top: 8px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-bottom: 4px;
    color: #666;
  }

  .detail-item label {
    font-weight: 500;
  }

  .error-message {
    margin-top: 8px;
    padding: 6px 8px;
    background: #ffebee;
    color: #c62828;
    border-radius: 4px;
    font-size: 11px;
    border: 1px solid #ffcdd2;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .input-method-monitor {
      top: 5px;
      right: 5px;
      left: 5px;
      min-width: auto;
    }
  }
</style>
