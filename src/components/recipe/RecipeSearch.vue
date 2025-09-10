<template>
  <div class="recipe-search">
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索食谱、食材或烹饪方式..."
          @keyup.enter="performSearch"
          @focus="showSuggestions = true"
        />
        <button class="search-button" @click="performSearch">
          <span class="search-icon">🔍</span>
        </button>
      </div>

      <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</span>
          <span class="suggestion-text">{{ suggestion.text }}</span>
          <span class="suggestion-type">{{ getSuggestionType(suggestion.type) }}</span>
        </div>
      </div>
    </div>

    <div v-if="isSearching" class="search-loading">
      <div class="loading-spinner"></div>
      <p>搜索中...</p>
    </div>

    <!-- AI推荐的食谱 -->
    <div v-if="aiRecommendedRecipes.length > 0" class="ai-recommended-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🤖</span>
          AI推荐食谱
        </h2>
        <p class="section-subtitle">基于您的搜索关键词智能生成</p>
      </div>

      <div class="ai-recipe-container">
        <div v-for="recipe in aiRecommendedRecipes" :key="recipe.id" class="ai-recipe-card">
          <div class="recipe-svg-header">
            <!-- 使用SVG生成与菜谱名称匹配的封面 -->
            <div class="recipe-svg-cover" v-html="generateRecipeSvg(recipe.name)"></div>
          </div>
          <div class="recipe-header">
            <div class="recipe-title-section">
              <h3 class="recipe-title">{{ recipe.name }}</h3>
              <div class="ai-badge">
                <span class="badge-icon">✨</span>
                AI生成
              </div>
            </div>
            <div class="recipe-rating">
              <div class="stars">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="['star', { filled: i <= Math.floor(recipe.rating || 4.5) }]"
                  >★</span
                >
              </div>
              <span class="rating-text">({{ (recipe.rating || 4.5).toFixed(1) }})</span>
            </div>
          </div>

          <div class="recipe-description">
            {{ recipe.description }}
          </div>

          <div class="recipe-info-grid">
            <div class="info-item">
              <span class="info-icon">⏱️</span>
              <div class="info-content">
                <span class="info-label">烹饪时间</span>
                <span class="info-value">{{ formatCookingTime(recipe.cookingTime) }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">📊</span>
              <div class="info-content">
                <span class="info-label">难度</span>
                <span class="info-value">{{ formatDifficulty(recipe.difficulty) }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">👥</span>
              <div class="info-content">
                <span class="info-label">份量</span>
                <span class="info-value">{{ formatServings(recipe.servings) }}</span>
              </div>
            </div>
          </div>

          <div class="ingredients-section">
            <h4 class="ingredients-title">
              <span class="section-icon">🥕</span>
              主要食材
            </h4>
            <div class="ingredients-tags">
              <span
                v-for="(ingredient, index) in (recipe.ingredients || []).slice(0, 6)"
                :key="index"
                class="ingredient-tag"
              >
                {{ ingredient }}
              </span>
              <span v-if="(recipe.ingredients || []).length > 6" class="more-ingredients">
                +{{ (recipe.ingredients || []).length - 6 }}种
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="recipe-actions">
            <button class="action-btn primary large" @click="startCookingWithConfirm(recipe)">
              <span class="btn-icon">🍳</span>
              开始烹饪
            </button>
            <button class="action-btn secondary" @click="selectRecipe(recipe)">
              <span class="btn-icon">👁️</span>
              查看详情
            </button>
            <button class="action-btn secondary" @click="shareRecipeAsImage(recipe)">
              <span class="btn-icon">📤</span>
              分享图片
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="hasSearched" class="search-results">
      <div v-if="searchResults.length > 0" class="results-grid">
        <div
          v-for="recipe in searchResults"
          :key="recipe.id"
          class="result-card"
          @click="selectRecipe(recipe)"
        >
          <div class="result-svg-header">
            <!-- 使用SVG生成与菜谱名称匹配的封面 -->
            <div class="result-svg-cover" v-html="generateRecipeSvg(recipe.name)"></div>
          </div>
          <div class="result-content">
            <div class="result-header">
              <h3 class="result-title">{{ recipe.name }}</h3>
              <div class="result-rating">
                <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]"
                  >★</span
                >
              </div>
            </div>

          <p class="result-description">{{ truncateText(recipe.description, 100) }}</p>

          <div class="result-meta">
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              {{ formatCookingTime(recipe.cookingTime) }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📊</span>
              {{ formatDifficulty(recipe.difficulty) }}
            </span>
          </div>

          <div class="result-ingredients">
            <span class="ingredients-label">主要食材:</span>
            <span class="ingredients-list">{{ getMainIngredients(recipe) }}</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { useRecipeService, type Recipe } from '@/services/recipeService'
  import { aiService } from '@/services/aiService'
  import { formatCookingTime, formatServings, formatDifficulty } from '@/utils/formatUtils'
  import { generateRecipeCardSvg } from '@/utils/svgGenerator'

  const emit = defineEmits(['select-recipe', 'search'])

  // 状态
  const searchQuery = ref('')
  const showSuggestions = ref(false)
  const isSearching = ref(false)
  const hasSearched = ref(false)
  const searchResults = ref<Recipe[]>([])
  const allRecipes = ref<Recipe[]>([])
  const aiRecommendedRecipes = ref<Recipe[]>([])

  // 服务
  const recipeService = useRecipeService()
  const router = useRouter()

  // 计算属性
  const suggestions = computed(() => {
    if (!searchQuery.value || searchQuery.value.length < 2) return []

    const query = searchQuery.value.toLowerCase()
    const results = []

    // 搜索食谱名称
    const recipeNameMatches = allRecipes.value
      .filter(recipe => recipe.name.toLowerCase().includes(query))
      .slice(0, 3)
      .map(recipe => ({
        type: 'recipe',
        text: recipe.name,
        data: recipe,
      }))

    results.push(...recipeNameMatches)

    // 搜索食材
    const ingredientSet = new Set<string>()
    allRecipes.value.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const ingredientName =
          typeof ingredient === 'string'
            ? ingredient.split(' ')[0] // 去掉数量部分
            : ingredient.name
        if (ingredientName.toLowerCase().includes(query)) {
          ingredientSet.add(ingredientName)
        }
      })
    })

    const ingredientMatches = Array.from(ingredientSet)
      .slice(0, 3)
      .map(ingredient => ({
        type: 'ingredient',
        text: ingredient,
        data: ingredient,
      }))

    results.push(...ingredientMatches)

    // 搜索烹饪方式
    const cookingMethods = ['炒', '煮', '蒸', '炖', '烤', '炸', '煎', '焖', '烧', '拌']
    const methodMatches = cookingMethods
      .filter(method => method.includes(query))
      .slice(0, 2)
      .map(method => ({
        type: 'method',
        text: method,
        data: method,
      }))

    results.push(...methodMatches)

    return results.slice(0, 6) // 最多显示6个建议
  })

  // 方法
  // 生成菜谱SVG封面
  const generateRecipeSvg = (recipeName: string): string => {
    return generateRecipeCardSvg(recipeName, 'medium')
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

  // 分享图片方法
  const shareRecipeAsImage = async (recipe: Recipe) => {
    try {
      const html2canvas = (await import('html2canvas')).default

      // 创建一个临时的食谱卡片元素用于截图
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '400px'
      tempDiv.style.background = 'white'
      tempDiv.style.padding = '20px'
      tempDiv.style.borderRadius = '12px'
      tempDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'

      tempDiv.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px;">${recipe.name}</h2>
        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; line-height: 1.4;">${recipe.description}</p>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #999;">烹饪时间</div>
            <div style="font-weight: 600; color: #2c3e50;">${formatCookingTime(recipe.cookingTime)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #999;">难度</div>
            <div style="font-weight: 600; color: #2c3e50;">${recipe.difficulty}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #999;">份量</div>
            <div style="font-weight: 600; color: #2c3e50;">${formatServings(recipe.servings)}</div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #2c3e50;">主要食材</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${recipe.ingredients
              .slice(0, 6)
              .map(
                ing =>
                  `<span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${ing}</span>`
              )
              .join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
          <div style="font-size: 12px; color: #999;">ChefMind 智能食谱</div>
        </div>
      </div>
    `

      document.body.appendChild(tempDiv)

      // 生成图片
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      // 删除临时元素
      document.body.removeChild(tempDiv)

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `${recipe.name}-食谱.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      // console.log('图片分享成功:', recipe.name)
    } catch (error) {
      console.error('分享失败:', error)
      alert('图片生成失败，请稍后重试')
    }
  }

  // 生成AI推荐食谱（使用真正的AI服务）
  const generateAIRecommendations = async (query: string) => {
    try {
      // 使用真正的AI服务生成食谱
      const aiResult = await aiService.generateRecipe([query])

      // 转换AI返回的数据为我们需要的格式
      if (aiResult && aiResult.recipe) {
        const recipe = aiResult.recipe
        aiRecommendedRecipes.value = [
          {
            id: recipe.id?.toString() || `ai-recipe-${Date.now()}`,
            title: recipe.name || `AI推荐：${query}创意料理`,
            name: recipe.name || `AI推荐：${query}创意料理`,
            description: recipe.description || `基于"${query}"搜索词，AI为您量身定制的创意美食。`,
            cookingTime: recipe.cookingTime || '25分钟',
            difficulty: recipe.difficulty?.toString() || '简单',
            servings: recipe.servings || 2,
            rating: recipe.rating || 4.8,
            cookingMethods: ['炒制', '调味'], // 添加必需的烹饪方法
            ingredients: Array.isArray(recipe.ingredients)
              ? recipe.ingredients.map(ing =>
                  typeof ing === 'string' ? ing : ing.name || ing.toString()
                )
              : [`新鲜${query}`, '橄榄油', '蒜蓉', '黑胡椒', '香草', '柠檬汁'],
            steps: Array.isArray(recipe.steps)
              ? recipe.steps.map(step =>
                  typeof step === 'string' ? step : step.description || step.toString()
                )
              : ['准备食材', '预处理', '调味腌制', '烹饪制作', '装盘上桌'],
            image: '/images/recipes/gongbao-jiding.svg', // 添加图片路径
          } as Recipe,
        ]
      } else {
        throw new Error('AI服务返回空结果')
      }
    } catch (error) {
      console.error('AI推荐生成失败:', error)
      // 如果AI服务失败，使用备用模板
      const templates: Recipe[] = [
        {
          id: Date.now().toString(),
          title: `AI推荐：${query}创意料理`,
          name: `AI推荐：${query}创意料理`,
          description: `基于"${query}"搜索词，AI为您量身定制的创意美食，融合经典与创新。`,
          cookingTime: '25分钟',
          difficulty: '简单',
          servings: 2,
          rating: 4.8,
          cookingMethods: ['炒制', '调味'], // 添加必需的烹饪方法
          ingredients: [`新鲜${query}`, '橄榄油', '蒜蓉', '黑胡椒', '香草', '柠檬汁'],
          steps: ['准备食材', '预处理', '调味腌制', '烹饪制作', '装盘上桌'],
          image: '/images/recipes/fanqie-jidan-mian.svg', // 添加图片路径
        },
      ]

      aiRecommendedRecipes.value = templates
    }
  }

  const performSearch = async () => {
    if (!searchQuery.value.trim()) return

    isSearching.value = true
    hasSearched.value = true
    showSuggestions.value = false

    // 触发搜索事件，用于记录搜索历史
    emit('search', searchQuery.value.trim())

    try {
      // 获取所有食谱
      const recipes = await recipeService.getAllRecipes()

      // 根据查询过滤
      let results = recipes.filter(recipe => {
        // 搜索词匹配
        const query = searchQuery.value.toLowerCase()
        const nameMatch = recipe.name.toLowerCase().includes(query)
        const descriptionMatch = recipe.description.toLowerCase().includes(query)
        const ingredientMatch = recipe.ingredients.some(i => {
          const ingredientName = typeof i === 'string' ? i : i.name
          return ingredientName.toLowerCase().includes(query)
        })

        return nameMatch || descriptionMatch || ingredientMatch
      })

      // 排序：优先显示名称匹配的结果
      results.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ? 1 : 0
        const bNameMatch = b.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ? 1 : 0
        return bNameMatch - aNameMatch || b.rating - a.rating
      })

      searchResults.value = results

      // 生成AI推荐食谱（使用真正的AI服务）
      await generateAIRecommendations(searchQuery.value)
    } catch (error) {
      console.error('搜索失败:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const selectSuggestion = (suggestion: any) => {
    if (suggestion.type === 'recipe') {
      emit('select-recipe', suggestion.data)
    } else {
      // 将搜索建议内容设置到搜索框
      searchQuery.value = suggestion.text
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // 执行搜索
      performSearch()
    }
    showSuggestions.value = false
  }

  const selectRecipe = (recipe: Recipe) => {
    emit('select-recipe', recipe)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recipe':
        return '📖'
      case 'ingredient':
        return '🥕'
      case 'method':
        return '🍳'
      default:
        return '🔍'
    }
  }

  const getSuggestionType = (type: string) => {
    switch (type) {
      case 'recipe':
        return '食谱'
      case 'ingredient':
        return '食材'
      case 'method':
        return '烹饪方式'
      default:
        return ''
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getMainIngredients = (recipe: Recipe) => {
    // 获取前3个主要食材
    return recipe.ingredients
      .slice(0, 3)
      .map(ing => {
        return typeof ing === 'string'
          ? ing.split(' ')[0] // 去掉数量部分
          : ing.name
      })
      .join('、')
  }

  // 点击外部关闭建议
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.recipe-search')) {
      showSuggestions.value = false
    }
  }

  const performSearchHandler = (_event: Event) => {
    performSearch()
  }

  // 外部调用方法：设置搜索查询并执行搜索
  const setSearchQueryAndSearch = (query: string) => {
    searchQuery.value = query
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // 执行搜索
    performSearch()
  }

  // 暴露方法给父组件
  defineExpose({
    setSearchQueryAndSearch,
  })

  // 生命周期钩子
  onMounted(async () => {
    document.addEventListener('click', handleClickOutside)

    try {
      // 预加载所有食谱数据
      allRecipes.value = await recipeService.getAllRecipes()
    } catch (error) {
      console.error('加载食谱数据失败:', error)
    }

    // 监听自定义搜索事件
    window.addEventListener('perform-search', performSearchHandler)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('perform-search', performSearchHandler)
  })

  // 监听搜索词变化
  watch(searchQuery, () => {
    if (!searchQuery.value) {
      showSuggestions.value = false
    }
  })
</script>

<style lang="scss" scoped>
  .recipe-search {
    position: relative;
    margin-bottom: 2rem;
  }

  .search-container {
    position: relative;
    margin-bottom: 1rem;
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background-color: var(--bg-color-light);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
  }

  .search-input {
    flex: 1;
    padding: 0.8rem 1rem;
    border: none;
    background: none;
    font-size: 1rem;
    color: var(--text-color);

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--text-color-lighter);
    }
  }

  .search-button {
    background-color: var(--primary-color);
    border: none;
    color: white;
    padding: 0.8rem 1.2rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--primary-color-dark);
    }
  }

  .search-icon {
    font-size: 1.2rem;
  }

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--bg-color-light);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .suggestion-icon {
    margin-right: 0.8rem;
    font-size: 1.2rem;
  }

  .suggestion-text {
    flex: 1;
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .suggestion-type {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    background-color: var(--bg-color-secondary);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .search-filters {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filter-group {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .filter-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-option {
    background-color: var(--bg-color-light);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    &.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }

  .clear-filters {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem 0;
    margin-top: 1rem;

    &:hover {
      text-decoration: underline;
    }
  }

  .search-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .toggle-filters {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      color: var(--primary-color);
    }
  }

  .toggle-icon {
    font-size: 0.7rem;
  }

  .search-results-info {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .search-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .search-results {
    min-height: 200px;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .result-card {
    background-color: var(--bg-color-light);
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
  }

  .result-svg-header {
    position: relative;
    height: 150px;
    overflow: hidden; /* 关键：裁剪出圆角效果 */
    margin: 0;
    /* 动态渐变背景 - 蓝紫色到粉红色 */
    background: linear-gradient(135deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    background-size: 400% 400%;
    animation: gradientShift 6s ease infinite;
    border-radius: 12px 12px 0 0; /* 容器的圆角 */

    .result-svg-cover {
      position: absolute;
      top: -12px;
      left: -12px;
      width: calc(100% + 24px);
      height: calc(100% + 24px);
      display: block;
      padding: 0;
      margin: 0;
      
      :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
        margin: 0;
        padding: 0;
        border: none;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
    }

    &:hover :deep(svg) {
      transform: scale(1.05);
    }
  }

  .result-content {
    padding: 1.5rem;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .result-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0;
    flex: 1;
    margin-right: 1rem;
  }

  .result-rating {
    display: flex;
    gap: 0.2rem;
  }

  .star {
    color: var(--border-color);
    font-size: 0.9rem;
  }

  .star.filled {
    color: var(--warning-color);
  }

  .result-description {
    font-size: 0.9rem;
    color: var(--text-color);
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .result-meta {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }

  .meta-icon {
    font-size: 1rem;
  }

  .result-ingredients {
    font-size: 0.8rem;
  }

  .ingredients-label {
    color: var(--text-color-secondary);
    margin-right: 0.5rem;
  }

  .ingredients-list {
    color: var(--text-color);
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    text-align: center;
  }

  .no-results-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .no-results h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.5rem 0;
  }

  .no-results p {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin: 0;
  }

  /* AI推荐食谱样式 */
  .ai-recommended-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 1px solid #dee2e6;
  }

  .section-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .title-icon {
    font-size: 1.8rem;
  }

  .section-subtitle {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
  }

  .ai-recipe-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .ai-recipe-card {
    background: white;
    border-radius: 12px;
    padding: 0; /* 移除内边距，让SVG可以完全填充 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    overflow: hidden; /* 确保圆角效果 */
  }

  .ai-recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .recipe-svg-header {
    position: relative;
    height: 150px;
    overflow: hidden; /* 关键：裁剪出圆角效果 */
    margin: 0;
    /* 动态渐变背景 - 蓝紫色到粉红色 */
    background: linear-gradient(135deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    background-size: 400% 400%;
    animation: gradientShift 6s ease infinite;
    border-radius: 12px 12px 0 0; /* 容器的圆角 */

    .recipe-svg-cover {
      position: absolute;
      top: -12px;
      left: -12px;
      width: calc(100% + 24px);
      height: calc(100% + 24px);
      display: block;
      padding: 0;
      margin: 0;
      
      :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
        margin: 0;
        padding: 0;
        border: none;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
    }

    &:hover :deep(svg) {
      transform: scale(1.05);
    }
  }

  .recipe-header {
    margin-bottom: 1rem;
    padding: 1.5rem 1.5rem 0 1.5rem; /* 为内容添加内边距 */
  }

  .recipe-title-section {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .recipe-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    flex: 1;
    margin-right: 1rem;
  }

  .ai-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .badge-icon {
    font-size: 0.8rem;
  }

  .recipe-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stars {
    display: flex;
    gap: 1px;
  }

  .rating-text {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
  }

  .recipe-description {
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
    padding: 0 1.5rem; /* 为描述添加左右内边距 */
  }

  .recipe-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 0 1.5rem 1rem 1.5rem; /* 调整外边距以配合内边距 */
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .info-icon {
    font-size: 1.1rem;
  }

  .info-content {
    display: flex;
    flex-direction: column;
  }

  .info-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.1rem;
  }

  .info-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .ingredients-section {
    margin-bottom: 1.5rem;
    padding: 0 1.5rem; /* 为食材部分添加左右内边距 */
  }

  .ingredients-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .section-icon {
    font-size: 1.1rem;
  }

  .ingredients-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ingredient-tag {
    background: #e3f2fd;
    color: #1565c0;
    padding: 0.25rem 0.5rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #bbdefb;
  }

  .more-ingredients {
    background: #f5f5f5;
    color: #666;
    padding: 0.25rem 0.5rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #ddd;
  }

  .recipe-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0 1.5rem 1.5rem 1.5rem; /* 为操作按钮添加内边距 */
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    white-space: nowrap;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .action-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .action-btn.secondary {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #dee2e6;
  }

  .action-btn.secondary:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }

  .action-btn.large {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }

  .btn-icon {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr;
    }

    .filter-options {
      flex-direction: column;
      align-items: flex-start;
    }

    .filter-option {
      width: 100%;
    }

    .search-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    /* AI推荐响应式样式 */
    .ai-recipe-container {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .recipe-info-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .recipe-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .action-btn {
      justify-content: center;
    }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
