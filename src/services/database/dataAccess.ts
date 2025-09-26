/**
 * 通用数据访问层
 * 支持浏览器环境和 Node.js 环境
 */

import { IndexedDBStorage } from './indexedDBStorage'

// 环境检测
const isNode =
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node &&
  typeof window === 'undefined'

// 检测 IndexedDB 支持情况
const supportsIndexedDB = typeof indexedDB !== 'undefined' && typeof IDBKeyRange !== 'undefined'

// 浏览器环境下的内存存储
class MemoryStorage {
  private data: Map<string, any[]> = new Map()
  private counters: Map<string, number> = new Map()

  async find(
    table: string,
    query: any = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const items = this.data.get(table) || []
    let filtered = items

    // 简单的查询过滤
    if (query.where) {
      filtered = items.filter(item => {
        return Object.entries(query.where).every(([key, value]) => {
          if (typeof value === 'string' && value.includes('%')) {
            return item[key] && item[key].includes(value.replace(/%/g, ''))
          }
          return item[key] === value
        })
      })
    }

    // 排序
    if (query.orderBy) {
      filtered.sort((a, b) => {
        const [field, direction] = query.orderBy.split(' ')
        const aValue = a[field]
        const bValue = b[field]
        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        return direction === 'DESC' ? -comparison : comparison
      })
    }

    // 分页
    return filtered.slice(offset, offset + limit)
  }

  async findOne(table: string, query: any = {}): Promise<any | null> {
    const results = await this.find(table, query, 1)
    return results[0] || null
  }

