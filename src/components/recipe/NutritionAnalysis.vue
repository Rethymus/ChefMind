<template>
  <div class="nutrition-analysis">
    <div class="nutrition-header">
      <h3>
        <el-icon><DataAnalysis /></el-icon>
        营养分析与健康建议
      </h3>
      <div class="analysis-toggle">
        <button 
          class="toggle-btn"
          :class="{ active: showDetailed }"
          @click="showDetailed = !showDetailed"
        >
          <el-icon><PieChart /></el-icon>
          {{ showDetailed ? '简化视图' : '详细分析' }}
        </button>
      </div>
    </div>

    <!-- 营养概览卡片 -->
    <div class="nutrition-overview">
      <div class="overview-card calories">
        <div class="card-icon">
          <el-icon><Sunny /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalCalories }}</div>
          <div class="card-label">总卡路里</div>
          <div class="card-unit">kcal</div>
        </div>
        <div class="card-status" :class="getCalorieStatus()">
          {{ getCalorieStatusText() }}
        </div>
      </div>

      <div class="overview-card protein">
        <div class="card-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalProtein }}</div>
          <div class="card-label">蛋白质</div>
          <div class="card-unit">g</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: getProteinProgress() + '%' }"></div>
        </div>
      </div>

      <div class="overview-card carbs">
        <div class="card-icon">
          <el-icon><Food /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalCarbs }}</div>
          <div class="card-label">碳水化合物</div>
          <div class="card-unit">g</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: getCarbsProgress() + '%' }"></div>
        </div>
      </div>

      <div class="overview-card fat">
        <div class="card-icon">
          <el-icon><Drizzling /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalFat }}</div>
          <div class="card-label">脂肪</div>
          <div class="card-unit">g</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: getFatProgress() + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 营养成分饼图 -->
    <div class="nutrition-chart" v-if="showDetailed">
      <h4>营养成分分布</h4>
      <div class="chart-container">
        <canvas ref="nutritionChart" width="300" height="300"></canvas>
        <div class="chart-legend">
          <div class="legend-item protein">
            <div class="legend-color"></div>
            <span>蛋白质 {{ proteinPercentage }}%</span>
          </div>
          <div class="legend-item carbs">
            <div class="legend-color"></div>
            <span>碳水化合物 {{ carbsPercentage }}%</span>
          </div>
          <div class="legend-item fat">
            <div class="legend-color"></div>
            <span>脂肪 {{ fatPercentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细营养信息 -->
    <div class="detailed-nutrition" v-if="showDetailed">
      <h4>详细营养成分</h4>
      <div class="nutrition-grid">
        <div class="nutrition-item" v-for="nutrient in detailedNutrients" :key="nutrient.name">
          <div class="nutrient-info">
            <div class="nutrient-name">{{ nutrient.name }}</div>
            <div class="nutrient-value">{{ nutrient.value }}{{ nutrient.unit }}</div>
          </div>
          <div class="nutrient-bar">
            <div 
              class="nutrient-fill"
              :style="{ 
                width: nutrient.percentage + '%',
                backgroundColor: nutrient.color 
              }"
            ></div>
          </div>
          <div class="nutrient-status" :class="nutrient.status">
            {{ nutrient.statusText }}
          </div>
        </div>
      </div>
    </div>

    <!-- 健康建议 -->
    <div class="health-suggestions">
      <h4>
        <el-icon><User /></el-icon>
        个性化健康建议
      </h4>
      
      <!-- 用户信息设置 -->
      <div class="user-profile" v-if="!userProfile.isSet">
        <div class="profile-prompt">
          <p>为了提供更准确的健康建议，请设置您的基本信息：</p>
          <button class="setup-btn" @click="showProfileModal = true">
            <el-icon><Setting /></el-icon>
            设置个人信息
          </button>
        </div>
      </div>

      <!-- 健康建议列表 -->
      <div class="suggestions-list" v-if="userProfile.isSet">
        <div 
          class="suggestion-card"
          v-for="suggestion in healthSuggestions"
          :key="suggestion.id"
          :class="suggestion.type"
        >
          <div class="suggestion-icon">
            <!-- 根据图标类型显示 -->
            <el-icon v-if="suggestion.icon === 'Warning'"><Warning /></el-icon>
            <el-icon v-else-if="suggestion.icon === 'TrendCharts'"><TrendCharts /></el-icon>
            <span v-else>{{ suggestion.icon }}</span>
          </div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-description">{{ suggestion.description }}</div>
            <div class="suggestion-action" v-if="suggestion.action">
              <button class="action-btn" @click="applySuggestion(suggestion)">
                {{ suggestion.action }}
              </button>
            </div>
          </div>
          <div class="suggestion-priority" :class="suggestion.priority">
            {{ getPriorityText(suggestion.priority) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 营养目标追踪 -->
    <div class="nutrition-goals" v-if="userProfile.isSet">
      <h4>
        <el-icon><Aim /></el-icon>
        营养目标追踪
      </h4>
      <div class="goals-grid">
        <div class="goal-item" v-for="goal in nutritionGoals" :key="goal.name">
          <div class="goal-header">
            <span class="goal-name">{{ goal.name }}</span>
            <span class="goal-progress">{{ goal.current }}/{{ goal.target }}{{ goal.unit }}</span>
          </div>
          <div class="goal-bar">
            <div 
              class="goal-fill"
              :style="{ 
                width: Math.min((goal.current / goal.target) * 100, 100) + '%',
                backgroundColor: getGoalColor(goal.current / goal.target)
              }"
            ></div>
          </div>
          <div class="goal-status">
            {{ getGoalStatus(goal.current, goal.target) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 用户信息设置模态框 -->
    <div class="modal" v-if="showProfileModal" @click="closeProfileModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>设置个人信息</h3>
          <button class="modal-close" @click="closeProfileModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>性别</label>
              <select v-model="profileForm.gender" class="form-select">
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄</label>
              <input 
                type="number" 
                v-model="profileForm.age"
                class="form-input"
                min="1"
                max="120"
              >
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>身高 (cm)</label>
              <input 
                type="number" 
                v-model="profileForm.height"
                class="form-input"
                min="100"
                max="250"
              >
            </div>
            <div class="form-group">
              <label>体重 (kg)</label>
              <input 
                type="number" 
                v-model="profileForm.weight"
                class="form-input"
                min="30"
                max="200"
                step="0.1"
              >
            </div>
          </div>
          <div class="form-group">
            <label>活动水平</label>
            <select v-model="profileForm.activityLevel" class="form-select">
              <option value="sedentary">久坐不动</option>
              <option value="light">轻度活动</option>
              <option value="moderate">中度活动</option>
              <option value="active">高度活动</option>
              <option value="very_active">极高活动</option>
            </select>
          </div>
          <div class="form-group">
            <label>健康目标</label>
            <select v-model="profileForm.healthGoal" class="form-select">
              <option value="maintain">维持体重</option>
              <option value="lose">减重</option>
              <option value="gain">增重</option>
              <option value="muscle">增肌</option>
              <option value="health">改善健康</option>
            </select>
          </div>
          <div class="form-group">
            <label>饮食偏好</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="profileForm.preferences.vegetarian">
                <span class="checkmark"></span>
                素食主义
              </label>
              <label class="checkbox-item">
                <input type="checkbox" v-model="profileForm.preferences.lowSodium">
                <span class="checkmark"></span>
                低盐饮食
              </label>
              <label class="checkbox-item">
                <input type="checkbox" v-model="profileForm.preferences.lowSugar">
                <span class="checkmark"></span>
                低糖饮食
              </label>
              <label class="checkbox-item">
                <input type="checkbox" v-model="profileForm.preferences.highProtein">
                <span class="checkmark"></span>
                高蛋白饮食
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeProfileModal">取消</button>
          <button class="btn btn-primary" @click="saveProfile">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { ElCard, ElProgress, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElIcon } from 'element-plus'
import { DataAnalysis, PieChart, Sunny, TrendCharts, Food, Drizzling, User, Setting, Warning, Aim } from '@element-plus/icons-vue'

interface NutrientInfo {
  name: string
  value: number
  unit: string
  percentage: number
  color: string
  status: 'low' | 'normal' | 'high'
  statusText: string
}

interface HealthSuggestion {
  id: string
  type: 'warning' | 'info' | 'success' | 'tip'
  icon: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action?: string
}

interface NutritionGoal {
  name: string
  current: number
  target: number
  unit: string
}

interface UserProfile {
  isSet: boolean
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  healthGoal: 'maintain' | 'lose' | 'gain' | 'muscle' | 'health'
  preferences: {
    vegetarian: boolean
    lowSodium: boolean
    lowSugar: boolean
    highProtein: boolean
  }
}

// 响应式数据
const recipeStore = useRecipeStore()
const showDetailed = ref(false)
const showProfileModal = ref(false)
const nutritionChart = ref<HTMLCanvasElement>()

// 用户信息
const userProfile = ref<UserProfile>({
  isSet: false,
  gender: 'male',
  age: 30,
  height: 170,
  weight: 65,
  activityLevel: 'moderate',
  healthGoal: 'maintain',
  preferences: {
    vegetarian: false,
    lowSodium: false,
    lowSugar: false,
    highProtein: false
  }
})

const profileForm = ref<UserProfile>({ ...userProfile.value })

// 营养数据计算
const totalCalories = computed(() => {
  if (!recipeStore.selectedIngredients.length) return 0
  return Math.round(recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'calories')
  }, 0))
})

const totalProtein = computed(() => {
  if (!recipeStore.selectedIngredients.length) return 0
  return Math.round(recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'protein')
  }, 0) * 10) / 10
})

