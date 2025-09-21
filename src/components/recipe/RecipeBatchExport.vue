<template>
  <div class="recipe-batch-export">
    <div class="export-header">
      <h3 class="export-title">批量导出食谱</h3>
      <p class="export-description">选择要导出的食谱和导出格式</p>
    </div>
    
    <div class="export-options">
      <button 
        class="export-option" 
        :class="{ active: selectedFormat === 'json' }"
        @click="selectedFormat = 'json'"
      >
        <div class="option-icon">{ }</div>
        <div class="option-content">
          <h4 class="option-title">JSON</h4>
          <p class="option-description">导出为JSON格式，适合导入其他应用</p>
        </div>
      </button>
      
      <button 
        class="export-option" 
        :class="{ active: selectedFormat === 'markdown' }"
        @click="selectedFormat = 'markdown'"
      >
        <div class="option-icon"># </div>
        <div class="option-content">
          <h4 class="option-title">Markdown</h4>
          <p class="option-description">导出为Markdown格式，适合在笔记应用中使用</p>
        </div>
      </button>
      
      <button 
        class="export-option" 
        :class="{ active: selectedFormat === 'text' }"
        @click="selectedFormat = 'text'"
      >
        <div class="option-icon">Aa</div>
        <div class="option-content">
          <h4 class="option-title">纯文本</h4>
          <p class="option-description">导出为纯文本格式，适合复制粘贴</p>
        </div>
      </button>
    </div>
    
    <div class="recipe-selection">
      <div class="selection-header">
        <h4 class="selection-title">选择要导出的食谱</h4>
        <div class="selection-actions">
          <button class="selection-action" @click="selectAll">全选</button>
          <button class="selection-action" @click="deselectAll">取消全选</button>
        </div>
      </div>
      
      <div class="recipe-list">
        <div 
          v-for="recipe in recipes" 
          :key="recipe.id"
          class="recipe-item"
          :class="{ selected: selectedRecipes.includes(recipe.id) }"
          @click="toggleRecipeSelection(recipe.id)"
        >
          <div class="recipe-checkbox">
            <input 
              type="checkbox" 
              :id="`recipe-${recipe.id}`" 
              :checked="selectedRecipes.includes(recipe.id)"
              @click.stop
            >
            <label :for="`recipe-${recipe.id}`"></label>
          </div>
          <div class="recipe-info">
            <h4 class="recipe-name">{{ recipe.name }}</h4>
            <div class="recipe-meta">
              <span class="cooking-time">{{ recipe.cookingTime }}</span>
              <div class="recipe-rating">
                <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="export-preview">
      <div class="preview-header">
        <h4 class="preview-title">预览</h4>
        <div class="preview-info">
          已选择 {{ selectedRecipes.length }} 个食谱，{{ formatLabels[selectedFormat] }} 格式
        </div>
      </div>
      
      <div class="preview-content">
        <div v-if="selectedRecipes.length === 0" class="no-selection">
          请选择至少一个食谱进行导出
        </div>
        <pre v-else class="preview-code" :class="selectedFormat">{{ previewContent }}</pre>
      </div>
    </div>
    
    <div class="export-actions">
      <button 
        class="btn-copy" 
        @click="copyToClipboard"
        :disabled="selectedRecipes.length === 0"
      >
        <span class="btn-icon">📋</span>
        复制到剪贴板
      </button>
      
      <button 
        class="btn-download" 
        @click="downloadFile"
        :disabled="selectedRecipes.length === 0"
      >
        <span class="btn-icon">💾</span>
        下载文件
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Recipe } from '@/services/recipeService'

// 定义属性
const props = defineProps<{
  recipes: Recipe[]
}>()

// 定义事件
const emit = defineEmits<{
  (_e: 'notification', _notification: { type: string, title: string, message: string }): void
}>()

