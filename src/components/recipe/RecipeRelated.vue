<template>
  <div class="recipe-related">
    <h2 class="section-title">
      <span class="section-icon">🍳</span>
      相关推荐
    </h2>

    <div v-if="relatedRecipes.length > 0" class="related-recipes">
      <div
        v-for="recipe in relatedRecipes"
        :key="recipe.id"
        class="related-recipe-card"
        @click="selectRecipe(recipe)"
      >
        <div v-if="recipe.tags && recipe.tags.length > 0" class="recipe-tags">
          <span class="recipe-tag">{{ recipe.tags[0] }}</span>
        </div>

        <div class="recipe-info">
          <h3 class="recipe-name">{{ recipe.name }}</h3>

          <div class="recipe-meta">
            <div class="recipe-time">
              <span class="meta-icon">⏱️</span>
              {{ recipe.cookingTime }}
            </div>

            <div class="recipe-difficulty">
              <span class="meta-icon">📊</span>
              {{ recipe.difficulty }}
            </div>
          </div>

          <div class="recipe-rating">
            <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]">★</span>
            <span class="rating-count">({{ recipe.rating }})</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-related">
      <div class="no-related-icon">🔍</div>
      <p>暂无相关推荐</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits, computed } from 'vue'
  import type { Recipe } from '@/types/recipe'

  // 定义属性
  const props = defineProps<{
    recipes: Recipe[]
    currentRecipeId: string
  }>()

  // 定义事件
  const emit = defineEmits<{
    'recipe-select': [recipe: Recipe]
  }>()

  // 计算相关食谱
  const relatedRecipes = computed(() => {
    return props.recipes.filter(recipe => recipe.id !== props.currentRecipeId).slice(0, 3)
  })

  // 选择食谱
  const selectRecipe = (recipe: Recipe) => {
    emit('recipe-select', recipe)
  }
</script>

<style lang="scss" scoped>
  .recipe-related {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

  .related-recipes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .related-recipe-card {
    background-color: var(--bg-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
  }

  .recipe-image {
    height: 150px;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .recipe-tags {
    position: absolute;
    bottom: 10px;
    left: 10px;
    display: flex;
    gap: 5px;
  }

  .recipe-tag {
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .recipe-info {
    padding: 1.2rem;
  }

  .recipe-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.8rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recipe-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .meta-icon {
    margin-right: 0.3rem;
  }

  .recipe-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .star {
    color: var(--border-color);
    font-size: 1rem;

    &.filled {
      color: var(--warning-color);
    }
  }

  .rating-count {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin-left: 0.3rem;
  }

  .no-related {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    text-align: center;
  }

  .no-related-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .no-related p {
    font-size: 1.1rem;
    color: var(--text-color-secondary);
    margin: 0;
  }

  @media (max-width: 768px) {
    .related-recipes {
      grid-template-columns: 1fr;
    }
  }
</style>
