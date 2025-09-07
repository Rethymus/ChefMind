

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
  // 获取用户偏好
  const getPreferences = (): UserPreferences => {
    try {
      const stored = localStorage.getItem('userPreferences')
      if (stored) {
        const preferences = JSON.parse(stored)
        return { ...defaultPreferences, ...preferences }
      }
    } catch (error) {
      console.error('解析用户偏好失败:', error)
      localStorage.removeItem('userPreferences')
    }
    return defaultPreferences
  }

  // 更新用户偏好
  const updatePreferences = (preferences: Partial<UserPreferences>): UserPreferences => {
    const currentPreferences = getPreferences()
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    }

    // 保存到本地存储
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences))
    return updatedPreferences
  }

  // 重置用户偏好
  const resetPreferences = (): UserPreferences => {
    localStorage.removeItem('userPreferences')
    return defaultPreferences
  }

  // 获取用户收藏
  const getFavorites = (): string[] => {
    // 从本地存储获取收藏列表
    const stored = localStorage.getItem('userFavorites')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('解析收藏数据失败:', error)
        return []
      }
    }
    return []
  }

  // 添加收藏
  const addToFavorites = (recipeId: string): void => {
    const favorites = getFavorites()
    if (!favorites.includes(recipeId)) {
      favorites.push(recipeId)
      localStorage.setItem('userFavorites', JSON.stringify(favorites))
    }
  }

  // 移除收藏
  const removeFromFavorites = (recipeId: string): void => {
    const favorites = getFavorites()
    const index = favorites.indexOf(recipeId)
    if (index > -1) {
      favorites.splice(index, 1)
      localStorage.setItem('userFavorites', JSON.stringify(favorites))
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
