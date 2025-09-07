import { computed } from 'vue'

export interface AIProvider {
  name: string
  key: string
  hasKey: boolean
  isConfigured: boolean
  source: 'env' | 'localStorage' | 'none'
}

export function useAIConfig() {
  // 获取 localStorage 配置
  const getLocalStorageConfigs = () => {
    try {
      const saved = localStorage.getItem('ai-api-configs')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  // AI 提供商配置
  const providers = computed((): AIProvider[] => {
    const localConfigs = getLocalStorageConfigs()
    
    return [
      {
        name: 'OpenAI',
        key: 'VITE_OPENAI_API_KEY',
        hasKey: !!import.meta.env.VITE_OPENAI_API_KEY || !!localConfigs.openai?.apiKey,
        isConfigured: !!import.meta.env.VITE_OPENAI_API_KEY || !!localConfigs.openai?.apiKey,
        source: import.meta.env.VITE_OPENAI_API_KEY ? 'env' : 
                localConfigs.openai?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: 'GLM',
        key: 'VITE_GLM_API_KEY',
        hasKey: !!import.meta.env.VITE_GLM_API_KEY || !!localConfigs.glm?.apiKey,
        isConfigured: !!import.meta.env.VITE_GLM_API_KEY || !!localConfigs.glm?.apiKey,
        source: import.meta.env.VITE_GLM_API_KEY ? 'env' : 
                localConfigs.glm?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: 'Claude',
        key: 'VITE_ANTHROPIC_API_KEY',
        hasKey: !!import.meta.env.VITE_ANTHROPIC_API_KEY || !!localConfigs.anthropic?.apiKey,
        isConfigured: !!import.meta.env.VITE_ANTHROPIC_API_KEY || !!localConfigs.anthropic?.apiKey,
        source: import.meta.env.VITE_ANTHROPIC_API_KEY ? 'env' : 
                localConfigs.anthropic?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: 'Gemini',
        key: 'VITE_GOOGLE_API_KEY',
        hasKey: !!import.meta.env.VITE_GOOGLE_API_KEY || !!localConfigs.google?.apiKey,
        isConfigured: !!import.meta.env.VITE_GOOGLE_API_KEY || !!localConfigs.google?.apiKey,
        source: import.meta.env.VITE_GOOGLE_API_KEY ? 'env' : 
                localConfigs.google?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: 'DeepSeek',
        key: 'VITE_DEEPSEEK_API_KEY',
        hasKey: !!import.meta.env.VITE_DEEPSEEK_API_KEY || !!localConfigs.deepseek?.apiKey,
        isConfigured: !!import.meta.env.VITE_DEEPSEEK_API_KEY || !!localConfigs.deepseek?.apiKey,
        source: import.meta.env.VITE_DEEPSEEK_API_KEY ? 'env' : 
                localConfigs.deepseek?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: 'Moonshot',
        key: 'VITE_MOONSHOT_API_KEY',
        hasKey: !!import.meta.env.VITE_MOONSHOT_API_KEY || !!localConfigs.moonshot?.apiKey,
        isConfigured: !!import.meta.env.VITE_MOONSHOT_API_KEY || !!localConfigs.moonshot?.apiKey,
        source: import.meta.env.VITE_MOONSHOT_API_KEY ? 'env' : 
                localConfigs.moonshot?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: '通义千问',
        key: 'VITE_QWEN_API_KEY',
        hasKey: !!import.meta.env.VITE_QWEN_API_KEY || !!localConfigs.qwen?.apiKey,
        isConfigured: !!import.meta.env.VITE_QWEN_API_KEY || !!localConfigs.qwen?.apiKey,
        source: import.meta.env.VITE_QWEN_API_KEY ? 'env' : 
                localConfigs.qwen?.apiKey ? 'localStorage' : 'none'
      },
      {
        name: '混元',
        key: 'VITE_HUNYUAN_API_KEY',
        hasKey: !!import.meta.env.VITE_HUNYUAN_API_KEY || !!localConfigs.hunyuan?.apiKey,
        isConfigured: !!import.meta.env.VITE_HUNYUAN_API_KEY || !!localConfigs.hunyuan?.apiKey,
        source: import.meta.env.VITE_HUNYUAN_API_KEY ? 'env' : 
                localConfigs.hunyuan?.apiKey ? 'localStorage' : 'none'
      }
    ]
  })

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

# Anthropic Claude API 密钥 (可选)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Gemini API 密钥 (可选)
VITE_GOOGLE_API_KEY=your_google_api_key_here

# DeepSeek API 密钥 (可选)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Moonshot API 密钥 (可选)
VITE_MOONSHOT_API_KEY=your_moonshot_api_key_here

# 通义千问 API 密钥 (可选)
VITE_QWEN_API_KEY=your_qwen_api_key_here

# 腾讯混元 API 密钥 (可选)
VITE_HUNYUAN_API_KEY=your_hunyuan_api_key_here

# 注意：至少配置一个 API 密钥即可使用真实的 AI 功能
# 未配置时将使用模拟数据进行演示
#
# 💡 提示：您也可以通过导航栏的配置按钮直接在浏览器中设置 API 密钥`
  }

  // 获取指定提供商的 API 密钥
  const getProviderKey = (providerName: string) => {
    const localConfigs = getLocalStorageConfigs()
    const providerKeyMap: Record<string, string> = {
      'openai': 'VITE_OPENAI_API_KEY',
      'glm': 'VITE_GLM_API_KEY',
      'claude': 'VITE_ANTHROPIC_API_KEY',
      'gemini': 'VITE_GOOGLE_API_KEY',
      'deepseek': 'VITE_DEEPSEEK_API_KEY',
      'moonshot': 'VITE_MOONSHOT_API_KEY',
      'qwen': 'VITE_QWEN_API_KEY',
      'hunyuan': 'VITE_HUNYUAN_API_KEY'
    }
    
    const envKey = providerKeyMap[providerName.toLowerCase()]
    if (!envKey) return null
    
    return import.meta.env[envKey] || localConfigs[providerName.toLowerCase()]?.apiKey
  }

  return {
    providers,
    hasAnyProvider,
    configuredProviders,
    isUsingMockData,
    isProviderConfigured,
    getConfigStatus,
    generateEnvExample,
    getProviderKey
  }
}