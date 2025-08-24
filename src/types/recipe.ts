/**
 * 食谱相关类型定义
 */

// 食材分析结果
export interface IngredientAnalysisResult {
  name: string
  confidence: number
  category: string
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    vitamins?: string[]
  }
  freshness: number
  suggestions: string[]
}

// 营养分析结果
export interface NutritionAnalysisResult {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  vitamins?: string[]
  minerals?: string[]
  healthScore: number
  dietaryInfo: {
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    allergens: string[]
  }
  recommendations: string[]
}

// 食谱生成结果
export interface RecipeGenerationResult {
  id?: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cookingTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  servings: number
  tags?: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber?: number
    vitamins?: string[]
    minerals?: string[]
    healthScore?: number
    dietaryInfo?: {
      isVegetarian: boolean
      isVegan: boolean
      isGlutenFree: boolean
      allergens: string[]
    }
    recommendations?: string[]
  }
}

// 个性化推荐
export interface PersonalizedRecommendation {
  id: string
  title: string
  description: string
  matchScore: number
  tags?: string[]
  ingredients: string[]
  cookingTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  imageUrl?: string
  reasonForRecommendation: string
}

// 烹饪方式
export interface CookingMethod {
  label: string
  value: string
  icon?: string
  description?: string
}

// 食材
export interface Ingredient {
  name: string
  amount?: number
  unit?: string
  category?: string
  isOptional?: boolean
}

// 饮食限制
export interface DietaryRestriction {
  label: string
  value: string
  description?: string
}

// 健康目标
export interface HealthGoal {
  label: string
  value: string
  description?: string
}

// 过敏原
export interface Allergy {
  label: string
  value: string
  description?: string
}

// 口味偏好
export interface FlavorPreference {
  label: string
  value: string
}

// 营养信息
export interface Nutrition {
  calories: number
  protein: number
  carbs?: number
  carbohydrates?: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

// 食谱步骤
export interface RecipeStep {
  order: number
  description: string
  image?: string
  timer?: number // 以秒为单位
  tips?: string[]
}

// 食谱
export interface Recipe {
  id?: string
  title: string
  name?: string
  description: string
  image?: string
  ingredients: (Ingredient | string)[]
  instructions?: string[]
  steps?: string[] | RecipeStep[]
  cookingTime: string
  servings: number
  difficulty: string
  cookingMethods: string[]
  kitchenware?: string[]
  dietaryRestrictions?: string[]
  healthGoals?: string[]
  allergies?: string[]
  flavorPreferences?: string[]
  spiceLevel?: string
  sweetnessLevel?: string
  nutrition?: Nutrition
  cookingTips?: string[]
  tags?: string[]
  rating?: number
  createdAt?: Date
  updatedAt?: Date
  userId?: string
  isPublic?: boolean
  source?: string
  notes?: string
  autoCompletedIngredients?: string[] // 自动补充的食材列表
}

// 食谱生成参数
export interface RecipeGenerationParams {
  ingredients: string[]
  cookingMethods?: string[]
  noMethodRestriction?: boolean
  kitchenware?: string[]
  dietaryRestrictions?: string[]
  healthGoals?: string[]
  allergies?: string[]
  flavorPreferences?: string[]
  spiceLevel?: string
  sweetnessLevel?: string
  servings?: number
  cookingTime?: string
  difficulty?: string
  userId?: string
  language?: string
  autoCompleteIngredients?: boolean // 是否自动补充食材
}

// 食材验证结果
export interface IngredientValidationResult {
  isValid: boolean
  reason?: string
  alternatives?: string[]
}