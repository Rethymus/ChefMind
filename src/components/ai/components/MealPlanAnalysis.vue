<template>
  <div class="meal-plan-analysis">
    <div class="plan-creator">
      <h4 class="section-title">创建饮食计划</h4>

      <!-- 计划类型选择 -->
      <div class="plan-type-selector">
        <el-radio-group v-model="planType" @change="handlePlanTypeChange">
          <el-radio-button label="daily">一日计划</el-radio-button>
          <el-radio-button label="weekly">一周计划</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 日期选择 -->
      <div class="date-selector">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择开始日期"
          format="YYYY-MM-DD"
          @change="handleDateChange"
        />
      </div>

      <!-- 餐食安排 -->
      <div class="meal-schedule">
        <div v-for="meal in mealSchedule" :key="meal.id" class="meal-slot">
          <div class="meal-header">
            <h5 class="meal-name">{{ meal.name }}</h5>
            <span class="meal-time">{{ meal.time }}</span>
          </div>

          <div class="meal-content">
            <div v-if="meal.recipes.length === 0" class="empty-meal">
              <el-button @click="addRecipeToMeal(meal.id)" :icon="Plus"> 添加菜谱 </el-button>
            </div>

            <div v-else class="meal-recipes">
              <div v-for="(recipe, index) in meal.recipes" :key="index" class="recipe-card">
                <img :src="recipe.image" :alt="recipe.name" class="recipe-image" />
                <div class="recipe-info">
                  <div class="recipe-name">{{ recipe.name }}</div>
                  <div class="recipe-nutrition">
                    {{ recipe.calories }}千卡 | {{ recipe.protein }}g蛋白质
                  </div>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="removeRecipeFromMeal(meal.id, index)"
                />
              </div>

              <el-button @click="addRecipeToMeal(meal.id)" size="small"> 添加更多 </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 营养目标设置 -->
      <div class="nutrition-targets">
        <h5 class="targets-title">营养目标设置</h5>
        <div class="targets-grid">
          <div class="target-item">
            <div class="target-label">每日热量目标 (千卡)</div>
            <el-input-number
              v-model="nutritionTargets.calories"
              :min="1000"
              :max="5000"
              :step="50"
            />
          </div>
          <div class="target-item">
            <div class="target-label">蛋白质目标 (克)</div>
            <el-input-number v-model="nutritionTargets.protein" :min="20" :max="200" :step="5" />
          </div>
          <div class="target-item">
            <div class="target-label">碳水化合物目标 (克)</div>
            <el-input-number v-model="nutritionTargets.carbs" :min="50" :max="500" :step="10" />
          </div>
          <div class="target-item">
            <div class="target-label">脂肪目标 (克)</div>
            <el-input-number v-model="nutritionTargets.fat" :min="20" :max="150" :step="5" />
          </div>
        </div>
      </div>

      <!-- 分析按钮 -->
      <div class="analysis-actions">
        <el-button
          type="primary"
          size="large"
          @click="analyzeMealPlan"
          :loading="isAnalyzing"
          :disabled="!hasValidMealPlan"
          :icon="Cpu"
        >
          {{ isAnalyzing ? '分析中...' : '分析饮食计划' }}
        </el-button>
      </div>
    </div>

    <!-- 营养统计预览 -->
    <div v-if="hasValidMealPlan" class="nutrition-summary">
      <h4 class="section-title">营养统计预览</h4>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-header">
            <span class="card-icon">🔥</span>
            <span class="card-title">总热量</span>
          </div>
          <div class="card-value">
            {{ totalNutrition.calories.toFixed(0) }}
            <span class="unit">千卡</span>
          </div>
          <div class="card-progress">
            <el-progress
              :percentage="getCalorieProgress()"
              :color="getProgressColor(getCalorieProgress())"
              :show-text="false"
            />
          </div>
          <div class="card-target">目标: {{ nutritionTargets.calories }} 千卡</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <span class="card-icon">🥩</span>
            <span class="card-title">蛋白质</span>
          </div>
          <div class="card-value">
            {{ totalNutrition.protein.toFixed(1) }}
            <span class="unit">克</span>
          </div>
          <div class="card-progress">
            <el-progress
              :percentage="getProteinProgress()"
              :color="getProgressColor(getProteinProgress())"
              :show-text="false"
            />
          </div>
          <div class="card-target">目标: {{ nutritionTargets.protein }} 克</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <span class="card-icon">🌾</span>
            <span class="card-title">碳水化合物</span>
          </div>
          <div class="card-value">
            {{ totalNutrition.carbs.toFixed(1) }}
            <span class="unit">克</span>
          </div>
          <div class="card-progress">
            <el-progress
              :percentage="getCarbsProgress()"
              :color="getProgressColor(getCarbsProgress())"
              :show-text="false"
            />
          </div>
          <div class="card-target">目标: {{ nutritionTargets.carbs }} 克</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <span class="card-icon">🥑</span>
            <span class="card-title">脂肪</span>
          </div>
          <div class="card-value">
            {{ totalNutrition.fat.toFixed(1) }}
            <span class="unit">克</span>
          </div>
          <div class="card-progress">
            <el-progress
              :percentage="getFatProgress()"
              :color="getProgressColor(getFatProgress())"
              :show-text="false"
            />
          </div>
          <div class="card-target">目标: {{ nutritionTargets.fat }} 克</div>
        </div>
      </div>

      <!-- 餐食分布图 -->
      <div class="meal-distribution">
        <h5 class="distribution-title">热量分布</h5>
        <div class="distribution-chart">
          <div
            v-for="meal in mealSchedule"
            :key="meal.id"
            class="distribution-bar"
            :style="{ width: `${getMealCaloriePercentage(meal)}%` }"
          >
            <div class="bar-label">{{ meal.name }}</div>
            <div class="bar-value">{{ getMealCalories(meal) }}千卡</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 菜谱选择对话框 -->
    <el-dialog v-model="recipeDialogVisible" title="选择菜谱" width="80%" max-width="800px">
      <div class="recipe-selector">
        <el-input
          v-model="recipeSearchQuery"
          placeholder="搜索菜谱..."
          :prefix-icon="Search"
          @input="searchRecipes"
          clearable
        />

        <div class="recipe-grid">
          <div
            v-for="recipe in availableRecipes"
            :key="recipe.id"
            class="recipe-option"
            @click="selectRecipe(recipe)"
          >
            <img :src="recipe.image" :alt="recipe.name" class="recipe-option-image" />
            <div class="recipe-option-info">
              <div class="recipe-option-name">{{ recipe.name }}</div>
              <div class="recipe-option-nutrition">
                {{ formatCalories(recipe.calories) }} | ⏱️
                {{ formatCookingTime(recipe.cookingTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus, Delete, Cpu, Search } from '@element-plus/icons-vue'
  import { formatCookingTime, formatCalories } from '@/utils/formatUtils'

  // 接口定义
  interface Recipe {
    id: string
    name: string
    image: string
    calories: number
    protein: number
    carbs: number
    fat: number
    cookingTime: number
    servings: number
  }

  interface Meal {
    id: string
    name: string
    time: string
    recipes: Recipe[]
  }

  // 事件定义
  const emit = defineEmits<{
    analysisComplete: [result: any]
  }>()

  // 响应式数据
  const planType = ref('daily')
  const selectedDate = ref(new Date())
  const isAnalyzing = ref(false)
  const recipeDialogVisible = ref(false)
  const currentMealId = ref('')
  const recipeSearchQuery = ref('')

  // 营养目标
  const nutritionTargets = ref({
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 67,
  })

  // 餐食安排
  const mealSchedule = ref<Meal[]>([
    {
      id: 'breakfast',
      name: '早餐',
      time: '7:00-8:00',
      recipes: [],
    },
    {
      id: 'lunch',
      name: '午餐',
      time: '12:00-13:00',
      recipes: [],
    },
    {
      id: 'dinner',
      name: '晚餐',
      time: '18:00-19:00',
      recipes: [],
    },
    {
      id: 'snack',
      name: '加餐',
      time: '15:00-16:00',
      recipes: [],
    },
  ])

  // 计算属性
  const hasValidMealPlan = computed(() => {
    return mealSchedule.value.some(meal => meal.recipes.length > 0)
  })

  const totalNutrition = computed(() => {
    return mealSchedule.value.reduce(
      (total, meal) => {
        const mealNutrition = meal.recipes.reduce(
          (mealTotal, recipe) => ({
            calories: mealTotal.calories + recipe.calories,
            protein: mealTotal.protein + recipe.protein,
            carbs: mealTotal.carbs + recipe.carbs,
            fat: mealTotal.fat + recipe.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        return {
          calories: total.calories + mealNutrition.calories,
          protein: total.protein + mealNutrition.protein,
          carbs: total.carbs + mealNutrition.carbs,
          fat: total.fat + mealNutrition.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  })

  const availableRecipes = computed(() => {
    if (!recipeSearchQuery.value.trim()) {
      return mockRecipes
    }
    return mockRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(recipeSearchQuery.value.toLowerCase())
    )
  })

  // 方法定义
  function handlePlanTypeChange(type: string) {
    console.log('计划类型改变:', type)
  }

  function handleDateChange(date: Date) {
    console.log('日期改变:', date)
  }

  function addRecipeToMeal(mealId: string) {
    currentMealId.value = mealId
    recipeDialogVisible.value = true
  }

  function removeRecipeFromMeal(mealId: string, recipeIndex: number) {
    const meal = mealSchedule.value.find(m => m.id === mealId)
    if (meal) {
      meal.recipes.splice(recipeIndex, 1)
      ElMessage.success('已移除菜谱')
    }
  }

  function searchRecipes() {
    // 搜索逻辑已在计算属性中处理
  }

  function selectRecipe(recipe: Recipe) {
    const meal = mealSchedule.value.find(m => m.id === currentMealId.value)
    if (meal) {
      // 检查是否已添加
      const exists = meal.recipes.find(r => r.id === recipe.id)
      if (!exists) {
        meal.recipes.push(recipe)
        ElMessage.success(`已添加 ${recipe.name} 到 ${meal.name}`)
      } else {
        ElMessage.warning('该菜谱已添加到此餐食')
      }
    }

    recipeDialogVisible.value = false
    recipeSearchQuery.value = ''
  }

  // 营养进度计算
  function getCalorieProgress(): number {
    return Math.min((totalNutrition.value.calories / nutritionTargets.value.calories) * 100, 100)
  }

  function getProteinProgress(): number {
    return Math.min((totalNutrition.value.protein / nutritionTargets.value.protein) * 100, 100)
  }

  function getCarbsProgress(): number {
    return Math.min((totalNutrition.value.carbs / nutritionTargets.value.carbs) * 100, 100)
  }

  function getFatProgress(): number {
    return Math.min((totalNutrition.value.fat / nutritionTargets.value.fat) * 100, 100)
  }

  function getProgressColor(percentage: number): string {
    if (percentage < 60) return '#F56C6C'
    if (percentage > 120) return '#E6A23C'
    return '#67C23A'
  }

  // 餐食热量分布
  function getMealCalories(meal: Meal): number {
    return meal.recipes.reduce((total, recipe) => total + recipe.calories, 0)
  }

  function getMealCaloriePercentage(meal: Meal): number {
    const mealCalories = getMealCalories(meal)
    const total = totalNutrition.value.calories
    return total > 0 ? (mealCalories / total) * 100 : 0
  }

  async function analyzeMealPlan() {
    if (!hasValidMealPlan.value) {
      ElMessage.warning('请先添加菜谱到餐食计划')
      return
    }

    isAnalyzing.value = true

    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 生成分析结果
      const result = {
        ...totalNutrition.value,
        fiber: Math.random() * 30 + 10,
        sugar: Math.random() * 50 + 20,
        sodium: Math.random() * 1500 + 500,
        vitamins: generateVitaminData(),
        minerals: generateMineralData(),
        mealDistribution: mealSchedule.value.map(meal => ({
          name: meal.name,
          calories: getMealCalories(meal),
          percentage: getMealCaloriePercentage(meal),
        })),
        nutritionBalance: analyzeNutritionBalance(),
        recommendations: generateRecommendations(),
        confidence: 0.91,
        planType: planType.value,
        date: selectedDate.value,
      }

      ElMessage.success('饮食计划分析完成！')
      emit('analysisComplete', result)
    } catch (error) {
      console.error('分析失败:', error)
      ElMessage.error('分析失败，请重试')
    } finally {
      isAnalyzing.value = false
    }
  }

  function generateVitaminData() {
    return {
      A: Math.random() * 100,
      C: Math.random() * 100,
      D: Math.random() * 100,
      E: Math.random() * 100,
    }
  }

  function generateMineralData() {
    return {
      calcium: Math.random() * 100,
      iron: Math.random() * 100,
      zinc: Math.random() * 100,
      magnesium: Math.random() * 100,
    }
  }

  function analyzeNutritionBalance() {
    const calories = totalNutrition.value.calories
    const proteinCalories = totalNutrition.value.protein * 4
    const carbsCalories = totalNutrition.value.carbs * 4
    const fatCalories = totalNutrition.value.fat * 9

    return {
      proteinRatio: calories > 0 ? (proteinCalories / calories) * 100 : 0,
      carbsRatio: calories > 0 ? (carbsCalories / calories) * 100 : 0,
      fatRatio: calories > 0 ? (fatCalories / calories) * 100 : 0,
    }
  }

  function generateRecommendations() {
    const recommendations = []

    if (getCalorieProgress() < 80) {
      recommendations.push({
        type: 'warning',
        title: '热量不足',
        message: '当前热量摄入低于目标，建议增加营养密度高的食物',
      })
    }

    if (getProteinProgress() < 70) {
      recommendations.push({
        type: 'improvement',
        title: '蛋白质不足',
        message: '蛋白质摄入偏低，建议增加优质蛋白质来源',
      })
    }

    return recommendations
  }

  // 模拟菜谱数据
  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: '番茄炒蛋',
      image: '/api/placeholder/120/80',
      calories: 180,
      protein: 12,
      carbs: 8,
      fat: 11,
      cookingTime: 15,
      servings: 2,
    },
    {
      id: '2',
      name: '青椒肉丝',
      image: '/api/placeholder/120/80',
      calories: 220,
      protein: 18,
      carbs: 12,
      fat: 13,
      cookingTime: 20,
      servings: 3,
    },
    {
      id: '3',
      name: '蒸蛋羹',
      image: '/api/placeholder/120/80',
      calories: 90,
      protein: 8,
      carbs: 2,
      fat: 6,
      cookingTime: 10,
      servings: 1,
    },
    {
      id: '4',
      name: '白米饭',
      image: '/api/placeholder/120/80',
      calories: 150,
      protein: 3,
      carbs: 32,
      fat: 0.5,
      cookingTime: 25,
      servings: 2,
    },
    {
      id: '5',
      name: '西兰花炒虾仁',
      image: '/api/placeholder/120/80',
      calories: 160,
      protein: 20,
      carbs: 8,
      fat: 6,
      cookingTime: 12,
      servings: 2,
    },
  ]
</script>

<style scoped lang="scss">
  .meal-plan-analysis {
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .plan-creator {
      margin-bottom: 32px;

      .plan-type-selector {
        margin-bottom: 16px;
      }

      .date-selector {
        margin-bottom: 24px;
      }

      .meal-schedule {
        margin-bottom: 24px;

        .meal-slot {
          background: var(--el-fill-color-lighter);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;

          .meal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .meal-name {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }

            .meal-time {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              background: var(--el-color-primary-light-8);
              padding: 2px 8px;
              border-radius: 12px;
            }
          }

          .meal-content {
            .empty-meal {
              text-align: center;
              padding: 20px;
              border: 2px dashed var(--el-border-color);
              border-radius: 6px;
            }

            .meal-recipes {
              .recipe-card {
                display: flex;
                align-items: center;
                background: var(--el-bg-color);
                border-radius: 6px;
                padding: 8px;
                margin-bottom: 8px;

                .recipe-image {
                  width: 48px;
                  height: 48px;
                  border-radius: 4px;
                  margin-right: 12px;
                  object-fit: cover;
                }

                .recipe-info {
                  flex: 1;

                  .recipe-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--el-text-color-primary);
                    margin-bottom: 2px;
                  }

                  .recipe-nutrition {
                    font-size: 12px;
                    color: var(--el-text-color-secondary);
                  }
                }
              }
            }
          }
        }
      }

      .nutrition-targets {
        margin-bottom: 24px;

        .targets-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .targets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;

          .target-item {
            .target-label {
              display: block;
              margin-bottom: 4px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }

      .analysis-actions {
        text-align: center;
      }
    }

    .nutrition-summary {
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;

        .summary-card {
          background: var(--el-fill-color-lighter);
          border-radius: 8px;
          padding: 16px;

          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .card-icon {
              font-size: 18px;
            }

            .card-title {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }

          .card-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--el-color-primary);
            margin-bottom: 8px;

            .unit {
              font-size: 12px;
              font-weight: 400;
              color: var(--el-text-color-secondary);
              margin-left: 4px;
            }
          }

          .card-progress {
            margin-bottom: 6px;
          }

          .card-target {
            font-size: 11px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .meal-distribution {
        background: var(--el-fill-color-lighter);
        border-radius: 8px;
        padding: 16px;

        .distribution-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .distribution-chart {
          .distribution-bar {
            background: var(--el-color-primary-light-8);
            border: 1px solid var(--el-color-primary);
            border-radius: 4px;
            margin-bottom: 8px;
            padding: 8px 12px;
            position: relative;
            min-width: 100px;

            .bar-label {
              font-size: 12px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }

            .bar-value {
              font-size: 11px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    .recipe-selector {
      .recipe-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
        margin-top: 16px;
        max-height: 400px;
        overflow-y: auto;

        .recipe-option {
          display: flex;
          background: var(--el-fill-color-lighter);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background: var(--el-fill-color);
          }

          .recipe-option-image {
            width: 60px;
            height: 60px;
            border-radius: 6px;
            margin-right: 12px;
            object-fit: cover;
          }

          .recipe-option-info {
            flex: 1;

            .recipe-option-name {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }

            .recipe-option-nutrition {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .summary-cards {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    .targets-grid {
      grid-template-columns: 1fr !important;
    }

    .recipe-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>
