export interface AIProviderPreset {
  id: string
  name: string
  provider: string
  baseUrl: string
  model: string
  apiKeyUrl: string
  description: string
}

export const aiProviderPresets: AIProviderPreset[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    description: 'OpenAI 官方接口，适合稳定的通用推理与创作。',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    description: 'OpenAI 兼容接口，中文、代码与推理表现均衡。',
  },
  {
    id: 'qwen',
    name: '通义千问',
    provider: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    apiKeyUrl: 'https://bailian.console.aliyun.com/?tab=model#/api-key',
    description: '阿里云百炼 OpenAI 兼容模式，中文场景友好。',
  },
  {
    id: 'moonshot',
    name: 'Moonshot Kimi',
    provider: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
    description: '长文本能力突出，适合复杂食谱和营养分析上下文。',
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    provider: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    apiKeyUrl: 'https://bigmodel.cn/usercenter/proj-mgmt/apikeys',
    description: '智谱开放平台 OpenAI 兼容接口，国内访问便利。',
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    provider: 'openai',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    apiKeyUrl: 'https://cloud.siliconflow.cn/account/ak',
    description: '多模型聚合平台，适合尝试不同开源模型。',
  },
  {
    id: 'custom',
    name: '自定义 OpenAI 协议',
    provider: 'openai',
    baseUrl: '',
    model: '',
    apiKeyUrl: '',
    description: '填写任何兼容 OpenAI Chat Completions 协议的服务。',
  },
]

export const getPresetById = (id: string) =>
  aiProviderPresets.find(preset => preset.id === id) || aiProviderPresets[0]