// 导出格式
const selectedFormat = ref<'json' | 'markdown' | 'text'>('json')
const formatLabels = {
  json: 'JSON',
  markdown: 'Markdown',
  text: '纯文本'
}

// 文件扩展名
const fileExtensions = {
  json: '.json',
  markdown: '.md',
  text: '.txt'
}

// 选中的食谱
const selectedRecipes = ref<string[]>([])

// 全选
const selectAll = () => {
  selectedRecipes.value = props.recipes.map(recipe => recipe.id)
}

// 取消全选
const deselectAll = () => {
  selectedRecipes.value = []
}

// 切换食谱选择状态
const toggleRecipeSelection = (recipeId: string) => {
  const index = selectedRecipes.value.indexOf(recipeId)
  if (index > -1) {
    selectedRecipes.value.splice(index, 1)
  } else {
    selectedRecipes.value.push(recipeId)
  }
}

// 获取选中的食谱数据
const selectedRecipeData = computed(() => {
  return props.recipes.filter(recipe => selectedRecipes.value.includes(recipe.id))
})

// 预览内容
const previewContent = computed(() => {
  if (selectedRecipes.value.length === 0) return ''
  
  switch (selectedFormat.value) {
    case 'json':
      return JSON.stringify(selectedRecipeData.value, null, 2)
    case 'markdown':
      return generateMarkdown(selectedRecipeData.value)
    case 'text':
      return generateText(selectedRecipeData.value)
    default:
      return ''
  }
})

// 生成Markdown格式
const generateMarkdown = (recipes: Recipe[]) => {
  let md = `# 我的食谱集\n\n`
  md += `导出时间: ${new Date().toLocaleDateString('zh-CN')}\n\n`
  md += `共 ${recipes.length} 个食谱\n\n`
  
  recipes.forEach((recipe, index) => {
    md += `## ${index + 1}. ${recipe.name}\n\n`
    
    // 评分
    md += `评分: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}\n\n`
    
    // 描述
    if (recipe.description) {
      md += `${recipe.description}\n\n`
    }
    
    // 基本信息
    md += `- 烹饪时间: ${recipe.cookingTime}\n`
    md += `- 难度: ${recipe.difficulty}\n`
    md += `- 份量: ${recipe.servings || '2人份'}\n\n`
    
    // 食材
    md += `### 食材\n\n`
    recipe.ingredients.forEach(ingredient => {
      md += `- ${ingredient}\n`
    })
    md += '\n'
    
    // 步骤
    md += `### 烹饪步骤\n\n`
    recipe.steps.forEach((step, stepIndex) => {
      md += `${stepIndex + 1}. ${step}\n`
    })
    md += '\n'
    
    // 小贴士
    if (recipe.tips) {
      md += `### 小贴士\n\n`
      md += `${recipe.tips}\n\n`
    }
    
    // 营养信息
    if (recipe.nutritionInfo) {
      md += `### 营养信息\n\n`
      md += `- 热量: ${recipe.nutritionInfo.calories} kcal\n`
      md += `- 蛋白质: ${recipe.nutritionInfo.protein} g\n`
      md += `- 碳水: ${recipe.nutritionInfo.carbs} g\n`
      md += `- 脂肪: ${recipe.nutritionInfo.fat} g\n\n`
    }
    
    // 分隔线
    if (index < recipes.length - 1) {
      md += `---\n\n`
    }
  })
  
  return md
}

