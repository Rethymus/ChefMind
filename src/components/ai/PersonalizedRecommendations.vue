<template>
  <div class="personalized-recommendations">
    <el-card class="recommendations-card">
      <template #header>
        <div class="card-header">
          <h3>🎯 个性化推荐</h3>
          <p class="subtitle">基于您的喜好和历史，AI 为您精选食谱</p>
        </div>
      </template>

      <!-- 用户偏好设置 -->
      <div class="preferences-section">
        <h4>告诉我们您的偏好</h4>
        <el-form :model="userPreferences" label-width="100px" size="small">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="口味偏好">
                <el-select v-model="userPreferences.taste" multiple placeholder="选择口味">
                  <el-option label="清淡" value="light" />
                  <el-option label="重口味" value="heavy" />
                  <el-option label="甜味" value="sweet" />
                  <el-option label="辣味" value="spicy" />
                  <el-option label="酸味" value="sour" />
                  <el-option label="咸鲜" value="salty" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜系偏好">
                <el-select v-model="userPreferences.cuisine" multiple placeholder="选择菜系">
                  <el-option label="川菜" value="sichuan" />
                  <el-option label="粤菜" value="cantonese" />
                  <el-option label="湘菜" value="hunan" />
                  <el-option label="鲁菜" value="shandong" />
                  <el-option label="苏菜" value="jiangsu" />
                  <el-option label="浙菜" value="zhejiang" />
                  <el-option label="闽菜" value="fujian" />
                  <el-option label="徽菜" value="anhui" />
                  <el-option label="西餐" value="western" />
                  <el-option label="日料" value="japanese" />
                  <el-option label="韩料" value="korean" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="难度偏好">
                <el-select v-model="userPreferences.difficulty" placeholder="选择难度">
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="烹饪时间">
                <el-select v-model="userPreferences.cookingTime" placeholder="选择时间">
                  <el-option label="15分钟内" value="quick" />
                  <el-option label="30分钟内" value="medium" />
                  <el-option label="1小时内" value="long" />
                  <el-option label="不限时间" value="unlimited" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        
        <div class="preference-actions">
          <el-button type="primary" @click="updatePreferences" :loading="isUpdatingPreferences">
            <el-icon><Refresh /></el-icon>
            更新偏好并获取推荐
          </el-button>
          <el-button @click="resetPreferences">
            <el-icon><Delete /></el-icon>
            重置偏好
          </el-button>
        </div>
      </div>

      <!-- 推荐类型选择 -->
      <div class="recommendation-types">
        <h4>推荐类型</h4>
        <el-radio-group v-model="recommendationType" @change="loadRecommendations">
          <el-radio-button label="daily">今日推荐</el-radio-button>
          <el-radio-button label="trending">热门食谱</el-radio-button>
          <el-radio-button label="seasonal">时令菜谱</el-radio-button>
          <el-radio-button label="healthy">健康食谱</el-radio-button>
          <el-radio-button label="quick">快手菜</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 推荐结果 -->
      <div v-if="isLoading" class="loading-section">
        <el-skeleton :rows="3" animated />
        <p class="loading-text">AI 正在为您精选食谱...</p>
      </div>

      <div v-else-if="recommendations.length > 0" class="recommendations-results">
        <div class="results-header">
          <h4>
            <el-icon><Star /></el-icon>
            为您推荐 ({{ recommendations.length }} 个)
          </h4>
          <div class="filter-options">
            <el-select v-model="sortBy" @change="sortRecommendations" size="small">
              <el-option label="推荐度" value="confidence" />
              <el-option label="评分" value="rating" />
              <el-option label="烹饪时间" value="cookingTime" />
              <el-option label="难度" value="difficulty" />
            </el-select>
          </div>
        </div>

        <div class="recommendations-grid">
          <div 
            v-for="recipe in sortedRecommendations" 
            :key="recipe.id"
            class="recommendation-card"
            @click="selectRecipe(recipe)"
          >
            <div class="card-image">
              <img :src="getRecipeImage(recipe)" :alt="recipe.title" />
              <div class="confidence-badge">
                <el-tag :type="getConfidenceType(recipe.confidence)" size="small">
                  匹配度 {{ (recipe.confidence * 100).toFixed(0) }}%
                </el-tag>
              </div>
            </div>
            
            <div class="card-content">
              <h5 class="recipe-title">{{ recipe.title }}</h5>
              <p class="recipe-description">{{ recipe.description }}</p>
              
              <div class="recipe-meta">
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ recipe.cookingTime }}分钟</span>
                </div>
                <div class="meta-item">
                  <el-icon><TrendCharts /></el-icon>
                  <span>{{ recipe.difficulty }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ recipe.servings }}人份</span>
                </div>
              </div>
              
              <div class="recipe-tags">
                <el-tag 
                  v-for="tag in recipe.tags?.slice(0, 3)" 
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              
              <div class="recipe-reasoning">
                <el-icon class="reasoning-icon"><Opportunity /></el-icon>
                <span class="reasoning-text">{{ recipe.reasoning }}</span>
              </div>
            </div>
            
            <div class="card-actions">
              <el-button size="small" type="primary" @click.stop="cookRecipe(recipe)">
                <el-icon><Star /></el-icon>
                开始烹饪
              </el-button>
              <el-button size="small" @click.stop="addToFavorites(recipe)">
                <el-icon><Star /></el-icon>
                收藏
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more-section">
          <el-button 
            @click="loadMoreRecommendations" 
            :loading="isLoadingMore"
            size="large"
            style="width: 100%"
          >
            <el-icon><Plus /></el-icon>
            {{ isLoadingMore ? '加载中...' : '加载更多推荐' }}
          </el-button>
        </div>
      </div>

      <div v-else class="no-recommendations">
        <div class="empty-state">
          <el-icon class="empty-icon"><DocumentRemove /></el-icon>
          <h4>暂无推荐</h4>
          <p>请完善您的偏好设置，我们将为您提供更精准的推荐</p>
          <el-button type="primary" @click="updatePreferences">
            设置偏好
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Delete,
  Star,
  Clock,
  TrendCharts,
  User,
  Opportunity,
  Plus,
  DocumentRemove
} from '@element-plus/icons-vue'
import { aiService } from '@/services/aiService'

