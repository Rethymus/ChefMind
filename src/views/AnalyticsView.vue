<template>
  <div class="analytics-view">
    <!-- 页面标题 -->
    <div class="view-header">
      <h1 class="page-title">个人营养分析</h1>
      <p class="page-subtitle">基于AI的个性化营养评估与健康指导</p>
    </div>

    <!-- 主要内容 -->
    <div class="analytics-content">
      <!-- 四个模块卡片 -->
      <div class="modules-container">
        <!-- 模块 1: 个人信息 -->
        <div class="analysis-module personal-info-module">
          <div class="module-header">
            <div class="header-left">
              <el-icon class="module-icon" :size="24" color="#667eea">
                <User />
              </el-icon>
              <h3 class="module-title">个人信息</h3>
            </div>
            <el-button type="primary" :icon="Edit" @click="showProfileDialog = true" size="small">
              {{ hasUserData ? '重新分析' : '开始分析' }}
            </el-button>
          </div>

          <div class="module-content">
            <!-- 无数据状态 -->
            <div v-if="!hasUserData" class="empty-state">
              <el-empty description="点击右上角「开始分析」按钮填写信息进行AI营养分析" />
            </div>

            <!-- 有数据状态 -->
            <div v-else class="personal-info-grid">
              <div class="info-card basic-info">
                <h4 class="info-title">基本信息</h4>
                <div class="info-item">
                  <span class="info-label">性别</span>
                  <span class="info-value">{{ userProfile?.gender === 'male' ? '男' : '女' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">年龄</span>
                  <span class="info-value">{{ userProfile?.age }}岁</span>
                </div>
                <div class="info-item">
                  <span class="info-label">身高</span>
                  <span class="info-value">{{ userProfile?.height }}cm</span>
                </div>
                <div class="info-item">
                  <span class="info-label">体重</span>
                  <span class="info-value">{{ userProfile?.weight }}kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">BMI</span>
                  <span class="info-value">
                    {{ healthMetrics?.bmi }}
                    <el-tag
                      :type="healthMetrics?.bmiStatus === 'normal' ? 'success' : 'warning'"
                      size="small"
                    >
                      {{ healthMetrics?.bmiStatusText }}
                    </el-tag>
                  </span>
                </div>
              </div>

              <div class="info-card health-goals">
                <h4 class="info-title">健康目标</h4>
                <div class="goals-list">
                  <el-tag
                    v-for="goal in userProfile?.healthGoals"
                    :key="goal"
                    type="primary"
                    size="small"
                    class="goal-tag"
                  >
                    {{ goal }}
                  </el-tag>
                </div>
              </div>

              <div class="info-card activity-level">
                <h4 class="info-title">活动水平</h4>
                <div class="activity-display">
                  <span class="activity-text">{{
                    getActivityLevelText(userProfile?.activityLevel)
                  }}</span>
                </div>
              </div>

              <div class="info-card meal-records">
                <h4 class="info-title">今日饮食记录</h4>
                <div class="meals-summary">
                  <span class="meals-count">{{ userProfile?.meals?.length || 0 }}餐</span>
                  <el-button
                    v-if="hasMealData && !hasCompletedAnalysis"
                    type="success"
                    size="small"
                    @click="performNutritionAnalysis"
                    :loading="isAnalyzing"
                  >
                    开始AI分析
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模块 2: 营养概览 -->
        <div class="analysis-module nutrition-overview-module">
          <div class="module-header">
            <div class="header-left">
              <el-icon class="module-icon" :size="24" color="#67C23A">
                <DataLine />
              </el-icon>
              <h3 class="module-title">营养概览</h3>
            </div>
            <div v-if="nutritionAnalysis" class="confidence-score">
              <span class="score-label">AI可信度</span>
              <span class="score-value">{{ nutritionAnalysis.confidenceScore }}%</span>
            </div>
          </div>

          <div class="module-content">
            <!-- 分析中状态 -->
            <div v-if="isAnalyzing" class="loading-state">
              <el-skeleton :rows="4" animated />
              <p class="loading-text">AI正在分析您的营养状况...</p>
            </div>

            <!-- 无分析结果状态 -->
            <div v-else-if="!nutritionAnalysis" class="empty-analysis">
              <el-empty v-if="!hasUserData" description="填写个人信息后即可进行营养分析" />
              <el-empty
                v-else
                description="您可以重新填写信息进行新的营养分析，或查看之前的分析结果"
              >
                <el-button type="primary" @click="showProfileDialog = true" size="large">
                  重新分析
                </el-button>
              </el-empty>
            </div>

            <!-- 有分析结果状态 -->
            <div v-else class="nutrition-overview-grid">
              <!-- 热量对比 -->
              <div class="nutrition-category">
                <h4 class="category-title">热量摄入</h4>
                <div class="nutrition-comparison">
                  <div class="comparison-item needs">
                    <span class="item-label">每日所需</span>
                    <span class="item-value">{{ nutritionAnalysis.dailyNeeds.calories }}</span>
                    <span class="item-unit">kcal</span>
                  </div>
                  <div class="comparison-arrow">→</div>
                  <div class="comparison-item current">
                    <span class="item-label">当前摄入</span>
                    <span class="item-value">{{ nutritionAnalysis.currentIntake.calories }}</span>
                    <span class="item-unit">kcal</span>
                  </div>
                  <div class="comparison-status">
                    <el-tag :type="getCalorieStatusType()" size="small">
                      {{ getCalorieStatusText() }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <!-- 三大营养素 -->
              <div class="nutrition-category">
                <h4 class="category-title">三大营养素</h4>
                <div class="macronutrients-grid">
                  <div class="macro-item">
                    <div class="macro-header">
                      <span class="macro-name">蛋白质</span>
                      <span class="macro-values">
                        {{ nutritionAnalysis.currentIntake.protein }}g /
                        {{ nutritionAnalysis.dailyNeeds.protein }}g
                      </span>
                    </div>
                    <el-progress
                      :percentage="nutritionPercentages.protein || 0"
                      :color="
                        getNutrientStatusColor(
                          nutritionAnalysis.analysis.adequacyRatios.protein || 0
                        )
                      "
                    />
                  </div>

                  <div class="macro-item">
                    <div class="macro-header">
                      <span class="macro-name">碳水化合物</span>
                      <span class="macro-values">
                        {{ nutritionAnalysis.currentIntake.carbs }}g /
                        {{ nutritionAnalysis.dailyNeeds.carbs }}g
                      </span>
                    </div>
                    <el-progress
                      :percentage="nutritionPercentages.carbs || 0"
                      :color="
                        getNutrientStatusColor(nutritionAnalysis.analysis.adequacyRatios.carbs || 0)
                      "
                    />
                  </div>

                  <div class="macro-item">
                    <div class="macro-header">
                      <span class="macro-name">脂肪</span>
                      <span class="macro-values">
                        {{ nutritionAnalysis.currentIntake.fat }}g /
                        {{ nutritionAnalysis.dailyNeeds.fat }}g
                      </span>
                    </div>
                    <el-progress
                      :percentage="nutritionPercentages.fat || 0"
                      :color="
                        getNutrientStatusColor(nutritionAnalysis.analysis.adequacyRatios.fat || 0)
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模块 3: 营养平衡分析 -->
        <div class="analysis-module nutrition-balance-module">
          <div class="module-header">
            <div class="header-left">
              <el-icon class="module-icon" :size="24" color="#E6A23C">
                <TrendCharts />
              </el-icon>
              <h3 class="module-title">营养平衡分析</h3>
            </div>
            <div v-if="nutritionAnalysis" class="balance-score">
              <span class="score-label">平衡度</span>
              <span class="score-value">{{ nutritionAnalysis.analysis.balanceScore }}%</span>
            </div>
          </div>

          <div class="module-content">
            <div v-if="!nutritionAnalysis" class="empty-analysis">
              <el-empty description="暂无营养平衡分析数据" />
            </div>

            <div v-else class="balance-analysis-content">
              <!-- 营养充足率列表 -->
              <div class="nutrients-analysis">
                <h4 class="section-title">营养素充足率</h4>
                <div class="nutrients-list">
                  <div
                    v-for="(ratio, nutrient) in nutritionAnalysis.analysis.adequacyRatios"
                    :key="nutrient"
                    class="nutrient-item"
                  >
                    <div class="nutrient-info">
                      <span class="nutrient-name">{{ getNutrientDisplayName(nutrient) }}</span>
                      <span class="nutrient-ratio">{{ Math.round(ratio * 100) }}%</span>
                    </div>
                    <el-progress
                      :percentage="Math.min(Math.round(ratio * 100), 150)"
                      :color="getNutrientStatusColor(ratio)"
                      :show-text="false"
                      :stroke-width="8"
                    />
                    <div class="nutrient-status">
                      <el-tag :type="getNutrientStatusTagType(ratio)" size="small">
                        {{ getNutrientStatusText(ratio) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 中国膳食指南参考 -->
              <div class="guidelines-reference">
                <h4 class="section-title">膳食指南参考</h4>
                <div class="guidelines-list">
                  <div
                    v-for="guideline in dietaryGuidelines.coreRecommendations.slice(0, 3)"
                    :key="guideline.title"
                    class="guideline-item"
                  >
                    <h5 class="guideline-title">{{ guideline.title }}</h5>
                    <p class="guideline-desc">{{ guideline.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模块 4: AI智能分析 -->
        <div class="analysis-module ai-analysis-module">
          <div class="module-header">
            <div class="header-left">
              <el-icon class="module-icon" :size="24" color="#F56C6C">
                <MagicStick />
              </el-icon>
              <h3 class="module-title">AI智能分析</h3>
            </div>
            <div class="ai-badge">
              <span class="badge-text">GLM分析</span>
            </div>
          </div>

          <div class="module-content">
            <div v-if="!nutritionAnalysis" class="empty-analysis">
              <el-empty description="请先完成营养分析获取AI建议" />
            </div>

            <div v-else class="ai-analysis-content">
              <!-- AI个性化建议 -->
              <div class="ai-section recommendations">
                <h4 class="section-title">
                  <span class="title-icon">🎯</span>
                  个性化建议
                </h4>
                <div class="recommendations-list">
                  <div
                    v-for="(recommendation, index) in nutritionAnalysis.analysis.recommendations"
                    :key="index"
                    class="recommendation-item"
                  >
                    <div class="item-marker">{{ index + 1 }}</div>
                    <div class="item-content">{{ recommendation }}</div>
                  </div>
                </div>
              </div>

              <!-- 健康风险评估 -->
              <div class="ai-section risks">
                <h4 class="section-title">
                  <span class="title-icon">⚠️</span>
                  健康风险评估
                </h4>
                <div class="risks-list">
                  <div
                    v-for="(risk, index) in nutritionAnalysis.analysis.riskAssessments"
                    :key="index"
                    class="risk-item"
                    :class="risk.level"
                  >
                    <div class="risk-level">
                      <el-tag :type="getRiskLevelColor(risk.level)" size="small">
                        {{
                          risk.level === 'low'
                            ? '低风险'
                            : risk.level === 'medium'
                              ? '中风险'
                              : '高风险'
                        }}
                      </el-tag>
                    </div>
                    <div class="risk-content">
                      <span class="risk-title">{{ risk.title }}</span>
                      <span class="risk-desc">{{ risk.description }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 改进建议 -->
              <div class="ai-section improvements">
                <h4 class="section-title">
                  <span class="title-icon">💡</span>
                  改进建议
                </h4>
                <div class="improvements-list">
                  <div
                    v-for="(improvement, index) in nutritionAnalysis.analysis
                      .improvementSuggestions"
                    :key="index"
                    class="improvement-item"
                  >
                    <el-tag type="info" size="small" class="category-tag">
                      {{ improvement.category }}
                    </el-tag>
                    <span class="improvement-text">{{ improvement.suggestion }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户资料对话框 -->
    <el-dialog
      v-model="showProfileDialog"
      title="个人资料"
      width="800px"
      :close-on-click-modal="false"
    >
      <UserProfileForm
        :initial-data="convertProfileToFormData(userProfile)"
        @submit="saveUserProfile"
        @cancel="showProfileDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import {
    ElMessage,
    ElDialog,
    ElButton,
    ElProgress,
    ElTag,
    ElEmpty,
    ElSkeleton,
  } from 'element-plus'
  import { Edit, User, DataLine, TrendCharts, MagicStick } from '@element-plus/icons-vue'
  import UserProfileForm from '@/components/common/UserProfileForm.vue'
  import {
    nutritionAnalysisService,
    type UserProfile,
    type NutritionAnalysisResult,
  } from '@/services/nutritionAnalysisService'

  // 响应式状态
  const showProfileDialog = ref(false)
  const isAnalyzing = ref(false)
  const hasCompletedAnalysis = ref(false)

  // 用户档案 - 初始为空
  const userProfile = ref<UserProfile | null>(null)

  // 营养分析结果
  const nutritionAnalysis = ref<NutritionAnalysisResult | null>(null)

  // 计算属性：是否有用户数据
  const hasUserData = computed(() => {
    return (
      userProfile.value !== null &&
      userProfile.value.age > 0 &&
      userProfile.value.height > 0 &&
      userProfile.value.weight > 0
    )
  })

  // 计算属性：是否有饮食记录
  const hasMealData = computed(() => {
    return userProfile.value?.meals && userProfile.value.meals.length > 0
  })

  // 计算属性：健康指标
  const healthMetrics = computed(() => {
    if (!userProfile.value) return null
    return nutritionAnalysisService.calculateHealthMetrics(userProfile.value)
  })

  // 计算属性：营养充足率百分比
  const nutritionPercentages = computed(() => {
    if (!nutritionAnalysis.value) return {}

    const percentages: Record<string, number> = {}
    const { adequacyRatios } = nutritionAnalysis.value.analysis

    Object.entries(adequacyRatios).forEach(([nutrient, ratio]) => {
      percentages[nutrient] = Math.min(Math.round(ratio * 100), 150) // 限制最大150%
    })

    return percentages
  })

  // 活动水平映射函数
  const mapActivityLevel = (formLevel: string): UserProfile['activityLevel'] => {
    const mapping: Record<string, UserProfile['activityLevel']> = {
      low: 'sedentary',
      moderate: 'moderate',
      high: 'active',
    }
    return mapping[formLevel] || 'moderate'
  }

  // 反向映射活动水平
  const mapActivityLevelReverse = (
    profileLevel: UserProfile['activityLevel']
  ): 'low' | 'moderate' | 'high' => {
    const mapping: Record<UserProfile['activityLevel'], 'low' | 'moderate' | 'high'> = {
      sedentary: 'low',
      light: 'low',
      moderate: 'moderate',
      active: 'high',
      veryActive: 'high',
    }
    return mapping[profileLevel] || 'moderate'
  }

  // 将用户档案转换为表单数据
  const convertProfileToFormData = (profile: UserProfile | null) => {
    if (!profile) return {}

    return {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: mapActivityLevelReverse(profile.activityLevel),
      healthGoals: profile.healthGoals || [],
      medicalConditions: profile.medicalConditions || [],
      allergies: profile.allergies?.join(', ') || '',
      dietaryPreferences: profile.dietaryRestrictions || [],
      meals:
        profile.meals?.map(meal => ({
          type: meal.type,
          description: meal.foods?.map(food => food.name).join(', ') || '',
        })) || [],
    }
  }

  // 将表单数据转换为用户档案
  const convertFormDataToProfile = (formData: any): UserProfile => {
    return {
      name: formData.name || '用户',
      age: formData.age || 25,
      gender: formData.gender || 'male',
      height: formData.height || 170,
      weight: formData.weight || 65,
      activityLevel: mapActivityLevel(formData.activityLevel),
      healthGoals: formData.healthGoals || [],
      medicalConditions: formData.medicalConditions || [],
      allergies: formData.allergies ? [formData.allergies] : [],
      dietaryRestrictions: formData.dietaryPreferences || [],
      meals:
        formData.meals?.map((meal: any) => ({
          type: meal.type,
          foods: meal.description
            ? [
                {
                  name: meal.description,
                  amount: 1,
                  unit: '份',
                },
              ]
            : [],
          time: new Date().toISOString(),
        })) || [],
    }
  }

  // 保存用户资料
  const saveUserProfile = async (formData: any) => {
    try {
      const profile = convertFormDataToProfile(formData)
      userProfile.value = profile
      showProfileDialog.value = false

      // 保存到本地存储
      localStorage.setItem('chefMind_userProfile', JSON.stringify(profile))

      ElMessage.success('个人资料保存成功！')

      // 提示用户可以进行营养分析
      if (!hasMealData.value) {
        ElMessage.info('资料已保存，您可以进行基础营养分析，或添加饮食记录获得更精确的分析')
      }
    } catch (error) {
      console.error('保存用户资料失败:', error)
      ElMessage.error('保存失败，请重试')
    }
  }

  // 执行营养分析
  const performNutritionAnalysis = async () => {
    if (!userProfile.value) {
      ElMessage.warning('请先完善个人信息')
      showProfileDialog.value = true
      return
    }

    // 检查基本信息是否完整
    if (!hasUserData.value) {
      ElMessage.warning('请先填写完整的个人基本信息')
      showProfileDialog.value = true
      return
    }

    try {
      isAnalyzing.value = true
      ElMessage.info('正在进行AI营养分析，请稍候...')

      // 如果没有饮食记录，创建一个空的meals数组进行基础分析
      const profileForAnalysis = {
        ...userProfile.value,
        meals: userProfile.value.meals || [],
      }

      // 调用AI营养分析服务
      nutritionAnalysis.value = await nutritionAnalysisService.analyzeNutrition(profileForAnalysis)
      hasCompletedAnalysis.value = true

      ElMessage.success('营养分析完成！')
    } catch (error) {
      console.error('营养分析失败:', error)
      ElMessage.error('分析失败，请检查网络连接后重试')
    } finally {
      isAnalyzing.value = false
    }
  }

  // 获取活动水平文本
  const getActivityLevelText = (level: string) => {
    const levelMap = {
      sedentary: '久坐少动',
      light: '轻度活动',
      moderate: '中度活动',
      active: '高度活动',
      veryActive: '极高活动',
    }
    return levelMap[level] || '中度活动'
  }

  // 获取热量状态类型
  const getCalorieStatusType = () => {
    if (!nutritionAnalysis.value) return 'info'
    const { currentIntake, dailyNeeds } = nutritionAnalysis.value
    const ratio = currentIntake.calories / dailyNeeds.calories

    if (ratio < 0.8) return 'warning'
    if (ratio > 1.2) return 'danger'
    return 'success'
  }

  // 获取热量状态文本
  const getCalorieStatusText = () => {
    if (!nutritionAnalysis.value) return '未知'
    const { currentIntake, dailyNeeds } = nutritionAnalysis.value
    const ratio = currentIntake.calories / dailyNeeds.calories

    if (ratio < 0.8) return '不足'
    if (ratio > 1.2) return '过量'
    return '适宜'
  }

  // 获取营养素状态颜色
  const getNutrientStatusColor = (ratio: number) => {
    if (ratio < 0.6) return '#F56C6C' // 严重不足 - 红色
    if (ratio < 0.8) return '#E6A23C' // 不足 - 黄色
    if (ratio <= 1.2) return '#67C23A' // 合适 - 绿色
    return '#E6A23C' // 过量 - 黄色
  }

  // 获取营养素状态标签类型
  const getNutrientStatusTagType = (ratio: number) => {
    if (ratio < 0.6) return 'danger'
    if (ratio < 0.8) return 'warning'
    if (ratio <= 1.2) return 'success'
    return 'warning'
  }

  // 获取营养素状态文本
  const getNutrientStatusText = (ratio: number) => {
    if (ratio < 0.6) return '严重不足'
    if (ratio < 0.8) return '不足'
    if (ratio <= 1.2) return '合适'
    return '过量'
  }

  // 获取营养素显示名称
  const getNutrientDisplayName = (nutrient: string) => {
    const nameMap = {
      calories: '热量',
      protein: '蛋白质',
      carbs: '碳水化合物',
      fat: '脂肪',
      fiber: '膳食纤维',
      sodium: '钠',
      calcium: '钙',
      iron: '铁',
      vitaminC: '维生素C',
      vitaminD: '维生素D',
    }
    return nameMap[nutrient] || nutrient
  }

  // 获取风险等级颜色
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'success'
      case 'medium':
        return 'warning'
      case 'high':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 获取膳食指南信息
  const dietaryGuidelines = computed(() => {
    return nutritionAnalysisService.getDietaryGuidelines()
  })

  // 组件挂载时检查数据
  onMounted(() => {
    // 检查是否有保存的用户数据
    const savedProfile = localStorage.getItem('chefMind_userProfile')
    if (savedProfile) {
      try {
        userProfile.value = JSON.parse(savedProfile)
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    }
  })
</script>

<style scoped lang="scss">
  @use '@/styles/variables.scss' as *;

  .analytics-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    padding: 2rem;

    .view-header {
      text-align: center;
      margin-bottom: 3rem;

      .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .page-subtitle {
        font-size: 1.1rem;
        color: #7f8c8d;
        margin: 0;
      }
    }

    .analytics-content {
      max-width: 1400px;
      margin: 0 auto;
    }
  }

  .modules-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  }

  .analysis-module {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow:
        0 12px 48px rgba(0, 0, 0, 0.15),
        0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f5f7fa;

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .module-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }
      }

      .confidence-score,
      .balance-score {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .score-label {
          font-size: 0.875rem;
          color: #7f8c8d;
        }

        .score-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #67c23a;
        }
      }

      .ai-badge {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }
    }

    .module-content {
      .empty-state,
      .empty-analysis {
        text-align: center;
        padding: 2rem 1rem;
      }

      .loading-state {
        .loading-text {
          text-align: center;
          color: #7f8c8d;
          margin-top: 1rem;
          font-style: italic;
        }
      }
    }
  }

  // 个人信息模块样式
  .personal-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    .info-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid #e2e8f0;

      .info-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
        margin: 0 0 0.75rem 0;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .info-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      .goals-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .goal-tag {
          font-size: 0.75rem;
        }
      }

      .activity-display {
        .activity-text {
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
        }
      }

      .meals-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .meals-count {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
      }
    }
  }

  // 营养概览模块样式
  .nutrition-overview-grid {
    .nutrition-category {
      margin-bottom: 1.5rem;

      .category-title {
        font-size: 1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .nutrition-comparison {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: #f8fafc;
        padding: 1rem;
        border-radius: 12px;

        .comparison-item {
          text-align: center;

          .item-label {
            display: block;
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 0.25rem;
          }

          .item-value {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
          }

          .item-unit {
            font-size: 0.75rem;
            color: #64748b;
          }
        }

        .comparison-arrow {
          font-size: 1.5rem;
          color: #67c23a;
        }
      }

      .macronutrients-grid {
        .macro-item {
          margin-bottom: 1rem;

          .macro-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;

            .macro-name {
              font-size: 0.875rem;
              font-weight: 500;
              color: #2c3e50;
            }

            .macro-values {
              font-size: 0.75rem;
              color: #64748b;
            }
          }
        }
      }
    }
  }

  // 营养平衡分析模块样式
  .balance-analysis-content {
    .nutrients-analysis {
      margin-bottom: 2rem;

      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .nutrients-list {
        .nutrient-item {
          margin-bottom: 1rem;

          .nutrient-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;

            .nutrient-name {
              font-size: 0.875rem;
              color: #2c3e50;
            }

            .nutrient-ratio {
              font-size: 0.875rem;
              font-weight: 600;
              color: #1e293b;
            }
          }

          .nutrient-status {
            margin-top: 0.5rem;
          }
        }
      }
    }

    .guidelines-reference {
      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .guidelines-list {
        .guideline-item {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;

          .guideline-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 0.5rem 0;
          }

          .guideline-desc {
            font-size: 0.75rem;
            color: #64748b;
            margin: 0;
            line-height: 1.4;
          }
        }
      }
    }
  }

  // AI智能分析模块样式
  .ai-analysis-content {
    .ai-section {
      margin-bottom: 2rem;

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1rem;

        .title-icon {
          font-size: 1.125rem;
        }
      }

      .recommendations-list {
        .recommendation-item {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          background: #f0f9ff;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;

          .item-marker {
            flex-shrink: 0;
            width: 1.5rem;
            height: 1.5rem;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .item-content {
            font-size: 0.875rem;
            color: #1e293b;
            line-height: 1.5;
          }
        }
      }

      .risks-list {
        .risk-item {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          background: #fefefe;
          border-radius: 8px;
          border: 1px solid #e5e7eb;

          .risk-content {
            flex: 1;

            .risk-title {
              display: block;
              font-size: 0.875rem;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 0.25rem;
            }

            .risk-desc {
              font-size: 0.75rem;
              color: #64748b;
              line-height: 1.4;
            }
          }
        }
      }

      .improvements-list {
        .improvement-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          background: #fefdf8;
          border-radius: 8px;
          border-left: 3px solid #f59e0b;

          .category-tag {
            flex-shrink: 0;
          }

          .improvement-text {
            font-size: 0.875rem;
            color: #1e293b;
            line-height: 1.5;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .analytics-view {
      padding: 1rem;
    }

    .personal-info-grid {
      grid-template-columns: 1fr;
    }

    .modules-container {
      gap: 1rem;
    }

    .analysis-module {
      padding: 1rem;
    }
  }
</style>
