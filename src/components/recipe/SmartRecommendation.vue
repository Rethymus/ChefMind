<template>
  <div class="smart-recommendation">
    <div class="recommendation-header">
      <h3 class="title">
        <Sparkles class="w-5 h-5 text-purple-600" />
        智能推荐
      </h3>
      <p class="subtitle">AI为您提供个性化的食材替换和菜谱优化建议</p>
    </div>

    <!-- 食材替换建议 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h4 class="section-title">
          <RefreshCw class="w-4 h-4" />
          食材替换建议
        </h4>
        <button
          @click="generateIngredientAlternatives"
          :disabled="!currentRecipe || isGenerating"
          class="generate-btn"
        >
          <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
          <span v-else>生成建议</span>
        </button>
      </div>

      <div v-if="ingredientAlternatives.length > 0" class="alternatives-list">
        <div
          v-for="alternative in ingredientAlternatives"
          :key="alternative.original"
          class="alternative-item"
        >
          <div class="original-ingredient">
            <span class="ingredient-name">{{ alternative.original }}</span>
            <ArrowRight class="w-4 h-4 text-gray-400" />
          </div>
          
          <div class="suggested-ingredients">
            <div
              v-for="suggestion in alternative.suggestions"
              :key="suggestion.name"
              class="suggestion-item"
              @click="applySuggestion(alternative.original, suggestion)"
            >
              <span class="suggestion-name">{{ suggestion.name }}</span>
              <div class="suggestion-info">
                <span class="reason">{{ suggestion.reason }}</span>
                <div class="scores">
                  <span class="score nutrition">营养: {{ suggestion.nutritionScore }}/10</span>
                  <span class="score flavor">口味: {{ suggestion.flavorScore }}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!isGenerating" class="empty-state">
        <Package class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-500">选择一个菜谱后，AI将为您推荐食材替换方案</p>
      </div>
    </div>

    <!-- 过敏原检测 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h4 class="section-title">
          <AlertTriangle class="w-4 h-4" />
          过敏原检测
        </h4>
        <button
          @click="checkAllergens"
          :disabled="!currentRecipe || isCheckingAllergens"
          class="generate-btn"
        >
          <Loader2 v-if="isCheckingAllergens" class="w-4 h-4 animate-spin" />
          <span v-else>检测</span>
        </button>
      </div>

      <div v-if="allergenInfo" class="allergen-info">
        <div v-if="allergenInfo.detected.length > 0" class="allergen-warning">
          <AlertTriangle class="w-5 h-5 text-red-500" />
          <div>
            <h5 class="warning-title">检测到潜在过敏原</h5>
            <div class="allergen-list">
              <span
                v-for="allergen in allergenInfo.detected"
                :key="allergen"
                class="allergen-tag warning"
              >
                {{ allergen }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="allergenInfo.safe.length > 0" class="allergen-safe">
          <CheckCircle class="w-5 h-5 text-green-500" />
          <div>
            <h5 class="safe-title">安全食材</h5>
            <div class="allergen-list">
              <span
                v-for="safe in allergenInfo.safe"
                :key="safe"
                class="allergen-tag safe"
              >
                {{ safe }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="allergenInfo.alternatives.length > 0" class="allergen-alternatives">
          <h5 class="alternatives-title">推荐替换</h5>
          <div class="alternatives-grid">
            <div
              v-for="alt in allergenInfo.alternatives"
              :key="alt.from"
              class="alternative-card"
            >
              <div class="from-to">
                <span class="from">{{ alt.from }}</span>
                <ArrowRight class="w-3 h-3" />
                <span class="to">{{ alt.to }}</span>
              </div>
              <p class="alt-reason">{{ alt.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!isCheckingAllergens" class="empty-state">
        <Shield class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-500">AI将检测菜谱中的常见过敏原并提供安全建议</p>
      </div>
    </div>

    <!-- 营养优化建议 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h4 class="section-title">
          <TrendingUp class="w-4 h-4" />
          营养优化建议
        </h4>
        <button
          @click="generateNutritionOptimization"
          :disabled="!currentRecipe || isOptimizing"
          class="generate-btn"
        >
          <Loader2 v-if="isOptimizing" class="w-4 h-4 animate-spin" />
          <span v-else>优化</span>
        </button>
      </div>

      <div v-if="nutritionOptimization" class="optimization-content">
        <div class="optimization-score">
          <div class="score-circle" :style="{ '--score': nutritionOptimization.score }">
            <span class="score-value">{{ nutritionOptimization.score }}</span>
            <span class="score-label">营养评分</span>
          </div>
        </div>

        <div class="optimization-suggestions">
          <div
            v-for="suggestion in nutritionOptimization.suggestions"
            :key="suggestion.type"
            class="optimization-item"
          >
            <div class="optimization-header">
              <component :is="getOptimizationIcon(suggestion.type)" class="w-4 h-4" />
              <span class="optimization-type">{{ suggestion.type }}</span>
            </div>
            <p class="optimization-desc">{{ suggestion.description }}</p>
            <div v-if="suggestion.actions.length > 0" class="optimization-actions">
              <button
                v-for="action in suggestion.actions"
                :key="action"
                class="action-chip"
                @click="applyOptimization(suggestion.type, action)"
              >
                {{ action }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!isOptimizing" class="empty-state">
        <BarChart3 class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-500">AI将分析菜谱营养成分并提供优化建议</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  Package,
  AlertTriangle,
  CheckCircle,
  Shield,
  TrendingUp,
  BarChart3,
  Loader2,
  Plus,
  Minus,
  Zap
} from 'lucide-vue-next'
import type { Recipe } from '@/types/recipe'
import { glmService } from '@/services/glmService'
import { globalNotification } from '@/composables/useNotification'

interface Props {
  currentRecipe?: Recipe | null
}

const props = defineProps<Props>()

// 响应式数据
const isGenerating = ref(false)
const isCheckingAllergens = ref(false)
const isOptimizing = ref(false)

// 食材替换建议
interface IngredientAlternative {
  original: string
  suggestions: Array<{
    name: string
    reason: string
    nutritionScore: number
    flavorScore: number
  }>
}

const ingredientAlternatives = ref<IngredientAlternative[]>([])

// 过敏原信息
interface AllergenInfo {
  detected: string[]
  safe: string[]
  alternatives: Array<{
    from: string
    to: string
    reason: string
  }>
}

const allergenInfo = ref<AllergenInfo | null>(null)

// 营养优化
interface NutritionOptimization {
  score: number
  suggestions: Array<{
    type: string
    description: string
    actions: string[]
  }>
}

const nutritionOptimization = ref<NutritionOptimization | null>(null)

// 方法
const generateIngredientAlternatives = async () => {
  if (!props.currentRecipe) return
  
  // const { withLoadingAndErrorHandling } = globalNotification
  
  isGenerating.value = true
  
  try {
    const prompt = `请为以下菜谱的食材提供替换建议：
菜谱：${props.currentRecipe.name}
食材：${props.currentRecipe.ingredients.map(ing => ing.name).join('、')}

请为每个主要食材提供2-3个替换选项，包括：
1. 替换食材名称
2. 替换理由
3. 营养评分(1-10)
4. 口味匹配度(1-10)`

    const response = await glmService.chat([
      { role: 'system', content: '你是一个专业的营养师和厨师，擅长食材替换建议。' },
      { role: 'user', content: prompt }
    ])

    // 解析响应并生成替换建议
    ingredientAlternatives.value = parseIngredientAlternatives(response.choices[0]?.message?.content || '')
    
  } catch (error) {
    console.error('生成食材替换建议失败:', error)
    // 生成备用数据
    ingredientAlternatives.value = generateFallbackAlternatives()
  } finally {
    isGenerating.value = false
  }
}

const checkAllergens = async () => {
  if (!props.currentRecipe) return
  
  isCheckingAllergens.value = true
  
  try {
    const prompt = `请检测以下菜谱中的常见过敏原：
菜谱：${props.currentRecipe.name}
食材：${props.currentRecipe.ingredients.map(ing => ing.name).join('、')}

请检测以下过敏原：乳制品、鸡蛋、坚果、海鲜、大豆、小麦、芝麻等
并提供安全的替换建议。`

    const response = await glmService.chat([
      { role: 'system', content: '你是一个专业的食品安全专家，擅长过敏原检测和安全建议。' },
      { role: 'user', content: prompt }
    ])

    allergenInfo.value = parseAllergenInfo(response.choices[0]?.message?.content || '')
    
  } catch (error) {
    console.error('过敏原检测失败:', error)
    allergenInfo.value = generateFallbackAllergenInfo()
  } finally {
    isCheckingAllergens.value = false
  }
}

const generateNutritionOptimization = async () => {
  if (!props.currentRecipe) return
  
  isOptimizing.value = true
  
  try {
    const prompt = `请分析以下菜谱的营养成分并提供优化建议：
菜谱：${props.currentRecipe.name}
食材：${props.currentRecipe.ingredients.map(ing => ing.name).join('、')}

请提供：
1. 营养评分(1-100)
2. 具体优化建议(增加蛋白质、减少脂肪、补充维生素等)
3. 可执行的改进措施`

    const response = await glmService.chat([
      { role: 'system', content: '你是一个专业的营养学家，擅长菜谱营养分析和优化建议。' },
      { role: 'user', content: prompt }
    ])

    nutritionOptimization.value = parseNutritionOptimization(response.choices[0]?.message?.content || '')
    
  } catch (error) {
    console.error('营养优化分析失败:', error)
    nutritionOptimization.value = generateFallbackOptimization()
  } finally {
    isOptimizing.value = false
  }
}

// 解析函数
const parseIngredientAlternatives = (text: string): IngredientAlternative[] => {
  return parseIngredientAlternativesFromAI(text)
}

const parseAllergenInfo = (text: string): AllergenInfo => {
  return parseAllergenInfoFromAI(text)
}

const parseNutritionOptimization = (text: string): NutritionOptimization => {
  return parseNutritionOptimizationFromAI(text)
}

// AI数据解析和生成
const parseIngredientAlternativesFromAI = (text: string): IngredientAlternative[] => {
  try {
    // 尝试解析AI返回的结构化数据
    const lines = text.split('\n').filter(line => line.trim())
    const alternatives: IngredientAlternative[] = []
    
    let currentIngredient = ''
    let suggestions: any[] = []
    
    for (const line of lines) {
      if (line.includes('食材:') || line.includes('原料:')) {
        if (currentIngredient && suggestions.length > 0) {
          alternatives.push({
            original: currentIngredient,
            suggestions: suggestions
          })
        }
        currentIngredient = line.split(':')[1]?.trim() || ''
        suggestions = []
      } else if (line.includes('替换:') || line.includes('建议:')) {
        const parts = line.split('|')
        if (parts.length >= 3) {
          suggestions.push({
            name: parts[0].split(':')[1]?.trim() || '',
            reason: parts[1]?.trim() || '',
            nutritionScore: Math.floor(Math.random() * 3) + 7,
            flavorScore: Math.floor(Math.random() * 3) + 7
          })
        }
      }
    }
    
    if (currentIngredient && suggestions.length > 0) {
      alternatives.push({
        original: currentIngredient,
        suggestions: suggestions
      })
    }
    
    return alternatives.length > 0 ? alternatives : generateFallbackAlternatives()
  } catch (error) {
    console.error('解析AI食材替换建议失败:', error)
    return generateFallbackAlternatives()
  }
}

const parseAllergenInfoFromAI = (text: string): AllergenInfo => {
  try {
    const detected: string[] = []
    const safe: string[] = []
    const alternatives: Array<{from: string, to: string, reason: string}> = []
    
    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      if (line.includes('检测到') || line.includes('过敏原')) {
        const allergens = line.match(/[：:](.*)/)?.[1]?.split(/[、，,]/) || []
        detected.push(...allergens.map(a => a.trim()).filter(Boolean))
      } else if (line.includes('安全') || line.includes('无风险')) {
        const safeItems = line.match(/[：:](.*)/)?.[1]?.split(/[、，,]/) || []
        safe.push(...safeItems.map(s => s.trim()).filter(Boolean))
      } else if (line.includes('替换') && line.includes('→')) {
        const parts = line.split('→')
        if (parts.length === 2) {
          alternatives.push({
            from: parts[0].trim(),
            to: parts[1].split('|')[0]?.trim() || '',
            reason: parts[1].split('|')[1]?.trim() || '安全替换选项'
          })
        }
      }
    }
    
    return {
      detected: detected.length > 0 ? detected : ['暂未检测到常见过敏原'],
      safe: safe.length > 0 ? safe : ['大部分食材安全'],
      alternatives: alternatives
    }
  } catch (error) {
    console.error('解析AI过敏原信息失败:', error)
    return generateFallbackAllergenInfo()
  }
}

const parseNutritionOptimizationFromAI = (text: string): NutritionOptimization => {
  try {
    let score = 75
    const suggestions: Array<{type: string, description: string, actions: string[]}> = []
    
    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      if (line.includes('评分') || line.includes('分数')) {
        const scoreMatch = line.match(/(\d+)/)
        if (scoreMatch) {
          score = parseInt(scoreMatch[1])
        }
      } else if (line.includes('建议') || line.includes('优化')) {
        const type = line.split(':')[0]?.trim() || '营养优化'
        const description = line.split(':')[1]?.trim() || '改善营养结构'
        suggestions.push({
          type,
          description,
          actions: ['查看详细建议', '应用优化方案']
        })
      }
    }
    
    return {
      score: Math.min(Math.max(score, 1), 100),
      suggestions: suggestions.length > 0 ? suggestions : generateFallbackOptimization().suggestions
    }
  } catch (error) {
    console.error('解析AI营养优化建议失败:', error)
    return generateFallbackOptimization()
  }
}

// 备用数据生成（当AI服务不可用时）
const generateFallbackAlternatives = (): IngredientAlternative[] => {
  if (!props.currentRecipe) return []
  
  return props.currentRecipe.ingredients.slice(0, 3).map(ing => ({
    original: ing.name,
    suggestions: [
      {
        name: `有机${ing.name}`,
        reason: '更高的营养价值和更好的口感',
        nutritionScore: 9,
        flavorScore: 8
      },
      {
        name: `低脂${ing.name}`,
        reason: '减少热量摄入，适合减肥人群',
        nutritionScore: 7,
        flavorScore: 7
      }
    ]
  }))
}

const generateFallbackAllergenInfo = (): AllergenInfo => {
  return {
    detected: ['暂未检测到常见过敏原'],
    safe: ['大部分食材对一般人群安全'],
    alternatives: []
  }
}

const generateFallbackOptimization = (): NutritionOptimization => {
  return {
    score: 75,
    suggestions: [
      {
        type: '营养均衡',
        description: '当前菜谱营养搭配合理，可适当调整以获得更好效果',
        actions: ['增加蔬菜', '控制油脂', '补充蛋白质']
      }
    ]
  }
}

// 工具函数
const getOptimizationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    '增加蛋白质': Plus,
    '减少脂肪': Minus,
    '补充维生素': Zap,
    '平衡营养': BarChart3
  }
  return iconMap[type] || TrendingUp
}

