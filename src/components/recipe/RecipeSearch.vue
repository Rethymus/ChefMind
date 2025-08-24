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
    
    <div v-if="showFilters" class="search-filters">
      <div class="filter-group">
        <div class="filter-label">烹饪时间:</div>
        <div class="filter-options">
          <button 
            v-for="option in timeFilters" 
            :key="option.value"
            :class="['filter-option', { active: filters.time === option.value }]"
            @click="setFilter('time', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      
      <div class="filter-group">
        <div class="filter-label">难度:</div>
        <div class="filter-options">
          <button 
            v-for="option in difficultyFilters" 
            :key="option.value"
            :class="['filter-option', { active: filters.difficulty === option.value }]"
            @click="setFilter('difficulty', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      
      <div class="filter-group">
        <div class="filter-label">饮食偏好:</div>
        <div class="filter-options">
          <button 
            v-for="option in dietFilters" 
            :key="option.value"
            :class="['filter-option', { active: filters.diet === option.value }]"
            @click="setFilter('diet', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      
      <button class="clear-filters" @click="clearFilters">清除筛选</button>
    </div>
    
    <div class="search-actions">
      <button class="toggle-filters" @click="showFilters = !showFilters">
        {{ showFilters ? '隐藏筛选' : '显示筛选' }}
        <span class="toggle-icon">{{ showFilters ? '▲' : '▼' }}</span>
      </button>
      
      <div class="search-results-info" v-if="hasSearched">
        找到 {{ searchResults.length }} 个结果
      </div>
    </div>
    
    <div v-if="isSearching" class="search-loading">
      <div class="loading-spinner"></div>
      <p>搜索中...</p>
    </div>
    
    <div v-else-if="hasSearched" class="search-results">
      <div v-if="searchResults.length > 0" class="results-grid">
        <div 
          v-for="recipe in searchResults" 
          :key="recipe.id"
          class="result-card"
          @click="selectRecipe(recipe)"
        >
          <div class="result-header">
            <h3 class="result-title">{{ recipe.name }}</h3>
            <div class="result-rating">
              <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]">★</span>
            </div>
          </div>
          
          <p class="result-description">{{ truncateText(recipe.description, 100) }}</p>
          
          <div class="result-meta">
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              {{ recipe.cookingTime }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📊</span>
              {{ recipe.difficulty }}
            </span>
          </div>
          
          <div class="result-ingredients">
            <span class="ingredients-label">主要食材:</span>
            <span class="ingredients-list">{{ getMainIngredients(recipe) }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>未找到匹配的食谱</h3>
        <p>尝试使用不同的关键词或调整筛选条件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRecipeService, type Recipe } from '@/services/recipeService'

const emit = defineEmits(['select-recipe', 'search'])

// 状态
const searchQuery = ref('')
const showSuggestions = ref(false)
const showFilters = ref(false)
const isSearching = ref(false)
const hasSearched = ref(false)
const searchResults = ref<Recipe[]>([])
const allRecipes = ref<Recipe[]>([])

// 筛选器
const filters = ref({
  time: '',
  difficulty: '',
  diet: ''
})

// 筛选选项
const timeFilters = [
  { label: '快速 (<30分钟)', value: 'quick' },
  { label: '中等 (30-60分钟)', value: 'medium' },
  { label: '慢炖 (>60分钟)', value: 'slow' }
]

const difficultyFilters = [
  { label: '简单', value: '简单' },
  { label: '中等', value: '中等' },
  { label: '较难', value: '较难' }
]

const dietFilters = [
  { label: '素食', value: 'vegetarian' },
  { label: '低碳水', value: 'lowCarb' },
  { label: '高蛋白', value: 'highProtein' }
]

// 服务
const recipeService = useRecipeService()

// 计算属性
const suggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return [];
  
  const query = searchQuery.value.toLowerCase();
  const results = [];
  
  // 搜索食谱名称
  const recipeNameMatches = allRecipes.value
    .filter(recipe => recipe.name.toLowerCase().includes(query))
    .slice(0, 3)
    .map(recipe => ({
      type: 'recipe',
      text: recipe.name,
      data: recipe
    }));
  
  results.push(...recipeNameMatches);
  
  // 搜索食材
  const ingredientSet = new Set<string>();
  allRecipes.value.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.split(' ')[0]; // 去掉数量部分
      if (ingredientName.toLowerCase().includes(query)) {
        ingredientSet.add(ingredientName);
      }
    });
  });
  
  const ingredientMatches = Array.from(ingredientSet)
    .slice(0, 3)
    .map(ingredient => ({
      type: 'ingredient',
      text: ingredient,
      data: ingredient
    }));
  
  results.push(...ingredientMatches);
  
  // 搜索烹饪方式
  const cookingMethods = ['炒', '煮', '蒸', '炖', '烤', '炸', '煎', '焖', '烧', '拌'];
  const methodMatches = cookingMethods
    .filter(method => method.includes(query))
    .slice(0, 2)
    .map(method => ({
      type: 'method',
      text: method,
      data: method
    }));
  
  results.push(...methodMatches);
  
  return results.slice(0, 6); // 最多显示6个建议
});