// 定义推荐类型
interface RecipeRecommendation {
  id: string
  title: string
  description: string
  cookingTime: number
  difficulty: string
  servings: number
  tags?: string[]
  reasoning: string
  confidence: number
  ingredients: string[]
  instructions: string[]
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// 组件事件
const emit = defineEmits<{
  recipeSelected: [recipe: RecipeRecommendation]
  startCooking: [recipe: RecipeRecommendation]
  addToFavorites: [recipe: RecipeRecommendation]
}>()

// 响应式数据
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isUpdatingPreferences = ref(false)
const recommendations = ref<RecipeRecommendation[]>([])
const recommendationType = ref('daily')
const sortBy = ref('confidence')

// 用户偏好
const userPreferences = reactive({
  taste: [] as string[],
  cuisine: [] as string[],
  difficulty: '',
  cookingTime: '',
  dietary: [] as string[],
  allergens: [] as string[]
})

// 计算属性
const sortedRecommendations = computed(() => {
  const sorted = [...recommendations.value]
  
  switch (sortBy.value) {
    case 'confidence':
      return sorted.sort((a, b) => b.confidence - a.confidence)
    case 'rating':
      return sorted.sort((a, b) => (b as any).rating - (a as any).rating)
    case 'cookingTime':
      return sorted.sort((a, b) => a.cookingTime - b.cookingTime)
    case 'difficulty': {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }
      return sorted.sort((a, b) => 
        (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 2) - 
        (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 2)
      )
    }
    default:
      return sorted
  }
})

// 监听推荐类型变化
watch(recommendationType, () => {
  loadRecommendations()
})

// 更新偏好
const updatePreferences = async () => {
  isUpdatingPreferences.value = true
  
  try {
    // 这里应该保存用户偏好到后端
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('偏好设置已更新')
    await loadRecommendations()
  } catch (error) {
    console.error('更新偏好失败:', error)
    ElMessage.error('更新偏好失败')
  } finally {
    isUpdatingPreferences.value = false
  }
}

// 重置偏好
const resetPreferences = () => {
  userPreferences.taste = []
  userPreferences.cuisine = []
  userPreferences.difficulty = ''
  userPreferences.cookingTime = ''
  userPreferences.dietary = []
  userPreferences.allergens = []
  
  ElMessage.success('偏好已重置')
}

// 加载推荐
const loadRecommendations = async () => {
  isLoading.value = true
  
  try {
    // 获取用户历史数据（从本地存储或用户服务）
    const userHistory = getUserHistory()
    const newRecommendations = await aiService.getPersonalizedRecommendations(
      userHistory,
      { ...userPreferences, type: recommendationType.value },
      10
    )
    
    recommendations.value = newRecommendations
    
  } catch (error) {
    console.error('加载推荐失败:', error)
    ElMessage.error('加载推荐失败')
  } finally {
    isLoading.value = false
  }
}

