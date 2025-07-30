<template>
  <div class="ingredient-selection">
    <div class="step-header">
      <h2>选择您的食材</h2>
      <p>选择您喜欢的食材，我们将为您推荐最佳搭配</p>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索食材名称..."
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 语音搜索按钮 -->
      <button 
        class="voice-search-btn"
        @click="startVoiceSearch"
        :class="{ 'listening': isListening }"
        :title="isListening ? '正在听取...' : '语音搜索'"
      >
        <i class="fas fa-microphone" v-if="!isListening"></i>
        <i class="fas fa-microphone-slash" v-else></i>
      </button>
    </div>
    
    <!-- 已选食材 -->
    <div class="selected-section" v-if="selectedIngredients.length > 0">
      <h3>已选食材：</h3>
      <div class="selected-tags">
        <el-tag
          v-for="ingredient in selectedIngredients"
          :key="ingredient.id"
          type="danger"
          closable
          @close="removeIngredient(ingredient)"
        >
          {{ ingredient.name }}
        </el-tag>
      </div>
    </div>
    
    <!-- 食材分类 -->
    <div class="categories-section">
      <div 
        v-for="category in filteredCategories" 
        :key="category.id"
        class="category-section"
      >
        <div class="category-header">
          <span class="category-icon">{{ category.icon }}</span>
          <h3 class="category-title">{{ category.name }}</h3>
        </div>
        
        <div class="ingredient-grid">
          <!-- 显示的食材（最多14个） -->
          <div
            v-for="ingredient in getDisplayItems(category)"
            :key="ingredient.id"
            class="ingredient-item"
            :class="{ 'selected': isSelected(ingredient.id) }"
            @click="toggleIngredient(ingredient)"
          >
            {{ ingredient.name }}
          </div>
          
          <!-- 更多按钮 -->
          <div
            v-if="hasMoreItems(category)"
            class="more-button"
            @click="showMoreDialog(category)"
          >
            更多 >
          </div>
        </div>
      </div>
    </div>
    
    <!-- 智能推荐组件 -->
    <SmartRecommendation 
      :selected-ingredients="selectedIngredients"
      @ingredient-toggle="toggleIngredient"
    />
    
    <!-- 更多食材弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`选择${currentCategory?.name || ''}`"
      width="70%"
      destroy-on-close
    >
      <div class="dialog-content">
        <el-input
          v-model="dialogSearch"
          placeholder="搜索食材..."
          clearable
          style="margin-bottom: 20px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="dialog-grid">
          <div
            v-for="ingredient in getDialogItems()"
            :key="ingredient.id"
            class="dialog-item"
            :class="{ 'selected': isSelected(ingredient.id) }"
            @click="toggleIngredient(ingredient)"
          >
            {{ ingredient.name }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确定 (已选{{ selectedIngredients.length }}个)
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ingredientCategories } from '@/data/mockData'
import type { Ingredient } from '@/types/recipe'
import { Search } from '@element-plus/icons-vue'

// Props
interface Props {
  selectedIngredients: Ingredient[]
}

// Emits
interface Emits {
  (e: 'ingredient-toggle', ingredient: Ingredient): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const searchQuery = ref('')
const dialogVisible = ref(false)
const currentCategory = ref<any>(null)
const dialogSearch = ref('')

// 过滤后的分类
const filteredCategories = computed(() => {
  if (!searchQuery.value) return ingredientCategories
  
  return ingredientCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.includes(searchQuery.value)
    )
  })).filter(category => category.items.length > 0)
})

// 获取显示的食材（最多14个）
const getDisplayItems = (category: any) => {
  if (category.id === 'vegetables') {
    // 蔬菜类显示前14个
    return category.items.slice(0, 14)
  }
  // 其他类别显示所有
  return category.items
}

// 检查是否有更多食材
const hasMoreItems = (category: any) => {
  if (category.id === 'vegetables') {
    return category.items.length > 14
  }
  return false
}

// 检查食材是否已选择
const isSelected = (ingredientId: number): boolean => {
  return props.selectedIngredients.some(item => item.id === ingredientId)
}

// 切换食材选择
const toggleIngredient = (ingredient: Ingredient) => {
  emit('ingredient-toggle', ingredient)
}

// 移除食材
const removeIngredient = (ingredient: Ingredient) => {
  emit('ingredient-toggle', ingredient)
}

// 显示更多弹窗
const showMoreDialog = (category: any) => {
  currentCategory.value = category
  dialogSearch.value = ''
  dialogVisible.value = true
}

// 获取弹窗中的食材
const getDialogItems = () => {
  if (!currentCategory.value) return []
  
  const items = currentCategory.value.items
  if (!dialogSearch.value) return items
  
  return items.filter((item: Ingredient) => 
    item.name.includes(dialogSearch.value)
  )
}

// 语音搜索功能
const startVoiceSearch = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('您的浏览器不支持语音识别功能')
    return
  }

  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
  const recognition = new SpeechRecognition()
  
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    searchQuery.value = transcript
    isListening.value = false
  }

  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error)
    isListening.value = false
    if (event.error === 'not-allowed') {
      alert('请允许麦克风权限以使用语音搜索功能')
    }
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}
</script>

<style lang="scss" scoped>
.ingredient-selection {
  padding: 2rem;
  
  .step-header {
    text-align: center;
    margin-bottom: 2rem;
    
    h2 {
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: #666;
      font-size: 1.1rem;
    }
  }
  
  .search-section {
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .voice-search-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    &.listening {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      animation: pulse 1.5s infinite;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
    }
  }
  
  .selected-section {
    margin-bottom: 2rem;
    
    h3 {
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    
    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
  
  .categories-section {
    .category-section {
      margin-bottom: 3rem;
      
      .category-header {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-bottom: 1.5rem;
        
        .category-icon {
          font-size: 1.5rem;
        }
        
        .category-title {
          font-size: 1.3rem;
          color: #2c3e50;
          margin: 0;
        }
      }
      
      .ingredient-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1rem;
        
        .ingredient-item,
        .more-button {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          font-weight: 500;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &:hover {
            border-color: #ff6b6b;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.2);
          }
          
          &.selected {
            background: #ff6b6b;
            color: white;
            border-color: #ff6b6b;
          }
        }
        
        .more-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }
  
  .dialog-content {
    .dialog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      max-height: 400px;
      overflow-y: auto;
      
      .dialog-item {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        font-weight: 500;
        
        &:hover {
          border-color: #ff6b6b;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.2);
        }
        
        &.selected {
          background: #ff6b6b;
          color: white;
          border-color: #ff6b6b;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .ingredient-selection .categories-section .category-section .ingredient-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 992px) {
  .ingredient-selection .categories-section .category-section .ingredient-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 768px) {
  .ingredient-selection .categories-section .category-section .ingredient-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
  }
}

@media (max-width: 480px) {
  .ingredient-selection .categories-section .category-section .ingredient-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }
}

// 暗色主题
:global(.dark) .ingredient-selection {
  .step-header {
    h2, p {
      color: #f9fafb;
    }
  }
  
  .selected-section h3 {
    color: #f9fafb;
  }
  
  .category-header .category-title {
    color: #f9fafb;
  }
  
  .ingredient-item,
  .dialog-item {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
}
</style>