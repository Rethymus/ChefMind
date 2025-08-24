<template>
  <div class="cooking-guide-view">
    <!-- 页面头部 -->
    <div class="cooking-header">
      <div class="header-content">
        <div class="recipe-info">
          <h1 class="recipe-title">{{ recipe?.title || recipe?.name }}</h1>
          <div class="recipe-meta">
            <el-tag type="info">{{ recipe?.difficulty }}</el-tag>
            <el-tag type="warning">{{ recipe?.cookingTime }}</el-tag>
            <el-tag type="success">{{ recipe?.servings }}人份</el-tag>
          </div>
        </div>
        
        <div class="cooking-controls">
          <el-button 
            v-if="!isStarted" 
            type="primary" 
            size="large" 
            @click="startCooking"
          >
            <el-icon><VideoPlay /></el-icon>
            开始烹饪
          </el-button>
          
          <el-button 
            v-if="isStarted && !isPaused" 
            type="warning" 
            size="large" 
            @click="pauseCooking"
          >
            <el-icon><VideoPause /></el-icon>
            暂停
          </el-button>
          
          <el-button 
            v-if="isStarted && isPaused" 
            type="success" 
            size="large" 
            @click="resumeCooking"
          >
            <el-icon><VideoPlay /></el-icon>
            继续
          </el-button>
          
          <el-button 
            v-if="isStarted" 
            type="danger" 
            size="large" 
            @click="stopCooking"
          >
            <el-icon><Close /></el-icon>
            结束烹饪
          </el-button>
        </div>
      </div>
    </div>

    <!-- 总体进度 -->
    <div class="progress-section" v-if="isStarted">
      <el-card class="progress-card">
        <div class="progress-info">
          <div class="progress-text">
            <span class="current-step">步骤 {{ currentStep + 1 }} / {{ totalSteps }}</span>
            <span class="progress-percentage">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
          </div>
          <el-progress 
            :percentage="Math.round((currentStep / totalSteps) * 100)" 
            :stroke-width="8"
            :show-text="false"
          />
        </div>
        
        <div class="timer-info" v-if="totalTime > 0">
          <div class="timer-display">
            <el-icon><Timer /></el-icon>
            <span class="time-text">{{ formatTime(totalTime) }}</span>
          </div>
          <div class="timer-status" :class="{ paused: isPaused }">
            {{ isPaused ? '已暂停' : '进行中' }}
          </div>
        </div>
      </el-card>
    </div>

    <!-- 当前步骤 -->
    <div class="current-step-section" v-if="isStarted">
      <el-card class="step-card">
        <template #header>
          <div class="step-header">
            <h2>当前步骤</h2>
            <div class="step-navigation">
              <el-button 
                :disabled="currentStep === 0" 
                @click="previousStep"
                circle
              >
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button 
                :disabled="currentStep === totalSteps - 1" 
                @click="nextStep"
                circle
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="step-content">
          <div class="step-number">{{ currentStep + 1 }}</div>
          <div class="step-description">
            {{ currentStepContent }}
          </div>
        </div>
        
        <div class="step-actions">
          <el-button 
            v-if="currentStep < totalSteps - 1" 
            type="primary" 
            size="large" 
            @click="completeCurrentStep"
          >
            完成此步骤
          </el-button>
          <el-button 
            v-else 
            type="success" 
            size="large" 
            @click="completeCooking"
          >
            <el-icon><Check /></el-icon>
            完成烹饪
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 所有步骤列表 -->
    <div class="steps-list-section">
      <el-card class="steps-card">
        <template #header>
          <h3>制作步骤</h3>
        </template>
        
        <div class="steps-list">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 
              active: isStarted && index === currentStep,
              completed: isStarted && index < currentStep
            }"
          >
            <div class="step-indicator">
              <div class="step-number-small">{{ index + 1 }}</div>
              <el-icon v-if="isStarted && index < currentStep" class="check-icon">
                <Check />
              </el-icon>
            </div>
            <div class="step-text">{{ step }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 食材清单 -->
    <div class="ingredients-section">
      <el-card class="ingredients-card">
        <template #header>
          <h3>所需食材</h3>
        </template>
        
        <div class="ingredients-grid">
          <div 
            v-for="ingredient in ingredients" 
            :key="typeof ingredient === 'string' ? ingredient : ingredient.name"
            class="ingredient-item"
          >
            <el-icon class="ingredient-icon"><Apple /></el-icon>
            <span>{{ typeof ingredient === 'string' ? ingredient : `${ingredient.name} ${ingredient.amount || ''} ${ingredient.unit || ''}` }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 烹饪小贴士 -->
    <div class="tips-section" v-if="recipe?.cookingTips">
      <el-card class="tips-card">
        <template #header>
          <h3>烹饪小贴士</h3>
        </template>
        
        <ul class="tips-list">
          <li v-for="tip in recipe.cookingTips" :key="tip" class="tip-item">
            <el-icon class="tip-icon"><Opportunity /></el-icon>
            {{ tip }}
          </li>
        </ul>
      </el-card>
    </div>

    <!-- 完成烹饪对话框 -->
    <el-dialog
      v-model="showCompletionDialog"
      title="烹饪完成！"
      width="500px"
      :show-close="false"
    >
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <h3>恭喜您完成了这道美味的菜肴！</h3>
        <p>总用时：{{ formatTime(totalTime) }}</p>
        <p>希望您享受这次烹饪体验！</p>
      </div>
      
      <template #footer>
        <div class="completion-actions">
          <el-button @click="rateRecipe">给食谱评分</el-button>
          <el-button type="primary" @click="finishCooking">完成</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoPlay, VideoPause, Close, Timer, ArrowLeft, ArrowRight,
  Check, Apple, Opportunity
} from '@element-plus/icons-vue'

// 路由和导航
const route = useRoute()
const router = useRouter()

// 响应式数据
const recipe = ref<any>(null)
const isStarted = ref(false)
const isPaused = ref(false)
const currentStep = ref(0)
const totalTime = ref(0)
const showCompletionDialog = ref(false)

// 计时器
let timer: NodeJS.Timeout | null = null

// 计算属性
const steps = computed(() => {
  return recipe.value?.instructions || recipe.value?.steps || []
})

const totalSteps = computed(() => steps.value.length)

const ingredients = computed(() => {
  return recipe.value?.ingredients || []
})

const currentStepContent = computed(() => {
  return steps.value[currentStep.value] || ''
})

// 方法
const startCooking = () => {
  isStarted.value = true
  isPaused.value = false
  currentStep.value = 0
  totalTime.value = 0
  
  // 启动计时器
  timer = setInterval(() => {
    if (!isPaused.value) {
      totalTime.value++
    }
  }, 1000)
  
  ElMessage.success('开始烹饪！按照步骤指导进行操作')
}

const pauseCooking = () => {
  isPaused.value = true
  ElMessage.info('烹饪已暂停')
}

const resumeCooking = () => {
  isPaused.value = false
  ElMessage.success('继续烹饪')
}

const stopCooking = () => {
  ElMessageBox.confirm(
    '确定要结束烹饪吗？进度将不会保存。',
    '结束烹饪',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    resetCooking()
    ElMessage.info('已结束烹饪')
  }).catch(() => {
    // 用户取消
  })
}

