<template>
  <div class="favorites-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="handleRefresh">
          🔄 刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载收藏...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="recipes.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h2>暂无收藏的菜谱</h2>
      <p>去发现一些美味的菜谱并收藏它们吧！</p>
      <button class="explore-btn" @click="handleExplore">
        🔍 探索菜谱
      </button>
    </div>

    <!-- 菜谱列表 -->
    <div v-else class="recipes-section">
      <div class="section-header">
        <h2>{{ recipes.length }} 个收藏菜谱</h2>
        <button class="add-test-btn" @click="handleAddTest">
          ➕ 添加测试菜谱
        </button>
      </div>

      <div class="recipes-grid">
        <div 
          v-for="(recipe, index) in recipes" 
          :key="`recipe-${index}-${recipe.id || Date.now()}`"
          class="recipe-card"
        >
          <!-- 菜谱图片 -->
          <div class="recipe-image">
            <img 
              v-if="recipe.image && recipe.image !== ''" 
              :src="recipe.image" 
              :alt="recipe.name || recipe.title || '菜谱图片'"
              @error="handleImageError"
            />
            <div v-else class="placeholder-image">
              🍽️
            </div>
          </div>

          <!-- 菜谱信息 -->
          <div class="recipe-info">
            <h3 class="recipe-name">{{ recipe.name || recipe.title || '未命名菜谱' }}</h3>
            <p v-if="recipe.description" class="recipe-desc">{{ recipe.description }}</p>
            
            <!-- 菜谱元数据 -->
            <div class="recipe-meta">
              <span v-if="recipe.cookingTime" class="meta-item">
                ⏱️ {{ recipe.cookingTime }}分钟
              </span>
              <span v-if="recipe.difficulty" class="meta-item">
                ⭐ {{ recipe.difficulty }}/5
              </span>
              <span v-if="recipe.ingredients" class="meta-item">
                🥗 {{ recipe.ingredients.length }}种食材
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="recipe-actions">
              <button 
                class="view-btn"
                @click="handleViewRecipe(recipe, index)"
              >
                👁️ 查看详情
              </button>
              <button 
                class="remove-btn"
                @click="handleRemoveRecipe(recipe, index)"
              >
                🗑️ 移除收藏
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试信息 -->
    <div class="debug-info" v-if="showDebug">
      <h3>🔧 调试信息</h3>
      <div class="debug-content">
        <p><strong>localStorage Key:</strong> savedRecipes</p>
        <p><strong>数据长度:</strong> {{ recipes.length }}</p>
        <p><strong>原始数据:</strong> {{ rawData ? rawData.substring(0, 100) + '...' : '无数据' }}</p>
        <button @click="handleToggleDebug">{{ showDebug ? '隐藏' : '显示' }}调试</button>
        <button @click="handleClearAll">清空所有收藏</button>
      </div>
    </div>

    <!-- 调试切换按钮 -->
    <button class="debug-toggle" @click="handleToggleDebug">
      {{ showDebug ? '🔼' : '🔽' }} 调试
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 类型定义
interface Recipe {
  id?: string
  name?: string
  title?: string
  description?: string
  image?: string
  cookingTime?: number
  difficulty?: number
  ingredients?: string[]
  steps?: string[]
  [key: string]: any
}

// 响应式数据
const loading = ref(true)
const recipes = ref<Recipe[]>([])
const showDebug = ref(false)
const rawData = ref<string>('')

// 加载收藏数据
const loadFavorites = () => {
  console.log('📱 开始加载收藏数据...')
  loading.value = true
  
  try {
    const stored = localStorage.getItem('savedRecipes')
    rawData.value = stored || ''
    
    if (stored) {
      const parsed = JSON.parse(stored)
      recipes.value = Array.isArray(parsed) ? parsed : []
      console.log('📱 成功加载', recipes.value.length, '个收藏菜谱')
    } else {
      recipes.value = []
      console.log('📱 localStorage中没有收藏数据')
    }
  } catch (error) {
    console.error('📱 加载收藏数据失败:', error)
    recipes.value = []
  } finally {
    loading.value = false
  }
}

// 保存到localStorage
const saveFavorites = () => {
  try {
    localStorage.setItem('savedRecipes', JSON.stringify(recipes.value))
    console.log('📱 保存成功，当前收藏数量:', recipes.value.length)
  } catch (error) {
    console.error('📱 保存失败:', error)
  }
}

