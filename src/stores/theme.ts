import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type ThemeType = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>('light')

  // 计算属性：是否为暗色模式
  const isDarkMode = computed(() => currentTheme.value === 'dark')

  // 初始化主题，优先从本地存储读取
  const initTheme = () => {
    const savedTheme = localStorage.getItem('chefmind-theme') as ThemeType | null

    // 如果有保存的主题设置，使用保存的设置
    if (savedTheme) {
      setTheme(savedTheme)
      return
    }

    // 否则检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('chefmind-theme-auto') === 'true') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  // 设置主题
  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    localStorage.setItem('chefmind-theme', theme)

    // 更新文档根元素的data-theme属性
    document.documentElement.setAttribute('data-theme', theme)

    // 更新body类名
    if (theme === 'dark') {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }

    // 更新meta主题颜色
    updateMetaThemeColor(theme)
  }

  // 更新meta主题颜色
  const updateMetaThemeColor = (theme: ThemeType) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = theme === 'dark' ? '#1a1a1a' : '#ffffff'
      document.head.appendChild(meta)
    }
  }

  // 切换主题
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // 设置自动跟随系统主题
  const setAutoTheme = (auto: boolean) => {
    localStorage.setItem('chefmind-theme-auto', auto.toString())

    if (auto) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }

  // 检查是否自动跟随系统主题
  const isAutoTheme = computed(() => {
    return localStorage.getItem('chefmind-theme-auto') === 'true'
  })

  return {
    currentTheme,
    isDarkMode,
    initTheme,
    setTheme,
    toggleTheme,
    setAutoTheme,
    isAutoTheme,
  }
})
