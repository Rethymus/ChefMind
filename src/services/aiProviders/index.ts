import type { BaseAIProvider } from './baseProvider'
import mockProvider from './mockProvider'
import { OpenAICompatibleProvider } from './openAICompatibleProvider'
import { aiConfigService } from '@/services/aiConfig'

export type AIProviderName = 'openai' | 'mock'

/**
 * The application has one active BYOK connection. Provider presets only supply
 * an OpenAI-compatible endpoint, model, and documentation link; no provider is
 * treated as the application's default model.
 */
class AIProviderFactory {
  private static instance: AIProviderFactory
  private currentProvider: BaseAIProvider = mockProvider
  private currentProviderName: AIProviderName = 'mock'
  private isInitialized = false

  private constructor() {}

  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory()
    }
    return AIProviderFactory.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    const savedConfig = await aiConfigService.getProviderConfig('openai')
    if (savedConfig?.isConfigured && savedConfig.baseUrl && savedConfig.model) {
      this.switchProvider(
        'openai',
        savedConfig.apiKey || undefined,
        savedConfig.baseUrl,
        savedConfig.model
      )
    }

    this.isInitialized = true
  }

  public getProvider(): BaseAIProvider {
    return this.currentProvider
  }

  public getProviderName(): AIProviderName {
    return this.currentProviderName
  }

  public switchProvider(
    providerName: AIProviderName | string,
    apiKey?: string,
    baseUrl?: string,
    model?: string
  ): BaseAIProvider {
    if (providerName === 'openai') {
      this.currentProviderName = 'openai'
      this.currentProvider = new OpenAICompatibleProvider(apiKey, baseUrl, model, 'openai')
      return this.currentProvider
    }

    this.currentProviderName = 'mock'
    this.currentProvider = mockProvider
    return this.currentProvider
  }

  public getAvailableProviders(): Array<{
    name: AIProviderName
    displayName: string
    description: string
  }> {
    return [
      {
        name: 'openai',
        displayName: 'OpenAI-compatible BYOK',
        description: '使用你在模型供应商处创建的 API Key、Base URL 与模型名称。',
      },
      { name: 'mock', displayName: '模拟模式', description: '用于离线演示和测试。' },
    ]
  }
}

const aiProviderFactory = AIProviderFactory.getInstance()

const aiProvider = new Proxy({} as BaseAIProvider, {
  get: (_target, prop) => {
    if (!aiProviderFactory['isInitialized']) {
      aiProviderFactory.initialize().catch(error => {
        console.error('AI Provider 初始化失败:', error)
      })
    }
    return aiProviderFactory.getProvider()[prop]
  },
})

export { AIProviderFactory, aiProvider }
