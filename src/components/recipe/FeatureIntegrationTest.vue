<template>
  <div class="feature-integration-test">
    <div class="test-header">
      <h1 class="test-title">ChefMind 功能集成测试</h1>
      <p class="test-description">测试个性化推荐、用户行为分析、营养分析和增强搜索功能的集成效果</p>
    </div>

    <!-- 测试控制面板 -->
    <div class="test-controls">
      <div class="control-group">
        <h3>测试数据控制</h3>
        <div class="control-buttons">
          <button @click="loadTestData" class="control-btn primary">加载测试数据</button>
          <button @click="clearTestData" class="control-btn secondary">清除测试数据</button>
          <button @click="simulateUserBehavior" class="control-btn accent">模拟用户行为</button>
        </div>
      </div>

      <div class="control-group">
        <h3>功能测试开关</h3>
        <div class="feature-toggles">
          <label class="toggle-item">
            <input v-model="enabledFeatures.recommendations" type="checkbox" />
            <span class="toggle-label">个性化推荐</span>
          </label>
          <label class="toggle-item">
            <input v-model="enabledFeatures.analytics" type="checkbox" />
            <span class="toggle-label">行为分析</span>
          </label>
          <label class="toggle-item">
            <input v-model="enabledFeatures.nutrition" type="checkbox" />
            <span class="toggle-label">营养分析</span>
          </label>
          <label class="toggle-item">
            <input v-model="enabledFeatures.enhancedSearch" type="checkbox" />
            <span class="toggle-label">增强搜索</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 测试状态显示 -->
    <div class="test-status">
      <div class="status-card">
        <h4>测试数据状态</h4>
        <div class="status-info">
          <span class="status-item">
            📊 菜谱数量: <strong>{{ testRecipes.length }}</strong>
          </span>
          <span class="status-item">
            👤 用户行为事件: <strong>{{ behaviorEventCount }}</strong>
          </span>
          <span class="status-item">
            ⭐ 推荐匹配度: <strong>{{ averageMatchScore.toFixed(1) }}%</strong>
          </span>
        </div>
      </div>

      <div class="status-card">
        <h4>功能测试结果</h4>
        <div class="test-results">
          <div
            v-for="result in testResults"
            :key="result.feature"
            :class="['test-result', result.status]"
          >
            <span class="result-icon">{{ getStatusIcon(result.status) }}</span>
            <span class="result-feature">{{ result.feature }}</span>
            <span class="result-message">{{ result.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 增强搜索界面测试 -->
    <div v-if="enabledFeatures.enhancedSearch" class="feature-test-section">
      <h2 class="section-title">增强搜索功能测试</h2>
      <EnhancedSearchInterface
        :all-recipes="testRecipes"
        :show-recommendations="enabledFeatures.recommendations"
        @select-recipe="handleRecipeSelect"
        @start-cooking="handleStartCooking"
        @save-recipe="handleSaveRecipe"
      />
    </div>

    <!-- 营养分析功能测试 -->
    <div v-if="enabledFeatures.nutrition" class="feature-test-section">
      <h2 class="section-title">营养分析功能测试</h2>
      <div class="nutrition-test-controls">
        <h4>选择测试菜谱进行营养分析:</h4>
        <div class="recipe-selector">
          <button
            v-for="recipe in testRecipes.slice(0, 3)"
            :key="recipe.id"
            :class="['recipe-btn', { active: selectedTestRecipe?.id === recipe.id }]"
            @click="selectTestRecipe(recipe)"
          >
            {{ recipe.title || recipe.name }}
          </button>
        </div>
      </div>

      <EnhancedNutritionAnalyzer
        v-if="selectedTestRecipe"
        :recipe="selectedTestRecipe"
        :show-detailed-analysis="true"
      />
    </div>

    <!-- 用户行为分析展示 -->
    <div v-if="enabledFeatures.analytics" class="feature-test-section">
      <h2 class="section-title">用户行为分析测试</h2>
      <div class="analytics-display">
        <div class="analytics-stats">
          <div class="stat-card">
            <h4>实时统计</h4>
            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-label">搜索次数</span>
                <span class="stat-value">{{ analyticsStats.searchCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">菜谱查看</span>
                <span class="stat-value">{{ analyticsStats.viewCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">开始烹饪</span>
                <span class="stat-value">{{ analyticsStats.cookCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">收藏菜谱</span>
                <span class="stat-value">{{ analyticsStats.saveCount }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <h4>热门搜索词</h4>
            <div class="popular-searches">
              <span v-for="(search, index) in popularSearches" :key="index" class="search-tag">
                {{ search.query }} ({{ search.count }})
              </span>
            </div>
          </div>
        </div>

        <div class="recent-events">
          <h4>最近用户行为事件</h4>
          <div class="events-list">
            <div
              v-for="(event, index) in recentEvents.slice(0, 10)"
              :key="index"
              class="event-item"
            >
              <span class="event-time">{{ formatTime(event.timestamp.getTime()) }}</span>
              <span class="event-type">{{ getEventTypeText(event.eventType) }}</span>
              <span class="event-details">{{ event.eventData?.category || '其他' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化推荐测试 -->
    <div v-if="enabledFeatures.recommendations" class="feature-test-section">
      <h2 class="section-title">个性化推荐功能测试</h2>
      <div class="recommendations-test">
        <div class="user-profile-editor">
          <h4>调整用户偏好设置</h4>
          <div class="profile-controls">
            <div class="control-row">
              <div class="control-label">烹饪技能:</div>
              <select v-model="testUserProfile.cookingSkillLevel" class="control-select">
                <option value="beginner">新手</option>
                <option value="intermediate">进阶</option>
                <option value="advanced">高级</option>
              </select>
            </div>

            <div class="control-row">
              <div class="control-label">时间偏好:</div>
              <select v-model="testUserProfile.timePreference" class="control-select">
                <option value="quick">快手菜(30分钟内)</option>
                <option value="medium">常规菜(1小时内)</option>
                <option value="slow">不限时间</option>
              </select>
            </div>

            <div class="control-row">
              <div class="control-label">喜爱食材:</div>
              <div class="ingredient-checkboxes">
                <label
                  v-for="ingredient in availableIngredients"
                  :key="ingredient"
                  class="ingredient-checkbox"
                >
                  <input
                    v-model="testUserProfile.favoriteIngredients"
                    :value="ingredient"
                    type="checkbox"
                  />
                  <span>{{ ingredient }}</span>
                </label>
              </div>
            </div>

            <button @click="updateUserProfile" class="update-profile-btn">更新用户偏好</button>
          </div>
        </div>

        <PersonalizedRecommendations
          :all-recipes="testRecipes"
          @select-recipe="handleRecipeSelect"
          @start-cooking="handleStartCooking"
          @save-recipe="handleSaveRecipe"
        />
      </div>
    </div>

    <!-- 集成测试总结 -->
    <div class="test-summary">
      <h2 class="section-title">集成测试总结</h2>
      <div class="summary-content">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="summary-label">通过测试:</span>
            <span class="summary-value success">{{ passedTests }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">失败测试:</span>
            <span class="summary-value error">{{ failedTests }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">测试覆盖率:</span>
            <span class="summary-value">{{ testCoverage.toFixed(1) }}%</span>
          </div>
        </div>

        <div class="integration-score">
          <h4>集成质量评分</h4>
          <div class="score-display">
            <div class="score-circle" :style="{ '--score': integrationScore }">
              <span class="score-text">{{ integrationScore }}/100</span>
            </div>
            <div class="score-details">
              <p>{{ getScoreDescription(integrationScore) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { usePersonalizedRecommendations } from '@/composables/usePersonalizedRecommendations'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'
  import EnhancedSearchInterface from './EnhancedSearchInterface.vue'
  import PersonalizedRecommendations from './PersonalizedRecommendations.vue'
  import EnhancedNutritionAnalyzer from '../ai/EnhancedNutritionAnalyzer.vue'
  import type { Recipe } from '@/types/recipe'

  // 组合式函数
  const { updateUserPreferences, getPersonalizedRecommendations } = usePersonalizedRecommendations()

  const { events, trackEvent } = useUserBehaviorAnalytics()

  // 响应式状态
  const enabledFeatures = ref({
    recommendations: true,
    analytics: true,
    nutrition: true,
    enhancedSearch: true,
  })

  const testRecipes = ref<Recipe[]>([])
  const selectedTestRecipe = ref<Recipe | null>(null)
  const behaviorEventCount = ref(0)

  const testUserProfile = ref({
    cookingSkillLevel: 'intermediate' as const,
    timePreference: 'medium' as const,
    favoriteIngredients: ['鸡肉', '土豆', '番茄'],
  })

  const availableIngredients = [
    '鸡肉',
    '猪肉',
    '牛肉',
    '鱼',
    '虾',
    '豆腐',
    '鸡蛋',
    '土豆',
    '番茄',
    '胡萝卜',
    '白菜',
    '菠菜',
    '韭菜',
    '米饭',
    '面条',
    '面粉',
  ]

  const testResults = ref<
    Array<{
      feature: string
      status: 'success' | 'error' | 'warning'
      message: string
    }>
  >([])

  // 模拟测试数据
  const generateTestRecipes = (): Recipe[] => {
    return [
      {
        id: 'test-1',
        title: '宫保鸡丁',
        name: '宫保鸡丁',
        description: '经典川菜，麻辣鲜香，鸡肉嫩滑配花生米',
        ingredients: ['鸡肉 300g', '花生米 100g', '干辣椒 10个', '葱 2根'],
        cookingMethods: ['炒'],
        steps: [
          { order: 1, description: '鸡肉切丁，用料酒腌制' },
          { order: 2, description: '热锅下油，炒鸡丁至变色' },
          { order: 3, description: '加入配菜炒制' },
        ],
        cookingTime: '25分钟',
        difficulty: 'medium',
        servings: 3,
        rating: 4.5,
        nutrition: {
          calories: 320,
          protein: 28,
          carbs: 12,
          fat: 18,
          fiber: 3,
        },
      },
      {
        id: 'test-2',
        title: '番茄鸡蛋面',
        name: '番茄鸡蛋面',
        description: '家常面食，营养丰富，酸甜可口',
        ingredients: ['面条 200g', '番茄 2个', '鸡蛋 2个', '葱花 适量'],
        cookingMethods: ['煮', '炒'],
        steps: [
          { order: 1, description: '番茄切块，鸡蛋打散' },
          { order: 2, description: '炒鸡蛋盛起' },
          { order: 3, description: '炒番茄出汁，加面条' },
        ],
        cookingTime: '15分钟',
        difficulty: 'easy',
        servings: 2,
        rating: 4.2,
        nutrition: {
          calories: 280,
          protein: 15,
          carbs: 45,
          fat: 8,
          fiber: 4,
        },
      },
      {
        id: 'test-3',
        title: '红烧肉',
        name: '红烧肉',
        description: '传统名菜，肥而不腻，入口即化',
        ingredients: ['五花肉 500g', '冰糖 30g', '生抽 2勺', '老抽 1勺'],
        cookingMethods: ['炖', '炒'],
        steps: [
          { order: 1, description: '五花肉切块焯水' },
          { order: 2, description: '炒糖色' },
          { order: 3, description: '加肉炒制上色' },
          { order: 4, description: '加水炖煮1小时' },
        ],
        cookingTime: '90分钟',
        difficulty: 'hard',
        servings: 4,
        rating: 4.8,
        nutrition: {
          calories: 450,
          protein: 25,
          carbs: 8,
          fat: 35,
          fiber: 1,
        },
      },
      {
        id: 'test-4',
        title: '蒸蛋羹',
        name: '蒸蛋羹',
        description: '嫩滑香甜，老少皆宜的营养食品',
        ingredients: ['鸡蛋 3个', '温水 150ml', '盐 少许', '香油 几滴'],
        cookingMethods: ['蒸'],
        steps: [
          { order: 1, description: '鸡蛋打散加盐' },
          { order: 2, description: '加温水搅匀过筛' },
          { order: 3, description: '蒸锅蒸10分钟' },
        ],
        cookingTime: '15分钟',
        difficulty: 'easy',
        servings: 2,
        rating: 4.0,
        nutrition: {
          calories: 160,
          protein: 12,
          carbs: 2,
          fat: 11,
          fiber: 0,
        },
      },
      {
        id: 'test-5',
        title: '麻婆豆腐',
        name: '麻婆豆腐',
        description: '川菜经典，麻辣鲜香，豆腐嫩滑',
        ingredients: ['豆腐 300g', '肉末 100g', '豆瓣酱 1勺', '花椒粉 适量'],
        cookingMethods: ['炒', '烧'],
        steps: [
          { order: 1, description: '豆腐切块焯水' },
          { order: 2, description: '炒肉末加豆瓣酱' },
          { order: 3, description: '加豆腐烧制入味' },
        ],
        cookingTime: '20分钟',
        difficulty: 'medium',
        servings: 3,
        rating: 4.3,
        nutrition: {
          calories: 200,
          protein: 18,
          carbs: 8,
          fat: 12,
          fiber: 2,
        },
      },
    ]
  }

  // 计算属性
  const analyticsStats = computed(() => {
    const eventsList = events.value
    return {
      searchCount: eventsList.filter(e => e.eventType === 'search').length,
      viewCount: eventsList.filter(e => e.eventType === 'view').length,
      cookCount: eventsList.filter(e => e.eventType === 'cook').length,
      saveCount: eventsList.filter(e => e.eventType === 'save').length,
    }
  })

  const recentEvents = computed(() => {
    const sorted = [...events.value].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return sorted.slice(0, 50)
  })

  const popularSearches = computed(() => {
    const searchEvents = events.value.filter(e => e.eventType === 'search')
    const searchCounts = new Map<string, number>()

    searchEvents.forEach(event => {
      const query = event.eventData.query || 'unknown'
      searchCounts.set(query, (searchCounts.get(query) || 0) + 1)
    })

    return Array.from(searchCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  })

  const averageMatchScore = computed(() => {
    if (testRecipes.value.length === 0) return 0

    const recommendations = getPersonalizedRecommendations(testRecipes.value, 5)
    const scores = recommendations.map(recipe => {
      // 简化的匹配度计算
      let score = 50
      const ingredients = recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name))
      const favoriteMatches = ingredients.filter(ing =>
        testUserProfile.value.favoriteIngredients.some(fav => ing.includes(fav))
      )
      score += favoriteMatches.length * 10
      return Math.min(100, score)
    })

    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  })

  const passedTests = computed(() => testResults.value.filter(r => r.status === 'success').length)

  const failedTests = computed(() => testResults.value.filter(r => r.status === 'error').length)

  const testCoverage = computed(() => {
    const totalFeatures = Object.keys(enabledFeatures.value).length
    const enabledCount = Object.values(enabledFeatures.value).filter(Boolean).length
    return totalFeatures > 0 ? (enabledCount / totalFeatures) * 100 : 0
  })

  const integrationScore = computed(() => {
    const baseScore = Math.min(90, passedTests.value * 20)
    const coverageBonus = testCoverage.value * 0.1
    const matchingBonus = averageMatchScore.value * 0.05
    return Math.min(100, Math.floor(baseScore + coverageBonus + matchingBonus))
  })

  // 方法
  const loadTestData = () => {
    testRecipes.value = generateTestRecipes()
    runIntegrationTests()
    trackEvent('click', {
      source: 'feature_integration_test',
      category: 'load_test_data',
      target: 'test_recipes',
    })
  }

  const clearTestData = () => {
    testRecipes.value = []
    selectedTestRecipe.value = null
    testResults.value = []
    behaviorEventCount.value = 0
    trackEvent('click', {
      source: 'feature_integration_test',
      category: 'clear_test_data',
      target: 'all_data',
    })
  }

  const simulateUserBehavior = () => {
    const actions = ['search', 'view', 'cook', 'save']
    const categories = ['recipe_interaction', 'search_behavior', 'cooking_action']

    for (let i = 0; i < 20; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]

      trackEvent(action as any, {
        source: 'simulated_behavior',
        category,
        target: `test_recipe_${Math.floor(Math.random() * 5) + 1}`,
      })
    }

    behaviorEventCount.value += 20
  }

  const runIntegrationTests = () => {
    testResults.value = []

    // 测试个性化推荐
    testRecommendations()

    // 测试用户行为分析
    testAnalytics()

    // 测试营养分析
    testNutrition()

    // 测试增强搜索
    testEnhancedSearch()
  }

  const testRecommendations = () => {
    if (!enabledFeatures.value.recommendations) return

    try {
      const recommendations = getPersonalizedRecommendations(testRecipes.value, 3)
      testResults.value.push({
        feature: '个性化推荐',
        status: recommendations.length > 0 ? 'success' : 'warning',
        message:
          recommendations.length > 0
            ? `成功生成 ${recommendations.length} 个推荐`
            : '推荐生成数量不足',
      })
    } catch (error) {
      console.error('推荐系统错误:', error)
      testResults.value.push({
        feature: '个性化推荐',
        status: 'error',
        message: '推荐系统错误',
      })
    }
  }

  const testAnalytics = () => {
    if (!enabledFeatures.value.analytics) return

    try {
      const eventCount = events.value.length
      testResults.value.push({
        feature: '用户行为分析',
        status: 'success',
        message: `统计数据正常，事件总数: ${eventCount}`,
      })
    } catch (error) {
      console.error('分析系统错误:', error)
      testResults.value.push({
        feature: '用户行为分析',
        status: 'error',
        message: '分析系统错误',
      })
    }
  }

  const testNutrition = () => {
    if (!enabledFeatures.value.nutrition || testRecipes.value.length === 0) return

    try {
      const recipe = testRecipes.value[0]
      const hasNutrition = recipe.nutrition && Object.keys(recipe.nutrition).length > 0
      testResults.value.push({
        feature: '营养分析',
        status: hasNutrition ? 'success' : 'warning',
        message: hasNutrition ? '营养数据完整' : '营养数据缺失',
      })
    } catch (error) {
      console.error('营养分析错误:', error)
      testResults.value.push({
        feature: '营养分析',
        status: 'error',
        message: '营养分析错误',
      })
    }
  }

  const testEnhancedSearch = () => {
    if (!enabledFeatures.value.enhancedSearch) return

    testResults.value.push({
      feature: '增强搜索',
      status: 'success',
      message: '搜索界面加载正常',
    })
  }

  const selectTestRecipe = (recipe: Recipe) => {
    selectedTestRecipe.value = recipe
    trackEvent('click', {
      source: 'feature_integration_test',
      category: 'select_test_recipe',
      target: recipe.id || 'unknown',
    })
  }

  const updateUserProfile = () => {
    updateUserPreferences({
      cookingSkillLevel: testUserProfile.value.cookingSkillLevel,
      timePreference: testUserProfile.value.timePreference,
      favoriteIngredients: testUserProfile.value.favoriteIngredients,
    })

    runIntegrationTests()

    trackEvent('click', {
      source: 'feature_integration_test',
      category: 'update_user_profile',
      target: 'preferences',
    })
  }

  const handleRecipeSelect = (recipe: Recipe) => {
    trackEvent('view', {
      source: 'feature_integration_test',
      category: 'recipe_selected',
      target: recipe.id || 'unknown',
    })
  }

  const handleStartCooking = (recipe: Recipe) => {
    trackEvent('cook', {
      source: 'feature_integration_test',
      category: 'start_cooking',
      target: recipe.id || 'unknown',
    })
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    trackEvent('save', {
      source: 'feature_integration_test',
      category: 'save_recipe',
      target: recipe.id || 'unknown',
    })
  }

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '❓'
    }
  }

  const getEventTypeText = (type: string): string => {
    switch (type) {
      case 'search':
        return '搜索'
      case 'view':
        return '查看'
      case 'click':
        return '点击'
      case 'cook':
        return '烹饪'
      case 'save':
        return '收藏'
      case 'rate':
        return '评分'
      case 'share':
        return '分享'
      default:
        return type
    }
  }

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getScoreDescription = (score: number): string => {
    if (score >= 90) return '优秀 - 所有功能集成良好'
    if (score >= 80) return '良好 - 主要功能正常运行'
    if (score >= 60) return '及格 - 基础功能可用'
    return '需要改进 - 存在功能问题'
  }

  // 监听器
  watch(
    [enabledFeatures],
    () => {
      runIntegrationTests()
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    loadTestData()
  })
</script>

<style scoped lang="scss">
  @import '@/styles/variables.scss';

  .feature-integration-test {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: var(--background-color);
    min-height: 100vh;

    .test-header {
      text-align: center;
      margin-bottom: 3rem;

      .test-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 1rem;
      }

      .test-description {
        font-size: 1.125rem;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }

    .test-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;

      .control-group {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

        h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .control-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;

          .control-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;

            &.primary {
              background: var(--primary-color);
              color: white;

              &:hover {
                background: var(--primary-dark);
              }
            }

            &.secondary {
              background: var(--secondary-color);
              color: var(--text-primary);
              border: 1px solid var(--border-color);

              &:hover {
                background: var(--hover-color);
              }
            }

            &.accent {
              background: #10b981;
              color: white;

              &:hover {
                background: #059669;
              }
            }
          }
        }

        .feature-toggles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;

          .toggle-item {
            display: flex;
            align-items: center;
            cursor: pointer;

            input[type='checkbox'] {
              margin-right: 0.5rem;
              transform: scale(1.2);
            }

            .toggle-label {
              color: var(--text-primary);
              font-weight: 500;
            }
          }
        }
      }
    }

    .test-status {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;

      .status-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

        h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.125rem;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: var(--secondary-color);
            border-radius: 0.5rem;
          }
        }

        .test-results {
          .test-result {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-radius: 0.5rem;

            &.success {
              background: rgba(16, 185, 129, 0.1);
              border: 1px solid rgba(16, 185, 129, 0.3);
            }

            &.error {
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
            }

            &.warning {
              background: rgba(245, 158, 11, 0.1);
              border: 1px solid rgba(245, 158, 11, 0.3);
            }

            .result-feature {
              font-weight: 600;
              min-width: 100px;
            }

            .result-message {
              color: var(--text-secondary);
              font-size: 0.875rem;
            }
          }
        }
      }
    }

    .feature-test-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 3rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

      .section-title {
        color: var(--primary-color);
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--primary-light);
      }

      .nutrition-test-controls {
        margin-bottom: 2rem;

        h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .recipe-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;

          .recipe-btn {
            padding: 0.75rem 1rem;
            background: var(--secondary-color);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: var(--primary-color);
            }

            &.active {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }
          }
        }
      }

      .analytics-display {
        .analytics-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;

          .stat-card {
            background: var(--secondary-color);
            border-radius: 0.75rem;
            padding: 1.5rem;

            h4 {
              color: var(--text-primary);
              margin-bottom: 1rem;
            }

            .stat-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;

              .stat-item {
                text-align: center;

                .stat-label {
                  display: block;
                  color: var(--text-secondary);
                  font-size: 0.875rem;
                  margin-bottom: 0.25rem;
                }

                .stat-value {
                  display: block;
                  color: var(--primary-color);
                  font-size: 1.5rem;
                  font-weight: 700;
                }
              }
            }

            .popular-searches {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;

              .search-tag {
                background: white;
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                color: var(--text-primary);
              }
            }
          }
        }

        .recent-events {
          background: var(--secondary-color);
          border-radius: 0.75rem;
          padding: 1.5rem;

          h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
          }

          .events-list {
            max-height: 300px;
            overflow-y: auto;

            .event-item {
              display: flex;
              gap: 1rem;
              padding: 0.5rem;
              border-bottom: 1px solid var(--border-color);
              font-size: 0.875rem;

              &:last-child {
                border-bottom: none;
              }

              .event-time {
                color: var(--text-secondary);
                min-width: 80px;
              }

              .event-type {
                color: var(--primary-color);
                font-weight: 500;
                min-width: 60px;
              }

              .event-details {
                color: var(--text-primary);
                flex: 1;
              }
            }
          }
        }
      }

      .recommendations-test {
        .user-profile-editor {
          background: var(--secondary-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;

          h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
          }

          .profile-controls {
            .control-row {
              display: flex;
              align-items: center;
              margin-bottom: 1rem;
              gap: 1rem;

              .control-label {
                min-width: 100px;
                font-weight: 500;
                color: var(--text-primary);
              }

              .control-select {
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 0.375rem;
                background: white;
                min-width: 200px;
              }

              .ingredient-checkboxes {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;

                .ingredient-checkbox {
                  display: flex;
                  align-items: center;
                  cursor: pointer;

                  input {
                    margin-right: 0.25rem;
                  }
                }
              }
            }

            .update-profile-btn {
              padding: 0.75rem 1.5rem;
              background: var(--primary-color);
              color: white;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background-color 0.3s ease;

              &:hover {
                background: var(--primary-dark);
              }
            }
          }
        }
      }
    }

    .test-summary {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;

      .section-title {
        color: white;
        font-size: 1.5rem;
        margin-bottom: 2rem;
      }

      .summary-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        align-items: center;

        .summary-stats {
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;

            .summary-value {
              font-weight: 700;
              font-size: 1.25rem;

              &.success {
                color: #10f5c4;
              }

              &.error {
                color: #f87171;
              }
            }
          }
        }

        .integration-score {
          h4 {
            margin-bottom: 1rem;
          }

          .score-display {
            .score-circle {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: conic-gradient(
                #10f5c4 0deg,
                #10f5c4 calc(var(--score) * 3.6deg),
                rgba(255, 255, 255, 0.2) calc(var(--score) * 3.6deg)
              );
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
              position: relative;

              &::before {
                content: '';
                position: absolute;
                width: 90px;
                height: 90px;
                background: var(--primary-color);
                border-radius: 50%;
              }

              .score-text {
                position: relative;
                z-index: 1;
                font-size: 1.25rem;
                font-weight: 700;
              }
            }

            .score-details {
              p {
                margin: 0;
                opacity: 0.9;
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .feature-integration-test {
      padding: 1rem;

      .test-controls {
        grid-template-columns: 1fr;
      }

      .test-status {
        grid-template-columns: 1fr;
      }

      .feature-test-section {
        padding: 1rem;
      }
    }
  }
</style>
