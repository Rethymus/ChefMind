<template>
  <div class="ai-hub">
    <div class="hub-header">
      <h2>🤖 ChefMind AI 智能中心</h2>
      <p class="hub-subtitle">体验 AI 驱动的智能烹饪助手</p>
    </div>

    <!-- AI 功能导航 -->
    <div class="ai-navigation">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="🔍 食材识别" name="ingredient-analyzer">
          <SmartIngredientAnalyzer 
            @add-ingredient="handleAddIngredient"
            @generate-recipe="handleGenerateRecipe"
          />
        </el-tab-pane>
        
        <el-tab-pane label="🥗 营养分析" name="nutrition-analyzer">
          <NutritionAnalyzer :recipe="selectedRecipe" />
        </el-tab-pane>
        
        <el-tab-pane label="👨‍🍳 烹饪助手" name="cooking-assistant">
          <CookingAssistant 
            :recipe="selectedRecipe"
            @recipe-completed="handleRecipeCompleted"
            @share-recipe="handleShareRecipe"
          />
        </el-tab-pane>
        
        <el-tab-pane label="🎯 个性化推荐" name="personalized-recommendations">
          <PersonalizedRecommendations 
            @recipe-selected="handleRecipeSelected"
            @start-cooking="handleStartCooking"
            @add-to-favorites="handleAddToFavorites"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 快速操作面板 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <div class="actions-grid">
        <el-card class="action-card" @click="switchToTab('ingredient-analyzer')">
          <div class="action-icon">📸</div>
          <h4>拍照识别食材</h4>
          <p>上传食材图片，AI 自动识别并分析营养</p>
        </el-card>
        
        <el-card class="action-card" @click="generateRandomRecipe">
          <div class="action-icon">🎲</div>
          <h4>随机生成食谱</h4>
          <p>让 AI 为您推荐一道惊喜菜谱</p>
        </el-card>
        
        <el-card class="action-card" @click="openSmartSearch">
          <div class="action-icon">🔍</div>
          <h4>智能搜索</h4>
          <p>描述您想要的菜品，AI 帮您找到</p>
        </el-card>
        
        <el-card class="action-card" @click="switchToTab('cooking-assistant')">
          <div class="action-icon">👨‍🍳</div>
          <h4>开始烹饪</h4>
          <p>AI 实时指导，让烹饪变得简单</p>
        </el-card>
        
        <el-card class="action-card" @click="openProviderSettings">
          <div class="action-icon">⚙️</div>
          <h4>AI 设置</h4>
          <p>配置 AI 服务提供商和参数</p>
        </el-card>
        
        <el-card class="action-card" @click="openGLMTester">
          <div class="action-icon">🧪</div>
          <h4>智普API测试</h4>
          <p>测试智普API连接和配置</p>
        </el-card>
      </div>
    </div>

    <!-- AI 统计信息 -->
    <div class="ai-stats">
      <h3>AI 使用统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ aiStats.recipesGenerated }}</div>
          <div class="stat-label">生成食谱</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ aiStats.ingredientsRecognized }}</div>
          <div class="stat-label">识别食材</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ aiStats.cookingSessions }}</div>
          <div class="stat-label">烹饪指导</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ aiStats.nutritionAnalyses }}</div>
          <div class="stat-label">营养分析</div>
        </div>
      </div>
    </div>

    <!-- 智能搜索对话框 -->
    <el-dialog v-model="smartSearchVisible" title="🔍 AI 智能搜索" width="600px">
      <div class="smart-search-content">
        <el-input
          v-model="searchQuery"
          type="textarea"
          :rows="3"
          placeholder="描述您想要的菜品，例如：我想要一道适合减肥的低热量素食..."
          maxlength="200"
          show-word-limit
        />
        <div class="search-suggestions">
          <h4>搜索建议：</h4>
          <el-tag 
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            @click="searchQuery = suggestion"
            class="suggestion-tag"
          >
            {{ suggestion }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="smartSearchVisible = false">取消</el-button>
        <el-button type="primary" @click="performSmartSearch" :loading="isSearching">
          <el-icon><Search /></el-icon>
          智能搜索
        </el-button>
      </template>
    </el-dialog>

    <!-- 搜索结果对话框 -->
    <el-dialog v-model="searchResultsVisible" title="搜索结果" width="80%">
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="results-grid">
          <div 
            v-for="recipe in searchResults"
            :key="recipe.id"
            class="result-card"
            @click="selectSearchResult(recipe)"
          >
            <img :src="getRecipeImage(recipe)" :alt="recipe.title" class="result-image" />
            <div class="result-content">
              <h5>{{ recipe.title }}</h5>
              <p>{{ recipe.description }}</p>
              <div class="result-meta">
                <span>{{ recipe.cookingTime }}分钟</span>
                <span>{{ recipe.difficulty }}</span>
                <el-tag size="small" type="success">
                  AI 推荐
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        <p>未找到匹配的食谱，请尝试调整搜索条件</p>
      </div>
    </el-dialog>

    <!-- AI 提供商设置对话框 -->
    <el-dialog v-model="providerSettingsVisible" title="⚙️ AI 提供商设置" width="90%" max-width="800px">
      <AIProviderSettings />
    </el-dialog>

    <!-- 智普API测试对话框 -->
    <el-dialog v-model="glmTesterVisible" title="🧪 智普API测试" width="90%" max-width="800px">
      <GLMAPITester />
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import SmartIngredientAnalyzer from './SmartIngredientAnalyzer.vue'
import NutritionAnalyzer from './NutritionAnalyzer.vue'
import CookingAssistant from './CookingAssistant.vue'
import PersonalizedRecommendations from './PersonalizedRecommendations.vue'
import AIProviderSettings from './AIProviderSettings.vue'
import GLMAPITester from './GLMAPITester.vue'
import { aiService, type RecipeGenerationResult } from '@/services/aiService'

// 定义食谱推荐类型（临时兼容）
type RecipeRecommendation = RecipeGenerationResult

// 组件事件
const emit = defineEmits<{
  recipeSelected: [recipe: RecipeRecommendation]
  ingredientAdded: [ingredient: string]
  recipeCompleted: [recipe: RecipeRecommendation, rating: number]
}>()

// 响应式数据
const activeTab = ref('ingredient-analyzer')
const selectedRecipe = ref<RecipeRecommendation>()
const smartSearchVisible = ref(false)
const searchResultsVisible = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<RecipeRecommendation[]>([])
const providerSettingsVisible = ref(false)
const glmTesterVisible = ref(false)

// AI 统计数据
const aiStats = reactive({
  recipesGenerated: 0,
  ingredientsRecognized: 0,
  cookingSessions: 0,
  nutritionAnalyses: 0
})

// 搜索建议
const searchSuggestions = [
  '适合减肥的低热量菜品',
  '儿童喜欢的营养早餐',
  '15分钟快手家常菜',
  '素食主义者的蛋白质来源',
  '适合糖尿病人的低糖菜谱',
  '老人易消化的软烂菜品',
  '健身增肌的高蛋白餐',
  '孕妇营养补充菜谱'
]

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  console.log('切换到标签页:', tabName)
  
  // 更新统计数据
  switch (tabName) {
    case 'nutrition-analyzer':
      aiStats.nutritionAnalyses++
      break
    case 'cooking-assistant':
      aiStats.cookingSessions++
      break
  }
}

