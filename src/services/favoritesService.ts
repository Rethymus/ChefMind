/**
 * 收藏服务 - 统一管理收藏食谱数据
 * 替代分散的 localStorage 使用
 * 集成高级缓存策略
 */

import { Favorite } from '@/models/Favorite'
import { userCache } from '@/services/cache/advancedCacheService'
import { Cacheable, CacheEvict } from '@/services/cache/cacheDecorators'

export interface FavoriteRecipe {
  id: string
  title: string
  description?: string
  image?: string
  category?: string
  cookingTime?: string
  difficulty?: string
  servings?: number
  ingredients: string[]
  steps: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  createdAt: Date
}

export class FavoritesService {
  private readonly STORAGE_KEY = 'chefmind_favorites_v2' // 新的存储键，避免冲突

  /**
   * 获取用户的所有收藏
   */
  @Cacheable({
    keyPrefix: 'favorites.getUserFavorites',
    ttl: 5 * 60 * 1000, // 5 分钟
    cacheInstance: userCache
  })
  async getUserFavorites(sessionId: string): Promise<FavoriteRecipe[]> {
    try {
      // 使用统一的 Favorite 模型
      const favorites = await Favorite.findBySessionId(sessionId)
      
      return favorites.map(fav => ({
        id: fav.recipe_id,
        title: fav.recipe_title || '未命名食谱',
        description: fav.recipe_description,
        image: fav.recipe_image,
        category: fav.recipe_category,
        cookingTime: fav.recipe_cooking_time,
        difficulty: fav.recipe_difficulty,
        servings: fav.recipe_servings,
        ingredients: JSON.parse(fav.recipe_ingredients || '[]'),
        steps: JSON.parse(fav.recipe_steps || '[]'),
        nutrition: fav.recipe_nutrition ? JSON.parse(fav.recipe_nutrition) : undefined,
        createdAt: new Date(fav.created_at)
      }))
    } catch (error) {
      console.error('获取收藏失败:', error)
      return []
    }
  }

  /**
   * 添加收藏
   */
  @CacheEvict({
    keyPrefix: 'favorites.getUserFavorites'
  })
  async addFavorite(sessionId: string, recipe: FavoriteRecipe): Promise<boolean> {
    try {
      // 检查是否已收藏
      const existing = await Favorite.findOne({
        where: { session_id: sessionId, recipe_id: recipe.id }
      })

      if (existing) {
        console.log('食谱已收藏:', recipe.title)
        return true
      }

      // 使用 Favorite 模型添加收藏
      const result = await Favorite.create({
        session_id: sessionId,
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        recipe_description: recipe.description,
        recipe_image: recipe.image,
        recipe_category: recipe.category,
        recipe_cooking_time: recipe.cookingTime,
        recipe_difficulty: recipe.difficulty,
        recipe_servings: recipe.servings,
        recipe_ingredients: JSON.stringify(recipe.ingredients),
        recipe_steps: JSON.stringify(recipe.steps),
        recipe_nutrition: recipe.nutrition ? JSON.stringify(recipe.nutrition) : null
      })

      console.log('✅ 收藏成功:', recipe.title)
      
      // 同时更新 localStorage 用于兼容性
      await this.updateLocalStorageBackup(sessionId)
      
      return true
    } catch (error) {
      console.error('添加收藏失败:', error)
      return false
    }
  }

  /**
   * 移除收藏
   */
  @CacheEvict({
    keyPrefix: 'favorites.getUserFavorites'
  })
  async removeFavorite(sessionId: string, recipeId: string): Promise<boolean> {
    try {
      // 查找收藏记录
      const favorite = await Favorite.findOne({
        where: { session_id: sessionId, recipe_id: recipeId }
      })

      if (!favorite) {
        console.log('收藏不存在:', recipeId)
        return false
      }

      // 使用 Favorite 模型删除收藏
      const result = await Favorite.delete(favorite.id)
      
      if (result) {
        console.log('✅ 取消收藏成功:', recipeId)
        // 同时更新 localStorage 用于兼容性
        await this.updateLocalStorageBackup(sessionId)
        return true
      }
      
      return false
    } catch (error) {
      console.error('移除收藏失败:', error)
      return false
    }
  }

  /**
   * 检查是否已收藏
   */
  @Cacheable({
    keyPrefix: 'favorites.isFavorited',
    ttl: 3 * 60 * 1000, // 3 分钟
    cacheInstance: userCache
  })
  async isFavorited(sessionId: string, recipeId: string): Promise<boolean> {
    try {
      const favorite = await Favorite.findOne({
        where: { session_id: sessionId, recipe_id: recipeId }
      })
      return !!favorite
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return false
    }
  }

  /**
   * 获取收藏数量
   */
  async getFavoriteCount(sessionId: string): Promise<number> {
    try {
      return await Favorite.count({ where: { session_id: sessionId } })
    } catch (error) {
      console.error('获取收藏数量失败:', error)
      return 0
    }
  }

  /**
   * 更新 localStorage 备份（用于兼容性）
   */
  private async updateLocalStorageBackup(sessionId: string): Promise<void> {
    try {
      const favorites = await this.getUserFavorites(sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.warn('更新 localStorage 备份失败:', error)
    }
  }

  /**
   * 从 localStorage 迁移数据到统一存储
   */
  async migrateFromLocalStorage(sessionId: string): Promise<void> {
    try {
      // 检查旧的 localStorage 数据
      const oldData = localStorage.getItem('savedRecipes')
      if (!oldData) {
        return
      }

      const oldFavorites = JSON.parse(oldData)
      if (!Array.isArray(oldFavorites) || oldFavorites.length === 0) {
        return
      }

      console.log(`🔄 开始迁移 ${oldFavorites.length} 个收藏记录...`)

      let migratedCount = 0
      for (const recipe of oldFavorites) {
        try {
          // 转换为新的格式
          const favoriteRecipe: FavoriteRecipe = {
            id: recipe.id || `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: recipe.title || recipe.name || '未命名食谱',
            description: recipe.description,
            image: recipe.image,
            category: recipe.category,
            cookingTime: recipe.cookingTime || recipe.cooking_time,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            ingredients: recipe.ingredients || [],
            steps: recipe.steps || recipe.instructions || [],
            nutrition: recipe.nutrition,
            createdAt: new Date(recipe.createdAt || Date.now())
          }

          // 添加到统一存储
          await this.addFavorite(sessionId, favoriteRecipe)
          migratedCount++
        } catch (error) {
          console.warn('迁移单个收藏失败:', error)
        }
      }

      console.log(`✅ 迁移完成: ${migratedCount}/${oldFavorites.length}`)

      // 清理旧数据
      if (migratedCount > 0) {
        localStorage.removeItem('savedRecipes')
        console.log('🧹 已清理旧的 localStorage 数据')
      }
    } catch (error) {
      console.error('迁移收藏数据失败:', error)
    }
  }

  /**
   * 清理用户的所有收藏
   */
  async clearUserFavorites(sessionId: string): Promise<boolean> {
    try {
      const favorites = await Favorite.find({ where: { session_id: sessionId } })
      
      for (const favorite of favorites) {
        await Favorite.delete(favorite.id)
      }

      // 清理 localStorage 备份
      localStorage.removeItem(this.STORAGE_KEY)
      
      console.log('✅ 用户收藏已清理')
      return true
    } catch (error) {
      console.error('清理用户收藏失败:', error)
      return false
    }
  }
}

// 导出服务实例
export const favoritesService = new FavoritesService()
export default favoritesService