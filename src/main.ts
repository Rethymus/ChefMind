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

app.mount('#app')
