// ChefMind 智食谱 - 菜谱相关类型定义

// 食材类型
export interface Ingredient {
  id: number | string
  name: string
  category: string
  amount?: string
  unit?: string
}

// 食材分类
export interface IngredientCategory {
  id: string
  name: string
  items: Ingredient[]
}

// 烹饪方式
export interface CookingMethod {
  id: number
  name: string
  description: string
  icon?: string
  time: number // 预计烹饪时间（分钟）
  difficulty: number // 难度等级 1-5
}

// 菜谱步骤
export interface RecipeStep {
  id: number
  title: string
  description: string
  tips?: string
  image?: string
  videoUrl?: string
}

// 营养信息
export interface NutritionInfo {
  calories: number // 卡路里
  protein: number // 蛋白质（克）
  carbs: number // 碳水化合物（克）
  fat: number // 脂肪（克）
  fiber: number // 膳食纤维（克）
}

// 菜谱类型
export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: Ingredient[]
  method: CookingMethod
  steps: RecipeStep[]
  cookingTime: number // 烹饪时间（分钟）
  difficulty: number // 难度等级 1-5
  servings: number // 份数
  nutrition: NutritionInfo
  tags: string[] // 标签
  createdAt: Date
  updatedAt?: Date
  image?: string
  video?: string
  cuisine?: string // 菜系
  mainIngredients?: string[] // 主要食材
  cookingTips?: string[] // 烹饪技巧
  nutritionFacts?: any // 详细营养成分
  aiGenerated?: boolean // 是否由AI生成
  originalGLMResponse?: string // 原始GLM响应（用于调试）
  healthBenefits?: string[] // 健康益处
  seasonalIngredients?: string[] // 应季食材
  personalizedFor?: { // 个性化信息
    preferences: UserPreference
    constraints: HealthConstraint[]
  }
  seasonal?: { // 应季信息
    season: string
    region: string
  }
}

// 菜谱过滤条件
export interface RecipeFilters {
  cookingMethod?: string
  difficulty?: number
  cookingTime?: number
  ingredients?: string[]
  excludeIngredients?: string[] // 排除的食材
  tags?: string[]
  cuisine?: string
  mealType?: string // 餐点类型，如早餐、午餐、晚餐等
}

// 菜谱搜索结果
export interface RecipeSearchResult {
  recipes: Recipe[]
  total: number
  page?: number
  pageSize?: number
  filters?: RecipeFilters
  query?: string
}

// 用户饮食偏好
export interface UserPreference {
  flavors?: string[] // 口味偏好，如清淡、麻辣等
  ingredients?: string[] // 喜欢的食材
  cuisines?: string[] // 喜欢的菜系
  dietaryHabits?: string[] // 饮食习惯，如素食、低碳水等
  taste?: string // 口味偏好，如清淡、麻辣等（旧版兼容）
  dietType?: string // 饮食类型，如素食、低碳水等（旧版兼容）
  favoriteIngredients?: string[] // 喜欢的食材（旧版兼容）
  dislikedIngredients?: string[] // 不喜欢的食材
  allergies?: string[] // 过敏原
}

// 健康约束条件
export interface HealthConstraint {
  type: string // 约束类型，如糖尿病、高血压等
  description: string // 约束描述
  restrictedIngredients?: string[] // 限制的食材
  recommendedIngredients?: string[] // 推荐的食材
}

// 菜谱评分
export interface RecipeRating {
  recipeId: string
  overall: number // 总体评分
  taste: number // 口味评分
  appearance: number // 外观评分
  difficulty: number // 难度评分
  count: number // 评分人数
  updatedAt: Date
}

// 菜谱评论
export interface RecipeComment {
  id: string
  recipeId: string
  username: string
  rating: number
  content: string
  createdAt: Date
  likes: number
  aiGenerated?: boolean
  reply?: string
}

// 菜谱收藏
export interface RecipeFavorite {
  id: string
  recipeId: string
  userId: string
  createdAt: Date
}

// 烹饪历史记录
export interface CookingHistory {
  id: string
  recipeId: string
  userId: string
  cookedAt: Date
  rating?: number
  notes?: string
}

// 购物清单项
export interface ShoppingListItem {
  id: string
  name: string
  amount?: string
  unit?: string
  recipeId?: string
  checked: boolean
  category?: string
}

// 菜谱生成请求
export interface RecipeGenerationRequest {
  ingredients?: string[] // 指定食材
  cuisine?: string // 菜系
  dietaryRestrictions?: string[] // 饮食限制
  mealType?: string // 餐点类型
  cookingMethod?: string // 烹饪方式
  difficulty?: number // 难度要求
  cookingTime?: number // 烹饪时间要求
  servings?: number // 份数
  preferences?: UserPreference // 用户偏好
  constraints?: HealthConstraint[] // 健康约束
}