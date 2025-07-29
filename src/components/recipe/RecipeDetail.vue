<template>
  <div class="recipe-detail">
    <!-- 菜谱头部信息 -->
    <div class="recipe-header">
      <div class="recipe-basic-info">
        <h1 class="recipe-name">{{ recipe.name }}</h1>
        <p class="recipe-description">{{ recipe.description }}</p>
        
        <!-- 评分和标签 -->
        <div class="recipe-ratings">
          <div class="rating-group">
            <span class="rating-label">难度等级</span>
            <el-rate
              v-model="recipe.difficulty"
              disabled
              show-score
              text-color="#ff9900"
              :max="5"
            />
          </div>
          <div class="rating-group">
            <span class="rating-label">营养评分</span>
            <el-rate
              v-model="recipe.nutrition"
              disabled
              show-score
              text-color="#67c23a"
              :max="5"
            />
          </div>
        </div>
        
        <!-- 基本信息 -->
        <div class="recipe-meta">
          <div class="meta-item">
            <el-icon><Timer /></el-icon>
            <span>制作时间：{{ recipe.time }}分钟</span>
          </div>
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>适合人数：{{ recipe.servings }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>创建时间：{{ formatDate(recipe.createdAt) }}</span>
          </div>
        </div>
        
        <!-- 标签 -->
        <div class="recipe-tags">
          <el-tag
            v-for="tag in recipe.tags"
            :key="tag"
            type="info"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 食材清单 -->
    <div class="ingredients-section">
      <h2>
        <el-icon><ShoppingBag /></el-icon>
        所需食材 ({{ recipe.ingredients.length }}种)
      </h2>
      <div class="ingredients-grid">
        <div
          v-for="ingredient in recipe.ingredients"
          :key="ingredient.id"
          class="ingredient-item"
        >
          <div class="ingredient-icon">
            <el-icon>
              <component :is="getCategoryIcon(ingredient.category)" />
            </el-icon>
          </div>
          <span class="ingredient-name">{{ ingredient.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 制作步骤 -->
    <div class="steps-section">
      <h2>
        <el-icon><List /></el-icon>
        制作步骤
      </h2>
      <div class="steps-list">
        <div
          v-for="(step, index) in recipe.steps"
          :key="step.id"
          class="step-item"
          :class="{ completed: completedSteps.includes(step.id) }"
        >
          <div class="step-number">
            <span v-if="!completedSteps.includes(step.id)">{{ index + 1 }}</span>
            <el-icon v-else><Check /></el-icon>
          </div>
          <div class="step-content">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
            <div v-if="step.tips" class="step-tips">
              <el-icon><Lightbulb /></el-icon>
              <span>小贴士：{{ step.tips }}</span>
            </div>
          </div>
          <div class="step-actions">
            <el-button
              v-if="!completedSteps.includes(step.id)"
              type="success"
              size="small"
              @click="markStepCompleted(step.id)"
            >
              完成
            </el-button>
            <el-button
              v-else
              type="info"
              size="small"
              @click="markStepUncompleted(step.id)"
            >
              取消
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 外部资源链接 -->
    <div class="external-links-section">
      <h2>
        <el-icon><Link /></el-icon>
        相关资源
      </h2>
      <p class="section-description">点击下方链接查看更多制作教程和用户分享</p>
      <div class="external-links">
        <a
          v-for="link in externalLinks"
          :key="link.name"
          :href="getSearchUrl(link.url, recipe.name)"
          target="_blank"
          class="external-link"
          :style="{ '--link-color': link.color }"
        >
          <div class="link-icon">
            <el-icon>
              <component :is="getLinkIcon(link.icon)" />
            </el-icon>
          </div>
          <div class="link-content">
            <span class="link-name">{{ link.name }}</span>
            <span class="link-desc">查看{{ recipe.name }}相关内容</span>
          </div>
          <el-icon class="link-arrow"><ArrowRight /></el-icon>
        </a>
      </div>
    </div>
    
    <!-- 营养信息 -->
    <div class="nutrition-section">
      <h2>
        <el-icon><DataAnalysis /></el-icon>
        营养信息
      </h2>
      <div class="nutrition-content">
        <div class="nutrition-chart">
          <div class="chart-placeholder">
            <el-icon :size="48"><PieChart /></el-icon>
            <p>营养成分分析图</p>
            <small>功能开发中...</small>
          </div>
        </div>
        <div class="nutrition-details">
          <div class="nutrition-item">
            <span class="nutrition-label">蛋白质</span>
            <div class="nutrition-bar">
              <div class="bar-fill" style="width: 75%"></div>
            </div>
            <span class="nutrition-value">75%</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">碳水化合物</span>
            <div class="nutrition-bar">
              <div class="bar-fill" style="width: 60%"></div>
            </div>
            <span class="nutrition-value">60%</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">脂肪</span>
            <div class="nutrition-bar">
              <div class="bar-fill" style="width: 45%"></div>
            </div>
            <span class="nutrition-value">45%</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">维生素</span>
            <div class="nutrition-bar">
              <div class="bar-fill" style="width: 85%"></div>
            </div>
            <span class="nutrition-value">85%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" @click="handleSave">
        <el-icon><Star /></el-icon>
        收藏菜谱
      </el-button>
      <el-button size="large" @click="handleShare">
        <el-icon><Share /></el-icon>
        分享菜谱
      </el-button>
      <el-button size="large" @click="handlePrint">
        <el-icon><Printer /></el-icon>
        打印菜谱
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Recipe } from '@/types/recipe'
import { externalLinks } from '@/data/mockData'
import { ElMessage } from 'element-plus'
import {
  Timer,
  User,
  Calendar,
  ShoppingBag,
  List,
  Check,
  Lightbulb,
  Link,
  ArrowRight,
  DataAnalysis,
  PieChart,
  Star,
  Share,
  Printer,
  Apple,
  Chicken,
  Fish,
  Bowl,
  Coffee,
  VideoPlay,
  VideoCamera,
  Reading,
  Heart
} from '@element-plus/icons-vue'

interface Props {
  recipe: Recipe
}

interface Emits {
  (e: 'save', recipe: Recipe): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const completedSteps = ref<number[]>([])

// 获取分类图标
const getCategoryIcon = (category: string) => {
  const iconMap = {
    vegetables: Apple,
    meat: Chicken,
    seafood: Fish,
    staple: Bowl,
    seasoning: Coffee
  }
  return iconMap[category as keyof typeof iconMap] || Apple
}

// 获取链接图标
const getLinkIcon = (iconName: string) => {
  const iconMap = {
    VideoPlay,
    VideoCamera,
    Reading,
    Heart
  }
  return iconMap[iconName as keyof typeof iconMap] || Link
}

// 格式化日期
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 生成搜索URL
const getSearchUrl = (baseUrl: string, recipeName: string): string => {
  return baseUrl + encodeURIComponent(recipeName)
}

// 标记步骤完成
const markStepCompleted = (stepId: number) => {
  if (!completedSteps.value.includes(stepId)) {
    completedSteps.value.push(stepId)
  }
}

// 标记步骤未完成
const markStepUncompleted = (stepId: number) => {
  const index = completedSteps.value.indexOf(stepId)
  if (index > -1) {
    completedSteps.value.splice(index, 1)
  }
}

// 处理保存
const handleSave = () => {
  emit('save', props.recipe)
}

// 处理分享
const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: props.recipe.name,
      text: props.recipe.description,
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  }
}

// 处理打印
const handlePrint = () => {
  window.print()
}
</script>

<style lang="scss" scoped>
.recipe-detail {
  max-width: 800px;
  margin: 0 auto;
  
  .recipe-header {
    margin-bottom: 2rem;
    
    .recipe-name {
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .recipe-description {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .recipe-ratings {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      
      .rating-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .rating-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
      }
    }
    
    .recipe-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1rem;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        
        .el-icon {
          color: #ff6b6b;
        }
      }
    }
    
    .recipe-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
  
  .ingredients-section,
  .steps-section,
  .external-links-section,
  .nutrition-section {
    margin-bottom: 2rem;
    
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #2c3e50;
      font-size: 1.3rem;
      margin-bottom: 1rem;
      
      .el-icon {
        color: #ff6b6b;
      }
    }
    
    .section-description {
      color: #666;
      margin-bottom: 1rem;
    }
  }
  
  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    
    .ingredient-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      
      .ingredient-icon {
        color: #ff6b6b;
      }
      
      .ingredient-name {
        font-weight: 500;
      }
    }
  }
  
  .steps-list {
    .step-item {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #ff6b6b;
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.1);
      }
      
      &.completed {
        background: #f0f9ff;
        border-color: #4ecdc4;
        
        .step-number {
          background: #4ecdc4;
          color: white;
        }
      }
      
      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ff6b6b;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      .step-content {
        flex: 1;
        
        .step-title {
          font-size: 1.1rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }
        
        .step-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        
        .step-tips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #f39c12;
          font-size: 0.9rem;
          
          .el-icon {
            color: #f39c12;
          }
        }
      }
      
      .step-actions {
        display: flex;
        align-items: flex-start;
      }
    }
  }
  
  .external-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    
    .external-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--link-color);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        
        .link-icon {
          color: var(--link-color);
        }
      }
      
      .link-icon {
        font-size: 1.5rem;
        color: #666;
        transition: color 0.3s ease;
      }
      
      .link-content {
        flex: 1;
        
        .link-name {
          display: block;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.2rem;
        }
        
        .link-desc {
          display: block;
          font-size: 0.9rem;
          color: #666;
        }
      }
      
      .link-arrow {
        color: #ccc;
        transition: color 0.3s ease;
      }
      
      &:hover .link-arrow {
        color: var(--link-color);
      }
    }
  }
  
  .nutrition-section {
    .nutrition-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      
      .nutrition-chart {
        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          background: #f8f9fa;
          border-radius: 12px;
          color: #666;
          
          .el-icon {
            margin-bottom: 1rem;
          }
          
          p {
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          small {
            color: #999;
          }
        }
      }
      
      .nutrition-details {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        
        .nutrition-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .nutrition-label {
            width: 80px;
            font-size: 0.9rem;
            color: #666;
          }
          
          .nutrition-bar {
            flex: 1;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            
            .bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
              transition: width 0.3s ease;
            }
          }
          
          .nutrition-value {
            width: 40px;
            text-align: right;
            font-size: 0.9rem;
            font-weight: 500;
            color: #2c3e50;
          }
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding: 2rem 0;
    border-top: 1px solid #e9ecef;
    margin-top: 2rem;
  }
}

