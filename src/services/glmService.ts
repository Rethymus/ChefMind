/**
 * GLM API 服务
 * 提供与智谱 AI GLM 模型交互的功能
 */

// 调用 GLM API 的选项
interface GLMCallOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  model?: string
}

/**
 * 调用 GLM API
 * @param prompt 提示词
 * @param options 选项
 * @returns 响应文本
 */
export async function callGLM(prompt: string, options: GLMCallOptions = {}): Promise<string> {
  console.log('调用 GLM API:', prompt, options)
  
  // 获取 API 密钥和 URL
  const apiKey = import.meta.env.VITE_GLM_API_KEY || ''
  const baseURL = import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/'
  const model = options.model || import.meta.env.VITE_GLM_MODEL || 'glm-4'
  
  // 如果没有 API 密钥，返回模拟响应
  if (!apiKey || apiKey === 'your_glm_api_key_here') {
    console.log('未配置 GLM API 密钥，返回模拟响应')
    return mockGLMResponse(prompt)
  }
  
  try {
    // 构建请求体
    const requestBody = {
      model: model,
      prompt: prompt,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      max_tokens: options.maxTokens || 1000
    }
    
    // 发送请求
    const response = await fetch(`${baseURL}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GLM API 请求失败: ${response.status} ${errorText}`)
    }
    
    // 解析响应
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('GLM API 调用失败:', error)
    return mockGLMResponse(prompt)
  }
}

/**
 * 解析 JSON 响应
 * @param response API 响应文本
 * @returns 解析后的 JSON 对象
 */
export function parseJsonResponse<T>(response: string): T {
  try {
    // 尝试直接解析
    try {
      return JSON.parse(response) as T
    } catch (e) {
      // 如果直接解析失败，尝试提取 JSON 部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T
      }
      throw e
    }
  } catch (error) {
    console.error('解析 JSON 响应失败:', error)
    console.error('原始响应:', response)
    throw new Error('解析 AI 响应失败，请稍后重试')
  }
}

/**
 * 生成模拟 GLM 响应
 * @param prompt 提示词
 * @returns 模拟响应文本
 */
function mockGLMResponse(prompt: string): string {
  console.log('生成模拟 GLM 响应:', prompt)
  
  // 根据提示词中的关键词生成不同的模拟响应
  if (prompt.includes('食材') && prompt.includes('JSON')) {
    return `{
      "name": "番茄",
      "confidence": 0.95,
      "category": "蔬菜",
      "nutrition": {
        "calories": 18,
        "protein": 0.9,
        "carbs": 3.9,
        "fat": 0.2,
        "fiber": 1.2,
        "vitamins": ["维生素C", "维生素K"]
      },
      "freshness": 0.8,
      "suggestions": ["适合做番茄炒蛋", "可以用来做汤"]
    }`
  } else if (prompt.includes('食谱') && prompt.includes('JSON')) {
    return `{
      "id": "recipe_mock_123",
      "title": "香煎鸡胸肉配蔬菜",
      "description": "这是一道健康美味的鸡胸肉料理，搭配新鲜蔬菜，营养均衡。",
      "ingredients": ["鸡胸肉 300g", "西兰花 100g", "胡萝卜 1根", "洋葱 1/2个", "橄榄油 2勺", "盐 适量", "黑胡椒 适量", "迷迭香 少许"],
      "instructions": [
        "鸡胸肉洗净，切成均匀的厚片，用盐和黑胡椒腌制10分钟。",
        "西兰花、胡萝卜切小块，洋葱切丝。",
        "热锅倒入橄榄油，中火将鸡胸肉煎至两面金黄。",
        "加入蔬菜一起翻炒2-3分钟，撒上迷迭香。",
        "调整口味，装盘即可食用。"
      ],
      "cookingTime": 20,
      "difficulty": "easy",
      "servings": 2,
      "tags": ["鸡肉", "煎", "健康", "低脂"],
      "nutrition": {
        "calories": 280,
        "protein": 35,
        "carbs": 15,
        "fat": 10,
        "fiber": 5,
        "vitamins": ["维生素A", "维生素C"],
        "minerals": ["钙", "铁"],
        "healthScore": 90,
        "dietaryInfo": {
          "isVegetarian": false,
          "isVegan": false,
          "isGlutenFree": true,
          "allergens": []
        },
        "recommendations": ["富含蛋白质", "适合健身人群"]
      }
    }`
  } else if (prompt.includes('营养') && prompt.includes('JSON')) {
    return `{
      "calories": 350,
      "protein": 25,
      "carbs": 45,
      "fat": 12,
      "fiber": 8,
      "vitamins": ["维生素A", "维生素C", "维生素D"],
      "minerals": ["钙", "铁", "锌"],
      "healthScore": 85,
      "dietaryInfo": {
        "isVegetarian": false,
        "isVegan": false,
        "isGlutenFree": true,
        "allergens": []
      },
      "recommendations": ["营养均衡", "适合减脂期食用"]
    }`
  } else if (prompt.includes('判断') && prompt.includes('食材')) {
    const ingredient = prompt.match(/"([^"]+)"/)?.[1] || '未知食材'
    const invalidIngredients = ['洗衣粉', '洗洁精', '肥皂', '洗发水', '沐浴露', '香水']
    const isValid = !invalidIngredients.some(item => ingredient.includes(item))
    
    return `{
      "isValid": ${isValid},
      "reason": "${isValid ? `${ingredient}是常见的可食用食材` : `${ingredient}不是可食用的食材`}"
    }`
  } else {
    return '这是一个模拟的 GLM API 响应。请配置真实的 API 密钥以获取实际响应。'
  }
}