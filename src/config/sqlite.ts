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

/**
 * SQLite 数据库配置类
 * 提供本地 SQLite 数据库连接和基本操作
 */
export class SQLiteConfig {
  private static instance: SQLiteConfig
  private db: DatabaseType | null = null
  private dbPath: string

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
  public connect(): DatabaseType {
    if (this.db) {
      return this.db
    }

    try {
      console.log(`🔌 Connecting to SQLite database: ${this.dbPath}`)
      
      // 创建数据库连接
      this.db = new Database(this.dbPath, {
        fileMustExist: false, // 允许创建新数据库
        timeout: 5000, // 5秒超时
        verbose: process.env.SQLITE_DEBUG === 'true' ? console.log : undefined
      })

      // 配置数据库设置
      this.configureDatabase()

      console.log('✅ SQLite database connected successfully')
      return this.db
    } catch (error) {
      console.error('❌ Failed to connect to SQLite database:', error)
      throw error
    }
  }

  /**
   * 配置数据库设置
   */
  private configureDatabase(): void {
    if (!this.db) return

    // 启用外键约束
    this.db.pragma('foreign_keys = ON')

    // 启用 WAL 模式（提高并发性能）
    if (process.env.SQLITE_ENABLE_WAL !== 'false') {
      this.db.pragma('journal_mode = WAL')
    }

    // 设置繁忙超时
    const busyTimeout = parseInt(process.env.SQLITE_BUSY_TIMEOUT || '5000')
    this.db.pragma(`busy_timeout = ${busyTimeout}`)

    // 优化性能设置
    this.db.pragma('synchronous = NORMAL')
    this.db.pragma('cache_size = -10000') // 10MB cache
    this.db.pragma('temp_store = MEMORY')

    console.log('🔧 SQLite database configured with optimal settings')
  }

  /**
   * 获取数据库连接
   */
  public getConnection(): DatabaseType {
    if (!this.db) {
      return this.connect()
    }
    return this.db
  }

  /**
   * 关闭数据库连接
   */
  public disconnect(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('🔌 SQLite database connection closed')
    }
  }

  /**
   * 执行查询（INSERT, UPDATE, DELETE）
   */
  public execute(query: string, params: any[] = []): any {
    const db = this.getConnection()
    try {
      const stmt = db.prepare(query)
      return stmt.run(...params)
    } catch (error) {
      console.error('❌ Query execution failed:', error)
      throw error
    }
  }

  /**
   * 查询多条记录
   */
  public query(query: string, params: any[] = []): any[] {
    const db = this.getConnection()
    try {
      const stmt = db.prepare(query)
      return stmt.all(...params)
    } catch (error) {
      console.error('❌ Query failed:', error)
      throw error
    }
  }

  /**
   * 查询单条记录
   */
  public queryOne(query: string, params: any[] = []): any | undefined {
    const db = this.getConnection()
    try {
      const stmt = db.prepare(query)
      return stmt.get(...params)
    } catch (error) {
      console.error('❌ Query failed:', error)
      throw error
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
  public beginTransaction(): void {
    this.execute('BEGIN TRANSACTION')
  }

  /**
   * 提交事务
   */
  public commit(): void {
    this.execute('COMMIT')
  }

  /**
   * 回滚事务
   */
  public rollback(): void {
    this.execute('ROLLBACK')
  }

  /**
   * 执行事务
   */
  public transaction<T>(callback: (db: DatabaseType) => T): T {
    const db = this.getConnection()
    try {
      this.beginTransaction()
      const result = callback(db)
      this.commit()
      return result
    } catch (error) {
      this.rollback()
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
        version: '1'
      }
    }
    
    const stats = readFileSync(this.dbPath)
    const tables = this.query(
      `SELECT name FROM sqlite_master WHERE type='table'`
    )
    const version = this.queryOne('PRAGMA user_version')?.user_version || 1

    return {
      connected: this.db !== null,
      path: this.dbPath,
      size: stats.byteLength,
      tableCount: tables.length,
      version
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
    console.log(`✅ Created index: ${name}`)
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
      
      console.log(`✅ Database backed up to: ${backupPath}`)
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
    console.log('✅ Database optimized')
  }

  /**
   * 获取数据库统计信息
   */
  public getStats(): any {
    const db = this.getConnection()
    return {
      pageCount: (db.prepare('PRAGMA page_count').get() as any).page_count,
      pageSize: (db.prepare('PRAGMA page_size').get() as any).page_size,
      freelistCount: (db.prepare('PRAGMA freelist_count').get() as any).freelist_count,
      schemaVersion: (db.prepare('PRAGMA schema_version').get() as any).schema_version,
      integrityCheck: (db.prepare('PRAGMA integrity_check').get() as any)['integrity_check']
    }
  }
}

// 创建兼容接口
class SQLiteBrowserFallback {
  private static instance: SQLiteBrowserFallback
  
  private constructor() {
    console.log('🌐 Running in browser environment - SQLite operations disabled')
  }
  
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
      version: '1'
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
export const sqliteConfig = isNode ? SQLiteConfig.getInstance() : SQLiteBrowserFallback.getInstance()
export default sqliteConfig