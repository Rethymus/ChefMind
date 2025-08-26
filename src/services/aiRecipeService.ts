// ChefMind 智食谱 - AI菜谱服务

import { callGLM, parseJsonResponse } from './glmService'
import { generateUUID } from '../utils/idGenerator'
import { cookingMethods } from '../data/cookingMethods'
import { cacheData, getCachedData } from '../utils/cacheUtils'
import type {
  Recipe,
  RecipeGenerationRequest,
  UserPreference,
  HealthConstraint,
  RecipeFilters,
  RecipeSearchResult,
  Ingredient,
  RecipeStep,
  Nutrition,
} from '../types/recipe'

// 原始AI响应数据类型
interface RawRecipeData {
  name?: string
  description?: string
  ingredients?: Array<{
    name: string
    amount: string
    unit?: string
  }>
  steps?: Array<{
    description?: string
    title?: string
    order?: number
  }> | string[]
  cookingTime?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  tags?: string[]
  cookingTips?: string[]
  healthBenefits?: string[]
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

interface RawStepData {
  description?: string
  title?: string
  order?: number
}

// 转换原始食材数据到Ingredient格式
function convertIngredients(rawIngredients?: RawRecipeData['ingredients']): (string | Ingredient)[] {
  if (!rawIngredients) return []
  
  return rawIngredients.map(item => ({
    name: item.name,
    amount: parseFloat(item.amount) || 1,
    unit: item.unit || '个',
  }))
}

// 转换原始步骤数据到RecipeStep格式
function convertSteps(rawSteps?: RawRecipeData['steps']): string[] | RecipeStep[] {
  if (!rawSteps) return []
  
  if (Array.isArray(rawSteps) && typeof rawSteps[0] === 'string') {
    return rawSteps as string[]
  }
  
  return (rawSteps as RawStepData[]).map((step, index) => ({
    order: step.order || index + 1,
    description: step.description || step.title || '',
  }))
}

// 转换原始营养数据到Nutrition格式
function convertNutrition(rawNutrition?: RawRecipeData['nutrition']): Nutrition {
  return {
    calories: rawNutrition?.calories || 0,
    protein: rawNutrition?.protein || 0,
    carbs: rawNutrition?.carbs || 0,
    fat: rawNutrition?.fat || 0,
    fiber: 0,
  }
}

/**
 * 通过AI生成菜谱
 * @param request 菜谱生成请求
 * @returns 生成的菜谱
 */
export async function generateRecipe(request: RecipeGenerationRequest): Promise<Recipe> {
  try {
    // 构建用户提示词，整合系统指示
    let userPrompt = '你是一位专业的行政总厨，请创建一道详细的菜谱。'

    // 添加菜系（从偏好中获取）
    if (request.preferences?.preferredCuisine && request.preferences.preferredCuisine.length > 0) {
      userPrompt += `菜系：${request.preferences.preferredCuisine[0]}。`
    }

    // 添加餐点类型（根据食材推断）
    const mealKeywords = ['早餐', '午餐', '晚餐', '小食', '甜点']
    const matchedMeal = mealKeywords.find(meal =>
      request.ingredients.some(ing => ing.includes(meal))
    )
    if (matchedMeal) {
      userPrompt += `${matchedMeal}`
    }

    // 添加烹饪方式
    if (request.cookingMethods && request.cookingMethods.length > 0) {
      userPrompt += `，使用${request.cookingMethods[0]}的烹饪方式`
    }

    // 添加食材
    if (request.ingredients && request.ingredients.length > 0) {
      userPrompt += `，使用以下食材：${request.ingredients.join('、')}`
    }

    // 添加饮食限制
    if (request.dietaryRestrictions && request.dietaryRestrictions.length > 0) {
      userPrompt += `，需要符合以下饮食限制：${request.dietaryRestrictions.join('、')}`
    }

    // 添加用户偏好
    if (request.preferences) {
      const { favoriteIngredients, dislikedIngredients, preferredCuisine, dietaryRestrictions } =
        request.preferences

      if (favoriteIngredients && favoriteIngredients.length > 0) {
        userPrompt += `，喜欢的食材：${favoriteIngredients.join('、')}`
      }

      if (dislikedIngredients && dislikedIngredients.length > 0) {
        userPrompt += `，不喜欢的食材：${dislikedIngredients.join('、')}`
      }

      if (preferredCuisine && preferredCuisine.length > 0) {
        userPrompt += `，偏好菜系：${preferredCuisine.join('、')}`
      }

      if (dietaryRestrictions && dietaryRestrictions.length > 0) {
        userPrompt += `，饮食限制：${dietaryRestrictions.join('、')}`
      }
    }

    // 添加健康约束（从healthGoals中获取）
    if (request.healthGoals && request.healthGoals.length > 0) {
      userPrompt += `，健康目标：${request.healthGoals.join('、')}`
    }

    // 添加难度要求
    if (request.difficulty) {
      userPrompt += `，难度级别：${request.difficulty}（1-5）`
    }

    // 添加烹饪时间要求
    if (request.cookingTime) {
      userPrompt += `，烹饪时间不超过${request.cookingTime}分钟`
    }

    // 添加份数
    if (request.servings) {
      userPrompt += `，${request.servings}人份`
    }

    userPrompt += '。请返回完整的菜谱JSON数据。'

    console.log('生成菜谱的提示词:', userPrompt)

    // 调用GLM API
    const response = await callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
    })

