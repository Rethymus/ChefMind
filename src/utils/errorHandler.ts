import { App, ComponentPublicInstance } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

// 错误类型定义
export interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: Date
  url: string
  userAgent: string
  userId?: string
}

// 错误级别
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 错误报告服务
class ErrorReportingService {
  private errors: ErrorInfo[] = []
  private maxErrors = 100
  
  // 报告错误到服务器
  async reportError(error: ErrorInfo, level: ErrorLevel = ErrorLevel.ERROR) {
    try {
      // 存储到本地数组
      this.errors.unshift({
        ...error,
        timestamp: new Date()
      })
      
      // 保持错误数量在限制内
      if (this.errors.length > this.maxErrors) {
        this.errors = this.errors.slice(0, this.maxErrors)
      }
      
      // 存储到 localStorage（用于离线报告）
      localStorage.setItem('chefmind_errors', JSON.stringify(this.errors.slice(0, 10)))
      
      // 在实际应用中，这里应该发送到服务器
      console.group(`🚨 ${level.toUpperCase()} 错误报告`)
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)
      console.error('完整错误对象:', error)
      console.groupEnd()
      
      // 对于严重错误，显示通知
      if (level === ErrorLevel.CRITICAL || level === ErrorLevel.ERROR) {
        ElNotification({
          title: '系统错误',
          message: '应用遇到了一个错误，开发团队已收到报告',
          type: 'error',
          duration: 0,
          showClose: true
        })
      }
      
    } catch (reportError) {
      console.error('错误报告失败:', reportError)
    }
  }
  
  // 获取错误历史
  getErrorHistory(): ErrorInfo[] {
    return [...this.errors]
  }
  
  // 清除错误历史
  clearErrors() {
    this.errors = []
    localStorage.removeItem('chefmind_errors')
  }
}

export const errorReporting = new ErrorReportingService()

// 全局错误处理器
export function setupErrorHandling(app: App) {
  // Vue 应用错误处理
  app.config.errorHandler = (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
    const error = err as Error
    const errorInfo: ErrorInfo = {
      message: error.message || '未知错误',
      stack: error.stack,
      componentStack: info,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    errorReporting.reportError(errorInfo, ErrorLevel.ERROR)
  }
  
  // 全局未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo: ErrorInfo = {
      message: `未处理的 Promise 错误: ${event.reason}`,
      stack: event.reason?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    errorReporting.reportError(errorInfo, ErrorLevel.WARNING)
    
    // 显示用户友好的错误信息
    ElMessage.error('操作失败，请重试')
  })
  
  // 全局 JavaScript 错误
  window.addEventListener('error', (event) => {
    const errorInfo: ErrorInfo = {
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    errorReporting.reportError(errorInfo, ErrorLevel.ERROR)
  })
  
  // 资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as (HTMLImageElement | HTMLLinkElement | HTMLScriptElement)
      let resourceUrl = '';
      if ('src' in target) {
        resourceUrl = target.src;
      } else if ('href' in target) {
        resourceUrl = target.href;
      }
      const errorInfo: ErrorInfo = {
        message: `资源加载失败: ${target.tagName} - ${resourceUrl}`,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      errorReporting.reportError(errorInfo, ErrorLevel.WARNING)
    }
  }, true)
}

// 组件级错误处理助手
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  fallback?: unknown,
  errorMessage?: string
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args)
      
      // 如果返回 Promise，处理 Promise 错误
      if (result && result instanceof Promise) {
        return result.catch((error: Error) => {
          const errorInfo: ErrorInfo = {
            message: errorMessage || error.message || '操作失败',
            stack: error.stack,
            timestamp: new Date(),
            url: window.location.href,
            userAgent: navigator.userAgent
          }
          
          errorReporting.reportError(errorInfo, ErrorLevel.WARNING)
          ElMessage.error(errorMessage || '操作失败，请重试')
          
          return fallback
        })
      }
      
      return result
    } catch (error) {
      const errorInfo: ErrorInfo = {
        message: errorMessage || (error as Error).message || '操作失败',
        stack: (error as Error).stack,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      errorReporting.reportError(errorInfo, ErrorLevel.WARNING)
      ElMessage.error(errorMessage || '操作失败，请重试')
      
      return fallback
    }
  }) as T
}

// 异步操作错误处理装饰器
export function handleAsyncError(errorMessage?: string) {
  return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        const errorInfo: ErrorInfo = {
          message: errorMessage || (error as Error).message || '异步操作失败',
          stack: (error as Error).stack,
          timestamp: new Date(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
        
        errorReporting.reportError(errorInfo, ErrorLevel.WARNING)
        ElMessage.error(errorMessage || '操作失败，请重试')
        
        throw error
      }
    }
    
    return descriptor
  }
}

// 网络请求错误处理
export function handleNetworkError(error: Error & { response?: { status: number }, request?: unknown }): string {
  let message = '网络请求失败'
  
  if (error.response) {
    // 服务器响应错误
    const status = error.response.status
    switch (status) {
      case 400:
        message = '请求参数错误'
        break
      case 401:
        message = '未授权，请登录'
        break
      case 403:
        message = '权限不足'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      case 502:
        message = '网关错误'
        break
      case 503:
        message = '服务不可用'
        break
      default:
        message = `服务器错误 (${status})`
    }
  } else if (error.request) {
    // 网络连接错误
    message = '网络连接失败，请检查网络设置'
  } else {
    // 其他错误
    message = error.message || '未知网络错误'
  }
  
  const errorInfo: ErrorInfo = {
    message: `网络错误: ${message}`,
    stack: error.stack,
    timestamp: new Date(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
  
  errorReporting.reportError(errorInfo, ErrorLevel.WARNING)
  
  return message
}
