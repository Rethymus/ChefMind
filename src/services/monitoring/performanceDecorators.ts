/**
 * 性能监控装饰器
 * 为方法调用提供自动性能监控和分析
 */

import { monitoringService } from './monitoringService'

export interface MonitorOptions {
  metricName?: string
  tags?: Record<string, string>
  trackErrors?: boolean
  sampleRate?: number
}

/**
 * 方法性能监控装饰器
 */
export function MonitorPerformance(options: MonitorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // 采样率控制
      if (options.sampleRate && Math.random() > options.sampleRate) {
        return originalMethod.apply(this, args)
      }

      const startTime = performance.now()
      const tags = {
        ...options.tags,
        method: propertyKey,
        class: target.constructor.name,
      }

      try {
        const result = await originalMethod.apply(this, args)

        // 记录成功执行时间
        const responseTime = performance.now() - startTime
        monitoringService.recordResponseTime(responseTime, tags)

        return result
      } catch (error) {
        // 记录错误
        if (options.trackErrors !== false) {
          monitoringService.recordError(true, { ...tags, error: error.message })
        }

        // 重新抛出错误
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 数据库查询监控装饰器
 */
export function MonitorQuery(options: MonitorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      const tags = {
        ...options.tags,
        method: propertyKey,
        class: target.constructor.name,
        type: 'database',
      }

      try {
        const result = await originalMethod.apply(this, args)

        // 记录查询时间
        const queryTime = performance.now() - startTime
        monitoringService.recordDatabaseQuery(queryTime, tags)

        return result
      } catch (error) {
        monitoringService.recordError(true, { ...tags, error: error.message })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 缓存操作监控装饰器
 */
export function MonitorCache(options: MonitorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      const tags = {
        ...options.tags,
        method: propertyKey,
        class: target.constructor.name,
        type: 'cache',
      }

      try {
        const result = await originalMethod.apply(this, args)

        // 记录缓存操作时间
        const cacheTime = performance.now() - startTime
        monitoringService.recordResponseTime(cacheTime, tags)

        return result
      } catch (error) {
        monitoringService.recordError(true, { ...tags, error: error.message })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 类级别监控装饰器
 */
export function MonitorClass(options: MonitorOptions = {}) {
  return function (target: any) {
    const className = target.name
    const classTags = { ...options.tags, class: className }

    // 监控所有方法
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      name => name !== 'constructor' && typeof target.prototype[name] === 'function'
    )

    methodNames.forEach(methodName => {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, methodName)
      if (descriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
          const startTime = performance.now()
          const tags = {
            ...classTags,
            method: methodName,
          }

          try {
            const result = await originalMethod.apply(this, args)

            const responseTime = performance.now() - startTime
            monitoringService.recordResponseTime(responseTime, tags)

            return result
          } catch (error) {
            monitoringService.recordError(true, { ...tags, error: error.message })
            throw error
          }
        }

        Object.defineProperty(target.prototype, methodName, descriptor)
      }
    })

    return target
  }
}

/**
 * 性能分析器
 * 提供详细的性能分析功能
 */
export class PerformanceProfiler {
  private measurements = new Map<string, number[]>()

  /**
   * 开始测量
   */
  start(key: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!this.measurements.has(key)) {
        this.measurements.set(key, [])
      }

      this.measurements.get(key)!.push(duration)
    }
  }

  /**
   * 获取测量结果
   */
  getResults(key?: string) {
    if (key) {
      const measurements = this.measurements.get(key) || []
      return this.calculateStats(measurements)
    }

    const results: Record<string, any> = {}
    for (const [k, measurements] of this.measurements.entries()) {
      results[k] = this.calculateStats(measurements)
    }

    return results
  }

  /**
   * 清空测量结果
   */
  clear(key?: string): void {
    if (key) {
      this.measurements.delete(key)
    } else {
      this.measurements.clear()
    }
  }

  /**
   * 计算统计信息
   */
  private calculateStats(measurements: number[]) {
    if (measurements.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      }
    }

    const sorted = [...measurements].sort((a, b) => a - b)
    const sum = sorted.reduce((acc, val) => acc + val, 0)

    return {
      count: sorted.length,
      average: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }
}

/**
 * 全局性能分析器实例
 */
export const globalProfiler = new PerformanceProfiler()