// 暗色主题
:global(.dark) .recipe-detail {
  .recipe-header {
    .recipe-name {
      color: #f9fafb;
    }
    
    .recipe-description {
      color: #d1d5db;
    }
    
    .rating-label {
      color: #d1d5db;
    }
    
    .meta-item {
      color: #d1d5db;
    }
  }
  
  .ingredients-section,
  .steps-section,
  .external-links-section,
  .nutrition-section {
    h2 {
      color: #f9fafb;
    }
    
    .section-description {
      color: #d1d5db;
    }
  }
  
  .ingredient-item {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .step-item {
    background: #374151;
    border-color: #4b5563;
    
    .step-title {
      color: #f9fafb;
    }
    
    .step-description {
      color: #d1d5db;
    }
  }
  
  .external-link {
    background: #374151;
    border-color: #4b5563;
    
    .link-name {
      color: #f9fafb;
    }
    
    .link-desc {
      color: #d1d5db;
    }
  }
  
  .nutrition-chart .chart-placeholder {
    background: #374151;
    color: #d1d5db;
  }
  
  .nutrition-item {
    .nutrition-label {
      color: #d1d5db;
    }
    
    .nutrition-bar {
      background: #4b5563;
    }
    
    .nutrition-value {
      color: #f9fafb;
    }
  }
  
  .action-buttons {
    border-top-color: #4b5563;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .recipe-detail {
    .recipe-header {
      .recipe-name {
        font-size: 1.5rem;
      }
      
      .recipe-ratings {
        gap: 1rem;
      }
      
      .recipe-meta {
        gap: 1rem;
      }
    }
    
    .ingredients-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .step-item {
      flex-direction: column;
      gap: 1rem;
      
      .step-number {
        align-self: flex-start;
      }
    }
    
    .external-links {
      grid-template-columns: 1fr;
    }
    
    .nutrition-content {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      flex-direction: column;
    }
  }
}

@media (max-width: 480px) {
  .recipe-detail {
    .recipe-header {
      .recipe-name {
        font-size: 1.3rem;
      }
      
      .recipe-ratings {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .recipe-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
    
    .ingredients-grid {
      grid-template-columns: 1fr;
    }
    
    .step-item {
      padding: 1rem;
    }
  }
}

// 打印样式
@media print {
  .recipe-detail {
    .action-buttons {
      display: none;
    }
    
    .external-links-section {
      display: none;
    }
    
    .step-actions {
      display: none;
    }
  }
}
</style>