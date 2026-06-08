// @ts-nocheck
// 动态导入Tauri API，仅在Tauri环境中可用
let invoke: any = null

// 开发者工具控制
const devTools = {
  // 打开/关闭开发者工具 (Tauri v2 中使用更新的方法)
  toggle: async () => {
    try {
      console.log('Attempting to open developer tools...')

      // 在Tauri v2中，优先使用后端命令打开开发者工具
      if (typeof window !== 'undefined' && window.__TAURI__) {
        try {
          if (window.__TAURI__.invoke) {
            console.log('Opening dev tools via backend command...')
            const result = await window.__TAURI__.invoke('open_dev_tools')
            console.log('✅ Dev tools opened via backend command:', result)
            return result
          } else {
            console.log('⚠️ Tauri invoke not available, trying alternative method')
          }
        } catch (error) {
          console.log('❌ Failed to open dev tools via backend, trying event method:', error)

          // 备用方案1：发送事件到后端
          try {
            if (window.__TAURI__.event) {
              await window.__TAURI__.event.emit('request-devtools')
              console.log('✅ Dev tools request sent via event')
            }
          } catch (eventError) {
            console.log('❌ Event method failed:', eventError)
          }

          // 备用方案2：尝试使用浏览器F12模拟
          try {
            console.log('🔄 Trying F12 simulation...')
            const event = new KeyboardEvent('keydown', {
              key: 'F12',
              ctrlKey: false,
              shiftKey: false,
              altKey: false,
              metaKey: false,
              bubbles: true,
              cancelable: true,
            })
            document.dispatchEvent(event)
            console.log('✅ F12 simulation dispatched')
          } catch (f12Error) {
            console.log('❌ F12 simulation failed:', f12Error)
          }

          // 备用方案3：尝试直接打开
          try {
            console.log('🔄 Trying direct devtools access...')
            // @ts-ignore - 尝试访问可能的内部API
            if (window.__TAURI__ && (window.__TAURI__ as any).devtools) {
              await (window.__TAURI__ as any).devtools.open()
              console.log('✅ Direct devtools access successful')
            }
          } catch (directError) {
            console.log('❌ Direct devtools access failed:', directError)
          }
        }
      } else {
        // 浏览器环境中，尝试打开开发者工具
        console.log('🌐 Browser environment - simulating F12...')
        const event = new KeyboardEvent('keydown', {
          key: 'F12',
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          bubbles: true,
          cancelable: true,
        })
        document.dispatchEvent(event)
        console.log('✅ F12 simulation dispatched in browser')
      }
    } catch (error) {
      console.error('❌ Failed to toggle devtools:', error)
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
          vueLoaded: typeof createApp !== 'undefined' || typeof Vue !== 'undefined',
          elementPlusLoaded: typeof ElementPlus !== 'undefined',
          appMounted: document.getElementById('app') !== null,
          routerLoaded: typeof window !== 'undefined' && window.$router !== undefined,
          domLoaded: document.readyState === 'complete',
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
  },
}

// 开发模式快捷键
export const setupDevShortcuts = () => {
  console.log('🔧 Setting up developer shortcuts...')

  // 在所有环境中都启用开发者工具快捷键
  const handleKeyDown = (e: KeyboardEvent) => {
    console.log(
      `🎹 Key pressed: ${e.key} (Ctrl: ${e.ctrlKey}, Shift: ${e.shiftKey}, Alt: ${e.altKey})`
    )

    // Ctrl+Shift+I 打开开发者工具
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      console.log('🔧 Ctrl+Shift+I detected - opening dev tools')
      e.preventDefault()
      devTools.toggle()
    }

    // Ctrl+Shift+J 打开控制台
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      console.log('🔧 Ctrl+Shift+J detected - opening dev tools')
      e.preventDefault()
      devTools.toggle()
    }

    // F12 打开开发者工具
    if (e.key === 'F12') {
      console.log('🔧 F12 detected - opening dev tools')
      e.preventDefault()
      devTools.toggle()
    }

    // Ctrl+Shift+D 打开调试面板
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      console.log('🔧 Ctrl+Shift+D detected - toggling debug panel')
      e.preventDefault()
      // 切换调试面板显示/隐藏
      const debugPanel = document.getElementById('debug-panel')
      if (debugPanel) {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none'
        console.log(`🔧 Debug panel ${debugPanel.style.display === 'none' ? 'hidden' : 'shown'}`)
      } else {
        console.log('⚠️ Debug panel not found')
      }
    }
  }

  // 添加事件监听器
  document.addEventListener('keydown', handleKeyDown)

  // 监听来自后端的开打开发者工具请求
  if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.event) {
    // 监听新的事件
    window.__TAURI__.event
      .listen('open-dev-tools-event', () => {
        console.log('📡 Received dev tools request from backend')
        // 在 Tauri v2 中，尝试使用插件方式
        tryOpenDevToolsViaPlugin()
      })
      .catch(error => {
        console.log('⚠️ Failed to listen for dev tools events:', error)
      })

    // 监听开发者工具请求处理确认
    window.__TAURI__.event
      .listen('devtools-request-processed', () => {
        console.log('📡 Dev tools request processed by backend')
      })
      .catch(error => {
        console.log('⚠️ Failed to listen for devtools processing events:', error)
      })
  }

  console.log('✅ Developer shortcuts setup complete')
}

