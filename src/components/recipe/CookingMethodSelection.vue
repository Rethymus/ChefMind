<template>
  <div class="cooking-method-selection">
    <div class="step-header">
      <h2>选择烹饪方式</h2>
      <p>根据你的喜好和食材特点，选择最适合的烹饪方法</p>
    </div>
    
    <!-- 已选烹饪方式 -->
    <div class="selected-section">
      <h3>
        <el-icon><Operation /></el-icon>
        已选烹饪方式 ({{ selectedMethods.length }})
      </h3>
      <div class="method-tags">
        <el-tag
          v-for="method in selectedMethods"
          :key="method.id"
          type="warning"
          size="large"
          closable
          effect="dark"
          @close="handleRemoveMethod(method)"
        >
          <el-icon>
            <component :is="getMethodIcon(method.icon)" />
          </el-icon>
          {{ method.name }}
        </el-tag>
        <div v-if="selectedMethods.length === 0" class="empty-state">
          <el-icon><Plus /></el-icon>
          <span>请选择烹饪方式</span>
        </div>
      </div>
    </div>
    
    <!-- AI推荐方式 -->
    <div v-if="recommendations.length > 0" class="recommendations-section">
      <h3>
        <el-icon><Star /></el-icon>
        AI推荐方式
      </h3>
      <div class="recommendation-cards">
        <div
          v-for="rec in recommendations"
          :key="rec.method.id"
          class="recommendation-card"
          @click="handleAddRecommendation(rec.method)"
        >
          <div class="rec-icon">
            <el-icon>
              <component :is="getMethodIcon(rec.method.icon)" />
            </el-icon>
          </div>
          <div class="rec-content">
            <h4>{{ rec.method.name }}</h4>
            <p>{{ rec.reason }}</p>
            <div class="rec-score">
              <el-rate
                v-model="rec.score"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}分"
              />
            </div>
          </div>
          <el-button type="primary" size="small" circle>
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 烹饪方式网格 -->
    <div class="methods-section">
      <h3>
        <el-icon><Grid /></el-icon>
        所有烹饪方式
      </h3>
      <div class="methods-grid">
        <div
          v-for="method in cookingMethods"
          :key="method.id"
          class="method-card"
          :class="{ selected: isSelected(method) }"
          @click="handleToggleMethod(method)"
        >
          <div class="method-icon">
            <el-icon :size="32">
              <component :is="getMethodIcon(method.icon)" />
            </el-icon>
          </div>
          <div class="method-content">
            <h4>{{ method.name }}</h4>
            <p>{{ method.description }}</p>
          </div>
          <div v-if="isSelected(method)" class="selected-indicator">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 烹饪技巧提示 -->
    <div class="tips-section">
      <el-alert
        title="烹饪小贴士"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul class="tips-list">
            <li>可以选择多种烹饪方式组合，创造更丰富的口感</li>
            <li>根据食材特性选择，如嫩菜适合炒制，硬菜适合炖煮</li>
            <li>考虑时间因素，快手菜选择炒、煎，慢工出细活选择炖、焖</li>
            <li>健康优先可选择蒸、煮，追求口感可选择炸、烤</li>
          </ul>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { cookingMethods } from '@/data/mockData'
import type { CookingMethod } from '@/types/recipe'
import {
  Operation,
  Plus,
  Star,
  Grid,
  Check,
  Fire,
  Coffee,
  Cloudy,
  Sunny,
  Lightning,
  Timer,
  Refrigerator,
  Bowl
} from '@element-plus/icons-vue'

interface Props {
  selectedMethods: CookingMethod[]
}

interface Emits {
  (e: 'method-toggle', method: CookingMethod): void
}

interface Recommendation {
  method: CookingMethod
  reason: string
  score: number
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const recommendations = ref<Recommendation[]>([])

// 图标映射
const iconMap = {
  Fire,
  Mug: Coffee,
  Cloudy,
  Sunny,
  Lightning,
  Timer,
  Refrigerator,
  Bowl
}

// 获取方法图标
const getMethodIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Fire
}

// 检查方法是否已选择
const isSelected = (method: CookingMethod): boolean => {
  return props.selectedMethods.some(item => item.id === method.id)
}

// 处理方法切换
const handleToggleMethod = (method: CookingMethod) => {
  emit('method-toggle', method)
}

// 处理移除方法
const handleRemoveMethod = (method: CookingMethod) => {
  emit('method-toggle', method)
}

// 处理添加推荐方法
const handleAddRecommendation = (method: CookingMethod) => {
  if (!isSelected(method)) {
    emit('method-toggle', method)
  }
}

