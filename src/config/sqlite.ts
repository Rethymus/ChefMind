// 动态导入 Node.js 模块，避免在浏览器环境中加载
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node

let Database: any
let path: any
let fs: any
let readFileSync: any

// 定义数据库类型
type DatabaseType = any

if (isNode) {
  Database = require('better-sqlite3').default
  path = require('path')
  fs = require('fs')
  readFileSync = fs.readFileSync
}

// 导入新的数据库工具
let ConnectionPool: any, TransactionManager: any, DatabaseHealthChecker: any, RetryMechanism: any

if (isNode) {
  ConnectionPool = require('@/services/database/connectionPool').ConnectionPool
  TransactionManager = require('@/services/database/transactionManager').TransactionManager
  DatabaseHealthChecker = require('@/services/database/healthChecker').DatabaseHealthChecker
  RetryMechanism = require('@/services/database/retryMechanism').RetryMechanism
}

/**
 * SQLite 数据库配置类
 * 提供本地 SQLite 数据库连接和基本操作
 */
export class SQLiteConfig {
  private static instance: SQLiteConfig
  private db: DatabaseType | null = null
  private dbPath: string
  private connectionPool: any
  private healthChecker: any
  private useConnectionPool: boolean

  private constructor() {
    if (!isNode) {
      throw new Error('SQLite is only available in Node.js environment')
    }

    // 确定数据库路径
    const dbPathFromEnv = process.env.DATABASE_PATH || import.meta.env.DATABASE_PATH

    if (dbPathFromEnv) {
      // 如果是相对路径，基于项目根目录
      this.dbPath = path.isAbsolute(dbPathFromEnv)
        ? dbPathFromEnv
        : path.resolve(process.cwd(), dbPathFromEnv)
    } else {
      // 默认路径：项目根目录下的 data 文件夹
      this.dbPath = path.resolve(process.cwd(), 'data', 'chefmind.db')
    }

    // 确保数据目录存在
    const dataDir = path.dirname(this.dbPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // 配置选项
    this.useConnectionPool = process.env.USE_CONNECTION_POOL !== 'false'
  }

  /**
   * 获取数据库实例
   */
  public static getInstance(): SQLiteConfig {
    if (!SQLiteConfig.instance) {
      SQLiteConfig.instance = new SQLiteConfig()
    }
    return SQLiteConfig.instance
  }

  /**
   * 连接到数据库
   */
  public async connect(): Promise<DatabaseType> {
    if (this.db) {
      return this.db
    }

    try {
      // 创建数据库连接
      this.db = new Database(this.dbPath, {
        fileMustExist: false, // 允许创建新数据库
        timeout: 10000, // 10秒超时
      })

      // 配置数据库设置
      await this.configureDatabase()

      // 初始化连接池
      if (this.useConnectionPool && ConnectionPool) {
        this.connectionPool = ConnectionPool.getInstance(this.dbPath, 5)
      }

      // 初始化健康检查器
      if (DatabaseHealthChecker) {
        this.healthChecker = new DatabaseHealthChecker(this.db)
        this.healthChecker.startPeriodicCheck()
      }

      return this.db
    } catch (error) {
      console.error('❌ Failed to connect to SQLite database:', error)
      throw error
    }
  }

  /**
   * 配置数据库设置
   */
  private async configureDatabase(): Promise<void> {
    if (!this.db) return

    try {
      // 启用外键约束
      this.db.pragma('foreign_keys = ON')

      // 启用 WAL 模式（提高并发性能）
      if (process.env.SQLITE_ENABLE_WAL !== 'false') {
        await this.executeWithRetry(() => {
          this.db.pragma('journal_mode = WAL')
        })
      }

      // 设置繁忙超时
      const busyTimeout = parseInt(process.env.SQLITE_BUSY_TIMEOUT || '10000')
      this.db.pragma(`busy_timeout = ${busyTimeout}`)

      // 优化性能设置
      this.db.pragma('synchronous = NORMAL')
      this.db.pragma('cache_size = -20000') // 20MB cache
      this.db.pragma('temp_store = MEMORY')
      this.db.pragma('mmap_size = 268435456') // 256MB mmap

      // 设置其他优化参数
      this.db.pragma('locking_mode = NORMAL')
      this.db.pragma('auto_vacuum = INCREMENTAL')

    } catch (error) {
      console.error('Failed to configure database:', error)
      throw error
    }
  }

  /**
   * 获取数据库连接
   */
  public async getConnection(): Promise<DatabaseType> {
    if (!this.db) {
      await this.connect()
    }

    // 如果启用了连接池，使用连接池
    if (this.useConnectionPool && this.connectionPool) {
      return this.connectionPool.getConnection()
    }

    return this.db
  }

  /**
   * 释放数据库连接（用于连接池）
   */
  public async releaseConnection(connection: DatabaseType): Promise<void> {
    if (this.useConnectionPool && this.connectionPool) {
      this.connectionPool.releaseConnection(connection)
    }
  }

  /**
   * 关闭数据库连接
   */
  public disconnect(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * 执行查询（INSERT, UPDATE, DELETE）
   */
  public async execute(query: string, params: any[] = []): Promise<any> {
    const db = await this.getConnection()
    try {
      return await this.executeWithRetry(() => {
        const stmt = db.prepare(query)
        return stmt.run(...params)
      })
    } catch (error) {
      console.error('❌ Query execution failed:', error)
      throw error
    } finally {
      await this.releaseConnection(db)
    }
  }

  /**
   * 查询多条记录
   */
  public async query(query: string, params: any[] = []): Promise<any[]> {
    const db = await this.getConnection()
    try {
      return await this.executeWithRetry(() => {
        const stmt = db.prepare(query)
        return stmt.all(...params)
      })
    } catch (error) {
      console.error('❌ Query failed:', error)
      throw error
    } finally {
      await this.releaseConnection(db)
    }
  }

  /**
   * 查询单条记录
   */
  public async queryOne(query: string, params: any[] = []): Promise<any | undefined> {
    const db = await this.getConnection()
    try {
      return await this.executeWithRetry(() => {
        const stmt = db.prepare(query)
        return stmt.get(...params)
      })
    } catch (error) {
      console.error('❌ Query failed:', error)
      throw error
    } finally {
      await this.releaseConnection(db)
    }
  }

  /**
   * 检查表是否存在
   */
  public tableExists(tableName: string): boolean {
    const result = this.queryOne(
      `SELECT name FROM sqlite_master 
       WHERE type='table' AND name=?`,
      [tableName]
    )
    return !!result
  }

  /**
   * 开始事务
   */
  private async beginTransaction(db: DatabaseType): Promise<void> {
    await this.executeWithRetry(() => {
      db.exec('BEGIN IMMEDIATE TRANSACTION')
    })
  }

  /**
   * 提交事务
   */
  private async commit(db: DatabaseType): Promise<void> {
    await this.executeWithRetry(() => {
      db.exec('COMMIT')
    })
  }

  /**
   * 回滚事务
   */
  private async rollback(db: DatabaseType): Promise<void> {
    await this.executeWithRetry(() => {
      db.exec('ROLLBACK')
    })
  }

  /**
   * 执行事务
   */
  public async transaction<T>(callback: (db: DatabaseType) => Promise<T> | T): Promise<T> {
    const db = await this.getConnection()

    try {
      return await this.executeWithRetry(async () => {
        return await this.executeTransaction(db, callback)
      })
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    } finally {
      await this.releaseConnection(db)
    }
  }

  /**
   * 执行事务操作
   */
  private async executeTransaction<T>(db: DatabaseType, callback: (db: DatabaseType) => Promise<T> | T): Promise<T> {
    try {
      await this.beginTransaction(db)
      const result = await callback(db)
      await this.commit(db)
      return result
    } catch (error) {
      await this.rollback(db)
      throw error
    }
  }

  /**
   * 获取数据库状态
   */
  public getStatus(): {
    connected: boolean
    path: string
    size: number
    tableCount: number
    version: string
  } {
    if (!isNode) {
      return {
        connected: false,
        path: '',
        size: 0,
        tableCount: 0,
        version: '1',
      }
    }

    const stats = readFileSync(this.dbPath)
    const tables = this.query(`SELECT name FROM sqlite_master WHERE type='table'`)
    const version = this.queryOne('PRAGMA user_version')?.user_version || 1

    return {
      connected: this.db !== null,
      path: this.dbPath,
      size: stats.byteLength,
      tableCount: tables.length,
      version,
    }
  }

  /**
   * 获取表信息
   */
  public getTableInfo(tableName: string): any {
    return this.query(`PRAGMA table_info(${tableName})`)
  }

  /**
   * 获取表索引信息
   */
  public getIndexInfo(tableName: string): any {
    return this.query(`PRAGMA index_list(${tableName})`)
  }

  /**
   * 创建索引
   */
  public createIndex(tableName: string, columns: string[], indexName?: string): void {
    const name = indexName || `idx_${tableName}_${columns.join('_')}`
    const query = `CREATE INDEX IF NOT EXISTS ${name} ON ${tableName}(${columns.join(', ')})`
    this.execute(query)
  }

  /**
   * 备份数据库
   */
  public backup(backupPath: string): void {
    const db = this.getConnection()
    const backupDb = new Database(backupPath)

    try {
      db.exec(`ATTACH DATABASE '${this.dbPath}' AS source`)
      backupDb.exec('BEGIN TRANSACTION')

      // 备份所有表
      const tables = this.query(`SELECT name FROM sqlite_master WHERE type='table'`)
      for (const table of tables) {
        backupDb.exec(`CREATE TABLE ${table.name} AS SELECT * FROM source.${table.name}`)
      }

      backupDb.exec('COMMIT')
      backupDb.exec('DETACH DATABASE source')
    } catch (error) {
      backupDb.exec('ROLLBACK')
      backupDb.exec('DETACH DATABASE source')
      throw error
    } finally {
      backupDb.close()
    }
  }

  /**
   * 优化数据库
   */
  public optimize(): void {
    const db = this.getConnection()
    db.exec('VACUUM')
    db.exec('ANALYZE')
  }

  /**
   * 获取数据库统计信息
   */
  public async getStats(): Promise<any> {
    const db = await this.getConnection()
    try {
      return await this.executeWithRetry(() => ({
        pageCount: (db.prepare('PRAGMA page_count').get() as any).page_count,
        pageSize: (db.prepare('PRAGMA page_size').get() as any).page_size,
        freelistCount: (db.prepare('PRAGMA freelist_count').get() as any).freelist_count,
        schemaVersion: (db.prepare('PRAGMA schema_version').get() as any).schema_version,
        integrityCheck: (db.prepare('PRAGMA integrity_check').get() as any)['integrity_check'],
      }))
    } finally {
      await this.releaseConnection(db)
    }
  }

  /**
   * 执行带重试的操作
   */
  private async executeWithRetry<T>(operation: () => T): Promise<T> {
    if (RetryMechanism) {
      return RetryMechanism.executeWithRetry(operation)
    }

    // 如果没有 RetryMechanism，直接执行
    try {
      return operation()
    } catch (error) {
      console.error('Operation failed:', error)
      throw error
    }
  }

  /**
   * 获取健康检查状态
   */
  public async getHealthStatus(): Promise<any> {
    if (this.healthChecker) {
      return this.healthChecker.checkHealth()
    }

    // 基础健康检查
    try {
      await this.query('SELECT 1')
      return {
        isHealthy: true,
        connectionStatus: 'connected',
        message: 'Basic health check passed'
      }
    } catch (error) {
      return {
        isHealthy: false,
        connectionStatus: 'error',
        message: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * 等待数据库就绪
   */
  public async waitForReady(timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const health = await this.getHealthStatus()
        if (health.isHealthy) {
          return true
        }
      } catch (error) {
        // 忽略错误，继续重试
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return false
  }

  /**
   * 获取连接池状态
   */
  public getConnectionPoolStatus(): any {
    if (this.connectionPool) {
      return this.connectionPool.getStatus()
    }
    return {
      enabled: false,
      message: 'Connection pool not enabled'
    }
  }

  /**
   * 优化数据库
   */
  public async optimize(): Promise<void> {
    const db = await this.getConnection()
    try {
      await this.executeWithRetry(() => {
        db.exec('VACUUM')
        db.exec('ANALYZE')
      })
    } finally {
      await this.releaseConnection(db)
    }
  }

  /**
   * 执行批量操作
   */
  public async executeBatch(operations: Array<{ query: string; params?: any[] }>): Promise<any[]> {
    return this.transaction(async (db) => {
      const results = []
      for (const operation of operations) {
        const stmt = db.prepare(operation.query)
        const result = stmt.run(...(operation.params || []))
        results.push(result)
      }
      return results
    })
  }
}

// 创建兼容接口
class SQLiteBrowserFallback {
  private static instance: SQLiteBrowserFallback

  private constructor() {}

  public static getInstance(): SQLiteBrowserFallback {
    if (!SQLiteBrowserFallback.instance) {
      SQLiteBrowserFallback.instance = new SQLiteBrowserFallback()
    }
    return SQLiteBrowserFallback.instance
  }

  // 浏览器环境下的空实现
  public connect(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public getConnection(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public execute(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public query(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public queryOne(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public tableExists(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public beginTransaction(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public commit(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public rollback(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public transaction(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public getStatus() {
    return {
      connected: false,
      path: '',
      size: 0,
      tableCount: 0,
      version: '1',
    }
  }

  public getTableInfo(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public getIndexInfo(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public createIndex(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public backup(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public optimize(): never {
    throw new Error('SQLite is not available in browser environment')
  }

  public getStats(): never {
    throw new Error('SQLite is not available in browser environment')
  }
}

// 导出兼容的实例
export const sqliteConfig = isNode
  ? SQLiteConfig.getInstance()
  : SQLiteBrowserFallback.getInstance()
export default sqliteConfig
