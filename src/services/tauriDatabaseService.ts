/**
 * Tauri 数据库访问服务
 * 通过 Tauri 命令系统访问 SQLite 数据库
 */

export interface DatabaseQuery {
  sql: string
  params?: any[]
}

export interface DatabaseResult {
  success: boolean
  data?: any[]
  error?: string
  lastInsertId?: number
  changes?: number
}

/**
 * Tauri 数据库服务
 * 提供通过 Tauri 命令访问数据库的接口
 */
export class TauriDatabaseService {
  private static instance: TauriDatabaseService

  private constructor() {}

  public static getInstance(): TauriDatabaseService {
    if (!TauriDatabaseService.instance) {
      TauriDatabaseService.instance = new TauriDatabaseService()
    }
    return TauriDatabaseService.instance
  }

  /**
   * 执行查询（返回多条记录）
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      // 检查 Tauri API 是否可用
      if (!window.__TAURI__) {
        throw new Error('Tauri API 不可用，请确保在 Tauri 应用中运行')
      }

      // 通过 Tauri invoke 调用 Rust 端的数据库查询
      const result = await window.__TAURI__.invoke('database_query', {
        query: sql,
        params: params
      })
      return result.data || []
    } catch (error) {
      console.error('Database query failed:', error)
      throw error
    }
  }

  /**
   * 执行查询（返回单条记录）
   */
  async queryOne(sql: string, params: any[] = []): Promise<any | null> {
    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri API 不可用，请确保在 Tauri 应用中运行')
      }

      const result = await window.__TAURI__.invoke('database_query_one', {
        query: sql,
        params: params
      })
      return result.data || null
    } catch (error) {
      console.error('Database queryOne failed:', error)
      throw error
    }
  }

  /**
   * 执行插入/更新/删除操作
   */
  async execute(sql: string, params: any[] = []): Promise<{ lastInsertId: number; changes: number }> {
    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri API 不可用，请确保在 Tauri 应用中运行')
      }

      const result = await window.__TAURI__.invoke('database_execute', {
        query: sql,
        params: params
      })
      return {
        lastInsertId: result.lastInsertId || 0,
        changes: result.changes || 0
      }
    } catch (error) {
      console.error('Database execute failed:', error)
      throw error
    }
  }

  /**
   * 获取收藏的食谱
   */
  async getFavorites(sessionId: string): Promise<any[]> {
    const sql = `
      SELECT f.*, r.title, r.description, r.ingredients, r.instructions,
             r.cooking_time, r.difficulty, r.servings, r.category, r.tags,
             r.nutrition_info, r.image_url, r.average_rating
      FROM favorites f
      LEFT JOIN recipes r ON f.recipe_id = r.id
      WHERE f.session_id = ?
      ORDER BY f.created_at DESC
    `

    try {
      const result = await this.query(sql, [sessionId])
      console.log(`📚 getFavorites 查询结果:`, result)
      return result
    } catch (error) {
      console.error('❌ getFavorites 查询失败:', error)
      throw error
    }
  }

  /**
   * 添加收藏
   */
  async addFavorite(sessionId: string, recipeId: number, recipeTitle: string, recipeImage?: string): Promise<number> {
    const sql = `
      INSERT INTO favorites (session_id, recipe_id, recipe_title, recipe_image)
      VALUES (?, ?, ?, ?)
    `
    const result = await this.execute(sql, [sessionId, recipeId, recipeTitle, recipeImage])
    return result.lastInsertId
  }

  /**
   * 移除收藏
   */
  async removeFavorite(sessionId: string, recipeId: number): Promise<boolean> {
    const sql = 'DELETE FROM favorites WHERE session_id = ? AND recipe_id = ?'
    const result = await this.execute(sql, [sessionId, recipeId])
    return result.changes > 0
  }

  /**
   * 检查是否已收藏
   */
  async isFavorited(sessionId: string, recipeId: number): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM favorites WHERE session_id = ? AND recipe_id = ?'
    const result = await this.queryOne(sql, [sessionId, recipeId])
    return result && result.count > 0
  }

  /**
   * 获取食谱详情
   */
  async getRecipeById(id: number): Promise<any | null> {
    const sql = 'SELECT * FROM recipes WHERE id = ?'
    return await this.queryOne(sql, [id])
  }

  /**
   * 获取所有食谱
   */
  async getAllRecipes(limit: number = 50, offset: number = 0): Promise<any[]> {
    const sql = `
      SELECT r.*,
             COUNT(f.id) as favorite_count,
             AVG(rating) as average_rating
      FROM recipes r
      LEFT JOIN favorites f ON r.id = f.recipe_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await this.query(sql, [limit, offset])
  }

  /**
   * 搜索食谱
   */
  async searchRecipes(query: string, limit: number = 20): Promise<any[]> {
    const searchTerm = `%${query}%`
    const sql = `
      SELECT r.*,
             COUNT(f.id) as favorite_count,
             AVG(rating) as average_rating
      FROM recipes r
      LEFT JOIN favorites f ON r.id = f.recipe_id
      WHERE r.title LIKE ? OR r.description LIKE ? OR r.category LIKE ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `
    return await this.query(sql, [searchTerm, searchTerm, searchTerm, limit])
  }

  /**
   * 获取数据库状态
   */
  async getDatabaseStatus(): Promise<any> {
    try {
      const tables = await this.query("SELECT name FROM sqlite_master WHERE type='table'")
      const status = await this.queryOne('PRAGMA user_version')

      return {
        connected: true,
        tables: tables.map(t => t.name),
        version: status?.user_version || 1,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }
  }
}

// 导出服务实例
export const tauriDatabaseService = TauriDatabaseService.getInstance()
export default tauriDatabaseService