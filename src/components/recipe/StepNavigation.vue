<template>
  <div class="step-navigation">
    <div class="nav-buttons">
      <!-- 上一步按钮 -->
      <button 
        class="nav-btn prev-btn"
        :disabled="currentStep <= 1"
        @click="$emit('prev-step')"
        v-if="currentStep > 1"
      >
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </button>
      
      <!-- 下一步按钮 -->
      <button 
        v-if="currentStep < 3"
        class="nav-btn next-btn"
        :disabled="!canProceed"
        @click="$emit('next-step')"
      >
        下一步
        <el-icon><ArrowRight /></el-icon>
      </button>
      
      <!-- 生成菜谱按钮 -->
      <button 
        v-if="currentStep === 3"
        class="nav-btn generate-btn"
        :disabled="!canGenerate"
        @click="$emit('generate-recipes')"
      >
        <el-icon><MagicStick /></el-icon>
        生成菜谱
      </button>
      
      <!-- 重新开始按钮 -->
      <button 
        class="nav-btn reset-btn"
        @click="$emit('reset')"
        v-if="currentStep > 1"
      >
        <el-icon><RefreshLeft /></el-icon>
        重新开始
      </button>
    </div>
    
    <!-- 进度提示 -->
    <div class="progress-hint">
      <span v-if="currentStep === 1 && !canProceedStep2">
        请至少选择一种食材继续
      </span>
      <span v-else-if="currentStep === 2 && !canProceedStep3">
        请至少选择一种烹饪方式继续
      </span>
      <span v-else-if="currentStep === 3">
        设置完约束条件后点击"生成菜谱"
      </span>
      <span v-else-if="currentStep === 4">
        菜谱生成完成！您可以查看详情或重新开始
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, MagicStick, RefreshLeft } from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  currentStep: number
  canProceedStep2: boolean
  canProceedStep3: boolean
  canGenerate: boolean
}>()

// Emits
defineEmits<{
  'prev-step': []
  'next-step': []
  'generate-recipes': []
  'reset': []
}>()

// 计算是否可以继续下一步
const canProceed = computed(() => {
  switch (props.currentStep) {
    case 1:
      return props.canProceedStep2
    case 2:
      return props.canProceedStep3
    case 3:
      return props.canGenerate
    default:
      return false
  }
})
</script>

<style lang="scss" scoped>
.step-navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  
  .nav-buttons {
    display: flex;
    gap: 1rem;
    align-items: center;
    
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }
      
      &.prev-btn {
        background: #6c757d;
        color: white;
        
        &:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
        }
      }
      
      &.next-btn {
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
        }
      }
      
      &.generate-btn {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        }
      }
      
      &.reset-btn {
        background: #ffc107;
        color: #212529;
        
        &:hover:not(:disabled) {
          background: #e0a800;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
        }
      }
    }
  }
  
  .progress-hint {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    max-width: 400px;
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .step-navigation {
    padding: 1rem;
    
    .nav-buttons {
      flex-direction: column;
      width: 100%;
      
      .nav-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>