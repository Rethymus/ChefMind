<template>
  <div class="ai-test-view min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">GLM AI 功能测试</h1>
        <p class="text-gray-600">测试智谱AI GLM模型在ChefMind中的集成效果</p>
      </div>

      <!-- GLM状态卡片 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-3 h-3 rounded-full" :class="glmStatusColor"></div>
          <h2 class="text-xl font-semibold">GLM API 状态</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat-card">
            <div class="text-sm text-gray-600">API状态</div>
            <div class="text-lg font-semibold" :class="glmStatusTextColor">
              {{ glmStatus }}
            </div>
          </div>
          <div class="stat-card">
            <div class="text-sm text-gray-600">API密钥</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ apiKeyStatus }}
            </div>
          </div>
          <div class="stat-card">
            <div class="text-sm text-gray-600">今日调用</div>
            <div class="text-lg font-semibold text-blue-600">
              {{ apiCallCount }}/100
            </div>
          </div>
        </div>
      </div>

      <!-- 功能测试区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 菜谱生成测试 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChefHat class="w-5 h-5 text-orange-600" />
            菜谱生成测试
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                选择食材（多选）
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="ingredient in testIngredients"
                  :key="ingredient"
                  @click="toggleIngredient(ingredient)"
                  class="px-3 py-1 text-sm rounded-full border transition-colors"
                  :class="selectedTestIngredients.includes(ingredient) 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'"
                >
                  {{ ingredient }}
                </button>
              </div>
            </div>
            
            <button
              @click="testRecipeGeneration"
              :disabled="selectedTestIngredients.length === 0 || isGenerating"
              class="w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
              <span>{{ isGenerating ? '生成中...' : '生成菜谱' }}</span>
            </button>
            
            <div v-if="generatedRecipe" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-2">{{ generatedRecipe.name }}</h4>
              <p class="text-sm text-gray-600 mb-3">{{ generatedRecipe.description }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>⏱️ {{ generatedRecipe.cookingTime }}分钟</span>
                <span>👥 {{ generatedRecipe.servings }}人份</span>
                <span v-if="generatedRecipe.aiGenerated" class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  AI生成
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 营养分析测试 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain class="w-5 h-5 text-green-600" />
            营养分析测试
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                输入菜谱描述
              </label>
              <textarea
                v-model="testRecipeText"
                placeholder="例如：红烧肉，使用五花肉500g、生抽、老抽、冰糖等制作..."
                class="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="3"
              ></textarea>
            </div>
            
            <button
              @click="testNutritionAnalysis"
              :disabled="!testRecipeText.trim() || isAnalyzing"
              class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isAnalyzing" class="w-4 h-4 animate-spin" />
              <span>{{ isAnalyzing ? '分析中...' : '分析营养' }}</span>
            </button>
            
            <div v-if="nutritionResult" class="mt-4 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
              <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ nutritionResult }}</pre>
            </div>
          </div>
        </div>

        <!-- 智能推荐测试 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-purple-600" />
            智能推荐测试
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                当前菜谱
              </label>
              <input
                v-model="currentRecipeForRecommendation"
                placeholder="例如：宫保鸡丁"
                class="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <button
              @click="testRecommendation"
              :disabled="!currentRecipeForRecommendation.trim() || isRecommending"
              class="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isRecommending" class="w-4 h-4 animate-spin" />
              <span>{{ isRecommending ? '推荐中...' : '获取推荐' }}</span>
            </button>
            
            <div v-if="recommendationResult" class="mt-4 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
              <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ recommendationResult }}</pre>
            </div>
          </div>
        </div>

        <!-- API调用日志 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText class="w-5 h-5 text-gray-600" />
            API调用日志
          </h3>
          
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="(log, index) in apiLogs"
              :key="index"
              class="p-2 bg-gray-50 rounded text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium" :class="log.success ? 'text-green-600' : 'text-red-600'">
                  {{ log.type }}
                </span>
                <span class="text-gray-500">{{ formatTime(log.timestamp) }}</span>
              </div>
              <div class="text-gray-600 mt-1">{{ log.message }}</div>
            </div>
            
            <div v-if="apiLogs.length === 0" class="text-center text-gray-500 py-4">
              暂无API调用记录
            </div>
          </div>
          
          <button
            @click="clearLogs"
            class="w-full mt-4 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            清除日志
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Loader2 
} from 'lucide-vue-next'
import { glmService } from '@/services/glmService'
import { recipeService } from '@/services/recipeService'
import type { Recipe } from '@/types/recipe'

// 响应式数据
const selectedTestIngredients = ref<string[]>([])
const testRecipeText = ref('')
const currentRecipeForRecommendation = ref('')
const generatedRecipe = ref<Recipe | null>(null)
const nutritionResult = ref('')
const recommendationResult = ref('')
const isGenerating = ref(false)
const isAnalyzing = ref(false)
const isRecommending = ref(false)
const apiCallCount = ref(0)

