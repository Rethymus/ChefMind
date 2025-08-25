import type { BaseAIProvider } from './baseProvider'
import mockProvider from './mockProvider'
import { GLMProvider } from './glmProvider'

/**
 * AI提供者工厂类
 * 用于创建和管理不同的AI提供者实例
 */
class AIProviderFactory {
  private static instance: AIProviderFactory
  private currentProvider: BaseAIProvider

  private constructor() {
    this.currentProvider = this.selectProvider()
  }

  /**
   * 获取工厂实例
   * @returns AIProviderFactory实例
   */
  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory()
    }
    return AIProviderFactory.instance
  }

  /**
   * 获取当前AI提供者
   * @returns 当前AI提供者实例
   */
  public getProvider(): BaseAIProvider {
    return this.currentProvider
  }

  /**
   * 根据环境变量或配置选择AI提供者
   * @returns AI提供者实例
   */
  private selectProvider(): BaseAIProvider {
    // 这里可以根据环境变量或配置选择不同的AI提供者
    // 例如：process.env.VITE_AI_PROVIDER
    const providerName = import.meta.env.VITE_AI_PROVIDER || 'mock'
    
    switch (providerName.toLowerCase()) {
      case 'openai':
        // 如果有OpenAI提供者，可以在这里导入并返回
        // return openaiProvider
        console.log('OpenAI提供者尚未实现，使用模拟提供者')
        return mockProvider
      case 'glm':
        console.log('使用GLM提供者')
        // 创建GLM提供者实例
        return new GLMProvider()
      case 'mock':
      default:
        return mockProvider
    }
  }
}

/**
 * 当前使用的AI提供者
 * 可以根据环境变量或配置切换不同的AI提供者
 */
let currentProvider: BaseAIProvider

// 创建GLM提供者实例
const glmProvider = new GLMProvider()

// 根据环境变量或配置选择AI提供者
const selectProvider = (): BaseAIProvider => {
  // 这里可以根据环境变量或配置选择不同的AI提供者
  // 例如：process.env.VITE_AI_PROVIDER
  const providerName = import.meta.env.VITE_AI_PROVIDER || 'mock'
  
  switch (providerName.toLowerCase()) {
    case 'openai':
      // 如果有OpenAI提供者，可以在这里导入并返回
      // return openaiProvider
      console.log('OpenAI提供者尚未实现，使用模拟提供者')
      return mockProvider
    case 'glm':
      console.log('使用GLM提供者')
      return glmProvider as unknown as BaseAIProvider
    case 'mock':
    default:
      return mockProvider
  }
}

// 初始化AI提供者
currentProvider = selectProvider()

// 导出当前AI提供者
export const aiProvider = currentProvider

// 导出AI提供者工厂
export { AIProviderFactory }

// 导出所有AI提供者类型
export type { BaseAIProvider } from './baseProvider'
export type { Recipe, RecipeGenerationParams, IngredientValidationResult } from '@/types/recipe'