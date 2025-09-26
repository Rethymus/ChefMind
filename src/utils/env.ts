/**
 * 环境变量管理工具
 * 从多个来源加载环境变量，优先级：环境变量 > .env 文件
 */
export interface EnvConfig {
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  AI_SERVICE_URL?: string
}

class EnvManager {
  private static instance: EnvManager
  private config: EnvConfig = {}

  private constructor() {
    this.loadEnv()
  }

  public static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager()
    }
    return EnvManager.instance
  }

  private loadEnv(): void {
    // 优先从环境变量读取（CI/CD 环境）
    this.config.OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    this.config.ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
    this.config.AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || process.env.AI_SERVICE_URL

    // 开发环境：检查是否有必需的环境变量
    if (process.env.NODE_ENV === 'development') {
      this.validateEnv()
    }
  }

  private validateEnv(): void {
    const requiredKeys = []

    if (!this.config.OPENAI_API_KEY && !this.config.ANTHROPIC_API_KEY) {
      requiredKeys.push('OPENAI_API_KEY 或 ANTHROPIC_API_KEY')
    }

    if (requiredKeys.length > 0) {
      console.warn(`⚠️ 缺少必需的环境变量: ${requiredKeys.join(', ')}`)
      console.warn('请设置相应的环境变量或创建 .env 文件')
    }
  }

  public getConfig(): EnvConfig {
    return { ...this.config }
  }

  public getApiKey(): string {
    return this.config.OPENAI_API_KEY || this.config.ANTHROPIC_API_KEY || ''
  }

  public getAiServiceUrl(): string {
    return this.config.AI_SERVICE_URL || 'https://api.openai.com/v1'
  }
}

export const envManager = EnvManager.getInstance()
export default envManager