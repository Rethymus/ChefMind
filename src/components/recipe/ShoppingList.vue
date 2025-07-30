<template>
  <div class="shopping-list">
    <div class="shopping-header">
      <h3>
        <i class="fas fa-shopping-cart"></i>
        智能购物清单
      </h3>
      <div class="header-actions">
        <button 
          class="generate-btn"
          @click="generateFromRecipes"
          :disabled="!hasSelectedRecipes"
        >
          <i class="fas fa-magic"></i>
          从菜谱生成
        </button>
        <button 
          class="add-item-btn"
          @click="showAddItemModal = true"
        >
          <i class="fas fa-plus"></i>
          手动添加
        </button>
      </div>
    </div>

    <!-- 购物清单统计 -->
    <div class="shopping-stats" v-if="shoppingItems.length > 0">
      <div class="stat-card">
        <div class="stat-number">{{ totalItems }}</div>
        <div class="stat-label">总商品数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ completedItems }}</div>
        <div class="stat-label">已购买</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ estimatedCost }}元</div>
        <div class="stat-label">预估费用</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ Math.round(completionRate) }}%</div>
        <div class="stat-label">完成度</div>
      </div>
    </div>

    <!-- 购物清单内容 -->
    <div class="shopping-content" v-if="shoppingItems.length > 0">
      <!-- 分类筛选 -->
      <div class="category-filter">
        <button 
          v-for="category in categories"
          :key="category.id"
          class="filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
          <span class="count">({{ getCategoryCount(category.id) }})</span>
        </button>
      </div>

      <!-- 购物清单列表 -->
      <div class="shopping-list-content">
        <div 
          v-for="category in filteredCategories"
          :key="category.id"
          class="category-section"
          v-show="getCategoryItems(category.id).length > 0"
        >
          <div class="category-header">
            <h4>
              <i :class="category.icon"></i>
              {{ category.name }}
            </h4>
            <div class="category-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: getCategoryProgress(category.id) + '%' }"
                ></div>
              </div>
              <span class="progress-text">
                {{ getCategoryCompletedCount(category.id) }}/{{ getCategoryCount(category.id) }}
              </span>
            </div>
          </div>

          <div class="items-grid">
            <div 
              v-for="item in getCategoryItems(category.id)"
              :key="item.id"
              class="shopping-item"
              :class="{ completed: item.completed, urgent: item.urgent }"
            >
              <div class="item-checkbox">
                <input 
                  type="checkbox"
                  :id="'item-' + item.id"
                  v-model="item.completed"
                  @change="updateItem(item)"
                >
                <label :for="'item-' + item.id" class="checkbox-label">
                  <i class="fas fa-check"></i>
                </label>
              </div>

              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-details">
                  <span class="quantity">{{ item.quantity }} {{ item.unit }}</span>
                  <span class="price" v-if="item.estimatedPrice">
                    ¥{{ item.estimatedPrice }}
                  </span>
                  <span class="urgent-tag" v-if="item.urgent">
                    <i class="fas fa-exclamation"></i>
                    急需
                  </span>
                </div>
                <div class="item-note" v-if="item.note">
                  <i class="fas fa-sticky-note"></i>
                  {{ item.note }}
                </div>
              </div>

              <div class="item-actions">
                <button 
                  class="action-btn edit"
                  @click="editItem(item)"
                  title="编辑"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn urgent"
                  @click="toggleUrgent(item)"
                  :title="item.urgent ? '取消急需' : '标记急需'"
                >
                  <i class="fas fa-exclamation"></i>
                </button>
                <button 
                  class="action-btn delete"
                  @click="removeItem(item.id)"
                  title="删除"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="shopping-actions">
        <button 
          class="action-button clear-completed"
          @click="clearCompleted"
          v-if="completedItems > 0"
        >
          <i class="fas fa-broom"></i>
          清除已购买
        </button>
        <button 
          class="action-button export"
          @click="exportList"
        >
          <i class="fas fa-download"></i>
          导出清单
        </button>
        <button 
          class="action-button share"
          @click="shareList"
        >
          <i class="fas fa-share"></i>
          分享清单
        </button>
        <button 
          class="action-button clear-all"
          @click="clearAll"
        >
          <i class="fas fa-trash-alt"></i>
          清空清单
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">
        <i class="fas fa-shopping-cart"></i>
      </div>
      <h3>购物清单为空</h3>
      <p>您可以从菜谱自动生成购物清单，或手动添加商品</p>
      <div class="empty-actions">
        <button 
          class="btn btn-primary"
          @click="generateFromRecipes"
          :disabled="!hasSelectedRecipes"
        >
          <i class="fas fa-magic"></i>
          从菜谱生成
        </button>
        <button 
          class="btn btn-secondary"
          @click="showAddItemModal = true"
        >
          <i class="fas fa-plus"></i>
          手动添加
        </button>
      </div>
    </div>

    <!-- 添加/编辑商品模态框 -->
    <div class="modal" v-if="showAddItemModal || editingItem" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingItem ? '编辑商品' : '添加商品' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>商品名称</label>
            <input 
              type="text" 
              v-model="itemForm.name"
              class="form-input"
              placeholder="例如：西红柿、鸡蛋"
            >
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>数量</label>
              <input 
                type="number" 
                v-model="itemForm.quantity"
                class="form-input"
                min="0"
                step="0.1"
              >
            </div>
            <div class="form-group">
              <label>单位</label>
              <select v-model="itemForm.unit" class="form-select">
                <option value="个">个</option>
                <option value="斤">斤</option>
                <option value="克">克</option>
                <option value="千克">千克</option>
                <option value="升">升</option>
                <option value="毫升">毫升</option>
                <option value="包">包</option>
                <option value="瓶">瓶</option>
                <option value="袋">袋</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="itemForm.category" class="form-select">
              <option v-for="cat in categories.slice(1)" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>预估价格 (可选)</label>
            <input 
              type="number" 
              v-model="itemForm.estimatedPrice"
              class="form-input"
              min="0"
              step="0.1"
              placeholder="0.00"
            >
          </div>
          <div class="form-group">
            <label>备注 (可选)</label>
            <input 
              type="text" 
              v-model="itemForm.note"
              class="form-input"
              placeholder="例如：要新鲜的、选大个的"
            >
          </div>
          <div class="form-group">
            <label class="checkbox-group">
              <input type="checkbox" v-model="itemForm.urgent">
              <span class="checkmark"></span>
              标记为急需商品
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveItem">
            {{ editingItem ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipe'

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  completed: boolean
  urgent: boolean
  estimatedPrice?: number
  note?: string
  fromRecipe?: string
}

interface Category {
  id: string
  name: string
  icon: string
}

// 响应式数据
const recipeStore = useRecipeStore()
const shoppingItems = ref<ShoppingItem[]>([])
const selectedCategory = ref('all')
const showAddItemModal = ref(false)
const editingItem = ref<ShoppingItem | null>(null)

// 表单数据
const itemForm = ref({
  name: '',
  quantity: 1,
  unit: '个',
  category: 'vegetables',
  estimatedPrice: 0,
  note: '',
  urgent: false
})

// 分类配置
const categories: Category[] = [
  { id: 'all', name: '全部', icon: 'fas fa-list' },
  { id: 'vegetables', name: '蔬菜类', icon: 'fas fa-carrot' },
  { id: 'meat', name: '肉类', icon: 'fas fa-drumstick-bite' },
  { id: 'seafood', name: '海鲜类', icon: 'fas fa-fish' },
  { id: 'dairy', name: '乳制品', icon: 'fas fa-cheese' },
  { id: 'grains', name: '谷物类', icon: 'fas fa-wheat' },
  { id: 'seasonings', name: '调料类', icon: 'fas fa-pepper-hot' },
  { id: 'utensils', name: '厨具类', icon: 'fas fa-utensils' },
  { id: 'others', name: '其他', icon: 'fas fa-ellipsis-h' }
]

// 计算属性
const totalItems = computed(() => shoppingItems.value.length)
const completedItems = computed(() => shoppingItems.value.filter(item => item.completed).length)
const completionRate = computed(() => 
  totalItems.value > 0 ? (completedItems.value / totalItems.value) * 100 : 0
)
const estimatedCost = computed(() => 
  shoppingItems.value.reduce((total, item) => total + (item.estimatedPrice || 0), 0).toFixed(2)
)

const hasSelectedRecipes = computed(() => 
  recipeStore.generatedRecipes && recipeStore.generatedRecipes.length > 0
)

const filteredCategories = computed(() => 
  selectedCategory.value === 'all' ? categories.slice(1) : categories.filter(cat => cat.id === selectedCategory.value)
)

// 方法
const getCategoryCount = (categoryId: string): number => {
  if (categoryId === 'all') return totalItems.value
  return shoppingItems.value.filter(item => item.category === categoryId).length
}

const getCategoryItems = (categoryId: string): ShoppingItem[] => {
  return shoppingItems.value.filter(item => item.category === categoryId)
}

const getCategoryProgress = (categoryId: string): number => {
  const items = getCategoryItems(categoryId)
  if (items.length === 0) return 0
  const completed = items.filter(item => item.completed).length
  return (completed / items.length) * 100
}

const getCategoryCompletedCount = (categoryId: string): number => {
  return getCategoryItems(categoryId).filter(item => item.completed).length
}

// 从菜谱生成购物清单
const generateFromRecipes = () => {
  if (!recipeStore.generatedRecipes || recipeStore.generatedRecipes.length === 0) {
    alert('请先生成一些菜谱')
    return
  }

  // 清空现有清单
  shoppingItems.value = []

  // 从菜谱中提取食材
  recipeStore.generatedRecipes.forEach(recipe => {
    if (recipe.ingredients) {
      recipe.ingredients.forEach(ingredient => {
        // 检查是否已存在相同食材
        const existingItem = shoppingItems.value.find(item => 
          item.name === ingredient.name && item.category === getCategoryByIngredient(ingredient.name)
        )

        if (existingItem) {
          // 累加数量
          existingItem.quantity += parseFloat(ingredient.amount) || 1
        } else {
          // 添加新食材
          const newItem: ShoppingItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: ingredient.name,
            quantity: parseFloat(ingredient.amount) || 1,
            unit: ingredient.unit || '个',
            category: getCategoryByIngredient(ingredient.name),
            completed: false,
            urgent: false,
            estimatedPrice: getEstimatedPrice(ingredient.name),
            fromRecipe: recipe.title
          }
          shoppingItems.value.push(newItem)
        }
      })
    }
  })

  saveToStorage()
  alert(`成功生成购物清单，共 ${shoppingItems.value.length} 项商品`)
}

