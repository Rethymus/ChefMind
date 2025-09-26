<template>
  <div class="step-indicator">
    <div class="steps-container">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
        :class="{
          active: currentStep === step.id,
          completed: currentStep > step.id,
          clickable: currentStep >= step.id,
        }"
        @click="handleStepClick(step.id)"
      >
        <!-- 步骤连接线 -->
        <div
          v-if="index < steps.length - 1"
          class="step-connector"
          :class="{ active: currentStep > step.id }"
        />

        <!-- 步骤圆圈 -->
        <div class="step-circle">
          <el-icon v-if="currentStep > step.id" class="check-icon">
            <Check />
          </el-icon>
          <span v-else class="step-number">{{ step.id }}</span>
        </div>

        <!-- 步骤信息 -->
        <div class="step-info">
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-description">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Check } from '@element-plus/icons-vue'

  interface Step {
    id: number
    title: string
    description: string
  }

  interface Props {
    currentStep: number
  }

  interface Emits {
    (_e: 'step-click', _step: number): void
  }

  defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 步骤数据
  const steps: Step[] = [
    {
      id: 1,
      title: '选择食材',
      description: '挑选你喜欢的食材',
    },
    {
      id: 2,
      title: '烹饪方式',
      description: '选择合适的烹饪方法',
    },
    {
      id: 3,
      title: '设定条件',
      description: '配置时间和口味偏好',
    },
    {
      id: 4,
      title: '生成菜谱',
      description: '获得个性化菜谱推荐',
    },
  ]

  const handleStepClick = (stepId: number) => {
    emit('step-click', stepId)
  }
</script>

<style lang="scss" scoped>
  .step-indicator {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .steps-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    max-width: 200px;
    cursor: default;

    &.clickable {
      cursor: pointer;
    }

    &.clickable:hover .step-circle {
      transform: scale(1.05);
    }
  }

  .step-connector {
    position: absolute;
    top: 25px;
    left: 50%;
    right: -50%;
    height: 2px;
    background: #e5e7eb;
    z-index: 1;
    transition: background-color 0.3s ease;

    &.active {
      background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
    }
  }

  .step-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    border: 3px solid transparent;

    .step-number {
      font-weight: 600;
    }

    .check-icon {
      font-size: 1.5rem;
      color: white;
    }
  }

  .step-item.active .step-circle {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: white;
    transform: scale(1.1);
    border-color: rgba(255, 107, 107, 0.3);
    box-shadow: 0 0 0 8px rgba(255, 107, 107, 0.1);
  }

  .step-item.completed .step-circle {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    color: white;
  }

  .step-info {
    text-align: center;
    margin-top: 1rem;

    .step-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
      transition: color 0.3s ease;
    }

    .step-description {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }
  }

  .step-item.active .step-info .step-title {
    color: #ff6b6b;
  }

  .step-item.completed .step-info .step-title {
    color: #4ecdc4;
  }

  // 暗色主题
  :global(.dark) .step-indicator {
    background: rgba(31, 41, 55, 0.95);

    .step-connector {
      background: #4b5563;

      &.active {
        background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
      }
    }

    .step-circle {
      background: #4b5563;
      color: #9ca3af;
    }

    .step-info {
      .step-title {
        color: #f9fafb;
      }

      .step-description {
        color: #d1d5db;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .step-indicator {
      padding: 1.5rem 1rem;
    }

    .steps-container {
      flex-direction: column;
      gap: 1.5rem;
    }

    .step-item {
      flex-direction: row;
      max-width: none;
      width: 100%;
      text-align: left;
    }

    .step-connector {
      display: none;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .step-info {
      margin-top: 0;
      margin-left: 1rem;
      text-align: left;

      .step-title {
        font-size: 1rem;
      }

      .step-description {
        font-size: 0.85rem;
      }
    }
  }

  @media (max-width: 480px) {
    .step-indicator {
      padding: 1rem;
    }

    .step-circle {
      width: 35px;
      height: 35px;
      font-size: 0.9rem;
    }

    .step-info {
      .step-title {
        font-size: 0.95rem;
      }

      .step-description {
        font-size: 0.8rem;
      }
    }
  }
</style>
