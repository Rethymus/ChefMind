<template>
  <div class="favorites-view" style="min-height: 100vh; background: white; padding: 20px;">
    <div style="border: 2px solid red; padding: 10px; margin: 10px 0;">
      <h1 style="color: red; font-size: 24px;">🔍 调试: FavoritesView 组件已加载</h1>
      <p>savedRecipes.length: {{ savedRecipes.length }}</p>
      <p>isLoading: {{ isLoading }}</p>
    </div>
    
    <header class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <div class="header-actions">
        <button
          v-if="savedRecipes.length > 0"
          class="batch-export-btn"
          @click="showBatchExportModal = true"
        >
          <span class="icon">📤</span>
          批量导出
        </button>
        <!-- 调试按钮 -->
        <button class="debug-btn" @click="loadSavedRecipes" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">
          <span class="icon">🔄</span>
          刷新数据
        </button>
        <button class="debug-btn" @click="addTestFavorite" style="background: #17a2b8; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">
          <span class="icon">🧪</span>
          添加测试
        </button>
        <div class="view-toggle">
          <button
            :class="['toggle-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
            title="网格视图"
          >
            <span class="icon">◫</span>
          </button>
          <button
            :class="['toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            title="列表视图"
          >
            <span class="icon">≡</span>
          </button>
        </div>
      </div>
    </header>

    <div class="favorites-content" style="background: yellow; min-height: 80vh; padding: 20px; border: 3px solid red;">
      <div style="background: orange; padding: 10px; margin: 10px 0; border: 2px solid green;">
        <h2 style="color: red;">🔍 调试: FavoritesContent 已渲染</h2>
        <p>savedRecipes.length: {{ savedRecipes.length }}</p>
        <p>isLoading: {{ isLoading }}</p>
        <p>activeCategory: {{ activeCategory }}</p>
      </div>
      
      <div v-if="isLoading" class="loading-container" style="background: lightblue; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>加载收藏中...</p>
      </div>

      <div v-else-if="savedRecipes.length === 0" class="empty-state" style="background: lightcoral; padding: 40px; border: 3px solid darkred;">
        <div class="empty-icon">🍽️</div>
        <h3>暂无收藏的食谱</h3>
        <p>您可以在浏览食谱时点击"保存食谱"按钮添加收藏</p>
        <!-- 调试信息 -->
        <div style="margin: 20px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px;">
          <p><strong>调试信息:</strong></p>
          <p>savedRecipes.length: {{ savedRecipes.length }}</p>
          <p>isLoading: {{ isLoading }}</p>
          <p>LocalStorage 状态: 请打开浏览器控制台查看详细日志</p>
        </div>
        <button class="primary-button" @click="goToGenerator">
          <span class="button-icon">🔍</span>
          去搜索食谱
        </button>
      </div>

      <template v-else>
        <div style="background: lightgreen; padding: 20px; border: 3px solid green; margin: 10px 0;">
          <h2 style="color: darkgreen;">🔍 调试: 有收藏数据，准备显示 {{ savedRecipes.length }} 个菜谱</h2>
          <p>filteredRecipes.length: {{ filteredRecipes.length }}</p>
          <p>viewMode: {{ viewMode }}</p>
        </div>
        
        <!-- 分类标签 -->
        <div class="category-tabs" style="background: lightblue; padding: 10px; border: 2px solid blue;">
          <button
            :class="['category-tab', { active: activeCategory === 'all' }]"
            @click="activeCategory = 'all'"
          >
            全部
          </button>
          <button
            v-for="category in categories"
            :key="category"
            :class="['category-tab', { active: activeCategory === category }]"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
          <button class="category-tab add-category" @click="showAddCategoryModal = true">
            <span class="icon">+</span> 添加分类
          </button>
        </div>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="recipes-grid" style="background: pink; padding: 20px; border: 3px solid purple;">
          <div style="background: white; padding: 10px; margin-bottom: 10px;">
            <h3 style="color: purple;">🔍 调试: 网格视图渲染中，显示 {{ filteredRecipes.length }} 个菜谱</h3>
          </div>
          <AutoRecipeCard
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            :recipe="recipe"
            show-actions
            show-favorite-button
            show-category-button
            show-view-button
            style="border: 2px solid red; margin: 10px;"
            @view-details="viewRecipe"
            @remove-favorite="removeFromFavorites"
            @edit-category="editRecipeCategory"
          />
        </div>

        <!-- 列表视图 -->
        <div v-else class="recipes-list">
          <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-list-item">
            <div class="recipe-info">
              <h3 class="recipe-title">{{ recipe.name }}</h3>
              <p class="recipe-description">{{ recipe.description }}</p>
              <div class="recipe-meta">
                <span class="cooking-time">{{ formatCookingTime(recipe.cookingTime) }}</span>
                <span class="difficulty">{{ formatDifficulty(recipe.difficulty) }}</span>
                <div class="recipe-rating">
                  <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]"
                    >★</span
                  >
                </div>
              </div>
            </div>
            <div class="recipe-actions">
              <button class="action-btn" @click="editRecipeCategory(recipe)" title="修改分类">
                <span class="icon">📂</span>
              </button>
              <button class="action-btn" @click="removeFromFavorites(recipe)" title="取消收藏">
                <span class="icon">❌</span>
              </button>
              <button class="view-btn" @click="viewRecipe(recipe)">查看</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 添加分类模态框 -->
    <div v-if="showAddCategoryModal" class="modal-overlay" @click="showAddCategoryModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">添加新分类</h3>
        <div class="modal-body">
          <input
            v-model="newCategory"
            type="text"
            placeholder="输入分类名称"
            class="category-input"
            @keyup.enter="addCategory"
          />
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddCategoryModal = false">取消</button>
          <button class="confirm-btn" @click="addCategory" :disabled="!newCategory.trim()">
            添加
          </button>
        </div>
      </div>
    </div>

    <!-- 修改食谱分类模态框 -->
    <div v-if="showEditCategoryModal" class="modal-overlay" @click="showEditCategoryModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">修改食谱分类</h3>
        <div class="modal-body">
          <div class="recipe-name">{{ selectedRecipe?.name }}</div>
          <div class="category-options">
            <div
              v-for="category in categories"
              :key="category"
              :class="['category-option', { selected: selectedRecipe?.category === category }]"
              @click="updateRecipeCategory(category)"
            >
              {{ category }}
            </div>
            <div class="category-option add-new" @click="showAddCategoryFromEdit = true">
              <span class="icon">+</span> 新建分类
            </div>
          </div>
          <div v-if="showAddCategoryFromEdit" class="add-category-inline">
            <input
              v-model="newCategory"
              type="text"
              placeholder="输入分类名称"
              class="category-input"
              @keyup.enter="addCategoryAndAssign"
            />
            <button class="add-btn" @click="addCategoryAndAssign" :disabled="!newCategory.trim()">
              添加
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showEditCategoryModal = false">取消</button>
          <button class="confirm-btn" @click="showEditCategoryModal = false">完成</button>
        </div>
      </div>
    </div>

    <!-- 批量导出模态框 -->
    <div v-if="showBatchExportModal" class="modal-overlay" @click="showBatchExportModal = false">
      <div class="modal-content batch-export-modal" @click.stop>
        <h3 class="modal-title">批量导出食谱</h3>
        <button class="modal-close" @click="showBatchExportModal = false">×</button>
        <div class="modal-body">
          <RecipeBatchExport :recipes="savedRecipes" @notification="showNotification" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Recipe } from '@/types/recipe'
  import RecipeBatchExport from '@/components/recipe/RecipeBatchExport.vue'
  import AutoRecipeCard from '@/components/recipe/AutoRecipeCard.vue'
  import { formatDifficulty, formatCookingTime } from '@/utils/formatUtils'

  const router = useRouter()
  const isLoading = ref(true)
  const savedRecipes = ref<(Recipe & { category?: string })[]>([])
  const categories = ref<string[]>(['家常菜', '快手菜', '营养餐', '宴客菜'])
  const activeCategory = ref('all')
  const viewMode = ref<'grid' | 'list'>('grid')

  // 模态框状态
  const showAddCategoryModal = ref(false)
  const showEditCategoryModal = ref(false)
  const showAddCategoryFromEdit = ref(false)
  const showBatchExportModal = ref(false)
  const newCategory = ref('')
  const selectedRecipe = ref<(Recipe & { category?: string }) | null>(null)

  // 过滤后的食谱
  const filteredRecipes = computed(() => {
    console.log('🔍 调试: filteredRecipes computed 被调用')
    console.log('🔍 调试: activeCategory.value:', activeCategory.value)
    console.log('🔍 调试: savedRecipes.value:', savedRecipes.value)
    
    if (activeCategory.value === 'all') {
      console.log('🔍 调试: 返回全部食谱，数量:', savedRecipes.value.length)
      return savedRecipes.value
    }
    const filtered = savedRecipes.value.filter(recipe => recipe.category === activeCategory.value)
    console.log('🔍 调试: 按分类过滤后的食谱数量:', filtered.length)
    return filtered
  })

  // 加载收藏的食谱
  const loadSavedRecipes = () => {
    console.log('🔍 调试: 开始加载收藏数据')
    isLoading.value = true
    
    try {
      const saved = localStorage.getItem('savedRecipes')
      console.log('🔍 调试: localStorage中的savedRecipes:', saved)
      
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('🔍 调试: 解析后的收藏数据:', parsed)
        console.log('🔍 调试: 数据类型:', typeof parsed, '是否为数组:', Array.isArray(parsed))
        
        // 确保解析的数据是数组
        if (Array.isArray(parsed)) {
          savedRecipes.value = parsed
          console.log('🔍 调试: savedRecipes.value设置为:', savedRecipes.value)
          console.log('🔍 调试: savedRecipes.value.length:', savedRecipes.value.length)
        } else {
          console.warn('⚠️  localStorage中的数据不是数组，重置为空数组')
          savedRecipes.value = []
          localStorage.setItem('savedRecipes', '[]')
        }
      } else {
        console.log('🔍 调试: localStorage中没有savedRecipes数据，设置为空数组')
        savedRecipes.value = []
      }
    } catch (error) {
      console.error('❌ 加载收藏食谱失败:', error)
      savedRecipes.value = []
    } finally {
      isLoading.value = false
      console.log('🔍 调试: 加载完成，isLoading设置为false')
      console.log('🔍 调试: 最终savedRecipes.value.length:', savedRecipes.value.length)
      
      // 强制触发响应式更新
      setTimeout(() => {
        console.log('🔍 调试: 1秒后检查 - savedRecipes.value.length:', savedRecipes.value.length)
      }, 1000)
    }
  }

  // 从收藏中移除食谱
  const removeFromFavorites = (recipe: Recipe) => {
    const index = savedRecipes.value.findIndex(r => r.id === recipe.id)
    if (index !== -1) {
      savedRecipes.value.splice(index, 1)
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes.value))

      // 显示通知
      const event = new CustomEvent('notification', {
        detail: {
          type: 'success',
          title: '已移除',
          message: `已从收藏中移除"${recipe.name}"`,
        },
      })
      window.dispatchEvent(event)
    }
  }

  // 查看食谱详情
  const viewRecipe = (recipe: Recipe) => {
    // 将食谱数据存储到sessionStorage，以便在详情页面获取
    sessionStorage.setItem('viewRecipe', JSON.stringify(recipe))
    router.push('/recipe-detail')
  }

  // 前往食谱搜索页面
  const goToGenerator = () => {
    router.push('/search')
  }

  // 添加新分类
  const addCategory = () => {
    if (newCategory.value.trim()) {
      categories.value.push(newCategory.value.trim())
      newCategory.value = ''
      showAddCategoryModal.value = false

      // 保存分类到本地存储
      localStorage.setItem('recipeCategories', JSON.stringify(categories.value))
    }
  }

  // 编辑食谱分类
  const editRecipeCategory = (recipe: Recipe & { category?: string }) => {
    selectedRecipe.value = recipe
    showEditCategoryModal.value = true
    showAddCategoryFromEdit.value = false
  }

  // 更新食谱分类
  const updateRecipeCategory = (category: string) => {
    if (selectedRecipe.value) {
      const index = savedRecipes.value.findIndex(r => r.id === selectedRecipe.value?.id)
      if (index !== -1) {
        savedRecipes.value[index].category = category
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes.value))
      }
    }
  }

  // 添加分类并分配给当前食谱
  const addCategoryAndAssign = () => {
    if (newCategory.value.trim()) {
      categories.value.push(newCategory.value.trim())

      // 保存分类到本地存储
      localStorage.setItem('recipeCategories', JSON.stringify(categories.value))

      // 分配给当前食谱
      updateRecipeCategory(newCategory.value.trim())

      newCategory.value = ''
      showAddCategoryFromEdit.value = false
    }
  }

  // 显示通知
  const showNotification = (notification: { type: string; title: string; message: string }) => {
    const event = new CustomEvent('notification', {
      detail: notification,
    })
    window.dispatchEvent(event)
  }

  // 添加测试收藏功能
  const addTestFavorite = () => {
    const testRecipe = {
      id: 'test_' + Date.now(),
      name: '测试收藏菜谱',
      title: '测试收藏菜谱',
      description: '这是一个测试收藏的菜谱',
      ingredients: ['测试食材1 100g', '测试食材2 适量'],
      steps: ['测试步骤1', '测试步骤2'],
      cookingTime: '30',
      difficulty: 'easy',
      servings: 2,
      rating: 4.5,
      tags: ['测试', '收藏'],
      cookingMethods: ['测试'],
      createdAt: new Date().toISOString()
    }

    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
      savedRecipes.push(testRecipe)
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes))
      console.log('🔍 添加测试收藏成功，重新加载数据')
      loadSavedRecipes()
      showNotification({ type: 'success', title: '成功', message: '添加测试收藏成功' })
    } catch (error) {
      console.error('❌ 添加测试收藏失败:', error)
    }
  }

  // 生命周期钩子
  onMounted(() => {
    console.log('🔍 FavoritesView onMounted 开始')
    
    // 加载保存的分类
    const savedCategories = localStorage.getItem('recipeCategories')
    if (savedCategories) {
      categories.value = JSON.parse(savedCategories)
    }

    // 加载收藏的食谱
    loadSavedRecipes()

    // 监听storage事件，当其他页面修改localStorage时自动刷新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedRecipes') {
        console.log('🔍 检测到localStorage中savedRecipes变化，重新加载数据')
        loadSavedRecipes()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // 添加全局调试函数
    ;(window as any).refreshFavorites = loadSavedRecipes
    console.log('🔍 已添加全局调试函数 window.refreshFavorites()')

    // 组件卸载时移除监听器
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      delete (window as any).refreshFavorites
    }
  })
