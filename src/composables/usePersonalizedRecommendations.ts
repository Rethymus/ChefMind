import { ref, computed } from 'vue'
import type { Recipe } from '@/types/recipe'

// 用户偏好数据接口
interface UserPreferences {
  favoriteIngredients: string[]
  dislikedIngredients: string[]
  preferredCookingMethods: string[]
  dietaryRestrictions: string[]
  favoriteCategories: string[]
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
  timePreference: 'quick' | 'medium' | 'slow'
  nutritionGoals: {
    calories?: number
    protein?: number
    lowSodium?: boolean
    lowFat?: boolean
  }
}

// 用户行为数据接口
interface UserBehavior {
  viewedRecipes: string[]
  savedRecipes: string[]
  searchHistory: string[]
  cookedRecipes: string[]
  ratedRecipes: { [recipeId: string]: number }
  sessionStartTime: Date
  totalCookingTime: number
}

// 推荐算法配置
interface RecommendationConfig {
  seasonalWeight: number // 季节性权重
  popularityWeight: number // 热度权重
  similarityWeight: number // 相似度权重
  diversityWeight: number // 多样性权重
  freshnessWeight: number // 新鲜度权重
}

// 用户行为追踪数据类型
interface UserBehaviorData {
  recipeId?: string
  query?: string
  rating?: number
  cookingTime?: number
}

