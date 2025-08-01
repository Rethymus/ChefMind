<template>
  <div class="ingredient-selection">
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索食材..."
            class="search-input"
          />
          <button
            @click="startVoiceSearch"
            class="voice-search-btn"
            :class="{ 'listening': isListening }"
            :title="isListening ? '正在听取...' : '语音搜索'"
          >
            <el-icon v-if="!isListening"><Microphone /></el-icon>
            <el-icon v-else><Mute /></el-icon>
          </button>
        </div>
        <div class="category-filter">
          <button
            v-for="category in ingredientCategories"
            :key="category.id"
            @click="selectedCategory = selectedCategory === category.id ? null : category.id"
            class="category-btn"
            :class="{ active: selectedCategory === category.id }"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="ingredients-grid">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="category-section"
      >
        <h3 class="category-title">
          <span class="category-icon">{{ category.icon }}</span>
          {{ category.name }}
        </h3>
        
        <div class="ingredients-list">
          <!-- 显示前14个食材 -->
          <div
            v-for="ingredient in getDisplayIngredients(category)"
            :key="ingredient.id"
            @click="toggleIngredient(ingredient)"
            class="ingredient-item"
            :class="{ 
              selected: isSelected(ingredient),
              'fade-in': true
            }"
          >
            <span class="ingredient-icon">{{ ingredient.icon || '🥬' }}</span>
            <span class="ingredient-name">{{ ingredient.name }}</span>
            <el-icon 
              v-if="isSelected(ingredient)" 
              class="selected-icon"
            ><Check /></el-icon>
          </div>
          
          <!-- 更多按钮 -->
          <div
            v-if="category.items.length > 14"
            @click="showMore(category)"
            class="ingredient-item more-btn"
          >
            <span class="ingredient-icon">➕</span>
            <span class="ingredient-name">更多 ></span>
            <span class="more-count">({{ category.items.length - 14 }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选择的食材 -->
    <div v-if="props.selectedIngredients.length > 0" class="selected-ingredients">
      <h3 class="selected-title">
        <el-icon><CircleCheck /></el-icon>
        已选择的食材 ({{ props.selectedIngredients.length }})
      </h3>
      <div class="selected-list">
        <div
          v-for="ingredient in props.selectedIngredients"
          :key="ingredient.id"
          @click="toggleIngredient(ingredient)"
          class="selected-item"
        >
          <span class="ingredient-icon">{{ ingredient.icon || '🥬' }}</span>
          <span class="ingredient-name">{{ ingredient.name }}</span>
          <el-icon class="remove-icon"><Close /></el-icon>
        </div>
      </div>
    </div>

    <!-- 更多食材弹窗 -->
    <div v-if="showMoreModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <span class="category-icon">{{ currentMoreCategory?.icon }}</span>
            {{ currentMoreCategory?.name }} - 全部食材
          </h3>
          <button @click="closeModal" class="close-btn">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        
        <div class="modal-search">
          <input
            v-model="modalSearchQuery"
            type="text"
            placeholder="在当前分类中搜索..."
            class="modal-search-input"
          />
        </div>
        
        <div class="modal-ingredients">
          <div
            v-for="ingredient in filteredModalIngredients"
            :key="ingredient.id"
            @click="toggleIngredient(ingredient)"
            class="modal-ingredient-item"
            :class="{ selected: isSelected(ingredient) }"
          >
            <span class="ingredient-icon">{{ ingredient.icon || '🥬' }}</span>
            <span class="ingredient-name">{{ ingredient.name }}</span>
            <el-icon 
              v-if="isSelected(ingredient)" 
              class="selected-icon"
            ><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ingredient, IngredientCategory } from '@/types/recipe'
import { ingredientCategories } from '@/data/mockData'
import { Microphone, Mute, Check, CircleCheck, Close } from '@element-plus/icons-vue'

// Props
interface Props {
  selectedIngredients: Ingredient[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'ingredient-toggle': [ingredient: Ingredient]
}>()

// 响应式数据
const searchQuery = ref('')
const showMoreModal = ref(false)
const selectedCategory = ref<string | null>(null)
const currentMoreCategory = ref<IngredientCategory | null>(null)
const modalSearchQuery = ref('')
const isListening = ref(false)

// 计算属性
const filteredCategories = computed(() => {
  let categories = ingredientCategories

  // 按分类筛选
  if (selectedCategory.value) {
    categories = categories.filter(cat => cat.id === selectedCategory.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    categories = categories.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(query)
      )
    })).filter(category => category.items.length > 0)
  }

  return categories
})

