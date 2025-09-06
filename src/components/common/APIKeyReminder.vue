<template>
  <div v-if="showReminder" class="api-key-reminder">
    <div class="reminder-content">
      <div class="reminder-icon">
        <i class="el-icon-warning"></i>
      </div>
      <div class="reminder-text">
        <h4>AI 功能提醒</h4>
        <p>当前未配置 AI API 密钥，将使用模拟数据进行演示。若要使用真实的 AI 功能，请在环境变量中配置相应的 API 密钥。</p>
      </div>
      <div class="reminder-actions">
        <button class="dismiss-btn" @click="dismissReminder">
          知道了
        </button>
        <button class="config-btn" @click="showConfigGuide">
          配置指南
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  provider?: 'openai' | 'glm' | 'all'
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  provider: 'all',
  persistent: false
})

const emit = defineEmits<{
  dismiss: []
  'show-guide': []
}>()

const isDismissed = ref(false)

// 检查是否有 API 密钥配置
const hasApiKey = computed(() => {
  if (props.provider === 'all') {
    return hasOpenAIKey.value || hasGLMKey.value
  } else if (props.provider === 'openai') {
    return hasOpenAIKey.value
  } else if (props.provider === 'glm') {
    return hasGLMKey.value
  }
  return false
})

const hasOpenAIKey = computed(() => {
  return !!import.meta.env.VITE_OPENAI_API_KEY
})

const hasGLMKey = computed(() => {
  return !!import.meta.env.VITE_GLM_API_KEY
})

// 是否显示提醒
const showReminder = computed(() => {
  if (isDismissed.value && !props.persistent) {
    return false
  }
  return !hasApiKey.value
})

// 关闭提醒
const dismissReminder = () => {
  isDismissed.value = true
  emit('dismiss')
}

// 显示配置指南
const showConfigGuide = () => {
  emit('show-guide')
  // 这里可以显示配置指南或跳转到文档
  alert('请在项目根目录创建 .env 文件，并添加相应的 API 密钥：\n\n' +
        'OpenAI: VITE_OPENAI_API_KEY=your_openai_key\n' +
        'GLM: VITE_GLM_API_KEY=your_glm_key')
}

// 检查是否使用模拟数据
const isUsingMockData = computed(() => {
  return !hasApiKey.value
})

onMounted(() => {
  // 如果不是持久化的，每次刷新都重新显示
  if (!props.persistent) {
    isDismissed.value = false
  }
})

// 暴露方法给父组件
defineExpose({
  isUsingMockData,
  hasApiKey,
  resetReminder: () => { isDismissed.value = false }
})
</script>

<style lang="scss" scoped>
.api-key-reminder {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #f39c12;
  border-radius: 8px;
  margin: 1rem 0;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
  animation: slideIn 0.3s ease-out;

  .reminder-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;

    .reminder-icon {
      color: #f39c12;
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .reminder-text {
      flex: 1;

      h4 {
        color: #856404;
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
      }

      p {
        color: #856404;
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
      }
    }

    .reminder-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-shrink: 0;

      .dismiss-btn {
        background: #f39c12;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;

        &:hover {
          background: #e67e22;
        }
      }

      .config-btn {
        background: transparent;
        color: #856404;
        border: 1px solid #f39c12;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;

        &:hover {
          background: #f39c12;
          color: white;
        }
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .api-key-reminder {
    margin: 0.5rem;
    padding: 0.75rem;

    .reminder-content {
      flex-direction: column;
      gap: 0.75rem;

      .reminder-actions {
        flex-direction: row;
        justify-content: flex-end;
      }
    }
  }
}
</style>