<template>
  <div class="search-view">
    <div class="container">
      <h1 class="page-title">智能食谱搜索</h1>
      <p class="page-subtitle">输入食材或菜名，发现美味食谱</p>
      
      <RecipeSearch @select-recipe="selectRecipe" @search="handleSearch" />
      
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
import RecipeSearch from '@/components/recipe/RecipeSearch.vue'
import RecipeDetail from '@/components/recipe/RecipeDetail.vue'
import RecipeSearchHistory from '@/components/recipe/RecipeSearchHistory.vue'
import { useRecipeService, type Recipe } from '@/services/recipeService'

const recipeService = useRecipeService()
const selectedRecipe = ref<Recipe | null>(null)
const relatedRecipes = ref<Recipe[]>([])
const searchHistoryRef = ref<InstanceType<typeof RecipeSearchHistory> | null>(null)

// 处理搜索
const handleSearch = (query: string) => {
  // 添加到搜索历史
  if (searchHistoryRef.value) {
    searchHistoryRef.value.addSearchHistory(query);
  }
};

// 处理历史记录选择
const handleHistorySelect = (query: string) => {
  // 触发搜索事件
  const searchEvent = new CustomEvent('perform-search', {
    detail: { query }
  });
  window.dispatchEvent(searchEvent);
};

// 生命周期钩子
onMounted(() => {
  // 从会话存储中读取搜索查询
  const savedQuery = sessionStorage.getItem('searchQuery');
  if (savedQuery) {
    // 这里我们需要访问RecipeSearch组件的方法
    // 由于组件封装，我们需要通过ref或事件来实现
    // 这里我们可以通过自定义事件来触发搜索
    setTimeout(() => {
      const searchEvent = new CustomEvent('perform-search', {
        detail: { query: savedQuery }
      });
      window.dispatchEvent(searchEvent);
      
      // 添加到搜索历史
      if (searchHistoryRef.value) {
        searchHistoryRef.value.addSearchHistory(savedQuery);
      }
      
      // 清除会话存储中的查询，避免重复搜索
      sessionStorage.removeItem('searchQuery');
    }, 500);
  }
});

// 选择食谱
const selectRecipe = async (recipe: Recipe) => {
  selectedRecipe.value = recipe;
  
  // 保存到浏览历史
  try {
    const viewHistory = JSON.parse(localStorage.getItem('recipe-view-history') || '[]');
    if (!viewHistory.includes(recipe.id)) {
      viewHistory.push(recipe.id);
      // 限制历史记录数量
      if (viewHistory.length > 20) {
        viewHistory.shift();
      }
      localStorage.setItem('recipe-view-history', JSON.stringify(viewHistory));
    }
  } catch (error) {
    console.error('保存浏览历史失败:', error);
  }
  
  // 加载相关食谱
  try {
    const allRecipes = await recipeService.getAllRecipes();
    
    // 排除当前食谱，选择2-3个相关食谱
    relatedRecipes.value = allRecipes
      .filter(r => r.id !== recipe.id)
      .slice(0, 3);
  } catch (error) {
    console.error('加载相关食谱失败:', error);
    relatedRecipes.value = [];
  }
};

// 显示通知
const showNotification = (notification: { type: string, title: string, message?: string }) => {
  // 创建自定义事件
  const event = new CustomEvent('notification', {
    detail: notification
  });
  
  // 触发事件
  window.dispatchEvent(event);
};
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
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
}
</style>