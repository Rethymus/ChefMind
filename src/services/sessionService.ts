/**
 * Session 管理服务
 * 负责用户会话的创建和管理
 */

export class SessionService {
  private static instance: SessionService
  private readonly SESSION_KEY = 'chefmind_session_id'

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  /**
   * 获取当前会话ID
   * 如果不存在则创建新的会话ID
   */
  getCurrentSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY)

    if (!sessionId) {
      sessionId = this.generateSessionId()
      localStorage.setItem(this.SESSION_KEY, sessionId)
      console.log('🆔 创建新会话:', sessionId)
    } else {
      console.log('📋 使用现有会话:', sessionId)
    }

    return sessionId
  }

  /**
   * 创建新的会话ID
   */
  createNewSession(): string {
    const sessionId = this.generateSessionId()
    localStorage.setItem(this.SESSION_KEY, sessionId)
    console.log('🆔 创建新会话:', sessionId)
    return sessionId
  }

  /**
   * 清除当前会话
   */
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY)
    console.log('🗑️ 会话已清除')
  }

  /**
   * 生成随机会话ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 9)
    return `session_${timestamp}_${random}`
  }

  /**
   * 获取会话信息
   */
  getSessionInfo(): { sessionId: string; createdAt: string | null } {
    const sessionId = this.getCurrentSessionId()
    const createdAt = localStorage.getItem(`${this.SESSION_KEY}_created`)

    return {
      sessionId,
      createdAt
    }
  }

  /**
   * 检查会话是否存在
   */
  hasSession(): boolean {
    return !!localStorage.getItem(this.SESSION_KEY)
  }
}

// 导出服务实例
export const sessionService = SessionService.getInstance()
export default sessionService