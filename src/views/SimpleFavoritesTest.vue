<template>
  <div class="simple-favorites" style="padding: 20px; background: white; min-height: 100vh;">
    <h1 style="color: red; border: 2px solid red; padding: 10px;">🔍 简化收藏页面测试</h1>
    
    <div style="background: yellow; padding: 15px; margin: 10px 0; border: 2px solid orange;">
      <h2>调试信息</h2>
      <p>savedRecipes 数量: {{ savedRecipes.length }}</p>
      <p>isLoading: {{ isLoading }}</p>
      <p>组件是否已挂载: {{ isMounted }}</p>
    </div>

    <div style="background: lightblue; padding: 10px; margin: 10px 0;">
      <button @click="loadData" style="background: green; color: white; border: none; padding: 10px; margin: 5px;">
        重新加载数据
      </button>
      <button @click="addTestRecipe" style="background: blue; color: white; border: none; padding: 10px; margin: 5px;">
        添加测试菜谱
      </button>
    </div>

    <div v-if="isLoading" style="background: orange; padding: 20px;">
      <p>正在加载...</p>
    </div>

    <div v-else-if="savedRecipes.length === 0" style="background: lightcoral; padding: 20px;">
      <h2>没有收藏的菜谱</h2>
      <p>请先收藏一些菜谱</p>
    </div>

    <div v-else style="background: lightgreen; padding: 20px;">
      <h2>找到 {{ savedRecipes.length }} 个收藏菜谱</h2>
      <div style="border: 2px solid green; padding: 10px; margin: 10px 0;">
        <div 
          v-for="(recipe, index) in savedRecipes" 
          :key="recipe.id || index"
          style="border: 1px solid blue; padding: 10px; margin: 5px; background: white;"
        >
          <h3 style="color: blue;">{{ recipe.name || recipe.title }}</h3>
          <p>{{ recipe.description }}</p>
          <p>ID: {{ recipe.id }}</p>
        </div>
      </div>
    </div>

    <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 12px;">
      <h3>原始数据:</h3>
      <pre>{{ JSON.stringify(savedRecipes, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const savedRecipes = ref<any[]>([])
const isLoading = ref(true)
const isMounted = ref(false)

const loadData = () => {
  console.log('🔍 SimpleFavorites: 开始加载数据')
  isLoading.value = true
  
  try {
    const saved = localStorage.getItem('savedRecipes')
    console.log('🔍 SimpleFavorites: localStorage 数据:', saved)
    
    if (saved) {
      const recipes = JSON.parse(saved)
      savedRecipes.value = recipes
      console.log('🔍 SimpleFavorites: 解析的菜谱:', recipes)
    } else {
      savedRecipes.value = []
      console.log('🔍 SimpleFavorites: 没有找到数据')
    }
  } catch (error) {
    console.error('🔍 SimpleFavorites: 加载数据错误:', error)
    savedRecipes.value = []
  } finally {
    isLoading.value = false
    console.log('🔍 SimpleFavorites: 加载完成，数量:', savedRecipes.value.length)
  }
}

const addTestRecipe = () => {
  const testRecipe = {
    id: 'simple-test-' + Date.now(),
    name: '简单测试菜谱',
    title: '简单测试菜谱',
    description: '这是在简化组件中添加的测试菜谱',
    ingredients: ['测试食材A', '测试食材B'],
    steps: ['简单步骤1', '简单步骤2']
  }
  
  savedRecipes.value.push(testRecipe)
  localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes.value))
  console.log('🔍 SimpleFavorites: 添加测试菜谱，当前数量:', savedRecipes.value.length)
}

onMounted(() => {
  console.log('🔍 SimpleFavorites: onMounted 触发')
  isMounted.value = true
  loadData()
})
</script>
