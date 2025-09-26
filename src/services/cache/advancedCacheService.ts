/**
 * 高级缓存服务
 * 提供智能缓存策略，优化用户体验
 * 支持多级缓存、缓存过期、缓存预热等功能
 */

export interface CacheConfig {
  ttl: number // 缓存时间（毫秒）
  maxSize: number // 最大缓存条目数
  strategy: 'lru' | 'lfu' | 'fifo' // 缓存策略
  enableCompression: boolean // 是否启用压缩
  enablePersistence: boolean // 是否持久化到 localStorage
}

export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  accessCount: number
  lastAccess: number
  size: number
}

export class AdvancedCacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private hits = 0
  private misses = 0
  private evictions = 0

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 默认 5 分钟
      maxSize: config.maxSize || 1000,
      strategy: config.strategy || 'lru',
      enableCompression: config.enableCompression || false,
      enablePersistence: config.enablePersistence || false,
    }

    // 从持久化存储恢复缓存
    if (this.config.enablePersistence) {
      this.loadFromPersistence()
    }

    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 60 * 1000) // 每分钟清理一次
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return null
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key)
      this.evictions++
      this.misses++
      return null
    }

    // 更新访问信息
    entry.accessCount++
    entry.lastAccess = Date.now()
    this.hits++

    // 如果启用了压缩，解压数据
    if (this.config.enableCompression && typeof entry.value === 'string') {
      try {
        return JSON.parse(entry.value)
      } catch {
        return entry.value
      }
    }

    return entry.value
  }

  /**
   * 设置缓存值
   */
  async set<T>(key: string, value: T): Promise<void> {
    const size = this.calculateSize(value)

    // 如果启用了压缩，压缩数据
    let storedValue = value
    if (this.config.enableCompression && typeof value === 'object') {
      try {
        storedValue = JSON.stringify(value)
      } catch (error) {
        console.warn('缓存值压缩失败:', error)
      }
    }

    const entry: CacheEntry<T> = {
      key,
      value: storedValue,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
      size,
    }

    // 检查是否需要清理空间
    if (this.cache.size >= this.config.maxSize) {
      this.evict()
    }

    this.cache.set(key, entry)

    // 持久化到 localStorage
    if (this.config.enablePersistence) {
      this.saveToPersistence()
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)

    if (deleted && this.config.enablePersistence) {
      this.saveToPersistence()
    }

    return deleted
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    this.evictions = 0

    if (this.config.enablePersistence) {
      localStorage.removeItem('chefmind_cache')
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key)
      this.evictions++
      return false
    }

    return true
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: hitRate.toFixed(2) + '%',
      memoryUsage: this.calculateMemoryUsage(),
      oldestEntry: this.getOldestEntryAge(),
      strategy: this.config.strategy,
    }
  }

  /**
   * 预热缓存
   */
  async warmup<T>(data: Array<{ key: string; value: T }>): Promise<void> {
    console.log(`🔥 开始预热缓存，数据量: ${data.length}`)

    const batchSize = 100
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)

      await Promise.all(batch.map(item => this.set(item.key, item.value)))

      // 避免阻塞主线程
      if (i + batchSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    console.log(`✅ 缓存预热完成，当前缓存大小: ${this.cache.size}`)
  }

  /**
   * 获取缓存键列表
   */
  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  /**
   * 根据模式获取缓存键
   */
  async keysByPattern(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  /**
   * 批量获取缓存值
   */
  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>()

    await Promise.all(
      keys.map(async key => {
        result.set(key, await this.get<T>(key))
      })
    )

    return result
  }

  /**
   * 批量设置缓存值
   */
  async mset<T>(data: Map<string, T>): Promise<void> {
    await Promise.all(Array.from(data.entries()).map(([key, value]) => this.set(key, value)))
  }

  /**
   * 缓存清理 - 移除过期条目
   */
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
      this.evictions++
    }

    if (expiredKeys.length > 0) {
      console.log(`🧹 清理过期缓存: ${expiredKeys.length} 个条目`)
    }
  }

  /**
   * 缓存淘汰策略
   */
  private evict(): void {
    if (this.config.strategy === 'lru') {
      this.evictLRU()
    } else if (this.config.strategy === 'lfu') {
      this.evictLFU()
    } else if (this.config.strategy === 'fifo') {
      this.evictFIFO()
    }

    this.evictions++
  }

  /**
   * LRU (Least Recently Used) 淘汰策略
   */
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * LFU (Least Frequently Used) 淘汰策略
   */
  private evictLFU(): void {
    let leastUsedKey = ''
    let leastCount = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  /**
   * FIFO (First In First Out) 淘汰策略
   */
  private evictFIFO(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 计算数据大小
   */
  private calculateSize(value: any): number {
    return JSON.stringify(value).length
  }

  /**
   * 计算内存使用量
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  /**
   * 获取最旧条目的年龄
   */
  private getOldestEntryAge(): number {
    let oldestTime = Date.now()

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
      }
    }

    return Date.now() - oldestTime
  }

  /**
   * 保存到持久化存储
   */
  private saveToPersistence(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: {
          hits: this.hits,
          misses: this.misses,
          evictions: this.evictions,
        },
        config: this.config,
      }

      localStorage.setItem('chefmind_cache', JSON.stringify(data))
    } catch (error) {
      console.warn('缓存持久化失败:', error)
    }
  }

  /**
   * 从持久化存储加载
   */
  private loadFromPersistence(): void {
    try {
      const saved = localStorage.getItem('chefmind_cache')
      if (saved) {
        const data = JSON.parse(saved)

        // 恢复缓存数据
        this.cache = new Map(data.cache || [])

        // 恢复统计信息
        if (data.stats) {
          this.hits = data.stats.hits || 0
          this.misses = data.stats.misses || 0
          this.evictions = data.stats.evictions || 0
        }

        console.log(`🔄 从持久化存储恢复缓存: ${this.cache.size} 个条目`)
      }
    } catch (error) {
      console.warn('缓存恢复失败:', error)
    }
  }
}

// 预定义的缓存配置
export const CACHE_CONFIGS = {
  // 食谱数据缓存 - 长期缓存
  RECIPES: {
    ttl: 30 * 60 * 1000, // 30 分钟
    maxSize: 500,
    strategy: 'lru' as const,
    enableCompression: true,
    enablePersistence: true,
  },

  // 搜索结果缓存 - 中期缓存
  SEARCH: {
    ttl: 10 * 60 * 1000, // 10 分钟
    maxSize: 200,
    strategy: 'lfu' as const,
    enableCompression: true,
    enablePersistence: false,
  },

  // 用户数据缓存 - 短期缓存
  USER: {
    ttl: 5 * 60 * 1000, // 5 分钟
    maxSize: 100,
    strategy: 'lru' as const,
    enableCompression: false,
    enablePersistence: true,
  },

  // 系统配置缓存 - 长期缓存
  CONFIG: {
    ttl: 60 * 60 * 1000, // 1 小时
    maxSize: 50,
    strategy: 'fifo' as const,
    enableCompression: true,
    enablePersistence: true,
  },
}

// 导出缓存服务实例
export const recipeCache = new AdvancedCacheService(CACHE_CONFIGS.RECIPES)
export const searchCache = new AdvancedCacheService(CACHE_CONFIGS.SEARCH)
export const userCache = new AdvancedCacheService(CACHE_CONFIGS.USER)
export const configCache = new AdvancedCacheService(CACHE_CONFIGS.CONFIG)
