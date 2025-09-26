import { ref, computed } from 'vue'

// 用户行为事件类型
export interface UserEvent {
  id: string
  userId?: string
  eventType: 'view' | 'search' | 'save' | 'cook' | 'rate' | 'share' | 'click'
  eventData: {
    recipeId?: string
    query?: string
    rating?: number
    duration?: number
    source?: string
    target?: string
    category?: string
  }
  timestamp: Date
  sessionId: string
  userAgent?: string
  location?: {
    page: string
    component: string
  }
}

// 分析结果接口
export interface AnalyticsData {
  totalEvents: number
  uniqueUsers: number
  popularRecipes: Array<{ recipeId: string; views: number; saves: number }>
  searchTrends: Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>
  userEngagement: {
    averageSessionDuration: number
    averageViewsPerSession: number
    conversionRate: number // 查看到保存的转化率
    returnUserRate: number
  }
  cookingPatterns: {
    preferredTimes: Array<{ hour: number; count: number }>
    popularCategories: Array<{ category: string; count: number }>
    seasonalTrends: Array<{ month: number; ingredient: string; count: number }>
  }
  performanceMetrics: {
    searchResponseTime: number
    pageLoadTime: number
    errorRate: number
  }
}

// 实时统计数据
export interface RealtimeStats {
  activeUsers: number
  currentSearches: number
  popularNow: string[]
  systemHealth: 'good' | 'warning' | 'error'
}

