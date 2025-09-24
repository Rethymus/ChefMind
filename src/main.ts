import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'animate.css'
import './styles/global.scss'
import './styles/print.scss'
import { AIProviderFactory } from './services/aiProviders'
import { setupDevShortcuts, debugUtils } from './utils/devtools'
import { createDebugPanel } from './utils/debugPanel'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('全局错误捕获:', error)
  console.error('错误信息:', info)
  console.error('出错组件:', instance)
}

// 全局未处理的Promise拒绝事件
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise拒绝:', event.reason)
  // 阻止默认的错误处理行为
  event.preventDefault()
})

// 全局未捕获的JavaScript错误
window.addEventListener('error', event => {
  console.error('未捕获的JavaScript错误:', event.error)
  event.preventDefault()
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 初始化AI提供商
const aiProviderFactory = AIProviderFactory.getInstance()
aiProviderFactory.initialize().catch(error => {
  console.error('❌ AI提供商工厂初始化失败:', error)
})

// 设置开发者工具
setupDevShortcuts()

// 应用挂载前的调试检查
if (import.meta.env.DEV) {
  console.log('🔧 [Debug] Environment:', import.meta.env.MODE)
  console.log('🔧 [Debug] Tauri Available:', debugUtils.checkTauriAPI())

  // 延迟检查前端资源加载
  setTimeout(() => {
    debugUtils.checkFrontendLoad()
  }, 1000)
}

app.mount('#app')

// 应用挂载后的调试检查
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log('🔧 [Debug] App mounted successfully')
    console.log('🔧 [Debug] Current route:', window.location.pathname)

    // 创建调试面板
    createDebugPanel()

    // 发送DOM加载完成事件
    if (window.__TAURI__) {
      setTimeout(() => {
        try {
          window.__TAURI__.invoke('log_message', {
            message: 'Frontend application mounted successfully'
          })
        } catch (error) {
          console.log('Failed to send log to backend:', error)
        }
      }, 1000)
    }
  }, 2000)
} else {
  // 在生产环境中也创建调试面板，但默认隐藏
  setTimeout(() => {
    createDebugPanel()
    console.log('Debug panel created. Use Ctrl+Shift+D to toggle.')
  }, 3000)
}
