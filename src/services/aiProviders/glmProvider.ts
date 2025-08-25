import type { BaseAIProvider } from './baseProvider'
import type {
  Recipe,
  RecipeGenerationParams,
  IngredientValidationResult,
  RecipeGenerationResult,
  IngredientAnalysisResult,
  NutritionAnalysisResult,
  PersonalizedRecommendation,
} from '@/types/recipe'
import { callGLM, parseJsonResponse } from '@/services/glmService'

export class GLMProvider implements BaseAIProvider {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor(apiKey?: string, baseURL: string = 'https://open.bigmodel.cn/api/paas/v4/') {
    this.apiKey = apiKey || import.meta.env.VITE_GLM_API_KEY || ''
    this.baseURL =
      baseURL || import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/'
    this.model = import.meta.env.VITE_GLM_MODEL || 'glm-4'
  }

  async analyzeIngredient(imageFile: File): Promise<IngredientAnalysisResult> {
    try {
      // 将图片转换为base64
      const base64Image = await this.fileToBase64(imageFile)

      // 构建提示词
      const prompt = `
      请分析这张食材图片，并以JSON格式返回以下信息：
      1. 食材名称
      2. 识别置信度（0-1之间的小数）
      3. 食材类别（如蔬菜、肉类、水果等）
      4. 营养成分信息
      5. 新鲜度评估（0-1之间的小数）
      6. 烹饪建议

      图片内容：${base64Image.substring(0, 100)}...（图片数据已截断）

      请严格按照以下JSON格式返回：
      {
        "name": "食材名称",
        "confidence": 0.95,
        "category": "食材类别",
        "nutrition": {
          "calories": 100,
          "protein": 5,
          "carbs": 10,
          "fat": 2,
          "fiber": 3,
          "vitamins": ["维生素A", "维生素C"]
        },
        "freshness": 0.9,
        "suggestions": ["烹饪建议1", "烹饪建议2"]
      }
      `

      // 调用GLM API
      const response = await callGLM(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      })

      // 解析JSON响应
      return parseJsonResponse<IngredientAnalysisResult>(response)
    } catch (error) {
      console.error('GLM分析食材失败:', error)
      // 返回模拟数据作为备选
      return {
        name: '未知食材',
        confidence: 0.5,
        category: '未分类',
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          vitamins: [],
        },
        freshness: 0.5,
        suggestions: ['无法识别食材，请尝试更清晰的图片'],
      }
    }
  }

  async analyzeNutrition(recipe: any): Promise<NutritionAnalysisResult> {
    try {
      // 构建提示词
      const prompt = `
      请分析以下食谱的营养成分，并以JSON格式返回详细信息：
      
      食谱名称: ${recipe.title || '未命名食谱'}
      食材列表: ${JSON.stringify(recipe.ingredients || [])}
      烹饪方法: ${recipe.cookingMethod || '未指定'}
      
      请严格按照以下JSON格式返回营养分析结果：
      {
        "calories": 350,
        "protein": 25,
        "carbs": 45,
        "fat": 12,
        "fiber": 8,
        "vitamins": ["维生素A", "维生素C", "维生素D"],
        "minerals": ["钙", "铁", "锌"],
        "healthScore": 85,
        "dietaryInfo": {
          "isVegetarian": false,
          "isVegan": false,
          "isGlutenFree": true,
          "allergens": []
        },
        "recommendations": ["营养均衡", "适合减脂期食用"]
      }
      
      请确保数据尽可能准确，并基于常见食材的标准营养成分进行估算。
      `

      // 调用GLM API
      const response = await callGLM(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      })

      // 解析JSON响应
      return parseJsonResponse<NutritionAnalysisResult>(response)
    } catch (error) {
      console.error('GLM分析营养成分失败:', error)
      // 返回模拟数据作为备选
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        vitamins: [],
        minerals: [],
        healthScore: 0,
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          allergens: [],
        },
        recommendations: ['无法分析营养成分'],
      }
    }
  }

  async generateRecipe(params: RecipeGenerationParams): Promise<Recipe> {
    try {
      console.log('GLM生成食谱，参数:', params)

      // 处理自动补充食材
      let autoCompleteInstructions = ''
      if (params.autoCompleteIngredients) {
        autoCompleteInstructions = `
        请自动添加必要的调料和辅料，使食谱更加完整。
        在返回的JSON中，请添加一个"autoCompletedIngredients"字段，列出所有自动添加的食材。
        `
      }

      // 检查请求类型并构建不同的提示词
      let prompt = ''

      if (params.requestType === 'dish_recreation' && params.dishName) {
        // 菜品复现模式
        prompt = `
        请为"${params.dishName}"这道菜生成一个详细的制作食谱。请注意这是一道具体的菜品，不是食材。
        
        请分析这道菜的特点，推断出所需的食材和制作方法，并以JSON格式返回完整的食谱：
        
        菜品名称: ${params.dishName}
        ${params.servings ? `份量: ${params.servings}人份` : ''}
        ${params.cookingTime ? `制作时间: ${params.cookingTime}` : ''}
        ${params.difficulty ? `难度: ${params.difficulty}` : ''}
        ${autoCompleteInstructions}
        
        请确保：
        1. 准确还原这道菜的传统做法
        2. 提供详细的食材清单（包括用量）
        3. 详细的制作步骤
        4. 相关的烹饪技巧和注意事项
        `
      } else {
        // 传统食材基础模式
        prompt = `
        请根据以下食材和要求，生成一个详细的食谱，并以JSON格式返回：
        
        食材: ${params.ingredients.join(', ')}
        ${params.cookingMethods && params.cookingMethods.length > 0 ? `烹饪方式: ${params.cookingMethods.join(', ')}` : ''}
        ${params.noMethodRestriction ? '不限制烹饪方式（请选择最适合的烹饪方式）' : ''}
        ${params.kitchenware && params.kitchenware.length > 0 ? `厨具: ${params.kitchenware.join(', ')}` : ''}
        ${params.dietaryRestrictions && params.dietaryRestrictions.length > 0 ? `饮食限制: ${params.dietaryRestrictions.join(', ')}` : ''}
        ${params.healthGoals && params.healthGoals.length > 0 ? `健康目标: ${params.healthGoals.join(', ')}` : ''}
        ${params.allergies && params.allergies.length > 0 ? `过敏原: ${params.allergies.join(', ')}` : ''}
        ${params.flavorPreferences && params.flavorPreferences.length > 0 ? `口味偏好: ${params.flavorPreferences.join(', ')}` : ''}
        ${params.spiceLevel ? `辣度: ${params.spiceLevel}` : ''}
        ${params.sweetnessLevel ? `甜度: ${params.sweetnessLevel}` : ''}
        ${params.servings ? `份量: ${params.servings}人份` : ''}
        ${params.cookingTime ? `制作时间: ${params.cookingTime}` : ''}
        ${params.difficulty ? `难度: ${params.difficulty}` : ''}
        `
      }

      prompt += `
      
      请严格按照以下JSON格式返回食谱：
      {
        "title": "食谱标题",
        "description": "食谱简短描述",
        "ingredients": ["配料1及用量", "配料2及用量"],
        "instructions": ["步骤1", "步骤2", "步骤3"],
        "cookingTime": "30分钟内",
        "servings": 2,
        "difficulty": "简单",
        "cookingMethods": ["炒", "煎"],
        "kitchenware": ["炒锅", "铲子"],
        "dietaryRestrictions": [],
        "healthGoals": [],
        "allergies": [],
        "flavorPreferences": [],
        "spiceLevel": "中辣",
        "sweetnessLevel": "微甜",
        "nutrition": {
          "calories": 280,
          "protein": 15,
          "carbs": 35,
          "fat": 8
        },
        "cookingTips": ["小贴士1", "小贴士2"],
        "tags": ["标签1", "标签2"]
        ${params.autoCompleteIngredients ? ',"autoCompletedIngredients": ["自动添加的食材1", "自动添加的食材2"]' : ''}
      }
      
      请确保食谱创意独特、可行，并且充分利用所有提供的食材。
      ${params.autoCompleteIngredients ? '请务必添加必要的调料和辅料，使食谱更加完整，并在autoCompletedIngredients字段中列出所有自动添加的食材。' : ''}
      `

      // 调用GLM API
      const response = await callGLM(prompt, {
        temperature: 0.7,
        maxTokens: 2000,
      })

      // 解析JSON响应
      const recipeResult = parseJsonResponse<Recipe>(response)

      // 确保返回的对象符合Recipe接口
      const recipeTitle = recipeResult.title || '未命名食谱'
      const recipe: Recipe = {
        id: 'glm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
        title: recipeTitle,
        name: recipeTitle,
        description:
          recipeResult.description || `使用${params.ingredients.join('、')}制作的美味食谱`,
        ingredients: recipeResult.ingredients || params.ingredients.map(i => `${i} 适量`),
        instructions: recipeResult.instructions || ['准备食材', '烹饪', '装盘'],
        steps: recipeResult.steps || recipeResult.instructions || ['准备食材', '烹饪', '装盘'],
        cookingTime: recipeResult.cookingTime || params.cookingTime || '30分钟内',
        time: parseInt(recipeResult.cookingTime?.replace(/\D/g, '') || '30'),
        servings: recipeResult.servings || params.servings || 2,
        difficulty: recipeResult.difficulty || params.difficulty || '中等',
        cookingMethods: recipeResult.cookingMethods || params.cookingMethods || ['炒'],
        kitchenware: recipeResult.kitchenware || params.kitchenware || ['炒锅'],
        dietaryRestrictions: recipeResult.dietaryRestrictions || params.dietaryRestrictions || [],
        healthGoals: recipeResult.healthGoals || params.healthGoals || [],
        allergies: recipeResult.allergies || params.allergies || [],
        flavorPreferences: recipeResult.flavorPreferences || params.flavorPreferences || [],
        spiceLevel: recipeResult.spiceLevel || params.spiceLevel || 'medium',
        sweetnessLevel: recipeResult.sweetnessLevel || params.sweetnessLevel || 'medium',
        nutrition: recipeResult.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        cookingTips: recipeResult.cookingTips || [
          '食材最好新鲜，可以提前准备好',
          '注意火候控制，避免食材过熟或不熟',
        ],
        tags: recipeResult.tags || this.generateTags(params),
        autoCompletedIngredients: recipeResult.autoCompletedIngredients || [],
      }

      // 如果启用了自动补充食材但没有返回自动补充的食材列表，尝试推断
      if (
        params.autoCompleteIngredients &&
        (!recipe.autoCompletedIngredients || recipe.autoCompletedIngredients.length === 0)
      ) {
        recipe.autoCompletedIngredients = this.inferAutoCompletedIngredients(
          params.ingredients,
          recipe.ingredients
        )
      }

      return recipe
    } catch (error) {
      console.error('GLM生成食谱失败:', error)

      // 返回一个基本的食谱作为备选
      const fallbackTitle = `${params.ingredients[0] || '食材'}食谱`
      return {
        id: 'glm-fallback-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
        title: fallbackTitle,
        name: fallbackTitle,
        description: `使用${params.ingredients.join('、')}制作的美味食谱`,
        ingredients: params.ingredients.map(i => `${i} 适量`),
        instructions: ['准备食材', '烹饪', '装盘'],
        steps: ['准备食材', '烹饪', '装盘'],
        cookingTime: params.cookingTime || '30分钟内',
        time: parseInt(params.cookingTime?.replace(/\D/g, '') || '30'),
        servings: params.servings || 2,
        difficulty: params.difficulty || '中等',
        cookingMethods: params.cookingMethods || ['炒'],
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        cookingTips: ['食材最好新鲜，可以提前准备好', '注意火候控制，避免食材过熟或不熟'],
        tags: this.generateTags(params),
        autoCompletedIngredients: [],
      }
    }
  }

  // 推断自动补充的食材
  private inferAutoCompletedIngredients(
    originalIngredients: string[],
    allIngredients: (string | any)[]
  ): string[] {
    try {
      // 将复杂对象转换为字符串
      const allIngredientsStr = allIngredients.map(ing =>
        typeof ing === 'string' ? ing : ing.name
      )

      // 找出新增的食材
      const newIngredients = allIngredientsStr.filter(ing => {
        // 检查原始食材列表中是否包含当前食材
        const isOriginal = originalIngredients.some(
          original => ing.includes(original) || original.includes(ing)
        )
        return !isOriginal
      })

      // 常见调料列表，用于过滤
      const commonSeasonings = [
        '盐',
        '糖',
        '白糖',
        '酱油',
        '生抽',
        '老抽',
        '醋',
        '料酒',
        '香油',
        '食用油',
        '花椒',
        '八角',
        '桂皮',
        '香叶',
        '葱',
        '姜',
        '蒜',
        '辣椒',
        '胡椒粉',
        '五香粉',
        '十三香',
        '鸡精',
        '味精',
        '蚝油',
        '豆瓣酱',
        '甜面酱',
        '番茄酱',
        '清水',
        '水',
        '高汤',
        '鸡汤',
        '牛奶',
        '淀粉',
        '水淀粉',
        '玉米淀粉',
      ]

      // 过滤出可能是调料的食材
      return newIngredients.filter(ing => {
        // 检查是否是常见调料
        return commonSeasonings.some(
          seasoning => ing.includes(seasoning) || seasoning.includes(ing)
        )
      })
    } catch (error) {
      console.error('推断自动补充食材失败:', error)
      return []
    }
  }

  async getPersonalizedRecommendations(
    userHistory: any[],
    preferences: any,
    limit: number
  ): Promise<PersonalizedRecommendation[]> {
    try {
      // 构建提示词
      const prompt = `
      请根据用户的历史记录和偏好，生成${limit}个个性化食谱推荐，并以JSON数组格式返回：
      
      用户历史: ${JSON.stringify(userHistory)}
      用户偏好: ${JSON.stringify(preferences)}
      
      请严格按照以下JSON格式返回推荐列表：
      [
        {
          "id": "recommendation_1",
          "title": "推荐食谱1",
          "description": "食谱简短描述",
          "matchScore": 0.95,
          "tags": ["标签1", "标签2"],
          "ingredients": ["主要食材1", "主要食材2"],
          "cookingTime": 30,
          "difficulty": "easy/medium/hard",
          "imageUrl": "https://example.com/image.jpg",
          "reasonForRecommendation": "推荐原因"
        },
        ...
      ]
      
      请确保推荐的食谱多样化，并与用户的历史和偏好相匹配。
      `

      // 调用GLM API
      const response = await callGLM(prompt, {
        temperature: 0.7,
        maxTokens: 2000,
      })

      // 解析JSON响应
      return parseJsonResponse<PersonalizedRecommendation[]>(response)
    } catch (error) {
      console.error('GLM获取个性化推荐失败:', error)
      return [] // 返回空数组作为备选
    }
  }

  async getCookingGuidance(
    recipe: any,
    currentStep: number
  ): Promise<{
    guidance: string
    tips: string[]
    nextStep?: string
    estimatedTime: number
  }> {
    try {
      // 构建提示词
      const prompt = `
      请为以下食谱的第${currentStep}步提供详细的烹饪指导：
      
      食谱名称: ${recipe.title || '未命名食谱'}
      食谱步骤: ${JSON.stringify(recipe.instructions || [])}
      当前步骤: ${recipe.instructions?.[currentStep - 1] || '未知步骤'}
      
      请严格按照以下JSON格式返回烹饪指导：
      {
        "guidance": "详细的步骤指导说明",
        "tips": ["技巧1", "技巧2", "技巧3"],
        "nextStep": "下一步的简要预告",
        "estimatedTime": 5
      }
      
      请确保指导详细、实用，并包含专业的烹饪技巧。
      `

      // 调用GLM API
      const response = await callGLM(prompt, {
        temperature: 0.5,
        maxTokens: 1000,
      })

      // 解析JSON响应
      return parseJsonResponse<{
        guidance: string
        tips: string[]
        nextStep?: string
        estimatedTime: number
      }>(response)
    } catch (error) {
      console.error('GLM获取烹饪指导失败:', error)
      return {
        guidance: '按照步骤进行操作',
        tips: ['注意火候', '及时调味'],
        nextStep: '继续下一步',
        estimatedTime: 5,
      }
    }
  }

  async validateIngredient(ingredient: string): Promise<IngredientValidationResult> {
    try {
      // 构建提示词
      const prompt = `
      请判断"${ingredient}"是否是可食用的食材。
      请严格按照以下JSON格式回答：
      {
        "isValid": true/false,
        "reason": "判断原因",
        "alternatives": ["替代食材1", "替代食材2"]
      }
      
      判断标准：
      1. 是否是真实存在的食材
      2. 是否可以安全食用
      3. 是否常用于烹饪
      
      只回答JSON格式，不要其他内容。
      `

      // 调用GLM API
      const response = await callGLM(prompt, {
        temperature: 0.3,
        maxTokens: 200,
      })

      // 解析JSON响应
      const result = parseJsonResponse<{
        isValid: boolean
        reason?: string
        alternatives?: string[]
      }>(response)

      return {
        isValid: result.isValid,
        reason: result.reason,
        alternatives: result.alternatives,
      }
    } catch (error) {
      console.error('GLM验证食材失败:', error)
      return {
        isValid: true,
        reason: '验证服务暂时不可用，请自行确认是否为可食用食材',
      }
    }
  }

  // 生成标签
  private generateTags(params: RecipeGenerationParams): string[] {
    const tags: string[] = []

    // 添加主要食材标签
    if (params.ingredients.length > 0) {
      tags.push(params.ingredients[0])
    }

    // 添加烹饪方式标签
    if (params.cookingMethods && params.cookingMethods.length > 0) {
      tags.push(params.cookingMethods[0])
    }

    // 添加难度标签
    if (params.difficulty) {
      tags.push(params.difficulty)
    }

    // 添加饮食限制标签
    if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
      tags.push(params.dietaryRestrictions[0])
    }

    // 添加健康目标标签
    if (params.healthGoals && params.healthGoals.length > 0) {
      tags.push(params.healthGoals[0])
    }

    return tags
  }

  // 辅助方法：将文件转换为base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }
}

export default new GLMProvider()