const resetCooking = () => {
  isStarted.value = false
  isPaused.value = false
  currentStep.value = 0
  totalTime.value = 0
  
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
  }
}

const completeCurrentStep = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
    ElMessage.success(`步骤 ${currentStep.value} 已完成`)
  }
}

const completeCooking = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  
  showCompletionDialog.value = true
}

const rateRecipe = () => {
  showCompletionDialog.value = false
  ElMessage.info('评分功能开发中...')
  router.push('/ai')
}

const finishCooking = () => {
  showCompletionDialog.value = false
  router.push('/ai')
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 生命周期钩子
onMounted(() => {
  // 从localStorage中获取食谱数据
  const recipeData = localStorage.getItem('currentCookingRecipe')
  
  if (recipeData) {
    try {
      recipe.value = JSON.parse(recipeData)
      // 成功获取数据后可以清除localStorage中的数据
      // localStorage.removeItem('currentCookingRecipe') // 如果需要保留数据供返回时使用，可以注释此行
    } catch (error) {
      console.error('解析食谱数据失败:', error)
      ElMessage.error('食谱数据格式错误')
      router.push('/ai')
    }
  } else {
    ElMessage.error('未找到食谱数据')
    router.push('/ai')
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.cooking-guide-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.cooking-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-success-light-9));
  border-radius: 12px;
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.recipe-info {
  flex: 1;
}

.recipe-title {
  font-size: 28px;
  margin-bottom: 10px;
  color: var(--el-color-primary);
}

.recipe-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cooking-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-card {
  border-radius: 8px;
}

.progress-info {
  margin-bottom: 15px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.current-step {
  font-size: 16px;
  font-weight: 500;
}

.progress-percentage {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.timer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.timer-status {
  padding: 4px 12px;
  border-radius: 12px;
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
  font-size: 14px;
}

.timer-status.paused {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.current-step-section {
  margin-bottom: 20px;
}

.step-card {
  border-radius: 8px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-header h2 {
  margin: 0;
}

.step-navigation {
  display: flex;
  gap: 10px;
}

.step-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.step-description {
  flex: 1;
  font-size: 16px;
  line-height: 1.6;
  padding-top: 10px;
}

.step-actions {
  display: flex;
  justify-content: center;
}

.steps-list-section,
.ingredients-section,
.tips-section {
  margin-bottom: 20px;
}

.steps-card,
.ingredients-card,
.tips-card {
  border-radius: 8px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
  transition: all 0.3s ease;
}

.step-item.active {
  background-color: var(--el-color-primary-light-9);
  border: 2px solid var(--el-color-primary);
}

.step-item.completed {
  background-color: var(--el-color-success-light-9);
  opacity: 0.8;
}

.step-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.step-number-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: var(--el-color-info);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.step-item.active .step-number-small {
  background-color: var(--el-color-primary);
}

.step-item.completed .step-number-small {
  background-color: var(--el-color-success);
}

.check-icon {
  position: absolute;
  color: var(--el-color-success);
  font-size: 20px;
}

.step-text {
  flex: 1;
  line-height: 1.6;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.ingredient-icon {
  color: var(--el-color-success);
}

.tips-list {
  padding-left: 0;
  list-style-type: none;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.tip-icon {
  color: var(--el-color-warning);
  margin-top: 3px;
}

.completion-content {
  text-align: center;
  padding: 20px;
}

.completion-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.completion-content h3 {
  margin-bottom: 15px;
  color: var(--el-color-success);
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .cooking-guide-view {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cooking-controls {
    width: 100%;
    justify-content: center;
  }
  
  .step-content {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    align-self: center;
  }
}
</style>