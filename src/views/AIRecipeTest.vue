<template>
  <div class="ai-recipe-test">
    <h1>AI菜谱生成测试</h1>
    
    <div class="test-controls">
      <h2>测试参数</h2>
      <div class="form-group">
        <label>食材（用逗号分隔）:</label>
        <input v-model="ingredients" placeholder="例如：鸡胸肉,西兰花,胡萝卜" />
      </div>
      
      <div class="form-group">
        <label>烹饪方法:</label>
        <select v-model="cookingMethod">
          <option v-for="method in cookingMethodsList" :key="method" :value="method">{{ method }}</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>烹饪时间（分钟）:</label>
        <input v-model.number="cookingTime" type="number" min="5" max="180" />
      </div>
      
      <div class="form-group">
        <label>难度:</label>
        <select v-model.number="difficulty">
          <option :value="1">简单</option>
          <option :value="2">中等</option>
          <option :value="3">困难</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>人数:</label>
        <input v-model.number="servings" type="number" min="1" max="10" />
      </div>
      
      <div class="button-group">
        <button @click="generateRecipe" :disabled="isLoading || isTestingAPI">
          {{ isLoading ? '生成中...' : '生成菜谱' }}
        </button>
        <button @click="testAPIConnection" :disabled="isTestingAPI || isLoading" class="test-api-btn">
          {{ isTestingAPI ? '测试中...' : '测试API连接' }}
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading">
      <p>正在生成菜谱，请稍候...</p>
      <div class="spinner"></div>
    </div>
    
    <div v-if="error" class="error">
      <h3>错误信息</h3>
      <p>{{ error }}</p>
    </div>
    
    <div v-if="apiTestResult" class="api-test-result">
      <h3>API测试结果</h3>
      <p>{{ apiTestResult }}</p>
    </div>
    
    <div v-if="recipe" class="recipe-result">
      <h2>生成的菜谱</h2>
      
      <div class="recipe-header">
        <h3>{{ recipe.name }}</h3>
        <p class="description">{{ recipe.description }}</p>
      </div>
      
      <div class="recipe-meta">
        <div class="meta-item">
          <strong>烹饪时间:</strong> {{ recipe.cookingTime }}分钟
        </div>
        <div class="meta-item">
          <strong>难度:</strong> {{ ['简单', '中等', '困难'][recipe.difficulty - 1] }}
        </div>
        <div class="meta-item">
          <strong>人数:</strong> {{ recipe.servings }}人份
        </div>
        <div class="meta-item">
          <strong>烹饪方法:</strong> {{ recipe.method.name }}
        </div>
      </div>
      
      <div class="recipe-ingredients">
        <h4>食材</h4>
        <ul>
          <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
            {{ ingredient.name }}: {{ ingredient.amount }} {{ ingredient.unit }}
          </li>
        </ul>
      </div>
      
      <div class="recipe-steps">
        <h4>烹饪步骤</h4>
        <div v-for="step in recipe.steps" :key="step.id" class="step">
          <h5>{{ step.title }}</h5>
          <p>{{ step.description }}</p>
          <p v-if="step.tips" class="tips">小贴士: {{ step.tips }}</p>
        </div>
      </div>
      
      <div class="recipe-nutrition">
        <h4>营养信息</h4>
        <ul>
          <li><strong>热量:</strong> {{ recipe.nutrition.calories }} 千卡</li>
          <li><strong>蛋白质:</strong> {{ recipe.nutrition.protein }}g</li>
          <li><strong>碳水化合物:</strong> {{ recipe.nutrition.carbs }}g</li>
          <li><strong>脂肪:</strong> {{ recipe.nutrition.fat }}g</li>
          <li><strong>膳食纤维:</strong> {{ recipe.nutrition.fiber }}g</li>
        </ul>
      </div>
      
      <div class="ai-info">
        <p><strong>AI生成:</strong> {{ recipe.aiGenerated ? '是' : '否' }}</p>
        <p><strong>创建时间:</strong> {{ formatDate(recipe.createdAt) }}</p>
      </div>
      
      <div v-if="recipe.originalGLMResponse" class="raw-response">
        <h4>原始AI响应</h4>
        <pre>{{ recipe.originalGLMResponse }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import recipeService from '@/services/recipeService'
import type { Recipe, RecipeGenerationRequest } from '@/types/recipe'
import { cookingMethods } from '@/data/cookingMethods'
import testGLMAPI from '@/services/testGLMAPI'

// 测试参数
const ingredients = ref('鸡胸肉,西兰花,胡萝卜')
const cookingMethod = ref('炒')
const cookingTime = ref(30)
const difficulty = ref(2)
const servings = ref(2)

// 状态
const isLoading = ref(false)
const isTestingAPI = ref(false)
const error = ref('')
const apiTestResult = ref('')
const recipe = ref<Recipe | null>(null)

// 计算属性
const cookingMethodsList = computed(() => {
  return cookingMethods.map(method => method.name)
})

// 生成菜谱
async function generateRecipe() {
  isLoading.value = true
  error.value = ''
  recipe.value = null
  
  try {
    const request: RecipeGenerationRequest = {
      ingredients: ingredients.value.split(',').map(i => i.trim()),
      cookingMethod: cookingMethod.value,
      cookingTime: cookingTime.value,
      difficulty: difficulty.value,
      servings: servings.value
    }
    
    recipe.value = await recipeService.generateRecipeByRequest(request)
    console.log('生成的菜谱:', recipe.value)
    
    if (!recipe.value) {
      error.value = '未能生成菜谱'
    }
  } catch (err) {
    console.error('生成菜谱出错:', err)
    error.value = err instanceof Error ? err.message : '生成菜谱时发生未知错误'
  } finally {
    isLoading.value = false
  }
}

// 测试API连接
async function testAPIConnection() {
  isTestingAPI.value = true
  error.value = ''
  apiTestResult.value = ''
  
  try {
    const result = await testGLMAPI()
    if (result.success) {
      apiTestResult.value = `API连接成功！响应: ${JSON.stringify(result.data?.choices?.[0]?.message?.content || '无内容')}`
    } else {
      error.value = `API连接失败: ${result.message}`
    }
  } catch (err) {
    console.error('测试API连接出错:', err)
    error.value = err instanceof Error ? err.message : '测试API连接时发生未知错误'
  } finally {
    isTestingAPI.value = false
  }
}

// 格式化日期
function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.ai-recipe-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.test-controls {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
}

button.test-api-btn {
  background-color: #2196F3;
}

button:disabled {
  background-color: #cccccc;
}

.loading {
  text-align: center;
  margin: 30px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4CAF50;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.api-test-result {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.recipe-result {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recipe-header {
  margin-bottom: 20px;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.meta-item {
  flex: 1;
  min-width: 120px;
}

.recipe-ingredients, .recipe-steps, .recipe-nutrition {
  margin-bottom: 25px;
}

.step {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.tips {
  font-style: italic;
  color: #666;
}

.ai-info {
  margin-top: 20px;
  font-size: 0.9em;
  color: #666;
}

.raw-response {
  margin-top: 30px;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>