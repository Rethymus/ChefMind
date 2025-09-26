import { dataAccess } from '@/services/database/dataAccess'

/**
 * 用户数据接口（统一数据访问层适配）
 */
export interface UserDocument {
  id: number
  sessionId: string
  preferences: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

/**
 * 用户模型类（统一数据访问层版本）
 */
export class UserModel {
  private tableName = 'users'

  /**
   * 创建或更新用户
   */
  async createOrUpdate(
    sessionId: string,
    preferences: Record<string, unknown> = {}
  ): Promise<UserDocument> {
    // 检查用户是否已存在
    const existingUser = await this.findOne({ where: { session_id: sessionId } })

    if (existingUser) {
      // 更新现有用户
      await this.update(existingUser.id, {
        preferences,
        updated_at: new Date(),
      })
      return this.findById(existingUser.id)!
    } else {
      // 创建新用户
      const data = {
        session_id: sessionId,
        preferences,
        created_at: new Date(),
        updated_at: new Date(),
      }
      const result = await this.create(data)
      return result
    }
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: number): Promise<UserDocument | null> {
    const row = await this.findOne({ where: { id } })
    return row
  }

  /**
   * 根据会话 ID 查找用户
   */
  async findBySessionId(sessionId: string): Promise<UserDocument | null> {
    const row = await this.findOne({ where: { session_id: sessionId } })
    return row
  }

  /**
   * 更新用户偏好设置
   */
  async updatePreferences(
    sessionId: string,
    preferences: Record<string, unknown>
  ): Promise<UserDocument | null> {
    const user = await this.findBySessionId(sessionId)
    if (!user) {
      return null
    }

    await this.update(user.id, {
      preferences,
      updated_at: new Date(),
    })

    return this.findBySessionId(sessionId)
  }

  /**
   * 删除用户
   */
  async delete(sessionId: string): Promise<boolean> {
    const user = await this.findBySessionId(sessionId)
    if (!user) {
      return false
    }

    const result = await this.deleteUser(user.id)
    return result
  }

  // 以下为统一数据访问层方法
  private async create(data: any): Promise<UserDocument> {
    const result = await dataAccess.insert(this.tableName, data)
    return result
  }

  private async findOne(query: any): Promise<UserDocument | null> {
    const row = await dataAccess.findOne(this.tableName, query)
    return row ? this.rowToDocument(row) : null
  }

  private async update(id: number, data: any): Promise<boolean> {
    const result = await dataAccess.update(this.tableName, id, data)
    return result
  }

  private async deleteUser(id: number): Promise<boolean> {
    const result = await dataAccess.delete(this.tableName, id)
    return result
  }

  /**
   * 数据库行转换为文档对象
   */
  private rowToDocument(row: any): UserDocument {
    return {
      id: row.id,
      sessionId: row.session_id,
      preferences:
        typeof row.preferences === 'string'
          ? JSON.parse(row.preferences || '{}')
          : row.preferences || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}

// 导出模型实例
export const User = new UserModel()
export default User
