<template>
  <div class="favorites-recipe-card" @click="handleViewDetails">
    <div class="recipe-image-container">
      <!-- 使用SVG生成与菜谱名称匹配的封面 -->
      <div class="recipe-svg-cover" v-html="generateRecipeSvg(recipe.name || recipe.title)"></div>
      <div class="recipe-overlay">
        <span v-if="recipe.difficulty" class="recipe-difficulty">{{ formatDifficulty(recipe.difficulty) }}</span>
        <span v-if="recipe.cookingTime" class="recipe-time">{{ formatCookingTime(recipe.cookingTime) }}</span>
      </div>
    </div>

    <div class="recipe-content">
      <h3 class="recipe-title">{{ recipe.name || recipe.title }}</h3>
      <p v-if="recipe.description" class="recipe-description">{{ recipe.description }}</p>

      <div class="recipe-meta">
        <div v-if="recipe.rating" class="recipe-rating">
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
        <div v-if="recipe.tags" class="recipe-tags">
          <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="recipe-tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="showActions" class="recipe-actions">
        <button 
          v-if="showFavoriteButton" 
          class="action-btn secondary" 
          @click.stop="handleRemoveFavorite"
          title="取消收藏"
        >
          <span class="btn-icon">❤️</span>
          取消收藏
        </button>
        
        <button 
          v-if="showCategoryButton" 
          class="action-btn secondary" 
          @click.stop="handleEditCategory"
          title="编辑分类"
        >
          <span class="btn-icon">📂</span>
          编辑分类
        </button>
        
        <button 
          v-if="showViewButton" 
          class="action-btn primary" 
          @click.stop="handleViewDetails"
          title="查看详情"
        >
          <span class="btn-icon">👁️</span>
          查看详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { generateRecipeCardSvg } from '@/utils/svgGenerator'
import { formatCookingTime, formatDifficulty } from '@/utils/formatUtils'
import type { Recipe } from '@/types/recipe'

// 定义属性
interface Props {
  recipe: Recipe
  showActions?: boolean
  showFavoriteButton?: boolean
  showCategoryButton?: boolean
  showViewButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  showFavoriteButton: false,
  showCategoryButton: false,
  showViewButton: true,
})

// 定义事件
const emit = defineEmits<{
  viewDetails: [recipe: Recipe]
  removeFavorite: [recipe: Recipe]
  editCategory: [recipe: Recipe]
}>()

// 生成菜谱SVG封面 - 与SearchView完全相同
const generateRecipeSvg = (recipeName: string): string => {
  const svg = generateRecipeCardSvg(recipeName, 'medium')
  return svg
}

// 处理查看详情
const handleViewDetails = () => {
  emit('viewDetails', props.recipe)
}

// 处理取消收藏
const handleRemoveFavorite = () => {
  emit('removeFavorite', props.recipe)
}

// 处理编辑分类
const handleEditCategory = () => {
  emit('editCategory', props.recipe)
}
</script>

<style lang="scss" scoped>
// 与SearchView完全相同的样式
.favorites-recipe-card {
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
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
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
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
  margin-bottom: 1rem;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  color: #ddd;
  font-size: 1rem;
  
  &.filled {
    color: #ffd700;
  }
}

.rating-text {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

.recipe-tags {
  display: flex;
  gap: 0.5rem;
}

.recipe-tag {
  background: var(--primary-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      background: var(--primary-color-dark);
    }
  }

  &.secondary {
    background: var(--bg-color-tertiary);
    color: var(--text-color-primary);

    &:hover {
      background: var(--hover-color);
    }
  }
}

.btn-icon {
  font-size: 0.9rem;
}
</style>