// 切换到指定标签页
const switchToTab = (tabName: string) => {
  activeTab.value = tabName
}

// 处理添加食材
const handleAddIngredient = (ingredient: string) => {
  emit('ingredientAdded', ingredient)
  ElMessage.success(`已添加食材: ${ingredient}`)
  aiStats.ingredientsRecognized++
}

// 处理生成食谱
const handleGenerateRecipe = (_ingredients: string[]) => {
  aiStats.recipesGenerated++
  ElMessage.success('正在基于识别的食材生成食谱...')
  // 这里可以触发食谱生成逻辑
}

// 处理食谱选择
const handleRecipeSelected = (recipe: RecipeRecommendation) => {
  selectedRecipe.value = recipe
  emit('recipeSelected', recipe)
  ElMessage.success(`已选择食谱: ${recipe.title}`)
}

// 处理开始烹饪
const handleStartCooking = (recipe: RecipeRecommendation) => {
  selectedRecipe.value = recipe
  activeTab.value = 'cooking-assistant'
  aiStats.cookingSessions++
}

// 处理添加到收藏
const handleAddToFavorites = (recipe: RecipeRecommendation) => {
  ElMessage.success(`已添加 ${recipe.title} 到收藏`)
}

// 处理食谱完成
const handleRecipeCompleted = (recipe: RecipeRecommendation, rating: number) => {
  emit('recipeCompleted', recipe, rating)
  ElMessage.success('烹饪完成！感谢您的评分')
}

// 处理分享食谱
const handleShareRecipe = (recipe: RecipeRecommendation) => {
  ElMessage.success(`正在分享 ${recipe.title}`)
}

// 生成随机食谱
const generateRandomRecipe = async () => {
  try {
    const randomIngredients = ['随机食材']
    const recipe = await aiService.generateRecipe(randomIngredients, {
      difficulty: 'easy',
      servings: 2
    })
    
    selectedRecipe.value = recipe
    activeTab.value = 'nutrition-analyzer'
    aiStats.recipesGenerated++
    
    ElMessage.success('已为您生成随机食谱！')
  } catch (error) {
    console.error('生成随机食谱失败:', error)
    ElMessage.error('生成随机食谱失败')
  }
}

