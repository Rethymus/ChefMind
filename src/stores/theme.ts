import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  
  const initTheme = () => {
    // 从本地存储读取主题设置
    const savedTheme = localStorage.getItem('chefmind-theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统主题偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem('chefmind-theme', isDark.value ? 'dark' : 'light')
  }
  
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  return {
    isDark,
    initTheme,
    toggleTheme
  }
})