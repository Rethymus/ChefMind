<template>
  <div class="advanced-nutrition-analyzer">
    <div class="analyzer-header">
      <h2 class="analyzer-title">
        <span class="title-icon">🧬</span>
        高级营养分析器
      </h2>
      <p class="analyzer-subtitle">基于AI的精准营养成分分析与个性化健康建议</p>
    </div>

    <!-- 分析模式选择 -->
    <div class="analysis-modes">
      <el-tabs v-model="activeMode" @tab-change="handleModeChange">
        <el-tab-pane label="🍽️ 食谱分析" name="recipe">
          <RecipeNutritionAnalysis @analysis-complete="handleAnalysisComplete" />
        </el-tab-pane>

        <el-tab-pane label="🥕 食材分析" name="ingredient">
          <IngredientNutritionAnalysis @analysis-complete="handleAnalysisComplete" />
        </el-tab-pane>

        <el-tab-pane label="📋 饮食计划" name="meal-plan">
          <MealPlanAnalysis @analysis-complete="handleAnalysisComplete" />
        </el-tab-pane>

        <el-tab-pane label="📊 营养对比" name="comparison">
          <NutritionComparison @comparison-complete="handleComparisonComplete" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 分析结果展示 -->
    <div v-if="analysisResult" class="analysis-results">
      <!-- 营养概览卡片 -->
      <div class="nutrition-overview">
        <h3 class="section-title">营养成分概览</h3>

        <div class="macro-nutrients">
          <div class="nutrient-card calories">
            <div class="nutrient-header">
              <span class="nutrient-icon">🔥</span>
              <span class="nutrient-name">总热量</span>
            </div>
            <div class="nutrient-value">
              {{ analysisResult.calories.toFixed(0) }}
              <span class="unit">千卡</span>
            </div>
            <div class="nutrient-progress">
              <el-progress
                :percentage="getCaloriePercentage()"
                :color="getCalorieColor()"
                :show-text="false"
              />
            </div>
            <div class="nutrient-target">目标: {{ dailyTargets.calories }} 千卡</div>
          </div>

          <div class="nutrient-card protein">
            <div class="nutrient-header">
              <span class="nutrient-icon">🥩</span>
              <span class="nutrient-name">蛋白质</span>
            </div>
            <div class="nutrient-value">
              {{ analysisResult.protein.toFixed(1) }}
              <span class="unit">克</span>
            </div>
            <div class="nutrient-progress">
              <el-progress
                :percentage="getProteinPercentage()"
                color="#67C23A"
                :show-text="false"
              />
            </div>
            <div class="nutrient-target">目标: {{ dailyTargets.protein }} 克</div>
          </div>

          <div class="nutrient-card carbs">
            <div class="nutrient-header">
              <span class="nutrient-icon">🌾</span>
              <span class="nutrient-name">碳水化合物</span>
            </div>
            <div class="nutrient-value">
              {{ analysisResult.carbs.toFixed(1) }}
              <span class="unit">克</span>
            </div>
            <div class="nutrient-progress">
              <el-progress :percentage="getCarbsPercentage()" color="#E6A23C" :show-text="false" />
            </div>
            <div class="nutrient-target">目标: {{ dailyTargets.carbs }} 克</div>
          </div>

          <div class="nutrient-card fat">
            <div class="nutrient-header">
              <span class="nutrient-icon">🥑</span>
              <span class="nutrient-name">脂肪</span>
            </div>
            <div class="nutrient-value">
              {{ analysisResult.fat.toFixed(1) }}
              <span class="unit">克</span>
            </div>
            <div class="nutrient-progress">
              <el-progress :percentage="getFatPercentage()" color="#F56C6C" :show-text="false" />
            </div>
            <div class="nutrient-target">目标: {{ dailyTargets.fat }} 克</div>
          </div>
        </div>
      </div>

      <!-- 详细营养信息 -->
      <div class="detailed-nutrition">
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="nutrition-category">
              <h4 class="category-title">
                <span class="category-icon">💊</span>
                维生素
              </h4>
              <div class="nutrient-list">
                <div v-for="vitamin in vitamins" :key="vitamin.name" class="nutrient-item">
                  <div class="nutrient-info">
                    <span class="nutrient-label">{{ vitamin.name }}</span>
                    <span class="nutrient-amount">{{ vitamin.amount }}</span>
                  </div>
                  <div class="nutrient-bar">
                    <div class="bar-fill" :style="{ width: `${vitamin.percentage}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="nutrition-category">
              <h4 class="category-title">
                <span class="category-icon">⚡</span>
                矿物质
              </h4>
              <div class="nutrient-list">
                <div v-for="mineral in minerals" :key="mineral.name" class="nutrient-item">
                  <div class="nutrient-info">
                    <span class="nutrient-label">{{ mineral.name }}</span>
                    <span class="nutrient-amount">{{ mineral.amount }}</span>
                  </div>
                  <div class="nutrient-bar">
                    <div class="bar-fill" :style="{ width: `${mineral.percentage}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="nutrition-category">
              <h4 class="category-title">
                <span class="category-icon">🌿</span>
                其他成分
              </h4>
              <div class="nutrient-list">
                <div v-for="other in otherNutrients" :key="other.name" class="nutrient-item">
                  <div class="nutrient-info">
                    <span class="nutrient-label">{{ other.name }}</span>
                    <span class="nutrient-amount">{{ other.amount }}</span>
                  </div>
                  <div class="nutrient-bar">
                    <div class="bar-fill" :style="{ width: `${other.percentage}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- AI营养建议 -->
      <div class="ai-recommendations">
        <h3 class="section-title">
          <span class="title-icon">🤖</span>
          AI营养建议
        </h3>

        <div class="recommendations-grid">
          <div
            v-for="recommendation in nutritionRecommendations"
            :key="recommendation.id"
            class="recommendation-card"
            :class="recommendation.type"
          >
            <div class="recommendation-header">
              <span class="recommendation-icon">{{ recommendation.icon }}</span>
              <span class="recommendation-title">{{ recommendation.title }}</span>
            </div>
            <p class="recommendation-content">{{ recommendation.content }}</p>
            <div v-if="recommendation.tips" class="recommendation-tips">
              <h5>小贴士：</h5>
              <ul>
                <li v-for="tip in recommendation.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 营养时间轴 -->
      <div class="nutrition-timeline">
        <h3 class="section-title">
          <span class="title-icon">⏰</span>
          建议用餐时间
        </h3>

        <div class="timeline-container">
          <div v-for="meal in mealTimeline" :key="meal.time" class="timeline-item">
            <div class="timeline-time">{{ meal.time }}</div>
            <div class="timeline-content">
              <h4 class="meal-name">{{ meal.name }}</h4>
              <p class="meal-description">{{ meal.description }}</p>
              <div class="meal-nutrients">
                <span class="nutrient-tag">{{ meal.calories }}千卡</span>
                <span class="nutrient-tag">蛋白质 {{ meal.protein }}g</span>
                <span class="nutrient-tag">碳水 {{ meal.carbs }}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="generateReport" type="primary" :icon="DocumentAdd">
          生成营养报告
        </el-button>
        <el-button @click="saveAnalysis" :icon="FolderAdd"> 保存分析结果 </el-button>
        <el-button @click="shareAnalysis" :icon="Share"> 分享分析 </el-button>
        <el-button @click="exportData" :icon="Download"> 导出数据 </el-button>
      </div>
    </div>

    <!-- 营养报告对话框 -->
    <el-dialog v-model="reportDialogVisible" title="营养分析报告" width="90%" max-width="800px">
      <NutritionReport
        v-if="reportDialogVisible"
        :analysis-data="analysisResult"
        :recommendations="nutritionRecommendations"
        @report-generated="handleReportGenerated"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DocumentAdd, FolderAdd, Share, Download } from '@element-plus/icons-vue'
  import RecipeNutritionAnalysis from './components/RecipeNutritionAnalysis.vue'
  import IngredientNutritionAnalysis from './components/IngredientNutritionAnalysis.vue'
  import MealPlanAnalysis from './components/MealPlanAnalysis.vue'
  import NutritionComparison from './components/NutritionComparison.vue'
  import NutritionReport from './components/NutritionReport.vue'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'

  // 营养分析结果接口
  interface NutritionAnalysisResult {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
    vitamins: { [key: string]: number }
    minerals: { [key: string]: number }
    analysisDate: Date
    confidence: number
  }

  // 响应式数据
  const activeMode = ref('recipe')
  const analysisResult = ref<NutritionAnalysisResult | null>(null)
  const reportDialogVisible = ref(false)

  // 组合式函数
  const { trackEvent } = useUserBehaviorAnalytics()

  // 每日营养目标
  const dailyTargets = ref({
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 67,
  })

  // 维生素数据
  const vitamins = computed(() => [
    { name: '维生素A', amount: '450μg', percentage: 75 },
    { name: '维生素C', amount: '68mg', percentage: 85 },
    { name: '维生素D', amount: '12μg', percentage: 60 },
    { name: '维生素E', amount: '8mg', percentage: 65 },
    { name: '维生素K', amount: '89μg', percentage: 80 },
    { name: '叶酸', amount: '245μg', percentage: 70 },
  ])

  // 矿物质数据
  const minerals = computed(() => [
    { name: '钙', amount: '680mg', percentage: 68 },
    { name: '铁', amount: '12mg', percentage: 75 },
    { name: '锌', amount: '8mg', percentage: 80 },
    { name: '镁', amount: '145mg', percentage: 65 },
    { name: '钾', amount: '2100mg', percentage: 60 },
    { name: '磷', amount: '540mg', percentage: 70 },
  ])

  // 其他营养成分
  const otherNutrients = computed(() => [
    { name: '膳食纤维', amount: '28g', percentage: 85 },
    { name: 'Omega-3', amount: '1.2g', percentage: 90 },
    { name: '胆固醇', amount: '45mg', percentage: 25 },
    { name: '糖分', amount: '35g', percentage: 40 },
    { name: '钠', amount: '1680mg', percentage: 70 },
    { name: '抗氧化剂', amount: '高', percentage: 88 },
  ])

  // AI营养建议
  const nutritionRecommendations = computed(() => [
    {
      id: '1',
      type: 'good' as const,
      icon: '✅',
      title: '营养均衡',
      content: '您的饮食搭配很好，蛋白质、碳水化合物和脂肪比例合理，能够满足日常营养需求。',
      tips: ['继续保持当前的饮食模式', '可以适当增加蔬菜摄入量'],
    },
    {
      id: '2',
      type: 'warning' as const,
      icon: '⚠️',
      title: '钠含量偏高',
      content: '今日钠摄入量超过建议值，长期高钠饮食可能增加高血压风险。',
      tips: ['减少添加盐和调料的使用', '选择低钠或无盐调料', '多吃新鲜蔬果'],
    },
    {
      id: '3',
      type: 'improvement' as const,
      icon: '💡',
      title: '维生素D不足',
      content: '维生素D摄入量略低，建议增加富含维生素D的食物或适当晒太阳。',
      tips: ['多吃深海鱼类', '适当户外活动', '考虑维生素D补充剂'],
    },
  ])

  // 用餐时间建议
  const mealTimeline = computed(() => [
    {
      time: '07:00-08:00',
      name: '早餐',
      description: '营养丰富的早餐，为一天提供能量',
      calories: 400,
      protein: 15,
      carbs: 45,
    },
    {
      time: '10:00-10:30',
      name: '上午加餐',
      description: '轻量健康零食，维持血糖稳定',
      calories: 150,
      protein: 5,
      carbs: 20,
    },
    {
      time: '12:00-13:00',
      name: '午餐',
      description: '一天中最重要的一餐，营养要全面',
      calories: 600,
      protein: 25,
      carbs: 70,
    },
    {
      time: '15:30-16:00',
      name: '下午茶',
      description: '适量补充能量，避免晚餐过量',
      calories: 200,
      protein: 8,
      carbs: 25,
    },
    {
      time: '18:30-19:30',
      name: '晚餐',
      description: '清淡易消化，为夜间休息做准备',
      calories: 500,
      protein: 20,
      carbs: 60,
    },
  ])

  // 生命周期
  onMounted(() => {
    // 加载用户的营养目标设置
    loadUserNutritionTargets()
  })

  // 方法定义
  function handleModeChange(mode: string) {
    trackEvent('click', {
      category: 'nutrition-analysis',
      target: `mode-${mode}`,
    })
  }

  function handleAnalysisComplete(result: any) {
    analysisResult.value = {
      calories: result.calories || 0,
      protein: result.protein || 0,
      carbs: result.carbs || 0,
      fat: result.fat || 0,
      fiber: result.fiber || 0,
      sugar: result.sugar || 0,
      sodium: result.sodium || 0,
      vitamins: result.vitamins || {},
      minerals: result.minerals || {},
      analysisDate: new Date(),
      confidence: result.confidence || 0.9,
    }

    ElMessage.success('营养分析完成！')

    // 记录分析事件
    trackEvent('view', {
      category: 'nutrition-analysis',
      target: 'analysis-complete',
    })
  }

  function handleComparisonComplete(result: any) {
    ElMessage.success('营养对比分析完成！')
  }

  function loadUserNutritionTargets() {
    // 从本地存储或服务器加载用户的营养目标
    const saved = localStorage.getItem('nutrition-targets')
    if (saved) {
      try {
        dailyTargets.value = { ...dailyTargets.value, ...JSON.parse(saved) }
      } catch (error) {
        console.warn('加载营养目标失败:', error)
      }
    }
  }

  // 计算营养素百分比
  function getCaloriePercentage(): number {
    if (!analysisResult.value) return 0
    return Math.min((analysisResult.value.calories / dailyTargets.value.calories) * 100, 100)
  }

  function getProteinPercentage(): number {
    if (!analysisResult.value) return 0
    return Math.min((analysisResult.value.protein / dailyTargets.value.protein) * 100, 100)
  }

  function getCarbsPercentage(): number {
    if (!analysisResult.value) return 0
    return Math.min((analysisResult.value.carbs / dailyTargets.value.carbs) * 100, 100)
  }

  function getFatPercentage(): number {
    if (!analysisResult.value) return 0
    return Math.min((analysisResult.value.fat / dailyTargets.value.fat) * 100, 100)
  }

  function getCalorieColor(): string {
    const percentage = getCaloriePercentage()
    if (percentage < 50) return '#F56C6C'
    if (percentage > 90) return '#E6A23C'
    return '#67C23A'
  }

  // 操作方法
  function generateReport() {
    reportDialogVisible.value = true
    trackEvent('click', {
      category: 'nutrition-analysis',
      target: 'generate-report',
    })
  }

  function saveAnalysis() {
    if (!analysisResult.value) {
      ElMessage.warning('没有可保存的分析结果')
      return
    }

    // 保存到本地存储
    const savedAnalyses = JSON.parse(localStorage.getItem('saved-nutrition-analyses') || '[]')
    savedAnalyses.push({
      ...analysisResult.value,
      id: Date.now().toString(),
      name: `营养分析 ${new Date().toLocaleDateString()}`,
    })
    localStorage.setItem('saved-nutrition-analyses', JSON.stringify(savedAnalyses))

    ElMessage.success('分析结果已保存')

    trackEvent('save', {
      category: 'nutrition-analysis',
      target: 'save-analysis',
    })
  }

  function shareAnalysis() {
    if (!analysisResult.value) {
      ElMessage.warning('没有可分享的分析结果')
      return
    }

    const shareData = {
      title: 'ChefMind 营养分析结果',
      text: `我的营养分析：热量${analysisResult.value.calories}千卡，蛋白质${analysisResult.value.protein}g`,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData).catch(console.error)
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      ElMessage.success('分析结果已复制到剪贴板')
    }

    trackEvent('share', {
      category: 'nutrition-analysis',
      target: 'share-analysis',
    })
  }

  function exportData() {
    if (!analysisResult.value) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const exportData = {
      analysis: analysisResult.value,
      recommendations: nutritionRecommendations.value,
      timeline: mealTimeline.value,
      exportTime: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutrition-analysis-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('数据导出成功')

    trackEvent('click', {
      category: 'nutrition-analysis',
      target: 'export-data',
    })
  }

  function handleReportGenerated(report: any) {
    ElMessage.success('营养报告生成完成！')
  }
</script>

<style scoped lang="scss">
  .advanced-nutrition-analyzer {
    background: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;

    .analyzer-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      text-align: center;

      .analyzer-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .title-icon {
          font-size: 28px;
        }
      }

      .analyzer-subtitle {
        margin: 0;
        opacity: 0.9;
        font-size: 14px;
      }
    }

    .analysis-modes {
      padding: 0 24px;
      background: var(--el-fill-color-lighter);
    }

    .analysis-results {
      padding: 24px;

      .section-title {
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;
        gap: 8px;

        .title-icon {
          font-size: 20px;
        }
      }

      .nutrition-overview {
        margin-bottom: 32px;

        .macro-nutrients {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;

          .nutrient-card {
            background: var(--el-fill-color-lighter);
            border-radius: 12px;
            padding: 20px;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }

            .nutrient-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;

              .nutrient-icon {
                font-size: 20px;
              }

              .nutrient-name {
                font-weight: 600;
                color: var(--el-text-color-primary);
              }
            }

            .nutrient-value {
              font-size: 28px;
              font-weight: 700;
              color: var(--el-text-color-primary);
              margin-bottom: 12px;

              .unit {
                font-size: 14px;
                font-weight: 400;
                color: var(--el-text-color-secondary);
                margin-left: 4px;
              }
            }

            .nutrient-progress {
              margin-bottom: 8px;
            }

            .nutrient-target {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }

      .detailed-nutrition {
        margin-bottom: 32px;

        .nutrition-category {
          background: var(--el-fill-color-lighter);
          border-radius: 12px;
          padding: 20px;

          .category-title {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            display: flex;
            align-items: center;
            gap: 8px;

            .category-icon {
              font-size: 18px;
            }
          }

          .nutrient-list {
            .nutrient-item {
              margin-bottom: 16px;

              &:last-child {
                margin-bottom: 0;
              }

              .nutrient-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;

                .nutrient-label {
                  font-size: 14px;
                  color: var(--el-text-color-primary);
                }

                .nutrient-amount {
                  font-size: 12px;
                  font-weight: 600;
                  color: var(--el-color-primary);
                }
              }

              .nutrient-bar {
                height: 6px;
                background: var(--el-border-color-lighter);
                border-radius: 3px;
                overflow: hidden;

                .bar-fill {
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
      }

      .ai-recommendations {
        margin-bottom: 32px;

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;

          .recommendation-card {
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid;

            &.good {
              background: var(--el-color-success-light-9);
              border-left-color: var(--el-color-success);
            }

            &.warning {
              background: var(--el-color-warning-light-9);
              border-left-color: var(--el-color-warning);
            }

            &.improvement {
              background: var(--el-color-info-light-9);
              border-left-color: var(--el-color-info);
            }

            .recommendation-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;

              .recommendation-icon {
                font-size: 20px;
              }

              .recommendation-title {
                font-weight: 600;
                color: var(--el-text-color-primary);
              }
            }

            .recommendation-content {
              margin: 0 0 12px 0;
              color: var(--el-text-color-regular);
              line-height: 1.5;
            }

            .recommendation-tips {
              h5 {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: var(--el-text-color-primary);
              }

              ul {
                margin: 0;
                padding-left: 20px;

                li {
                  margin-bottom: 4px;
                  font-size: 14px;
                  color: var(--el-text-color-regular);
                }
              }
            }
          }
        }
      }

      .nutrition-timeline {
        margin-bottom: 32px;

        .timeline-container {
          position: relative;
          padding-left: 40px;

          &::before {
            content: '';
            position: absolute;
            left: 20px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--el-border-color);
          }

          .timeline-item {
            position: relative;
            margin-bottom: 24px;

            &::before {
              content: '';
              position: absolute;
              left: -29px;
              top: 8px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: var(--el-color-primary);
              border: 2px solid var(--el-bg-color);
            }

            .timeline-time {
              font-size: 12px;
              font-weight: 600;
              color: var(--el-color-primary);
              margin-bottom: 4px;
            }

            .timeline-content {
              background: var(--el-fill-color-lighter);
              border-radius: 8px;
              padding: 16px;

              .meal-name {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--el-text-color-primary);
              }

              .meal-description {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: var(--el-text-color-regular);
              }

              .meal-nutrients {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .nutrient-tag {
                  background: var(--el-color-primary-light-8);
                  color: var(--el-color-primary);
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 500;
                }
              }
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .macro-nutrients {
      grid-template-columns: 1fr !important;
    }

    .recommendations-grid {
      grid-template-columns: 1fr !important;
    }

    .action-buttons {
      flex-direction: column !important;
    }

    .timeline-container {
      padding-left: 20px !important;

      .timeline-item::before {
        left: -9px !important;
      }
    }
  }
</style>