const totalCarbs = computed(() => {
  if (!recipeStore.selectedIngredients.length) return 0
  return Math.round(recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'carbs')
  }, 0) * 10) / 10
})

const totalFat = computed(() => {
  if (!recipeStore.selectedIngredients.length) return 0
  return Math.round(recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'fat')
  }, 0) * 10) / 10
})

// 营养成分百分比
const proteinPercentage = computed(() => {
  const total = totalProtein.value * 4 + totalCarbs.value * 4 + totalFat.value * 9
  return total > 0 ? Math.round((totalProtein.value * 4 / total) * 100) : 0
})

const carbsPercentage = computed(() => {
  const total = totalProtein.value * 4 + totalCarbs.value * 4 + totalFat.value * 9
  return total > 0 ? Math.round((totalCarbs.value * 4 / total) * 100) : 0
})

const fatPercentage = computed(() => {
  const total = totalProtein.value * 4 + totalCarbs.value * 4 + totalFat.value * 9
  return total > 0 ? Math.round((totalFat.value * 9 / total) * 100) : 0
})

// 详细营养成分
const detailedNutrients = computed((): NutrientInfo[] => {
  return [
    {
      name: '维生素C',
      value: Math.round(getTotalVitaminC() * 10) / 10,
      unit: 'mg',
      percentage: Math.min((getTotalVitaminC() / 90) * 100, 100),
      color: '#ff6b6b',
      status: getTotalVitaminC() < 60 ? 'low' : getTotalVitaminC() > 120 ? 'high' : 'normal',
      statusText: getTotalVitaminC() < 60 ? '偏低' : getTotalVitaminC() > 120 ? '充足' : '正常'
    },
    {
      name: '钙',
      value: Math.round(getTotalCalcium()),
      unit: 'mg',
      percentage: Math.min((getTotalCalcium() / 1000) * 100, 100),
      color: '#4ecdc4',
      status: getTotalCalcium() < 600 ? 'low' : getTotalCalcium() > 1200 ? 'high' : 'normal',
      statusText: getTotalCalcium() < 600 ? '偏低' : getTotalCalcium() > 1200 ? '充足' : '正常'
    },
    {
      name: '铁',
      value: Math.round(getTotalIron() * 10) / 10,
      unit: 'mg',
      percentage: Math.min((getTotalIron() / 15) * 100, 100),
      color: '#ffc107',
      status: getTotalIron() < 10 ? 'low' : getTotalIron() > 20 ? 'high' : 'normal',
      statusText: getTotalIron() < 10 ? '偏低' : getTotalIron() > 20 ? '充足' : '正常'
    },
    {
      name: '纤维',
      value: Math.round(getTotalFiber() * 10) / 10,
      unit: 'g',
      percentage: Math.min((getTotalFiber() / 25) * 100, 100),
      color: '#28a745',
      status: getTotalFiber() < 15 ? 'low' : getTotalFiber() > 30 ? 'high' : 'normal',
      statusText: getTotalFiber() < 15 ? '偏低' : getTotalFiber() > 30 ? '充足' : '正常'
    },
    {
      name: '钠',
      value: Math.round(getTotalSodium()),
      unit: 'mg',
      percentage: Math.min((getTotalSodium() / 2300) * 100, 100),
      color: '#dc3545',
      status: getTotalSodium() < 1500 ? 'low' : getTotalSodium() > 2300 ? 'high' : 'normal',
      statusText: getTotalSodium() < 1500 ? '偏低' : getTotalSodium() > 2300 ? '偏高' : '正常'
    }
  ]
})

