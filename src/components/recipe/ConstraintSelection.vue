<template>
  <div class="constraint-selection">
    <div class="step-header">
      <h2>设定约束条件</h2>
      <p>根据你的时间、人数和口味偏好，让AI为你定制最合适的菜谱</p>
    </div>
    
    <!-- 约束条件网格 -->
    <div class="constraints-grid">
      <!-- 时间约束 -->
      <div class="constraint-group">
        <h3>
          <el-icon><Timer /></el-icon>
          烹饪时间
        </h3>
        <div class="constraint-options">
          <div
            v-for="option in timeOptions"
            :key="option.value"
            class="constraint-item"
            :class="{ selected: constraints.time === option.value }"
            @click="updateConstraint('time', option.value)"
          >
            <div class="option-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-desc">{{ option.description }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 人数约束 -->
      <div class="constraint-group">
        <h3>
          <el-icon><User /></el-icon>
          用餐人数
        </h3>
        <div class="constraint-options">
          <div
            v-for="option in peopleOptions"
            :key="option.value"
            class="constraint-item"
            :class="{ selected: constraints.people === option.value }"
            @click="updateConstraint('people', option.value)"
          >
            <div class="option-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-desc">{{ option.description }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 难度约束 -->
      <div class="constraint-group">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          制作难度
        </h3>
        <div class="constraint-options">
          <div
            v-for="option in difficultyOptions"
            :key="option.value"
            class="constraint-item"
            :class="{ selected: getDifficultySelected(option.value) }"
            @click="updateConstraint('difficulty', option.value)"
          >
            <div class="option-icon">
              <el-icon>
                <component :is="getDifficultyIcon(option.value)" />
              </el-icon>
            </div>
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-desc">{{ option.description }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 口味约束 -->
      <div class="constraint-group">
        <h3>
          <el-icon><Food /></el-icon>
          口味偏好
        </h3>
        <div class="constraint-options">
          <div
            v-for="option in tasteOptions"
            :key="option.value"
            class="constraint-item"
            :class="{ selected: constraints.taste === option.value }"
            @click="updateConstraint('taste', option.value)"
          >
            <div class="option-icon">
              <el-icon>
                <component :is="getTasteIcon(option.value)" />
              </el-icon>
            </div>
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-desc">{{ option.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 选择总结 -->
    <div class="selection-summary">
      <h3>
        <el-icon><List /></el-icon>
        选择总结
      </h3>
      <div class="summary-content">
        <div class="summary-item">
          <span class="summary-label">烹饪时间：</span>
          <span class="summary-value">
            {{ getSelectedLabel('time') || '未选择' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">用餐人数：</span>
          <span class="summary-value">
            {{ getSelectedLabel('people') || '未选择' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">制作难度：</span>
          <span class="summary-value">
            {{ getSelectedLabel('difficulty') || '未选择' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">口味偏好：</span>
          <span class="summary-value">
            {{ getSelectedLabel('taste') || '未选择' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 智能建议 -->
    <div class="smart-suggestions">
      <el-alert
        title="智能建议"
        type="success"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="suggestions-content">
            <p v-if="!hasAnySelection">
              请选择至少一个约束条件，AI将为你生成更精准的菜谱推荐
            </p>
            <div v-else>
              <p>根据你的选择，AI建议：</p>
              <ul class="suggestion-list">
                <li v-for="suggestion in smartSuggestions" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Constraints } from '@/types/recipe'
import {
  Timer,
  Clock,
  User,
  UserFilled,
  TrendCharts,
  Food,
  List,
  Star,
  Lightning,
  Coffee,
  Warning
} from '@element-plus/icons-vue'

interface Props {
  constraints: Constraints
}

type Emits = {
  'constraint-update': [constraints: Constraints]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 时间选项
const timeOptions = [
  {
    value: '15',
    label: '15分钟内',
    description: '快手菜，简单易做'
  },
  {
    value: '30',
    label: '30分钟内',
    description: '家常菜，营养均衡'
  },
  {
    value: '60',
    label: '1小时内',
    description: '精心制作，口感丰富'
  },
  {
    value: 'unlimited',
    label: '不限时间',
    description: '慢工出细活，追求完美'
  }
]

// 人数选项
const peopleOptions = [
  {
    value: '1-2',
    label: '1-2人',
    description: '小份量，精致搭配'
  },
  {
    value: '3-4',
    label: '3-4人',
    description: '家庭聚餐，丰富多样'
  },
  {
    value: '5-6',
    label: '5-6人',
    description: '朋友聚会，分量充足'
  },
  {
    value: '6+',
    label: '6人以上',
    description: '大型聚餐，菜品丰盛'
  }
]

// 难度选项
const difficultyOptions = [
  {
    value: 'easy',
    label: '简单',
    description: '新手友好，零失败'
  },
  {
    value: 'medium',
    label: '中等',
    description: '有一定技巧，成就感强'
  },
  {
    value: 'hard',
    label: '困难',
    description: '挑战自我，专业水准'
  },
  {
    value: 'any',
    label: '不限',
    description: '接受任何难度挑战'
  }
]

// 口味选项
const tasteOptions = [
  {
    value: 'light',
    label: '清淡',
    description: '少油少盐，健康养生'
  },
  {
    value: 'medium',
    label: '适中',
    description: '口味均衡，老少皆宜'
  },
  {
    value: 'strong',
    label: '重口味',
    description: '浓郁香辣，刺激味蕾'
  }
]

// 获取难度图标
const getDifficultyIcon = (difficulty: string) => {
  const iconMap = {
    easy: Star,
    medium: Lightning,
    hard: Warning,
    any: TrendCharts
  }
  return iconMap[difficulty as keyof typeof iconMap] || Star
}

// 检查难度是否被选中
const getDifficultySelected = (value: string) => {
  // 特殊处理 'any' 选项（对应 difficulty: null）
  if (value === 'any') {
    return props.constraints.difficulty === null
  }
  
  // 检查数字类型的难度值
  if (props.constraints.difficulty !== undefined && props.constraints.difficulty !== null) {
    const difficultyMap: Record<number, string> = {
      1: 'easy',
      3: 'medium',
      5: 'hard'
    }
    return difficultyMap[props.constraints.difficulty] === value
  }
  
  return false
}

// 获取口味图标
const getTasteIcon = (taste: string) => {
  const iconMap = {
    light: Coffee,
    medium: Food,
    strong: Warning
  }
  return iconMap[taste as keyof typeof iconMap] || Food
}

// 更新约束条件
const updateConstraint = (type: keyof Constraints, value: string) => {
  const newConstraints = { ...props.constraints }
  
  // 检查是否是取消选择（点击已选中的项目）
  let isDeselecting = false
  
  if (type === 'difficulty') {
    // 特殊处理难度的取消选择逻辑
    isDeselecting = getDifficultySelected(value)
  } else {
    isDeselecting = props.constraints[type] === value
  }
  
  if (isDeselecting) {
    // 取消选择 - 清空相关字段
    clearConstraintFields(newConstraints, type)
  } else {
    // 新选择 - 设置相关字段
    setConstraintFields(newConstraints, type, value)
  }
  
  emit('constraint-update', newConstraints)
}

// 清空约束条件字段
const clearConstraintFields = (constraints: Constraints, type: keyof Constraints) => {
  switch (type) {
    case 'time':
      constraints.cookingTime = null
      constraints.time = null
      break
    case 'people':
      constraints.servings = null
      constraints.people = null
      break
    case 'difficulty':
      constraints.difficulty = null
      break
    case 'taste':
      constraints.taste = null
      break
    default:
      (constraints as any)[type] = null
  }
}

// 设置约束条件字段
const setConstraintFields = (constraints: Constraints, type: keyof Constraints, value: string) => {
  switch (type) {
    case 'time':
      setTimeConstraint(constraints, value)
      break
    case 'people':
      setPeopleConstraint(constraints, value)
      break
    case 'difficulty':
      setDifficultyConstraint(constraints, value)
      break
    case 'taste':
      constraints.taste = value
      break
    default:
      (constraints as any)[type] = value
  }
}

// 设置时间约束
const setTimeConstraint = (constraints: Constraints, value: string) => {
  if (value === 'unlimited') {
    constraints.cookingTime = null
    constraints.time = value
  } else {
    constraints.cookingTime = parseInt(value)
    constraints.time = value
  }
}

// 设置人数约束
const setPeopleConstraint = (constraints: Constraints, value: string) => {
  const servingsMap: Record<string, number> = {
    '1-2': 2,
    '3-4': 4, 
    '5-6': 6,
    '6+': 8
  }
  constraints.servings = servingsMap[value] || null
  constraints.people = value
}

// 设置难度约束
const setDifficultyConstraint = (constraints: Constraints, value: string) => {
  const difficultyMap: Record<string, number | null> = {
    'easy': 1,
    'medium': 3,
    'hard': 5,
    'any': null
  }
  constraints.difficulty = difficultyMap[value] ?? null
}

// 获取选中项的标签
const getSelectedLabel = (type: keyof Constraints): string => {
  // 特殊处理难度字段
  if (type === 'difficulty') {
    if (props.constraints.difficulty === null) {
      return difficultyOptions.find(opt => opt.value === 'any')?.label || ''
    } else if (props.constraints.difficulty !== undefined && props.constraints.difficulty !== null) {
      const difficultyMap: Record<number, string> = {
        1: 'easy',
        3: 'medium',
        5: 'hard'
      }
      const difficultyValue = difficultyMap[props.constraints.difficulty]
      return difficultyOptions.find(opt => opt.value === difficultyValue)?.label || ''
    }
    return ''
  }
  
  // 处理其他字段
  const value = props.constraints[type]
  if (!value) return ''
  
  const optionsMap = {
    time: timeOptions,
    people: peopleOptions,
    taste: tasteOptions
  }
  
  const option = optionsMap[type as keyof typeof optionsMap]?.find((opt: any) => opt.value === value)
  return option?.label || ''
}

// 是否有任何选择
const hasAnySelection = computed(() => {
  return Object.values(props.constraints).some(value => value !== null)
})

// 智能建议
const smartSuggestions = computed(() => {
  const suggestions: string[] = []
  
  if (props.constraints.time === '15') {
    suggestions.push('推荐选择炒制类菜品，快速出菜')
  } else if (props.constraints.time === '60' || props.constraints.time === 'unlimited') {
    suggestions.push('可以尝试炖煮类菜品，营养更丰富')
  }
  
  if (props.constraints.people === '1-2') {
    suggestions.push('建议选择简单食材，避免浪费')
  } else if (props.constraints.people === '6+') {
    suggestions.push('推荐制作大份量菜品，可以批量处理')
  }
  
  if (props.constraints.difficulty === 1) {
    return 'easy'
  } else if (props.constraints.difficulty === 5) {
    return 'hard'
  }
  
  if (props.constraints.taste === 'light') {
    suggestions.push('减少调料使用，突出食材本味')
  } else if (props.constraints.taste === 'strong') {
    suggestions.push('可以使用更多香料和调味料')
  }
  
  return suggestions.length > 0 ? suggestions : ['根据你的选择，AI将为你推荐最合适的菜谱']
})
</script>

<style lang="scss" scoped>
.constraint-selection {
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
  
  .constraints-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .constraint-group {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.2rem;
      
      .el-icon {
        color: #ff6b6b;
      }
    }
    
    .constraint-options {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    
    .constraint-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #ff6b6b;
        transform: translateX(5px);
        box-shadow: 0 3px 10px rgba(255, 107, 107, 0.2);
      }
      
      &.selected {
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
        color: white;
        border-color: #ff6b6b;
        
        .option-icon {
          color: white;
        }
        
        .option-desc {
          color: rgba(255, 255, 255, 0.9);
        }
      }
      
      .option-icon {
        font-size: 1.5rem;
        color: #ff6b6b;
        flex-shrink: 0;
      }
      
      .option-content {
        flex: 1;
        
        .option-label {
          display: block;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }
        
        .option-desc {
          display: block;
          font-size: 0.85rem;
          color: #666;
          line-height: 1.3;
        }
      }
    }
  }
  
  .selection-summary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      
      .el-icon {
        color: #ffd700;
      }
    }
    
    .summary-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      
      .summary-label {
        font-size: 0.9rem;
        opacity: 0.8;
      }
      
      .summary-value {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }
  
  .smart-suggestions {
    .suggestions-content {
      .suggestion-list {
        margin: 0.5rem 0 0 0;
        padding-left: 1.2rem;
        
        li {
          margin-bottom: 0.3rem;
          line-height: 1.4;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

// 暗色主题
:global(.dark) .constraint-selection {
  .step-header {
    h2 {
      color: #f9fafb;
    }
    
    p {
      color: #d1d5db;
    }
  }
  
  .constraint-group {
    background: #374151;
    
    h3 {
      color: #f9fafb;
    }
    
    .constraint-item {
      border-color: #4b5563;
      color: #f9fafb;
      
      &:hover {
        border-color: #ff6b6b;
      }
      
      .option-desc {
        color: #d1d5db;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .constraint-selection {
    .constraints-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .constraint-group {
      padding: 1rem;
    }
    
    .constraint-item {
      padding: 0.8rem;
      
      .option-icon {
        font-size: 1.3rem;
      }
      
      .option-content {
        .option-label {
          font-size: 0.95rem;
        }
        
        .option-desc {
          font-size: 0.8rem;
        }
      }
    }
    
    .summary-content {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }
    
    .selection-summary {
      padding: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .constraint-selection {
    .step-header {
      h2 {
        font-size: 1.5rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
    
    .constraint-item {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
      
      .option-content {
        .option-label {
          font-size: 0.9rem;
        }
        
        .option-desc {
          font-size: 0.75rem;
        }
      }
    }
  }
}
</style>