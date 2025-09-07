import type { 
  RecipeGenerationResult,
  IngredientAnalysisResult,
  NutritionAnalysisResult,
  PersonalizedRecommendation,
  Recipe,
} from '@/types/recipe'
import type { UserHistoryItem, UserPreferences } from '@/services/aiService'

export class OpenAIProvider {
  private apiKey: string
  private baseURL: string

  constructor(apiKey?: string, baseURL: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || ''
    this.baseURL = baseURL
  }

  async analyzeIngredient(_imageFile: File): Promise<IngredientAnalysisResult> {
    // 模拟食材识别
    return {
      name: '番茄',
      confidence: 0.95,
      category: '蔬菜',
      nutrition: {
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fat: 0.2,
        fiber: 1.2,
        vitamins: ['维生素C', '维生素K']
      },
      freshness: 0.8,
      suggestions: ['适合做番茄炒蛋', '可以用来做汤']
    }
  }

  async analyzeNutrition(_recipe: Recipe): Promise<NutritionAnalysisResult> {
    // 模拟营养分析
    return {
      calories: 350,
      protein: 25,
      carbs: 45,
      fat: 12,
      fiber: 8,
      vitamins: ['维生素A', '维生素C', '维生素D'],
      minerals: ['钙', '铁', '锌'],
      healthScore: 85,
      dietaryInfo: {
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        allergens: []
      },
      recommendations: ['营养均衡', '适合减脂期食用']
    }
  }

  async generateRecipe(
    ingredients: string[],
    preferences?: UserPreferences
  ): Promise<RecipeGenerationResult>
  async generateRecipe(params: {
    ingredients: string[]
    cookingMethod?: string
    difficulty?: string
    servings?: number
    dietaryRestrictions?: string[]
    preferences?: UserPreferences
  }): Promise<RecipeGenerationResult>
  async generateRecipe(
    ingredientsOrParams: string[] | {
      ingredients: string[]
      cookingMethod?: string
      difficulty?: string
      servings?: number
      dietaryRestrictions?: string[]
      preferences?: UserPreferences
    },
    _preferences?: UserPreferences
  ): Promise<RecipeGenerationResult> {
    try {
      // 处理参数
      let ingredients: string[]
      let cookingMethod: string | undefined
      let difficulty: string | undefined
      let servings: number | undefined

      if (Array.isArray(ingredientsOrParams)) {
        ingredients = ingredientsOrParams
      } else {
        ingredients = ingredientsOrParams.ingredients
        cookingMethod = ingredientsOrParams.cookingMethod
        difficulty = ingredientsOrParams.difficulty
        servings = ingredientsOrParams.servings
      }

      // 模拟生成食谱
      const recipe: RecipeGenerationResult = {
        id: `recipe_${Date.now()}`,
        title: `${ingredients.slice(0, 2).join('和')}${cookingMethod || '炒菜'}`,
        description: `使用${ingredients.join('、')}制作的美味${cookingMethod || '炒菜'}`,
        ingredients: ingredients.map(ingredient => `${ingredient} 适量`),
        instructions: [
          '准备所有食材，清洗干净',
          '热锅下油，爆香配料',
          '下主料翻炒',
          '调味炒匀即可出锅'
        ],
        cookingTime: 20,
        difficulty: (difficulty as 'easy' | 'medium' | 'hard') || 'easy',
        servings: servings || 2,
        tags: [cookingMethod || '家常菜', '快手菜'],
        nutrition: {
          calories: 280,
          protein: 15,
          carbs: 35,
          fat: 8,
          fiber: 5,
          vitamins: ['维生素A', '维生素C'],
          minerals: ['钙', '铁'],
          healthScore: 80,
          dietaryInfo: {
            isVegetarian: !ingredients.some(i => ['猪肉', '牛肉', '鸡肉', '鱼'].some(meat => i.includes(meat))),
            isVegan: !ingredients.some(i => ['猪肉', '牛肉', '鸡肉', '鱼', '鸡蛋', '牛奶'].some(animal => i.includes(animal))),
            isGlutenFree: !ingredients.some(i => ['面粉', '面条', '面包'].some(gluten => i.includes(gluten))),
            allergens: []
          },
          recommendations: ['营养丰富', '口感鲜美']
        }
      }

      return recipe
    } catch (error) {
      console.error('生成食谱失败:', error)
      throw new Error('生成食谱失败，请稍后重试')
    }
  }

  async getPersonalizedRecommendations(
    _userHistory: UserHistoryItem[],
    _preferences: UserPreferences,
    _limit: number
  ): Promise<PersonalizedRecommendation[]> {
    // 模拟个性化推荐
    return []
  }

  async getCookingGuidance(
    _recipe: Recipe,
    _currentStep: number
  ): Promise<{
    guidance: string
    tips: string[]
    nextStep?: string
    estimatedTime: number
  }> {
    return {
      guidance: '按照步骤进行操作',
      tips: ['注意火候', '及时调味'],
      nextStep: '下一步操作',
      estimatedTime: 5
    }
  }