// 健康建议
const healthSuggestions = computed((): HealthSuggestion[] => {
  const suggestions: HealthSuggestion[] = []
  
  // 卡路里建议
  const dailyCalories = calculateDailyCalories()
  if (totalCalories.value > dailyCalories * 0.4) {
    suggestions.push({
      id: 'high-calories',
      type: 'warning',
      icon: 'Warning',
      title: '卡路里偏高',
      description: `这餐的卡路里(${totalCalories.value})较高，建议适量食用或增加运动。`,
      priority: 'high',
      action: '查看低卡替代'
    })
  }
  
  // 蛋白质建议
  const dailyProtein = calculateDailyProtein()
  if (totalProtein.value < dailyProtein * 0.2) {
    suggestions.push({
      id: 'low-protein',
      type: 'info',
      icon: 'TrendCharts',
      title: '蛋白质不足',
      description: '建议增加蛋白质含量丰富的食材，如鸡蛋、豆腐、瘦肉等。',
      priority: 'medium',
      action: '推荐高蛋白食材'
    })
  }
  
  // 蔬菜建议
  const vegetableCount = recipeStore.selectedIngredients.filter(ing => 
    ing.category === 'vegetables'
  ).length
  if (vegetableCount < 3) {
    suggestions.push({
      id: 'more-vegetables',
      type: 'tip',
      icon: '🥬',
      title: '增加蔬菜摄入',
      description: '建议增加更多蔬菜，以获得丰富的维生素和纤维。',
      priority: 'medium',
      action: '推荐蔬菜搭配'
    })
  }
  
  // 钠含量建议
  if (getTotalSodium() > 1000) {
    suggestions.push({
      id: 'high-sodium',
      type: 'warning',
      icon: '💧',
      title: '钠含量偏高',
      description: '建议减少盐分摄入，多喝水，选择低钠调料。',
      priority: 'high',
      action: '低钠烹饪建议'
    })
  }
  
  // 营养均衡建议
  if (proteinPercentage.value < 15 || proteinPercentage.value > 35) {
    suggestions.push({
      id: 'protein-balance',
      type: 'info',
      icon: '⚖️',
      title: '营养比例调整',
      description: '建议调整蛋白质比例，保持营养均衡。',
      priority: 'low',
      action: '查看均衡搭配'
    })
  }
  
  return suggestions
})

