import { dataAccess } from '@/services/database/dataAccess'
import { normalizeProviderBaseUrl } from '@/services/providerEndpoint'

export interface AIProviderConfig {
  provider: string
  apiKey?: string
  baseUrl?: string
  model?: string
  presetId?: string
  isConfigured: boolean
  storage: 'memory' | 'native-keyring'
  updatedAt: string
}

const LEGACY_WEB_CONFIG_KEYS = ['ai-api-configs', 'ai_configs_memory'] as const
const DESKTOP_CONFIG_KEY = 'ai_openai_config'
const sessionConfigs = new Map<string, AIProviderConfig>()

const isTauri = () =>
  typeof window !== 'undefined' && typeof window.__TAURI__?.invoke === 'function'

const normalizeProvider = (provider: string) => provider.trim().toLowerCase()

/**
 * Keeps BYOK credentials out of browser persistent storage. Web keys live only
 * for the running page; desktop keys are written to the native credential store
 * by Rust while SQLite holds only non-secret connection metadata.
 */
export class AIConfigService {
  private static instance: AIConfigService
  private legacyStorageCleared = false

  public static getInstance(): AIConfigService {
    if (!AIConfigService.instance) {
      AIConfigService.instance = new AIConfigService()
    }
    return AIConfigService.instance
  }

  private clearLegacyWebKeyStorage(): void {
    if (this.legacyStorageCleared || typeof localStorage === 'undefined') return

    for (const key of LEGACY_WEB_CONFIG_KEYS) {
      localStorage.removeItem(key)
    }
    this.legacyStorageCleared = true
  }

  private async readDesktopConfig(provider: string): Promise<AIProviderConfig | null> {
    const record = await dataAccess.queryOne('SELECT value FROM settings WHERE key = ?', [
      `ai_${provider}_config`,
    ])

    if (!record?.value) return null

    try {
      const parsed = JSON.parse(String(record.value)) as AIProviderConfig
      const config: AIProviderConfig = {
        provider,
        baseUrl: parsed.baseUrl,
        model: parsed.model,
        presetId: parsed.presetId,
        isConfigured: true,
        storage: 'native-keyring',
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      }

      // One-time migration from releases that embedded the secret in SQLite.
      if (parsed.apiKey && window.__TAURI__?.invoke) {
        try {
          await window.__TAURI__.invoke('credential_store', {
            providerId: provider,
            apiKey: parsed.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
          })
          await this.writeDesktopConfig(config)
        } catch {
          // Do not retain a plaintext key when native migration cannot succeed.
          await dataAccess.execute('DELETE FROM settings WHERE key = ?', [
            `ai_${provider}_config`,
          ])
          return null
        }
      }

      return config
    } catch {
      return null
    }
  }

  private async writeDesktopConfig(config: AIProviderConfig): Promise<void> {
    const safeConfig = {
      provider: config.provider,
      baseUrl: config.baseUrl,
      model: config.model,
      presetId: config.presetId,
      isConfigured: true,
      storage: 'native-keyring' as const,
      updatedAt: config.updatedAt,
    }

    await dataAccess.execute(
      `INSERT INTO settings (key, value, category)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, category = excluded.category`,
      [`ai_${config.provider}_config`, JSON.stringify(safeConfig), 'ai_config']
    )
  }

  async saveApiKey(
    provider: string,
    apiKey: string,
    config: Partial<AIProviderConfig> = {}
  ): Promise<void> {
    const normalizedProvider = normalizeProvider(provider)
    const secret = apiKey.trim()
    if (!secret) throw new Error('API Key 不能为空')
    const baseUrl = normalizeProviderBaseUrl(config.baseUrl || '')
    const model = config.model?.trim()
    if (!model) throw new Error('模型名称不能为空')

    this.clearLegacyWebKeyStorage()

    const nextConfig: AIProviderConfig = {
      provider: normalizedProvider,
      apiKey: secret,
      baseUrl,
      model,
      presetId: config.presetId,
      isConfigured: true,
      storage: isTauri() ? 'native-keyring' : 'memory',
      updatedAt: new Date().toISOString(),
    }

    if (isTauri()) {
      await window.__TAURI__!.invoke!('credential_store', {
        providerId: normalizedProvider,
        apiKey: secret,
        baseUrl: nextConfig.baseUrl,
        model: nextConfig.model,
      })
      await this.writeDesktopConfig(nextConfig)
      return
    }

    sessionConfigs.set(normalizedProvider, nextConfig)
  }

  async getProviderConfig(provider: string): Promise<AIProviderConfig | null> {
    const normalizedProvider = normalizeProvider(provider)
    this.clearLegacyWebKeyStorage()

    if (isTauri()) {
      return this.readDesktopConfig(normalizedProvider)
    }

    return sessionConfigs.get(normalizedProvider) || null
  }

  async getApiKey(provider: string): Promise<string | null> {
    if (isTauri()) return null
    return (await this.getProviderConfig(provider))?.apiKey || null
  }

  async isProviderConfigured(provider: string): Promise<boolean> {
    return !!(await this.getProviderConfig(provider))?.isConfigured
  }

  async getConfiguredProviders(): Promise<string[]> {
    const configured = await this.getProviderConfig('openai')
    return configured?.isConfigured ? ['openai'] : []
  }

  async deleteProviderConfig(provider: string): Promise<void> {
    const normalizedProvider = normalizeProvider(provider)
    this.clearLegacyWebKeyStorage()

    if (isTauri()) {
      await window.__TAURI__!.invoke!('credential_delete', { providerId: normalizedProvider })
      await dataAccess.execute('DELETE FROM settings WHERE key = ?', [
        `ai_${normalizedProvider}_config`,
      ])
    }

    sessionConfigs.delete(normalizedProvider)
  }

  async clearAllConfigs(): Promise<void> {
    await this.deleteProviderConfig('openai')
    sessionConfigs.clear()
    this.clearLegacyWebKeyStorage()
  }
}

export const aiConfigService = AIConfigService.getInstance()
