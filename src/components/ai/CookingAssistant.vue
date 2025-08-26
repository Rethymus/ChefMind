<template>
  <div class="cooking-assistant">
    <el-card class="assistant-card">
      <template #header>
        <div class="card-header">
          <h3>👨‍🍳 智能烹饪助手</h3>
          <p class="subtitle">AI 实时指导，让烹饪变得简单</p>
        </div>
      </template>

      <!-- 食谱选择 -->
      <div v-if="!selectedRecipe" class="recipe-selection">
        <h4>选择要烹饪的食谱</h4>
        <el-select
          v-model="selectedRecipeId"
          placeholder="请选择食谱"
          size="large"
          style="width: 100%"
          @change="loadRecipe"
        >
          <el-option
            v-for="recipe in availableRecipes"
            :key="recipe.id"
            :label="recipe.title"
            :value="recipe.id"
          />
        </el-select>
      </div>

      <!-- 烹饪进度 -->
      <div v-else class="cooking-progress">
        <!-- 进度条 -->
        <div class="progress-header">
          <h4>{{ selectedRecipe.title }}</h4>
          <el-progress
            :percentage="cookingProgress"
            :color="getProgressColor()"
            :stroke-width="8"
            :show-text="false"
          />
          <div class="progress-text">
            步骤 {{ currentStep }} / {{ totalSteps }}
          </div>
        </div>

        <!-- 当前步骤 -->
        <div class="current-step">
          <div class="step-header">
            <div class="step-number">{{ currentStep }}</div>
            <div class="step-info">
              <h5>当前步骤</h5>
              <div class="step-timer" v-if="stepTimer.isActive">
                <el-icon><Timer /></el-icon>
                {{ formatTime(stepTimer.remaining) }}
              </div>
            </div>
          </div>

          <div class="step-content">
            <p class="step-instruction">{{ currentStepData?.instruction }}</p>
            
            <!-- 温度提示 -->
            <div v-if="currentStepData?.temperature" class="temperature-info">
              <el-icon><Sunny /></el-icon>
              <span>建议温度: {{ currentStepData.temperature }}°C</span>
            </div>

            <!-- 时间估计 -->
            <div v-if="currentStepData?.timeEstimate" class="time-estimate">
              <el-icon><Clock /></el-icon>
              <span>预计时间: {{ currentStepData.timeEstimate }} 分钟</span>
            </div>

            <!-- 视觉提示 -->
            <div v-if="currentStepData?.visualCues.length" class="visual-cues">
              <h6>观察要点:</h6>
              <ul>
                <li v-for="cue in currentStepData.visualCues" :key="cue">{{ cue }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 烹饪提示 -->
        <div class="cooking-tips">
          <el-collapse v-model="activeTipPanel">
            <el-collapse-item title="💡 烹饪小贴士" name="tips">
              <div class="tips-content">
                <div v-if="currentStepData?.tips.length" class="step-tips">
                  <h6>本步骤提示:</h6>
                  <ul>
                    <li v-for="tip in currentStepData.tips" :key="tip">{{ tip }}</li>
                  </ul>
                </div>
                
                <div v-if="currentStepData?.commonMistakes.length" class="common-mistakes">
                  <h6>常见错误:</h6>
                  <ul>
                    <li v-for="mistake in currentStepData.commonMistakes" :key="mistake">{{ mistake }}</li>
                  </ul>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 控制按钮 -->
        <div class="control-buttons">
          <el-button
            v-if="currentStep > 1"
            @click="previousStep"
            :disabled="isProcessing"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>

          <el-button
            v-if="currentStepData?.timeEstimate"
            @click="startTimer"
            :disabled="stepTimer.isActive"
            type="warning"
          >
            <el-icon><Timer /></el-icon>
            开始计时
          </el-button>

          <el-button
            v-if="stepTimer.isActive"
            @click="stopTimer"
            type="danger"
          >
            <el-icon><VideoPause /></el-icon>
            停止计时
          </el-button>

          <el-button
            v-if="currentStep < totalSteps"
            @click="nextStep"
            :disabled="isProcessing"
            type="primary"
          >
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>

          <el-button
            v-else
            @click="completeCooking"
            :disabled="isProcessing"
            type="success"
          >
            <el-icon><Check /></el-icon>
            完成烹饪
          </el-button>
        </div>

        <!-- AI 助手建议 -->
        <div v-if="aiSuggestion" class="ai-suggestion">
          <div class="suggestion-header">
            <el-icon class="ai-icon"><Setting /></el-icon>
            <span>AI 助手建议</span>
          </div>
          <p class="suggestion-text">{{ aiSuggestion }}</p>
        </div>

        <!-- 语音控制 -->
        <div class="voice-control">
          <el-button
            @click="toggleVoiceControl"
            :type="voiceControl.isActive ? 'success' : 'default'"
            circle
            size="large"
            class="voice-btn"
          >
            <el-icon><Microphone /></el-icon>
          </el-button>
          <span class="voice-status">
            {{ voiceControl.isActive ? '语音控制已开启' : '点击开启语音控制' }}
          </span>
        </div>
      </div>

      <!-- 烹饪完成 -->
      <div v-if="cookingCompleted" class="cooking-completed">
        <div class="completion-animation">
          <el-icon class="success-icon"><Trophy /></el-icon>
          <h3>烹饪完成！</h3>
          <p>恭喜您成功完成了 {{ selectedRecipe?.title }}</p>
        </div>

        <div class="completion-actions">
          <el-button @click="rateDish" type="primary">
            <el-icon><Star /></el-icon>
            为这道菜评分
          </el-button>
          <el-button @click="shareResult">
            <el-icon><Share /></el-icon>
            分享成果
          </el-button>
          <el-button @click="startNewCooking">
            <el-icon><Refresh /></el-icon>
            开始新的烹饪
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 评分对话框 -->
    <el-dialog v-model="ratingDialogVisible" title="为这道菜评分" width="400px">
      <div class="rating-content">
        <div class="rating-stars">
          <el-rate
            v-model="dishRating.score"
            :max="5"
            size="large"
            show-text
            text-color="#ff9900"
          />
        </div>
        <el-input
          v-model="dishRating.comment"
          type="textarea"
          :rows="3"
          placeholder="分享您的烹饪心得..."
          maxlength="200"
          show-word-limit
        />
      </div>
      <template #footer>
        <el-button @click="ratingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRating">提交评分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Timer,
  Sunny,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  VideoPause,
  Setting,
  Microphone,
  Trophy,
  Star,
  Share,
  Refresh
} from '@element-plus/icons-vue'
import { aiService, type RecipeRecommendation, type CookingStepData, type RecipeContext } from '@/services/aiService'