// 尝试通过插件方式打开开发者工具
const tryOpenDevToolsViaPlugin = async () => {
  try {
    console.log('🔧 Attempting to open dev tools via plugin...')

    // 在 Tauri v2 中，开发者工具通过插件管理
    if (window.__TAURI__ && window.__TAURI__.devtools) {
      await window.__TAURI__.devtools.open()
      console.log('✅ Dev tools opened via plugin')
      return
    }

    // 如果插件方式不可用，尝试其他方法
    console.log('⚠️ Dev tools plugin not available, trying alternative methods...')

    // 方法1: 尝试使用浏览器的开发者工具API
    if (typeof window !== 'undefined' && window.opener) {
      try {
        // 尝试通过 window.opener 访问开发者工具
        console.log('🔄 Trying window.opener method...')
        // 这个方法在现代浏览器中通常不起作用，但值得尝试
      } catch (error) {
        console.log('❌ Window opener method failed:', error)
      }
    }

    // 方法2: 创建一个开发者工具提示
    console.log('💡 Showing dev tools instructions...')
    showDevToolsInstructions()
  } catch (error) {
    console.error('❌ Failed to open dev tools via plugin:', error)
    showDevToolsInstructions()
  }
}

// 显示开发者工具使用说明
const showDevToolsInstructions = () => {
  const instructions = `
🔧 ChefMind 开发者工具使用说明:

1. 快捷键方式:
   - F12: 打开开发者工具
   - Ctrl+Shift+I: 打开开发者工具
   - Ctrl+Shift+J: 打开控制台
   - Ctrl+Shift+D: 打开调试面板

2. 调试面板:
   - 使用 Ctrl+Shift+D 打开内置调试面板
   - 查看系统信息、前端状态、网络状态等

3. 控制台调试:
   - 右键页面 -> 检查元素
   - 或使用上述快捷键

4. 生产环境调试:
   - 所有日志会输出到控制台
   - 使用调试面板查看详细状态信息
  `

  console.log(instructions)

  // 创建一个临时提示框
  try {
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">🔧 开发者工具</div>
      <div>使用 F12 或 Ctrl+Shift+I 打开</div>
      <div>使用 Ctrl+Shift+D 打开调试面板</div>
      <div style="margin-top: 5px; font-size: 10px; opacity: 0.8;">点击关闭</div>
    `

    document.body.appendChild(notification)

    // 点击关闭
    notification.addEventListener('click', () => {
      document.body.removeChild(notification)
    })

    // 10秒后自动关闭
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 10000)
  } catch (error) {
    console.log('⚠️ Could not show notification:', error)
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
      vueLoaded: typeof createApp !== 'undefined' || typeof Vue !== 'undefined',
      elementPlusLoaded: typeof ElementPlus !== 'undefined',
      appMounted: document.getElementById('app') !== null,
      routerLoaded: typeof window !== 'undefined' && window.$router !== undefined,
    }

    console.log('Frontend load checks:', checks)
    return checks
  },
}
