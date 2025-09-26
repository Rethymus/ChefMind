<template>
  <div class="favorites-page-complete">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="refreshFavorites">🔄 刷新</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载收藏...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="favoriteRecipes.length === 0" class="empty-container">
      <div class="empty-icon">📚</div>
      <h2>暂无收藏的菜谱</h2>
      <p>去发现一些美味的菜谱并收藏它们吧！</p>
      <button class="explore-btn" @click="goToSearch">🔍 探索菜谱</button>
    </div>

    <!-- 菜谱列表 -->
    <div v-else class="content-container">
      <div class="recipes-header">
        <h2>{{ favoriteRecipes.length }} 个收藏菜谱</h2>
        <button class="clear-all-btn" @click="clearAllFavorites">🗑️ 清空收藏</button>
      </div>

      <div class="recipes-grid">
        <div
          v-for="(recipe, index) in favoriteRecipes"
          :key="`favorite-${recipe.id || index}`"
          class="recipe-card"
        >
          <!-- 菜谱封面 -->
          <div class="recipe-cover" @click="viewRecipeDetail(recipe)">
            <!-- 使用SVG生成与菜谱名称匹配的封面 -->
            <div
              class="recipe-svg-cover"
              v-html="generateRecipeSvg(recipe.name || recipe.title || '美味菜谱')"
            ></div>
            <div class="recipe-overlay">
              <button class="view-detail-btn">👁️ 查看详情</button>
            </div>
          </div>

          <!-- 菜谱信息 -->
          <div class="recipe-info">
            <h3 class="recipe-title">{{ recipe.name || recipe.title || '未命名菜谱' }}</h3>

            <p v-if="recipe.description" class="recipe-description">
              {{ truncateText(recipe.description, 80) }}
            </p>

            <!-- 菜谱标签 -->
            <div class="recipe-tags">
              <span v-if="recipe.cookingTime" class="tag time-tag">
                ⏱️ {{ formatCookingTime(recipe.cookingTime) }}
              </span>
              <span v-if="recipe.difficulty" class="tag difficulty-tag">
                ⭐ {{ formatDifficulty(recipe.difficulty) }}
              </span>
              <span v-if="recipe.ingredients" class="tag ingredient-tag">
                🥗 {{ recipe.ingredients.length }}种食材
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="recipe-actions">
              <button
                class="action-btn view-btn"
                @click="viewRecipeDetail(recipe)"
                title="查看详情"
              >
                📖 详情
              </button>
              <button
                class="action-btn remove-btn"
                @click="removeFavorite(recipe, index)"
                title="移除收藏"
              >
                💔 移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试信息（开发模式） -->
    <div v-if="showDebugInfo" class="debug-panel">
      <h3>🔧 调试信息</h3>
      <div class="debug-content">
        <p><strong>收藏数量:</strong> {{ favoriteRecipes.length }}</p>
        <p><strong>localStorage状态:</strong> {{ localStorageStatus }}</p>
        <p><strong>最后更新:</strong> {{ lastUpdateTime }}</p>
        <button @click="toggleDebugInfo">隐藏调试</button>
        <button @click="exportDebugData">导出数据</button>
      </div>
    </div>

    <!-- 调试按钮 -->
    <button class="debug-toggle-btn" @click="toggleDebugInfo">🔧</button>

    <!-- 通知消息 -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { generateRecipeCardSvg } from '@/utils/svgGenerator'
  import { formatDifficulty, formatCookingTime } from '@/utils/formatUtils'
  import { Recipe as RecipeModel } from '@/models/Recipe'
  import { Favorite as FavoriteModel } from '@/models/Favorite'

  // 类型定义
  interface RecipeUI {
    id?: string
    name?: string
    title?: string
    description?: string
    image?: string
    cookingTime?: number
    difficulty?: number
    ingredients?: string[]
    steps?: string[]
    nutritionInfo?: any
    rating?: number
    [key: string]: any
  }

  interface NotificationState {
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }

  // 路由
  const router = useRouter()

  // 响应式数据
  const isLoading = ref(true)
  const favoriteRecipes = ref<RecipeUI[]>([])
  const showDebugInfo = ref(false)
  const lastUpdateTime = ref('')
  const notification = ref<NotificationState>({
    show: false,
    message: '',
    type: 'info',
  })

  // 计算属性
  const localStorageStatus = computed(() => {
    return '已迁移到SQLite数据库'
  })

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    notification.value = {
      show: true,
      message,
      type,
    }
    setTimeout(() => {
      notification.value.show = false
    }, 3000)
  }

  // 加载收藏数据
  const loadFavorites = async () => {
    isLoading.value = true

    try {
      // 生成一个唯一的sessionId（在实际应用中应该从用户会话中获取）
      const sessionId = localStorage.getItem('sessionId') || 'default-session'

      // 从SQLite数据库中获取收藏的菜谱
      const favorites = await FavoriteModel.getUserFavorites(sessionId, 100, 0)

      if (favorites.length > 0) {
        // 获取收藏的菜谱详情
        const recipeIds = favorites.map(fav => fav.recipeId)
        const recipes = []

        for (const recipeId of recipeIds) {
          try {
            const recipe = await RecipeModel.findById(recipeId)
            if (recipe) {
              recipes.push({
                id: recipe.id.toString(),
                name: recipe.title,
                title: recipe.title,
                description: recipe.description,
                cookingTime: recipe.cookingTime,
                difficulty: recipe.difficulty,
                ingredients: recipe.ingredients,
                steps: recipe.instructions,
                nutritionInfo: recipe.nutritionInfo,
                rating: recipe.averageRating,
              })
            }
          } catch (error) {
            console.error('获取菜谱详情失败:', error)
          }
        }

        favoriteRecipes.value = recipes
      } else {
        favoriteRecipes.value = []
      }

      lastUpdateTime.value = new Date().toLocaleTimeString()
    } catch (error) {
      console.error('❌ 加载收藏数据失败:', error)
      favoriteRecipes.value = []
      showNotification('加载收藏数据失败', 'error')
    } finally {
      isLoading.value = false
    }
  }

  // 查看菜谱详情
  const viewRecipeDetail = (recipe: RecipeUI) => {
    try {
      // 将菜谱数据存储到sessionStorage供详情页使用
      sessionStorage.setItem('viewRecipe', JSON.stringify(recipe))

      // 跳转到详情页
      router.push('/recipe-detail')
    } catch (error) {
      console.error('❌ 跳转详情页失败:', error)
      showNotification('无法打开菜谱详情', 'error')
    }
  }

  // 移除收藏
  const removeFavorite = async (recipe: RecipeUI, index: number) => {
    const recipeName = recipe.name || recipe.title || '未命名菜谱'

    if (window.confirm(`确定要移除收藏的"${recipeName}"吗？`)) {
      try {
        const sessionId = localStorage.getItem('sessionId') || 'default-session'
        const recipeId = parseInt(recipe.id || '0')

        if (recipeId > 0) {
          // 从数据库中移除收藏
          await FavoriteModel.removeFavorite(sessionId, recipeId)

          // 从数组中移除
          favoriteRecipes.value.splice(index, 1)

          showNotification(`已移除"${recipeName}"`, 'success')
        } else {
          throw new Error('无效的菜谱ID')
        }
      } catch (error) {
        console.error('❌ 移除收藏失败:', error)
        showNotification('移除收藏失败', 'error')
      }
    } else {
    }
  }

  // 刷新收藏列表
  const refreshFavorites = () => {
    loadFavorites()
    showNotification('已刷新收藏列表', 'info')
  }

  // 清空所有收藏
  const clearAllFavorites = async () => {
    if (
      window.confirm(`确定要清空所有 ${favoriteRecipes.value.length} 个收藏吗？此操作不可恢复！`)
    ) {
      try {
        const sessionId = localStorage.getItem('sessionId') || 'default-session'

        // 从数据库中删除所有收藏
        for (const recipe of favoriteRecipes.value) {
          const recipeId = parseInt(recipe.id || '0')
          if (recipeId > 0) {
            await FavoriteModel.removeFavorite(sessionId, recipeId)
          }
        }

        // 清空数组
        favoriteRecipes.value = []

        showNotification('已清空所有收藏', 'success')
      } catch (error) {
        console.error('❌ 清空收藏失败:', error)
        showNotification('清空收藏失败', 'error')
      }
    }
  }

  // 跳转到搜索页面
  const goToSearch = () => {
    router.push('/search')
  }

  // 切换调试信息显示
  const toggleDebugInfo = () => {
    showDebugInfo.value = !showDebugInfo.value
  }

  // 导出调试数据
  const exportDebugData = () => {
    const debugData = {
      favoriteRecipes: favoriteRecipes.value,
      localStorage: localStorage.getItem('savedRecipes'),
      timestamp: new Date().toISOString(),
      count: favoriteRecipes.value.length,
    }

    const dataStr = JSON.stringify(debugData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `chefmind-favorites-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    showNotification('调试数据已导出', 'info')
  }

  // 文本截断
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // 生成菜谱SVG封面
  const generateRecipeSvg = (recipeName: string): string => {
    return generateRecipeCardSvg(recipeName, 'medium')
  }

  // 组件挂载
  onMounted(() => {
    loadFavorites()
  })
</script>

<style scoped>
  .favorites-page-complete {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--el-bg-color-page);
    min-height: 100vh;
    position: relative;

    [data-theme='dark'] & {
      background-color: var(--bg-color);
    }
  }

  /* 页面头部 */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .page-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .refresh-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  /* 加载状态 */
  .loading-container {
    text-align: center;
    padding: 80px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    [data-theme='dark'] & {
      background: var(--card-bg);
      border-color: var(--border-color);
      color: var(--text-color);
    }
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--el-border-color-lighter);
    border-top: 5px solid var(--el-color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* 空状态 */
  .empty-container {
    text-align: center;
    padding: 80px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    [data-theme='dark'] & {
      background: var(--card-bg);
      border-color: var(--border-color);
      color: var(--text-color);

      h2 {
        color: var(--text-color);
      }

      p {
        color: var(--text-color-secondary);
      }
    }
  }

  .empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
    opacity: 0.6;
  }

  .empty-container h2 {
    color: var(--el-text-color-primary);

    [data-theme='dark'] & {
      color: var(--text-color) !important;
    }
    margin-bottom: 16px;
    font-size: 28px;
    font-weight: 600;
  }

  .empty-container p {
    color: var(--el-text-color-regular);

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
    margin-bottom: 32px;
    font-size: 18px;
  }

  .explore-btn {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 18px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
    transition: all 0.3s ease;
  }

  .explore-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(72, 187, 120, 0.6);
  }

  /* 内容容器 */
  .content-container {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    [data-theme='dark'] & {
      background: var(--card-bg);
      border-color: var(--border-color);
    }
  }

  .recipes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 2px solid #f7fafc;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);

    [data-theme='dark'] & {
      background: var(--card-bg);
      border-bottom-color: var(--border-color);

      h2 {
        color: var(--text-color);
      }
    }

    h2 {
      margin: 0;
      color: var(--el-text-color-primary);

      [data-theme='dark'] & {
        color: var(--text-color) !important;
      }
      font-size: 24px;
      font-weight: 700;
    }
  }

  .clear-all-btn {
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
  }

  .clear-all-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.4);
  }

  /* 菜谱网格 */
  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
    padding: 24px;
  }

  .recipe-card {
    background: var(--el-bg-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid var(--el-border-color);

    [data-theme='dark'] & {
      background: var(--card-bg);
      border-color: var(--border-color);
    }
  }

  .recipe-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  /* 菜谱封面 */
  .recipe-cover {
    position: relative;
    height: 220px;
    overflow: hidden;
    cursor: pointer;
    border-radius: 16px 16px 0 0;
    /* 动态渐变背景 - 蓝紫色到粉红色 */
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
    background-size: 400% 400%;
    animation: gradientShift 6s ease infinite;
  }

  .recipe-svg-cover {
    position: absolute;
    top: -12px;
    left: -12px;
    width: calc(100% + 24px);
    height: calc(100% + 24px);
    padding: 0;
    margin: 0;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
      margin: 0;
      padding: 0;
      border: none;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .recipe-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .recipe-cover:hover .recipe-image {
    transform: scale(1.05);
  }

  .recipe-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    color: #a0aec0;

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
  }

  .recipe-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    bottom: auto;
    left: auto;
    background: transparent;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .recipe-cover:hover .recipe-overlay {
    opacity: 1;
  }

  .view-detail-btn {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.8rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .view-detail-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  /* 菜谱信息 */
  .recipe-info {
    padding: 20px;

    [data-theme='dark'] & {
      .recipe-title {
        color: var(--text-color);
      }

      .recipe-description {
        color: var(--text-color-secondary);
      }
    }
  }

  .recipe-title {
    margin: 0 0 12px 0;
    color: var(--el-text-color-primary);

    [data-theme='dark'] & {
      color: var(--text-color) !important;
    }
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recipe-description {
    color: var(--el-text-color-regular);

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 菜谱标签 */
  .recipe-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .time-tag {
    background: linear-gradient(135deg, #fbb6ce 0%, #f687b3 100%);
    color: #702459;

    [data-theme='dark'] & {
      color: #d6336c !important;
    }
  }

  .difficulty-tag {
    background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
    color: #7c2d12;

    [data-theme='dark'] & {
      color: #fd7e14 !important;
    }
  }

  .ingredient-tag {
    background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
    color: #1e3a8a;

    [data-theme='dark'] & {
      color: #3b82f6 !important;
    }
  }

  /* 操作按钮 */
  .recipe-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    border: none;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .view-btn {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
  }

  .view-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
  }

  .remove-btn {
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
  }

  .remove-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.4);
  }

  /* 调试面板 */
  .debug-panel {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: var(--el-bg-color);
    border: 2px solid var(--el-border-color);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    z-index: 1000;
  }

  .debug-panel h3 {
    margin: 0 0 12px 0;
    color: var(--el-text-color-primary);

    [data-theme='dark'] & {
      color: var(--text-color) !important;
    }
    font-size: 16px;
  }

  .debug-content p {
    margin: 8px 0;
    font-size: 14px;
    color: var(--el-text-color-regular);

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
  }

  .debug-content button {
    background: #667eea;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    margin: 4px 4px 0 0;
    cursor: pointer;
    font-size: 12px;
  }

  .debug-toggle-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #667eea;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    width: 50px;
    height: 50px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    z-index: 999;
    transition: all 0.3s ease;
  }

  .debug-toggle-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
  }

  /* 通知消息 */
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1001;
    animation: slideIn 0.3s ease;
  }

  .notification.success {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  }

  .notification.error {
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  }

  .notification.info {
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .favorites-page-complete {
      padding: 12px;
    }

    .page-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
      padding: 20px;
    }

    .page-title {
      font-size: 24px;
    }

    .recipes-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .recipes-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 16px;
    }

    .recipe-actions {
      flex-direction: column;
    }

    .debug-panel {
      right: 12px;
      bottom: 70px;
      max-width: 280px;
    }
  }

  @media (max-width: 480px) {
    .page-header {
      padding: 16px;
    }

    .header-actions {
      flex-direction: column;
      width: 100%;
    }

    .refresh-btn {
      width: 100%;
    }
  }
</style>
