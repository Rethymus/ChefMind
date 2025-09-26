// 动态导入检测环境
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node

// 导入数据库单例
import { databaseSingleton } from './databaseSingleton'

// 浏览器环境下的内存存储
class MemoryStorage {
  public users: Map<string, any> = new Map()
  public recipes: Map<number, any> = new Map()
  public favorites: Map<string, any> = new Map()
  public searchHistory: Map<number, any> = new Map()
  public aiConfigs: Map<string, any> = new Map()
  private nextId = 1

  // 用户相关
  async getUser(sessionId: string) {
    return this.users.get(sessionId) || { sessionId, preferences: {} }
  }

  async saveUser(sessionId: string, preferences: any) {
    this.users.set(sessionId, { sessionId, preferences, updatedAt: new Date() })
    return { sessionId, preferences }
  }

  // 食谱相关
  async saveRecipe(recipe: any) {
    const id = this.nextId++
    const savedRecipe = { ...recipe, id, createdAt: new Date() }
    this.recipes.set(id, savedRecipe)
    return savedRecipe
  }

  async getRecipe(id: number) {
    return this.recipes.get(id) || null
  }

  async getAllRecipes() {
    return Array.from(this.recipes.values())
  }

  async searchRecipes(query: string) {
    const all = await this.getAllRecipes()
    return all.filter(
      recipe =>
        recipe.title?.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(query.toLowerCase())
    )
  }

  // 收藏相关
  async addFavorite(
    sessionId: string,
    recipeId: number,
    recipeTitle: string,
    recipeImage?: string
  ) {
    const key = `${sessionId}_${recipeId}`
    const favorite = { sessionId, recipeId, recipeTitle, recipeImage, createdAt: new Date() }
    this.favorites.set(key, favorite)
    return favorite
  }

  async getUserFavorites(sessionId: string) {
    return Array.from(this.favorites.values()).filter(fav => fav.sessionId === sessionId)
  }

  async isFavorited(sessionId: string, recipeId: number) {
    const key = `${sessionId}_${recipeId}`
    return this.favorites.has(key)
  }

  async removeFavorite(sessionId: string, recipeId: number) {
    const key = `${sessionId}_${recipeId}`
    return this.favorites.delete(key)
  }

  // 搜索历史相关
  async addSearchHistory(sessionId: string, query: string, resultsCount: number = 0) {
    const id = this.nextId++
    const history = { id, sessionId, query, resultsCount, createdAt: new Date() }
    this.searchHistory.set(id, history)
    return history
  }

  async getUserSearchHistory(sessionId: string) {
    return Array.from(this.searchHistory.values())
      .filter(history => history.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // AI配置相关
  async getAiConfigs(sessionId: string) {
    return this.aiConfigs.get(sessionId) || {}
  }

  async saveAiConfigs(sessionId: string, configs: any) {
    this.aiConfigs.set(sessionId, configs)
    return configs
  }
}

// 全局内存存储实例
const memoryStorage = new MemoryStorage()

// 动态导入模型
let User: any, Recipe: any, Favorite: any

if (isNode) {
  Promise.all([
    import('@/models/User'),
    import('@/models/Recipe'),
    import('@/models/Favorite'),
  ]).then(([userModule, recipeModule, favoriteModule]) => {
    User = userModule.User
    Recipe = recipeModule.Recipe
    Favorite = favoriteModule.Favorite
  })
}

/**
 * 用户数据库服务类（SQLite/内存存储 版本）
 */
export class UserDatabaseService {
  /**
   * 获取或创建用户会话
   */
  async getCurrentSession(
    sessionId?: string
  ): Promise<{ sessionId: string; preferences: Record<string, unknown> }> {
    const finalSessionId = sessionId || this.generateSessionId()

    try {
      if (isNode && User) {
        // Node.js 环境：使用 SQLite
        const user = await User.createOrUpdate(finalSessionId, {})
        return {
          sessionId: user.sessionId,
          preferences: user.preferences,
        }
      } else {
        // 浏览器环境：使用内存存储
        const user = await memoryStorage.getUser(finalSessionId)
        return {
          sessionId: user.sessionId,
          preferences: user.preferences,
        }
      }
    } catch (error) {
      console.error('Failed to get/create user session:', error)
      return {
        sessionId: finalSessionId,
        preferences: {},
      }
    }
  }

  /**
   * 更新用户偏好设置
   */
  async updatePreferences(
    sessionId: string,
    preferences: Record<string, unknown>
  ): Promise<boolean> {
    try {
      if (isNode && User) {
        // Node.js 环境：使用 SQLite
        const user = await User.updatePreferences(sessionId, preferences)
        return !!user
      } else {
        // 浏览器环境：使用内存存储
        await memoryStorage.saveUser(sessionId, preferences)
        return true
      }
    } catch (error) {
      console.error('Failed to update user preferences:', error)
      return false
    }
  }

  /**
   * 获取用户偏好设置
   */
  async getPreferences(sessionId: string): Promise<Record<string, unknown>> {
    try {
      if (isNode && User) {
        // Node.js 环境：使用 SQLite
        const user = await User.findBySessionId(sessionId)
        return user ? user.preferences : {}
      } else {
        // 浏览器环境：使用内存存储
        const user = await memoryStorage.getUser(sessionId)
        return user.preferences
      }
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return {}
    }
  }

  /**
   * 生成会话 ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 食谱数据库服务类（SQLite/内存存储 版本）
 */
export class RecipeDatabaseService {
  /**
   * 创建食谱
   */
  async createRecipe(recipeData: any): Promise<any> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.create(recipeData)
      } else {
        // 浏览器环境：使用内存存储
        return await memoryStorage.saveRecipe(recipeData)
      }
    } catch (error) {
      console.error('Failed to create recipe:', error)
      throw error
    }
  }

