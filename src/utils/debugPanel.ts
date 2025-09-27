// 调试面板工具
// 创建一个简单的调试面板，用于显示应用状态和调试信息

interface DebugPanelConfig {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  defaultVisible?: boolean
  showMemoryInfo?: boolean
  showNetworkInfo?: boolean
  showComponentInfo?: boolean
}

class DebugPanel {
  private element: HTMLElement | null = null
  private isVisible = false
  private config: DebugPanelConfig

  constructor(config: DebugPanelConfig = {}) {
    this.config = {
      position: 'top-right',
      defaultVisible: false,
      showMemoryInfo: true,
      showNetworkInfo: true,
      showComponentInfo: true,
      ...config
    }
  }

  // 创建调试面板DOM
  private createPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.id = 'debug-panel'
    panel.style.cssText = `
      position: fixed;
      ${this.getPositionStyle()}
      width: 320px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      border-radius: 8px;
      padding: 15px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      z-index: 9999;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: ${this.isVisible ? 'block' : 'none'};
      transition: all 0.3s ease;
    `

    // 创建标题栏
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    `

    const title = document.createElement('div')
    title.textContent = '🔧 Debug Panel'
    title.style.fontWeight = 'bold'

    const closeBtn = document.createElement('button')
    closeBtn.textContent = '×'
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    closeBtn.onclick = () => this.toggle()

    header.appendChild(title)
    header.appendChild(closeBtn)
    panel.appendChild(header)

    // 创建内容区域
    const content = document.createElement('div')
    content.id = 'debug-panel-content'
    panel.appendChild(content)

    // 创建控制按钮
    const controls = document.createElement('div')
    controls.style.cssText = `
      margin-top: 10px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `

    const buttons = [
      { text: 'Refresh', action: () => this.updateInfo() },
      { text: 'Clear Log', action: () => this.clearLog() },
      { text: 'Dev Tools', action: () => this.openDevTools() },
      { text: 'Memory', action: () => this.showMemoryInfo() },
    ]

    buttons.forEach(btn => {
      const button = document.createElement('button')
      button.textContent = btn.text
      button.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: background 0.2s;
      `
      button.onmouseover = () => button.style.background = 'rgba(255, 255, 255, 0.2)'
      button.onmouseout = () => button.style.background = 'rgba(255, 255, 255, 0.1)'
      button.onclick = btn.action
      controls.appendChild(button)
    })

    panel.appendChild(controls)

    return panel
  }

  // 获取位置样式
  private getPositionStyle(): string {
    switch (this.config.position) {
      case 'top-left':
        return 'top: 10px; left: 10px;'
      case 'top-right':
        return 'top: 10px; right: 10px;'
      case 'bottom-left':
        return 'bottom: 10px; left: 10px;'
      case 'bottom-right':
        return 'bottom: 10px; right: 10px;'
      default:
        return 'top: 10px; right: 10px;'
    }
  }

  // 初始化面板
  private init(): void {
    if (this.element) return

    this.element = this.createPanel()
    document.body.appendChild(this.element)

    // 初始更新信息
    this.updateInfo()

    // 定期更新信息
    setInterval(() => this.updateInfo(), 5000)

    console.log('✅ Debug panel initialized')
  }

  // 显示/隐藏面板
  toggle(): void {
    if (!this.element) {
      this.init()
      this.isVisible = true
    } else {
      this.isVisible = !this.isVisible
      this.element.style.display = this.isVisible ? 'block' : 'none'
    }

    if (this.isVisible) {
      this.updateInfo()
    }
  }

  // 更新面板信息
  private updateInfo(): void {
    if (!this.element || !this.isVisible) return

    const content = this.element.querySelector('#debug-panel-content')
    if (!content) return

    const info = this.getAppInfo()
    content.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="color: #4CAF50; font-weight: bold; margin-bottom: 4px;">Application</div>
        <div>Name: ${info.name}</div>
        <div>Version: ${info.version}</div>
        <div>Mode: ${info.mode}</div>
        <div>Time: ${new Date().toLocaleTimeString()}</div>
      </div>

      ${this.config.showMemoryInfo ? this.getMemoryInfo() : ''}

      ${this.config.showNetworkInfo ? this.getNetworkInfo() : ''}

      <div style="margin-bottom: 12px;">
        <div style="color: #2196F3; font-weight: bold; margin-bottom: 4px;">Frontend</div>
        <div>Vue: ${info.vueLoaded ? '✅' : '❌'}</div>
        <div>Element+: ${info.elementPlusLoaded ? '✅' : '❌'}</div>
        <div>Router: ${info.routerLoaded ? '✅' : '❌'}</div>
        <div>App Mounted: ${info.appMounted ? '✅' : '❌'}</div>
        <div>Tauri: ${info.tauriAvailable ? '✅' : '❌'}</div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="color: #FF9800; font-weight: bold; margin-bottom: 4px;">Performance</div>
        <div>Load Time: ${info.loadTime}ms</div>
        <div>Memory: ${info.memoryUsage}</div>
        <div>Connections: ${info.connections || 'Unknown'}</div>
      </div>

      <div style="font-size: 10px; color: #888; margin-top: 8px;">
        Debug Panel v1.0 | Use Ctrl+Shift+D to toggle
      </div>
    `
  }

  // 获取应用信息
  private getAppInfo(): any {
    const startTime = performance.now()

    return {
      name: 'ChefMind',
      version: '3.0.0',
      mode: import.meta.env.MODE,
      vueLoaded: typeof createApp !== 'undefined',
      elementPlusLoaded: typeof ElementPlus !== 'undefined',
      routerLoaded: typeof window !== 'undefined' && window.$router !== undefined,
      appMounted: document.getElementById('app') !== null,
      tauriAvailable: typeof window !== 'undefined' && window.__TAURI__,
      loadTime: Math.round(performance.now() - startTime),
      memoryUsage: this.getMemoryUsage(),
      connections: (navigator as any).connection ? (navigator as any).connection.downlink : 'Unknown'
    }
  }

  // 获取内存信息
  private getMemoryInfo(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return `
        <div style="margin-bottom: 12px;">
          <div style="color: #9C27B0; font-weight: bold; margin-bottom: 4px;">Memory</div>
          <div>Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB</div>
          <div>Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB</div>
          <div>Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB</div>
        </div>
      `
    }
    return ''
  }

  // 获取网络信息
  private getNetworkInfo(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return `
        <div style="margin-bottom: 12px;">
          <div style="color: #00BCD4; font-weight: bold; margin-bottom: 4px;">Network</div>
          <div>Type: ${connection.effectiveType || 'Unknown'}</div>
          <div>Downlink: ${connection.downlink || 'Unknown'}Mbps</div>
          <div>RTT: ${connection.rtt || 'Unknown'}ms</div>
          <div>Online: ${navigator.onLine ? 'Yes' : 'No'}</div>
        </div>
      `
    }
    return ''
  }

  // 获取内存使用情况
  private getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`
    }
    return 'Unknown'
  }

  // 清空日志
  private clearLog(): void {
    console.clear()
    this.updateInfo()
  }

  // 打开开发者工具
  private openDevTools(): void {
    if (typeof window !== 'undefined' && window.__TAURI__) {
      // Tauri环境
      try {
        window.__TAURI__.invoke('open_dev_tools')
      } catch (error) {
        console.log('Could not open dev tools via Tauri:', error)
      }
    } else {
      // 浏览器环境
      const event = new KeyboardEvent('keydown', {
        key: 'F12',
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(event)
    }
  }

  // 显示内存信息
  private showMemoryInfo(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.table({
        'Used Heap (MB)': Math.round(memory.usedJSHeapSize / 1024 / 1024),
        'Total Heap (MB)': Math.round(memory.totalJSHeapSize / 1024 / 1024),
        'Heap Limit (MB)': Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        'Usage (%)': Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      })
    } else {
      console.log('Memory API not available')
    }
  }

  // 销毁面板
  destroy(): void {
    if (this.element && document.body.contains(this.element)) {
      document.body.removeChild(this.element)
      this.element = null
    }
  }
}

// 创建调试面板实例
let debugPanelInstance: DebugPanel | null = null

// 导出创建调试面板的函数
export const createDebugPanel = (config?: DebugPanelConfig): void => {
  if (!debugPanelInstance) {
    debugPanelInstance = new DebugPanel(config)
  }
  debugPanelInstance.toggle()
}

// 导出调试面板类（用于高级用法）
export { DebugPanel }

// 全局快捷键支持（在main.ts中已经设置了快捷键，这里是备用的）
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      createDebugPanel()
    }
  })
}

console.log('🔧 Debug panel module loaded. Use Ctrl+Shift+D to toggle.')