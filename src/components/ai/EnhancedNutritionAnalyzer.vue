<template>
  <div class="enhanced-nutrition-analyzer">
    <div class="nutrition-header">
      <h2 class="nutrition-title">
        <span class="nutrition-icon">🥗</span>
        智能营养分析
      </h2>
      <p class="nutrition-subtitle">基于AI的精准营养成分分析和健康建议</p>
    </div>

    <!-- 快速分析输入 -->
    <div class="quick-analysis">
      <div class="input-group">
        <textarea
          v-model="ingredientInput"
          placeholder="输入食材列表，例如：鸡胸肉 200g, 西兰花 150g, 胡萝卜 100g..."
          class="ingredient-input"
          @input="debouncedAnalysis"
        ></textarea>
        <button
          class="analyze-btn"
          @click="performNutritionAnalysis"
          :disabled="isAnalyzing || !ingredientInput.trim()"
        >
          <span v-if="isAnalyzing" class="loading-spinner"></span>
          {{ isAnalyzing ? '分析中...' : '开始分析' }}
        </button>
      </div>
    </div>

    <!-- 分析结果 -->
    <div v-if="nutritionData" class="nutrition-results">
      <!-- 营养概览 -->
      <div class="nutrition-overview">
        <h3 class="section-title">营养概览</h3>
        <div class="nutrition-cards">
          <div class="nutrition-card calories">
            <div class="card-header">
              <span class="card-icon">🔥</span>
              <span class="card-title">热量</span>
            </div>
            <div class="card-value">{{ nutritionData.calories.toFixed(0) }}</div>
            <div class="card-unit">千卡</div>
            <div class="card-progress">
              <div
                class="progress-bar"
                :style="{
                  width: `${Math.min((nutritionData.calories / dailyGoals.calories) * 100, 100)}%`,
                }"
              ></div>
            </div>
            <div class="card-info">
              {{ Math.round((nutritionData.calories / dailyGoals.calories) * 100) }}% 日需求
            </div>
          </div>

          <div class="nutrition-card protein">
            <div class="card-header">
              <span class="card-icon">🥩</span>
              <span class="card-title">蛋白质</span>
            </div>
            <div class="card-value">{{ nutritionData.protein.toFixed(1) }}</div>
            <div class="card-unit">克</div>
            <div class="card-progress">
              <div
                class="progress-bar"
                :style="{
                  width: `${Math.min((nutritionData.protein / dailyGoals.protein) * 100, 100)}%`,
                }"
              ></div>
            </div>
            <div class="card-info">
              {{ Math.round((nutritionData.protein / dailyGoals.protein) * 100) }}% 日需求
            </div>
          </div>

          <div class="nutrition-card carbs">
            <div class="card-header">
              <span class="card-icon">🍞</span>
              <span class="card-title">碳水化合物</span>
            </div>
            <div class="card-value">{{ nutritionData.carbs.toFixed(1) }}</div>
            <div class="card-unit">克</div>
            <div class="card-progress">
              <div
                class="progress-bar"
                :style="{
                  width: `${Math.min((nutritionData.carbs / dailyGoals.carbs) * 100, 100)}%`,
                }"
              ></div>
            </div>
            <div class="card-info">
              {{ Math.round((nutritionData.carbs / dailyGoals.carbs) * 100) }}% 日需求
            </div>
          </div>

          <div class="nutrition-card fat">
            <div class="card-header">
              <span class="card-icon">🥑</span>
              <span class="card-title">脂肪</span>
            </div>
            <div class="card-value">{{ nutritionData.fat.toFixed(1) }}</div>
            <div class="card-unit">克</div>
            <div class="card-progress">
              <div
                class="progress-bar"
                :style="{ width: `${Math.min((nutritionData.fat / dailyGoals.fat) * 100, 100)}%` }"
              ></div>
            </div>
            <div class="card-info">
              {{ Math.round((nutritionData.fat / dailyGoals.fat) * 100) }}% 日需求
            </div>
          </div>
        </div>
      </div>

      <!-- 详细营养成分 -->
      <div class="detailed-nutrition">
        <h3 class="section-title">详细营养成分</h3>
        <div class="nutrition-table">
          <div class="table-row header">
            <div class="cell">营养素</div>
            <div class="cell">含量</div>
            <div class="cell">单位</div>
            <div class="cell">日需求%</div>
          </div>

          <div v-for="nutrient in detailedNutrients" :key="nutrient.name" class="table-row">
            <div class="cell">
              <span class="nutrient-icon">{{ nutrient.icon }}</span>
              {{ nutrient.name }}
            </div>
            <div class="cell">{{ nutrient.amount }}</div>
            <div class="cell">{{ nutrient.unit }}</div>
            <div class="cell">
              <div class="percentage-bar">
                <div
                  class="percentage-fill"
                  :style="{ width: `${Math.min(nutrient.percentage, 100)}%` }"
                  :class="{
                    low: nutrient.percentage < 30,
                    medium: nutrient.percentage >= 30 && nutrient.percentage < 70,
                    high: nutrient.percentage >= 70,
                  }"
                ></div>
              </div>
              <span class="percentage-text">{{ nutrient.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 健康评分 -->
      <div class="health-score">
        <h3 class="section-title">健康评分</h3>
        <div class="score-container">
          <div class="score-circle">
            <svg class="score-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" stroke-width="8" />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                :stroke="getScoreColor(nutritionData.healthScore)"
                stroke-width="8"
                stroke-dasharray="282.74"
                :stroke-dashoffset="282.74 - (282.74 * nutritionData.healthScore) / 100"
                transform="rotate(-90 60 60)"
                class="score-progress"
              />
            </svg>
            <div class="score-text">
              <div class="score-number">{{ nutritionData.healthScore }}</div>
              <div class="score-label">健康分</div>
            </div>
          </div>
          <div class="score-details">
            <div class="score-factor" v-for="factor in scoreFactors" :key="factor.name">
              <div class="factor-name">{{ factor.name }}</div>
              <div class="factor-score" :class="factor.level">{{ factor.score }}/10</div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 健康建议 -->
      <div class="health-recommendations">
        <h3 class="section-title">AI 健康建议</h3>
        <div class="recommendations-list">
          <div
            v-for="(recommendation, index) in nutritionData.recommendations"
            :key="index"
            class="recommendation-item"
            :class="recommendation.type"
          >
            <div class="recommendation-icon">{{ getRecommendationIcon(recommendation.type) }}</div>
            <div class="recommendation-content">
              <div class="recommendation-title">{{ recommendation.title }}</div>
              <div class="recommendation-description">{{ recommendation.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 食材优化建议 -->
      <div class="ingredient-optimization">
        <h3 class="section-title">食材优化建议</h3>
        <div class="optimization-suggestions">
          <div
            v-for="suggestion in optimizationSuggestions"
            :key="suggestion.type"
            class="suggestion-card"
          >
            <div class="suggestion-header">
              <span class="suggestion-icon">{{ suggestion.icon }}</span>
              <span class="suggestion-title">{{ suggestion.title }}</span>
            </div>
            <div class="suggestion-content">
              <p class="suggestion-reason">{{ suggestion.reason }}</p>
              <div class="suggestion-alternatives">
                <div class="alternatives-label">推荐替代：</div>
                <div class="alternatives-list">
                  <span
                    v-for="alt in suggestion.alternatives"
                    :key="alt"
                    class="alternative-item"
                    @click="addToIngredients(alt)"
                  >
                    {{ alt }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="analysisError" class="analysis-error">
      <div class="error-icon">⚠️</div>
      <h3>分析失败</h3>
      <p>{{ analysisError }}</p>
      <button class="retry-btn" @click="performNutritionAnalysis">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🍽️</div>
      <h3>开始营养分析</h3>
      <p>输入食材信息，获取详细的营养分析和健康建议</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'

  // 营养数据接口
  interface NutritionData {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
    potassium: number
    calcium: number
    iron: number
    vitaminC: number
    vitaminD: number
    healthScore: number
    recommendations: Array<{
      type: 'warning' | 'success' | 'info'
      title: string
      description: string
    }>
  }

  interface OptimizationSuggestion {
    type: string
    icon: string
    title: string
    reason: string
    alternatives: string[]
  }

  // 组合式函数
  const { trackEvent } = useUserBehaviorAnalytics()

  // 响应式数据
  const ingredientInput = ref('')
  const nutritionData = ref<NutritionData | null>(null)
  const isAnalyzing = ref(false)
  const analysisError = ref('')

  // 每日营养目标
  const dailyGoals = ref({
    calories: 2000,
    protein: 60,
    carbs: 300,
    fat: 65,
  })

  // 计算属性
  const detailedNutrients = computed(() => {
    if (!nutritionData.value) return []

    const data = nutritionData.value
    return [
      {
        name: '膳食纤维',
        icon: '🌾',
        amount: data.fiber.toFixed(1),
        unit: '克',
        percentage: Math.round((data.fiber / 25) * 100),
      },
      {
        name: '糖分',
        icon: '🍯',
        amount: data.sugar.toFixed(1),
        unit: '克',
        percentage: Math.round((data.sugar / 50) * 100),
      },
      {
        name: '钠',
        icon: '🧂',
        amount: data.sodium.toFixed(0),
        unit: '毫克',
        percentage: Math.round((data.sodium / 2300) * 100),
      },
      {
        name: '钾',
        icon: '🍌',
        amount: data.potassium.toFixed(0),
        unit: '毫克',
        percentage: Math.round((data.potassium / 3500) * 100),
      },
      {
        name: '钙',
        icon: '🦴',
        amount: data.calcium.toFixed(0),
        unit: '毫克',
        percentage: Math.round((data.calcium / 1000) * 100),
      },
      {
        name: '铁',
        icon: '🩸',
        amount: data.iron.toFixed(1),
        unit: '毫克',
        percentage: Math.round((data.iron / 18) * 100),
      },
      {
        name: '维生素C',
        icon: '🍊',
        amount: data.vitaminC.toFixed(0),
        unit: '毫克',
        percentage: Math.round((data.vitaminC / 90) * 100),
      },
      {
        name: '维生素D',
        icon: '☀️',
        amount: data.vitaminD.toFixed(0),
        unit: 'IU',
        percentage: Math.round((data.vitaminD / 600) * 100),
      },
    ]
  })

  const scoreFactors = computed(() => {
    if (!nutritionData.value) return []

    const data = nutritionData.value
    return [
      {
        name: '营养均衡',
        score: Math.round(calculateBalanceScore(data)),
        level: getScoreLevel(calculateBalanceScore(data)),
      },
      {
        name: '维生素含量',
        score: Math.round(calculateVitaminScore(data)),
        level: getScoreLevel(calculateVitaminScore(data)),
      },
      {
        name: '矿物质含量',
        score: Math.round(calculateMineralScore(data)),
        level: getScoreLevel(calculateMineralScore(data)),
      },
      {
        name: '膳食纤维',
        score: Math.round((data.fiber / 25) * 10),
        level: getScoreLevel((data.fiber / 25) * 10),
      },
    ]
  })

  const optimizationSuggestions = computed(() => {
    if (!nutritionData.value) return []

    const suggestions: OptimizationSuggestion[] = []
    const data = nutritionData.value

    // 蛋白质不足
    if (data.protein < dailyGoals.value.protein * 0.5) {
      suggestions.push({
        type: 'protein',
        icon: '🥩',
        title: '增加蛋白质摄入',
        reason: '当前蛋白质含量较低，建议增加优质蛋白质来源',
        alternatives: ['鸡胸肉', '鱼类', '豆腐', '鸡蛋', '希腊酸奶'],
      })
    }

    // 纤维不足
    if (data.fiber < 10) {
      suggestions.push({
        type: 'fiber',
        icon: '🌾',
        title: '增加膳食纤维',
        reason: '膳食纤维有助于消化健康和血糖控制',
        alternatives: ['燕麦', '糙米', '蔬菜', '豆类', '坚果'],
      })
    }

    // 钠含量过高
    if (data.sodium > 1500) {
      suggestions.push({
        type: 'sodium',
        icon: '🧂',
        title: '减少钠摄入',
        reason: '钠含量过高可能影响血压健康',
        alternatives: ['新鲜香草', '柠檬汁', '醋', '蒜', '生姜'],
      })
    }

    return suggestions
  })

  // 方法
  const performNutritionAnalysis = async () => {
    if (!ingredientInput.value.trim()) return

    isAnalyzing.value = true
    analysisError.value = ''

    try {
      // 记录分析事件
      trackEvent('click', {
        source: 'nutrition_analyzer',
        category: 'analysis',
        target: 'perform_analysis',
      })

      // 模拟API调用
      const result = await analyzeIngredients(ingredientInput.value)
      nutritionData.value = result

      // 记录成功分析
      trackEvent('view', {
        query: 'nutrition_analysis_result',
      })
    } catch (error) {
      analysisError.value = '分析过程中出现错误，请稍后重试'
      console.error('营养分析失败:', error)
    } finally {
      isAnalyzing.value = false
    }
  }

  // 模拟营养分析API
  const analyzeIngredients = async (ingredients: string): Promise<NutritionData> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 简化的营养计算逻辑
    const ingredientList = ingredients.split(',').map(item => item.trim())

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0
    let totalSugar = 0
    let totalSodium = 0
    let totalPotassium = 0
    let totalCalcium = 0
    let totalIron = 0
    let totalVitaminC = 0
    let totalVitaminD = 0

    // 营养数据库（简化版）
    const nutritionDB: { [key: string]: any } = {
      鸡胸肉: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
      西兰花: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, vitaminC: 89 },
      胡萝卜: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, vitaminA: 835 },
      米饭: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1 },
      鸡蛋: { calories: 155, protein: 13, carbs: 1.1, fat: 11, sodium: 124, calcium: 56 },
    }

    // 处理每个食材
    ingredientList.forEach(ingredient => {
      // 提取数量和单位
      const match = ingredient.match(/(\d+)\s*(g|克|kg|千克|ml|毫升|个|只)?/)
      const amount = match ? parseInt(match[1]) : 100
      const unit = match ? match[2] : 'g'

      // 转换为克
      let weightInGrams = amount
      if (unit === 'kg' || unit === '千克') {
        weightInGrams = amount * 1000
      } else if (unit === '个' || unit === '只') {
        weightInGrams = amount * 50 // 假设每个/只重50g
      }

      // 查找营养信息
      const foodName = ingredient.replace(/\d+\s*(g|克|kg|千克|ml|毫升|个|只)?/g, '').trim()
      const nutrition = Object.keys(nutritionDB).find(
        key => foodName.includes(key) || key.includes(foodName)
      )

      if (nutrition) {
        const data = nutritionDB[nutrition]
        const ratio = weightInGrams / 100 // 营养数据库基于100g

        totalCalories += data.calories * ratio
        totalProtein += data.protein * ratio
        totalCarbs += data.carbs * ratio
        totalFat += data.fat * ratio
        totalFiber += (data.fiber || 0) * ratio
        totalSugar += (data.sugar || totalCarbs * 0.1) * ratio // 估算糖分
        totalSodium += (data.sodium || 0) * ratio
        totalPotassium += (data.potassium || 200) * ratio
        totalCalcium += (data.calcium || 20) * ratio
        totalIron += (data.iron || 1) * ratio
        totalVitaminC += (data.vitaminC || 0) * ratio
        totalVitaminD += (data.vitaminD || 0) * ratio
      }
    })

    // 计算健康评分
    const healthScore = calculateHealthScore({
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sodium: totalSodium,
    })

    // 生成建议
    const recommendations = generateRecommendations({
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sodium: totalSodium,
    })

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sugar: totalSugar,
      sodium: totalSodium,
      potassium: totalPotassium,
      calcium: totalCalcium,
      iron: totalIron,
      vitaminC: totalVitaminC,
      vitaminD: totalVitaminD,
      healthScore,
      recommendations,
    }
  }

  const calculateHealthScore = (nutrition: any): number => {
    let score = 50 // 基础分

    // 蛋白质评分
    const proteinRatio = nutrition.protein / dailyGoals.value.protein
    if (proteinRatio >= 0.8 && proteinRatio <= 1.2) score += 15
    else if (proteinRatio >= 0.5) score += 10
    else score += 5

    // 纤维评分
    if (nutrition.fiber >= 15) score += 15
    else if (nutrition.fiber >= 8) score += 10
    else score += 5

    // 钠评分
    if (nutrition.sodium <= 1000) score += 15
    else if (nutrition.sodium <= 1500) score += 10
    else score += 5

    // 热量评分
    const calorieRatio = nutrition.calories / dailyGoals.value.calories
    if (calorieRatio >= 0.8 && calorieRatio <= 1.2) score += 15
    else if (calorieRatio >= 0.5) score += 10
    else score += 5

    return Math.min(100, Math.max(0, score))
  }

  const generateRecommendations = (nutrition: any) => {
    const recommendations = []

    if (nutrition.protein < dailyGoals.value.protein * 0.5) {
      recommendations.push({
        type: 'warning',
        title: '蛋白质不足',
        description: '建议增加瘦肉、鱼类、豆类等优质蛋白质来源',
      })
    }

    if (nutrition.fiber < 10) {
      recommendations.push({
        type: 'info',
        title: '增加膳食纤维',
        description: '多食用全谷物、蔬菜和水果，有助于消化健康',
      })
    }

    if (nutrition.sodium > 1500) {
      recommendations.push({
        type: 'warning',
        title: '钠含量偏高',
        description: '减少盐分摄入，选择低钠调味料',
      })
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: '营养搭配良好',
        description: '继续保持均衡的饮食习惯',
      })
    }

    return recommendations
  }

  const calculateBalanceScore = (data: NutritionData): number => {
    const proteinRatio = (data.protein * 4) / data.calories
    const carbRatio = (data.carbs * 4) / data.calories
    const fatRatio = (data.fat * 9) / data.calories

    // 理想比例：蛋白质15-20%，碳水50-60%，脂肪25-30%
    let score = 10
    if (proteinRatio < 0.15 || proteinRatio > 0.25) score -= 2
    if (carbRatio < 0.45 || carbRatio > 0.65) score -= 2
    if (fatRatio < 0.2 || fatRatio > 0.35) score -= 2

    return Math.max(0, score)
  }

  const calculateVitaminScore = (data: NutritionData): number => {
    const vitaminCScore = Math.min(data.vitaminC / 90, 1) * 5
    const vitaminDScore = Math.min(data.vitaminD / 600, 1) * 5
    return vitaminCScore + vitaminDScore
  }

  const calculateMineralScore = (data: NutritionData): number => {
    const calciumScore = Math.min(data.calcium / 1000, 1) * 3
    const ironScore = Math.min(data.iron / 18, 1) * 3
    const potassiumScore = Math.min(data.potassium / 3500, 1) * 4
    return calciumScore + ironScore + potassiumScore
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLevel = (score: number): string => {
    if (score >= 8) return 'high'
    if (score >= 5) return 'medium'
    return 'low'
  }

  const getRecommendationIcon = (type: string): string => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'info':
        return 'ℹ️'
      default:
        return '💡'
    }
  }

  const addToIngredients = (ingredient: string) => {
    if (!ingredientInput.value.includes(ingredient)) {
      ingredientInput.value += ingredientInput.value ? `, ${ingredient}` : ingredient
    }

    trackEvent('click', {
      source: 'nutrition_analyzer',
      category: 'optimization',
      target: 'add_ingredient',
    })
  }

  // 防抖分析
  let debounceTimer: number
  const debouncedAnalysis = () => {
    clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => {
      if (ingredientInput.value.trim().length > 10) {
        performNutritionAnalysis()
      }
    }, 1000)
  }

  onMounted(() => {
    // 加载用户的营养目标
    const savedGoals = localStorage.getItem('nutritionGoals')
    if (savedGoals) {
      try {
        dailyGoals.value = { ...dailyGoals.value, ...JSON.parse(savedGoals) }
      } catch (error) {
        console.warn('无法加载营养目标:', error)
      }
    }
  })
