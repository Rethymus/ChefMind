<template>
  <div class="recipe-detail-view">
    <div class="container">
      <div class="back-nav">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span>
          返回
        </button>
      </div>

      <div v-if="recipe" class="recipe-content">
        <!-- 食谱标题和评分 -->
        <div class="recipe-header">
          <h1 class="recipe-title">{{ recipe.name }}</h1>
          <div class="recipe-rating">
            <span
              v-for="i in 5"
              :key="i"
              :class="['star', { filled: i <= Math.floor(recipe.rating || 4.5) }]"
              >★</span
            >
            <span class="rating-text">({{ (recipe.rating || 4.5).toFixed(1) }})</span>
          </div>
        </div>

        <!-- 食谱描述 -->
        <p class="recipe-description">{{ recipe.description }}</p>

        <!-- 食谱基本信息 -->
        <div class="recipe-info-cards">
          <div class="info-card">
            <div class="info-icon">⏱️</div>
            <div class="info-content">
              <div class="info-label">烹饪时间</div>
              <div class="info-value">{{ recipe.cookingTime }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">📊</div>
            <div class="info-content">
              <div class="info-label">难度</div>
              <div class="info-value">{{ recipe.difficulty }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">🍽️</div>
            <div class="info-content">
              <div class="info-label">份量</div>
              <div class="info-value">{{ recipe.servings || '2人份' }}</div>
            </div>
          </div>
        </div>

        <div class="recipe-main">
          <div class="recipe-left">
            <!-- 食材列表 -->
            <div class="ingredients-section">
              <h2 class="section-title">
                <span class="section-icon">🥕</span>
                食材
              </h2>
              <ul class="ingredients-list">
                <li
                  v-for="(ingredient, index) in recipe.ingredients"
                  :key="index"
                  class="ingredient-item"
                >
                  <div class="ingredient-checkbox">
                    <input type="checkbox" :id="`ingredient-${index}`" />
                    <label :for="`ingredient-${index}`"></label>
                  </div>
                  <span class="ingredient-text">{{ ingredient }}</span>
                </li>
              </ul>

              <div class="ingredients-actions">
                <button class="action-button" @click="addToShoppingList">
                  <span class="action-icon">🛒</span>
                  添加到购物清单
                </button>
              </div>
            </div>

            <!-- 营养信息 -->
            <RecipeNutrition v-if="recipe.nutritionInfo" :recipe="recipe" />
          </div>

          <div class="recipe-right">
            <!-- 烹饪步骤 -->
            <div class="steps-section">
              <h2 class="section-title">
                <span class="section-icon">👨‍🍳</span>
                烹饪步骤
              </h2>
              <ol class="steps-list">
                <li v-for="(step, index) in recipe.steps" :key="index" class="step-item">
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <p>{{ step }}</p>
                    <div class="step-timer" v-if="stepHasTime(step)">
                      <button class="timer-button" @click="startStepTimer(step)">
                        <span class="timer-icon">⏱️</span>
                        设置计时
                      </button>
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            <!-- 烹饪小贴士 -->
            <div v-if="recipe.tips" class="tips-section">
              <h2 class="section-title">
                <span class="section-icon">💡</span>
                小贴士
              </h2>
              <div class="tips-content">
                {{ recipe.tips }}
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="recipe-actions">
          <button class="action-button primary" @click="toggleFavorite">
            <span class="action-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
            {{ isFavorite ? '取消收藏' : '收藏食谱' }}
          </button>

          <button class="action-button secondary" @click="shareRecipe">
            <span class="action-icon">🔗</span>
            分享食谱
          </button>

          <button class="action-button secondary" @click="printRecipe">
            <span class="action-icon">🖨️</span>
            打印食谱
          </button>

          <button class="action-button secondary" @click="exportRecipe">
            <span class="action-icon">📤</span>
            导出食谱
          </button>
        </div>

        <!-- 相关推荐 -->
        <RecipeRelated
          v-if="recipe && allRecipes.length > 0"
          :recipes="allRecipes"
          :current-recipe-id="recipe.id"
          @select-recipe="viewRelatedRecipe"
        />

        <!-- 评论区 -->
        <RecipeComments v-if="recipe" :recipe-id="recipe.id" @update-rating="updateRecipeRating" />
      </div>

      <div v-else class="no-recipe">
        <div class="no-recipe-icon">🍽️</div>
        <h2>未找到食谱</h2>
        <p>无法加载食谱详情，请返回重试</p>
        <button class="back-button large" @click="goBack">返回</button>
      </div>
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

    <!-- 分享模态框 -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content share-modal" @click.stop>
        <h3 class="modal-title">分享食谱</h3>
        <div class="modal-body">
          <RecipeShare
            v-if="recipe"
            :recipe="recipe"
            :visible="showShareModal"
            @notification="showNotification"
          />
        </div>
        <button class="modal-close" @click="showShareModal = false">×</button>
      </div>
    </div>

    <!-- 打印预览模态框 -->
    <div v-if="showPrintModal" class="modal-overlay" @click="showPrintModal = false">
      <div class="modal-content print-modal" @click.stop>
        <h3 class="modal-title">打印预览</h3>
        <div class="modal-body">
          <RecipePrintPreview v-if="recipe" :recipe="recipe" @notification="showNotification" />
        </div>
        <button class="modal-close" @click="showPrintModal = false">×</button>
      </div>
    </div>

    <!-- 导出模态框 -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal-content export-modal" @click.stop>
        <h3 class="modal-title">导出食谱</h3>
        <div class="modal-body">
          <RecipeExport v-if="recipe" :recipe="recipe" @notification="showNotification" />
        </div>
        <button class="modal-close" @click="showExportModal = false">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { useRecipeService, type Recipe } from '@/services/recipeService'
  import RecipeComments from '@/components/recipe/RecipeComments.vue'
  import RecipeShare from '@/components/recipe/RecipeShare.vue'
  import RecipePrintPreview from '@/components/recipe/RecipePrintPreview.vue'
  import RecipeRelated from '@/components/recipe/RecipeRelated.vue'
  import RecipeNutrition from '@/components/recipe/RecipeNutrition.vue'
  import RecipeExport from '@/components/recipe/RecipeExport.vue'

  const router = useRouter()
  const recipeService = useRecipeService()
  const recipe = ref<Recipe | null>(null)
  const isFavorite = ref(false)
  const allRecipes = ref<Recipe[]>([])

  // 计时器相关
  const showTimerModal = ref(false)
  const timerStep = ref('')
  const timerSeconds = ref(0)
  const timerRunning = ref(false)
  const timerInterval = ref<number | null>(null)

  // 分享相关
  const showShareModal = ref(false)

  // 打印相关
  const showPrintModal = ref(false)

  // 导出相关
  const showExportModal = ref(false)

  // 从会话存储中获取食谱数据
  const loadRecipe = () => {
    const recipeData = sessionStorage.getItem('viewRecipe')
    if (recipeData) {
      recipe.value = JSON.parse(recipeData)
      checkIfFavorite()
      loadAllRecipes()
    }
  }

  // 加载所有食谱数据，用于相关推荐
  const loadAllRecipes = async () => {
    try {
      allRecipes.value = await recipeService.getAllRecipes()
    } catch (error) {
      console.error('加载食谱数据失败:', error)
      allRecipes.value = []
    }
  }

  // 查看相关食谱
  const viewRelatedRecipe = (selectedRecipe: Recipe) => {
    // 保存到会话存储
    sessionStorage.setItem('viewRecipe', JSON.stringify(selectedRecipe))

    // 重新加载当前页面
    recipe.value = selectedRecipe
    checkIfFavorite()

    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 检查是否已收藏
  const checkIfFavorite = () => {
    if (!recipe.value) return

    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
      isFavorite.value = savedRecipes.some((r: Recipe) => r.id === recipe.value?.id)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  // 切换收藏状态
  const toggleFavorite = () => {
    if (!recipe.value) return

    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')

      if (isFavorite.value) {
        // 取消收藏
        const index = savedRecipes.findIndex((r: Recipe) => r.id === recipe.value?.id)
        if (index !== -1) {
          savedRecipes.splice(index, 1)
          showNotification('success', '已取消收藏')
        }
      } else {
        // 添加收藏
        savedRecipes.push(recipe.value)
        showNotification('success', '已添加到收藏')
      }

      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes))
      isFavorite.value = !isFavorite.value
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      showNotification('error', '操作失败，请重试')
    }
  }

  // 返回上一页
  const goBack = () => {
    router.back()
  }

  // 分享食谱
  const shareRecipe = () => {
    if (!recipe.value) return

    // 显示分享模态框
    showShareModal.value = true
  }

  // 复制链接到剪贴板
  const copyToClipboard = () => {
    const dummyTextArea = document.createElement('textarea')
    dummyTextArea.value = window.location.href
    document.body.appendChild(dummyTextArea)
    dummyTextArea.select()
    document.execCommand('copy')
    document.body.removeChild(dummyTextArea)

    showNotification('success', '链接已复制到剪贴板')
  }

  // 打印食谱
  const printRecipe = () => {
    if (!recipe.value) return

    // 显示打印预览模态框
    showPrintModal.value = true
  }

  // 导出食谱
  const exportRecipe = () => {
    if (!recipe.value) return

    // 显示导出模态框
    showExportModal.value = true
  }

  // 添加到购物清单
  const addToShoppingList = () => {
    if (!recipe.value) return

    try {
      const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]')

      // 添加食材到购物清单
      recipe.value.ingredients.forEach(ingredient => {
        if (!shoppingList.some((item: any) => item.name === ingredient)) {
          shoppingList.push({
            name: ingredient,
            completed: false,
          })
        }
      })

      localStorage.setItem('shoppingList', JSON.stringify(shoppingList))
      showNotification('success', '已添加食材到购物清单')
    } catch (error) {
      console.error('添加到购物清单失败:', error)
      showNotification('error', '添加失败，请重试')
    }
  }

  // 显示通知
  const showNotification = (type: string, message: string) => {
    const event = new CustomEvent('notification', {
      detail: {
        type,
        title: type === 'success' ? '成功' : '错误',
        message,
      },
    })
    window.dispatchEvent(event)
  }

  // 检查步骤是否包含时间信息
  const stepHasTime = (step: string) => {
    return /\d+\s*(分钟|秒钟|小时)/.test(step)
  }

  // 从步骤文本中提取时间（秒）
  const extractTimeFromStep = (step: string) => {
    const minuteMatch = step.match(/(\d+)\s*分钟/)
    const secondMatch = step.match(/(\d+)\s*秒钟/)
    const hourMatch = step.match(/(\d+)\s*小时/)

    let seconds = 0
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60
    if (secondMatch) seconds += parseInt(secondMatch[1])
    if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600

    return seconds || 300 // 默认5分钟
  }

  // 开始步骤计时
  const startStepTimer = (step: string) => {
    timerStep.value = step
    timerSeconds.value = extractTimeFromStep(step)
    showTimerModal.value = true
  }

  // 开始计时器
  const startTimer = () => {
    if (timerRunning.value) return

    timerRunning.value = true
    timerInterval.value = window.setInterval(() => {
      if (timerSeconds.value > 0) {
        timerSeconds.value--
      } else {
        pauseTimer()
        // 播放提示音
        const audio = new Audio('/notification.mp3')
        audio.play().catch(e => console.error('无法播放提示音:', e))
        showNotification('info', '计时完成！')
      }
    }, 1000)
  }

  // 暂停计时器
  const pauseTimer = () => {
    timerRunning.value = false
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // 重置计时器
  const resetTimer = () => {
    pauseTimer()
    timerSeconds.value = extractTimeFromStep(timerStep.value)
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 更新食谱评分
  const updateRecipeRating = (newRating: number) => {
    if (!recipe.value) return

    try {
      // 更新当前食谱的评分
      recipe.value.rating = newRating

      // 更新会话存储中的食谱数据
      sessionStorage.setItem('viewRecipe', JSON.stringify(recipe.value))

      // 更新本地存储中的收藏食谱评分
      if (isFavorite.value) {
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
        const index = savedRecipes.findIndex((r: Recipe) => r.id === recipe.value?.id)
        if (index !== -1) {
          savedRecipes[index].rating = newRating
          localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes))
        }
      }

      // 显示通知
      showNotification('success', '评分已更新')
    } catch (error) {
      console.error('更新评分失败:', error)
      showNotification('error', '更新评分失败，请重试')
    }
  }

  // 生命周期钩子
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
  .recipe-detail-view {
    min-height: 100vh;
    padding: 2rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .back-nav {
    margin-bottom: 2rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    &.large {
      font-size: 1.1rem;
      padding: 0.8rem 1.5rem;
      background-color: var(--primary-color);
      color: white;
      border-radius: 8px;

      &:hover {
        background-color: var(--primary-color-dark);
      }
    }
  }

  .back-icon {
    font-size: 1.2rem;
  }

  .recipe-header {
    margin-bottom: 1.5rem;
  }

  .recipe-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }

  .recipe-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .star {
    color: var(--border-color);
    font-size: 1.2rem;
  }

  .star.filled {
    color: var(--warning-color);
  }

  .rating-text {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin-left: 0.5rem;
  }

  .recipe-description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 2rem;
  }

  .recipe-info-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .info-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .info-icon {
    font-size: 2rem;
  }

  .info-label {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin-bottom: 0.3rem;
  }

  .info-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
  }

  .recipe-main {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid var(--border-color);
  }

  .section-icon {
    font-size: 1.5rem;
  }

  .ingredients-section,
  .nutrition-section {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .ingredients-list {
    list-style-type: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }

  .ingredient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--border-color-light);

    &:last-child {
      border-bottom: none;
    }
  }

  .ingredient-checkbox {
    position: relative;

    input[type='checkbox'] {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    label {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: var(--bg-color);
      border: 2px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        display: none;
        left: 7px;
        top: 3px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    input[type='checkbox']:checked + label {
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      &::after {
        display: block;
      }
    }
  }

  .ingredient-text {
    font-size: 1rem;
    color: var(--text-color);
  }

  .ingredients-actions {
    display: flex;
    justify-content: center;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: var(--bg-color);
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

    &.primary {
      background-color: var(--primary-color);
      color: white;
      border: none;

      &:hover {
        background-color: var(--primary-color-dark);
      }
    }

    &.secondary {
      background-color: var(--bg-color-secondary);

      &:hover {
        background-color: var(--hover-color);
      }
    }
  }

  .action-icon {
    font-size: 1.2rem;
  }

  .nutrition-chart {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .nutrition-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nutrition-label {
    width: 60px;
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .nutrition-bar {
    flex: 1;
    height: 12px;
    background-color: var(--bg-color);
    border-radius: 6px;
    overflow: hidden;
  }

  .nutrition-fill {
    height: 100%;
    background-color: var(--primary-color);
    border-radius: 6px;
    transition: width 0.5s ease;

    &.protein {
      background-color: #4ecdc4;
    }

    &.carbs {
      background-color: #ff6b6b;
    }

    &.fat {
      background-color: #ffe66d;
    }
  }

  .nutrition-value {
    width: 70px;
    text-align: right;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .steps-section,
  .tips-section {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .steps-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .step-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-weight: 600;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;

    p {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-color);
      margin: 0 0 0.8rem 0;
    }
  }

  .step-timer {
    display: flex;
    justify-content: flex-start;
  }

  .timer-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .timer-icon {
    font-size: 1rem;
  }

  .tips-content {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--bg-color);
    border-left: 4px solid var(--warning-color);
    padding: 1.2rem;
    border-radius: 0 8px 8px 0;
  }

  .recipe-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .no-recipe {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
  }

  .no-recipe-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  .no-recipe h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }

  .no-recipe p {
    font-size: 1.1rem;
    color: var(--text-color-secondary);
    margin: 0 0 2rem 0;
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

  @media print {
    .back-nav,
    .recipe-actions,
    .ingredients-actions,
    .step-timer {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .recipe-title {
      font-size: 1.8rem;
    }

    .recipe-description {
      font-size: 1rem;
    }

    .recipe-main {
      grid-template-columns: 1fr;
    }

    .recipe-actions {
      flex-direction: column;
      gap: 0.8rem;

      .action-button {
        width: 100%;
      }
    }

    .info-card {
      padding: 1rem;
    }

    .recipe-info-cards {
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.3rem;
    }

    .ingredients-section,
    .nutrition-section,
    .steps-section,
    .tips-section {
      padding: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .step-item {
      margin-bottom: 1.2rem;
    }

    .modal-content {
      width: 95%;
      padding: 1.5rem;
    }

    .timer-display {
      font-size: 2.5rem;
    }
  }
</style>
