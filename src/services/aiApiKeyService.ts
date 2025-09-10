import { userDatabaseService } from './database'

/**
 * AI API 密钥管理服务
 */
export class AIApiKeyService {
  /**
   * 获取用户的所有AI API配置
   */
  async getUserApiConfigs(sessionId: string): Promise<Record<string, any>> {
    try {
      const preferences = await userDatabaseService.getPreferences(sessionId)
      return (preferences as any).aiConfigs || {}
    } catch (error) {
      console.error('获取用户AI API配置失败:', error)
      return {}
    }
  }

  /**
   * 获取特定提供商的API密钥
   */
  async getApiKey(sessionId: string, providerName: string): Promise<string | null> {
    try {
      const configs = await this.getUserApiConfigs(sessionId)
      return configs[providerName.toLowerCase()]?.apiKey || null
    } catch (error) {
      console.error(`获取${providerName} API密钥失败:`, error)
      return null
    }
  }

  /**
   * 保存API密钥
   */
  async saveApiKey(sessionId: string, providerName: string, apiKey: string): Promise<boolean> {
    try {
      const preferences = await userDatabaseService.getPreferences(sessionId)
      const aiConfigs = (preferences as any).aiConfigs || {}
      
      aiConfigs[providerName.toLowerCase()] = { apiKey }
      
      await userDatabaseService.updatePreferences(sessionId, {
        ...preferences,
        aiConfigs
      })
      
      console.log(`✅ ${providerName} API密钥保存成功`)
      return true
    } catch (error) {
      console.error(`保存${providerName} API密钥失败:`, error)
      return false
    }
  }

  /**
   * 删除API密钥
   */
  async deleteApiKey(sessionId: string, providerName: string): Promise<boolean> {
    try {
      const preferences = await userDatabaseService.getPreferences(sessionId)
      const aiConfigs = (preferences as any).aiConfigs || {}
      
      if (aiConfigs[providerName.toLowerCase()]) {
        delete aiConfigs[providerName.toLowerCase()]
        
        await userDatabaseService.updatePreferences(sessionId, {
          ...preferences,
          aiConfigs
        })
        
        console.log(`✅ ${providerName} API密钥删除成功`)
        return true
      }
      
      return false
    } catch (error) {
      console.error(`删除${providerName} API密钥失败:`, error)
      return false
    }
  }

