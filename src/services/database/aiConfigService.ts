/**
 * AI配置数据库服务
 * 负责AI API密钥的数据库存储和管理
 */

// 静态导入dataAccess
import { dataAccess } from '@/services/database/dataAccess'

// 异步初始化dataAccess
async function initDataAccess() {
  return dataAccess
}

// 动态导入检测环境
const isNode = typeof process !== 'undefined' && 
               process.versions && 
               process.versions.node && 
               typeof window === 'undefined'

// 浏览器环境下的内存存储
class AIConfigMemoryStorage {
  private configs: Map<string, any> = new Map()

  constructor() {
    // 从localStorage恢复数据
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('ai_configs_memory')
      if (saved) {
        const data = JSON.parse(saved)
        this.configs = new Map(Object.entries(data))
        // console.log(`🔄 从localStorage恢复配置:`, Array.from(this.configs.keys()))
      }
    } catch (error) {
      console.warn('从localStorage恢复配置失败:', error)
    }
  }

  private saveToLocalStorage(): void {
    try {
      const data = Object.fromEntries(this.configs)
      localStorage.setItem('ai_configs_memory', JSON.stringify(data))
      // console.log(`💾 配置已保存到localStorage`)
    } catch (error) {
      console.error('保存配置到localStorage失败:', error)
    }
  }

  async saveConfig(provider: string, config: any): Promise<void> {
    const key = `ai_${provider.toLowerCase()}_config`
    const configToSave = {
      ...config,
      provider,
      updatedAt: new Date().toISOString()
    }
    this.configs.set(key, configToSave)
    this.saveToLocalStorage()
    // console.log(`💾 内存存储已保存配置: ${key}, 配置内容:`, configToSave)
    // console.log(`📊 当前内存存储中的所有配置:`, Array.from(this.configs.keys()))
  }

  async getConfig(provider: string): Promise<any | null> {
    const key = `ai_${provider.toLowerCase()}_config`
    const config = this.configs.get(key) || null
    // console.log(`🔍 内存存储查找配置: ${key}, 找到配置:`, config)
    // console.log(`📊 当前内存存储中的所有配置键:`, Array.from(this.configs.keys()))
    return config
  }

  async getAllConfigs(): Promise<any[]> {
    return Array.from(this.configs.values())
  }

  async deleteConfig(provider: string): Promise<void> {
    const key = `ai_${provider.toLowerCase()}_config`
    this.configs.delete(key)
    this.saveToLocalStorage()
    // console.log(`🗑️ 已删除配置: ${key}`)
  }

  async clearAllConfigs(): Promise<void> {
    this.configs.clear()
    this.saveToLocalStorage()
    // console.log(`🗑️ 已清空所有配置`)
  }
}

// 全局内存存储实例 - 使用全局变量确保单例
let globalMemoryStorage: AIConfigMemoryStorage | null = null

function getMemoryStorage(): AIConfigMemoryStorage {
  if (!globalMemoryStorage) {
    globalMemoryStorage = new AIConfigMemoryStorage()
    // 尝试从localStorage恢复数据
    restoreFromLocalStorage()
  }
  return globalMemoryStorage
}

// 从localStorage恢复数据到内存存储
function restoreFromLocalStorage() {
  if (!globalMemoryStorage) return
  
  try {
    const savedConfigs = localStorage.getItem('ai-api-configs')
    if (savedConfigs) {
      const parsed = JSON.parse(savedConfigs)
      Object.keys(parsed).forEach(provider => {
        const config = parsed[provider]
        if (config.apiKey) {
          const providerName = provider.toUpperCase()
          const configToSave = {
            ...config,
            provider: providerName,
            isConfigured: true,
            source: 'database' as const,
            updatedAt: new Date().toISOString()
          }
          globalMemoryStorage!.saveConfig(providerName, configToSave)
        }
      })
      // console.log('🔄 已从localStorage恢复配置到内存存储')
    }
  } catch (error) {
    console.warn('从localStorage恢复配置失败:', error)
  }
}

// SQLite 现在通过 dataAccess 统一管理，无需单独导入

export interface AIProviderConfig {
  id?: number
  provider: string
  apiKey: string
  baseUrl?: string
  model?: string
  isConfigured: boolean
  source: 'env' | 'database' | 'none'
  createdAt?: string
  updatedAt?: string
}

export class AIConfigService {
  private static instance: AIConfigService

  public static getInstance(): AIConfigService {
    if (!AIConfigService.instance) {
      AIConfigService.instance = new AIConfigService()
    }
    return AIConfigService.instance
  }

