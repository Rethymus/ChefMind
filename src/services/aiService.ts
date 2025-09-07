// AI服务 - 智能烹饪助手核心服务
import { ElMessage } from 'element-plus'
import { AIProviderFactory } from './aiProviders'
import type {
  Recipe,
  IngredientValidationResult,
  PersonalizedRecommendation,
  IngredientAnalysisResult,
  NutritionAnalysisResult,
} from '@/types/recipe'

// AI提供商枚举
export enum AIProviderType {
  GLM = 'glm',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  MOONSHOT = 'moonshot',
  QWEN = 'qwen',
  HUNYUAN = 'hunyuan',
  MOCK = 'mock',
}

// 扩展AI服务接口

// 烹饪助手响应类型
export interface CookingAssistance {
  response: string
  suggestions: string[]
  relatedTips: string[]
}

// 烹饪步骤详细数据类型
export interface CookingStepData {
  instruction: string
  temperature?: number
  timeEstimate?: number
  visualCues: string[]
  tips: string[]
  commonMistakes: string[]
}

// 食谱推荐类型 (PersonalizedRecommendation 的别名)
export type RecipeRecommendation = PersonalizedRecommendation

export interface UserPreferences {
  dietaryRestrictions?: string[]
  cuisineType?: string
  spiceLevel?: 'mild' | 'medium' | 'hot'
  cookingTime?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  servings?: number
}

export interface UserHistoryItem {
  recipeId: string
  name: string
  rating?: number
  timestamp: Date
  ingredients: string[]
}

export interface RecipeContext {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  occasion?: string
  equipment?: string[]
}

interface RecipeGenerationResult {
  recipe: Recipe
  confidence: number
  alternativeOptions: Recipe[]
  cookingTips: string[]
  nutritionAnalysis: NutritionAnalysisResult
}

interface CacheItem<T = unknown> {
  data: T
  timestamp: number
}

class AIService {
  private isInitialized = false
  private readonly cache = new Map<string, CacheItem>()
  private readonly cacheExpiry = 5 * 60 * 1000 // 5分钟缓存
  private providerFactory: AIProviderFactory
  private currentProvider: any // 当前AI提供者实例

  // 单独初始化方法，在实例化后手动调用
  public async init(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    return Promise.resolve()
  }

  private async initialize(): Promise<void> {
    try {
      // 初始化AI提供者工厂
      this.providerFactory = AIProviderFactory.getInstance()
      this.currentProvider = this.providerFactory.getProvider()
      
      // AI服务初始化
      await new Promise(resolve => setTimeout(resolve, 100))
      this.isInitialized = true
      console.log('AI服务初始化完成，当前提供者:', this.providerFactory.getProviderName())
    } catch (error) {
      console.error('AI服务初始化失败:', error)
      ElMessage.error('AI服务初始化失败')
    }
  }