// 生成纯文本格式
const generateText = (recipes: Recipe[]) => {
  let text = `我的食谱集\n\n`
  text += `导出时间: ${new Date().toLocaleDateString('zh-CN')}\n\n`
  text += `共 ${recipes.length} 个食谱\n\n`
  
  recipes.forEach((recipe, index) => {
    text += `${index + 1}. ${recipe.name}\n\n`
    
    // 评分
    text += `评分: ${recipe.rating}/5\n\n`
    
    // 描述
    if (recipe.description) {
      text += `${recipe.description}\n\n`
    }
    
    // 基本信息
    text += `烹饪时间: ${recipe.cookingTime}\n`
    text += `难度: ${recipe.difficulty}\n`
    text += `份量: ${recipe.servings || '2人份'}\n\n`
    
    // 食材
    text += `【食材】\n\n`
    recipe.ingredients.forEach(ingredient => {
      text += `- ${ingredient}\n`
    })
    text += '\n'
    
    // 步骤
    text += `【烹饪步骤】\n\n`
    recipe.steps.forEach((step, stepIndex) => {
      text += `${stepIndex + 1}. ${step}\n`
    })
    text += '\n'
    
    // 小贴士
    if (recipe.tips) {
      text += `【小贴士】\n\n`
      text += `${recipe.tips}\n\n`
    }
    
    // 营养信息
    if (recipe.nutritionInfo) {
      text += `【营养信息】\n\n`
      text += `热量: ${recipe.nutritionInfo.calories} kcal\n`
      text += `蛋白质: ${recipe.nutritionInfo.protein} g\n`
      text += `碳水: ${recipe.nutritionInfo.carbs} g\n`
      text += `脂肪: ${recipe.nutritionInfo.fat} g\n\n`
    }
    
    // 分隔线
    if (index < recipes.length - 1) {
      text += `---------------------------\n\n`
    }
  })
  
  return text
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (selectedRecipes.value.length === 0) return
  
  try {
    await navigator.clipboard.writeText(previewContent.value)
    
    emit('notification', {
      type: 'success',
      title: '复制成功',
      message: `已复制 ${selectedRecipes.value.length} 个食谱到剪贴板`
    })
  } catch (error) {
    console.error('复制失败:', error)
    emit('notification', {
      type: 'error',
      title: '复制失败',
      message: '无法复制到剪贴板，请重试'
    })
  }
}

// 下载文件
const downloadFile = () => {
  if (selectedRecipes.value.length === 0) return
  
  const content = previewContent.value
  const fileName = `我的食谱集_${selectedRecipes.value.length}个${fileExtensions[selectedFormat.value]}`
  
  // 创建Blob对象
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  
  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  
  emit('notification', {
    type: 'success',
    title: '下载成功',
    message: `已下载 ${selectedRecipes.value.length} 个食谱`
  })
}
</script>

<style lang="scss" scoped>
.recipe-batch-export {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.export-header {
  margin-bottom: 1.5rem;
}

.export-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 0.5rem 0;
}

.export-description {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.active {
    border-color: var(--primary-color);
    background-color: var(--primary-color-light);
  }
}

.option-icon {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  border-radius: 8px;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 0.3rem 0;
}

.option-description {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.recipe-selection {
  background-color: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-color-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.selection-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.selection-actions {
  display: flex;
  gap: 0.5rem;
}

.selection-action {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
}

.recipe-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.recipe-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.selected {
    background-color: var(--primary-color-light);
  }
}

.recipe-checkbox {
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

.recipe-info {
  flex: 1;
}

.recipe-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--heading-color);
  margin: 0 0 0.3rem 0;
}

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.export-preview {
  background-color: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background-color: var(--bg-color-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.preview-info {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.preview-content {
  padding: 1rem;
  max-height: 300px;
  overflow: auto;
}

.no-selection {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-color-secondary);
  font-style: italic;
}

.preview-code {
  font-family: 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  
  &.json {
    color: var(--text-color);
  }
  
  &.markdown {
    color: var(--text-color);
  }
  
  &.text {
    color: var(--text-color);
  }
}

.export-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-copy,
.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-copy {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover:not(:disabled) {
    background-color: var(--hover-color);
  }
}

.btn-download {
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color-dark);
  }
}

.btn-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .export-options {
    grid-template-columns: 1fr;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .btn-copy,
  .btn-download {
    width: 100%;
    justify-content: center;
  }
}
</style>