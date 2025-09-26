<template>
  <div class="recipe-results">
    <div class="step-header">
      <h2>AI生成菜谱</h2>
      <p>根据你的选择，AI为你推荐以下个性化菜谱</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isGenerating" class="loading-section">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48">
          <Loading />
        </el-icon>
        <h3>AI正在为你生成菜谱...</h3>
        <p>请稍候，这可能需要几秒钟时间</p>
        <el-progress :percentage="progress" :show-text="false" :stroke-width="6" color="#ff6b6b" />
      </div>
    </div>

    <!-- 菜谱列表 -->
    <div v-else-if="recipes.length > 0" class="recipes-section">
      <div class="recipes-header">
        <h3>
          <el-icon><Collection /></el-icon>
          为你推荐 {{ recipes.length }} 道菜谱
        </h3>
        <div class="sort-controls">
          <el-select v-model="sortBy" placeholder="排序方式" size="small">
            <el-option label="推荐度" value="recommended" />
            <el-option label="制作时间" value="time" />
            <el-option label="难度等级" value="difficulty" />
            <el-option label="营养评分" value="nutrition" />
          </el-select>
        </div>
      </div>

      <div class="recipes-grid">
        <div v-for="recipe in sortedRecipes" :key="recipe.id" class="recipe-card">
          <!-- 菜谱图片区域 -->
          <div class="recipe-image">
            <div class="svg-cover" v-html="recipe.image || ''"></div>
            <div class="recipe-badges">
              <el-tag v-for="tag in recipe.tags" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 菜谱信息 -->
          <div class="recipe-info">
            <h4 class="recipe-title">{{ recipe.name }}</h4>
            <p class="recipe-description">{{ recipe.description }}</p>

            <!-- 评分信息 -->
            <div class="recipe-ratings">
              <div class="rating-item">
                <span class="rating-label">难度</span>
                <el-rate
                  :model-value="Number(recipe.difficulty)"
                  disabled
                  show-score
                  text-color="#ff9900"
                  :max="5"
                />
              </div>
              <div class="rating-item">
                <span class="rating-label">营养</span>
                <el-rate
                  :model-value="getNutritionScore(recipe.nutrition)"
                  disabled
                  show-score
                  text-color="#67c23a"
                  :max="5"
                />
              </div>
            </div>

            <!-- 基本信息 -->
            <div class="recipe-meta">
              <div class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>{{ recipe.time }}分钟</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ recipe.servings }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Collection /></el-icon>
                <span>{{ recipe.ingredients.length }}种食材</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="recipe-actions">
              <el-button type="primary" @click="showRecipeDetail(recipe)" :icon="View">
                查看详情
              </el-button>
              <el-button @click="saveRecipe(recipe)" :icon="Star"> 收藏 </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-section">
      <div class="empty-content">
        <el-icon class="empty-icon" :size="64">
          <DocumentDelete />
        </el-icon>
        <h3>暂无菜谱推荐</h3>
        <p>请先完成前面的步骤，然后点击生成菜谱</p>
      </div>
    </div>

    <!-- 菜谱详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="selectedRecipe?.name"
      width="80%"
      :before-close="handleCloseDetail"
    >
      <RecipeDetail
        v-if="selectedRecipe"
        :recipe="selectedRecipe"
        @save="saveRecipe"
        @close="showDetailDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import type { Recipe } from '@/types/recipe'
  import RecipeDetail from './RecipeDetail.vue'
  import { ElMessage } from 'element-plus'
  import {
    Loading,
    Collection,
    Timer,
    User,
    View,
    Star,
    DocumentDelete,
  } from '@element-plus/icons-vue'

  interface Props {
    recipes: Recipe[]
    isGenerating: boolean
  }

  interface Emits {
    (_e: 'save-recipe', _recipe: Recipe): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const sortBy = ref('recommended')
  const showDetailDialog = ref(false)
  const selectedRecipe = ref<Recipe | null>(null)
  const loadingProgress = ref<number>(0)
  const progress = computed(() => Number(loadingProgress.value))
  let loadingInterval: any = null

  const getNutritionScore = (nutrition: Recipe['nutrition']): number => {
    if (!nutrition) return 0
    if (nutrition.healthScore) return nutrition.healthScore
    const calories = nutrition.calories || 0
    if (calories < 200) return 5
    if (calories < 400) return 4
    if (calories < 600) return 3
    if (calories < 800) return 2
    return 1
  }

  // 排序后的菜谱
  const sortedRecipes = computed(() => {
    const sorted = [...props.recipes]

    switch (sortBy.value) {
      case 'time':
        return sorted.sort((a, b) => (a.time || 0) - (b.time || 0))
      case 'difficulty':
        return sorted.sort((a, b) => Number(a.difficulty) - Number(b.difficulty))
      case 'nutrition':
        return sorted.sort(
          (a, b) => (getNutritionScore(b.nutrition) || 0) - (getNutritionScore(a.nutrition) || 0)
        )
      default:
        // 推荐度排序（综合评分）
        return sorted.sort((a, b) => {
          const scoreA = ((getNutritionScore(a.nutrition) || 0) + (6 - Number(a.difficulty))) / 2
          const scoreB = ((getNutritionScore(b.nutrition) || 0) + (6 - Number(b.difficulty))) / 2
          return scoreB - scoreA
        })
    }
  })

  // 显示菜谱详情
  const showRecipeDetail = (recipe: Recipe) => {
    selectedRecipe.value = recipe
    showDetailDialog.value = true
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    showDetailDialog.value = false
    selectedRecipe.value = null
  }

  // 保存菜谱
  const saveRecipe = (recipe: Recipe) => {
    emit('save-recipe', recipe)
    ElMessage.success(`已收藏菜谱：${recipe.name}`)
  }

  // 模拟加载进度
  const startLoadingProgress = () => {
    loadingProgress.value = 0
    loadingInterval = setInterval(() => {
      if (loadingProgress.value < 90) {
        loadingProgress.value += Math.random() * 15
      }
    }, 200)
  }

  const stopLoadingProgress = () => {
    if (loadingInterval) {
      clearInterval(loadingInterval)
      loadingInterval = null
    }
    loadingProgress.value = 100
  }

  // 监听生成状态变化
  onMounted(() => {
    if (props.isGenerating) {
      startLoadingProgress()
    }
  })

  onUnmounted(() => {
    if (loadingInterval) {
      clearInterval(loadingInterval)
    }
  })

  const stopLoading = () => {
    if (props.isGenerating) {
      startLoadingProgress()
    } else {
      stopLoadingProgress()
    }
  }

  watch(() => props.isGenerating, stopLoading)
</script>

<style lang="scss" scoped>
  .recipe-results {
    .step-header {
      text-align: center;
      margin-bottom: 2rem;

      h2 {
        font-size: 2rem;
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }

      p {
        color: #666;
        font-size: 1.1rem;
      }
    }

    .loading-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;

      .loading-content {
        text-align: center;
        max-width: 400px;

        .loading-icon {
          color: #ff6b6b;
          animation: spin 2s linear infinite;
          margin-bottom: 1rem;
        }

        h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        p {
          color: #666;
          margin-bottom: 2rem;
        }
      }
    }

    .recipes-section {
      .recipes-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;

        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #2c3e50;
          font-size: 1.3rem;
          margin: 0;

          .el-icon {
            color: #ff6b6b;
          }
        }
      }

      .recipes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
      }

      .recipe-card {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .recipe-image {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          .svg-cover {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .image-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;

            span {
              font-size: 1.2rem;
              font-weight: 600;
            }
          }

          .recipe-badges {
            position: absolute;
            top: 1rem;
            right: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        .recipe-info {
          padding: 1.5rem;

          .recipe-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 0.5rem 0;
          }

          .recipe-description {
            color: #666;
            line-height: 1.5;
            margin: 0 0 1rem 0;
          }

          .recipe-ratings {
            display: flex;
            gap: 2rem;
            margin-bottom: 1rem;

            .rating-item {
              display: flex;
              flex-direction: column;
              gap: 0.3rem;

              .rating-label {
                font-size: 0.9rem;
                color: #666;
                font-weight: 500;
              }
            }
          }

          .recipe-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              color: #666;
              font-size: 0.9rem;

              .el-icon {
                color: #ff6b6b;
              }
            }
          }

          .recipe-actions {
            display: flex;
            gap: 1rem;

            .el-button {
              flex: 1;
            }
          }
        }
      }
    }

    .empty-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;

      .empty-content {
        text-align: center;

        .empty-icon {
          color: #ddd;
          margin-bottom: 1rem;
        }

        h3 {
          color: #666;
          margin-bottom: 0.5rem;
        }

        p {
          color: #999;
        }
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // 暗色主题
  :global(.dark) .recipe-results {
    .step-header {
      h2 {
        color: #f9fafb;
      }

      p {
        color: #d1d5db;
      }
    }

    .loading-content {
      h3 {
        color: #f9fafb;
      }

      p {
        color: #d1d5db;
      }
    }

    .recipes-header h3 {
      color: #f9fafb;
    }

    .recipe-card {
      background: #374151;

      .recipe-info {
        .recipe-title {
          color: #f9fafb;
        }

        .recipe-description {
          color: #d1d5db;
        }

        .rating-label {
          color: #d1d5db;
        }

        .meta-item {
          color: #d1d5db;
        }
      }
    }

    .empty-content {
      h3 {
        color: #9ca3af;
      }

      p {
        color: #6b7280;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .recipe-results {
      .recipes-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .recipes-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .recipe-card {
        .recipe-image {
          height: 150px;

          .image-placeholder span {
            font-size: 1rem;
          }
        }

        .recipe-info {
          padding: 1rem;

          .recipe-title {
            font-size: 1.1rem;
          }

          .recipe-ratings {
            gap: 1rem;
          }

          .recipe-meta {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .recipe-actions {
            flex-direction: column;
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .recipe-results {
      .step-header {
        h2 {
          font-size: 1.5rem;
        }

        p {
          font-size: 1rem;
        }
      }

      .recipe-card {
        .recipe-image {
          height: 120px;
        }

        .recipe-info {
          padding: 0.8rem;

          .recipe-title {
            font-size: 1rem;
          }

          .recipe-description {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
</style>
