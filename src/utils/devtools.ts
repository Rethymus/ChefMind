// 动态导入Tauri API，仅在Tauri环境中可用
let invoke: any = null

// 开发者工具控制
export const devTools = {
  // 打开/关闭开发者工具 (Tauri v2 中使用更新的方法)
  toggle: async () => {
    try {
      // 在Tauri v2中，优先使用后端命令打开开发者工具
      if (typeof window !== 'undefined' && window.__TAURI__) {
        try {
          if (window.__TAURI__.invoke) {
            const result = await window.__TAURI__.invoke('open_dev_tools')
            console.log('Dev tools opened via backend command:', result)
            return result
          } else {
            console.log('Tauri invoke not available, trying alternative method')
          }
        } catch (error) {
          console.log('Failed to open dev tools via backend, trying event method:', error)
          // 备用方案：发送事件到后端
          if (window.__TAURI__.event) {
            await window.__TAURI__.event.emit('request-devtools')
            console.log('Dev tools request sent via event')
          }
        }
      } else {
        // 浏览器环境中，尝试打开开发者工具
        const event = new KeyboardEvent('keydown', {
          key: 'F12',
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false
        })
        document.dispatchEvent(event)
      }
    } catch (error) {
      console.error('Failed to toggle devtools:', error)
    }
  },

  // 发送日志消息到Rust后端
  log: async (message: string) => {
    try {
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
        await window.__TAURI__.invoke('log_message', { message })
      } else {
        console.log('[Tauri Log]:', message)
      }
    } catch (error) {
      console.error('Failed to log message:', error)
      console.log('[Tauri Log]:', message)
    }
  },

  // 获取应用信息
  getAppInfo: async () => {
    try {
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
        const info = await window.__TAURI__.invoke('get_app_info')
        console.log('App info:', info)
        return info
      } else {
        const info = 'ChefMind v3.0.0 - Web Mode'
        console.log('App info:', info)
        return info
      }
    } catch (error) {
      console.error('Failed to get app info:', error)
      return 'ChefMind v3.0.0 - Unknown'
    }
  },

  // 获取系统信息
  getSystemInfo: async () => {
    try {
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
        const info = await window.__TAURI__.invoke('get_system_info')
        console.log('System info:', info)
        return info
      } else {
        const info = 'Web Environment - System info not available'
        console.log('System info:', info)
        return info
      }
    } catch (error) {
      console.error('Failed to get system info:', error)
      return 'System info unavailable'
    }
  },

  // 检查前端加载状态
  checkFrontendLoad: async () => {
    try {
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
        const result = await window.__TAURI__.invoke('check_frontend_loaded')
        console.log('Frontend load check:', result)
        return result
      } else {
        // 在浏览器环境中检查前端资源
        const checks = {
          vueLoaded: typeof Vue !== 'undefined',
          elementPlusLoaded: typeof ElementPlus !== 'undefined',
          appMounted: document.getElementById('app') !== null,
          routerLoaded: typeof window !== 'undefined' && window.$router !== undefined,
          domLoaded: document.readyState === 'complete'
        }
        console.log('Frontend load checks:', checks)
        return checks
      }
    } catch (error) {
      console.error('Failed to check frontend load:', error)
      return false
    }
  },

  // 发送DOM加载事件
  sendDomLoaded: async () => {
    try {
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.event) {
        await window.__TAURI__.event.emit('dom-loaded')
        console.log('DOM loaded event sent')
      } else {
        console.log('DOM loaded event sent (browser mode)')
      }
    } catch (error) {
      console.error('Failed to send DOM loaded event:', error)
    }
  }
}

// 开发模式快捷键
export const setupDevShortcuts = () => {
  // 在所有环境中都启用开发者工具快捷键
  // Ctrl+Shift+I 打开开发者工具
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      devTools.toggle()
    }

    // Ctrl+Shift+J 打开控制台
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault()
      devTools.toggle()
    }

    // F12 打开开发者工具
    if (e.key === 'F12') {
      e.preventDefault()
      devTools.toggle()
    }

    // Ctrl+Shift+D 打开调试面板
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      // 切换调试面板显示/隐藏
      const debugPanel = document.getElementById('debug-panel')
      if (debugPanel) {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none'
      }
    }
  })
}

// 调试工具
export const debugUtils = {
  // 检查Tauri API是否可用
  checkTauriAPI: () => {
    return typeof window !== 'undefined' && window.__TAURI__
  },

  // 获取应用信息
  getAppInfo: async () => {
    try {
      if (!debugUtils.checkTauriAPI()) {
        return { error: 'Tauri API not available' }
      }

      const { app } = await import('@tauri-apps/api')
      const { version, name } = await app.getAppInfo()
      return { version, name }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // 检查前端资源是否加载正确
  checkFrontendLoad: () => {
    const checks = {
      vueLoaded: typeof Vue !== 'undefined',
      elementPlusLoaded: typeof ElementPlus !== 'undefined',
      appMounted: document.getElementById('app') !== null,
      routerLoaded: typeof window !== 'undefined' && window.$router !== undefined
    }

    console.log('Frontend load checks:', checks)
    return checks
  }
}