// 生成AI推荐
const generateRecommendations = () => {
  if (props.selectedMethods.length >= 3) {
    recommendations.value = []
    return
  }
  
  // 简单的推荐逻辑
  const availableMethods = cookingMethods.filter(method => 
    !isSelected(method)
  )
  
  const recs: Recommendation[] = []
  
  // 如果没有选择任何方法，推荐常用方法
  if (props.selectedMethods.length === 0) {
    recs.push(
      {
        method: availableMethods.find(m => m.name === '炒')!,
        reason: '最常用的烹饪方式，适合大多数食材',
        score: 4.8
      },
      {
        method: availableMethods.find(m => m.name === '煮')!,
        reason: '健康营养，保持食材原味',
        score: 4.5
      },
      {
        method: availableMethods.find(m => m.name === '蒸')!,
        reason: '营养流失少，口感清淡',
        score: 4.3
      }
    )
  } else {
    // 根据已选方法推荐互补方法
    const hasQuickMethod = props.selectedMethods.some(m => 
      ['炒', '煎', '炸'].includes(m.name)
    )
    const hasSlowMethod = props.selectedMethods.some(m => 
      ['炖', '焖', '煮'].includes(m.name)
    )
    
    if (hasQuickMethod && !hasSlowMethod) {
      const stewMethod = availableMethods.find(m => m.name === '炖')
      if (stewMethod) {
        recs.push({
          method: stewMethod,
          reason: '搭配慢炖方式，丰富口感层次',
          score: 4.2
        })
      }
    }
    
    if (hasSlowMethod && !hasQuickMethod) {
      const stirFryMethod = availableMethods.find(m => m.name === '炒')
      if (stirFryMethod) {
        recs.push({
          method: stirFryMethod,
          reason: '添加快炒方式，增加脆嫩口感',
          score: 4.4
        })
      }
    }
  }
  
  recommendations.value = recs.filter(r => r.method).slice(0, 3)
}

// 监听已选方法变化
watch(
  () => props.selectedMethods,
  () => {
    generateRecommendations()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.cooking-method-selection {
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
    
    .method-tags {
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
  
  .recommendations-section {
    margin-bottom: 2rem;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.1rem;
    }
    
    .recommendation-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .recommendation-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 15px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      }
      
      .rec-icon {
        font-size: 2rem;
        opacity: 0.9;
      }
      
      .rec-content {
        flex: 1;
        
        h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }
        
        p {
          margin: 0 0 0.5rem 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }
        
        .rec-score {
          :deep(.el-rate) {
            .el-rate__text {
              color: white;
            }
          }
        }
      }
    }
  }
  
  .methods-section {
    margin-bottom: 2rem;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.2rem;
    }
    
    .methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    
    .method-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 15px;
      padding: 2rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      &:hover {
        border-color: #ff6b6b;
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(255, 107, 107, 0.2);
      }
      
      &.selected {
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
        color: white;
        border-color: #ff6b6b;
        
        .method-icon {
          color: white;
        }
        
        .selected-indicator {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      
      .method-icon {
        color: #ff6b6b;
        margin-bottom: 1rem;
      }
      
      .method-content {
        h4 {
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
        }
        
        p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.4;
        }
      }
      
      &.selected .method-content p {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
  
  .tips-section {
    .tips-list {
      margin: 0;
      padding-left: 1.2rem;
      
      li {
        margin-bottom: 0.5rem;
        line-height: 1.5;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 暗色主题
:global(.dark) .cooking-method-selection {
  .step-header {
    h2 {
      color: #f9fafb;
    }
    
    p {
      color: #d1d5db;
    }
  }
  
  .selected-section,
  .recommendations-section,
  .methods-section {
    h3 {
      color: #f9fafb;
    }
    
    .method-tags {
      background: #374151;
      border-color: #4b5563;
      
      .empty-state {
        color: #9ca3af;
      }
    }
  }
  
  .method-card {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
    
    &:hover {
      border-color: #ff6b6b;
    }
    
    .method-content p {
      color: #d1d5db;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .cooking-method-selection {
    .methods-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .method-card {
      padding: 1.5rem 1rem;
      
      .method-content {
        h4 {
          font-size: 1.1rem;
        }
        
        p {
          font-size: 0.85rem;
        }
      }
    }
    
    .recommendation-cards {
      grid-template-columns: 1fr;
    }
    
    .recommendation-card {
      padding: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .cooking-method-selection {
    .step-header {
      h2 {
        font-size: 1.5rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
    
    .methods-grid {
      grid-template-columns: 1fr;
    }
    
    .method-card {
      padding: 1.2rem 0.8rem;
    }
  }
}
</style>