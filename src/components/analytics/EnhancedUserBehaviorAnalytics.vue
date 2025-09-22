<template>
  <div class="enhanced-user-behavior-analytics">
    <div class="analytics-header">
      <h2 class="analytics-title">
        <span class="title-icon">📊</span>
        用户行为分析中心
      </h2>
      <p class="analytics-subtitle">深入了解用户行为模式，优化产品体验</p>

      <!-- 时间范围选择器 -->
      <div class="time-range-selector">
        <el-date-picker
          v-model="timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleTimeRangeChange"
        />
        <el-button @click="refreshData" :icon="Refresh" :loading="isLoading"> 刷新数据 </el-button>
      </div>
    </div>

    <!-- 核心指标概览 -->
    <div class="metrics-overview">
      <div class="metric-card">
        <div class="metric-icon">👥</div>
        <div class="metric-content">
          <div class="metric-value">{{ analyticsData.totalUsers }}</div>
          <div class="metric-label">总用户数</div>
          <div class="metric-trend" :class="getTrendClass(userGrowthTrend)">
            <el-icon><TrendCharts /></el-icon>
            {{ userGrowthTrend > 0 ? '+' : '' }}{{ userGrowthTrend.toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📱</div>
        <div class="metric-content">
          <div class="metric-value">{{ analyticsData.activeUsers }}</div>
          <div class="metric-label">活跃用户</div>
          <div class="metric-trend" :class="getTrendClass(activeUserTrend)">
            <el-icon><TrendCharts /></el-icon>
            {{ activeUserTrend > 0 ? '+' : '' }}{{ activeUserTrend.toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">⏱️</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatDuration(analyticsData.avgSessionDuration) }}</div>
          <div class="metric-label">平均会话时长</div>
          <div class="metric-trend" :class="getTrendClass(sessionDurationTrend)">
            <el-icon><TrendCharts /></el-icon>
            {{ sessionDurationTrend > 0 ? '+' : '' }}{{ sessionDurationTrend.toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🎯</div>
        <div class="metric-content">
          <div class="metric-value">{{ (analyticsData.conversionRate * 100).toFixed(1) }}%</div>
          <div class="metric-label">转化率</div>
          <div class="metric-trend" :class="getTrendClass(conversionRateTrend)">
            <el-icon><TrendCharts /></el-icon>
            {{ conversionRateTrend > 0 ? '+' : '' }}{{ conversionRateTrend.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 分析图表区域 -->
    <div class="analytics-charts">
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="chart-container">
            <h3 class="chart-title">用户活动趋势</h3>
            <div class="chart-placeholder">
              <canvas ref="userActivityChart" width="400" height="200"></canvas>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="chart-container">
            <h3 class="chart-title">功能使用分布</h3>
            <div class="chart-placeholder">
              <canvas ref="featureUsageChart" width="400" height="200"></canvas>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px">
        <el-col :span="8">
          <div class="chart-container">
            <h3 class="chart-title">设备类型分布</h3>
            <div class="device-distribution">
              <div v-for="device in deviceData" :key="device.type" class="device-item">
                <div class="device-icon">{{ device.icon }}</div>
                <div class="device-info">
                  <div class="device-name">{{ device.type }}</div>
                  <div class="device-percentage">{{ device.percentage }}%</div>
                </div>
                <div class="device-progress">
                  <div class="progress-bar" :style="{ width: `${device.percentage}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chart-container">
            <h3 class="chart-title">热门搜索词</h3>
            <div class="search-trends">
              <div v-for="(search, index) in topSearches" :key="search.query" class="search-item">
                <div class="search-rank">{{ index + 1 }}</div>
                <div class="search-query">{{ search.query }}</div>
                <div class="search-count">{{ search.count }}</div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="chart-container">
            <h3 class="chart-title">用户留存分析</h3>
            <div class="retention-analysis">
              <div v-for="period in retentionData" :key="period.period" class="retention-item">
                <div class="retention-period">{{ period.period }}</div>
                <div class="retention-rate">{{ period.rate }}%</div>
                <div class="retention-bar">
                  <div class="retention-fill" :style="{ width: `${period.rate}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细事件列表 -->
    <div class="events-section">
      <div class="section-header">
        <h3 class="section-title">实时事件流</h3>
        <div class="section-actions">
          <el-input
            v-model="eventFilter"
            placeholder="过滤事件..."
            size="small"
            style="width: 200px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button @click="exportEvents" :icon="Download" size="small"> 导出数据 </el-button>
        </div>
      </div>

      <el-table :data="filteredEvents" height="400" v-loading="isLoading">
        <el-table-column prop="timestamp" label="时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>

        <el-table-column prop="eventType" label="事件类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getEventTypeColor(row.eventType)" size="small">
              {{ getEventTypeLabel(row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="userId" label="用户ID" width="120" />

        <el-table-column prop="location.page" label="页面" width="120" />

        <el-table-column prop="eventData" label="事件数据" min-width="200">
          <template #default="{ row }">
            <div class="event-data">
              <div v-if="row.eventData.recipeId" class="data-item">
                <span class="data-label">食谱:</span>
                <span class="data-value">{{ row.eventData.recipeId }}</span>
              </div>
              <div v-if="row.eventData.query" class="data-item">
                <span class="data-label">搜索:</span>
                <span class="data-value">{{ row.eventData.query }}</span>
              </div>
              <div v-if="row.eventData.category" class="data-item">
                <span class="data-label">分类:</span>
                <span class="data-value">{{ row.eventData.category }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="sessionId" label="会话ID" width="120" />

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button @click="viewEventDetail(row)" :icon="View" size="small" text>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 事件详情对话框 -->
    <el-dialog v-model="eventDetailVisible" title="事件详情" width="90%" max-width="600px">
      <div v-if="selectedEvent" class="event-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事件ID">
            {{ selectedEvent.id }}
          </el-descriptions-item>
          <el-descriptions-item label="事件类型">
            {{ getEventTypeLabel(selectedEvent.eventType) }}
          </el-descriptions-item>
          <el-descriptions-item label="时间戳">
            {{ formatTime(selectedEvent.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ selectedEvent.userId || '匿名用户' }}
          </el-descriptions-item>
          <el-descriptions-item label="会话ID">
            {{ selectedEvent.sessionId }}
          </el-descriptions-item>
          <el-descriptions-item label="页面">
            {{ selectedEvent.location?.page }}
          </el-descriptions-item>
          <el-descriptions-item label="组件">
            {{ selectedEvent.location?.component }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            {{ selectedEvent.userAgent }}
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 16px">
          <h4>事件数据</h4>
          <pre class="event-data-json">{{ JSON.stringify(selectedEvent.eventData, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Refresh, TrendCharts, Search, Download, View } from '@element-plus/icons-vue'
  import { useUserBehaviorAnalytics, type UserEvent } from '@/composables/useUserBehaviorAnalytics'

  // 响应式数据
  const isLoading = ref(false)
  const timeRange = ref<[string, string]>(['2025-01-01', '2025-12-31'])
  const eventFilter = ref('')
  const eventDetailVisible = ref(false)
  const selectedEvent = ref<UserEvent | null>(null)
  const userActivityChart = ref<HTMLCanvasElement>()
  const featureUsageChart = ref<HTMLCanvasElement>()

  // 组合式函数
  const { events } = useUserBehaviorAnalytics()

  // 分析数据
  const analyticsData = ref({
    totalUsers: 1258,
    activeUsers: 324,
    avgSessionDuration: 485000, // 毫秒
    conversionRate: 0.234,
    totalEvents: events.value.length,
  })

  // 趋势数据
  const userGrowthTrend = ref(12.5)
  const activeUserTrend = ref(8.3)
  const sessionDurationTrend = ref(-2.1)
  const conversionRateTrend = ref(15.7)

  // 设备数据
  const deviceData = ref([
    { type: '桌面端', icon: '🖥️', percentage: 65 },
    { type: '移动端', icon: '📱', percentage: 30 },
    { type: '平板端', icon: '📟', percentage: 5 },
  ])

  // 热门搜索
  const topSearches = ref([
    { query: '减肥食谱', count: 156 },
    { query: '快手菜', count: 142 },
    { query: '儿童餐', count: 128 },
    { query: '素食', count: 98 },
    { query: '下饭菜', count: 87 },
  ])

  // 留存数据
  const retentionData = ref([
    { period: '1天', rate: 78 },
    { period: '7天', rate: 45 },
    { period: '30天', rate: 28 },
    { period: '90天', rate: 15 },
  ])

  // 计算属性
  const filteredEvents = computed(() => {
    if (!eventFilter.value) return events.value.slice(0, 100)

    return events.value
      .filter(
        event =>
          event.eventType.includes(eventFilter.value) ||
          event.eventData.query?.includes(eventFilter.value) ||
          event.eventData.category?.includes(eventFilter.value) ||
          event.location?.page?.includes(eventFilter.value)
      )
      .slice(0, 100)
  })

  // 生命周期
  onMounted(() => {
    loadAnalyticsData()
    initCharts()

    // 定时刷新数据
    const refreshInterval = setInterval(loadAnalyticsData, 30000)
    onUnmounted(() => clearInterval(refreshInterval))
  })

  // 监听时间范围变化
  watch(timeRange, () => {
    loadAnalyticsData()
  })

  // 方法定义
  async function loadAnalyticsData() {
    isLoading.value = true
    try {
      // 模拟加载分析数据
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 更新分析数据
      analyticsData.value = {
        totalUsers: 1258 + Math.floor(Math.random() * 100),
        activeUsers: 324 + Math.floor(Math.random() * 50),
        avgSessionDuration: 485000 + Math.floor(Math.random() * 100000),
        conversionRate: 0.234 + Math.random() * 0.1,
        totalEvents: events.value.length,
      }

      // 更新图表
      updateCharts()
    } catch (error) {
      console.error('加载分析数据失败:', error)
      ElMessage.error('数据加载失败')
    } finally {
      isLoading.value = false
    }
  }

  function initCharts() {
    // 初始化用户活动趋势图
    if (userActivityChart.value) {
      const ctx = userActivityChart.value.getContext('2d')
      if (ctx) {
        // 绘制简单的折线图
        drawLineChart(ctx, generateTrendData(), '用户活动')
      }
    }

    // 初始化功能使用分布图
    if (featureUsageChart.value) {
      const ctx = featureUsageChart.value.getContext('2d')
      if (ctx) {
        // 绘制简单的柱状图
        drawBarChart(ctx, generateFeatureData(), '功能使用')
      }
    }
  }

  function updateCharts() {
    // 更新图表数据
    initCharts()
  }

  function drawLineChart(ctx: CanvasRenderingContext2D, data: number[], _title: string) {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = '#409EFF'
    ctx.lineWidth = 2

    // 绘制坐标轴
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(padding, padding)
    ctx.stroke()

    // 绘制数据线
    const stepX = (width - 2 * padding) / (data.length - 1)
    const maxValue = Math.max(...data)
    const stepY = (height - 2 * padding) / maxValue

    ctx.beginPath()
    data.forEach((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - value * stepY

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // 绘制数据点
    ctx.fillStyle = '#409EFF'
    data.forEach((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - value * stepY

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  function drawBarChart(
    ctx: CanvasRenderingContext2D,
    data: { label: string; value: number }[],
    _title: string
  ) {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    const barWidth = (width - 2 * padding) / data.length - 10
    const maxValue = Math.max(...data.map(d => d.value))

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + 10)
      const barHeight = (item.value / maxValue) * (height - 2 * padding)
      const y = height - padding - barHeight

      // 绘制柱子
      ctx.fillStyle = '#67C23A'
      ctx.fillRect(x, y, barWidth, barHeight)

      // 绘制标签
      ctx.fillStyle = '#606266'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 20)
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 10)
    })
  }

  function generateTrendData(): number[] {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50)
  }

  function generateFeatureData(): { label: string; value: number }[] {
    return [
      { label: '搜索', value: 45 },
      { label: '收藏', value: 32 },
      { label: '分享', value: 28 },
      { label: '评价', value: 15 },
    ]
  }

  function handleTimeRangeChange() {
    loadAnalyticsData()
  }

  function refreshData() {
    loadAnalyticsData()
  }

  function getTrendClass(trend: number): string {
    return trend > 0 ? 'trend-up' : 'trend-down'
  }

  function formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  function getEventTypeColor(
    eventType: string
  ): 'success' | 'primary' | 'warning' | 'info' | 'danger' {
    const colorMap: { [key: string]: 'success' | 'primary' | 'warning' | 'info' | 'danger' } = {
      view: 'info',
      search: 'primary',
      save: 'success',
      cook: 'warning',
      rate: 'danger',
      share: 'success',
      click: 'info',
    }
    return colorMap[eventType] || 'info'
  }

  function getEventTypeLabel(eventType: string): string {
    const labelMap: { [key: string]: string } = {
      view: '浏览',
      search: '搜索',
      save: '保存',
      cook: '烹饪',
      rate: '评价',
      share: '分享',
      click: '点击',
    }
    return labelMap[eventType] || eventType
  }

  function viewEventDetail(event: UserEvent) {
    selectedEvent.value = event
    eventDetailVisible.value = true
  }

  async function exportEvents() {
    try {
      const data = {
        events: events.value,
        analytics: analyticsData.value,
        exportTime: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('数据导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('数据导出失败')
    }
  }
</script>

<style scoped lang="scss">
  .enhanced-user-behavior-analytics {
    padding: 24px;
    background: var(--el-bg-color);
    border-radius: 12px;

    .analytics-header {
      margin-bottom: 32px;

      .analytics-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;
        gap: 8px;

        .title-icon {
          font-size: 28px;
        }
      }

      .analytics-subtitle {
        margin: 0 0 24px 0;
        color: var(--el-text-color-secondary);
      }

      .time-range-selector {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .metrics-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;

      .metric-card {
        background: var(--el-fill-color-lighter);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .metric-icon {
          font-size: 48px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--el-color-primary-light-8);
          border-radius: 50%;
        }

        .metric-content {
          flex: 1;

          .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .metric-label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin-bottom: 8px;
          }

          .metric-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            font-weight: 600;

            &.trend-up {
              color: var(--el-color-success);
            }

            &.trend-down {
              color: var(--el-color-danger);
            }
          }
        }
      }
    }

    .analytics-charts {
      margin-bottom: 32px;

      .chart-container {
        background: var(--el-fill-color-lighter);
        border-radius: 12px;
        padding: 20px;

        .chart-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .chart-placeholder {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--el-bg-color);
          border-radius: 8px;
          padding: 16px;

          canvas {
            max-width: 100%;
            height: auto;
          }
        }
      }

      .device-distribution,
      .search-trends,
      .retention-analysis {
        .device-item,
        .search-item,
        .retention-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);

          &:last-child {
            border-bottom: none;
          }
        }

        .device-item {
          .device-icon {
            font-size: 24px;
            width: 40px;
            text-align: center;
          }

          .device-info {
            flex: 1;
            margin-left: 12px;

            .device-name {
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .device-percentage {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }

          .device-progress {
            width: 60px;
            height: 6px;
            background: var(--el-border-color-lighter);
            border-radius: 3px;
            overflow: hidden;

            .progress-bar {
              height: 100%;
              background: var(--el-color-primary);
              transition: width 0.3s ease;
            }
          }
        }

        .search-item {
          .search-rank {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--el-color-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }

          .search-query {
            flex: 1;
            margin-left: 12px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .search-count {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }

        .retention-item {
          .retention-period {
            width: 60px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .retention-rate {
            width: 60px;
            font-weight: 600;
            color: var(--el-color-primary);
            text-align: right;
          }

          .retention-bar {
            flex: 1;
            height: 8px;
            background: var(--el-border-color-lighter);
            border-radius: 4px;
            margin-left: 12px;
            overflow: hidden;

            .retention-fill {
              height: 100%;
              background: linear-gradient(
                90deg,
                var(--el-color-primary) 0%,
                var(--el-color-success) 100%
              );
              transition: width 0.3s ease;
            }
          }
        }
      }
    }

    .events-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .section-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .section-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
      }

      .event-data {
        .data-item {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;

          .data-label {
            font-weight: 500;
            color: var(--el-text-color-secondary);
          }

          .data-value {
            color: var(--el-text-color-primary);
          }
        }
      }
    }

    .event-detail {
      .event-data-json {
        background: var(--el-fill-color-lighter);
        border-radius: 8px;
        padding: 16px;
        font-family: 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', 'Courier New', monospace;
        font-size: 12px;
        overflow-x: auto;
        margin: 0;
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .metrics-overview {
      grid-template-columns: 1fr !important;
    }

    .analytics-charts .el-col {
      margin-bottom: 24px;
    }

    .time-range-selector {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .section-header {
      flex-direction: column !important;
      gap: 16px !important;
      align-items: stretch !important;

      .section-actions {
        justify-content: center !important;
      }
    }
  }
</style>
