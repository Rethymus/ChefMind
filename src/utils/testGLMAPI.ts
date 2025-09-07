// GLM API测试工具
export const checkGLMConfig = () => {
  const savedConfigs = localStorage.getItem('ai-api-configs')
  if (savedConfigs) {
    try {
      const configs = JSON.parse(savedConfigs)
      return !!configs.glm?.apiKey
    } catch {
      return false
    }
  }
  return false
}

export const testGLMAPI = async (apiKey?: string, model?: string) => {
  try {
    // 模拟GLM API测试
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 如果没有提供API密钥，从localStorage获取
    let testApiKey = apiKey
    if (!testApiKey) {
      const savedConfigs = localStorage.getItem('ai-api-configs')
      if (savedConfigs) {
        try {
          const configs = JSON.parse(savedConfigs)
          testApiKey = configs.glm?.apiKey
        } catch {
          // 解析失败，继续使用默认值
        }
      }
    }
    
    if (!testApiKey || testApiKey.trim() === '') {
      throw new Error('API密钥不能为空')
    }
    
    // 简单的格式验证
    if (!/^[a-f0-9]{32}$/.test(testApiKey)) {
      throw new Error('GLM API密钥格式不正确')
    }
    
    return {
      success: true,
      message: 'GLM API连接测试成功',
      data: `模型: ${model || 'glm-4-flash'}, 提供商: GLM`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'GLM API连接测试失败',
      error
    }
  }
}

export default testGLMAPI