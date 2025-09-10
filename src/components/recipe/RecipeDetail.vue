<template>
  <div class="recipe-detail">
    <div v-if="recipe" class="recipe-content">
      <!-- 食谱标题和操作 -->
      <div class="recipe-header">
        <h1>{{ recipe.name }}</h1>
        <div class="recipe-actions">
          <div class="recipe-rating">
            <span v-for="i in 5" :key="i" :class="['star', { filled: i <= (recipe.rating || 4.5) }]"
              >★</span
            >
            <span class="rating-count">({{ (recipe.rating || 4.5).toFixed(1) }})</span>
          </div>
          <div class="action-buttons">
            <button
              class="action-button favorite"
              :class="{ active: isFavorite }"
              @click="toggleFavorite"
            >
              <span class="action-icon">❤️</span>
              <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="action-button print" @click="printRecipe">
              <span class="action-icon">🖨️</span>
              <span>打印</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 多媒体平台跳转 -->
      <RecipeMultimediaPlatforms 
        v-if="recipe"
        :recipe-name="recipe.name || recipe.title || ''"
        :compact="true"
        @platform-click="handlePlatformClick"
      />

      <!-- 食谱描述 -->
      <div class="recipe-media-section">
        <div class="recipe-tags" v-if="recipe.tags && recipe.tags.length">
          <span v-for="(tag, index) in recipe.tags" :key="index" class="recipe-tag">{{ tag }}</span>
        </div>
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>

      <!-- 食谱基本信息 -->
      <div class="recipe-info">
        <div class="info-item">
          <div class="info-icon">⏰</div>
          <div class="info-content">
            <div class="info-label">烹饪时间</div>
            <div class="info-value">{{ formatCookingTime(recipe.cookingTime) }}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">📊</div>
          <div class="info-content">
            <div class="info-label">难度</div>
            <div class="info-value">{{ formatDifficulty(recipe.difficulty) }}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">👥</div>
          <div class="info-content">
            <div class="info-label">份量</div>
            <div class="info-value">{{ formatServings(recipe.servings || 2) }}</div>
          </div>
        </div>
      </div>

      <!-- 营养信息 -->
      <div v-if="recipe.nutritionInfo" class="nutrition-info">
        <h3 class="section-title">营养信息</h3>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.calories }}kcal</div>
            <div class="nutrition-label">热量</div>
          </div>

          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.protein }}g</div>
            <div class="nutrition-label">蛋白质</div>
          </div>

          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.carbs }}g</div>
            <div class="nutrition-label">碳水</div>
          </div>

          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.fat }}g</div>
            <div class="nutrition-label">脂肪</div>
          </div>
        </div>
      </div>

      <!-- 食材列表 -->
      <div class="ingredients">
        <h3 class="section-title">食材</h3>
        <ul class="ingredients-list">
          <li
            v-for="(ingredient, index) in recipe.ingredients"
            :key="index"
            class="ingredient-item"
          >
            <span class="ingredient-icon">{{ getIngredientIcon(typeof ingredient === 'string' ? ingredient : ingredient.name) }}</span>
            <span class="ingredient-text">
              {{ typeof ingredient === 'string' ? ingredient : `${ingredient.name} ${ingredient.amount || ''} ${ingredient.unit || ''}`.trim() }}
            </span>
          </li>
        </ul>
      </div>

      <!-- 制作步骤 -->
      <div class="steps">
        <h3 class="section-title">制作步骤</h3>
        <div class="steps-list">
          <div v-for="(step, index) in recipe.steps" :key="index" class="step-item">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">{{ step }}</div>
          </div>
        </div>
      </div>

      <!-- 烹饪小贴士 -->
      <div v-if="recipe.cookingTips && recipe.cookingTips.length > 0" class="tips">
        <h3 class="section-title">小贴士</h3>
        <div class="tips-content">
          <ul>
            <li v-for="tip in recipe.cookingTips" :key="tip">{{ tip }}</li>
          </ul>
        </div>
      </div>

      <!-- 相关食谱 -->
      <div v-if="relatedRecipes && relatedRecipes.length > 0" class="related-recipes">
        <h3 class="section-title">相关食谱</h3>
        <div class="related-grid">
          <div
            v-for="relatedRecipe in relatedRecipes"
            :key="relatedRecipe.id"
            class="related-item"
            @click="$emit('select-recipe', relatedRecipe)"
          >
            <h4 class="related-title">{{ relatedRecipe.name }}</h4>
            <div class="related-meta">
              <span class="related-time">{{ formatCookingTime(relatedRecipe.cookingTime) }}</span>
              <div class="related-rating">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="['star', { filled: i <= relatedRecipe.rating }]"
                  >★</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购物清单按钮 -->
      <div class="recipe-actions bottom-actions">
        <button class="action-button shopping-button" @click="addIngredientsToShoppingList">
          <span class="action-icon">🛒</span>
          添加到购物清单
        </button>
      </div>
    </div>

    <div v-else class="no-recipe">
      <div class="no-recipe-icon">📖</div>
      <h3>请选择一个食谱查看详情</h3>
      <p>您可以使用食谱搜索功能查找美味的食谱</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { shoppingListService } from '@/services/shoppingListService'
  import type { Recipe } from '@/types/recipe'
  import { formatCookingTime, formatServings, formatDifficulty } from '@/utils/formatUtils'
  import { getIngredientIcon } from '@/utils/ingredientIconMapper'
  import RecipeMultimediaPlatforms from '@/components/recipe/RecipeMultimediaPlatforms.vue'
  import { Favorite } from '@/models/Favorite'

  const props = defineProps<{
    recipe?: Recipe
    relatedRecipes?: Recipe[]
  }>()

  const emit = defineEmits(['select-recipe', 'notification'])

  // 收藏状态
  const isFavorite = ref(false)

  // 检查食谱是否已收藏
  const checkIfFavorite = async () => {
    if (!props.recipe) return false

    try {
      const sessionId = localStorage.getItem('sessionId') || 'default-session'
      const recipeId = parseInt(props.recipe.id || '0')
      if (recipeId > 0) {
        return await Favorite.isFavorited(sessionId, recipeId)
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
    return false
  }

  // 切换收藏状态
  const toggleFavorite = async () => {
    if (!props.recipe) return

    try {
      const sessionId = localStorage.getItem('sessionId') || 'default-session'
      const recipeId = parseInt(props.recipe.id || '0')
      
      if (recipeId > 0) {
        const isCurrentlyFavorited = await Favorite.isFavorited(sessionId, recipeId)
        
        if (isCurrentlyFavorited) {
          // 从收藏中移除
          await Favorite.removeFavorite(sessionId, recipeId)
          isFavorite.value = false
          emit('notification', {
            type: 'info',
            title: '取消收藏',
            message: '食谱已从收藏夹中移除',
          })
        } else {
          // 添加到收藏
          await Favorite.addFavorite(
            sessionId,
            recipeId,
            props.recipe.name || props.recipe.title || '未命名菜谱',
            props.recipe.image
          )
          isFavorite.value = true
          emit('notification', {
            type: 'success',
            title: '收藏成功',
            message: '食谱已添加到收藏夹',
          })
        }
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      emit('notification', {
        type: 'error',
        title: '操作失败',
        message: '无法更新收藏状态，请稍后重试',
      })
    }
  }

  // 当食谱变化时更新收藏状态
  const updateFavoriteStatus = async () => {
    if (props.recipe) {
      isFavorite.value = await checkIfFavorite()
    }
  }

  // 初始化时检查收藏状态
  updateFavoriteStatus()

  // 监听食谱变化并更新收藏状态
  watch(
    () => props.recipe,
    () => {
      updateFavoriteStatus()
    },
    { immediate: true }
  )

  // 打印食谱
  const printRecipe = () => {
    if (!props.recipe) return
    window.print()
  }

  // 添加食材到购物清单
  const addIngredientsToShoppingList = async () => {
    if (!props.recipe || !props.recipe.ingredients || props.recipe.ingredients.length === 0) return

    try {
      // 转换食材格式以匹配接口
      const convertedIngredients = props.recipe.ingredients.map(ingredient => {
        if (typeof ingredient === 'string') {
          return ingredient
        }
        return {
          name: ingredient.name,
          amount: ingredient.amount?.toString(),
          unit: ingredient.unit,
        }
      })

      await shoppingListService.addIngredientsFromRecipe(
        props.recipe.id,
        props.recipe.name || props.recipe.title,
        convertedIngredients
      )

      emit('notification', {
        type: 'success',
        title: '添加成功',
        message: '食材已添加到购物清单',
      })
    } catch (error) {
      console.error('添加食材到购物清单失败:', error)
      emit('notification', {
        type: 'error',
        title: '添加失败',
        message: '无法添加食材到购物清单，请稍后重试',
      })
    }
  }

  // 多媒体平台跳转事件处理
  const handlePlatformClick = (platform: string, recipeName: string) => {
    console.log(`用户点击了${platform}平台，搜索菜谱: ${recipeName}`)
    emit('notification', {
      type: 'info',
      title: '跳转提示',
      message: `正在为您跳转到${platform}搜索相关教程`,
    })
  }
</script>

<style scoped>
  .recipe-detail {
    background-color: var(--bg-color);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .recipe-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--heading-color);
    margin: 0;
  }

  .recipe-rating {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .star {
    color: var(--border-color);
    font-size: 20px;
  }

  .star.filled {
    color: var(--warning-color);
  }

  .rating-text {
    font-size: 14px;
    color: var(--text-color-secondary);
    margin-left: 5px;
  }

  .recipe-media-section {
    margin-bottom: 30px;
  }

  .recipe-image {
    height: 300px;
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    margin-bottom: 20px;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .recipe-tags {
    position: absolute;
    bottom: 15px;
    left: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .recipe-tag {
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .recipe-description {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 20px;
    padding: 0 5px;
  }

  .recipe-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 20px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .info-icon {
    font-size: 24px;
    color: var(--primary-color);
  }

  .info-label {
    font-size: 14px;
    color: var(--text-color-secondary);
    margin-bottom: 5px;
  }

  .info-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--heading-color);
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--border-color);
  }

  .nutrition-info {
    margin-bottom: 30px;
  }

  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;
  }

  .nutrition-item {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 15px;
    text-align: center;
  }

  .nutrition-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 5px;
  }

  .nutrition-label {
    font-size: 14px;
    color: var(--text-color-secondary);
  }

  .ingredients,
  .steps,
  .tips {
    margin-bottom: 30px;
  }

  .ingredients-list {
    list-style-type: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .ingredient-item {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 12px 15px;
    font-size: 15px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ingredient-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .ingredient-text {
    flex: 1;
  }

  .steps-list {
    list-style-type: none;
    padding: 0;
    counter-reset: step-counter;
  }

  .step-item {
    display: flex;
    margin-bottom: 20px;
    gap: 15px;
  }

  .step-number {
    background-color: var(--primary-color);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }

  .step-content {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 15px;
    flex: 1;
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-color);
  }

  .tips-content {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 20px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-color);
    border-left: 4px solid var(--warning-color);
  }

  .related-recipes {
    margin-bottom: 30px;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .related-item {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .related-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .related-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 10px 0;
  }

  .related-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .related-time {
    font-size: 14px;
    color: var(--text-color-secondary);
  }

  .related-rating .star {
    font-size: 14px;
  }

  .recipe-actions {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .bottom-actions {
    margin-top: 30px;
    justify-content: center;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 15px;
  }

  .action-button.favorite {
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .action-button.favorite.active {
    background-color: var(--warning-color);
    color: white;
    border: none;
  }

  .action-button.favorite:hover {
    background-color: var(--warning-color-light);
  }

  .action-button.share {
    background-color: var(--success-color);
    color: white;
    border: none;
  }

  .action-button.share:hover {
    background-color: var(--success-color-dark);
  }

  .action-button.print {
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .action-button.print:hover {
    background-color: var(--hover-color);
  }

  /* 多媒体平台跳转样式 */
  .multimedia-section {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .multimedia-description {
    color: var(--text-color-secondary);
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .multimedia-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.8rem;
  }

  .multimedia-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.8rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    font-size: 0.9rem;
  }

  .multimedia-button:hover {
    border-color: var(--primary-color);
    background-color: var(--hover-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .platform-icon {
    font-size: 1.2rem;
  }

  .platform-name {
    font-weight: 500;
    color: var(--heading-color);
  }

  .shopping-button {
    background-color: var(--info-color, #3498db);
    color: white;
    border: none;
    font-size: 16px;
    padding: 15px 30px;
  }

  .shopping-button:hover {
    background-color: var(--info-color-dark, #2980b9);
  }

  .action-icon {
    font-size: 18px;
  }

  .no-recipe {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
  }

  .no-recipe-icon {
    font-size: 60px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .no-recipe h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 10px 0;
  }

  .no-recipe p {
    font-size: 16px;
    color: var(--text-color-secondary);
    margin: 0;
  }

  @media print {
    .recipe-actions,
    .related-recipes {
      display: none;
    }

    .recipe-detail {
      box-shadow: none;
      padding: 0;
    }
  }

  @media (max-width: 768px) {
    .recipe-detail {
      padding: 20px;
    }

    .recipe-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .recipe-title {
      font-size: 24px;
    }

    .recipe-info {
      grid-template-columns: 1fr;
    }

    .ingredients-list {
      grid-template-columns: 1fr;
    }

    .recipe-actions {
      flex-direction: column;
    }

    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
