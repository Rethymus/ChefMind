import type { DatabaseType } from '@/config/sqlite'

/**
 * 数据库连接池
 * 提供连接复用和并发访问管理
 */
export class ConnectionPool {
  private static instance: ConnectionPool
  private connections: DatabaseType[] = []
  private available: boolean[] = []
  private maxConnections: number
  private dbPath: string
  private Database: any

  private constructor(dbPath: string, maxConnections: number = 5) {
    this.dbPath = dbPath
    this.maxConnections = maxConnections
    this.Database = require('better-sqlite3').default
    this.initializePool()
  }

  /**
   * 获取连接池实例
   */
  public static getInstance(dbPath: string, maxConnections: number = 5): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(dbPath, maxConnections)
    }
    return ConnectionPool.instance
  }

  /**
   * 初始化连接池
   */
  private initializePool(): void {
    for (let i = 0; i < this.maxConnections; i++) {
      try {
        const connection = this.createConnection()
        this.connections.push(connection)
        this.available.push(true)
      } catch (error) {
        console.error(`Failed to create connection ${i}:`, error)
      }
    }
  }

  /**
   * 创建新连接
   */
  private createConnection(): DatabaseType {
    const db = new this.Database(this.dbPath, {
      fileMustExist: false,
      timeout: 10000, // 10秒超时
    })

    // 配置数据库设置
    this.configureConnection(db)

    return db
  }

  /**
   * 配置连接设置
   */
  private configureConnection(db: DatabaseType): void {
    // 启用外键约束
    db.pragma('foreign_keys = ON')

    // 启用 WAL 模式（提高并发性能）
    db.pragma('journal_mode = WAL')

    // 设置繁忙超时
    db.pragma('busy_timeout = 10000')

    // 优化性能设置
    db.pragma('synchronous = NORMAL')
    db.pragma('cache_size = -20000') // 20MB cache
    db.pragma('temp_store = MEMORY')
    db.pragma('mmap_size = 268435456') // 256MB mmap
  }

  /**
   * 获取可用连接
   */
  public async getConnection(): Promise<DatabaseType> {
    // 查找可用连接
    for (let i = 0; i < this.connections.length; i++) {
      if (this.available[i]) {
        this.available[i] = false
        // 检查连接是否仍然有效
        if (this.isConnectionValid(this.connections[i])) {
          return this.connections[i]
        } else {
          // 重新创建无效连接
          this.connections[i] = this.createConnection()
          return this.connections[i]
        }
      }
    }

    // 如果没有可用连接，等待并重试
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.getConnection()
  }

  /**
   * 释放连接回池
   */
  public releaseConnection(connection: DatabaseType): void {
    const index = this.connections.indexOf(connection)
    if (index !== -1) {
      this.available[index] = true
    }
  }

  /**
   * 检查连接是否有效
   */
  private isConnectionValid(connection: DatabaseType): boolean {
    try {
      connection.prepare('SELECT 1').get()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 关闭所有连接
   */
  public closeAll(): void {
    for (let i = 0; i < this.connections.length; i++) {
      try {
        this.connections[i].close()
      } catch (error) {
        console.error(`Error closing connection ${i}:`, error)
      }
    }
    this.connections = []
    this.available = []
  }

  /**
   * 获取连接池状态
   */
  public getStatus(): {
    totalConnections: number
    availableConnections: number
    activeConnections: number
  } {
    const available = this.available.filter(avail => avail).length
    return {
      totalConnections: this.connections.length,
      availableConnections: available,
      activeConnections: this.connections.length - available,
    }
  }
}