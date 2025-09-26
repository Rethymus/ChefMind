<template>
  <div class="api-config-button">
    <el-tooltip :content="tooltipContent" placement="bottom" :hide-after="0">
      <el-button
        :type="buttonType"
        :size="size"
        circle
        @click="openConfig"
        :class="{
          'has-config': hasAnyConfig,
          'multiple-configs': configuredCount > 1,
        }"
      >
        <el-icon>
          <Key v-if="!hasAnyConfig" />
          <Check v-else-if="configuredCount === 1" />
          <Connection v-else />
        </el-icon>
        <span v-if="configuredCount > 1" class="config-count">{{ configuredCount }}</span>
      </el-button>
    </el-tooltip>

    <!-- 配置弹窗 -->
    <APIConfigModal v-model="showModal" @config-saved="handleConfigSaved" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Key, Check, Connection } from '@element-plus/icons-vue'
  import APIConfigModal from './APIConfigModal.vue'

  interface Props {
    size?: 'small' | 'default' | 'large'
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'default',
    type: 'default',
  })

  // 响应式数据
  const showModal = ref(false)
  const hasApiKey = ref({
    openai: false,
    glm: false,
    anthropic: false,
    google: false,
    deepseek: false,
    moonshot: false,
    qwen: false,
    hunyuan: false,
  })

  // 计算属性
  const configuredProviders = computed(() => {
    const providers = []
    if (hasApiKey.value.openai) providers.push('OpenAI')
    if (hasApiKey.value.glm) providers.push('GLM')
    if (hasApiKey.value.anthropic) providers.push('Claude')
    if (hasApiKey.value.google) providers.push('Gemini')
    if (hasApiKey.value.deepseek) providers.push('DeepSeek')
    if (hasApiKey.value.moonshot) providers.push('Moonshot')
    if (hasApiKey.value.qwen) providers.push('通义千问')
    if (hasApiKey.value.hunyuan) providers.push('混元')
    return providers
  })

  const configuredCount = computed(() => {
    return configuredProviders.value.length
  })

  const hasAnyConfig = computed(() => {
    return configuredCount.value > 0
  })

  const buttonType = computed(() => {
    if (configuredCount.value === 0) return props.type
    if (configuredCount.value === 1) return 'success'
    return 'primary'
  })

  const tooltipContent = computed(() => {
    if (configuredCount.value === 0) {
      return '配置 AI API 密钥'
    }
    if (configuredCount.value === 1) {
      return `已配置: ${configuredProviders.value[0]} - 点击管理`
    }
    return `已配置 ${configuredCount.value} 个 AI 提供商: ${configuredProviders.value.join(', ')} - 点击管理`
  })

  // 方法
  const checkAPIConfig = async () => {
    try {
      // 首先检查数据库中的配置
      const { aiConfigService } = await import('@/services/aiConfig')
      const configuredProviders = await aiConfigService.getConfiguredProviders()

      // 初始化所有提供商为未配置
      const configStatus = {
        openai: false,
        glm: false,
        anthropic: false,
        google: false,
        deepseek: false,
        moonshot: false,
        qwen: false,
        hunyuan: false,
      }

      // 根据数据库中的配置更新状态
      configuredProviders.forEach(provider => {
        const key = provider.toLowerCase()
        if (key in configStatus) {
          configStatus[key] = true
        }
      })

      hasApiKey.value = configStatus
    } catch (error) {
      console.warn('无法从数据库加载API配置，回退到localStorage:', error)

      // 回退到 localStorage 中的配置
      const savedConfigs = localStorage.getItem('ai-api-configs')
      if (savedConfigs) {
        try {
          const configs = JSON.parse(savedConfigs)
          hasApiKey.value = {
            openai: !!configs.openai?.apiKey,
            glm: !!configs.glm?.apiKey,
            anthropic: !!configs.anthropic?.apiKey,
            google: !!configs.google?.apiKey,
            deepseek: !!configs.deepseek?.apiKey,
            moonshot: !!configs.moonshot?.apiKey,
            qwen: !!configs.qwen?.apiKey,
            hunyuan: !!configs.hunyuan?.apiKey,
          }
        } catch (parseError) {
          console.error('检查 API 配置失败:', parseError)
        }
      }
    }
  }

  const openConfig = () => {
    showModal.value = true
  }

  const handleConfigSaved = async () => {
    await checkAPIConfig()
    const count = configuredCount.value
    if (count === 1) {
      ElMessage.success(`已配置 ${configuredProviders.value[0]}`)
    } else if (count > 1) {
      ElMessage.success(`已配置 ${count} 个 AI 提供商`)
    } else {
      ElMessage.success('API 配置已更新')
    }
  }

  // 生命周期
  onMounted(async () => {
    await checkAPIConfig()

    // 监听 storage 变化，以便在其他标签页中同步状态
    window.addEventListener('storage', handleStorageChange)
  })

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'ai-api-configs') {
      checkAPIConfig()
    }
  }

  // 暴露方法
  defineExpose({
    checkAPIConfig,
    hasAnyConfig,
    configuredCount,
    configuredProviders,
  })
</script>

<style lang="scss" scoped>
  .api-config-button {
    display: inline-block;

    .el-button {
      transition: all 0.3s ease;
      border: 2px solid transparent;
      position: relative;

      &.has-config {
        &.multiple-configs {
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: white;

          &:hover {
            background: var(--el-color-primary-dark-2);
            border-color: var(--el-color-primary-dark-2);
          }
        }

        &:not(.multiple-configs) {
          background: var(--el-color-success);
          border-color: var(--el-color-success);
          color: white;

          &:hover {
            background: var(--el-color-success-dark-2);
            border-color: var(--el-color-success-dark-2);
          }
        }
      }

      &:not(.has-config) {
        &:hover {
          transform: scale(1.05);
        }
      }

      .config-count {
        position: absolute;
        top: -5px;
        right: -5px;
        background: var(--el-color-warning);
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 4px;
        border-radius: 8px;
        min-width: 16px;
        text-align: center;
        line-height: 1;
      }
    }
  }

  // 动画效果
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(var(--el-color-primary-rgb), 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(var(--el-color-primary-rgb), 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(var(--el-color-primary-rgb), 0);
    }
  }

  .api-config-button {
    .el-button:not(.has-config) {
      animation: pulse 2s infinite;
    }
  }
</style>
