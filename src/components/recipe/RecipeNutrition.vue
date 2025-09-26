<template>
  <div class="recipe-nutrition">
    <h3 class="nutrition-title">营养分析</h3>

    <div class="nutrition-overview">
      <div class="nutrition-chart">
        <div class="chart-container" ref="chartContainer"></div>
      </div>

      <div class="nutrition-summary">
        <div class="nutrition-total">
          <div class="total-calories">
            <div class="total-value">{{ recipe.nutritionInfo?.calories || 0 }}</div>
            <div class="total-label">总热量 (kcal)</div>
          </div>
        </div>

        <div class="nutrition-macros">
          <div class="macro-item">
            <div class="macro-value">{{ recipe.nutritionInfo?.protein || 0 }}g</div>
            <div class="macro-label">蛋白质</div>
            <div class="macro-percentage">{{ calculatePercentage('protein') }}%</div>
          </div>

          <div class="macro-item">
            <div class="macro-value">{{ recipe.nutritionInfo?.carbs || 0 }}g</div>
            <div class="macro-label">碳水化合物</div>
            <div class="macro-percentage">{{ calculatePercentage('carbs') }}%</div>
          </div>

          <div class="macro-item">
            <div class="macro-value">{{ recipe.nutritionInfo?.fat || 0 }}g</div>
            <div class="macro-label">脂肪</div>
            <div class="macro-percentage">{{ calculatePercentage('fat') }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="nutrition-details">
      <h4 class="details-title">详细营养素</h4>

      <div class="details-grid">
        <div class="detail-item" v-if="recipe.nutritionInfo?.fiber !== undefined">
          <div class="detail-label">膳食纤维</div>
          <div class="detail-value">{{ recipe.nutritionInfo.fiber }}g</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.sugar !== undefined">
          <div class="detail-label">糖</div>
          <div class="detail-value">{{ recipe.nutritionInfo.sugar }}g</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.saturatedFat !== undefined">
          <div class="detail-label">饱和脂肪</div>
          <div class="detail-value">{{ recipe.nutritionInfo.saturatedFat }}g</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.unsaturatedFat !== undefined">
          <div class="detail-label">不饱和脂肪</div>
          <div class="detail-value">{{ recipe.nutritionInfo.unsaturatedFat }}g</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.cholesterol !== undefined">
          <div class="detail-label">胆固醇</div>
          <div class="detail-value">{{ recipe.nutritionInfo.cholesterol }}mg</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.sodium !== undefined">
          <div class="detail-label">钠</div>
          <div class="detail-value">{{ recipe.nutritionInfo.sodium }}mg</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.potassium !== undefined">
          <div class="detail-label">钾</div>
          <div class="detail-value">{{ recipe.nutritionInfo.potassium }}mg</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.calcium !== undefined">
          <div class="detail-label">钙</div>
          <div class="detail-value">{{ recipe.nutritionInfo.calcium }}mg</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.iron !== undefined">
          <div class="detail-label">铁</div>
          <div class="detail-value">{{ recipe.nutritionInfo.iron }}mg</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.vitaminA !== undefined">
          <div class="detail-label">维生素A</div>
          <div class="detail-value">{{ recipe.nutritionInfo.vitaminA }}IU</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.vitaminC !== undefined">
          <div class="detail-label">维生素C</div>
          <div class="detail-value">{{ recipe.nutritionInfo.vitaminC }}mg</div>
        </div>

        <div class="detail-item" v-if="recipe.nutritionInfo?.vitaminD !== undefined">
          <div class="detail-label">维生素D</div>
          <div class="detail-value">{{ recipe.nutritionInfo.vitaminD }}IU</div>
        </div>
      </div>
    </div>

    <div class="nutrition-daily">
      <h4 class="daily-title">每日营养需求占比</h4>

      <div class="daily-bars">
        <div class="daily-item" v-if="recipe.nutritionInfo?.calories !== undefined">
          <div class="daily-label">热量</div>
          <div class="daily-bar">
            <div
              class="daily-progress"
              :style="{ width: calculateDailyPercentage('calories', 2000) + '%' }"
            ></div>
          </div>
          <div class="daily-percentage">{{ calculateDailyPercentage('calories', 2000) }}%</div>
        </div>

        <div class="daily-item" v-if="recipe.nutritionInfo?.protein !== undefined">
          <div class="daily-label">蛋白质</div>
          <div class="daily-bar">
            <div
              class="daily-progress"
              :style="{ width: calculateDailyPercentage('protein', 50) + '%' }"
            ></div>
          </div>
          <div class="daily-percentage">{{ calculateDailyPercentage('protein', 50) }}%</div>
        </div>

        <div class="daily-item" v-if="recipe.nutritionInfo?.carbs !== undefined">
          <div class="daily-label">碳水</div>
          <div class="daily-bar">
            <div
              class="daily-progress"
              :style="{ width: calculateDailyPercentage('carbs', 300) + '%' }"
            ></div>
          </div>
          <div class="daily-percentage">{{ calculateDailyPercentage('carbs', 300) }}%</div>
        </div>

        <div class="daily-item" v-if="recipe.nutritionInfo?.fat !== undefined">
          <div class="daily-label">脂肪</div>
          <div class="daily-bar">
            <div
              class="daily-progress"
              :style="{ width: calculateDailyPercentage('fat', 65) + '%' }"
            ></div>
          </div>
          <div class="daily-percentage">{{ calculateDailyPercentage('fat', 65) }}%</div>
        </div>

        <div class="daily-item" v-if="recipe.nutritionInfo?.fiber !== undefined">
          <div class="daily-label">膳食纤维</div>
          <div class="daily-bar">
            <div
              class="daily-progress"
              :style="{ width: calculateDailyPercentage('fiber', 25) + '%' }"
            ></div>
          </div>
          <div class="daily-percentage">{{ calculateDailyPercentage('fiber', 25) }}%</div>
        </div>

        <div class="daily-item" v-if="recipe.nutritionInfo?.sodium !== undefined">
          <div class="daily-label">钠</div>
          <div class="daily-bar">
            <div
              class="daily-progress"
              :style="{ width: calculateDailyPercentage('sodium', 2300) + '%' }"
            ></div>
          </div>
          <div class="daily-percentage">{{ calculateDailyPercentage('sodium', 2300) }}%</div>
        </div>
      </div>
    </div>

    <div class="nutrition-disclaimer">
      <p>* 基于2000卡路里的每日饮食需求。实际需求可能因个人情况而异。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import type { Recipe } from '@/services/recipeService'

  // 定义属性
  const props = defineProps<{
    recipe: Recipe
  }>()

  // 引用
  const chartContainer = ref<HTMLElement | null>(null)

  // 计算宏量素百分比
  const calculatePercentage = (nutrient: 'protein' | 'carbs' | 'fat') => {
    if (!props.recipe.nutritionInfo) return 0

    const { protein = 0, carbs = 0, fat = 0 } = props.recipe.nutritionInfo
    const total = protein + carbs + fat

    if (total === 0) return 0

    const value = props.recipe.nutritionInfo[nutrient] || 0
    return Math.round((value / total) * 100)
  }

  // 计算每日需求百分比
  const calculateDailyPercentage = (nutrient: string, dailyValue: number) => {
    if (
      !props.recipe.nutritionInfo ||
      !props.recipe.nutritionInfo[nutrient as keyof typeof props.recipe.nutritionInfo]
    )
      return 0

    const value = props.recipe.nutritionInfo[
      nutrient as keyof typeof props.recipe.nutritionInfo
    ] as number
    const percentage = Math.round((value / dailyValue) * 100)

    // 限制最大值为100%，以防止进度条溢出
    return Math.min(percentage, 100)
  }

  // 绘制营养素饼图
  const drawNutritionChart = () => {
    if (!chartContainer.value || !props.recipe.nutritionInfo) return

    // 这里可以使用Chart.js或其他图表库绘制饼图
    // 为了简化，我们使用CSS实现一个简单的饼图

    const { protein = 0, carbs = 0, fat = 0 } = props.recipe.nutritionInfo
    const total = protein + carbs + fat

    if (total === 0) return

    const proteinPercentage = (protein / total) * 100
    const carbsPercentage = (carbs / total) * 100
    // const fatPercentage = (fat / total) * 100 // 暂时未使用

    // 创建饼图
    const pieChart = document.createElement('div')
    pieChart.className = 'pie-chart'
    pieChart.style.background = `conic-gradient(
    var(--protein-color, #4CAF50) 0% ${proteinPercentage}%, 
    var(--carbs-color, #2196F3) ${proteinPercentage}% ${proteinPercentage + carbsPercentage}%, 
    var(--fat-color, #FFC107) ${proteinPercentage + carbsPercentage}% 100%
  )`

    // 创建图例
    const legend = document.createElement('div')
    legend.className = 'chart-legend'

    const legendItems = [
      { name: '蛋白质', color: 'var(--protein-color, #4CAF50)', value: protein },
      { name: '碳水', color: 'var(--carbs-color, #2196F3)', value: carbs },
      { name: '脂肪', color: 'var(--fat-color, #FFC107)', value: fat },
    ]

    legendItems.forEach(item => {
      const legendItem = document.createElement('div')
      legendItem.className = 'legend-item'

      const legendColor = document.createElement('div')
      legendColor.className = 'legend-color'
      legendColor.style.backgroundColor = item.color

      const legendText = document.createElement('div')
      legendText.className = 'legend-text'
      legendText.textContent = `${item.name}`

      legendItem.appendChild(legendColor)
      legendItem.appendChild(legendText)
      legend.appendChild(legendItem)
    })

    // 清空容器并添加新元素
    chartContainer.value.innerHTML = ''
    chartContainer.value.appendChild(pieChart)
    chartContainer.value.appendChild(legend)
  }

  // 监听食谱变化，重新绘制图表
  watch(
    () => props.recipe,
    () => {
      drawNutritionChart()
    },
    { deep: true }
  )

  // 生命周期钩子
  onMounted(() => {
    drawNutritionChart()
  })
</script>

<style lang="scss" scoped>
  .recipe-nutrition {
    background-color: var(--bg-color);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .nutrition-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
  }

  .nutrition-overview {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .nutrition-chart {
    flex: 1;
    min-width: 200px;
  }

  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .pie-chart {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-color: var(--bg-color);
    }
  }

  .chart-legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 180px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-text {
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .nutrition-summary {
    flex: 1;
    min-width: 200px;
  }

  .nutrition-total {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .total-calories {
    display: inline-block;
    padding: 1rem 2rem;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
  }

  .total-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .total-label {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .nutrition-macros {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .macro-item {
    flex: 1;
    text-align: center;
    padding: 1rem;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
  }

  .macro-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
  }

  .macro-label {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin: 0.3rem 0;
  }

  .macro-percentage {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--primary-color);
  }

  .nutrition-details {
    margin-bottom: 2rem;
  }

  .details-title,
  .daily-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .detail-item {
    padding: 0.8rem;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
  }

  .detail-label {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin-bottom: 0.3rem;
  }

  .detail-value {
    font-size: 1rem;
    font-weight: 500;
    color: var(--heading-color);
  }

  .daily-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .daily-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .daily-label {
    width: 80px;
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .daily-bar {
    flex: 1;
    height: 8px;
    background-color: var(--bg-color-secondary);
    border-radius: 4px;
    overflow: hidden;
  }

  .daily-progress {
    height: 100%;
    background-color: var(--primary-color);
    border-radius: 4px;
  }

  .daily-percentage {
    width: 40px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--heading-color);
    text-align: right;
  }

  .nutrition-disclaimer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .nutrition-disclaimer p {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin: 0;
  }

  :root {
    --protein-color: #4caf50;
    --carbs-color: #2196f3;
    --fat-color: #ffc107;
  }

  @media (max-width: 768px) {
    .nutrition-overview {
      flex-direction: column;
      gap: 1.5rem;
    }

    .nutrition-macros {
      flex-direction: column;
      gap: 0.8rem;
    }

    .details-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .daily-item {
      flex-wrap: wrap;
    }

    .daily-label {
      width: 100%;
      margin-bottom: 0.3rem;
    }

    .daily-bar {
      flex: 1;
    }
  }
</style>