// 处理刷新
const handleRefresh = () => {
  console.log('📱 用户点击刷新')
  loadFavorites()
}

// 处理探索菜谱
const handleExplore = () => {
  console.log('📱 用户点击探索菜谱')
  window.location.hash = '#/search'
}

// 处理查看菜谱详情
const handleViewRecipe = (recipe: Recipe, index: number) => {
  console.log('📱 查看菜谱详情:', recipe.name || recipe.title, '索引:', index)
  
  const details = [
    `📖 菜谱: ${recipe.name || recipe.title || '未命名'}`,
    `📝 描述: ${recipe.description || '无描述'}`,
    `⏱️ 烹饪时间: ${recipe.cookingTime ? recipe.cookingTime + '分钟' : '未设置'}`,
    `⭐ 难度: ${recipe.difficulty ? recipe.difficulty + '/5' : '未设置'}`,
    `🥗 食材: ${recipe.ingredients ? recipe.ingredients.length + '种' : '未设置'}`,
    `📋 步骤: ${recipe.steps ? recipe.steps.length + '步' : '未设置'}`
  ].join('\n')
  
  window.alert(details)
}

// 处理移除收藏
const handleRemoveRecipe = (recipe: Recipe, index: number) => {
  const recipeName = recipe.name || recipe.title || '未命名菜谱'
  console.log('📱 准备移除收藏:', recipeName, '索引:', index)
  
  if (window.confirm(`确定要移除收藏的"${recipeName}"吗？`)) {
    recipes.value.splice(index, 1)
    saveFavorites()
    console.log('📱 移除成功，剩余:', recipes.value.length, '个收藏')
    window.alert(`已移除收藏"${recipeName}"`)
  } else {
    console.log('📱 用户取消移除操作')
  }
}

// 处理添加测试菜谱
const handleAddTest = () => {
  console.log('📱 添加测试菜谱')
  
  const testRecipe: Recipe = {
    id: 'test-' + Date.now(),
    name: `测试菜谱 ${new Date().toLocaleTimeString()}`,
    description: '这是一个测试用的菜谱，包含完整的菜谱信息',
    cookingTime: Math.floor(Math.random() * 60) + 15,
    difficulty: Math.floor(Math.random() * 5) + 1,
    ingredients: ['测试食材A', '测试食材B', '测试食材C'],
    steps: ['准备食材', '开始烹饪', '调味装盘'],
    image: `https://picsum.photos/300/200?random=${Date.now()}`
  }
  
  recipes.value.push(testRecipe)
  saveFavorites()
  console.log('📱 测试菜谱添加成功')
}

// 处理切换调试模式
const handleToggleDebug = () => {
  showDebug.value = !showDebug.value
  console.log('📱 调试模式:', showDebug.value ? '开启' : '关闭')
}

// 处理清空所有收藏
const handleClearAll = () => {
  if (window.confirm('确定要清空所有收藏吗？此操作不可恢复！')) {
    recipes.value = []
    saveFavorites()
    console.log('📱 已清空所有收藏')
  }
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  console.log('📱 图片加载失败:', img.src)
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('📱 FavoritesPageRebuilt 组件已挂载')
  loadFavorites()
})
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: #0056b3;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h2 {
  color: #666;
  margin-bottom: 12px;
  font-size: 24px;
}

.empty-state p {
  color: #999;
  margin-bottom: 30px;
  font-size: 16px;
}

.explore-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.explore-btn:hover {
  background: #218838;
}

.recipes-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.add-test-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-test-btn:hover {
  background: #138496;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 20px;
}

.recipe-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 48px;
  color: #ccc;
}

.recipe-info {
  padding: 20px;
}

.recipe-name {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.recipe-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  font-size: 12px;
  color: #777;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.recipe-actions {
  display: flex;
  gap: 8px;
}

.view-btn {
  flex: 1;
  background: #28a745;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.view-btn:hover {
  background: #218838;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #c82333;
}

.debug-info {
  margin-top: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
}

.debug-info h3 {
  margin: 0 0 10px 0;
  color: #856404;
  font-size: 16px;
}

.debug-content p {
  margin: 5px 0;
  font-size: 14px;
  color: #856404;
}

.debug-content button {
  background: #ffc107;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  margin-right: 8px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 12px;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  width: 50px;
  height: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .favorites-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
    padding: 15px;
  }
  
  .recipe-actions {
    flex-direction: column;
  }
}
</style>