// 营养目标
const nutritionGoals = computed((): NutritionGoal[] => {
  if (!userProfile.value.isSet) return []
  
  return [
    {
      name: '每日卡路里',
      current: totalCalories.value,
      target: calculateDailyCalories(),
      unit: 'kcal'
    },
    {
      name: '蛋白质',
      current: totalProtein.value,
      target: calculateDailyProtein(),
      unit: 'g'
    },
    {
      name: '维生素C',
      current: getTotalVitaminC(),
      target: 90,
      unit: 'mg'
    },
    {
      name: '纤维',
      current: getTotalFiber(),
      target: 25,
      unit: 'g'
    }
  ]
})

// 方法
const getNutrientValue = (ingredient: any, nutrient: string): number => {
  const nutritionData: { [key: string]: { [key: string]: number } } = {
    // 蔬菜类营养数据 (每100g)
    '白菜': { calories: 17, protein: 1.5, carbs: 3.2, fat: 0.2, vitaminC: 47, calcium: 105, iron: 0.7, fiber: 1.2, sodium: 65 },
    '萝卜': { calories: 16, protein: 0.9, carbs: 3.4, fat: 0.1, vitaminC: 14, calcium: 25, iron: 0.3, fiber: 1.6, sodium: 39 },
    '土豆': { calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, vitaminC: 20, calcium: 12, iron: 0.8, fiber: 2.2, sodium: 6 },
    '西红柿': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, vitaminC: 14, calcium: 10, iron: 0.3, fiber: 1.2, sodium: 5 },
    '黄瓜': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, vitaminC: 2.8, calcium: 16, iron: 0.3, fiber: 0.5, sodium: 2 },
    '茄子': { calories: 25, protein: 1.0, carbs: 5.9, fat: 0.2, vitaminC: 2.2, calcium: 9, iron: 0.2, fiber: 3.0, sodium: 2 },
    '豆角': { calories: 35, protein: 2.0, carbs: 8.0, fat: 0.2, vitaminC: 12, calcium: 37, iron: 1.0, fiber: 2.7, sodium: 4 },
    
    // 肉类营养数据 (每100g)
    '猪肉': { calories: 242, protein: 20.3, carbs: 0, fat: 17.2, vitaminC: 0, calcium: 6, iron: 1.6, fiber: 0, sodium: 65 },
    '牛肉': { calories: 250, protein: 26.0, carbs: 0, fat: 15.0, vitaminC: 0, calcium: 18, iron: 2.6, fiber: 0, sodium: 72 },
    '鸡肉': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, vitaminC: 0, calcium: 11, iron: 0.9, fiber: 0, sodium: 74 },
    '鸭肉': { calories: 337, protein: 18.3, carbs: 0, fat: 28.6, vitaminC: 0, calcium: 12, iron: 2.2, fiber: 0, sodium: 74 },
    
    // 海鲜类营养数据 (每100g)
    '鱼肉': { calories: 206, protein: 22.0, carbs: 0, fat: 12.0, vitaminC: 0, calcium: 20, iron: 0.4, fiber: 0, sodium: 59 },
    '虾': { calories: 106, protein: 20.0, carbs: 0.9, fat: 1.7, vitaminC: 0, calcium: 70, iron: 2.4, fiber: 0, sodium: 111 },
    '螃蟹': { calories: 103, protein: 20.1, carbs: 0, fat: 1.8, vitaminC: 0, calcium: 126, iron: 2.8, fiber: 0, sodium: 293 }
  }
  
  const data = nutritionData[ingredient.name] || nutritionData['白菜'] // 默认值
  return data[nutrient] || 0
}

