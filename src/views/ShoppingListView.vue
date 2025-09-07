<template>
  <div class="shopping-list-view">
    <header class="page-header">
      <h1 class="page-title">购物清单</h1>
      <div class="header-actions">
        <button class="action-button" @click="clearCompletedItems">
          <span class="action-icon">🧹</span>
          清除已完成
        </button>
      </div>
    </header>

    <div class="shopping-list-content">
      <div class="add-item-section">
        <div class="add-item-form">
          <input 
            v-model="newItem" 
            type="text" 
            placeholder="添加购物项目..." 
            class="item-input"
            @keyup.enter="addItem"
          />
          <button class="add-button" @click="addItem" :disabled="!newItem.trim()">
            <span class="add-icon">+</span>
            添加
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载购物清单中...</p>
      </div>

      <div v-else-if="shoppingList.length === 0" class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>购物清单为空</h3>
        <p>添加您需要购买的食材和物品</p>
      </div>

      <div v-else class="shopping-list-container">
        <div class="list-header">
          <div class="list-stats">
            <span class="stats-text">{{ completedCount }} / {{ shoppingList.length }} 已完成</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <div class="list-actions">
            <div class="sort-options">
              <button 
                class="sort-option" 
                :class="{ active: sortMode === 'default' }"
                @click="sortItems('default')"
              >
                默认排序
              </button>
              <button 
                class="sort-option" 
                :class="{ active: sortMode === 'completed' }"
                @click="sortItems('completed')"
              >
                完成状态
              </button>
              <button 
                class="sort-option" 
                :class="{ active: sortMode === 'recipe' }"
                @click="sortItems('recipe')"
              >
                按菜谱分组
              </button>
            </div>
          </div>
        </div>

        <div class="list-categories">
          <!-- 按菜谱分组显示 -->
          <div v-if="sortMode === 'recipe'">
            <div 
              v-for="recipe in recipeGroups" 
              :key="recipe"
              class="recipe-section"
            >
              <h3 class="recipe-title">
                <span class="recipe-icon">🍳</span>
                {{ recipe || '未分类食材' }}
              </h3>
              <ul class="items-list">
                <li 
                  v-for="(item, index) in getItemsByRecipe(recipe)" 
                  :key="index"
                  :class="['list-item', { completed: item.completed }]"
                >
                  <div class="item-checkbox">
                    <input 
                      type="checkbox" 
                      :id="`item-recipe-${index}`" 
                      v-model="item.completed"
                      @change="saveShoppingList"
                    />
                    <label :for="`item-recipe-${index}`"></label>
                  </div>
                  
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-details">
                      <div v-if="item.amount || item.unit" class="item-amount">
                        <span class="amount-icon">⚖️</span>
                        {{ item.amount }} {{ item.unit }}
                        <span v-if="item.purchaseAdvice" class="purchase-advice">
                          （{{ item.purchaseAdvice }}）
                        </span>
                      </div>
                      <div v-if="item.category" class="item-category">
                        <span class="category-icon">📦</span>
                        {{ item.category }}
                      </div>
                      <div v-if="item.note" class="item-note">{{ item.note }}</div>
                    </div>
                  </div>
                  
                  <div class="item-actions">
                    <button class="item-action edit" @click="editItem(item)">
                      <span class="action-icon">✏️</span>
                    </button>
                    <button class="item-action delete" @click="removeItem(shoppingList.indexOf(item))">
                      <span class="action-icon">🗑️</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- 按分类显示 -->
          <div v-else>
            <div 
              v-for="category in categories" 
              :key="category"
              class="category-section"
            >
              <h3 class="category-title">{{ category }}</h3>
              <ul class="items-list">
                <li 
                  v-for="(item, index) in getItemsByCategory(category)" 
                  :key="index"
                  :class="['list-item', { completed: item.completed }]"
                >
                  <div class="item-checkbox">
                    <input 
                      type="checkbox" 
                      :id="`item-${index}`" 
                      v-model="item.completed"
                      @change="saveShoppingList"
                    />
                    <label :for="`item-${index}`"></label>
                  </div>
                  
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-details">
                      <div v-if="item.amount || item.unit" class="item-amount">
                        <span class="amount-icon">⚖️</span>
                        {{ item.amount }} {{ item.unit }}
                        <span v-if="item.purchaseAdvice" class="purchase-advice">
                          （{{ item.purchaseAdvice }}）
                        </span>
                      </div>
                      <div v-if="item.recipeName" class="item-recipe">
                        <span class="recipe-icon">🍳</span>
                        来自: {{ item.recipeName }}
                      </div>
                      <div v-if="item.note" class="item-note">{{ item.note }}</div>
                    </div>
                  </div>
                  
                  <div class="item-actions">
                    <button class="item-action edit" @click="editItem(item)">
                      <span class="action-icon">✏️</span>
                    </button>
                    <button class="item-action delete" @click="removeItem(index)">
                      <span class="action-icon">🗑️</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑项目模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">编辑项目</h3>
        <div class="modal-body">
          <div class="form-group">
            <label for="edit-name">名称</label>
            <input 
              id="edit-name"
              v-model="editingItem.name" 
              type="text" 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="edit-category">分类</label>
            <select 
              id="edit-category"
              v-model="editingItem.category" 
              class="form-select"
            >
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
              <option value="custom">自定义...</option>
            </select>
          </div>
          
          <div v-if="editingItem.category === 'custom'" class="form-group">
            <label for="custom-category">自定义分类</label>
            <input 
              id="custom-category"
              v-model="customCategory" 
              type="text" 
              class="form-input"
              placeholder="输入新分类名称"
            />
          </div>
          
          <div class="form-group">
            <label for="edit-note">备注</label>
            <textarea 
              id="edit-note"
              v-model="editingItem.note" 
              class="form-textarea"
              placeholder="添加备注（可选）"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showEditModal = false">取消</button>
          <button class="confirm-btn" @click="saveEditedItem" :disabled="!editingItem.name.trim()">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { shoppingListService, type ShoppingItem } from '@/services/shoppingListService'

