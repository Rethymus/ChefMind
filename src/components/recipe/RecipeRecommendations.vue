<template>
  <div class="recipe-recommendations">
    <h2 class="section-title">
      <span class="section-icon">✨</span>
      为您推荐
    </h2>
    
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载推荐中...</p>
    </div>
    
    <div v-else-if="recommendations.length > 0" class="recommendations-grid">
      <div 
        v-for="recipe in recommendations" 
        :key="recipe.id"
        class="recommendation-card"
        @click="selectRecipe(recipe)"
      >
        <div class="recipe-image-container">
          <div class="recipe-image" :style="getRecipeImageStyle(recipe)"></div>
          <div class="recipe-difficulty">{{ recipe.difficulty }}</div>
        </div>
        
        <div class="recipe-content">
          <h3 class="recipe-title">{{ recipe.name }}</h3>
          
          <div class="recipe-meta">
            <div class="recipe-time">
              <span class="meta-icon">⏱️</span>
              {{ recipe.cookingTime }}
            </div>
            <div class="recipe-rating">
              <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]">★</span>
            </div>
          </div>
          
          <p class="recipe-description">{{ truncateDescription(recipe.description) }}</p>
          
          <div class="recipe-tags">
            <span 
              v-for="(tag, index) in getRecipeTags(recipe)" 
              :key="index"
              class="recipe-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">🍽️</div>
      <p>暂无推荐食谱</p>
      <p class="empty-hint">尝试浏览更多食谱或收藏您喜欢的食谱，我们将为您提供更精准的推荐</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRecipeService, type Recipe } from '@/services/recipeService'
import { getSmartRecipeImage } from '@/utils/imageUtils'

const props = defineProps({
  limit: {
    type: Number,
    default: 4
  },
  category: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-recipe'])

const recipeService = useRecipeService()
const recommendations = ref<Recipe[]>([])
const isLoading = ref(true)

// 获取食谱图片样式
const getRecipeImageStyle = (recipe: Recipe) => {
  // 使用图片工具获取合适的图片
  const imageUrl = recipe.image || getSmartRecipeImage({
    name: recipe.name,
    ingredients: recipe.ingredients,
    cookingMethod: recipe.name.split('').find(char => ['炒', '煮', '蒸', '炖', '煎', '烤'].includes(char))
  });
  
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
};

// 截断描述文本
const truncateDescription = (description: string) => {
  if (description.length > 80) {
    return description.substring(0, 80) + '...';
  }
  return description;
};

// 获取食谱标签
const getRecipeTags = (recipe: Recipe) => {
  const tags = [];
  
  // 根据食谱属性生成标签
  if (recipe.ingredients.some(i => i.includes('肉') || i.includes('鸡') || i.includes('牛') || i.includes('猪'))) {
    tags.push('肉类');
  }
  
  if (recipe.ingredients.some(i => i.includes('蔬菜') || i.includes('菜') || i.includes('青菜'))) {
    tags.push('蔬菜');
  }
  
  if (recipe.cookingTime.includes('分钟') && parseInt(recipe.cookingTime) < 30) {
    tags.push('快手菜');
  }
  
  if (recipe.difficulty === '简单') {
    tags.push('新手友好');
  }
  
  // 限制标签数量
  return tags.slice(0, 3);
};

// 选择食谱
const selectRecipe = (recipe: Recipe) => {
  emit('select-recipe', recipe);
};

// 加载推荐食谱
const loadRecommendations = async () => {
  isLoading.value = true;
  try {
    // 获取所有食谱
    const allRecipes = await recipeService.getAllRecipes();
    
    // 根据分类筛选
    let filteredRecipes = allRecipes;
    if (props.category) {
      filteredRecipes = allRecipes.filter(recipe => {
        const tags = getRecipeTags(recipe);
        return tags.includes(props.category);
      });
    }
    
    // 获取本地存储中的浏览历史
    const viewHistory = JSON.parse(localStorage.getItem('recipe-view-history') || '[]');
    
    // 根据浏览历史和评分排序
    filteredRecipes.sort((a, b) => {
      // 浏览过的食谱获得额外分数
      const aViewed = viewHistory.includes(a.id) ? 1 : 0;
      const bViewed = viewHistory.includes(b.id) ? 1 : 0;
      
      // 评分因素
      const aScore = a.rating * 0.5 + aViewed * 2;
      const bScore = b.rating * 0.5 + bViewed * 2;
      
      return bScore - aScore;
    });
    
    // 限制数量
    recommendations.value = filteredRecipes.slice(0, props.limit);
  } catch (error) {
    console.error('加载推荐食谱失败:', error);
    recommendations.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  loadRecommendations();
});
</script>

<style lang="scss" scoped>
.recipe-recommendations {
  margin-bottom: 3rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.5rem;
}

.loading-container {
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

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.recommendation-card {
  background-color: var(--bg-color-light);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

.recipe-image-container {
  position: relative;
  height: 180px;
}

.recipe-image {
  width: 100%;
  height: 100%;
}

.recipe-difficulty {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.recipe-content {
  padding: 1.5rem;
}

.recipe-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 0.8rem 0;
  line-height: 1.4;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.recipe-time {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.meta-icon {
  font-size: 1rem;
}

.recipe-rating {
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

.recipe-description {
  font-size: 0.9rem;
  color: var(--text-color);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recipe-tag {
  background-color: var(--bg-color-secondary);
  color: var(--text-color-secondary);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.empty-hint {
  font-size: 0.9rem !important;
  color: var(--text-color-secondary) !important;
  max-width: 400px;
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .recipe-image-container {
    height: 150px;
  }
}
</style>