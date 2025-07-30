// 食材接口
export interface Ingredient {
  id: number
  name: string
  category: 'vegetables' | 'meat' | 'seafood' | 'staple' | 'cookware'
  selected?: boolean
}

// 烹饪方式接口
export interface CookingMethod {
  id: string
  name: string
  icon: string
  description: string
  selected?: boolean
}

// 约束条件接口
export interface Constraints {
  time: string | null
  people: string | null
  difficulty: string | null
  taste: string | null
}

// 烹饪步骤接口
export interface CookingStep {
  id: number
  title: string
  description: string
  tips?: string
  time?: number
  temperature?: string
}

// 菜谱接口
export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: Ingredient[]
  method: CookingMethod
  steps: CookingStep[]
  time: number
  difficulty: number
  nutrition: number
  servings: string
  image?: string
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// 生成菜谱请求接口
export interface GenerateRecipeRequest {
  ingredients: string[]
  methods: string[]
  constraints: Constraints
}

// 外部链接接口
export interface ExternalLink {
  name: string
  url: string
  icon: string
  color: string
}