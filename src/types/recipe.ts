/**
 * 食谱相关类型定义
 */

// 食材分类类型
type IngredientCategoryType =
  | '蔬菜'
  | '肉类'
  | '海鲜'
  | '蛋奶'
  | '谷物'
  | '调料'
  | '水果'
  | '坚果'
  | '豆类'
  | '其他'

// 食材分类接口
export interface IngredientCategory {
  id: string
  name: string
  icon: string
  items: Ingredient[]
}

// 约束条件
interface Constraints {
  servings?: number
  cookingTime?: number | null
  difficulty?: number | null
  dietaryRestrictions?: string[]
  healthGoals?: string[]
  allergens?: string[]
  budget?: number
  equipment?: string[]
  season?: string
  occasion?: string
  time?: string // 烹饪时间约束
  people?: string // 用餐人数
  taste?: string // 口味偏好
}

// 食材分析结果
export interface IngredientAnalysisResult {
  name: string
  confidence: number
  category: IngredientCategoryType
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
interface RecipeGenerationResult {
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

// 食谱生成请求
export interface RecipeGenerationRequest {
  ingredients: string[]
  cookingMethods?: string[]
  servings?: number
  cookingTime?: string
  difficulty?: string
  dietaryRestrictions?: string[]
  healthGoals?: string[]
  preferences?: UserPreference
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
  nutrition?: Nutrition // 营养信息
}

// 用户偏好
export interface UserPreference {
  dietaryRestrictions?: string[]
  favoriteIngredients?: string[]
  dislikedIngredients?: string[]
  cookingLevel?: 'beginner' | 'intermediate' | 'advanced'
  preferredCuisine?: string[]
  healthGoals?: string[]
  allergies?: string[]
  taste?: string
  dietType?: string
}

// 健康约束
export interface HealthConstraint {
  type?: string
  description?: string
  maxCalories?: number
  minProtein?: number
  maxSodium?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isDairyFree?: boolean
}

// 食谱过滤器
export interface RecipeFilters {
  ingredients?: string[]
  cookingTime?: { min?: number; max?: number }
  difficulty?: string[]
  tags?: string[]
  dietaryRestrictions?: string[]
  healthGoals?: string[]
}

// 食谱搜索结果
export interface RecipeSearchResult {
  recipes: Recipe[]
  total: number
  page: number
  pageSize: number
  filters?: RecipeFilters
}

// 食谱评分
interface RecipeRating {
  recipeId: string
  userId: string
  rating: number
  review?: string
  createdAt: Date
}

// 食谱评分摘要
interface RecipeRatingSummary {
  recipeId: string
  overall: number // 总体评分
  count: number // 评分次数
  taste: number // 口味评分
  appearance: number // 外观评分
  difficulty: number // 难度评分
  updatedAt: Date // 更新时间
}

// 食谱评论
interface RecipeComment {
  id: string
  recipeId: string
  userId: string
  username?: string // 用户名
  content: string
  rating?: number
  createdAt: Date
  updatedAt?: Date
  aiGenerated?: boolean // 是否为AI生成
  likes: number
  replies?: RecipeComment[]
}

// 烹饪方式
export interface CookingMethod {
  id?: string
  label: string
  value: string
  name?: string
  icon?: string
  description?: string
  difficulty?: number
  timeRange?: string
  healthScore?: number
  equipment?: string[]
}

// 食材
export interface Ingredient {
  id?: string
  name: string
  amount?: number
  unit?: string
  category?: IngredientCategoryType
  isOptional?: boolean
  icon?: string
}

// 饮食限制
interface DietaryRestriction {
  label: string
  value: string
  description?: string
}

// 健康目标
interface HealthGoal {
  label: string
  value: string
  description?: string
}

// 过敏原
interface Allergy {
  label: string
  value: string
  description?: string
}

// 口味偏好
interface FlavorPreference {
  label: string
  value: string
}

// 营养信息（扩展版本）
export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  saturatedFat?: number
  unsaturatedFat?: number
  cholesterol?: number
  sodium?: number
  potassium?: number
  calcium?: number
  iron?: number
  vitaminA?: number
  vitaminC?: number
  vitaminD?: number
}

// 营养信息（基础版本）
export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  healthScore?: number
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
  id: string
  title: string
  name?: string
  description: string
  image?: string
  ingredients: (Ingredient | string)[]
  instructions?: string[]
  steps?: string[] | RecipeStep[]
  cookingTime: string
  time?: number // 兼容旧字段
  servings: number
  difficulty: string | number
  cookingMethods: string[]
  method?: CookingMethod // 兼容旧字段
  kitchenware?: string[]
  dietaryRestrictions?: string[]
  healthGoals?: string[]
  allergies?: string[]
  flavorPreferences?: string[]
  spiceLevel?: string
  sweetnessLevel?: string
  nutrition?: Nutrition
  nutritionInfo?: NutritionInfo // 扩展营养信息
  cookingTips?: string[]
  tags?: string[]
  rating?: number
  createdAt?: Date
  updatedAt?: Date
  userId?: string
  authorId?: string
  isPublic?: boolean
  source?: string
  notes?: string
  cuisine?: string // 菜系
  healthBenefits?: string[] // 健康益处
  autoCompletedIngredients?: string[] // 自动补充的食材列表
  aiGenerated?: boolean // AI生成标记
  tips?: string // 小贴士
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

  // 新增字段用于支持菜品名称请求
  dishName?: string // 菜品名称（当请求类型为菜品复现时使用）
  requestType?: 'ingredient_based' | 'dish_recreation' // 请求类型
}

// 食材验证结果
export interface IngredientValidationResult {
  isValid: boolean
  reason?: string
  alternatives?: string[]
}

// 购物清单项目
interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: IngredientCategoryType
  completed: boolean
  createdAt: Date
  updatedAt: Date
  estimatedPrice?: number
}

// 用户类型
interface User {
  id: string
  username: string
  email: string
  avatar: string
  preferences?: UserPreference
}

// 事件分析接口
interface UserEvent {
  id: string
  userId?: string
  eventType: string
  eventData: Record<string, string | number | boolean>
  timestamp: Date
  sessionId: string
}
