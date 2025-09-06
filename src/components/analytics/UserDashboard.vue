<template>
  <div class="user-dashboard">
    <div class="dashboard-header">
      <h2 class="dashboard-title">用户仪表板</h2>
      <router-link to="/analytics" class="view-all-link">
        查看全部 →
      </router-link>
    </div>
    
    <div class="dashboard-content">
      <!-- 活动概览 -->
      <div class="dashboard-card activity-card">
        <h3 class="card-title">活动概览</h3>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">👁️</div>
            <div class="stat-value">{{ userStats.viewedRecipes }}</div>
            <div class="stat-label">浏览</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">❤️</div>
            <div class="stat-value">{{ userStats.savedRecipes }}</div>
            <div class="stat-label">收藏</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">✨</div>
            <div class="stat-value">{{ userStats.generatedRecipes }}</div>
            <div class="stat-label">生成</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">{{ userStats.cookingTime.average }}</div>
            <div class="stat-label">平均时间</div>
          </div>
        </div>
      </div>
      
      <!-- 趋势食谱 -->
      <div class="dashboard-card trending-card">
        <h3 class="card-title">热门食谱</h3>
        
        <div class="trending-list">
          <div 
            v-for="(recipe, index) in trendingRecipes" 
            :key="recipe.id"
            class="trending-item"
            @click="viewRecipe(recipe.id)"
          >
            <div class="trending-rank">{{ index + 1 }}</div>
            <div class="trending-title">{{ recipe.title }}</div>
            <div class="trending-value">
              <span class="trending-arrow">↑</span>
              {{ recipe.trend }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- 个性化推荐 -->
      <div class="dashboard-card recommendations-card">
        <h3 class="card-title">为您推荐</h3>
        
        <div class="recommendations-list">
          <div 
            v-for="recommendation in recommendations" 
            :key="recommendation.id"
            class="recommendation-item"
            @click="viewRecipe(recommendation.id)"
          >
            <div class="recommendation-image">
              <img :src="recommendation.image" :alt="recommendation.title">
            </div>
            <div class="recommendation-info">
              <h4 class="recommendation-title">{{ recommendation.title }}</h4>
              <p class="recommendation-reason">{{ recommendation.reason }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 活动图表 -->
      <div class="dashboard-card chart-card">
        <h3 class="card-title">活动趋势</h3>
        
        <div class="chart-container">
          <canvas ref="activityChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analyticsService } from '@/services/analyticsService'
import Chart from 'chart.js/auto'

// 路由
const router = useRouter()

// 图表引用
const activityChart = ref<HTMLCanvasElement | null>(null)

// 状态
const userStats = ref(analyticsService.getUserStats(7))
const trendingRecipes = ref(analyticsService.getTrendData().trendingRecipes)
const recommendations = ref(analyticsService.getPersonalizedRecommendations('1', 2))

// 生命周期钩子
onMounted(() => {
  initActivityChart()
})

// 初始化活动图表
const initActivityChart = () => {
  if (activityChart.value) {
    const ctx = activityChart.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: generateDateLabels(7),
          datasets: [{
            label: '每日活动',
            data: generateActivityData(7),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
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
    query: { id: recipeId }
  })
}
</script>

<style lang="scss" scoped>
.user-dashboard {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.dashboard-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.view-all-link {
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-color-dark);
    text-decoration: underline;
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.dashboard-card {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &.recommendations-card,
  &.chart-card {
    grid-column: span 2;
    
    @media (max-width: 768px) {
      grid-column: span 1;
    }
  }
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--heading-color);
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trending-item {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  background-color: var(--bg-color-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  .trending-rank {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.8rem;
    margin-right: 0.75rem;
  }
  
  .trending-title {
    flex: 1;
    font-weight: 500;
    color: var(--text-color);
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .trending-value {
    font-size: 0.8rem;
    color: #52c41a;
    white-space: nowrap;
    font-weight: 600;
    
    .trending-arrow {
      margin-right: 0.25rem;
    }
  }
}

.recommendations-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.recommendation-item {
  display: flex;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  .recommendation-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .recommendation-info {
    padding: 0.75rem;
    flex: 1;
    min-width: 0;
  }
  
  .recommendation-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.25rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .recommendation-reason {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.chart-container {
  height: 200px;
  position: relative;
}
</style>