  /**
   * 从localStorage同步数据到内存存储
   */
  private syncFromLocalStorage(): void {
    try {
      const savedConfigs = localStorage.getItem('ai-api-configs')
      if (savedConfigs) {
        const parsed = JSON.parse(savedConfigs)
        Object.keys(parsed).forEach(provider => {
          const config = parsed[provider]
          if (config.apiKey) {
            const providerName = provider.toUpperCase()
            const configToSave = {
              ...config,
              provider: providerName,
              isConfigured: true,
              source: 'database' as const,
              updatedAt: new Date().toISOString()
            }
            getMemoryStorage().saveConfig(providerName, configToSave)
          }
        })
        // console.log('🔄 已同步localStorage配置到内存存储')
      }
    } catch (error) {
      console.warn('同步localStorage配置失败:', error)
    }
  }

  /**
   * 保存AI API密钥到数据库
   */
  async saveApiKey(provider: string, apiKey: string, config: Partial<AIProviderConfig> = {}): Promise<void> {
    // 同步localStorage到内存存储
    this.syncFromLocalStorage()
    try {
      // console.log(`💾 正在保存 ${provider} API 配置...`)
      // console.log(`🔍 环境检测: isNode=${isNode}`)
      
      // 检查是否已存在该提供商的配置
      const existing = await this.getProviderConfig(provider)
      
      const newConfig = {
        ...existing,
        provider,
        apiKey,
        ...config,
        isConfigured: true,
        source: 'database',
        updatedAt: new Date().toISOString()
      }
      
      if (!existing) {
        newConfig.createdAt = new Date().toISOString()
      }
      
      if (isNode) {
        // Node.js 环境：使用 SQLite 通过 dataAccess
        // console.log(`🗄️ 使用 SQLite 保存 ${provider} 配置`)
        try {
          const db = await initDataAccess()
          if (db) {
            if (existing) {
              await db.queryOne(
                `UPDATE settings SET value = ? WHERE key = ?`,
                [JSON.stringify(newConfig), `ai_${provider.toLowerCase()}_config`]
              )
            } else {
              await db.queryOne(
                `INSERT INTO settings (key, value, category) VALUES (?, ?, ?)`,
                [
                  `ai_${provider.toLowerCase()}_config`,
                  JSON.stringify(newConfig),
                  'ai_config'
                ]
              )
            }
          } else {
            throw new Error('数据库访问模块不可用')
          }
        } catch (error) {
          console.warn('SQLite 操作失败，回退到内存存储:', error)
          // 回退到内存存储
          await getMemoryStorage().saveConfig(provider, newConfig)
          this.saveToLocalStorage(provider, newConfig)
        }
      } else {
        // 浏览器环境：使用内存存储
        // console.log(`🧠 使用内存存储保存 ${provider} 配置`)
        await getMemoryStorage().saveConfig(provider, newConfig)
        
        // 同时保存到 localStorage 以确保数据持久化
        this.saveToLocalStorage(provider, newConfig)
      }
      
      // console.log(`✅ AI ${provider} API密钥已保存`)
      // console.log(`📊 当前内存存储中的所有配置键:`, Array.from(getMemoryStorage()['configs'].keys()))
    } catch (error) {
      console.error(`❌ 保存AI ${provider} API密钥失败:`, error)
      throw error
    }
  }

  /**
   * 保存配置到 localStorage
   */
  private saveToLocalStorage(provider: string, config: AIProviderConfig): void {
    try {
      const savedConfigs = localStorage.getItem('ai-api-configs')
      const allConfigs = savedConfigs ? JSON.parse(savedConfigs) : {}
      
      allConfigs[provider.toLowerCase()] = {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.model
      }
      
      localStorage.setItem('ai-api-configs', JSON.stringify(allConfigs))
      // console.log(`💾 配置已同步保存到 localStorage: ${provider}`)
    } catch (error) {
      console.error(`保存配置到 localStorage 失败:`, error)
    }
  }

  /**
   * 获取AI提供商配置
   */
  async getProviderConfig(provider: string): Promise<AIProviderConfig | null> {
    try {
      // console.log(`🔍 正在获取 ${provider} 配置...`)
      // console.log(`🔍 环境检测: isNode=${isNode}`)
      
      // 同步localStorage到内存存储
      this.syncFromLocalStorage()
      
      if (isNode) {
        // Node.js 环境：使用 SQLite 通过 dataAccess
        // console.log(`🗄️ 使用 SQLite 获取 ${provider} 配置`)
        try {
          const db = await initDataAccess()
          if (db) {
            const result = await db.queryOne(
              `SELECT value FROM settings WHERE key = ?`,
              [`ai_${provider.toLowerCase()}_config`]
            )

            if (result && result.value) {
              // console.log(`✅ 从 SQLite 找到 ${provider} 配置`)
              return JSON.parse(result.value)
            }
          } else {
            throw new Error('数据库访问模块不可用')
          }
        } catch (error) {
          console.warn('SQLite 查询失败，回退到内存存储:', error)
        }
      } else {
        // 浏览器环境：使用内存存储
        // console.log(`🧠 使用内存存储获取 ${provider} 配置`)
        const config = await getMemoryStorage().getConfig(provider)
        if (config) {
          // console.log(`✅ 从内存存储找到 ${provider} 配置`)
        } else {
          // console.log(`❌ 内存存储中未找到 ${provider} 配置`)
        }
        return config
      }
      
      // console.log(`❌ 未找到 ${provider} 配置`)
      return null
    } catch (error) {
      console.error(`❌ 获取AI ${provider} 配置失败:`, error)
      return null
    }
  }