  async validateIngredient(ingredient: string): Promise<{ isValid: boolean; reason?: string }> {
    try {
      console.log('🔍 OpenAI Provider 开始验证食材:', ingredient)
      
      // 检查是否有GLM API Key
      const glmApiKey = import.meta.env.VITE_GLM_API_KEY
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
      
      // 如果有真实的API Key，使用真实的AI服务
      if (glmApiKey && glmApiKey !== 'your_glm_api_key_here') {
        console.log('🤖 使用GLM AI API验证食材')
        try {
          const result = await this.callGLMAPI(ingredient)
          console.log('✅ GLM AI验证完成:', result)
          return result
        } catch (apiError) {
          console.warn('⚠️ GLM API调用失败，使用本地验证:', apiError)
          return this.intelligentLocalValidation(ingredient)
        }
      } else if (openaiApiKey && openaiApiKey !== 'your_openai_api_key_here') {
        console.log('🤖 使用OpenAI API验证食材')
        try {
          const result = await this.callOpenAIAPI(ingredient)
          console.log('✅ OpenAI验证完成:', result)
          return result
        } catch (apiError) {
          console.warn('⚠️ OpenAI API调用失败，使用本地验证:', apiError)
          return this.intelligentLocalValidation(ingredient)
        }
      } else {
        console.log('📝 使用本地智能验证（未配置真实API Key）')
        return this.intelligentLocalValidation(ingredient)
      }
      
    } catch (error) {
      console.error('❌ 验证食材失败:', error)
      return { 
        isValid: true, 
        reason: '验证服务暂时不可用，请自行确认是否为可食用食材' 
      }
    }
  }

  private async callGLMAPI(ingredient: string): Promise<{ isValid: boolean; reason?: string }> {
    const { callGLM } = await import('@/services/glmService')
    
    const prompt = `请判断"${ingredient}"是否是可食用的食材。
请严格按照以下JSON格式回答：
{
  "isValid": true/false,
  "reason": "判断原因"
}

判断标准：
1. 是否是真实存在的食材
2. 是否可以安全食用
3. 是否常用于烹饪

只回答JSON格式，不要其他内容。`

    try {
      const response = await callGLM(prompt, {
        temperature: 0.3,
        maxTokens: 200
      })
      
      // 解析AI响应
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          isValid: result.isValid,
          reason: result.reason || (result.isValid ? '通过AI验证' : 'AI判断不是有效食材')
        }
      } else {
        throw new Error('AI响应格式错误')
      }
    } catch (error) {
      console.error('GLM API调用失败:', error)
      throw error
    }
  }

  private async callOpenAIAPI(ingredient: string): Promise<{ isValid: boolean; reason?: string }> {
    // 这里可以实现OpenAI API调用
    // 暂时使用本地验证
    return this.intelligentLocalValidation(ingredient)
  }

  private intelligentLocalValidation(ingredient: string): { isValid: boolean; reason?: string } {
    console.log('🧠 执行本地智能验证')
    
    // 常见食材白名单
    const commonIngredients = [
      '土豆', '番茄', '洋葱', '大蒜', '生姜', '胡萝卜', '青椒', '白菜', '菠菜', '韭菜',
      '猪肉', '牛肉', '鸡肉', '鸭肉', '鱼', '虾', '蟹', '鸡蛋', '豆腐', '腊肉',
      '大米', '面条', '面粉', '馒头', '面包', '小米', '燕麦', '玉米', '红薯',
      '盐', '糖', '醋', '生抽', '老抽', '料酒', '香油', '胡椒粉', '花椒', '蚝油',
      '西红柿', '黄瓜', '茄子', '豆角', '冬瓜', '南瓜', '莲藕', '山药', '芹菜',
      '蘑菇', '木耳', '银耳', '豆芽', '莴笋', '萝卜', '白萝卜', '紫菜', '海带'
    ]
    
    // 明显的非食材关键词
    const invalidKeywords = ['毒', '有害', '不能吃', '危险', '化学', '药物', '清洁剂', '洗涤剂', '农药']
    
    // 检查有害关键词
    if (invalidKeywords.some(keyword => ingredient.includes(keyword))) {
      return { 
        isValid: false, 
        reason: `"${ingredient}" 包含有害成分，不能作为食材使用` 
      }
    }
    
    // 检查是否是常见食材
    if (commonIngredients.some(common => 
      common.includes(ingredient) || ingredient.includes(common)
    )) {
      return { 
        isValid: true, 
        reason: `"${ingredient}" 是常见的可食用食材` 
      }
    }
    
    // 格式验证
    if (ingredient.length < 2) {
      return { 
        isValid: false, 
        reason: '食材名称太短，请输入完整的食材名称' 
      }
    }
    
    if (ingredient.length > 10) {
      return { 
        isValid: false, 
        reason: '食材名称太长，请输入简洁的食材名称' 
      }
    }
    
    // 检查特殊字符
    // eslint-disable-next-line no-useless-escape
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(ingredient)) {
      return { 
        isValid: false, 
        reason: '食材名称不应包含数字或特殊字符' 
      }
    }
    
    // 智能判断：基于食材名称的特征
    const vegetableKeywords = ['菜', '瓜', '豆', '笋', '菇', '耳', '芽', '叶']
    const meatKeywords = ['肉', '鱼', '虾', '蟹', '鸡', '鸭', '牛', '猪', '羊']
    const grainKeywords = ['米', '面', '粉', '麦', '豆', '薯']
    const seasoningKeywords = ['盐', '糖', '醋', '油', '酱', '料', '椒', '葱', '蒜', '姜']
    
    const isLikelyFood = [...vegetableKeywords, ...meatKeywords, ...grainKeywords, ...seasoningKeywords]
      .some(keyword => ingredient.includes(keyword))
    
    if (isLikelyFood) {
      return { 
        isValid: true, 
        reason: `"${ingredient}" 看起来是可食用的食材` 
      }
    }
    
    // 对于未知食材，采用保守策略
    return { 
      isValid: false, 
      reason: `无法确认 "${ingredient}" 是否为有效食材，请输入常见食材名称` 
    }
  }
}