const isLoading = ref(true)
const shoppingList = ref<ShoppingItem[]>([])
const newItem = ref('')
const sortMode = ref<'default' | 'completed' | 'recipe'>('default')

// 编辑相关
const showEditModal = ref(false)
const editingItem = ref<ShoppingItem>({ id: '', name: '', completed: false, category: '食材', createdAt: '', updatedAt: '' })
const editingIndex = ref(-1)
const customCategory = ref('')

// 可用分类
const availableCategories = ref(['食材', '调味料', '厨具', '其他'])

// 根据购物清单中的项目获取所有分类
const categories = computed(() => {
  const cats = new Set<string>()
  shoppingList.value.forEach(item => {
    cats.add(item.category)
  })
  return Array.from(cats)
})

// 已完成项目数量
const completedCount = computed(() => {
  return shoppingList.value.filter(item => item.completed).length
})

// 完成进度百分比
const progressPercentage = computed(() => {
  if (shoppingList.value.length === 0) return 0
  return (completedCount.value / shoppingList.value.length) * 100
})

// 根据分类获取项目
const getItemsByCategory = (category: string) => {
  return shoppingList.value.filter(item => item.category === category)
}

// 获取所有菜谱名称
const recipeGroups = computed(() => {
  const recipes = new Set<string>()
  shoppingList.value.forEach(item => {
    recipes.add(item.recipeName || '')
  })
  return Array.from(recipes)
})

// 根据菜谱获取项目
const getItemsByRecipe = (recipeName: string) => {
  return shoppingList.value.filter(item => 
    (recipeName === '' && !item.recipeName) || 
    (item.recipeName === recipeName)
  )
}

// 添加新项目
const addItem = async () => {
  if (!newItem.value.trim()) return
  
  try {
    const now = new Date().toISOString();
    const newItemData = {
      id: `item_${Date.now()}`,
      name: newItem.value.trim(),
      completed: false,
      category: '食材',
      createdAt: now,
      updatedAt: now
    }
    
    const item = await shoppingListService.addItem(newItemData)
    
    shoppingList.value.push(item)
    newItem.value = ''
  } catch (error) {
    console.error('添加项目失败:', error)
    // 显示错误通知
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: 'error',
        title: '添加失败',
        message: '无法添加购物项目，请稍后再试'
      }
    }))
  }
}

// 编辑项目
const editItem = (item: ShoppingItem) => {
  editingIndex.value = shoppingList.value.findIndex(i => i === item)
  editingItem.value = { ...item }
  customCategory.value = ''
  showEditModal.value = true
}

// 保存编辑后的项目
const saveEditedItem = async () => {
  if (!editingItem.value.name.trim()) return
  
  try {
    // 如果选择了自定义分类
    if (editingItem.value.category === 'custom' && customCategory.value.trim()) {
      editingItem.value.category = customCategory.value.trim()
      
      // 添加到可用分类列表
      await shoppingListService.addCategory(editingItem.value.category)
      
      // 更新本地分类列表
      if (!availableCategories.value.includes(editingItem.value.category)) {
        availableCategories.value.push(editingItem.value.category)
      }
    }
    
    if (editingIndex.value > -1) {
      const item = shoppingList.value[editingIndex.value]
      const updatedItem = await shoppingListService.updateItem(item.id, {
        name: editingItem.value.name,
        category: editingItem.value.category,
        note: editingItem.value.note,
        completed: editingItem.value.completed
      })
      
      // 更新本地列表
      shoppingList.value[editingIndex.value] = updatedItem
    }
    
    showEditModal.value = false
  } catch (error) {
    console.error('保存编辑项目失败:', error)
    // 显示错误通知
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: 'error',
        title: '保存失败',
        message: '无法保存编辑的项目，请稍后再试'
      }
    }))
  }
}

