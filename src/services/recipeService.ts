import { ref } from 'vue'
import type { Recipe } from '@/types/recipe'
import { Recipe as RecipeModel } from '@/models/Recipe'
import type { Recipe as IRecipe } from '@/types/recipe'

export type { Recipe } // 重新导出Recipe类型

// AI响应类型
interface AIResponse {
  recipe?: unknown
  [key: string]: unknown
}

// 食谱生成参数
interface RecipeGenerateParams {
  ingredients: string[]
  cookingMethods?: string[]
  noMethodRestriction?: boolean
  dietaryRestrictions?: string[]
  healthGoals?: string[]
  allergies?: string[]
  flavorPreferences?: string[]
  regionalFlavors?: string[]
  specialNeeds?: string[]
  additionalNotes?: string
  constraints?: string[]
}

// 食谱数据存储 - 移除mock数据，使用空数组作为初始状态
const recipes: Recipe[] = []

// 创建食谱服务
export const useRecipeService = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有食谱
  const getAllRecipes = async (): Promise<IRecipe[]> => {
    isLoading.value = true
    error.value = null

    try {
      // 从SQLite数据库获取食谱
      const dbRecipes = await RecipeModel.findAll(100, 0)
      const result = dbRecipes.map(recipe => ({
        id: recipe.id.toString(),
        title: recipe.title,
        name: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        steps: recipe.instructions,
        cookingTime: `${recipe.cookingTime}分钟`,
        time:
          typeof recipe.cookingTime === 'number'
            ? recipe.cookingTime
            : parseInt(recipe.cookingTime) || 30,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cookingMethods: [recipe.category],
        nutritionInfo: recipe.nutritionInfo,
        nutrition: recipe.nutritionInfo,
        tags: recipe.tags,
        rating: recipe.averageRating,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
      }))

      // 更新内存中的食谱
      recipes.splice(0, recipes.length, ...result)
      return result
    } catch (err) {
      error.value = '获取食谱列表失败'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个食谱
  const getRecipeById = async (id: number): Promise<IRecipe | null> => {
    isLoading.value = true
    error.value = null

    try {
      // 从SQLite数据库中查找
      const recipe = await RecipeModel.findById(id)
      if (!recipe) {
        return null
      }

      const result = {
        id: recipe.id.toString(),
        title: recipe.title,
        name: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        steps: recipe.instructions,
        cookingTime: `${recipe.cookingTime}分钟`,
        time:
          typeof recipe.cookingTime === 'number'
            ? recipe.cookingTime
            : parseInt(recipe.cookingTime) || 30,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cookingMethods: [recipe.category],
        nutritionInfo: recipe.nutritionInfo,
        nutrition: recipe.nutritionInfo,
        tags: recipe.tags,
        rating: recipe.averageRating,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
      }

      return result
    } catch (err) {
      error.value = '获取食谱详情失败'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 生成AI食谱提示词
   */
  const generateRecipePrompt = (params: RecipeGenerateParams): string => {
    const { ingredients, cookingMethods, constraints, additionalNotes } = params

    let prompt = `请根据以下食材生成一道详细的中文菜谱：\n\n食材：${ingredients.join('、')}\n\n`

    if (cookingMethods && cookingMethods.length > 0) {
      prompt += `烹饪方式：${cookingMethods.join('、')}\n\n`
    }

    if (constraints && constraints.length > 0) {
      prompt += `约束条件：${constraints.join('、')}\n\n`
    }

    if (additionalNotes) {
      prompt += `额外说明：${additionalNotes}\n\n`
    }

    prompt += `请提供以下信息：
1. 菜名
2. 简短描述
3. 烹饪时间
4. 难度（简单/中等/困难）
5. 份量
6. 详细食材清单（包括用量）
7. 详细步骤说明
8. 烹饪小贴士
9. 营养信息（卡路里、蛋白质、碳水、脂肪）

请以JSON格式返回，格式如下：
{
  "name": "菜名",
  "description": "简短描述",
  "cookingTime": "烹饪时间",
  "difficulty": "难度",
  "servings": "份量",
  "ingredients": ["食材1 用量", "食材2 用量", ...],
  "steps": ["步骤1", "步骤2", ...],
  "tips": "烹饪小贴士",
  "nutritionInfo": {
    "calories": 卡路里数值,
    "protein": 蛋白质数值,
    "carbs": 碳水数值,
    "fat": 脂肪数值
  }
}`

    return prompt
  }

  /**
   * 调用AI服务生成食谱
   */
  const callAIService = async (
    prompt: string,
    params: RecipeGenerateParams
  ): Promise<IRecipe[]> => {
    try {
      // 导入AI服务
      const { aiService } = await import('./aiService')

      // 调用真实的AI服务生成食谱，使用prompt作为参数
      const response = await (
        aiService as unknown as { generateRecipe: (prompt: string) => Promise<AIResponse> }
      ).generateRecipe(prompt)

      // AI服务返回的数据，需要处理成Recipe格式
      if (response) {
        // 检查是否有recipe属性（如果是RecipeGenerationResult结构）
        const recipeData = response.recipe || response

        // 安全地处理ingredients类型转换
        const ingredientsList = (recipeData as { ingredients?: unknown[] }).ingredients || []
        const processedIngredients = ingredientsList.map((ingredient: unknown) => {
          if (typeof ingredient === 'string') {
            return ingredient
          }
          if (ingredient && typeof ingredient === 'object' && 'name' in ingredient) {
            const name = (ingredient as { name: unknown }).name
            if (typeof name === 'string') {
              return name
            }
            if (typeof name === 'number') {
              return String(name)
            }
            return ''
          }
          return typeof ingredient === 'string' ? ingredient : ''
        })

        // 安全地访问recipeData的属性
        const safeGet = (obj: unknown, key: string) =>
          obj && typeof obj === 'object' && key in obj
            ? (obj as Record<string, unknown>)[key]
            : undefined

        const safeString = (value: unknown, defaultValue: string = '') =>
          typeof value === 'string' ? value : defaultValue

        const safeNumber = (value: unknown, defaultValue: number = 0) => {
          if (typeof value === 'number') {
            return value
          }
          if (typeof value === 'string') {
            return parseInt(value) || defaultValue
          }
          return defaultValue
        }

        return [
          {
            id: Date.now().toString(), // Recipe接口中id是string类型
            title:
              safeString(safeGet(recipeData, 'title')) ||
              safeString(safeGet(recipeData, 'name')) ||
              '未命名食谱',
            name:
              safeString(safeGet(recipeData, 'title')) ||
              safeString(safeGet(recipeData, 'name')) ||
              '未命名食谱',
            description: safeString(safeGet(recipeData, 'description')),
            servings: safeNumber(safeGet(recipeData, 'servings'), 4),
            cookingTime: safeString(safeGet(recipeData, 'cookingTime'), '30分钟'),
            difficulty: safeString(safeGet(recipeData, 'difficulty'), 'easy'),
            rating: 4.0,
            ingredients: processedIngredients,
            steps: (safeGet(recipeData, 'instructions') ||
              safeGet(recipeData, 'steps') ||
              []) as string[],
            cookingMethods: (safeGet(recipeData, 'cookingMethods') as string[]) || ['炒'],
            nutritionInfo: (safeGet(recipeData, 'nutrition') ||
              safeGet(recipeData, 'nutritionInfo') || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
              }) as { calories: number; protein: number; carbs: number; fat: number },
          },
        ]
      }

      // 如果没有返回有效数据，生成备选食谱
      return generateFallbackRecipes(params)
    } catch (error) {
      console.error('AI服务调用失败:', error)
      throw error
    }
  }

  /**
   * 生成单个AI食谱
   */
  const generateAIRecipe = (
    params: RecipeGenerateParams,
    cookingMethod: string,
    index: number
  ): Recipe => {
    const { ingredients, constraints } = params
    const mainIngredients = ingredients.slice(0, 3)

    return {
      id: (1000 + index).toString(),
      title: generateRecipeName(mainIngredients, cookingMethod, constraints),
      name: generateRecipeName(mainIngredients, cookingMethod, constraints),
      description: generateDescription(mainIngredients, cookingMethod, constraints),
      cookingTime: generateCookingTime(cookingMethod),
      difficulty: generateDifficulty(),
      servings: generateServings(),
      rating: 3.5 + Math.random() * 1.5,
      ingredients: generateIngredientsList(mainIngredients, cookingMethod),
      steps: generateCookingSteps(mainIngredients, cookingMethod),
      cookingMethods: [cookingMethod],
      cookingTips: [generateCookingTips(mainIngredients, cookingMethod)],
      nutritionInfo: generateNutritionInfo(),
    }
  }

  /**
   * 生成食谱名称
   */
  const generateRecipeName = (
    ingredients: string[],
    method: string,
    constraints?: string[]
  ): string => {
    let name = `${method}${ingredients.join('、')}`
    if (constraints?.includes('素食')) {
      name = `素食${name}`
    }
    return name
  }

  /**
   * 生成食谱描述
   */
  const generateDescription = (
    ingredients: string[],
    method: string,
    constraints?: string[]
  ): string => {
    let description = `精选${ingredients.join('、')}，采用${method}的方式制作`
    if (constraints && constraints.length > 0) {
      description += `，符合${constraints.join('、')}的饮食需求`
    }
    return description
  }

  /**
   * 生成烹饪时间
   */
  const generateCookingTime = (method: string): string => {
    if (['炖', '蒸', '烤'].includes(method)) {
      return `${40 + Math.floor(Math.random() * 20)}分钟`
    }
    if (['炒', '煎'].includes(method)) {
      return `${15 + Math.floor(Math.random() * 15)}分钟`
    }
    return '30分钟'
  }

  /**
   * 生成难度等级
   */
  const generateDifficulty = (): string => {
    const difficulties = ['简单', '中等', '困难']
    return difficulties[Math.floor(Math.random() * 2)] // 偏向简单和中等
  }

  /**
   * 生成份量
   */
  const generateServings = (): number => {
    return 2 + Math.floor(Math.random() * 4)
  }

  /**
   * 生成食材清单
   */
  const generateIngredientsList = (mainIngredients: string[], method: string): string[] => {
    const ingredients = [...mainIngredients.map(ing => `${ing} 适量`), '盐 适量', '食用油 适量']

    if (['炒', '煎'].includes(method)) {
      ingredients.push('葱 适量', '姜 适量', '蒜 适量', '生抽 1勺')
    } else if (['炖', '蒸'].includes(method)) {
      ingredients.push('料酒 1勺', '姜片 几片', '葱段 几段')
    } else if (method === '烤') {
      ingredients.push('孜然粉 适量', '辣椒粉 适量', '橄榄油 适量')
    }

    return ingredients
  }

  /**
   * 生成烹饪步骤
   */
  const generateCookingSteps = (mainIngredients: string[], method: string): string[] => {
    const basePrep = `准备食材：将${mainIngredients.join('、')}洗净切好备用`

    const stepsByMethod: Record<string, string[]> = {
      炒: [
        basePrep,
        '热锅下油，爆香葱姜蒜',
        `放入${mainIngredients[0]}翻炒至变色`,
        `加入其余食材${mainIngredients.slice(1).join('、')}继续翻炒`,
        '加入调味料，翻炒均匀',
        '调整口味，出锅装盘即可',
      ],
      煮: [
        basePrep,
        '锅中加入适量清水，大火烧开',
        `放入${mainIngredients.join('、')}和调味料`,
        '转中小火煮至食材熟透',
        '调整口味，出锅装盘即可',
      ],
      蒸: [
        basePrep,
        '将食材放入蒸盘中，加入调味料拌匀',
        '锅中加水烧开，放入蒸盘',
        '盖上锅盖，中火蒸15-20分钟',
        '关火后等待2分钟再开盖，取出装盘即可',
      ],
    }

    return stepsByMethod[method] || stepsByMethod['炒']
  }

  /**
   * 生成烹饪小贴士
   */
  const generateCookingTips = (mainIngredients: string[], method: string): string => {
    let tips = `${method}${mainIngredients[0]}时火候要掌握好，保持食材的鲜嫩口感。`

    if (['炒', '煎'].includes(method)) {
      tips += '火候不要太大，以免食材煎糊。'
    } else if (['炖', '煮'].includes(method)) {
      tips += '炖煮时间可以根据个人口感偏好适当调整。'
    } else if (method === '蒸') {
      tips += '蒸制时间不要过长，以免食材口感变老。'
    } else if (method === '烤') {
      tips += '烤制过程中可以适当翻面，确保受热均匀。'
    }

    return tips
  }

  /**
   * 生成营养信息
   */
  const generateNutritionInfo = () => {
    return {
      calories: 200 + Math.floor(Math.random() * 300),
      protein: 8 + Math.floor(Math.random() * 20),
      carbs: 15 + Math.floor(Math.random() * 30),
      fat: 5 + Math.floor(Math.random() * 15),
    }
  }

  /**
   * 生成备选食谱（当AI服务失败时使用）
   */
  const generateFallbackRecipes = (params: RecipeGenerateParams): Recipe[] => {
    const { cookingMethods } = params

    // 确保生成至少2个不同烹饪方式的食谱
    const availableMethods = cookingMethods?.length ? cookingMethods : ['炒', '煮', '蒸', '炖']
    const recipesToGenerate = Math.max(2, Math.min(availableMethods.length, 3))

    const generatedRecipes: Recipe[] = []
    const usedMethods: string[] = []

    for (let i = 0; i < recipesToGenerate; i++) {
      const availableMethodsForThis = availableMethods.filter(m => !usedMethods.includes(m))
      const method =
        availableMethodsForThis.length > 0
          ? availableMethodsForThis[Math.floor(Math.random() * availableMethodsForThis.length)]
          : availableMethods[Math.floor(Math.random() * availableMethods.length)]

      usedMethods.push(method)

      // 生成食谱
      const recipe = generateAIRecipe(params, method, i)
      generatedRecipes.push(recipe)
    }

    return generatedRecipes
  }

  // 生成食谱
  const generateRecipes = async (params: RecipeGenerateParams): Promise<IRecipe[]> => {
    isLoading.value = true
    error.value = null

    try {
      // 使用真实的AI生成食谱
      const prompt = generateRecipePrompt(params)

      // 显示正在生成的状态
      console.log('正在使用AI生成食谱...')

      try {
        // 这里应该是调用后端API的代码，现在我们模拟一个API调用
        const response = await callAIService(prompt, params)
        return response
      } catch (apiError) {
        console.error('AI服务调用失败:', apiError)
        error.value = 'AI生成食谱失败，请稍后再试'

        // 如果AI服务失败，返回一些基于参数的简单食谱作为备选
        return generateFallbackRecipes(params)
      }
    } catch (err) {
      error.value = '生成食谱失败'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 搜索食谱
  const searchRecipes = async (query: string): Promise<IRecipe[]> => {
    isLoading.value = true
    error.value = null

    try {
      if (!query.trim()) {
        return await getAllRecipes()
      }

      // 从SQLite数据库中搜索
      const dbResults = await RecipeModel.search(query, 20)
      const results = dbResults.map(recipe => ({
        id: recipe.id.toString(),
        title: recipe.title,
        name: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        steps: recipe.instructions,
        cookingTime: `${recipe.cookingTime}分钟`,
        time:
          typeof recipe.cookingTime === 'number'
            ? recipe.cookingTime
            : parseInt(recipe.cookingTime) || 30,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cookingMethods: [recipe.category],
        nutritionInfo: recipe.nutritionInfo,
        nutrition: recipe.nutritionInfo,
        tags: recipe.tags,
        rating: recipe.averageRating,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
      }))

      return results
    } catch (err) {
      error.value = '搜索食谱失败'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    getAllRecipes,
    getRecipeById,
    generateRecipes,
    searchRecipes,
  }
}
