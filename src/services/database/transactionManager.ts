import type { DatabaseType } from '@/config/sqlite'
import { RetryMechanism } from './retryMechanism'

/**
 * 事务状态
 */
export enum TransactionState {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  COMMITTED = 'committed',
  ROLLED_BACK = 'rolled_back',
  ERROR = 'error'
}

/**
 * 事务管理器
 * 提供改进的事务处理和错误恢复机制
 */
export class TransactionManager {
  private db: DatabaseType
  private state: TransactionState = TransactionState.INACTIVE
  private savepoints: string[] = []
  private transactionTimeout: number
  private timeoutTimer?: NodeJS.Timeout

  constructor(db: DatabaseType, timeout: number = 30000) {
    this.db = db
    this.transactionTimeout = timeout
  }

  /**
   * 开始事务
   */
  public async begin(): Promise<void> {
    if (this.state === TransactionState.ACTIVE) {
      throw new Error('Transaction already active')
    }

    try {
      await this.executeWithRetry(() => {
        this.db.exec('BEGIN IMMEDIATE TRANSACTION')
        this.state = TransactionState.ACTIVE
        this.startTimeout()
      })
    } catch (error) {
      this.state = TransactionState.ERROR
      throw new Error(`Failed to begin transaction: ${error}`)
    }
  }

  /**
   * 提交事务
   */
  public async commit(): Promise<void> {
    if (this.state !== TransactionState.ACTIVE) {
      throw new Error('No active transaction to commit')
    }

    try {
      await this.executeWithRetry(() => {
        this.db.exec('COMMIT')
        this.state = TransactionState.COMMITTED
        this.clearTimeout()
      })
    } catch (error) {
      this.state = TransactionState.ERROR
      await this.rollback()
      throw new Error(`Failed to commit transaction: ${error}`)
    }
  }

  /**
   * 回滚事务
   */
  public async rollback(): Promise<void> {
    if (this.state === TransactionState.INACTIVE || this.state === TransactionState.ROLLED_BACK) {
      return
    }

    try {
      await this.executeWithRetry(() => {
        this.db.exec('ROLLBACK')
        this.state = TransactionState.ROLLED_BACK
        this.clearTimeout()
      })
    } catch (error) {
      console.error('Failed to rollback transaction:', error)
      this.state = TransactionState.ERROR
    }
  }

  /**
   * 创建保存点
   */
  public async savepoint(name: string): Promise<void> {
    if (this.state !== TransactionState.ACTIVE) {
      throw new Error('No active transaction for savepoint')
    }

    try {
      await this.executeWithRetry(() => {
        this.db.exec(`SAVEPOINT ${name}`)
        this.savepoints.push(name)
      })
    } catch (error) {
      throw new Error(`Failed to create savepoint ${name}: ${error}`)
    }
  }

  /**
   * 释放保存点
   */
  public async releaseSavepoint(name: string): Promise<void> {
    if (this.state !== TransactionState.ACTIVE) {
      throw new Error('No active transaction')
    }

    const index = this.savepoints.indexOf(name)
    if (index === -1) {
      throw new Error(`Savepoint ${name} not found`)
    }

    try {
      await this.executeWithRetry(() => {
        this.db.exec(`RELEASE SAVEPOINT ${name}`)
        this.savepoints.splice(index, 1)
      })
    } catch (error) {
      throw new Error(`Failed to release savepoint ${name}: ${error}`)
    }
  }

  /**
   * 回滚到保存点
   */
  public async rollbackToSavepoint(name: string): Promise<void> {
    if (this.state !== TransactionState.ACTIVE) {
      throw new Error('No active transaction')
    }

    const index = this.savepoints.indexOf(name)
    if (index === -1) {
      throw new Error(`Savepoint ${name} not found`)
    }

    try {
      await this.executeWithRetry(() => {
        this.db.exec(`ROLLBACK TO SAVEPOINT ${name}`)
        // 移除该保存点之后的所有保存点
        this.savepoints.splice(index)
      })
    } catch (error) {
      throw new Error(`Failed to rollback to savepoint ${name}: ${error}`)
    }
  }

  /**
   * 执行事务操作
   */
  public async execute<T>(
    operation: (db: DatabaseType) => Promise<T>,
    options: {
      maxRetries?: number
      timeout?: number
      isolationLevel?: 'deferred' | 'immediate' | 'exclusive'
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || 3
    const timeout = options.timeout || this.transactionTimeout
    const isolationLevel = options.isolationLevel || 'immediate'

    return RetryMechanism.executeWithRetry(async () => {
      const txManager = new TransactionManager(this.db, timeout)

      try {
        await txManager.beginWithIsolation(isolationLevel)
        const result = await operation(this.db)
        await txManager.commit()
        return result
      } catch (error) {
        await txManager.rollback()
        throw error
      }
    }, { maxRetries })
  }

  /**
   * 使用特定隔离级别开始事务
   */
  private async beginWithIsolation(isolationLevel: string): Promise<void> {
    const sql = `BEGIN ${isolationLevel.toUpperCase()} TRANSACTION`
    await this.executeWithRetry(() => {
      this.db.exec(sql)
      this.state = TransactionState.ACTIVE
      this.startTimeout()
    })
  }

  /**
   * 执行带重试的操作
   */
  private async executeWithRetry(operation: () => void): Promise<void> {
    await RetryMechanism.executeWithRetry(async () => {
      operation()
    })
  }

  /**
   * 开始超时计时器
   */
  private startTimeout(): void {
    this.timeoutTimer = setTimeout(() => {
      if (this.state === TransactionState.ACTIVE) {
        console.warn(`Transaction timeout after ${this.transactionTimeout}ms, rolling back`)
        this.rollback().catch(error => {
          console.error('Failed to rollback timed out transaction:', error)
        })
      }
    }, this.transactionTimeout)
  }

  /**
   * 清除超时计时器
   */
  private clearTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = undefined
    }
  }

  /**
   * 获取事务状态
   */
  public getState(): TransactionState {
    return this.state
  }

  /**
   * 检查事务是否活跃
   */
  public isActive(): boolean {
    return this.state === TransactionState.ACTIVE
  }

  /**
   * 获取保存点列表
   */
  public getSavepoints(): string[] {
    return [...this.savepoints]
  }
}

/**
 * 事务装饰器
 */
export function Transactional(options: {
  maxRetries?: number
  timeout?: number
  isolationLevel?: 'deferred' | 'immediate' | 'exclusive'
} = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const db = this.db || this.getConnection()
      const txManager = new TransactionManager(db)

      return txManager.execute(async (txDb) => {
        // 为事务中的操作提供事务数据库连接
        const context = { ...this, db: txDb }
        return originalMethod.apply(context, args)
      }, options)
    }

    return descriptor
  }
}