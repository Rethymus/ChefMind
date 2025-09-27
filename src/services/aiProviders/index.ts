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
  private isInitialized = false

  private constructor() {
    const enableMockMode = import.meta.env.VITE_ENABLE_MOCK_MODE === 'true'
    const envProvider = import.meta.env.VITE_AI_PROVIDER

    if (enableMockMode) {
      this.currentProviderName = 'mock'
    } else if (envProvider && envProvider !== 'mock') {
      this.currentProviderName = envProvider
    } else {
      this.currentProviderName = 'mock'
    }

    this.currentProvider = this.selectProvider(this.currentProviderName)
    // Don't call async method in constructor
  }

  /**
   * 初始化提供商（需要在实例创建后调用）
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }
    await this.initializeProvider()
    this.isInitialized = true
  }

  private async initializeProvider(): Promise<void> {
    try {
      // 检查是否启用模拟模式
      const enableMockMode = import.meta.env.VITE_ENABLE_MOCK_MODE === 'true'

      if (!enableMockMode) {
        // 获取通用配置
        const genericApiKey = import.meta.env.VITE_API_KEY
        const genericProvider = import.meta.env.VITE_AI_PROVIDER
        const genericBaseUrl = import.meta.env.VITE_API_BASE_URL
        const genericModel = import.meta.env.VITE_API_MODEL

        if (genericApiKey) {
          // 如果有通用API密钥，测试连接性
          const availableProviders = [
            { name: 'qwen', apiKey: genericApiKey, baseUrl: genericBaseUrl, model: genericModel },
            { name: 'glm', apiKey: genericApiKey, baseUrl: genericBaseUrl, model: genericModel },
            { name: 'openai', apiKey: genericApiKey, baseUrl: genericBaseUrl, model: genericModel },
            {
              name: 'anthropic',
              apiKey: genericApiKey,
              baseUrl: genericBaseUrl,
              model: genericModel,
            },
            { name: 'gemini', apiKey: genericApiKey, baseUrl: genericBaseUrl, model: genericModel },
            {
              name: 'deepseek',
              apiKey: genericApiKey,
              baseUrl: genericBaseUrl,
              model: genericModel,
            },
            {
              name: 'moonshot',
              apiKey: genericApiKey,
              baseUrl: genericBaseUrl,
              model: genericModel,
            },
            {
              name: 'hunyuan',
              apiKey: genericApiKey,
              baseUrl: genericBaseUrl,
              model: genericModel,
            },
          ]

          // 优先使用指定的提供商，如果没有指定则按顺序测试
          const providersToTest = genericProvider
            ? [
                availableProviders.find(p => p.name === genericProvider),
                ...availableProviders.filter(p => p.name !== genericProvider),
              ]
            : availableProviders

          for (const provider of providersToTest) {
            if (!provider) continue

            if (
              await this.testProviderConnectivity(
                provider.name,
                provider.apiKey,
                provider.baseUrl,
                provider.model
              )
            ) {
              this.currentProviderName = provider.name
              this.currentProvider = this.selectProvider(
                provider.name,
                provider.apiKey,
                provider.baseUrl,
                provider.model
              )
              return
            }
          }
        }

        // 如果通用配置不可用，尝试检查具体提供商配置
        const configuredProviders = await this.getConfiguredProviders()
        if (configuredProviders.length > 0) {
          const preferredProvider = this.findPreferredProvider(configuredProviders)
          if (preferredProvider) {
            this.currentProviderName = preferredProvider
            this.currentProvider = this.selectProvider(preferredProvider)
            return
          }
        }
      }

      // 如果所有真实提供商都不可用，使用mock
      this.currentProviderName = 'mock'
      this.currentProvider = this.selectProvider('mock')
    } catch (error) {
      console.warn('初始化AI提供商失败:', error)
      this.currentProviderName = 'mock'
      this.currentProvider = this.selectProvider('mock')
    }
  }

  private async testProviderConnectivity(
    providerName: string,
    apiKey: string,
    baseUrl?: string,
    model?: string
  ): Promise<boolean> {
    try {
      const provider = this.selectProvider(providerName, apiKey, baseUrl, model)

      // 简单的连接测试 - 发送一个小的测试请求
      const testPrompt = '请回复"连接成功"'
      await provider.generateRecipe(['test'])

      return true
    } catch (error) {
      return false
    }
  }

  private async getConfiguredProviders(): Promise<string[]> {
    const providers: string[] = []

    // 检查各个提供商是否有配置
    if (import.meta.env.VITE_OPENAI_API_KEY) providers.push('openai')
    if (import.meta.env.VITE_GLM_API_KEY) providers.push('glm')
    if (import.meta.env.VITE_ANTHROPIC_API_KEY) providers.push('anthropic')
    if (import.meta.env.VITE_GOOGLE_API_KEY) providers.push('gemini')
    if (import.meta.env.VITE_DEEPSEEK_API_KEY) providers.push('deepseek')
    if (import.meta.env.VITE_MOONSHOT_API_KEY) providers.push('moonshot')
    if (import.meta.env.VITE_QWEN_API_KEY) providers.push('qwen')
    if (import.meta.env.VITE_HUNYUAN_API_KEY) providers.push('hunyuan')

    return providers
  }

  private findPreferredProvider(configuredProviders: string[]): string | null {
    // 按优先级排序的提供商列表
    const providerPriority = [
      'GLM',
      'OpenAI',
      'Anthropic',
      'Gemini',
      'DeepSeek',
      'Moonshot',
      'Qwen',
      'Hunyuan',
    ]

    for (const provider of providerPriority) {
      if (configuredProviders.includes(provider)) {
        return provider.toLowerCase()
      }
    }

    return configuredProviders[0]?.toLowerCase() || null
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
   * @param apiKey 可选的API密钥
   * @param baseUrl 可选的基础URL
   * @param model 可选的模型名称
   * @returns 新的AI提供者实例
   */
  public switchProvider(
    providerName: string,
    apiKey?: string,
    baseUrl?: string,
    model?: string
  ): BaseAIProvider {
    this.currentProviderName = providerName
    this.currentProvider = this.selectProvider(providerName, apiKey, baseUrl, model)
    // Switched to AI provider: ${providerName}
    return this.currentProvider
  }

  /**
   * 根据提供者名称选择AI提供者
   * @param providerName 提供者名称
   * @param apiKey 可选的API密钥
   * @param baseUrl 可选的基础URL
   * @param model 可选的模型名称
   * @returns AI提供者实例
   */
  private selectProvider(
    providerName: string,
    apiKey?: string,
    baseUrl?: string,
    model?: string
  ): BaseAIProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        // Using OpenAI-compatible provider (Qwen in this case)
        return new QwenProvider(apiKey, baseUrl)
      case 'glm':
        // Using GLM provider
        return new GLMProvider(apiKey)
      case 'anthropic':
        // Using Anthropic Claude provider
        return new AnthropicProvider(apiKey)
      case 'gemini':
        // Using Google Gemini provider
        return new GeminiProvider(apiKey)
      case 'deepseek':
        // Using DeepSeek provider
        return new DeepSeekProvider(apiKey)
      case 'moonshot':
        // Using Moonshot provider
        return new MoonshotProvider(apiKey)
      case 'qwen':
        // Using Qwen provider
        return new QwenProvider(apiKey, baseUrl, model)
      case 'hunyuan':
        // Using Hunyuan provider
        return new HunyuanProvider(apiKey)
      case 'mock':
      default:
        // Using mock provider
        return mockProvider
    }
  }

  /**
   * 获取所有可用的AI提供者列表
   * @returns 提供者列表
   */
  public getAvailableProviders(): Array<{
    name: string
    displayName: string
    description: string
  }> {
    return [
      { name: 'glm', displayName: '智谱 GLM', description: '国内领先的大语言模型，支持中文优化' },
      {
        name: 'anthropic',
        displayName: 'Anthropic Claude',
        description: '强大的AI能力，擅长推理和创作',
      },
      {
        name: 'gemini',
        displayName: 'Google Gemini',
        description: 'Google的多模态AI模型，支持图片分析',
      },
      { name: 'deepseek', displayName: 'DeepSeek', description: '高性能AI模型，代码能力强' },
      { name: 'moonshot', displayName: 'Moonshot', description: '支持长文本的AI模型' },
      { name: 'qwen', displayName: '通义千问', description: '阿里云的大语言模型' },
      { name: 'hunyuan', displayName: '腾讯混元', description: '腾讯的大语言模型' },
      { name: 'openai', displayName: 'OpenAI GPT', description: '强大的AI能力，需要API密钥' },
      { name: 'mock', displayName: '模拟模式', description: '用于测试和演示' },
    ]
  }
}

/**
 * 当前使用的AI提供者
 * 可以根据环境变量或配置切换不同的AI提供者
 */

// 创建工厂实例
const aiProviderFactory = AIProviderFactory.getInstance()

// 导出当前AI提供者（延迟初始化）
const aiProvider = new Proxy({} as BaseAIProvider, {
  get: (target, prop) => {
    if (!aiProviderFactory['isInitialized']) {
      aiProviderFactory.initialize().catch(error => {
        console.error('AI提供商工厂初始化失败:', error)
      })
    }
    return aiProviderFactory.getProvider()[prop]
  },
})

// 导出AI提供者工厂
export { AIProviderFactory }

// 导出所有AI提供者类型
