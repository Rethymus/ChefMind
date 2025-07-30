<template>
  <div class="smart-recommendation" v-if="recommendations.length > 0">
    <div class="recommendation-header">
      <h3>
        <i class="fas fa-lightbulb"></i>
        智能推荐
      </h3>
      <p>基于您已选择的食材，为您推荐以下搭配</p>
    </div>
    
    <div class="recommendation-categories">
      <!-- 营养均衡推荐 -->
      <div class="recommendation-section" v-if="nutritionRecommendations.length > 0">
        <h4>
          <i class="fas fa-heart"></i>
          营养均衡推荐
        </h4>
        <div class="recommendation-items">
          <div 
            v-for="item in nutritionRecommendations" 
            :key="item.id"
            class="recommendation-item"
            :class="{ 'selected': isSelected(item.name) }"
            @click="$emit('ingredient-toggle', item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-reason">{{ item.reason }}</div>
            </div>
            <div class="item-action">
              <i class="fas fa-plus" v-if="!isSelected(item.name)"></i>
              <i class="fas fa-check" v-else></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 口味搭配推荐 -->
      <div class="recommendation-section" v-if="flavorRecommendations.length > 0">
        <h4>
          <i class="fas fa-star"></i>
          口味搭配推荐
        </h4>
        <div class="recommendation-items">
          <div 
            v-for="item in flavorRecommendations" 
            :key="item.id"
            class="recommendation-item"
            :class="{ 'selected': isSelected(item.name) }"
            @click="$emit('ingredient-toggle', item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-reason">{{ item.reason }}</div>
            </div>
            <div class="item-action">
              <i class="fas fa-plus" v-if="!isSelected(item.name)"></i>
              <i class="fas fa-check" v-else></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 经典搭配推荐 -->
      <div class="recommendation-section" v-if="classicRecommendations.length > 0">
        <h4>
          <i class="fas fa-utensils"></i>
          经典搭配推荐
        </h4>
        <div class="recommendation-items">
          <div 
            v-for="item in classicRecommendations" 
            :key="item.id"
            class="recommendation-item"
            :class="{ 'selected': isSelected(item.name) }"
            @click="$emit('ingredient-toggle', item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-reason">{{ item.reason }}</div>
            </div>
            <div class="item-action">
              <i class="fas fa-plus" v-if="!isSelected(item.name)"></i>
              <i class="fas fa-check" v-else></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 营养分析 -->
    <div class="nutrition-analysis" v-if="selectedIngredients.length > 0">
      <h4>
        <i class="fas fa-chart-pie"></i>
        营养分析
      </h4>
      <div class="nutrition-stats">
        <div class="nutrition-item">
          <div class="nutrition-label">预估卡路里</div>
          <div class="nutrition-value">{{ nutritionStats.calories }} kcal</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">蛋白质</div>
          <div class="nutrition-value">{{ nutritionStats.protein }}g</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">碳水化合物</div>
          <div class="nutrition-value">{{ nutritionStats.carbs }}g</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">脂肪</div>
          <div class="nutrition-value">{{ nutritionStats.fat }}g</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">膳食纤维</div>
          <div class="nutrition-value">{{ nutritionStats.fiber }}g</div>
        </div>
      </div>
      
      <div class="nutrition-balance">
        <div class="balance-item">
          <div class="balance-label">营养均衡度</div>
          <div class="balance-bar">
            <div class="balance-fill" :style="{ width: nutritionBalance + '%' }"></div>
          </div>
          <div class="balance-score">{{ nutritionBalance }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Ingredient } from '@/types/recipe'

interface Props {
  selectedIngredients: Ingredient[]
}