export function usePersonalizedRecommendations() {
  // 状态管理
  const userPreferences = ref<UserPreferences>({
    favoriteIngredients: [],
    dislikedIngredients: [],
    preferredCookingMethods: [],
    dietaryRestrictions: [],
    favoriteCategories: [],
    cookingSkillLevel: 'beginner',
    timePreference: 'quick',
    nutritionGoals: {},
  })

  const userBehavior = ref<UserBehavior>({
    viewedRecipes: [],
    savedRecipes: [],
    searchHistory: [],
    cookedRecipes: [],
    ratedRecipes: {},
    sessionStartTime: new Date(),
    totalCookingTime: 0,
  })

  const recommendationConfig = ref<RecommendationConfig>({
    seasonalWeight: 0.2,
    popularityWeight: 0.15,
    similarityWeight: 0.3,
    diversityWeight: 0.2,
    freshnessWeight: 0.15,
  })

  // 获取当前季节
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }

  // 季节性食材映射
  const seasonalIngredients = {
    spring: ['韭菜', '菠菜', '莴苣', '豌豆', '春笋', '香椿'],
    summer: ['番茄', '黄瓜', '茄子', '冬瓜', '丝瓜', '苦瓜', '绿豆'],
    autumn: ['萝卜', '白菜', '莲藕', '山药', '柿子', '板栗', '银耳'],
    winter: ['白萝卜', '大白菜', '土豆', '红薯', '羊肉', '牛肉', '火锅'],
  }

  // 计算食谱相似度
  const calculateSimilarity = (recipe1: Recipe, recipe2: Recipe): number => {
    let similarity = 0
    let factors = 0

    // 食材相似度
    const ingredients1 = recipe1.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name))
    const ingredients2 = recipe2.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name))
    const commonIngredients = ingredients1.filter(ing =>
      ingredients2.some(ing2 => ing2.includes(ing) || ing.includes(ing2))
    )
    similarity +=
      (commonIngredients.length / Math.max(ingredients1.length, ingredients2.length)) * 0.4
    factors += 0.4

    // 烹饪方法相似度
    const methods1 = recipe1.cookingMethods || []
    const methods2 = recipe2.cookingMethods || []
    const commonMethods = methods1.filter(method => methods2.includes(method))
    if (methods1.length > 0 && methods2.length > 0) {
      similarity += (commonMethods.length / Math.max(methods1.length, methods2.length)) * 0.3
      factors += 0.3
    }

    // 难度相似度
    if (recipe1.difficulty === recipe2.difficulty) {
      similarity += 0.2
    }
    factors += 0.2

    // 时间相似度
    const time1 = parseInt(recipe1.cookingTime) || 0
    const time2 = parseInt(recipe2.cookingTime) || 0
    const timeDiff = Math.abs(time1 - time2)
    if (timeDiff <= 15) {
      similarity += 0.1
    }
    factors += 0.1

    return factors > 0 ? similarity / factors : 0
  }

  // 计算食谱推荐分数
  const calculateRecommendationScore = (recipe: Recipe): number => {
    let score = 0
    const config = recommendationConfig.value
    const preferences = userPreferences.value
    const behavior = userBehavior.value
    const currentSeason = getCurrentSeason()

    // 季节性评分
    const seasonalIngs = seasonalIngredients[currentSeason]
    const recipeIngredients = recipe.ingredients.map(ing =>
      typeof ing === 'string' ? ing : ing.name
    )
    const seasonalMatches = recipeIngredients.filter(ing =>
      seasonalIngs.some(seasonal => ing.includes(seasonal))
    )
    const seasonalScore = seasonalMatches.length / recipeIngredients.length
    score += seasonalScore * config.seasonalWeight

    // 用户偏好评分
    const favoriteMatches = recipeIngredients.filter(ing =>
      preferences.favoriteIngredients.some(fav => ing.includes(fav))
    )
    const dislikedMatches = recipeIngredients.filter(ing =>
      preferences.dislikedIngredients.some(dislike => ing.includes(dislike))
    )
    const preferenceScore =
      favoriteMatches.length / recipeIngredients.length -
      (dislikedMatches.length / recipeIngredients.length) * 0.5
    score += Math.max(0, preferenceScore) * config.similarityWeight

    // 热度评分（基于评分和收藏）
    const popularityScore = (recipe.rating || 0) / 5
    score += popularityScore * config.popularityWeight

    // 技能水平匹配
    const skillMatch = (() => {
      const difficulty = recipe.difficulty.toLowerCase()
      const userSkill = preferences.cookingSkillLevel

      if (userSkill === 'beginner' && difficulty === 'easy') return 1
      if (userSkill === 'intermediate' && ['easy', 'medium'].includes(difficulty)) return 1
      if (userSkill === 'advanced') return 1
      return 0.5
    })()
    score += skillMatch * 0.2

    // 时间偏好匹配
    const cookingTime = parseInt(recipe.cookingTime) || 0
    const timeMatch = (() => {
      const userTimePreference = preferences.timePreference
      if (userTimePreference === 'quick' && cookingTime <= 30) return 1
      if (userTimePreference === 'medium' && cookingTime <= 60) return 1
      if (userTimePreference === 'slow') return 1
      return 0.5
    })()
    score += timeMatch * 0.15

    // 新鲜度评分（避免重复推荐）
    const isViewed = behavior.viewedRecipes.includes(recipe.id || '')
    const isSaved = behavior.savedRecipes.includes(recipe.id || '')
    let freshnessScore = 1
    if (isViewed) {
      freshnessScore = isSaved ? 0.3 : 0.6
    }
    score += freshnessScore * config.freshnessWeight

    return Math.min(score, 1) // 确保分数不超过1
  }

  // 获取个性化推荐
  const getPersonalizedRecommendations = (allRecipes: Recipe[], count: number = 10): Recipe[] => {
    // 计算每个食谱的推荐分数
    const scoredRecipes = allRecipes.map(recipe => ({
      recipe,
      score: calculateRecommendationScore(recipe),
    }))

    // 按分数排序
    scoredRecipes.sort((a, b) => b.score - a.score)

    // 应用多样性过滤
    const diverseRecommendations: typeof scoredRecipes = []
    const usedCategories = new Set<string>()
    const usedIngredients = new Set<string>()

    for (const item of scoredRecipes) {
      if (diverseRecommendations.length >= count) break

      const recipe = item.recipe
      const mainIngredient = recipe.ingredients[0]
      const ingredientName =
        typeof mainIngredient === 'string' ? mainIngredient.split(' ')[0] : mainIngredient.name

      // 检查多样性
      const categoryKey = `${recipe.difficulty}-${recipe.cookingMethods?.[0] || 'unknown'}`

      if (!usedCategories.has(categoryKey) || !usedIngredients.has(ingredientName)) {
        diverseRecommendations.push(item)
        usedCategories.add(categoryKey)
        usedIngredients.add(ingredientName)
      } else if (diverseRecommendations.length < count / 2) {
        // 如果还没有足够的推荐，允许一些重复
        diverseRecommendations.push(item)
      }
    }

    return diverseRecommendations.map(item => item.recipe)
  }

  // 基于相似食谱的推荐
  const getSimilarRecipes = (
    targetRecipe: Recipe,
    allRecipes: Recipe[],
    count: number = 5
  ): Recipe[] => {
    const similarities = allRecipes
      .filter(recipe => recipe.id !== targetRecipe.id)
      .map(recipe => ({
        recipe,
        similarity: calculateSimilarity(targetRecipe, recipe),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count)

    return similarities.map(item => item.recipe)
  }

  // 更新用户偏好
  const updateUserPreferences = (updates: Partial<UserPreferences>) => {
    userPreferences.value = { ...userPreferences.value, ...updates }
    saveToLocalStorage()
  }

  // 记录用户行为
  const trackUserBehavior = (action: string, data: UserBehaviorData) => {
    const behavior = userBehavior.value

    switch (action) {
      case 'view_recipe':
        if (!behavior.viewedRecipes.includes(data.recipeId)) {
          behavior.viewedRecipes.push(data.recipeId)
        }
        break
      case 'save_recipe':
        if (!behavior.savedRecipes.includes(data.recipeId)) {
          behavior.savedRecipes.push(data.recipeId)
        }
        break
      case 'search':
        behavior.searchHistory.push(data.query)
        // 限制搜索历史长度
        if (behavior.searchHistory.length > 100) {
          behavior.searchHistory = behavior.searchHistory.slice(-50)
        }
        break
      case 'rate_recipe':
        behavior.ratedRecipes[data.recipeId] = data.rating
        break
      case 'cook_recipe':
        if (!behavior.cookedRecipes.includes(data.recipeId)) {
          behavior.cookedRecipes.push(data.recipeId)
        }
        behavior.totalCookingTime += data.cookingTime || 0
        break
    }

    saveToLocalStorage()
  }

  // 获取热门搜索关键词
  const getPopularSearchTerms = (): string[] => {
    const searchTerms = userBehavior.value.searchHistory
    const termCounts: { [term: string]: number } = {}

    searchTerms.forEach(term => {
      termCounts[term] = (termCounts[term] || 0) + 1
    })

    return Object.entries(termCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term)
  }

  // 本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
      localStorage.setItem('userBehavior', JSON.stringify(userBehavior.value))
    } catch (error) {
      console.warn('无法保存用户数据到本地存储:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences')
      const savedBehavior = localStorage.getItem('userBehavior')

      if (savedPreferences) {
        userPreferences.value = { ...userPreferences.value, ...JSON.parse(savedPreferences) }
      }

      if (savedBehavior) {
        const behavior = JSON.parse(savedBehavior)
        behavior.sessionStartTime = new Date(behavior.sessionStartTime)
        userBehavior.value = { ...userBehavior.value, ...behavior }
      }
    } catch (error) {
      console.warn('无法从本地存储加载用户数据:', error)
    }
  }

  // 计算用户画像
  const userProfile = computed(() => {
    const behavior = userBehavior.value

    return {
      cookingExperience: behavior.cookedRecipes.length,
      averageRating:
        Object.values(behavior.ratedRecipes).reduce((a, b) => a + b, 0) /
          Object.keys(behavior.ratedRecipes).length || 0,
      mostViewedCategory: getMostFrequentCategory(),
      sessionDuration: Date.now() - behavior.sessionStartTime.getTime(),
      engagementLevel: calculateEngagementLevel(),
      preferredIngredients: getTopIngredients(),
      cookingFrequency: behavior.cookedRecipes.length / getWeeksSinceFirstUse(),
    }
  })

  // 辅助函数
  const getMostFrequentCategory = (): string => {
    // 基于查看和保存的食谱分析最常查看的类别
    return 'unknown' // 简化实现
  }

  const calculateEngagementLevel = (): 'low' | 'medium' | 'high' => {
    const behavior = userBehavior.value
    const score =
      behavior.viewedRecipes.length * 1 +
      behavior.savedRecipes.length * 2 +
      behavior.cookedRecipes.length * 3

    if (score > 50) return 'high'
    if (score > 20) return 'medium'
    return 'low'
  }

  const getTopIngredients = (): string[] => {
    // 基于搜索历史和查看的食谱分析偏好食材
    const ingredients: { [key: string]: number } = {}

    userBehavior.value.searchHistory.forEach(query => {
      // 简化的食材提取逻辑
      const commonIngredients = ['鸡肉', '猪肉', '牛肉', '鱼', '虾', '豆腐', '土豆', '番茄']
      commonIngredients.forEach(ing => {
        if (query.includes(ing)) {
          ingredients[ing] = (ingredients[ing] || 0) + 1
        }
      })
    })

    return Object.entries(ingredients)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ing]) => ing)
  }

  const getWeeksSinceFirstUse = (): number => {
    const now = new Date()
    const firstUse = userBehavior.value.sessionStartTime
    return Math.max(1, (now.getTime() - firstUse.getTime()) / (1000 * 60 * 60 * 24 * 7))
  }

  // 初始化
  loadFromLocalStorage()

  return {
    // 状态
    userPreferences,
    userBehavior,
    userProfile,

    // 方法
    getPersonalizedRecommendations,
    getSimilarRecipes,
    updateUserPreferences,
    trackUserBehavior,
    getPopularSearchTerms,
    getCurrentSeason,

    // 工具函数
    calculateSimilarity,
    calculateRecommendationScore,
  }
}