// 根据食材名称获取分类
const getCategoryByIngredient = (name: string): string => {
  const vegetableKeywords = ['白菜', '萝卜', '土豆', '西红柿', '黄瓜', '茄子', '豆角', '青椒', '洋葱', '胡萝卜', '芹菜', '韭菜', '菠菜', '生菜']
  const meatKeywords = ['猪肉', '牛肉', '鸡肉', '鸭肉', '羊肉', '肉']
  const seafoodKeywords = ['鱼', '虾', '蟹', '贝', '海']
  const seasoningKeywords = ['盐', '糖', '醋', '酱油', '料酒', '油', '葱', '姜', '蒜']

  if (vegetableKeywords.some(keyword => name.includes(keyword))) return 'vegetables'
  if (meatKeywords.some(keyword => name.includes(keyword))) return 'meat'
  if (seafoodKeywords.some(keyword => name.includes(keyword))) return 'seafood'
  if (seasoningKeywords.some(keyword => name.includes(keyword))) return 'seasonings'
  
  return 'others'
}

// 获取预估价格
const getEstimatedPrice = (name: string): number => {
  const priceMap: { [key: string]: number } = {
    '白菜': 3.5, '萝卜': 2.8, '土豆': 4.2, '西红柿': 6.8, '黄瓜': 5.5,
    '茄子': 4.8, '豆角': 8.5, '青椒': 7.2, '洋葱': 3.8, '胡萝卜': 4.5,
    '猪肉': 28.0, '牛肉': 45.0, '鸡肉': 18.0, '鸭肉': 22.0,
    '鱼': 25.0, '虾': 35.0, '蟹': 50.0,
    '盐': 2.5, '糖': 4.0, '醋': 6.0, '酱油': 8.0, '料酒': 12.0
  }

  for (const [key, price] of Object.entries(priceMap)) {
    if (name.includes(key)) return price
  }
  
  return 0
}