interface Emits {
  (e: 'ingredient-toggle', ingredient: Ingredient): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 智能推荐数据
const recommendationData = {
  // 营养均衡推荐规则
  nutrition: {
    '土豆': [
      { id: 201, name: '胡萝卜', category: 'vegetables', icon: '🥕', reason: '富含维生素A，与土豆搭配营养更均衡' },
      { id: 202, name: '青椒', category: 'vegetables', icon: '🫑', reason: '补充维生素C，增强免疫力' }
    ],
    '西红柿': [
      { id: 203, name: '鸡蛋', category: 'protein', icon: '🥚', reason: '经典搭配，蛋白质与维生素完美结合' },
      { id: 204, name: '洋葱', category: 'vegetables', icon: '🧅', reason: '增强抗氧化效果' }
    ],
    '白菜': [
      { id: 205, name: '豆腐', category: 'protein', icon: '🧈', reason: '植物蛋白补充，营养更全面' },
      { id: 206, name: '香菇', category: 'vegetables', icon: '🍄', reason: '增加鲜味和维生素D' }
    ]
  },
  
  // 口味搭配推荐
  flavor: {
    '茄子': [
      { id: 207, name: '蒜', category: 'seasoning', icon: '🧄', reason: '去腥增香，经典搭配' },
      { id: 208, name: '青椒', category: 'vegetables', icon: '🫑', reason: '颜色搭配美观，口感层次丰富' }
    ],
    '豆角': [
      { id: 209, name: '肉丝', category: 'meat', icon: '🥩', reason: '荤素搭配，口感更丰富' },
      { id: 210, name: '干辣椒', category: 'seasoning', icon: '🌶️', reason: '增加辣味层次' }
    ]
  },
  
  // 经典搭配推荐
  classic: {
    '鸡肉': [
      { id: 211, name: '蘑菇', category: 'vegetables', icon: '🍄', reason: '经典组合，鲜美可口' },
      { id: 212, name: '土豆', category: 'vegetables', icon: '🥔', reason: '家常搭配，营养丰富' }
    ],
    '牛肉': [
      { id: 213, name: '洋葱', category: 'vegetables', icon: '🧅', reason: '去腥增香，经典西式搭配' },
      { id: 214, name: '胡萝卜', category: 'vegetables', icon: '🥕', reason: '炖煮佳品，营养互补' }
    ]
  }
}

// 营养数据库
const nutritionDatabase = {
  // 蔬菜类 (每100g)
  '白菜': { calories: 17, protein: 1.5, carbs: 3.2, fat: 0.2, fiber: 1.2 },
  '萝卜': { calories: 16, protein: 0.9, carbs: 3.4, fat: 0.1, fiber: 1.6 },
  '土豆': { calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, fiber: 2.2 },
  '西红柿': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  '黄瓜': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  '茄子': { calories: 25, protein: 1.0, carbs: 5.9, fat: 0.2, fiber: 3.0 },
  '豆角': { calories: 35, protein: 2.8, carbs: 8.0, fat: 0.2, fiber: 2.7 },
  '青椒': { calories: 22, protein: 1.0, carbs: 5.3, fat: 0.2, fiber: 1.7 },
  '洋葱': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  '胡萝卜': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  
  // 肉类 (每100g)
  '猪肉': { calories: 242, protein: 20.3, carbs: 0, fat: 17.2, fiber: 0 },
  '牛肉': { calories: 250, protein: 26.0, carbs: 0, fat: 15.0, fiber: 0 },
  '鸡肉': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
  '羊肉': { calories: 203, protein: 25.6, carbs: 0, fat: 9.9, fiber: 0 },
  
  // 海鲜类 (每100g)
  '鱼': { calories: 206, protein: 22.0, carbs: 0, fat: 12.0, fiber: 0 },
  '虾': { calories: 106, protein: 20.0, carbs: 0.9, fat: 1.7, fiber: 0 },
  '蟹': { calories: 103, protein: 20.1, carbs: 0, fat: 1.3, fiber: 0 },
  
  // 其他
  '鸡蛋': { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 },
  '豆腐': { calories: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.4 }
}

// 计算推荐食材
const recommendations = computed(() => {
  if (props.selectedIngredients.length === 0) return []
  
  const allRecommendations = []
  
  props.selectedIngredients.forEach(ingredient => {
    // 营养推荐
    if (recommendationData.nutrition[ingredient.name]) {
      allRecommendations.push(...recommendationData.nutrition[ingredient.name])
    }
    
    // 口味推荐
    if (recommendationData.flavor[ingredient.name]) {
      allRecommendations.push(...recommendationData.flavor[ingredient.name])
    }
    
    // 经典搭配推荐
    if (recommendationData.classic[ingredient.name]) {
      allRecommendations.push(...recommendationData.classic[ingredient.name])
    }
  })
  
  // 去重并过滤已选择的食材
  const uniqueRecommendations = allRecommendations.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id) && 
    !props.selectedIngredients.some(selected => selected.name === item.name)
  )
  
  return uniqueRecommendations.slice(0, 6) // 最多显示6个推荐
})

// 分类推荐
const nutritionRecommendations = computed(() => 
  recommendations.value.filter(item => 
    props.selectedIngredients.some(selected => 
      recommendationData.nutrition[selected.name]?.some(rec => rec.id === item.id)
    )
  )
)

const flavorRecommendations = computed(() => 
  recommendations.value.filter(item => 
    props.selectedIngredients.some(selected => 
      recommendationData.flavor[selected.name]?.some(rec => rec.id === item.id)
    )
  )
)

const classicRecommendations = computed(() => 
  recommendations.value.filter(item => 
    props.selectedIngredients.some(selected => 
      recommendationData.classic[selected.name]?.some(rec => rec.id === item.id)
    )
  )
)