  async insert(table: string, data: any): Promise<any> {
    const items = this.data.get(table) || []
    const counter = this.counters.get(table) || 1

    const newItem = {
      id: counter,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    items.push(newItem)
    this.data.set(table, items)
    this.counters.set(table, counter + 1)

    return newItem
  }

  async update(table: string, id: number, data: any): Promise<any | null> {
    const items = this.data.get(table) || []
    const index = items.findIndex(item => item.id === id)

    if (index === -1) return null

    items[index] = {
      ...items[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    this.data.set(table, items)
    return items[index]
  }

  async delete(table: string, id: number): Promise<boolean> {
    const items = this.data.get(table) || []
    const index = items.findIndex(item => item.id === id)

    if (index === -1) return false

    items.splice(index, 1)
    this.data.set(table, items)
    return true
  }

  async count(table: string, query: any = {}): Promise<number> {
    const results = await this.find(table, query)
    return results.length
  }

  // 初始化示例数据
  initializeSampleData() {
    // 示例食谱数据
    const sampleRecipes = [
      {
        id: 1,
        title: '番茄炒蛋',
        description: '经典的家常菜，简单易做，营养丰富',
        ingredients: '["鸡蛋 3个", "番茄 2个", "盐 适量", "糖 适量", "葱花 适量"]',
        instructions:
          '["将番茄洗净切块", "鸡蛋打散加少许盐", "热锅放油炒蛋", "加入番茄块翻炒", "调味即可出锅"]',
        cooking_time: 15,
        difficulty: '简单',
        servings: 2,
        category: '家常菜',
        tags: '["快手菜", "营养", "家常"]',
        nutrition_info: '{"calories": 180, "protein": 12, "carbs": 8, "fat": 10}',
        image_url: '',
        view_count: 0,
        favorite_count: 0,
        rating_count: 0,
        average_rating: 0,
        cooking_methods: '["炒"]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: '青椒肉丝',
        description: '色香味俱全的经典川菜',
        ingredients: '["猪肉 200g", "青椒 3个", "生抽 适量", "料酒 适量", "淀粉 适量"]',
        instructions:
          '["猪肉切丝用淀粉腌制", "青椒切丝", "热锅炒肉丝", "加入青椒丝翻炒", "调味即可"]',
        cooking_time: 20,
        difficulty: '中等',
        servings: 2,
        category: '川菜',
        tags: '["下饭菜", "肉类", "蔬菜"]',
        nutrition_info: '{"calories": 220, "protein": 18, "carbs": 12, "fat": 12}',
        image_url: '',
        view_count: 0,
        favorite_count: 0,
        rating_count: 0,
        average_rating: 0,
        cooking_methods: '["炒"]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    this.data.set('recipes', sampleRecipes)
    this.counters.set('recipes', sampleRecipes.length + 1)

    // 示例收藏数据
    const sampleFavorites = [
      {
        id: 1,
        session_id: 'browser-session-1',
        recipe_id: 1,
        recipe_title: '番茄炒蛋',
        recipe_image: '',
        created_at: new Date().toISOString(),
      },
    ]

    this.data.set('favorites', sampleFavorites)
    this.counters.set('favorites', sampleFavorites.length + 1)
  }
}

// SQLite 数据访问层 (Node.js 环境)
class SQLiteDataAccess {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  async find(
    table: string,
    query: any = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    let sql = `SELECT * FROM ${table}`
    const params: any[] = []

    // WHERE 条件
    if (query.where) {
      const conditions = Object.entries(query.where).map(([key, value]) => {
        if (typeof value === 'string' && value.includes('%')) {
          params.push(value.replace(/%/g, ''))
          return `${key} LIKE ?`
        }
        params.push(value)
        return `${key} = ?`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    // ORDER BY
    if (query.orderBy) {
      sql += ` ORDER BY ${query.orderBy}`
    }

    // LIMIT 和 OFFSET
    sql += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    return this.db.query(sql, params)
  }

  async findOne(table: string, query: any = {}): Promise<any | null> {
    const results = await this.find(table, query, 1)
    return results[0] || null
  }

  async insert(table: string, data: any): Promise<any> {
    const keys = Object.keys(data)
    const placeholders = keys.map(() => '?').join(', ')
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`

    const result = this.db.execute(sql, Object.values(data))
    return this.findOne(table, { where: { id: result.lastInsertRowid } })
  }

  async update(table: string, id: number, data: any): Promise<any | null> {
    const keys = Object.keys(data)
    const setClause = keys.map(key => `${key} = ?`).join(', ')
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`

    this.db.execute(sql, [...Object.values(data), id])
    return this.findOne(table, { where: { id } })
  }

  async delete(table: string, id: number): Promise<boolean> {
    const sql = `DELETE FROM ${table} WHERE id = ?`
    const result = this.db.execute(sql, [id])
    return (result.changes || 0) > 0
  }

  async count(table: string, query: any = {}): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`
    const params: any[] = []

    if (query.where) {
      const conditions = Object.entries(query.where).map(([key, value]) => {
        if (typeof value === 'string' && value.includes('%')) {
          params.push(value.replace(/%/g, ''))
          return `${key} LIKE ?`
        }
        params.push(value)
        return `${key} = ?`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    const result = this.db.queryOne(sql, params)
    return result.count
  }

  // 原始 SQL 查询方法
  async rawQuery(sql: string, params: any[] = []): Promise<any[]> {
    return this.db.query(sql, params)
  }

  async rawQueryOne(sql: string, params: any[] = []): Promise<any | null> {
    return this.db.queryOne(sql, params)
  }
}

// 通用数据访问层
export class UniversalDataAccess {
  private static instance: UniversalDataAccess
  private storage: MemoryStorage | SQLiteDataAccess | IndexedDBStorage

  private constructor() {
    if (isNode) {
      try {
        // Node.js 环境：尝试使用 SQLite
        const { default: SQLiteConfig } = require('@/config/sqlite')
        const sqliteConfig = SQLiteConfig.getInstance()
        this.storage = new SQLiteDataAccess(sqliteConfig.getConnection())
        console.log('🗄️ 使用 SQLite 数据存储')
      } catch (error) {
        console.warn('⚠️ SQLite 初始化失败，使用内存存储:', error)
        this.storage = new MemoryStorage()
        ;(this.storage as MemoryStorage).initializeSampleData()
        console.log('🧠 使用内存存储')
      }
    } else {
      // 浏览器环境：优先尝试 IndexedDB，否则使用内存存储
      if (supportsIndexedDB) {
        try {
          const indexedDBConfig = {
            dbName: 'ChefMindDB',
            version: 1,
            stores: [
              {
                name: 'recipes',
                keyPath: 'id',
                indexes: [
                  { name: 'title', keyPath: 'title', options: { unique: false } },
                  { name: 'category', keyPath: 'category', options: { unique: false } },
                  { name: 'created_at', keyPath: 'created_at', options: { unique: false } },
                ],
              },
              {
                name: 'favorites',
                keyPath: 'id',
                indexes: [
                  { name: 'session_id', keyPath: 'session_id', options: { unique: false } },
                  { name: 'recipe_id', keyPath: 'recipe_id', options: { unique: false } },
                  { name: 'created_at', keyPath: 'created_at', options: { unique: false } },
                ],
              },
              {
                name: 'users',
                keyPath: 'id',
                indexes: [
                  { name: 'session_id', keyPath: 'session_id', options: { unique: true } },
                  { name: 'email', keyPath: 'email', options: { unique: false } },
                  { name: 'created_at', keyPath: 'created_at', options: { unique: false } },
                ],
              },
              {
                name: 'search_history',
                keyPath: 'id',
                indexes: [
                  { name: 'session_id', keyPath: 'session_id', options: { unique: false } },
                  { name: 'query', keyPath: 'query', options: { unique: false } },
                  { name: 'created_at', keyPath: 'created_at', options: { unique: false } },
                ],
              },
              {
                name: 'settings',
                keyPath: 'id',
                indexes: [
                  { name: 'key', keyPath: 'key', options: { unique: true } },
                  { name: 'category', keyPath: 'category', options: { unique: false } },
                ],
              },
            ],
          }

          this.storage = new IndexedDBStorage(indexedDBConfig)
          console.log('🗄️ 使用 IndexedDB 数据存储')
        } catch (error) {
          console.warn('⚠️ IndexedDB 初始化失败，使用内存存储:', error)
          this.storage = new MemoryStorage()
          ;(this.storage as MemoryStorage).initializeSampleData()
          console.log('🧠 使用内存存储')
        }
      } else {
        // 浏览器环境不支持 IndexedDB，使用内存存储
        this.storage = new MemoryStorage()
        ;(this.storage as MemoryStorage).initializeSampleData()
        console.log('🌐 检测到浏览器环境，IndexedDB 不可用，使用内存存储')
      }
    }
  }

  public static getInstance(): UniversalDataAccess {
    if (!UniversalDataAccess.instance) {
      UniversalDataAccess.instance = new UniversalDataAccess()
    }
    return UniversalDataAccess.instance
  }

  async find(
    table: string,
    query: any = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return this.storage.find(table, query, limit, offset)
  }

  async findOne(table: string, query: any = {}): Promise<any | null> {
    return this.storage.findOne(table, query)
  }

  async insert(table: string, data: any): Promise<any> {
    return this.storage.insert(table, data)
  }

  async update(table: string, id: number, data: any): Promise<any | null> {
    return this.storage.update(table, id, data)
  }

  async delete(table: string, id: number): Promise<boolean> {
    return this.storage.delete(table, id)
  }

  async count(table: string, query: any = {}): Promise<number> {
    return this.storage.count(table, query)
  }

  // 原始 SQL 查询方法（用于复杂查询）
  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (this.storage instanceof SQLiteDataAccess) {
      return this.storage.rawQuery(sql, params)
    } else {
      // 内存存储和 IndexedDB 不支持原始 SQL 查询，返回空数组
      console.warn('⚠️ 当前存储后端不支持原始 SQL 查询')
      return []
    }
  }

  async queryOne(sql: string, params: any[] = []): Promise<any | null> {
    if (this.storage instanceof SQLiteDataAccess) {
      return this.storage.rawQueryOne(sql, params)
    } else {
      // 内存存储和 IndexedDB 不支持原始 SQL 查询，返回 null
      console.warn('⚠️ 当前存储后端不支持原始 SQL 查询')
      return null
    }
  }

  // 获取存储后端类型
  getStorageType(): string {
    if (this.storage instanceof SQLiteDataAccess) {
      return 'SQLite'
    } else if (this.storage instanceof IndexedDBStorage) {
      return 'IndexedDB'
    } else {
      return 'Memory'
    }
  }

  // 获取数据库统计信息
  async getStats(): Promise<{ [key: string]: number }> {
    if (this.storage instanceof IndexedDBStorage) {
      return this.storage.getStats()
    } else {
      // 对于其他存储后端，返回基本统计
      const tables = ['recipes', 'favorites', 'users', 'search_history', 'settings']
      const stats: { [key: string]: number } = {}

      for (const table of tables) {
        try {
          stats[table] = await this.count(table)
        } catch (error) {
          stats[table] = 0
        }
      }

      return stats
    }
  }

  // 批量插入数据
  async bulkInsert(table: string, items: any[]): Promise<void> {
    if (this.storage instanceof IndexedDBStorage) {
      return this.storage.bulkInsert(table, items)
    } else {
      // 对于其他存储后端，逐个插入
      for (const item of items) {
        await this.insert(table, item)
      }
    }
  }

  // 清空表
  async clear(table: string): Promise<void> {
    if (this.storage instanceof IndexedDBStorage) {
      return this.storage.clear(table)
    } else {
      // 对于其他存储后端，不支持清空操作
      console.warn('⚠️ 当前存储后端不支持清空表操作')
    }
  }
}

// 导出单例实例
export const dataAccess = UniversalDataAccess.getInstance()
