

import { userDatabaseService } from '@/services/database'

// 用户偏好类型定义
export interface UserPreferences {
  dietaryRestrictions?: string[]
  favoriteIngredients?: string[]
  dislikedIngredients?: string[]
  cookingLevel?: 'beginner' | 'intermediate' | 'advanced'
}

// 默认用户偏好
const defaultPreferences: UserPreferences = {
  dietaryRestrictions: [],
  favoriteIngredients: [],
  dislikedIngredients: [],
  cookingLevel: 'beginner',
}

// 用户偏好服务
export function useUserService() {
  let currentSessionId: string | null = null

  // 获取当前会话ID
  const getCurrentSessionId = async (): Promise<string> => {
    if (!currentSessionId) {
      const session = await userDatabaseService.getCurrentSession()
      currentSessionId = session.sessionId
    }
    return currentSessionId
  }

  // 获取用户偏好
  const getPreferences = async (): Promise<UserPreferences> => {
    try {
      const sessionId = await getCurrentSessionId()
      const preferences = await userDatabaseService.getPreferences(sessionId)
      return { ...defaultPreferences, ...preferences }
    } catch (error) {
      console.error('获取用户偏好失败:', error)
      return defaultPreferences
    }
  }

  // 更新用户偏好
  const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    try {
      const sessionId = await getCurrentSessionId()
      const currentPreferences = await getPreferences()
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences,
      }

      // 保存到数据库
      await userDatabaseService.updatePreferences(sessionId, updatedPreferences)
      return updatedPreferences
    } catch (error) {
      console.error('更新用户偏好失败:', error)
      throw error
    }
  }

  // 重置用户偏好
  const resetPreferences = async (): Promise<UserPreferences> => {
    try {
      const sessionId = await getCurrentSessionId()
      await userDatabaseService.updatePreferences(sessionId, defaultPreferences as Record<string, unknown>)
      return defaultPreferences
    } catch (error) {
      console.error('重置用户偏好失败:', error)
      throw error
    }
  }

  // 获取用户收藏
  const getFavorites = async (): Promise<string[]> => {
    try {
      const sessionId = await getCurrentSessionId()
      const favorites = await userDatabaseService.getPreferences(sessionId)
      return (favorites as any).favoriteRecipes || []
    } catch (error) {
      console.error('获取收藏数据失败:', error)
      return []
    }
  }

  // 添加收藏
  const addToFavorites = async (recipeId: string): Promise<void> => {
    try {
      const sessionId = await getCurrentSessionId()
      const preferences = await userDatabaseService.getPreferences(sessionId)
      const favoriteRecipes = ((preferences as any).favoriteRecipes || []) as string[]
      
      if (!favoriteRecipes.includes(recipeId)) {
        favoriteRecipes.push(recipeId)
        await userDatabaseService.updatePreferences(sessionId, {
          ...preferences,
          favoriteRecipes
        })
      }
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw error
    }
  }

  // 移除收藏
  const removeFromFavorites = async (recipeId: string): Promise<void> => {
    try {
      const sessionId = await getCurrentSessionId()
      const preferences = await userDatabaseService.getPreferences(sessionId)
      const favoriteRecipes = ((preferences as any).favoriteRecipes || []) as string[]
      
      const index = favoriteRecipes.indexOf(recipeId)
      if (index > -1) {
        favoriteRecipes.splice(index, 1)
        await userDatabaseService.updatePreferences(sessionId, {
          ...preferences,
          favoriteRecipes
        })
      }
    } catch (error) {
      console.error('移除收藏失败:', error)
      throw error
    }
  }

  return {
    getPreferences,
    updatePreferences,
    resetPreferences,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
  }
}
