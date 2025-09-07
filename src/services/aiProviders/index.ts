import type { BaseAIProvider } from './baseProvider'
import mockProvider from './mockProvider'
import { GLMProvider } from './glmProvider'
import { AnthropicProvider } from './anthropicProvider'
import { GeminiProvider } from './geminiProvider'
import { DeepSeekProvider } from './deepseekProvider'
import { MoonshotProvider } from './moonshotProvider'
import { QwenProvider } from './qwenProvider'
import { HunyuanProvider } from './hunyuanProvider'

/**
 * AI提供者工厂类
 * 用于创建和管理不同的AI提供者实例
 */
class AIProviderFactory {
  private static instance: AIProviderFactory
  private currentProvider: BaseAIProvider
  private currentProviderName: string

  private constructor() {
    this.currentProviderName = import.meta.env.VITE_AI_PROVIDER || 'mock'
    this.currentProvider = this.selectProvider(this.currentProviderName)
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
   * 获取当前AI提供者名称
   * @returns 当前AI提供者名称
   */
  public getProviderName(): string {
    return this.currentProviderName
  }

  /**
   * 切换AI提供者
   * @param providerName 提供者名称
   * @returns 新的AI提供者实例
   */
  public switchProvider(providerName: string): BaseAIProvider {
    this.currentProviderName = providerName
    this.currentProvider = this.selectProvider(providerName)
    console.log(`已切换到AI提供者: ${providerName}`)
    return this.currentProvider
  }

  /**
   * 根据提供者名称选择AI提供者
   * @param providerName 提供者名称
   * @returns AI提供者实例
   */
  private selectProvider(providerName: string): BaseAIProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        console.log('使用OpenAI提供者')
        // TODO: 实现OpenAI提供者
        return mockProvider // 暂时使用模拟提供者
      case 'glm':
        console.log('使用GLM提供者')
        return new GLMProvider()
      case 'anthropic':
        console.log('使用Anthropic Claude提供者')
        return new AnthropicProvider()
      case 'gemini':
        console.log('使用Google Gemini提供者')
        return new GeminiProvider()
      case 'deepseek':
        console.log('使用DeepSeek提供者')
        return new DeepSeekProvider()
      case 'moonshot':
        console.log('使用Moonshot提供者')
        return new MoonshotProvider()
      case 'qwen':
        console.log('使用Qwen提供者')
        return new QwenProvider()
      case 'hunyuan':
        console.log('使用Hunyuan提供者')
        return new HunyuanProvider()
      case 'mock':
      default:
        console.log('使用模拟提供者')
        return mockProvider
    }
  }

  /**
   * 获取所有可用的AI提供者列表
   * @returns 提供者列表
   */
  public getAvailableProviders(): Array<{ name: string; displayName: string; description: string }> {
    return [
      { name: 'glm', displayName: '智谱 GLM', description: '国内领先的大语言模型，支持中文优化' },
      { name: 'anthropic', displayName: 'Anthropic Claude', description: '强大的AI能力，擅长推理和创作' },
      { name: 'gemini', displayName: 'Google Gemini', description: 'Google的多模态AI模型，支持图片分析' },
      { name: 'deepseek', displayName: 'DeepSeek', description: '高性能AI模型，代码能力强' },
      { name: 'moonshot', displayName: 'Moonshot', description: '支持长文本的AI模型' },
      { name: 'qwen', displayName: '通义千问', description: '阿里云的大语言模型' },
      { name: 'hunyuan', displayName: '腾讯混元', description: '腾讯的大语言模型' },
      { name: 'openai', displayName: 'OpenAI GPT', description: '强大的AI能力，需要API密钥' },
      { name: 'mock', displayName: '模拟模式', description: '用于测试和演示' }
    ]
  }
}

/**
 * 当前使用的AI提供者
 * 可以根据环境变量或配置切换不同的AI提供者
 */

// 创建工厂实例
const aiProviderFactory = AIProviderFactory.getInstance()

// 导出当前AI提供者
export const aiProvider = aiProviderFactory.getProvider()

// 导出AI提供者工厂
export { AIProviderFactory }

// 导出所有AI提供者类型
export type { BaseAIProvider } from './baseProvider'
export type { Recipe, RecipeGenerationParams, IngredientValidationResult } from '@/types/recipe'