// API调用日志
interface ApiLog {
  type: string
  message: string
  timestamp: Date
  success: boolean
}

const apiLogs = ref<ApiLog[]>([])

// 测试数据
const testIngredients = [
  '鸡肉', '牛肉', '猪肉', '鱼肉', '虾',
  '土豆', '胡萝卜', '洋葱', '青椒', '西红柿',
  '大米', '面条', '豆腐', '鸡蛋', '蘑菇'
]

// 计算属性
const isGLMAvailable = computed(() => {
  return !!import.meta.env.GLM_API_KEY
})

const glmStatus = computed(() => {
  return isGLMAvailable.value ? '已连接' : '未配置'
})

const glmStatusColor = computed(() => {
  return isGLMAvailable.value ? 'bg-green-500' : 'bg-yellow-500'
})

const glmStatusTextColor = computed(() => {
  return isGLMAvailable.value ? 'text-green-600' : 'text-yellow-600'
})

const apiKeyStatus = computed(() => {
  if (!import.meta.env.GLM_API_KEY) return '未配置'
  const key = import.meta.env.GLM_API_KEY
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
})

// 方法
const toggleIngredient = (ingredient: string) => {
  const index = selectedTestIngredients.value.indexOf(ingredient)
  if (index > -1) {
    selectedTestIngredients.value.splice(index, 1)
  } else {
    selectedTestIngredients.value.push(ingredient)
  }
}

const addLog = (type: string, message: string, success: boolean = true) => {
  apiLogs.value.unshift({
    type,
    message,
    timestamp: new Date(),
    success
  })
  
  // 保持最多50条日志
  if (apiLogs.value.length > 50) {
    apiLogs.value = apiLogs.value.slice(0, 50)
  }
}

const testRecipeGeneration = async () => {
  if (selectedTestIngredients.value.length === 0) return
  
  try {
    isGenerating.value = true
    addLog('菜谱生成', `开始生成菜谱，食材：${selectedTestIngredients.value.join('、')}`)
    
    const request = {
      ingredients: selectedTestIngredients.value,
      methods: ['炒'],
      constraints: {
        cookingTime: 30,
        difficulty: 2,
        servings: 2,
        dietaryRestrictions: [],
        excludeIngredients: []
      }
    }
    
    const recipes = await recipeService.generateRecipes(request)
    generatedRecipe.value = recipes[0] || null
    apiCallCount.value++
    
    addLog('菜谱生成', `成功生成菜谱：${generatedRecipe.value?.name}`, true)
  } catch (error) {
    console.error('菜谱生成失败:', error)
    addLog('菜谱生成', `生成失败：${error}`, false)
  } finally {
    isGenerating.value = false
  }
}

const testNutritionAnalysis = async () => {
  if (!testRecipeText.value.trim()) return
  
  try {
    isAnalyzing.value = true
    addLog('营养分析', `开始分析菜谱营养`)
    
    // 创建一个临时的Recipe对象用于测试
    const tempRecipe: Recipe = {
      id: 'test',
      name: '测试菜谱',
      description: testRecipeText.value,
      ingredients: [],
      method: { id: '1', name: '炒', icon: '', description: '', difficulty: 1, time: 30 },
      steps: [{ 
        id: 1, 
        title: '测试步骤', 
        description: testRecipeText.value, 
        tips: '' 
      }],
      cookingTime: 30,
      difficulty: 2,
      servings: 2,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      tags: [],
      createdAt: new Date()
    }
    
    nutritionResult.value = await recipeService.analyzeRecipeNutrition(tempRecipe)
    apiCallCount.value++
    
    addLog('营养分析', '分析完成', true)
  } catch (error) {
    console.error('营养分析失败:', error)
    addLog('营养分析', `分析失败：${error}`, false)
  } finally {
    isAnalyzing.value = false
  }
}

const testRecommendation = async () => {
  if (!currentRecipeForRecommendation.value.trim()) return
  
  try {
    isRecommending.value = true
    addLog('智能推荐', `开始推荐相似菜谱`)
    
    recommendationResult.value = await glmService.recommendSimilarRecipes(
      currentRecipeForRecommendation.value
    )
    apiCallCount.value++
    
    addLog('智能推荐', '推荐完成', true)
  } catch (error) {
    console.error('推荐失败:', error)
    addLog('智能推荐', `推荐失败：${error}`, false)
  } finally {
    isRecommending.value = false
  }
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const clearLogs = () => {
  apiLogs.value = []
}

// 组件挂载时加载API使用统计
onMounted(() => {
  const today = new Date().toDateString()
  const stored = localStorage.getItem(`glm_usage_${today}`)
  if (stored) {
    apiCallCount.value = parseInt(stored, 10) || 0
  }
})
</script>

<style scoped>
.test-card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.stat-card {
  @apply p-3 bg-gray-50 rounded-lg;
}
</style>