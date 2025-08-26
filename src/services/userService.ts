import { ref, computed } from 'vue'

// 用户类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  preferences?: {
    dietaryRestrictions?: string[]
    favoriteIngredients?: string[]
    dislikedIngredients?: string[]
    cookingLevel?: 'beginner' | 'intermediate' | 'advanced'
  }
}

// 创建一个全局状态来存储当前用户
const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => currentUser.value !== null)

// 模拟用户数据库
const users: User[] = [
  {
    id: '1',
    username: '测试用户',
    email: 'test@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    preferences: {
      dietaryRestrictions: ['vegetarian'],
      favoriteIngredients: ['番茄', '洋葱', '大蒜'],
      dislikedIngredients: ['香菜'],
      cookingLevel: 'intermediate',
    },
  },
]

// 用户服务
export function useUserService() {
  // 登录
  const login = async (email: string, _password: string): Promise<User> => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 查找用户
    const user = users.find(u => u.email === email)

    if (!user) {
      throw new Error('用户不存在或密码错误')
    }

    // 在实际应用中，这里应该验证密码

    // 保存用户到本地存储
    localStorage.setItem('user', JSON.stringify(user))

    // 更新当前用户
    currentUser.value = user

    return user
  }

  // 注册
  const register = async (username: string, email: string, _password: string): Promise<User> => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 检查邮箱是否已被使用
    if (users.some(u => u.email === email)) {
      throw new Error('该邮箱已被注册')
    }

    // 创建新用户
    const newUser: User = {
      id: String(users.length + 1),
      username,
      email,
      preferences: {
        dietaryRestrictions: [],
        favoriteIngredients: [],
        dislikedIngredients: [],
        cookingLevel: 'beginner',
      },
    }

    // 添加到用户列表
    users.push(newUser)

    // 保存用户到本地存储
    localStorage.setItem('user', JSON.stringify(newUser))

    // 更新当前用户
    currentUser.value = newUser

    return newUser
  }

  // 登出
  const logout = () => {
    // 清除本地存储
    localStorage.removeItem('user')

    // 清除当前用户
    currentUser.value = null
  }

  // 获取当前用户
  const getCurrentUser = (): User | null => {
    if (currentUser.value) {
      return currentUser.value
    }

    // 尝试从本地存储获取
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        currentUser.value = user
        return user
      } catch (error) {
        console.error('解析用户数据失败:', error)
        localStorage.removeItem('user')
      }
    }

    return null
  }

  // 更新用户偏好
  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<User> => {
    // 检查用户是否已登录
    const user = getCurrentUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新用户偏好
    user.preferences = {
      ...user.preferences,
      ...preferences,
    }

    // 更新用户列表
    const index = users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users[index] = user
    }

    // 保存到本地存储
    localStorage.setItem('user', JSON.stringify(user))

    // 更新当前用户
    currentUser.value = user

    return user
  }

  // 同步用户数据
  const syncUserData = async (): Promise<void> => {
    // 检查用户是否已登录
    const user = getCurrentUser()
    if (!user) {
      return
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 在实际应用中，这里应该与后端同步数据
    console.log('同步用户数据:', user)
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
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    updatePreferences,
    syncUserData,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
  }
}
