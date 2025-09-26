<template>
  <div class="cooking-guide-view">
    <!-- 页面头部 -->
    <div class="cooking-header">
      <div class="header-content">
        <div class="recipe-info">
          <h1 class="recipe-title">{{ recipe?.title || recipe?.name }}</h1>
          <div class="recipe-meta">
            <el-tag type="info">{{ formatDifficulty(recipe?.difficulty) }}</el-tag>
            <el-tag type="warning">{{ formatCookingTime(recipe?.cookingTime) }}</el-tag>
            <el-tag type="success">{{ formatServings(recipe?.servings) }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-button back" @click="goBack">
            <span class="action-icon">←</span>
            返回
          </button>
        </div>
      </div>
    </div>

    <div v-if="recipe" class="cooking-content">
      <!-- 烹饪进度 -->
      <div class="cooking-progress">
        <div class="progress-header">
          <h2 class="section-title">烹饪进度</h2>
          <span class="progress-text">{{ completedSteps }}/{{ totalSteps }} 完成</span>
        </div>
        <el-progress
          :percentage="progressPercentage"
          :stroke-width="12"
          :show-text="false"
          class="progress-bar"
        />
        <div class="progress-stats">
          <span class="stat-item">
            <span class="stat-icon">⏱️</span>
            预计时间：{{ formatCookingTime(recipe?.cookingTime) }}
          </span>
          <span class="stat-item">
            <span class="stat-icon">🔥</span>
            当前步骤：{{ currentStep + 1 }}
          </span>
        </div>
      </div>

      <!-- 食材准备 -->
      <div class="ingredients-section">
        <h2 class="section-title">
          <span class="section-icon">🥕</span>
          食材准备
        </h2>
        <div class="ingredients-grid">
          <div
            v-for="(ingredient, index) in recipe?.ingredients || []"
            :key="index"
            class="ingredient-item"
            :class="{ prepared: preparedIngredients[index] }"
            @click="toggleIngredientPrepared(index)"
          >
            <div class="ingredient-checkbox">
              <input
                type="checkbox"
                :checked="preparedIngredients[index]"
                @change="toggleIngredientPrepared(index)"
              />
              <span class="checkmark"></span>
            </div>
            <div class="ingredient-content">
              <div class="ingredient-name">
                {{ typeof ingredient === 'string' ? ingredient : ingredient.name }}
              </div>
              <div
                v-if="typeof ingredient !== 'string' && (ingredient.amount || ingredient.unit)"
                class="ingredient-amount"
              >
                {{ ingredient.amount }} {{ ingredient.unit }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 烹饪步骤 -->
      <div class="steps-section">
        <h2 class="section-title">
          <span class="section-icon">👨‍🍳</span>
          烹饪步骤
        </h2>
        <div v-if="recipeSteps.length > 0" class="steps-list">
          <div
            v-for="(step, index) in recipeSteps"
            :key="index"
            class="step-item"
            :class="{
              active: currentStep === index,
              completed: completedStepsList[index],
              locked: index > currentStep && !completedStepsList[index],
            }"
            @click="selectStep(index)"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-description">
                {{ typeof step === 'string' ? step : step.description }}
              </div>
              <div v-if="stepHasTime(step)" class="step-timer">
                <button
                  class="timer-button"
                  @click.stop="startStepTimer(step, index)"
                  :class="{ active: activeTimerStep === index }"
                >
                  <span class="timer-icon">⏱️</span>
                  {{ activeTimerStep === index ? '计时中...' : '设置计时' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-steps">
          <div class="no-steps-icon">📝</div>
          <p class="no-steps-text">该菜谱暂无详细的烹饪步骤</p>
          <p class="no-steps-subtitle">您可以参考食材列表和常规烹饪方法进行制作</p>
        </div>
      </div>

      <!-- 烹饪控制 -->
      <div v-if="recipeSteps.length > 0" class="cooking-controls">
        <button v-if="currentStep > 0" class="control-button secondary" @click="previousStep">
          <span class="control-icon">↑</span>
          上一步
        </button>
        <button
          v-if="currentStep < totalSteps - 1"
          class="control-button primary"
          @click="nextStep"
        >
          <span class="control-icon">↓</span>
          下一步
        </button>
        <button v-else class="control-button success" @click="completeCooking">
          <span class="control-icon">✅</span>
          完成烹饪
        </button>
      </div>
    </div>

    <div v-else class="no-recipe">
      <div class="no-recipe-icon">🍽️</div>
      <h2>未找到食谱</h2>
      <p>无法加载烹饪指导，请返回选择食谱</p>
      <button class="action-button primary" @click="goBack">返回</button>
    </div>

    <!-- 计时器模态框 -->
    <div v-if="showTimerModal" class="modal-overlay" @click="showTimerModal = false">
      <div class="modal-content timer-modal" @click.stop>
        <h3 class="modal-title">烹饪计时器</h3>
        <div class="modal-body">
          <div class="timer-step">{{ timerStep }}</div>
          <div class="timer-display">{{ formatTime(timerSeconds) }}</div>
          <div class="timer-controls">
            <button v-if="!timerRunning" class="timer-control-button start" @click="startTimer">
              开始
            </button>
            <button v-else class="timer-control-button pause" @click="pauseTimer">暂停</button>
            <button class="timer-control-button reset" @click="resetTimer">重置</button>
          </div>
        </div>
        <button class="modal-close" @click="showTimerModal = false">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Recipe, RecipeStep } from '@/types/recipe'

  const router = useRouter()
  const recipe = ref<Recipe | null>(null)

  // 烹饪状态
  const currentStep = ref(0)
  const completedStepsList = ref<boolean[]>([])
  const preparedIngredients = ref<boolean[]>([])

  // 计时器相关
  const showTimerModal = ref(false)
  const timerStep = ref('')
  const timerSeconds = ref(0)
  const timerRunning = ref(false)
  const timerInterval = ref<number | null>(null)
  const activeTimerStep = ref<number | null>(null)

  // 计算属性
  const recipeSteps = computed(() => {
    if (!recipe.value) return []

    // 优先使用 steps 字段
    if (Array.isArray(recipe.value.steps) && recipe.value.steps.length > 0) {
      return recipe.value.steps
    }

    // 如果 steps 为空，尝试使用 instructions 字段
    if (Array.isArray(recipe.value.instructions) && recipe.value.instructions.length > 0) {
      return recipe.value.instructions
    }

    // 如果都没有，返回空数组
    return []
  })

  const totalSteps = computed(() => recipeSteps.value.length)
  const completedSteps = computed(
    () => completedStepsList.value.filter(completed => completed).length
  )
  const progressPercentage = computed(() => {
    if (totalSteps.value === 0) return 0
    return Math.round((completedSteps.value / totalSteps.value) * 100)
  })

  // 格式化函数
  const formatServings = (servings: number | string | undefined) => {
    if (typeof servings === 'string') {
      return servings.includes('人份') ? servings : `${servings}人份`
    }
    const num = Number(servings)
    return isNaN(num) ? '1人份' : `${num}人份`
  }

  const formatCookingTime = (time: string | number | undefined) => {
    if (typeof time === 'number') return `${time}分钟`
    if (typeof time === 'string' && time.includes('分钟')) return time
    return time ? `${time}分钟` : '30分钟'
  }

  const formatDifficulty = (difficulty: string | number | undefined) => {
    if (typeof difficulty === 'number') {
      if (difficulty <= 2) return '简单'
      if (difficulty <= 4) return '中等'
      return '困难'
    }
    const diffMap: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      '1': '简单',
      '2': '简单',
      '3': '中等',
      '4': '中等',
      '5': '困难',
    }
    return diffMap[String(difficulty).toLowerCase()] || '中等'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 步骤相关函数
  const selectStep = (index: number) => {
    if (index <= currentStep.value || completedStepsList.value[index]) {
      currentStep.value = index
    }
  }

  const nextStep = () => {
    if (currentStep.value < totalSteps.value - 1) {
      completedStepsList.value[currentStep.value] = true
      currentStep.value++
    }
  }

  const previousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const completeCooking = () => {
    completedStepsList.value[totalSteps.value - 1] = true
    showNotification({
      type: 'success',
      title: '烹饪完成！',
      message: '恭喜您完成了这道菜的烹饪！',
    })
  }

  // 食材相关函数
  const toggleIngredientPrepared = (index: number) => {
    preparedIngredients.value[index] = !preparedIngredients.value[index]
  }

  // 计时器相关函数
  const stepHasTime = (step: string | RecipeStep): boolean => {
    const description = typeof step === 'string' ? step : step.description
    return /\d+\s*(分钟|秒钟|小时)/.test(description)
  }

  const extractTimeFromStep = (step: string | RecipeStep): number => {
    const description = typeof step === 'string' ? step : step.description
    const minuteMatch = description.match(/(\d+)\s*分钟/)
    const secondMatch = description.match(/(\d+)\s*秒钟/)
    const hourMatch = description.match(/(\d+)\s*小时/)

    let seconds = 0
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60
    if (secondMatch) seconds += parseInt(secondMatch[1])
    if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600

    return seconds || 300
  }

  const startStepTimer = (step: string | RecipeStep, index?: number) => {
    const description = typeof step === 'string' ? step : step.description
    timerStep.value = description
    timerSeconds.value = extractTimeFromStep(step)
    activeTimerStep.value = index !== undefined ? index : currentStep.value
    showTimerModal.value = true
  }

  const startTimer = () => {
    if (timerRunning.value) return

    timerRunning.value = true
    timerInterval.value = window.setInterval(() => {
      if (timerSeconds.value > 0) {
        timerSeconds.value--
      } else {
        pauseTimer()
        showNotification({ type: 'info', title: '计时完成！', message: '该步骤的计时时间到了！' })
      }
    }, 1000)
  }

  const pauseTimer = () => {
    timerRunning.value = false
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const resetTimer = () => {
    pauseTimer()
    timerSeconds.value = extractTimeFromStep(timerStep.value)
  }

  // 导航函数
  const goBack = () => {
    router.back()
  }

  // 通知函数
  const showNotification = (notification: { type: string; title: string; message: string }) => {
    const event = new CustomEvent('notification', {
      detail: notification,
    })
    window.dispatchEvent(event)
  }

  // 初始化
  const loadRecipe = () => {
    try {
      const recipeData = localStorage.getItem('currentCookingRecipe')
      if (recipeData) {
        recipe.value = JSON.parse(recipeData)

        // 初始化状态
        if (recipe.value) {
          // 安全地获取ingredients数组长度
          const ingredientsCount = Array.isArray(recipe.value.ingredients)
            ? recipe.value.ingredients.length
            : 0

          // 使用计算属性获取实际的步骤数量
          const stepsCount = recipeSteps.value.length
          completedStepsList.value = new Array(stepsCount).fill(false)
          preparedIngredients.value = new Array(ingredientsCount).fill(false)
          currentStep.value = 0

          // 如果没有步骤，添加默认步骤
          if (stepsCount === 0) {
            console.warn('Recipe has no steps, adding default step')
            recipe.value.steps = ['请按照常规烹饪方法制作这道菜']
            completedStepsList.value = [false]
          }

          // 如果没有食材，初始化空数组
          if (!Array.isArray(recipe.value.ingredients)) {
            console.warn('Recipe has no ingredients, initializing empty array')
            recipe.value.ingredients = []
          }
        }
      } else {
        console.error('No recipe data found in localStorage')
      }
    } catch (error) {
      console.error('Failed to load recipe:', error)
    }
  }

  // 生命周期
  onMounted(() => {
    loadRecipe()
  })

  onBeforeUnmount(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })
</script>

<style lang="scss" scoped>
  .cooking-guide-view {
    min-height: 100vh;
    background-color: var(--bg-color);
  }

  .cooking-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
    color: white;
    padding: 2rem 0;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
    position: relative;
    border-bottom: 3px solid rgba(255, 255, 255, 0.1);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.12);
      z-index: 1;
    }
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .recipe-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    color: white;
    letter-spacing: 0.5px;
  }

  .recipe-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .cooking-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-icon {
    font-size: 1.5rem;
  }

  .cooking-progress {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .progress-text {
    font-weight: 600;
    color: var(--primary-color);
  }

  .progress-bar {
    margin-bottom: 1rem;
  }

  .progress-stats {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color-secondary);
    font-size: 0.95rem;
  }

  .stat-icon {
    font-size: 1.1rem;
  }

  .ingredients-section {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .ingredient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--bg-color);
    border: 2px solid var(--border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.prepared {
      background-color: var(--success-color-light);
      border-color: var(--success-color);
    }
  }

  .ingredient-checkbox {
    position: relative;
    width: 20px;
    height: 20px;
    flex-shrink: 0;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 20px;
      width: 20px;
      background-color: var(--bg-color-secondary);
      border: 2px solid var(--border-color);
      border-radius: 4px;
      transition: all 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        display: none;
        left: 6px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    input:checked ~ .checkmark {
      background-color: var(--success-color);
      border-color: var(--success-color);

      &::after {
        display: block;
      }
    }
  }

  .ingredient-content {
    flex: 1;
  }

  .ingredient-name {
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.25rem;
  }

  .ingredient-amount {
    font-size: 0.85rem;
    color: var(--text-color-secondary);
  }

  .steps-section {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step-item {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--bg-color);
    border: 2px solid var(--border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(.locked) {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: var(--primary-color);
      background-color: var(--primary-color-light);
    }

    &.completed {
      border-color: var(--success-color);
      background-color: var(--success-color-light);
      opacity: 0.8;
    }

    &.locked {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--bg-color-secondary);
    }
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .step-item.completed .step-number {
    background-color: var(--success-color);
  }

  .step-content {
    flex: 1;
  }

  .step-description {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 1rem;
  }

  .step-timer {
    display: flex;
    justify-content: flex-start;
  }

  .timer-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    &.active {
      background-color: var(--warning-color);
      color: white;
      border-color: var(--warning-color);
    }
  }

  .cooking-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &.primary {
      background-color: var(--primary-color);
      color: white;

      &:hover {
        background-color: var(--primary-color-dark);
      }
    }

    &.secondary {
      background-color: var(--bg-color-secondary);
      color: var(--text-color);
      border: 1px solid var(--border-color);

      &:hover {
        background-color: var(--hover-color);
      }
    }

    &.success {
      background-color: var(--success-color);
      color: white;

      &:hover {
        background-color: var(--success-color-dark);
      }
    }
  }

  .no-recipe {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    color: var(--text-color-secondary);
  }

  .no-recipe-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    &.back {
      background-color: rgba(255, 255, 255, 0.25);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.4);
      font-weight: 600;
      backdrop-filter: blur(10px);

      &:hover {
        background-color: rgba(255, 255, 255, 0.35);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--bg-color);
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-color-secondary);
    cursor: pointer;

    &:hover {
      color: var(--text-color);
    }
  }

  .timer-modal .modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .timer-step {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .timer-display {
    font-size: 3rem;
    font-weight: 700;
    color: var(--heading-color);
    margin-bottom: 2rem;
  }

  .no-steps {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    text-align: center;
    border: 2px dashed var(--border-color);
  }

  .no-steps-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .no-steps-text {
    font-size: 1.1rem;
    color: var(--text-color);
    margin: 0 0 0.5rem 0;
    font-weight: 500;
  }

  .no-steps-subtitle {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .timer-controls {
    display: flex;
    gap: 1rem;
  }

  .timer-control-button {
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &.start {
      background-color: var(--primary-color);
      color: white;
      border: none;

      &:hover {
        background-color: var(--primary-color-dark);
      }
    }

    &.pause {
      background-color: var(--warning-color);
      color: white;
      border: none;

      &:hover {
        background-color: var(--warning-color-dark);
      }
    }

    &.reset {
      background-color: var(--bg-color-secondary);
      color: var(--text-color);
      border: 1px solid var(--border-color);

      &:hover {
        background-color: var(--hover-color);
      }
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .recipe-title {
      font-size: 2rem;
    }

    .cooking-content {
      padding: 1rem;
    }

    .ingredients-grid {
      grid-template-columns: 1fr;
    }

    .cooking-controls {
      flex-direction: column;
      align-items: stretch;

      .control-button {
        justify-content: center;
      }
    }

    .timer-display {
      font-size: 2.5rem;
    }
  }

  // 亮色模式样式调整
  @media (prefers-color-scheme: light) {
    .cooking-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);

      &::before {
        background: rgba(0, 0, 0, 0.18);
      }

      .recipe-title {
        color: white !important;
        text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
      }

      .recipe-meta .el-tag {
        color: white !important;
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        backdrop-filter: blur(10px);
      }

      .action-button.back {
        color: white !important;
        background-color: rgba(255, 255, 255, 0.3) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }

  // 深色模式样式保持不变
  @media (prefers-color-scheme: dark) {
    .cooking-header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
    }
  }
</style>