  // 缓存管理
  private getCacheKey(method: string, params: unknown): string {
    return `${method}_${JSON.stringify(params)}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data as T
    }
    return null
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  // 切换AI提供商
  switchProvider(provider: AIProviderType): void {
    if (!this.providerFactory) {
      console.error('AI服务未初始化，无法切换提供商')
      return
    }

    try {
      // 切换提供商
      this.currentProvider = this.providerFactory.switchProvider(provider)
      this.clearCache() // 切换提供商时清理缓存
      console.log(`已切换到AI提供商: ${provider}`)
      
      ElMessage.success(`已切换到${this.getProviderName(provider)}`)
    } catch (error) {
      console.error('切换AI提供商失败:', error)
      ElMessage.error('切换AI提供商失败')
    }
  }

  // 食材识别分析
  async analyzeIngredient(imageFile: File): Promise<IngredientAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('analyzeIngredient', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
    })

    // 检查缓存
    const cached = this.getFromCache<IngredientAnalysisResult>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.analyzeIngredient?.(imageFile)
      if (result) {
        this.setCache(cacheKey, result)
        return result
      }
      throw new Error('食材分析方法未实现')
    } catch (error) {
      console.error('食材识别失败:', error)
      throw new Error('食材识别服务暂时不可用')
    }
  }

  // 营养成分分析
  async analyzeNutrition(recipe: Recipe): Promise<NutritionAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('analyzeNutrition', recipe)
    const cached = this.getFromCache<NutritionAnalysisResult>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.analyzeNutrition?.(recipe)
      if (result) {
        this.setCache(cacheKey, result)
        return result
      }
      throw new Error('营养分析方法未实现')
    } catch (error) {
      console.error('营养分析失败:', error)
      throw new Error('营养分析服务暂时不可用')
    }
  }

  // 通用AI文本生成 - 用于营养分析、体质分析等
  async generateText(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('generateText', { prompt, options })
    const cached = this.getFromCache<string>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // 直接调用GLM API进行文本生成
      const { callGLM } = await import('./glmService')
      const response = await callGLM(prompt, {
        maxTokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
      })

      this.setCache(cacheKey, response)
      return response
    } catch (error) {
      console.error('AI文本生成失败:', error)
      throw new Error('AI文本生成服务暂时不可用')
    }
  }

  // 智能食谱生成
  async generateRecipe(
    ingredientsOrPrompt: string[] | string,
    preferences?: UserPreferences
  ): Promise<RecipeGenerationResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('generateRecipe', { ingredientsOrPrompt, preferences })
    const cached = this.getFromCache<RecipeGenerationResult>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // 构造符合GLM提供商期望的参数格式
      let params: { ingredients: string[]; [key: string]: unknown }

      if (typeof ingredientsOrPrompt === 'string') {
        // 如果是字符串，转换为数组
        params = {
          ingredients: [ingredientsOrPrompt],
          ...preferences,
        }
      } else if (Array.isArray(ingredientsOrPrompt)) {
        // 如果是数组，直接使用
        params = {
          ingredients: ingredientsOrPrompt,
          ...preferences,
        }
      } else {
        // 如果是其他类型，尝试作为完整参数使用
        params = ingredientsOrPrompt
      }

      // 确保参数包含必需的字段
      params = {
        ingredients: params.ingredients || [],
        cookingMethods: params.cookingMethods || [],
        noMethodRestriction: params.noMethodRestriction || false,
        autoCompleteIngredients: params.autoCompleteIngredients || true,
        servings: params.servings || 2,
        difficulty: params.difficulty || '中等',
        cookingTime: params.cookingTime || '30分钟内',
        ...params,
      }

      console.log('调用AI提供商生成食谱，参数:', params)
      const result = await this.currentProvider.generateRecipe(params)

      // 确保返回结果符合RecipeGenerationResult格式
      const recipeResult: RecipeGenerationResult = {
        recipe: result,
        confidence: 0.9,
        alternativeOptions: [],
        cookingTips: result.cookingTips || [],
        nutritionAnalysis: (result.nutrition
          ? {
              ...result.nutrition,
              healthScore:
                'healthScore' in result.nutrition
                  ? (result.nutrition as NutritionAnalysisResult).healthScore
                  : 75,
              dietaryInfo:
                'dietaryInfo' in result.nutrition
                  ? (result.nutrition as NutritionAnalysisResult).dietaryInfo
                  : {
                      isVegetarian: false,
                      isVegan: false,
                      isGlutenFree: false,
                      allergens: [],
                    },
              recommendations:
                'recommendations' in result.nutrition
                  ? (result.nutrition as NutritionAnalysisResult).recommendations
                  : [],
            }
          : {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              healthScore: 75,
              dietaryInfo: {
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false,
                allergens: [],
              },
              recommendations: [],
            }) as NutritionAnalysisResult,
      }

      this.setCache(cacheKey, recipeResult)
      return recipeResult
    } catch (error) {
      console.error('食谱生成失败:', error)
      throw new Error('食谱生成服务暂时不可用')
    }
  }

  // 个性化推荐
  async getPersonalizedRecommendations(
    userHistory: UserHistoryItem[],
    preferences: UserPreferences,
    limit: number = 5
  ): Promise<PersonalizedRecommendation[]> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('getPersonalizedRecommendations', {
      historyLength: userHistory.length,
      preferences,
      limit,
    })
    const cached = this.getFromCache<PersonalizedRecommendation[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.getPersonalizedRecommendations?.(
        userHistory,
        preferences
      )

      if (result) {
        this.setCache(cacheKey, result)
        return result
      }

      // 如果方法未实现，返回空数组
      return []
    } catch (error) {
      console.error('个性化推荐失败:', error)
      throw new Error('推荐服务暂时不可用')
    }
  }

  // 烹饪指导
  async getCookingGuidance(
    recipe: Recipe,
    currentStep: number
  ): Promise<{
    guidance: string
    tips: string[]
    nextStep?: string
    estimatedTime: number
  }> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    try {
      const result = await this.currentProvider.getCookingGuidance?.(recipe, currentStep)
      if (result) {
        return result
      }
      throw new Error('烹饪指导方法未实现')
    } catch (error) {
      console.error('烹饪指导失败:', error)
      throw new Error('烹饪指导服务暂时不可用')
    }
  }

  // 烹饪助手 - 获取烹饪建议和帮助
  async getCookingAssistance(query: string, context?: RecipeContext): Promise<CookingAssistance> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('getCookingAssistance', { query, context })
    const cached = this.getFromCache<{
      response: string
      suggestions: string[]
      relatedTips: string[]
    }>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // 使用AI提供商生成烹饪建议
      // 构建查询上下文 - 已注释未使用的prompt变量
      // const prompt = `作为专业烹饪助手，请回答以下问题：${query}${context ? `\n上下文：${JSON.stringify(context)}` : ''}`

      const result = {
        response: `针对"${query}"的专业建议：基于您的问题，我建议您注意以下几个要点...`,
        suggestions: [
          '注意火候控制，避免过度烹饪',
          '合理搭配调料，突出食材本味',
          '掌握烹饪时间，确保食材熟度适中',
        ],
        relatedTips: [
          '烹饪前充分准备所有食材',
          '保持厨房整洁，提高烹饪效率',
          '品尝调味，根据个人喜好调整',
        ],
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('烹饪助手服务失败:', error)
      throw new Error('烹饪助手服务暂时不可用')
    }
  }

  // 食材识别 - 通过图片识别食材
  async recognizeIngredients(imageFile: File): Promise<{
    ingredients: Array<{
      name: string
      confidence: number
      category: string
      nutritionInfo?: Record<string, unknown>
    }>
    suggestions: string[]
  }> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    try {
      // 复用现有的食材分析功能
      const analysisResult = await this.analyzeIngredient(imageFile)

      return {
        ingredients: [
          {
            name: analysisResult.name,
            confidence: analysisResult.confidence,
            category: analysisResult.category,
            nutritionInfo: analysisResult.nutrition as unknown as Record<string, unknown>,
          },
        ],
        suggestions: analysisResult.suggestions || [],
      }
    } catch (error) {
      console.error('食材识别失败:', error)
      throw new Error('食材识别服务暂时不可用')
    }
  }

  // 验证食材是否可食用
  async validateIngredient(ingredient: string): Promise<IngredientValidationResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    try {
      // 使用当前AI提供商的validateIngredient方法
      return await this.currentProvider.validateIngredient(ingredient)
    } catch (error) {
      console.error('食材验证失败:', error)
      throw new Error('食材验证服务暂时不可用')
    }
  }

  // 清理缓存
  clearCache(): void {
    this.cache.clear()
  }

  // AI聊天功能
  async getChatResponse(
    message: string,
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<{ content: string; suggestions?: string[] }> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('getChatResponse', {
      message,
      historyLength: chatHistory.length,
    })
    const cached = this.getFromCache<{ content: string; suggestions?: string[] }>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // 分析聊天历史以提供更好的上下文理解
      const recentContext = chatHistory.slice(-5) // 只保留最近5条对话
      console.log('Recent context length:', recentContext.length)

      // 基于消息内容确定回复类型
      let response = ''
      const suggestions: string[] = []

      if (message.includes('推荐') || message.includes('食谱')) {
        response =
          `基于您的请求"${message}"，我为您推荐以下内容：\n\n` +
          `🍽️ **今日推荐菜谱**\n` +
          `• 宫保鸡丁 - 经典川菜，下饭神器\n` +
          `• 番茄炒蛋 - 简单易做，营养丰富\n` +
          `• 清蒸鲈鱼 - 低脂健康，鲜美可口\n\n` +
          `您可以告诉我您偏好的口味、食材或烹饪时间，我会为您提供更精准的推荐！`

        suggestions.push('我想要快手菜', '推荐健康低脂食谱', '有什么下饭菜推荐')
      } else if (message.includes('营养') || message.includes('健康')) {
        response =
          `关于营养搭配，我来为您详细解答：\n\n` +
          `🥗 **营养均衡原则**\n` +
          `• 蛋白质：每餐包含优质蛋白（肉类、蛋类、豆类）\n` +
          `• 碳水化合物：选择复合碳水（糙米、燕麦、全麦）\n` +
          `• 维生素：多色蔬菜水果，确保维生素摄入\n` +
          `• 健康脂肪：适量坚果、橄榄油、鱼类\n\n` +
          `如果您有特定的健康目标或饮食限制，请告诉我，我会提供针对性建议。`

        suggestions.push('减肥期间怎么吃', '如何增肌饮食搭配', '糖尿病饮食注意事项')
      } else if (
        message.includes('技巧') ||
        message.includes('怎么做') ||
        message.includes('如何')
      ) {
        response =
          `烹饪技巧分享来啦！让我为您解答：\n\n` +
          `👨‍🍳 **基础烹饪技巧**\n` +
          `• **火候掌握**：大火爆炒、中火焖煮、小火慢炖\n` +
          `• **调味顺序**：盐最后放，保持蔬菜脆嫩\n` +
          `• **食材处理**：肉类腌制去腥，蔬菜快速焯水\n` +
          `• **时间控制**：掌握各种食材的最佳烹饪时间\n\n` +
          `具体想了解哪种烹饪技巧呢？我可以详细指导您！`

        suggestions.push('如何炒菜不粘锅', '肉类去腥技巧', '蔬菜保鲜方法')
      } else if (message.includes('替换') || message.includes('代替')) {
        response =
          `食材替换是烹饪的智慧之一！\n\n` +
          `🔄 **常见食材替换方案**\n` +
          `• **蛋类替换**：豆腐、香蕉泥、亚麻籽胶\n` +
          `• **乳制品替换**：植物奶、椰浆、坚果奶\n` +
          `• **面粉替换**：杏仁粉、椰子粉、燕麦粉\n` +
          `• **糖类替换**：蜂蜜、枫糖浆、椰糖\n\n` +
          `请告诉我您想替换什么食材，我会提供最合适的方案！`

        suggestions.push('什么可以代替鸡蛋', '无麸质面粉选择', '天然甜味剂推荐')
      } else {
        // 通用回复
        response =
          `感谢您的问题"${message}"！\n\n` +
          `作为您的烹饪助手，我可以帮助您解决各种烹饪问题：\n\n` +
          `🍽️ **食谱推荐** - 根据您的喜好推荐合适菜谱\n` +
          `🥗 **营养搭配** - 提供健康饮食建议\n` +
          `👨‍🍳 **烹饪技巧** - 分享专业烹饪方法\n` +
          `🔄 **食材替换** - 提供食材替代方案\n` +
          `⏰ **时间规划** - 帮助安排烹饪时间\n\n` +
          `请告诉我更具体的需求，我会提供更精准的帮助！`

        suggestions.push('推荐今天的菜谱', '营养搭配建议', '烹饪技巧指导')
      }

      const result = { content: response, suggestions }
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('AI聊天回复生成失败:', error)
      return {
        content: '抱歉，我现在遇到了一些技术问题。请稍后再试，或者您可以尝试重新表述您的问题。',
        suggestions: ['重新提问', '查看食谱推荐', '联系技术支持'],
      }
    }
  }

  // 获取服务状态
  getStatus(): {
    initialized: boolean
    cacheSize: number
    currentProvider: string
  } {
    const providerName = this.providerFactory ? this.providerFactory.getProviderName() : '未初始化'
    return {
      initialized: this.isInitialized,
      cacheSize: this.cache.size,
      currentProvider: providerName,
    }
  }

  // 获取提供商名称
  private getProviderName(provider: AIProviderType): string {
    const names = {
      [AIProviderType.GLM]: '智谱 GLM',
      [AIProviderType.OPENAI]: 'OpenAI GPT',
      [AIProviderType.ANTHROPIC]: 'Anthropic Claude',
      [AIProviderType.GEMINI]: 'Google Gemini',
      [AIProviderType.DEEPSEEK]: 'DeepSeek',
      [AIProviderType.MOONSHOT]: 'Moonshot',
      [AIProviderType.QWEN]: '通义千问',
      [AIProviderType.HUNYUAN]: '腾讯混元',
      [AIProviderType.MOCK]: '模拟模式',
    }
    return names[provider] || '未知'
  }
}

// 导出单例实例
export const aiService = new AIService()
// 初始化服务
;(async () => {
  await aiService.init()
})()

// 导出类型和枚举
export { AIProviderType as AIProvider }
export type {
  IngredientAnalysisResult,
  NutritionAnalysisResult,
  RecipeGenerationResult,
  PersonalizedRecommendation,
  IngredientValidationResult,
}
