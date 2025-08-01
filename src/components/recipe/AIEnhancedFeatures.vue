<template>
  <div class="ai-enhanced-features">
    <!-- AI功能状态指示器 -->
    <div class="ai-status-indicator mb-4">
      <div class="flex items-center gap-2 p-3 rounded-lg" :class="aiStatusClass">
        <component :is="aiStatusIcon" class="w-5 h-5" />
        <span class="text-sm font-medium">{{ aiStatusText }}</span>
      </div>
    </div>

    <!-- AI功能面板 -->
    <div class="ai-features-panel space-y-4">
      <!-- 智能营养分析 -->
      <div class="feature-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Brain class="w-5 h-5 text-blue-600" />
            <h3 class="font-semibold text-gray-900">智能营养分析</h3>
          </div>
          <button
            @click="analyzeNutrition"
            :disabled="!currentRecipe || isAnalyzing"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isAnalyzing" class="w-4 h-4 animate-spin" />
            <span v-else>分析</span>
          </button>
        </div>
        
        <div v-if="nutritionAnalysis" class="nutrition-result">
          <div class="bg-gray-50 p-3 rounded-lg text-sm">
            <pre class="whitespace-pre-wrap text-gray-700">{{ nutritionAnalysis }}</pre>
          </div>
        </div>
        
        <div v-else class="text-gray-500 text-sm">
          选择一个菜谱后，AI将为您提供详细的营养分析和健康建议
        </div>
      </div>

      <!-- 智能推荐 -->
      <div class="feature-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-purple-600" />
            <h3 class="font-semibold text-gray-900">智能推荐</h3>
          </div>
          <button
            @click="getRecommendations"
            :disabled="!selectedIngredients.length || isRecommending"
            class="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isRecommending" class="w-4 h-4 animate-spin" />
            <span v-else>推荐</span>
          </button>
        </div>
        
        <div v-if="recommendations.length > 0" class="recommendations-list space-y-2">
          <div
            v-for="recipe in recommendations"
            :key="recipe.id"
            class="recommendation-item p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            @click="$emit('selectRecipe', recipe)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">{{ recipe.name }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ recipe.description }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    AI推荐
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ recipe.cookingTime }}分钟
                  </span>
                </div>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div v-else class="text-gray-500 text-sm">
          选择食材后，AI将为您推荐相关的美味菜谱
        </div>
      </div>

      <!-- AI生成标识 -->
      <div v-if="currentRecipe?.aiGenerated" class="ai-generated-badge">
        <div class="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <Zap class="w-5 h-5 text-blue-600" />
          <div>
            <p class="text-sm font-medium text-blue-900">AI生成菜谱</p>
            <p class="text-xs text-blue-700">此菜谱由GLM AI智能生成，经过营养和口味优化</p>
          </div>
        </div>
      </div>

      <!-- 智能推荐功能 -->
      <div class="smart-features">
        <SmartRecommendation :current-recipe="currentRecipe" />
      </div>

      <!-- GLM API使用统计 -->
      <div class="api-usage-stats">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-2">
            <BarChart3 class="w-4 h-4 text-gray-600" />
            <span class="text-sm text-gray-700">今日AI调用</span>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ apiUsageCount }}/100</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Brain, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Loader2, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  // XCircle // 暂时未使用
} from 'lucide-vue-next'
import type { Recipe, Ingredient } from '@/types/recipe'
import { recipeService } from '@/services/recipeService'
import SmartRecommendation from './SmartRecommendation.vue'

// Props
interface Props {
  currentRecipe?: Recipe | null
  selectedIngredients?: Ingredient[]
}

const props = withDefaults(defineProps<Props>(), {
  currentRecipe: null,
  selectedIngredients: () => []
})

// Emits
const emit = defineEmits<{
  selectRecipe: [recipe: Recipe]
}>()

// 响应式数据
const nutritionAnalysis = ref<string>('')
const recommendations = ref<Recipe[]>([])
const isAnalyzing = ref(false)
const isRecommending = ref(false)
const apiUsageCount = ref(0)

// GLM API状态
const isGLMAvailable = computed(() => {
  return !!import.meta.env.GLM_API_KEY
})

const aiStatusClass = computed(() => {
  if (isGLMAvailable.value) {
    return 'bg-green-50 border border-green-200 text-green-800'
  } else {
    return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
  }
})

const aiStatusIcon = computed(() => {
  if (isGLMAvailable.value) {
    return CheckCircle
  } else {
    return AlertCircle
  }
})

const aiStatusText = computed(() => {
  if (isGLMAvailable.value) {
    return 'GLM AI已连接 - 智能功能已启用'
  } else {
    return '使用模拟数据 - 请配置GLM API密钥以启用完整AI功能'
  }
})

// 方法
const analyzeNutrition = async () => {
  if (!props.currentRecipe) return
  
  try {
    isAnalyzing.value = true
    nutritionAnalysis.value = await recipeService.analyzeRecipeNutrition(props.currentRecipe)
    apiUsageCount.value++
  } catch (error) {
    console.error('营养分析失败:', error)
    nutritionAnalysis.value = '分析失败，请稍后重试'
  } finally {
    isAnalyzing.value = false
  }
}

const getRecommendations = async () => {
  if (!props.selectedIngredients?.length) return
  
  try {
    isRecommending.value = true
    const ingredientNames = props.selectedIngredients.map(ing => ing.name)
    recommendations.value = await recipeService.getRecommendedRecipes(ingredientNames)
    apiUsageCount.value++
  } catch (error) {
    console.error('获取推荐失败:', error)
    recommendations.value = []
  } finally {
    isRecommending.value = false
  }
}

// 监听当前菜谱变化，自动清除之前的分析结果
watch(() => props.currentRecipe, () => {
  nutritionAnalysis.value = ''
})

// 监听选中食材变化，自动清除推荐结果
watch(() => props.selectedIngredients, () => {
  recommendations.value = []
}, { deep: true })

// 从localStorage加载API使用统计
const loadApiUsage = () => {
  const today = new Date().toDateString()
  const stored = localStorage.getItem(`glm_usage_${today}`)
  if (stored) {
    apiUsageCount.value = parseInt(stored, 10) || 0
  }
}

// 保存API使用统计
watch(apiUsageCount, (newCount) => {
  const today = new Date().toDateString()
  localStorage.setItem(`glm_usage_${today}`, newCount.toString())
})

// 组件挂载时加载使用统计
loadApiUsage()
</script>

<style scoped>
.feature-card {
  @apply p-4 bg-white border border-gray-200 rounded-lg shadow-sm;
}

.recommendation-item {
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nutrition-result {
  max-height: 200px;
  overflow-y: auto;
}

.ai-generated-badge {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  to {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
}
</style>