  /**
   * 获取食谱详情
   */
  async getRecipeById(id: number): Promise<any> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.findById(id)
      } else {
        // 浏览器环境：使用内存存储
        return await memoryStorage.getRecipe(id)
      }
    } catch (error) {
      console.error('Failed to get recipe:', error)
      return null
    }
  }

  /**
   * 获取所有食谱
   */
  async getAllRecipes(limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.findAll(limit, offset)
      } else {
        // 浏览器环境：使用内存存储
        const all = await memoryStorage.getAllRecipes()
        return all.slice(offset, offset + limit)
      }
    } catch (error) {
      console.error('Failed to get recipes:', error)
      return []
    }
  }

  /**
   * 搜索食谱
   */
  async searchRecipes(query: string, limit: number = 20): Promise<any[]> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.search(query, limit)
      } else {
        // 浏览器环境：使用内存存储
        return (await memoryStorage.searchRecipes(query)).slice(0, limit)
      }
    } catch (error) {
      console.error('Failed to search recipes:', error)
      return []
    }
  }

  /**
   * 根据分类获取食谱
   */
  async getRecipesByCategory(category: string, limit: number = 20): Promise<any[]> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.findByCategory(category, limit)
      } else {
        // 浏览器环境：使用内存存储
        const all = await memoryStorage.getAllRecipes()
        return all.filter(recipe => recipe.category === category).slice(0, limit)
      }
    } catch (error) {
      console.error('Failed to get recipes by category:', error)
      return []
    }
  }

  /**
   * 获取热门食谱
   */
  async getPopularRecipes(limit: number = 10): Promise<any[]> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.getPopularRecipes(limit)
      } else {
        // 浏览器环境：使用内存存储
        const all = await memoryStorage.getAllRecipes()
        return all.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, limit)
      }
    } catch (error) {
      console.error('Failed to get popular recipes:', error)
      return []
    }
  }

  /**
   * 获取最新食谱
   */
  async getRecentRecipes(limit: number = 10): Promise<any[]> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.getRecentRecipes(limit)
      } else {
        // 浏览器环境：使用内存存储
        const all = await memoryStorage.getAllRecipes()
        return all
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      }
    } catch (error) {
      console.error('Failed to get recent recipes:', error)
      return []
    }
  }

  /**
   * 更新食谱
   */
  async updateRecipe(id: number, updates: any): Promise<any> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.update(id, updates)
      } else {
        // 浏览器环境：使用内存存储
        const recipe = await memoryStorage.getRecipe(id)
        if (recipe) {
          const updatedRecipe = { ...recipe, ...updates, updatedAt: new Date() }
          memoryStorage.recipes.set(id, updatedRecipe)
          return updatedRecipe
        }
        return null
      }
    } catch (error) {
      console.error('Failed to update recipe:', error)
      return null
    }
  }

  /**
   * 删除食谱
   */
  async deleteRecipe(id: number): Promise<boolean> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        return await Recipe.delete(id)
      } else {
        // 浏览器环境：使用内存存储
        return memoryStorage.recipes.delete(id)
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      return false
    }
  }

  /**
   * 增加食谱浏览次数
   */
  async incrementViewCount(id: number): Promise<void> {
    try {
      if (isNode && Recipe) {
        // Node.js 环境：使用 SQLite
        await Recipe.incrementViewCount(id)
      } else {
        // 浏览器环境：使用内存存储
        const recipe = await memoryStorage.getRecipe(id)
        if (recipe) {
          recipe.viewCount = (recipe.viewCount || 0) + 1
          memoryStorage.recipes.set(id, recipe)
        }
      }
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }
}