// 营养统计
const nutritionStats = computed(() => {
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalFiber = 0
  
  props.selectedIngredients.forEach(ingredient => {
    const nutrition = nutritionDatabase[ingredient.name]
    if (nutrition) {
      // 假设每种食材100g
      totalCalories += nutrition.calories
      totalProtein += nutrition.protein
      totalCarbs += nutrition.carbs
      totalFat += nutrition.fat
      totalFiber += nutrition.fiber
    }
  })
  
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10
  }
})

// 营养均衡度计算
const nutritionBalance = computed(() => {
  if (props.selectedIngredients.length === 0) return 0
  
  const stats = nutritionStats.value
  let score = 0
  
  // 基础分数：有食材就有30分
  score += 30
  
  // 蛋白质充足性 (20分)
  if (stats.protein >= 15) score += 20
  else if (stats.protein >= 10) score += 15
  else if (stats.protein >= 5) score += 10
  
  // 维生素丰富性 (蔬菜种类，20分)
  const vegetableCount = props.selectedIngredients.filter(ing => 
    ['vegetables'].includes(ing.category)
  ).length
  if (vegetableCount >= 3) score += 20
  else if (vegetableCount >= 2) score += 15
  else if (vegetableCount >= 1) score += 10
  
  // 营养多样性 (15分)
  const categories = [...new Set(props.selectedIngredients.map(ing => ing.category))]
  if (categories.length >= 3) score += 15
  else if (categories.length >= 2) score += 10
  else score += 5
  
  // 膳食纤维 (15分)
  if (stats.fiber >= 5) score += 15
  else if (stats.fiber >= 3) score += 10
  else if (stats.fiber >= 1) score += 5
  
  return Math.min(100, score)
})

// 检查是否已选择
const isSelected = (ingredientName: string): boolean => {
  return props.selectedIngredients.some(item => item.name === ingredientName)
}
</script>

<style lang="scss" scoped>
.smart-recommendation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  
  .recommendation-header {
    text-align: center;
    margin-bottom: 2rem;
    
    h3 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      
      i {
        color: #ffd700;
      }
    }
    
    p {
      opacity: 0.9;
      font-size: 1rem;
    }
  }
  
  .recommendation-categories {
    margin-bottom: 2rem;
  }
  
  .recommendation-section {
    margin-bottom: 2rem;
    
    h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      margin-bottom: 1rem;
      
      i {
        color: #ffd700;
      }
    }
  }
  
  .recommendation-items {
    display: grid;
    gap: 1rem;
  }
  
  .recommendation-item {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    &.selected {
      background: rgba(255, 215, 0, 0.2);
      border-color: #ffd700;
    }
    
    .item-icon {
      font-size: 1.5rem;
      width: 40px;
      text-align: center;
    }
    
    .item-info {
      flex: 1;
      
      .item-name {
        font-weight: 600;
        margin-bottom: 0.2rem;
      }
      
      .item-reason {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
    
    .item-action {
      width: 30px;
      text-align: center;
      
      i {
        font-size: 1.2rem;
        color: #ffd700;
      }
    }
  }
  
  .nutrition-analysis {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 1.5rem;
    
    h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      margin-bottom: 1rem;
      
      i {
        color: #ffd700;
      }
    }
    
    .nutrition-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .nutrition-item {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      
      .nutrition-label {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-bottom: 0.5rem;
      }
      
      .nutrition-value {
        font-size: 1.2rem;
        font-weight: 600;
        color: #ffd700;
      }
    }
    
    .nutrition-balance {
      .balance-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .balance-label {
          font-weight: 600;
          min-width: 100px;
        }
        
        .balance-bar {
          flex: 1;
          height: 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          overflow: hidden;
          
          .balance-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #ffd700, #4ecdc4);
            border-radius: 5px;
            transition: width 0.5s ease;
          }
        }
        
        .balance-score {
          font-weight: 600;
          color: #ffd700;
          min-width: 50px;
          text-align: right;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .smart-recommendation {
    padding: 1.5rem;
    
    .recommendation-item {
      padding: 0.8rem;
      
      .item-icon {
        font-size: 1.2rem;
        width: 30px;
      }
      
      .item-info {
        .item-name {
          font-size: 0.9rem;
        }
        
        .item-reason {
          font-size: 0.8rem;
        }
      }
    }
    
    .nutrition-stats {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
    
    .balance-item {
      flex-direction: column;
      gap: 0.5rem;
      
      .balance-label {
        min-width: auto;
      }
      
      .balance-bar {
        width: 100%;
      }
    }
  }
}
</style>