// 组件属性
interface Props {
  recipe?: RecipeRecommendation
}

const props = withDefaults(defineProps<Props>(), {
  recipe: undefined
})

// 组件事件
const emit = defineEmits<{
  recipeCompleted: [recipe: RecipeRecommendation, rating: number]
  shareRecipe: [recipe: RecipeRecommendation]
}>()

// 响应式数据
const selectedRecipeId = ref<string>('')
const selectedRecipe = ref<RecipeRecommendation>()
const currentStep = ref(1)
const isProcessing = ref(false)
const cookingCompleted = ref(false)
const activeTipPanel = ref<string>('')
const currentStepData = ref<CookingStepData>()
const aiSuggestion = ref<string>('')

// 可用食谱列表（模拟数据）
const availableRecipes = ref<RecipeRecommendation[]>([])

// 计时器
const stepTimer = reactive({
  isActive: false,
  duration: 0,
  remaining: 0,
  intervalId: null as number | null
})

// 语音控制
const voiceControl = reactive({
  isActive: false,
  recognition: null as any
})

// 评分对话框
const ratingDialogVisible = ref(false)
const dishRating = reactive({
  score: 5,
  comment: ''
})

// 计算属性
const totalSteps = computed(() => {
  // PersonalizedRecommendation 没有 instructions 属性，使用默认步骤数
  // 或者根据烹饪时间估算步骤数
  if (!selectedRecipe.value) return 0
  const baseSteps = Math.max(3, Math.floor(selectedRecipe.value.cookingTime / 10)) // 每10分钟一个步骤，最少3步
  return Math.min(baseSteps, 8) // 最多8步
})

const cookingProgress = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((currentStep.value / totalSteps.value) * 100)
})

// 加载食谱
const loadRecipe = async (recipeId: string) => {
  try {
    // 这里应该从服务中获取食谱详情
    const recipe = availableRecipes.value.find(r => r.id === recipeId)
    if (recipe) {
      selectedRecipe.value = recipe
      currentStep.value = 1
      await loadStepAssistance()
    }
  } catch (error) {
    console.error('加载食谱失败:', error)
    ElMessage.error('加载食谱失败')
  }
}

// 加载步骤指导
const loadStepAssistance = async () => {
  if (!selectedRecipe.value) return

  try {
    // 构建查询字符串，包含当前步骤信息
    const query = `${selectedRecipe.value.title}的第${currentStep.value}步烹饪指导`
    const context: RecipeContext = {
      mealType: 'dinner', // 默认晚餐
      season: 'spring' // 默认春季
    }
    
    const assistance = await aiService.getCookingAssistance(query, context)
    
    // 将 CookingAssistance 转换为 CookingStepData 格式
    currentStepData.value = {
      instruction: assistance.response,
      visualCues: assistance.suggestions,
      tips: assistance.relatedTips,
      commonMistakes: [],
      timeEstimate: undefined,
      temperature: undefined
    }
    
    // 生成AI建议
    generateAISuggestion()
  } catch (error) {
    console.error('获取烹饪指导失败:', error)
  }
}

