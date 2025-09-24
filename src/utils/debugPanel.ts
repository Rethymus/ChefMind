import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

// 调试信息面板组件
export const DebugPanel = {
  name: 'DebugPanel',

  template: `
    <div v-if="showDebug" class="debug-panel" style="
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    ">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <strong>🔧 Debug Panel</strong>
        <button @click="toggleDebug" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
      </div>
      <div v-if="appInfo">
        <div><strong>App:</strong> {{ appInfo }}</div>
      </div>
      <div style="margin-top: 10px;">
        <div><strong>Environment:</strong> {{ environment }}</div>
        <div><strong>Tauri:</strong> {{ tauriAvailable ? 'Yes' : 'No' }}</div>
        <div><strong>Vue:</strong> {{ vueLoaded ? 'Yes' : 'No' }}</div>
        <div><strong>Router:</strong> {{ routerLoaded ? 'Yes' : 'No' }}</div>
        <div><strong>ElementPlus:</strong> {{ elementPlusLoaded ? 'Yes' : 'No' }}</div>
      </div>
      <div style="margin-top: 10px;">
        <button @click="checkFrontend" style="margin: 2px; padding: 5px; background: #333; color: white; border: none; border-radius: 3px; cursor: pointer;">Check Frontend</button>
        <button @click="openDevTools" style="margin: 2px; padding: 5px; background: #333; color: white; border: none; border-radius: 3px; cursor: pointer;">Dev Tools</button>
        <button @click="sendLog" style="margin: 2px; padding: 5px; background: #333; color: white; border: none; border-radius: 3px; cursor: pointer;">Send Log</button>
      </div>
      <div v-if="messages.length > 0" style="margin-top: 10px;">
        <strong>Messages:</strong>
        <div v-for="(msg, index) in messages.slice(-5)" :key="index" style="margin-top: 5px; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">
          {{ msg }}
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      showDebug: false,
      appInfo: null,
      environment: import.meta.env.MODE,
      tauriAvailable: false,
      vueLoaded: false,
      routerLoaded: false,
      elementPlusLoaded: false,
      messages: []
    }
  },

  mounted() {
    this.initDebug()
    this.setupEventListeners()

    // 添加全局快捷键 Ctrl+Shift+D 打开调试面板
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        this.toggleDebug()
      }
    })
  },

  methods: {
    async initDebug() {
      try {
        // 检查各种组件是否加载
        this.tauriAvailable = typeof window !== 'undefined' && !!window.__TAURI__
        this.vueLoaded = typeof Vue !== 'undefined'
        this.routerLoaded = typeof window !== 'undefined' && !!window.$router
        this.elementPlusLoaded = typeof ElementPlus !== 'undefined'

        // 获取应用信息
        if (this.tauriAvailable) {
          try {
            this.appInfo = await invoke('get_app_info')
          } catch (error) {
            this.addMessage(`Failed to get app info: ${error.message}`)
          }
        }

        this.addMessage('Debug panel initialized')
      } catch (error) {
        this.addMessage(`Debug init error: ${error.message}`)
      }
    },

    async setupEventListeners() {
      if (!this.tauriAvailable) return

      try {
        // 监听来自Rust的事件
        await listen('open-dev-tools', () => {
          this.addMessage('Dev tools request received')
          this.openDevTools()
        })

        await listen('check-frontend', () => {
          this.addMessage('Frontend check requested')
          this.checkFrontend()
        })
      } catch (error) {
        this.addMessage(`Event listener setup failed: ${error.message}`)
      }
    },

    toggleDebug() {
      this.showDebug = !this.showDebug
      if (this.showDebug) {
        this.addMessage('Debug panel opened')
      }
    },

    async checkFrontend() {
      try {
        const checks = {
          vueLoaded: typeof Vue !== 'undefined',
          elementPlusLoaded: typeof ElementPlus !== 'undefined',
          appMounted: document.getElementById('app') !== null,
          routerLoaded: typeof window !== 'undefined' && window.$router !== undefined,
          domReady: document.readyState === 'complete'
        }

        this.addMessage(`Frontend check: ${JSON.stringify(checks)}`)

        if (this.tauriAvailable) {
          await invoke('check_frontend_loaded')
        }
      } catch (error) {
        this.addMessage(`Frontend check error: ${error.message}`)
      }
    },

    async openDevTools() {
      try {
        if (this.tauriAvailable) {
          await invoke('open_dev_tools')
          this.addMessage('Dev tools request sent')
        } else {
          // 在浏览器环境中尝试打开开发者工具
          window.open('about:blank', '_blank')
          this.addMessage('Dev tools not available in browser')
        }
      } catch (error) {
        this.addMessage(`Dev tools error: ${error.message}`)
      }
    },

    async sendLog() {
      try {
        if (this.tauriAvailable) {
          await invoke('log_message', { message: 'Debug panel test log' })
          this.addMessage('Log sent to backend')
        } else {
          console.log('[Debug Panel] Test log message')
          this.addMessage('Log sent to console')
        }
      } catch (error) {
        this.addMessage(`Log error: ${error.message}`)
      }
    },

    addMessage(message) {
      const timestamp = new Date().toLocaleTimeString()
      this.messages.push(`[${timestamp}] ${message}`)
      console.log(`[Debug Panel] ${message}`)
    }
  }
}

// 创建并挂载调试面板
export function createDebugPanel() {
  if (typeof Vue === 'undefined') {
    console.error('Vue not loaded, cannot create debug panel')
    return
  }

  try {
    const { createApp } = Vue
    const debugApp = createApp(DebugPanel)
    const debugContainer = document.createElement('div')
    debugContainer.id = 'debug-panel-container'
    document.body.appendChild(debugContainer)
    debugApp.mount(debugContainer)

    // 全局暴露调试函数
    window.showDebugPanel = () => {
      debugApp._component.data().showDebug = true
    }

    console.log('Debug panel created. Use Ctrl+Shift+D to toggle.')
  } catch (error) {
    console.error('Failed to create debug panel:', error)
  }
}

// 页面加载完成后创建调试面板
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createDebugPanel)
} else {
  createDebugPanel()
}