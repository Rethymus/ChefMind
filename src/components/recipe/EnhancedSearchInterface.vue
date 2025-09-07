<template>
  <div class="enhanced-search-interface">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-bar-container">
        <div class="main-search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索菜谱、食材或烹饪方法..."
              class="search-input"
              @input="handleSearchInput"
              @keydown.enter="performSearch"
              @focus="showSearchSuggestions = true"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">✕</button>
          </div>

          <!-- 智能建议 -->
          <div
            v-if="showSearchSuggestions && searchSuggestions.length > 0"
            class="search-suggestions"
          >
            <div class="suggestions-header">
              <span class="suggestions-title">智能建议</span>
              <button class="close-suggestions" @click="showSearchSuggestions = false">✕</button>
            </div>
            <div class="suggestions-list">
              <button
                v-for="suggestion in searchSuggestions"
                :key="suggestion.text"
                class="suggestion-item"
                @click="applySuggestion(suggestion)"
              >
                <span class="suggestion-icon">{{ suggestion.icon }}</span>
                <div class="suggestion-content">
                  <span class="suggestion-text">{{ suggestion.text }}</span>
                  <span class="suggestion-type">{{ suggestion.type }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- 快捷搜索标签 -->
        <div class="quick-search-tags">
          <button
            v-for="tag in quickSearchTags"
            :key="tag.text"
            :class="['quick-tag', { active: selectedQuickTags.includes(tag.text) }]"
            @click="toggleQuickTag(tag)"
          >
            <span class="tag-icon">{{ tag.icon }}</span>
            <span class="tag-text">{{ tag.text }}</span>
          </button>
        </div>
      </div>

      <!-- 高级筛选 -->
      <div class="advanced-filters" :class="{ expanded: showAdvancedFilters }">
        <button class="filters-toggle" @click="showAdvancedFilters = !showAdvancedFilters">
          <span class="filters-icon">⚙️</span>
          <span class="filters-text">
            {{ showAdvancedFilters ? '收起筛选' : '高级筛选' }}
          </span>
          <span class="filters-count" v-if="activeFiltersCount > 0">
            {{ activeFiltersCount }}
          </span>
        </button>

        <div v-if="showAdvancedFilters" class="filters-panel">
          <!-- 烹饪时间 -->
          <div class="filter-group">
            <div class="filter-label">烹饪时间</div>
            <div class="time-filter-options">
              <button
                v-for="option in cookingTimeOptions"
                :key="option.value"
                :class="['time-option', { active: filters.cookingTime === option.value }]"
                @click="updateFilter('cookingTime', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- 难度等级 -->
          <div class="filter-group">
            <div class="filter-label">难度等级</div>
            <div class="difficulty-filter-options">
              <button
                v-for="option in difficultyOptions"
                :key="option.value"
                :class="['difficulty-option', { active: filters.difficulty === option.value }]"
                @click="updateFilter('difficulty', option.value)"
              >
                <span class="difficulty-icon">{{ option.icon }}</span>
                <span class="difficulty-text">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- 营养偏好 -->
          <div class="filter-group">
            <div class="filter-label">营养偏好</div>
            <div class="nutrition-filter-options">
              <button
                v-for="option in nutritionOptions"
                :key="option.value"
                :class="['nutrition-option', { active: filters.nutrition?.includes(option.value) }]"
                @click="toggleNutritionFilter(option.value)"
              >
                <span class="nutrition-icon">{{ option.icon }}</span>
                <span class="nutrition-text">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- 食材类型 -->
          <div class="filter-group">
            <div class="filter-label">主要食材</div>
            <div class="ingredient-filter-options">
              <button
                v-for="option in ingredientTypeOptions"
                :key="option.value"
                :class="[
                  'ingredient-option',
                  { active: filters.ingredientType?.includes(option.value) },
                ]"
                @click="toggleIngredientFilter(option.value)"
              >
                <span class="ingredient-icon">{{ option.icon }}</span>
                <span class="ingredient-text">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- 重置按钮 -->
          <div class="filter-actions">
            <button class="reset-filters-btn" @click="resetFilters">重置筛选</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div class="search-stats" v-if="searchQuery || activeFiltersCount > 0">
      <div class="stats-info">
        <span class="results-count">
          找到 <strong>{{ searchResults.length }}</strong> 个结果
        </span>
        <span v-if="searchQuery" class="search-query">
          关于 "<strong>{{ searchQuery }}</strong
          >"
        </span>
      </div>

      <div class="search-actions">
        <button class="sort-btn" @click="showSortOptions = !showSortOptions">
          <span class="sort-icon">⇅</span>
          <span class="sort-text">排序</span>
        </button>

        <!-- 排序选项 -->
        <div v-if="showSortOptions" class="sort-options">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            :class="['sort-option', { active: currentSort === option.value }]"
            @click="applySorting(option.value)"
          >
            <span class="sort-option-icon">{{ option.icon }}</span>
            <span class="sort-option-text">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 个性化推荐区域 -->
    <PersonalizedRecommendations
      v-if="showPersonalizedRecommendations"
      :all-recipes="allRecipes"
      :current-query="searchQuery"
      :filters="filters"
      @select-recipe="handleRecipeSelect"
      @start-cooking="handleStartCooking"
      @save-recipe="handleSaveRecipe"
    />

    <!-- 搜索结果 -->
    <div class="search-results-section">
      <div v-if="isSearching" class="searching-state">
        <div class="searching-spinner"></div>
        <p>正在搜索...</p>
      </div>

      <div v-else-if="searchResults.length > 0" class="search-results">
        <div class="results-grid">
          <div
            v-for="recipe in paginatedResults"
            :key="recipe.id"
            class="recipe-result-card"
            @click="handleRecipeSelect(recipe)"
          >
            <div class="card-image">
              <img
                :src="getRecipeImage(recipe)"
                :alt="recipe.title || recipe.name"
                @error="handleImageError"
              />
              <div class="recipe-tags">
                <span v-if="recipe.difficulty" class="difficulty-tag">
                  {{ getDifficultyText(recipe.difficulty) }}
                </span>
                <span v-if="recipe.cookingTime" class="time-tag">
                  {{ recipe.cookingTime }}
                </span>
              </div>
            </div>

            <div class="card-content">
              <h3 class="recipe-title">{{ recipe.title || recipe.name }}</h3>
              <p class="recipe-description">{{ recipe.description }}</p>

              <div class="recipe-highlights">
                <div class="ingredient-preview">
                  <span class="highlight-icon">🥘</span>
                  <span class="highlight-text">
                    {{ getMainIngredients(recipe).join('、') }}
                  </span>
                </div>

                <div class="rating-preview" v-if="recipe.rating">
                  <span class="rating-icon">⭐</span>
                  <span class="rating-text">{{ recipe.rating }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="action-btn primary" @click.stop="handleStartCooking(recipe)">
                  开始制作
                </button>
                <button class="action-btn secondary" @click.stop="handleSaveRecipe(recipe)">
                  收藏
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>

          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-number', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>

      <div v-else-if="searchQuery || activeFiltersCount > 0" class="no-results">
        <div class="no-results-icon">😔</div>
        <h3>未找到相关菜谱</h3>
        <p>尝试调整搜索条件或筛选选项</p>
        <button class="reset-search-btn" @click="resetSearch">重置搜索</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'
  import { getDishImage } from '@/utils/ingredientImages'
  import PersonalizedRecommendations from './PersonalizedRecommendations.vue'
  import type { Recipe } from '@/types/recipe'

  // Props
  interface Props {
    allRecipes?: Recipe[]
    initialQuery?: string
    showRecommendations?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    allRecipes: () => [],
    initialQuery: '',
    showRecommendations: true,
  })

  // Emits
  const emit = defineEmits<{
    search: [query: string, filters: any]
    selectRecipe: [recipe: Recipe]
    startCooking: [recipe: Recipe]
    saveRecipe: [recipe: Recipe]
  }>()

  // 组合式函数
  const { trackEvent } = useUserBehaviorAnalytics()

  // 响应式状态
  const searchQuery = ref(props.initialQuery)
  const showSearchSuggestions = ref(false)
  const showAdvancedFilters = ref(false)
  const showSortOptions = ref(false)
  const isSearching = ref(false)
  const selectedQuickTags = ref<string[]>([])
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const currentSort = ref('relevance')

  // 筛选条件
  const filters = ref({
    cookingTime: '',
    difficulty: '',
    nutrition: [] as string[],
    ingredientType: [] as string[],
  })

  // 搜索建议
  const searchSuggestions = ref<
    Array<{
      text: string
      type: string
      icon: string
    }>
  >([])

  // 配置选项
  const quickSearchTags = [
    { text: '家常菜', icon: '🏠' },
    { text: '快手菜', icon: '⚡' },
    { text: '素食', icon: '🥬' },
    { text: '汤品', icon: '🍲' },
    { text: '甜品', icon: '🍰' },
    { text: '下饭菜', icon: '🍚' },
  ]

  const cookingTimeOptions = [
    { value: '', label: '不限' },
    { value: 'quick', label: '30分钟内' },
    { value: 'medium', label: '1小时内' },
    { value: 'long', label: '1小时以上' },
  ]

  const difficultyOptions = [
    { value: '', label: '不限', icon: '🎯' },
    { value: 'easy', label: '简单', icon: '🟢' },
    { value: 'medium', label: '中等', icon: '🟡' },
    { value: 'hard', label: '困难', icon: '🔴' },
  ]

  const nutritionOptions = [
    { value: 'low-fat', label: '低脂', icon: '💪' },
    { value: 'high-protein', label: '高蛋白', icon: '🥩' },
    { value: 'low-carb', label: '低碳水', icon: '🥗' },
    { value: 'vegetarian', label: '素食', icon: '🌱' },
    { value: 'healthy', label: '健康', icon: '❤️' },
  ]

  const ingredientTypeOptions = [
    { value: 'meat', label: '肉类', icon: '🥩' },
    { value: 'seafood', label: '海鲜', icon: '🐟' },
    { value: 'vegetable', label: '蔬菜', icon: '🥬' },
    { value: 'grain', label: '谷物', icon: '🌾' },
    { value: 'dairy', label: '奶制品', icon: '🥛' },
    { value: 'egg', label: '蛋类', icon: '🥚' },
  ]

  const sortOptions = [
    { value: 'relevance', label: '相关度', icon: '🎯' },
    { value: 'rating', label: '评分', icon: '⭐' },
    { value: 'time', label: '制作时间', icon: '⏱️' },
    { value: 'difficulty', label: '难度', icon: '📊' },
    { value: 'popularity', label: '热门度', icon: '🔥' },
  ]

  // 计算属性
  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.cookingTime) count++
    if (filters.value.difficulty) count++
    count += filters.value.nutrition.length
    count += filters.value.ingredientType.length
    return count
  })

  const showPersonalizedRecommendations = computed(() => {
    return props.showRecommendations && !searchQuery.value && activeFiltersCount.value === 0
  })

  const searchResults = computed(() => {
    let results = [...props.allRecipes]

    // 文本搜索
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      results = results.filter(recipe => {
        const title = (recipe.title || recipe.name || '').toLowerCase()
        const description = recipe.description?.toLowerCase() || ''
        const ingredients = recipe.ingredients
          .map(ing => (typeof ing === 'string' ? ing.toLowerCase() : ing.name.toLowerCase()))
          .join(' ')

        return title.includes(query) || description.includes(query) || ingredients.includes(query)
      })
    }

    // 快捷标签筛选
    if (selectedQuickTags.value.length > 0) {
      results = results.filter(recipe => {
        return selectedQuickTags.value.some(tag => {
          const recipeInfo = `${recipe.title || recipe.name} ${recipe.description || ''}`
          return recipeInfo.includes(tag)
        })
      })
    }

    // 高级筛选
    if (filters.value.cookingTime) {
      results = results.filter(recipe => {
        const time = parseInt(recipe.cookingTime) || 0
        switch (filters.value.cookingTime) {
          case 'quick':
            return time <= 30
          case 'medium':
            return time > 30 && time <= 60
          case 'long':
            return time > 60
          default:
            return true
        }
      })
    }

    if (filters.value.difficulty) {
      results = results.filter(
        recipe => String(recipe.difficulty)?.toLowerCase() === filters.value.difficulty
      )
    }

    if (filters.value.nutrition.length > 0) {
      results = results.filter(recipe => {
        const recipeInfo = `${recipe.title || recipe.name} ${recipe.description || ''}`
        return filters.value.nutrition.some(nutrition => {
          switch (nutrition) {
            case 'vegetarian':
              return recipeInfo.includes('素') || recipeInfo.includes('蔬菜')
            case 'healthy':
              return recipeInfo.includes('健康') || recipeInfo.includes('营养')
            case 'low-fat':
              return recipeInfo.includes('低脂') || recipeInfo.includes('清淡')
            case 'high-protein':
              return recipeInfo.includes('蛋白') || recipeInfo.includes('肉')
            case 'low-carb':
              return (
                recipeInfo.includes('低碳') ||
                (!recipeInfo.includes('米') && !recipeInfo.includes('面'))
              )
            default:
              return false
          }
        })
      })
    }

    if (filters.value.ingredientType.length > 0) {
      results = results.filter(recipe => {
        const ingredients = recipe.ingredients
          .map(ing => (typeof ing === 'string' ? ing : ing.name))
          .join(' ')

        return filters.value.ingredientType.some(type => {
          switch (type) {
            case 'meat':
              return (
                ingredients.includes('肉') ||
                ingredients.includes('牛') ||
                ingredients.includes('猪')
              )
            case 'seafood':
              return (
                ingredients.includes('鱼') ||
                ingredients.includes('虾') ||
                ingredients.includes('蟹')
              )
            case 'vegetable':
              return (
                ingredients.includes('菜') ||
                ingredients.includes('豆') ||
                ingredients.includes('瓜')
              )
            case 'grain':
              return (
                ingredients.includes('米') ||
                ingredients.includes('面') ||
                ingredients.includes('粉')
              )
            case 'dairy':
              return (
                ingredients.includes('奶') ||
                ingredients.includes('酸奶') ||
                ingredients.includes('奶酪')
              )
            case 'egg':
              return ingredients.includes('蛋') || ingredients.includes('鸡蛋')
            default:
              return false
          }
        })
      })
    }

    // 排序
    switch (currentSort.value) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'time':
        results.sort((a, b) => (parseInt(a.cookingTime) || 0) - (parseInt(b.cookingTime) || 0))
        break
      case 'difficulty':
        results.sort((a, b) => {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          return (
            (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
          )
        })
        break
      case 'popularity':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0)) // 临时用评分代替热门度
        break
      default: // relevance
        break
    }

    return results
  })

  const totalPages = computed(() => {
    return Math.ceil(searchResults.value.length / itemsPerPage.value)
  })

  const paginatedResults = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return searchResults.value.slice(start, start + itemsPerPage.value)
  })

  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const pages: number[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
      return pages
    }

    // 复杂分页逻辑
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // 省略号
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    }

    return pages
  })

  // 方法
  const handleSearchInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    searchQuery.value = input.value

    if (input.value.length >= 2) {
      generateSearchSuggestions(input.value)
      showSearchSuggestions.value = true
    } else {
      showSearchSuggestions.value = false
    }
  }

  const generateSearchSuggestions = (query: string) => {
    const suggestions = []
    const queryLower = query.toLowerCase()

    // 基于现有菜谱生成建议
    const matchingRecipes = props.allRecipes
      .filter(recipe => (recipe.title || recipe.name || '').toLowerCase().includes(queryLower))
      .slice(0, 3)

    matchingRecipes.forEach(recipe => {
      suggestions.push({
        text: recipe.title || recipe.name || '',
        type: '菜谱',
        icon: '🍽️',
      })
    })

    // 添加食材建议
    const ingredientSuggestions = ['鸡肉', '牛肉', '猪肉', '鱼', '豆腐', '土豆', '番茄']
      .filter(ingredient => ingredient.includes(queryLower))
      .slice(0, 2)
      .map(ingredient => ({
        text: ingredient,
        type: '食材',
        icon: '🥘',
      }))

    suggestions.push(...ingredientSuggestions)

    // 添加烹饪方法建议
    const methodSuggestions = ['炒', '煮', '蒸', '炸', '烤', '炖']
      .filter(method => method.includes(queryLower))
      .slice(0, 2)
      .map(method => ({
        text: method,
        type: '烹饪方法',
        icon: '👨‍🍳',
      }))

    suggestions.push(...methodSuggestions)

    searchSuggestions.value = suggestions.slice(0, 6)
  }

  const applySuggestion = (suggestion: { text: string; type: string; icon: string }) => {
    searchQuery.value = suggestion.text
    showSearchSuggestions.value = false
    performSearch()

    trackEvent('search', {
      source: 'search_suggestion',
      category: 'suggestion_applied',
      query: suggestion.text,
    })
  }

  const performSearch = () => {
    isSearching.value = true
    currentPage.value = 1

    setTimeout(() => {
      isSearching.value = false
      trackEvent('search', {
        source: 'search_interface',
        category: 'manual_search',
        query: searchQuery.value,
      })
    }, 500)

    emit('search', searchQuery.value, filters.value)
  }

  const clearSearch = () => {
    searchQuery.value = ''
    showSearchSuggestions.value = false
    performSearch()
  }

  const toggleQuickTag = (tag: { text: string; icon: string }) => {
    const index = selectedQuickTags.value.indexOf(tag.text)
    if (index > -1) {
      selectedQuickTags.value.splice(index, 1)
    } else {
      selectedQuickTags.value.push(tag.text)
    }

    trackEvent('click', {
      source: 'search_interface',
      category: 'quick_tag',
      target: tag.text,
    })

    performSearch()
  }

  const updateFilter = (key: string, value: string) => {
    if (key === 'cookingTime') {
      filters.value.cookingTime = filters.value.cookingTime === value ? '' : value
    } else if (key === 'difficulty') {
      filters.value.difficulty = filters.value.difficulty === value ? '' : value
    }
    performSearch()
  }

  const toggleNutritionFilter = (value: string) => {
    const index = filters.value.nutrition.indexOf(value)
    if (index > -1) {
      filters.value.nutrition.splice(index, 1)
    } else {
      filters.value.nutrition.push(value)
    }
    performSearch()
  }

  const toggleIngredientFilter = (value: string) => {
    const index = filters.value.ingredientType.indexOf(value)
    if (index > -1) {
      filters.value.ingredientType.splice(index, 1)
    } else {
      filters.value.ingredientType.push(value)
    }
    performSearch()
  }

  const resetFilters = () => {
    filters.value = {
      cookingTime: '',
      difficulty: '',
      nutrition: [],
      ingredientType: [],
    }
    performSearch()
  }

  const resetSearch = () => {
    searchQuery.value = ''
    selectedQuickTags.value = []
    resetFilters()
  }

  const applySorting = (sortValue: string) => {
    currentSort.value = sortValue
    showSortOptions.value = false
    currentPage.value = 1

    trackEvent('click', {
      source: 'search_interface',
      category: 'sort_applied',
      target: sortValue,
    })
  }

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      trackEvent('click', {
        source: 'search_interface',
        category: 'pagination',
        target: `page_${page}`,
      })
    }
  }

  const getRecipeImage = (recipe: Recipe): string => {
    if (recipe.image) return recipe.image

    const ingredients = recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name))
    return getDishImage(recipe.title || recipe.name || '', ingredients)
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.src = '/images/ingredients/default.jpg'
  }

  const getDifficultyText = (difficulty: string | number): string => {
    switch (String(difficulty)?.toLowerCase()) {
      case 'easy':
        return '简单'
      case 'medium':
        return '中等'
      case 'hard':
        return '困难'
      default:
        return String(difficulty ?? '')
    }
  }

  const getMainIngredients = (recipe: Recipe): string[] => {
    return recipe.ingredients.slice(0, 3).map(ing => (typeof ing === 'string' ? ing : ing.name))
  }

  const handleRecipeSelect = (recipe: Recipe) => {
    trackEvent('click', {
      source: 'search_interface',
      category: 'recipe_selected',
      target: recipe.id || 'unknown',
    })
    emit('selectRecipe', recipe)
  }

  const handleStartCooking = (recipe: Recipe) => {
    trackEvent('click', {
      source: 'search_interface',
      category: 'start_cooking',
      target: recipe.id || 'unknown',
    })
    emit('startCooking', recipe)
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    trackEvent('click', {
      source: 'search_interface',
      category: 'save_recipe',
      target: recipe.id || 'unknown',
    })
    emit('saveRecipe', recipe)
  }

  // 监听器
  watch(
    [searchQuery, selectedQuickTags, filters],
    () => {
      currentPage.value = 1
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    if (searchQuery.value) {
      performSearch()
    }
  })