// 添加商品
const addItem = () => {
  if (!itemForm.value.name.trim()) {
    alert('请输入商品名称')
    return
  }

  const newItem: ShoppingItem = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: itemForm.value.name.trim(),
    quantity: itemForm.value.quantity,
    unit: itemForm.value.unit,
    category: itemForm.value.category,
    completed: false,
    urgent: itemForm.value.urgent,
    estimatedPrice: itemForm.value.estimatedPrice || undefined,
    note: itemForm.value.note.trim() || undefined
  }

  shoppingItems.value.push(newItem)
  saveToStorage()
  closeModal()
}

// 编辑商品
const editItem = (item: ShoppingItem) => {
  editingItem.value = item
  itemForm.value = {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    estimatedPrice: item.estimatedPrice || 0,
    note: item.note || '',
    urgent: item.urgent
  }
}

// 保存商品
const saveItem = () => {
  if (editingItem.value) {
    // 更新现有商品
    Object.assign(editingItem.value, {
      name: itemForm.value.name.trim(),
      quantity: itemForm.value.quantity,
      unit: itemForm.value.unit,
      category: itemForm.value.category,
      estimatedPrice: itemForm.value.estimatedPrice || undefined,
      note: itemForm.value.note.trim() || undefined,
      urgent: itemForm.value.urgent
    })
    saveToStorage()
    closeModal()
  } else {
    // 添加新商品
    addItem()
  }
}

