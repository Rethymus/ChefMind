// ChefMind 智食谱 - API缓存和请求去重工具

interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

class APICache {
  private cache = new Map<string, CacheItem<any>>()
  private pendingRequests = new Map<string, PendingRequest<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5分钟默认缓存时间

  /**
   * 生成缓存键
   */
  // private generateKey(url: string, _params?: any): string {
  //   const paramStr = _params ? JSON.stringify(_params) : ''
  //   return `${url}${paramStr}`
  // }

  /**
   * 检查缓存是否有效
   */
  private isValidCache<T>(item: CacheItem<T>): boolean {
    return Date.now() < item.timestamp + item.expiry
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.timestamp + item.expiry) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 清理过期的待处理请求
   */
  private cleanExpiredPendingRequests(): void {
    const now = Date.now()
    const maxPendingTime = 30 * 1000 // 30秒超时
    
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > maxPendingTime) {
        this.pendingRequests.delete(key)
      }
    }
  }

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    this.cleanExpiredCache()
    
    const item = this.cache.get(key)
    if (item && this.isValidCache(item)) {
      return item.data
    }
    
    // 删除过期缓存
    if (item) {
      this.cache.delete(key)
    }
    
    return null
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: ttl
    })
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  /**
   * 带缓存的API调用
   */
  async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // 检查缓存
    const cached = this.get<T>(key)
    if (cached !== null) {
      console.log(`缓存命中: ${key}`)
      return cached
    }

    // 检查是否有相同的请求正在进行（请求去重）
    this.cleanExpiredPendingRequests()
    const pending = this.pendingRequests.get(key)
    if (pending) {
      console.log(`请求去重: ${key}`)
      return pending.promise
    }

    // 发起新请求
    console.log(`发起新请求: ${key}`)
    const promise = requestFn()
    
    // 记录待处理请求
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    try {
      const result = await promise
      
      // 缓存结果
      this.set(key, result, ttl)
      
      // 清除待处理请求
      this.pendingRequests.delete(key)
      
      return result
    } catch (error) {
      // 清除待处理请求
      this.pendingRequests.delete(key)
      throw error
    }
  }

  /**
   * 预加载数据到缓存
   */
  async preload<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      const data = await requestFn()
      this.set(key, data, ttl)
      console.log(`预加载完成: ${key}`)
    } catch (error) {
      console.error(`预加载失败: ${key}`, error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    this.cleanExpiredCache()
    this.cleanExpiredPendingRequests()
    
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys()),
      pendingKeys: Array.from(this.pendingRequests.keys())
    }
  }

  /**
   * 批量删除匹配模式的缓存
   */
  deleteByPattern(pattern: RegExp): number {
    let deletedCount = 0
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    return deletedCount
  }

  /**
   * 获取缓存大小（估算）
   */
  getCacheSize(): number {
    let size = 0
    for (const item of this.cache.values()) {
      try {
        size += JSON.stringify(item.data).length
      } catch {
        size += 1000 // 估算值
      }
    }
    return size
  }
}

// 创建全局缓存实例
export const apiCache = new APICache()

// 专门用于GLM API的缓存配置
export const GLM_CACHE_CONFIG = {
  RECIPE_GENERATION: 10 * 60 * 1000, // 10分钟
  NUTRITION_ANALYSIS: 30 * 60 * 1000, // 30分钟
  INGREDIENT_ALTERNATIVES: 60 * 60 * 1000, // 1小时
  ALLERGEN_CHECK: 60 * 60 * 1000, // 1小时
  RECOMMENDATION: 15 * 60 * 1000 // 15分钟
}

// 缓存键生成器
export const generateCacheKey = {
  recipeGeneration: (ingredients: string[], methods: string[], constraints: any) => {
    return `recipe:generate:${JSON.stringify({ ingredients, methods, constraints })}`
  },
  
  nutritionAnalysis: (recipeId: string) => {
    return `nutrition:analyze:${recipeId}`
  },
  
  ingredientAlternatives: (ingredients: string[]) => {
    return `ingredients:alternatives:${ingredients.sort().join(',')}`
  },
  
  allergenCheck: (recipeId: string) => {
    return `allergen:check:${recipeId}`
  },
  
  recommendation: (currentRecipe: string, preferences: string[]) => {
    return `recommend:${currentRecipe}:${preferences.sort().join(',')}`
  }
}

// 缓存装饰器函数
export function withCache<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  ttl: number = 5 * 60 * 1000
) {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: T): Promise<R> {
      const key = keyGenerator(...args)
      
      return apiCache.cachedRequest(
        key,
        () => method.apply(this, args),
        ttl
      )
    }
    
    return descriptor
  }
}

// 请求去重装饰器
export function withDeduplication<T extends any[], R>(
  keyGenerator: (...args: T) => string
) {
  const pendingRequests = new Map<string, Promise<R>>()
  
  return function (
    _target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: T): Promise<R> {
      const key = keyGenerator(...args)
      
      // 检查是否有相同请求正在进行
      if (pendingRequests.has(key)) {
        console.log(`请求去重: ${propertyName}(${key})`)
        return pendingRequests.get(key)!
      }
      
      // 发起新请求
      const promise = method.apply(this, args)
      pendingRequests.set(key, promise)
      
      try {
        const result = await promise
        pendingRequests.delete(key)
        return result
      } catch (error) {
        pendingRequests.delete(key)
        throw error
      }
    }
    
    return descriptor
  }
}

// 自动清理过期缓存
setInterval(() => {
  const stats = apiCache.getStats()
  console.log('缓存统计:', stats)
  
  // 如果缓存过大，清理一些旧缓存
  if (apiCache.getCacheSize() > 10 * 1024 * 1024) { // 10MB
    console.log('缓存过大，开始清理...')
    apiCache.clear()
  }
}, 5 * 60 * 1000) // 每5分钟检查一次

export default apiCache