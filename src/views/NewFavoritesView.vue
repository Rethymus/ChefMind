<template>
  <div class="favorites-view-new">
    <!-- 调试面板 -->
    <div class="debug-panel" v-if="showDebug">
      <h3>🔍 调试信息</h3>
      <p>组件已挂载: {{ isMounted }}</p>
      <p>加载状态: {{ isLoading }}</p>
      <p>收藏数量: {{ savedRecipes.length }}</p>
      <p>localStorage 原始数据: {{ rawData?.substring(0, 100) }}...</p>
      <button @click="toggleDebug">隐藏调试</button>
      <button @click="refreshData">刷新数据</button>
      <button @click="addTestData">添加测试数据</button>
      <button @click="testClick" style="background: red; color: white;">测试点击事件</button>
      <button @click="testAlert" style="background: purple; color: white;">直接alert测试</button>
    </div>

    <!-- 页面头部 -->
    <header class="page-header-new">
      <h1 class="page-title-new">我的收藏</h1>
      <div class="header-actions-new">
        <button @click="toggleDebug" class="debug-toggle-btn">
          {{ showDebug ? '隐藏调试' : '显示调试' }}
        </button>
        <button @click="refreshData" class="refresh-btn">刷新</button>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content-new">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state-new">
        <div class="loading-spinner-new"></div>
        <p>正在加载收藏...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="savedRecipes.length === 0" class="empty-state-new">
        <div class="empty-icon-new">📚</div>
        <h2>暂无收藏的菜谱</h2>
        <p>浏览菜谱并点击收藏按钮来添加到这里</p>
        <router-link to="/search" class="explore-btn-new">
          去搜索菜谱
        </router-link>
      </div>

      <!-- 菜谱列表 -->
      <div v-else class="recipes-list-new">
        <h2>{{ savedRecipes.length }} 个收藏菜谱</h2>
        <div class="recipes-grid-new">
          <div 
            v-for="(recipe, index) in savedRecipes" 
            :key="recipe.id || `recipe-${index}`"
            class="recipe-card-new"
          >
            <div class="recipe-image-new">
              <img 
                v-if="recipe.image" 
                :src="recipe.image" 
                :alt="recipe.name || recipe.title"
                @error="onImageError"
              />
              <div v-else class="placeholder-image-new">
                🍽️
              </div>
            </div>
            
            <div class="recipe-content-new">
              <h3 class="recipe-title-new">{{ recipe.name || recipe.title }}</h3>
              <p v-if="recipe.description" class="recipe-desc-new">{{ recipe.description }}</p>
              
              <div class="recipe-meta-new">
                <span v-if="recipe.cookingTime" class="cooking-time-new">
                  ⏱️ {{ recipe.cookingTime }}分钟
                </span>
                <span v-if="recipe.difficulty" class="difficulty-new">
                  ⭐ {{ recipe.difficulty }}/5
                </span>
              </div>
              
              <div class="recipe-actions-new">
                <button 
                  @click="() => viewRecipe(recipe)" 
                  class="view-btn-new"
                  type="button"
                  style="position: relative; z-index: 100;"
                >
                  查看详情
                </button>
                <button 
                  @click="() => removeRecipe(recipe.id, index)" 
                  class="remove-btn-new"
                  type="button"
                  style="position: relative; z-index: 100;"
                >
                  移除收藏
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useRouter } from 'vue-router'

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

// const router = useRouter()

// 响应式数据
const savedRecipes = ref<Recipe[]>([])
const isLoading = ref(true)
const isMounted = ref(false)
const showDebug = ref(true)
const rawData = ref<string | null>(null)

// 加载收藏数据
const loadSavedRecipes = () => {
  console.log('🔍 NewFavorites: 开始加载收藏数据')
  isLoading.value = true
  
  try {
    const saved = localStorage.getItem('savedRecipes')
    rawData.value = saved
    console.log('🔍 NewFavorites: localStorage 原始数据:', saved)
    
    if (saved) {
      const recipes = JSON.parse(saved)
      savedRecipes.value = Array.isArray(recipes) ? recipes : []
      console.log('🔍 NewFavorites: 解析后的菜谱数量:', savedRecipes.value.length)
    } else {
      savedRecipes.value = []
      console.log('🔍 NewFavorites: localStorage 中没有数据')
    }
  } catch (error) {
    console.error('🔍 NewFavorites: 解析数据失败:', error)
    savedRecipes.value = []
  } finally {
    isLoading.value = false
    console.log('🔍 NewFavorites: 数据加载完成')
  }
}

// 刷新数据
const refreshData = () => {
  console.log('🔍 NewFavorites: 手动刷新数据')
  loadSavedRecipes()
}

// 测试点击事件
const testClick = () => {
  console.log('🔍 NewFavorites: 测试点击事件触发')
  window.alert('测试点击事件正常工作！')
}

// 测试alert函数
const testAlert = () => {
  console.log('🔍 NewFavorites: 测试alert函数')
  window.alert('直接调用alert测试成功！')
}