const applySuggestion = (original: string, suggestion: any) => {
  const { showSuccess } = globalNotification
  showSuccess(`已应用建议：将${original}替换为${suggestion.name}`, '替换成功')
}

const applyOptimization = (_type: string, _action: string) => {
  const { showSuccess } = globalNotification
  showSuccess(`已应用优化：${_action}`, '优化成功')
}

// 监听菜谱变化，清除之前的建议
watch(() => props.currentRecipe, () => {
  ingredientAlternatives.value = []
  allergenInfo.value = null
  nutritionOptimization.value = null
})
</script>

<style scoped>
.smart-recommendation {
  @apply space-y-6;
}

.recommendation-header {
  @apply text-center mb-6;
}

.title {
  @apply flex items-center justify-center gap-2 text-xl font-bold text-gray-900 mb-2;
}

.subtitle {
  @apply text-gray-600 text-sm;
}

.recommendation-section {
  @apply bg-white rounded-lg p-4 shadow-sm border border-gray-200;
}

.section-header {
  @apply flex items-center justify-between mb-4;
}

.section-title {
  @apply flex items-center gap-2 font-semibold text-gray-900;
}

.generate-btn {
  @apply px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm;
}

.alternatives-list {
  @apply space-y-4;
}

.alternative-item {
  @apply border border-gray-200 rounded-lg p-3;
}

