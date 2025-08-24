<template>
  <div class="ai-provider-settings">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>🤖 AI服务提供商设置</h3>
          <el-tag :type="getProviderTagType(currentProvider)">
            当前: {{ getProviderName(currentProvider) }}
          </el-tag>
        </div>
      </template>

      <div class="provider-options">
        <div class="provider-section">
          <h4>选择AI服务提供商</h4>
          <el-radio-group v-model="selectedProvider" @change="handleProviderChange">
            <el-radio :label="AIProvider.GLM" class="provider-option">
              <div class="provider-info">
                <div class="provider-name">
                  <el-icon><Lightning /></el-icon>
                  智谱 GLM
                </div>
                <div class="provider-desc">国内领先的大语言模型，支持中文优化</div>
              </div>
            </el-radio>
            
            <el-radio :label="AIProvider.OPENAI" class="provider-option">
              <div class="provider-info">
                <div class="provider-name">
                  <el-icon><ChatDotRound /></el-icon>
                  OpenAI GPT
                </div>
                <div class="provider-desc">强大的AI能力，需要API密钥</div>
              </div>
            </el-radio>

            <el-radio :label="AIProvider.BAIDU" class="provider-option" disabled>
              <div class="provider-info">
                <div class="provider-name">
                  <el-icon><Search /></el-icon>
                  百度AI
                </div>
                <div class="provider-desc">即将支持</div>
              </div>
            </el-radio>

            <el-radio :label="AIProvider.TENCENT" class="provider-option" disabled>
              <div class="provider-info">
                <div class="provider-name">
                  <el-icon><CloudFilled /></el-icon>
                  腾讯云AI
                </div>
                <div class="provider-desc">即将支持</div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- GLM配置 -->
        <div v-if="selectedProvider === AIProvider.GLM" class="config-section">
          <h4>智谱 GLM 配置</h4>
          <el-form :model="glmConfig" label-width="120px">
            <el-form-item label="API密钥">
              <el-input
                v-model="glmConfig.apiKey"
                type="password"
                placeholder="请输入智谱 GLM API密钥"
                show-password
              />
            </el-form-item>
            <el-form-item label="API地址">
              <el-input
                v-model="glmConfig.baseURL"
                placeholder="https://open.bigmodel.cn/api/paas/v4/"
              />
            </el-form-item>
            <el-form-item label="模型">
              <el-select v-model="glmConfig.model" placeholder="选择模型">
                <el-option label="GLM-4" value="glm-4" />
                <el-option label="GLM-3-Turbo" value="glm-3-turbo" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大令牌数">
              <el-input-number
                v-model="glmConfig.maxTokens"
                :min="100"
                :max="4000"
                :step="100"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- OpenAI配置 -->
        <div v-if="selectedProvider === AIProvider.OPENAI" class="config-section">
          <h4>OpenAI 配置</h4>
          <el-form :model="openaiConfig" label-width="120px">
            <el-form-item label="API密钥">
              <el-input
                v-model="openaiConfig.apiKey"
                type="password"
                placeholder="请输入OpenAI API密钥"
                show-password
              />
            </el-form-item>
            <el-form-item label="API地址">
              <el-input
                v-model="openaiConfig.baseURL"
                placeholder="https://api.openai.com/v1"
              />
            </el-form-item>
            <el-form-item label="模型">
              <el-select v-model="openaiConfig.model" placeholder="选择模型">
                <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                <el-option label="GPT-4" value="gpt-4" />
                <el-option label="GPT-4 Turbo" value="gpt-4-turbo-preview" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大令牌数">
              <el-input-number
                v-model="openaiConfig.maxTokens"
                :min="100"
                :max="4000"
                :step="100"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 测试连接 -->
        <div class="test-section">
          <el-button
            type="primary"
            @click="testConnection"
            :loading="testing"
            :disabled="!canTest"
          >
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
          
          <div v-if="testResult" class="test-result">
            <el-alert
              :title="testResult.success ? '连接成功' : '连接失败'"
              :type="testResult.success ? 'success' : 'error'"
              :description="testResult.message"
              show-icon
              :closable="false"
            />
          </div>
        </div>

        <!-- 服务状态 -->
        <div class="status-section">
          <h4>服务状态</h4>
          <div class="status-info">
            <div class="status-item">
              <span class="label">初始化状态:</span>
              <el-tag :type="serviceStatus.initialized ? 'success' : 'danger'">
                {{ serviceStatus.initialized ? '已初始化' : '未初始化' }}
              </el-tag>
            </div>
            <div class="status-item">
              <span class="label">缓存大小:</span>
              <span class="value">{{ serviceStatus.cacheSize }} 项</span>
            </div>
            <div class="status-item">
              <span class="label">当前提供商:</span>
              <span class="value">{{ serviceStatus.currentProvider }}</span>
            </div>
          </div>
          
          <el-button @click="clearCache" size="small" type="warning">
            <el-icon><Delete /></el-icon>
            清理缓存
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ChatDotRound, 
  Search, 
  Connection, 
  Delete,
  Lightning
} from '@element-plus/icons-vue'
import { aiService, AIProvider } from '@/services/aiService'
import { AI_CONFIG } from '@/config/aiConfig'

