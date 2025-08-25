<template>
  <div class="enhanced-personalized-recommendations">
    <div class="recommendations-header">
      <div class="header-content">
        <h3 class="recommendations-title">
          <span class="title-icon">🎯</span>
          个性化智能推荐
        </h3>
        <p class="recommendations-subtitle">基于您的偏好和行为智能推荐最适合的菜谱</p>
      </div>

      <!-- 推荐设置按钮 -->
      <div class="header-actions">
        <el-button @click="showPreferencesDialog = true" :icon="Setting" size="small">
          偏好设置
        </el-button>
        <el-button
          @click="refreshRecommendations"
          :icon="Refresh"
          size="small"
          :loading="isLoading"
        >
          刷新推荐
        </el-button>
      </div>
    </div>

    <!-- 推荐类别导航 -->
    <div class="recommendation-categories">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane
          v-for="category in categories"
          :key="category.key"
          :label="category.label"
          :name="category.key"
        >
          <template #label>
            <span class="category-label">
              <span class="category-icon">{{ category.icon }}</span>
              {{ category.label }}
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 推荐内容区域 -->
    <div class="recommendations-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="3" animated>
          <template #template>
            <div class="recommendation-skeleton">
              <el-skeleton-item variant="image" style="width: 200px; height: 150px" />
              <div style="padding: 14px">
                <el-skeleton-item variant="h3" style="width: 60%" />
                <el-skeleton-item variant="text" style="width: 80%" />
                <el-skeleton-item variant="text" style="width: 40%" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 推荐列表 -->
      <div v-else class="recommendations-grid">
        <div
          v-for="recommendation in filteredRecommendations"
          :key="recommendation.id"
          class="recommendation-card"
          @click="selectRecommendation(recommendation)"
        >
          <!-- 推荐原因标签 -->
          <div class="recommendation-reason">
            <el-tag :type="getReasonType(recommendation.reason)" size="small">
              {{ getReasonText(recommendation.reason) }}
            </el-tag>
            <div class="match-score">{{ Math.round(recommendation.score * 100) }}% 匹配</div>
          </div>

          <!-- 菜谱图片 -->
          <div class="recipe-image">
            <img
              :src="recommendation.recipe.image || getDefaultImage(recommendation.recipe)"
              :alt="recommendation.recipe.name"
              @error="handleImageError"
            />
            <div class="image-overlay">
              <el-button
                circle
                size="large"
                type="primary"
                @click.stop="startCooking(recommendation)"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 菜谱信息 -->
          <div class="recipe-info">
            <h4 class="recipe-name">{{ recommendation.recipe.name }}</h4>
            <p class="recipe-description">{{ recommendation.recipe.description }}</p>

            <!-- 菜谱标签 -->
            <div class="recipe-tags">
              <el-tag
                v-for="tag in recommendation.recipe.tags?.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>

            <!-- 菜谱统计 -->
            <div class="recipe-stats">
              <div class="stat-item">
                <el-icon><Clock /></el-icon>
                <span>{{ recommendation.recipe.cookingTime }}分钟</span>
              </div>
              <div class="stat-item">
                <el-icon><Star /></el-icon>
                <span>{{ recommendation.recipe.difficulty || '中等' }}</span>
              </div>
              <div class="stat-item">
                <el-icon><User /></el-icon>
                <span>{{ recommendation.recipe.servings || 2 }}人份</span>
              </div>
            </div>

            <!-- 营养信息预览 -->
            <div class="nutrition-preview">
              <div class="nutrition-item">
                <span class="nutrition-label">热量</span>
                <span class="nutrition-value"
                  >{{ recommendation.recipe.nutrition?.calories || 0 }}卡</span
                >
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">蛋白质</span>
                <span class="nutrition-value"
                  >{{ recommendation.recipe.nutrition?.protein || 0 }}g</span
                >
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="recipe-actions">
            <el-button-group size="small">
              <el-button @click.stop="addToFavorites(recommendation)" :icon="StarFilled">
                收藏
              </el-button>
              <el-button @click.stop="shareRecipe(recommendation)" :icon="Share"> 分享 </el-button>
              <el-button @click.stop="viewDetails(recommendation)" :icon="View"> 详情 </el-button>
            </el-button-group>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!isLoading && filteredRecommendations.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>暂无推荐</h3>
        <p>我们正在为您准备个性化推荐，请稍候或调整您的偏好设置</p>
        <el-button type="primary" @click="showPreferencesDialog = true"> 设置偏好 </el-button>
      </div>
    </div>

    <!-- 偏好设置对话框 -->
    <el-dialog v-model="showPreferencesDialog" title="个性化偏好设置" width="90%" max-width="600px">
      <div class="preferences-form">
        <el-form :model="userPreferences" label-width="120px">
          <!-- 饮食偏好 -->
          <el-form-item label="饮食偏好">
            <el-checkbox-group v-model="userPreferences.dietaryRestrictions">
              <el-checkbox label="vegetarian">素食</el-checkbox>
              <el-checkbox label="vegan">纯素</el-checkbox>
              <el-checkbox label="low-carb">低碳水</el-checkbox>
              <el-checkbox label="low-fat">低脂</el-checkbox>
              <el-checkbox label="high-protein">高蛋白</el-checkbox>
              <el-checkbox label="gluten-free">无麸质</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 烹饪技能 -->
          <el-form-item label="烹饪技能">
            <el-radio-group v-model="userPreferences.cookingSkillLevel">
              <el-radio label="beginner">新手</el-radio>
              <el-radio label="intermediate">中级</el-radio>
              <el-radio label="advanced">高级</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 时间偏好 -->
          <el-form-item label="时间偏好">
            <el-radio-group v-model="userPreferences.timePreference">
              <el-radio label="quick">快手菜(≤15分钟)</el-radio>
              <el-radio label="medium">适中(15-45分钟)</el-radio>
              <el-radio label="slow">慢煮(>45分钟)</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 喜欢的食材 -->
          <el-form-item label="喜欢的食材">
            <el-select
              v-model="userPreferences.favoriteIngredients"
              multiple
              filterable
              allow-create
              placeholder="选择或输入喜欢的食材"
              style="width: 100%"
            >
              <el-option
                v-for="ingredient in commonIngredients"
                :key="ingredient"
                :label="ingredient"
                :value="ingredient"
              />
            </el-select>
          </el-form-item>

          <!-- 不喜欢的食材 -->
          <el-form-item label="避免的食材">
            <el-select
              v-model="userPreferences.dislikedIngredients"
              multiple
              filterable
              allow-create
              placeholder="选择或输入不喜欢的食材"
              style="width: 100%"
            >
              <el-option
                v-for="ingredient in commonIngredients"
                :key="ingredient"
                :label="ingredient"
                :value="ingredient"
              />
            </el-select>
          </el-form-item>

          <!-- 营养目标 -->
          <el-form-item label="每日热量目标">
            <el-input-number
              v-model="userPreferences.nutritionGoals.calories"
              :min="1200"
              :max="4000"
              :step="100"
              controls-position="right"
            />
            千卡
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPreferencesDialog = false">取消</el-button>
          <el-button type="primary" @click="savePreferences">保存设置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Setting,
    Refresh,
    VideoPlay,
    Clock,
    Star,
    User,
    StarFilled,
    Share,
    View,
  } from '@element-plus/icons-vue'
  import { usePersonalizedRecommendations } from '@/composables/usePersonalizedRecommendations'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'
  import type { Recipe } from '@/types/recipe'

  // 推荐数据接口
  interface RecommendationItem {
    id: string
    recipe: Recipe
    score: number
    reason: string
    category: string
    timestamp: Date
  }

  // 推荐类别
  const categories = [
    { key: 'all', label: '全部推荐', icon: '🍽️' },
    { key: 'seasonal', label: '时令推荐', icon: '🌱' },
    { key: 'trending', label: '热门菜谱', icon: '🔥' },
    { key: 'healthy', label: '健康轻食', icon: '🥗' },
    { key: 'quick', label: '快手菜', icon: '⚡' },
    { key: 'comfort', label: '家常菜', icon: '🏠' },
    { key: 'special', label: '特色菜', icon: '✨' },
  ]

  // 常用食材列表
  const commonIngredients = [
    '鸡肉',
    '猪肉',
    '牛肉',
    '鱼肉',
    '虾',
    '蛋',
    '豆腐',
    '西红柿',
    '土豆',
    '洋葱',
    '胡萝卜',
    '白菜',
    '菠菜',
    '韭菜',
    '大米',
    '面条',
    '馒头',
    '面包',
    '燕麦',
    '蒜',
    '姜',
    '葱',
    '辣椒',
    '香菜',
  ]

  // 组合式函数
  const {
    userPreferences: preferences,
    getPersonalizedRecommendations,
    updateUserPreferences,
    trackUserBehavior,
  } = usePersonalizedRecommendations()

  const { trackEvent } = useUserBehaviorAnalytics()

  // 响应式数据
  const isLoading = ref(false)
  const activeCategory = ref('all')
  const showPreferencesDialog = ref(false)
  const recommendations = ref<RecommendationItem[]>([])
  const userPreferences = ref(preferences.value)

  // 事件定义
  const emit = defineEmits<{
    recipeSelected: [recipe: Recipe]
    startCooking: [recipe: Recipe]
    addToFavorites: [recipe: Recipe]
  }>()

  // 计算属性
  const filteredRecommendations = computed(() => {
    if (activeCategory.value === 'all') {
      return recommendations.value
    }
    return recommendations.value.filter(item => item.category === activeCategory.value)
  })

  // 生命周期
  onMounted(() => {
    loadRecommendations()
  })

  // 监听偏好变化
  watch(
    userPreferences,
    () => {
      // 偏好变化时重新加载推荐
      loadRecommendations()
    },
    { deep: true }
  )

  // 方法定义
  async function loadRecommendations() {
    isLoading.value = true
    try {
      // 模拟推荐数据
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          title: '宫保鸡丁',
          name: '宫保鸡丁',
          description: '经典川菜，麻辣鲜香，配菜丰富',
          ingredients: ['鸡胸肉', '花生米', '青椒', '胡萝卜'],
          cookingTime: '25',
          difficulty: '中等',
          servings: 2,
          tags: ['川菜', '下饭', '经典'],
          cookingMethods: ['炒'],
          nutrition: { calories: 380, protein: 28, carbs: 15, fat: 18 },
        },
        {
          id: '2',
          title: '番茄炒蛋',
          name: '番茄炒蛋',
          description: '家常菜经典，营养丰富，老少皆宜',
          ingredients: ['鸡蛋', '番茄', '葱花'],
          cookingTime: '10',
          difficulty: '简单',
          servings: 2,
          tags: ['家常菜', '快手', '营养'],
          cookingMethods: ['炒'],
          nutrition: { calories: 180, protein: 12, carbs: 8, fat: 12 },
        },
      ]

      const recommendedRecipes = getPersonalizedRecommendations(mockRecipes, 10)

      recommendations.value = recommendedRecipes.map((recipe, index) => ({
        id: `rec_${Date.now()}_${index}`,
        recipe,
        score: 0.8 + Math.random() * 0.2, // 模拟评分
        reason: index === 0 ? 'preference' : 'seasonal',
        category: getCategoryFromReason(index === 0 ? 'preference' : 'seasonal'),
        timestamp: new Date(),
      }))

      // 记录推荐加载事件
      trackEvent('view', {
        category: 'recommendations',
        target: 'recommendation-list',
      })
    } catch (error) {
      console.error('加载推荐失败:', error)
      ElMessage.error('推荐加载失败，请稍后重试')
    } finally {
      isLoading.value = false
    }
  }

  function getCategoryFromReason(reason: string): string {
    if (reason.includes('seasonal') || reason.includes('时令')) return 'seasonal'
    if (reason.includes('trending') || reason.includes('热门')) return 'trending'
    if (reason.includes('healthy') || reason.includes('健康')) return 'healthy'
    if (reason.includes('quick') || reason.includes('快手')) return 'quick'
    if (reason.includes('comfort') || reason.includes('家常')) return 'comfort'
    if (reason.includes('special') || reason.includes('特色')) return 'special'
    return 'all'
  }

  function getReasonType(reason: string): 'success' | 'primary' | 'warning' | 'info' | 'danger' {
    if (reason.includes('seasonal')) return 'success'
    if (reason.includes('trending')) return 'danger'
    if (reason.includes('healthy')) return 'success'
    if (reason.includes('quick')) return 'warning'
    return 'info'
  }

  function getReasonText(reason: string): string {
    const reasonMap: { [key: string]: string } = {
      seasonal: '时令推荐',
      trending: '热门菜谱',
      healthy: '健康推荐',
      quick: '快手推荐',
      comfort: '家常推荐',
      special: '特色推荐',
      similar: '相似推荐',
      preference: '偏好匹配',
    }

    for (const [key, text] of Object.entries(reasonMap)) {
      if (reason.includes(key)) return text
    }
    return '智能推荐'
  }

  function getDefaultImage(recipe: Recipe): string {
    // 根据菜谱类型返回默认图片
    const category = recipe.tags?.[0] || 'default'
    return `/images/recipe-placeholders/${category}.jpg`
  }

  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement
    img.src = '/images/recipe-placeholder.jpg'
  }

  function handleCategoryChange(category: string) {
    console.log('切换推荐类别:', category)
    trackEvent('click', {
      category: 'recommendations',
      target: `category-${category}`,
    })
  }

  async function refreshRecommendations() {
    await loadRecommendations()
    ElMessage.success('推荐已刷新')
  }

  function selectRecommendation(recommendation: RecommendationItem) {
    // 记录用户行为
    trackUserBehavior('view', { recipeId: recommendation.recipe.id })
    trackEvent('click', {
      recipeId: recommendation.recipe.id,
      category: 'recommendation-select',
    })

    emit('recipeSelected', recommendation.recipe)
    ElMessage.success(`已选择 ${recommendation.recipe.name}`)
  }

  function startCooking(recommendation: RecommendationItem) {
    trackUserBehavior('cook', { recipeId: recommendation.recipe.id })
    trackEvent('click', {
      recipeId: recommendation.recipe.id,
      category: 'start-cooking',
    })

    emit('startCooking', recommendation.recipe)
    ElMessage.success(`开始烹饪 ${recommendation.recipe.name}`)
  }

  function addToFavorites(recommendation: RecommendationItem) {
    trackUserBehavior('save', { recipeId: recommendation.recipe.id })
    trackEvent('click', {
      recipeId: recommendation.recipe.id,
      category: 'add-favorites',
    })

    emit('addToFavorites', recommendation.recipe)
    ElMessage.success(`已添加 ${recommendation.recipe.name} 到收藏`)
  }

  function shareRecipe(recommendation: RecommendationItem) {
    // 实现分享功能
    if (navigator.share) {
      navigator
        .share({
          title: recommendation.recipe.name,
          text: recommendation.recipe.description,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      ElMessage.success('链接已复制到剪贴板')
    }

    trackEvent('share', {
      recipeId: recommendation.recipe.id,
      category: 'recipe-share',
    })
  }

  function viewDetails(recommendation: RecommendationItem) {
    console.log('查看菜谱详情:', recommendation.recipe)
    trackEvent('click', {
      recipeId: recommendation.recipe.id,
      category: 'view-details',
    })
    // 这里可以跳转到详情页或打开详情弹窗
  }

  function savePreferences() {
    updateUserPreferences(userPreferences.value)
    showPreferencesDialog.value = false
    ElMessage.success('偏好设置已保存')

    // 重新加载推荐
    loadRecommendations()
  }
</script>

<style scoped lang="scss">
  .enhanced-personalized-recommendations {
    background: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;

    .recommendations-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .header-content {
        .recommendations-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;

          .title-icon {
            font-size: 24px;
          }
        }

        .recommendations-subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .recommendation-categories {
      padding: 0 20px;
      background: var(--el-fill-color-lighter);

      .category-label {
        display: flex;
        align-items: center;
        gap: 6px;

        .category-icon {
          font-size: 16px;
        }
      }
    }

    .recommendations-content {
      padding: 20px;

      .loading-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;

        .recommendation-skeleton {
          border-radius: 12px;
          overflow: hidden;
          background: var(--el-fill-color-lighter);
        }
      }

      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;

        .recommendation-card {
          background: var(--el-bg-color);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

            .image-overlay {
              opacity: 1;
            }
          }

          .recommendation-reason {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 8px;

            .match-score {
              background: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
          }

          .recipe-image {
            position: relative;
            height: 200px;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }

            .image-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s ease;
            }

            &:hover img {
              transform: scale(1.05);
            }
          }

          .recipe-info {
            padding: 16px;

            .recipe-name {
              margin: 0 0 8px 0;
              font-size: 18px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              line-height: 1.3;
            }

            .recipe-description {
              margin: 0 0 12px 0;
              color: var(--el-text-color-regular);
              font-size: 14px;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              overflow: hidden;
            }

            .recipe-tags {
              margin-bottom: 12px;
              display: flex;
              gap: 6px;
              flex-wrap: wrap;
            }

            .recipe-stats {
              display: flex;
              gap: 16px;
              margin-bottom: 12px;

              .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: var(--el-text-color-secondary);

                .el-icon {
                  font-size: 14px;
                }
              }
            }

            .nutrition-preview {
              display: flex;
              gap: 12px;
              padding: 8px 0;
              border-top: 1px solid var(--el-border-color-lighter);

              .nutrition-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;

                .nutrition-label {
                  font-size: 11px;
                  color: var(--el-text-color-secondary);
                  margin-bottom: 2px;
                }

                .nutrition-value {
                  font-size: 12px;
                  font-weight: 600;
                  color: var(--el-color-primary);
                }
              }
            }
          }

          .recipe-actions {
            padding: 0 16px 16px 16px;

            .el-button-group {
              width: 100%;

              .el-button {
                flex: 1;
              }
            }
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        h3 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0 0 24px 0;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .preferences-form {
      .el-form-item {
        margin-bottom: 20px;
      }

      .el-checkbox-group,
      .el-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .recommendations-grid {
      grid-template-columns: 1fr !important;
    }

    .recommendations-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;

      .header-actions {
        justify-content: center;
      }
    }

    .recipe-stats {
      flex-direction: column;
      gap: 8px !important;
    }
  }
</style>