// 方法
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  isSearching.value = true;
  hasSearched.value = true;
  showSuggestions.value = false;
  
  // 触发搜索事件，用于记录搜索历史
  emit('search', searchQuery.value.trim());
  
  try {
    // 获取所有食谱
    const recipes = await recipeService.getAllRecipes();
    
    // 根据查询和筛选条件过滤
    let results = recipes.filter(recipe => {
      // 搜索词匹配
      const query = searchQuery.value.toLowerCase();
      const nameMatch = recipe.name.toLowerCase().includes(query);
      const descriptionMatch = recipe.description.toLowerCase().includes(query);
      const ingredientMatch = recipe.ingredients.some(i => i.toLowerCase().includes(query));
      
      if (!(nameMatch || descriptionMatch || ingredientMatch)) {
        return false;
      }
      
      // 时间筛选
      if (filters.value.time) {
        const cookingTimeMinutes = parseInt(recipe.cookingTime);
        if (filters.value.time === 'quick' && cookingTimeMinutes >= 30) return false;
        if (filters.value.time === 'medium' && (cookingTimeMinutes < 30 || cookingTimeMinutes > 60)) return false;
        if (filters.value.time === 'slow' && cookingTimeMinutes <= 60) return false;
      }
      
      // 难度筛选
      if (filters.value.difficulty && recipe.difficulty !== filters.value.difficulty) {
        return false;
      }
      
      // 饮食偏好筛选
      if (filters.value.diet) {
        if (filters.value.diet === 'vegetarian' && 
            recipe.ingredients.some(i => i.includes('肉') || i.includes('鱼') || i.includes('虾'))) {
          return false;
        }
        
        if (filters.value.diet === 'lowCarb' && 
            recipe.ingredients.some(i => i.includes('米') || i.includes('面') || i.includes('糖'))) {
          return false;
        }
        
        if (filters.value.diet === 'highProtein' && 
            !recipe.ingredients.some(i => i.includes('肉') || i.includes('蛋') || i.includes('豆'))) {
          return false;
        }
      }
      
      return true;
    });
    
    // 排序：优先显示名称匹配的结果
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ? 1 : 0;
      const bNameMatch = b.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ? 1 : 0;
      return bNameMatch - aNameMatch || b.rating - a.rating;
    });
    
    searchResults.value = results;
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const selectSuggestion = (suggestion: any) => {
  if (suggestion.type === 'recipe') {
    emit('select-recipe', suggestion.data);
  } else {
    searchQuery.value = suggestion.text;
    performSearch();
  }
  showSuggestions.value = false;
};

const setFilter = (filterType: string, value: string) => {
  if (filters.value[filterType as keyof typeof filters.value] === value) {
    // 如果已经选中，则取消选择
    filters.value[filterType as keyof typeof filters.value] = '';
  } else {
    filters.value[filterType as keyof typeof filters.value] = value;
  }
  
  if (hasSearched.value) {
    performSearch();
  }
};

const clearFilters = () => {
  filters.value = {
    time: '',
    difficulty: '',
    diet: ''
  };
  
  if (hasSearched.value) {
    performSearch();
  }
};

const selectRecipe = (recipe: Recipe) => {
  emit('select-recipe', recipe);
};

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'recipe': return '📖';
    case 'ingredient': return '🥕';
    case 'method': return '🍳';
    default: return '🔍';
  }
};

const getSuggestionType = (type: string) => {
  switch (type) {
    case 'recipe': return '食谱';
    case 'ingredient': return '食材';
    case 'method': return '烹饪方式';
    default: return '';
  }
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getMainIngredients = (recipe: Recipe) => {
  // 获取前3个主要食材
  return recipe.ingredients
    .slice(0, 3)
    .map(ing => ing.split(' ')[0]) // 去掉数量部分
    .join('、');
};

// 点击外部关闭建议
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.recipe-search')) {
    showSuggestions.value = false;
  }
};

// 声明全局类型
// Global Window interface extension for event listeners
declare global {
  interface Window {
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
  }
}

const performSearchHandler = (_event: Event) => {
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  hasSearched.value = false
  showSuggestions.value = false
}

const clearSearchHandler = (_event: Event) => {
  clearSearch()
}

// 生命周期钩子
onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  
  try {
    // 预加载所有食谱数据
    allRecipes.value = await recipeService.getAllRecipes();
  } catch (error) {
    console.error('加载食谱数据失败:', error);
  }
  
  // 监听自定义搜索事件
  window.addEventListener('perform-search', performSearchHandler);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('perform-search', performSearchHandler);
});

// 监听搜索词变化
watch(searchQuery, () => {
  if (!searchQuery.value) {
    showSuggestions.value = false;
  }
});
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
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
  margin-bottom: 1.5rem;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
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
}
</style>