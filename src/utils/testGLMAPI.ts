/**
 * 智普GLM API测试工具
 * 用于验证智普API密钥是否正确配置并能正常工作
 */

import { callGLM } from '@/services/glmService'

/**
 * 测试智普GLM API连接
 * @returns 测试结果对象
 */
export async function testGLMAPI(): Promise<{
  success: boolean
  message: string
  data?: string
  error?: unknown
}> {
  try {
    console.log('开始测试智普GLM API连接...')

    // 获取API密钥
    const apiKey = import.meta.env.VITE_GLM_API_KEY
    if (!apiKey) {
      return {
        success: false,
        message: '未配置智普GLM API密钥，请在.env文件中设置VITE_GLM_API_KEY',
      }
    }

    // 发送一个简单的测试请求
    const response = await callGLM('你好，这是一个测试消息，请回复"API连接成功"', {
      maxTokens: 20, // 限制响应长度，减少token消耗
    })

    console.log('智普GLM API测试成功:', response)
    return {
      success: true,
      message: '连接成功',
      data: response,
    }
  } catch (error: unknown) {
    console.error('智普GLM API测试失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

/**
 * 验证智普GLM API配置
 * @returns 配置状态对象
 */
export function checkGLMConfig(): {
  configured: boolean
  apiKey?: string
  apiUrl?: string
  model?: string
} {
  const apiKey = import.meta.env.VITE_GLM_API_KEY
  const apiUrl = import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4'
  const model = import.meta.env.VITE_GLM_MODEL || 'glm-4'

  return {
    configured: !!apiKey && apiKey !== 'your_glm_api_key_here',
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : undefined, // 只显示部分密钥，保护安全
    apiUrl,
    model,
  }
}

export default {
  testGLMAPI,
  checkGLMConfig,
}