const getTotalVitaminC = (): number => {
  return recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'vitaminC')
  }, 0)
}

const getTotalCalcium = (): number => {
  return recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'calcium')
  }, 0)
}

const getTotalIron = (): number => {
  return recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'iron')
  }, 0)
}

const getTotalFiber = (): number => {
  return recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'fiber')
  }, 0)
}

const getTotalSodium = (): number => {
  return recipeStore.selectedIngredients.reduce((total, ingredient) => {
    return total + getNutrientValue(ingredient, 'sodium')
  }, 0)
}

// 计算每日所需卡路里
const calculateDailyCalories = (): number => {
  if (!userProfile.value.isSet) return 2000
  
  const { gender, age, height, weight, activityLevel } = userProfile.value
  
  // 基础代谢率计算 (Harris-Benedict公式)
  let bmr: number
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
  
  // 活动系数
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  
  return Math.round(bmr * activityMultipliers[activityLevel])
}

// 计算每日所需蛋白质
const calculateDailyProtein = (): number => {
  if (!userProfile.value.isSet) return 60
  
  const { weight, healthGoal } = userProfile.value
  
  let proteinPerKg: number
  switch (healthGoal) {
    case 'muscle':
      proteinPerKg = 2.0
      break
    case 'lose':
      proteinPerKg = 1.6
      break
    case 'gain':
      proteinPerKg = 1.4
      break
    default:
      proteinPerKg = 1.2
  }
  
  return Math.round(weight * proteinPerKg)
}

// 获取卡路里状态
const getCalorieStatus = (): string => {
  const daily = calculateDailyCalories()
  const current = totalCalories.value
  const percentage = current / daily
  
  if (percentage < 0.2) return 'low'
  if (percentage > 0.4) return 'high'
  return 'normal'
}

const getCalorieStatusText = (): string => {
  const status = getCalorieStatus()
  switch (status) {
    case 'low': return '偏低'
    case 'high': return '偏高'
    default: return '适中'
  }
}

// 获取营养素进度
const getProteinProgress = (): number => {
  const daily = calculateDailyProtein()
  return Math.min((totalProtein.value / daily) * 100, 100)
}

