import { invoke } from '@tauri-apps/api/tauri'

// 开发者工具控制
export const devTools = {
  // 打开/关闭开发者工具
  toggle: async () => {
    try {
      await invoke('toggle_devtools')
    } catch (error) {
      console.error('Failed to toggle devtools:', error)
    }
  },

  // 发送日志消息到Rust后端
  log: async (message: string) => {
    try {
      await invoke('log_message', { message })
    } catch (error) {
      console.error('Failed to log message:', error)
    }
  }
}

// 开发模式快捷键
export const setupDevShortcuts = () => {
  if (import.meta.env.DEV) {
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
    })
  }
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
      return { error: error.message }
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