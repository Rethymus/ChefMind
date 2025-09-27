/**
 * 统一AI配置管理入口
 * 解决动态导入导致的多个实例问题
 */

import { aiConfigService } from './database/aiConfigService'

// 重新导出单例实例
export { aiConfigService }

// 为了向后兼容，导出常用的方法
const getAIConfigService = () => aiConfigService

// 常用方法的快捷导出
const saveApiKey = (provider: string, apiKey: string, config?: any) =>
  aiConfigService.saveApiKey(provider, apiKey, config)

const getApiKey = (provider: string) => aiConfigService.getApiKey(provider)

const getProviderConfig = (provider: string) => aiConfigService.getProviderConfig(provider)

const isProviderConfigured = (provider: string) =>
  aiConfigService.isProviderConfigured(provider)

const getConfiguredProviders = () => aiConfigService.getConfiguredProviders()

