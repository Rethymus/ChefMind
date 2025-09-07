<template>
  <div class="nutrition-analyzer">
    <!-- API 密钥提醒 -->
    <APIKeyReminder 
      ref="apiKeyReminder" 
      :showQuickConfig="true"
      @open-config="openAPIConfig"
    />
    
    <!-- API 配置弹窗 -->
    <APIConfigModal v-model="showAPIConfig" @config-saved="handleAPIConfigSaved" />
    
    <el-card class="analyzer-card">
      <template #header>
        <div class="card-header">
          <h3>🥗 智能营养分析</h3>
          <p class="subtitle">AI 驱动的营养成分分析与健康建议</p>
        </div>
      </template>

      <!-- 用户信息输入 -->
      <div class="user-profile-section">
        <h4>个人信息 (可选，用于个性化建议)</h4>
        <el-form :model="userProfile" label-width="80px" size="small">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="年龄">
                <el-input-number v-model="userProfile.age" :min="1" :max="120" placeholder="年龄" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-select v-model="userProfile.gender" placeholder="选择性别">
                  <el-option label="男" value="male" />
                  <el-option label="女" value="female" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="身高(cm)">
                <el-input-number
                  v-model="userProfile.height"
                  :min="100"
                  :max="250"
                  placeholder="身高"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="体重(kg)">
                <el-input-number
                  v-model="userProfile.weight"
                  :min="30"
                  :max="200"
                  placeholder="体重"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="活动水平">
            <el-select v-model="userProfile.activityLevel" placeholder="选择活动水平">
              <el-option label="久坐不动" value="sedentary" />
              <el-option label="轻度活动" value="light" />
              <el-option label="中度活动" value="moderate" />
              <el-option label="高强度活动" value="active" />
              <el-option label="极高强度" value="very_active" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 营养分析结果 -->
      <div v-if="nutritionAnalysis" class="analysis-results">
        <!-- 总体评分 -->
        <div class="overall-score">
          <h4>营养评分</h4>
          <div class="score-display">
            <el-progress
              type="circle"
              :percentage="nutritionAnalysis.overallScore"
              :width="120"
              :color="getScoreColor(nutritionAnalysis.overallScore)"
            >
              <template #default="{ percentage }">
                <span class="score-text">{{ percentage }}</span>
                <span class="score-label">分</span>
              </template>
            </el-progress>
            <div class="score-description">
              {{ getScoreDescription(nutritionAnalysis.overallScore) }}
            </div>
          </div>
        </div>

        <!-- 营养成分详情 -->
        <div class="nutrition-details">
          <h4>营养成分分析</h4>
          <div class="nutrition-chart">
            <canvas ref="nutritionChartRef" width="400" height="200"></canvas>
          </div>

          <div class="nutrition-breakdown">
            <div class="nutrient-item" v-for="(value, key) in recipeNutrition" :key="key">
              <div class="nutrient-info">
                <span class="nutrient-name">{{ getNutrientName(String(key)) }}</span>
                <span class="nutrient-value">{{ formatNutrientValue(String(key), value) }}</span>
              </div>
              <div class="nutrient-bar">
                <el-progress
                  :percentage="getNutrientPercentage(String(key), value)"
                  :color="getNutrientColor(String(key))"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 饮食兼容性 -->
        <div class="dietary-compatibility">
          <h4>饮食兼容性</h4>
          <div class="compatibility-tags">
            <el-tag
              v-for="(compatible, diet) in nutritionAnalysis.dietaryCompatibility"
              :key="diet"
              :type="compatible ? 'success' : 'info'"
              :effect="compatible ? 'dark' : 'plain'"
              class="diet-tag"
            >
              {{ getDietName(String(diet)) }}
              <el-icon v-if="compatible"><Check /></el-icon>
              <el-icon v-else><Close /></el-icon>
            </el-tag>
          </div>
        </div>

        <!-- 过敏原警告 -->
        <div v-if="nutritionAnalysis.allergens.length > 0" class="allergens-warning">
          <h4>
            <el-icon class="warning-icon"><Warning /></el-icon>
            过敏原提醒
          </h4>
          <div class="allergens-list">
            <el-tag
              v-for="allergen in nutritionAnalysis.allergens"
              :key="allergen"
              type="danger"
              effect="dark"
              class="allergen-tag"
            >
              {{ allergen }}
            </el-tag>
          </div>
        </div>

        <!-- 健康建议 -->
        <div class="health-recommendations">
          <h4>
            <el-icon><Opportunity /></el-icon>
            健康建议
          </h4>
          <div class="recommendations-list">
            <div
              v-for="(recommendation, index) in nutritionAnalysis.recommendations"
              :key="index"
              class="recommendation-item"
            >
              <el-icon class="rec-icon"><CircleCheck /></el-icon>
              <span>{{ recommendation }}</span>
            </div>
          </div>
        </div>

        <!-- 注意事项 -->
        <div v-if="nutritionAnalysis.warnings.length > 0" class="health-warnings">
          <h4>
            <el-icon class="warning-icon"><Warning /></el-icon>
            注意事项
          </h4>
          <div class="warnings-list">
            <div
              v-for="(warning, index) in nutritionAnalysis.warnings"
              :key="index"
              class="warning-item"
            >
              <el-icon class="warning-icon"><InfoFilled /></el-icon>
              <span>{{ warning }}</span>
            </div>
          </div>
        </div>

        <!-- 个性化建议 -->
        <div v-if="hasUserProfile" class="personalized-suggestions">
          <h4>
            <el-icon><User /></el-icon>
            个性化建议
          </h4>
          <div class="suggestions-content">
            <div class="daily-needs">
              <h5>每日营养需求</h5>
              <div class="needs-grid">
                <div class="need-item">
                  <span class="need-label">热量</span>
                  <span class="need-value">{{ calculateDailyCalories() }} kcal</span>
                </div>
                <div class="need-item">
                  <span class="need-label">蛋白质</span>
                  <span class="need-value">{{ calculateDailyProtein() }}g</span>
                </div>
                <div class="need-item">
                  <span class="need-label">碳水化合物</span>
                  <span class="need-value">{{ calculateDailyCarbs() }}g</span>
                </div>
                <div class="need-item">
                  <span class="need-label">脂肪</span>
                  <span class="need-value">{{ calculateDailyFat() }}g</span>
                </div>
              </div>
            </div>

            <div class="portion-suggestion">
              <h5>建议食用量</h5>
              <p>基于您的个人信息，建议食用 {{ calculateRecommendedPortion() }} 份</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析按钮 -->
      <div class="analyze-section">
        <el-button
          type="primary"
          size="large"
          :loading="isAnalyzing"
          :disabled="!currentRecipe"
          @click="analyzeNutrition"
          class="analyze-btn"
        >
          <el-icon><MagicStick /></el-icon>
          {{ isAnalyzing ? '分析中...' : '开始营养分析' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Check,
    Close,
    Warning,
    Opportunity,
    CircleCheck,
    InfoFilled,
    User,
    MagicStick,
  } from '@element-plus/icons-vue'
  import { aiService, type RecipeRecommendation } from '@/services/aiService'
  import { Chart, registerables } from 'chart.js'
  import APIKeyReminder from '@/components/common/APIKeyReminder.vue'
  import APIConfigModal from '@/components/common/APIConfigModal.vue'

  // 注册 Chart.js 组件
  Chart.register(...registerables)

  // 组件属性
  interface Props {
    recipe?: RecipeRecommendation
  }

  const props = withDefaults(defineProps<Props>(), {
    recipe: undefined,
  })

  // 响应式数据
  const apiKeyReminder = ref()
  const showAPIConfig = ref(false)
  const nutritionChartRef = ref<HTMLCanvasElement>()
  const chartInstance = ref<Chart | null>(null)
  const isAnalyzing = ref(false)
  const nutritionAnalysis = ref<any>()
  const currentRecipe = ref<RecipeRecommendation>()

  // 用户信息
  const userProfile = reactive({
    age: undefined as number | undefined,
    gender: '' as string,
    height: undefined as number | undefined,
    weight: undefined as number | undefined,
    activityLevel: '' as string,
  })

  // 计算属性
  const hasUserProfile = computed(() => {
    return userProfile.age && userProfile.gender && userProfile.height && userProfile.weight
  })

  const recipeNutrition = computed(() => {
    return currentRecipe.value?.nutrition || {}
  })

  // 监听 recipe 变化
  watch(
    () => props.recipe,
    newRecipe => {
      if (newRecipe) {
        currentRecipe.value = newRecipe
        analyzeNutrition()
      }
    },
    { immediate: true }
  )

  // 营养分析
  const analyzeNutrition = async () => {
    if (!currentRecipe.value) {
      ElMessage.warning('请先选择一个食谱')
      return
    }

    // 检查是否使用模拟数据
    if (apiKeyReminder.value?.isUsingMockData) {
      ElMessage.info('当前使用模拟数据进行演示，营养分析结果为示例内容')
    }

    isAnalyzing.value = true

    try {
      // 将PersonalizedRecommendation转换为Recipe兼容格式
      const recipeData = {
        ...currentRecipe.value,
        servings: 1, // 默认值
        cookingMethods: [], // 默认值
        steps: [],
        cookingTime: currentRecipe.value?.cookingTime?.toString() || '30分钟',
      }
      const analysis = await aiService.analyzeNutrition(recipeData)
      nutritionAnalysis.value = analysis

      // 绘制营养图表
      await nextTick()
      drawNutritionChart()

      ElMessage.success('营养分析完成')
    } catch (error) {
      console.error('营养分析失败:', error)
      ElMessage.error('营养分析失败，请重试')
    } finally {
      isAnalyzing.value = false
    }
  }

  // 绘制营养图表
  const drawNutritionChart = () => {
    if (!nutritionChartRef.value || !recipeNutrition.value) return

    const ctx = nutritionChartRef.value.getContext('2d')
    if (!ctx) return

    // 销毁现有图表
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }

    // 创建营养成分图表
    chartInstance.value = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['蛋白质', '碳水化合物', '脂肪'],
        datasets: [
          {
            data: [
              (recipeNutrition.value as any).protein * 4 || 0, // 蛋白质热量
              (recipeNutrition.value as any).carbs * 4 || 0, // 碳水热量
              (recipeNutrition.value as any).fat * 9 || 0, // 脂肪热量
            ],
            backgroundColor: [
              '#67c23a', // 绿色 - 蛋白质
              '#e6a23c', // 橙色 - 碳水
              '#f56c6c', // 红色 - 脂肪
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: context => {
                const label = context.label || ''
                const value = context.parsed
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value.toFixed(0)} kcal (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }

  // 获取评分颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#67c23a'
    if (score >= 60) return '#e6a23c'
    return '#f56c6c'
  }

  // 获取评分描述
  const getScoreDescription = (score: number) => {
    if (score >= 90) return '营养极佳'
    if (score >= 80) return '营养良好'
    if (score >= 70) return '营养一般'
    if (score >= 60) return '营养偏低'
    return '营养不足'
  }

  // 获取营养素名称
  const getNutrientName = (key: string) => {
    const names: Record<string, string> = {
      calories: '热量',
      protein: '蛋白质',
      carbs: '碳水化合物',
      fat: '脂肪',
      fiber: '膳食纤维',
      sugar: '糖分',
      sodium: '钠',
    }
    return names[key] || key
  }

  // 格式化营养素值
  const formatNutrientValue = (key: string, value: number) => {
    if (key === 'calories') return `${value} kcal`
    if (key === 'sodium') return `${value} mg`
    return `${value}g`
  }

  // 获取营养素百分比
  const getNutrientPercentage = (key: string, value: number) => {
    // 基于推荐日摄入量计算百分比
    const dailyValues: Record<string, number> = {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65,
      fiber: 25,
      sugar: 50,
      sodium: 2300,
    }

    const dailyValue = dailyValues[key]
    if (!dailyValue) return 0

    return Math.min((value / dailyValue) * 100, 100)
  }

  // 获取营养素颜色
  const getNutrientColor = (key: string) => {
    const colors: Record<string, string> = {
      calories: '#409eff',
      protein: '#67c23a',
      carbs: '#e6a23c',
      fat: '#f56c6c',
      fiber: '#909399',
      sugar: '#f56c6c',
      sodium: '#f56c6c',
    }
    return colors[key] || '#409eff'
  }

  // 获取饮食名称
  const getDietName = (diet: string) => {
    const names: Record<string, string> = {
      vegetarian: '素食',
      vegan: '纯素',
      glutenFree: '无麸质',
      lowCarb: '低碳水',
      keto: '生酮',
    }
    return names[diet] || diet
  }

  // 计算每日热量需求
  const calculateDailyCalories = () => {
    if (!hasUserProfile.value) return 0

    // 使用 Mifflin-St Jeor 公式
    let bmr = 0
    if (userProfile.gender === 'male') {
      bmr =
        88.362 +
        13.397 * userProfile.weight! +
        4.799 * userProfile.height! -
        5.677 * userProfile.age!
    } else {
      bmr =
        447.593 +
        9.247 * userProfile.weight! +
        3.098 * userProfile.height! -
        4.33 * userProfile.age!
    }

    // 活动系数
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }

    const factor = activityFactors[userProfile.activityLevel] || 1.2
    return Math.round(bmr * factor)
  }

  // 计算每日蛋白质需求
  const calculateDailyProtein = () => {
    if (!userProfile.weight) return 0
    return Math.round(userProfile.weight * 0.8) // 0.8g/kg 体重
  }

  // 计算每日碳水需求
  const calculateDailyCarbs = () => {
    const calories = calculateDailyCalories()
    return Math.round((calories * 0.5) / 4) // 50% 热量来自碳水
  }

  // 计算每日脂肪需求
  const calculateDailyFat = () => {
    const calories = calculateDailyCalories()
    return Math.round((calories * 0.3) / 9) // 30% 热量来自脂肪
  }

  // 计算建议食用量
  const calculateRecommendedPortion = () => {
    if (!currentRecipe.value || !hasUserProfile.value) return 1

    const dailyCalories = calculateDailyCalories()
    const recipeCalories = currentRecipe.value.nutrition?.calories || 0

    // 假设这道菜占每日热量的 25%
    const targetCalories = dailyCalories * 0.25
    const portion = targetCalories / recipeCalories

    return Math.max(0.5, Math.min(3, portion)).toFixed(1)
  }

  // 组件挂载时初始化
  onMounted(() => {
    if (props.recipe) {
      currentRecipe.value = props.recipe
      analyzeNutrition()
    }
  })

  // API 配置相关方法
  const openAPIConfig = () => {
    showAPIConfig.value = true
  }

  const handleAPIConfigSaved = () => {
    ElMessage.success('API 配置已更新')
    // 刷新提醒组件的状态
    if (apiKeyReminder.value) {
      apiKeyReminder.value.resetReminder()
    }
  }

  // 组件销毁时清理图表
  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  })
