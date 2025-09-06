<template>
  <div class="profile-view">
    <div class="profile-container">
      <!-- 用户信息卡片 -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-container">
              <img v-if="user.avatar" :src="user.avatar" :alt="user.username" class="avatar" />
              <div v-else class="avatar-placeholder">
                {{ getUserInitials(user.username) }}
              </div>
            </div>
          </div>

          <div class="user-info">
            <h1 class="username">{{ user.username }}</h1>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">{{ userStats.recipesCount }}</span>
                <span class="stat-label">食谱</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ userStats.favoritesCount }}</span>
                <span class="stat-label">收藏</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ userStats.postsCount }}</span>
                <span class="stat-label">帖子</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-text">{{ tab.label }}</span>
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="tab-content">
        <!-- 我的食谱 -->
        <div v-if="activeTab === 'recipes'" class="recipes-section">
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="userRecipes.length === 0" class="empty-state">
            <div class="empty-icon">🍳</div>
            <h3>暂无食谱</h3>
            <p>开始创建您的第一个食谱吧</p>
          </div>

          <div v-else class="recipes-grid">
            <div
              v-for="recipe in userRecipes"
              :key="recipe.id"
              class="recipe-card"
              @click="viewRecipe(recipe.id)"
            >
              <div class="recipe-image">
                <img :src="recipe.image" :alt="recipe.title" />
              </div>

              <div class="recipe-info">
                <h3 class="recipe-title">{{ recipe.title }}</h3>
                <p class="recipe-description">{{ truncateText(recipe.description, 80) }}</p>

                <div class="recipe-meta">
                  <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span class="meta-text">{{ formatCookingTime(recipe.cookTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">⭐</span>
                    <span class="meta-text">{{ recipe.rating }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的收藏 -->
        <div v-if="activeTab === 'favorites'" class="favorites-section">
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="userFavorites.length === 0" class="empty-state">
            <div class="empty-icon">❤️</div>
            <h3>暂无收藏</h3>
            <p>去发现更多美味食谱吧</p>
          </div>

          <div v-else class="favorites-grid">
            <div
              v-for="recipe in userFavorites"
              :key="recipe.id"
              class="recipe-card"
              @click="viewRecipe(recipe.id)"
            >
              <div class="recipe-image">
                <img :src="recipe.image" :alt="recipe.title" />
              </div>

              <div class="recipe-info">
                <h3 class="recipe-title">{{ recipe.title }}</h3>
                <p class="recipe-description">{{ truncateText(recipe.description, 80) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 设置 -->
        <div v-if="activeTab === 'settings'" class="settings-section">
          <div class="settings-group">
            <h3 class="group-title">账户设置</h3>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">用户名</div>
                <div class="setting-value">{{ user.username }}</div>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">邮箱</div>
                <div class="setting-value">{{ user.email }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserService } from '@/services/userService'
  import { useRecipeService } from '@/services/recipeService'
  import { formatCookingTime } from '@/utils/formatUtils'

  // 路由
  const router = useRouter()

  // 服务
  const userService = useUserService()
  const recipeService = useRecipeService()

  // 状态
  const isLoading = ref(false)
  const activeTab = ref('recipes')

  // 用户数据
  const user = ref({
    id: '1',
    username: '美食爱好者',
    email: 'foodlover@example.com',
    avatar: null as string | null,
  })

  const userStats = ref({
    recipesCount: 0,
    favoritesCount: 0,
    postsCount: 0,
  })

  const userRecipes = ref<any[]>([])
  const userFavorites = ref<any[]>([])

  // 标签页配置
  const tabs = [
    { key: 'recipes', label: '我的食谱', icon: '🍳' },
    { key: 'favorites', label: '我的收藏', icon: '❤️' },
    { key: 'settings', label: '设置', icon: '⚙️' },
  ]

  // 生命周期钩子
  onMounted(async () => {
    await loadUserData()
  })

  // 方法
  const loadUserData = async () => {
    isLoading.value = true

    try {
      // 加载用户统计
      await loadUserStats()

      // 根据当前标签页加载对应数据
      await loadTabData()
    } catch (error) {
      console.error('加载用户数据失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadUserStats = async () => {
    try {
      const recipes = await recipeService.getAllRecipes()
      const favorites = userService.getFavorites()

      userStats.value = {
        recipesCount: recipes.filter(r => r.authorId === user.value.id).length,
        favoritesCount: favorites.length,
        postsCount: 0,
      }
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  }

  const loadTabData = async () => {
    switch (activeTab.value) {
      case 'recipes':
        await loadUserRecipes()
        break
      case 'favorites':
        await loadUserFavorites()
        break
    }
  }

  const loadUserRecipes = async () => {
    try {
      const allRecipes = await recipeService.getAllRecipes()
      userRecipes.value = allRecipes.filter(recipe => recipe.authorId === user.value.id)
    } catch (error) {
      console.error('加载用户食谱失败:', error)
    }
  }

  const loadUserFavorites = async () => {
    try {
      const favorites = userService.getFavorites()
      const allRecipes = await recipeService.getAllRecipes()
      userFavorites.value = allRecipes.filter(recipe => favorites.includes(recipe.id))
    } catch (error) {
      console.error('加载用户收藏失败:', error)
    }
  }

  // 导航操作
  const viewRecipe = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`)
  }

  // 辅助方法
  const getUserInitials = (username: string) => {
    if (!username) return '?'
    return username.substring(0, 2).toUpperCase()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
</script>

<style lang="scss" scoped>
  @import '@/styles/variables.scss';

  .profile-view {
    padding: 2rem 1rem;
    background-color: var(--bg-color);
    min-height: 100vh;
  }

  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .profile-card {
    background-color: var(--bg-color-secondary);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }
  }

  .avatar-container {
    width: 120px;
    height: 120px;

    .avatar,
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-placeholder {
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
    }
  }

  .user-info {
    flex: 1;

    .username {
      font-size: 2rem;
      font-weight: 700;
      color: var(--heading-color);
      margin: 0 0 0.5rem 0;
    }

    .user-email {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      margin: 0 0 1.5rem 0;
    }
  }

  .user-stats {
    display: flex;
    gap: 2rem;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
      }

      .stat-label {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
      }
    }
  }

  .profile-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);

    .tab-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      color: var(--text-color-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        color: var(--text-color);
      }

      &.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }
    }
  }

  .tab-content {
    min-height: 400px;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(var(--primary-color-rgb), 0.3);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--heading-color);
      margin: 0 0 0.5rem 0;
    }

    p {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      margin: 0;
    }
  }

  .recipes-grid,
  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .recipe-card {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .recipe-image {
      height: 200px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .recipe-info {
      padding: 1rem;

      .recipe-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--heading-color);
        margin: 0 0 0.5rem 0;
      }

      .recipe-description {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
        margin: 0 0 1rem 0;
        line-height: 1.4;
      }
    }
  }

  .recipe-meta {
    display: flex;
    gap: 1rem;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }
  }

  .settings-section {
    .settings-group {
      background-color: var(--bg-color-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      .group-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--heading-color);
        margin: 0 0 1rem 0;
      }
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .setting-info {
        .setting-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 0.2rem;
        }

        .setting-value {
          font-size: 0.8rem;
          color: var(--text-color-secondary);
        }
      }
    }
  }
</style>