</script>

<style scoped lang="scss">
  @import '@/styles/variables.scss';

  .enhanced-search-interface {
    .search-header {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;

      .search-bar-container {
        .main-search-bar {
          position: relative;
          margin-bottom: 1rem;

          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            background: var(--secondary-color);
            border-radius: 3rem;
            padding: 0.75rem 1.5rem;
            border: 2px solid transparent;
            transition: all 0.3s ease;

            &:focus-within {
              border-color: var(--primary-color);
              box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1);
            }

            .search-icon {
              margin-right: 0.75rem;
              font-size: 1.125rem;
              color: var(--text-secondary);
            }

            .search-input {
              flex: 1;
              border: none;
              background: none;
              font-size: 1rem;
              color: var(--text-primary);

              &::placeholder {
                color: var(--text-secondary);
              }

              &:focus {
                outline: none;
              }
            }

            .clear-search-btn {
              background: none;
              border: none;
              color: var(--text-secondary);
              cursor: pointer;
              padding: 0.25rem;
              margin-left: 0.5rem;

              &:hover {
                color: var(--text-primary);
              }
            }
          }

          .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 50;
            margin-top: 0.5rem;

            .suggestions-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.75rem 1rem;
              border-bottom: 1px solid var(--border-color);

              .suggestions-title {
                font-weight: 500;
                color: var(--text-primary);
                font-size: 0.875rem;
              }

              .close-suggestions {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.25rem;

                &:hover {
                  color: var(--text-primary);
                }
              }
            }

            .suggestions-list {
              .suggestion-item {
                width: 100%;
                display: flex;
                align-items: center;
                padding: 0.75rem 1rem;
                background: none;
                border: none;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.2s ease;

                &:hover {
                  background: var(--hover-color);
                }

                &:last-child {
                  border-radius: 0 0 0.75rem 0.75rem;
                }

                .suggestion-icon {
                  margin-right: 0.75rem;
                  font-size: 1rem;
                }

                .suggestion-content {
                  flex: 1;

                  .suggestion-text {
                    display: block;
                    color: var(--text-primary);
                    font-weight: 500;
                  }

                  .suggestion-type {
                    display: block;
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    margin-top: 0.125rem;
                  }
                }
              }
            }
          }
        }

        .quick-search-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;

          .quick-tag {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            background: var(--secondary-color);
            border: 1px solid var(--border-color);
            border-radius: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.875rem;

            &:hover {
              border-color: var(--primary-color);
              background: var(--primary-light);
            }

            &.active {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }

            .tag-icon {
              margin-right: 0.25rem;
            }
          }
        }
      }

      .advanced-filters {
        .filters-toggle {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--secondary-color);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;

          &:hover {
            background: var(--hover-color);
          }

          .filters-icon {
            margin-right: 0.5rem;
          }

          .filters-text {
            flex: 1;
            text-align: left;
          }

          .filters-count {
            background: var(--primary-color);
            color: white;
            padding: 0.125rem 0.5rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            margin-left: 0.5rem;
          }
        }

        .filters-panel {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--background-color);
          border-radius: 0.5rem;

          .filter-group {
            margin-bottom: 1.5rem;

            .filter-label {
              display: block;
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 0.75rem;
            }

            .time-filter-options,
            .difficulty-filter-options,
            .nutrition-filter-options,
            .ingredient-filter-options {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;

              button {
                display: flex;
                align-items: center;
                padding: 0.5rem 0.75rem;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;

                &:hover {
                  border-color: var(--primary-color);
                }

                &.active {
                  background: var(--primary-color);
                  color: white;
                  border-color: var(--primary-color);
                }

                .difficulty-icon,
                .nutrition-icon,
                .ingredient-icon {
                  margin-right: 0.25rem;
                }
              }
            }
          }

          .filter-actions {
            text-align: center;

            .reset-filters-btn {
              padding: 0.5rem 1rem;
              background: var(--text-secondary);
              color: white;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background-color 0.3s ease;

              &:hover {
                background: var(--text-primary);
              }
            }
          }
        }
      }
    }

    .search-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .stats-info {
        display: flex;
        align-items: center;
        gap: 1rem;

        .results-count {
          color: var(--text-primary);
        }

        .search-query {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      }

      .search-actions {
        position: relative;

        .sort-btn {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--primary-color);
          }

          .sort-icon {
            margin-right: 0.5rem;
          }
        }

        .sort-options {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 10;
          margin-top: 0.5rem;
          min-width: 150px;

          .sort-option {
            width: 100%;
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background: var(--hover-color);
            }

            &.active {
              background: var(--primary-light);
              color: var(--primary-color);
            }

            &:first-child {
              border-radius: 0.5rem 0.5rem 0 0;
            }

            &:last-child {
              border-radius: 0 0 0.5rem 0.5rem;
            }

            .sort-option-icon {
              margin-right: 0.5rem;
            }
          }
        }
      }
    }

    .search-results-section {
      .searching-state {
        text-align: center;
        padding: 3rem;

        .searching-spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        p {
          color: var(--text-secondary);
        }
      }

      .search-results {
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;

          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }

          .recipe-result-card {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;

            &:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .card-image {
              position: relative;
              height: 200px;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .recipe-tags {
                position: absolute;
                top: 0.5rem;
                left: 0.5rem;
                display: flex;
                gap: 0.25rem;

                .difficulty-tag,
                .time-tag {
                  background: rgba(0, 0, 0, 0.7);
                  color: white;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.25rem;
                  font-size: 0.75rem;
                }
              }
            }

            .card-content {
              padding: 1rem;

              .recipe-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
                line-height: 1.4;
              }

              .recipe-description {
                color: var(--text-secondary);
                font-size: 0.875rem;
                line-height: 1.5;
                margin-bottom: 1rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }

              .recipe-highlights {
                margin-bottom: 1rem;

                .ingredient-preview,
                .rating-preview {
                  display: flex;
                  align-items: center;
                  margin-bottom: 0.5rem;
                  font-size: 0.875rem;

                  .highlight-icon,
                  .rating-icon {
                    margin-right: 0.25rem;
                  }

                  .highlight-text,
                  .rating-text {
                    color: var(--text-secondary);
                  }
                }
              }

              .card-actions {
                display: flex;
                gap: 0.5rem;

                .action-btn {
                  flex: 1;
                  padding: 0.5rem 1rem;
                  border: none;
                  border-radius: 0.5rem;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.3s ease;

                  &.primary {
                    background: var(--primary-color);
                    color: white;

                    &:hover {
                      background: var(--primary-dark);
                    }
                  }

                  &.secondary {
                    background: var(--secondary-color);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);

                    &:hover {
                      background: var(--hover-color);
                    }
                  }
                }
              }
            }
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;

          .pagination-btn {
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover:not(:disabled) {
              border-color: var(--primary-color);
              background: var(--primary-light);
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }

          .page-numbers {
            display: flex;
            gap: 0.25rem;

            .page-number {
              padding: 0.5rem 0.75rem;
              background: white;
              border: 1px solid var(--border-color);
              border-radius: 0.5rem;
              cursor: pointer;
              transition: all 0.3s ease;
              min-width: 2.5rem;
              text-align: center;

              &:hover {
                border-color: var(--primary-color);
                background: var(--primary-light);
              }

              &.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
              }
            }
          }
        }
      }

      .no-results {
        text-align: center;
        padding: 3rem;

        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .reset-search-btn {
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s ease;

          &:hover {
            background: var(--primary-dark);
          }
        }
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