</script>

<style scoped lang="scss">
  .nutrition-analyzer {
    .analyzer-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      text-align: center;

      h3 {
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
        font-size: 20px;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }

    .user-profile-section {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: 8px;

      h4 {
        margin: 0 0 16px 0;
        color: var(--el-text-color-primary);
        font-size: 16px;
        font-weight: 600;
      }
    }

    .analysis-results {
      .overall-score {
        text-align: center;
        margin-bottom: 32px;

        h4 {
          margin: 0 0 20px 0;
          color: var(--el-text-color-primary);
          font-size: 18px;
          font-weight: 600;
        }

        .score-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;

          .score-text {
            font-size: 24px;
            font-weight: bold;
            color: var(--el-text-color-primary);
          }

          .score-label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }

          .score-description {
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-regular);
          }
        }
      }

      .nutrition-details {
        margin-bottom: 32px;

        h4 {
          margin: 0 0 20px 0;
          color: var(--el-text-color-primary);
          font-size: 18px;
          font-weight: 600;
        }

        .nutrition-chart {
          height: 200px;
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .nutrition-breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .nutrient-item {
            .nutrient-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .nutrient-name {
                font-size: 14px;
                font-weight: 500;
                color: var(--el-text-color-primary);
              }

              .nutrient-value {
                font-size: 14px;
                font-weight: 600;
                color: var(--el-text-color-regular);
              }
            }

            .nutrient-bar {
              :deep(.el-progress-bar__outer) {
                border-radius: 4px;
              }
            }
          }
        }
      }

      .dietary-compatibility {
        margin-bottom: 32px;

        h4 {
          margin: 0 0 16px 0;
          color: var(--el-text-color-primary);
          font-size: 18px;
          font-weight: 600;
        }

        .compatibility-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .diet-tag {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            font-size: 14px;
          }
        }
      }

      .allergens-warning {
        margin-bottom: 32px;

        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          color: var(--el-color-danger);
          font-size: 18px;
          font-weight: 600;

          .warning-icon {
            color: var(--el-color-warning);
          }
        }

        .allergens-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .allergen-tag {
            font-size: 14px;
            padding: 8px 12px;
          }
        }
      }

      .health-recommendations {
        margin-bottom: 32px;

        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          color: var(--el-text-color-primary);
          font-size: 18px;
          font-weight: 600;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .recommendation-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: var(--el-color-success-light-9);
            border-radius: 8px;
            border-left: 4px solid var(--el-color-success);

            .rec-icon {
              color: var(--el-color-success);
              margin-top: 2px;
              flex-shrink: 0;
            }

            span {
              font-size: 14px;
              line-height: 1.5;
              color: var(--el-text-color-primary);
            }
          }
        }
      }

      .health-warnings {
        margin-bottom: 32px;

        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          color: var(--el-color-warning);
          font-size: 18px;
          font-weight: 600;

          .warning-icon {
            color: var(--el-color-warning);
          }
        }

        .warnings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .warning-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: var(--el-color-warning-light-9);
            border-radius: 8px;
            border-left: 4px solid var(--el-color-warning);

            .warning-icon {
              color: var(--el-color-warning);
              margin-top: 2px;
              flex-shrink: 0;
            }

            span {
              font-size: 14px;
              line-height: 1.5;
              color: var(--el-text-color-primary);
            }
          }
        }
      }

      .personalized-suggestions {
        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 20px 0;
          color: var(--el-text-color-primary);
          font-size: 18px;
          font-weight: 600;
        }

        .suggestions-content {
          .daily-needs {
            margin-bottom: 20px;

            h5 {
              margin: 0 0 12px 0;
              color: var(--el-text-color-regular);
              font-size: 16px;
              font-weight: 500;
            }

            .needs-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 12px;

              .need-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 16px;
                background: var(--el-fill-color-lighter);
                border-radius: 8px;

                .need-label {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                  margin-bottom: 4px;
                }

                .need-value {
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                }
              }
            }
          }

          .portion-suggestion {
            h5 {
              margin: 0 0 8px 0;
              color: var(--el-text-color-regular);
              font-size: 16px;
              font-weight: 500;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: var(--el-text-color-primary);
              padding: 12px;
              background: var(--el-color-primary-light-9);
              border-radius: 8px;
              border-left: 4px solid var(--el-color-primary);
            }
          }
        }
      }
    }

    .analyze-section {
      text-align: center;
      margin-top: 24px;

      .analyze-btn {
        padding: 12px 32px;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  @media (max-width: 768px) {
    .nutrition-analyzer {
      .user-profile-section {
        padding: 16px;
      }

      .analysis-results {
        .nutrition-details .nutrition-breakdown {
          .nutrient-item .nutrient-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }

        .dietary-compatibility .compatibility-tags {
          justify-content: center;
        }

        .personalized-suggestions .suggestions-content .daily-needs .needs-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
</style>
