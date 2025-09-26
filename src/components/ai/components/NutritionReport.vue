<template>
  <div class="nutrition-report">
    <div class="report-header">
      <div class="header-content">
        <h2 class="report-title">
          <span class="title-icon">📊</span>
          营养分析报告
        </h2>
        <div class="report-meta">
          <div class="meta-item">
            <span class="meta-label">生成时间:</span>
            <span class="meta-value">{{ formatDate(new Date()) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">分析置信度:</span>
            <span class="meta-value">{{ (analysisData.confidence * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="report-content">
      <!-- 营养概览 -->
      <div class="report-section">
        <h3 class="section-title">营养成分概览</h3>
        <div class="nutrition-overview">
          <div class="overview-chart">
            <canvas ref="pieChart" class="chart-canvas" width="300" height="300"></canvas>
          </div>
          <div class="overview-details">
            <div class="nutrient-detail">
              <div class="nutrient-label">总热量</div>
              <div class="nutrient-value">{{ analysisData.calories?.toFixed(0) || 0 }} 千卡</div>
              <div class="nutrient-percentage">100%</div>
            </div>
            <div class="nutrient-detail protein">
              <div class="nutrient-label">蛋白质</div>
              <div class="nutrient-value">{{ analysisData.protein?.toFixed(1) || 0 }} 克</div>
              <div class="nutrient-percentage">{{ getProteinCaloriePercentage() }}%</div>
            </div>
            <div class="nutrient-detail carbs">
              <div class="nutrient-label">碳水化合物</div>
              <div class="nutrient-value">{{ analysisData.carbs?.toFixed(1) || 0 }} 克</div>
              <div class="nutrient-percentage">{{ getCarbsCaloriePercentage() }}%</div>
            </div>
            <div class="nutrient-detail fat">
              <div class="nutrient-label">脂肪</div>
              <div class="nutrient-value">{{ analysisData.fat?.toFixed(1) || 0 }} 克</div>
              <div class="nutrient-percentage">{{ getFatCaloriePercentage() }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细营养数据 -->
      <div class="report-section">
        <h3 class="section-title">详细营养数据</h3>
        <div class="detailed-data">
          <el-table :data="nutritionTableData" border stripe size="small">
            <el-table-column prop="category" label="类别" width="120" />
            <el-table-column prop="name" label="营养素" />
            <el-table-column prop="amount" label="含量" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="dv" label="DV%" width="100">
              <template #default="scope">
                <div class="dv-cell">
                  <span>{{ scope.row.dv }}%</span>
                  <el-progress
                    :percentage="scope.row.dv"
                    :color="getDVColor(scope.row.dv)"
                    :show-text="false"
                    size="small"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- AI建议 -->
      <div class="report-section">
        <h3 class="section-title">AI营养师建议</h3>
        <div class="recommendations-content">
          <div
            v-for="recommendation in recommendations"
            :key="recommendation.id"
            class="recommendation-card"
            :class="recommendation.type"
          >
            <div class="recommendation-header">
              <span class="recommendation-icon">{{ recommendation.icon }}</span>
              <span class="recommendation-title">{{ recommendation.title }}</span>
              <el-tag :type="getTagType(recommendation.type)" size="small">
                {{ getTypeText(recommendation.type) }}
              </el-tag>
            </div>
            <p class="recommendation-content">{{ recommendation.content }}</p>
            <div v-if="recommendation.tips" class="recommendation-tips">
              <h5>具体建议：</h5>
              <ul>
                <li v-for="tip in recommendation.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 健康评分 -->
      <div class="report-section">
        <h3 class="section-title">健康评分</h3>
        <div class="health-score">
          <div class="score-display">
            <div class="score-circle">
              <canvas ref="scoreChart" class="score-canvas" width="160" height="160"></canvas>
              <div class="score-text">
                <div class="score-number">{{ healthScore }}</div>
                <div class="score-label">分</div>
              </div>
            </div>
            <div class="score-description">
              <h4 class="score-level">{{ getScoreLevel() }}</h4>
              <p class="score-summary">{{ getScoreSummary() }}</p>
            </div>
          </div>

          <div class="score-breakdown">
            <h5 class="breakdown-title">评分详情</h5>
            <div class="score-items">
              <div v-for="item in scoreBreakdown" :key="item.name" class="score-item">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-score">
                  <el-rate v-model="item.score" disabled :max="5" size="small" />
                  <span class="score-value">{{ item.score }}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 改进建议 -->
      <div class="report-section">
        <h3 class="section-title">营养改进计划</h3>
        <div class="improvement-plan">
          <div class="plan-steps">
            <div v-for="(step, index) in improvementSteps" :key="step.id" class="plan-step">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4 class="step-title">{{ step.title }}</h4>
                <p class="step-description">{{ step.description }}</p>
                <div class="step-timeline">
                  <el-tag size="small" type="info">{{ step.timeline }}</el-tag>
                  <el-tag size="small" :type="getPriorityType(step.priority)">
                    {{ step.priority }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 报告操作 -->
    <div class="report-actions">
      <el-button @click="downloadPDF" type="primary" :icon="Download"> 下载PDF报告 </el-button>
      <el-button @click="printReport" :icon="Printer"> 打印报告 </el-button>
      <el-button @click="shareReport" :icon="Share"> 分享报告 </el-button>
      <el-button @click="saveReport" :icon="FolderAdd"> 保存报告 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Download, Printer, Share, FolderAdd } from '@element-plus/icons-vue'

  // 接口定义
  interface AnalysisData {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber?: number
    sugar?: number
    sodium?: number
    vitamins?: { [key: string]: number }
    minerals?: { [key: string]: number }
    confidence: number
  }

  interface Recommendation {
    id: string
    type: 'good' | 'warning' | 'improvement'
    icon: string
    title: string
    content: string
    tips?: string[]
  }

  // Props定义
  const props = defineProps<{
    analysisData: AnalysisData
    recommendations: Recommendation[]
  }>()

  // 事件定义
  const emit = defineEmits<{
    reportGenerated: [report: any]
  }>()

  // 响应式数据
  const pieChart = ref<HTMLCanvasElement>()
  const scoreChart = ref<HTMLCanvasElement>()

  // 计算属性
  const healthScore = computed(() => {
    // 基于营养数据计算健康评分
    let score = 70 // 基础分

    // 蛋白质评分
    const proteinRatio = getProteinCaloriePercentage()
    if (proteinRatio >= 15 && proteinRatio <= 30) score += 10
    else if (proteinRatio >= 10) score += 5

    // 碳水化合物评分
    const carbsRatio = getCarbsCaloriePercentage()
    if (carbsRatio >= 45 && carbsRatio <= 65) score += 10
    else if (carbsRatio >= 40) score += 5

    // 脂肪评分
    const fatRatio = getFatCaloriePercentage()
    if (fatRatio >= 20 && fatRatio <= 35) score += 10
    else if (fatRatio >= 15) score += 5

    return Math.min(score, 100)
  })

  const nutritionTableData = computed(() => {
    const data = []

    // 主要营养素
    data.push(
      {
        category: '主要营养素',
        name: '蛋白质',
        amount: props.analysisData.protein?.toFixed(1) || '0',
        unit: 'g',
        dv: 25,
      },
      {
        category: '主要营养素',
        name: '碳水化合物',
        amount: props.analysisData.carbs?.toFixed(1) || '0',
        unit: 'g',
        dv: 30,
      },
      {
        category: '主要营养素',
        name: '脂肪',
        amount: props.analysisData.fat?.toFixed(1) || '0',
        unit: 'g',
        dv: 20,
      },
      {
        category: '主要营养素',
        name: '膳食纤维',
        amount: props.analysisData.fiber?.toFixed(1) || '0',
        unit: 'g',
        dv: 15,
      }
    )

    // 维生素
    if (props.analysisData.vitamins) {
      Object.entries(props.analysisData.vitamins).forEach(([key, value]) => {
        data.push({
          category: '维生素',
          name: `维生素${key}`,
          amount: value.toFixed(1),
          unit: key === 'C' ? 'mg' : 'μg',
          dv: Math.round(value),
        })
      })
    }

    // 矿物质
    if (props.analysisData.minerals) {
      Object.entries(props.analysisData.minerals).forEach(([key, value]) => {
        data.push({
          category: '矿物质',
          name: key,
          amount: value.toFixed(1),
          unit: 'mg',
          dv: Math.round(value),
        })
      })
    }

    return data
  })

  const scoreBreakdown = computed(() => [
    { name: '营养均衡性', score: 4.2 },
    { name: '热量适宜性', score: 3.8 },
    { name: '维生素充足性', score: 4.5 },
    { name: '矿物质充足性', score: 3.9 },
    { name: '膳食纤维', score: 3.6 },
  ])

  const improvementSteps = computed(() => [
    {
      id: '1',
      title: '增加蔬菜摄入',
      description: '建议每天至少摄入500g新鲜蔬菜，深色蔬菜占一半以上',
      timeline: '立即开始',
      priority: '高优先级',
    },
    {
      id: '2',
      title: '优化蛋白质来源',
      description: '适当增加鱼类、豆类等优质蛋白质，减少红肉摄入',
      timeline: '1-2周内',
      priority: '中优先级',
    },
    {
      id: '3',
      title: '控制精制糖摄入',
      description: '减少添加糖的摄入，选择天然果糖来源',
      timeline: '2-4周内',
      priority: '中优先级',
    },
    {
      id: '4',
      title: '补充维生素D',
      description: '适当晒太阳或考虑维生素D补充剂',
      timeline: '持续进行',
      priority: '低优先级',
    },
  ])

  // 生命周期
  onMounted(() => {
    nextTick(() => {
      drawCharts()
    })
  })

  // 方法定义
  function formatDate(date: Date): string {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getProteinCaloriePercentage(): number {
    const proteinCalories = (props.analysisData.protein || 0) * 4
    const totalCalories = props.analysisData.calories || 1
    return Math.round((proteinCalories / totalCalories) * 100)
  }

  function getCarbsCaloriePercentage(): number {
    const carbsCalories = (props.analysisData.carbs || 0) * 4
    const totalCalories = props.analysisData.calories || 1
    return Math.round((carbsCalories / totalCalories) * 100)
  }

  function getFatCaloriePercentage(): number {
    const fatCalories = (props.analysisData.fat || 0) * 9
    const totalCalories = props.analysisData.calories || 1
    return Math.round((fatCalories / totalCalories) * 100)
  }

  function getDVColor(percentage: number): string {
    if (percentage < 50) return '#F56C6C'
    if (percentage > 100) return '#E6A23C'
    return '#67C23A'
  }

  function getTagType(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
    const types = {
      good: 'success' as const,
      warning: 'warning' as const,
      improvement: 'info' as const,
    }
    return types[type as keyof typeof types] || 'info'
  }

  function getTypeText(type: string): string {
    const texts = {
      good: '优秀',
      warning: '注意',
      improvement: '改进',
    }
    return texts[type as keyof typeof texts] || '建议'
  }

  function getScoreLevel(): string {
    const score = healthScore.value
    if (score >= 90) return '优秀'
    if (score >= 80) return '良好'
    if (score >= 70) return '一般'
    if (score >= 60) return '需改进'
    return '较差'
  }

  function getScoreSummary(): string {
    const score = healthScore.value
    if (score >= 90) return '您的营养搭配非常合理，请继续保持！'
    if (score >= 80) return '整体营养状况良好，稍加调整会更完美。'
    if (score >= 70) return '营养搭配基本合理，有一定改进空间。'
    if (score >= 60) return '营养搭配存在明显不足，建议重点改进。'
    return '营养搭配需要大幅调整，建议咨询专业营养师。'
  }

  function getPriorityType(
    priority: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
    const types = {
      高优先级: 'danger' as const,
      中优先级: 'warning' as const,
      低优先级: 'info' as const,
    }
    return types[priority as keyof typeof types] || 'info'
  }

  function drawCharts() {
    drawPieChart()
    drawScoreChart()
  }

  function drawPieChart() {
    const canvas = pieChart.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 100

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const proteinCalories = (props.analysisData.protein || 0) * 4
    const carbsCalories = (props.analysisData.carbs || 0) * 4
    const fatCalories = (props.analysisData.fat || 0) * 9
    const total = proteinCalories + carbsCalories + fatCalories

    if (total === 0) return

    const data = [
      { label: '蛋白质', value: proteinCalories, color: '#67C23A' },
      { label: '碳水化合物', value: carbsCalories, color: '#E6A23C' },
      { label: '脂肪', value: fatCalories, color: '#F56C6C' },
    ]

    let currentAngle = -Math.PI / 2

    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // 绘制标签
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30)

      ctx.fillStyle = '#606266'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, labelX, labelY)

      currentAngle += sliceAngle
    })
  }

  function drawScoreChart() {
    const canvas = scoreChart.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 60
    const lineWidth = 8

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景圆
    ctx.strokeStyle = '#e4e7ed'
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()

    // 绘制进度圆弧
    const progress = healthScore.value / 100
    const endAngle = -Math.PI / 2 + progress * 2 * Math.PI

    ctx.strokeStyle = getScoreColor(healthScore.value)
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle)
    ctx.stroke()
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return '#67C23A'
    if (score >= 80) return '#95d475'
    if (score >= 70) return '#E6A23C'
    if (score >= 60) return '#f0a020'
    return '#F56C6C'
  }

  // 操作方法
  function downloadPDF() {
    ElMessage.info('PDF下载功能开发中...')
    emit('reportGenerated', {
      type: 'pdf',
      data: props.analysisData,
      score: healthScore.value,
    })
  }

  function printReport() {
    window.print()
    emit('reportGenerated', {
      type: 'print',
      data: props.analysisData,
      score: healthScore.value,
    })
  }

  function shareReport() {
    const shareData = {
      title: 'ChefMind 营养分析报告',
      text: `我的营养健康评分：${healthScore.value}分`,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData).catch(console.error)
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      ElMessage.success('报告链接已复制到剪贴板')
    }

    emit('reportGenerated', {
      type: 'share',
      data: props.analysisData,
      score: healthScore.value,
    })
  }

  function saveReport() {
    const reportData = {
      analysisData: props.analysisData,
      recommendations: props.recommendations,
      healthScore: healthScore.value,
      generateTime: new Date().toISOString(),
    }

    localStorage.setItem(`nutrition-report-${Date.now()}`, JSON.stringify(reportData))
    ElMessage.success('报告已保存到本地')

    emit('reportGenerated', {
      type: 'save',
      data: reportData,
    })
  }
</script>

<style scoped lang="scss">
  .nutrition-report {
    background: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;

    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;

      .header-content {
        .report-title {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;

          .title-icon {
            font-size: 28px;
          }
        }

        .report-meta {
          display: flex;
          gap: 24px;
          font-size: 14px;
          opacity: 0.9;

          .meta-item {
            .meta-label {
              margin-right: 4px;
            }

            .meta-value {
              font-weight: 600;
            }
          }
        }
      }
    }

    .report-content {
      padding: 24px;

      .report-section {
        margin-bottom: 32px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          border-bottom: 2px solid var(--el-color-primary);
          padding-bottom: 8px;
        }

        .nutrition-overview {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          align-items: center;

          .overview-chart {
            .chart-canvas {
              background: var(--el-fill-color-lighter);
              border-radius: 8px;
            }
          }

          .overview-details {
            .nutrient-detail {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 16px;
              margin-bottom: 8px;
              background: var(--el-fill-color-lighter);
              border-radius: 8px;
              border-left: 4px solid var(--el-color-primary);

              &.protein {
                border-left-color: #67c23a;
              }

              &.carbs {
                border-left-color: #e6a23c;
              }

              &.fat {
                border-left-color: #f56c6c;
              }

              .nutrient-label {
                font-size: 14px;
                color: var(--el-text-color-secondary);
              }

              .nutrient-value {
                font-size: 16px;
                font-weight: 600;
                color: var(--el-text-color-primary);
              }

              .nutrient-percentage {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                background: var(--el-color-primary-light-8);
                padding: 2px 6px;
                border-radius: 10px;
              }
            }
          }
        }

        .detailed-data {
          .dv-cell {
            display: flex;
            align-items: center;
            gap: 8px;

            span {
              min-width: 40px;
              font-size: 12px;
            }
          }
        }

        .recommendations-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;

          .recommendation-card {
            border-radius: 8px;
            padding: 16px;
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
              margin-bottom: 8px;

              .recommendation-icon {
                font-size: 20px;
              }

              .recommendation-title {
                flex: 1;
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

        .health-score {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 32px;
          align-items: flex-start;

          .score-display {
            text-align: center;

            .score-circle {
              position: relative;
              display: inline-block;
              margin-bottom: 16px;

              .score-canvas {
                display: block;
              }

              .score-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;

                .score-number {
                  font-size: 32px;
                  font-weight: 700;
                  color: var(--el-color-primary);
                  line-height: 1;
                }

                .score-label {
                  font-size: 14px;
                  color: var(--el-text-color-secondary);
                }
              }
            }

            .score-description {
              .score-level {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--el-text-color-primary);
              }

              .score-summary {
                margin: 0;
                font-size: 14px;
                color: var(--el-text-color-regular);
                line-height: 1.5;
              }
            }
          }

          .score-breakdown {
            .breakdown-title {
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }

            .score-items {
              .score-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid var(--el-border-color-lighter);

                &:last-child {
                  border-bottom: none;
                }

                .item-name {
                  font-size: 14px;
                  color: var(--el-text-color-primary);
                }

                .item-score {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .score-value {
                    font-size: 12px;
                    color: var(--el-text-color-secondary);
                  }
                }
              }
            }
          }
        }

        .improvement-plan {
          .plan-steps {
            .plan-step {
              display: flex;
              align-items: flex-start;
              margin-bottom: 24px;
              padding: 16px;
              background: var(--el-fill-color-lighter);
              border-radius: 8px;

              .step-number {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--el-color-primary);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                margin-right: 16px;
                flex-shrink: 0;
              }

              .step-content {
                flex: 1;

                .step-title {
                  margin: 0 0 8px 0;
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                }

                .step-description {
                  margin: 0 0 12px 0;
                  color: var(--el-text-color-regular);
                  line-height: 1.5;
                }

                .step-timeline {
                  display: flex;
                  gap: 8px;
                }
              }
            }
          }
        }
      }
    }

    .report-actions {
      padding: 24px;
      border-top: 1px solid var(--el-border-color-lighter);
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  /* 打印样式 */
  @media print {
    .report-actions {
      display: none !important;
    }

    .nutrition-report {
      box-shadow: none !important;
      border: none !important;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .nutrition-overview {
      grid-template-columns: 1fr !important;
      text-align: center;
    }

    .health-score {
      grid-template-columns: 1fr !important;
    }

    .recommendations-content {
      grid-template-columns: 1fr !important;
    }

    .report-actions {
      flex-direction: column !important;
    }

    .report-meta {
      flex-direction: column !important;
      gap: 8px !important;
    }
  }
</style>
