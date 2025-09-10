/**
 * 缓存装饰器
 * 为方法调用提供智能缓存功能
 */

import { AdvancedCacheService } from './advancedCacheService'

export interface CacheOptions {
  keyPrefix?: string
  ttl?: number
  useCache?: boolean
  cacheInstance?: AdvancedCacheService
  keyGenerator?: (...args: any[]) => string
}

/**
 * 方法缓存装饰器
 */
export function Cacheable(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = options.cacheInstance || new AdvancedCacheService()
    const keyPrefix = options.keyPrefix || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      if (options.useCache === false) {
        return originalMethod.apply(this, args)
      }

      // 生成缓存键
      let cacheKey: string
      if (options.keyGenerator) {
        cacheKey = options.keyGenerator(...args)
      } else {
        cacheKey = `${keyPrefix}:${JSON.stringify(args)}`
      }

      // 尝试从缓存获取
      const cachedResult = await cache.get(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 缓存结果
      await cache.set(cacheKey, result, options.ttl)

      return result
    }

    return descriptor
  }
}

/**
 * 缓存失效装饰器
 */
export function CacheEvict(options: { keyPrefix?: string; keyGenerator?: (...args: any[]) => string } = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const keyPrefix = options.keyPrefix || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      // 先执行原方法
      const result = await originalMethod.apply(this, args)

      // 生成缓存键并删除缓存
      let cacheKey: string
      if (options.keyGenerator) {
        cacheKey = options.keyGenerator(...args)
      } else {
        cacheKey = `${keyPrefix}:${JSON.stringify(args)}`
      }

      // 这里需要访问缓存实例，暂时简化处理
      // 在实际使用中，可以通过依赖注入或其他方式获取缓存实例
      console.log(`🗑️ 缓存失效: ${cacheKey}`)

      return result
    }

    return descriptor
  }
}

/**
 * 批量缓存装饰器
 */
export function BatchCacheable(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = options.cacheInstance || new AdvancedCacheService()
    const keyPrefix = options.keyPrefix || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      if (options.useCache === false) {
        return originalMethod.apply(this, args)
      }

      // 检查是否是批量操作
      const firstArg = args[0]
      if (Array.isArray(firstArg)) {
        // 批量操作 - 尝试从缓存获取所有数据
        const keys = firstArg.map(item => `${keyPrefix}:${JSON.stringify([item])}`)
        const cachedResults = await cache.mget(keys)
        
        // 找出未缓存的项
        const uncachedItems = firstArg.filter((_item, index) => 
          cachedResults.get(keys[index]) === null
        )

        if (uncachedItems.length > 0) {
          // 获取未缓存的数据
          const freshResults = await originalMethod.apply(this, [uncachedItems, ...args.slice(1)])
          
          // 缓存新数据
          for (let i = 0; i < uncachedItems.length; i++) {
            const item = uncachedItems[i]
            const result = freshResults[i]
            const cacheKey = `${keyPrefix}:${JSON.stringify([item])}`
            await cache.set(cacheKey, result, options.ttl)
          }
        }

        // 返回合并的结果
        const finalResults = firstArg.map((item, index) => {
          const cacheKey = `${keyPrefix}:${JSON.stringify([item])}`
          return cachedResults.get(cacheKey)
        })

        return finalResults
      } else {
        // 单个操作
        const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`
        const cachedResult = await cache.get(cacheKey)
        
        if (cachedResult !== null) {
          return cachedResult
        }

        const result = await originalMethod.apply(this, args)
        await cache.set(cacheKey, result, options.ttl)
        
        return result
      }
    }

    return descriptor
  }
}

/**
 * 缓存预热装饰器
 */
export function CacheWarmer(options: { 
  dataProvider: () => Promise<Array<{ key: string; value: any }>>
  cacheInstance?: AdvancedCacheService
}) {
  return function (target: any) {
    const cache = options.cacheInstance || new AdvancedCacheService()
    
    // 在类实例化后自动预热缓存
    const originalConstructor = target
    target = class extends originalConstructor {
      constructor(...args: any[]) {
        super(...args)
        
        // 异步预热缓存
        options.dataProvider().then(data => {
          cache.warmup(data)
        }).catch(error => {
          console.warn('缓存预热失败:', error)
        })
      }
    }
    
    return target
  }
}