</script>

<style scoped lang="scss">
  @import '@/styles/variables.scss';

  .enhanced-nutrition-analyzer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 1rem;
  }

  .nutrition-header {
    text-align: center;
    margin-bottom: 2rem;

    .nutrition-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.5rem;

      .nutrition-icon {
        font-size: 2.5rem;
        margin-right: 0.5rem;
      }
    }

    .nutrition-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
  }

  .quick-analysis {
    margin-bottom: 2rem;

    .input-group {
      display: flex;
      gap: 1rem;
      align-items: flex-start;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .ingredient-input {
      flex: 1;
      min-height: 120px;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
      resize: vertical;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
    }

    .analyze-btn {
      padding: 1rem 2rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;

      &:hover:not(:disabled) {
        background: var(--primary-dark);
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .loading-spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s ease-in-out infinite;
        margin-right: 0.5rem;
      }
    }
  }

  .nutrition-results {
    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 0.5rem;
    }
  }

  .nutrition-overview {
    margin-bottom: 2rem;

    .nutrition-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .nutrition-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;

        .card-icon {
          font-size: 1.5rem;
          margin-right: 0.5rem;
        }

        .card-title {
          font-weight: 600;
          color: var(--text-secondary);
        }
      }

      .card-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .card-unit {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-bottom: 1rem;
      }

      .card-progress {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 0.5rem;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
          transition: width 0.5s ease;
        }
      }

      .card-info {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      &.calories .progress-bar {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }
      &.protein .progress-bar {
        background: linear-gradient(90deg, #10b981, #059669);
      }
      &.carbs .progress-bar {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }
      &.fat .progress-bar {
        background: linear-gradient(90deg, #8b5cf6, #7c3aed);
      }
    }
  }

  .detailed-nutrition {
    margin-bottom: 2rem;

    .nutrition-table {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 2fr;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;

        &.header {
          background: var(--primary-color);
          color: white;
          font-weight: 600;
        }

        &:last-child {
          border-bottom: none;
        }

        .cell {
          display: flex;
          align-items: center;

          .nutrient-icon {
            margin-right: 0.5rem;
          }

          .percentage-bar {
            width: 60px;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-right: 0.5rem;

            .percentage-fill {
              height: 100%;
              transition: width 0.5s ease;

              &.low {
                background: #ef4444;
              }
              &.medium {
                background: #f59e0b;
              }
              &.high {
                background: #10b981;
              }
            }
          }

          .percentage-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .health-score {
    margin-bottom: 2rem;

    .score-container {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2rem;
      align-items: center;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    .score-circle {
      position: relative;
      width: 120px;
      height: 120px;

      .score-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .score-progress {
        transition: stroke-dashoffset 1s ease;
      }

      .score-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        .score-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .score-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }
    }

    .score-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;

      .score-factor {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .factor-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .factor-score {
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;

          &.low {
            background: #fef2f2;
            color: #dc2626;
          }
          &.medium {
            background: #fffbeb;
            color: #d97706;
          }
          &.high {
            background: #f0fdf4;
            color: #16a34a;
          }
        }
      }
    }
  }

  .health-recommendations {
    margin-bottom: 2rem;

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .recommendation-item {
        display: flex;
        align-items: flex-start;
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 4px solid;

        &.warning {
          border-color: #f59e0b;
        }
        &.success {
          border-color: #10b981;
        }
        &.info {
          border-color: #3b82f6;
        }

        .recommendation-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
          margin-top: 0.25rem;
        }

        .recommendation-content {
          flex: 1;

          .recommendation-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
          }

          .recommendation-description {
            color: var(--text-secondary);
            line-height: 1.5;
          }
        }
      }
    }
  }

  .ingredient-optimization {
    .optimization-suggestions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;

      .suggestion-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        .suggestion-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;

          .suggestion-icon {
            font-size: 1.5rem;
            margin-right: 0.5rem;
          }

          .suggestion-title {
            font-weight: 600;
            color: var(--text-primary);
          }
        }

        .suggestion-content {
          .suggestion-reason {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            line-height: 1.5;
          }

          .suggestion-alternatives {
            .alternatives-label {
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 0.5rem;
            }

            .alternatives-list {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;

              .alternative-item {
                padding: 0.25rem 0.75rem;
                background: var(--primary-light);
                color: var(--primary-color);
                border-radius: 1rem;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                  background: var(--primary-color);
                  color: white;
                  transform: translateY(-1px);
                }
              }
            }
          }
        }
      }
    }
  }

  .analysis-error {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h3 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .retry-btn {
      padding: 0.75rem 1.5rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: var(--primary-dark);
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 4rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    h3 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
