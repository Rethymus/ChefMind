<template>
  <div class="recipe-export">
    <div class="export-header">
      <h3 class="export-title">导出食谱</h3>
      <p class="export-description">选择导出格式，将食谱保存到您的设备</p>
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
    
    <div class="export-preview">
      <div class="preview-header">
        <h4 class="preview-title">预览</h4>
        <div class="preview-format">{{ formatLabels[selectedFormat] }}</div>
      </div>
      
      <div class="preview-content">
        <pre v-if="selectedFormat === 'json'" class="preview-code json">{{ jsonPreview }}</pre>
        <pre v-else-if="selectedFormat === 'markdown'" class="preview-code markdown">{{ markdownPreview }}</pre>
        <pre v-else-if="selectedFormat === 'text'" class="preview-code text">{{ textPreview }}</pre>
      </div>
    </div>
    
    <div class="export-actions">
      <button class="btn-copy" @click="copyToClipboard">
        <span class="btn-icon">📋</span>
        复制到剪贴板
      </button>
      
      <button class="btn-download" @click="downloadFile">
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
  recipe: Recipe
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

// JSON预览
const jsonPreview = computed(() => {
  const recipeData = {
    name: props.recipe.name,
    description: props.recipe.description,
    rating: props.recipe.rating,
    cookingTime: props.recipe.cookingTime,
    difficulty: props.recipe.difficulty,
    servings: props.recipe.servings,
    ingredients: props.recipe.ingredients,
    steps: props.recipe.steps,
    tips: props.recipe.tips,
    nutritionInfo: props.recipe.nutritionInfo
  }
  
  return JSON.stringify(recipeData, null, 2)
})

// Markdown预览
const markdownPreview = computed(() => {
  let md = `# ${props.recipe.name}\n\n`
  
  // 评分
  md += `评分: ${'★'.repeat(props.recipe.rating)}${'☆'.repeat(5 - props.recipe.rating)}\n\n`
  
  // 描述
  if (props.recipe.description) {
    md += `${props.recipe.description}\n\n`
  }
  
  // 基本信息
  md += `- 烹饪时间: ${props.recipe.cookingTime}\n`
  md += `- 难度: ${props.recipe.difficulty}\n`
  md += `- 份量: ${props.recipe.servings || '2人份'}\n\n`
  
  // 食材
  md += `## 食材\n\n`
  props.recipe.ingredients.forEach(ingredient => {
    md += `- ${ingredient}\n`
  })
  md += '\n'
  
  // 步骤
  md += `## 烹饪步骤\n\n`
  props.recipe.steps.forEach((step, index) => {
    md += `${index + 1}. ${step}\n`
  })
  md += '\n'
  
  // 小贴士
  if (props.recipe.tips) {
    md += `## 小贴士\n\n`
    md += `${props.recipe.tips}\n\n`
  }
  
  // 营养信息
  if (props.recipe.nutritionInfo) {
    md += `## 营养信息\n\n`
    md += `- 热量: ${props.recipe.nutritionInfo.calories} kcal\n`
    md += `- 蛋白质: ${props.recipe.nutritionInfo.protein} g\n`
    md += `- 碳水: ${props.recipe.nutritionInfo.carbs} g\n`
    md += `- 脂肪: ${props.recipe.nutritionInfo.fat} g\n\n`
  }
  
  // 页脚
  md += `---\n`
  md += `由 ChefMind 智食谱生成 | ${new Date().toLocaleDateString('zh-CN')}`
  
  return md
})

// 纯文本预览
const textPreview = computed(() => {
  let text = `${props.recipe.name}\n\n`
  
  // 评分
  text += `评分: ${props.recipe.rating}/5\n\n`
  
  // 描述
  if (props.recipe.description) {
    text += `${props.recipe.description}\n\n`
  }
  
  // 基本信息
  text += `烹饪时间: ${props.recipe.cookingTime}\n`
  text += `难度: ${props.recipe.difficulty}\n`
  text += `份量: ${props.recipe.servings || '2人份'}\n\n`
  
  // 食材
  text += `【食材】\n\n`
  props.recipe.ingredients.forEach(ingredient => {
    text += `- ${ingredient}\n`
  })
  text += '\n'
  
  // 步骤
  text += `【烹饪步骤】\n\n`
  props.recipe.steps.forEach((step, index) => {
    text += `${index + 1}. ${step}\n`
  })
  text += '\n'
  
  // 小贴士
  if (props.recipe.tips) {
    text += `【小贴士】\n\n`
    text += `${props.recipe.tips}\n\n`
  }
  
  // 营养信息
  if (props.recipe.nutritionInfo) {
    text += `【营养信息】\n\n`
    text += `热量: ${props.recipe.nutritionInfo.calories} kcal\n`
    text += `蛋白质: ${props.recipe.nutritionInfo.protein} g\n`
    text += `碳水: ${props.recipe.nutritionInfo.carbs} g\n`
    text += `脂肪: ${props.recipe.nutritionInfo.fat} g\n\n`
  }
  
  // 页脚
  text += `---------------------------\n`
  text += `由 ChefMind 智食谱生成 | ${new Date().toLocaleDateString('zh-CN')}`
  
  return text
})

// 获取当前预览内容
const getCurrentPreview = () => {
  switch (selectedFormat.value) {
    case 'json':
      return jsonPreview.value
    case 'markdown':
      return markdownPreview.value
    case 'text':
      return textPreview.value
    default:
      return ''
  }
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getCurrentPreview())
    
    emit('notification', {
      type: 'success',
      title: '复制成功',
      message: '食谱内容已复制到剪贴板'
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
  const content = getCurrentPreview()
  const fileName = `${props.recipe.name}${fileExtensions[selectedFormat.value]}`
  
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
    message: `食谱已保存为${fileName}`
  })
}
</script>

<style lang="scss" scoped>
.recipe-export {
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.preview-format {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  background-color: var(--bg-color);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.preview-content {
  padding: 1rem;
  max-height: 300px;
  overflow: auto;
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
}

.btn-copy {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--hover-color);
  }
}

.btn-download {
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover {
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