const getCarbsProgress = (): number => {
  const dailyCarbs = calculateDailyCalories() * 0.5 / 4 // 50%卡路里来自碳水
  return Math.min((totalCarbs.value / dailyCarbs) * 100, 100)
}

const getFatProgress = (): number => {
  const dailyFat = calculateDailyCalories() * 0.3 / 9 // 30%卡路里来自脂肪
  return Math.min((totalFat.value / dailyFat) * 100, 100)
}

// 获取目标颜色
const getGoalColor = (ratio: number): string => {
  if (ratio < 0.5) return '#ff6b6b'
  if (ratio < 0.8) return '#ffc107'
  if (ratio <= 1.2) return '#28a745'
  return '#ff6b6b'
}

// 获取目标状态
const getGoalStatus = (current: number, target: number): string => {
  const ratio = current / target
  if (ratio < 0.5) return '严重不足'
  if (ratio < 0.8) return '不足'
  if (ratio <= 1.2) return '达标'
  return '超标'
}

// 获取优先级文本
const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'high': return '重要'
    case 'medium': return '一般'
    case 'low': return '建议'
    default: return '建议'
  }
}

// 应用建议
const applySuggestion = (suggestion: HealthSuggestion) => {
  // 这里可以实现具体的建议应用逻辑
  alert(`正在应用建议: ${suggestion.title}`)
}

// 保存用户信息
const saveProfile = () => {
  userProfile.value = { ...profileForm.value, isSet: true }
  localStorage.setItem('chefmind-user-profile', JSON.stringify(userProfile.value))
  closeProfileModal()
}

// 关闭用户信息模态框
const closeProfileModal = () => {
  showProfileModal.value = false
  profileForm.value = { ...userProfile.value }
}

// 绘制营养成分饼图
const drawNutritionChart = () => {
  if (!nutritionChart.value) return
  
  const canvas = nutritionChart.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 100
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 数据
  const data = [
    { label: '蛋白质', value: proteinPercentage.value, color: '#ff6b6b' },
    { label: '碳水化合物', value: carbsPercentage.value, color: '#4ecdc4' },
    { label: '脂肪', value: fatPercentage.value, color: '#ffc107' }
  ]
  
  let currentAngle = -Math.PI / 2
  
  data.forEach(item => {
    if (item.value > 0) {
      const sliceAngle = (item.value / 100) * 2 * Math.PI
      
      // 绘制扇形
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      
      // 绘制边框
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      currentAngle += sliceAngle
    }
  })
  
  // 绘制中心圆
  ctx.beginPath()
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // 绘制中心文字
  ctx.fillStyle = '#2c3e50'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('营养', centerX, centerY - 5)
  ctx.fillText('分布', centerX, centerY + 10)
}

