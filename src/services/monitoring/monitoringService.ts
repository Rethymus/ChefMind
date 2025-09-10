/**
 * 监控和分析服务
 * 提供数据使用情况分析、性能监控和系统健康状况检查
 */

export interface MetricData {
  timestamp: number
  value: number
  tags?: Record<string, string>
}

export interface PerformanceMetrics {
  responseTime: MetricData[]
  memoryUsage: MetricData[]
  cacheHitRate: MetricData[]
  databaseQueries: MetricData[]
  errorRate: MetricData[]
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  checks: {
    database: boolean
    cache: boolean
    storage: boolean
    memory: boolean
    network: boolean
  }
  score: number
  lastCheck: number
}

export interface UsageAnalytics {
  totalRequests: number
  averageResponseTime: number
  cacheHitRate: number
  databaseQueryCount: number
  errorCount: number
  activeUsers: number
  popularFeatures: Array<{ feature: string; usage: number }>
  storageUsage: {
    total: number
    byType: Record<string, number>
  }
}

export class MonitoringService {
  private metrics: PerformanceMetrics = {
    responseTime: [],
    memoryUsage: [],
    cacheHitRate: [],
    databaseQueries: [],
    errorRate: []
  }
  private alerts: Array<{ message: string; level: 'info' | 'warning' | 'error'; timestamp: number }> = []
  private config = {
    maxMetricsCount: 1000,
    alertThresholds: {
      responseTime: 1000, // 1秒
      memoryUsage: 0.8, // 80%
      errorRate: 0.05, // 5%
      cacheHitRate: 0.7 // 70%
    }
  }

  constructor() {
    // 启动定期监控
    this.startPeriodicMonitoring()
    
    // 监听系统事件
    this.setupEventListeners()
  }

  /**
   * 记录响应时间指标
   */
  recordResponseTime(responseTime: number, tags?: Record<string, string>): void {
    this.recordMetric('responseTime', responseTime, tags)
    
    // 检查是否超过阈值
    if (responseTime > this.config.alertThresholds.responseTime) {
      this.addAlert(`响应时间过长: ${responseTime}ms`, 'warning')
    }
  }

  /**
   * 记录内存使用指标
   */
  recordMemoryUsage(usage: number, tags?: Record<string, string>): void {
    this.recordMetric('memoryUsage', usage, tags)
    
    // 检查是否超过阈值
    if (usage > this.config.alertThresholds.memoryUsage) {
      this.addAlert(`内存使用率过高: ${(usage * 100).toFixed(1)}%`, 'warning')
    }
  }

  /**
   * 记录缓存命中率
   */
  recordCacheHitRate(hitRate: number, tags?: Record<string, string>): void {
    this.recordMetric('cacheHitRate', hitRate, tags)
    
    // 检查是否低于阈值
    if (hitRate < this.config.alertThresholds.cacheHitRate) {
      this.addAlert(`缓存命中率过低: ${(hitRate * 100).toFixed(1)}%`, 'warning')
    }
  }

  /**
   * 记录数据库查询
   */
  recordDatabaseQuery(queryTime: number, tags?: Record<string, string>): void {
    this.recordMetric('databaseQueries', queryTime, tags)
  }

  /**
   * 记录错误率
   */
  recordError(isError: boolean = true, tags?: Record<string, string>): void {
    const errorRate = isError ? 1 : 0
    this.recordMetric('errorRate', errorRate, tags)
    
    if (isError) {
      this.addAlert('检测到错误', 'error')
    }
  }

  /**
   * 记录通用指标
   */
  private recordMetric(type: keyof PerformanceMetrics, value: number, tags?: Record<string, string>): void {
    const metric = {
      timestamp: Date.now(),
      value,
      tags: tags || {}
    }

    this.metrics[type].push(metric)

    // 限制指标数量
    if (this.metrics[type].length > this.config.maxMetricsCount) {
      this.metrics[type] = this.metrics[type].slice(-this.config.maxMetricsCount)
    }
  }

