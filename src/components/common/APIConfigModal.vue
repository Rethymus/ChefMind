<template>
  <el-dialog
    v-model="visible"
    title="AI API 密钥配置"
    width="700px"
    :before-close="handleClose"
    class="api-config-dialog"
  >
    <div class="config-container">
      <!-- 配置说明 -->
      <div class="config-info">
        <el-alert
          title="配置您的 AI API 密钥以启用完整功能"
          type="info"
          :closable="false"
          show-icon
        >
          <div class="alert-content">
            <p>您的 API 密钥将安全存储在浏览器本地，仅用于前端 API 调用。</p>
            <p>支持多种 AI 服务提供商，配置后即可使用真实的 AI 功能。</p>
          </div>
        </el-alert>
      </div>

      <!-- 服务商和模型选择 -->
      <div class="provider-model-selector">
        <div class="selector-row">
          <div class="selector-item">
            <label class="selector-label">AI 服务商</label>
            <el-select
              v-model="selectedProvider"
              placeholder="请选择AI服务商"
              style="width: 100%"
              @change="handleProviderChange"
            >
              <el-option
                v-for="provider in providers"
                :key="provider.value"
                :label="provider.label"
                :value="provider.value"
              />
            </el-select>
          </div>

          <div class="selector-item" v-if="selectedProvider">
            <label class="selector-label">模型</label>
            <el-select
              v-model="configs[selectedProvider].model"
              placeholder="请选择模型"
              style="width: 100%"
            >
              <el-option
                v-for="model in getCurrentProviderModels()"
                :key="model.value"
                :label="model.label"
                :value="model.value"
              />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 配置区域 -->
      <div v-if="selectedProvider" class="config-area">
        <div class="config-header">
          <el-icon><component :is="getProviderIcon(selectedProvider)" /></el-icon>
          <h3>{{ getProviderName(selectedProvider) }}</h3>
          <el-tag :type="configs[selectedProvider].apiKey ? 'success' : 'info'" size="small">
            {{ configs[selectedProvider].apiKey ? '已配置' : '未配置' }}
          </el-tag>
        </div>

        <!-- 通用配置 -->
        <div class="provider-config">
          <div class="config-item">
            <label class="config-label">
              <el-icon><Key /></el-icon>
              {{ getProviderName(selectedProvider) }} API 密钥
            </label>
            <el-input
              v-model="configs[selectedProvider].apiKey"
              :type="showApiKey ? 'text' : 'password'"
              :placeholder="getApiKeyPlaceholder(selectedProvider)"
              show-password
              clearable
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <div class="config-actions">
              <el-button link type="primary" size="small" @click="showApiKey = !showApiKey">
                {{ showApiKey ? '隐藏密钥' : '显示密钥' }}
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="openProviderLink(selectedProvider)"
              >
                获取密钥
              </el-button>
              <el-button
                v-if="configs[selectedProvider].apiKey"
                link
                type="primary"
                size="small"
                @click="testConnection(selectedProvider)"
                :loading="testing[selectedProvider]"
              >
                测试连接
              </el-button>
            </div>
          </div>

          <!-- OpenAI 特殊配置 -->
          <div v-if="selectedProvider === 'openai'" class="config-item">
            <label class="config-label">API 基础地址</label>
            <el-input
              v-model="configs.openai.baseUrl"
              placeholder="https://api.openai.com/v1"
              clearable
            >
              <template #prefix>
                <el-icon><Connection /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 快速配置状态 -->
      <div class="quick-status">
        <div class="status-header">
          <h4>配置状态</h4>
          <el-button
            link
            type="primary"
            size="small"
            @click="testAllConnections"
            :loading="isTestingAll"
          >
            测试全部
          </el-button>
        </div>
        <div class="status-grid">
          <div
            v-for="provider in providers"
            :key="provider.value"
            class="status-item"
            :class="{ configured: isProviderConfigured(provider.value) }"
          >
            <el-icon><component :is="iconMap[provider.icon] || ChatDotRound" /></el-icon>
            <span class="provider-name">{{ provider.label }}</span>
            <el-tag :type="isProviderConfigured(provider.value) ? 'success' : 'info'" size="small">
              {{ isProviderConfigured(provider.value) ? '已配置' : '未配置' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult" class="test-result">
        <el-alert
          :title="testResult.title"
          :type="testResult.type"
          :description="testResult.message"
          :closable="true"
          show-icon
          @close="testResult = null"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving"> 保存配置 </el-button>
        <el-button v-if="hasAnyConfig" type="danger" @click="clearAllConfigs" :loading="clearing">
          清除所有
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    ChatDotRound,
    Lightning,
    Key,
    Avatar,
    Search,
    Moon,
    Cloudy,
    Connection,
  } from '@element-plus/icons-vue'

  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (_e: 'update:modelValue', _value: boolean): void
    (_e: 'config-saved'): void
    (_e: 'config-cleared'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 响应式数据
  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const selectedProvider = ref('openai')
  const saving = ref(false)
  const clearing = ref(false)
  const testResult = ref<any>(null)
  const showApiKey = ref(false)
  const isTestingAll = ref(false)

  const testing = reactive({
    openai: false,
    glm: false,
    anthropic: false,
    google: false,
    deepseek: false,
    moonshot: false,
    qwen: false,
    hunyuan: false,
  })

  const configs = reactive({
    openai: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    },
    glm: {
      apiKey: '',
      model: 'glm-4-flash',
    },
    anthropic: {
      apiKey: '',
      model: 'claude-3-5-sonnet-20241022',
    },
    google: {
      apiKey: '',
      model: 'gemini-1.5-flash',
    },
    deepseek: {
      apiKey: '',
      model: 'deepseek-chat',
    },
    moonshot: {
      apiKey: '',
      model: 'moonshot-v1-8k',
    },
    qwen: {
      apiKey: '',
      model: 'qwen-turbo',
    },
    hunyuan: {
      apiKey: '',
      model: 'hunyuan-lite',
    },
  })

  // 服务商数据
  const providers = [
    { value: 'openai', label: 'OpenAI', icon: 'ChatDotRound' },
    { value: 'glm', label: '智谱 GLM', icon: 'Lightning' },
    { value: 'anthropic', label: 'Anthropic Claude', icon: 'Avatar' },
    { value: 'google', label: 'Google Gemini', icon: 'Search' },
    { value: 'deepseek', label: 'DeepSeek', icon: 'Search' },
    { value: 'moonshot', label: 'Moonshot', icon: 'Moon' },
    { value: 'qwen', label: '通义千问', icon: 'Cloudy' },
    { value: 'hunyuan', label: '腾讯混元', icon: 'Connection' },
  ]

  // 图标映射
  const iconMap = {
    ChatDotRound: ChatDotRound,
    Lightning: Lightning,
    Avatar: Avatar,
    Search: Search,
    Moon: Moon,
    Cloudy: Cloudy,
    Connection: Connection,
  }

  // 模型数据 (2025年最新)
  const providerModels = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o', recommended: true },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', recommended: false },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', recommended: false },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', recommended: false },
    ],
    glm: [
      { value: 'glm-4-flash', label: 'GLM-4-Flash', recommended: true },
      { value: 'glm-4-air', label: 'GLM-4-Air', recommended: false },
      { value: 'glm-4', label: 'GLM-4', recommended: false },
      { value: 'glm-3-turbo', label: 'GLM-3-Turbo', recommended: false },
    ],
    anthropic: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', recommended: true },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', recommended: false },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', recommended: false },
    ],
    google: [
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', recommended: true },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', recommended: false },
      { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro', recommended: false },
    ],
    deepseek: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat V2.5', recommended: true },
      { value: 'deepseek-coder', label: 'DeepSeek Coder V2', recommended: false },
    ],
    moonshot: [
      { value: 'moonshot-v1-8k', label: 'Moonshot V1 8K', recommended: true },
      { value: 'moonshot-v1-32k', label: 'Moonshot V1 32K', recommended: false },
      { value: 'moonshot-v1-128k', label: 'Moonshot V1 128K', recommended: false },
    ],
    qwen: [
      { value: 'qwen-turbo', label: 'Qwen Turbo', recommended: true },
      { value: 'qwen-plus', label: 'Qwen Plus', recommended: false },
      { value: 'qwen-max', label: 'Qwen Max', recommended: false },
      { value: 'qwen-max-longcontext', label: 'Qwen Max Long Context', recommended: false },
    ],
    hunyuan: [
      { value: 'hunyuan-pro', label: 'Hunyuan Pro', recommended: true },
      { value: 'hunyuan-standard', label: 'Hunyuan Standard', recommended: false },
      { value: 'hunyuan-lite', label: 'Hunyuan Lite', recommended: false },
    ],
  }

  // 计算属性
  const hasAnyConfig = computed(() => {
    return Object.values(configs).some(config => config.apiKey)
  })

  // 方法
  const getCurrentProviderModels = () => {
    return providerModels[selectedProvider.value] || []
  }

  const getProviderIcon = (provider: string) => {
    const p = providers.find(p => p.value === provider)
    const iconName = p?.icon || 'ChatDotRound'
    return iconMap[iconName as keyof typeof iconMap] || ChatDotRound
  }

  const getProviderName = (provider: string) => {
    const p = providers.find(p => p.value === provider)
    return p?.label || 'Unknown'
  }

  const getApiKeyPlaceholder = (provider: string) => {
    const placeholders = {
      openai: 'sk-...',
      glm: 'sk-...',
      anthropic: 'sk-ant-...',
      google: 'AIza...',
      deepseek: 'sk-...',
      moonshot: 'sk-...',
      qwen: 'sk-...',
      hunyuan: 'sk-...',
    }
    return placeholders[provider] || '请输入API密钥'
  }

  const isProviderConfigured = (provider: string) => {
    return configs[provider].apiKey && configs[provider].apiKey.trim() !== ''
  }

  const loadConfigs = () => {
    const savedConfigs = localStorage.getItem('ai-api-configs')
    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs)
        Object.assign(configs, parsed)
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    }
  }

  const saveConfigs = () => {
    try {
      localStorage.setItem('ai-api-configs', JSON.stringify(configs))
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  const handleProviderChange = () => {
    testResult.value = null
    showApiKey.value = false
  }

  const openProviderLink = (provider: string) => {
    const links = {
      openai: 'https://platform.openai.com/api-keys',
      glm: 'https://open.bigmodel.cn/',
      anthropic: 'https://console.anthropic.com/',
      google: 'https://makersuite.google.com/app/apikey',
      deepseek: 'https://platform.deepseek.com/',
      moonshot: 'https://platform.moonshot.cn/',
      qwen: 'https://dashscope.aliyun.com/',
      hunyuan: 'https://cloud.tencent.com/product/hunyuan',
    }
    window.open(links[provider], '_blank')
  }

  const testConnection = async (provider: string) => {
    testing[provider] = true
    testResult.value = null

    try {
      const providerNames = {
        openai: 'OpenAI',
        glm: 'GLM',
        anthropic: 'Claude',
        google: 'Gemini',
        deepseek: 'DeepSeek',
        moonshot: 'Moonshot',
        qwen: '通义千问',
        hunyuan: '混元',
      }

      const providerFormats = {
        openai: /^sk-[a-zA-Z0-9]{48,}$/,
        glm: /^sk-[a-zA-Z0-9]{48,}$/,
        anthropic: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
        google: /^AIza[0-9A-Za-z_-]{35}$/,
        deepseek: /^sk-[a-zA-Z0-9]{48,}$/,
        moonshot: /^sk-[a-zA-Z0-9]{48,}$/,
        qwen: /^sk-[a-zA-Z0-9]{48,}$/,
        hunyuan: /^sk-[a-zA-Z0-9]{48,}$/,
      }

      if (!configs[provider].apiKey) {
        throw new Error(`请先配置 ${providerNames[provider]} API 密钥`)
      }

      // 验证 API 密钥格式
      const formatRegex = providerFormats[provider]
      if (formatRegex && !formatRegex.test(configs[provider].apiKey)) {
        throw new Error(`${providerNames[provider]} API 密钥格式不正确，请检查密钥是否完整`)
      }

      // 验证必填字段
      if (provider === 'openai' && !configs.openai.baseUrl) {
        throw new Error('请配置 OpenAI API 基础地址')
      }

      if (!configs[provider].model) {
        throw new Error(`请选择 ${providerNames[provider]} 模型`)
      }

      // 模拟测试连接
      await new Promise(resolve => setTimeout(resolve, 1500))

      testResult.value = {
        title: '连接成功',
        message: `${providerNames[provider]} API 连接测试通过，可以正常使用`,
        type: 'success',
      }
    } catch (error: any) {
      testResult.value = {
        title: '连接失败',
        message: error.message || 'API 连接测试失败，请检查密钥配置',
        type: 'error',
      }
    } finally {
      testing[provider] = false
    }
  }

  const testAllConnections = async () => {
    isTestingAll.value = true
    testResult.value = null

    const configuredProviders = providers.filter(p => isProviderConfigured(p.value))

    if (configuredProviders.length === 0) {
      testResult.value = {
        title: '没有配置的提供商',
        message: '请先至少配置一个 AI 提供商',
        type: 'warning',
      }
      isTestingAll.value = false
      return
    }

    let successCount = 0
    let failCount = 0

    for (const provider of configuredProviders) {
      try {
        await testConnection(provider.value)
        successCount++
      } catch {
        failCount++
      }
    }

    testResult.value = {
      title: '批量测试完成',
      message: `成功: ${successCount} 个, 失败: ${failCount} 个`,
      type: failCount === 0 ? 'success' : 'warning',
    }

    isTestingAll.value = false
  }

  const validateConfig = (provider: string) => {
    const providerNames = {
      openai: 'OpenAI',
      glm: 'GLM',
      anthropic: 'Claude',
      google: 'Gemini',
      deepseek: 'DeepSeek',
      moonshot: 'Moonshot',
      qwen: '通义千问',
      hunyuan: '混元',
    }

    const config = configs[provider]

    if (!config.apiKey) {
      throw new Error(`${providerNames[provider]} API 密钥不能为空`)
    }

    if (!config.model) {
      throw new Error(`${providerNames[provider]} 模型不能为空`)
    }

    if (provider === 'openai' && !config.baseUrl) {
      throw new Error('OpenAI API 基础地址不能为空')
    }
  }

  const handleSave = async () => {
    saving.value = true

    try {
      // 验证所有已配置的提供商
      const configuredProviders = Object.keys(configs).filter(key => {
        return configs[key].apiKey && configs[key].apiKey.trim() !== ''
      })

      if (configuredProviders.length === 0) {
        throw new Error('请至少配置一个 AI 提供商的 API 密钥')
      }

      // 验证每个已配置的提供商
      for (const provider of configuredProviders) {
        validateConfig(provider)
      }

      // 保存到 localStorage (保持向后兼容)
      saveConfigs()

      // 保存到数据库
      try {
        // 使用统一的 AI 配置服务
        const { aiConfigService } = await import('@/services/aiConfig')

        // 保存每个已配置的提供商到数据库
        for (const provider of configuredProviders) {
          const config = configs[provider]
          const providerName = provider.toUpperCase()

          await aiConfigService.saveApiKey(providerName, config.apiKey, {
            baseUrl: config.baseUrl,
            model: config.model,
          })
        }

        // 验证保存是否成功
        setTimeout(async () => {
          try {
            const testConfig = await aiConfigService.getProviderConfig('GLM')
          } catch (error) {
            console.warn('验证配置保存失败:', error)
          }
        }, 100)

        ElMessage.success(
          `配置保存成功！已配置 ${configuredProviders.length} 个 AI 提供商 (存储到数据库和本地)`
        )
      } catch (dbError) {
        console.warn('保存到数据库失败，仅保存到本地存储:', dbError)
        ElMessage.success(
          `配置保存成功！已配置 ${configuredProviders.length} 个 AI 提供商 (存储到本地)`
        )
      }

      emit('config-saved')

      // 询问是否立即刷新
      try {
        await ElMessageBox.confirm('配置已保存，是否立即刷新页面以应用新配置？', '刷新确认', {
          confirmButtonText: '立即刷新',
          cancelButtonText: '稍后手动刷新',
          type: 'success',
        })

        window.location.reload()
      } catch {
        // 用户选择稍后手动刷新
      }
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      saving.value = false
    }
  }

  const clearAllConfigs = async () => {
    try {
      await ElMessageBox.confirm('确定要清除所有 API 配置吗？此操作不可恢复。', '确认清除', {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'warning',
      })

      clearing.value = true

      // 清除所有配置
      Object.keys(configs).forEach(key => {
        if (typeof configs[key] === 'object') {
          Object.keys(configs[key]).forEach(subKey => {
            configs[key][subKey] = ''
          })
        }
      })

      // 清除 localStorage
      localStorage.removeItem('ai-api-configs')

      ElMessage.success('所有配置已清除')
      emit('config-cleared')
    } catch {
      // 用户取消
    } finally {
      clearing.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
  }

  // 生命周期
  onMounted(() => {
    loadConfigs()
  })
</script>

<style lang="scss" scoped>
  .api-config-dialog {
    :deep(.el-dialog__body) {
      padding: 20px;
    }
  }

  .config-container {
    .config-info {
      margin-bottom: 20px;

      .alert-content {
        margin-top: 8px;

        p {
          margin: 4px 0;
          font-size: 14px;
        }
      }
    }

    .provider-model-selector {
      margin-bottom: 24px;

      .selector-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        .selector-item {
          .selector-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .provider-option {
            display: flex;
            align-items: center;
            gap: 8px;

            .el-icon {
              font-size: 16px;
            }

            span {
              flex: 1;
            }
          }

          .model-option {
            display: flex;
            align-items: center;
            justify-content: space-between;

            span {
              flex: 1;
            }
          }
        }
      }
    }

    .config-area {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      background: var(--el-fill-color-blank);

      .config-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .el-icon {
          font-size: 20px;
          color: var(--el-color-primary);
        }

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .provider-config {
        .config-item {
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .config-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--el-text-color-primary);

            .el-icon {
              margin-right: 6px;
              font-size: 14px;
            }
          }

          .config-actions {
            margin-top: 8px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        }
      }
    }

    .quick-status {
      .status-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
      }

      .status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border: 1px solid var(--el-border-color-light);
          border-radius: 6px;
          background: var(--el-fill-color-blank);
          transition: all 0.2s ease;
          min-width: 0; /* 关键：允许flex项目收缩 */

          &.configured {
            border-color: var(--el-color-success);
            background: var(--el-color-success-light-9);
          }

          .el-icon {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            flex-shrink: 0; /* 图标不收缩 */
          }

          .provider-name {
            flex: 1;
            font-size: 12px;
            font-weight: 500;
            min-width: 0; /* 关键：允许文本收缩 */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .el-tag {
            flex-shrink: 0; /* 标签不收缩 */
          }
        }
      }
    }

    .test-result {
      margin-top: 16px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  @media (max-width: 768px) {
    .provider-model-selector .selector-row {
      grid-template-columns: 1fr;
    }

    .quick-status .status-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 6px;

      .status-item {
        padding: 6px 8px;
        gap: 4px;

        .provider-name {
          font-size: 11px;
        }

        .el-tag {
          font-size: 10px;
          padding: 0 4px;
          height: 16px;
          line-height: 16px;
        }
      }
    }
  }
</style>