// 更新商品
const updateItem = (item: ShoppingItem) => {
  saveToStorage()
}

// 切换急需状态
const toggleUrgent = (item: ShoppingItem) => {
  item.urgent = !item.urgent
  saveToStorage()
}

// 删除商品
const removeItem = (itemId: string) => {
  if (confirm('确定要删除这个商品吗？')) {
    const index = shoppingItems.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      shoppingItems.value.splice(index, 1)
      saveToStorage()
    }
  }
}

// 清除已购买商品
const clearCompleted = () => {
  if (confirm('确定要清除所有已购买的商品吗？')) {
    shoppingItems.value = shoppingItems.value.filter(item => !item.completed)
    saveToStorage()
  }
}

// 清空所有商品
const clearAll = () => {
  if (confirm('确定要清空整个购物清单吗？此操作不可恢复。')) {
    shoppingItems.value = []
    saveToStorage()
  }
}

// 导出清单
const exportList = () => {
  const content = shoppingItems.value.map(item => 
    `${item.completed ? '✓' : '○'} ${item.name} - ${item.quantity}${item.unit}${item.note ? ` (${item.note})` : ''}`
  ).join('\n')
  
  const blob = new Blob([`ChefMind 购物清单\n生成时间：${new Date().toLocaleString()}\n\n${content}`], 
    { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `购物清单_${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 分享清单
const shareList = () => {
  const content = `ChefMind 购物清单 (${totalItems.value}项商品)\n` +
    shoppingItems.value.map(item => 
      `${item.completed ? '✓' : '○'} ${item.name} - ${item.quantity}${item.unit}`
    ).join('\n')

  if (navigator.share) {
    navigator.share({
      title: 'ChefMind 购物清单',
      text: content
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(content).then(() => {
      alert('购物清单已复制到剪贴板')
    }).catch(() => {
      alert('分享失败，请手动复制清单内容')
    })
  }
}

// 关闭模态框
const closeModal = () => {
  showAddItemModal.value = false
  editingItem.value = null
  itemForm.value = {
    name: '',
    quantity: 1,
    unit: '个',
    category: 'vegetables',
    estimatedPrice: 0,
    note: '',
    urgent: false
  }
}

// 保存到本地存储
const saveToStorage = () => {
  localStorage.setItem('chefmind-shopping-list', JSON.stringify(shoppingItems.value))
}

// 从本地存储加载
const loadFromStorage = () => {
  const saved = localStorage.getItem('chefmind-shopping-list')
  if (saved) {
    try {
      shoppingItems.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载购物清单失败:', error)
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadFromStorage()
})
</script>

<style lang="scss" scoped>
.shopping-list {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  .shopping-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0;
      
      i {
        color: #4ecdc4;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 1rem;
      
      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.generate-btn {
          background: #4ecdc4;
          color: white;
          
          &:hover:not(:disabled) {
            background: #45b7aa;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
          }
          
          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        }
        
        &.add-item-btn {
          background: #ff6b6b;
          color: white;
          
          &:hover {
            background: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
          }
        }
      }
    }
  }
  
  .shopping-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 15px;
      text-align: center;
      
      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      
      .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }
    }
  }
  
  .category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
    
    .filter-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 20px;
      color: #6c757d;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #e9ecef;
      }
      
      &.active {
        background: #4ecdc4;
        border-color: #4ecdc4;
        color: white;
      }
      
      .count {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }
  }
  
  .category-section {
    margin-bottom: 2rem;
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        margin: 0;
        
        i {
          color: #4ecdc4;
        }
      }
      
      .category-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .progress-bar {
          width: 100px;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4ecdc4, #44a08d);
            transition: width 0.3s ease;
          }
        }
        
        .progress-text {
          font-size: 0.8rem;
          color: #666;
        }
      }
    }
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
  }
  
  .shopping-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #4ecdc4;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
    }
    
    &.completed {
      opacity: 0.6;
      background: #e8f5e8;
      border-color: #28a745;
      
      .item-name {
        text-decoration: line-through;
      }
    }
    
    &.urgent {
      border-color: #ff6b6b;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
    }
    
    .item-checkbox {
      .checkbox-label {
        position: relative;
        width: 24px;
        height: 24px;
        border: 2px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        i {
          opacity: 0;
          color: white;
          font-size: 0.8rem;
          transition: opacity 0.3s ease;
        }
      }
      
      input[type="checkbox"] {
        display: none;
        
        &:checked + .checkbox-label {
          background: #28a745;
          border-color: #28a745;
          
          i {
            opacity: 1;
          }
        }
      }
    }
    
    .item-info {
      flex: 1;
      
      .item-name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.3rem;
      }
      
      .item-details {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.3rem;
        
        .quantity {
          background: #e9ecef;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          color: #495057;
        }
        
        .price {
          background: #d4edda;
          color: #155724;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .urgent-tag {
          background: #ff6b6b;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          animation: pulse 2s infinite;
        }
      }
      
      .item-note {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.8rem;
        color: #666;
        
        i {
          color: #ffc107;
        }
      }
    }
    
    .item-actions {
      display: flex;
      gap: 0.3rem;
      
      .action-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &.edit {
          background: #17a2b8;
          color: white;
          
          &:hover {
            background: #138496;
            transform: scale(1.1);
          }
        }
        
        &.urgent {
          background: #ffc107;
          color: white;
          
          &:hover {
            background: #e0a800;
            transform: scale(1.1);
          }
        }
        
        &.delete {
          background: #dc3545;
          color: white;
          
          &:hover {
            background: #c82333;
            transform: scale(1.1);
          }
        }
      }
    }
  }
  
  .shopping-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #f0f0f0;
    
    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.clear-completed {
        background: #28a745;
        color: white;
        
        &:hover {
          background: #218838;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
        }
      }
      
      &.export {
        background: #17a2b8;
        color: white;
        
        &:hover {
          background: #138496;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
        }
      }
      
      &.share {
        background: #6f42c1;
        color: white;
        
        &:hover {
          background: #5a32a3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(111, 66, 193, 0.3);
        }
      }
      
      &.clear-all {
        background: #dc3545;
        color: white;
        
        &:hover {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
    
    .empty-icon {
      font-size: 5rem;
      color: #ddd;
      margin-bottom: 2rem;
    }
    
    h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .empty-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      
      .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.btn-primary {
          background: #4ecdc4;
          color: white;
          
          &:hover:not(:disabled) {
            background: #45b7aa;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
          }
          
          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        }
        
        &.btn-secondary {
          background: #6c757d;
          color: white;
          
          &:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
          }
        }
      }
    }
  }
  
  // 模态框样式
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .modal-content {
      background: white;
      border-radius: 15px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      
      h3 {
        margin: 0;
        color: #2c3e50;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
        
        &:hover {
          color: #666;
        }
      }
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #eee;
    }
    
    .form-group {
      margin-bottom: 1rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #2c3e50;
        
        &.checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          
          input[type="checkbox"] {
            display: none;
            
            &:checked + .checkmark {
              background: #4ecdc4;
              border-color: #4ecdc4;
              
              &::after {
                opacity: 1;
              }
            }
          }
          
          .checkmark {
            position: relative;
            width: 20px;
            height: 20px;
            border: 2px solid #ddd;
            border-radius: 4px;
            transition: all 0.3s ease;
            
            &::after {
              content: '✓';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 0.8rem;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
          }
        }
      }
      
      .form-input,
      .form-select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: #4ecdc4;
        }
      }
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.btn-primary {
        background: #4ecdc4;
        color: white;
        
        &:hover {
          background: #45b7aa;
        }
      }
      
      &.btn-secondary {
        background: #6c757d;
        color: white;
        
        &:hover {
          background: #5a6268;
        }
      }
    }
  }
}

// 动画
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shopping-list {
    padding: 1rem;
    
    .shopping-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
      
      .header-actions {
        justify-content: center;
      }
    }
    
    .shopping-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .category-filter {
      justify-content: center;
    }
    
    .items-grid {
      grid-template-columns: 1fr;
    }
    
    .shopping-item {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
      
      .item-actions {
        justify-content: center;
      }
    }
    
    .shopping-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .empty-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .modal-content {
      width: 95%;
      margin: 1rem;
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
