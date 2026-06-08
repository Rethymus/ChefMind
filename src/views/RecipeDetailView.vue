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
              <div class="info-value">{{ formatCookingTime(recipe.cookingTime) }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">📊</div>
            <div class="info-content">
              <div class="info-label">难度</div>
              <div class="info-value">{{ formatDifficulty(recipe.difficulty) }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">🍽️</div>
            <div class="info-content">
              <div class="info-label">份量</div>
              <div class="info-value">{{ formatServings(recipe.servings) }}</div>
            </div>
          </div>
        </div>

        <div class="recipe-main">
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
                <label class="ingredient-checkbox" :for="`ingredient-${index}`">
                  <input
                    type="checkbox"
                    :id="`ingredient-${index}`"
                    v-model="selectedIngredients[index]"
                  />
                  <span class="checkbox-mark"></span>
                  <span class="ingredient-text">{{ ingredient }}</span>
                </label>
              </li>
            </ul>

            <div class="ingredients-actions">
              <div class="selection-actions">
                <button class="selection-button" @click="selectAllIngredients">
                  <span class="action-icon">☑️</span>
                  全选
                </button>
                <button class="selection-button" @click="deselectAllIngredients">
                  <span class="action-icon">☐</span>
                  取消全选
                </button>
              </div>
              <button class="action-button" @click="addToShoppingList">
                <span class="action-icon">🛒</span>
                添加勾选食材到购物清单 ({{ selectedCount }})
              </button>
            </div>
          </div>

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
                  <p>{{ getStepDescription(step) }}</p>
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

          <!-- 营养信息 -->
          <RecipeNutrition v-if="recipe.nutritionInfo" :recipe="recipe" />

          <!-- 烹饪小贴士 -->
          <div v-if="recipe.cookingTips && recipe.cookingTips.length > 0" class="tips-section">
            <h2 class="section-title">
              <span class="section-icon">💡</span>
              小贴士
            </h2>
            <div class="tips-content">
              <ul>
                <li v-for="tip in recipe.cookingTips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="recipe-actions">
          <button class="action-button primary" @click="startCooking">
            <span class="action-icon">🍳</span>
            开始烹饪
          </button>

          <button class="action-button secondary" @click="toggleFavorite">
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

        <!-- 多媒体平台跳转 -->
        <RecipeMultimediaPlatforms
          v-if="recipe"
          :recipe-name="recipe.name"
          @platform-click="handlePlatformClick"
        />

        <!-- 相关推荐 -->
        <RecipeRelated
          v-if="recipe && allRecipes.length > 0"
          :recipes="allRecipes"
          :current-recipe-id="recipe.id"
          @select-recipe="viewRelatedRecipe"
        />

        <!-- 个人备注 -->
        <div v-if="recipe" class="recipe-notes-section">
          <h2 class="section-title">
            <span class="section-icon">📝</span>
            个人备注
          </h2>
          <div class="notes-content">
            <div v-if="!isEditingNotes" class="notes-display">
              <p v-if="recipeNotes" class="notes-text">{{ recipeNotes }}</p>
              <p v-else class="notes-placeholder">暂无备注，点击下方按钮添加您的个人备注...</p>
              <button class="edit-notes-btn" @click="startEditingNotes">
                <span class="action-icon">✏️</span>
                {{ recipeNotes ? '编辑备注' : '添加备注' }}
              </button>
            </div>
            <div v-else class="notes-editor">
              <textarea
                v-model="tempNotes"
                class="notes-textarea"
                placeholder="在这里添加您对这道菜的个人备注，比如口味调整、制作心得、家人喜好等..."
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="notes-actions">
                <span class="char-count">{{ tempNotes.length }}/500</span>
                <div class="action-buttons">
                  <button class="cancel-btn" @click="cancelEditingNotes">取消</button>
                  <button class="save-btn" @click="saveNotes">保存</button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { useRecipeService, type Recipe as RecipeType } from '@/services/recipeService'
  import { shoppingListService } from '@/services/shoppingListService'
  import type { RecipeStep } from '@/types/recipe'
  import RecipeShare from '@/components/recipe/RecipeShare.vue'
  import RecipePrintPreview from '@/components/recipe/RecipePrintPreview.vue'
  import RecipeRelated from '@/components/recipe/RecipeRelated.vue'
  import RecipeNutrition from '@/components/recipe/RecipeNutrition.vue'
  import RecipeExport from '@/components/recipe/RecipeExport.vue'
  import RecipeMultimediaPlatforms from '@/components/recipe/RecipeMultimediaPlatforms.vue'
  import { favoritesService } from '@/services/favoritesService'

  const router = useRouter()
  const recipeService = useRecipeService()
  const recipe = ref<RecipeType | null>(null)
  const isFavorite = ref(false)
  const allRecipes = ref<RecipeType[]>([])
  const sessionId = ref('test-session-id') // Placeholder for session ID

  // 计时器相关
  const showTimerModal = ref(false)
  const timerStep = ref('')
  const timerSeconds = ref(0)
  const timerRunning = ref(false)
  const timerInterval = ref<number | null>(null)

  // 备注相关
  const isEditingNotes = ref(false)
  const recipeNotes = ref('')
  const tempNotes = ref('')

  // 食材勾选状态
  const selectedIngredients = ref<boolean[]>([])

  // 计算选中的食材数量
  const selectedCount = computed(
    () => selectedIngredients.value.filter(selected => selected).length
  )

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
      // 初始化食材勾选状态（默认全部勾选）
      selectedIngredients.value = new Array(recipe.value.ingredients.length).fill(true)
      checkIfFavorite()
      loadAllRecipes()
      loadRecipeNotes()
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
  const viewRelatedRecipe = (selectedRecipe: RecipeType) => {
    // 保存到会话存储
    sessionStorage.setItem('viewRecipe', JSON.stringify(selectedRecipe))

    // 重新加载当前页面
    recipe.value = selectedRecipe
    checkIfFavorite()

    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 检查是否已收藏
  const checkIfFavorite = async () => {
    if (!recipe.value) return

    try {
      // 使用统一的收藏服务
      isFavorite.value = await favoritesService.isFavorited(sessionId.value, recipe.value.id)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  // 切换收藏状态
  const toggleFavorite = async () => {
    if (!recipe.value) return

    try {
      if (isFavorite.value) {
        // 取消收藏
        const success = await favoritesService.removeFavorite(sessionId.value, recipe.value.id)
        if (success) {
          isFavorite.value = false
          showNotification({ type: 'success', title: '成功', message: '已取消收藏' })
        } else {
          showNotification({ type: 'error', title: '失败', message: '取消收藏失败' })
        }
      } else {
        // 添加收藏
        const favoriteRecipe = {
          id: recipe.value.id,
          title: recipe.value.title,
          description: recipe.value.description,
          image: recipe.value.image,
          cookingTime: recipe.value.cookingTime,
          difficulty: String(recipe.value.difficulty),
          servings: recipe.value.servings,
          ingredients: recipe.value.ingredients.map(ingredient =>
            typeof ingredient === 'string'
              ? ingredient
              : `${ingredient.name}${ingredient.amount ? ` ${ingredient.amount}` : ''}${ingredient.unit ? ` ${ingredient.unit}` : ''}`
          ),
          steps: recipe.value.steps.map(step =>
            typeof step === 'string' ? step : step.description
          ),
          nutrition: recipe.value.nutrition,
          createdAt: new Date(),
        }

        const success = await favoritesService.addFavorite(sessionId.value, favoriteRecipe)
        if (success) {
          isFavorite.value = true
          showNotification({ type: 'success', title: '成功', message: '已添加收藏' })
        } else {
          showNotification({ type: 'error', title: '失败', message: '添加收藏失败' })
        }
      }
    } catch (error) {
      console.error('❌ 切换收藏状态失败:', error)
      showNotification({ type: 'error', title: '错误', message: '操作失败，请重试' })
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

  // 开始烹饪
  const startCooking = () => {
    if (!recipe.value) return

    // 跳转到烹饪指导页面，传递食谱数据
    localStorage.setItem('currentCookingRecipe', JSON.stringify(recipe.value))
    router.push({
      name: 'CookingGuide',
    })
  }

  // 多媒体平台跳转事件处理
  const handlePlatformClick = (platform: string, recipeName: string) => {
    // 这里可以添加数据统计逻辑
    showNotification({
      type: 'info',
      title: '跳转提示',
      message: `正在为您跳转到${platform}搜索相关教程`,
    })
  }

  // 添加到购物清单
  const addToShoppingList = async () => {
    if (!recipe.value) return

    try {
      // 获取勾选的食材
      const selectedIngredientsData = recipe.value.ingredients.filter(
        (_, index) => selectedIngredients.value[index]
      )

      if (selectedIngredientsData.length === 0) {
        showNotification({
          type: 'warning',
          title: '提示',
          message: '请先勾选要添加到购物清单的食材',
        })
        return
      }

      // 转换食材格式以匹配购物清单服务接口
      const ingredients = selectedIngredientsData.map(ingredient => {
        if (typeof ingredient === 'string') {
          return ingredient
        } else {
          return {
            name: ingredient.name,
            amount: ingredient.amount?.toString(),
            unit: ingredient.unit,
          }
        }
      })

      // 使用购物清单服务添加食材
      const addedItems = await shoppingListService.addIngredientsFromRecipe(
        recipe.value.id,
        recipe.value.name,
        ingredients
      )

      if (addedItems.length > 0) {
        showNotification({
          type: 'success',
          title: '成功',
          message: `已添加 ${addedItems.length} 种新食材到购物清单`,
        })
      } else {
        showNotification({
          type: 'info',
          title: '提示',
          message: '所选食材已在购物清单中，无需重复添加',
        })
      }
    } catch (error) {
      console.error('添加到购物清单失败:', error)
      showNotification({
        type: 'error',
        title: '错误',
        message: '添加失败，请重试',
      })
    }
  }

  // 食材选择相关函数
  const selectAllIngredients = () => {
    selectedIngredients.value = selectedIngredients.value.map(() => true)
  }

  const deselectAllIngredients = () => {
    selectedIngredients.value = selectedIngredients.value.map(() => false)
  }

  // 备注相关方法
  const loadRecipeNotes = () => {
    if (!recipe.value) return
    const savedNotes = localStorage.getItem(`recipe_notes_${recipe.value.id}`)
    recipeNotes.value = savedNotes || ''
  }

  const startEditingNotes = () => {
    tempNotes.value = recipeNotes.value
    isEditingNotes.value = true
  }

  const cancelEditingNotes = () => {
    tempNotes.value = ''
    isEditingNotes.value = false
  }

  const saveNotes = () => {
    if (!recipe.value) return

    recipeNotes.value = tempNotes.value.trim()
    localStorage.setItem(`recipe_notes_${recipe.value.id}`, recipeNotes.value)
    isEditingNotes.value = false

    showNotification({
      type: 'success',
      title: '保存成功',
      message: recipeNotes.value ? '备注已保存' : '备注已清空',
    })
  }

  // 显示通知
  const showNotification = (notification: { type: string; title: string; message: string }) => {
    const event = new CustomEvent('notification', {
      detail: notification,
    })
    window.dispatchEvent(event)
  }

  // 获取步骤描述文本
  const getStepDescription = (step: string | RecipeStep): string => {
    return typeof step === 'string' ? step : step.description
  }

  // 检查步骤是否包含时间信息
  const stepHasTime = (step: string | RecipeStep): boolean => {
    const description = getStepDescription(step)
    return /\d+\s*(分钟|秒钟|小时)/.test(description)
  }

  // 从步骤文本中提取时间（秒）
  const extractTimeFromStep = (step: string | RecipeStep): number => {
    const description = getStepDescription(step)
    const minuteMatch = description.match(/(\d+)\s*分钟/)
    const secondMatch = description.match(/(\d+)\s*秒钟/)
    const hourMatch = description.match(/(\d+)\s*小时/)

    let seconds = 0
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60
    if (secondMatch) seconds += parseInt(secondMatch[1])
    if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600

    return seconds || 300 // 默认5分钟
  }

  // 开始步骤计时
  const startStepTimer = (step: string | RecipeStep) => {
    const description = getStepDescription(step)
    timerStep.value = description
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
        showNotification({ type: 'info', title: '提示', message: '计时完成！' })
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

  // 格式化烹饪时间
  const formatCookingTime = (time: string | number) => {
    if (typeof time === 'number') {
      return `${time}分钟`
    }

    const timeStr = String(time).toLowerCase()

    // 如果已经包含单位，直接返回
    if (
      timeStr.includes('分钟') ||
      timeStr.includes('小时') ||
      timeStr.includes('天') ||
      timeStr.includes('min') ||
      timeStr.includes('hour') ||
      timeStr.includes('day')
    ) {
      return String(time)
    }

    // 如果是纯数字，添加分钟单位
    const numMatch = timeStr.match(/^\d+$/)
    if (numMatch) {
      return `${time}分钟`
    }

    return String(time)
  }

  // 格式化难度
  const formatDifficulty = (difficulty: string | number) => {
    if (typeof difficulty === 'number') {
      if (difficulty <= 2) return '简单'
      if (difficulty <= 4) return '中等'
      return '困难'
    }

    const diffStr = String(difficulty).toLowerCase()

    // 中文翻译
    const difficultyMap: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      simple: '简单',
      normal: '中等',
      difficult: '困难',
      '1': '简单',
      '2': '简单',
      '3': '中等',
      '4': '中等',
      '5': '困难',
    }

    return difficultyMap[diffStr] || String(difficulty)
  }

  // 格式化份量
  const formatServings = (servings: number | string) => {
    if (typeof servings === 'string') {
      // 如果已经包含单位，直接返回
      if (servings.includes('人份') || servings.includes('份')) {
        return servings
      }
    }

    const num = Number(servings)
    return isNaN(num) ? String(servings) : `${num}人份`
  }

  // 生命周期钩子
  onMounted(async () => {
    // 迁移旧的 localStorage 数据到统一存储
    try {
      await favoritesService.migrateFromLocalStorage(sessionId.value)
    } catch (error) {
      console.warn('收藏数据迁移失败:', error)
    }

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
    display: flex;
    flex-direction: column;
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.8rem;
  }

  .ingredient-item {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color-light);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .ingredient-checkbox {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1rem;
    cursor: pointer;
    width: 100%;
    border-radius: 8px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    input[type='checkbox'] {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkbox-mark {
      position: relative;
      display: inline-block;
      width: 18px;
      height: 18px;
      background-color: var(--bg-color-secondary);
      border: 2px solid var(--border-color);
      border-radius: 4px;
      flex-shrink: 0;
      transition: all 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        display: none;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    input[type='checkbox']:checked + .checkbox-mark {
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      &::after {
        display: block;
      }
    }
  }

  .ingredient-text {
    font-size: 0.95rem;
    line-height: 1.4;
    color: var(--text-color);
    font-weight: 500;
    flex: 1;
  }

  .ingredients-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color-light);
  }

  .selection-actions {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
  }

  .selection-button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
      transform: translateY(-1px);
    }

    .action-icon {
      font-size: 0.9rem;
    }
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    align-self: center;

    &:hover {
      background-color: var(--primary-color-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .action-icon {
      font-size: 1.1rem;
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

  // 备注模块样式
  .recipe-notes-section {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .notes-content {
    margin-top: 1rem;
  }

  .notes-display {
    .notes-text {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-color);
      margin: 0 0 1rem 0;
      padding: 1rem;
      background-color: var(--bg-color);
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .notes-placeholder {
      font-size: 0.95rem;
      color: var(--text-color-muted);
      margin: 0 0 1rem 0;
      padding: 1rem;
      background-color: var(--bg-color);
      border-radius: 8px;
      border: 2px dashed var(--border-color);
      text-align: center;
    }

    .edit-notes-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.8rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--primary-color-dark);
        transform: translateY(-1px);
      }
    }
  }

  .notes-editor {
    .notes-textarea {
      width: 100%;
      min-height: 120px;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--text-color);
      background-color: var(--bg-color);
      resize: vertical;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      &::placeholder {
        color: var(--text-color-muted);
      }
    }

    .notes-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;

      .char-count {
        font-size: 0.85rem;
        color: var(--text-color-muted);
      }

      .action-buttons {
        display: flex;
        gap: 0.8rem;

        .cancel-btn,
        .save-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .cancel-btn {
          background-color: var(--bg-color-secondary);
          color: var(--text-color);
          border: 1px solid var(--border-color);

          &:hover {
            background-color: var(--hover-color);
          }
        }

        .save-btn {
          background-color: var(--primary-color);
          color: white;

          &:hover {
            background-color: var(--primary-color-dark);
          }
        }
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
    .tips-section,
    .recipe-notes-section {
      padding: 1.2rem;
      margin-bottom: 1.5rem;
    }

    // 备注模块移动端样式
    .recipe-notes-section {
      padding: 1rem;
    }

    .notes-display {
      .notes-text,
      .notes-placeholder {
        padding: 0.8rem;
        font-size: 0.95rem;
      }

      .edit-notes-btn {
        width: 100%;
        justify-content: center;
        padding: 0.8rem;
        font-size: 0.95rem;
      }
    }

    .notes-editor {
      .notes-textarea {
        padding: 0.8rem;
        font-size: 0.95rem;
        min-height: 100px;
      }

      .notes-actions {
        flex-direction: column;
        gap: 0.8rem;
        align-items: stretch;

        .char-count {
          text-align: center;
          order: 2;
        }

        .action-buttons {
          order: 1;
          justify-content: space-between;
          gap: 1rem;

          .cancel-btn,
          .save-btn {
            flex: 1;
            padding: 0.8rem;
            font-size: 0.95rem;
          }
        }
      }
    }

    .ingredients-list {
      grid-template-columns: 1fr;
    }

    .ingredients-actions {
      gap: 0.8rem;

      .selection-actions {
        gap: 0.6rem;
      }

      .selection-button {
        padding: 0.5rem 0.8rem;
        font-size: 0.85rem;
      }

      .action-button {
        padding: 0.8rem 1.2rem;
        font-size: 0.95rem;
      }
    }

    .ingredient-checkbox {
      padding: 0.6rem 0.8rem;
    }

    .ingredient-text {
      font-size: 0.9rem;
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
