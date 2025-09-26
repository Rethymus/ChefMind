<template>
  <div class="search-view">
    <div class="container">
      <h1 class="page-title">智能食谱搜索</h1>
      <p class="page-subtitle">输入食材或菜名，发现美味食谱</p>

      <RecipeSearch ref="recipeSearchRef" @select-recipe="selectRecipe" @search="handleSearch" />

      <!-- 热门菜谱推荐 -->
      <div v-if="!selectedRecipe && popularRecipes.length > 0" class="popular-recipes-section">
        <div class="section-header">
          <h2 class="section-title">热门菜谱推荐</h2>
          <p class="section-subtitle">为您精选的热门菜谱</p>
        </div>

        <div class="recipes-grid">
          <div v-for="recipe in popularRecipes" :key="recipe.id" class="recipe-card">
            <div class="recipe-image-container">
              <!-- 使用SVG生成与菜谱名称匹配的封面 -->
              <div class="recipe-svg-cover" v-html="generateRecipeSvg(recipe.title)"></div>
              <div class="recipe-overlay">
                <span class="recipe-difficulty">{{ formatDifficulty(recipe.difficulty) }}</span>
                <span class="recipe-time">{{ formatCookingTime(recipe.cookingTime) }}</span>
              </div>
            </div>

            <div class="recipe-content">
              <h3 class="recipe-title">{{ recipe.title }}</h3>
              <p class="recipe-description">{{ recipe.description }}</p>

              <div class="recipe-meta">
                <div class="recipe-rating">
                  <div class="stars">
                    <span
                      v-for="i in 5"
                      :key="i"
                      :class="['star', { filled: i <= Math.floor(recipe.rating) }]"
                      >★</span
                    >
                  </div>
                  <span class="rating-text">({{ recipe.rating.toFixed(1) }})</span>
                </div>
                <div class="recipe-tags">
                  <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="recipe-tag">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="recipe-actions">
                <button class="action-btn primary" @click.stop="startCookingWithConfirm(recipe)">
                  <span class="btn-icon">🍳</span>
                  开始烹饪
                </button>
                <button class="action-btn secondary" @click="selectRecipe(recipe)">
                  <span class="btn-icon">👁️</span>
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipeSearchHistory
        v-if="!selectedRecipe"
        ref="searchHistoryRef"
        @select="handleHistorySelect"
      />

      <div v-if="selectedRecipe" class="recipe-detail-container">
        <div class="section-header">
          <h2 class="section-title">食谱详情</h2>
          <button class="back-button" @click="selectedRecipe = null">
            <span class="button-icon">←</span>
            返回搜索结果
          </button>
        </div>

        <RecipeDetail
          :recipe="selectedRecipe"
          :related-recipes="relatedRecipes"
          @select-recipe="selectRecipe"
          @notification="showNotification"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import RecipeSearch from '@/components/recipe/RecipeSearch.vue'
  import RecipeDetail from '@/components/recipe/RecipeDetail.vue'
  import RecipeSearchHistory from '@/components/recipe/RecipeSearchHistory.vue'
  import { useRecipeService } from '@/services/recipeService'
  import type { Recipe } from '@/types/recipe'
  import { popularRecipes } from '@/data/mockData'
  import { formatCookingTime, formatDifficulty } from '@/utils/formatUtils'
  import { generateRecipeCardSvg } from '@/utils/svgGenerator'

  const recipeService = useRecipeService()
  const router = useRouter()
  const selectedRecipe = ref<Recipe | null>(null)
  const relatedRecipes = ref<Recipe[]>([])
  const searchHistoryRef = ref<InstanceType<typeof RecipeSearchHistory> | null>(null)
  const recipeSearchRef = ref<InstanceType<typeof RecipeSearch> | null>(null)

  // 生成菜谱SVG封面
  const generateRecipeSvg = (recipeName: string): string => {
    return generateRecipeCardSvg(recipeName, 'medium')
  } // 处理搜索
  const handleSearch = (query: string) => {
    // 添加到搜索历史
    if (searchHistoryRef.value) {
      searchHistoryRef.value.addSearchHistory(query)
    }
  }

  // 处理历史记录选择
  const handleHistorySelect = (query: string) => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // 设置搜索查询并触发搜索
    if (recipeSearchRef.value) {
      // 调用RecipeSearch组件的方法来设置查询和执行搜索
      recipeSearchRef.value.setSearchQueryAndSearch(query)
    }
  }

  // 生命周期钩子
  onMounted(() => {
    // 从会话存储中读取搜索查询
    const savedQuery = sessionStorage.getItem('searchQuery')
    if (savedQuery) {
      // 这里我们需要访问RecipeSearch组件的方法
      // 由于组件封装，我们需要通过ref或事件来实现
      // 这里我们可以通过自定义事件来触发搜索
      setTimeout(() => {
        const searchEvent = new CustomEvent('perform-search', {
          detail: { query: savedQuery },
        })
        window.dispatchEvent(searchEvent)

        // 添加到搜索历史
        if (searchHistoryRef.value) {
          searchHistoryRef.value.addSearchHistory(savedQuery)
        }

        // 清除会话存储中的查询，避免重复搜索
        sessionStorage.removeItem('searchQuery')
      }, 500)
    }
  })

  // 选择食谱
  const selectRecipe = async (recipe: Recipe) => {
    selectedRecipe.value = recipe

    // 保存到浏览历史
    try {
      const viewHistory = JSON.parse(localStorage.getItem('recipe-view-history') || '[]')
      if (!viewHistory.includes(recipe.id)) {
        viewHistory.push(recipe.id)
        // 限制历史记录数量
        if (viewHistory.length > 20) {
          viewHistory.shift()
        }
        localStorage.setItem('recipe-view-history', JSON.stringify(viewHistory))
      }
    } catch (error) {
      console.error('保存浏览历史失败:', error)
    }

    // 加载相关食谱
    try {
      const allRecipes = await recipeService.getAllRecipes()

      // 排除当前食谱，选择2-3个相关食谱
      relatedRecipes.value = allRecipes.filter(r => r.id !== recipe.id).slice(0, 3)
    } catch (error) {
      console.error('加载相关食谱失败:', error)
      relatedRecipes.value = []
    }
  }

  // 显示通知
  const showNotification = (notification: { type: string; title: string; message?: string }) => {
    // 创建自定义事件
    const event = new CustomEvent('notification', {
      detail: notification,
    })

    // 触发事件
    window.dispatchEvent(event)
  }

  // 开始烹饪确认方法
  const startCookingWithConfirm = (recipe: Recipe) => {
    ElMessageBox.confirm('是否开始烹饪这道菜？系统将启动计时器和步骤指导。', '开始烹饪', {
      confirmButtonText: '开始',
      cancelButtonText: '取消',
      type: 'info',
    })
      .then(() => {
        // 跳转到烹饪指导页面，传递食谱数据
        // 将食谱数据存储在本地存储中，以便在烹饪指导页面获取
        localStorage.setItem('currentCookingRecipe', JSON.stringify(recipe))

        // 跳转到烹饪指导页面
        router.push({
          name: 'CookingGuide',
        })
      })
      .catch(() => {
        // 用户取消
      })
  }
