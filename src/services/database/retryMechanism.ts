/**
 * 数据库操作重试机制
 * 处理 SQLite 锁定和繁忙状态
 */
export class RetryMechanism {
  private static readonly DEFAULT_MAX_RETRIES = 3
  private static readonly DEFAULT_BASE_DELAY = 100
  private static readonly RETRYABLE_ERRORS = [
    'SQLITE_BUSY',
    'SQLITE_LOCKED',
    'SQLITE_PROTOCOL',
    'SQLITE_SCHEMA',
  ]

  /**
   * 执行带重试的异步操作
   */
  public static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      baseDelay?: number
      onRetry?: (error: Error, attempt: number) => void
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES
    const baseDelay = options.baseDelay || this.DEFAULT_BASE_DELAY
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * baseDelay

          if (options.onRetry) {
            options.onRetry(error, attempt + 1)
          } else {
            console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms:`, error.message)
          }

          await this.delay(delay)
          continue
        }

        throw error
      }
    }

    throw lastError!
  }

  /**
   * 执行带重试的同步操作
   */
  public static executeWithRetrySync<T>(
    operation: () => T,
    options: {
      maxRetries?: number
      baseDelay?: number
      onRetry?: (error: Error, attempt: number) => void
    } = {}
  ): T {
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES
    const baseDelay = options.baseDelay || this.DEFAULT_BASE_DELAY
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return operation()
      } catch (error) {
        lastError = error as Error

        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * baseDelay

          if (options.onRetry) {
            options.onRetry(error, attempt + 1)
          } else {
            console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms:`, error.message)
          }

          // 对于同步操作，我们不能使用 await，但我们可以抛出错误让调用者处理
          throw new RetryableError(error, delay)
        }

        throw error
      }
    }

    throw lastError!
  }

  /**
   * 检查错误是否可重试
   */
  private static isRetryableError(error: Error): boolean {
    // 检查错误代码
    if (this.RETRYABLE_ERRORS.includes(error.message)) {
      return true
    }

    // 检查错误消息中是否包含特定的 SQLite 错误
    const message = error.message.toLowerCase()
    return message.includes('database is locked') ||
           message.includes('database is busy') ||
           message.includes('sqlite_busy') ||
           message.includes('sqlite_locked')
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 带指数退避的延迟重试
   */
  public static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      jitter?: boolean
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES
    const baseDelay = options.baseDelay || this.DEFAULT_BASE_DELAY
    const maxDelay = options.maxDelay || 5000
    const jitter = options.jitter !== false

    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (this.isRetryableError(error) && attempt < maxRetries) {
          let delay = baseDelay * Math.pow(2, attempt)
          delay = Math.min(delay, maxDelay)

          if (jitter) {
            delay += Math.random() * baseDelay
          }

          console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(delay)}ms`)

          await this.delay(delay)
          continue
        }

        throw error
      }
    }

    throw lastError!
  }
}

/**
 * 可重试错误类
 */
export class RetryableError extends Error {
  constructor(
    public readonly originalError: Error,
    public readonly retryDelay: number
  ) {
    super(originalError.message)
    this.name = 'RetryableError'
    this.stack = originalError.stack
  }
}