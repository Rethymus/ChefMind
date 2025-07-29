<template>
  <div class="ingredient-selection">
    <div class="step-header">
      <h2>选择食材</h2>
      <p>挑选你喜欢的食材，AI将为你推荐最佳搭配</p>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索食材..."
        size="large"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <!-- 已选食材标签 -->
    <div class="selected-section">
      <h3>
        <el-icon><Collection /></el-icon>
        已选食材 ({{ selectedIngredients.length }})
      </h3>
      <div class="ingredient-tags">
        <el-tag
          v-for="ingredient in selectedIngredients"
          :key="ingredient.id"
          type="danger"
          size="large"
          closable
          effect="dark"
          @close="handleRemoveIngredient(ingredient)"
        >
          {{ ingredient.name }}
        </el-tag>
        <div v-if="selectedIngredients.length === 0" class="empty-state">
          <el-icon><Plus /></el-icon>
          <span>请选择食材</span>
        </div>
      </div>
    </div>
    
    <!-- AI搭配建议 -->
    <div v-if="suggestions.length > 0" class="suggestions-section">
      <h3>
        <el-icon><Lightbulb /></el-icon>
        AI推荐搭配
      </h3>
      <div class="suggestion-tags">
        <el-tag
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          type="success"
          size="medium"
          @click="handleAddSuggestion(suggestion)"
          style="cursor: pointer;"
        >
          <el-icon><Plus /></el-icon>
          {{ suggestion.name }}
        </el-tag>
      </div>
    </div>
    
    <!-- 食材分类 -->
    <div class="categories-section">
      <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
        <el-tab-pane
          v-for="category in categories"
          :key="category.key"
          :label="category.label"
          :name="category.key"
        >
          <template #label>
            <span class="category-label">
              <el-icon>
                <component :is="category.icon" />
              </el-icon>
              {{ category.label }}
            </span>
          </template>
          
          <div class="ingredient-grid">
            <div
              v-for="ingredient in filteredIngredients[category.key]"
              :key="ingredient.id"
              class="ingredient-item"
              :class="{ selected: isSelected(ingredient) }"
              @click="handleToggleIngredient(ingredient)"
            >
              <div class="ingredient-content">
                <span class="ingredient-name">{{ ingredient.name }}</span>
                <el-icon v-if="isSelected(ingredient)" class="selected-icon">
                  <Check />
                </el-icon>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ingredients } from '@/data/mockData'
import type { Ingredient } from '@/types/recipe'
import {
  Search,
  Collection,
  Plus,
  Lightbulb,
  Check,
  Apple,
  Chicken,
  Fish,
  Bowl,
  Coffee
} from '@element-plus/icons-vue'

interface Props {
  selectedIngredients: Ingredient[]
}

