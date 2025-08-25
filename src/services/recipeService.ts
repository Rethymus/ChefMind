import { ref } from 'vue'

// 食谱类型定义
export interface Recipe {
  id: number
  name: string
  description: string
  cookingTime: string
  difficulty: string
  servings: number
  rating: number
  ingredients: string[]
  steps: string[]
  tips?: string
  image?: string
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// 食谱生成参数
export interface RecipeGenerateParams {
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
  const getAllRecipes = async (): Promise<Recipe[]> => {
    isLoading.value = true
    error.value = null

    try {
      // 从本地存储获取已保存的食谱
      const savedRecipes = localStorage.getItem('chefmind_recipes')
      if (savedRecipes) {
        const parsedRecipes = JSON.parse(savedRecipes)
        recipes.splice(0, recipes.length, ...parsedRecipes)
        return recipes
      }

      // 如果没有保存的食谱，返回空数组
      return []
    } catch (err) {
      error.value = '获取食谱列表失败'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个食谱
  const getRecipeById = async (id: number): Promise<Recipe | null> => {
    isLoading.value = true
    error.value = null

    try {
      // 先从内存中查找
      let recipe = recipes.find(r => r.id === id)

      // 如果内存中没有，从本地存储中查找
      if (!recipe) {
        const savedRecipes = localStorage.getItem('chefmind_recipes')
        if (savedRecipes) {
          const parsedRecipes = JSON.parse(savedRecipes)
          recipe = parsedRecipes.find((r: Recipe) => r.id === id)
        }
      }

      return recipe || null
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
  const callAIService = async (prompt: string, params: RecipeGenerateParams): Promise<Recipe[]> => {
    try {
      // 导入AI服务
      const aiService = await import('./aiService')

      // 调用真实的AI服务生成食谱
      const response = await aiService.generateRecipe(prompt)

      // 尝试解析AI返回的JSON
      try {
        const parsedResponse = JSON.parse(response)

        // 如果返回的是单个食谱对象，转换为数组
        if (parsedResponse && !Array.isArray(parsedResponse)) {
          return [parsedResponse]
        }

        // 如果返回的是数组，直接返回
        if (Array.isArray(parsedResponse)) {
          return parsedResponse.map((recipe, index) => ({
            ...recipe,
            id: Date.now() + index, // 生成唯一ID
          }))
        }

        return []
      } catch (parseError) {
        console.warn('AI返回的不是有效JSON，尝试生成备选食谱')
        return generateFallbackRecipes(params)
      }
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

    // 根据食材和烹饪方式生成菜名
    let recipeName = `${cookingMethod}${mainIngredients.join('、')}`

    // 如果有约束条件，可能会影响菜名
    if (constraints && constraints.includes('素食')) {
      recipeName = `素食${recipeName}`
    }

    // 生成描述
    let description = `精选${mainIngredients.join('、')}，采用${cookingMethod}的方式制作`
    if (constraints && constraints.length > 0) {
      description += `，符合${constraints.join('、')}的饮食需求`
    }

    // 生成烹饪时间（根据烹饪方式调整）
    let cookingTime = '30分钟'
    if (['炖', '蒸', '烤'].includes(cookingMethod)) {
      cookingTime = `${40 + Math.floor(Math.random() * 20)}分钟`
    } else if (['炒', '煎'].includes(cookingMethod)) {
      cookingTime = `${15 + Math.floor(Math.random() * 15)}分钟`
    }

    // 生成难度
    const difficulties = ['简单', '中等', '困难']
    const difficulty = difficulties[Math.floor(Math.random() * 2)] // 偏向简单和中等

    // 生成份量
    const servings = `${2 + Math.floor(Math.random() * 4)}人份`

    // 生成食材清单
    const fullIngredients = [...mainIngredients.map(ing => `${ing} 适量`), '盐 适量', '食用油 适量']

    // 根据烹饪方式添加额外调料
    if (['炒', '煎'].includes(cookingMethod)) {
      fullIngredients.push('葱 适量', '姜 适量', '蒜 适量', '生抽 1勺')
    } else if (['炖', '蒸'].includes(cookingMethod)) {
      fullIngredients.push('料酒 1勺', '姜片 几片', '葱段 几段')
    } else if (cookingMethod === '烤') {
      fullIngredients.push('孜然粉 适量', '辣椒粉 适量', '橄榄油 适量')
    }

    // 生成步骤
    const steps = []

    // 根据烹饪方式生成不同的步骤
    if (cookingMethod === '炒') {
      steps.push(
        `准备食材：将${mainIngredients.join('、')}洗净切好备用`,
        '热锅下油，爆香葱姜蒜',
        `放入${mainIngredients[0]}翻炒至变色`,
        `加入其余食材${mainIngredients.slice(1).join('、')}继续翻炒`,
        '加入调味料，翻炒均匀',
        '调整口味，出锅装盘即可'
      )
    } else if (cookingMethod === '煮') {
      steps.push(
        `准备食材：将${mainIngredients.join('、')}洗净切好备用`,
        '锅中加入适量清水，大火烧开',
        `放入${mainIngredients.join('、')}和调味料`,
        '转中小火煮至食材熟透',
        '调整口味，出锅装盘即可'
      )
    } else if (cookingMethod === '蒸') {
      steps.push(
        `准备食材：将${mainIngredients.join('、')}洗净切好备用`,
        '将食材放入蒸盘中，加入调味料拌匀',
        '锅中加水烧开，放入蒸盘',
        `盖上锅盖，中火蒸${cookingMethod === '蒸' ? '15-20分钟' : '30-40分钟'}`,
        '关火后等待2分钟再开盖，取出装盘即可'
      )
    } else if (cookingMethod === '炖') {
      steps.push(
        `准备食材：将${mainIngredients.join('、')}洗净切好备用`,
        '锅中加油，将主要食材煎至表面金黄',
        '加入清水没过食材，放入调味料',
        '大火烧开后转小火慢炖1小时左右',
        '调整口味，出锅装盘即可'
      )
    } else if (cookingMethod === '煎') {
      steps.push(
        `准备食材：将${mainIngredients.join('、')}洗净切好备用`,
        '食材加入调味料腌制10分钟',
        '平底锅加油烧热，放入食材',
        '中小火煎至两面金黄',
        '调整口味，出锅装盘即可'
      )
    } else if (cookingMethod === '烤') {
      steps.push(
        `准备食材：将${mainIngredients.join('、')}洗净切好备用`,
        '食材加入调味料腌制20分钟',
        '预热烤箱至180度',
        '将食材放入烤盘中，刷上油',
        '放入烤箱中层，烤制20-30分钟',
        '取出装盘即可'
      )
    }

    // 生成小贴士
    let tips = `${cookingMethod}${mainIngredients[0]}时火候要掌握好，保持食材的鲜嫩口感。`

    if (['炒', '煎'].includes(cookingMethod)) {
      tips += '火候不要太大，以免食材煎糊。'
    } else if (['炖', '煮'].includes(cookingMethod)) {
      tips += '炖煮时间可以根据个人口感偏好适当调整。'
    } else if (cookingMethod === '蒸') {
      tips += '蒸制时间不要过长，以免食材口感变老。'
    } else if (cookingMethod === '烤') {
      tips += '烤制过程中可以适当翻面，确保受热均匀。'
    }

    // 生成营养信息
    const nutritionInfo = {
      calories: 200 + Math.floor(Math.random() * 300),
      protein: 8 + Math.floor(Math.random() * 20),
      carbs: 15 + Math.floor(Math.random() * 30),
      fat: 5 + Math.floor(Math.random() * 15),
    }

    return {
      id: 1000 + index,
      name: recipeName,
      description,
      cookingTime,
      difficulty,
      servings,
      rating: 3.5 + Math.random() * 1.5, // 3.5-5星
      ingredients: fullIngredients,
      steps,
      tips,
      nutritionInfo,
    }
  }

  /**
   * 生成备选食谱（当AI服务失败时使用）
   */
  const generateFallbackRecipes = (params: RecipeGenerateParams): Recipe[] => {
    const { ingredients, cookingMethods } = params

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
  const generateRecipes = async (params: RecipeGenerateParams): Promise<Recipe[]> => {
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
  const searchRecipes = async (query: string): Promise<Recipe[]> => {
    isLoading.value = true
    error.value = null

    try {
      if (!query.trim()) {
        return await getAllRecipes()
      }

      // 首先从本地存储的食谱中搜索
      const savedRecipes = localStorage.getItem('chefmind_recipes')
      let localResults: Recipe[] = []

      if (savedRecipes) {
        const parsedRecipes = JSON.parse(savedRecipes)
        const lowerQuery = query.toLowerCase()
        localResults = parsedRecipes.filter(
          (recipe: Recipe) =>
            recipe.name.toLowerCase().includes(lowerQuery) ||
            recipe.description.toLowerCase().includes(lowerQuery) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))
        )
      }

      // 如果本地搜索结果不足，使用AI生成相关食谱
      if (localResults.length < 3) {
        try {
          const aiService = await import('./aiService')
          const prompt = `根据搜索关键词"${query}"，生成3个相关的中文食谱。请返回JSON格式的食谱数组，每个食谱包含name、description、cookingTime、difficulty、servings、ingredients、steps、tips、nutritionInfo等字段。`

          const response = await aiService.generateRecipe(prompt)
          const aiResults = JSON.parse(response)

          if (Array.isArray(aiResults)) {
            const enhancedResults = aiResults.map((recipe, index) => ({
              ...recipe,
              id: Date.now() + index,
              rating: 4 + Math.random(),
            }))

            // 合并本地结果和AI结果
            return [...localResults, ...enhancedResults]
          }
        } catch (aiError) {
          console.warn('AI搜索失败，仅返回本地结果:', aiError)
        }
      }

      return localResults
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
