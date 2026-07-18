/**
 * IndexedDB 存储后端
 * 为浏览器环境提供更强大的存储能力
 * 支持大规模数据存储和复杂查询
 */

interface IndexedDBConfig {
  dbName: string
  version: number
  stores: Array<{
    name: string
    keyPath: string
    indexes?: Array<{
      name: string
      keyPath: string
      options?: IDBIndexParameters
    }>
  }>
}

export class IndexedDBStorage {
  private db: IDBDatabase | null = null
  private config: IndexedDBConfig
  private initialized: boolean = false

  constructor(config: IndexedDBConfig) {
    this.config = config
  }

  /**
   * 初始化 IndexedDB 数据库
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)

      request.onerror = () => {
        console.error('❌ IndexedDB 打开失败:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        console.log(`✅ IndexedDB 数据库已初始化: ${this.config.dbName}`)
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建对象存储
        this.config.stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
              autoIncrement: true,
            })

            // 创建索引
            store.indexes?.forEach(index => {
              objectStore.createIndex(index.name, index.keyPath, index.options)
              console.log(`📊 创建索引: ${store.name}.${index.name}`)
            })

            console.log(`📁 创建对象存储: ${store.name}`)
          }
        })
      }
    })
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * 获取对象存储
   */
  private getObjectStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('IndexedDB 未初始化')
    }

    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  /**
   * 查询多条记录
   */
  async find(
    table: string,
    query: any = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table)
        const request = objectStore.openCursor()
        const results: any[] = []
        let count = 0
        let skipped = 0

        request.onsuccess = () => {
          const cursor = request.result

          if (cursor) {
            const item = cursor.value

            // 应用查询过滤
            if (this.matchesQuery(item, query)) {
              if (skipped >= offset && count < limit) {
                results.push(item)
                count++
              }
              skipped++
            }

            cursor.continue()
          } else {
            // 应用排序
            if (query.orderBy) {
              this.sortResults(results, query.orderBy)
            }

            resolve(results)
          }
        }

        request.onerror = () => {
          console.error('❌ 查询失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ 查询异常:', error)
        reject(error)
      }
    })
  }

  /**
   * 查询单条记录
   */
  async findOne(table: string, query: any = {}): Promise<any | null> {
    const results = await this.find(table, query, 1)
    return results[0] || null
  }

  /**
   * 插入记录
   */
  async insert(table: string, data: any): Promise<any> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table, 'readwrite')
        const item = {
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const request = objectStore.add(item)

        request.onsuccess = () => {
          const insertedItem = { ...item, id: request.result }
          console.log(`✅ 插入记录成功: ${table}.${request.result}`)
          resolve(insertedItem)
        }

        request.onerror = () => {
          console.error('❌ 插入记录失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ 插入记录异常:', error)
        reject(error)
      }
    })
  }

  /**
   * 更新记录
   */
  async update(table: string, id: number, data: any): Promise<any | null> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table, 'readwrite')
        const getRequest = objectStore.get(id)

        getRequest.onsuccess = () => {
          const existingItem = getRequest.result
          if (!existingItem) {
            resolve(null)
            return
          }

          const updatedItem = {
            ...existingItem,
            ...data,
            updated_at: new Date().toISOString(),
          }

          const putRequest = objectStore.put(updatedItem)

          putRequest.onsuccess = () => {
            console.log(`✅ 更新记录成功: ${table}.${id}`)
            resolve(updatedItem)
          }

          putRequest.onerror = () => {
            console.error('❌ 更新记录失败:', putRequest.error)
            reject(putRequest.error)
          }
        }

        getRequest.onerror = () => {
          console.error('❌ 获取记录失败:', getRequest.error)
          reject(getRequest.error)
        }
      } catch (error) {
        console.error('❌ 更新记录异常:', error)
        reject(error)
      }
    })
  }

  /**
   * 删除记录
   */
  async delete(table: string, id: number): Promise<boolean> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table, 'readwrite')
        const request = objectStore.delete(id)

        request.onsuccess = () => {
          console.log(`✅ 删除记录成功: ${table}.${id}`)
          resolve(true)
        }

        request.onerror = () => {
          console.error('❌ 删除记录失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ 删除记录异常:', error)
        reject(error)
      }
    })
  }

  /**
   * 计算记录数量
   */
  async count(table: string, query: any = {}): Promise<number> {
    const results = await this.find(table, query)
    return results.length
  }

  /**
   * 使用索引查询
   */
  async findByIndex(table: string, indexName: string, value: any): Promise<any[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table)
        const index = objectStore.index(indexName)
        const request = index.openCursor(IDBKeyRange.only(value))
        const results: any[] = []

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor) {
            results.push(cursor.value)
            cursor.continue()
          } else {
            resolve(results)
          }
        }

        request.onerror = () => {
          console.error('❌ 索引查询失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ 索引查询异常:', error)
        reject(error)
      }
    })
  }

  /**
   * 批量插入
   */
  async bulkInsert(table: string, items: any[]): Promise<void> {
    await this.ensureInitialized()

    if (items.length === 0) return

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table, 'readwrite')
        let completed = 0
        let hasError = false

        items.forEach((item, index) => {
          const itemWithTimestamps = {
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const request = objectStore.add(itemWithTimestamps)

          request.onsuccess = () => {
            completed++
            if (completed === items.length && !hasError) {
              console.log(`✅ 批量插入完成: ${table} (${items.length} 条记录)`)
              resolve()
            }
          }

          request.onerror = () => {
            if (!hasError) {
              hasError = true
              console.error('❌ 批量插入失败:', request.error)
              reject(request.error)
            }
          }
        })
      } catch (error) {
        console.error('❌ 批量插入异常:', error)
        reject(error)
      }
    })
  }

  /**
   * 清空表
   */
  async clear(table: string): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore(table, 'readwrite')
        const request = objectStore.clear()

        request.onsuccess = () => {
          console.log(`✅ 清空表成功: ${table}`)
          resolve()
        }

        request.onerror = () => {
          console.error('❌ 清空表失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('❌ 清空表异常:', error)
        reject(error)
      }
    })
  }

  /** Replace several stores in one IndexedDB transaction. */
  async replaceAll(records: Record<string, any[]>): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('IndexedDB 未初始化')

    const storeNames = Object.keys(records)
    if (storeNames.length === 0) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite')
      let settled = false

      const fail = (error: unknown) => {
        if (!settled) {
          settled = true
          reject(error)
        }
      }

      transaction.oncomplete = () => {
        if (!settled) {
          settled = true
          resolve()
        }
      }
      transaction.onerror = () => fail(transaction.error || new Error('IndexedDB 导入失败'))
      transaction.onabort = () => fail(transaction.error || new Error('IndexedDB 导入已取消'))

      for (const storeName of storeNames) {
        const store = transaction.objectStore(storeName)
        store.clear()
        for (const record of records[storeName]) {
          store.put(record)
        }
      }
    })
  }

  /**
   * 删除数据库
   */
  async deleteDatabase(): Promise<void> {
    if (this.db) {
      this.db.close()
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.config.dbName)

      request.onsuccess = () => {
        console.log(`✅ 删除数据库成功: ${this.config.dbName}`)
        this.db = null
        this.initialized = false
        resolve()
      }

      request.onerror = () => {
        console.error('❌ 删除数据库失败:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 检查是否匹配查询条件
   */
  private matchesQuery(item: any, query: any): boolean {
    if (!query.where) return true

    return Object.entries(query.where).every(([key, value]) => {
      if (typeof value === 'string' && value.includes('%')) {
        const pattern = value.replace(/%/g, '')
        return item[key] && item[key].includes(pattern)
      }
      return item[key] === value
    })
  }

  /**
   * 排序结果
   */
  private sortResults(results: any[], orderBy: string): void {
    const [field, direction] = orderBy.split(' ')
    results.sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      return direction === 'DESC' ? -comparison : comparison
    })
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<{ [key: string]: number }> {
    await this.ensureInitialized()
    const stats: { [key: string]: number } = {}

    for (const storeName of this.config.stores) {
      stats[storeName.name] = await this.count(storeName.name)
    }

    return stats
  }
}
