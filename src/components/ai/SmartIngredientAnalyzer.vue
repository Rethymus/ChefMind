<template>
  <div class="smart-ingredient-analyzer">
    <el-card class="analyzer-card">
      <template #header>
        <div class="card-header">
          <h3>🤖 智能食材分析器</h3>
          <p class="subtitle">AI 驱动的食材识别与营养分析</p>
        </div>
      </template>

      <!-- 图像上传区域 -->
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="image-uploader"
          :show-file-list="false"
          :before-upload="handleImageUpload"
          accept="image/*"
          drag
        >
          <div v-if="!imagePreview" class="upload-placeholder">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">
              <p>点击或拖拽上传食材图片</p>
              <p class="upload-hint">支持 JPG、PNG 格式，建议图片清晰</p>
            </div>
          </div>
          <div v-else class="image-preview">
            <img :src="imagePreview" alt="食材预览" />
            <div class="preview-overlay">
              <el-button @click.stop="clearImage" type="danger" circle>
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-upload>
      </div>

      <!-- 分析按钮 -->
      <div class="analyze-section">
        <el-button 
          type="primary" 
          size="large"
          :loading="isAnalyzing"
          :disabled="!imagePreview"
          @click="analyzeIngredients"
          class="analyze-btn"
        >
          <el-icon><MagicStick /></el-icon>
          {{ isAnalyzing ? '分析中...' : '开始AI分析' }}
        </el-button>
      </div>

      <!-- 分析结果 -->
      <div v-if="analysisResults.length > 0" class="results-section">
        <h4 class="results-title">
          <el-icon><Trophy /></el-icon>
          识别结果
        </h4>
        
        <div class="ingredients-list">
          <div 
            v-for="(ingredient, index) in analysisResults" 
            :key="index"
            class="ingredient-card"
          >
            <div class="ingredient-header">
              <div class="ingredient-info">
                <h5 class="ingredient-name">{{ ingredient.name }}</h5>
                <div class="ingredient-meta">
                  <el-tag :type="getConfidenceType(ingredient.confidence)" size="small">
                    置信度: {{ (ingredient.confidence * 100).toFixed(1) }}%
                  </el-tag>
                  <el-tag type="info" size="small">{{ ingredient.category }}</el-tag>
                </div>
              </div>
              <div class="ingredient-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="addToRecipe(ingredient.name)"
                >
                  添加到食谱
                </el-button>
              </div>
            </div>

            <!-- 营养信息 -->
            <div class="nutrition-info">
              <h6>营养成分 (每100g)</h6>
              <div class="nutrition-grid">
                <div class="nutrition-item">
                  <span class="label">热量</span>
                  <span class="value">{{ ingredient.nutrition.calories }} kcal</span>
                </div>
                <div class="nutrition-item">
                  <span class="label">蛋白质</span>
                  <span class="value">{{ ingredient.nutrition.protein }}g</span>
                </div>
                <div class="nutrition-item">
                  <span class="label">碳水</span>
                  <span class="value">{{ ingredient.nutrition.carbs }}g</span>
                </div>
                <div class="nutrition-item">
                  <span class="label">脂肪</span>
                  <span class="value">{{ ingredient.nutrition.fat }}g</span>
                </div>
              </div>
            </div>

            <!-- 新鲜度评估 -->
            <div v-if="ingredient.freshness" class="freshness-info">
              <div class="freshness-header">
                <span>新鲜度评估</span>
                <el-progress 
                  :percentage="ingredient.freshness * 100" 
                  :color="getFreshnessColor(ingredient.freshness)"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
              <span class="freshness-text">{{ getFreshnessText(ingredient.freshness) }}</span>
            </div>

            <!-- 替代食材建议 -->
            <div v-if="ingredient.alternatives && ingredient.alternatives.length > 0" class="alternatives">
              <h6>替代食材建议</h6>
              <div class="alternatives-tags">
                <el-tag 
                  v-for="alt in ingredient.alternatives" 
                  :key="alt"
                  type="success"
                  size="small"
                  @click="addToRecipe(alt)"
                  class="clickable-tag"
                >
                  {{ alt }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 批量操作 -->
        <div class="batch-actions">
          <el-button type="success" @click="addAllIngredients">
            <el-icon><Plus /></el-icon>
            添加全部食材
          </el-button>
          <el-button @click="generateRecipeFromIngredients">
            <el-icon><MagicStick /></el-icon>
            基于这些食材生成食谱
          </el-button>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="analysisHistory.length > 0" class="history-section">
        <el-collapse v-model="activeHistoryPanel">
          <el-collapse-item title="分析历史" name="history">
            <div class="history-list">
              <div 
                v-for="(record, index) in analysisHistory" 
                :key="index"
                class="history-item"
                @click="loadHistoryRecord(record)"
              >
                <img :src="record.image" alt="历史图片" class="history-image" />
                <div class="history-info">
                  <div class="history-date">{{ formatDate(record.timestamp) }}</div>
                  <div class="history-ingredients">
                    识别到: {{ record.ingredients.map(i => i.name).join(', ') }}
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, MagicStick, Trophy } from '@element-plus/icons-vue'
import { aiService, type IngredientAnalysis } from '@/services/aiService'

// 组件事件
const emit = defineEmits<{
  addIngredient: [ingredient: string]
  generateRecipe: [ingredients: string[]]
}>()

// 响应式数据
const uploadRef = ref()
const imagePreview = ref<string>('')
const isAnalyzing = ref(false)
const analysisResults = ref<IngredientAnalysis[]>([])
const activeHistoryPanel = ref<string>('')