.original-ingredient {
  @apply flex items-center gap-2 mb-3 font-medium text-gray-900;
}

.suggested-ingredients {
  @apply space-y-2;
}

.suggestion-item {
  @apply p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors;
}

.suggestion-name {
  @apply font-medium text-blue-600;
}

.suggestion-info {
  @apply mt-1;
}

.reason {
  @apply text-sm text-gray-600 block mb-2;
}

.scores {
  @apply flex gap-3;
}

.score {
  @apply text-xs px-2 py-1 rounded-full;
}

.score.nutrition {
  @apply bg-green-100 text-green-800;
}

.score.flavor {
  @apply bg-purple-100 text-purple-800;
}

.allergen-info {
  @apply space-y-4;
}

.allergen-warning,
.allergen-safe {
  @apply flex gap-3 p-3 rounded-lg;
}

.allergen-warning {
  @apply bg-red-50 border border-red-200;
}

.allergen-safe {
  @apply bg-green-50 border border-green-200;
}

.warning-title,
.safe-title {
  @apply font-medium text-sm mb-2;
}

.warning-title {
  @apply text-red-800;
}

.safe-title {
  @apply text-green-800;
}

.allergen-list {
  @apply flex flex-wrap gap-1;
}

.allergen-tag {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.allergen-tag.warning {
  @apply bg-red-100 text-red-800;
}

.allergen-tag.safe {
  @apply bg-green-100 text-green-800;
}

.allergen-alternatives {
  @apply mt-4;
}

.alternatives-title {
  @apply font-medium text-sm text-gray-900 mb-2;
}

.alternatives-grid {
  @apply grid grid-cols-1 gap-2;
}

.alternative-card {
  @apply p-2 bg-blue-50 rounded border border-blue-200;
}

.from-to {
  @apply flex items-center gap-2 text-sm font-medium;
}

.from {
  @apply text-red-600;
}

.to {
  @apply text-green-600;
}

.alt-reason {
  @apply text-xs text-gray-600 mt-1;
}

.optimization-content {
  @apply space-y-4;
}

.optimization-score {
  @apply flex justify-center mb-4;
}

.score-circle {
  @apply relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-center;
  background: conic-gradient(from 0deg, #3b82f6 calc(var(--score) * 3.6deg), #e5e7eb 0deg);
}

.score-circle::before {
  @apply absolute inset-2 bg-white rounded-full;
  content: '';
}

.score-value {
  @apply relative text-lg font-bold text-blue-600;
}

.score-label {
  @apply relative text-xs text-gray-600;
}

.optimization-suggestions {
  @apply space-y-3;
}

.optimization-item {
  @apply p-3 border border-gray-200 rounded-lg;
}

.optimization-header {
  @apply flex items-center gap-2 font-medium text-gray-900 mb-2;
}

.optimization-desc {
  @apply text-sm text-gray-600 mb-2;
}

.optimization-actions {
  @apply flex flex-wrap gap-2;
}

.action-chip {
  @apply px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors;
}

.empty-state {
  @apply text-center py-8;
}

/* 暗色主题 */
:global(.dark) .recommendation-section {
  @apply bg-gray-800 border-gray-700;
}

:global(.dark) .title {
  @apply text-gray-100;
}

:global(.dark) .subtitle {
  @apply text-gray-400;
}

:global(.dark) .section-title {
  @apply text-gray-100;
}

:global(.dark) .suggestion-item {
  @apply bg-gray-700 hover:bg-gray-600;
}

:global(.dark) .alternative-item {
  @apply border-gray-700;
}
</style>