interface Emits {
  (e: 'ingredient-toggle', ingredient: Ingredient): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const activeCategory = ref('vegetables')
const suggestions = ref<Ingredient[]>([])

// 食材分类配置
const categories = [
  { key: 'vegetables', label: '蔬菜', icon: Apple },
  { key: 'meat', label: '肉类', icon: Chicken },
  { key: 'seafood', label: '海鲜', icon: Fish },
  { key: 'staple', label: '主食', icon: Bowl },
  { key: 'seasoning', label: '调料', icon: Coffee }
]

// 按分类过滤的食材
const filteredIngredients = computed(() => {
  const result: Record<string, Ingredient[]> = {}
  
  categories.forEach(category => {
    result[category.key] = ingredients
      .filter(ingredient => ingredient.category === category.key)
      .filter(ingredient => 
        searchQuery.value === '' || 
        ingredient.name.includes(searchQuery.value)
      )
  })
  
  return result
})

// 检查食材是否已选择
const isSelected = (ingredient: Ingredient): boolean => {
  return props.selectedIngredients.some(item => item.id === ingredient.id)
}

// 处理食材切换
const handleToggleIngredient = (ingredient: Ingredient) => {
  emit('ingredient-toggle', ingredient)
}

// 处理移除食材
const handleRemoveIngredient = (ingredient: Ingredient) => {
  emit('ingredient-toggle', ingredient)
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 处理分类切换
const handleCategoryChange = () => {
  // 分类切换逻辑
}

// 处理添加建议食材
const handleAddSuggestion = (ingredient: Ingredient) => {
  if (!isSelected(ingredient)) {
    emit('ingredient-toggle', ingredient)
  }
}

// 生成AI搭配建议
const generateSuggestions = () => {
  if (props.selectedIngredients.length === 0) {
    suggestions.value = []
    return
  }
  
  // 简单的搭配建议逻辑
  const allIngredients = ingredients.filter(ingredient => 
    !isSelected(ingredient)
  )
  
  // 根据已选食材推荐相关食材
  const recommendedIngredients: Ingredient[] = []
  
  // 如果选择了蔬菜，推荐肉类和调料
  if (props.selectedIngredients.some(item => item.category === 'vegetables')) {
    recommendedIngredients.push(
      ...allIngredients.filter(item => 
        item.category === 'meat' || item.category === 'seasoning'
      ).slice(0, 3)
    )
  }
  
  // 如果选择了肉类，推荐蔬菜和调料
  if (props.selectedIngredients.some(item => item.category === 'meat')) {
    recommendedIngredients.push(
      ...allIngredients.filter(item => 
        item.category === 'vegetables' || item.category === 'seasoning'
      ).slice(0, 3)
    )
  }
  
  // 去重并限制数量
  suggestions.value = Array.from(
    new Map(recommendedIngredients.map(item => [item.id, item])).values()
  ).slice(0, 5)
}

// 监听已选食材变化，生成建议
watch(
  () => props.selectedIngredients,
  () => {
    generateSuggestions()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.ingredient-selection {
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
  }
  
  .selected-section {
    margin-bottom: 2rem;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.2rem;
    }
    
    .ingredient-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      min-height: 50px;
      padding: 1rem;
      border: 2px dashed #ddd;
      border-radius: 10px;
      background: #f9f9f9;
      align-items: center;
      
      .empty-state {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #999;
        font-style: italic;
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  .suggestions-section {
    margin-bottom: 2rem;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.1rem;
    }
    
    .suggestion-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
  
  .categories-section {
    .category-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .ingredient-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .ingredient-item {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      
      &:hover {
        border-color: #ff6b6b;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.2);
      }
      
      &.selected {
        background: #ff6b6b;
        color: white;
        border-color: #ff6b6b;
        
        .selected-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 1.2rem;
        }
      }
      
      .ingredient-content {
        text-align: center;
        
        .ingredient-name {
          font-weight: 500;
          font-size: 0.9rem;
        }
      }
    }
  }
}

// 暗色主题
:global(.dark) .ingredient-selection {
  .step-header {
    h2 {
      color: #f9fafb;
    }
    
    p {
      color: #d1d5db;
    }
  }
  
  .selected-section,
  .suggestions-section {
    h3 {
      color: #f9fafb;
    }
    
    .ingredient-tags {
      background: #374151;
      border-color: #4b5563;
      
      .empty-state {
        color: #9ca3af;
      }
    }
  }
  
  .ingredient-item {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
    
    &:hover {
      border-color: #ff6b6b;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ingredient-selection {
    .ingredient-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.8rem;
    }
    
    .ingredient-item {
      padding: 0.8rem;
      
      .ingredient-name {
        font-size: 0.85rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .ingredient-selection {
    .step-header {
      h2 {
        font-size: 1.5rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
    
    .ingredient-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 0.6rem;
    }
    
    .ingredient-item {
      padding: 0.6rem;
      
      .ingredient-name {
        font-size: 0.8rem;
      }
    }
  }
}
</style>