</script>

<style lang="scss" scoped>
  .favorites-view {
    min-height: 100vh;
    padding: 2rem 0;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0 2rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--heading-color);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .batch-export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--primary-color-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .view-toggle {
    display: flex;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    overflow: hidden;
  }

  .toggle-btn {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    color: var(--text-color);

    &.active {
      background-color: var(--primary-color);
      color: white;
    }

    .icon {
      font-size: 1.2rem;
    }
  }

  .favorites-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--border-color);
    border-top: 5px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: var(--text-color-secondary);
    margin-bottom: 2rem;
  }

  .primary-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--primary-color-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .button-icon {
    font-size: 1.2rem;
  }

  .category-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .category-tab {
    background-color: var(--bg-color-secondary);
    border: none;
    border-radius: 20px;
    padding: 0.5rem 1.2rem;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &.active {
      background-color: var(--primary-color);
      color: white;
    }

    &:hover:not(.active) {
      background-color: var(--hover-color);
    }

    &.add-category {
      background-color: var(--bg-color);
      border: 1px dashed var(--border-color);

      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }

  .recipe-card {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .recipe-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0;
    flex: 1;
  }

  .recipe-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    background: none;
    border: none;
    font-size: 1rem;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      color: var(--primary-color);
      background-color: var(--hover-color);
    }
  }

  .recipe-description {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin-bottom: 1rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recipe-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .cooking-time {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }

  .recipe-rating {
    display: flex;
    gap: 2px;
  }

  .star {
    color: var(--border-color);
    font-size: 0.8rem;
  }

  .star.filled {
    color: var(--warning-color);
  }

  .view-recipe-btn {
    width: 100%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 0;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--primary-color-dark);
    }
  }

  .recipes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .recipe-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
  }

  .recipe-info {
    flex: 1;
  }

  .difficulty {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin: 0 1rem;
  }

  .view-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--primary-color-dark);
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--bg-color);
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    position: relative;

    &.batch-export-modal {
      max-width: 800px;
      width: 95%;
    }
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-color-secondary);
    cursor: pointer;

    &:hover {
      color: var(--text-color);
    }
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
  }

  .modal-body {
    margin-bottom: 2rem;
  }

  .category-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background-color: var(--bg-color-light);
    color: var(--text-color);

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn {
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .confirm-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;

    &:hover {
      background-color: var(--primary-color-dark);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .recipe-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .category-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .category-option {
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    padding: 0.8rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    &.selected {
      background-color: var(--primary-color);
      color: white;
    }

    &.add-new {
      border: 1px dashed var(--border-color);
      background-color: transparent;

      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

  .add-category-inline {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .add-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--primary-color-dark);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 0 1.5rem;
    }

    .favorites-content {
      padding: 0 1.5rem;
    }

    .recipe-list-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .recipe-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .category-options {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
  }
</style>

<style scoped>
/* 强制显示样式 - 调试用 */
.favorites-view {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 1 !important;
}

.favorites-content {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.recipes-container {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.recipes-grid {
  display: grid !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.empty-state {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
