// 动态导入Tauri API，仅在Tauri环境中可用
let invoke: any = null

// 开发者工具控制
export const devTools = {
  // 打开/关闭开发者工具 (Tauri v2 中需要使用其他方法)
  toggle: async () => {
    try {
      // 在Tauri v2中，开发者工具的打开方式不同
      // 这里提供一个备用方案，使用浏览器原生开发者工具
      if (typeof window !== 'undefined' && window.__TAURI__) {
        // Tauri环境中，可以尝试使用快捷键或者通过系统命令打开
        console.log('Dev tools toggle requested. Use F12 or Ctrl+Shift+I in Tauri v2.')
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
      if (!invoke && typeof window !== 'undefined' && window.__TAURI__) {
        const tauri = await import('@tauri-apps/api/tauri')
        invoke = tauri.invoke
      }
      if (invoke) {
        await invoke('log_message', { message })
      } else {
        console.log('[Tauri Log]:', message)
      }
    } catch (error) {
      console.error('Failed to log message:', error)
      console.log('[Tauri Log]:', message)
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