  /**
   * 添加警报
   */
  private addAlert(message: string, level: 'info' | 'warning' | 'error'): void {
    const alert = {
      message,
      level,
      timestamp: Date.now()
    }

    this.alerts.push(alert)

    // 限制警报数量
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    console.log(`🚨 [${level.toUpperCase()}] ${message}`)
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(type?: keyof PerformanceMetrics): PerformanceMetrics | MetricData[] {
    if (type) {
      return this.metrics[type]
    }
    return this.metrics
  }

  /**
   * 获取系统健康状况
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      storage: await this.checkStorage(),
      memory: this.checkMemory(),
      network: await this.checkNetwork()
    }

    const passedChecks = Object.values(checks).filter(Boolean).length
    const score = passedChecks / Object.keys(checks).length

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (score < 0.5) {
      status = 'critical'
    } else if (score < 0.8) {
      status = 'warning'
    }

    return {
      status,
      checks,
      score,
      lastCheck: Date.now()
    }
  }

  /**
   * 获取使用分析
   */
  getUsageAnalytics(timeRange: number = 24 * 60 * 60 * 1000): UsageAnalytics {
    const now = Date.now()
    const startTime = now - timeRange

    // 筛选时间范围内的指标
    const filterByTime = (metrics: MetricData[]) => 
      metrics.filter(m => m.timestamp >= startTime)

    const responseTimeMetrics = filterByTime(this.metrics.responseTime)
    const cacheMetrics = filterByTime(this.metrics.cacheHitRate)
    const errorMetrics = filterByTime(this.metrics.errorRate)

    const averageResponseTime = responseTimeMetrics.length > 0 
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length 
      : 0

    const cacheHitRate = cacheMetrics.length > 0 
      ? cacheMetrics.reduce((sum, m) => sum + m.value, 0) / cacheMetrics.length 
      : 0

    const errorCount = errorMetrics.filter(m => m.value === 1).length

    return {
      totalRequests: responseTimeMetrics.length,
      averageResponseTime,
      cacheHitRate,
      databaseQueryCount: filterByTime(this.metrics.databaseQueries).length,
      errorCount,
      activeUsers: this.estimateActiveUsers(),
      popularFeatures: this.getPopularFeatures(),
      storageUsage: this.getStorageUsage()
    }
  }

  /**
   * 获取警报历史
   */
  getAlerts(level?: 'info' | 'warning' | 'error'): Array<{ message: string; level: string; timestamp: number }> {
    if (level) {
      return this.alerts.filter(alert => alert.level === level)
    }
    return [...this.alerts]
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): string {
    const analytics = this.getUsageAnalytics()
    const health = this.getSystemHealth()

    return `
📊 性能监控报告
================================
生成时间: ${new Date().toLocaleString()}

🎯 系统健康状况
状态: ${health.status}
健康评分: ${(health.score * 100).toFixed(1)}%
检查项目:
- 数据库: ${health.checks.database ? '✅ 正常' : '❌ 异常'}
- 缓存: ${health.checks.cache ? '✅ 正常' : '❌ 异常'}
- 存储: ${health.checks.storage ? '✅ 正常' : '❌ 异常'}
- 内存: ${health.checks.memory ? '✅ 正常' : '❌ 异常'}
- 网络: ${health.checks.network ? '✅ 正常' : '❌ 异常'}

📈 使用情况分析
总请求数: ${analytics.totalRequests}
平均响应时间: ${analytics.averageResponseTime.toFixed(2)}ms
缓存命中率: ${(analytics.cacheHitRate * 100).toFixed(1)}%
数据库查询数: ${analytics.databaseQueryCount}
错误数量: ${analytics.errorCount}
活跃用户: ${analytics.activeUsers}

🚨 最近警报
${this.getAlerts().slice(-5).map(alert => 
  `[${alert.level.toUpperCase()}] ${new Date(alert.timestamp).toLocaleString()} - ${alert.message}`
).join('\n') || '无'}

💾 存储使用情况
总使用量: ${analytics.storageUsage.total}MB
按类型分布:
${Object.entries(analytics.storageUsage.byType).map(([type, usage]) => 
  `  ${type}: ${usage}MB`
).join('\n')}
    `.trim()
  }

  /**
   * 检查数据库状态
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      // 这里可以添加实际的数据库检查逻辑
      // 例如：执行简单的查询测试
      return true
    } catch (error) {
      this.addAlert(`数据库检查失败: ${error.message}`, 'error')
      return false
    }
  }

  /**
   * 检查缓存状态
   */
  private async checkCache(): Promise<boolean> {
    try {
      // 检查缓存服务是否正常
      const latestCacheMetric = this.metrics.cacheHitRate[this.metrics.cacheHitRate.length - 1]
      return latestCacheMetric !== undefined
    } catch (error) {
      this.addAlert(`缓存检查失败: ${error.message}`, 'error')
      return false
    }
  }

  /**
   * 检查存储状态
   */
  private async checkStorage(): Promise<boolean> {
    try {
      // 检查存储空间是否足够
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate()
        const usageRatio = estimate.usage / estimate.quota
        return usageRatio < 0.9 // 90% 使用率以下
      }
      return true
    } catch (error) {
      this.addAlert(`存储检查失败: ${error.message}`, 'error')
      return false
    }
  }