// 分析历史
const analysisHistory = reactive<Array<{
  image: string
  timestamp: Date
  ingredients: IngredientAnalysis[]
}>>([])

// 处理图片上传
const handleImageUpload = (file: File) => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件！')
    return false
  }

  // 验证文件大小 (5MB)
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }

  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

// 清除图片
const clearImage = () => {
  imagePreview.value = ''
  analysisResults.value = []
}

// 分析食材
const analyzeIngredients = async () => {
  if (!imagePreview.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  isAnalyzing.value = true
  
  try {
    const results = await aiService.recognizeIngredients(imagePreview.value)
    analysisResults.value = results
    
    // 保存到历史记录
    analysisHistory.unshift({
      image: imagePreview.value,
      timestamp: new Date(),
      ingredients: results
    })
    
    // 限制历史记录数量
    if (analysisHistory.length > 10) {
      analysisHistory.splice(10)
    }
    
    ElMessage.success(`成功识别 ${results.length} 种食材`)
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败，请重试')
  } finally {
    isAnalyzing.value = false
  }
}

// 获取置信度类型
const getConfidenceType = (confidence: number) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'danger'
}

// 获取新鲜度颜色
const getFreshnessColor = (freshness: number) => {
  if (freshness >= 0.8) return '#67c23a'
  if (freshness >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

// 获取新鲜度文本
const getFreshnessText = (freshness: number) => {
  if (freshness >= 0.8) return '新鲜'
  if (freshness >= 0.6) return '一般'
  return '不够新鲜'
}

// 添加到食谱
const addToRecipe = (ingredient: string) => {
  emit('addIngredient', ingredient)
  ElMessage.success(`已添加 ${ingredient} 到食材列表`)
}

// 添加全部食材
const addAllIngredients = () => {
  const ingredients = analysisResults.value.map(item => item.name)
  ingredients.forEach(ingredient => {
    emit('addIngredient', ingredient)
  })
  ElMessage.success(`已添加 ${ingredients.length} 种食材到列表`)
}

// 基于食材生成食谱
const generateRecipeFromIngredients = () => {
  const ingredients = analysisResults.value.map(item => item.name)
  emit('generateRecipe', ingredients)
}

// 加载历史记录
const loadHistoryRecord = (record: any) => {
  imagePreview.value = record.image
  analysisResults.value = record.ingredients
  activeHistoryPanel.value = ''
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped lang="scss">
.smart-ingredient-analyzer {
  .analyzer-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    text-align: center;
    
    h3 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
      font-weight: 600;
    }
    
    .subtitle {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .upload-section {
    margin-bottom: 20px;
    
    .image-uploader {
      width: 100%;
      
      :deep(.el-upload) {
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
      }
      
      :deep(.el-upload-dragger) {
        width: 100%;
        height: 200px;
        border-radius: 8px;
        border: 2px dashed var(--el-border-color);
        background-color: var(--el-fill-color-lighter);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }
      }
    }
    
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      
      .upload-icon {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }
      
      .upload-text {
        text-align: center;
        
        p {
          margin: 4px 0;
          
          &:first-child {
            color: var(--el-text-color-primary);
            font-size: 16px;
            font-weight: 500;
          }
          
          &.upload-hint {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
        }
      }
    }
    
    .image-preview {
      position: relative;
      width: 100%;
      height: 200px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }
      
      .preview-overlay {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover .preview-overlay {
        opacity: 1;
      }
    }
  }

  .analyze-section {
    text-align: center;
    margin-bottom: 24px;
    
    .analyze-btn {
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .results-section {
    .results-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
    
    .ingredients-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .ingredient-card {
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      
      .ingredient-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
        
        .ingredient-info {
          flex: 1;
          
          .ingredient-name {
            margin: 0 0 8px 0;
            color: var(--el-text-color-primary);
            font-size: 16px;
            font-weight: 600;
          }
          
          .ingredient-meta {
            display: flex;
            gap: 8px;
          }
        }
      }
      
      .nutrition-info {
        margin-bottom: 12px;
        
        h6 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-regular);
          font-size: 14px;
          font-weight: 500;
        }
        
        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
          
          .nutrition-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px;
            background: var(--el-bg-color);
            border-radius: 4px;
            
            .label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-bottom: 2px;
            }
            
            .value {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }
        }
      }
      
      .freshness-info {
        margin-bottom: 12px;
        
        .freshness-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          
          span {
            font-size: 14px;
            color: var(--el-text-color-regular);
            font-weight: 500;
          }
          
          :deep(.el-progress) {
            flex: 1;
            margin-left: 12px;
          }
        }
        
        .freshness-text {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
      
      .alternatives {
        h6 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-regular);
          font-size: 14px;
          font-weight: 500;
        }
        
        .alternatives-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          
          .clickable-tag {
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }
    }
    
    .batch-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .history-section {
    margin-top: 24px;
    
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .history-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--el-fill-color-light);
        transform: translateX(4px);
      }
      
      .history-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0;
      }
      
      .history-info {
        flex: 1;
        
        .history-date {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }
        
        .history-ingredients {
          font-size: 14px;
          color: var(--el-text-color-primary);
          line-height: 1.4;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .smart-ingredient-analyzer {
    .ingredient-card .ingredient-header {
      flex-direction: column;
      gap: 12px;
      
      .ingredient-actions {
        align-self: stretch;
        
        .el-button {
          width: 100%;
        }
      }
    }
    
    .batch-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>