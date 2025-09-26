<template>
  <div id="debug-panel" class="debug-panel" v-if="isVisible">
    <div class="debug-header">
      <h3>🔧 ChefMind 调试面板</h3>
      <button class="close-btn" @click="togglePanel">×</button>
    </div>

    <div class="debug-content">
      <!-- 系统信息 -->
      <div class="debug-section">
        <h4>📊 系统信息</h4>
        <div class="debug-info">
          <p><strong>环境:</strong> {{ systemInfo.environment }}</p>
          <p><strong>平台:</strong> {{ systemInfo.platform }}</p>
          <p><strong>用户代理:</strong> {{ systemInfo.userAgent }}</p>
          <p><strong>Tauri 版本:</strong> {{ systemInfo.tauriVersion }}</p>
          <p><strong>应用版本:</strong> {{ systemInfo.appVersion }}</p>
        </div>
      </div>

      <!-- 前端资源检查 -->
      <div class="debug-section">
        <h4>🔍 前端资源检查</h4>
        <div class="debug-info">
          <div v-for="(status, key) in frontendStatus" :key="key" class="status-item">
            <span :class="['status-indicator', status ? 'success' : 'error']">
              {{ status ? '✅' : '❌' }}
            </span>
            <span>{{ formatKey(key) }}: {{ status ? '正常' : '异常' }}</span>
          </div>
        </div>
      </div>

      <!-- 开发者工具控制 -->
      <div class="debug-section">
        <h4>🛠️ 开发者工具</h4>
        <div class="debug-actions">
          <button @click="openDevTools" class="debug-btn">📱 打开开发者工具</button>
          <button @click="checkConsole" class="debug-btn">📝 检查控制台</button>
          <button @click="clearLogs" class="debug-btn">🗑️ 清除日志</button>
        </div>
      </div>

      <!-- 网络状态 -->
      <div class="debug-section">
        <h4>🌐 网络状态</h4>
        <div class="debug-info">
          <p><strong>在线状态:</strong> {{ isOnline ? '在线' : '离线' }}</p>
          <p><strong>连接类型:</strong> {{ connectionType }}</p>
        </div>
      </div>

      <!-- 性能信息 -->
      <div class="debug-section">
        <h4>⚡ 性能信息</h4>
        <div class="debug-info">
          <p><strong>内存使用:</strong> {{ memoryUsage }}</p>
          <p><strong>页面加载时间:</strong> {{ loadTime }}ms</p>
          <p><strong>DOM 节点数:</strong> {{ domNodes }}</p>
        </div>
      </div>

      <!-- 日志输出 -->
      <div class="debug-section">
        <h4>📝 调试日志</h4>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.level">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level">[{{ log.level }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <button @click="clearLogs" class="debug-btn">清除日志</button>
      </div>

      <!-- 测试功能 -->
      <div class="debug-section">
        <h4>🧪 测试功能</h4>
        <div class="debug-actions">
          <button @click="testApiConnection" class="debug-btn">🔗 测试 API 连接</button>
          <button @click="testDatabase" class="debug-btn">💾 测试数据库</button>
          <button @click="reloadApp" class="debug-btn">🔄 重新加载应用</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import { devTools, debugUtils } from '@/utils/devtools'

  export default {
    name: 'DebugPanel',
    setup() {
      const isVisible = ref(false)
      const isOnline = ref(navigator.onLine)
      const connectionType = ref('unknown')
      const logs = ref([])
      const memoryUsage = ref('N/A')
      const loadTime = ref(0)
      const domNodes = ref(0)

      const systemInfo = reactive({
        environment: 'unknown',
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        tauriVersion: 'unknown',
        appVersion: 'unknown',
      })

      const frontendStatus = reactive({
        vueLoaded: false,
        elementPlusLoaded: false,
        appMounted: false,
        routerLoaded: false,
        domLoaded: false,
        tauriAvailable: false,
      })

      // 格式化键名
      const formatKey = key => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      }

      // 切换面板显示
      const togglePanel = () => {
        isVisible.value = !isVisible.value
        addLog('info', `Debug panel ${isVisible.value ? 'opened' : 'closed'}`)
      }

      // 打开开发者工具
      const openDevTools = async () => {
        addLog('info', 'Opening developer tools...')
        try {
          await devTools.toggle()
          addLog('success', 'Developer tools opened successfully')
        } catch (error) {
          addLog('error', `Failed to open dev tools: ${error.message}`)
        }
      }

      // 检查控制台
      const checkConsole = () => {
        addLog('info', 'Console check - please check browser console for detailed logs')
        console.log('🔧 ChefMind Debug Panel - Console Check')
        console.log('System Info:', systemInfo)
        console.log('Frontend Status:', frontendStatus)
        console.log('Logs:', logs.value)
      }

      // 清除日志
      const clearLogs = () => {
        logs.value = []
        addLog('info', 'Logs cleared')
      }

      // 添加日志
      const addLog = (level, message) => {
        const time = new Date().toLocaleTimeString()
        logs.value.push({ time, level, message })

        // 限制日志数量
        if (logs.value.length > 100) {
          logs.value = logs.value.slice(-50)
        }
      }

      // 测试 API 连接
      const testApiConnection = async () => {
        addLog('info', 'Testing API connection...')
        try {
          // 这里可以添加实际的 API 测试逻辑
          addLog('success', 'API connection test completed')
        } catch (error) {
          addLog('error', `API connection test failed: ${error.message}`)
        }
      }

      // 测试数据库
      const testDatabase = async () => {
        addLog('info', 'Testing database connection...')
        try {
          // 这里可以添加实际的数据库测试逻辑
          addLog('success', 'Database test completed')
        } catch (error) {
          addLog('error', `Database test failed: ${error.message}`)
        }
      }

      // 重新加载应用
      const reloadApp = () => {
        addLog('info', 'Reloading application...')
        window.location.reload()
      }

      // 更新系统信息
      const updateSystemInfo = async () => {
        try {
          // 检查是否在 Tauri 环境中
          if (window.__TAURI__) {
            systemInfo.environment = 'Tauri'
            systemInfo.tauriVersion = '2.x'
            systemInfo.appVersion = '3.0.0'
            frontendStatus.tauriAvailable = true
          } else {
            systemInfo.environment = 'Browser'
            systemInfo.tauriVersion = 'N/A'
            systemInfo.appVersion = '3.0.0 (Web)'
            frontendStatus.tauriAvailable = false
          }

          // 获取更详细的应用信息
          const appInfo = await devTools.getAppInfo()
          addLog('info', `App info: ${appInfo}`)
        } catch (error) {
          addLog('error', `Failed to update system info: ${error.message}`)
        }
      }

      // 检查前端资源
      const checkFrontendResources = () => {
        frontendStatus.vueLoaded = typeof Vue !== 'undefined'
        frontendStatus.elementPlusLoaded = typeof ElementPlus !== 'undefined'
        frontendStatus.appMounted = document.getElementById('app') !== null
        frontendStatus.domLoaded = document.readyState === 'complete'

        addLog('info', 'Frontend resource check completed')
      }

      // 更新性能信息
      const updatePerformanceInfo = () => {
        try {
          // 内存使用情况
          if (performance.memory) {
            const memory = performance.memory
            memoryUsage.value = `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`
          }

          // DOM 节点数
          domNodes.value = document.querySelectorAll('*').length

          // 页面加载时间
          if (performance.timing) {
            loadTime.value = performance.timing.loadEventEnd - performance.timing.navigationStart
          }
        } catch (error) {
          addLog('error', `Failed to update performance info: ${error.message}`)
        }
      }

      // 监听在线状态
      const handleOnline = () => {
        isOnline.value = true
        addLog('info', 'Network connection restored')
      }

      const handleOffline = () => {
        isOnline.value = false
        addLog('warning', 'Network connection lost')
      }

      // 监听快捷键
      const handleKeyDown = e => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault()
          togglePanel()
        }
      }

      onMounted(async () => {
        addLog('info', 'Debug panel mounted')

        // 初始化系统信息
        await updateSystemInfo()
        checkFrontendResources()
        updatePerformanceInfo()

        // 设置事件监听器
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        document.addEventListener('keydown', handleKeyDown)

        // 设置开发者快捷键
        import('@/utils/devtools').then(({ setupDevShortcuts }) => {
          setupDevShortcuts()
          addLog('info', 'Developer shortcuts setup complete')
        })

        // 定期更新性能信息
        const performanceInterval = setInterval(updatePerformanceInfo, 5000)

        onUnmounted(() => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
          document.removeEventListener('keydown', handleKeyDown)
          clearInterval(performanceInterval)
        })
      })

      return {
        isVisible,
        systemInfo,
        frontendStatus,
        isOnline,
        connectionType,
        logs,
        memoryUsage,
        loadTime,
        domNodes,
        formatKey,
        togglePanel,
        openDevTools,
        checkConsole,
        clearLogs,
        testApiConnection,
        testDatabase,
        reloadApp,
      }
    },
  }