// 加载用户信息
const loadUserProfile = () => {
  const saved = localStorage.getItem('chefmind-user-profile')
  if (saved) {
    try {
      userProfile.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }
}

// 监听详细视图变化，重绘图表
watch(showDetailed, async (newVal) => {
  if (newVal) {
    await nextTick()
    drawNutritionChart()
  }
})

// 监听营养数据变化，重绘图表
watch([proteinPercentage, carbsPercentage, fatPercentage], () => {
  if (showDetailed.value) {
    nextTick(() => {
      drawNutritionChart()
    })
  }
})

// 组件挂载时
onMounted(() => {
  loadUserProfile()
})
</script>

<style lang="scss" scoped>
.nutrition-analysis {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  .nutrition-header {
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
        color: #ff6b6b;
      }
    }
    
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 25px;
      color: #6c757d;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
      }
      
      &.active {
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
        border-color: #4ecdc4;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
      }
    }
  }
  
  .nutrition-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    .overview-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 15px;
      position: relative;
      overflow: hidden;
      
      &.calories {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      }
      
      &.protein {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      }
      
      &.carbs {
        background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
      }
      
      &.fat {
        background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
      }
      
      .card-icon {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2rem;
        opacity: 0.3;
      }
      
      .card-content {
        .card-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .card-label {
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }
        
        .card-unit {
          font-size: 0.8rem;
          opacity: 0.8;
        }
      }
      
      .card-status {
        position: absolute;
        bottom: 0.5rem;
        right: 1rem;
        font-size: 0.8rem;
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.2);
        
        &.low {
          background: rgba(255, 193, 7, 0.8);
        }
        
        &.high {
          background: rgba(220, 53, 69, 0.8);
        }
        
        &.normal {
          background: rgba(40, 167, 69, 0.8);
        }
      }
      
      .progress-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 1rem;
        
        .progress-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
      }
    }
  }
  
  .nutrition-chart {
    margin-bottom: 2rem;
    
    h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .chart-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      
      canvas {
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .chart-legend {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
          }
          
          &.protein .legend-color {
            background: #ff6b6b;
          }
          
          &.carbs .legend-color {
            background: #4ecdc4;
          }
          
          &.fat .legend-color {
            background: #ffc107;
          }
        }
      }
    }
  }
  
  .detailed-nutrition {
    margin-bottom: 2rem;
    
    h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .nutrition-grid {
      display: grid;
      gap: 1rem;
      
      .nutrition-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 10px;
        
        .nutrient-info {
          min-width: 120px;
          
          .nutrient-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.2rem;
          }
          
          .nutrient-value {
            font-size: 1.2rem;
            color: #495057;
          }
        }
        
        .nutrient-bar {
          flex: 1;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          
          .nutrient-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
          }
        }
        
        .nutrient-status {
          min-width: 60px;
          text-align: center;
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          
          &.low {
            background: #fff3cd;
            color: #856404;
          }
          
          &.normal {
            background: #d4edda;
            color: #155724;
          }
          
          &.high {
            background: #f8d7da;
            color: #721c24;
          }
        }
      }
    }
  }
  
  .health-suggestions {
    margin-bottom: 2rem;
    
    h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      
      i {
        color: #28a745;
      }
    }
    
    .user-profile {
      .profile-prompt {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 15px;
        
        p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .setup-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 auto;
          
          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        }
      }
    }
    
    .suggestions-list {
      display: grid;
      gap: 1rem;
      
      .suggestion-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid;
        
        &.warning {
          background: #fff3cd;
          border-color: #ffc107;
        }
        
        &.info {
          background: #d1ecf1;
          border-color: #17a2b8;
        }
        
        &.success {
          background: #d4edda;
          border-color: #28a745;
        }
        
        &.tip {
          background: #e2e3e5;
          border-color: #6c757d;
        }
        
        .suggestion-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          
          .warning & {
            background: #ffc107;
            color: white;
          }
          
          .info & {
            background: #17a2b8;
            color: white;
          }
          
          .success & {
            background: #28a745;
            color: white;
          }
          
          .tip & {
            background: #6c757d;
            color: white;
          }
        }
        
        .suggestion-content {
          flex: 1;
          
          .suggestion-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.3rem;
          }
          
          .suggestion-description {
            color: #495057;
            font-size: 0.9rem;
            line-height: 1.4;
            margin-bottom: 0.5rem;
          }
          
          .action-btn {
            padding: 0.3rem 0.8rem;
            background: #4ecdc4;
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              background: #45b7aa;
              transform: translateY(-1px);
            }
          }
        }
        
        .suggestion-priority {
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
          
          &.high {
            background: #dc3545;
            color: white;
          }
          
          &.medium {
            background: #ffc107;
            color: #212529;
          }
          
          &.low {
            background: #28a745;
            color: white;
          }
        }
      }
    }
  }
  
  .nutrition-goals {
    h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      
      i {
        color: #4ecdc4;
      }
    }
    
    .goals-grid {
      display: grid;
      gap: 1rem;
      
      .goal-item {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 10px;
        
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          
          .goal-name {
            font-weight: 600;
            color: #2c3e50;
          }
          
          .goal-progress {
            font-size: 0.9rem;
            color: #495057;
          }
        }
        
        .goal-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
          
          .goal-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
          }
        }
        
        .goal-status {
          text-align: center;
          font-size: 0.8rem;
          color: #495057;
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
      max-width: 600px;
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
      
      .checkbox-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        
        .checkbox-item {
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

// 响应式设计
@media (max-width: 768px) {
  .nutrition-analysis {
    padding: 1rem;
    
    .nutrition-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    
    .nutrition-overview {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .chart-container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .modal-content {
      width: 95%;
      margin: 1rem;
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .checkbox-group {
      grid-template-columns: 1fr;
    }
  }
}
</style>
