<template>
  <div class="nutrition-comparison">
    <div class="comparison-setup">
      <h4 class="section-title">营养对比分析</h4>

      <!-- 对比模式选择 -->
      <div class="comparison-mode">
        <el-radio-group v-model="comparisonMode" @change="handleModeChange">
          <el-radio-button label="recipes">食谱对比</el-radio-button>
          <el-radio-button label="ingredients">食材对比</el-radio-button>
          <el-radio-button label="meals">餐食对比</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 对比项目添加 -->
      <div class="comparison-items">
        <div class="items-header">
          <h5 class="items-title">对比项目 ({{ selectedItems.length }}/4)</h5>
          <el-button
            @click="clearAllItems"
            size="small"
            type="danger"
            v-if="selectedItems.length > 0"
          >
            清空全部
          </el-button>
        </div>

        <!-- 项目搜索 -->
        <div class="item-search">
          <el-input
            v-model="searchQuery"
            :placeholder="`搜索${getModeText()}...`"
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
          />

          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="search-result-item"
              @click="addItem(item)"
              :class="{ disabled: isItemDisabled(item) }"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-nutrition">
                  {{ item.calories }}千卡 | {{ item.protein }}g蛋白质
                </div>
              </div>
              <div v-if="isItemSelected(item)" class="selected-badge">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 已选择的项目 -->
        <div v-if="selectedItems.length > 0" class="selected-items">
          <div v-for="(item, index) in selectedItems" :key="item.id" class="selected-item">
            <div class="item-color" :style="{ backgroundColor: getItemColor(index) }"></div>
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-type">{{ getItemTypeText(item) }}</div>
            </div>
            <el-button type="danger" size="small" :icon="Delete" @click="removeItem(index)" />
          </div>
        </div>
      </div>

      <!-- 对比选项 -->
      <div v-if="selectedItems.length >= 2" class="comparison-options">
        <h5 class="options-title">对比选项</h5>
        <el-checkbox-group v-model="comparisonMetrics">
          <el-checkbox label="calories">热量</el-checkbox>
          <el-checkbox label="protein">蛋白质</el-checkbox>
          <el-checkbox label="carbs">碳水化合物</el-checkbox>
          <el-checkbox label="fat">脂肪</el-checkbox>
          <el-checkbox label="fiber">膳食纤维</el-checkbox>
          <el-checkbox label="vitamins">维生素</el-checkbox>
          <el-checkbox label="minerals">矿物质</el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 开始对比按钮 -->
      <div v-if="selectedItems.length >= 2" class="comparison-actions">
        <el-button type="primary" size="large" @click="startComparison" :loading="isComparing">
          {{ isComparing ? '对比分析中...' : '开始营养对比' }}
        </el-button>
      </div>
    </div>

    <!-- 对比结果 -->
    <div v-if="comparisonResult" class="comparison-results">
      <h4 class="section-title">对比结果</h4>

      <!-- 营养成分对比表格 -->
      <div class="comparison-table">
        <el-table :data="tableData" border stripe>
          <el-table-column prop="metric" label="营养成分" width="120" fixed="left" />
          <el-table-column
            v-for="(item, index) in selectedItems"
            :key="item.id"
            :label="item.name"
            min-width="100"
          >
            <template #default="scope">
              <div class="table-cell">
                <div
                  class="color-indicator"
                  :style="{ backgroundColor: getItemColor(index) }"
                ></div>
                <span class="cell-value">{{ scope.row[`item${index}`] }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 可视化图表 -->
      <div class="comparison-charts">
        <div class="chart-container">
          <h5 class="chart-title">营养成分对比雷达图</h5>
          <canvas ref="radarChart" class="chart-canvas" width="400" height="300"></canvas>
        </div>

        <div class="chart-container">
          <h5 class="chart-title">热量分布柱状图</h5>
          <canvas ref="barChart" class="chart-canvas" width="400" height="300"></canvas>
        </div>
      </div>

      <!-- 对比分析 -->
      <div class="comparison-analysis">
        <h5 class="analysis-title">智能分析</h5>
        <div class="analysis-content">
          <div
            v-for="analysis in comparisonAnalysis"
            :key="analysis.id"
            class="analysis-item"
            :class="analysis.type"
          >
            <div class="analysis-header">
              <span class="analysis-icon">{{ analysis.icon }}</span>
              <span class="analysis-title">{{ analysis.title }}</span>
            </div>
            <p class="analysis-content">{{ analysis.content }}</p>
          </div>
        </div>
      </div>

      <!-- 推荐建议 -->
      <div class="comparison-recommendations">
        <h5 class="recommendations-title">营养师建议</h5>
        <div class="recommendations-list">
          <div
            v-for="recommendation in recommendations"
            :key="recommendation.id"
            class="recommendation-item"
          >
            <div class="recommendation-rank">{{ recommendation.rank }}</div>
            <div class="recommendation-content">
              <div class="recommendation-title">{{ recommendation.title }}</div>
              <div class="recommendation-reason">{{ recommendation.reason }}</div>
            </div>
            <div class="recommendation-score">
              <el-rate v-model="recommendation.score" disabled show-score />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search, Delete, Check } from '@element-plus/icons-vue'

  // 接口定义
  interface ComparisonItem {
    id: string
    name: string
    image: string
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    type: 'recipe' | 'ingredient' | 'meal'
    category?: string
  }

  interface ComparisonResult {
    items: ComparisonItem[]
    metrics: string[]
    analysis: any[]
    recommendations: any[]
  }

  // 事件定义
  const emit = defineEmits<{
    comparisonComplete: [result: ComparisonResult]
  }>()

  // 响应式数据
  const comparisonMode = ref('recipes')
  const searchQuery = ref('')
  const searchResults = ref<ComparisonItem[]>([])
  const selectedItems = ref<ComparisonItem[]>([])
  const comparisonMetrics = ref(['calories', 'protein', 'carbs', 'fat'])
  const isComparing = ref(false)
  const comparisonResult = ref<ComparisonResult | null>(null)

  // 图表引用
  const radarChart = ref<HTMLCanvasElement>()
  const barChart = ref<HTMLCanvasElement>()

  // 计算属性
  const tableData = computed(() => {
    if (!comparisonResult.value) return []

    const metrics = [
      { key: 'calories', label: '热量', unit: '千卡' },
      { key: 'protein', label: '蛋白质', unit: 'g' },
      { key: 'carbs', label: '碳水化合物', unit: 'g' },
      { key: 'fat', label: '脂肪', unit: 'g' },
      { key: 'fiber', label: '膳食纤维', unit: 'g' },
    ]

    return metrics.map(metric => {
      const row: any = { metric: metric.label }
      selectedItems.value.forEach((item, index) => {
        row[`item${index}`] = `${item[metric.key as keyof ComparisonItem]}${metric.unit}`
      })
      return row
    })
  })

  const comparisonAnalysis = computed(() => [
    {
      id: '1',
      type: 'highlight',
      icon: '🏆',
      title: '最佳选择',
      content: '在所有对比项目中，鸡胸肉在蛋白质含量方面表现最佳，适合健身人群选择。',
    },
    {
      id: '2',
      type: 'warning',
      icon: '⚠️',
      title: '注意事项',
      content: '牛肉的脂肪含量相对较高，建议减肥期间适量食用。',
    },
    {
      id: '3',
      type: 'info',
      icon: '💡',
      title: '营养互补',
      content: '建议将蔬菜与肉类搭配，营养更加均衡。',
    },
  ])

  const recommendations = computed(() => [
    {
      id: '1',
      rank: 1,
      title: '鸡胸肉',
      reason: '高蛋白、低脂肪，是健身塑形的理想选择',
      score: 4.8,
    },
    {
      id: '2',
      rank: 2,
      title: '西兰花',
      reason: '富含维生素C和膳食纤维，营养密度高',
      score: 4.5,
    },
    {
      id: '3',
      rank: 3,
      title: '牛肉',
      reason: '铁含量丰富，适合补血，但脂肪含量稍高',
      score: 4.2,
    },
  ])

  // 方法定义
  function handleModeChange(mode: string) {
    console.log('对比模式改变:', mode)
    clearAllItems()
  }

  function getModeText(): string {
    const modeTexts = {
      recipes: '食谱',
      ingredients: '食材',
      meals: '餐食',
    }
    return modeTexts[comparisonMode.value as keyof typeof modeTexts] || '项目'
  }

  function handleSearch() {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    // 模拟搜索
    setTimeout(() => {
      searchResults.value = getMockData()
        .filter(
          item =>
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
            item.type === comparisonMode.value.slice(0, -1) // 去掉s
        )
        .slice(0, 8)
    }, 300)
  }

  function addItem(item: ComparisonItem) {
    if (selectedItems.value.length >= 4) {
      ElMessage.warning('最多只能对比4个项目')
      return
    }

    if (isItemSelected(item)) {
      ElMessage.warning('该项目已添加')
      return
    }

    selectedItems.value.push(item)
    searchQuery.value = ''
    searchResults.value = []

    ElMessage.success(`已添加 ${item.name}`)
  }

  function removeItem(index: number) {
    const item = selectedItems.value[index]
    selectedItems.value.splice(index, 1)
    ElMessage.success(`已移除 ${item.name}`)
  }

  function clearAllItems() {
    selectedItems.value = []
    comparisonResult.value = null
  }

  function isItemSelected(item: ComparisonItem): boolean {
    return selectedItems.value.some(selected => selected.id === item.id)
  }

  function isItemDisabled(item: ComparisonItem): boolean {
    return selectedItems.value.length >= 4 && !isItemSelected(item)
  }

  function getItemColor(index: number): string {
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
    return colors[index] || '#909399'
  }

  function getItemTypeText(item: ComparisonItem): string {
    const typeTexts = {
      recipe: '食谱',
      ingredient: '食材',
      meal: '餐食',
    }
    return typeTexts[item.type] || '未知'
  }

  async function startComparison() {
    if (selectedItems.value.length < 2) {
      ElMessage.warning('至少需要选择2个项目进行对比')
      return
    }

    isComparing.value = true

    try {
      // 模拟对比分析
      await new Promise(resolve => setTimeout(resolve, 2000))

      comparisonResult.value = {
        items: selectedItems.value,
        metrics: comparisonMetrics.value,
        analysis: comparisonAnalysis.value,
        recommendations: recommendations.value,
      }

      // 绘制图表
      await nextTick()
      drawCharts()

      ElMessage.success('营养对比分析完成！')
      emit('comparisonComplete', comparisonResult.value)
    } catch (error) {
      console.error('对比失败:', error)
      ElMessage.error('对比失败，请重试')
    } finally {
      isComparing.value = false
    }
  }

  function drawCharts() {
    drawRadarChart()
    drawBarChart()
  }

  function drawRadarChart() {
    const canvas = radarChart.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 简单的雷达图绘制
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 80

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制网格
    ctx.strokeStyle = '#e4e7ed'
    ctx.lineWidth = 1

    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // 绘制轴线
    const metrics = ['热量', '蛋白质', '碳水', '脂肪', '纤维']
    const angleStep = (2 * Math.PI) / metrics.length

    metrics.forEach((metric, index) => {
      const angle = index * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // 绘制标签
      ctx.fillStyle = '#606266'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      const labelX = centerX + Math.cos(angle) * (radius + 20)
      const labelY = centerY + Math.sin(angle) * (radius + 20)
      ctx.fillText(metric, labelX, labelY)
    })

    // 绘制数据
    selectedItems.value.forEach((item, itemIndex) => {
      ctx.strokeStyle = getItemColor(itemIndex)
      ctx.fillStyle = getItemColor(itemIndex) + '20'
      ctx.lineWidth = 2

      ctx.beginPath()

      const values = [
        item.calories / 300, // 归一化
        item.protein / 30,
        item.carbs / 50,
        item.fat / 20,
        item.fiber / 10,
      ]

      values.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2
        const normalizedValue = Math.min(value, 1) // 限制在0-1之间
        const x = centerX + Math.cos(angle) * radius * normalizedValue
        const y = centerY + Math.sin(angle) * radius * normalizedValue

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })
  }

  function drawBarChart() {
    const canvas = barChart.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const margin = 40
    const chartWidth = canvas.width - 2 * margin
    const chartHeight = canvas.height - 2 * margin
    const barWidth = chartWidth / selectedItems.value.length - 10

    // 找出最大热量值用于归一化
    const maxCalories = Math.max(...selectedItems.value.map(item => item.calories))

    selectedItems.value.forEach((item, index) => {
      const barHeight = (item.calories / maxCalories) * chartHeight
      const x = margin + index * (barWidth + 10)
      const y = canvas.height - margin - barHeight

      // 绘制柱子
      ctx.fillStyle = getItemColor(index)
      ctx.fillRect(x, y, barWidth, barHeight)

      // 绘制数值
      ctx.fillStyle = '#606266'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.calories.toString(), x + barWidth / 2, y - 5)

      // 绘制标签
      ctx.save()
      ctx.translate(x + barWidth / 2, canvas.height - margin + 20)
      ctx.rotate(-Math.PI / 4)
      ctx.textAlign = 'center'
      ctx.fillText(item.name, 0, 0)
      ctx.restore()
    })

    // 绘制Y轴
    ctx.strokeStyle = '#e4e7ed'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin, margin)
    ctx.lineTo(margin, canvas.height - margin)
    ctx.stroke()
  }

  function getMockData(): ComparisonItem[] {
    return [
      {
        id: '1',
        name: '鸡胸肉',
        image: '/api/placeholder/60/60',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        type: 'ingredient',
      },
      {
        id: '2',
        name: '牛肉',
        image: '/api/placeholder/60/60',
        calories: 250,
        protein: 26,
        carbs: 0,
        fat: 15,
        fiber: 0,
        type: 'ingredient',
      },
      {
        id: '3',
        name: '西兰花',
        image: '/api/placeholder/60/60',
        calories: 34,
        protein: 2.8,
        carbs: 7,
        fat: 0.4,
        fiber: 2.6,
        type: 'ingredient',
      },
      {
        id: '4',
        name: '番茄炒蛋',
        image: '/api/placeholder/60/60',
        calories: 180,
        protein: 12,
        carbs: 8,
        fat: 11,
        fiber: 2,
        type: 'recipe',
      },
      {
        id: '5',
        name: '青椒肉丝',
        image: '/api/placeholder/60/60',
        calories: 220,
        protein: 18,
        carbs: 12,
        fat: 13,
        fiber: 3,
        type: 'recipe',
      },
    ]
  }