  /**
   * 检查内存状态
   */
  private checkMemory(): boolean {
    try {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize
        const total = performance.memory.totalJSHeapSize
        const ratio = used / total
        return ratio < this.config.alertThresholds.memoryUsage
      }
      return true
    } catch (error) {
      this.addAlert(`内存检查失败: ${error.message}`, 'error')
      return false
    }
  }

  /**
   * 检查网络状态
   */
  private async checkNetwork(): Promise<boolean> {
    try {
      if (navigator.onLine !== undefined) {
        return navigator.onLine
      }
      return true
    } catch (error) {
      this.addAlert(`网络检查失败: ${error.message}`, 'error')
      return false
    }
  }

  /**
   * 估计活跃用户数
   */
  private estimateActiveUsers(): number {
    // 基于最近的请求活动估计活跃用户
    const recentRequests = this.metrics.responseTime.filter(
      m => Date.now() - m.timestamp < 5 * 60 * 1000 // 5分钟内
    )
    
    const uniqueUsers = new Set(
      recentRequests.map(m => m.tags?.userId || 'anonymous')
    )
    
    return uniqueUsers.size
  }

  /**
   * 获取热门功能
   */
  private getPopularFeatures(): Array<{ feature: string; usage: number }> {
    const featureUsage = new Map<string, number>()
    
    // 基于请求标签统计功能使用情况
    this.metrics.responseTime.forEach(metric => {
      const feature = metric.tags?.feature || 'unknown'
      featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1)
    })
    
    return Array.from(featureUsage.entries())
      .map(([feature, usage]) => ({ feature, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10)
  }

  /**
   * 获取存储使用情况
   */
  private getStorageUsage(): { total: number; byType: Record<string, number> } {
    // 这里可以添加实际的存储使用情况统计
    return {
      total: 0,
      byType: {
        cache: 0,
        database: 0,
        logs: 0
      }
    }
  }

  /**
   * 启动定期监控
   */
  private startPeriodicMonitoring(): void {
    // 每分钟检查一次系统健康状况
    setInterval(async () => {
      const health = await this.getSystemHealth()
      
      if (health.status === 'critical') {
        this.addAlert('系统健康状况严重', 'error')
      } else if (health.status === 'warning') {
        this.addAlert('系统健康状况警告', 'warning')
      }
    }, 60 * 1000)

    // 每30秒记录一次内存使用情况
    setInterval(() => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize
        const total = performance.memory.totalJSHeapSize
        this.recordMemoryUsage(used / total)
      }
    }, 30 * 1000)
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听在线/离线事件
    window.addEventListener('online', () => {
      this.addAlert('网络连接已恢复', 'info')
    })

    window.addEventListener('offline', () => {
      this.addAlert('网络连接已断开', 'warning')
    })

    // 监听内存警告（如果支持）
    if ('onmemorypressure' in window) {
      window.addEventListener('memorypressure', (event) => {
        this.addAlert(`内存压力警告: ${event}`, 'warning')
      })
    }
  }
}

// 导出监控服务实例
export const monitoringService = new MonitoringService()