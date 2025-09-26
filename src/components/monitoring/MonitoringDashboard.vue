<template>
  <div class="monitoring-dashboard">
    <div class="dashboard-header">
      <h2>系统监控仪表板</h2>
      <div class="dashboard-controls">
        <button @click="refreshData" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
        <button @click="exportReport" class="export-btn">导出报告</button>
      </div>
    </div>

    <!-- 系统健康状态 -->
    <div class="health-section">
      <h3>系统健康状态</h3>
      <div class="health-cards">
        <div
          v-for="(status, key) in systemHealth.checks"
          :key="key"
          class="health-card"
          :class="{
            healthy: status,
            unhealthy: !status,
            overall: key === 'overall',
          }"
        >
          <div class="health-icon">
            {{ status ? '✅' : '❌' }}
          </div>
          <div class="health-info">
            <div class="health-title">{{ getHealthTitle(key) }}</div>
            <div class="health-status">{{ status ? '正常' : '异常' }}</div>
          </div>
        </div>
      </div>
      <div class="health-score">
        <div class="score-label">健康评分</div>
        <div class="score-value" :class="systemHealth.status">
          {{ (systemHealth.score * 100).toFixed(1) }}%
        </div>
      </div>
    </div>

    <!-- 性能指标 -->
    <div class="metrics-section">
      <h3>性能指标</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">平均响应时间</span>
            <span class="metric-value">{{ analytics.averageResponseTime.toFixed(2) }}ms</span>
          </div>
          <div class="metric-chart" ref="responseTimeChart"></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">缓存命中率</span>
            <span class="metric-value">{{ (analytics.cacheHitRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="metric-chart" ref="cacheChart"></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">错误率</span>
            <span class="metric-value">{{ getErrorRate().toFixed(2) }}%</span>
          </div>
          <div class="metric-chart" ref="errorChart"></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">活跃用户</span>
            <span class="metric-value">{{ analytics.activeUsers }}</span>
          </div>
          <div class="metric-chart" ref="userChart"></div>
        </div>
      </div>
    </div>

    <!-- 使用统计 -->
    <div class="usage-section">
      <h3>使用统计</h3>
      <div class="usage-stats">
        <div class="stat-item">
          <div class="stat-label">总请求数</div>
          <div class="stat-value">{{ analytics.totalRequests.toLocaleString() }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">数据库查询</div>
          <div class="stat-value">{{ analytics.databaseQueryCount.toLocaleString() }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">错误数量</div>
          <div class="stat-value">{{ analytics.errorCount.toLocaleString() }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">存储使用</div>
          <div class="stat-value">
            {{ (analytics.storageUsage.total / 1024 / 1024).toFixed(2) }}MB
          </div>
        </div>
      </div>
    </div>

    <!-- 热门功能 -->
    <div class="features-section">
      <h3>热门功能</h3>
      <div class="features-list">
        <div
          v-for="(feature, index) in analytics.popularFeatures"
          :key="feature.feature"
          class="feature-item"
        >
          <div class="feature-rank">{{ index + 1 }}</div>
          <div class="feature-name">{{ feature.feature }}</div>
          <div class="feature-usage">{{ feature.usage.toLocaleString() }} 次使用</div>
          <div class="feature-bar">
            <div
              class="feature-bar-fill"
              :style="{ width: `${(feature.usage / maxFeatureUsage) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近警报 -->
    <div class="alerts-section">
      <h3>最近警报</h3>
      <div class="alerts-list">
        <div
          v-for="alert in recentAlerts"
          :key="alert.timestamp"
          class="alert-item"
          :class="alert.level"
        >
          <div class="alert-icon">{{ getAlertIcon(alert.level) }}</div>
          <div class="alert-content">
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
          </div>
        </div>
        <div v-if="recentAlerts.length === 0" class="no-alerts">暂无警报</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { monitoringService } from '@/services/monitoring/monitoringService'
  import { SystemHealth, UsageAnalytics } from '@/services/monitoring/monitoringService'

  const loading = ref(false)
  const systemHealth = ref<SystemHealth>({
    status: 'healthy',
    checks: {
      database: true,
      cache: true,
      storage: true,
      memory: true,
      network: true,
    },
    score: 1,
    lastCheck: Date.now(),
  })

  const analytics = ref<UsageAnalytics>({
    totalRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    databaseQueryCount: 0,
    errorCount: 0,
    activeUsers: 0,
    popularFeatures: [],
    storageUsage: {
      total: 0,
      byType: {},
    },
  })

  const recentAlerts = ref<Array<{ message: string; level: string; timestamp: number }>>([])

  // 计算属性
  const maxFeatureUsage = computed(() => {
    const features = analytics.value.popularFeatures
    return features.length > 0 ? Math.max(...features.map(f => f.usage)) : 1
  })

  // 方法
  const refreshData = async () => {
    loading.value = true
    try {
      // 获取系统健康状态
      systemHealth.value = await monitoringService.getSystemHealth()

      // 获取使用分析
      analytics.value = monitoringService.getUsageAnalytics()

      // 获取最近警报
      recentAlerts.value = monitoringService.getAlerts().slice(-10)
    } catch (error) {
      console.error('获取监控数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  const exportReport = () => {
    const report = monitoringService.generatePerformanceReport()

    // 创建下载链接
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getHealthTitle = (key: string) => {
    const titles: Record<string, string> = {
      database: '数据库',
      cache: '缓存',
      storage: '存储',
      memory: '内存',
      network: '网络',
      overall: '整体状态',
    }
    return titles[key] || key
  }

  const getAlertIcon = (level: string) => {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    }
    return icons[level] || '🔔'
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}小时前`

    return date.toLocaleDateString()
  }

  const getErrorRate = () => {
    if (analytics.value.totalRequests === 0) return 0
    return (analytics.value.errorCount / analytics.value.totalRequests) * 100
  }

  // 生命周期
  onMounted(() => {
    refreshData()

    // 自动刷新数据
    setInterval(refreshData, 30000) // 每30秒刷新一次
  })
</script>

<style scoped>
  .monitoring-dashboard {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    font-family:
      'Noto Sans',
      'DejaVu Sans',
      'WenQuanYi Micro Hei',
      'Droid Sans Fallback',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .dashboard-header h2 {
    margin: 0;
    color: #333;
  }

  .dashboard-controls {
    display: flex;
    gap: 10px;
  }

  .dashboard-controls button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dashboard-controls button:hover:not(:disabled) {
    background: #0056b3;
  }

  .dashboard-controls button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .export-btn {
    background: #28a745 !important;
  }

  .export-btn:hover {
    background: #1e7e34 !important;
  }

  .health-section {
    margin-bottom: 30px;
  }

  .health-section h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .health-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .health-card {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .health-card.healthy {
    border-left: 4px solid #28a745;
  }

  .health-card.unhealthy {
    border-left: 4px solid #dc3545;
  }

  .health-card.overall {
    border-left: 4px solid #007bff;
  }

  .health-icon {
    font-size: 24px;
    margin-right: 10px;
  }

  .health-info {
    flex: 1;
  }

  .health-title {
    font-weight: 500;
    color: #333;
  }

  .health-status {
    font-size: 12px;
    color: #666;
  }

  .health-score {
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .score-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }

  .score-value {
    font-size: 24px;
    font-weight: bold;
  }

  .score-value.healthy {
    color: #28a745;
  }

  .score-value.warning {
    color: #ffc107;
  }

  .score-value.critical {
    color: #dc3545;
  }

  .metrics-section {
    margin-bottom: 30px;
  }

  .metrics-section h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .metric-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .metric-title {
    font-weight: 500;
    color: #333;
  }

  .metric-value {
    font-size: 18px;
    font-weight: bold;
    color: #007bff;
  }

  .metric-chart {
    height: 100px;
    background: #f8f9fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 12px;
  }

  .usage-section {
    margin-bottom: 30px;
  }

  .usage-section h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .usage-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .stat-item {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .stat-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .features-section {
    margin-bottom: 30px;
  }

  .features-section h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .features-list {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .feature-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
  }

  .feature-item:last-child {
    border-bottom: none;
  }

  .feature-rank {
    width: 30px;
    height: 30px;
    background: #007bff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 15px;
  }

  .feature-name {
    flex: 1;
    font-weight: 500;
    color: #333;
  }

  .feature-usage {
    margin-right: 15px;
    color: #666;
    font-size: 14px;
  }

  .feature-bar {
    width: 100px;
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
  }

  .feature-bar-fill {
    height: 100%;
    background: #007bff;
    transition: width 0.3s ease;
  }

  .alerts-section {
    margin-bottom: 30px;
  }

  .alerts-section h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .alerts-list {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    padding: 15px;
    border-bottom: 1px solid #eee;
  }

  .alert-item:last-child {
    border-bottom: none;
  }

  .alert-item.info {
    border-left: 4px solid #17a2b8;
  }

  .alert-item.warning {
    border-left: 4px solid #ffc107;
  }

  .alert-item.error {
    border-left: 4px solid #dc3545;
  }

  .alert-icon {
    font-size: 20px;
    margin-right: 10px;
  }

  .alert-content {
    flex: 1;
  }

  .alert-message {
    font-weight: 500;
    color: #333;
    margin-bottom: 5px;
  }

  .alert-time {
    font-size: 12px;
    color: #666;
  }

  .no-alerts {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  @media (max-width: 768px) {
    .monitoring-dashboard {
      padding: 10px;
    }

    .dashboard-header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }

    .health-cards {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .usage-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