// 响应式数据
const selectedProvider = ref<AIProvider>(AI_CONFIG.defaultProvider as unknown as AIProvider)
const currentProvider = ref<AIProvider>(AI_CONFIG.defaultProvider as unknown as AIProvider)
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

// GLM配置
const glmConfig = reactive({
  apiKey: import.meta.env.VITE_GLM_API_KEY || '',
  baseURL: import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/',
  model: 'glm-4',
  maxTokens: 2000
})

// OpenAI配置
const openaiConfig = reactive({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  maxTokens: 2000
})

// 服务状态
const serviceStatus = ref({
  initialized: false,
  cacheSize: 0,
  currentProvider: ''
})

// 计算属性
const canTest = computed(() => {
  if (selectedProvider.value === AIProvider.OPENAI) return !!openaiConfig.apiKey
  if (selectedProvider.value === AIProvider.GLM) return !!glmConfig.apiKey
  return false
})

// 方法
const getProviderName = (provider: AIProvider): string => {
  const names = {
    [AIProvider.GLM]: '智谱 GLM',
    [AIProvider.OPENAI]: 'OpenAI GPT',
    [AIProvider.BAIDU]: '百度AI',
    [AIProvider.TENCENT]: '腾讯云AI'
  }
  return names[provider] || '未知'
}

const getProviderTagType = (provider: AIProvider): string => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    [AIProvider.GLM]: 'primary',
    [AIProvider.OPENAI]: 'success',
    [AIProvider.BAIDU]: 'warning',
    [AIProvider.TENCENT]: 'warning'
  }
  return types[provider] || 'info'
}

const handleProviderChange = (provider: AIProvider) => {
  try {
    aiService.switchProvider(provider)
    currentProvider.value = provider
    testResult.value = null
    updateServiceStatus()
    ElMessage.success(`已切换到 ${getProviderName(provider)}`)
  } catch (error) {
    ElMessage.error('切换提供商失败')
    selectedProvider.value = currentProvider.value
  }
}

const testConnection = async () => {
  testing.value = true
  testResult.value = null

  try {
    if (selectedProvider.value === AIProvider.GLM) {
      if (!glmConfig.apiKey) {
        throw new Error('请先配置智谱 GLM API密钥')
      }
      
      // 导入测试模块
      const { testGLMAPI } = await import('@/services/testGLMAPI')
      const result = await testGLMAPI()
      
      if (result.success) {
        testResult.value = {
          success: true,
          message: '智谱 GLM 连接测试成功: ' + result.data
        }
      } else {
        throw new Error(result.message)
      }
    } else if (selectedProvider.value === AIProvider.OPENAI) {
      if (!openaiConfig.apiKey) {
        throw new Error('请先配置OpenAI API密钥')
      }
      
      // 测试OpenAI连接 - 使用简单的文本生成测试
      await aiService.generateRecipe(['测试食材'], { difficulty: 'easy', servings: 1 })
      
      testResult.value = {
        success: true,
        message: 'OpenAI连接测试成功'
      }
    } else {
      throw new Error('当前提供商不支持测试')
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || '连接测试失败'
    }
  } finally {
    testing.value = false
  }
}

const clearCache = () => {
  aiService.clearCache()
  updateServiceStatus()
  ElMessage.success('缓存已清理')
}

const updateServiceStatus = () => {
  serviceStatus.value = aiService.getStatus()
}

// 生命周期
onMounted(() => {
  updateServiceStatus()
  
  // 定期更新状态
  setInterval(updateServiceStatus, 5000)
})
</script>

<style scoped lang="scss">
.ai-provider-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .settings-card {
    border-radius: 12px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: 20px;
        font-weight: 600;
      }
    }
  }

  .provider-options {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .provider-section {
    h4 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 600;
    }

    .provider-option {
      display: block;
      width: 100%;
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .provider-info {
        .provider-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .provider-desc {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .config-section {
    padding: 20px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;

    h4 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 600;
    }
  }

  .test-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    .test-result {
      width: 100%;
    }
  }

  .status-section {
    padding: 20px;
    background: var(--el-color-info-light-9);
    border-radius: 8px;
    border-left: 4px solid var(--el-color-info);

    h4 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 600;
    }

    .status-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }

        .value {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .ai-provider-settings {
    padding: 16px;

    .provider-section .provider-option {
      padding: 12px;
    }

    .config-section,
    .status-section {
      padding: 16px;
    }
  }
}
</style>