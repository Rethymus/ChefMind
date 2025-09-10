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

  // 首先尝试从AI配置服务获取API密钥
  let apiKey = ''
  let baseURL = 'https://open.bigmodel.cn/api/paas/v4/'
  let model = options.model || 'glm-4'

  try {
    // 使用统一的AI配置服务
    const { aiConfigService } = await import('./aiConfig')
    apiKey = await aiConfigService.getApiKey('GLM') || ''
    
    // 获取完整配置以获取baseURL和model
    const config = await aiConfigService.getProviderConfig('GLM')
    if (config) {
      baseURL = config.baseUrl || baseURL
      model = config.model || model
    }
    
    console.log('从AI配置服务获取到GLM配置:', { 
      hasApiKey: !!apiKey, 
      baseURL, 
      model 
    })
  } catch (error) {
    console.warn('无法从AI配置服务获取GLM配置，回退到环境变量:', error)
    
    // 回退到环境变量
    apiKey = import.meta.env.VITE_GLM_API_KEY || ''
    baseURL = import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/'
    model = options.model || import.meta.env.VITE_GLM_MODEL || 'glm-4'
  }

  // 如果没有 API 密钥，返回模拟响应
  console.log('🔍 检查API密钥:', { 
    apiKey: apiKey ? '已设置' : '未设置', 
    apiKeyLength: apiKey?.length,
    apiKeyValue: apiKey?.substring(0, 10) + '...',
    check1: !apiKey,
    check2: apiKey === 'your_glm_api_key_here'
  })
  
  if (!apiKey || apiKey === 'your_glm_api_key_here') {
    console.log('❌ 未配置 GLM API 密钥，返回模拟响应')
    return mockGLMResponse(prompt)
  }
  
  console.log('✅ API密钥检查通过，准备调用GLM API')

  try {
    // 构建符合GLM API标准的请求体
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      max_tokens: options.maxTokens || 1000,
    }

    console.log('GLM API 请求体:', JSON.stringify(requestBody, null, 2))

    // 发送请求
    const response = await fetch(`${baseURL}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      console.error('GLM API 错误响应:', errorText)
      throw new Error(`GLM API 请求失败: ${response.status} ${errorText}`)
    }

    // 解析响应
    const data = await response.json()
    console.log('GLM API 响应:', data)

    // 检查响应结构
    if (!data.choices?.[0]?.message) {
      console.error('GLM API 响应格式错误:', data)
      throw new Error('GLM API 响应格式不正确')
    }

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
  /**
   * 尝试直接解析JSON
   */
  function tryDirectParse(response: string): T {
    return JSON.parse(response) as T
  }

  /**
   * 清理JSON响应
   */
  function cleanJsonResponse(response: string): string {
    // 移除可能的 markdown 标记
    return response.replace(/```json\s*|\s*```/g, '').trim()
  }

  /**
   * 清理JSON字符串中的单位问题
   */
  function cleanJsonString(jsonStr: string): string {
    try {
      let cleanedJson = jsonStr

      // 第一步：处理不带引号的数字+单位组合: 45g -> "45"
      cleanedJson = cleanedJson.replace(/:\s*(\d+(?:\.\d+)?)([a-zA-Z]+)/g, ': "$1"')

      // 第二步：处理带引号的数字+单位组合: "45g" -> "45"
      cleanedJson = cleanedJson.replace(/"(\d+(?:\.\d+)?)([a-zA-Z]+)"/g, '"$1"')

      return cleanedJson
    } catch (cleanError) {
      console.error('JSON清理失败:', cleanError)
      return jsonStr
    }
  }

  /**
   * 从响应中提取JSON字符串
   */
  function extractJsonFromResponse(cleanResponse: string): string | null {
    const firstBraceIndex = cleanResponse.indexOf('{')
    if (firstBraceIndex === -1) {
      return null
    }

    let braceCount = 0
    let i = firstBraceIndex

    for (; i < cleanResponse.length; i++) {
      if (cleanResponse[i] === '{') braceCount++
      else if (cleanResponse[i] === '}') braceCount--

      if (braceCount === 0) {
        const jsonString = cleanResponse.substring(firstBraceIndex, i + 1)
        return cleanJsonString(jsonString)
      }
    }

    return null
  }

  /**
   * 使用正则表达式提取JSON
   */
  function tryRegexExtraction(cleanResponse: string): T {
    const jsonRegex = /\{[\s\S]*?\}/
    const jsonMatch = jsonRegex.exec(cleanResponse)

    if (!jsonMatch) {
      throw new Error('无法找到有效的JSON格式')
    }

    // 只清理明确的单位问题
    const cleanJson = jsonMatch[0].replace(/"(\d+(?:\.\d+)?)([a-zA-Z]+)"/g, '"$1"')
    return JSON.parse(cleanJson) as T
  }

  /**
   * 尝试高级解析方法
   */
  function tryAdvancedParse(): T {
    console.log('直接解析失败，尝试提取JSON:', response)

    // 清理并提取JSON
    const cleanResponse = cleanJsonResponse(response)
    const extractedJson = extractJsonFromResponse(cleanResponse)

    if (extractedJson) {
      return JSON.parse(extractedJson) as T
    }

    // 如果所有方法都失败，使用正则表达式作为最后尝试
    return tryRegexExtraction(cleanResponse)
  }

  try {
    // 首先尝试直接解析
    return tryDirectParse(response)
  } catch (directError) {
    // 直接解析失败，记录错误并尝试高级解析
    console.log('直接JSON解析失败，尝试高级解析:', directError)

    try {
      return tryAdvancedParse()
    } catch (error) {
      console.error('解析 JSON 响应失败:', error)
      console.error('原始响应:', response)
      throw new Error('解析 AI 响应失败，请稍后重试')
    }
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
  } else if (prompt.includes('营养分析') || (prompt.includes('营养') && prompt.includes('分析'))) {
    return `{
      "nutritionEstimate": {
        "calories": 1850,
        "protein": 85,
        "carbs": 220,
        "fat": 65,
        "fiber": 25,
        "sodium": 2100,
        "calcium": 850,
        "iron": 12,
        "vitaminC": 85,
        "sugar": 45
      },
      "recommendations": [
        "增加深绿色蔬菜摄入，补充叶酸和维生素K",
        "适量摄入富含Omega-3的鱼类，有益心血管健康",
        "建议增加全谷物摄入，提供更多膳食纤维",
        "控制钠盐摄入，建议每日不超过6克",
        "增加水果摄入，补充维生素C和抗氧化物质"
      ],
      "insights": [
        "当前饮食结构基本合理，蛋白质摄入充足",
        "碳水化合物比例适中，有利于维持血糖稳定",
        "脂肪摄入比例合理，但建议优化脂肪酸结构",
        "微量元素摄入良好，钙和铁含量达标"
      ],
      "risks": [
        "钠摄入略高，长期可能增加高血压风险",
        "膳食纤维摄入可能不足，建议增加蔬菜水果",
        "维生素D可能缺乏，建议适当补充或增加日晒"
      ],
      "improvements": [
        "早餐可增加燕麦或全麦面包，提供更多B族维生素",
        "午餐建议增加一份绿叶蔬菜沙拉",
        "晚餐可适当减少主食，增加蛋白质比例",
        "建议每日增加200ml低脂牛奶补充钙质"
      ],
      "confidence": 87
    }`
  } else if (prompt.includes('中医体质') || prompt.includes('体质分析')) {
    return `{
      "primaryConstitution": "平和质",
      "secondaryConstitution": "气虚质",
      "characteristics": [
        "体型匀称，面色红润，精力充沛",
        "睡眠质量良好，消化功能正常",
        "情绪稳定，适应能力强",
        "偶有疲劳感，气短现象"
      ],
      "susceptibleDiseases": [
        "过敏性疾病",
        "呼吸系统疾病", 
        "消化不良",
        "免疫力下降"
      ],
      "dietaryRecommendations": [
        "饮食以温补为主，避免过于寒凉",
        "适量摄入健脾益气的食物如山药、大枣",
        "少食辛辣刺激性食物",
        "规律进餐，细嚼慢咽"
      ],
      "lifestyleAdvice": [
        "保持规律作息，避免熬夜",
        "适度运动，如太极拳、八段锦",
        "保持心情愉悦，避免过度思虑",
        "注意保暖，避免受凉"
      ],
      "seasonalAdjustments": [
        "夏季应注意防暑降温，多饮温开水",
        "适量食用清热解暑的食物如绿豆汤",
        "避免长时间在空调房间，注意通风",
        "夏季运动宜选择清晨或傍晚"
      ],
      "personalizedGuidance": [
        "根据您的健康目标，建议增强脾胃功能",
        "配合适当的中药调理，如四君子汤",
        "定期进行体质监测，调整养生方案",
        "建议咨询专业中医师制定个性化方案"
      ],
      "aiInsights": [
        "您的体质总体良好，但需要注意气血调养",
        "当前饮食习惯符合养生原则",
        "建议保持现有良好生活习惯",
        "适当增加补气食物的摄入"
      ],
      "confidence": 85
    }`
  } else if (
    prompt.includes('营养师') ||
    prompt.includes('营养状况') ||
    prompt.includes('营养分析')
  ) {
    return `{
      "balanceScore": 78,
      "recommendations": [
        "建议增加深绿色蔬菜的摄入，如菠菜、西兰花等，以补充叶酸和维生素K",
        "适当增加优质蛋白质，如鱼类、豆制品，建议每天摄入1.2-1.5g/kg体重",
        "主食应多选择全谷物，如燕麦、糙米，增加膳食纤维摄入",
        "控制钠盐摄入，建议每日不超过6g，多选择新鲜食材",
        "保持规律的三餐时间，避免过度节食或暴饮暴食"
      ],
      "riskAssessments": [
        {
          "level": "low",
          "title": "整体营养风险较低",
          "description": "当前饮食结构基本合理，营养素摄入相对均衡"
        },
        {
          "level": "medium",
          "title": "膳食纤维可能不足",
          "description": "建议增加全谷物和蔬果摄入，达到每日25-30g膳食纤维"
        }
      ],
      "improvementSuggestions": [
        {
          "category": "蛋白质优化",
          "suggestion": "增加植物蛋白比例，豆类、坚果与动物蛋白搭配摄入"
        },
        {
          "category": "微量元素补充",
          "suggestion": "适量摄入海产品补充碘、锌等矿物质"
        },
        {
          "category": "饮食时间调整",
          "suggestion": "晚餐时间提前至19:00前，有利于消化和睡眠质量"
        }
      ]
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
    const ingredientRegex = /"([^"]+)"/
    const ingredientMatch = ingredientRegex.exec(prompt)
    const ingredient = ingredientMatch?.[1] || '未知食材'
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

/**
 * 对话形式的GLM调用（兼容旧接口）
 * @param messages 消息数组
 * @param options 选项
 * @returns 响应文本
 */
export async function chat(
  messages: Array<{ role: string; content: string }>,
  options: GLMCallOptions = {}
): Promise<string> {
  // 将消息数组转换为单个prompt
  const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
  return callGLM(prompt, options)
}

// 默认导出对象
export const glmService = {
  callGLM,
  parseJsonResponse,
  chat,
}
