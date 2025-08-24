// AI 配置
export interface AIConfig {
  openai: {
    apiKey: string
    baseURL: string
    model: string
    maxTokens: number
    temperature: number
  }
  glm: {
    apiKey: string
    baseURL: string
    model: string
    maxTokens: number
    temperature: number
  }
  defaultProvider: 'openai' | 'glm' | 'mock'
  enableAI: boolean
  enableMockMode: boolean
}

export const AI_CONFIG: AIConfig = {
  // OpenAI 配置
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7
  },
  
  // GLM 配置
  glm: {
    apiKey: import.meta.env.VITE_GLM_API_KEY || '',
    baseURL: import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/',
    model: 'glm-4',
    maxTokens: 2000,
    temperature: 0.7
  },
  
  // 默认提供商
  defaultProvider: 'glm', // 强制使用GLM作为默认提供商
  
  // 功能开关
  enableAI: true, // 强制启用AI功能
  enableMockMode: false // 禁用模拟模式
}

// 默认AI配置导出
export const defaultAIConfig = {
  provider: 'glm',
  apiKey: import.meta.env.VITE_GLM_API_KEY || '',
  model: 'glm-4',
  temperature: 0.7,
  maxTokens: 1000
};

// 兼容性导出
export const aiConfig = AI_CONFIG;

// 默认导出
export default AI_CONFIG