// 加载更多推荐
const loadMoreRecommendations = async () => {
  isLoadingMore.value = true
  
  try {
    // 获取用户历史数据
    const userHistory = getUserHistory()
    const moreRecommendations = await aiService.getPersonalizedRecommendations(
      userHistory,
      { ...userPreferences, type: recommendationType.value },
      5
    )
    
    recommendations.value.push(...moreRecommendations)
  } catch (error) {
    console.error('加载更多推荐失败:', error)
    ElMessage.error('加载更多推荐失败')
  } finally {
    isLoadingMore.value = false
  }
}

// 排序推荐
const sortRecommendations = () => {
  // 触发计算属性重新计算
}

// 选择食谱
const selectRecipe = (recipe: RecipeRecommendation) => {
  emit('recipeSelected', recipe)
}

// 开始烹饪
const cookRecipe = (recipe: RecipeRecommendation) => {
  emit('startCooking', recipe)
  ElMessage.success(`开始烹饪 ${recipe.title}`)
}

// 添加到收藏
const addToFavorites = (recipe: RecipeRecommendation) => {
  emit('addToFavorites', recipe)
  ElMessage.success(`已添加 ${recipe.title} 到收藏`)
}

// 获取置信度类型
const getConfidenceType = (confidence: number) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'info'
}

// 获取食谱图片
const getRecipeImage = (recipe: RecipeRecommendation) => {
  // 这里应该返回实际的图片URL
  return `https://picsum.photos/300/200?random=${recipe.id}`
}

// 获取用户历史数据
const getUserHistory = () => {
  // 从本地存储获取用户历史数据
  const savedHistory = localStorage.getItem('chefmind-user-history')
  if (savedHistory) {
    try {
      return JSON.parse(savedHistory)
    } catch (error) {
      console.error('解析用户历史数据失败:', error)
    }
  }
  
  // 返回空数组作为默认值
  return []
}

// 组件挂载
onMounted(() => {
  loadRecommendations()
})
</script>

<style scoped lang="scss">
.personalized-recommendations {
  .recommendations-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    text-align: center;
    
    h3 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
      font-weight: 600;
    }
    
    .subtitle {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .preferences-section {
    margin-bottom: 32px;
    padding: 24px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    
    h4 {
      margin: 0 0 20px 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
    
    .preference-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 20px;
    }
  }

  .recommendation-types {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
  }

  .loading-section {
    text-align: center;
    padding: 40px 20px;
    
    .loading-text {
      margin-top: 16px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .recommendations-results {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .recommendation-card {
      background: var(--el-bg-color);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--el-border-color-light);
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--el-color-primary);
      }
      
      .card-image {
        position: relative;
        height: 180px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        &:hover img {
          transform: scale(1.05);
        }
        
        .confidence-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }
      }
      
      .card-content {
        padding: 20px;
        
        .recipe-title {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
          font-size: 16px;
          font-weight: 600;
          line-height: 1.4;
        }
        
        .recipe-description {
          margin: 0 0 16px 0;
          color: var(--el-text-color-secondary);
          font-size: 14px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .recipe-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
        
        .recipe-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        
        .recipe-reasoning {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: var(--el-color-primary-light-9);
          border-radius: 6px;
          border-left: 3px solid var(--el-color-primary);
          
          .reasoning-icon {
            color: var(--el-color-primary);
            margin-top: 2px;
            flex-shrink: 0;
          }
          
          .reasoning-text {
            font-size: 12px;
            line-height: 1.4;
            color: var(--el-text-color-regular);
          }
        }
      }
      
      .card-actions {
        display: flex;
        justify-content: space-between;
        padding: 16px 20px;
        background: var(--el-fill-color-lighter);
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }
    
    .load-more-section {
      text-align: center;
    }
  }

  .no-recommendations {
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      
      .empty-icon {
        font-size: 64px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }
      
      h4 {
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
        font-size: 18px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 24px 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .personalized-recommendations {
    .preferences-section {
      padding: 16px;
      
      .preference-actions {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
    }
    
    .recommendations-grid {
      grid-template-columns: 1fr;
    }
    
    .recommendation-card {
      .recipe-meta {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
      
      .card-actions {
        flex-direction: column;
        gap: 8px;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>