export function useUserBehaviorAnalytics() {
  // 事件存储
  const events = ref<UserEvent[]>([])
  const currentSessionId = ref<string>(generateSessionId())
  const isTracking = ref<boolean>(true)

  // 生成会话ID
  function generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 记录用户事件
  const trackEvent = (
    eventType: UserEvent['eventType'],
    eventData: UserEvent['eventData'],
    location?: UserEvent['location']
  ) => {
    if (!isTracking.value) return

    const event: UserEvent = {
      id: generateEventId(),
      eventType,
      eventData,
      timestamp: new Date(),
      sessionId: currentSessionId.value,
      userAgent: navigator.userAgent,
      location: location || getCurrentLocation(),
    }

    events.value.push(event)

    // 限制事件数量，避免内存泄露
    if (events.value.length > 10000) {
      events.value = events.value.slice(-5000)
    }

    // 发送到服务器（如果需要）
    sendEventToServer(event)

    // 保存到本地存储
    saveEventsToLocal()
  }

  // 生成事件ID
  function generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取当前位置信息
  function getCurrentLocation(): UserEvent['location'] {
    return {
      page: window.location.pathname,
      component: 'unknown', // 可以通过Vue实例获取
    }
  }

  // 发送事件到服务器
  function sendEventToServer(event: UserEvent) {
    // 这里可以实现发送到分析服务器的逻辑
    // 例如 Google Analytics, 百度统计等
    try {
      // 简化实现：使用 fetch 发送到后端
      if (typeof fetch !== 'undefined') {
        fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }).catch(() => {
          // 静默失败，不影响用户体验
        })
      }
    } catch (error) {
      console.warn('分析服务暂时不可用:', error)
    }
  }

  // 保存事件到本地存储
  function saveEventsToLocal() {
    try {
      const recentEvents = events.value.slice(-100) // 只保存最近100个事件
      localStorage.setItem('userEvents', JSON.stringify(recentEvents))
    } catch (error) {
      console.warn('无法保存事件到本地存储:', error)
    }
  }

  // 从本地存储加载事件
  function loadEventsFromLocal() {
    try {
      const savedEvents = localStorage.getItem('userEvents')
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents)
        events.value = parsedEvents.map((event: Partial<UserEvent>) => ({
          ...event,
          timestamp: new Date(event.timestamp || Date.now()),
        })) as UserEvent[]
      }
    } catch (error) {
      console.warn('无法从本地存储加载事件:', error)
    }
  }

  // 分析用户行为模式
  const userBehaviorPatterns = computed(() => {
    const recentEvents = events.value.filter(
      event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // 最近24小时
    )

    return {
      totalEvents: recentEvents.length,
      eventTypes: getEventTypeDistribution(recentEvents),
      hourlyActivity: getHourlyActivity(recentEvents),
      popularQueries: getPopularQueries(recentEvents),
      userJourney: getUserJourney(recentEvents),
      engagementMetrics: calculateEngagementMetrics(recentEvents),
    }
  })

  // 获取事件类型分布
  function getEventTypeDistribution(events: UserEvent[]) {
    const distribution: { [key: string]: number } = {}
    events.forEach(event => {
      distribution[event.eventType] = (distribution[event.eventType] || 0) + 1
    })
    return distribution
  }

  // 获取每小时活动分布
  function getHourlyActivity(events: UserEvent[]) {
    const hourlyData: { [hour: number]: number } = {}
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0
    }

    events.forEach(event => {
      const hour = event.timestamp.getHours()
      hourlyData[hour]++
    })

    return Object.entries(hourlyData).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }))
  }

  // 获取热门搜索查询
  function getPopularQueries(events: UserEvent[]) {
    const queryCount: { [query: string]: number } = {}

    events
      .filter(event => event.eventType === 'search' && event.eventData.query)
      .forEach(event => {
        const query = event.eventData.query!
        queryCount[query] = (queryCount[query] || 0) + 1
      })

    return Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))
  }

  // 获取用户行为路径
  function getUserJourney(events: UserEvent[]) {
    const sessions: { [sessionId: string]: UserEvent[] } = {}

    events.forEach(event => {
      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = []
      }
      sessions[event.sessionId].push(event)
    })

    return Object.values(sessions).map(sessionEvents => {
      sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      return {
        sessionId: sessionEvents[0].sessionId,
        duration:
          sessionEvents[sessionEvents.length - 1].timestamp.getTime() -
          sessionEvents[0].timestamp.getTime(),
        events: sessionEvents.map(event => ({
          type: event.eventType,
          timestamp: event.timestamp,
          data: event.eventData,
        })),
      }
    })
  }

  // 计算参与度指标
  function calculateEngagementMetrics(events: UserEvent[]) {
    const sessions = getUserJourney(events)
    const totalSessions = sessions.length

    if (totalSessions === 0) {
      return {
        averageSessionDuration: 0,
        averageEventsPerSession: 0,
        bounceRate: 0,
        conversionRate: 0,
      }
    }

    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)
    const totalEvents = events.length

    // 跳出率：只有一个事件的会话比例
    const bounceSessions = sessions.filter(session => session.events.length === 1).length
    const bounceRate = bounceSessions / totalSessions

    // 转化率：有保存行为的会话比例
    const conversionSessions = sessions.filter(session =>
      session.events.some(event => event.type === 'save')
    ).length
    const conversionRate = conversionSessions / totalSessions

    return {
      averageSessionDuration: totalDuration / totalSessions,
      averageEventsPerSession: totalEvents / totalSessions,
      bounceRate,
      conversionRate,
    }
  }

  // 获取实时统计
  const getRealtimeStats = computed((): RealtimeStats => {
    const now = Date.now()
    const recentEvents = events.value.filter(
      event => now - event.timestamp.getTime() < 5 * 60 * 1000 // 最近5分钟
    )

    const activeSessions = new Set(recentEvents.map(event => event.sessionId))
    const currentSearches = recentEvents.filter(event => event.eventType === 'search').length

    return {
      activeUsers: activeSessions.size,
      currentSearches,
      popularNow: getPopularQueries(recentEvents)
        .slice(0, 3)
        .map(item => item.query),
      systemHealth: 'good', // 简化实现
    }
  })

  // A/B测试支持
  const trackABTest = (testName: string, variant: string, outcome?: string) => {
    trackEvent('click', {
      source: 'ab_test',
      category: testName,
      target: variant,
      query: outcome,
    })
  }

  // 漏斗分析
  const getFunnelAnalysis = (steps: string[]) => {
    const funnelData = steps.map(step => ({
      step,
      users: 0,
      dropoff: 0,
    }))

    const sessions = getUserJourney(events.value)

    sessions.forEach(session => {
      let currentStep = 0
      session.events.forEach(event => {
        if (currentStep < steps.length && event.type === steps[currentStep]) {
          funnelData[currentStep].users++
          currentStep++
        }
      })
    })

    // 计算流失率
    for (let i = 1; i < funnelData.length; i++) {
      const previous = funnelData[i - 1].users
      const current = funnelData[i].users
      funnelData[i].dropoff = previous > 0 ? (previous - current) / previous : 0
    }

    return funnelData
  }

  // 热力图数据
  const getHeatmapData = (page: string) => {
    const pageEvents = events.value.filter(
      event => event.location?.page === page && event.eventType === 'click'
    )

    const clickData: { [element: string]: number } = {}
    pageEvents.forEach(event => {
      const target = event.eventData.target || 'unknown'
      clickData[target] = (clickData[target] || 0) + 1
    })

    return Object.entries(clickData).map(([element, clicks]) => ({
      element,
      clicks,
      intensity: clicks / Math.max(...Object.values(clickData)),
    }))
  }

  // 搜索分析
  const getSearchAnalytics = () => {
    const searchEvents = events.value.filter(event => event.eventType === 'search')

    const queries = searchEvents.map(event => event.eventData.query || '')
    const uniqueQueries = new Set(queries)

    // 搜索成功率（搜索后有查看行为的比例）
    let successfulSearches = 0

    searchEvents.forEach(searchEvent => {
      const sessionId = searchEvent.sessionId

      // 检查搜索后是否有查看行为
      const hasView = events.value.some(
        event =>
          event.sessionId === sessionId &&
          event.eventType === 'view' &&
          event.timestamp > searchEvent.timestamp
      )

      if (hasView) {
        successfulSearches++
      }
    })

    return {
      totalSearches: searchEvents.length,
      uniqueQueries: uniqueQueries.size,
      successRate: searchEvents.length > 0 ? successfulSearches / searchEvents.length : 0,
      averageQueryLength: queries.reduce((sum, query) => sum + query.length, 0) / queries.length,
      topQueries: getPopularQueries(searchEvents),
    }
  }

  // 清除历史数据
  const clearAnalyticsData = () => {
    events.value = []
    localStorage.removeItem('userEvents')
  }

  // 初始化
  loadEventsFromLocal()

  return {
    // 状态
    events,
    currentSessionId,
    isTracking,

    // 计算属性
    userBehaviorPatterns,
    realtimeStats: getRealtimeStats,

    // 方法
    trackEvent,
    trackABTest,
    getFunnelAnalysis,
    getHeatmapData,
    getSearchAnalytics,
    clearAnalyticsData,

    // 控制方法
    startTracking: () => {
      isTracking.value = true
    },
    stopTracking: () => {
      isTracking.value = false
    },
  }
}