// 打开智能搜索
const openSmartSearch = () => {
  smartSearchVisible.value = true
  searchQuery.value = ''
}

// 打开提供商设置
const openProviderSettings = () => {
  providerSettingsVisible.value = true
}

// 打开智普API测试器
const openGLMTester = () => {
  glmTesterVisible.value = true
}

// 执行智能搜索
const performSmartSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  isSearching.value = true
  
  try {
    // 使用AI服务生成基于搜索的食谱推荐
    const recommendations = await aiService.getPersonalizedRecommendations(
      [], 
      { searchQuery: searchQuery.value }, 
      5
    )
    
    searchResults.value = recommendations.map(rec => rec.recipe)
    smartSearchVisible.value = false
    searchResultsVisible.value = true
    
    ElMessage.success(`找到 ${searchResults.value.length} 个匹配的食谱`)
  } catch (error) {
    console.error('智能搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    isSearching.value = false
  }
}

// 选择搜索结果
const selectSearchResult = (recipe: RecipeRecommendation) => {
  selectedRecipe.value = recipe
  searchResultsVisible.value = false
  activeTab.value = 'nutrition-analyzer'
  
  emit('recipeSelected', recipe)
}

// 获取食谱图片
const getRecipeImage = (recipe: RecipeRecommendation) => {
  return `https://picsum.photos/300/200?random=${recipe.id}`
}

// 加载统计数据
const loadAIStats = () => {
  // 从本地存储或服务器加载统计数据
  const savedStats = localStorage.getItem('chefmind-ai-stats')
  if (savedStats) {
    const stats = JSON.parse(savedStats)
    Object.assign(aiStats, stats)
  }
}

// 保存统计数据
const saveAIStats = () => {
  localStorage.setItem('chefmind-ai-stats', JSON.stringify(aiStats))
}

// 组件挂载
onMounted(() => {
  loadAIStats()
  
  // 定期保存统计数据
  setInterval(saveAIStats, 30000) // 每30秒保存一次
})
</script>

<style scoped lang="scss">
.ai-hub {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .hub-header {
    text-align: center;
    margin-bottom: 32px;
    
    h2 {
      margin: 0 0 12px 0;
      color: var(--el-text-color-primary);
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-success));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hub-subtitle {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 16px;
      line-height: 1.5;
    }
  }

  .ai-navigation {
    margin-bottom: 40px;
    
    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }
    
    :deep(.el-tabs__item) {
      font-size: 16px;
      font-weight: 500;
      padding: 0 24px;
    }
    
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }

  .quick-actions {
    margin-bottom: 40px;
    
    h3 {
      margin: 0 0 20px 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
      font-weight: 600;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      
      .action-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 12px;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--el-color-primary);
        }
        
        :deep(.el-card__body) {
          text-align: center;
          padding: 24px;
        }
        
        .action-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }
        
        h4 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
          font-size: 16px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: var(--el-text-color-secondary);
          font-size: 14px;
          line-height: 1.4;
        }
      }
    }
  }

  .ai-stats {
    h3 {
      margin: 0 0 20px 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
      font-weight: 600;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      
      .stat-item {
        text-align: center;
        padding: 24px;
        background: var(--el-fill-color-lighter);
        border-radius: 12px;
        border: 1px solid var(--el-border-color-light);
        
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--el-color-primary);
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          font-weight: 500;
        }
      }
    }
  }

  .smart-search-content {
    .search-suggestions {
      margin-top: 20px;
      
      h4 {
        margin: 0 0 12px 0;
        color: var(--el-text-color-primary);
        font-size: 14px;
        font-weight: 600;
      }
      
      .suggestion-tag {
        margin: 0 8px 8px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: var(--el-color-primary);
          color: white;
        }
      }
    }
  }

  .search-results {
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      
      .result-card {
        display: flex;
        background: var(--el-bg-color);
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--el-border-color-light);
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-color: var(--el-color-primary);
        }
        
        .result-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          flex-shrink: 0;
        }
        
        .result-content {
          padding: 16px;
          flex: 1;
          
          h5 {
            margin: 0 0 8px 0;
            color: var(--el-text-color-primary);
            font-size: 14px;
            font-weight: 600;
          }
          
          p {
            margin: 0 0 12px 0;
            color: var(--el-text-color-secondary);
            font-size: 12px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .result-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .no-results {
    text-align: center;
    padding: 40px 20px;
    color: var(--el-text-color-secondary);
  }
}

@media (max-width: 768px) {
  .ai-hub {
    padding: 16px;
    
    .hub-header h2 {
      font-size: 24px;
    }
    
    .actions-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .results-grid {
      grid-template-columns: 1fr;
      
      .result-card {
        flex-direction: column;
        
        .result-image {
          width: 100%;
          height: 150px;
        }
      }
    }
  }
}
</style>