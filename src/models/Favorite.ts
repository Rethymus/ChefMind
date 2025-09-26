import { dataAccess } from '@/services/database/dataAccess'

/**
 * 收藏数据接口（通用适配）
 * 支持浏览器环境和 Node.js 环境
 */
export interface FavoriteDocument {
  id: number
  sessionId: string
  recipeId: number
  recipeTitle: string
  recipeImage?: string
  createdAt: Date
}

/**
 * 收藏模型类（通用版本，支持浏览器和 Node.js）
 */
export class FavoriteModel {
  private tableName = 'favorites'

  /**
   * 添加收藏
   */
  async addFavorite(
    sessionId: string,
    recipeId: number,
    recipeTitle: string,
    recipeImage?: string
  ): Promise<FavoriteDocument> {
    const data = {
      session_id: sessionId,
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      recipe_image: recipeImage || null,
    }

    const result = await dataAccess.insert(this.tableName, data)
    return this.rowToDocument(result)
  }

  /**
   * 根据 ID 查找收藏
   */
  async findById(id: number): Promise<FavoriteDocument | null> {
    const row = await dataAccess.findOne(this.tableName, { where: { id } })
    return row ? this.rowToDocument(row) : null
  }

  /**
   * 获取用户的所有收藏
   */
  async getUserFavorites(
    sessionId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<FavoriteDocument[]> {
    const rows = await dataAccess.find(
      this.tableName,
      {
        where: { session_id: sessionId },
        orderBy: 'created_at DESC',
      },
      limit,
      offset
    )

    return rows.map((row: any) => this.rowToDocument(row))
  }

  /**
   * 检查是否已收藏
   */
  async isFavorited(sessionId: string, recipeId: number): Promise<boolean> {
    const row = await dataAccess.findOne(this.tableName, {
      where: { session_id: sessionId, recipe_id: recipeId },
    })

    return !!row
  }

  /**
   * 取消收藏
   */
  async removeFavorite(sessionId: string, recipeId: number): Promise<boolean> {
    const favorite = await dataAccess.findOne(this.tableName, {
      where: { session_id: sessionId, recipe_id: recipeId },
    })

    if (favorite) {
      return await dataAccess.delete(this.tableName, favorite.id)
    }

    return false
  }

  /**
   * 获取收藏数量
   */
  async getFavoriteCount(sessionId: string): Promise<number> {
    return await dataAccess.count(this.tableName, { where: { session_id: sessionId } })
  }

  /**
   * 获取食谱的收藏数量
   */
  async getRecipeFavoriteCount(recipeId: number): Promise<number> {
    return await dataAccess.count(this.tableName, { where: { recipe_id: recipeId } })
  }

  /**
   * 数据库行转换为文档对象
   */
  private rowToDocument(row: any): FavoriteDocument {
    return {
      id: row.id,
      sessionId: row.session_id,
      recipeId: row.recipe_id,
      recipeTitle: row.recipe_title,
      recipeImage: row.recipe_image,
      createdAt: new Date(row.created_at),
    }
  }
}

// 导出模型实例
export const Favorite = new FavoriteModel()
export default Favorite
