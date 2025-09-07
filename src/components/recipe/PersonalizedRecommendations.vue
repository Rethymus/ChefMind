<template>
  <div class="personalized-recommendations">
    <div class="recommendations-header">
      <h3 class="recommendations-title">
        <span class="title-icon">✨</span>
        为您推荐
      </h3>
      <div class="user-insights">
        <div class="insight-item" v-if="userProfile.cookingExperience > 0">
          <span class="insight-icon">👨‍🍳</span>
          <span class="insight-text">已烹饪 {{ userProfile.cookingExperience }} 道菜</span>
        </div>
        <div class="insight-item" v-if="userProfile.preferredIngredients.length > 0">
          <span class="insight-icon">❤️</span>
          <span class="insight-text"
            >偏爱 {{ userProfile.preferredIngredients.slice(0, 2).join('、') }}</span
          >
        </div>
        <div class="insight-item">
          <span class="insight-icon">📊</span>
          <span class="insight-text"
            >参与度: {{ getEngagementText(userProfile.engagementLevel) }}</span
          >
        </div>
      </div>
    </div>

    <!-- 推荐类型选择 -->
    <div class="recommendation-tabs">
      <button
        v-for="tab in recommendationTabs"
        :key="tab.value"
        :class="['tab-button', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- 推荐结果 -->
    <div class="recommendations-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在生成个性化推荐...</p>
      </div>

      <div v-else-if="currentRecommendations.length > 0" class="recommendations-grid">
        <div
          v-for="recipe in currentRecommendations"
          :key="recipe.id"
          class="recommendation-card"
          @click="selectRecipe(recipe)"
        >
          <div class="card-image">
            <img
              :src="getRecipeImage(recipe)"
              :alt="recipe.title || recipe.name"
              @error="handleImageError"
            />
            <div class="match-score">
              <span class="score-icon">🎯</span>
              <span class="score-text">{{ calculateMatchScore(recipe) }}% 匹配</span>
            </div>
          </div>

          <div class="card-content">
            <h4 class="recipe-title">{{ recipe.title || recipe.name }}</h4>
            <p class="recipe-description">{{ recipe.description }}</p>

            <div class="recipe-meta">
              <div class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span class="meta-text">{{ recipe.cookingTime }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <span class="meta-text">{{ recipe.servings }}人份</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⭐</span>
                <span class="meta-text">{{ recipe.rating || 'N/A' }}</span>
              </div>
            </div>

            <div class="recommendation-reason">
              <span class="reason-icon">💡</span>
              <span class="reason-text">{{ getRecommendationReason(recipe) }}</span>
            </div>

            <div class="card-actions">
              <button class="action-btn primary" @click.stop="startCooking(recipe)">
                开始烹饪
              </button>
              <button class="action-btn secondary" @click.stop="saveRecipe(recipe)">收藏</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-recommendations">
        <div class="empty-icon">🤔</div>
        <h4>暂无推荐</h4>
        <p>多尝试搜索和保存食谱，我们会为您提供更好的推荐</p>
      </div>
    </div>

    <!-- 推荐设置 -->
    <div class="recommendation-settings" v-if="showSettings">
      <h4 class="settings-title">个性化设置</h4>

      <div class="settings-section">
        <div class="setting-label">烹饪技能水平</div>
        <fieldset class="skill-options">
          <legend class="sr-only">烹饪技能水平选择</legend>
          <button
            v-for="skill in skillLevels"
            :key="skill.value"
            :class="['skill-btn', { active: userPreferences.cookingSkillLevel === skill.value }]"
            @click="updateSkillLevel(skill.value)"
          >
            {{ skill.label }}
          </button>
        </fieldset>
      </div>

      <div class="settings-section">
        <div class="setting-label">时间偏好</div>
        <fieldset class="time-options">
          <legend class="sr-only">时间偏好选择</legend>
          <button
            v-for="time in timePreferences"
            :key="time.value"
            :class="['time-btn', { active: userPreferences.timePreference === time.value }]"
            @click="updateTimePreference(time.value)"
          >
            {{ time.label }}
          </button>
        </fieldset>
      </div>

      <div class="settings-section">
        <div class="setting-label">喜爱食材</div>
        <div class="ingredient-tags">
          <button
            v-for="ingredient in commonIngredients"
            :key="ingredient"
            :class="[
              'ingredient-tag',
              {
                selected: userPreferences.favoriteIngredients.includes(ingredient),
              },
            ]"
            @click="toggleFavoriteIngredient(ingredient)"
            @keydown.enter="toggleFavoriteIngredient(ingredient)"
            @keydown.space.prevent="toggleFavoriteIngredient(ingredient)"
          >
            {{ ingredient }}
          </button>
        </div>
      </div>
    </div>

    <!-- 设置按钮 -->
    <button class="settings-toggle" @click="showSettings = !showSettings">
      <span class="settings-icon">⚙️</span>
      {{ showSettings ? '隐藏设置' : '个性化设置' }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { usePersonalizedRecommendations } from '@/composables/usePersonalizedRecommendations'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'
  import { getDishImage } from '@/utils/ingredientImages'
  import type { Recipe } from '@/types/recipe'

  // Props
  interface Props {
    allRecipes?: Recipe[]
    currentQuery?: string
    filters?: Record<string, any>
  }

  const props = withDefaults(defineProps<Props>(), {
    allRecipes: () => [],
    currentQuery: '',
    filters: () => ({}),
  })

  // Emits
  const emit = defineEmits<{
    selectRecipe: [recipe: Recipe]
    startCooking: [recipe: Recipe]
    saveRecipe: [recipe: Recipe]
  }>()

  // 组合式函数
  const {
    userPreferences,
    userProfile,
    getPersonalizedRecommendations,
    updateUserPreferences,
    trackUserBehavior,
    getCurrentSeason,
  } = usePersonalizedRecommendations()

  const { trackEvent } = useUserBehaviorAnalytics()

  // 响应式状态
  const activeTab = ref('personal')
  const isLoading = ref(false)
  const showSettings = ref(false)
  const recommendations = ref<{ [key: string]: Recipe[] }>({
    personal: [],
    seasonal: [],
    trending: [],
    similar: [],
  })

  // 推荐标签页配置
  const recommendationTabs = [
    { value: 'personal', label: '个人推荐', icon: '👤' },
    { value: 'seasonal', label: '时令推荐', icon: '🌱' },
    { value: 'trending', label: '热门推荐', icon: '🔥' },
    { value: 'similar', label: '相似推荐', icon: '🎯' },
  ]

  // 技能水平选项
  const skillLevels = [
    { value: 'beginner', label: '新手' },
    { value: 'intermediate', label: '进阶' },
    { value: 'advanced', label: '高级' },
  ]

  // 时间偏好选项
  const timePreferences = [
    { value: 'quick', label: '快手菜(30分钟内)' },
    { value: 'medium', label: '常规菜(1小时内)' },
    { value: 'slow', label: '不限时间' },
  ]

  // 常见食材
  const commonIngredients = [
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

  // 计算属性
  const currentRecommendations = computed(() => {
    return recommendations.value[activeTab.value] || []
  })

  // 方法
  const generateRecommendations = async () => {
    if (props.allRecipes.length === 0) return

    isLoading.value = true

    try {
      // 个人推荐
      recommendations.value.personal = getPersonalizedRecommendations(props.allRecipes, 6)

      // 季节性推荐
      recommendations.value.seasonal = getSeasonalRecommendations(props.allRecipes, 6)

      // 热门推荐
      recommendations.value.trending = getTrendingRecommendations(props.allRecipes, 6)

      // 相似推荐（基于当前搜索）
      if (props.currentQuery) {
        recommendations.value.similar = getSimilarRecommendationsByQuery(
          props.allRecipes,
          props.currentQuery,
          6
        )
      }

      // 记录推荐生成事件
      trackEvent('view', {
        source: 'personalized_recommendations',
        category: 'recommendation_generation',
        query: `${activeTab.value}_recommendations`,
      })
    } catch (error) {
      console.error('生成推荐失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const getSeasonalRecommendations = (recipes: Recipe[], count: number): Recipe[] => {
    const currentSeason = getCurrentSeason()
    const seasonalIngredients = {
      spring: ['韭菜', '菠菜', '莴苣', '豌豆', '春笋'],
      summer: ['番茄', '黄瓜', '茄子', '冬瓜', '丝瓜'],
      autumn: ['萝卜', '白菜', '莲藕', '山药', '柿子'],
      winter: ['白萝卜', '大白菜', '土豆', '红薯', '羊肉'],
    }

    const seasonalIngs = seasonalIngredients[currentSeason] || []

    const seasonalRecipes = recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing =>
        typeof ing === 'string' ? ing : ing.name
      )
      return seasonalIngs.some(seasonal =>
        recipeIngredients.some(ingredient => ingredient.includes(seasonal))
      )
    })

    return seasonalRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, count)
  }

  const getTrendingRecommendations = (recipes: Recipe[], count: number): Recipe[] => {
    // 基于评分和假设的热度排序
    return recipes
      .filter(recipe => recipe.rating && recipe.rating >= 4.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, count)
  }

  const getSimilarRecommendationsByQuery = (
    recipes: Recipe[],
    query: string,
    count: number
  ): Recipe[] => {
    const queryLower = query.toLowerCase()

    return recipes
      .filter(recipe => {
        const title = (recipe.title || recipe.name || '').toLowerCase()
        const description = recipe.description?.toLowerCase() || ''
        const ingredients = recipe.ingredients
          .map(ing => (typeof ing === 'string' ? ing.toLowerCase() : ing.name.toLowerCase()))
          .join(' ')

        return (
          title.includes(queryLower) ||
          description.includes(queryLower) ||
          ingredients.includes(queryLower)
        )
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, count)
  }

  const calculateMatchScore = (recipe: Recipe): number => {
    const preferences = userPreferences.value
    let score = 50 // 基础分数

    // 食材匹配
    const recipeIngredients = recipe.ingredients.map(ing =>
      typeof ing === 'string' ? ing : ing.name
    )
    const favoriteMatches = recipeIngredients.filter(ing =>
      preferences.favoriteIngredients.some(fav => ing.includes(fav))
    )
    score += favoriteMatches.length * 10

    // 技能等级匹配
    const difficulty = String(recipe.difficulty)?.toLowerCase()
    if (preferences.cookingSkillLevel === 'beginner' && difficulty === 'easy') score += 15
    if (
      preferences.cookingSkillLevel === 'intermediate' &&
      ['easy', 'medium'].includes(difficulty || '')
    )
      score += 10
    if (preferences.cookingSkillLevel === 'advanced') score += 5

    // 时间偏好匹配
    const cookingTime = parseInt(recipe.cookingTime) || 0
    if (preferences.timePreference === 'quick' && cookingTime <= 30) score += 15
    if (preferences.timePreference === 'medium' && cookingTime <= 60) score += 10

    return Math.min(100, Math.max(0, score))
  }

  const getRecommendationReason = (recipe: Recipe): string => {
    const matchScore = calculateMatchScore(recipe)
    const preferences = userPreferences.value

    if (matchScore >= 80) {
      const reasons = []

      // 检查食材匹配
      const recipeIngredients = recipe.ingredients.map(ing =>
        typeof ing === 'string' ? ing : ing.name
      )
      const favoriteMatches = recipeIngredients.filter(ing =>
        preferences.favoriteIngredients.some(fav => ing.includes(fav))
      )

      if (favoriteMatches.length > 0) {
        reasons.push(`包含您喜爱的${favoriteMatches[0]}`)
      }

      // 检查技能匹配
      const difficulty = String(recipe.difficulty)?.toLowerCase()
      if (preferences.cookingSkillLevel === 'beginner' && difficulty === 'easy') {
        reasons.push('适合新手制作')
      }

      // 检查时间匹配
      const cookingTime = parseInt(recipe.cookingTime) || 0
      if (preferences.timePreference === 'quick' && cookingTime <= 30) {
        reasons.push('制作快速')
      }

      return reasons.length > 0 ? reasons[0] : '高度匹配您的偏好'
    }

    if (matchScore >= 60) return '符合您的口味偏好'
    if (matchScore >= 40) return '值得尝试的新口味'
    return '扩展您的烹饪视野'
  }

  const getRecipeImage = (recipe: Recipe): string => {
    if (recipe.image) return recipe.image

    const ingredients = recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name))
    return getDishImage(recipe.title || recipe.name || '', ingredients)
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.src = '/images/ingredients/default.jpg'
  }

  const selectRecipe = (recipe: Recipe) => {
    trackUserBehavior('view_recipe', { recipeId: recipe.id })
    trackEvent('click', {
      source: 'personalized_recommendations',
      category: 'recipe_selection',
      target: recipe.id || 'unknown',
    })
    emit('selectRecipe', recipe)
  }

  const startCooking = (recipe: Recipe) => {
    trackUserBehavior('cook_recipe', { recipeId: recipe.id })
    trackEvent('click', {
      source: 'personalized_recommendations',
      category: 'start_cooking',
      target: recipe.id || 'unknown',
    })
    emit('startCooking', recipe)
  }

  const saveRecipe = (recipe: Recipe) => {
    trackUserBehavior('save_recipe', { recipeId: recipe.id })
    trackEvent('click', {
      source: 'personalized_recommendations',
      category: 'save_recipe',
      target: recipe.id || 'unknown',
    })
    emit('saveRecipe', recipe)
  }

  const updateSkillLevel = (level: string) => {
    updateUserPreferences({ cookingSkillLevel: level as any })
    generateRecommendations()
  }

  const updateTimePreference = (preference: string) => {
    updateUserPreferences({ timePreference: preference as any })
    generateRecommendations()
  }

  const toggleFavoriteIngredient = (ingredient: string) => {
    const favorites = [...userPreferences.value.favoriteIngredients]
    const index = favorites.indexOf(ingredient)

    if (index > -1) {
      favorites.splice(index, 1)
    } else {
      favorites.push(ingredient)
    }

    updateUserPreferences({ favoriteIngredients: favorites })
    generateRecommendations()
  }

  const getEngagementText = (level: string): string => {
    switch (level) {
      case 'high':
        return '活跃用户'
      case 'medium':
        return '中等活跃'
      case 'low':
        return '新用户'
      default:
        return '普通用户'
    }
  }

  // 监听器
  watch(
    [() => props.allRecipes, () => props.currentQuery, activeTab],
    () => {
      generateRecommendations()
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    generateRecommendations()
  })
