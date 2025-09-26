import type { DatabaseType } from '@/config/sqlite'
import { RetryMechanism } from './retryMechanism'

/**
 * 数据库健康状态
 */
export interface DatabaseHealth {
  isHealthy: boolean
  connectionStatus: 'connected' | 'disconnected' | 'error'
  responseTime: number
  lastChecked: Date
  details: {
    canExecute: boolean
    canRead: boolean
    canWrite: boolean
    fileSize?: number
    pageCount?: number
    integrityCheck?: string
    error?: string
  }
}

/**
 * 数据库健康检查器
 */
export class DatabaseHealthChecker {
  private db: DatabaseType
  private lastHealthCheck: DatabaseHealth | null = null
  private checkInterval: number
  private intervalId?: NodeJS.Timeout

  constructor(db: DatabaseType, checkInterval: number = 30000) {
    this.db = db
    this.checkInterval = checkInterval
  }

  /**
   * 执行健康检查
   */
  public async checkHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now()
    let isHealthy = true
    let connectionStatus: DatabaseHealth['connectionStatus'] = 'connected'
    let responseTime = 0
    let error: string | undefined

    const details: DatabaseHealth['details'] = {
      canExecute: false,
      canRead: false,
      canWrite: false,
    }

    try {
      // 测试基本连接
      await this.testConnection()
      details.canExecute = true

      // 测试读操作
      await this.testReadOperation()
      details.canRead = true

      // 测试写操作
      await this.testWriteOperation()
      details.canWrite = true

      // 获取数据库统计信息
      await this.getDatabaseStats(details)

      // 执行完整性检查
      await this.performIntegrityCheck(details)

    } catch (err) {
      isHealthy = false
      connectionStatus = 'error'
      error = err instanceof Error ? err.message : String(err)
      details.error = error
      console.error('Database health check failed:', error)
    }

    responseTime = Date.now() - startTime

    const health: DatabaseHealth = {
      isHealthy,
      connectionStatus,
      responseTime,
      lastChecked: new Date(),
      details,
    }

    this.lastHealthCheck = health
    return health
  }

  /**
   * 测试基本连接
   */
  private async testConnection(): Promise<void> {
    return RetryMechanism.executeWithRetry(async () => {
      this.db.prepare('SELECT 1').get()
    }, { maxRetries: 2 })
  }

  /**
   * 测试读操作
   */
  private async testReadOperation(): Promise<void> {
    return RetryMechanism.executeWithRetry(async () => {
      this.db.prepare('SELECT name FROM sqlite_master WHERE type="table" LIMIT 1').get()
    }, { maxRetries: 2 })
  }

  /**
   * 测试写操作
   */
  private async testWriteOperation(): Promise<void> {
    return RetryMechanism.executeWithRetry(async () => {
      // 创建一个临时表来测试写操作
      this.db.exec('CREATE TABLE IF NOT EXISTS health_test (id INTEGER PRIMARY KEY)')
      this.db.exec('INSERT OR IGNORE INTO health_test (id) VALUES (1)')
      this.db.exec('DELETE FROM health_test WHERE id = 1')
    }, { maxRetries: 2 })
  }

  /**
   * 获取数据库统计信息
   */
  private async getDatabaseStats(details: DatabaseHealth['details']): Promise<void> {
    try {
      const stats = this.db.prepare('PRAGMA page_count').get() as any
      const pageSize = this.db.prepare('PRAGMA page_size').get() as any

      if (stats && pageSize) {
        details.pageCount = stats.page_count
        details.fileSize = stats.page_count * pageSize.page_size
      }
    } catch (error) {
      console.warn('Failed to get database stats:', error)
    }
  }

  /**
   * 执行完整性检查
   */
  private async performIntegrityCheck(details: DatabaseHealth['details']): Promise<void> {
    try {
      const result = this.db.prepare('PRAGMA integrity_check').get() as any
      if (result && result.integrity_check) {
        details.integrityCheck = result.integrity_check
        if (result.integrity_check !== 'ok') {
          throw new Error(`Database integrity check failed: ${result.integrity_check}`)
        }
      }
    } catch (error) {
      console.warn('Failed to perform integrity check:', error)
      throw error
    }
  }

  /**
   * 获取最后一次健康检查结果
   */
  public getLastHealthCheck(): DatabaseHealth | null {
    return this.lastHealthCheck
  }

  /**
   * 启动定期健康检查
   */
  public startPeriodicCheck(): void {
    if (this.intervalId) {
      this.stopPeriodicCheck()
    }

    this.intervalId = setInterval(async () => {
      try {
        await this.checkHealth()
      } catch (error) {
        console.error('Periodic health check failed:', error)
      }
    }, this.checkInterval)
  }

  /**
   * 停止定期健康检查
   */
  public stopPeriodicCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  /**
   * 等待数据库健康
   */
  public async waitForHealthy(timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const health = await this.checkHealth()
      if (health.isHealthy) {
        return true
      }

      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return false
  }

  /**
   * 获取健康状态摘要
   */
  public getHealthSummary(): string {
    if (!this.lastHealthCheck) {
      return 'No health check performed'
    }

    const { isHealthy, connectionStatus, responseTime, details } = this.lastHealthCheck

    if (!isHealthy) {
      return `Unhealthy - ${details.error || 'Unknown error'}`
    }

    return `Healthy - ${connectionStatus}, ${responseTime}ms response time`
  }
}