    console.log('GLM API响应:', response)

    // 解析JSON响应
    const recipeData = parseJsonResponse<RawRecipeData>(response)

    // 生成菜品名称
    const recipeName = recipeData.name || '未命名菜谱'

    // 转换为Recipe对象
    const recipe: Recipe = {
      id: generateUUID(),
      title: recipeName,
      name: recipeName,
      description: recipeData.description || '',
      ingredients: convertIngredients(recipeData.ingredients),
      instructions: recipeData.steps?.map((step: RawStepData) => step.description || step.title || '') || [],
      steps: convertSteps(recipeData.steps),
      cookingTime: `${recipeData.cookingTime || 30}分钟`,
      time: recipeData.cookingTime || 30,
      difficulty: recipeData.difficulty || 3,
      servings: recipeData.servings || request.servings || 2,
      cookingMethods: request.cookingMethods || ['炒'],
      nutrition: convertNutrition(recipeData.nutrition),
      tags: recipeData.tags || ['AI生成'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      userId: 'ai-system', // 默认用户ID
      cookingTips: recipeData.cookingTips || [],
      healthBenefits: recipeData.healthBenefits || [],
    }

    // 缓存生成的菜谱
    cacheData(`recipe_${recipe.id}`, recipe, 3600 * 24) // 缓存24小时

    return recipe
  } catch (error) {
    console.error('生成菜谱失败:', error)
    throw new Error(`生成菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 批量生成菜谱
 * @param requests 菜谱生成请求数组
 * @returns 生成的菜谱数组
 */
export async function batchGenerateRecipes(requests: RecipeGenerationRequest[]): Promise<Recipe[]> {
  try {
    // 限制并发请求数量
    const concurrency = 2
    const results: Recipe[] = []

    // 分批处理请求
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency)
      const promises = batch.map(request => generateRecipe(request))

      // 等待当前批次的所有请求完成
      const batchResults = await Promise.all(promises)
      results.push(...batchResults)

      // 如果还有更多批次，添加延迟以避免API限流
      if (i + concurrency < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  } catch (error) {
    console.error('批量生成菜谱失败:', error)
    throw new Error(`批量生成菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 根据食材生成菜谱
 * @param ingredients 食材列表
 * @param options 其他选项
 * @returns 生成的菜谱
 */
export async function generateRecipeByIngredients(
  ingredients: string[],
  options: {
    cuisine?: string
    cookingMethod?: string
    difficulty?: number
    cookingTime?: number
    preferences?: UserPreference
    constraints?: HealthConstraint[]
  } = {}
): Promise<Recipe> {
  const request: RecipeGenerationRequest = {
    ingredients,
    cookingMethods: options.cookingMethod ? [options.cookingMethod] : undefined,
    difficulty: options.difficulty?.toString(),
    cookingTime: options.cookingTime?.toString(),
    preferences: options.preferences,
    healthGoals: options.constraints?.map((_c) => `限制条件`) || [],
  }

  return generateRecipe(request)
}

/**
 * 根据用户偏好生成菜谱推荐
 * @param preferences 用户偏好
 * @param count 推荐数量
 * @returns 推荐的菜谱列表
 */
export async function generateRecipeRecommendations(
  preferences: UserPreference,
  count: number = 3
): Promise<Recipe[]> {
  try {
    const requests: RecipeGenerationRequest[] = []

    // 根据用户偏好创建多个不同的菜谱生成请求
    for (let i = 0; i < count; i++) {
      // 随机选择一些用户偏好的元素，以增加多样性
      const request: RecipeGenerationRequest = {
        ingredients: preferences.favoriteIngredients || [],
        preferences: { ...preferences },
      }

      // 随机选择一种烹饪方式
      if (
        Math.random() > 0.5 &&
        preferences.preferredCuisine &&
        preferences.preferredCuisine.length > 0
      ) {
        const randomIndex = Math.floor(Math.random() * preferences.preferredCuisine.length)
        // 将菜系信息添加到烹饪方法中
        request.cookingMethods = request.cookingMethods || []
        request.cookingMethods.push(`${preferences.preferredCuisine[randomIndex]}菜系`)
      }

      // 随机设置难度
      request.difficulty = String(Math.floor(Math.random() * 3) + 2) // 2-4之间的难度

      requests.push(request)
    }

    return batchGenerateRecipes(requests)
  } catch (error) {
    console.error('生成菜谱推荐失败:', error)
    throw new Error(`生成菜谱推荐失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 根据健康约束生成适合的菜谱
 * @param constraints 健康约束条件
 * @returns 生成的菜谱
 */
export async function generateHealthyRecipe(constraints: HealthConstraint[]): Promise<Recipe> {
  const dietaryRestrictions: string[] = []

  // 从健康约束中提取饮食限制
  constraints.forEach(c => {
    if (c.isVegetarian) dietaryRestrictions.push('素食')
    if (c.isVegan) dietaryRestrictions.push('纯素食')
    if (c.isGlutenFree) dietaryRestrictions.push('无麸质')
    if (c.isDairyFree) dietaryRestrictions.push('无乳制品')
  })

  const request: RecipeGenerationRequest = {
    ingredients: [],
    dietaryRestrictions,
    healthGoals: ['健康饮食'],
  }

  return generateRecipe(request)
}

/**
 * 根据菜谱ID获取菜谱
 * @param id 菜谱ID
 * @returns 菜谱对象，如果不存在则返回null
 */
export function getRecipeById(id: string): Recipe | null {
  return getCachedData<Recipe>(`recipe_${id}`)
}

/**
 * 根据烹饪方式名称查找烹饪方式对象
 * @param methodName 烹饪方式名称
 * @returns 烹饪方式对象，如果不存在则返回undefined
 */
function findCookingMethod(methodName?: string) {
  if (!methodName) return undefined
  return cookingMethods.find(method => method.name === methodName)
}

/**
 * 搜索菜谱
 * @param query 搜索关键词
 * @param filters 过滤条件
 * @returns 搜索结果
 */
export async function searchRecipes(
  query: string,
  filters?: RecipeFilters
): Promise<RecipeSearchResult> {
  try {
    // 构建用户提示词
    let userPrompt = `你是一位专业的中餐厨师，请搜索与"${query}"相关的菜谱，生成3道符合条件的菜谱。`

    if (filters) {
      // 添加难度过滤
      if (filters.difficulty && filters.difficulty.length > 0) {
        userPrompt += `，难度级别为${filters.difficulty.join('或')}`
      }

      // 添加烹饪时间过滤
      if (filters.cookingTime) {
        if (filters.cookingTime.max) {
          userPrompt += `，烹饪时间不超过${filters.cookingTime.max}分钟`
        }
        if (filters.cookingTime.min) {
          userPrompt += `，烹饪时间不少于${filters.cookingTime.min}分钟`
        }
      }

      // 添加食材过滤
      if (filters.ingredients && filters.ingredients.length > 0) {
        userPrompt += `，包含以下食材：${filters.ingredients.join('、')}`
      }

      // 添加标签过滤
      if (filters.tags && filters.tags.length > 0) {
        userPrompt += `，包含以下标签：${filters.tags.join('、')}`
      }

      // 添加饮食限制过滤
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
        userPrompt += `，符合以下饮食要求：${filters.dietaryRestrictions.join('、')}`
      }

      // 添加健康目标过滤
      if (filters.healthGoals && filters.healthGoals.length > 0) {
        userPrompt += `，符合以下健康目标：${filters.healthGoals.join('、')}`
      }
    }

    userPrompt += '。请返回3道符合条件的菜谱，以JSON数组格式返回。'

    console.log('搜索菜谱的提示词:', userPrompt)

    // 调用GLM API
    const response = await callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
    })

    console.log('GLM API响应:', response)

    // 解析JSON响应
    const recipesData = parseJsonResponse<Recipe[]>(response)

    // 转换为Recipe对象数组
    const recipes: Recipe[] = recipesData.map((recipeData, _index) => {
      const recipe: Recipe = {
        id: generateUUID(),
        title: recipeData.name || '未命名菜谱',
        name: recipeData.name || '未命名菜谱',
        description: recipeData.description || '',
        ingredients:
          recipeData.ingredients?.map(
            (ing: { name: string; category?: string; amount?: number; unit?: string }, i: number) =>
              ({
                id: String(i + 1),
                name: ing.name,
                category: ing.category || '其他',
                amount: ing.amount,
                unit: ing.unit,
              }) as Ingredient
          ) || [],
        method: findCookingMethod(recipeData.cookingMethods?.[0]) || cookingMethods[0],
        cookingMethods: recipeData.cookingMethods || [cookingMethods[0].name],
        steps: (() => {
          if (!Array.isArray(recipeData.steps)) return []
          
          const isStringSteps = recipeData.steps.every((step: unknown) => typeof step === 'string')
          if (isStringSteps) {
            return recipeData.steps as string[]
          }
          
          return recipeData.steps.map(
            (step: RawStepData, i: number) =>
              ({
                order: i + 1,
                description: step.description || step.title || '',
                tips: [],
              }) as RecipeStep
          )
        })(),
        cookingTime: String(recipeData.cookingTime || 30),
        difficulty: recipeData.difficulty || 3,
        servings: recipeData.servings || 2,
        nutrition: recipeData.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
        tags: recipeData.tags || [],
        createdAt: new Date(),
        cookingTips: recipeData.cookingTips || [],
        healthBenefits: recipeData.healthBenefits || [],
      }

      // 缓存生成的菜谱
      cacheData(`recipe_${recipe.id}`, recipe, 3600 * 24) // 缓存24小时

      return recipe
    })

    return {
      recipes,
      total: recipes.length,
      page: 1,
      pageSize: recipes.length,
      filters,
    }
  } catch (error) {
    console.error('搜索菜谱失败:', error)
    throw new Error(`搜索菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 增强菜谱描述
 * @param recipe 原始菜谱
 * @returns 增强后的菜谱
 */
export async function enhanceRecipeDescription(recipe: Recipe): Promise<Recipe> {
  try {
    // 构建用户提示词
    const userPrompt = `你是一位美食作家和专业厨师，请为这道名为"${recipe.name || recipe.title}"的菜品创作一段更加生动、详细的描述。
    
    原始描述：${recipe.description}
    
    主要食材：${recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name)).join('、')}
    
    烹饪方式：${recipe.method?.name || recipe.cookingMethods?.[0] || '未指定'}
    
    特点标签：${recipe.tags?.join('、') || '未指定'}
    
    请创作一段生动、吸引人的菜品描述，包括外观、香气、口感、风味特点等。`

    // 调用GLM API
    const response = await callGLM(userPrompt, {
      temperature: 0.8, // 稍微提高创意性
      maxTokens: 1024,
    })

    // 创建增强后的菜谱副本
    const enhancedRecipe: Recipe = {
      ...recipe,
      description: response.trim(),
    }

    // 更新缓存
    cacheData(`recipe_${recipe.id}`, enhancedRecipe, 3600 * 24)

    return enhancedRecipe
  } catch (error) {
    console.error('增强菜谱描述失败:', error)
    // 如果增强失败，返回原始菜谱
    return recipe
  }
}

/**
 * 生成菜谱烹饪技巧
 * @param recipe 菜谱
 * @returns 带有烹饪技巧的菜谱
 */
export async function generateCookingTips(recipe: Recipe): Promise<Recipe> {
  try {
    // 构建用户提示词
    const userPrompt = `你是一位经验丰富的厨师，请为这道名为"${recipe.name || recipe.title}"的菜品提供5-8条专业、实用的烹饪技巧。
    
    菜品描述：${recipe.description}
    
    主要食材：${recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name)).join('、')}
    
    烹饪方式：${recipe.method?.name || recipe.cookingMethods?.[0] || '未指定'}
    
    烹饪步骤：${recipe.instructions ? recipe.instructions.join(' ') : '无步骤'}
    
    请提供5-8条专业、实用的烹饪技巧，帮助用户更好地完成这道菜。`

    // 调用GLM API
    const response = await callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 1024,
    })

    // 处理响应，将文本分割为技巧数组
    const tips = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('技巧') && !line.startsWith('提示'))

    // 创建带有烹饪技巧的菜谱副本
    const enhancedRecipe: Recipe = {
      ...recipe,
      cookingTips: tips,
    }

    // 更新缓存
    cacheData(`recipe_${recipe.id}`, enhancedRecipe, 3600 * 24)

    return enhancedRecipe
  } catch (error) {
    console.error('生成烹饪技巧失败:', error)
    // 如果生成失败，返回原始菜谱
    return recipe
  }
}

/**
 * 生成菜谱健康益处
 * @param recipe 菜谱
 * @returns 带有健康益处的菜谱
 */
export async function generateHealthBenefits(recipe: Recipe): Promise<Recipe> {
  try {
    // 构建用户提示词
    const userPrompt = `你是一位营养学专家，请分析这道名为"${recipe.name}"的菜品的健康益处。
    
    主要食材：${recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name)).join('、')}
    
    烹饪方式：${recipe.method ? recipe.method.name : '未知'}
    
    营养成分：热量 ${recipe.nutrition?.calories || 0}卡路里，蛋白质 ${recipe.nutrition?.protein || 0}克，碳水 ${recipe.nutrition?.carbs || 0}克，脂肪 ${recipe.nutrition?.fat || 0}克，膳食纤维 ${recipe.nutrition?.fiber || 0}克
    
    请提供4-6条健康益处，每条应该简洁明了，科学准确，避免夸大或不实的健康声明。
    请直接返回健康益处列表，每条一行，不要包含任何额外的解释或格式。`

    // 调用GLM API
    const response = await callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 1024,
    })

    // 处理响应，将文本分割为健康益处数组
    const benefits = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('健康益处') && !line.startsWith('益处'))

    // 创建带有健康益处的菜谱副本
    const enhancedRecipe: Recipe = {
      ...recipe,
      healthBenefits: benefits,
    }

    // 更新缓存
    cacheData(`recipe_${recipe.id}`, enhancedRecipe, 3600 * 24)

    return enhancedRecipe
  } catch (error) {
    console.error('生成健康益处失败:', error)
    // 如果生成失败，返回原始菜谱
    return recipe
  }
}

/**
 * 完全增强菜谱（包括描述、烹饪技巧和健康益处）
 * @param recipe 原始菜谱
 * @returns 完全增强后的菜谱
 */
export async function fullyEnhanceRecipe(recipe: Recipe): Promise<Recipe> {
  try {
    // 依次应用各种增强
    let enhancedRecipe = await enhanceRecipeDescription(recipe)
    enhancedRecipe = await generateCookingTips(enhancedRecipe)
    enhancedRecipe = await generateHealthBenefits(enhancedRecipe)

    return enhancedRecipe
  } catch (error) {
    console.error('完全增强菜谱失败:', error)
    // 如果增强失败，返回原始菜谱
    return recipe
  }
}

export default {
  generateRecipe,
  batchGenerateRecipes,
  generateRecipeByIngredients,
  generateRecipeRecommendations,
  generateHealthyRecipe,
  getRecipeById,
  searchRecipes,
  enhanceRecipeDescription,
  generateCookingTips,
  generateHealthBenefits,
  fullyEnhanceRecipe,
}
