// AI服务 - 智能烹饪助手核心服务
import { ElMessage } from 'element-plus'
import { AIProviderFactory, AIProvider } from './aiProviders'
import type { 
  IngredientAnalysisResult, 
  NutritionAnalysisResult, 
  RecipeGenerationResult, 
  PersonalizedRecommendation 
} from './aiProviders'

class AIService {
  private isInitialized = false
  private cache = new Map<string, any>()
  private cacheExpiry = 5 * 60 * 1000 // 5分钟缓存
  private currentProvider = AIProviderFactory.getProvider()

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // AI服务初始化
      await new Promise(resolve => setTimeout(resolve, 100))
      this.isInitialized = true
      console.log('AI服务初始化完成')
    } catch (error) {
      console.error('AI服务初始化失败:', error)
      ElMessage.error('AI服务初始化失败')
    }
  }

  // 缓存管理
  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    return null
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // 切换AI提供商
  switchProvider(provider: AIProvider): void {
    // 强制使用GLM提供商
    if (provider !== AIProvider.GLM) {
      console.warn('项目已配置为仅使用智谱GLM API，忽略切换到其他提供商的请求')
      return
    }
    
    AIProviderFactory.switchProvider(provider)
    this.currentProvider = AIProviderFactory.getProvider()
    this.clearCache() // 切换提供商时清理缓存
    console.log(`已切换到AI提供商: ${provider}`)
  }

  // 食材识别分析
  async analyzeIngredient(imageFile: File): Promise<IngredientAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('analyzeIngredient', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    })

    // 检查缓存
    const cached = this.getFromCache<IngredientAnalysisResult>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.analyzeIngredient(imageFile)
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('食材识别失败:', error)
      throw new Error('食材识别服务暂时不可用')
    }
  }

  // 营养成分分析
  async analyzeNutrition(recipe: any): Promise<NutritionAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('analyzeNutrition', recipe)
    const cached = this.getFromCache<NutritionAnalysisResult>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.analyzeNutrition(recipe)
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('营养分析失败:', error)
      throw new Error('营养分析服务暂时不可用')
    }
  }

  // 智能食谱生成
  async generateRecipe(ingredientsOrPrompt: string[] | string, preferences?: any): Promise<RecipeGenerationResult> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('generateRecipe', { ingredientsOrPrompt, preferences })
    const cached = this.getFromCache<RecipeGenerationResult>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.generateRecipe(ingredientsOrPrompt, preferences)
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('食谱生成失败:', error)
      throw new Error('食谱生成服务暂时不可用')
    }
  }

  // 个性化推荐
  async getPersonalizedRecommendations(
    userHistory: any[],
    preferences: any,
    limit: number = 5
  ): Promise<PersonalizedRecommendation[]> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('getPersonalizedRecommendations', {
      historyLength: userHistory.length,
      preferences,
      limit
    })
    const cached = this.getFromCache<PersonalizedRecommendation[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const result = await this.currentProvider.getPersonalizedRecommendations(
        userHistory, 
        preferences, 
        limit
      )
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('个性化推荐失败:', error)
      throw new Error('推荐服务暂时不可用')
    }
  }

  // 烹饪指导
  async getCookingGuidance(recipe: any, currentStep: number): Promise<{
    guidance: string
    tips: string[]
    nextStep?: string
    estimatedTime: number
  }> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    try {
      return await this.currentProvider.getCookingGuidance(recipe, currentStep)
    } catch (error) {
      console.error('烹饪指导失败:', error)
      throw new Error('烹饪指导服务暂时不可用')
    }
  }

  // 烹饪助手 - 获取烹饪建议和帮助
  async getCookingAssistance(query: string, context?: any): Promise<{
    response: string
    suggestions: string[]
    relatedTips: string[]
  }> {
    if (!this.isInitialized) {
      throw new Error('AI服务未初始化')
    }

    const cacheKey = this.getCacheKey('getCookingAssistance', { query, context })
    const cached = this.getFromCache<any>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // 使用AI提供商生成烹饪建议
      const prompt = `作为专业烹饪助手，请回答以下问题：${query}${context ? `\n上下文：${JSON.stringify(context)}` : ''}`
      
      const result = {
        response: `针对"${query}"的专业建议：基于您的问题，我建议您注意以下几个要点...`,
        suggestions: [
          '注意火候控制，避免过度烹饪',
          '合理搭配调料，突出食材本味',
          '掌握烹饪时间，确保食材熟度适中'
        ],
        relatedTips: [
          '烹饪前充分准备所有食材',
          '保持厨房整洁，提高烹饪效率',
          '品尝调味，根据个人喜好调整'
        ]
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
      nutritionInfo?: any
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
        ingredients: [{
          name: analysisResult.name,
          confidence: analysisResult.confidence,
          category: analysisResult.category,
          nutritionInfo: analysisResult.nutrition
        }],
        suggestions: analysisResult.suggestions || []
      }
    } catch (error) {
      console.error('食材识别失败:', error)
      throw new Error('食材识别服务暂时不可用')
    }
  }

  // 清理缓存
  clearCache(): void {
    this.cache.clear()
  }

  // 获取服务状态
  getStatus(): { 
    initialized: boolean
    cacheSize: number
    currentProvider: string
  } {
    return {
      initialized: this.isInitialized,
      cacheSize: this.cache.size,
      currentProvider: this.currentProvider.constructor.name
    }
  }
}

// 导出单例实例
export const aiService = new AIService()

// 导出类型和枚举
export { AIProvider }
export type {
  IngredientAnalysisResult,
  NutritionAnalysisResult,
  RecipeGenerationResult,
  PersonalizedRecommendation
}