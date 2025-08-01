// ChefMind 智食谱 - 类型定义

// 基础食材接口
export interface Ingredient {
  id: number
  name: string
  category: 'vegetables' | 'meat' | 'seafood' | 'staple' | 'cookware'
  icon?: string
  selected?: boolean
  amount?: string
  unit?: string
}

// 食材分类接口
export interface IngredientCategory {
  id: string
  name: string
  icon: string
  items: Ingredient[]
}

// 烹饪方式接口
export interface CookingMethod {
  id: string
  name: string
  icon: string
  description: string
  difficulty: number
  time: number
}

// 营养信息接口
export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium?: number
  sugar?: number
  vitamins?: Record<string, number>
}

// 制作步骤接口
export interface RecipeStep {
  id: number
  title: string
  description: string
  tips?: string
  duration?: number
  temperature?: number
}

// 菜谱接口
export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: Ingredient[]
  method: CookingMethod
  steps: RecipeStep[]
  cookingTime: number
  difficulty: number
  servings: number
  nutrition: NutritionInfo
  tags: string[]
  image?: string
  time?: number // 兼容旧版本
  createdAt?: Date
  updatedAt?: Date
  aiGenerated?: boolean // 是否为AI生成
  originalGLMResponse?: string // 原始GLM响应（用于调试）
}

// 约束条件接口
export interface Constraints {
  cookingTime: number | null
  difficulty: number | null
  servings: number | null
  dietaryRestrictions: string[]
  excludeIngredients: string[]
  // 兼容旧版本字段
  time?: string | null
  people?: string | null
  taste?: string | null
}

// 菜谱生成请求接口
export interface GenerateRecipeRequest {
  ingredients: string[]
  methods: string[]
  constraints: Constraints
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 购物清单项目接口
export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  completed: boolean
  price?: number
  fromRecipe?: string
}

// 计时器接口
export interface Timer {
  id: string
  name: string
  duration: number
  remaining: number
  isRunning: boolean
  isCompleted: boolean
  createdAt: Date
}

// 营养目标接口
export interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

// 用户健康信息接口
export interface HealthInfo {
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goals: 'maintain' | 'lose' | 'gain'
}

// 推荐食材接口
export interface RecommendedIngredient {
  id: number
  name: string
  category: string
  icon: string
  reason: string
  nutritionScore?: number
  flavorScore?: number
}

// 语音识别结果接口
export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

// PWA安装提示接口
export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// 服务工作者消息接口
export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CACHE_UPDATED' | 'OFFLINE_READY'
  payload?: any
}