// 移除项目
const removeItem = async (index: number) => {
  const item = shoppingList.value[index]
  
  try {
    const success = await shoppingListService.deleteItem(item.id)
    if (success) {
      shoppingList.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除项目失败:', error)
    // 显示错误通知
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: 'error',
        title: '删除失败',
        message: '无法删除购物项目，请稍后再试'
      }
    }))
  }
}

// 清除已完成项目
const clearCompletedItems = async () => {
  try {
    const success = await shoppingListService.clearCompletedItems()
    if (success) {
      shoppingList.value = shoppingList.value.filter(item => !item.completed)
    }
  } catch (error) {
    console.error('清除已完成项目失败:', error)
    // 显示错误通知
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: 'error',
        title: '清除失败',
        message: '无法清除已完成项目，请稍后再试'
      }
    }))
  }
}

// 切换排序模式
const sortItems = (mode: 'default' | 'completed' | 'recipe') => {
  sortMode.value = mode
  
  if (mode === 'default') {
    loadShoppingList() // 重新加载恢复原始顺序
  } else if (mode === 'completed') {
    shoppingList.value.sort((a, b) => {
      if (a.completed === b.completed) return 0
      return a.completed ? 1 : -1
    })
  } else if (mode === 'recipe') {
    shoppingList.value.sort((a, b) => {
      // 先按菜谱名称排序
      if (!a.recipeName && b.recipeName) return 1
      if (a.recipeName && !b.recipeName) return -1
      if (!a.recipeName && !b.recipeName) return 0
      
      // 如果都有菜谱名称，按名称排序
      if (a.recipeName && b.recipeName) {
        if (a.recipeName < b.recipeName) return -1
        if (a.recipeName > b.recipeName) return 1
      }
      
      return 0
    })
  }
}

// 保存购物清单
const saveShoppingList = async () => {
  // 由于我们使用服务来管理购物清单，这个方法现在主要用于更新项目状态
  try {
    // 对于已更改的项目，调用服务的更新方法
    for (const item of shoppingList.value) {
      await shoppingListService.updateItem(item.id, item)
    }
  } catch (error) {
    console.error('保存购物清单失败:', error)
  }
}

// 加载购物清单
const loadShoppingList = async () => {
  isLoading.value = true
  try {
    // 使用服务加载购物清单
    const items = await shoppingListService.getShoppingList()
    shoppingList.value = items
    
    // 加载可用分类
    const categories = await shoppingListService.getCategories()
    availableCategories.value = categories
  } catch (error) {
    console.error('加载购物清单失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  loadShoppingList()
})
</script>

<style lang="scss" scoped>
.shopping-list-view {
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
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-color-secondary);
  color: var(--text-color);
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
}

.action-icon {
  font-size: 1.1rem;
}

.shopping-list-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.add-item-section {
  margin-bottom: 2rem;
}

.add-item-form {
  display: flex;
  gap: 1rem;
}

.item-input {
  flex: 1;
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

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.add-icon {
  font-size: 1.2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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
}

.shopping-list-container {
  margin-top: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.list-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.stats-text {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.progress-bar {
  height: 8px;
  background-color: var(--bg-color-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.list-actions {
  display: flex;
  gap: 1rem;
}

.sort-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-option {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--hover-color);
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.recipe-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-color-light);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.recipe-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.item-amount {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  width: fit-content;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.amount-icon {
  font-size: 1rem;
}

.purchase-advice {
  color: var(--text-color-secondary);
  font-weight: normal;
  font-style: italic;
}

.item-category {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  background-color: var(--bg-color-secondary);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}

.category-icon {
  font-size: 1rem;
}

.category-section {
  margin-bottom: 2rem;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.items-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  &.completed {
    opacity: 0.7;
    
    .item-name {
      text-decoration: line-through;
    }
  }
}

.item-checkbox {
  position: relative;
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  label {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-color: var(--bg-color);
    border: 2px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &::after {
      content: '';
      position: absolute;
      display: none;
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
  
  input[type="checkbox"]:checked + label {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    
    &::after {
      display: block;
    }
  }
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  color: var(--text-color);
  margin-bottom: 0.3rem;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.item-recipe {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}

.recipe-icon {
  font-size: 1rem;
}

.item-note {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.item-action {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.edit:hover {
    color: var(--primary-color);
  }
  
  &.delete:hover {
    color: var(--error-color);
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
  padding: 1rem;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.form-input, .form-select, .form-textarea {
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

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn, .confirm-btn {
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 0 1.5rem;
  }
  
  .shopping-list-content {
    padding: 0 1.5rem;
  }
  
  .add-item-form {
    flex-direction: column;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .list-stats {
    width: 100%;
  }
  
  .list-item {
    flex-wrap: wrap;
  }
  
  .item-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
  
  .shopping-list-view {
    padding-bottom: 5rem; /* 为移动导航栏留出空间 */
  }
}
</style>