  /**
   * 获取所有AI提供商配置
   */
  async getAllProviderConfigs(): Promise<AIProviderConfig[]> {
    try {
      if (isNode) {
        // Node.js 环境：使用 SQLite 通过 dataAccess
        try {
          const db = await initDataAccess()
          if (db) {
            const results = await db.query(
              `SELECT key, value FROM settings WHERE key LIKE 'ai_%_config'`
            )

            const configs: AIProviderConfig[] = []

            for (const row of results) {
              try {
                const config = JSON.parse(row.value)
                configs.push(config)
              } catch (error) {
                console.warn(`解析AI配置失败: ${row.key}`, error)
              }
            }

            return configs
          } else {
            throw new Error('数据库访问模块不可用')
          }
        } catch (error) {
          console.warn('SQLite 查询失败，回退到内存存储:', error)
          return await getMemoryStorage().getAllConfigs()
        }
      } else {
        // 浏览器环境：使用内存存储
        return await getMemoryStorage().getAllConfigs()
      }
    } catch (error) {
      console.error('❌ 获取所有AI配置失败:', error)
      return []
    }
  }

  /**
   * 删除AI提供商配置
   */
  async deleteProviderConfig(provider: string): Promise<void> {
    try {
      if (isNode) {
        // Node.js 环境：使用 SQLite 通过 dataAccess
        try {
          const db = await initDataAccess()
          if (db) {
            await db.queryOne(
              `DELETE FROM settings WHERE key = ?`,
              [`ai_${provider.toLowerCase()}_config`]
            )
          } else {
            throw new Error('数据库访问模块不可用')
          }
        } catch (error) {
          console.warn('SQLite 删除失败，回退到内存存储:', error)
          await getMemoryStorage().deleteConfig(provider)
        }
      } else {
        // 浏览器环境：使用内存存储
        await getMemoryStorage().deleteConfig(provider)
      }
      
      // console.log(`✅ AI ${provider} 配置已删除`)
    } catch (error) {
      console.error(`❌ 删除AI ${provider} 配置失败:`, error)
      throw error
    }
  }

  /**
   * 获取特定提供商的API密钥
   */
  async getApiKey(provider: string): Promise<string | null> {
    try {
      // 首先检查环境变量
      const envKey = `VITE_${provider.toUpperCase()}_API_KEY`
      const envValue = import.meta.env[envKey]
      
      // 检查是否为占位符值
      const isPlaceholder = envValue && (
        envValue === 'your_glm_api_key_here' ||
        envValue === 'your_api_key_here' ||
        envValue.includes('your_') ||
        envValue.length < 30
      )
      
      // console.log(`🔍 getApiKey调试:`, {
      //   provider,
      //   envKey,
      //   envValue: envValue ? '已设置: ' + envValue.substring(0, 10) + '...' : '未设置',
      //   envValueLength: envValue?.length,
      //   isPlaceholder
      // })
      
      if (envValue && !isPlaceholder) {
        // console.log(`✅ 使用有效的环境变量API密钥: ${envValue.substring(0, 10)}...`)
        return envValue
      } else if (envValue && isPlaceholder) {
        // console.log(`⚠️ 环境变量为占位符值，忽略并使用配置的API密钥`)
      }
      
      // 然后检查数据库/内存存储
      const config = await this.getProviderConfig(provider)
      const configValue = config?.apiKey || null
      
      // console.log(`🔍 getApiKey配置调试:`, {
      //   hasConfig: !!config,
      //   configValue: configValue ? '已设置: ' + configValue.substring(0, 10) + '...' : '未设置',
      //   configValueLength: configValue?.length
      // })
      
      if (configValue) {
        // console.log(`✅ 使用配置的API密钥: ${configValue.substring(0, 10)}...`)
        return configValue
      }
      
      // console.log(`❌ 未找到有效的API密钥`)
      return null
    } catch (error) {
      console.error(`❌ 获取AI ${provider} API密钥失败:`, error)
      return null
    }
  }

