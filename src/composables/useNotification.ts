// ChefMind 智食谱 - 通知系统组合式函数

import { ref, reactive } from 'vue'

interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
  actions?: Array<{
    label: string
    handler: () => void
    type?: 'primary' | 'secondary' | 'danger'
  }>
}

interface LoadingState {
  isLoading: boolean
  message: string
  fullScreen: boolean
}

// 全局状态
const notifications = ref<NotificationItem[]>([])
const loadingState = reactive<LoadingState>({
  isLoading: false,
  message: '',
  fullScreen: false
})

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function useNotification() {
  // 显示通知
  const showNotification = (options: Omit<NotificationItem, 'id'>) => {
    const notification: NotificationItem = {
      id: generateId(),
      duration: 5000,
      closable: true,
      ...options
    }
    
    notifications.value.push(notification)
    
    // 自动关闭
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }
    
    return notification.id
  }
  
  // 移除通知
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // 清除所有通知
  const clearNotifications = () => {
    notifications.value = []
  }
  
  // 显示成功消息
  const showSuccess = (message: string, title?: string, duration?: number) => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }
  
  // 显示错误消息
  const showError = (message: string, title?: string, details?: string) => {
    return showNotification({
      type: 'error',
      title: title || '操作失败',
      message,
      duration: 0, // 错误消息不自动关闭
      actions: details ? [
        {
          label: '重试',
          handler: () => {
            // 这里可以添加重试逻辑
            console.log('重试操作')
          },
          type: 'primary'
        }
      ] : undefined
    })
  }
  
  // 显示警告消息
  const showWarning = (message: string, title?: string, duration?: number) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      duration: duration || 8000
    })
  }
  
  // 显示信息消息
  const showInfo = (message: string, title?: string, duration?: number) => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }
  
  // 显示加载状态
  const showLoading = (message: string = '加载中...', fullScreen: boolean = false) => {
    loadingState.isLoading = true
    loadingState.message = message
    loadingState.fullScreen = fullScreen
  }
  
  // 隐藏加载状态
  const hideLoading = () => {
    loadingState.isLoading = false
    loadingState.message = ''
    loadingState.fullScreen = false
  }
  
  // API调用包装器
  const withLoading = async <T>(
    promise: Promise<T>,
    loadingMessage: string = '处理中...',
    fullScreen: boolean = false
  ): Promise<T> => {
    try {
      showLoading(loadingMessage, fullScreen)
      const result = await promise
      hideLoading()
      return result
    } catch (error) {
      hideLoading()
      throw error
    }
  }
  
  // 带错误处理的API调用
  const withErrorHandling = async <T>(
    promise: Promise<T>,
    errorTitle?: string,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await promise
      if (successMessage) {
        showSuccess(successMessage)
      }
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showError(errorMessage, errorTitle)
      console.error('API调用失败:', error)
      return null
    }
  }
  
  // 组合加载和错误处理
  const withLoadingAndErrorHandling = async <T>(
    promise: Promise<T>,
    options: {
      loadingMessage?: string
      fullScreen?: boolean
      errorTitle?: string
      successMessage?: string
    } = {}
  ): Promise<T | null> => {
    const {
      loadingMessage = '处理中...',
      fullScreen = false,
      errorTitle,
      successMessage
    } = options
    
    try {
      showLoading(loadingMessage, fullScreen)
      const result = await promise
      hideLoading()
      
      if (successMessage) {
        showSuccess(successMessage)
      }
      
      return result
    } catch (error) {
      hideLoading()
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showError(errorMessage, errorTitle)
      console.error('操作失败:', error)
      return null
    }
  }
  
  return {
    // 状态
    notifications,
    loadingState,
    
    // 通知方法
    showNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // 加载方法
    showLoading,
    hideLoading,
    
    // 工具方法
    withLoading,
    withErrorHandling,
    withLoadingAndErrorHandling
  }
}

// 全局实例（单例模式）
export const globalNotification = useNotification()