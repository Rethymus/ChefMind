import { ref, computed } from 'vue'

export interface AIProvider {
  name: string
  key: string
  hasKey: boolean
  isConfigured: boolean
}

export function useAIConfig() {
  // AI 提供商配置
  const providers = computed((): AIProvider[] => [
    {
      name: 'OpenAI',
      key: 'VITE_OPENAI_API_KEY',
      hasKey: !!import.meta.env.VITE_OPENAI_API_KEY,
      isConfigured: !!import.meta.env.VITE_OPENAI_API_KEY
    },
    {
      name: 'GLM',
      key: 'VITE_GLM_API_KEY',
      hasKey: !!import.meta.env.VITE_GLM_API_KEY,
      isConfigured: !!import.meta.env.VITE_GLM_API_KEY
    }
  ])

  // 检查是否有任何 AI 提供商已配置
  const hasAnyProvider = computed(() => {
    return providers.value.some(p => p.isConfigured)
  })

  // 获取已配置的提供商
  const configuredProviders = computed(() => {
    return providers.value.filter(p => p.isConfigured)
  })

  // 检查是否使用模拟数据
  const isUsingMockData = computed(() => {
    return !hasAnyProvider.value
  })

  // 检查特定提供商是否配置
  const isProviderConfigured = (providerName: string) => {
    const provider = providers.value.find(p => p.name.toLowerCase() === providerName.toLowerCase())
    return provider?.isConfigured || false
  }

  // 获取配置状态信息
  const getConfigStatus = () => {
    const configured = configuredProviders.value
    const total = providers.value.length

    return {
      configured: configured.length,
      total,
      hasAny: hasAnyProvider.value,
      isMock: isUsingMockData.value,
      providers: providers.value,
      configuredProviders: configured
    }
  }

  // 生成环境变量配置示例
  const generateEnvExample = () => {
    return `# AI API 密钥配置
# 请在项目根目录创建 .env 文件并添加以下配置：

# OpenAI API 密钥 (可选)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# GLM API 密钥 (可选)  
VITE_GLM_API_KEY=your_glm_api_key_here

# 注意：至少配置一个 API 密钥即可使用真实的 AI 功能
# 未配置时将使用模拟数据进行演示`
  }

  return {
    providers,
    hasAnyProvider,
    configuredProviders,
    isUsingMockData,
    isProviderConfigured,
    getConfigStatus,
    generateEnvExample
  }
}