// 生成AI建议
const generateAISuggestion = () => {
  const suggestions = [
    '记得预热锅具，这样能让食材受热更均匀',
    '注意观察食材的颜色变化，这是判断火候的重要指标',
    '调味时建议少量多次，避免一次性加太多',
    '保持耐心，好的菜肴需要时间来成就',
    '如果是第一次做这道菜，建议准备好所有食材再开始'
  ]
  
  aiSuggestion.value = suggestions[Math.floor(Math.random() * suggestions.length)]
}

// 上一步
const previousStep = async () => {
  if (currentStep.value > 1) {
    currentStep.value--
    await loadStepAssistance()
  }
}

// 下一步
const nextStep = async () => {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++
    await loadStepAssistance()
    stopTimer()
  }
}

// 完成烹饪
const completeCooking = () => {
  cookingCompleted.value = true
  stopTimer()
  
  ElNotification({
    title: '烹饪完成！',
    message: '恭喜您成功完成了这道美味的菜肴！',
    type: 'success',
    duration: 3000
  })
}

// 开始计时
const startTimer = () => {
  if (!currentStepData.value?.timeEstimate) return

  stepTimer.duration = currentStepData.value.timeEstimate * 60 // 转换为秒
  stepTimer.remaining = stepTimer.duration
  stepTimer.isActive = true

  stepTimer.intervalId = window.setInterval(() => {
    stepTimer.remaining--
    
    if (stepTimer.remaining <= 0) {
      stopTimer()
      ElNotification({
        title: '时间到！',
        message: '当前步骤的建议时间已到，请检查烹饪状态',
        type: 'warning',
        duration: 5000
      })
    }
  }, 1000)
}