// 切换调试面板
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// 添加测试数据
const addTestData = () => {
  const testRecipe: Recipe = {
    id: 'test-new-' + Date.now(),
    name: '新版本测试菜谱',
    title: '新版本测试菜谱',
    description: '这是在新版本收藏页面中添加的测试菜谱',
    cookingTime: 25,
    difficulty: 3,
    ingredients: ['新测试食材1', '新测试食材2'],
    steps: ['新测试步骤1', '新测试步骤2']
  }
  
  savedRecipes.value.push(testRecipe)
  localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes.value))
  console.log('🔍 NewFavorites: 添加测试数据，当前数量:', savedRecipes.value.length)
}

// 查看菜谱详情
const viewRecipe = (recipe: Recipe) => {
  console.log('🔍 NewFavorites: 查看菜谱详情点击触发')
  console.log('🔍 NewFavorites: 菜谱数据:', recipe)
  console.log('🔍 NewFavorites: 菜谱名称:', recipe.name || recipe.title)
  
  try {
    // 显示菜谱详情信息
    const recipeInfo = `
菜谱名称: ${recipe.name || recipe.title}
描述: ${recipe.description || '无描述'}
烹饪时间: ${recipe.cookingTime ? recipe.cookingTime + '分钟' : '未设置'}
难度: ${recipe.difficulty ? recipe.difficulty + '/5' : '未设置'}
食材数量: ${recipe.ingredients ? recipe.ingredients.length : 0}
步骤数量: ${recipe.steps ? recipe.steps.length : 0}
    `
    window.alert(recipeInfo)
  } catch (error) {
    console.error('🔍 NewFavorites: 查看详情错误:', error)
    window.alert('查看详情时发生错误')
  }
}

// 移除收藏
const removeRecipe = (recipeId: string | undefined, index: number) => {
  console.log('🔍 NewFavorites: 移除收藏点击触发')
  console.log('🔍 NewFavorites: 菜谱ID:', recipeId)
  console.log('🔍 NewFavorites: 索引:', index)
  console.log('🔍 NewFavorites: 当前收藏数量:', savedRecipes.value.length)
  
  try {
    const recipe = savedRecipes.value[index]
    const recipeName = recipe?.name || recipe?.title || '未知菜谱'
    
    if (window.confirm(`确定要移除收藏的"${recipeName}"吗？`)) {
      // 移除指定索引的菜谱
      const removed = savedRecipes.value.splice(index, 1)
      console.log('🔍 NewFavorites: 已移除菜谱:', removed[0])
      
      // 更新localStorage
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes.value))
      console.log('🔍 NewFavorites: 移除成功，剩余数量:', savedRecipes.value.length)
      
      // 显示成功消息
      window.alert(`已移除收藏"${recipeName}"`)
    } else {
      console.log('🔍 NewFavorites: 用户取消移除操作')
    }
  } catch (error) {
    console.error('🔍 NewFavorites: 移除收藏错误:', error)
    window.alert('移除收藏时发生错误')
  }
}

// 图片加载错误处理
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 生命周期
onMounted(() => {
  console.log('🔍 NewFavorites: 组件已挂载')
  isMounted.value = true
  loadSavedRecipes()
})
</script>

<style scoped>
.favorites-view-new {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.debug-panel {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.debug-panel h3 {
  margin: 0 0 10px 0;
  color: #856404;
}

.debug-panel p {
  margin: 5px 0;
  font-size: 14px;
}

.debug-panel button {
  background: #ffc107;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
}

.page-header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.page-title-new {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions-new {
  display: flex;
  gap: 10px;
}

.debug-toggle-btn, .refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.debug-toggle-btn:hover, .refresh-btn:hover {
  background: #0056b3;
}

.main-content-new {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state-new {
  text-align: center;
  padding: 40px;
}

.loading-spinner-new {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state-new {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-new {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state-new h2 {
  color: #666;
  margin-bottom: 10px;
}

.empty-state-new p {
  color: #999;
  margin-bottom: 30px;
}

.explore-btn-new {
  display: inline-block;
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
}

.explore-btn-new:hover {
  background: #0056b3;
}

.recipes-list-new h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.recipes-grid-new {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recipe-card-new {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image-new {
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-image-new img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image-new {
  font-size: 48px;
  color: #ccc;
}

.recipe-content-new {
  padding: 15px;
}

.recipe-title-new {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.recipe-desc-new {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.recipe-meta-new {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.recipe-actions-new {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 10;
}

.view-btn-new {
  flex: 1;
  background: #28a745;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  pointer-events: all;
  position: relative;
  z-index: 11;
}

.view-btn-new:hover {
  background: #218838;
}

.remove-btn-new {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  pointer-events: all;
  position: relative;
  z-index: 11;
}

.remove-btn-new:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .favorites-view-new {
    padding: 10px;
  }
  
  .page-header-new {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .recipes-grid-new {
    grid-template-columns: 1fr;
  }
}
</style>