  /**
   * 检查提供商是否已配置
   */
  async isProviderConfigured(provider: string): Promise<boolean> {
    try {
      // 检查环境变量
      const envKey = `VITE_${provider.toUpperCase()}_API_KEY`
      if (import.meta.env[envKey]) {
        return true
      }
      
      // 检查数据库/内存存储
      const config = await this.getProviderConfig(provider)
      return config?.isConfigured || false
    } catch (error) {
      console.error(`❌ 检查AI ${provider} 配置状态失败:`, error)
      return false
    }
  }

  /**
   * 获取所有已配置的提供商
   */
  async getConfiguredProviders(): Promise<string[]> {
    try {
      const allProviders = ['OpenAI', 'GLM', 'Anthropic', 'Google', 'DeepSeek', 'Moonshot', 'Qwen', 'Hunyuan']
      const configured: string[] = []
      
      for (const provider of allProviders) {
        if (await this.isProviderConfigured(provider)) {
          configured.push(provider)
        }
      }
      
      return configured
    } catch (error) {
      console.error('❌ 获取已配置的AI提供商失败:', error)
      return []
    }
  }

  /**
   * 更新提供商配置
   */
  async updateProviderConfig(provider: string, updates: Partial<AIProviderConfig>): Promise<void> {
    try {
      const existing = await this.getProviderConfig(provider)
      if (!existing) {
        throw new Error(`提供商 ${provider} 的配置不存在`)
      }
      
      const updatedConfig = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      if (isNode) {
        // Node.js 环境：使用 SQLite 通过 dataAccess
        try {
          const db = await initDataAccess()
          if (db) {
            await db.queryOne(
              `UPDATE settings SET value = ? WHERE key = ?`,
              [JSON.stringify(updatedConfig), `ai_${provider.toLowerCase()}_config`]
            )
          } else {
            throw new Error('数据库访问模块不可用')
          }
        } catch (error) {
          console.warn('SQLite 更新失败，回退到内存存储:', error)
          await getMemoryStorage().saveConfig(provider, updatedConfig)
        }
      } else {
        // 浏览器环境：使用内存存储
        await getMemoryStorage().saveConfig(provider, updatedConfig)
      }
      
      // console.log(`✅ AI ${provider} 配置已更新`)
    } catch (error) {
      console.error(`❌ 更新AI ${provider} 配置失败:`, error)
      throw error
    }
  }

  /**
   * 获取配置统计信息
   */
  async getConfigStats(): Promise<{
    total: number
    configured: number
    providers: Array<{ name: string; configured: boolean; source: string }>
  }> {
    try {
      const allProviders = [
        { name: 'OpenAI', key: 'openai' },
        { name: 'GLM', key: 'glm' },
        { name: 'Anthropic', key: 'anthropic' },
        { name: 'Google', key: 'google' },
        { name: 'DeepSeek', key: 'deepseek' },
        { name: 'Moonshot', key: 'moonshot' },
        { name: 'Qwen', key: 'qwen' },
        { name: 'Hunyuan', key: 'hunyuan' }
      ]
      
      const providers = allProviders.map(async (provider) => {
        const envKey = `VITE_${provider.name.toUpperCase()}_API_KEY`
        const hasEnvKey = !!import.meta.env[envKey]
        const hasDbConfig = await this.isProviderConfigured(provider.name)
        
        return {
          name: provider.name,
          configured: hasEnvKey || hasDbConfig,
          source: hasEnvKey ? 'env' : hasDbConfig ? 'database' : 'none'
        }
      })
      
      const resolvedProviders = await Promise.all(providers)
      
      return {
        total: allProviders.length,
        configured: resolvedProviders.filter(p => p.configured).length,
        providers: resolvedProviders
      }
    } catch (error) {
      console.error('❌ 获取配置统计失败:', error)
      return {
        total: 0,
        configured: 0,
        providers: []
      }
    }
  }

  /**
   * 清理所有AI配置（仅限数据库中的配置）
   */
  async clearAllConfigs(): Promise<void> {
    try {
      if (isNode) {
        // Node.js 环境：使用 SQLite 通过 dataAccess
        try {
          const db = await initDataAccess()
          if (db) {
            await db.queryOne(
              `DELETE FROM settings WHERE key LIKE 'ai_%_config'`
            )
          } else {
            throw new Error('数据库访问模块不可用')
          }
        } catch (error) {
          console.warn('SQLite 清理失败，回退到内存存储:', error)
          await getMemoryStorage().clearAllConfigs()
        }
      } else {
        // 浏览器环境：使用内存存储
        await getMemoryStorage().clearAllConfigs()
      }
      
      // console.log('✅ 所有AI配置已清理')
    } catch (error) {
      console.error('❌ 清理AI配置失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const aiConfigService = AIConfigService.getInstance()