</script>

<style scoped lang="scss">
  @import '@/styles/variables.scss';

  .personalized-recommendations {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .recommendations-header {
    margin-bottom: 1.5rem;

    .recommendations-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;

      .title-icon {
        margin-right: 0.5rem;
      }
    }

    .user-insights {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .insight-item {
        display: flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        background: var(--primary-light);
        border-radius: 1rem;
        font-size: 0.875rem;
        color: var(--primary-color);

        .insight-icon {
          margin-right: 0.25rem;
        }
      }
    }
  }

  .recommendation-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--border-color);

    .tab-button {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      border-radius: 0.5rem 0.5rem 0 0;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--text-secondary);

      &:hover {
        background: var(--hover-color);
        color: var(--text-primary);
      }

      &.active {
        background: var(--primary-color);
        color: white;
        border-bottom: 2px solid var(--primary-color);
      }

      .tab-icon {
        margin-right: 0.5rem;
      }

      .tab-label {
        font-weight: 500;
      }
    }
  }

  .recommendations-content {
    .loading-state {
      text-align: center;
      padding: 3rem;

      .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      p {
        color: var(--text-secondary);
      }
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .recommendation-card {
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .card-image {
        position: relative;
        height: 200px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .match-score {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          display: flex;
          align-items: center;

          .score-icon {
            margin-right: 0.25rem;
          }
        }
      }

      .card-content {
        padding: 1rem;

        .recipe-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .recipe-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .recipe-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;

          .meta-item {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            color: var(--text-secondary);

            .meta-icon {
              margin-right: 0.25rem;
            }
          }
        }

        .recommendation-reason {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: var(--primary-light);
          border-radius: 0.5rem;
          margin-bottom: 1rem;

          .reason-icon {
            margin-right: 0.5rem;
          }

          .reason-text {
            font-size: 0.875rem;
            color: var(--primary-color);
            font-weight: 500;
          }
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;

          .action-btn {
            flex: 1;
            padding: 0.5rem 1rem;
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
          }
        }
      }
    }

    .empty-recommendations {
      text-align: center;
      padding: 3rem;

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      h4 {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--text-secondary);
      }
    }
  }

  .recommendation-settings {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);

    .settings-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .settings-section {
      margin-bottom: 1.5rem;

      .setting-label {
        display: block;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }

      .skill-options,
      .time-options {
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        legend.sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        button {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          background: white;
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

      .ingredient-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        button.ingredient-tag {
          padding: 0.25rem 0.75rem;
          background: var(--secondary-color);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--primary-color);
          }

          &.selected {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
          }
        }
      }
    }
  }

  .settings-toggle {
    width: 100%;
    padding: 0.75rem;
    background: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;

    &:hover {
      background: var(--hover-color);
    }

    .settings-icon {
      margin-right: 0.5rem;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
