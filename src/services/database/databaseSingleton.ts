import { sqliteConfig } from '@/config/sqlite'
import { databaseInitializer } from '@/utils/sqliteInitializer'
import type { DatabaseType } from '@/config/sqlite'

/**
 * 全局单例数据库管理器
 * 提供统一的 SQLite 数据库读写接口
 */
export class DatabaseSingleton {
  private static instance: DatabaseSingleton
  private db: DatabaseType | null = null
  private initialized: boolean = false

  private constructor() {}

  /**
   * 获取数据库单例实例
   */
  public static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton()
    }
    return DatabaseSingleton.instance
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      await databaseInitializer.initialize()
      this.db = sqliteConfig.getConnection()
      this.initialized = true
      console.log('✅ Database initialized successfully')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  /**
   * 获取数据库连接
   */
  public getConnection(): DatabaseType {
    if (!this.initialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
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
   * 执行事务操作
   */
  public transaction<T>(callback: (db: DatabaseType) => T): T {
    try {
      this.beginTransaction()
      const result = callback(this.getConnection())
      this.commit()
      return result
    } catch (error) {
      this.rollback()
      throw error
    }
  }

  /**
   * 插入数据
   */
  public insert(table: string, data: Record<string, any>): any {
    const columns = Object.keys(data).join(', ')
    const placeholders = Object.keys(data).map(() => '?').join(', ')
    const values = Object.values(data)
    
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    return this.execute(query, values)
  }

  /**
   * 更新数据
   */
  public update(table: string, data: Record<string, any>, where: Record<string, any>): any {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
    const values = [...Object.values(data), ...Object.values(where)]
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
    return this.execute(query, values)
  }

  /**
   * 删除数据
   */
  public delete(table: string, where: Record<string, any>): any {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
    const values = Object.values(where)
    
    const query = `DELETE FROM ${table} WHERE ${whereClause}`
    return this.execute(query, values)
  }

  /**
   * 选择数据
   */
  public select(table: string, where?: Record<string, any>, columns: string[] = ['*']): any[] {
    const selectClause = columns.join(', ')
    let query = `SELECT ${selectClause} FROM ${table}`
    let values: any[] = []
    
    if (where && Object.keys(where).length > 0) {
      const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
      query += ` WHERE ${whereClause}`
      values = Object.values(where)
    }
    
    return this.query(query, values)
  }

  /**
   * 选择单条数据
   */
  public selectOne(table: string, where?: Record<string, any>, columns: string[] = ['*']): any | undefined {
    const selectClause = columns.join(', ')
    let query = `SELECT ${selectClause} FROM ${table}`
    let values: any[] = []
    
    if (where && Object.keys(where).length > 0) {
      const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
      query += ` WHERE ${whereClause}`
      values = Object.values(where)
    }
    
    return this.queryOne(query, values)
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
   * 获取表结构信息
   */
  public getTableInfo(tableName: string): any[] {
    return this.query(`PRAGMA table_info(${tableName})`)
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
    return sqliteConfig.getStatus()
  }

  /**
   * 关闭数据库连接
   */
  public close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initialized = false
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
   * 备份数据库
   */
  public backup(backupPath: string): void {
    sqliteConfig.backup(backupPath)
  }

  /**
   * 清理过期数据
   */
  public cleanup(): void {
    databaseInitializer.cleanup()
  }
}

// 导出全局单例实例
export const databaseSingleton = DatabaseSingleton.getInstance()
export default databaseSingleton