  /**
   * 检查API密钥是否存在
   */
  async hasApiKey(sessionId: string, providerName: string): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey(sessionId, providerName)
      return !!apiKey && apiKey.trim() !== ''
    } catch (error) {
      console.error(`检查${providerName} API密钥失败:`, error)
      return false
    }
  }

  /**
   * 获取已配置的提供商列表
   */
  async getConfiguredProviders(sessionId: string): Promise<string[]> {
    try {
      const configs = await this.getUserApiConfigs(sessionId)
      return Object.keys(configs).filter(provider => 
        configs[provider]?.apiKey && configs[provider].apiKey.trim() !== ''
      )
    } catch (error) {
      console.error('获取已配置提供商列表失败:', error)
      return []
    }
  }

  /**
   * 验证API密钥格式
   */
  validateApiKeyFormat(providerName: string, apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === '') {
      return false
    }

    const trimmedKey = apiKey.trim()
    
    // 基本格式验证
    switch (providerName.toLowerCase()) {
      case 'openai':
        // OpenAI API密钥通常以 sk- 开头
        return trimmedKey.startsWith('sk-') && trimmedKey.length >= 20
      
      case 'anthropic':
      case 'claude':
        // Anthropic API密钥通常以 sk-ant- 开头
        return trimmedKey.startsWith('sk-ant-') && trimmedKey.length >= 20
      
      case 'google':
      case 'gemini':
        // Google API密钥格式相对简单
        return trimmedKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(trimmedKey)
      
      case 'deepseek':
        // DeepSeek API密钥通常以 sk- 开头
        return trimmedKey.startsWith('sk-') && trimmedKey.length >= 20
      
      case 'moonshot':
        // Moonshot API密钥格式
        return trimmedKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(trimmedKey)
      
      case 'glm':
        // GLM API密钥格式
        return trimmedKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(trimmedKey)
      
      case 'qwen':
      case 'hunyuan':
        // 阿里云和腾讯云API密钥格式
        return trimmedKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(trimmedKey)
      
      default:
        // 通用验证
        return trimmedKey.length >= 10
    }
  }

  /**
   * 获取提供商信息
   */
  getProviderInfo(providerName: string): {
    name: string
    key: string
    description: string
    website?: string
  } {
    const providerInfo: Record<string, any> = {
      openai: {
        name: 'OpenAI',
        key: 'VITE_OPENAI_API_KEY',
        description: 'GPT-4, GPT-3.5 等模型',
        website: 'https://platform.openai.com'
      },
      anthropic: {
        name: 'Anthropic',
        key: 'VITE_ANTHROPIC_API_KEY',
        description: 'Claude 3, Claude 2 等模型',
        website: 'https://console.anthropic.com'
      },
      claude: {
        name: 'Claude',
        key: 'VITE_ANTHROPIC_API_KEY',
        description: 'Claude 3, Claude 2 等模型',
        website: 'https://console.anthropic.com'
      },
      google: {
        name: 'Google',
        key: 'VITE_GOOGLE_API_KEY',
        description: 'Gemini Pro, Gemini Ultra 等模型',
        website: 'https://aistudio.google.com'
      },
      gemini: {
        name: 'Gemini',
        key: 'VITE_GOOGLE_API_KEY',
        description: 'Gemini Pro, Gemini Ultra 等模型',
        website: 'https://aistudio.google.com'
      },
      deepseek: {
        name: 'DeepSeek',
        key: 'VITE_DEEPSEEK_API_KEY',
        description: 'DeepSeek-V2, DeepSeek-Coder 等模型',
        website: 'https://platform.deepseek.com'
      },
      moonshot: {
        name: 'Moonshot',
        key: 'VITE_MOONSHOT_API_KEY',
        description: 'Moonshot-v1-8k, Moonshot-v1-32k 等模型',
        website: 'https://platform.moonshot.cn'
      },
      glm: {
        name: 'GLM',
        key: 'VITE_GLM_API_KEY',
        description: 'GLM-4, GLM-3-Turbo 等模型',
        website: 'https://open.bigmodel.cn'
      },
      qwen: {
        name: '通义千问',
        key: 'VITE_QWEN_API_KEY',
        description: 'Qwen-Turbo, Qwen-Plus 等模型',
        website: 'https://dashscope.aliyun.com'
      },
      hunyuan: {
        name: '混元',
        key: 'VITE_HUNYUAN_API_KEY',
        description: 'Hunyuan, Hunyuan-pro 等模型',
        website: 'https://cloud.tencent.com'
      }
    }

    return providerInfo[providerName.toLowerCase()] || {
      name: providerName,
      key: '',
      description: '未知提供商'
    }
  }

  /**
   * 获取所有支持的提供商
   */
  getSupportedProviders(): Array<{
    name: string
    key: string
    description: string
    website?: string
  }> {
    return [
      this.getProviderInfo('openai'),
      this.getProviderInfo('claude'),
      this.getProviderInfo('gemini'),
      this.getProviderInfo('deepseek'),
      this.getProviderInfo('moonshot'),
      this.getProviderInfo('glm'),
      this.getProviderInfo('qwen'),
      this.getProviderInfo('hunyuan')
    ]
  }

  /**
   * 备份API配置
   */
  async backupApiConfigs(sessionId: string): Promise<string> {
    try {
      const configs = await this.getUserApiConfigs(sessionId)
      return JSON.stringify(configs, null, 2)
    } catch (error) {
      console.error('备份API配置失败:', error)
      throw error
    }
  }

  /**
   * 恢复API配置
   */
  async restoreApiConfigs(sessionId: string, backupData: string): Promise<boolean> {
    try {
      const configs = JSON.parse(backupData)
      
      // 验证配置格式
      if (typeof configs !== 'object' || configs === null) {
        throw new Error('无效的配置格式')
      }
      
      const preferences = await userDatabaseService.getPreferences(sessionId)
      
      await userDatabaseService.updatePreferences(sessionId, {
        ...preferences,
        aiConfigs: configs
      })
      
      console.log('✅ API配置恢复成功')
      return true
    } catch (error) {
      console.error('恢复API配置失败:', error)
      return false
    }
  }
}

// 导出服务实例
export const aiApiKeyService = new AIApiKeyService()
export default aiApiKeyService