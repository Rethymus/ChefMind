<template>
  <div class="analytics-view">
    <div class="analytics-container">
      <!-- 页面头部 -->
      <div class="analytics-header">
        <h1 class="analytics-title">{{ t('analytics.title') }}</h1>
        <p class="analytics-subtitle">{{ t('analytics.subtitle') }}</p>

        <!-- 时间筛选器 -->
        <div class="time-filter">
          <button
            v-for="period in timePeriods"
            :key="period.value"
            :class="['time-button', { active: selectedPeriod === period.value }]"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <div class="analytics-content">
        <!-- 活动概览卡片 -->
        <div class="analytics-card overview-card">
          <h2 class="card-title">
            <span class="card-icon">📊</span>
            {{ t('analytics.activity_overview') }}
          </h2>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">👁️</div>
              <div class="stat-value">{{ formatNumber(userStats.viewedRecipes) }}</div>
              <div class="stat-label">{{ t('analytics.viewed_recipes') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">❤️</div>
              <div class="stat-value">{{ formatNumber(userStats.savedRecipes) }}</div>
              <div class="stat-label">{{ t('analytics.saved_recipes') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">✨</div>
              <div class="stat-value">{{ formatNumber(userStats.generatedRecipes) }}</div>
              <div class="stat-label">{{ t('analytics.generated_recipes') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">🔍</div>
              <div class="stat-value">{{ formatNumber(userStats.searchCount) }}</div>
              <div class="stat-label">{{ t('analytics.searches') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">🖨️</div>
              <div class="stat-value">{{ formatNumber(userStats.printCount) }}</div>
              <div class="stat-label">{{ t('analytics.prints') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">📤</div>
              <div class="stat-value">{{ formatNumber(userStats.shareCount) }}</div>
              <div class="stat-label">{{ t('analytics.shares') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">🛒</div>
              <div class="stat-value">{{ formatNumber(userStats.shoppingListAdds) }}</div>
              <div class="stat-label">{{ t('analytics.shopping_adds') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">{{ formatNumber(userStats.ratingCount) }}</div>
              <div class="stat-label">{{ t('analytics.ratings') }}</div>
            </div>
          </div>
        </div>

        <!-- 活动趋势图表 -->
        <div class="analytics-card trend-card">
          <h2 class="card-title">
            <span class="card-icon">📈</span>
            {{ t('analytics.activity_trend') }}
          </h2>

          <div class="chart-container">
            <canvas ref="activityChart"></canvas>
          </div>
        </div>

        <!-- 烹饪习惯分析 -->
        <div class="analytics-card habits-card">
          <h2 class="card-title">
            <span class="card-icon">🍳</span>
            {{ t('analytics.cooking_habits') }}
          </h2>

          <div class="habits-content">
            <div class="habits-section">
              <h3 class="section-title">{{ t('analytics.favorite_categories') }}</h3>
              <div class="chart-container small">
                <canvas ref="categoriesChart"></canvas>
              </div>
            </div>

            <div class="habits-section">
              <h3 class="section-title">{{ t('analytics.favorite_ingredients') }}</h3>
              <div class="chart-container small">
                <canvas ref="ingredientsChart"></canvas>
              </div>
            </div>

            <div class="habits-section cooking-time-section">
              <h3 class="section-title">{{ t('analytics.cooking_time') }}</h3>
              <div class="cooking-time">
                <div class="time-stat">
                  <div class="time-value">{{ formatTime(userStats.cookingTime.total) }}</div>
                  <div class="time-label">{{ t('analytics.total_time') }}</div>
                </div>

                <div class="time-stat">
                  <div class="time-value">
                    {{ userStats.cookingTime.average }}{{ t('analytics.minutes') }}
                  </div>
                  <div class="time-label">{{ t('analytics.average_time') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门食谱排行 -->
        <div class="analytics-card popular-card">
          <h2 class="card-title">
            <span class="card-icon">🏆</span>
            {{ t('analytics.popular_recipes') }}
          </h2>

          <div class="tabs">
            <button
              v-for="tab in popularTabs"
              :key="tab.id"
              :class="['tab-button', { active: activePopularTab === tab.id }]"
              @click="activePopularTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>

          <div class="popular-list">
            <div v-if="activePopularTab === 'viewed'" class="popular-items">
              <div
                v-for="(recipe, index) in recipeStats.mostViewed"
                :key="recipe.id"
                class="popular-item"
                @click="viewRecipe(recipe.id)"
              >
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-title">{{ recipe.title }}</div>
                <div class="item-value">
                  {{ formatNumber(recipe.count) }}{{ t('analytics.views') }}
                </div>
              </div>
            </div>

            <div v-if="activePopularTab === 'saved'" class="popular-items">
              <div
                v-for="(recipe, index) in recipeStats.mostSaved"
                :key="recipe.id"
                class="popular-item"
                @click="viewRecipe(recipe.id)"
              >
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-title">{{ recipe.title }}</div>
                <div class="item-value">
                  {{ formatNumber(recipe.count) }}{{ t('analytics.saves') }}
                </div>
              </div>
            </div>

            <div v-if="activePopularTab === 'rated'" class="popular-items">
              <div
                v-for="(recipe, index) in recipeStats.mostRated"
                :key="recipe.id"
                class="popular-item"
                @click="viewRecipe(recipe.id)"
              >
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-title">{{ recipe.title }}</div>
                <div class="item-value">⭐ {{ recipe.rating.toFixed(1) }}</div>
              </div>
            </div>

            <div v-if="activePopularTab === 'shared'" class="popular-items">
              <div
                v-for="(recipe, index) in recipeStats.mostShared"
                :key="recipe.id"
                class="popular-item"
                @click="viewRecipe(recipe.id)"
              >
                <div class="item-rank">{{ index + 1 }}</div>
                <div class="item-title">{{ recipe.title }}</div>
                <div class="item-value">
                  {{ formatNumber(recipe.count) }}{{ t('analytics.shares') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 食谱分布统计 -->
        <div class="analytics-card distribution-card">
          <h2 class="card-title">
            <span class="card-icon">📊</span>
            {{ t('analytics.recipe_distribution') }}
          </h2>

          <div class="distribution-content">
            <div class="distribution-section">
              <h3 class="section-title">{{ t('analytics.by_category') }}</h3>
              <div class="chart-container small">
                <canvas ref="categoryDistChart"></canvas>
              </div>
            </div>

            <div class="distribution-section">
              <h3 class="section-title">{{ t('analytics.by_cooking_time') }}</h3>
              <div class="chart-container small">
                <canvas ref="timeDistChart"></canvas>
              </div>
            </div>

            <div class="distribution-section">
              <h3 class="section-title">{{ t('analytics.by_difficulty') }}</h3>
              <div class="chart-container small">
                <canvas ref="difficultyDistChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 趋势与推荐 -->
        <div class="analytics-card trends-card">
          <h2 class="card-title">
            <span class="card-icon">🔥</span>
            {{ t('analytics.trends_recommendations') }}
          </h2>

          <div class="trends-content">
            <div class="trends-section">
              <h3 class="section-title">{{ t('analytics.trending_recipes') }}</h3>
              <div class="trend-items">
                <div
                  v-for="(recipe, index) in trendData.trendingRecipes"
                  :key="recipe.id"
                  class="trend-item"
                  @click="viewRecipe(recipe.id)"
                >
                  <div class="trend-rank">{{ index + 1 }}</div>
                  <div class="trend-title">{{ recipe.title }}</div>
                  <div class="trend-value">
                    <span class="trend-arrow">↗️</span>
                    {{ recipe.trend }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="trends-section">
              <h3 class="section-title">{{ t('analytics.trending_categories') }}</h3>
              <div class="trend-items">
                <div
                  v-for="(category, index) in trendData.trendingCategories"
                  :key="category.category"
                  class="trend-item"
                >
                  <div class="trend-rank">{{ index + 1 }}</div>
                  <div class="trend-title">{{ category.category }}</div>
                  <div class="trend-value">
                    <span class="trend-arrow">↗️</span>
                    {{ category.trend }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="trends-section seasonal-section">
              <h3 class="section-title">{{ t('analytics.seasonal_recipes') }}</h3>
              <div class="seasonal-items">
                <div
                  v-for="recipe in trendData.seasonalRecipes"
                  :key="recipe.id"
                  class="seasonal-item"
                  @click="viewRecipe(recipe.id)"
                >
                  <div class="seasonal-badge">{{ recipe.season }}</div>
                  <div class="seasonal-title">{{ recipe.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 个性化推荐 -->
        <div class="analytics-card recommendations-card">
          <h2 class="card-title">
            <span class="card-icon">🎯</span>
            {{ t('analytics.personalized_recommendations') }}
          </h2>

          <div class="recommendations-list">
            <div
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="recommendation-item"
              @click="viewRecipe(recommendation.id)"
            >
              <div class="recommendation-image">
                <img
                  :src="recommendation.image || '/images/default-recipe.jpg'"
                  :alt="recommendation.title"
                />
              </div>
              <div class="recommendation-info">
                <h3 class="recommendation-title">{{ recommendation.title }}</h3>
                <p class="recommendation-reason">{{ recommendation.reason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { analyticsService } from '@/services/analyticsService'
  import { useI18n } from '@/composables/useI18n'
  import Chart from 'chart.js/auto'

  // 国际化
  const { t } = useI18n()

  // 路由
  const router = useRouter()

  // 图表引用
  const activityChart = ref<HTMLCanvasElement | null>(null)
  const categoriesChart = ref<HTMLCanvasElement | null>(null)
  const ingredientsChart = ref<HTMLCanvasElement | null>(null)
  const categoryDistChart = ref<HTMLCanvasElement | null>(null)
  const timeDistChart = ref<HTMLCanvasElement | null>(null)
  const difficultyDistChart = ref<HTMLCanvasElement | null>(null)

  // 图表实例
  let activityChartInstance: Chart | null = null
  let categoriesChartInstance: Chart | null = null
  let ingredientsChartInstance: Chart | null = null
  // Chart instances for cleanup
  let categoryDistChartInstance: Chart | null = null
  let timeDistChartInstance: Chart | null = null
  let difficultyDistChartInstance: Chart | null = null

  // 状态
  const selectedPeriod = ref(30)
  const activePopularTab = ref('viewed')
  const userStats = ref(analyticsService.getUserStats(30))
  const recipeStats = ref(analyticsService.getRecipeStats())
  const trendData = ref(analyticsService.getTrendData())
  const recommendations = ref(analyticsService.getPersonalizedRecommendations('1'))

  // 工具函数
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}${t('analytics.hours')}${minutes}${t('analytics.minutes')}`
    }
    return `${minutes}${t('analytics.minutes')}`
  }

  // 时间周期选项
  const timePeriods = [
    { value: 7, label: t('analytics.last_7_days') },
    { value: 30, label: t('analytics.last_30_days') },
    { value: 90, label: t('analytics.last_90_days') },
    { value: 365, label: t('analytics.last_year') },
  ]

  // 热门食谱标签页
  const popularTabs = [
    { id: 'viewed', name: t('analytics.most_viewed') },
    { id: 'saved', name: t('analytics.most_saved') },
    { id: 'rated', name: t('analytics.highest_rated') },
    { id: 'shared', name: t('analytics.most_shared') },
  ]

  // 监听时间周期变化
  watch(selectedPeriod, newPeriod => {
    userStats.value = analyticsService.getUserStats(newPeriod)
    updateCharts()
  })

  // 生命周期钩子
  onMounted(() => {
    initCharts()
  })

  // 初始化图表
  const initCharts = () => {
    // 活动趋势图表
    if (activityChart.value) {
      const ctx = activityChart.value.getContext('2d')
      if (ctx) {
        activityChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: generateDateLabels(selectedPeriod.value),
            datasets: [
              {
                label: t('analytics.daily_activity'),
                data: generateActivityData(selectedPeriod.value),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }

    // 喜爱分类图表
    if (categoriesChart.value) {
      const ctx = categoriesChart.value.getContext('2d')
      if (ctx) {
        categoriesChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: userStats.value.favoriteCategories.map(item => item.category),
            datasets: [
              {
                data: userStats.value.favoriteCategories.map(item => item.count),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 10,
                  },
                },
              },
            },
          },
        })
      }
    }

    // 喜爱食材图表
    if (ingredientsChart.value) {
      const ctx = ingredientsChart.value.getContext('2d')
      if (ctx) {
        ingredientsChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: userStats.value.favoriteIngredients.map(item => item.ingredient),
            datasets: [
              {
                data: userStats.value.favoriteIngredients.map(item => item.count),
                backgroundColor: [
                  'rgba(255, 159, 64, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 99, 132, 0.7)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 10,
                  },
                },
              },
            },
          },
        })
      }
    }

    // 分类分布图表
    if (categoryDistChart.value) {
      const ctx = categoryDistChart.value.getContext('2d')
      if (ctx) {
        categoryDistChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: recipeStats.value.categoryDistribution.map(item => item.category),
            datasets: [
              {
                label: t('analytics.recipes'),
                data: recipeStats.value.categoryDistribution.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }

    // 烹饪时间分布图表
    if (timeDistChart.value) {
      const ctx = timeDistChart.value.getContext('2d')
      if (ctx) {
        timeDistChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: recipeStats.value.cookingTimeDistribution.map(item => item.range),
            datasets: [
              {
                label: t('analytics.recipes'),
                data: recipeStats.value.cookingTimeDistribution.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }

    // 难度分布图表
    if (difficultyDistChart.value) {
      const ctx = difficultyDistChart.value.getContext('2d')
      if (ctx) {
        difficultyDistChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: recipeStats.value.difficultyDistribution.map(item => item.level),
            datasets: [
              {
                label: t('analytics.recipes'),
                data: recipeStats.value.difficultyDistribution.map(item => item.count),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }
  }

  // 更新图表
  const updateCharts = () => {
    if (activityChartInstance) {
      activityChartInstance.data.labels = generateDateLabels(selectedPeriod.value)
      activityChartInstance.data.datasets[0].data = generateActivityData(selectedPeriod.value)
      activityChartInstance.update()
    }

    if (categoriesChartInstance) {
      categoriesChartInstance.data.labels = userStats.value.favoriteCategories.map(
        item => item.category
      )
      categoriesChartInstance.data.datasets[0].data = userStats.value.favoriteCategories.map(
        item => item.count
      )
      categoriesChartInstance.update()
    }

    if (ingredientsChartInstance) {
      ingredientsChartInstance.data.labels = userStats.value.favoriteIngredients.map(
        item => item.ingredient
      )
      ingredientsChartInstance.data.datasets[0].data = userStats.value.favoriteIngredients.map(
        item => item.count
      )
      ingredientsChartInstance.update()
    }
  }

  // 生成日期标签
  const generateDateLabels = (days: number) => {
    const labels = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      labels.push(formatDate(date))
    }

    return labels
  }

  // 生成活动数据
  const generateActivityData = (days: number) => {
    const data = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      data.push(userStats.value.activityByDay[dayKey] || 0)
    }

    return data
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 查看食谱
  const viewRecipe = (recipeId: string) => {
    router.push({
      path: '/recipe-detail',
      query: { id: recipeId },
    })
  }
</script>

<style lang="scss" scoped>
  .analytics-view {
    padding: 2rem 1rem;
    background-color: var(--bg-color);
    min-height: 100vh;
  }

  .analytics-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .analytics-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .analytics-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--heading-color);
    margin: 0 0 0.5rem 0;
  }

  .analytics-subtitle {
    font-size: 1.1rem;
    color: var(--text-color-secondary);
    margin: 0 0 1.5rem 0;
  }

  .time-filter {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .time-button {
    padding: 0.5rem 1rem;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    &.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }

  .analytics-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }

  .analytics-card {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    &.overview-card {
      grid-column: span 2;

      @media (max-width: 992px) {
        grid-column: span 1;
      }
    }

    &.trend-card {
      grid-column: span 2;

      @media (max-width: 992px) {
        grid-column: span 1;
      }
    }

    &.recommendations-card {
      grid-column: span 2;

      @media (max-width: 992px) {
        grid-column: span 1;
      }
    }
  }

  .card-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat-item {
    text-align: center;
    padding: 1rem;
    background-color: var(--bg-color);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }
  }

  .chart-container {
    height: 300px;
    position: relative;

    &.small {
      height: 200px;
    }
  }

  .habits-content,
  .distribution-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .habits-section,
    .distribution-section {
      &:last-child {
        grid-column: span 2;

        @media (max-width: 768px) {
          grid-column: span 1;
        }
      }
    }
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }

  .cooking-time {
    display: flex;
    justify-content: space-around;
    padding: 2rem 0;

    .time-stat {
      text-align: center;

      .time-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--heading-color);
        margin-bottom: 0.5rem;
      }

      .time-label {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
      }
    }
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.5rem;
    overflow-x: auto;

    .tab-button {
      padding: 0.8rem 1.5rem;
      background: none;
      border: none;
      font-size: 1rem;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;

      &:hover {
        color: var(--primary-color);
      }

      &.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
        font-weight: 600;
      }
    }
  }

  .popular-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .popular-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    background-color: var(--bg-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    .item-rank {
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--primary-color);
      color: white;
      border-radius: 50%;
      font-weight: 600;
      margin-right: 1rem;
    }

    .item-title {
      flex: 1;
      font-weight: 500;
      color: var(--text-color);
    }

    .item-value {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      white-space: nowrap;
    }
  }

  .trends-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .trends-section {
      &:last-child {
        grid-column: span 2;

        @media (max-width: 768px) {
          grid-column: span 1;
        }
      }
    }
  }

  .trend-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .trend-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    background-color: var(--bg-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    .trend-rank {
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--primary-color);
      color: white;
      border-radius: 50%;
      font-weight: 600;
      margin-right: 1rem;
    }

    .trend-title {
      flex: 1;
      font-weight: 500;
      color: var(--text-color);
    }

    .trend-value {
      font-size: 0.9rem;
      color: #52c41a;
      white-space: nowrap;
      font-weight: 600;

      .trend-arrow {
        margin-right: 0.25rem;
      }
    }
  }

  .seasonal-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .seasonal-item {
    padding: 1rem;
    background-color: var(--bg-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      background-color: var(--hover-color);
    }

    .seasonal-badge {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.25rem 0.5rem;
      background-color: var(--primary-color);
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      border-bottom-left-radius: 8px;
    }

    .seasonal-title {
      font-weight: 500;
      color: var(--text-color);
      margin-top: 0.5rem;
    }
  }

  .recommendations-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;

    @media (max-width: 576px) {
      grid-template-columns: 1fr;
    }
  }

  .recommendation-item {
    background-color: var(--bg-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .recommendation-image {
      height: 180px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.5s ease;
      }
    }

    &:hover .recommendation-image img {
      transform: scale(1.05);
    }

    .recommendation-info {
      padding: 1rem;
    }

    .recommendation-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--heading-color);
      margin: 0 0 0.5rem 0;
    }

    .recommendation-reason {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      margin: 0;
    }
  }
</style>