const filteredModalIngredients = computed(() => {
  if (!currentMoreCategory.value) return []
  
  let ingredients = currentMoreCategory.value.items
  
  if (modalSearchQuery.value.trim()) {
    const query = modalSearchQuery.value.toLowerCase().trim()
    ingredients = ingredients.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }
  
  return ingredients
})

// 方法
const getDisplayIngredients = (category: IngredientCategory) => {
  return category.items.slice(0, 14)
}

const isSelected = (ingredient: Ingredient) => {
  return props.selectedIngredients.some(item => item.id === ingredient.id)
}

const toggleIngredient = (ingredient: Ingredient) => {
  emit('ingredient-toggle', ingredient)
}

const showMore = (category: IngredientCategory) => {
  currentMoreCategory.value = category
  modalSearchQuery.value = ''
  showMoreModal.value = true
}

const closeModal = () => {
  showMoreModal.value = false
  currentMoreCategory.value = null
  modalSearchQuery.value = ''
}

// 语音搜索功能
const startVoiceSearch = () => {
  // 检查浏览器支持
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('您的浏览器不支持语音识别功能')
    return
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
  
  if (!SpeechRecognition) {
    alert('语音识别功能不可用')
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    searchQuery.value = transcript
    isListening.value = false
  }

  recognition.onerror = (event: any) => {
    console.error('语音识别错误:', event.error)
    isListening.value = false
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}

// 监听搜索查询变化
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    selectedCategory.value = null // 清除分类筛选
  }
})
</script>

<style scoped>
.ingredient-selection {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 24px;
}

.search-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 50px 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.voice-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.voice-search-btn:hover {
  background: #0056b3;
}

.voice-search-btn.listening {
  background: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.1); }
  100% { transform: translateY(-50%) scale(1); }
}

.category-filter {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.category-btn:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.category-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.category-icon {
  font-size: 16px;
}

.ingredients-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.ingredients-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.ingredient-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 80px;
  justify-content: center;
}

.ingredient-item:hover {
  background: #e9ecef;
  border-color: #007bff;
  transform: translateY(-2px);
}

.ingredient-item.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.ingredient-item.more-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-color: #28a745;
}

.ingredient-item.more-btn:hover {
  background: linear-gradient(135deg, #218838, #1ea080);
  transform: translateY(-2px);
}

.ingredient-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.ingredient-name {
  font-size: 12px;
  text-align: center;
  font-weight: 500;
}

.more-count {
  font-size: 10px;
  opacity: 0.8;
}

.selected-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}

.selected-ingredients {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  color: #28a745;
  font-size: 16px;
  font-weight: 600;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.selected-item:hover {
  background: #218838;
}

.remove-icon {
  font-size: 12px;
  margin-left: 4px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
}

.close-btn:hover {
  color: #333;
}

.modal-search {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-search-input {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
}

.modal-search-input:focus {
  outline: none;
  border-color: #007bff;
}

.modal-ingredients {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.modal-ingredient-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 80px;
  justify-content: center;
}

.modal-ingredient-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.modal-ingredient-item.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ingredient-selection {
    padding: 16px;
  }
  
  .ingredients-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .ingredient-item {
    min-height: 70px;
    padding: 8px 4px;
  }
  
  .ingredient-icon {
    font-size: 20px;
  }
  
  .ingredient-name {
    font-size: 11px;
  }
  
  .modal-ingredients {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>