</script>

<style lang="scss" scoped>
  .search-view {
    min-height: 100vh;
    padding: 2rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--heading-color);
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-color-secondary);
    margin-bottom: 2rem;
  }

  .popular-recipes-section {
    margin: 3rem 0;
  }

  .section-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--heading-color);
    margin: 0 0 0.5rem 0;
  }

  .section-subtitle {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin: 0;
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .recipe-card {
    background: var(--bg-color-secondary);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    padding: 0; /* 确保没有内边距 */

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
  }

  .recipe-image-container {
    width: 100%;
    height: 150px;
    border-radius: 16px 16px 0 0;
    overflow: hidden; /* 关键：裁剪出圆角效果 */
    position: relative; /* 关键：为绝对定位的SVG提供相对定位容器 */
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

  .recipe-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;

    span {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }
  }

  .recipe-content {
    padding: 1.2rem;
  }

  .recipe-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 0.5rem;
  }

  .recipe-description {
    color: var(--text-color-secondary);
    margin-bottom: 1rem;
    line-height: 1.5;
    font-size: 0.9rem;
  }

  .recipe-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .recipe-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    .stars {
      display: flex;
      gap: 1px;
    }

    .star {
      color: #e0e0e0;
      font-size: 0.9rem;
      transition: color 0.2s ease;

      &.filled {
        color: #ffd700;
      }
    }

    .rating-text {
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.85rem;
      margin-left: 0.25rem;
    }

    .rating-value {
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .recipe-tags {
    display: flex;
    gap: 0.5rem;
  }

  .recipe-tag {
    background: var(--primary-color-light);
    color: var(--primary-color);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .recipe-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    justify-content: center;

    &.primary {
      background: var(--primary-color);
      color: white;

      &:hover {
        background: var(--primary-color-dark);
        transform: translateY(-1px);
      }
    }

    &.secondary {
      background: var(--bg-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);

      &:hover {
        background: var(--hover-color);
        border-color: var(--primary-color);
      }
    }

    .btn-icon {
      font-size: 1rem;
    }
  }

  .recipe-detail-container {
    margin-top: 2rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .button-icon {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .page-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .recipes-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .recipe-content {
      padding: 1rem;
    }

    .recipe-title {
      font-size: 1.1rem;
    }
  }
</style>