</script>

<style scoped lang="scss">
  .nutrition-comparison {
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .comparison-setup {
      margin-bottom: 32px;

      .comparison-mode {
        margin-bottom: 20px;
      }

      .comparison-items {
        margin-bottom: 20px;

        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .items-title {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
        }

        .item-search {
          position: relative;
          margin-bottom: 16px;

          .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--el-bg-color);
            border: 1px solid var(--el-border-color);
            border-top: none;
            border-radius: 0 0 6px 6px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .search-result-item {
              display: flex;
              align-items: center;
              padding: 12px;
              cursor: pointer;
              transition: background-color 0.2s ease;
              position: relative;

              &:hover:not(.disabled) {
                background-color: var(--el-fill-color-light);
              }

              &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              .item-image {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                margin-right: 12px;
                object-fit: cover;
              }

              .item-info {
                flex: 1;

                .item-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                  margin-bottom: 2px;
                }

                .item-nutrition {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                }
              }

              .selected-badge {
                color: var(--el-color-success);
                font-size: 16px;
              }
            }
          }
        }

        .selected-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;

          .selected-item {
            display: flex;
            align-items: center;
            background: var(--el-fill-color-lighter);
            border-radius: 8px;
            padding: 12px;

            .item-color {
              width: 4px;
              height: 40px;
              border-radius: 2px;
              margin-right: 12px;
            }

            .item-image {
              width: 40px;
              height: 40px;
              border-radius: 6px;
              margin-right: 12px;
              object-fit: cover;
            }

            .item-info {
              flex: 1;

              .item-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                margin-bottom: 2px;
              }

              .item-type {
                font-size: 12px;
                color: var(--el-text-color-secondary);
              }
            }
          }
        }
      }

      .comparison-options {
        margin-bottom: 20px;

        .options-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .comparison-actions {
        text-align: center;
      }
    }

    .comparison-results {
      .comparison-table {
        margin-bottom: 32px;

        .table-cell {
          display: flex;
          align-items: center;
          gap: 8px;

          .color-indicator {
            width: 12px;
            height: 12px;
            border-radius: 2px;
          }

          .cell-value {
            font-weight: 600;
          }
        }
      }

      .comparison-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 32px;

        .chart-container {
          background: var(--el-fill-color-lighter);
          border-radius: 8px;
          padding: 20px;
          text-align: center;

          .chart-title {
            margin: 0 0 16px 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .chart-canvas {
            background: var(--el-bg-color);
            border-radius: 4px;
          }
        }
      }

      .comparison-analysis {
        margin-bottom: 32px;

        .analysis-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .analysis-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;

          .analysis-item {
            border-radius: 8px;
            padding: 16px;
            border-left: 4px solid;

            &.highlight {
              background: var(--el-color-success-light-9);
              border-left-color: var(--el-color-success);
            }

            &.warning {
              background: var(--el-color-warning-light-9);
              border-left-color: var(--el-color-warning);
            }

            &.info {
              background: var(--el-color-info-light-9);
              border-left-color: var(--el-color-info);
            }

            .analysis-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;

              .analysis-icon {
                font-size: 18px;
              }

              .analysis-title {
                font-weight: 600;
                color: var(--el-text-color-primary);
              }
            }

            .analysis-content {
              margin: 0;
              color: var(--el-text-color-regular);
              line-height: 1.5;
            }
          }
        }
      }

      .comparison-recommendations {
        .recommendations-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .recommendations-list {
          .recommendation-item {
            display: flex;
            align-items: center;
            background: var(--el-fill-color-lighter);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;

            .recommendation-rank {
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
            }

            .recommendation-content {
              flex: 1;

              .recommendation-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                margin-bottom: 4px;
              }

              .recommendation-reason {
                font-size: 14px;
                color: var(--el-text-color-regular);
              }
            }

            .recommendation-score {
              margin-left: 16px;
            }
          }
        }
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .selected-items {
      grid-template-columns: 1fr !important;
    }

    .comparison-charts {
      grid-template-columns: 1fr !important;
    }

    .analysis-content {
      grid-template-columns: 1fr !important;
    }
  }
</style>
