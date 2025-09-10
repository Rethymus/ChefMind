import { ref, watch } from 'vue'
import { userDatabaseService } from '@/services/database'

export interface AIProvider {
  name: string
  key: string
  hasKey: boolean
  isConfigured: boolean
  source: 'env' | 'database' | 'none'
}

export function useAIConfig() {
  let currentSessionId: string | null = null

  // 获取当前会话ID
  const getCurrentSessionId = async (): Promise<string> => {
    if (!currentSessionId) {
      const session = await userDatabaseService.getCurrentSession()
      currentSessionId = session.sessionId
    }
    return currentSessionId
  }

  // 获取数据库配置
  const getDatabaseConfigs = async () => {
    try {
      const sessionId = await getCurrentSessionId()
      const preferences = await userDatabaseService.getPreferences(sessionId)
      return (preferences as any).aiConfigs || {}
    } catch {
      return {}
    }
  }

  // 获取 AI 提供商配置
  const getProviders = async (): Promise<AIProvider[]> => {
    const dbConfigs = await getDatabaseConfigs()
    
    return [
      {
        name: 'OpenAI',
        key: 'VITE_OPENAI_API_KEY',
        hasKey: !!import.meta.env.VITE_OPENAI_API_KEY || !!dbConfigs.openai?.apiKey,
        isConfigured: !!import.meta.env.VITE_OPENAI_API_KEY || !!dbConfigs.openai?.apiKey,
        source: import.meta.env.VITE_OPENAI_API_KEY ? 'env' : 
                dbConfigs.openai?.apiKey ? 'database' : 'none'
      },
      {
        name: 'GLM',
        key: 'VITE_GLM_API_KEY',
        hasKey: !!import.meta.env.VITE_GLM_API_KEY || !!dbConfigs.glm?.apiKey,
        isConfigured: !!import.meta.env.VITE_GLM_API_KEY || !!dbConfigs.glm?.apiKey,
        source: import.meta.env.VITE_GLM_API_KEY ? 'env' : 
                dbConfigs.glm?.apiKey ? 'database' : 'none'
      },
      {
        name: 'Claude',
        key: 'VITE_ANTHROPIC_API_KEY',
        hasKey: !!import.meta.env.VITE_ANTHROPIC_API_KEY || !!dbConfigs.anthropic?.apiKey,
        isConfigured: !!import.meta.env.VITE_ANTHROPIC_API_KEY || !!dbConfigs.anthropic?.apiKey,
        source: import.meta.env.VITE_ANTHROPIC_API_KEY ? 'env' : 
                dbConfigs.anthropic?.apiKey ? 'database' : 'none'
      },
      {
        name: 'Gemini',
        key: 'VITE_GOOGLE_API_KEY',
        hasKey: !!import.meta.env.VITE_GOOGLE_API_KEY || !!dbConfigs.google?.apiKey,
        isConfigured: !!import.meta.env.VITE_GOOGLE_API_KEY || !!dbConfigs.google?.apiKey,
        source: import.meta.env.VITE_GOOGLE_API_KEY ? 'env' : 
                dbConfigs.google?.apiKey ? 'database' : 'none'
      },
      {
        name: 'DeepSeek',
        key: 'VITE_DEEPSEEK_API_KEY',
        hasKey: !!import.meta.env.VITE_DEEPSEEK_API_KEY || !!dbConfigs.deepseek?.apiKey,
        isConfigured: !!import.meta.env.VITE_DEEPSEEK_API_KEY || !!dbConfigs.deepseek?.apiKey,
        source: import.meta.env.VITE_DEEPSEEK_API_KEY ? 'env' : 
                dbConfigs.deepseek?.apiKey ? 'database' : 'none'
      },
      {
        name: 'Moonshot',
        key: 'VITE_MOONSHOT_API_KEY',
        hasKey: !!import.meta.env.VITE_MOONSHOT_API_KEY || !!dbConfigs.moonshot?.apiKey,
        isConfigured: !!import.meta.env.VITE_MOONSHOT_API_KEY || !!dbConfigs.moonshot?.apiKey,
        source: import.meta.env.VITE_MOONSHOT_API_KEY ? 'env' : 
                dbConfigs.moonshot?.apiKey ? 'database' : 'none'
      },
      {
        name: '通义千问',
        key: 'VITE_QWEN_API_KEY',
        hasKey: !!import.meta.env.VITE_QWEN_API_KEY || !!dbConfigs.qwen?.apiKey,
        isConfigured: !!import.meta.env.VITE_QWEN_API_KEY || !!dbConfigs.qwen?.apiKey,
        source: import.meta.env.VITE_QWEN_API_KEY ? 'env' : 
                dbConfigs.qwen?.apiKey ? 'database' : 'none'
      },
      {
        name: '混元',
        key: 'VITE_HUNYUAN_API_KEY',
        hasKey: !!import.meta.env.VITE_HUNYUAN_API_KEY || !!dbConfigs.hunyuan?.apiKey,
        isConfigured: !!import.meta.env.VITE_HUNYUAN_API_KEY || !!dbConfigs.hunyuan?.apiKey,
        source: import.meta.env.VITE_HUNYUAN_API_KEY ? 'env' : 
                dbConfigs.hunyuan?.apiKey ? 'database' : 'none'
      }
    ]
  }

  // 检查是否有任何 AI 提供商已配置
  const hasAnyProvider = async (): Promise<boolean> => {
    const providers = await getProviders()
    return providers.some(p => p.isConfigured)
  }

  // 获取已配置的提供商
  const getConfiguredProviders = async (): Promise<AIProvider[]> => {
    const providers = await getProviders()
    return providers.filter(p => p.isConfigured)
  }

  // 检查是否使用模拟数据
  const isUsingMockData = async (): Promise<boolean> => {
    return !(await hasAnyProvider())
  }

  // 检查特定提供商是否配置
  const isProviderConfigured = async (providerName: string): Promise<boolean> => {
    const providers = await getProviders()
    const provider = providers.find(p => p.name.toLowerCase() === providerName.toLowerCase())
    return provider?.isConfigured || false
  }

  // 获取配置状态信息
  const getConfigStatus = async () => {
    const providers = await getProviders()
    const configured = await getConfiguredProviders()
    const hasAny = await hasAnyProvider()
    const isMock = await isUsingMockData()

    return {
      configured: configured.length,
      total: providers.length,
      hasAny,
      isMock,
      providers,
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
  const getProviderKey = async (providerName: string): Promise<string | null> => {
    const dbConfigs = await getDatabaseConfigs()
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
    
    return import.meta.env[envKey] || dbConfigs[providerName.toLowerCase()]?.apiKey
  }

  // 保存 API 配置到数据库
  const saveApiConfig = async (providerName: string, apiKey: string): Promise<void> => {
    try {
      const sessionId = await getCurrentSessionId()
      const preferences = await userDatabaseService.getPreferences(sessionId)
      const aiConfigs = (preferences as any).aiConfigs || {}
      
      aiConfigs[providerName.toLowerCase()] = { apiKey }
      
      await userDatabaseService.updatePreferences(sessionId, {
        ...preferences,
        aiConfigs
      })
    } catch (error) {
      console.error('保存 API 配置失败:', error)
      throw error
    }
  }

  // 删除 API 配置
  const deleteApiConfig = async (providerName: string): Promise<void> => {
    try {
      const sessionId = await getCurrentSessionId()
      const preferences = await userDatabaseService.getPreferences(sessionId)
      const aiConfigs = (preferences as any).aiConfigs || {}
      
      delete aiConfigs[providerName.toLowerCase()]
      
      await userDatabaseService.updatePreferences(sessionId, {
        ...preferences,
        aiConfigs
      })
    } catch (error) {
      console.error('删除 API 配置失败:', error)
      throw error
    }
  }

  return {
    getProviders,
    hasAnyProvider,
    getConfiguredProviders,
    isUsingMockData,
    isProviderConfigured,
    getConfigStatus,
    generateEnvExample,
    getProviderKey,
    saveApiConfig,
    deleteApiConfig
  }
}