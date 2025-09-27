/**
 * 收藏服务 - 统一管理收藏食谱数据
 * 替代分散的 localStorage 使用
 * 集成高级缓存策略
 */

import { Favorite } from '@/models/Favorite'
import { Recipe } from '@/models/Recipe'

interface FavoriteRecipe {
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

class FavoritesService {
  private readonly STORAGE_KEY = 'chefmind_favorites_v2' // 新的存储键，避免冲突

  /**
   * 获取用户的所有收藏
   */
  async getUserFavorites(sessionId: string): Promise<FavoriteRecipe[]> {
    try {
      // 使用统一的 Favorite 模型
      const favorites = await Favorite.getUserFavorites(sessionId)

      return favorites.map(fav => ({
        id: fav.recipeId.toString(),
        title: fav.recipeTitle || '未命名食谱',
        image: fav.recipeImage,
        createdAt: fav.createdAt,
      }))
    } catch (error) {
      console.error('获取收藏失败:', error)
      return []
    }
  }

  /**
   * 添加收藏
   */
  async addFavorite(sessionId: string, recipe: FavoriteRecipe): Promise<boolean> {
    try {
      // 检查是否已收藏 - 支持字符串ID
      const recipeId = typeof recipe.id === 'string' ? parseInt(recipe.id) : recipe.id
      const existing = await Favorite.isFavorited(sessionId, recipeId)

      if (existing) {
        return true
      }

      // 确保食谱数据保存到 recipes 表（对于AI生成的食谱特别重要）
      try {
        let dbRecipe = await Recipe.findById(recipeId)

        if (!dbRecipe) {
          // 如果食谱不存在，创建它
          dbRecipe = await Recipe.create({
            title: recipe.title,
            description: recipe.description || '',
            ingredients: recipe.ingredients || [],
            instructions: recipe.steps || [],
            cookingTime: recipe.cookingTime || 30,
            difficulty: recipe.difficulty || '中等',
            servings: recipe.servings || 2,
            category: recipe.category || 'AI生成',
            image: recipe.image || '',
            tags: [],
            nutritionInfo: recipe.nutrition || {},
          })
        }

        // 使用新的recipeId（可能是刚创建的）
        const newRecipeId = dbRecipe.id

        // 使用 Favorite 模型添加收藏
        await Favorite.addFavorite(sessionId, newRecipeId, recipe.title, recipe.image)

        // 同时更新 localStorage 用于兼容性
        await this.updateLocalStorageBackup(sessionId)

        return true
      } catch (error) {
        console.error('保存食谱数据到 recipes 表失败:', error)
        return false
      }
    } catch (error) {
      console.error('添加收藏失败:', error)
      return false
    }
  }

  /**
   * 移除收藏
   */
  async removeFavorite(sessionId: string, recipeId: string): Promise<boolean> {
    try {
      const numericId = parseInt(recipeId)
      if (isNaN(numericId) || numericId <= 0) {
        return false
      }

      // 使用 Favorite 模型删除收藏
      const result = await Favorite.removeFavorite(sessionId, numericId)

      if (result) {
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
  async isFavorited(sessionId: string, recipeId: string): Promise<boolean> {
    try {
      const numericId = parseInt(recipeId)
      if (isNaN(numericId) || numericId <= 0) {
        return false
      }
      return await Favorite.isFavorited(sessionId, numericId)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return false
    }
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(sessionId: string, recipe: any): Promise<void> {
    try {
      // 转换为标准格式
      const favoriteRecipe: FavoriteRecipe = {
        id: recipe.id || `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        title: recipe.title || recipe.name || '未命名菜谱',
        description: recipe.description,
        image: recipe.image,
        category: recipe.category || 'AI生成',
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        ingredients: recipe.ingredients || [],
        steps: recipe.instructions || recipe.steps || [],
        nutrition: recipe.nutrition,
        createdAt: new Date(),
      }

      // 检查当前状态
      const isFav = await this.isFavorited(sessionId, favoriteRecipe.id)

      if (isFav) {
        // 取消收藏
        await this.removeFavorite(sessionId, favoriteRecipe.id)
      } else {
        // 添加收藏
        await this.addFavorite(sessionId, favoriteRecipe)
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      throw error
    }
  }

  /**
   * 获取收藏数量
   */
  async getFavoriteCount(sessionId: string): Promise<number> {
    try {
      return await Favorite.getFavoriteCount(sessionId)
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
            createdAt: new Date(recipe.createdAt || Date.now()),
          }

          // 添加到统一存储
          await this.addFavorite(sessionId, favoriteRecipe)
          migratedCount++
        } catch (error) {
          console.warn('迁移单个收藏失败:', error)
        }
      }

      // 清理旧数据
      if (migratedCount > 0) {
        localStorage.removeItem('savedRecipes')
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
      // 获取所有收藏并逐个删除
      const favorites = await Favorite.getUserFavorites(sessionId, 1000, 0)

      for (const favorite of favorites) {
        await Favorite.removeFavorite(sessionId, favorite.recipeId)
      }

      // 清理 localStorage 备份
      localStorage.removeItem(this.STORAGE_KEY)

      return true
    } catch (error) {
      console.error('清理用户收藏失败:', error)
      return false
    }
  }
}

// 导出服务实例
export const favoritesService = new FavoritesService()