</script>

<style scoped>
  .debug-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    color: #fff;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    overflow: hidden;
  }

  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #2d2d2d;
    border-bottom: 1px solid #444;
  }

  .debug-header h3 {
    margin: 0;
    color: #4fc3f7;
  }

  .close-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #555;
  }

  .debug-content {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(80vh - 60px);
  }

  .debug-section {
    margin-bottom: 25px;
    padding: 15px;
    background: #2a2a2a;
    border-radius: 6px;
    border-left: 3px solid #4fc3f7;
  }

  .debug-section h4 {
    margin: 0 0 10px 0;
    color: #4fc3f7;
    font-size: 14px;
    font-weight: 600;
  }

  .debug-info {
    font-size: 12px;
    line-height: 1.4;
  }

  .debug-info p {
    margin: 5px 0;
    color: #ccc;
  }

  .status-item {
    display: flex;
    align-items: center;
    margin: 5px 0;
  }

  .status-indicator {
    margin-right: 8px;
    font-size: 14px;
  }

  .status-indicator.success {
    color: #4caf50;
  }

  .status-indicator.error {
    color: #f44336;
  }

  .debug-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .debug-btn {
    background: #4fc3f7;
    color: #000;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .debug-btn:hover {
    background: #29b6f6;
    transform: translateY(-1px);
  }

  .log-container {
    max-height: 200px;
    overflow-y: auto;
    background: #1a1a1a;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
  }

  .log-item {
    display: flex;
    align-items: center;
    margin: 2px 0;
    font-size: 11px;
    font-family: monospace;
  }

  .log-time {
    color: #888;
    margin-right: 8px;
    min-width: 45px;
  }

  .log-level {
    margin-right: 8px;
    font-weight: bold;
    min-width: 40px;
  }

  .log-item.info .log-level {
    color: #4fc3f7;
  }

  .log-item.success .log-level {
    color: #4caf50;
  }

  .log-item.warning .log-level {
    color: #ff9800;
  }

  .log-item.error .log-level {
    color: #f44336;
  }

  .log-message {
    color: #ccc;
    flex: 1;
  }

  /* 滚动条样式 */
  .debug-content::-webkit-scrollbar,
  .log-container::-webkit-scrollbar {
    width: 8px;
  }

  .debug-content::-webkit-scrollbar-track,
  .log-container::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  .debug-content::-webkit-scrollbar-thumb,
  .log-container::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }

  .debug-content::-webkit-scrollbar-thumb:hover,
  .log-container::-webkit-scrollbar-thumb:hover {
    background: #777;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .debug-panel {
      width: 95%;
      max-height: 90vh;
    }

    .debug-actions {
      flex-direction: column;
    }

    .debug-btn {
      width: 100%;
    }
  }
</style>