/**
 * 收藏数据库服务类（SQLite/内存存储 版本）
 */
export class FavoriteDatabaseService {
  /**
   * 添加收藏
   */
  async addFavorite(
    sessionId: string,
    recipeId: number,
    recipeTitle: string,
    recipeImage?: string
  ): Promise<any> {
    try {
      if (isNode && Favorite) {
        // Node.js 环境：使用 SQLite
        return await Favorite.addFavorite(sessionId, recipeId, recipeTitle, recipeImage)
      } else {
        // 浏览器环境：使用内存存储
        return await memoryStorage.addFavorite(sessionId, recipeId, recipeTitle, recipeImage)
      }
    } catch (error) {
      console.error('Failed to add favorite:', error)
      throw error
    }
  }

  /**
   * 获取用户收藏列表
   */
  async getUserFavorites(
    sessionId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      if (isNode && Favorite) {
        // Node.js 环境：使用 SQLite
        return await Favorite.getUserFavorites(sessionId, limit, offset)
      } else {
        // 浏览器环境：使用内存存储
        const all = await memoryStorage.getUserFavorites(sessionId)
        return all.slice(offset, offset + limit)
      }
    } catch (error) {
      console.error('Failed to get user favorites:', error)
      return []
    }
  }

  /**
   * 检查是否已收藏
   */
  async isFavorited(sessionId: string, recipeId: number): Promise<boolean> {
    try {
      if (isNode && Favorite) {
        // Node.js 环境：使用 SQLite
        return await Favorite.isFavorited(sessionId, recipeId)
      } else {
        // 浏览器环境：使用内存存储
        return await memoryStorage.isFavorited(sessionId, recipeId)
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error)
      return false
    }
  }

  /**
   * 取消收藏
   */
  async removeFavorite(sessionId: string, recipeId: number): Promise<boolean> {
    try {
      if (isNode && Favorite) {
        // Node.js 环境：使用 SQLite
        return await Favorite.removeFavorite(sessionId, recipeId)
      } else {
        // 浏览器环境：使用内存存储
        return await memoryStorage.removeFavorite(sessionId, recipeId)
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      return false
    }
  }

  /**
   * 获取收藏数量
   */
  async getFavoriteCount(sessionId: string): Promise<number> {
    try {
      if (isNode && Favorite) {
        // Node.js 环境：使用 SQLite
        return await Favorite.getFavoriteCount(sessionId)
      } else {
        // 浏览器环境：使用内存存储
        const favorites = await memoryStorage.getUserFavorites(sessionId)
        return favorites.length
      }
    } catch (error) {
      console.error('Failed to get favorite count:', error)
      return 0
    }
  }

  /**
   * 获取食谱的收藏数量
   */
  async getRecipeFavoriteCount(recipeId: number): Promise<number> {
    try {
      if (isNode && Favorite) {
        // Node.js 环境：使用 SQLite
        return await Favorite.getRecipeFavoriteCount(recipeId)
      } else {
        // 浏览器环境：使用内存存储
        const allFavorites = Array.from(memoryStorage.favorites.values())
        return allFavorites.filter(fav => fav.recipeId === recipeId).length
      }
    } catch (error) {
      console.error('Failed to get recipe favorite count:', error)
      return 0
    }
  }
}

// 导出服务实例
export const userDatabaseService = new UserDatabaseService()
export const recipeDatabaseService = new RecipeDatabaseService()
export const favoriteDatabaseService = new FavoriteDatabaseService()

export default {
  user: userDatabaseService,
  recipe: recipeDatabaseService,
  favorite: favoriteDatabaseService,
  singleton: databaseSingleton,
}