// 停止计时
const stopTimer = () => {
  stepTimer.isActive = false
  if (stepTimer.intervalId) {
    clearInterval(stepTimer.intervalId)
    stepTimer.intervalId = null
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取进度颜色
const getProgressColor = () => {
  const progress = cookingProgress.value
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

// 语音控制
const toggleVoiceControl = () => {
  if (voiceControl.isActive) {
    stopVoiceControl()
  } else {
    startVoiceControl()
  }
}

const startVoiceControl = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    ElMessage.warning('您的浏览器不支持语音识别功能')
    return
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  voiceControl.recognition = new SpeechRecognition()
  
  voiceControl.recognition.continuous = true
  voiceControl.recognition.interimResults = false
  voiceControl.recognition.lang = 'zh-CN'

  voiceControl.recognition.onresult = (event: any) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase()
    handleVoiceCommand(command)
  }

  voiceControl.recognition.onerror = () => {
    ElMessage.error('语音识别出错，请重试')
    stopVoiceControl()
  }

  voiceControl.recognition.start()
  voiceControl.isActive = true
  ElMessage.success('语音控制已开启，您可以说"下一步"、"上一步"、"开始计时"等指令')
}

const stopVoiceControl = () => {
  if (voiceControl.recognition) {
    voiceControl.recognition.stop()
    voiceControl.recognition = null
  }
  voiceControl.isActive = false
}

const handleVoiceCommand = (command: string) => {
  if (command.includes('下一步') || command.includes('下一个')) {
    nextStep()
  } else if (command.includes('上一步') || command.includes('上一个')) {
    previousStep()
  } else if (command.includes('开始计时') || command.includes('计时')) {
    startTimer()
  } else if (command.includes('停止计时') || command.includes('停止')) {
    stopTimer()
  } else if (command.includes('完成') || command.includes('结束')) {
    completeCooking()
  }
}

// 评分相关
const rateDish = () => {
  ratingDialogVisible.value = true
}

const submitRating = () => {
  if (selectedRecipe.value) {
    emit('recipeCompleted', selectedRecipe.value, dishRating.score)
    ElMessage.success('感谢您的评分！')
  }
  ratingDialogVisible.value = false
}

// 分享结果
const shareResult = () => {
  if (selectedRecipe.value) {
    emit('shareRecipe', selectedRecipe.value)
  }
}

// 获取用户历史数据
const getUserHistory = () => {
  const savedHistory = localStorage.getItem('chefmind-user-history')
  if (savedHistory) {
    try {
      return JSON.parse(savedHistory)
    } catch (error) {
      console.error('解析用户历史数据失败:', error)
    }
  }
  return []
}

// 获取用户偏好设置
const getUserPreferences = () => {
  const savedPreferences = localStorage.getItem('chefmind-user-preferences')
  if (savedPreferences) {
    try {
      return JSON.parse(savedPreferences)
    } catch (error) {
      console.error('解析用户偏好数据失败:', error)
    }
  }
  return {
    taste: [],
    cuisine: [],
    difficulty: 'easy',
    cookingTime: 'medium',
    dietary: [],
    allergens: []
  }
}

// 开始新的烹饪
const startNewCooking = () => {
  selectedRecipe.value = undefined
  currentStep.value = 1
  cookingCompleted.value = false
  currentStepData.value = undefined
  aiSuggestion.value = ''
  stopTimer()
  stopVoiceControl()
}

// 组件挂载
onMounted(async () => {
  // 加载可用食谱
  try {
    // 获取用户历史和偏好来获取可用食谱
    const userHistory = getUserHistory()
    const userPreferences = getUserPreferences()
    const recipes = await aiService.getPersonalizedRecommendations(userHistory, userPreferences, 5)
    availableRecipes.value = recipes
    
    // 如果传入了食谱，直接使用
    if (props.recipe) {
      selectedRecipe.value = props.recipe
      await loadStepAssistance()
    }
  } catch (error) {
    console.error('加载食谱列表失败:', error)
  }
})

// 组件卸载
onUnmounted(() => {
  stopTimer()
  stopVoiceControl()
})
</script>

<style scoped lang="scss">
.cooking-assistant {
  .assistant-card {
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

  .recipe-selection {
    text-align: center;
    padding: 40px 20px;
    
    h4 {
      margin: 0 0 20px 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
  }

  .cooking-progress {
    .progress-header {
      text-align: center;
      margin-bottom: 32px;
      
      h4 {
        margin: 0 0 16px 0;
        color: var(--el-text-color-primary);
        font-size: 20px;
        font-weight: 600;
      }
      
      .progress-text {
        margin-top: 8px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .current-step {
      background: var(--el-fill-color-lighter);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      
      .step-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        
        .step-number {
          width: 60px;
          height: 60px;
          background: var(--el-color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .step-info {
          flex: 1;
          
          h5 {
            margin: 0 0 8px 0;
            color: var(--el-text-color-primary);
            font-size: 18px;
            font-weight: 600;
          }
          
          .step-timer {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--el-color-warning);
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
      
      .step-content {
        .step-instruction {
          font-size: 16px;
          line-height: 1.6;
          color: var(--el-text-color-primary);
          margin: 0 0 16px 0;
        }
        
        .temperature-info,
        .time-estimate {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
        
        .visual-cues {
          h6 {
            margin: 0 0 8px 0;
            color: var(--el-text-color-regular);
            font-size: 14px;
            font-weight: 600;
          }
          
          ul {
            margin: 0;
            padding-left: 20px;
            
            li {
              margin-bottom: 4px;
              font-size: 14px;
              color: var(--el-text-color-regular);
            }
          }
        }
      }
    }

    .cooking-tips {
      margin-bottom: 24px;
      
      .tips-content {
        .step-tips,
        .common-mistakes {
          margin-bottom: 16px;
          
          h6 {
            margin: 0 0 8px 0;
            color: var(--el-text-color-regular);
            font-size: 14px;
            font-weight: 600;
          }
          
          ul {
            margin: 0;
            padding-left: 20px;
            
            li {
              margin-bottom: 4px;
              font-size: 14px;
              color: var(--el-text-color-regular);
              line-height: 1.4;
            }
          }
        }
        
        .common-mistakes {
          h6 {
            color: var(--el-color-warning);
          }
        }
      }
    }

    .control-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .ai-suggestion {
      background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-success-light-9));
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border-left: 4px solid var(--el-color-primary);
      
      .suggestion-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .ai-icon {
          color: var(--el-color-primary);
          font-size: 18px;
        }
        
        span {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .suggestion-text {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--el-text-color-regular);
      }
    }

    .voice-control {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      
      .voice-btn {
        width: 60px;
        height: 60px;
        
        .el-icon {
          font-size: 24px;
        }
      }
      
      .voice-status {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .cooking-completed {
    text-align: center;
    padding: 40px 20px;
    
    .completion-animation {
      margin-bottom: 32px;
      
      .success-icon {
        font-size: 80px;
        color: var(--el-color-success);
        margin-bottom: 16px;
        animation: bounce 1s ease-in-out;
      }
      
      h3 {
        margin: 0 0 12px 0;
        color: var(--el-text-color-primary);
        font-size: 24px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        font-size: 16px;
        color: var(--el-text-color-regular);
      }
    }
    
    .completion-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .rating-content {
    text-align: center;
    
    .rating-stars {
      margin-bottom: 20px;
    }
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .cooking-assistant {
    .cooking-progress {
      .current-step .step-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }
      
      .control-buttons {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
      
      .voice-control {
        flex-direction: column;
        gap: 8px;
      }
    }
    
    .cooking-completed .completion-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>